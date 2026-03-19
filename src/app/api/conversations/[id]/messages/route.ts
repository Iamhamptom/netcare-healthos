import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoStore } from "@/lib/demo-data";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (isDemoMode) {
    const convo = demoStore.getConversation(id);
    return NextResponse.json({ messages: convo?.messages || [] });
  }

  const { prisma } = await import("@/lib/prisma");
  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ messages });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { content, role } = await request.json();

  if (isDemoMode) {
    const msg = demoStore.addMessage(id, role || "practice", content);
    return NextResponse.json({ message: msg });
  }

  const { prisma } = await import("@/lib/prisma");
  const { generateAIReply } = await import("@/lib/claude");

  const message = await prisma.message.create({
    data: { conversationId: id, content, role: role || "practice", approved: role !== "ai_suggestion" },
  });

  if (role === "patient") {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: { patient: true, practice: true, messages: { orderBy: { createdAt: "asc" } } },
    });

    if (conversation) {
      try {
        const history = conversation.messages.filter(m => m.role !== "ai_suggestion").map(m => ({ role: m.role, content: m.content }));
        const aiReply = await generateAIReply(content, conversation.patient.name, conversation.practice.type, conversation.practice.aiPersonality, history);
        await prisma.message.create({ data: { conversationId: id, content: aiReply, role: "ai_suggestion", approved: false } });
      } catch {
        await prisma.message.create({ data: { conversationId: id, content: "[AI suggestion unavailable — please reply manually]", role: "ai_suggestion", approved: false } });
      }
    }
    await prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } });
  }

  return NextResponse.json({ message });
}
