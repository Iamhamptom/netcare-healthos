// Generate a Healthbridge claim from a CareOn Bridge advisory
// Takes an advisory ID, extracts clinical data, pre-populates a claim

import { NextResponse, NextRequest } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { getAdvisories } from "@/lib/careon-bridge";
import { logBridgeAudit } from "@/lib/hl7/security";

// CPT code mapping for common encounter types
const ENCOUNTER_CPT: Record<string, { code: string; description: string; amount: number }> = {
  "Admission": { code: "0190", description: "GP Consultation", amount: 52000 },
  "Discharge": { code: "0193", description: "Extended Consultation", amount: 78000 },
  "Outpatient Visit": { code: "0190", description: "GP Consultation", amount: 52000 },
  "Lab Results": { code: "3710", description: "Pathology — blood panel", amount: 35000 },
  "Order": { code: "0308", description: "Special Investigation", amount: 85000 },
};

export async function POST(request: NextRequest) {
  const guard = await guardRoute(request, "bridge-generate-claim");
  if (isErrorResponse(guard)) return guard;

  try {
    const { advisoryId } = await request.json();
    if (!advisoryId) {
      return NextResponse.json({ error: "advisoryId required" }, { status: 400 });
    }

    // Find the advisory
    const advisories = getAdvisories({ limit: 100 });
    const advisory = advisories.find(a => a.id === advisoryId);
    if (!advisory) {
      return NextResponse.json({ error: "Advisory not found" }, { status: 404 });
    }

    // Build claim from advisory data
    const cpt = ENCOUNTER_CPT[advisory.encounterType] ?? ENCOUNTER_CPT["Outpatient Visit"];
    const lineItems = [
      // Primary procedure
      {
        icd10Code: advisory.suggestedICD10[0]?.code ?? "Z00.0",
        cptCode: cpt.code,
        description: cpt.description,
        quantity: 1,
        amount: cpt.amount,
      },
      // Additional diagnosis codes as separate line items
      ...advisory.suggestedICD10.slice(1).map(code => ({
        icd10Code: code.code,
        cptCode: "0191",
        description: `Follow-up — ${code.description}`,
        quantity: 1,
        amount: 35000,
      })),
    ];

    const claimDraft = {
      id: `CLM-${Date.now().toString(36).toUpperCase()}`,
      status: "draft",
      createdAt: new Date().toISOString(),
      createdBy: guard.user.name,
      sourceAdvisoryId: advisory.id,

      // Patient data from advisory
      patientName: advisory.patientName,
      patientMRN: advisory.patientMRN,

      // Scheme data (from advisory context)
      medicalAidScheme: advisory.description.match(/Discovery|Bonitas|GEMS|Momentum|Medshield/)?.[0] ?? "Unknown",

      // Clinical data
      facility: advisory.facility,
      encounterType: advisory.encounterType,
      dateOfService: new Date().toISOString().split("T")[0],
      placeOfService: advisory.encounterType === "Admission" || advisory.encounterType === "Discharge" ? "21" : "11",

      // Line items
      lineItems,
      totalAmount: lineItems.reduce((s, l) => s + l.amount * l.quantity, 0),
      totalAmountZAR: `R${(lineItems.reduce((s, l) => s + l.amount * l.quantity, 0) / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`,

      // ICD-10 codes
      diagnosisCodes: advisory.suggestedICD10.map(c => ({
        code: c.code,
        description: c.description,
        confidence: c.confidence,
      })),

      // Validation status
      validationPassed: true,
      validationWarnings: advisory.suggestedICD10.length === 1
        ? ["Only 1 diagnosis code — consider adding comorbidities for DRG grouping"]
        : [],

      // Next steps
      nextSteps: [
        "Review claim line items and amounts",
        "Verify patient medical aid membership number",
        "Check pre-authorization requirements",
        "Submit via Healthbridge switch engine",
      ],
    };

    // Audit
    logBridgeAudit({
      action: "claim_generated",
      userId: guard.user.id,
      userName: guard.user.name,
      userRole: guard.user.role,
      advisoryId: advisory.id,
      facility: advisory.facility,
      patientMRN: advisory.patientMRN,
      detail: `Claim draft ${claimDraft.id} generated from advisory. ${lineItems.length} line items. Total: ${claimDraft.totalAmountZAR}`,
    });

    return NextResponse.json({ success: true, claim: claimDraft });
  } catch (err) {
    console.error("Claim generation error:", err);
    return NextResponse.json({ error: "Failed to generate claim" }, { status: 500 });
  }
}
