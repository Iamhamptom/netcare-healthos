import { describe, it, expect } from "vitest";
import { validateClaim } from "@/lib/healthbridge/validator";

describe("Healthbridge Claim Validator", () => {
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

  it("should pass a valid claim", () => {
    const result = validateClaim(validClaim);
    expect(result.valid).toBe(true);
    expect(result.errors).toBe(0);
    expect(result.estimatedRejectionRisk).toBe("low");
  });

  it("should detect PMB conditions (hypertension I10)", () => {
    const result = validateClaim(validClaim);
    expect(result.pmbDetected).toBe(true);
    expect(result.pmbConditions.length).toBeGreaterThan(0);
    expect(result.pmbConditions[0]).toContain("I10");
  });

  it("should reject missing patient name", () => {
    const result = validateClaim({ ...validClaim, patientName: "" });
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.code === "MISSING_PATIENT_NAME")).toBe(true);
  });

  it("should reject missing membership number", () => {
    const result = validateClaim({ ...validClaim, membershipNumber: "" });
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.code === "MISSING_MEMBERSHIP")).toBe(true);
  });

  it("should reject invalid BHF number", () => {
    const result = validateClaim({ ...validClaim, bhfNumber: "123" });
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.code === "INVALID_BHF")).toBe(true);
  });

  it("should reject missing BHF number", () => {
    const result = validateClaim({ ...validClaim, bhfNumber: "0000000" });
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.code === "MISSING_BHF")).toBe(true);
  });

  it("should reject invalid ICD-10 format", () => {
    const result = validateClaim({
      ...validClaim,
      lineItems: [{ icd10Code: "INVALID", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 }],
    });
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.code === "INVALID_ICD10_FORMAT")).toBe(true);
  });

  it("should reject missing ICD-10 code", () => {
    const result = validateClaim({
      ...validClaim,
      lineItems: [{ icd10Code: "", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 }],
    });
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.code === "MISSING_ICD10")).toBe(true);
  });

  it("should reject invalid CPT format", () => {
    const result = validateClaim({
      ...validClaim,
      lineItems: [{ icd10Code: "I10", cptCode: "ABC", description: "Test", quantity: 1, amount: 52000 }],
    });
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.code === "INVALID_CPT_FORMAT")).toBe(true);
  });

  it("should reject empty line items", () => {
    const result = validateClaim({ ...validClaim, lineItems: [] });
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.code === "NO_LINE_ITEMS")).toBe(true);
  });

  it("should warn on low ICD-10 specificity", () => {
    const result = validateClaim({
      ...validClaim,
      lineItems: [{ icd10Code: "J06", cptCode: "0190", description: "URTI", quantity: 1, amount: 52000 }],
    });
    expect(result.issues.some(i => i.code === "ICD10_LOW_SPECIFICITY")).toBe(true);
  });

  it("should enforce GEMS 9-digit membership format", () => {
    const result = validateClaim({
      ...validClaim,
      medicalAidScheme: "GEMS",
      membershipNumber: "12345",
    });
    expect(result.issues.some(i => i.code === "GEMS_MEMBERSHIP_FORMAT")).toBe(true);
  });

  it("should accept valid GEMS 9-digit format", () => {
    const result = validateClaim({
      ...validClaim,
      medicalAidScheme: "GEMS",
      membershipNumber: "000012345",
    });
    expect(result.issues.some(i => i.code === "GEMS_MEMBERSHIP_FORMAT")).toBe(false);
  });

  it("should detect DOB/ID mismatch", () => {
    const result = validateClaim({
      ...validClaim,
      patientDob: "1990-01-01", // doesn't match ID starting with 8506
      patientIdNumber: "8506155012089",
    });
    expect(result.issues.some(i => i.code === "DOB_ID_MISMATCH")).toBe(true);
  });

  it("should detect gender mismatch from ID", () => {
    const result = validateClaim({
      ...validClaim,
      patientGender: "female", // ID 5012 ≥ 5000 = male
    });
    expect(result.issues.some(i => i.code === "GENDER_MISMATCH")).toBe(true);
  });

  it("should warn on late submission approaching deadline", () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 100);
    const result = validateClaim({
      ...validClaim,
      dateOfService: oldDate.toISOString().slice(0, 10),
    });
    expect(result.issues.some(i => i.code === "APPROACHING_DEADLINE")).toBe(true);
  });

  it("should reject late submission past 120 days", () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 130);
    const result = validateClaim({
      ...validClaim,
      dateOfService: oldDate.toISOString().slice(0, 10),
    });
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.code === "LATE_SUBMISSION")).toBe(true);
  });

  it("should detect CDL chronic conditions", () => {
    const result = validateClaim({
      ...validClaim,
      lineItems: [{ icd10Code: "E11.9", cptCode: "0190", description: "Diabetes review", quantity: 1, amount: 52000 }],
    });
    expect(result.issues.some(i => i.code === "CDL_CONDITION")).toBe(true);
  });

  it("should detect clinical mismatch (nebulisation + UTI)", () => {
    const result = validateClaim({
      ...validClaim,
      lineItems: [{ icd10Code: "N39.0", cptCode: "1136", description: "Nebulisation", quantity: 1, amount: 15000 }],
    });
    expect(result.issues.some(i => i.code === "CLINICAL_MISMATCH")).toBe(true);
  });

  it("should return high risk for claims with errors", () => {
    const result = validateClaim({ ...validClaim, patientName: "", membershipNumber: "" });
    expect(result.estimatedRejectionRisk).toBe("high");
  });

  it("should warn on duplicate ICD-10 codes", () => {
    const result = validateClaim({
      ...validClaim,
      lineItems: [
        { icd10Code: "I10", cptCode: "0190", description: "Consult", quantity: 1, amount: 52000 },
        { icd10Code: "I10", cptCode: "0308", description: "ECG", quantity: 1, amount: 35000 },
      ],
    });
    expect(result.issues.some(i => i.code === "DUPLICATE_ICD10")).toBe(true);
  });

  it("should reject zero amount", () => {
    const result = validateClaim({
      ...validClaim,
      lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Test", quantity: 1, amount: 0 }],
    });
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.code === "INVALID_AMOUNT")).toBe(true);
  });
});
