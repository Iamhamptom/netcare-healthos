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

    return {
      lineNumber: idx + 1,
      patientName: mapping.patientName ? row[mapping.patientName] : undefined,
      patientGender: gender === "M" || gender === "F" ? gender : "U",
      patientAge: ageStr ? parseInt(ageStr, 10) || undefined : undefined,
      primaryICD10: (mapping.primaryICD10 ? row[mapping.primaryICD10] : "").toUpperCase().trim(),
      secondaryICD10: secondaryStr
        ? secondaryStr.split(/[,;|]/).map(c => c.trim().toUpperCase()).filter(Boolean)
        : undefined,
      tariffCode: mapping.tariffCode ? row[mapping.tariffCode]?.trim() : undefined,
      nappiCode: mapping.nappiCode ? row[mapping.nappiCode]?.trim().replace(/-/g, "") : undefined,
      quantity: mapping.quantity ? parseInt(row[mapping.quantity], 10) || undefined : undefined,
      amount: mapping.amount ? parseFloat(row[mapping.amount]) || undefined : undefined,
      modifier: mapping.modifier ? row[mapping.modifier]?.trim() : undefined,
      practitionerType: mapping.practitionerType ? normalizeDiscipline(row[mapping.practitionerType]?.trim()) : undefined,
      dateOfService: mapping.dateOfService ? row[mapping.dateOfService]?.trim() : undefined,
    };
  });
}

// ─── VALIDATION RULES ────────────────────────────────────────────

function validateLine(item: ClaimLineItem): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const ln = item.lineNumber;

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
  if (!ICD10_FORMAT.test(code)) {
    issues.push({
      lineNumber: ln, field: "primaryICD10", code: "INVALID_FORMAT",
      severity: "error", rule: "Invalid Code Format",
      message: `"${code}" is not a valid ICD-10 format. Expected: Letter + 2 digits + optional decimal + subcategory (e.g., J06.9).`,
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
        issues.push({
          lineNumber: ln, field: "nappiCode", code: "UNKNOWN_NAPPI",
          severity: "info", rule: "NAPPI Code Not in Database",
          message: `NAPPI code "${item.nappiCode}" was not found in our reference database. It may still be valid.`,
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
      severity: "warning", rule: "Invalid Claim Amount",
      message: `Claim amount is R${item.amount.toFixed(2)} — zero or negative amounts will be rejected.`,
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

  return issues;
}

// ─── CROSS-LINE VALIDATION ───────────────────────────────────────

function validateCrossLine(lines: ClaimLineItem[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Detect duplicate claims (same patient + same code + same date)
  const seen = new Map<string, number>();
  for (const line of lines) {
    const key = `${line.patientName || ""}|${line.primaryICD10}|${line.dateOfService || ""}`;
    if (key && seen.has(key)) {
      issues.push({
        lineNumber: line.lineNumber, field: "primaryICD10", code: "DUPLICATE_CLAIM",
        severity: "error", rule: "Duplicate Claim",
        message: `Potential duplicate: same patient, diagnosis "${line.primaryICD10}", and date of service as line ${seen.get(key)}.`,
        suggestion: "Review for possible duplicate billing. Remove if this is the same service.",
      });
    } else {
      seen.set(key, line.lineNumber);
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
