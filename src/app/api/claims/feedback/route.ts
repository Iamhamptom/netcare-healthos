import { NextRequest, NextResponse } from "next/server";
import { requireClaimsAuth } from "@/lib/claims/auth-guard";
import { supabaseAdmin } from "@/lib/supabase";

// POST — Report a real claim rejection (feeds pattern learning)
export async function POST(req: NextRequest) {
  const auth = await requireClaimsAuth(req, "feedback", { limit: 30 });
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const { primaryICD10, tariffCode, schemeCode, rejectionCode, rejectionReason, amount, dateOfService } = body;

    if (!primaryICD10 || !schemeCode || !rejectionCode) {
      return NextResponse.json({ error: "primaryICD10, schemeCode, and rejectionCode are required" }, { status: 400 });
    }

    // Store in claims_analysis as a special "feedback" entry
    const { data, error } = await supabaseAdmin
      .from("claims_analysis")
      .insert({
        practice_id: auth.practiceId,
        file_name: `feedback:${rejectionCode}`,
        total_claims: 1,
        valid_claims: 0,
        invalid_claims: 1,
        warning_claims: 0,
        rejection_rate: 100,
        estimated_savings: amount || 0,
        scheme_code: schemeCode,
        result_json: JSON.stringify({
          type: "rejection_feedback",
          lineResults: [{
            lineNumber: 1,
            status: "error",
            issues: [{
              lineNumber: 1, field: "primaryICD10", code: rejectionCode,
              severity: "error", rule: `Scheme Rejection: ${rejectionCode}`,
              message: rejectionReason || `Rejected by ${schemeCode} with code ${rejectionCode}`,
            }],
            claimData: {
              lineNumber: 1, primaryICD10, tariffCode: tariffCode || "",
              amount: amount || 0, dateOfService: dateOfService || "",
            },
          }],
          issues: [{
            lineNumber: 1, field: "primaryICD10", code: rejectionCode,
            severity: "error", rule: `Scheme Rejection: ${rejectionCode}`,
            message: rejectionReason || `Rejected by ${schemeCode} with code ${rejectionCode}`,
          }],
          totalClaims: 1, validClaims: 0, invalidClaims: 1, warningClaims: 0,
          summary: { estimatedRejectionRate: 100, estimatedSavings: amount || 0, topIssues: [{ rule: `Rejection ${rejectionCode}`, count: 1, severity: "error" }] },
        }),
        top_issues_json: JSON.stringify([{ rule: `Rejection ${rejectionCode}: ${rejectionReason || ""}`, count: 1, severity: "error" }]),
        analyzed_by: auth.userId,
        period: new Date().toISOString().substring(0, 7),
        notes: "rejection_feedback",
      })
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({
      saved: true,
      id: data.id,
      message: "Rejection feedback recorded. This will improve future predictions for this code + scheme combination.",
    });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
  }
}

// GET — List recent rejection feedback for the practice
export async function GET(req: NextRequest) {
  const auth = await requireClaimsAuth(req, "feedback/list", { limit: 30 });
  if (!auth.authorized) return auth.response!;

  try {
    const { data, error } = await supabaseAdmin
      .from("claims_analysis")
      .select("id, scheme_code, top_issues_json, estimated_savings, created_at")
      .eq("practice_id", auth.practiceId)
      .eq("notes", "rejection_feedback")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    const feedback = (data || []).map(r => ({
      id: r.id,
      schemeCode: r.scheme_code,
      issue: JSON.parse(r.top_issues_json || "[]")[0]?.rule || "Unknown",
      amount: r.estimated_savings,
      reportedAt: r.created_at,
    }));

    return NextResponse.json({ feedback, total: feedback.length });
  } catch (error) {
    console.error("Feedback list error:", error);
    return NextResponse.json({ feedback: [], total: 0 });
  }
}
