import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { isDemoMode } from "@/lib/is-demo";
import { db } from "@/lib/db";
import {
  graphRequest,
  getValidAccessToken,
  getMicrosoftConfig,
  parseIntegrations,
} from "@/lib/microsoft";
import { logger } from "@/lib/logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CalendarEventBody {
  subject: string;
  startDateTime: string; // ISO 8601
  endDateTime: string;   // ISO 8601
  timeZone?: string;
  location?: string;
  body?: string;
  attendees?: string[];
}

interface OutlookEvent {
  id: string;
  subject: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location: { displayName: string } | null;
  bodyPreview: string;
  webLink: string;
  organizer: { emailAddress: { name: string; address: string } };
}

interface CalendarViewResponse {
  value: OutlookEvent[];
}

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const DEMO_EVENTS: OutlookEvent[] = [
  {
    id: "demo-evt-1",
    subject: "Morning Huddle — Medicross Sandton",
    start: { dateTime: new Date().toISOString(), timeZone: "Africa/Johannesburg" },
    end: { dateTime: new Date(Date.now() + 30 * 60000).toISOString(), timeZone: "Africa/Johannesburg" },
    location: { displayName: "Medicross Sandton City" },
    bodyPreview: "Daily standup with clinic staff",
    webLink: "https://outlook.office365.com/calendar",
    organizer: { emailAddress: { name: "Sara Nayager", address: "sara.nayager@netcare.co.za" } },
  },
  {
    id: "demo-evt-2",
    subject: "Claims Review — Discovery Health",
    start: { dateTime: new Date(Date.now() + 2 * 3600000).toISOString(), timeZone: "Africa/Johannesburg" },
    end: { dateTime: new Date(Date.now() + 3 * 3600000).toISOString(), timeZone: "Africa/Johannesburg" },
    location: { displayName: "Virtual — Microsoft Teams" },
    bodyPreview: "Monthly claims rejection analysis with Discovery Health scheme liaison",
    webLink: "https://outlook.office365.com/calendar",
    organizer: { emailAddress: { name: "Sara Nayager", address: "sara.nayager@netcare.co.za" } },
  },
  {
    id: "demo-evt-3",
    subject: "Netcare FD Review — Q1 Performance",
    start: { dateTime: new Date(Date.now() + 24 * 3600000).toISOString(), timeZone: "Africa/Johannesburg" },
    end: { dateTime: new Date(Date.now() + 25 * 3600000).toISOString(), timeZone: "Africa/Johannesburg" },
    location: { displayName: "Netcare Head Office, Sandton" },
    bodyPreview: "Quarterly financial review with Thirushen Pillay",
    webLink: "https://outlook.office365.com/calendar",
    organizer: { emailAddress: { name: "Thirushen Pillay", address: "thirushen.pillay@netcare.co.za" } },
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function savePracticeIntegrations(practiceId: string, integrations: Record<string, unknown>) {
  await db.updatePractice(practiceId, { integrations: JSON.stringify(integrations) });
}

// ---------------------------------------------------------------------------
// GET — Fetch upcoming calendar events
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  const guard = await guardRoute(request, "microsoft-calendar", {
    roles: ["admin", "platform_admin"],
  });
  if (isErrorResponse(guard)) return guard;

  try {
    if (isDemoMode || !process.env.MICROSOFT_CLIENT_ID) {
      return NextResponse.json({ events: DEMO_EVENTS, demo: true });
    }

    const practice = await db.getPractice(guard.practiceId) as Record<string, unknown> | null;

    const integrations = parseIntegrations((practice?.integrations as string) ?? "{}");
    const msConfig = getMicrosoftConfig(integrations);

    if (!msConfig) {
      return NextResponse.json({ events: DEMO_EVENTS, demo: true, reason: "not_connected" });
    }

    if (!msConfig.microsoftCalendarSync) {
      return NextResponse.json({ events: [], syncing: false });
    }

    // Get valid token (auto-refresh if needed)
    const { accessToken, updatedIntegrations, didRefresh } =
      await getValidAccessToken(integrations);

    if (didRefresh) {
      await savePracticeIntegrations(guard.practiceId, updatedIntegrations);
    }

    // Fetch events for the next 7 days
    const url = new URL(request.url);
    const startParam = url.searchParams.get("start");
    const endParam = url.searchParams.get("end");

    const start = startParam || new Date().toISOString();
    const end =
      endParam ||
      new Date(Date.now() + 7 * 24 * 3600000).toISOString();

    const result = await graphRequest<CalendarViewResponse>(
      `/me/calendarView?startDateTime=${encodeURIComponent(start)}&endDateTime=${encodeURIComponent(end)}&$orderby=start/dateTime&$top=50`,
      accessToken,
    );

    if (!result.ok) {
      logger.error("[microsoft] Calendar fetch failed", { status: String(result.status) });
      return NextResponse.json(
        { error: "Failed to fetch calendar events", events: DEMO_EVENTS, demo: true },
        { status: 502 },
      );
    }

    return NextResponse.json({ events: result.data.value ?? [], demo: false });
  } catch (err) {
    logger.error("[microsoft] Calendar GET error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST — Create a calendar event (e.g., when a booking is created)
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  const guard = await guardRoute(request, "microsoft-calendar-create", {
    roles: ["admin", "platform_admin"],
  });
  if (isErrorResponse(guard)) return guard;

  try {
    const body: CalendarEventBody = await request.json();

    if (!body.subject || !body.startDateTime || !body.endDateTime) {
      return NextResponse.json(
        { error: "Missing required fields: subject, startDateTime, endDateTime" },
        { status: 400 },
      );
    }

    if (isDemoMode || !process.env.MICROSOFT_CLIENT_ID) {
      return NextResponse.json({
        id: `demo-created-${Date.now()}`,
        subject: body.subject,
        start: { dateTime: body.startDateTime, timeZone: body.timeZone || "Africa/Johannesburg" },
        end: { dateTime: body.endDateTime, timeZone: body.timeZone || "Africa/Johannesburg" },
        demo: true,
      });
    }

    const practice = await db.getPractice(guard.practiceId) as Record<string, unknown> | null;

    const integrations = parseIntegrations((practice?.integrations as string) ?? "{}");
    const { accessToken, updatedIntegrations, didRefresh } =
      await getValidAccessToken(integrations);

    if (didRefresh) {
      await savePracticeIntegrations(guard.practiceId, updatedIntegrations);
    }

    const timeZone = body.timeZone || "Africa/Johannesburg";

    const eventPayload: Record<string, unknown> = {
      subject: body.subject,
      start: { dateTime: body.startDateTime, timeZone },
      end: { dateTime: body.endDateTime, timeZone },
      body: {
        contentType: "HTML",
        content: body.body || "",
      },
    };

    if (body.location) {
      eventPayload.location = { displayName: body.location };
    }

    if (body.attendees && body.attendees.length > 0) {
      eventPayload.attendees = body.attendees.map((email) => ({
        emailAddress: { address: email },
        type: "required",
      }));
    }

    const result = await graphRequest<OutlookEvent>(
      "/me/events",
      accessToken,
      "POST",
      eventPayload,
    );

    if (!result.ok) {
      logger.error("[microsoft] Calendar create failed", { status: String(result.status) });
      return NextResponse.json(
        { error: "Failed to create calendar event" },
        { status: 502 },
      );
    }

    logger.info("[microsoft] Calendar event created", {
      eventId: result.data.id,
      subject: body.subject,
    });

    return NextResponse.json(result.data, { status: 201 });
  } catch (err) {
    logger.error("[microsoft] Calendar POST error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Failed to create calendar event" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE — Remove a calendar event when booking is cancelled
// ---------------------------------------------------------------------------

export async function DELETE(request: Request) {
  const guard = await guardRoute(request, "microsoft-calendar-delete", {
    roles: ["admin", "platform_admin"],
  });
  if (isErrorResponse(guard)) return guard;

  try {
    const url = new URL(request.url);
    const eventId = url.searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "Missing required parameter: eventId" },
        { status: 400 },
      );
    }

    if (isDemoMode || !process.env.MICROSOFT_CLIENT_ID) {
      return NextResponse.json({ deleted: eventId, demo: true });
    }

    const practice = await db.getPractice(guard.practiceId) as Record<string, unknown> | null;

    const integrations = parseIntegrations((practice?.integrations as string) ?? "{}");
    const { accessToken, updatedIntegrations, didRefresh } =
      await getValidAccessToken(integrations);

    if (didRefresh) {
      await savePracticeIntegrations(guard.practiceId, updatedIntegrations);
    }

    const result = await graphRequest(
      `/me/events/${eventId}`,
      accessToken,
      "DELETE",
    );

    if (!result.ok) {
      logger.error("[microsoft] Calendar delete failed", {
        eventId,
        status: String(result.status),
      });
      return NextResponse.json(
        { error: "Failed to delete calendar event" },
        { status: 502 },
      );
    }

    logger.info("[microsoft] Calendar event deleted", { eventId });
    return NextResponse.json({ deleted: eventId });
  } catch (err) {
    logger.error("[microsoft] Calendar DELETE error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Failed to delete calendar event" },
      { status: 500 },
    );
  }
}
