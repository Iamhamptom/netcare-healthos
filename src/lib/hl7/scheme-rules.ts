// SA Medical Aid Scheme Rules Database
// Specific pre-auth requirements, rejection rules, and benefit limits per scheme
// Used by the AI rejection predictor for scheme-specific predictions

export interface SchemeRule {
  scheme: string;
  plan: string;
  rule: string;
  category: "preauth" | "procedure" | "benefit" | "referral" | "coding" | "timeline";
  description: string;
  threshold?: number;
  formId?: string;
  rejectionCode?: string;
  rejectionRate: number;
}

export const SCHEME_RULES: SchemeRule[] = [
  // ── Discovery Health ──
  { scheme: "Discovery", plan: "*", rule: "HOSP_PREAUTH", category: "preauth", description: "All hospital admissions require pre-authorization. Call 0860 99 88 77.", threshold: 0, formId: "DH-PA-001", rejectionCode: "PA01", rejectionRate: 0.23 },
  { scheme: "Discovery", plan: "*", rule: "CT_MRI_PREAUTH", category: "preauth", description: "CT and MRI scans require pre-authorization above R3,000.", threshold: 3000, formId: "DH-PA-003", rejectionCode: "PA03", rejectionRate: 0.18 },
  { scheme: "Discovery", plan: "*", rule: "SPEC_REFERRAL", category: "referral", description: "Specialist consultations require GP referral letter on file.", formId: "DH-REF-001", rejectionCode: "RF01", rejectionRate: 0.12 },
  { scheme: "Discovery", plan: "Executive", rule: "EXEC_UNLIM", category: "benefit", description: "Unlimited in-hospital benefit. Day-to-day from MSA/savings.", rejectionRate: 0.08 },
  { scheme: "Discovery", plan: "Classic Comp", rule: "CLASSIC_LIMIT", category: "benefit", description: "In-hospital at 200% of scheme rate. Day-to-day limited to R12,000/member.", threshold: 12000, rejectionRate: 0.14 },
  { scheme: "Discovery", plan: "KeyCare", rule: "KEYCARE_NETWORK", category: "referral", description: "KeyCare plans require designated provider network. Out-of-network claims rejected.", rejectionCode: "NW01", rejectionRate: 0.31 },
  { scheme: "Discovery", plan: "*", rule: "CPT_REQUIRED", category: "procedure", description: "All claims above R5,000 require CPT procedure code.", threshold: 5000, rejectionCode: "CP01", rejectionRate: 0.15 },
  { scheme: "Discovery", plan: "*", rule: "ICD10_SPECIFICITY", category: "coding", description: "ICD-10 codes must be to maximum specificity (4th/5th character). 3-character codes rejected.", rejectionCode: "IC01", rejectionRate: 0.11 },

  // ── Bonitas ──
  { scheme: "Bonitas", plan: "*", rule: "HOSP_PREAUTH", category: "preauth", description: "Hospital admissions require pre-authorization. Call 0860 002 108.", formId: "BON-PA-001", rejectionCode: "PA01", rejectionRate: 0.19 },
  { scheme: "Bonitas", plan: "BonComprehensive", rule: "CPT_MANDATORY", category: "procedure", description: "Claims above R50,000 MUST include CPT procedure codes. Auto-rejected without.", threshold: 50000, rejectionCode: "CP02", rejectionRate: 0.25 },
  { scheme: "Bonitas", plan: "BonEssential", rule: "DAY_LIMIT", category: "benefit", description: "Day-to-day benefits limited to R8,500/member/year. Exceeded claims rejected.", threshold: 8500, rejectionCode: "BN01", rejectionRate: 0.22 },
  { scheme: "Bonitas", plan: "*", rule: "30DAY_SUBMIT", category: "timeline", description: "Claims must be submitted within 30 days of service date. Late claims rejected.", rejectionCode: "TL01", rejectionRate: 0.09 },

  // ── GEMS ──
  { scheme: "GEMS", plan: "*", rule: "PMB_ONLY_LOWER", category: "benefit", description: "Lower plans (Ruby, Beryl) cover PMB conditions only. Non-PMB claims on lower plans rejected.", rejectionCode: "PM01", rejectionRate: 0.28 },
  { scheme: "GEMS", plan: "Emerald", rule: "GP_100PCT", category: "benefit", description: "GP consultations covered at 100% of GEMS rate. No co-payment.", rejectionRate: 0.05 },
  { scheme: "GEMS", plan: "Onyx", rule: "ONYX_FULL", category: "benefit", description: "Comprehensive coverage. In-hospital unlimited. Day-to-day from savings.", rejectionRate: 0.07 },
  { scheme: "GEMS", plan: "*", rule: "SPEC_REFERRAL", category: "referral", description: "Specialist visits require referral from designated GP. Self-referrals rejected except emergency.", rejectionCode: "RF02", rejectionRate: 0.16 },
  { scheme: "GEMS", plan: "*", rule: "CDL_CHRONIC", category: "coding", description: "Chronic Disease List conditions must be registered before claiming chronic benefits.", rejectionCode: "CD01", rejectionRate: 0.13 },

  // ── Momentum Health ──
  { scheme: "Momentum", plan: "*", rule: "HOSP_48H", category: "preauth", description: "Hospital admissions >48 hours require pre-authorization within 24 hours of admission.", formId: "MOM-PA-001", rejectionCode: "PA04", rejectionRate: 0.21 },
  { scheme: "Momentum", plan: "Ingwe", rule: "INGWE_NETWORK", category: "referral", description: "Ingwe plans use designated service provider network only.", rejectionCode: "NW02", rejectionRate: 0.27 },
  { scheme: "Momentum", plan: "*", rule: "DUAL_CLAIM", category: "coding", description: "Duplicate claims for same service on same date auto-rejected.", rejectionCode: "DC01", rejectionRate: 0.06 },

  // ── Medshield ──
  { scheme: "Medshield", plan: "*", rule: "HOSP_PREAUTH", category: "preauth", description: "Hospital admissions require pre-authorization. Call 0860 100 078.", formId: "MSH-PA-001", rejectionCode: "PA01", rejectionRate: 0.20 },
  { scheme: "Medshield", plan: "MedElite", rule: "ELITE_UNLIM", category: "benefit", description: "Unlimited in-hospital. Day-to-day from PMSA savings account.", rejectionRate: 0.06 },
  { scheme: "Medshield", plan: "*", rule: "AGE_GENDER", category: "coding", description: "ICD-10 codes validated against patient age and gender. Mismatches flagged.", rejectionCode: "AG01", rejectionRate: 0.08 },
];

/** Look up rules for a specific scheme + plan */
export function getSchemeRules(scheme: string, plan?: string): SchemeRule[] {
  const normalizedScheme = scheme.toUpperCase();
  return SCHEME_RULES.filter(r => {
    const matchScheme = r.scheme.toUpperCase() === normalizedScheme;
    const matchPlan = r.plan === "*" || (plan && r.plan.toUpperCase() === plan.toUpperCase());
    return matchScheme && matchPlan;
  });
}

/** Get rejection risk factors for a specific claim scenario */
export function getrejectionRiskFactors(
  scheme: string,
  plan: string,
  claimValue: number,
  hasCPT: boolean,
  hasPreAuth: boolean,
  hasReferral: boolean,
  daysFromService: number,
): { totalRisk: number; factors: { rule: string; risk: number; description: string }[] } {
  const rules = getSchemeRules(scheme, plan);
  const factors: { rule: string; risk: number; description: string }[] = [];

  for (const rule of rules) {
    let applies = false;

    if (rule.category === "procedure" && !hasCPT && rule.threshold && claimValue > rule.threshold) applies = true;
    if (rule.category === "preauth" && !hasPreAuth && claimValue > (rule.threshold ?? 0)) applies = true;
    if (rule.category === "referral" && !hasReferral) applies = true;
    if (rule.category === "timeline" && daysFromService > 30) applies = true;

    if (applies) {
      factors.push({ rule: rule.rule, risk: rule.rejectionRate, description: rule.description });
    }
  }

  // Combined risk: 1 - product of (1 - individual risks)
  const totalRisk = factors.length > 0
    ? 1 - factors.reduce((p, f) => p * (1 - f.risk), 1)
    : 0.05; // Base rate for clean claims

  return { totalRisk: Math.min(totalRisk, 0.95), factors };
}
