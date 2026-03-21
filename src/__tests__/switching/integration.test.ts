import { describe, it, expect, beforeEach } from "vitest";
import { generateEDIFACT, parseEDIFACT, parseEDIFACTResponse, claimToEDIFACT, validateEDIFACTMessage } from "@/lib/switching/edifact";
import { routeClaim, SCHEME_ROUTING_TABLE } from "@/lib/switching/router";
import { checkPreAuthRequired, createPreAuthRequest, isPreAuthValid } from "@/lib/switching/preauth";
import { analyzeRejection, applyAutoFixes, categorizeForResubmission } from "@/lib/switching/resubmission";
import { createBatchJob, getBatchSummary, getFailedClaims, generateBatchEDIFACT } from "@/lib/switching/batch";
import { parseERAXml, reconcileERA, generateDisputes } from "@/lib/switching/era-parser";
import { evaluateTransaction, resetEvaluations } from "@/lib/switching/review-agent";
import { submitToMediKredit } from "@/lib/switching/medikredit-client";
import { submitToSwitchOn } from "@/lib/switching/switchon-client";
import { validateClaim } from "@/lib/healthbridge/validator";
import type { ClaimSubmission } from "@/lib/healthbridge/types";

const baseClaim: ClaimSubmission = {
  bhfNumber: "1234567",
  providerNumber: "MP0123456",
  treatingProvider: "Dr Test Provider",
  patientName: "John Mokoena",
  patientDob: "1985-06-15",
  patientIdNumber: "8506155800083",
  medicalAidScheme: "Discovery Health",
  membershipNumber: "900012345",
  dependentCode: "00",
  dateOfService: "2026-03-20",
  placeOfService: "11",
  lineItems: [
    { icd10Code: "J06.9", cptCode: "0190", description: "GP Consultation", quantity: 1, amount: 52000 },
  ],
  practiceId: "practice-001",
};

describe("Full Claim Lifecycle", () => {
  beforeEach(() => resetEvaluations());

  it("create -> validate -> route -> EDIFACT -> parse -> round-trip", () => {
    // Step 1: Validate claim
    const validation = validateClaim(baseClaim);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toBe(0);

    // Step 2: Route claim to correct switch
    const route = routeClaim(baseClaim.medicalAidScheme);
    expect(route.switchProvider).toBe("healthbridge");

    // Step 3: Generate EDIFACT
    const edifact = generateEDIFACT(baseClaim);
    expect(edifact).toContain("MEDCLM:0:912:ZA");

    // Step 4: Parse EDIFACT (simulating switch processing)
    const parsed = parseEDIFACT(edifact);
    expect(parsed.lineItems.length).toBe(1);
    expect(parsed.lineItems[0].tariffCode).toBe("0190");
    expect(parsed.lineItems[0].amount).toBe(52000);

    // Step 5: Validate parsed message
    const msgValidation = validateEDIFACTMessage(parsed);
    expect(msgValidation.valid).toBe(true);
  });

  it("submit -> evaluate -> review flow", async () => {
    // Submit to sandbox
    const response = await submitToMediKredit(baseClaim);
    expect(response.transactionRef).toBeTruthy();

    // Evaluate the transaction
    const evaluation = evaluateTransaction(baseClaim, response, "medikredit", 150);
    expect(evaluation.id).toMatch(/^EVAL-/);
    expect(evaluation.transactionRef).toBe(response.transactionRef);
    expect(["normal", "flagged", "critical"]).toContain(evaluation.assessment);
  });
});

describe("Full Pre-Auth Lifecycle", () => {
  it("check -> request -> validate flow", () => {
    // Step 1: Check if pre-auth is required
    const check = checkPreAuthRequired({
      cptCodes: ["0500"],
      icd10Codes: ["M54.5"],
      scheme: "Discovery Health",
      estimatedCost: 350000,
    });
    expect(check.required).toBe(true);
    expect(check.categories).toContain("mri_ct_scan");

    // Step 2: Create pre-auth request
    const request = createPreAuthRequest({
      practiceId: "p-001",
      bhfNumber: "1234567",
      providerNumber: "MP0123456",
      patientName: "John Mokoena",
      patientDob: "1985-06-15",
      patientIdNumber: "8506155800083",
      membershipNumber: "900012345",
      dependentCode: "00",
      medicalAidScheme: "Discovery Health",
      icd10Codes: ["M54.5"],
      cptCodes: ["0500"],
      procedureDescription: "MRI lumbar spine",
      clinicalMotivation: "Persistent lower back pain >6 weeks",
      urgency: "elective",
      estimatedCost: 350000,
    });
    expect(request.id).toMatch(/^PA-/);
    expect(request.status).toBe("pending");
    expect(isPreAuthValid(request)).toBe(false);

    // Step 3: Simulate approval
    request.status = "approved";
    request.validTo = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    expect(isPreAuthValid(request)).toBe(true);
  });
});

describe("Full Batch Lifecycle", () => {
  it("create -> summary -> failed extraction", () => {
    const claims = Array.from({ length: 5 }, (_, i) => ({
      ...baseClaim,
      patientName: `Patient ${i + 1}`,
    }));

    // Step 1: Create batch
    const job = createBatchJob({ practiceId: "p-001", claims });
    expect(job.status).toBe("queued");
    expect(job.totalClaims).toBe(5);

    // Step 2: Simulate mixed results
    job.processedClaims = 5;
    job.successfulClaims = 3;
    job.failedClaims = 2;
    job.status = "partial";
    job.startedAt = new Date().toISOString();
    job.completedAt = new Date().toISOString();
    job.results = [
      { claimId: "claim-0", status: "success", approvedAmount: 52000, processedAt: new Date().toISOString() },
      { claimId: "claim-1", status: "failed", errorMessage: "Timeout", processedAt: new Date().toISOString() },
      { claimId: "claim-2", status: "success", approvedAmount: 52000, processedAt: new Date().toISOString() },
      { claimId: "claim-3", status: "success", approvedAmount: 52000, processedAt: new Date().toISOString() },
      { claimId: "claim-4", status: "failed", errorMessage: "Network error", processedAt: new Date().toISOString() },
    ];

    // Step 3: Summary
    const summary = getBatchSummary(job);
    expect(summary.successRate).toBe(60);
    expect(summary.totalApproved).toBe(156000);

    // Step 4: Extract failed claims for retry
    const failed = getFailedClaims(job, claims);
    expect(failed).toHaveLength(2);
    expect(failed[0].patientName).toBe("Patient 2");
    expect(failed[1].patientName).toBe("Patient 5");
  });
});

describe("Full eRA Lifecycle", () => {
  it("parse -> reconcile -> disputes flow", () => {
    const eraXml = `<?xml version="1.0"?>
<RemittanceAdvice>
  <RemittanceRef>ERA-DH-20260320</RemittanceRef>
  <SchemeName>Discovery Health</SchemeName>
  <Administrator>Discovery Health (Pty) Ltd</Administrator>
  <PaymentDate>2026-03-20</PaymentDate>
  <PaymentMethod>EFT</PaymentMethod>
  <TotalAmount>137000</TotalAmount>
  <Payment>
    <ClaimRef>HB-001</ClaimRef>
    <MembershipNumber>900012345</MembershipNumber>
    <DependentCode>00</DependentCode>
    <PatientName>John Mokoena</PatientName>
    <DateOfService>2026-03-15</DateOfService>
    <TariffCode>0190</TariffCode>
    <ClaimedAmount>52000</ClaimedAmount>
    <ApprovedAmount>52000</ApprovedAmount>
    <PaidAmount>52000</PaidAmount>
  </Payment>
  <Payment>
    <ClaimRef>HB-002</ClaimRef>
    <MembershipNumber>900067890</MembershipNumber>
    <DependentCode>00</DependentCode>
    <PatientName>Priya Naidoo</PatientName>
    <DateOfService>2026-03-15</DateOfService>
    <TariffCode>0190</TariffCode>
    <ClaimedAmount>95000</ClaimedAmount>
    <ApprovedAmount>85000</ApprovedAmount>
    <PaidAmount>85000</PaidAmount>
    <AdjustmentCode>15</AdjustmentCode>
    <AdjustmentReason>Paid at scheme tariff rate</AdjustmentReason>
  </Payment>
</RemittanceAdvice>`;

    // Step 1: Parse eRA
    const era = parseERAXml(eraXml);
    expect(era.remittanceRef).toBe("ERA-DH-20260320");
    expect(era.lineItems).toHaveLength(2);

    // Step 2: Reconcile against submitted claims
    const claims = [
      { id: "c-1", transactionRef: "HB-001", invoiceId: "inv-1", membershipNumber: "900012345", dateOfService: "2026-03-15", claimedAmount: 52000, status: "submitted" },
      { id: "c-2", transactionRef: "HB-002", invoiceId: "inv-2", membershipNumber: "900067890", dateOfService: "2026-03-15", claimedAmount: 95000, status: "submitted" },
    ];
    const recon = reconcileERA(era, claims);
    expect(recon.totalMatched).toBe(2);
    expect(recon.underpayments.length).toBe(1);

    // Step 3: Generate disputes
    const disputes = generateDisputes(recon, "Discovery Health");
    expect(disputes.length).toBe(1);
    expect(disputes[0].shortfall).toBe(10000);
    expect(disputes[0].scheme).toBe("Discovery Health");
  });
});

describe("Full Resubmission Lifecycle", () => {
  it("reject -> analyze -> auto-fix flow", () => {
    // Step 1: Claim rejected with DOB mismatch
    const analysis = analyzeRejection("04");
    expect(analysis.canAutoFix).toBe(true);
    expect(analysis.category).toBe("patient_data");

    // Step 2: Auto-fix the claim
    const wrongClaim = { ...baseClaim, patientDob: "1990-01-01" };
    const { claim: fixed, fixesApplied } = applyAutoFixes(wrongClaim, "04");
    expect(fixed.patientDob).toBe("1985-06-15"); // Corrected from SA ID
    expect(fixesApplied.length).toBeGreaterThan(0);

    // Step 3: Validate corrected claim
    const validation = validateClaim(fixed);
    expect(validation.valid).toBe(true);
  });
});

describe("Cross-Module: Router + Switch Client", () => {
  it("routes Discovery Health to healthbridge", () => {
    const route = routeClaim("Discovery Health");
    expect(route.switchProvider).toBe("healthbridge");
  });

  it("routes GEMS to switchon", () => {
    const route = routeClaim("GEMS");
    expect(route.switchProvider).toBe("switchon");
  });

  it("routes CompCare to medikredit", () => {
    const route = routeClaim("CompCare");
    expect(route.switchProvider).toBe("medikredit");
  });

  it("every routed scheme can generate valid EDIFACT", () => {
    for (const route of SCHEME_ROUTING_TABLE.slice(0, 5)) {
      const claim = { ...baseClaim, medicalAidScheme: route.scheme };
      const edifact = generateEDIFACT(claim);
      expect(edifact).toContain("MEDCLM:0:912:ZA");
      const parsed = parseEDIFACT(edifact);
      const validation = validateEDIFACTMessage(parsed);
      expect(validation.valid).toBe(true);
    }
  });
});

describe("Cross-Module: Batch + EDIFACT", () => {
  it("batch EDIFACT generates correct interchange for multiple claims", () => {
    const claims = Array.from({ length: 3 }, (_, i) => ({
      ...baseClaim,
      patientName: `Patient ${i + 1}`,
      medicalAidScheme: "Bonitas",
    }));

    const edifact = generateBatchEDIFACT(claims, "1234567", "HEALTHBRIDGE");
    expect(edifact).toContain("UNB+");
    expect(edifact).toContain("UNZ+3");

    // Each claim should generate a separate MEDCLM message within the interchange
    const medclmCount = (edifact.match(/MEDCLM:0:912:ZA/g) || []).length;
    expect(medclmCount).toBe(3);
  });
});
