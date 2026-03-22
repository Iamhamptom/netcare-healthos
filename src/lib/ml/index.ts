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

// Reinforcement Learning Loop
export {
  recordClaimOutcome,
  analyzePatterns,
  generateLearningExamples,
  getLearningMetrics,
  runLearningCycle,
  resetLearning,
} from "./reinforcement";
export type { LearningEvent, LearningEventType, LearningMetrics } from "./reinforcement";

// System-Wide Learning Hooks (connects ALL health products)
export {
  recordHealthEvent,
  notifyKBUpdate,
  getPendingReembeds,
  clearPendingReembeds,
  getTrainingSignals,
  getSystemPatterns,
  getProductEvents,
  getSystemLearningHealth,
} from "./system-hooks";
export type {} from "./system-hooks";

// Comprehensive Training Data Generator (ALL domains)
export {
  generateComprehensiveDataset,
  exportComprehensiveJSONL,
  generateAllICD10Examples,
  generateRejectionExamples,
  generateCDLExamples,
  generatePMBExamples,
  generateTariffExamples,
  generateMedicineExamples,
  generateSchemeExamples,
  generateFHIRExamples,
  generateFraudExamples,
  generateClinicalExamples,
  generateComplianceExamples,
  generateAdjudicationExamples,
  generateWorkflowExamples,
} from "./training-data-comprehensive";

// PII Scrubber (POPIA 2026 compliance)
export {
  scrubPII,
  scrubTrainingExample,
  scrubJSON,
  isPIIFree,
} from "./pii-scrubber";
export type { ScrubResult, PIIMatch, PIIType } from "./pii-scrubber";

// Training Data Versioning
export {
  createVersion,
  attachEvaluation,
  getCurrentVersion,
  listVersions,
  rollbackTo,
  hashTrainingData,
} from "./versioning";
export type { TrainingVersion, VersionManifest } from "./versioning";
