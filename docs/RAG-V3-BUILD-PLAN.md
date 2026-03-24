# RAG v3 Build Plan — Healthcare Claims Intelligence Engine

## Current State (what exists)

```
src/lib/rag.ts (556 lines)
├── Exact lookup: ICD-10 (41K), tariffs (3.9K), medicines (16.9K), rejections, CDL
├── Keyword search: TF-IDF over 69K document chunks (documents.jsonl)
├── Query decomposition: Splits complex queries into sub-queries
├── Feedback loop: Logs interactions, learns from corrections
├── NO vector search — uses keyword matching only
├── NO embeddings at query time — embeddings exist as .npy files but aren't used in retrieval
├── NO reranking
├── NO hybrid search
└── Loads from flat files on disk (excluded from Vercel bundle — partially broken in production)

src/lib/ml/embeddings.ts
├── Uses Ollama local model (llama3-med42-8b) — only works locally
├── 4096-dim embeddings
├── NOT integrated with rag.ts
└── Stores in Supabase pgvector (schema exists but not used in production)

ml/rag-index/
├── documents.jsonl (69,123 documents, 38MB)
├── embeddings-v2.npy (42MB) — numpy embeddings, not used at runtime
├── visiocorp-v2.faiss (42MB) — FAISS index, not used at runtime
└── metadata.json, summary.json, feedback.jsonl
```

**Problems with current RAG:**
1. No actual vector search — just keyword TF-IDF
2. Embeddings exist but aren't used in production retrieval
3. Files excluded from Vercel bundle (outputFileTracingExcludes)
4. Ollama embedding model only works locally
5. No reranking
6. No hybrid search
7. No contextual chunking
8. 69K docs are flat chunks without context prefixes

---

## Target State (RAG v3)

```
src/lib/rag-v3/
├── index.ts                    — Unified entry point, backward compatible
├── router.ts                   — Query classifier + routing (structured vs semantic vs hybrid)
├── structured-retriever.ts     — SQL queries against NAPPI/ICD-10/tariffs/facilities
├── semantic-retriever.ts       — pgvector search for knowledge base documents
├── keyword-retriever.ts        — BM25/tsvector search (Supabase native)
├── hybrid-retriever.ts         — Combines semantic + keyword with RRF
├── reranker.ts                 — Cohere Rerank 4 or LLM-based reranking
├── context-assembler.ts        — Deduplicates, orders, enforces token limits
├── verifier.ts                 — Post-generation faithfulness check
├── embedder.ts                 — Voyage-3-large or OpenAI embeddings (API-based, no local model)
├── indexer.ts                  — Re-index pipeline with contextual chunking
└── evaluator.ts                — RAGAS metrics integration
```

---

## Build Phases

### Phase 1: Foundation — pgvector + Hybrid Search (Week 1-2)

**Goal:** Replace flat-file keyword search with proper pgvector + BM25 hybrid search in Supabase.

**Files to create/modify:**

1. **Supabase migration: `supabase/migrations/xxx_rag_v3_tables.sql`**
```sql
-- Knowledge base chunks with embeddings
CREATE TABLE rag_chunks (
  id SERIAL PRIMARY KEY,
  doc_id TEXT NOT NULL,                    -- Source document identifier
  content TEXT NOT NULL,                    -- The chunk text
  context_prefix TEXT,                      -- Contextual prefix (Anthropic method)
  content_with_context TEXT,                -- context_prefix + content (what gets embedded)
  embedding vector(1536),                   -- Voyage-3-large or OpenAI embedding
  metadata JSONB DEFAULT '{}',              -- source, filename, category, priority, section
  category TEXT,                            -- icd10, tariff, scheme_rule, regulation, etc.
  scheme TEXT,                              -- If scheme-specific, which scheme
  tokens INTEGER,                           -- Token count for budget management
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BM25 full-text search column
ALTER TABLE rag_chunks ADD COLUMN fts tsvector
  GENERATED ALWAYS AS (to_tsvector('english', content)) STORED;

-- Indexes
CREATE INDEX ON rag_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX ON rag_chunks USING GIN (fts);
CREATE INDEX ON rag_chunks (category);
CREATE INDEX ON rag_chunks (scheme);
CREATE INDEX ON rag_chunks (doc_id);

-- Hybrid search function
CREATE OR REPLACE FUNCTION hybrid_search(
  query_text TEXT,
  query_embedding vector(1536),
  match_count INT DEFAULT 20,
  keyword_weight FLOAT DEFAULT 0.3,
  semantic_weight FLOAT DEFAULT 0.7,
  filter_category TEXT DEFAULT NULL,
  filter_scheme TEXT DEFAULT NULL
)
RETURNS TABLE (
  id INT,
  content TEXT,
  context_prefix TEXT,
  metadata JSONB,
  semantic_score FLOAT,
  keyword_score FLOAT,
  combined_score FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  WITH semantic AS (
    SELECT rc.id, rc.content, rc.context_prefix, rc.metadata,
           1 - (rc.embedding <=> query_embedding) AS score
    FROM rag_chunks rc
    WHERE (filter_category IS NULL OR rc.category = filter_category)
      AND (filter_scheme IS NULL OR rc.scheme = filter_scheme)
    ORDER BY rc.embedding <=> query_embedding
    LIMIT match_count * 2
  ),
  keyword AS (
    SELECT rc.id, ts_rank(rc.fts, websearch_to_tsquery('english', query_text)) AS score
    FROM rag_chunks rc
    WHERE rc.fts @@ websearch_to_tsquery('english', query_text)
      AND (filter_category IS NULL OR rc.category = filter_category)
      AND (filter_scheme IS NULL OR rc.scheme = filter_scheme)
    ORDER BY score DESC
    LIMIT match_count * 2
  )
  SELECT
    COALESCE(s.id, k.id) AS id,
    s.content, s.context_prefix, s.metadata,
    COALESCE(s.score, 0) AS semantic_score,
    COALESCE(k.score, 0) AS keyword_score,
    (semantic_weight * COALESCE(s.score, 0) + keyword_weight * COALESCE(k.score, 0)) AS combined_score
  FROM semantic s
  FULL OUTER JOIN keyword k ON s.id = k.id
  ORDER BY combined_score DESC
  LIMIT match_count;
END;
$$;
```

2. **`src/lib/rag-v3/embedder.ts`**
```typescript
// Embedding via Voyage-3-large API (or OpenAI fallback)
// No local model needed — works on Vercel
export async function embed(text: string): Promise<number[]>
export async function embedBatch(texts: string[]): Promise<number[][]>
```

3. **`src/lib/rag-v3/hybrid-retriever.ts`**
```typescript
// Calls Supabase hybrid_search RPC function
// Returns chunks ranked by combined semantic + keyword score
export async function hybridSearch(
  query: string,
  options?: { category?: string; scheme?: string; limit?: number }
): Promise<RankedChunk[]>
```

4. **`src/lib/rag-v3/structured-retriever.ts`**
```typescript
// SQL queries against structured tables
// NAPPI → Prisma NappiMedicine
// ICD-10 → in-memory (existing icd10-database.ts)
// Tariffs → existing tariff-database.ts
// Facilities → existing facility-database.ts
// Code-pairs → existing code-pair-violations.ts
export async function structuredLookup(
  query: string,
  entityType: "nappi" | "icd10" | "tariff" | "facility" | "codepair" | "scheme"
): Promise<StructuredResult>
```

---

### Phase 2: Contextual Re-indexing (Week 3)

**Goal:** Re-chunk and re-embed all 69K documents with contextual prefixes.

**The Anthropic Contextual Retrieval method:**

For each chunk, before embedding, prepend a context sentence:

```
BEFORE: "Pre-authorization is required for all MRI and CT scans."

AFTER: "[Discovery Health Medical Scheme, Section 4.3: Radiology Pre-Authorization Requirements, 2026 Benefit Year] Pre-authorization is required for all MRI and CT scans."
```

**Files to create:**

5. **`src/lib/rag-v3/indexer.ts`**
```typescript
// Pipeline:
// 1. Load documents.jsonl (69K docs)
// 2. For each doc, determine source context (which file, which section, which scheme)
// 3. Generate contextual prefix using LLM:
//    "Summarize in 1 sentence what document/section this chunk belongs to"
//    (or deterministic: extract from metadata)
// 4. Prepend context to chunk text
// 5. Embed the context+chunk together
// 6. Store in Supabase rag_chunks table
//
// Batch processing: 100 chunks at a time, ~500 per minute with Voyage API
// Total: 69K chunks × ~$0.001/embed = ~$69 total embedding cost

export async function reindexAll(): Promise<IndexingResult>
export async function reindexDocument(docId: string): Promise<void>
export async function getIndexingStatus(): Promise<IndexStatus>
```

6. **`scripts/reindex-rag-v3.ts`**
```typescript
// CLI script to run full re-indexing
// npx tsx scripts/reindex-rag-v3.ts
// Progress bar, resumable, logs to stdout
```

---

### Phase 3: Reranking (Week 4)

**Goal:** Add Cohere Rerank 4 as second pass on retrieved chunks.

7. **`src/lib/rag-v3/reranker.ts`**
```typescript
// Retrieve top-50 from hybrid search
// Rerank with Cohere Rerank 4 Pro (or FlashRank fallback)
// Return top-5 with relevance scores

export async function rerankChunks(
  query: string,
  chunks: RankedChunk[],
  topK?: number
): Promise<RerankedChunk[]>

// Fallback: LLM-based reranking if Cohere unavailable
async function llmRerank(query: string, chunks: RankedChunk[]): Promise<RerankedChunk[]>
```

**Environment variable:** `COHERE_API_KEY` on Vercel

---

### Phase 4: Query Router (Week 5)

**Goal:** Classify queries and route to optimal retrieval strategy.

8. **`src/lib/rag-v3/router.ts`**
```typescript
type QueryType =
  | "exact_lookup"      // "What is NAPPI 0703118?" → SQL
  | "code_search"       // "What's the code for diabetes?" → ICD-10 search
  | "scheme_rule"       // "Does Discovery cover MRI?" → Vector search filtered by scheme
  | "regulation"        // "What does the Medical Schemes Act say about..." → Vector search
  | "multi_hop"         // "Can a GP prescribe X for Y under Z scheme?" → Agent with multiple tools
  | "analytical"        // "What are the top rejection reasons?" → SQL aggregation
  | "clinical"          // "Is this claim appropriate?" → Vector + structured hybrid

// Classifier: lightweight LLM call or pattern matching
export function classifyQuery(query: string): QueryType
export function getRetrievalStrategy(queryType: QueryType): RetrievalStrategy
```

---

### Phase 5: Context Assembly + Verification (Week 6)

9. **`src/lib/rag-v3/context-assembler.ts`**
```typescript
// Assembles the final context from multiple retrieval sources
// Deduplicates overlapping chunks
// Orders by relevance score
// Enforces token budget (8K for context, leaving room for generation)
// Adds provenance metadata (source, section, page) for citations

export function assembleContext(
  results: RetrievalResult[],
  maxTokens?: number
): AssembledContext
```

10. **`src/lib/rag-v3/verifier.ts`**
```typescript
// Post-generation verification
// Checks every factual claim in the response against retrieved context
// Flags unsupported claims
// Validates cited codes against structured databases

export async function verifyResponse(
  response: string,
  context: AssembledContext
): Promise<VerificationResult>
```

---

### Phase 6: Evaluation Pipeline (Week 7-8)

11. **`src/lib/rag-v3/evaluator.ts`**
```typescript
// RAGAS-style automated evaluation
// Metrics: faithfulness, answer relevance, context precision, context recall
// Custom healthcare metrics: code accuracy, rule citation accuracy

export async function evaluateRAG(
  testCases: TestCase[]
): Promise<EvaluationReport>
```

12. **`scripts/evaluate-rag-v3.ts`**
```typescript
// CLI: npx tsx scripts/evaluate-rag-v3.ts
// Loads golden test set (200+ cases)
// Runs each through RAG pipeline
// Scores and reports
```

13. **`tests/rag-v3/golden-test-set.json`**
```json
// 200+ test cases:
// { "query": "...", "expected_answer": "...", "required_sources": [...], "category": "..." }
```

---

### Phase 7: Integration (Week 8)

14. **`src/lib/rag-v3/index.ts`**
```typescript
// Unified entry point — backward compatible with existing imports
// import { retrieve, retrieveWithMetrics } from "@/lib/rag-v3"

export async function retrieve(query: string, options?: RetrieveOptions): Promise<RetrievalResult>
export async function retrieveWithMetrics(query: string): Promise<MetricResult>

// The main pipeline:
// 1. Classify query → router.ts
// 2. Route to appropriate retriever(s) → structured/semantic/hybrid
// 3. Rerank results → reranker.ts
// 4. Assemble context → context-assembler.ts
// 5. Return with provenance metadata
```

15. **Update consumers:**
- `src/app/api/claims/chat/route.ts` — Use rag-v3 instead of rag.ts
- `src/app/api/rag/route.ts` — Use rag-v3
- `src/app/api/claims/validate/route.ts` — Use rag-v3 for motivation analysis context

---

## Technology Choices (Verified March 2026)

| Component | Choice | Cost | Why |
|-----------|--------|------|-----|
| **Embedding** | Voyage-3-large API | ~$0.35/M tokens | 14% better than OpenAI, 200x less storage with binary |
| | Fallback: OpenAI text-embedding-3-small | $0.02/M tokens | Cheapest, good enough |
| **Vector Store** | Supabase pgvector | Included in plan | Already have Supabase, 69K chunks is trivial scale |
| **BM25** | Supabase tsvector (native) | $0 | Built into Postgres |
| **Reranker** | Cohere Rerank 4 Pro | ~$2/1K searches | Highest ELO, 10-15% accuracy boost |
| | Fallback: FlashRank (open source) | $0 | Self-hosted, good performance |
| **Orchestration** | Vercel AI SDK | $0 | Already using it |
| **Evaluation** | RAGAS via Python script | $0 | Standard, LLM-judged metrics |

**Total incremental cost:** ~$10-50/month at moderate usage (embedding API + reranking API)

---

## Migration Plan

### No Breaking Changes

- `src/lib/rag.ts` stays as-is initially (backward compat)
- New code goes in `src/lib/rag-v3/`
- Consumers switch to rag-v3 imports one at a time
- Old rag.ts becomes a thin wrapper that delegates to rag-v3

### Data Migration

1. Run `scripts/reindex-rag-v3.ts` to load 69K docs into Supabase with embeddings
2. Keep documents.jsonl as source of truth
3. Supabase becomes the runtime query layer
4. ml/rag-index/*.npy and *.faiss files become redundant (can keep for backup)

---

## Expected Results

| Metric | Current (rag.ts) | Target (rag-v3) | Method |
|--------|------------------|-----------------|--------|
| Retrieval accuracy | ~45% (keyword TF-IDF) | 85-90% | Hybrid + contextual + reranking |
| Latency (p50) | ~100ms (file read) | ~200ms (pgvector + rerank) | Slight increase, big accuracy gain |
| Latency (p99) | ~500ms | ~1.5s (with reranking) | Reranking adds ~500ms |
| Faithfulness | Unknown | >95% (verified) | Post-generation verification |
| Works on Vercel | Partially (files excluded) | 100% | Supabase is external, always reachable |
| Hallucination rate | High (no verification) | <5% | Verification + citation enforcement |
