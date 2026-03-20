// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Altron SwitchOn (formerly MediSwitch) Integration Adapter
// SA's premier claims switch — 99.8M transactions/year
// Uses PHISC EDIFACT standard (adapted UN/EDIFACT for SA healthcare)
// Per-claim cost: R5.90 excl VAT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { logger } from "@/lib/logger";

// ── Types ────────────────────────────────────────────────────────────────────

export interface SwitchOnConfig {
  /** SwitchOn API endpoint */
  baseUrl: string;
  /** Switch username (assigned by Altron HealthTech) */
  username: string;
  /** Switch password */
  password: string;
  /** Practice BHF number */
  bhfNumber: string;
  /** Software vendor code (registered with PHISC) */
  vendorCode: string;
  /** Timeout in ms (default: 60000 — SwitchOn can be slower than Healthbridge) */
  timeoutMs?: number;
}

export interface SwitchOnClaimLineItem {
  /** Line sequence number */
  lineNumber: number;
  /** ICD-10-ZA diagnosis code */
  icd10Code: string;
  /** CPT tariff code */
  tariffCode: string;
  /** NAPPI code (medicines/consumables) */
  nappiCode?: string;
  /** Service/item description */
  description: string;
  /** Quantity */
  quantity: number;
  /** Amount in cents (ZAR) */
  amountCents: number;
  /** Place of service (PHISC code) */
  placeOfService: string;
  /** Service type: "1" = professional, "2" = facility, "3" = medicine */
  serviceType: "1" | "2" | "3";
  /** Modifier codes */
  modifiers?: string[];
}

export interface SwitchOnClaim {
  /** Practice BHF number */
  bhfNumber: string;
  /** Treating provider PCNS number */
  treatingProviderPcns: string;
  /** Treating provider name and qualifications */
  treatingProviderName: string;
  /** Provider discipline code (e.g. "014" = GP, "024" = dentist, "035" = physio) */
  disciplineCode: string;
  /** Referring provider PCNS (if applicable) */
  referringProviderPcns?: string;
  /** Patient surname */
  patientSurname: string;
  /** Patient first names */
  patientFirstNames: string;
  /** Patient date of birth (YYYYMMDD for EDIFACT) */
  patientDob: string;
  /** SA ID number */
  patientIdNumber: string;
  /** Patient gender: "1" = male, "2" = female */
  patientGender: "1" | "2";
  /** Medical aid scheme registered name */
  schemeName: string;
  /** Scheme registration number (BHF scheme code) */
  schemeRegistrationNumber: string;
  /** Membership number */
  membershipNumber: string;
  /** Dependent code */
  dependentCode: string;
  /** Date of service (YYYYMMDD) */
  dateOfService: string;
  /** Date of discharge (YYYYMMDD, for hospital claims) */
  dateOfDischarge?: string;
  /** Pre-authorization number */
  authorizationNumber?: string;
  /** Claim type: "1" = new, "2" = resubmission, "3" = reversal */
  claimType: "1" | "2" | "3";
  /** Original claim reference (for resubmission/reversal) */
  originalClaimRef?: string;
  /** Claim line items */
  lineItems: SwitchOnClaimLineItem[];
  /** Total claim amount in cents */
  totalAmountCents: number;
  /** Invoice reference from practice system */
  invoiceNumber?: string;
}

export interface SwitchOnClaimResponse {
  /** SwitchOn transaction reference */
  transactionRef: string;
  /** Claim status */
  status: "accepted" | "rejected" | "pending" | "partial" | "queued";
  /** Message status code (PHISC standard) */
  messageStatusCode: string;
  /** Approved amount in cents */
  approvedAmountCents: number;
  /** Rejection/status reason code */
  reasonCode?: string;
  /** Reason description */
  reasonDescription?: string;
  /** Per-line responses */
  lineResponses: SwitchOnLineResponse[];
  /** Scheme tariff applied (cents) */
  schemeTariffCents?: number;
  /** Patient co-payment (cents) */
  coPaymentCents?: number;
  /** Cost of this transaction (R5.90 = 590 cents excl VAT) */
  transactionCostCents: number;
  /** EDIFACT response message */
  rawEdifact?: string;
  /** Timestamp */
  respondedAt: string;
}

export interface SwitchOnLineResponse {
  lineNumber: number;
  status: "accepted" | "rejected" | "adjusted";
  approvedAmountCents: number;
  reasonCode?: string;
  reasonDescription?: string;
}

export interface SwitchOnMembershipResult {
  /** Eligibility confirmed */
  eligible: boolean;
  /** Member name */
  memberName: string;
  /** Membership number */
  membershipNumber: string;
  /** Dependent code */
  dependentCode: string;
  /** Scheme name */
  schemeName: string;
  /** Option/plan */
  option: string;
  /** Member status */
  status: "active" | "suspended" | "terminated";
  /** Effective date (YYYYMMDD) */
  effectiveFrom: string;
  /** Transaction cost */
  transactionCostCents: number;
}

export interface SwitchOnBenefitResult {
  membershipNumber: string;
  dependentCode: string;
  schemeName: string;
  option: string;
  benefits: SwitchOnBenefit[];
  checkedAt: string;
  transactionCostCents: number;
}

export interface SwitchOnBenefit {
  benefitCode: string;
  category: string;
  available: boolean;
  remainingCents: number;
  usedCents: number;
  annualLimitCents: number;
  /** Whether this benefit category requires pre-auth */
  preAuthRequired: boolean;
}

export interface SwitchOnClaimStatusResult {
  transactionRef: string;
  claimStatus: "accepted" | "rejected" | "processing" | "paid" | "reversed";
  approvedAmountCents: number;
  paidAmountCents: number;
  paidDate?: string;
  reasonCode?: string;
  reasonDescription?: string;
  transactionCostCents: number;
}

// ── EDIFACT Message Builder (PHISC Standard) ─────────────────────────────────

/**
 * Build a PHISC EDIFACT claim message from a SwitchOnClaim.
 * Follows the SA PHISC standard adapted from UN/EDIFACT.
 *
 * Segment structure:
 *   UNB — Interchange header
 *   UNH — Message header
 *   BGM — Beginning of message
 *   RFF — Reference numbers
 *   NAD — Name and address (provider, patient)
 *   GIS — General indicator (scheme details)
 *   DTM — Date/time references
 *   FTX — Free text (notes)
 *   LIN — Line item detail
 *   QTY — Quantity
 *   PRI — Price
 *   IMD — Item description
 *   UNT — Message trailer
 *   UNZ — Interchange trailer
 */
export function buildEdifactMessage(claim: SwitchOnClaim, config: { vendorCode: string; bhfNumber: string }): string {
  const timestamp = formatEdifactTimestamp(new Date());
  const interchangeRef = `SW${Date.now().toString().slice(-10)}`;
  const messageRef = `MSG${Date.now().toString().slice(-8)}`;

  const segments: string[] = [];

  // UNB — Interchange Header
  segments.push(
    `UNB+UNOC:3+${config.bhfNumber}:ZZZ+SWITCHON:ZZZ+${timestamp.slice(0, 6)}:${timestamp.slice(6, 10)}+${interchangeRef}++CLAIMS'`
  );

  // UNH — Message Header
  segments.push(
    `UNH+${messageRef}+CLAIMS:D:96A:ZZ:PHISC01'`
  );

  // BGM — Beginning of Message (claim type)
  const bgmCodes: Record<string, string> = { "1": "380", "2": "381", "3": "382" };
  segments.push(
    `BGM+${bgmCodes[claim.claimType] || "380"}+${claim.invoiceNumber || messageRef}+9'`
  );

  // DTM — Date of service
  segments.push(
    `DTM+137:${claim.dateOfService}:102'`
  );

  if (claim.dateOfDischarge) {
    segments.push(
      `DTM+36:${claim.dateOfDischarge}:102'`
    );
  }

  // RFF — Reference numbers
  if (claim.authorizationNumber) {
    segments.push(`RFF+AUT:${claim.authorizationNumber}'`);
  }
  if (claim.originalClaimRef) {
    segments.push(`RFF+ACK:${claim.originalClaimRef}'`);
  }

  // NAD — Provider (treating)
  segments.push(
    `NAD+SU+${claim.treatingProviderPcns}::PCNS+${escapeEdifact(claim.treatingProviderName)}+${claim.bhfNumber}::BHF'`
  );

  // NAD — Provider (referring)
  if (claim.referringProviderPcns) {
    segments.push(
      `NAD+RF+${claim.referringProviderPcns}::PCNS'`
    );
  }

  // NAD — Patient
  segments.push(
    `NAD+PA+${claim.patientIdNumber}::NI+${escapeEdifact(claim.patientSurname)}:${escapeEdifact(claim.patientFirstNames)}'`
  );

  // GIS — Scheme details
  segments.push(
    `GIS+${claim.schemeRegistrationNumber}:${claim.membershipNumber}:${claim.dependentCode}'`
  );

  // Patient DOB and gender
  segments.push(
    `DTM+329:${claim.patientDob}:102'`
  );
  segments.push(
    `PDI+${claim.patientGender}'`
  );

  // Provider discipline
  segments.push(
    `ATT+2+${claim.disciplineCode}::DISC'`
  );

  // ── Line Items ───────────────────────────────────────────────────────
  let segmentCount = segments.length; // For UNT trailer

  for (const line of claim.lineItems) {
    // LIN — Line item
    segments.push(
      `LIN+${line.lineNumber}++${line.tariffCode}:CPT'`
    );

    // IMD — Item description
    segments.push(
      `IMD+F++:::${escapeEdifact(line.description)}'`
    );

    // QTY — Quantity
    segments.push(
      `QTY+47:${line.quantity}'`
    );

    // PRI — Price (in Rand, 2 decimal places)
    segments.push(
      `PRI+AAA:${(line.amountCents / 100).toFixed(2)}:CA'`
    );

    // RFF — ICD-10 diagnosis code
    segments.push(
      `RFF+DIA:${line.icd10Code}'`
    );

    // NAPPI code (if medicine/consumable)
    if (line.nappiCode) {
      segments.push(
        `RFF+NAP:${line.nappiCode}'`
      );
    }

    // POS — Place of service
    segments.push(
      `LOC+7+${line.placeOfService}::POS'`
    );

    // Service type
    segments.push(
      `GIS+${line.serviceType}::SRV'`
    );

    // Modifiers
    if (line.modifiers?.length) {
      for (const mod of line.modifiers) {
        segments.push(`RFF+MOD:${mod}'`);
      }
    }
  }

  // MOA — Total monetary amount
  segments.push(
    `MOA+86:${(claim.totalAmountCents / 100).toFixed(2)}'`
  );

  segmentCount = segments.length + 1; // +1 for UNT itself

  // UNT — Message Trailer
  segments.push(
    `UNT+${segmentCount}+${messageRef}'`
  );

  // UNZ — Interchange Trailer
  segments.push(
    `UNZ+1+${interchangeRef}'`
  );

  return segments.join("\n");
}

function formatEdifactTimestamp(date: Date): string {
  const y = date.getFullYear().toString().slice(-2);
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  const h = date.getHours().toString().padStart(2, "0");
  const min = date.getMinutes().toString().padStart(2, "0");
  return `${y}${m}${d}${h}${min}`;
}

function escapeEdifact(text: string): string {
  // EDIFACT special chars: + : ' ? (? is escape char)
  return text
    .replace(/\?/g, "??")
    .replace(/\+/g, "?+")
    .replace(/:/g, "?:")
    .replace(/'/g, "?'");
}

// ── PHISC Reason Codes ──────────────────────────────────────────────────────

const PHISC_REASON_CODES: Record<string, string> = {
  "00": "Accepted — no errors",
  "01": "Member not registered on scheme",
  "02": "Invalid membership number format",
  "03": "Dependant not registered",
  "04": "Member suspended — arrear contributions",
  "05": "Duplicate claim — already processed",
  "06": "Invalid ICD-10 code",
  "07": "Benefit exhausted for category",
  "08": "Pre-authorisation not obtained",
  "09": "Provider not on scheme network",
  "10": "Date of service not within cover period",
  "11": "NAPPI code not on formulary",
  "12": "Invalid tariff code",
  "13": "Above scheme tariff rate — reduced to scheme rate",
  "14": "Co-payment applies",
  "15": "Paid at scheme tariff (lower than billed)",
  "16": "PMB condition — paid at cost",
  "17": "Waiting period — new member",
  "18": "Claim submitted after 120-day deadline",
  "19": "Additional clinical info required",
  "20": "Referral letter required",
  "21": "Hospital pre-authorisation expired",
  "22": "Procedure not covered under option",
  "23": "Savings account depleted — patient liable",
  "24": "Above-threshold claim — refer to case management",
  "25": "Medicine therapeutic substitution available",
};

// ── Scheme Registration Numbers ──────────────────────────────────────────────

const SCHEME_REGISTRATIONS: Record<string, string> = {
  "Discovery Health": "1125",
  "GEMS": "1143",
  "Bonitas": "1024",
  "Medihelp": "1099",
  "Momentum Health": "1094",
  "Bestmed": "1012",
  "MedShield": "1041",
  "Fedhealth": "1027",
  "Profmed": "1048",
  "CompCare": "1046",
  "Sizwe Hosmed": "1076",
  "Samwumed": "1082",
  "Netcare Medical Scheme": "1156",
};

// ── Transaction Cost ─────────────────────────────────────────────────────────

/** SwitchOn per-claim cost: R5.90 excl VAT = R6.785 incl VAT (15%) */
const TRANSACTION_COST_EXCL_VAT_CENTS = 590;
const VAT_RATE = 0.15;
const TRANSACTION_COST_INCL_VAT_CENTS = Math.round(TRANSACTION_COST_EXCL_VAT_CENTS * (1 + VAT_RATE));

// ── Adapter ──────────────────────────────────────────────────────────────────

export class SwitchOnAdapter {
  private config: SwitchOnConfig;

  constructor(config?: Partial<SwitchOnConfig>) {
    this.config = {
      baseUrl: config?.baseUrl || process.env.SWITCHON_API_URL || "https://switch.altronhealthtech.com/api/v1",
      username: config?.username || process.env.SWITCHON_USERNAME || "",
      password: config?.password || process.env.SWITCHON_PASSWORD || "",
      bhfNumber: config?.bhfNumber || process.env.SWITCHON_BHF_NUMBER || process.env.HEALTHBRIDGE_BHF_NUMBER || "",
      vendorCode: config?.vendorCode || process.env.SWITCHON_VENDOR_CODE || "NCHEALTHOS",
      timeoutMs: config?.timeoutMs ?? 60_000,
    };
  }

  isConfigured(): boolean {
    return !!(this.config.username && this.config.password && this.config.bhfNumber);
  }

  // ── Submit Claim ─────────────────────────────────────────────────────────

  /**
   * Submit a claim via SwitchOn using PHISC EDIFACT format.
   * The EDIFACT message is built from the claim data, then sent to the switch.
   * Per-claim cost: R5.90 excl VAT.
   */
  async submitClaim(claim: SwitchOnClaim): Promise<SwitchOnClaimResponse> {
    const edifactMessage = buildEdifactMessage(claim, {
      vendorCode: this.config.vendorCode,
      bhfNumber: this.config.bhfNumber || claim.bhfNumber,
    });

    logger.info(`[switchon] Submitting claim via EDIFACT | Patient: ${claim.patientSurname}, ${claim.patientFirstNames} | Scheme: ${claim.schemeName} | Total: R${(claim.totalAmountCents / 100).toFixed(2)}`);
    logger.info(`[switchon] EDIFACT message size: ${edifactMessage.length} bytes | ${claim.lineItems.length} line items`);

    if (this.isConfigured()) {
      // TODO: Replace with real SwitchOn API call
      // const response = await fetch(`${this.config.baseUrl}/claims`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/edifact",
      //     "Authorization": `Basic ${btoa(`${this.config.username}:${this.config.password}`)}`,
      //     "X-Vendor-Code": this.config.vendorCode,
      //   },
      //   body: edifactMessage,
      //   signal: AbortSignal.timeout(this.config.timeoutMs!),
      // });
      // return this.parseEdifactResponse(await response.text());
    }

    return this.generateMockClaimResponse(claim, edifactMessage);
  }

  // ── Validate Membership ──────────────────────────────────────────────────

  /**
   * Real-time membership validation via SwitchOn.
   * Confirms whether a member is active on a scheme.
   */
  async validateMembership(params: {
    membershipNumber: string;
    dependentCode: string;
    schemeName: string;
    patientIdNumber?: string;
  }): Promise<SwitchOnMembershipResult> {
    logger.info(`[switchon] Validating membership: ${params.membershipNumber} on ${params.schemeName}`);

    if (this.isConfigured()) {
      // TODO: Real SwitchOn membership validation API call
    }

    return this.generateMockMembershipResult(params);
  }

  // ── Check Benefits ───────────────────────────────────────────────────────

  /**
   * Check available benefits for a member on a specific scheme.
   * Returns remaining amounts per benefit category.
   */
  async checkBenefits(params: {
    membershipNumber: string;
    dependentCode: string;
    schemeName: string;
  }): Promise<SwitchOnBenefitResult> {
    logger.info(`[switchon] Checking benefits: ${params.membershipNumber} (dep ${params.dependentCode}) on ${params.schemeName}`);

    if (this.isConfigured()) {
      // TODO: Real SwitchOn benefits API call
    }

    return this.generateMockBenefitResult(params);
  }

  // ── Get Claim Status ─────────────────────────────────────────────────────

  /**
   * Query the status of a previously submitted claim.
   * Useful for claims that returned "queued" or "pending" initially.
   */
  async getClaimStatus(transactionRef: string): Promise<SwitchOnClaimStatusResult> {
    logger.info(`[switchon] Checking claim status: ${transactionRef}`);

    if (this.isConfigured()) {
      // TODO: Real SwitchOn status query API call
    }

    return this.generateMockClaimStatus(transactionRef);
  }

  // ── Build EDIFACT (public for testing) ────────────────────────────────────

  /**
   * Build a PHISC EDIFACT message from claim data without submitting.
   * Useful for pre-validation and logging.
   */
  buildMessage(claim: SwitchOnClaim): string {
    return buildEdifactMessage(claim, {
      vendorCode: this.config.vendorCode,
      bhfNumber: this.config.bhfNumber || claim.bhfNumber,
    });
  }

  /**
   * Get the per-transaction cost in cents.
   */
  getTransactionCost(includeVat: boolean = true): number {
    return includeVat ? TRANSACTION_COST_INCL_VAT_CENTS : TRANSACTION_COST_EXCL_VAT_CENTS;
  }

  /**
   * Look up a scheme registration number.
   */
  getSchemeRegistration(schemeName: string): string | undefined {
    return SCHEME_REGISTRATIONS[schemeName];
  }

  // ── Mock Response Generators ───────────────────────────────────────────

  private generateMockClaimResponse(claim: SwitchOnClaim, edifactMessage: string): SwitchOnClaimResponse {
    const transactionRef = `SW-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const now = new Date().toISOString();

    // ~12% rejection, ~8% partial, ~5% queued, ~75% accepted
    const rand = Math.random();

    if (rand < 0.12) {
      const rejectionScenarios = [
        { code: "08", desc: PHISC_REASON_CODES["08"] },
        { code: "05", desc: PHISC_REASON_CODES["05"] },
        { code: "04", desc: PHISC_REASON_CODES["04"] },
        { code: "07", desc: PHISC_REASON_CODES["07"] },
        { code: "18", desc: PHISC_REASON_CODES["18"] },
      ];
      const scenario = rejectionScenarios[Math.floor(Math.random() * rejectionScenarios.length)];

      logger.info(`[switchon] Claim REJECTED: ${scenario.code} — ${scenario.desc}`);

      return {
        transactionRef,
        status: "rejected",
        messageStatusCode: scenario.code,
        approvedAmountCents: 0,
        reasonCode: scenario.code,
        reasonDescription: scenario.desc,
        lineResponses: claim.lineItems.map(li => ({
          lineNumber: li.lineNumber,
          status: "rejected" as const,
          approvedAmountCents: 0,
          reasonCode: scenario.code,
          reasonDescription: scenario.desc,
        })),
        transactionCostCents: TRANSACTION_COST_EXCL_VAT_CENTS,
        rawEdifact: edifactMessage,
        respondedAt: now,
      };
    }

    if (rand < 0.20) {
      // Partial — scheme tariff rate applied
      const approvedCents = Math.round(claim.totalAmountCents * 0.82);
      const coPay = claim.totalAmountCents - approvedCents;

      logger.info(`[switchon] Claim PARTIAL: R${(approvedCents / 100).toFixed(2)} of R${(claim.totalAmountCents / 100).toFixed(2)} approved`);

      return {
        transactionRef,
        status: "partial",
        messageStatusCode: "13",
        approvedAmountCents: approvedCents,
        reasonCode: "13",
        reasonDescription: PHISC_REASON_CODES["13"],
        lineResponses: claim.lineItems.map(li => ({
          lineNumber: li.lineNumber,
          status: "adjusted" as const,
          approvedAmountCents: Math.round(li.amountCents * 0.82),
          reasonCode: "13",
          reasonDescription: PHISC_REASON_CODES["13"],
        })),
        schemeTariffCents: approvedCents,
        coPaymentCents: coPay,
        transactionCostCents: TRANSACTION_COST_EXCL_VAT_CENTS,
        rawEdifact: edifactMessage,
        respondedAt: now,
      };
    }

    if (rand < 0.25) {
      logger.info(`[switchon] Claim QUEUED for processing: ${transactionRef}`);

      return {
        transactionRef,
        status: "queued",
        messageStatusCode: "00",
        approvedAmountCents: 0,
        lineResponses: [],
        transactionCostCents: TRANSACTION_COST_EXCL_VAT_CENTS,
        rawEdifact: edifactMessage,
        respondedAt: now,
      };
    }

    // Accepted
    logger.info(`[switchon] Claim ACCEPTED: ${transactionRef} | R${(claim.totalAmountCents / 100).toFixed(2)}`);

    return {
      transactionRef,
      status: "accepted",
      messageStatusCode: "00",
      approvedAmountCents: claim.totalAmountCents,
      lineResponses: claim.lineItems.map(li => ({
        lineNumber: li.lineNumber,
        status: "accepted" as const,
        approvedAmountCents: li.amountCents * li.quantity,
      })),
      transactionCostCents: TRANSACTION_COST_EXCL_VAT_CENTS,
      rawEdifact: edifactMessage,
      respondedAt: now,
    };
  }

  private generateMockMembershipResult(params: {
    membershipNumber: string;
    dependentCode: string;
    schemeName: string;
  }): SwitchOnMembershipResult {
    const schemeOptions: Record<string, string[]> = {
      "Discovery Health": ["Executive Plan", "Classic Comprehensive", "KeyCare Plus", "Smart Comprehensive"],
      "GEMS": ["Emerald Value", "Ruby", "Onyx", "Sapphire"],
      "Bonitas": ["BonFit Select", "BonEssential", "BonSave", "BonComplete"],
      "Medihelp": ["MedPlus", "MedSaver", "Dimension", "Prime"],
      "Momentum Health": ["Ingwe", "Summit", "Incentive", "Evolve"],
      "Bestmed": ["Beat 1", "Beat 2", "Beat 3", "Pace 1"],
      "Fedhealth": ["Maxima Plus", "Maxima Exec", "flexiFED 1", "flexiFED 4"],
      "MedShield": ["MediPhila", "MediPlus", "MediPrime", "MediBonus"],
    };

    const options = schemeOptions[params.schemeName] || ["Standard Option"];
    const option = options[Math.floor(Math.random() * options.length)];
    const eligible = Math.random() > 0.05;

    logger.info(`[switchon] Membership ${eligible ? "VALID" : "INVALID"}: ${params.membershipNumber} on ${params.schemeName}`);

    return {
      eligible,
      memberName: eligible ? `Member ${params.membershipNumber.slice(-4)}` : "Not found",
      membershipNumber: params.membershipNumber,
      dependentCode: params.dependentCode,
      schemeName: params.schemeName,
      option: eligible ? option : "",
      status: eligible ? "active" : "terminated",
      effectiveFrom: eligible ? "20250101" : "",
      transactionCostCents: TRANSACTION_COST_EXCL_VAT_CENTS,
    };
  }

  private generateMockBenefitResult(params: {
    membershipNumber: string;
    dependentCode: string;
    schemeName: string;
  }): SwitchOnBenefitResult {
    const options: Record<string, string> = {
      "Discovery Health": "Executive Plan",
      "GEMS": "Emerald Value",
      "Bonitas": "BonFit Select",
    };

    logger.info(`[switchon] Benefits retrieved for ${params.membershipNumber} on ${params.schemeName}`);

    return {
      membershipNumber: params.membershipNumber,
      dependentCode: params.dependentCode,
      schemeName: params.schemeName,
      option: options[params.schemeName] || "Standard Option",
      benefits: [
        {
          benefitCode: "GP",
          category: "GP Consultations",
          available: true,
          remainingCents: 1_350_00,
          usedCents: 500_00,
          annualLimitCents: 1_850_00,
          preAuthRequired: false,
        },
        {
          benefitCode: "SPEC",
          category: "Specialist Consultations",
          available: true,
          remainingCents: 2_500_00,
          usedCents: 500_00,
          annualLimitCents: 3_000_00,
          preAuthRequired: true,
        },
        {
          benefitCode: "PATH",
          category: "Pathology",
          available: true,
          remainingCents: 1_100_00,
          usedCents: 400_00,
          annualLimitCents: 1_500_00,
          preAuthRequired: false,
        },
        {
          benefitCode: "RAD",
          category: "Radiology",
          available: true,
          remainingCents: 1_600_00,
          usedCents: 400_00,
          annualLimitCents: 2_000_00,
          preAuthRequired: true,
        },
        {
          benefitCode: "MED",
          category: "Acute Medicine",
          available: true,
          remainingCents: 3_200_00,
          usedCents: 800_00,
          annualLimitCents: 4_000_00,
          preAuthRequired: false,
        },
        {
          benefitCode: "CDL",
          category: "Chronic Medicine (CDL)",
          available: true,
          remainingCents: 5_000_00,
          usedCents: 1_000_00,
          annualLimitCents: 6_000_00,
          preAuthRequired: false,
        },
        {
          benefitCode: "DENT",
          category: "Dentistry",
          available: true,
          remainingCents: 2_000_00,
          usedCents: 800_00,
          annualLimitCents: 2_800_00,
          preAuthRequired: false,
        },
        {
          benefitCode: "OPT",
          category: "Optometry",
          available: true,
          remainingCents: 1_500_00,
          usedCents: 0,
          annualLimitCents: 1_500_00,
          preAuthRequired: false,
        },
      ],
      checkedAt: new Date().toISOString(),
      transactionCostCents: TRANSACTION_COST_EXCL_VAT_CENTS,
    };
  }

  private generateMockClaimStatus(transactionRef: string): SwitchOnClaimStatusResult {
    const statuses: Array<SwitchOnClaimStatusResult["claimStatus"]> = ["accepted", "processing", "paid", "rejected"];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const amounts: Record<string, { approved: number; paid: number }> = {
      accepted: { approved: 52_000, paid: 0 },
      processing: { approved: 52_000, paid: 0 },
      paid: { approved: 52_000, paid: 52_000 },
      rejected: { approved: 0, paid: 0 },
      reversed: { approved: 0, paid: 0 },
    };

    logger.info(`[switchon] Claim status for ${transactionRef}: ${status}`);

    return {
      transactionRef,
      claimStatus: status,
      approvedAmountCents: amounts[status].approved,
      paidAmountCents: amounts[status].paid,
      paidDate: status === "paid" ? new Date().toISOString().slice(0, 10) : undefined,
      reasonCode: status === "rejected" ? "07" : undefined,
      reasonDescription: status === "rejected" ? PHISC_REASON_CODES["07"] : undefined,
      transactionCostCents: TRANSACTION_COST_EXCL_VAT_CENTS,
    };
  }
}

// ── Singleton Export ──────────────────────────────────────────────────────────

let _instance: SwitchOnAdapter | null = null;

export function getSwitchOnAdapter(config?: Partial<SwitchOnConfig>): SwitchOnAdapter {
  if (!_instance || config) {
    _instance = new SwitchOnAdapter(config);
  }
  return _instance;
}

export { PHISC_REASON_CODES, SCHEME_REGISTRATIONS, TRANSACTION_COST_EXCL_VAT_CENTS, TRANSACTION_COST_INCL_VAT_CENTS };
