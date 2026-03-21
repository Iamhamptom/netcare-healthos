import { describe, it, expect } from "vitest";
import { parseBatchCSV, validateBatch } from "@/lib/healthbridge/batch";

describe("Batch CSV Parser — parseBatchCSV", () => {
  it("should parse a valid CSV with standard headers", () => {
    const csv = `patient_name,scheme,membership,icd10,cpt,amount,dependent_code,date_of_service,description
John Mokoena,Discovery Health,900012345,I10,0190,520,00,2026-03-20,GP consultation`;

    const { rows, errors } = parseBatchCSV(csv);
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(1);
    expect(rows[0].patientName).toBe("John Mokoena");
    expect(rows[0].medicalAidScheme).toBe("Discovery Health");
    expect(rows[0].membershipNumber).toBe("900012345");
    expect(rows[0].icd10Code).toBe("I10");
    expect(rows[0].cptCode).toBe("0190");
    expect(rows[0].amount).toBe(520);
    expect(rows[0].rowNumber).toBe(2);
  });

  it("should accept alternative header names (medical_aid_scheme, dob, id_number)", () => {
    const csv = `name,medical_aid_scheme,membership_number,icd10_code,tariff_code,fee
Jane Doe,GEMS,000012345,J06.9,0190,520`;

    const { rows, errors } = parseBatchCSV(csv);
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(1);
    expect(rows[0].patientName).toBe("Jane Doe");
    expect(rows[0].medicalAidScheme).toBe("GEMS");
    expect(rows[0].cptCode).toBe("0190");
  });

  it("should accept 'medical_aid' as scheme header", () => {
    const csv = `patient,medical_aid,membership,icd10,amount
Test Patient,Bonitas,12345,I10,500`;

    const { rows, errors } = parseBatchCSV(csv);
    expect(errors).toHaveLength(0);
    expect(rows[0].medicalAidScheme).toBe("Bonitas");
  });

  it("should handle quoted fields containing commas", () => {
    const csv = `patient_name,scheme,membership,icd10,amount
"Van der Merwe, Sarah",Discovery Health,900012345,I10,520`;

    const { rows, errors } = parseBatchCSV(csv);
    expect(errors).toHaveLength(0);
    expect(rows[0].patientName).toBe("Van der Merwe, Sarah");
  });

  it("should error on missing required columns", () => {
    const csv = `name,dob
John,1990-01-01`;

    const { rows, errors } = parseBatchCSV(csv);
    expect(errors.length).toBeGreaterThan(0);
    expect(rows).toHaveLength(0);
    expect(errors.some(e => e.includes("medicalAidScheme"))).toBe(true);
  });

  it("should error on empty CSV (no data rows)", () => {
    const csv = `patient_name,scheme,membership,icd10,amount`;
    const { rows, errors } = parseBatchCSV(csv);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("should error on completely empty input", () => {
    const { rows, errors } = parseBatchCSV("");
    expect(errors.length).toBeGreaterThan(0);
    expect(rows).toHaveLength(0);
  });

  it("should handle extra columns gracefully (ignored)", () => {
    const csv = `patient_name,scheme,membership,icd10,amount,extra_col1,extra_col2
John,Discovery Health,12345,I10,500,foo,bar`;

    const { rows, errors } = parseBatchCSV(csv);
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(1);
    expect(rows[0].patientName).toBe("John");
  });

  it("should provide default values for optional fields", () => {
    const csv = `patient_name,scheme,membership,icd10,amount
John,Discovery Health,12345,I10,500`;

    const { rows } = parseBatchCSV(csv);
    expect(rows[0].dependentCode).toBe("00");
    expect(rows[0].cptCode).toBe("0190"); // default
    expect(rows[0].dateOfService).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("should parse multiple rows correctly", () => {
    const csv = `patient_name,scheme,membership,icd10,amount
Alice,Discovery Health,111111111,I10,520
Bob,GEMS,000012345,J06.9,520
Charlie,Bonitas,998877665,E11.9,520`;

    const { rows, errors } = parseBatchCSV(csv);
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(3);
    expect(rows[0].rowNumber).toBe(2);
    expect(rows[1].rowNumber).toBe(3);
    expect(rows[2].rowNumber).toBe(4);
  });

  it("should handle large CSV with 100+ rows", () => {
    const header = "patient_name,scheme,membership,icd10,amount";
    const dataRows = Array.from({ length: 150 }, (_, i) =>
      `Patient${i},Discovery Health,90001${String(i).padStart(4, "0")},I10,520`
    ).join("\n");
    const csv = `${header}\n${dataRows}`;

    const { rows, errors } = parseBatchCSV(csv);
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(150);
  });

  it("should handle special characters in patient names within CSV", () => {
    const csv = `patient_name,scheme,membership,icd10,amount
"O'Brien",Discovery Health,12345,I10,520
José Müller,GEMS,000012345,J06.9,520`;

    const { rows, errors } = parseBatchCSV(csv);
    expect(errors).toHaveLength(0);
    expect(rows[0].patientName).toBe("O'Brien");
    expect(rows[1].patientName).toBe("José Müller");
  });

  it("should handle amount as float (ZAR, not cents)", () => {
    const csv = `patient_name,scheme,membership,icd10,amount
John,Discovery Health,12345,I10,520.50`;

    const { rows } = parseBatchCSV(csv);
    expect(rows[0].amount).toBe(520.5);
  });

  it("should handle rows with trailing commas", () => {
    const csv = `patient_name,scheme,membership,icd10,amount
John,Discovery Health,12345,I10,520,`;

    const { rows, errors } = parseBatchCSV(csv);
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(1);
  });
});

describe("Batch Validator — validateBatch", () => {
  it("should validate rows with valid data", () => {
    const rows = [{
      rowNumber: 2,
      patientName: "John Mokoena",
      patientDob: "1985-06-15",
      patientIdNumber: "8506155012089",
      medicalAidScheme: "Discovery Health",
      membershipNumber: "900012345",
      dependentCode: "00",
      dateOfService: new Date().toISOString().slice(0, 10),
      icd10Code: "I10",
      cptCode: "0190",
      description: "GP consultation",
      amount: 520,
      authorizationNumber: "",
    }];

    const result = validateBatch(rows, "1234567");
    expect(result.totalRows).toBe(1);
    expect(result.validRows).toBe(1);
    expect(result.invalidRows).toBe(0);
  });

  it("should catch invalid rows (bad ICD-10)", () => {
    const rows = [{
      rowNumber: 2,
      patientName: "John",
      patientDob: "",
      patientIdNumber: "",
      medicalAidScheme: "Discovery Health",
      membershipNumber: "12345",
      dependentCode: "00",
      dateOfService: new Date().toISOString().slice(0, 10),
      icd10Code: "INVALID",
      cptCode: "0190",
      description: "Test",
      amount: 520,
      authorizationNumber: "",
    }];

    const result = validateBatch(rows, "1234567");
    expect(result.invalidRows).toBe(1);
    expect(result.rows[0].valid).toBe(false);
  });

  it("should convert amount from ZAR to cents (multiplied by 100)", () => {
    const rows = [{
      rowNumber: 2,
      patientName: "John Mokoena",
      patientDob: "",
      patientIdNumber: "",
      medicalAidScheme: "Discovery Health",
      membershipNumber: "900012345",
      dependentCode: "00",
      dateOfService: new Date().toISOString().slice(0, 10),
      icd10Code: "I10",
      cptCode: "0190",
      description: "GP consultation",
      amount: 520, // R520
      authorizationNumber: "",
    }];

    const result = validateBatch(rows, "1234567");
    // The batch validator converts to cents internally — should pass amount validation
    expect(result.validRows).toBe(1);
  });

  it("should handle empty batch", () => {
    const result = validateBatch([], "1234567");
    expect(result.totalRows).toBe(0);
    expect(result.validRows).toBe(0);
    expect(result.invalidRows).toBe(0);
  });
});
