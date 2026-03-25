import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoPractice } from "@/lib/demo-data";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { runIntelligence, COMMAND_ASSISTANT, buildCorrectionContext } from "@/lib/ai";

/**
 * POST /api/assistant — Command Assistant (auth required)
 *
 * The full-access dashboard AI. Powered by the unified intelligence engine:
 * - ALL tools (patients, bookings, billing, claims, KB, comms)
 * - RAG-enriched with 300MB SA healthcare knowledge base
 * - Learns from corrections via feedback loop
 * - Dual-provider (Gemini primary, Claude fallback)
 */
export async function POST(request: Request) {
  const guard = await guardRoute(request, "assistant", { limit: 25 });
  if (isErrorResponse(guard)) return guard;

  const { messages } = await request.json();
  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: "messages array required" }, { status: 400 });
  }

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
    // Build enriched persona with user context and learned corrections
    const corrections = buildCorrectionContext("command-assistant");
    const userContext = `You are talking to ${userName} (${userRole}) at ${practiceName} (${practiceType} practice).${corrections}`;

    // Extract the last user message and build history
    const lastUserMsg = messages.filter((m: { role: string }) => m.role === "user").pop();
    const message = typeof lastUserMsg?.content === "string" ? lastUserMsg.content : "";
    const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? ("user" as const) : ("model" as const),
      content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
    }));

    const result = await runIntelligence({
      persona: COMMAND_ASSISTANT,
      message,
      history,
      extraContext: userContext,
      practiceId,
      isDemoMode,
      maxSteps: 10,
    });

    return NextResponse.json({
      reply: result.response,
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
