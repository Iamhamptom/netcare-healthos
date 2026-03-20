import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { fetchRemittances } from "@/lib/healthbridge/client";

export async function GET(request: Request) {
  const guard = await guardRoute(request, "healthbridge-remittances");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({ remittances: demoRemittances });
  }

  const { prisma } = await import("@/lib/prisma");
  const remittances = await prisma.healthbridgeRemittance.findMany({
    where: { practiceId: guard.practiceId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ remittances });
}

/** Fetch new eRAs from Healthbridge switch and store them */
export async function POST(request: Request) {
  const guard = await guardRoute(request, "healthbridge-remittances");
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  const fromDate = body.fromDate || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const toDate = body.toDate || new Date().toISOString().slice(0, 10);

  const eras = await fetchRemittances({ fromDate, toDate });

  if (isDemoMode) {
    return NextResponse.json({
      fetched: eras.length,
      remittances: eras.map((era) => ({
        id: `hbr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        practiceId: "demo-practice",
        ...era,
        payments: JSON.stringify(era.payments),
        status: "received",
        claimCount: era.payments.length,
        reconciledCount: 0,
        unmatchedCount: 0,
        createdAt: new Date().toISOString(),
      })),
    });
  }

  const { prisma } = await import("@/lib/prisma");
  const stored = [];

  for (const era of eras) {
    // Skip if already imported (by remittanceRef)
    const existing = await prisma.healthbridgeRemittance.findFirst({
      where: { remittanceRef: era.remittanceRef, practiceId: guard.practiceId },
    });
    if (existing) continue;

    const remittance = await prisma.healthbridgeRemittance.create({
      data: {
        practiceId: guard.practiceId,
        scheme: era.scheme,
        remittanceRef: era.remittanceRef,
        paymentDate: era.paymentDate,
        totalAmount: era.totalAmount,
        claimCount: era.payments.length,
        payments: JSON.stringify(era.payments),
        status: "received",
      },
    });

    // Auto-reconcile: match eRA payments to submitted claims
    let reconciledCount = 0;
    let unmatchedCount = 0;
    for (const payment of era.payments) {
      const matchedClaim = await prisma.healthbridgeClaim.findFirst({
        where: {
          practiceId: guard.practiceId,
          transactionRef: payment.claimRef,
          status: { in: ["accepted", "partial", "pending_payment"] },
        },
      });

      if (matchedClaim) {
        await prisma.healthbridgeClaim.update({
          where: { id: matchedClaim.id },
          data: {
            paidAmount: payment.paidAmount,
            remittanceRef: era.remittanceRef,
            status: payment.paidAmount >= matchedClaim.approvedAmount ? "paid" : "short_paid",
            reconciledAt: new Date(),
          },
        });
        reconciledCount++;
      } else {
        unmatchedCount++;
      }
    }

    await prisma.healthbridgeRemittance.update({
      where: { id: remittance.id },
      data: { reconciledCount, unmatchedCount, status: "reconciled", processedAt: new Date() },
    });

    stored.push({ ...remittance, reconciledCount, unmatchedCount });
  }

  return NextResponse.json({ fetched: eras.length, stored: stored.length, remittances: stored });
}

const demoRemittances = [
  {
    id: "hbr-demo-1",
    practiceId: "demo-practice",
    scheme: "Discovery Health",
    remittanceRef: "ERA-DH-2026-0319",
    paymentDate: "2026-03-19",
    totalAmount: 285000,
    claimCount: 3,
    payments: JSON.stringify([
      { claimRef: "HB-SIM-001", membershipNumber: "900012345", patientName: "John Mokoena", dateOfService: "2026-03-18", claimedAmount: 87000, paidAmount: 87000 },
      { claimRef: "HB-SIM-004", membershipNumber: "900022222", patientName: "Lindiwe Dlamini", dateOfService: "2026-03-18", claimedAmount: 52000, paidAmount: 52000 },
      { claimRef: "HB-SIM-005", membershipNumber: "900033333", patientName: "Ahmed Patel", dateOfService: "2026-03-17", claimedAmount: 146000, paidAmount: 146000 },
    ]),
    status: "reconciled",
    reconciledCount: 3,
    unmatchedCount: 0,
    createdAt: "2026-03-19T14:00:00Z",
  },
  {
    id: "hbr-demo-2",
    practiceId: "demo-practice",
    scheme: "Bonitas",
    remittanceRef: "ERA-BON-2026-0319",
    paymentDate: "2026-03-19",
    totalAmount: 148000,
    claimCount: 2,
    payments: JSON.stringify([
      { claimRef: "HB-SIM-006", membershipNumber: "800044444", patientName: "Zanele Mthembu", dateOfService: "2026-03-17", claimedAmount: 95000, paidAmount: 85000, adjustmentCode: "15", adjustmentReason: "Paid at scheme rate" },
      { claimRef: "HB-SIM-007", membershipNumber: "800055555", patientName: "David Smith", dateOfService: "2026-03-18", claimedAmount: 63000, paidAmount: 63000 },
    ]),
    status: "reconciled",
    reconciledCount: 2,
    unmatchedCount: 0,
    createdAt: "2026-03-19T15:30:00Z",
  },
];
