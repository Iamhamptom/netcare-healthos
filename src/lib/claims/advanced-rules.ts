// Advanced Validation Rules — Modifiers, Place-of-Service, Clinical Appropriateness
// These close the gaps that billing clerks currently handle manually

import type { ClaimLineItem, ValidationIssue } from "./types";

// ═══════════════════════════════════════════════════════════════
// MODIFIER VALIDATION
// SA uses numeric modifier codes attached to tariff codes
// ═══════════════════════════════════════════════════════════════

interface ModifierRule {
  code: string;
  name: string;
  description: string;
  validWith: string[];    // Tariff prefixes this modifier can be used with
  invalidWith: string[];  // Tariff prefixes this modifier CANNOT be used with
  requiresNote: boolean;  // Whether clinical justification is needed
}

// Modifiers that are valid PMB indicators (not true modifiers, treated as pass-through)
const PMB_INDICATOR_VALUES = ["PMB", "0000", "pmb"];

const MODIFIER_RULES: ModifierRule[] = [
  { code: "0002", name: "Bilateral procedure", description: "Both sides performed in same session", validWith: ["04", "05", "06", "07"], invalidWith: ["01", "02", "03"], requiresNote: false },
  { code: "0003", name: "Multiple procedures", description: "Additional procedure during same session", validWith: ["04", "05", "06"], invalidWith: ["01", "02"], requiresNote: false },
  { code: "0005", name: "Fifth+ procedure", description: "Fifth and subsequent procedures, 80% reduction", validWith: ["04", "05", "06"], invalidWith: ["01", "02"], requiresNote: false },
  { code: "0006", name: "Repeat procedure", description: "Same procedure repeated on same day", validWith: ["04", "05", "06", "07"], invalidWith: [], requiresNote: true },
  { code: "0011", name: "After-hours", description: "Service rendered outside normal practice hours", validWith: ["01", "02", "03", "04"], invalidWith: [], requiresNote: false },
  { code: "0012", name: "Sundays/public holidays", description: "Service on Sunday or public holiday", validWith: ["01", "02", "03", "04"], invalidWith: [], requiresNote: false },
  { code: "0018", name: "Emergency", description: "Emergency service requiring immediate attention", validWith: ["01", "02", "03", "04", "05", "06"], invalidWith: [], requiresNote: true },
  { code: "0019", name: "Neonatal surgery", description: "Surgery on neonates/low birth weight infants <2500g under GA. +50% surgeon units, +50% anaesthetic time.", validWith: ["04", "05", "06", "07"], invalidWith: ["01", "02", "03"], requiresNote: true },
  { code: "0021", name: "Decision for surgery", description: "Consultation that results in decision for surgery — allows billing consult + procedure same day", validWith: ["01", "02", "03"], invalidWith: [], requiresNote: true },
  { code: "0023", name: "Telehealth", description: "Consultation via video/audio technology", validWith: ["01", "02", "03"], invalidWith: ["04", "05", "06", "07"], requiresNote: false },
  { code: "0028", name: "Extended consultation >30min", description: "Consultation exceeding 30 minutes", validWith: ["01", "02", "03"], invalidWith: ["04", "05", "06"], requiresNote: false },
  // PHISC CCSA v11 (October 2024): Distinct procedural service for bilateral add-on codes
  { code: "09959", name: "Distinct procedural service", description: "CCSA v11: When add-on code performed bilaterally, report twice with 09959 instead of modifier 0002", validWith: ["04", "05", "06", "07"], invalidWith: ["01", "02", "03"], requiresNote: false },
];

export function validateModifier(line: ClaimLineItem): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!line.modifier) return issues;

  // Handle comma-separated multiple modifiers (e.g., "0011,0005")
  const modifierCodes = line.modifier.split(/[,;]/).map(m => m.trim()).filter(Boolean);

  // PMB indicator values are not real modifiers — pass through silently
  if (modifierCodes.length === 1 && PMB_INDICATOR_VALUES.includes(modifierCodes[0])) {
    return issues; // Valid PMB indicator, not a modifier error
  }

  // Flag multiple modifiers for review (informational)
  if (modifierCodes.length > 1) {
    issues.push({
      lineNumber: line.lineNumber, field: "modifier", code: "MULTIPLE_MODIFIERS",
      severity: "warning", rule: "Multiple Modifier Review",
      message: `Multiple modifiers submitted: ${modifierCodes.join(", ")}. Verify each modifier is applicable and correctly paired.`,
      suggestion: "Review that all modifiers are valid together. Some modifiers cannot be combined.",
    });
  }

  for (const modCode of modifierCodes) {
    // Skip PMB indicators in multi-modifier lists
    if (PMB_INDICATOR_VALUES.includes(modCode)) continue;

    const mod = MODIFIER_RULES.find(m => m.code === modCode);
    if (!mod) {
      issues.push({
        lineNumber: line.lineNumber, field: "modifier", code: "UNKNOWN_MODIFIER",
        severity: "warning", rule: "Unknown Modifier Code",
        message: `Modifier "${modCode}" is not a recognized SA modifier code.`,
        suggestion: "Check the modifier code. Common modifiers: 0002 (bilateral), 0011 (after-hours), 0018 (emergency), 0019 (neonatal surgery).",
      });
      continue;
    }

    // Modifier 0019 (neonatal surgery): age restriction — neonates only (age ≤ 1)
    if (modCode === "0019" && line.patientAge !== undefined && line.patientAge > 1) {
      issues.push({
        lineNumber: line.lineNumber, field: "modifier", code: "MODIFIER_AGE_MISMATCH",
        severity: "error", rule: "Neonatal Modifier on Non-Neonate",
        message: `Modifier 0019 (neonatal surgery) is restricted to neonates/infants ≤1 year, but patient is ${line.patientAge} years old.`,
        suggestion: "Remove modifier 0019 if the patient is not a neonate. This modifier adds 50% to surgical/anaesthetic units for low birth weight infants.",
      });
    }

    // Check if modifier is valid with this tariff
    if (line.tariffCode) {
      const prefix = line.tariffCode.substring(0, 2);
      if (mod.invalidWith.includes(prefix)) {
        issues.push({
          lineNumber: line.lineNumber, field: "modifier", code: "MODIFIER_INVALID_TARIFF",
          severity: "error", rule: "Modifier Not Valid With Tariff",
          message: `Modifier ${mod.code} (${mod.name}) cannot be used with tariff ${line.tariffCode}.`,
          suggestion: `This modifier is only valid with tariff prefixes: ${mod.validWith.join(", ")}.`,
        });
      }
    }

    // After-hours/Sunday modifiers — date validation
    if (modCode === "0012" && line.dateOfService) {
      const date = new Date(line.dateOfService);
      const day = date.getDay();
      if (!isNaN(date.getTime()) && day !== 0) {
        issues.push({
          lineNumber: line.lineNumber, field: "modifier", code: "MODIFIER_DAY_MISMATCH",
          severity: "warning", rule: "Sunday Modifier on Non-Sunday",
          message: `Modifier 0012 (Sundays/public holidays) used but ${line.dateOfService} is not a Sunday.`,
          suggestion: "Verify the date or use modifier 0011 (after-hours) instead.",
        });
      }
    }
  }

  return issues;
}

// ═══════════════════════════════════════════════════════════════
// PLACE-OF-SERVICE VALIDATION
// Different tariff rates apply based on where service was rendered
// ═══════════════════════════════════════════════════════════════

interface PlaceOfService {
  code: string;
  name: string;
  tariffMultiplier: number; // Some places get higher/lower rates
  validTariffPrefixes: string[];
}

const PLACES: PlaceOfService[] = [
  { code: "11", name: "Office/Surgery", tariffMultiplier: 1.0, validTariffPrefixes: ["01", "02", "03", "04", "07", "08"] },
  { code: "12", name: "Home visit", tariffMultiplier: 1.3, validTariffPrefixes: ["01", "02"] },
  { code: "21", name: "Inpatient hospital", tariffMultiplier: 1.0, validTariffPrefixes: ["01", "02", "03", "04", "05", "06", "07", "08", "12"] },
  { code: "22", name: "Outpatient hospital", tariffMultiplier: 1.0, validTariffPrefixes: ["01", "02", "03", "04", "05", "07"] },
  { code: "23", name: "Emergency room", tariffMultiplier: 1.0, validTariffPrefixes: ["01", "02", "03", "04", "05", "06", "07", "08"] },
  { code: "31", name: "Nursing facility", tariffMultiplier: 1.0, validTariffPrefixes: ["01", "02", "08"] },
  { code: "49", name: "Independent clinic", tariffMultiplier: 1.0, validTariffPrefixes: ["01", "02", "03", "04", "07", "08"] },
  { code: "50", name: "Community health centre", tariffMultiplier: 1.0, validTariffPrefixes: ["01", "02", "03", "04"] },
  { code: "72", name: "Day hospital/clinic", tariffMultiplier: 1.0, validTariffPrefixes: ["01", "02", "03", "04", "05", "06", "07"] },
];

export function validatePlaceOfService(line: ClaimLineItem & { placeOfService?: string }): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const pos = (line as unknown as Record<string, unknown>).placeOfService as string | undefined;
  if (!pos) return issues;

  const place = PLACES.find(p => p.code === pos);
  if (!place) {
    issues.push({
      lineNumber: line.lineNumber, field: "placeOfService", code: "UNKNOWN_POS",
      severity: "warning", rule: "Unknown Place of Service",
      message: `Place of service code "${pos}" is not recognized.`,
      suggestion: "Common codes: 11 (office), 12 (home), 21 (hospital inpatient), 22 (hospital outpatient), 23 (ER).",
    });
    return issues;
  }

  // Home visit without home visit tariff
  if (pos === "12" && line.tariffCode && !["0194", "0195"].includes(line.tariffCode)) {
    issues.push({
      lineNumber: line.lineNumber, field: "placeOfService", code: "POS_TARIFF_MISMATCH",
      severity: "warning", rule: "Home Visit Without Home Tariff",
      message: `Place of service is "Home visit" but tariff ${line.tariffCode} is not a home visit tariff (0194/0195).`,
      suggestion: "Use tariff 0194 (home visit consultation) for home visits.",
    });
  }

  // Emergency room without emergency tariff
  if (pos === "23" && line.tariffCode && !line.tariffCode.startsWith("06")) {
    issues.push({
      lineNumber: line.lineNumber, field: "placeOfService", code: "POS_EMERGENCY_TARIFF",
      severity: "info", rule: "Emergency Room Service",
      message: `Service in ER — ensure appropriate emergency tariff codes and modifier 0018 if applicable.`,
    });
  }

  return issues;
}

// ═══════════════════════════════════════════════════════════════
// CLINICAL APPROPRIATENESS
// Flag diagnosis ↔ procedure combinations that are clinically suspicious
// Based on CMS clinical guidelines and common fraud patterns
// ═══════════════════════════════════════════════════════════════

interface InappropriateCombo {
  diagnosisPattern: RegExp;  // ICD-10 code pattern
  tariffPattern: RegExp;     // Tariff code pattern
  reason: string;
  severity: "error" | "warning" | "info";
}

const INAPPROPRIATE_COMBOS: InappropriateCombo[] = [
  // Respiratory + cardiac procedures
  { diagnosisPattern: /^J0[0-9]/, tariffPattern: /^0308/, reason: "ECG (0308) not typically indicated for acute respiratory infection", severity: "warning" },
  // Simple URTI + specialist consultation
  { diagnosisPattern: /^J06/, tariffPattern: /^029/, reason: "Specialist consultation (029x) unusual for common cold (J06.x) — consider GP tariff", severity: "warning" },
  // Diabetes + brain CT without indication
  { diagnosisPattern: /^E1[0-4]/, tariffPattern: /^5210/, reason: "CT brain not routinely indicated for diabetes management", severity: "warning" },
  // Back pain + colonoscopy
  { diagnosisPattern: /^M54/, tariffPattern: /^0445/, reason: "Colonoscopy not indicated for back pain", severity: "warning" },
  // Mental health + surgical procedures
  { diagnosisPattern: /^F[0-9]/, tariffPattern: /^04[0-9][0-9]/, reason: "Surgical procedure unusual for mental health diagnosis — verify clinical indication", severity: "warning" },
  // Dental diagnosis + non-dental tariff
  { diagnosisPattern: /^K0[0-8]/, tariffPattern: /^029/, reason: "Specialist medical consultation for dental diagnosis — should be dental tariff", severity: "warning" },
  // Well-child check + extensive procedures
  { diagnosisPattern: /^Z00\.[01]/, tariffPattern: /^04[0-9]/, reason: "Surgical procedure on routine examination — document clinical indication", severity: "warning" },
  // Hypertension routine + pathology overkill
  { diagnosisPattern: /^I10/, tariffPattern: /^45[0-9]/, reason: "Specialised pathology (tumour markers, genetics) not routine for hypertension", severity: "warning" },
  // Pregnancy + male tariffs
  { diagnosisPattern: /^O/, tariffPattern: /^0290/, reason: "Obstetric cases should use obstetric tariff codes, not general specialist", severity: "info" },
  // Eye diagnosis + non-ophth tariff
  { diagnosisPattern: /^H[0-5][0-9]/, tariffPattern: /^01[0-9]/, reason: "Eye condition with GP consultation — consider ophthalmology referral tariff", severity: "info" },
];

export function validateClinicalAppropriateness(line: ClaimLineItem): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!line.primaryICD10 || !line.tariffCode) return issues;

  for (const combo of INAPPROPRIATE_COMBOS) {
    if (combo.diagnosisPattern.test(line.primaryICD10) && combo.tariffPattern.test(line.tariffCode)) {
      issues.push({
        lineNumber: line.lineNumber,
        field: "tariffCode",
        code: "CLINICAL_APPROPRIATENESS",
        severity: combo.severity,
        rule: "Clinical Appropriateness",
        message: `${line.primaryICD10} + ${line.tariffCode}: ${combo.reason}`,
        suggestion: "Review whether this procedure is clinically justified for this diagnosis. Schemes may flag this for clinical review.",
      });
    }
  }

  return issues;
}

// ═══════════════════════════════════════════════════════════════
// REJECTION FEEDBACK TYPES
// ═══════════════════════════════════════════════════════════════

export interface RejectionFeedback {
  claimId?: string;
  primaryICD10: string;
  tariffCode?: string;
  schemeCode: string;
  rejectionCode: string;     // e.g., "02", "54", "87" from the scheme
  rejectionReason: string;   // Human-readable reason
  originalAmount?: number;
  dateOfService?: string;
  practiceId: string;
  reportedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// MEDICATION-DIAGNOSIS MISMATCH
// Flags when dispensed medication category doesn't match diagnosis
// ═══════════════════════════════════════════════════════════════

import { lookupNAPPI } from "./nappi-database";

/**
 * Maps NAPPI medication categories to the ICD-10 chapter prefixes they typically treat.
 * If the dispensed medication's category doesn't match the diagnosis chapter, flag it.
 */
const NAPPI_DIAGNOSIS_MAP: Record<string, { validPrefixes: string[]; label: string }> = {
  cardiovascular: { validPrefixes: ["I", "R"], label: "circulatory/cardiac conditions (I-codes)" },
  diabetes: { validPrefixes: ["E"], label: "endocrine/metabolic conditions (E-codes)" },
  respiratory: { validPrefixes: ["J", "R"], label: "respiratory conditions (J-codes)" },
  antibiotic: { validPrefixes: ["A", "B", "J", "K", "L", "M", "N", "S", "T", "H", "G"], label: "infectious/bacterial conditions" },
  analgesic: { validPrefixes: ["M", "R", "S", "T", "G", "K"], label: "pain/musculoskeletal/injury conditions" },
  mental_health: { validPrefixes: ["F", "G", "R"], label: "mental/behavioural conditions (F-codes)" },
  gastrointestinal: { validPrefixes: ["K", "R"], label: "digestive conditions (K-codes)" },
  dermatology: { validPrefixes: ["L", "B"], label: "skin conditions (L-codes)" },
  thyroid: { validPrefixes: ["E"], label: "endocrine conditions (E-codes)" },
  arv: { validPrefixes: ["B", "Z"], label: "HIV/immunodeficiency (B20-B24)" },
};

function validateMedicationDiagnosis(line: ClaimLineItem): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!line.nappiCode || !line.primaryICD10) return issues;

  const nappi = lookupNAPPI(line.nappiCode);
  if (!nappi) return issues; // Unknown NAPPI — can't cross-reference

  const mapping = NAPPI_DIAGNOSIS_MAP[nappi.category];
  if (!mapping) return issues; // Category not mapped (e.g., supplements)

  const diagPrefix = line.primaryICD10.charAt(0).toUpperCase();
  if (!mapping.validPrefixes.includes(diagPrefix)) {
    issues.push({
      lineNumber: line.lineNumber,
      field: "nappiCode",
      code: "MED_DIAGNOSIS_MISMATCH",
      severity: "warning",
      rule: "Medication-Diagnosis Mismatch",
      message: `${nappi.description} (${nappi.category}) dispensed for diagnosis "${line.primaryICD10}" — this medication is typically used for ${mapping.label}.`,
      suggestion: "Verify the medication is appropriate for this diagnosis. Schemes may query this combination.",
    });
  }

  return issues;
}

// ═══════════════════════════════════════════════════════════════
// TARIFF CATEGORY-DIAGNOSIS MISMATCH
// Flags procedures/imaging billed with unrelated diagnoses
// ═══════════════════════════════════════════════════════════════

import { lookupTariff } from "./tariff-database";

/**
 * Catch tariff categories billed against clearly unrelated diagnoses.
 * Example: dental tariff (81xx) for URTI, or minor procedure (04xx) for GERD.
 */
function validateTariffCategoryDiagnosis(line: ClaimLineItem): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!line.tariffCode || !line.primaryICD10) return issues;

  const tariff = lookupTariff(line.tariffCode);
  if (!tariff) return issues;

  const diagPrefix = line.primaryICD10.charAt(0).toUpperCase();
  const tariffPrefix = line.tariffCode.substring(0, 2);

  // Dental tariff (81xx/82xx/83xx/84xx/85xx/86xx/87xx) for non-dental diagnosis
  // Dental diagnoses: K00-K14 (oral cavity diseases)
  if (tariff.category === "dental" && !/^K0[0-9]|^K1[0-4]/.test(line.primaryICD10)) {
    issues.push({
      lineNumber: line.lineNumber,
      field: "tariffCode",
      code: "DENTAL_TARIFF_MISMATCH",
      severity: "error",
      rule: "Dental Tariff for Non-Dental Diagnosis",
      message: `Dental tariff "${line.tariffCode}" (${tariff.description}) billed for diagnosis "${line.primaryICD10}" which is not a dental/oral condition.`,
      suggestion: "Dental tariff codes (81xx-87xx) should only be billed with dental diagnoses (K00-K14).",
    });
    return issues; // Don't stack with other checks
  }

  // Radiology codes for clearly unrelated body systems
  // 51xx = chest X-ray — should be J (respiratory), I (cardiac), R (symptoms), S/T (injury chest), C (neoplasm)
  if (tariffPrefix === "51" && !["J", "I", "R", "S", "T", "C"].includes(diagPrefix)) {
    issues.push({
      lineNumber: line.lineNumber,
      field: "tariffCode",
      code: "IMAGING_DIAGNOSIS_MISMATCH",
      severity: "warning",
      rule: "Imaging-Diagnosis Mismatch",
      message: `Chest X-ray (${line.tariffCode}) billed for diagnosis "${line.primaryICD10}" — chest imaging is typically for respiratory (J), cardiac (I), or trauma (S/T) conditions.`,
      suggestion: "Verify the imaging study matches the clinical indication. Schemes may query unrelated imaging.",
    });
  }

  // Minor procedure (0401) with non-procedural diagnoses
  // Procedures need a diagnosis that typically requires intervention
  // Flag when used with conditions normally managed with medication only
  if (line.tariffCode === "0401") {
    const medicalOnlyPrefixes = ["E", "I", "K", "J"];
    const medicalOnlyCodes = ["E11", "E78", "I10", "K21", "K29", "J06", "J45"];
    const codeBase = line.primaryICD10.replace(/\.\d+$/, ""); // Strip decimal
    if (medicalOnlyPrefixes.includes(diagPrefix) && medicalOnlyCodes.some(c => codeBase.startsWith(c))) {
      issues.push({
        lineNumber: line.lineNumber,
        field: "tariffCode",
        code: "PROCEDURE_DIAGNOSIS_MISMATCH",
        severity: "warning",
        rule: "Procedure-Diagnosis Mismatch",
        message: `Minor procedure (0401) billed for "${line.primaryICD10}" — this condition is typically managed with medication, not procedures.`,
        suggestion: "Verify a procedure was clinically performed. Use consultation tariffs if this was a consult-only visit.",
      });
    }
  }

  return issues;
}

// ═══════════════════════════════════════════════════════════════
// COMBINED ADVANCED VALIDATION
// Run all advanced rules in one call
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// MOTIVATION TEXT OVERRIDE (AI LAYER)
// If a claim has a clinical motivation/justification that explains
// a flagged combination, downgrade the warning to info.
// This is the "doctor's note" — a human auditor would accept this.
// ═══════════════════════════════════════════════════════════════

/** Codes that can be overridden by clinical motivation */
const MOTIVATION_OVERRIDABLE_CODES = new Set([
  "CLINICAL_APPROPRIATENESS",
  "MED_DIAGNOSIS_MISMATCH",
  "IMAGING_DIAGNOSIS_MISMATCH",
  "PROCEDURE_DIAGNOSIS_MISMATCH",
]);

function applyMotivationOverrides(line: ClaimLineItem, issues: ValidationIssue[]): ValidationIssue[] {
  // No motivation text → no override possible
  if (!line.motivationText || line.motivationText.length < 5) return issues;

  const motivation = line.motivationText.toLowerCase();

  return issues.map(issue => {
    // Only override clinical warnings, never errors or administrative issues
    if (issue.severity !== "warning") return issue;
    if (!MOTIVATION_OVERRIDABLE_CODES.has(issue.code)) return issue;

    // Check if motivation provides a plausible clinical justification
    // Keywords that indicate clinical reasoning (not just filler text)
    const clinicalKeywords = [
      "suspected", "rule out", "r/o", "exclude", "differential",
      "concurrent", "comorbid", "secondary", "associated", "radiating",
      "fell", "injury", "fracture", "trauma", "accident",
      "chronic", "recurrent", "progressive", "worsening", "acute",
      "endoscop", "biopsy", "investigation", "evaluation", "assessment",
      "barretts", "cancer", "malignant", "tumor", "mass",
      "headache", "pain", "fever", "infection", "inflammation",
      "prescribed for", "indicated for", "treating", "management of",
    ];

    const hasJustification = clinicalKeywords.some(kw => motivation.includes(kw));

    if (hasJustification) {
      // Override: downgrade to info with explanation
      return {
        ...issue,
        severity: "info" as const,
        code: "MOTIVATION_OVERRIDE",
        rule: "Clinical Motivation Accepted",
        message: `${issue.message} — OVERRIDDEN by clinical motivation: "${line.motivationText}"`,
        suggestion: "Clinical justification provided and accepted. Scheme may still audit.",
      };
    }

    return issue;
  });
}

// ═══════════════════════════════════════════════════════════════
// COMBINED ADVANCED VALIDATION
// Run all advanced rules in one call
// ═══════════════════════════════════════════════════════════════

export function runAdvancedValidation(lines: ClaimLineItem[]): ValidationIssue[] {
  const allIssues: ValidationIssue[] = [];
  for (const line of lines) {
    let lineIssues: ValidationIssue[] = [];
    lineIssues.push(...validateModifier(line));
    lineIssues.push(...validatePlaceOfService(line));
    lineIssues.push(...validateClinicalAppropriateness(line));
    lineIssues.push(...validateMedicationDiagnosis(line));
    lineIssues.push(...validateTariffCategoryDiagnosis(line));

    // Apply motivation text overrides LAST — after all clinical flags fired
    lineIssues = applyMotivationOverrides(line, lineIssues);

    allIssues.push(...lineIssues);
  }
  return allIssues;
}
