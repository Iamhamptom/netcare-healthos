import { NextRequest, NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { isDemoMode } from "@/lib/is-demo";

// Network-wide claims analytics — aggregated across all practices
// Accessible to platform_admin only (Thirushen's view)

export async function GET(req: NextRequest) {
  const rl = rateLimitByIp(req, "claims/network", { limit: 15 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  // Auth — platform_admin only
  if (!isDemoMode) {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } });
    if (!user || user.role !== "platform_admin") {
      return NextResponse.json({ error: "Platform admin access required" }, { status: 403 });
    }
  }

  try {
    const { prisma } = await import("@/lib/prisma");

    // All practices
    const practices = await prisma.practice.findMany({
      select: { id: true, name: true, type: true, subdomain: true },
    });

    // All analyses — grouped by practice
    const analyses = await prisma.claimsAnalysis.findMany({
      select: {
        practiceId: true, totalClaims: true, validClaims: true,
        invalidClaims: true, rejectionRate: true, estimatedSavings: true,
        schemeCode: true, period: true, createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Aggregate per practice
    const practiceStats: Record<string, {
      practiceId: string; practiceName: string; practiceType: string;
      totalAnalyses: number; totalClaims: number; totalRejected: number;
      avgRejectionRate: number; totalSavings: number; lastAnalysis: string;
      topScheme: string;
    }> = {};

    for (const p of practices) {
      practiceStats[p.id] = {
        practiceId: p.id,
        practiceName: p.name,
        practiceType: p.type,
        totalAnalyses: 0, totalClaims: 0, totalRejected: 0,
        avgRejectionRate: 0, totalSavings: 0, lastAnalysis: "",
        topScheme: "",
      };
    }

    const schemeCounts: Record<string, number> = {};

    for (const a of analyses) {
      const stat = practiceStats[a.practiceId];
      if (stat) {
        stat.totalAnalyses++;
        stat.totalClaims += a.totalClaims;
        stat.totalRejected += a.invalidClaims;
        stat.totalSavings += a.estimatedSavings;
        stat.avgRejectionRate += a.rejectionRate;
        if (!stat.lastAnalysis) stat.lastAnalysis = a.createdAt.toISOString();
      }
      if (a.schemeCode) schemeCounts[a.schemeCode] = (schemeCounts[a.schemeCode] || 0) + 1;
    }

    // Finalize averages
    const clinicStats = Object.values(practiceStats)
      .map(s => ({
        ...s,
        avgRejectionRate: s.totalAnalyses > 0 ? Math.round((s.avgRejectionRate / s.totalAnalyses) * 10) / 10 : 0,
      }))
      .sort((a, b) => b.avgRejectionRate - a.avgRejectionRate);

    // Network totals
    const totalClinics = practices.length;
    const clinicsWithData = clinicStats.filter(s => s.totalAnalyses > 0).length;
    const networkTotalClaims = analyses.reduce((s, a) => s + a.totalClaims, 0);
    const networkTotalRejected = analyses.reduce((s, a) => s + a.invalidClaims, 0);
    const networkAvgRate = networkTotalClaims > 0 ? Math.round((networkTotalRejected / networkTotalClaims) * 100) : 0;
    const networkTotalSavings = analyses.reduce((s, a) => s + a.estimatedSavings, 0);

    // Monthly trend (network-wide)
    const monthlyTrend: Record<string, { claims: number; rejected: number; savings: number; count: number }> = {};
    for (const a of analyses) {
      const month = a.period || a.createdAt.toISOString().substring(0, 7);
      if (!monthlyTrend[month]) monthlyTrend[month] = { claims: 0, rejected: 0, savings: 0, count: 0 };
      monthlyTrend[month].claims += a.totalClaims;
      monthlyTrend[month].rejected += a.invalidClaims;
      monthlyTrend[month].savings += a.estimatedSavings;
      monthlyTrend[month].count++;
    }
    const trend = Object.entries(monthlyTrend)
      .map(([month, d]) => ({
        month,
        totalClaims: d.claims,
        totalRejected: d.rejected,
        rejectionRate: d.claims > 0 ? Math.round((d.rejected / d.claims) * 100) : 0,
        totalSavings: Math.round(d.savings),
        analysisCount: d.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Top 3 worst clinics
    const worstClinics = clinicStats.filter(s => s.totalAnalyses > 0).slice(0, 5);

    // Top 3 best clinics
    const bestClinics = clinicStats.filter(s => s.totalAnalyses > 0).slice(-5).reverse();

    return NextResponse.json({
      network: {
        totalClinics,
        clinicsWithData,
        totalAnalyses: analyses.length,
        totalClaims: networkTotalClaims,
        totalRejected: networkTotalRejected,
        avgRejectionRate: networkAvgRate,
        totalSavings: Math.round(networkTotalSavings),
        topSchemes: Object.entries(schemeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
      },
      clinicStats,
      worstClinics,
      bestClinics,
      trend,
    });
  } catch (error) {
    console.error("Network claims error:", error);
    return NextResponse.json({ error: "Failed to load network data" }, { status: 500 });
  }
}
