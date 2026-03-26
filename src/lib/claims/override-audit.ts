/**
 * Override Audit Trail
 *
 * Logs every time an AI layer attempts to change a rule verdict.
 * Tracks: what was changed, by which layer, whether it was allowed.
 */

import type { OverrideLayer } from "./rules-registry";

export interface AuditEntry {
  ruleCode: string;
  layer: OverrideLayer;
  action: "allowed" | "blocked" | "downgraded";
  fromSeverity: string;
  toSeverity: string;
  reason: string;
  lineNumber: number;
  legalBasis?: string;
  confidence?: number;
  timestamp: string;
}

let auditLog: AuditEntry[] = [];

export function logOverride(entry: Omit<AuditEntry, "timestamp">): void {
  auditLog.push({ ...entry, timestamp: new Date().toISOString() });
}

export function flushAuditLog(): AuditEntry[] {
  const log = [...auditLog];
  auditLog = [];
  return log;
}

export function getAuditLog(): readonly AuditEntry[] {
  return auditLog;
}

export function getAuditStats(): { total: number; allowed: number; blocked: number; byLayer: Record<string, number> } {
  const allowed = auditLog.filter(a => a.action === "allowed").length;
  const blocked = auditLog.filter(a => a.action === "blocked").length;
  const byLayer: Record<string, number> = {};
  for (const a of auditLog) {
    byLayer[a.layer] = (byLayer[a.layer] || 0) + 1;
  }
  return { total: auditLog.length, allowed, blocked, byLayer };
}
