/**
 * Post-Validation EDIFACT Generator
 *
 * After a claim passes all 10 validation layers, this generates
 * the Healthbridge MEDCLM EDIFACT message ready for submission.
 *
 * Flow: Validated claim → scheme-specific formatting → EDIFACT → ready to submit
 *
 * Based on PHISC MEDCLM v0-912-13.4 specification.
 */

import type { ClaimLineItem } from "./types";

export interface EDIFACTResult {
  message: string;
  switchProvider: "healthbridge" | "switchon" | "medikredit";
  messageRef: string;
  segments: number;
  valid: boolean;
  schemeRouting: {
    scheme: string;
    planCode: string;
    switchEndpoint: string;
  };
}

// Scheme → Switch routing
const SCHEME_SWITCH_MAP: Record<string, string> = {
  "discovery": "healthbridge",
  "gems": "healthbridge",
  "bonitas": "healthbridge",
  "momentum": "healthbridge",
  "medihelp": "healthbridge",
  "bestmed": "healthbridge",
  "fedhealth": "healthbridge",
  "bankmed": "healthbridge",
  "compcare": "medikredit",
  "medshield": "medikredit",
  "pps": "medikredit",
  "keyhealth": "medikredit",
  "polmed": "switchon",
  "sizwe": "switchon",
  "parmed": "switchon",
};

function getSwitch(scheme: string): "healthbridge" | "switchon" | "medikredit" {
  const s = scheme.toLowerCase();
  for (const [key, sw] of Object.entries(SCHEME_SWITCH_MAP)) {
    if (s.includes(key)) return sw as "healthbridge" | "switchon" | "medikredit";
  }
  return "healthbridge"; // default
}

function generateMessageRef(): string {
  return "MSG" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
}

function escapeEdifact(val: string): string {
  return (val || "").replace(/'/g, "?'").replace(/\+/g, "?+").replace(/:/g, "?:");
}

function formatDate(dateStr: string): string {
  return (dateStr || "").replace(/-/g, "").slice(0, 8);
}

/**
 * Generate EDIFACT MEDCLM message from a validated claim.
 * Only call this AFTER the claim has passed all 10 validation layers.
 */
export function generateClaimEDIFACT(
  claim: ClaimLineItem,
  options?: { batchNumber?: string; practiceNumber?: string; practiceName?: string },
): EDIFACTResult {
  const sw = getSwitch(claim.scheme || "");
  const ref = generateMessageRef();
  const batchNo = options?.batchNumber || "B" + Date.now().toString(36).toUpperCase();
  const practiceNo = options?.practiceNumber || claim.practiceNumber || "0000000";
  const practiceName = options?.practiceName || "PRACTICE";

  const segments: string[] = [];

  // UNH — Message header
  segments.push("UNH+" + ref + "+MEDCLM:D:13B:ZA'");

  // BGM — Beginning of message (original claim)
  segments.push("BGM+380+" + batchNo + "+9'");

  // DTM — Date of preparation
  segments.push("DTM+137:" + formatDate(new Date().toISOString().split("T")[0]) + ":102'");

  // NAD+MS — Message sender (practice)
  segments.push("NAD+MS+" + escapeEdifact(practiceNo) + "::BHF+" + escapeEdifact(practiceName) + "'");

  // NAD+MR — Message receiver (switch)
  const switchName = sw === "healthbridge" ? "HEALTHBRIDGE" : sw === "switchon" ? "SWITCHON" : "MEDIKREDIT";
  segments.push("NAD+MR+" + switchName + "'");

  // GIS — Processing indicator (01 = claim)
  segments.push("GIS+01'");

  // --- Claim detail group ---

  // RFF+PRN — Practice reference number
  segments.push("RFF+PRN:" + escapeEdifact(practiceNo) + "'");

  // NAD+PAT — Patient
  segments.push("NAD+PAT+" + escapeEdifact(claim.membershipNumber || "") + "::SCHEME+" + escapeEdifact(claim.patientName || "PATIENT") + "'");

  // RFF+AHI — Membership number
  if (claim.membershipNumber) {
    segments.push("RFF+AHI:" + escapeEdifact(claim.membershipNumber) + "'");
  }

  // ATT+PAT — Patient attributes (gender, DOB)
  if (claim.patientGender) {
    const genderCode = claim.patientGender === "M" ? "1" : claim.patientGender === "F" ? "2" : "0";
    segments.push("ATT+PAT+" + genderCode + "'");
  }

  // RFF+DEP — Dependent code
  segments.push("RFF+DEP:" + (claim.dependentCode || "00") + "'");

  // DTM+472 — Date of service
  if (claim.dateOfService) {
    segments.push("DTM+472:" + formatDate(claim.dateOfService) + ":102'");
  }

  // RFF+ICD — Primary ICD-10
  if (claim.primaryICD10) {
    segments.push("RFF+ICD:" + escapeEdifact(claim.primaryICD10) + "'");
  }

  // RFF+ICD — Secondary ICD-10 (external cause)
  if (claim.secondaryICD10 && claim.secondaryICD10.length > 0) {
    for (const sec of claim.secondaryICD10) {
      segments.push("RFF+ICD:" + escapeEdifact(sec) + "'");
    }
  }

  // LIN — Line item
  segments.push("LIN+1'");

  // RFF+TAR — Tariff code
  if (claim.tariffCode) {
    segments.push("RFF+TAR:" + escapeEdifact(claim.tariffCode) + "'");
  }

  // QTY — Quantity
  segments.push("QTY+47:" + (claim.quantity || 1) + "'");

  // MOA — Amount
  if (claim.amount) {
    segments.push("MOA+9:" + claim.amount.toFixed(2) + "'");
  }

  // RFF+NAP — NAPPI code (if medicine)
  if (claim.nappiCode) {
    segments.push("RFF+NAP:" + escapeEdifact(claim.nappiCode) + "'");
  }

  // FTX+MOT — Motivation text
  if (claim.motivationText) {
    segments.push("FTX+MOT+++" + escapeEdifact(claim.motivationText.slice(0, 350)) + "'");
  }

  // RFF+MOD — Modifier
  if (claim.modifier) {
    segments.push("RFF+MOD:" + escapeEdifact(claim.modifier) + "'");
  }

  // POS — Place of service
  if (claim.placeOfService) {
    segments.push("POS+" + escapeEdifact(claim.placeOfService) + "'");
  }

  // UNT — Message trailer
  segments.push("UNT+" + (segments.length + 1) + "+" + ref + "'");

  const message = segments.join("\n");

  return {
    message,
    switchProvider: sw,
    messageRef: ref,
    segments: segments.length,
    valid: true,
    schemeRouting: {
      scheme: claim.scheme || "Unknown",
      planCode: claim.schemeOptionCode || "",
      switchEndpoint: sw === "healthbridge"
        ? "https://switch.healthbridge.co.za/medclm"
        : sw === "switchon"
        ? "https://gateway.switchon.co.za/claims"
        : "https://api.medikredit.co.za/submit",
    },
  };
}

/**
 * Generate EDIFACT for a batch of validated claims.
 */
export function generateBatchEDIFACT(
  claims: ClaimLineItem[],
  options?: { practiceNumber?: string; practiceName?: string },
): { messages: EDIFACTResult[]; batchSummary: { total: number; bySwitch: Record<string, number> } } {
  const batchNo = "B" + Date.now().toString(36).toUpperCase();
  const messages = claims.map(function(c) {
    return generateClaimEDIFACT(c, { ...options, batchNumber: batchNo });
  });

  const bySwitch: Record<string, number> = {};
  for (const m of messages) {
    bySwitch[m.switchProvider] = (bySwitch[m.switchProvider] || 0) + 1;
  }

  return {
    messages,
    batchSummary: { total: messages.length, bySwitch },
  };
}
