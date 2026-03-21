import { describe, it, expect } from "vitest";
import {
  analyzeRejection,
  applyAutoFixes,
  categorizeForResubmission,
} from "@/lib/switching/resubmission";
import type { ClaimSubmission } from "@/lib/healthbridge/types";

const baseClaim: ClaimSubmission = {
  bhfNumber: "1234567",
  providerNumber: "MP0123456",
  treatingProvider: "Dr Test",
  patientName: "Test Patient",
  patientDob: "1985-06-15",
  patientIdNumber: "8506150800083",
  medicalAidScheme: "Discovery Health",
  membershipNumber: "900012345",
  dependentCode: "0",
  dateOfService: "2026-03-20",
  placeOfService: "11",
  lineItems: [
    { icd10Code: "J06.9", cptCode: "0190", description: "GP Consultation", quantity: 1, amount: 52000 },
  ],
  practiceId: "practice-001",
};

describe("Rejection Analysis", () => {
  it("analyzes all 15 SA rejection codes", () => {
    for (let i = 1; i <= 15; i++) {
      const code = String(i).padStart(2, "0");
      const analysis = analyzeRejection(code);
      expect(analysis.code).toBe(code);
      expect(analysis.reason).toBeTruthy();
      expect(analysis.category).toBeTruthy();
      expect(analysis.suggestedFixes.length).toBeGreaterThan(0);
    }
  });

  it("categorizes member-not-found as patient_data", () => {
    const analysis = analyzeRejection("01");
    expect(analysis.category).toBe("patient_data");
    expect(analysis.resubmittable).toBe(true);
  });

  it("categorizes ICD-10 invalid as clinical", () => {
    const analysis = analyzeRejection("05");
    expect(analysis.category).toBe("clinical");
  });

  it("marks duplicate as not resubmittable", () => {
    const analysis = analyzeRejection("09");
    expect(analysis.resubmittable).toBe(false);
  });

  it("marks DOB mismatch as auto-fixable", () => {
    const analysis = analyzeRejection("04");
    expect(analysis.canAutoFix).toBe(true);
  });

  it("handles unknown rejection codes gracefully", () => {
    const analysis = analyzeRejection("99");
    expect(analysis.code).toBe("99");
    expect(analysis.suggestedFixes.length).toBeGreaterThan(0);
    expect(analysis.requiresManualReview).toBe(true);
  });
});

describe("Auto-Fix Engine", () => {
  it("pads single-digit dependent code", () => {
    const { claim, fixesApplied } = applyAutoFixes({ ...baseClaim, dependentCode: "0" }, "03");
    expect(claim.dependentCode).toBe("00");
    expect(fixesApplied.length).toBeGreaterThan(0);
  });

  it("corrects DOB from SA ID number", () => {
    const { claim, fixesApplied } = applyAutoFixes({
      ...baseClaim,
      patientIdNumber: "8506150800083",
      patientDob: "1990-01-01", // Wrong DOB
    }, "04");
    expect(claim.patientDob).toBe("1985-06-15");
    expect(fixesApplied.length).toBeGreaterThan(0);
  });

  it("adds PMB exemption flag", () => {
    const { claim, fixesApplied } = applyAutoFixes(baseClaim, "13");
    expect(claim.authorizationNumber).toBe("PMB-EXEMPT");
    expect(fixesApplied.length).toBeGreaterThan(0);
  });

  it("does not modify non-auto-fixable rejections", () => {
    const { fixesApplied } = applyAutoFixes(baseClaim, "01");
    expect(fixesApplied.length).toBe(0);
  });
});

describe("Bulk Resubmission Categorization", () => {
  it("categorizes auto-fixable, manual, and non-resubmittable", () => {
    const rejected = [
      { claim: { ...baseClaim, dependentCode: "0" }, rejectionCode: "03" },
      { claim: baseClaim, rejectionCode: "05" },
      { claim: baseClaim, rejectionCode: "09" },
    ];
    const batch = categorizeForResubmission(rejected);
    expect(batch.autoFixable.length).toBe(1);
    expect(batch.manualReview.length).toBe(1);
    expect(batch.notResubmittable.length).toBe(1);
  });

  it("handles empty array", () => {
    const batch = categorizeForResubmission([]);
    expect(batch.autoFixable.length).toBe(0);
    expect(batch.manualReview.length).toBe(0);
    expect(batch.notResubmittable.length).toBe(0);
  });
});
