import { describe, it, expect } from "vitest";
import {
  analyzeRejection,
  applyAutoFixes,
  categorizeForResubmission,
  createResubmission,
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

describe("Resubmission — DOB Century Detection", () => {
  it("2000s ID number (00-30 prefix) corrects to 20xx century", () => {
    const claim = {
      ...baseClaim,
      patientIdNumber: "0506150800083", // 05 → 2005
      patientDob: "1990-01-01", // Wrong
    };
    const { claim: fixed, fixesApplied } = applyAutoFixes(claim, "04");
    expect(fixed.patientDob).toBe("2005-06-15");
    expect(fixesApplied.length).toBeGreaterThan(0);
  });

  it("1900s ID number (31-99 prefix) corrects to 19xx century", () => {
    const claim = {
      ...baseClaim,
      patientIdNumber: "8506150800083", // 85 → 1985
      patientDob: "2085-06-15", // Wrong
    };
    const { claim: fixed, fixesApplied } = applyAutoFixes(claim, "04");
    expect(fixed.patientDob).toBe("1985-06-15");
    expect(fixesApplied.length).toBeGreaterThan(0);
  });

  it("boundary: ID prefix 30 maps to 2030", () => {
    const claim = {
      ...baseClaim,
      patientIdNumber: "3006150800083", // 30 → 2030
      patientDob: "1930-06-15", // Wrong
    };
    const { claim: fixed, fixesApplied } = applyAutoFixes(claim, "04");
    expect(fixed.patientDob).toBe("2030-06-15");
    expect(fixesApplied.length).toBeGreaterThan(0);
  });

  it("boundary: ID prefix 31 maps to 1931", () => {
    const claim = {
      ...baseClaim,
      patientIdNumber: "3106150800083", // 31 → 1931
      patientDob: "2031-06-15", // Wrong
    };
    const { claim: fixed, fixesApplied } = applyAutoFixes(claim, "04");
    expect(fixed.patientDob).toBe("1931-06-15");
    expect(fixesApplied.length).toBeGreaterThan(0);
  });
});

describe("Resubmission — Dependent Code Auto-Fix", () => {
  it("single digit '0' padded to '00'", () => {
    const { claim, fixesApplied } = applyAutoFixes({ ...baseClaim, dependentCode: "0" }, "03");
    expect(claim.dependentCode).toBe("00");
    expect(fixesApplied.length).toBeGreaterThan(0);
  });

  it("single digit '5' padded to '05'", () => {
    const { claim, fixesApplied } = applyAutoFixes({ ...baseClaim, dependentCode: "5" }, "03");
    expect(claim.dependentCode).toBe("05");
    expect(fixesApplied.length).toBeGreaterThan(0);
  });

  it("already 2 digits '01' is not changed", () => {
    const { claim, fixesApplied } = applyAutoFixes({ ...baseClaim, dependentCode: "01" }, "03");
    // 2-digit code doesn't need padding — no fix applied (length > 1)
    expect(claim.dependentCode).toBe("01");
    expect(fixesApplied).toHaveLength(0);
  });
});

describe("Resubmission — PMB Flag Auto-Fix", () => {
  it("adds PMB-EXEMPT when authorizationNumber is empty", () => {
    const claim = { ...baseClaim, dependentCode: "00" };
    delete (claim as Record<string, unknown>).authorizationNumber;
    const { claim: fixed, fixesApplied } = applyAutoFixes(claim, "13");
    expect(fixed.authorizationNumber).toBe("PMB-EXEMPT");
    expect(fixesApplied.length).toBeGreaterThan(0);
  });

  it("does not overwrite existing authorization number", () => {
    const claim = { ...baseClaim, dependentCode: "00", authorizationNumber: "AUTH-EXISTING" };
    const { claim: fixed, fixesApplied } = applyAutoFixes(claim, "13");
    expect(fixed.authorizationNumber).toBe("AUTH-EXISTING");
    expect(fixesApplied).toHaveLength(0);
  });
});

describe("Resubmission — Non-Resubmittable Codes", () => {
  it("rejection code 09 (duplicate) is not resubmittable", () => {
    const analysis = analyzeRejection("09");
    expect(analysis.resubmittable).toBe(false);
    expect(analysis.category).toBe("duplicate");
  });

  it("rejection code 14 (co-payment) is not resubmittable", () => {
    const analysis = analyzeRejection("14");
    expect(analysis.resubmittable).toBe(false);
    expect(analysis.category).toBe("benefit");
  });

  it("rejection code 15 (tariff exceeded) is not resubmittable", () => {
    const analysis = analyzeRejection("15");
    expect(analysis.resubmittable).toBe(false);
    expect(analysis.category).toBe("benefit");
  });
});

describe("Resubmission — Unknown Rejection Code", () => {
  it("unknown code returns manual review with suggestion", () => {
    const analysis = analyzeRejection("99");
    expect(analysis.code).toBe("99");
    expect(analysis.requiresManualReview).toBe(true);
    expect(analysis.suggestedFixes.length).toBeGreaterThan(0);
    expect(analysis.suggestedFixes[0].description).toContain("99");
  });

  it("unknown code 77 is still resubmittable by default", () => {
    const analysis = analyzeRejection("77");
    expect(analysis.resubmittable).toBe(true);
    expect(analysis.canAutoFix).toBe(false);
  });
});

describe("Resubmission — Bulk Categorization", () => {
  it("all 3 categories present in mixed batch", () => {
    const rejected = [
      { claim: { ...baseClaim, dependentCode: "0" }, rejectionCode: "03" },   // auto-fixable
      { claim: baseClaim, rejectionCode: "05" },                               // manual
      { claim: baseClaim, rejectionCode: "09" },                               // not resubmittable
    ];
    const batch = categorizeForResubmission(rejected);
    expect(batch.autoFixable.length).toBe(1);
    expect(batch.manualReview.length).toBe(1);
    expect(batch.notResubmittable.length).toBe(1);
  });

  it("batch with only auto-fixable claims", () => {
    const rejected = [
      { claim: { ...baseClaim, dependentCode: "0" }, rejectionCode: "03" },
      { claim: { ...baseClaim, patientDob: "1990-01-01" }, rejectionCode: "04" },
    ];
    const batch = categorizeForResubmission(rejected);
    expect(batch.autoFixable.length).toBe(2);
    expect(batch.manualReview.length).toBe(0);
    expect(batch.notResubmittable.length).toBe(0);
  });

  it("batch with only non-resubmittable claims", () => {
    const rejected = [
      { claim: baseClaim, rejectionCode: "09" },
      { claim: baseClaim, rejectionCode: "14" },
      { claim: baseClaim, rejectionCode: "15" },
    ];
    const batch = categorizeForResubmission(rejected);
    expect(batch.autoFixable.length).toBe(0);
    expect(batch.manualReview.length).toBe(0);
    expect(batch.notResubmittable.length).toBe(3);
  });
});

describe("Resubmission — Correction Type Mapping", () => {
  it("amount change maps to ADJ", () => {
    const resub = createResubmission(
      baseClaim,
      "claim-001",
      "15",
      "Tariff exceeded",
      [{ field: "amount", oldValue: "52000", newValue: "48000", reason: "Adjusted to scheme rate" }],
    );
    expect(resub.correctionType).toBe("ADJ");
  });

  it("duplicate (code 09) maps to REV", () => {
    const resub = createResubmission(
      baseClaim,
      "claim-002",
      "09",
      "Duplicate claim",
      [{ field: "claim", oldValue: "", newValue: "modifier added", reason: "Differentiate" }],
    );
    expect(resub.correctionType).toBe("REV");
  });

  it("default correction type is RSV (resubmit)", () => {
    const resub = createResubmission(
      baseClaim,
      "claim-003",
      "05",
      "ICD-10 invalid",
      [{ field: "icd10Code", oldValue: "J06", newValue: "J06.9", reason: "Added specificity" }],
    );
    expect(resub.correctionType).toBe("RSV");
  });
});

describe("Resubmission — Non-Auto-Fixable Does Nothing", () => {
  it("rejection code 01 (member not found) applies no fixes", () => {
    const { fixesApplied } = applyAutoFixes(baseClaim, "01");
    expect(fixesApplied).toHaveLength(0);
  });

  it("rejection code 05 (ICD-10 invalid) applies no fixes", () => {
    const { fixesApplied } = applyAutoFixes(baseClaim, "05");
    expect(fixesApplied).toHaveLength(0);
  });

  it("rejection code 10 (provider not contracted) applies no fixes", () => {
    const { fixesApplied } = applyAutoFixes(baseClaim, "10");
    expect(fixesApplied).toHaveLength(0);
  });
});

describe("Resubmission — All 15 Codes Have Analysis", () => {
  it.each(Array.from({ length: 15 }, (_, i) => String(i + 1).padStart(2, "0")))(
    "rejection code %s has valid analysis",
    (code) => {
      const analysis = analyzeRejection(code);
      expect(analysis.code).toBe(code);
      expect(analysis.reason).toBeTruthy();
      expect(analysis.category).toBeTruthy();
      expect(typeof analysis.resubmittable).toBe("boolean");
      expect(typeof analysis.canAutoFix).toBe("boolean");
      expect(analysis.suggestedFixes.length).toBeGreaterThan(0);
    },
  );
});
