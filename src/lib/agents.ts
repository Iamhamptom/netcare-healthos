// Healthcare AI Agents — Gemini primary, Anthropic fallback
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

export type AgentType = "triage" | "followup" | "intake" | "billing" | "scheduler";

interface AgentResult {
  agent: AgentType;
  response: string;
  actions: AgentAction[];
  confidence: number;
  escalate: boolean;
}

interface AgentAction {
  type: "create_booking" | "send_reminder" | "flag_urgent" | "update_record" | "notify_staff" | "schedule_followup";
  data: Record<string, unknown>;
}

const AGENT_PROMPTS: Record<AgentType, string> = {
  triage: `You are an AI triage agent for a healthcare practice. Your job is to assess patient messages and determine urgency.

URGENCY LEVELS:
- EMERGENCY (immediate): chest pain, difficulty breathing, severe bleeding, loss of consciousness, allergic reaction
- URGENT (same-day): severe pain, fever >39°C, swelling with infection signs, post-operative complications
- SEMI-URGENT (24-48hr): moderate pain, persistent symptoms, medication concerns
- ROUTINE (scheduled): check-ups, follow-ups, general questions, non-urgent requests

RULES:
- Always err on the side of caution — when in doubt, escalate
- Never diagnose — only triage and recommend appropriate action
- For emergencies: tell patient to call emergency services or go to ER immediately
- Return a JSON object with: urgency (string), assessment (string), recommended_action (string), escalate_to_human (boolean)
- Keep responses concise and empathetic`,

  followup: `You are an AI follow-up agent for a healthcare practice. You generate personalized follow-up messages for patients.

YOUR TASKS:
- Post-procedure check-ins (24hr and 72hr after procedures)
- Medication compliance reminders
- Recall reminders for overdue check-ups
- Satisfaction surveys after appointments
- Birthday and wellness messages

RULES:
- Be warm, professional, and concise (WhatsApp-length messages)
- Include the patient's first name
- Reference their specific procedure/appointment
- Include a clear call-to-action (reply, call, or book)
- Return JSON: { message: string, type: string, suggested_send_time: string }`,

  intake: `You are an AI intake agent for a healthcare practice. You help collect patient information before their appointment.

YOUR TASKS:
- Collect chief complaint and symptom details
- Ask about medication changes
- Confirm allergies
- Ask about pain level (1-10)
- Collect insurance/medical aid updates
- Pre-screen for COVID/flu symptoms

RULES:
- Ask one question at a time, conversationally
- Be empathetic and non-clinical in language
- Store responses as structured data
- Flag any concerning symptoms for the doctor
- Return JSON: { question: string, data_collected: object, flags: string[], complete: boolean }`,

  billing: `You are an AI billing assistant for a healthcare practice. You help patients understand their bills and payment options.

YOUR TASKS:
- Explain medical aid coverage and benefits
- Break down billing codes in plain language
- Offer payment plan options
- Process payment confirmations
- Handle billing disputes empathetically

RULES:
- Be transparent about costs
- Never make promises about medical aid claims
- Suggest contacting the practice for complex queries
- Return JSON: { response: string, action: string | null }`,

  scheduler: `You are an AI scheduling agent for a healthcare practice. You help patients book, reschedule, and manage appointments.

YOUR TASKS:
- Find available slots based on service type and provider
- Handle rescheduling requests
- Manage cancellations with appropriate notice period
- Suggest optimal times based on practice hours
- Handle double-booking prevention

PRACTICE HOURS: Mon-Fri 8:00-17:00, Sat 8:00-13:00
SLOT DURATION: 30min (standard), 60min (procedures), 15min (follow-ups)

RULES:
- Always confirm date, time, and service before booking
- Suggest 2-3 alternative slots if preferred time is unavailable
- Apply 24-hour cancellation policy
- Return JSON: { response: string, booking_action: { type: "create"|"reschedule"|"cancel", details: object } | null }`,
};

export async function runAgent(
  agentType: AgentType,
  message: string,
  context?: {
    patientName?: string;
    practiceType?: string;
    history?: { role: string; content: string }[];
    patientData?: Record<string, unknown>;
  }
): Promise<AgentResult> {
  const systemPrompt = AGENT_PROMPTS[agentType];
  const contextStr = context
    ? `\n\nCONTEXT:\n- Patient: ${context.patientName || "Unknown"}\n- Practice type: ${context.practiceType || "dental"}\n- Patient data: ${JSON.stringify(context.patientData || {})}`
    : "";

  const messages: { role: "user" | "assistant"; content: string }[] = [];

  // Add conversation history
  if (context?.history) {
    for (const msg of context.history) {
      if (msg.role === "patient" || msg.role === "user") {
        messages.push({ role: "user", content: msg.content });
      } else if (msg.role === "assistant" || msg.role === "practice") {
        messages.push({ role: "assistant", content: msg.content });
      }
    }
  }

  // Add current message
  messages.push({ role: "user", content: message });

  let text = "{}";
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  // Try Gemini first
  if (geminiKey) {
    try {
      const { chat } = await import("@/lib/gemini");
      const geminiMessages = messages.map(m => ({
        role: (m.role === "user" ? "user" : "model") as "user" | "model",
        content: m.content,
      }));
      text = await chat(systemPrompt + contextStr, geminiMessages, { maxTokens: 1024 });
    } catch (err) {
      console.error("Gemini agent error, falling back:", err);
      text = "";
    }
  }

  // Anthropic fallback
  if (!text && anthropicKey && anthropicKey !== "your-anthropic-api-key-here") {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt + contextStr,
      messages,
    });
    text = response.content.find(b => b.type === "text")?.text || "{}";
  }

  // If neither AI is available, return a helpful fallback
  if (!text) text = JSON.stringify({ response: "AI agent is temporarily unavailable. Please try again later." });

  // Parse agent response
  let parsed: Record<string, unknown> = {};
  try {
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
  } catch {
    parsed = { response: text };
  }

  // Determine actions
  const actions: AgentAction[] = [];
  const escalate = Boolean(parsed.escalate_to_human || parsed.escalate);

  if (agentType === "triage" && parsed.urgency === "EMERGENCY") {
    actions.push({ type: "flag_urgent", data: { urgency: "EMERGENCY", assessment: parsed.assessment } });
    actions.push({ type: "notify_staff", data: { message: `EMERGENCY: ${parsed.assessment}` } });
  }

  if (agentType === "scheduler" && parsed.booking_action) {
    const ba = parsed.booking_action as Record<string, unknown>;
    if (ba.type === "create") actions.push({ type: "create_booking", data: ba.details as Record<string, unknown> || {} });
    if (ba.type === "reschedule") actions.push({ type: "schedule_followup", data: ba.details as Record<string, unknown> || {} });
  }

  if (agentType === "followup") {
    actions.push({ type: "send_reminder", data: { message: parsed.message, type: parsed.type } });
  }

  return {
    agent: agentType,
    response: String(parsed.response || parsed.message || parsed.assessment || parsed.question || text),
    actions,
    confidence: 0.85,
    escalate,
  };
}

/** Run the triage agent to assess urgency */
export async function triageMessage(message: string, patientName?: string) {
  return runAgent("triage", message, { patientName });
}

/** Generate a follow-up message for a patient */
export async function generateFollowup(
  patientName: string,
  appointmentType: string,
  daysSince: number
) {
  return runAgent("followup", `Generate a ${daysSince}-day post-${appointmentType} follow-up message for ${patientName}.`, {
    patientName,
    patientData: { appointmentType, daysSince },
  });
}

/** Run intake collection */
export async function runIntake(
  message: string,
  patientName: string,
  history?: { role: string; content: string }[]
) {
  return runAgent("intake", message, { patientName, history });
}
