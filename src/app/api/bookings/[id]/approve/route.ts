import { NextResponse } from "next/server";
import { guardRoute } from "@/lib/api-helpers";
import { isDemoMode } from "@/lib/is-demo";
import { prisma } from "@/lib/prisma";
import { approveBooking, rejectBooking } from "@/lib/booking-engine";

/** POST /api/bookings/[id]/approve — Approve or reject a booking */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardRoute(request, "bookings/approve");
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const body = await request.json();
  const action = body.action as string; // "approve" | "reject"
  const reason = String(body.reason || "").slice(0, 500);

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid action. Use 'approve' or 'reject'" }, { status: 400 });
  }

  // Demo mode
  if (isDemoMode) {
    return NextResponse.json({
      booking: { id, status: action === "approve" ? "confirmed" : "cancelled" },
      message: action === "approve" ? "Booking confirmed! Patient will be notified." : "Booking rejected.",
    });
  }

  // Verify ownership
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking || booking.practiceId !== guard.practiceId) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.status !== "pending") {
    return NextResponse.json({ error: `Booking is already ${booking.status}` }, { status: 400 });
  }

  if (action === "approve") {
    const updated = await approveBooking(id, guard.user.id);
    return NextResponse.json({
      booking: updated,
      message: "Booking confirmed! Patient has been notified via WhatsApp and email.",
    });
  } else {
    const updated = await rejectBooking(id, reason);
    return NextResponse.json({
      booking: updated,
      message: "Booking rejected. Patient has been notified.",
    });
  }
}
