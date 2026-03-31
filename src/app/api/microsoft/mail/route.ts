import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

/** GET /api/microsoft/mail — Fetch Outlook inbox with AI triage */
export async function GET(request: Request) {
  const guard = await guardRoute(request, "microsoft-mail");
  if (isErrorResponse(guard)) return guard;

  const url = new URL(request.url);
  const filter = url.searchParams.get("filter") || ""; // unread, all
  const limit = parseInt(url.searchParams.get("limit") || "20");

  if (isDemoMode) {
    return NextResponse.json({
      messages: [
        { id: "m1", from: "sarah.patient@gmail.com", fromName: "Sarah Williams", subject: "Need to reschedule my appointment", date: "2026-03-31T08:30:00Z", preview: "Hi, I need to move my appointment from...", category: "appointment", priority: "normal" },
        { id: "m2", from: "john.doe@discovery.co.za", fromName: "John Doe", subject: "Prescription refill request", date: "2026-03-31T07:00:00Z", preview: "Please can I get a repeat script for...", category: "prescription", priority: "normal" },
        { id: "m3", from: "ampath@results.co.za", fromName: "Ampath Laboratories", subject: "Lab Results Ready — Patient: T Molefe", date: "2026-03-30T16:00:00Z", preview: "Dear Doctor, the following results are...", category: "results", priority: "high" },
      ],
    });
  }

  const { prisma } = await import("@/lib/prisma");
  const practice = await prisma.practice.findUnique({ where: { id: guard.practiceId } });
  if (!practice) return NextResponse.json({ error: "Practice not found" }, { status: 404 });

  const ms = await import("@/lib/microsoft");
  const integrations = ms.parseIntegrations(practice.integrations);
  if (!ms.getMicrosoftConfig(integrations)) return NextResponse.json({ error: "Microsoft 365 not connected" }, { status: 400 });

  const authResult = await ms.getValidAccessToken(integrations);
  if (authResult.didRefresh) {
    await prisma.practice.update({ where: { id: guard.practiceId }, data: { integrations: JSON.stringify(authResult.updatedIntegrations) } });
  }

  const filterQuery = filter === "unread" ? "&$filter=isRead eq false" : "";
  const result = await ms.graphRequest<{
    value: { id: string; from: { emailAddress: { address: string; name: string } }; subject: string; bodyPreview: string; receivedDateTime: string; isRead: boolean }[];
  }>(`/me/messages?$top=${limit}&$select=id,from,subject,bodyPreview,receivedDateTime,isRead&$orderby=receivedDateTime desc${filterQuery}`, authResult.accessToken);

  if (!result.ok) return NextResponse.json({ error: "Failed to fetch mail" }, { status: 502 });

  // AI triage classification
  const { classifyEmail } = await import("@/lib/engagement/email-processor");
  const messages = (result.data.value || []).map((m) => {
    const { category, priority } = classifyEmail(m.subject, m.bodyPreview);
    return {
      id: m.id, from: m.from.emailAddress.address, fromName: m.from.emailAddress.name,
      subject: m.subject, date: m.receivedDateTime, preview: m.bodyPreview,
      isRead: m.isRead, category, priority,
    };
  });

  return NextResponse.json({ messages });
}

/** POST /api/microsoft/mail — Send email via Outlook */
export async function POST(request: Request) {
  const guard = await guardRoute(request, "microsoft-mail-send", { limit: 10 });
  if (isErrorResponse(guard)) return guard;
  const { to, subject, body } = await request.json();
  if (!to || !subject || !body) return NextResponse.json({ error: "to, subject, body required" }, { status: 400 });

  if (isDemoMode) return NextResponse.json({ sent: true, message: "Demo — email not actually sent" });

  const { prisma } = await import("@/lib/prisma");
  const practice = await prisma.practice.findUnique({ where: { id: guard.practiceId } });
  if (!practice) return NextResponse.json({ error: "Practice not found" }, { status: 404 });

  const ms = await import("@/lib/microsoft");
  const integrations = ms.parseIntegrations(practice.integrations);
  if (!ms.getMicrosoftConfig(integrations)) return NextResponse.json({ error: "Microsoft 365 not connected" }, { status: 400 });

  const authResult = await ms.getValidAccessToken(integrations);
  if (authResult.didRefresh) {
    await prisma.practice.update({ where: { id: guard.practiceId }, data: { integrations: JSON.stringify(authResult.updatedIntegrations) } });
  }

  const result = await ms.graphRequest("/me/sendMail", authResult.accessToken, "POST", {
    message: {
      subject,
      body: { contentType: "HTML", content: body },
      toRecipients: [{ emailAddress: { address: to } }],
    },
  });

  return NextResponse.json({ sent: result.ok });
}
