import { describe, it, expect, beforeEach } from "vitest";
import {
  evaluateTransaction,
  getEvaluations,
  getPendingReviews,
  markReviewed,
  getPatternInsights,
  resetEvaluations,
} from "@/lib/switching/review-agent";
import type { ClaimSubmission, ClaimResponse } from "@/lib/healthbridge/types";

const baseClaim: ClaimSubmission = {
  bhfNumber: "1234567",
  providerNumber: "MP0123456",
  treatingProvider: "Dr Test Provider",
  patientName: "John Mokoena",
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

const acceptedResponse: ClaimResponse = {
  transactionRef: "HB-TEST-001",
  status: "accepted",
  approvedAmount: 52000,
  rawResponse: "<test/>",
};

const rejectedResponse: ClaimResponse = {
  transactionRef: "HB-TEST-002",
  status: "rejected",
  rejectionCode: "06",
  rejectionReason: "Claim already reversed",
  rawResponse: "<test/>",
};

const underpaidResponse: ClaimResponse = {
  transactionRef: "HB-TEST-003",
  status: "accepted",
  approvedAmount: 20000, // Only R200 approved for R520 claim
  rawResponse: "<test/>",
};

const zeroPaymentResponse: ClaimResponse = {
  transactionRef: "HB-TEST-004",
  status: "accepted",
  approvedAmount: 0,
  rawResponse: "<test/>",
};

describe("Transaction Evaluation", () => {
  beforeEach(() => {
    resetEvaluations();
  });

  it("normal transaction passes all checks", () => {
    const evaluation = evaluateTransaction(baseClaim, acceptedResponse, "healthbridge", 200);
    expect(evaluation.assessment).toBe("normal");
    expect(evaluation.anomalies).toHaveLength(0);
    expect(evaluation.requiresHumanReview).toBe(false);
    expect(evaluation.reviewStatus).toBe("dismissed");
  });

  it("detects unexpected rejections (suspicious code 06)", () => {
    const evaluation = evaluateTransaction(baseClaim, rejectedResponse, "healthbridge", 200);
    expect(evaluation.assessment).toBe("critical");
    const anomaly = evaluation.anomalies.find(a => a.type === "unexpected_rejection");
    expect(anomaly).toBeDefined();
    expect(anomaly!.severity).toBe("critical");
    expect(anomaly!.description).toContain("06");
    expect(evaluation.requiresHumanReview).toBe(true);
  });

  it("detects underpayment anomalies", () => {
    const evaluation = evaluateTransaction(baseClaim, underpaidResponse, "healthbridge", 200);
    const anomaly = evaluation.anomalies.find(a => a.type === "underpayment");
    expect(anomaly).toBeDefined();
    expect(anomaly!.severity).toBe("warning");
    expect(anomaly!.description).toContain("Discovery Health");
  });

  it("flags zero payments as critical", () => {
    const evaluation = evaluateTransaction(baseClaim, zeroPaymentResponse, "healthbridge", 200);
    const anomaly = evaluation.anomalies.find(a => a.type === "zero_payment");
    expect(anomaly).toBeDefined();
    expect(anomaly!.severity).toBe("critical");
    expect(anomaly!.description).toContain("R0.00");
    expect(evaluation.assessment).toBe("critical");
  });

  it("flags high latency", () => {
    const evaluation = evaluateTransaction(baseClaim, acceptedResponse, "healthbridge", 30000);
    const anomaly = evaluation.anomalies.find(a => a.type === "high_latency");
    expect(anomaly).toBeDefined();
    expect(anomaly!.severity).toBe("warning");
    expect(anomaly!.description).toContain("30.0s");
  });

  it("records claimed and approved amounts in cents", () => {
    const evaluation = evaluateTransaction(baseClaim, acceptedResponse, "healthbridge", 200);
    expect(evaluation.claimedAmountCents).toBe(52000);
    expect(evaluation.approvedAmountCents).toBe(52000);
  });

  it("generates unique evaluation IDs", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 10; i++) {
      const e = evaluateTransaction(baseClaim, acceptedResponse, "healthbridge", 200);
      ids.add(e.id);
    }
    expect(ids.size).toBe(10);
  });

  it("unknown rejection code flagged as warning", () => {
    const unknownReject: ClaimResponse = {
      transactionRef: "HB-UNK-001",
      status: "rejected",
      rejectionCode: "99",
      rejectionReason: "Unknown reason",
      rawResponse: "<test/>",
    };
    const evaluation = evaluateTransaction(baseClaim, unknownReject, "medikredit", 200);
    const anomaly = evaluation.anomalies.find(a => a.type === "unknown_rejection_code");
    expect(anomaly).toBeDefined();
    expect(anomaly!.severity).toBe("warning");
  });
});

describe("Evaluation Storage", () => {
  beforeEach(() => {
    resetEvaluations();
  });

  it("getEvaluations returns stored evaluations", () => {
    evaluateTransaction(baseClaim, acceptedResponse, "healthbridge", 200);
    evaluateTransaction(baseClaim, rejectedResponse, "medikredit", 200);
    const evals = getEvaluations();
    expect(evals).toHaveLength(2);
  });

  it("getEvaluations filters by assessment", () => {
    evaluateTransaction(baseClaim, acceptedResponse, "healthbridge", 200);
    evaluateTransaction(baseClaim, zeroPaymentResponse, "healthbridge", 200);
    const critical = getEvaluations({ assessment: "critical" });
    expect(critical).toHaveLength(1);
    expect(critical[0].assessment).toBe("critical");
  });

  it("getEvaluations filters by scheme", () => {
    evaluateTransaction(baseClaim, acceptedResponse, "healthbridge", 200);
    const gemsClaim = { ...baseClaim, medicalAidScheme: "GEMS" };
    evaluateTransaction(gemsClaim, acceptedResponse, "switchon", 200);
    const gems = getEvaluations({ scheme: "GEMS" });
    expect(gems).toHaveLength(1);
    expect(gems[0].scheme).toBe("GEMS");
  });

  it("getPendingReviews filters by review status", () => {
    evaluateTransaction(baseClaim, acceptedResponse, "healthbridge", 200);
    evaluateTransaction(baseClaim, rejectedResponse, "medikredit", 200);
    const pending = getPendingReviews();
    // Only the rejected (critical) one should be pending
    expect(pending.length).toBeGreaterThanOrEqual(1);
    for (const p of pending) {
      expect(p.reviewStatus).toBe("pending");
    }
  });

  it("markReviewed updates evaluation status", () => {
    const evaluation = evaluateTransaction(baseClaim, rejectedResponse, "healthbridge", 200);
    const result = markReviewed(evaluation.id, "reviewed", "Confirmed false positive");
    expect(result).toBe(true);
    const evals = getEvaluations({ reviewStatus: "reviewed" });
    expect(evals).toHaveLength(1);
    expect(evals[0].reviewNotes).toBe("Confirmed false positive");
  });

  it("markReviewed returns false for non-existent ID", () => {
    const result = markReviewed("EVAL-nonexistent", "reviewed");
    expect(result).toBe(false);
  });

  it("resetEvaluations clears all state", () => {
    evaluateTransaction(baseClaim, acceptedResponse, "healthbridge", 200);
    evaluateTransaction(baseClaim, rejectedResponse, "medikredit", 200);
    resetEvaluations();
    expect(getEvaluations()).toHaveLength(0);
    expect(getPendingReviews()).toHaveLength(0);
  });
});

describe("Pattern Insights", () => {
  beforeEach(() => {
    resetEvaluations();
  });

  it("detects scheme-level patterns", () => {
    // Submit several evaluations to build patterns
    for (let i = 0; i < 5; i++) {
      evaluateTransaction(baseClaim, acceptedResponse, "healthbridge", 200);
    }
    evaluateTransaction(baseClaim, rejectedResponse, "healthbridge", 200);
    const insights = getPatternInsights();
    expect(insights.totalEvaluations).toBe(6);
    expect(insights.schemeRejectionRates.length).toBeGreaterThan(0);
  });

  it("tracks rejection codes", () => {
    evaluateTransaction(baseClaim, rejectedResponse, "healthbridge", 200);
    const insights = getPatternInsights();
    expect(insights.topRejectionCodes.length).toBeGreaterThan(0);
    expect(insights.topRejectionCodes[0].code).toBe("06");
    expect(insights.topRejectionCodes[0].count).toBe(1);
  });

  it("counts flagged and critical evaluations", () => {
    evaluateTransaction(baseClaim, acceptedResponse, "healthbridge", 200);
    evaluateTransaction(baseClaim, zeroPaymentResponse, "healthbridge", 200);
    evaluateTransaction(baseClaim, underpaidResponse, "healthbridge", 200);
    const insights = getPatternInsights();
    expect(insights.criticalCount).toBeGreaterThanOrEqual(1);
    expect(insights.flaggedCount).toBeGreaterThanOrEqual(1);
  });

  it("tracks anomaly types", () => {
    evaluateTransaction(baseClaim, zeroPaymentResponse, "healthbridge", 200);
    evaluateTransaction(baseClaim, underpaidResponse, "healthbridge", 200);
    const insights = getPatternInsights();
    const types = insights.recentAnomalyTypes.map(a => a.type);
    expect(types).toContain("zero_payment");
    expect(types).toContain("underpayment");
  });
});
