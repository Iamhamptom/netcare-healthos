import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardPatientRoute, isPatientErrorResponse } from "@/lib/patient-auth";

/** GET /api/portal/messages — Get patient's conversation messages */
export async function GET(request: Request) {
  const guard = await guardPatientRoute(request, "messages");
  if (isPatientErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({
      messages: [
        { id: "m1", role: "practice", content: "Hi Thandi, your HbA1c results are in. Please book a follow-up to discuss.", createdAt: "2026-03-16T09:00:00Z" },
        { id: "m2", role: "patient", content: "Thank you, I'll book for next week.", createdAt: "2026-03-16T09:15:00Z" },
        { id: "m3", role: "practice", content: "Great! Your appointment is confirmed for Monday 24 March at 10:00.", createdAt: "2026-03-16T09:20:00Z" },
      ],
    });
  }

  const { prisma } = await import("@/lib/prisma");

  // Find or create conversation for this patient
  let conversation = await prisma.conversation.findFirst({
    where: { patientId: guard.patientId, practiceId: guard.practiceId },
    include: { messages: { orderBy: { createdAt: "asc" }, take: 50 } },
    orderBy: { updatedAt: "desc" },
  });

  if (!conversation) {
    return NextResponse.json({ messages: [] });
  }

  return NextResponse.json({
    messages: conversation.messages
      .filter((m) => m.role !== "ai_suggestion" || m.approved)
      .map((m) => ({
        id: m.id,
        role: m.role === "ai_suggestion" ? "practice" : m.role,
        content: m.content,
        createdAt: m.createdAt,
      })),
  });
}

/** POST /api/portal/messages — Patient sends a message */
export async function POST(request: Request) {
  const guard = await guardPatientRoute(request, "messages", { limit: 15 });
  if (isPatientErrorResponse(guard)) return guard;

  const { content } = await request.json();
  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "Message content is required" }, { status: 400 });
  }

  if (isDemoMode) {
    return NextResponse.json({
      message: { id: "demo-msg", role: "patient", content, createdAt: new Date().toISOString() },
    });
  }

  const { prisma } = await import("@/lib/prisma");

  // Find or create conversation
  let conversation = await prisma.conversation.findFirst({
    where: { patientId: guard.patientId, practiceId: guard.practiceId },
    orderBy: { updatedAt: "desc" },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        patientId: guard.patientId,
        practiceId: guard.practiceId,
        channel: "portal",
        status: "active",
      },
    });
  }

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: "patient",
      content: content.trim().slice(0, 2000),
      approved: true,
    },
  });

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({
    message: { id: message.id, role: message.role, content: message.content, createdAt: message.createdAt },
  });
}
