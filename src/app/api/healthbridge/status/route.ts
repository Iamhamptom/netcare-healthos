import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { isHealthbridgeConfigured } from "@/lib/healthbridge/client";
import { isDemoMode } from "@/lib/is-demo";
import { MEDICAL_AID_SCHEMES, COMMON_ICD10, COMMON_CPT, PLACE_OF_SERVICE, REJECTION_CODES } from "@/lib/healthbridge/codes";
import { getSwitchStatus } from "@/lib/healthbridge/switch-router";

/** GET /api/healthbridge/status — Integration status, config check, and reference data */
export async function GET(request: Request) {
  const guard = await guardRoute(request, "healthbridge-status");
  if (isErrorResponse(guard)) return guard;

  const configured = isHealthbridgeConfigured();

  // Gather stats
  let stats = { totalClaims: 0, accepted: 0, rejected: 0, pending: 0, totalBilled: 0, totalPaid: 0 };

  if (!isDemoMode) {
    const { prisma } = await import("@/lib/prisma");
    const claims = await prisma.healthbridgeClaim.findMany({
      where: { practiceId: guard.practiceId },
      select: { status: true, totalAmount: true, paidAmount: true },
    });
    stats = {
      totalClaims: claims.length,
      accepted: claims.filter((c) => ["accepted", "pending_payment", "paid", "short_paid"].includes(c.status)).length,
      rejected: claims.filter((c) => c.status === "rejected").length,
      pending: claims.filter((c) => ["draft", "submitted"].includes(c.status)).length,
      totalBilled: claims.reduce((sum, c) => sum + c.totalAmount, 0),
      totalPaid: claims.reduce((sum, c) => sum + c.paidAmount, 0),
    };
  } else {
    stats = { totalClaims: 3, accepted: 2, rejected: 1, pending: 0, totalBilled: 223500, totalPaid: 87000 };
  }

  return NextResponse.json({
    integration: {
      name: "Healthbridge SA",
      description: "SA medical aid claims switching — ICD-10-ZA, CPT/CCSA, NAPPI, eRA reconciliation",
      configured,
      mode: configured ? (process.env.HEALTHBRIDGE_SANDBOX === "true" ? "sandbox" : "production") : "simulation",
      bhfNumber: process.env.HEALTHBRIDGE_BHF_NUMBER || null,
      endpoints: {
        claims: "/api/healthbridge/claims",
        claimDetail: "/api/healthbridge/claims/:id",
        eligibility: "/api/healthbridge/eligibility",
        remittances: "/api/healthbridge/remittances",
        reconcile: "/api/healthbridge/reconcile",
        validate: "/api/healthbridge/validate",
        analytics: "/api/healthbridge/analytics",
        nappi: "/api/healthbridge/nappi?q=search_term",
        aiCode: "/api/healthbridge/ai-code",
        batch: "/api/healthbridge/batch",
        status: "/api/healthbridge/status",
      },
      capabilities: [
        "Real-time claim submission to medical aid switches (Healthbridge/MediKredit/MediSwitch)",
        "Pre-submission validation — catches rejections before they cost money",
        "PMB (271 conditions) and CDL (26 chronic conditions) auto-detection",
        "AI-powered ICD-10 + CPT coding from clinical notes (Gemini)",
        "Batch claim upload via CSV (validate + submit up to 500 rows)",
        "Multi-switch routing — auto-routes to correct switch per scheme",
        "Patient eligibility/benefit verification before consultation",
        "Electronic remittance advice (eRA) fetch and auto-reconciliation",
        "NAPPI code lookup with Single Exit Price (medicineprices.org.za API)",
        "Scheme-specific revenue analytics — acceptance rates, payment speed, collection rates",
        "Outstanding claims aging report (30/60/90/120+ day buckets)",
        "Patient cost estimation — medical aid vs co-pay vs gap cover breakdown",
        "SA-standard coding: ICD-10-ZA, CPT/CCSA, NAPPI, BHF validation",
        "Clinical cross-matching (ICD-10 vs CPT mismatch detection)",
        "Claim lifecycle: draft → submitted → accepted/rejected → eRA → reconciled",
        "Claim reversal and resubmission workflows",
        "XML audit trail for all switch transactions (POPIA compliant)",
      ],
      switches: getSwitchStatus(),
      aiCoder: { enabled: !!process.env.GEMINI_API_KEY, model: "gemini-2.5-flash" },
      requiredEnvVars: [
        { key: "HEALTHBRIDGE_ENDPOINT", set: !!process.env.HEALTHBRIDGE_ENDPOINT },
        { key: "HEALTHBRIDGE_USERNAME", set: !!process.env.HEALTHBRIDGE_USERNAME },
        { key: "HEALTHBRIDGE_PASSWORD", set: !!process.env.HEALTHBRIDGE_PASSWORD },
        { key: "HEALTHBRIDGE_BHF_NUMBER", set: !!process.env.HEALTHBRIDGE_BHF_NUMBER },
        { key: "HEALTHBRIDGE_SANDBOX", set: !!process.env.HEALTHBRIDGE_SANDBOX },
      ],
    },
    stats,
    reference: {
      medicalAidSchemes: Object.keys(MEDICAL_AID_SCHEMES),
      icd10Codes: COMMON_ICD10,
      cptCodes: COMMON_CPT,
      placeOfServiceCodes: PLACE_OF_SERVICE,
      rejectionCodes: REJECTION_CODES,
    },
  });
}
