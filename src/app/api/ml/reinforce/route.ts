// GET /api/ml/reinforce — Run daily learning cycle (triggered by Vercel cron)
// POST /api/ml/reinforce — Get current learning metrics

import { NextResponse } from "next/server";
import { runLearningCycle, getLearningMetrics, analyzePatterns } from "@/lib/ml/reinforcement";

export async function GET(req: Request) {
  // Verify cron secret for automated runs
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runLearningCycle();

    return NextResponse.json({
      status: "complete",
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Learning cycle failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action } = body as { action?: string };

    if (action === "metrics") {
      return NextResponse.json(await getLearningMetrics());
    }

    if (action === "analyze") {
      return NextResponse.json(analyzePatterns());
    }

    if (action === "cycle") {
      const result = await runLearningCycle();
      return NextResponse.json(result);
    }

    if (action === "status") {
      const metrics = await getLearningMetrics();
      return NextResponse.json({
        status: "operational",
        metrics,
        persistence: "supabase:ho_learning_events",
        cron: "0 4 * * * (daily)",
        triggers: [
          "claims_analyzer:validation_complete",
          "healthbridge:claim_response",
          "switching_engine:claim_outcome",
          "whatsapp_router:message_received",
          "whatsapp_router:triage_completed",
          "billing:payment_success",
          "patient_records:record_created",
          "claims_analyzer:geo_fraud_scan",
        ],
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      metrics: await getLearningMetrics(),
      actions: ["metrics", "analyze", "cycle", "status"],
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
