/**
 * RAG v3 — Unified Retrieval Pipeline
 * Netcare Health OS
 *
 * Orchestrates: Router → Query Expansion → Embedding → Hybrid Search →
 * Structured Lookup → Reciprocal Rank Fusion → Reranking → Context Assembly
 *
 * Drop-in replacement for rag.ts with backward compatibility.
 */

import type {
  RagChunk,
  RetrievalResult,
  RetrieveOptions,
  QueryType,
  AssembledContext,
} from "./types";
import { classifyQuery, getRetrievalPlan } from "./router";
import { embed } from "./embedder";
import { hybridSearch, keywordOnlySearch, checkIndexStatus } from "./hybrid-retriever";
import { structuredLookup } from "./structured-retriever";
import { rerank } from "./reranker";
import { expandQuery, generateHypotheticalDoc } from "./query-expander";
import { assembleContext } from "./context-assembler";

export type { RagChunk, RetrievalResult, RetrieveOptions, QueryType, AssembledContext };

// Re-export submodules for direct access
export { classifyQuery, getRetrievalPlan } from "./router";
export { embed, embedBatch } from "./embedder";
export { hybridSearch, keywordOnlySearch, checkIndexStatus } from "./hybrid-retriever";
export { structuredLookup } from "./structured-retriever";
export { rerank } from "./reranker";
export { expandQuery, generateHypotheticalDoc } from "./query-expander";
export { assembleContext } from "./context-assembler";
export { indexDocument, reindexAll, buildVectorIndex, getIndexStats } from "./indexer";

/**
 * Main retrieval pipeline. Orchestrates the full RAG v3 flow.
 *
 * Pipeline:
 * 1. Classify query → router
 * 2. If exact_lookup → structuredRetriever (skip vector search)
 * 3. Expand query → queryExpander (RAG Fusion: 3-5 variants)
 * 4. For each variant: embed → hybridSearch (vector + BM25)
 * 5. Merge results with Reciprocal Rank Fusion
 * 6. If structured data needed → also query structuredRetriever
 * 7. Combine structured + semantic results
 * 8. Rerank top-50 → top-5
 * 9. Assemble context with provenance
 * 10. Return
 */
export async function retrieve(
  query: string,
  options?: RetrieveOptions
): Promise<RetrievalResult> {
  const startTime = Date.now();

  // 1. Classify query
  const queryType = classifyQuery(query);
  const plan = getRetrievalPlan(queryType);
  const limit = options?.limit ?? 5;

  // Override plan with user options
  if (options?.hybridWeight) {
    // Will be passed to hybrid search
  }
  if (options?.rerank === false) {
    plan.useRerank = false;
  }

  // 2. Fast path: exact lookup (no vector search needed)
  if (queryType === "exact_lookup") {
    const structured = await structuredLookup(query);

    if (structured.data.length > 0) {
      const assembled = assembleContext([], 4000, structured);
      return {
        chunks: [],
        query,
        queryType,
        totalRetrieved: structured.data.length,
        rerankApplied: false,
        sources: [`structured:${structured.type}`],
        latencyMs: Date.now() - startTime,
      };
    }
    // If no structured results, fall through to semantic search
  }

  // 3. Query expansion (RAG Fusion)
  let queryVariants: string[] = [query];
  if (plan.useQueryExpansion) {
    try {
      queryVariants = await expandQuery(query);
    } catch (err) {
      console.warn("[RAG v3] Query expansion failed:", err);
    }
  }

  // 3b. HyDE (Hypothetical Document Embedding)
  let hydeDoc: string | null = null;
  if (plan.useHyDE) {
    try {
      hydeDoc = await generateHypotheticalDoc(query);
    } catch (err) {
      console.warn("[RAG v3] HyDE generation failed:", err);
    }
  }

  // 4. Embed all query variants (+ HyDE doc if available)
  const textsToEmbed = [...queryVariants];
  if (hydeDoc) textsToEmbed.push(hydeDoc);

  let embeddings: number[][] = [];
  let vectorAvailable = true;

  try {
    // Check if vector index exists
    const status = await checkIndexStatus();
    if (!status.exists || !status.hasEmbeddings) {
      vectorAvailable = false;
      console.warn("[RAG v3] No vector index found, using keyword-only search");
    }

    if (vectorAvailable && (plan.useVector || plan.useKeyword)) {
      const { embedBatch } = await import("./embedder");
      embeddings = await embedBatch(textsToEmbed);
    }
  } catch (err) {
    vectorAvailable = false;
    console.warn("[RAG v3] Embedding failed, falling back to keyword-only:", err);
  }

  // 5. Hybrid search for each variant
  const allChunks: RagChunk[] = [];
  const semanticWeight = options?.hybridWeight?.semantic ?? 0.7;
  const keywordWeight = options?.hybridWeight?.keyword ?? 0.3;

  const searchOptions = {
    category: options?.category ?? (plan.categories?.[0] || undefined),
    scheme: options?.scheme,
    limit: plan.vectorLimit || 20,
    semanticWeight,
    keywordWeight,
  };

  if (vectorAvailable && embeddings.length > 0) {
    // Search with each query variant embedding
    const searchPromises = embeddings.map((embedding, i) =>
      hybridSearch(textsToEmbed[i], embedding, searchOptions)
    );

    const results = await Promise.allSettled(searchPromises);

    for (const result of results) {
      if (result.status === "fulfilled") {
        allChunks.push(...result.value);
      }
    }
  } else {
    // Keyword-only fallback
    for (const variant of queryVariants) {
      try {
        const results = await keywordOnlySearch(variant, {
          category: searchOptions.category,
          scheme: searchOptions.scheme,
          limit: searchOptions.limit,
        });
        allChunks.push(...results);
      } catch {
        // Skip failed variants
      }
    }
  }

  // 5b. Reciprocal Rank Fusion across all variant results
  const fusedChunks = reciprocalRankFusion(allChunks);

  // 6. Structured data lookup (if plan says so or option is set)
  let structuredResult;
  if (plan.useStructured || options?.includeStructured) {
    try {
      structuredResult = await structuredLookup(query);
    } catch (err) {
      console.warn("[RAG v3] Structured lookup failed:", err);
    }
  }

  // 7. Rerank top candidates
  let rankedChunks = fusedChunks.slice(0, 50); // Take top 50 for reranking
  let rerankApplied = false;

  if (plan.useRerank && rankedChunks.length > limit) {
    try {
      rankedChunks = await rerank(query, rankedChunks, limit);
      rerankApplied = true;
    } catch (err) {
      console.warn("[RAG v3] Reranking failed, using fusion scores:", err);
      rankedChunks = rankedChunks.slice(0, limit);
    }
  } else {
    rankedChunks = rankedChunks.slice(0, limit);
  }

  // 8. Assemble context
  const assembled = assembleContext(rankedChunks, 4000, structuredResult);

  // 9. Collect sources
  const sources = [...assembled.sources];
  if (structuredResult?.type && structuredResult.type !== "none") {
    sources.push(`structured:${structuredResult.type}`);
  }

  return {
    chunks: rankedChunks,
    query,
    queryType,
    totalRetrieved: fusedChunks.length,
    rerankApplied,
    sources: Array.from(new Set(sources)),
    latencyMs: Date.now() - startTime,
  };
}

/**
 * Backward-compatible wrapper matching the RAG v2 API.
 * Drop-in replacement for `import { retrieveWithMetrics } from "@/lib/rag"`.
 */
export async function retrieveWithMetrics(
  query: string
): Promise<{ context: string; sources: Record<string, string[]> }> {
  try {
    const result = await retrieve(query, {
      rerank: true,
      includeStructured: true,
      limit: 8,
    });

    const assembled = assembleContext(result.chunks, 4000);

    // Format sources in v2 format
    const sources: Record<string, string[]> = { exact: [], rag: [] };

    for (const source of result.sources) {
      if (source.startsWith("structured:")) {
        sources.exact.push(source.replace("structured:", ""));
      } else {
        sources.rag.push(source);
      }
    }

    return {
      context: assembled.text || "(No relevant context found)",
      sources,
    };
  } catch (err) {
    console.error("[RAG v3] retrieveWithMetrics failed, falling back to v2:", err);

    // Fall back to v2 if v3 completely fails
    try {
      const { retrieve: v2Retrieve } = await import("../rag");
      return v2Retrieve(query);
    } catch {
      return {
        context: "(RAG retrieval unavailable)",
        sources: { exact: [], rag: [] },
      };
    }
  }
}

// ── Reciprocal Rank Fusion ────────────────────────────────────────

const RRF_K = 60; // Standard RRF constant

/**
 * Merge results from multiple retrieval passes using Reciprocal Rank Fusion.
 * RRF score = sum(1 / (k + rank_i)) across all result lists.
 */
function reciprocalRankFusion(allChunks: RagChunk[]): RagChunk[] {
  // Group chunks by their unique content
  const chunkMap = new Map<string, { chunk: RagChunk; ranks: number[] }>();

  // Build rank lists per variant (chunks come in order per variant)
  let currentRank = 0;
  const seen = new Set<string>();

  for (const chunk of allChunks) {
    const key = `${chunk.docId}_${chunk.content.slice(0, 80)}`;

    if (!chunkMap.has(key)) {
      chunkMap.set(key, { chunk, ranks: [] });
    }

    // Track the rank (position in results)
    if (!seen.has(key)) {
      chunkMap.get(key)!.ranks.push(currentRank);
      seen.add(key);
    }

    currentRank++;
  }

  // Calculate RRF scores
  const scored: { chunk: RagChunk; rrfScore: number }[] = [];

  chunkMap.forEach(({ chunk, ranks }) => {
    const rrfScore = ranks.reduce((sum, rank) => sum + 1 / (RRF_K + rank), 0);

    scored.push({
      chunk: {
        ...chunk,
        combinedScore: rrfScore,
      },
      rrfScore,
    });
  });

  // Sort by RRF score descending
  scored.sort((a, b) => b.rrfScore - a.rrfScore);

  return scored.map((s) => s.chunk);
}
