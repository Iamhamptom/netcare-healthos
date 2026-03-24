// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Extended Scheme Profiles — 19 Additional SA Medical Schemes
// Expands coverage from 6 core → 25 total schemes (~95% of SA market)
//
// Sources: CMS Annual Reports, scheme-specific provider manuals,
// switching house routing tables, docs/knowledge/05_scheme_profiles.md
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { SchemeProfile, SchemeRule } from "./scheme-rules";
import type { ClaimLineItem, ValidationIssue } from "./types";

// ─── CDL PREFIXES (shared) ────────────────────────────────────────────────────
const CDL_PREFIXES = [
  "E10", "E11", "E13", "E14", "I10", "I11", "I12", "I13", "I15",
  "J45", "J44", "I20", "I21", "I22", "I25", "I50", "G40", "N18",
  "K50", "K51", "M05", "M06", "L40", "G35", "E03", "E05", "G20",
  "B20", "B21", "B22", "B23", "B24", "E22", "E24", "D46", "C",
  "F20", "F31", "F32", "F33", "E66", "M81", "N80",
];

const COMMON_PREAUTH_TARIFF = [
  "0008", "0009", "3601", "0186", "0457", "0520", "0046",
];
const COMMON_PREAUTH_ICD = [
  "Z51", "M17", "M16", "M47", "M50", "M51", "I63", "I21",
];

// ─── SHARED RULE BUILDERS ─────────────────────────────────────────────────────

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const str = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const d = new Date(str + "T00:00:00");
    return isNaN(d.getTime()) ? null : d;
  }
  const match = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

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
              message: `Code "${code}" matches pre-authorization prefix "${prefix}". This scheme requires prior approval.`,
              suggestion: "Ensure pre-authorization was obtained before the date of service.",
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
          lineNumber: line.lineNumber, field: "dateOfService",
          code: "CLAIM_WINDOW_EXPIRED", severity: "error",
          rule: "Claim Window Expired",
          message: `Service date ${line.dateOfService} is ${diffDays} days ago, exceeding the ${windowDays}-day submission window.`,
          suggestion: `Claims must be submitted within ${windowDays} days. Contact the scheme for late submission appeals.`,
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
          lineNumber: line.lineNumber, field: "dateOfService",
          code: "FUTURE_SERVICE_DATE", severity: "error",
          rule: "Future Service Date",
          message: `Service date ${line.dateOfService} is in the future.`,
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
    description: "Flags chronic conditions that require CDL authorization",
    severity: "warning",
    check: (line) => {
      const code = line.primaryICD10?.toUpperCase() || "";
      for (const prefix of cdlPrefixes) {
        if (code.startsWith(prefix)) {
          return [{
            lineNumber: line.lineNumber, field: "primaryICD10",
            code: "CDL_AUTH_REQUIRED", severity: "warning",
            rule: "CDL Authorization Required",
            message: `Diagnosis "${code}" is a CDL condition. This scheme requires CDL authorization.`,
            suggestion: "Ensure the patient has an approved chronic application on file.",
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
    check: () => [],
  };
}

function makeNetworkRule(schemeName: string, networkName: string, plans: string): SchemeRule {
  return {
    ruleId: `${schemeName.toUpperCase().replace(/\s/g, "_")}_NETWORK`,
    name: `${schemeName} Network Restriction`,
    description: `${plans} must use ${networkName} network providers`,
    severity: "info",
    check: (line) => {
      if (line.amount && line.amount > 1500) {
        return [{
          lineNumber: line.lineNumber, field: "amount",
          code: `${schemeName.toUpperCase().replace(/\s/g, "_")}_NETWORK_CHECK`,
          severity: "info",
          rule: `${schemeName} Network Check`,
          message: `Verify member's plan option. ${plans} must use ${networkName} network — non-network claims may be reduced or rejected.`,
          suggestion: `Confirm DSP/network compliance for ${schemeName} before billing.`,
        }];
      }
      return [];
    },
  };
}

function makeHighCostReviewRule(schemeName: string, threshold: number): SchemeRule {
  return {
    ruleId: `${schemeName.toUpperCase().replace(/\s/g, "_")}_HIGH_COST`,
    name: `${schemeName} High-Cost Review`,
    description: `Claims above R${threshold} trigger clinical review`,
    severity: "warning",
    check: (line) => {
      if (line.amount && line.amount > threshold) {
        return [{
          lineNumber: line.lineNumber, field: "amount",
          code: `${schemeName.toUpperCase().replace(/\s/g, "_")}_CLINICAL_REVIEW`,
          severity: "warning",
          rule: `${schemeName} Clinical Review`,
          message: `Claim R${line.amount.toFixed(2)} exceeds R${threshold} threshold — will trigger clinical review.`,
          suggestion: "Ensure clinical notes and motivation are available.",
        }];
      }
      return [];
    },
  };
}

function makeMembershipFormatRule(schemeName: string, code: string, pattern: RegExp, format: string): SchemeRule {
  return {
    ruleId: `${code}_MEMBERSHIP_FORMAT`,
    name: `${schemeName} Membership Format`,
    description: `${schemeName} membership numbers must match ${format}`,
    severity: "error",
    check: (line) => {
      if (line.membershipNumber && !pattern.test(line.membershipNumber)) {
        return [{
          lineNumber: line.lineNumber, field: "membershipNumber",
          code: `${code}_MEMBERSHIP_INVALID`,
          severity: "error",
          rule: `${schemeName} Membership Format`,
          message: `Membership "${line.membershipNumber}" doesn't match expected format: ${format}.`,
          suggestion: `${schemeName} membership numbers must be ${format}. Verify with the patient.`,
        }];
      }
      return [];
    },
  };
}

// ─── SCHEME PROFILES ──────────────────────────────────────────────────────────

export const fedhealth: SchemeProfile = {
  name: "Fedhealth Medical Scheme",
  code: "FH",
  cmsRegistrationNumber: "1027",
  administrator: "Fedhealth (MMI Group)",
  claimWindowDays: 120,
  requiresPreAuth: [
    ...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD,
    "0078", "0401", "0452", "H25", "Z51",
    "F10", "F11", "F12", "F13", "F19", // Substance abuse rehab
    "M54", // Back pain managed care
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
    autoPMBPrefixes: ["I21", "I60", "I61", "I62", "I63", "J45", "E10", "E11", "B20", "O", "C"],
    notes: "Fedhealth (part of MMI/Momentum Group). Uses flexi-benefit model — members choose " +
      "benefit allocations. ElectriFED and myFED options are restricted network. Fedhealth maxima " +
      "plans have high savings with risk-benefit top-up. Pre-auth via Discovery-style electronic portal.",
  },
  chronicMedRules: {
    requiresCDLCode: true,
    requiresChronicApplication: true,
    maxDaysSupply: 30,
    formularyOnly: true,
    cdlConditionPrefixes: CDL_PREFIXES,
  },
  customRules: [
    makePreAuthRule([...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD, "0078", "0401", "0452", "H25", "Z51", "F10", "F11", "F12", "F13", "F19", "M54"]),
    makeDateWindowRule(120),
    makeFutureDateRule(),
    makeChronicCDLRule(CDL_PREFIXES),
    makeConsultationLimitRule(1),
    makeNetworkRule("Fedhealth", "Fedhealth Contracted", "ElectriFED and myFED members"),
    makeHighCostReviewRule("Fedhealth", 5000),
    {
      ruleId: "FH_FLEXI_BENEFIT",
      name: "Fedhealth Flexi-Benefit Check",
      description: "Fedhealth members allocate benefits — verify allocation before high-cost treatment",
      severity: "info",
      check: (line) => {
        if (line.amount && line.amount > 3000) {
          return [{
            lineNumber: line.lineNumber, field: "amount",
            code: "FH_FLEXI_CHECK", severity: "info",
            rule: "Fedhealth Flexi-Benefit Allocation",
            message: "Fedhealth uses a flexi-benefit model. Verify the member has allocated sufficient benefits for this service category.",
            suggestion: "Check with the member or Fedhealth portal for remaining benefit allocation.",
          }];
        }
        return [];
      },
    },
    {
      ruleId: "FH_BACK_MANAGED_CARE",
      name: "Fedhealth Back Pain Protocol",
      description: "Fedhealth applies managed care protocols to back/spine claims via Momentum Health Solutions",
      severity: "warning",
      check: (line) => {
        if (/^M5[0-4]/i.test(line.primaryICD10)) {
          return [{
            lineNumber: line.lineNumber, field: "primaryICD10",
            code: "FH_MANAGED_BACK", severity: "warning",
            rule: "Fedhealth Managed Care — Back Pain",
            message: `Back pain code "${line.primaryICD10}" detected. Fedhealth requires managed care review before surgical intervention.`,
            suggestion: "Document 6+ weeks conservative treatment. Submit via Momentum Health Solutions managed care.",
          }];
        }
        return [];
      },
    },
  ],
};

export const polmed: SchemeProfile = {
  name: "Polmed Medical Scheme",
  code: "POL",
  cmsRegistrationNumber: "1169",
  administrator: "Medscheme (Pty) Ltd",
  claimWindowDays: 120,
  requiresPreAuth: [
    ...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD,
    "0078", "0401", "0452", "0191", "Z51",
    "F10", "F19", // Rehab
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
    notes: "Polmed is a restricted scheme for SAPS (police) members and their dependants. " +
      "Strict DSP enforcement — members on lower options must use state or Polmed-contracted facilities. " +
      "Polmed Aqua is the comprehensive option; Polmed Marine is hospital-only. " +
      "Claims processed by Medscheme. Known for strict ICD-10 specificity and pre-auth enforcement.",
  },
  chronicMedRules: {
    requiresCDLCode: true,
    requiresChronicApplication: true,
    maxDaysSupply: 30,
    formularyOnly: true,
    cdlConditionPrefixes: CDL_PREFIXES,
  },
  customRules: [
    makePreAuthRule([...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD, "0078", "0401", "0452", "0191", "Z51", "F10", "F19"]),
    makeDateWindowRule(120),
    makeFutureDateRule(),
    makeChronicCDLRule(CDL_PREFIXES),
    makeConsultationLimitRule(1),
    makeNetworkRule("Polmed", "Polmed DSP/State", "Marine option members"),
    makeHighCostReviewRule("Polmed", 4000),
    {
      ruleId: "POL_OCCUPATIONAL_INJURY",
      name: "Polmed Occupational Injury Check",
      description: "SAPS injuries on duty may be covered by COIDA, not medical scheme",
      severity: "warning",
      check: (line) => {
        if (/^[ST]\d/i.test(line.primaryICD10)) {
          return [{
            lineNumber: line.lineNumber, field: "primaryICD10",
            code: "POL_COIDA_CHECK", severity: "warning",
            rule: "Polmed Occupational Injury",
            message: `Injury code "${line.primaryICD10}" detected for Polmed (SAPS) member. If this is an on-duty injury, it should be claimed through COIDA, not the medical scheme.`,
            suggestion: "Verify whether the injury occurred on/off duty. On-duty = COIDA claim, off-duty = Polmed claim.",
          }];
        }
        return [];
      },
    },
  ],
};

export const bankmed: SchemeProfile = {
  name: "Bankmed Medical Scheme",
  code: "BANK",
  cmsRegistrationNumber: "1131",
  administrator: "Bankmed (self-administered)",
  claimWindowDays: 120,
  requiresPreAuth: [
    ...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD,
    "0078", "0401", "0452", "H25", "0191",
  ],
  specificityRequirements: "moderate",
  genderCheckEnabled: true,
  ageCheckEnabled: true,
  eccRequired: true,
  maxConsultationsPerDay: 2,
  maxFollowUpDays: 3,
  pmbRules: {
    autoApprovePMB: true,
    requiresCDLAuth: true,
    pmbClaimWindowDays: 365,
    dspStrictEnforcement: false,
    autoPMBPrefixes: ["I21", "I60", "I61", "I62", "I63", "J45", "E10", "E11", "B20", "O", "C"],
    notes: "Bankmed is a restricted scheme for banking sector employees (ABSA, Standard Bank, Nedbank, etc.). " +
      "Self-administered with fast turnaround (10-12 days). Comprehensive plan (Traditional) has " +
      "no network restrictions. Essential and Basic options use contracted networks. " +
      "Bankmed is generally provider-friendly with good PMB auto-approval.",
  },
  chronicMedRules: {
    requiresCDLCode: true,
    requiresChronicApplication: true,
    maxDaysSupply: 30,
    formularyOnly: false,
    cdlConditionPrefixes: CDL_PREFIXES,
  },
  customRules: [
    makePreAuthRule([...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD, "0078", "0401", "0452", "H25", "0191"]),
    makeDateWindowRule(120),
    makeFutureDateRule(),
    makeChronicCDLRule(CDL_PREFIXES),
    makeConsultationLimitRule(2),
    makeNetworkRule("Bankmed", "Bankmed Contracted", "Essential and Basic option members"),
    {
      ruleId: "BANK_SAVINGS_DEPLETION",
      name: "Bankmed Savings Account Warning",
      description: "Bankmed Traditional plan has savings — check depletion before out-of-hospital claims",
      severity: "info",
      check: (line) => {
        if (line.amount && line.amount > 2000 && !line.tariffCode?.startsWith("0008") && !line.tariffCode?.startsWith("0009")) {
          return [{
            lineNumber: line.lineNumber, field: "amount",
            code: "BANK_SAVINGS_CHECK", severity: "info",
            rule: "Bankmed Savings Account Check",
            message: "Out-of-hospital claim — verify member's savings account balance before treatment.",
          }];
        }
        return [];
      },
    },
  ],
};

export const profmed: SchemeProfile = {
  name: "Profmed Medical Scheme",
  code: "PROF",
  cmsRegistrationNumber: "1194",
  administrator: "PPS Healthcare Administrators",
  claimWindowDays: 120,
  requiresPreAuth: [
    ...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD,
    "0078", "0401", "0452", "H25",
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
    notes: "Profmed is a restricted scheme for graduate professionals. Administered by PPS Healthcare. " +
      "Higher-than-average tariff rates — Profmed typically pays 100-200% NHRPL. " +
      "ProActive Plus and ProSecure Plus are comprehensive options. ProPinnacle is premium. " +
      "Profmed is one of the most provider-friendly schemes in SA.",
  },
  chronicMedRules: {
    requiresCDLCode: true,
    requiresChronicApplication: true,
    maxDaysSupply: 30,
    formularyOnly: false,
    cdlConditionPrefixes: CDL_PREFIXES,
  },
  customRules: [
    makePreAuthRule([...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD, "0078", "0401", "0452", "H25"]),
    makeDateWindowRule(120),
    makeFutureDateRule(),
    makeChronicCDLRule(CDL_PREFIXES),
    makeConsultationLimitRule(2),
    {
      ruleId: "PROF_HIGH_TARIFF",
      name: "Profmed High Tariff Rate",
      description: "Profmed pays above-average rates — shortfall risk is lower",
      severity: "info",
      check: () => [],
    },
  ],
};

export const compcare: SchemeProfile = {
  name: "CompCare Medical Scheme",
  code: "CC",
  cmsRegistrationNumber: "1085",
  administrator: "Universal Healthcare Administrators",
  claimWindowDays: 120,
  requiresPreAuth: [
    ...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD,
    "0078", "0401", "0452", "0191", "H25",
    "F10", "F11", "F12", "F13", "F19",
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
    notes: "CompCare is an open scheme. Routes through MediKredit switching house. " +
      "NetworkPlus and CheerfulPlus are restricted network options. CompEasy is the entry-level " +
      "hospital plan. CompCare uses Universal Healthcare as administrator — claims go via MediKredit. " +
      "Strict ICD-10 specificity enforcement.",
  },
  chronicMedRules: {
    requiresCDLCode: true,
    requiresChronicApplication: true,
    maxDaysSupply: 30,
    formularyOnly: true,
    cdlConditionPrefixes: CDL_PREFIXES,
  },
  customRules: [
    makePreAuthRule([...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD, "0078", "0401", "0452", "0191", "H25", "F10", "F11", "F12", "F13", "F19"]),
    makeDateWindowRule(120),
    makeFutureDateRule(),
    makeChronicCDLRule(CDL_PREFIXES),
    makeConsultationLimitRule(1),
    makeNetworkRule("CompCare", "CompCare Network", "NetworkPlus and CheerfulPlus members"),
    makeHighCostReviewRule("CompCare", 4000),
    {
      ruleId: "CC_MEDIKREDIT_ROUTING",
      name: "CompCare MediKredit Routing",
      description: "CompCare routes through MediKredit — use MediKredit EDIFACT format",
      severity: "info",
      check: () => [],
    },
  ],
};

export const pps: SchemeProfile = {
  name: "PPS Healthcare Administrators (Medical Scheme)",
  code: "PPS",
  cmsRegistrationNumber: "1178",
  administrator: "PPS Healthcare Administrators",
  claimWindowDays: 120,
  requiresPreAuth: [
    ...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD,
    "0078", "0401", "0452", "H25",
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
    notes: "PPS Medical Aid — restricted to graduate professionals (same market as Profmed). " +
      "PPS ProfMed Executive and ProfMed Essential. Routes through MediKredit. " +
      "Provider-friendly scheme with good tariff rates (typically 100% NHRPL+). " +
      "PPS profit-share model means members benefit from low claims ratios.",
  },
  chronicMedRules: {
    requiresCDLCode: true,
    requiresChronicApplication: true,
    maxDaysSupply: 30,
    formularyOnly: false,
    cdlConditionPrefixes: CDL_PREFIXES,
  },
  customRules: [
    makePreAuthRule([...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD, "0078", "0401", "0452", "H25"]),
    makeDateWindowRule(120),
    makeFutureDateRule(),
    makeChronicCDLRule(CDL_PREFIXES),
    makeConsultationLimitRule(2),
    {
      ruleId: "PPS_PROFIT_SHARE",
      name: "PPS Profit-Share Model",
      description: "PPS returns surplus to members — accurate coding reduces waste and benefits all members",
      severity: "info",
      check: () => [],
    },
  ],
};

export const sizweHosmed: SchemeProfile = {
  name: "Sizwe Hosmed Medical Fund",
  code: "SH",
  cmsRegistrationNumber: "1141",
  administrator: "Sizwe Hosmed (self-administered)",
  claimWindowDays: 120,
  requiresPreAuth: [
    ...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD,
    "0078", "0401", "0452", "0191", "H25",
  ],
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
    dspStrictEnforcement: true,
    autoPMBPrefixes: ["I21", "I60", "I61", "I62", "I63", "J45", "E10", "E11", "B20"],
    notes: "Sizwe Hosmed is a restricted scheme (formerly for Transnet employees, now broader state-owned enterprises). " +
      "Routes through SwitchOn. Self-administered in Johannesburg. " +
      "Value and Standard options use a restricted hospital network. " +
      "Comprehensive option has broader access. Known for moderate turnaround (14-21 days).",
  },
  chronicMedRules: {
    requiresCDLCode: true,
    requiresChronicApplication: true,
    maxDaysSupply: 30,
    formularyOnly: true,
    cdlConditionPrefixes: CDL_PREFIXES,
  },
  customRules: [
    makePreAuthRule([...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD, "0078", "0401", "0452", "0191", "H25"]),
    makeDateWindowRule(120),
    makeFutureDateRule(),
    makeChronicCDLRule(CDL_PREFIXES),
    makeConsultationLimitRule(2),
    makeNetworkRule("Sizwe Hosmed", "Sizwe Hosmed Hospital", "Value and Standard option members"),
    makeHighCostReviewRule("Sizwe Hosmed", 5000),
  ],
};

export const keyHealth: SchemeProfile = {
  name: "KeyHealth Medical Scheme",
  code: "KH",
  cmsRegistrationNumber: "1048",
  administrator: "Discovery Health (Pty) Ltd",
  claimWindowDays: 120,
  requiresPreAuth: [
    ...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD,
    "0078", "0401", "0452", "H25", "0191",
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
    notes: "KeyHealth is administered by Discovery Health — uses the same HealthID platform and " +
      "claims processing infrastructure. Strict ICD-10 specificity (inherits Discovery's strictness). " +
      "Routes through MediKredit. KeyHealth Plus and KeyHealth Compact are the main options. " +
      "Provider experience is very similar to Discovery Health claims.",
  },
  chronicMedRules: {
    requiresCDLCode: true,
    requiresChronicApplication: true,
    maxDaysSupply: 30,
    formularyOnly: true,
    cdlConditionPrefixes: CDL_PREFIXES,
  },
  customRules: [
    makePreAuthRule([...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD, "0078", "0401", "0452", "H25", "0191"]),
    makeDateWindowRule(120),
    makeFutureDateRule(),
    makeChronicCDLRule(CDL_PREFIXES),
    makeConsultationLimitRule(1),
    makeNetworkRule("KeyHealth", "KeyHealth/Discovery", "Compact option members"),
    {
      ruleId: "KH_DISCOVERY_ADMIN",
      name: "KeyHealth Discovery Administration",
      description: "KeyHealth uses Discovery's HealthID — same specificity/pre-auth standards",
      severity: "info",
      check: () => [],
    },
  ],
};

export const resolutionHealth: SchemeProfile = {
  name: "Resolution Health Medical Scheme",
  code: "RH",
  cmsRegistrationNumber: "1190",
  administrator: "Resolution Health (self-administered)",
  claimWindowDays: 120,
  requiresPreAuth: [
    ...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD,
    "0078", "0401", "0452",
  ],
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
    dspStrictEnforcement: true,
    autoPMBPrefixes: ["I21", "I60", "I61", "I62", "I63", "J45", "E10", "E11", "B20"],
    notes: "Resolution Health is an open scheme, self-administered. Routes through SwitchOn. " +
      "Known for affordable options targeting younger demographics. Resolution Prime and " +
      "Resolution Core are the main options. GP-first model on most plans — must see network GP " +
      "before specialist referral. DSP enforcement is strict on lower options.",
  },
  chronicMedRules: {
    requiresCDLCode: true,
    requiresChronicApplication: true,
    maxDaysSupply: 30,
    formularyOnly: true,
    cdlConditionPrefixes: CDL_PREFIXES,
  },
  customRules: [
    makePreAuthRule([...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD, "0078", "0401", "0452"]),
    makeDateWindowRule(120),
    makeFutureDateRule(),
    makeChronicCDLRule(CDL_PREFIXES),
    makeConsultationLimitRule(2),
    makeNetworkRule("Resolution Health", "Resolution DSP", "Core and Prime members"),
    {
      ruleId: "RH_GP_FIRST",
      name: "Resolution Health GP-First Model",
      description: "Most plans require GP consultation before specialist referral",
      severity: "warning",
      check: (line) => {
        const specialistTariffs = ["0141", "0142", "0200", "0201"];
        if (line.tariffCode && specialistTariffs.some(t => line.tariffCode!.startsWith(t))) {
          return [{
            lineNumber: line.lineNumber, field: "tariffCode",
            code: "RH_GP_REFERRAL_REQUIRED", severity: "warning",
            rule: "Resolution Health GP-First Referral",
            message: "Specialist consultation tariff detected. Resolution Health requires GP referral on most plans.",
            suggestion: "Confirm GP referral is on file before billing specialist consultation.",
          }];
        }
        return [];
      },
    },
  ],
};

export const genesis: SchemeProfile = {
  name: "Genesis Medical Scheme",
  code: "GEN",
  cmsRegistrationNumber: "1108",
  administrator: "Universal Healthcare Administrators",
  claimWindowDays: 120,
  requiresPreAuth: [
    ...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD,
    "0078", "0401", "0452",
  ],
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
    autoPMBPrefixes: ["I21", "I60", "I61", "I62", "I63", "J45", "E10", "E11", "B20", "O", "C"],
    notes: "Genesis Medical Scheme — notable for the CMS v Genesis [2015] ruling that established " +
      "that schemes without DSPs must pay PMBs at ANY provider. Open scheme, routes through SwitchOn. " +
      "Genesis Private and Genesis Premier options. Administered by Universal Healthcare. " +
      "Generally moderate in claims processing — 14-day turnaround.",
  },
  chronicMedRules: {
    requiresCDLCode: true,
    requiresChronicApplication: true,
    maxDaysSupply: 30,
    formularyOnly: false,
    cdlConditionPrefixes: CDL_PREFIXES,
  },
  customRules: [
    makePreAuthRule([...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD, "0078", "0401", "0452"]),
    makeDateWindowRule(120),
    makeFutureDateRule(),
    makeChronicCDLRule(CDL_PREFIXES),
    makeConsultationLimitRule(2),
    {
      ruleId: "GEN_PMB_PRECEDENT",
      name: "Genesis PMB Precedent",
      description: "CMS v Genesis [2015] — no DSP means pay PMBs at any provider",
      severity: "info",
      check: (line) => {
        const code = line.primaryICD10?.toUpperCase() || "";
        const pmbPrefixes = ["I21", "I60", "I61", "I62", "I63", "J45", "E10", "E11", "B20", "O", "C"];
        if (pmbPrefixes.some(p => code.startsWith(p))) {
          return [{
            lineNumber: line.lineNumber, field: "primaryICD10",
            code: "GEN_PMB_ANY_PROVIDER", severity: "info",
            rule: "Genesis PMB — CMS Precedent",
            message: `PMB condition "${code}" detected. Per CMS v Genesis [2015], if no DSP is designated, Genesis must pay at any provider.`,
            suggestion: "If PMB claim is rejected, cite CMS v Genesis [2015] Appeal Board ruling.",
          }];
        }
        return [];
      },
    },
  ],
};

export const liberty: SchemeProfile = {
  name: "Liberty Medical Scheme",
  code: "LIB",
  cmsRegistrationNumber: "1145",
  administrator: "Discovery Health (Pty) Ltd",
  claimWindowDays: 120,
  requiresPreAuth: [
    ...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD,
    "0078", "0401", "0452", "0191", "H25",
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
    notes: "Liberty Medical Scheme — restricted scheme for Liberty Group employees. " +
      "Administered by Discovery Health — identical claims processing to Discovery. " +
      "Routes through SwitchOn. Uses HealthID portal for pre-auth. " +
      "Same strict ICD-10 specificity rules as Discovery.",
  },
  chronicMedRules: {
    requiresCDLCode: true,
    requiresChronicApplication: true,
    maxDaysSupply: 30,
    formularyOnly: true,
    cdlConditionPrefixes: CDL_PREFIXES,
  },
  customRules: [
    makePreAuthRule([...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD, "0078", "0401", "0452", "0191", "H25"]),
    makeDateWindowRule(120),
    makeFutureDateRule(),
    makeChronicCDLRule(CDL_PREFIXES),
    makeConsultationLimitRule(1),
    {
      ruleId: "LIB_DISCOVERY_ADMIN",
      name: "Liberty Discovery Administration",
      description: "Liberty uses Discovery's HealthID — same rules as Discovery Health",
      severity: "info",
      check: () => [],
    },
  ],
};

export const sasolmed: SchemeProfile = {
  name: "Sasolmed Medical Scheme",
  code: "SASOL",
  cmsRegistrationNumber: "1154",
  administrator: "Discovery Health (Pty) Ltd",
  claimWindowDays: 120,
  requiresPreAuth: [
    ...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD,
    "0078", "0401", "0452", "0191",
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
    dspStrictEnforcement: false,
    autoPMBPrefixes: ["I21", "I60", "I61", "I62", "I63", "J45", "E10", "E11", "B20", "O", "C"],
    notes: "Sasolmed is a restricted scheme for Sasol employees. Administered by Discovery Health. " +
      "Routes through Healthbridge. Single comprehensive option. " +
      "Occupational health claims for Sasol-related conditions may fall under COIDA.",
  },
  chronicMedRules: {
    requiresCDLCode: true,
    requiresChronicApplication: true,
    maxDaysSupply: 30,
    formularyOnly: true,
    cdlConditionPrefixes: CDL_PREFIXES,
  },
  customRules: [
    makePreAuthRule([...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD, "0078", "0401", "0452", "0191"]),
    makeDateWindowRule(120),
    makeFutureDateRule(),
    makeChronicCDLRule(CDL_PREFIXES),
    makeConsultationLimitRule(1),
    {
      ruleId: "SASOL_OCCUPATIONAL",
      name: "Sasolmed Occupational Health Check",
      description: "Sasol petrochemical injuries may be COIDA, not medical scheme",
      severity: "warning",
      check: (line) => {
        if (/^[ST]\d/i.test(line.primaryICD10) || /^J68/i.test(line.primaryICD10) || /^T5[2-9]/i.test(line.primaryICD10)) {
          return [{
            lineNumber: line.lineNumber, field: "primaryICD10",
            code: "SASOL_COIDA_CHECK", severity: "warning",
            rule: "Sasolmed Occupational Health",
            message: `Injury/chemical exposure code "${line.primaryICD10}" for Sasolmed member. May be an occupational claim (COIDA).`,
            suggestion: "Verify if exposure/injury is work-related. Petrochemical injuries at Sasol = COIDA claim.",
          }];
        }
        return [];
      },
    },
  ],
};

export const selfmed: SchemeProfile = {
  name: "Selfmed Medical Scheme",
  code: "SELF",
  cmsRegistrationNumber: "1158",
  administrator: "Selfmed (self-administered)",
  claimWindowDays: 120,
  requiresPreAuth: [
    ...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD,
    "0078", "0401", "0452",
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
    notes: "Selfmed is a small open scheme, self-administered. Routes through Healthbridge. " +
      "Selfmed Blue and Selfmed Red are the main options. Relatively simple claims processing. " +
      "Small membership base (~30K lives). Moderate tariff rates.",
  },
  chronicMedRules: {
    requiresCDLCode: true,
    requiresChronicApplication: true,
    maxDaysSupply: 30,
    formularyOnly: false,
    cdlConditionPrefixes: CDL_PREFIXES,
  },
  customRules: [
    makePreAuthRule([...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD, "0078", "0401", "0452"]),
    makeDateWindowRule(120),
    makeFutureDateRule(),
    makeChronicCDLRule(CDL_PREFIXES),
    makeConsultationLimitRule(2),
  ],
};

export const laHealth: SchemeProfile = {
  name: "LA Health Medical Scheme",
  code: "LAH",
  cmsRegistrationNumber: "1145",
  administrator: "Discovery Health (Pty) Ltd",
  claimWindowDays: 120,
  requiresPreAuth: [
    ...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD,
    "0078", "0401", "0452", "0191", "H25",
    "M54", "G43", // Managed care codes (Discovery admin)
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
    notes: "LA Health — restricted scheme for local authority (municipal) employees. " +
      "Administered by Discovery Health. Routes through Healthbridge. " +
      "LA Core, LA Active, LA Comprehensive, LA Focus. DSP enforcement strict on Core/Focus. " +
      "Uses Discovery HealthID portal.",
  },
  chronicMedRules: {
    requiresCDLCode: true,
    requiresChronicApplication: true,
    maxDaysSupply: 30,
    formularyOnly: true,
    cdlConditionPrefixes: CDL_PREFIXES,
  },
  customRules: [
    makePreAuthRule([...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD, "0078", "0401", "0452", "0191", "H25", "M54", "G43"]),
    makeDateWindowRule(120),
    makeFutureDateRule(),
    makeChronicCDLRule(CDL_PREFIXES),
    makeConsultationLimitRule(1),
    makeNetworkRule("LA Health", "LA Health/Discovery DSP", "Core and Focus option members"),
  ],
};

export const angloMedical: SchemeProfile = {
  name: "Anglo Medical Scheme",
  code: "ANGLO",
  cmsRegistrationNumber: "1019",
  administrator: "Discovery Health (Pty) Ltd",
  claimWindowDays: 120,
  requiresPreAuth: [
    ...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD,
    "0078", "0401", "0452", "0191",
  ],
  specificityRequirements: "strict",
  genderCheckEnabled: true,
  ageCheckEnabled: true,
  eccRequired: true,
  maxConsultationsPerDay: 1,
  maxFollowUpDays: 3,
  pmbRules: {
    autoApprovePMB: true,
    requiresCDLAuth: true,
    pmbClaimWindowDays: 365,
    dspStrictEnforcement: false,
    autoPMBPrefixes: ["I21", "I60", "I61", "I62", "I63", "J45", "E10", "E11", "B20", "O", "C"],
    notes: "Anglo Medical — restricted scheme for Anglo American/De Beers mining employees. " +
      "Administered by Discovery Health. Routes through Healthbridge. " +
      "Single comprehensive plan with excellent benefits. Mining industry injuries may be COIDA. " +
      "Silicosis/pneumoconiosis claims require special handling (ODMWA — Occupational Diseases in Mines).",
  },
  chronicMedRules: {
    requiresCDLCode: true,
    requiresChronicApplication: true,
    maxDaysSupply: 30,
    formularyOnly: false,
    cdlConditionPrefixes: CDL_PREFIXES,
  },
  customRules: [
    makePreAuthRule([...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD, "0078", "0401", "0452", "0191"]),
    makeDateWindowRule(120),
    makeFutureDateRule(),
    makeChronicCDLRule(CDL_PREFIXES),
    makeConsultationLimitRule(1),
    {
      ruleId: "ANGLO_MINING_OCCUPATIONAL",
      name: "Anglo Medical Mining Injury Check",
      description: "Mining injuries/lung disease may be COIDA or ODMWA, not medical scheme",
      severity: "warning",
      check: (line) => {
        const code = line.primaryICD10?.toUpperCase() || "";
        // Mining-specific conditions: silicosis, pneumoconiosis, injuries
        if (/^J6[0-8]/.test(code) || /^[ST]\d/.test(code)) {
          return [{
            lineNumber: line.lineNumber, field: "primaryICD10",
            code: "ANGLO_COIDA_ODMWA", severity: "warning",
            rule: "Anglo Mining Occupational Health",
            message: `Code "${code}" may be an occupational disease (silicosis, pneumoconiosis) or mining injury — check COIDA/ODMWA coverage.`,
            suggestion: "Mining lung disease (J60-J68) and underground injuries: verify COIDA/ODMWA before medical scheme claim.",
          }];
        }
        return [];
      },
    },
  ],
};

export const makoti: SchemeProfile = {
  name: "Makoti Medical Scheme",
  code: "MAK",
  cmsRegistrationNumber: "1089",
  administrator: "MediKredit Integrated Healthcare Solutions",
  claimWindowDays: 120,
  requiresPreAuth: [
    ...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD,
    "0078", "0401", "0452",
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
    dspStrictEnforcement: true,
    autoPMBPrefixes: ["I21", "I60", "I61", "I62", "I63", "J45", "E10", "E11", "B20"],
    notes: "Makoti is a small restricted scheme. Routes through MediKredit. " +
      "Limited plan options. DSP enforcement on all options. Moderate claims turnaround.",
  },
  chronicMedRules: {
    requiresCDLCode: true,
    requiresChronicApplication: true,
    maxDaysSupply: 30,
    formularyOnly: true,
    cdlConditionPrefixes: CDL_PREFIXES,
  },
  customRules: [
    makePreAuthRule([...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD, "0078", "0401", "0452"]),
    makeDateWindowRule(120),
    makeFutureDateRule(),
    makeChronicCDLRule(CDL_PREFIXES),
    makeConsultationLimitRule(2),
    makeNetworkRule("Makoti", "Makoti DSP", "All members"),
  ],
};

export const spectramed: SchemeProfile = {
  name: "Spectramed Medical Scheme",
  code: "SPEC",
  cmsRegistrationNumber: "1130",
  administrator: "Spectramed (self-administered)",
  claimWindowDays: 120,
  requiresPreAuth: [
    ...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD,
    "0078", "0401", "0452",
  ],
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
    notes: "Spectramed is a small open scheme, self-administered. Routes through MediKredit. " +
      "Simple plan structure. Moderate claims processing. Small membership (~20K lives).",
  },
  chronicMedRules: {
    requiresCDLCode: true,
    requiresChronicApplication: true,
    maxDaysSupply: 30,
    formularyOnly: false,
    cdlConditionPrefixes: CDL_PREFIXES,
  },
  customRules: [
    makePreAuthRule([...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD, "0078", "0401", "0452"]),
    makeDateWindowRule(120),
    makeFutureDateRule(),
    makeChronicCDLRule(CDL_PREFIXES),
    makeConsultationLimitRule(2),
  ],
};

export const medihelp: SchemeProfile = {
  name: "Medihelp Medical Scheme",
  code: "MED",
  cmsRegistrationNumber: "1099",
  administrator: "Medihelp (self-administered since 1906)",
  claimWindowDays: 120, // Last workday of 4th month from DOS
  requiresPreAuth: [
    ...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD,
    "0078", "0401", "0452", "0191", "H25",
    "0069", // Dental prosthetics
  ],
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
    autoPMBPrefixes: ["I21", "I60", "I61", "I62", "I63", "J45", "E10", "E11", "B20", "O", "C"],
    notes: "Medihelp is SA's oldest medical scheme (est. 1906), self-administered in Pretoria. " +
      "Routes through Healthbridge. 10 plan options (Dimension, EliteHealth, MedSave, Prime, " +
      "MedVital, Necesse, MedElect, MedAccess, MedIn, MediLow). " +
      "Submission deadline is last workday of 4th month (not exactly 120 days). " +
      "Resubmission window is 60 days from rejection. Known for conservative claims approach.",
  },
  chronicMedRules: {
    requiresCDLCode: true,
    requiresChronicApplication: true,
    maxDaysSupply: 30,
    formularyOnly: true,
    cdlConditionPrefixes: CDL_PREFIXES,
  },
  customRules: [
    makePreAuthRule([...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD, "0078", "0401", "0452", "0191", "H25", "0069"]),
    makeDateWindowRule(120),
    makeFutureDateRule(),
    makeChronicCDLRule(CDL_PREFIXES),
    makeConsultationLimitRule(2),
    makeHighCostReviewRule("Medihelp", 5000),
    {
      ruleId: "MED_4TH_MONTH_DEADLINE",
      name: "Medihelp 4th Month Submission Deadline",
      description: "Medihelp deadline is last workday of 4th month, not exactly 120 days",
      severity: "info",
      check: (line) => {
        if (!line.dateOfService) return [];
        const serviceDate = parseDate(line.dateOfService);
        if (!serviceDate) return [];
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - serviceDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 90 && diffDays <= 120) {
          return [{
            lineNumber: line.lineNumber, field: "dateOfService",
            code: "MED_DEADLINE_WARNING", severity: "warning",
            rule: "Medihelp Deadline Approaching",
            message: `Service date is ${diffDays} days ago. Medihelp deadline is last workday of the 4th month — submit urgently.`,
            suggestion: "Medihelp uses calendar month, not 120 days exactly. Calculate the last workday of the 4th month from service date.",
          }];
        }
        return [];
      },
    },
    {
      ruleId: "MED_RESUBMISSION_60",
      name: "Medihelp 60-Day Resubmission Window",
      description: "Rejected claims must be resubmitted within 60 days",
      severity: "info",
      check: () => [],
    },
  ],
};

export const medshieldExpanded: SchemeProfile = {
  name: "Medshield Medical Scheme (Extended)",
  code: "MS_EXT",
  cmsRegistrationNumber: "1151",
  administrator: "Medshield Medical Scheme (self-administered)",
  claimWindowDays: 120,
  requiresPreAuth: [
    ...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD,
    "0078", "0401", "0069", "H25", "H26", "0452",
    "F10", "F11", "F12", "F13", "F19", // Rehab
    "0191", // Transplants
    "N17", "N18", // Renal dialysis
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
    dspStrictEnforcement: true,
    autoPMBPrefixes: ["I21", "I60", "I61", "I62", "I63", "J45", "E10", "E11", "B20", "O", "C"],
    notes: "Medshield expanded profile — 6 plan options: MediPhila (entry), MediSaver, MediCore, " +
      "MediPlus, MediPrime, MediElite. MediPhila uses GP network restriction (capitation model). " +
      "Medshield self-administered in Roodepoort. Routes through MediKredit. " +
      "Known for fast turnaround (14 days). Annual dental limits strictly enforced.",
  },
  chronicMedRules: {
    requiresCDLCode: true,
    requiresChronicApplication: true,
    maxDaysSupply: 30,
    formularyOnly: false,
    cdlConditionPrefixes: CDL_PREFIXES,
  },
  customRules: [
    makePreAuthRule([...COMMON_PREAUTH_TARIFF, ...COMMON_PREAUTH_ICD, "0078", "0401", "0069", "H25", "H26", "0452", "F10", "F11", "F12", "F13", "F19", "0191", "N17", "N18"]),
    makeDateWindowRule(120),
    makeFutureDateRule(),
    makeChronicCDLRule(CDL_PREFIXES),
    makeConsultationLimitRule(2),
    makeNetworkRule("Medshield", "Medshield GP Network", "MediPhila members"),
    {
      ruleId: "MS_MEDIPHILA_CAPITATION",
      name: "Medshield MediPhila Capitation",
      description: "MediPhila is a capitation model — GP must be on MediPhila network",
      severity: "warning",
      check: (line) => {
        const gpTariffs = ["0190", "0191", "0192", "0193"];
        if (line.tariffCode && gpTariffs.some(t => line.tariffCode!.startsWith(t))) {
          return [{
            lineNumber: line.lineNumber, field: "tariffCode",
            code: "MS_MEDIPHILA_GP_CHECK", severity: "info",
            rule: "Medshield MediPhila GP Network",
            message: "GP consultation on Medshield — if MediPhila option, the GP must be on the capitation network.",
            suggestion: "Verify member option. MediPhila = capitation GP network only.",
          }];
        }
        return [];
      },
    },
    {
      ruleId: "MS_DENTAL_ANNUAL_LIMIT",
      name: "Medshield Annual Dental Limits",
      description: "Strict annual dental benefit limits per plan option",
      severity: "warning",
      check: (line) => {
        if (/^K0[0-9]/i.test(line.primaryICD10) || line.tariffCode?.startsWith("8")) {
          return [{
            lineNumber: line.lineNumber, field: "primaryICD10",
            code: "MS_DENTAL_ANNUAL_LIMIT", severity: "warning",
            rule: "Medshield Dental Limit",
            message: "Dental claim detected. Medshield enforces strict annual dental limits (varies by plan: R2,500–R12,000/year).",
            suggestion: "Verify remaining dental benefits on member portal before treatment.",
          }];
        }
        return [];
      },
    },
    {
      ruleId: "MS_RENAL_PREAUTH",
      name: "Medshield Renal Pre-Auth",
      description: "All dialysis requires pre-auth with quarterly review",
      severity: "warning",
      check: (line) => {
        if (/^N1[78]/i.test(line.primaryICD10)) {
          return [{
            lineNumber: line.lineNumber, field: "primaryICD10",
            code: "MS_RENAL_AUTH", severity: "warning",
            rule: "Medshield Renal Dialysis Auth",
            message: `Renal code "${line.primaryICD10}" — Medshield requires pre-auth for all dialysis with quarterly clinical review.`,
            suggestion: "Submit pre-auth with nephrologist motivation. Quarterly review reports required for ongoing auth.",
          }];
        }
        return [];
      },
    },
  ],
};

// ─── EXTENDED SCHEME PROFILES ARRAY ───────────────────────────────────────────

export const EXTENDED_SCHEME_PROFILES: SchemeProfile[] = [
  fedhealth,
  polmed,
  bankmed,
  profmed,
  compcare,
  pps,
  sizweHosmed,
  keyHealth,
  resolutionHealth,
  genesis,
  liberty,
  sasolmed,
  selfmed,
  laHealth,
  angloMedical,
  makoti,
  spectramed,
  medihelp,
  medshieldExpanded,
];

/** Extended scheme list for UI dropdowns */
export const EXTENDED_SCHEME_LIST = EXTENDED_SCHEME_PROFILES.map(s => ({
  code: s.code,
  name: s.name,
}));
