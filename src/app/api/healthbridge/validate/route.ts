import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { validateClaim } from "@/lib/healthbridge/validator";
import { getPMBStatus } from "@/lib/healthbridge/pmb";

/** POST /api/healthbridge/validate — Pre-submission claim validation
 * Catches rejections BEFORE they cost money. Returns validation issues,
 * PMB/CDL detection, and estimated rejection risk.
 */
export async function POST(request: Request) {
  const guard = await guardRoute(request, "healthbridge-validate");
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  const result = validateClaim({
    patientName: body.patientName || "",
    patientDob: body.patientDob,
    patientIdNumber: body.patientIdNumber,
    medicalAidScheme: body.medicalAidScheme || "",
    membershipNumber: body.membershipNumber || "",
    dependentCode: body.dependentCode || "00",
    dateOfService: body.dateOfService || "",
    placeOfService: body.placeOfService || "11",
    bhfNumber: body.bhfNumber || process.env.HEALTHBRIDGE_BHF_NUMBER || "",
    providerNumber: body.providerNumber,
    treatingProvider: body.treatingProvider,
    authorizationNumber: body.authorizationNumber,
    lineItems: body.lineItems || [],
    patientGender: body.patientGender,
  });

  // Get PMB/CDL status for display
  const icd10Codes = (body.lineItems || [])
    .map((li: { icd10Code?: string }) => li.icd10Code)
    .filter(Boolean) as string[];
  const pmbStatus = getPMBStatus(icd10Codes);

  return NextResponse.json({
    validation: result,
    pmb: pmbStatus,
    summary: {
      canSubmit: result.valid,
      errors: result.errors,
      warnings: result.warnings,
      rejectionRisk: result.estimatedRejectionRisk,
      pmbDetected: result.pmbDetected,
      message: result.valid
        ? result.warnings > 0
          ? `Claim is valid with ${result.warnings} warning(s) — review before submitting`
          : "Claim is valid — ready to submit"
        : `Claim has ${result.errors} error(s) that must be fixed before submission`,
    },
  });
}
