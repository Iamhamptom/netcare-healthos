/**
 * VRL Outreach Follow-Up Templates
 * 4-step follow-up cadence for all segments
 */

interface FollowUpData {
  recipientName: string;
  organization?: string;
  segment: string;
  originalSubject: string;
}

function followUpBase(content: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
    <div style="padding:32px;">
      ${content}
    </div>
    <div style="padding:16px 32px;background:#fafafa;border-top:1px solid #eee;text-align:center;">
      <p style="margin:0;color:#999;font-size:11px;">Netcare Technology · Netcare Health OS Ops</p>
    </div>
  </div>
</body>
</html>`;
}

// Step 1: Day 3 — Quick nudge
export function followUp1({ recipientName, originalSubject }: FollowUpData) {
  return {
    subject: `Re: ${originalSubject}`,
    html: followUpBase(`
      <p style="color:#555;font-size:14px;line-height:1.6;">Hi ${recipientName},</p>
      <p style="color:#555;font-size:14px;line-height:1.6;">Just wanted to make sure my previous email didn't get buried. I know inboxes are relentless.</p>
      <p style="color:#555;font-size:14px;line-height:1.6;">The short version: we've published research (VRL-001) on patient routing in SA healthcare — 120+ citations, real data — and I think there's a meaningful connection to your work.</p>
      <p style="color:#555;font-size:14px;line-height:1.6;">Happy to send the paper directly if that's easier than a call.</p>
      <p style="color:#555;font-size:14px;line-height:1.6;">Best,<br/><strong>Dr. Hampton</strong></p>
    `),
  };
}

// Step 2: Day 7 — Value-add stat
export function followUp2({ recipientName, originalSubject }: FollowUpData) {
  return {
    subject: `Re: ${originalSubject}`,
    html: followUpBase(`
      <p style="color:#555;font-size:14px;line-height:1.6;">Hi ${recipientName},</p>
      <p style="color:#555;font-size:14px;line-height:1.6;">Quick data point from our research that might interest you:</p>
      <div style="background:#f0fdf4;border-left:4px solid #10b981;padding:16px;margin:16px 0;border-radius:0 8px 8px 0;">
        <p style="margin:0;color:#333;font-size:14px;font-weight:600;">87% of SA healthcare professionals use EMGuidance daily, yet patient routing decisions are still largely manual — creating a gap that costs the system millions annually.</p>
      </div>
      <p style="color:#555;font-size:14px;line-height:1.6;">Our VRL-001 paper maps this gap in detail. Would 15 minutes be worthwhile to discuss what we found?</p>
      <p style="color:#555;font-size:14px;line-height:1.6;">Dr. Hampton</p>
    `),
  };
}

// Step 3: Day 14 — Different angle
export function followUp3({ recipientName, organization, originalSubject }: FollowUpData) {
  return {
    subject: `Different angle — ${originalSubject.replace("Re: ", "")}`,
    html: followUpBase(`
      <p style="color:#555;font-size:14px;line-height:1.6;">Hi ${recipientName},</p>
      <p style="color:#555;font-size:14px;line-height:1.6;">I wanted to try a different angle. Instead of what we're building, here's what we're seeing in the market:</p>
      <ul style="color:#555;font-size:14px;line-height:1.8;padding-left:20px;">
        <li>SA health-tech funding reached new highs — LifeQ ($47M), hearX/LXE ($100M merger)</li>
        <li>96% of SA doctors use WhatsApp for clinical decisions — but routing is still broken</li>
        <li>20,000+ healthcare professionals per year go through CPD on deNovo Medica alone</li>
      </ul>
      <p style="color:#555;font-size:14px;line-height:1.6;">${organization ? `I think ${organization} is` : "You're"} positioned to benefit from these trends. Our research connects the dots.</p>
      <p style="color:#555;font-size:14px;line-height:1.6;">No pressure — but the door's open if you'd like to chat.</p>
      <p style="color:#555;font-size:14px;line-height:1.6;">Dr. Hampton</p>
    `),
  };
}

// Step 4: Day 30 — Re-engage with new content
export function followUp4({ recipientName, originalSubject }: FollowUpData) {
  return {
    subject: `Final note — ${originalSubject.replace("Re: ", "").replace("Different angle — ", "")}`,
    html: followUpBase(`
      <p style="color:#555;font-size:14px;line-height:1.6;">Hi ${recipientName},</p>
      <p style="color:#555;font-size:14px;line-height:1.6;">Last email from me on this — I respect your time.</p>
      <p style="color:#555;font-size:14px;line-height:1.6;">Since my first email, we've had some developments:</p>
      <ul style="color:#555;font-size:14px;line-height:1.8;padding-left:20px;">
        <li>VRL-001 is gaining traction in the SA healthcare community</li>
        <li>We're finalizing a CPD module based on the research</li>
        <li>New pilot partnerships are in discussion</li>
      </ul>
      <p style="color:#555;font-size:14px;line-height:1.6;">If the timing's ever right, I'm at hampton@visiohealth.co.za. Would genuinely love to connect.</p>
      <p style="color:#555;font-size:14px;line-height:1.6;">All the best,<br/><strong>Dr. Hampton</strong><br/>Netcare Technology</p>
    `),
  };
}

export const FOLLOW_UP_STEPS = [followUp1, followUp2, followUp3, followUp4];
export const FOLLOW_UP_DAYS = [3, 7, 14, 30];
