import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

/**
 * Front Desk — Integration Connection Status
 *
 * GET: Returns status of each integration relevant to the front desk module.
 * POST: Save integration config (HEAL endpoint, etc.) to Practice.integrations JSON.
 */

interface IntegrationStatus {
  id: string;
  name: string;
  description: string;
  category: "core" | "communication" | "calendar" | "clinical" | "ai";
  status: "connected" | "disconnected" | "pending";
  powers: string[];
  breaksWithout: string;
  configurable: boolean;
  lastSync?: string;
}

const INTEGRATION_DEFS: Omit<IntegrationStatus, "status" | "lastSync">[] = [
  {
    id: "supabase",
    name: "Supabase (Core Database)",
    description: "Patient records, bookings, check-ins, and all practice data",
    category: "core",
    powers: ["All data storage", "Patient records", "Bookings", "Check-ins", "Billing"],
    breaksWithout: "Everything. No data storage at all.",
    configurable: false,
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business (Twilio)",
    description: "Patient notifications via WhatsApp — confirmations, reminders, engagement sequences",
    category: "communication",
    powers: ["Appointment confirmations", "24h reminders", "Check-in details", "Patient engagement sequences", "AI patient chatbot"],
    breaksWithout: "No WhatsApp notifications. Bookings still work — falls back to email via Resend.",
    configurable: true,
  },
  {
    id: "email",
    name: "Email (Resend)",
    description: "Transactional email — confirmations, reminders, follow-ups, review requests",
    category: "communication",
    powers: ["Booking confirmations", "Appointment reminders", "Follow-up emails", "Review requests", "Recall notifications"],
    breaksWithout: "No email delivery. WhatsApp becomes the only notification channel.",
    configurable: true,
  },
  {
    id: "google_calendar",
    name: "Google Calendar",
    description: "Bidirectional sync — push bookings to Google Calendar, pull external events",
    category: "calendar",
    powers: ["Calendar sync", "Staff scheduling visibility", "External event import"],
    breaksWithout: "No calendar sync. Bookings only visible in Health OS dashboard.",
    configurable: true,
  },
  {
    id: "heal",
    name: "HEAL System (A2D24)",
    description: "Import bookings from HEAL PMS — South Africa's most-used practice management system",
    category: "clinical",
    powers: ["HEAL booking import", "Patient record sync", "Appointment pull"],
    breaksWithout: "Bookings made in HEAL don't appear. Reception manually enters or does CSV import.",
    configurable: true,
  },
  {
    id: "healthbridge",
    name: "Healthbridge / MediKredit",
    description: "Real-time medical aid eligibility verification — check member benefits before consultation",
    category: "clinical",
    powers: ["Medical aid eligibility checks", "Benefit remaining lookup", "Dependant verification", "Pre-auth requirements"],
    breaksWithout: "No real-time eligibility check. Reception does manual verification (phone medical aid, check card).",
    configurable: true,
  },
  {
    id: "ai_models",
    name: "AI Models (Claude / Gemini)",
    description: "Powers the Front Desk Agent, patient chatbot, triage, and engagement AI responses",
    category: "ai",
    powers: ["Front Desk Agent", "Patient chatbot", "Side effects triage (Day 7)", "Intake questionnaire"],
    breaksWithout: "AI features go offline. Reception answers questions manually. Engagement sequences still send but without AI triage.",
    configurable: false,
  },
];

function checkIntegrationStatus(id: string, practiceIntegrations?: Record<string, unknown>): { status: IntegrationStatus["status"]; lastSync?: string } {
  switch (id) {
    case "supabase":
      return { status: "connected" };
    case "whatsapp":
      return process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
        ? { status: "connected" }
        : { status: "disconnected" };
    case "email":
      return process.env.RESEND_API_KEY
        ? { status: "connected" }
        : { status: "disconnected" };
    case "google_calendar": {
      const gcal = practiceIntegrations?.google_calendar as Record<string, unknown> | undefined;
      return gcal?.connected
        ? { status: "connected", lastSync: gcal.lastSync as string | undefined }
        : { status: "disconnected" };
    }
    case "heal": {
      const heal = practiceIntegrations?.heal as Record<string, unknown> | undefined;
      return heal?.endpoint
        ? { status: "connected", lastSync: heal.lastSync as string | undefined }
        : { status: "disconnected" };
    }
    case "healthbridge":
      return process.env.HEALTHBRIDGE_API_KEY || process.env.HEALTHBRIDGE_URL
        ? { status: "connected" }
        : { status: "disconnected" };
    case "ai_models":
      return process.env.AI_GATEWAY_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY
        ? { status: "connected" }
        : { status: "disconnected" };
    default:
      return { status: "disconnected" };
  }
}

export async function GET(request: Request) {
  const guard = await guardRoute(request, "front-desk-connections");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    const demoIntegrations: IntegrationStatus[] = INTEGRATION_DEFS.map((def) => ({
      ...def,
      status: ["supabase", "email", "ai_models"].includes(def.id) ? "connected" as const : "disconnected" as const,
    }));
    return NextResponse.json({ integrations: demoIntegrations });
  }

  const { prisma } = await import("@/lib/prisma");
  const practice = await prisma.practice.findUnique({
    where: { id: guard.practiceId },
    select: { integrations: true },
  });
  const practiceIntegrations: Record<string, unknown> = (() => { try { return typeof practice?.integrations === "string" ? JSON.parse(practice.integrations) : (practice?.integrations as unknown as Record<string, unknown>) || {}; } catch { return {}; } })();

  const integrations: IntegrationStatus[] = INTEGRATION_DEFS.map((def) => {
    const check = checkIntegrationStatus(def.id, practiceIntegrations);
    return { ...def, ...check };
  });

  return NextResponse.json({ integrations });
}

export async function POST(request: Request) {
  const guard = await guardRoute(request, "front-desk-connections", { roles: ["admin", "receptionist"] });
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  const { integrationId, config } = body as { integrationId: string; config: Record<string, unknown> };

  if (!integrationId || !config) {
    return NextResponse.json({ error: "integrationId and config are required" }, { status: 400 });
  }

  const allowed = ["google_calendar", "heal", "healthbridge"];
  if (!allowed.includes(integrationId)) {
    return NextResponse.json({ error: "This integration is not configurable here" }, { status: 400 });
  }

  if (isDemoMode) {
    return NextResponse.json({ ok: true, message: "Demo mode — config not persisted" });
  }

  const { prisma } = await import("@/lib/prisma");
  const practice = await prisma.practice.findUnique({
    where: { id: guard.practiceId },
    select: { integrations: true },
  });
  const existing: Record<string, unknown> = (() => { try { return typeof practice?.integrations === "string" ? JSON.parse(practice.integrations) : (practice?.integrations as unknown as Record<string, unknown>) || {}; } catch { return {}; } })();

  const updated = {
    ...existing,
    [integrationId]: { ...((existing[integrationId] as Record<string, unknown>) || {}), ...config, updatedAt: new Date().toISOString() },
  };

  await prisma.practice.update({
    where: { id: guard.practiceId },
    data: {
      integrations: JSON.stringify(updated),
    },
  });

  return NextResponse.json({ ok: true });
}
