// CareOn EMR Adapter — Hospital Clinical System Bridge
// CareOn: Deutsche Telekom iMedOne, 34K users, 45 hospitals, HL7v2 + FHIR R4
// Integrates: Lancet/Ampath pathology, Micromedex drug safety, Philips Capsule vitals

import type {
  UnifiedPatientRecord,
  HospitalEncounter,
  LabResult,
  Medication,
  VitalSign,
  FHIRBundle,
  FHIRMedicationRequest,
} from "../types";
import type {
  FHIRPatient,
  FHIREncounter,
  FHIRObservation,
} from "../../hl7/types";
import {
  MOCK_PATIENTS,
  MOCK_ENCOUNTERS,
  MOCK_LAB_RESULTS,
  MOCK_MEDICATIONS,
  MOCK_VITALS,
} from "./mock-data";

// ── Configuration ──

export interface CareOnConfig {
  /** FHIR R4 base URL */
  fhirBaseUrl: string;
  /** HL7v2 MLLP endpoint for real-time feeds */
  hl7Endpoint: string;
  /** Auth credential loaded from env */
  authCredential: string;
  /** Client certificate path (mutual TLS required by CareOn) */
  clientCertPath?: string;
  /** Facility code filter */
  facilityCode?: string;
  /** Request timeout in ms */
  timeoutMs: number;
}

const DEFAULT_CONFIG: CareOnConfig = {
  fhirBaseUrl: process.env.CAREON_FHIR_URL ?? "",
  hl7Endpoint: process.env.CAREON_HL7_ENDPOINT ?? "",
  authCredential: process.env.CAREON_API_KEY ?? "",
  timeoutMs: 15000,
};

// ── FHIR R4 Client Helper ──

class FHIRClient {
  constructor(
    private baseUrl: string,
    private authCredential: string,
    private timeoutMs: number,
  ) {}

  async read<T>(resourceType: string, id: string): Promise<T | null> {
    const url = `${this.baseUrl}/${resourceType}/${id}`;
    console.log(`[careon] FHIR GET ${url}`);
    // STUB: In production, use fetch() with auth header
    return null;
  }

  async search<T>(resourceType: string, params: Record<string, string>): Promise<FHIRBundle<T>> {
    const query = new URLSearchParams(params).toString();
    const url = `${this.baseUrl}/${resourceType}?${query}`;
    console.log(`[careon] FHIR SEARCH ${url}`);
    // STUB: In production, call the real FHIR endpoint
    return { resourceType: "Bundle", type: "searchset", total: 0, entry: [] };
  }
}

// ── HL7v2 Message Parser Skeleton ──

export interface ParsedHL7v2Message {
  messageType: string;
  messageId: string;
  timestamp: string;
  facility: string;
  segments: Record<string, string[][]>;
}

/**
 * Lightweight HL7v2 parser for the adapter interface.
 * Supports ADT^A01 (admission), ADT^A03 (discharge), ORU^R01 (lab results).
 * The full parser lives at src/lib/hl7/parser.ts.
 */
export function parseHL7v2(raw: string): ParsedHL7v2Message {
  const lines = raw
    .replace(/\r\n/g, "\r")
    .replace(/\n/g, "\r")
    .trim()
    .split("\r")
    .filter(Boolean);
  const segments: Record<string, string[][]> = {};

  for (const line of lines) {
    const fields = line.split("|");
    const segName = fields[0];
    if (!segments[segName]) segments[segName] = [];
    segments[segName].push(fields);
  }

  const msh = segments["MSH"]?.[0];
  return {
    messageType: msh?.[9] ?? "UNKNOWN",
    messageId: msh?.[10] ?? "",
    timestamp: msh?.[7] ?? "",
    facility: msh?.[4] ?? "",
    segments,
  };
}

/** Generate HL7v2 ACK response */
export function generateHL7ACK(
  inboundHL7: ParsedHL7v2Message,
  ackCode: "AA" | "AE" | "AR",
): string {
  const now = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
  const typeParts = inboundHL7.messageType.split("^");
  const eventCode = typeParts[1] ?? "A01";
  const ackId = `ACK-${Date.now()}`;
  const HL7_ENCODING = "^~" + String.fromCharCode(92) + "&";
  return [
    `MSH|${HL7_ENCODING}|HEALTHOS|NETCARE_HEALTHOS|CAREON|${inboundHL7.facility}|${now}||ACK^${eventCode}|${ackId}|P|2.4`,
    `MSA|${ackCode}|${inboundHL7.messageId}`,
  ].join("\r");
}

// ── CareOn Adapter ──

export class CareOnAdapter {
  private fhir: FHIRClient;
  private config: CareOnConfig;
  private useMocks: boolean;

  constructor(config: Partial<CareOnConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.fhir = new FHIRClient(
      this.config.fhirBaseUrl,
      this.config.authCredential,
      this.config.timeoutMs,
    );
    this.useMocks =
      !this.config.authCredential || process.env.DEMO_MODE === "true";

    if (this.useMocks) {
      console.log("[careon] Running in MOCK mode — no live CareOn connection");
    } else {
      console.log(`[careon] Connecting to ${this.config.fhirBaseUrl}`);
    }
  }

  async getPatient(mrn: string): Promise<UnifiedPatientRecord | null> {
    console.log(`[careon] getPatient(${mrn})`);
    if (!this.useMocks) {
      const fhirPatient = await this.fhir.read<FHIRPatient>("Patient", mrn);
      if (!fhirPatient) return null;
      return null; // TODO: Map FHIR Patient to UnifiedPatientRecord
    }
    const mock = MOCK_PATIENTS[mrn];
    if (!mock) {
      console.log(`[careon] Patient ${mrn} not found`);
      return null;
    }
    return mock;
  }

  async getEncounters(patientId: string): Promise<HospitalEncounter[]> {
    console.log(`[careon] getEncounters(${patientId})`);
    if (!this.useMocks) {
      await this.fhir.search<FHIREncounter>("Encounter", {
        patient: patientId, _sort: "-date", _count: "20",
      });
      return []; // TODO: Map FHIR Encounters
    }
    return MOCK_ENCOUNTERS[patientId] ?? [];
  }

  async getLabResults(patientId: string): Promise<LabResult[]> {
    console.log(`[careon] getLabResults(${patientId})`);
    if (!this.useMocks) {
      await this.fhir.search<FHIRObservation>("Observation", {
        patient: patientId, category: "laboratory", _sort: "-date", _count: "50",
      });
      return []; // TODO: Map FHIR Observations
    }
    return MOCK_LAB_RESULTS[patientId] ?? [];
  }

  async getMedications(patientId: string): Promise<Medication[]> {
    console.log(`[careon] getMedications(${patientId})`);
    if (!this.useMocks) {
      await this.fhir.search<FHIRMedicationRequest>("MedicationRequest", {
        patient: patientId, status: "active", _sort: "-authoredon",
      });
      return []; // TODO: Map FHIR MedicationRequests
    }
    return MOCK_MEDICATIONS[patientId] ?? [];
  }

  async getVitals(patientId: string): Promise<VitalSign[]> {
    console.log(`[careon] getVitals(${patientId})`);
    if (!this.useMocks) {
      await this.fhir.search<FHIRObservation>("Observation", {
        patient: patientId, category: "vital-signs", _sort: "-date", _count: "10",
      });
      return []; // TODO: Map FHIR Observations
    }
    return MOCK_VITALS[patientId] ?? [];
  }

  async toUnifiedRecord(mrn: string): Promise<UnifiedPatientRecord | null> {
    const patient = await this.getPatient(mrn);
    if (!patient) return null;
    const medications = await this.getMedications(mrn);
    patient.medications = medications;
    return patient;
  }

  processHL7Message(raw: string): { ack: string; parsed: ParsedHL7v2Message } {
    const parsed = parseHL7v2(raw);
    console.log(`[careon] HL7v2 ${parsed.messageType} from ${parsed.facility} (${parsed.messageId})`);
    const ack = generateHL7ACK(parsed, "AA");
    return { ack, parsed };
  }
}

export default CareOnAdapter;
