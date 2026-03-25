/**
 * WhatsApp Booking Agent — Powered by Unified Intelligence Engine
 *
 * Handles: bookings, rescheduling, FAQs, triage, medical questions
 *
 * Now with:
 * - RAG-enriched responses (SA healthcare knowledge base)
 * - Full tool access (booking, patient lookup, KB search, escalation)
 * - Medical term awareness for triage
 * - Feedback learning from corrections
 * - Dual-provider AI (Gemini primary, Claude fallback)
 */

import { runIntelligence, createWhatsAppAgent } from "@/lib/ai";

export interface AgentContext {
  practiceName: string;
  practiceType: string;
  practiceHours: string;
  practicePhone: string;
  practiceAddress: string;
  aiPersonality: "professional" | "friendly" | "concise" | "empathetic";
  patientName?: string;
  patientPhone: string;
  practiceId?: string;
  conversationHistory: { role: "user" | "assistant"; content: string }[];
}

/** Process a WhatsApp message through the AI agent */
export async function processWhatsAppMessage(
  ctx: AgentContext,
  toolExecutor?: (name: string, input: Record<string, unknown>) => Promise<string>,
): Promise<string> {
  // Build the WhatsApp persona with practice details
  const persona = createWhatsAppAgent(
    ctx.practiceName,
    ctx.practiceType,
    ctx.practiceHours,
    ctx.practicePhone,
    ctx.practiceAddress,
    ctx.aiPersonality,
  );

  // Extract the last user message from conversation history
  const lastUserMsg = ctx.conversationHistory.filter((m) => m.role === "user").pop();
  const message = lastUserMsg?.content || "";

  if (!message) {
    return `Hello! I'm the ${ctx.practiceName} assistant. How can I help you today? 😊`;
  }

  // Build history (exclude last user message — it goes as the main message)
  const history = ctx.conversationHistory.slice(0, -1).map((m) => ({
    role: m.role === "user" ? ("user" as const) : ("model" as const),
    content: m.content,
  }));

  // Patient context
  const patientContext = `PATIENT CONTEXT:
- Phone: ${ctx.patientPhone}
${ctx.patientName ? `- Name: ${ctx.patientName}` : "- Name: Unknown (ask for their name before booking)"}`;

  const result = await runIntelligence({
    persona,
    message,
    history,
    extraContext: patientContext,
    practiceId: ctx.practiceId,
    toolExecutor,
    maxSteps: 6,
  });

  // Ensure response is WhatsApp-friendly (under 300 words)
  let response = result.response;
  if (response.length > 1500) {
    response = response.slice(0, 1450) + "\n\nWould you like me to continue?";
  }

  return response || "I'm sorry, I couldn't process that. Please try again or call us directly.";
}

/** Quick triage check — detects emergencies before full processing */
export function isEmergencyMessage(message: string): boolean {
  const emergency = /(can'?t breathe|chest pain|choking|heart attack|stroke|severe bleed|unconscious|anaphyla|seizure|overdose|suicide|self.harm)/i;
  return emergency.test(message);
}

/** Get emergency response text */
export function getEmergencyResponse(practiceName: string, practicePhone: string): string {
  return `🚨 This sounds like a medical emergency.

Please call emergency services IMMEDIATELY:
📞 10177 (national emergency)
📞 082 911 (private ambulance)

If you're unsure, go to your nearest emergency room right away.

Our team at ${practiceName} is also available at ${practicePhone} during business hours.

Your safety is our top priority. Don't wait — call now.`;
}
