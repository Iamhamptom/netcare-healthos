import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { retrieve, getStats } from "@/lib/rag";

/** POST /api/rag — RAG retrieval endpoint */
export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, "rag", { limit: 60, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const body = await request.json();
  const query = String(body.query || "").trim();
  if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });

  const { context, sources } = retrieve(query);
  return NextResponse.json({ query, context, sources });
}

/** GET /api/rag — RAG stats */
export async function GET() {
  const stats = getStats();
  return NextResponse.json({ status: "ok", version: "v2-vercel", ...stats });
}
