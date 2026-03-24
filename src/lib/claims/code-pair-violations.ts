// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BACKWARD COMPATIBILITY SHIM
//
// All code-pair rules have been migrated to the modular code-pairs/ directory.
// This file re-exports everything for existing consumers.
//
// New code should import from "@/lib/claims/code-pairs" directly.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export {
  CODE_PAIR_VIOLATIONS,
  checkCodePairViolations,
  checkSinglePair,
  getViolationsByType,
  getViolationsByCategory,
  getViolationsForCode,
  getViolationStats,
} from "./code-pairs";

export type { CodePairViolation } from "./code-pairs";
