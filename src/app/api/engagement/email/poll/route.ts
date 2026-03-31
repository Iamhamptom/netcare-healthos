import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";

/** GET /api/engagement/email/poll — Cron: poll Gmail/Outlook inboxes for new emails */
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const gatewayKey = process.env.HEALTHOPS_GATEWAY_KEY || process.env.VISIO_GATEWAY_KEY;

  const isAuthed = (cronSecret && auth === `Bearer ${cronSecret}`) || (gatewayKey && auth === `Bearer ${gatewayKey}`);
  if (!isAuthed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (isDemoMode) {
    return NextResponse.json({ polled: 0, message: "Demo mode — no email polling" });
  }

  const { prisma } = await import("@/lib/prisma");
  const { pollGmailInbox, pollOutlookInbox } = await import("@/lib/engagement/email-processor");

  // Get all practices with email integrations
  const practices = await prisma.practice.findMany({
    where: {
      integrations: { not: "{}" },
    },
    select: { id: true, integrations: true },
  });

  let totalProcessed = 0;
  const errors: string[] = [];

  for (const practice of practices) {
    const integrations = JSON.parse(practice.integrations || "{}");

    if (integrations.gmailAccessToken) {
      try {
        const results = await pollGmailInbox(practice.id);
        totalProcessed += results.length;
      } catch (err) {
        errors.push(`Gmail poll failed for ${practice.id}: ${String(err)}`);
      }
    }

    if (integrations.microsoftAccessToken) {
      try {
        const results = await pollOutlookInbox(practice.id);
        totalProcessed += results.length;
      } catch (err) {
        errors.push(`Outlook poll failed for ${practice.id}: ${String(err)}`);
      }
    }
  }

  return NextResponse.json({
    polled: totalProcessed,
    practicesChecked: practices.length,
    errors: errors.length > 0 ? errors : undefined,
    message: "Email poll completed",
  });
}
