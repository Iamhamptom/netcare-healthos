import { NextResponse } from "next/server";
import { guardPlatformAdmin, isErrorResponse } from "@/lib/api-helpers";

export async function GET(request: Request) {
  const guard = await guardPlatformAdmin(request, "outreach-campaigns");
  if (isErrorResponse(guard)) return guard;

  const { prisma } = await import("@/lib/prisma");
  const campaigns = await prisma.outreachCampaign.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { targets: true, emails: true } } },
  });

  return NextResponse.json({ campaigns });
}

export async function POST(request: Request) {
  const guard = await guardPlatformAdmin(request, "outreach-campaigns");
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  const { name, segment, description, emailTemplateKey, status, notes } = body;

  if (!name || !segment) {
    return NextResponse.json({ error: "name and segment are required" }, { status: 400 });
  }

  const { prisma } = await import("@/lib/prisma");
  const campaign = await prisma.outreachCampaign.create({
    data: {
      name,
      segment,
      description: description || "",
      emailTemplateKey: emailTemplateKey || "",
      status: status || "draft",
      notes: notes || "",
    },
  });

  return NextResponse.json({ campaign }, { status: 201 });
}
