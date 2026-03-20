import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { calculateSchemeAnalytics, calculateAging, estimatePatientCost } from "@/lib/healthbridge/analytics";
import { formatZAR } from "@/lib/healthbridge/codes";
import type { ClaimRecord } from "@/lib/healthbridge/analytics";

/** GET /api/healthbridge/analytics — Scheme-specific revenue analytics + aging report
 * The feature no SA PMS does well. Shows:
 * - Revenue breakdown per medical aid scheme
 * - Acceptance/rejection rates per scheme
 * - Average days to payment per scheme
 * - Outstanding claims aging (30/60/90/120+ days)
 * - Collection rate analysis
 */
export async function GET(request: Request) {
  const guard = await guardRoute(request, "healthbridge-analytics");
  if (isErrorResponse(guard)) return guard;

  const url = new URL(request.url);
  const period = url.searchParams.get("period") || "all"; // all | month | quarter | year

  let claims: ClaimRecord[];

  if (isDemoMode) {
    claims = demoClaimsForAnalytics;
  } else {
    const { prisma } = await import("@/lib/prisma");
    const where: Record<string, unknown> = { practiceId: guard.practiceId };

    // Date filter
    if (period !== "all") {
      const now = new Date();
      const startDate = new Date();
      if (period === "month") startDate.setMonth(now.getMonth() - 1);
      else if (period === "quarter") startDate.setMonth(now.getMonth() - 3);
      else if (period === "year") startDate.setFullYear(now.getFullYear() - 1);
      where.createdAt = { gte: startDate };
    }

    const rawClaims = await prisma.healthbridgeClaim.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    claims = rawClaims.map((c) => ({
      id: c.id,
      patientName: c.patientName,
      medicalAidScheme: c.medicalAidScheme,
      totalAmount: c.totalAmount,
      approvedAmount: c.approvedAmount,
      paidAmount: c.paidAmount,
      status: c.status,
      dateOfService: c.dateOfService,
      submittedAt: c.submittedAt?.toISOString() || null,
      respondedAt: c.respondedAt?.toISOString() || null,
      reconciledAt: c.reconciledAt?.toISOString() || null,
      rejectionCode: c.rejectionCode,
      rejectionReason: c.rejectionReason,
    }));
  }

  const schemeAnalytics = calculateSchemeAnalytics(claims);
  const aging = calculateAging(claims);

  // Summary totals
  const totalBilled = claims.reduce((sum, c) => sum + c.totalAmount, 0);
  const totalPaid = claims.reduce((sum, c) => sum + c.paidAmount, 0);
  const totalOutstanding = totalBilled - totalPaid;
  const overallCollectionRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0;

  return NextResponse.json({
    period,
    summary: {
      totalClaims: claims.length,
      totalBilled: formatZAR(totalBilled),
      totalPaid: formatZAR(totalPaid),
      totalOutstanding: formatZAR(totalOutstanding),
      collectionRate: `${overallCollectionRate}%`,
      totalBilledCents: totalBilled,
      totalPaidCents: totalPaid,
      totalOutstandingCents: totalOutstanding,
    },
    schemeAnalytics,
    aging,
  });
}

/** POST /api/healthbridge/analytics — Patient cost estimate (pre-consultation) */
export async function POST(request: Request) {
  const guard = await guardRoute(request, "healthbridge-analytics");
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();

  if (body.action === "estimate") {
    const estimate = estimatePatientCost({
      lineItems: body.lineItems || [],
      schemeRate: body.schemeRate || 100, // default: scheme pays 100% of tariff
      hasGapCover: body.hasGapCover || false,
      gapCoverMultiple: body.gapCoverMultiple || 3,
    });

    return NextResponse.json({ estimate });
  }

  return NextResponse.json({ error: "Invalid action. Use action: 'estimate'" }, { status: 400 });
}

// Realistic demo data for analytics
const demoClaimsForAnalytics: ClaimRecord[] = [
  // Discovery Health — high volume, good acceptance
  { id: "hbc-a1", patientName: "John Mokoena", medicalAidScheme: "Discovery Health", totalAmount: 87000, approvedAmount: 87000, paidAmount: 87000, status: "paid", dateOfService: "2026-03-01", submittedAt: "2026-03-01T10:00:00Z", respondedAt: "2026-03-01T10:00:02Z", reconciledAt: "2026-03-12T14:00:00Z", rejectionCode: "", rejectionReason: "" },
  { id: "hbc-a2", patientName: "Sarah van der Merwe", medicalAidScheme: "Discovery Health", totalAmount: 52000, approvedAmount: 52000, paidAmount: 52000, status: "paid", dateOfService: "2026-03-05", submittedAt: "2026-03-05T11:00:00Z", respondedAt: "2026-03-05T11:00:01Z", reconciledAt: "2026-03-15T14:00:00Z", rejectionCode: "", rejectionReason: "" },
  { id: "hbc-a3", patientName: "Lindiwe Dlamini", medicalAidScheme: "Discovery Health", totalAmount: 138000, approvedAmount: 138000, paidAmount: 0, status: "pending_payment", dateOfService: "2026-03-18", submittedAt: "2026-03-18T09:00:00Z", respondedAt: "2026-03-18T09:00:02Z", reconciledAt: null, rejectionCode: "", rejectionReason: "" },
  { id: "hbc-a4", patientName: "Peter Kruger", medicalAidScheme: "Discovery Health", totalAmount: 95000, approvedAmount: 0, paidAmount: 0, status: "rejected", dateOfService: "2026-03-10", submittedAt: "2026-03-10T14:00:00Z", respondedAt: "2026-03-10T14:00:03Z", reconciledAt: null, rejectionCode: "08", rejectionReason: "Pre-authorization required but not provided" },
  // GEMS — moderate volume, strict rules
  { id: "hbc-a5", patientName: "Thabo Molefe", medicalAidScheme: "GEMS", totalAmount: 84500, approvedAmount: 84500, paidAmount: 84500, status: "paid", dateOfService: "2026-03-03", submittedAt: "2026-03-03T09:00:00Z", respondedAt: "2026-03-03T09:00:02Z", reconciledAt: "2026-03-18T10:00:00Z", rejectionCode: "", rejectionReason: "" },
  { id: "hbc-a6", patientName: "Nomsa Khumalo", medicalAidScheme: "GEMS", totalAmount: 52000, approvedAmount: 0, paidAmount: 0, status: "rejected", dateOfService: "2026-03-08", submittedAt: "2026-03-08T10:00:00Z", respondedAt: "2026-03-08T10:00:01Z", reconciledAt: null, rejectionCode: "05", rejectionReason: "ICD-10 code invalid or not covered" },
  { id: "hbc-a7", patientName: "David Sibiya", medicalAidScheme: "GEMS", totalAmount: 65000, approvedAmount: 65000, paidAmount: 0, status: "accepted", dateOfService: "2026-03-15", submittedAt: "2026-03-15T11:00:00Z", respondedAt: "2026-03-15T11:00:02Z", reconciledAt: null, rejectionCode: "", rejectionReason: "" },
  // Bonitas — moderate, some shortfalls
  { id: "hbc-a8", patientName: "Priya Naidoo", medicalAidScheme: "Bonitas", totalAmount: 95000, approvedAmount: 85000, paidAmount: 85000, status: "short_paid", dateOfService: "2026-03-02", submittedAt: "2026-03-02T10:00:00Z", respondedAt: "2026-03-02T10:00:02Z", reconciledAt: "2026-03-14T14:00:00Z", rejectionCode: "", rejectionReason: "" },
  { id: "hbc-a9", patientName: "Ahmed Patel", medicalAidScheme: "Bonitas", totalAmount: 146000, approvedAmount: 146000, paidAmount: 146000, status: "paid", dateOfService: "2026-03-06", submittedAt: "2026-03-06T09:00:00Z", respondedAt: "2026-03-06T09:00:01Z", reconciledAt: "2026-03-17T10:00:00Z", rejectionCode: "", rejectionReason: "" },
  // Medihelp
  { id: "hbc-a10", patientName: "Zanele Mthembu", medicalAidScheme: "Medihelp", totalAmount: 52000, approvedAmount: 52000, paidAmount: 52000, status: "paid", dateOfService: "2026-03-04", submittedAt: "2026-03-04T10:00:00Z", respondedAt: "2026-03-04T10:00:01Z", reconciledAt: "2026-03-16T14:00:00Z", rejectionCode: "", rejectionReason: "" },
  // Older claims for aging
  { id: "hbc-a11", patientName: "Sipho Ndlovu", medicalAidScheme: "Discovery Health", totalAmount: 78000, approvedAmount: 78000, paidAmount: 0, status: "pending_payment", dateOfService: "2026-02-01", submittedAt: "2026-02-01T10:00:00Z", respondedAt: "2026-02-01T10:00:02Z", reconciledAt: null, rejectionCode: "", rejectionReason: "" },
  { id: "hbc-a12", patientName: "Grace Motaung", medicalAidScheme: "Bonitas", totalAmount: 63000, approvedAmount: 0, paidAmount: 0, status: "rejected", dateOfService: "2026-01-15", submittedAt: "2026-01-15T09:00:00Z", respondedAt: "2026-01-15T09:00:03Z", reconciledAt: null, rejectionCode: "12", rejectionReason: "Late submission (>4 months from date of service)" },
];
