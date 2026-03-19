import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoStore } from "@/lib/demo-data";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

const VALID_STATUSES = ["pending", "confirmed", "completed", "cancelled", "no_show"];

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardRoute(request, "bookings/id");
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;
  if (isDemoMode) {
    const b = demoStore.getBookings().find(x => x.id === id);
    return b ? NextResponse.json({ booking: b }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { prisma } = await import("@/lib/prisma");
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (booking.practiceId !== guard.practiceId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ booking });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardRoute(request, "bookings/id");
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;
  const body = await request.json();

  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  if (isDemoMode) {
    const booking = demoStore.updateBooking(id, body);
    return NextResponse.json({ booking });
  }

  const { prisma } = await import("@/lib/prisma");
  const existing = await prisma.booking.findUnique({ where: { id } });
  if (!existing || existing.practiceId !== guard.practiceId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const booking = await prisma.booking.update({ where: { id }, data: { ...(body.status && { status: body.status }) } });
  return NextResponse.json({ booking });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardRoute(request, "bookings/id");
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;
  if (isDemoMode) { demoStore.deleteBooking(id); return NextResponse.json({ ok: true }); }

  const { prisma } = await import("@/lib/prisma");
  const existing = await prisma.booking.findUnique({ where: { id } });
  if (!existing || existing.practiceId !== guard.practiceId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.booking.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
