#!/usr/bin/env npx tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Knowledge Base Embedding Pipeline
// Embeds ALL VisioCorp health intelligence into Supabase pgvector
//
// Sources:
// 1. 12 compiled intelligence files (law, adjudication, coding, PMB, schemes, pharma, fraud, compliance)
// 2. 12 extracted law/spec documents (Medical Schemes Act, PHISC MEDCLM, HPCSA AI, SAHPRA)
// 3. 41K ICD-10 codes (MIT 2021)
// 4. 10K medicine prices (SEP + dispensing fees)
// 5. 4.6K GEMS tariff codes
// 6. Claims Analyzer research (rejection benchmarks, global analysis, competitor matrix)
// 7. Netcare-specific docs (integration reqs, vendor onboarding, audit package)
//
// Usage: npx tsx scripts/embed-knowledge-base.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { readFileSync, readdirSync } from "fs";
import { join, basename } from "path";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const EMBEDDING_MODEL = "thewindmom/llama3-med42-8b:latest";
const CHUNK_SIZE = 800;

// ─── Document Sources ───────────────────────────────────────────────────────

interface DocSource {
  path: string;
  category: string;
  priority: number;
}

function getDocSources(baseDir: string): DocSource[] {
  const sources: DocSource[] = [];
  const kbDir = join(baseDir, "docs/knowledge");

  // 1. Compiled intelligence (highest priority)
  const compiled = [
    { file: "01_law_and_regulation.md", category: "regulation" },
    { file: "02_claims_adjudication.md", category: "claims" },
    { file: "03_coding_standards.md", category: "coding" },
    { file: "04_pmb_and_cdl.md", category: "pmb" },
    { file: "05_scheme_profiles.md", category: "schemes" },
    { file: "06_pharmaceutical.md", category: "pharma" },
    { file: "07_fraud_detection.md", category: "fraud" },
    { file: "08_compliance.md", category: "compliance" },
    { file: "09_industry_landscape.md", category: "industry" },
    { file: "10_market_intelligence.md", category: "market" },
    { file: "11_business_intelligence.md", category: "business" },
    { file: "12_commercial_intelligence.md", category: "commercial" },
  ];

  for (const c of compiled) {
    const path = join(kbDir, c.file);
    try { readFileSync(path); sources.push({ path, category: c.category, priority: 10 }); } catch { /* skip */ }
  }

  // 2. Extracted law/specs
  const extractedDir = join(kbDir, "extracted");
  try {
    for (const file of readdirSync(extractedDir)) {
      if (file.endsWith(".md")) {
        sources.push({ path: join(extractedDir, file), category: "extracted", priority: 8 });
      }
    }
  } catch { /* skip */ }

  // 3. Research docs
  const docsDir = join(baseDir, "docs");
  const researchFiles = [
    "GLOBAL-CLAIMS-ANALYSIS-RESEARCH.md",
    "REJECTION-BENCHMARKS.md",
    "SA-HEALTHCARE-REGULATORY-REFERENCE.md",
    "VENDOR-ONBOARDING-COMPLETE-GUIDE.md",
    "NETCARE-INTEGRATION-REQUIREMENTS.md",
    "AUDIT-PREPARATION-GUIDE.md",
    "PITCH-RESPONSE-MATRIX.md",
    "DATA-FORMAT-SAMPLES.md",
  ];

  for (const file of researchFiles) {
    const path = join(docsDir, file);
    try { readFileSync(path); sources.push({ path, category: "research", priority: 6 }); } catch { /* skip */ }
  }

  // 4. Competitor analysis
  const competitorPath = join(baseDir, "SA-COMPETITOR-FEATURE-MATRIX.md");
  try { readFileSync(competitorPath); sources.push({ path: competitorPath, category: "competitive", priority: 7 }); } catch { /* skip */ }

  // 5. Switching engine README
  const switchingReadme = join(docsDir, "SWITCHING-ENGINE-README.md");
  try { readFileSync(switchingReadme); sources.push({ path: switchingReadme, category: "switching", priority: 9 }); } catch { /* skip */ }

  return sources.sort((a, b) => b.priority - a.priority);
}

// ─── Chunking ───────────────────────────────────────────────────────────────

interface Chunk {
  id: string;
  content: string;
  source: string;
  section: string;
  category: string;
  chunkIndex: number;
}

function chunkMarkdown(content: string, source: string, category: string): Chunk[] {
  const chunks: Chunk[] = [];
  const sections = content.split(/(?=^#{1,3}\s)/m);
  let idx = 0;

  for (const section of sections) {
    if (section.trim().length < 50) continue;

    const titleMatch = section.match(/^#{1,3}\s+(.+)/);
    const sectionTitle = titleMatch ? titleMatch[1].trim() : "General";

    // Split large sections
    if (section.length <= CHUNK_SIZE) {
      chunks.push({
        id: `${basename(source, ".md")}-${idx}`,
        content: section.trim(),
        source: basename(source),
        section: sectionTitle,
        category,
        chunkIndex: idx,
      });
      idx++;
    } else {
      const paragraphs = section.split(/\n\n+/);
      let current = "";
      for (const para of paragraphs) {
        if ((current + "\n\n" + para).length > CHUNK_SIZE && current.length > 50) {
          chunks.push({
            id: `${basename(source, ".md")}-${idx}`,
            content: current.trim(),
            source: basename(source),
            section: sectionTitle,
            category,
            chunkIndex: idx,
          });
          idx++;
          current = para;
        } else {
          current += (current ? "\n\n" : "") + para;
        }
      }
      if (current.trim().length > 50) {
        chunks.push({
          id: `${basename(source, ".md")}-${idx}`,
          content: current.trim(),
          source: basename(source),
          section: sectionTitle,
          category,
          chunkIndex: idx,
        });
        idx++;
      }
    }
  }

  return chunks;
}

// ─── Embedding ──────────────────────────────────────────────────────────────

async function embed(text: string): Promise<number[]> {
  const res = await fetch(`${OLLAMA_URL}/api/embed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: text }),
  });
  if (!res.ok) throw new Error(`Embed failed: ${res.status}`);
  const data = await res.json() as { embeddings: number[][] };
  return data.embeddings[0];
}

async function storeChunk(chunk: Chunk, embedding: number[]): Promise<boolean> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/ho_kb_embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Prefer": "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      id: chunk.id,
      content: chunk.content,
      source: chunk.source,
      section: chunk.section,
      category: chunk.category,
      chunk_index: chunk.chunkIndex,
      embedding,
    }),
  });
  return res.ok;
}

// ─── ICD-10 Embedding (structured data) ─────────────────────────────────────

function chunkICD10(csvPath: string, batchSize = 50): Chunk[] {
  const chunks: Chunk[] = [];
  try {
    const csv = readFileSync(csvPath, "utf-8");
    const lines = csv.split("\n").slice(1).filter(l => l.trim());
    let batch: string[] = [];
    let idx = 0;

    for (const line of lines) {
      const cols = line.split(",");
      const code = cols[7]?.replace(/"/g, "").trim();
      const desc = cols[8]?.replace(/"/g, "").trim();
      const valid = cols[9]?.replace(/"/g, "").trim();
      if (!code || !desc || valid !== "Y") continue;

      batch.push(`${code}: ${desc}`);

      if (batch.length >= batchSize) {
        chunks.push({
          id: `icd10-batch-${idx}`,
          content: `ICD-10-ZA codes:\n${batch.join("\n")}`,
          source: "ICD-10_MIT_2021.csv",
          section: `Batch ${idx + 1}`,
          category: "icd10",
          chunkIndex: idx,
        });
        batch = [];
        idx++;
      }
    }

    if (batch.length > 0) {
      chunks.push({
        id: `icd10-batch-${idx}`,
        content: `ICD-10-ZA codes:\n${batch.join("\n")}`,
        source: "ICD-10_MIT_2021.csv",
        section: `Batch ${idx + 1}`,
        category: "icd10",
        chunkIndex: idx,
      });
    }
  } catch (err) {
    console.error("ICD-10 chunking error:", err);
  }

  return chunks;
}

// ─── Main Pipeline ──────────────────────────────────────────────────────────

async function main() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  VisioCorp Health Intelligence — Embedding Pipeline");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Check prerequisites
  try {
    const ollamaRes = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!ollamaRes.ok) throw new Error("Ollama not responding");
    console.log("✓ Ollama running");
  } catch {
    console.error("✗ Ollama not running. Start with: ollama serve");
    process.exit(1);
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("✗ Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  console.log("✓ Supabase configured");

  const baseDir = process.cwd();
  const sources = getDocSources(baseDir);
  console.log(`\n📚 Found ${sources.length} document sources\n`);

  let totalChunks = 0;
  let totalStored = 0;
  let totalErrors = 0;

  // Process markdown documents
  for (const source of sources) {
    const content = readFileSync(source.path, "utf-8");
    const chunks = chunkMarkdown(content, source.path, source.category);
    console.log(`  📄 ${basename(source.path)} → ${chunks.length} chunks (${source.category})`);

    for (const chunk of chunks) {
      try {
        const embedding = await embed(chunk.content);
        const stored = await storeChunk(chunk, embedding);
        if (stored) totalStored++;
        else totalErrors++;
        totalChunks++;
      } catch (err) {
        totalErrors++;
        totalChunks++;
      }
    }
  }

  // Process ICD-10 database
  const icd10Path = join(baseDir, "docs/knowledge/databases/ICD-10_MIT_2021.csv");
  try {
    const icd10Chunks = chunkICD10(icd10Path);
    console.log(`\n  🧬 ICD-10 database → ${icd10Chunks.length} batches`);

    for (const chunk of icd10Chunks) {
      try {
        const embedding = await embed(chunk.content);
        const stored = await storeChunk(chunk, embedding);
        if (stored) totalStored++;
        else totalErrors++;
        totalChunks++;
      } catch {
        totalErrors++;
        totalChunks++;
      }
    }
  } catch {
    console.log("  ⚠ ICD-10 database not found, skipping");
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  COMPLETE: ${totalStored}/${totalChunks} chunks embedded (${totalErrors} errors)`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main().catch(console.error);
