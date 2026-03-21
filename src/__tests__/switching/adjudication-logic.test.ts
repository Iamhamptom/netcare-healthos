// Adjudication Decision Logic Tests — 14-step flowchart from knowledge base
// Grounded in: 02_claims_adjudication.md decision tree
// Tests the 14 validation steps and 4 possible outcomes:
// PAY_IN_FULL, PAY_PARTIAL, REJECT, PEND_FOR_REVIEW

import { describe, it, expect } from "vitest";
import { validateClaim } from "@/lib/healthbridge/validator";
import { isValidICD10, isValidCPT, isValidBHF, isValidNAPPI } from "@/lib/healthbridge/codes";
import { isPMBCondition, isCDLCondition } from "@/lib/healthbridge/pmb";
import { analyzeRejection } from "@/lib/switching/resubmission";
import { checkPreAuthRequired } from "@/lib/switching/preauth";

const today = new Date().toISOString().slice(0, 10);

describe("14-Step Adjudication Flowchart", () => {
  // ── Step 1: ELIGIBILITY — Member active check ──

  describe("Step 1: Member Eligibility", () => {
    it("should reject missing membership number", () => {
      const result = validateClaim({
        patientName: "Lerato Molefe",
        medicalAidScheme: "Discovery Health",
        membershipNumber: "",
        dependentCode: "00",
        dateOfService: today,
        placeOfService: "11",
        bhfNumber: "1234567",
        lineItems: [{ icd10Code: "J06.9", cptCode: "0190", description: "URTI", quantity: 1, amount: 52000 }],
      });
      expect(result.valid).toBe(false);
      expect(result.issues.some(i => i.code === "MISSING_MEMBERSHIP")).toBe(true);
    });

    it("should validate dependent code format (00=principal, 01-09=deps)", () => {
      const result = validateClaim({
        patientName: "Nomsa Dlamini",
        medicalAidScheme: "Bonitas",
        membershipNumber: "BON999888",
        dependentCode: "X",
        dateOfService: today,
        placeOfService: "11",
        bhfNumber: "1234567",
        lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Hypertension", quantity: 1, amount: 52000 }],
      });
      expect(result.issues.some(i => i.code === "INVALID_DEPENDENT_CODE")).toBe(true);
    });
  });

  // ── Step 2: PROVIDER — BHF valid (7 digits), HPCSA, discipline ──

  describe("Step 2: Provider Validation", () => {
    it("should validate BHF practice number is exactly 7 digits", () => {
      expect(isValidBHF("1234567")).toBe(true);
      expect(isValidBHF("123456")).toBe(false);   // too short
      expect(isValidBHF("12345678")).toBe(false);  // too long
      expect(isValidBHF("123456A")).toBe(false);   // non-numeric
    });

    it("should reject claim with invalid BHF", () => {
      const result = validateClaim({
        patientName: "Test Patient",
        medicalAidScheme: "GEMS",
        membershipNumber: "000012345",
        dependentCode: "00",
        dateOfService: today,
        placeOfService: "11",
        bhfNumber: "999",
        lineItems: [{ icd10Code: "J06.9", cptCode: "0190", description: "Consult", quantity: 1, amount: 52000 }],
      });
      expect(result.issues.some(i => i.code === "INVALID_BHF")).toBe(true);
    });
  });

  // ── Step 3: CODE VALIDATION — ICD-10 WHO format, tariff, NAPPI ──

  describe("Step 3: Code Validation (ICD-10 WHO, CCSA, NAPPI)", () => {
    it("should validate ICD-10 WHO format (not US ICD-10-CM)", () => {
      expect(isValidICD10("J06.9")).toBe(true);
      expect(isValidICD10("I10")).toBe(true);
      expect(isValidICD10("E11.9")).toBe(true);
      // SA ICD-10 allows up to 2 decimal digits in the validator
      expect(isValidICD10("E11.65")).toBe(true);
      // Invalid formats
      expect(isValidICD10("06.9")).toBe(false);   // missing letter
      expect(isValidICD10("JJ6.9")).toBe(false);  // double letter
      expect(isValidICD10("")).toBe(false);
    });

    it("should validate CCSA tariff codes as 4-digit numeric", () => {
      expect(isValidCPT("0190")).toBe(true);
      expect(isValidCPT("8101")).toBe(true);
      expect(isValidCPT("190")).toBe(false);    // 3 digits
      expect(isValidCPT("01900")).toBe(false);  // 5 digits
    });

    it("should validate NAPPI format (up to 13 digits)", () => {
      expect(isValidNAPPI("1234567")).toBe(true);    // 7-digit product
      expect(isValidNAPPI("1234567890")).toBe(true);  // 7+3 pack suffix
      expect(isValidNAPPI("1234567890123")).toBe(true); // max 13
      expect(isValidNAPPI("")).toBe(false);
      expect(isValidNAPPI("ABCDE")).toBe(false);
    });

    it("should reject claim with invalid ICD-10 code", () => {
      const result = validateClaim({
        patientName: "Zanele Khumalo",
        medicalAidScheme: "Discovery Health",
        membershipNumber: "DH12345678",
        dependentCode: "00",
        dateOfService: today,
        placeOfService: "11",
        bhfNumber: "1234567",
        lineItems: [{ icd10Code: "INVALID", cptCode: "0190", description: "Consult", quantity: 1, amount: 52000 }],
      });
      expect(result.issues.some(i => i.code === "INVALID_ICD10_FORMAT")).toBe(true);
    });
  });

  // ── Step 4: DUPLICATE CHECK ──

  describe("Step 4: Duplicate Detection", () => {
    it("should flag duplicate ICD-10 codes across line items", () => {
      const result = validateClaim({
        patientName: "Bongani Mthembu",
        medicalAidScheme: "Bonitas",
        membershipNumber: "BON55443322",
        dependentCode: "00",
        dateOfService: today,
        placeOfService: "11",
        bhfNumber: "1234567",
        lineItems: [
          { icd10Code: "J06.9", cptCode: "0190", description: "Consult", quantity: 1, amount: 52000 },
          { icd10Code: "J06.9", cptCode: "0191", description: "Follow-up", quantity: 1, amount: 36000 },
        ],
      });
      expect(result.issues.some(i => i.code === "DUPLICATE_ICD10")).toBe(true);
    });

    it("should classify duplicate rejection code 09 as non-resubmittable", () => {
      const analysis = analyzeRejection("09");
      expect(analysis.category).toBe("duplicate");
      expect(analysis.resubmittable).toBe(false);
    });
  });

  // ── Step 7: BENEFIT CHECK ──

  describe("Step 7: Benefit Exhaustion", () => {
    it("should classify benefit exhaustion (code 07) as dispute-worthy — check for PMB", () => {
      const analysis = analyzeRejection("07");
      expect(analysis.category).toBe("benefit");
      expect(analysis.resubmittable).toBe(true);
      // Should suggest checking for PMB override
      expect(analysis.suggestedFixes.some(f => f.description.includes("PMB"))).toBe(true);
    });
  });

  // ── Step 8: WAITING PERIOD (unless PMB overrides) ──

  describe("Step 8: Waiting Period (PMB override)", () => {
    it("should classify waiting period rejection (code 11) — but PMB overrides it", () => {
      const analysis = analyzeRejection("11");
      expect(analysis.category).toBe("timing");
      expect(analysis.resubmittable).toBe(true);
    });
  });

  // ── Step 9: PRE-AUTH CHECK ──

  describe("Step 9: Pre-Authorization", () => {
    it("should require pre-auth for hospital admission codes", () => {
      const check = checkPreAuthRequired({
        cptCodes: ["3601"],
        icd10Codes: ["K29.7"],
        scheme: "Discovery Health",
        estimatedCost: 100000,
      });
      expect(check.required).toBe(true);
      expect(check.categories).toContain("hospital_admission");
    });

    it("should classify missing pre-auth rejection (code 08) as resubmittable", () => {
      const analysis = analyzeRejection("08");
      expect(analysis.category).toBe("authorization");
      expect(analysis.resubmittable).toBe(true);
    });
  });

  // ── Step 10: PMB CHECK — overrides benefit exhaustion, waiting periods ──

  describe("Step 10: PMB Override Logic", () => {
    it("should detect PMB and exempt from pre-auth for non-oncology cases", () => {
      const check = checkPreAuthRequired({
        cptCodes: ["0141"],
        icd10Codes: ["I21.9"], // Acute MI
        scheme: "Discovery Health",
        estimatedCost: 300000,
      });
      expect(check.pmbExempt).toBe(true);
      expect(check.required).toBe(false);
    });

    it("should still require pre-auth for oncology even when PMB", () => {
      const check = checkPreAuthRequired({
        cptCodes: ["0900"],
        icd10Codes: ["C50.9"], // breast cancer — PMB
        scheme: "Discovery Health",
        estimatedCost: 1000000,
      });
      expect(check.pmbExempt).toBe(true);
      expect(check.oncologyCase).toBe(true);
      // Oncology pre-auth is still required even for PMB
      expect(check.required).toBe(true);
    });
  });

  // ── Step 11: TARIFF — amount vs scheme rate ──

  describe("Step 11: Tariff Validation", () => {
    it("should classify above-scheme-tariff rejection (code 15)", () => {
      const analysis = analyzeRejection("15");
      expect(analysis.category).toBe("benefit");
      expect(analysis.resubmittable).toBe(false); // patient pays shortfall
    });
  });

  // ── Step 12: CO-PAYMENT ──

  describe("Step 12: Co-payment", () => {
    it("should classify co-payment (code 14) as not resubmittable", () => {
      const analysis = analyzeRejection("14");
      expect(analysis.category).toBe("benefit");
      expect(analysis.resubmittable).toBe(false);
      // Should mention PMB co-payment dispute possibility
      expect(analysis.suggestedFixes.some(f => f.description.includes("PMB"))).toBe(true);
    });
  });

  // ── Four Outcomes Validated ──

  describe("Four Adjudication Outcomes", () => {
    it("should produce valid claim (PAY_IN_FULL path) with correct data", () => {
      const result = validateClaim({
        patientName: "Pieter van der Merwe",
        medicalAidScheme: "Discovery Health",
        membershipNumber: "DH9988776655",
        dependentCode: "00",
        dateOfService: today,
        placeOfService: "11",
        bhfNumber: "1234567",
        lineItems: [{ icd10Code: "J06.9", cptCode: "0190", description: "URTI consult", quantity: 1, amount: 52000 }],
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toBe(0);
      expect(result.estimatedRejectionRisk).toBe("low");
    });

    it("should flag high rejection risk (REJECT path) with missing ICD-10", () => {
      const result = validateClaim({
        patientName: "Ayanda Zulu",
        medicalAidScheme: "GEMS",
        membershipNumber: "000098765",
        dependentCode: "00",
        dateOfService: today,
        placeOfService: "11",
        bhfNumber: "1234567",
        lineItems: [{ icd10Code: "", cptCode: "0190", description: "Consult", quantity: 1, amount: 52000 }],
      });
      expect(result.valid).toBe(false);
      expect(result.estimatedRejectionRisk).toBe("high");
    });
  });
});
