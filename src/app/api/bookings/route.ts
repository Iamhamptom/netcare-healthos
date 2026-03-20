import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoStore } from "@/lib/demo-data";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { sanitize, clampInt } from "@/lib/validate";

export async function GET(request: Request) {
  const guard = await guardRoute(request, "bookings");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) return NextResponse.json({ bookings: demoStore.getBookings() });

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = clampInt(parseInt(searchParams.get("limit") || "100", 10) || 100, 1, 100) ?? 100;
  const skip = (page - 1) * limit;

  const { prisma } = await import("@/lib/prisma");
  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({ where: { practiceId: guard.practiceId }, orderBy: { scheduledAt: "asc" }, take: limit, skip }),
    prisma.booking.count({ where: { practiceId: guard.practiceId } }),
  ]);
  return NextResponse.json({ bookings, total, page, limit });
}

export async function POST(request: Request) {
  const guard = await guardRoute(request, "bookings");
  if (isErrorResponse(guard)) return guard;
  const body = await request.json();
  const patientName = body.patientName?.trim();
  const service = body.service?.trim();
  const scheduledAt = body.scheduledAt;

  if (!patientName || !service || !scheduledAt) {
    return NextResponse.json({ error: "Patient name, service, and date are required" }, { status: 400 });
  }

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
