// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Clinical Validation Rules Engine
// Implements SA healthcare coding standards from the VisioCorp Knowledge Base:
// - ICD-10 gender/age restrictions (KB 03)
// - External cause code (ECC) enforcement for S/T injuries (KB 03, mandatory SA rule)
// - Asterisk/dagger system (KB 03, MIT Column K/L)
// - Diabetes type conflict detection (KB 03)
// - R-code (symptom) review triggers (KB 03)
// - PMB benefit routing: risk pool vs savings (Medical Schemes Act, Reg 10(6))
// - DSP existence check for co-payment rules (CMS v Genesis [2015])
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── ICD-10 Gender Restrictions (KB 03) ─────────────────────────────────────

/** Male-only ICD-10 code prefixes per SA coding standards */
export const MALE_ONLY_ICD10 = [
  "N40", "N41", "N42", "N43", "N44", "N45", "N46", "N47", "N48", "N49", "N50", "N51",
  "C60", "C61", "C62", "C63",
  "D29", "D40",
];

/** Female-only ICD-10 code prefixes per SA coding standards */
export const FEMALE_ONLY_ICD10 = [
  // All pregnancy/obstetric codes
  "O00", "O01", "O02", "O03", "O04", "O05", "O06", "O07", "O08", "O09",
  "O10", "O11", "O12", "O13", "O14", "O15", "O16", "O20", "O21", "O22",
  "O23", "O24", "O25", "O26", "O28", "O29", "O30", "O31", "O32", "O33",
  "O34", "O35", "O36", "O40", "O41", "O42", "O43", "O44", "O45", "O46",
  "O47", "O48", "O60", "O61", "O62", "O63", "O64", "O65", "O66", "O67",
  "O68", "O69", "O70", "O71", "O72", "O73", "O74", "O75", "O80", "O81",
  "O82", "O83", "O84", "O85", "O86", "O87", "O88", "O89", "O90", "O91",
  "O92", "O95", "O96", "O97", "O98", "O99",
  // Female reproductive
  "N70", "N71", "N72", "N73", "N74", "N75", "N76", "N77",
  "N80", "N81", "N82", "N83", "N84", "N85", "N86", "N87", "N88", "N89",
  "N90", "N91", "N92", "N93", "N94", "N95", "N96", "N97", "N98",
  // Female cancers
  "C51", "C52", "C53", "C54", "C55", "C56", "C57", "C58",
  "D06", "D25", "D26", "D27", "D28", "D39",
];

/**
 * Check if an ICD-10 code has a gender restriction.
 * Returns the required gender or null if no restriction.
 */
export function getGenderRestriction(icd10: string): "M" | "F" | null {
  if (MALE_ONLY_ICD10.some(p => icd10.startsWith(p))) return "M";
  if (FEMALE_ONLY_ICD10.some(p => icd10.startsWith(p))) return "F";
  return null;
}

/**
 * Validate gender against ICD-10 code restriction.
 */
export function validateGenderForCode(icd10: string, patientGender: "M" | "F" | "U"): {
  valid: boolean;
  restriction: "M" | "F" | null;
  message?: string;
} {
  if (patientGender === "U") return { valid: true, restriction: null };
  const restriction = getGenderRestriction(icd10);
  if (!restriction) return { valid: true, restriction: null };
  if (restriction === patientGender) return { valid: true, restriction };
  const genderLabel = restriction === "M" ? "male" : "female";
  return {
    valid: false,
    restriction,
    message: `ICD-10 code "${icd10}" is restricted to ${genderLabel} patients but patient gender is ${patientGender === "M" ? "male" : "female"}`,
  };
}

// ─── ICD-10 Age Restrictions (KB 03) ────────────────────────────────────────

/**
 * Validate age against ICD-10 code restrictions.
 * P00-P96 = neonates only (age <= 1)
 * O00-O99 = reproductive age (12-55)
 */
export function validateAgeForCode(icd10: string, patientAge: number): {
  valid: boolean;
  message?: string;
} {
  // Perinatal codes: neonates only
  if (/^P\d{2}/.test(icd10) && patientAge > 1) {
    return { valid: false, message: `Perinatal code "${icd10}" (P00-P96) is for neonates only but patient age is ${patientAge}` };
  }
  // Obstetric codes: reproductive age
  if (/^O\d{2}/.test(icd10)) {
    if (patientAge < 12 || patientAge > 55) {
      return { valid: false, message: `Obstetric code "${icd10}" (O00-O99) is for reproductive age (12-55) but patient age is ${patientAge}` };
    }
  }
  return { valid: true };
}

// ─── External Cause Code (ECC) Enforcement (KB 03, SA MANDATORY) ────────────

/**
 * Check if an ICD-10 code requires an External Cause Code (ECC).
 * SA coding standards MANDATE V01-Y98 as secondary for all S/T injury codes.
 * This is the #1 cause of rejections — 30% of all rejections.
 */
export function requiresExternalCauseCode(icd10: string): boolean {
  return /^[ST]\d{2}/.test(icd10);
}

/**
 * Check if a code IS an external cause code (V01-Y98).
 */
export function isExternalCauseCode(icd10: string): boolean {
  return /^[VWXY]\d{2}/.test(icd10);
}

/**
 * Validate that injury codes have accompanying ECC.
 */
export function validateExternalCauseCodes(primaryIcd10: string, secondaryIcd10s: string[]): {
  valid: boolean;
  message?: string;
  suggestion?: string;
} {
  if (!requiresExternalCauseCode(primaryIcd10)) return { valid: true };
  const hasECC = secondaryIcd10s.some(c => isExternalCauseCode(c));
  if (hasECC) return { valid: true };
  return {
    valid: false,
    message: `Injury code "${primaryIcd10}" requires an External Cause Code (V01-Y98) as secondary — SA mandatory rule`,
    suggestion: "Add ECC: W19 (fall), V89.2 (MVA), X59 (unspecified accident), X85-Y09 (assault), X71-X83 (self-harm)",
  };
}

/**
 * Validate that external cause codes are NOT used as primary.
 */
export function validateECCNotPrimary(icd10: string): {
  valid: boolean;
  message?: string;
} {
  if (!isExternalCauseCode(icd10)) return { valid: true };
  return {
    valid: false,
    message: `External cause code "${icd10}" (V01-Y98) cannot be the primary diagnosis — use the injury code (S/T) as primary`,
  };
}

// ─── Asterisk/Dagger System (KB 03, MIT Column K/L) ────────────────────────

/** Known asterisk (manifestation) codes that CANNOT be primary */
const ASTERISK_CODES = [
  "G63", "H42", "H36", "M14", "N08", "L99", "G73", "I43", "J17", "K23",
  "K67", "K77", "K87", "K93", "M01", "M03", "M07", "M09", "M36", "M49",
  "M63", "M68", "M73", "M82", "M90", "N16", "N22", "N29", "N33", "N37",
  "N51", "N74", "N77", "E35", "E90", "F00", "F02", "G01", "G02", "G05",
  "G07", "G13", "G22", "G26", "G32", "G46", "G53", "G55", "G59", "G94",
  "G99", "H03", "H06", "H13", "H19", "H22", "H28", "H32", "H45", "H48",
  "H58", "H62", "H67", "H75", "H82", "H94", "I32", "I39", "I41", "I52",
  "I68", "I79", "I98", "J91", "J99", "L14", "L45", "L54", "L62", "L86",
  "N74", "P75",
];

/**
 * Check if an ICD-10 code is an asterisk (manifestation) code.
 * Asterisk codes CANNOT be used as primary diagnosis.
 */
export function isAsteriskCode(icd10: string): boolean {
  const prefix = icd10.slice(0, 3);
  return ASTERISK_CODES.includes(prefix);
}

/**
 * Validate that asterisk codes are not used as primary.
 */
export function validateAsteriskNotPrimary(icd10: string): {
  valid: boolean;
  message?: string;
} {
  if (!isAsteriskCode(icd10)) return { valid: true };
  return {
    valid: false,
    message: `Asterisk/manifestation code "${icd10}" cannot be the primary diagnosis — use the underlying etiology (dagger) code as primary`,
  };
}

// ─── Diabetes Type Conflict (KB 03) ─────────────────────────────────────────

/**
 * Detect E10 (Type 1) and E11 (Type 2) diabetes conflict.
 * A patient cannot have both simultaneously.
 */
export function detectDiabetesConflict(icd10Codes: string[]): {
  conflict: boolean;
  message?: string;
} {
  const hasType1 = icd10Codes.some(c => c.startsWith("E10"));
  const hasType2 = icd10Codes.some(c => c.startsWith("E11"));
  if (hasType1 && hasType2) {
    return {
      conflict: true,
      message: "E10 (Type 1 diabetes) and E11 (Type 2 diabetes) cannot both be present — schemes will reject this as clinically impossible",
    };
  }
  return { conflict: false };
}

// ─── R-Code (Symptom) Review Trigger (KB 03) ─────────────────────────────────

/**
 * Check if an ICD-10 code is an R-code (symptoms/signs).
 * R-codes are valid but may trigger review if a definitive diagnosis is available.
 */
export function isSymptomCode(icd10: string): boolean {
  return /^R\d{2}/.test(icd10);
}

/**
 * Flag R-codes when used as primary diagnosis.
 */
export function flagSymptomCodeAsPrimary(icd10: string): {
  flagged: boolean;
  message?: string;
  suggestion?: string;
} {
  if (!isSymptomCode(icd10)) return { flagged: false };
  return {
    flagged: true,
    message: `Symptom code "${icd10}" (Chapter XVIII) used as primary — may result in reduced reimbursement`,
    suggestion: "If a definitive diagnosis has been established, use the specific diagnosis code instead of the symptom code",
  };
}

// ─── PMB Benefit Routing (Medical Schemes Act, Regulation 10(6)) ────────────

export type BenefitPool = "risk" | "savings" | "gap" | "above_threshold";

/**
 * Determine the correct benefit pool for a claim.
 * PMBs MUST be paid from RISK pool, NEVER from savings (Regulation 10(6)).
 */
export function determineBenefitPool(data: {
  isPMB: boolean;
  isCDL: boolean;
  isEmergency: boolean;
  savingsAvailable: number;
  riskBenefitAvailable: boolean;
  aboveThresholdBenefit: boolean;
  gapCoverAvailable: boolean;
}): {
  pool: BenefitPool;
  reason: string;
  pmbOverride: boolean;
} {
  // PMBs always from risk pool — Regulation 10(6)
  if (data.isPMB || data.isEmergency) {
    return {
      pool: "risk",
      reason: "PMB/emergency condition — must be paid from risk pool per Regulation 10(6), never from savings",
      pmbOverride: true,
    };
  }

  // CDL chronic medication — typically from chronic benefit (risk pool)
  if (data.isCDL) {
    return {
      pool: "risk",
      reason: "CDL chronic condition — chronic medication benefit from risk pool",
      pmbOverride: false,
    };
  }

  // Standard benefit routing: savings → gap → above threshold → risk
  if (data.savingsAvailable > 0) {
    return { pool: "savings", reason: "Day-to-day benefit — deducted from Medical Savings Account", pmbOverride: false };
  }
  if (data.gapCoverAvailable) {
    return { pool: "gap", reason: "Savings depleted — covered by gap/self-payment gap benefit", pmbOverride: false };
  }
  if (data.aboveThresholdBenefit) {
    return { pool: "above_threshold", reason: "Above Threshold Benefit (ATB) — covered from ATB pool", pmbOverride: false };
  }

  return { pool: "risk", reason: "All day-to-day benefits depleted — covered from risk pool", pmbOverride: false };
}

// ─── DSP Co-Payment Rules (CMS v Genesis [2015]) ────────────────────────────

/**
 * Determine if a co-payment can be applied for a PMB claim.
 * Per CMS v Genesis [2015]: if no DSP appointed, must pay in full at ANY provider.
 */
export function canApplyPMBCoPay(data: {
  isPMB: boolean;
  dspExists: boolean;
  usedDSP: boolean;
  isEmergency: boolean;
}): {
  canApplyCoPay: boolean;
  reason: string;
} {
  if (!data.isPMB) {
    return { canApplyCoPay: true, reason: "Non-PMB claim — standard co-payment rules apply" };
  }
  if (data.isEmergency) {
    return { canApplyCoPay: false, reason: "Emergency PMB — no co-payment allowed at any provider" };
  }
  if (!data.dspExists) {
    return { canApplyCoPay: false, reason: "No DSP appointed — PMB must be paid in full at any provider (CMS v Genesis [2015])" };
  }
  if (data.usedDSP) {
    return { canApplyCoPay: false, reason: "PMB at DSP — must pay in full, no co-payment" };
  }
  return { canApplyCoPay: true, reason: "PMB at non-DSP when DSP exists — co-payment may apply (pay at least DSP rate)" };
}

// ─── Comprehensive Claim Validation (all rules combined) ────────────────────

export interface ClinicalValidationIssue {
  rule: string;
  severity: "error" | "warning" | "info";
  message: string;
  suggestion?: string;
  category: "gender" | "age" | "ecc" | "asterisk" | "conflict" | "symptom" | "pmb_routing" | "dsp";
}

/**
 * Run ALL clinical validation rules against a claim.
 * Returns array of issues found.
 */
export function validateClinicalRules(data: {
  primaryIcd10: string;
  secondaryIcd10s?: string[];
  patientGender?: "M" | "F" | "U";
  patientAge?: number;
  allIcd10Codes?: string[];
}): ClinicalValidationIssue[] {
  const issues: ClinicalValidationIssue[] = [];
  const allCodes = data.allIcd10Codes || [data.primaryIcd10, ...(data.secondaryIcd10s || [])];

  // Gender restriction
  if (data.patientGender && data.patientGender !== "U") {
    const genderCheck = validateGenderForCode(data.primaryIcd10, data.patientGender);
    if (!genderCheck.valid) {
      issues.push({ rule: "GENDER_RESTRICTION", severity: "error", message: genderCheck.message!, category: "gender" });
    }
  }

  // Age restriction
  if (data.patientAge !== undefined) {
    const ageCheck = validateAgeForCode(data.primaryIcd10, data.patientAge);
    if (!ageCheck.valid) {
      issues.push({ rule: "AGE_RESTRICTION", severity: "error", message: ageCheck.message!, category: "age" });
    }
  }

  // ECC enforcement (SA mandatory)
  const eccCheck = validateExternalCauseCodes(data.primaryIcd10, data.secondaryIcd10s || []);
  if (!eccCheck.valid) {
    issues.push({ rule: "ECC_REQUIRED", severity: "error", message: eccCheck.message!, suggestion: eccCheck.suggestion, category: "ecc" });
  }

  // ECC not primary
  const eccPrimaryCheck = validateECCNotPrimary(data.primaryIcd10);
  if (!eccPrimaryCheck.valid) {
    issues.push({ rule: "ECC_NOT_PRIMARY", severity: "error", message: eccPrimaryCheck.message!, category: "ecc" });
  }

  // Asterisk not primary
  const asteriskCheck = validateAsteriskNotPrimary(data.primaryIcd10);
  if (!asteriskCheck.valid) {
    issues.push({ rule: "ASTERISK_NOT_PRIMARY", severity: "error", message: asteriskCheck.message!, category: "asterisk" });
  }

  // Diabetes conflict
  const diabetesCheck = detectDiabetesConflict(allCodes);
  if (diabetesCheck.conflict) {
    issues.push({ rule: "DIABETES_CONFLICT", severity: "error", message: diabetesCheck.message!, category: "conflict" });
  }

  // R-code review trigger
  const symptomCheck = flagSymptomCodeAsPrimary(data.primaryIcd10);
  if (symptomCheck.flagged) {
    issues.push({ rule: "SYMPTOM_CODE_PRIMARY", severity: "warning", message: symptomCheck.message!, suggestion: symptomCheck.suggestion, category: "symptom" });
  }

  return issues;
}
