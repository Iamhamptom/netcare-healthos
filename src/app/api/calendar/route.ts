import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoStore } from "@/lib/demo-data";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

/** GET /api/calendar — Get bookings for calendar view with date range */
export async function GET(request: Request) {
  const guard = await guardRoute(request, "calendar");
  if (isErrorResponse(guard)) return guard;

  const url = new URL(request.url);
  const startStr = url.searchParams.get("start");
  const endStr = url.searchParams.get("end");
  const view = url.searchParams.get("view") || "week"; // day | week | month

  // Default to current week
  const now = new Date();
  const start = startStr ? new Date(startStr) : getWeekStart(now);
  const end = endStr ? new Date(endStr) : getWeekEnd(now);

  if (isDemoMode) {
    const bookings = demoStore.getBookings().filter(b => {
      const d = new Date(b.scheduledAt);
      return d >= start && d <= end;
    });

    return NextResponse.json({
      bookings: bookings.map(b => ({
        ...b,
        color: statusColor(b.status),
      })),
      view,
      range: { start: start.toISOString(), end: end.toISOString() },
      slots: generateSlots(start, end, bookings),
    });
  }

  const { prisma } = await import("@/lib/prisma");
  const bookings = await prisma.booking.findMany({
    where: {
      practiceId: guard.practiceId,
      scheduledAt: { gte: start, lte: end },
    },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json({
    bookings: bookings.map(b => ({ ...b, color: statusColor(b.status) })),
    view,
    range: { start: start.toISOString(), end: end.toISOString() },
    slots: generateSlots(start, end, bookings),
  });
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1)); // Monday
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekEnd(date: Date): Date {
  const d = getWeekStart(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

function statusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "#f59e0b",
    confirmed: "#10b981",
    cancelled: "#ef4444",
    completed: "#0ea5e9",
  };
  return colors[status] || "#6b7280";
}

/** Generate available time slots for the date range */
function generateSlots(
  start: Date,
  end: Date,
  bookings: { scheduledAt: Date | string; status: string }[]
): { date: string; time: string; available: boolean }[] {
  const slots: { date: string; time: string; available: boolean }[] = [];
  const bookedTimes = new Set(
    bookings
      .filter(b => b.status !== "cancelled")
      .map(b => new Date(b.scheduledAt).toISOString())
  );

  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    // Practice hours: Mon-Fri 8-17, Sat 8-13
    if (dayOfWeek >= 1 && dayOfWeek <= 6) {
      const maxHour = dayOfWeek === 6 ? 13 : 17;
      for (let hour = 8; hour < maxHour; hour++) {
        for (const min of [0, 30]) {
          const slotTime = new Date(current);
          slotTime.setHours(hour, min, 0, 0);
          slots.push({
            date: slotTime.toISOString().split("T")[0],
            time: `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`,
            available: !bookedTimes.has(slotTime.toISOString()),
          });
        }
      }
    }
    current.setDate(current.getDate() + 1);
  }

  return slots;
}
