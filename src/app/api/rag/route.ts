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

  // Try RAG v3 (Supabase pgvector, 189K chunks) first, fallback to v2
  let context = "";
  let sources: Record<string, string[]> = {};
  let metrics: Record<string, unknown> = {};
  let version = "v2";
  try {
    const ragV3 = await import("@/lib/rag-v3");
    const v3Result = await ragV3.retrieveWithMetrics(query);
    context = v3Result.context;
    sources = v3Result.sources;
    version = "v3";
  } catch {
    const v2Result = retrieveWithMetrics(query);
    context = v2Result.context;
    sources = v2Result.sources;
    metrics = v2Result.metrics;
  }
  return NextResponse.json({
    query,
    context,
    sources,
    metrics,
    version,
    chunks: Object.keys(sources).length,
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
