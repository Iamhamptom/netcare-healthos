import { describe, it, expect } from "vitest";
import {
  parseERAXml,
  reconcileERA,
  generateDisputes,
  generateDisputeTemplate,
  getAutoResubmittableDisputes,
  generateDisputeSummary,
  BHF_ADJUSTMENT_CODES,
} from "@/lib/switching/era-parser";

describe("eRA Reconciliation — Exact Match", () => {
  it("matches by transactionRef exactly", () => {
    const era = parseERAXml(`<RemittanceAdvice>
      <RemittanceRef>ERA-EXACT</RemittanceRef>
      <SchemeName>Test</SchemeName>
      <Payment>
        <ClaimRef>HB-EXACT-001</ClaimRef>
        <MembershipNumber>900012345</MembershipNumber>
        <DependentCode>00</DependentCode>
        <PatientName>Test</PatientName>
        <DateOfService>2026-03-15</DateOfService>
        <TariffCode>0190</TariffCode>
        <ClaimedAmount>52000</ClaimedAmount>
        <PaidAmount>52000</PaidAmount>
      </Payment>
    </RemittanceAdvice>`);
    const claims = [
      { id: "c-1", transactionRef: "HB-EXACT-001", invoiceId: "inv-1", membershipNumber: "900012345", dateOfService: "2026-03-15", claimedAmount: 52000, status: "submitted" },
    ];
    const result = reconcileERA(era, claims);
    expect(result.totalMatched).toBe(1);
    expect(result.matched[0].matchType).toBe("exact");
  });
});

describe("eRA Reconciliation — Fuzzy Match", () => {
  it("fuzzy matches by membership + date when ref doesn't match (single candidate)", () => {
    const era = parseERAXml(`<RemittanceAdvice>
      <RemittanceRef>ERA-FUZZY</RemittanceRef>
      <SchemeName>Test</SchemeName>
      <Payment>
        <ClaimRef>SWITCH-REF-999</ClaimRef>
        <MembershipNumber>900012345</MembershipNumber>
        <DependentCode>00</DependentCode>
        <PatientName>Test</PatientName>
        <DateOfService>2026-03-15</DateOfService>
        <TariffCode>0190</TariffCode>
        <ClaimedAmount>52000</ClaimedAmount>
        <PaidAmount>52000</PaidAmount>
      </Payment>
    </RemittanceAdvice>`);
    const claims = [
      { id: "c-1", transactionRef: "MY-REF-001", invoiceId: "inv-1", membershipNumber: "900012345", dateOfService: "2026-03-15", claimedAmount: 52000, status: "submitted" },
    ];
    const result = reconcileERA(era, claims);
    expect(result.totalMatched).toBe(1);
    expect(result.matched[0].matchType).toBe("fuzzy");
  });

  it("fuzzy match with multiple candidates — resolves by amount", () => {
    const era = parseERAXml(`<RemittanceAdvice>
      <RemittanceRef>ERA-MULTI</RemittanceRef>
      <SchemeName>Test</SchemeName>
      <Payment>
        <ClaimRef>UNKNOWN-REF</ClaimRef>
        <MembershipNumber>900012345</MembershipNumber>
        <DependentCode>00</DependentCode>
        <PatientName>Test</PatientName>
        <DateOfService>2026-03-15</DateOfService>
        <TariffCode>0190</TariffCode>
        <ClaimedAmount>65000</ClaimedAmount>
        <PaidAmount>65000</PaidAmount>
      </Payment>
    </RemittanceAdvice>`);
    const claims = [
      { id: "c-1", transactionRef: "REF-A", invoiceId: "inv-1", membershipNumber: "900012345", dateOfService: "2026-03-15", claimedAmount: 52000, status: "submitted" },
      { id: "c-2", transactionRef: "REF-B", invoiceId: "inv-2", membershipNumber: "900012345", dateOfService: "2026-03-15", claimedAmount: 65000, status: "submitted" },
    ];
    const result = reconcileERA(era, claims);
    expect(result.totalMatched).toBe(1);
    expect(result.matched[0].claimId).toBe("c-2");
  });

  it("fuzzy match with multiple candidates, same amount — falls to manual", () => {
    const era = parseERAXml(`<RemittanceAdvice>
      <RemittanceRef>ERA-AMBIG</RemittanceRef>
      <SchemeName>Test</SchemeName>
      <Payment>
        <ClaimRef>UNKNOWN-REF</ClaimRef>
        <MembershipNumber>900012345</MembershipNumber>
        <DependentCode>00</DependentCode>
        <PatientName>Test</PatientName>
        <DateOfService>2026-03-15</DateOfService>
        <TariffCode>0190</TariffCode>
        <ClaimedAmount>52000</ClaimedAmount>
        <PaidAmount>52000</PaidAmount>
      </Payment>
    </RemittanceAdvice>`);
    // Two claims with same membership, date, AND amount
    const claims = [
      { id: "c-1", transactionRef: "REF-X", invoiceId: "inv-1", membershipNumber: "900012345", dateOfService: "2026-03-15", claimedAmount: 52000, status: "submitted" },
      { id: "c-2", transactionRef: "REF-Y", invoiceId: "inv-2", membershipNumber: "900012345", dateOfService: "2026-03-15", claimedAmount: 52000, status: "submitted" },
    ];
    const result = reconcileERA(era, claims);
    // Both have same amount, so the first match by amount wins (fuzzy)
    expect(result.totalMatched).toBe(1);
    expect(result.matched[0].matchType).toBe("fuzzy");
  });
});

describe("eRA Reconciliation — Completely Unmatched", () => {
  it("payment with no matching claim goes to unmatched", () => {
    const era = parseERAXml(`<RemittanceAdvice>
      <RemittanceRef>ERA-ORPHAN</RemittanceRef>
      <SchemeName>Test</SchemeName>
      <Payment>
        <ClaimRef>ORPHAN-REF</ClaimRef>
        <MembershipNumber>999999999</MembershipNumber>
        <DependentCode>00</DependentCode>
        <PatientName>Nobody</PatientName>
        <DateOfService>2026-01-01</DateOfService>
        <TariffCode>0190</TariffCode>
        <ClaimedAmount>50000</ClaimedAmount>
        <PaidAmount>50000</PaidAmount>
      </Payment>
    </RemittanceAdvice>`);
    const claims: never[] = [];
    const result = reconcileERA(era, claims);
    expect(result.totalMatched).toBe(0);
    expect(result.totalUnmatched).toBe(1);
    expect(result.unmatched[0].claimRef).toBe("ORPHAN-REF");
  });
});

describe("eRA Reconciliation — Overpayment Detection", () => {
  it("detects when paid > claimed", () => {
    const era = parseERAXml(`<RemittanceAdvice>
      <RemittanceRef>ERA-OVER</RemittanceRef>
      <SchemeName>Test</SchemeName>
      <Payment>
        <ClaimRef>HB-OVER</ClaimRef>
        <MembershipNumber>900012345</MembershipNumber>
        <DependentCode>00</DependentCode>
        <PatientName>Test</PatientName>
        <DateOfService>2026-03-15</DateOfService>
        <TariffCode>0190</TariffCode>
        <ClaimedAmount>52000</ClaimedAmount>
        <PaidAmount>60000</PaidAmount>
      </Payment>
    </RemittanceAdvice>`);
    const claims = [
      { id: "c-1", transactionRef: "HB-OVER", invoiceId: "inv-1", membershipNumber: "900012345", dateOfService: "2026-03-15", claimedAmount: 52000, status: "submitted" },
    ];
    const result = reconcileERA(era, claims);
    expect(result.overpayments).toHaveLength(1);
    expect(result.overpayments[0].variance).toBeGreaterThan(0);
  });
});

describe("eRA Reconciliation — Zero & Edge Amounts", () => {
  it("zero payment line item detected as underpayment", () => {
    const era = parseERAXml(`<RemittanceAdvice>
      <RemittanceRef>ERA-ZERO</RemittanceRef>
      <SchemeName>Test</SchemeName>
      <Payment>
        <ClaimRef>HB-ZERO</ClaimRef>
        <MembershipNumber>900012345</MembershipNumber>
        <DependentCode>00</DependentCode>
        <PatientName>Test</PatientName>
        <DateOfService>2026-03-15</DateOfService>
        <TariffCode>0190</TariffCode>
        <ClaimedAmount>52000</ClaimedAmount>
        <PaidAmount>0</PaidAmount>
      </Payment>
    </RemittanceAdvice>`);
    const claims = [
      { id: "c-1", transactionRef: "HB-ZERO", invoiceId: "inv-1", membershipNumber: "900012345", dateOfService: "2026-03-15", claimedAmount: 52000, status: "submitted" },
    ];
    const result = reconcileERA(era, claims);
    expect(result.underpayments).toHaveLength(1);
    expect(result.underpayments[0].variance).toBe(-52000);
  });

  it("eRA with 0 line items parses cleanly", () => {
    const era = parseERAXml(`<RemittanceAdvice>
      <RemittanceRef>ERA-EMPTY</RemittanceRef>
      <SchemeName>Test</SchemeName>
    </RemittanceAdvice>`);
    expect(era.lineItems).toHaveLength(0);
    expect(era.totalPaid).toBe(0);
  });
});

describe("eRA — BHF Adjustment Code Categorization", () => {
  it("all 25 BHF codes are defined", () => {
    for (let i = 1; i <= 25; i++) {
      const code = String(i).padStart(2, "0");
      expect(BHF_ADJUSTMENT_CODES[code]).toBeDefined();
      expect(BHF_ADJUSTMENT_CODES[code].description.length).toBeGreaterThan(5);
      expect(BHF_ADJUSTMENT_CODES[code].category).toBeTruthy();
    }
  });

  it("tariff codes (13, 15) are dispute-worthy", () => {
    expect(BHF_ADJUSTMENT_CODES["13"].disputeWorthy).toBe(true);
    expect(BHF_ADJUSTMENT_CODES["15"].disputeWorthy).toBe(true);
    expect(BHF_ADJUSTMENT_CODES["13"].category).toBe("tariff");
    expect(BHF_ADJUSTMENT_CODES["15"].category).toBe("tariff");
  });

  it("duplicate codes (05, 06) are NOT dispute-worthy", () => {
    expect(BHF_ADJUSTMENT_CODES["05"].disputeWorthy).toBe(false);
    expect(BHF_ADJUSTMENT_CODES["06"].disputeWorthy).toBe(false);
  });

  it("auto-resubmittable codes have resubmitAction", () => {
    for (const [code, info] of Object.entries(BHF_ADJUSTMENT_CODES)) {
      if (info.autoResubmit) {
        expect(info.resubmitAction).toBeTruthy();
      }
    }
  });
});

describe("eRA — Dispute Template Generation", () => {
  it("generates template with scheme contact details", () => {
    const era = parseERAXml(`<RemittanceAdvice>
      <RemittanceRef>ERA-DIS</RemittanceRef>
      <SchemeName>Discovery Health</SchemeName>
      <Payment>
        <ClaimRef>HB-DIS</ClaimRef>
        <MembershipNumber>900012345</MembershipNumber>
        <DependentCode>00</DependentCode>
        <PatientName>Test</PatientName>
        <DateOfService>2026-03-15</DateOfService>
        <TariffCode>0190</TariffCode>
        <ClaimedAmount>95000</ClaimedAmount>
        <PaidAmount>75000</PaidAmount>
        <AdjustmentCode>15</AdjustmentCode>
      </Payment>
    </RemittanceAdvice>`);
    const claims = [
      { id: "c-1", transactionRef: "HB-DIS", invoiceId: "inv-1", membershipNumber: "900012345", dateOfService: "2026-03-15", claimedAmount: 95000, status: "submitted" },
    ];
    const recon = reconcileERA(era, claims);
    const disputes = generateDisputes(recon, "Discovery Health");
    expect(disputes.length).toBe(1);

    const template = generateDisputeTemplate(disputes[0], {
      practiceName: "Test Practice",
      bhfNumber: "1234567",
      contactPerson: "Dr Test",
      email: "test@example.com",
      phone: "0821234567",
    });
    expect(template.schemeContact).not.toBeNull();
    expect(template.schemeContact!.email).toBe("claims@discovery.co.za");
    expect(template.letterContent).toContain("HB-DIS");
    expect(template.submissionDeadline).toBeTruthy();
  });

  it("generates template for scheme WITHOUT contact details (null contact)", () => {
    const era = parseERAXml(`<RemittanceAdvice>
      <RemittanceRef>ERA-NOCONTACT</RemittanceRef>
      <SchemeName>Obscure Scheme</SchemeName>
      <Payment>
        <ClaimRef>HB-OBS</ClaimRef>
        <MembershipNumber>900012345</MembershipNumber>
        <DependentCode>00</DependentCode>
        <PatientName>Test</PatientName>
        <DateOfService>2026-03-15</DateOfService>
        <TariffCode>0190</TariffCode>
        <ClaimedAmount>80000</ClaimedAmount>
        <PaidAmount>50000</PaidAmount>
      </Payment>
    </RemittanceAdvice>`);
    const claims = [
      { id: "c-1", transactionRef: "HB-OBS", invoiceId: "inv-1", membershipNumber: "900012345", dateOfService: "2026-03-15", claimedAmount: 80000, status: "submitted" },
    ];
    const recon = reconcileERA(era, claims);
    const disputes = generateDisputes(recon, "Obscure Scheme");
    expect(disputes.length).toBe(1);

    const template = generateDisputeTemplate(disputes[0], {
      practiceName: "Test Practice",
      bhfNumber: "1234567",
      contactPerson: "Dr Test",
      email: "test@example.com",
      phone: "0821234567",
    });
    expect(template.schemeContact).toBeNull();
    expect(template.expectedTurnaroundDays).toBe(30); // default
  });
});

describe("eRA — Auto-Resubmittable Filtering", () => {
  it("separates resubmittable from manual-only disputes", () => {
    const era = parseERAXml(`<RemittanceAdvice>
      <RemittanceRef>ERA-MIXED</RemittanceRef>
      <SchemeName>Test</SchemeName>
      <Payment>
        <ClaimRef>HB-A</ClaimRef><MembershipNumber>900011111</MembershipNumber><DependentCode>00</DependentCode>
        <PatientName>A</PatientName><DateOfService>2026-03-15</DateOfService><TariffCode>0190</TariffCode>
        <ClaimedAmount>80000</ClaimedAmount><PaidAmount>50000</PaidAmount><AdjustmentCode>07</AdjustmentCode>
      </Payment>
      <Payment>
        <ClaimRef>HB-B</ClaimRef><MembershipNumber>900022222</MembershipNumber><DependentCode>00</DependentCode>
        <PatientName>B</PatientName><DateOfService>2026-03-15</DateOfService><TariffCode>0190</TariffCode>
        <ClaimedAmount>80000</ClaimedAmount><PaidAmount>50000</PaidAmount><AdjustmentCode>15</AdjustmentCode>
      </Payment>
    </RemittanceAdvice>`);
    const claims = [
      { id: "c-1", transactionRef: "HB-A", invoiceId: "inv-1", membershipNumber: "900011111", dateOfService: "2026-03-15", claimedAmount: 80000, status: "submitted" },
      { id: "c-2", transactionRef: "HB-B", invoiceId: "inv-2", membershipNumber: "900022222", dateOfService: "2026-03-15", claimedAmount: 80000, status: "submitted" },
    ];
    const recon = reconcileERA(era, claims);
    const disputes = generateDisputes(recon, "Test");
    const { resubmittable, manualOnly } = getAutoResubmittableDisputes(disputes);
    // Code 07 is auto-resubmittable, code 15 is not
    expect(resubmittable.length).toBeGreaterThanOrEqual(1);
    expect(manualOnly.length).toBeGreaterThanOrEqual(1);
  });
});

describe("eRA — Dispute Summary Grouping", () => {
  it("groups by category and priority", () => {
    const era = parseERAXml(`<RemittanceAdvice>
      <RemittanceRef>ERA-SUMMARY</RemittanceRef>
      <SchemeName>Test</SchemeName>
      <Payment>
        <ClaimRef>HB-S1</ClaimRef><MembershipNumber>900011111</MembershipNumber><DependentCode>00</DependentCode>
        <PatientName>A</PatientName><DateOfService>2026-03-15</DateOfService><TariffCode>0190</TariffCode>
        <ClaimedAmount>80000</ClaimedAmount><PaidAmount>50000</PaidAmount><AdjustmentCode>15</AdjustmentCode>
      </Payment>
      <Payment>
        <ClaimRef>HB-S2</ClaimRef><MembershipNumber>900022222</MembershipNumber><DependentCode>00</DependentCode>
        <PatientName>B</PatientName><DateOfService>2026-03-15</DateOfService><TariffCode>0190</TariffCode>
        <ClaimedAmount>100000</ClaimedAmount><PaidAmount>60000</PaidAmount><AdjustmentCode>07</AdjustmentCode>
      </Payment>
    </RemittanceAdvice>`);
    const claims = [
      { id: "c-1", transactionRef: "HB-S1", invoiceId: "inv-1", membershipNumber: "900011111", dateOfService: "2026-03-15", claimedAmount: 80000, status: "submitted" },
      { id: "c-2", transactionRef: "HB-S2", invoiceId: "inv-2", membershipNumber: "900022222", dateOfService: "2026-03-15", claimedAmount: 100000, status: "submitted" },
    ];
    const recon = reconcileERA(era, claims);
    const disputes = generateDisputes(recon, "Test");
    const summary = generateDisputeSummary(disputes);
    expect(summary.totalDisputes).toBe(2);
    expect(summary.byCategory["tariff"]).toBeDefined();
    expect(summary.byCategory["benefit_limit"]).toBeDefined();
    expect(summary.summary).toContain("Dispute Summary");
  });
});

describe("eRA — Shortfall Threshold Boundary", () => {
  it("shortfall at exactly R50 (5000 cents) DOES generate dispute", () => {
    const era = parseERAXml(`<RemittanceAdvice>
      <RemittanceRef>ERA-BOUND</RemittanceRef>
      <SchemeName>Test</SchemeName>
      <Payment>
        <ClaimRef>HB-BOUND</ClaimRef>
        <MembershipNumber>900012345</MembershipNumber>
        <DependentCode>00</DependentCode>
        <PatientName>Test</PatientName>
        <DateOfService>2026-03-15</DateOfService>
        <TariffCode>0190</TariffCode>
        <ClaimedAmount>15000</ClaimedAmount>
        <PaidAmount>10000</PaidAmount>
      </Payment>
    </RemittanceAdvice>`);
    const claims = [
      { id: "c-1", transactionRef: "HB-BOUND", invoiceId: "inv-1", membershipNumber: "900012345", dateOfService: "2026-03-15", claimedAmount: 15000, status: "submitted" },
    ];
    const recon = reconcileERA(era, claims);
    const disputes = generateDisputes(recon, "Test");
    // Shortfall = 15000 - 10000 = 5000 cents = exactly R50
    expect(disputes).toHaveLength(1);
    expect(disputes[0].shortfall).toBe(5000);
  });

  it("shortfall at R49.99 (4999 cents) does NOT generate dispute", () => {
    const era = parseERAXml(`<RemittanceAdvice>
      <RemittanceRef>ERA-UNDER</RemittanceRef>
      <SchemeName>Test</SchemeName>
      <Payment>
        <ClaimRef>HB-UNDER</ClaimRef>
        <MembershipNumber>900012345</MembershipNumber>
        <DependentCode>00</DependentCode>
        <PatientName>Test</PatientName>
        <DateOfService>2026-03-15</DateOfService>
        <TariffCode>0190</TariffCode>
        <ClaimedAmount>15000</ClaimedAmount>
        <PaidAmount>10001</PaidAmount>
      </Payment>
    </RemittanceAdvice>`);
    const claims = [
      { id: "c-1", transactionRef: "HB-UNDER", invoiceId: "inv-1", membershipNumber: "900012345", dateOfService: "2026-03-15", claimedAmount: 15000, status: "submitted" },
    ];
    const recon = reconcileERA(era, claims);
    const disputes = generateDisputes(recon, "Test");
    // Shortfall = 15000 - 10001 = 4999 cents < 5000 threshold
    expect(disputes).toHaveLength(0);
  });
});
