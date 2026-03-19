import { NextResponse } from "next/server";
import { guardPlatformAdmin, isErrorResponse } from "@/lib/api-helpers";

export async function GET(request: Request) {
  const guard = await guardPlatformAdmin(request, "outreach-targets");
  if (isErrorResponse(guard)) return guard;

  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("campaignId");
  const status = searchParams.get("status");
  const segment = searchParams.get("segment");
  const dueSoon = searchParams.get("dueSoon"); // "true" = nextFollowUpAt <= now

  const where: Record<string, unknown> = {};
  if (campaignId) where.campaignId = campaignId;
  if (status) where.status = status;
  if (segment) where.segment = segment;
  if (dueSoon === "true") {
    where.nextFollowUpAt = { lte: new Date() };
    where.status = { in: ["sent", "opened"] };
  }

  const { prisma } = await import("@/lib/prisma");
  const targets = await prisma.outreachTarget.findMany({
    where,
    orderBy: { priority: "asc" },
    include: { campaign: { select: { name: true, segment: true } } },
  });

  return NextResponse.json({ targets });
}

export async function POST(request: Request) {
  const guard = await guardPlatformAdmin(request, "outreach-targets");
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();

  // Support bulk import: { targets: [...] } or single: { name, campaignId, ... }
  const items = Array.isArray(body.targets) ? body.targets : [body];

  if (items.length === 0 || !items[0].campaignId || !items[0].name) {
    return NextResponse.json({ error: "campaignId and name are required" }, { status: 400 });
  }

  const { prisma } = await import("@/lib/prisma");

  const created = await prisma.outreachTarget.createMany({
    data: items.map((t: Record<string, unknown>) => ({
      campaignId: t.campaignId as string,
      name: t.name as string,
      title: (t.title as string) || "",
      organization: (t.organization as string) || "",
      email: (t.email as string) || "",
      phone: (t.phone as string) || "",
      linkedinUrl: (t.linkedinUrl as string) || "",
      segment: (t.segment as string) || "",
      priority: (t.priority as number) || 3,
      personalizationData: typeof t.personalizationData === "string"
        ? t.personalizationData
        : JSON.stringify(t.personalizationData || {}),
      notes: (t.notes as string) || "",
    })),
  });

  // Update campaign target count
  const campaignId = items[0].campaignId as string;
  const count = await prisma.outreachTarget.count({ where: { campaignId } });
  await prisma.outreachCampaign.update({
    where: { id: campaignId },
    data: { targetCount: count },
  });

  return NextResponse.json({ created: created.count }, { status: 201 });
}
