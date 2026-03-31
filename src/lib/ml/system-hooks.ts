// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// System-Wide Learning Hooks — Connects ALL health products to the ML pipeline
//
// This module provides hooks that ANY product in the Health OS can call to
// feed data into the reinforcement learning loop. It also watches for
// knowledge base changes and triggers automatic re-embedding.
//
// Products connected:
// 1. Claims Analyzer (validation results, ICD-10 suggestions, corrections)
// 2. Healthbridge (claim submissions, eligibility checks, eRA reconciliation)
// 3. Switching Engine (routed claims, pre-auth, batch results)
// 4. CareOn Bridge (HL7v2 translations, FHIR mappings, clinical advisories)
// 5. FHIR Hub (resource validation, interoperability events)
// 6. WhatsApp Router (symptom checks, booking patterns)
// 7. AI Agents (triage decisions, intake patterns, billing suggestions)
// 8. Patient Records (diagnosis patterns, medication tracking)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { recordClaimOutcome, type LearningEventType } from "./reinforcement";

// ─── System-Wide Event Bus ──────────────────────────────────────────────────

interface HealthEvent {
  source: HealthProduct;
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
}

type HealthProduct =
  | "claims_analyzer"
  | "healthbridge"
  | "switching_engine"
  | "careon_bridge"
  | "fhir_hub"
  | "whatsapp_router"
  | "ai_agents"
  | "patient_records"
  | "billing"
  | "knowledge_base"
  | "engagement";

const eventLog: HealthEvent[] = [];
const EVENT_LOG_MAX = 5000;

// ─── Generic Event Recording ────────────────────────────────────────────────

/**
 * Record ANY health system event for learning.
 * Call this from any product's API route.
 */
export function recordHealthEvent(
  source: HealthProduct,
  type: string,
  data: Record<string, unknown>,
): void {
  const event: HealthEvent = {
    source,
    type,
    data,
    timestamp: new Date().toISOString(),
  };

  eventLog.push(event);
  if (eventLog.length > EVENT_LOG_MAX) {
    eventLog.splice(0, eventLog.length - EVENT_LOG_MAX);
  }

  // Persist to Supabase (fire-and-forget, survives cold starts)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && supabaseKey) {
    fetch(`${supabaseUrl}/rest/v1/ho_learning_events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        event_id: `health-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        event_type: `${source}:${type}`,
        outcome: "neutral",
        data: { source, type, ...data },
        applied: false,
        created_at: event.timestamp,
      }),
    }).catch(() => { /* silent — in-memory is fallback */ });
  }

  // Route to specialized handlers based on source
  try {
    switch (source) {
      case "claims_analyzer":
        handleClaimsAnalyzerEvent(type, data);
        break;
      case "healthbridge":
        handleHealthbridgeEvent(type, data);
        break;
      case "careon_bridge":
        handleCareOnEvent(type, data);
        break;
      case "fhir_hub":
        handleFHIREvent(type, data);
        break;
      case "ai_agents":
        handleAgentEvent(type, data);
        break;
      case "whatsapp_router":
        handleWhatsAppEvent(type, data);
        break;
      case "patient_records":
        handlePatientRecordsEvent(type, data);
        break;
      case "billing":
        handleBillingEvent(type, data);
        break;
      case "knowledge_base":
        handleKBUpdateEvent(type, data);
        break;
    }
  } catch {
    // Non-blocking — event recording should never crash the caller
  }
}

// ─── Claims Analyzer Hooks ──────────────────────────────────────────────────

function handleClaimsAnalyzerEvent(type: string, data: Record<string, unknown>): void {
  if (type === "validation_complete") {
    // Track which validation rules fire most often → prioritize in UI
    const issues = data.issues as { code: string; severity: string }[] | undefined;
    if (issues) {
      for (const issue of issues) {
        trackPattern("claims_rule", issue.code, data.scheme as string);
      }
    }
  }

  if (type === "suggestion_accepted") {
    // User accepted an AI ICD-10 suggestion → positive training signal
    trackTrainingSignal({
      instruction: "Suggest ICD-10 code for this clinical description",
      input: data.clinicalDescription as string || "",
      output: JSON.stringify({ code: data.acceptedCode, confidence: 1.0 }),
      category: "icd10_suggestion_accepted",
      quality: 1.0,
    });
  }

  if (type === "suggestion_rejected") {
    // User rejected an AI suggestion → negative signal
    trackTrainingSignal({
      instruction: "Suggest ICD-10 code for this clinical description",
      input: data.clinicalDescription as string || "",
      output: JSON.stringify({ code: data.rejectedCode, wasWrong: true, correctCode: data.correctCode }),
      category: "icd10_suggestion_rejected",
      quality: 0.0,
    });
  }

  if (type === "autocorrection_applied") {
    // Auto-correction was used → track what corrections practices accept
    trackTrainingSignal({
      instruction: "Auto-correct this claim issue",
      input: JSON.stringify(data.originalIssue),
      output: JSON.stringify(data.correction),
      category: "autocorrection_accepted",
      quality: 0.9,
    });
  }
}

// ─── Healthbridge Hooks ─────────────────────────────────────────────────────

function handleHealthbridgeEvent(type: string, data: Record<string, unknown>): void {
  if (type === "claim_submitted" || type === "claim_response") {
    recordClaimOutcome({
      claimRef: data.transactionRef as string || "",
      scheme: data.scheme as string || "",
      icd10Codes: data.icd10Codes as string[] || [],
      tariffCodes: data.tariffCodes as string[] || [],
      status: data.status as "accepted" | "rejected" | "partial",
      rejectionCode: data.rejectionCode as string,
      rejectionReason: data.rejectionReason as string,
      approvedAmount: data.approvedAmount as number,
      claimedAmount: data.claimedAmount as number,
      switchProvider: data.switchProvider as string || "healthbridge",
      latencyMs: data.latencyMs as number || 0,
    });
  }

  if (type === "eligibility_check") {
    trackPattern("eligibility", data.scheme as string || "", data.result as string || "");
  }

  if (type === "era_reconciled") {
    // Track which schemes pay fastest, which have most adjustments
    trackPattern("era_payment", data.scheme as string || "", `${data.daysToPayment || 0}days`);
  }
}

// ─── CareOn Bridge Hooks ────────────────────────────────────────────────────

function handleCareOnEvent(type: string, data: Record<string, unknown>): void {
  if (type === "hl7_translated") {
    // Track HL7v2 → FHIR translation patterns for accuracy improvement
    trackTrainingSignal({
      instruction: "Translate HL7v2 message to FHIR R4",
      input: data.hl7MessageType as string || "",
      output: JSON.stringify({ fhirResourceType: data.fhirType, success: data.success }),
      category: "hl7_translation",
      quality: data.success ? 1.0 : 0.0,
    });
  }

  if (type === "clinical_advisory") {
    // Track which clinical advisories practices find useful
    trackPattern("advisory", data.advisoryType as string || "", data.scheme as string || "");
  }
}

// ─── FHIR Hub Hooks ─────────────────────────────────────────────────────────

function handleFHIREvent(type: string, data: Record<string, unknown>): void {
  if (type === "resource_validated") {
    trackPattern("fhir_validation", data.resourceType as string || "", data.valid ? "valid" : "invalid");
  }

  if (type === "interop_event") {
    // Track which external systems connect and what they request
    trackPattern("interop", data.externalSystem as string || "", data.resourceType as string || "");
  }
}

// ─── AI Agent Hooks ─────────────────────────────────────────────────────────

function handleAgentEvent(type: string, data: Record<string, unknown>): void {
  if (type === "triage_decision") {
    trackTrainingSignal({
      instruction: "Triage this patient symptom description",
      input: data.symptoms as string || "",
      output: JSON.stringify({ urgency: data.urgency, recommendation: data.recommendation }),
      category: "triage_decision",
      quality: data.wasCorrect ? 1.0 : 0.5,
    });
  }

  if (type === "billing_suggestion") {
    trackTrainingSignal({
      instruction: "Suggest billing codes for this consultation",
      input: data.consultationNotes as string || "",
      output: JSON.stringify({ icd10: data.suggestedIcd10, tariff: data.suggestedTariff }),
      category: "billing_suggestion",
      quality: data.accepted ? 1.0 : 0.0,
    });
  }
}

// ─── WhatsApp Router Hooks ─────────────────────────────────────────────────

function handleWhatsAppEvent(type: string, data: Record<string, unknown>): void {
  if (type === "message_received") {
    // Track intent distribution — which intents are patients sending?
    trackPattern("whatsapp_intent", data.intent as string || "unknown", data.service as string || "");
  }

  if (type === "triage_completed") {
    // Track triage urgency distribution
    trackTrainingSignal({
      instruction: "Assess WhatsApp message urgency for clinic triage",
      input: JSON.stringify({ intent: data.intent }),
      output: JSON.stringify({ urgency: data.triageUrgency }),
      category: "whatsapp_triage",
      quality: 0.8,
    });
  }

  if (type === "emergency_detected") {
    trackPattern("whatsapp_emergency", "detected", data.practiceId as string || "");
  }

  if (type === "booking_completed") {
    trackPattern("whatsapp_booking", data.service as string || "GP", data.practiceId as string || "");
  }
}

// ─── Patient Records Hooks ────────────────────────────────────────────────

function handlePatientRecordsEvent(type: string, data: Record<string, unknown>): void {
  if (type === "record_created") {
    // Track which record types practices create most — informs training data priorities
    trackPattern("record_type", data.recordType as string || "unknown", data.practiceId as string || "");

    if (data.hasDiagnosis) {
      trackTrainingSignal({
        instruction: "What type of medical record is being created?",
        input: JSON.stringify({ recordType: data.recordType }),
        output: JSON.stringify({ hasDiagnosis: true, practiceActivity: "active" }),
        category: "record_pattern",
        quality: 0.7,
      });
    }
  }

  if (type === "diagnosis_added") {
    // Track diagnosis patterns across practices
    trackPattern("diagnosis", data.diagnosisCode as string || "unknown", data.practiceId as string || "");
  }
}

// ─── Billing Hooks ────────────────────────────────────────────────────────

function handleBillingEvent(type: string, data: Record<string, unknown>): void {
  if (type === "payment_success") {
    // Track which plans practices choose — informs pricing model
    trackPattern("billing_plan", data.plan as string || "unknown", data.channel as string || "");
  }

  if (type === "subscription_churn") {
    // Track churn reasons — critical for business intelligence
    trackPattern("billing_churn", data.reason as string || "unknown", data.plan as string || "");
    trackTrainingSignal({
      instruction: "Predict subscription churn risk for this practice profile",
      input: JSON.stringify({ plan: data.plan, reason: data.reason }),
      output: JSON.stringify({ churned: true }),
      category: "churn_prediction",
      quality: 1.0,
    });
  }

  if (type === "subscription_created") {
    trackPattern("billing_activation", data.plan as string || "unknown", data.practiceId as string || "");
  }
}

// ─── Knowledge Base Update Detection ────────────────────────────────────────

const lastKBCheck = { timestamp: "", filesHashed: new Map<string, string>() };

function handleKBUpdateEvent(type: string, data: Record<string, unknown>): void {
  if (type === "file_changed" || type === "file_added") {
    // Mark that re-embedding is needed
    pendingReembeds.add(data.filePath as string);
  }
}

const pendingReembeds = new Set<string>();

/**
 * Check if any knowledge base files need re-embedding.
 * Called by the daily cron job.
 */
export function getPendingReembeds(): string[] {
  return Array.from(pendingReembeds);
}

/**
 * Clear pending re-embeds after processing.
 */
export function clearPendingReembeds(): void {
  pendingReembeds.clear();
}

/**
 * Notify the system that a knowledge base file was updated.
 * Call this from any process that modifies docs/knowledge/ files.
 */
export function notifyKBUpdate(filePath: string): void {
  recordHealthEvent("knowledge_base", "file_changed", { filePath, timestamp: new Date().toISOString() });
}

// ─── Pattern Tracking ───────────────────────────────────────────────────────

const patternCounts = new Map<string, { count: number; lastSeen: string; details: string[] }>();

function trackPattern(category: string, key: string, detail: string): void {
  const mapKey = `${category}|${key}`;
  const existing = patternCounts.get(mapKey);
  if (existing) {
    existing.count++;
    existing.lastSeen = new Date().toISOString();
    if (existing.details.length < 10) existing.details.push(detail);
  } else {
    patternCounts.set(mapKey, { count: 1, lastSeen: new Date().toISOString(), details: [detail] });
  }
}

// ─── Training Signal Storage ────────────────────────────────────────────────

const trainingSignals: {
  instruction: string;
  input: string;
  output: string;
  category: string;
  quality: number;
  timestamp: string;
}[] = [];

function trackTrainingSignal(signal: {
  instruction: string;
  input: string;
  output: string;
  category: string;
  quality: number;
}): void {
  trainingSignals.push({ ...signal, timestamp: new Date().toISOString() });
  // Keep last 1000
  if (trainingSignals.length > 1000) {
    trainingSignals.splice(0, trainingSignals.length - 1000);
  }
}

/**
 * Get accumulated training signals for the next fine-tuning cycle.
 */
export function getTrainingSignals(): typeof trainingSignals {
  return [...trainingSignals];
}

/**
 * Get system-wide pattern analytics.
 */
export function getSystemPatterns(): {
  category: string;
  key: string;
  count: number;
  lastSeen: string;
}[] {
  return Array.from(patternCounts.entries())
    .map(([mapKey, data]) => {
      const [category, key] = mapKey.split("|");
      return { category, key, count: data.count, lastSeen: data.lastSeen };
    })
    .sort((a, b) => b.count - a.count);
}

/**
 * Get health event log for a specific product.
 */
export function getProductEvents(product: HealthProduct, limit = 50): HealthEvent[] {
  return eventLog
    .filter(e => e.source === product)
    .slice(-limit);
}

/**
 * Get overall system learning health.
 */
export function getSystemLearningHealth(): {
  totalEvents: number;
  byProduct: Record<string, number>;
  trainingSignalsReady: number;
  pendingReembeds: number;
  topPatterns: { category: string; key: string; count: number }[];
} {
  const byProduct: Record<string, number> = {};
  for (const event of eventLog) {
    byProduct[event.source] = (byProduct[event.source] || 0) + 1;
  }

  return {
    totalEvents: eventLog.length,
    byProduct,
    trainingSignalsReady: trainingSignals.length,
    pendingReembeds: pendingReembeds.size,
    topPatterns: getSystemPatterns().slice(0, 10),
  };
}
