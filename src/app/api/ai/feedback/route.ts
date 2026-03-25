import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import {
  recordFeedback,
  getRecentFeedback,
  getPersonaQuality,
  getToolMetrics,
  boostRAGDocs,
  penalizeRAGDocs,
} from "@/lib/ai";

/**
 * POST /api/ai/feedback — Record AI interaction feedback
 *
 * Body:
 *   persona: string — which agent (e.g., "claims-copilot", "patient-chatbot")
 *   query: string — the user's original question
 *   response: string — the AI's response
 *   type: "thumbs_up" | "thumbs_down" | "correction" | "escalation"
 *   correctedResponse?: string — the correct answer (if type = correction)
 *   ragDocIds?: string[] — RAG document IDs used in the response
 *   practiceId?: string
 */
export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, "ai-feedback", { limit: 30, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await request.json();

  if (!body.persona || !body.query || !body.type) {
    return NextResponse.json({ error: "Missing required fields: persona, query, type" }, { status: 400 });
  }

  const validTypes = ["thumbs_up", "thumbs_down", "correction", "escalation"];
  if (!validTypes.includes(body.type)) {
    return NextResponse.json({ error: `Invalid type. Must be one of: ${validTypes.join(", ")}` }, { status: 400 });
  }

  // Record the feedback
  const feedbackId = await recordFeedback({
    persona: body.persona,
    query: body.query,
    response: body.response || "",
    type: body.type,
    correctedResponse: body.correctedResponse,
    ragDocIds: body.ragDocIds,
    practiceId: body.practiceId,
  });

  // Adjust RAG document scores based on feedback
  if (body.ragDocIds?.length) {
    if (body.type === "thumbs_up") boostRAGDocs(body.ragDocIds);
    if (body.type === "thumbs_down" || body.type === "correction") penalizeRAGDocs(body.ragDocIds);
  }

  return NextResponse.json({ success: true, feedbackId });
}

/**
 * GET /api/ai/feedback — Get AI quality metrics
 *
 * Query params:
 *   ?persona=claims-copilot  — Get quality for specific persona
 *   ?metrics=tools            — Get tool reliability metrics
 *   ?recent=50               — Get N most recent feedback entries
 */
export async function GET(request: Request) {
  const rl = await rateLimitByIp(request, "ai-feedback-read", { limit: 20, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const url = new URL(request.url);
  const persona = url.searchParams.get("persona");
  const metrics = url.searchParams.get("metrics");
  const recent = parseInt(url.searchParams.get("recent") || "0");

  const result: Record<string, unknown> = {};

  if (persona) {
    result.quality = getPersonaQuality(persona);
  }

  if (metrics === "tools") {
    result.toolMetrics = getToolMetrics();
  }

  if (recent > 0) {
    result.recentFeedback = getRecentFeedback(Math.min(recent, 100));
  }

  // If no specific query, return overview
  if (!persona && !metrics && !recent) {
    const personas = ["command-assistant", "patient-chatbot", "claims-copilot", "triage-agent", "whatsapp-agent"];
    result.overview = personas.map((p) => ({ persona: p, ...getPersonaQuality(p) }));
    result.toolMetrics = getToolMetrics();
    result.recentCount = getRecentFeedback(100).length;
  }

  return NextResponse.json(result);
}
