// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Electronic Remittance Advice (eRA) Reconciliation Adapter
// Parses payment advice from medical aids and auto-matches to ho_invoices
// Flags unmatched items for manual review + generates variance reports
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── Types ────────────────────────────────────────────────────────────────────

export interface ERALine {
  /** Claim reference from switch (e.g. "HB-CLM-20260318-001" or "SW-17234...") */
  claimRef: string;
  /** Patient name as on scheme */
  patientName: string;
  /** Membership number */
  membershipNumber: string;
  /** Dependent code */
  dependentCode: string;
  /** Date of service (YYYY-MM-DD) */
  dateOfService: string;
  /** CPT/tariff procedure code */
  tariffCode: string;
  /** ICD-10 diagnosis code */
  icd10Code?: string;
  /** NAPPI code (if medicine) */
  nappiCode?: string;
  /** Amount billed by practice (cents) */
  billedAmountCents: number;
  /** Amount approved by scheme (cents) */
  approvedAmountCents: number;
  /** Amount actually paid by scheme (cents) */
  paidAmountCents: number;
  /** Adjustment reason code (BHF/PHISC standard) */
  adjustmentReasonCode?: string;
  /** Adjustment reason text */
  adjustmentReason?: string;
  /** Adjustment amount (cents) — difference between billed and paid */
  adjustmentAmountCents?: number;
  /** Co-payment amount patient must pay (cents) */
  coPaymentCents?: number;
  /** Patient liability amount (cents) */
  patientLiabilityCents?: number;
  /** Scheme tariff rate applied (cents) */
  schemeTariffRateCents?: number;
}

export interface ERADocument {
  /** Unique remittance reference */
  remittanceRef: string;
  /** Medical aid scheme name */
  schemeName: string;
  /** Scheme administrator */
  administrator: string;
  /** Payment date (YYYY-MM-DD) */
  paymentDate: string;
  /** Payment method */
  paymentMethod: "EFT" | "cheque" | "direct";
  /** Bank reference for EFT */
  bankReference?: string;
  /** Total amount paid in this remittance (cents) */
  totalPaidCents: number;
  /** Individual payment lines */
  lines: ERALine[];
  /** When this eRA was received/processed */
  receivedAt: string;
  /** Source switch: healthbridge | switchon | medikredit */
  sourceSwitch: string;
}

export interface InvoiceRecord {
  /** Invoice ID in ho_invoices */
  id: string;
  /** Claim reference / transaction ref from switch */
  claimRef: string;
  /** Invoice number (practice-assigned) */
  invoiceNumber: string;
  /** Patient name */
  patientName: string;
  /** Membership number */
  membershipNumber: string;
  /** Dependent code */
  dependentCode: string;
  /** Date of service */
  dateOfService: string;
  /** Tariff code on the invoice line */
  tariffCode?: string;
  /** Total billed amount (cents) */
  billedAmountCents: number;
  /** Scheme name */
  schemeName: string;
  /** Current invoice status */
  status: "submitted" | "accepted" | "rejected" | "paid" | "partial" | "disputed";
}

export interface MatchedERAItem {
  /** The eRA payment line */
  eraLine: ERALine;
  /** The matched invoice from ho_invoices */
  invoice: InvoiceRecord;
  /** Match method used */
  matchType: "claim_ref" | "membership_date" | "membership_date_amount" | "manual";
  /** Match confidence (0-100) */
  confidence: number;
  /** Variance: paid minus billed (negative = underpaid) */
  varianceCents: number;
  /** Formatted variance (e.g. "-R156.00" or "+R0.00") */
  varianceFormatted: string;
  /** Patient shortfall to collect (cents) */
  patientShortfallCents: number;
  /** Whether a dispute is recommended */
  disputeRecommended: boolean;
  /** Dispute reason if recommended */
  disputeReason?: string;
}

export interface UnmatchedERAItem {
  /** The unmatched eRA payment line */
  eraLine: ERALine;
  /** Why it could not be matched */
  reason: string;
  /** Suggested action */
  suggestedAction: string;
  /** Flagged for manual review */
  flaggedForReview: boolean;
}

export interface ERAReconciliationReport {
  /** Remittance reference being reconciled */
  remittanceRef: string;
  /** Scheme name */
  schemeName: string;
  /** Payment date */
  paymentDate: string;
  /** Total lines in eRA */
  totalLines: number;
  /** Successfully matched lines */
  matchedCount: number;
  /** Unmatched lines requiring review */
  unmatchedCount: number;
  /** Matched items with details */
  matched: MatchedERAItem[];
  /** Unmatched items with review flags */
  unmatched: UnmatchedERAItem[];
  /** Financial summary */
  financials: {
    /** Total billed across matched items (cents) */
    totalBilledCents: number;
    /** Total paid by scheme (cents) */
    totalPaidCents: number;
    /** Total variance (paid - billed, negative = shortfall) */
    totalVarianceCents: number;
    /** Total patient shortfall to collect (cents) */
    totalPatientShortfallCents: number;
    /** Number of items with disputes recommended */
    disputeCount: number;
    /** Estimated dispute recovery value (cents) */
    disputeValueCents: number;
    /** Total amount in unmatched lines (cents) */
    unmatchedAmountCents: number;
  };
  /** Formatted summary text */
  summary: string;
  /** Generated at timestamp */
  generatedAt: string;
}

// ── Adjustment Reason Codes (BHF Standard) ──────────────────────────────────

const ADJUSTMENT_REASONS: Record<string, { description: string; disputeWorthy: boolean }> = {
  "01": { description: "Member not found on scheme", disputeWorthy: false },
  "04": { description: "Member suspended — arrear contributions", disputeWorthy: false },
  "05": { description: "Duplicate claim", disputeWorthy: false },
  "07": { description: "Benefit exhausted for category", disputeWorthy: true },
  "08": { description: "Pre-authorisation not obtained", disputeWorthy: true },
  "13": { description: "Above scheme tariff — reduced to scheme rate", disputeWorthy: true },
  "14": { description: "Co-payment applied", disputeWorthy: false },
  "15": { description: "Paid at scheme tariff rate (lower than billed)", disputeWorthy: true },
  "16": { description: "PMB condition — paid at cost", disputeWorthy: false },
  "17": { description: "Waiting period applies", disputeWorthy: false },
  "22": { description: "Procedure not covered under option", disputeWorthy: true },
  "23": { description: "Medical savings account depleted", disputeWorthy: false },
  "24": { description: "Above-threshold — case management referral", disputeWorthy: true },
  "25": { description: "Therapeutic substitution available", disputeWorthy: false },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatZAR(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  return `${sign}R${(abs / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

// ── eRA Reconciler ───────────────────────────────────────────────────────────

export class ERAReconciler {
  constructor() {
    // No config needed — reconciliation is local logic
  }

  // ── Parse eRA ──────────────────────────────────────────────────────────

  /**
   * Parse a raw eRA input into a structured ERADocument.
   * Accepts either:
   *  - XML (from Healthbridge/SwitchOn eRA feeds)
   *  - JSON (from API integrations)
   *  - undefined (returns a realistic mock for demo)
   */
  parseERA(input?: string | Record<string, unknown>): ERADocument {
    console.log("[era] Parsing Electronic Remittance Advice");

    if (typeof input === "string" && input.trim().startsWith("<")) {
      return this.parseERAXml(input);
    }

    if (typeof input === "object" && input !== null) {
      return this.parseERAJson(input);
    }

    // Return mock eRA for demo
    return this.generateMockERA();
  }

  // ── Match to Invoices ──────────────────────────────────────────────────

  /**
   * Auto-match eRA payment lines to invoices from ho_invoices.
   * Uses a multi-strategy matching approach:
   *  1. Exact match on claim reference number
   *  2. Match by membership number + date of service
   *  3. Match by membership number + date + amount
   * Returns matched and unmatched items with confidence scores.
   */
  matchToInvoices(era: ERADocument, invoices: InvoiceRecord[]): {
    matched: MatchedERAItem[];
    unmatched: UnmatchedERAItem[];
  } {
    console.log(`[era] Matching ${era.lines.length} eRA lines against ${invoices.length} invoices`);

    // Build lookup indices for O(1) matching
    const byClaimRef = new Map<string, InvoiceRecord>();
    const byMemberDate = new Map<string, InvoiceRecord[]>();
    const byMemberDateAmount = new Map<string, InvoiceRecord>();

    for (const inv of invoices) {
      // Index by claim ref
      if (inv.claimRef) {
        byClaimRef.set(inv.claimRef, inv);
      }

      // Index by membership + date
      const mdKey = `${inv.membershipNumber}|${inv.dateOfService}`;
      if (!byMemberDate.has(mdKey)) byMemberDate.set(mdKey, []);
      byMemberDate.get(mdKey)!.push(inv);

      // Index by membership + date + amount
      const mdaKey = `${inv.membershipNumber}|${inv.dateOfService}|${inv.billedAmountCents}`;
      byMemberDateAmount.set(mdaKey, inv);
    }

    const matched: MatchedERAItem[] = [];
    const unmatched: UnmatchedERAItem[] = [];

    for (const line of era.lines) {
      let invoice: InvoiceRecord | undefined;
      let matchType: MatchedERAItem["matchType"] = "claim_ref";
      let confidence = 0;

      // Strategy 1: Exact match on claim reference
      invoice = byClaimRef.get(line.claimRef);
      if (invoice) {
        matchType = "claim_ref";
        confidence = 100;
      }

      // Strategy 2: Match by membership + date of service
      if (!invoice) {
        const mdKey = `${line.membershipNumber}|${line.dateOfService}`;
        const candidates = byMemberDate.get(mdKey);
        if (candidates?.length === 1) {
          invoice = candidates[0];
          matchType = "membership_date";
          confidence = 85;
        } else if (candidates && candidates.length > 1) {
          // Strategy 3: Narrow down by amount
          const mdaKey = `${line.membershipNumber}|${line.dateOfService}|${line.billedAmountCents}`;
          invoice = byMemberDateAmount.get(mdaKey);
          if (invoice) {
            matchType = "membership_date_amount";
            confidence = 90;
          }
        }
      }

      if (invoice) {
        const varianceCents = line.paidAmountCents - line.billedAmountCents;
        const patientShortfallCents = Math.max(0, line.billedAmountCents - line.paidAmountCents - (line.coPaymentCents || 0));

        // Determine if dispute is recommended
        let disputeRecommended = false;
        let disputeReason: string | undefined;

        if (line.adjustmentReasonCode) {
          const adjInfo = ADJUSTMENT_REASONS[line.adjustmentReasonCode];
          if (adjInfo?.disputeWorthy && Math.abs(varianceCents) > 5_000) {
            // Only dispute if shortfall > R50
            disputeRecommended = true;
            disputeReason = `${adjInfo.description}. Shortfall: ${formatZAR(Math.abs(varianceCents))}. Consider resubmission with additional motivation.`;
          }
        }

        matched.push({
          eraLine: line,
          invoice,
          matchType,
          confidence,
          varianceCents,
          varianceFormatted: `${varianceCents >= 0 ? "+" : ""}${formatZAR(varianceCents)}`,
          patientShortfallCents,
          disputeRecommended,
          disputeReason,
        });
      } else {
        // Determine reason for mismatch
        let reason = "No matching invoice found in ho_invoices";
        let suggestedAction = "Search manually by patient name and date of service";

        if (!line.claimRef) {
          reason = "Claim reference is missing from eRA line";
          suggestedAction = "Contact scheme administrator for claim reference, then re-match";
        } else if (!byClaimRef.has(line.claimRef)) {
          reason = `Claim reference "${line.claimRef}" not found — may have been submitted via a different switch or practice`;
          suggestedAction = "Check if claim was submitted via Healthbridge or SwitchOn, and verify claim ref";
        }

        unmatched.push({
          eraLine: line,
          reason,
          suggestedAction,
          flaggedForReview: true,
        });
      }
    }

    console.log(`[era] Matching complete: ${matched.length} matched, ${unmatched.length} unmatched`);

    return { matched, unmatched };
  }

  // ── Get Unmatched Items ────────────────────────────────────────────────

  /**
   * Get only unmatched items from a reconciliation, filtered by criteria.
   * Useful for building a manual review queue.
   */
  getUnmatchedItems(
    era: ERADocument,
    invoices: InvoiceRecord[],
    filters?: {
      /** Minimum unmatched amount to include (cents) */
      minAmountCents?: number;
      /** Filter by scheme name */
      schemeName?: string;
      /** Only flagged for review */
      flaggedOnly?: boolean;
    },
  ): UnmatchedERAItem[] {
    console.log("[era] Retrieving unmatched items for manual review");

    const { unmatched } = this.matchToInvoices(era, invoices);

    let filtered = unmatched;

    if (filters?.minAmountCents) {
      filtered = filtered.filter(u => u.eraLine.paidAmountCents >= filters.minAmountCents!);
    }

    if (filters?.flaggedOnly) {
      filtered = filtered.filter(u => u.flaggedForReview);
    }

    console.log(`[era] ${filtered.length} unmatched items after filtering (of ${unmatched.length} total)`);

    return filtered;
  }

  // ── Generate Report ────────────────────────────────────────────────────

  /**
   * Generate a full reconciliation report for an eRA document.
   * Includes financial summary, variance analysis, and dispute recommendations.
   */
  generateReport(era: ERADocument, invoices: InvoiceRecord[]): ERAReconciliationReport {
    console.log(`[era] Generating reconciliation report for ${era.remittanceRef}`);

    const { matched, unmatched } = this.matchToInvoices(era, invoices);

    // Calculate financials
    const totalBilledCents = matched.reduce((sum, m) => sum + m.eraLine.billedAmountCents, 0);
    const totalPaidCents = matched.reduce((sum, m) => sum + m.eraLine.paidAmountCents, 0);
    const totalVarianceCents = totalPaidCents - totalBilledCents;
    const totalPatientShortfallCents = matched.reduce((sum, m) => sum + m.patientShortfallCents, 0);

    const disputeItems = matched.filter(m => m.disputeRecommended);
    const disputeValueCents = disputeItems.reduce((sum, m) => sum + Math.abs(m.varianceCents), 0);

    const unmatchedAmountCents = unmatched.reduce((sum, u) => sum + u.eraLine.paidAmountCents, 0);

    // Build summary text
    const summaryParts: string[] = [
      `eRA ${era.remittanceRef} from ${era.schemeName}`,
      `${era.lines.length} payment lines | Payment date: ${era.paymentDate}`,
      `Matched: ${matched.length}/${era.lines.length} (${((matched.length / era.lines.length) * 100).toFixed(0)}%)`,
      `Total billed: ${formatZAR(totalBilledCents)} | Total paid: ${formatZAR(totalPaidCents)}`,
    ];

    if (totalVarianceCents !== 0) {
      summaryParts.push(`Variance: ${formatZAR(totalVarianceCents)} (${totalVarianceCents < 0 ? "underpaid" : "overpaid"})`);
    }

    if (totalPatientShortfallCents > 0) {
      summaryParts.push(`Patient shortfall to collect: ${formatZAR(totalPatientShortfallCents)}`);
    }

    if (disputeItems.length > 0) {
      summaryParts.push(`Disputes recommended: ${disputeItems.length} (potential recovery: ${formatZAR(disputeValueCents)})`);
    }

    if (unmatched.length > 0) {
      summaryParts.push(`Unmatched: ${unmatched.length} lines (${formatZAR(unmatchedAmountCents)}) — flagged for manual review`);
    }

    const report: ERAReconciliationReport = {
      remittanceRef: era.remittanceRef,
      schemeName: era.schemeName,
      paymentDate: era.paymentDate,
      totalLines: era.lines.length,
      matchedCount: matched.length,
      unmatchedCount: unmatched.length,
      matched,
      unmatched,
      financials: {
        totalBilledCents,
        totalPaidCents,
        totalVarianceCents,
        totalPatientShortfallCents,
        disputeCount: disputeItems.length,
        disputeValueCents,
        unmatchedAmountCents,
      },
      summary: summaryParts.join("\n"),
      generatedAt: new Date().toISOString(),
    };

    console.log(`[era] Report generated: ${matched.length} matched, ${unmatched.length} unmatched, variance ${formatZAR(totalVarianceCents)}`);

    return report;
  }

  // ── XML Parser ─────────────────────────────────────────────────────────

  private parseERAXml(xml: string): ERADocument {
    console.log("[era] Parsing eRA from XML format");

    const remittanceRef = this.extractTag(xml, "RemittanceRef") || this.extractTag(xml, "RemittanceReference") || `ERA-${Date.now()}`;
    const schemeName = this.extractTag(xml, "SchemeName") || this.extractTag(xml, "Scheme") || "Unknown Scheme";
    const administrator = this.extractTag(xml, "Administrator") || this.extractTag(xml, "AdminName") || schemeName;
    const paymentDate = this.extractTag(xml, "PaymentDate") || new Date().toISOString().slice(0, 10);
    const paymentMethod = (this.extractTag(xml, "PaymentMethod") || "EFT") as ERADocument["paymentMethod"];
    const bankRef = this.extractTag(xml, "BankReference");

    // Parse line items from XML blocks
    const lines: ERALine[] = [];
    const linePattern = /<(?:Payment|Line|ClaimPayment|RemittanceLine)[^>]*>([\s\S]*?)<\/(?:Payment|Line|ClaimPayment|RemittanceLine)>/gi;
    let match: RegExpExecArray | null;

    while ((match = linePattern.exec(xml)) !== null) {
      const block = match[1];
      lines.push({
        claimRef: this.extractTag(block, "ClaimRef") || this.extractTag(block, "ClaimReference") || this.extractTag(block, "TransactionRef") || "",
        patientName: this.extractTag(block, "PatientName") || this.extractTag(block, "Name") || "",
        membershipNumber: this.extractTag(block, "MembershipNumber") || this.extractTag(block, "MemberNo") || "",
        dependentCode: this.extractTag(block, "DependentCode") || this.extractTag(block, "DepCode") || "00",
        dateOfService: this.extractTag(block, "DateOfService") || this.extractTag(block, "DOS") || "",
        tariffCode: this.extractTag(block, "TariffCode") || this.extractTag(block, "ProcedureCode") || this.extractTag(block, "CPT") || "",
        icd10Code: this.extractTag(block, "ICD10") || this.extractTag(block, "DiagnosisCode") || undefined,
        nappiCode: this.extractTag(block, "NappiCode") || undefined,
        billedAmountCents: parseInt(this.extractTag(block, "ClaimedAmount") || this.extractTag(block, "Claimed") || "0", 10),
        approvedAmountCents: parseInt(this.extractTag(block, "ApprovedAmount") || this.extractTag(block, "Approved") || "0", 10),
        paidAmountCents: parseInt(this.extractTag(block, "PaidAmount") || this.extractTag(block, "Paid") || "0", 10),
        adjustmentReasonCode: this.extractTag(block, "AdjustmentCode") || this.extractTag(block, "ReasonCode") || undefined,
        adjustmentReason: this.extractTag(block, "AdjustmentReason") || this.extractTag(block, "Reason") || undefined,
        adjustmentAmountCents: parseInt(this.extractTag(block, "AdjustmentAmount") || "0", 10) || undefined,
        coPaymentCents: parseInt(this.extractTag(block, "CoPayment") || "0", 10) || undefined,
        patientLiabilityCents: parseInt(this.extractTag(block, "PatientLiability") || "0", 10) || undefined,
        schemeTariffRateCents: parseInt(this.extractTag(block, "SchemeTariffRate") || "0", 10) || undefined,
      });
    }

    const totalPaidCents = lines.reduce((sum, li) => sum + li.paidAmountCents, 0);

    return {
      remittanceRef,
      schemeName,
      administrator,
      paymentDate,
      paymentMethod,
      bankReference: bankRef || undefined,
      totalPaidCents,
      lines,
      receivedAt: new Date().toISOString(),
      sourceSwitch: "unknown",
    };
  }

  // ── JSON Parser ────────────────────────────────────────────────────────

  private parseERAJson(data: Record<string, unknown>): ERADocument {
    console.log("[era] Parsing eRA from JSON format");

    return {
      remittanceRef: (data.remittanceRef as string) || `ERA-${Date.now()}`,
      schemeName: (data.schemeName as string) || "Unknown",
      administrator: (data.administrator as string) || "",
      paymentDate: (data.paymentDate as string) || new Date().toISOString().slice(0, 10),
      paymentMethod: ((data.paymentMethod as string) || "EFT") as ERADocument["paymentMethod"],
      bankReference: data.bankReference as string | undefined,
      totalPaidCents: (data.totalPaidCents as number) || 0,
      lines: (data.lines as ERALine[]) || [],
      receivedAt: new Date().toISOString(),
      sourceSwitch: (data.sourceSwitch as string) || "unknown",
    };
  }

  // ── Mock eRA Generator ────────────────────────────────────────────────

  private generateMockERA(): ERADocument {
    const remittanceRef = `ERA-${Date.now().toString(36).toUpperCase()}`;

    const lines: ERALine[] = [
      {
        claimRef: "HB-CLM-20260318-001",
        patientName: "John Mokoena",
        membershipNumber: "900012345",
        dependentCode: "00",
        dateOfService: "2026-03-18",
        tariffCode: "0190",
        icd10Code: "I10",
        billedAmountCents: 52_000,
        approvedAmountCents: 52_000,
        paidAmountCents: 52_000,
      },
      {
        claimRef: "HB-CLM-20260318-002",
        patientName: "John Mokoena",
        membershipNumber: "900012345",
        dependentCode: "00",
        dateOfService: "2026-03-18",
        tariffCode: "0308",
        icd10Code: "I10",
        billedAmountCents: 35_000,
        approvedAmountCents: 35_000,
        paidAmountCents: 35_000,
      },
      {
        claimRef: "SW-20260319-A1B2",
        patientName: "Priya Naidoo",
        membershipNumber: "800067890",
        dependentCode: "01",
        dateOfService: "2026-03-19",
        tariffCode: "0190",
        icd10Code: "J06.9",
        billedAmountCents: 52_000,
        approvedAmountCents: 52_000,
        paidAmountCents: 52_000,
      },
      {
        claimRef: "SW-20260319-C3D4",
        patientName: "Thabo Molefe",
        membershipNumber: "700011111",
        dependentCode: "00",
        dateOfService: "2026-03-19",
        tariffCode: "0193",
        icd10Code: "E11.9",
        billedAmountCents: 78_000,
        approvedAmountCents: 62_400,
        paidAmountCents: 62_400,
        adjustmentReasonCode: "15",
        adjustmentReason: "Paid at scheme tariff rate",
        adjustmentAmountCents: 15_600,
        coPaymentCents: 15_600,
      },
      {
        claimRef: "HB-CLM-20260319-005",
        patientName: "Fatima Adams",
        membershipNumber: "600055555",
        dependentCode: "00",
        dateOfService: "2026-03-19",
        tariffCode: "0382",
        icd10Code: "E11.9",
        billedAmountCents: 6_500,
        approvedAmountCents: 6_500,
        paidAmountCents: 6_500,
      },
      {
        claimRef: "HB-CLM-20260319-006",
        patientName: "Nomsa Dlamini",
        membershipNumber: "500099999",
        dependentCode: "00",
        dateOfService: "2026-03-19",
        tariffCode: "0193",
        icd10Code: "E78.0",
        billedAmountCents: 78_000,
        approvedAmountCents: 0,
        paidAmountCents: 0,
        adjustmentReasonCode: "07",
        adjustmentReason: "Benefits exhausted for GP consultations category",
        adjustmentAmountCents: 78_000,
        patientLiabilityCents: 78_000,
      },
      {
        claimRef: "UNKNOWN-REF-789",
        patientName: "Unknown Patient",
        membershipNumber: "999999999",
        dependentCode: "00",
        dateOfService: "2026-03-17",
        tariffCode: "0190",
        billedAmountCents: 52_000,
        approvedAmountCents: 52_000,
        paidAmountCents: 52_000,
      },
    ];

    const totalPaid = lines.reduce((sum, li) => sum + li.paidAmountCents, 0);

    console.log(`[era] Generated mock eRA: ${remittanceRef} | ${lines.length} lines | Total paid: ${formatZAR(totalPaid)}`);

    return {
      remittanceRef,
      schemeName: "Discovery Health",
      administrator: "Discovery Health Medical Scheme",
      paymentDate: new Date().toISOString().slice(0, 10),
      paymentMethod: "EFT",
      bankReference: `FNB-${Date.now().toString().slice(-8)}`,
      totalPaidCents: totalPaid,
      lines,
      receivedAt: new Date().toISOString(),
      sourceSwitch: "healthbridge",
    };
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  private extractTag(xml: string, tag: string): string | null {
    const match = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "i"));
    return match ? match[1].trim() : null;
  }
}

// ── Singleton Export ──────────────────────────────────────────────────────────

let _instance: ERAReconciler | null = null;

export function getERAReconciler(): ERAReconciler {
  if (!_instance) {
    _instance = new ERAReconciler();
  }
  return _instance;
}

export { ADJUSTMENT_REASONS, formatZAR };
