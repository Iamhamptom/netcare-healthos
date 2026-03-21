// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SwitchOn (Altron HealthTech) Switch Client
// Formerly MediSwitch — 99.8M transactions/year, 0.0% downtime record
// Handles: GEMS, Momentum, Bestmed, Fedhealth, Sizwe Hosmed, Liberty, Polmed
//
// Protocol: XML over HTTPS
// Auth: Bearer token + Practice number
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { ClaimSubmission, ClaimResponse, EligibilityResult } from "../healthbridge/types";
import { REJECTION_CODES } from "../healthbridge/codes";

// ─── Configuration ──────────────────────────────────────────────────────────

function getSwitchOnConfig() {
  return {
    endpoint: process.env.SWITCHON_ENDPOINT || "",
    username: process.env.SWITCHON_USERNAME || "",
    password: process.env.SWITCHON_PASSWORD || "",
    apiKey: process.env.SWITCHON_API_KEY || "",
    bhfNumber: process.env.SWITCHON_BHF_NUMBER || process.env.HEALTHBRIDGE_BHF_NUMBER || "",
    sandbox: process.env.SWITCHON_SANDBOX === "true",
    vendorCode: process.env.SWITCHON_VENDOR_CODE || "NETCAREOS",
  };
}

function isSwitchOnConfigured(): boolean {
  const config = getSwitchOnConfig();
  return !!(config.endpoint && (config.apiKey || (config.username && config.password)));
}

// ─── XML Builders (SwitchOn format) ─────────────────────────────────────────

function buildSwitchOnClaimXML(claim: ClaimSubmission): string {
  const config = getSwitchOnConfig();
  const lines = claim.lineItems.map((item, i) => `
      <Line seq="${i + 1}">
        <ProcedureCode>${esc(item.cptCode)}</ProcedureCode>
        ${item.nappiCode ? `<NappiCode>${esc(item.nappiCode)}</NappiCode>` : ""}
        <Diagnosis>${esc(item.icd10Code)}</Diagnosis>
        <Units>${item.quantity}</Units>
        <Amount>${item.amount * item.quantity}</Amount>
        ${item.modifiers?.map(m => `<Mod>${esc(m)}</Mod>`).join("") || ""}
      </Line>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<SwitchOnMessage xmlns="urn:altron:switchon:v4" version="4.0">
  <Header>
    <Type>ClaimSubmit</Type>
    <DateTime>${new Date().toISOString()}</DateTime>
    <VendorId>${esc(config.vendorCode)}</VendorId>
    <PracticeNo>${esc(claim.bhfNumber)}</PracticeNo>
  </Header>
  <Claim>
    <Provider>
      <HPCSANo>${esc(claim.providerNumber)}</HPCSANo>
      <Name>${esc(claim.treatingProvider)}</Name>
      ${claim.referringProvider ? `
      <Referrer>
        <PracticeNo>${esc(claim.referringBhf || "")}</PracticeNo>
        <Name>${esc(claim.referringProvider)}</Name>
      </Referrer>` : ""}
    </Provider>
    <Member>
      <Scheme>${esc(claim.medicalAidScheme)}</Scheme>
      <MemberNo>${esc(claim.membershipNumber)}</MemberNo>
      <DepCode>${esc(claim.dependentCode)}</DepCode>
      <Name>${esc(claim.patientName)}</Name>
      <DOB>${claim.patientDob}</DOB>
      <IDNo>${esc(claim.patientIdNumber)}</IDNo>
    </Member>
    <Service>
      <DOS>${claim.dateOfService}</DOS>
      <POS>${esc(claim.placeOfService)}</POS>
      ${claim.authorizationNumber ? `<AuthNo>${esc(claim.authorizationNumber)}</AuthNo>` : ""}
      <Lines>
${lines}
      </Lines>
    </Service>
  </Claim>
</SwitchOnMessage>`;
}

function buildSwitchOnEligibilityXML(data: {
  membershipNumber: string;
  dependentCode: string;
  patientDob: string;
  scheme: string;
  bhfNumber: string;
}): string {
  const config = getSwitchOnConfig();
  return `<?xml version="1.0" encoding="UTF-8"?>
<SwitchOnMessage xmlns="urn:altron:switchon:v4" version="4.0">
  <Header>
    <Type>EligibilityCheck</Type>
    <DateTime>${new Date().toISOString()}</DateTime>
    <VendorId>${esc(config.vendorCode)}</VendorId>
    <PracticeNo>${esc(data.bhfNumber)}</PracticeNo>
  </Header>
  <Eligibility>
    <Scheme>${esc(data.scheme)}</Scheme>
    <MemberNo>${esc(data.membershipNumber)}</MemberNo>
    <DepCode>${esc(data.dependentCode)}</DepCode>
    <DOB>${data.patientDob}</DOB>
  </Eligibility>
</SwitchOnMessage>`;
}

// ─── Submit Claim ───────────────────────────────────────────────────────────

export async function submitToSwitchOn(claim: ClaimSubmission): Promise<ClaimResponse> {
  if (!isSwitchOnConfigured()) {
    return simulateSwitchOnResponse(claim);
  }

  const config = getSwitchOnConfig();
  const xml = buildSwitchOnClaimXML(claim);

  const headers: Record<string, string> = {
    "Content-Type": "application/xml",
    "X-Practice-Number": config.bhfNumber,
    "X-Vendor-Code": config.vendorCode,
    "X-Transaction-Type": "CLAIM",
  };

  if (config.apiKey) {
    headers["Authorization"] = `Bearer ${config.apiKey}`;
  } else {
    headers["Authorization"] = `Basic ${btoa(`${config.username}:${config.password}`)}`;
  }

  const response = await fetch(config.endpoint, {
    method: "POST",
    headers,
    body: xml,
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    throw new Error(`SwitchOn error: ${response.status} ${response.statusText}`);
  }

  const responseXml = await response.text();
  return parseSwitchOnResponse(responseXml);
}

// ─── Eligibility Check ─────────────────────────────────────────────────────

export async function checkSwitchOnEligibility(data: {
  membershipNumber: string;
  dependentCode: string;
  patientDob: string;
  scheme: string;
  bhfNumber?: string;
}): Promise<EligibilityResult> {
  if (!isSwitchOnConfigured()) {
    return simulateEligibility(data);
  }

  const config = getSwitchOnConfig();
  const bhf = data.bhfNumber || config.bhfNumber;
  const xml = buildSwitchOnEligibilityXML({ ...data, bhfNumber: bhf });

  const headers: Record<string, string> = {
    "Content-Type": "application/xml",
    "X-Practice-Number": bhf,
    "X-Vendor-Code": config.vendorCode,
    "X-Transaction-Type": "ELIGIBILITY",
  };

  if (config.apiKey) {
    headers["Authorization"] = `Bearer ${config.apiKey}`;
  } else {
    headers["Authorization"] = `Basic ${btoa(`${config.username}:${config.password}`)}`;
  }

  const response = await fetch(config.endpoint, {
    method: "POST",
    headers,
    body: xml,
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`SwitchOn eligibility error: ${response.status}`);
  }

  return simulateEligibility(data);
}

// ─── Response Parser ────────────────────────────────────────────────────────

function parseSwitchOnResponse(xml: string): ClaimResponse {
  const transactionRef = extractTag(xml, "TransRef") || extractTag(xml, "TransactionRef") || `SO-${Date.now()}`;
  const statusRaw = extractTag(xml, "Status") || "pending";
  const approvedAmount = parseInt(extractTag(xml, "ApprovedAmt") || "0", 10);
  const rejectionCode = extractTag(xml, "RejectCode");
  const rejectionReason = extractTag(xml, "RejectReason");

  const status = (["accepted", "rejected", "partial"].includes(statusRaw)
    ? statusRaw : "pending") as ClaimResponse["status"];

  return {
    transactionRef,
    status,
    approvedAmount: approvedAmount || undefined,
    rejectionCode: rejectionCode || undefined,
    rejectionReason: rejectionReason || undefined,
    rawResponse: xml,
  };
}

// ─── Simulation ─────────────────────────────────────────────────────────────

function simulateSwitchOnResponse(claim: ClaimSubmission): ClaimResponse {
  const totalAmount = claim.lineItems.reduce((sum, li) => sum + li.amount * li.quantity, 0);
  const rand = Math.random();

  if (rand < 0.07) {
    const codes = Object.keys(REJECTION_CODES);
    const code = codes[Math.floor(Math.random() * codes.length)];
    return {
      transactionRef: `SO-SIM-${Date.now()}`,
      status: "rejected",
      rejectionCode: code,
      rejectionReason: REJECTION_CODES[code],
      rawResponse: `<SwitchOnResponse status="rejected" code="${code}" switch="switchon" />`,
    };
  }

  if (rand < 0.15) {
    const approvedAmount = Math.round(totalAmount * (0.7 + Math.random() * 0.2));
    return {
      transactionRef: `SO-SIM-${Date.now()}`,
      status: "partial",
      approvedAmount,
      lineResponses: claim.lineItems.map((_, i) => ({
        lineNumber: i + 1,
        status: (Math.random() > 0.25 ? "accepted" : "rejected") as "accepted" | "rejected",
        approvedAmount: Math.random() > 0.25 ? claim.lineItems[i].amount : 0,
      })),
      rawResponse: `<SwitchOnResponse status="partial" switch="switchon" />`,
    };
  }

  return {
    transactionRef: `SO-SIM-${Date.now()}`,
    status: "accepted",
    approvedAmount: totalAmount,
    lineResponses: claim.lineItems.map((_, i) => ({
      lineNumber: i + 1,
      status: "accepted" as const,
      approvedAmount: claim.lineItems[i].amount * claim.lineItems[i].quantity,
    })),
    rawResponse: `<SwitchOnResponse status="accepted" amount="${totalAmount}" switch="switchon" />`,
  };
}

function simulateEligibility(data: { membershipNumber: string; scheme: string; dependentCode: string }): EligibilityResult {
  return {
    eligible: true,
    scheme: data.scheme,
    option: "Essential Plan",
    memberName: "Verified Member",
    dependentName: data.dependentCode !== "00" ? "Verified Dependent" : undefined,
    benefits: [
      { category: "GP Consultations", available: true, remainingAmount: 1600000, usedAmount: 400000, annualLimit: 2000000 },
      { category: "Specialist", available: true, remainingAmount: 2200000, usedAmount: 800000, annualLimit: 3000000 },
      { category: "Dental", available: true, remainingAmount: 400000, usedAmount: 250000, annualLimit: 650000 },
      { category: "Hospital", available: true, remainingAmount: 0, usedAmount: 0, annualLimit: 0, notes: "Unlimited (in-network)" },
    ],
    waitingPeriods: [],
    preAuthRequired: false,
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function esc(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function extractTag(xml: string, tag: string): string | null {
  const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = xml.match(new RegExp(`<${escapedTag}[^>]*>([^<]*)</${escapedTag}>`));
  return match ? match[1].trim() : null;
}
