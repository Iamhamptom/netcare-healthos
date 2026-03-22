// Resend email integration
// Docs: https://resend.com/docs

import { Resend } from "resend";

const fromEmail = process.env.RESEND_FROM_EMAIL || "Health OS <noreply@healthops.co.za>";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not configured — email sending is unavailable.");
  return new Resend(key);
}

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

/** Send a single email */
export async function sendEmail({ to, subject, html, replyTo }: EmailOptions) {
  const result = await getResend().emails.send({
    from: fromEmail,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    replyTo,
  });
  return result;
}

// ─── Email Templates ───────────────────────────────────

function baseTemplate(practiceName: string, primaryColor: string, content: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
    <div style="background:${primaryColor};padding:24px 32px;">
      <h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:600;">${practiceName}</h1>
    </div>
    <div style="padding:32px;">
      ${content}
    </div>
    <div style="padding:16px 32px;background:#fafafa;border-top:1px solid #eee;text-align:center;">
      <p style="margin:0;color:#999;font-size:11px;">Powered by Health OS — Research-backed healthcare technology by Visio Research Labs</p>
      <p style="margin:4px 0 0;color:#bbb;font-size:10px;">Proprietary AI · 120+ peer-reviewed citations · <a href="https://healthos.visiocorp.co/research" style="color:#16a34a;text-decoration:none;">Read our research</a></p>
    </div>
  </div>
</body>
</html>`;
}

/** Appointment confirmation email */
export function appointmentConfirmationEmail(opts: {
  practiceName: string;
  primaryColor: string;
  patientName: string;
  service: string;
  date: string;
  time: string;
  address: string;
}) {
  const content = `
    <h2 style="margin:0 0 16px;color:#333;font-size:20px;">Appointment Confirmed</h2>
    <p style="color:#555;font-size:14px;line-height:1.6;">Hi ${opts.patientName},</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">Your appointment has been confirmed:</p>
    <div style="background:#f8f8f8;border-radius:8px;padding:20px;margin:20px 0;">
      <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Service:</strong> ${opts.service}</p>
      <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Date:</strong> ${opts.date}</p>
      <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Time:</strong> ${opts.time}</p>
      <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Location:</strong> ${opts.address}</p>
    </div>
    <p style="color:#555;font-size:14px;line-height:1.6;">Please arrive 10 minutes early. If you need to reschedule, reply to this email or WhatsApp us.</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">See you soon!<br/><strong>${opts.practiceName}</strong></p>`;
  return {
    subject: `Appointment Confirmed — ${opts.date} at ${opts.time}`,
    html: baseTemplate(opts.practiceName, opts.primaryColor, content),
  };
}

/** Appointment reminder email */
export function appointmentReminderEmail(opts: {
  practiceName: string;
  primaryColor: string;
  patientName: string;
  service: string;
  date: string;
  time: string;
  hoursUntil: number;
}) {
  const content = `
    <h2 style="margin:0 0 16px;color:#333;font-size:20px;">Appointment Reminder</h2>
    <p style="color:#555;font-size:14px;line-height:1.6;">Hi ${opts.patientName},</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">This is a friendly reminder that your appointment is in <strong>${opts.hoursUntil} hours</strong>.</p>
    <div style="background:#f8f8f8;border-radius:8px;padding:20px;margin:20px 0;">
      <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Service:</strong> ${opts.service}</p>
      <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Date:</strong> ${opts.date}</p>
      <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Time:</strong> ${opts.time}</p>
    </div>
    <p style="color:#555;font-size:14px;line-height:1.6;">Need to reschedule? Just reply to this email.</p>`;
  return {
    subject: `Reminder: ${opts.service} tomorrow at ${opts.time}`,
    html: baseTemplate(opts.practiceName, opts.primaryColor, content),
  };
}

/** Invoice/receipt email */
export function invoiceEmail(opts: {
  practiceName: string;
  primaryColor: string;
  patientName: string;
  invoiceNumber: string;
  total: number;
  items: { description: string; amount: number }[];
  dueDate?: string;
}) {
  const itemsHtml = opts.items.map(item =>
    `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#555;font-size:14px;">${item.description}</td><td style="padding:8px 0;border-bottom:1px solid #eee;color:#333;font-size:14px;text-align:right;">R${item.amount.toLocaleString()}</td></tr>`
  ).join("");

  const content = `
    <h2 style="margin:0 0 16px;color:#333;font-size:20px;">Invoice #${opts.invoiceNumber}</h2>
    <p style="color:#555;font-size:14px;line-height:1.6;">Hi ${opts.patientName},</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">Please find your invoice below:</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;">
      <thead><tr><th style="text-align:left;padding:8px 0;border-bottom:2px solid #eee;color:#999;font-size:12px;text-transform:uppercase;">Description</th><th style="text-align:right;padding:8px 0;border-bottom:2px solid #eee;color:#999;font-size:12px;text-transform:uppercase;">Amount</th></tr></thead>
      <tbody>${itemsHtml}</tbody>
      <tfoot><tr><td style="padding:12px 0;font-weight:bold;color:#333;font-size:16px;">Total</td><td style="padding:12px 0;font-weight:bold;color:#333;font-size:16px;text-align:right;">R${opts.total.toLocaleString()}</td></tr></tfoot>
    </table>
    ${opts.dueDate ? `<p style="color:#555;font-size:14px;">Payment due by: <strong>${opts.dueDate}</strong></p>` : ""}
    <p style="color:#555;font-size:14px;line-height:1.6;">Payment methods: EFT, Credit Card, or Cash at reception.</p>`;
  return {
    subject: `Invoice #${opts.invoiceNumber} — R${opts.total.toLocaleString()}`,
    html: baseTemplate(opts.practiceName, opts.primaryColor, content),
  };
}

/** Onboarding welcome email — sent when admin onboards a new practice */
export function onboardingWelcomeEmail(opts: {
  practiceName: string;
  doctorName: string;
  email: string;
  tempPassword: string;
  plan: string;
  primaryColor: string;
  aiPersonality: string;
  botType: string;
}) {
  const planNames: Record<string, string> = {
    starter: "Starter — R2,999.99/month",
    core: "Core — R15,000/month",
    professional: "Professional — R35,000/month",
    enterprise: "Enterprise — R55,000/month",
  };

  const botNames: Record<string, string> = {
    healthcare_assistant: "Healthcare Assistant (General)",
    dental_specialist: "Dental Specialist Bot",
    wellness_concierge: "Wellness Concierge",
    radiology_intake: "Radiology Intake Agent",
    gp_triage: "GP Triage & Booking Agent",
    custom: "Custom Bot (configured post-onboarding)",
  };

  const planFeatures: Record<string, string[]> = {
    starter: [
      "Up to 200 patients",
      "1 staff account",
      "AI credits: R500/month",
      "20 qualified leads at onboarding",
      "Basic white-label website",
      "Standard support",
    ],
    core: [
      "Up to 500 patients",
      "3 staff accounts",
      "AI credits: R2,000/month",
      "50 qualified leads at onboarding",
      "White-label website with SEO",
      "Priority support (24h response)",
    ],
    professional: [
      "Unlimited patients",
      "10 staff accounts",
      "AI credits: R5,000/month",
      "100 qualified leads at onboarding",
      "Full white-label website + SEO + symptom checker",
      "5 AI agent courses for staff training",
      "WhatsApp AI bot (24/7 patient communication)",
      "ICD-10 SA medical billing with claim tracking",
      "GP referral pipeline with AI triage",
      "POPIA compliance dashboard + audit logging",
      "Daily task automation (morning briefing, check-in queue)",
      "Priority support (4h critical response)",
      "Custom domain option",
      "Dedicated onboarding manager (30 days)",
    ],
    enterprise: [
      "Everything in Professional, plus:",
      "Unlimited staff accounts",
      "AI credits: R8,000/month",
      "200 qualified leads at onboarding",
      "24/7 dedicated support",
      "Custom AI model fine-tuning",
      "Multi-practice management",
      "API access for integrations",
      "SLA with 99.9% uptime guarantee",
    ],
  };

  const features = planFeatures[opts.plan] || planFeatures.professional;
  const featuresHtml = features
    .map(f => `<li style="margin:6px 0;color:#333;font-size:14px;line-height:1.6;">${f}</li>`)
    .join("");

  const content = `
    <h2 style="margin:0 0 8px;color:#333;font-size:22px;font-weight:700;">Welcome to Health OS</h2>
    <p style="color:#16a34a;font-size:14px;font-weight:600;margin:0 0 20px;">Your practice is live. Let's transform how you operate.</p>

    <p style="color:#555;font-size:14px;line-height:1.6;">Dear Dr. ${opts.doctorName},</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">
      Welcome to Health OS — South Africa's AI-powered healthcare operations platform, built by Visio Research Labs.
      Your practice <strong>${opts.practiceName}</strong> has been onboarded to the <strong>${planNames[opts.plan] || opts.plan}</strong> plan.
    </p>

    <!-- Login Credentials -->
    <div style="background:#f0fdf4;border:2px solid #bbf7d0;border-radius:12px;padding:24px;margin:24px 0;">
      <h3 style="margin:0 0 12px;color:#166534;font-size:16px;">Your Login Credentials</h3>
      <table style="width:100%;">
        <tr><td style="color:#555;padding:4px 0;font-size:14px;width:100px;">Email:</td><td style="color:#333;font-weight:600;font-size:14px;">${opts.email}</td></tr>
        <tr><td style="color:#555;padding:4px 0;font-size:14px;">Password:</td><td style="color:#333;font-weight:600;font-size:14px;font-family:monospace;">${opts.tempPassword}</td></tr>
      </table>
      <p style="color:#ef4444;font-size:12px;margin:12px 0 0;font-weight:600;">Please change your password immediately after first login.</p>
    </div>

    <!-- Login Button -->
    <div style="text-align:center;margin:24px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://healthops.co.za"}/login" style="display:inline-block;background:#16a34a;color:#fff;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
        Log In to Your Dashboard
      </a>
    </div>

    <!-- Your Plan -->
    <div style="background:#fafafa;border:1px solid #eee;border-radius:12px;padding:24px;margin:24px 0;">
      <h3 style="margin:0 0 16px;color:#333;font-size:16px;">What's Included in Your ${planNames[opts.plan]?.split(" — ")[0] || "Professional"} Plan</h3>
      <ul style="padding-left:20px;margin:0;">${featuresHtml}</ul>
    </div>

    <!-- Your AI Bot -->
    <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;padding:24px;margin:24px 0;">
      <h3 style="margin:0 0 8px;color:#5b21b6;font-size:16px;">Your AI Bot</h3>
      <p style="color:#555;font-size:14px;line-height:1.6;margin:0;">
        <strong>${botNames[opts.botType] || opts.botType}</strong> — configured with a <strong>${opts.aiPersonality}</strong> personality.
        Your bot handles patient WhatsApp messages 24/7: appointment booking, cancellations, follow-ups, and triage.
        We'll pre-load and configure your bot within 24 hours of onboarding.
      </p>
    </div>

    <!-- What Happens Next -->
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:24px;margin:24px 0;">
      <h3 style="margin:0 0 12px;color:#92400e;font-size:16px;">What Happens Next</h3>
      <ol style="padding-left:20px;margin:0;">
        <li style="margin:8px 0;color:#555;font-size:14px;line-height:1.6;"><strong>Log in</strong> and complete your practice setup (branding, hours, services)</li>
        <li style="margin:8px 0;color:#555;font-size:14px;line-height:1.6;"><strong>WhatsApp Bot Setup</strong> — our team connects your Twilio WhatsApp number within 24h</li>
        <li style="margin:8px 0;color:#555;font-size:14px;line-height:1.6;"><strong>Lead Delivery</strong> — 100 qualified patient leads in your area pre-loaded into your system</li>
        <li style="margin:8px 0;color:#555;font-size:14px;line-height:1.6;"><strong>Staff Training</strong> — 5 AI agent training modules available in your dashboard</li>
        <li style="margin:8px 0;color:#555;font-size:14px;line-height:1.6;"><strong>Go Live</strong> — your dedicated onboarding manager guides you through the first 30 days</li>
      </ol>
    </div>

    <!-- Custom Domain -->
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:24px;margin:24px 0;">
      <h3 style="margin:0 0 8px;color:#0369a1;font-size:16px;">Custom Domain Options</h3>
      <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 8px;">Your Professional plan includes custom domain support. Choose one:</p>
      <ul style="padding-left:20px;margin:0;">
        <li style="margin:4px 0;color:#333;font-size:14px;"><strong>Free subdomain:</strong> ${opts.practiceName.toLowerCase().replace(/[^a-z0-9]/g, "")}.healthops.co.za</li>
        <li style="margin:4px 0;color:#333;font-size:14px;"><strong>Custom domain:</strong> bookings.your-practice.co.za (CNAME setup — we'll assist)</li>
        <li style="margin:4px 0;color:#333;font-size:14px;"><strong>Full domain:</strong> your-practice.co.za (DNS delegation — premium option)</li>
      </ul>
    </div>

    <!-- Legal Links -->
    <div style="border-top:2px solid #eee;padding-top:20px;margin-top:28px;">
      <p style="color:#555;font-size:13px;line-height:1.8;">
        By logging in, you agree to our:
      </p>
      <p style="margin:8px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://healthops.co.za"}/terms" style="color:#16a34a;text-decoration:none;font-size:13px;font-weight:600;">Terms of Service</a> ·
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://healthops.co.za"}/privacy" style="color:#16a34a;text-decoration:none;font-size:13px;font-weight:600;">Privacy Policy (POPIA)</a> ·
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://healthops.co.za"}/terms#cancellation" style="color:#16a34a;text-decoration:none;font-size:13px;font-weight:600;">Cancellation Policy</a>
      </p>
      <p style="color:#999;font-size:12px;line-height:1.6;margin-top:12px;">
        This email contains your login credentials. Please do not forward it. If you did not expect this email, contact us at support@visiocorp.co.
      </p>
    </div>

    <p style="color:#555;font-size:14px;line-height:1.6;margin-top:20px;">
      We're excited to partner with you, Dr. ${opts.doctorName}.<br/>
      <strong>— The Health OS Team</strong>
    </p>`;

  return {
    subject: `Welcome to Health OS — ${opts.practiceName} is Live`,
    html: baseTemplate(opts.practiceName, opts.primaryColor || "#16a34a", content),
  };
}

/** Follow-up email after appointment */
export function followUpEmail(opts: {
  practiceName: string;
  primaryColor: string;
  patientName: string;
  service: string;
  message: string;
}) {
  const content = `
    <h2 style="margin:0 0 16px;color:#333;font-size:20px;">How are you feeling?</h2>
    <p style="color:#555;font-size:14px;line-height:1.6;">Hi ${opts.patientName},</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">${opts.message}</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">If you have any concerns, don't hesitate to reach out.</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">Kind regards,<br/><strong>${opts.practiceName}</strong></p>`;
  return {
    subject: `Follow-up: Your recent ${opts.service}`,
    html: baseTemplate(opts.practiceName, opts.primaryColor, content),
  };
}
