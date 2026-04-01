import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { sanitize } from "@/lib/validate";
import { runAgent } from "@/lib/agents";

/**
 * Front Desk AI Agent — Handles all front desk operations via natural language.
 *
 * POST: Send a message to the front desk agent and get a response with actions.
 */

export async function POST(request: Request) {
  const guard = await guardRoute(request, "front-desk-agent", { roles: ["admin", "receptionist", "nurse"] });
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  const { message, history } = body as {
    message: string;
    history?: { role: string; content: string }[];
  };

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const sanitized = sanitize(message);

  try {
    const result = await runAgent("frontdesk", sanitized, {
      practiceId: guard.practiceId,
      history: history?.slice(-10), // Keep last 10 messages for context
      isDemoMode: isDemoMode,
    });

    return NextResponse.json({
      response: result.response,
      actions: result.actions,
      confidence: result.confidence,
      escalate: result.escalate,
      toolsUsed: result.toolsUsed,
      provider: result.provider,
    });
  } catch (err) {
    console.error("[front-desk-agent] Error:", err);
    return NextResponse.json(
      { error: "Agent encountered an error. Please try again.", response: "I'm sorry, I encountered an issue. Please try your request again or contact support." },
      { status: 500 },
    );
  }
}
