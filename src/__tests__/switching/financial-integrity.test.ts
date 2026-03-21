import { describe, it, expect } from "vitest";
import { formatZAR, parseZARToCents } from "@/lib/healthbridge/codes";
import { generateEDIFACT, parseEDIFACT } from "@/lib/switching/edifact";
import { getBatchSummary } from "@/lib/switching/batch";
import { parseERAXml, reconcileERA, generateDisputes } from "@/lib/switching/era-parser";
import { checkPreAuthRequired } from "@/lib/switching/preauth";
import type { ClaimSubmission } from "@/lib/healthbridge/types";
import type { BatchJob } from "@/lib/switching/types";

const baseClaim: ClaimSubmission = {
  bhfNumber: "1234567",
  providerNumber: "MP0123456",
  treatingProvider: "Dr Test",
  patientName: "Test Patient",
  patientDob: "1985-06-15",
  patientIdNumber: "8506155800083",
  medicalAidScheme: "Discovery Health",
  membershipNumber: "900012345",
  dependentCode: "00",
  dateOfService: "2026-03-20",
  placeOfService: "11",
  lineItems: [
    { icd10Code: "J06.9", cptCode: "0190", description: "GP Consultation", quantity: 1, amount: 52000 },
  ],
  practiceId: "practice-001",
};

describe("ZAR Currency Precision", () => {
  it("formatZAR correctly formats cents to rand display", () => {
    expect(formatZAR(52000)).toBe("R 520.00");
    expect(formatZAR(100)).toBe("R 1.00");
    expect(formatZAR(1)).toBe("R 0.01");
    expect(formatZAR(0)).toBe("R 0.00");
    expect(formatZAR(99999)).toBe("R 999.99");
    expect(formatZAR(1000000)).toBe("R 10000.00");
  });

  it("parseZARToCents correctly parses rand strings", () => {
    expect(parseZARToCents("R 520.00")).toBe(52000);
    expect(parseZARToCents("R520.00")).toBe(52000);
    expect(parseZARToCents("520.00")).toBe(52000);
    expect(parseZARToCents("R 1,520.50")).toBe(152050);
    expect(parseZARToCents("0.01")).toBe(1);
    expect(parseZARToCents("0")).toBe(0);
  });

  it("parseZARToCents handles numeric input", () => {
    expect(parseZARToCents(520)).toBe(52000);
    expect(parseZARToCents(0.01)).toBe(1);
    expect(parseZARToCents(0)).toBe(0);
    expect(parseZARToCents(1520.50)).toBe(152050);
  });

  it("parseZARToCents returns 0 for invalid input", () => {
    expect(parseZARToCents("not a number")).toBe(0);
    expect(parseZARToCents("")).toBe(0);
  });

  it("round-trip: formatZAR -> parseZARToCents preserves value", () => {
    const testValues = [0, 1, 100, 52000, 99999, 1500000, 350000];
    for (const cents of testValues) {
      const formatted = formatZAR(cents);
      const parsed = parseZARToCents(formatted);
      expect(parsed).toBe(cents);
    }
  });

  it("amounts in ZAR cents never lose precision through integer arithmetic", () => {
    // Simulate a multi-line claim total
    const amounts = [52000, 6500, 35000, 12000, 18000];
    const total = amounts.reduce((sum, a) => sum + a, 0);
    expect(total).toBe(123500);
    // No floating point issues — all integer arithmetic
    expect(Number.isInteger(total)).toBe(true);
  });
});

describe("VAT Calculation (15% SA Rate)", () => {
  it("EDIFACT includes correct VAT at 15%", () => {
    const edifact = generateEDIFACT(baseClaim);
    // For R520.00 (52000 cents), VAT = 15% = R78.00 (7800 cents)
    expect(edifact).toContain("TAX+7+VAT");
    expect(edifact).toContain("7800");
  });

  it("VAT calculated correctly for various amounts", () => {
    const testCases = [
      { amount: 52000, expectedVat: 7800 },
      { amount: 100000, expectedVat: 15000 },
      { amount: 6500, expectedVat: 975 },
    ];

    for (const { amount, expectedVat } of testCases) {
      const claim = {
        ...baseClaim,
        lineItems: [{ ...baseClaim.lineItems[0], amount }],
      };
      const edifact = generateEDIFACT(claim);
      expect(edifact).toContain(String(expectedVat));
    }
  });
});

describe("EDIFACT Amount Precision", () => {
  it("amounts use integer representation (implied 2 decimal places)", () => {
    const edifact = generateEDIFACT(baseClaim);
    // MOA segment should contain the integer amount
    expect(edifact).toContain("MOA+203:52000");
  });

  it("amounts preserved through generate -> parse round-trip", () => {
    const claim = {
      ...baseClaim,
      lineItems: [
        { icd10Code: "J06.9", cptCode: "0190", description: "Consult", quantity: 1, amount: 52000 },
        { icd10Code: "E78.5", cptCode: "0382", description: "Blood test", quantity: 1, amount: 6500 },
      ],
    };
    const edifact = generateEDIFACT(claim);
    const parsed = parseEDIFACT(edifact);
    expect(parsed.lineItems[0].amount).toBe(52000);
    expect(parsed.lineItems[1].amount).toBe(6500);
  });

  it("quantity multiplied amounts are correct", () => {
    const claim = {
      ...baseClaim,
      lineItems: [
        { icd10Code: "J06.9", cptCode: "1101", description: "IM injection", quantity: 3, amount: 12000 },
      ],
    };
    const edifact = generateEDIFACT(claim);
    // EDIFACT MOA contains total amount (quantity * unit price = 36000)
    expect(edifact).toContain("MOA+203:36000");
  });
});

describe("Batch Financial Totals", () => {
  it("totalApproved equals sum of individual approvals", () => {
    const job: BatchJob = {
      id: "BATCH-test",
      practiceId: "p-001",
      claimIds: ["c-0", "c-1", "c-2"],
      totalClaims: 3,
      processedClaims: 3,
      successfulClaims: 3,
      failedClaims: 0,
      switchProvider: "healthbridge",
      protocol: "xml",
      status: "completed",
      results: [
        { claimId: "claim-0", status: "success", approvedAmount: 52000, processedAt: "2026-03-20T10:00:10Z" },
        { claimId: "claim-1", status: "success", approvedAmount: 35000, processedAt: "2026-03-20T10:00:20Z" },
        { claimId: "claim-2", status: "success", approvedAmount: 6500, processedAt: "2026-03-20T10:00:30Z" },
      ],
      queuedAt: "2026-03-20T10:00:00Z",
      startedAt: "2026-03-20T10:00:05Z",
      completedAt: "2026-03-20T10:00:35Z",
      retryCount: 0,
      maxRetries: 3,
    };
    const summary = getBatchSummary(job);
    expect(summary.totalApproved).toBe(52000 + 35000 + 6500);
    expect(summary.totalApproved).toBe(93500);
  });

  it("failed claims do not contribute to totalApproved", () => {
    const job: BatchJob = {
      id: "BATCH-test",
      practiceId: "p-001",
      claimIds: ["c-0", "c-1"],
      totalClaims: 2,
      processedClaims: 2,
      successfulClaims: 1,
      failedClaims: 1,
      switchProvider: "healthbridge",
      protocol: "xml",
      status: "partial",
      results: [
        { claimId: "claim-0", status: "success", approvedAmount: 52000, processedAt: "2026-03-20T10:00:10Z" },
        { claimId: "claim-1", status: "failed", errorMessage: "Timeout", processedAt: "2026-03-20T10:00:20Z" },
      ],
      queuedAt: "2026-03-20T10:00:00Z",
      startedAt: "2026-03-20T10:00:05Z",
      completedAt: "2026-03-20T10:00:25Z",
      retryCount: 0,
      maxRetries: 3,
    };
    const summary = getBatchSummary(job);
    expect(summary.totalApproved).toBe(52000);
  });
});

describe("eRA Reconciliation Financial Accuracy", () => {
  it("variance calculation is correct (claimed - paid)", () => {
    const era = parseERAXml(`<RemittanceAdvice>
      <RemittanceRef>ERA-TEST</RemittanceRef>
      <SchemeName>Test</SchemeName>
      <Payment>
        <ClaimRef>HB-001</ClaimRef>
        <MembershipNumber>900012345</MembershipNumber>
        <DependentCode>00</DependentCode>
        <PatientName>Test</PatientName>
        <DateOfService>2026-03-15</DateOfService>
        <TariffCode>0190</TariffCode>
        <ClaimedAmount>95000</ClaimedAmount>
        <ApprovedAmount>85000</ApprovedAmount>
        <PaidAmount>85000</PaidAmount>
      </Payment>
    </RemittanceAdvice>`);
    expect(era.totalClaimed).toBe(95000);
    expect(era.totalPaid).toBe(85000);
    // Variance = claimed - paid = 10000 (R100)
    expect(era.totalClaimed - era.totalPaid).toBe(10000);
  });

  it("dispute threshold is exactly R50 (5000 cents)", () => {
    // Shortfall of R49.99 (4999 cents) should NOT generate dispute
    const smallERA = parseERAXml(`<RemittanceAdvice>
      <RemittanceRef>ERA-SMALL</RemittanceRef>
      <SchemeName>Test</SchemeName>
      <Payment>
        <ClaimRef>HB-SMALL</ClaimRef>
        <MembershipNumber>999</MembershipNumber>
        <DependentCode>00</DependentCode>
        <PatientName>Test</PatientName>
        <DateOfService>2026-03-15</DateOfService>
        <TariffCode>0190</TariffCode>
        <ClaimedAmount>10000</ClaimedAmount>
        <PaidAmount>5001</PaidAmount>
      </Payment>
    </RemittanceAdvice>`);
    const claims = [
      { id: "c-1", transactionRef: "HB-SMALL", invoiceId: "inv-1", membershipNumber: "999", dateOfService: "2026-03-15", claimedAmount: 10000, status: "submitted" },
    ];
    const recon = reconcileERA(smallERA, claims);
    const disputes = generateDisputes(recon, "Test");
    // 10000 - 5001 = 4999 cents = R49.99 — below R50 threshold
    expect(disputes).toHaveLength(0);

    // Shortfall of exactly R50 (5000 cents) SHOULD generate dispute
    const exactERA = parseERAXml(`<RemittanceAdvice>
      <RemittanceRef>ERA-EXACT</RemittanceRef>
      <SchemeName>Test</SchemeName>
      <Payment>
        <ClaimRef>HB-EXACT</ClaimRef>
        <MembershipNumber>888</MembershipNumber>
        <DependentCode>00</DependentCode>
        <PatientName>Test</PatientName>
        <DateOfService>2026-03-15</DateOfService>
        <TariffCode>0190</TariffCode>
        <ClaimedAmount>10000</ClaimedAmount>
        <PaidAmount>5000</PaidAmount>
      </Payment>
    </RemittanceAdvice>`);
    const claims2 = [
      { id: "c-2", transactionRef: "HB-EXACT", invoiceId: "inv-2", membershipNumber: "888", dateOfService: "2026-03-15", claimedAmount: 10000, status: "submitted" },
    ];
    const recon2 = reconcileERA(exactERA, claims2);
    const disputes2 = generateDisputes(recon2, "Test");
    expect(disputes2).toHaveLength(1);
    expect(disputes2[0].shortfall).toBe(5000);
  });
});

describe("Pre-Auth Cost Threshold", () => {
  it("high-cost threshold is exactly R5,000 (500000 cents)", () => {
    // R4,999 should not trigger high_cost
    const below = checkPreAuthRequired({
      cptCodes: ["0199"],
      icd10Codes: ["J06.9"],
      scheme: "Discovery Health",
      estimatedCost: 499900,
    });
    expect(below.categories || []).not.toContain("high_cost");

    // R5,001 should trigger high_cost
    const above = checkPreAuthRequired({
      cptCodes: ["0199"],
      icd10Codes: ["J06.9"],
      scheme: "Discovery Health",
      estimatedCost: 500100,
    });
    expect(above.required).toBe(true);
    expect(above.categories).toContain("high_cost");
  });
});
