import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardPlatformAdmin, isErrorResponse } from "@/lib/api-helpers";
import { demoPractices } from "@/lib/demo-data";

export async function GET(request: Request) {
  const guard = await guardPlatformAdmin(request, "admin-usage");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    const usage = demoPractices.map(p => {
      const s = (p as Record<string, unknown>)._stats as Record<string, number> | undefined;
      return {
        id: p.id,
        name: p.name,
        type: p.type,
        plan: p.plan,
        planStatus: p.planStatus,
        primaryColor: p.primaryColor,
        patients: s?.patients ?? 0,
        bookingsThisMonth: s?.bookingsThisMonth ?? 0,
        revenue: s?.revenue ?? 0,
        mrr: s?.mrr ?? 0,
        createdAt: p.createdAt,
        // Usage metrics
        aiConversations: Math.floor(Math.random() * 200) + 50,
        whatsappMessages: Math.floor(Math.random() * 500) + 100,
        voiceCalls: Math.floor(Math.random() * 30),
        storageUsedMB: Math.floor(Math.random() * 500) + 20,
      };
    });

    return NextResponse.json({ usage });
  }

  const { prisma } = await import("@/lib/prisma");
  const practices = await prisma.practice.findMany({
    include: {
      _count: {
        select: { patients: true, bookings: true, conversations: true, notifications: true },
      },
    },
  });

  const usage = practices.map(p => ({
    id: p.id,
    name: p.name,
    type: p.type,
    plan: p.plan,
    planStatus: p.planStatus,
    primaryColor: p.primaryColor,
    patients: p._count.patients,
    bookingsThisMonth: p._count.bookings,
    aiConversations: p._count.conversations,
    whatsappMessages: p._count.notifications,
    createdAt: p.createdAt,
  }));

  return NextResponse.json({ usage });
}
