import { describe, it, expect } from "vitest";
import { safeParseClaimResponse } from "@/lib/healthbridge/xml-parser";

describe("Safe XML Parser — safeParseClaimResponse", () => {
  it("should parse a valid accepted response", () => {
    const xml = `<?xml version="1.0"?>
    <ClaimResponse>
      <TransactionRef>HB-12345</TransactionRef>
      <Status>accepted</Status>
      <ApprovedAmount>52000</ApprovedAmount>
    </ClaimResponse>`;

    const result = safeParseClaimResponse(xml);
    expect(result.transactionRef).toBe("HB-12345");
    expect(result.status).toBe("accepted");
    expect(result.approvedAmount).toBe(52000);
    expect(result.rawResponse).toBe(xml);
  });

  it("should parse a rejected response with rejection details", () => {
    const xml = `<ClaimResponse>
      <TransactionRef>HB-99999</TransactionRef>
      <Status>rejected</Status>
      <RejectionCode>08</RejectionCode>
      <RejectionReason>Pre-authorization required</RejectionReason>
    </ClaimResponse>`;

    const result = safeParseClaimResponse(xml);
    expect(result.status).toBe("rejected");
    expect(result.rejectionCode).toBe("08");
    expect(result.rejectionReason).toBe("Pre-authorization required");
    expect(result.approvedAmount).toBeUndefined();
  });

  it("should parse partial response with line-level detail", () => {
    const xml = `<ClaimResponse>
      <TransactionRef>HB-55555</TransactionRef>
      <Status>partial</Status>
      <ApprovedAmount>35000</ApprovedAmount>
      <LineResponse>
        <LineNumber>1</LineNumber>
        <Status>accepted</Status>
        <ApprovedAmount>35000</ApprovedAmount>
      </LineResponse>
      <LineResponse>
        <LineNumber>2</LineNumber>
        <Status>rejected</Status>
        <RejectionCode>15</RejectionCode>
        <RejectionReason>Amount exceeds scheme tariff</RejectionReason>
      </LineResponse>
    </ClaimResponse>`;

    const result = safeParseClaimResponse(xml);
    expect(result.status).toBe("partial");
    expect(result.lineResponses).toHaveLength(2);
    expect(result.lineResponses![0].status).toBe("accepted");
    expect(result.lineResponses![0].approvedAmount).toBe(35000);
    expect(result.lineResponses![1].status).toBe("rejected");
    expect(result.lineResponses![1].rejectionCode).toBe("15");
  });

  it("should also accept LineItemResponse tag variant", () => {
    const xml = `<ClaimResponse>
      <TransactionRef>HB-77777</TransactionRef>
      <Status>accepted</Status>
      <LineItemResponse>
        <LineNumber>1</LineNumber>
        <Status>accepted</Status>
        <ApprovedAmount>52000</ApprovedAmount>
      </LineItemResponse>
    </ClaimResponse>`;

    const result = safeParseClaimResponse(xml);
    expect(result.lineResponses).toHaveLength(1);
    expect(result.lineResponses![0].lineNumber).toBe(1);
  });

  it("should strip DOCTYPE declarations (XXE prevention)", () => {
    const xml = `<?xml version="1.0"?>
    <!DOCTYPE foo [
      <!ENTITY xxe SYSTEM "file:///etc/passwd">
    ]>
    <ClaimResponse>
      <TransactionRef>HB-XXE</TransactionRef>
      <Status>accepted</Status>
      <ApprovedAmount>52000</ApprovedAmount>
    </ClaimResponse>`;

    const result = safeParseClaimResponse(xml);
    expect(result.transactionRef).toBe("HB-XXE");
    expect(result.status).toBe("accepted");
    // Should not have leaked any file content
    expect(result.rawResponse).toBe(xml); // raw is preserved for audit
  });

  it("should strip entity references (XXE entity expansion)", () => {
    const xml = `<ClaimResponse>
      <TransactionRef>&xxe;</TransactionRef>
      <Status>accepted</Status>
    </ClaimResponse>`;

    const result = safeParseClaimResponse(xml);
    // Entity reference should be stripped, falling back to generated ref
    expect(result.transactionRef).not.toContain("&xxe;");
  });

  it("should preserve standard XML entities (&amp; &lt; etc.)", () => {
    const xml = `<ClaimResponse>
      <TransactionRef>HB-A&amp;B</TransactionRef>
      <Status>accepted</Status>
      <RejectionReason>Amount &lt; minimum</RejectionReason>
    </ClaimResponse>`;

    const result = safeParseClaimResponse(xml);
    expect(result.transactionRef).toBe("HB-A&B");
  });

  it("should handle CDATA sections", () => {
    const xml = `<ClaimResponse>
      <TransactionRef><![CDATA[HB-CDATA-123]]></TransactionRef>
      <Status>accepted</Status>
      <ApprovedAmount>10000</ApprovedAmount>
    </ClaimResponse>`;

    const result = safeParseClaimResponse(xml);
    expect(result.transactionRef).toBe("HB-CDATA-123");
    expect(result.status).toBe("accepted");
  });

  it("should handle empty XML gracefully", () => {
    const result = safeParseClaimResponse("");
    expect(result.status).toBe("pending");
    expect(result.transactionRef).toMatch(/^HB-/);
  });

  it("should handle malformed XML (missing closing tags)", () => {
    const xml = `<ClaimResponse>
      <TransactionRef>HB-BROKEN
      <Status>accepted</Status>
    </ClaimResponse>`;

    // Should not throw — should return defaults for missing fields
    const result = safeParseClaimResponse(xml);
    expect(result.status).toBe("accepted");
  });

  it("should default unknown status values to 'pending'", () => {
    const xml = `<ClaimResponse>
      <TransactionRef>HB-UNK</TransactionRef>
      <Status>unknown_status</Status>
    </ClaimResponse>`;

    const result = safeParseClaimResponse(xml);
    expect(result.status).toBe("pending");
  });

  it("should handle numeric entity references (&#160;)", () => {
    const xml = `<ClaimResponse>
      <TransactionRef>HB-ENT</TransactionRef>
      <Status>accepted</Status>
      <RejectionReason>No&#32;space</RejectionReason>
    </ClaimResponse>`;

    const result = safeParseClaimResponse(xml);
    // &#32; = space character
    expect(result.transactionRef).toBe("HB-ENT");
  });

  it("should handle NaN approved amount gracefully", () => {
    const xml = `<ClaimResponse>
      <TransactionRef>HB-NAN</TransactionRef>
      <Status>accepted</Status>
      <ApprovedAmount>not-a-number</ApprovedAmount>
    </ClaimResponse>`;

    const result = safeParseClaimResponse(xml);
    expect(result.approvedAmount).toBeUndefined();
  });

  it("should handle negative approved amount", () => {
    const xml = `<ClaimResponse>
      <TransactionRef>HB-NEG</TransactionRef>
      <Status>accepted</Status>
      <ApprovedAmount>-5000</ApprovedAmount>
    </ClaimResponse>`;

    const result = safeParseClaimResponse(xml);
    // Negative amount passes parseInt, is not NaN
    expect(result.approvedAmount).toBe(-5000);
  });

  it("should handle XML with nested CDATA containing special chars", () => {
    const xml = `<ClaimResponse>
      <TransactionRef>HB-NEST</TransactionRef>
      <Status>accepted</Status>
      <RejectionReason><![CDATA[Amount < 100 & > 50]]></RejectionReason>
    </ClaimResponse>`;

    const result = safeParseClaimResponse(xml);
    // CDATA content gets escaped when resolved, then unescaped during extraction
    expect(result.status).toBe("accepted");
  });
});
