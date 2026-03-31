/**
 * POST /api/checkin/from-bookings
 * Auto-populate today's check-in queue from confirmed bookings.
 * Creates waiting entries for all today's confirmed appointments.
 */

import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

export async function POST(request: Request) {
  const guard = await guardRoute(request, "checkin-from-bookings", { limit: 5 });
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({
      imported: 4,
      message: "[DEMO] 4 bookings imported to check-in queue",
      bookings: [
        { patientName: "Sarah Naidoo", time: "09:00", service: "GP Consultation" },
        { patientName: "Thabo Mokoena", time: "09:30", service: "Follow-up" },
        { patientName: "Priya Govender", time: "10:00", service: "Chronic Script" },
        { patientName: "David Kruger", time: "10:30", service: "Lab Review" },
      ],
    });
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's confirmed bookings
    const bookings = await prisma.booking.findMany({
      where: {
        practiceId: guard.practiceId,
        status: "confirmed",
        scheduledAt: { gte: today, lt: tomorrow },
      },
      orderBy: { scheduledAt: "asc" },
    });

    // Check which are already in the check-in queue
    const existingCheckIns = await prisma.checkIn.findMany({
      where: { practiceId: guard.practiceId, createdAt: { gte: today } },
      select: { patientName: true },
    });
    const existingNames = new Set(existingCheckIns.map(c => c.patientName.toLowerCase()));

    // Create check-in entries for missing bookings
    const newCheckIns = [];
    for (const booking of bookings) {
      const name = (booking as Record<string, unknown>).patientName as string || "Unknown";
      if (!existingNames.has(name.toLowerCase())) {
        const ci = await prisma.checkIn.create({
          data: {
            patientName: name,
            patientId: (booking as Record<string, unknown>).patientId as string || "",
            notes: `Booked: ${(booking as Record<string, unknown>).service || "Appointment"}`,
            practiceId: guard.practiceId,
            status: "expected",
          },
        });
        newCheckIns.push(ci);
      }
    }

    return NextResponse.json({
      imported: newCheckIns.length,
      total: bookings.length,
      alreadyCheckedIn: existingNames.size,
    });
  } catch (err) {
    console.error("[checkin/from-bookings] Error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Import failed" }, { status: 500 });
  }
}
