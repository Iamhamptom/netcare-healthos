import { NextResponse } from "next/server";
import { guardPlatformAdmin, isErrorResponse } from "@/lib/api-helpers";
import { db } from "@/lib/db";
import { supabaseAdmin, tables } from "@/lib/supabase";

const STAGE_DATE_MAP: Record<string, string> = {
  contacted: "contactedAt",
  demo_scheduled: "demoAt",
  proposal_sent: "proposalSentAt",
  won: "wonAt",
  onboarding: "onboardingStartedAt",
  active: "goLiveAt",
  churned: "churnedAt",
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await guardPlatformAdmin(request, "admin-clients-detail");
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;

  const client = await db.getClient(id);
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const activities = await db.listClientActivities(id);

  return NextResponse.json({ client, activities });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await guardPlatformAdmin(request, "admin-clients-detail");
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;
  const body = await request.json();

  const existing = await db.getClient(id) as Record<string, unknown> | null;
  if (!existing) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const stageChanged = body.stage && body.stage !== existing.stage;
  const data: Record<string, unknown> = { ...body };

  // Auto-set milestone date on stage change
  if (stageChanged && STAGE_DATE_MAP[body.stage]) {
    data[STAGE_DATE_MAP[body.stage]] = new Date().toISOString();
  }

  const client = await db.updateClient(id, data);

  if (stageChanged) {
    await db.createActivity({
      clientId: id,
      type: "stage_change",
      title: `Stage changed to ${body.stage}`,
      description: `Moved from ${existing.stage} to ${body.stage}`,
      metadata: JSON.stringify({ from: existing.stage, to: body.stage }),
      createdBy: "Dr. Hampton",
    });
  }

  return NextResponse.json({ client });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await guardPlatformAdmin(request, "admin-clients-detail");
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;

  if (db.useSupabase) {
    await supabaseAdmin.from(tables.clientActivities).delete().eq("client_id", id);
    await supabaseAdmin.from(tables.clientPipeline).delete().eq("id", id);
  } else {
    const { prisma } = await import("@/lib/prisma");
    await prisma.clientActivity.deleteMany({ where: { clientId: id } });
    await prisma.clientPipeline.delete({ where: { id } });
  }

  return NextResponse.json({ success: true });
}
