import { describe, it, expect } from "vitest";
import { validateClaim } from "@/lib/healthbridge/validator";
import { validateTransition } from "@/lib/healthbridge/state-machine";
import { REJECTION_CODES } from "@/lib/healthbridge/codes";

// ============================================================================
// ERROR MESSAGE QUALITY — Verify error messages are helpful, specific, and safe.
// Healthcare software errors must be actionable by non-technical practice staff.
// Standards: ISO 25010 (usability), POPIA (no internal info leakage),
//            IEC 62304 (user documentation)
// ============================================================================

describe("ERROR MESSAGES: Validator Error Codes Have Non-Empty Messages", () => {
  const allErrorCodes = [
    "MISSING_PATIENT_NAME",
    "PATIENT_NAME_TOO_LONG",
    "NOTES_TOO_LONG",
    "INVALID_DOB",
    "FUTURE_DOB",
    "INVALID_SA_ID",
    "DOB_ID_MISMATCH",
    "GENDER_MISMATCH",
    "MISSING_MEMBERSHIP",
    "MEMBERSHIP_TOO_LONG",
    "GEMS_MEMBERSHIP_FORMAT",
    "INVALID_DEPENDENT_CODE",
    "INVALID_BHF",
    "MISSING_BHF",
    "FUTURE_DOS",
    "LATE_SUBMISSION",
    "APPROACHING_DEADLINE",
    "NO_LINE_ITEMS",
    "MISSING_ICD10",
    "INVALID_ICD10_FORMAT",
    "ICD10_LOW_SPECIFICITY",
    "PMB_DETECTED",
    "CDL_CONDITION",
    "MISSING_CPT",
    "INVALID_CPT_FORMAT",
    "CLINICAL_MISMATCH",
    "INVALID_AMOUNT",
    "INVALID_QUANTITY",
    "DESCRIPTION_TOO_LONG",
    "INVALID_NAPPI",
    "DUPLICATE_ICD10",
    "AUTH_NUMBER_TOO_LONG",
    "POSSIBLE_AUTH_REQUIRED",
  ];

  // Generate test claims that trigger each error code
  const now = new Date();
  const lateDate = new Date();
  lateDate.setDate(lateDate.getDate() - 130);
  const approachDate = new Date();
  approachDate.setDate(approachDate.getDate() - 100);
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 5);

  const errorTriggers: Record<string, () => ReturnType<typeof validateClaim>> = {
    MISSING_PATIENT_NAME: () => validateClaim({ patientName: "", medicalAidScheme: "Discovery Health", membershipNumber: "900012345", dependentCode: "00", dateOfService: now.toISOString().slice(0, 10), placeOfService: "11", bhfNumber: "1234567", lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 }] }),
    PATIENT_NAME_TOO_LONG: () => validateClaim({ patientName: "A".repeat(101), medicalAidScheme: "Discovery Health", membershipNumber: "900012345", dependentCode: "00", dateOfService: now.toISOString().slice(0, 10), placeOfService: "11", bhfNumber: "1234567", lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 }] }),
    NOTES_TOO_LONG: () => validateClaim({ patientName: "Test", medicalAidScheme: "Discovery Health", membershipNumber: "900012345", dependentCode: "00", dateOfService: now.toISOString().slice(0, 10), placeOfService: "11", bhfNumber: "1234567", notes: "N".repeat(1001), lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 }] }),
    INVALID_DOB: () => validateClaim({ patientName: "Test", patientDob: "not-a-date", medicalAidScheme: "Discovery Health", membershipNumber: "900012345", dependentCode: "00", dateOfService: now.toISOString().slice(0, 10), placeOfService: "11", bhfNumber: "1234567", lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 }] }),
    FUTURE_DOB: () => validateClaim({ patientName: "Test", patientDob: futureDate.toISOString().slice(0, 10), patientIdNumber: "", medicalAidScheme: "Discovery Health", membershipNumber: "900012345", dependentCode: "00", dateOfService: now.toISOString().slice(0, 10), placeOfService: "11", bhfNumber: "1234567", lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 }] }),
    INVALID_SA_ID: () => validateClaim({ patientName: "Test", patientIdNumber: "12345", medicalAidScheme: "Discovery Health", membershipNumber: "900012345", dependentCode: "00", dateOfService: now.toISOString().slice(0, 10), placeOfService: "11", bhfNumber: "1234567", lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 }] }),
    DOB_ID_MISMATCH: () => validateClaim({ patientName: "Test", patientDob: "1990-01-01", patientIdNumber: "8506155012089", medicalAidScheme: "Discovery Health", membershipNumber: "900012345", dependentCode: "00", dateOfService: now.toISOString().slice(0, 10), placeOfService: "11", bhfNumber: "1234567", lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 }] }),
    MISSING_MEMBERSHIP: () => validateClaim({ patientName: "Test", medicalAidScheme: "Discovery Health", membershipNumber: "", dependentCode: "00", dateOfService: now.toISOString().slice(0, 10), placeOfService: "11", bhfNumber: "1234567", lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 }] }),
    GEMS_MEMBERSHIP_FORMAT: () => validateClaim({ patientName: "Test", medicalAidScheme: "GEMS", membershipNumber: "12345", dependentCode: "00", dateOfService: now.toISOString().slice(0, 10), placeOfService: "11", bhfNumber: "1234567", lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 }] }),
    INVALID_BHF: () => validateClaim({ patientName: "Test", medicalAidScheme: "Discovery Health", membershipNumber: "900012345", dependentCode: "00", dateOfService: now.toISOString().slice(0, 10), placeOfService: "11", bhfNumber: "123", lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 }] }),
    MISSING_BHF: () => validateClaim({ patientName: "Test", medicalAidScheme: "Discovery Health", membershipNumber: "900012345", dependentCode: "00", dateOfService: now.toISOString().slice(0, 10), placeOfService: "11", bhfNumber: "0000000", lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 }] }),
    LATE_SUBMISSION: () => validateClaim({ patientName: "Test", medicalAidScheme: "Discovery Health", membershipNumber: "900012345", dependentCode: "00", dateOfService: lateDate.toISOString().slice(0, 10), placeOfService: "11", bhfNumber: "1234567", lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 }] }),
    APPROACHING_DEADLINE: () => validateClaim({ patientName: "Test", medicalAidScheme: "Discovery Health", membershipNumber: "900012345", dependentCode: "00", dateOfService: approachDate.toISOString().slice(0, 10), placeOfService: "11", bhfNumber: "1234567", lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 }] }),
    NO_LINE_ITEMS: () => validateClaim({ patientName: "Test", medicalAidScheme: "Discovery Health", membershipNumber: "900012345", dependentCode: "00", dateOfService: now.toISOString().slice(0, 10), placeOfService: "11", bhfNumber: "1234567", lineItems: [] }),
    MISSING_ICD10: () => validateClaim({ patientName: "Test", medicalAidScheme: "Discovery Health", membershipNumber: "900012345", dependentCode: "00", dateOfService: now.toISOString().slice(0, 10), placeOfService: "11", bhfNumber: "1234567", lineItems: [{ icd10Code: "", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 }] }),
    INVALID_ICD10_FORMAT: () => validateClaim({ patientName: "Test", medicalAidScheme: "Discovery Health", membershipNumber: "900012345", dependentCode: "00", dateOfService: now.toISOString().slice(0, 10), placeOfService: "11", bhfNumber: "1234567", lineItems: [{ icd10Code: "INVALID", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 }] }),
    ICD10_LOW_SPECIFICITY: () => validateClaim({ patientName: "Test", medicalAidScheme: "Discovery Health", membershipNumber: "900012345", dependentCode: "00", dateOfService: now.toISOString().slice(0, 10), placeOfService: "11", bhfNumber: "1234567", lineItems: [{ icd10Code: "J06", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 }] }),
    MISSING_CPT: () => validateClaim({ patientName: "Test", medicalAidScheme: "Discovery Health", membershipNumber: "900012345", dependentCode: "00", dateOfService: now.toISOString().slice(0, 10), placeOfService: "11", bhfNumber: "1234567", lineItems: [{ icd10Code: "I10", cptCode: "", description: "Test", quantity: 1, amount: 52000 }] }),
    INVALID_CPT_FORMAT: () => validateClaim({ patientName: "Test", medicalAidScheme: "Discovery Health", membershipNumber: "900012345", dependentCode: "00", dateOfService: now.toISOString().slice(0, 10), placeOfService: "11", bhfNumber: "1234567", lineItems: [{ icd10Code: "I10", cptCode: "ABC", description: "Test", quantity: 1, amount: 52000 }] }),
    INVALID_AMOUNT: () => validateClaim({ patientName: "Test", medicalAidScheme: "Discovery Health", membershipNumber: "900012345", dependentCode: "00", dateOfService: now.toISOString().slice(0, 10), placeOfService: "11", bhfNumber: "1234567", lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 1, amount: 0 }] }),
    INVALID_QUANTITY: () => validateClaim({ patientName: "Test", medicalAidScheme: "Discovery Health", membershipNumber: "900012345", dependentCode: "00", dateOfService: now.toISOString().slice(0, 10), placeOfService: "11", bhfNumber: "1234567", lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 0, amount: 52000 }] }),
    DESCRIPTION_TOO_LONG: () => validateClaim({ patientName: "Test", medicalAidScheme: "Discovery Health", membershipNumber: "900012345", dependentCode: "00", dateOfService: now.toISOString().slice(0, 10), placeOfService: "11", bhfNumber: "1234567", lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "D".repeat(501), quantity: 1, amount: 52000 }] }),
  };

  for (const [code, trigger] of Object.entries(errorTriggers)) {
    it(`should produce non-empty message for error code ${code}`, () => {
      const result = trigger();
      const issue = result.issues.find(i => i.code === code);
      expect(issue).toBeDefined();
      expect(issue!.message).toBeTruthy();
      expect(issue!.message.length).toBeGreaterThan(5);
    });
  }
});

describe("ERROR MESSAGES: No Stack Traces or File Paths in Error Messages", () => {
  it("should not contain stack traces in any validation error message", () => {
    const lateDate = new Date();
    lateDate.setDate(lateDate.getDate() - 130);
    const result = validateClaim({
      patientName: "",
      patientDob: "invalid",
      patientIdNumber: "12345",
      medicalAidScheme: "GEMS",
      membershipNumber: "12345",
      dependentCode: "XY",
      dateOfService: lateDate.toISOString().slice(0, 10),
      placeOfService: "11",
      bhfNumber: "123",
      lineItems: [{ icd10Code: "INVALID", cptCode: "ABC", description: "D".repeat(501), quantity: 0, amount: 0 }],
    });

    for (const issue of result.issues) {
      expect(issue.message).not.toMatch(/at\s+\w+\s*\(/); // no stack traces
      expect(issue.message).not.toMatch(/\.ts:\d+/); // no file paths
      expect(issue.message).not.toMatch(/\.js:\d+/); // no JS file paths
      expect(issue.message).not.toMatch(/node_modules/); // no node_modules paths
      expect(issue.message).not.toContain("Error:"); // no raw Error objects
    }
  });

  it("should not contain file paths in any suggestion", () => {
    const result = validateClaim({
      patientName: "",
      medicalAidScheme: "Discovery Health",
      membershipNumber: "",
      dependentCode: "00",
      dateOfService: new Date().toISOString().slice(0, 10),
      placeOfService: "11",
      bhfNumber: "123",
      lineItems: [{ icd10Code: "INVALID", cptCode: "ABC", description: "Test", quantity: 1, amount: 52000 }],
    });

    for (const issue of result.issues) {
      if (issue.suggestion) {
        expect(issue.suggestion).not.toMatch(/\/[a-z]+\/[a-z]+/i); // no file paths
        expect(issue.suggestion).not.toContain("node_modules");
        expect(issue.suggestion).not.toMatch(/\.ts$/);
      }
    }
  });
});

describe("ERROR MESSAGES: SA-Specific Terminology", () => {
  it("should reference ICD-10 in ICD-10 related errors", () => {
    const result = validateClaim({
      patientName: "Test",
      medicalAidScheme: "Discovery Health",
      membershipNumber: "900012345",
      dependentCode: "00",
      dateOfService: new Date().toISOString().slice(0, 10),
      placeOfService: "11",
      bhfNumber: "1234567",
      lineItems: [{ icd10Code: "INVALID", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 }],
    });
    const icd10Issue = result.issues.find(i => i.code === "INVALID_ICD10_FORMAT");
    expect(icd10Issue!.message).toContain("ICD-10");
  });

  it("should reference BHF in BHF-related errors", () => {
    const result = validateClaim({
      patientName: "Test",
      medicalAidScheme: "Discovery Health",
      membershipNumber: "900012345",
      dependentCode: "00",
      dateOfService: new Date().toISOString().slice(0, 10),
      placeOfService: "11",
      bhfNumber: "123",
      lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 }],
    });
    const bhfIssue = result.issues.find(i => i.code === "INVALID_BHF");
    expect(bhfIssue!.message).toContain("BHF");
  });

  it("should reference GEMS in GEMS-specific errors", () => {
    const result = validateClaim({
      patientName: "Test",
      medicalAidScheme: "GEMS",
      membershipNumber: "12345",
      dependentCode: "00",
      dateOfService: new Date().toISOString().slice(0, 10),
      placeOfService: "11",
      bhfNumber: "1234567",
      lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 }],
    });
    const gemsIssue = result.issues.find(i => i.code === "GEMS_MEMBERSHIP_FORMAT");
    expect(gemsIssue!.message).toContain("GEMS");
  });

  it("should reference PMB in PMB detection messages", () => {
    const result = validateClaim({
      patientName: "Test",
      medicalAidScheme: "Discovery Health",
      membershipNumber: "900012345",
      dependentCode: "00",
      dateOfService: new Date().toISOString().slice(0, 10),
      placeOfService: "11",
      bhfNumber: "1234567",
      lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 }],
    });
    const pmbIssue = result.issues.find(i => i.code === "PMB_DETECTED");
    expect(pmbIssue).toBeDefined();
    expect(pmbIssue!.message).toContain("PMB");
  });
});

describe("ERROR MESSAGES: Rejection Codes Completeness", () => {
  it("should have descriptions for rejection codes 01 through 15", () => {
    for (let i = 1; i <= 15; i++) {
      const code = String(i).padStart(2, "0");
      expect(REJECTION_CODES[code]).toBeDefined();
      expect(REJECTION_CODES[code].length).toBeGreaterThan(5);
    }
  });

  it("should have unique descriptions for each rejection code", () => {
    const descriptions = Object.values(REJECTION_CODES);
    const uniqueDescriptions = new Set(descriptions);
    expect(descriptions.length).toBe(uniqueDescriptions.size);
  });
});

describe("ERROR MESSAGES: State Machine Error Messages", () => {
  it("should include both from/to states in invalid transition error", () => {
    const result = validateTransition("draft", "paid");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("draft");
    expect(result.error).toContain("paid");
  });

  it("should include 'terminal' in terminal state error message", () => {
    const result = validateTransition("reversed", "submitted");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("terminal");
  });

  it("should include 'Unknown claim status' for unrecognized status", () => {
    const result = validateTransition("fantasy_status", "submitted");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Unknown claim status");
    expect(result.error).toContain("fantasy_status");
  });

  it("should list allowed transitions in the error message", () => {
    const result = validateTransition("draft", "paid");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Allowed transitions");
    expect(result.error).toContain("submitted");
  });
});

describe("ERROR MESSAGES: Validation Severity Levels", () => {
  it("should block submission when errors > 0 (valid = false)", () => {
    const result = validateClaim({
      patientName: "",
      medicalAidScheme: "Discovery Health",
      membershipNumber: "900012345",
      dependentCode: "00",
      dateOfService: new Date().toISOString().slice(0, 10),
      placeOfService: "11",
      bhfNumber: "1234567",
      lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 }],
    });
    expect(result.errors).toBeGreaterThan(0);
    expect(result.valid).toBe(false);
  });

  it("should allow submission when only warnings exist (valid = true)", () => {
    const result = validateClaim({
      patientName: "Test Patient",
      medicalAidScheme: "Discovery Health",
      membershipNumber: "900012345",
      dependentCode: "00",
      dateOfService: new Date().toISOString().slice(0, 10),
      placeOfService: "11",
      bhfNumber: "1234567",
      lineItems: [{ icd10Code: "J06", cptCode: "0190", description: "URTI", quantity: 1, amount: 52000 }],
    });
    expect(result.warnings).toBeGreaterThan(0);
    expect(result.errors).toBe(0);
    expect(result.valid).toBe(true);
  });

  it("should never block submission on info-level issues", () => {
    const result = validateClaim({
      patientName: "Test Patient",
      medicalAidScheme: "Discovery Health",
      membershipNumber: "900012345",
      dependentCode: "00",
      dateOfService: new Date().toISOString().slice(0, 10),
      placeOfService: "11",
      bhfNumber: "1234567",
      lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Hypertension", quantity: 1, amount: 52000 }],
    });
    const infoIssues = result.issues.filter(i => i.severity === "info");
    expect(infoIssues.length).toBeGreaterThan(0);
    expect(result.valid).toBe(true);
  });

  it("should classify PMB detection as 'info' severity", () => {
    const result = validateClaim({
      patientName: "Test Patient",
      medicalAidScheme: "Discovery Health",
      membershipNumber: "900012345",
      dependentCode: "00",
      dateOfService: new Date().toISOString().slice(0, 10),
      placeOfService: "11",
      bhfNumber: "1234567",
      lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 }],
    });
    const pmbIssue = result.issues.find(i => i.code === "PMB_DETECTED");
    expect(pmbIssue).toBeDefined();
    expect(pmbIssue!.severity).toBe("info");
  });

  it("should classify CDL detection as 'info' severity", () => {
    const result = validateClaim({
      patientName: "Test Patient",
      medicalAidScheme: "Discovery Health",
      membershipNumber: "900012345",
      dependentCode: "00",
      dateOfService: new Date().toISOString().slice(0, 10),
      placeOfService: "11",
      bhfNumber: "1234567",
      lineItems: [{ icd10Code: "E11.9", cptCode: "0190", description: "Diabetes", quantity: 1, amount: 52000 }],
    });
    const cdlIssue = result.issues.find(i => i.code === "CDL_CONDITION");
    expect(cdlIssue).toBeDefined();
    expect(cdlIssue!.severity).toBe("info");
  });
});
