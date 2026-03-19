import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoStore } from "@/lib/demo-data";

export async function POST() {
  if (isDemoMode) {
    const result = demoStore.simulatePatient();
    return NextResponse.json(result);
  }

  const { prisma } = await import("@/lib/prisma");
  const { getSession } = await import("@/lib/auth");

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user?.practiceId) return NextResponse.json({ error: "No practice" }, { status: 400 });

  const MESSAGES = [
    "Hi, I'd like to reschedule my appointment for next week",
    "What are your prices for teeth whitening?",
    "Do you have availability this Thursday afternoon?",
    "I have a toothache, can I come in today?",
    "Do you accept medical aid?",
    "Can I book a cleaning for my daughter too?",
  ];

  let patients = await prisma.patient.findMany({ where: { practiceId: user.practiceId } });
  if (patients.length === 0) {
    const p = await prisma.patient.create({ data: { name: "Demo Patient", phone: "+27 82 000 0000", practiceId: user.practiceId } });
    patients = [p];
  }

  const patient = patients[Math.floor(Math.random() * patients.length)];
  const content = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

  let conversation = await prisma.conversation.findFirst({ where: { patientId: patient.id, practiceId: user.practiceId, status: "active" } });
  if (!conversation) {
    conversation = await prisma.conversation.create({ data: { patientId: patient.id, practiceId: user.practiceId } });
  }

  // Create patient message and trigger AI
  await prisma.message.create({ data: { conversationId: conversation.id, content, role: "patient" } });

  try {
    const { generateAIReply } = await import("@/lib/claude");
    const practice = await prisma.practice.findUnique({ where: { id: user.practiceId } });
    const history = [{ role: "patient", content }];
    const aiReply = await generateAIReply(content, patient.name, practice?.type || "dental", practice?.aiPersonality || "professional", history);
    await prisma.message.create({ data: { conversationId: conversation.id, content: aiReply, role: "ai_suggestion", approved: false } });
  } catch {
    await prisma.message.create({ data: { conversationId: conversation.id, content: "[AI suggestion unavailable]", role: "ai_suggestion", approved: false } });
  }

  await prisma.conversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });
  return NextResponse.json({ conversationId: conversation.id, message: content });
}
