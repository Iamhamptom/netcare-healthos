/**
 * Shared types for the AI Intelligence Engine
 */

/** Tool access filter — determines which tools a persona can use */
export type ToolFilter =
  | "none"            // No tool access (pure text generation)
  | "all"             // All tools (command assistant)
  | "practice"        // Practice management (bookings, patients, schedule, billing)
  | "claims"          // Claims processing (ICD-10, validation, schemes, fraud)
  | "medical"         // Medical knowledge (KB search, drug lookup, code lookup)
  | "whatsapp"        // WhatsApp-specific (booking, patient lookup, escalation)
  | "triage"          // Triage-specific (patient lookup, escalation, KB search)
  | "billing"         // Billing-specific (invoices, claims, payments)
  | string[];         // Custom list of tool names

/** Agent persona — defines an AI agent's identity and capabilities */
export interface AgentPersona {
  /** Unique identifier */
  name: string;
  /** Display name shown to users */
  displayName: string;
  /** Full system prompt defining behavior */
  systemPrompt: string;
  /** List of capabilities (shown in prompt) */
  capabilities?: string[];
  /** Tool access filter */
  toolFilter: ToolFilter;
  /** Max tool-calling steps before stopping */
  maxSteps?: number;
  /** Whether to use RAG enrichment (default: true) */
  useRAG?: boolean;
  /** RAG category filter (e.g., "claims", "pharmaceutical") */
  ragCategory?: string;
  /** AI temperature (0-1, lower = more precise) */
  temperature?: number;
  /** ElevenLabs voice ID for TTS */
  voiceId?: string;
  /** Voice style (for emotion-aware TTS) */
  voiceStyle?: "professional" | "friendly" | "empathetic" | "concise";
}

/** Result from the intelligence engine */
export interface IntelligenceResult {
  /** AI response text */
  response: string;
  /** Tools that were called */
  toolsUsed: string[];
  /** Which AI provider generated the response */
  provider: "gemini" | "claude" | "none";
  /** Number of agent loop steps used */
  stepsUsed: number;
  /** RAG sources that were used (if any) */
  ragSources?: string[];
}

/** Feedback entry for the learning loop */
export interface FeedbackEntry {
  id: string;
  /** Which agent persona generated the response */
  persona: string;
  /** The original user query */
  query: string;
  /** The AI response */
  response: string;
  /** Feedback type */
  type: "thumbs_up" | "thumbs_down" | "correction" | "escalation";
  /** User's correction (if type = correction) */
  correctedResponse?: string;
  /** RAG documents used */
  ragDocIds?: string[];
  /** Timestamp */
  timestamp: string;
  /** Practice ID */
  practiceId?: string;
}

/** Voice synthesis options */
export interface VoiceOptions {
  /** ElevenLabs voice ID */
  voiceId?: string;
  /** Speech rate (0.5 = slow, 1.0 = normal, 2.0 = fast) */
  rate?: number;
  /** Emotional style */
  style?: "professional" | "friendly" | "empathetic" | "urgent";
  /** Output format */
  format?: "mp3_44100_128" | "pcm_16000" | "pcm_44100";
  /** Enable SSML preprocessing for medical terms */
  medicalSSML?: boolean;
}
