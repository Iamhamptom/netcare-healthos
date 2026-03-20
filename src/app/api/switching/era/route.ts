// POST /api/switching/era — Parse an eRA XML document and reconcile payments
// GET /api/switching/era — Fetch latest eRAs from configured switches

import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import {
  parseERAXml,
  reconcileERA,
  generateDisputes,
} from "@/lib/switching";

export async function POST(req: Request) {
  const guard = await guardRoute(req, "switching-era", { limit: 15 });
  if (isErrorResponse(guard)) return guard;
  try {
    const body = await req.json();
    const { xml, existingClaims, scheme } = body;

    if (!xml) {
      return NextResponse.json({ error: "eRA XML document is required" }, { status: 400 });
    }

    // Parse the eRA
    const era = parseERAXml(xml);

    // Reconcile if existing claims provided
    let reconciliation = null;
    let disputes = null;

    if (existingClaims && Array.isArray(existingClaims)) {
      reconciliation = reconcileERA(era, existingClaims);
      disputes = generateDisputes(reconciliation, scheme || era.scheme);
    }

    return NextResponse.json({
      era: {
        remittanceRef: era.remittanceRef,
        scheme: era.scheme,
        administrator: era.administrator,
        paymentDate: era.paymentDate,
        paymentMethod: era.paymentMethod,
        totalAmount: era.totalAmount,
        totalClaimed: era.totalClaimed,
        totalApproved: era.totalApproved,
        totalPaid: era.totalPaid,
        totalRejected: era.totalRejected,
        totalAdjusted: era.totalAdjusted,
        lineItemCount: era.lineItems.length,
        lineItems: era.lineItems,
      },
      reconciliation: reconciliation ? {
        totalMatched: reconciliation.totalMatched,
        totalUnmatched: reconciliation.totalUnmatched,
        totalVariance: reconciliation.totalVariance,
        summary: reconciliation.summary,
        matched: reconciliation.matched,
        unmatched: reconciliation.unmatched,
        underpayments: reconciliation.underpayments,
        overpayments: reconciliation.overpayments,
      } : null,
      disputes,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
