// Healthbridge — Claim status state machine
// Enforces valid claim lifecycle transitions to prevent illegal status changes.

import type { ClaimStatus } from "./types";

/** Valid transitions from each claim status */
const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ["submitted", "reversed"],
  submitted: ["accepted", "rejected", "partial", "reversed"],
  accepted: ["pending_payment", "reversed", "short_paid", "paid"],
  rejected: ["resubmitted", "reversed"],
  partial: ["pending_payment", "reversed", "resubmitted"],
  pending_payment: ["paid", "short_paid", "reversed"],
  paid: ["reversed"],
  short_paid: ["paid", "reversed"],
  reversed: [],
  resubmitted: ["accepted", "rejected", "partial"],
};

/**
 * Check whether a transition from one status to another is allowed.
 */
export function isValidTransition(from: string, to: string): boolean {
  const allowed = VALID_TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.includes(to);
}

/**
 * Get the list of valid next states from the current status.
 */
export function getNextStates(current: string): string[] {
  return VALID_TRANSITIONS[current] ?? [];
}

/**
 * Validate a transition and return a structured result.
 * Returns { valid: true } or { valid: false, error: "..." }.
 */
export function validateTransition(
  from: string,
  to: string
): { valid: boolean; error?: string } {
  if (!(from in VALID_TRANSITIONS)) {
    return { valid: false, error: `Unknown claim status: "${from}"` };
  }

  if (isValidTransition(from, to)) {
    return { valid: true };
  }

  const allowed = getNextStates(from);
  if (allowed.length === 0) {
    return {
      valid: false,
      error: `Claim in "${from}" status is terminal and cannot transition to any other status`,
    };
  }

  return {
    valid: false,
    error: `Invalid transition from "${from}" to "${to}". Allowed transitions: ${allowed.join(", ")}`,
  };
}
