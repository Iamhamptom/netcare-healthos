// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Switchboard / Clearing House Rules
//
// SA has 3 major switching houses. Each has different format requirements,
// tariff acceptance rules, and adjudication logic. Matching the EXACT rules
// of the target switch turns "might be rejected" into "WILL be rejected."
//
// Switchboards:
// - Healthbridge (Netcare, 7,000+ practices)
// - MediSwitch / MediKredit (broad market)
// - SwitchOn (smaller practices)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { ClaimLineItem, ValidationIssue } from "./types";

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
}

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
    requiresSpecificity: true,  // Healthbridge rejects 3-char codes
    maxAmountPerLine: 50000,    // R50K per line — above this needs manual auth
    validatesNAPPI: true,
    requiresECC: true,
    genderCheckEnabled: true,
    modifierValidation: "strict",
    duplicateWindowDays: 30,    // Healthbridge checks 30-day window for duplicates
    motivationPriority: true,
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
    requiresSpecificity: false,  // MediSwitch is less strict on specificity
    maxAmountPerLine: 100000,
    validatesNAPPI: false,
    requiresECC: true,
    genderCheckEnabled: true,
    modifierValidation: "moderate",
    duplicateWindowDays: 60,
    motivationPriority: false,
  },
  switchon: {
    code: "SO",
    name: "SwitchOn",
    edifactVersion: "MEDCLM v0-912-13.1",
    format: "EDIFACT",
    maxBatchSize: 200,
    claimWindowDays: 90,        // SwitchOn has shorter claim window
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
    requiresECC: false,         // SwitchOn doesn't enforce ECC
    genderCheckEnabled: false,   // No gender validation
    modifierValidation: "none",
    duplicateWindowDays: 30,
    motivationPriority: false,
  },
};

export const SWITCHBOARD_LIST = Object.entries(SWITCHBOARDS).map(([key, sw]) => ({
  code: key,
  name: sw.name,
  description: `${sw.edifactVersion} — ${sw.format}`,
}));

// ─── Switchboard Validation ────────────────────────────────────────────────

export function validateForSwitchboard(
  lines: ClaimLineItem[],
  switchboardCode: string,
): ValidationIssue[] {
  const sw = SWITCHBOARDS[switchboardCode.toLowerCase()];
  if (!sw) return [];

  const issues: ValidationIssue[] = [];

  for (const line of lines) {
    const ln = line.lineNumber;

    // ── Required fields check (switch auto-rejects these) ──
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
        issues.push({
          lineNumber: ln,
          field: field.toLowerCase(),
          code: "SWITCH_REQUIRED_FIELD",
          severity: "error",
          rule: `${sw.name}: Missing Required Field`,
          message: `${sw.name} requires "${field}" for all claims. This claim will be auto-rejected at the switch.`,
          suggestion: `Add the ${field} value before submitting to ${sw.name}.`,
        });
      }
    }

    // ── Amount limit ──
    if (line.amount && line.amount > sw.maxAmountPerLine) {
      issues.push({
        lineNumber: ln, field: "amount", code: "SWITCH_AMOUNT_LIMIT",
        severity: "error", rule: `${sw.name}: Amount Exceeds Limit`,
        message: `R${line.amount.toFixed(2)} exceeds ${sw.name}'s per-line limit of R${sw.maxAmountPerLine.toLocaleString()}. Requires manual authorisation.`,
        suggestion: `Claims above R${sw.maxAmountPerLine.toLocaleString()} need pre-auth before submission to ${sw.name}.`,
      });
    }

    // ── Specificity enforcement ──
    if (sw.requiresSpecificity && line.primaryICD10) {
      const code = line.primaryICD10;
      if (/^[A-Z]\d{2}$/i.test(code) && !code.includes(".")) {
        issues.push({
          lineNumber: ln, field: "primaryICD10", code: "SWITCH_SPECIFICITY",
          severity: "error", rule: `${sw.name}: Insufficient Specificity`,
          message: `${sw.name} requires 4+ character ICD-10 codes. "${code}" (3 chars) will be rejected. Add the 4th character (e.g., ${code}.9).`,
          suggestion: `${sw.name} enforces strict specificity. Use the most specific code available.`,
        });
      }
    }

    // ── Claim window (switch-specific, may differ from generic 120 days) ──
    if (line.dateOfService && sw.claimWindowDays !== 120) {
      const dos = new Date(line.dateOfService);
      const now = new Date();
      if (!isNaN(dos.getTime())) {
        const days = Math.floor((now.getTime() - dos.getTime()) / 86400000);
        if (days > sw.claimWindowDays) {
          issues.push({
            lineNumber: ln, field: "dateOfService", code: "SWITCH_STALE",
            severity: "error", rule: `${sw.name}: Claim Window Exceeded`,
            message: `Claim is ${days} days old. ${sw.name} has a ${sw.claimWindowDays}-day submission window (stricter than the standard 120 days).`,
            suggestion: `Submit within ${sw.claimWindowDays} days of service when using ${sw.name}.`,
          });
        }
      }
    }

    // ── Modifier validation ──
    if (sw.modifierValidation === "strict" && line.modifier) {
      const validModifiers = ["0002", "0003", "0005", "0006", "0011", "0012",
        "0018", "0019", "0021", "0023", "0028", "PMB", "0000", "09959"];
      const mods = line.modifier.split(/[,;]/).map(m => m.trim()).filter(Boolean);
      for (const mod of mods) {
        if (!validModifiers.includes(mod)) {
          issues.push({
            lineNumber: ln, field: "modifier", code: "SWITCH_INVALID_MODIFIER",
            severity: "warning", rule: `${sw.name}: Unrecognised Modifier`,
            message: `Modifier "${mod}" is not in ${sw.name}'s accepted modifier list. Claim may be queried.`,
            suggestion: `Verify modifier "${mod}" is valid for ${sw.name}. Common modifiers: 0002 (bilateral), 0011 (after-hours), PMB.`,
          });
        }
      }
    }

    // ── Batch size warning ──
    if (lines.length > sw.maxBatchSize) {
      // Only add once
      if (ln === lines[0].lineNumber) {
        issues.push({
          lineNumber: ln, field: "batch", code: "SWITCH_BATCH_SIZE",
          severity: "warning", rule: `${sw.name}: Batch Size Limit`,
          message: `Batch contains ${lines.length} claims. ${sw.name} accepts max ${sw.maxBatchSize} per submission. Split into multiple batches.`,
        });
      }
    }
  }

  return issues;
}
