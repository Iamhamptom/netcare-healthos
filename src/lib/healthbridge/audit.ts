// Healthbridge — Audit logging for medical aid claims operations
// Uses the existing AuditLog Prisma model to track all claim-related actions.

import { isDemoMode } from "@/lib/is-demo";

export interface ClaimAuditData {
  practiceId: string;
  userId: string;
  action:
    | "claim_view"
    | "claim_create"
    | "claim_submit"
    | "claim_resubmit"
    | "claim_reverse"
    | "claim_update"
    | "eligibility_check"
    | "remittance_fetch"
    | "remittance_reconcile"
    | "batch_upload"
    | "batch_submit";
  resourceId: string;
  resourceType: "claim" | "remittance" | "eligibility" | "batch";
  details?: string;
  ipAddress?: string;
}

/**
 * Log a Healthbridge claim audit event using the existing AuditLog model.
 * In demo mode, silently skips (no DB write).
 */
export async function logClaimAudit(data: ClaimAuditData): Promise<void> {
  if (isDemoMode) return;

  try {
    const { prisma } = await import("@/lib/prisma");

    await prisma.auditLog.create({
      data: {
        action: data.action,
        resource: `${data.resourceType}:${data.resourceId}`,
        details: data.details ?? "",
        ipAddress: data.ipAddress ?? "",
        userId: data.userId,
        practiceId: data.practiceId,
      },
    });
  } catch (err) {
    // Audit logging must never crash the caller — log and continue
    console.error("[healthbridge:audit] Failed to write audit log:", err);
  }
}
