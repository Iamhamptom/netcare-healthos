// GET /api/switching/route — Determine which switch to use for a scheme
// POST /api/switching/route — Submit a claim through the routed switch

import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { routeClaim, submitRoutedClaim, getSwitchStatus, validateClinicalRules, runFraudScan } from "@/lib/switching";

export async function GET(req: Request) {
  const guard = await guardRoute(req, "switching-route");
  if (isErrorResponse(guard)) return guard;

  const url = new URL(req.url);
  const scheme = url.searchParams.get("scheme");

  if (scheme) {
    const routing = routeClaim(scheme);
    return NextResponse.json(routing);
  }

  const status = getSwitchStatus();
  return NextResponse.json({ switches: status });
}

export async function POST(req: Request) {
  const guard = await guardRoute(req, "switching-submit", { limit: 20 });
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await req.json();
    const { claim, forceSwitch, forceProtocol } = body;

    if (!claim) {
      return NextResponse.json({ error: "Claim data is required" }, { status: 400 });
    }

    // Pre-submission clinical validation (clinical-rules.ts + fraud-engine.ts)
    const clinicalIssues = claim.lineItems?.length ? validateClinicalRules({
      primaryIcd10: claim.lineItems[0]?.icd10Code || "",
      secondaryIcd10s: claim.lineItems.slice(1).map((li: { icd10Code: string }) => li.icd10Code).filter(Boolean),
      patientGender: claim.patientGender,
      patientAge: claim.patientAge,
      allIcd10Codes: claim.lineItems.map((li: { icd10Code: string }) => li.icd10Code).filter(Boolean),
    }) : [];

    const clinicalErrors = clinicalIssues.filter(i => i.severity === "error");
    if (clinicalErrors.length > 0) {
      return NextResponse.json({
        error: "Pre-submission validation failed",
        clinicalIssues: clinicalErrors,
        message: clinicalErrors.map(e => e.message).join("; "),
      }, { status: 422 });
    }

    // Fraud scan (non-blocking — returns warnings alongside response)
    const fraudResult = runFraudScan({
      tariffCodes: claim.lineItems?.map((li: { cptCode: string }) => li.cptCode).filter(Boolean) || [],
      consultationCodes: claim.lineItems?.map((li: { cptCode: string }) => li.cptCode).filter(Boolean) || [],
      claimsWithModifiers: claim.lineItems?.map((li: { modifiers?: string[]; dateOfService?: string }) => ({
        modifiers: li.modifiers,
        dateOfService: claim.dateOfService || "",
      })) || [],
      claimsForDuplicateCheck: [],
    });

    const routing = routeClaim(claim.medicalAidScheme);
    const response = await submitRoutedClaim(claim, {
      forceSwitch: forceSwitch || undefined,
      forceProtocol: forceProtocol || undefined,
    });

    // Persist to database
    try {
      const { prisma } = await import("@/lib/prisma");
      await prisma.healthbridgeClaim.create({
        data: {
          practiceId: guard.practiceId,
          patientName: claim.patientName || "",
          medicalAidScheme: claim.medicalAidScheme || "",
          membershipNumber: claim.membershipNumber || "",
          dependentCode: claim.dependentCode || "00",
          dateOfService: claim.dateOfService || "",
          status: response.status,
          totalAmount: claim.lineItems?.reduce((s: number, li: { amount: number; quantity: number }) => s + li.amount * li.quantity, 0) || 0,
          approvedAmount: response.approvedAmount || 0,
          transactionRef: response.transactionRef,
          switchProvider: response.routedTo,
          rejectionCode: response.rejectionCode || "",
          rejectionReason: response.rejectionReason || "",
          edifactMessage: response.edifact || "",
          requestXml: "",
        },
      });
    } catch (dbErr) {
      console.error("[switching/route] DB persistence failed:", dbErr instanceof Error ? dbErr.message : dbErr);
    }

    return NextResponse.json({
      routing,
      response,
      edifact: response.edifact,
      clinicalWarnings: clinicalIssues.filter(i => i.severity !== "error"),
      fraudFlags: fraudResult.flags.length > 0 ? fraudResult : undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
