/**
 * POST /api/intake/analyze
 * Takes a transcript and returns structured clinical intake data.
 */

import { NextResponse } from "next/server";
import { analyzeIntakeTranscript } from "@/lib/intake-analyzer";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const rl = rateLimit(`intake-analyze:${ip}`, { limit: 20, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { transcript, patientId } = body;

    if (!transcript || typeof transcript !== "string" || transcript.trim().length < 20) {
      return NextResponse.json(
        { error: "Transcript must be at least 20 characters" },
        { status: 400 }
      );
    }

    const analysis = await analyzeIntakeTranscript(transcript);

    return NextResponse.json({
      analysis,
      patientId: patientId || null,
      analyzedAt: new Date().toISOString(),
      transcriptLength: transcript.length,
      model: "gemini-2.0-flash",
    });
  } catch (err) {
    console.error("[intake/analyze] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
