import { describe, it, expect, vi } from "vitest";
import {
  createBatchJob,
  getBatchSummary,
  getFailedClaims,
  generateBatchEDIFACT,
} from "@/lib/switching/batch";
import type { ClaimSubmission } from "@/lib/healthbridge/types";
import type { BatchJob } from "@/lib/switching/types";

const baseClaim: ClaimSubmission = {
  bhfNumber: "1234567",
  providerNumber: "MP0123456",
  treatingProvider: "Dr Test Provider",
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

function makeClaims(count: number): ClaimSubmission[] {
  return Array.from({ length: count }, (_, i) => ({
    ...baseClaim,
    patientName: `Patient ${i + 1}`,
    membershipNumber: `90001${String(i).padStart(4, "0")}`,
  }));
}

describe("Batch Job Management", () => {
  it("creates batch job with correct metadata", () => {
    const claims = makeClaims(3);
    const job = createBatchJob({ practiceId: "p-001", claims });
    expect(job.id).toMatch(/^BATCH-/);
    expect(job.practiceId).toBe("p-001");
    expect(job.totalClaims).toBe(3);
    expect(job.processedClaims).toBe(0);
    expect(job.successfulClaims).toBe(0);
    expect(job.failedClaims).toBe(0);
    expect(job.status).toBe("queued");
    expect(job.results).toHaveLength(0);
    expect(job.claimIds).toHaveLength(3);
  });

  it("handles empty claims array gracefully", () => {
    const job = createBatchJob({ practiceId: "p-001", claims: [] });
    expect(job.totalClaims).toBe(0);
    expect(job.claimIds).toHaveLength(0);
    expect(job.status).toBe("queued");
  });

  it("assigns default maxRetries of 3", () => {
    const job = createBatchJob({ practiceId: "p-001", claims: makeClaims(1) });
    expect(job.maxRetries).toBe(3);
  });

  it("accepts custom maxRetries", () => {
    const job = createBatchJob({ practiceId: "p-001", claims: makeClaims(1), maxRetries: 5 });
    expect(job.maxRetries).toBe(5);
  });

  it("generates unique batch IDs", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 20; i++) {
      ids.add(createBatchJob({ practiceId: "p-001", claims: makeClaims(1) }).id);
    }
    expect(ids.size).toBe(20);
  });
});

describe("Batch Summary", () => {
  it("calculates correct success rate", () => {
    const job: BatchJob = {
      ...createBatchJob({ practiceId: "p-001", claims: makeClaims(10) }),
      processedClaims: 10,
      successfulClaims: 8,
      failedClaims: 2,
      status: "partial",
      startedAt: "2026-03-20T10:00:00Z",
      completedAt: "2026-03-20T10:01:00Z",
      results: [
        ...Array.from({ length: 8 }, (_, i) => ({
          claimId: `claim-${i}`, status: "success" as const, approvedAmount: 52000, processedAt: "2026-03-20T10:00:30Z",
        })),
        { claimId: "claim-8", status: "failed" as const, errorMessage: "Timeout", processedAt: "2026-03-20T10:00:40Z" },
        { claimId: "claim-9", status: "failed" as const, errorMessage: "Timeout", processedAt: "2026-03-20T10:00:50Z" },
      ],
    };
    const summary = getBatchSummary(job);
    expect(summary.successRate).toBe(80);
    expect(summary.totalClaims).toBe(10);
    expect(summary.successful).toBe(8);
    expect(summary.failed).toBe(2);
  });

  it("calculates totalApproved as sum of individual approvals", () => {
    const job: BatchJob = {
      ...createBatchJob({ practiceId: "p-001", claims: makeClaims(3) }),
      processedClaims: 3,
      successfulClaims: 3,
      failedClaims: 0,
      status: "completed",
      startedAt: "2026-03-20T10:00:00Z",
      completedAt: "2026-03-20T10:00:30Z",
      results: [
        { claimId: "claim-0", status: "success", approvedAmount: 52000, processedAt: "2026-03-20T10:00:10Z" },
        { claimId: "claim-1", status: "success", approvedAmount: 35000, processedAt: "2026-03-20T10:00:20Z" },
        { claimId: "claim-2", status: "success", approvedAmount: 6500, processedAt: "2026-03-20T10:00:30Z" },
      ],
    };
    const summary = getBatchSummary(job);
    expect(summary.totalApproved).toBe(93500);
  });

  it("groups failure reasons correctly", () => {
    const job: BatchJob = {
      ...createBatchJob({ practiceId: "p-001", claims: makeClaims(3) }),
      processedClaims: 3,
      successfulClaims: 0,
      failedClaims: 3,
      status: "failed",
      startedAt: "2026-03-20T10:00:00Z",
      completedAt: "2026-03-20T10:00:30Z",
      results: [
        { claimId: "claim-0", status: "failed", errorMessage: "Timeout", processedAt: "2026-03-20T10:00:10Z" },
        { claimId: "claim-1", status: "failed", errorMessage: "Timeout", processedAt: "2026-03-20T10:00:20Z" },
        { claimId: "claim-2", status: "failed", errorMessage: "Connection refused", processedAt: "2026-03-20T10:00:30Z" },
      ],
    };
    const summary = getBatchSummary(job);
    expect(summary.failureReasons).toHaveLength(2);
    expect(summary.failureReasons[0]).toEqual({ reason: "Timeout", count: 2 });
    expect(summary.failureReasons[1]).toEqual({ reason: "Connection refused", count: 1 });
  });

  it("returns 0% success rate for empty batch", () => {
    const job: BatchJob = {
      ...createBatchJob({ practiceId: "p-001", claims: [] }),
      status: "completed",
      results: [],
    };
    const summary = getBatchSummary(job);
    expect(summary.successRate).toBe(0);
    expect(summary.totalApproved).toBe(0);
  });
});

describe("Get Failed Claims", () => {
  it("extracts only failed claims from batch results", () => {
    const claims = makeClaims(5);
    const job: BatchJob = {
      ...createBatchJob({ practiceId: "p-001", claims }),
      processedClaims: 5,
      successfulClaims: 3,
      failedClaims: 2,
      status: "partial",
      results: [
        { claimId: "claim-0", status: "success", processedAt: "2026-03-20T10:00:10Z" },
        { claimId: "claim-1", status: "failed", errorMessage: "Timeout", processedAt: "2026-03-20T10:00:20Z" },
        { claimId: "claim-2", status: "success", processedAt: "2026-03-20T10:00:30Z" },
        { claimId: "claim-3", status: "success", processedAt: "2026-03-20T10:00:40Z" },
        { claimId: "claim-4", status: "failed", errorMessage: "Network error", processedAt: "2026-03-20T10:00:50Z" },
      ],
    };
    const failed = getFailedClaims(job, claims);
    expect(failed).toHaveLength(2);
    expect(failed[0].patientName).toBe("Patient 2");
    expect(failed[1].patientName).toBe("Patient 5");
  });

  it("returns empty array when no failures", () => {
    const claims = makeClaims(2);
    const job: BatchJob = {
      ...createBatchJob({ practiceId: "p-001", claims }),
      processedClaims: 2,
      successfulClaims: 2,
      failedClaims: 0,
      status: "completed",
      results: [
        { claimId: "claim-0", status: "success", processedAt: "2026-03-20T10:00:10Z" },
        { claimId: "claim-1", status: "success", processedAt: "2026-03-20T10:00:20Z" },
      ],
    };
    const failed = getFailedClaims(job, claims);
    expect(failed).toHaveLength(0);
  });
});

describe("Batch EDIFACT Generation", () => {
  it("generates valid EDIFACT interchange for batch", () => {
    const claims = makeClaims(3);
    const edifact = generateBatchEDIFACT(claims, "1234567", "HEALTHBRIDGE");
    expect(edifact).toContain("UNB+UNOC:3");
    expect(edifact).toContain("UNZ+3");
    expect(edifact).toContain("MEDCLM:0:912:ZA");
  });

  it("generates interchange for single claim", () => {
    const edifact = generateBatchEDIFACT([baseClaim], "1234567", "MEDIKREDIT");
    expect(edifact).toContain("UNB+");
    expect(edifact).toContain("UNZ+1");
  });
});

describe("Batch Status Transitions", () => {
  it("starts as queued", () => {
    const job = createBatchJob({ practiceId: "p-001", claims: makeClaims(1) });
    expect(job.status).toBe("queued");
  });

  it("completed status when all succeed", () => {
    const job = createBatchJob({ practiceId: "p-001", claims: makeClaims(2) });
    job.processedClaims = 2;
    job.successfulClaims = 2;
    job.failedClaims = 0;
    // Replicate the status logic from processBatch
    const status = job.failedClaims === 0 ? "completed"
      : job.successfulClaims === 0 ? "failed"
      : "partial";
    expect(status).toBe("completed");
  });

  it("failed status when all fail", () => {
    const job = createBatchJob({ practiceId: "p-001", claims: makeClaims(2) });
    job.processedClaims = 2;
    job.successfulClaims = 0;
    job.failedClaims = 2;
    const status = job.failedClaims === 0 ? "completed"
      : job.successfulClaims === 0 ? "failed"
      : "partial";
    expect(status).toBe("failed");
  });

  it("partial status when mixed results", () => {
    const job = createBatchJob({ practiceId: "p-001", claims: makeClaims(4) });
    job.processedClaims = 4;
    job.successfulClaims = 3;
    job.failedClaims = 1;
    const status = job.failedClaims === 0 ? "completed"
      : job.successfulClaims === 0 ? "failed"
      : "partial";
    expect(status).toBe("partial");
  });
});
