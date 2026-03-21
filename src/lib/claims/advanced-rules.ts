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

const MODIFIER_RULES: ModifierRule[] = [
  { code: "0002", name: "Bilateral procedure", description: "Both sides performed in same session", validWith: ["04", "05", "06", "07"], invalidWith: ["01", "02", "03"], requiresNote: false },
  { code: "0003", name: "Multiple procedures", description: "Additional procedure during same session", validWith: ["04", "05", "06"], invalidWith: ["01", "02"], requiresNote: false },
  { code: "0006", name: "Repeat procedure", description: "Same procedure repeated on same day", validWith: ["04", "05", "06", "07"], invalidWith: [], requiresNote: true },
  { code: "0011", name: "After-hours", description: "Service rendered outside normal practice hours", validWith: ["01", "02", "03", "04"], invalidWith: [], requiresNote: false },
  { code: "0012", name: "Sundays/public holidays", description: "Service on Sunday or public holiday", validWith: ["01", "02", "03", "04"], invalidWith: [], requiresNote: false },
  { code: "0018", name: "Emergency", description: "Emergency service requiring immediate attention", validWith: ["01", "02", "03", "04", "05", "06"], invalidWith: [], requiresNote: true },
  { code: "0023", name: "Telehealth", description: "Consultation via video/audio technology", validWith: ["01", "02", "03"], invalidWith: ["04", "05", "06", "07"], requiresNote: false },
  { code: "0028", name: "Extended consultation >30min", description: "Consultation exceeding 30 minutes", validWith: ["01", "02", "03"], invalidWith: ["04", "05", "06"], requiresNote: false },
];

export function validateModifier(line: ClaimLineItem): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!line.modifier) return issues;

  const mod = MODIFIER_RULES.find(m => m.code === line.modifier);
  if (!mod) {
    issues.push({
      lineNumber: line.lineNumber, field: "modifier", code: "UNKNOWN_MODIFIER",
      severity: "warning", rule: "Unknown Modifier Code",
      message: `Modifier "${line.modifier}" is not a recognized SA modifier code.`,
      suggestion: "Check the modifier code. Common modifiers: 0002 (bilateral), 0011 (after-hours), 0018 (emergency).",
    });
    return issues;
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

  // After-hours/emergency modifiers on weekday daytime
  if ((line.modifier === "0011" || line.modifier === "0012") && line.dateOfService) {
    const date = new Date(line.dateOfService);
    const day = date.getDay();
    if (line.modifier === "0012" && day !== 0) { // 0 = Sunday
      issues.push({
        lineNumber: line.lineNumber, field: "modifier", code: "MODIFIER_DAY_MISMATCH",
        severity: "warning", rule: "Sunday Modifier on Non-Sunday",
        message: `Modifier 0012 (Sundays/public holidays) used but ${line.dateOfService} is not a Sunday.`,
        suggestion: "Verify the date or use modifier 0011 (after-hours) instead.",
      });
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
// COMBINED ADVANCED VALIDATION
// Run all advanced rules in one call
// ═══════════════════════════════════════════════════════════════

export function runAdvancedValidation(lines: ClaimLineItem[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const line of lines) {
    issues.push(...validateModifier(line));
    issues.push(...validatePlaceOfService(line));
    issues.push(...validateClinicalAppropriateness(line));
  }
  return issues;
}
