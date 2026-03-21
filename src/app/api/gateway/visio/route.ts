import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoPractice, demoStore } from "@/lib/demo-data";
import { rateLimitByIp } from "@/lib/rate-limit";

const VISIO_GATEWAY_URL = process.env.VISIO_GATEWAY_URL || "https://visioworkspace-corpo1.vercel.app/api/gateway";
const VISIO_GATEWAY_KEY = process.env.VISIO_GATEWAY_KEY || "";
const HEALTHOPS_GATEWAY_KEY = process.env.HEALTHOPS_GATEWAY_KEY || "";

// POST — sync data to Visio Workspace (chairman view)
// Reports: practice metrics, revenue, patient counts, usage
export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, "gateway/visio", { limit: 10 });
  if (!rl.allowed) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  // Authenticate — either internal call or Visio Workspace pulling data
  const authHeader = request.headers.get("authorization");
  const apiKey = authHeader?.replace("Bearer ", "");

  if (apiKey !== HEALTHOPS_GATEWAY_KEY && !isDemoMode) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action } = await request.json().catch(() => ({ action: "report" }));

  if (isDemoMode) {
    const analytics = demoStore.getAnalytics();
    return NextResponse.json({
      success: true,
      source: "healthops-demo",
      data: {
        practices: 5,
        totalPatients: analytics.patients.total,
        totalBookings: analytics.bookings.total,
        revenue: analytics.billing.totalRevenue,
        mrr: 37500, // 5 practices average
        activePractices: 4,
        trialPractices: 1,
      },
    });
  }

  try {
    const { prisma } = await import("@/lib/prisma");

    if (action === "report") {
      // Pull metrics and push to Visio Workspace
      const [practiceCount, patientCount, bookingCount, practices] = await Promise.all([
        prisma.practice.count(),
        prisma.patient.count(),
        prisma.booking.count(),
        prisma.practice.findMany({
          select: { id: true, name: true, plan: true, planStatus: true, _count: { select: { patients: true, bookings: true } } },
        }),
      ]);

      const report = {
        product: "Netcare Health OS Ops",
        reportedAt: new Date().toISOString(),
        metrics: {
          practices: practiceCount,
          totalPatients: patientCount,
          totalBookings: bookingCount,
          activePractices: practices.filter(p => p.planStatus === "active").length,
          trialPractices: practices.filter(p => p.planStatus === "trial").length,
          mrr: practices.reduce((sum, p) => {
            const prices: Record<string, number> = { starter: 2999.99, core: 15000, professional: 35000, enterprise: 55000 };
            return sum + (p.planStatus === "active" ? (prices[p.plan] || 0) : 0);
          }, 0),
        },
        practices: practices.map(p => ({
          id: p.id,
          name: p.name,
          plan: p.plan,
          status: p.planStatus,
          patients: p._count?.patients || 0,
          bookings: p._count?.bookings || 0,
        })),
      };

      // Push to Visio Workspace if configured
      if (VISIO_GATEWAY_URL && VISIO_GATEWAY_KEY) {
        try {
          await fetch(VISIO_GATEWAY_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${VISIO_GATEWAY_KEY}`,
            },
            body: JSON.stringify({
              command: `HealthOps product report: ${practiceCount} practices, ${patientCount} patients, MRR R${report.metrics.mrr}`,
              organization_id: undefined,
            }),
          });
        } catch { /* gateway push is best-effort */ }
      }

      return NextResponse.json({ success: true, report });
    }

    if (action === "pull") {
      // Visio Workspace pulling our data
      const practices = await prisma.practice.findMany({
        include: { _count: { select: { patients: true, bookings: true, users: true } } },
      });
      return NextResponse.json({
        success: true,
        practices: practices.map(p => ({
          id: p.id,
          name: p.name,
          type: p.type,
          plan: p.plan,
          status: p.planStatus,
          patients: p._count?.patients || 0,
          bookings: p._count?.bookings || 0,
          staff: p._count?.users || 0,
        })),
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Gateway error" }, { status: 500 });
  }
}
