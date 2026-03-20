// Healthbridge SA — Medical aid claims switching integration
// The most comprehensive SA healthcare switching integration layer ever built.
// Covers: claims submission, eligibility, eRA reconciliation, NAPPI lookup,
// pre-submission validation, PMB/CDL detection, scheme analytics, patient cost estimation.

// Core switching client
export { submitClaim, checkEligibility, reverseClaim, fetchRemittances, isHealthbridgeConfigured } from "./client";

// XML protocol
export { buildClaimXML, buildEligibilityXML, buildReversalXML, parseClaimResponseXML } from "./xml";

// SA healthcare codes
export { COMMON_ICD10, COMMON_CPT, PLACE_OF_SERVICE, MEDICAL_AID_SCHEMES, REJECTION_CODES, isValidICD10, isValidCPT, isValidBHF, isValidNAPPI, formatZAR, parseZARToCents } from "./codes";

// Pre-submission validation engine
export { validateClaim } from "./validator";
export type { ValidationIssue, ValidationResult } from "./validator";

// PMB & CDL detection
export { PMB_ICD10_CODES, CDL_CONDITIONS, isPMBCondition, isCDLCondition, getPMBStatus } from "./pmb";

// NAPPI code lookup (medicineprices.org.za API)
export { searchNAPPI, lookupNAPPI } from "./nappi";
export type { NAPPIResult } from "./nappi";

// Scheme analytics & aging
export { calculateSchemeAnalytics, calculateAging, estimatePatientCost } from "./analytics";
export type { SchemeAnalytics, AgingBucket, ClaimRecord } from "./analytics";

// AI-powered ICD-10 coding assistant
export { suggestCodes } from "./ai-coder";
export type { ICD10Suggestion, CodingSuggestion } from "./ai-coder";

// Batch claim upload
export { parseBatchCSV, validateBatch } from "./batch";
export type { BatchRow, BatchValidationResult } from "./batch";

// Retry logic for switch submissions
export { withRetry } from "./retry";
export type { RetryConfig } from "./retry";

// Safe XML parser
export { safeParseClaimResponse } from "./xml-parser";

// Multi-switch routing
export { routeToSwitch, getSwitchStatus, getSchemesForSwitch } from "./switch-router";
export type { SwitchProvider, SwitchRoute } from "./switch-router";

// Security: Audit logging
export { logClaimAudit } from "./audit";
export type { ClaimAuditData } from "./audit";

// Security: Patient ID encryption & masking
export { encryptField, decryptField, maskIdNumber, maskMembership } from "./encrypt";

// Security: Claim state machine
export { isValidTransition, getNextStates, validateTransition } from "./state-machine";

// Security: Reconciliation idempotency
export { generateIdempotencyKey, isAlreadyReconciled } from "./idempotency";

// Pagination helpers
export { parsePaginationParams, paginateResult } from "./pagination";
export type { PaginatedResult } from "./pagination";

// AI rejection predictor
export { predictRejection } from "./ai-predictor";
export type { RejectionPrediction } from "./ai-predictor";

// AI clinical notes → claim auto-fill
export { autofillClaimFromNotes } from "./ai-autofill";
export type { AutofilledClaim } from "./ai-autofill";

// Smart claim follow-up generator
export { generateFollowUps } from "./ai-followup";
export type { FollowUpAction } from "./ai-followup";

// Types
export type { ClaimSubmission, ClaimResponse, ClaimLineItem, EligibilityResult, RemittanceAdvice, HealthbridgeConfig, ClaimStatus } from "./types";
