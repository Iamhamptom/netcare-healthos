/**
 * RAG Worker — indexes a single chunk file into Supabase rag_chunks.
 * Usage: CHUNK_FILE=/tmp/rag_chunk_0.jsonl WORKER_ID=0 npx tsx /tmp/rag-worker.ts
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

// Load env
try {
  const envContent = readFileSync(join(process.cwd(), ".env"), "utf-8");
  for (const line of envContent.split("\n")) {
    const eq = line.indexOf("=");
    if (eq > 0) process.env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  }
} catch {}

const CHUNK_FILE = process.env.CHUNK_FILE!;
const WORKER_ID = process.env.WORKER_ID || "0";
const GEMINI_KEY = process.env.GEMINI_API_KEY!;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

function scrubPII(text: string): string {
  let s = text;
  s = s.replace(/\b\d{13}\b/g, "[ID]");
  s = s.replace(/\b\d{10}\b/g, "[MEM]");
  s = s.replace(/\b(Gift|Naledi|Raj|Themba|Pieter|Ayesha|Annika|Bongani|Grace|Nomvula|Gerhard|Carike|Thabo|Tshepo|Thandeka)\s+[A-Z][a-z]+/g, "[PATIENT]");
  s = s.replace(/patient_name["\s:]+[^,}"]+/gi, 'patient_name": "[PATIENT]"');
  return s;
}

function detectCategory(text: string, cat?: string): string {
  const c = (cat || "").toLowerCase();
  if (c.includes("tariff") || c.includes("coding")) return "coding";
  if (c.includes("rejection") || c.includes("claim") || c.includes("blind")) return "claims";
  if (c.includes("scheme") || c.includes("plan")) return "scheme";
  if (c.includes("nappi") || c.includes("pharma")) return "pharma";
  if (c.includes("pmb") || c.includes("cdl")) return "pmb";
  const t = text.slice(0, 300).toLowerCase();
  if (/icd.?10|tariff|nappi/.test(t)) return "coding";
  if (/scheme|discovery|gems/.test(t)) return "scheme";
  if (/reject|valid|claim/.test(t)) return "claims";
  return "general";
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: texts.map(text => ({
          model: "models/gemini-embedding-001",
          content: { parts: [{ text: text.slice(0, 2048) }] },
          taskType: "RETRIEVAL_DOCUMENT",
          outputDimensionality: 1536,
        })),
      }),
    }
  );
  if (!res.ok) throw new Error(`Embed ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.embeddings.map((e: { values: number[] }) => e.values);
}

async function main() {
  const lines = readFileSync(CHUNK_FILE, "utf-8").split("\n").filter(Boolean);
  console.log(`[W${WORKER_ID}] Loading ${lines.length} examples from ${CHUNK_FILE}`);

  const docs: { text: string; category: string; src: string }[] = [];
  for (const line of lines) {
    try {
      const ex = JSON.parse(line);
      const msgs = ex.messages || [];
      const user = msgs.find((m: { role: string }) => m.role === "user")?.content || "";
      const asst = msgs.find((m: { role: string }) => m.role === "assistant")?.content || "";
      if (!user || !asst || user.length + asst.length < 50) continue;
      const text = scrubPII(`Q: ${user}\n\nA: ${asst}`);
      if (text.length > 4000) continue;
      docs.push({ text, category: detectCategory(text, ex.category), src: ex.source || "training" });
    } catch {}
  }

  console.log(`[W${WORKER_ID}] ${docs.length} valid docs`);

  const BATCH = 100;
  let indexed = 0, errors = 0;

  for (let i = 0; i < docs.length; i += BATCH) {
    const slice = docs.slice(i, i + BATCH);
    try {
      const embeddings = await embedBatch(slice.map(d => d.text));
      const rows = slice.map((doc, j) => ({
        doc_id: `train_w${WORKER_ID}`,
        content: doc.text,
        context_prefix: `Training | ${doc.category}`,
        embedding: embeddings[j],
        category: doc.category,
        scheme: null,
        metadata: { type: "training_example", source: doc.src, worker: WORKER_ID },
        tokens: Math.ceil(doc.text.length / 4),
      }));
      const { error } = await supabase.from("rag_chunks").insert(rows);
      if (error) { errors += slice.length; if (i % 2000 === 0) console.error(`[W${WORKER_ID}] ${error.message}`); }
      else indexed += slice.length;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors += slice.length;
      if (msg.includes("429") || msg.includes("quota")) {
        console.log(`[W${WORKER_ID}] Rate limited — waiting 30s`);
        await new Promise(r => setTimeout(r, 30000));
        i -= BATCH;
        continue;
      }
    }
    if (i % 2000 === 0) console.log(`[W${WORKER_ID}] ${indexed}/${docs.length} indexed, ${errors} errors`);
    await new Promise(r => setTimeout(r, 50));
  }

  console.log(`[W${WORKER_ID}] DONE: ${indexed} indexed, ${errors} errors`);
}

main().catch(console.error);
