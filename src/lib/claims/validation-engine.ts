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
import { lookupTariff } from "./tariff-database";
import { getSchemeRate, getMarketAverageRate } from "./scheme-tariff-rates";
import { parseSAID } from "../sa-id";

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
  patientDob: ["dob", "date_of_birth", "dateofbirth", "patient_dob", "birth_date", "birthdate", "patient_date_of_birth"],
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
      patientDob: mapping.patientDob ? row[mapping.patientDob]?.trim() : undefined,
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

// ─── CONSULTATION + PROCEDURE SAME-DAY BUNDLING (TAR-006) ───────
// When a procedure is billed on the same day as a consultation by the same
// provider, SA schemes bundle the consultation into the procedure fee.
// These consultation tariffs are absorbed by the procedure and should NOT
// be billed separately on the same day.
const CONSULT_TARIFF_PREFIXES = ["0190", "0191", "0192", "0193", "0141", "0142"];
const PROCEDURE_TARIFF_RANGES: { min: number; max: number; label: string }[] = [
  { min: 400, max: 499, label: "Minor surgery" },
  { min: 500, max: 599, label: "Intermediate surgery" },
  { min: 600, max: 699, label: "Major surgery" },
  { min: 700, max: 799, label: "Complex surgery" },
  { min: 4500, max: 4599, label: "Pathology procedure" },
  { min: 3700, max: 3799, label: "Radiology procedure" },
];

// ─── SURGICAL GLOBAL PERIOD CODES (TAR-009) ─────────────────────
// Post-operative follow-ups within the global period are included
// in the surgical fee and should not be billed separately.
const SURGICAL_GLOBAL_PERIODS: { tariffPrefix: string; days: number; label: string }[] = [
  { tariffPrefix: "04", days: 14, label: "Minor surgery (14-day global)" },
  { tariffPrefix: "05", days: 42, label: "Intermediate surgery (42-day global)" },
  { tariffPrefix: "06", days: 90, label: "Major surgery (90-day global)" },
  { tariffPrefix: "07", days: 90, label: "Complex surgery (90-day global)" },
];

// ─── PATHOLOGY UNBUNDLING COMPONENTS (TAR-010) ──────────────────
// FBC (Full Blood Count) components that should be billed as the
// comprehensive code 4440, not individual components.
const PATHOLOGY_UNBUNDLING: { comprehensive: string; components: string[]; label: string }[] = [
  { comprehensive: "4440", components: ["4441", "4442", "4443", "4444", "4445", "4446", "4447"], label: "FBC — Full Blood Count" },
  { comprehensive: "4358", components: ["4361", "4362", "4363", "4364", "4365"], label: "U&E — Urea and Electrolytes" },
  { comprehensive: "4370", components: ["4371", "4372", "4373", "4374", "4375", "4376"], label: "LFT — Liver Function Tests" },
  { comprehensive: "4380", components: ["4381", "4382", "4383", "4384"], label: "Lipogram — Lipid Profile" },
];

// ─── DAGGER-ASTERISK PAIRING TABLE (ICD-018/019) ────────────────
// WHO ICD-10 requires that dagger (†) codes (etiology) are paired with
// their correct asterisk (*) codes (manifestation). The dagger MUST
// be primary; the asterisk MUST be secondary.
const DAGGER_ASTERISK_PAIRS: { dagger: string; asterisk: string; description: string }[] = [
  { dagger: "A17.0", asterisk: "G01", description: "TB meningitis" },
  { dagger: "A18.0", asterisk: "M01.1", description: "TB of bones/joints" },
  { dagger: "A39.0", asterisk: "G01", description: "Meningococcal meningitis" },
  { dagger: "A52.1", asterisk: "G01", description: "Syphilitic meningitis" },
  { dagger: "B00.4", asterisk: "G05.1", description: "Herpes simplex encephalitis" },
  { dagger: "B20", asterisk: "B22", description: "HIV disease resulting in other conditions" },
  { dagger: "E10.2", asterisk: "N08.3", description: "Type 1 DM with renal complications" },
  { dagger: "E10.3", asterisk: "H36.0", description: "Type 1 DM with ophthalmic complications" },
  { dagger: "E10.4", asterisk: "G63.2", description: "Type 1 DM with neurological complications" },
  { dagger: "E11.2", asterisk: "N08.3", description: "Type 2 DM with renal complications" },
  { dagger: "E11.3", asterisk: "H36.0", description: "Type 2 DM with ophthalmic complications" },
  { dagger: "E11.4", asterisk: "G63.2", description: "Type 2 DM with neurological complications" },
  { dagger: "G30.9", asterisk: "F00.9", description: "Alzheimer disease with dementia" },
  { dagger: "I25.1", asterisk: "I51.6", description: "Atherosclerotic heart disease" },
  { dagger: "M05.0", asterisk: "L99.0", description: "Rheumatoid vasculitis" },
];

// ─── BLANKET EXCLUSIONS (FIN-016) ────────────────────────────────
// ICD-10 codes / tariff codes that are universally excluded by SA medical
// schemes. Cosmetic, experimental, and lifestyle procedures are not covered.
const BLANKET_EXCLUSION_ICD10: { prefix: string; reason: string }[] = [
  { prefix: "Z41.1", reason: "Cosmetic surgery — not covered by any SA medical scheme" },
  { prefix: "Z41.0", reason: "Hair transplant — cosmetic, not medically indicated" },
  { prefix: "L91.8", reason: "Cosmetic skin procedure — excluded unless medically indicated (e.g., post-burn reconstruction)" },
  { prefix: "Z53", reason: "Procedure not carried out — cannot claim for services not rendered" },
  { prefix: "Z76.5", reason: "Malingerer — not a valid clinical diagnosis for claiming" },
  { prefix: "Z72.0", reason: "Tobacco use — lifestyle, not a covered condition (cessation programs may differ)" },
];
const BLANKET_EXCLUSION_TARIFFS: { code: string; reason: string }[] = [
  { code: "0850", reason: "Cosmetic procedure — excluded across all SA schemes" },
  { code: "0851", reason: "Cosmetic procedure — excluded across all SA schemes" },
  { code: "0852", reason: "Cosmetic rhinoplasty — excluded unless post-trauma reconstruction" },
  { code: "0853", reason: "Cosmetic blepharoplasty — excluded unless functional impairment documented" },
  { code: "0860", reason: "Laser skin resurfacing (cosmetic) — excluded" },
  { code: "0861", reason: "Botox (cosmetic) — excluded unless for spasticity/dystonia" },
  { code: "0870", reason: "Liposuction — excluded across all SA schemes" },
  { code: "0871", reason: "Abdominoplasty (cosmetic) — excluded unless post-bariatric" },
];

// ─── BILATERAL CONDITION CODES (ICD-020) ────────────────────────
// Conditions that commonly affect one or both sides — schemes require
// laterality specification via modifier to prevent duplicate claims.
const BILATERAL_CONDITION_PREFIXES: { prefix: string; description: string }[] = [
  { prefix: "H25", description: "Senile cataract" },
  { prefix: "H26", description: "Other cataract" },
  { prefix: "H40", description: "Glaucoma" },
  { prefix: "H65", description: "Nonsuppurative otitis media" },
  { prefix: "H66", description: "Suppurative otitis media" },
  { prefix: "H90", description: "Conductive/sensorineural hearing loss" },
  { prefix: "M16", description: "Coxarthrosis (hip OA)" },
  { prefix: "M17", description: "Gonarthrosis (knee OA)" },
  { prefix: "M75", description: "Shoulder lesions" },
  { prefix: "S52", description: "Fracture of forearm" },
  { prefix: "S62", description: "Fracture of wrist/hand" },
  { prefix: "S82", description: "Fracture of lower leg" },
  { prefix: "S92", description: "Fracture of foot" },
  { prefix: "G56", description: "Carpal tunnel / mononeuropathy upper limb" },
  { prefix: "M20", description: "Acquired deformities of fingers/toes (bunion)" },
  { prefix: "N60", description: "Benign mammary dysplasia" },
];

// ─── VALIDATION RULES ────────────────────────────────────────────

function validateLine(item: ClaimLineItem): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const ln = item.lineNumber;

  // ── Rule MBR-009: Missing date of birth ──
  // PHISC MEDCLM: DTM+329 (patient DOB) is mandatory for member verification.
  // Without DOB, the switch cannot match the patient to scheme records.
  if (item.patientDob !== undefined && !item.patientDob?.trim()) {
    issues.push({
      lineNumber: ln, field: "patientDob", code: "MISSING_DOB",
      severity: "error", rule: "Missing Date of Birth",
      message: "No patient date of birth provided. SA switching houses (Healthbridge, MediKredit, SwitchOn) require DOB for member verification — claims without DOB are auto-rejected at the switch level.",
      suggestion: "Add the patient's date of birth in YYYY-MM-DD format. This is used for member matching, age validation, and dependent verification.",
    });
  }

  // ── Rule MBR-014: Dependent age limit exceeded ──
  // SA schemes: children dependents are covered until age 21 (most schemes)
  // or 25/26 if full-time student. Dependent code 02+ with age >21 = flag.
  if (item.dependentCode && item.patientAge !== undefined) {
    const depCode = parseInt(item.dependentCode, 10);
    if (depCode >= 2 && !isNaN(depCode)) {
      // Dependent codes 02+ are typically children
      if (item.patientAge > 26) {
        issues.push({
          lineNumber: ln, field: "dependentCode", code: "DEPENDENT_AGE_EXCEEDED",
          severity: "error", rule: "Dependent Age Limit Exceeded",
          message: `Dependent code ${item.dependentCode} (child) with patient age ${item.patientAge}. SA schemes terminate child dependent cover at age 21 (or 25-26 for full-time students). This claim will be rejected.`,
          suggestion: "Verify dependent status. If the patient is over 21, they must be registered as a main member or adult dependent. If a full-time student (21-26), add proof of enrollment in the motivation.",
        });
      } else if (item.patientAge > 21) {
        issues.push({
          lineNumber: ln, field: "dependentCode", code: "DEPENDENT_AGE_WARNING",
          severity: "warning", rule: "Dependent Age Near Limit",
          message: `Dependent code ${item.dependentCode} (child) with patient age ${item.patientAge}. Most SA schemes cap child dependents at 21 unless a full-time student (up to 25-26).`,
          suggestion: "If the dependent is a full-time student, ensure proof of enrollment is on file with the scheme. Otherwise, register as an adult dependent.",
        });
      }
    }
  }

  // ── Rule DTE-006: Service date before membership start ──
  // STUB: Requires MediSwitch eligibility response (member_start_date).
  // When MediSwitch integration is live, this will compare item.dateOfService
  // against the member's coverage start date from the eligibility check.
  // if (item.dateOfService && memberEligibility?.startDate) {
  //   if (new Date(item.dateOfService) < new Date(memberEligibility.startDate)) → error
  // }

  // ── Rule DTE-010: Resubmission window exceeded (60 days from rejection) ──
  // STUB: Requires rejection tracking (original_rejection_date on resubmissions).
  // When claims tracking DB is live, this will check if a resubmission is within
  // 60 days of the original rejection date per Medical Schemes Act.
  // if (item.isResubmission && item.originalRejectionDate) {
  //   if (daysSince(item.originalRejectionDate) > 60) → error
  // }

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

  // ── Rule MBR-010: SA ID Luhn check validation ──
  // When membership number looks like a 13-digit SA ID, validate via Luhn checksum
  // and cross-check DOB/gender against claim data.
  if (item.membershipNumber?.trim()) {
    const mnTrimmed = item.membershipNumber.trim();
    if (/^\d{13}$/.test(mnTrimmed)) {
      const said = parseSAID(mnTrimmed);
      if (!said.valid) {
        issues.push({
          lineNumber: ln, field: "membershipNumber", code: "INVALID_SA_ID",
          severity: "error", rule: "SA ID Luhn Check Failed",
          message: `Membership number "${mnTrimmed}" appears to be a 13-digit SA ID but fails the Luhn checksum validation. ${said.error || "Invalid check digit."}`,
          suggestion: "Verify the SA ID number. A single transposed or incorrect digit causes Luhn failure. Re-enter from the patient's ID document.",
        });
      } else {
        // Cross-check gender if available
        if (said.gender && item.patientGender && item.patientGender !== "U") {
          const saidGender = said.gender === "male" ? "M" : "F";
          if (saidGender !== item.patientGender) {
            issues.push({
              lineNumber: ln, field: "membershipNumber", code: "SA_ID_GENDER_MISMATCH",
              severity: "error", rule: "SA ID Gender Mismatch",
              message: `SA ID "${mnTrimmed}" indicates ${said.gender} but claim gender is ${item.patientGender === "M" ? "male" : "female"}. Schemes cross-check this — mismatch causes rejection.`,
              suggestion: "Verify the patient's gender matches their SA ID number. Either the ID or the gender field is incorrect.",
            });
          }
        }
        // Cross-check age if available
        if (said.age !== undefined && item.patientAge !== undefined) {
          const ageDiff = Math.abs(said.age - item.patientAge);
          if (ageDiff > 2) {
            issues.push({
              lineNumber: ln, field: "membershipNumber", code: "SA_ID_AGE_MISMATCH",
              severity: "warning", rule: "SA ID Age Mismatch",
              message: `SA ID "${mnTrimmed}" indicates age ${said.age} but claim has patient age ${item.patientAge} (difference: ${ageDiff} years).`,
              suggestion: "Verify the patient's date of birth. Significant age discrepancies may cause rejection.",
            });
          }
        }
      }
    }
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

  // ── Rule ICD-018: Dagger code must have matching asterisk secondary ──
  // WHO ICD-10 dual-coding: dagger (†) etiology codes MUST be paired with
  // their corresponding asterisk (*) manifestation code as secondary.
  const isDagger = entry?.isDagger || mitEntry?.isDagger;
  if (isDagger && item.secondaryICD10) {
    const daggerPairings = DAGGER_ASTERISK_PAIRS.filter(p => code.startsWith(p.dagger));
    if (daggerPairings.length > 0) {
      const hasMatchingAsterisk = daggerPairings.some(p =>
        item.secondaryICD10!.some(sec => sec.startsWith(p.asterisk))
      );
      if (!hasMatchingAsterisk) {
        const expectedAsterisks = daggerPairings.map(p => `${p.asterisk} (${p.description})`).join(", ");
        issues.push({
          lineNumber: ln, field: "secondaryICD10", code: "DAGGER_MISSING_ASTERISK",
          severity: "warning", rule: "Dagger Code Missing Asterisk Pair",
          message: `"${code}" is a dagger (†) code requiring a matching asterisk (*) manifestation code as secondary. Expected: ${expectedAsterisks}.`,
          suggestion: "Add the corresponding asterisk code as a secondary diagnosis. WHO ICD-10 dual-coding rules require dagger+asterisk pairing for accurate clinical description.",
        });
      }
    }
  }

  // ── Rule ICD-019: Asterisk code must have matching dagger primary ──
  // When an asterisk code appears in secondary position, verify the primary
  // is the correct dagger code per WHO pairing rules.
  if (isAsterisk && item.secondaryICD10) {
    // Check if the secondary asterisk codes have matching daggers as primary
    for (const secCode of item.secondaryICD10) {
      const secMit = lookupMIT(secCode);
      if (secMit?.isAsterisk) {
        const expectedPairings = DAGGER_ASTERISK_PAIRS.filter(p => secCode.startsWith(p.asterisk));
        if (expectedPairings.length > 0) {
          const primaryMatchesDagger = expectedPairings.some(p => code.startsWith(p.dagger));
          if (!primaryMatchesDagger) {
            issues.push({
              lineNumber: ln, field: "primaryICD10", code: "ASTERISK_DAGGER_MISMATCH",
              severity: "warning", rule: "Asterisk-Dagger Pairing Mismatch",
              message: `Secondary asterisk code "${secCode}" expects primary dagger code(s): ${expectedPairings.map(p => p.dagger).join(", ")}. Current primary "${code}" does not match.`,
              suggestion: "Update the primary diagnosis to the correct etiology (dagger) code, or remove the mismatched asterisk secondary code.",
            });
          }
        }
      }
    }
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

  // ── Rule ICD-017: Morphology code missing for neoplasm ──
  // C00-D48 neoplasm codes should have a morphology code (M8xxx-M9xxx) as
  // secondary when the claim includes surgery or pathology, because the
  // morphology determines the histological type and guides treatment.
  if (/^[CD][0-4]\d/i.test(code)) {
    const hasMorphology = item.secondaryICD10?.some(sec => /^M[89]\d{3}/i.test(sec));
    // Only flag when surgery (04xx-07xx) or pathology (44xx-46xx) is billed
    if (!hasMorphology && item.tariffCode) {
      const tariffNum = parseInt(item.tariffCode, 10);
      const isSurgeryOrPath = (tariffNum >= 400 && tariffNum <= 799) || (tariffNum >= 4400 && tariffNum <= 4699);
      if (isSurgeryOrPath) {
        issues.push({
          lineNumber: ln, field: "secondaryICD10", code: "NEOPLASM_MISSING_MORPHOLOGY",
          severity: "warning", rule: "Neoplasm Missing Morphology Code",
          message: `Neoplasm code "${code}" billed with surgical/pathology tariff "${item.tariffCode}" but no morphology code (M8xxx-M9xxx) in secondary diagnoses. Schemes may query this for clinical completeness.`,
          suggestion: "Add the morphology code from the histology report (e.g., M8140/3 for adenocarcinoma). This improves clinical accuracy and reduces query risk.",
        });
      }
    }
  }

  // ── Rule ICD-020: Laterality not specified for bilateral conditions ──
  // Conditions affecting paired organs (eyes, ears, hips, knees) require
  // a laterality modifier to prevent duplicate claims for the same side.
  if (item.primaryICD10) {
    const bilateralMatch = BILATERAL_CONDITION_PREFIXES.find(b => code.startsWith(b.prefix));
    if (bilateralMatch) {
      const modifiers = (item.modifier || "").toLowerCase();
      const hasLaterality = modifiers.includes("0007") || modifiers.includes("0008") || // SA left/right modifiers
        modifiers.includes("left") || modifiers.includes("right") ||
        modifiers.includes("bilateral") || modifiers.includes("0009");
      if (!hasLaterality) {
        issues.push({
          lineNumber: ln, field: "modifier", code: "MISSING_LATERALITY",
          severity: "info", rule: "Laterality Not Specified",
          message: `"${code}" (${bilateralMatch.description}) affects a paired structure but no laterality modifier found. SA schemes use this to detect duplicate claims for the same side.`,
          suggestion: "Add laterality modifier: 0007 (left), 0008 (right), or 0009 (bilateral). This prevents rejection when the same procedure is claimed for the opposite side later.",
        });
      }
    }
  }

  // ── Rule ICD-021: Excessive diagnosis codes per line ──
  // PHISC MEDCLM allows up to 8 diagnosis codes per claim line. More than 8
  // suggests data quality issues or copy-paste from clinical notes.
  if (item.secondaryICD10 && item.secondaryICD10.length > 8) {
    issues.push({
      lineNumber: ln, field: "secondaryICD10", code: "EXCESSIVE_DIAGNOSIS_CODES",
      severity: "warning", rule: "Excessive Diagnosis Codes Per Line",
      message: `${item.secondaryICD10.length + 1} diagnosis codes on this line (1 primary + ${item.secondaryICD10.length} secondary). PHISC MEDCLM supports a maximum of 8 per line — excess codes are truncated by the switching house.`,
      suggestion: "Reduce to the most clinically relevant codes. The primary diagnosis should be the main reason for the visit. Secondary codes should be comorbidities directly relevant to the service rendered.",
    });
  }

  // ── Rule FIN-016: Service not covered — blanket exclusions ──
  // Check against universally excluded ICD-10 codes (cosmetic, lifestyle, etc.)
  for (const excl of BLANKET_EXCLUSION_ICD10) {
    if (code.startsWith(excl.prefix)) {
      issues.push({
        lineNumber: ln, field: "primaryICD10", code: "SERVICE_NOT_COVERED",
        severity: "error", rule: "Service Not Covered — Blanket Exclusion",
        message: `"${code}" — ${excl.reason}. This diagnosis code is excluded across all SA medical scheme plans.`,
        suggestion: "If this service has a medical indication (e.g., reconstructive surgery post-trauma), use the medically indicated ICD-10 code instead and attach clinical motivation.",
      });
    }
  }
  // Check against universally excluded tariff codes
  if (item.tariffCode) {
    const tariffExcl = BLANKET_EXCLUSION_TARIFFS.find(e => e.code === item.tariffCode);
    if (tariffExcl) {
      issues.push({
        lineNumber: ln, field: "tariffCode", code: "TARIFF_NOT_COVERED",
        severity: "error", rule: "Tariff Not Covered — Blanket Exclusion",
        message: `Tariff "${item.tariffCode}" — ${tariffExcl.reason}. This procedure is excluded across all SA medical scheme plans.`,
        suggestion: "If this procedure has a functional/medical indication, use the medically indicated tariff code and attach clinical motivation documenting medical necessity.",
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
    const isSpecialistTariff = (tariffNum >= 141 && tariffNum <= 189) || (tariffNum >= 200 && tariffNum <= 299);
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

  // ── Rule TAR-006: Consultation + procedure same-day bundling ──
  // SA schemes bundle consultations into procedure fees when both are billed
  // on the same day by the same provider. The consultation is absorbed.
  const linesByProviderPatientDate = new Map<string, ClaimLineItem[]>();
  for (const line of lines) {
    if (!line.tariffCode) continue;
    const key = `${(line.practiceNumber || "UNK")}|${(line.patientName || "").toLowerCase()}|${line.dateOfService || ""}`;
    const existing = linesByProviderPatientDate.get(key) || [];
    existing.push(line);
    linesByProviderPatientDate.set(key, existing);
  }
  for (const [, group] of linesByProviderPatientDate) {
    if (group.length < 2) continue;
    const consultLines = group.filter(l =>
      l.tariffCode && CONSULT_TARIFF_PREFIXES.includes(l.tariffCode)
    );
    const procedureLines = group.filter(l => {
      if (!l.tariffCode) return false;
      const num = parseInt(l.tariffCode, 10);
      return PROCEDURE_TARIFF_RANGES.some(r => num >= r.min && num <= r.max);
    });
    if (consultLines.length > 0 && procedureLines.length > 0) {
      const procedureLabel = procedureLines.map(p => p.tariffCode).join(", ");
      for (const cl of consultLines) {
        issues.push({
          lineNumber: cl.lineNumber, field: "tariffCode", code: "CONSULT_PROCEDURE_BUNDLING",
          severity: "error", rule: "Consultation + Procedure Same-Day Bundling",
          message: `Consultation tariff "${cl.tariffCode}" billed on the same day as procedure tariff(s) ${procedureLabel} for the same patient/provider. SA schemes bundle the consultation fee into the procedure — billing both will be rejected.`,
          suggestion: "Remove the consultation line. The procedure fee includes the consultation component. If a separate consultation was genuinely warranted (different condition), add clinical motivation.",
        });
      }
    }
  }

  // ── Rule TAR-009: Surgical global period — follow-up within global period ──
  // Post-operative follow-ups billed within the global period are included
  // in the surgical fee. Detect consult lines that fall within the global
  // window of a prior surgical line for the same patient.
  const surgicalLinesByPatient = new Map<string, { tariff: string; date: Date; globalDays: number; lineNumber: number }[]>();
  for (const line of lines) {
    if (!line.tariffCode || !line.dateOfService) continue;
    const d = new Date(line.dateOfService);
    if (isNaN(d.getTime())) continue;
    for (const gp of SURGICAL_GLOBAL_PERIODS) {
      if (line.tariffCode.startsWith(gp.tariffPrefix)) {
        const patKey = (line.patientName || "").toLowerCase();
        const existing = surgicalLinesByPatient.get(patKey) || [];
        existing.push({ tariff: line.tariffCode, date: d, globalDays: gp.days, lineNumber: line.lineNumber });
        surgicalLinesByPatient.set(patKey, existing);
      }
    }
  }
  for (const line of lines) {
    if (!line.tariffCode || !line.dateOfService) continue;
    const isConsult = line.tariffCode.startsWith("01") || line.tariffCode.startsWith("02");
    if (!isConsult) continue;
    const lineDate = new Date(line.dateOfService);
    if (isNaN(lineDate.getTime())) continue;
    const patKey = (line.patientName || "").toLowerCase();
    const surgicals = surgicalLinesByPatient.get(patKey);
    if (!surgicals) continue;
    for (const surg of surgicals) {
      if (surg.lineNumber === line.lineNumber) continue;
      const daysSinceSurgery = Math.floor((lineDate.getTime() - surg.date.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceSurgery > 0 && daysSinceSurgery <= surg.globalDays) {
        issues.push({
          lineNumber: line.lineNumber, field: "tariffCode", code: "SURGICAL_GLOBAL_PERIOD",
          severity: "error", rule: "Follow-Up Within Surgical Global Period",
          message: `Consultation "${line.tariffCode}" billed ${daysSinceSurgery} days after surgery "${surg.tariff}" (line ${surg.lineNumber}). This falls within the ${surg.globalDays}-day global period — follow-up is included in the surgical fee.`,
          suggestion: `Post-operative follow-ups within ${surg.globalDays} days are included in the surgical tariff. Remove this consultation or, if the visit is for an unrelated condition, add a different ICD-10 code and clinical motivation.`,
        });
        break; // One flag per line is enough
      }
    }
  }

  // ── Rule TAR-010: Pathology unbundling — component codes billed separately ──
  // When individual component codes from a panel (e.g., FBC, U&E, LFT, Lipogram)
  // are billed separately instead of the comprehensive code, flag as unbundling.
  for (const [, group] of linesByProviderPatientDate) {
    if (group.length < 2) continue;
    const tariffCodes = group.map(l => l.tariffCode).filter(Boolean) as string[];
    for (const panel of PATHOLOGY_UNBUNDLING) {
      const matchedComponents = panel.components.filter(c => tariffCodes.includes(c));
      if (matchedComponents.length >= 2) {
        // Multiple components billed separately — should be comprehensive code
        const hasComprehensive = tariffCodes.includes(panel.comprehensive);
        if (!hasComprehensive) {
          for (const line of group) {
            if (line.tariffCode && matchedComponents.includes(line.tariffCode)) {
              issues.push({
                lineNumber: line.lineNumber, field: "tariffCode", code: "PATHOLOGY_UNBUNDLING",
                severity: "error", rule: "Pathology Panel Unbundling",
                message: `Component tariff "${line.tariffCode}" billed separately — ${matchedComponents.length} components of ${panel.label} (comprehensive code ${panel.comprehensive}) found in this batch. Schemes require the comprehensive code when ≥2 components are ordered.`,
                suggestion: `Bill the comprehensive code ${panel.comprehensive} (${panel.label}) instead of individual component codes. Unbundling pathology panels is a top-10 rejection reason.`,
              });
            }
          }
        }
      }
    }
  }

  // ── Rule FRD-007: Time impossibility — >16 hrs of services per provider/day ──
  // Estimate service time from tariff codes and flag when total exceeds 16 hours.
  const serviceMinutesByProviderDay = new Map<string, { totalMinutes: number; lineNumbers: number[] }>();
  for (const line of lines) {
    if (!line.practiceNumber || !line.dateOfService || !line.tariffCode) continue;
    const key = `${line.practiceNumber}|${line.dateOfService}`;
    const entry = serviceMinutesByProviderDay.get(key) || { totalMinutes: 0, lineNumbers: [] };
    // Estimate service minutes per tariff type
    let minutes = 15; // Default: 15 min per service
    const tariffNum = parseInt(line.tariffCode, 10);
    if (line.tariffCode === "0190") minutes = 15;
    else if (line.tariffCode === "0191") minutes = 30;
    else if (line.tariffCode === "0192") minutes = 45;
    else if (line.tariffCode === "0193") minutes = 60;
    else if (line.tariffCode === "0141" || line.tariffCode === "0142") minutes = 30;
    else if (tariffNum >= 400 && tariffNum <= 799) minutes = 45; // Surgery
    else if (tariffNum >= 3700 && tariffNum <= 3799) minutes = 20; // Radiology
    else if (tariffNum >= 4400 && tariffNum <= 4599) minutes = 10; // Pathology
    entry.totalMinutes += minutes * (line.quantity || 1);
    entry.lineNumbers.push(line.lineNumber);
    serviceMinutesByProviderDay.set(key, entry);
  }
  for (const [key, entry] of serviceMinutesByProviderDay) {
    const totalHours = entry.totalMinutes / 60;
    if (totalHours > 16) {
      const [practiceNum, dateStr] = key.split("|");
      for (const ln of entry.lineNumbers) {
        issues.push({
          lineNumber: ln, field: "practiceNumber", code: "TIME_IMPOSSIBILITY_HOURS",
          severity: "error", rule: "Time Impossibility — Exceeds 16 Hours",
          message: `Practice ${practiceNum} has ~${totalHours.toFixed(1)} hours of estimated service time on ${dateStr} (${entry.lineNumbers.length} claims). More than 16 hours of services in a single day is physically impossible.`,
          suggestion: "Review this provider's billing for the day. This volume indicates batch duplication, date errors, or fraudulent billing. CMS may refer for investigation.",
        });
      }
    }
  }

  // ── Rule FRD-008: Excessive unique patient volume — >50 unique patients/day for GP ──
  const uniquePatientsByProviderDay = new Map<string, { patients: Set<string>; lineNumbers: number[] }>();
  for (const line of lines) {
    if (!line.practiceNumber || !line.dateOfService) continue;
    const key = `${line.practiceNumber}|${line.dateOfService}`;
    const entry = uniquePatientsByProviderDay.get(key) || { patients: new Set(), lineNumbers: [] };
    entry.patients.add((line.patientName || `anon_${line.lineNumber}`).toLowerCase());
    entry.lineNumbers.push(line.lineNumber);
    uniquePatientsByProviderDay.set(key, entry);
  }
  for (const [key, entry] of uniquePatientsByProviderDay) {
    const patientCount = entry.patients.size;
    if (patientCount > 50) {
      const [practiceNum, dateStr] = key.split("|");
      // Only flag on the first line to reduce noise
      issues.push({
        lineNumber: entry.lineNumbers[0], field: "practiceNumber", code: "EXCESSIVE_PATIENT_VOLUME",
        severity: "error", rule: "Excessive Patient Volume — >50 Unique Patients/Day",
        message: `Practice ${practiceNum} billed for ${patientCount} unique patients on ${dateStr}. A GP seeing >50 patients/day exceeds HPCSA reasonable capacity guidelines and is a fraud red flag.`,
        suggestion: "Review this provider's billing pattern. The CMS fraud detection algorithm flags providers exceeding 50 unique patients/day. If legitimate (e.g., vaccination drive), attach motivation.",
      });
    } else if (patientCount > 35) {
      const [practiceNum, dateStr] = key.split("|");
      issues.push({
        lineNumber: entry.lineNumbers[0], field: "practiceNumber", code: "HIGH_PATIENT_VOLUME",
        severity: "warning", rule: "High Patient Volume — >35 Unique Patients/Day",
        message: `Practice ${practiceNum} billed for ${patientCount} unique patients on ${dateStr}. This is above average GP capacity (25-30/day) and may trigger scheme audit.`,
        suggestion: "Consider whether this volume is sustainable and clinically appropriate. High-volume billing patterns are flagged in scheme audits.",
      });
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

  // ── FRD-002: Fuzzy duplicate — same member + procedure, different provider or ±3 days ──
  const fuzzyDupMap = new Map<string, { lineNumber: number; provider: string; date: string; amount: number }[]>();
  for (const line of lines) {
    if (!line.patientName || !line.tariffCode || !line.dateOfService) continue;
    const key = `${line.patientName.toLowerCase()}|${line.tariffCode}`;
    const existing = fuzzyDupMap.get(key) || [];
    existing.push({
      lineNumber: line.lineNumber,
      provider: line.practiceNumber || "UNK",
      date: line.dateOfService,
      amount: line.amount || 0,
    });
    fuzzyDupMap.set(key, existing);
  }
  for (const [key, entries] of fuzzyDupMap) {
    if (entries.length < 2) continue;
    for (let i = 1; i < entries.length; i++) {
      const a = entries[0];
      const b = entries[i];
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) continue;
      const daysDiff = Math.abs(Math.floor((dateB.getTime() - dateA.getTime()) / (1000 * 60 * 60 * 24)));
      const diffProvider = a.provider !== b.provider;
      // Flag if: different provider same day, OR same/diff provider within 3 days (but not exact dup — already caught)
      if ((diffProvider && daysDiff === 0) || (daysDiff > 0 && daysDiff <= 3)) {
        const [patient, tariff] = key.split("|");
        issues.push({
          lineNumber: b.lineNumber, field: "tariffCode", code: "FUZZY_DUPLICATE",
          severity: "warning", rule: "Fuzzy Duplicate — Near-Match Claim",
          message: `Patient "${patient}" has tariff "${tariff}" on line ${a.lineNumber} (${a.date}, provider ${a.provider}) and line ${b.lineNumber} (${b.date}, provider ${b.provider}). ${diffProvider ? "Different provider, " : ""}${daysDiff} day(s) apart — possible duplicate or doctor shopping.`,
          suggestion: "Verify this is not a duplicate submission to different providers. Schemes cross-reference claims across providers and will reject the second claim.",
        });
      }
    }
  }

  // ── FRD-003: Phantom billing — deceased patient pattern ──
  // Without DHA cross-ref, flag claims where the same patient has services spanning
  // an implausibly long period (>365 days) with a gap then sudden resumption, or
  // where date of service is in the future
  const patientDateRange = new Map<string, { earliest: Date; latest: Date; lineNumbers: number[] }>();
  for (const line of lines) {
    if (!line.patientName || !line.dateOfService) continue;
    const d = new Date(line.dateOfService);
    if (isNaN(d.getTime())) continue;
    const patKey = line.patientName.toLowerCase();
    const entry = patientDateRange.get(patKey) || { earliest: d, latest: d, lineNumbers: [] };
    if (d < entry.earliest) entry.earliest = d;
    if (d > entry.latest) entry.latest = d;
    entry.lineNumbers.push(line.lineNumber);
    patientDateRange.set(patKey, entry);
  }
  const now = new Date();
  for (const line of lines) {
    if (!line.dateOfService) continue;
    const d = new Date(line.dateOfService);
    if (isNaN(d.getTime())) continue;
    if (d > now) {
      issues.push({
        lineNumber: line.lineNumber, field: "dateOfService", code: "FUTURE_DATE_SERVICE",
        severity: "error", rule: "Phantom Billing — Future Date of Service",
        message: `Date of service ${line.dateOfService} is in the future. This is a phantom billing indicator.`,
        suggestion: "Correct the date of service. Future-dated claims are automatically rejected and may trigger fraud investigation.",
      });
    }
  }

  // ── FRD-004: Weekend billing without after-hours modifier ──
  for (const line of lines) {
    if (!line.dateOfService || !line.tariffCode) continue;
    const d = new Date(line.dateOfService);
    if (isNaN(d.getTime())) continue;
    const dayOfWeek = d.getDay(); // 0=Sunday, 6=Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    if (!isWeekend) continue;
    const isConsult = line.tariffCode.startsWith("01") || line.tariffCode.startsWith("02");
    if (!isConsult) continue;
    // Check for after-hours modifier
    const hasAfterHoursModifier = line.modifier && ["0010", "0011", "0012", "0013", "0014"].includes(line.modifier);
    if (!hasAfterHoursModifier) {
      issues.push({
        lineNumber: line.lineNumber, field: "modifier", code: "WEEKEND_NO_AFTER_HOURS",
        severity: "warning", rule: "Weekend Billing Without After-Hours Modifier",
        message: `Consultation "${line.tariffCode}" on ${line.dateOfService} (${dayOfWeek === 0 ? "Sunday" : "Saturday"}) without after-hours modifier. Weekend consultations should carry modifier 0010-0014 unless the practice is registered for weekend hours.`,
        suggestion: "Add the appropriate after-hours modifier, or if the practice operates regular weekend hours, document this. Schemes may reject weekend claims without modifiers.",
      });
    }
  }

  // ── FRD-005: Geographic impossibility — same patient, 2 providers in different locations same day ──
  // Without geocoding, detect same patient seen by multiple different providers on the same day
  const patientProvidersByDay = new Map<string, { providers: Set<string>; lineNumbers: number[] }>();
  for (const line of lines) {
    if (!line.patientName || !line.dateOfService || !line.practiceNumber) continue;
    const key = `${line.patientName.toLowerCase()}|${line.dateOfService}`;
    const entry = patientProvidersByDay.get(key) || { providers: new Set(), lineNumbers: [] };
    entry.providers.add(line.practiceNumber);
    entry.lineNumbers.push(line.lineNumber);
    patientProvidersByDay.set(key, entry);
  }
  for (const [key, entry] of patientProvidersByDay) {
    if (entry.providers.size >= 3) {
      const [patient, date] = key.split("|");
      issues.push({
        lineNumber: entry.lineNumbers[0], field: "practiceNumber", code: "GEOGRAPHIC_IMPOSSIBILITY",
        severity: "error", rule: "Geographic Impossibility — Multiple Providers Same Day",
        message: `Patient "${patient}" was seen by ${entry.providers.size} different providers on ${date}: ${[...entry.providers].join(", ")}. Visiting 3+ providers in a single day is a fraud indicator (card lending / identity fraud).`,
        suggestion: "Verify patient identity. This pattern is flagged by CMS fraud detection as potential card lending or phantom billing. Cross-reference with patient address.",
      });
    } else if (entry.providers.size === 2) {
      const [patient, date] = key.split("|");
      issues.push({
        lineNumber: entry.lineNumbers[0], field: "practiceNumber", code: "MULTI_PROVIDER_SAME_DAY",
        severity: "warning", rule: "Multiple Providers Same Day",
        message: `Patient "${patient}" was seen by 2 different providers on ${date}: ${[...entry.providers].join(", ")}. This could be a legitimate referral or a fraud indicator.`,
        suggestion: "If this is a referral, ensure a referral letter is on file. If not, this may indicate card lending or duplicate submissions.",
      });
    }
  }

  // ── FRD-006: Identity fraud — child services on adult card (age-based) ──
  // Paediatric tariffs (prefix 01 with paediatric modifiers, or age-specific codes) on patients aged 18+
  const PAEDIATRIC_TARIFFS = ["0181", "0182", "0183"]; // Paediatric consultation tariffs
  const ADULT_ONLY_TARIFFS = ["0197", "0198"]; // Geriatric/adult-specific
  for (const line of lines) {
    if (!line.tariffCode || line.patientAge === undefined) continue;
    if (line.patientAge >= 18 && PAEDIATRIC_TARIFFS.includes(line.tariffCode)) {
      issues.push({
        lineNumber: line.lineNumber, field: "tariffCode", code: "IDENTITY_FRAUD_CHILD_ON_ADULT",
        severity: "error", rule: "Identity Fraud — Paediatric Service on Adult",
        message: `Paediatric tariff "${line.tariffCode}" billed for a ${line.patientAge}-year-old patient. Paediatric tariffs are for patients under 18.`,
        suggestion: "Verify patient identity and age. This may indicate: (1) wrong dependent code, (2) child's services billed on parent's card with wrong age, or (3) identity fraud.",
      });
    }
    if (line.patientAge < 14 && ADULT_ONLY_TARIFFS.includes(line.tariffCode)) {
      issues.push({
        lineNumber: line.lineNumber, field: "tariffCode", code: "IDENTITY_FRAUD_ADULT_ON_CHILD",
        severity: "error", rule: "Identity Fraud — Adult Service on Child",
        message: `Adult-specific tariff "${line.tariffCode}" billed for a ${line.patientAge}-year-old patient. This tariff is for patients 14+.`,
        suggestion: "Verify patient identity and dependent code. Incorrect dependent codes are a common source of claim rejection.",
      });
    }
  }

  // ── FRD-010: After-hours modifier abuse — >60% of claims with after-hours modifiers ──
  if (lines.length >= 10) {
    const afterHoursModifiers = ["0010", "0011", "0012", "0013", "0014"];
    const claimsWithAfterHours = lines.filter(l => l.modifier && afterHoursModifiers.includes(l.modifier));
    const afterHoursPercent = (claimsWithAfterHours.length / lines.length) * 100;
    if (afterHoursPercent > 60) {
      issues.push({
        lineNumber: lines[0].lineNumber, field: "modifier", code: "AFTER_HOURS_ABUSE",
        severity: "error", rule: "After-Hours Modifier Abuse",
        message: `${afterHoursPercent.toFixed(0)}% of claims (${claimsWithAfterHours.length}/${lines.length}) have after-hours modifiers. Peer average is ~15%. This exceeds the 60% threshold for fraud investigation.`,
        suggestion: "Review practice hours. After-hours modifiers increase reimbursement by 50-100%. Schemes audit providers with >40% after-hours billing. If legitimate, document extended practice hours.",
      });
    } else if (afterHoursPercent > 40) {
      issues.push({
        lineNumber: lines[0].lineNumber, field: "modifier", code: "AFTER_HOURS_HIGH",
        severity: "warning", rule: "High After-Hours Modifier Rate",
        message: `${afterHoursPercent.toFixed(0)}% of claims have after-hours modifiers. Peer average is ~15%. This rate may trigger scheme audit.`,
        suggestion: "Document practice hours and review after-hours billing patterns. Rates above 40% are monitored by scheme fraud units.",
      });
    }
  }

  // ── FRD-011: Benford's Law deviation — first-digit distribution of amounts ──
  // Naturally occurring financial data follows Benford's Law. Fabricated amounts deviate.
  if (lines.length >= 50) {
    const BENFORD_EXPECTED = [0, 0.301, 0.176, 0.125, 0.097, 0.079, 0.067, 0.058, 0.051, 0.046];
    const digitCounts = new Array(10).fill(0);
    let validAmounts = 0;
    for (const line of lines) {
      if (!line.amount || line.amount <= 0) continue;
      // Get first significant digit
      const amountStr = Math.abs(line.amount).toString().replace(/^0+\.?0*/, "");
      const firstDigit = parseInt(amountStr[0], 10);
      if (firstDigit >= 1 && firstDigit <= 9) {
        digitCounts[firstDigit]++;
        validAmounts++;
      }
    }
    if (validAmounts >= 50) {
      // Chi-squared test against Benford distribution
      let chiSquared = 0;
      for (let d = 1; d <= 9; d++) {
        const observed = digitCounts[d] / validAmounts;
        const expected = BENFORD_EXPECTED[d];
        chiSquared += ((observed - expected) ** 2) / expected;
      }
      // Chi-squared threshold: 0.1 indicates significant deviation (df=8)
      // Critical value at p=0.05 with df=8 is 15.507, but we use a simpler threshold
      // for the normalized chi-squared (divided by N to get per-observation deviation)
      if (chiSquared > 0.1) {
        const deviationDetails: string[] = [];
        for (let d = 1; d <= 9; d++) {
          const observed = ((digitCounts[d] / validAmounts) * 100).toFixed(1);
          const expected = (BENFORD_EXPECTED[d] * 100).toFixed(1);
          deviationDetails.push(`${d}: ${observed}% (expected ${expected}%)`);
        }
        issues.push({
          lineNumber: lines[0].lineNumber, field: "amount", code: "BENFORD_LAW_DEVIATION",
          severity: chiSquared > 0.3 ? "error" : "warning",
          rule: "Benford's Law Deviation — Suspicious Amount Distribution",
          message: `Claim amounts fail Benford's Law test (χ²=${chiSquared.toFixed(3)}, threshold 0.1). First-digit distribution: ${deviationDetails.join("; ")}. This suggests amounts may be fabricated or systematically manipulated.`,
          suggestion: "Benford's Law deviations are a forensic accounting red flag. Review claim amounts for patterns of fabrication, rounding, or manipulation. This batch should be audited.",
        });
      }
    }
  }

  // ── FRD-012: Round-number clustering — abnormal concentration at R500, R1000, etc. ──
  if (lines.length >= 20) {
    const ROUND_NUMBERS = [100, 200, 250, 300, 500, 750, 1000, 1500, 2000, 2500, 3000, 5000, 10000];
    let roundCount = 0;
    const roundBreakdown = new Map<number, number>();
    for (const line of lines) {
      if (!line.amount || line.amount <= 0) continue;
      // Check if amount in rands (divide by 100 if stored in cents)
      const amountRands = line.amount >= 10000 ? line.amount / 100 : line.amount;
      for (const rn of ROUND_NUMBERS) {
        if (Math.abs(amountRands - rn) < 0.01) {
          roundCount++;
          roundBreakdown.set(rn, (roundBreakdown.get(rn) || 0) + 1);
          break;
        }
      }
    }
    const roundPercent = (roundCount / lines.length) * 100;
    if (roundPercent > 40) {
      const breakdown = [...roundBreakdown.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([amt, count]) => `R${amt}: ${count}`)
        .join(", ");
      issues.push({
        lineNumber: lines[0].lineNumber, field: "amount", code: "ROUND_NUMBER_CLUSTERING",
        severity: "error", rule: "Round-Number Clustering — Suspicious Amounts",
        message: `${roundPercent.toFixed(0)}% of claims (${roundCount}/${lines.length}) have round-number amounts. Natural billing rarely exceeds 15%. Breakdown: ${breakdown}.`,
        suggestion: "Round-number claims are a known fraud indicator. Real medical billing produces specific amounts based on tariff schedules. Review for fabricated or estimated amounts.",
      });
    } else if (roundPercent > 25) {
      issues.push({
        lineNumber: lines[0].lineNumber, field: "amount", code: "ROUND_NUMBER_HIGH",
        severity: "warning", rule: "Elevated Round-Number Amounts",
        message: `${roundPercent.toFixed(0)}% of claims have round-number amounts. Normal range is 5-15%.`,
        suggestion: "Review amounts for accuracy against tariff schedules. Elevated round-number rates may indicate estimated rather than calculated billing.",
      });
    }
  }

  // ── FRD-013: S-code to M-code switching — injury coded as musculoskeletal to avoid ECC ──
  // Injury S-codes (S00-S99, T00-T98) require Emergency Care Centre (ECC) referral.
  // Fraudulent billing recodes injuries as M-codes (musculoskeletal) to avoid ECC requirements.
  for (const line of lines) {
    if (!line.primaryICD10) continue;
    const allCodes = [line.primaryICD10, ...(line.secondaryICD10 || [])];
    const hasSCode = allCodes.some(c => /^[ST]\d{2}/i.test(c));
    const hasMCode = allCodes.some(c => /^M\d{2}/i.test(c));
    // Flag if both S/T (injury) and M (musculoskeletal) codes present — possible code switching
    if (hasSCode && hasMCode) {
      issues.push({
        lineNumber: line.lineNumber, field: "primaryICD10", code: "S_TO_M_CODE_SWITCHING",
        severity: "warning", rule: "S-Code to M-Code Switching — Possible ECC Avoidance",
        message: `Claim has both injury codes (S/T) and musculoskeletal codes (M) on the same line. This pattern is associated with recoding injuries as chronic conditions to bypass Emergency Care Centre referral requirements.`,
        suggestion: "Verify the clinical accuracy. If the patient has an acute injury (S/T code), the M-code may be inappropriate. Schemes specifically audit this pattern as it avoids ECC gatekeeping.",
      });
    }
    // Also flag: M-code with injury-related tariff codes (e.g., wound care, fracture management)
    const injuryTariffs = ["0401", "0402", "0403", "0404", "0501", "0502", "0503"];
    if (!hasSCode && hasMCode && line.tariffCode && injuryTariffs.includes(line.tariffCode)) {
      issues.push({
        lineNumber: line.lineNumber, field: "primaryICD10", code: "M_CODE_INJURY_TARIFF",
        severity: "warning", rule: "Musculoskeletal Code With Injury Procedure",
        message: `Injury-type procedure "${line.tariffCode}" (wound care/fracture) billed with musculoskeletal M-code but no injury S/T-code. This suggests the injury code was replaced with an M-code to avoid ECC referral.`,
        suggestion: "If this is an injury, use the appropriate S/T ICD-10 code. M-codes for chronic musculoskeletal conditions do not justify wound care or fracture management tariffs.",
      });
    }
  }

  // ── FRD-014: Prescription fraud — pharmacy hopping (same patient, same drug class, 3+ pharmacies) ──
  // Detect when the same patient gets the same type of medication from multiple pharmacies
  const rxByPatientDrug = new Map<string, { pharmacies: Set<string>; totalQty: number; lineNumbers: number[] }>();
  for (const line of lines) {
    if (!line.nappiCode || !line.patientName || !line.practiceNumber) continue;
    // Group by patient + NAPPI prefix (first 5 digits = same drug class)
    const drugClass = line.nappiCode.substring(0, 5);
    const key = `${line.patientName.toLowerCase()}|${drugClass}`;
    const entry = rxByPatientDrug.get(key) || { pharmacies: new Set(), totalQty: 0, lineNumbers: [] };
    entry.pharmacies.add(line.practiceNumber);
    entry.totalQty += line.quantity || 1;
    entry.lineNumbers.push(line.lineNumber);
    rxByPatientDrug.set(key, entry);
  }
  for (const [key, entry] of rxByPatientDrug) {
    if (entry.pharmacies.size >= 3) {
      const [patient] = key.split("|");
      issues.push({
        lineNumber: entry.lineNumbers[0], field: "nappiCode", code: "PHARMACY_HOPPING",
        severity: "error", rule: "Prescription Fraud — Pharmacy Hopping",
        message: `Patient "${patient}" obtained the same medication class from ${entry.pharmacies.size} different pharmacies (${[...entry.pharmacies].join(", ")}). Total quantity: ${entry.totalQty}. This is a classic prescription fraud pattern.`,
        suggestion: "Flag for prescription monitoring. Pharmacy hopping for controlled substances (S5/S6) is illegal under SAHPRA regulations. Cross-reference with the real-time prescription monitoring database.",
      });
    }
  }

  // ── FRD-015: Collusion patterns — provider-patient rings ──
  // Detect unusual concentration: one provider billing exclusively for a small set of patients,
  // or one patient appearing exclusively at one provider with unusually high frequency.
  const providerPatientMatrix = new Map<string, Map<string, number>>();
  for (const line of lines) {
    if (!line.practiceNumber || !line.patientName) continue;
    const provider = line.practiceNumber;
    const patient = line.patientName.toLowerCase();
    const provMap = providerPatientMatrix.get(provider) || new Map();
    provMap.set(patient, (provMap.get(patient) || 0) + 1);
    providerPatientMatrix.set(provider, provMap);
  }
  for (const [provider, patients] of providerPatientMatrix) {
    const totalClaims = [...patients.values()].reduce((a, b) => a + b, 0);
    if (totalClaims < 10) continue;
    // Check for concentration: if top patient accounts for >30% of a provider's claims
    const sorted = [...patients.entries()].sort((a, b) => b[1] - a[1]);
    const topPatient = sorted[0];
    const topPercent = (topPatient[1] / totalClaims) * 100;
    if (topPercent > 30 && topPatient[1] >= 5) {
      issues.push({
        lineNumber: lines.find(l => l.practiceNumber === provider && l.patientName?.toLowerCase() === topPatient[0])?.lineNumber || lines[0].lineNumber,
        field: "practiceNumber", code: "COLLUSION_PATTERN",
        severity: "warning", rule: "Collusion Pattern — Provider-Patient Concentration",
        message: `Provider ${provider}: patient "${topPatient[0]}" accounts for ${topPercent.toFixed(0)}% of claims (${topPatient[1]}/${totalClaims}). Unusual concentration may indicate collusion or phantom billing.`,
        suggestion: "Review the relationship between this provider and patient. High-concentration billing is a known collusion indicator. Verify all services were rendered.",
      });
    }
    // Check for ring: provider has exactly 3-5 patients with roughly equal high-frequency billing
    if (patients.size >= 3 && patients.size <= 5 && totalClaims >= 20) {
      const avgClaims = totalClaims / patients.size;
      const allSimilar = sorted.every(([, count]) => Math.abs(count - avgClaims) / avgClaims < 0.3);
      if (allSimilar && avgClaims >= 4) {
        issues.push({
          lineNumber: lines.find(l => l.practiceNumber === provider)?.lineNumber || lines[0].lineNumber,
          field: "practiceNumber", code: "BILLING_RING",
          severity: "error", rule: "Collusion Pattern — Possible Billing Ring",
          message: `Provider ${provider} has only ${patients.size} patients but ${totalClaims} claims, with roughly equal billing (~${avgClaims.toFixed(0)} claims each). This pattern is consistent with a provider-patient billing ring.`,
          suggestion: "Investigate this provider immediately. A small, equally-billed patient group is a textbook indicator of collusion. Verify physical attendance for all appointments.",
        });
      }
    }
  }

  // ── FRD-016: Claim amount outlier — >3 standard deviations from peer mean ──
  if (lines.length >= 10) {
    // Group amounts by tariff code to compare like-for-like
    const amountsByTariff = new Map<string, { amounts: number[]; lineNumbers: number[] }>();
    for (const line of lines) {
      if (!line.tariffCode || !line.amount || line.amount <= 0) continue;
      const entry = amountsByTariff.get(line.tariffCode) || { amounts: [], lineNumbers: [] };
      entry.amounts.push(line.amount);
      entry.lineNumbers.push(line.lineNumber);
      amountsByTariff.set(line.tariffCode, entry);
    }
    for (const [tariff, data] of amountsByTariff) {
      if (data.amounts.length < 5) continue; // Need sufficient sample
      const mean = data.amounts.reduce((a, b) => a + b, 0) / data.amounts.length;
      const variance = data.amounts.reduce((sum, x) => sum + (x - mean) ** 2, 0) / data.amounts.length;
      const stdDev = Math.sqrt(variance);
      if (stdDev === 0) continue; // All same amount
      for (let i = 0; i < data.amounts.length; i++) {
        const zScore = Math.abs(data.amounts[i] - mean) / stdDev;
        if (zScore > 3) {
          const amountDisplay = data.amounts[i] >= 10000
            ? `R${(data.amounts[i] / 100).toFixed(2)}`
            : `R${data.amounts[i].toFixed(2)}`;
          const meanDisplay = mean >= 10000
            ? `R${(mean / 100).toFixed(2)}`
            : `R${mean.toFixed(2)}`;
          issues.push({
            lineNumber: data.lineNumbers[i], field: "amount", code: "AMOUNT_OUTLIER",
            severity: "error", rule: "Claim Amount Outlier — >3 Standard Deviations",
            message: `Amount ${amountDisplay} for tariff "${tariff}" is ${zScore.toFixed(1)} standard deviations from the batch mean of ${meanDisplay}. This is a statistical outlier.`,
            suggestion: "Verify the amount is correct. Extreme outliers may indicate data entry errors, upcoding, or inflated billing. Cross-reference with the scheme tariff schedule.",
          });
        }
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

    // ── Rule NAP-008: SEP price exceeded / tariff rate exceeded ──
    // For NAPPI codes: compare against scheme rate if scheme is known,
    // otherwise compare against market average tariff rate.
    // For tariff codes: compare against scheme-specific rates.
    if (line.amount != null && line.amount > 0) {
      // Tariff-based rate comparison
      if (line.tariffCode && /^\d{4}$/.test(line.tariffCode)) {
        let referenceRate: number | null = null;
        let rateSource = "";

        if (line.scheme) {
          referenceRate = getSchemeRate(line.scheme, line.tariffCode);
          rateSource = `${line.scheme} scheme rate`;
        }
        if (!referenceRate) {
          referenceRate = getMarketAverageRate(line.tariffCode);
          rateSource = "market average rate";
        }

        if (referenceRate && line.amount > referenceRate * 2) {
          issues.push({
            lineNumber: ln,
            field: "amount",
            code: "SEP_EXCEEDED",
            severity: "warning",
            rule: "Amount Exceeds Reference Rate",
            message: `Claimed R${line.amount.toFixed(2)} vs ${rateSource} R${referenceRate.toFixed(2)} for tariff "${line.tariffCode}" (${Math.round((line.amount / referenceRate) * 100)}% of reference). Scheme will likely pay at their rate, patient liable for the difference.`,
            suggestion: "Verify the claimed amount. If charging above scheme rate, the patient must be informed of the shortfall. PMB conditions must be billed at scheme rate at DSP.",
          });
        }
      }
    }
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
