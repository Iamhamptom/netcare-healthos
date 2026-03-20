import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { predictRejection } from "@/lib/healthbridge/ai-predictor";
import type { ClaimSubmission } from "@/lib/healthbridge/types";

/** POST /api/healthbridge/predict — AI rejection prediction before claim submission
 * Accepts full claim data and returns rejection probability, risk factors,
 * recommendations, and alternative code suggestions.
 */
export async function POST(request: Request) {
  const guard = await guardRoute(request, "healthbridge-predict");
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();

  // Validate minimum required fields
  if (!body.medicalAidScheme || !body.lineItems?.length) {
    return NextResponse.json(
      { error: "medicalAidScheme and at least one lineItem are required" },
      { status: 400 }
    );
  }

  // Build ClaimSubmission from body (allow partial data for prediction)
  const claim: ClaimSubmission = {
    bhfNumber: body.bhfNumber || "",
    providerNumber: body.providerNumber || "",
    treatingProvider: body.treatingProvider || "",
    referringProvider: body.referringProvider,
    patientName: body.patientName || "",
    patientDob: body.patientDob || "",
    patientIdNumber: body.patientIdNumber || "",
    medicalAidScheme: body.medicalAidScheme,
    membershipNumber: body.membershipNumber || "",
    dependentCode: body.dependentCode || "00",
    dateOfService: body.dateOfService || new Date().toISOString().split("T")[0],
    placeOfService: body.placeOfService || "11",
    authorizationNumber: body.authorizationNumber,
    lineItems: body.lineItems.map((li: Record<string, unknown>) => ({
      icd10Code: (li.icd10Code as string) || "",
      cptCode: (li.cptCode as string) || "",
      nappiCode: li.nappiCode as string | undefined,
      description: (li.description as string) || "",
      quantity: (li.quantity as number) || 1,
      amount: (li.amount as number) || 0,
      modifiers: li.modifiers as string[] | undefined,
    })),
    practiceId: guard.practiceId,
  };

  const prediction = await predictRejection(claim);

  return NextResponse.json({
    prediction,
    meta: {
      model: process.env.GEMINI_API_KEY ? "gemini-2.5-flash" : "rule-based-fallback",
      scheme: claim.medicalAidScheme,
      lineItemCount: claim.lineItems.length,
    },
  });
}
