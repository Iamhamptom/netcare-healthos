export const maxDuration = 60;
import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { isDemoMode } from "@/lib/is-demo";
import { runIntelligence, createPatientChatbot, recordFeedback } from "@/lib/ai";

/**
 * POST /api/chatbot — Patient-facing chatbot (public, no auth)
 *
 * Powered by the unified intelligence engine:
 * - RAG-enriched with SA healthcare knowledge base
 * - Can book appointments, look up practice info, triage symptoms
 * - Medical term awareness, POPIA compliant
 * - Feedback loop for continuous improvement
 */
export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, "chatbot", { limit: 20, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await request.json();
  const message = String(body.message || "").trim();
  const history = (body.history || []) as { role: string; content: string }[];
  const practiceId = body.practiceId as string | undefined;

  if (!message) return NextResponse.json({ error: "Missing message" }, { status: 400 });
  if (message.length > 2000) return NextResponse.json({ error: "Message too long" }, { status: 400 });

  // Build practice-specific persona (defaults to demo practice)
  const persona = createPatientChatbot(
    body.practiceName || "Smile Dental — Sandton",
    body.practiceType || "dental",
    body.practiceHours || "Mon-Fri 8:00-17:00, Sat 8:00-13:00",
    body.practicePhone || "+27 11 783 4500",
    body.practiceAddress || "45 Rivonia Rd, Sandton, 2196",
  );

  const result = await runIntelligence({
    persona,
    message,
    history: history.slice(-15).map((m) => ({
      role: m.role === "user" ? "user" as const : "model" as const,
      content: m.content,
    })),
    practiceId,
    isDemoMode,
    extraContext: body.practiceServices
      ? `SERVICES OFFERED: ${body.practiceServices}`
      : "SERVICES: General consultations, procedures, chronic disease management, vaccinations, scripts",
  });

  return NextResponse.json({
    reply: result.response,
    toolsUsed: result.toolsUsed,
    provider: result.provider,
  });
}

/**
 * POST feedback for a chatbot response
 * PUT /api/chatbot — Submit thumbs up/down or correction
 */
export async function PUT(request: Request) {
  const rl = await rateLimitByIp(request, "chatbot-feedback", { limit: 30, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await request.json();
  const id = await recordFeedback({
    persona: "patient-chatbot",
    query: String(body.query || ""),
    response: String(body.response || ""),
    type: body.type || "thumbs_up",
    correctedResponse: body.correctedResponse,
    practiceId: body.practiceId,
  });

  return NextResponse.json({ success: true, feedbackId: id });
}
