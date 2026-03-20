import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { submitClaim, reverseClaim } from "@/lib/healthbridge/client";
import { buildClaimXML } from "@/lib/healthbridge/xml";
import type { ClaimSubmission } from "@/lib/healthbridge/types";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardRoute(request, "healthbridge-claims");
  if (isErrorResponse(guard)) return guard;
  const { id } = await params;

  if (isDemoMode) {
    return NextResponse.json({ claim: { id, status: "accepted", message: "Demo claim" } });
  }

  const { prisma } = await import("@/lib/prisma");
  const claim = await prisma.healthbridgeClaim.findFirst({
    where: { id, practiceId: guard.practiceId },
  });
  if (!claim) return NextResponse.json({ error: "Claim not found" }, { status: 404 });

  return NextResponse.json({ claim });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardRoute(request, "healthbridge-claims");
  if (isErrorResponse(guard)) return guard;
  const { id } = await params;
  const body = await request.json();

  if (isDemoMode) {
    return NextResponse.json({ claim: { id, ...body, message: "Demo claim updated" } });
  }

  const { prisma } = await import("@/lib/prisma");
  const existing = await prisma.healthbridgeClaim.findFirst({
    where: { id, practiceId: guard.practiceId },
  });
  if (!existing) return NextResponse.json({ error: "Claim not found" }, { status: 404 });

  // Resubmit a rejected claim
  if (body.action === "resubmit" && (existing.status === "rejected" || existing.status === "draft")) {
    const lineItems = JSON.parse(existing.lineItems);
    const submission: ClaimSubmission = {
      bhfNumber: existing.bhfNumber,
      providerNumber: existing.providerNumber,
      treatingProvider: existing.treatingProvider,
      patientName: existing.patientName,
      patientDob: body.patientDob || "",
      patientIdNumber: existing.patientIdNumber,
      medicalAidScheme: existing.medicalAidScheme,
      membershipNumber: existing.membershipNumber,
      dependentCode: existing.dependentCode,
      dateOfService: existing.dateOfService,
      placeOfService: existing.placeOfService,
      authorizationNumber: body.authorizationNumber || existing.authorizationNumber,
      lineItems: body.lineItems || lineItems,
      practiceId: guard.practiceId,
    };

    try {
      const switchResponse = await submitClaim(submission);
      const requestXml = buildClaimXML(submission);
      const claim = await prisma.healthbridgeClaim.update({
        where: { id },
        data: {
          lineItems: JSON.stringify(body.lineItems || lineItems),
          authorizationNumber: body.authorizationNumber || existing.authorizationNumber,
          transactionRef: switchResponse.transactionRef,
          status: switchResponse.status === "accepted" ? "accepted" : switchResponse.status === "rejected" ? "rejected" : "resubmitted",
          approvedAmount: switchResponse.approvedAmount || 0,
          rejectionCode: switchResponse.rejectionCode || "",
          rejectionReason: switchResponse.rejectionReason || "",
          requestXml,
          responseXml: switchResponse.rawResponse || "",
          submittedAt: new Date(),
          respondedAt: new Date(),
        },
      });
      return NextResponse.json({ claim, switchResponse });
    } catch (e) {
      return NextResponse.json(
        { error: "Resubmission failed", details: e instanceof Error ? e.message : "Unknown" },
        { status: 502 }
      );
    }
  }

  // Reverse a claim
  if (body.action === "reverse" && existing.transactionRef) {
    try {
      const result = await reverseClaim({
        transactionRef: existing.transactionRef,
        reason: body.reason || "Claim reversal requested",
      });
      const claim = await prisma.healthbridgeClaim.update({
        where: { id },
        data: { status: "reversed", notes: result.message },
      });
      return NextResponse.json({ claim, reversal: result });
    } catch (e) {
      return NextResponse.json(
        { error: "Reversal failed", details: e instanceof Error ? e.message : "Unknown" },
        { status: 502 }
      );
    }
  }

  // General update (notes, status)
  const updateData: Record<string, unknown> = {};
  if (body.notes !== undefined) updateData.notes = body.notes;
  if (body.status !== undefined) updateData.status = body.status;

  const claim = await prisma.healthbridgeClaim.update({
    where: { id },
    data: updateData,
  });
  return NextResponse.json({ claim });
}
