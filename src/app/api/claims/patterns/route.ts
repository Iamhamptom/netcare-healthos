import { NextRequest, NextResponse } from "next/server";
import { requireClaimsAuth } from "@/lib/claims/auth-guard";
import { extractPatterns, predictRejection, generateInsights } from "@/lib/claims/pattern-learning";

// GET — Get rejection patterns + insights for the practice
export async function GET(req: NextRequest) {
  const auth = await requireClaimsAuth(req, "patterns", { limit: 20 });
  if (!auth.authorized) return auth.response!;

  try {
    const { searchParams } = new URL(req.url);
    const schemeCode = searchParams.get("scheme") || "";
    const predictCode = searchParams.get("predict") || "";

    const { prisma } = await import("@/lib/prisma");

    // Get all analyses for this practice
    const analyses = await prisma.claimsAnalysis.findMany({
      where: { practiceId: auth.practiceId },
      select: { resultJson: true, schemeCode: true, createdAt: true, rejectionRate: true, totalClaims: true },
      orderBy: { createdAt: "desc" },
      take: 100, // Last 100 analyses
    });

    const analysesForPatterns = analyses.map(a => ({
      resultJson: a.resultJson,
      schemeCode: a.schemeCode,
      createdAt: a.createdAt.toISOString(),
    }));

    // Extract patterns
    const patterns = extractPatterns(analysesForPatterns);

    // Practice stats
    const practiceRate = analyses.length > 0
      ? Math.round(analyses.reduce((s, a) => s + a.rejectionRate, 0) / analyses.length)
      : 0;
    const totalClaims = analyses.reduce((s, a) => s + a.totalClaims, 0);

    // Network average for comparison
    const networkStats = await prisma.claimsAnalysis.aggregate({
      _avg: { rejectionRate: true },
    });
    const networkAvgRate = Math.round(networkStats._avg.rejectionRate || 0);

    // Generate insights
    const insights = generateInsights(patterns, networkAvgRate, practiceRate, totalClaims);

    // Prediction if requested
    let prediction = null;
    if (predictCode) {
      prediction = predictRejection(predictCode, schemeCode, patterns);
    }

    return NextResponse.json({
      patterns: patterns.slice(0, 50), // Top 50
      insights,
      prediction,
      practiceRate,
      networkAvgRate,
      dataPoints: analyses.length,
    });
  } catch (error) {
    console.error("Patterns error:", error);
    return NextResponse.json({ error: "Failed to analyze patterns" }, { status: 500 });
  }
}
