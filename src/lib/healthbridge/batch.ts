// Batch claim upload — CSV bulk submission
// Parses CSV files with claim data, validates each row, and submits in bulk

import { validateClaim } from "./validator";
import type { ClaimLineItem } from "./types";
import type { ValidationResult } from "./validator";

export interface BatchRow {
  rowNumber: number;
  patientName: string;
  patientDob: string;
  patientIdNumber: string;
  medicalAidScheme: string;
  membershipNumber: string;
  dependentCode: string;
  dateOfService: string;
  icd10Code: string;
  cptCode: string;
  description: string;
  amount: number;
  authorizationNumber: string;
}

export interface BatchValidationResult {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  rows: {
    rowNumber: number;
    patientName: string;
    valid: boolean;
    validation: ValidationResult;
  }[];
  parseErrors: string[];
}

/** Parse a CSV string into batch claim rows */
export function parseBatchCSV(csvContent: string): { rows: BatchRow[]; errors: string[] } {
  const lines = csvContent.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    return { rows: [], errors: ["CSV must have a header row and at least one data row"] };
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_"));
  const errors: string[] = [];
  const rows: BatchRow[] = [];

  // Map headers to expected fields
  const fieldMap: Record<string, string> = {
    patient_name: "patientName", patient: "patientName", name: "patientName",
    dob: "patientDob", date_of_birth: "patientDob", patient_dob: "patientDob",
    id_number: "patientIdNumber", sa_id: "patientIdNumber", id: "patientIdNumber",
    scheme: "medicalAidScheme", medical_aid: "medicalAidScheme", medical_aid_scheme: "medicalAidScheme",
    membership: "membershipNumber", membership_number: "membershipNumber", member_no: "membershipNumber",
    dependent: "dependentCode", dependent_code: "dependentCode", dep: "dependentCode",
    date_of_service: "dateOfService", dos: "dateOfService", service_date: "dateOfService",
    icd10: "icd10Code", icd_10: "icd10Code", icd10_code: "icd10Code", diagnosis: "icd10Code",
    cpt: "cptCode", cpt_code: "cptCode", tariff: "cptCode", tariff_code: "cptCode",
    description: "description", service: "description", procedure: "description",
    amount: "amount", fee: "amount", charge: "amount",
    auth: "authorizationNumber", authorization: "authorizationNumber", auth_number: "authorizationNumber",
  };

  const headerMapping: Record<number, string> = {};
  for (let i = 0; i < headers.length; i++) {
    const mapped = fieldMap[headers[i]];
    if (mapped) headerMapping[i] = mapped;
  }

  // Check required mappings
  const requiredFields = ["patientName", "medicalAidScheme", "membershipNumber", "icd10Code", "amount"];
  const mappedFields = new Set(Object.values(headerMapping));
  for (const req of requiredFields) {
    if (!mappedFields.has(req)) {
      errors.push(`Missing required column: ${req}. Expected headers include: patient_name, scheme, membership, icd10, amount`);
    }
  }
  if (errors.length > 0) return { rows: [], errors };

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    for (let j = 0; j < values.length; j++) {
      const field = headerMapping[j];
      if (field) row[field] = values[j].trim();
    }

    rows.push({
      rowNumber: i + 1,
      patientName: row.patientName || "",
      patientDob: row.patientDob || "",
      patientIdNumber: row.patientIdNumber || "",
      medicalAidScheme: row.medicalAidScheme || "",
      membershipNumber: row.membershipNumber || "",
      dependentCode: row.dependentCode || "00",
      dateOfService: row.dateOfService || new Date().toISOString().slice(0, 10),
      icd10Code: row.icd10Code || "",
      cptCode: row.cptCode || "0190",
      description: row.description || "",
      amount: parseFloat(row.amount || "0"),
      authorizationNumber: row.authorizationNumber || "",
    });
  }

  return { rows, errors };
}

/** Validate all rows in a batch */
export function validateBatch(rows: BatchRow[], bhfNumber: string): BatchValidationResult {
  const results: BatchValidationResult = {
    totalRows: rows.length,
    validRows: 0,
    invalidRows: 0,
    rows: [],
    parseErrors: [],
  };

  for (const row of rows) {
    const lineItems: ClaimLineItem[] = [{
      icd10Code: row.icd10Code,
      cptCode: row.cptCode,
      description: row.description,
      quantity: 1,
      amount: Math.round(row.amount * 100), // convert ZAR to cents
    }];

    const validation = validateClaim({
      patientName: row.patientName,
      patientDob: row.patientDob,
      patientIdNumber: row.patientIdNumber,
      medicalAidScheme: row.medicalAidScheme,
      membershipNumber: row.membershipNumber,
      dependentCode: row.dependentCode,
      dateOfService: row.dateOfService,
      placeOfService: "11",
      bhfNumber,
      authorizationNumber: row.authorizationNumber,
      lineItems,
    });

    if (validation.valid) results.validRows++;
    else results.invalidRows++;

    results.rows.push({
      rowNumber: row.rowNumber,
      patientName: row.patientName,
      valid: validation.valid,
      validation,
    });
  }

  return results;
}

/** Parse a CSV line handling quoted fields */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
