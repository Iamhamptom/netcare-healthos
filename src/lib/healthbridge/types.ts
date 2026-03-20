// Healthbridge SA — Healthcare switching types
// Models the SA private healthcare claims ecosystem

/** SA Medical Aid claim line item */
export interface ClaimLineItem {
  /** ICD-10-ZA diagnosis code (e.g. "J32.9" for chronic sinusitis) */
  icd10Code: string;
  /** CPT/CCSA procedure code (e.g. "0190" for GP consultation) */
  cptCode: string;
  /** NAPPI code for medications/consumables (13-digit) */
  nappiCode?: string;
  description: string;
  quantity: number;
  /** Tariff amount in ZAR cents */
  amount: number;
  /** Modifier codes (e.g. "0002" for after-hours) */
  modifiers?: string[];
}

/** Claim submission payload */
export interface ClaimSubmission {
  /** BHF practice number (7-digit Board of Healthcare Funders number) */
  bhfNumber: string;
  /** HPCSA or treating provider registration number */
  providerNumber: string;
  /** Treating doctor name */
  treatingProvider: string;
  /** Referring doctor details (if applicable) */
  referringProvider?: string;
  referringBhf?: string;

  // Patient
  patientName: string;
  patientDob: string; // YYYY-MM-DD
  patientIdNumber: string; // SA ID or passport
  /** Medical aid scheme name (e.g. "Discovery Health", "GEMS") */
  medicalAidScheme: string;
  /** Medical aid membership number */
  membershipNumber: string;
  /** Dependent code (00 = main member, 01-09 = dependents) */
  dependentCode: string;

  // Clinical
  /** Date of service YYYY-MM-DD */
  dateOfService: string;
  /** Place of service code (11 = office, 21 = hospital inpatient, etc.) */
  placeOfService: string;
  /** Pre-authorization number (if required) */
  authorizationNumber?: string;
  /** Claim line items */
  lineItems: ClaimLineItem[];

  // Internal
  invoiceId?: string;
  practiceId: string;
}

/** Claim response from switch */
export interface ClaimResponse {
  /** Switch transaction reference */
  transactionRef: string;
  /** Overall status */
  status: "accepted" | "rejected" | "partial" | "pending";
  /** Per-line responses */
  lineResponses?: {
    lineNumber: number;
    status: "accepted" | "rejected";
    approvedAmount?: number;
    rejectionCode?: string;
    rejectionReason?: string;
  }[];
  /** Total approved amount in ZAR cents */
  approvedAmount?: number;
  /** Rejection reason (if status is rejected) */
  rejectionCode?: string;
  rejectionReason?: string;
  /** Raw response for audit trail */
  rawResponse?: string;
}

/** Electronic Remittance Advice (eRA) from medical aid */
export interface RemittanceAdvice {
  /** Medical aid scheme */
  scheme: string;
  /** Remittance reference number */
  remittanceRef: string;
  /** Payment date */
  paymentDate: string;
  /** Total payment amount in ZAR cents */
  totalAmount: number;
  /** Individual claim payments */
  payments: {
    claimRef: string;
    membershipNumber: string;
    patientName: string;
    dateOfService: string;
    claimedAmount: number;
    paidAmount: number;
    /** Reason for adjustment (if paid ≠ claimed) */
    adjustmentCode?: string;
    adjustmentReason?: string;
  }[];
}

/** Eligibility/Benefit check result */
export interface EligibilityResult {
  /** Is the member active on the scheme? */
  eligible: boolean;
  /** Scheme name */
  scheme: string;
  /** Option/plan name (e.g. "Executive Plan", "KeyCare+") */
  option: string;
  /** Member name as registered */
  memberName: string;
  /** Dependent name (if checking a dependent) */
  dependentName?: string;
  /** Available benefits */
  benefits?: {
    category: string; // e.g. "GP Consultations", "Specialist", "Dental"
    available: boolean;
    remainingAmount?: number;
    usedAmount?: number;
    annualLimit?: number;
    notes?: string;
  }[];
  /** Waiting periods in effect */
  waitingPeriods?: {
    type: string; // general | condition-specific | pre-existing
    expiresAt?: string;
  }[];
  /** Is pre-authorization required for this visit type? */
  preAuthRequired?: boolean;
}

/** Healthbridge connection config */
export interface HealthbridgeConfig {
  /** Healthbridge switch endpoint URL */
  endpoint: string;
  /** Practice username (assigned by Healthbridge) */
  username: string;
  /** Practice password/key */
  password: string;
  /** BHF practice number */
  bhfNumber: string;
  /** Sandbox mode for testing */
  sandbox: boolean;
}

/** Claim status in the lifecycle */
export type ClaimStatus =
  | "draft"           // Created but not submitted
  | "submitted"       // Sent to switch
  | "accepted"        // Medical aid accepted the claim
  | "rejected"        // Medical aid rejected the claim
  | "partial"         // Partially accepted
  | "pending_payment" // Accepted, awaiting eRA
  | "paid"            // eRA received, payment matched
  | "short_paid"      // eRA received but paid less than accepted
  | "reversed"        // Claim reversed/cancelled
  | "resubmitted";    // Corrected and resubmitted after rejection
