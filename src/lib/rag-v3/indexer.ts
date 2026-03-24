/**
 * RAG v3 Indexer — Netcare Health OS
 * Loads documents from documents.jsonl, chunks them, generates embeddings,
 * and inserts into Supabase rag_chunks table.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { embedBatch } from "./embedder";
import { semanticChunk } from "../rag"; // Reuse existing chunking from v2

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("[RAG v3 Indexer] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  _supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  return _supabase;
}

interface RawDocument {
  id: string;
  text: string;
  metadata: {
    source: string;
    filename: string;
    category: string;
    priority: number;
    section?: string;
  };
}

interface IndexResult {
  total: number;
  indexed: number;
  errors: number;
  skipped: number;
  chunks: number;
}

// ── Category detection from metadata ──────────────────────────────

const CATEGORY_MAP: Record<string, string> = {
  "01_law": "law",
  "02_claims": "claims",
  "03_coding": "coding",
  "04_pmb": "pmb",
  "05_scheme": "scheme",
  "06_pharma": "pharma",
  "07_fraud": "fraud",
  "08_compliance": "compliance",
  "09_industry": "general",
  "10_market": "general",
  "11_business": "general",
  "12_commercial": "general",
  law: "law",
  claims: "claims",
  coding: "coding",
  pmb: "pmb",
  cdl: "pmb",
  scheme: "scheme",
  pharma: "pharma",
  pharmaceutical: "pharma",
  fraud: "fraud",
  compliance: "compliance",
  clinical: "clinical",
  regulation: "law",
  learned_correction: "general",
};

function detectCategory(doc: RawDocument): string {
  const cat = doc.metadata.category?.toLowerCase() || "";
  const filename = doc.metadata.filename?.toLowerCase() || "";

  // Check direct match
  if (CATEGORY_MAP[cat]) return CATEGORY_MAP[cat];

  // Check filename prefix
  for (const [prefix, category] of Object.entries(CATEGORY_MAP)) {
    if (filename.startsWith(prefix)) return category;
  }

  // Content-based detection
  const textLower = doc.text.slice(0, 500).toLowerCase();
  if (/medical schemes act|section\s+\d+|regulation/i.test(textLower)) return "law";
  if (/icd.?10|tariff|ccsa|nappi|coding/i.test(textLower)) return "coding";
  if (/pmb|chronic disease|cdl|dtp/i.test(textLower)) return "pmb";
  if (/discovery|gems|bonitas|momentum/i.test(textLower)) return "scheme";
  if (/reject|adjudicat|claim/i.test(textLower)) return "claims";
  if (/nappi|medicine|dispensing|formulary/i.test(textLower)) return "pharma";
  if (/fraud|waste|abuse/i.test(textLower)) return "fraud";
  if (/popia|sahpra|hpcsa|compliance/i.test(textLower)) return "compliance";

  return "general";
}

// ── Scheme detection ──────────────────────────────────────────────

function detectScheme(text: string): string | null {
  const schemes = [
    { pattern: /\bdiscovery\b/i, name: "Discovery" },
    { pattern: /\bgems\b/i, name: "GEMS" },
    { pattern: /\bbonitas\b/i, name: "Bonitas" },
    { pattern: /\bmomentum\b/i, name: "Momentum" },
    { pattern: /\bmedshield\b/i, name: "Medshield" },
    { pattern: /\bbestmed\b/i, name: "Bestmed" },
    { pattern: /\bmedihelp\b/i, name: "Medihelp" },
  ];

  // Only assign scheme if it's mentioned prominently (in first 500 chars)
  const prefix = text.slice(0, 500);
  for (const { pattern, name } of schemes) {
    if (pattern.test(prefix)) return name;
  }

  return null;
}

// ── Context prefix generation (deterministic, no LLM) ─────────────

function generateContextPrefix(doc: RawDocument, chunkIndex: number, totalChunks: number): string {
  const parts: string[] = [];

  // Source file
  if (doc.metadata.filename) {
    parts.push(`Source: ${doc.metadata.filename}`);
  }

  // Category
  const category = detectCategory(doc);
  parts.push(`Category: ${category}`);

  // Section if available
  if (doc.metadata.section) {
    parts.push(`Section: ${doc.metadata.section}`);
  }

  // Chunk position
  if (totalChunks > 1) {
    parts.push(`Part ${chunkIndex + 1}/${totalChunks}`);
  }

  return parts.join(" | ");
}

// ── Token estimation ──────────────────────────────────────────────

function estimateTokens(text: string): number {
  // Rough approximation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

// ── Public API ────────────────────────────────────────────────────

/**
 * Index a single document: chunk it, embed chunks, insert into Supabase.
 */
export async function indexDocument(doc: RawDocument): Promise<{ chunks: number; errors: number }> {
  const supabase = getSupabase();

  // Chunk the document
  const chunks = semanticChunk(doc.text, 800);
  if (chunks.length === 0) {
    return { chunks: 0, errors: 0 };
  }

  const category = detectCategory(doc);
  const scheme = detectScheme(doc.text);
  let errors = 0;

  // Generate context prefixes
  const prefixes = chunks.map((_, i) => generateContextPrefix(doc, i, chunks.length));

  // Embed all chunks (prepend context prefix to embedding input for better retrieval)
  const textsToEmbed = chunks.map((chunk, i) => `${prefixes[i]}\n${chunk}`);

  let embeddings: number[][];
  try {
    embeddings = await embedBatch(textsToEmbed);
  } catch (err) {
    console.error(`[RAG v3 Indexer] Embedding failed for doc ${doc.id}:`, err);
    // Insert without embeddings (keyword search still works)
    embeddings = chunks.map(() => []);
  }

  // Batch insert into Supabase
  const rows = chunks.map((chunk, i) => ({
    doc_id: `${doc.id}_${i}`,
    content: chunk,
    context_prefix: prefixes[i],
    embedding: embeddings[i].length > 0 ? `[${embeddings[i].join(",")}]` : null,
    metadata: {
      source: doc.metadata.source,
      filename: doc.metadata.filename,
      category: doc.metadata.category,
      priority: doc.metadata.priority,
      section: doc.metadata.section,
    },
    category,
    scheme,
    tokens: estimateTokens(chunk),
  }));

  // Insert in sub-batches of 50
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { error } = await supabase.from("rag_chunks").insert(batch);

    if (error) {
      console.error(`[RAG v3 Indexer] Insert error for doc ${doc.id} batch ${i}:`, error.message);
      errors += batch.length;
    }
  }

  return { chunks: chunks.length, errors };
}

/**
 * Reindex all documents from a JSONL file.
 * Clears existing chunks and re-inserts everything.
 *
 * @param documentsPath Path to documents.jsonl (default: ml/rag-index/documents.jsonl)
 * @param options Configuration options
 */
export async function reindexAll(
  documentsPath?: string,
  options?: {
    batchSize?: number;
    clearExisting?: boolean;
    skipEmbeddings?: boolean;
    onProgress?: (indexed: number, total: number) => void;
  }
): Promise<IndexResult> {
  const fs = await import("fs");
  const path = await import("path");

  const filePath =
    documentsPath || path.join(process.cwd(), "ml/rag-index/documents.jsonl");

  if (!fs.existsSync(filePath)) {
    throw new Error(`[RAG v3 Indexer] Documents file not found: ${filePath}`);
  }

  const supabase = getSupabase();
  const batchSize = options?.batchSize ?? 100;
  const clearExisting = options?.clearExisting ?? true;

  // Read all documents
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n").filter((l) => l.trim());

  const docs: RawDocument[] = [];
  for (const line of lines) {
    try {
      const doc = JSON.parse(line) as RawDocument;
      if (doc.id && doc.text) {
        docs.push(doc);
      }
    } catch {
      // Skip malformed lines
    }
  }

  console.log(`[RAG v3 Indexer] Found ${docs.length} documents to index`);

  const result: IndexResult = {
    total: docs.length,
    indexed: 0,
    errors: 0,
    skipped: 0,
    chunks: 0,
  };

  // Clear existing data if requested
  if (clearExisting) {
    console.log("[RAG v3 Indexer] Clearing existing chunks...");
    const { error } = await supabase.from("rag_chunks").delete().neq("id", 0);
    if (error) {
      console.error("[RAG v3 Indexer] Clear error:", error.message);
    }
  }

  // Process in batches
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = docs.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(docs.length / batchSize);

    console.log(
      `[RAG v3 Indexer] Processing batch ${batchNum}/${totalBatches} (docs ${i + 1}-${Math.min(i + batchSize, docs.length)})`
    );

    // Chunk all docs in this batch
    const allChunks: {
      doc: RawDocument;
      chunk: string;
      prefix: string;
      chunkIndex: number;
      totalChunks: number;
    }[] = [];

    for (const doc of batch) {
      if (!doc.text || doc.text.length < 50) {
        result.skipped++;
        continue;
      }

      const chunks = semanticChunk(doc.text, 800);
      for (let ci = 0; ci < chunks.length; ci++) {
        allChunks.push({
          doc,
          chunk: chunks[ci],
          prefix: generateContextPrefix(doc, ci, chunks.length),
          chunkIndex: ci,
          totalChunks: chunks.length,
        });
      }
    }

    // Embed all chunks in this batch
    let embeddings: number[][] = [];
    if (!options?.skipEmbeddings) {
      const textsToEmbed = allChunks.map((c) => `${c.prefix}\n${c.chunk}`);
      try {
        embeddings = await embedBatch(textsToEmbed, 50);
      } catch (err) {
        console.warn(
          `[RAG v3 Indexer] Batch ${batchNum} embedding failed, inserting without vectors:`,
          err
        );
        embeddings = allChunks.map(() => []);
      }
    }

    // Build rows for insertion
    const rows = allChunks.map((c, idx) => {
      const emb = embeddings[idx];
      return {
        doc_id: `${c.doc.id}_${c.chunkIndex}`,
        content: c.chunk,
        context_prefix: c.prefix,
        embedding: emb && emb.length > 0 ? `[${emb.join(",")}]` : null,
        metadata: {
          source: c.doc.metadata?.source || "documents.jsonl",
          filename: c.doc.metadata?.filename || c.doc.id,
          category: c.doc.metadata?.category || "general",
          priority: c.doc.metadata?.priority || 5,
          section: c.doc.metadata?.section,
        },
        category: detectCategory(c.doc),
        scheme: detectScheme(c.chunk),
        tokens: estimateTokens(c.chunk),
      };
    });

    // Insert in sub-batches of 200
    for (let j = 0; j < rows.length; j += 200) {
      const subBatch = rows.slice(j, j + 200);
      const { error } = await supabase.from("rag_chunks").insert(subBatch);

      if (error) {
        console.error(
          `[RAG v3 Indexer] Insert error batch ${batchNum} sub ${j}:`,
          error.message
        );
        result.errors += subBatch.length;
      } else {
        result.chunks += subBatch.length;
      }
    }

    result.indexed += batch.length - (batch.length === batchSize ? 0 : result.skipped);

    // Progress callback
    if (options?.onProgress) {
      options.onProgress(Math.min(i + batchSize, docs.length), docs.length);
    }

    // Small delay between batches to avoid rate limits
    if (i + batchSize < docs.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  result.indexed = result.total - result.skipped - result.errors;

  console.log(
    `[RAG v3 Indexer] Complete: ${result.indexed} docs indexed, ${result.chunks} chunks, ${result.errors} errors, ${result.skipped} skipped`
  );

  return result;
}

/**
 * Build the IVFFlat vector index after bulk insert.
 * Must be called after reindexAll for optimal vector search performance.
 */
export async function buildVectorIndex(): Promise<void> {
  const supabase = getSupabase();

  console.log("[RAG v3 Indexer] Building IVFFlat vector index...");

  const { error } = await supabase.rpc("create_vector_index");

  if (error) {
    console.error("[RAG v3 Indexer] Vector index creation failed:", error.message);
    throw error;
  }

  console.log("[RAG v3 Indexer] Vector index built successfully");
}

/**
 * Get indexing statistics.
 */
export async function getIndexStats(): Promise<{
  totalChunks: number;
  withEmbeddings: number;
  categories: Record<string, number>;
  avgTokens: number;
}> {
  const supabase = getSupabase();

  const { count: totalChunks } = await supabase
    .from("rag_chunks")
    .select("*", { count: "exact", head: true });

  const { count: withEmbeddings } = await supabase
    .from("rag_chunks")
    .select("*", { count: "exact", head: true })
    .not("embedding", "is", null);

  // Get category counts
  const { data: catData } = await supabase
    .from("rag_chunks")
    .select("category")
    .limit(100000);

  const categories: Record<string, number> = {};
  for (const row of catData || []) {
    categories[row.category] = (categories[row.category] || 0) + 1;
  }

  // Get average tokens
  const { data: tokenData } = await supabase
    .from("rag_chunks")
    .select("tokens")
    .limit(1000);

  const avgTokens =
    tokenData && tokenData.length > 0
      ? tokenData.reduce((sum, r) => sum + r.tokens, 0) / tokenData.length
      : 0;

  return {
    totalChunks: totalChunks ?? 0,
    withEmbeddings: withEmbeddings ?? 0,
    categories,
    avgTokens: Math.round(avgTokens),
  };
}
