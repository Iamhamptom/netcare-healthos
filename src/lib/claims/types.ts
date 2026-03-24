// Claims Rejection Analyzer — Type Definitions

export interface ClaimLineItem {
  lineNumber: number;
  patientName?: string;
  patientGender?: "M" | "F" | "U";
  patientAge?: number;
  primaryICD10: string;
  rawICD10?: string;           // Original ICD-10 before uppercasing (detects lowercase input)
  secondaryICD10?: string[];
  tariffCode?: string;
  nappiCode?: string;
  quantity?: number;
  amount?: number;
  modifier?: string;
  practitionerType?: string;
  dateOfService?: string;
  dependentCode?: string;
  practiceNumber?: string;
  scheme?: string;
  motivationText?: string;
  rawAmount?: string;
  rawDateOfService?: string;
  placeOfService?: string;
  membershipNumber?: string;
  // Extended fields for EDIFACT / switchboard validation
  patientIdNumber?: string;     // SA ID number (RFF+AHI segment — 13 digits)
  patientDob?: string;          // Date of birth (DTM+329 segment)
  treatingProviderNumber?: string; // Treating doctor BHF (NAD+TDN)
  referringProviderNumber?: string; // Referring doctor BHF (NAD+RDN)
  authorizationNumber?: string; // Pre-auth number (RFF+AE)
  schemeOptionCode?: string;    // Scheme plan/option code
  admissionDate?: string;       // Hospital admission date (DTM+194)
  dischargeDate?: string;       // Hospital discharge date (DTM+96)
  accidentDate?: string;        // IOD/accident date (DTM+290)
  prescriptionNumber?: string;  // Pharmacy prescription ref (RFF+PRE)
  dispensingDate?: string;      // Pharmacy dispensing date (DTM+292)
  vatRate?: number;             // VAT rate (TAX+7 segment, default 15%)
  depositAmount?: number;       // Patient payment/deposit (PAT+14)
  isIOD?: boolean;              // Injured on duty flag (RFF+IOD)
  isMVA?: boolean;              // Motor vehicle accident (RFF+MVA)
  isMaternity?: boolean;        // Maternity flag (RFF+MAT)
  isOutpatient?: boolean;       // Outpatient flag (RFF+OUT)
}

/** Batch-level metadata for EDIFACT structural validation */
export interface ClaimBatchMetadata {
  batchNumber?: string;           // BGM batch number (18 digits zero-filled)
  batchCreationDate?: string;     // BGM creation date
  messageReferenceNumber?: string; // UNH message ref (up to 14 chars)
  correctionType?: "ADJ" | "ADD" | "REV" | "RSV" | "INT"; // DCR segment
  originalClaimReference?: string; // Original claim number for ADJ/REV
  supplierBatchNumber?: string;   // DCR+SBN — original supplier batch
  isResubmission?: boolean;       // Whether this is a resubmission
  isRealTime?: boolean;           // Real-time vs batch submission
  isEmergency?: boolean;          // Emergency priority flag
  lateSubmissionMotivation?: string; // Required when claim > 90 days old
  submittingPracticeNumber?: string; // The practice submitting (may differ from rendering)
  renderingPracticeNumber?: string;  // The practice that rendered the service
  switchContractActive?: boolean;    // Whether practice has active switch contract
  switchRegistrationDate?: string;   // When practice registered with switch
}

export type ValidationSeverity = "error" | "warning" | "info";

export interface ValidationIssue {
  lineNumber: number;
  field: string;
  code: string;
  severity: ValidationSeverity;
  rule: string;
  message: string;
  suggestion?: string;
}

export interface BatchInsight {
  rule: string;
  affectedCount: number;
  percentage: number;
  severity: string;
  explanation: string;
  fix: string;
}

export interface ValidationResult {
  totalClaims: number;
  validClaims: number;
  invalidClaims: number;
  warningClaims: number;
  issues: ValidationIssue[];
  summary: ValidationSummary;
  lineResults: LineValidationResult[];
  batchInsights?: BatchInsight[];
}

export interface LineValidationResult {
  lineNumber: number;
  status: "valid" | "error" | "warning";
  issues: ValidationIssue[];
  claimData: ClaimLineItem;
}

export interface ValidationSummary {
  errorCount: number;
  warningCount: number;
  infoCount: number;
  byRule: Record<string, number>;
  estimatedRejectionRate: number;
  estimatedSavings: number;
  topIssues: { rule: string; count: number; severity: ValidationSeverity }[];
}

export interface ICD10Entry {
  code: string;
  description: string;
  chapter: number;
  chapterTitle: string;
  category: string;
  isValid: boolean;
  maxSpecificity: number;
  genderRestriction?: "M" | "F";
  ageMin?: number;
  ageMax?: number;
  isAsterisk?: boolean;    // Manifestation code — cannot be primary
  isDagger?: boolean;       // Etiology code — can be primary
  isExternalCause?: boolean;
  requiresExternalCause?: boolean; // S/T codes
  isPMB?: boolean;          // Prescribed Minimum Benefits
  isSequela?: boolean;
}

export interface NAPPIEntry {
  code: string;
  description: string;
  strength?: string;
  packSize?: string;
  manufacturer?: string;
  schedule?: string; // S0-S8
  category: string;
}

export interface CSVParseResult {
  headers: string[];
  rows: Record<string, string>[];
  errors: string[];
}

export interface ColumnMapping {
  primaryICD10: string;
  secondaryICD10?: string;
  tariffCode?: string;
  nappiCode?: string;
  patientName?: string;
  patientGender?: string;
  patientAge?: string;
  amount?: string;
  quantity?: string;
  modifier?: string;
  practitionerType?: string;
  dateOfService?: string;
  dependentCode?: string;
  practiceNumber?: string;
  scheme?: string;
  schemeOptionCode?: string;
  motivationText?: string;
  placeOfService?: string;
  membershipNumber?: string;
  patientDob?: string;
}
