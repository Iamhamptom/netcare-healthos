// POST /api/switching/batch — Submit a batch of claims for processing
// GET /api/switching/batch — Get batch job status

import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import {
  processBatch,
  getBatchSummary,
  generateBatchEDIFACT,
} from "@/lib/switching";
import type { ClaimSubmission } from "@/lib/healthbridge/types";

export async function POST(req: Request) {
  const guard = await guardRoute(req, "switching-batch", { limit: 5 });
  if (isErrorResponse(guard)) return guard;
  try {
    const body = await req.json();
    const { claims, mode } = body as { claims: ClaimSubmission[]; mode?: "submit" | "edifact" };

    if (!claims || !Array.isArray(claims) || claims.length === 0) {
      return NextResponse.json({ error: "Array of claims is required" }, { status: 400 });
    }

    if (claims.length > 500) {
      return NextResponse.json({ error: "Maximum 500 claims per batch" }, { status: 400 });
    }

    // Validate each claim has required fields
    const invalidIdx = claims.findIndex(c => !c.medicalAidScheme || !c.lineItems || !Array.isArray(c.lineItems) || c.lineItems.length === 0);
    if (invalidIdx >= 0) {
      return NextResponse.json({ error: `Invalid claim at index ${invalidIdx}: medicalAidScheme and lineItems are required` }, { status: 400 });
    }

    // EDIFACT batch file generation (no submission)
    if (mode === "edifact") {
      const bhf = claims[0].bhfNumber || "0000000";
      const edifact = generateBatchEDIFACT(claims, bhf, "HEALTHBRIDGE");
      return NextResponse.json({
        edifact,
        claimCount: claims.length,
        spec: "PHISC MEDCLM v0:912:ZA",
      });
    }

    // Process batch with real-time progress
    const job = await processBatch(claims);
    const summary = getBatchSummary(job);

    return NextResponse.json({
      job: {
        id: job.id,
        status: job.status,
        totalClaims: job.totalClaims,
        processedClaims: job.processedClaims,
        successfulClaims: job.successfulClaims,
        failedClaims: job.failedClaims,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
      },
      summary,
      results: job.results,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
