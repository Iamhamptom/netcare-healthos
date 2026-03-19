// Command Assistant — AI that can do everything on the platform
// Used in the dashboard sidebar chat panel
// Has tools to: search patients, create bookings, check schedule, pull analytics, send messages, manage tasks

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

export const assistantTools: Anthropic.Tool[] = [
  {
    name: "search_patients",
    description: "Search for patients by name, phone, or email. Returns matching patient records.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search term (name, phone, or email)" },
      },
      required: ["query"],
    },
  },
  {
    name: "get_patient",
    description: "Get full patient details including allergies, medications, vitals, and recent records.",
    input_schema: {
      type: "object" as const,
      properties: {
        patientId: { type: "string", description: "Patient ID" },
      },
      required: ["patientId"],
    },
  },
  {
    name: "create_booking",
    description: "Create a new appointment booking.",
    input_schema: {
      type: "object" as const,
      properties: {
        patientName: { type: "string" },
        service: { type: "string" },
        date: { type: "string", description: "YYYY-MM-DD" },
        time: { type: "string", description: "HH:MM" },
        notes: { type: "string" },
      },
      required: ["patientName", "service", "date", "time"],
    },
  },
  {
    name: "get_todays_schedule",
    description: "Get today's schedule — all bookings and available slots.",
    input_schema: {
      type: "object" as const,
      properties: {
        date: { type: "string", description: "Date in YYYY-MM-DD (defaults to today)" },
      },
      required: [],
    },
  },
  {
    name: "get_analytics",
    description: "Get practice analytics — revenue, patients, bookings, trends.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_checkin_queue",
    description: "Get the current check-in queue — who's waiting, in consultation, done today.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_daily_tasks",
    description: "Get daily task checklist with completion status.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "send_whatsapp",
    description: "Send a WhatsApp message to a patient.",
    input_schema: {
      type: "object" as const,
      properties: {
        to: { type: "string", description: "Phone number with country code (e.g. +27...)" },
        message: { type: "string", description: "Message to send" },
      },
      required: ["to", "message"],
    },
  },
  {
    name: "send_email",
    description: "Send an email to a patient or staff member.",
    input_schema: {
      type: "object" as const,
      properties: {
        to: { type: "string", description: "Email address" },
        subject: { type: "string" },
        body: { type: "string", description: "Email body (plain text, will be formatted)" },
      },
      required: ["to", "subject", "body"],
    },
  },
  {
    name: "create_invoice",
    description: "Create a new invoice for a patient.",
    input_schema: {
      type: "object" as const,
      properties: {
        patientName: { type: "string" },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              description: { type: "string" },
              code: { type: "string", description: "ICD-10 or procedure code" },
              amount: { type: "number" },
            },
            required: ["description", "amount"],
          },
        },
      },
      required: ["patientName", "items"],
    },
  },
  {
    name: "get_outstanding_invoices",
    description: "Get list of unpaid/outstanding invoices.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "sync_google_reviews",
    description: "Sync reviews from Google Maps/Places into the practice review system. Returns how many new reviews were imported.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_google_reviews",
    description: "Fetch the practice's Google Maps rating and recent reviews. Shows the Google star rating, review count, and latest reviews.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "add_patient",
    description: "Add a new patient to the system.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        dateOfBirth: { type: "string", description: "YYYY-MM-DD" },
        medicalAid: { type: "string" },
        medicalAidNumber: { type: "string" },
      },
      required: ["name", "phone"],
    },
  },
];

export function buildAssistantSystemPrompt(practiceName: string, practiceType: string, userName: string, userRole: string): string {
  return `You are the AI Command Assistant for ${practiceName} (${practiceType} practice), powered by Netcare Health OS Ops.

You are talking to ${userName} (${userRole}).

YOUR CAPABILITIES:
- Search and manage patients
- Create and check bookings/schedule
- View analytics and daily metrics
- Check the waiting room queue
- Send WhatsApp messages and emails
- Create invoices
- View and manage daily tasks
- Sync and view Google reviews
- Answer questions about the practice

RULES:
1. Be concise — this is a sidebar chat, not a report
2. Use the tools to get real data before answering
3. When asked to do something, DO it (call the tool), don't just describe how
4. Format responses with bullet points and bold text for readability
5. If you can't do something with your tools, say so clearly
6. Respect the user's role — if they're a receptionist, focus on scheduling/check-in tasks
7. Always confirm before creating bookings, invoices, or sending messages
8. Amounts are in South African Rand (R)

EXAMPLES OF WHAT USERS MIGHT ASK:
- "Who's in the waiting room?"
- "Book Mrs Molefe for a cleaning tomorrow at 10"
- "Send a reminder to all patients with bookings tomorrow"
- "How much revenue did we do this month?"
- "Look up patient John Smith"
- "What's my schedule today?"
- "Create an invoice for tooth extraction, R1200"
- "What's our Google rating?"
- "Sync our Google reviews"`;
}

/** Convert Anthropic tool definitions to Gemini FunctionDeclarations */
function toGeminiFunctions() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return assistantTools.map(t => ({
    name: t.name,
    description: t.description,
    parameters: {
      type: "object" as const,
      properties: (t.input_schema as Record<string, unknown>).properties || {},
      required: (t.input_schema as Record<string, unknown>).required || [],
    },
  })) as any[];
}

/** Run the command assistant with tool calling — tries Gemini first, then Anthropic */
export async function runAssistant(
  messages: Anthropic.MessageParam[],
  systemPrompt: string,
  toolExecutor: (name: string, input: Record<string, unknown>) => Promise<string>
): Promise<{ reply: string; toolsUsed: string[] }> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  // Try Gemini first
  if (geminiKey) {
    try {
      const { chatWithTools } = await import("@/lib/gemini");
      const geminiMessages = messages.map(m => ({
        role: (m.role === "user" ? "user" : "model") as "user" | "model",
        content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
      }));
      return await chatWithTools(systemPrompt, geminiMessages, toGeminiFunctions(), toolExecutor, { maxSteps: 8 });
    } catch (err) {
      console.error("Gemini assistant error, falling back to Anthropic:", err);
    }
  }

  // Anthropic fallback
  if (!anthropicKey || anthropicKey === "your-anthropic-api-key-here") {
    // No AI provider — use smart mock that executes tools via pattern matching
    return runMockAssistant(messages, toolExecutor);
  }

  const toolsUsed: string[] = [];
  let currentMessages = [...messages];

  for (let step = 0; step < 8; step++) {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      tools: assistantTools,
      messages: currentMessages,
    });

    const textBlocks = response.content.filter(b => b.type === "text");
    const toolBlocks = response.content.filter(b => b.type === "tool_use");

    if (toolBlocks.length === 0 || response.stop_reason === "end_turn") {
      const reply = textBlocks.map(b => b.type === "text" ? b.text : "").join("\n");
      return { reply: reply || "Done!", toolsUsed };
    }

    currentMessages.push({ role: "assistant", content: response.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const tool of toolBlocks) {
      if (tool.type === "tool_use") {
        toolsUsed.push(tool.name);
        const result = await toolExecutor(tool.name, tool.input as Record<string, unknown>);
        toolResults.push({ type: "tool_result", tool_use_id: tool.id, content: result });
      }
    }

    currentMessages.push({ role: "user", content: toolResults });
  }

  return { reply: "I hit the tool limit. Let me know if you need anything else.", toolsUsed };
}

/** Mock assistant — no AI key needed. Pattern-matches user intent, calls tools, formats a response. */
async function runMockAssistant(
  messages: Anthropic.MessageParam[],
  toolExecutor: (name: string, input: Record<string, unknown>) => Promise<string>
): Promise<{ reply: string; toolsUsed: string[] }> {
  const lastMsg = messages.filter(m => m.role === "user").pop();
  const query = (typeof lastMsg?.content === "string" ? lastMsg.content : "").toLowerCase();
  const toolsUsed: string[] = [];

  async function callTool(name: string, input: Record<string, unknown> = {}): Promise<unknown> {
    toolsUsed.push(name);
    const raw = await toolExecutor(name, input);
    try { return JSON.parse(raw); } catch { return raw; }
  }

  // Waiting room / check-in
  if (query.includes("waiting") || query.includes("queue") || query.includes("check-in") || query.includes("checkin")) {
    const data = await callTool("get_checkin_queue") as Array<{ patient?: string; patientName?: string; status?: string; arrivedAt?: string }>;
    if (!Array.isArray(data) || data.length === 0) return { reply: "The waiting room is empty right now.", toolsUsed };
    const waiting = data.filter(c => c.status === "waiting");
    const inConsult = data.filter(c => c.status === "in_consultation");
    const done = data.filter(c => c.status === "checked_out");
    let reply = `**Check-in queue:**\n`;
    if (waiting.length) reply += `\n🟡 **Waiting (${waiting.length}):** ${waiting.map(c => c.patient || c.patientName).join(", ")}`;
    if (inConsult.length) reply += `\n🟢 **In consultation (${inConsult.length}):** ${inConsult.map(c => c.patient || c.patientName).join(", ")}`;
    if (done.length) reply += `\n✅ **Done (${done.length}):** ${done.map(c => c.patient || c.patientName).join(", ")}`;
    return { reply, toolsUsed };
  }

  // Schedule / today's bookings
  if (query.includes("schedule") || query.includes("today") || query.includes("appointment")) {
    const data = await callTool("get_todays_schedule") as { bookings?: Array<{ patient?: string; service?: string; time?: string; status?: string }> };
    const bookings = data.bookings || [];
    if (bookings.length === 0) return { reply: "No bookings scheduled for today.", toolsUsed };
    let reply = `**Today's schedule (${bookings.length} bookings):**\n`;
    for (const b of bookings) {
      const time = b.time ? new Date(b.time).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", hour12: false }) : "—";
      reply += `\n• **${time}** — ${b.patient} (${b.service}) [${b.status}]`;
    }
    return { reply, toolsUsed };
  }

  // Revenue / analytics
  if (query.includes("revenue") || query.includes("analytics") || query.includes("stats") || query.includes("how much") || query.includes("money")) {
    const data = await callTool("get_analytics") as { patients?: number; bookings?: number; revenue?: number };
    return {
      reply: `**Practice analytics:**\n\n• **Patients:** ${data.patients || 0}\n• **Total bookings:** ${data.bookings || 0}\n• **Revenue:** R${(data.revenue || 0).toLocaleString()}`,
      toolsUsed,
    };
  }

  // Patient search
  if (query.includes("patient") || query.includes("find") || query.includes("look up") || query.includes("search")) {
    const searchTerm = query.replace(/patient|find|look up|search|for|me|the|a/gi, "").trim();
    if (searchTerm.length < 2) {
      return { reply: "Who would you like me to look up? Give me a name, phone number, or email.", toolsUsed };
    }
    const data = await callTool("search_patients", { query: searchTerm }) as Array<{ name?: string; phone?: string; email?: string }>;
    if (!Array.isArray(data) || data.length === 0) return { reply: `No patients found matching "${searchTerm}".`, toolsUsed };
    let reply = `**Found ${data.length} patient(s):**\n`;
    for (const p of data) reply += `\n• **${p.name}** — ${p.phone || "no phone"} — ${p.email || "no email"}`;
    return { reply, toolsUsed };
  }

  // Tasks
  if (query.includes("task") || query.includes("checklist") || query.includes("to do") || query.includes("todo")) {
    const data = await callTool("get_daily_tasks") as Array<{ title?: string; done?: boolean; completed?: boolean; category?: string }>;
    if (!Array.isArray(data) || data.length === 0) return { reply: "No daily tasks configured.", toolsUsed };
    const done = data.filter(t => t.done || t.completed).length;
    let reply = `**Daily tasks (${done}/${data.length} complete):**\n`;
    for (const t of data) reply += `\n${(t.done || t.completed) ? "✅" : "⬜"} ${t.title}`;
    return { reply, toolsUsed };
  }

  // Invoices
  if (query.includes("invoice") || query.includes("outstanding") || query.includes("unpaid") || query.includes("billing")) {
    const data = await callTool("get_outstanding_invoices") as Array<{ patient?: string; total?: number; status?: string }>;
    if (!Array.isArray(data) || data.length === 0) return { reply: "No outstanding invoices — all paid up! 🎉", toolsUsed };
    let reply = `**Outstanding invoices (${data.length}):**\n`;
    for (const i of data) reply += `\n• **${i.patient}** — R${(i.total || 0).toLocaleString()} (${i.status})`;
    return { reply, toolsUsed };
  }

  // Google reviews
  if (query.includes("review") || query.includes("rating") || query.includes("google")) {
    const data = await callTool("get_google_reviews") as { rating?: number; totalRatings?: number; reviews?: Array<{ authorName?: string; rating?: number; text?: string }> };
    let reply = `**Google Reviews:** ⭐ ${data.rating || "N/A"} (${data.totalRatings || 0} ratings)\n`;
    if (data.reviews?.length) {
      reply += `\n**Recent:**`;
      for (const r of data.reviews.slice(0, 3)) reply += `\n• **${r.authorName}** (${r.rating}★): "${r.text}"`;
    }
    return { reply, toolsUsed };
  }

  // Hello / greeting
  if (query.includes("hello") || query.includes("hi") || query.includes("hey") || query.length < 5) {
    return { reply: "Hi! I can help you with:\n\n• **\"Who's waiting?\"** — check-in queue\n• **\"Today's schedule\"** — bookings\n• **\"Revenue this month\"** — analytics\n• **\"Find patient [name]\"** — patient search\n• **\"Daily tasks\"** — task checklist\n• **\"Outstanding invoices\"** — billing\n• **\"Google reviews\"** — ratings\n\nWhat do you need?", toolsUsed: [] };
  }

  // Fallback
  return {
    reply: "I can help with: **schedule**, **waiting room**, **revenue**, **patient search**, **daily tasks**, **invoices**, and **reviews**. Try asking something like \"Who's waiting?\" or \"Today's schedule\".",
    toolsUsed: [],
  };
}
