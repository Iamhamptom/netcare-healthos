// SA Medical Scheme Rules Engine
// Real rules and quirks for major South African medical schemes
// Based on CMS regulations, scheme-specific claim processing guidelines,
// and common rejection patterns observed in SA private healthcare billing

import type { ClaimLineItem, ValidationIssue, ValidationSeverity } from "./types";

// ─── TYPES ──────────────────────────────────────────────────────

export type SpecificityLevel = "strict" | "moderate" | "lenient";

export interface SchemeRule {
  ruleId: string;
  name: string;
  description: string;
  severity: ValidationSeverity;
  /** Returns issues if the rule is violated, empty array if passed */
  check: (line: ClaimLineItem, profile: SchemeProfile) => ValidationIssue[];
}

export interface PMBRules {
  /** Whether the scheme auto-approves PMB claims without pre-auth */
  autoApprovePMB: boolean;
  /** Whether CDL authorization is required for chronic PMB conditions */
  requiresCDLAuth: boolean;
  /** Days allowed to submit PMB claims retroactively (often longer than standard window) */
  pmbClaimWindowDays: number;
  /** Whether the scheme applies Designated Service Provider (DSP) rules strictly */
  dspStrictEnforcement: boolean;
  /** ICD-10 prefixes the scheme treats as automatic PMB */
  autoPMBPrefixes: string[];
  /** Notes about scheme-specific PMB handling */
  notes: string;
}

export interface ChronicMedicationRules {
  /** Whether a CDL (Chronic Disease List) authorization code is required */
  requiresCDLCode: boolean;
  /** Whether the scheme requires a chronic application form before dispensing */
  requiresChronicApplication: boolean;
  /** Maximum days supply per dispensing for chronic meds */
  maxDaysSupply: number;
  /** Whether the scheme enforces formulary-only for chronic meds */
  formularyOnly: boolean;
  /** CDL condition ICD-10 prefixes recognized by this scheme */
  cdlConditionPrefixes: string[];
}

export interface SchemeProfile {
  name: string;
  /** Abbreviation/code used in EDI claims (e.g., "DH" for Discovery) */
  code: string;
  /** Full scheme registration number with CMS */
  cmsRegistrationNumber?: string;
  /** Administrator name (some schemes use third-party administrators) */
  administrator: string;
  /** Days after date of service within which claims must be submitted */
  claimWindowDays: number;
  /** Tariff code prefixes or ICD-10 categories requiring pre-authorization */
  requiresPreAuth: string[];
  /** How strict the scheme is about ICD-10 4th/5th character specificity */
  specificityRequirements: SpecificityLevel;
  /** Whether the scheme runs gender vs diagnosis code cross-checks */
  genderCheckEnabled: boolean;
  /** Whether the scheme runs age vs diagnosis code cross-checks */
  ageCheckEnabled: boolean;
  /** Whether External Cause Code is mandatory for S/T injury codes */
  eccRequired: boolean;
  /** Max number of consultations billable for same patient on same day */
  maxConsultationsPerDay: number;
  /** Minimum days between follow-up consultations to avoid rejection */
  maxFollowUpDays: number;
  /** PMB-specific handling rules */
  pmbRules: PMBRules;
  /** Chronic medication dispensing rules */
  chronicMedRules: ChronicMedicationRules;
  /** Scheme-specific custom validation rules */
  customRules: SchemeRule[];
}

// ─── SHARED RULE BUILDERS ───────────────────────────────────────
// Reusable check functions used across multiple scheme profiles

function makePreAuthRule(prefixes: string[]): SchemeRule {
  return {
    ruleId: "PRE_AUTH_REQUIRED",
    name: "Pre-Authorization Required",
    description: "Flags procedures/diagnoses that require pre-authorization for this scheme",
    severity: "warning",
    check: (line) => {
      const issues: ValidationIssue[] = [];
      const codes = [line.primaryICD10, line.tariffCode, ...(line.secondaryICD10 || [])].filter((c): c is string => Boolean(c));
      for (const code of codes) {
        for (const prefix of prefixes) {
          if (code.toUpperCase().startsWith(prefix.toUpperCase())) {
            issues.push({
              lineNumber: line.lineNumber,
              field: code === line.tariffCode ? "tariffCode" : "primaryICD10",
              code: "PRE_AUTH_REQUIRED",
              severity: "warning",
              rule: "Pre-Authorization Required",
              message: `Code "${code}" matches pre-authorization prefix "${prefix}". This scheme requires prior approval before service delivery.`,
              suggestion: "Ensure pre-authorization was obtained before the date of service. Attach the auth number to the claim.",
            });
            break;
          }
        }
      }
      return issues;
    },
  };
}

function makeDateWindowRule(windowDays: number): SchemeRule {
  return {
    ruleId: "CLAIM_WINDOW_EXPIRED",
    name: "Claim Submission Window",
    description: `Checks if the claim date is within the ${windowDays}-day submission window`,
    severity: "error",
    check: (line) => {
      if (!line.dateOfService) return [];
      const serviceDate = parseDate(line.dateOfService);
      if (!serviceDate) return [];
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - serviceDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > windowDays) {
        return [{
          lineNumber: line.lineNumber,
          field: "dateOfService",
          code: "CLAIM_WINDOW_EXPIRED",
          severity: "error",
          rule: "Claim Window Expired",
          message: `Service date ${line.dateOfService} is ${diffDays} days ago, exceeding the ${windowDays}-day submission window.`,
          suggestion: `Claims must be submitted within ${windowDays} days of the service date. Contact the scheme for late submission appeals.`,
        }];
      }
      return [];
    },
  };
}

function makeFutureDateRule(): SchemeRule {
  return {
    ruleId: "FUTURE_SERVICE_DATE",
    name: "Future Service Date",
    description: "Rejects claims with service dates in the future",
    severity: "error",
    check: (line) => {
      if (!line.dateOfService) return [];
      const serviceDate = parseDate(line.dateOfService);
      if (!serviceDate) return [];
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      if (serviceDate > now) {
        return [{
          lineNumber: line.lineNumber,
          field: "dateOfService",
          code: "FUTURE_SERVICE_DATE",
          severity: "error",
          rule: "Future Service Date",
          message: `Service date ${line.dateOfService} is in the future. Claims cannot be submitted for services not yet rendered.`,
          suggestion: "Correct the service date to the actual date the service was provided.",
        }];
      }
      return [];
    },
  };
}

function makeChronicCDLRule(cdlPrefixes: string[]): SchemeRule {
  return {
    ruleId: "CDL_AUTH_REQUIRED",
    name: "Chronic Disease List Authorization",
    description: "Flags chronic conditions that require CDL authorization for this scheme",
    severity: "warning",
    check: (line) => {
      const code = line.primaryICD10?.toUpperCase() || "";
      for (const prefix of cdlPrefixes) {
        if (code.startsWith(prefix)) {
          return [{
            lineNumber: line.lineNumber,
            field: "primaryICD10",
            code: "CDL_AUTH_REQUIRED",
            severity: "warning",
            rule: "CDL Authorization Required",
            message: `Diagnosis "${code}" is a Chronic Disease List condition. This scheme requires CDL authorization for ongoing treatment.`,
            suggestion: "Ensure the patient has an approved chronic application on file. Attach the CDL authorization number to the claim.",
          }];
        }
      }
      return [];
    },
  };
}

function makeConsultationLimitRule(maxPerDay: number): SchemeRule {
  return {
    ruleId: "MAX_CONSULT_PER_DAY",
    name: "Consultation Limit Per Day",
    description: `Maximum ${maxPerDay} consultation(s) per patient per day`,
    severity: "warning",
    check: (line) => {
      // This is a cross-line rule indicator — the actual check happens in validateSchemeRules
      // when we have access to all lines. Individual line check is a no-op.
      return [];
    },
  };
}

// ─── DATE PARSER ────────────────────────────────────────────────
// Handles common SA date formats: DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const str = dateStr.trim();

  // ISO format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const d = new Date(str + "T00:00:00");
    return isNaN(d.getTime()) ? null : d;
  }
  // SA common: DD/MM/YYYY or DD-MM-YYYY
  const match = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return isNaN(d.getTime()) ? null : d;
  }
  // Fallback
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

// ─── CDL CONDITION PREFIXES ─────────────────────────────────────
// CMS Chronic Disease List — 27 conditions defined by regulation
// These ICD-10 prefixes cover the core CDL conditions

const CDL_PREFIXES = [
  "E10", "E11", "E13", "E14",  // Diabetes mellitus (Type 1, Type 2, other, unspecified)
  "I10", "I11", "I12", "I13", "I15",  // Hypertension
  "J45",                        // Asthma
  "J44",                        // COPD
  "I20", "I21", "I22", "I25",  // Coronary artery disease / angina
  "I50",                        // Heart failure (cardiomyopathy)
  "G40",                        // Epilepsy
  "N18",                        // Chronic renal disease
  "K50", "K51",                 // Crohn's disease, ulcerative colitis
  "M05", "M06",                 // Rheumatoid arthritis
  "L40",                        // Psoriasis (with arthropathy)
  "G35",                        // Multiple sclerosis
  "E03",                        // Hypothyroidism
  "E05",                        // Hyperthyroidism
  "G20",                        // Parkinson's disease
  "B20", "B21", "B22", "B23", "B24",  // HIV/AIDS
  "E22",                        // Hyperpituitarism (acromegaly, Cushing's via pituitary)
  "E24",                        // Cushing's syndrome
  "D46",                        // Myelodysplasia (selected conditions)
  "C",                          // Malignancies — broad prefix for oncology chronic auth
  "F20",                        // Schizophrenia
  "F31",                        // Bipolar disorder
  "F32", "F33",                 // Major depression
  "E66",                        // Obesity (if on chronic programme)
  "M81",                        // Osteoporosis
  "N80",                        // Endometriosis
];

// ─── PRE-AUTH PREFIXES (COMMON ACROSS SCHEMES) ──────────────────
// Tariff and ICD-10 prefixes that commonly require pre-authorization

const COMMON_PREAUTH_TARIFF = [
  "0008",  // MRI scans
  "0009",  // CT scans
  "3601",  // Cardiac catheterization
  "0186",  // Arthroscopy
  "0457",  // Spinal procedures
  "0520",  // Joint replacements
  "0046",  // Oncology treatment codes
];

const COMMON_PREAUTH_ICD = [
  "Z51",   // Chemotherapy/radiotherapy encounter
  "M17",   // Knee osteoarthritis (for joint replacement pre-auth)
  "M16",   // Hip osteoarthritis (for joint replacement pre-auth)
  "M47",   // Spondylosis (spinal surgery pre-auth)
  "M50",   // Cervical disc disorders
  "M51",   // Lumbar disc disorders
  "I63",   // Cerebral infarction (rehab pre-auth)
  "I21",   // Acute MI (cardiac rehab)
];

// ─── SCHEME PROFILES ────────────────────────────────────────────

const discoveryHealth: SchemeProfile = {
  name: "Discovery Health Medical Scheme",
  code: "DH",
  cmsRegistrationNumber: "1125",
  administrator: "Discovery Health (Pty) Ltd",
  claimWindowDays: 120,
  requiresPreAuth: [
    ...COMMON_PREAUTH_TARIFF,
    ...COMMON_PREAUTH_ICD,
    "0078",  // PET scans — Discovery requires pre-auth
    "0401",  // Cochlear implants
    "0191",  // Organ transplant codes
    "Z94",   // Transplant status (follow-up auth)
    "M54",   // Back pain — Discovery flags for managed care review
    "G43",   // Migraine — if biologics are prescribed
    "N17",   // Acute kidney injury (dialysis auth)
    "N18",   // Chronic kidney disease (dialysis auth)
  ],
  specificityRequirements: "strict",
  genderCheckEnabled: true,
  ageCheckEnabled: true,
  eccRequired: true,
  maxConsultationsPerDay: 1,
  maxFollowUpDays: 3,
  pmbRules: {
    autoApprovePMB: false,
    requiresCDLAuth: true,
    pmbClaimWindowDays: 365,
    dspStrictEnforcement: true,
    autoPMBPrefixes: ["I21", "I60", "I61", "I62", "I63", "J45", "E10", "E11", "B20"],
    notes: "Discovery applies DSP network rules strictly. PMB claims outside DSP network " +
      "are paid at scheme tariff, not provider tariff. Members must use KeyCare/Delta " +
      "network for lower plans. Vitality status may affect certain benefit limits but " +
      "not PMB cover. Discovery uses HealthID for pre-auth — electronic auth preferred.",
  },
  chronicMedRules: {
    requiresCDLCode: true,
    requiresChronicApplication: true,
    maxDaysSupply: 30,
    formularyOnly: true,
    cdlConditionPrefixes: CDL_PREFIXES,
  },
  customRules: [
    makePreAuthRule([
      ...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD,
      "0078", "0401", "0191", "Z94", "M54", "G43", "N17", "N18",
    ]),
    makeDateWindowRule(120),
    makeFutureDateRule(),
    makeChronicCDLRule(CDL_PREFIXES),
    makeConsultationLimitRule(1),
    {
      ruleId: "DH_VITALITY_WELLNESS",
      name: "Discovery Vitality Wellness Code Check",
      description: "Discovery requires specific modifier codes for Vitality wellness screenings",
      severity: "info",
      check: (line) => {
        if (line.tariffCode?.startsWith("0190") && !line.modifier) {
          return [{
            lineNumber: line.lineNumber,
            field: "modifier",
            code: "DH_MISSING_VITALITY_MOD",
            severity: "info",
            rule: "Vitality Wellness Modifier",
            message: "Wellness screening tariff detected without modifier. Discovery may require Vitality-specific modifier codes.",
            suggestion: "Add the appropriate Vitality modifier if this is a Vitality Health Check.",
          }];
        }
        return [];
      },
    },
    {
      ruleId: "DH_GP_REFERRAL",
      name: "Discovery GP Network Referral",
      description: "KeyCare/Coastal plans require GP referral before specialist consultation",
      severity: "warning",
      check: (line) => {
        // Flag specialist tariffs without referral indicator
        const specialistTariffs = ["0192", "0193", "0194", "0200", "0201"];
        if (line.tariffCode && specialistTariffs.some(t => line.tariffCode!.startsWith(t))) {
          return [{
            lineNumber: line.lineNumber,
            field: "tariffCode",
            code: "DH_REFERRAL_NEEDED",
            severity: "warning",
            rule: "GP Referral May Be Required",
            message: "Specialist consultation tariff detected. KeyCare/Coastal/Delta plan members require a GP referral.",
            suggestion: "Confirm the patient's plan type. If on a restricted plan, ensure GP referral is on file.",
          }];
        }
        return [];
      },
    },
    {
      ruleId: "DH_MANAGED_CARE_BACK",
      name: "Discovery Back Pain Managed Care",
      description: "Discovery applies managed care protocols to back/spine claims",
      severity: "info",
      check: (line) => {
        if (/^M5[0-4]/i.test(line.primaryICD10)) {
          return [{
            lineNumber: line.lineNumber,
            field: "primaryICD10",
            code: "DH_MANAGED_BACK",
            severity: "info",
            rule: "Managed Care — Back Pain",
            message: `Discovery applies managed care protocols to back pain claims (${line.primaryICD10}). Conservative treatment must be tried before surgical intervention is authorized.`,
            suggestion: "Document conservative treatment history. Pre-auth required for MRI/CT/surgery.",
          }];
        }
        return [];
      },
    },
  ],
};

const gems: SchemeProfile = {
  name: "Government Employees Medical Scheme",
  code: "GEMS",
  cmsRegistrationNumber: "1201",
  administrator: "Metropolitan Health (GEMS Administrator)",
  claimWindowDays: 120,
  requiresPreAuth: [
    ...COMMON_PREAUTH_TARIFF,
    ...COMMON_PREAUTH_ICD,
    "0078",  // PET scans
    "0069",  // Dentistry — certain prosthetic codes
    "K00",   // Dental pre-auth for extractions under GA
    "0452",  // Spinal fusion
    "0191",  // Organ transplants
    "Z30",   // Contraceptive management (sterilisation pre-auth)
  ],
  specificityRequirements: "strict",
  genderCheckEnabled: true,
  ageCheckEnabled: true,
  eccRequired: true,
  maxConsultationsPerDay: 1,
  maxFollowUpDays: 5,
  pmbRules: {
    autoApprovePMB: false,
    requiresCDLAuth: true,
    pmbClaimWindowDays: 365,
    dspStrictEnforcement: true,
    autoPMBPrefixes: ["I21", "I60", "I61", "I62", "I63", "J45", "E10", "E11", "B20", "O"],
    notes: "GEMS is the second-largest scheme in SA (1.7M+ lives). Strict DSP enforcement — " +
      "members on Sapphire and Beryl options must use state facilities or GEMS DSP network. " +
      "PMB claims outside DSP are paid at GEMS tariff only. Ruby and Emerald options " +
      "have broader network access. GEMS rejects claims aggressively for specificity — " +
      "always code to the 4th character minimum. Government employees must use GEMS " +
      "by regulation (PSCBC Resolution 1 of 2006).",
  },
  chronicMedRules: {
    requiresCDLCode: true,
    requiresChronicApplication: true,
    maxDaysSupply: 28,
    formularyOnly: true,
    cdlConditionPrefixes: CDL_PREFIXES,
  },
  customRules: [
    makePreAuthRule([
      ...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD,
      "0078", "0069", "K00", "0452", "0191", "Z30",
    ]),
    makeDateWindowRule(120),
    makeFutureDateRule(),
    makeChronicCDLRule(CDL_PREFIXES),
    makeConsultationLimitRule(1),
    {
      ruleId: "GEMS_STATE_FACILITY",
      name: "GEMS State Facility Preference",
      description: "GEMS lower options must use state facilities as DSP",
      severity: "info",
      check: (line) => {
        // Info flag for all GEMS claims about DSP network
        if (line.amount && line.amount > 2000) {
          return [{
            lineNumber: line.lineNumber,
            field: "amount",
            code: "GEMS_DSP_CHECK",
            severity: "info",
            rule: "GEMS DSP Network Check",
            message: "High-value claim on GEMS. Sapphire/Beryl members must use DSP network or state facilities.",
            suggestion: "Verify the member's option and confirm DSP compliance to avoid tariff reduction.",
          }];
        }
        return [];
      },
    },
    {
      ruleId: "GEMS_MATERNITY_AUTH",
      name: "GEMS Maternity Pre-Auth",
      description: "GEMS requires maternity registration by 14 weeks gestation",
      severity: "warning",
      check: (line) => {
        if (/^O\d/i.test(line.primaryICD10)) {
          return [{
            lineNumber: line.lineNumber,
            field: "primaryICD10",
            code: "GEMS_MATERNITY_AUTH",
            severity: "warning",
            rule: "GEMS Maternity Registration",
            message: `Obstetric code "${line.primaryICD10}" detected. GEMS requires maternity registration by 14 weeks gestation.`,
            suggestion: "Ensure the member has registered their pregnancy with GEMS. Late registration may result in reduced benefits.",
          }];
        }
        return [];
      },
    },
    {
      ruleId: "GEMS_CHRONIC_28DAY",
      name: "GEMS 28-Day Chronic Supply",
      description: "GEMS limits chronic medication to 28-day supply (not 30)",
      severity: "warning",
      check: (line) => {
        // Flag if quantity suggests >28 day supply for chronic meds
        if (line.nappiCode && line.quantity && line.quantity > 28) {
          const code = line.primaryICD10?.toUpperCase() || "";
          const isChronic = CDL_PREFIXES.some(p => code.startsWith(p));
          if (isChronic) {
            return [{
              lineNumber: line.lineNumber,
              field: "quantity",
              code: "GEMS_CHRONIC_SUPPLY",
              severity: "warning",
              rule: "GEMS 28-Day Chronic Limit",
              message: `Quantity ${line.quantity} may exceed GEMS 28-day chronic supply limit. GEMS uses 28 days, not 30.`,
              suggestion: "Dispense a maximum 28-day supply for GEMS chronic medication claims.",
            }];
          }
        }
        return [];
      },
    },
  ],
};

const bonitas: SchemeProfile = {
  name: "Bonitas Medical Fund",
  code: "BON",
  cmsRegistrationNumber: "1310",
  administrator: "Medscheme (Pty) Ltd",
  claimWindowDays: 120,
  requiresPreAuth: [
    ...COMMON_PREAUTH_TARIFF,
    ...COMMON_PREAUTH_ICD,
    "0078",  // PET scans
    "0401",  // Implants
    "M54",   // Back pain — Medscheme managed care
    "Z51",   // Chemo/radio
    "0452",  // Spinal surgery
  ],
  specificityRequirements: "moderate",
  genderCheckEnabled: true,
  ageCheckEnabled: true,
  eccRequired: true,
  maxConsultationsPerDay: 2,
  maxFollowUpDays: 3,
  pmbRules: {
    autoApprovePMB: false,
    requiresCDLAuth: true,
    pmbClaimWindowDays: 180,
    dspStrictEnforcement: false,
    autoPMBPrefixes: ["I21", "I60", "I61", "I62", "I63", "J45", "E10", "E11", "B20"],
    notes: "Bonitas is administered by Medscheme. Uses the Medscheme clinical review " +
      "platform for pre-auth. PMB claims are paid at 100% of scheme tariff. DSP enforcement " +
      "is moderate — members on BonCap (capitation) option have strict network rules, while " +
      "BonSave and BonComplete offer broader access. Bonitas PMB claim window is 180 days, " +
      "shorter than some competitors.",
  },
  chronicMedRules: {
    requiresCDLCode: true,
    requiresChronicApplication: true,
    maxDaysSupply: 30,
    formularyOnly: true,
    cdlConditionPrefixes: CDL_PREFIXES,
  },
  customRules: [
    makePreAuthRule([
      ...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD,
      "0078", "0401", "M54", "Z51", "0452",
    ]),
    makeDateWindowRule(120),
    makeFutureDateRule(),
    makeChronicCDLRule(CDL_PREFIXES),
    makeConsultationLimitRule(2),
    {
      ruleId: "BON_BONCAP_NETWORK",
      name: "Bonitas BonCap Network Restriction",
      description: "BonCap members are restricted to capitation network providers",
      severity: "info",
      check: (line) => {
        // General info flag for Bonitas claims
        return [{
          lineNumber: line.lineNumber,
          field: "primaryICD10",
          code: "BON_NETWORK_INFO",
          severity: "info",
          rule: "Bonitas Network Check",
          message: "BonCap and BonEssential members use capitation network. Verify member option before billing.",
        }];
      },
    },
    {
      ruleId: "BON_MEDSCHEME_REVIEW",
      name: "Bonitas Medscheme Clinical Review",
      description: "High-cost procedures routed through Medscheme clinical review",
      severity: "warning",
      check: (line) => {
        if (line.amount && line.amount > 5000) {
          return [{
            lineNumber: line.lineNumber,
            field: "amount",
            code: "BON_CLINICAL_REVIEW",
            severity: "warning",
            rule: "Medscheme Clinical Review",
            message: `High-value claim (R${line.amount.toFixed(2)}) will likely be routed through Medscheme clinical review.`,
            suggestion: "Ensure clinical notes and motivation are available. Medscheme may request additional documentation.",
          }];
        }
        return [];
      },
    },
  ],
};

const medshield: SchemeProfile = {
  name: "Medshield Medical Scheme",
  code: "MS",
  cmsRegistrationNumber: "1151",
  administrator: "Medshield Medical Scheme (self-administered)",
  claimWindowDays: 120,
  requiresPreAuth: [
    ...COMMON_PREAUTH_TARIFF,
    ...COMMON_PREAUTH_ICD,
    "0078",  // PET scans
    "0401",  // Implants/prosthetics
    "0069",  // Dental prosthetics
    "H25", "H26",  // Cataract surgery pre-auth
    "0452",  // Spinal fusion
  ],
  specificityRequirements: "moderate",
  genderCheckEnabled: true,
  ageCheckEnabled: false,
  eccRequired: true,
  maxConsultationsPerDay: 2,
  maxFollowUpDays: 5,
  pmbRules: {
    autoApprovePMB: false,
    requiresCDLAuth: true,
    pmbClaimWindowDays: 365,
    dspStrictEnforcement: false,
    autoPMBPrefixes: ["I21", "I60", "I61", "I62", "I63", "J45", "E10", "E11", "B20"],
    notes: "Medshield is self-administered (no third-party admin). Known for lenient " +
      "age-check enforcement but strict on ECC requirements. MediPhila (lowest option) has " +
      "GP network restrictions. Medshield processes claims relatively quickly — typically " +
      "within 14 days. PMB disputes can be escalated directly to the scheme ombudsman.",
  },
  chronicMedRules: {
    requiresCDLCode: true,
    requiresChronicApplication: true,
    maxDaysSupply: 30,
    formularyOnly: false,
    cdlConditionPrefixes: CDL_PREFIXES,
  },
  customRules: [
    makePreAuthRule([
      ...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD,
      "0078", "0401", "0069", "H25", "H26", "0452",
    ]),
    makeDateWindowRule(120),
    makeFutureDateRule(),
    makeChronicCDLRule(CDL_PREFIXES),
    makeConsultationLimitRule(2),
    {
      ruleId: "MS_CATARACT_PREAUTH",
      name: "Medshield Cataract Pre-Auth",
      description: "Medshield requires pre-auth for all cataract surgeries including lens implants",
      severity: "warning",
      check: (line) => {
        if (/^H2[56]/i.test(line.primaryICD10)) {
          return [{
            lineNumber: line.lineNumber,
            field: "primaryICD10",
            code: "MS_CATARACT_AUTH",
            severity: "warning",
            rule: "Medshield Cataract Pre-Auth",
            message: `Cataract code "${line.primaryICD10}" detected. Medshield requires pre-authorization for all cataract procedures including IOL selection.`,
            suggestion: "Submit pre-auth with visual acuity readings and IOL specifications before surgery.",
          }];
        }
        return [];
      },
    },
    {
      ruleId: "MS_DENTAL_LIMIT",
      name: "Medshield Dental Benefit Limit",
      description: "Medshield applies annual dental benefit limits — flag high dental claims",
      severity: "info",
      check: (line) => {
        if (/^K0[0-9]/i.test(line.primaryICD10) && line.amount && line.amount > 3000) {
          return [{
            lineNumber: line.lineNumber,
            field: "primaryICD10",
            code: "MS_DENTAL_LIMIT",
            severity: "info",
            rule: "Medshield Dental Benefit Check",
            message: "High-value dental claim. Medshield applies strict annual dental limits per option.",
            suggestion: "Verify remaining dental benefits before proceeding with treatment.",
          }];
        }
        return [];
      },
    },
  ],
};

const momentumHealth: SchemeProfile = {
  name: "Momentum Health Medical Scheme",
  code: "MH",
  cmsRegistrationNumber: "1124",
  administrator: "Momentum Health Solutions (MMI Group)",
  claimWindowDays: 120,
  requiresPreAuth: [
    ...COMMON_PREAUTH_TARIFF,
    ...COMMON_PREAUTH_ICD,
    "0078",  // PET scans
    "0401",  // Implants
    "0452",  // Spinal surgery
    "0191",  // Transplants
    "H25",   // Cataracts
    "Z51",   // Oncology
    "F10", "F11", "F12", "F13", "F14", "F15", "F19",  // Substance abuse rehab
  ],
  specificityRequirements: "strict",
  genderCheckEnabled: true,
  ageCheckEnabled: true,
  eccRequired: true,
  maxConsultationsPerDay: 1,
  maxFollowUpDays: 3,
  pmbRules: {
    autoApprovePMB: false,
    requiresCDLAuth: true,
    pmbClaimWindowDays: 365,
    dspStrictEnforcement: true,
    autoPMBPrefixes: ["I21", "I60", "I61", "I62", "I63", "J45", "E10", "E11", "B20", "C"],
    notes: "Momentum Health (formerly known as Momentum Medical Scheme before rebranding). " +
      "Strict pre-auth enforcement — uses Ingwe as managed care partner. Momentum Multiply " +
      "wellness benefits are separate from medical benefits. Evolve/Custom/Summit options " +
      "have different network tiers. PMB claims for oncology (C-codes) auto-flagged for " +
      "managed care review. Momentum is strict on the 3-day follow-up rule — " +
      "consultations within 3 days of initial consult are bundled.",
  },
  chronicMedRules: {
    requiresCDLCode: true,
    requiresChronicApplication: true,
    maxDaysSupply: 30,
    formularyOnly: true,
    cdlConditionPrefixes: CDL_PREFIXES,
  },
  customRules: [
    makePreAuthRule([
      ...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD,
      "0078", "0401", "0452", "0191", "H25", "Z51",
      "F10", "F11", "F12", "F13", "F14", "F15", "F19",
    ]),
    makeDateWindowRule(120),
    makeFutureDateRule(),
    makeChronicCDLRule(CDL_PREFIXES),
    makeConsultationLimitRule(1),
    {
      ruleId: "MH_REHAB_PREAUTH",
      name: "Momentum Rehab Pre-Auth",
      description: "Momentum requires pre-auth for all substance abuse and psychiatric rehabilitation",
      severity: "warning",
      check: (line) => {
        if (/^F1[0-9]/i.test(line.primaryICD10)) {
          return [{
            lineNumber: line.lineNumber,
            field: "primaryICD10",
            code: "MH_REHAB_AUTH",
            severity: "warning",
            rule: "Momentum Rehab Pre-Authorization",
            message: `Substance use disorder code "${line.primaryICD10}" detected. Momentum requires pre-authorization for all rehabilitation admissions.`,
            suggestion: "Submit pre-auth through Ingwe managed care. Include treatment plan and motivation letter.",
          }];
        }
        return [];
      },
    },
    {
      ruleId: "MH_FOLLOW_UP_BUNDLE",
      name: "Momentum Follow-Up Bundling",
      description: "Momentum bundles follow-up visits within 3 days of initial consultation",
      severity: "warning",
      check: (line) => {
        // This is informational — actual cross-line check happens in validateSchemeRules
        const consultTariffs = ["0190", "0191", "0100", "0101", "0102"];
        if (line.tariffCode && consultTariffs.some(t => line.tariffCode!.startsWith(t))) {
          return [{
            lineNumber: line.lineNumber,
            field: "tariffCode",
            code: "MH_FOLLOWUP_BUNDLE",
            severity: "info",
            rule: "Momentum Follow-Up Bundling",
            message: "Consultation tariff detected. Momentum bundles follow-up visits within 3 days — second consult may be rejected.",
            suggestion: "If this is a follow-up within 3 days, consider using the follow-up tariff code instead.",
          }];
        }
        return [];
      },
    },
    {
      ruleId: "MH_ONCOLOGY_MANAGED",
      name: "Momentum Oncology Managed Care",
      description: "All oncology claims are routed through Momentum's oncology managed care programme",
      severity: "warning",
      check: (line) => {
        if (/^C\d/i.test(line.primaryICD10) || /^D[0-4]\d/i.test(line.primaryICD10)) {
          return [{
            lineNumber: line.lineNumber,
            field: "primaryICD10",
            code: "MH_ONCOLOGY_MANAGED",
            severity: "warning",
            rule: "Momentum Oncology Programme",
            message: `Oncology code "${line.primaryICD10}" detected. Momentum routes all cancer claims through their oncology managed care programme.`,
            suggestion: "Register the patient on Momentum's oncology programme. Treatment plans must be pre-approved.",
          }];
        }
        return [];
      },
    },
  ],
};

const bestmed: SchemeProfile = {
  name: "Bestmed Medical Scheme",
  code: "BM",
  cmsRegistrationNumber: "1192",
  administrator: "Bestmed Medical Scheme (self-administered)",
  claimWindowDays: 120,
  requiresPreAuth: [
    ...COMMON_PREAUTH_TARIFF,
    ...COMMON_PREAUTH_ICD,
    "0078",  // PET scans
    "0401",  // Implants
    "0452",  // Spinal surgery
    "H25",   // Cataracts
    "0069",  // Complex dental
    "N17", "N18",  // Renal dialysis
  ],
  specificityRequirements: "moderate",
  genderCheckEnabled: true,
  ageCheckEnabled: true,
  eccRequired: true,
  maxConsultationsPerDay: 2,
  maxFollowUpDays: 5,
  pmbRules: {
    autoApprovePMB: true,
    requiresCDLAuth: true,
    pmbClaimWindowDays: 365,
    dspStrictEnforcement: false,
    autoPMBPrefixes: ["I21", "I60", "I61", "I62", "I63", "J45", "E10", "E11", "B20", "O", "C"],
    notes: "Bestmed is one of the few self-administered open schemes. Based in Pretoria, " +
      "historically strong in the government and academic sector. Bestmed auto-approves " +
      "most PMB claims at point of service, making it more provider-friendly. Beat options " +
      "(Beat1-4) are comprehensive; Pace options are network-restricted. Bestmed Tempo is " +
      "the hospital-only plan with limited day-to-day benefits. Claims processing is " +
      "typically faster than industry average (7-10 days).",
  },
  chronicMedRules: {
    requiresCDLCode: true,
    requiresChronicApplication: true,
    maxDaysSupply: 30,
    formularyOnly: false,
    cdlConditionPrefixes: CDL_PREFIXES,
  },
  customRules: [
    makePreAuthRule([
      ...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD,
      "0078", "0401", "0452", "H25", "0069", "N17", "N18",
    ]),
    makeDateWindowRule(120),
    makeFutureDateRule(),
    makeChronicCDLRule(CDL_PREFIXES),
    makeConsultationLimitRule(2),
    {
      ruleId: "BM_PACE_NETWORK",
      name: "Bestmed Pace Network Restriction",
      description: "Pace option members must use Bestmed's contracted network",
      severity: "info",
      check: () => {
        // General info — network verification is external
        return [];
      },
    },
    {
      ruleId: "BM_RENAL_AUTH",
      name: "Bestmed Renal Dialysis Auth",
      description: "All dialysis claims require ongoing authorization with quarterly reviews",
      severity: "warning",
      check: (line) => {
        if (/^N1[78]/i.test(line.primaryICD10)) {
          return [{
            lineNumber: line.lineNumber,
            field: "primaryICD10",
            code: "BM_RENAL_AUTH",
            severity: "warning",
            rule: "Bestmed Renal Dialysis Auth",
            message: `Renal disease code "${line.primaryICD10}" detected. Bestmed requires ongoing authorization for dialysis with quarterly clinical reviews.`,
            suggestion: "Ensure current dialysis authorization is valid. Submit quarterly review reports to maintain approval.",
          }];
        }
        return [];
      },
    },
    {
      ruleId: "BM_FAST_TURNAROUND",
      name: "Bestmed Fast Turnaround Info",
      description: "Bestmed typically processes claims within 7-10 business days",
      severity: "info",
      check: () => {
        // Informational only — no validation needed
        return [];
      },
    },
  ],
};

const genericDefault: SchemeProfile = {
  name: "Generic / Default Scheme Rules",
  code: "DEFAULT",
  administrator: "N/A — CMS baseline rules",
  claimWindowDays: 120,
  requiresPreAuth: [...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD],
  specificityRequirements: "moderate",
  genderCheckEnabled: true,
  ageCheckEnabled: true,
  eccRequired: true,
  maxConsultationsPerDay: 2,
  maxFollowUpDays: 5,
  pmbRules: {
    autoApprovePMB: false,
    requiresCDLAuth: true,
    pmbClaimWindowDays: 365,
    dspStrictEnforcement: false,
    autoPMBPrefixes: ["I21", "I60", "I61", "I62", "I63", "J45", "E10", "E11", "B20"],
    notes: "Default rules based on CMS (Council for Medical Schemes) regulations. " +
      "All registered SA medical schemes must comply with the Medical Schemes Act 131 of 1998. " +
      "PMB conditions (270 diagnosis-treatment pairs) must be covered by all schemes. " +
      "Schemes cannot impose general waiting periods exceeding 3 months or condition-specific " +
      "waiting periods exceeding 12 months. Late-joiner penalties apply per CMS formula.",
  },
  chronicMedRules: {
    requiresCDLCode: true,
    requiresChronicApplication: true,
    maxDaysSupply: 30,
    formularyOnly: false,
    cdlConditionPrefixes: CDL_PREFIXES,
  },
  customRules: [
    makePreAuthRule([...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD]),
    makeDateWindowRule(120),
    makeFutureDateRule(),
    makeChronicCDLRule(CDL_PREFIXES),
    makeConsultationLimitRule(2),
    {
      ruleId: "DEFAULT_PMB_OVERRIDE",
      name: "PMB Override Protection",
      description: "Schemes cannot deny PMB claims — flag if PMB condition is coded",
      severity: "info",
      check: (line) => {
        const code = line.primaryICD10?.toUpperCase() || "";
        const pmbPrefixes = ["I21", "I60", "I61", "I62", "I63", "J45", "E10", "E11", "B20",
          "O", "C", "E03", "E05", "G40", "N18", "G20", "G35", "K50", "K51"];
        for (const prefix of pmbPrefixes) {
          if (code.startsWith(prefix)) {
            return [{
              lineNumber: line.lineNumber,
              field: "primaryICD10",
              code: "PMB_PROTECTED",
              severity: "info",
              rule: "PMB Override Protection",
              message: `Code "${code}" is a PMB condition. The scheme cannot deny this claim if clinically appropriate, regardless of benefit limits.`,
              suggestion: "If this claim is rejected, appeal citing PMB regulations (Medical Schemes Act, Section 29).",
            }];
          }
        }
        return [];
      },
    },
    {
      ruleId: "DEFAULT_TARIFF_REQUIRED",
      name: "Tariff Code Required",
      description: "Most schemes require a valid tariff/procedure code alongside the ICD-10",
      severity: "warning",
      check: (line) => {
        if (!line.tariffCode && !line.nappiCode) {
          return [{
            lineNumber: line.lineNumber,
            field: "tariffCode",
            code: "MISSING_TARIFF",
            severity: "warning",
            rule: "Missing Tariff/NAPPI Code",
            message: "No tariff code or NAPPI code provided. Most schemes require at least one procedure or product code.",
            suggestion: "Add the appropriate NHRPL tariff code or NAPPI code for the service/product rendered.",
          }];
        }
        return [];
      },
    },
  ],
};

// ─── EXPORTS ────────────────────────────────────────────────────

/** All scheme profiles */
export const SCHEME_PROFILES: SchemeProfile[] = [
  discoveryHealth,
  gems,
  bonitas,
  medshield,
  momentumHealth,
  bestmed,
  genericDefault,
];

/** Scheme list for UI dropdowns */
export const SCHEME_LIST: { code: string; name: string }[] = SCHEME_PROFILES
  .filter(s => s.code !== "DEFAULT")
  .map(s => ({ code: s.code, name: s.name }));

/** Look up a scheme profile by code. Returns the default profile if not found. */
export function getSchemeProfile(schemeCode: string): SchemeProfile {
  const upper = schemeCode.toUpperCase().trim();
  return SCHEME_PROFILES.find(s => s.code.toUpperCase() === upper) || genericDefault;
}

/**
 * Validate a single claim line against scheme-specific rules.
 * Returns all validation issues found by the scheme's custom rules,
 * plus cross-line checks when multiple lines are provided.
 */
export function validateSchemeRules(
  claimLine: ClaimLineItem,
  schemeCode: string,
  allLines?: ClaimLineItem[],
): ValidationIssue[] {
  const profile = getSchemeProfile(schemeCode);
  const issues: ValidationIssue[] = [];

  // Run all custom rules for this scheme
  for (const rule of profile.customRules) {
    const ruleIssues = rule.check(claimLine, profile);
    issues.push(...ruleIssues);
  }

  // ── Specificity enforcement ──
  if (profile.specificityRequirements === "strict") {
    const code = claimLine.primaryICD10?.toUpperCase() || "";
    // Strict schemes reject 3-character codes when 4th character exists
    if (/^[A-Z]\d{2}$/i.test(code) && !code.startsWith("U")) {
      issues.push({
        lineNumber: claimLine.lineNumber,
        field: "primaryICD10",
        code: "SCHEME_SPECIFICITY",
        severity: "error",
        rule: `${profile.name} — Specificity Requirement`,
        message: `"${code}" is a 3-character code. ${profile.name} requires 4th character specificity minimum.`,
        suggestion: `Add a 4th character (e.g., ${code}.0 or ${code}.9) to meet ${profile.code} specificity requirements.`,
      });
    }
  }

  // ── Cross-line: consultation-per-day check ──
  if (allLines && allLines.length > 1 && claimLine.dateOfService) {
    const sameDaySamePatient = allLines.filter(l =>
      l.lineNumber !== claimLine.lineNumber &&
      l.dateOfService === claimLine.dateOfService &&
      l.patientName && claimLine.patientName &&
      l.patientName.toLowerCase() === claimLine.patientName.toLowerCase()
    );

    // Count consultation tariffs on same day
    const consultPrefixes = ["0190", "0191", "0100", "0101", "0102", "0103"];
    const isConsult = claimLine.tariffCode &&
      consultPrefixes.some(p => claimLine.tariffCode!.startsWith(p));

    if (isConsult) {
      const otherConsults = sameDaySamePatient.filter(l =>
        l.tariffCode && consultPrefixes.some(p => l.tariffCode!.startsWith(p))
      );

      if (otherConsults.length >= profile.maxConsultationsPerDay) {
        issues.push({
          lineNumber: claimLine.lineNumber,
          field: "tariffCode",
          code: "MAX_CONSULT_EXCEEDED",
          severity: "error",
          rule: `${profile.name} — Consultation Limit`,
          message: `Maximum ${profile.maxConsultationsPerDay} consultation(s) per patient per day for ${profile.code}. Found ${otherConsults.length + 1} consultation tariffs on ${claimLine.dateOfService}.`,
          suggestion: "Remove duplicate consultation charges or use a different tariff code for additional services.",
        });
      }
    }
  }

  // ── Cross-line: follow-up day gap check ──
  if (allLines && allLines.length > 1 && claimLine.dateOfService && claimLine.patientName) {
    const serviceDate = parseDate(claimLine.dateOfService);
    if (serviceDate) {
      const consultPrefixes = ["0190", "0191", "0100", "0101", "0102", "0103"];
      const isConsult = claimLine.tariffCode &&
        consultPrefixes.some(p => claimLine.tariffCode!.startsWith(p));

      if (isConsult) {
        for (const other of allLines) {
          if (other.lineNumber === claimLine.lineNumber) continue;
          if (!other.dateOfService || !other.patientName) continue;
          if (other.patientName.toLowerCase() !== claimLine.patientName.toLowerCase()) continue;

          const otherIsConsult = other.tariffCode &&
            consultPrefixes.some(p => other.tariffCode!.startsWith(p));
          if (!otherIsConsult) continue;

          const otherDate = parseDate(other.dateOfService);
          if (!otherDate) continue;

          const diffDays = Math.abs(
            Math.floor((serviceDate.getTime() - otherDate.getTime()) / (1000 * 60 * 60 * 24))
          );

          if (diffDays > 0 && diffDays <= profile.maxFollowUpDays) {
            issues.push({
              lineNumber: claimLine.lineNumber,
              field: "dateOfService",
              code: "FOLLOWUP_TOO_SOON",
              severity: "warning",
              rule: `${profile.name} — Follow-Up Interval`,
              message: `Follow-up consultation within ${diffDays} day(s) of line ${other.lineNumber}. ${profile.code} may bundle or reject follow-ups within ${profile.maxFollowUpDays} days.`,
              suggestion: "Consider using a follow-up tariff code, or document clinical necessity for the repeat visit.",
            });
            break; // Only warn once per line
          }
        }
      }
    }
  }

  return issues;
}
