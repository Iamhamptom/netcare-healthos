// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Transaction Review Agent — AI-powered post-submission claim evaluator
//
// After every claim submission, this agent evaluates the transaction:
// - Did the response match the expected outcome?
// - Is the paid amount reasonable given the procedure?
// - Were there unexpected rejection codes?
// - Flags anomalies for human review
// - Logs all evaluations for pattern learning
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { logger } from "@/lib/logger";
import type { SwitchProvider } from "./types";
import type { ClaimSubmission, ClaimResponse } from "../healthbridge/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AnomalyType =
  | "unexpected_rejection"
  | "underpayment"
  | "overpayment"
  | "zero_payment"
  | "partial_acceptance"
  | "unknown_rejection_code"
  | "high_latency"
  | "scheme_pattern_deviation"
  | "duplicate_rejection"
  | "suspicious_adjustment";

export type AnomalySeverity = "info" | "warning" | "critical";

export interface TransactionAnomaly {
  /** Type of anomaly detected */
  type: AnomalyType;
  /** Severity level */
  severity: AnomalySeverity;
  /** Human-readable description */
  description: string;
  /** Suggested follow-up action */
  suggestedAction: string;
  /** Relevant data for investigation */
  context: Record<string, unknown>;
}

export interface TransactionEvaluation {
  /** Unique evaluation ID */
  id: string;
  /** Original claim reference */
  claimRef: string;
  /** Switch transaction reference from response */
  transactionRef: string;
  /** Which switch processed this */
  switchProvider: SwitchProvider;
  /** Scheme name */
  scheme: string;
  /** Evaluation timestamp */
  evaluatedAt: string;
  /** Overall assessment */
  assessment: "normal" | "flagged" | "critical";
  /** Detailed anomalies found */
  anomalies: TransactionAnomaly[];
  /** Claim amount (cents) */
  claimedAmountCents: number;
  /** Approved amount (cents) */
  approvedAmountCents: number;
  /** Response status from switch */
  responseStatus: string;
  /** Latency of the switch request (ms) */
  latencyMs: number;
  /** Whether this needs human review */
  requiresHumanReview: boolean;
  /** Review notes (populated by human reviewer) */
  reviewNotes?: string;
  /** Review status */
  reviewStatus: "pending" | "reviewed" | "dismissed" | "escalated";
}

export interface ReviewPattern {
  /** Pattern identifier */
  patternId: string;
  /** Rejection code or anomaly type */
  key: string;
  /** How many times this has occurred */
  occurrences: number;
  /** Which schemes are most affected */
  schemes: Record<string, number>;
  /** Last seen timestamp */
  lastSeen: string;
  /** First seen timestamp */
  firstSeen: string;
  /** Whether an alert has been sent */
  alerted: boolean;
}

// ─── Evaluation Store (in-memory, would be Supabase in production) ──────────

const evaluationLog: TransactionEvaluation[] = [];
const patternStore: Map<string, ReviewPattern> = new Map();

/** Maximum evaluations to keep in memory */
const MAX_EVALUATIONS = 1000;

// ─── Known Rejection Code Expectations ──────────────────────────────────────

/** Rejection codes that are "normal" for specific scenarios */
const EXPECTED_REJECTIONS: Record<string, {
  description: string;
  normalFor: string[];
}> = {
  "01": { description: "Member not found", normalFor: ["new_patients", "wrong_scheme"] },
  "05": { description: "Duplicate claim", normalFor: ["resubmission"] },
  "11": { description: "Past filing deadline", normalFor: ["late_submission"] },
  "14": { description: "Co-payment applied", normalFor: ["above_tariff", "non_network"] },
  "15": { description: "Scheme tariff applied", normalFor: ["above_tariff"] },
  "17": { description: "Waiting period", normalFor: ["new_member"] },
  "23": { description: "Medical savings depleted", normalFor: ["year_end"] },
};

/** Rejection codes that should rarely occur and warrant investigation */
const SUSPICIOUS_REJECTIONS = new Set([
  "06", // Claim already reversed — shouldn't happen on new claims
  "10", // Provider not on network — should be caught before submission
  "20", // Date outside benefit year — indicates system date issues
]);

// ─── Scheme Tariff Expectations ─────────────────────────────────────────────

/** Expected payment percentages by scheme category */
const SCHEME_PAYMENT_EXPECTATIONS: Record<string, {
  minPaymentPercent: number;
  maxPaymentPercent: number;
  notes: string;
}> = {
  "Discovery Health": { minPaymentPercent: 70, maxPaymentPercent: 100, notes: "Usually pays 80-100% of scheme tariff" },
  "GEMS": { minPaymentPercent: 75, maxPaymentPercent: 100, notes: "Government scheme, generally good payer" },
  "Bonitas": { minPaymentPercent: 65, maxPaymentPercent: 100, notes: "Medscheme administered" },
  "Momentum Health": { minPaymentPercent: 70, maxPaymentPercent: 100, notes: "Good coverage on most options" },
  "default": { minPaymentPercent: 60, maxPaymentPercent: 105, notes: "Default range for unknown schemes" },
};

// ─── Core Review Agent ──────────────────────────────────────────────────────

/**
 * Evaluate a claim transaction after submission.
 * Runs a series of checks and flags anomalies for human review.
 *
 * Call this after every submitRoutedClaim() to build a pattern database.
 */
export function evaluateTransaction(
  claim: ClaimSubmission,
  response: ClaimResponse,
  switchProvider: SwitchProvider,
  latencyMs: number,
): TransactionEvaluation {
  const anomalies: TransactionAnomaly[] = [];
  const claimedAmount = claim.lineItems.reduce((sum, li) => sum + li.amount * li.quantity, 0);
  const approvedAmount = response.approvedAmount ?? 0;
  const now = new Date().toISOString();
  const evalId = `EVAL-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  logger.info(`[review-agent] Evaluating transaction ${response.transactionRef} on ${switchProvider} for ${claim.medicalAidScheme}`);

  // ── Check 1: Unexpected rejection ───────────────────────────────────────
  if (response.status === "rejected") {
    const code = response.rejectionCode || "unknown";
    const isExpected = EXPECTED_REJECTIONS[code];
    const isSuspicious = SUSPICIOUS_REJECTIONS.has(code);

    if (isSuspicious) {
      anomalies.push({
        type: "unexpected_rejection",
        severity: "critical",
        description: `Suspicious rejection code "${code}": ${response.rejectionReason || "No reason provided"}. This code rarely occurs on properly formed claims.`,
        suggestedAction: `Investigate immediately. Code ${code} suggests a system issue (${EXPECTED_REJECTIONS[code]?.description || "Unknown"}). Check claim data integrity and switch configuration.`,
        context: { rejectionCode: code, rejectionReason: response.rejectionReason },
      });
    } else if (!isExpected) {
      anomalies.push({
        type: "unknown_rejection_code",
        severity: "warning",
        description: `Unknown or uncommon rejection code "${code}": ${response.rejectionReason || "No reason provided"}`,
        suggestedAction: "Review rejection code against BHF standard codes. May need to update rejection code mappings.",
        context: { rejectionCode: code, rejectionReason: response.rejectionReason },
      });
    }
  }

  // ── Check 2: Payment amount reasonableness ─────────────────────────────
  if (response.status === "accepted" || response.status === "partial") {
    const paymentPercent = claimedAmount > 0 ? (approvedAmount / claimedAmount) * 100 : 0;
    const schemeExpect = SCHEME_PAYMENT_EXPECTATIONS[claim.medicalAidScheme]
      || SCHEME_PAYMENT_EXPECTATIONS["default"];

    if (paymentPercent === 0 && response.status === "accepted") {
      anomalies.push({
        type: "zero_payment",
        severity: "critical",
        description: `Claim marked as "accepted" but approved amount is R0.00 (claimed: ${formatCents(claimedAmount)})`,
        suggestedAction: "This is likely a switch parsing error. Verify the raw response XML. Contact switch support if the issue persists.",
        context: { claimedAmount, approvedAmount, responseStatus: response.status },
      });
    } else if (paymentPercent < schemeExpect.minPaymentPercent && paymentPercent > 0) {
      anomalies.push({
        type: "underpayment",
        severity: "warning",
        description: `Payment of ${paymentPercent.toFixed(1)}% is below expected range for ${claim.medicalAidScheme} (${schemeExpect.minPaymentPercent}-${schemeExpect.maxPaymentPercent}%). Claimed: ${formatCents(claimedAmount)}, Approved: ${formatCents(approvedAmount)}`,
        suggestedAction: `Review line-level responses. ${schemeExpect.notes}. Check if tariff codes match scheme formulary.`,
        context: { claimedAmount, approvedAmount, paymentPercent, expectedRange: schemeExpect },
      });
    } else if (paymentPercent > schemeExpect.maxPaymentPercent) {
      anomalies.push({
        type: "overpayment",
        severity: "info",
        description: `Payment of ${paymentPercent.toFixed(1)}% exceeds expected maximum for ${claim.medicalAidScheme}. Approved: ${formatCents(approvedAmount)} vs Claimed: ${formatCents(claimedAmount)}`,
        suggestedAction: "Verify correctness — overpayments may be clawed back in future eRAs. Ensure tariff codes are correct.",
        context: { claimedAmount, approvedAmount, paymentPercent },
      });
    }
  }

  // ── Check 3: Partial acceptance analysis ───────────────────────────────
  if (response.status === "partial" && response.lineResponses) {
    const rejectedLines = response.lineResponses.filter(lr => lr.status === "rejected");
    const rejectedCodes = rejectedLines.map(lr => lr.rejectionCode).filter(Boolean);
    const uniqueCodes = [...new Set(rejectedCodes)];

    if (rejectedLines.length > 0) {
      anomalies.push({
        type: "partial_acceptance",
        severity: "warning",
        description: `${rejectedLines.length} of ${response.lineResponses.length} line items rejected. Rejection codes: ${uniqueCodes.join(", ")}`,
        suggestedAction: "Review rejected lines individually. Consider resubmitting corrected lines as a separate claim.",
        context: {
          totalLines: response.lineResponses.length,
          rejectedCount: rejectedLines.length,
          rejectionCodes: uniqueCodes,
          rejectedLines: rejectedLines.map(lr => ({
            line: lr.lineNumber,
            code: lr.rejectionCode,
            reason: lr.rejectionReason,
          })),
        },
      });
    }
  }

  // ── Check 4: High latency ─────────────────────────────────────────────
  if (latencyMs > 10000) {
    anomalies.push({
      type: "high_latency",
      severity: latencyMs > 25000 ? "warning" : "info",
      description: `Switch response took ${(latencyMs / 1000).toFixed(1)}s (${switchProvider}). Normal range is 1-5s.`,
      suggestedAction: latencyMs > 25000
        ? "Switch may be experiencing issues. Monitor subsequent requests. Consider failover if latency persists."
        : "Slightly slow response. No action needed unless pattern continues.",
      context: { latencyMs, switchProvider },
    });
  }

  // ── Check 5: Pattern deviation ─────────────────────────────────────────
  const schemeKey = `${claim.medicalAidScheme}|${response.status}`;
  const pattern = patternStore.get(schemeKey);
  if (pattern && pattern.occurrences > 10) {
    // If this scheme usually accepts but now rejected, flag it
    const acceptKey = `${claim.medicalAidScheme}|accepted`;
    const rejectKey = `${claim.medicalAidScheme}|rejected`;
    const acceptPattern = patternStore.get(acceptKey);
    const rejectPattern = patternStore.get(rejectKey);

    if (acceptPattern && rejectPattern) {
      const totalForScheme = acceptPattern.occurrences + rejectPattern.occurrences;
      const rejectRate = rejectPattern.occurrences / totalForScheme;

      // If rejection rate suddenly spikes (more than 40% and recent), flag it
      if (rejectRate > 0.4 && response.status === "rejected") {
        const recentAge = Date.now() - new Date(rejectPattern.lastSeen).getTime();
        if (recentAge < 3600_000) { // Within last hour
          anomalies.push({
            type: "scheme_pattern_deviation",
            severity: "warning",
            description: `${claim.medicalAidScheme} rejection rate is ${(rejectRate * 100).toFixed(0)}% (${rejectPattern.occurrences}/${totalForScheme} recent claims rejected). This may indicate a scheme-wide issue.`,
            suggestedAction: "Check if scheme is experiencing processing issues. Contact scheme helpdesk if rejection rate remains elevated.",
            context: { scheme: claim.medicalAidScheme, rejectRate, recentRejections: rejectPattern.occurrences },
          });
        }
      }
    }
  }

  // ── Update pattern store ───────────────────────────────────────────────
  updatePatterns(claim, response);

  // ── Build evaluation ───────────────────────────────────────────────────
  const hasCritical = anomalies.some(a => a.severity === "critical");
  const hasWarning = anomalies.some(a => a.severity === "warning");

  const evaluation: TransactionEvaluation = {
    id: evalId,
    claimRef: claim.invoiceId || `CLM-${Date.now()}`,
    transactionRef: response.transactionRef,
    switchProvider,
    scheme: claim.medicalAidScheme,
    evaluatedAt: now,
    assessment: hasCritical ? "critical" : hasWarning ? "flagged" : "normal",
    anomalies,
    claimedAmountCents: claimedAmount,
    approvedAmountCents: approvedAmount,
    responseStatus: response.status,
    latencyMs,
    requiresHumanReview: hasCritical || hasWarning,
    reviewStatus: hasCritical || hasWarning ? "pending" : "dismissed",
  };

  // Log the evaluation
  logEvaluation(evaluation);

  if (anomalies.length > 0) {
    logger.info(`[review-agent] ${evaluation.assessment.toUpperCase()}: ${anomalies.length} anomalies found for ${response.transactionRef}`);
    for (const a of anomalies) {
      logger.info(`[review-agent]   [${a.severity}] ${a.type}: ${a.description}`);
    }
  } else {
    logger.info(`[review-agent] NORMAL: Transaction ${response.transactionRef} passed all checks`);
  }

  return evaluation;
}

// ─── Pattern Tracking ────────────────────────────────────────────────────────

function updatePatterns(claim: ClaimSubmission, response: ClaimResponse): void {
  const now = new Date().toISOString();

  // Track by scheme + status
  const schemeStatusKey = `${claim.medicalAidScheme}|${response.status}`;
  const existing = patternStore.get(schemeStatusKey);
  if (existing) {
    existing.occurrences++;
    existing.lastSeen = now;
    if (!existing.schemes[claim.medicalAidScheme]) existing.schemes[claim.medicalAidScheme] = 0;
    existing.schemes[claim.medicalAidScheme]++;
  } else {
    patternStore.set(schemeStatusKey, {
      patternId: schemeStatusKey,
      key: schemeStatusKey,
      occurrences: 1,
      schemes: { [claim.medicalAidScheme]: 1 },
      lastSeen: now,
      firstSeen: now,
      alerted: false,
    });
  }

  // Track by rejection code if rejected
  if (response.status === "rejected" && response.rejectionCode) {
    const codeKey = `rejection|${response.rejectionCode}`;
    const codePattern = patternStore.get(codeKey);
    if (codePattern) {
      codePattern.occurrences++;
      codePattern.lastSeen = now;
      if (!codePattern.schemes[claim.medicalAidScheme]) codePattern.schemes[claim.medicalAidScheme] = 0;
      codePattern.schemes[claim.medicalAidScheme]++;
    } else {
      patternStore.set(codeKey, {
        patternId: codeKey,
        key: response.rejectionCode,
        occurrences: 1,
        schemes: { [claim.medicalAidScheme]: 1 },
        lastSeen: now,
        firstSeen: now,
        alerted: false,
      });
    }
  }
}

// ─── Evaluation Log Management ───────────────────────────────────────────────

function logEvaluation(evaluation: TransactionEvaluation): void {
  evaluationLog.push(evaluation);

  // Keep log bounded
  if (evaluationLog.length > MAX_EVALUATIONS) {
    evaluationLog.splice(0, evaluationLog.length - MAX_EVALUATIONS);
  }
}

/**
 * Get all evaluations, optionally filtered.
 */
export function getEvaluations(filters?: {
  assessment?: TransactionEvaluation["assessment"];
  scheme?: string;
  reviewStatus?: TransactionEvaluation["reviewStatus"];
  since?: string;
  limit?: number;
}): TransactionEvaluation[] {
  let results = [...evaluationLog];

  if (filters?.assessment) {
    results = results.filter(e => e.assessment === filters.assessment);
  }
  if (filters?.scheme) {
    results = results.filter(e => e.scheme === filters.scheme);
  }
  if (filters?.reviewStatus) {
    results = results.filter(e => e.reviewStatus === filters.reviewStatus);
  }
  if (filters?.since) {
    results = results.filter(e => e.evaluatedAt >= filters.since!);
  }

  // Most recent first
  results.sort((a, b) => b.evaluatedAt.localeCompare(a.evaluatedAt));

  if (filters?.limit) {
    results = results.slice(0, filters.limit);
  }

  return results;
}

/**
 * Get evaluations that require human review.
 */
export function getPendingReviews(): TransactionEvaluation[] {
  return getEvaluations({ reviewStatus: "pending" });
}

/**
 * Mark an evaluation as reviewed.
 */
export function markReviewed(
  evaluationId: string,
  status: "reviewed" | "dismissed" | "escalated",
  notes?: string,
): boolean {
  const evaluation = evaluationLog.find(e => e.id === evaluationId);
  if (!evaluation) return false;

  evaluation.reviewStatus = status;
  evaluation.reviewNotes = notes;
  logger.info(`[review-agent] Evaluation ${evaluationId} marked as ${status}${notes ? `: ${notes}` : ""}`);
  return true;
}

/**
 * Get pattern insights for a given time range.
 * Shows recurring rejection codes, scheme issues, and trends.
 */
export function getPatternInsights(): {
  topRejectionCodes: { code: string; count: number; schemes: string[] }[];
  schemeRejectionRates: { scheme: string; total: number; rejected: number; rate: number }[];
  recentAnomalyTypes: { type: AnomalyType; count: number }[];
  totalEvaluations: number;
  flaggedCount: number;
  criticalCount: number;
} {
  // Top rejection codes
  const rejectionPatterns = [...patternStore.entries()]
    .filter(([key]) => key.startsWith("rejection|"))
    .map(([, pattern]) => ({
      code: pattern.key,
      count: pattern.occurrences,
      schemes: Object.keys(pattern.schemes),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Scheme rejection rates
  const schemeStats = new Map<string, { total: number; rejected: number }>();
  for (const [key, pattern] of patternStore.entries()) {
    if (key.startsWith("rejection|")) continue;
    const [scheme, status] = key.split("|");
    if (!schemeStats.has(scheme)) schemeStats.set(scheme, { total: 0, rejected: 0 });
    const stats = schemeStats.get(scheme)!;
    stats.total += pattern.occurrences;
    if (status === "rejected") stats.rejected += pattern.occurrences;
  }

  const schemeRejectionRates = [...schemeStats.entries()]
    .map(([scheme, stats]) => ({
      scheme,
      total: stats.total,
      rejected: stats.rejected,
      rate: stats.total > 0 ? stats.rejected / stats.total : 0,
    }))
    .sort((a, b) => b.rate - a.rate);

  // Recent anomaly types
  const anomalyTypeCounts = new Map<AnomalyType, number>();
  for (const eval_ of evaluationLog) {
    for (const anomaly of eval_.anomalies) {
      anomalyTypeCounts.set(anomaly.type, (anomalyTypeCounts.get(anomaly.type) || 0) + 1);
    }
  }

  const recentAnomalyTypes = [...anomalyTypeCounts.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  return {
    topRejectionCodes: rejectionPatterns,
    schemeRejectionRates,
    recentAnomalyTypes,
    totalEvaluations: evaluationLog.length,
    flaggedCount: evaluationLog.filter(e => e.assessment === "flagged").length,
    criticalCount: evaluationLog.filter(e => e.assessment === "critical").length,
  };
}

/**
 * Reset all evaluation data (useful for testing or fresh start).
 */
export function resetEvaluations(): void {
  evaluationLog.length = 0;
  patternStore.clear();
  console.log("[review-agent] All evaluation data and patterns reset");
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCents(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  return `${sign}R${(abs / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}
