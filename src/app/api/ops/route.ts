import { NextRequest, NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { isDemoMode } from "@/lib/is-demo";
// Direct prisma import: OpsDocument model is Prisma-only, not yet in Supabase db abstraction
import { prisma } from "@/lib/prisma";

/** GET /api/ops — Fetch operations documents */
export async function GET(request: NextRequest) {
  const guard = await guardRoute(request, "ops");
  if (isErrorResponse(guard)) return guard;

  const category = request.nextUrl.searchParams.get("category");

  if (isDemoMode) {
    return NextResponse.json({ documents: [], stats: {} });
  }

  const where: Record<string, unknown> = { practiceId: guard.practiceId };
  if (category && category !== "all") where.category = category;

  const documents = await prisma.opsDocument.findMany({
    where,
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  });

  // Get stats
  const referralCount = await prisma.referral.count({
    where: { practiceId: guard.practiceId },
  });
  const pendingReferrals = await prisma.referral.count({
    where: { practiceId: guard.practiceId, status: "pending" },
  });
  const totalBookings = await prisma.booking.count({
    where: { practiceId: guard.practiceId },
  });
  const bookingsBySource = await prisma.booking.groupBy({
    by: ["leadSource"],
    where: { practiceId: guard.practiceId, leadSource: { not: "" } },
    _count: true,
  });

  return NextResponse.json({
    documents,
    stats: {
      referralCount,
      pendingReferrals,
      totalBookings,
      bookingsBySource,
      opsDocuments: documents.length,
    },
  });
}
