import { describe, it, expect } from "vitest";
import { isValidICD10, isValidCPT, isValidBHF, isValidNAPPI, parseZARToCents, formatZAR } from "@/lib/healthbridge/codes";
import { validateClaim } from "@/lib/healthbridge/validator";

// ============================================================================
// BOUNDARY VALUE ANALYSIS — Systematic boundary testing for all numeric/string
// boundaries in the SA healthcare switching system.
// Standards: IEC 62304, ISO 13485, SA BHF practice number format,
//            HPCSA coding standards, Medical Schemes Act 131 of 1998
// ============================================================================

const baseValidClaim = {
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
};

describe("BOUNDARY: ICD-10 Code Format Boundaries", () => {
  it("should accept exactly 3 characters — minimum valid (A00)", () => {
    expect(isValidICD10("A00")).toBe(true);
  });

  it("should accept exactly 5 characters with 1 decimal digit (A00.0)", () => {
    expect(isValidICD10("A00.0")).toBe(true);
  });

  it("should accept exactly 6 characters with 2 decimal digits — maximum valid (A00.00)", () => {
    expect(isValidICD10("A00.00")).toBe(true);
  });

  it("should reject 2 characters (A0) — too short", () => {
    expect(isValidICD10("A0")).toBe(false);
  });

  it("should reject 7 characters (A00.000) — too long (3 decimal digits)", () => {
    expect(isValidICD10("A00.000")).toBe(false);
  });

  it("should accept first char A-Z (boundary: A and Z)", () => {
    expect(isValidICD10("A00")).toBe(true);
    expect(isValidICD10("Z99")).toBe(true);
  });

  it("should reject first char lowercase a-z", () => {
    expect(isValidICD10("a00")).toBe(false);
    expect(isValidICD10("z99")).toBe(false);
  });

  it("should reject first char 0-9", () => {
    expect(isValidICD10("000")).toBe(false);
    expect(isValidICD10("999")).toBe(false);
  });

  it("should reject first char special characters", () => {
    expect(isValidICD10("#00")).toBe(false);
    expect(isValidICD10("@00")).toBe(false);
    expect(isValidICD10("$00")).toBe(false);
  });

  it("should require digits for second and third characters", () => {
    expect(isValidICD10("A99")).toBe(true);
    expect(isValidICD10("A00")).toBe(true);
  });

  it("should reject letters in second/third position", () => {
    expect(isValidICD10("AAA")).toBe(false);
    expect(isValidICD10("A0A")).toBe(false);
    expect(isValidICD10("AA0")).toBe(false);
  });

  it("should require . as decimal separator, not comma", () => {
    expect(isValidICD10("A00.1")).toBe(true);
    expect(isValidICD10("A00,1")).toBe(false);
  });

  it("should reject colon as decimal separator", () => {
    expect(isValidICD10("A00:1")).toBe(false);
  });

  it("should reject forward slash as decimal separator", () => {
    expect(isValidICD10("A00/1")).toBe(false);
  });

  it("should accept every letter A through Z as first character", () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (const letter of letters) {
      expect(isValidICD10(`${letter}00`)).toBe(true);
    }
  });
});

describe("BOUNDARY: CPT Code Boundaries", () => {
  it("should accept exactly 4 digits: '0000' (minimum)", () => {
    expect(isValidCPT("0000")).toBe(true);
  });

  it("should accept exactly 4 digits: '9999' (maximum)", () => {
    expect(isValidCPT("9999")).toBe(true);
  });

  it("should reject 3 digits: '999'", () => {
    expect(isValidCPT("999")).toBe(false);
  });

  it("should reject 5 digits: '00000'", () => {
    expect(isValidCPT("00000")).toBe(false);
  });

  it("should preserve leading zeros: '0190' is valid, not truncated to '190'", () => {
    expect(isValidCPT("0190")).toBe(true);
    expect(isValidCPT("0001")).toBe(true);
    expect(isValidCPT("0010")).toBe(true);
  });

  it("should reject alphabetic CPT codes", () => {
    expect(isValidCPT("ABCD")).toBe(false);
    expect(isValidCPT("019A")).toBe(false);
  });

  it("should reject CPT with spaces", () => {
    expect(isValidCPT(" 190")).toBe(false);
    expect(isValidCPT("019 ")).toBe(false);
  });
});

describe("BOUNDARY: BHF Practice Number Boundaries", () => {
  it("should accept exactly 7 digits: '0000000' (minimum)", () => {
    expect(isValidBHF("0000000")).toBe(true);
  });

  it("should accept exactly 7 digits: '9999999' (maximum)", () => {
    expect(isValidBHF("9999999")).toBe(true);
  });

  it("should reject 6 digits", () => {
    expect(isValidBHF("123456")).toBe(false);
  });

  it("should reject 8 digits", () => {
    expect(isValidBHF("12345678")).toBe(false);
  });

  it("should reject alphabetic BHF", () => {
    expect(isValidBHF("ABCDEFG")).toBe(false);
  });

  it("should reject BHF with spaces", () => {
    expect(isValidBHF("123 456")).toBe(false);
  });
});

describe("BOUNDARY: NAPPI Code Boundaries", () => {
  it("should accept 1 digit — minimum valid", () => {
    expect(isValidNAPPI("1")).toBe(true);
  });

  it("should accept 13 digits — maximum valid", () => {
    expect(isValidNAPPI("1234567890123")).toBe(true);
  });

  it("should reject 14 digits — too long", () => {
    expect(isValidNAPPI("12345678901234")).toBe(false);
  });

  it("should reject 0 digits (empty string)", () => {
    expect(isValidNAPPI("")).toBe(false);
  });

  it("should accept all single digits 0-9", () => {
    for (let d = 0; d <= 9; d++) {
      expect(isValidNAPPI(String(d))).toBe(true);
    }
  });

  it("should accept exactly 12 digits", () => {
    expect(isValidNAPPI("123456789012")).toBe(true);
  });
});

describe("BOUNDARY: SA ID Number Boundaries", () => {
  it("should accept exactly 13 digits (no SA_ID warning)", () => {
    const result = validateClaim({
      ...baseValidClaim,
      patientIdNumber: "8506155012089",
      patientDob: "1985-06-15",
    });
    expect(result.issues.some(i => i.code === "INVALID_SA_ID")).toBe(false);
  });

  it("should warn on 12 digits (not 13)", () => {
    const result = validateClaim({
      ...baseValidClaim,
      patientIdNumber: "850615501208",
    });
    expect(result.issues.some(i => i.code === "INVALID_SA_ID")).toBe(true);
  });

  it("should warn on 14 digits (not 13)", () => {
    const result = validateClaim({
      ...baseValidClaim,
      patientIdNumber: "85061550120890",
    });
    expect(result.issues.some(i => i.code === "INVALID_SA_ID")).toBe(true);
  });

  it("should detect YYMMDD '000101' (2000-01-01) in ID matches DOB", () => {
    const result = validateClaim({
      ...baseValidClaim,
      patientIdNumber: "0001015012089",
      patientDob: "2000-01-01",
    });
    expect(result.issues.some(i => i.code === "DOB_ID_MISMATCH")).toBe(false);
  });

  it("should detect gender digits 0000-4999 = female", () => {
    // ID with gender digits 0000 (female minimum)
    const result = validateClaim({
      ...baseValidClaim,
      patientIdNumber: "8506150000089", // 0000 = female min
      patientDob: "1985-06-15",
      patientGender: "female",
    });
    expect(result.issues.some(i => i.code === "GENDER_MISMATCH")).toBe(false);
  });

  it("should detect gender digits 4999 = female max boundary", () => {
    const result = validateClaim({
      ...baseValidClaim,
      patientIdNumber: "8506154999089", // 4999 = female max
      patientDob: "1985-06-15",
      patientGender: "female",
    });
    expect(result.issues.some(i => i.code === "GENDER_MISMATCH")).toBe(false);
  });

  it("should detect gender digits 5000 = male min boundary", () => {
    const result = validateClaim({
      ...baseValidClaim,
      patientIdNumber: "8506155000089", // 5000 = male min
      patientDob: "1985-06-15",
      patientGender: "male",
    });
    expect(result.issues.some(i => i.code === "GENDER_MISMATCH")).toBe(false);
  });

  it("should detect gender digits 9999 = male max boundary", () => {
    const result = validateClaim({
      ...baseValidClaim,
      patientIdNumber: "8506159999089", // 9999 = male max
      patientDob: "1985-06-15",
      patientGender: "male",
    });
    expect(result.issues.some(i => i.code === "GENDER_MISMATCH")).toBe(false);
  });

  it("should detect gender boundary crossover: 5000 with female = mismatch", () => {
    const result = validateClaim({
      ...baseValidClaim,
      patientIdNumber: "8506155000089",
      patientDob: "1985-06-15",
      patientGender: "female",
    });
    expect(result.issues.some(i => i.code === "GENDER_MISMATCH")).toBe(true);
  });

  it("should detect gender boundary crossover: 4999 with male = mismatch", () => {
    const result = validateClaim({
      ...baseValidClaim,
      patientIdNumber: "8506154999089",
      patientDob: "1985-06-15",
      patientGender: "male",
    });
    expect(result.issues.some(i => i.code === "GENDER_MISMATCH")).toBe(true);
  });

  it("should accept citizenship digit 0 (SA citizen)", () => {
    // Digit 11 (index 10) = 0 means SA citizen
    // In ID 8506155012089, digit at index 10 = 0 (SA citizen)
    const result = validateClaim({
      ...baseValidClaim,
      patientIdNumber: "8506155012089",
      patientDob: "1985-06-15",
    });
    expect(result.issues.some(i => i.code === "INVALID_SA_ID")).toBe(false);
  });
});

describe("BOUNDARY: Date of Service Boundaries", () => {
  it("should accept date of service = today", () => {
    const result = validateClaim({
      ...baseValidClaim,
      dateOfService: new Date().toISOString().slice(0, 10),
    });
    expect(result.issues.some(i => i.code === "FUTURE_DOS")).toBe(false);
    expect(result.issues.some(i => i.code === "LATE_SUBMISSION")).toBe(false);
  });

  it("should reject date of service = tomorrow (future)", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const result = validateClaim({
      ...baseValidClaim,
      dateOfService: tomorrow.toISOString().slice(0, 10),
    });
    expect(result.issues.some(i => i.code === "FUTURE_DOS")).toBe(true);
  });

  it("should not warn at exactly 90 days ago (just under approaching threshold)", () => {
    const d = new Date();
    d.setDate(d.getDate() - 90);
    const result = validateClaim({
      ...baseValidClaim,
      dateOfService: d.toISOString().slice(0, 10),
    });
    expect(result.issues.some(i => i.code === "APPROACHING_DEADLINE")).toBe(false);
    expect(result.issues.some(i => i.code === "LATE_SUBMISSION")).toBe(false);
  });

  it("should warn at exactly 91 days ago (approaching deadline)", () => {
    const d = new Date();
    d.setDate(d.getDate() - 91);
    const result = validateClaim({
      ...baseValidClaim,
      dateOfService: d.toISOString().slice(0, 10),
    });
    expect(result.issues.some(i => i.code === "APPROACHING_DEADLINE")).toBe(true);
  });

  it("should warn at exactly 119 days ago (still approaching, not late)", () => {
    const d = new Date();
    d.setDate(d.getDate() - 119);
    const result = validateClaim({
      ...baseValidClaim,
      dateOfService: d.toISOString().slice(0, 10),
    });
    expect(result.issues.some(i => i.code === "APPROACHING_DEADLINE")).toBe(true);
    expect(result.issues.some(i => i.code === "LATE_SUBMISSION")).toBe(false);
  });

  it("should warn at exactly 120 days ago (last day, approaching but not late)", () => {
    const d = new Date();
    d.setDate(d.getDate() - 120);
    const result = validateClaim({
      ...baseValidClaim,
      dateOfService: d.toISOString().slice(0, 10),
    });
    expect(result.issues.some(i => i.code === "LATE_SUBMISSION")).toBe(false);
    expect(result.issues.some(i => i.code === "APPROACHING_DEADLINE")).toBe(true);
  });

  it("should reject at exactly 121 days ago (late submission)", () => {
    const d = new Date();
    d.setDate(d.getDate() - 121);
    const result = validateClaim({
      ...baseValidClaim,
      dateOfService: d.toISOString().slice(0, 10),
    });
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.code === "LATE_SUBMISSION")).toBe(true);
  });

  it("should accept date of birth = today (valid newborn)", () => {
    const result = validateClaim({
      ...baseValidClaim,
      patientDob: new Date().toISOString().slice(0, 10),
      patientIdNumber: "", // newborn may not have ID yet
    });
    expect(result.issues.some(i => i.code === "FUTURE_DOB")).toBe(false);
  });

  it("should reject date of birth = tomorrow (future DOB)", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const result = validateClaim({
      ...baseValidClaim,
      patientDob: tomorrow.toISOString().slice(0, 10),
      patientIdNumber: "",
    });
    expect(result.issues.some(i => i.code === "FUTURE_DOB")).toBe(true);
  });

  it("should accept date of birth = 1900-01-01 (elderly patient)", () => {
    const result = validateClaim({
      ...baseValidClaim,
      patientDob: "1900-01-01",
      patientIdNumber: "",
    });
    expect(result.issues.some(i => i.code === "INVALID_DOB")).toBe(false);
    expect(result.issues.some(i => i.code === "FUTURE_DOB")).toBe(false);
  });
});

describe("BOUNDARY: Amount Boundaries (cents)", () => {
  it("should accept 1 cent (R0.01) — minimum valid positive amount", () => {
    const result = validateClaim({
      ...baseValidClaim,
      lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 1, amount: 1 }],
    });
    expect(result.issues.some(i => i.code === "INVALID_AMOUNT")).toBe(false);
  });

  it("should reject 0 cents — zero amount", () => {
    const result = validateClaim({
      ...baseValidClaim,
      lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 1, amount: 0 }],
    });
    expect(result.issues.some(i => i.code === "INVALID_AMOUNT")).toBe(true);
  });

  it("should reject -1 cent — negative amount", () => {
    const result = validateClaim({
      ...baseValidClaim,
      lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 1, amount: -1 }],
    });
    expect(result.issues.some(i => i.code === "INVALID_AMOUNT")).toBe(true);
  });

  it("should accept 99999999 cents (R999,999.99) without crash", () => {
    const result = validateClaim({
      ...baseValidClaim,
      lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 1, amount: 99999999 }],
    });
    expect(result.issues.some(i => i.code === "INVALID_AMOUNT")).toBe(false);
  });

  it("should not crash on Number.MAX_SAFE_INTEGER", () => {
    const result = validateClaim({
      ...baseValidClaim,
      lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 1, amount: Number.MAX_SAFE_INTEGER }],
    });
    expect(result).toHaveProperty("valid");
    expect(result).toHaveProperty("issues");
  });
});

describe("BOUNDARY: String Length Boundaries", () => {
  it("should accept patient name of 2 chars (minimum valid)", () => {
    const result = validateClaim({ ...baseValidClaim, patientName: "Jo" });
    expect(result.issues.some(i => i.code === "MISSING_PATIENT_NAME")).toBe(false);
  });

  it("should reject patient name of 1 char (too short)", () => {
    const result = validateClaim({ ...baseValidClaim, patientName: "J" });
    expect(result.issues.some(i => i.code === "MISSING_PATIENT_NAME")).toBe(true);
  });

  it("should accept patient name of exactly 100 chars (maximum valid)", () => {
    const result = validateClaim({ ...baseValidClaim, patientName: "A".repeat(100) });
    expect(result.issues.some(i => i.code === "PATIENT_NAME_TOO_LONG")).toBe(false);
  });

  it("should reject patient name of 101 chars (too long)", () => {
    const result = validateClaim({ ...baseValidClaim, patientName: "A".repeat(101) });
    expect(result.issues.some(i => i.code === "PATIENT_NAME_TOO_LONG")).toBe(true);
  });

  it("should accept description of 500 chars (maximum valid)", () => {
    const result = validateClaim({
      ...baseValidClaim,
      lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "D".repeat(500), quantity: 1, amount: 52000 }],
    });
    expect(result.issues.some(i => i.code === "DESCRIPTION_TOO_LONG")).toBe(false);
  });

  it("should reject description of 501 chars (too long)", () => {
    const result = validateClaim({
      ...baseValidClaim,
      lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "D".repeat(501), quantity: 1, amount: 52000 }],
    });
    expect(result.issues.some(i => i.code === "DESCRIPTION_TOO_LONG")).toBe(true);
  });

  it("should accept notes of 1000 chars (maximum valid)", () => {
    const result = validateClaim({ ...baseValidClaim, notes: "N".repeat(1000) });
    expect(result.issues.some(i => i.code === "NOTES_TOO_LONG")).toBe(false);
  });

  it("should reject notes of 1001 chars (too long)", () => {
    const result = validateClaim({ ...baseValidClaim, notes: "N".repeat(1001) });
    expect(result.issues.some(i => i.code === "NOTES_TOO_LONG")).toBe(true);
  });

  it("should accept authorization number of 50 chars (maximum valid)", () => {
    const result = validateClaim({ ...baseValidClaim, authorizationNumber: "A".repeat(50) });
    expect(result.issues.some(i => i.code === "AUTH_NUMBER_TOO_LONG")).toBe(false);
  });

  it("should reject authorization number of 51 chars (too long)", () => {
    const result = validateClaim({ ...baseValidClaim, authorizationNumber: "A".repeat(51) });
    expect(result.issues.some(i => i.code === "AUTH_NUMBER_TOO_LONG")).toBe(true);
  });

  it("should accept membership number of 3 chars (minimum valid)", () => {
    const result = validateClaim({ ...baseValidClaim, membershipNumber: "123" });
    expect(result.issues.some(i => i.code === "MISSING_MEMBERSHIP")).toBe(false);
  });

  it("should reject membership number of 2 chars (too short)", () => {
    const result = validateClaim({ ...baseValidClaim, membershipNumber: "12" });
    expect(result.issues.some(i => i.code === "MISSING_MEMBERSHIP")).toBe(true);
  });

  it("should accept membership number of 20 chars (maximum valid)", () => {
    const result = validateClaim({ ...baseValidClaim, membershipNumber: "A".repeat(20) });
    expect(result.issues.some(i => i.code === "MEMBERSHIP_TOO_LONG")).toBe(false);
  });

  it("should reject membership number of 21 chars (too long)", () => {
    const result = validateClaim({ ...baseValidClaim, membershipNumber: "A".repeat(21) });
    expect(result.issues.some(i => i.code === "MEMBERSHIP_TOO_LONG")).toBe(true);
  });
});

describe("BOUNDARY: Dependent Code Boundaries", () => {
  it("should accept '00' (main member)", () => {
    const result = validateClaim({ ...baseValidClaim, dependentCode: "00" });
    expect(result.issues.some(i => i.code === "INVALID_DEPENDENT_CODE")).toBe(false);
  });

  it("should accept '01' through '09' (dependents)", () => {
    for (let i = 1; i <= 9; i++) {
      const code = String(i).padStart(2, "0");
      const result = validateClaim({ ...baseValidClaim, dependentCode: code });
      expect(result.issues.some(i => i.code === "INVALID_DEPENDENT_CODE")).toBe(false);
    }
  });

  it("should accept '10' (two-digit dependent)", () => {
    const result = validateClaim({ ...baseValidClaim, dependentCode: "10" });
    expect(result.issues.some(i => i.code === "INVALID_DEPENDENT_CODE")).toBe(false);
  });

  it("should accept '99' (maximum 2-digit)", () => {
    const result = validateClaim({ ...baseValidClaim, dependentCode: "99" });
    expect(result.issues.some(i => i.code === "INVALID_DEPENDENT_CODE")).toBe(false);
  });

  it("should reject '0' (single digit — invalid format)", () => {
    const result = validateClaim({ ...baseValidClaim, dependentCode: "0" });
    expect(result.issues.some(i => i.code === "INVALID_DEPENDENT_CODE")).toBe(true);
  });

  it("should reject '100' (three digits — invalid format)", () => {
    const result = validateClaim({ ...baseValidClaim, dependentCode: "100" });
    expect(result.issues.some(i => i.code === "INVALID_DEPENDENT_CODE")).toBe(true);
  });

  it("should reject 'AA' (non-numeric)", () => {
    const result = validateClaim({ ...baseValidClaim, dependentCode: "AA" });
    expect(result.issues.some(i => i.code === "INVALID_DEPENDENT_CODE")).toBe(true);
  });

  it("should reject empty dependent code", () => {
    const result = validateClaim({ ...baseValidClaim, dependentCode: "" });
    expect(result.issues.some(i => i.code === "INVALID_DEPENDENT_CODE")).toBe(true);
  });
});

describe("BOUNDARY: parseZARToCents Edge Boundaries", () => {
  it("should handle R0.001 (sub-cent) rounding to 0 cents", () => {
    expect(parseZARToCents("0.001")).toBe(0);
    expect(parseZARToCents(0.001)).toBe(0);
  });

  it("should handle R0.004 rounding to 0 cents", () => {
    expect(parseZARToCents(0.004)).toBe(0);
  });

  it("should handle R0.005 rounding to 1 cent", () => {
    expect(parseZARToCents(0.005)).toBe(1);
  });

  it("should handle R0.009 rounding to 1 cent", () => {
    expect(parseZARToCents(0.009)).toBe(1);
  });

  it("should handle R0.01 exactly = 1 cent", () => {
    expect(parseZARToCents(0.01)).toBe(1);
  });

  it("should not crash on Infinity", () => {
    const result = parseZARToCents(Infinity);
    expect(typeof result).toBe("number");
  });

  it("should not crash on -Infinity", () => {
    const result = parseZARToCents(-Infinity);
    expect(typeof result).toBe("number");
  });

  it("should handle NaN input (number type) by returning NaN propagated through Math.round", () => {
    // NaN * 100 = NaN, Math.round(NaN) = NaN — this is a known edge case
    const result = parseZARToCents(NaN);
    // The function does Math.round(zar * 100) for numbers
    // NaN is technically a number, so it goes through the number path
    expect(Number.isNaN(result)).toBe(true);
  });
});
