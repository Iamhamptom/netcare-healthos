import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { retrieveWithMetrics, logFeedback, getStats, getMetrics } from "@/lib/rag";

/** POST /api/rag — RAG retrieval with metrics */
export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, "rag", { limit: 60, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const body = await request.json();
  const query = String(body.query || "").trim();
  if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });

  // Check if this is a feedback submission
  if (body.feedback) {
    logFeedback(
      query,
      body.docIds || [],
      body.feedback as "positive" | "negative" | "correction",
      body.correction
    );
    return NextResponse.json({ status: "feedback_logged" });
  }

  const result = retrieveWithMetrics(query);
  return NextResponse.json({
    query,
    context: result.context,
    sources: result.sources,
    metrics: result.metrics,
    docIds: result.docIds,
  });
}

/** GET /api/rag — RAG stats + retrieval metrics */
export async function GET() {
  const stats = getStats();
  const metrics = getMetrics();
  return NextResponse.json({
    status: "ok",
    version: "v2-vercel",
    ...stats,
    retrieval_metrics: metrics,
  });
}
