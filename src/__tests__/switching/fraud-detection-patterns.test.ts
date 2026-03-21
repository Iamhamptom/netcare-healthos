// Fraud, Waste & Abuse Detection Tests — R22-28B annual problem
// Grounded in: 07_fraud_detection.md — 8 fraud patterns + detection algorithms
// Tests: unbundling, upcoding, after-hours fraud, duplicates, time impossibility,
// phantom billing, prescription fraud, balance billing at DSP

import { describe, it, expect } from "vitest";
import { validateClaim } from "@/lib/healthbridge/validator";
import { analyzeRejection } from "@/lib/switching/resubmission";
import { BHF_ADJUSTMENT_CODES, generateDisputes, reconcileERA } from "@/lib/switching/era-parser";
import { formatZAR } from "@/lib/healthbridge/codes";
import {
  detectUnbundling,
  detectUpcoding,
  detectTimeImpossibility,
  detectAfterHoursFraud,
  detectPrescriptionFraud,
  detectBalanceBilling,
} from "@/lib/switching/fraud-engine";

const today = new Date().toISOString().slice(0, 10);

describe("Fraud, Waste & Abuse Detection", () => {
  // ── Pattern 1: Unbundling (10-15% of FWA) ──

  describe("Pattern 1: Unbundling Detection", () => {
    it("should detect duplicate ICD-10 codes (component billing indicator)", () => {
      // FBC billed as separate haemoglobin + WCC + platelet = unbundling
      // The validator flags duplicate ICD-10 which is an unbundling signal
      const result = validateClaim({
        patientName: "Fraud Test Patient",
        medicalAidScheme: "Discovery Health",
        membershipNumber: "DH9999888877",
        dependentCode: "00",
        dateOfService: today,
        placeOfService: "11",
        bhfNumber: "1234567",
        lineItems: [
          { icd10Code: "R70.0", cptCode: "4014", description: "FBC", quantity: 1, amount: 12000 },
          { icd10Code: "R70.0", cptCode: "4015", description: "Haemoglobin", quantity: 1, amount: 5000 },
          { icd10Code: "R70.0", cptCode: "4016", description: "WCC", quantity: 1, amount: 5000 },
        ],
      });
      // Duplicate ICD-10 = potential unbundling
      expect(result.issues.some(i => i.code === "DUPLICATE_ICD10")).toBe(true);
    });

    // GAP: No dedicated bundling rules engine — knowledge base specifies
    // "Flag component codes together on same date/patient" but there is no
    // bundling_rules table or FBC-component detection. The duplicate ICD-10
    // check provides a basic signal but not full unbundling detection.
    it("should flag laparoscopic cholecystectomy billed as separate components via fraud engine", () => {
      // Unbundling rule: components 3617, 3615, 3610, 3612, 3614 should be bundle 3600
      const flags = detectUnbundling(["3617", "3615", "3610"]);
      expect(flags.length).toBeGreaterThanOrEqual(1);
      expect(flags[0].type).toBe("unbundling");
      expect(flags[0].severity).toBe("high");
      expect(flags[0].description).toContain("cholecystectomy");
      // Single component should not trigger
      const noFlag = detectUnbundling(["3617"]);
      expect(noFlag.length).toBe(0);
    });
  });

  // ── Pattern 2: Upcoding (15-20% of FWA) ──

  describe("Pattern 2: Upcoding Detection", () => {
    // GAP: No peer comparison or distribution analysis implemented.
    // Knowledge base: ">70% at Level 3-4 when peer avg is 20-30% → flag"
    it("should flag provider with >70% Level 3-4 consultations via fraud engine", () => {
      // Need minimum 10 consultations; >70% at level 3-4 codes (0192, 0193, 0142, 0143)
      const codes = [
        "0192", "0193", "0192", "0193", "0142", "0143", "0192", "0193",  // 8 high-level
        "0190", "0191",  // 2 low-level → 80% high
      ];
      const flags = detectUpcoding(codes);
      expect(flags.length).toBeGreaterThanOrEqual(1);
      expect(flags[0].type).toBe("upcoding");
      expect(flags[0].severity).toBe("critical");
      expect(flags[0].description).toContain("80%");
    });

    it("should detect time impossibility: too many patients per day via fraud engine", () => {
      // 60 claims × 15min default = 15 hours → exceeds 14hr max
      const flags = detectTimeImpossibility({
        providerId: "PR12345",
        date: "2026-03-20",
        claimCount: 60,
      });
      expect(flags.length).toBeGreaterThanOrEqual(1);
      expect(flags[0].type).toBe("time_impossibility");
      expect(flags[0].severity).toBe("critical");
      expect(flags[0].description).toContain("60 claims");
      // Reasonable count should not flag
      const noFlag = detectTimeImpossibility({
        providerId: "PR12345",
        date: "2026-03-20",
        claimCount: 20,
      });
      expect(noFlag.length).toBe(0);
    });
  });

  // ── Pattern 3: After-Hours Fraud ──

  describe("Pattern 3: After-Hours Modifier Fraud", () => {
    // GAP: After-hours modifier validation (0010-0014) not implemented in validator
    it("should flag excessive after-hours modifier usage via fraud engine", () => {
      // >60% after-hours when peer avg is 15% → flag
      // Build 12 claims, 8 with after-hours modifier (67%)
      const claims = Array.from({ length: 12 }, (_, i) => ({
        modifiers: i < 8 ? ["0010"] : [],
        dateOfService: "2026-03-20",
      }));
      const flags = detectAfterHoursFraud(claims);
      expect(flags.length).toBeGreaterThanOrEqual(1);
      expect(flags[0].type).toBe("after_hours_fraud");
      expect(flags[0].severity).toBe("high");
      expect(flags[0].description).toContain("after-hours");
    });
  });

  // ── Pattern 4: Duplicate Billing (5-8% of FWA) ──

  describe("Pattern 4: Duplicate Billing", () => {
    it("should classify duplicate claim rejection (BHF code 05) correctly", () => {
      const bhfCode = BHF_ADJUSTMENT_CODES["05"];
      expect(bhfCode).toBeDefined();
      expect(bhfCode.category).toBe("duplicate");
      expect(bhfCode.disputeWorthy).toBe(false);
      expect(bhfCode.autoResubmit).toBe(false);
    });

    it("should classify duplicate rejection (code 09) as non-resubmittable", () => {
      const analysis = analyzeRejection("09");
      expect(analysis.category).toBe("duplicate");
      expect(analysis.resubmittable).toBe(false);
    });

    it("should detect duplicate ICD-10 in line items as potential double billing", () => {
      const result = validateClaim({
        patientName: "Duplicate Test",
        medicalAidScheme: "Bonitas",
        membershipNumber: "BON11223344",
        dependentCode: "00",
        dateOfService: today,
        placeOfService: "11",
        bhfNumber: "1234567",
        lineItems: [
          { icd10Code: "I10", cptCode: "0190", description: "Consult", quantity: 1, amount: 52000 },
          { icd10Code: "I10", cptCode: "0190", description: "Consult", quantity: 1, amount: 52000 },
        ],
      });
      expect(result.issues.some(i => i.code === "DUPLICATE_ICD10")).toBe(true);
    });
  });

  // ── Pattern 5: Phantom Billing (8-12%) ──

  describe("Pattern 5: Phantom Billing", () => {
    it("should reject claim with future date of service", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const result = validateClaim({
        patientName: "Phantom Test",
        medicalAidScheme: "GEMS",
        membershipNumber: "000099887",
        dependentCode: "00",
        dateOfService: futureDate.toISOString().slice(0, 10),
        placeOfService: "11",
        bhfNumber: "1234567",
        lineItems: [{ icd10Code: "J06.9", cptCode: "0190", description: "Consult", quantity: 1, amount: 52000 }],
      });
      expect(result.issues.some(i => i.code === "FUTURE_DOS")).toBe(true);
    });

    // GAP: No cross-ref with DHA death register or hospital admission dates
    it.skip("should flag claims for deceased patients (NOT IMPLEMENTED — needs DHA death register integration)", () => {
      // Knowledge base: Cross-ref DHA death register
    });
  });

  // ── Pattern 6: Prescription Fraud (8-10%) ──

  describe("Pattern 6: Prescription Fraud", () => {
    // GAP: No DDD analysis or pharmacy-hopping detection
    it("should flag >90 S5 tablets/month per patient via fraud engine", () => {
      const flags = detectPrescriptionFraud([
        { patientId: "PAT001", nappiCode: "1234567", schedule: "S5", quantity: 60, daysSupply: 30 },
        { patientId: "PAT001", nappiCode: "7654321", schedule: "S5", quantity: 40, daysSupply: 30 },
      ]);
      expect(flags.length).toBeGreaterThanOrEqual(1);
      expect(flags[0].type).toBe("prescription_fraud");
      expect(flags[0].severity).toBe("high");
      expect(flags[0].description).toContain("100");
      expect(flags[0].description).toContain("PAT001");
      // Below threshold should not flag
      const noFlag = detectPrescriptionFraud([
        { patientId: "PAT002", nappiCode: "1234567", schedule: "S5", quantity: 30, daysSupply: 30 },
      ]);
      expect(noFlag.length).toBe(0);
    });
  });

  // ── Pattern 7: Balance Billing at DSP (Illegal) ──

  describe("Pattern 7: Balance Billing at DSP (Illegal)", () => {
    it("should have PMB BHF adjustment code (16) classified correctly", () => {
      const bhfCode = BHF_ADJUSTMENT_CODES["16"];
      expect(bhfCode).toBeDefined();
      expect(bhfCode.category).toBe("pmb");
      expect(bhfCode.description).toContain("PMB");
    });

    // GAP: No DSP contract cross-referencing to detect balance billing
    it("should detect illegal balance billing at DSP for PMB condition via fraud engine", () => {
      const flags = detectBalanceBilling({
        isDSP: true,
        isPMB: true,
        chargedAmount: 60000, // R600
        schemeTariffAmount: 45000, // R450
      });
      expect(flags.length).toBeGreaterThanOrEqual(1);
      expect(flags[0].type).toBe("balance_billing");
      expect(flags[0].severity).toBe("critical");
      expect(flags[0].description).toContain("Illegal balance billing");
      expect(flags[0].estimatedOvercharge).toBe(15000);
      // Non-DSP should not flag
      const noFlag = detectBalanceBilling({
        isDSP: false,
        isPMB: true,
        chargedAmount: 60000,
        schemeTariffAmount: 45000,
      });
      expect(noFlag.length).toBe(0);
    });
  });

  // ── Dispute Generation for Underpayments ──

  describe("Dispute Workflow — Revenue Recovery", () => {
    it("should generate disputes for underpaid claims above R50 threshold", () => {
      const reconciliation = reconcileERA(
        {
          remittanceRef: "ERA-TEST-001",
          scheme: "Discovery Health",
          administrator: "Discovery Health (Pty) Ltd",
          paymentDate: today,
          paymentMethod: "EFT",
          totalAmount: 30000,
          lineItems: [
            {
              claimRef: "CLM-001",
              membershipNumber: "DH12345",
              dependentCode: "00",
              patientName: "Test Patient",
              dateOfService: today,
              tariffCode: "0190",
              claimedAmount: 52000,
              approvedAmount: 30000,
              paidAmount: 30000,
              adjustmentCode: "13",
              adjustmentReason: "Above scheme tariff",
            },
          ],
          totalClaimed: 52000,
          totalApproved: 30000,
          totalPaid: 30000,
          totalRejected: 0,
          totalAdjusted: 0,
          rawXml: "",
          receivedAt: new Date().toISOString(),
          reconciliationStatus: "pending",
        },
        [{
          id: "claim-1",
          transactionRef: "CLM-001",
          invoiceId: "INV-001",
          membershipNumber: "DH12345",
          dateOfService: today,
          claimedAmount: 52000,
          status: "submitted",
        }],
      );

      const disputes = generateDisputes(reconciliation, "Discovery Health");
      // Shortfall is R220 (22000 cents) > R50 threshold (5000 cents) → dispute generated
      expect(disputes.length).toBeGreaterThanOrEqual(1);
      expect(disputes[0].shortfall).toBe(22000);
    });

    it("should NOT generate disputes for shortfalls below R50 (5000 cents)", () => {
      const reconciliation = {
        eraRef: "ERA-TEST-002",
        matched: [],
        unmatched: [],
        overpayments: [],
        underpayments: [{
          eraLine: {
            claimRef: "CLM-002",
            membershipNumber: "DH99999",
            dependentCode: "00",
            patientName: "Small Shortfall",
            dateOfService: today,
            tariffCode: "0190",
            claimedAmount: 52000,
            approvedAmount: 49000,
            paidAmount: 49000,
          },
          invoiceId: "INV-002",
          claimId: "claim-2",
          variance: -3000, // R30 shortfall — below R50 threshold
          varianceFormatted: "-R 30.00",
          matchType: "exact" as const,
          patientShortfall: 3000,
        }],
        totalMatched: 1,
        totalUnmatched: 0,
        totalVariance: -3000,
        summary: "Test",
      };

      const disputes = generateDisputes(reconciliation, "Discovery Health");
      expect(disputes.length).toBe(0); // Below R50 threshold
    });
  });

  // ── ZAR Formatting ──

  describe("ZAR Currency Formatting", () => {
    it("should format cents to ZAR correctly", () => {
      expect(formatZAR(52000)).toBe("R 520.00");
      expect(formatZAR(100)).toBe("R 1.00");
      expect(formatZAR(0)).toBe("R 0.00");
      expect(formatZAR(-5000)).toBe("R -50.00");
    });
  });
});
