// GET /api/switching/route — Determine which switch to use for a scheme
// POST /api/switching/route — Submit a claim through the routed switch

import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { routeClaim, submitRoutedClaim, getSwitchStatus } from "@/lib/switching";

export async function GET(req: Request) {
  const guard = await guardRoute(req, "switching-route");
  if (isErrorResponse(guard)) return guard;

  const url = new URL(req.url);
  const scheme = url.searchParams.get("scheme");

  if (scheme) {
    const routing = routeClaim(scheme);
    return NextResponse.json(routing);
  }

  const status = getSwitchStatus();
  return NextResponse.json({ switches: status });
}

export async function POST(req: Request) {
  const guard = await guardRoute(req, "switching-submit", { limit: 20 });
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await req.json();
    const { claim, forceSwitch, forceProtocol } = body;

    if (!claim) {
      return NextResponse.json({ error: "Claim data is required" }, { status: 400 });
    }

    const routing = routeClaim(claim.medicalAidScheme);
    const response = await submitRoutedClaim(claim, {
      forceSwitch: forceSwitch || undefined,
      forceProtocol: forceProtocol || undefined,
    });

    // Persist to database
    try {
      const { prisma } = await import("@/lib/prisma");
      await prisma.healthbridgeClaim.create({
        data: {
          practiceId: guard.practiceId,
          patientName: claim.patientName || "",
          medicalAidScheme: claim.medicalAidScheme || "",
          membershipNumber: claim.membershipNumber || "",
          dependentCode: claim.dependentCode || "00",
          dateOfService: claim.dateOfService || "",
          status: response.status,
          totalAmount: claim.lineItems?.reduce((s: number, li: { amount: number; quantity: number }) => s + li.amount * li.quantity, 0) || 0,
          approvedAmount: response.approvedAmount || 0,
          transactionRef: response.transactionRef,
          switchProvider: response.routedTo,
          rejectionCode: response.rejectionCode || "",
          rejectionReason: response.rejectionReason || "",
          edifactMessage: response.edifact || "",
          requestXml: "",
        },
      });
    } catch { /* DB write failure shouldn't block response */ }

    return NextResponse.json({ routing, response, edifact: response.edifact });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
