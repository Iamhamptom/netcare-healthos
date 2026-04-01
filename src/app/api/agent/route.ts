export const maxDuration = 60;

import { createAgentUIStreamResponse } from "ai";
import { healthOSAgent } from "@/lib/agents/health-os-agent";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { isDemoMode } from "@/lib/is-demo";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const guard = await guardRoute(request, "agent", { limit: 20 });
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  const { messages, threadId: incomingThreadId } = body;
  let threadId = incomingThreadId;
  let memoryContext = "";

  if (!isDemoMode) {
    try {
      const { prisma } = await import("@/lib/prisma");

      const memories = await prisma.aiMemory.findMany({
        where: { practiceId: guard.practiceId },
        orderBy: [{ accessCount: "desc" }, { updatedAt: "desc" }],
        take: 15,
      });
      if (memories.length > 0) {
        memoryContext = "\nUSER MEMORIES:\n" + memories.map((m: { category: string; key: string; value: string }) => "[" + m.category + "] " + m.key + ": " + m.value).join("\n");
      }

      if (!threadId) {
        const lastMsg = messages[messages.length - 1];
        const title = typeof lastMsg?.content === "string" ? lastMsg.content.slice(0, 80) : "New chat";
        const thread = await prisma.aiThread.create({
          data: { practiceId: guard.practiceId, userId: guard.user?.id, persona: "visio-agent", title },
        });
        threadId = thread.id;
      }

      const lastUserMsg = messages.filter((m: { role: string }) => m.role === "user").pop();
      if (lastUserMsg && typeof lastUserMsg.content === "string") {
        await prisma.aiMessage.create({ data: { threadId, role: "user", content: lastUserMsg.content } });
        await prisma.aiThread.update({ where: { id: threadId }, data: { messageCount: { increment: 1 }, lastMessageAt: new Date() } });
      }
    } catch (err) {
      console.error("[agent] Thread error:", err);
    }
  }

  if (memoryContext && messages.length > 0) {
    const lastIdx = messages.length - 1;
    if (messages[lastIdx].role === "user" && typeof messages[lastIdx].content === "string") {
      messages[lastIdx] = { ...messages[lastIdx], content: messages[lastIdx].content + memoryContext };
    }
  }

  return createAgentUIStreamResponse({ agent: healthOSAgent, uiMessages: messages });
}

export async function GET(request: Request) {
  const guard = await guardRoute(request, "agent", { limit: 30 });
  if (isErrorResponse(guard)) return guard;

  const url = new URL(request.url);
  const threadId = url.searchParams.get("threadId");

  if (!isDemoMode) {
    try {
      const { prisma } = await import("@/lib/prisma");
      if (threadId) {
        const messages = await prisma.aiMessage.findMany({ where: { threadId }, orderBy: { createdAt: "asc" }, take: 50 });
        return NextResponse.json({ messages, threadId });
      }
      const threads = await prisma.aiThread.findMany({
        where: { practiceId: guard.practiceId, persona: "visio-agent", status: "active" },
        orderBy: { lastMessageAt: "desc" },
        take: 20,
        select: { id: true, title: true, messageCount: true, lastMessageAt: true, createdAt: true },
      });
      return NextResponse.json({ threads });
    } catch {
      return NextResponse.json({ threads: [], messages: [] });
    }
  }
  return NextResponse.json({ threads: [], messages: [] });
}
