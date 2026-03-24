// Claims Rejection Analyzer — Validation Engine
// Pre-submission validation for South African medical scheme claims
// Based on SA ICD-10 coding standards, CMS guidelines, and common rejection rules

import type {
  ClaimLineItem, ValidationIssue, ValidationResult,
  LineValidationResult, ValidationSummary, CSVParseResult, ColumnMapping,
} from "./types";
import {
  lookupICD10, getChapterForCode,
  MALE_ONLY_PREFIXES, FEMALE_ONLY_PREFIXES,
} from "./icd10-database";
import { lookupNAPPI } from "./nappi-database";
import { lookupMIT, codeExistsInMIT } from "./mit-loader";

// ─── ICD-10 FORMAT REGEX ─────────────────────────────────────────
// WHO ICD-10: Letter + 2 digits, optionally dot + 1-4 alphanumeric
const ICD10_FORMAT = /^[A-Z]\d{2}(\.\d{1,4})?$/i;

// ─── CSV PARSER ──────────────────────────────────────────────────
export function parseCSV(text: string): CSVParseResult {
  const errors: string[] = [];
  // Strip BOM (Excel exports often prepend \uFEFF)
  const cleaned = text.replace(/^\uFEFF/, "");
  const lines = cleaned.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) {
    return { headers: [], rows: [], errors: ["File must have a header row and at least one data row"] };
  }

  // Detect delimiter
  const firstLine = lines[0];
  const delimiter = firstLine.includes("\t") ? "\t"
    : firstLine.split(";").length > firstLine.split(",").length ? ";"
    : ",";

  const headers = parseLine(firstLine, delimiter).map(h => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i], delimiter);
    if (values.length === 0 || (values.length === 1 && !values[0].trim())) continue;
    if (values.length !== headers.length) {
      errors.push(`Row ${i + 1}: expected ${headers.length} columns, got ${values.length}`);
      continue;
    }
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = values[idx]?.trim() || ""; });
    rows.push(row);
  }

  return { headers, rows, errors };
}

function parseLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === delimiter && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ─── AUTO-MAP COLUMNS ────────────────────────────────────────────
const COLUMN_ALIASES: Record<keyof ColumnMapping, string[]> = {
  primaryICD10: [
    "icd10", "icd-10", "icd_10", "icd10_code", "icd10code", "icd_10_code",
    "diagnosis", "diagnosis_code", "diagnosiscode", "diagcode", "diag_code",
    "primary_icd10", "primary_icd", "primary_diagnosis", "primarydiagnosis",
    "dx_code", "dx", "dxcode", "icd", "icd_code", "icdcode",
    "diag1", "diag_1", "diagnosis1", "diagnosis_1",
    "icd10_1", "icd10_primary", "icd_primary",
    "medical_code",
    // NOTE: "code" and "claim_code" removed — too ambiguous, matches claim IDs
  ],
  secondaryICD10: ["secondary_icd10", "secondary_icd", "icd10_secondary", "secondary_diagnosis", "sec_diag", "additional_icd"],
  tariffCode: ["tariff", "tariff_code", "procedure", "procedure_code", "cpt", "cpt_code", "service_code"],
  nappiCode: ["nappi", "nappi_code", "medicine", "medicine_code", "drug_code", "product_code"],
  patientName: ["patient", "patient_name", "name", "full_name", "patient_full_name"],
  patientGender: ["gender", "sex", "patient_gender", "patient_sex"],
  patientAge: ["age", "patient_age", "age_years"],
  amount: ["amount", "total", "charge", "fee", "price", "line_total", "claim_amount"],
  quantity: ["quantity", "qty", "units"],
  modifier: ["modifier", "mod", "modifier_code"],
  practitionerType: ["practitioner", "practitioner_type", "provider_type", "discipline", "speciality"],
  dateOfService: ["date", "service_date", "date_of_service", "dos", "claim_date"],
  dependentCode: ["dependent", "dependent_code", "dep_code", "dep", "dependant", "dependant_code"],
  practiceNumber: ["practice", "practice_number", "practice_no", "provider_no", "provider_number", "practice_id", "bhf_number"],
  scheme: ["scheme", "scheme_code", "scheme_name", "medical_aid", "medical_scheme", "funder"],
  motivationText: ["motivation", "motivation_text", "clinical_motivation", "clinical_notes", "notes", "justification", "reason"],
  placeOfService: ["place_of_service", "pos", "service_place", "facility_type"],
  membershipNumber: ["membership_number", "membership", "member_no", "member_number", "scheme_number", "medical_aid_number"],
};

export function autoMapColumns(headers: string[], rows?: Record<string, string>[]): ColumnMapping {
  const mapping: Partial<ColumnMapping> = {};
  const lowerHeaders = headers.map(h => h.toLowerCase().replace(/[\s-]/g, "_"));

  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    for (const alias of aliases) {
      const idx = lowerHeaders.indexOf(alias);
      if (idx !== -1) {
        // For ICD-10 column, verify the data actually looks like ICD-10 codes
        if (field === "primaryICD10" && rows && rows.length > 0) {
          const sample = rows.slice(0, 10);
          const icdLike = sample.filter(r => {
            const val = (r[headers[idx]] || "").trim();
            return val && /^[A-Z]\d{2}/i.test(val);
          }).length;
          // If less than 30% of sampled values look like ICD-10, skip this match
          if (icdLike < sample.length * 0.3) continue;
        }
        (mapping as Record<string, string>)[field] = headers[idx];
        break;
      }
    }
  }

  // Fallback: if no primary ICD10 found, try partial match on header names
  if (!mapping.primaryICD10) {
    for (const h of headers) {
      if (/icd/i.test(h) || /diag/i.test(h) || /^dx/i.test(h)) {
        mapping.primaryICD10 = h;
        break;
      }
    }
  }

  // Ultimate fallback: scan actual data to find the ICD-10 column
  if (!mapping.primaryICD10 && rows && rows.length > 0) {
    const suggestion = suggestICD10Column(headers, rows);
    if (suggestion && suggestion.confidence >= 0.4) {
      mapping.primaryICD10 = suggestion.header;
    }
  }

  return mapping as ColumnMapping;
}

/**
 * Suggest which column might be the ICD-10 column based on data sampling.
 * Checks if cell values look like ICD-10 codes (letter + 2+ digits).
 */
export function suggestICD10Column(headers: string[], rows: Record<string, string>[]): { header: string; confidence: number } | null {
  const sampleRows = rows.slice(0, Math.min(20, rows.length));
  let bestMatch: { header: string; confidence: number } | null = null;

  for (const h of headers) {
    let matches = 0;
    let total = 0;
    for (const row of sampleRows) {
      const val = (row[h] || "").trim();
      if (!val) continue;
      total++;
      if (/^[A-Z]\d{2,}(\.\d{1,4})?$/i.test(val)) matches++;
    }
    if (total > 0) {
      const confidence = matches / total;
      if (confidence > 0.4 && (!bestMatch || confidence > bestMatch.confidence)) {
        bestMatch = { header: h, confidence };
      }
    }
  }
  return bestMatch;
}

// ─── NORMALIZE DISCIPLINE ────────────────────────────────────────
// Maps common practitioner type labels to tariff Discipline values
const DISCIPLINE_ALIASES: Record<string, string> = {
  "general practitioner": "gp", "gp": "gp", "general practice": "gp",
  "specialist": "specialist", "physician": "specialist",
  "surgeon": "surgeon", "surgery": "surgeon",
  "gynaecologist": "gynaecology", "gynaecology": "gynaecology", "gynecologist": "gynaecology",
  "psychiatrist": "psychiatry", "psychiatry": "psychiatry",
  "anaesthetist": "anaesthetist", "anesthetist": "anaesthetist", "anaesthetics": "anaesthetist",
  "radiologist": "radiology", "radiology": "radiology",
  "pathologist": "pathology", "pathology": "pathology",
  "paediatrician": "paediatrics", "pediatrician": "paediatrics", "paediatrics": "paediatrics",
  "ophthalmologist": "ophthalmology", "ophthalmology": "ophthalmology", "optometrist": "ophthalmology",
  "urologist": "urologist", "urology": "urologist",
  "orthopaedic": "orthopaedics", "orthopaedics": "orthopaedics", "orthopedic": "orthopaedics",
  "ent": "ent", "ear nose throat": "ent", "otolaryngologist": "ent",
  "cardiologist": "cardiology", "cardiology": "cardiology",
  "dermatologist": "dermatology", "dermatology": "dermatology",
  "neurologist": "neurologist", "neurology": "neurologist",
  "pulmonologist": "pulmonologist", "pulmonology": "pulmonologist",
  "gastroenterologist": "gastroenterologist", "gastroenterology": "gastroenterologist",
  "oncologist": "oncologist", "oncology": "oncologist",
  "physiotherapist": "physiotherapy", "physiotherapy": "physiotherapy",
  "occupational therapist": "occupational_therapy", "occupational therapy": "occupational_therapy",
  "dietitian": "dietetics", "dietetics": "dietetics",
  "psychologist": "psychology", "psychology": "psychology",
  "dentist": "dental", "dental": "dental",
  "nursing": "nursing", "nurse": "nursing",
  "emergency": "emergency", "ambulance": "emergency",
  "midwife": "midwifery", "midwifery": "midwifery",
};

function normalizeDiscipline(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const lower = value.toLowerCase().trim();
  return DISCIPLINE_ALIASES[lower] || lower;
}

// ─── EXTRACT CLAIM LINE ITEMS ────────────────────────────────────
export function extractClaimLines(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
): ClaimLineItem[] {
  return rows.map((row, idx) => {
    const gender = mapping.patientGender ? row[mapping.patientGender]?.toUpperCase() : undefined;
    const ageStr = mapping.patientAge ? row[mapping.patientAge] : undefined;
    const secondaryStr = mapping.secondaryICD10 ? row[mapping.secondaryICD10] : undefined;

    const rawICD10 = mapping.primaryICD10 ? (row[mapping.primaryICD10] || "").trim() : "";
    const rawAmountStr = mapping.amount ? (row[mapping.amount] || "").trim() : "";
    const rawDateStr = mapping.dateOfService ? (row[mapping.dateOfService] || "").trim() : "";

    return {
      lineNumber: idx + 1,
      patientName: mapping.patientName ? row[mapping.patientName] : undefined,
      patientGender: gender === "M" || gender === "F" ? gender : "U",
      patientAge: ageStr ? parseInt(ageStr, 10) || undefined : undefined,
      primaryICD10: rawICD10.toUpperCase(),
      rawICD10: rawICD10 || undefined,
      secondaryICD10: secondaryStr
        ? secondaryStr.split(/[,;|]/).map(c => c.trim().toUpperCase()).filter(Boolean)
        : undefined,
      tariffCode: mapping.tariffCode ? row[mapping.tariffCode]?.trim() : undefined,
      nappiCode: mapping.nappiCode ? row[mapping.nappiCode]?.trim().replace(/-/g, "") : undefined,
      quantity: mapping.quantity ? parseInt(row[mapping.quantity], 10) || undefined : undefined,
      amount: mapping.amount ? parseFloat((row[mapping.amount] || "").replace(/[^0-9.\-]/g, "")) || undefined : undefined,
      modifier: mapping.modifier ? row[mapping.modifier]?.trim() : undefined,
      practitionerType: mapping.practitionerType ? normalizeDiscipline(row[mapping.practitionerType]?.trim()) : undefined,
      dateOfService: mapping.dateOfService ? (row[mapping.dateOfService]?.trim() || "").replace(/[./]/g, "-") : undefined,
      dependentCode: mapping.dependentCode ? row[mapping.dependentCode]?.trim() : undefined,
      practiceNumber: mapping.practiceNumber ? row[mapping.practiceNumber]?.trim() : undefined,
      scheme: mapping.scheme ? row[mapping.scheme]?.trim() : undefined,
      motivationText: mapping.motivationText ? row[mapping.motivationText]?.trim() : undefined,
      rawAmount: mapping.amount ? row[mapping.amount]?.trim() : undefined,
      rawDateOfService: mapping.dateOfService ? row[mapping.dateOfService]?.trim() : undefined,
      placeOfService: mapping.placeOfService ? row[mapping.placeOfService]?.trim() : undefined,
      membershipNumber: mapping.membershipNumber ? row[mapping.membershipNumber]?.trim() : undefined,
    };
  });
}

// ─── DISCIPLINE → TARIFF SCOPE (Practice number prefix mapping) ──
const DISCIPLINE_TARIFF_SCOPE: Record<string, { min: number; max: number; label: string }> = {
  "014": { min: 190, max: 199, label: "GP" },
  "015": { min: 190, max: 199, label: "GP" },
  "016": { min: 200, max: 299, label: "ObGyn" },
  "036": { min: 300, max: 399, label: "Physio" },
  "070": { min: -1, max: -1, label: "Pharmacy" }, // Pharmacy should not bill consultation codes
};

// ─── PROCEDURE BUNDLING PAIRS ────────────────────────────────────
// Procedure combinations that should be billed as a single comprehensive code
const BUNDLING_PAIRS: [string, string, string][] = [
  ["0190", "0141", "GP + specialist same day = unbundling"],
  ["3710", "3711", "Chest X-ray AP + lateral should be single code"],
  ["4518", "4519", "Urine dipstick + culture should be single code"],
];

// ─── FREQUENCY-LIMITED SCREENING PROCEDURES ─────────────────────
const FREQUENCY_LIMITS: { tariff: string; maxPerBatch: number; label: string }[] = [
  { tariff: "5101", maxPerBatch: 1, label: "Mammogram" },
  { tariff: "4548", maxPerBatch: 1, label: "Pap smear" },
  { tariff: "4466", maxPerBatch: 1, label: "PSA" },
  { tariff: "8101", maxPerBatch: 2, label: "Dental scale" },
  { tariff: "0261", maxPerBatch: 1, label: "Eye test" },
];

// ─── CONFLICTING ICD-10 PAIRS ───────────────────────────────────
const CONFLICTING_ICD10_PAIRS: [string, string, string][] = [
  ["E10", "E11", "Type 1 diabetes + Type 2 diabetes = mutually exclusive"],
  ["J44", "J45", "COPD + Asthma on same line = questionable"],
  ["Z32.1", "N40", "Pregnancy confirmed + BPH/prostate = impossible"],
];

// ─── VALIDATION RULES ────────────────────────────────────────────

function validateLine(item: ClaimLineItem): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const ln = item.lineNumber;

  // ── Rule 0a: Practice number must be present ──
  // SA BHF (Board of Healthcare Funders) requires a practice number on every claim
  if (item.practiceNumber !== undefined && !item.practiceNumber) {
    issues.push({
      lineNumber: ln, field: "practiceNumber", code: "MISSING_PRACTICE_NUMBER",
      severity: "error", rule: "Missing Practice Number",
      message: "No BHF practice number provided. SA medical schemes reject claims without a valid practice number.",
      suggestion: "Add the 7-digit BHF practice number for the rendering provider.",
    });
  }

  // ── Rule 0a2: Practice number FORMAT validation ──
  if (item.practiceNumber && item.practiceNumber.trim()) {
    const pn = item.practiceNumber.trim();
    // BHF practice numbers must be 7 digits, all numeric
    if (!/^\d{7}$/.test(pn)) {
      issues.push({
        lineNumber: ln, field: "practiceNumber", code: "INVALID_PRACTICE_NUMBER",
        severity: "error", rule: "Invalid Practice Number Format",
        message: `Practice number "${pn}" is not a valid 7-digit BHF number. Must be exactly 7 digits, no letters or spaces.`,
        suggestion: "Check the BHF registration. Valid format: 0141234 (7 digits, numeric only).",
      });
    }
  }

  // ── Rule 0a3: Membership number must be present ──
  if (item.membershipNumber !== undefined && !item.membershipNumber?.trim()) {
    issues.push({
      lineNumber: ln, field: "membershipNumber", code: "MISSING_MEMBERSHIP",
      severity: "error", rule: "Missing Membership Number",
      message: "No medical aid membership number provided. All scheme claims require a valid membership number.",
      suggestion: "Add the patient's medical aid membership number from their scheme card.",
    });
  }

  // ── Rule 0b: Dependent code must be present ──
  // SA schemes require a 2-digit dependent code (00 = main member, 01+ = dependents)
  if (item.dependentCode !== undefined && !item.dependentCode) {
    issues.push({
      lineNumber: ln, field: "dependentCode", code: "MISSING_DEPENDENT_CODE",
      severity: "error", rule: "Missing Dependent Code",
      message: "No dependent code provided. SA medical schemes require a 2-digit dependent code (00 = main member, 01-09 = dependents).",
      suggestion: "Add the dependent code: '00' for main member, '01' for spouse, '02'+ for children.",
    });
  }

  // ── Rule 0c: Patient name must be present ──
  // PHISC MEDCLM: RFF+PTN (patient name) is mandatory
  if (item.patientName !== undefined && !item.patientName) {
    issues.push({
      lineNumber: ln, field: "patientName", code: "MISSING_PATIENT_NAME",
      severity: "error", rule: "Missing Patient Name",
      message: "No patient name provided. SA PHISC MEDCLM standard requires patient name on every claim.",
      suggestion: "Add the patient's full name as it appears on the scheme membership record.",
    });
  }

  // ── Rule 0d: Date format validation ──
  // SA standard: YYYY-MM-DD (ISO 8601). PHISC EDIFACT uses CCYYMMDD.
  // Reject DD-MM-YYYY, YYYY/MM/DD, and other non-standard formats.
  if (item.rawDateOfService) {
    const raw = item.rawDateOfService;
    const isISO = /^\d{4}-\d{2}-\d{2}$/.test(raw);
    const isCCYYMMDD = /^\d{8}$/.test(raw);
    if (!isISO && !isCCYYMMDD) {
      // Catch ALL non-standard formats — any date that isn't YYYY-MM-DD or CCYYMMDD is wrong
      issues.push({
        lineNumber: ln, field: "dateOfService", code: "INVALID_DATE_FORMAT",
        severity: "error", rule: "Invalid Date Format",
        message: `Date "${raw}" uses a non-standard format. SA claims require YYYY-MM-DD (ISO 8601) or CCYYMMDD (EDIFACT).`,
        suggestion: "Convert dates to YYYY-MM-DD format. Common errors: slashes (2026/02/15), dots (2026.02.15), DD-MM-YYYY.",
      });
    }
  }

  // ── Rule 0d2: Impossible date (Feb 30, Apr 31, etc.) ──
  if (item.dateOfService) {
    const parts = item.dateOfService.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (parts) {
      const [, y, m, d] = parts.map(Number);
      const testDate = new Date(y, m - 1, d);
      if (testDate.getMonth() !== m - 1 || testDate.getDate() !== d) {
        issues.push({
          lineNumber: ln, field: "dateOfService", code: "IMPOSSIBLE_DATE",
          severity: "error", rule: "Impossible Date",
          message: `Date "${item.dateOfService}" does not exist (e.g., February 30, April 31). This will be rejected by all switches.`,
          suggestion: "Verify the date of service. Check the month and day values.",
        });
      }
    }
  }

  // ── Rule 0e: Future date of service ──
  if (item.dateOfService) {
    const serviceDate = new Date(item.dateOfService);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (!isNaN(serviceDate.getTime()) && serviceDate > today) {
      issues.push({
        lineNumber: ln, field: "dateOfService", code: "FUTURE_DATE",
        severity: "error", rule: "Future Date of Service",
        message: `Date of service "${item.dateOfService}" is in the future. Claims cannot be submitted for services not yet rendered.`,
        suggestion: "Verify the date of service is correct. Future-dated claims are automatically rejected.",
      });
    }
  }

  // ── Rule 0f: Stale claim (>120 days) and near-stale (90-120 days) ──
  // Medical Schemes Act Regulation 6: 4-month (120-day) hard deadline
  if (item.dateOfService) {
    const serviceDate = new Date(item.dateOfService);
    const now = new Date();
    if (!isNaN(serviceDate.getTime()) && serviceDate <= now) {
      const diffDays = Math.floor((now.getTime() - serviceDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 120) {
        issues.push({
          lineNumber: ln, field: "dateOfService", code: "STALE_CLAIM",
          severity: "error", rule: "Stale Claim (>120 Days)",
          message: `Date of service "${item.dateOfService}" is ${diffDays} days ago. Medical Schemes Act Regulation 6 mandates submission within 120 days.`,
          suggestion: "This claim has expired. Contact the scheme for a late submission appeal if applicable.",
        });
      } else if (diffDays > 90) {
        issues.push({
          lineNumber: ln, field: "dateOfService", code: "NEAR_STALE_CLAIM",
          severity: "warning", rule: "Claim Nearing Expiry (>90 Days)",
          message: `Date of service "${item.dateOfService}" is ${diffDays} days ago. Only ${120 - diffDays} days remain before the 120-day submission deadline.`,
          suggestion: "Submit this claim urgently to avoid expiry.",
        });
      }
    }
  }

  // ── Rule 0g: Amount format validation ──
  if (item.rawAmount) {
    const raw = item.rawAmount.trim();
    // Comma decimals: 450,00
    if (/,\d{1,2}$/.test(raw)) {
      issues.push({
        lineNumber: ln, field: "amount", code: "INVALID_AMOUNT_FORMAT",
        severity: "error", rule: "Invalid Amount Format",
        message: `Amount "${raw}" uses a comma decimal separator. SA claims require dot decimals (e.g., 450.00 not 450,00).`,
        suggestion: "Replace the comma with a dot in the amount field.",
      });
    }
    // Currency symbols — prefix (R450.00, ZAR450) or suffix (450.00 ZAR, 450 R)
    if (/^[RZ]/i.test(raw) || /[A-Za-z]/.test(raw)) {
      issues.push({
        lineNumber: ln, field: "amount", code: "INVALID_AMOUNT_FORMAT",
        severity: "error", rule: "Invalid Amount Format",
        message: `Amount "${raw}" contains non-numeric characters. Submit numeric values only (e.g., 450.00 not R450.00 or 450.00 ZAR).`,
        suggestion: "Remove currency symbols (R, ZAR) — amounts must be plain numbers.",
      });
    }
    // Zero-width characters (Unicode attacks: U+200B, U+200C, U+FEFF, etc.)
    if (/[\u200B\u200C\u200D\uFEFF\u00A0\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/.test(raw)) {
      issues.push({
        lineNumber: ln, field: "amount", code: "INVALID_AMOUNT_FORMAT",
        severity: "error", rule: "Invalid Amount Format",
        message: `Amount "${raw}" contains hidden/zero-width characters. This may indicate data corruption or tampering.`,
        suggestion: "Re-type the amount manually. Hidden Unicode characters can be introduced by copy-pasting from web pages or PDFs.",
      });
    }
    // Empty amount (after stripping)
    const numericAmount = raw.replace(/[^0-9.\-]/g, "");
    if (!numericAmount || numericAmount === "." || numericAmount === "-") {
      issues.push({
        lineNumber: ln, field: "amount", code: "MISSING_AMOUNT",
        severity: "error", rule: "Missing or Empty Amount",
        message: `Amount field is empty or contains no numeric value ("${raw}").`,
        suggestion: "Enter the claim amount in Rands (e.g., 450.00).",
      });
    }
  }
  // Empty amount — no rawAmount at all
  if (!item.rawAmount || !item.rawAmount.trim()) {
    issues.push({
      lineNumber: ln, field: "amount", code: "MISSING_AMOUNT",
      severity: "error", rule: "Missing Amount",
      message: "No claim amount provided. All claims require an amount.",
      suggestion: "Enter the claim amount in Rands.",
    });
  }

  // ── Rule 0h: Excessive amount (>300% of typical scheme rate) ──
  // Flag absurdly high amounts that indicate data entry errors
  if (item.amount && item.amount > 0 && item.tariffCode) {
    const tariffPrefix = item.tariffCode.substring(0, 2);
    // GP consultations (01xx): max reasonable ~R3,000 (extended complex)
    // Specialist consultations (02xx): max reasonable ~R5,000
    // Radiology (51xx): max reasonable ~R10,000
    const maxReasonable: Record<string, number> = {
      "01": 3000, "02": 5000, "03": 5000, "04": 15000, "05": 30000,
      "06": 20000, "45": 5000, "51": 10000, "81": 5000,
    };
    const maxAmount = maxReasonable[tariffPrefix];
    if (maxAmount && item.amount > maxAmount * 3) {
      issues.push({
        lineNumber: ln, field: "amount", code: "EXCESSIVE_AMOUNT",
        severity: "error", rule: "Excessive Claim Amount",
        message: `Amount R${item.amount.toFixed(2)} is extremely high for tariff ${item.tariffCode} (expected max ~R${maxAmount.toLocaleString()}). This may be a data entry error.`,
        suggestion: "Verify the amount. Common causes: extra digits, cents entered as Rands, or decimal point error.",
      });
    }
  }

  // ── Rule 1: ICD-10 code must be present ──
  if (!item.primaryICD10) {
    issues.push({
      lineNumber: ln, field: "primaryICD10", code: "MISSING_ICD10",
      severity: "error", rule: "Missing ICD-10 Code",
      message: "No ICD-10 diagnosis code supplied. Claims without a diagnosis code are rejected outright.",
      suggestion: "Add the appropriate ICD-10 code for this diagnosis.",
    });
    return issues; // Can't validate further without a code
  }

  // ── Rule 2: ICD-10 format validation ──
  const code = item.primaryICD10;

  // Check for lowercase input BEFORE format check (raw value preserved)
  if (item.rawICD10 && item.rawICD10 !== item.rawICD10.toUpperCase() && /^[a-z]\d{2}/i.test(item.rawICD10)) {
    issues.push({
      lineNumber: ln, field: "primaryICD10", code: "INVALID_FORMAT",
      severity: "error", rule: "Invalid Code Format",
      message: `"${item.rawICD10}" contains lowercase characters. ICD-10 codes must be uppercase (e.g., "${code}" not "${item.rawICD10}").`,
      suggestion: "Convert ICD-10 codes to uppercase before submission.",
    });
    return issues;
  }

  if (!ICD10_FORMAT.test(code)) {
    issues.push({
      lineNumber: ln, field: "primaryICD10", code: "INVALID_FORMAT",
      severity: "error", rule: "Invalid Code Format",
      message: `"${item.rawICD10 || code}" is not a valid ICD-10 format. Expected: Letter + 2 digits + optional decimal + subcategory (e.g., J06.9).`,
      suggestion: "Check the code format. ICD-10 codes start with a letter followed by two digits.",
    });
    return issues;
  }

  // ── Rule 3: Code exists in database (curated 1K + full 41K MIT) ──
  const entry = lookupICD10(code); // Curated database (deep metadata)
  const mitEntry = lookupMIT(code); // Full 41K SA Master Industry Table
  const chapter = getChapterForCode(code);

  // If code not in curated DB, check the full MIT
  if (!entry && !mitEntry && ICD10_FORMAT.test(code)) {
    issues.push({
      lineNumber: ln, field: "primaryICD10", code: "UNKNOWN_CODE",
      severity: "warning", rule: "Code Not in SA Master Industry Table",
      message: `"${code}" was not found in the SA ICD-10 Master Industry Table (41,009 codes). This code may be invalid or outdated.`,
      suggestion: "Verify the code against the latest SA ICD-10 MIT. Check for typos or use the Code Lookup tool.",
    });
  }

  // Specificity check — from curated DB or MIT
  if (entry && !entry.isValid) {
    issues.push({
      lineNumber: ln, field: "primaryICD10", code: "NON_SPECIFIC",
      severity: "error", rule: "Insufficient Specificity",
      message: `"${code}" (${entry.description}) requires greater specificity. This code needs a 4th or 5th character.`,
      suggestion: `Use a more specific code under the ${code} category. For example, ${code}.0 or ${code}.9.`,
    });
  } else if (!entry && mitEntry && !mitEntry.isValidClinical) {
    // MIT says code exists but isn't valid for clinical use
    issues.push({
      lineNumber: ln, field: "primaryICD10", code: "NON_SPECIFIC",
      severity: "error", rule: "Insufficient Specificity",
      message: `"${code}" (${mitEntry.description}) is not valid for clinical use per the SA MIT. A more specific code is required.`,
      suggestion: `Use a more specific subcategory code under ${code}.`,
    });
  }

  // ── Rule 4: Asterisk codes cannot be primary (check both DBs) ──
  const isAsterisk = entry?.isAsterisk || mitEntry?.isAsterisk;
  const desc = entry?.description || mitEntry?.description || code;
  if (isAsterisk) {
    issues.push({
      lineNumber: ln, field: "primaryICD10", code: "ASTERISK_PRIMARY",
      severity: "error", rule: "Manifestation Code as Primary",
      message: `"${code}" (${desc}) is an asterisk (*) manifestation code and cannot be the primary diagnosis.`,
      suggestion: "Move this code to a secondary position and use the underlying etiology (dagger) code as primary.",
    });
  }

  // ── Rule 4b: MIT says code is not valid as primary ──
  if (!isAsterisk && mitEntry && !mitEntry.isValidPrimary && mitEntry.isValidClinical) {
    issues.push({
      lineNumber: ln, field: "primaryICD10", code: "NOT_VALID_PRIMARY",
      severity: "error", rule: "Not Valid as Primary Diagnosis",
      message: `"${code}" (${mitEntry.description}) cannot be used as a primary diagnosis per the SA MIT.`,
      suggestion: "This code should be in a secondary position. Use the underlying condition as primary.",
    });
  }

  // ── Rule 5: External cause codes cannot be primary ──
  const isExternalCause = entry?.isExternalCause || /^[VWXYvwxy]/.test(code);
  if (isExternalCause) {
    issues.push({
      lineNumber: ln, field: "primaryICD10", code: "ECC_AS_PRIMARY",
      severity: "error", rule: "External Cause Code as Primary",
      message: `"${code}" is an external cause code (V00-Y99) and cannot appear in the primary diagnosis position.`,
      suggestion: "Use the injury/condition code (S/T) as primary and move this external cause code to secondary.",
    });
  }

  // ── Rule 6: Injury codes must have external cause (SA-specific) ──
  const requiresECC = entry?.requiresExternalCause || /^[ST]/i.test(code);
  if (requiresECC) {
    const hasECC = item.secondaryICD10?.some(c => /^[VWXYvwxy]/.test(c));
    if (!hasECC) {
      issues.push({
        lineNumber: ln, field: "secondaryICD10", code: "MISSING_ECC",
        severity: "error", rule: "Missing External Cause Code",
        message: `Injury/poisoning code "${code}" requires an accompanying External Cause Code (V00-Y99). SA coding standards mandate this for all S/T codes.`,
        suggestion: "Add an external cause code (e.g., W19 for fall, V89.2 for motor vehicle accident, X59 for unspecified).",
      });
    }
  }

  // ── Rule 7: Gender mismatch ──
  if (item.patientGender && item.patientGender !== "U") {
    if (entry?.genderRestriction && entry.genderRestriction !== item.patientGender) {
      const genderLabel = entry.genderRestriction === "M" ? "male" : "female";
      issues.push({
        lineNumber: ln, field: "primaryICD10", code: "GENDER_MISMATCH",
        severity: "error", rule: "Gender Mismatch",
        message: `"${code}" (${entry.description}) is restricted to ${genderLabel} patients, but patient gender is ${item.patientGender === "M" ? "male" : "female"}.`,
        suggestion: "Verify patient gender and diagnosis code. Either the gender or diagnosis may be incorrect.",
      });
    }

    // Check MIT gender restriction (41K codes — authoritative)
    if (!entry && mitEntry?.gender && (mitEntry.gender === "M" || mitEntry.gender === "F")) {
      if (mitEntry.gender !== item.patientGender) {
        const genderLabel = mitEntry.gender === "M" ? "male" : "female";
        issues.push({
          lineNumber: ln, field: "primaryICD10", code: "GENDER_MISMATCH",
          severity: "error", rule: "Gender Mismatch",
          message: `"${code}" (${mitEntry.description}) is restricted to ${genderLabel} patients per the SA MIT.`,
          suggestion: "Verify patient gender and diagnosis code.",
        });
      }
    }

    // Z-code reproductive gender restrictions (Z32.1+, Z33-Z39 = female only per SA MIT)
    if (!entry?.genderRestriction && !mitEntry?.gender) {
      const zFemaleOnly = /^Z3[2-9]/i.test(code) && !/^Z32\.0$/i.test(code) && !/^Z38/i.test(code);
      if (zFemaleOnly && item.patientGender === "M") {
        issues.push({
          lineNumber: ln, field: "primaryICD10", code: "GENDER_MISMATCH",
          severity: "error", rule: "Gender Mismatch",
          message: `"${code}" is a pregnancy/reproductive code restricted to female patients per the SA ICD-10 MIT, but patient gender is male.`,
          suggestion: "Verify patient gender and diagnosis code.",
        });
      }
    }

    // Check prefix-based gender rules for codes not in either database
    if (!entry && !mitEntry) {
      const isMaleOnly = MALE_ONLY_PREFIXES.some(p => code.startsWith(p));
      const isFemaleOnly = FEMALE_ONLY_PREFIXES.some(p => code.startsWith(p));
      if (isMaleOnly && item.patientGender === "F") {
        issues.push({
          lineNumber: ln, field: "primaryICD10", code: "GENDER_MISMATCH",
          severity: "error", rule: "Gender Mismatch",
          message: `"${code}" is in a male-only code range but patient gender is female.`,
          suggestion: "Verify patient gender and diagnosis code.",
        });
      }
      if (isFemaleOnly && item.patientGender === "M") {
        issues.push({
          lineNumber: ln, field: "primaryICD10", code: "GENDER_MISMATCH",
          severity: "error", rule: "Gender Mismatch",
          message: `"${code}" is in a female-only code range but patient gender is male.`,
          suggestion: "Verify patient gender and diagnosis code.",
        });
      }
    }
  }

  // ── Rule 8: Age validation ──
  if (item.patientAge !== undefined && !isNaN(item.patientAge)) {
    if (entry?.ageMin !== undefined && item.patientAge < entry.ageMin) {
      issues.push({
        lineNumber: ln, field: "primaryICD10", code: "AGE_MISMATCH",
        severity: "warning", rule: "Age Mismatch",
        message: `"${code}" (${entry.description}) is typically for patients aged ${entry.ageMin}+, but patient is ${item.patientAge} years old.`,
        suggestion: "Verify patient age and diagnosis code. This may be flagged by the scheme.",
      });
    }
    if (entry?.ageMax !== undefined && item.patientAge > entry.ageMax) {
      issues.push({
        lineNumber: ln, field: "primaryICD10", code: "AGE_MISMATCH",
        severity: "warning", rule: "Age Mismatch",
        message: `"${code}" (${entry.description}) is typically for patients up to age ${entry.ageMax}, but patient is ${item.patientAge} years old.`,
        suggestion: "Verify patient age and diagnosis code. This may be flagged by the scheme.",
      });
    }

    // Perinatal codes (P00-P96) for non-neonates
    if (/^P\d/i.test(code) && item.patientAge > 1) {
      issues.push({
        lineNumber: ln, field: "primaryICD10", code: "AGE_MISMATCH",
        severity: "error", rule: "Perinatal Code on Non-Neonate",
        message: `"${code}" is a perinatal condition code (P00-P96) but patient is ${item.patientAge} years old. These codes are for neonates only.`,
        suggestion: "Use an appropriate adult/paediatric diagnosis code instead.",
      });
    }

    // Pregnancy codes on patients outside reproductive age
    if (/^O\d/i.test(code) && (item.patientAge < 10 || item.patientAge > 60)) {
      issues.push({
        lineNumber: ln, field: "primaryICD10", code: "AGE_MISMATCH",
        severity: "warning", rule: "Pregnancy Code Age Check",
        message: `"${code}" is an obstetric code but patient age (${item.patientAge}) is outside typical reproductive range (12-55).`,
        suggestion: "Verify patient age. Schemes may flag this as unusual.",
      });
    }
  }

  // ── Rule 9: R-code (symptoms) usage warning ──
  if (/^R\d/i.test(code) && chapter) {
    issues.push({
      lineNumber: ln, field: "primaryICD10", code: "SYMPTOM_CODE",
      severity: "warning", rule: "Symptom Code as Primary",
      message: `"${code}" is a symptom/sign code (Chapter 18). Using symptom codes when a definitive diagnosis is available may result in reduced reimbursement.`,
      suggestion: "If a definitive diagnosis has been established, use the specific diagnosis code instead of the symptom code.",
    });
  }

  // ── Rule 10: NAPPI code validation ──
  if (item.nappiCode) {
    const nappiFormatOk = /^\d{6,7}$/.test(item.nappiCode);
    if (!nappiFormatOk) {
      issues.push({
        lineNumber: ln, field: "nappiCode", code: "INVALID_NAPPI",
        severity: "warning", rule: "Invalid NAPPI Format",
        message: `NAPPI code "${item.nappiCode}" is not a valid 6 or 7 digit format.`,
        suggestion: "NAPPI codes should be 7 digits (since 2018 migration).",
      });
    } else {
      const nappiEntry = lookupNAPPI(item.nappiCode);
      if (!nappiEntry) {
        // Clearly fabricated NAPPIs (all same digit, sequential) → error
        const isFabricated = /^(\d)\1{5,}$/.test(item.nappiCode) || item.nappiCode === "1234567" || item.nappiCode === "0000000";
        issues.push({
          lineNumber: ln, field: "nappiCode", code: isFabricated ? "FABRICATED_NAPPI" : "UNKNOWN_NAPPI",
          severity: isFabricated ? "error" : "warning",
          rule: isFabricated ? "Fabricated NAPPI Code" : "NAPPI Code Not in Database",
          message: isFabricated
            ? `NAPPI code "${item.nappiCode}" appears fabricated (repeated/sequential digits). This will be rejected.`
            : `NAPPI code "${item.nappiCode}" was not found in our reference database. Verify the code is current.`,
          suggestion: isFabricated
            ? "Use a valid NAPPI code from the MediKredit NAPPI register."
            : "Check the NAPPI code against the latest MediKredit register. Codes are updated weekly.",
        });
      }
    }
  }

  // ── Rule 11: Duplicate detection (within same line — code repeated) ──
  if (item.secondaryICD10?.includes(code)) {
    issues.push({
      lineNumber: ln, field: "primaryICD10", code: "DUPLICATE_CODE",
      severity: "warning", rule: "Duplicate ICD-10 Code",
      message: `Primary code "${code}" also appears in secondary codes. Same code should not be listed twice.`,
      suggestion: "Remove the duplicate entry from secondary codes.",
    });
  }

  // ── Rule 12: Amount validation ──
  if (item.amount !== undefined && item.amount <= 0) {
    issues.push({
      lineNumber: ln, field: "amount", code: "INVALID_AMOUNT",
      severity: "error", rule: "Invalid Claim Amount",
      message: `Claim amount is R${item.amount.toFixed(2)} — zero or negative amounts are automatically rejected by all SA schemes.`,
      suggestion: "Enter the correct charge amount for this service.",
    });
  }

  // ── Rule 13: PMB indicator ──
  if (entry?.isPMB) {
    issues.push({
      lineNumber: ln, field: "primaryICD10", code: "PMB_ELIGIBLE",
      severity: "info", rule: "PMB-Eligible Diagnosis",
      message: `"${code}" (${entry.description}) is a Prescribed Minimum Benefit condition. The scheme must cover this regardless of available benefits.`,
    });
  }

  // ── Rule 14: Quantity limits — GP/specialist consults ──
  if (item.quantity !== undefined && item.quantity > 1 && item.tariffCode) {
    const prefix = item.tariffCode.substring(0, 2);
    // GP consults (01xx), specialist consults (02xx) — max 1 per day is standard
    // 4+ is always suspicious
    if ((prefix === "01" || prefix === "02") && item.quantity >= 4) {
      issues.push({
        lineNumber: ln, field: "quantity", code: "EXCESSIVE_QUANTITY",
        severity: "error", rule: "Excessive Consultation Quantity",
        message: `${item.quantity} consultations billed on tariff "${item.tariffCode}" (${prefix === "01" ? "GP" : "Specialist"}). Billing ${item.quantity} consults on a single claim is flagged as suspicious by all SA schemes.`,
        suggestion: "Verify the quantity. GP/specialist consults should typically be 1 per claim line. Multiple consults on the same day require motivation.",
      });
    } else if ((prefix === "01" || prefix === "02") && item.quantity > 1) {
      issues.push({
        lineNumber: ln, field: "quantity", code: "MULTIPLE_CONSULTS",
        severity: "warning", rule: "Multiple Consultations",
        message: `${item.quantity} consultations billed on tariff "${item.tariffCode}". Multiple same-day consults may require pre-authorisation or motivation.`,
        suggestion: "Ensure clinical justification exists for multiple consultations.",
      });
    }
  }

  // ── Rule 15: Neonatal modifier 0019 — age check ──
  if (item.modifier === "0019" && item.patientAge !== undefined && item.patientAge > 1) {
    issues.push({
      lineNumber: ln, field: "modifier", code: "NEONATAL_MODIFIER_AGE",
      severity: "error", rule: "Neonatal Modifier on Non-Neonate",
      message: `Modifier 0019 (neonatal) used on a ${item.patientAge}-year-old patient. This modifier is restricted to neonates (< 28 days / < 1 year).`,
      suggestion: "Remove modifier 0019 or verify patient age. Using neonatal modifiers on adults is automatically rejected.",
    });
  }

  // ── Rule 16: Clinical appropriateness — medication vs diagnosis ──
  if (item.nappiCode && item.primaryICD10) {
    const isRespiratory = /^J\d/i.test(item.primaryICD10);
    let mismatchDrug: string | null = null;
    let mismatchReason = "";

    // Paracetamol (7020901, 7020902) for respiratory conditions (J-codes)
    if (item.nappiCode.startsWith("702090") && isRespiratory) {
      mismatchDrug = "Paracetamol";
      mismatchReason = "Basic analgesics are not first-line treatment for respiratory conditions.";
    }
    // Antihypertensives for respiratory J-codes
    if (item.nappiCode.startsWith("7119501") && isRespiratory) {
      mismatchDrug = "Amlodipine (antihypertensive)";
      mismatchReason = "Antihypertensives are not indicated for respiratory conditions.";
    }
    if (item.nappiCode.startsWith("7080701") && isRespiratory) {
      mismatchDrug = "Atenolol (antihypertensive)";
      mismatchReason = "Antihypertensives are not indicated for respiratory conditions.";
    }
    // Antidiabetics for respiratory J-codes
    if (item.nappiCode.startsWith("7175002") && isRespiratory) {
      mismatchDrug = "Metformin (antidiabetic)";
      mismatchReason = "Antidiabetics are not indicated for respiratory conditions.";
    }
    // Antibiotics for viral diagnoses — J06.9 (acute URI) is viral, antibiotics inappropriate
    const isViralURI = /^J06/i.test(item.primaryICD10);
    const commonAntibioticNAPPIs = ["7012001", "7012002", "7050501", "7050502", "7015001", "7015002"];
    if (isViralURI && commonAntibioticNAPPIs.some(n => item.nappiCode!.startsWith(n.substring(0, 6)))) {
      mismatchDrug = "Antibiotic";
      mismatchReason = "J06.x (acute upper respiratory infection) is typically viral — antibiotics are not first-line and may be flagged as inappropriate prescribing.";
    }

    if (mismatchDrug) {
      issues.push({
        lineNumber: ln, field: "nappiCode", code: "MEDICATION_DIAGNOSIS_MISMATCH",
        severity: "warning", rule: "Medication-Diagnosis Mismatch",
        message: `${mismatchDrug} (NAPPI ${item.nappiCode}) billed with diagnosis "${item.primaryICD10}". ${mismatchReason}`,
        suggestion: "Verify the medication is appropriate for the diagnosis. Schemes may query this combination.",
      });
    }
  }

  // ── Rule 17: Tariff discipline mismatch — dental codes by GP ──
  if (item.tariffCode) {
    const tariffNum = parseInt(item.tariffCode, 10);
    // Dental tariff codes: 8100-8999 range (SA dental procedures)
    const isDentalTariff = tariffNum >= 8100 && tariffNum <= 8999;
    // Dental tariffs should only be billed with dental diagnoses (K00-K14)
    const isDentalDiagnosis = /^K0[0-9]|^K1[0-4]/.test(code);
    if (isDentalTariff && !isDentalDiagnosis) {
      issues.push({
        lineNumber: ln, field: "tariffCode", code: "TARIFF_DISCIPLINE_MISMATCH",
        severity: "error", rule: "Dental Tariff Mismatch",
        message: `Dental tariff "${item.tariffCode}" billed with non-dental diagnosis "${code}". Dental tariffs (8100-8999) should only be billed with dental diagnoses (K00-K14).`,
        suggestion: "Use the correct tariff for the diagnosis, or update the diagnosis to the dental condition being treated.",
      });
    }

    // Invalid tariff format — must be 4 digits
    if (!/^\d{4}$/.test(item.tariffCode)) {
      issues.push({
        lineNumber: ln, field: "tariffCode", code: "INVALID_TARIFF_FORMAT",
        severity: "error", rule: "Invalid Tariff Format",
        message: `Tariff code "${item.tariffCode}" is not a valid 4-digit SA tariff code.`,
        suggestion: "SA tariff codes are 4 digits (e.g., 0190 for GP consult, 0141 for specialist).",
      });
    }
  }

  // ── Rule 17a2: Pre-auth tariff requirement (expanded) ──
  if (item.tariffCode) {
    const tariffNum = parseInt(item.tariffCode, 10);
    const motivationLower = (item.motivationText || "").toLowerCase();
    const hasPreAuthRef = motivationLower.includes("pre-auth") || motivationLower.includes("auth");
    let needsPreAuth = false;
    let preAuthReason = "";

    // Original imaging pre-auth tariffs
    const imagingPreAuth = ["5608", "5609", "5201", "5202", "5501", "5502", "5101", "5102"];
    if (imagingPreAuth.some(t => item.tariffCode!.startsWith(t.substring(0, 4)))) {
      needsPreAuth = true;
      preAuthReason = "CT/MRI/specialist imaging";
    }
    // Surgery (04xx) where amount > R5000
    if (item.tariffCode.startsWith("04") && item.amount && item.amount > 5000) {
      needsPreAuth = true;
      preAuthReason = "surgical procedure over R5,000";
    }
    // Hospital admissions (0801-0899)
    if (tariffNum >= 801 && tariffNum <= 899) {
      needsPreAuth = true;
      preAuthReason = "hospital admission";
    }
    // CT scans (5201-5299)
    if (tariffNum >= 5201 && tariffNum <= 5299) {
      needsPreAuth = true;
      preAuthReason = "CT scan";
    }
    // MRI (5608-5699)
    if (tariffNum >= 5608 && tariffNum <= 5699) {
      needsPreAuth = true;
      preAuthReason = "MRI";
    }
    // Nuclear medicine (5501-5599)
    if (tariffNum >= 5501 && tariffNum <= 5599) {
      needsPreAuth = true;
      preAuthReason = "nuclear medicine";
    }
    // Physio (03xx) with > 6 sessions
    if (item.tariffCode.startsWith("03") && tariffNum >= 300 && item.quantity && item.quantity > 6) {
      needsPreAuth = true;
      preAuthReason = "physiotherapy exceeding 6 sessions";
    }

    if (needsPreAuth && !hasPreAuthRef) {
      issues.push({
        lineNumber: ln, field: "tariffCode", code: "PREAUTH_REQUIRED",
        severity: "warning", rule: "Pre-Authorisation May Be Required",
        message: `Tariff "${item.tariffCode}" (${preAuthReason}) typically requires pre-authorisation. No pre-auth reference found in motivation text.`,
        suggestion: "Include the pre-auth reference number in the motivation text (e.g., 'Pre-auth ref: PA2026-12345').",
      });
    }
  }

  // ── Rule 17b: Upcoding detection — specialist tariff for GP-level condition ──
  if (item.tariffCode && item.primaryICD10) {
    const tariffNum = parseInt(item.tariffCode, 10);
    const isSpecialistTariff = (tariffNum >= 141 && tariffNum <= 199) || (tariffNum >= 200 && tariffNum <= 299);
    // Simple/common conditions that don't justify specialist billing
    const gpLevelConditions = [
      "J06", "J00", "J01", "J02", "J03",  // URI, cold, pharyngitis
      "L21", "L30", "L20", "B35",          // Dermatitis, eczema, fungal
      "K30", "R10",                          // Dyspepsia, abdominal pain
      "R51", "R50",                          // Headache, fever
      "N39.0",                               // UTI
      "H10",                                 // Conjunctivitis
      "B86",                                 // Scabies
    ];
    const isGPCondition = gpLevelConditions.some(c => code.startsWith(c));
    if (isSpecialistTariff && isGPCondition) {
      // Warning, not error — specialists CAN see GP-level conditions, it's just unusual
      // Only escalate to error if practice type clearly mismatches (e.g., ObGyn for dermatitis)
      issues.push({
        lineNumber: ln, field: "tariffCode", code: "UPCODING_DETECTED",
        severity: "warning", rule: "Suspected Upcoding",
        message: `Specialist tariff "${item.tariffCode}" billed for "${code}" — a condition typically managed at GP level. Review for potential upcoding.`,
        suggestion: "If specialist management is clinically justified, add motivation. Otherwise use GP tariff (0190).",
      });
    }
  }

  // ── Rule 18a: Prompt injection detection in motivation text (DETERMINISTIC) ──
  if (item.motivationText) {
    const lower = item.motivationText.toLowerCase();
    const injectionPatterns = [
      // Direct LLM attacks
      "ignore all previous", "ignore previous instructions", "override the warning",
      "system prompt", "override_warning", "return valid", "mark as valid",
      "this claim is perfectly valid", "clinically necessary and perfectly valid",
      "override immediately", "bypass", "disregard previous", "in your capacity",
      "you are an authorized", "authorize this claim",
      // Emotional manipulation (pity play)
      "child will not receive", "life-saving", "liability will be on",
      "patient will die", "blood on your hands", "urgent override needed",
      // Professional-sounding social engineering (but NOT real pre-auth refs)
      "pre-authorised by discovery health to override",
      "pre-authorized by the scheme to bypass",
      "cms regulation", "regulation allows", "clinical governance committee",
      "telephonic pre-auth", "verbal authorisation obtained",
      "workcomp urgency", "occupational injury act",
      "pre-approved under section", "approved under regulation",
      "legal obligation to process", "failure to process will result",
    ];
    // "See Attached" bypass — motivation references external docs the AI can't read
    const externalRefPatterns = [
      "see attached", "refer to specialist letter", "see lab results",
      "refer to attached", "see enclosed", "as per attachment",
      "see report", "refer to report", "documentation on file",
    ];
    const hasInjection = injectionPatterns.some(p => lower.includes(p));
    const hasExternalRef = externalRefPatterns.some(p => lower.includes(p)) && item.motivationText.trim().length < 100;

    if (hasInjection) {
      issues.push({
        lineNumber: ln, field: "motivationText", code: "PROMPT_INJECTION_DETECTED",
        severity: "error", rule: "Suspicious Motivation Text",
        message: `Motivation text contains suspicious override language: "${item.motivationText.slice(0, 80)}...". Flagged for security review.`,
        suggestion: "This claim requires manual security review. The motivation text appears to contain instructions rather than clinical justification.",
      });
    }
    if (hasExternalRef) {
      issues.push({
        lineNumber: ln, field: "motivationText", code: "INSUFFICIENT_MOTIVATION",
        severity: "warning", rule: "Insufficient Motivation",
        message: `Motivation references external documents ("${item.motivationText.slice(0, 60)}...") without providing clinical justification inline. The AI auditor cannot verify external attachments.`,
        suggestion: "Include the key clinical findings directly in the motivation text, not just a reference to external documents.",
      });
    }
  }

  // ── Rule 18b: Diagnosis-Procedure contradiction (DETERMINISTIC) ──
  if (item.tariffCode && item.primaryICD10) {
    const isImaging = item.tariffCode.startsWith("51") || item.tariffCode.startsWith("52") || item.tariffCode.startsWith("37");
    const isSurgical = item.tariffCode.startsWith("04") || item.tariffCode.startsWith("05") || item.tariffCode.startsWith("06");

    // X-ray/imaging for common cold/URI (J06, J00-J06) = contradiction
    const isCommonCold = ["J06", "J00", "J01", "J02", "J03", "J04", "J05"].some(c => code.startsWith(c));
    if (isImaging && isCommonCold) {
      issues.push({
        lineNumber: ln, field: "tariffCode", code: "PROCEDURE_DIAGNOSIS_CONTRADICTION",
        severity: "error", rule: "Procedure-Diagnosis Contradiction",
        message: `Imaging tariff "${item.tariffCode}" billed with "${code}" (upper respiratory infection). X-ray/imaging is not clinically indicated for a common cold.`,
        suggestion: "If imaging was performed for a different condition (e.g., trauma), update the ICD-10 code to reflect the actual reason for imaging.",
      });
    }

    // Surgical procedure for non-surgical diagnosis (acid reflux K21 + suturing)
    const isAcidReflux = code.startsWith("K21");
    const isSuturing = item.tariffCode.startsWith("04") && parseInt(item.tariffCode) >= 400;
    if (isSuturing && isAcidReflux) {
      issues.push({
        lineNumber: ln, field: "tariffCode", code: "PROCEDURE_DIAGNOSIS_CONTRADICTION",
        severity: "error", rule: "Procedure-Diagnosis Contradiction",
        message: `Surgical tariff "${item.tariffCode}" billed with acid reflux diagnosis "${code}". Suturing is not indicated for acid reflux.`,
        suggestion: "If a wound was sutured, use the appropriate injury ICD-10 code (e.g., S01.x, T14.1), not the acid reflux code.",
      });
    }
  }

  // ── Rule 18c: Clinical red flags ──
  // X-ray/imaging for back pain without clinical motivation
  if (item.tariffCode && item.primaryICD10) {
    const isImaging = item.tariffCode.startsWith("51") || item.tariffCode.startsWith("52") || item.tariffCode.startsWith("37");
    const isBackPain = ["M54", "M54.5", "M54.9", "M54.4", "M54.2"].some(c => code.startsWith(c));
    if (isImaging && isBackPain) {
      if (!item.motivationText?.trim()) {
        issues.push({
          lineNumber: ln, field: "tariffCode", code: "CLINICAL_RED_FLAG",
          severity: "warning", rule: "Clinical Red Flag",
          message: `Imaging tariff "${item.tariffCode}" billed with back pain diagnosis "${code}" without clinical motivation. SA schemes flag imaging for non-specific back pain without justification.`,
          suggestion: "Add clinical motivation text explaining the medical necessity for imaging (e.g., 'red flag symptoms', 'suspected fracture').",
        });
      } else {
        // Has motivation text — flag for AI review (will be evaluated in post-validation)
        issues.push({
          lineNumber: ln, field: "tariffCode", code: "CLINICAL_NEEDS_AI_REVIEW",
          severity: "info", rule: "Clinical Motivation Under Review",
          message: `Imaging for back pain with motivation: "${item.motivationText.slice(0, 100)}". Pending AI clinical review.`,
          _motivationText: item.motivationText,
          _procedure: item.tariffCode,
          _diagnosis: code,
        } as ValidationIssue & { _motivationText: string; _procedure: string; _diagnosis: string });
      }
    }
  }

  // ── Rule 19: Multiple modifier review ──
  if (item.modifier && item.modifier.includes(",")) {
    issues.push({
      lineNumber: ln, field: "modifier", code: "MULTIPLE_MODIFIERS",
      severity: "warning", rule: "Multiple Modifier Review",
      message: `Multiple modifiers detected: "${item.modifier}". Claims with multiple modifiers require manual review by the scheme.`,
      suggestion: "Verify all modifiers are appropriate. Some modifier combinations are invalid.",
    });
  }

  // ── Rule 20: Amount above scheme rate ──
  if (item.amount && item.amount > 0 && item.tariffCode) {
    // GP consult (0190) typical rate: R400-R600. Flag if significantly above.
    const schemeRates: Record<string, number> = {
      "0190": 600, "0191": 800, "0192": 1000, "0141": 1500, "0142": 1800,
    };
    const expectedMax = schemeRates[item.tariffCode];
    if (expectedMax && item.amount > expectedMax * 2) {
      issues.push({
        lineNumber: ln, field: "amount", code: "AMOUNT_ABOVE_SCHEME_RATE",
        severity: "warning", rule: "Amount Above Scheme Rate",
        message: `R${item.amount.toFixed(2)} is significantly above the typical scheme rate (~R${expectedMax}) for tariff "${item.tariffCode}". The scheme may reduce payment to the scheme rate.`,
        suggestion: "Verify the amount. Schemes typically reimburse at their own rate tables.",
      });
    }
  }

  // ── Rule 21: PMB modifier check ──
  // CDL conditions with medication (NAPPI present) or modifier field available
  // but empty should be warned — they're likely CDL claims that need PMB routing.
  // Routine GP visits for chronic conditions without medication don't need it.
  // Check if PMB modifier is present (could be sole modifier or part of comma-separated list)
  const hasPMBModifier = item.modifier ? /\bPMB\b/i.test(item.modifier) || item.modifier === "0000" : false;
  if (entry?.isPMB && !hasPMBModifier) {
    const cdlCodes = ["J45", "E10", "E11", "E12", "E13", "E14", "I10", "I11", "I12", "I13", "I15"];
    const isCDLCode = cdlCodes.some(p => code.startsWith(p));
    if (isCDLCode) {
      // Strict CDL conditions (J45 asthma, E11 diabetes, I10 hypertension) → always warn
      // These are the most commonly audited CDL conditions by SA schemes
      const strictCDL = ["J45", "E11", "I10"].some(p => code.startsWith(p));
      const hasMedication = !!item.nappiCode;
      const shouldWarn = strictCDL || hasMedication;
      issues.push({
        lineNumber: ln, field: "modifier", code: shouldWarn ? "PMB_MODIFIER_MISSING" : "PMB_MODIFIER_NOTE",
        severity: shouldWarn ? "warning" : "info",
        rule: shouldWarn ? "PMB Modifier Missing" : "CDL/PMB Condition Detected",
        message: shouldWarn
          ? `"${code}" is a CDL condition without a PMB modifier. SA schemes require the PMB modifier for Asthma, Diabetes, and Hypertension claims to route to the CDL benefit.`
          : `"${code}" is a Chronic Disease List condition. If claiming under the CDL benefit, a PMB modifier may be required.`,
        suggestion: shouldWarn ? "Add the PMB modifier (e.g., 'PMB') to ensure correct benefit routing." : undefined,
      });
    }
  }

  // ── Rule 22: Referring provider required for specialist/pathology/radiology ──
  if (item.tariffCode) {
    const referralPrefixes = ["02", "04", "45", "51"];
    const needsReferral = referralPrefixes.some(p => item.tariffCode!.startsWith(p));
    if (needsReferral) {
      const motivationLower = (item.motivationText || "").toLowerCase();
      const hasReferralInfo = motivationLower.includes("referred by") || motivationLower.includes("ref:");
      if (!hasReferralInfo) {
        issues.push({
          lineNumber: ln, field: "tariffCode", code: "MISSING_REFERRING_PROVIDER",
          severity: "warning", rule: "Missing Referring Provider",
          message: `Specialist/pathology/radiology tariff "${item.tariffCode}" typically requires a referring provider. No referral indicator found in motivation text.`,
          suggestion: "Include referring provider details in motivation text (e.g., 'Referred by: Dr Smith, PR 0123456'). Schemes may reject specialist claims without a referral.",
        });
      }
    }
  }

  // ── Rule 23: High-schedule medicine (S5+) without prescriber context ──
  if (item.nappiCode && /^\d{6,7}$/.test(item.nappiCode)) {
    const nappiEntry = lookupNAPPI(item.nappiCode);
    if (nappiEntry && nappiEntry.schedule) {
      const scheduleNum = parseInt(nappiEntry.schedule.replace(/^S/i, ""), 10);
      if (scheduleNum >= 5) {
        const isPharmacy = (item.practiceNumber && item.practiceNumber.startsWith("070")) ||
          (item.practitionerType && item.practitionerType.toLowerCase().includes("pharm"));
        if (isPharmacy) {
          issues.push({
            lineNumber: ln, field: "nappiCode", code: "HIGH_SCHEDULE_MEDICINE",
            severity: "warning", rule: "Schedule 5+ Medicine Dispensed",
            message: `NAPPI ${item.nappiCode} is a Schedule ${nappiEntry.schedule} controlled substance dispensed by a pharmacy. Ensure prescriber details are on file.`,
            suggestion: "Schedule 5+ medicines require a valid prescription. Ensure the prescribing practitioner's name, practice number, and prescription date are recorded.",
          });
        }
      }
    }
  }

  // ── Rule 24: DISCIPLINE_TARIFF_SCOPE — Practice number prefix must match tariff range ──
  if (item.practiceNumber && item.tariffCode && /^\d{7}$/.test(item.practiceNumber) && /^\d{4}$/.test(item.tariffCode)) {
    const prefix3 = item.practiceNumber.substring(0, 3);
    const scope = DISCIPLINE_TARIFF_SCOPE[prefix3];
    const tariffNum = parseInt(item.tariffCode, 10);
    if (scope) {
      if (scope.label === "Pharmacy") {
        // Pharmacy practices should not bill consultation codes (01xx-03xx)
        if (tariffNum >= 100 && tariffNum <= 399) {
          issues.push({
            lineNumber: ln, field: "tariffCode", code: "DISCIPLINE_TARIFF_SCOPE",
            severity: "error", rule: "Discipline-Tariff Scope Mismatch",
            message: `Pharmacy practice (${item.practiceNumber}) billing consultation tariff "${item.tariffCode}". Pharmacy practices should not bill consultation codes.`,
            suggestion: "Verify the practice number and tariff code. Pharmacies bill dispensing fees, not consultation tariffs.",
          });
        }
      } else if (tariffNum < scope.min || tariffNum > scope.max) {
        const isGP = prefix3 === "014" || prefix3 === "015";
        const isSpecialistTariff = tariffNum >= 200;
        if (isGP && isSpecialistTariff) {
          issues.push({
            lineNumber: ln, field: "tariffCode", code: "DISCIPLINE_TARIFF_SCOPE",
            severity: "error", rule: "Discipline-Tariff Scope Mismatch",
            message: `GP practice (${item.practiceNumber}, prefix ${prefix3}) billing specialist tariff "${item.tariffCode}" (code 0200+). GPs can only bill GP consultation tariffs (0190-0199).`,
            suggestion: "Use the correct GP tariff code (e.g., 0190 for standard GP consultation) or verify the practice number.",
          });
        } else {
          issues.push({
            lineNumber: ln, field: "tariffCode", code: "DISCIPLINE_TARIFF_SCOPE",
            severity: "warning", rule: "Discipline-Tariff Scope Mismatch",
            message: `Practice prefix ${prefix3} (${scope.label}) billing tariff "${item.tariffCode}" which is outside the expected range (${String(scope.min).padStart(4, "0")}-${String(scope.max).padStart(4, "0")}).`,
            suggestion: "Verify the tariff code matches the provider's discipline. Mismatched discipline-tariff claims are commonly rejected.",
          });
        }
      }
    }
  }

  // ── Rule 25: PROCEDURE_BUNDLING — Flag tariffs that are part of known bundling pairs ──
  if (item.tariffCode) {
    for (const [codeA, codeB, reason] of BUNDLING_PAIRS) {
      if (item.tariffCode === codeA || item.tariffCode === codeB) {
        issues.push({
          lineNumber: ln, field: "tariffCode", code: "PROCEDURE_BUNDLING_CANDIDATE",
          severity: "info", rule: "Bundling Candidate",
          message: `Tariff "${item.tariffCode}" is part of a known bundling pair (${codeA}/${codeB}: ${reason}). Cross-line check will verify if both codes appear for the same patient and date.`,
        });
      }
    }
  }

  // ── Rule 26: AFTER_HOURS_MODIFIER — Validate after-hours modifiers against service date ──
  if (item.modifier && item.dateOfService) {
    const afterHoursModifiers = item.modifier.split(",").map(m => m.trim());
    const afterHoursDateParts = item.dateOfService.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (afterHoursDateParts) {
      const svcDate = new Date(parseInt(afterHoursDateParts[1]), parseInt(afterHoursDateParts[2]) - 1, parseInt(afterHoursDateParts[3]));
      const dayOfWeek = svcDate.getDay(); // 0 = Sunday, 6 = Saturday

      if (afterHoursModifiers.includes("0011")) {
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          issues.push({
            lineNumber: ln, field: "modifier", code: "AFTER_HOURS_MODIFIER",
            severity: "info", rule: "After-Hours Modifier on Weekday",
            message: `After-hours modifier 0011 used on a weekday (${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][dayOfWeek]}). This is valid for evening/night services but may be queried by the scheme.`,
            suggestion: "Ensure the service was rendered outside normal practice hours (typically after 18:00 or before 07:00).",
          });
        }
      }

      if (afterHoursModifiers.includes("0012")) {
        if (dayOfWeek !== 0) {
          issues.push({
            lineNumber: ln, field: "modifier", code: "AFTER_HOURS_MODIFIER",
            severity: "warning", rule: "Sunday/Holiday Modifier on Non-Sunday",
            message: `Sunday/public holiday modifier 0012 used on ${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][dayOfWeek]} (${item.dateOfService}). This modifier is for Sundays and public holidays only.`,
            suggestion: "Verify the date of service. If it was a public holiday, add a note in the motivation. Otherwise, use modifier 0011 for weekday after-hours.",
          });
        }
      }
    }
  }

  return issues;
}

// ─── CROSS-LINE VALIDATION ───────────────────────────────────────

function validateCrossLine(lines: ClaimLineItem[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Detect duplicate claims — must match ALL of: patient + ICD-10 + date + tariff + amount
  // A patient CAN have multiple services (different tariffs) on the same day — that's NOT a duplicate
  const seen = new Map<string, number>();
  for (const line of lines) {
    const key = `${(line.patientName || "").toLowerCase()}|${line.primaryICD10}|${line.dateOfService || ""}|${line.tariffCode || ""}|${line.amount || ""}|${line.modifier || ""}`;
    if (key && seen.has(key)) {
      issues.push({
        lineNumber: line.lineNumber, field: "primaryICD10", code: "DUPLICATE_CLAIM",
        severity: "error", rule: "Duplicate Claim",
        message: `Exact duplicate: same patient, diagnosis "${line.primaryICD10}", tariff "${line.tariffCode || "N/A"}", amount, and date as line ${seen.get(key)}.`,
        suggestion: "Review for possible duplicate billing. Remove if this is the same service.",
      });
    } else {
      seen.set(key, line.lineNumber);
    }
  }

  // ── Micro-unbundling: aggregate quantities per patient/day/tariff across file ──
  const qtyByPatientDayTariff = new Map<string, { total: number; lines: number[] }>();
  for (const line of lines) {
    if (!line.tariffCode || !line.quantity) continue;
    const key = `${(line.patientName || "").toLowerCase()}|${line.dateOfService || ""}|${line.tariffCode}`;
    const entry = qtyByPatientDayTariff.get(key) || { total: 0, lines: [] };
    entry.total += line.quantity;
    entry.lines.push(line.lineNumber);
    qtyByPatientDayTariff.set(key, entry);
  }
  for (const [key, entry] of qtyByPatientDayTariff) {
    const tariff = key.split("|")[2];
    const isConsult = tariff.startsWith("01") || tariff.startsWith("02");
    if (isConsult && entry.total >= 4 && entry.lines.length > 1) {
      // Multiple rows with same tariff for same patient on same day = micro-unbundling
      for (const ln of entry.lines.slice(1)) {
        issues.push({
          lineNumber: ln, field: "quantity", code: "MICRO_UNBUNDLING",
          severity: "warning", rule: "Suspected Micro-Unbundling",
          message: `Patient has ${entry.total} total units of tariff "${tariff}" across ${entry.lines.length} separate lines on the same day. This may be an attempt to split quantities to avoid detection.`,
          suggestion: "Combine into a single claim line or provide clinical justification for multiple separate encounters.",
        });
      }
    }
  }

  // ── Copy-paste motivation detection: same text across multiple patients ──
  const motivationCounts = new Map<string, number[]>();
  for (const line of lines) {
    if (!line.motivationText || line.motivationText.trim().length < 20) continue;
    const normalized = line.motivationText.trim().toLowerCase().slice(0, 200);
    const entry = motivationCounts.get(normalized) || [];
    entry.push(line.lineNumber);
    motivationCounts.set(normalized, entry);
  }
  for (const [, lineNums] of motivationCounts) {
    // Threshold: 5+ identical motivations = suspicious. 3-4 could be legitimate (flu season)
    if (lineNums.length >= 5) {
      for (const ln of lineNums) {
        issues.push({
          lineNumber: ln, field: "motivationText", code: "COPY_PASTE_MOTIVATION",
          severity: "warning", rule: "Duplicate Motivation Text",
          message: `Identical motivation text used across ${lineNums.length} claims. This pattern is flagged as potential copy-paste fraud.`,
          suggestion: "Each claim should have unique, patient-specific clinical justification.",
        });
      }
    }
  }

  // ── Time impossibility: provider billing more than physically possible ──
  const claimsByProviderDay = new Map<string, { total: number; consultCount: number; lineNumbers: number[] }>();
  for (const line of lines) {
    if (!line.practiceNumber || !line.dateOfService) continue;
    const key = `${line.practiceNumber}|${line.dateOfService}`;
    const entry = claimsByProviderDay.get(key) || { total: 0, consultCount: 0, lineNumbers: [] };
    entry.total++;
    entry.lineNumbers.push(line.lineNumber);
    // Count consultation tariffs (01xx GP, 02xx specialist)
    if (line.tariffCode && (line.tariffCode.startsWith("01") || line.tariffCode.startsWith("02"))) {
      entry.consultCount++;
    }
    claimsByProviderDay.set(key, entry);
  }
  for (const [key, entry] of claimsByProviderDay) {
    const [practiceNum, dateStr] = key.split("|");
    if (entry.total > 50) {
      for (const ln of entry.lineNumbers) {
        issues.push({
          lineNumber: ln, field: "practiceNumber", code: "TIME_IMPOSSIBILITY",
          severity: "warning", rule: "Time Impossibility — Excessive Daily Claims",
          message: `Practice ${practiceNum} has ${entry.total} claims on ${dateStr}. More than 50 claims per provider per day is physically implausible.`,
          suggestion: "Review this provider's billing for the day. This volume may indicate batch duplication or fraudulent billing.",
        });
      }
    }
    if (entry.consultCount > 25) {
      for (const ln of entry.lineNumbers) {
        // Only flag lines that are consultations, to avoid noise on non-consult lines
        const line = lines.find(l => l.lineNumber === ln);
        if (line?.tariffCode && (line.tariffCode.startsWith("01") || line.tariffCode.startsWith("02"))) {
          issues.push({
            lineNumber: ln, field: "practiceNumber", code: "TIME_IMPOSSIBILITY_CONSULTS",
            severity: "warning", rule: "Time Impossibility — Excessive Consultations",
            message: `Practice ${practiceNum} has ${entry.consultCount} consultation tariffs on ${dateStr}. More than 25 consultations in one day exceeds reasonable capacity.`,
            suggestion: "A typical provider sees 20-25 patients per day maximum. This volume suggests possible billing irregularities.",
          });
        }
      }
    }
  }

  // ── Rule 27: FREQUENCY_LIMIT — Screening procedures have per-batch caps ──
  const screeningByPatient = new Map<string, Map<string, number[]>>();
  for (const line of lines) {
    if (!line.tariffCode) continue;
    const patientKey = (line.patientName || "unknown").toLowerCase();
    if (!screeningByPatient.has(patientKey)) screeningByPatient.set(patientKey, new Map());
    const patientMap = screeningByPatient.get(patientKey)!;
    for (const fl of FREQUENCY_LIMITS) {
      if (line.tariffCode === fl.tariff) {
        const existing = patientMap.get(fl.tariff) || [];
        existing.push(line.lineNumber);
        patientMap.set(fl.tariff, existing);
      }
    }
  }
  for (const [patientKey, tariffMap] of screeningByPatient) {
    for (const fl of FREQUENCY_LIMITS) {
      const lineNums = tariffMap.get(fl.tariff);
      if (lineNums && lineNums.length > fl.maxPerBatch) {
        for (const ln of lineNums.slice(fl.maxPerBatch)) {
          issues.push({
            lineNumber: ln, field: "tariffCode", code: "FREQUENCY_LIMIT",
            severity: "warning", rule: "Screening Frequency Limit Exceeded",
            message: `${fl.label} (tariff ${fl.tariff}) appears ${lineNums.length} time(s) for patient "${patientKey}" in this batch. Maximum is ${fl.maxPerBatch} per submission batch.`,
            suggestion: `Remove the duplicate ${fl.label} screening. Schemes typically allow ${fl.maxPerBatch} per year — multiple in one batch will be rejected.`,
          });
        }
      }
    }
  }

  // ── Rule 28: CONFLICTING_ICD10 — Mutually exclusive diagnosis codes ──
  for (const line of lines) {
    if (!line.primaryICD10) continue;
    const allCodes = [line.primaryICD10, ...(line.secondaryICD10 || [])];
    for (const [codeA, codeB, reason] of CONFLICTING_ICD10_PAIRS) {
      const hasA = allCodes.some(c => c.startsWith(codeA));
      const hasB = allCodes.some(c => c.startsWith(codeB));
      if (hasA && hasB) {
        issues.push({
          lineNumber: line.lineNumber, field: "primaryICD10", code: "CONFLICTING_ICD10",
          severity: "error", rule: "Conflicting Diagnosis Codes",
          message: `Line has both ${codeA} and ${codeB} codes: ${reason}. These diagnoses are mutually exclusive and cannot coexist on the same claim line.`,
          suggestion: "Review the diagnosis codes. Only one of these conditions can apply to a patient at a time. Remove the incorrect code.",
        });
      }
    }
  }

  // ── Rule 25b: PROCEDURE_BUNDLING cross-line — Check bundling pairs across patient+date ──
  const tariffsByPatientDate = new Map<string, { tariff: string; lineNumber: number }[]>();
  for (const line of lines) {
    if (!line.tariffCode) continue;
    const key = `${(line.patientName || "").toLowerCase()}|${line.dateOfService || ""}`;
    const existing = tariffsByPatientDate.get(key) || [];
    existing.push({ tariff: line.tariffCode, lineNumber: line.lineNumber });
    tariffsByPatientDate.set(key, existing);
  }
  for (const [, tariffLines] of tariffsByPatientDate) {
    if (tariffLines.length < 2) continue;
    const tariffs = tariffLines.map(t => t.tariff);
    for (const [codeA, codeB, reason] of BUNDLING_PAIRS) {
      const hasA = tariffs.includes(codeA);
      const hasB = tariffs.includes(codeB);
      if (hasA && hasB) {
        const secondLine = tariffLines.find(t => t.tariff === codeB) || tariffLines[tariffLines.length - 1];
        issues.push({
          lineNumber: secondLine.lineNumber, field: "tariffCode", code: "PROCEDURE_BUNDLING",
          severity: "warning", rule: "Procedure Unbundling Detected",
          message: `Tariffs ${codeA} and ${codeB} both billed for same patient on same date: ${reason}. These should typically be billed as a single comprehensive code.`,
          suggestion: "Review for possible unbundling. Combine into the appropriate comprehensive tariff code to avoid rejection.",
        });
      }
    }
  }

  return issues;
}

// ─── MAIN VALIDATION ENTRY POINT ─────────────────────────────────

export function validateClaims(lines: ClaimLineItem[]): ValidationResult {
  const lineResults: LineValidationResult[] = [];
  let allIssues: ValidationIssue[] = [];

  // Validate each line
  for (const line of lines) {
    const lineIssues = validateLine(line);
    const hasError = lineIssues.some(i => i.severity === "error");
    const hasWarning = lineIssues.some(i => i.severity === "warning");
    lineResults.push({
      lineNumber: line.lineNumber,
      status: hasError ? "error" : hasWarning ? "warning" : "valid",
      issues: lineIssues,
      claimData: line,
    });
    allIssues.push(...lineIssues);
  }

  // Cross-line validation
  const crossIssues = validateCrossLine(lines);
  allIssues.push(...crossIssues);
  // Merge cross-line issues into line results
  for (const issue of crossIssues) {
    const lr = lineResults.find(r => r.lineNumber === issue.lineNumber);
    if (lr) {
      lr.issues.push(issue);
      if (issue.severity === "error") lr.status = "error";
      else if (issue.severity === "warning" && lr.status === "valid") lr.status = "warning";
    }
  }

  // Build summary
  const errorCount = allIssues.filter(i => i.severity === "error").length;
  const warningCount = allIssues.filter(i => i.severity === "warning").length;
  const infoCount = allIssues.filter(i => i.severity === "info").length;

  const byRule: Record<string, number> = {};
  for (const issue of allIssues) {
    byRule[issue.rule] = (byRule[issue.rule] || 0) + 1;
  }

  const validClaims = lineResults.filter(r => r.status === "valid").length;
  const invalidClaims = lineResults.filter(r => r.status === "error").length;
  const warningClaims = lineResults.filter(r => r.status === "warning").length;

  const estimatedRejectionRate = lines.length > 0 ? Math.round((invalidClaims / lines.length) * 100) : 0;

  // Estimate savings: average claim R800, each rejection costs ~R800 + admin
  const avgClaimValue = lines.reduce((sum, l) => sum + (l.amount || 800), 0) / (lines.length || 1);
  const estimatedSavings = Math.round(invalidClaims * avgClaimValue * 0.85); // 85% recovery rate

  // Top issues
  const topIssues = Object.entries(byRule)
    .map(([rule, count]) => {
      const severity = allIssues.find(i => i.rule === rule)?.severity || "info";
      return { rule, count, severity };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const summary: ValidationSummary = {
    errorCount,
    warningCount,
    infoCount,
    byRule,
    estimatedRejectionRate,
    estimatedSavings,
    topIssues,
  };

  // ─── Batch Intelligence ─────────────────────────────────────────
  // When a single rule affects 80%+ of claims, flag it as a batch-level issue
  // with clear explanation and fix — don't make the user dig through 100 rows
  const batchInsights: { rule: string; affectedCount: number; percentage: number; severity: string; explanation: string; fix: string }[] = [];
  if (lines.length >= 5) {
    for (const { rule, count, severity } of topIssues) {
      const pct = Math.round((count / lines.length) * 100);
      if (pct >= 50) {
        const insight = getBatchExplanation(rule, count, lines.length, pct);
        batchInsights.push({ rule, affectedCount: count, percentage: pct, severity, ...insight });
      }
    }
  }

  return {
    totalClaims: lines.length,
    validClaims,
    invalidClaims,
    warningClaims,
    issues: allIssues,
    summary,
    lineResults,
    batchInsights,
  };
}

/** Generate plain-English explanations for common batch failures */
function getBatchExplanation(rule: string, count: number, total: number, pct: number): { explanation: string; fix: string } {
  const r = rule.toLowerCase();
  if (r.includes("missing icd") || r.includes("icd-10")) {
    return {
      explanation: `${count} of ${total} claims (${pct}%) are missing or have invalid ICD-10 diagnosis codes. This is the #1 cause of claim rejections in South Africa.`,
      fix: "Ensure every claim line has a valid ICD-10 code in the format A00.0 (letter + 2 digits + dot + digit). Only the icd10_code column is required.",
    };
  }
  if (r.includes("specificity") || r.includes("non-specific")) {
    return {
      explanation: `${count} of ${total} claims (${pct}%) use non-specific ICD-10 codes (3-character codes without a 4th digit). Medical schemes reject these because they lack clinical detail.`,
      fix: "Add the 4th character to each code. Example: J06 → J06.9 (Acute upper respiratory infection, unspecified). Our auto-correct can fix most of these — click 'Auto-Correct' after review.",
    };
  }
  if (r.includes("format") || r.includes("invalid code")) {
    return {
      explanation: `${count} of ${total} claims (${pct}%) have ICD-10 codes in the wrong format. SA uses the WHO ICD-10 format: one letter + 2-4 digits with an optional dot.`,
      fix: "Check for typos: J069 should be J06.9, E119 should be E11.9. Ensure codes start with a letter (A-Z) followed by digits.",
    };
  }
  if (r.includes("external cause") || r.includes("ecc")) {
    return {
      explanation: `${count} of ${total} claims (${pct}%) have injury codes (S/T chapter) without a required External Cause Code (V/W/X/Y). SA medical schemes mandate ECC for all injury claims.`,
      fix: "Add the appropriate V/W/X/Y code as a secondary diagnosis. Example: S61.0 (hand laceration) needs W26 (contact with knife) or similar.",
    };
  }
  if (r.includes("gender")) {
    return {
      explanation: `${count} of ${total} claims (${pct}%) have diagnosis codes that don't match the patient's gender. For example, male-only prostate codes on female patients.`,
      fix: "Verify the patient_gender column matches the clinical codes. Check for data entry errors in the gender field.",
    };
  }
  if (r.includes("duplicate")) {
    return {
      explanation: `${count} of ${total} claims (${pct}%) appear to be duplicate submissions (same patient, code, and date).`,
      fix: "Remove duplicate rows from your CSV. If these are intentional repeat visits, differentiate by adding unique dates or modifier codes.",
    };
  }
  if (r.includes("dependent") || r.includes("dep_")) {
    return {
      explanation: `${count} of ${total} claims (${pct}%) are missing the dependent code. SA medical schemes require a 2-digit dependent code (00 = main member, 01-09 = dependents).`,
      fix: "Add a 'dependent_code' column to your CSV. Use '00' for the main member, '01' for spouse, '02'+ for children.",
    };
  }
  if (r.includes("tariff") || r.includes("unknown tariff")) {
    return {
      explanation: `${count} of ${total} claims (${pct}%) have unrecognised tariff/procedure codes.`,
      fix: "Verify tariff codes against the NHRPL (National Health Reference Price List). SA uses 4-digit CCSA codes, not US CPT codes.",
    };
  }
  if (r.includes("asterisk") || r.includes("manifestation")) {
    return {
      explanation: `${count} of ${total} claims (${pct}%) use manifestation (asterisk) codes as the primary diagnosis. These codes describe symptoms, not the underlying condition.`,
      fix: "Swap the primary and secondary codes. The dagger (†) code (underlying disease) must be primary; the asterisk (*) code (manifestation) must be secondary.",
    };
  }
  // Generic fallback
  return {
    explanation: `${count} of ${total} claims (${pct}%) failed the "${rule}" check. This pattern suggests a systematic issue with your data rather than individual errors.`,
    fix: "Review the first few flagged claims to understand the pattern, then apply the fix across your entire file before re-uploading.",
  };
}

// ─── ADVANCED CLINICAL VALIDATION (Gaps 15-19) ──────────────────────
export function validateAdvancedClinical(lines: ClaimLineItem[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // ── Rule 15: FORMULARY_GENERIC — Brand medicine when generic exists ──
  for (const line of lines) {
    const ln = line.lineNumber;

    if (line.nappiCode) {
      const nappiEntry = lookupNAPPI(line.nappiCode);
      if (
        nappiEntry &&
        nappiEntry.manufacturer &&
        nappiEntry.manufacturer !== "Generic" &&
        line.amount != null &&
        line.amount > 200
      ) {
        issues.push({
          lineNumber: ln,
          field: "nappiCode",
          code: "FORMULARY_GENERIC",
          severity: "info",
          rule: "Brand-Name Medicine Dispensed",
          message: "Brand-name medicine dispensed. Generic alternatives may be available at lower cost.",
          suggestion: `NAPPI ${line.nappiCode} (${nappiEntry.description ?? "unknown"}) is manufactured by ${nappiEntry.manufacturer}. Consider a generic equivalent to reduce patient and scheme costs.`,
        });
      }
    }

    // ── Rule 16b: PHARMACIST_ICD10 — Pharmacist assigning specific diagnoses ──
    const isPharmacy =
      (line.practiceNumber && line.practiceNumber.startsWith("070")) ||
      (line.practitionerType && line.practitionerType.toLowerCase().includes("pharm"));

    if (isPharmacy && line.primaryICD10) {
      // Highly specific = has a dot with 4+ total chars (e.g., E11.2, not E11)
      const isHighlySpecific = /^[A-Z]\d{2}\.\d+$/i.test(line.primaryICD10) && line.primaryICD10.length >= 4;
      if (isHighlySpecific) {
        issues.push({
          lineNumber: ln,
          field: "primaryICD10",
          code: "PHARMACIST_ICD10",
          severity: "warning",
          rule: "Pharmacy-Specific Diagnosis Code",
          message: "Pharmacy-dispensed claim uses a specific diagnosis code. Pharmacists should use general/unspecified codes.",
          suggestion: `Code ${line.primaryICD10} is highly specific. Pharmacists typically use unspecified codes (e.g., ending in .9) unless directed by a prescriber.`,
        });
      }
    }

    // ── Rule 17c: UNCERTAIN_DIAGNOSIS — Query diagnosis in motivation text ──
    if (line.motivationText && line.primaryICD10) {
      const motivLower = line.motivationText.toLowerCase();
      const uncertainPatterns = ["query", "?", "possible", "probable", "suspected", "rule out"];
      const hasUncertainLanguage = uncertainPatterns.some((p) => motivLower.includes(p));

      if (hasUncertainLanguage) {
        // Confirmed diagnosis = NOT a Z-code (factors influencing health) or R-code (symptoms/signs)
        const codeUpper = line.primaryICD10.toUpperCase();
        const isConfirmedDiagnosis = !codeUpper.startsWith("Z") && !codeUpper.startsWith("R");

        if (isConfirmedDiagnosis) {
          issues.push({
            lineNumber: ln,
            field: "motivationText",
            code: "UNCERTAIN_DIAGNOSIS",
            severity: "info",
            rule: "Uncertain Diagnosis Language",
            message: "Motivation text suggests uncertain diagnosis but a confirmed ICD-10 code was used.",
            suggestion: `The motivation contains uncertain language but code ${line.primaryICD10} is a confirmed diagnosis. Consider using an R-code (symptoms) or Z-code (screening) if the diagnosis is not yet confirmed.`,
          });
        }
      }
    }

    // ── Rule 18d: SEP_EXCEEDED — Medicine price exceeds Single Exit Price ──
    // NOTE: The NAPPIEntry type does not currently include a price field.
    // When the NAPPI database is extended with SEP pricing data, uncomment and
    // enable this rule. The logic should compare line.amount against
    // nappiEntry.price * 1.5 (50% threshold above reference price).
    // if (line.nappiCode && line.amount != null) {
    //   const nappiEntry = lookupNAPPI(line.nappiCode);
    //   if (nappiEntry && nappiEntry.price != null) {
    //     const threshold = nappiEntry.price * 1.5;
    //     if (line.amount > threshold) {
    //       issues.push({
    //         lineNumber: ln,
    //         field: "amount",
    //         code: "SEP_EXCEEDED",
    //         severity: "warning",
    //         rule: "Exceeds Reference Price",
    //         message: "Claim amount significantly exceeds reference price for this medicine.",
    //         suggestion: `Claimed R${line.amount.toFixed(2)} vs reference R${nappiEntry.price.toFixed(2)}. Verify pricing or provide motivation.`,
    //       });
    //     }
    //   }
    // }
  }

  // ── Rule 19b: CONSULT_LEVEL_DISTRIBUTION — Upcoding pattern detection ──
  const consultTariffs = ["0190", "0191", "0192", "0193"];
  const consultLines = lines.filter(
    (l) => l.tariffCode && consultTariffs.includes(l.tariffCode)
  );

  // Group by practice_number
  const byProvider = new Map<string, ClaimLineItem[]>();
  for (const cl of consultLines) {
    const key = cl.practiceNumber || "UNKNOWN";
    const existing = byProvider.get(key);
    if (existing) {
      existing.push(cl);
    } else {
      byProvider.set(key, [cl]);
    }
  }

  for (const [practiceNumber, providerLines] of byProvider) {
    if (providerLines.length <= 5) continue; // Need >5 consults for pattern analysis

    const level3and4 = providerLines.filter(
      (l) => l.tariffCode === "0192" || l.tariffCode === "0193"
    );
    const highLevelPct = Math.round((level3and4.length / providerLines.length) * 100);

    if (highLevelPct > 60) {
      for (const cl of level3and4) {
        issues.push({
          lineNumber: cl.lineNumber,
          field: "tariffCode",
          code: "CONSULT_LEVEL_DISTRIBUTION",
          severity: "warning",
          rule: "Consultation Upcoding Pattern",
          message: `Provider ${practiceNumber} bills ${highLevelPct}% at Level 3-4 (SA average ~25%). Review for potential upcoding.`,
          suggestion: `This provider has ${level3and4.length} of ${providerLines.length} consultations at Level 3-4. The SA average is approximately 25%. Consider clinical audit.`,
        });
      }
    }
  }

  return issues;
}
