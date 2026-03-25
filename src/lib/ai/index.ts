/**
 * AI Intelligence Engine — Public API
 *
 * Usage:
 *   import { runIntelligence, COMMAND_ASSISTANT, CLAIMS_COPILOT } from "@/lib/ai";
 */

// Core engine
export { runIntelligence, generateResponse } from "./intelligence-engine";
export type { RunOptions } from "./intelligence-engine";

// Types
export type { AgentPersona, IntelligenceResult, ToolFilter, FeedbackEntry, VoiceOptions } from "./types";

// Personas
export {
  COMMAND_ASSISTANT,
  CLAIMS_COPILOT,
  TRIAGE_AGENT,
  BILLING_AGENT,
  INTAKE_ANALYZER,
  FOLLOWUP_AGENT,
  SCHEDULER_AGENT,
  createPatientChatbot,
  createWhatsAppAgent,
  getPersona,
} from "./personas";

// Tools
export { executeTool, getToolNames, getToolDeclarations, getAnthropicTools } from "./tools-registry";

// Voice
export {
  textToSpeech as voiceTTS,
  textToSpeechStream as voiceTTSStream,
  preprocessForTTS,
  getVoiceProfile,
  isVoiceConfigured,
  getConversationalAgentUrl,
} from "./voice-engine";
export type { TTSOptions, VoiceProfile } from "./voice-engine";

// Feedback
export {
  recordFeedback,
  recordToolResult,
  getCorrection,
  getCorrectionExamples,
  buildCorrectionContext,
  getPersonaQuality,
  getToolMetrics,
  getRecentFeedback,
  boostRAGDocs,
  penalizeRAGDocs,
  loadCorrections,
} from "./feedback-loop";
