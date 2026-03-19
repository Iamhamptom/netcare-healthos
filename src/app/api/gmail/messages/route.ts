import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import {
  parseIntegrations,
  getGmailConfig,
  getValidAccessToken,
  fetchGmailMessages,
  getGmailMessage,
} from "@/lib/gmail";

/** GET /api/gmail/messages — Fetch inbox messages (matched to patients) */
export async function GET(request: Request) {
  const guard = await guardRoute(request, "gmail-messages", { limit: 10 });
  if (isErrorResponse(guard)) return guard;

  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? undefined;
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "20"), 20);

  if (isDemoMode) {
    return NextResponse.json({
      messages: [
        {
          id: "demo-1",
          from: "Sarah Johnson <sarah@example.com>",
          to: "clinic@smiledental.co.za",
          subject: "Appointment follow-up question",
          date: "2026-03-11T09:15:00Z",
          body: "Hi, I had my filling done last week and I'm experiencing some sensitivity. Is this normal?",
          snippet: "Hi, I had my filling done last week...",
          patient: { id: "demo-patient-1", name: "Sarah Johnson" },
        },
        {
          id: "demo-2",
          from: "Michael Chen <michael.chen@gmail.com>",
          to: "clinic@smiledental.co.za",
          subject: "Request for dental records",
          date: "2026-03-11T08:30:00Z",
          body: "Good morning, I need a copy of my dental records for my new insurance provider. Could you please send them?",
          snippet: "Good morning, I need a copy of my dental records...",
          patient: { id: "demo-patient-2", name: "Michael Chen" },
        },
        {
          id: "demo-3",
          from: "Lerato Molefe <lerato.m@outlook.com>",
          to: "clinic@smiledental.co.za",
          subject: "Reschedule cleaning appointment",
          date: "2026-03-10T16:45:00Z",
          body: "Hi there, I won't be able to make my Thursday appointment. Can we reschedule to next week?",
          snippet: "Hi there, I won't be able to make my Thursday appointment...",
          patient: { id: "demo-patient-3", name: "Lerato Molefe" },
        },
        {
          id: "demo-4",
          from: "noreply@medicalaid.co.za",
          to: "clinic@smiledental.co.za",
          subject: "Claim #CLM-29481 approved",
          date: "2026-03-10T14:20:00Z",
          body: "Your claim for patient Thabo Ndlovu has been approved. Amount: R2,450.00",
          snippet: "Your claim for patient Thabo Ndlovu has been approved...",
          patient: null,
        },
        {
          id: "demo-5",
          from: "Priya Naidoo <priya.n@gmail.com>",
          to: "clinic@smiledental.co.za",
          subject: "Thank you!",
          date: "2026-03-10T11:00:00Z",
          body: "Just wanted to say thank you for the wonderful service. My son was so comfortable during his visit. We'll definitely be back!",
          snippet: "Just wanted to say thank you for the wonderful service...",
          patient: { id: "demo-patient-5", name: "Priya Naidoo" },
        },
      ],
      total: 5,
    });
  }

  try {
    const { prisma } = await import("@/lib/prisma");

    // Load practice integrations
    const practice = await prisma.practice.findUnique({
      where: { id: guard.practiceId },
      select: { integrations: true },
    });

    const integrations = parseIntegrations(practice?.integrations ?? "{}");
    const gmailConfig = getGmailConfig(integrations);

    if (!gmailConfig) {
      return NextResponse.json({ error: "Gmail not connected" }, { status: 400 });
    }

    // Get valid access token (auto-refresh if expired)
    const { accessToken, updatedIntegrations, didRefresh } =
      await getValidAccessToken(integrations);

    // Persist refreshed tokens if they changed
    if (didRefresh) {
      await prisma.practice.update({
        where: { id: guard.practiceId },
        data: { integrations: JSON.stringify(updatedIntegrations) },
      });
    }

    // Fetch message IDs
    const list = await fetchGmailMessages(accessToken, query, limit);

    if (!list.messages || list.messages.length === 0) {
      return NextResponse.json({ messages: [], total: 0 });
    }

    // Fetch full details for each message
    const messages = await Promise.all(
      list.messages.slice(0, limit).map((m) => getGmailMessage(accessToken, m.id)),
    );

    // Load all patients for this practice (for email matching)
    const patients = await prisma.patient.findMany({
      where: { practiceId: guard.practiceId },
      select: { id: true, name: true, email: true },
    });

    const emailToPatient = new Map<string, { id: string; name: string }>();
    for (const p of patients) {
      if (p.email) {
        emailToPatient.set(p.email.toLowerCase(), { id: p.id, name: p.name });
      }
    }

    // Match senders to patients
    const enriched = messages.map((msg) => {
      // Extract email from "Name <email>" format
      const emailMatch = msg.from.match(/<([^>]+)>/);
      const senderEmail = (emailMatch ? emailMatch[1] : msg.from).toLowerCase().trim();
      const patient = emailToPatient.get(senderEmail) ?? null;

      return { ...msg, patient };
    });

    return NextResponse.json({
      messages: enriched,
      total: list.resultSizeEstimate,
    });
  } catch (err) {
    console.error("[gmail/messages] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch messages" },
      { status: 500 },
    );
  }
}
