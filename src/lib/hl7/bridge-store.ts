// CareOn Bridge — Supabase Persistent Storage
// Replaces in-memory arrays with database-backed storage
// Falls back to in-memory when Supabase is unavailable (demo/local dev)

import type { BridgeAdvisory, BridgeMessageLog, AdvisoryAction, AdvisoryResolution } from "./types";
import type { BridgeAuditEntry } from "./security";

const USE_DB = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

// Lazy import to avoid crashing when Supabase key isn't set (tests, local dev)
function getSupabase() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { supabaseAdmin } = require("@/lib/supabase");
  return supabaseAdmin;
}

// ── In-memory fallback ──
import { DEMO_ADVISORIES, DEMO_MESSAGE_LOG } from "./demo-messages";
let memAdvisories: BridgeAdvisory[] = [...DEMO_ADVISORIES];
let memMessages: BridgeMessageLog[] = [...DEMO_MESSAGE_LOG];
let memAudit: BridgeAuditEntry[] = [];

// ── Advisory helpers ──

function rowToAdvisory(row: Record<string, unknown>): BridgeAdvisory {
  const adv: BridgeAdvisory = {
    id: row.id as string,
    timestamp: row.created_at as string,
    patientMRN: row.patient_mrn as string,
    patientName: row.patient_name as string,
    encounterType: row.encounter_type as string,
    facility: row.facility as string,
    category: row.category as BridgeAdvisory["category"],
    severity: row.severity as BridgeAdvisory["severity"],
    title: row.title as string,
    description: row.description as string,
    suggestedICD10: (row.suggested_icd10 ?? []) as BridgeAdvisory["suggestedICD10"],
    estimatedValue: row.estimated_value as number,
    actionRequired: row.action_required as boolean,
    autoResolvable: row.auto_resolvable as boolean,
    sourceMessageType: row.source_message_type as BridgeAdvisory["sourceMessageType"],
    sourceMessageId: row.source_message_id as string,
  };
  if (row.resolution_action) {
    adv.resolution = {
      action: row.resolution_action as AdvisoryAction,
      resolvedBy: row.resolution_by as string,
      resolvedAt: row.resolution_at as string,
      notes: row.resolution_notes as string | undefined,
      claimDraftId: row.resolution_claim_id as string | undefined,
      notificationSent: row.resolution_notified as boolean | undefined,
    };
  }
  return adv;
}

function rowToMessage(row: Record<string, unknown>): BridgeMessageLog {
  return {
    id: row.id as string,
    receivedAt: row.received_at as string,
    messageType: row.message_type as BridgeMessageLog["messageType"],
    facility: row.facility as string,
    patientMRN: row.patient_mrn as string,
    status: row.status as BridgeMessageLog["status"],
    advisoryCount: row.advisory_count as number,
    processingTimeMs: row.processing_time_ms as number,
  };
}

// ── Public API ──

export async function storeAdvisory(adv: BridgeAdvisory): Promise<void> {
  if (!USE_DB) {
    memAdvisories = [adv, ...memAdvisories].slice(0, 200);
    return;
  }
  await getSupabase().from("ho_bridge_advisories").upsert({
    id: adv.id,
    created_at: adv.timestamp,
    patient_mrn: adv.patientMRN,
    patient_name: adv.patientName,
    encounter_type: adv.encounterType,
    facility: adv.facility,
    category: adv.category,
    severity: adv.severity,
    title: adv.title,
    description: adv.description,
    suggested_icd10: adv.suggestedICD10,
    estimated_value: adv.estimatedValue,
    action_required: adv.actionRequired,
    auto_resolvable: adv.autoResolvable,
    source_message_type: adv.sourceMessageType,
    source_message_id: adv.sourceMessageId,
  });
}

export async function storeMessage(msg: BridgeMessageLog): Promise<void> {
  if (!USE_DB) {
    memMessages = [msg, ...memMessages].slice(0, 500);
    return;
  }
  await getSupabase().from("ho_bridge_messages").upsert({
    id: msg.id,
    received_at: msg.receivedAt,
    message_type: msg.messageType,
    facility: msg.facility,
    patient_mrn: msg.patientMRN,
    status: msg.status,
    advisory_count: msg.advisoryCount,
    processing_time_ms: msg.processingTimeMs,
  });
}

export async function fetchAdvisories(filters?: {
  severity?: string;
  category?: string;
  facility?: string;
  limit?: number;
}): Promise<BridgeAdvisory[]> {
  if (!USE_DB) {
    let result = [...memAdvisories];
    if (filters?.severity) result = result.filter(a => a.severity === filters.severity);
    if (filters?.category) result = result.filter(a => a.category === filters.category);
    if (filters?.facility) result = result.filter(a => a.facility.toLowerCase().includes(filters.facility!.toLowerCase()));
    return result.slice(0, filters?.limit ?? 50);
  }

  let query = getSupabase()
    .from("ho_bridge_advisories")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(filters?.limit ?? 50);

  if (filters?.severity) query = query.eq("severity", filters.severity);
  if (filters?.category) query = query.eq("category", filters.category);
  if (filters?.facility) query = query.ilike("facility", `%${filters.facility}%`);

  const { data, error } = await query;
  if (error) {
    console.error("fetchAdvisories error:", error);
    return memAdvisories.slice(0, filters?.limit ?? 50);
  }
  return (data ?? []).map(rowToAdvisory);
}

export async function fetchMessages(limit = 50): Promise<BridgeMessageLog[]> {
  if (!USE_DB) return memMessages.slice(0, limit);

  const { data, error } = await getSupabase()
    .from("ho_bridge_messages")
    .select("*")
    .order("received_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("fetchMessages error:", error);
    return memMessages.slice(0, limit);
  }
  return (data ?? []).map(rowToMessage);
}

export async function resolveAdvisoryInDB(
  advisoryId: string,
  action: AdvisoryAction,
  resolvedBy: string,
  notes?: string,
): Promise<{ success: boolean; advisory?: BridgeAdvisory; error?: string }> {
  if (!USE_DB) {
    // In-memory fallback
    const idx = memAdvisories.findIndex(a => a.id === advisoryId);
    if (idx === -1) return { success: false, error: "Advisory not found" };
    if (memAdvisories[idx].resolution) return { success: false, error: "Advisory already resolved" };

    const resolution: AdvisoryResolution = {
      action,
      resolvedBy,
      resolvedAt: new Date().toISOString(),
      notes,
    };
    if (action === "generate_claim") resolution.claimDraftId = `CLM-${Date.now().toString(36).toUpperCase()}`;
    if (action === "notify_doctor") resolution.notificationSent = true;

    memAdvisories[idx] = { ...memAdvisories[idx], resolution, actionRequired: false };
    return { success: true, advisory: memAdvisories[idx] };
  }

  // Check current state
  const { data: existing } = await getSupabase()
    .from("ho_bridge_advisories")
    .select("*")
    .eq("id", advisoryId)
    .maybeSingle();

  if (!existing) return { success: false, error: "Advisory not found" };
  if (existing.resolution_action) return { success: false, error: "Advisory already resolved" };

  const claimId = action === "generate_claim" ? `CLM-${Date.now().toString(36).toUpperCase()}` : null;
  const notified = action === "notify_doctor" ? true : null;

  const { error } = await getSupabase()
    .from("ho_bridge_advisories")
    .update({
      resolution_action: action,
      resolution_by: resolvedBy,
      resolution_at: new Date().toISOString(),
      resolution_notes: notes ?? null,
      resolution_claim_id: claimId,
      resolution_notified: notified,
      action_required: false,
    })
    .eq("id", advisoryId);

  if (error) return { success: false, error: error.message };

  const { data: updated } = await getSupabase()
    .from("ho_bridge_advisories")
    .select("*")
    .eq("id", advisoryId)
    .single();

  return { success: true, advisory: updated ? rowToAdvisory(updated) : undefined };
}

export async function storeAuditEntry(entry: Omit<BridgeAuditEntry, "timestamp">): Promise<void> {
  if (!USE_DB) {
    memAudit.unshift({ ...entry, timestamp: new Date().toISOString() });
    if (memAudit.length > 1000) memAudit.length = 1000;
    return;
  }
  await getSupabase().from("ho_bridge_audit").insert({
    action: entry.action,
    user_id: entry.userId,
    user_name: entry.userName,
    user_role: entry.userRole,
    advisory_id: entry.advisoryId ?? null,
    facility: entry.facility ?? null,
    patient_mrn: entry.patientMRN ?? null,
    detail: entry.detail,
    ip_address: entry.ipAddress ?? null,
  });
}

export async function fetchAuditLog(limit = 50): Promise<BridgeAuditEntry[]> {
  if (!USE_DB) return memAudit.slice(0, limit);

  const { data, error } = await getSupabase()
    .from("ho_bridge_audit")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return memAudit.slice(0, limit);
  return (data ?? []).map((row: Record<string, unknown>) => ({
    timestamp: row.created_at,
    action: row.action,
    userId: row.user_id,
    userName: row.user_name,
    userRole: row.user_role,
    advisoryId: row.advisory_id ?? undefined,
    facility: row.facility ?? undefined,
    patientMRN: row.patient_mrn ?? undefined,
    detail: row.detail,
    ipAddress: row.ip_address ?? undefined,
  }));
}

export async function getAdvisoryStats(): Promise<{
  total: number;
  critical: number;
  warning: number;
  actionRequired: number;
  totalClaimValue: number;
}> {
  if (!USE_DB) {
    return {
      total: memAdvisories.length,
      critical: memAdvisories.filter(a => a.severity === "critical").length,
      warning: memAdvisories.filter(a => a.severity === "warning").length,
      actionRequired: memAdvisories.filter(a => a.actionRequired && !a.resolution).length,
      totalClaimValue: memAdvisories.reduce((s, a) => s + a.estimatedValue, 0),
    };
  }

  const { data } = await getSupabase().from("ho_bridge_advisories").select("severity, action_required, estimated_value, resolution_action");
  const rows = data ?? [];
  return {
    total: rows.length,
    critical: rows.filter((r: any) => r.severity === "critical").length,
    warning: rows.filter((r: any) => r.severity === "warning").length,
    actionRequired: rows.filter((r: any) => r.action_required && !r.resolution_action).length,
    totalClaimValue: rows.reduce((s: number, r: any) => s + (r.estimated_value ?? 0), 0),
  };
}
