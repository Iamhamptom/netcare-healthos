import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { recordHealthEvent } from "@/lib/ml/system-hooks";

/** POST /api/engagement/run — Invoke the Engagement Agent with a natural language task */
export async function POST(request: Request) {
  const guard = await guardRoute(request, "engagement-run", { limit: 10 });
  if (isErrorResponse(guard)) return guard;

  const { message, practiceId: overridePracticeId } = await request.json();
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const practiceId = overridePracticeId || guard.practiceId;

  if (isDemoMode) {
    return NextResponse.json({
      response: `[DEMO] Engagement Agent received: "${message}". In production, this would execute tools to manage sequences, campaigns, chronic care gaps, and patient communications.`,
      toolsUsed: [],
      provider: "none",
      stepsUsed: 0,
    });
  }

  try {
    const { engagementAgent } = await import("@/lib/agents/engagement-agent");

    const result = await engagementAgent.generate({
      prompt: `Practice ID: ${practiceId}\n\nTask: ${message}`,
    });

    const toolsUsed = Array.isArray(result.toolCalls) ? result.toolCalls.map((tc: { toolName?: string }) => tc.toolName ?? "unknown") : [];
    const stepsUsed = Array.isArray(result.steps) ? result.steps.length : 0;

    // Record learning event
    recordHealthEvent("engagement", "agent_run", {
      task: message.slice(0, 200),
      toolsUsed,
      stepsUsed,
      practiceId,
    });

    return NextResponse.json({
      response: result.text || String(result),
      toolsUsed,
      provider: "gemini",
      stepsUsed,
    });
  } catch (err) {
    console.error("[engagement-agent] Error:", err);
    return NextResponse.json({
      response: `Engagement agent error: ${err instanceof Error ? err.message : String(err)}`,
      toolsUsed: [],
      provider: "none",
      stepsUsed: 0,
    }, { status: 500 });
  }
}
