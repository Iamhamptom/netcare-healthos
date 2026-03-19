import { NextResponse } from "next/server";
import { guardPlatformAdmin, isErrorResponse } from "@/lib/api-helpers";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const guard = await guardPlatformAdmin(request, "admin-analytics");
  if (isErrorResponse(guard)) return guard;

  const practices = await db.listPractices() as Record<string, unknown>[];

  const totalPractices = practices.length;
  const activePractices = practices.filter(p => p.planStatus === "active").length;
  const trialPractices = practices.filter(p => p.planStatus === "trial").length;

  // Count patients and bookings per practice
  let totalPatients = 0;
  let totalBookings = 0;
  for (const p of practices) {
    const patients = await db.listPatients(p.id as string) as unknown[];
    const bookings = await db.listBookings(p.id as string) as unknown[];
    totalPatients += patients.length;
    totalBookings += bookings.length;
  }

  const byPlan = {
    starter: practices.filter(p => p.plan === "starter").length,
    core: practices.filter(p => p.plan === "core").length,
    professional: practices.filter(p => p.plan === "professional").length,
    enterprise: practices.filter(p => p.plan === "enterprise").length,
  };

  const byType: Record<string, number> = {};
  for (const p of practices) {
    const t = p.type as string;
    byType[t] = (byType[t] || 0) + 1;
  }

  const recentSignups = practices
    .sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime())
    .slice(0, 5)
    .map(p => ({ id: p.id, name: p.name, type: p.type, plan: p.plan, planStatus: p.planStatus, createdAt: p.createdAt }));

  return NextResponse.json({
    overview: { totalPractices, activePractices, trialPractices, totalPatients, totalBookings, totalRevenue: 0, totalMRR: 0 },
    byPlan,
    byType,
    recentSignups,
  });
}
