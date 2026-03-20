// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Batch Claims Processor — Queue management, sequential submission, retry logic
// Handles: end-of-day batch submission, bulk resubmission, multi-switch routing
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { BatchJob, BatchClaimResult, BatchStatus } from "./types";
import type { ClaimSubmission, ClaimResponse } from "../healthbridge/types";
import { submitRoutedClaim, updateSwitchHealth } from "./router";

// ─── Batch Job Management ───────────────────────────────────────────────────

const MAX_CONCURRENT = 5;
const DEFAULT_MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

/**
 * Create a new batch job for multiple claims.
 */
export function createBatchJob(data: {
  practiceId: string;
  claims: ClaimSubmission[];
  maxRetries?: number;
}): BatchJob {
  const now = new Date().toISOString();
  return {
    id: `BATCH-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    practiceId: data.practiceId,
    claimIds: data.claims.map((_, i) => `claim-${i}`),
    totalClaims: data.claims.length,
    processedClaims: 0,
    successfulClaims: 0,
    failedClaims: 0,
    switchProvider: "healthbridge",
    protocol: "xml",
    status: "queued",
    results: [],
    queuedAt: now,
    retryCount: 0,
    maxRetries: data.maxRetries ?? DEFAULT_MAX_RETRIES,
  };
}

/**
 * Process a batch of claims sequentially with rate limiting.
 * Submits claims one at a time to avoid overwhelming the switch.
 * Includes retry logic for transient failures.
 */
export async function processBatch(
  claims: ClaimSubmission[],
  onProgress?: (processed: number, total: number, result: BatchClaimResult) => void,
): Promise<BatchJob> {
  const job = createBatchJob({ practiceId: claims[0]?.practiceId || "", claims });
  job.status = "processing";
  job.startedAt = new Date().toISOString();

  // Process claims in chunks to control concurrency
  for (let i = 0; i < claims.length; i += MAX_CONCURRENT) {
    const chunk = claims.slice(i, i + MAX_CONCURRENT);
    const chunkResults = await Promise.allSettled(
      chunk.map((claim, idx) => processClaimWithRetry(claim, i + idx, job.maxRetries))
    );

    for (let j = 0; j < chunkResults.length; j++) {
      const settled = chunkResults[j];
      const claimIndex = i + j;
      let result: BatchClaimResult;

      if (settled.status === "fulfilled") {
        result = settled.value;
      } else {
        result = {
          claimId: `claim-${claimIndex}`,
          status: "failed",
          errorMessage: settled.reason?.message || "Unknown error",
          processedAt: new Date().toISOString(),
        };
      }

      job.results.push(result);
      job.processedClaims++;
      if (result.status === "success") job.successfulClaims++;
      else job.failedClaims++;

      onProgress?.(job.processedClaims, job.totalClaims, result);
    }

    // Brief pause between chunks to avoid switch rate limits
    if (i + MAX_CONCURRENT < claims.length) {
      await delay(500);
    }
  }

  job.status = job.failedClaims === 0 ? "completed"
    : job.successfulClaims === 0 ? "failed"
    : "partial";
  job.completedAt = new Date().toISOString();

  return job;
}

/**
 * Process a single claim with retry logic.
 */
async function processClaimWithRetry(
  claim: ClaimSubmission,
  index: number,
  maxRetries: number,
): Promise<BatchClaimResult> {
  let lastError = "";

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const startTime = Date.now();

    try {
      const response = await submitRoutedClaim(claim);
      const latency = Date.now() - startTime;
      updateSwitchHealth(response.routedTo, true, latency);

      return {
        claimId: `claim-${index}`,
        transactionRef: response.transactionRef,
        status: "success",
        responseStatus: response.status,
        approvedAmount: response.approvedAmount,
        processedAt: new Date().toISOString(),
      };
    } catch (err) {
      const latency = Date.now() - startTime;
      lastError = err instanceof Error ? err.message : "Unknown error";
      updateSwitchHealth(claim.medicalAidScheme as never, false, latency);

      if (attempt < maxRetries) {
        // Exponential backoff: 2s, 4s, 8s
        await delay(RETRY_DELAY_MS * Math.pow(2, attempt));
      }
    }
  }

  return {
    claimId: `claim-${index}`,
    status: "failed",
    errorMessage: `Failed after ${maxRetries + 1} attempts: ${lastError}`,
    processedAt: new Date().toISOString(),
  };
}

// ─── Batch Analytics ────────────────────────────────────────────────────────

export interface BatchSummary {
  totalClaims: number;
  successful: number;
  failed: number;
  skipped: number;
  successRate: number;
  totalApproved: number;
  avgProcessingTimeMs: number;
  failureReasons: { reason: string; count: number }[];
}

/**
 * Generate a summary of a completed batch job.
 */
export function getBatchSummary(job: BatchJob): BatchSummary {
  const failureReasons = new Map<string, number>();
  let totalApproved = 0;

  for (const result of job.results) {
    if (result.status === "failed" && result.errorMessage) {
      const count = failureReasons.get(result.errorMessage) || 0;
      failureReasons.set(result.errorMessage, count + 1);
    }
    if (result.approvedAmount) {
      totalApproved += result.approvedAmount;
    }
  }

  const startMs = job.startedAt ? new Date(job.startedAt).getTime() : 0;
  const endMs = job.completedAt ? new Date(job.completedAt).getTime() : Date.now();
  const durationMs = endMs - startMs;

  return {
    totalClaims: job.totalClaims,
    successful: job.successfulClaims,
    failed: job.failedClaims,
    skipped: job.totalClaims - job.processedClaims,
    successRate: job.processedClaims > 0
      ? Math.round((job.successfulClaims / job.processedClaims) * 100)
      : 0,
    totalApproved,
    avgProcessingTimeMs: job.processedClaims > 0
      ? Math.round(durationMs / job.processedClaims)
      : 0,
    failureReasons: Array.from(failureReasons.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count),
  };
}

/**
 * Get failed claims from a batch job for retry.
 */
export function getFailedClaims(
  job: BatchJob,
  originalClaims: ClaimSubmission[],
): ClaimSubmission[] {
  return job.results
    .filter(r => r.status === "failed")
    .map(r => {
      const index = parseInt(r.claimId.replace("claim-", ""), 10);
      return originalClaims[index];
    })
    .filter(Boolean) as ClaimSubmission[];
}

// ─── EDIFACT Batch File ─────────────────────────────────────────────────────

import { generateEDIFACT, generateEDIFACTInterchange } from "./edifact";

/**
 * Generate an EDIFACT batch file containing multiple claims.
 * Used for batch switching (legacy mode).
 */
export function generateBatchEDIFACT(
  claims: ClaimSubmission[],
  senderBhf: string,
  recipientSwitch: string,
): string {
  const messages = claims.map((claim, i) =>
    generateEDIFACT(claim, { messageRef: i + 1 })
  );
  return generateEDIFACTInterchange(messages, senderBhf, recipientSwitch);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
