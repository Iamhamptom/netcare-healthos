import { NextRequest, NextResponse } from "next/server";
import { requireClaimsAuth, sanitizeResultForStorage } from "@/lib/claims/auth-guard";

async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

// GET — List saved analyses (practice-scoped)
export async function GET(req: NextRequest) {
  const auth = await requireClaimsAuth(req, "history", { limit: 30 });
  if (!auth.authorized) return auth.response!;

  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

    const prisma = await getPrisma();
    const analyses = await prisma.claimsAnalysis.findMany({
      where: { practiceId: auth.practiceId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true, fileName: true, totalClaims: true, validClaims: true,
        invalidClaims: true, warningClaims: true, rejectionRate: true,
        estimatedSavings: true, schemeCode: true, topIssuesJson: true,
        analyzedBy: true, period: true, createdAt: true,
      },
    });

    const results = analyses.map((a: typeof analyses[number]) => ({
      ...a,
      topIssues: JSON.parse(a.topIssuesJson || "[]"),
    }));

    // Trend — last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const allAnalyses = await prisma.claimsAnalysis.findMany({
      where: { practiceId: auth.practiceId, createdAt: { gte: sixMonthsAgo } },
      orderBy: { createdAt: "asc" },
      select: { rejectionRate: true, estimatedSavings: true, totalClaims: true, createdAt: true, period: true },
    });

    const trend: Record<string, { avgRate: number; totalSavings: number; totalClaims: number; count: number }> = {};
    for (const a of allAnalyses) {
      const month = a.period || a.createdAt.toISOString().substring(0, 7);
      if (!trend[month]) trend[month] = { avgRate: 0, totalSavings: 0, totalClaims: 0, count: 0 };
      trend[month].avgRate += a.rejectionRate;
      trend[month].totalSavings += a.estimatedSavings;
      trend[month].totalClaims += a.totalClaims;
      trend[month].count += 1;
    }
    const trendData = Object.entries(trend).map(([month, d]) => ({
      month,
      avgRejectionRate: Math.round((d.avgRate / d.count) * 10) / 10,
      totalSavings: Math.round(d.totalSavings),
      totalClaims: d.totalClaims,
      analysisCount: d.count,
    }));

    return NextResponse.json({ analyses: results, trend: trendData });
  } catch (error) {
    console.error("Claims history error:", error);
    return NextResponse.json({ analyses: [], trend: [] });
  }
}

// POST — Save an analysis result (PII sanitized before storage)
export async function POST(req: NextRequest) {
  const auth = await requireClaimsAuth(req, "history/save", { limit: 10 });
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const { fileName, result, schemeCode = "", period = new Date().toISOString().substring(0, 7) } = body;

    if (!result) return NextResponse.json({ error: "No result data provided" }, { status: 400 });

    // Sanitize PII before storage (POPIA compliance)
    const sanitizedResult = sanitizeResultForStorage(result);

    const prisma = await getPrisma();
    const analysis = await prisma.claimsAnalysis.create({
      data: {
        practiceId: auth.practiceId,
        fileName: fileName || "",
        totalClaims: result.totalClaims || 0,
        validClaims: result.validClaims || 0,
        invalidClaims: result.invalidClaims || 0,
        warningClaims: result.warningClaims || 0,
        rejectionRate: result.summary?.estimatedRejectionRate || 0,
        estimatedSavings: result.summary?.estimatedSavings || 0,
        schemeCode,
        resultJson: JSON.stringify(sanitizedResult),
        topIssuesJson: JSON.stringify(result.summary?.topIssues || []),
        analyzedBy: auth.userId,
        period,
      },
    });

    return NextResponse.json({ id: analysis.id, saved: true });
  } catch (error) {
    console.error("Save analysis error:", error);
    return NextResponse.json({ error: "Failed to save analysis" }, { status: 500 });
  }
}
