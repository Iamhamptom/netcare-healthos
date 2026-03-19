import { NextResponse } from "next/server";
import { guardPlatformAdmin, isErrorResponse } from "@/lib/api-helpers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await guardPlatformAdmin(request, "outreach-target-detail");
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;
  const { prisma } = await import("@/lib/prisma");
  const target = await prisma.outreachTarget.findUnique({
    where: { id },
    include: {
      campaign: { select: { name: true, segment: true, emailTemplateKey: true } },
      emails: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!target) {
    return NextResponse.json({ error: "Target not found" }, { status: 404 });
  }

  return NextResponse.json({ target });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await guardPlatformAdmin(request, "outreach-target-update");
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;
  const body = await request.json();

  const allowedFields = [
    "name", "title", "organization", "email", "phone", "linkedinUrl",
    "segment", "priority", "status", "personalizationData",
    "lastEmailSentAt", "followUpStep", "nextFollowUpAt", "notes",
  ];
  const data: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  if (data.lastEmailSentAt) data.lastEmailSentAt = new Date(data.lastEmailSentAt as string);
  if (data.nextFollowUpAt) data.nextFollowUpAt = new Date(data.nextFollowUpAt as string);

  const { prisma } = await import("@/lib/prisma");
  const target = await prisma.outreachTarget.update({
    where: { id },
    data,
  });

  // Update campaign counters based on status changes
  if (body.status) {
    const campaign = await prisma.outreachCampaign.findUnique({
      where: { id: target.campaignId },
    });
    if (campaign) {
      const counts = await prisma.outreachTarget.groupBy({
        by: ["status"],
        where: { campaignId: target.campaignId },
        _count: true,
      });
      const countMap = Object.fromEntries(counts.map(c => [c.status, c._count]));
      await prisma.outreachCampaign.update({
        where: { id: target.campaignId },
        data: {
          sentCount: (countMap.sent || 0) + (countMap.opened || 0) + (countMap.responded || 0) + (countMap.meeting_booked || 0) + (countMap.converted || 0),
          openCount: (countMap.opened || 0) + (countMap.responded || 0) + (countMap.meeting_booked || 0) + (countMap.converted || 0),
          responseCount: (countMap.responded || 0) + (countMap.meeting_booked || 0) + (countMap.converted || 0),
          meetingCount: (countMap.meeting_booked || 0) + (countMap.converted || 0),
          conversionCount: countMap.converted || 0,
        },
      });
    }
  }

  return NextResponse.json({ target });
}
