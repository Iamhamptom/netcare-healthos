import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { formatZAR } from "@/lib/healthbridge/codes";

/** POST /api/healthbridge/reconcile — Auto-reconcile eRA payments against submitted claims */
export async function POST(request: Request) {
  const guard = await guardRoute(request, "healthbridge-reconcile");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({
      reconciled: 2,
      shortPaid: 1,
      unmatched: 0,
      totalReconciled: formatZAR(285000),
      details: [
        { claimRef: "HB-SIM-001", patient: "John Mokoena", claimed: formatZAR(87000), paid: formatZAR(87000), status: "paid" },
        { claimRef: "HB-SIM-004", patient: "Lindiwe Dlamini", claimed: formatZAR(52000), paid: formatZAR(52000), status: "paid" },
        { claimRef: "HB-SIM-006", patient: "Zanele Mthembu", claimed: formatZAR(95000), paid: formatZAR(85000), status: "short_paid" },
      ],
    });
  }

  const { prisma } = await import("@/lib/prisma");

  // Find unreconciled remittances
  const unreconciled = await prisma.healthbridgeRemittance.findMany({
    where: { practiceId: guard.practiceId, status: "received" },
  });

  let totalReconciled = 0;
  let reconciledCount = 0;
  let shortPaidCount = 0;
  let unmatchedCount = 0;
  const details: { claimRef: string; patient: string; claimed: string; paid: string; status: string }[] = [];

  for (const era of unreconciled) {
    const payments = JSON.parse(era.payments) as {
      claimRef: string;
      membershipNumber: string;
      patientName: string;
      dateOfService: string;
      claimedAmount: number;
      paidAmount: number;
      adjustmentCode?: string;
      adjustmentReason?: string;
    }[];

    let eraReconciled = 0;
    let eraUnmatched = 0;

    for (const payment of payments) {
      // Try matching by transaction ref first
      let claim = await prisma.healthbridgeClaim.findFirst({
        where: {
          practiceId: guard.practiceId,
          transactionRef: payment.claimRef,
          status: { in: ["accepted", "partial", "pending_payment"] },
        },
      });

      // Fallback: match by membership number + date of service
      if (!claim) {
        claim = await prisma.healthbridgeClaim.findFirst({
          where: {
            practiceId: guard.practiceId,
            membershipNumber: payment.membershipNumber,
            dateOfService: payment.dateOfService,
            status: { in: ["accepted", "partial", "pending_payment"] },
          },
        });
      }

      if (claim) {
        const newStatus = payment.paidAmount >= claim.approvedAmount ? "paid" : "short_paid";
        await prisma.healthbridgeClaim.update({
          where: { id: claim.id },
          data: {
            paidAmount: payment.paidAmount,
            remittanceRef: era.remittanceRef,
            status: newStatus,
            reconciledAt: new Date(),
          },
        });

        if (newStatus === "short_paid") shortPaidCount++;
        else reconciledCount++;

        totalReconciled += payment.paidAmount;
        eraReconciled++;

        details.push({
          claimRef: payment.claimRef,
          patient: payment.patientName,
          claimed: formatZAR(payment.claimedAmount),
          paid: formatZAR(payment.paidAmount),
          status: newStatus,
        });
      } else {
        eraUnmatched++;
        unmatchedCount++;
      }
    }

    await prisma.healthbridgeRemittance.update({
      where: { id: era.id },
      data: {
        status: "reconciled",
        reconciledCount: eraReconciled,
        unmatchedCount: eraUnmatched,
        processedAt: new Date(),
      },
    });
  }

  return NextResponse.json({
    reconciled: reconciledCount,
    shortPaid: shortPaidCount,
    unmatched: unmatchedCount,
    totalReconciled: formatZAR(totalReconciled),
    details,
  });
}
