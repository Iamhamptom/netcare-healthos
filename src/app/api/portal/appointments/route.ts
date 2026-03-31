import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardPatientRoute, isPatientErrorResponse } from "@/lib/patient-auth";

/** GET /api/portal/appointments — Get patient's upcoming appointments */
export async function GET(request: Request) {
  const guard = await guardPatientRoute(request, "appointments");
  if (isPatientErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({
      appointments: [
        { id: "b1", service: "GP Consultation", scheduledAt: new Date(Date.now() + 3 * 86400000).toISOString(), status: "confirmed", practiceName: "Medicross Sandton" },
        { id: "b2", service: "Blood Test (HbA1c)", scheduledAt: new Date(Date.now() + 7 * 86400000).toISOString(), status: "pending", practiceName: "Medicross Sandton" },
      ],
    });
  }

  const { prisma } = await import("@/lib/prisma");

  // Get patient's phone to match bookings
  const patient = await prisma.patient.findUnique({
    where: { id: guard.patientId },
    select: { phone: true, name: true, email: true },
  });

  if (!patient) return NextResponse.json({ appointments: [] });

  const bookings = await prisma.booking.findMany({
    where: {
      practiceId: guard.practiceId,
      OR: [
        { patientPhone: patient.phone },
        { patientEmail: patient.email || "impossible-match" },
      ],
      scheduledAt: { gte: new Date(Date.now() - 30 * 86400000) }, // Last 30 days + future
    },
    include: { practice: { select: { name: true, address: true, phone: true } } },
    orderBy: { scheduledAt: "desc" },
    take: 20,
  });

  return NextResponse.json({
    appointments: bookings.map((b) => ({
      id: b.id,
      service: b.service,
      scheduledAt: b.scheduledAt,
      status: b.status,
      practiceName: b.practice.name,
      practiceAddress: b.practice.address,
      practicePhone: b.practice.phone,
      notes: b.notes,
    })),
  });
}

/** POST /api/portal/appointments — Patient self-books an appointment */
export async function POST(request: Request) {
  const guard = await guardPatientRoute(request, "appointments", { limit: 5 });
  if (isPatientErrorResponse(guard)) return guard;

  const { service, date, time } = await request.json();
  if (!service || !date || !time) {
    return NextResponse.json({ error: "Service, date, and time are required" }, { status: 400 });
  }

  if (isDemoMode) {
    return NextResponse.json({
      booking: { id: "demo-booking", service, scheduledAt: `${date}T${time}:00`, status: "pending" },
      message: "Your booking request has been submitted. The practice will confirm shortly.",
    });
  }

  const { prisma } = await import("@/lib/prisma");
  const patient = await prisma.patient.findUnique({
    where: { id: guard.patientId },
    select: { name: true, phone: true, email: true },
  });

  if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

  const scheduledAt = new Date(`${date}T${time}:00`);
  if (isNaN(scheduledAt.getTime())) {
    return NextResponse.json({ error: "Invalid date/time" }, { status: 400 });
  }

  const booking = await prisma.booking.create({
    data: {
      patientName: patient.name,
      patientPhone: patient.phone,
      patientEmail: patient.email,
      service,
      scheduledAt,
      status: "pending",
      source: "portal",
      practiceId: guard.practiceId,
    },
  });

  return NextResponse.json({
    booking: { id: booking.id, service: booking.service, scheduledAt: booking.scheduledAt, status: booking.status },
    message: "Your booking request has been submitted. The practice will confirm shortly.",
  });
}
