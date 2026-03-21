import { NextRequest, NextResponse } from "next/server";
import { requireClaimsAuth, sanitizeResultForStorage } from "@/lib/claims/auth-guard";
import { supabaseAdmin } from "@/lib/supabase";

// GET — List saved analyses (practice-scoped)
export async function GET(req: NextRequest) {
  const auth = await requireClaimsAuth(req, "history", { limit: 30 });
  if (!auth.authorized) return auth.response!;

  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

    const { data: analyses, error } = await supabaseAdmin
      .from("claims_analysis")
      .select("id, file_name, total_claims, valid_claims, invalid_claims, warning_claims, rejection_rate, estimated_savings, scheme_code, top_issues_json, analyzed_by, period, created_at")
      .eq("practice_id", auth.practiceId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    const results = (analyses || []).map(a => ({
      id: a.id,
      fileName: a.file_name,
      totalClaims: a.total_claims,
      validClaims: a.valid_claims,
      invalidClaims: a.invalid_claims,
      warningClaims: a.warning_claims,
      rejectionRate: a.rejection_rate,
      estimatedSavings: a.estimated_savings,
      schemeCode: a.scheme_code,
      topIssues: JSON.parse(a.top_issues_json || "[]"),
      analyzedBy: a.analyzed_by,
      period: a.period,
      createdAt: a.created_at,
    }));

    // Trend — last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: trendData } = await supabaseAdmin
      .from("claims_analysis")
      .select("rejection_rate, estimated_savings, total_claims, created_at, period")
      .eq("practice_id", auth.practiceId)
      .gte("created_at", sixMonthsAgo.toISOString())
      .order("created_at", { ascending: true });

    const trend: Record<string, { avgRate: number; totalSavings: number; totalClaims: number; count: number }> = {};
    for (const a of trendData || []) {
      const month = a.period || (a.created_at as string).substring(0, 7);
      if (!trend[month]) trend[month] = { avgRate: 0, totalSavings: 0, totalClaims: 0, count: 0 };
      trend[month].avgRate += a.rejection_rate;
      trend[month].totalSavings += a.estimated_savings;
      trend[month].totalClaims += a.total_claims;
      trend[month].count += 1;
    }
    const trendResult = Object.entries(trend).map(([month, d]) => ({
      month,
      avgRejectionRate: Math.round((d.avgRate / d.count) * 10) / 10,
      totalSavings: Math.round(d.totalSavings),
      totalClaims: d.totalClaims,
      analysisCount: d.count,
    }));

    return NextResponse.json({ analyses: results, trend: trendResult });
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

    const sanitizedResult = sanitizeResultForStorage(result);

    const { data, error } = await supabaseAdmin
      .from("claims_analysis")
      .insert({
        practice_id: auth.practiceId,
        file_name: fileName || "",
        total_claims: result.totalClaims || 0,
        valid_claims: result.validClaims || 0,
        invalid_claims: result.invalidClaims || 0,
        warning_claims: result.warningClaims || 0,
        rejection_rate: result.summary?.estimatedRejectionRate || 0,
        estimated_savings: result.summary?.estimatedSavings || 0,
        scheme_code: schemeCode,
        result_json: JSON.stringify(sanitizedResult),
        top_issues_json: JSON.stringify(result.summary?.topIssues || []),
        analyzed_by: auth.userId,
        period,
      })
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data.id, saved: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Save analysis error:", msg);
    return NextResponse.json({ error: `Failed to save analysis: ${msg}` }, { status: 500 });
  }
}
