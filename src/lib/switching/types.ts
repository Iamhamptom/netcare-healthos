// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Unified Medical Aid Switching Types
// Covers: EDIFACT MEDCLM, XML protocols, multi-switch routing, pre-auth,
// batch processing, eRA parsing, vendor accreditation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── Switch Providers ──────────────────────────────────────────────────────

export type SwitchProvider = "healthbridge" | "medikredit" | "switchon" | "direct";
export type SwitchProtocol = "edifact" | "xml" | "rest";

export interface SwitchConfig {
  provider: SwitchProvider;
  protocol: SwitchProtocol;
  endpoint: string;
  username: string;
  password: string;
  bhfNumber: string;
  vendorId: string;
  vendorName: string;
  vendorVersion: string;
  sandbox: boolean;
  /** Timeout in ms for switch requests */
  timeout: number;
  /** TLS certificate path (for VPN/mutual TLS connections) */
  tlsCertPath?: string;
  tlsKeyPath?: string;
}

// ─── EDIFACT MEDCLM Types (PHISC Spec v0:912:ZA) ──────────────────────────

export interface EDIFACTMessage {
  /** UNH — Message type identifier */
  messageRef: string;
  messageType: "MEDCLM:0:912:ZA";
  /** BGM — Batch number (18 digits zero-filled) */
  batchNumber: string;
  transactionDate: string; // CCYYMMDD
  /** DCR — Document correction type */
  correctionType?: "ADJ" | "ADD" | "REV" | "RSV";
  /** DTM segments */
  dates: EDIFACTDate[];
  /** NAD segments — parties */
  parties: EDIFACTParty[];
  /** Group 2 — Line items */
  lineItems: EDIFACTLineItem[];
  /** Raw EDIFACT string */
  raw?: string;
}

export interface EDIFACTDate {
  qualifier: string; // 194=admission, 96=discharge, 155=period start, 156=period end, 290=IOD date
  date: string; // CCYYMMDD or CCYYMMDDHHMM
  format: "102" | "203"; // 102=CCYYMMDD, 203=CCYYMMDDHHMM
}

export interface EDIFACTParty {
  qualifier: string; // SUP=supplier, MPN=medical plan, MSN=membership, SCH=scheme, TDN=treating doctor, REG=SAMDC
  identifier: string;
  name?: string;
  address?: string;
}

export interface EDIFACTLineItem {
  lineNumber: number;
  /** LIN — Tariff code (NRPL/CPT 4-digit) */
  tariffCode: string;
  /** NAPPI code (for medicines/consumables) */
  nappiCode?: string;
  /** RFF+ICD — ICD-10 diagnosis codes */
  icd10Codes: string[];
  /** MOA — Amount in ZAR cents (two implied decimal places) */
  amount: number;
  /** Quantity */
  quantity: number;
  /** TAX — VAT amount */
  vatAmount?: number;
  /** PAT — Discount */
  discount?: number;
  /** Modifier codes */
  modifiers?: string[];
  description?: string;
}

// ─── Pre-Authorization ─────────────────────────────────────────────────────

export type PreAuthStatus = "pending" | "approved" | "denied" | "expired" | "cancelled";

export interface PreAuthRequest {
  id: string;
  practiceId: string;
  bhfNumber: string;
  providerNumber: string;
  /** Patient details */
  patientName: string;
  patientDob: string;
  patientIdNumber: string;
  membershipNumber: string;
  dependentCode: string;
  medicalAidScheme: string;
  /** Clinical details */
  icd10Codes: string[];
  cptCodes: string[];
  nappiCodes?: string[];
  /** Requested procedure description */
  procedureDescription: string;
  /** Clinical motivation (why this procedure is needed) */
  clinicalMotivation: string;
  /** Urgency */
  urgency: "elective" | "urgent" | "emergency";
  /** Estimated cost in ZAR cents */
  estimatedCost: number;
  /** Admission details (if hospital) */
  admissionDate?: string;
  dischargeDate?: string;
  facilityName?: string;
  facilityBhf?: string;
  /** Status tracking */
  status: PreAuthStatus;
  authorizationNumber?: string;
  approvedAmount?: number;
  denialReason?: string;
  validFrom?: string;
  validTo?: string;
  /** Switch routing */
  switchProvider: SwitchProvider;
  switchTransactionRef?: string;
  /** Timestamps */
  requestedAt: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PreAuthResponse {
  transactionRef: string;
  status: PreAuthStatus;
  authorizationNumber?: string;
  approvedAmount?: number;
  approvedDays?: number;
  denialReason?: string;
  validFrom?: string;
  validTo?: string;
  conditions?: string[];
  rawResponse?: string;
}

// ─── Batch Processing ──────────────────────────────────────────────────────

export type BatchStatus = "queued" | "processing" | "completed" | "failed" | "partial";

export interface BatchJob {
  id: string;
  practiceId: string;
  /** Claims in this batch */
  claimIds: string[];
  totalClaims: number;
  processedClaims: number;
  successfulClaims: number;
  failedClaims: number;
  /** Routing info */
  switchProvider: SwitchProvider;
  protocol: SwitchProtocol;
  /** Status */
  status: BatchStatus;
  /** Results per claim */
  results: BatchClaimResult[];
  /** Error details */
  errorMessage?: string;
  /** Timing */
  queuedAt: string;
  startedAt?: string;
  completedAt?: string;
  /** Retry tracking */
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: string;
}

export interface BatchClaimResult {
  claimId: string;
  transactionRef?: string;
  status: "success" | "failed" | "skipped";
  responseStatus?: string;
  errorMessage?: string;
  approvedAmount?: number;
  processedAt: string;
}

// ─── Electronic Remittance Advice (eRA) ────────────────────────────────────

export interface ERADocument {
  /** Remittance reference */
  remittanceRef: string;
  /** Scheme/administrator that sent the eRA */
  scheme: string;
  administrator: string;
  /** Payment batch details */
  paymentDate: string;
  paymentMethod: "EFT" | "cheque" | "direct";
  bankReference?: string;
  totalAmount: number;
  /** Individual claim payments */
  lineItems: ERALineItem[];
  /** Reconciliation summary */
  totalClaimed: number;
  totalApproved: number;
  totalPaid: number;
  totalRejected: number;
  totalAdjusted: number;
  /** Raw document */
  rawXml?: string;
  rawEdifact?: string;
  /** Processing */
  receivedAt: string;
  reconciledAt?: string;
  reconciliationStatus: "pending" | "matched" | "partial" | "unmatched" | "disputed";
}

export interface ERALineItem {
  /** Original claim reference */
  claimRef: string;
  /** Original invoice reference */
  invoiceRef?: string;
  /** Patient details */
  membershipNumber: string;
  dependentCode: string;
  patientName: string;
  /** Service details */
  dateOfService: string;
  tariffCode: string;
  icd10Code?: string;
  /** Amounts */
  claimedAmount: number;
  approvedAmount: number;
  paidAmount: number;
  /** Adjustments */
  adjustmentCode?: string;
  adjustmentReason?: string;
  adjustmentAmount?: number;
  /** Co-payment / patient liability */
  coPayment?: number;
  patientLiability?: number;
  /** Scheme tariff rate applied */
  schemeTariffRate?: number;
}

// ─── FamCheck / Member Verification ────────────────────────────────────────

export interface MemberVerification {
  /** Was the member found? */
  found: boolean;
  /** Member status */
  status: "active" | "suspended" | "terminated" | "pending";
  /** Scheme details */
  scheme: string;
  option: string;
  administrator: string;
  /** Main member */
  mainMember: {
    name: string;
    surname: string;
    idNumber: string;
    membershipNumber: string;
    dateOfBirth: string;
    gender: "M" | "F";
  };
  /** All dependents on this membership */
  dependents: {
    dependentCode: string;
    name: string;
    surname: string;
    dateOfBirth: string;
    gender: "M" | "F";
    relationship: string;
    status: "active" | "suspended" | "removed";
  }[];
  /** Benefits summary */
  benefitYear: string;
  benefitsSummary: {
    category: string;
    annualLimit: number;
    used: number;
    remaining: number;
    percentUsed: number;
  }[];
  /** Waiting periods */
  waitingPeriods: {
    type: "general" | "condition_specific" | "pre_existing";
    startDate: string;
    endDate: string;
    conditions?: string;
  }[];
  /** Late-joiner penalty */
  lateJoinerPenalty?: number;
  /** Network restrictions */
  networkType?: "open" | "restricted" | "designated";
  designatedProviders?: string[];
  /** Raw response */
  rawResponse?: string;
  /** Timestamp */
  verifiedAt: string;
}

// ─── PMS Vendor Accreditation ──────────────────────────────────────────────

export type AccreditationStatus = "pending" | "testing" | "accredited" | "suspended" | "revoked";

export interface PMSVendor {
  id: string;
  vendorName: string;
  vendorCode: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  /** Software details */
  softwareName: string;
  softwareVersion: string;
  /** Supported protocols */
  protocols: SwitchProtocol[];
  /** Accreditation per switch */
  accreditations: {
    switchProvider: SwitchProvider;
    status: AccreditationStatus;
    accreditedAt?: string;
    expiresAt?: string;
    testResults?: {
      testName: string;
      passed: boolean;
      message?: string;
      testedAt: string;
    }[];
  }[];
  /** Integration details */
  webhookUrl?: string;
  apiKey?: string;
  ipWhitelist?: string[];
  /** Timestamps */
  registeredAt: string;
  updatedAt: string;
}

export interface AccreditationTest {
  id: string;
  name: string;
  description: string;
  category: "format" | "content" | "transport" | "response" | "edge_case";
  /** Test claim data */
  testData: {
    claim: Record<string, unknown>;
    expectedResponse: Record<string, unknown>;
    validationRules: string[];
  };
}

// ─── Switch Routing Decision ───────────────────────────────────────────────

export interface RoutingDecision {
  /** Which switch to use */
  switchProvider: SwitchProvider;
  /** Why this switch was chosen */
  reason: string;
  /** Alternative switches available */
  alternatives: SwitchProvider[];
  /** Which protocol to use */
  protocol: SwitchProtocol;
  /** Estimated processing time */
  estimatedMs: number;
  /** Confidence in routing */
  confidence: "high" | "medium" | "low";
}

// ─── Claim Resubmission ───────────────────────────────────────────────────

export interface ResubmissionRequest {
  /** Original claim ID */
  originalClaimId: string;
  /** Original rejection code */
  originalRejectionCode: string;
  originalRejectionReason: string;
  /** Corrections applied */
  corrections: {
    field: string;
    oldValue: string;
    newValue: string;
    reason: string;
  }[];
  /** Correction type per EDIFACT DCR */
  correctionType: "ADJ" | "ADD" | "REV" | "RSV";
  /** New claim data (merged with corrections) */
  correctedClaim: Record<string, unknown>;
}
