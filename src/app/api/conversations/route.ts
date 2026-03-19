import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoStore } from "@/lib/demo-data";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

export async function GET(request: Request) {
  const guard = await guardRoute(request, "conversations");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({ conversations: demoStore.getConversations() });
  }

  const { prisma } = await import("@/lib/prisma");
  const conversations = await prisma.conversation.findMany({
    where: { practiceId: guard.practiceId },
    include: { patient: true, messages: { orderBy: { createdAt: "asc" } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ conversations });
}

export async function POST(request: Request) {
  const guard = await guardRoute(request, "conversations");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({ error: "Use simulate in demo mode" }, { status: 400 });
  }

  const { prisma } = await import("@/lib/prisma");
  const { patientId } = await request.json();
  const conversation = await prisma.conversation.create({
    data: { patientId, practiceId: guard.practiceId },
    include: { patient: true, messages: true },
  });

  return NextResponse.json({ conversation });
}
