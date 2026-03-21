// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Electronic Remittance Advice (eRA) Parser & Reconciliation Engine
// Parses XML eRA documents from switches and matches payments to claims
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { ERADocument, ERALineItem } from "./types";
import { formatZAR } from "../healthbridge/codes";

// ─── eRA XML Parser ─────────────────────────────────────────────────────────

/**
 * Parse an eRA XML document from any SA switch into a structured ERADocument.
 */
export function parseERAXml(xml: string): ERADocument {
  const remittanceRef = extractTag(xml, "RemittanceRef") || extractTag(xml, "RemittanceReference") || `ERA-${Date.now()}`;
  const scheme = extractTag(xml, "SchemeName") || extractTag(xml, "Scheme") || "";
  const administrator = extractTag(xml, "Administrator") || extractTag(xml, "AdminName") || "";
  const paymentDate = extractTag(xml, "PaymentDate") || new Date().toISOString().slice(0, 10);
  const paymentMethod = extractTag(xml, "PaymentMethod") || "EFT";
  const bankRef = extractTag(xml, "BankReference");
  const totalAmount = parseInt(extractTag(xml, "TotalAmount") || "0", 10);

  // Parse line items
  const lineItems = parseERALineItems(xml);

  // Calculate totals
  const totalClaimed = lineItems.reduce((sum, li) => sum + li.claimedAmount, 0);
  const totalApproved = lineItems.reduce((sum, li) => sum + li.approvedAmount, 0);
  const totalPaid = lineItems.reduce((sum, li) => sum + li.paidAmount, 0);
  const totalRejected = lineItems.filter(li => li.paidAmount === 0).reduce((sum, li) => sum + li.claimedAmount, 0);
  const totalAdjusted = lineItems.reduce((sum, li) => sum + (li.adjustmentAmount || 0), 0);

  return {
    remittanceRef,
    scheme,
    administrator,
    paymentDate,
    paymentMethod: paymentMethod as "EFT" | "cheque" | "direct",
    bankReference: bankRef || undefined,
    totalAmount: totalAmount || totalPaid,
    lineItems,
    totalClaimed,
    totalApproved,
    totalPaid,
    totalRejected,
    totalAdjusted,
    rawXml: xml,
    receivedAt: new Date().toISOString(),
    reconciliationStatus: "pending",
  };
}

function parseERALineItems(xml: string): ERALineItem[] {
  const items: ERALineItem[] = [];

  // Match all <Payment> or <Line> or <ClaimPayment> blocks
  const linePattern = /<(?:Payment|Line|ClaimPayment|RemittanceLine)[^>]*>([\s\S]*?)<\/(?:Payment|Line|ClaimPayment|RemittanceLine)>/gi;
  let match: RegExpExecArray | null;

  while ((match = linePattern.exec(xml)) !== null) {
    const block = match[1];
    const claimRef = extractTag(block, "ClaimRef") || extractTag(block, "ClaimReference") || extractTag(block, "TransactionRef") || "";
    const invoiceRef = extractTag(block, "InvoiceRef") || extractTag(block, "InvoiceNumber");
    const memberNo = extractTag(block, "MembershipNumber") || extractTag(block, "MemberNo") || "";
    const depCode = extractTag(block, "DependentCode") || extractTag(block, "DepCode") || "00";
    const patientName = extractTag(block, "PatientName") || extractTag(block, "Name") || "";
    const dos = extractTag(block, "DateOfService") || extractTag(block, "DOS") || "";
    const tariffCode = extractTag(block, "TariffCode") || extractTag(block, "ProcedureCode") || extractTag(block, "CPT") || "";
    const icd10Code = extractTag(block, "ICD10") || extractTag(block, "DiagnosisCode");

    const claimed = parseInt(extractTag(block, "ClaimedAmount") || extractTag(block, "Claimed") || "0", 10);
    const approved = parseInt(extractTag(block, "ApprovedAmount") || extractTag(block, "Approved") || "0", 10);
    const paid = parseInt(extractTag(block, "PaidAmount") || extractTag(block, "Paid") || "0", 10);

    const adjCode = extractTag(block, "AdjustmentCode") || extractTag(block, "ReasonCode");
    const adjReason = extractTag(block, "AdjustmentReason") || extractTag(block, "Reason");
    const adjAmount = parseInt(extractTag(block, "AdjustmentAmount") || "0", 10);

    const coPay = parseInt(extractTag(block, "CoPayment") || "0", 10);
    const patientLiab = parseInt(extractTag(block, "PatientLiability") || "0", 10);
    const schemeRate = parseInt(extractTag(block, "SchemeTariffRate") || "0", 10);

    items.push({
      claimRef,
      invoiceRef: invoiceRef || undefined,
      membershipNumber: memberNo,
      dependentCode: depCode,
      patientName,
      dateOfService: dos,
      tariffCode,
      icd10Code: icd10Code || undefined,
      claimedAmount: claimed,
      approvedAmount: approved || paid,
      paidAmount: paid,
      adjustmentCode: adjCode || undefined,
      adjustmentReason: adjReason || undefined,
      adjustmentAmount: adjAmount || undefined,
      coPayment: coPay || undefined,
      patientLiability: patientLiab || undefined,
      schemeTariffRate: schemeRate || undefined,
    });
  }

  return items;
}

// ─── Reconciliation Engine ──────────────────────────────────────────────────

export interface ReconciliationResult {
  eraRef: string;
  matched: ReconciliationMatch[];
  unmatched: ERALineItem[];
  overpayments: ReconciliationMatch[];
  underpayments: ReconciliationMatch[];
  totalMatched: number;
  totalUnmatched: number;
  totalVariance: number;
  summary: string;
}

export interface ReconciliationMatch {
  eraLine: ERALineItem;
  invoiceId: string;
  claimId: string;
  /** Difference between claimed and paid (negative = underpaid) */
  variance: number;
  varianceFormatted: string;
  /** Match confidence */
  matchType: "exact" | "fuzzy" | "manual";
  /** Is there a shortfall the patient must pay? */
  patientShortfall: number;
}

/**
 * Reconcile eRA payments against existing claims/invoices.
 * Returns matched, unmatched, and variance analysis.
 */
export function reconcileERA(
  era: ERADocument,
  existingClaims: {
    id: string;
    transactionRef: string;
    invoiceId: string;
    membershipNumber: string;
    dateOfService: string;
    claimedAmount: number;
    status: string;
  }[],
): ReconciliationResult {
  const matched: ReconciliationMatch[] = [];
  const unmatched: ERALineItem[] = [];
  const overpayments: ReconciliationMatch[] = [];
  const underpayments: ReconciliationMatch[] = [];

  const claimMap = new Map(existingClaims.map(c => [c.transactionRef, c]));
  const memberMap = new Map<string, typeof existingClaims>();
  for (const claim of existingClaims) {
    const key = `${claim.membershipNumber}|${claim.dateOfService}`;
    if (!memberMap.has(key)) memberMap.set(key, []);
    memberMap.get(key)!.push(claim);
  }

  for (const eraLine of era.lineItems) {
    // Try exact match by transaction reference
    let claim = claimMap.get(eraLine.claimRef);
    let matchType: "exact" | "fuzzy" | "manual" = "exact";

    // Fallback: match by membership number + date of service
    if (!claim) {
      const key = `${eraLine.membershipNumber}|${eraLine.dateOfService}`;
      const candidates = memberMap.get(key);
      if (candidates && candidates.length === 1) {
        claim = candidates[0];
        matchType = "fuzzy";
      } else if (candidates && candidates.length > 1) {
        // Multiple candidates — try to match by amount
        claim = candidates.find(c => c.claimedAmount === eraLine.claimedAmount);
        matchType = claim ? "fuzzy" : "manual";
      }
    }

    if (claim) {
      const variance = eraLine.paidAmount - eraLine.claimedAmount;
      const patientShortfall = Math.max(0, eraLine.claimedAmount - eraLine.paidAmount - (eraLine.coPayment || 0));

      const reconcMatch: ReconciliationMatch = {
        eraLine,
        invoiceId: claim.invoiceId,
        claimId: claim.id,
        variance,
        varianceFormatted: `${variance >= 0 ? "+" : ""}${formatZAR(variance)}`,
        matchType,
        patientShortfall,
      };

      matched.push(reconcMatch);

      if (variance > 0) overpayments.push(reconcMatch);
      else if (variance < 0) underpayments.push(reconcMatch);
    } else {
      unmatched.push(eraLine);
    }
  }

  const totalVariance = matched.reduce((sum, m) => sum + m.variance, 0);

  return {
    eraRef: era.remittanceRef,
    matched,
    unmatched,
    overpayments,
    underpayments,
    totalMatched: matched.length,
    totalUnmatched: unmatched.length,
    totalVariance,
    summary: `Reconciled ${matched.length}/${era.lineItems.length} payments. ` +
      `${underpayments.length} underpaid (${formatZAR(Math.abs(underpayments.reduce((s, m) => s + m.variance, 0)))}). ` +
      `${unmatched.length} unmatched.`,
  };
}

// ─── BHF Adjustment Reason Codes ────────────────────────────────────────────

/** Standard BHF/PHISC adjustment reason codes used across SA switches */
export const BHF_ADJUSTMENT_CODES: Record<string, {
  description: string;
  category: DisputeCategory;
  disputeWorthy: boolean;
  autoResubmit: boolean;
  resubmitAction?: string;
}> = {
  "01": { description: "Member not found on scheme", category: "member_data", disputeWorthy: false, autoResubmit: false },
  "02": { description: "Membership number incorrect", category: "member_data", disputeWorthy: false, autoResubmit: false },
  "03": { description: "Dependent code invalid", category: "member_data", disputeWorthy: false, autoResubmit: false },
  "04": { description: "Member suspended — arrear contributions", category: "member_status", disputeWorthy: false, autoResubmit: false },
  "05": { description: "Duplicate claim submitted", category: "duplicate", disputeWorthy: false, autoResubmit: false },
  "06": { description: "Claim already reversed", category: "duplicate", disputeWorthy: false, autoResubmit: false },
  "07": { description: "Benefit exhausted for category", category: "benefit_limit", disputeWorthy: true, autoResubmit: true, resubmitAction: "Resubmit with PMB motivation if diagnosis qualifies" },
  "08": { description: "Pre-authorisation not obtained", category: "auth_missing", disputeWorthy: true, autoResubmit: true, resubmitAction: "Obtain retrospective pre-auth and resubmit" },
  "09": { description: "Service not covered under option", category: "benefit_limit", disputeWorthy: true, autoResubmit: false },
  "10": { description: "Provider not on scheme network", category: "provider", disputeWorthy: true, autoResubmit: false },
  "11": { description: "Claim past filing deadline", category: "timing", disputeWorthy: false, autoResubmit: false },
  "12": { description: "ICD-10 code invalid or unspecified", category: "clinical_coding", disputeWorthy: false, autoResubmit: true, resubmitAction: "Correct ICD-10 code to 4th character specificity" },
  "13": { description: "Above scheme tariff — reduced to scheme rate", category: "tariff", disputeWorthy: true, autoResubmit: false },
  "14": { description: "Co-payment applied", category: "co_payment", disputeWorthy: false, autoResubmit: false },
  "15": { description: "Paid at scheme tariff rate (lower than billed)", category: "tariff", disputeWorthy: true, autoResubmit: false },
  "16": { description: "PMB condition — paid at cost", category: "pmb", disputeWorthy: false, autoResubmit: false },
  "17": { description: "Waiting period applies", category: "member_status", disputeWorthy: false, autoResubmit: false },
  "18": { description: "CPT code invalid for diagnosis", category: "clinical_coding", disputeWorthy: false, autoResubmit: true, resubmitAction: "Correct CPT code to match ICD-10 diagnosis" },
  "19": { description: "Quantity exceeds limit", category: "clinical_coding", disputeWorthy: false, autoResubmit: true, resubmitAction: "Adjust quantity or add clinical motivation" },
  "20": { description: "Date of service outside benefit year", category: "timing", disputeWorthy: false, autoResubmit: false },
  "21": { description: "Referring provider required", category: "provider", disputeWorthy: false, autoResubmit: true, resubmitAction: "Add referring provider details" },
  "22": { description: "Procedure not covered under option", category: "benefit_limit", disputeWorthy: true, autoResubmit: false },
  "23": { description: "Medical savings account depleted", category: "benefit_limit", disputeWorthy: false, autoResubmit: false },
  "24": { description: "Above-threshold — case management referral", category: "threshold", disputeWorthy: true, autoResubmit: false },
  "25": { description: "Therapeutic substitution available", category: "clinical_coding", disputeWorthy: false, autoResubmit: false },
};

export type DisputeCategory =
  | "tariff"
  | "benefit_limit"
  | "auth_missing"
  | "clinical_coding"
  | "member_data"
  | "member_status"
  | "provider"
  | "timing"
  | "co_payment"
  | "pmb"
  | "duplicate"
  | "threshold"
  | "unknown";

// ─── Scheme Contact Details (for dispute templates) ─────────────────────────

const SCHEME_CONTACTS: Record<string, {
  disputeEmail: string;
  disputeFax: string;
  disputePhone: string;
  portalUrl: string;
  disputeAddress: string;
  turnaroundDays: number;
}> = {
  "Discovery Health": {
    disputeEmail: "claims@discovery.co.za",
    disputeFax: "011 539 2950",
    disputePhone: "0860 99 88 77",
    portalUrl: "https://www.discovery.co.za/medical-aid/provider-portal",
    disputeAddress: "PO Box 786722, Sandton, 2146",
    turnaroundDays: 30,
  },
  "GEMS": {
    disputeEmail: "enquiries@gems.gov.za",
    disputeFax: "012 431 0500",
    disputePhone: "0860 004 367",
    portalUrl: "https://www.gems.gov.za",
    disputeAddress: "Private Bag X782, Cape Town, 8000",
    turnaroundDays: 60,
  },
  "Bonitas": {
    disputeEmail: "bonclaim@medscheme.co.za",
    disputeFax: "086 100 1645",
    disputePhone: "0860 002 108",
    portalUrl: "https://www.bonitas.co.za",
    disputeAddress: "PO Box 74, Roodepoort, 1725",
    turnaroundDays: 30,
  },
  "Momentum Health": {
    disputeEmail: "healthclaims@momentum.co.za",
    disputeFax: "012 675 3911",
    disputePhone: "0860 11 78 59",
    portalUrl: "https://www.momentumhealth.co.za",
    disputeAddress: "PO Box 7400, Centurion, 0046",
    turnaroundDays: 30,
  },
  "Medihelp": {
    disputeEmail: "claims@medihelp.co.za",
    disputeFax: "012 334 2700",
    disputePhone: "086 010 2010",
    portalUrl: "https://www.medihelp.co.za",
    disputeAddress: "PO Box 26004, Arcadia, 0007",
    turnaroundDays: 30,
  },
};

// ─── Dispute Generator ──────────────────────────────────────────────────────

export interface PaymentDispute {
  claimRef: string;
  eraRef: string;
  scheme: string;
  claimedAmount: number;
  paidAmount: number;
  shortfall: number;
  /** BHF adjustment reason code */
  adjustmentCode?: string;
  adjustmentReason?: string;
  /** Dispute categorization based on BHF code */
  category: DisputeCategory;
  disputeReason: string;
  suggestedAction: string;
  /** Whether this item can be auto-resubmitted */
  autoResubmittable: boolean;
  /** Auto-resubmission action if applicable */
  resubmitAction?: string;
  /** Priority ranking (1=highest) */
  priority: number;
  /** Estimated recovery value in cents */
  estimatedRecovery: number;
}

export interface DisputeTemplate {
  /** Pre-filled dispute letter content */
  letterContent: string;
  /** Scheme contact for submission */
  schemeContact: {
    email: string;
    fax: string;
    phone: string;
    portalUrl: string;
    address: string;
  } | null;
  /** Expected turnaround in days */
  expectedTurnaroundDays: number;
  /** Deadline to submit dispute */
  submissionDeadline: string;
}

/** Minimum shortfall in cents to generate a dispute (R50 = 5000 cents) */
const DISPUTE_THRESHOLD_CENTS = 5_000;

/**
 * Generate disputes for underpaid claims with comprehensive BHF categorization.
 *
 * Rules:
 * - R50 threshold: shortfalls below R50 are not worth pursuing
 * - Categorized by BHF adjustment reason code
 * - Auto-resubmission flagged for correctable items
 * - Priority ranked by recovery value and dispute-worthiness
 */
export function generateDisputes(
  reconciliation: ReconciliationResult,
  schemeName: string,
): PaymentDispute[] {
  const disputes: PaymentDispute[] = [];

  for (const underpayment of reconciliation.underpayments) {
    const era = underpayment.eraLine;
    const shortfall = Math.abs(underpayment.variance);

    // R50 threshold — below R50 (5000 cents) is not worth the admin cost
    if (shortfall < DISPUTE_THRESHOLD_CENTS) continue;

    const bhfInfo = era.adjustmentCode
      ? BHF_ADJUSTMENT_CODES[era.adjustmentCode]
      : undefined;

    const category: DisputeCategory = bhfInfo?.category ?? "unknown";
    const autoResubmittable = bhfInfo?.autoResubmit ?? false;
    const resubmitAction = bhfInfo?.resubmitAction;

    let disputeReason = "";
    let suggestedAction = "";
    let priority = 3; // Default medium priority

    // Generate reason and action based on BHF category
    switch (category) {
      case "tariff":
        disputeReason = `Paid at scheme tariff rate instead of charged amount. Shortfall: ${formatZAR(shortfall)}. BHF code: ${era.adjustmentCode}`;
        suggestedAction = "Submit tariff dispute to scheme. If provider is contracted, scheme must pay contracted rate. Include fee schedule evidence.";
        priority = 2;
        break;

      case "benefit_limit":
        disputeReason = `Benefit exhausted or not covered (BHF code ${era.adjustmentCode}). Shortfall: ${formatZAR(shortfall)}`;
        suggestedAction = "Check if ICD-10 code qualifies as PMB condition. If yes, resubmit with PMB motivation — scheme must cover PMBs regardless of benefit limits.";
        priority = 1; // PMB disputes are highest value
        break;

      case "auth_missing":
        disputeReason = `Pre-authorisation not obtained. Shortfall: ${formatZAR(shortfall)}`;
        suggestedAction = "Apply for retrospective pre-authorization. If emergency admission, submit with emergency motivation — schemes must cover emergencies.";
        priority = 2;
        break;

      case "clinical_coding":
        disputeReason = `Clinical coding issue (BHF code ${era.adjustmentCode}): ${bhfInfo?.description}. Shortfall: ${formatZAR(shortfall)}`;
        suggestedAction = resubmitAction || "Correct coding and resubmit claim.";
        priority = 2;
        break;

      case "co_payment":
        disputeReason = `Co-payment applied. Patient liable for ${formatZAR(era.coPayment || shortfall)}`;
        suggestedAction = "Inform patient of co-payment. If PMB condition, dispute co-payment with scheme — PMBs should have no co-payment.";
        priority = 3;
        break;

      case "threshold":
        disputeReason = `Above-threshold case management referral (BHF code 24). Shortfall: ${formatZAR(shortfall)}`;
        suggestedAction = "Submit clinical motivation to case management. Request threshold increase if treatment is evidence-based.";
        priority = 1;
        break;

      case "provider":
        disputeReason = `Provider/network issue (BHF code ${era.adjustmentCode}). Shortfall: ${formatZAR(shortfall)}`;
        suggestedAction = "Verify network status. If emergency or no in-network provider available, submit out-of-network motivation.";
        priority = 2;
        break;

      default:
        disputeReason = `Underpaid by ${formatZAR(shortfall)}. Adjustment: ${era.adjustmentReason || bhfInfo?.description || "Not specified"} (code: ${era.adjustmentCode || "N/A"})`;
        suggestedAction = "Review claim and resubmit with additional motivation if warranted.";
        priority = 3;
        break;
    }

    disputes.push({
      claimRef: era.claimRef,
      eraRef: reconciliation.eraRef,
      scheme: schemeName,
      claimedAmount: era.claimedAmount,
      paidAmount: era.paidAmount,
      shortfall,
      adjustmentCode: era.adjustmentCode,
      adjustmentReason: era.adjustmentReason,
      category,
      disputeReason,
      suggestedAction,
      autoResubmittable,
      resubmitAction,
      priority,
      estimatedRecovery: shortfall,
    });
  }

  // Sort by priority (1=highest) then by recovery value (descending)
  disputes.sort((a, b) => a.priority - b.priority || b.estimatedRecovery - a.estimatedRecovery);

  return disputes;
}

/**
 * Generate a formal dispute letter template for a specific dispute.
 * Includes scheme contact details and submission deadline.
 */
export function generateDisputeTemplate(
  dispute: PaymentDispute,
  practiceDetails: {
    practiceName: string;
    bhfNumber: string;
    contactPerson: string;
    email: string;
    phone: string;
  },
): DisputeTemplate {
  const contact = SCHEME_CONTACTS[dispute.scheme] || null;
  const turnaroundDays = contact?.turnaroundDays || 30;

  // Schemes generally allow 4 months from payment date to dispute
  const deadline = new Date();
  deadline.setMonth(deadline.getMonth() + 4);

  const letterContent = `
PAYMENT DISPUTE — MEDICAL AID CLAIM
====================================

Date: ${new Date().toISOString().slice(0, 10)}
Practice: ${practiceDetails.practiceName}
BHF Number: ${practiceDetails.bhfNumber}
Contact: ${practiceDetails.contactPerson}
Email: ${practiceDetails.email}
Phone: ${practiceDetails.phone}

To: ${dispute.scheme} Claims Department
${contact ? `Email: ${contact.disputeEmail}` : ""}
${contact ? `Fax: ${contact.disputeFax}` : ""}

RE: DISPUTE OF CLAIM ${dispute.claimRef}
eRA Reference: ${dispute.eraRef}

Dear Claims Department,

We hereby dispute the payment of the above-referenced claim on the following grounds:

CLAIM DETAILS:
- Claim Reference: ${dispute.claimRef}
- Amount Billed: ${formatZAR(dispute.claimedAmount)}
- Amount Paid: ${formatZAR(dispute.paidAmount)}
- Shortfall: ${formatZAR(dispute.shortfall)}
- Adjustment Code: ${dispute.adjustmentCode || "N/A"}
- Adjustment Reason: ${dispute.adjustmentReason || "Not specified"}

DISPUTE REASON:
${dispute.disputeReason}

REQUESTED ACTION:
${dispute.suggestedAction}

We request that this claim be reviewed and the shortfall of ${formatZAR(dispute.shortfall)} be paid in full. If the claim was reduced due to tariff adjustments, we request payment at the contracted rate.

${dispute.category === "benefit_limit" ? "NOTE: If the diagnosis qualifies as a Prescribed Minimum Benefit (PMB) condition under the Medical Schemes Act, the scheme is legally obligated to cover this treatment regardless of benefit limits.\n" : ""}
Please respond within ${turnaroundDays} days as per CMS regulations.

Yours sincerely,
${practiceDetails.contactPerson}
${practiceDetails.practiceName}
BHF: ${practiceDetails.bhfNumber}
`.trim();

  return {
    letterContent,
    schemeContact: contact ? {
      email: contact.disputeEmail,
      fax: contact.disputeFax,
      phone: contact.disputePhone,
      portalUrl: contact.portalUrl,
      address: contact.disputeAddress,
    } : null,
    expectedTurnaroundDays: turnaroundDays,
    submissionDeadline: deadline.toISOString().slice(0, 10),
  };
}

/**
 * Get all auto-resubmittable disputes from a dispute list.
 * These are items where the BHF code indicates a correctable error
 * (e.g., missing pre-auth, coding error, missing referral).
 */
export function getAutoResubmittableDisputes(disputes: PaymentDispute[]): {
  resubmittable: PaymentDispute[];
  manualOnly: PaymentDispute[];
  totalResubmitValue: number;
  totalManualValue: number;
} {
  const resubmittable = disputes.filter(d => d.autoResubmittable);
  const manualOnly = disputes.filter(d => !d.autoResubmittable);

  return {
    resubmittable,
    manualOnly,
    totalResubmitValue: resubmittable.reduce((sum, d) => sum + d.estimatedRecovery, 0),
    totalManualValue: manualOnly.reduce((sum, d) => sum + d.estimatedRecovery, 0),
  };
}

/**
 * Generate a dispute summary report for a batch of disputes.
 */
export function generateDisputeSummary(disputes: PaymentDispute[]): {
  totalDisputes: number;
  totalValue: number;
  byCategory: Record<string, { count: number; value: number }>;
  byPriority: Record<number, { count: number; value: number }>;
  autoResubmitCount: number;
  autoResubmitValue: number;
  summary: string;
} {
  const byCategory: Record<string, { count: number; value: number }> = {};
  const byPriority: Record<number, { count: number; value: number }> = {};
  let autoResubmitCount = 0;
  let autoResubmitValue = 0;

  for (const d of disputes) {
    // By category
    if (!byCategory[d.category]) byCategory[d.category] = { count: 0, value: 0 };
    byCategory[d.category].count++;
    byCategory[d.category].value += d.estimatedRecovery;

    // By priority
    if (!byPriority[d.priority]) byPriority[d.priority] = { count: 0, value: 0 };
    byPriority[d.priority].count++;
    byPriority[d.priority].value += d.estimatedRecovery;

    // Auto-resubmit
    if (d.autoResubmittable) {
      autoResubmitCount++;
      autoResubmitValue += d.estimatedRecovery;
    }
  }

  const totalValue = disputes.reduce((sum, d) => sum + d.estimatedRecovery, 0);

  const categoryBreakdown = Object.entries(byCategory)
    .sort(([, a], [, b]) => b.value - a.value)
    .map(([cat, info]) => `  ${cat}: ${info.count} disputes, ${formatZAR(info.value)}`)
    .join("\n");

  const summary = [
    `Dispute Summary: ${disputes.length} disputes totalling ${formatZAR(totalValue)}`,
    `Auto-resubmittable: ${autoResubmitCount} (${formatZAR(autoResubmitValue)})`,
    `Manual review required: ${disputes.length - autoResubmitCount} (${formatZAR(totalValue - autoResubmitValue)})`,
    `\nBy category:\n${categoryBreakdown}`,
  ].join("\n");

  return {
    totalDisputes: disputes.length,
    totalValue,
    byCategory,
    byPriority,
    autoResubmitCount,
    autoResubmitValue,
    summary,
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function extractTag(xml: string, tag: string): string | null {
  const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = xml.match(new RegExp(`<${escapedTag}[^>]*>([^<]*)</${escapedTag}>`, "i"));
  return match ? match[1].trim() : null;
}
