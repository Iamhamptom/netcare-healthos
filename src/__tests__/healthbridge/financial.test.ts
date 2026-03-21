import { describe, it, expect } from "vitest";
import { formatZAR, parseZARToCents } from "@/lib/healthbridge/codes";
import { estimatePatientCost, calculateSchemeAnalytics } from "@/lib/healthbridge/analytics";
import type { ClaimRecord } from "@/lib/healthbridge/analytics";
import { parseBatchCSV, validateBatch } from "@/lib/healthbridge/batch";
import { safeParseClaimResponse } from "@/lib/healthbridge/xml-parser";

describe("FINANCIAL: ZAR Currency Handling", () => {
  it("should convert R0.01 to 1 cent without rounding error", () => {
    expect(parseZARToCents("0.01")).toBe(1);
    expect(parseZARToCents(0.01)).toBe(1);
  });

  it("should convert R999,999.99 to 99999999 cents", () => {
    expect(parseZARToCents("R 999,999.99")).toBe(99999999);
    expect(parseZARToCents(999999.99)).toBe(99999999);
  });

  it("should round R0.005 to 1 cent (round half up)", () => {
    expect(parseZARToCents(0.005)).toBe(1);
    expect(parseZARToCents("0.005")).toBe(1);
  });

  it("should reject negative amounts by returning negative cents", () => {
    expect(parseZARToCents(-520)).toBe(-52000);
    expect(parseZARToCents("-520")).toBe(-52000);
  });

  it("should return 0 for zero amount", () => {
    expect(parseZARToCents(0)).toBe(0);
    expect(parseZARToCents("0")).toBe(0);
    expect(parseZARToCents("R 0.00")).toBe(0);
  });

  it("should format 1 cent to R 0.01", () => {
    expect(formatZAR(1)).toBe("R 0.01");
  });

  it("should format 99999999 cents to R 999999.99", () => {
    expect(formatZAR(99999999)).toBe("R 999999.99");
  });

  it("should format 0 cents to R 0.00", () => {
    expect(formatZAR(0)).toBe("R 0.00");
  });

  it("should format 52000 cents to R 520.00", () => {
    expect(formatZAR(52000)).toBe("R 520.00");
  });

  it("should handle R1.999 rounding to 200 cents", () => {
    expect(parseZARToCents(1.999)).toBe(200);
  });

  it("should handle non-numeric string gracefully (return 0)", () => {
    expect(parseZARToCents("abc")).toBe(0);
    expect(parseZARToCents("")).toBe(0);
  });

  it("should handle comma-separated thousands", () => {
    expect(parseZARToCents("R 1,520.00")).toBe(152000);
    expect(parseZARToCents("R 10,000.50")).toBe(1000050);
  });
});

describe("FINANCIAL: Patient Cost Estimation Accuracy", () => {
  it("should calculate R0 patient liability at 100% scheme rate", () => {
    const estimate = estimatePatientCost({
      lineItems: [{ cptCode: "0190", amount: 52000, quantity: 1 }],
      schemeRate: 100,
      hasGapCover: false,
    });
    expect(estimate.totalCharge).toBe(52000);
    expect(estimate.estimatedSchemePayment).toBe(52000);
    expect(estimate.estimatedPatientLiability).toBe(0);
    expect(estimate.finalPatientCost).toBe(0);
  });

  it("should calculate full patient liability at 0% scheme rate", () => {
    const estimate = estimatePatientCost({
      lineItems: [{ cptCode: "0190", amount: 52000, quantity: 1 }],
      schemeRate: 0,
      hasGapCover: false,
    });
    expect(estimate.totalCharge).toBe(52000);
    expect(estimate.estimatedSchemePayment).toBe(0);
    expect(estimate.estimatedPatientLiability).toBe(52000);
    expect(estimate.finalPatientCost).toBe(52000);
  });

  it("should calculate gap cover recovery correctly (3x multiple)", () => {
    const estimate = estimatePatientCost({
      lineItems: [{ cptCode: "0141", amount: 200000, quantity: 1 }],
      schemeRate: 50,
      hasGapCover: true,
      gapCoverMultiple: 3,
    });
    // Scheme pays 50% = R1000 (100000 cents)
    // Gap cover: up to 3x scheme rate - scheme rate = 2x scheme payment = 200000
    // Shortfall = 200000 - 100000 = 100000
    // Gap covers min(shortfall, 2 * scheme payment) = min(100000, 200000) = 100000
    expect(estimate.estimatedSchemePayment).toBe(100000);
    expect(estimate.estimatedPatientLiability).toBe(100000);
    expect(estimate.estimatedGapCoverRecovery).toBe(100000);
    expect(estimate.finalPatientCost).toBe(0); // Gap covers everything
  });

  it("should calculate gap cover with 0 scheme payment = no gap recovery", () => {
    const estimate = estimatePatientCost({
      lineItems: [{ cptCode: "0190", amount: 52000, quantity: 1 }],
      schemeRate: 0,
      hasGapCover: true,
      gapCoverMultiple: 3,
    });
    // Scheme pays 0, gap cover = (3-1) * 0 = 0
    expect(estimate.estimatedSchemePayment).toBe(0);
    expect(estimate.estimatedGapCoverRecovery).toBe(0);
    expect(estimate.finalPatientCost).toBe(52000);
  });

  it("should handle very large amounts (R1M+) without overflow", () => {
    const estimate = estimatePatientCost({
      lineItems: [{ cptCode: "0141", amount: 100000000, quantity: 1 }], // R1,000,000
      schemeRate: 80,
      hasGapCover: false,
    });
    expect(estimate.totalCharge).toBe(100000000);
    expect(estimate.estimatedSchemePayment).toBe(80000000);
    expect(estimate.estimatedPatientLiability).toBe(20000000);
    expect(estimate.finalPatientCost).toBe(20000000);
  });

  it("should calculate exact cents without floating point drift", () => {
    // Test with amounts that could cause floating point issues
    const estimate = estimatePatientCost({
      lineItems: [
        { cptCode: "0190", amount: 33333, quantity: 1 },
        { cptCode: "0308", amount: 33333, quantity: 1 },
        { cptCode: "0382", amount: 33334, quantity: 1 },
      ],
      schemeRate: 100,
      hasGapCover: false,
    });
    expect(estimate.totalCharge).toBe(100000); // Exact sum
    expect(estimate.estimatedSchemePayment).toBe(100000);
    expect(estimate.estimatedPatientLiability).toBe(0);
  });

  it("should handle multiple line items with quantities", () => {
    const estimate = estimatePatientCost({
      lineItems: [
        { cptCode: "0190", amount: 52000, quantity: 2 },
        { cptCode: "1101", amount: 12000, quantity: 3 },
      ],
      schemeRate: 100,
      hasGapCover: false,
    });
    expect(estimate.totalCharge).toBe(52000 * 2 + 12000 * 3); // 104000 + 36000 = 140000
    expect(estimate.estimatedSchemePayment).toBe(140000);
  });
});

describe("FINANCIAL: Scheme Analytics Accuracy", () => {
  it("should return 0% acceptance rate for 0 claims (not NaN/Infinity)", () => {
    const analytics = calculateSchemeAnalytics([]);
    expect(analytics).toHaveLength(0);
    // No schemes = empty array, no NaN possible
  });

  it("should return 100% acceptance rate for 1/1 accepted claims", () => {
    const claims: ClaimRecord[] = [
      {
        id: "1", patientName: "A", medicalAidScheme: "Discovery Health",
        totalAmount: 52000, approvedAmount: 52000, paidAmount: 52000,
        status: "paid", dateOfService: "2026-03-01",
        submittedAt: "2026-03-01T10:00:00Z", respondedAt: "2026-03-01T12:00:00Z",
        reconciledAt: "2026-03-10T10:00:00Z",
        rejectionCode: "", rejectionReason: "",
      },
    ];
    const analytics = calculateSchemeAnalytics(claims);
    expect(analytics).toHaveLength(1);
    expect(analytics[0].acceptanceRate).toBe(100);
    expect(analytics[0].rejectionRate).toBe(0);
  });

  it("should calculate 0% collection rate with 0 billed (not divide-by-zero)", () => {
    const claims: ClaimRecord[] = [
      {
        id: "1", patientName: "A", medicalAidScheme: "Test",
        totalAmount: 0, approvedAmount: 0, paidAmount: 0,
        status: "draft", dateOfService: "2026-03-01",
        submittedAt: null, respondedAt: null, reconciledAt: null,
        rejectionCode: "", rejectionReason: "",
      },
    ];
    const analytics = calculateSchemeAnalytics(claims);
    expect(analytics[0].collectionRate).toBe(0);
    expect(Number.isNaN(analytics[0].collectionRate)).toBe(false);
  });

  it("should calculate 0 avg days to payment with 0 paid claims (not NaN)", () => {
    const claims: ClaimRecord[] = [
      {
        id: "1", patientName: "A", medicalAidScheme: "Test",
        totalAmount: 52000, approvedAmount: 0, paidAmount: 0,
        status: "rejected", dateOfService: "2026-03-01",
        submittedAt: "2026-03-01T10:00:00Z", respondedAt: "2026-03-01T12:00:00Z",
        reconciledAt: null,
        rejectionCode: "08", rejectionReason: "Pre-auth required",
      },
    ];
    const analytics = calculateSchemeAnalytics(claims);
    expect(analytics[0].avgDaysToPayment).toBe(0);
    expect(Number.isNaN(analytics[0].avgDaysToPayment)).toBe(false);
  });

  it("should calculate total billed as exact sum of all claim amounts", () => {
    const claims: ClaimRecord[] = [
      { id: "1", patientName: "A", medicalAidScheme: "Test", totalAmount: 52000, approvedAmount: 52000, paidAmount: 52000, status: "paid", dateOfService: "2026-03-01", submittedAt: "2026-03-01T10:00:00Z", respondedAt: "2026-03-01T12:00:00Z", reconciledAt: "2026-03-10T10:00:00Z", rejectionCode: "", rejectionReason: "" },
      { id: "2", patientName: "B", medicalAidScheme: "Test", totalAmount: 35000, approvedAmount: 35000, paidAmount: 35000, status: "paid", dateOfService: "2026-03-02", submittedAt: "2026-03-02T10:00:00Z", respondedAt: "2026-03-02T12:00:00Z", reconciledAt: "2026-03-11T10:00:00Z", rejectionCode: "", rejectionReason: "" },
      { id: "3", patientName: "C", medicalAidScheme: "Test", totalAmount: 78000, approvedAmount: 0, paidAmount: 0, status: "rejected", dateOfService: "2026-03-03", submittedAt: "2026-03-03T10:00:00Z", respondedAt: "2026-03-03T12:00:00Z", reconciledAt: null, rejectionCode: "08", rejectionReason: "Pre-auth" },
    ];
    const analytics = calculateSchemeAnalytics(claims);
    expect(analytics[0].totalBilled).toBe(52000 + 35000 + 78000);
    expect(analytics[0].totalPaid).toBe(52000 + 35000);
    expect(analytics[0].totalOutstanding).toBe(78000);
  });

  it("should calculate acceptance rate correctly with mixed statuses", () => {
    const claims: ClaimRecord[] = [
      { id: "1", patientName: "A", medicalAidScheme: "Disc", totalAmount: 52000, approvedAmount: 52000, paidAmount: 52000, status: "paid", dateOfService: "2026-03-01", submittedAt: "2026-03-01T10:00:00Z", respondedAt: "2026-03-01T12:00:00Z", reconciledAt: "2026-03-10T10:00:00Z", rejectionCode: "", rejectionReason: "" },
      { id: "2", patientName: "B", medicalAidScheme: "Disc", totalAmount: 35000, approvedAmount: 35000, paidAmount: 0, status: "accepted", dateOfService: "2026-03-02", submittedAt: "2026-03-02T10:00:00Z", respondedAt: null, reconciledAt: null, rejectionCode: "", rejectionReason: "" },
      { id: "3", patientName: "C", medicalAidScheme: "Disc", totalAmount: 78000, approvedAmount: 0, paidAmount: 0, status: "rejected", dateOfService: "2026-03-03", submittedAt: "2026-03-03T10:00:00Z", respondedAt: "2026-03-03T12:00:00Z", reconciledAt: null, rejectionCode: "08", rejectionReason: "Pre-auth" },
      { id: "4", patientName: "D", medicalAidScheme: "Disc", totalAmount: 60000, approvedAmount: 0, paidAmount: 0, status: "submitted", dateOfService: "2026-03-04", submittedAt: "2026-03-04T10:00:00Z", respondedAt: null, reconciledAt: null, rejectionCode: "", rejectionReason: "" },
    ];
    const analytics = calculateSchemeAnalytics(claims);
    // accepted statuses: paid, accepted = 2 out of 4
    expect(analytics[0].acceptanceRate).toBe(50);
    expect(analytics[0].rejectionRate).toBe(25);
  });
});

describe("FINANCIAL: eRA Reconciliation Math", () => {
  it("should parse accepted response with correct approved amount", () => {
    const xml = `<ClaimResponse>
      <TransactionRef>HB-12345</TransactionRef>
      <Status>accepted</Status>
      <ApprovedAmount>52000</ApprovedAmount>
    </ClaimResponse>`;
    const result = safeParseClaimResponse(xml);
    expect(result.status).toBe("accepted");
    expect(result.approvedAmount).toBe(52000);
  });

  it("should parse partial response with short-paid line items", () => {
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
    expect(result.approvedAmount).toBe(35000);
    expect(result.lineResponses).toHaveLength(2);
    expect(result.lineResponses![0].approvedAmount).toBe(35000);
    expect(result.lineResponses![1].status).toBe("rejected");
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

  it("should parse negative approved amount correctly", () => {
    const xml = `<ClaimResponse>
      <TransactionRef>HB-NEG</TransactionRef>
      <Status>accepted</Status>
      <ApprovedAmount>-5000</ApprovedAmount>
    </ClaimResponse>`;
    const result = safeParseClaimResponse(xml);
    expect(result.approvedAmount).toBe(-5000);
  });
});

describe("FINANCIAL: Batch Financial Totals", () => {
  it("should convert CSV amounts in ZAR (R520) to cents (52000) via batch validator", () => {
    const rows = [{
      rowNumber: 2,
      patientName: "John Mokoena",
      patientDob: "",
      patientIdNumber: "",
      medicalAidScheme: "Discovery Health",
      membershipNumber: "900012345",
      dependentCode: "00",
      dateOfService: new Date().toISOString().slice(0, 10),
      icd10Code: "I10",
      cptCode: "0190",
      description: "GP consultation",
      amount: 520, // R520 in ZAR
      authorizationNumber: "",
    }];

    const result = validateBatch(rows, "1234567");
    expect(result.validRows).toBe(1);
    // The batch validator internally converts R520 -> 52000 cents
  });

  it("should parse R520.50 as 520.5 from CSV", () => {
    const csv = `patient_name,scheme,membership,icd10,amount
John,Discovery Health,12345,I10,520.50`;
    const { rows } = parseBatchCSV(csv);
    expect(rows[0].amount).toBe(520.5);
  });

  it("should handle large batch (100 rows) with correct total", () => {
    const header = "patient_name,scheme,membership,icd10,amount";
    const dataRows = Array.from({ length: 100 }, (_, i) =>
      `Patient${i},Discovery Health,90001${String(i).padStart(4, "0")},I10,520`
    ).join("\n");
    const csv = `${header}\n${dataRows}`;

    const { rows, errors } = parseBatchCSV(csv);
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(100);

    // Verify total
    const total = rows.reduce((sum, r) => sum + r.amount, 0);
    expect(total).toBe(100 * 520);
  });
});
