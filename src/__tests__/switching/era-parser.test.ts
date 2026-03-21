import { describe, it, expect } from "vitest";
import {
  parseERAXml,
  reconcileERA,
  generateDisputes,
} from "@/lib/switching/era-parser";

describe("eRA Parser", () => {
  const sampleERA = `<?xml version="1.0"?>
<RemittanceAdvice>
  <RemittanceRef>ERA-DH-20260320</RemittanceRef>
  <SchemeName>Discovery Health</SchemeName>
  <Administrator>Discovery Health (Pty) Ltd</Administrator>
  <PaymentDate>2026-03-20</PaymentDate>
  <PaymentMethod>EFT</PaymentMethod>
  <TotalAmount>145000</TotalAmount>
  <Payment>
    <ClaimRef>HB-001</ClaimRef>
    <MembershipNumber>900012345</MembershipNumber>
    <DependentCode>00</DependentCode>
    <PatientName>John Mokoena</PatientName>
    <DateOfService>2026-03-15</DateOfService>
    <TariffCode>0190</TariffCode>
    <ClaimedAmount>52000</ClaimedAmount>
    <ApprovedAmount>52000</ApprovedAmount>
    <PaidAmount>52000</PaidAmount>
  </Payment>
  <Payment>
    <ClaimRef>HB-002</ClaimRef>
    <MembershipNumber>900067890</MembershipNumber>
    <DependentCode>00</DependentCode>
    <PatientName>Priya Naidoo</PatientName>
    <DateOfService>2026-03-15</DateOfService>
    <TariffCode>0190</TariffCode>
    <ClaimedAmount>95000</ClaimedAmount>
    <ApprovedAmount>85000</ApprovedAmount>
    <PaidAmount>85000</PaidAmount>
    <AdjustmentCode>15</AdjustmentCode>
    <AdjustmentReason>Paid at scheme tariff rate</AdjustmentReason>
  </Payment>
</RemittanceAdvice>`;

  describe("XML Parsing", () => {
    it("parses eRA header fields", () => {
      const era = parseERAXml(sampleERA);
      expect(era.remittanceRef).toBe("ERA-DH-20260320");
      expect(era.scheme).toBe("Discovery Health");
      expect(era.administrator).toBe("Discovery Health (Pty) Ltd");
      expect(era.paymentDate).toBe("2026-03-20");
      expect(era.paymentMethod).toBe("EFT");
    });

    it("parses payment line items", () => {
      const era = parseERAXml(sampleERA);
      expect(era.lineItems.length).toBe(2);
      expect(era.lineItems[0].claimRef).toBe("HB-001");
      expect(era.lineItems[0].paidAmount).toBe(52000);
      expect(era.lineItems[1].adjustmentCode).toBe("15");
    });

    it("calculates totals correctly", () => {
      const era = parseERAXml(sampleERA);
      expect(era.totalClaimed).toBe(147000); // 52000 + 95000
      expect(era.totalPaid).toBe(137000); // 52000 + 85000
    });

    it("handles empty XML gracefully", () => {
      const era = parseERAXml("<RemittanceAdvice></RemittanceAdvice>");
      expect(era.lineItems.length).toBe(0);
      expect(era.reconciliationStatus).toBe("pending");
    });
  });

  describe("Reconciliation", () => {
    it("matches by transaction reference", () => {
      const era = parseERAXml(sampleERA);
      const claims = [
        { id: "c-1", transactionRef: "HB-001", invoiceId: "inv-1", membershipNumber: "900012345", dateOfService: "2026-03-15", claimedAmount: 52000, status: "submitted" },
        { id: "c-2", transactionRef: "HB-002", invoiceId: "inv-2", membershipNumber: "900067890", dateOfService: "2026-03-15", claimedAmount: 95000, status: "submitted" },
      ];
      const result = reconcileERA(era, claims);
      expect(result.totalMatched).toBe(2);
      expect(result.totalUnmatched).toBe(0);
    });

    it("detects underpayments", () => {
      const era = parseERAXml(sampleERA);
      const claims = [
        { id: "c-1", transactionRef: "HB-001", invoiceId: "inv-1", membershipNumber: "900012345", dateOfService: "2026-03-15", claimedAmount: 52000, status: "submitted" },
        { id: "c-2", transactionRef: "HB-002", invoiceId: "inv-2", membershipNumber: "900067890", dateOfService: "2026-03-15", claimedAmount: 95000, status: "submitted" },
      ];
      const result = reconcileERA(era, claims);
      expect(result.underpayments.length).toBe(1);
      expect(result.underpayments[0].eraLine.claimRef).toBe("HB-002");
    });

    it("reports unmatched payments", () => {
      const era = parseERAXml(sampleERA);
      const claims = [
        { id: "c-1", transactionRef: "HB-001", invoiceId: "inv-1", membershipNumber: "900012345", dateOfService: "2026-03-15", claimedAmount: 52000, status: "submitted" },
      ];
      const result = reconcileERA(era, claims);
      expect(result.totalMatched).toBe(1);
      expect(result.totalUnmatched).toBe(1);
    });

    it("falls back to fuzzy matching by membership + date", () => {
      const era = parseERAXml(sampleERA);
      const claims = [
        { id: "c-1", transactionRef: "DIFFERENT-REF", invoiceId: "inv-1", membershipNumber: "900012345", dateOfService: "2026-03-15", claimedAmount: 52000, status: "submitted" },
      ];
      const result = reconcileERA(era, claims);
      expect(result.totalMatched).toBe(1);
      expect(result.matched[0].matchType).toBe("fuzzy");
    });
  });

  describe("Dispute Generation", () => {
    it("generates disputes for underpaid claims above threshold", () => {
      const era = parseERAXml(sampleERA);
      const claims = [
        { id: "c-1", transactionRef: "HB-001", invoiceId: "inv-1", membershipNumber: "900012345", dateOfService: "2026-03-15", claimedAmount: 52000, status: "submitted" },
        { id: "c-2", transactionRef: "HB-002", invoiceId: "inv-2", membershipNumber: "900067890", dateOfService: "2026-03-15", claimedAmount: 95000, status: "submitted" },
      ];
      const recon = reconcileERA(era, claims);
      const disputes = generateDisputes(recon, "Discovery Health");
      expect(disputes.length).toBeGreaterThanOrEqual(1);
      expect(disputes[0].scheme).toBe("Discovery Health");
      expect(disputes[0].shortfall).toBe(10000); // 95000 - 85000
    });

    it("categorizes disputes by BHF adjustment code", () => {
      const era = parseERAXml(sampleERA);
      const claims = [
        { id: "c-1", transactionRef: "HB-001", invoiceId: "inv-1", membershipNumber: "900012345", dateOfService: "2026-03-15", claimedAmount: 52000, status: "submitted" },
        { id: "c-2", transactionRef: "HB-002", invoiceId: "inv-2", membershipNumber: "900067890", dateOfService: "2026-03-15", claimedAmount: 95000, status: "submitted" },
      ];
      const recon = reconcileERA(era, claims);
      const disputes = generateDisputes(recon, "Discovery Health");
      const tariffDispute = disputes.find(d => d.adjustmentCode === "15");
      expect(tariffDispute?.category).toBe("tariff");
    });

    it("skips shortfalls below R50 threshold", () => {
      const smallERA = `<RemittanceAdvice>
        <RemittanceRef>ERA-SMALL</RemittanceRef>
        <SchemeName>Test</SchemeName>
        <Payment>
          <ClaimRef>HB-SMALL</ClaimRef>
          <MembershipNumber>999</MembershipNumber>
          <DependentCode>00</DependentCode>
          <PatientName>Test</PatientName>
          <DateOfService>2026-03-15</DateOfService>
          <TariffCode>0190</TariffCode>
          <ClaimedAmount>5200</ClaimedAmount>
          <PaidAmount>5000</PaidAmount>
        </Payment>
      </RemittanceAdvice>`;
      const era = parseERAXml(smallERA);
      const claims = [
        { id: "c-s", transactionRef: "HB-SMALL", invoiceId: "inv-s", membershipNumber: "999", dateOfService: "2026-03-15", claimedAmount: 5200, status: "submitted" },
      ];
      const recon = reconcileERA(era, claims);
      const disputes = generateDisputes(recon, "Test");
      expect(disputes.length).toBe(0); // R2 shortfall < R50 threshold
    });
  });
});
