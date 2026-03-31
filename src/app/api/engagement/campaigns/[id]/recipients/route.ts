import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

/** GET /api/engagement/campaigns/[id]/recipients — List campaign recipients */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardRoute(request, "engagement-campaign-recipients");
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;

  if (isDemoMode) {
    return NextResponse.json({
      recipients: [
        { id: "r1", patientName: "Thandi Molefe", phone: "+27821234567", status: "delivered", sentAt: "2026-03-20T10:00:00Z" },
        { id: "r2", patientName: "Johannes van der Merwe", phone: "+27839876543", status: "responded", sentAt: "2026-03-20T10:01:00Z", response: "BOOK" },
        { id: "r3", patientName: "Naledi Dlamini", phone: "+27847654321", status: "booked", sentAt: "2026-03-20T10:02:00Z" },
      ],
      total: 3,
    });
  }

  const { prisma } = await import("@/lib/prisma");
  const recipients = await prisma.campaignRecipient.findMany({
    where: { campaignId: id, campaign: { practiceId: guard.practiceId } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ recipients, total: recipients.length });
}
