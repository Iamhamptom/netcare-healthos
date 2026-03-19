import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoStore } from "@/lib/demo-data";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { sanitize } from "@/lib/validate";

export async function GET(request: Request) {
  const guard = await guardRoute(request, "bookings");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) return NextResponse.json({ bookings: demoStore.getBookings() });

  const { prisma } = await import("@/lib/prisma");
  const bookings = await prisma.booking.findMany({ where: { practiceId: guard.practiceId }, orderBy: { scheduledAt: "asc" } });
  return NextResponse.json({ bookings });
}

export async function POST(request: Request) {
  const guard = await guardRoute(request, "bookings");
  if (isErrorResponse(guard)) return guard;
  const body = await request.json();

  if (isDemoMode) {
    const booking = demoStore.addBooking(body);
    return NextResponse.json({ booking });
  }

  const { prisma } = await import("@/lib/prisma");
  const booking = await prisma.booking.create({
    data: {
      patientName: sanitize(body.patientName),
      patientPhone: sanitize(body.patientPhone || ""),
      patientEmail: sanitize(body.patientEmail || ""),
      service: sanitize(body.service),
      scheduledAt: new Date(body.scheduledAt),
      notes: sanitize(body.notes || ""),
      source: body.source || "dashboard",
      practiceId: guard.practiceId,
    },
  });
  return NextResponse.json({ booking });
}
