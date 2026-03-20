// CareOn/iMedOne Bridge Adapter
// Read + Advisory pattern: receives HL7v2 from CareOn, generates billing/clinical advisories
// Does NOT write back to CareOn — surfaces recommendations in Bridge Console
// v2: AI-enhanced with Gemini ICD-10 coding, rejection prediction, and anomaly detection

import { parseHL7Message, extractPatient, extractEncounter, extractObservations, extractDiagnoses, extractOrders, hl7TimestampToISO, generateACK } from "./hl7/parser";
import { mapPatientToFHIR, mapEncounterToFHIR, mapObservationToFHIR, mapDiagnosisToFHIR } from "./hl7/fhir-mapper";
import { DEMO_ADVISORIES, DEMO_MESSAGE_LOG, getDemoCareOnStatus } from "./hl7/demo-messages";
import { logBridgeAudit } from "./hl7/security";
import { aiSuggestCodes, predictRejection, analyzeLabTrends, detectTrafficAnomalies, generateNLAdvisory } from "./hl7/ai-advisor";
import type { BridgeAdvisory, BridgeMessageLog, CareOnConnectionStatus, AdvisorySeverity, AdvisoryCategory, AdvisoryAction, AdvisoryResolution } from "./hl7/types";
import type { EnhancedAdvisory, TrafficAnomaly } from "./hl7/ai-advisor";

// ── In-memory stores (demo mode) ──

let advisories: BridgeAdvisory[] = [...DEMO_ADVISORIES];
let messageLog: BridgeMessageLog[] = [...DEMO_MESSAGE_LOG];

// ── Advisory Generation Engine ──

/** Process an inbound HL7v2 message and generate advisories */
export function processHL7Message(rawMessage: string): {
  ack: string;
  advisories: BridgeAdvisory[];
  logEntry: BridgeMessageLog;
} {
  const startTime = Date.now();
  const msg = parseHL7Message(rawMessage);
  const patient = extractPatient(msg);
  const encounter = extractEncounter(msg);
  const observations = extractObservations(msg);
  const diagnoses = extractDiagnoses(msg);
  const orders = extractOrders(msg);

  // Convert to FHIR for standardized processing
  const fhirPatient = patient ? mapPatientToFHIR(patient) : null;
  const fhirEncounter = encounter && patient ? mapEncounterToFHIR(encounter, patient.id) : null;
  const fhirObservations = patient ? observations.map((o) => mapObservationToFHIR(o, patient.id)) : [];
  const fhirConditions = patient && encounter
    ? diagnoses.map((d) => mapDiagnosisToFHIR(d, patient.id, encounter.visitId))
    : [];

  const generatedAdvisories: BridgeAdvisory[] = [];
  const msgType = msg.messageType as BridgeAdvisory["sourceMessageType"];

  // Generate advisories based on message type
  if (msg.messageType.startsWith("ADT")) {
    // Patient movement events — check billing readiness
    if (diagnoses.length > 0 && patient) {
      const advisory = generateBillingAdvisory(patient, encounter, diagnoses, msg);
      if (advisory) generatedAdvisories.push(advisory);
    }

    // Check for eligibility
    if (patient?.medicalAidScheme) {
      const eligAdvisory = generateEligibilityAdvisory(patient, encounter, msg);
      if (eligAdvisory) generatedAdvisories.push(eligAdvisory);
    }
  }

  if (msg.messageType === "ORU^R01" && observations.length > 0 && patient) {
    // Lab results — check for critical values
    const labAdvisory = generateLabAdvisory(patient, observations, msg);
    if (labAdvisory) generatedAdvisories.push(labAdvisory);
  }

  if (msg.messageType === "ORM^O01" && orders.length > 0 && patient) {
    // Orders — check pre-authorization requirements
    const orderAdvisory = generateOrderAdvisory(patient, orders, msg);
    if (orderAdvisory) generatedAdvisories.push(orderAdvisory);
  }

  const processingTime = Date.now() - startTime;

  // Store results
  const logEntry: BridgeMessageLog = {
    id: `log-${Date.now()}`,
    receivedAt: new Date().toISOString(),
    messageType: msgType,
    facility: msg.sendingFacility.replace(/_/g, " ").replace(/NETCARE /i, "Netcare "),
    patientMRN: patient?.id ?? "UNKNOWN",
    status: generatedAdvisories.length > 0 ? "advisory_generated" : "processed",
    advisoryCount: generatedAdvisories.length,
    processingTimeMs: processingTime,
  };

  advisories = [...generatedAdvisories, ...advisories].slice(0, 100);
  messageLog = [logEntry, ...messageLog].slice(0, 200);

  return {
    ack: generateACK(msg, "AA"),
    advisories: generatedAdvisories,
    logEntry,
  };
}

// ── Advisory Generators ──

function generateBillingAdvisory(
  patient: ReturnType<typeof extractPatient>,
  encounter: ReturnType<typeof extractEncounter>,
  diagnoses: ReturnType<typeof extractDiagnoses>,
  msg: ReturnType<typeof parseHL7Message>,
): BridgeAdvisory | null {
  if (!patient) return null;

  const primaryDiag = diagnoses[0];
  if (!primaryDiag) return null;

  const isDischarge = msg.messageType === "ADT^A03";
  const facility = msg.sendingFacility.replace(/_/g, " ").replace(/NETCARE /i, "Netcare ");

  return {
    id: `adv-${Date.now()}`,
    timestamp: new Date().toISOString(),
    patientMRN: patient.id,
    patientName: `${patient.firstName} ${patient.surname}`,
    encounterType: isDischarge ? "Discharge" : "Admission",
    facility,
    category: "billing",
    severity: isDischarge ? "warning" : "info",
    title: isDischarge
      ? `Discharge — Verify Procedure Codes Before Claim`
      : `Admission — Billing Pack Prepared`,
    description: isDischarge
      ? `Patient discharged. ${diagnoses.length} diagnosis code(s) captured. Verify procedure codes are included before submitting claim to ${patient.medicalAidScheme || "medical aid"}.`
      : `Patient admitted with ${primaryDiag.description} (${primaryDiag.code}). ${patient.medicalAidScheme ? `${patient.medicalAidScheme} ${patient.medicalAidPlan} detected.` : "No medical aid on file."} ${diagnoses.length > 1 ? `${diagnoses.length - 1} comorbidities identified for DRG grouping.` : ""}`,
    suggestedICD10: diagnoses.map((d) => ({
      code: d.code,
      description: d.description,
      confidence: d.type === "F" ? 0.99 : d.type === "A" ? 0.95 : 0.85,
    })),
    estimatedValue: encounter?.patientClass === "I" ? 45000 : 650,
    actionRequired: isDischarge,
    autoResolvable: false,
    sourceMessageType: msg.messageType as BridgeAdvisory["sourceMessageType"],
    sourceMessageId: msg.messageId,
  };
}

function generateEligibilityAdvisory(
  patient: ReturnType<typeof extractPatient>,
  encounter: ReturnType<typeof extractEncounter>,
  msg: ReturnType<typeof parseHL7Message>,
): BridgeAdvisory | null {
  if (!patient?.medicalAidScheme) return null;

  const facility = msg.sendingFacility.replace(/_/g, " ").replace(/NETCARE /i, "Netcare ");

  return {
    id: `adv-elig-${Date.now()}`,
    timestamp: new Date().toISOString(),
    patientMRN: patient.id,
    patientName: `${patient.firstName} ${patient.surname}`,
    encounterType: encounter?.patientClass === "I" ? "Inpatient" : "Outpatient",
    facility,
    category: "eligibility",
    severity: "success",
    title: `${patient.medicalAidScheme} — Eligibility Check`,
    description: `Medical aid ${patient.medicalAidScheme} (${patient.medicalAidPlan || "plan unknown"}) detected for member ${patient.medicalAidNo || "number pending"}. Benefits verification recommended before high-cost procedures.`,
    suggestedICD10: [],
    estimatedValue: 0,
    actionRequired: false,
    autoResolvable: true,
    sourceMessageType: msg.messageType as BridgeAdvisory["sourceMessageType"],
    sourceMessageId: msg.messageId,
  };
}

function generateLabAdvisory(
  patient: ReturnType<typeof extractPatient>,
  observations: ReturnType<typeof extractObservations>,
  msg: ReturnType<typeof parseHL7Message>,
): BridgeAdvisory | null {
  if (!patient) return null;

  const abnormals = observations.filter((o) => o.abnormalFlag && o.abnormalFlag !== "N");
  const criticals = observations.filter((o) => o.abnormalFlag === "HH" || o.abnormalFlag === "LL");

  if (abnormals.length === 0) return null;

  const facility = msg.sendingFacility.replace(/_/g, " ").replace(/NETCARE /i, "Netcare ");
  const isCritical = criticals.length > 0;

  return {
    id: `adv-lab-${Date.now()}`,
    timestamp: new Date().toISOString(),
    patientMRN: patient.id,
    patientName: `${patient.firstName} ${patient.surname}`,
    encounterType: "Lab Results",
    facility,
    category: "clinical",
    severity: isCritical ? "critical" : "warning",
    title: isCritical
      ? `Critical Lab Values — Immediate Review Required`
      : `Abnormal Lab Results — ${abnormals.length} Flag(s)`,
    description: abnormals
      .map((o) => `${o.codeName}: ${o.value} ${o.unit} (ref ${o.referenceRange}, flag ${o.abnormalFlag})`)
      .join(". ") + ". " + (isCritical ? "Critical values detected — clinical follow-up recommended." : "Review for potential chronic disease management billing codes."),
    suggestedICD10: [],
    estimatedValue: abnormals.length * 350,
    actionRequired: isCritical,
    autoResolvable: false,
    sourceMessageType: msg.messageType as BridgeAdvisory["sourceMessageType"],
    sourceMessageId: msg.messageId,
  };
}

function generateOrderAdvisory(
  patient: ReturnType<typeof extractPatient>,
  orders: ReturnType<typeof extractOrders>,
  msg: ReturnType<typeof parseHL7Message>,
): BridgeAdvisory | null {
  if (!patient || orders.length === 0) return null;

  const facility = msg.sendingFacility.replace(/_/g, " ").replace(/NETCARE /i, "Netcare ");
  const firstOrder = orders[0];

  return {
    id: `adv-ord-${Date.now()}`,
    timestamp: new Date().toISOString(),
    patientMRN: patient.id,
    patientName: `${patient.firstName} ${patient.surname}`,
    encounterType: "Order",
    facility,
    category: "compliance",
    severity: "warning",
    title: `${firstOrder.orderName || "Procedure"} — Pre-Authorization Check`,
    description: `${firstOrder.priority === "S" ? "STAT " : ""}${firstOrder.orderName} ordered by ${firstOrder.orderingDoctor || "attending physician"}. Most medical aid schemes require pre-authorization for imaging and procedures above R3,000. Verify scheme rules before proceeding.`,
    suggestedICD10: [],
    estimatedValue: 8500,
    actionRequired: true,
    autoResolvable: false,
    sourceMessageType: msg.messageType as BridgeAdvisory["sourceMessageType"],
    sourceMessageId: msg.messageId,
  };
}

// ── Public API ──

/** Get all advisories, optionally filtered */
export function getAdvisories(filters?: {
  severity?: AdvisorySeverity;
  category?: AdvisoryCategory;
  facility?: string;
  limit?: number;
}): BridgeAdvisory[] {
  let result = [...advisories];

  if (filters?.severity) result = result.filter((a) => a.severity === filters.severity);
  if (filters?.category) result = result.filter((a) => a.category === filters.category);
  if (filters?.facility) result = result.filter((a) => a.facility.toLowerCase().includes(filters.facility!.toLowerCase()));

  return result.slice(0, filters?.limit ?? 50);
}

/** Get message processing log */
export function getMessageLog(limit = 50): BridgeMessageLog[] {
  return messageLog.slice(0, limit);
}

/** Get CareOn connection status */
export function getCareOnStatus(): CareOnConnectionStatus {
  return getDemoCareOnStatus();
}

// ── Advisory Resolution ──

/** Resolve an advisory with an action — creates audit trail */
export function resolveAdvisory(
  advisoryId: string,
  action: AdvisoryAction,
  resolvedBy: string,
  notes?: string,
): { success: boolean; advisory?: BridgeAdvisory; error?: string } {
  const idx = advisories.findIndex((a) => a.id === advisoryId);
  if (idx === -1) return { success: false, error: "Advisory not found" };

  const advisory = advisories[idx];
  if (advisory.resolution) return { success: false, error: "Advisory already resolved" };

  const resolution: AdvisoryResolution = {
    action,
    resolvedBy,
    resolvedAt: new Date().toISOString(),
    notes,
  };

  // Action-specific side effects
  if (action === "generate_claim") {
    // In production: call billing module to create a claim draft
    // For demo: generate a claim draft ID
    resolution.claimDraftId = `CLM-${Date.now().toString(36).toUpperCase()}`;
  }

  if (action === "notify_doctor") {
    // In production: send via WhatsApp/email to attending physician
    // For demo: mark as sent
    resolution.notificationSent = true;
  }

  advisories[idx] = { ...advisory, resolution, actionRequired: false };

  // POPIA audit trail
  logBridgeAudit({
    action: `advisory_${action}`,
    userId: resolvedBy,
    userName: resolvedBy,
    userRole: "admin",
    advisoryId,
    facility: advisory.facility,
    patientMRN: advisory.patientMRN,
    detail: `Advisory "${advisory.title}" resolved with action "${action}". ${notes ? `Notes: ${notes}` : ""}${resolution.claimDraftId ? ` Claim draft: ${resolution.claimDraftId}` : ""}`,
  });

  // Log the resolution in message log
  const auditEntry: BridgeMessageLog = {
    id: `audit-${Date.now()}`,
    receivedAt: new Date().toISOString(),
    messageType: advisory.sourceMessageType,
    facility: advisory.facility,
    patientMRN: advisory.patientMRN,
    status: "processed",
    advisoryCount: 0,
    processingTimeMs: 0,
  };
  messageLog = [auditEntry, ...messageLog].slice(0, 200);

  return { success: true, advisory: advisories[idx] };
}

/** Get resolution statistics */
export function getResolutionStats() {
  const resolved = advisories.filter((a) => a.resolution);
  const actionCounts: Record<string, number> = {};
  let claimsGenerated = 0;
  let totalClaimValue = 0;
  let notificationsSent = 0;

  for (const a of resolved) {
    const act = a.resolution!.action;
    actionCounts[act] = (actionCounts[act] ?? 0) + 1;
    if (act === "generate_claim") {
      claimsGenerated++;
      totalClaimValue += a.estimatedValue;
    }
    if (a.resolution!.notificationSent) notificationsSent++;
  }

  return {
    totalResolved: resolved.length,
    totalPending: advisories.filter((a) => a.actionRequired && !a.resolution).length,
    actionBreakdown: actionCounts,
    claimsGenerated,
    totalClaimValue,
    notificationsSent,
  };
}

/** Process HL7 message with AI enhancement (async - calls Gemini for coding/prediction) */
export async function processHL7MessageWithAI(rawMessage: string): Promise<{
  ack: string;
  advisories: BridgeAdvisory[];
  enhanced: EnhancedAdvisory[];
  logEntry: BridgeMessageLog;
}> {
  const baseResult = processHL7Message(rawMessage);

  const msg = parseHL7Message(rawMessage);
  const patient = extractPatient(msg);
  const diagnoses = extractDiagnoses(msg);
  const observations = extractObservations(msg);
  const encounterType = msg.messageType.startsWith("ADT") ? "ADT" : msg.messageType === "ORU^R01" ? "Lab" : "Order";

  const enhanced: EnhancedAdvisory[] = [];

  for (const adv of baseResult.advisories) {
    const start = Date.now();
    try {
      const [codeSuggestions, rejPrediction, labTrends] = await Promise.all([
        aiSuggestCodes(patient, diagnoses, observations, encounterType),
        patient?.medicalAidScheme
          ? predictRejection(patient.medicalAidScheme, patient.medicalAidPlan, diagnoses, encounterType, adv.estimatedValue)
          : Promise.resolve(null),
        observations.length > 0 ? analyzeLabTrends(patient, observations) : Promise.resolve([]),
      ]);

      let nlDescription = adv.description;
      if (codeSuggestions.length > 0 || rejPrediction) {
        const nlResult = await generateNLAdvisory(
          adv.patientName, patient?.medicalAidScheme ?? "Unknown", patient?.medicalAidPlan ?? "",
          diagnoses, encounterType, adv.estimatedValue, codeSuggestions, rejPrediction?.probability ?? 0,
        );
        if (nlResult) nlDescription = nlResult;
      }

      enhanced.push({
        ...adv, description: nlDescription,
        aiCodeSuggestions: codeSuggestions,
        rejectionPrediction: rejPrediction ?? undefined,
        labTrends,
        aiConfidenceScore: codeSuggestions.length > 0
          ? codeSuggestions.reduce((s, c) => s + c.confidence, 0) / codeSuggestions.length
          : 0.85,
        aiModel: "gemini-2.5-flash",
        aiProcessingTimeMs: Date.now() - start,
      });
    } catch (err) {
      console.error("AI enhancement failed for advisory:", adv.id, err);
      enhanced.push({ ...adv, aiConfidenceScore: 0, aiModel: "none", aiProcessingTimeMs: Date.now() - start });
    }
  }

  return { ...baseResult, enhanced };
}

/** Get traffic anomalies from facility data */
export function getTrafficAnomalies(): TrafficAnomaly[] {
  const status = getCareOnStatus();
  return detectTrafficAnomalies(status.facilities);
}

/** Get bridge statistics summary */
export function getBridgeStats() {
  const status = getCareOnStatus();
  const criticalCount = advisories.filter((a) => a.severity === "critical").length;
  const warningCount = advisories.filter((a) => a.severity === "warning").length;
  const actionRequired = advisories.filter((a) => a.actionRequired).length;
  const totalClaimValue = advisories.reduce((sum, a) => sum + a.estimatedValue, 0);
  const anomalies = getTrafficAnomalies();

  return {
    connection: {
      status: status.connected ? "connected" : "disconnected",
      facilitiesOnline: status.facilities.filter((f) => f.connected).length,
      facilitiesTotal: status.facilities.length,
      lastHeartbeat: status.lastHeartbeat,
    },
    messages: {
      received24h: status.messagesReceived24h,
      processed24h: status.messagesProcessed24h,
      errorRate: status.errorRate,
      avgProcessingTimeMs: status.avgProcessingTimeMs,
    },
    advisories: {
      total: advisories.length,
      critical: criticalCount,
      warning: warningCount,
      actionRequired,
      totalClaimValue,
    },
    anomalies: anomalies.length > 0 ? anomalies : undefined,
  };
}
