// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SA Code-Pair Violation Database — Unified Entry Point
//
// Combines ~800 hand-curated static rules with ~4,000+ dynamically generated
// rules for comprehensive SA healthcare claims validation.
//
// Static rules: clinically nuanced, hand-written reasons from CCSA, BHF, CMS
// Dynamic rules: programmatically generated from ICD-10 + tariff databases
//
// Sources:
//   - PHISC CCSA v11 (October 2024)
//   - CMS (Council for Medical Schemes) adjudication guidelines
//   - SAMA coding manual
//   - BHF (Board of Healthcare Funders) coding standards
//   - WHO ICD-10 coding conventions (SA variant)
//   - Medical Schemes Act 131 of 1998
//   - HPCSA ethical billing rules (Booklet 4: Tariff Guidelines)
//   - Scheme clinical edit sets (Discovery, GEMS, Bonitas, Momentum)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Re-export types
export type {
  CodePairViolation,
  DynamicViolation,
  ViolationType,
  ViolationCategory,
} from "./types";

// ─── Static Rules ───────────────────────────────────────────────────────────

import { ICD10_EXCLUSIONS } from "./icd10-exclusions";
import { CONSULTATION_OVERLAPS } from "./consultation-overlap";
import { EMERGENCY_RULES } from "./emergency-rules";
import { PATHOLOGY_PANELS } from "./pathology-panels";
import { RADIOLOGY_BUNDLING } from "./radiology-bundling";
import { SURGICAL_PACKAGES } from "./surgical-packages";
import { ANAESTHESIA_BUNDLING } from "./anaesthesia-bundling";
import { DENTAL_BUNDLING } from "./dental-bundling";
import { ALLIED_HEALTH_NURSING } from "./allied-health-nursing";
import { TARIFF_DIAGNOSIS_MISMATCHES } from "./tariff-diagnosis-mismatch";

// ─── Dynamic Rules ──────────────────────────────────────────────────────────

import { getDynamicRules, getDynamicRuleStats, clearDynamicRuleCache } from "./dynamic-generators";

// ─── Combined Static Rules ──────────────────────────────────────────────────

import type { CodePairViolation } from "./types";

/** All hand-curated static code-pair rules. */
export const STATIC_RULES: CodePairViolation[] = [
  ...ICD10_EXCLUSIONS,
  ...CONSULTATION_OVERLAPS,
  ...EMERGENCY_RULES,
  ...PATHOLOGY_PANELS,
  ...RADIOLOGY_BUNDLING,
  ...SURGICAL_PACKAGES,
  ...ANAESTHESIA_BUNDLING,
  ...DENTAL_BUNDLING,
  ...ALLIED_HEALTH_NURSING,
  ...TARIFF_DIAGNOSIS_MISMATCHES,
];

/** All rules combined: static + dynamic. */
export function getAllRules(): CodePairViolation[] {
  return [...STATIC_RULES, ...getDynamicRules()];
}

// ─── Lookup Helpers ─────────────────────────────────────────────────────────

/**
 * Check all submitted codes (ICD-10 + tariff) for code-pair violations.
 *
 * Performs prefix matching for ICD-10 codes (e.g., "E10.9" matches rule "E10").
 * Checks both static and dynamic rules.
 *
 * @param codes - Array of ICD-10 and/or tariff codes from one claim/encounter
 * @returns Array of violations found
 */
export function checkCodePairViolations(codes: string[]): CodePairViolation[] {
  if (!codes || codes.length < 2) return [];

  const violations: CodePairViolation[] = [];
  const normalised = codes.map((c) => c.trim().toUpperCase());
  const allRules = getAllRules();

  for (const rule of allRules) {
    const code1Upper = rule.code1.toUpperCase();
    const code2Upper = rule.code2.toUpperCase();

    const hasCode1 = normalised.some(
      (c) =>
        c === code1Upper ||
        c.startsWith(code1Upper + ".") ||
        code1Upper.startsWith(c + ".")
    );
    const hasCode2 = normalised.some(
      (c) =>
        c === code2Upper ||
        c.startsWith(code2Upper + ".") ||
        code2Upper.startsWith(c + ".")
    );

    if (hasCode1 && hasCode2) {
      violations.push(rule);
    }
  }

  return violations;
}

/**
 * Check a specific pair of codes against the violation database.
 *
 * @param codeA - First code (ICD-10 or tariff)
 * @param codeB - Second code (ICD-10 or tariff)
 * @returns The matching violation, or null if the pair is allowed
 */
export function checkSinglePair(
  codeA: string,
  codeB: string
): CodePairViolation | null {
  const a = codeA.trim().toUpperCase();
  const b = codeB.trim().toUpperCase();
  const allRules = getAllRules();

  for (const rule of allRules) {
    const c1 = rule.code1.toUpperCase();
    const c2 = rule.code2.toUpperCase();

    const matchForward =
      (a === c1 || a.startsWith(c1 + ".") || c1.startsWith(a + ".")) &&
      (b === c2 || b.startsWith(c2 + ".") || c2.startsWith(b + "."));

    const matchReverse =
      (b === c1 || b.startsWith(c1 + ".") || c1.startsWith(b + ".")) &&
      (a === c2 || a.startsWith(c2 + ".") || c2.startsWith(a + "."));

    if (matchForward || matchReverse) {
      return rule;
    }
  }

  return null;
}

/**
 * Get all violations of a specific type.
 */
export function getViolationsByType(
  type: CodePairViolation["type"]
): CodePairViolation[] {
  return getAllRules().filter((v) => v.type === type);
}

/**
 * Get all violations in a specific category.
 */
export function getViolationsByCategory(
  category: NonNullable<CodePairViolation["category"]>
): CodePairViolation[] {
  return getAllRules().filter((v) => v.category === category);
}

/**
 * Get all violations involving a specific code (either position).
 */
export function getViolationsForCode(code: string): CodePairViolation[] {
  const c = code.trim().toUpperCase();
  return getAllRules().filter((v) => {
    const c1 = v.code1.toUpperCase();
    const c2 = v.code2.toUpperCase();
    return (
      c === c1 ||
      c === c2 ||
      c.startsWith(c1 + ".") ||
      c.startsWith(c2 + ".") ||
      c1.startsWith(c + ".") ||
      c2.startsWith(c + ".")
    );
  });
}

/**
 * Summary statistics for the entire violation database.
 */
export function getViolationStats(): {
  total: number;
  static: number;
  dynamic: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  byGenerator: Record<string, number>;
} {
  const allRules = getAllRules();
  const byType: Record<string, number> = {};
  const byCategory: Record<string, number> = {};

  for (const v of allRules) {
    byType[v.type] = (byType[v.type] || 0) + 1;
    if (v.category) {
      byCategory[v.category] = (byCategory[v.category] || 0) + 1;
    }
  }

  const dynamicStats = getDynamicRuleStats();

  return {
    total: allRules.length,
    static: STATIC_RULES.length,
    dynamic: dynamicStats.total,
    byType,
    byCategory,
    byGenerator: dynamicStats.byGenerator,
  };
}

// Re-export for advanced usage
export { getDynamicRules, getDynamicRuleStats, clearDynamicRuleCache };
export { STATIC_RULES as CODE_PAIR_VIOLATIONS };

// Re-export individual category arrays for targeted access
export { ICD10_EXCLUSIONS } from "./icd10-exclusions";
export { CONSULTATION_OVERLAPS } from "./consultation-overlap";
export { EMERGENCY_RULES } from "./emergency-rules";
export { PATHOLOGY_PANELS } from "./pathology-panels";
export { RADIOLOGY_BUNDLING } from "./radiology-bundling";
export { SURGICAL_PACKAGES } from "./surgical-packages";
export { ANAESTHESIA_BUNDLING } from "./anaesthesia-bundling";
export { DENTAL_BUNDLING } from "./dental-bundling";
export { ALLIED_HEALTH_NURSING } from "./allied-health-nursing";
export { TARIFF_DIAGNOSIS_MISMATCHES } from "./tariff-diagnosis-mismatch";
