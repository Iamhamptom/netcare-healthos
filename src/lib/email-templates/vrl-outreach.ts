/**
 * VRL Research-Backed Outreach Email Templates
 * Used by Steinberg, OpenClaw, and manual outreach campaigns
 * All claims backed by VRL-001 research paper (120+ citations)
 */

export function vrlResearchIntroEmail(opts: {
  recipientName: string;
  recipientTitle?: string;
  practiceName?: string;
  practiceType?: string; // "dental" | "gp" | "ent" | "oncology" | "hospital" | "clinic"
}) {
  const name = opts.recipientName.split(" ")[0];
  const practiceRef = opts.practiceName ? ` at ${opts.practiceName}` : "";

  return {
    subject: `Research: 10,000+ preventable deaths per year — and what your practice can do`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

    <!-- Header -->
    <div style="background:#1D3443;padding:28px 32px;">
      <p style="margin:0 0 4px;color:rgba(255,255,255,0.4);font-size:10px;text-transform:uppercase;letter-spacing:0.15em;font-family:monospace;">Netcare Technology</p>
      <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:300;letter-spacing:-0.02em;">New Research: The Routing Crisis</h1>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <p style="color:#333;font-size:14px;line-height:1.7;">Dear ${opts.recipientTitle ? opts.recipientTitle + " " : ""}${name},</p>

      <p style="color:#555;font-size:14px;line-height:1.7;">
        Our research lab just published VRL-001 — a comprehensive analysis of preventable deaths from healthcare routing failures in South Africa, drawing on <strong>120+ peer-reviewed sources</strong> from Nature Medicine, BMJ, JAMA, and the Lancet.
      </p>

      <p style="color:#555;font-size:14px;line-height:1.7;">The headline findings:</p>

      <!-- Key stats -->
      <div style="background:#f8faf9;border-radius:12px;padding:20px;margin:20px 0;border-left:3px solid #16a34a;">
        <p style="margin:4px 0;color:#333;font-size:14px;"><strong>91.1%</strong> of hypertensive South Africans are uncontrolled</p>
        <p style="margin:4px 0;color:#333;font-size:14px;"><strong>&lt;1%</strong> of stroke patients receive thrombolysis (vs 10-15% achievable)</p>
        <p style="margin:4px 0;color:#333;font-size:14px;"><strong>6 hours</strong> median time to sepsis antibiotics (target: 1 hour)</p>
        <p style="margin:4px 0;color:#333;font-size:14px;"><strong>45%</strong> of trauma deaths are preventable with better routing</p>
        <p style="margin:12px 0 4px;color:#16a34a;font-size:14px;font-weight:600;">10,000–20,000 lives saveable per year at national scale.</p>
      </div>

      <p style="color:#555;font-size:14px;line-height:1.7;">
        The evidence also shows that digital health platforms — AI triage, automated recall, medication safety checks — directly reduce these numbers. A Ugandan deployment achieved <strong>75% mortality reduction</strong>. The UK NHS proved a <strong>14% mortality reduction</strong> just from enforcing a 4-hour wait target.
      </p>

      <p style="color:#555;font-size:14px;line-height:1.7;">
        We built Netcare Health OS to be the infrastructure layer that makes this possible for every practice in South Africa — starting with yours${practiceRef}.
      </p>

      <!-- CTA -->
      <div style="margin:28px 0;text-align:center;">
        <a href="https://healthops-platform-corpo1.vercel.app/research/vrl-001" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 28px;border-radius:100px;text-decoration:none;font-size:14px;font-weight:500;">
          Read the Full Paper
        </a>
      </div>

      <p style="color:#555;font-size:14px;line-height:1.7;">
        I would welcome 15 minutes to discuss how our ecosystem applies to your practice. Would any time this week work?
      </p>

      <p style="color:#555;font-size:14px;line-height:1.7;">
        Warm regards,<br/>
        <strong>David Hampton</strong><br/>
        <span style="color:#999;font-size:12px;">CEO & Founder, VisioCorp<br/>
        Netcare Technology · Netcare Health OS<br/>
        davidhampton@visiocorp.co</span>
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:16px 32px;background:#fafafa;border-top:1px solid #eee;text-align:center;">
      <p style="margin:0;color:#bbb;font-size:10px;font-family:monospace;">
        VRL-001 · March 2026 · 120+ citations · CC BY-NC 4.0
      </p>
      <p style="margin:4px 0 0;color:#ccc;font-size:10px;">
        <a href="https://healthops-platform-corpo1.vercel.app/research" style="color:#16a34a;text-decoration:none;">All Publications</a> ·
        <a href="https://healthops-platform-corpo1.vercel.app/impact" style="color:#16a34a;text-decoration:none;">Ecosystem Impact</a> ·
        <a href="https://healthops-platform-corpo1.vercel.app/ecosystem" style="color:#16a34a;text-decoration:none;">Products</a>
      </p>
    </div>
  </div>
</body>
</html>`,
  };
}

export function vrlFollowUpEmail(opts: {
  recipientName: string;
  recipientTitle?: string;
}) {
  const name = opts.recipientName.split(" ")[0];

  return {
    subject: `Quick follow-up — VRL-001 and your practice`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
    <div style="padding:32px;">
      <p style="color:#333;font-size:14px;line-height:1.7;">Hi ${name},</p>

      <p style="color:#555;font-size:14px;line-height:1.7;">
        Following up on the research paper I shared last week. A few data points that are particularly relevant for private practices:
      </p>

      <ul style="color:#555;font-size:14px;line-height:1.9;padding-left:20px;">
        <li><strong>40-50%</strong> fewer missed appointments with automated WhatsApp reminders (KZN study)</li>
        <li><strong>57.4%</strong> of prescriptions contain errors — our medication safety system catches these</li>
        <li><strong>20%</strong> of medical aid claims denied — 90% are avoidable with digital ICD-10 coding</li>
        <li><strong>R125.3B</strong> in medico-legal claims nationally — proper audit trails protect practices</li>
      </ul>

      <p style="color:#555;font-size:14px;line-height:1.7;">
        These aren't hypothetical — they're published results. Happy to walk through how they apply to your workflow specifically.
      </p>

      <p style="color:#555;font-size:14px;line-height:1.7;">15 minutes this week?</p>

      <p style="color:#555;font-size:14px;line-height:1.7;">
        David<br/>
        <span style="color:#999;font-size:12px;">davidhampton@visiocorp.co · VisioCorp</span>
      </p>
    </div>

    <div style="padding:12px 32px;background:#fafafa;border-top:1px solid #eee;text-align:center;">
      <p style="margin:0;color:#ccc;font-size:10px;">
        <a href="https://healthops-platform-corpo1.vercel.app/research/vrl-001" style="color:#16a34a;text-decoration:none;">Read VRL-001</a> ·
        <a href="https://healthops-platform-corpo1.vercel.app/impact" style="color:#16a34a;text-decoration:none;">Ecosystem Impact</a>
      </p>
    </div>
  </div>
</body>
</html>`,
  };
}

export function vrlNewsletterAnnouncementEmail() {
  return {
    subject: `[VRL-001] New Research: The Routing Crisis — Preventable Deaths in South African Healthcare`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

    <div style="background:#1D3443;padding:32px;text-align:center;">
      <p style="margin:0 0 8px;color:rgba(255,255,255,0.3);font-size:10px;text-transform:uppercase;letter-spacing:0.2em;font-family:monospace;">Netcare Technology · Newsletter</p>
      <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:300;letter-spacing:-0.02em;">New Paper Published</h1>
    </div>

    <div style="padding:32px;">
      <h2 style="color:#333;font-size:18px;font-weight:600;margin:0 0 8px;">VRL-001: The Routing Crisis</h2>
      <p style="color:#16a34a;font-size:13px;font-family:monospace;margin:0 0 20px;">Preventable Deaths from Healthcare System Navigation Failures in South Africa</p>

      <p style="color:#555;font-size:14px;line-height:1.7;">
        We're proud to publish our first research paper — a comprehensive analysis drawing on <strong>120+ peer-reviewed sources</strong> from Nature Medicine, BMJ, JAMA, the Lancet, WHO, and South African government reports.
      </p>

      <div style="background:#f0fdf4;border-radius:12px;padding:24px;margin:24px 0;">
        <p style="margin:0 0 12px;color:#333;font-size:14px;font-weight:600;">Key Findings:</p>
        <p style="margin:4px 0;color:#555;font-size:13px;">50,000–89,000 preventable deaths per year in SA from routing failures</p>
        <p style="margin:4px 0;color:#555;font-size:13px;">12 time-critical conditions analyzed with golden window data</p>
        <p style="margin:4px 0;color:#555;font-size:13px;">8 digital health interventions proven to reduce mortality</p>
        <p style="margin:4px 0;color:#555;font-size:13px;">10,000–20,000 lives saveable at national scale</p>
        <p style="margin:4px 0;color:#555;font-size:13px;">100,000–200,000 lives over a decade</p>
      </div>

      <div style="text-align:center;margin:28px 0;">
        <a href="https://healthops-platform-corpo1.vercel.app/research/vrl-001" style="display:inline-block;background:#16a34a;color:#fff;padding:14px 32px;border-radius:100px;text-decoration:none;font-size:14px;font-weight:500;">
          Read the Full Paper
        </a>
      </div>

      <p style="color:#999;font-size:12px;line-height:1.6;text-align:center;">
        Published under CC BY-NC 4.0 · Open access · Cite as: VRL/2026/001
      </p>
    </div>

    <div style="padding:16px 32px;background:#fafafa;border-top:1px solid #eee;text-align:center;">
      <p style="margin:0;color:#bbb;font-size:10px;">Netcare Technology · Johannesburg, South Africa</p>
      <p style="margin:4px 0 0;color:#ccc;font-size:10px;">
        <a href="https://healthops-platform-corpo1.vercel.app/research" style="color:#16a34a;text-decoration:none;">All Publications</a> ·
        <a href="https://healthops-platform-corpo1.vercel.app/impact" style="color:#16a34a;text-decoration:none;">Impact</a> ·
        <a href="https://healthops-platform-corpo1.vercel.app/ecosystem" style="color:#16a34a;text-decoration:none;">Ecosystem</a>
      </p>
    </div>
  </div>
</body>
</html>`,
  };
}
