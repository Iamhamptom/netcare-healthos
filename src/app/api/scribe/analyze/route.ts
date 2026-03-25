import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { generateSOAP } from "@/lib/scribe/soap-generator";

export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, "scribe-analyze", { limit: 20 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { transcript, patientContext } = body;

    if (!transcript || typeof transcript !== "string" || transcript.trim().length < 20) {
      return NextResponse.json(
        { error: "Transcript must be at least 20 characters" },
        { status: 400 }
      );
    }

    const analysis = await generateSOAP(transcript, patientContext);

    return NextResponse.json({
      analysis,
      analyzedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[scribe/analyze] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
