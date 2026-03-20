/**
 * HEAL EMR Adapter — Medicross Primary Care Bridge
 *
 * HEAL is Netcare's primary care EMR, built by A2D24/Netcare Digital.
 * - Deployed at 88 Medicross medical & dental clinics
 * - BCX Digital Innovation Awards winner
 * - Modules: clinical notes, billing, pathology integration, consent, medication safety
 *
 * API specifications are not yet published (A2D24 proprietary).
 * This adapter defines a clean interface ready for when access is granted.
 * Currently stubbed with realistic Medicross clinic data.
 *
 * CRITICAL CONTEXT: CareOn (hospitals) and HEAL (Medicross) are siloed.
 * A patient seen at Medicross GP who is then admitted to Netcare hospital
 * has ZERO data continuity today. Our adapter + CareOn adapter bridge this gap
 * via the shared UnifiedPatientRecord type (linked by SA ID number).
 */

import { logger } from "@/lib/logger";
import type {
  UnifiedPatientRecord,
  GPConsultation,
  ClinicBooking,
  Prescription,
  Referral,
  DiagnosisEntry,
  PatientDemographics,
  MedicalAidInfo,
  Allergy,
  Medication,
} from "../types";

// ── Configuration ──

export interface HEALConfig {
  /** HEAL API base URL (to be provided by A2D24) */
  apiBaseUrl: string;
  /** OAuth2 client ID */
  clientId: string;
  /** OAuth2 client secret */
  clientSecret: string;
  /** Scopes required */
  scopes: string[];
  /** Request timeout in ms */
  timeoutMs: number;
}

const DEFAULT_CONFIG: HEALConfig = {
  apiBaseUrl: process.env.HEAL_API_URL ?? "https://heal-api.netcare.co.za/v1",
  clientId: process.env.HEAL_CLIENT_ID ?? "",
  clientSecret: process.env.HEAL_CLIENT_SECRET ?? "",
  scopes: ["patient.read", "consultation.read", "booking.read", "patient.write"],
  timeoutMs: 10000,
};

// ── HEAL REST Client (stubbed) ──

class HEALClient {
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(private config: HEALConfig) {}

  /** Authenticate via OAuth2 client credentials flow */
  private async authenticate(): Promise<void> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) return;

    console.log("[heal] Authenticating with HEAL OAuth2...");

    // STUB: In production:
    // const res = await fetch(`${this.config.apiBaseUrl}/oauth/token`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/x-www-form-urlencoded" },
    //   body: new URLSearchParams({
    //     grant_type: "client_credentials",
    //     client_id: this.config.clientId,
    //     client_secret: this.config.clientSecret,
    //     scope: this.config.scopes.join(" "),
    //   }),
    // });
    // const data = await res.json();
    // this.accessToken = data.access_token;
    // this.tokenExpiresAt = Date.now() + (data.expires_in * 1000) - 60000;

    this.accessToken = "mock-token";
    this.tokenExpiresAt = Date.now() + 3600000;
  }

  /** Make an authenticated GET request */
  async get<T>(path: string, params?: Record<string, string>): Promise<T | null> {
    await this.authenticate();
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    const url = `${this.config.apiBaseUrl}${path}${query}`;
    logger.info(`[heal] GET ${url}`);

    // STUB: In production:
    // const res = await fetch(url, {
    //   headers: {
    //     Authorization: `Bearer ${this.accessToken}`,
    //     Accept: "application/json",
    //   },
    //   signal: AbortSignal.timeout(this.config.timeoutMs),
    // });
    // if (!res.ok) return null;
    // return res.json() as T;

    return null;
  }

  /** Make an authenticated POST request */
  async post<T>(path: string, body: unknown): Promise<T | null> {
    await this.authenticate();
    const url = `${this.config.apiBaseUrl}${path}`;
    logger.info(`[heal] POST ${url}`);

    // STUB: In production:
    // const res = await fetch(url, {
    //   method: "POST",
    //   headers: {
    //     Authorization: `Bearer ${this.accessToken}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(body),
    //   signal: AbortSignal.timeout(this.config.timeoutMs),
    // });
    // if (!res.ok) return null;
    // return res.json() as T;

    return null;
  }
}

// ── HEAL Adapter ──

export class HEALAdapter {
  private client: HEALClient;
  private config: HEALConfig;
  private useMocks: boolean;

  constructor(config: Partial<HEALConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.client = new HEALClient(this.config);
    this.useMocks = !this.config.clientId || process.env.DEMO_MODE === "true";

    if (this.useMocks) {
      console.log("[heal] Running in MOCK mode — no live HEAL/A2D24 connection");
    } else {
      logger.info(`[heal] Connecting to ${this.config.apiBaseUrl}`);
    }
  }

  // ── Patient Demographics ──

  async getPatient(patientId: string): Promise<UnifiedPatientRecord | null> {
    logger.info(`[heal] getPatient(${patientId})`);

    if (!this.useMocks) {
      const data = await this.client.get<UnifiedPatientRecord>(`/patients/${patientId}`);
      return data;
    }

    const mock = MOCK_HEAL_PATIENTS[patientId];
    if (!mock) {
      logger.info(`[heal] Patient ${patientId} not found`);
      return null;
    }
    return mock;
  }

  // ── GP Consultations ──

  async getConsultations(patientId: string): Promise<GPConsultation[]> {
    logger.info(`[heal] getConsultations(${patientId})`);

    if (!this.useMocks) {
      const data = await this.client.get<{ consultations: GPConsultation[] }>(
        `/patients/${patientId}/consultations`,
        { _sort: "-date", _count: "20" },
      );
      return data?.consultations ?? [];
    }

    return MOCK_CONSULTATIONS[patientId] ?? [];
  }

  // ── Appointment Bookings ──

  async getBookings(patientId: string): Promise<ClinicBooking[]> {
    logger.info(`[heal] getBookings(${patientId})`);

    if (!this.useMocks) {
      const data = await this.client.get<{ bookings: ClinicBooking[] }>(
        `/patients/${patientId}/bookings`,
        { _sort: "-date", _count: "20" },
      );
      return data?.bookings ?? [];
    }

    return MOCK_BOOKINGS[patientId] ?? [];
  }

  // ── Sync Patient Data (bidirectional push/pull) ──

  async syncPatient(patientId: string): Promise<{
    success: boolean;
    direction: "push" | "pull" | "both";
    recordsUpdated: number;
    conflicts: string[];
  }> {
    logger.info(`[heal] syncPatient(${patientId})`);

    if (!this.useMocks) {
      // In production: POST to HEAL sync endpoint
      const data = await this.client.post<{
        success: boolean;
        direction: "push" | "pull" | "both";
        recordsUpdated: number;
        conflicts: string[];
      }>(`/patients/${patientId}/sync`, {
        source: "healthos",
        timestamp: new Date().toISOString(),
      });
      return data ?? { success: false, direction: "pull", recordsUpdated: 0, conflicts: ["API unavailable"] };
    }

    // Mock: simulate a successful pull sync
    const patient = MOCK_HEAL_PATIENTS[patientId];
    if (!patient) {
      return { success: false, direction: "pull", recordsUpdated: 0, conflicts: ["Patient not found in HEAL"] };
    }

    logger.info(`[heal] Patient synced:`, { patientId });
    return {
      success: true,
      direction: "both",
      recordsUpdated: 3,
      conflicts: [],
    };
  }

  // ── Map to Unified Patient Record ──

  async toUnifiedRecord(patientId: string): Promise<UnifiedPatientRecord | null> {
    const patient = await this.getPatient(patientId);
    if (!patient) return null;

    // Enrich with consultation-derived medications
    const consultations = await this.getConsultations(patientId);
    const activeMeds: Medication[] = [];
    for (const consult of consultations) {
      for (const rx of consult.prescriptions) {
        if (rx.isChronic || new Date(consult.date) > new Date(Date.now() - 90 * 24 * 3600 * 1000)) {
          activeMeds.push({
            name: rx.medicationName,
            nappiCode: rx.nappiCode,
            dosage: rx.dosage,
            frequency: rx.frequency,
            route: "Oral",
            prescribedDate: consult.date,
            prescribedBy: consult.practitioner,
            active: true,
          });
        }
      }
    }

    // Merge (deduplicate by NAPPI code)
    const existingNappi = new Set(patient.medications.map((m) => m.nappiCode));
    for (const med of activeMeds) {
      if (!existingNappi.has(med.nappiCode)) {
        patient.medications.push(med);
        existingNappi.add(med.nappiCode);
      }
    }

    return patient;
  }

  // ── Find patient by SA ID (cross-system lookup) ──

  async findBySaId(saIdNumber: string): Promise<UnifiedPatientRecord | null> {
    logger.info(`[heal] findBySaId(${saIdNumber})`);

    if (!this.useMocks) {
      const data = await this.client.get<{ patients: UnifiedPatientRecord[] }>(
        "/patients",
        { sa_id: saIdNumber },
      );
      return data?.patients?.[0] ?? null;
    }

    // Search mock data by SA ID
    for (const patient of Object.values(MOCK_HEAL_PATIENTS)) {
      if (patient.saIdNumber === saIdNumber) return patient;
    }
    return null;
  }
}

// ══════════════════════════════════════════════════════════════════
// MOCK DATA — Realistic Medicross primary care data
// ══════════════════════════════════════════════════════════════════

const MOCK_HEAL_PATIENTS: Record<string, UnifiedPatientRecord> = {
  "MC-10001": {
    source: "heal",
    sourceId: "MC-10001",
    saIdNumber: "8501015800085", // SAME as CareOn MRN-001 (Sipho Mthembu) — this is the bridge!
    demographics: {
      firstName: "Sipho",
      lastName: "Mthembu",
      dateOfBirth: "1985-01-01",
      gender: "male",
      phone: "+27821234567",
      email: "sipho.mthembu@gmail.com",
      address: "42 Rivonia Road, Sandton, Gauteng, 2196",
    },
    allergies: [
      { substance: "Penicillin", reaction: "Anaphylaxis", severity: "life-threatening", recordedDate: "2019-03-15", source: "heal" },
    ],
    medications: [
      {
        name: "Amlodipine 5mg",
        nappiCode: "714259001",
        dosage: "5mg",
        frequency: "Once daily",
        route: "Oral",
        prescribedDate: "2025-06-15",
        prescribedBy: "Dr. S. Pillay",
        active: true,
      },
    ],
    medicalAid: {
      schemeName: "Discovery Health",
      planName: "Classic Comprehensive",
      memberNumber: "DH-10284756",
      dependantCode: "00",
      status: "active",
    },
    lastSyncedAt: new Date().toISOString(),
  },
  "MC-10002": {
    source: "heal",
    sourceId: "MC-10002",
    saIdNumber: "9505230100086",
    demographics: {
      firstName: "Thandiwe",
      lastName: "Dlamini",
      dateOfBirth: "1995-05-23",
      gender: "female",
      phone: "+27845556677",
      email: "thandi.dlamini@yahoo.com",
      address: "7 Nelson Mandela Drive, Midrand, Gauteng, 1685",
    },
    allergies: [],
    medications: [
      {
        name: "Yasmin (Drospirenone/Ethinyl Estradiol)",
        nappiCode: "711203001",
        dosage: "1 tablet",
        frequency: "Once daily",
        route: "Oral",
        prescribedDate: "2025-12-01",
        prescribedBy: "Dr. N. Govender",
        active: true,
      },
    ],
    medicalAid: {
      schemeName: "Discovery Health",
      planName: "KeyCare Plus",
      memberNumber: "DH-20983764",
      dependantCode: "02",
      status: "active",
    },
    lastSyncedAt: new Date().toISOString(),
  },
  "MC-10003": {
    source: "heal",
    sourceId: "MC-10003",
    saIdNumber: "5812045800082",
    demographics: {
      firstName: "Johannes",
      lastName: "Pretorius",
      dateOfBirth: "1958-12-04",
      gender: "male",
      phone: "+27726669988",
      email: "johan.pretorius@telkomsa.net",
      address: "33 Voortrekker Road, Parow, Western Cape, 7500",
      nextOfKin: "Marie Pretorius",
      nextOfKinPhone: "+27821113344",
    },
    allergies: [
      { substance: "ACE Inhibitors", reaction: "Angioedema", severity: "severe", recordedDate: "2018-05-22", source: "heal" },
      { substance: "Aspirin", reaction: "Bronchospasm", severity: "severe", recordedDate: "2020-08-14", source: "heal" },
    ],
    medications: [
      {
        name: "Losartan 50mg",
        nappiCode: "715001001",
        dosage: "50mg",
        frequency: "Once daily",
        route: "Oral",
        prescribedDate: "2024-03-10",
        prescribedBy: "Dr. J. Swanepoel",
        active: true,
      },
      {
        name: "Glucophage (Metformin) 500mg",
        nappiCode: "710855002",
        dosage: "500mg",
        frequency: "Twice daily with meals",
        route: "Oral",
        prescribedDate: "2023-09-15",
        prescribedBy: "Dr. J. Swanepoel",
        active: true,
      },
      {
        name: "Simvastatin 20mg",
        nappiCode: "713450001",
        dosage: "20mg",
        frequency: "Once daily at bedtime",
        route: "Oral",
        prescribedDate: "2024-03-10",
        prescribedBy: "Dr. J. Swanepoel",
        active: true,
      },
    ],
    medicalAid: {
      schemeName: "Medihelp",
      planName: "MedElect",
      memberNumber: "MH-334455",
      dependantCode: "00",
      status: "active",
    },
    lastSyncedAt: new Date().toISOString(),
  },
  "MC-10004": {
    source: "heal",
    sourceId: "MC-10004",
    saIdNumber: "0108150200084",
    demographics: {
      firstName: "Amahle",
      lastName: "Ngcobo",
      dateOfBirth: "2001-08-15",
      gender: "female",
      phone: "+27637778899",
      email: "amahle.n@gmail.com",
      address: "21 Umgeni Road, Durban North, KZN, 4051",
    },
    allergies: [
      { substance: "Erythromycin", reaction: "Nausea", severity: "mild", recordedDate: "2023-02-10", source: "heal" },
    ],
    medications: [],
    medicalAid: null,
    lastSyncedAt: new Date().toISOString(),
  },
};

const MOCK_CONSULTATIONS: Record<string, GPConsultation[]> = {
  "MC-10001": [
    {
      consultationId: "CON-2026-001",
      patientId: "MC-10001",
      clinicName: "Medicross Sandton",
      clinicCode: "MCX-SAND",
      date: "2026-03-05",
      practitioner: "Dr. S. Pillay",
      practitionerMPNumber: "MP-0456789",
      chiefComplaint: "Right lower abdominal pain x 2 days, worsening",
      clinicalNotes: "Patient presents with RLQ tenderness, guarding. McBurney's point positive. Low-grade pyrexia 37.8C. Rebound tenderness present. Suspect acute appendicitis. Referred to Netcare Milpark for surgical evaluation.",
      diagnoses: [
        { code: "R10.3", description: "Pain localised to other parts of lower abdomen", type: "working", isPrimary: true },
        { code: "K35.80", description: "Acute appendicitis, other and unspecified", type: "working", isPrimary: false },
      ],
      prescriptions: [
        {
          medicationName: "Buscopan (Hyoscine) 10mg",
          nappiCode: "700502001",
          dosage: "10mg",
          frequency: "Three times daily",
          duration: "3 days",
          repeats: 0,
          isChronic: false,
          dispensedAt: "Medicross Sandton Pharmacy",
        },
      ],
      referrals: [
        {
          referralId: "REF-2026-001",
          referredTo: "Dr. R. Naidoo",
          speciality: "General Surgery",
          reason: "Suspected acute appendicitis — surgical assessment required",
          urgency: "urgent",
          referredToFacility: "Netcare Milpark Hospital",
          date: "2026-03-05",
        },
      ],
      followUpDate: "2026-03-20",
      billingCode: "0190",
      consultationType: "general",
    },
    {
      consultationId: "CON-2025-089",
      patientId: "MC-10001",
      clinicName: "Medicross Sandton",
      clinicCode: "MCX-SAND",
      date: "2025-12-10",
      practitioner: "Dr. S. Pillay",
      practitionerMPNumber: "MP-0456789",
      chiefComplaint: "Routine hypertension follow-up",
      clinicalNotes: "BP well controlled on Amlodipine 5mg. 134/82. BMI 27.3. Lifestyle advice given — reduce salt, increase exercise. Continue current medication. Bloods: FBC, U&E, lipids ordered.",
      diagnoses: [
        { code: "I10", description: "Essential hypertension", type: "final", isPrimary: true },
      ],
      prescriptions: [
        {
          medicationName: "Amlodipine 5mg",
          nappiCode: "714259001",
          dosage: "5mg",
          frequency: "Once daily",
          duration: "6 months",
          repeats: 5,
          isChronic: true,
          dispensedAt: "Medicross Sandton Pharmacy",
        },
      ],
      referrals: [],
      followUpDate: "2026-06-10",
      billingCode: "0191",
      consultationType: "chronic",
    },
  ],
  "MC-10002": [
    {
      consultationId: "CON-2026-032",
      patientId: "MC-10002",
      clinicName: "Medicross Midrand",
      clinicCode: "MCX-MIDR",
      date: "2026-02-14",
      practitioner: "Dr. N. Govender",
      practitionerMPNumber: "MP-0567890",
      chiefComplaint: "Sore throat, fever x 3 days",
      clinicalNotes: "Pharyngeal erythema, tonsillar exudate bilateral. No trismus. Centor score 3/4. Rapid strep test positive. Started on Amoxicillin (patient not allergic to penicillin). Advised rest and fluids.",
      diagnoses: [
        { code: "J02.0", description: "Streptococcal pharyngitis", type: "final", isPrimary: true },
      ],
      prescriptions: [
        {
          medicationName: "Amoxicillin 500mg",
          nappiCode: "708650001",
          dosage: "500mg",
          frequency: "Three times daily",
          duration: "10 days",
          repeats: 0,
          isChronic: false,
          dispensedAt: "Medicross Midrand Pharmacy",
        },
        {
          medicationName: "Panado (Paracetamol) 500mg",
          nappiCode: "700403001",
          dosage: "1000mg",
          frequency: "Four hourly as needed",
          duration: "5 days",
          repeats: 0,
          isChronic: false,
          dispensedAt: "Medicross Midrand Pharmacy",
        },
      ],
      referrals: [],
      followUpDate: null,
      billingCode: "0190",
      consultationType: "general",
    },
  ],
  "MC-10003": [
    {
      consultationId: "CON-2026-044",
      patientId: "MC-10003",
      clinicName: "Medicross Parow",
      clinicCode: "MCX-PARW",
      date: "2026-03-01",
      practitioner: "Dr. J. Swanepoel",
      practitionerMPNumber: "MP-0345678",
      chiefComplaint: "Chronic disease management — diabetes, hypertension",
      clinicalNotes: "HbA1c 7.8% (target <7%). BP 145/92, not at target. Increased Losartan to 100mg (patient allergic to ACE inhibitors). Discussed diet compliance — patient admits poor adherence over festive season. Added Gliclazide 80mg. Foot exam normal, no neuropathy. Ophthalmology review booked.",
      diagnoses: [
        { code: "E11.65", description: "Type 2 diabetes mellitus with hyperglycaemia", type: "final", isPrimary: true },
        { code: "I10", description: "Essential hypertension", type: "final", isPrimary: false },
      ],
      prescriptions: [
        {
          medicationName: "Losartan 100mg",
          nappiCode: "715001002",
          dosage: "100mg",
          frequency: "Once daily",
          duration: "6 months",
          repeats: 5,
          isChronic: true,
          dispensedAt: "Medicross Parow Pharmacy",
        },
        {
          medicationName: "Glucophage (Metformin) 500mg",
          nappiCode: "710855002",
          dosage: "500mg",
          frequency: "Twice daily with meals",
          duration: "6 months",
          repeats: 5,
          isChronic: true,
          dispensedAt: "Medicross Parow Pharmacy",
        },
        {
          medicationName: "Gliclazide 80mg",
          nappiCode: "712340001",
          dosage: "80mg",
          frequency: "Once daily before breakfast",
          duration: "6 months",
          repeats: 5,
          isChronic: true,
          dispensedAt: "Medicross Parow Pharmacy",
        },
        {
          medicationName: "Simvastatin 20mg",
          nappiCode: "713450001",
          dosage: "20mg",
          frequency: "Once daily at bedtime",
          duration: "6 months",
          repeats: 5,
          isChronic: true,
          dispensedAt: "Medicross Parow Pharmacy",
        },
      ],
      referrals: [
        {
          referralId: "REF-2026-010",
          referredTo: "Dr. P. Abrahams",
          speciality: "Ophthalmology",
          reason: "Annual diabetic eye screening — last done March 2025",
          urgency: "routine",
          referredToFacility: "Netcare N1 City Hospital",
          date: "2026-03-01",
        },
      ],
      followUpDate: "2026-06-01",
      billingCode: "0191",
      consultationType: "chronic",
    },
    {
      consultationId: "CON-2025-156",
      patientId: "MC-10003",
      clinicName: "Medicross Parow",
      clinicCode: "MCX-PARW",
      date: "2025-09-05",
      practitioner: "Dr. J. Swanepoel",
      practitionerMPNumber: "MP-0345678",
      chiefComplaint: "Annual diabetic check-up",
      clinicalNotes: "HbA1c 7.2% — improved from 7.9% in March. BP 138/88. Creatinine 92, eGFR 78. Lipids acceptable on Simvastatin. Continue current regimen. Well done on diet improvement.",
      diagnoses: [
        { code: "E11.9", description: "Type 2 diabetes mellitus without complications", type: "final", isPrimary: true },
        { code: "I10", description: "Essential hypertension", type: "final", isPrimary: false },
      ],
      prescriptions: [
        {
          medicationName: "Losartan 50mg",
          nappiCode: "715001001",
          dosage: "50mg",
          frequency: "Once daily",
          duration: "6 months",
          repeats: 5,
          isChronic: true,
          dispensedAt: "Medicross Parow Pharmacy",
        },
      ],
      referrals: [],
      followUpDate: "2026-03-01",
      billingCode: "0191",
      consultationType: "chronic",
    },
  ],
  "MC-10004": [
    {
      consultationId: "CON-2026-055",
      patientId: "MC-10004",
      clinicName: "Medicross Umhlanga",
      clinicCode: "MCX-UMHL",
      date: "2026-03-12",
      practitioner: "Dr. K. Moodley",
      practitionerMPNumber: "MP-0678901",
      chiefComplaint: "Dental check-up and cleaning",
      clinicalNotes: "Routine dental examination. No caries detected. Mild calculus upper molars — scaling and polish done. Gum health good. Advised flossing.",
      diagnoses: [
        { code: "Z01.2", description: "Dental examination", type: "final", isPrimary: true },
      ],
      prescriptions: [],
      referrals: [],
      followUpDate: "2026-09-12",
      billingCode: "8101",
      consultationType: "dental",
    },
    {
      consultationId: "CON-2026-019",
      patientId: "MC-10004",
      clinicName: "Medicross Umhlanga",
      clinicCode: "MCX-UMHL",
      date: "2026-01-20",
      practitioner: "Dr. A. Maharaj",
      practitionerMPNumber: "MP-0789012",
      chiefComplaint: "Skin rash on forearms x 1 week",
      clinicalNotes: "Erythematous papular rash, bilateral forearms. No systemic symptoms. Contact history — new detergent. Likely allergic contact dermatitis. Advised to change detergent. Prescribed topical corticosteroid.",
      diagnoses: [
        { code: "L23.9", description: "Allergic contact dermatitis, unspecified cause", type: "final", isPrimary: true },
      ],
      prescriptions: [
        {
          medicationName: "Betamethasone 0.1% cream",
          nappiCode: "701200001",
          dosage: "Thin layer",
          frequency: "Twice daily",
          duration: "14 days",
          repeats: 0,
          isChronic: false,
          dispensedAt: "Medicross Umhlanga Pharmacy",
        },
      ],
      referrals: [],
      followUpDate: "2026-02-03",
      billingCode: "0190",
      consultationType: "general",
    },
  ],
};

const MOCK_BOOKINGS: Record<string, ClinicBooking[]> = {
  "MC-10001": [
    {
      bookingId: "BK-2026-001",
      patientId: "MC-10001",
      clinicName: "Medicross Sandton",
      clinicCode: "MCX-SAND",
      date: "2026-03-20",
      time: "09:30",
      practitioner: "Dr. S. Pillay",
      service: "Post-surgical follow-up",
      status: "confirmed",
      source: "phone",
    },
    {
      bookingId: "BK-2026-002",
      patientId: "MC-10001",
      clinicName: "Medicross Sandton",
      clinicCode: "MCX-SAND",
      date: "2026-03-05",
      time: "08:00",
      practitioner: "Dr. S. Pillay",
      service: "General consultation",
      status: "completed",
      source: "online",
    },
  ],
  "MC-10002": [
    {
      bookingId: "BK-2026-010",
      patientId: "MC-10002",
      clinicName: "Medicross Midrand",
      clinicCode: "MCX-MIDR",
      date: "2026-02-14",
      time: "10:00",
      practitioner: "Dr. N. Govender",
      service: "General consultation",
      status: "completed",
      source: "whatsapp",
    },
  ],
  "MC-10003": [
    {
      bookingId: "BK-2026-020",
      patientId: "MC-10003",
      clinicName: "Medicross Parow",
      clinicCode: "MCX-PARW",
      date: "2026-06-01",
      time: "08:30",
      practitioner: "Dr. J. Swanepoel",
      service: "Chronic disease management",
      status: "confirmed",
      source: "phone",
    },
    {
      bookingId: "BK-2026-021",
      patientId: "MC-10003",
      clinicName: "Medicross Parow",
      clinicCode: "MCX-PARW",
      date: "2026-03-01",
      time: "08:30",
      practitioner: "Dr. J. Swanepoel",
      service: "Chronic disease management",
      status: "completed",
      source: "phone",
    },
  ],
  "MC-10004": [
    {
      bookingId: "BK-2026-030",
      patientId: "MC-10004",
      clinicName: "Medicross Umhlanga",
      clinicCode: "MCX-UMHL",
      date: "2026-09-12",
      time: "14:00",
      practitioner: "Dr. K. Moodley",
      service: "Dental check-up",
      status: "confirmed",
      source: "online",
    },
    {
      bookingId: "BK-2026-031",
      patientId: "MC-10004",
      clinicName: "Medicross Umhlanga",
      clinicCode: "MCX-UMHL",
      date: "2026-03-12",
      time: "14:00",
      practitioner: "Dr. K. Moodley",
      service: "Dental check-up and cleaning",
      status: "completed",
      source: "online",
    },
    {
      bookingId: "BK-2026-032",
      patientId: "MC-10004",
      clinicName: "Medicross Umhlanga",
      clinicCode: "MCX-UMHL",
      date: "2026-01-20",
      time: "11:00",
      practitioner: "Dr. A. Maharaj",
      service: "General consultation",
      status: "completed",
      source: "walkin",
    },
  ],
};

export default HEALAdapter;
