import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoStore } from "@/lib/demo-data";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardRoute(request, "conversations/[id]");
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;

  if (isDemoMode) {
    const conversation = demoStore.getConversation(id);
    if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ conversation });
  }

  const { prisma } = await import("@/lib/prisma");
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: { patient: true, messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!conversation || conversation.practiceId !== guard.practiceId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ conversation });
}

const VALID_CONV_STATUSES = ["active", "closed", "archived"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardRoute(request, "conversations/[id]");
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;
  const body = await request.json();

  if (body.status && !VALID_CONV_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  if (isDemoMode) {
    const conversation = demoStore.getConversation(id);
    if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });
    Object.assign(conversation, { status: body.status });
    return NextResponse.json({ conversation });
  }

  const { prisma } = await import("@/lib/prisma");
  const existing = await prisma.conversation.findUnique({ where: { id } });
  if (!existing || existing.practiceId !== guard.practiceId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const conversation = await prisma.conversation.update({
    where: { id },
    data: { status: body.status },
  });

  return NextResponse.json({ conversation });
}
