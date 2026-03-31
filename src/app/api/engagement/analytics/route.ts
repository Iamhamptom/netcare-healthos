import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

/** GET /api/engagement/analytics — Aggregated engagement metrics */
export async function GET(request: Request) {
  const guard = await guardRoute(request, "engagement-analytics");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({
      sequences: { active: 23, completed: 156, escalated: 4, paused: 2 },
      campaigns: { total: 8, active: 2, totalSent: 1240, totalResponded: 387, totalBooked: 198, overallResponseRate: "31.2%", overallBookingRate: "16.0%" },
      channels: { whatsapp: 892, email: 234, sms: 114 },
      chronicCare: { diabetesOverdue: 18, hypertensionOverdue: 12, screeningOverdue: 45 },
      engagement30d: { notifications: 1240, bookings: 198, newEnrollments: 34 },
      topSequences: [
        { name: "Post-Visit Follow-Up", enrollments: 156, completionRate: "84%" },
        { name: "Diabetes Care Pathway", enrollments: 42, completionRate: "67%" },
        { name: "Annual Screening Recall", enrollments: 89, completionRate: "52%" },
      ],
    });
  }

  const { prisma } = await import("@/lib/prisma");
  const pid = guard.practiceId;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

  const [
    activeEnrollments, completedEnrollments, escalatedEnrollments, pausedEnrollments,
    campaigns, channelBreakdown, bookings30d, notifications30d, newEnrollments30d,
  ] = await Promise.all([
    prisma.sequenceEnrollment.count({ where: { practiceId: pid, status: "active" } }),
    prisma.sequenceEnrollment.count({ where: { practiceId: pid, status: "completed" } }),
    prisma.sequenceEnrollment.count({ where: { practiceId: pid, status: "escalated" } }),
    prisma.sequenceEnrollment.count({ where: { practiceId: pid, status: "paused" } }),
    prisma.patientCampaign.findMany({ where: { practiceId: pid }, select: { status: true, sentCount: true, respondedCount: true, bookedCount: true } }),
    prisma.notification.groupBy({ by: ["type"], where: { practiceId: pid, sentAt: { gte: thirtyDaysAgo } }, _count: true }),
    prisma.booking.count({ where: { practiceId: pid, scheduledAt: { gte: thirtyDaysAgo } } }),
    prisma.notification.count({ where: { practiceId: pid, sentAt: { gte: thirtyDaysAgo } } }),
    prisma.sequenceEnrollment.count({ where: { practiceId: pid, startedAt: { gte: thirtyDaysAgo } } }),
  ]);

  const totalSent = campaigns.reduce((s, c) => s + c.sentCount, 0);
  const totalResponded = campaigns.reduce((s, c) => s + c.respondedCount, 0);
  const totalBooked = campaigns.reduce((s, c) => s + c.bookedCount, 0);

  return NextResponse.json({
    sequences: { active: activeEnrollments, completed: completedEnrollments, escalated: escalatedEnrollments, paused: pausedEnrollments },
    campaigns: {
      total: campaigns.length,
      active: campaigns.filter((c) => c.status === "sending" || c.status === "scheduled").length,
      totalSent, totalResponded, totalBooked,
      overallResponseRate: totalSent > 0 ? ((totalResponded / totalSent) * 100).toFixed(1) + "%" : "0%",
      overallBookingRate: totalSent > 0 ? ((totalBooked / totalSent) * 100).toFixed(1) + "%" : "0%",
    },
    channels: Object.fromEntries(channelBreakdown.map((c) => [c.type, c._count])),
    engagement30d: { notifications: notifications30d, bookings: bookings30d, newEnrollments: newEnrollments30d },
  });
}
