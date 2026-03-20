import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { generateFollowUps } from "@/lib/healthbridge/ai-followup";
import type { ClaimRecord } from "@/lib/healthbridge/analytics";

/** GET /api/healthbridge/followups — Generate follow-up actions for all outstanding claims
 * Returns prioritized follow-up actions with draft emails and scheme contacts.
 */
export async function GET(request: Request) {
  const guard = await guardRoute(request, "healthbridge-followups");
  if (isErrorResponse(guard)) return guard;

  let claims: ClaimRecord[];

  if (isDemoMode) {
    claims = demoOutstandingClaims;
  } else {
    const { prisma } = await import("@/lib/prisma");
    const rawClaims = await prisma.healthbridgeClaim.findMany({
      where: {
        practiceId: guard.practiceId,
        status: { in: ["submitted", "accepted", "partial", "pending_payment", "short_paid", "rejected", "resubmitted"] },
      },
      orderBy: { createdAt: "asc" },
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

  const followUps = await generateFollowUps(claims);

  const summary = {
    total: followUps.length,
    critical: followUps.filter((f) => f.urgency === "critical").length,
    high: followUps.filter((f) => f.urgency === "high").length,
    medium: followUps.filter((f) => f.urgency === "medium").length,
    low: followUps.filter((f) => f.urgency === "low").length,
  };

  return NextResponse.json({ followUps, summary });
}

/** POST /api/healthbridge/followups — Generate follow-ups for specific claim IDs */
export async function POST(request: Request) {
  const guard = await guardRoute(request, "healthbridge-followups");
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  const claimIds: string[] = body.claimIds || [];

  if (!claimIds.length) {
    return NextResponse.json(
      { error: "claimIds array is required" },
      { status: 400 }
    );
  }

  let claims: ClaimRecord[];

  if (isDemoMode) {
    claims = demoOutstandingClaims.filter((c) => claimIds.includes(c.id));
  } else {
    const { prisma } = await import("@/lib/prisma");
    const rawClaims = await prisma.healthbridgeClaim.findMany({
      where: {
        practiceId: guard.practiceId,
        id: { in: claimIds },
      },
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

  if (claims.length === 0) {
    return NextResponse.json(
      { error: "No claims found for the provided IDs" },
      { status: 404 }
    );
  }

  const followUps = await generateFollowUps(claims);

  return NextResponse.json({ followUps, claimsProcessed: claims.length });
}

// Realistic demo data for follow-up generation
const demoOutstandingClaims: ClaimRecord[] = [
  // 120+ days — critical
  {
    id: "hbc-f1", patientName: "Grace Motaung", medicalAidScheme: "Bonitas",
    totalAmount: 63000, approvedAmount: 0, paidAmount: 0, status: "rejected",
    dateOfService: "2025-11-15", submittedAt: "2025-11-15T09:00:00Z",
    respondedAt: "2025-11-15T09:00:03Z", reconciledAt: null,
    rejectionCode: "12", rejectionReason: "Late submission (>4 months from date of service)",
  },
  // 90+ days — high
  {
    id: "hbc-f2", patientName: "Sipho Ndlovu", medicalAidScheme: "Discovery Health",
    totalAmount: 138000, approvedAmount: 138000, paidAmount: 0, status: "pending_payment",
    dateOfService: "2025-12-10", submittedAt: "2025-12-10T10:00:00Z",
    respondedAt: "2025-12-10T10:00:02Z", reconciledAt: null,
    rejectionCode: "", rejectionReason: "",
  },
  // 60+ days — medium
  {
    id: "hbc-f3", patientName: "Nomsa Khumalo", medicalAidScheme: "GEMS",
    totalAmount: 52000, approvedAmount: 0, paidAmount: 0, status: "rejected",
    dateOfService: "2026-01-08", submittedAt: "2026-01-08T10:00:00Z",
    respondedAt: "2026-01-08T10:00:01Z", reconciledAt: null,
    rejectionCode: "05", rejectionReason: "ICD-10 code invalid or not covered",
  },
  // 30+ days — low
  {
    id: "hbc-f4", patientName: "David Sibiya", medicalAidScheme: "GEMS",
    totalAmount: 65000, approvedAmount: 65000, paidAmount: 0, status: "accepted",
    dateOfService: "2026-02-15", submittedAt: "2026-02-15T11:00:00Z",
    respondedAt: "2026-02-15T11:00:02Z", reconciledAt: null,
    rejectionCode: "", rejectionReason: "",
  },
  // Recent — monitor
  {
    id: "hbc-f5", patientName: "Lindiwe Dlamini", medicalAidScheme: "Discovery Health",
    totalAmount: 95000, approvedAmount: 95000, paidAmount: 0, status: "pending_payment",
    dateOfService: "2026-03-10", submittedAt: "2026-03-10T09:00:00Z",
    respondedAt: "2026-03-10T09:00:02Z", reconciledAt: null,
    rejectionCode: "", rejectionReason: "",
  },
  // Short-paid
  {
    id: "hbc-f6", patientName: "Priya Naidoo", medicalAidScheme: "Medihelp",
    totalAmount: 95000, approvedAmount: 85000, paidAmount: 70000, status: "short_paid",
    dateOfService: "2026-02-02", submittedAt: "2026-02-02T10:00:00Z",
    respondedAt: "2026-02-02T10:00:02Z", reconciledAt: "2026-02-20T14:00:00Z",
    rejectionCode: "", rejectionReason: "",
  },
];
