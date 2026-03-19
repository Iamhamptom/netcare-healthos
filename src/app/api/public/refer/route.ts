import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { supabaseAdmin, tables } from "@/lib/supabase";

/** POST /api/public/refer — GP submits a patient referral (no auth required) */
export async function POST(request: Request) {
  const rl = rateLimitByIp(request, "public/refer", { limit: 10, windowMs: 3600_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await request.json();
  const {
    slug,
    referringDoctor,
    referringPractice,
    referringEmail,
    referringPhone,
    patientName,
    patientPhone,
    patientEmail,
    dateOfBirth,
    medicalAid,
    medicalAidNo,
    reason,
    urgency,
    clinicalNotes,
    icd10Code,
  } = body;

  // Validate required fields
  if (!slug || !referringDoctor || !patientName || !reason) {
    return NextResponse.json({ error: "Missing required fields: referringDoctor, patientName, reason" }, { status: 400 });
  }

  if (referringDoctor.length > 100 || patientName.length > 100 || reason.length > 1000) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 });
  }

  // Find practice
  const practice = await db.getPracticeBySubdomain(slug) as Record<string, unknown> | null;
  if (!practice) return NextResponse.json({ error: "Practice not found" }, { status: 404 });

  // Create referral
  const referral = await db.createReferral({
    referringDoctor: referringDoctor.trim().slice(0, 100),
    referringPractice: (referringPractice || "").trim().slice(0, 200),
    referringEmail: (referringEmail || "").trim().slice(0, 100),
    referringPhone: (referringPhone || "").trim().slice(0, 20),
    patientName: patientName.trim().slice(0, 100),
    patientPhone: (patientPhone || "").trim().slice(0, 20),
    patientEmail: (patientEmail || "").trim().slice(0, 100),
    dateOfBirth: (dateOfBirth || "").trim().slice(0, 10),
    medicalAid: (medicalAid || "").trim().slice(0, 100),
    medicalAidNo: (medicalAidNo || "").trim().slice(0, 50),
    reason: reason.trim().slice(0, 1000),
    urgency: ["routine", "urgent", "emergency"].includes(urgency) ? urgency : "routine",
    clinicalNotes: (clinicalNotes || "").trim().slice(0, 2000),
    icd10Code: (icd10Code || "").trim().slice(0, 20),
    status: "pending",
    practiceId: practice.id,
  }) as Record<string, unknown>;

  // Notify practice staff via WhatsApp (if configured)
  try {
    const { sendWhatsApp } = await import("@/lib/twilio");
    if (practice.phone) {
      const urgencyLabel = urgency === "emergency" ? "EMERGENCY" : urgency === "urgent" ? "URGENT" : "Routine";
      const msg = `New GP Referral [${urgencyLabel}]\n\n` +
        `From: Dr. ${referringDoctor}${referringPractice ? ` (${referringPractice})` : ""}\n` +
        `Patient: ${patientName}\n` +
        `Reason: ${reason.slice(0, 100)}\n\n` +
        `Review in your dashboard to accept and schedule.`;
      await sendWhatsApp(practice.phone as string, msg);
    }
  } catch (err) {
    console.error("Referral notification error:", err);
  }

  // Send confirmation to referring GP
  if (referringEmail) {
    try {
      const { sendEmail } = await import("@/lib/resend");
      await sendEmail({
        to: referringEmail,
        subject: `Referral Received — ${patientName} to ${practice.name}`,
        html: referralConfirmationEmail({
          gpName: referringDoctor,
          patientName,
          practiceName: practice.name as string,
          reason,
          referralId: referral.id as string,
          primaryColor: (practice.primaryColor as string) || "#D4AF37",
        }),
      });
    } catch (err) {
      console.error("GP confirmation email error:", err);
    }
  }

  return NextResponse.json({
    referralId: referral.id,
    status: "pending",
    message: "Referral submitted successfully. The specialist will review and contact the patient.",
  });
}

/** GET /api/public/refer?slug=xxx — Get referral form config for a practice */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) return NextResponse.json({ error: "Slug required" }, { status: 400 });

  const practice = await db.getPracticeBySubdomain(slug) as Record<string, unknown> | null;
  if (!practice) return NextResponse.json({ error: "Practice not found" }, { status: 404 });

  let services: string[] = [];
  try {
    const parsed = JSON.parse((practice.bookingServices as string) || "[]");
    services = parsed.map((s: { name: string }) => s.name);
  } catch {}

  return NextResponse.json({
    practice: {
      name: practice.name,
      type: practice.type,
      primaryColor: practice.primaryColor,
      secondaryColor: practice.secondaryColor,
      tagline: practice.tagline,
      logoUrl: practice.logoUrl,
      services,
    },
  });
}

// ─── Email Template ──────────────────────────────────

function referralConfirmationEmail(opts: {
  gpName: string;
  patientName: string;
  practiceName: string;
  reason: string;
  referralId: string;
  primaryColor: string;
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
    <div style="padding:32px;">
      <h2 style="margin:0 0 16px;color:#333;font-size:20px;">Referral Received</h2>
      <p style="color:#555;font-size:14px;line-height:1.6;">Dear Dr. ${opts.gpName},</p>
      <p style="color:#555;font-size:14px;line-height:1.6;">Thank you for referring <strong>${opts.patientName}</strong> to our practice. We have received your referral and will review it promptly.</p>
      <div style="background:#f8f8f8;border-radius:8px;padding:20px;margin:20px 0;">
        <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Patient:</strong> ${opts.patientName}</p>
        <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Reason:</strong> ${opts.reason.slice(0, 200)}</p>
        <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Reference:</strong> ${opts.referralId.slice(0, 8)}</p>
      </div>
      <p style="color:#555;font-size:14px;line-height:1.6;">We will contact the patient to schedule an appointment and send you a consultation report after their visit.</p>
      <p style="color:#555;font-size:14px;line-height:1.6;">Kind regards,<br/><strong>${opts.practiceName}</strong></p>
    </div>
    <div style="padding:16px 32px;background:#fafafa;border-top:1px solid #eee;text-align:center;">
      <p style="margin:0;color:#999;font-size:11px;">Powered by Netcare Health OS Ops</p>
    </div>
  </div>
</body>
</html>`;
}
