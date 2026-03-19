import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoStore } from "@/lib/demo-data";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; msgId: string }> }
) {
  const { id, msgId } = await params;
  const body = await request.json().catch(() => ({}));

  if (isDemoMode) {
    demoStore.approveMessage(id, msgId, body.content);
    return NextResponse.json({ ok: true });
  }

  const { prisma } = await import("@/lib/prisma");

  if (body.content) {
    await prisma.message.update({ where: { id: msgId }, data: { content: body.content, approved: true, role: "practice" } });
  } else {
    await prisma.message.update({ where: { id: msgId }, data: { approved: true, role: "practice" } });
  }
  await prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } });

  return NextResponse.json({ ok: true });
}
