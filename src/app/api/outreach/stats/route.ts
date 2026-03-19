import { NextResponse } from "next/server";
import { guardPlatformAdmin, isErrorResponse } from "@/lib/api-helpers";

export async function GET(request: Request) {
  const guard = await guardPlatformAdmin(request, "outreach-stats");
  if (isErrorResponse(guard)) return guard;

  const { prisma } = await import("@/lib/prisma");

  const [campaigns, targets, emails] = await Promise.all([
    prisma.outreachCampaign.findMany({
      select: {
        id: true, name: true, segment: true, status: true,
        targetCount: true, sentCount: true, openCount: true,
        responseCount: true, meetingCount: true, conversionCount: true,
      },
    }),
    prisma.outreachTarget.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.outreachEmail.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const targetStatusMap = Object.fromEntries(targets.map(t => [t.status, t._count]));
  const emailStatusMap = Object.fromEntries(emails.map(e => [e.status, e._count]));

  const totalTargets = Object.values(targetStatusMap).reduce((s, c) => s + c, 0);
  const totalSent = (emailStatusMap.sent || 0) + (emailStatusMap.delivered || 0) + (emailStatusMap.opened || 0);
  const totalOpened = emailStatusMap.opened || 0;
  const totalResponded = targetStatusMap.responded || 0;
  const totalMeetings = targetStatusMap.meeting_booked || 0;
  const totalConverted = targetStatusMap.converted || 0;

  // Follow-ups due
  const followUpsDue = await prisma.outreachTarget.count({
    where: {
      nextFollowUpAt: { lte: new Date() },
      status: { in: ["sent", "opened"] },
    },
  });

  return NextResponse.json({
    overview: {
      totalTargets,
      totalSent,
      totalOpened,
      openRate: totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0,
      totalResponded,
      responseRate: totalSent > 0 ? Math.round((totalResponded / totalSent) * 100) : 0,
      totalMeetings,
      totalConverted,
      conversionRate: totalTargets > 0 ? Math.round((totalConverted / totalTargets) * 100) : 0,
      followUpsDue,
    },
    campaigns,
    targetsByStatus: targetStatusMap,
    emailsByStatus: emailStatusMap,
  });
}
