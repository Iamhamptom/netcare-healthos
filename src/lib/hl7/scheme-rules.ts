// SA Medical Aid Scheme Rules Database
// Source: docs/knowledge/05_scheme_profiles.md (compiled from CMS data + scheme brochures)
// Used by AI rejection predictor for scheme-specific predictions

export interface SchemeRule {
  scheme: string;
  plan: string;
  rule: string;
  category: "preauth" | "procedure" | "benefit" | "referral" | "coding" | "timeline" | "network" | "chronic";
  description: string;
  threshold?: number;
  formId?: string;
  rejectionCode?: string;
  rejectionRate: number;
  contact?: string;
}

export const SCHEME_RULES: SchemeRule[] = [
  // ── Discovery Health (~3.8M lives, ~58% open scheme market) ──
  // FICO Blaze Advisor: 78% auto-adjudication, 100K+ tx/day
  { scheme: "Discovery", plan: "*", rule: "ICD10_MAX_SPECIFICITY", category: "coding", description: "ICD-10 STRICT — maximum specificity mandatory (4th character required). 3-character codes auto-rejected.", rejectionCode: "59", rejectionRate: 0.15, contact: "0860 99 88 77" },
  { scheme: "Discovery", plan: "*", rule: "HOSP_PREAUTH", category: "preauth", description: "ALL hospital admissions require pre-authorization.", threshold: 0, rejectionCode: "04", rejectionRate: 0.23, contact: "0860 99 88 77" },
  { scheme: "Discovery", plan: "*", rule: "CT_MRI_PREAUTH", category: "preauth", description: "MRI/CT scans require pre-authorization.", threshold: 0, rejectionCode: "04", rejectionRate: 0.18 },
  { scheme: "Discovery", plan: "*", rule: "HIGH_COST_MEDS", category: "preauth", description: "High-cost medications require pre-authorization.", rejectionCode: "04", rejectionRate: 0.12 },
  { scheme: "Discovery", plan: "*", rule: "GP_AFTER_15TH", category: "benefit", description: "GP visits after 15th visit/year may be from out-of-pocket. Check remaining day-to-day benefits.", rejectionRate: 0.09 },
  { scheme: "Discovery", plan: "*", rule: "SPEC_REFERRAL", category: "referral", description: "Specialist consultations require GP referral letter on file.", rejectionCode: "02", rejectionRate: 0.12, contact: "Provider_Administration@discovery.co.za" },
  { scheme: "Discovery", plan: "*", rule: "CLAWBACK_RISK", category: "coding", description: "Discovery known to claw back months/years later. Ensure coding accuracy at submission.", rejectionRate: 0.05 },
  { scheme: "Discovery", plan: "KeyCare", rule: "KEYCARE_NETWORK", category: "network", description: "KeyCare plans MUST use KeyCare network. Non-network = full member liability.", rejectionCode: "NW01", rejectionRate: 0.31 },
  { scheme: "Discovery", plan: "*", rule: "CDL_REGISTER_CIB", category: "chronic", description: "CDL conditions: 27 base + plan extras. Register via CIB. Formulary = 100% at DHR.", rejectionRate: 0.08 },

  // ── Bonitas (~731K beneficiaries) ──
  // MIGRATING to Momentum Health Solutions from 1 June 2026 (largest admin transfer in SA history)
  { scheme: "Bonitas", plan: "*", rule: "HOSP_PREAUTH", category: "preauth", description: "Hospital admissions require pre-authorization.", rejectionCode: "04", rejectionRate: 0.19, contact: "086 111 2666" },
  { scheme: "Bonitas", plan: "*", rule: "OFF_FORMULARY_COPAY", category: "chronic", description: "4 formulary tiers (A-D). Off-formulary = 30% co-payment.", rejectionRate: 0.14 },
  { scheme: "Bonitas", plan: "Standard", rule: "GP_REFERRAL_SPEC", category: "referral", description: "GP referral required for specialists on Standard/Standard Select.", rejectionCode: "RF01", rejectionRate: 0.16 },
  { scheme: "Bonitas", plan: "BonComprehensive", rule: "CDL_61", category: "chronic", description: "BonComprehensive covers 61 CDL conditions (expanded list).", rejectionRate: 0.06 },
  { scheme: "Bonitas", plan: "BonEssential", rule: "CDL_28", category: "chronic", description: "BonEssential covers 28 CDL conditions only.", rejectionRate: 0.18 },
  { scheme: "Bonitas", plan: "*", rule: "30DAY_SUBMIT", category: "timeline", description: "Claims must be submitted within 4 months (last workday). Disputes within 60 days.", rejectionCode: "TL01", rejectionRate: 0.07 },
  { scheme: "Bonitas", plan: "*", rule: "PHARMACY_DIRECT_DSP", category: "network", description: "Mandatory DSP (Pharmacy Direct) for chronic on Standard Select, BonSave, BonEssential, Hospital Standard, BonStart.", rejectionRate: 0.11 },

  // ── GEMS (~2M lives, largest restricted scheme) ──
  // Administrator: Medscheme | 60-day dispute turnaround (longest)
  { scheme: "GEMS", plan: "*", rule: "MEMBERSHIP_FORMAT", category: "coding", description: "GEMS membership: 9-digit with leading zeros. Incorrect format auto-rejected.", rejectionRate: 0.08 },
  { scheme: "GEMS", plan: "*", rule: "STRICT_CONSULT_LIMITS", category: "benefit", description: "Stricter consultation limits than other schemes. Rigid PMB interpretation.", rejectionRate: 0.14 },
  { scheme: "GEMS", plan: "*", rule: "STATE_DSP_HOSPITAL", category: "network", description: "State hospitals as DSP for in-hospital care.", rejectionRate: 0.10 },
  { scheme: "GEMS", plan: "*", rule: "MISSED_APPOINTMENTS", category: "benefit", description: "Missed appointments NOT covered. Member liable. Do not submit claim for no-shows.", rejectionRate: 0.03 },
  { scheme: "GEMS", plan: "*", rule: "60DAY_DISPUTE", category: "timeline", description: "60-day dispute turnaround (longest of all schemes). Plan submissions accordingly.", rejectionRate: 0.09, contact: "0860 00 4367" },
  { scheme: "GEMS", plan: "Ruby", rule: "PMB_ONLY", category: "benefit", description: "Ruby and Beryl plans: PMB conditions only. Non-PMB claims on lower plans rejected.", rejectionCode: "PM01", rejectionRate: 0.28 },
  { scheme: "GEMS", plan: "Beryl", rule: "PMB_ONLY", category: "benefit", description: "Beryl plan: PMB conditions only.", rejectionCode: "PM01", rejectionRate: 0.28 },

  // ── Momentum (~350K lives) ──
  { scheme: "Momentum", plan: "*", rule: "HOSP_PREAUTH", category: "preauth", description: "All hospital, MRI/CT/PET/MRCP, oncology, rehab require pre-authorization.", rejectionCode: "04", rejectionRate: 0.21, contact: "0860 117 859" },
  { scheme: "Momentum", plan: "*", rule: "PMB_LETTER", category: "benefit", description: "Practice must send letter requesting PMB on patient's behalf. Not automatic.", rejectionRate: 0.15 },
  { scheme: "Momentum", plan: "Ingwe", rule: "INGWE_NETWORK", category: "network", description: "Ingwe plans use designated service provider network only.", rejectionCode: "NW02", rejectionRate: 0.27 },

  // ── Medihelp (~400K lives, self-administered since 1906) ──
  { scheme: "Medihelp", plan: "*", rule: "SUBMIT_DEADLINE", category: "timeline", description: "Submission deadline: last workday of 4th month after service. Resubmission: 60 days.", rejectionRate: 0.08, contact: "hpquery@medihelp.co.za" },

  // ── Bestmed (~200K lives, self-administered) ──
  { scheme: "Bestmed", plan: "*", rule: "MENTAL_HEALTH_LIMIT", category: "benefit", description: "Mental health: 21 days inpatient/yr OR 15 outpatient sessions. Exceeds = member liability.", rejectionRate: 0.12 },
  { scheme: "Bestmed", plan: "Pulse", rule: "PULSE_NO_SAVINGS", category: "benefit", description: "Pulse plan has NO savings account. Day-to-day from network benefits only.", rejectionRate: 0.20 },

  // ── Universal Rules (all schemes) ──
  { scheme: "*", plan: "*", rule: "ICD10_GENDER_AGE", category: "coding", description: "ICD-10 codes validated against patient gender and age (MIT database). Mismatches rejected.", rejectionCode: "IC02", rejectionRate: 0.08 },
  { scheme: "*", plan: "*", rule: "DUPLICATE_CLAIM", category: "coding", description: "Duplicate claims for same service on same date auto-rejected by all switches.", rejectionCode: "DC01", rejectionRate: 0.06 },
  { scheme: "*", plan: "*", rule: "PMB_OVERRIDE", category: "benefit", description: "PMB conditions MUST be paid in full at DSP. Override waiting periods + benefit limits. 270 DTPs + 27 CDL.", rejectionRate: 0.02 },
  { scheme: "*", plan: "*", rule: "REJECTION_TOP_CAUSE", category: "coding", description: "Incorrect/missing ICD-10 is #1 rejection cause (30% of all rejections nationally).", rejectionRate: 0.30 },
];

/** Look up rules for a specific scheme + plan */
export function getSchemeRules(scheme: string, plan?: string): SchemeRule[] {
  const normalizedScheme = scheme.toUpperCase();
  return SCHEME_RULES.filter(r => {
    const matchScheme = r.scheme === "*" || r.scheme.toUpperCase() === normalizedScheme;
    const matchPlan = r.plan === "*" || (plan && r.plan.toUpperCase() === plan.toUpperCase());
    return matchScheme && matchPlan;
  });
}

/** Get rejection risk factors for a specific claim scenario */
export function getRejectionRiskFactors(
  scheme: string,
  plan: string,
  claimValue: number,
  options: {
    hasCPT?: boolean;
    hasPreAuth?: boolean;
    hasReferral?: boolean;
    daysFromService?: number;
    icd10Specificity?: number; // 3, 4, or 5 chars
    isNetwork?: boolean;
    isCDLRegistered?: boolean;
  } = {}
): { totalRisk: number; factors: { rule: string; risk: number; description: string; contact?: string }[] } {
  const rules = getSchemeRules(scheme, plan);
  const factors: { rule: string; risk: number; description: string; contact?: string }[] = [];

  for (const rule of rules) {
    let applies = false;

    if (rule.category === "preauth" && !options.hasPreAuth) applies = true;
    if (rule.category === "referral" && !options.hasReferral) applies = true;
    if (rule.category === "timeline" && (options.daysFromService ?? 0) > 120) applies = true;
    if (rule.category === "coding" && rule.rule === "ICD10_MAX_SPECIFICITY" && (options.icd10Specificity ?? 4) < 4) applies = true;
    if (rule.category === "network" && options.isNetwork === false) applies = true;
    if (rule.category === "chronic" && rule.rule.includes("CDL") && !options.isCDLRegistered) applies = true;

    if (applies) {
      factors.push({ rule: rule.rule, risk: rule.rejectionRate, description: rule.description, contact: rule.contact });
    }
  }

  const totalRisk = factors.length > 0
    ? Math.min(1 - factors.reduce((p, f) => p * (1 - f.risk), 1), 0.95)
    : 0.05;

  return { totalRisk, factors };
}

/** Get scheme contact info */
export function getSchemeContact(scheme: string): string {
  const rules = SCHEME_RULES.filter(r => r.scheme.toUpperCase() === scheme.toUpperCase() && r.contact);
  return rules[0]?.contact ?? "Contact scheme directly";
}
