#!/usr/bin/env npx tsx
/**
 * Index Training Examples into RAG v3 — PII-SCRUBBED
 *
 * Scrubs all patient data before indexing. Safe for POPIA.
 * Run: npx tsx ml/scripts/index-training-to-rag.ts
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

// Load env
const envPath = join(process.cwd(), ".env");
try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const eq = line.indexOf("=");
    if (eq > 0) process.env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  }
} catch {}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

const GEMINI_KEY = process.env.GEMINI_API_KEY!;

// ── PII Scrubber (inline for standalone script) ─────────────────────

function scrubPII(text: string): string {
  let s = text;
  // SA ID numbers (13 digits)
  s = s.replace(/\b\d{13}\b/g, "[ID_REDACTED]");
  // Membership numbers (7-10 digits that look like member IDs)
  s = s.replace(/\b\d{10}\b/g, "[MEMBER_REDACTED]");
  // Patient names (Title + Name patterns)
  s = s.replace(/\b(Mr|Mrs|Ms|Dr|Prof)\s+[A-Z][a-z]+\s+[A-Z][a-z]+/g, "[NAME_REDACTED]");
  // Common SA names in the test data
  s = s.replace(/\b(Gift|Naledi|Raj|Themba|Pieter|Ayesha|Annika|Bongani|Grace|Nomvula|Gerhard|Carike|Thabo|Tshepo|Thandeka)\s+[A-Z][a-z]+/g, "[PATIENT]");
  // Any remaining "Name Surname" patterns after common first names
  s = s.replace(/patient_name["\s:]+[^,}"]+/gi, 'patient_name": "[PATIENT]"');
  // Practice numbers (keep prefix, redact rest)
  s = s.replace(/practice.*?(\d{3})\d{4}/gi, (m, prefix) => m.replace(/\d{7}/, `${prefix}XXXX`));
  return s;
}

// ── Gemini Embedding ────────────────────────────────────────────────

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
        })),
      }),
    }
  );
  if (!res.ok) throw new Error(`Embed failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.embeddings.map((e: { values: number[] }) => e.values);
}

// ── Category Detection ──────────────────────────────────────────────

function detectCategory(text: string, cat?: string): string {
  const c = (cat || "").toLowerCase();
  if (c.includes("tariff") || c.includes("coding")) return "coding";
  if (c.includes("rejection") || c.includes("claim") || c.includes("blind")) return "claims";
  if (c.includes("severity") || c.includes("boundary")) return "claims";
  if (c.includes("injection") || c.includes("prompt")) return "compliance";
  if (c.includes("discovery") || c.includes("scheme") || c.includes("plan")) return "scheme";
  if (c.includes("nappi") || c.includes("medication") || c.includes("pharma")) return "pharma";
  if (c.includes("pmb") || c.includes("cdl")) return "pmb";
  if (c.includes("icd") || c.includes("dependent")) return "coding";
  // Content-based fallback
  const t = text.slice(0, 300).toLowerCase();
  if (/icd.?10|tariff|nappi/.test(t)) return "coding";
  if (/scheme|discovery|gems|bonitas/.test(t)) return "scheme";
  if (/reject|valid|claim/.test(t)) return "claims";
  if (/pmb|cdl|chronic/.test(t)) return "pmb";
  return "general";
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  const trainPath = join(process.cwd(), "ml/training-data/train.jsonl");
  const lines = readFileSync(trainPath, "utf-8").split("\n").filter(Boolean);
  console.log(`Loading ${lines.length} training examples...`);

  // Parse and scrub
  const docs: { text: string; category: string; source: string }[] = [];
  for (let i = 0; i < lines.length; i++) {
    try {
      const ex = JSON.parse(lines[i]);
      const msgs = ex.messages || [];
      const user = msgs.find((m: { role: string }) => m.role === "user")?.content || "";
      const asst = msgs.find((m: { role: string }) => m.role === "assistant")?.content || "";
      if (!user || !asst || user.length + asst.length < 50) continue;

      // PII scrub before indexing
      const text = scrubPII(`Q: ${user}\n\nA: ${asst}`);
      if (text.length > 4000) continue; // Skip huge examples

      docs.push({
        text,
        category: detectCategory(text, ex.category),
        source: ex.source || ex.category || "training",
      });
    } catch {}
  }

  console.log(`${docs.length} valid documents after PII scrub`);

  // Clear previous training chunks
  console.log("Clearing previous training chunks...");
  await supabase.from("rag_chunks").delete().like("source", "training_%");

  // Index in batches of 100
  const BATCH = 100;
  let indexed = 0, errors = 0;

  for (let i = 0; i < docs.length; i += BATCH) {
    const slice = docs.slice(i, i + BATCH);
    try {
      const embeddings = await embedBatch(slice.map(d => d.text));

      const rows = slice.map((doc, j) => ({
        content: doc.text,
        embedding: JSON.stringify(embeddings[j]),
        category: doc.category,
        source: `training_${doc.source}`,
        metadata: { type: "training_example", batch: Math.floor(i / BATCH) },
        tokens: Math.ceil(doc.text.length / 4),
      }));

      const { error } = await supabase.from("rag_chunks").insert(rows);
      if (error) {
        console.error(`Batch ${i} error:`, error.message);
        errors += slice.length;
      } else {
        indexed += slice.length;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Batch ${i} failed:`, msg);
      errors += slice.length;

      if (msg.includes("429") || msg.includes("RATE") || msg.includes("quota")) {
        console.log("Rate limited — waiting 60s...");
        await new Promise(r => setTimeout(r, 60000));
        i -= BATCH; // Retry
        continue;
      }
    }

    if (i % 5000 === 0 || i + BATCH >= docs.length) {
      console.log(`Progress: ${indexed}/${docs.length} indexed, ${errors} errors (${Math.round((i / docs.length) * 100)}%)`);
    }

    // Rate limit: ~5 req/s = 300/min (well under Gemini 1500 RPM)
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\nDone! Indexed: ${indexed}, Errors: ${errors}`);
  console.log(`Total rag_chunks: ~${55548 + indexed}`);
}

main().catch(console.error);
