import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { rateLimitByIp } from "@/lib/rate-limit";

/** POST /api/engagement/email/inbound — Webhook for inbound emails (Resend, Gmail push, Outlook) */
export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, "email-inbound", { limit: 50 });
  if (!rl.allowed) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const body = await request.json();

  // Determine source based on payload shape
  const source = body.source || (body.payload?.from ? "resend_webhook" : body.value ? "outlook" : "gmail");

  if (isDemoMode) {
    return NextResponse.json({ processed: 1, source, message: "Demo mode — email logged but not stored" });
  }

  const { processInboundEmail } = await import("@/lib/engagement/email-processor");

  // Resend inbound webhook format
  if (source === "resend_webhook" && body.payload) {
    const result = await processInboundEmail({
      source: "resend_webhook",
      externalId: body.payload.id || "",
      fromEmail: body.payload.from || "",
      fromName: body.payload.from_name || "",
      subject: body.payload.subject || "",
      bodyText: body.payload.text || "",
      bodyHtml: body.payload.html || "",
      practiceId: body.practiceId || "",
    });
    return NextResponse.json({ processed: 1, result });
  }

  // Gmail push notification (Pub/Sub)
  if (source === "gmail" && body.message?.data) {
    // Gmail sends base64-encoded notification, not the email itself
    // We need to poll for the actual message
    const data = JSON.parse(Buffer.from(body.message.data, "base64").toString());
    return NextResponse.json({ received: true, historyId: data.historyId, message: "Gmail push received — will poll for messages" });
  }

  // Outlook Graph change notification
  if (source === "outlook" && body.value) {
    // Outlook sends subscription validation or change notification
    if (body.validationToken) {
      return new Response(body.validationToken, { status: 200, headers: { "Content-Type": "text/plain" } });
    }
    return NextResponse.json({ received: true, changes: body.value.length, message: "Outlook notification received — will poll for messages" });
  }

  // Generic format: { fromEmail, subject, bodyText, practiceId }
  if (body.fromEmail && body.practiceId) {
    const result = await processInboundEmail({
      source: source as "gmail" | "outlook" | "resend_webhook",
      fromEmail: body.fromEmail,
      fromName: body.fromName || "",
      subject: body.subject || "",
      bodyText: body.bodyText || "",
      practiceId: body.practiceId,
    });
    return NextResponse.json({ processed: 1, result });
  }

  return NextResponse.json({ error: "Unrecognized email payload format" }, { status: 400 });
}
