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
      return NextResponse.json(getLearningMetrics());
    }

    if (action === "analyze") {
      return NextResponse.json(analyzePatterns());
    }

    if (action === "cycle") {
      const result = await runLearningCycle();
      return NextResponse.json(result);
    }

    return NextResponse.json({
      metrics: getLearningMetrics(),
      actions: ["metrics", "analyze", "cycle"],
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
