/**
 * Healthcare AI Agents — Powered by Unified Intelligence Engine
 *
 * 5 specialized agents, each with:
 * - RAG-enriched knowledge base (300MB SA healthcare data)
 * - Tool access (ICD-10 lookup, patient search, KB search, booking, etc.)
 * - Dual-provider AI (Gemini primary, Claude fallback)
 * - Feedback loop learning from corrections
 * - Context-aware responses grounded in real data
 */

import { runIntelligence, getPersona } from "@/lib/ai";
import { TRIAGE_AGENT, BILLING_AGENT, INTAKE_ANALYZER, FOLLOWUP_AGENT, SCHEDULER_AGENT } from "@/lib/ai/personas";
import type { AgentPersona } from "@/lib/ai/types";

export type AgentType = "triage" | "followup" | "intake" | "billing" | "scheduler";

interface AgentResult {
  agent: AgentType;
  response: string;
  actions: AgentAction[];
  confidence: number;
  escalate: boolean;
  toolsUsed: string[];
  provider: string;
}

interface AgentAction {
  type: "create_booking" | "send_reminder" | "flag_urgent" | "update_record" | "notify_staff" | "schedule_followup";
  data: Record<string, unknown>;
}

const AGENT_PERSONAS: Record<AgentType, AgentPersona> = {
  triage: TRIAGE_AGENT,
  followup: FOLLOWUP_AGENT,
  intake: INTAKE_ANALYZER,
  billing: BILLING_AGENT,
  scheduler: SCHEDULER_AGENT,
};

export async function runAgent(
  agentType: AgentType,
  message: string,
  context?: {
    patientName?: string;
    practiceType?: string;
    practiceId?: string;
    history?: { role: string; content: string }[];
    patientData?: Record<string, unknown>;
    isDemoMode?: boolean;
  },
): Promise<AgentResult> {
  const persona = AGENT_PERSONAS[agentType];

  // Build extra context from patient data
  const contextParts: string[] = [];
  if (context?.patientName) contextParts.push(`Patient: ${context.patientName}`);
  if (context?.practiceType) contextParts.push(`Practice type: ${context.practiceType}`);
  if (context?.patientData && Object.keys(context.patientData).length > 0) {
    contextParts.push(`Patient data: ${JSON.stringify(context.patientData)}`);
  }

  // Build history
  const history = (context?.history || []).map((msg) => ({
    role: msg.role === "patient" || msg.role === "user" ? ("user" as const) : ("model" as const),
    content: msg.content,
  }));

  // Run through the intelligence engine
  const result = await runIntelligence({
    persona,
    message,
    history,
    extraContext: contextParts.length > 0 ? `CONTEXT:\n${contextParts.join("\n")}` : undefined,
    practiceId: context?.practiceId,
    isDemoMode: context?.isDemoMode,
  });

  // Determine actions from the response
  const actions: AgentAction[] = [];
  const lowerResponse = result.response.toLowerCase();
  let escalate = false;

  // Triage: detect emergencies and urgency
  if (agentType === "triage") {
    if (lowerResponse.includes("emergency") || lowerResponse.includes("10177") || lowerResponse.includes("082 911")) {
      actions.push({ type: "flag_urgent", data: { urgency: "EMERGENCY", assessment: result.response.slice(0, 200) } });
      actions.push({ type: "notify_staff", data: { message: `EMERGENCY triage alert: ${result.response.slice(0, 200)}` } });
      escalate = true;
    } else if (lowerResponse.includes("urgent") || lowerResponse.includes("same-day") || lowerResponse.includes("same day")) {
      actions.push({ type: "flag_urgent", data: { urgency: "URGENT", assessment: result.response.slice(0, 200) } });
    }
    if (lowerResponse.includes("escalat") || lowerResponse.includes("connect you with") || lowerResponse.includes("human")) {
      escalate = true;
    }
  }

  // Followup: detect reminder generation
  if (agentType === "followup") {
    if (result.toolsUsed.includes("send_whatsapp") || result.toolsUsed.includes("send_email")) {
      actions.push({ type: "send_reminder", data: { message: result.response.slice(0, 300) } });
    }
  }

  // Scheduler: detect booking actions
  if (agentType === "scheduler") {
    if (result.toolsUsed.includes("create_booking")) {
      actions.push({ type: "create_booking", data: {} });
    }
    if (result.toolsUsed.includes("cancel_booking")) {
      actions.push({ type: "schedule_followup", data: {} });
    }
  }

  // Calculate confidence from tool usage and provider
  const confidence = calculateConfidence(result.toolsUsed, result.provider, result.stepsUsed);

  return {
    agent: agentType,
    response: result.response,
    actions,
    confidence,
    escalate,
    toolsUsed: result.toolsUsed,
    provider: result.provider,
  };
}

/** Calculate confidence based on how well the agent grounded its response */
function calculateConfidence(toolsUsed: string[], provider: string, steps: number): number {
  let confidence = 0.6; // Base confidence

  // Using tools means grounded in real data
  if (toolsUsed.length > 0) confidence += 0.15;

  // Using knowledge base means grounded in verified knowledge
  if (toolsUsed.includes("search_knowledge_base") || toolsUsed.includes("lookup_icd10")) confidence += 0.1;

  // Having a real AI provider (not fallback)
  if (provider !== "none") confidence += 0.1;

  // Multiple steps = thorough analysis
  if (steps >= 3) confidence += 0.05;

  return Math.min(confidence, 0.98);
}

// ── Convenience Functions (backward compatible) ─────────────────────────

/** Run the triage agent to assess urgency */
export async function triageMessage(message: string, patientName?: string, practiceId?: string) {
  return runAgent("triage", message, { patientName, practiceId });
}

/** Generate a follow-up message for a patient */
export async function generateFollowup(patientName: string, appointmentType: string, daysSince: number, practiceId?: string) {
  return runAgent("followup", `Generate a ${daysSince}-day post-${appointmentType} follow-up message for ${patientName}.`, {
    patientName,
    practiceId,
    patientData: { appointmentType, daysSince },
  });
}

/** Run intake collection */
export async function runIntake(message: string, patientName: string, history?: { role: string; content: string }[], practiceId?: string) {
  return runAgent("intake", message, { patientName, history, practiceId });
}
