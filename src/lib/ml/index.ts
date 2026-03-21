// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ML Pipeline — Embeddings, RAG, Medical LLMs, Training Data
// VisioCorp Health Intelligence — powered by Ollama + Supabase pgvector
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Embedding Pipeline
export {
  generateEmbedding,
  generateBatchEmbeddings,
  chunkDocument,
  storeEmbeddings,
  searchKnowledgeBase,
} from "./embeddings";
export type { DocumentChunk, EmbeddingResult } from "./embeddings";

// Ollama Medical LLM Integration
export {
  isOllamaAvailable,
  getAvailableModels,
  suggestICD10Codes,
  predictRejection,
  analyzePMBCondition,
  explainFraudFlag,
} from "./ollama";
export type { MedicalCodingSuggestion, RejectionPrediction } from "./ollama";

// RAG Pipeline
export {
  ragQuery,
  ragClaimsQuery,
  ragComplianceQuery,
  ragSchemeQuery,
} from "./rag";
export type { RAGResponse, RAGOptions } from "./rag";

// Training Data Generator
export {
  generateICD10TrainingData,
  generateRejectionTrainingData,
  generatePMBTrainingData,
  generateFullDataset,
  exportAsJSONL,
} from "./training-data";
export type { TrainingExample, FineTuneDataset } from "./training-data";
