import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

// POST — push a booking to Google Calendar
export async function POST(request: Request) {
  const guard = await guardRoute(request, "google/calendar", { limit: 20 });
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  const { bookingId, accessToken, calendarId } = body;

  if (!accessToken || !calendarId) {
    return NextResponse.json({ error: "Google Calendar not connected. Add your access token and calendar ID in Settings." }, { status: 400 });
  }

  if (isDemoMode) {
    return NextResponse.json({
      success: true,
      eventId: "demo-gcal-" + Date.now(),
      htmlLink: "https://calendar.google.com",
      message: "[DEMO] Would sync booking to Google Calendar",
    });
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.practiceId !== guard.practiceId) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const practice = await prisma.practice.findUnique({ where: { id: guard.practiceId } });

    const { createCalendarEvent } = await import("@/lib/google");
    const startTime = new Date(booking.scheduledAt);
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30-min default

    const result = await createCalendarEvent(accessToken, calendarId, {
      summary: `${booking.service} — ${booking.patientName}`,
      description: `Booking via Netcare Health OS Ops\nPatient: ${booking.patientName}\nService: ${booking.service}\nNotes: ${booking.notes || "None"}`,
      start: { dateTime: startTime.toISOString(), timeZone: "Africa/Johannesburg" },
      end: { dateTime: endTime.toISOString(), timeZone: "Africa/Johannesburg" },
      location: practice?.address || "",
    });

    if (!result) {
      return NextResponse.json({ error: "Failed to create calendar event. Check your access token." }, { status: 500 });
    }

    return NextResponse.json({ success: true, eventId: result.id, htmlLink: result.htmlLink });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Calendar sync failed" }, { status: 500 });
  }
}

// GET — list Google Calendar events for a date range
export async function GET(request: Request) {
  const guard = await guardRoute(request, "google/calendar", { limit: 20 });
  if (isErrorResponse(guard)) return guard;

  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get("accessToken");
  const calendarId = searchParams.get("calendarId") || "primary";
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

  if (!accessToken) {
    return NextResponse.json({ error: "Google Calendar not connected" }, { status: 400 });
  }

  if (isDemoMode) {
    return NextResponse.json({
      events: [
        { id: "demo-1", summary: "Dental Cleaning — Maria Santos", start: `${date}T09:00:00`, end: `${date}T09:30:00` },
        { id: "demo-2", summary: "Check-up — James Khumalo", start: `${date}T10:00:00`, end: `${date}T10:30:00` },
        { id: "demo-3", summary: "Root Canal — Aisha Patel", start: `${date}T14:00:00`, end: `${date}T15:00:00` },
      ],
    });
  }

  try {
    const { listCalendarEvents } = await import("@/lib/google");
    const events = await listCalendarEvents(
      accessToken,
      calendarId,
      `${date}T00:00:00+02:00`,
      `${date}T23:59:59+02:00`
    );

    return NextResponse.json({ events });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to fetch calendar" }, { status: 500 });
  }
}
