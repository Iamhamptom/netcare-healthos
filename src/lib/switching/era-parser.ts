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

// ─── Dispute Generator ──────────────────────────────────────────────────────

export interface PaymentDispute {
  claimRef: string;
  eraRef: string;
  scheme: string;
  claimedAmount: number;
  paidAmount: number;
  shortfall: number;
  adjustmentCode?: string;
  adjustmentReason?: string;
  disputeReason: string;
  suggestedAction: string;
}

/**
 * Generate disputes for underpaid claims that should have been fully covered.
 * Focuses on PMB conditions and scheme tariff violations.
 */
export function generateDisputes(
  reconciliation: ReconciliationResult,
  schemeName: string,
): PaymentDispute[] {
  const disputes: PaymentDispute[] = [];

  for (const underpayment of reconciliation.underpayments) {
    const era = underpayment.eraLine;
    const shortfall = Math.abs(underpayment.variance);

    // Only dispute significant shortfalls (> R50)
    if (shortfall < 5000) continue;

    let disputeReason = "";
    let suggestedAction = "";

    if (era.adjustmentCode === "15" || era.adjustmentReason?.includes("tariff")) {
      disputeReason = `Paid at scheme tariff rate instead of charged amount. Shortfall: ${formatZAR(shortfall)}`;
      suggestedAction = "Submit tariff dispute to scheme. If provider is contracted, scheme must pay contracted rate.";
    } else if (era.adjustmentCode === "07") {
      disputeReason = `Benefit exhausted but claim may qualify as PMB. Shortfall: ${formatZAR(shortfall)}`;
      suggestedAction = "Check if ICD-10 code qualifies as PMB condition. If yes, resubmit with PMB motivation.";
    } else if (era.adjustmentCode === "14") {
      disputeReason = `Co-payment applied. Patient liable for ${formatZAR(era.coPayment || shortfall)}`;
      suggestedAction = "Inform patient of co-payment. If PMB condition, dispute co-payment with scheme.";
    } else {
      disputeReason = `Underpaid by ${formatZAR(shortfall)}. Adjustment: ${era.adjustmentReason || "Not specified"}`;
      suggestedAction = "Review claim and resubmit with additional motivation if warranted.";
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
      disputeReason,
      suggestedAction,
    });
  }

  return disputes;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function extractTag(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "i"));
  return match ? match[1].trim() : null;
}
