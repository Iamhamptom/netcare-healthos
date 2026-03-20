import { NextRequest, NextResponse } from "next/server";
import { suggestICD10Codes, explainRejection } from "@/lib/claims/ai-suggestions";
import { requireClaimsAuth } from "@/lib/claims/auth-guard";

export async function POST(req: NextRequest) {
  // Strict rate limit — AI calls cost money
  const auth = await requireClaimsAuth(req, "suggest", { limit: 20, windowMs: 60_000 });
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const { action, ...params } = body;

    // Never send patient names to AI — only code, gender, age, issues
    if (action === "suggest") {
      const suggestions = await suggestICD10Codes({
        currentCode: params.currentCode,
        description: params.description,
        patientGender: params.patientGender,
        patientAge: params.patientAge,
        issues: params.issues,
      });
      return NextResponse.json({ suggestions });
    }

    if (action === "explain") {
      const explanation = await explainRejection({
        code: params.code,
        rule: params.rule,
        message: params.message,
      });
      return NextResponse.json({ explanation });
    }

    return NextResponse.json({ error: "Invalid action. Use 'suggest' or 'explain'." }, { status: 400 });
  } catch (error) {
    console.error("AI suggestion error:", error);
    return NextResponse.json({ error: "AI suggestion failed" }, { status: 500 });
  }
}
