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
    userName = "Dr. Sarah Mitchell";
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

    return NextResponse.json({
      reply: result.response,
      threadId,
      toolsUsed: result.toolsUsed,
      provider: result.provider,
      stepsUsed: result.stepsUsed,
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
