import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
// Direct prisma import: Referral models are Prisma-only, not yet in Supabase db abstraction
import { prisma } from "@/lib/prisma";

/** GET /api/referrals/[id] — Get referral details */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await guardRoute(request, "referrals");
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;

  const referral = await prisma.referral.findFirst({
    where: { id, practiceId: guard.practiceId },
  });

  if (!referral) return NextResponse.json({ error: "Referral not found" }, { status: 404 });
  return NextResponse.json({ referral });
}

/** PATCH /api/referrals/[id] — Update referral status, send GP feedback */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await guardRoute(request, "referrals");
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;
  const body = await request.json();
  const { status, feedbackNote, appointmentDate } = body;

  const existing = await prisma.referral.findFirst({
    where: { id, practiceId: guard.practiceId },
  });

  if (!existing) return NextResponse.json({ error: "Referral not found" }, { status: 404 });

  const updateData: Record<string, unknown> = {};

  if (status && ["pending", "accepted", "booked", "completed", "declined"].includes(status)) {
    updateData.status = status;
  }

  if (appointmentDate) {
    updateData.appointmentDate = new Date(appointmentDate);
    if (!updateData.status) updateData.status = "booked";
  }

  if (feedbackNote) {
    updateData.feedbackNote = feedbackNote.trim().slice(0, 2000);
    updateData.feedbackSent = true;
    updateData.feedbackSentAt = new Date();

    // Send feedback email to referring GP
    if (existing.referringEmail) {
      try {
        const practice = await prisma.practice.findUnique({ where: { id: guard.practiceId } });
        const { sendEmail } = await import("@/lib/resend");
        await sendEmail({
          to: existing.referringEmail,
          subject: `Consultation Report: ${existing.patientName} — ${practice?.name || "Specialist"}`,
          html: gpFeedbackEmail({
            gpName: existing.referringDoctor,
            patientName: existing.patientName,
            practiceName: practice?.name || "Specialist Practice",
            primaryColor: practice?.primaryColor || "#D4AF37",
            feedbackNote: feedbackNote.trim(),
            referralReason: existing.reason,
          }),
        });
      } catch (err) {
        console.error("GP feedback email error:", err);
      }
    }
  }

  const referral = await prisma.referral.update({
    where: { id },
    data: updateData,
  });

  // If accepted, send WhatsApp to patient to book
  if (status === "accepted" && existing.patientPhone) {
    try {
      const practice = await prisma.practice.findUnique({ where: { id: guard.practiceId } });
      const { sendWhatsApp } = await import("@/lib/twilio");
      const msg = `Hi ${existing.patientName}, your doctor (Dr. ${existing.referringDoctor}) has referred you to ${practice?.name || "our practice"} for ${existing.reason.slice(0, 80)}.\n\n` +
        `We'd like to schedule your appointment. Please book online or call us:\n\n` +
        `Book: ${process.env.NEXT_PUBLIC_BASE_URL || "https://healthops.co.za"}/book/${practice?.subdomain || ""}\n` +
        `Call: ${practice?.phone || ""}\n\n` +
        `Looking forward to seeing you!`;
      await sendWhatsApp(existing.patientPhone, msg);
    } catch (err) {
      console.error("Patient referral notification error:", err);
    }
  }

  return NextResponse.json({ referral });
}

// ─── GP Feedback Email Template ──────────────────────

function gpFeedbackEmail(opts: {
  gpName: string;
  patientName: string;
  practiceName: string;
  primaryColor: string;
  feedbackNote: string;
  referralReason: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
    <div style="background:${opts.primaryColor};padding:24px 32px;">
      <h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:600;">${opts.practiceName}</h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.7);font-size:12px;">Consultation Report</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#555;font-size:14px;line-height:1.6;">Dear Dr. ${opts.gpName},</p>
      <p style="color:#555;font-size:14px;line-height:1.6;">Thank you for referring <strong>${opts.patientName}</strong> to our practice. Please find the consultation summary below.</p>

      <div style="background:#f0f7ff;border-left:4px solid ${opts.primaryColor};border-radius:0 8px 8px 0;padding:16px 20px;margin:20px 0;">
        <p style="margin:0 0 4px;color:#999;font-size:11px;text-transform:uppercase;">Original Referral</p>
        <p style="margin:0;color:#333;font-size:13px;">${opts.referralReason.slice(0, 200)}</p>
      </div>

      <div style="background:#f8f8f8;border-radius:8px;padding:20px;margin:20px 0;">
        <p style="margin:0 0 4px;color:#999;font-size:11px;text-transform:uppercase;">Specialist Findings &amp; Plan</p>
        <p style="margin:0;color:#333;font-size:14px;line-height:1.6;white-space:pre-wrap;">${opts.feedbackNote}</p>
      </div>

      <p style="color:#555;font-size:14px;line-height:1.6;">Please don't hesitate to contact us if you need any further information regarding this patient's care.</p>
      <p style="color:#555;font-size:14px;line-height:1.6;">Kind regards,<br/><strong>${opts.practiceName}</strong></p>
    </div>
    <div style="padding:16px 32px;background:#fafafa;border-top:1px solid #eee;text-align:center;">
      <p style="margin:0;color:#999;font-size:11px;">Powered by Netcare Health OS Ops &middot; HPCSA Compliant</p>
    </div>
  </div>
</body>
</html>`;
}
