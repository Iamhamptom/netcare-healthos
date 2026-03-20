// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Medical Aid Switching Engine — VisioCorp / Netcare Health OS
// The most comprehensive SA healthcare switching integration ever built.
//
// Modules:
// 1. EDIFACT MEDCLM — Full PHISC v0:912:ZA parser/generator
// 2. Multi-Switch Router — Routes to Healthbridge/MediKredit/SwitchOn
// 3. MediKredit Client — HealthNet ST integration + FamCheck + AuthCheck
// 4. SwitchOn Client — Altron HealthTech integration
// 5. Pre-Authorization Engine — Request, track, manage pre-auth
// 6. Batch Processor — Queue management, retry logic, EDIFACT batches
// 7. eRA Parser — Remittance advice parsing + reconciliation
// 8. Resubmission Workflow — Rejection analysis + auto-fix + bulk resubmit
// 9. Vendor Accreditation — PMS vendor onboarding + testing suite
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// EDIFACT MEDCLM Engine (PHISC v0:912:ZA)
export {
  generateEDIFACT,
  generateEDIFACTInterchange,
  parseEDIFACT,
  parseEDIFACTResponse,
  validateEDIFACTMessage,
  claimToEDIFACT,
  edifactToClaim,
} from "./edifact";

// Multi-Switch Router
export {
  routeClaim,
  submitRoutedClaim,
  checkRoutedEligibility,
  getSwitchStatus,
  getSwitchConfigs,
  updateSwitchHealth,
  SCHEME_ROUTING_TABLE,
} from "./router";
export type { SchemeRoute } from "./router";

// MediKredit Client
export {
  submitToMediKredit,
  checkMediKreditEligibility,
  famCheck,
  authCheck,
} from "./medikredit-client";

// SwitchOn Client
export {
  submitToSwitchOn,
  checkSwitchOnEligibility,
} from "./switchon-client";

// Pre-Authorization Engine
export {
  checkPreAuthRequired,
  createPreAuthRequest,
  buildPreAuthXML,
  parsePreAuthResponse,
  applyPreAuthResponse,
  isPreAuthValid,
} from "./preauth";
export type { PreAuthCheck } from "./preauth";

// Batch Claims Processor
export {
  createBatchJob,
  processBatch,
  getBatchSummary,
  getFailedClaims,
  generateBatchEDIFACT,
} from "./batch";
export type { BatchSummary } from "./batch";

// eRA Parser & Reconciliation
export {
  parseERAXml,
  reconcileERA,
  generateDisputes,
} from "./era-parser";
export type { ReconciliationResult, ReconciliationMatch, PaymentDispute } from "./era-parser";

// Claim Resubmission Workflow
export {
  analyzeRejection,
  createResubmission,
  applyAutoFixes,
  categorizeForResubmission,
} from "./resubmission";
export type { RejectionAnalysis, SuggestedFix, ResubmissionBatch } from "./resubmission";

// PMS Vendor Accreditation
export {
  ACCREDITATION_TESTS,
  runAccreditationTests,
  createVendor,
  isVendorAccredited,
  getAccreditationSummary,
} from "./vendor-accreditation";
export type { TestResult } from "./vendor-accreditation";

// All types
export type {
  SwitchProvider,
  SwitchProtocol,
  SwitchConfig,
  EDIFACTMessage,
  EDIFACTDate,
  EDIFACTParty,
  EDIFACTLineItem,
  PreAuthRequest,
  PreAuthResponse,
  PreAuthStatus,
  BatchJob,
  BatchClaimResult,
  BatchStatus,
  ERADocument,
  ERALineItem,
  MemberVerification,
  PMSVendor,
  AccreditationTest,
  AccreditationStatus,
  RoutingDecision,
  ResubmissionRequest,
} from "./types";
