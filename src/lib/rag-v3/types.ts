/**
 * RAG v3 Types — Netcare Health OS
 * Core type definitions for hybrid retrieval pipeline
 */

export interface RagChunk {
  id: number;
  docId: string;
  content: string;
  contextPrefix?: string;
  metadata: {
    source: string;
    filename: string;
    category: string;
    priority: number;
    section?: string;
  };
  category: string;
  scheme?: string;
  tokens: number;
  semanticScore?: number;
  keywordScore?: number;
  combinedScore?: number;
  rerankScore?: number;
}

export interface RetrievalResult {
  chunks: RagChunk[];
  query: string;
  queryType: QueryType;
  totalRetrieved: number;
  rerankApplied: boolean;
  sources: string[];
  latencyMs: number;
}

export type QueryType =
  | "exact_lookup"
  | "code_search"
  | "scheme_rule"
  | "regulation"
  | "multi_hop"
  | "analytical"
  | "clinical"
  | "general";

export interface RetrieveOptions {
  category?: string;
  scheme?: string;
  limit?: number;
  rerank?: boolean;
  includeStructured?: boolean;
  hybridWeight?: { semantic: number; keyword: number };
}

export interface RetrievalPlan {
  useVector: boolean;
  useKeyword: boolean;
  useStructured: boolean;
  useQueryExpansion: boolean;
  useHyDE: boolean;
  useRerank: boolean;
  vectorLimit: number;
  keywordLimit: number;
  categories?: string[];
}

export interface StructuredResult {
  type: "icd10" | "tariff" | "nappi" | "facility" | "code_pair" | "none";
  data: Record<string, unknown>[];
  formatted: string;
  confidence: number;
}

export interface AssembledContext {
  text: string;
  tokenCount: number;
  sources: string[];
  chunkIds: number[];
  structuredData?: string;
}

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  tokens: number;
}
