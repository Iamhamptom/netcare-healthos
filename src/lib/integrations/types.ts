/**
 * Shared clinical interfaces for CareOn (hospital) and HEAL (Medicross) bridges.
 * Both adapters map their native data to these common types, enabling cross-system
 * patient continuity — the core value proposition of Netcare Health OS.
 */

// ── Common Patient Record (the bridge) ──

export interface UnifiedPatientRecord {
  /** Source system identifier */
  source: "careon" | "heal";
  /** Patient MRN or system-specific ID */
  sourceId: string;
  /** SA ID number (13-digit) — primary cross-system link */
  saIdNumber: string;
  /** Demographics */
  demographics: PatientDemographics;
  /** Allergies (from hospital or GP records) */
  allergies: Allergy[];
  /** Current medications */
  medications: Medication[];
  /** Medical aid details */
  medicalAid: MedicalAidInfo | null;
  /** Last synced timestamp */
  lastSyncedAt: string;
}

export interface PatientDemographics {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date
  gender: "male" | "female" | "other" | "unknown";
  phone: string;
  email: string;
  address: string;
  nextOfKin?: string;
  nextOfKinPhone?: string;
}

export interface Allergy {
  substance: string;
  reaction: string;
  severity: "mild" | "moderate" | "severe" | "life-threatening";
  recordedDate: string;
  source: "careon" | "heal";
}

export interface Medication {
  name: string;
  /** NAPPI code (SA national product pricing index) */
  nappiCode: string;
  dosage: string;
  frequency: string;
  route: string;
  prescribedDate: string;
  prescribedBy: string;
  /** Micromedex safety flags from CareOn */
  safetyFlags?: MedicationSafetyFlag[];
  active: boolean;
}

export interface MedicationSafetyFlag {
  type: "interaction" | "contraindication" | "allergy" | "duplicate" | "dose_check";
  severity: "low" | "moderate" | "high" | "critical";
  description: string;
  interactsWith?: string;
}

export interface MedicalAidInfo {
  schemeName: string;
  planName: string;
  memberNumber: string;
  dependantCode: string;
  status: "active" | "suspended" | "lapsed" | "unknown";
}

// ── Hospital-specific (CareOn) ──

export interface HospitalEncounter {
  encounterId: string;
  patientId: string;
  facility: string;
  facilityCode: string;
  type: "inpatient" | "outpatient" | "emergency" | "day_case";
  status: "admitted" | "discharged" | "transferred" | "in-progress";
  admitDate: string;
  dischargeDate: string | null;
  ward: string;
  bed: string;
  attendingDoctor: string;
  referringDoctor: string;
  admitDiagnosis: string;
  dischargeDiagnoses: DiagnosisEntry[];
  procedures: ProcedureEntry[];
  lengthOfStayDays: number | null;
}

export interface DiagnosisEntry {
  code: string;       // ICD-10
  description: string;
  type: "admitting" | "final" | "working" | "comorbidity";
  isPrimary: boolean;
}

export interface ProcedureEntry {
  code: string;       // CPT/procedure code
  description: string;
  date: string;
  performedBy: string;
}

export interface LabResult {
  resultId: string;
  patientId: string;
  /** Lancet or Ampath reference number */
  labReference: string;
  laboratory: "lancet" | "ampath" | "nhls" | "other";
  testCode: string;
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  abnormalFlag: "normal" | "high" | "low" | "critical_high" | "critical_low" | "abnormal";
  status: "final" | "preliminary" | "corrected";
  collectedDate: string;
  reportedDate: string;
  orderingDoctor: string;
}

export interface VitalSign {
  patientId: string;
  /** Philips Capsule auto-capture device ID */
  deviceId: string;
  timestamp: string;
  heartRate: number | null;         // bpm
  systolicBP: number | null;       // mmHg
  diastolicBP: number | null;      // mmHg
  temperature: number | null;      // Celsius
  respiratoryRate: number | null;  // breaths/min
  oxygenSaturation: number | null; // SpO2 %
  painScore: number | null;        // 0-10
  gcsScore: number | null;         // Glasgow Coma Scale 3-15
  source: "philips_capsule" | "manual" | "portable";
}

// ── Primary Care specific (HEAL / Medicross) ──

export interface GPConsultation {
  consultationId: string;
  patientId: string;
  clinicName: string;
  clinicCode: string;
  date: string;
  practitioner: string;
  practitionerMPNumber: string; // HPCSA MP number
  chiefComplaint: string;
  clinicalNotes: string;
  diagnoses: DiagnosisEntry[];
  prescriptions: Prescription[];
  referrals: Referral[];
  followUpDate: string | null;
  billingCode: string;          // Tariff code
  consultationType: "general" | "chronic" | "dental" | "mental_health" | "antenatal" | "paediatric" | "minor_procedure";
}

export interface Prescription {
  medicationName: string;
  nappiCode: string;
  dosage: string;
  frequency: string;
  duration: string;
  repeats: number;
  isChronic: boolean;
  dispensedAt: string;
}

export interface Referral {
  referralId: string;
  referredTo: string;
  speciality: string;
  reason: string;
  urgency: "routine" | "urgent" | "emergency";
  referredToFacility: string;
  date: string;
}

export interface ClinicBooking {
  bookingId: string;
  patientId: string;
  clinicName: string;
  clinicCode: string;
  date: string;
  time: string;
  practitioner: string;
  service: string;
  status: "confirmed" | "cancelled" | "completed" | "no_show";
  source: "online" | "walkin" | "phone" | "whatsapp";
}

// ── FHIR R4 Resource types (for CareOn FHIR client) ──

export interface FHIRBundle<T> {
  resourceType: "Bundle";
  type: "searchset" | "collection";
  total: number;
  entry: { resource: T }[];
}

export interface FHIRMedicationRequest {
  resourceType: "MedicationRequest";
  id: string;
  status: "active" | "completed" | "stopped" | "cancelled";
  intent: "order" | "plan";
  medicationCodeableConcept: {
    coding: { system: string; code: string; display: string }[];
    text: string;
  };
  subject: { reference: string };
  dosageInstruction: {
    text: string;
    timing?: { repeat?: { frequency: number; period: number; periodUnit: string } };
    route?: { text: string };
  }[];
  authoredOn: string;
  requester: { display: string };
}
