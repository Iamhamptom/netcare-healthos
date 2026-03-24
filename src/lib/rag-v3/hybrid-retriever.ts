/**
 * RAG v3 Hybrid Retriever — Netcare Health OS
 * Calls Supabase hybrid_search RPC (vector + BM25) with graceful fallback
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { RagChunk } from "./types";

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("[RAG v3] Missing SUPABASE_URL or SUPABASE_KEY env vars");
  }

  _supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  return _supabase;
}

interface HybridSearchOptions {
  category?: string;
  scheme?: string;
  limit?: number;
  semanticWeight?: number;
  keywordWeight?: number;
}

interface HybridSearchRow {
  id: number;
  doc_id: string;
  content: string;
  context_prefix: string | null;
  metadata: Record<string, unknown>;
  category: string;
  scheme: string | null;
  tokens: number;
  semantic_score: number;
  keyword_score: number;
  combined_score: number;
}

interface KeywordSearchRow {
  id: number;
  doc_id: string;
  content: string;
  context_prefix: string | null;
  metadata: Record<string, unknown>;
  category: string;
  scheme: string | null;
  tokens: number;
  keyword_score: number;
}

/**
 * Run hybrid search combining vector cosine similarity and BM25 keyword ranking.
 * Falls back to keyword-only search if vector search fails (e.g., no embeddings indexed yet).
 */
export async function hybridSearch(
  query: string,
  queryEmbedding: number[],
  options?: HybridSearchOptions
): Promise<RagChunk[]> {
  const supabase = getSupabase();
  const limit = options?.limit ?? 20;
  const semanticWeight = options?.semanticWeight ?? 0.7;
  const keywordWeight = options?.keywordWeight ?? 0.3;

  try {
    // Try hybrid search first (vector + keyword)
    const { data, error } = await supabase.rpc("hybrid_search", {
      query_embedding: `[${queryEmbedding.join(",")}]`,
      query_text: query,
      match_category: options?.category ?? null,
      match_scheme: options?.scheme ?? null,
      match_limit: limit,
      semantic_weight: semanticWeight,
      keyword_weight: keywordWeight,
    });

    if (error) {
      console.warn("[RAG v3 Hybrid] RPC error, falling back to keyword search:", error.message);
      return keywordOnlySearch(query, options);
    }

    if (!data || data.length === 0) {
      // No results from hybrid — try keyword only (maybe no embeddings indexed)
      return keywordOnlySearch(query, options);
    }

    return (data as HybridSearchRow[]).map(rowToChunk);
  } catch (err) {
    console.warn("[RAG v3 Hybrid] Exception, falling back to keyword search:", err);
    return keywordOnlySearch(query, options);
  }
}

/**
 * Keyword-only search fallback. Uses PostgreSQL full-text search (BM25-style ts_rank).
 * Works without any vector embeddings.
 */
export async function keywordOnlySearch(
  query: string,
  options?: Pick<HybridSearchOptions, "category" | "scheme" | "limit">
): Promise<RagChunk[]> {
  const supabase = getSupabase();
  const limit = options?.limit ?? 20;

  try {
    const { data, error } = await supabase.rpc("keyword_search", {
      query_text: query,
      match_category: options?.category ?? null,
      match_scheme: options?.scheme ?? null,
      match_limit: limit,
    });

    if (error) {
      console.warn("[RAG v3 Keyword] RPC error:", error.message);
      return [];
    }

    return (data as KeywordSearchRow[] || []).map((row) => ({
      id: row.id,
      docId: row.doc_id,
      content: row.content,
      contextPrefix: row.context_prefix ?? undefined,
      metadata: {
        source: (row.metadata as Record<string, string>).source ?? "",
        filename: (row.metadata as Record<string, string>).filename ?? "",
        category: (row.metadata as Record<string, string>).category ?? row.category,
        priority: Number((row.metadata as Record<string, number>).priority) || 0,
        section: (row.metadata as Record<string, string>).section,
      },
      category: row.category,
      scheme: row.scheme ?? undefined,
      tokens: row.tokens,
      semanticScore: 0,
      keywordScore: row.keyword_score,
      combinedScore: row.keyword_score,
    }));
  } catch (err) {
    console.warn("[RAG v3 Keyword] Exception:", err);
    return [];
  }
}

/**
 * Direct similarity search (vector only, no keyword component).
 * Useful for finding semantically similar chunks.
 */
export async function vectorSearch(
  queryEmbedding: number[],
  options?: Pick<HybridSearchOptions, "category" | "scheme" | "limit">
): Promise<RagChunk[]> {
  const supabase = getSupabase();
  const limit = options?.limit ?? 20;

  try {
    let queryBuilder = supabase
      .from("rag_chunks")
      .select("*")
      .not("embedding", "is", null)
      .limit(limit);

    if (options?.category) {
      queryBuilder = queryBuilder.eq("category", options.category);
    }
    if (options?.scheme) {
      queryBuilder = queryBuilder.eq("scheme", options.scheme);
    }

    // Use the order_by_vector RPC or raw SQL via rpc
    // Since Supabase JS doesn't natively support vector ordering,
    // we use a simpler approach: hybrid_search with keyword_weight=0
    return hybridSearch("", queryEmbedding, {
      ...options,
      semanticWeight: 1.0,
      keywordWeight: 0.0,
    });
  } catch (err) {
    console.warn("[RAG v3 Vector] Exception:", err);
    return [];
  }
}

/**
 * Check if the rag_chunks table exists and has data.
 * Useful for determining if indexing has been run.
 */
export async function checkIndexStatus(): Promise<{
  exists: boolean;
  count: number;
  hasEmbeddings: boolean;
}> {
  const supabase = getSupabase();

  try {
    const { count, error } = await supabase
      .from("rag_chunks")
      .select("*", { count: "exact", head: true });

    if (error) {
      return { exists: false, count: 0, hasEmbeddings: false };
    }

    // Check if any have embeddings
    const { count: embCount } = await supabase
      .from("rag_chunks")
      .select("*", { count: "exact", head: true })
      .not("embedding", "is", null);

    return {
      exists: true,
      count: count ?? 0,
      hasEmbeddings: (embCount ?? 0) > 0,
    };
  } catch {
    return { exists: false, count: 0, hasEmbeddings: false };
  }
}

// ── Helpers ───────────────────────────────────────────────────────

function rowToChunk(row: HybridSearchRow): RagChunk {
  const meta = row.metadata as Record<string, unknown>;
  return {
    id: row.id,
    docId: row.doc_id,
    content: row.content,
    contextPrefix: row.context_prefix ?? undefined,
    metadata: {
      source: String(meta.source ?? ""),
      filename: String(meta.filename ?? ""),
      category: String(meta.category ?? row.category),
      priority: Number(meta.priority) || 0,
      section: meta.section ? String(meta.section) : undefined,
    },
    category: row.category,
    scheme: row.scheme ?? undefined,
    tokens: row.tokens,
    semanticScore: row.semantic_score,
    keywordScore: row.keyword_score,
    combinedScore: row.combined_score,
  };
}
