-- RAG v3 Migration: Vector table + hybrid search
-- Netcare Health OS — 2026-03-24
-- Uses pgvector for semantic search + tsvector for BM25 keyword search

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create rag_chunks table
CREATE TABLE IF NOT EXISTS rag_chunks (
  id          BIGSERIAL PRIMARY KEY,
  doc_id      TEXT NOT NULL,
  content     TEXT NOT NULL,
  context_prefix TEXT,                          -- contextual prefix for improved retrieval
  embedding   vector(1536),                     -- text-embedding-3-small / text-embedding-004
  metadata    JSONB NOT NULL DEFAULT '{}',      -- { source, filename, category, priority, section }
  category    TEXT NOT NULL DEFAULT 'general',  -- law, claims, coding, pmb, scheme, pharma, fraud, compliance, clinical, general
  scheme      TEXT,                             -- Discovery, GEMS, Bonitas, Momentum, etc.
  tokens      INTEGER NOT NULL DEFAULT 0,       -- token count for budget management
  fts         TSVECTOR,                         -- full-text search vector (auto-generated)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Auto-generate tsvector from content + context_prefix
CREATE OR REPLACE FUNCTION rag_chunks_fts_trigger() RETURNS trigger AS $$
BEGIN
  NEW.fts := to_tsvector('english', COALESCE(NEW.context_prefix, '') || ' ' || NEW.content);
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rag_chunks_fts_update
  BEFORE INSERT OR UPDATE OF content, context_prefix ON rag_chunks
  FOR EACH ROW EXECUTE FUNCTION rag_chunks_fts_trigger();

-- 4. Indexes
-- IVFFlat index for approximate nearest neighbor (vector cosine distance)
-- NOTE: IVFFlat requires data to exist before creating. We create with low nlists initially.
-- For 69K chunks, nlists=100 is appropriate. Rebuild after bulk insert if needed.
-- We use a conditional approach: create index only if table has data, otherwise create later.
CREATE INDEX IF NOT EXISTS idx_rag_chunks_category ON rag_chunks (category);
CREATE INDEX IF NOT EXISTS idx_rag_chunks_scheme ON rag_chunks (scheme) WHERE scheme IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rag_chunks_doc_id ON rag_chunks (doc_id);
CREATE INDEX IF NOT EXISTS idx_rag_chunks_fts ON rag_chunks USING GIN (fts);
CREATE INDEX IF NOT EXISTS idx_rag_chunks_metadata ON rag_chunks USING GIN (metadata);

-- IVFFlat vector index — created as a separate function to call after bulk insert
-- (IVFFlat needs training data; creating on empty table gives poor results)
CREATE OR REPLACE FUNCTION create_vector_index() RETURNS void AS $$
BEGIN
  -- Drop old index if exists
  DROP INDEX IF EXISTS idx_rag_chunks_embedding;
  -- Create IVFFlat with nlists based on row count
  -- Rule of thumb: nlists = sqrt(n_rows), min 10
  EXECUTE format(
    'CREATE INDEX idx_rag_chunks_embedding ON rag_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = %s)',
    GREATEST(10, FLOOR(SQRT((SELECT COUNT(*) FROM rag_chunks))))::int
  );
END;
$$ LANGUAGE plpgsql;

-- 5. Hybrid search function
-- Combines vector cosine similarity with BM25-style ts_rank
-- Returns ranked results with both scores for downstream reranking
CREATE OR REPLACE FUNCTION hybrid_search(
  query_embedding vector(1536),
  query_text TEXT,
  match_category TEXT DEFAULT NULL,
  match_scheme TEXT DEFAULT NULL,
  match_limit INT DEFAULT 20,
  semantic_weight FLOAT DEFAULT 0.7,
  keyword_weight FLOAT DEFAULT 0.3
)
RETURNS TABLE (
  id BIGINT,
  doc_id TEXT,
  content TEXT,
  context_prefix TEXT,
  metadata JSONB,
  category TEXT,
  scheme TEXT,
  tokens INT,
  semantic_score FLOAT,
  keyword_score FLOAT,
  combined_score FLOAT
)
LANGUAGE plpgsql
AS $$
DECLARE
  ts_query TSQUERY;
BEGIN
  -- Build tsquery from plain text (handles multi-word queries)
  ts_query := plainto_tsquery('english', query_text);

  RETURN QUERY
  WITH semantic AS (
    SELECT
      rc.id,
      -- Cosine similarity: 1 - cosine_distance (higher = more similar)
      1 - (rc.embedding <=> query_embedding) AS score
    FROM rag_chunks rc
    WHERE
      rc.embedding IS NOT NULL
      AND (match_category IS NULL OR rc.category = match_category)
      AND (match_scheme IS NULL OR rc.scheme = match_scheme)
    ORDER BY rc.embedding <=> query_embedding
    LIMIT match_limit * 3  -- over-fetch for merging
  ),
  keyword AS (
    SELECT
      rc.id,
      ts_rank_cd(rc.fts, ts_query, 32) AS score  -- 32 = normalization by rank / (rank + 1)
    FROM rag_chunks rc
    WHERE
      rc.fts @@ ts_query
      AND (match_category IS NULL OR rc.category = match_category)
      AND (match_scheme IS NULL OR rc.scheme = match_scheme)
    ORDER BY ts_rank_cd(rc.fts, ts_query, 32) DESC
    LIMIT match_limit * 3
  ),
  -- Normalize scores to 0-1 range within each result set
  semantic_norm AS (
    SELECT
      s.id,
      CASE
        WHEN MAX(s.score) OVER () = MIN(s.score) OVER () THEN 0.5
        ELSE (s.score - MIN(s.score) OVER ()) / NULLIF(MAX(s.score) OVER () - MIN(s.score) OVER (), 0)
      END AS score
    FROM semantic s
  ),
  keyword_norm AS (
    SELECT
      k.id,
      CASE
        WHEN MAX(k.score) OVER () = MIN(k.score) OVER () THEN 0.5
        ELSE (k.score - MIN(k.score) OVER ()) / NULLIF(MAX(k.score) OVER () - MIN(k.score) OVER (), 0)
      END AS score
    FROM keyword k
  ),
  -- Merge: union all IDs, combine scores
  merged AS (
    SELECT
      COALESCE(sn.id, kn.id) AS chunk_id,
      COALESCE(sn.score, 0.0) AS sem_score,
      COALESCE(kn.score, 0.0) AS kw_score,
      (semantic_weight * COALESCE(sn.score, 0.0) + keyword_weight * COALESCE(kn.score, 0.0)) AS combined
    FROM semantic_norm sn
    FULL OUTER JOIN keyword_norm kn ON sn.id = kn.id
  )
  SELECT
    rc.id,
    rc.doc_id,
    rc.content,
    rc.context_prefix,
    rc.metadata,
    rc.category,
    rc.scheme,
    rc.tokens,
    m.sem_score::FLOAT AS semantic_score,
    m.kw_score::FLOAT AS keyword_score,
    m.combined::FLOAT AS combined_score
  FROM merged m
  JOIN rag_chunks rc ON rc.id = m.chunk_id
  ORDER BY m.combined DESC
  LIMIT match_limit;
END;
$$;

-- 6. Keyword-only search fallback (when vector search is unavailable)
CREATE OR REPLACE FUNCTION keyword_search(
  query_text TEXT,
  match_category TEXT DEFAULT NULL,
  match_scheme TEXT DEFAULT NULL,
  match_limit INT DEFAULT 20
)
RETURNS TABLE (
  id BIGINT,
  doc_id TEXT,
  content TEXT,
  context_prefix TEXT,
  metadata JSONB,
  category TEXT,
  scheme TEXT,
  tokens INT,
  keyword_score FLOAT
)
LANGUAGE plpgsql
AS $$
DECLARE
  ts_query TSQUERY;
BEGIN
  ts_query := plainto_tsquery('english', query_text);

  RETURN QUERY
  SELECT
    rc.id,
    rc.doc_id,
    rc.content,
    rc.context_prefix,
    rc.metadata,
    rc.category,
    rc.scheme,
    rc.tokens,
    ts_rank_cd(rc.fts, ts_query, 32)::FLOAT AS keyword_score
  FROM rag_chunks rc
  WHERE
    rc.fts @@ ts_query
    AND (match_category IS NULL OR rc.category = match_category)
    AND (match_scheme IS NULL OR rc.scheme = match_scheme)
  ORDER BY ts_rank_cd(rc.fts, ts_query, 32) DESC
  LIMIT match_limit;
END;
$$;

-- 7. Helper: upsert chunk (for incremental indexing)
CREATE OR REPLACE FUNCTION upsert_rag_chunk(
  p_doc_id TEXT,
  p_content TEXT,
  p_context_prefix TEXT,
  p_embedding vector(1536),
  p_metadata JSONB,
  p_category TEXT,
  p_scheme TEXT,
  p_tokens INT
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
  result_id BIGINT;
BEGIN
  INSERT INTO rag_chunks (doc_id, content, context_prefix, embedding, metadata, category, scheme, tokens)
  VALUES (p_doc_id, p_content, p_context_prefix, p_embedding, p_metadata, p_category, p_scheme, p_tokens)
  ON CONFLICT (id) DO NOTHING
  RETURNING id INTO result_id;

  RETURN result_id;
END;
$$;

COMMENT ON TABLE rag_chunks IS 'RAG v3 knowledge chunks with vector embeddings and full-text search for hybrid retrieval';
COMMENT ON FUNCTION hybrid_search IS 'Combines vector cosine similarity with BM25 text ranking using configurable weights';
COMMENT ON FUNCTION keyword_search IS 'Fallback keyword-only search when vector embeddings are unavailable';
