/**
 * VRL Outreach Proposal Generators
 * Custom proposals for Hospital (Segment C) and Investor (Segment F) targets
 */

interface HospitalProposalData {
  recipientName: string;
  recipientTitle?: string;
  organization: string;
  facilityType?: string;
  bedCount?: number;
  location?: string;
}

interface InvestorProposalData {
  recipientName: string;
  organization: string;
  fundFocus?: string;
  ticketSize?: string;
}

export function hospitalProposal(data: HospitalProposalData) {
  const { recipientName, recipientTitle, organization, facilityType, bedCount, location } = data;
  return {
    subject: `Netcare Health OS Ops — Pilot Proposal for ${organization}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:700px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;">
  <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:32px;text-align:center;">
    <h1 style="margin:0;color:#D4AF37;font-size:22px;">Netcare Health OS Ops</h1>
    <p style="margin:8px 0 0;color:#ccc;font-size:13px;">Pilot Partnership Proposal for ${organization}</p>
  </div>
  <div style="padding:32px;">
    <p style="color:#555;font-size:14px;">Dear ${recipientTitle ? `${recipientTitle} ` : ""}${recipientName},</p>

    <h3 style="color:#333;margin-top:24px;">The Problem: Patient Routing Failures</h3>
    <p style="color:#555;font-size:14px;line-height:1.6;">Our peer-reviewed research (VRL-001, 120+ citations) documents systematic patient routing failures across SA healthcare. ${facilityType ? `For ${facilityType} facilities like ${organization}` : `For facilities like ${organization}`}, this translates directly to:</p>
    <ul style="color:#555;font-size:14px;line-height:1.8;">
      <li>Increased readmission rates from inappropriate discharge routing</li>
      <li>Revenue leakage from misrouted referrals</li>
      <li>Staff burnout from manual coordination overhead</li>
    </ul>

    <h3 style="color:#333;margin-top:24px;">The Solution: Netcare Health OS Ops</h3>
    <p style="color:#555;font-size:14px;line-height:1.6;">AI-powered practice management with intelligent patient routing, built specifically for the SA healthcare context.</p>

    <h3 style="color:#333;margin-top:24px;">Pilot Framework</h3>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr><td style="padding:10px;border:1px solid #eee;font-size:13px;color:#333;font-weight:600;">Duration</td><td style="padding:10px;border:1px solid #eee;font-size:13px;color:#555;">30 days</td></tr>
      <tr><td style="padding:10px;border:1px solid #eee;font-size:13px;color:#333;font-weight:600;">Cost</td><td style="padding:10px;border:1px solid #eee;font-size:13px;color:#555;">Zero upfront — performance-based</td></tr>
      ${bedCount ? `<tr><td style="padding:10px;border:1px solid #eee;font-size:13px;color:#333;font-weight:600;">Scope</td><td style="padding:10px;border:1px solid #eee;font-size:13px;color:#555;">${bedCount} beds, 2-3 departments</td></tr>` : ""}
      ${location ? `<tr><td style="padding:10px;border:1px solid #eee;font-size:13px;color:#333;font-weight:600;">Location</td><td style="padding:10px;border:1px solid #eee;font-size:13px;color:#555;">${location}</td></tr>` : ""}
      <tr><td style="padding:10px;border:1px solid #eee;font-size:13px;color:#333;font-weight:600;">KPIs</td><td style="padding:10px;border:1px solid #eee;font-size:13px;color:#555;">Routing accuracy, time-to-referral, patient satisfaction</td></tr>
      <tr><td style="padding:10px;border:1px solid #eee;font-size:13px;color:#333;font-weight:600;">Integration</td><td style="padding:10px;border:1px solid #eee;font-size:13px;color:#555;">Claims, scheduling, existing PMS</td></tr>
    </table>

    <h3 style="color:#333;margin-top:24px;">Next Steps</h3>
    <ol style="color:#555;font-size:14px;line-height:1.8;">
      <li>20-minute virtual walkthrough of platform + research</li>
      <li>Technical assessment of integration requirements</li>
      <li>Pilot agreement and timeline</li>
    </ol>

    <p style="color:#555;font-size:14px;margin-top:24px;">Respectfully,<br/><strong>Dr. Hampton</strong><br/>Netcare Technology</p>
  </div>
  <div style="padding:16px 32px;background:#fafafa;border-top:1px solid #eee;text-align:center;">
    <p style="margin:0;color:#999;font-size:11px;">VRL-001 · 120+ peer-reviewed citations · Research-backed healthcare technology</p>
  </div>
</div>
</body></html>`,
  };
}

export function investorProposal(data: InvestorProposalData) {
  const { recipientName, organization, fundFocus, ticketSize } = data;
  return {
    subject: `Netcare Health OS Ops — Investment Overview for ${organization}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:700px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;">
  <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:32px;text-align:center;">
    <h1 style="margin:0;color:#D4AF37;font-size:22px;">Netcare Health OS Ops</h1>
    <p style="margin:8px 0 0;color:#ccc;font-size:13px;">Investment Overview — Prepared for ${organization}</p>
  </div>
  <div style="padding:32px;">
    <p style="color:#555;font-size:14px;">Dear ${recipientName},</p>

    <h3 style="color:#333;margin-top:24px;">Market Opportunity</h3>
    <div style="display:flex;gap:16px;margin:16px 0;">
      <div style="flex:1;background:#f8f8f8;padding:16px;border-radius:8px;text-align:center;">
        <div style="font-size:24px;font-weight:bold;color:#8B5CF6;">R2B+</div>
        <div style="font-size:11px;color:#999;">SA Health Tech Market</div>
      </div>
      <div style="flex:1;background:#f8f8f8;padding:16px;border-radius:8px;text-align:center;">
        <div style="font-size:24px;font-weight:bold;color:#10b981;">7,000+</div>
        <div style="font-size:11px;color:#999;">Private Practices</div>
      </div>
      <div style="flex:1;background:#f8f8f8;padding:16px;border-radius:8px;text-align:center;">
        <div style="font-size:24px;font-weight:bold;color:#D4AF37;">120+</div>
        <div style="font-size:11px;color:#999;">Research Citations</div>
      </div>
    </div>

    ${fundFocus ? `<p style="color:#555;font-size:14px;line-height:1.6;"><strong>Alignment with ${organization}:</strong> ${fundFocus}</p>` : ""}

    <h3 style="color:#333;margin-top:24px;">Competitive Moat</h3>
    <ul style="color:#555;font-size:14px;line-height:1.8;">
      <li><strong>Research-backed:</strong> VRL-001 (120+ peer-reviewed citations) — no competitor has this</li>
      <li><strong>AI-native:</strong> Built from the ground up with AI at the core, not bolted on</li>
      <li><strong>Multi-tenant white-label:</strong> Each practice gets branded experience</li>
      <li><strong>Full-stack:</strong> Practice mgmt + routing + claims + patient engagement</li>
    </ul>

    <h3 style="color:#333;margin-top:24px;">Business Model</h3>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr><td style="padding:10px;border:1px solid #eee;font-size:13px;color:#333;font-weight:600;">Revenue</td><td style="padding:10px;border:1px solid #eee;font-size:13px;color:#555;">SaaS (R15K-R75K/practice/month) + usage-based AI credits</td></tr>
      <tr><td style="padding:10px;border:1px solid #eee;font-size:13px;color:#333;font-weight:600;">Target</td><td style="padding:10px;border:1px solid #eee;font-size:13px;color:#555;">R1M MRR within 12 months (20 practices)</td></tr>
      ${ticketSize ? `<tr><td style="padding:10px;border:1px solid #eee;font-size:13px;color:#333;font-weight:600;">Raise</td><td style="padding:10px;border:1px solid #eee;font-size:13px;color:#555;">Aligned with ${ticketSize} ticket range</td></tr>` : ""}
      <tr><td style="padding:10px;border:1px solid #eee;font-size:13px;color:#333;font-weight:600;">Use of funds</td><td style="padding:10px;border:1px solid #eee;font-size:13px;color:#555;">Sales team, enterprise features, SAHPRA compliance</td></tr>
    </table>

    <h3 style="color:#333;margin-top:24px;">Next Steps</h3>
    <p style="color:#555;font-size:14px;line-height:1.6;">30-minute walkthrough of product + research + financials. Full deck available immediately.</p>

    <p style="color:#555;font-size:14px;margin-top:24px;">Looking forward,<br/><strong>Dr. Hampton</strong><br/>Netcare Technology</p>
  </div>
  <div style="padding:16px 32px;background:#fafafa;border-top:1px solid #eee;text-align:center;">
    <p style="margin:0;color:#999;font-size:11px;">VRL-001 · Research-backed healthcare technology · visiohealth.co.za</p>
  </div>
</div>
</body></html>`,
  };
}
