-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Supabase pgvector setup for Health Intelligence RAG
-- Run this in Supabase SQL Editor
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge base embeddings table
CREATE TABLE IF NOT EXISTS ho_kb_embeddings (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  source TEXT NOT NULL,
  section TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  chunk_index INTEGER NOT NULL DEFAULT 0,
  embedding vector(4096),  -- Qwen3 8B produces 4096-dim embeddings
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast search
CREATE INDEX IF NOT EXISTS idx_kb_embeddings_category ON ho_kb_embeddings(category);
CREATE INDEX IF NOT EXISTS idx_kb_embeddings_source ON ho_kb_embeddings(source);

-- IVFFlat index for vector similarity search (create after loading data)
-- CREATE INDEX IF NOT EXISTS idx_kb_embeddings_vector ON ho_kb_embeddings
--   USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Semantic search function
CREATE OR REPLACE FUNCTION match_kb_documents(
  query_embedding vector(4096),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  filter_category TEXT DEFAULT NULL
)
RETURNS TABLE(
  content TEXT,
  source TEXT,
  section TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.content,
    e.source,
    e.section,
    1 - (e.embedding <=> query_embedding) AS similarity
  FROM ho_kb_embeddings e
  WHERE
    (filter_category IS NULL OR e.category = filter_category)
    AND 1 - (e.embedding <=> query_embedding) > match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Training data storage
CREATE TABLE IF NOT EXISTS ho_training_data (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  instruction TEXT NOT NULL,
  input TEXT NOT NULL,
  output TEXT NOT NULL,
  category TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'generated',
  quality_score FLOAT DEFAULT 0,
  used_in_training BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_data_category ON ho_training_data(category);
CREATE INDEX IF NOT EXISTS idx_training_data_quality ON ho_training_data(quality_score DESC);

-- ML model performance tracking
CREATE TABLE IF NOT EXISTS ho_ml_evaluations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  model_name TEXT NOT NULL,
  task TEXT NOT NULL,  -- icd10_coding, rejection_prediction, pmb_classification
  input_data JSONB NOT NULL,
  predicted_output JSONB NOT NULL,
  actual_output JSONB,  -- NULL until human review
  is_correct BOOLEAN,  -- NULL until human review
  confidence FLOAT,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ml_evaluations_model ON ho_ml_evaluations(model_name);
CREATE INDEX IF NOT EXISTS idx_ml_evaluations_task ON ho_ml_evaluations(task);
CREATE INDEX IF NOT EXISTS idx_ml_evaluations_correct ON ho_ml_evaluations(is_correct);
