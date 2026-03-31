import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";

/** GET /api/engagement/cron — Vercel Cron: process sequences, triggers, campaigns
 *  Schedule: every 15 minutes (vercel.json)
 */
export async function GET(request: Request) {
  // Auth: Vercel Cron secret or gateway key
  const auth = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const gatewayKey = process.env.HEALTHOPS_GATEWAY_KEY || process.env.VISIO_GATEWAY_KEY;

  const isAuthed =
    (cronSecret && auth === `Bearer ${cronSecret}`) ||
    (gatewayKey && auth === `Bearer ${gatewayKey}`);

  if (!isAuthed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isDemoMode) {
    return NextResponse.json({
      sequences: { processed: 0 },
      triggers: { enrolled: 0 },
      campaigns: { sent: 0 },
      message: "Demo mode — no engagement actions executed",
    });
  }

  const {
    processDueSteps,
    evaluateAutoTriggers,
    processScheduledCampaigns,
  } = await import("@/lib/engagement/sequence-engine");

  const [sequences, campaigns] = await Promise.allSettled([
    processDueSteps(),
    processScheduledCampaigns(),
  ]);

  // Auto-triggers: evaluate for all practices (get distinct practiceIds from active sequences)
  let triggersEnrolled = 0;
  try {
    const { prisma } = await import("@/lib/prisma");
    const practices = await prisma.engagementSequence.findMany({
      where: { active: true },
      select: { practiceId: true },
      distinct: ["practiceId"],
    });
    for (const p of practices) {
      triggersEnrolled += await evaluateAutoTriggers(p.practiceId);
    }
  } catch (err) {
    console.error("[engagement-cron] Auto-trigger error:", err);
  }

  return NextResponse.json({
    sequences: sequences.status === "fulfilled"
      ? { processed: sequences.value.length, results: sequences.value }
      : { error: String(sequences.reason) },
    triggers: { enrolled: triggersEnrolled },
    campaigns: campaigns.status === "fulfilled"
      ? { processed: campaigns.value.length, results: campaigns.value }
      : { error: String(campaigns.reason) },
    message: "Engagement cron completed",
  });
}
