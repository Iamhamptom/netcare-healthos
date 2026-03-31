import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { demoStore } from "@/lib/demo-data";
import { sanitize, clampInt } from "@/lib/validate";

export async function GET(request: Request) {
  const guard = await guardRoute(request, "notifications");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({ notifications: demoStore.getNotifications() });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = clampInt(parseInt(searchParams.get("limit") || "100", 10) || 100, 1, 100) ?? 100;
  const skip = (page - 1) * limit;

  const { prisma } = await import("@/lib/prisma");
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { practiceId: guard.practiceId },
      orderBy: { sentAt: "desc" },
      take: limit,
      skip,
    }),
    prisma.notification.count({ where: { practiceId: guard.practiceId } }),
  ]);
  return NextResponse.json({ notifications, total, page, limit });
}

export async function POST(request: Request) {
  const guard = await guardRoute(request, "notifications");
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  if (!body.recipient || !body.message) {
    return NextResponse.json({ error: "Recipient and message are required" }, { status: 400 });
  }

  const types = ["whatsapp", "sms", "email"];
  const type = types.includes(body.type) ? body.type : "whatsapp";

  if (isDemoMode) {
    const n = demoStore.addNotification({
      type,
      recipient: sanitize(body.recipient),
      patientName: sanitize(body.patientName || ""),
      subject: sanitize(body.subject || ""),
      message: sanitize(body.message),
      template: body.template || "custom",
    });
    return NextResponse.json({ notification: n }, { status: 201 });
  }

  const { prisma } = await import("@/lib/prisma");
  const notification = await prisma.notification.create({
    data: {
      type,
      recipient: sanitize(body.recipient),
      patientName: sanitize(body.patientName || ""),
      subject: sanitize(body.subject || ""),
      message: sanitize(body.message),
      template: body.template || "custom",
      practiceId: guard.practiceId,
    },
  });

  // Actually send the notification via the appropriate channel
  let sendResult: { sent: boolean; channel: string; error?: string } = { sent: false, channel: type };

  if (type === "email" && body.recipient?.includes("@")) {
    try {
      const { sendEmail } = await import("@/lib/resend");
      await sendEmail({
        to: body.recipient,
        subject: body.subject || "Notification from your healthcare practice",
        html: `<div style="font-family: system-ui, sans-serif; max-width: 520px;">
          <p>${sanitize(body.message).replace(/\n/g, "<br/>")}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">This is an automated message. Please do not reply directly.</p>
        </div>`,
      });
      sendResult = { sent: true, channel: "email" };
      await prisma.notification.update({ where: { id: notification.id }, data: { status: "sent" } });
    } catch (err) {
      sendResult = { sent: false, channel: "email", error: err instanceof Error ? err.message : "Send failed" };
    }
  } else if (type === "whatsapp" || type === "sms") {
    // WhatsApp/SMS: log for manual follow-up (Twilio integration pending clinic configuration)
    sendResult = { sent: false, channel: type, error: "Channel requires clinic-specific configuration. Logged for manual follow-up." };
  }

  return NextResponse.json({ notification, sendResult }, { status: 201 });
}
