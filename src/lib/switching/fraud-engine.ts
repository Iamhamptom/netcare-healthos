import { isPMBCondition } from "../healthbridge/pmb";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Fraud, Waste & Abuse Detection Engine
// Based on VisioCorp Health Intelligence KB 07 — R22-28B annual SA problem
//
// Implements:
// - Unbundling detection (R2-4B, 10-15% of FWA)
// - Upcoding detection (R3-5B, 15-20% of FWA)
// - After-hours modifier fraud
// - Time impossibility detection
// - Duplicate billing detection
// - Prescription DDD analysis
// - DSP balance billing detection (illegal)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── Types ──────────────────────────────────────────────────────────────────

export interface FraudFlag {
  type: FraudType;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  evidence: string;
  suggestedAction: string;
  estimatedOvercharge?: number;
}

export type FraudType =
  | "unbundling"
  | "upcoding"
  | "after_hours_fraud"
  | "time_impossibility"
  | "duplicate_billing"
  | "prescription_fraud"
  | "balance_billing"
  | "phantom_billing";

// ─── Unbundling Detection (KB 07: R2-4B, 10-15%) ───────────────────────────

/** Known unbundling pairs: component codes that should be billed as a bundle */
const UNBUNDLING_RULES: { components: string[]; bundle: string; description: string }[] = [
  { components: ["3617", "3615", "3610", "3612", "3614"], bundle: "3600", description: "Laparoscopic cholecystectomy billed as separate components" },
  { components: ["3812", "3810", "3814"], bundle: "3800", description: "FBC billed as individual tests (haemoglobin + WCC + platelet)" },
  { components: ["4052", "4053", "4054"], bundle: "4050", description: "Metabolic panel billed as separate chemistry tests" },
  { components: ["3841", "3843", "3845"], bundle: "3840", description: "Coagulation panel billed as individual tests" },
  { components: ["0401", "0402", "0403"], bundle: "0400", description: "Wound care billed as separate components (clean + suture + dress)" },
];

/**
 * Detect unbundling: component codes billed separately when a bundle code exists.
 */
export function detectUnbundling(tariffCodes: string[]): FraudFlag[] {
  const flags: FraudFlag[] = [];
  const codeSet = new Set(tariffCodes);

  for (const rule of UNBUNDLING_RULES) {
    const matchingComponents = rule.components.filter(c => codeSet.has(c));
    if (matchingComponents.length >= 2) {
      flags.push({
        type: "unbundling",
        severity: "high",
        description: rule.description,
        evidence: `Components billed: ${matchingComponents.join(", ")}. Should use bundle code: ${rule.bundle}`,
        suggestedAction: `Replace component codes with bundle code ${rule.bundle}. Unbundling is a scheme rejection trigger.`,
      });
    }
  }

  return flags;
}

// ─── Upcoding Detection (KB 07: R3-5B, 15-20%) ────────────────────────────

/**
 * Detect potential upcoding by analyzing consultation level distribution.
 * Red flag: >70% at Level 3-4 when peer average is 20-30%.
 */
export function detectUpcoding(consultationCodes: string[]): FraudFlag[] {
  const flags: FraudFlag[] = [];
  if (consultationCodes.length < 10) return flags; // Need minimum sample

  const level3_4 = consultationCodes.filter(c => c === "0192" || c === "0193" || c === "0142" || c === "0143");
  const percentage = (level3_4.length / consultationCodes.length) * 100;

  if (percentage > 70) {
    flags.push({
      type: "upcoding",
      severity: "critical",
      description: `${percentage.toFixed(0)}% of consultations at Level 3-4 — peer average is 20-30%`,
      evidence: `${level3_4.length}/${consultationCodes.length} consultations billed at high level`,
      suggestedAction: "Review clinical records for clinical justification. Schemes flag providers with >70% high-level billing.",
    });
  } else if (percentage > 50) {
    flags.push({
      type: "upcoding",
      severity: "medium",
      description: `${percentage.toFixed(0)}% of consultations at Level 3-4 — above peer average of 20-30%`,
      evidence: `${level3_4.length}/${consultationCodes.length} consultations billed at high level`,
      suggestedAction: "Monitor billing patterns. Consider clinical audit to justify higher-level consultations.",
    });
  }

  return flags;
}

// ─── After-Hours Modifier Fraud (KB 07) ─────────────────────────────────────

/** After-hours modifiers */
const AFTER_HOURS_MODIFIERS = ["0010", "0011", "0012", "0013", "0014"];

/**
 * Detect after-hours modifier fraud.
 * Red flag: >60% after-hours when peer average is 15%.
 */
export function detectAfterHoursFraud(claims: { modifiers?: string[]; dateOfService: string }[]): FraudFlag[] {
  const flags: FraudFlag[] = [];
  if (claims.length < 10) return flags;

  const afterHours = claims.filter(c =>
    c.modifiers?.some(m => AFTER_HOURS_MODIFIERS.includes(m))
  );
  const percentage = (afterHours.length / claims.length) * 100;

  if (percentage > 60) {
    flags.push({
      type: "after_hours_fraud",
      severity: "high",
      description: `${percentage.toFixed(0)}% of claims have after-hours modifiers — peer average is ~15%`,
      evidence: `${afterHours.length}/${claims.length} claims with modifiers ${AFTER_HOURS_MODIFIERS.join(", ")}`,
      suggestedAction: "Verify after-hours claims against practice hours. Weekday daytime claims with after-hours modifiers are fraudulent.",
    });
  }

  return flags;
}

// ─── Time Impossibility Detection (KB 07) ───────────────────────────────────

/**
 * Detect time impossibility: more patients per day than physically possible.
 * 40 patients × 45min = 30hrs → impossible in a single day.
 */
export function detectTimeImpossibility(data: {
  providerId: string;
  date: string;
  claimCount: number;
  avgConsultMinutes?: number;
}): FraudFlag[] {
  const flags: FraudFlag[] = [];
  const avgMinutes = data.avgConsultMinutes || 15;
  const totalHours = (data.claimCount * avgMinutes) / 60;
  const maxReasonableHours = 14; // Max working hours in a day

  if (totalHours > maxReasonableHours) {
    flags.push({
      type: "time_impossibility",
      severity: "critical",
      description: `${data.claimCount} claims on ${data.date} would require ${totalHours.toFixed(1)} hours at ${avgMinutes}min each — exceeds ${maxReasonableHours}hr maximum`,
      evidence: `Provider ${data.providerId}: ${data.claimCount} claims × ${avgMinutes}min = ${totalHours.toFixed(1)}hrs`,
      suggestedAction: "Flag for clinical review. Cross-reference with booking system. May indicate phantom billing.",
    });
  }

  return flags;
}

// ─── Duplicate Billing Detection (KB 07: R1-2B, 5-8%) ──────────────────────

interface ClaimForDuplicateCheck {
  membershipNumber: string;
  dateOfService: string;
  tariffCode: string;
  providerNumber: string;
  amount: number;
}

/**
 * Detect duplicate billing: same member + date + procedure + provider.
 */
export function detectDuplicateBilling(claims: ClaimForDuplicateCheck[]): FraudFlag[] {
  const flags: FraudFlag[] = [];
  const seen = new Map<string, ClaimForDuplicateCheck>();

  for (const claim of claims) {
    const key = `${claim.membershipNumber}|${claim.dateOfService}|${claim.tariffCode}|${claim.providerNumber}`;
    const existing = seen.get(key);

    if (existing) {
      flags.push({
        type: "duplicate_billing",
        severity: "high",
        description: `Duplicate claim: same member (${claim.membershipNumber}), date (${claim.dateOfService}), procedure (${claim.tariffCode}), provider`,
        evidence: `Original amount: ${existing.amount}, Duplicate amount: ${claim.amount}`,
        suggestedAction: "Remove duplicate claim. If this is a legitimate repeat service, add modifier to differentiate.",
        estimatedOvercharge: claim.amount,
      });
    } else {
      seen.set(key, claim);
    }
  }

  return flags;
}

// ─── Prescription Fraud / DDD Analysis (KB 07: R2-3B, 8-10%) ───────────────

/**
 * Detect prescription fraud using Defined Daily Dose (DDD) analysis.
 * Red flag: >90 Schedule 5 tablets per month per patient.
 */
export function detectPrescriptionFraud(prescriptions: {
  patientId: string;
  nappiCode: string;
  schedule: string;
  quantity: number;
  daysSupply: number;
}[]): FraudFlag[] {
  const flags: FraudFlag[] = [];

  // Group by patient + schedule
  const patientSchedule = new Map<string, number>();
  for (const rx of prescriptions) {
    if (rx.schedule === "S5" || rx.schedule === "S6") {
      const key = `${rx.patientId}|${rx.schedule}`;
      const current = patientSchedule.get(key) || 0;
      patientSchedule.set(key, current + rx.quantity);
    }
  }

  for (const [key, totalQty] of patientSchedule) {
    const [patientId, schedule] = key.split("|");
    if (totalQty > 90) {
      flags.push({
        type: "prescription_fraud",
        severity: "high",
        description: `Patient ${patientId}: ${totalQty} ${schedule} tablets/month — exceeds 90-tablet threshold`,
        evidence: `Schedule ${schedule}, total quantity: ${totalQty}`,
        suggestedAction: "Flag for pharmacy review. Check for pharmacy hopping (same patient + drug class + 3+ pharmacies in 30 days).",
      });
    }
  }

  return flags;
}

// ─── DSP Balance Billing Detection (KB 07: ILLEGAL) ─────────────────────────

/**
 * Detect illegal balance billing at Designated Service Provider (DSP).
 * DSPs may NOT charge patients above the scheme tariff rate.
 */
export function detectBalanceBilling(data: {
  isDSP: boolean;
  isPMB: boolean;
  chargedAmount: number;
  schemeTariffAmount: number;
}): FraudFlag[] {
  const flags: FraudFlag[] = [];

  if (data.isDSP && data.isPMB && data.chargedAmount > data.schemeTariffAmount) {
    const overcharge = data.chargedAmount - data.schemeTariffAmount;
    flags.push({
      type: "balance_billing",
      severity: "critical",
      description: `Illegal balance billing at DSP for PMB condition — charged R${(data.chargedAmount / 100).toFixed(2)} vs scheme tariff R${(data.schemeTariffAmount / 100).toFixed(2)}`,
      evidence: `Overcharge: R${(overcharge / 100).toFixed(2)}`,
      suggestedAction: "DSPs may NOT balance-bill for PMB conditions. This is a violation of the Medical Schemes Act. Reduce charge to scheme tariff rate.",
      estimatedOvercharge: overcharge,
    });
  }

  return flags;
}

// ─── Scheme-Specific Rules (KB 05) ──────────────────────────────────────────

export interface SchemeSpecificFlag {
  scheme: string;
  rule: string;
  severity: "warning" | "error" | "info";
  message: string;
  suggestion?: string;
}

/**
 * Apply scheme-specific rules from the knowledge base.
 */
export function applySchemeSpecificRules(data: {
  scheme: string;
  icd10Codes: string[];
  cptCodes: string[];
  isSpecialistReferral: boolean;
  hasGPReferral: boolean;
  formularyTier?: "A" | "B" | "C" | "D";
  mentalHealthDays?: number;
  mentalHealthSessions?: number;
}): SchemeSpecificFlag[] {
  const flags: SchemeSpecificFlag[] = [];
  const scheme = data.scheme.toLowerCase();

  // Discovery: ICD-10 strictness (4th character mandatory)
  if (scheme.includes("discovery")) {
    for (const code of data.icd10Codes) {
      if (code.length <= 3 && !["I10", "B20", "B24", "C61", "C73", "R51"].includes(code)) {
        flags.push({
          scheme: "Discovery Health",
          rule: "DISCOVERY_ICD10_STRICT",
          severity: "error",
          message: `Discovery requires maximum ICD-10 specificity — code "${code}" needs 4th character`,
          suggestion: `Use more specific code, e.g., "${code}.9" for unspecified`,
        });
      }
    }
  }

  // Bonitas: 30% off-formulary co-payment
  if (scheme.includes("bonitas") && data.formularyTier === "D") {
    flags.push({
      scheme: "Bonitas",
      rule: "BONITAS_OFF_FORMULARY",
      severity: "warning",
      message: "Bonitas Tier D (off-formulary) medication — 30% co-payment applies to patient",
      suggestion: "Consider formulary alternative (Tier A-C) to reduce patient out-of-pocket cost",
    });
  }

  // Bonitas: GP referral required for specialists on Standard/Standard Select
  if (scheme.includes("bonitas") && data.isSpecialistReferral && !data.hasGPReferral) {
    flags.push({
      scheme: "Bonitas",
      rule: "BONITAS_GP_REFERRAL",
      severity: "error",
      message: "Bonitas Standard/Standard Select requires GP referral for specialist consultations",
      suggestion: "Obtain GP referral letter before specialist visit. Claim may be rejected without it.",
    });
  }

  // Momentum: PMB letter must be sent by practice (only for actual PMB conditions)
  if (scheme.includes("momentum")) {
    for (const code of data.icd10Codes) {
      if (isPMBCondition(code)) {
        flags.push({
          scheme: "Momentum Health",
          rule: "MOMENTUM_PMB_LETTER",
          severity: "info",
          message: `Momentum requires practice to send a PMB motivation letter for "${code}"`,
          suggestion: "Submit PMB motivation letter to Momentum before or alongside the claim",
        });
        break;
      }
    }
  }

  // Bestmed: mental health cap
  if (scheme.includes("bestmed")) {
    if (data.mentalHealthDays !== undefined && data.mentalHealthDays > 21) {
      flags.push({
        scheme: "Bestmed",
        rule: "BESTMED_MENTAL_HEALTH_INPATIENT",
        severity: "error",
        message: `Bestmed mental health cap: ${data.mentalHealthDays} inpatient days exceeds 21-day annual limit`,
        suggestion: "Apply for extended benefit authorization from Bestmed case management",
      });
    }
    if (data.mentalHealthSessions !== undefined && data.mentalHealthSessions > 15) {
      flags.push({
        scheme: "Bestmed",
        rule: "BESTMED_MENTAL_HEALTH_OUTPATIENT",
        severity: "error",
        message: `Bestmed mental health cap: ${data.mentalHealthSessions} outpatient sessions exceeds 15-session annual limit`,
        suggestion: "Apply for extended benefit authorization from Bestmed case management",
      });
    }
  }

  return flags;
}

// ─── Comprehensive Fraud Scan ───────────────────────────────────────────────

/**
 * Run all fraud detection algorithms against a set of claims.
 */
export function runFraudScan(claims: {
  tariffCodes: string[];
  consultationCodes: string[];
  claimsWithModifiers: { modifiers?: string[]; dateOfService: string }[];
  claimsForDuplicateCheck: ClaimForDuplicateCheck[];
}): {
  flags: FraudFlag[];
  riskScore: number;
  summary: string;
} {
  const flags: FraudFlag[] = [];

  flags.push(...detectUnbundling(claims.tariffCodes));
  flags.push(...detectUpcoding(claims.consultationCodes));
  flags.push(...detectAfterHoursFraud(claims.claimsWithModifiers));
  flags.push(...detectDuplicateBilling(claims.claimsForDuplicateCheck));

  const criticalCount = flags.filter(f => f.severity === "critical").length;
  const highCount = flags.filter(f => f.severity === "high").length;
  const riskScore = Math.min(100, criticalCount * 30 + highCount * 15 + flags.length * 5);

  return {
    flags,
    riskScore,
    summary: flags.length === 0
      ? "No fraud indicators detected"
      : `${flags.length} fraud indicators found (${criticalCount} critical, ${highCount} high). Risk score: ${riskScore}/100`,
  };
}
