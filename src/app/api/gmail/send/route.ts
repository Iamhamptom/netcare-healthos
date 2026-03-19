import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import {
  parseIntegrations,
  getGmailConfig,
  getValidAccessToken,
  sendGmailMessage,
} from "@/lib/gmail";

/** POST /api/gmail/send — Send an email via the connected Gmail account */
export async function POST(request: Request) {
  const guard = await guardRoute(request, "gmail-send", { limit: 10 });
  if (isErrorResponse(guard)) return guard;

  let body: { to?: string; subject?: string; body?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { to, subject, body: emailBody } = body;

  if (!to || !subject || !emailBody) {
    return NextResponse.json(
      { error: "Missing required fields: to, subject, body" },
      { status: 400 },
    );
  }

  if (isDemoMode) {
    return NextResponse.json({
      success: true,
      messageId: "demo-sent-" + Date.now(),
      threadId: "demo-thread-" + Date.now(),
    });
  }

  try {
    const { prisma } = await import("@/lib/prisma");

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

    if (didRefresh) {
      await prisma.practice.update({
        where: { id: guard.practiceId },
        data: { integrations: JSON.stringify(updatedIntegrations) },
      });
    }

    const result = await sendGmailMessage(
      accessToken,
      to,
      subject,
      emailBody,
      gmailConfig.gmailEmail || undefined,
    );

    return NextResponse.json({
      success: true,
      messageId: result.id,
      threadId: result.threadId,
    });
  } catch (err) {
    console.error("[gmail/send] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send email" },
      { status: 500 },
    );
  }
}
