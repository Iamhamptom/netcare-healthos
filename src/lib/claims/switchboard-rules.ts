// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Switchboard / Clearing House Rules — Comprehensive Validation Engine
//
// SA has 3 major switching houses. Each has different format requirements,
// tariff acceptance rules, and adjudication logic. Matching the EXACT rules
// of the target switch turns "might be rejected" into "WILL be rejected."
//
// Switchboards:
// - Healthbridge (Discovery, Bonitas, Medihelp, Bankmed, LA Health — 3.25M+/yr)
// - MediSwitch / MediKredit (CompCare, Medshield, PPS, KeyHealth — 200M+ tx/yr)
// - SwitchOn / Altron HealthTech (GEMS, Momentum, Bestmed, Fedhealth — 99.8M tx/yr)
//
// Validation Phases:
//  Phase 1 — Structural (EDIFACT segment integrity, batch controls)
//  Phase 2 — Field-level (format, length, character sets, code existence)
//  Phase 3 — Clinical coherence (ICD-10/tariff compat, gender/age, ECC, duplicates)
//
// Sources: PHISC MEDCLM v0-912-13.4 spec, BHF adjustment reason codes,
//          Healthbridge/MediKredit/SwitchOn integration specs, CCSA v11
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { ClaimLineItem, ClaimBatchMetadata, ValidationIssue } from "./types";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SwitchboardProfile {
  code: string;
  name: string;
  /** EDIFACT version */
  edifactVersion: string;
  /** Claim submission format */
  format: "EDIFACT" | "XML" | "JSON";
  /** Max claims per batch */
  maxBatchSize: number;
  /** Claim window in days from date of service */
  claimWindowDays: number;
  /** Required fields — claims missing these are auto-rejected at switch */
  requiredFields: string[];
  /** Accepted date format */
  dateFormat: "CCYYMMDD" | "YYYY-MM-DD";
  /** Whether the switch requires ICD-10 4th character */
  requiresSpecificity: boolean;
  /** Max amount per claim line (switch auto-rejects above this) */
  maxAmountPerLine: number;
  /** Whether the switch validates NAPPI codes */
  validatesNAPPI: boolean;
  /** Whether the switch runs ECC checks */
  requiresECC: boolean;
  /** Whether the switch runs gender checks */
  genderCheckEnabled: boolean;
  /** Modifier validation level */
  modifierValidation: "strict" | "moderate" | "none";
  /** Duplicate detection window (days) */
  duplicateWindowDays: number;
  /** Whether claims with motivation text get priority processing */
  motivationPriority: boolean;
  /** Max ICD-10 codes per line item */
  maxICD10PerLine: number;
  /** Max secondary ICD-10 codes allowed */
  maxSecondaryICD10: number;
  /** Resubmission window (days from rejection) */
  resubmissionWindowDays: number;
  /** Whether practice number is verified against BHF registry */
  verifiesPracticeNumber: boolean;
  /** Maximum patient name length */
  maxPatientNameLength: number;
  /** Whether negative amounts are allowed (credit notes) */
  allowsNegativeAmounts: boolean;
  /** Maximum modifier codes per line */
  maxModifiersPerLine: number;
  /** Whether the switch validates tariff code format */
  validatesTariffFormat: boolean;
  /** Whether the switch cross-checks tariff against practitioner type */
  tariffDisciplineCheck: boolean;
  /** Whether the switch enforces place of service */
  requiresPlaceOfService: boolean;
  /** Minimum claim amount (below = rejected as incomplete) */
  minAmountPerLine: number;
  /** Whether the switch checks for future dates of service */
  rejectsFutureDates: boolean;
  /** Maximum quantity per line item */
  maxQuantityPerLine: number;
  /** Whether the switch validates SA ID number format */
  validatesIDNumber: boolean;
  /** Whether the switch enforces dependent code format */
  validatesDependentCode: boolean;
  /** Accepted EDIFACT character set */
  characterSet: "UNOA" | "UNOB" | "UNOC";
  /** Maximum total batch amount */
  maxBatchAmount: number;
  /** Whether the switch requires batch control totals */
  requiresBatchControlTotals: boolean;
}

// ─── Accepted Modifier Lists Per Switch ─────────────────────────────────────

const HEALTHBRIDGE_MODIFIERS = [
  "0001", "0002", "0003", "0004", "0005", "0006", "0007", "0008", "0009",
  "0010", "0011", "0012", "0013", "0014", "0015", "0016", "0017", "0018",
  "0019", "0021", "0023", "0024", "0025", "0026", "0028", "09959", "PMB",
  "0000",
];

const MEDISWITCH_MODIFIERS = [
  "0001", "0002", "0003", "0004", "0005", "0006", "0007", "0008", "0009",
  "0010", "0011", "0012", "0013", "0014", "0015", "0016", "0017", "0018",
  "0019", "0021", "0024", "0025", "0026", "09959", "PMB", "0000",
];

const SWITCHON_MODIFIERS = [
  "0001", "0002", "0003", "0005", "0006", "0011", "0012", "0013", "0014",
  "0018", "0019", "0021", "PMB", "0000",
];

// ─── Tariff Code Ranges by Discipline ───────────────────────────────────────

const TARIFF_DISCIPLINE_MAP: Record<string, { min: number; max: number; discipline: string }[]> = {
  gp: [{ min: 100, max: 199, discipline: "gp" }, { min: 190, max: 199, discipline: "gp" }],
  specialist: [{ min: 141, max: 149, discipline: "specialist" }],
  surgeon: [{ min: 500, max: 1999, discipline: "surgery" }],
  anaesthetist: [{ min: 400, max: 499, discipline: "anaesthesia" }],
  radiology: [{ min: 3600, max: 4099, discipline: "radiology" }],
  pathology: [{ min: 4200, max: 4799, discipline: "pathology" }],
  dental: [{ min: 8100, max: 8899, discipline: "dental" }],
  allied: [{ min: 6000, max: 6999, discipline: "allied" }],
};

// ─── Place of Service Codes (BHF Standard) ──────────────────────────────────

const VALID_PLACE_OF_SERVICE = [
  "11", "12", "21", "22", "23", "41", "65", "81",
  "1", "2", "3", "4", "5",
];

// ─── ICD-10 Chapter Prefixes for Gender/Age Checks ──────────────────────────

const FEMALE_ONLY_ICD10_PREFIXES = [
  "O", // Pregnancy/childbirth (O00-O99)
  "N70", "N71", "N72", "N73", "N74", "N75", "N76", "N77",
  "N80", "N81", "N82", "N83", "N84", "N85", "N86", "N87", "N88",
  "N89", "N90", "N91", "N92", "N93", "N94", "N95", "N96", "N97", "N98",
  "C51", "C52", "C53", "C54", "C55", "C56", "C57", "C58",
  "D06", "D25", "D26", "D27", "D28",
];

const MALE_ONLY_ICD10_PREFIXES = [
  "N40", "N41", "N42", "N43", "N44", "N45", "N46", "N47", "N48", "N49",
  "N50", "N51",
  "C60", "C61", "C62", "C63",
  "D29", "D40",
];

// ─── External Cause Code Prefixes ───────────────────────────────────────────

const INJURY_PREFIXES = [
  "S0", "S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9",
  "T0", "T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9",
];

const ECC_PREFIXES = ["V", "W", "X", "Y"];

// ─── Characters Forbidden in EDIFACT UNOA ────────────────────────────────────

const UNOA_FORBIDDEN = /[^A-Za-z0-9 .,\-()\/='+:?!"%&*;<>]/;
const UNOB_FORBIDDEN = /[^\x20-\x7E]/;

// ─── Switchboard Profiles ───────────────────────────────────────────────────

export const SWITCHBOARDS: Record<string, SwitchboardProfile> = {
  healthbridge: {
    code: "HB",
    name: "Healthbridge",
    edifactVersion: "MEDCLM v0-912-13.4",
    format: "EDIFACT",
    maxBatchSize: 500,
    claimWindowDays: 120,
    requiredFields: [
      "PROVIDER_NO",     // BHF practice number — MANDATORY
      "MEMBER_NO",       // Membership number — MANDATORY
      "DEPENDENT_CODE",  // 2-digit dependent code — MANDATORY
      "ICD10_1",         // Primary diagnosis — MANDATORY
      "TARIFF_CODE",     // Procedure code — MANDATORY
      "AMOUNT",          // Claim amount — MANDATORY
      "CLAIM_DATE",      // Date of service — MANDATORY
      "PATIENT_SURNAME", // Patient name — MANDATORY
      "PATIENT_GENDER",  // Gender — MANDATORY
    ],
    dateFormat: "CCYYMMDD",
    requiresSpecificity: true,
    maxAmountPerLine: 50000,
    validatesNAPPI: true,
    requiresECC: true,
    genderCheckEnabled: true,
    modifierValidation: "strict",
    duplicateWindowDays: 30,
    motivationPriority: true,
    maxICD10PerLine: 4,
    maxSecondaryICD10: 3,
    resubmissionWindowDays: 60,
    verifiesPracticeNumber: true,
    maxPatientNameLength: 35,
    allowsNegativeAmounts: false,
    maxModifiersPerLine: 3,
    validatesTariffFormat: true,
    tariffDisciplineCheck: true,
    requiresPlaceOfService: true,
    minAmountPerLine: 1,
    rejectsFutureDates: true,
    maxQuantityPerLine: 99,
    validatesIDNumber: true,
    validatesDependentCode: true,
    characterSet: "UNOA",
    maxBatchAmount: 5000000,
    requiresBatchControlTotals: true,
  },
  mediswitch: {
    code: "MS",
    name: "MediSwitch / MediKredit",
    edifactVersion: "MEDCLM v0-912-13.2",
    format: "EDIFACT",
    maxBatchSize: 1000,
    claimWindowDays: 120,
    requiredFields: [
      "PROVIDER_NO",
      "MEMBER_NO",
      "DEPENDENT_CODE",
      "ICD10_1",
      "TARIFF_CODE",
      "AMOUNT",
      "CLAIM_DATE",
    ],
    dateFormat: "CCYYMMDD",
    requiresSpecificity: false,
    maxAmountPerLine: 100000,
    validatesNAPPI: false,
    requiresECC: true,
    genderCheckEnabled: true,
    modifierValidation: "moderate",
    duplicateWindowDays: 60,
    motivationPriority: false,
    maxICD10PerLine: 4,
    maxSecondaryICD10: 3,
    resubmissionWindowDays: 60,
    verifiesPracticeNumber: true,
    maxPatientNameLength: 40,
    allowsNegativeAmounts: true,
    maxModifiersPerLine: 4,
    validatesTariffFormat: true,
    tariffDisciplineCheck: false,
    requiresPlaceOfService: false,
    minAmountPerLine: 0,
    rejectsFutureDates: true,
    maxQuantityPerLine: 999,
    validatesIDNumber: true,
    validatesDependentCode: true,
    characterSet: "UNOB",
    maxBatchAmount: 10000000,
    requiresBatchControlTotals: true,
  },
  switchon: {
    code: "SO",
    name: "SwitchOn",
    edifactVersion: "MEDCLM v0-912-13.1",
    format: "EDIFACT",
    maxBatchSize: 200,
    claimWindowDays: 90,
    requiredFields: [
      "PROVIDER_NO",
      "MEMBER_NO",
      "ICD10_1",
      "TARIFF_CODE",
      "AMOUNT",
      "CLAIM_DATE",
    ],
    dateFormat: "CCYYMMDD",
    requiresSpecificity: false,
    maxAmountPerLine: 30000,
    validatesNAPPI: false,
    requiresECC: false,
    genderCheckEnabled: false,
    modifierValidation: "none",
    duplicateWindowDays: 30,
    motivationPriority: false,
    maxICD10PerLine: 4,
    maxSecondaryICD10: 3,
    resubmissionWindowDays: 60,
    verifiesPracticeNumber: false,
    maxPatientNameLength: 50,
    allowsNegativeAmounts: false,
    maxModifiersPerLine: 2,
    validatesTariffFormat: true,
    tariffDisciplineCheck: false,
    requiresPlaceOfService: false,
    minAmountPerLine: 0,
    rejectsFutureDates: true,
    maxQuantityPerLine: 99,
    validatesIDNumber: false,
    validatesDependentCode: false,
    characterSet: "UNOB",
    maxBatchAmount: 2000000,
    requiresBatchControlTotals: false,
  },
};

export const SWITCHBOARD_LIST = Object.entries(SWITCHBOARDS).map(([key, sw]) => ({
  code: key,
  name: sw.name,
  description: `${sw.edifactVersion} — ${sw.format}`,
}));

// ─── Helper: Get Switch-Specific Modifier List ──────────────────────────────

function getModifierList(switchCode: string): string[] {
  switch (switchCode) {
    case "HB": return HEALTHBRIDGE_MODIFIERS;
    case "MS": return MEDISWITCH_MODIFIERS;
    case "SO": return SWITCHON_MODIFIERS;
    default: return HEALTHBRIDGE_MODIFIERS;
  }
}

// ─── Helper: Push Issue ─────────────────────────────────────────────────────

function issue(
  ln: number,
  field: string,
  code: string,
  severity: "error" | "warning" | "info",
  rule: string,
  message: string,
  suggestion?: string,
): ValidationIssue {
  return { lineNumber: ln, field, code, severity, rule, message, suggestion };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PHASE 1 — Structural / Batch-Level Validation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function validateBatchLevel(
  lines: ClaimLineItem[],
  sw: SwitchboardProfile,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const ln = lines[0]?.lineNumber ?? 0;

  // RULE B01: Batch size exceeds switch maximum
  if (lines.length > sw.maxBatchSize) {
    issues.push(issue(ln, "batch", "SWITCH_BATCH_SIZE", "error",
      `${sw.name}: Batch Size Exceeded`,
      `Batch contains ${lines.length} claims. ${sw.name} accepts max ${sw.maxBatchSize} per submission. Batch will be rejected.`,
      `Split into ${Math.ceil(lines.length / sw.maxBatchSize)} batches of max ${sw.maxBatchSize} each.`,
    ));
  }

  // RULE B02: Empty batch
  if (lines.length === 0) {
    issues.push(issue(0, "batch", "SWITCH_EMPTY_BATCH", "error",
      `${sw.name}: Empty Batch`,
      `Batch contains no claim lines. ${sw.name} rejects empty submissions.`,
    ));
  }

  // RULE B03: Batch control total — total amount check
  if (sw.requiresBatchControlTotals) {
    const totalAmount = lines.reduce((sum, l) => sum + (l.amount ?? 0), 0);
    if (totalAmount > sw.maxBatchAmount) {
      issues.push(issue(ln, "batch", "SWITCH_BATCH_AMOUNT", "error",
        `${sw.name}: Batch Total Exceeds Limit`,
        `Batch total R${totalAmount.toFixed(2)} exceeds ${sw.name}'s maximum of R${sw.maxBatchAmount.toLocaleString()}. Split into smaller batches.`,
      ));
    }
    if (totalAmount <= 0 && lines.length > 0) {
      issues.push(issue(ln, "batch", "SWITCH_BATCH_ZERO_TOTAL", "warning",
        `${sw.name}: Zero/Negative Batch Total`,
        `Batch total is R${totalAmount.toFixed(2)}. ${sw.name} may reject batches with zero or negative totals.`,
      ));
    }
  }

  // RULE B04: Mixed practice numbers in batch (Healthbridge rejects)
  if (sw.code === "HB") {
    const practiceNumbers = new Set(lines.map(l => l.practiceNumber).filter(Boolean));
    if (practiceNumbers.size > 1) {
      issues.push(issue(ln, "batch", "SWITCH_MIXED_PRACTICE", "error",
        `${sw.name}: Mixed Practice Numbers`,
        `Batch contains claims from ${practiceNumbers.size} different practice numbers (${Array.from(practiceNumbers).join(", ")}). Healthbridge requires one practice per batch.`,
        `Split into separate batches per practice number.`,
      ));
    }
  }

  // RULE B05: Duplicate line numbers in batch
  const lineNums = lines.map(l => l.lineNumber);
  const uniqueLineNums = new Set(lineNums);
  if (uniqueLineNums.size !== lineNums.length) {
    issues.push(issue(ln, "batch", "SWITCH_DUPLICATE_LINE_NUMS", "error",
      `${sw.name}: Duplicate Line Numbers`,
      `Batch contains duplicate line numbers. Each line must have a unique sequence number within the batch.`,
    ));
  }

  // RULE B06: Line numbers not sequential
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].lineNumber <= lines[i - 1].lineNumber) {
      issues.push(issue(lines[i].lineNumber, "batch", "SWITCH_LINE_SEQUENCE", "warning",
        `${sw.name}: Non-Sequential Line Numbers`,
        `Line ${lines[i].lineNumber} follows line ${lines[i - 1].lineNumber}. Lines should be sequentially numbered.`,
      ));
      break;
    }
  }

  // RULE B07: Duplicate claims detection (same patient + date + tariff)
  const claimKeys = new Map<string, number>();
  for (const line of lines) {
    const key = `${line.membershipNumber}|${line.dependentCode}|${line.dateOfService}|${line.tariffCode}|${line.amount}`;
    const existing = claimKeys.get(key);
    if (existing !== undefined) {
      issues.push(issue(line.lineNumber, "batch", "SWITCH_DUPLICATE_CLAIM", "error",
        `${sw.name}: Duplicate Claim Detected`,
        `Line ${line.lineNumber} is identical to line ${existing} (same member, date, tariff, amount). ${sw.name} will flag this as a duplicate within the ${sw.duplicateWindowDays}-day window.`,
        `Remove duplicate or add distinguishing modifier (e.g., 0006 bilateral, 0019 distinct procedure).`,
      ));
    } else {
      claimKeys.set(key, line.lineNumber);
    }
  }

  // RULE B08: Multiple claims for same patient same date — consultation stacking
  const patientDateClaims = new Map<string, ClaimLineItem[]>();
  for (const line of lines) {
    const key = `${line.membershipNumber}|${line.dependentCode}|${line.dateOfService}`;
    const existing = patientDateClaims.get(key);
    if (existing) existing.push(line);
    else patientDateClaims.set(key, [line]);
  }
  patientDateClaims.forEach((patientLines) => {
    const consultCodes = patientLines.filter((l: ClaimLineItem) => {
      const tc = parseInt(l.tariffCode ?? "", 10);
      return tc >= 100 && tc <= 199;
    });
    if (consultCodes.length > 1) {
      issues.push(issue(consultCodes[1].lineNumber, "batch", "SWITCH_CONSULT_STACKING", "warning",
        `${sw.name}: Multiple Consultations Same Day`,
        `${consultCodes.length} consultation codes billed for the same patient on the same date. ${sw.name} may flag this as consultation stacking.`,
        `Only one consultation per patient per day unless different practitioner or 0019 modifier.`,
      ));
    }
  });

  return issues;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PHASE 2 — Field-Level Validation (format, length, character set)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function validateFieldLevel(
  line: ClaimLineItem,
  sw: SwitchboardProfile,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const ln = line.lineNumber;

  // ─── Required fields (switch auto-rejects) ──
  const fieldMap: Record<string, string | undefined> = {
    "PROVIDER_NO": line.practiceNumber,
    "MEMBER_NO": line.membershipNumber,
    "DEPENDENT_CODE": line.dependentCode,
    "ICD10_1": line.primaryICD10,
    "TARIFF_CODE": line.tariffCode,
    "AMOUNT": line.amount?.toString(),
    "CLAIM_DATE": line.dateOfService,
    "PATIENT_SURNAME": line.patientName,
    "PATIENT_GENDER": line.patientGender,
  };

  for (const field of sw.requiredFields) {
    const value = fieldMap[field];
    if (!value || !value.trim()) {
      issues.push(issue(ln, field.toLowerCase(), "SWITCH_REQUIRED_FIELD", "error",
        `${sw.name}: Missing Required Field`,
        `${sw.name} requires "${field}" for all claims. This claim will be auto-rejected at the switch.`,
        `Add the ${field} value before submitting to ${sw.name}.`,
      ));
    }
  }

  // ─── RULE F01: Practice number format (7 digits) ──
  if (line.practiceNumber) {
    const pn = line.practiceNumber.trim();
    if (!/^\d{7}$/.test(pn)) {
      issues.push(issue(ln, "practiceNumber", "SWITCH_PRACTICE_FORMAT", "error",
        `${sw.name}: Invalid Practice Number Format`,
        `Practice number "${pn}" must be exactly 7 digits. Current: ${pn.length} characters.`,
        `Verify on pcns.co.za. BHF practice numbers are always 7 numeric digits.`,
      ));
    }
    // F01b: Practice number starts with 0
    if (/^0{7}$/.test(pn)) {
      issues.push(issue(ln, "practiceNumber", "SWITCH_PRACTICE_ZERO", "error",
        `${sw.name}: Zero Practice Number`,
        `Practice number is all zeros. This is not a valid BHF registration.`,
      ));
    }
  }

  // ─── RULE F02: Membership number format ──
  if (line.membershipNumber) {
    const mn = line.membershipNumber.trim();
    if (mn.length < 3 || mn.length > 20) {
      issues.push(issue(ln, "membershipNumber", "SWITCH_MEMBER_LENGTH", "error",
        `${sw.name}: Invalid Membership Number Length`,
        `Membership number "${mn}" is ${mn.length} chars. Must be 3-20 characters.`,
      ));
    }
    if (/[^A-Za-z0-9\-\/]/.test(mn)) {
      issues.push(issue(ln, "membershipNumber", "SWITCH_MEMBER_CHARS", "error",
        `${sw.name}: Invalid Characters in Membership Number`,
        `Membership number contains special characters. Only alphanumeric, hyphens, and forward slashes allowed.`,
      ));
    }
  }

  // ─── RULE F03: Dependent code format ──
  if (sw.validatesDependentCode && line.dependentCode) {
    const dc = line.dependentCode.trim();
    if (!/^\d{2}$/.test(dc)) {
      issues.push(issue(ln, "dependentCode", "SWITCH_DEPENDENT_FORMAT", "error",
        `${sw.name}: Invalid Dependent Code`,
        `Dependent code "${dc}" must be exactly 2 digits (00 = main member, 01-09 = dependents).`,
        `Use "00" for the main member, "01" for first dependent, etc.`,
      ));
    }
    const dcNum = parseInt(dc, 10);
    if (!isNaN(dcNum) && dcNum > 12) {
      issues.push(issue(ln, "dependentCode", "SWITCH_DEPENDENT_RANGE", "warning",
        `${sw.name}: Unusual Dependent Code`,
        `Dependent code ${dc} (>${12}) is unusually high. Most schemes support up to 09.`,
      ));
    }
  }

  // ─── RULE F04: Patient name length and character set ──
  if (line.patientName) {
    const name = line.patientName.trim();
    if (name.length > sw.maxPatientNameLength) {
      issues.push(issue(ln, "patientName", "SWITCH_NAME_LENGTH", "error",
        `${sw.name}: Patient Name Too Long`,
        `Patient name is ${name.length} chars (max ${sw.maxPatientNameLength} for ${sw.name}). Name will be truncated or rejected.`,
        `Abbreviate middle names or use initials to fit within ${sw.maxPatientNameLength} characters.`,
      ));
    }
    if (name.length < 2) {
      issues.push(issue(ln, "patientName", "SWITCH_NAME_SHORT", "error",
        `${sw.name}: Patient Name Too Short`,
        `Patient name "${name}" is only ${name.length} character(s). Minimum 2 characters required.`,
      ));
    }
    // Character set validation
    const forbidden = sw.characterSet === "UNOA" ? UNOA_FORBIDDEN : UNOB_FORBIDDEN;
    if (forbidden.test(name)) {
      const badChars = name.match(new RegExp(forbidden.source, "g")) ?? [];
      issues.push(issue(ln, "patientName", "SWITCH_NAME_CHARS", "warning",
        `${sw.name}: Invalid Characters in Patient Name`,
        `Patient name contains characters not allowed in ${sw.characterSet} charset: "${badChars.join("")}". May be stripped or cause rejection.`,
        `Remove special characters. EDIFACT ${sw.characterSet} only allows ${sw.characterSet === "UNOA" ? "uppercase letters, digits, spaces, and basic punctuation" : "printable ASCII"}.`,
      ));
    }
    // Numeric-only name
    if (/^\d+$/.test(name)) {
      issues.push(issue(ln, "patientName", "SWITCH_NAME_NUMERIC", "error",
        `${sw.name}: Patient Name is Numeric`,
        `Patient name "${name}" contains only digits. This is not a valid patient name.`,
      ));
    }
  }

  // ─── RULE F05: Date of service format and validity ──
  if (line.dateOfService) {
    const dos = line.dateOfService.trim();

    // F05a: CCYYMMDD format check
    if (sw.dateFormat === "CCYYMMDD") {
      if (!/^\d{8}$/.test(dos) && !/^\d{4}-\d{2}-\d{2}$/.test(dos)) {
        issues.push(issue(ln, "dateOfService", "SWITCH_DATE_FORMAT", "error",
          `${sw.name}: Invalid Date Format`,
          `Date "${dos}" must be CCYYMMDD format (e.g., 20260324). ${sw.name} requires strict ${sw.dateFormat} format.`,
        ));
      }
    }

    // F05b: Future date check
    const dosDate = new Date(dos);
    if (sw.rejectsFutureDates && !isNaN(dosDate.getTime())) {
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      if (dosDate > now) {
        issues.push(issue(ln, "dateOfService", "SWITCH_FUTURE_DATE", "error",
          `${sw.name}: Future Date of Service`,
          `Date of service ${dos} is in the future. ${sw.name} rejects claims with future dates.`,
          `Correct the date. Claims can only be submitted for services already rendered.`,
        ));
      }
    }

    // F05c: Claim window exceeded
    if (!isNaN(dosDate.getTime())) {
      const now = new Date();
      const days = Math.floor((now.getTime() - dosDate.getTime()) / 86400000);
      if (days > sw.claimWindowDays) {
        issues.push(issue(ln, "dateOfService", "SWITCH_STALE", "error",
          `${sw.name}: Claim Window Exceeded`,
          `Claim is ${days} days old. ${sw.name} has a ${sw.claimWindowDays}-day submission window.`,
          `Submit within ${sw.claimWindowDays} days of service when using ${sw.name}. Apply for late submission if applicable.`,
        ));
      } else if (days > sw.claimWindowDays - 14) {
        issues.push(issue(ln, "dateOfService", "SWITCH_NEAR_EXPIRY", "warning",
          `${sw.name}: Claim Near Window Expiry`,
          `Claim is ${days} days old. Only ${sw.claimWindowDays - days} days remaining in ${sw.name}'s submission window.`,
          `Submit urgently — claim expires in ${sw.claimWindowDays - days} days.`,
        ));
      }

      // F05d: Unreasonably old date
      if (days > 365) {
        issues.push(issue(ln, "dateOfService", "SWITCH_VERY_OLD", "error",
          `${sw.name}: Date Over 1 Year Old`,
          `Date of service is ${days} days (${Math.floor(days / 30)} months) ago. This exceeds any scheme's late submission allowance.`,
        ));
      }

      // F05e: Date before 2000 (data entry error)
      if (dosDate.getFullYear() < 2000) {
        issues.push(issue(ln, "dateOfService", "SWITCH_DATE_ANCIENT", "error",
          `${sw.name}: Date Before Year 2000`,
          `Date of service ${dos} is before year 2000. Likely a data entry error.`,
        ));
      }
    }

    // F05f: Invalid date (e.g., Feb 30)
    if (isNaN(dosDate.getTime()) && dos.length > 0) {
      issues.push(issue(ln, "dateOfService", "SWITCH_DATE_INVALID", "error",
        `${sw.name}: Invalid Date`,
        `Date of service "${dos}" is not a valid date.`,
      ));
    }
  }

  // ─── RULE F06: Amount validation ──
  if (line.amount !== undefined && line.amount !== null) {
    // F06a: Amount exceeds switch limit
    if (line.amount > sw.maxAmountPerLine) {
      issues.push(issue(ln, "amount", "SWITCH_AMOUNT_LIMIT", "error",
        `${sw.name}: Amount Exceeds Limit`,
        `R${line.amount.toFixed(2)} exceeds ${sw.name}'s per-line limit of R${sw.maxAmountPerLine.toLocaleString()}. Requires manual authorisation.`,
        `Claims above R${sw.maxAmountPerLine.toLocaleString()} need pre-auth before submission to ${sw.name}.`,
      ));
    }

    // F06b: Minimum amount
    if (line.amount < sw.minAmountPerLine && !sw.allowsNegativeAmounts) {
      issues.push(issue(ln, "amount", "SWITCH_AMOUNT_MINIMUM", "error",
        `${sw.name}: Amount Below Minimum`,
        `Amount R${line.amount.toFixed(2)} is below the minimum of R${sw.minAmountPerLine}. ${sw.name} rejects zero/negative amounts.`,
      ));
    }

    // F06c: Negative amount without credit note
    if (line.amount < 0 && !sw.allowsNegativeAmounts) {
      issues.push(issue(ln, "amount", "SWITCH_NEGATIVE_AMOUNT", "error",
        `${sw.name}: Negative Amount Not Allowed`,
        `Amount R${line.amount.toFixed(2)} is negative. ${sw.name} does not accept negative amounts without a reversal (REV) correction type.`,
        `Use a reversal claim (DCR+REV) to reverse a previous claim, not a negative amount.`,
      ));
    }

    // F06d: Decimal places (EDIFACT amounts are in cents, no decimals)
    if (line.rawAmount) {
      const decMatch = line.rawAmount.match(/\.(\d+)$/);
      if (decMatch && decMatch[1].length > 2) {
        issues.push(issue(ln, "amount", "SWITCH_AMOUNT_DECIMALS", "warning",
          `${sw.name}: Excessive Decimal Places`,
          `Amount "${line.rawAmount}" has ${decMatch[1].length} decimal places. EDIFACT uses 2 implied decimals (cents). Value will be truncated.`,
        ));
      }
    }

    // F06e: Currency symbols in amount
    if (line.rawAmount && /[R$€£¥]/.test(line.rawAmount)) {
      issues.push(issue(ln, "amount", "SWITCH_AMOUNT_CURRENCY", "error",
        `${sw.name}: Currency Symbol in Amount`,
        `Amount "${line.rawAmount}" contains a currency symbol. EDIFACT amounts must be numeric only (no R, $, or other symbols).`,
        `Remove the currency symbol. Amounts are always in South African Rands (ZAR) — the currency is implied.`,
      ));
    }

    // F06f: Comma as decimal separator (common SA error)
    if (line.rawAmount && /^\d+,\d{1,2}$/.test(line.rawAmount)) {
      issues.push(issue(ln, "amount", "SWITCH_AMOUNT_COMMA", "warning",
        `${sw.name}: Comma Decimal Separator`,
        `Amount "${line.rawAmount}" uses comma as decimal separator. EDIFACT requires period (.) or no separator (cents).`,
      ));
    }

    // F06g: Suspiciously round amount (possible estimate)
    if (line.amount >= 1000 && line.amount % 1000 === 0) {
      issues.push(issue(ln, "amount", "SWITCH_AMOUNT_ROUND", "info",
        `${sw.name}: Suspiciously Round Amount`,
        `Amount R${line.amount.toFixed(2)} is exactly R${(line.amount / 1000).toFixed(0)}K. Very round amounts may indicate an estimate rather than actual tariff rate.`,
      ));
    }
  }

  // ─── RULE F07: ICD-10 format validation ──
  if (line.primaryICD10) {
    const icd = line.primaryICD10.trim();

    // F07a: Basic format check (A00-Z99 with optional .0-.9999)
    if (!/^[A-Z]\d{2}(\.\d{1,4})?$/i.test(icd)) {
      issues.push(issue(ln, "primaryICD10", "SWITCH_ICD10_FORMAT", "error",
        `${sw.name}: Invalid ICD-10 Format`,
        `ICD-10 code "${icd}" does not match WHO format (letter + 2 digits + optional .digit(s)). Example: J06.9, E11.2.`,
        `SA uses WHO ICD-10 format (NOT US ICD-10-CM). Format: [A-Z][0-9]{2}(.[0-9]{1-4})?`,
      ));
    }

    // F07b: Lowercase ICD-10 (common data entry issue)
    if (line.rawICD10 && /[a-z]/.test(line.rawICD10)) {
      issues.push(issue(ln, "primaryICD10", "SWITCH_ICD10_CASE", "warning",
        `${sw.name}: Lowercase ICD-10 Code`,
        `ICD-10 code was entered in lowercase ("${line.rawICD10}"). ${sw.name} requires uppercase. Auto-corrected to "${icd}".`,
      ));
    }

    // F07c: Specificity enforcement (Healthbridge strict)
    if (sw.requiresSpecificity && /^[A-Z]\d{2}$/i.test(icd)) {
      issues.push(issue(ln, "primaryICD10", "SWITCH_SPECIFICITY", "error",
        `${sw.name}: Insufficient Specificity`,
        `${sw.name} requires 4+ character ICD-10 codes. "${icd}" (3 chars) will be rejected. Add the 4th character (e.g., ${icd}.9).`,
        `${sw.name} enforces strict specificity. Use the most specific code available.`,
      ));
    }

    // F07d: Z-codes as primary (some switches flag)
    if (sw.code === "HB" && icd.startsWith("Z") && !["Z00", "Z01", "Z02", "Z03", "Z04", "Z09"].some(p => icd.startsWith(p))) {
      issues.push(issue(ln, "primaryICD10", "SWITCH_ZCODE_PRIMARY", "info",
        `${sw.name}: Z-Code as Primary Diagnosis`,
        `"${icd}" is a Z-code (factors influencing health status). ${sw.name} may query Z-codes as primary unless it's a screening/examination code.`,
      ));
    }

    // F07e: R-codes (symptoms) with procedures (should have confirmed diagnosis)
    if (icd.startsWith("R") && line.tariffCode) {
      const tc = parseInt(line.tariffCode, 10);
      if (tc >= 500 && tc <= 2999) {
        issues.push(issue(ln, "primaryICD10", "SWITCH_SYMPTOM_WITH_PROCEDURE", "warning",
          `${sw.name}: Symptom Code with Surgical Procedure`,
          `Symptom code "${icd}" paired with surgical tariff ${line.tariffCode}. ${sw.name} may query — surgical procedures should have a confirmed diagnosis, not a symptom code.`,
          `Replace R-code with the confirmed diagnosis (e.g., R10.1 abdominal pain → K35.9 acute appendicitis if appendectomy performed).`,
        ));
      }
    }

    // F07f: U-codes (reserved/special) as primary
    if (icd.startsWith("U")) {
      issues.push(issue(ln, "primaryICD10", "SWITCH_UCODE", "warning",
        `${sw.name}: U-Code Used`,
        `"${icd}" is a U-code (reserved for special purposes, e.g., COVID-19 U07.1). Verify it's supported by the target scheme.`,
      ));
    }
  }

  // ─── RULE F08: Secondary ICD-10 validation ──
  if (line.secondaryICD10 && line.secondaryICD10.length > 0) {
    // F08a: Too many secondary codes
    if (line.secondaryICD10.length > sw.maxSecondaryICD10) {
      issues.push(issue(ln, "secondaryICD10", "SWITCH_TOO_MANY_ICD10", "warning",
        `${sw.name}: Too Many Secondary ICD-10 Codes`,
        `${line.secondaryICD10.length} secondary ICD-10 codes provided. ${sw.name} accepts max ${sw.maxSecondaryICD10}. Extra codes will be ignored.`,
      ));
    }

    // F08b: Duplicate ICD-10 codes
    const icdSet = new Set([line.primaryICD10, ...line.secondaryICD10]);
    if (icdSet.size < 1 + line.secondaryICD10.length) {
      issues.push(issue(ln, "secondaryICD10", "SWITCH_DUPLICATE_ICD10", "error",
        `${sw.name}: Duplicate ICD-10 Codes`,
        `Same ICD-10 code appears multiple times in primary and secondary positions. Each code must be unique per line.`,
      ));
    }

    // F08c: Each secondary code format check
    for (const sec of line.secondaryICD10) {
      if (!/^[A-Z]\d{2}(\.\d{1,4})?$/i.test(sec.trim())) {
        issues.push(issue(ln, "secondaryICD10", "SWITCH_SEC_ICD10_FORMAT", "error",
          `${sw.name}: Invalid Secondary ICD-10`,
          `Secondary ICD-10 "${sec}" does not match WHO format.`,
        ));
      }
    }
  }

  // ─── RULE F09: Tariff code format ──
  if (sw.validatesTariffFormat && line.tariffCode) {
    const tc = line.tariffCode.trim();

    // F09a: Must be 4 digits
    if (!/^\d{4}$/.test(tc)) {
      issues.push(issue(ln, "tariffCode", "SWITCH_TARIFF_FORMAT", "error",
        `${sw.name}: Invalid Tariff Code Format`,
        `Tariff code "${tc}" must be exactly 4 digits (CCSA format). SA uses 4-digit codes, NOT American CPT codes.`,
        `Valid range: 0100-9999. Example: 0191 (GP consult), 3601 (chest X-ray), 4014 (FBC).`,
      ));
    }

    // F09b: Out of valid range
    const tcNum = parseInt(tc, 10);
    if (!isNaN(tcNum) && (tcNum < 100 || tcNum > 9999)) {
      issues.push(issue(ln, "tariffCode", "SWITCH_TARIFF_RANGE", "error",
        `${sw.name}: Tariff Code Out of Range`,
        `Tariff code ${tc} (=${tcNum}) is outside the valid CCSA range (0100-9999).`,
      ));
    }

    // F09c: CPT code accidentally used (5 digits)
    if (/^\d{5}$/.test(tc)) {
      issues.push(issue(ln, "tariffCode", "SWITCH_CPT_DETECTED", "error",
        `${sw.name}: Possible CPT Code`,
        `Code "${tc}" is 5 digits — this looks like a US CPT code. SA uses 4-digit CCSA tariff codes.`,
        `Convert to the SA CCSA equivalent. Example: US CPT 99213 → SA CCSA 0191.`,
      ));
    }
  }

  // ─── RULE F10: NAPPI code format (medicine claims) ──
  if (line.nappiCode) {
    const nappi = line.nappiCode.trim();

    // F10a: Format check (7-digit product + optional 3-digit pack)
    if (!/^\d{7}(\d{3})?$/.test(nappi)) {
      issues.push(issue(ln, "nappiCode", "SWITCH_NAPPI_FORMAT", "error",
        `${sw.name}: Invalid NAPPI Code Format`,
        `NAPPI code "${nappi}" must be 7 digits (product) or 10 digits (product + pack). No check digit, no hyphens.`,
      ));
    }

    // F10b: Healthbridge NAPPI validation
    if (sw.validatesNAPPI && !/^\d{7,10}$/.test(nappi)) {
      issues.push(issue(ln, "nappiCode", "SWITCH_NAPPI_INVALID", "error",
        `${sw.name}: NAPPI Code Will Be Validated`,
        `${sw.name} validates NAPPI codes against the active registry. Ensure "${nappi}" is current (registry updated weekly by MediKredit).`,
      ));
    }

    // F10c: NAPPI without tariff (medicine-only claim needs dispensing tariff)
    if (!line.tariffCode) {
      issues.push(issue(ln, "nappiCode", "SWITCH_NAPPI_NO_TARIFF", "warning",
        `${sw.name}: NAPPI Without Tariff Code`,
        `NAPPI code "${nappi}" submitted without a dispensing tariff code. Most switches require a dispensing fee tariff with medicine claims.`,
      ));
    }
  }

  // ─── RULE F11: Modifier validation ──
  if (line.modifier) {
    const mods = line.modifier.split(/[,;]/).map(m => m.trim()).filter(Boolean);

    // F11a: Too many modifiers
    if (mods.length > sw.maxModifiersPerLine) {
      issues.push(issue(ln, "modifier", "SWITCH_TOO_MANY_MODS", "warning",
        `${sw.name}: Too Many Modifiers`,
        `${mods.length} modifiers on line ${ln}. ${sw.name} accepts max ${sw.maxModifiersPerLine} per line.`,
      ));
    }

    // F11b: Modifier format check (4 digits or special)
    for (const mod of mods) {
      if (!/^\d{4,5}$/.test(mod) && mod !== "PMB") {
        issues.push(issue(ln, "modifier", "SWITCH_MOD_FORMAT", "error",
          `${sw.name}: Invalid Modifier Format`,
          `Modifier "${mod}" is not in valid format. SA modifiers are 4-5 digit codes (e.g., 0002, 09959) or "PMB".`,
        ));
      }
    }

    // F11c: Accepted modifier list per switch
    if (sw.modifierValidation !== "none") {
      const acceptedMods = getModifierList(sw.code);
      for (const mod of mods) {
        if (!acceptedMods.includes(mod)) {
          const severity = sw.modifierValidation === "strict" ? "error" as const : "warning" as const;
          issues.push(issue(ln, "modifier", "SWITCH_INVALID_MODIFIER", severity,
            `${sw.name}: Unrecognised Modifier`,
            `Modifier "${mod}" is not in ${sw.name}'s accepted list. Claim ${sw.modifierValidation === "strict" ? "WILL" : "may"} be rejected.`,
            `Valid modifiers for ${sw.name}: ${acceptedMods.slice(0, 10).join(", ")}...`,
          ));
        }
      }
    }

    // F11d: Conflicting modifiers
    if (mods.includes("0002") && mods.includes("0006")) {
      issues.push(issue(ln, "modifier", "SWITCH_MOD_CONFLICT", "error",
        `${sw.name}: Conflicting Modifiers`,
        `Modifiers 0002 (increased complexity) and 0006 (bilateral) cannot be used together.`,
      ));
    }
    if (mods.includes("0003") && mods.includes("0004")) {
      issues.push(issue(ln, "modifier", "SWITCH_MOD_CONFLICT", "error",
        `${sw.name}: Conflicting Modifiers`,
        `Modifiers 0003 (2nd procedure) and 0004 (3rd procedure) cannot both apply to the same line.`,
      ));
    }
    if (mods.includes("0008") && mods.includes("0009")) {
      issues.push(issue(ln, "modifier", "SWITCH_MOD_CONFLICT", "error",
        `${sw.name}: Conflicting Modifiers`,
        `Modifiers 0008 (professional component) and 0009 (technical/facility) are mutually exclusive.`,
      ));
    }

    // F11e: After-hours modifiers combined
    const afterHoursMods = mods.filter(m => ["0010", "0011", "0012", "0013", "0014"].includes(m));
    if (afterHoursMods.length > 1) {
      issues.push(issue(ln, "modifier", "SWITCH_MOD_MULTIPLE_AH", "error",
        `${sw.name}: Multiple After-Hours Modifiers`,
        `Only one after-hours modifier allowed per line. Found: ${afterHoursMods.join(", ")}. Use the most applicable one.`,
      ));
    }

    // F11f: Modifier without applicable tariff
    if (mods.includes("0015") || mods.includes("0016") || mods.includes("0017")) {
      const tc = parseInt(line.tariffCode ?? "", 10);
      if (tc < 500 || tc > 2999) {
        issues.push(issue(ln, "modifier", "SWITCH_MOD_SURGERY_ONLY", "warning",
          `${sw.name}: Surgical Modifier on Non-Surgical Tariff`,
          `Modifier(s) ${mods.filter(m => ["0015", "0016", "0017"].includes(m)).join(", ")} (assistant/co-surgeon/team) only apply to surgical tariffs (0500-2999). Tariff ${line.tariffCode} is not in that range.`,
        ));
      }
    }
  }

  // ─── RULE F12: Quantity validation ──
  if (line.quantity !== undefined && line.quantity !== null) {
    // F12a: Zero quantity
    if (line.quantity <= 0) {
      issues.push(issue(ln, "quantity", "SWITCH_QUANTITY_ZERO", "error",
        `${sw.name}: Zero/Negative Quantity`,
        `Quantity ${line.quantity} is not valid. Must be at least 1.`,
      ));
    }

    // F12b: Exceeds max
    if (line.quantity > sw.maxQuantityPerLine) {
      issues.push(issue(ln, "quantity", "SWITCH_QUANTITY_MAX", "error",
        `${sw.name}: Quantity Exceeds Maximum`,
        `Quantity ${line.quantity} exceeds ${sw.name}'s maximum of ${sw.maxQuantityPerLine} per line.`,
      ));
    }

    // F12c: Non-integer quantity
    if (!Number.isInteger(line.quantity)) {
      issues.push(issue(ln, "quantity", "SWITCH_QUANTITY_DECIMAL", "warning",
        `${sw.name}: Non-Integer Quantity`,
        `Quantity ${line.quantity} is not a whole number. Most switches require integer quantities.`,
      ));
    }

    // F12d: Consultation with quantity > 1
    if (line.tariffCode) {
      const tc = parseInt(line.tariffCode, 10);
      if (tc >= 100 && tc <= 199 && line.quantity > 1) {
        issues.push(issue(ln, "quantity", "SWITCH_CONSULT_QTY", "error",
          `${sw.name}: Multiple Consultation Quantity`,
          `Consultation tariff ${line.tariffCode} with quantity ${line.quantity}. Consultations must be billed individually (qty=1). Bill each visit as a separate line.`,
        ));
      }
    }
  }

  // ─── RULE F13: Gender field validation ──
  if (line.patientGender) {
    const g = line.patientGender.toUpperCase();
    if (!["M", "F", "U"].includes(g)) {
      issues.push(issue(ln, "patientGender", "SWITCH_GENDER_VALUE", "error",
        `${sw.name}: Invalid Gender Code`,
        `Gender "${line.patientGender}" is not valid. Must be M (male), F (female), or U (unknown). EDIFACT uses single-character codes.`,
      ));
    }
    if (g === "U" && sw.genderCheckEnabled) {
      issues.push(issue(ln, "patientGender", "SWITCH_GENDER_UNKNOWN", "warning",
        `${sw.name}: Unknown Gender`,
        `Gender is "U" (unknown). ${sw.name} requires M or F for gender-specific ICD-10 validation. This may cause gender-check bypasses or queries.`,
      ));
    }
  }

  // ─── RULE F14: Place of service validation ──
  if (sw.requiresPlaceOfService) {
    if (!line.placeOfService || !line.placeOfService.trim()) {
      issues.push(issue(ln, "placeOfService", "SWITCH_POS_MISSING", "warning",
        `${sw.name}: Missing Place of Service`,
        `${sw.name} expects a place of service code (LOC segment). Different tariff rates apply per location.`,
        `Use BHF codes: 11 (office), 21 (hospital inpatient), 22 (outpatient), 23 (ER), 65 (day clinic), 81 (lab).`,
      ));
    } else if (!VALID_PLACE_OF_SERVICE.includes(line.placeOfService.trim())) {
      issues.push(issue(ln, "placeOfService", "SWITCH_POS_INVALID", "error",
        `${sw.name}: Invalid Place of Service Code`,
        `Place of service "${line.placeOfService}" is not a recognized BHF code.`,
        `Valid codes: 11 (office), 12 (home), 21 (hospital), 22 (outpatient), 23 (ER), 41 (ambulance), 65 (day clinic), 81 (lab).`,
      ));
    }
  }

  // ─── RULE F15: Practitioner type validation ──
  if (line.practitionerType) {
    const pt = line.practitionerType.trim().toUpperCase();
    const validTypes = [
      "GP", "SP", "SU", "AN", "RA", "PA", "NU", "PH", "DE", "DH",
      "OT", "PT", "ST", "DT", "PS", "CH", "OP", "AU", "PD", "OR",
      "OB", "CA", "NE", "UR", "EN", "GA", "ON", "RH", "PL", "EM",
    ];
    if (!validTypes.includes(pt) && pt.length > 0) {
      issues.push(issue(ln, "practitionerType", "SWITCH_PRAC_TYPE", "warning",
        `${sw.name}: Unrecognised Practitioner Type`,
        `Practitioner type "${pt}" is not a standard BHF discipline code.`,
      ));
    }
  }

  // ─── RULE F16: Motivation text validation ──
  if (line.motivationText) {
    const mot = line.motivationText.trim();

    // F16a: Too long for EDIFACT FTX segment
    if (mot.length > 350) {
      issues.push(issue(ln, "motivationText", "SWITCH_MOTIVATION_LENGTH", "warning",
        `${sw.name}: Motivation Text Too Long`,
        `Motivation text is ${mot.length} chars. EDIFACT FTX segment max is 350 characters. Text will be truncated.`,
      ));
    }

    // F16b: Character set in motivation
    const forbidden = sw.characterSet === "UNOA" ? UNOA_FORBIDDEN : UNOB_FORBIDDEN;
    if (forbidden.test(mot)) {
      issues.push(issue(ln, "motivationText", "SWITCH_MOTIVATION_CHARS", "warning",
        `${sw.name}: Invalid Characters in Motivation`,
        `Motivation text contains characters outside ${sw.characterSet} charset. These may be stripped during EDIFACT encoding.`,
      ));
    }
  }

  return issues;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PHASE 3 — Clinical Coherence Validation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function validateClinicalCoherence(
  line: ClaimLineItem,
  sw: SwitchboardProfile,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const ln = line.lineNumber;
  const icd = (line.primaryICD10 ?? "").trim().toUpperCase();
  const tc = parseInt(line.tariffCode ?? "", 10);

  // ─── RULE C01: Gender/ICD-10 cross-check ──
  if (sw.genderCheckEnabled && line.patientGender && icd) {
    const gender = line.patientGender.toUpperCase();

    // C01a: Female-only codes on male patient
    if (gender === "M") {
      for (const prefix of FEMALE_ONLY_ICD10_PREFIXES) {
        if (icd.startsWith(prefix)) {
          issues.push(issue(ln, "primaryICD10", "SWITCH_GENDER_ICD10", "error",
            `${sw.name}: Gender/Diagnosis Mismatch`,
            `ICD-10 "${icd}" is female-only but patient gender is Male. ${sw.name} will auto-reject.`,
            `Verify patient gender. If male, use a different ICD-10 code. If female, correct the gender field.`,
          ));
          break;
        }
      }
    }

    // C01b: Male-only codes on female patient
    if (gender === "F") {
      for (const prefix of MALE_ONLY_ICD10_PREFIXES) {
        if (icd.startsWith(prefix)) {
          issues.push(issue(ln, "primaryICD10", "SWITCH_GENDER_ICD10", "error",
            `${sw.name}: Gender/Diagnosis Mismatch`,
            `ICD-10 "${icd}" is male-only but patient gender is Female. ${sw.name} will auto-reject.`,
            `Verify patient gender. If female, use a different ICD-10 code.`,
          ));
          break;
        }
      }
    }
  }

  // ─── RULE C02: Age/ICD-10 cross-check ──
  if (line.patientAge !== undefined && line.patientAge !== null && icd) {
    // C02a: Perinatal codes (P00-P96) — neonates only
    if (icd.startsWith("P") && line.patientAge > 1) {
      issues.push(issue(ln, "primaryICD10", "SWITCH_AGE_ICD10", "error",
        `${sw.name}: Age/Diagnosis Mismatch`,
        `ICD-10 "${icd}" (perinatal) is for neonates (age ≤1). Patient age is ${line.patientAge}.`,
      ));
    }

    // C02b: Obstetric codes (O00-O99) — reproductive age
    if (icd.startsWith("O") && (line.patientAge < 12 || line.patientAge > 55)) {
      issues.push(issue(ln, "primaryICD10", "SWITCH_AGE_ICD10", "warning",
        `${sw.name}: Age/Diagnosis Mismatch`,
        `ICD-10 "${icd}" (pregnancy/childbirth) used for patient age ${line.patientAge}. Expected reproductive age 12-55.`,
      ));
    }

    // C02c: Paediatric tariffs on adult patients
    if (line.patientAge > 18 && line.tariffCode) {
      // Paediatric consultation codes typically in specific ranges
      const paedCodes = ["0170", "0171", "0172", "0173"];
      if (paedCodes.includes(line.tariffCode)) {
        issues.push(issue(ln, "tariffCode", "SWITCH_PAED_ADULT", "warning",
          `${sw.name}: Paediatric Tariff on Adult`,
          `Paediatric tariff ${line.tariffCode} used for patient age ${line.patientAge}. Switch may query.`,
        ));
      }
    }

    // C02d: Geriatric check — dementia codes on young patients
    if (icd.startsWith("F0") && line.patientAge < 40) {
      issues.push(issue(ln, "primaryICD10", "SWITCH_AGE_DEMENTIA", "warning",
        `${sw.name}: Early-Onset Dementia Query`,
        `Dementia code "${icd}" for patient age ${line.patientAge}. Under 40 is unusual — ${sw.name} may flag for clinical review.`,
      ));
    }
  }

  // ─── RULE C03: External Cause Code (ECC) requirement ──
  if (sw.requiresECC && icd) {
    const isInjury = INJURY_PREFIXES.some(p => icd.startsWith(p));
    if (isInjury) {
      const hasECC = line.secondaryICD10?.some(
        sec => ECC_PREFIXES.some(p => sec.trim().toUpperCase().startsWith(p))
      );
      if (!hasECC) {
        issues.push(issue(ln, "secondaryICD10", "SWITCH_MISSING_ECC", "error",
          `${sw.name}: Missing External Cause Code`,
          `Injury code "${icd}" (S/T prefix) MUST have an external cause code (V01-Y98) as secondary. Without ECC, scheme cannot determine liability (RAF/COIDA/scheme). ${sw.name} will auto-reject.`,
          `Add a V/W/X/Y code as secondary ICD-10 explaining HOW the injury occurred (e.g., W19.9 unspecified fall, V89.9 transport accident).`,
        ));
      }
    }
  }

  // ─── RULE C04: Asterisk code as primary (manifestation cannot be primary) ──
  // ICD-10 asterisk codes are manifestation codes — they describe WHERE the disease
  // manifests, not WHAT the disease is. The dagger (†) code must be primary.
  if (icd) {
    // Known asterisk code patterns
    const asteriskPatterns = [
      /^G[0-9]{2}\*/,  // Neurological manifestations
      /^H[0-9]{2}\*/,  // Eye/ear manifestations
      /^M[0-9]{2}\*/,  // Musculoskeletal manifestations
      /^N[0-9]{2}\*/,  // Urogenital manifestations
    ];
    // More practically, check if the code has a known asterisk pattern in its category
    // This is a simplified check — full validation is in the ICD-10 database
    const asteriskCategories = [
      "G01", "G02", "G05", "G07", "G13", "G22", "G26", "G32", "G46", "G53", "G55", "G59", "G63", "G73", "G94", "G99",
      "H03", "H06", "H13", "H19", "H22", "H28", "H32", "H36", "H42", "H45", "H48", "H58", "H62", "H67", "H75", "H82", "H94",
      "I32", "I39", "I41", "I43", "I52", "I68", "I79", "I98",
      "J17", "J91", "J99",
      "K23", "K67", "K77", "K87", "K93",
      "L14", "L45", "L54", "L62", "L86", "L99",
      "M01", "M03", "M07", "M09", "M14", "M36", "M49", "M63", "M68", "M73", "M82", "M90",
      "N08", "N16", "N22", "N29", "N33", "N37", "N51", "N74", "N77",
    ];
    const icd3 = icd.substring(0, 3);
    if (asteriskCategories.includes(icd3)) {
      issues.push(issue(ln, "primaryICD10", "SWITCH_ASTERISK_PRIMARY", "error",
        `${sw.name}: Manifestation Code as Primary`,
        `"${icd}" (category ${icd3}) is an asterisk/manifestation code and CANNOT be used as primary ICD-10. The underlying disease (dagger/†) code must be primary, with the manifestation code as secondary.`,
        `Swap the codes: put the underlying disease as primary ICD-10 and "${icd}" as secondary.`,
      ));
    }
  }

  // ─── RULE C05: Tariff/ICD-10 discipline mismatch ──
  if (sw.tariffDisciplineCheck && icd && line.tariffCode && !isNaN(tc)) {
    // C05a: Dental tariff with non-dental diagnosis
    if (tc >= 8100 && tc <= 8899 && !icd.startsWith("K0") && !icd.startsWith("K1") &&
        !icd.startsWith("S02") && !icd.startsWith("K00") && !icd.startsWith("K01") &&
        !icd.startsWith("K02") && !icd.startsWith("K03") && !icd.startsWith("K04") &&
        !icd.startsWith("K05") && !icd.startsWith("K06") && !icd.startsWith("K07") &&
        !icd.startsWith("K08") && !icd.startsWith("K09") && !icd.startsWith("K10") &&
        !icd.startsWith("K11") && !icd.startsWith("K12") && !icd.startsWith("K13") &&
        !icd.startsWith("K14") && !icd.startsWith("Z01.2")) {
      issues.push(issue(ln, "tariffCode", "SWITCH_DENTAL_MISMATCH", "warning",
        `${sw.name}: Dental Tariff with Non-Dental Diagnosis`,
        `Dental tariff ${line.tariffCode} paired with non-dental ICD-10 "${icd}". Dental procedures typically require K00-K14 (dental/oral) codes.`,
      ));
    }

    // C05b: Pathology tariff without relevant diagnosis or screening code
    if (tc >= 4200 && tc <= 4799 && icd.startsWith("Z") && !["Z00", "Z01", "Z11", "Z12", "Z13", "Z36"].some(p => icd.startsWith(p))) {
      issues.push(issue(ln, "tariffCode", "SWITCH_PATH_ZCODE", "info",
        `${sw.name}: Pathology with Z-Code`,
        `Pathology tariff ${line.tariffCode} with Z-code "${icd}". If not a screening test, consider using a clinical diagnosis code.`,
      ));
    }

    // C05c: Anaesthesia tariff without surgical code on same date
    if (tc >= 400 && tc <= 499) {
      issues.push(issue(ln, "tariffCode", "SWITCH_ANAES_STANDALONE", "info",
        `${sw.name}: Anaesthesia Code`,
        `Anaesthesia tariff ${line.tariffCode} — ensure there is a corresponding surgical procedure on the same date. Anaesthesia without surgery will be queried.`,
      ));
    }

    // C05d: Surgical tariff on outpatient consultation diagnosis
    if (tc >= 500 && tc <= 2999) {
      const consultDiagnoses = ["Z00", "Z01", "Z02", "Z76"];
      if (consultDiagnoses.some(p => icd.startsWith(p))) {
        issues.push(issue(ln, "tariffCode", "SWITCH_SURGERY_SCREENING", "warning",
          `${sw.name}: Surgical Tariff with Screening Diagnosis`,
          `Surgical tariff ${line.tariffCode} paired with screening/examination code "${icd}". Surgery requires a clinical indication, not a screening code.`,
        ));
      }
    }
  }

  // ─── RULE C06: Amount reasonableness per tariff category ──
  if (line.amount && line.tariffCode && !isNaN(tc)) {
    // C06a: Consultation amount outlier
    if (tc >= 100 && tc <= 199) {
      if (line.amount > 5000) {
        issues.push(issue(ln, "amount", "SWITCH_CONSULT_AMOUNT", "warning",
          `${sw.name}: Consultation Amount Unusually High`,
          `R${line.amount.toFixed(2)} for consultation ${line.tariffCode}. Typical range R280-R1,800. ${sw.name} may flag for review.`,
        ));
      }
      if (line.amount < 50) {
        issues.push(issue(ln, "amount", "SWITCH_CONSULT_LOW", "warning",
          `${sw.name}: Consultation Amount Unusually Low`,
          `R${line.amount.toFixed(2)} for consultation ${line.tariffCode}. Below typical minimum. Verify amount.`,
        ));
      }
    }

    // C06b: Pathology amount outlier
    if (tc >= 4200 && tc <= 4799 && line.amount > 10000) {
      issues.push(issue(ln, "amount", "SWITCH_PATH_AMOUNT", "warning",
        `${sw.name}: Pathology Amount Unusually High`,
        `R${line.amount.toFixed(2)} for pathology ${line.tariffCode}. Most path tests are under R1,000. Verify amount.`,
      ));
    }

    // C06c: Radiology amount check
    if (tc >= 3600 && tc <= 4099 && line.amount > 50000) {
      issues.push(issue(ln, "amount", "SWITCH_RAD_AMOUNT", "info",
        `${sw.name}: Radiology Amount Elevated`,
        `R${line.amount.toFixed(2)} for radiology ${line.tariffCode}. High-end but within range for PET/CT/MRI with contrast. Verify.`,
      ));
    }
  }

  // ─── RULE C07: Morphology code requirement for neoplasms ──
  if (icd) {
    // C/D codes (neoplasms) with surgical/pathology tariff should have morphology
    const isNeoplasm = /^[CD][0-4]/.test(icd) || /^D[0-4]/.test(icd);
    if (isNeoplasm && line.tariffCode) {
      if ((tc >= 500 && tc <= 2999) || (tc >= 4200 && tc <= 4799)) {
        // Check for morphology in secondary codes
        const hasMorphology = line.secondaryICD10?.some(s => /^M\d{4}/.test(s));
        if (!hasMorphology && sw.code === "HB") {
          issues.push(issue(ln, "secondaryICD10", "SWITCH_NEOPLASM_MORPH", "info",
            `${sw.name}: Neoplasm Without Morphology`,
            `Neoplasm code "${icd}" with surgery/pathology but no morphology code. Consider adding M-code for histological type (e.g., M8010/3 for carcinoma NOS).`,
          ));
        }
      }
    }
  }

  // ─── RULE C08: Chronic medication rules ──
  if (line.nappiCode && icd) {
    // CDL condition codes with medication
    const cdlPrefixes = [
      "E10", "E11", "E13", "E14", // Diabetes
      "I10", "I11", "I12", "I13", "I15", // Hypertension
      "J45", // Asthma
      "E78", // Hyperlipidaemia
      "M05", "M06", // Rheumatoid arthritis
      "L40", // Psoriasis
      "B20", "B21", "B22", "B23", "B24", // HIV
      "G40", // Epilepsy
      "F20", // Schizophrenia
      "F31", // Bipolar
    ];
    const isCDL = cdlPrefixes.some(p => icd.startsWith(p));
    if (isCDL && !line.modifier?.includes("PMB")) {
      issues.push(issue(ln, "modifier", "SWITCH_CDL_NO_PMB", "info",
        `${sw.name}: CDL Condition Without PMB Modifier`,
        `ICD-10 "${icd}" is a Chronic Disease List condition with medicine. Consider adding PMB modifier if this is a PMB-level benefit claim.`,
      ));
    }
  }

  // ─── RULE C09: Consultation + procedure same day (unbundling check) ──
  // This is checked at batch level in B08 but also per-line for modifier validation
  if (line.tariffCode && !isNaN(tc)) {
    // Consultation with procedure modifier check
    if (tc >= 100 && tc <= 199 && line.modifier) {
      const mods = line.modifier.split(/[,;]/).map(m => m.trim());
      if (!mods.includes("0021") && !mods.includes("0019")) {
        // Info — the batch-level check is more comprehensive
        issues.push(issue(ln, "tariffCode", "SWITCH_CONSULT_PROCEDURE_HINT", "info",
          `${sw.name}: Consultation May Need Modifier`,
          `Consultation ${line.tariffCode} — if billed with a procedure on the same day, add modifier 0021 (decision for surgery) or use a different ICD-10 to justify separate billing.`,
        ));
      }
    }
  }

  // ─── RULE C10: Emergency codes without after-hours modifier ──
  if (icd && line.tariffCode && !isNaN(tc)) {
    const emergencyCodes = ["R57", "I21", "I46", "J96", "G41", "T78.2"];
    const isEmergency = emergencyCodes.some(e => icd.startsWith(e));
    if (isEmergency && line.placeOfService === "23") { // ER
      const hasAfterHours = line.modifier?.split(/[,;]/).some(
        m => ["0010", "0011", "0012", "0013", "0014", "0018"].includes(m.trim())
      );
      if (!hasAfterHours) {
        issues.push(issue(ln, "modifier", "SWITCH_ER_NO_AH", "info",
          `${sw.name}: ER Claim Without After-Hours`,
          `Emergency diagnosis "${icd}" in ER (place of service 23) without after-hours modifier. If rendered after hours, add modifier 0011/0012/0013/0014 for appropriate rate.`,
        ));
      }
    }
  }

  // ─── RULE C11: Bilateral modifier without bilateral-eligible procedure ──
  if (line.modifier?.includes("0006") && line.tariffCode && !isNaN(tc)) {
    // Only surgical and some radiology procedures can be bilateral
    if (tc < 500 && tc >= 100 && tc <= 199) {
      issues.push(issue(ln, "modifier", "SWITCH_BILATERAL_INVALID", "error",
        `${sw.name}: Bilateral Modifier on Consultation`,
        `Modifier 0006 (bilateral) on consultation code ${line.tariffCode}. Bilateral only applies to surgical/procedural tariffs.`,
      ));
    }
  }

  // ─── RULE C12: Telehealth modifier validation ──
  if (line.modifier) {
    const mods = line.modifier.split(/[,;]/).map(m => m.trim());
    if (mods.includes("0023") || mods.includes("0026")) {
      // Telehealth can't be used with facility-based procedures
      if (line.placeOfService && ["21", "22", "23", "41", "65"].includes(line.placeOfService)) {
        issues.push(issue(ln, "modifier", "SWITCH_TELEHEALTH_FACILITY", "error",
          `${sw.name}: Telehealth with Facility Setting`,
          `Telehealth modifier used but place of service is "${line.placeOfService}" (facility). Telehealth claims must use place of service 11 (office) or 12 (home).`,
        ));
      }
      // Telehealth only valid for consultations and certain allied health
      if (line.tariffCode && !isNaN(tc) && tc >= 500 && tc <= 2999) {
        issues.push(issue(ln, "modifier", "SWITCH_TELEHEALTH_SURGERY", "error",
          `${sw.name}: Telehealth on Surgical Procedure`,
          `Telehealth modifier on surgical tariff ${line.tariffCode}. Telehealth is only valid for consultations and select allied health services.`,
        ));
      }
    }
  }

  // ─── RULE C13: Scheme routing validation ──
  if (line.scheme) {
    const scheme = line.scheme.toUpperCase();
    const healthbridgeSchemes = ["DH", "BON", "MH", "BK", "LA", "DISCOVERY", "BONITAS", "MEDIHELP", "BANKMED", "ANGLO"];
    const switchonSchemes = ["GEMS", "MOM", "BM", "FH", "POL", "SH", "MOMENTUM", "BESTMED", "FEDHEALTH", "POLMED", "SIZWE"];
    const mediswitchSchemes = ["CC", "MS", "PPS", "KH", "PR", "COMPCARE", "MEDSHIELD", "KEYHEALTH", "PROFMED"];

    let expectedSwitch: string | undefined;
    if (healthbridgeSchemes.some(s => scheme.includes(s))) expectedSwitch = "Healthbridge";
    else if (switchonSchemes.some(s => scheme.includes(s))) expectedSwitch = "SwitchOn";
    else if (mediswitchSchemes.some(s => scheme.includes(s))) expectedSwitch = "MediSwitch / MediKredit";

    if (expectedSwitch && expectedSwitch !== sw.name) {
      issues.push(issue(ln, "scheme", "SWITCH_WRONG_ROUTE", "error",
        `${sw.name}: Wrong Switching House for Scheme`,
        `Scheme "${line.scheme}" should be routed via ${expectedSwitch}, not ${sw.name}. Claim will be rejected — wrong clearing house.`,
        `Route to ${expectedSwitch} instead.`,
      ));
    }
  }

  // ─── RULE C14: Multiple procedures — declining modifier sequence ──
  if (line.modifier && line.tariffCode && !isNaN(tc) && tc >= 500 && tc <= 2999) {
    const mods = line.modifier.split(/[,;]/).map(m => m.trim());
    const multiProcMods = mods.filter(m => ["0003", "0004", "0005"].includes(m));
    if (multiProcMods.length > 1) {
      issues.push(issue(ln, "modifier", "SWITCH_MULTI_PROC_STACK", "error",
        `${sw.name}: Multiple Procedure Modifiers Stacked`,
        `Multiple procedure modifiers (${multiProcMods.join(", ")}) on same line. Use only one: 0003 (2nd procedure -50%), 0004 (3rd -75%), 0005 (4th+ -80%).`,
      ));
    }
  }

  // ─── RULE C15: Radiology with contrast — modifier check ──
  if (line.tariffCode && !isNaN(tc) && (tc >= 3900 && tc <= 4099)) {
    // CT/MRI with contrast should have modifier 0007
    const icdSuggestsContrast = icd && /^(C|D|I|G)/.test(icd); // Neoplasm, vascular, neuro
    if (icdSuggestsContrast && line.amount && line.amount > 5000) {
      const hasContrast = line.modifier?.includes("0007");
      if (!hasContrast) {
        issues.push(issue(ln, "modifier", "SWITCH_CONTRAST_MODIFIER", "info",
          `${sw.name}: CT/MRI May Need Contrast Modifier`,
          `High-value CT/MRI (${line.tariffCode}, R${line.amount.toFixed(2)}) with diagnosis "${icd}" — if performed with contrast, add modifier 0007 for appropriate rate (+25-40%).`,
        ));
      }
    }
  }

  // ─── RULE C16: Surgical global period awareness ──
  if (line.tariffCode && !isNaN(tc) && tc >= 500 && tc <= 2999) {
    issues.push(issue(ln, "tariffCode", "SWITCH_GLOBAL_PERIOD", "info",
      `${sw.name}: Surgical Global Period`,
      `Surgical tariff ${line.tariffCode} — routine follow-up visits during the global period (minor: 0-10 days, intermediate: 21 days, major: 42-90 days) are NOT separately billable. Complications and unrelated visits ARE billable with modifier 0019.`,
    ));
  }

  // ─── RULE C17: VAT on medical services ──
  if (line.amount && line.tariffCode && !isNaN(tc)) {
    // Dispensing/medicine claims may include VAT; professional services generally exempt
    if (line.nappiCode && line.amount > 0) {
      // No validation needed — just informational
    } else if (tc >= 100 && tc <= 6999) {
      // Professional services — VAT is inclusive per PHISC spec
      // No separate check needed — the EDIFACT format handles VAT
    }
  }

  // ─── RULE C18: Allied health session limits awareness ──
  if (line.tariffCode && !isNaN(tc) && tc >= 6000 && tc <= 6999) {
    const alliedLimits: Record<string, { name: string; limit: string }> = {
      "60": { name: "Physiotherapy", limit: "12-15 sessions/year" },
      "61": { name: "Occupational Therapy", limit: "12-15 sessions/year" },
      "62": { name: "Speech Therapy", limit: "12 sessions/year" },
      "63": { name: "Dietetics", limit: "3-6 sessions/year" },
      "64": { name: "Psychology", limit: "15-21 sessions/year" },
      "65": { name: "Chiropractic", limit: "12 sessions/year" },
    };
    const prefix = line.tariffCode.substring(0, 2);
    const allied = alliedLimits[prefix];
    if (allied) {
      issues.push(issue(ln, "tariffCode", "SWITCH_ALLIED_LIMIT", "info",
        `${sw.name}: ${allied.name} Session Limit`,
        `${allied.name} tariff ${line.tariffCode} — most schemes limit to ${allied.limit}. Exceeding limits will trigger scheme-level rejection.`,
      ));
    }
  }

  // ─── RULE C19: Maternity diagnosis without hospital setting ──
  if (icd && icd.startsWith("O8") && line.placeOfService) {
    const deliveryCodes = ["O80", "O81", "O82", "O83", "O84"];
    if (deliveryCodes.some(c => icd.startsWith(c))) {
      if (!["21", "22", "23", "65", "2"].includes(line.placeOfService)) {
        issues.push(issue(ln, "placeOfService", "SWITCH_DELIVERY_SETTING", "warning",
          `${sw.name}: Delivery Outside Facility`,
          `Delivery code "${icd}" with place of service "${line.placeOfService}" (not hospital/facility). Most deliveries require facility setting (21/22/23/65).`,
        ));
      }
    }
  }

  // ─── RULE C20: HIV codes require specific handling ──
  if (icd && (icd.startsWith("B20") || icd.startsWith("B21") || icd.startsWith("B22") || icd.startsWith("B23") || icd.startsWith("B24"))) {
    // HIV is a CDL condition — PMB rules apply
    if (!line.modifier?.includes("PMB")) {
      issues.push(issue(ln, "primaryICD10", "SWITCH_HIV_PMB", "info",
        `${sw.name}: HIV Diagnosis — PMB Consideration`,
        `HIV code "${icd}" is a CDL condition with PMB rights. If this is a PMB-level service, add PMB modifier. Scheme must fund at DSP rate regardless of benefit limits.`,
      ));
    }
    // HIV testing vs treatment — different coding
    if (line.tariffCode === "4210" || line.tariffCode === "4211") {
      issues.push(issue(ln, "primaryICD10", "SWITCH_HIV_TEST_CODE", "info",
        `${sw.name}: HIV Test with HIV Diagnosis`,
        `HIV test tariff ${line.tariffCode} with confirmed HIV diagnosis. If this is a monitoring test (viral load/CD4), the confirmed HIV code is correct. If initial screening, use Z11.4 instead of B2x.`,
      ));
    }
  }

  // ─── RULE C21: IOD/WCA claim validation ──
  if (line.isIOD) {
    if (!line.accidentDate) {
      issues.push(issue(ln, "accidentDate", "SWITCH_IOD_NO_ACCIDENT", "error",
        `${sw.name}: IOD Without Accident Date`,
        `Injured on Duty claim flagged but no accident date (DTM+290) provided. WCA claims require the date of injury.`,
      ));
    }
    const injuryCodes = ["S", "T", "M", "G"];
    if (!injuryCodes.some(p => icd.startsWith(p))) {
      issues.push(issue(ln, "primaryICD10", "SWITCH_IOD_DIAGNOSIS", "warning",
        `${sw.name}: IOD with Non-Injury Diagnosis`,
        `IOD claim with diagnosis "${icd}" — expected S/T (injury) codes for workplace injury. Verify diagnosis matches the injury event.`,
      ));
    }
  }

  // ─── RULE C22: MVA/third-party claim validation ──
  if (line.isMVA) {
    if (!line.accidentDate) {
      issues.push(issue(ln, "accidentDate", "SWITCH_MVA_NO_ACCIDENT", "error",
        `${sw.name}: MVA Without Accident Date`,
        `Motor vehicle accident claim requires DTM+290 (accident date). RAF liability determination depends on this.`,
      ));
    }
    // MVA claims should have V01-V99 as ECC
    const hasVCode = line.secondaryICD10?.some(s => s.trim().toUpperCase().startsWith("V"));
    if (!hasVCode) {
      issues.push(issue(ln, "secondaryICD10", "SWITCH_MVA_NO_VCODE", "warning",
        `${sw.name}: MVA Without Transport ECC`,
        `MVA claim without V-code (V01-V99, transport accident). Add the specific V-code as secondary ICD-10 for RAF/insurer processing.`,
      ));
    }
  }

  // ─── RULE C23: Maternity flag validation ──
  if (line.isMaternity) {
    if (!icd.startsWith("O") && !icd.startsWith("Z3")) {
      issues.push(issue(ln, "primaryICD10", "SWITCH_MAT_DIAGNOSIS", "warning",
        `${sw.name}: Maternity Flag with Non-Maternity Diagnosis`,
        `Maternity flag set (RFF+MAT) but ICD-10 "${icd}" is not an obstetric (O00-O99) or pregnancy screening (Z3x) code.`,
      ));
    }
  }

  // ─── RULE C24: Hospital outpatient flag ──
  if (line.isOutpatient && line.admissionDate) {
    issues.push(issue(ln, "admissionDate", "SWITCH_OUTPATIENT_ADMISSION", "warning",
      `${sw.name}: Outpatient with Admission Date`,
      `Outpatient flag set (RFF+OUT) but admission date provided. Outpatient claims should not have DTM+194. Remove admission date or change to inpatient.`,
    ));
  }

  // ─── RULE C25: Prescription number for pharmacy claims ──
  if (line.nappiCode && line.practitionerType?.toUpperCase() === "PH") {
    if (!line.prescriptionNumber) {
      issues.push(issue(ln, "prescriptionNumber", "SWITCH_RX_MISSING", "info",
        `${sw.name}: Pharmacy Claim Without Prescription Number`,
        `Pharmacy dispensing without RFF+PRE (prescription number). Some schemes require prescription reference for audit trail.`,
      ));
    }
  }

  // ─── RULE C26: Deposit/patient payment validation ──
  if (line.depositAmount !== undefined && line.depositAmount !== null) {
    if (line.depositAmount < 0) {
      issues.push(issue(ln, "depositAmount", "SWITCH_DEPOSIT_NEGATIVE", "error",
        `${sw.name}: Negative Deposit Amount`,
        `Deposit/patient payment R${line.depositAmount.toFixed(2)} is negative. PAT+14 amount must be zero or positive.`,
      ));
    }
    if (line.amount && line.depositAmount > line.amount) {
      issues.push(issue(ln, "depositAmount", "SWITCH_DEPOSIT_EXCEEDS", "warning",
        `${sw.name}: Deposit Exceeds Claim Amount`,
        `Patient deposit R${line.depositAmount.toFixed(2)} exceeds claim amount R${line.amount.toFixed(2)}. Patient may be due a refund.`,
      ));
    }
  }

  return issues;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PHASE 4 — Switch-Specific Rules (per-switch quirks and requirements)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function validateSwitchSpecific(
  line: ClaimLineItem,
  sw: SwitchboardProfile,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const ln = line.lineNumber;
  const icd = (line.primaryICD10 ?? "").trim().toUpperCase();
  const tc = parseInt(line.tariffCode ?? "", 10);

  // ─── Healthbridge-specific rules ──
  if (sw.code === "HB") {
    // HB01: Healthbridge requires patient DOB via RFF+AHI (ID number)
    // The ID number contains DOB — if missing, Healthbridge can't validate age
    // (This is implicit from the required fields but worth flagging)

    // HB02: Healthbridge strict ICD-10 specificity for secondary codes too
    if (line.secondaryICD10) {
      for (const sec of line.secondaryICD10) {
        if (/^[A-Z]\d{2}$/i.test(sec.trim())) {
          issues.push(issue(ln, "secondaryICD10", "HB_SEC_SPECIFICITY", "error",
            `Healthbridge: Secondary ICD-10 Insufficient Specificity`,
            `Secondary code "${sec}" is only 3 characters. Healthbridge requires 4+ character specificity for ALL ICD-10 codes, including secondaries.`,
          ));
        }
      }
    }

    // HB03: Healthbridge requires treating provider number different from practice
    // (NAD+TDN vs NAD+SUP — treating doctor BHF vs practice BHF)

    // HB04: Healthbridge validates scheme code in NAD+SCH
    if (line.scheme) {
      const scheme = line.scheme.trim().toUpperCase();
      const healthbridgeAccepted = ["DH", "BON", "MH", "BK", "LA", "AM"];
      if (healthbridgeAccepted.length > 0 && !healthbridgeAccepted.some(s => scheme.includes(s))) {
        issues.push(issue(ln, "scheme", "HB_SCHEME_UNKNOWN", "warning",
          `Healthbridge: Unknown Scheme Code`,
          `Scheme "${line.scheme}" is not in Healthbridge's primary routing list. Verify the scheme routes through Healthbridge.`,
        ));
      }
    }

    // HB05: Healthbridge clawback risk for high-value claims
    if (line.amount && line.amount > 10000) {
      issues.push(issue(ln, "amount", "HB_CLAWBACK_RISK", "info",
        `Healthbridge: Clawback Risk`,
        `R${line.amount.toFixed(2)} — Discovery (via Healthbridge) is known to claw back payments months/years later. Ensure clinical motivation is thorough.`,
      ));
    }

    // HB06: Healthbridge NAPPI code cross-reference
    if (line.nappiCode && line.tariffCode && !isNaN(tc)) {
      // Dispensing codes should match discipline
      if (tc < 8100 && tc >= 100 && !line.practitionerType?.toUpperCase().includes("PH")) {
        issues.push(issue(ln, "nappiCode", "HB_NAPPI_DISCIPLINE", "info",
          `Healthbridge: Medicine Claim Without Pharmacy Practitioner`,
          `NAPPI code with non-pharmacy practitioner type. If dispensing from rooms, ensure BHF dispensing licence is active.`,
        ));
      }
    }
  }

  // ─── MediSwitch / MediKredit-specific rules ──
  if (sw.code === "MS") {
    // MS01: MediKredit X-Practice-Number header requirement
    if (line.practiceNumber) {
      // X-Practice-Number must match the NAD+SUP segment
      // This is more of an integration concern but worth flagging format issues
    }

    // MS02: MediKredit allows credit notes (negative amounts)
    if (line.amount && line.amount < 0) {
      issues.push(issue(ln, "amount", "MS_CREDIT_NOTE", "info",
        `MediSwitch: Credit Note Detected`,
        `Negative amount R${line.amount.toFixed(2)} — MediSwitch accepts credit notes but requires a reference to the original claim number (DCR+ADJ or DCR+REV).`,
      ));
    }

    // MS03: MediKredit extended batch size comes with stricter duplicate checking
    if (line.amount && line.amount === 0) {
      issues.push(issue(ln, "amount", "MS_ZERO_AMOUNT", "warning",
        `MediSwitch: Zero Amount Claim`,
        `R0.00 claim line. MediSwitch accepts zero-amount lines for tracking purposes but the scheme may reject.`,
      ));
    }

    // MS04: MediKredit PMB flagging
    if (line.modifier?.includes("PMB") && !icd) {
      issues.push(issue(ln, "modifier", "MS_PMB_NO_ICD", "error",
        `MediSwitch: PMB Modifier Without Diagnosis`,
        `PMB modifier used but no ICD-10 code provided. PMB claims require a diagnosis to validate PMB status.`,
      ));
    }
  }

  // ─── SwitchOn / Altron-specific rules ──
  if (sw.code === "SO") {
    // SO01: SwitchOn shorter claim window
    if (line.dateOfService) {
      const dos = new Date(line.dateOfService);
      if (!isNaN(dos.getTime())) {
        const days = Math.floor((new Date().getTime() - dos.getTime()) / 86400000);
        if (days > 60 && days <= 90) {
          issues.push(issue(ln, "dateOfService", "SO_WINDOW_WARNING", "warning",
            `SwitchOn: Approaching Claim Window`,
            `Claim is ${days} days old. SwitchOn's 90-day window is shorter than the standard 120 days. Only ${90 - days} days remaining.`,
          ));
        }
      }
    }

    // SO02: SwitchOn smaller batch limits
    // (Handled in batch-level validation)

    // SO03: SwitchOn doesn't validate NAPPI — but the scheme still will
    if (line.nappiCode) {
      issues.push(issue(ln, "nappiCode", "SO_NAPPI_PASSTHROUGH", "info",
        `SwitchOn: NAPPI Not Validated at Switch`,
        `SwitchOn passes NAPPI codes through without validation. The scheme (GEMS, Momentum, etc.) will still validate — ensure the code is in the active registry.`,
      ));
    }

    // SO04: SwitchOn no gender validation — but scheme may still check
    if (line.patientGender && icd) {
      const gender = line.patientGender.toUpperCase();
      const mismatch = (gender === "M" && FEMALE_ONLY_ICD10_PREFIXES.some(p => icd.startsWith(p))) ||
                       (gender === "F" && MALE_ONLY_ICD10_PREFIXES.some(p => icd.startsWith(p)));
      if (mismatch) {
        issues.push(issue(ln, "primaryICD10", "SO_GENDER_PASSTHROUGH", "warning",
          `SwitchOn: Gender Mismatch (Not Caught at Switch)`,
          `Gender "${gender}" conflicts with ICD-10 "${icd}". SwitchOn doesn't validate gender, but the scheme WILL reject this.`,
          `Fix the gender/ICD-10 mismatch before submission. SwitchOn won't catch it, but the scheme will.`,
        ));
      }
    }

    // SO05: SwitchOn GEMS-specific rules (GEMS is the largest SwitchOn scheme)
    if (line.scheme?.toUpperCase().includes("GEMS")) {
      // GEMS uses 9-digit membership numbers with leading zeros
      if (line.membershipNumber && !/^\d{9}$/.test(line.membershipNumber.trim())) {
        issues.push(issue(ln, "membershipNumber", "SO_GEMS_MEMBER_FORMAT", "warning",
          `SwitchOn (GEMS): Membership Number Format`,
          `GEMS uses 9-digit membership numbers with leading zeros. "${line.membershipNumber}" may not match GEMS format.`,
        ));
      }
    }
  }

  // ─── Cross-switch rules (apply to all) ──

  // CS01: Resubmission detection
  // If a claim has a correction type reference, validate it
  // (This would typically come from batch-level metadata)

  // CS02: Tariff code 0000 (placeholder/invalid)
  if (line.tariffCode === "0000") {
    issues.push(issue(ln, "tariffCode", "SWITCH_TARIFF_ZERO", "error",
      `${sw.name}: Invalid Tariff Code 0000`,
      `Tariff code "0000" is a placeholder/invalid code. Replace with actual CCSA procedure code.`,
    ));
  }

  // CS03: ICD-10 code "Z99.9" (placeholder overuse)
  if (icd === "Z99.9" || icd === "Z76.9" || icd === "R69") {
    issues.push(issue(ln, "primaryICD10", "SWITCH_PLACEHOLDER_ICD10", "warning",
      `${sw.name}: Placeholder/Unspecified ICD-10`,
      `"${icd}" is commonly used as a placeholder. Switches increasingly flag these as insufficient coding. Use a specific diagnosis.`,
    ));
  }

  // CS04: Sequela codes (late effects) — need primary + sequela
  if (icd && /\.\d*[1-4]$/.test(icd) && icd.startsWith("T")) {
    issues.push(issue(ln, "primaryICD10", "SWITCH_SEQUELA", "info",
      `${sw.name}: Possible Sequela Code`,
      `"${icd}" may be a sequela/late effect code. If so, add the current condition being treated as a secondary code.`,
    ));
  }

  // CS05: Fracture codes need 7th character extension in some versions
  if (icd && /^S[0-9]{2}\.[0-9]$/.test(icd)) {
    // SA WHO ICD-10 may not require 7th character, but specificity helps
    if (sw.requiresSpecificity) {
      issues.push(issue(ln, "primaryICD10", "SWITCH_FRACTURE_SPECIFICITY", "info",
        `${sw.name}: Fracture Code May Need Extension`,
        `Fracture code "${icd}" — consider adding extension for initial encounter, subsequent encounter, or sequela if available in the MIT.`,
      ));
    }
  }

  return issues;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PHASE 5 — EDIFACT Structural Validation (wire format rules)
// Source: PHISC MEDCLM v0-912-13.4, pages 3-51
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function validateEDIFACTStructure(
  lines: ClaimLineItem[],
  sw: SwitchboardProfile,
  meta?: ClaimBatchMetadata,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const ln = lines[0]?.lineNumber ?? 0;

  // ─── E01: UNH message reference number ──
  if (meta?.messageReferenceNumber) {
    const ref = meta.messageReferenceNumber;
    if (ref.length > 14) {
      issues.push(issue(ln, "edifact", "EDIFACT_UNH_REF_LENGTH", "error",
        `${sw.name}: UNH Message Reference Too Long`,
        `Message reference "${ref}" is ${ref.length} chars. PHISC spec limits UNH 0062 to max 14 alphanumeric characters.`,
      ));
    }
    if (!/^[A-Za-z0-9]+$/.test(ref)) {
      issues.push(issue(ln, "edifact", "EDIFACT_UNH_REF_CHARS", "error",
        `${sw.name}: UNH Message Reference Invalid Characters`,
        `Message reference "${ref}" contains non-alphanumeric characters. UNH 0062 is an..14.`,
      ));
    }
  }

  // ─── E02: BGM batch number (18 digits zero-filled) ──
  if (meta?.batchNumber) {
    const bn = meta.batchNumber;
    if (!/^\d{18}$/.test(bn)) {
      issues.push(issue(ln, "edifact", "EDIFACT_BGM_BATCH_FORMAT", "error",
        `${sw.name}: BGM Batch Number Format`,
        `Batch number "${bn}" must be exactly 18 digits, zero-filled. Per PHISC spec: "Usage is 18 digits zero filled".`,
        `Pad with leading zeros: ${bn.padStart(18, "0")}`,
      ));
    }
  } else if (sw.requiresBatchControlTotals) {
    issues.push(issue(ln, "edifact", "EDIFACT_BGM_MISSING", "error",
      `${sw.name}: Missing BGM Batch Number`,
      `BGM segment with batch number is mandatory for all suppliers. Required by PHISC MEDCLM spec.`,
    ));
  }

  // ─── E03: BGM creation date (DTM qualifier 97) ──
  if (meta?.batchCreationDate) {
    const dt = meta.batchCreationDate;
    if (!/^\d{8}$/.test(dt) && !/^\d{12}$/.test(dt)) {
      issues.push(issue(ln, "edifact", "EDIFACT_BGM_DATE_FORMAT", "error",
        `${sw.name}: BGM Creation Date Format`,
        `Creation date "${dt}" must be CCYYMMDD (8 digits, format 102) or CCYYMMDDHHMM (12 digits, format 203).`,
      ));
    }
  }

  // ─── E04: DTM segment date format validation ──
  for (const line of lines) {
    if (line.dateOfService) {
      const dos = line.dateOfService.replace(/-/g, "");
      // CCYYMMDD: year 2000-2099, month 01-12, day 01-31
      if (/^\d{8}$/.test(dos)) {
        const year = parseInt(dos.substring(0, 4), 10);
        const month = parseInt(dos.substring(4, 6), 10);
        const day = parseInt(dos.substring(6, 8), 10);
        if (month < 1 || month > 12) {
          issues.push(issue(line.lineNumber, "dateOfService", "EDIFACT_DTM_MONTH", "error",
            `${sw.name}: DTM Invalid Month`,
            `Month ${month} in date "${dos}" is out of range (01-12). CCYYMMDD format requires valid month.`,
          ));
        }
        if (day < 1 || day > 31) {
          issues.push(issue(line.lineNumber, "dateOfService", "EDIFACT_DTM_DAY", "error",
            `${sw.name}: DTM Invalid Day`,
            `Day ${day} in date "${dos}" is out of range (01-31). CCYYMMDD format requires valid day.`,
          ));
        }
        if (year < 2000 || year > 2099) {
          issues.push(issue(line.lineNumber, "dateOfService", "EDIFACT_DTM_YEAR", "warning",
            `${sw.name}: DTM Unusual Year`,
            `Year ${year} in date "${dos}" is outside expected range (2000-2099).`,
          ));
        }
        // Month-day validity (Feb 30, etc.)
        const parsed = new Date(year, month - 1, day);
        if (parsed.getMonth() !== month - 1 || parsed.getDate() !== day) {
          issues.push(issue(line.lineNumber, "dateOfService", "EDIFACT_DTM_INVALID_DATE", "error",
            `${sw.name}: DTM Invalid Calendar Date`,
            `Date "${dos}" does not exist (e.g., Feb 30, Apr 31). The date must be a valid calendar date.`,
          ));
        }
      }
    }
    // E04b: Admission/discharge date validation for hospital claims
    if (line.admissionDate && line.dischargeDate) {
      const admit = new Date(line.admissionDate);
      const discharge = new Date(line.dischargeDate);
      if (!isNaN(admit.getTime()) && !isNaN(discharge.getTime())) {
        if (discharge < admit) {
          issues.push(issue(line.lineNumber, "dischargeDate", "EDIFACT_DTM_DISCHARGE_BEFORE_ADMIT", "error",
            `${sw.name}: Discharge Before Admission`,
            `Discharge date ${line.dischargeDate} is before admission date ${line.admissionDate}. DTM+96 must be after DTM+194.`,
          ));
        }
        const los = Math.floor((discharge.getTime() - admit.getTime()) / 86400000);
        if (los > 365) {
          issues.push(issue(line.lineNumber, "admissionDate", "EDIFACT_DTM_LOS_EXTREME", "warning",
            `${sw.name}: Length of Stay > 1 Year`,
            `Length of stay is ${los} days. This is extremely unusual and will be queried.`,
          ));
        }
      }
    }
    // E04c: Accident date must precede or match service date
    if (line.accidentDate && line.dateOfService) {
      const acc = new Date(line.accidentDate);
      const dos = new Date(line.dateOfService);
      if (!isNaN(acc.getTime()) && !isNaN(dos.getTime()) && acc > dos) {
        issues.push(issue(line.lineNumber, "accidentDate", "EDIFACT_DTM_ACCIDENT_AFTER_SERVICE", "error",
          `${sw.name}: Accident Date After Service Date`,
          `Accident date ${line.accidentDate} is after service date ${line.dateOfService}. DTM+290 must be on or before DTM+286.`,
        ));
      }
    }
  }

  // ─── E05: NAD segment field length validation ──
  for (const line of lines) {
    // NAD party identification max an..17
    if (line.practiceNumber && line.practiceNumber.length > 17) {
      issues.push(issue(line.lineNumber, "practiceNumber", "EDIFACT_NAD_ID_LENGTH", "error",
        `${sw.name}: NAD Party ID Too Long`,
        `Practice number "${line.practiceNumber}" is ${line.practiceNumber.length} chars. NAD 3039 (party ID) max is 17 characters.`,
      ));
    }
    // NAD+SUP supplier name max an..35 per line (up to 3 lines)
    if (line.patientName && line.patientName.length > 105) {
      issues.push(issue(line.lineNumber, "patientName", "EDIFACT_NAD_NAME_LENGTH", "error",
        `${sw.name}: NAD Name Exceeds EDIFACT Limit`,
        `Name is ${line.patientName.length} chars. EDIFACT C080 allows max 3 × 35 = 105 characters total for party name.`,
      ));
    }
    // NAD+TDN treating provider
    if (line.treatingProviderNumber && !/^\d{7}$/.test(line.treatingProviderNumber)) {
      issues.push(issue(line.lineNumber, "treatingProviderNumber", "EDIFACT_NAD_TDN_FORMAT", "error",
        `${sw.name}: NAD+TDN Invalid Provider Number`,
        `Treating provider "${line.treatingProviderNumber}" must be a 7-digit BHF number.`,
      ));
    }
    // NAD+RDN referring doctor (mandatory for specialists)
    if (line.practitionerType && ["SP", "SU"].includes(line.practitionerType.toUpperCase())) {
      if (!line.referringProviderNumber && sw.code === "HB") {
        issues.push(issue(line.lineNumber, "referringProviderNumber", "EDIFACT_NAD_RDN_MISSING", "warning",
          `${sw.name}: Missing Referring Doctor`,
          `Specialist/surgeon claim without referring doctor (NAD+RDN). Healthbridge requires referral chain for specialist claims.`,
        ));
      }
    }
  }

  // ─── E06: RFF reference segment validation ──
  for (const line of lines) {
    // RFF+AHI (SA ID number) — 13 digits with Luhn check
    if (line.patientIdNumber) {
      const id = line.patientIdNumber.trim();
      if (sw.validatesIDNumber && !/^\d{13}$/.test(id)) {
        issues.push(issue(line.lineNumber, "patientIdNumber", "EDIFACT_RFF_AHI_FORMAT", "error",
          `${sw.name}: Invalid SA ID Number`,
          `SA ID number "${id}" must be exactly 13 digits. RFF+AHI segment requires a valid SA national ID.`,
        ));
      }
      if (/^\d{13}$/.test(id)) {
        // Luhn check digit validation
        const digits = id.split("").map(Number);
        let sum = 0;
        for (let i = 0; i < 12; i++) {
          let d = digits[i];
          if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
          sum += d;
        }
        const checkDigit = (10 - (sum % 10)) % 10;
        if (checkDigit !== digits[12]) {
          issues.push(issue(line.lineNumber, "patientIdNumber", "EDIFACT_RFF_AHI_CHECKDIGIT", "warning",
            `${sw.name}: SA ID Check Digit Mismatch`,
            `SA ID "${id}" fails Luhn check digit validation. Expected check digit ${checkDigit}, got ${digits[12]}.`,
          ));
        }
        // Extract DOB from ID (YYMMDD in first 6 digits)
        const idDob = id.substring(0, 6);
        const idMonth = parseInt(idDob.substring(2, 4), 10);
        const idDay = parseInt(idDob.substring(4, 6), 10);
        if (idMonth < 1 || idMonth > 12 || idDay < 1 || idDay > 31) {
          issues.push(issue(line.lineNumber, "patientIdNumber", "EDIFACT_RFF_AHI_DOB", "error",
            `${sw.name}: SA ID Contains Invalid DOB`,
            `First 6 digits "${idDob}" of SA ID do not form a valid date (YYMMDD). ID may be incorrect.`,
          ));
        }
        // Gender from ID (position 7-10: 0000-4999 = female, 5000-9999 = male)
        const genderDigits = parseInt(id.substring(6, 10), 10);
        const idGender = genderDigits < 5000 ? "F" : "M";
        if (line.patientGender && line.patientGender !== "U" && line.patientGender !== idGender) {
          issues.push(issue(line.lineNumber, "patientIdNumber", "EDIFACT_RFF_AHI_GENDER", "error",
            `${sw.name}: SA ID Gender vs Claim Gender Mismatch`,
            `SA ID indicates ${idGender === "M" ? "Male" : "Female"} (digits 7-10: ${id.substring(6, 10)}) but claim gender is ${line.patientGender}.`,
          ));
        }
      }
    }
    // RFF+AE authorization number format
    if (line.authorizationNumber) {
      const auth = line.authorizationNumber.trim();
      if (auth.length > 35) {
        issues.push(issue(line.lineNumber, "authorizationNumber", "EDIFACT_RFF_AE_LENGTH", "error",
          `${sw.name}: Authorization Number Too Long`,
          `Auth number "${auth}" is ${auth.length} chars. RFF 1154 max is 35 characters.`,
        ));
      }
    }
    // RFF+DPN dependent number — must match dependent code
    if (line.dependentCode && line.membershipNumber) {
      // Cross-check: if dependent code is "00", should be main member
    }
    // RFF+SX gender — must be M or F (no U in EDIFACT spec)
    if (line.patientGender === "U" && sw.code === "HB") {
      issues.push(issue(line.lineNumber, "patientGender", "EDIFACT_RFF_SX_UNKNOWN", "warning",
        `${sw.name}: EDIFACT Gender Unknown`,
        `RFF+SX only accepts "M" or "F". Unknown gender "U" may cause parse errors at ${sw.name}.`,
      ));
    }
  }

  // ─── E07: Character set enforcement ──
  const charsetRegex = sw.characterSet === "UNOA" ? UNOA_FORBIDDEN : UNOB_FORBIDDEN;
  for (const line of lines) {
    // Check all string fields against character set
    const fieldsToCheck: Array<{ name: string; value?: string }> = [
      { name: "patientName", value: line.patientName },
      { name: "membershipNumber", value: line.membershipNumber },
      { name: "practiceNumber", value: line.practiceNumber },
      { name: "motivationText", value: line.motivationText },
      { name: "scheme", value: line.scheme },
    ];
    for (const { name, value } of fieldsToCheck) {
      if (value && charsetRegex.test(value)) {
        // Only report once per field per line (not per character)
        issues.push(issue(line.lineNumber, name, "EDIFACT_CHARSET", "warning",
          `${sw.name}: ${sw.characterSet} Character Set Violation`,
          `Field "${name}" contains characters outside EDIFACT ${sw.characterSet} charset. Characters will be stripped or cause parse failure.`,
          `${sw.characterSet === "UNOA" ? "UNOA allows only: A-Z, 0-9, space, and . , - ( ) / = + ' : ? ! \" % & * ; < >" : "UNOB allows all printable ASCII (0x20-0x7E)."}`,
        ));
      }
    }
  }

  // ─── E08: EDIFACT delimiter collision ──
  const edifactDelimiters = /['+:?]/;
  for (const line of lines) {
    // Patient name with unescaped delimiters
    if (line.patientName && edifactDelimiters.test(line.patientName)) {
      const chars = line.patientName.match(/['+:?]/g) ?? [];
      issues.push(issue(line.lineNumber, "patientName", "EDIFACT_DELIMITER_COLLISION", "warning",
        `${sw.name}: EDIFACT Delimiter in Data`,
        `Patient name contains EDIFACT delimiter characters (${chars.join("")}). These must be escaped with "?" release character or will corrupt the message.`,
      ));
    }
    // Motivation text with delimiters
    if (line.motivationText && edifactDelimiters.test(line.motivationText)) {
      issues.push(issue(line.lineNumber, "motivationText", "EDIFACT_DELIMITER_COLLISION", "warning",
        `${sw.name}: EDIFACT Delimiter in Motivation`,
        `Motivation text contains EDIFACT delimiter characters. Must be escaped with "?" release character.`,
      ));
    }
  }

  // ─── E09: Mandatory segment presence (per PHISC spec) ──
  for (const line of lines) {
    // UNH — always mandatory (checked by structure)
    // BGM — conditional but mandatory in practice (checked above)
    // DTM+286 — service date mandatory for all suppliers
    if (!line.dateOfService) {
      issues.push(issue(line.lineNumber, "dateOfService", "EDIFACT_SEG_DTM_MISSING", "error",
        `${sw.name}: Missing DTM+286 (Service Date)`,
        `PHISC spec: DTM+286 (service start date) is mandatory for all suppliers.`,
      ));
    }
    // NAD+SUP — mandatory if not Pr 50/51 (group practice)
    if (!line.practiceNumber) {
      issues.push(issue(line.lineNumber, "practiceNumber", "EDIFACT_SEG_NAD_SUP_MISSING", "error",
        `${sw.name}: Missing NAD+SUP (Supplier Number)`,
        `PHISC spec: NAD+SUP (supplier RAMS number) is mandatory for all suppliers.`,
      ));
    }
    // NAD+MSN — membership number mandatory
    if (!line.membershipNumber) {
      issues.push(issue(line.lineNumber, "membershipNumber", "EDIFACT_SEG_NAD_MSN_MISSING", "error",
        `${sw.name}: Missing NAD+MSN (Membership Number)`,
        `PHISC spec: NAD+MSN (membership number) is mandatory for all suppliers.`,
      ));
    }
    // RFF+PTN — patient name mandatory in detail section
    if (!line.patientName) {
      issues.push(issue(line.lineNumber, "patientName", "EDIFACT_SEG_RFF_PTN_MISSING", "error",
        `${sw.name}: Missing RFF+PTN (Patient Name)`,
        `PHISC spec: RFF+PTN (patient name) is mandatory for all suppliers in the detail section.`,
      ));
    }
  }

  // ─── E10: Segment sequence validation ──
  // PHISC spec defines mandatory order: UNH → BGM → DTM → NAD → RFF → FTX → PAT → TAX → (detail) → UNT
  // We validate the logical ordering of data within claims
  for (const line of lines) {
    // Service date (DTM+286) should match or precede accounting period
    // Dispensing date (DTM+292) should match or follow service date for pharmacy
    if (line.dispensingDate && line.dateOfService) {
      const disp = new Date(line.dispensingDate);
      const dos = new Date(line.dateOfService);
      if (!isNaN(disp.getTime()) && !isNaN(dos.getTime()) && disp < dos) {
        issues.push(issue(line.lineNumber, "dispensingDate", "EDIFACT_SEQ_DISP_BEFORE_SERVICE", "error",
          `${sw.name}: Dispensing Date Before Service Date`,
          `Dispensing date ${line.dispensingDate} (DTM+292) is before service date ${line.dateOfService} (DTM+286). Medicine cannot be dispensed before the consultation.`,
        ));
      }
    }
  }

  // ─── E11: MOA amount format (monetary amount in cents) ──
  for (const line of lines) {
    if (line.rawAmount) {
      // MOA+203 uses n..18 format — numeric only, no embedded decimal points
      // The two rightmost digits are implied cents
      if (/[^0-9.\-,\s]/.test(line.rawAmount.replace(/[R$€£¥]/g, ""))) {
        issues.push(issue(line.lineNumber, "amount", "EDIFACT_MOA_FORMAT", "error",
          `${sw.name}: MOA Amount Non-Numeric`,
          `Amount "${line.rawAmount}" contains non-numeric characters after currency removal. EDIFACT MOA+203 is n..18 (pure numeric with implied decimals).`,
        ));
      }
    }
  }

  // ─── E12: TAX segment VAT rate ──
  for (const line of lines) {
    if (line.vatRate !== undefined && line.vatRate !== null) {
      if (line.vatRate !== 15 && line.vatRate !== 0) {
        issues.push(issue(line.lineNumber, "vatRate", "EDIFACT_TAX_RATE", "warning",
          `${sw.name}: Non-Standard VAT Rate`,
          `VAT rate ${line.vatRate}% is non-standard. SA standard rate is 15%. Zero-rated (0%) applies to certain medical supplies only.`,
        ));
      }
    }
  }

  // ─── E13: LIN segment tariff qualifier validation ──
  for (const line of lines) {
    // LIN+SRV for tariff codes, LIN+NAP for NAPPI codes
    // If both tariff and NAPPI exist, both LIN segments must be present
    if (line.tariffCode && line.nappiCode) {
      // Both present — valid (two LIN segments with different qualifiers)
    } else if (!line.tariffCode && !line.nappiCode) {
      issues.push(issue(line.lineNumber, "tariffCode", "EDIFACT_LIN_MISSING", "error",
        `${sw.name}: Missing LIN Segment`,
        `No tariff code (LIN+SRV) or NAPPI code (LIN+NAP) provided. At least one LIN segment is mandatory per line item.`,
      ));
    }
  }

  // ─── E14: QTY segment validation ──
  for (const line of lines) {
    // QTY+47 — quantity delivered, n..15
    if (line.quantity !== undefined && line.quantity.toString().length > 15) {
      issues.push(issue(line.lineNumber, "quantity", "EDIFACT_QTY_LENGTH", "error",
        `${sw.name}: QTY Value Too Long`,
        `Quantity ${line.quantity} exceeds EDIFACT QTY 6060 max length of 15 digits.`,
      ));
    }
  }

  return issues;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PHASE 6 — Claim Type Routing Rules (original/reversal/resubmission)
// Source: PHISC DCR segment, switching house correction workflows
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function validateClaimTypeRouting(
  lines: ClaimLineItem[],
  sw: SwitchboardProfile,
  meta?: ClaimBatchMetadata,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const ln = lines[0]?.lineNumber ?? 0;

  if (!meta) return issues;

  // ─── CT01: Correction type validation ──
  if (meta.correctionType) {
    const validTypes = ["ADJ", "ADD", "REV", "RSV", "INT"];
    if (!validTypes.includes(meta.correctionType)) {
      issues.push(issue(ln, "correctionType", "CT_INVALID_TYPE", "error",
        `${sw.name}: Invalid Correction Type`,
        `DCR correction type "${meta.correctionType}" is not valid. PHISC spec allows: ADJ (amendment), ADD (additions), REV (reversal), RSV (resubmission), INT (interim).`,
      ));
    }
  }

  // ─── CT02: ADJ/REV requires original claim reference ──
  if (meta.correctionType === "ADJ" || meta.correctionType === "REV") {
    if (!meta.originalClaimReference) {
      issues.push(issue(ln, "correctionType", "CT_MISSING_ORIGINAL_REF", "error",
        `${sw.name}: Missing Original Claim Reference`,
        `${meta.correctionType} (${meta.correctionType === "ADJ" ? "amendment" : "reversal"}) requires the original claim number in DCR+${meta.correctionType} segment. Cannot process without reference.`,
        `Add the original claim reference number from the initial submission or rejection.`,
      ));
    }
  }

  // ─── CT03: ADD requires original claim reference ──
  if (meta.correctionType === "ADD" && !meta.originalClaimReference) {
    issues.push(issue(ln, "correctionType", "CT_ADD_NO_REF", "error",
      `${sw.name}: ADD Without Original Reference`,
      `ADD (additions to previous account) requires the original claim number.`,
    ));
  }

  // ─── CT04: Reversal claim amount validation ──
  if (meta.correctionType === "REV") {
    for (const line of lines) {
      if (line.amount && line.amount > 0 && !sw.allowsNegativeAmounts) {
        issues.push(issue(line.lineNumber, "amount", "CT_REV_POSITIVE_AMOUNT", "warning",
          `${sw.name}: Reversal with Positive Amount`,
          `Reversal claim line has positive amount R${line.amount.toFixed(2)}. Reversals typically carry zero or the original amount for reference. The switch will credit the original amount.`,
        ));
      }
    }
  }

  // ─── CT05: Resubmission rules ──
  if (meta.isResubmission || meta.correctionType === "RSV") {
    // CT05a: Must reference original claim
    if (!meta.originalClaimReference) {
      issues.push(issue(ln, "correctionType", "CT_RSV_NO_REF", "error",
        `${sw.name}: Resubmission Without Original Reference`,
        `Resubmission (RSV) must reference the original rejected claim number.`,
      ));
    }

    // CT05b: Resubmission window (60 days from rejection, per CMS rules)
    // Cannot validate without rejection date, but warn
    issues.push(issue(ln, "correctionType", "CT_RSV_WINDOW", "info",
      `${sw.name}: Resubmission Window Reminder`,
      `Resubmission must be within 60 days of the rejection date (per CMS rules). Ensure the original rejection date is within this window.`,
    ));
  }

  // ─── CT06: Interim account validation (hospitals only) ──
  if (meta.correctionType === "INT") {
    for (const line of lines) {
      if (!line.admissionDate) {
        issues.push(issue(line.lineNumber, "admissionDate", "CT_INT_NO_ADMISSION", "error",
          `${sw.name}: Interim Account Without Admission Date`,
          `Interim hospital account (INT) requires DTM+194 admission date. This is mandatory for all interim claims.`,
        ));
      }
      if (line.dischargeDate) {
        issues.push(issue(line.lineNumber, "dischargeDate", "CT_INT_HAS_DISCHARGE", "warning",
          `${sw.name}: Interim Account With Discharge Date`,
          `Interim account should not have a discharge date. Patient is still admitted. Remove DTM+96.`,
        ));
      }
    }
  }

  // ─── CT07: Late submission motivation ──
  for (const line of lines) {
    if (line.dateOfService) {
      const dos = new Date(line.dateOfService);
      if (!isNaN(dos.getTime())) {
        const days = Math.floor((new Date().getTime() - dos.getTime()) / 86400000);
        if (days > 90 && !meta.lateSubmissionMotivation) {
          issues.push(issue(line.lineNumber, "dateOfService", "CT_LATE_NO_MOTIVATION", "warning",
            `${sw.name}: Late Submission Without Motivation`,
            `Claim is ${days} days old (>90 days). Most schemes require a late submission motivation. Add FTX segment with reason for late submission.`,
            `Common reasons: system downtime, patient record delay, admin error. Document the reason.`,
          ));
        }
      }
    }
  }

  // ─── CT08: Emergency claim flag ──
  if (meta.isEmergency) {
    for (const line of lines) {
      // Emergency claims should have ER-appropriate ICD-10 codes
      const icd = (line.primaryICD10 ?? "").toUpperCase();
      const emergencyPrefixes = ["R57", "I21", "I46", "J96", "G41", "T78", "S", "T",
        "I60", "I61", "I62", "I63", "I64", // Stroke
        "J81", // Acute pulmonary oedema
        "K25.0", "K25.2", "K26.0", "K26.2", // Acute ulcer with bleeding
        "E10.0", "E11.0", "E13.0", "E14.0", // Diabetic coma
      ];
      if (!emergencyPrefixes.some(p => icd.startsWith(p))) {
        issues.push(issue(line.lineNumber, "primaryICD10", "CT_EMERGENCY_ICD", "info",
          `${sw.name}: Emergency Flag with Non-Emergency Diagnosis`,
          `Claim flagged as emergency but ICD-10 "${icd}" is not typically an emergency presentation. Emergency routing adds priority but may be queried.`,
        ));
      }
    }
  }

  // ─── CT09: Credit note validation (MediSwitch) ──
  if (sw.allowsNegativeAmounts) {
    for (const line of lines) {
      if (line.amount && line.amount < 0 && !meta.correctionType) {
        issues.push(issue(line.lineNumber, "amount", "CT_CREDIT_NO_DCR", "error",
          `${sw.name}: Negative Amount Without Correction Type`,
          `Credit note (R${line.amount.toFixed(2)}) requires DCR segment with correction type (ADJ or REV) and original claim reference.`,
        ));
      }
    }
  }

  // ─── CT10: SBN supplier batch number cross-reference ──
  if (meta.supplierBatchNumber && meta.batchNumber) {
    if (meta.supplierBatchNumber === meta.batchNumber) {
      // Same — valid, no action
    } else {
      issues.push(issue(ln, "edifact", "CT_SBN_MISMATCH", "info",
        `${sw.name}: Supplier Batch Number Differs`,
        `Supplier batch number "${meta.supplierBatchNumber}" (DCR+SBN) differs from BGM batch "${meta.batchNumber}". This is valid when the switch assigns its own batch number.`,
      ));
    }
  }

  return issues;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PHASE 7 — Scheme Routing Validation
// Source: BHF scheme registry, switching house routing tables
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Comprehensive scheme-to-switch routing table
const SCHEME_ROUTING: Record<string, { switch: string; switchName: string; options?: string[] }> = {
  // Healthbridge schemes
  "DH": { switch: "HB", switchName: "Healthbridge", options: ["CLASSIC", "COMP", "SMART", "PRIOR", "EXEC", "KEYCARE", "COASTAL"] },
  "BON": { switch: "HB", switchName: "Healthbridge", options: ["COMP", "CLASSIC", "SAVE", "PRIME", "ESSENTIAL", "CAP", "CORE", "START"] },
  "MH": { switch: "HB", switchName: "Healthbridge", options: ["NECT", "DIM", "PRIME", "COMP"] },
  "BK": { switch: "HB", switchName: "Healthbridge" },
  "LA": { switch: "HB", switchName: "Healthbridge" },
  "AM": { switch: "HB", switchName: "Healthbridge" },
  // SwitchOn / Altron schemes
  "GEMS": { switch: "SO", switchName: "SwitchOn", options: ["EMERALD", "BERYL", "SAPPHIRE", "RUBY", "ONYX"] },
  "MOM": { switch: "SO", switchName: "SwitchOn", options: ["INGWE", "SUMMIT", "CUSTOM", "INCENTIVE", "EXTENDER"] },
  "BM": { switch: "SO", switchName: "SwitchOn", options: ["BEAT", "PACE", "PULSE"] },
  "FH": { switch: "SO", switchName: "SwitchOn" },
  "POL": { switch: "SO", switchName: "SwitchOn" },
  "SH": { switch: "SO", switchName: "SwitchOn" },
  // MediKredit / MediSwitch schemes
  "CC": { switch: "MS", switchName: "MediSwitch / MediKredit" },
  "MS_SCHEME": { switch: "MS", switchName: "MediSwitch / MediKredit" },
  "PPS": { switch: "MS", switchName: "MediSwitch / MediKredit" },
  "KH": { switch: "MS", switchName: "MediSwitch / MediKredit" },
  "PR": { switch: "MS", switchName: "MediSwitch / MediKredit" },
};

function validateSchemeRouting(
  lines: ClaimLineItem[],
  sw: SwitchboardProfile,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const line of lines) {
    if (!line.scheme) continue;
    const scheme = line.scheme.trim().toUpperCase();

    // ─── SR01: Scheme code existence check ──
    const routing = SCHEME_ROUTING[scheme];
    if (!routing) {
      // Try partial match
      const partial = Object.entries(SCHEME_ROUTING).find(([code]) => scheme.includes(code));
      if (!partial) {
        issues.push(issue(line.lineNumber, "scheme", "SR_UNKNOWN_SCHEME", "warning",
          `${sw.name}: Unknown Scheme Code`,
          `Scheme code "${scheme}" is not in the standard routing table. Verify the scheme code against BHF registry.`,
          `Common codes: DH (Discovery), GEMS, BON (Bonitas), MOM (Momentum), MH (Medihelp), BM (Bestmed), CC (CompCare).`,
        ));
      }
    }

    // ─── SR02: Switch routing mismatch ──
    if (routing && routing.switch !== sw.code) {
      issues.push(issue(line.lineNumber, "scheme", "SR_WRONG_SWITCH", "error",
        `${sw.name}: Incorrect Switching House`,
        `Scheme "${scheme}" routes via ${routing.switchName} (code ${routing.switch}), not ${sw.name} (code ${sw.code}). Claim will be rejected — wrong clearing house.`,
        `Submit this claim via ${routing.switchName} instead.`,
      ));
    }

    // ─── SR03: Scheme option code validation ──
    if (routing?.options && line.schemeOptionCode) {
      const option = line.schemeOptionCode.trim().toUpperCase();
      if (!routing.options.includes(option)) {
        issues.push(issue(line.lineNumber, "schemeOptionCode", "SR_INVALID_OPTION", "warning",
          `${sw.name}: Unknown Scheme Option`,
          `Option "${option}" is not recognized for scheme "${scheme}". Known options: ${routing.options.join(", ")}.`,
        ));
      }
    }

    // ─── SR04: GEMS membership number format (9 digits) ──
    if (scheme === "GEMS" && line.membershipNumber) {
      const mn = line.membershipNumber.trim();
      if (!/^\d{9}$/.test(mn)) {
        issues.push(issue(line.lineNumber, "membershipNumber", "SR_GEMS_MEMBER_FORMAT", "error",
          `${sw.name}: GEMS Membership Must Be 9 Digits`,
          `GEMS uses 9-digit membership numbers with leading zeros. "${mn}" is ${mn.length} characters.`,
          `Pad with leading zeros: ${mn.padStart(9, "0")}`,
        ));
      }
    }

    // ─── SR05: Discovery KeyCare network validation ──
    if (scheme === "DH" && line.schemeOptionCode?.toUpperCase().includes("KEYCARE")) {
      issues.push(issue(line.lineNumber, "scheme", "SR_DH_KEYCARE", "info",
        `${sw.name}: KeyCare Network Claim`,
        `Discovery KeyCare claims MUST use KeyCare network providers. Non-network = full member liability. Verify provider is in KeyCare network before submission.`,
      ));
    }

    // ─── SR06: Bonitas Pharmacy Direct DSP check ──
    if (scheme === "BON" && line.nappiCode) {
      const dspPlans = ["SAVE", "ESSENTIAL", "START", "STANDARD"];
      if (line.schemeOptionCode && dspPlans.some(p => line.schemeOptionCode!.toUpperCase().includes(p))) {
        issues.push(issue(line.lineNumber, "scheme", "SR_BON_DSP", "info",
          `${sw.name}: Bonitas DSP Requirement`,
          `Bonitas ${line.schemeOptionCode} requires chronic medicine via Pharmacy Direct (DSP). Non-DSP dispensing = 30% co-payment.`,
        ));
      }
    }

    // ─── SR07: GEMS 60-day dispute turnaround ──
    if (scheme === "GEMS") {
      issues.push(issue(line.lineNumber, "scheme", "SR_GEMS_DISPUTE", "info",
        `${sw.name}: GEMS Dispute Note`,
        `GEMS has a 60-day dispute turnaround (longest of all schemes). If rejected, lodge disputes promptly.`,
      ));
    }

    // ─── SR08: Mixed schemes in batch ──
    // Already partially checked in B04, but validate routing consistency
    const allSchemes = new Set(lines.map(l => l.scheme?.trim().toUpperCase()).filter(Boolean));
    if (allSchemes.size > 1 && line.lineNumber === lines[0].lineNumber) {
      // Check if all route to the same switch
      const switches = new Set<string>();
      allSchemes.forEach(s => {
        const r = SCHEME_ROUTING[s!];
        if (r) switches.add(r.switch);
      });
      if (switches.size > 1) {
        issues.push(issue(line.lineNumber, "batch", "SR_MIXED_SWITCH_SCHEMES", "error",
          `${sw.name}: Batch Contains Schemes for Different Switches`,
          `Batch contains schemes routed to different switching houses (${Array.from(switches).join(", ")}). Split by switch before submission.`,
        ));
      }
    }

    // ─── SR09: Scheme-specific claim window ──
    if (scheme === "MH" && line.dateOfService) {
      // Medihelp: last workday of 4th month
      const dos = new Date(line.dateOfService);
      if (!isNaN(dos.getTime())) {
        const days = Math.floor((new Date().getTime() - dos.getTime()) / 86400000);
        if (days > 100 && days <= 120) {
          issues.push(issue(line.lineNumber, "dateOfService", "SR_MH_WINDOW", "warning",
            `${sw.name}: Medihelp Window Closing`,
            `Medihelp deadline: last workday of 4th month from service. Claim is ${days} days old — approaching deadline.`,
          ));
        }
      }
    }

    // ─── SR10: Scheme pre-auth patterns ──
    if (line.tariffCode) {
      const tc = parseInt(line.tariffCode, 10);
      // Discovery requires pre-auth for all hospital, MRI/CT, high-cost meds
      if (scheme === "DH" && !isNaN(tc)) {
        if ((tc >= 3900 && tc <= 3999) || (tc >= 3950 && tc <= 3999)) { // MRI/CT
          if (!line.authorizationNumber) {
            issues.push(issue(line.lineNumber, "authorizationNumber", "SR_DH_PREAUTH", "warning",
              `${sw.name}: Discovery Pre-Auth Required`,
              `Discovery requires pre-authorization for MRI/CT (tariff ${line.tariffCode}). Claims without auth number may be rejected.`,
            ));
          }
        }
      }
    }
  }

  return issues;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PHASE 8 — Response Handling Rules (interpretation of switch responses)
// Source: PHISC STS segment, BHF adjustment reason codes
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// BHF adjustment/rejection reason codes — the complete list
export const BHF_ADJUSTMENT_CODES: Record<string, { description: string; retryable: boolean; action: string }> = {
  "01": { description: "Member not found", retryable: true, action: "Verify membership number and dependent code" },
  "02": { description: "Account required", retryable: true, action: "Provide account/invoice number (RFF+ADE)" },
  "03": { description: "Claim already submitted", retryable: false, action: "Check duplicate — do not resubmit" },
  "04": { description: "Authorization letter required", retryable: true, action: "Obtain pre-auth and resubmit with RFF+AE" },
  "05": { description: "Suspended member", retryable: false, action: "Member has lapsed — contact scheme" },
  "06": { description: "Waiting period applies", retryable: false, action: "Check member's waiting period status" },
  "07": { description: "Late claim submission", retryable: true, action: "Submit late claim motivation via FTX" },
  "08": { description: "Invalid BHF number", retryable: true, action: "Verify practice number on pcns.co.za" },
  "09": { description: "Benefit exhausted", retryable: false, action: "Annual benefit depleted — inform patient" },
  "10": { description: "PMB — pay in full", retryable: false, action: "Re-flag as PMB if valid CDL/DTP condition" },
  "11": { description: "Invalid ICD-10 code", retryable: true, action: "Check code against MIT database" },
  "12": { description: "Tariff not in schedule", retryable: true, action: "Verify tariff code in CCSA v11" },
  "13": { description: "Amount exceeds tariff rate", retryable: true, action: "Adjust to scheme tariff or add motivation" },
  "14": { description: "Duplicate procedure same day", retryable: true, action: "Add modifier 0019 (distinct procedure) if valid" },
  "15": { description: "Gender mismatch", retryable: true, action: "Correct patient gender or ICD-10 code" },
  "16": { description: "Age mismatch", retryable: true, action: "Correct patient age or ICD-10 code" },
  "17": { description: "Pre-auth not obtained", retryable: true, action: "Obtain retrospective authorization" },
  "18": { description: "ICD-10 requires specificity", retryable: true, action: "Add 4th character to 3-char ICD-10 code" },
  "19": { description: "Bundled procedure", retryable: false, action: "Component included in another billed procedure" },
  "20": { description: "Not a benefit on this option", retryable: false, action: "Service not covered on member's plan" },
  "21": { description: "Co-payment applies", retryable: false, action: "Partial payment — balance to member" },
  "22": { description: "Referred to case management", retryable: false, action: "Await case manager decision" },
  "23": { description: "Suspended provider", retryable: false, action: "Provider under investigation — contact BHF" },
  "24": { description: "Scheme terminated", retryable: false, action: "Member's scheme has been wound up" },
  "25": { description: "Clinical protocol not followed", retryable: true, action: "Add motivation text explaining clinical rationale" },
  "54": { description: "Illegible claim", retryable: true, action: "Resubmit with clear formatting" },
  "59": { description: "Tariff code incorrect", retryable: true, action: "Verify and correct tariff code" },
};

function validateResponseHandling(
  lines: ClaimLineItem[],
  sw: SwitchboardProfile,
  meta?: ClaimBatchMetadata,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const ln = lines[0]?.lineNumber ?? 0;

  // ─── RH01: Pre-validate common rejection patterns ──
  for (const line of lines) {
    // Top 5 rejection reasons — preemptively check
    // #1: Incorrect/missing ICD-10 (30% of all rejections)
    if (!line.primaryICD10 || line.primaryICD10.trim() === "") {
      issues.push(issue(line.lineNumber, "primaryICD10", "RH_TOP_REJECTION_ICD10", "error",
        `${sw.name}: Rejection Risk — Missing ICD-10`,
        `#1 rejection reason (30% of all rejections): incorrect/missing ICD-10 code. WILL be rejected by scheme.`,
      ));
    }

    // #2: Missing pre-auth for high-cost procedures
    if (line.tariffCode) {
      const tc = parseInt(line.tariffCode, 10);
      const highCostThreshold = 5000;
      if (line.amount && line.amount > highCostThreshold && !line.authorizationNumber) {
        issues.push(issue(line.lineNumber, "authorizationNumber", "RH_TOP_REJECTION_PREAUTH", "warning",
          `${sw.name}: Rejection Risk — No Pre-Auth for High-Cost`,
          `#2 rejection: R${line.amount.toFixed(2)} without authorization. High-cost procedures (>R${highCostThreshold}) typically need pre-auth.`,
        ));
      }
    }
  }

  // ─── RH02: Retryable vs non-retryable awareness ──
  // Inform about correction strategy before submission
  if (meta?.isResubmission) {
    issues.push(issue(ln, "batch", "RH_RESUBMISSION_STRATEGY", "info",
      `${sw.name}: Resubmission Best Practice`,
      `When resubmitting: fix the rejection reason (check BHF code), use DCR+RSV with original claim reference, submit within 60 days of rejection.`,
    ));
  }

  // ─── RH03: Partial approval awareness ──
  // Multiple line items may have mixed outcomes (some approved, some rejected)
  if (lines.length > 5) {
    issues.push(issue(ln, "batch", "RH_PARTIAL_APPROVAL", "info",
      `${sw.name}: Partial Approval Possible`,
      `Batch has ${lines.length} lines. Switch may return PAR (partial) — some lines accepted, others rejected. Process each line's STS segment independently.`,
    ));
  }

  // ─── RH04: Timeout handling guidance ──
  if (meta?.isRealTime) {
    issues.push(issue(ln, "batch", "RH_TIMEOUT_HANDLING", "info",
      `${sw.name}: Real-Time Timeout Handling`,
      `Real-time submissions: ${sw.code === "HB" ? "Healthbridge 30s" : sw.code === "MS" ? "MediSwitch 45s" : "SwitchOn 60s"} timeout. On timeout: do NOT resubmit immediately — check submission status first to avoid duplicates.`,
    ));
  }

  return issues;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PHASE 9 — Provider Registration Validation
// Source: BHF/PCNS registry, switch vendor accreditation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function validateProviderRegistration(
  lines: ClaimLineItem[],
  sw: SwitchboardProfile,
  meta?: ClaimBatchMetadata,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const ln = lines[0]?.lineNumber ?? 0;

  // ─── PR01: Practice number registered with switch ──
  if (sw.verifiesPracticeNumber && meta?.switchContractActive === false) {
    issues.push(issue(ln, "practiceNumber", "PR_CONTRACT_INACTIVE", "error",
      `${sw.name}: Switch Contract Inactive`,
      `Practice is not registered or contract is inactive with ${sw.name}. Claims will be rejected at switch level before reaching the scheme.`,
      `Contact ${sw.name} to activate/verify your switch contract.`,
    ));
  }

  // ─── PR02: Submitting vs rendering practice ──
  if (meta?.submittingPracticeNumber && meta.renderingPracticeNumber) {
    if (meta.submittingPracticeNumber !== meta.renderingPracticeNumber) {
      issues.push(issue(ln, "practiceNumber", "PR_BILLING_RENDERING_DIFF", "info",
        `${sw.name}: Billing/Rendering Practice Differ`,
        `Submitting practice (${meta.submittingPracticeNumber}) differs from rendering practice (${meta.renderingPracticeNumber}). This is valid for group practices (NAD+GRP) but the rendering provider must be identified in NAD+TDN.`,
      ));
    }
  }

  // ─── PR03: Treating provider must differ from practice (Healthbridge) ──
  if (sw.code === "HB") {
    for (const line of lines) {
      if (line.treatingProviderNumber && line.practiceNumber) {
        if (line.treatingProviderNumber === line.practiceNumber) {
          issues.push(issue(line.lineNumber, "treatingProviderNumber", "PR_TDN_SAME_AS_SUP", "warning",
            `Healthbridge: Treating = Practice Number`,
            `NAD+TDN (${line.treatingProviderNumber}) is same as NAD+SUP. For sole practitioners this is valid, but for group practices the individual HPCSA number should be in NAD+TDN.`,
          ));
        }
      }
    }
  }

  // ─── PR04: Locum validation ──
  for (const line of lines) {
    if (line.treatingProviderNumber && line.practiceNumber) {
      // Different treating doctor than practice owner — possible locum
      if (line.treatingProviderNumber !== line.practiceNumber && sw.code !== "SO") {
        issues.push(issue(line.lineNumber, "treatingProviderNumber", "PR_LOCUM_CHECK", "info",
          `${sw.name}: Different Treating Provider`,
          `Treating provider ${line.treatingProviderNumber} differs from practice ${line.practiceNumber}. If this is a locum, ensure the locum is registered with ${sw.name} and the scheme.`,
        ));
      }
    }
  }

  // ─── PR05: Specialist referral chain ──
  for (const line of lines) {
    const pt = line.practitionerType?.toUpperCase();
    if (pt && ["SP", "SU", "AN", "RA", "PA"].includes(pt)) {
      if (!line.referringProviderNumber) {
        const severity = sw.code === "HB" ? "warning" as const : "info" as const;
        issues.push(issue(line.lineNumber, "referringProviderNumber", "PR_REFERRAL_MISSING", severity,
          `${sw.name}: Specialist Without Referral`,
          `${pt} (specialist) claim without referring doctor (NAD+RDN/RFF+RDN). Most schemes require a GP referral for specialist visits.`,
          `Add referring doctor's BHF/HPCSA number. Without referral, scheme may reject or apply co-payment.`,
        ));
      }
    }
  }

  // ─── PR06: HPCSA registration number (REG segment) ──
  for (const line of lines) {
    // RFF+REG — HPCSA/SAMDC registration number
    // 7-digit BHF is the practice number; HPCSA is a separate registration
    // Some switches cross-reference both
    if (sw.code === "HB" && line.practitionerType && !line.treatingProviderNumber) {
      issues.push(issue(line.lineNumber, "treatingProviderNumber", "PR_HPCSA_MISSING", "info",
        `Healthbridge: Missing Treating Provider`,
        `Healthbridge may require NAD+TDN (treating doctor) to cross-reference HPCSA registration. Omission may cause query.`,
      ));
    }
  }

  // ─── PR07: Dispensing licence for doctor-dispensing ──
  for (const line of lines) {
    if (line.nappiCode && line.practitionerType) {
      const pt = line.practitionerType.toUpperCase();
      if (pt !== "PH" && pt !== "DE") { // Not a pharmacy or dentist
        issues.push(issue(line.lineNumber, "nappiCode", "PR_DISPENSING_LICENCE", "info",
          `${sw.name}: Non-Pharmacy Dispensing`,
          `NAPPI code ${line.nappiCode} submitted by ${pt} (not pharmacy). Ensure Section 22A(15) dispensing licence is registered with BHF. Switch may validate dispensing rights.`,
        ));
      }
    }
  }

  // ─── PR08: Practice number format per discipline ──
  for (const line of lines) {
    if (line.practiceNumber && /^\d{7}$/.test(line.practiceNumber)) {
      // First 2 digits of BHF practice number encode province/region
      // This is informational — helps catch data entry errors
      const prefix = line.practiceNumber.substring(0, 2);
      const validPrefixes = ["01", "02", "03", "04", "05", "06", "07", "08", "09",
        "10", "11", "12", "13", "14", "15", "16", "17", "18", "19",
        "20", "21", "22", "23", "24", "25", "26", "27", "28", "29",
        "30", "31", "32", "33", "34", "35", "36", "37", "38", "39",
        "40", "41", "42", "43", "44", "45", "46", "47", "48", "49",
        "50", "51", "52", "53", "54", "55", "56", "57", "58", "59",
        "60", "61", "62", "63", "64", "65", "66", "67", "68", "69",
        "70", "71", "72", "73", "74", "75", "76", "77", "78", "79",
        "80", "81", "82", "83", "84", "85", "86", "87", "88", "89",
        "90", "91", "92", "93", "94", "95", "96", "97", "98", "99"];
      if (!validPrefixes.includes(prefix)) {
        issues.push(issue(line.lineNumber, "practiceNumber", "PR_BHF_PREFIX", "warning",
          `${sw.name}: Unusual BHF Practice Prefix`,
          `Practice number prefix "${prefix}" is unusual. Verify on pcns.co.za.`,
        ));
      }
    }
  }

  return issues;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PHASE 10 — Real-Time vs Batch Differences
// Source: Switch integration specifications
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function validateSubmissionMode(
  lines: ClaimLineItem[],
  sw: SwitchboardProfile,
  meta?: ClaimBatchMetadata,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const ln = lines[0]?.lineNumber ?? 0;

  if (!meta) return issues;

  // ─── SM01: Real-time single claim constraint ──
  if (meta.isRealTime && lines.length > 1) {
    // Most switches limit real-time to single claims
    if (sw.code === "HB") {
      issues.push(issue(ln, "batch", "SM_RT_MULTI_CLAIM", "error",
        `Healthbridge: Real-Time Multi-Claim`,
        `Real-time submission with ${lines.length} lines. Healthbridge real-time accepts max 1 claim per request. Use batch mode for multiple claims.`,
      ));
    } else {
      issues.push(issue(ln, "batch", "SM_RT_MULTI_CLAIM", "warning",
        `${sw.name}: Real-Time Multi-Line`,
        `Real-time submission with ${lines.length} lines. Consider batch mode for better throughput and error handling.`,
      ));
    }
  }

  // ─── SM02: Batch control totals ──
  if (!meta.isRealTime && sw.requiresBatchControlTotals) {
    if (!meta.batchNumber) {
      issues.push(issue(ln, "batch", "SM_BATCH_NO_CONTROL", "error",
        `${sw.name}: Batch Missing Control Number`,
        `Batch submission requires BGM batch number for control totals. ${sw.name} uses batch numbers for reconciliation and duplicate detection.`,
      ));
    }
  }

  // ─── SM03: Mixed scheme batch handling ──
  if (!meta.isRealTime) {
    const schemes = new Set(lines.map(l => l.scheme?.toUpperCase()).filter(Boolean));
    if (schemes.size > 1) {
      if (sw.code === "HB") {
        issues.push(issue(ln, "batch", "SM_MIXED_SCHEME_BATCH", "error",
          `Healthbridge: Mixed Scheme Batch`,
          `Batch contains ${schemes.size} different schemes. Healthbridge requires separate batches per scheme for proper routing.`,
          `Split into separate batches: ${Array.from(schemes).join(", ")}`,
        ));
      } else {
        issues.push(issue(ln, "batch", "SM_MIXED_SCHEME_BATCH", "warning",
          `${sw.name}: Mixed Scheme Batch`,
          `Batch contains ${schemes.size} different schemes (${Array.from(schemes).join(", ")}). Some switches handle mixed batches but others may require separation.`,
        ));
      }
    }
  }

  // ─── SM04: Emergency priority routing ──
  if (meta.isEmergency) {
    if (!meta.isRealTime) {
      issues.push(issue(ln, "batch", "SM_EMERGENCY_BATCH", "warning",
        `${sw.name}: Emergency in Batch Mode`,
        `Emergency claim submitted in batch mode. Emergency claims should use real-time submission for immediate processing and pre-auth response.`,
      ));
    }
  }

  // ─── SM05: Real-time timeout awareness per switch ──
  if (meta.isRealTime) {
    const timeouts: Record<string, number> = { HB: 30, MS: 45, SO: 60 };
    const timeout = timeouts[sw.code] ?? 45;
    issues.push(issue(ln, "batch", "SM_RT_TIMEOUT", "info",
      `${sw.name}: Real-Time Timeout`,
      `${sw.name} real-time timeout: ${timeout} seconds. If no response within ${timeout}s: check status before resubmitting to avoid duplicates.`,
    ));
  }

  // ─── SM06: Batch sequence numbering ──
  if (!meta.isRealTime && meta.batchNumber) {
    // BGM batch must be sequential per trading partner
    if (meta.batchNumber.startsWith("000000000000000000")) {
      issues.push(issue(ln, "batch", "SM_BATCH_SEQ_ZERO", "error",
        `${sw.name}: Zero Batch Number`,
        `Batch number is all zeros. BGM batch numbers must be sequential per trading partner, starting from 1.`,
      ));
    }
  }

  // ─── SM07: Batch size optimization ──
  if (!meta.isRealTime) {
    if (lines.length === 1 && sw.code !== "HB") {
      issues.push(issue(ln, "batch", "SM_SINGLE_CLAIM_BATCH", "info",
        `${sw.name}: Single Claim in Batch`,
        `Only 1 claim in batch. Consider real-time submission for faster turnaround, or wait to batch multiple claims for efficiency.`,
      ));
    }
    const optimalSize = Math.floor(sw.maxBatchSize * 0.8);
    if (lines.length > optimalSize && lines.length <= sw.maxBatchSize) {
      issues.push(issue(ln, "batch", "SM_BATCH_NEAR_LIMIT", "info",
        `${sw.name}: Batch Near Size Limit`,
        `Batch has ${lines.length}/${sw.maxBatchSize} claims (${Math.round(lines.length / sw.maxBatchSize * 100)}% capacity). Consider splitting to avoid timeout on large batches.`,
      ));
    }
  }

  // ─── SM08: End-of-day batch timing ──
  if (!meta.isRealTime) {
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 6) {
      issues.push(issue(ln, "batch", "SM_BATCH_TIMING", "info",
        `${sw.name}: Off-Hours Submission`,
        `Batch submitted outside business hours. ${sw.code === "HB" ? "Healthbridge processes 24/7 but support unavailable for queries." : sw.code === "SO" ? "SwitchOn has 99.8% uptime around the clock." : "MediSwitch processes 24/7."}`,
      ));
    }
  }

  // ─── SM09: Real-time claim with hospital codes ──
  if (meta.isRealTime) {
    const hasHospitalCodes = lines.some(l => {
      const tc = parseInt(l.tariffCode ?? "", 10);
      return l.placeOfService === "21" || l.admissionDate || (tc >= 500 && tc <= 2999);
    });
    if (hasHospitalCodes) {
      issues.push(issue(ln, "batch", "SM_RT_HOSPITAL", "warning",
        `${sw.name}: Hospital Claim via Real-Time`,
        `Hospital/surgical claims are typically submitted via batch mode after discharge. Real-time is mainly for GP/pharmacy POS claims.`,
      ));
    }
  }

  // ─── SM10: Pharmacy real-time POS requirement ──
  if (meta.isRealTime) {
    const hasPharmacy = lines.some(l => l.nappiCode && l.practitionerType?.toUpperCase() === "PH");
    if (hasPharmacy) {
      issues.push(issue(ln, "batch", "SM_RT_PHARMACY", "info",
        `${sw.name}: Pharmacy POS Claim`,
        `Pharmacy POS (point-of-sale) claim — real-time is the correct submission mode. Expect formulary check and generic substitution response from scheme.`,
      ));
    }
  }

  // ─── SM11: Mixed real-time and batch indicators ──
  if (meta.isRealTime && meta.batchNumber && lines.length > 1) {
    issues.push(issue(ln, "batch", "SM_MIXED_MODE", "warning",
      `${sw.name}: Mixed Mode Indicators`,
      `Claim has both real-time flag and batch number with multiple lines. Clarify submission mode — real-time is single-claim, batch uses BGM batch numbers.`,
    ));
  }

  // ─── SM12: Batch reconciliation reminder ──
  if (!meta.isRealTime && lines.length >= 10) {
    issues.push(issue(ln, "batch", "SM_BATCH_RECONCILE", "info",
      `${sw.name}: Batch Reconciliation`,
      `Large batch (${lines.length} claims). After submission, reconcile using the eRA (Electronic Remittance Advice) response. Match batch number to eRA for complete tracking.`,
    ));
  }

  // ─── SM13: UNT segment count prediction ──
  if (!meta.isRealTime) {
    // UNT trailer must contain the count of segments in the message
    // This helps predict and validate the trailer
    issues.push(issue(ln, "batch", "SM_UNT_COUNT", "info",
      `${sw.name}: UNT Segment Count`,
      `Batch will generate approximately ${estimateSegmentCount(lines)} EDIFACT segments. UNT trailer must contain the exact segment count and match UNH message reference.`,
    ));
  }

  return issues;
}

function estimateSegmentCount(lines: ClaimLineItem[]): number {
  // UNH + BGM + DTM(header) + NAD(SUP+TDN+MPN+MSN+SCH) = ~8
  // Per line: DTM + RFF(patient) + LIN + RFF(ICD) + QTY + MOA + LOC ≈ 7
  // UNT = 1
  return 8 + (lines.length * 7) + 1;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main Entry Point — Comprehensive Switchboard Validation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function validateForSwitchboard(
  lines: ClaimLineItem[],
  switchboardCode: string,
  meta?: ClaimBatchMetadata,
): ValidationIssue[] {
  const sw = SWITCHBOARDS[switchboardCode.toLowerCase()];
  if (!sw) return [];
  if (lines.length === 0) return [];

  const issues: ValidationIssue[] = [];

  // Phase 1: Batch-level structural validation
  issues.push(...validateBatchLevel(lines, sw));

  // Phase 2 + 3 + 4: Per-line validation (field, clinical, switch-specific)
  for (const line of lines) {
    issues.push(...validateFieldLevel(line, sw));
    issues.push(...validateClinicalCoherence(line, sw));
    issues.push(...validateSwitchSpecific(line, sw));
  }

  // Phase 5: EDIFACT structural validation
  issues.push(...validateEDIFACTStructure(lines, sw, meta));

  // Phase 6: Claim type routing (original/reversal/resubmission)
  issues.push(...validateClaimTypeRouting(lines, sw, meta));

  // Phase 7: Scheme routing validation
  issues.push(...validateSchemeRouting(lines, sw));

  // Phase 8: Response handling rules
  issues.push(...validateResponseHandling(lines, sw, meta));

  // Phase 9: Provider registration validation
  issues.push(...validateProviderRegistration(lines, sw, meta));

  // Phase 10: Real-time vs batch differences
  issues.push(...validateSubmissionMode(lines, sw, meta));

  return issues;
}

// ─── Rule Count Export (for dashboard) ────────────────────────────────────────

export function getSwitchboardRuleCount(): { total: number; perSwitch: Record<string, number>; byPhase: Record<string, number> } {
  const phases = {
    // Phase 1 — Batch (8)
    batch: ["B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08"],
    // Phase 2 — Field (54)
    field: [
      "F01a", "F01b", "F02a", "F02b", "F03a", "F03b",
      "F04a", "F04b", "F04c", "F04d",
      "F05a", "F05b", "F05c", "F05d", "F05e", "F05f",
      "F06a", "F06b", "F06c", "F06d", "F06e", "F06f", "F06g",
      "F07a", "F07b", "F07c", "F07d", "F07e", "F07f",
      "F08a", "F08b", "F08c",
      "F09a", "F09b", "F09c",
      "F10a", "F10b", "F10c",
      "F11a", "F11b", "F11c", "F11d", "F11e", "F11f",
      "F12a", "F12b", "F12c", "F12d",
      "F13a", "F13b", "F14a", "F14b", "F15", "F16a", "F16b",
    ],
    // Phase 3 — Clinical (40)
    clinical: [
      "C01a", "C01b", "C02a", "C02b", "C02c", "C02d", "C03", "C04",
      "C05a", "C05b", "C05c", "C05d", "C06a", "C06b", "C06c", "C07",
      "C08", "C09", "C10", "C11", "C12", "C13", "C14", "C15", "C16",
      "C17", "C18", "C19", "C20",
      "C21a", "C21b", "C22a", "C22b", "C23", "C24", "C25", "C26a", "C26b",
      "CS01", "CS02", "CS03", "CS04", "CS05",
    ],
    // Phase 5 — EDIFACT structural (30)
    edifact: [
      "E01", "E02", "E03",
      "E04a", "E04b", "E04c", "E04d", "E04e",
      "E05a", "E05b", "E05c", "E05d",
      "E06a", "E06b", "E06c", "E06d", "E06e", "E06f",
      "E07a", "E07b",
      "E08a", "E08b",
      "E09a", "E09b", "E09c", "E09d",
      "E10", "E11", "E12", "E13", "E14",
    ],
    // Phase 6 — Claim type routing (15)
    claimType: [
      "CT01", "CT02", "CT03", "CT04", "CT05a", "CT05b",
      "CT06a", "CT06b", "CT07", "CT08", "CT09", "CT10",
      "CT_CREDIT_NO_DCR", "CT_LATE_NO_MOTIVATION", "CT_EMERGENCY_ICD",
    ],
    // Phase 7 — Scheme routing (12)
    schemeRouting: [
      "SR01", "SR02", "SR03", "SR04", "SR05", "SR06",
      "SR07", "SR08", "SR09", "SR10",
      "SR_MIXED_SWITCH_SCHEMES", "SR_DH_PREAUTH",
    ],
    // Phase 8 — Response handling (4)
    responseHandling: [
      "RH01", "RH02", "RH03", "RH04",
    ],
    // Phase 9 — Provider registration (8)
    providerRegistration: [
      "PR01", "PR02", "PR03", "PR04", "PR05", "PR06", "PR07", "PR08",
    ],
    // Phase 10 — Submission mode (13)
    submissionMode: [
      "SM01", "SM02", "SM03", "SM04", "SM05", "SM06",
      "SM07", "SM08", "SM09", "SM10", "SM11", "SM12", "SM13",
    ],
  };

  const hbSpecific = ["HB01", "HB02", "HB03", "HB04", "HB05", "HB06"];
  const msSpecific = ["MS01", "MS02", "MS03", "MS04"];
  const soSpecific = ["SO01", "SO02", "SO03", "SO04", "SO05"];

  const commonCount = Object.values(phases).reduce((sum, rules) => sum + rules.length, 0);
  const totalSpecific = hbSpecific.length + msSpecific.length + soSpecific.length;

  const byPhase: Record<string, number> = {};
  for (const [phase, rules] of Object.entries(phases)) {
    byPhase[phase] = rules.length;
  }

  return {
    total: commonCount + totalSpecific,
    perSwitch: {
      healthbridge: commonCount + hbSpecific.length,
      mediswitch: commonCount + msSpecific.length,
      switchon: commonCount + soSpecific.length,
    },
    byPhase,
  };
}
