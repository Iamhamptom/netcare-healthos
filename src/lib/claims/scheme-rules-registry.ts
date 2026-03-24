// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Scheme Rules Registry — Unified Entry Point
// Wires together all scheme rule modules into a single API surface.
//
// Modules:
//   - scheme-rules.ts              → 7 core profiles (Discovery, GEMS, Bonitas, Momentum, Medshield, Bestmed, Default)
//   - scheme-profiles-extended.ts  → 19 additional scheme profiles
//   - scheme-plan-rules.ts         → Plan-level rules for Discovery, GEMS, Bonitas
//   - scheme-tariff-rules.ts       → 75+ high-rejection tariff code rules
//   - scheme-cdl-rules.ts          → 27 CDL condition protocols with per-scheme variants
//   - scheme-pmb-rules.ts          → 71+ DTP rules + 8 emergency rules
//   - scheme-adjudication-rules.ts → 70+ adjudication flowchart rules
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import {
  SCHEME_PROFILES,
  SCHEME_LIST,
  getSchemeProfile,
  validateSchemeRules,
  type SchemeProfile,
} from "./scheme-rules";

import {
  EXTENDED_SCHEME_PROFILES,
  EXTENDED_SCHEME_LIST,
} from "./scheme-profiles-extended";

import {
  ALL_PLAN_RULES,
  DISCOVERY_PLAN_RULES,
  GEMS_PLAN_RULES,
  BONITAS_PLAN_RULES,
  getPlanRules,
  validatePlanRules,
  getPlanRuleCount,
  type PlanRule,
} from "./scheme-plan-rules";

import {
  TARIFF_RULES,
  getTariffRule,
  getPreAuthTariffs,
  getHighRejectionTariffs,
  getTariffRulesByCategory,
  getTariffRuleCount,
  type TariffRule,
} from "./scheme-tariff-rules";

import {
  CDL_CONDITION_RULES,
  getCDLRulesForCode,
  getCDLSchemeRule,
  getCDLMonitoring,
  getCDLRuleCount,
  getAllCDLConditions,
  type CDLConditionRule,
  type CDLSchemeRule,
  type MonitoringRule,
} from "./scheme-cdl-rules";

import {
  DTP_RULES,
  EMERGENCY_RULES,
  getDTPForCode,
  getDTPsByCategory,
  getEmergencyDTPs,
  isPMBProtected,
  getDTPRuleCount,
  type DTPRule,
  type EmergencyRule,
} from "./scheme-pmb-rules";

import {
  ADJUDICATION_RULES,
  validateAdjudicationRules,
  getAdjudicationRulesByStep,
  getAdjudicationRuleCount,
  getAutoCorrectable,
  getHighRiskRules,
  type AdjudicationRule,
  type AdjudicationStep,
} from "./scheme-adjudication-rules";

import type { ClaimLineItem, ValidationIssue } from "./types";

// ─── UNIFIED SCHEME REGISTRY ────────────────────────────────────────────────

/** All scheme profiles (core + extended) */
export const ALL_SCHEME_PROFILES: SchemeProfile[] = [
  ...SCHEME_PROFILES,
  ...EXTENDED_SCHEME_PROFILES,
];

/** All scheme codes for UI dropdowns */
export const ALL_SCHEME_LIST: { code: string; name: string }[] = [
  ...SCHEME_LIST,
  ...EXTENDED_SCHEME_LIST,
];

/** Look up any scheme by code (core + extended) */
export function getSchemeProfileUnified(schemeCode: string): SchemeProfile | undefined {
  const upper = schemeCode.toUpperCase().trim();
  return ALL_SCHEME_PROFILES.find(s => s.code.toUpperCase() === upper);
}

// ─── UNIFIED VALIDATION ─────────────────────────────────────────────────────

export interface ComprehensiveValidationResult {
  schemeIssues: ValidationIssue[];
  planIssues: ValidationIssue[];
  adjudicationIssues: ValidationIssue[];
  tariffWarnings: string[];
  cdlInfo: {
    isCDLCondition: boolean;
    cdlNumber?: number;
    condition?: string;
    monitoring?: MonitoringRule[];
    schemeRule?: CDLSchemeRule;
  };
  pmbInfo: {
    isPMB: boolean;
    dtpNumber?: number;
    condition?: string;
    isEmergency?: boolean;
    preAuthAllowed?: boolean;
    coPaymentAllowed?: boolean;
  };
  totalIssues: number;
}

/**
 * Comprehensive validation — runs ALL rule modules against a claim line.
 * This is the main entry point for the full 3,000+ rule engine.
 */
export function validateComprehensive(
  line: ClaimLineItem,
  schemeCode: string,
  plan?: string,
  allLines?: ClaimLineItem[],
): ComprehensiveValidationResult {
  // 1. Scheme-level rules
  const schemeIssues = validateSchemeRules(line, schemeCode, allLines);

  // 2. Plan-level rules
  const planIssues = validatePlanRules(line, schemeCode, plan);

  // 2b. Adjudication rules (14-step flowchart)
  const adjudicationIssues = validateAdjudicationRules(line, schemeCode);

  // 3. Tariff-specific warnings
  const tariffWarnings: string[] = [];
  if (line.tariffCode) {
    const tariffRule = getTariffRule(line.tariffCode);
    if (tariffRule) {
      if (tariffRule.preAuthSchemes.includes("*") || tariffRule.preAuthSchemes.includes(schemeCode.toUpperCase())) {
        tariffWarnings.push(`Pre-auth required: ${tariffRule.description} (${tariffRule.notes})`);
      }
      if (tariffRule.motivationRequired) {
        tariffWarnings.push(`Motivation may be required: ${tariffRule.description}`);
      }
      if (tariffRule.modifierRequired && !line.modifier) {
        tariffWarnings.push(`Modifier ${tariffRule.modifierRequired} required for ${tariffRule.tariffCode}`);
      }
      if (tariffRule.avgRejectionRate > 0.15) {
        tariffWarnings.push(`High rejection risk (${(tariffRule.avgRejectionRate * 100).toFixed(0)}%): ${tariffRule.notes}`);
      }
    }
  }

  // 4. CDL condition check
  const cdlInfo: ComprehensiveValidationResult["cdlInfo"] = { isCDLCondition: false };
  if (line.primaryICD10) {
    const cdlRule = getCDLRulesForCode(line.primaryICD10);
    if (cdlRule) {
      cdlInfo.isCDLCondition = true;
      cdlInfo.cdlNumber = cdlRule.cdlNumber;
      cdlInfo.condition = cdlRule.condition;
      cdlInfo.monitoring = cdlRule.monitoring;
      cdlInfo.schemeRule = getCDLSchemeRule(cdlRule.cdlNumber, schemeCode);
    }
  }

  // 5. PMB/DTP check
  const pmbInfo: ComprehensiveValidationResult["pmbInfo"] = { isPMB: false };
  if (line.primaryICD10) {
    const dtp = getDTPForCode(line.primaryICD10);
    if (dtp) {
      pmbInfo.isPMB = true;
      pmbInfo.dtpNumber = dtp.dtpNumber;
      pmbInfo.condition = dtp.condition;
      pmbInfo.isEmergency = dtp.emergencyClassification;
      pmbInfo.preAuthAllowed = dtp.preAuthAllowed;
      pmbInfo.coPaymentAllowed = dtp.coPaymentAllowed;
    }
  }

  return {
    schemeIssues,
    planIssues,
    adjudicationIssues,
    tariffWarnings,
    cdlInfo,
    pmbInfo,
    totalIssues: schemeIssues.length + planIssues.length + adjudicationIssues.length + tariffWarnings.length,
  };
}

// ─── RULE COUNT ─────────────────────────────────────────────────────────────

export interface RuleCountBreakdown {
  coreSchemeProfiles: number;
  extendedSchemeProfiles: number;
  coreSchemeCustomRules: number;
  extendedSchemeCustomRules: number;
  planRules: number;
  tariffRules: number;
  cdlRules: number;
  dtpRules: number;
  emergencyRules: number;
  adjudicationRules: number;
  total: number;
}

/** Get a breakdown of all rules in the system */
export function getRuleCountBreakdown(): RuleCountBreakdown {
  const coreCustomRules = SCHEME_PROFILES.reduce((sum, p) => sum + p.customRules.length, 0);
  const extCustomRules = EXTENDED_SCHEME_PROFILES.reduce((sum, p) => sum + p.customRules.length, 0);
  const cdlRules = getCDLRuleCount();
  const dtpRules = getDTPRuleCount();
  const planRules = getPlanRuleCount();
  const tariffRules = getTariffRuleCount();

  const adjudicationRules = getAdjudicationRuleCount();

  return {
    coreSchemeProfiles: SCHEME_PROFILES.length,
    extendedSchemeProfiles: EXTENDED_SCHEME_PROFILES.length,
    coreSchemeCustomRules: coreCustomRules,
    extendedSchemeCustomRules: extCustomRules,
    planRules,
    tariffRules,
    cdlRules,
    dtpRules,
    emergencyRules: EMERGENCY_RULES.length,
    adjudicationRules,
    total: coreCustomRules + extCustomRules + planRules + tariffRules + cdlRules + dtpRules + EMERGENCY_RULES.length + adjudicationRules,
  };
}

// ─── RE-EXPORTS ─────────────────────────────────────────────────────────────

export {
  // Core scheme rules
  SCHEME_PROFILES,
  SCHEME_LIST,
  getSchemeProfile,
  validateSchemeRules,

  // Extended profiles
  EXTENDED_SCHEME_PROFILES,
  EXTENDED_SCHEME_LIST,

  // Plan rules
  ALL_PLAN_RULES,
  DISCOVERY_PLAN_RULES,
  GEMS_PLAN_RULES,
  BONITAS_PLAN_RULES,
  getPlanRules,
  validatePlanRules,

  // Tariff rules
  TARIFF_RULES,
  getTariffRule,
  getPreAuthTariffs,
  getHighRejectionTariffs,
  getTariffRulesByCategory,

  // CDL rules
  CDL_CONDITION_RULES,
  getCDLRulesForCode,
  getCDLSchemeRule,
  getCDLMonitoring,
  getAllCDLConditions,

  // PMB/DTP rules
  DTP_RULES,
  EMERGENCY_RULES,
  getDTPForCode,
  getDTPsByCategory,
  getEmergencyDTPs,
  isPMBProtected,

  // Adjudication rules
  ADJUDICATION_RULES,
  validateAdjudicationRules,
  getAdjudicationRulesByStep,
  getAutoCorrectable,
  getHighRiskRules,
};

// Type re-exports
export type {
  SchemeProfile,
  PlanRule,
  TariffRule,
  CDLConditionRule,
  CDLSchemeRule,
  MonitoringRule,
  DTPRule,
  EmergencyRule,
  AdjudicationRule,
  AdjudicationStep,
};
