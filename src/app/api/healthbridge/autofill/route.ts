import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { autofillClaimFromNotes } from "@/lib/healthbridge/ai-autofill";
import { sanitize } from "@/lib/validate";

/** POST /api/healthbridge/autofill — AI-powered clinical notes to claim auto-fill
 * Accepts free-text clinical notes and returns a complete, structured claim
 * with ICD-10 codes, CPT codes, amounts, and clinical summary.
 */
export async function POST(request: Request) {
  const guard = await guardRoute(request, "healthbridge-autofill");
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  const clinicalNotes = sanitize(body.clinicalNotes || body.notes || "");

  if (!clinicalNotes || clinicalNotes.trim().length < 20) {
    return NextResponse.json(
      { error: "Clinical notes must be at least 20 characters for meaningful extraction" },
      { status: 400 }
    );
  }

  const autofilled = await autofillClaimFromNotes(clinicalNotes);

  return NextResponse.json({
    claim: autofilled,
    meta: {
      model: process.env.GEMINI_API_KEY ? "gemini-2.5-flash" : "keyword-fallback",
      notesLength: clinicalNotes.length,
      lineItemCount: autofilled.lineItems.length,
      confidence: autofilled.confidence,
    },
  });
}
