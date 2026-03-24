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
  motivationText?: string;
  placeOfService?: string;
  membershipNumber?: string;
}
