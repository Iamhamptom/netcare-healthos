import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

/** POST /api/engagement/campaigns/[id]/send — Execute campaign sends */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardRoute(request, "engagement-campaign-send", { limit: 5 });
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;

  if (isDemoMode) {
    return NextResponse.json({ campaignId: id, sent: 0, message: "Demo mode — no messages sent" });
  }

  const { prisma } = await import("@/lib/prisma");
  const campaign = await prisma.patientCampaign.findFirst({
    where: { id, practiceId: guard.practiceId },
  });

  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  if (campaign.status === "completed") return NextResponse.json({ error: "Campaign already completed" }, { status: 400 });

  // Set to scheduled for immediate processing
  await prisma.patientCampaign.update({
    where: { id },
    data: { status: "scheduled", scheduledAt: new Date() },
  });

  const { processScheduledCampaigns } = await import("@/lib/engagement/sequence-engine");
  const results = await processScheduledCampaigns(guard.practiceId);
  const result = results.find((r) => r.campaignId === id);

  return NextResponse.json({
    campaignId: id,
    sent: result?.sent ?? 0,
    message: `Campaign sending complete`,
  });
}
