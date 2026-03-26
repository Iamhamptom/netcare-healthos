/**
 * Patient-Claim Pipeline — The connective tissue
 *
 * Like git branches — everything traces back to the patient record,
 * and each step creates artifacts that flow into the next.
 *
 * Patient → Intake → Record → Claim → Validation → Invoice → Follow-up
 */

import { prisma } from "@/lib/prisma";

export interface IntakeResult {
  patientId: string;
  soap: { subjective: string; objective: string; assessment: string; plan: string };
  icd10Codes: { code: string; description: string; isPrimary: boolean }[];
  tariffCodes: { code: string; description: string; amount?: string }[];
  medications: { name: string; dosage: string; nappiCode?: string }[];
  followUp: string;
  approvedBy: string;
  approvedAt: string;
}

export interface ClaimDraft {
  patientId: string;
  patientName: string;
  membershipNumber: string;
  dependentCode: string;
  scheme: string;
  schemeOptionCode: string;
  practiceNumber: string;
  icd10Primary: string;
  icd10Secondary: string[];
  tariffCode: string;
  amount: number;
  nappiCodes: string[];
  dateOfService: string;
  motivation: string;
  sourceRecordId: string;
}

/** Step 1: Intake result becomes a medical record on the patient */
export async function createRecordFromIntake(
  intake: IntakeResult,
  practiceId: string,
): Promise<{ recordId: string }> {
  const desc = [
    "SUBJECTIVE: " + intake.soap.subjective,
    "OBJECTIVE: " + intake.soap.objective,
    "ASSESSMENT: " + intake.soap.assessment,
    "PLAN: " + intake.soap.plan,
  ].join("\n\n");

  const record = await prisma.medicalRecord.create({
    data: {
      type: "consultation",
      title: "Consultation - " + (intake.icd10Codes[0]?.description || "General"),
      description: desc,
      diagnosis: intake.icd10Codes.map(function(c) { return c.code + " " + c.description; }).join("; "),
      treatment: intake.medications.map(function(m) { return m.name + " " + m.dosage; }).join("; "),
      provider: intake.approvedBy,
      patientId: intake.patientId,
      practiceId: practiceId,
      date: new Date(),
    },
  });
  return { recordId: record.id };
}

/** Step 2: Medical record becomes a claim draft */
export async function generateClaimDraft(
  intake: IntakeResult,
  practiceId: string,
): Promise<ClaimDraft | null> {
  const patient = await prisma.patient.findUnique({
    where: { id: intake.patientId },
    select: { id: true, name: true, medicalAid: true, medicalAidNo: true },
  });
  if (!patient) return null;

  const primary = intake.icd10Codes.find(function(c) { return c.isPrimary; }) || intake.icd10Codes[0];
  const secondary = intake.icd10Codes.filter(function(c) { return !c.isPrimary; });
  const tariff = intake.tariffCodes[0];

  return {
    patientId: patient.id,
    patientName: patient.name,
    membershipNumber: patient.medicalAidNo || "",
    dependentCode: "00",
    scheme: patient.medicalAid || "",
    schemeOptionCode: "",
    practiceNumber: "",
    icd10Primary: primary?.code || "",
    icd10Secondary: secondary.map(function(c) { return c.code; }),
    tariffCode: tariff?.code || "0190",
    amount: tariff?.amount ? parseFloat(tariff.amount.replace(/[^0-9.]/g, "")) : 450,
    nappiCodes: intake.medications.filter(function(m) { return m.nappiCode; }).map(function(m) { return m.nappiCode || ""; }),
    dateOfService: new Date().toISOString().split("T")[0],
    motivation: intake.soap.assessment + ". " + intake.soap.plan,
    sourceRecordId: "",
  };
}

/** Step 3: Claim draft becomes CSV for validation */
export function claimDraftToCSV(draft: ClaimDraft): string {
  const headers = "line_number,practice_number,icd10_code,tariff_code,nappi_code,amount,scheme,scheme_option_code,date_of_service,dependent_code,motivation_text,membership_number";
  const mot = draft.motivation.replace(/"/g, '""');
  const row = ["1", draft.practiceNumber, draft.icd10Primary, draft.tariffCode,
    draft.nappiCodes[0] || "", String(draft.amount), draft.scheme,
    draft.schemeOptionCode, draft.dateOfService, draft.dependentCode,
    '"' + mot + '"', draft.membershipNumber].join(",");
  return headers + "\n" + row;
}

/** Step 4: Validated claim becomes an invoice */
export async function createInvoiceFromClaim(
  draft: ClaimDraft,
  practiceId: string,
): Promise<{ invoiceId: string }> {
  const lineItems = JSON.stringify([{
    description: "Consultation - " + draft.icd10Primary,
    icd10Code: draft.icd10Primary,
    tariffCode: draft.tariffCode,
    quantity: 1,
    unitPrice: draft.amount,
    total: draft.amount,
  }]);

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNo: "INV-" + Date.now().toString(36).toUpperCase(),
      patientName: draft.patientName,
      patientId: draft.patientId,
      lineItems: lineItems,
      subtotal: draft.amount,
      tax: 0,
      discount: 0,
      total: draft.amount,
      amountPaid: 0,
      balance: draft.amount,
      medicalAidClaim: draft.amount,
      patientPortion: 0,
      claimStatus: "pending",
      claimReference: "",
      status: "draft",
      dueDate: new Date(Date.now() + 30 * 86400000),
      practiceId: practiceId,
    },
  });
  return { invoiceId: invoice.id };
}

/** Step 5: Follow-up becomes a recall item */
export async function scheduleFollowUp(
  patientId: string,
  followUpText: string,
  practiceId: string,
): Promise<{ type: string; id: string } | null> {
  if (!followUpText) return null;

  const daysMatch = followUpText.match(/(\d+)\s*(day|week|month)/i);
  let days = 7;
  if (daysMatch) {
    const n = parseInt(daysMatch[1]);
    const u = daysMatch[2].toLowerCase();
    if (u === "day") days = n;
    if (u === "week") days = n * 7;
    if (u === "month") days = n * 30;
  }

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { name: true, phone: true },
  });

  const recall = await prisma.recallItem.create({
    data: {
      patientName: patient?.name || "Unknown",
      reason: followUpText,
      dueDate: new Date(Date.now() + days * 86400000),
      contacted: false,
      phone: patient?.phone || "",
      practiceId: practiceId,
    },
  });
  return { type: "recall", id: recall.id };
}

/** FULL PIPELINE: Run all steps end-to-end */
export async function runFullPipeline(
  intake: IntakeResult,
  practiceId: string,
): Promise<{
  recordId: string;
  claimDraft: ClaimDraft | null;
  claimCSV: string;
  invoiceId: string | null;
  followUpId: string | null;
  steps: string[];
}> {
  const steps: string[] = [];

  const { recordId } = await createRecordFromIntake(intake, practiceId);
  steps.push("Record created: " + recordId);

  const claimDraft = await generateClaimDraft(intake, practiceId);
  steps.push("Claim draft: " + (claimDraft ? claimDraft.icd10Primary + " / " + claimDraft.tariffCode : "failed"));

  let claimCSV = "";
  if (claimDraft) {
    claimCSV = claimDraftToCSV(claimDraft);
    steps.push("CSV generated for validation");
  }

  let invoiceId: string | null = null;
  if (claimDraft) {
    try {
      const inv = await createInvoiceFromClaim(claimDraft, practiceId);
      invoiceId = inv.invoiceId;
      steps.push("Invoice: " + inv.invoiceId);
    } catch { steps.push("Invoice failed"); }
  }

  let followUpId: string | null = null;
  if (intake.followUp) {
    try {
      const fu = await scheduleFollowUp(intake.patientId, intake.followUp, practiceId);
      if (fu) { followUpId = fu.id; steps.push("Follow-up: " + fu.type); }
    } catch { steps.push("Follow-up failed"); }
  }

  return { recordId, claimDraft, claimCSV, invoiceId, followUpId, steps };
}
