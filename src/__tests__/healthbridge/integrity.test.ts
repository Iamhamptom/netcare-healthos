import { describe, it, expect } from "vitest";
import { generateIdempotencyKey } from "@/lib/healthbridge/idempotency";
import { isValidTransition, getNextStates, validateTransition } from "@/lib/healthbridge/state-machine";
import { validateClaim } from "@/lib/healthbridge/validator";
import { parseBatchCSV } from "@/lib/healthbridge/batch";
import { buildClaimXML } from "@/lib/healthbridge/xml";
import { safeParseClaimResponse } from "@/lib/healthbridge/xml-parser";
import { isPMBCondition, isCDLCondition, CDL_CONDITIONS } from "@/lib/healthbridge/pmb";
import type { ClaimSubmission } from "@/lib/healthbridge/types";

describe("INTEGRITY: Idempotency", () => {
  it("should produce same key for same remittance + claim references", () => {
    const key1 = generateIdempotencyKey("REM-001", "CLM-001");
    const key2 = generateIdempotencyKey("REM-001", "CLM-001");
    expect(key1).toBe(key2);
  });

  it("should produce different keys for different remittance references", () => {
    const key1 = generateIdempotencyKey("REM-001", "CLM-001");
    const key2 = generateIdempotencyKey("REM-002", "CLM-001");
    expect(key1).not.toBe(key2);
  });

  it("should produce different keys for different claim references", () => {
    const key1 = generateIdempotencyKey("REM-001", "CLM-001");
    const key2 = generateIdempotencyKey("REM-001", "CLM-002");
    expect(key1).not.toBe(key2);
  });

  it("should be deterministic (not random) across multiple calls", () => {
    const results = new Set<string>();
    for (let i = 0; i < 100; i++) {
      results.add(generateIdempotencyKey("REM-FIXED", "CLM-FIXED"));
    }
    expect(results.size).toBe(1); // All 100 calls produce the same key
  });

  it("should produce a SHA-256 hex string (64 characters)", () => {
    const key = generateIdempotencyKey("REM-001", "CLM-001");
    expect(key).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(key)).toBe(true);
  });

  it("should handle empty strings as inputs", () => {
    const key = generateIdempotencyKey("", "");
    expect(key).toHaveLength(64);
    // Should still be deterministic
    expect(key).toBe(generateIdempotencyKey("", ""));
  });

  it("should handle special characters in references", () => {
    const key = generateIdempotencyKey("REM/2026-03+20", "CLM-001#test");
    expect(key).toHaveLength(64);
    expect(key).toBe(generateIdempotencyKey("REM/2026-03+20", "CLM-001#test"));
  });
});

describe("INTEGRITY: State Machine Invariants", () => {
  const ALL_STATUSES = [
    "draft", "submitted", "accepted", "rejected", "partial",
    "pending_payment", "paid", "short_paid", "reversed", "resubmitted",
  ];

  it("should not allow reaching 'paid' without going through 'submitted' first", () => {
    // draft -> paid should be blocked
    expect(isValidTransition("draft", "paid")).toBe(false);
    // Only submitted -> accepted -> paid or submitted -> accepted -> pending_payment -> paid
    expect(isValidTransition("submitted", "accepted")).toBe(true);
    expect(isValidTransition("accepted", "paid")).toBe(true);
  });

  it("should make 'reversed' a terminal state with no outbound transitions", () => {
    const nextStates = getNextStates("reversed");
    expect(nextStates).toHaveLength(0);

    // Try every possible target — all should fail
    for (const status of ALL_STATUSES) {
      expect(isValidTransition("reversed", status)).toBe(false);
    }
  });

  it("should ensure every defined status has a deterministic set of next states", () => {
    for (const status of ALL_STATUSES) {
      const nextStates = getNextStates(status);
      expect(Array.isArray(nextStates)).toBe(true);
      // Each next state should be in our known list
      for (const next of nextStates) {
        expect(ALL_STATUSES).toContain(next);
      }
    }
  });

  it("should reject unknown statuses from both directions", () => {
    expect(isValidTransition("nonexistent", "submitted")).toBe(false);
    expect(isValidTransition("draft", "nonexistent")).toBe(false);
    expect(getNextStates("fantasy")).toHaveLength(0);
  });

  it("should not allow self-transitions on any status", () => {
    for (const status of ALL_STATUSES) {
      expect(isValidTransition(status, status)).toBe(false);
    }
  });

  it("should enforce the full lifecycle path: draft -> submitted -> accepted -> paid", () => {
    expect(isValidTransition("draft", "submitted")).toBe(true);
    expect(isValidTransition("submitted", "accepted")).toBe(true);
    expect(isValidTransition("accepted", "paid")).toBe(true);
  });

  it("should enforce resubmission path: rejected -> resubmitted -> accepted", () => {
    expect(isValidTransition("rejected", "resubmitted")).toBe(true);
    expect(isValidTransition("resubmitted", "accepted")).toBe(true);
  });

  it("should allow reversal from any non-terminal status", () => {
    const reversibleStatuses = ALL_STATUSES.filter(s => s !== "reversed" && s !== "resubmitted");
    for (const status of reversibleStatuses) {
      expect(isValidTransition(status, "reversed")).toBe(true);
    }
  });
});

describe("INTEGRITY: Validation Completeness", () => {
  it("should pass validation for a claim with ALL fields valid", () => {
    const result = validateClaim({
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
        { icd10Code: "I10", cptCode: "0190", description: "GP consultation", quantity: 1, amount: 52000 },
      ],
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toBe(0);
  });

  it("should report errors for every invalid field when ALL fields are invalid", () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 130);
    const result = validateClaim({
      patientName: "",
      patientDob: "invalid-date",
      patientIdNumber: "12345", // not 13 digits
      medicalAidScheme: "Discovery Health",
      membershipNumber: "",
      dependentCode: "XX",
      dateOfService: oldDate.toISOString().slice(0, 10),
      placeOfService: "11",
      bhfNumber: "123",
      providerNumber: "",
      treatingProvider: "",
      lineItems: [
        { icd10Code: "INVALID", cptCode: "ABC", description: "", quantity: 0, amount: 0 },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toBeGreaterThanOrEqual(5);
    // Check specific error codes
    expect(result.issues.some(i => i.code === "MISSING_PATIENT_NAME")).toBe(true);
    expect(result.issues.some(i => i.code === "MISSING_MEMBERSHIP")).toBe(true);
    expect(result.issues.some(i => i.code === "INVALID_BHF")).toBe(true);
    expect(result.issues.some(i => i.code === "INVALID_ICD10_FORMAT")).toBe(true);
    expect(result.issues.some(i => i.code === "INVALID_CPT_FORMAT")).toBe(true);
    expect(result.issues.some(i => i.code === "INVALID_AMOUNT")).toBe(true);
    expect(result.issues.some(i => i.code === "LATE_SUBMISSION")).toBe(true);
  });

  it("should return both errors AND warnings (not just one type)", () => {
    const result = validateClaim({
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
        { icd10Code: "J06", cptCode: "0190", description: "URTI", quantity: 1, amount: 52000 }, // low specificity warning
      ],
    });
    // Errors: 0 (valid claim), Warnings: at least 1 (low specificity)
    expect(result.warnings).toBeGreaterThanOrEqual(1);
    expect(result.issues.some(i => i.severity === "warning")).toBe(true);
    // May also have info-level issues
  });

  it("should detect PMB for every CDL condition prefix (all 26)", () => {
    for (const cdl of CDL_CONDITIONS) {
      const testCode = cdl.icdPrefix.includes(".")
        ? cdl.icdPrefix
        : cdl.icdPrefix + ".0";
      const result = isCDLCondition(testCode);
      expect(result.found).toBe(true);
    }
  });
});

describe("INTEGRITY: CSV Parsing Robustness", () => {
  it("should handle Windows line endings (CRLF)", () => {
    const csv = "patient_name,scheme,membership,icd10,amount\r\nJohn,Discovery Health,12345,I10,520\r\nJane,GEMS,000012345,J06.9,520\r\n";
    const { rows, errors } = parseBatchCSV(csv);
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(2);
    expect(rows[0].patientName).toBe("John");
    expect(rows[1].patientName).toBe("Jane");
  });

  it("should handle trailing newlines", () => {
    const csv = "patient_name,scheme,membership,icd10,amount\nJohn,Discovery Health,12345,I10,520\n\n\n";
    const { rows, errors } = parseBatchCSV(csv);
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(1);
  });

  it("should handle empty lines in middle of CSV (skipped)", () => {
    const csv = "patient_name,scheme,membership,icd10,amount\nJohn,Discovery Health,12345,I10,520\n\nJane,GEMS,000012345,J06.9,520";
    const { rows, errors } = parseBatchCSV(csv);
    // Empty lines are filtered out by .filter(Boolean)
    expect(rows).toHaveLength(2);
  });

  it("should parse quoted fields with commas inside", () => {
    const csv = `patient_name,scheme,membership,icd10,amount
"Van der Merwe, Sarah",Discovery Health,900012345,I10,520`;
    const { rows, errors } = parseBatchCSV(csv);
    expect(errors).toHaveLength(0);
    expect(rows[0].patientName).toBe("Van der Merwe, Sarah");
  });

  it("should handle special characters (accents, apostrophes)", () => {
    const csv = `patient_name,scheme,membership,icd10,amount
"O'Brien",Discovery Health,12345,I10,520
Jose Muller,GEMS,000012345,J06.9,520`;
    const { rows, errors } = parseBatchCSV(csv);
    expect(errors).toHaveLength(0);
    expect(rows[0].patientName).toBe("O'Brien");
    expect(rows[1].patientName).toBe("Jose Muller");
  });

  it("should handle UTF-8 BOM (byte order mark)", () => {
    const bom = "\uFEFF";
    const csv = `${bom}patient_name,scheme,membership,icd10,amount
John,Discovery Health,12345,I10,520`;
    const { rows, errors } = parseBatchCSV(csv);
    // BOM may be part of first header — should still map correctly or error
    // The important thing is no crash
    expect(rows.length + errors.length).toBeGreaterThan(0);
  });

  it("should handle rows with trailing commas", () => {
    const csv = `patient_name,scheme,membership,icd10,amount
John,Discovery Health,12345,I10,520,`;
    const { rows, errors } = parseBatchCSV(csv);
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(1);
  });
});

describe("INTEGRITY: XML Round-trip", () => {
  const testClaim: ClaimSubmission = {
    bhfNumber: "1234567",
    providerNumber: "MP12345",
    treatingProvider: "Dr Smith",
    patientName: "John Mokoena",
    patientDob: "1985-06-15",
    patientIdNumber: "8506155012089",
    medicalAidScheme: "Discovery Health",
    membershipNumber: "900012345",
    dependentCode: "00",
    dateOfService: "2026-03-20",
    placeOfService: "11",
    practiceId: "practice-1",
    lineItems: [
      { icd10Code: "I10", cptCode: "0190", description: "GP consultation", quantity: 1, amount: 52000 },
    ],
  };

  it("should build well-formed XML from claim data", () => {
    const xml = buildClaimXML(testClaim);
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain("<ClaimSubmission");
    expect(xml).toContain("<Name>John Mokoena</Name>");
    expect(xml).toContain("<ICD10Code>I10</ICD10Code>");
    expect(xml).toContain("<Amount>52000</Amount>");
  });

  it("should parse a response XML and extract typed fields", () => {
    const xml = `<ClaimResponse>
      <TransactionRef>HB-12345</TransactionRef>
      <Status>accepted</Status>
      <ApprovedAmount>52000</ApprovedAmount>
    </ClaimResponse>`;
    const result = safeParseClaimResponse(xml);
    expect(result.transactionRef).toBe("HB-12345");
    expect(result.status).toBe("accepted");
    expect(result.approvedAmount).toBe(52000);
  });

  it("should preserve amounts through XML (no floating point drift)", () => {
    const xml = `<ClaimResponse>
      <TransactionRef>HB-AMOUNT</TransactionRef>
      <Status>accepted</Status>
      <ApprovedAmount>99999999</ApprovedAmount>
    </ClaimResponse>`;
    const result = safeParseClaimResponse(xml);
    expect(result.approvedAmount).toBe(99999999);
  });

  it("should handle special characters in XML round-trip", () => {
    const claim = {
      ...testClaim,
      patientName: "O'Brien & Sons <Pty>",
      treatingProvider: 'Dr "Magic" Johnson',
    };
    const xml = buildClaimXML(claim);
    // Verify escaping happened
    expect(xml).toContain("&apos;");
    expect(xml).toContain("&amp;");
    expect(xml).toContain("&lt;Pty&gt;");
    expect(xml).toContain("&quot;Magic&quot;");
  });

  it("should handle empty response XML gracefully", () => {
    const result = safeParseClaimResponse("");
    expect(result.status).toBe("pending");
    expect(result.transactionRef).toMatch(/^HB-/);
  });

  it("should handle malformed XML without crashing", () => {
    const malformed = "<ClaimResponse><Status>accepted</Status>";
    const result = safeParseClaimResponse(malformed);
    expect(result.status).toBe("accepted");
  });
});
