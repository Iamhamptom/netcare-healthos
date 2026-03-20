// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Pre-Authorization Engine — Request, track, and manage pre-auth with schemes
// Handles: elective procedures, hospital admissions, specialist referrals,
// MRI/CT scans, chronic medication applications
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { PreAuthRequest, PreAuthResponse, PreAuthStatus } from "./types";
import { routeClaim } from "./router";
import { isPMBCondition, isCDLCondition } from "../healthbridge/pmb";

// ─── Pre-Auth Rules (which procedures need pre-authorization) ──────────────

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
}

const PRE_AUTH_RULES: PreAuthRule[] = [
  {
    cptPatterns: ["0141", "0142", "0143", "0144", "0145", "0146", "0147", "0148", "0149"],
    mandatory: false,
    description: "Specialist consultations — some schemes require pre-auth",
    turnaroundDays: 1,
  },
  {
    cptPatterns: ["0500", "0501", "0502", "0503", "0504", "0505"],
    mandatory: true,
    description: "MRI scans — all schemes require pre-auth",
    turnaroundDays: 2,
  },
  {
    cptPatterns: ["0510", "0511", "0512", "0513", "0514", "0515"],
    mandatory: true,
    description: "CT scans — all schemes require pre-auth",
    turnaroundDays: 2,
  },
  {
    cptPatterns: ["3600", "3601", "3602", "3603", "3604", "3605"],
    mandatory: true,
    description: "Hospital admission — all schemes require pre-auth",
    turnaroundDays: 1,
  },
  {
    cptPatterns: ["0800", "0801", "0802", "0803"],
    mandatory: true,
    description: "Surgical procedures — pre-auth required",
    turnaroundDays: 3,
  },
  {
    cptPatterns: ["0600", "0601", "0602"],
    mandatory: false,
    description: "Physiotherapy — some schemes require pre-auth after 6 visits",
    turnaroundDays: 1,
  },
  {
    cptPatterns: ["0700", "0701"],
    mandatory: false,
    description: "Psychology/Psychiatry — some schemes require pre-auth",
    turnaroundDays: 2,
  },
];

// ─── Pre-Auth Checker ───────────────────────────────────────────────────────

export interface PreAuthCheck {
  required: boolean;
  reason: string;
  rules: string[];
  estimatedTurnaroundDays: number;
  pmbExempt: boolean;
  cdlExempt: boolean;
}

/**
 * Check if a procedure requires pre-authorization based on codes and scheme.
 */
export function checkPreAuthRequired(data: {
  cptCodes: string[];
  icd10Codes: string[];
  scheme: string;
  estimatedCost: number;
}): PreAuthCheck {
  const matchedRules: PreAuthRule[] = [];
  let pmbExempt = false;
  let cdlExempt = false;

  // Check PMB/CDL exemptions — PMB conditions must be treated regardless of auth
  for (const code of data.icd10Codes) {
    if (isPMBCondition(code)) {
      pmbExempt = true;
    }
    if (isCDLCondition(code).found) {
      cdlExempt = true;
    }
  }

  // Check CPT codes against pre-auth rules
  for (const rule of PRE_AUTH_RULES) {
    for (const cpt of data.cptCodes) {
      if (rule.cptPatterns.some(p => cpt.startsWith(p.slice(0, 2)) || cpt === p)) {
        matchedRules.push(rule);
        break;
      }
    }
  }

  // High-cost threshold — many schemes require pre-auth for amounts > R5,000
  const highCost = data.estimatedCost > 500000;
  if (highCost && matchedRules.length === 0) {
    matchedRules.push({
      cptPatterns: [],
      mandatory: false,
      description: `High-cost procedure (R${(data.estimatedCost / 100).toFixed(2)}) — many schemes require pre-auth above R5,000`,
      turnaroundDays: 2,
    });
  }

  const required = matchedRules.some(r => r.mandatory) || (matchedRules.length > 0 && !pmbExempt);
  const maxTurnaround = matchedRules.reduce((max, r) => Math.max(max, r.turnaroundDays), 0);

  return {
    required: required && !pmbExempt,
    reason: pmbExempt
      ? "PMB condition — pre-auth not required (scheme must cover)"
      : matchedRules.length > 0
        ? matchedRules.map(r => r.description).join("; ")
        : "No pre-authorization required for these procedures",
    rules: matchedRules.map(r => r.description),
    estimatedTurnaroundDays: maxTurnaround,
    pmbExempt,
    cdlExempt,
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
