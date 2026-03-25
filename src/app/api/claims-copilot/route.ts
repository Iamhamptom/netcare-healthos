import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { runIntelligence, CLAIMS_COPILOT, recordFeedback, buildCorrectionContext } from "@/lib/ai";

/**
 * POST /api/claims-copilot — Expert claims AI co-pilot
 *
 * Powered by the unified intelligence engine:
 * - RAG-enriched with full SA healthcare KB (41K ICD-10 codes, scheme rules, fraud detection)
 * - Tool access: ICD-10 lookup, medicine search, claim validation, fraud detection, KB search
 * - Learned corrections from past interactions
 * - Dual-provider (Gemini primary, Claude fallback)
 */
export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, "claims-copilot", { limit: 30, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json();
  const message = String(body.message || "").trim();
  const history = (body.history || []) as { role: string; content: string }[];
  const context = body.context as { claimData?: string; scheme?: string; mode?: string } | undefined;

  if (!message) return NextResponse.json({ error: "Missing message" }, { status: 400 });
  if (message.length > 5000) return NextResponse.json({ error: "Message too long" }, { status: 400 });

  // Build extra context from claim data and corrections
  const parts: string[] = [];
  if (context?.claimData) parts.push(`CURRENT CLAIM DATA:\n${context.claimData}`);
  if (context?.scheme) parts.push(`SELECTED SCHEME: ${context.scheme}`);
  const corrections = buildCorrectionContext("claims-copilot");
  if (corrections) parts.push(corrections);

  const result = await runIntelligence({
    persona: CLAIMS_COPILOT,
    message,
    history: history.slice(-20).map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("model" as const),
      content: m.content,
    })),
    extraContext: parts.join("\n\n"),
    ragCategory: "claims",
    maxSteps: 10,
  });

  return NextResponse.json({
    reply: result.response,
    toolsUsed: result.toolsUsed,
    provider: result.provider,
    source: result.provider, // Backward compat
  });
}

/** PUT /api/claims-copilot — Submit feedback */
export async function PUT(request: Request) {
  const rl = await rateLimitByIp(request, "claims-copilot-fb", { limit: 30, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await request.json();
  const id = await recordFeedback({
    persona: "claims-copilot",
    query: String(body.query || ""),
    response: String(body.response || ""),
    type: body.type || "thumbs_up",
    correctedResponse: body.correctedResponse,
  });

  return NextResponse.json({ success: true, feedbackId: id });
}
