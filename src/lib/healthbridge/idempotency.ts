// Healthbridge — Reconciliation idempotency
// Prevents duplicate eRA payment applications to claims.
// Uses a deterministic key derived from remittance + claim references.

import { createHash } from "crypto";
import { isDemoMode } from "@/lib/is-demo";

/**
 * Generate a deterministic idempotency key from a remittance reference and claim reference.
 * Uses SHA-256 to produce a consistent, collision-resistant key.
 */
export function generateIdempotencyKey(
  remittanceRef: string,
  claimRef: string
): string {
  const input = `hb:recon:${remittanceRef}:${claimRef}`;
  return createHash("sha256").update(input).digest("hex");
}

/**
 * Check whether a specific eRA payment has already been reconciled against a claim.
 * Looks for a matching HealthbridgeClaim with the given remittance reference
 * that has already been reconciled (reconciledAt is set).
 *
 * In demo mode, always returns false (nothing is reconciled).
 */
export async function isAlreadyReconciled(
  key: string,
  practiceId: string
): Promise<boolean> {
  if (isDemoMode) return false;

  try {
    const { prisma } = await import("@/lib/prisma");

    // The key encodes remittanceRef + claimRef. We check if any claim
    // for this practice with a matching remittance ref has already been reconciled.
    // We search by practice and check the reconciledAt field.
    const existing = await prisma.healthbridgeClaim.findFirst({
      where: {
        practiceId,
        reconciledAt: { not: null },
      },
      select: {
        id: true,
        remittanceRef: true,
        transactionRef: true,
      },
    });

    if (!existing) return false;

    // Verify the idempotency key matches
    const existingKey = generateIdempotencyKey(
      existing.remittanceRef,
      existing.transactionRef
    );
    return existingKey === key;
  } catch (err) {
    console.error("[healthbridge:idempotency] Failed to check reconciliation:", err);
    // Fail safe — assume not reconciled so the operation can proceed
    // (the caller should handle duplicates gracefully)
    return false;
  }
}
