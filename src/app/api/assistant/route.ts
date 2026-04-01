export const maxDuration = 60;
import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoPractice } from "@/lib/demo-data";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { runIntelligence, COMMAND_ASSISTANT, buildCorrectionContext } from "@/lib/ai";

/**
 * POST /api/assistant — Command Assistant with Thread Persistence
 *
 * Accepts either:
 *   { messages: [...] }                    — stateless (backward compatible)
 *   { message: "...", threadId?: "..." }   — thread-persistent (new)
 *
 * When threadId is provided:
 *   1. Loads conversation history from AiThread + AiMessage tables
 *   2. Appends user message to DB
 *   3. Runs intelligence engine with full history
 *   4. Saves assistant response to DB
 *   5. Returns response + threadId for next call
 *
 * When threadId is omitted:
 *   - Creates a new thread automatically
 *   - Returns threadId in response so client can continue
 */
export async function POST(request: Request) {
  const guard = await guardRoute(request, "assistant", { limit: 25 });
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  const isThreadMode = typeof body.message === "string";

  // Get practice context
  let practiceName = demoPractice.name;
  let practiceType = demoPractice.type;
  let userName = "User";
  let userRole = "admin";
  let practiceId = guard.practiceId;

  if (isDemoMode) {
    // In demo mode, use the actual logged-in user's name from the session
    const { demoUsers, demoUser: defaultDemoUser } = await import("@/lib/demo-data");
    const sessionUser = Object.values(demoUsers).find(u => u.id === guard.user?.id) || defaultDemoUser;
    userName = sessionUser.name;
    userRole = "admin";
  } else {
    try {
      const { prisma } = await import("@/lib/prisma");
      const user = await prisma.user.findUnique({
        where: { id: guard.user.id },
        include: { practice: true },
      });
      if (user?.practice) {
        practiceName = user.practice.name;
        practiceType = user.practice.type;
        practiceId = user.practice.id;
      }
      userName = user?.name || "User";
      userRole = user?.role || "admin";
    } catch {
      /* use defaults */
    }
  }

  try {
    const corrections = buildCorrectionContext("command-assistant");
    const memoryContext = await loadMemoryContext(practiceId);
    const userContext = [
      "You are talking to " + userName + " (" + userRole + ") at " + practiceName + " (" + practiceType + " practice).",
      corrections,
      memoryContext,
    ].filter(Boolean).join("\n");

    let message: string;
    let history: Array<{ role: "user" | "model"; content: string }>;
    let threadId: string | undefined;

    if (isThreadMode) {
      // Thread-persistent mode
      threadId = body.threadId;
      message = body.message;

      if (!isDemoMode) {
        const { prisma } = await import("@/lib/prisma");

        // Create thread if none provided
        if (!threadId) {
          const thread = await prisma.aiThread.create({
            data: {
              practiceId: practiceId || "default",
              userId: guard.user?.id,
              persona: "command-assistant",
              title: message.slice(0, 80),
            },
          });
          threadId = thread.id;
        }

        // Save user message
        await prisma.aiMessage.create({
          data: { threadId, role: "user", content: message },
        });

        // Load history from DB (last 20 messages for context window)
        const dbMessages = await prisma.aiMessage.findMany({
          where: { threadId },
          orderBy: { createdAt: "asc" },
          take: 20,
        });
        history = dbMessages.slice(0, -1).map((m: { role: string; content: string }) => ({
          role: m.role === "user" ? ("user" as const) : ("model" as const),
          content: m.content,
        }));

        // Update thread metadata
        await prisma.aiThread.update({
          where: { id: threadId },
          data: {
            messageCount: { increment: 1 },
            lastMessageAt: new Date(),
          },
        });
      } else {
        history = [];
        threadId = "demo-" + Date.now();
      }
    } else {
      // Stateless mode (backward compatible)
      const messages = body.messages;
      if (!messages || !Array.isArray(messages)) {
        return NextResponse.json({ error: "messages array or message string required" }, { status: 400 });
      }
      const lastUserMsg = messages.filter((m: { role: string }) => m.role === "user").pop();
      message = typeof lastUserMsg?.content === "string" ? lastUserMsg.content : "";
      history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
        role: m.role === "user" ? ("user" as const) : ("model" as const),
        content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
      }));
    }

    const result = await runIntelligence({
      persona: COMMAND_ASSISTANT,
      message,
      history,
      extraContext: userContext,
      practiceId,
      isDemoMode,
      maxSteps: 10,
    });

    // Persist assistant response to thread
    if (isThreadMode && threadId && !isDemoMode) {
      try {
        const { prisma } = await import("@/lib/prisma");
        await prisma.aiMessage.create({
          data: {
            threadId,
            role: "assistant",
            content: result.response,
            toolsUsed: result.toolsUsed.length > 0 ? JSON.stringify(result.toolsUsed) : null,
            provider: result.provider,
            stepsUsed: result.stepsUsed,
          },
        });
        await prisma.aiThread.update({
          where: { id: threadId },
          data: { messageCount: { increment: 1 }, lastMessageAt: new Date() },
        });

        // Auto-save important context to memory
        await autoSaveMemory(practiceId, message, result.response, result.toolsUsed);
      } catch (err) {
        console.error("[assistant] Failed to persist response:", err);
      }
    }

    // Detect UI actions — from regex patterns AND from navigate_to tool calls
    const actions = detectUIActions(message, result.response, result.toolsUsed);

    // If the AI called navigate_to, extract the path from the response
    if (result.toolsUsed.includes("navigate_to") && result.response) {
      const pathMatch = result.response.match(/\/dashboard\/[\w\-\/]+/);
      if (pathMatch && !actions.find(a => a.target === pathMatch[0])) {
        actions.push({ type: "navigate", target: pathMatch[0], label: "AI Navigation" });
      }
    }

    return NextResponse.json({
      reply: result.response,
      threadId,
      toolsUsed: result.toolsUsed,
      provider: result.provider,
      stepsUsed: result.stepsUsed,
      actions,
    });
  } catch (err) {
    console.error("[assistant] Error:", err);
    return NextResponse.json({
      reply: "Sorry, I hit an error. Please try again or rephrase your request.",
      toolsUsed: [],
    });
  }
}

/**
 * GET /api/assistant?threadId=xxx — Load thread history
 * GET /api/assistant — List recent threads
 */
export async function GET(request: Request) {
  const guard = await guardRoute(request, "assistant", { limit: 30 });
  if (isErrorResponse(guard)) return guard;

  const { searchParams } = new URL(request.url);
  const threadId = searchParams.get("threadId");

  if (isDemoMode) {
    return NextResponse.json({ threads: [], messages: [] });
  }

  try {
    const { prisma } = await import("@/lib/prisma");

    if (threadId) {
      const messages = await prisma.aiMessage.findMany({
        where: { threadId },
        orderBy: { createdAt: "asc" },
      });
      return NextResponse.json({ threadId, messages });
    }

    // List recent threads
    const threads = await prisma.aiThread.findMany({
      where: {
        practiceId: guard.practiceId || "default",
        status: "active",
      },
      orderBy: { lastMessageAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        persona: true,
        messageCount: true,
        lastMessageAt: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ threads });
  } catch (err) {
    console.error("[assistant] GET error:", err);
    return NextResponse.json({ threads: [], messages: [] });
  }
}

// ── Memory System ───────────────────────────────────────────────────

async function loadMemoryContext(practiceId: string | undefined): Promise<string> {
  if (isDemoMode || !practiceId) return "";

  try {
    const { prisma } = await import("@/lib/prisma");
    const memories = await prisma.aiMemory.findMany({
      where: {
        practiceId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: [{ accessCount: "desc" }, { updatedAt: "desc" }],
      take: 10,
    });

    if (memories.length === 0) return "";

    // Update access counts
    const ids = memories.map((m: { id: string }) => m.id);
    await prisma.aiMemory.updateMany({
      where: { id: { in: ids } },
      data: { accessCount: { increment: 1 }, lastUsedAt: new Date() },
    });

    const lines = memories.map((m: { key: string; value: string; category: string }) =>
      "- [" + m.category + "] " + m.key + ": " + m.value
    );
    return "\nREMEMBERED CONTEXT (from previous interactions):\n" + lines.join("\n");
  } catch {
    return "";
  }
}

async function autoSaveMemory(
  practiceId: string | undefined,
  userMessage: string,
  aiResponse: string,
  toolsUsed: string[],
): Promise<void> {
  if (isDemoMode || !practiceId) return;

  try {
    const { prisma } = await import("@/lib/prisma");

    // Save tool usage patterns as memory
    if (toolsUsed.length > 0) {
      const toolKey = "frequent_tools";
      const existing = await prisma.aiMemory.findUnique({
        where: { practiceId_persona_key: { practiceId, persona: "all", key: toolKey } },
      });

      if (existing) {
        // Parse existing tools, merge with new
        const existingTools: Record<string, number> = JSON.parse(existing.value || "{}");
        for (const tool of toolsUsed) {
          existingTools[tool] = (existingTools[tool] || 0) + 1;
        }
        await prisma.aiMemory.update({
          where: { id: existing.id },
          data: { value: JSON.stringify(existingTools), updatedAt: new Date() },
        });
      } else {
        const toolCounts: Record<string, number> = {};
        for (const tool of toolsUsed) toolCounts[tool] = 1;
        await prisma.aiMemory.create({
          data: {
            practiceId,
            persona: "all",
            key: toolKey,
            value: JSON.stringify(toolCounts),
            category: "pattern",
            source: "system",
          },
        });
      }
    }

    // Detect and save scheme preferences
    const schemeMatch = userMessage.match(/\b(Discovery|GEMS|Bonitas|Momentum|Medshield|Bestmed)\b/i);
    if (schemeMatch) {
      await prisma.aiMemory.upsert({
        where: { practiceId_persona_key: { practiceId, persona: "all", key: "preferred_scheme" } },
        update: { value: schemeMatch[1], updatedAt: new Date() },
        create: {
          practiceId,
          persona: "all",
          key: "preferred_scheme",
          value: schemeMatch[1],
          category: "preference",
          source: "agent",
        },
      });
    }
  } catch {
    // Memory save is best-effort — never block the response
  }
}

// ── UI Action Detection ─────────────────────────────────────────────
// Parses user intent to return navigation/activation commands
// The frontend can use these to open tools, navigate pages, start recordings

interface UIAction {
  type: "navigate" | "activate" | "show" | "highlight";
  target: string;
  label: string;
}

const ACTION_PATTERNS: Array<{ patterns: RegExp[]; action: UIAction }> = [
  // Navigation: pull up / show / open / take me to / go to / navigate to / bring up
  { patterns: [/(pull up|show|open|take me|go to|navigate|bring up).*(intake|clinical intake)/i], action: { type: "navigate", target: "/dashboard/intake", label: "Clinical Intake" } },
  { patterns: [/(pull up|show|open|take me|go to|navigate|bring up).*(scribe|recorder|recording)/i, /start.*(scribe|recording|consult)/i], action: { type: "navigate", target: "/dashboard/scribe", label: "AI Medical Scribe" } },
  { patterns: [/(pull up|show|open|take me|go to|navigate|bring up).*(claims|claim.?valid|claim.?analy)/i], action: { type: "navigate", target: "/dashboard/claims", label: "Claims Analyzer" } },
  { patterns: [/pull up.*(copilot|claims.?chat)/i, /show.*(copilot)/i, /ask.*about.*(icd|code|claim)/i], action: { type: "navigate", target: "/dashboard/claims-copilot", label: "Claims Copilot" } },
  { patterns: [/pull up.*(bridge|careon|hl7|fhir)/i, /show.*(bridge|careon)/i], action: { type: "navigate", target: "/dashboard/bridge", label: "CareOn Bridge" } },
  { patterns: [/pull up.*(switch|edifact|routing)/i, /show.*(switch)/i], action: { type: "navigate", target: "/dashboard/switching", label: "Switching Engine" } },
  { patterns: [/pull up.*(patient|patient.?list)/i, /show.*(patient)/i, /find.*patient/i], action: { type: "navigate", target: "/dashboard/patients", label: "Patient Records" } },
  { patterns: [/pull up.*(booking|calendar|schedule)/i, /show.*(booking|calendar)/i], action: { type: "navigate", target: "/dashboard/bookings", label: "Bookings" } },
  { patterns: [/pull up.*(checkin|check.?in|queue|waiting)/i, /show.*(queue|waiting)/i, /who.?s next/i], action: { type: "navigate", target: "/dashboard/checkin", label: "Check-in Queue" } },
  { patterns: [/pull up.*(billing|invoice)/i, /show.*(invoice|billing)/i], action: { type: "navigate", target: "/dashboard/billing", label: "Billing & Invoicing" } },
  { patterns: [/pull up.*(recall|follow.?up|remind)/i, /show.*(recall|overdue)/i], action: { type: "navigate", target: "/dashboard/recall", label: "Patient Recall" } },
  { patterns: [/pull up.*(daily|task|checklist|morning)/i, /show.*(daily|task)/i], action: { type: "navigate", target: "/dashboard/daily", label: "Daily Tasks" } },
  { patterns: [/pull up.*(document|referral|prescription|sick.?note)/i, /generate.*(document|letter|prescription)/i], action: { type: "navigate", target: "/dashboard/documents", label: "Document Generator" } },
  { patterns: [/pull up.*(notification|alert)/i, /show.*(notification)/i], action: { type: "navigate", target: "/dashboard/notifications", label: "Notifications" } },
  { patterns: [/pull up.*(referral)/i, /show.*(referral)/i], action: { type: "navigate", target: "/dashboard/referrals", label: "Referrals" } },
  { patterns: [/pull up.*(network|clinic|medicross)/i, /show.*(network|all.?clinic)/i], action: { type: "navigate", target: "/dashboard/network", label: "Network Command" } },
  { patterns: [/pull up.*(executive|sara|revenue|recovery)/i, /show.*(executive|dashboard)/i], action: { type: "navigate", target: "/dashboard/executive", label: "Executive Dashboard" } },
  { patterns: [/pull up.*(architecture|tech.?stack|api)/i, /show.*(architecture|tech)/i], action: { type: "navigate", target: "/dashboard/architecture", label: "Architecture" } },
  { patterns: [/pull up.*(governance|compliance|certif|king.?v|popia|sahpra)/i, /show.*(governance|compliance)/i], action: { type: "navigate", target: "/dashboard/ai-governance", label: "AI Governance" } },
  { patterns: [/pull up.*(resource|research|paper|document.?hub)/i, /show.*(resource|research)/i], action: { type: "navigate", target: "/dashboard/resources", label: "Resources & Research" } },
  { patterns: [/pull up.*(integration|map|ecosystem)/i, /show.*(integration|map)/i], action: { type: "navigate", target: "/dashboard/integration-map", label: "Integration Map" } },
  { patterns: [/pull up.*(pitch|presentation|deck)/i, /show.*(pitch|presentation)/i, /start.*(pitch|present)/i], action: { type: "navigate", target: "/dashboard/pitch", label: "Pitch Deck" } },
  { patterns: [/pull up.*(whatsapp|patient.?engage)/i, /show.*(whatsapp)/i], action: { type: "navigate", target: "/dashboard/whatsapp", label: "WhatsApp Router" } },
  { patterns: [/pull up.*(financial|fd|roi|ebitda)/i, /show.*(financial|roi)/i], action: { type: "navigate", target: "/dashboard/financial-director", label: "Financial Director View" } },
  { patterns: [/pull up.*(cio|travis|digital.?dividend)/i, /show.*(cio|digital)/i], action: { type: "navigate", target: "/dashboard/cio", label: "CIO Dashboard" } },
  { patterns: [/pull up.*(healthbridge|claims.?engine)/i, /show.*(healthbridge)/i], action: { type: "navigate", target: "/dashboard/healthbridge", label: "Healthbridge Claims" } },
  { patterns: [/pull up.*(assistant|help|agent)/i], action: { type: "navigate", target: "/dashboard/assistant", label: "AI Assistant" } },
  // Activation: start tools
  { patterns: [/start.*(consult|recording|scribe|listen)/i, /begin.*(consult|session)/i], action: { type: "activate", target: "scribe", label: "Start Recording" } },
  { patterns: [/start.*(validation|validat)/i, /run.*(validation|check)/i], action: { type: "activate", target: "claims-validate", label: "Run Claims Validation" } },
  // Show: highlight sections
  { patterns: [/show.*(chain|13.?step|full.?flow)/i, /how.*claim.*flow/i], action: { type: "navigate", target: "/dashboard/integration-map", label: "13-Step Claims Chain" } },
  { patterns: [/show.*(agent|all.?agent)/i], action: { type: "navigate", target: "/dashboard/integration-map", label: "AI Agents" } },
  { patterns: [/show.*(benchmark|result|accuracy|test)/i], action: { type: "navigate", target: "/dashboard/resources", label: "Benchmarks & Results" } },
];

function detectUIActions(userMessage: string, _aiResponse: string, _toolsUsed: string[]): UIAction[] {
  const actions: UIAction[] = [];

  for (const { patterns, action } of ACTION_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(userMessage)) {
        // Don't add duplicates
        if (!actions.find(a => a.target === action.target)) {
          actions.push(action);
        }
        break;
      }
    }
  }

  return actions;
}
