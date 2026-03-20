// POST /api/switching/resubmit — Analyze rejections and prepare resubmissions
// PUT /api/switching/resubmit — Submit corrected claims

import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import {
  analyzeRejection,
  categorizeForResubmission,
  createResubmission,
  applyAutoFixes,
} from "@/lib/switching";

export async function POST(req: Request) {
  const guard = await guardRoute(req, "switching-resubmit", { limit: 20 });
  if (isErrorResponse(guard)) return guard;
  try {
    const body = await req.json();
    const { action } = body;

    // Single rejection analysis
    if (action === "analyze") {
      const { rejectionCode, rejectionReason } = body;
      if (!rejectionCode) {
        return NextResponse.json({ error: "rejectionCode is required" }, { status: 400 });
      }
      const analysis = analyzeRejection(rejectionCode, rejectionReason);
      return NextResponse.json(analysis);
    }

    // Auto-fix a single claim
    if (action === "autofix") {
      const { claim, rejectionCode } = body;
      if (!claim || !rejectionCode) {
        return NextResponse.json({ error: "claim and rejectionCode are required" }, { status: 400 });
      }
      const result = applyAutoFixes(claim, rejectionCode);
      return NextResponse.json(result);
    }

    // Bulk categorization for resubmission
    if (action === "categorize") {
      const { rejectedClaims } = body;
      if (!rejectedClaims || !Array.isArray(rejectedClaims)) {
        return NextResponse.json({ error: "rejectedClaims array is required" }, { status: 400 });
      }
      const batch = categorizeForResubmission(rejectedClaims);
      return NextResponse.json({
        autoFixable: batch.autoFixable.length,
        manualReview: batch.manualReview.length,
        notResubmittable: batch.notResubmittable.length,
        details: batch,
      });
    }

    // Create a resubmission
    const { originalClaim, originalClaimId, rejectionCode, rejectionReason, corrections } = body;
    if (!originalClaim || !rejectionCode) {
      return NextResponse.json({ error: "originalClaim and rejectionCode are required" }, { status: 400 });
    }

    const resubmission = createResubmission(
      originalClaim,
      originalClaimId || "unknown",
      rejectionCode,
      rejectionReason || "",
      corrections || [],
    );

    return NextResponse.json(resubmission);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
