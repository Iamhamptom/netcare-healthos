import { describe, it, expect } from "vitest";
import { calculateSchemeAnalytics, calculateAging, estimatePatientCost } from "@/lib/healthbridge/analytics";
import type { ClaimRecord } from "@/lib/healthbridge/analytics";

const mockClaims: ClaimRecord[] = [
  { id: "1", patientName: "A", medicalAidScheme: "Discovery Health", totalAmount: 52000, approvedAmount: 52000, paidAmount: 52000, status: "paid", dateOfService: "2026-03-01", submittedAt: "2026-03-01T10:00:00Z", respondedAt: "2026-03-01T10:00:02Z", reconciledAt: "2026-03-11T14:00:00Z", rejectionCode: "", rejectionReason: "" },
  { id: "2", patientName: "B", medicalAidScheme: "Discovery Health", totalAmount: 87000, approvedAmount: 0, paidAmount: 0, status: "rejected", dateOfService: "2026-03-05", submittedAt: "2026-03-05T10:00:00Z", respondedAt: "2026-03-05T10:00:01Z", reconciledAt: null, rejectionCode: "08", rejectionReason: "Pre-auth required" },
  { id: "3", patientName: "C", medicalAidScheme: "GEMS", totalAmount: 65000, approvedAmount: 65000, paidAmount: 65000, status: "paid", dateOfService: "2026-03-03", submittedAt: "2026-03-03T09:00:00Z", respondedAt: "2026-03-03T09:00:02Z", reconciledAt: "2026-03-15T10:00:00Z", rejectionCode: "", rejectionReason: "" },
];

describe("Scheme Analytics", () => {
  it("should calculate analytics per scheme", () => {
    const analytics = calculateSchemeAnalytics(mockClaims);
    expect(analytics.length).toBe(2);

    const discovery = analytics.find(a => a.scheme === "Discovery Health")!;
    expect(discovery.totalClaims).toBe(2);
    expect(discovery.accepted).toBe(1);
    expect(discovery.rejected).toBe(1);
    expect(discovery.acceptanceRate).toBe(50);
    expect(discovery.rejectionRate).toBe(50);

    const gems = analytics.find(a => a.scheme === "GEMS")!;
    expect(gems.totalClaims).toBe(1);
    expect(gems.acceptanceRate).toBe(100);
  });

  it("should track top rejection reasons", () => {
    const analytics = calculateSchemeAnalytics(mockClaims);
    const discovery = analytics.find(a => a.scheme === "Discovery Health")!;
    expect(discovery.topRejections.length).toBe(1);
    expect(discovery.topRejections[0].code).toBe("08");
  });
});

describe("Patient Cost Estimation", () => {
  it("should calculate scheme vs patient split", () => {
    const estimate = estimatePatientCost({
      lineItems: [{ cptCode: "0190", amount: 52000, quantity: 1 }],
      schemeRate: 100,
      hasGapCover: false,
    });
    expect(estimate.totalCharge).toBe(52000);
    expect(estimate.estimatedSchemePayment).toBe(52000);
    expect(estimate.estimatedPatientLiability).toBe(0);
  });

  it("should calculate shortfall when provider charges above tariff", () => {
    const estimate = estimatePatientCost({
      lineItems: [{ cptCode: "0141", amount: 200000, quantity: 1 }], // R2000 for specialist
      schemeRate: 50, // scheme pays 50% of tariff
      hasGapCover: false,
    });
    expect(estimate.estimatedPatientLiability).toBe(100000); // R1000 shortfall
    expect(estimate.finalPatientCost).toBe(100000);
  });

  it("should reduce patient cost with gap cover", () => {
    const estimate = estimatePatientCost({
      lineItems: [{ cptCode: "0141", amount: 200000, quantity: 1 }],
      schemeRate: 50,
      hasGapCover: true,
      gapCoverMultiple: 3,
    });
    expect(estimate.estimatedGapCoverRecovery).toBeGreaterThan(0);
    expect(estimate.finalPatientCost).toBeLessThan(estimate.estimatedPatientLiability);
  });
});
