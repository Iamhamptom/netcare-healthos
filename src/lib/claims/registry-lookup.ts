/**
 * Registry Lookup — O(1) helpers for the rules registry
 *
 * Every validation file imports from here instead of hardcoding severities.
 * All AI layers check canOverride() before changing anything.
 */

import { RULES_REGISTRY, type RegistryRule, type RuleSeverity, type OverrideLayer } from "./rules-registry";

// Build O(1) lookup map at module load
const BY_CODE = new Map<string, RegistryRule>();
for (const rule of RULES_REGISTRY) {
  BY_CODE.set(rule.code, rule);
}

/** Get the AUTHORITATIVE severity for a rule code. Fallback to provided default if unregistered. */
export function getAuthoritativeSeverity(code: string, fallback: RuleSeverity = "warning"): RuleSeverity {
  return BY_CODE.get(code)?.severity ?? fallback;
}

/** Check if a rule is registered in the authoritative registry */
export function isRegistered(code: string): boolean {
  return BY_CODE.has(code);
}

/** Check if an AI layer is allowed to override a rule */
export function canOverride(code: string, layer: OverrideLayer): boolean {
  const rule = BY_CODE.get(code);
  if (!rule) return false; // Unknown rule = don't touch
  if (!rule.override.canBeOverridden) return false;
  return rule.override.allowedLayers.includes(layer);
}

/** Get the maximum override action allowed for a rule */
export function getMaxOverrideAction(code: string): string {
  return BY_CODE.get(code)?.override.maxAction ?? "none";
}

/** Get all rule codes at precedence 1 or 2 (NEVER override by AI) */
export function getProtectedRuleCodes(): Set<string> {
  return new Set(
    RULES_REGISTRY
      .filter(r => r.precedence <= 2 || !r.override.canBeOverridden)
      .map(r => r.code)
  );
}

/** Get all active rules for a given scheme */
export function getActiveRules(scheme: string): RegistryRule[] {
  const s = scheme.toUpperCase();
  return RULES_REGISTRY.filter(r => {
    if (!r.active) return false;
    return r.schemes.includes("*") || r.schemes.includes(s);
  });
}

/** Get a rule by code */
export function getRule(code: string): RegistryRule | undefined {
  return BY_CODE.get(code);
}

/** Get all rules at a given precedence tier */
export function getRulesByTier(tier: 1 | 2 | 3 | 4 | 5): RegistryRule[] {
  return RULES_REGISTRY.filter(r => r.precedence === tier);
}

/** Get the legal sources for a rule (for audit/compliance display) */
export function getLegalSources(code: string): string[] {
  const rule = BY_CODE.get(code);
  if (!rule) return [];
  return rule.legal.map(l => l.description);
}

/** Total registered rules */
export function getRegistryStats(): { total: number; byTier: Record<number, number>; byCategory: Record<string, number> } {
  const byTier: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const byCategory: Record<string, number> = {};
  for (const r of RULES_REGISTRY) {
    byTier[r.precedence] = (byTier[r.precedence] || 0) + 1;
    byCategory[r.category] = (byCategory[r.category] || 0) + 1;
  }
  return { total: RULES_REGISTRY.length, byTier, byCategory };
}
