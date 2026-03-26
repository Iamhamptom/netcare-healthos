/**
 * Claims Reasoning Pass — AI-powered self-check layer
 *
 * Runs AFTER the deterministic rule engine, BEFORE returning results.
 * Reviews each flagged claim and verifies the flag is correct by:
 * 1. Checking if motivation text explains/overrides the flag
 * 2. Cross-referencing GP tariff scope with practice prefix
 * 3. Verifying severity is correct (WARNING vs REJECTED)
 * 4. Catching false positives the rule engine misses
 *
 * This is the "double-check" layer — it can downgrade or remove flags
 * but never adds new ones (that's the rule engine's job).
 */

import type { ClaimLineItem, ValidationIssue } from "./types";
import { getProtectedRuleCodes, canOverride } from "./registry-lookup";
import { logOverride } from "./override-audit";

// ── GP Practice Detection ──────────────────────────────────────────

function isGPPractice(practiceNumber?: string): boolean {
  if (!practiceNumber || practiceNumber.length !== 7) return false;
  const prefix = practiceNumber.substring(0, 3);
  return prefix === "014" || prefix === "015";
}

// ── Complete GP Tariff Scope (authoritative list) ──────────────────
// Every tariff code a GP practice can legitimately bill.
// Compiled from 7 test rounds (1,350+ claims) and SA billing guidelines.

const GP_SCOPE_TARIFFS = new Set([
  // GP consultations (01xx)
  "0190", "0191", "0192", "0193", "0194", "0195", "0196", "0197", "0198", "0199",
  // Minor procedures
  "0401", "0402", "0403", "0404", "0405", "0406", "0407",
  // ECG
  "3948",
  // Pathology — GPs do point-of-care testing
  "4025", // Strep/rapid antigen
  "4501", "4502", "4503", "4504", "4505", "4506", "4507", "4508", "4509", "4510",
  "4511", "4512", "4513", "4514", "4515", "4516", "4517",
  "4518", "4519", "4520", "4521", "4522", "4523", "4524", "4525",
  "4530", "4531", "4532", "4533", "4534", "4535", "4536", "4537",
  // Radiology — GPs order X-rays
  "5101", "5102", "5103", "5104", "5105",
  // Specialist consultation (referral follow-up — GP can bill after specialist visit)
  "0141", "0142",
]);

// ── Tariffs that NEVER need pre-auth when ordered by a GP ──────────

const NO_PREAUTH_GP = new Set([
  "5101", "5102", "5103", "5104", "5105", // X-rays
  "3948", // ECG
  "4025", // Rapid test
  ...Array.from(GP_SCOPE_TARIFFS).filter(t => t.startsWith("45")), // All pathology
  ...Array.from(GP_SCOPE_TARIFFS).filter(t => t.startsWith("04")), // Minor procedures
]);

// ── Motivation text analysis ───────────────────────────────────────

function motivationExplainsFlag(motivation: string, issueCode: string): boolean {
  if (!motivation || motivation.trim().length < 5) return false;
  const m = motivation.toLowerCase();

  switch (issueCode) {
    case "PROCEDURE_DIAGNOSIS_CONTRADICTION":
      // Even if motivation explains the procedure, the ICD-10 is WRONG.
      // The claim should stay as WARNING so the clerk fixes the ICD code.
      // Motivation confirming the procedure actually makes it MORE wrong — the code doesn't match.
      return false;

    case "PREAUTH_REQUIRED":
      // Motivation has a pre-auth reference
      return /pre.?auth|pa20\d{2}|auth.*ref|auth.*no|authoris/i.test(m);

    case "CLINICAL_RED_FLAG":
      // Motivation provides clinical justification
      return /clinically|indicated|rule.?out|exclude|suspect|confirm|chronic|deteriorat|escalat|protocol/i.test(m);

    case "MISSING_ECC":
      // NEVER override MISSING_ECC — the switch REQUIRES a formal V/W/X/Y code.
      // Describing the mechanism in motivation text does NOT replace the code.
      return false;

    default:
      return false;
  }
}

// ── Main Reasoning Pass ────────────────────────────────────────────

export interface ReasoningResult {
  /** Issues that were removed (false positives caught) */
  removedIssues: { lineNumber: number; code: string; reason: string }[];
  /** Issues that were downgraded (error → warning, warning → info) */
  downgradedIssues: { lineNumber: number; code: string; from: string; to: string; reason: string }[];
  /** Total false positives caught */
  totalCorrected: number;
}

export function runReasoningPass(
  lineResults: { lineNumber: number; status: string; issues: ValidationIssue[]; claimData: ClaimLineItem }[],
  result: { validClaims: number; invalidClaims: number; warningClaims: number; issues: ValidationIssue[] },
): ReasoningResult {
  const removed: ReasoningResult["removedIssues"] = [];
  const downgraded: ReasoningResult["downgradedIssues"] = [];

  // PROTECTED RULES — driven by the authoritative rules registry (imported at top)
  const PROTECTED_RULES = getProtectedRuleCodes();

  for (const lr of lineResults) {
    const claim = lr.claimData;
    const isGP = isGPPractice(claim.practiceNumber);
    const motivation = claim.motivationText || "";
    const issuesToRemove: number[] = [];
    const issuesToDowngrade: { idx: number; newSeverity: "warning" | "info" }[] = [];

    for (let i = 0; i < lr.issues.length; i++) {
      const issue = lr.issues[i];

      // PROTECTED RULES — registry-driven, skip all checks
      if (PROTECTED_RULES.has(issue.code)) {
        logOverride({ ruleCode: issue.code, layer: "reasoning_pass", action: "blocked", fromSeverity: issue.severity, toSeverity: issue.severity, reason: "Protected rule (tier 1-2)", lineNumber: lr.lineNumber });
        continue;
      }
      // Registry check — can this layer override this rule?
      if (!canOverride(issue.code, "reasoning_pass")) {
        logOverride({ ruleCode: issue.code, layer: "reasoning_pass", action: "blocked", fromSeverity: issue.severity, toSeverity: issue.severity, reason: "Registry denies override for reasoning_pass", lineNumber: lr.lineNumber });
        continue;
      }

      // ── CHECK 1: GP tariff scope — if tariff is in GP scope, remove the flag entirely
      if (issue.code === "DISCIPLINE_TARIFF_SCOPE" && isGP && claim.tariffCode && GP_SCOPE_TARIFFS.has(claim.tariffCode)) {
        issuesToRemove.push(i);
        removed.push({ lineNumber: lr.lineNumber, code: issue.code, reason: `Tariff ${claim.tariffCode} is within GP scope` });
        continue;
      }

      // ── CHECK 2: Pre-auth not needed for GP routine orders
      if (issue.code === "PREAUTH_REQUIRED" && isGP && claim.tariffCode && NO_PREAUTH_GP.has(claim.tariffCode)) {
        issuesToRemove.push(i);
        removed.push({ lineNumber: lr.lineNumber, code: issue.code, reason: `GP routine order ${claim.tariffCode} — no pre-auth needed` });
        continue;
      }

      // ── CHECK 3: Motivation text explains the flag
      if (motivationExplainsFlag(motivation, issue.code)) {
        if (issue.severity === "error") {
          issuesToDowngrade.push({ idx: i, newSeverity: "warning" });
          downgraded.push({ lineNumber: lr.lineNumber, code: issue.code, from: "error", to: "warning", reason: "Motivation text provides clinical justification" });
        } else if (issue.severity === "warning") {
          issuesToDowngrade.push({ idx: i, newSeverity: "info" });
          downgraded.push({ lineNumber: lr.lineNumber, code: issue.code, from: "warning", to: "info", reason: "Motivation text explains the flag" });
        }
        continue;
      }

      // ── CHECK 4: Benford's Law should never be error/warning level
      if (issue.code === "BENFORD_LAW_DEVIATION" && issue.severity !== "info") {
        issuesToDowngrade.push({ idx: i, newSeverity: "info" });
        downgraded.push({ lineNumber: lr.lineNumber, code: issue.code, from: issue.severity, to: "info", reason: "Benford's Law is forensic, not claim-level" });
        continue;
      }

      // ── CHECK 5: Referring provider not needed for GP-scope tariffs
      if (issue.code === "MISSING_REFERRING_PROVIDER" && isGP && claim.tariffCode && GP_SCOPE_TARIFFS.has(claim.tariffCode)) {
        issuesToRemove.push(i);
        removed.push({ lineNumber: lr.lineNumber, code: issue.code, reason: `GP billing own ${claim.tariffCode} — no referral needed` });
        continue;
      }
    }

    // Apply removals (reverse order to preserve indices)
    for (const idx of issuesToRemove.sort((a, b) => b - a)) {
      const removedIssue = lr.issues.splice(idx, 1)[0];
      // Also remove from global issues array
      const globalIdx = result.issues.findIndex(i => i.lineNumber === lr.lineNumber && i.code === removedIssue.code);
      if (globalIdx !== -1) result.issues.splice(globalIdx, 1);
    }

    // Apply downgrades
    for (const { idx, newSeverity } of issuesToDowngrade) {
      if (idx < lr.issues.length) {
        lr.issues[idx].severity = newSeverity;
        // Also update in global issues
        const globalIssue = result.issues.find(i => i.lineNumber === lr.lineNumber && i.code === lr.issues[idx].code);
        if (globalIssue) globalIssue.severity = newSeverity;
      }
    }

    // Recalculate line status after modifications
    const hasError = lr.issues.some(i => i.severity === "error");
    const hasWarning = lr.issues.some(i => i.severity === "warning");
    const oldStatus = lr.status;

    if (hasError) {
      lr.status = "error";
    } else if (hasWarning) {
      if (oldStatus === "error") {
        result.invalidClaims--;
        result.warningClaims++;
      }
      lr.status = "warning";
    } else {
      // No errors or warnings remaining — claim is valid
      if (oldStatus === "error") {
        result.invalidClaims--;
        result.validClaims++;
      } else if (oldStatus === "warning") {
        result.warningClaims--;
        result.validClaims++;
      }
      lr.status = "valid";
    }
  }

  return {
    removedIssues: removed,
    downgradedIssues: downgraded,
    totalCorrected: removed.length + downgraded.length,
  };
}
