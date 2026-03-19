// WhatsApp Booking Agent — AI that chats with patients via WhatsApp
// Handles: bookings, rescheduling, FAQs, triage, appointment reminders
// All bookings created as "pending" → sent to practice for approval

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

interface AgentContext {
  practiceName: string;
  practiceType: string;
  practiceHours: string;
  practicePhone: string;
  practiceAddress: string;
  aiPersonality: string;
  patientName?: string;
  patientPhone: string;
  conversationHistory: { role: "user" | "assistant"; content: string }[];
}

// Tools the WhatsApp agent can use
const agentTools: Anthropic.Tool[] = [
  {
    name: "check_availability",
    description: "Check available appointment slots for a given date. Returns available times.",
    input_schema: {
      type: "object" as const,
      properties: {
        date: { type: "string", description: "Date to check in YYYY-MM-DD format" },
      },
      required: ["date"],
    },
  },
  {
    name: "create_booking",
    description: "Create a new appointment booking. Status will be 'pending' until practice approves. Always confirm details with patient before creating.",
    input_schema: {
      type: "object" as const,
      properties: {
        patientName: { type: "string", description: "Full name of the patient" },
        service: { type: "string", description: "Service/treatment requested" },
        date: { type: "string", description: "Appointment date YYYY-MM-DD" },
        time: { type: "string", description: "Appointment time HH:MM" },
        notes: { type: "string", description: "Any notes from the patient" },
      },
      required: ["patientName", "service", "date", "time"],
    },
  },
  {
    name: "lookup_patient",
    description: "Look up a patient by phone number to get their history and existing bookings.",
    input_schema: {
      type: "object" as const,
      properties: {
        phone: { type: "string", description: "Patient phone number" },
      },
      required: ["phone"],
    },
  },
  {
    name: "cancel_booking",
    description: "Cancel an existing booking by ID.",
    input_schema: {
      type: "object" as const,
      properties: {
        bookingId: { type: "string", description: "The booking ID to cancel" },
        reason: { type: "string", description: "Reason for cancellation" },
      },
      required: ["bookingId"],
    },
  },
  {
    name: "escalate_to_human",
    description: "Escalate the conversation to a human staff member. Use for complex medical questions, complaints, or emergencies.",
    input_schema: {
      type: "object" as const,
      properties: {
        reason: { type: "string", description: "Why the conversation needs human attention" },
        urgency: { type: "string", enum: ["low", "medium", "high", "emergency"], description: "Urgency level" },
      },
      required: ["reason", "urgency"],
    },
  },
];

function buildSystemPrompt(ctx: AgentContext): string {
  const personality = {
    professional: "You are professional, efficient, and courteous.",
    friendly: "You are warm, friendly, and conversational. Use casual but respectful language.",
    concise: "You are direct and to-the-point. Keep messages short.",
    empathetic: "You are caring and empathetic. Acknowledge patient concerns warmly.",
  }[ctx.aiPersonality] || "You are professional and helpful.";

  return `You are the WhatsApp assistant for ${ctx.practiceName}, a ${ctx.practiceType} practice in South Africa.

${personality}

PRACTICE INFO:
- Name: ${ctx.practiceName}
- Type: ${ctx.practiceType}
- Hours: ${ctx.practiceHours}
- Phone: ${ctx.practicePhone}
- Address: ${ctx.practiceAddress}

YOUR ROLE:
1. Help patients book, reschedule, or cancel appointments
2. Answer questions about services, hours, and location
3. Triage urgent medical concerns (but NEVER give medical advice)
4. All bookings you create will be "pending" — the practice must approve them
5. Always confirm booking details before creating them
6. Be conversational — this is WhatsApp, not a formal channel
7. Use simple English — many patients may not be fluent
8. If a patient describes an emergency, tell them to call emergency services (10177) or go to the nearest ER immediately, then escalate

PATIENT CONTEXT:
- Phone: ${ctx.patientPhone}
${ctx.patientName ? `- Name: ${ctx.patientName}` : "- Name: Unknown (ask for their name before booking)"}

IMPORTANT:
- Never give medical diagnoses or treatment advice
- Always confirm date, time, and service before creating a booking
- If unsure about anything clinical, escalate to human staff
- Keep messages under 300 words (WhatsApp readability)
- Use 📅 📞 ✅ ⏰ emojis sparingly for clarity`;
}

/** Convert agent tools to Gemini format */
function toGeminiAgentTools() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return agentTools.map(t => ({
    name: t.name,
    description: t.description,
    parameters: {
      type: "object" as const,
      properties: (t.input_schema as Record<string, unknown>).properties || {},
      required: (t.input_schema as Record<string, unknown>).required || [],
    },
  })) as any[];
}

/** Process a WhatsApp message through the AI agent and return the response */
export async function processWhatsAppMessage(
  ctx: AgentContext,
  toolExecutor: (name: string, input: Record<string, unknown>) => Promise<string>
): Promise<string> {
  const systemPrompt = buildSystemPrompt(ctx);
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  // Try Gemini first
  if (geminiKey) {
    try {
      const { chatWithTools } = await import("@/lib/gemini");
      const geminiMessages = ctx.conversationHistory.map(m => ({
        role: (m.role === "user" ? "user" : "model") as "user" | "model",
        content: m.content,
      }));
      const result = await chatWithTools(systemPrompt, geminiMessages, toGeminiAgentTools(), toolExecutor, { maxSteps: 5 });
      return result.reply || "I'm sorry, I couldn't process that. Please try again or call us directly.";
    } catch (err) {
      console.error("Gemini WhatsApp agent error, falling back:", err);
    }
  }

  // Anthropic fallback
  if (!anthropicKey || anthropicKey === "your-anthropic-api-key-here") {
    return "Our AI assistant is temporarily unavailable. Please call us directly.";
  }

  const messages: Anthropic.MessageParam[] = ctx.conversationHistory.map(m => ({
    role: m.role,
    content: m.content,
  }));

  let finalResponse = "";
  let currentMessages = [...messages];

  for (let step = 0; step < 5; step++) {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: systemPrompt,
      tools: agentTools,
      messages: currentMessages,
    });

    const textBlocks = response.content.filter(b => b.type === "text");
    const toolBlocks = response.content.filter(b => b.type === "tool_use");

    if (toolBlocks.length === 0) {
      finalResponse = textBlocks.map(b => b.type === "text" ? b.text : "").join("\n");
      break;
    }

    currentMessages.push({ role: "assistant", content: response.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const tool of toolBlocks) {
      if (tool.type === "tool_use") {
        const result = await toolExecutor(tool.name, tool.input as Record<string, unknown>);
        toolResults.push({ type: "tool_result", tool_use_id: tool.id, content: result });
      }
    }

    currentMessages.push({ role: "user", content: toolResults });

    if (response.stop_reason === "end_turn") {
      finalResponse = textBlocks.map(b => b.type === "text" ? b.text : "").join("\n");
      break;
    }
  }

  return finalResponse || "I'm sorry, I couldn't process that. Please try again or call us directly.";
}
