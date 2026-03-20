import { NextResponse, NextRequest } from "next/server";
import { guardPlatformAdmin } from "@/lib/api-helpers";

/**
 * /api/reports/schedule — CRUD for scheduled reports
 * GET: List scheduled reports
 * POST: Create schedule
 * DELETE: Remove schedule
 *
 * Stores schedules in-memory for demo mode (production would use Supabase).
 */

interface ReportSchedule {
  id: string;
  reportType: string;
  reportName: string;
  frequency: "daily" | "weekly" | "monthly";
  recipients: string[];
  time: string;
  lastSentAt: string | null;
  nextSendAt: string;
  createdBy: string;
  createdAt: string;
  active: boolean;
}

// In-memory store for demo mode
const scheduleStore: ReportSchedule[] = [
  {
    id: "sched-1",
    reportType: "claims_summary",
    reportName: "Claims Summary",
    frequency: "daily",
    recipients: ["thirushen.pillay@netcare.co.za", "ops@netcare.co.za"],
    time: "07:00",
    lastSentAt: new Date(Date.now() - 86400000).toISOString(),
    nextSendAt: new Date(Date.now() + 86400000).toISOString(),
    createdBy: "Thirushen Pillay",
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    active: true,
  },
  {
    id: "sched-2",
    reportType: "revenue",
    reportName: "Revenue Report",
    frequency: "weekly",
    recipients: ["thirushen.pillay@netcare.co.za", "finance@netcare.co.za"],
    time: "08:00",
    lastSentAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    nextSendAt: new Date(Date.now() + 4 * 86400000).toISOString(),
    createdBy: "Thirushen Pillay",
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    active: true,
  },
  {
    id: "sched-3",
    reportType: "popia_compliance",
    reportName: "POPIA Compliance Status",
    frequency: "monthly",
    recipients: ["compliance@netcare.co.za", "thirushen.pillay@netcare.co.za"],
    time: "09:00",
    lastSentAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    nextSendAt: new Date(Date.now() + 15 * 86400000).toISOString(),
    createdBy: "Thirushen Pillay",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    active: true,
  },
];

export async function GET(request: NextRequest) {
  const guard = await guardPlatformAdmin(request, "reports-schedule");
  if (guard instanceof NextResponse) return guard;

  return NextResponse.json({ schedules: scheduleStore });
}

export async function POST(request: NextRequest) {
  const guard = await guardPlatformAdmin(request, "reports-schedule");
  if (guard instanceof NextResponse) return guard;

  try {
    const body = await request.json();
    const { reportType, reportName, frequency, recipients, time } = body;

    if (!reportType || !frequency || !recipients || !time) {
      return NextResponse.json({ error: "Missing required fields: reportType, frequency, recipients, time" }, { status: 400 });
    }

    const validFrequencies = ["daily", "weekly", "monthly"];
    if (!validFrequencies.includes(frequency)) {
      return NextResponse.json({ error: "frequency must be daily, weekly, or monthly" }, { status: 400 });
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: "recipients must be a non-empty array of emails" }, { status: 400 });
    }

    const now = new Date();
    const nextSend = computeNextSend(frequency, time);

    const schedule: ReportSchedule = {
      id: `sched-${Date.now()}`,
      reportType,
      reportName: reportName || reportType.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
      frequency,
      recipients,
      time,
      lastSentAt: null,
      nextSendAt: nextSend.toISOString(),
      createdBy: guard.user.name,
      createdAt: now.toISOString(),
      active: true,
    };

    scheduleStore.push(schedule);

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (err) {
    console.error("[reports/schedule] POST error:", err);
    return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const guard = await guardPlatformAdmin(request, "reports-schedule");
  if (guard instanceof NextResponse) return guard;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const idx = scheduleStore.findIndex(s => s.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
  }

  scheduleStore.splice(idx, 1);
  return NextResponse.json({ success: true });
}

function computeNextSend(frequency: string, time: string): Date {
  const now = new Date();
  const [hours, minutes] = time.split(":").map(Number);
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);

  if (next <= now) {
    switch (frequency) {
      case "daily":
        next.setDate(next.getDate() + 1);
        break;
      case "weekly":
        next.setDate(next.getDate() + 7);
        break;
      case "monthly":
        next.setMonth(next.getMonth() + 1);
        break;
    }
  }
  return next;
}
