import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/is-demo";

/** POST /api/public/review-request — Cron: send Google review requests to completed patients */
export async function POST(request: Request) {
  // Auth: cron secret or gateway key
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const gatewayKey = process.env.HEALTHOPS_GATEWAY_KEY;

  const token = authHeader?.replace("Bearer ", "");
  if (!token || (token !== cronSecret && token !== gatewayKey)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isDemoMode) {
    return NextResponse.json({ sent: 0, message: "Demo mode — no review requests sent" });
  }

  const now = new Date();
  // Find bookings completed 48-72h ago that haven't had a follow-up (review request piggybacks on follow-up)
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);

  const bookings = await prisma.booking.findMany({
    where: {
      status: "completed",
      scheduledAt: { gte: threeDaysAgo, lte: twoDaysAgo },
      followupSentAt: { not: null }, // follow-up already sent, now send review request
    },
    include: { practice: true },
  });

  let sent = 0;

  for (const booking of bookings) {
    // Skip if no Google Place ID configured
    if (!booking.practice.googlePlaceId) continue;

    const reviewUrl = `https://search.google.com/local/writereview?placeid=${booking.practice.googlePlaceId}`;

    // Send WhatsApp review request
    if (booking.patientPhone) {
      try {
        const { sendWhatsApp } = await import("@/lib/twilio");
        const msg = `Hi ${booking.patientName}, we hope you're doing well after your recent visit to ${booking.practice.name}!\n\n` +
          `If you had a good experience, we'd really appreciate a quick Google review. It helps other patients find us.\n\n` +
          `Leave a review here: ${reviewUrl}\n\n` +
          `Thank you for choosing ${booking.practice.name}!`;
        await sendWhatsApp(booking.patientPhone, msg);

        // Log notification
        await prisma.notification.create({
          data: {
            type: "whatsapp",
            recipient: booking.patientPhone,
            patientName: booking.patientName,
            message: msg,
            status: "sent",
            template: "review_request",
            practiceId: booking.practiceId,
          },
        });

        sent++;
      } catch (err) {
        console.error("Review request WhatsApp error:", err);
      }
    }

    // Send email review request
    if (booking.patientEmail) {
      try {
        const { sendEmail } = await import("@/lib/resend");
        await sendEmail({
          to: booking.patientEmail,
          subject: `How was your visit to ${booking.practice.name}?`,
          html: reviewRequestEmail({
            practiceName: booking.practice.name,
            primaryColor: booking.practice.primaryColor || "#D4AF37",
            patientName: booking.patientName,
            service: booking.service,
            reviewUrl,
          }),
        });
      } catch (err) {
        console.error("Review request email error:", err);
      }
    }
  }

  return NextResponse.json({ sent, total: bookings.length });
}

// ─── Email Template ──────────────────────────────────

function reviewRequestEmail(opts: {
  practiceName: string;
  primaryColor: string;
  patientName: string;
  service: string;
  reviewUrl: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
    <div style="background:${opts.primaryColor};padding:24px 32px;">
      <h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:600;">${opts.practiceName}</h1>
    </div>
    <div style="padding:32px;text-align:center;">
      <h2 style="margin:0 0 16px;color:#333;font-size:20px;">How was your visit?</h2>
      <p style="color:#555;font-size:14px;line-height:1.6;">Hi ${opts.patientName},</p>
      <p style="color:#555;font-size:14px;line-height:1.6;">We hope your recent ${opts.service} went well. Your feedback helps other patients find quality care.</p>
      <div style="margin:28px 0;">
        <a href="${opts.reviewUrl}" style="display:inline-block;background:${opts.primaryColor};color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
          Leave a Google Review
        </a>
      </div>
      <p style="color:#999;font-size:12px;">It only takes 30 seconds and makes a big difference.</p>
    </div>
    <div style="padding:16px 32px;background:#fafafa;border-top:1px solid #eee;text-align:center;">
      <p style="margin:0;color:#999;font-size:11px;">Powered by Netcare Health OS Ops</p>
    </div>
  </div>
</body>
</html>`;
}
