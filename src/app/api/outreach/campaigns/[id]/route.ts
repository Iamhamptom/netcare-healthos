import { NextResponse } from "next/server";
import { guardPlatformAdmin, isErrorResponse } from "@/lib/api-helpers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await guardPlatformAdmin(request, "outreach-campaign-detail");
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;
  const { prisma } = await import("@/lib/prisma");
  const campaign = await prisma.outreachCampaign.findUnique({
    where: { id },
    include: {
      targets: { orderBy: { priority: "asc" } },
      emails: { orderBy: { createdAt: "desc" }, take: 50 },
      _count: { select: { targets: true, emails: true } },
    },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  return NextResponse.json({ campaign });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await guardPlatformAdmin(request, "outreach-campaign-update");
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;
  const body = await request.json();

  const allowedFields = [
    "name", "segment", "description", "status", "emailTemplateKey",
    "followUpCadence", "notes", "startDate", "endDate",
    "targetCount", "sentCount", "openCount", "responseCount",
    "meetingCount", "conversionCount",
  ];
  const data: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  if (data.startDate) data.startDate = new Date(data.startDate as string);
  if (data.endDate) data.endDate = new Date(data.endDate as string);

  const { prisma } = await import("@/lib/prisma");
  const campaign = await prisma.outreachCampaign.update({
    where: { id },
    data,
  });

  return NextResponse.json({ campaign });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await guardPlatformAdmin(request, "outreach-campaign-delete");
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;
  const { prisma } = await import("@/lib/prisma");
  await prisma.outreachCampaign.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
