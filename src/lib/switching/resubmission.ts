// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Claim Resubmission Workflow — Fix rejected claims and resubmit
// Analyzes rejection codes, suggests corrections, builds corrected claims
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { ResubmissionRequest } from "./types";
import type { ClaimSubmission } from "../healthbridge/types";
import { REJECTION_CODES } from "../healthbridge/codes";

// ─── Rejection Analysis ─────────────────────────────────────────────────────

export interface RejectionAnalysis {
  code: string;
  reason: string;
  category: "patient_data" | "clinical" | "authorization" | "timing" | "provider" | "benefit" | "duplicate";
  canAutoFix: boolean;
  suggestedFixes: SuggestedFix[];
  resubmittable: boolean;
  requiresManualReview: boolean;
  deadlineDays?: number;
}

export interface SuggestedFix {
  field: string;
  description: string;
  action: "correct" | "add" | "remove" | "verify";
  priority: "high" | "medium" | "low";
}

/**
 * Analyze a rejection code and determine what needs to be fixed.
 */
export function analyzeRejection(rejectionCode: string, rejectionReason?: string): RejectionAnalysis {
  const reason = rejectionReason || REJECTION_CODES[rejectionCode] || "Unknown rejection reason";

  const analyses: Record<string, Omit<RejectionAnalysis, "code" | "reason">> = {
    "01": {
      category: "patient_data",
      canAutoFix: false,
      suggestedFixes: [
        { field: "membershipNumber", description: "Verify membership number against medical aid card", action: "verify", priority: "high" },
        { field: "medicalAidScheme", description: "Confirm correct scheme name (spelling matters)", action: "verify", priority: "high" },
        { field: "dependentCode", description: "Check dependent code (00=main member, 01-09=dependents)", action: "verify", priority: "medium" },
      ],
      resubmittable: true,
      requiresManualReview: true,
    },
    "02": {
      category: "patient_data",
      canAutoFix: false,
      suggestedFixes: [
        { field: "membershipNumber", description: "Member may have changed schemes — contact patient for updated details", action: "verify", priority: "high" },
        { field: "medicalAidScheme", description: "Check if patient has moved to a new scheme", action: "verify", priority: "high" },
      ],
      resubmittable: true,
      requiresManualReview: true,
    },
    "03": {
      category: "patient_data",
      canAutoFix: true,
      suggestedFixes: [
        { field: "dependentCode", description: "Correct the dependent code — check medical aid card for exact number", action: "correct", priority: "high" },
      ],
      resubmittable: true,
      requiresManualReview: false,
    },
    "04": {
      category: "patient_data",
      canAutoFix: true,
      suggestedFixes: [
        { field: "patientDob", description: "Date of birth does not match scheme records — verify against ID document", action: "correct", priority: "high" },
        { field: "patientIdNumber", description: "Cross-check SA ID number (first 6 digits = YYMMDD)", action: "verify", priority: "medium" },
      ],
      resubmittable: true,
      requiresManualReview: false,
    },
    "05": {
      category: "clinical",
      canAutoFix: false,
      suggestedFixes: [
        { field: "icd10Code", description: "ICD-10 code invalid or not covered — use a more specific code", action: "correct", priority: "high" },
        { field: "icd10Code", description: "Check if code requires 4th/5th character for specificity", action: "verify", priority: "medium" },
        { field: "icd10Code", description: "If PMB condition, resubmit with PMB motivation letter", action: "add", priority: "medium" },
      ],
      resubmittable: true,
      requiresManualReview: true,
    },
    "06": {
      category: "clinical",
      canAutoFix: false,
      suggestedFixes: [
        { field: "cptCode", description: "Procedure code does not match diagnosis — review clinical appropriateness", action: "verify", priority: "high" },
        { field: "icd10Code", description: "Consider adding a supporting diagnosis code", action: "add", priority: "medium" },
      ],
      resubmittable: true,
      requiresManualReview: true,
    },
    "07": {
      category: "benefit",
      canAutoFix: false,
      suggestedFixes: [
        { field: "icd10Code", description: "Check if condition qualifies as PMB — schemes must cover PMBs regardless of limits", action: "verify", priority: "high" },
        { field: "claim", description: "Consider splitting procedure across benefit categories", action: "verify", priority: "medium" },
        { field: "patient", description: "Inform patient of benefit exhaustion and out-of-pocket amount", action: "verify", priority: "low" },
      ],
      resubmittable: true,
      requiresManualReview: true,
    },
    "08": {
      category: "authorization",
      canAutoFix: false,
      suggestedFixes: [
        { field: "authorizationNumber", description: "Obtain pre-authorization from scheme before resubmitting", action: "add", priority: "high" },
        { field: "claim", description: "If emergency, resubmit with emergency motivation (PMB if applicable)", action: "add", priority: "high" },
      ],
      resubmittable: true,
      requiresManualReview: true,
    },
    "09": {
      category: "duplicate",
      canAutoFix: false,
      suggestedFixes: [
        { field: "claim", description: "This claim was already processed — check claim history for the original submission", action: "verify", priority: "high" },
        { field: "claim", description: "If this is a different service, add modifier to differentiate", action: "add", priority: "medium" },
      ],
      resubmittable: false,
      requiresManualReview: true,
    },
    "10": {
      category: "provider",
      canAutoFix: false,
      suggestedFixes: [
        { field: "bhfNumber", description: "Provider not contracted with this scheme — verify BHF number", action: "verify", priority: "high" },
        { field: "providerNumber", description: "Check HPCSA registration is active and linked to this practice", action: "verify", priority: "high" },
      ],
      resubmittable: true,
      requiresManualReview: true,
    },
    "11": {
      category: "timing",
      canAutoFix: false,
      suggestedFixes: [
        { field: "claim", description: "Waiting period applies — claim must be resubmitted after waiting period expires", action: "verify", priority: "high" },
        { field: "patient", description: "Inform patient of waiting period and estimated end date", action: "verify", priority: "medium" },
      ],
      resubmittable: true,
      requiresManualReview: true,
      deadlineDays: 120,
    },
    "12": {
      category: "timing",
      canAutoFix: false,
      suggestedFixes: [
        { field: "claim", description: "Claim submitted too late (>4 months). Apply for late submission exemption", action: "add", priority: "high" },
        { field: "claim", description: "Include motivation letter explaining reason for late submission", action: "add", priority: "high" },
      ],
      resubmittable: true,
      requiresManualReview: true,
    },
    "13": {
      category: "clinical",
      canAutoFix: true,
      suggestedFixes: [
        { field: "icd10Code", description: "PMB condition detected — resubmit with PMB flag and treatment protocol", action: "correct", priority: "high" },
      ],
      resubmittable: true,
      requiresManualReview: false,
    },
    "14": {
      category: "benefit",
      canAutoFix: false,
      suggestedFixes: [
        { field: "patient", description: "Co-payment applies — collect patient portion", action: "verify", priority: "high" },
        { field: "claim", description: "If PMB condition, dispute co-payment with scheme", action: "verify", priority: "medium" },
      ],
      resubmittable: false,
      requiresManualReview: true,
    },
    "15": {
      category: "benefit",
      canAutoFix: false,
      suggestedFixes: [
        { field: "amount", description: "Charged above scheme tariff rate. Patient liable for shortfall", action: "verify", priority: "high" },
        { field: "patient", description: "Check if patient has gap cover to cover the shortfall", action: "verify", priority: "medium" },
        { field: "claim", description: "If contracted, dispute with proof of contracted rate", action: "add", priority: "medium" },
      ],
      resubmittable: false,
      requiresManualReview: true,
    },
  };

  const analysis = analyses[rejectionCode];
  if (analysis) {
    return { code: rejectionCode, reason, ...analysis };
  }

  // Unknown rejection code
  return {
    code: rejectionCode,
    reason,
    category: "clinical",
    canAutoFix: false,
    suggestedFixes: [
      { field: "claim", description: `Unknown rejection code "${rejectionCode}" — contact scheme for clarification`, action: "verify", priority: "high" },
    ],
    resubmittable: true,
    requiresManualReview: true,
  };
}

// ─── Resubmission Builder ───────────────────────────────────────────────────

/**
 * Create a resubmission request with corrections applied.
 */
export function createResubmission(
  originalClaim: ClaimSubmission,
  originalClaimId: string,
  rejectionCode: string,
  rejectionReason: string,
  corrections: { field: string; oldValue: string; newValue: string; reason: string }[],
): ResubmissionRequest {
  // Apply corrections to create corrected claim
  const correctedClaim = { ...originalClaim } as Record<string, unknown>;
  for (const correction of corrections) {
    if (correction.field in correctedClaim) {
      correctedClaim[correction.field] = correction.newValue;
    }
  }

  // Determine correction type based on rejection
  let correctionType: "ADJ" | "ADD" | "REV" | "RSV" = "RSV"; // Default: resubmit
  if (rejectionCode === "09") correctionType = "REV"; // Duplicate → reversal
  else if (corrections.some(c => c.field === "amount")) correctionType = "ADJ"; // Amount change → amendment

  return {
    originalClaimId,
    originalRejectionCode: rejectionCode,
    originalRejectionReason: rejectionReason,
    corrections,
    correctionType,
    correctedClaim,
  };
}

/**
 * Apply auto-fixable corrections to a rejected claim.
 * Only applies corrections that don't require manual review.
 */
export function applyAutoFixes(
  claim: ClaimSubmission,
  rejectionCode: string,
): { claim: ClaimSubmission; fixesApplied: string[] } {
  const analysis = analyzeRejection(rejectionCode);
  const fixesApplied: string[] = [];
  const fixed = { ...claim };

  if (!analysis.canAutoFix) {
    return { claim: fixed, fixesApplied };
  }

  switch (rejectionCode) {
    case "03": {
      // Dependent code fix — ensure 2-digit format
      if (fixed.dependentCode.length === 1) {
        fixed.dependentCode = fixed.dependentCode.padStart(2, "0");
        fixesApplied.push(`Dependent code padded to 2 digits: "${fixed.dependentCode}"`);
      }
      break;
    }
    case "04": {
      // DOB fix — cross-check with ID number
      if (fixed.patientIdNumber && /^\d{13}$/.test(fixed.patientIdNumber)) {
        const idDob = fixed.patientIdNumber.slice(0, 6);
        const century = parseInt(idDob.slice(0, 2)) > 30 ? "19" : "20";
        const correctedDob = `${century}${idDob.slice(0, 2)}-${idDob.slice(2, 4)}-${idDob.slice(4, 6)}`;
        if (fixed.patientDob !== correctedDob) {
          fixed.patientDob = correctedDob;
          fixesApplied.push(`DOB corrected from ID number: ${correctedDob}`);
        }
      }
      break;
    }
    case "13": {
      // PMB resubmission — no data change needed, but flag in authorization
      if (!fixed.authorizationNumber) {
        fixed.authorizationNumber = "PMB-EXEMPT";
        fixesApplied.push("Added PMB exemption flag — scheme must cover");
      }
      break;
    }
  }

  return { claim: fixed, fixesApplied };
}

// ─── Bulk Resubmission ──────────────────────────────────────────────────────

export interface ResubmissionBatch {
  autoFixable: { claim: ClaimSubmission; rejectionCode: string; fixes: string[] }[];
  manualReview: { claim: ClaimSubmission; rejectionCode: string; analysis: RejectionAnalysis }[];
  notResubmittable: { claim: ClaimSubmission; rejectionCode: string; reason: string }[];
}

/**
 * Categorize rejected claims for bulk resubmission.
 */
export function categorizeForResubmission(
  rejectedClaims: { claim: ClaimSubmission; rejectionCode: string; rejectionReason?: string }[],
): ResubmissionBatch {
  const result: ResubmissionBatch = {
    autoFixable: [],
    manualReview: [],
    notResubmittable: [],
  };

  for (const { claim, rejectionCode, rejectionReason } of rejectedClaims) {
    const analysis = analyzeRejection(rejectionCode, rejectionReason);

    if (!analysis.resubmittable) {
      result.notResubmittable.push({
        claim,
        rejectionCode,
        reason: analysis.reason,
      });
    } else if (analysis.canAutoFix) {
      const { claim: fixed, fixesApplied } = applyAutoFixes(claim, rejectionCode);
      result.autoFixable.push({
        claim: fixed,
        rejectionCode,
        fixes: fixesApplied,
      });
    } else {
      result.manualReview.push({ claim, rejectionCode, analysis });
    }
  }

  return result;
}
