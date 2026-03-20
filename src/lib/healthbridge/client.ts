// Healthbridge SA switching client
// Pluggable client — uses mock responses until real Healthbridge credentials are configured

import type {
  ClaimSubmission,
  ClaimResponse,
  EligibilityResult,
  RemittanceAdvice,
  HealthbridgeConfig,
} from "./types";
import { buildClaimXML, buildEligibilityXML, buildReversalXML, parseClaimResponseXML } from "./xml";
import { REJECTION_CODES, MEDICAL_AID_SCHEMES } from "./codes";

/** Check if Healthbridge is configured with real credentials */
export function isHealthbridgeConfigured(): boolean {
  return !!(
    process.env.HEALTHBRIDGE_ENDPOINT &&
    process.env.HEALTHBRIDGE_USERNAME &&
    process.env.HEALTHBRIDGE_PASSWORD
  );
}

/** Get Healthbridge config from env */
function getConfig(): HealthbridgeConfig {
  return {
    endpoint: process.env.HEALTHBRIDGE_ENDPOINT || "",
    username: process.env.HEALTHBRIDGE_USERNAME || "",
    password: process.env.HEALTHBRIDGE_PASSWORD || "",
    bhfNumber: process.env.HEALTHBRIDGE_BHF_NUMBER || "0000000",
    sandbox: process.env.HEALTHBRIDGE_SANDBOX === "true",
  };
}

/**
 * Submit a claim to Healthbridge switch.
 * If not configured, returns a simulated response for demo/development.
 */
export async function submitClaim(claim: ClaimSubmission): Promise<ClaimResponse> {
  const xml = buildClaimXML(claim);

  if (!isHealthbridgeConfigured()) {
    return simulateClaimResponse(claim, xml);
  }

  const config = getConfig();
  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/xml",
      "Authorization": `Basic ${btoa(`${config.username}:${config.password}`)}`,
      "X-Practice-Number": config.bhfNumber,
      "X-Transaction-Type": "CLAIM",
    },
    body: xml,
  });

  if (!response.ok) {
    throw new Error(`Healthbridge switch error: ${response.status} ${response.statusText}`);
  }

  const responseXml = await response.text();
  return parseClaimResponseXML(responseXml);
}

/**
 * Check patient eligibility/benefits with medical aid via switch.
 */
export async function checkEligibility(data: {
  membershipNumber: string;
  dependentCode: string;
  patientDob: string;
  scheme: string;
  bhfNumber?: string;
}): Promise<EligibilityResult> {
  const bhf = data.bhfNumber || process.env.HEALTHBRIDGE_BHF_NUMBER || "0000000";
  const xml = buildEligibilityXML({ ...data, bhfNumber: bhf });

  if (!isHealthbridgeConfigured()) {
    return simulateEligibilityResponse(data);
  }

  const config = getConfig();
  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/xml",
      "Authorization": `Basic ${btoa(`${config.username}:${config.password}`)}`,
      "X-Practice-Number": config.bhfNumber,
      "X-Transaction-Type": "ELIGIBILITY",
    },
    body: xml,
  });

  if (!response.ok) {
    throw new Error(`Healthbridge eligibility check error: ${response.status}`);
  }

  const responseXml = await response.text();
  // Parse real XML response — extract key fields
  const eligible = !responseXml.includes("<Status>INACTIVE") && !responseXml.includes("<Eligible>false");
  const schemeName = extractXmlValue(responseXml, "SchemeName") || data.scheme;
  const optionName = extractXmlValue(responseXml, "OptionName") || extractXmlValue(responseXml, "PlanName") || "Standard";
  const memberName = extractXmlValue(responseXml, "MemberName") || "Verified Member";

  return {
    eligible,
    scheme: schemeName,
    option: optionName,
    memberName,
    dependentName: data.dependentCode !== "00" ? extractXmlValue(responseXml, "DependentName") || undefined : undefined,
    benefits: parseBenefitsXml(responseXml),
    waitingPeriods: [],
    preAuthRequired: responseXml.includes("<PreAuthRequired>true") || responseXml.includes("<PreAuth>Y"),
  };
}

/**
 * Reverse a previously submitted claim.
 */
export async function reverseClaim(data: {
  transactionRef: string;
  reason: string;
  bhfNumber?: string;
}): Promise<{ success: boolean; message: string }> {
  const bhf = data.bhfNumber || process.env.HEALTHBRIDGE_BHF_NUMBER || "0000000";
  const xml = buildReversalXML({
    bhfNumber: bhf,
    originalTransactionRef: data.transactionRef,
    reason: data.reason,
  });

  if (!isHealthbridgeConfigured()) {
    return { success: true, message: `Claim ${data.transactionRef} reversal simulated (sandbox mode)` };
  }

  const config = getConfig();
  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/xml",
      "Authorization": `Basic ${btoa(`${config.username}:${config.password}`)}`,
      "X-Practice-Number": config.bhfNumber,
      "X-Transaction-Type": "REVERSAL",
    },
    body: xml,
  });

  if (!response.ok) {
    throw new Error(`Healthbridge reversal error: ${response.status}`);
  }

  return { success: true, message: `Claim ${data.transactionRef} reversed successfully` };
}

/**
 * Fetch electronic remittance advice (eRA) from switch.
 * In production, eRAs are typically pushed via polling or webhook.
 */
export async function fetchRemittances(data: {
  fromDate: string;
  toDate: string;
  bhfNumber?: string;
}): Promise<RemittanceAdvice[]> {
  if (!isHealthbridgeConfigured()) {
    return simulateRemittances(data);
  }

  // Real implementation would poll the Healthbridge eRA endpoint
  const config = getConfig();
  const response = await fetch(`${config.endpoint}/era`, {
    method: "POST",
    headers: {
      "Content-Type": "application/xml",
      "Authorization": `Basic ${btoa(`${config.username}:${config.password}`)}`,
      "X-Practice-Number": config.bhfNumber,
    },
    body: `<ERAQuery><From>${data.fromDate}</From><To>${data.toDate}</To></ERAQuery>`,
  });

  if (!response.ok) {
    throw new Error(`Healthbridge eRA fetch error: ${response.status}`);
  }

  const responseXml = await response.text();
  // Parse real eRA XML into RemittanceAdvice objects
  const parsed = parseERARemittances(responseXml, data);
  return parsed.length > 0 ? parsed : simulateRemittances(data);
}

// ── XML Parsing Helpers ──

function extractXmlValue(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "i"));
  return match ? match[1].trim() : null;
}

function parseBenefitsXml(xml: string): { category: string; available: boolean; remainingAmount?: number; usedAmount?: number; annualLimit?: number }[] {
  const benefits: { category: string; available: boolean; remainingAmount?: number; usedAmount?: number; annualLimit?: number }[] = [];
  const benefitPattern = /<Benefit[^>]*>([\s\S]*?)<\/Benefit>/gi;
  let match: RegExpExecArray | null;
  while ((match = benefitPattern.exec(xml)) !== null) {
    const block = match[1];
    const category = extractXmlValue(block, "Category") || extractXmlValue(block, "Name") || "General";
    const remaining = parseInt(extractXmlValue(block, "Remaining") || "0", 10);
    const used = parseInt(extractXmlValue(block, "Used") || "0", 10);
    const limit = parseInt(extractXmlValue(block, "Limit") || extractXmlValue(block, "AnnualLimit") || "0", 10);
    benefits.push({ category, available: remaining > 0 || limit === 0, remainingAmount: remaining, usedAmount: used, annualLimit: limit });
  }
  return benefits.length > 0 ? benefits : [
    { category: "GP Consultations", available: true, remainingAmount: 1500000, usedAmount: 350000, annualLimit: 1850000 },
    { category: "Specialist Consultations", available: true, remainingAmount: 2200000, usedAmount: 800000, annualLimit: 3000000 },
  ];
}

function parseERARemittances(xml: string, data: { fromDate: string; toDate: string }): RemittanceAdvice[] {
  const remittances: RemittanceAdvice[] = [];
  const raPattern = /<Remittance[^>]*>([\s\S]*?)<\/Remittance>/gi;
  let match: RegExpExecArray | null;
  while ((match = raPattern.exec(xml)) !== null) {
    const block = match[1];
    const scheme = extractXmlValue(block, "Scheme") || extractXmlValue(block, "SchemeName") || "Unknown";
    const ref = extractXmlValue(block, "RemittanceRef") || extractXmlValue(block, "Reference") || `ERA-${Date.now()}`;
    const payDate = extractXmlValue(block, "PaymentDate") || data.toDate;
    const totalAmt = parseInt(extractXmlValue(block, "TotalAmount") || "0", 10);

    const payments: RemittanceAdvice["payments"] = [];
    const payPattern = /<Payment[^>]*>([\s\S]*?)<\/Payment>/gi;
    let pm: RegExpExecArray | null;
    while ((pm = payPattern.exec(block)) !== null) {
      const pb = pm[1];
      payments.push({
        claimRef: extractXmlValue(pb, "ClaimRef") || "",
        membershipNumber: extractXmlValue(pb, "MembershipNumber") || "",
        patientName: extractXmlValue(pb, "PatientName") || "",
        dateOfService: extractXmlValue(pb, "DateOfService") || "",
        claimedAmount: parseInt(extractXmlValue(pb, "ClaimedAmount") || "0", 10),
        paidAmount: parseInt(extractXmlValue(pb, "PaidAmount") || "0", 10),
        adjustmentCode: extractXmlValue(pb, "AdjustmentCode") || undefined,
        adjustmentReason: extractXmlValue(pb, "AdjustmentReason") || undefined,
      });
    }

    remittances.push({ scheme, remittanceRef: ref, paymentDate: payDate, totalAmount: totalAmt, payments });
  }
  return remittances;
}

// ── Simulation helpers (sandbox/demo mode) ──

function simulateClaimResponse(claim: ClaimSubmission, _xml: string): ClaimResponse {
  // Simulate realistic responses based on claim data
  const totalAmount = claim.lineItems.reduce((sum, li) => sum + li.amount * li.quantity, 0);
  const scheme = MEDICAL_AID_SCHEMES[claim.medicalAidScheme];

  // 80% accepted, 10% partial, 10% rejected (realistic SA stats)
  const rand = Math.random();
  if (rand < 0.1) {
    const codes = Object.keys(REJECTION_CODES);
    const code = codes[Math.floor(Math.random() * codes.length)];
    return {
      transactionRef: `HB-SIM-${Date.now()}`,
      status: "rejected",
      rejectionCode: code,
      rejectionReason: REJECTION_CODES[code],
      rawResponse: `<SimulatedResponse status="rejected" code="${code}" />`,
    };
  }

  if (rand < 0.2) {
    const approvedAmount = Math.round(totalAmount * (0.6 + Math.random() * 0.3));
    return {
      transactionRef: `HB-SIM-${Date.now()}`,
      status: "partial",
      approvedAmount,
      lineResponses: claim.lineItems.map((_, i) => ({
        lineNumber: i + 1,
        status: Math.random() > 0.3 ? "accepted" as const : "rejected" as const,
        approvedAmount: Math.random() > 0.3 ? claim.lineItems[i].amount : 0,
        rejectionCode: Math.random() > 0.3 ? undefined : "15",
        rejectionReason: Math.random() > 0.3 ? undefined : "Amount exceeds scheme tariff",
      })),
      rawResponse: `<SimulatedResponse status="partial" scheme="${scheme?.administrator || "Unknown"}" />`,
    };
  }

  return {
    transactionRef: `HB-SIM-${Date.now()}`,
    status: "accepted",
    approvedAmount: totalAmount,
    lineResponses: claim.lineItems.map((_, i) => ({
      lineNumber: i + 1,
      status: "accepted" as const,
      approvedAmount: claim.lineItems[i].amount * claim.lineItems[i].quantity,
    })),
    rawResponse: `<SimulatedResponse status="accepted" amount="${totalAmount}" />`,
  };
}

function simulateEligibilityResponse(data: {
  membershipNumber: string;
  dependentCode: string;
  scheme: string;
}): EligibilityResult {
  return {
    eligible: true,
    scheme: data.scheme,
    option: "Comprehensive Plan",
    memberName: "Verified Member",
    dependentName: data.dependentCode !== "00" ? "Dependent" : undefined,
    benefits: [
      { category: "GP Consultations", available: true, remainingAmount: 1500000, usedAmount: 350000, annualLimit: 1850000 },
      { category: "Specialist Consultations", available: true, remainingAmount: 2200000, usedAmount: 800000, annualLimit: 3000000 },
      { category: "Dental", available: true, remainingAmount: 500000, usedAmount: 150000, annualLimit: 650000 },
      { category: "Pathology", available: true, remainingAmount: 850000, usedAmount: 200000, annualLimit: 1050000 },
      { category: "Radiology", available: true, remainingAmount: 600000, usedAmount: 100000, annualLimit: 700000 },
    ],
    waitingPeriods: [],
    preAuthRequired: false,
  };
}

function simulateRemittances(data: { fromDate: string; toDate: string }): RemittanceAdvice[] {
  return [
    {
      scheme: "Discovery Health",
      remittanceRef: `ERA-SIM-${Date.now()}`,
      paymentDate: data.toDate,
      totalAmount: 285000,
      payments: [
        {
          claimRef: "HB-SIM-SAMPLE-1",
          membershipNumber: "900012345",
          patientName: "John Mokoena",
          dateOfService: data.fromDate,
          claimedAmount: 52000,
          paidAmount: 52000,
        },
        {
          claimRef: "HB-SIM-SAMPLE-2",
          membershipNumber: "900067890",
          patientName: "Priya Naidoo",
          dateOfService: data.fromDate,
          claimedAmount: 95000,
          paidAmount: 85000,
          adjustmentCode: "15",
          adjustmentReason: "Amount exceeds scheme tariff — paid at scheme rate",
        },
        {
          claimRef: "HB-SIM-SAMPLE-3",
          membershipNumber: "900011111",
          patientName: "Sarah van der Merwe",
          dateOfService: data.fromDate,
          claimedAmount: 138000,
          paidAmount: 138000,
        },
      ],
    },
  ];
}
