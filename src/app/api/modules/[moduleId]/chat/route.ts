export const maxDuration = 60;

import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoPractice } from "@/lib/demo-data";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { runIntelligence, COMMAND_ASSISTANT, buildCorrectionContext } from "@/lib/ai";
import { moduleRegistry } from "@/lib/modules/registry";
import type { ModuleDefinition } from "@/lib/modules/types";

/**
 * POST /api/modules/[moduleId]/chat — Module-scoped agent chat
 *
 * Same super-agent (COMMAND_ASSISTANT with ALL tools), but with
 * module-specific context injected into the system prompt.
 *
 * Body: { message: string, threadId?: string }
 * Returns: { reply, threadId, toolsUsed, provider, stepsUsed, actions, module }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  const { moduleId } = await params;
  const guard = await guardRoute(request, "module-agent", { limit: 20 });
  if (isErrorResponse(guard)) return guard;

  const mod = moduleRegistry.getModule(moduleId);
  if (!mod) {
    return NextResponse.json({ error: `Module "${moduleId}" not found` }, { status: 404 });
  }

  const body = await request.json();
  const message = body.message;
  const threadId = body.threadId;

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "message string required" }, { status: 400 });
  }

  // Get practice context
  let practiceName = demoPractice.name;
  let practiceType = demoPractice.type;
  let userName = "User";
  let userRole = "admin";
  let practiceId = guard.practiceId;

  if (isDemoMode) {
    const { demoUsers, demoUser: defaultDemoUser } = await import("@/lib/demo-data");
    const sessionUser = Object.values(demoUsers).find((u: any) => u.id === guard.user?.id) || defaultDemoUser;
    userName = (sessionUser as any).name;
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
    const moduleContext = buildModuleContext(mod);

    const extraContext = [
      `You are talking to ${userName} (${userRole}) at ${practiceName} (${practiceType} practice).`,
      moduleContext,
      corrections,
    ].filter(Boolean).join("\n\n");

    // Thread handling
    let history: Array<{ role: "user" | "model"; content: string }> = [];
    let resolvedThreadId = threadId;

    if (!isDemoMode) {
      const { prisma } = await import("@/lib/prisma");

      // Create thread if none provided
      if (!resolvedThreadId) {
        const thread = await prisma.aiThread.create({
          data: {
            practiceId: practiceId || "default",
            userId: guard.user?.id,
            persona: `module-${moduleId}`,
            title: message.slice(0, 80),
          },
        });
        resolvedThreadId = thread.id;
      }

      // Save user message
      await prisma.aiMessage.create({
        data: { threadId: resolvedThreadId, role: "user", content: message },
      });

      // Load history (last 20 messages)
      const dbMessages = await prisma.aiMessage.findMany({
        where: { threadId: resolvedThreadId },
        orderBy: { createdAt: "asc" },
        take: 20,
      });
      history = dbMessages.slice(0, -1).map((m: { role: string; content: string }) => ({
        role: m.role === "user" ? ("user" as const) : ("model" as const),
        content: m.content,
      }));

      await prisma.aiThread.update({
        where: { id: resolvedThreadId },
        data: { messageCount: { increment: 1 }, lastMessageAt: new Date() },
      });
    } else {
      resolvedThreadId = resolvedThreadId || "demo-" + Date.now();
    }

    const result = await runIntelligence({
      persona: COMMAND_ASSISTANT,
      message,
      history,
      extraContext,
      practiceId,
      isDemoMode,
      maxSteps: 10,
    });

    // Persist assistant response
    if (!isDemoMode && resolvedThreadId) {
      try {
        const { prisma } = await import("@/lib/prisma");
        await prisma.aiMessage.create({
          data: {
            threadId: resolvedThreadId,
            role: "assistant",
            content: result.response,
            toolsUsed: result.toolsUsed.length > 0 ? JSON.stringify(result.toolsUsed) : null,
            provider: result.provider,
            stepsUsed: result.stepsUsed,
          },
        });
        await prisma.aiThread.update({
          where: { id: resolvedThreadId },
          data: { messageCount: { increment: 1 }, lastMessageAt: new Date() },
        });
      } catch (err) {
        console.error("[module-agent] Failed to persist response:", err);
      }
    }

    return NextResponse.json({
      reply: result.response,
      threadId: resolvedThreadId,
      toolsUsed: result.toolsUsed,
      provider: result.provider,
      stepsUsed: result.stepsUsed,
      module: {
        id: mod.id,
        name: mod.name,
      },
    });
  } catch (err) {
    console.error(`[module-agent:${moduleId}] Error:`, err);
    return NextResponse.json({
      reply: "Sorry, I hit an error. Please try again or rephrase your request.",
      toolsUsed: [],
    });
  }
}

/**
 * GET /api/modules/[moduleId]/chat?threadId=xxx — Load thread history
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  const { moduleId } = await params;
  const guard = await guardRoute(request, "module-agent", { limit: 30 });
  if (isErrorResponse(guard)) return guard;

  const mod = moduleRegistry.getModule(moduleId);
  if (!mod) {
    return NextResponse.json({ error: `Module "${moduleId}" not found` }, { status: 404 });
  }

  if (isDemoMode) {
    return NextResponse.json({ threads: [], messages: [], module: { id: mod.id, name: mod.name } });
  }

  const { searchParams } = new URL(request.url);
  const threadId = searchParams.get("threadId");

  try {
    const { prisma } = await import("@/lib/prisma");

    if (threadId) {
      const messages = await prisma.aiMessage.findMany({
        where: { threadId },
        orderBy: { createdAt: "asc" },
      });
      return NextResponse.json({ threadId, messages, module: { id: mod.id, name: mod.name } });
    }

    // List recent threads for this module
    const threads = await prisma.aiThread.findMany({
      where: {
        practiceId: guard.practiceId || "default",
        persona: `module-${moduleId}`,
        status: "active",
      },
      orderBy: { lastMessageAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        messageCount: true,
        lastMessageAt: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ threads, module: { id: mod.id, name: mod.name } });
  } catch (err) {
    console.error(`[module-agent:${moduleId}] GET error:`, err);
    return NextResponse.json({ threads: [], messages: [] });
  }
}

/* ─── Module Context Builder ─── */

function buildModuleContext(mod: ModuleDefinition): string {
  const connectedIntegrations = mod.integrations
    .filter((i) => i.status === "connected")
    .map((i) => i.name)
    .join(", ");

  const needsSetup = mod.integrations
    .filter((i) => i.status === "needs_setup")
    .map((i) => `${i.name} (${i.fallback})`)
    .join(", ");

  return `MODULE CONTEXT — ${mod.name.toUpperCase()}
You are currently operating inside the "${mod.name}" module.
${mod.description}

YOUR SCOPE IN THIS MODULE:
${mod.agentContext.scope}

YOUR CAPABILITIES IN THIS MODULE:
${mod.agentContext.capabilities.map((c) => `- ${c}`).join("\n")}

${mod.agentContext.priorityTools ? `PRIORITY TOOLS (use these first when relevant):\n${mod.agentContext.priorityTools.map((t) => `- ${t}`).join("\n")}` : ""}

CONNECTED INTEGRATIONS: ${connectedIntegrations || "None"}
${needsSetup ? `NEEDS SETUP: ${needsSetup}` : "ALL INTEGRATIONS CONNECTED"}

NAVIGATION: The user is in the ${mod.name} module. When suggesting actions, reference pages within this module:
${mod.pages.map((p) => `- ${p.label}: ${p.href}`).join("\n")}

BEHAVIOR:
- Prioritize actions relevant to ${mod.name.toLowerCase()} workflows
- You CAN access tools from other modules if needed (you are the super-agent)
- But default to this module's context first
- If the user asks about something outside this module, help them but mention which module it belongs to`;
}
