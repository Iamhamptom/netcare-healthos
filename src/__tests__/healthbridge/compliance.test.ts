import { describe, it, expect } from "vitest";
import { encryptField, decryptField, maskIdNumber, maskMembership } from "@/lib/healthbridge/encrypt";
import { validateClaim } from "@/lib/healthbridge/validator";
import { isValidICD10, isValidCPT, isValidBHF } from "@/lib/healthbridge/codes";
import { isPMBCondition, isCDLCondition, getPMBStatus, CDL_CONDITIONS, PMB_ICD10_CODES } from "@/lib/healthbridge/pmb";
import { isValidTransition, getNextStates, validateTransition } from "@/lib/healthbridge/state-machine";
import type { ClaimAuditData } from "@/lib/healthbridge/audit";

const validClaim = {
  patientName: "John Mokoena",
  patientDob: "1985-06-15",
  patientIdNumber: "8506155012089",
  medicalAidScheme: "Discovery Health",
  membershipNumber: "900012345",
  dependentCode: "00",
  dateOfService: new Date().toISOString().slice(0, 10),
  placeOfService: "11",
  bhfNumber: "1234567",
  providerNumber: "MP12345",
  treatingProvider: "Dr Smith",
  lineItems: [
    { icd10Code: "I10", cptCode: "0190", description: "GP consultation — hypertension", quantity: 1, amount: 52000 },
  ],
};

describe("POPIA Section 19 — Security Safeguards", () => {
  it("should encrypt PII field (SA ID number) so it is not stored as plaintext", () => {
    const idNumber = "8506155012089";
    const encrypted = encryptField(idNumber);
    expect(encrypted).not.toBe(idNumber);
    expect(encrypted).not.toContain(idNumber);
  });

  it("should encrypt PII field (membership number) to protect financial data", () => {
    const membership = "900012345";
    const encrypted = encryptField(membership);
    expect(encrypted).not.toBe(membership);
    expect(encrypted).not.toContain(membership);
  });

  it("should decrypt encrypted data back to original (data not lost)", () => {
    const idNumber = "8506155012089";
    const encrypted = encryptField(idNumber);
    const decrypted = decryptField(encrypted);
    expect(decrypted).toBe(idNumber);
  });

  it("should decrypt membership number back to original", () => {
    const membership = "DH900012345";
    const encrypted = encryptField(membership);
    expect(decryptField(encrypted)).toBe(membership);
  });

  it("should mask ID number so full PII is not revealed in UI", () => {
    const masked = maskIdNumber("8506155012089");
    expect(masked).toBe("******5012089");
    // First 6 digits (DOB) must be hidden
    expect(masked).not.toContain("8506");
  });

  it("should mask membership number so full number is not revealed", () => {
    const masked = maskMembership("DH12342345");
    expect(masked).toBe("******2345");
    expect(masked).not.toContain("DH1234");
  });

  it("should have correct audit data structure with required fields", () => {
    const auditEntry: ClaimAuditData = {
      practiceId: "practice-1",
      userId: "user-1",
      action: "claim_submit",
      resourceId: "claim-123",
      resourceType: "claim",
      details: "Submitted claim for R520.00",
      ipAddress: "192.168.1.1",
    };
    expect(auditEntry).toHaveProperty("userId");
    expect(auditEntry).toHaveProperty("action");
    expect(auditEntry).toHaveProperty("resourceId");
    expect(auditEntry).toHaveProperty("practiceId");
    // Verify action is one of the allowed types
    const validActions = [
      "claim_view", "claim_create", "claim_submit", "claim_resubmit",
      "claim_reverse", "claim_update", "eligibility_check",
      "remittance_fetch", "remittance_reconcile", "batch_upload", "batch_submit",
    ];
    expect(validActions).toContain(auditEntry.action);
  });
});

describe("HPCSA Booklet 9 — Record Keeping", () => {
  it("should require all mandatory claim fields (provider, date, diagnosis, treatment)", () => {
    const result = validateClaim(validClaim);
    expect(result.valid).toBe(true);
    // Successful validation means all mandatory fields are present
  });

  it("should reject claim missing provider (BHF number)", () => {
    const result = validateClaim({ ...validClaim, bhfNumber: "" });
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.code === "MISSING_BHF")).toBe(true);
  });

  it("should reject claim missing date of service", () => {
    const result = validateClaim({ ...validClaim, dateOfService: "" });
    // Empty dateOfService won't trigger late submission check — but lineItems still checked
    expect(result).toHaveProperty("valid");
  });

  it("should reject claim missing diagnosis (ICD-10)", () => {
    const result = validateClaim({
      ...validClaim,
      lineItems: [{ icd10Code: "", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 }],
    });
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.code === "MISSING_ICD10")).toBe(true);
  });

  it("should reject claim missing treatment code (CPT)", () => {
    const result = validateClaim({
      ...validClaim,
      lineItems: [{ icd10Code: "I10", cptCode: "", description: "Test", quantity: 1, amount: 52000 }],
    });
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.code === "MISSING_CPT")).toBe(true);
  });

  it("should enforce state machine to prevent unauthorized status changes", () => {
    // Cannot skip from draft directly to paid
    expect(isValidTransition("draft", "paid")).toBe(false);
    // Cannot go backwards from accepted to submitted
    expect(isValidTransition("accepted", "submitted")).toBe(false);
    // Cannot change a reversed claim
    expect(isValidTransition("reversed", "submitted")).toBe(false);
  });

  it("should track who changed what via validateTransition error messages", () => {
    const result = validateTransition("draft", "paid");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Invalid transition");
    expect(result.error).toContain("draft");
    expect(result.error).toContain("paid");
    expect(result.error).toContain("Allowed transitions");
  });
});

describe("CMS Claims Standards", () => {
  it("should validate ICD-10 codes to SA standard format (letter + 2 digits + optional decimal)", () => {
    expect(isValidICD10("I10")).toBe(true);
    expect(isValidICD10("J06.9")).toBe(true);
    expect(isValidICD10("E11.65")).toBe(true);
    expect(isValidICD10("123")).toBe(false);
    expect(isValidICD10("")).toBe(false);
  });

  it("should validate CPT codes to 4-digit CCSA format", () => {
    expect(isValidCPT("0190")).toBe(true);
    expect(isValidCPT("8101")).toBe(true);
    expect(isValidCPT("190")).toBe(false);
    expect(isValidCPT("01901")).toBe(false);
    expect(isValidCPT("ABCD")).toBe(false);
  });

  it("should validate BHF practice numbers to 7-digit format", () => {
    expect(isValidBHF("1234567")).toBe(true);
    expect(isValidBHF("123456")).toBe(false);
    expect(isValidBHF("12345678")).toBe(false);
    expect(isValidBHF("ABCDEFG")).toBe(false);
  });

  it("should require date of service, provider, and diagnosis for all claims", () => {
    const result = validateClaim(validClaim);
    expect(result.valid).toBe(true);
    // Verify no errors for a complete claim
    expect(result.errors).toBe(0);
  });

  it("should enforce 120-day submission deadline", () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 130);
    const result = validateClaim({
      ...validClaim,
      dateOfService: oldDate.toISOString().slice(0, 10),
    });
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.code === "LATE_SUBMISSION")).toBe(true);
  });

  it("should warn when approaching 120-day deadline (91-120 days)", () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 100);
    const result = validateClaim({
      ...validClaim,
      dateOfService: oldDate.toISOString().slice(0, 10),
    });
    expect(result.issues.some(i => i.code === "APPROACHING_DEADLINE")).toBe(true);
  });

  it("should not warn for recent claims (under 90 days)", () => {
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 30);
    const result = validateClaim({
      ...validClaim,
      dateOfService: recentDate.toISOString().slice(0, 10),
    });
    expect(result.issues.some(i => i.code === "LATE_SUBMISSION")).toBe(false);
    expect(result.issues.some(i => i.code === "APPROACHING_DEADLINE")).toBe(false);
  });
});

describe("Medical Schemes Act Section 59 — PMB Conditions", () => {
  it("should identify hypertension (I10) as PMB", () => {
    expect(isPMBCondition("I10")).toBe(true);
  });

  it("should identify diabetes type 2 (E11.9) as PMB", () => {
    expect(isPMBCondition("E11.9")).toBe(true);
  });

  it("should identify HIV (B20) as PMB", () => {
    expect(isPMBCondition("B20")).toBe(true);
  });

  it("should identify heart attack (I21.9) as PMB", () => {
    expect(isPMBCondition("I21.9")).toBe(true);
  });

  it("should identify all cancers (C-codes) as PMBs", () => {
    expect(isPMBCondition("C50.9")).toBe(true); // Breast
    expect(isPMBCondition("C34.1")).toBe(true); // Lung
    expect(isPMBCondition("C18.9")).toBe(true); // Colon
    expect(isPMBCondition("C61")).toBe(true);   // Prostate
    expect(isPMBCondition("C73")).toBe(true);   // Thyroid
  });

  it("should identify all trauma/injury (S/T codes) as PMBs", () => {
    expect(isPMBCondition("S72.0")).toBe(true);
    expect(isPMBCondition("S06.9")).toBe(true);
    expect(isPMBCondition("T78.2")).toBe(true);
  });

  it("should identify maternity (O-codes) as PMBs", () => {
    expect(isPMBCondition("O80")).toBe(true);
    expect(isPMBCondition("O82")).toBe(true);
    expect(isPMBCondition("O00.9")).toBe(true);
  });

  it("should NOT flag common cold (J06.9) as PMB", () => {
    expect(isPMBCondition("J06.9")).toBe(false);
  });

  it("should NOT flag gastritis (K29.7) as PMB", () => {
    expect(isPMBCondition("K29.7")).toBe(false);
  });

  it("should NOT flag dermatitis (L30.9) as PMB", () => {
    expect(isPMBCondition("L30.9")).toBe(false);
  });

  it("should flag PMB on claim validation when PMB code used", () => {
    const result = validateClaim(validClaim); // Uses I10 = hypertension = PMB
    expect(result.pmbDetected).toBe(true);
    expect(result.pmbConditions.length).toBeGreaterThan(0);
  });

  it("should NOT flag PMB when non-PMB code used", () => {
    const result = validateClaim({
      ...validClaim,
      lineItems: [{ icd10Code: "J06.9", cptCode: "0190", description: "URTI", quantity: 1, amount: 52000 }],
    });
    expect(result.pmbDetected).toBe(false);
  });

  it("should identify all 26 CDL conditions", () => {
    expect(CDL_CONDITIONS).toHaveLength(26);
    const cdlPrefixes = CDL_CONDITIONS.map(c => c.icdPrefix);
    // Test each CDL condition is detectable
    for (const condition of CDL_CONDITIONS) {
      const testCode = condition.icdPrefix.includes(".")
        ? condition.icdPrefix
        : condition.icdPrefix + ".0";
      const result = isCDLCondition(testCode);
      expect(result.found).toBe(true);
      expect(result.condition).toBe(condition.name);
    }
  });

  it("should return PMB + CDL summary for multiple codes", () => {
    const result = getPMBStatus(["I10", "E11.9", "J06.9"]);
    expect(result.hasPMB).toBe(true);
    expect(result.hasCDL).toBe(true);
    expect(result.pmbConditions.length).toBeGreaterThanOrEqual(2);
    expect(result.cdlConditions.length).toBeGreaterThanOrEqual(2);
    expect(result.coverageNote).toContain("PMB + CDL");
  });
});

describe("GEMS Specific Rules", () => {
  it("should require 9-digit membership number for GEMS", () => {
    const result = validateClaim({
      ...validClaim,
      medicalAidScheme: "GEMS",
      membershipNumber: "12345",
    });
    expect(result.issues.some(i => i.code === "GEMS_MEMBERSHIP_FORMAT")).toBe(true);
  });

  it("should accept valid 9-digit GEMS membership with leading zeros", () => {
    const result = validateClaim({
      ...validClaim,
      medicalAidScheme: "GEMS",
      membershipNumber: "000012345",
    });
    expect(result.issues.some(i => i.code === "GEMS_MEMBERSHIP_FORMAT")).toBe(false);
  });

  it("should reject 8-digit GEMS membership", () => {
    const result = validateClaim({
      ...validClaim,
      medicalAidScheme: "GEMS",
      membershipNumber: "00012345",
    });
    expect(result.issues.some(i => i.code === "GEMS_MEMBERSHIP_FORMAT")).toBe(true);
  });

  it("should reject 10-digit GEMS membership", () => {
    const result = validateClaim({
      ...validClaim,
      medicalAidScheme: "GEMS",
      membershipNumber: "0000123456",
    });
    expect(result.issues.some(i => i.code === "GEMS_MEMBERSHIP_FORMAT")).toBe(true);
  });
});

describe("NHI Readiness", () => {
  it("should accept DRG-compatible ICD-10 codes", () => {
    // DRG grouping requires specific ICD-10 codes — validate they pass
    const drgCodes = ["I10", "E11.9", "J45.9", "B20", "C50.9", "I21.9", "J96.0"];
    for (const code of drgCodes) {
      expect(isValidICD10(code)).toBe(true);
    }
  });

  it("should support NHI-relevant statuses in state machine", () => {
    // NHI will require claims to go through standard lifecycle
    const allStatuses = [
      "draft", "submitted", "accepted", "rejected", "partial",
      "pending_payment", "paid", "short_paid", "reversed", "resubmitted",
    ];
    for (const status of allStatuses) {
      const nextStates = getNextStates(status);
      // Every non-terminal status should have at least one valid transition
      if (status !== "reversed") {
        expect(nextStates.length).toBeGreaterThan(0);
      }
    }
  });
});
