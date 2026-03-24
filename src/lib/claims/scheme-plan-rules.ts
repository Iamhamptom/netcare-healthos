// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Plan-Level Rules — Discovery, GEMS, Bonitas
// Scheme-level rules are too coarse — most rejections stem from plan-specific
// network, co-payment, and benefit limit rules. This file provides granular
// plan-level validation for the 3 largest schemes (covering ~75% of SA market).
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { ValidationIssue, ValidationSeverity, ClaimLineItem } from "./types";

// ─── TYPES ──────────────────────────────────────────────────────────────────

export interface PlanRule {
  ruleId: string;
  scheme: string;       // "DH", "GEMS", "BON"
  plan: string;         // "*" = all plans, or specific plan code
  category: "network" | "copayment" | "benefit_limit" | "preauth" | "referral" | "formulary" | "savings" | "chronic" | "maternity" | "dental" | "optical" | "mental_health" | "rehab";
  description: string;
  severity: ValidationSeverity;
  /** Financial impact estimate in Rands per rejection */
  avgRandImpact: number;
  /** Rejection probability (0-1) */
  rejectionRate: number;
  /** ICD-10 prefixes that trigger this rule (empty = tariff-based or universal) */
  icd10Triggers: string[];
  /** Tariff prefixes that trigger this rule */
  tariffTriggers: string[];
  /** Human-readable action */
  action: string;
  /** Contact for overrides/appeals */
  contact?: string;
}

// ─── DISCOVERY HEALTH PLAN RULES ──────────────────────────────────────────────
// ~3.8M lives, ~20 plan options across 6 tiers

export const DISCOVERY_PLAN_RULES: PlanRule[] = [
  // ── KeyCare Plans (restricted network) ──
  { ruleId: "DH_KC_NETWORK_GP", scheme: "DH", plan: "KeyCare Start", category: "network", description: "Must use KeyCare GP network — non-network GP visits NOT covered", severity: "error", avgRandImpact: 520, rejectionRate: 0.22, icd10Triggers: [], tariffTriggers: ["0190", "0191", "0192", "0193"], action: "Verify GP is on KeyCare network before billing", contact: "0860 99 88 77" },
  { ruleId: "DH_KC_NETWORK_SPEC", scheme: "DH", plan: "KeyCare Start", category: "referral", description: "Specialist access ONLY via KeyCare GP referral — no self-referral", severity: "error", avgRandImpact: 1800, rejectionRate: 0.18, icd10Triggers: [], tariffTriggers: ["0141", "0142", "0200", "0201"], action: "Obtain KeyCare GP referral letter before specialist visit", contact: "0860 99 88 77" },
  { ruleId: "DH_KC_HOSPITAL", scheme: "DH", plan: "KeyCare Start", category: "network", description: "Hospital admission only at KeyCare contracted hospitals", severity: "error", avgRandImpact: 25000, rejectionRate: 0.12, icd10Triggers: [], tariffTriggers: ["0008", "0009", "0046", "0520"], action: "Confirm hospital is KeyCare-contracted before elective admission" },
  { ruleId: "DH_KC_CORE_GP", scheme: "DH", plan: "KeyCare Core", category: "network", description: "KeyCare Core — GP network restricted, broader hospital network", severity: "warning", avgRandImpact: 520, rejectionRate: 0.15, icd10Triggers: [], tariffTriggers: ["0190", "0191", "0192", "0193"], action: "Verify GP is on KeyCare Core network" },
  { ruleId: "DH_KC_PLUS_GP", scheme: "DH", plan: "KeyCare Plus", category: "network", description: "KeyCare Plus — GP and specialist network restricted", severity: "warning", avgRandImpact: 800, rejectionRate: 0.14, icd10Triggers: [], tariffTriggers: ["0190", "0191", "0192", "0193", "0141", "0142"], action: "Verify provider is on KeyCare Plus network" },

  // ── Coastal Plans ──
  { ruleId: "DH_COASTAL_NETWORK", scheme: "DH", plan: "Coastal Core", category: "network", description: "Coastal Core — restricted to Coastal Saver network (KZN/EC/WC coastal regions)", severity: "error", avgRandImpact: 2000, rejectionRate: 0.16, icd10Triggers: [], tariffTriggers: [], action: "Confirm provider is in Coastal network. Only available in coastal provinces." },
  { ruleId: "DH_COASTAL_REFERRAL", scheme: "DH", plan: "Coastal Saver", category: "referral", description: "Coastal Saver — GP referral mandatory for specialists", severity: "warning", avgRandImpact: 1200, rejectionRate: 0.11, icd10Triggers: [], tariffTriggers: ["0141", "0142"], action: "Obtain Coastal GP referral before specialist billing" },

  // ── Delta Plans ──
  { ruleId: "DH_DELTA_NETWORK", scheme: "DH", plan: "Delta Core", category: "network", description: "Delta Core — restricted Delta network", severity: "warning", avgRandImpact: 1500, rejectionRate: 0.13, icd10Triggers: [], tariffTriggers: [], action: "Verify provider is on Delta network" },
  { ruleId: "DH_DELTA_REFERRAL", scheme: "DH", plan: "Delta Priority", category: "referral", description: "Delta Priority — GP referral for certain specialists", severity: "warning", avgRandImpact: 1000, rejectionRate: 0.09, icd10Triggers: [], tariffTriggers: ["0141", "0142"], action: "Check if specialist referral is needed on Delta Priority" },

  // ── Essential Plans ──
  { ruleId: "DH_ESS_COPAY", scheme: "DH", plan: "Essential Saver", category: "copayment", description: "Essential Saver — significant co-payment for non-network and above-threshold claims", severity: "warning", avgRandImpact: 800, rejectionRate: 0.08, icd10Triggers: [], tariffTriggers: [], action: "Warn patient about potential co-payment. Essential Saver has above-threshold co-pays." },
  { ruleId: "DH_ESS_CORE_SAVINGS", scheme: "DH", plan: "Essential Core", category: "savings", description: "Essential Core — limited savings, Above Threshold Benefit (ATB) applies", severity: "info", avgRandImpact: 600, rejectionRate: 0.06, icd10Triggers: [], tariffTriggers: [], action: "Check if ATB has been reached. Claims below ATB from savings." },
  { ruleId: "DH_ESS_SMART_NETWORK", scheme: "DH", plan: "Essential Smart", category: "network", description: "Essential Smart — Smart Plan network (most restricted Essential tier)", severity: "error", avgRandImpact: 1500, rejectionRate: 0.19, icd10Triggers: [], tariffTriggers: ["0190", "0191", "0192", "0193"], action: "Must use Smart Plan GP network. Non-network = full patient liability." },

  // ── Classic Plans ──
  { ruleId: "DH_CLASSIC_PRIORITY_COPAY", scheme: "DH", plan: "Classic Priority", category: "copayment", description: "Classic Priority — 20% co-payment for non-network hospital if not PMB", severity: "warning", avgRandImpact: 5000, rejectionRate: 0.07, icd10Triggers: [], tariffTriggers: ["0008", "0009", "0046"], action: "Verify hospital network status. Non-network = 20% co-payment." },
  { ruleId: "DH_CLASSIC_SAVER_ATB", scheme: "DH", plan: "Classic Saver", category: "savings", description: "Classic Saver — once savings depleted, ATB limit applies before risk benefit kicks in", severity: "info", avgRandImpact: 400, rejectionRate: 0.05, icd10Triggers: [], tariffTriggers: [], action: "Check savings balance and ATB status on Discovery portal." },
  { ruleId: "DH_CLASSIC_SMART_NETWORK", scheme: "DH", plan: "Classic Smart", category: "network", description: "Classic Smart — restricted Classic network with Smart Plan overlay", severity: "warning", avgRandImpact: 1200, rejectionRate: 0.14, icd10Triggers: [], tariffTriggers: [], action: "Verify provider is on Classic Smart network." },
  { ruleId: "DH_CLASSIC_COMP_FREE", scheme: "DH", plan: "Classic Comprehensive", category: "copayment", description: "Classic Comprehensive — no co-payment for in-network. Full cover.", severity: "info", avgRandImpact: 0, rejectionRate: 0.03, icd10Triggers: [], tariffTriggers: [], action: "Comprehensive plan — minimal restrictions. Verify membership active." },

  // ── Executive Plan ──
  { ruleId: "DH_EXEC_FULL_COVER", scheme: "DH", plan: "Executive", category: "copayment", description: "Executive — full cover, no network restrictions, highest tariff rate", severity: "info", avgRandImpact: 0, rejectionRate: 0.02, icd10Triggers: [], tariffTriggers: [], action: "Executive plan has minimal claim restrictions. Standard pre-auth rules still apply." },

  // ── Cross-plan Discovery rules ──
  { ruleId: "DH_ALL_VITALITY_SCREENING", scheme: "DH", plan: "*", category: "benefit_limit", description: "Vitality Health Check — annual wellness screening at scheme rate (tariff 0190 + V modifier)", severity: "info", avgRandImpact: 0, rejectionRate: 0.01, icd10Triggers: ["Z00"], tariffTriggers: ["0190"], action: "Apply Vitality modifier for wellness screening. Limited to 1 per year." },
  { ruleId: "DH_ALL_GP_15TH_LIMIT", scheme: "DH", plan: "*", category: "benefit_limit", description: "After 15th GP visit per year, benefits may be limited or require motivation", severity: "warning", avgRandImpact: 520, rejectionRate: 0.08, icd10Triggers: [], tariffTriggers: ["0190", "0191", "0192", "0193"], action: "If >15 GP visits in benefit year, Discovery may request clinical motivation." },
  { ruleId: "DH_ALL_CLAWBACK", scheme: "DH", plan: "*", category: "benefit_limit", description: "Discovery known for retrospective clawbacks — may recoup payments months/years later", severity: "info", avgRandImpact: 3500, rejectionRate: 0.04, icd10Triggers: [], tariffTriggers: [], action: "Maintain detailed clinical notes. Discovery may audit and claw back payments." },
  { ruleId: "DH_ALL_CHRONIC_CIB", scheme: "DH", plan: "*", category: "chronic", description: "CDL chronic meds via CIB formulary only — non-formulary requires clinical motivation", severity: "warning", avgRandImpact: 450, rejectionRate: 0.12, icd10Triggers: ["E10", "E11", "I10", "J45", "J44", "G40", "E03"], tariffTriggers: [], action: "Check CIB formulary before prescribing chronic meds. Non-formulary = Chronic Drug Amount co-pay.", contact: "0860 99 88 77" },
  { ruleId: "DH_ALL_ONCOLOGY_PROGRAMME", scheme: "DH", plan: "*", category: "preauth", description: "All cancer treatment must register on Discovery's Oncology Programme", severity: "error", avgRandImpact: 45000, rejectionRate: 0.15, icd10Triggers: ["C", "D0", "D1", "D2", "D3", "D4"], tariffTriggers: ["0046"], action: "Register patient on Discovery Oncology Programme before treatment begins.", contact: "0860 99 88 77 (Oncology)" },
  { ruleId: "DH_ALL_MRI_CT_PREAUTH", scheme: "DH", plan: "*", category: "preauth", description: "MRI/CT scans require pre-auth via HealthID within 2 hours for emergencies", severity: "warning", avgRandImpact: 5500, rejectionRate: 0.14, icd10Triggers: [], tariffTriggers: ["0008", "0009", "0078"], action: "Obtain pre-auth via HealthID. Emergency: 2-hour window. Elective: submit before scan." },
  { ruleId: "DH_ALL_MATERNITY_REGISTER", scheme: "DH", plan: "*", category: "maternity", description: "Register pregnancy on Discovery Maternity Programme for full benefits", severity: "warning", avgRandImpact: 8000, rejectionRate: 0.06, icd10Triggers: ["O", "Z32", "Z33", "Z34", "Z35", "Z36"], tariffTriggers: [], action: "Register pregnancy on Discovery portal. Unregistered = reduced maternity benefits." },
  { ruleId: "DH_ALL_DENTAL_LIMIT", scheme: "DH", plan: "*", category: "dental", description: "Annual dental limit varies by plan — R3,500 (KeyCare) to R18,000+ (Executive)", severity: "info", avgRandImpact: 2500, rejectionRate: 0.07, icd10Triggers: ["K0"], tariffTriggers: ["8"], action: "Check remaining dental benefits on plan before treatment." },
  { ruleId: "DH_ALL_OPTICAL_LIMIT", scheme: "DH", plan: "*", category: "optical", description: "Optical benefit limit (2-year cycle) — frames + lenses from savings or designated amount", severity: "info", avgRandImpact: 1500, rejectionRate: 0.05, icd10Triggers: ["H52", "H53"], tariffTriggers: [], action: "Optical benefits on 2-year cycle. Check last claim date." },
  { ruleId: "DH_ALL_MENTAL_HEALTH_21", scheme: "DH", plan: "*", category: "mental_health", description: "21-day inpatient psychiatric limit per event; outpatient sessions limited per year", severity: "warning", avgRandImpact: 12000, rejectionRate: 0.09, icd10Triggers: ["F20", "F31", "F32", "F33", "F40", "F41", "F42", "F43"], tariffTriggers: [], action: "Pre-auth required for psychiatric admission. 21-day limit per event. Outpatient: plan-specific session limits.", contact: "0860 99 88 77 (Mental Health)" },
  { ruleId: "DH_ALL_REHAB_PREAUTH", scheme: "DH", plan: "*", category: "rehab", description: "Substance abuse rehab — 21-day inpatient limit, requires managed care pre-auth", severity: "error", avgRandImpact: 35000, rejectionRate: 0.20, icd10Triggers: ["F10", "F11", "F12", "F13", "F14", "F15", "F19"], tariffTriggers: [], action: "Pre-auth mandatory. 21-day inpatient limit. Must use Discovery-approved facility.", contact: "0860 99 88 77 (Rehab)" },
];

// ─── GEMS PLAN RULES ──────────────────────────────────────────────────────────
// ~2M lives, 5 options: Emerald (comprehensive), Ruby (mid), Beryl (entry), Sapphire (limited), Onyx (premium)

export const GEMS_PLAN_RULES: PlanRule[] = [
  // ── Sapphire (most restricted) ──
  { ruleId: "GEMS_SAPPH_STATE_DSP", scheme: "GEMS", plan: "Sapphire", category: "network", description: "Sapphire — state facilities are the primary DSP for in-hospital care", severity: "error", avgRandImpact: 15000, rejectionRate: 0.25, icd10Triggers: [], tariffTriggers: ["0008", "0009", "0046", "0520", "0452"], action: "Sapphire members MUST use state facilities for in-hospital. Private = full patient liability.", contact: "0860 00 4367" },
  { ruleId: "GEMS_SAPPH_PMB_ONLY", scheme: "GEMS", plan: "Sapphire", category: "benefit_limit", description: "Sapphire — PMB-only option. Non-PMB out-of-hospital benefits severely limited", severity: "warning", avgRandImpact: 800, rejectionRate: 0.30, icd10Triggers: [], tariffTriggers: [], action: "Verify if condition is PMB. Sapphire has minimal non-PMB benefits." },
  { ruleId: "GEMS_SAPPH_GP_LIMIT", scheme: "GEMS", plan: "Sapphire", category: "benefit_limit", description: "Sapphire — limited GP consultation benefit (R2,800/year for all out-of-hospital)", severity: "warning", avgRandImpact: 450, rejectionRate: 0.18, icd10Triggers: [], tariffTriggers: ["0190", "0191", "0192", "0193"], action: "Sapphire out-of-hospital benefit is capped at ~R2,800/yr. Check remaining balance." },

  // ── Beryl ──
  { ruleId: "GEMS_BERYL_STATE_DSP", scheme: "GEMS", plan: "Beryl", category: "network", description: "Beryl — state facilities preferred DSP for elective in-hospital", severity: "warning", avgRandImpact: 8000, rejectionRate: 0.18, icd10Triggers: [], tariffTriggers: ["0008", "0009", "0046", "0520"], action: "Beryl should use state facilities for elective. Private may incur co-payment." },
  { ruleId: "GEMS_BERYL_GP_NETWORK", scheme: "GEMS", plan: "Beryl", category: "network", description: "Beryl — GP visits from pooled benefit, no savings account", severity: "info", avgRandImpact: 430, rejectionRate: 0.10, icd10Triggers: [], tariffTriggers: ["0190", "0191", "0192", "0193"], action: "Beryl uses pooled benefit for GP visits. No personal savings." },
  { ruleId: "GEMS_BERYL_CHRONIC_LIMIT", scheme: "GEMS", plan: "Beryl", category: "chronic", description: "Beryl — chronic meds limited to GEMS formulary, 28-day supply, no exceptions", severity: "warning", avgRandImpact: 340, rejectionRate: 0.15, icd10Triggers: ["E10", "E11", "I10", "J45", "J44", "G40", "E03"], tariffTriggers: [], action: "Beryl chronic: GEMS formulary only, 28-day supply. No off-formulary options." },

  // ── Ruby ──
  { ruleId: "GEMS_RUBY_SAVINGS", scheme: "GEMS", plan: "Ruby", category: "savings", description: "Ruby — personal savings account + risk benefit. Most popular GEMS option.", severity: "info", avgRandImpact: 300, rejectionRate: 0.06, icd10Triggers: [], tariffTriggers: [], action: "Ruby has savings + risk benefit. Check savings balance before out-of-hospital billing." },
  { ruleId: "GEMS_RUBY_HOSPITAL_CHOICE", scheme: "GEMS", plan: "Ruby", category: "network", description: "Ruby — broader hospital network than Sapphire/Beryl, but pre-auth still required", severity: "info", avgRandImpact: 5000, rejectionRate: 0.08, icd10Triggers: [], tariffTriggers: ["0008", "0009", "0046"], action: "Ruby has broader private hospital access. Pre-auth still mandatory for all admissions." },

  // ── Emerald ──
  { ruleId: "GEMS_EMERALD_COMPREHENSIVE", scheme: "GEMS", plan: "Emerald", category: "copayment", description: "Emerald — comprehensive option, private hospital access, savings + risk + insured", severity: "info", avgRandImpact: 200, rejectionRate: 0.04, icd10Triggers: [], tariffTriggers: [], action: "Emerald is the most comprehensive GEMS option. Minimal restrictions." },
  { ruleId: "GEMS_EMERALD_SPECIALIST_FREE", scheme: "GEMS", plan: "Emerald", category: "referral", description: "Emerald — no GP referral needed for specialists (only Emerald)", severity: "info", avgRandImpact: 0, rejectionRate: 0.02, icd10Triggers: [], tariffTriggers: ["0141", "0142"], action: "Emerald members can self-refer to specialists. No GP referral needed." },

  // ── Onyx ──
  { ruleId: "GEMS_ONYX_PREMIUM", scheme: "GEMS", plan: "Onyx", category: "copayment", description: "Onyx — premium option with highest benefits, day-to-day + hospital + chronic", severity: "info", avgRandImpact: 100, rejectionRate: 0.03, icd10Triggers: [], tariffTriggers: [], action: "Onyx is the premium GEMS option. Highest benefits and fewest restrictions." },

  // ── Cross-plan GEMS rules ──
  { ruleId: "GEMS_ALL_MEMBERSHIP_FORMAT", scheme: "GEMS", plan: "*", category: "network", description: "GEMS membership numbers are 9 digits with leading zeros — must preserve format", severity: "error", avgRandImpact: 950, rejectionRate: 0.08, icd10Triggers: [], tariffTriggers: [], action: "GEMS membership: 9 digits, preserve leading zeros. Example: 001234567" },
  { ruleId: "GEMS_ALL_28DAY_CHRONIC", scheme: "GEMS", plan: "*", category: "chronic", description: "ALL GEMS options use 28-day chronic supply limit (not 30)", severity: "error", avgRandImpact: 340, rejectionRate: 0.12, icd10Triggers: ["E10", "E11", "I10", "J45", "J44", "G40", "E03", "N18", "B20"], tariffTriggers: [], action: "Dispense EXACTLY 28 days for GEMS chronic meds. 30-day supply = rejection." },
  { ruleId: "GEMS_ALL_MATERNITY_14WK", scheme: "GEMS", plan: "*", category: "maternity", description: "ALL GEMS options: maternity must be registered by 14 weeks gestation", severity: "error", avgRandImpact: 15000, rejectionRate: 0.10, icd10Triggers: ["O", "Z32", "Z33", "Z34", "Z35", "Z36"], tariffTriggers: [], action: "Register pregnancy with GEMS by 14 weeks. Late registration = reduced benefits.", contact: "0860 00 4367" },
  { ruleId: "GEMS_ALL_MISSED_APPOINTMENT", scheme: "GEMS", plan: "*", category: "benefit_limit", description: "GEMS does NOT cover missed appointments — member is liable", severity: "info", avgRandImpact: 0, rejectionRate: 1.0, icd10Triggers: [], tariffTriggers: [], action: "GEMS never pays for missed appointments. Bill the member directly." },
  { ruleId: "GEMS_ALL_60DAY_DISPUTE", scheme: "GEMS", plan: "*", category: "benefit_limit", description: "GEMS has a 60-day dispute turnaround (longest in SA)", severity: "info", avgRandImpact: 0, rejectionRate: 0, icd10Triggers: [], tariffTriggers: [], action: "GEMS disputes: expect 60-day turnaround. Submit disputes in writing." },
  { ruleId: "GEMS_ALL_DENTAL_STATE_DSP", scheme: "GEMS", plan: "*", category: "dental", description: "Dental prosthetics require pre-auth on all GEMS options", severity: "warning", avgRandImpact: 3500, rejectionRate: 0.14, icd10Triggers: ["K00", "K01", "K02", "K03", "K04", "K05", "K06", "K07", "K08"], tariffTriggers: ["0069", "8"], action: "All dental prosthetics on GEMS require pre-auth with X-rays and treatment plan.", contact: "0860 00 4367" },
  { ruleId: "GEMS_ALL_GP_REFERRAL_SPEC", scheme: "GEMS", plan: "*", category: "referral", description: "GP referral required for specialist on Sapphire/Beryl/Ruby (not Emerald/Onyx)", severity: "warning", avgRandImpact: 1500, rejectionRate: 0.11, icd10Triggers: [], tariffTriggers: ["0141", "0142"], action: "Sapphire/Beryl/Ruby: GP referral needed for specialist. Emerald/Onyx: self-refer OK." },
  { ruleId: "GEMS_ALL_STERILISATION", scheme: "GEMS", plan: "*", category: "preauth", description: "Sterilisation requires pre-auth + counselling documentation + cooling-off period", severity: "warning", avgRandImpact: 4000, rejectionRate: 0.16, icd10Triggers: ["Z30"], tariffTriggers: [], action: "Submit counselling documentation and observe cooling-off period before sterilisation." },
  { ruleId: "GEMS_ALL_REHAB", scheme: "GEMS", plan: "*", category: "rehab", description: "Substance abuse rehab: 21-day inpatient limit, must use GEMS-approved facility", severity: "warning", avgRandImpact: 28000, rejectionRate: 0.18, icd10Triggers: ["F10", "F11", "F12", "F13", "F14", "F15", "F19"], tariffTriggers: [], action: "Pre-auth mandatory. 21-day limit. GEMS-approved facility only.", contact: "0860 00 4367" },
  { ruleId: "GEMS_ALL_OPTICAL", scheme: "GEMS", plan: "*", category: "optical", description: "Optical benefit — varies by option: Sapphire=R0, Beryl=R1,200, Ruby=R2,500, Emerald=R4,000", severity: "info", avgRandImpact: 1200, rejectionRate: 0.06, icd10Triggers: ["H52", "H53"], tariffTriggers: [], action: "Verify option-specific optical benefit limit before dispensing." },
];

// ─── BONITAS PLAN RULES ───────────────────────────────────────────────────────
// ~731K lives, 14 plans + BonCore (2026 new)

export const BONITAS_PLAN_RULES: PlanRule[] = [
  // ── BonCap (capitation, most restricted) ──
  { ruleId: "BON_BONCAP_CAPITATION", scheme: "BON", plan: "BonCap", category: "network", description: "BonCap — capitation model. GP visits at designated capitation clinic ONLY", severity: "error", avgRandImpact: 520, rejectionRate: 0.28, icd10Triggers: [], tariffTriggers: ["0190", "0191", "0192", "0193"], action: "BonCap: GP must be the member's designated capitation clinic. Non-network = rejected.", contact: "086 111 2666" },
  { ruleId: "BON_BONCAP_HOSPITAL", scheme: "BON", plan: "BonCap", category: "network", description: "BonCap — hospital admission at Bonitas-contracted hospitals only (limited network)", severity: "error", avgRandImpact: 20000, rejectionRate: 0.15, icd10Triggers: [], tariffTriggers: ["0008", "0009", "0046", "0520"], action: "BonCap: limited hospital network. Verify hospital before admission." },

  // ── BonStart (hospital-only) ──
  { ruleId: "BON_BONSTART_HOSP_ONLY", scheme: "BON", plan: "BonStart", category: "benefit_limit", description: "BonStart — hospital plan only. No day-to-day benefits (PMBs excluded)", severity: "warning", avgRandImpact: 520, rejectionRate: 0.35, icd10Triggers: [], tariffTriggers: ["0190", "0191", "0192", "0193"], action: "BonStart has NO out-of-hospital benefits except PMBs. GP visits = member pays." },
  { ruleId: "BON_BONSTART_PHARMACY_DSP", scheme: "BON", plan: "BonStart", category: "formulary", description: "BonStart — chronic meds from Pharmacy Direct (mandatory DSP)", severity: "warning", avgRandImpact: 340, rejectionRate: 0.18, icd10Triggers: ["E10", "E11", "I10", "J45", "J44"], tariffTriggers: [], action: "BonStart chronic meds: Pharmacy Direct DSP only. Retail pharmacy = rejected." },

  // ── BonEssential ──
  { ruleId: "BON_BONESSENTIAL_NETWORK", scheme: "BON", plan: "BonEssential", category: "network", description: "BonEssential — restricted GP and hospital network", severity: "warning", avgRandImpact: 1200, rejectionRate: 0.16, icd10Triggers: [], tariffTriggers: ["0190", "0191", "0192", "0193"], action: "BonEssential: verify GP is on network. Limited day-to-day benefits." },
  { ruleId: "BON_BONESSENTIAL_PHARMACY_DSP", scheme: "BON", plan: "BonEssential", category: "formulary", description: "BonEssential — chronic meds from Pharmacy Direct (mandatory DSP)", severity: "warning", avgRandImpact: 340, rejectionRate: 0.16, icd10Triggers: ["E10", "E11", "I10", "J45"], tariffTriggers: [], action: "BonEssential chronic: Pharmacy Direct DSP required." },

  // ── BonSave ──
  { ruleId: "BON_BONSAVE_SAVINGS", scheme: "BON", plan: "BonSave", category: "savings", description: "BonSave — savings account + hospital benefit. Day-to-day from savings.", severity: "info", avgRandImpact: 400, rejectionRate: 0.05, icd10Triggers: [], tariffTriggers: [], action: "BonSave: day-to-day from savings account. Check balance." },
  { ruleId: "BON_BONSAVE_PHARMACY_DSP", scheme: "BON", plan: "BonSave", category: "formulary", description: "BonSave — chronic meds from Pharmacy Direct (mandatory DSP)", severity: "warning", avgRandImpact: 340, rejectionRate: 0.14, icd10Triggers: ["E10", "E11", "I10", "J45"], tariffTriggers: [], action: "BonSave chronic: Pharmacy Direct DSP required." },

  // ── BonPrime ──
  { ruleId: "BON_BONPRIME_GP_VISITS", scheme: "BON", plan: "BonPrime", category: "benefit_limit", description: "BonPrime — limited GP visits per year (typically 3-5 from benefit)", severity: "warning", avgRandImpact: 520, rejectionRate: 0.10, icd10Triggers: [], tariffTriggers: ["0190", "0191", "0192", "0193"], action: "BonPrime: limited GP visits. Additional visits from savings/self-pay." },

  // ── BonComplete ──
  { ruleId: "BON_BONCOMPLETE_BROAD", scheme: "BON", plan: "BonComplete", category: "copayment", description: "BonComplete — broader network, savings + risk. Moderate restrictions.", severity: "info", avgRandImpact: 300, rejectionRate: 0.04, icd10Triggers: [], tariffTriggers: [], action: "BonComplete: savings account + risk benefit. Check savings balance." },

  // ── BonClassic ──
  { ruleId: "BON_BONCLASSIC_COMPREHENSIVE", scheme: "BON", plan: "BonClassic", category: "copayment", description: "BonClassic — comprehensive option with good savings, risk benefit, hospital cover", severity: "info", avgRandImpact: 200, rejectionRate: 0.03, icd10Triggers: [], tariffTriggers: [], action: "BonClassic: comprehensive benefits. Minimal restrictions." },

  // ── BonComprehensive (top tier) ──
  { ruleId: "BON_BONCOMP_FULL", scheme: "BON", plan: "BonComprehensive", category: "copayment", description: "BonComprehensive — top tier. 61 CDL conditions (vs standard 27). Full specialist access.", severity: "info", avgRandImpact: 100, rejectionRate: 0.02, icd10Triggers: [], tariffTriggers: [], action: "BonComprehensive: 61 CDL conditions covered (not just 27). Top benefits." },

  // ── BonCore (NEW 2026) ──
  { ruleId: "BON_BONCORE_DIGITAL", scheme: "BON", plan: "BonCore", category: "network", description: "BonCore (2026) — digital-first, ages 22-35, R1,275/beneficiary. GP consultations via app.", severity: "warning", avgRandImpact: 520, rejectionRate: 0.20, icd10Triggers: [], tariffTriggers: ["0190", "0191", "0192", "0193"], action: "BonCore: digital-first plan. GP consultations primarily via telemedicine app." },

  // ── Standard / Standard Select ──
  { ruleId: "BON_STD_GP_REFERRAL", scheme: "BON", plan: "Standard", category: "referral", description: "Standard — GP referral required for specialist consultation", severity: "warning", avgRandImpact: 1200, rejectionRate: 0.11, icd10Triggers: [], tariffTriggers: ["0141", "0142"], action: "Standard: GP referral mandatory for specialists." },
  { ruleId: "BON_STDSEL_GP_REFERRAL", scheme: "BON", plan: "Standard Select", category: "referral", description: "Standard Select — GP referral required, restricted specialist network", severity: "warning", avgRandImpact: 1200, rejectionRate: 0.13, icd10Triggers: [], tariffTriggers: ["0141", "0142"], action: "Standard Select: GP referral + restricted specialist network." },

  // ── Cross-plan Bonitas rules ──
  { ruleId: "BON_ALL_FORMULARY_TIERS", scheme: "BON", plan: "*", category: "formulary", description: "4 formulary tiers (A-D): Tier A = lowest co-pay, Tier D = 30% co-payment", severity: "warning", avgRandImpact: 450, rejectionRate: 0.14, icd10Triggers: [], tariffTriggers: [], action: "Check formulary tier before prescribing. Off-formulary = 30% co-payment (Tier D).", contact: "086 111 2666" },
  { ruleId: "BON_ALL_MEDGAP_COVER", scheme: "BON", plan: "*", category: "copayment", description: "Bonitas MedGap (Guardrisk) — integrated gap cover pays shortfall automatically", severity: "info", avgRandImpact: 0, rejectionRate: 0, icd10Triggers: [], tariffTriggers: [], action: "If member has MedGap, shortfall is automatically covered by Guardrisk gap policy." },
  { ruleId: "BON_ALL_MOMENTUM_MIGRATION", scheme: "BON", plan: "*", category: "network", description: "MIGRATION: Bonitas moving from Medscheme to Momentum Health Solutions from 1 June 2026", severity: "info", avgRandImpact: 0, rejectionRate: 0, icd10Triggers: [], tariffTriggers: [], action: "From 1 June 2026: claims process via Momentum Health Solutions (not Medscheme). Verify new portal/process.", contact: "086 111 2666" },
  { ruleId: "BON_ALL_PHARMACY_DIRECT", scheme: "BON", plan: "*", category: "formulary", description: "Pharmacy Direct is mandatory DSP for chronic meds on Standard Select, BonSave, BonEssential, Hospital Standard, BonStart", severity: "warning", avgRandImpact: 340, rejectionRate: 0.16, icd10Triggers: ["E10", "E11", "I10", "J45", "J44", "G40", "E03", "N18"], tariffTriggers: [], action: "These plans MUST use Pharmacy Direct for chronic: Standard Select, BonSave, BonEssential, Hospital Standard, BonStart." },
  { ruleId: "BON_ALL_4MONTH_WINDOW", scheme: "BON", plan: "*", category: "benefit_limit", description: "Bonitas uses 4-month (120-day) submission window — shorter resubmission of 60 days", severity: "info", avgRandImpact: 1200, rejectionRate: 0.11, icd10Triggers: [], tariffTriggers: [], action: "Submit within 120 days. If rejected, resubmit within 60 days of rejection notice." },
  { ruleId: "BON_ALL_DENTAL_LIMIT", scheme: "BON", plan: "*", category: "dental", description: "Dental benefits vary by plan: BonCap=PMB only, Standard=R4,000, BonClassic=R8,000, BonComp=R15,000", severity: "info", avgRandImpact: 2000, rejectionRate: 0.08, icd10Triggers: ["K0"], tariffTriggers: ["8"], action: "Verify plan-specific dental limit before treatment." },
  { ruleId: "BON_ALL_MENTAL_HEALTH", scheme: "BON", plan: "*", category: "mental_health", description: "Psychiatric admission: 21-day inpatient limit. Outpatient: plan-specific session limits.", severity: "warning", avgRandImpact: 15000, rejectionRate: 0.12, icd10Triggers: ["F20", "F31", "F32", "F33", "F40", "F41", "F42", "F43"], tariffTriggers: [], action: "Pre-auth required for psychiatric admission. 21-day inpatient limit.", contact: "086 111 2666" },
  { ruleId: "BON_ALL_ONCOLOGY", scheme: "BON", plan: "*", category: "preauth", description: "All oncology treatment requires pre-auth and registration on Bonitas Oncology Programme", severity: "error", avgRandImpact: 40000, rejectionRate: 0.13, icd10Triggers: ["C", "D0", "D1", "D2", "D3", "D4", "Z51"], tariffTriggers: ["0046"], action: "Register on Bonitas Oncology Programme via Medscheme before treatment.", contact: "086 111 2666 (Oncology)" },
  { ruleId: "BON_ALL_OPTICAL", scheme: "BON", plan: "*", category: "optical", description: "Optical benefit varies: BonCap/BonStart=R0, BonEssential=R1,500, BonClassic=R3,000, BonComp=R5,500", severity: "info", avgRandImpact: 1000, rejectionRate: 0.04, icd10Triggers: ["H52", "H53"], tariffTriggers: [], action: "Check plan-specific optical benefit limit." },
];

// ─── EXPORTS ──────────────────────────────────────────────────────────────────

export const ALL_PLAN_RULES: PlanRule[] = [
  ...DISCOVERY_PLAN_RULES,
  ...GEMS_PLAN_RULES,
  ...BONITAS_PLAN_RULES,
];

/** Look up plan rules for a scheme (optionally filtered by plan) */
export function getPlanRules(schemeCode: string, plan?: string): PlanRule[] {
  const upper = schemeCode.toUpperCase().trim();
  let rules = ALL_PLAN_RULES.filter(r => r.scheme.toUpperCase() === upper);
  if (plan) {
    const planUpper = plan.toUpperCase().trim();
    rules = rules.filter(r => r.plan === "*" || r.plan.toUpperCase() === planUpper);
  }
  return rules;
}

/** Validate a claim line against plan-level rules */
export function validatePlanRules(
  line: ClaimLineItem,
  schemeCode: string,
  plan?: string,
): ValidationIssue[] {
  const rules = getPlanRules(schemeCode, plan);
  const issues: ValidationIssue[] = [];
  const code = line.primaryICD10?.toUpperCase() || "";
  const tariff = line.tariffCode?.toUpperCase() || "";

  for (const rule of rules) {
    // Check if this rule is triggered by the claim line
    const icdMatch = rule.icd10Triggers.length === 0 ||
      rule.icd10Triggers.some(prefix => code.startsWith(prefix.toUpperCase()));
    const tariffMatch = rule.tariffTriggers.length === 0 ||
      rule.tariffTriggers.some(prefix => tariff.startsWith(prefix.toUpperCase()));

    // Rule fires if EITHER trigger matches (or no triggers = universal rule with amount/other checks)
    if (icdMatch || tariffMatch) {
      // For universal rules with no triggers, only fire if there's a meaningful check
      if (rule.icd10Triggers.length === 0 && rule.tariffTriggers.length === 0) {
        // Universal rules — only fire as info, don't spam
        if (rule.category === "network" || rule.category === "copayment" || rule.category === "savings") {
          continue; // Skip universal info rules to avoid noise
        }
      }

      issues.push({
        lineNumber: line.lineNumber,
        field: rule.tariffTriggers.length > 0 ? "tariffCode" : "primaryICD10",
        code: rule.ruleId,
        severity: rule.severity,
        rule: rule.description,
        message: `[${rule.scheme}/${rule.plan}] ${rule.description}`,
        suggestion: rule.action,
      });
    }
  }

  return issues;
}

/** Get total plan rule count */
export function getPlanRuleCount(): number {
  return ALL_PLAN_RULES.length;
}
