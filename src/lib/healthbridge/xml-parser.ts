// Safe XML parser for Healthbridge claim responses
// No external dependencies — prevents XXE, handles CDATA, extracts typed ClaimResponse

import type { ClaimResponse } from "./types";

/**
 * Safely parse a Healthbridge claim response XML into a typed ClaimResponse.
 *
 * Security measures:
 * - Strips DOCTYPE declarations (prevents XXE)
 * - Strips entity references (prevents entity expansion attacks)
 * - Handles CDATA sections
 */
export function safeParseClaimResponse(xml: string): ClaimResponse {
  const sanitized = sanitizeXml(xml);

  const transactionRef = extractTagValue(sanitized, "TransactionRef") || `HB-${Date.now()}`;
  const statusRaw = extractTagValue(sanitized, "Status") || "pending";
  const approvedAmountStr = extractTagValue(sanitized, "ApprovedAmount");
  const rejectionCode = extractTagValue(sanitized, "RejectionCode");
  const rejectionReason = extractTagValue(sanitized, "RejectionReason");

  const approvedAmount = approvedAmountStr ? parseInt(approvedAmountStr, 10) : undefined;

  const status = (["accepted", "rejected", "partial", "pending"].includes(statusRaw)
    ? statusRaw
    : "pending") as ClaimResponse["status"];

  // Parse per-line responses if present
  const lineResponses = extractLineResponses(sanitized);

  return {
    transactionRef,
    status,
    approvedAmount: approvedAmount && !isNaN(approvedAmount) ? approvedAmount : undefined,
    rejectionCode: rejectionCode || undefined,
    rejectionReason: rejectionReason || undefined,
    lineResponses: lineResponses.length > 0 ? lineResponses : undefined,
    rawResponse: xml,
  };
}

/** Strip DOCTYPE declarations and entity references to prevent XXE attacks */
function sanitizeXml(xml: string): string {
  let safe = xml;

  // Remove DOCTYPE declarations (prevents XXE)
  safe = safe.replace(/<!DOCTYPE[^>]*>/gi, "");

  // Remove entity declarations
  safe = safe.replace(/<!ENTITY[^>]*>/gi, "");

  // Remove entity references (e.g., &xxe;) but keep standard XML entities (&amp; &lt; &gt; &quot; &apos;)
  safe = safe.replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)[a-zA-Z_][\w.-]*;/g, "");

  // Resolve CDATA sections to plain text
  safe = safe.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (_match, content: string) => {
    // Escape the CDATA content so it's safe as regular text
    return escapeXmlText(content);
  });

  return safe;
}

/** Extract the text content of an XML tag, handling nested content */
function extractTagValue(xml: string, tag: string): string | null {
  // Match tag with optional attributes, capture inner text
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const match = xml.match(regex);
  if (!match) return null;

  const value = match[1].trim();
  // Unescape standard XML entities
  return unescapeXml(value);
}

/** Extract per-line item responses */
function extractLineResponses(xml: string): NonNullable<ClaimResponse["lineResponses"]> {
  const responses: NonNullable<ClaimResponse["lineResponses"]> = [];

  // Match all LineResponse or LineItemResponse blocks
  const lineRegex = /<(?:LineResponse|LineItemResponse)[^>]*>([\s\S]*?)<\/(?:LineResponse|LineItemResponse)>/gi;
  let lineMatch: RegExpExecArray | null;

  while ((lineMatch = lineRegex.exec(xml)) !== null) {
    const block = lineMatch[1];
    const lineNumber = parseInt(extractTagValue(block, "LineNumber") || "0", 10);
    const lineStatus = extractTagValue(block, "Status") || "rejected";
    const lineApproved = extractTagValue(block, "ApprovedAmount");
    const lineRejCode = extractTagValue(block, "RejectionCode");
    const lineRejReason = extractTagValue(block, "RejectionReason");

    responses.push({
      lineNumber,
      status: lineStatus === "accepted" ? "accepted" : "rejected",
      approvedAmount: lineApproved ? parseInt(lineApproved, 10) : undefined,
      rejectionCode: lineRejCode || undefined,
      rejectionReason: lineRejReason || undefined,
    });
  }

  return responses;
}

/** Unescape standard XML entities */
function unescapeXml(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_m, code: string) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, code: string) => String.fromCharCode(parseInt(code, 16)));
}

/** Escape text for safe inclusion in XML */
function escapeXmlText(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
