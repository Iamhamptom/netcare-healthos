import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoStore } from "@/lib/demo-data";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardRoute(request, "recall/id");
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;
  const body = await request.json();

  if (isDemoMode) {
    const item = demoStore.updateRecallItem(id, body);
    return NextResponse.json({ recallItem: item });
  }

  const { prisma } = await import("@/lib/prisma");
  const existing = await prisma.recallItem.findUnique({ where: { id } });
  if (!existing || existing.practiceId !== guard.practiceId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const item = await prisma.recallItem.update({ where: { id }, data: { ...(body.contacted !== undefined && { contacted: Boolean(body.contacted) }) } });
  return NextResponse.json({ recallItem: item });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardRoute(request, "recall/id");
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;
  if (isDemoMode) { demoStore.deleteRecallItem(id); return NextResponse.json({ ok: true }); }

  const { prisma } = await import("@/lib/prisma");
  const existing = await prisma.recallItem.findUnique({ where: { id } });
  if (!existing || existing.practiceId !== guard.practiceId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.recallItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
