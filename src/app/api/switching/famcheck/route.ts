// POST /api/switching/famcheck — Full member verification (FamCheck via MediKredit)
// Returns complete family membership details, benefits, waiting periods

import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { famCheck, authCheck, checkRoutedEligibility } from "@/lib/switching";

export async function POST(req: Request) {
  const guard = await guardRoute(req, "switching-famcheck", { limit: 20 });
  if (isErrorResponse(guard)) return guard;
  try {
    const body = await req.json();
    const { action } = body;

    // FamCheck — Full member & family download
    if (action === "famcheck" || !action) {
      const { membershipNumber, dependentCode, patientDob, scheme, bhfNumber } = body;

      if (!membershipNumber || !scheme) {
        return NextResponse.json(
          { error: "membershipNumber and scheme are required" },
          { status: 400 },
        );
      }

      const result = await famCheck({
        membershipNumber,
        dependentCode: dependentCode || "00",
        patientDob: patientDob || "",
        scheme,
        bhfNumber,
      });

      return NextResponse.json(result);
    }

    // AuthCheck — Pre-authorization requirements check
    if (action === "authcheck") {
      const { membershipNumber, scheme, icd10Codes, cptCodes, bhfNumber, estimatedCost } = body;

      if (!membershipNumber || !scheme) {
        return NextResponse.json(
          { error: "membershipNumber and scheme are required" },
          { status: 400 },
        );
      }

      const result = await authCheck({
        membershipNumber,
        scheme,
        icd10Codes: icd10Codes || [],
        cptCodes: cptCodes || [],
        bhfNumber,
        estimatedCost: estimatedCost || 0,
      });

      return NextResponse.json(result);
    }

    // Eligibility — Quick benefit check via routed switch
    if (action === "eligibility") {
      const { membershipNumber, dependentCode, patientDob, scheme, bhfNumber } = body;

      if (!membershipNumber || !scheme) {
        return NextResponse.json(
          { error: "membershipNumber and scheme are required" },
          { status: 400 },
        );
      }

      const result = await checkRoutedEligibility({
        membershipNumber,
        dependentCode: dependentCode || "00",
        patientDob: patientDob || "",
        scheme,
        bhfNumber,
      });

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action. Use: famcheck, authcheck, or eligibility" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
