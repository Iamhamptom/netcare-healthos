// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Healthbridge Integration Adapter
// SA's largest PMS + claims switch — 7K practices, 3.25M encounters/year
// Real-time EDI for claims with instant accept/reject responses
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { logger } from "@/lib/logger";

// ── Types ────────────────────────────────────────────────────────────────────

export interface HealthbridgeConfig {
  /** Healthbridge API base URL */
  baseUrl: string;
  /** Practice BHF number (Board of Healthcare Funders) */
  bhfNumber: string;
  /** API key issued by Healthbridge */
  apiKey: string;
  /** Practice number registered with Healthbridge */
  practiceNumber: string;
  /** Timeout in ms for API calls (default: 30000) */
  timeoutMs?: number;
}

export interface HealthbridgeClaimLineItem {
  /** Line item sequence number (1-based) */
  lineNumber: number;
  /** ICD-10-ZA diagnosis code (e.g. "I10", "E11.9", "J06.9") */
  icd10Code: string;
  /** ICD-10 description */
  icd10Description?: string;
  /** CPT / tariff procedure code (e.g. "0190" = GP consult, "0193" = extended consult) */
  tariffCode: string;
  /** NAPPI code for medicines/consumables (e.g. "715484" = Metformin 500mg) */
  nappiCode?: string;
  /** Description of the service or item */
  description: string;
  /** Quantity dispensed/performed */
  quantity: number;
  /** Amount in cents (ZAR) — e.g. 52000 = R520.00 */
  amountCents: number;
  /** Place of service code (11 = Office, 21 = Hospital inpatient, 22 = Hospital outpatient) */
  placeOfService?: string;
  /** Modifier codes (e.g. "0002" = after hours) */
  modifiers?: string[];
}

export interface HealthbridgeClaim {
  /** Unique claim identifier */
  claimId?: string;
  /** Practice BHF number */
  bhfNumber: string;
  /** Treating provider PCNS number */
  providerPcns: string;
  /** Treating provider name */
  providerName: string;
  /** Referring provider PCNS (if applicable) */
  referringProviderPcns?: string;
  /** Patient full name */
  patientName: string;
  /** Patient date of birth (YYYY-MM-DD) */
  patientDob: string;
  /** SA ID number (13 digits) */
  patientIdNumber: string;
  /** Medical aid scheme name (e.g. "Discovery Health", "GEMS", "Bonitas") */
  schemeName: string;
  /** Scheme option/plan (e.g. "Executive Plan", "Emerald Value", "BonFit Select") */
  schemeOption?: string;
  /** Membership number on the medical aid */
  membershipNumber: string;
  /** Dependent code ("00" = main member, "01" = spouse, "02"+ = children) */
  dependentCode: string;
  /** Date of service (YYYY-MM-DD) */
  dateOfService: string;
  /** Pre-authorization number (required for certain procedures) */
  authorizationNumber?: string;
  /** Claim line items */
  lineItems: HealthbridgeClaimLineItem[];
  /** Total claim amount in cents */
  totalAmountCents: number;
  /** Linked invoice ID in ho_invoices */
  invoiceId?: string;
}

export interface HealthbridgeClaimResponse {
  /** Whether the claim was accepted by the switch */
  accepted: boolean;
  /** Healthbridge transaction reference */
  transactionRef: string;
  /** Overall claim status */
  status: "accepted" | "rejected" | "pending" | "partial";
  /** Approved amount in cents (may differ from claimed) */
  approvedAmountCents: number;
  /** Rejection code (Healthbridge-specific, maps to BHF standard codes) */
  rejectionCode?: string;
  /** Human-readable rejection reason */
  rejectionReason?: string;
  /** Per-line-item responses */
  lineResponses: HealthbridgeLineResponse[];
  /** Scheme tariff rate applied (cents) */
  schemeTariffRate?: number;
  /** Patient co-payment amount (cents) */
  coPaymentCents?: number;
  /** Timestamp of switch response */
  respondedAt: string;
  /** Raw XML response from Healthbridge (for audit trail) */
  rawXml?: string;
}

export interface HealthbridgeLineResponse {
  lineNumber: number;
  status: "accepted" | "rejected" | "adjusted";
  approvedAmountCents: number;
  rejectionCode?: string;
  rejectionReason?: string;
  adjustmentReasonCode?: string;
}

export interface HealthbridgeMembershipResult {
  /** Whether the member is active on the scheme */
  eligible: boolean;
  /** Member full name as registered */
  memberName: string;
  /** Membership number */
  membershipNumber: string;
  /** Dependent code */
  dependentCode: string;
  /** Scheme name */
  schemeName: string;
  /** Scheme option/plan */
  schemeOption: string;
  /** Whether pre-auth is required for this member's plan */
  preAuthRequired: boolean;
  /** Available benefits summary */
  benefits: HealthbridgeBenefit[];
  /** Membership status */
  status: "active" | "suspended" | "terminated" | "pending";
  /** Effective date of cover */
  effectiveDate: string;
  /** End date of cover (if terminated) */
  terminationDate?: string;
}

export interface HealthbridgeBenefit {
  category: string;
  available: boolean;
  remainingAmountCents: number;
  usedAmountCents: number;
  annualLimitCents: number;
}

export interface HealthbridgeERALine {
  claimRef: string;
  membershipNumber: string;
  dependentCode: string;
  patientName: string;
  dateOfService: string;
  tariffCode: string;
  icd10Code?: string;
  claimedAmountCents: number;
  approvedAmountCents: number;
  paidAmountCents: number;
  adjustmentCode?: string;
  adjustmentReason?: string;
  coPaymentCents?: number;
}

export interface HealthbridgeERA {
  remittanceRef: string;
  schemeName: string;
  administrator: string;
  paymentDate: string;
  paymentMethod: "EFT" | "cheque" | "direct";
  bankReference?: string;
  totalAmountCents: number;
  lineItems: HealthbridgeERALine[];
  receivedAt: string;
}

// ── Rejection Code Map (BHF Standard) ────────────────────────────────────────

const REJECTION_CODES: Record<string, string> = {
  "01": "Member not found on scheme",
  "02": "Membership number invalid",
  "03": "Dependent code invalid",
  "04": "Member benefits exhausted",
  "05": "Claim duplicated — already submitted",
  "06": "ICD-10 code invalid or not billable",
  "07": "Benefits exhausted for this category",
  "08": "Pre-authorization required but not provided",
  "09": "Provider not contracted with scheme",
  "10": "Date of service outside cover period",
  "11": "NAPPI code not on scheme formulary",
  "12": "Tariff code invalid for place of service",
  "13": "Claim exceeds scheme tariff rate",
  "14": "Co-payment applies — patient portion deducted",
  "15": "Paid at scheme tariff rate (lower than billed)",
  "16": "PMB condition — paid at cost regardless of option",
  "17": "Waiting period applies — member not yet eligible",
  "18": "Late submission — claim older than 4 months",
  "19": "Insufficient clinical information",
  "20": "Referring provider details required",
};

// ── Adapter ──────────────────────────────────────────────────────────────────

export class HealthbridgeAdapter {
  private config: HealthbridgeConfig;
  private connected: boolean = false;

  constructor(config?: Partial<HealthbridgeConfig>) {
    this.config = {
      baseUrl: config?.baseUrl || process.env.HEALTHBRIDGE_API_URL || "https://api.healthbridge.co.za/v2",
      bhfNumber: config?.bhfNumber || process.env.HEALTHBRIDGE_BHF_NUMBER || "",
      apiKey: config?.apiKey || process.env.HEALTHBRIDGE_API_KEY || "",
      practiceNumber: config?.practiceNumber || process.env.HEALTHBRIDGE_PRACTICE_NUMBER || "",
      timeoutMs: config?.timeoutMs ?? 30_000,
    };
  }

  /**
   * Check if the adapter has valid configuration for live API calls.
   * Returns false when running with stubs.
   */
  isConfigured(): boolean {
    return !!(this.config.apiKey && this.config.bhfNumber && this.config.practiceNumber);
  }

  // ── Submit Claim ─────────────────────────────────────────────────────────

  /**
   * Submit a claim to Healthbridge via real-time EDI.
   * Returns an instant accept/reject response.
   *
   * In production this calls the Healthbridge Claims API endpoint.
   * Currently returns realistic mock responses for demo/development.
   */
  async submitClaim(claim: HealthbridgeClaim): Promise<HealthbridgeClaimResponse> {
    logger.info(`[healthbridge] Submitting claim | Scheme: [REDACTED] | Total: R${(claim.totalAmountCents / 100).toFixed(2)}`);
    logger.info(`[healthbridge] Line items: ${claim.lineItems.length} | ICD-10: ${claim.lineItems.map(li => li.icd10Code).join(", ")}`);

    if (this.isConfigured()) {
      // TODO: Replace with real Healthbridge API call
      // const response = await fetch(`${this.config.baseUrl}/claims/submit`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/xml",
      //     "X-API-Key": this.config.apiKey,
      //     "X-BHF-Number": this.config.bhfNumber,
      //   },
      //   body: this.buildClaimXml(claim),
      //   signal: AbortSignal.timeout(this.config.timeoutMs!),
      // });
      // return this.parseClaimResponse(await response.text());
    }

    // ── Mock Response Logic ──────────────────────────────────────────────
    return this.generateMockClaimResponse(claim);
  }

  // ── Check Membership ─────────────────────────────────────────────────────

  /**
   * Real-time membership verification against the medical aid scheme.
   * Checks eligibility, active status, available benefits, and pre-auth requirements.
   */
  async checkMembership(params: {
    membershipNumber: string;
    dependentCode: string;
    schemeName: string;
    patientDob?: string;
  }): Promise<HealthbridgeMembershipResult> {
    logger.info(`[healthbridge] Checking membership: [REDACTED] (dep ${params.dependentCode}) on [REDACTED]`);

    if (this.isConfigured()) {
      // TODO: Replace with real Healthbridge membership API call
    }

    // ── Mock Response ──────────────────────────────────────────────────
    return this.generateMockMembershipResult(params);
  }

  // ── Receive eRA ──────────────────────────────────────────────────────────

  /**
   * Receive and parse an Electronic Remittance Advice from Healthbridge.
   * eRAs are pushed by schemes after payment processing.
   * Returns structured payment data for reconciliation.
   */
  async receiveERA(rawXmlOrData?: string): Promise<HealthbridgeERA> {
    console.log("[healthbridge] Receiving eRA (Electronic Remittance Advice)");

    if (this.isConfigured() && rawXmlOrData) {
      // TODO: Parse real eRA XML from Healthbridge
      // return this.parseERAXml(rawXmlOrData);
    }

    // ── Mock eRA ───────────────────────────────────────────────────────
    return this.generateMockERA();
  }

  // ── Mock Response Generators ───────────────────────────────────────────

  private generateMockClaimResponse(claim: HealthbridgeClaim): HealthbridgeClaimResponse {
    const transactionRef = `HB-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const now = new Date().toISOString();

    // Simulate realistic rejection scenarios
    // ~15% rejection rate (industry average for SA is 12-18%)
    const rand = Math.random();
    const isRejected = rand < 0.10;
    const isPartial = rand >= 0.10 && rand < 0.20;

    if (isRejected) {
      // Pick a realistic rejection reason
      const rejectionScenarios = [
        { code: "08", reason: REJECTION_CODES["08"] },
        { code: "05", reason: REJECTION_CODES["05"] },
        { code: "01", reason: REJECTION_CODES["01"] },
        { code: "07", reason: REJECTION_CODES["07"] },
        { code: "18", reason: REJECTION_CODES["18"] },
        { code: "06", reason: REJECTION_CODES["06"] },
      ];
      const scenario = rejectionScenarios[Math.floor(Math.random() * rejectionScenarios.length)];

      logger.info(`[healthbridge] Claim REJECTED: ${scenario.code} — ${scenario.reason}`);

      return {
        accepted: false,
        transactionRef,
        status: "rejected",
        approvedAmountCents: 0,
        rejectionCode: scenario.code,
        rejectionReason: scenario.reason,
        lineResponses: claim.lineItems.map(li => ({
          lineNumber: li.lineNumber,
          status: "rejected" as const,
          approvedAmountCents: 0,
          rejectionCode: scenario.code,
          rejectionReason: scenario.reason,
        })),
        respondedAt: now,
      };
    }

    if (isPartial) {
      // Scheme tariff rate lower than billed — partial payment
      const schemeTariffRate = Math.round(claim.totalAmountCents * 0.80); // 80% of billed
      const coPayment = claim.totalAmountCents - schemeTariffRate;

      logger.info(`[healthbridge] Claim PARTIALLY ACCEPTED: R${(schemeTariffRate / 100).toFixed(2)} of R${(claim.totalAmountCents / 100).toFixed(2)} | Co-pay: R${(coPayment / 100).toFixed(2)}`);

      return {
        accepted: true,
        transactionRef,
        status: "partial",
        approvedAmountCents: schemeTariffRate,
        rejectionCode: "15",
        rejectionReason: REJECTION_CODES["15"],
        lineResponses: claim.lineItems.map(li => ({
          lineNumber: li.lineNumber,
          status: "adjusted" as const,
          approvedAmountCents: Math.round(li.amountCents * 0.80),
          adjustmentReasonCode: "15",
        })),
        schemeTariffRate,
        coPaymentCents: coPayment,
        respondedAt: now,
      };
    }

    // Fully accepted
    logger.info(`[healthbridge] Claim ACCEPTED: ${transactionRef} | R${(claim.totalAmountCents / 100).toFixed(2)}`);

    return {
      accepted: true,
      transactionRef,
      status: "accepted",
      approvedAmountCents: claim.totalAmountCents,
      lineResponses: claim.lineItems.map(li => ({
        lineNumber: li.lineNumber,
        status: "accepted" as const,
        approvedAmountCents: li.amountCents * li.quantity,
      })),
      respondedAt: now,
    };
  }

  private generateMockMembershipResult(params: {
    membershipNumber: string;
    dependentCode: string;
    schemeName: string;
  }): HealthbridgeMembershipResult {
    // Scheme-specific mock data with realistic SA options
    const schemeOptions: Record<string, { options: string[]; preAuth: boolean }> = {
      "Discovery Health": { options: ["Executive Plan", "Classic Comprehensive", "KeyCare Plus", "Smart Comprehensive", "Coastal Core"], preAuth: false },
      "GEMS": { options: ["Emerald Value", "Ruby", "Onyx", "Sapphire", "Beryl"], preAuth: true },
      "Bonitas": { options: ["BonFit Select", "BonEssential", "BonSave", "BonComplete", "Standard"], preAuth: false },
      "Medihelp": { options: ["MedPlus", "MedSaver", "Dimension", "Prime", "Necesse"], preAuth: true },
      "Momentum Health": { options: ["Ingwe", "Summit", "Incentive", "Evolve", "Custom"], preAuth: false },
      "Bestmed": { options: ["Beat 1", "Beat 2", "Beat 3", "Pace 1", "Pace 4"], preAuth: false },
    };

    const schemeData = schemeOptions[params.schemeName] || { options: ["Standard Option"], preAuth: false };
    const option = schemeData.options[Math.floor(Math.random() * schemeData.options.length)];

    // 95% chance member is eligible (realistic)
    const eligible = Math.random() > 0.05;

    if (!eligible) {
      logger.info(`[healthbridge] Membership NOT ELIGIBLE: [REDACTED]`);
      return {
        eligible: false,
        memberName: "Unknown",
        membershipNumber: params.membershipNumber,
        dependentCode: params.dependentCode,
        schemeName: params.schemeName,
        schemeOption: "",
        preAuthRequired: false,
        benefits: [],
        status: "suspended",
        effectiveDate: "2025-01-01",
        terminationDate: "2026-02-28",
      };
    }

    logger.info(`[healthbridge] Membership ELIGIBLE: [REDACTED] — ${option}`);

    return {
      eligible: true,
      memberName: `Member ${params.membershipNumber.slice(-4)}`,
      membershipNumber: params.membershipNumber,
      dependentCode: params.dependentCode,
      schemeName: params.schemeName,
      schemeOption: option,
      preAuthRequired: schemeData.preAuth,
      benefits: [
        {
          category: "GP Consultations",
          available: true,
          remainingAmountCents: 1_250_00,
          usedAmountCents: 600_00,
          annualLimitCents: 1_850_00,
        },
        {
          category: "Specialist Consultations",
          available: true,
          remainingAmountCents: 2_800_00,
          usedAmountCents: 200_00,
          annualLimitCents: 3_000_00,
        },
        {
          category: "Pathology",
          available: true,
          remainingAmountCents: 950_00,
          usedAmountCents: 550_00,
          annualLimitCents: 1_500_00,
        },
        {
          category: "Radiology",
          available: true,
          remainingAmountCents: 1_800_00,
          usedAmountCents: 200_00,
          annualLimitCents: 2_000_00,
        },
        {
          category: "Chronic Medicine (CDL)",
          available: true,
          remainingAmountCents: 4_500_00,
          usedAmountCents: 1_500_00,
          annualLimitCents: 6_000_00,
        },
      ],
      status: "active",
      effectiveDate: "2025-01-01",
    };
  }

  private generateMockERA(): HealthbridgeERA {
    const remittanceRef = `ERA-HB-${Date.now().toString(36).toUpperCase()}`;
    const schemes = ["Discovery Health", "GEMS", "Bonitas", "Medihelp", "Momentum Health"];
    const scheme = schemes[Math.floor(Math.random() * schemes.length)];

    const lineItems: HealthbridgeERALine[] = [
      {
        claimRef: "HB-CLM-20260318-001",
        membershipNumber: "900012345",
        dependentCode: "00",
        patientName: "John Mokoena",
        dateOfService: "2026-03-18",
        tariffCode: "0190",
        icd10Code: "I10",
        claimedAmountCents: 52_000,
        approvedAmountCents: 52_000,
        paidAmountCents: 52_000,
      },
      {
        claimRef: "HB-CLM-20260318-002",
        membershipNumber: "900012345",
        dependentCode: "00",
        patientName: "John Mokoena",
        dateOfService: "2026-03-18",
        tariffCode: "0308",
        icd10Code: "I10",
        claimedAmountCents: 35_000,
        approvedAmountCents: 35_000,
        paidAmountCents: 35_000,
      },
      {
        claimRef: "HB-CLM-20260319-003",
        membershipNumber: "800067890",
        dependentCode: "01",
        patientName: "Priya Naidoo",
        dateOfService: "2026-03-19",
        tariffCode: "0190",
        icd10Code: "J06.9",
        claimedAmountCents: 52_000,
        approvedAmountCents: 52_000,
        paidAmountCents: 52_000,
      },
      {
        claimRef: "HB-CLM-20260319-004",
        membershipNumber: "700011111",
        dependentCode: "00",
        patientName: "Thabo Molefe",
        dateOfService: "2026-03-19",
        tariffCode: "0193",
        icd10Code: "E11.9",
        claimedAmountCents: 78_000,
        approvedAmountCents: 62_400,
        paidAmountCents: 62_400,
        adjustmentCode: "15",
        adjustmentReason: "Paid at scheme tariff rate",
        coPaymentCents: 15_600,
      },
      {
        claimRef: "HB-CLM-20260319-005",
        membershipNumber: "600055555",
        dependentCode: "00",
        patientName: "Fatima Adams",
        dateOfService: "2026-03-19",
        tariffCode: "0382",
        icd10Code: "E11.9",
        claimedAmountCents: 6_500,
        approvedAmountCents: 6_500,
        paidAmountCents: 6_500,
      },
    ];

    const totalPaid = lineItems.reduce((sum, li) => sum + li.paidAmountCents, 0);

    logger.info(`[healthbridge] eRA received: ${remittanceRef} | ${scheme} | ${lineItems.length} lines | Total: R${(totalPaid / 100).toFixed(2)}`);

    return {
      remittanceRef,
      schemeName: scheme,
      administrator: `${scheme} Medical Scheme`,
      paymentDate: new Date().toISOString().slice(0, 10),
      paymentMethod: "EFT",
      bankReference: `FNB-${Date.now().toString().slice(-8)}`,
      totalAmountCents: totalPaid,
      lineItems,
      receivedAt: new Date().toISOString(),
    };
  }
}

// ── Singleton Export ──────────────────────────────────────────────────────────

let _instance: HealthbridgeAdapter | null = null;

export function getHealthbridgeAdapter(config?: Partial<HealthbridgeConfig>): HealthbridgeAdapter {
  if (!_instance || config) {
    _instance = new HealthbridgeAdapter(config);
  }
  return _instance;
}

export { REJECTION_CODES };
