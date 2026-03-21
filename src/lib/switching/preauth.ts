// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Pre-Authorization Engine — Request, track, and manage pre-auth with schemes
// Handles: elective procedures, hospital admissions, specialist referrals,
// MRI/CT scans, chronic medication applications
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { PreAuthRequest, PreAuthResponse, PreAuthStatus } from "./types";
import { routeClaim } from "./router";
import { isPMBCondition, isCDLCondition } from "../healthbridge/pmb";

// ─── Pre-Auth Rules (which procedures need pre-authorization) ──────────────

/** Procedure category identifiers for the 9 pre-auth categories */
export type PreAuthCategory =
  | "specialist_referral"
  | "mri_ct_scan"
  | "hospital_admission"
  | "surgery"
  | "physiotherapy"
  | "psychology"
  | "high_cost"
  | "chronic_medication"
  | "oncology";

interface PreAuthRule {
  /** CPT code patterns that require pre-auth */
  cptPatterns: string[];
  /** ICD-10 code patterns that require pre-auth */
  icd10Patterns?: string[];
  /** Always requires auth regardless of scheme */
  mandatory: boolean;
  /** Description */
  description: string;
  /** Estimated turnaround time */
  turnaroundDays: number;
  /** Category for grouping and reporting */
  category: PreAuthCategory;
  /** Session threshold — pre-auth needed only after this many sessions */
  sessionThreshold?: number;
}

/**
 * Comprehensive pre-auth rules covering ALL 9 procedure categories.
 * Based on standard SA medical aid scheme requirements.
 */
const PRE_AUTH_RULES: PreAuthRule[] = [
  // 1. Specialist Referrals
  {
    cptPatterns: ["0141", "0142", "0143", "0144", "0145", "0146", "0147", "0148", "0149"],
    mandatory: false,
    description: "Specialist referral — some schemes require pre-auth for specialist consultations",
    turnaroundDays: 1,
    category: "specialist_referral",
  },

  // 2. MRI/CT Scans
  {
    cptPatterns: ["0500", "0501", "0502", "0503", "0504", "0505"],
    mandatory: true,
    description: "MRI scans — all schemes require pre-auth",
    turnaroundDays: 2,
    category: "mri_ct_scan",
  },
  {
    cptPatterns: ["0510", "0511", "0512", "0513", "0514", "0515"],
    mandatory: true,
    description: "CT scans — all schemes require pre-auth",
    turnaroundDays: 2,
    category: "mri_ct_scan",
  },

  // 3. Hospital Admissions
  {
    cptPatterns: ["3600", "3601", "3602", "3603", "3604", "3605", "3610", "3611", "3612"],
    mandatory: true,
    description: "Hospital admission — all schemes require pre-auth (elective and planned)",
    turnaroundDays: 1,
    category: "hospital_admission",
  },

  // 4. Surgeries
  {
    cptPatterns: ["0800", "0801", "0802", "0803", "0804", "0805", "0810", "0811", "0820", "0821"],
    mandatory: true,
    description: "Surgical procedures — pre-auth required for all elective and planned surgeries",
    turnaroundDays: 3,
    category: "surgery",
  },

  // 5. Physiotherapy (>6 sessions)
  {
    cptPatterns: ["0600", "0601", "0602", "0603", "0604", "0605"],
    mandatory: false,
    description: "Physiotherapy — pre-auth required after 6 sessions per condition",
    turnaroundDays: 1,
    category: "physiotherapy",
    sessionThreshold: 6,
  },

  // 6. Psychology (>6 sessions)
  {
    cptPatterns: ["0700", "0701", "0702", "0703", "0710", "0711"],
    mandatory: false,
    description: "Psychology/Psychiatry — pre-auth required after 6 sessions per year",
    turnaroundDays: 2,
    category: "psychology",
    sessionThreshold: 6,
  },

  // 7. High-cost procedures (>R5,000) — handled via estimatedCost in checkPreAuthRequired

  // 8. Chronic Medication Initiation
  {
    cptPatterns: ["0191", "0193"], // GP consultations where chronic is initiated
    icd10Patterns: [
      "E10", "E11", // Diabetes
      "I10",        // Hypertension
      "J45",        // Asthma
      "E78",        // Hyperlipidaemia
      "I50",        // Cardiac failure
      "G40",        // Epilepsy
      "B20",        // HIV
      "F20",        // Schizophrenia
      "F31",        // Bipolar
      "H40",        // Glaucoma
      "J44",        // COPD
      "N18",        // Chronic renal
      "M05",        // Rheumatoid arthritis
      "G20",        // Parkinson's
      "E03",        // Hypothyroidism
      "E27.1",      // Addison's
      "I25",        // Coronary artery disease
      "I42",        // Cardiomyopathy
      "J47",        // Bronchiectasis
      "K50",        // Crohn's
      "E23.2",      // Diabetes insipidus
      "I49",        // Dysrhythmias
      "D66",        // Haemophilia
      "G35",        // Multiple sclerosis
      "K51",        // Ulcerative colitis
    ],
    mandatory: false,
    description: "Chronic medication initiation — CDL conditions require chronic authorization application",
    turnaroundDays: 5,
    category: "chronic_medication",
  },

  // 9. Oncology Treatment Plans
  {
    cptPatterns: ["0900", "0901", "0902", "0903", "0910", "0911", "0920"],
    icd10Patterns: [
      "C00", "C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09",
      "C10", "C11", "C12", "C13", "C14", "C15", "C16", "C17", "C18", "C19",
      "C20", "C21", "C22", "C23", "C24", "C25", "C26", "C30", "C31", "C32",
      "C33", "C34", "C37", "C38", "C39", "C40", "C41", "C43", "C44", "C45",
      "C46", "C47", "C48", "C49", "C50", "C51", "C52", "C53", "C54", "C55",
      "C56", "C57", "C58", "C60", "C61", "C62", "C63", "C64", "C65", "C66",
      "C67", "C68", "C69", "C70", "C71", "C72", "C73", "C74", "C75", "C76",
      "C77", "C78", "C79", "C80", "C81", "C82", "C83", "C84", "C85", "C86",
      "C88", "C90", "C91", "C92", "C93", "C94", "C95", "C96", "C97",
    ],
    mandatory: true,
    description: "Oncology treatment plan — all chemotherapy, radiation, and oncology procedures require pre-auth",
    turnaroundDays: 5,
    category: "oncology",
  },
];

// ─── Pre-Auth Checker ───────────────────────────────────────────────────────

export interface PreAuthCheck {
  required: boolean;
  reason: string;
  rules: string[];
  /** Which pre-auth categories were triggered */
  categories: PreAuthCategory[];
  estimatedTurnaroundDays: number;
  pmbExempt: boolean;
  cdlExempt: boolean;
  /** If PMB exempt, the specific PMB conditions found */
  pmbConditions: string[];
  /** If CDL, the chronic conditions found */
  cdlConditions: string[];
  /** Whether chronic medication authorization is needed (separate from procedure pre-auth) */
  chronicAuthRequired: boolean;
  /** Whether this is an oncology case requiring treatment plan auth */
  oncologyCase: boolean;
}

/**
 * Check if a procedure requires pre-authorization based on codes and scheme.
 * Covers all 9 procedure categories:
 * 1. Specialist referrals
 * 2. MRI/CT scans
 * 3. Hospital admissions
 * 4. Surgeries
 * 5. Physiotherapy (>6 sessions)
 * 6. Psychology (>6 sessions)
 * 7. High-cost procedures (>R5,000)
 * 8. Chronic medication initiation
 * 9. Oncology treatment plans
 *
 * Also checks PMB/CDL exemptions — if the diagnosis is a PMB condition,
 * pre-auth for treatment may not be required as the scheme MUST cover it.
 */
export function checkPreAuthRequired(data: {
  cptCodes: string[];
  icd10Codes: string[];
  scheme: string;
  estimatedCost: number;
  /** Number of sessions already used for physio/psych (optional) */
  sessionsUsed?: number;
  /** Whether this is a new chronic medication initiation */
  isChronicInitiation?: boolean;
}): PreAuthCheck {
  const matchedRules: PreAuthRule[] = [];
  const categories = new Set<PreAuthCategory>();
  let pmbExempt = false;
  let cdlExempt = false;
  const pmbConditions: string[] = [];
  const cdlConditions: string[] = [];
  let chronicAuthRequired = false;
  let oncologyCase = false;

  // Check PMB/CDL exemptions — PMB conditions must be treated regardless of auth
  for (const code of data.icd10Codes) {
    if (isPMBCondition(code)) {
      pmbExempt = true;
      pmbConditions.push(code);
    }
    const cdlResult = isCDLCondition(code);
    if (cdlResult.found) {
      cdlExempt = true;
      cdlConditions.push(`${code}: ${cdlResult.condition}`);
    }
  }

  // Check CPT codes against pre-auth rules
  for (const rule of PRE_AUTH_RULES) {
    let matched = false;

    // Match by CPT code — exact 4-digit match only (no prefix matching to avoid false positives)
    for (const cpt of data.cptCodes) {
      if (rule.cptPatterns.some(p => cpt === p)) {
        matched = true;
        break;
      }
    }

    // Match by ICD-10 code (for chronic medication and oncology)
    if (!matched && rule.icd10Patterns) {
      for (const icd of data.icd10Codes) {
        if (rule.icd10Patterns.some(p => icd.startsWith(p))) {
          matched = true;
          break;
        }
      }
    }

    if (matched) {
      // For session-threshold rules (physio/psych), only trigger if threshold exceeded
      if (rule.sessionThreshold && data.sessionsUsed !== undefined) {
        if (data.sessionsUsed < rule.sessionThreshold) {
          continue; // Under threshold — no pre-auth needed yet
        }
      }

      // For chronic medication, only trigger if explicitly flagged as initiation
      if (rule.category === "chronic_medication" && !data.isChronicInitiation) {
        // Still flag it but don't make it required
        chronicAuthRequired = cdlExempt; // CDL conditions need chronic auth application
        continue;
      }

      matchedRules.push(rule);
      categories.add(rule.category);

      if (rule.category === "oncology") {
        oncologyCase = true;
      }
    }
  }

  // 7. High-cost threshold — many schemes require pre-auth for amounts > R5,000 (500000 cents)
  const highCost = data.estimatedCost > 500_000;
  if (highCost && matchedRules.length === 0) {
    matchedRules.push({
      cptPatterns: [],
      mandatory: false,
      description: `High-cost procedure (R${(data.estimatedCost / 100).toFixed(2)}) — many schemes require pre-auth above R5,000`,
      turnaroundDays: 2,
      category: "high_cost",
    });
    categories.add("high_cost");
  }

  // If CDL condition detected and this looks like a chronic initiation visit, flag it
  if (cdlExempt && !chronicAuthRequired) {
    chronicAuthRequired = true;
  }

  const required = matchedRules.some(r => r.mandatory) || (matchedRules.length > 0 && !pmbExempt);
  const maxTurnaround = matchedRules.reduce((max, r) => Math.max(max, r.turnaroundDays), 0);

  // PMB exemption logic:
  // - For PMB conditions, the PROCEDURE itself may not need pre-auth (scheme must cover)
  // - BUT the scheme can still require notification/pre-auth for PLANNING purposes
  // - Oncology is always pre-auth even if PMB (for treatment plan approval)
  const pmbOverride = pmbExempt && !oncologyCase;

  return {
    required: pmbOverride ? false : required,
    reason: pmbOverride
      ? `PMB condition (${pmbConditions.join(", ")}) — pre-auth not required, scheme must cover at PMB level of care`
      : matchedRules.length > 0
        ? matchedRules.map(r => r.description).join("; ")
        : "No pre-authorization required for these procedures",
    rules: matchedRules.map(r => r.description),
    categories: [...categories],
    estimatedTurnaroundDays: maxTurnaround,
    pmbExempt,
    cdlExempt,
    pmbConditions,
    cdlConditions,
    chronicAuthRequired,
    oncologyCase,
  };
}

// ─── Pre-Auth Request Builder ───────────────────────────────────────────────

/**
 * Create a pre-authorization request ready for submission to the switch.
 */
export function createPreAuthRequest(data: {
  practiceId: string;
  bhfNumber: string;
  providerNumber: string;
  patientName: string;
  patientDob: string;
  patientIdNumber: string;
  membershipNumber: string;
  dependentCode: string;
  medicalAidScheme: string;
  icd10Codes: string[];
  cptCodes: string[];
  nappiCodes?: string[];
  procedureDescription: string;
  clinicalMotivation: string;
  urgency: "elective" | "urgent" | "emergency";
  estimatedCost: number;
  admissionDate?: string;
  dischargeDate?: string;
  facilityName?: string;
  facilityBhf?: string;
}): PreAuthRequest {
  const routing = routeClaim(data.medicalAidScheme);
  const now = new Date().toISOString();

  return {
    id: `PA-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ...data,
    status: "pending",
    switchProvider: routing.switchProvider,
    requestedAt: now,
    createdAt: now,
    updatedAt: now,
  };
}

// ─── Pre-Auth XML Builder (for switch submission) ───────────────────────────

export function buildPreAuthXML(request: PreAuthRequest): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<PreAuthorisationRequest xmlns="urn:healthos:preauth:v1">
  <Header>
    <TransactionType>PRE_AUTH_REQUEST</TransactionType>
    <Timestamp>${new Date().toISOString()}</Timestamp>
    <RequestId>${xmlEsc(request.id)}</RequestId>
    <PracticeNumber>${xmlEsc(request.bhfNumber)}</PracticeNumber>
    <Urgency>${request.urgency}</Urgency>
  </Header>
  <Provider>
    <ProviderNumber>${xmlEsc(request.providerNumber)}</ProviderNumber>
  </Provider>
  <Patient>
    <Name>${xmlEsc(request.patientName)}</Name>
    <DateOfBirth>${request.patientDob}</DateOfBirth>
    <IDNumber>${xmlEsc(request.patientIdNumber)}</IDNumber>
    <Scheme>${xmlEsc(request.medicalAidScheme)}</Scheme>
    <MembershipNumber>${xmlEsc(request.membershipNumber)}</MembershipNumber>
    <DependentCode>${xmlEsc(request.dependentCode)}</DependentCode>
  </Patient>
  <Clinical>
    <DiagnosisCodes>
      ${request.icd10Codes.map(c => `<ICD10>${xmlEsc(c)}</ICD10>`).join("\n      ")}
    </DiagnosisCodes>
    <ProcedureCodes>
      ${request.cptCodes.map(c => `<CPT>${xmlEsc(c)}</CPT>`).join("\n      ")}
    </ProcedureCodes>
    ${request.nappiCodes?.length ? `<MedicationCodes>
      ${request.nappiCodes.map(c => `<NAPPI>${xmlEsc(c)}</NAPPI>`).join("\n      ")}
    </MedicationCodes>` : ""}
    <ProcedureDescription>${xmlEsc(request.procedureDescription)}</ProcedureDescription>
    <ClinicalMotivation>${xmlEsc(request.clinicalMotivation)}</ClinicalMotivation>
    <EstimatedCost>${request.estimatedCost}</EstimatedCost>
  </Clinical>
  ${request.admissionDate ? `<Admission>
    <AdmissionDate>${request.admissionDate}</AdmissionDate>
    ${request.dischargeDate ? `<DischargeDate>${request.dischargeDate}</DischargeDate>` : ""}
    ${request.facilityName ? `<FacilityName>${xmlEsc(request.facilityName)}</FacilityName>` : ""}
    ${request.facilityBhf ? `<FacilityBHF>${xmlEsc(request.facilityBhf)}</FacilityBHF>` : ""}
  </Admission>` : ""}
</PreAuthorisationRequest>`;
}

// ─── Pre-Auth Response Parser ───────────────────────────────────────────────

export function parsePreAuthResponse(xml: string): PreAuthResponse {
  const transactionRef = extractXmlTag(xml, "TransactionRef") || `PA-RESP-${Date.now()}`;
  const statusRaw = extractXmlTag(xml, "AuthStatus") || extractXmlTag(xml, "Status") || "pending";
  const authNumber = extractXmlTag(xml, "AuthorisationNumber") || extractXmlTag(xml, "AuthNumber");
  const approvedAmt = extractXmlTag(xml, "ApprovedAmount");
  const approvedDays = extractXmlTag(xml, "ApprovedDays");
  const denialReason = extractXmlTag(xml, "DenialReason");
  const validFrom = extractXmlTag(xml, "ValidFrom");
  const validTo = extractXmlTag(xml, "ValidTo");

  const statusMap: Record<string, PreAuthStatus> = {
    approved: "approved",
    denied: "denied",
    pending: "pending",
    rejected: "denied",
    expired: "expired",
  };

  return {
    transactionRef,
    status: statusMap[statusRaw.toLowerCase()] || "pending",
    authorizationNumber: authNumber || undefined,
    approvedAmount: approvedAmt ? parseInt(approvedAmt, 10) : undefined,
    approvedDays: approvedDays ? parseInt(approvedDays, 10) : undefined,
    denialReason: denialReason || undefined,
    validFrom: validFrom || undefined,
    validTo: validTo || undefined,
    rawResponse: xml,
  };
}

// ─── Pre-Auth Status Tracking ───────────────────────────────────────────────

/**
 * Update a pre-auth request with a response from the switch.
 */
export function applyPreAuthResponse(
  request: PreAuthRequest,
  response: PreAuthResponse,
): PreAuthRequest {
  return {
    ...request,
    status: response.status,
    authorizationNumber: response.authorizationNumber,
    approvedAmount: response.approvedAmount,
    denialReason: response.denialReason,
    validFrom: response.validFrom,
    validTo: response.validTo,
    switchTransactionRef: response.transactionRef,
    respondedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Check if a pre-auth is still valid (not expired).
 */
export function isPreAuthValid(request: PreAuthRequest): boolean {
  if (request.status !== "approved") return false;
  if (!request.validTo) return true;
  return new Date(request.validTo) > new Date();
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function xmlEsc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function extractXmlTag(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`));
  return match ? match[1].trim() : null;
}
