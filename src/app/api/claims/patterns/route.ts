import { NextRequest, NextResponse } from "next/server";
import { requireClaimsAuth } from "@/lib/claims/auth-guard";
import { extractPatterns, predictRejection, generateInsights } from "@/lib/claims/pattern-learning";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const auth = await requireClaimsAuth(req, "patterns", { limit: 20 });
  if (!auth.authorized) return auth.response!;

  try {
    const { searchParams } = new URL(req.url);
    const schemeCode = searchParams.get("scheme") || "";
    const predictCode = searchParams.get("predict") || "";

    const { data: analyses, error } = await supabaseAdmin
      .from("claims_analysis")
      .select("result_json, scheme_code, created_at, rejection_rate, total_claims")
      .eq("practice_id", auth.practiceId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    const rows = analyses || [];

    const analysesForPatterns = rows.map(a => ({
      resultJson: a.result_json,
      schemeCode: a.scheme_code,
      createdAt: a.created_at,
    }));

    const patterns = extractPatterns(analysesForPatterns);

    const practiceRate = rows.length > 0
      ? Math.round(rows.reduce((s, a) => s + a.rejection_rate, 0) / rows.length)
      : 0;
    const totalClaims = rows.reduce((s, a) => s + a.total_claims, 0);

    // Network average
    const { data: networkData } = await supabaseAdmin
      .from("claims_analysis")
      .select("rejection_rate");
    const allRates = (networkData || []).map(r => r.rejection_rate);
    const networkAvgRate = allRates.length > 0
      ? Math.round(allRates.reduce((s, r) => s + r, 0) / allRates.length)
      : 0;

    const insights = generateInsights(patterns, networkAvgRate, practiceRate, totalClaims);

    let prediction = null;
    if (predictCode) {
      prediction = predictRejection(predictCode, schemeCode, patterns);
    }

    return NextResponse.json({
      patterns: patterns.slice(0, 50),
      insights,
      prediction,
      practiceRate,
      networkAvgRate,
      dataPoints: rows.length,
    });
  } catch (error) {
    console.error("Patterns error:", error);
    return NextResponse.json({ error: "Failed to analyze patterns" }, { status: 500 });
  }
}
