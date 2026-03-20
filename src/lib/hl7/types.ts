// HL7v2 + FHIR R4 types for CareOn/iMedOne bridge
// CareOn uses HL7v2 messaging (ADT, ORU, ORM) — iMedOne is the underlying HIS

// ── HL7v2 Parsed Structures ──

export interface HL7Segment {
  name: string;
  fields: string[];
}

export interface HL7Message {
  raw: string;
  segments: HL7Segment[];
  messageType: string;       // e.g. "ADT^A01"
  messageId: string;         // MSH-10
  sendingApp: string;        // MSH-3 (e.g. "CAREON")
  sendingFacility: string;   // MSH-4 (e.g. "NETCARE_MILPARK")
  receivingApp: string;      // MSH-5
  receivingFacility: string; // MSH-6
  timestamp: string;         // MSH-7
  version: string;           // MSH-12 (e.g. "2.4")
}

// Common HL7v2 message types from hospital EMRs
export type HL7MessageType =
  | "ADT^A01"  // Admit
  | "ADT^A02"  // Transfer
  | "ADT^A03"  // Discharge
  | "ADT^A04"  // Register outpatient
  | "ADT^A08"  // Update patient info
  | "ORU^R01"  // Lab/observation result
  | "ORM^O01"  // Order (lab, radiology)
  | "DFT^P03"  // Post detail financial transaction
  | "SIU^S12"  // Schedule notification
  | "MDM^T02"; // Document notification

export interface HL7Patient {
  id: string;             // PID-3 (MRN)
  idNumber: string;       // PID-3.4 (SA ID)
  surname: string;        // PID-5.1
  firstName: string;      // PID-5.2
  dateOfBirth: string;    // PID-7
  gender: string;         // PID-8
  address: string;        // PID-11
  phone: string;          // PID-13
  medicalAidScheme: string; // IN1-4
  medicalAidNo: string;    // IN1-36
  medicalAidPlan: string;  // IN1-35
}

export interface HL7Encounter {
  visitId: string;          // PV1-19
  patientClass: string;     // PV1-2 (I=inpatient, O=outpatient, E=emergency)
  attendingDoctor: string;  // PV1-7
  referringDoctor: string;  // PV1-8
  admitDate: string;        // PV1-44
  dischargeDate: string;    // PV1-45
  ward: string;             // PV1-3.1
  bed: string;              // PV1-3.3
  facility: string;         // PV1-3.4
  admitDiagnosis: string;   // DG1-3
}

export interface HL7Observation {
  id: string;                // OBX-1
  code: string;              // OBX-3.1 (LOINC or local)
  codeName: string;          // OBX-3.2
  value: string;             // OBX-5
  unit: string;              // OBX-6
  referenceRange: string;    // OBX-7
  abnormalFlag: string;      // OBX-8 (H, L, A, N)
  status: string;            // OBX-11 (F=final, P=preliminary)
  observationDate: string;   // OBX-14
}

export interface HL7Diagnosis {
  setId: number;            // DG1-1
  codingMethod: string;     // DG1-2 (ICD-10)
  code: string;             // DG1-3.1
  description: string;      // DG1-3.2
  type: string;             // DG1-6 (A=admitting, F=final, W=working)
  diagnosedBy: string;      // DG1-16
}

export interface HL7Order {
  orderId: string;          // ORC-2
  orderControl: string;     // ORC-1 (NW=new, CA=cancel)
  orderType: string;        // OBR-4.1 (test code)
  orderName: string;        // OBR-4.2
  orderingDoctor: string;   // OBR-16
  orderDate: string;        // OBR-7
  priority: string;         // OBR-5 (S=stat, R=routine)
}

// ── FHIR R4 Resources (simplified for bridge) ──

export interface FHIRPatient {
  resourceType: "Patient";
  id: string;
  identifier: { system: string; value: string }[];
  name: { family: string; given: string[] }[];
  gender: "male" | "female" | "other" | "unknown";
  birthDate: string;
  telecom: { system: string; value: string }[];
  address: { text: string }[];
}

export interface FHIREncounter {
  resourceType: "Encounter";
  id: string;
  status: "planned" | "arrived" | "in-progress" | "finished" | "cancelled";
  class: { code: string; display: string };
  subject: { reference: string };
  participant: { individual: { display: string } }[];
  period: { start: string; end?: string };
  location: { location: { display: string } }[];
  diagnosis: { condition: { display: string }; rank: number }[];
}

export interface FHIRObservation {
  resourceType: "Observation";
  id: string;
  status: "final" | "preliminary" | "cancelled";
  code: { coding: { system: string; code: string; display: string }[] };
  subject: { reference: string };
  effectiveDateTime: string;
  valueQuantity?: { value: number; unit: string };
  valueString?: string;
  interpretation?: { coding: { code: string; display: string }[] }[];
  referenceRange?: { low?: { value: number }; high?: { value: number }; text: string }[];
}

export interface FHIRCondition {
  resourceType: "Condition";
  id: string;
  code: { coding: { system: string; code: string; display: string }[] };
  subject: { reference: string };
  encounter: { reference: string };
  recordedDate: string;
  category: { coding: { code: string; display: string }[] }[];
}

// ── Bridge Advisory Types ──

export type AdvisorySeverity = "info" | "warning" | "critical" | "success";
export type AdvisoryCategory = "billing" | "coding" | "compliance" | "clinical" | "eligibility";

export type AdvisoryAction = "resolve" | "generate_claim" | "notify_doctor" | "dismiss";

export interface AdvisoryResolution {
  action: AdvisoryAction;
  resolvedBy: string;
  resolvedAt: string;
  notes?: string;
  claimDraftId?: string;       // set when action = "generate_claim"
  notificationSent?: boolean;  // set when action = "notify_doctor"
}

export interface BridgeAdvisory {
  id: string;
  timestamp: string;
  patientMRN: string;
  patientName: string;
  encounterType: string;
  facility: string;
  category: AdvisoryCategory;
  severity: AdvisorySeverity;
  title: string;
  description: string;
  suggestedICD10: { code: string; description: string; confidence: number }[];
  estimatedValue: number;       // ZAR value of the claim
  actionRequired: boolean;
  autoResolvable: boolean;
  sourceMessageType: HL7MessageType;
  sourceMessageId: string;
  resolution?: AdvisoryResolution;
}

export interface BridgeMessageLog {
  id: string;
  receivedAt: string;
  messageType: HL7MessageType;
  facility: string;
  patientMRN: string;
  status: "processed" | "advisory_generated" | "error" | "ignored";
  advisoryCount: number;
  processingTimeMs: number;
}

export interface CareOnConnectionStatus {
  connected: boolean;
  lastHeartbeat: string | null;
  messagesReceived24h: number;
  messagesProcessed24h: number;
  advisoriesGenerated24h: number;
  errorRate: number;
  avgProcessingTimeMs: number;
  facilities: {
    name: string;
    code: string;
    connected: boolean;
    lastMessage: string | null;
    messageCount24h: number;
  }[];
}
