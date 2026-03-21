import { NextRequest, NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { isDemoMode } from "@/lib/is-demo";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const rl = await rateLimitByIp(req, "claims/network", { limit: 15 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  if (!isDemoMode) {
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // All analyses
    const { data: analyses, error } = await supabaseAdmin
      .from("claims_analysis")
      .select("practice_id, total_claims, valid_claims, invalid_claims, rejection_rate, estimated_savings, scheme_code, period, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    const rows = analyses || [];

    // Aggregate per practice
    const practiceStats: Record<string, {
      practiceId: string; totalAnalyses: number; totalClaims: number;
      totalRejected: number; avgRejectionRate: number; totalSavings: number;
      lastAnalysis: string;
    }> = {};

    const schemeCounts: Record<string, number> = {};

    for (const a of rows) {
      const pid = a.practice_id || "unknown";
      if (!practiceStats[pid]) {
        practiceStats[pid] = {
          practiceId: pid, totalAnalyses: 0, totalClaims: 0,
          totalRejected: 0, avgRejectionRate: 0, totalSavings: 0, lastAnalysis: "",
        };
      }
      const stat = practiceStats[pid];
      stat.totalAnalyses++;
      stat.totalClaims += a.total_claims;
      stat.totalRejected += a.invalid_claims;
      stat.totalSavings += a.estimated_savings;
      stat.avgRejectionRate += a.rejection_rate;
      if (!stat.lastAnalysis) stat.lastAnalysis = a.created_at;
      if (a.scheme_code) schemeCounts[a.scheme_code] = (schemeCounts[a.scheme_code] || 0) + 1;
    }

    const clinicStats = Object.values(practiceStats)
      .map(s => ({
        ...s,
        avgRejectionRate: s.totalAnalyses > 0 ? Math.round((s.avgRejectionRate / s.totalAnalyses) * 10) / 10 : 0,
      }))
      .sort((a, b) => b.avgRejectionRate - a.avgRejectionRate);

    const networkTotalClaims = rows.reduce((s, a) => s + a.total_claims, 0);
    const networkTotalRejected = rows.reduce((s, a) => s + a.invalid_claims, 0);
    const networkAvgRate = networkTotalClaims > 0 ? Math.round((networkTotalRejected / networkTotalClaims) * 100) : 0;
    const networkTotalSavings = rows.reduce((s, a) => s + a.estimated_savings, 0);

    // Monthly trend
    const monthlyTrend: Record<string, { claims: number; rejected: number; savings: number; count: number }> = {};
    for (const a of rows) {
      const month = a.period || (a.created_at as string).substring(0, 7);
      if (!monthlyTrend[month]) monthlyTrend[month] = { claims: 0, rejected: 0, savings: 0, count: 0 };
      monthlyTrend[month].claims += a.total_claims;
      monthlyTrend[month].rejected += a.invalid_claims;
      monthlyTrend[month].savings += a.estimated_savings;
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

    return NextResponse.json({
      network: {
        totalClinics: Object.keys(practiceStats).length,
        clinicsWithData: clinicStats.filter(s => s.totalAnalyses > 0).length,
        totalAnalyses: rows.length,
        totalClaims: networkTotalClaims,
        totalRejected: networkTotalRejected,
        avgRejectionRate: networkAvgRate,
        totalSavings: Math.round(networkTotalSavings),
        topSchemes: Object.entries(schemeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
      },
      clinicStats,
      worstClinics: clinicStats.filter(s => s.totalAnalyses > 0).slice(0, 5),
      bestClinics: clinicStats.filter(s => s.totalAnalyses > 0).slice(-5).reverse(),
      trend,
    });
  } catch (error) {
    console.error("Network claims error:", error);
    return NextResponse.json({ error: "Failed to load network data" }, { status: 500 });
  }
}
