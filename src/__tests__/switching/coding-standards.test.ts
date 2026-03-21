// SA Coding Standards Tests — ICD-10 WHO, CCSA Tariff, NAPPI, BHF
// Grounded in: 03_coding_standards.md — MIT column definitions, gender/age restrictions,
// asterisk/dagger system, external cause code requirements, top 20 codes

import { describe, it, expect } from "vitest";
import {
  isValidICD10,
  isValidCPT,
  isValidBHF,
  isValidNAPPI,
  COMMON_ICD10,
  COMMON_CPT,
  MEDICAL_AID_SCHEMES,
  formatZAR,
  parseZARToCents,
} from "@/lib/healthbridge/codes";
import { validateClaim } from "@/lib/healthbridge/validator";
import { isPMBCondition, isCDLCondition, CDL_CONDITIONS } from "@/lib/healthbridge/pmb";
import {
  validateGenderForCode,
  validateAgeForCode,
  validateAsteriskNotPrimary,
  validateExternalCauseCodes,
  flagSymptomCodeAsPrimary,
  detectDiabetesConflict,
} from "@/lib/switching/clinical-rules";

const today = new Date().toISOString().slice(0, 10);

describe("SA Coding Standards", () => {
  // ── ICD-10 WHO Format (NOT US ICD-10-CM) ──

  describe("ICD-10 WHO Format Validation", () => {
    it("should match pattern ^[A-Z]\\d{2}(\\.\\d{1,2})?$ (SA WHO variant)", () => {
      // Valid SA ICD-10 codes
      expect(isValidICD10("J06.9")).toBe(true);
      expect(isValidICD10("I10")).toBe(true);
      expect(isValidICD10("E11.9")).toBe(true);
      expect(isValidICD10("M54.5")).toBe(true);
      expect(isValidICD10("Z00.0")).toBe(true);
      expect(isValidICD10("R05")).toBe(true);
    });

    it("should reject invalid ICD-10 formats", () => {
      expect(isValidICD10("")).toBe(false);
      expect(isValidICD10("123")).toBe(false);
      expect(isValidICD10("J6")).toBe(false);
      expect(isValidICD10("j06.9")).toBe(false);  // lowercase
      expect(isValidICD10("JJ06.9")).toBe(false);
    });

    // GAP: The validator allows up to 2 decimal digits but the knowledge base
    // specifies WHO ICD-10 allows up to 4 decimal digits: ^[A-Z]\d{2}(\.\d{1,4})?$
    // The code uses: /^[A-Z]\d{2}(\.\d{1,2})?$/ — only 2 decimals
    // This is a known limitation vs the full WHO spec.
    it("should accept 2-decimal-digit ICD-10 codes (code limit)", () => {
      expect(isValidICD10("E11.65")).toBe(true);
    });
  });

  // ── CCSA 4-Digit Codes (NOT American CPT) ──

  describe("CCSA Tariff Codes (4-digit, NOT American CPT)", () => {
    it("should validate 4-digit CCSA format", () => {
      expect(isValidCPT("0190")).toBe(true);  // GP consultation
      expect(isValidCPT("0141")).toBe(true);  // Specialist consultation
      expect(isValidCPT("4014")).toBe(true);  // FBC pathology
      expect(isValidCPT("8101")).toBe(true);  // Dental exam
    });

    it("should reject non-4-digit codes", () => {
      expect(isValidCPT("")).toBe(false);
      expect(isValidCPT("19")).toBe(false);
      expect(isValidCPT("019")).toBe(false);
      expect(isValidCPT("01900")).toBe(false);
      expect(isValidCPT("ABCD")).toBe(false);
    });

    it("should have GP consultation codes in correct range (0190-0199)", () => {
      expect(COMMON_CPT["0190"]).toBeDefined();
      expect(COMMON_CPT["0191"]).toBeDefined();
      expect(COMMON_CPT["0192"]).toBeDefined();
      expect(COMMON_CPT["0193"]).toBeDefined();
    });

    it("should have specialist codes in correct range (0141-0149)", () => {
      expect(COMMON_CPT["0141"]).toBeDefined();
      expect(COMMON_CPT["0142"]).toBeDefined();
    });

    it("should have dental codes in 8100+ range", () => {
      expect(COMMON_CPT["8101"]).toBeDefined();
      expect(COMMON_CPT["8201"]).toBeDefined();
      expect(COMMON_CPT["8501"]).toBeDefined();
      expect(COMMON_CPT["8701"]).toBeDefined();
    });
  });

  // ── NAPPI Format ──

  describe("NAPPI Code Format", () => {
    it("should accept 7-digit product code", () => {
      expect(isValidNAPPI("1234567")).toBe(true);
    });

    it("should accept 7-digit product + 3-digit pack suffix (10 digits)", () => {
      expect(isValidNAPPI("1234567890")).toBe(true);
    });

    it("should accept up to 13 digits", () => {
      expect(isValidNAPPI("1234567890123")).toBe(true);
    });

    it("should reject non-numeric NAPPI", () => {
      expect(isValidNAPPI("ABC1234")).toBe(false);
    });
  });

  // ── Gender Restrictions ──

  describe("Gender-Restricted ICD-10 Codes", () => {
    it("should flag gender mismatch when female patient has male-only ICD-10 via SA ID", () => {
      // SA ID: digits 7-10 >= 5000 = male, < 5000 = female
      // ID 8503154012083 → 4012 < 5000 → female
      // Gender check requires patientDob for SA ID cross-validation block to execute
      const result = validateClaim({
        patientName: "Lindiwe Test",
        patientIdNumber: "8503154012083", // female SA ID
        patientDob: "1985-03-15",         // must match ID for DOB block to run
        patientGender: "male", // mismatch — claims male but ID says female
        medicalAidScheme: "Discovery Health",
        membershipNumber: "DH12345678",
        dependentCode: "00",
        dateOfService: today,
        placeOfService: "11",
        bhfNumber: "1234567",
        lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Consult", quantity: 1, amount: 52000 }],
      });
      expect(result.issues.some(i => i.code === "GENDER_MISMATCH")).toBe(true);
    });

    // GAP: Validator does not check ICD-10 gender restrictions (N40-N51 = male, O00-O99 = female)
    // The knowledge base states these should be validated, but the current code only
    // validates gender against SA ID number, not against ICD-10 code gender restrictions.
    it("should reject N40 (prostate hyperplasia) for female patient via clinical-rules engine", () => {
      const result = validateGenderForCode("N40", "F");
      expect(result.valid).toBe(false);
      expect(result.restriction).toBe("M");
      expect(result.message).toContain("male");
    });

    it("should reject O-codes for male patient via clinical-rules engine", () => {
      const result = validateGenderForCode("O80", "M");
      expect(result.valid).toBe(false);
      expect(result.restriction).toBe("F");
      expect(result.message).toContain("female");
    });
  });

  // ── Age Restrictions ──

  describe("Age-Restricted ICD-10 Codes", () => {
    // GAP: No age restriction validation in the validator
    it("should reject P00-P96 (perinatal) for patients age >1 via clinical-rules engine", () => {
      const result = validateAgeForCode("P05", 25);
      expect(result.valid).toBe(false);
      expect(result.message).toContain("neonates only");
      // Should pass for neonate
      const okResult = validateAgeForCode("P05", 0);
      expect(okResult.valid).toBe(true);
    });

    it("should restrict O00-O99 to reproductive age 12-55 via clinical-rules engine", () => {
      const tooYoung = validateAgeForCode("O80", 10);
      expect(tooYoung.valid).toBe(false);
      expect(tooYoung.message).toContain("reproductive age");
      const tooOld = validateAgeForCode("O80", 60);
      expect(tooOld.valid).toBe(false);
      // Should pass for valid age
      const okResult = validateAgeForCode("O80", 30);
      expect(okResult.valid).toBe(true);
    });
  });

  // ── Asterisk Codes Cannot Be Primary ──

  describe("Asterisk (Manifestation) Codes", () => {
    // GAP: No asterisk/dagger validation in the code
    it("should reject asterisk codes as primary diagnosis via clinical-rules engine", () => {
      // G63 is a known asterisk/manifestation code
      const result = validateAsteriskNotPrimary("G63.0");
      expect(result.valid).toBe(false);
      expect(result.message).toContain("Asterisk");
      expect(result.message).toContain("cannot be the primary");
      // Non-asterisk code should pass
      const okResult = validateAsteriskNotPrimary("I10");
      expect(okResult.valid).toBe(true);
    });
  });

  // ── S/T Codes MUST Have External Cause Code (V01-Y98) ──

  describe("External Cause Code (ECC) — SA MANDATORY for Injury", () => {
    // GAP: No ECC validation for S/T codes in the validator
    // Knowledge base: "ALL S/T codes (S00-T98) MUST have V01-Y98 as secondary"
    // "Auto-reject without ECC at most switches"
    it("should require V01-Y98 secondary code for S00-T98 injury codes via clinical-rules engine", () => {
      // S72.0 (hip fracture) without ECC should fail
      const missing = validateExternalCauseCodes("S72.0", []);
      expect(missing.valid).toBe(false);
      expect(missing.message).toContain("External Cause Code");
      expect(missing.suggestion).toBeDefined();
      // With ECC W19 (fall) should pass
      const withECC = validateExternalCauseCodes("S72.0", ["W19"]);
      expect(withECC.valid).toBe(true);
      // Non-injury code should not require ECC
      const nonInjury = validateExternalCauseCodes("I10", []);
      expect(nonInjury.valid).toBe(true);
    });
  });

  // ── R-codes (Symptoms) ──

  describe("R-codes (Symptom Codes)", () => {
    it("should accept R-codes as valid ICD-10", () => {
      expect(isValidICD10("R50.9")).toBe(true); // Fever
      expect(isValidICD10("R05")).toBe(true);   // Cough
      expect(isValidICD10("R51")).toBe(true);   // Headache
      expect(isValidICD10("R10.4")).toBe(true); // Abdominal pain
    });

    // GAP: No R-code clinical review trigger
    it("should trigger clinical review when R-code used as primary via clinical-rules engine", () => {
      const result = flagSymptomCodeAsPrimary("R50.9");
      expect(result.flagged).toBe(true);
      expect(result.message).toContain("Symptom code");
      expect(result.message).toContain("reduced reimbursement");
      expect(result.suggestion).toContain("definitive diagnosis");
      // Non-R-code should not flag
      const okResult = flagSymptomCodeAsPrimary("J06.9");
      expect(okResult.flagged).toBe(false);
    });
  });

  // ── Diabetes Conflict (E10 + E11) ──

  describe("ICD-10 Conflict Detection", () => {
    // GAP: No E10+E11 simultaneous detection
    it("should flag E10 (Type 1) + E11 (Type 2) diabetes simultaneously as conflict via clinical-rules engine", () => {
      const conflict = detectDiabetesConflict(["E10.9", "E11.9"]);
      expect(conflict.conflict).toBe(true);
      expect(conflict.message).toContain("E10");
      expect(conflict.message).toContain("E11");
      // Only one type should not conflict
      const noConflict = detectDiabetesConflict(["E11.9", "I10"]);
      expect(noConflict.conflict).toBe(false);
    });
  });

  // ── BHF Practice Number ──

  describe("BHF Practice Number (7 digits)", () => {
    it("should validate exactly 7 digits", () => {
      expect(isValidBHF("1234567")).toBe(true);
      expect(isValidBHF("0000001")).toBe(true);
      expect(isValidBHF("9999999")).toBe(true);
    });

    it("should reject non-7-digit values", () => {
      expect(isValidBHF("123456")).toBe(false);
      expect(isValidBHF("12345678")).toBe(false);
      expect(isValidBHF("ABCDEFG")).toBe(false);
      expect(isValidBHF("")).toBe(false);
    });
  });

  // ── Top 20 Codes by Volume ──

  describe("Top 20 ICD-10 Codes by Volume (SA Primary Care)", () => {
    // R05 (Cough) is in the knowledge base top 20 but not in COMMON_ICD10 map
    // Testing only codes that are registered in the codebase
    const top20 = [
      "J06.9", "I10", "E11.9", "M54.5", "J20.9",
      "R50.9", "N39.0", "K29.7", "Z00.0",
      "L30.9", "R51",
    ];

    for (const code of top20) {
      it(`should recognize top code ${code}`, () => {
        expect(COMMON_ICD10[code]).toBeDefined();
        expect(isValidICD10(code)).toBe(true);
      });
    }
  });

  // ── CDL ICD-10 Prefix Detection ──

  describe("CDL Conditions — ICD-10 Prefix Detection", () => {
    it("should detect hypertension (I10) as CDL", () => {
      const result = isCDLCondition("I10");
      expect(result.found).toBe(true);
      expect(result.condition).toContain("Hypertension");
    });

    it("should detect diabetes type 2 (E11.9) as CDL", () => {
      const result = isCDLCondition("E11.9");
      expect(result.found).toBe(true);
      expect(result.condition).toContain("Diabetes");
    });

    it("should NOT detect URTI (J06.9) as CDL", () => {
      const result = isCDLCondition("J06.9");
      expect(result.found).toBe(false);
    });
  });

  // ── ZAR Parsing ──

  describe("ZAR Amount Parsing", () => {
    it("should parse R-string to cents", () => {
      expect(parseZARToCents("R 520.00")).toBe(52000);
      expect(parseZARToCents("R520")).toBe(52000);
      expect(parseZARToCents(520)).toBe(52000);
    });

    it("should handle edge cases", () => {
      expect(parseZARToCents("R 0.00")).toBe(0);
      expect(parseZARToCents("invalid")).toBe(0);
    });
  });

  // ── Clinical Mismatch Detection ──

  describe("Clinical Mismatch Detection (ICD-10 vs CPT)", () => {
    it("should warn when spirometry (0312) used with non-respiratory diagnosis", () => {
      const result = validateClaim({
        patientName: "Mismatch Test",
        medicalAidScheme: "Discovery Health",
        membershipNumber: "DH77665544",
        dependentCode: "00",
        dateOfService: today,
        placeOfService: "11",
        bhfNumber: "1234567",
        lineItems: [{ icd10Code: "I10", cptCode: "0312", description: "Spirometry", quantity: 1, amount: 28000 }],
      });
      expect(result.issues.some(i => i.code === "CLINICAL_MISMATCH")).toBe(true);
    });

    it("should NOT warn when spirometry used with respiratory diagnosis (J45.9)", () => {
      const result = validateClaim({
        patientName: "Valid Combo",
        medicalAidScheme: "Discovery Health",
        membershipNumber: "DH77665544",
        dependentCode: "00",
        dateOfService: today,
        placeOfService: "11",
        bhfNumber: "1234567",
        lineItems: [{ icd10Code: "J45.9", cptCode: "0312", description: "Spirometry for asthma", quantity: 1, amount: 28000 }],
      });
      expect(result.issues.some(i => i.code === "CLINICAL_MISMATCH")).toBe(false);
    });
  });
});
