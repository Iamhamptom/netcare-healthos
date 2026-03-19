/**
 * VRL Outreach Campaign Email Templates
 * 10 segment-specific templates (A-J) for SA health sector outreach
 */

interface TemplateData {
  recipientName: string;
  recipientTitle?: string;
  organization?: string;
  customData?: Record<string, string>;
}

function outreachBase(content: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
    <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:24px 32px;">
      <h1 style="margin:0;color:#D4AF37;font-size:18px;font-weight:600;">Netcare Technology</h1>
      <p style="margin:4px 0 0;color:#aaa;font-size:11px;">Research-backed healthcare technology for South Africa</p>
    </div>
    <div style="padding:32px;">
      ${content}
    </div>
    <div style="padding:16px 32px;background:#fafafa;border-top:1px solid #eee;text-align:center;">
      <p style="margin:0;color:#999;font-size:11px;">Netcare Technology · Netcare Health OS Ops</p>
      <p style="margin:4px 0 0;color:#bbb;font-size:10px;">VRL-001: 120+ peer-reviewed citations · <a href="https://healthops-platform-corpo1.vercel.app/research" style="color:#16a34a;text-decoration:none;">Read the research</a></p>
    </div>
  </div>
</body>
</html>`;
}

// ── Segment A: Media & Journalists ──
export function mediaPitchEmail({ recipientName, recipientTitle, organization }: TemplateData) {
  const subject = "VRL-001: SA's healthcare routing crisis — 120+ peer-reviewed citations";
  const html = outreachBase(`
    <h2 style="margin:0 0 16px;color:#333;font-size:20px;">Exclusive Research: The Routing Crisis in SA Healthcare</h2>
    <p style="color:#555;font-size:14px;line-height:1.6;">Hi ${recipientName},</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">I'm reaching out because ${organization ? `${organization}'s` : "your"} coverage of SA healthcare is exactly the kind of platform this research needs.</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">Netcare Technology just published <strong>VRL-001</strong> — a comprehensive study into patient routing failures across South Africa's healthcare system, backed by <strong>120+ peer-reviewed citations</strong>.</p>
    <div style="background:#f8f8f8;border-radius:8px;padding:20px;margin:20px 0;">
      <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Key findings:</strong></p>
      <ul style="color:#555;font-size:14px;line-height:1.8;padding-left:20px;">
        <li>Systematic breakdowns in how patients are routed between facilities</li>
        <li>Impact on NCD management and emergency care pathways</li>
        <li>Data-driven solutions already being piloted</li>
      </ul>
    </div>
    <p style="color:#555;font-size:14px;line-height:1.6;">Would you be interested in an exclusive on this? I can provide the full paper, data visualizations, and expert commentary.</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">Best regards,<br/><strong>Dr. Hampton</strong><br/>Netcare Technology</p>
  `);
  return { subject, html };
}

// ── Segment B: Health Tech Founders ──
export function founderIntroEmail({ recipientName, organization }: TemplateData) {
  const subject = "From one health-tech founder to another — VRL data you should see";
  const html = outreachBase(`
    <h2 style="margin:0 0 16px;color:#333;font-size:20px;">Fellow Builder in SA HealthTech</h2>
    <p style="color:#555;font-size:14px;line-height:1.6;">Hi ${recipientName},</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">What ${organization || "your team"} is building caught my attention. We're both trying to fix healthcare in SA — just from different angles.</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">We recently published <strong>VRL-001</strong> — a research paper on patient routing failures backed by 120+ citations. The data reveals patterns that every SA health-tech founder should know about.</p>
    <div style="background:#f8f8f8;border-radius:8px;padding:20px;margin:20px 0;">
      <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Why this matters for ${organization || "your product"}:</strong></p>
      <ul style="color:#555;font-size:14px;line-height:1.8;padding-left:20px;">
        <li>The routing crisis creates demand for exactly what we're building</li>
        <li>Peer-reviewed data to strengthen your next investor deck or partnership pitch</li>
        <li>Potential collaboration opportunities on complementary solutions</li>
      </ul>
    </div>
    <p style="color:#555;font-size:14px;line-height:1.6;">Would love to connect — even 15 minutes over a virtual coffee. I think there's real synergy here.</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">Building alongside you,<br/><strong>Dr. Hampton</strong><br/>Netcare Technology</p>
  `);
  return { subject, html };
}

// ── Segment C: Hospital Executives ──
export function hospitalProposalEmail({ recipientName, recipientTitle, organization }: TemplateData) {
  const subject = `Netcare Health OS + ${organization || "your hospital"}: Reducing patient routing failures`;
  const html = outreachBase(`
    <h2 style="margin:0 0 16px;color:#333;font-size:20px;">A Research-Backed Approach to Patient Routing</h2>
    <p style="color:#555;font-size:14px;line-height:1.6;">Dear ${recipientTitle ? `${recipientTitle} ` : ""}${recipientName},</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">Patient routing failures cost SA hospitals millions in inefficiency, readmissions, and lost outcomes. Our research (VRL-001, 120+ citations) quantifies this problem — and we've built a solution.</p>
    <div style="background:#f8f8f8;border-radius:8px;padding:20px;margin:20px 0;">
      <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Pilot Proposal for ${organization || "your facility"}:</strong></p>
      <ul style="color:#555;font-size:14px;line-height:1.8;padding-left:20px;">
        <li><strong>Netcare Health OS Ops</strong> — AI-assisted practice management with intelligent patient routing</li>
        <li>30-day pilot, zero upfront cost, measurable outcomes</li>
        <li>Integration with existing systems (claims, scheduling, records)</li>
        <li>Research backing makes this defensible for board approval</li>
      </ul>
    </div>
    <p style="color:#555;font-size:14px;line-height:1.6;">I'd welcome 20 minutes to walk through the research and pilot framework. What does your calendar look like next week?</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">Respectfully,<br/><strong>Dr. Hampton</strong><br/>Netcare Technology</p>
  `);
  return { subject, html };
}

// ── Segment D: Medical Scheme Execs ──
export function schemeIntegrationEmail({ recipientName, organization }: TemplateData) {
  const subject = `Claims routing intelligence for ${organization || "your"} members`;
  const html = outreachBase(`
    <h2 style="margin:0 0 16px;color:#333;font-size:20px;">Smarter Claims Through Better Routing</h2>
    <p style="color:#555;font-size:14px;line-height:1.6;">Dear ${recipientName},</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">Our research (VRL-001) shows that routing failures don't just harm patients — they inflate claims costs through inappropriate referrals, duplicate consultations, and emergency presentations that could have been prevented.</p>
    <div style="background:#f8f8f8;border-radius:8px;padding:20px;margin:20px 0;">
      <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Integration opportunity for ${organization || "your scheme"}:</strong></p>
      <ul style="color:#555;font-size:14px;line-height:1.8;padding-left:20px;">
        <li>AI-assisted routing reduces unnecessary referrals</li>
        <li>Real-time claims validation at point of care</li>
        <li>Member satisfaction through faster, smarter pathways</li>
        <li>Data-backed — 120+ peer-reviewed citations</li>
      </ul>
    </div>
    <p style="color:#555;font-size:14px;line-height:1.6;">Would your innovation team be open to a 30-minute presentation? Happy to share the full research paper in advance.</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">Kind regards,<br/><strong>Dr. Hampton</strong><br/>Netcare Technology</p>
  `);
  return { subject, html };
}

// ── Segment E: Professional Associations ──
export function associationCPDEmail({ recipientName, organization }: TemplateData) {
  const subject = "CPD module proposal: AI-assisted patient routing (VRL-001)";
  const html = outreachBase(`
    <h2 style="margin:0 0 16px;color:#333;font-size:20px;">Free CPD Module for ${organization || "Your"} Members</h2>
    <p style="color:#555;font-size:14px;line-height:1.6;">Dear ${recipientName},</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">We've developed a CPD-accreditable module based on our peer-reviewed research (VRL-001) on patient routing in SA healthcare. We'd love to offer it to ${organization || "your association"}'s members — completely free.</p>
    <div style="background:#f8f8f8;border-radius:8px;padding:20px;margin:20px 0;">
      <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Module overview:</strong></p>
      <ul style="color:#555;font-size:14px;line-height:1.8;padding-left:20px;">
        <li><strong>Topic:</strong> AI-Assisted Patient Routing — Evidence & Practice</li>
        <li><strong>Format:</strong> 1-hour online module with assessment</li>
        <li><strong>CPD points:</strong> Application pending (Ethics & Professional Practice)</li>
        <li><strong>Evidence base:</strong> 120+ peer-reviewed citations</li>
        <li><strong>Cost:</strong> Free to members</li>
      </ul>
    </div>
    <p style="color:#555;font-size:14px;line-height:1.6;">This positions ${organization || "your organization"} at the forefront of AI in healthcare education. Could we discuss this further?</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">With respect,<br/><strong>Dr. Hampton</strong><br/>Netcare Technology</p>
  `);
  return { subject, html };
}

// ── Segment F: Investors & Funds ──
export function investorDeckEmail({ recipientName, organization }: TemplateData) {
  const subject = "Netcare Health OS Ops — R2B SA health tech, backed by peer-reviewed research";
  const html = outreachBase(`
    <h2 style="margin:0 0 16px;color:#333;font-size:20px;">Investment Opportunity: Netcare Health OS Ops</h2>
    <p style="color:#555;font-size:14px;line-height:1.6;">Dear ${recipientName},</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">${organization ? `${organization}'s focus on` : "Your focus on"} African health-tech is precisely aligned with what we're building. Netcare Health OS Ops is an AI-powered practice management platform solving the routing crisis in SA healthcare — backed by peer-reviewed research.</p>
    <div style="background:#f8f8f8;border-radius:8px;padding:20px;margin:20px 0;">
      <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Why now:</strong></p>
      <ul style="color:#555;font-size:14px;line-height:1.8;padding-left:20px;">
        <li><strong>Market:</strong> R2B+ SA health tech, 7,000+ private practices underserved</li>
        <li><strong>Moat:</strong> VRL-001 research paper (120+ citations) — no competitor has this</li>
        <li><strong>Product:</strong> AI practice management + patient routing + claims intelligence</li>
        <li><strong>Traction:</strong> Platform live, multi-tenant, white-label ready</li>
        <li><strong>Team:</strong> Deep domain expertise in SA healthcare + AI</li>
      </ul>
    </div>
    <p style="color:#555;font-size:14px;line-height:1.6;">I'd welcome 30 minutes to walk through our deck and research. Attached is our one-pager — full deck available on request.</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">Looking forward,<br/><strong>Dr. Hampton</strong><br/>Netcare Technology</p>
  `);
  return { subject, html };
}

// ── Segment G: Conference Organizers ──
export function conferenceSpeakerEmail({ recipientName, organization }: TemplateData) {
  const subject = "Speaker proposal: AI routing in SA healthcare (120+ citations)";
  const html = outreachBase(`
    <h2 style="margin:0 0 16px;color:#333;font-size:20px;">Speaker/Abstract Proposal</h2>
    <p style="color:#555;font-size:14px;line-height:1.6;">Dear ${recipientName},</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">I'd like to propose a presentation for ${organization || "your conference"} based on our recently published research on AI-assisted patient routing in SA healthcare.</p>
    <div style="background:#f8f8f8;border-radius:8px;padding:20px;margin:20px 0;">
      <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Proposed talk:</strong></p>
      <ul style="color:#555;font-size:14px;line-height:1.8;padding-left:20px;">
        <li><strong>Title:</strong> "Beyond the Queue: AI-Assisted Patient Routing for South Africa"</li>
        <li><strong>Research:</strong> VRL-001, 120+ peer-reviewed citations</li>
        <li><strong>Format:</strong> 20-min presentation + Q&A, or panel participation</li>
        <li><strong>Audience:</strong> Healthcare executives, clinicians, health informaticists</li>
        <li><strong>Live demo:</strong> Netcare Health OS Ops platform walkthrough available</li>
      </ul>
    </div>
    <p style="color:#555;font-size:14px;line-height:1.6;">Happy to submit a formal abstract if there's interest. The research brings fresh SA-specific data that audiences consistently engage with.</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">Thank you for considering,<br/><strong>Dr. Hampton</strong><br/>Netcare Technology</p>
  `);
  return { subject, html };
}

// ── Segment H: CPD Platforms ──
export function cpdModuleEmail({ recipientName, organization }: TemplateData) {
  const subject = "Free CPD module based on peer-reviewed SA routing research";
  const html = outreachBase(`
    <h2 style="margin:0 0 16px;color:#333;font-size:20px;">CPD Content Partnership</h2>
    <p style="color:#555;font-size:14px;line-height:1.6;">Hi ${recipientName},</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">${organization || "Your platform"} is where SA healthcare professionals go for quality CPD content. We have a module that fits perfectly.</p>
    <div style="background:#f8f8f8;border-radius:8px;padding:20px;margin:20px 0;">
      <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Module: AI-Assisted Patient Routing in SA</strong></p>
      <ul style="color:#555;font-size:14px;line-height:1.8;padding-left:20px;">
        <li>Based on VRL-001 (120+ peer-reviewed citations)</li>
        <li>1-hour format with interactive assessment</li>
        <li>Covers: routing failures, AI solutions, implementation frameworks</li>
        <li>Ready-to-publish content — slides, transcript, quiz included</li>
        <li>We provide it free; ${organization || "you"} retain CPD accreditation credit</li>
      </ul>
    </div>
    <p style="color:#555;font-size:14px;line-height:1.6;">This is high-quality, SA-specific content that your users won't find elsewhere. Shall we set up a quick call?</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">Best,<br/><strong>Dr. Hampton</strong><br/>Netcare Technology</p>
  `);
  return { subject, html };
}

// ── Segment I: Practice Consultants ──
export function consultantPartnerEmail({ recipientName, organization }: TemplateData) {
  const subject = "Practice management tool your clients need — research-backed";
  const html = outreachBase(`
    <h2 style="margin:0 0 16px;color:#333;font-size:20px;">A Tool Your Clients Will Thank You For</h2>
    <p style="color:#555;font-size:14px;line-height:1.6;">Hi ${recipientName},</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">You help practices run better. We've built the technology that makes that easier — and we have the research to prove it works.</p>
    <div style="background:#f8f8f8;border-radius:8px;padding:20px;margin:20px 0;">
      <p style="margin:4px 0;color:#333;font-size:14px;"><strong>Referral partnership:</strong></p>
      <ul style="color:#555;font-size:14px;line-height:1.8;padding-left:20px;">
        <li><strong>Netcare Health OS Ops:</strong> AI practice management with intelligent routing</li>
        <li><strong>Your value-add:</strong> Recommend a proven, research-backed platform to clients</li>
        <li><strong>Revenue share:</strong> Referral commission on every client you bring</li>
        <li><strong>Research backing:</strong> VRL-001 (120+ citations) — credibility for your recommendation</li>
      </ul>
    </div>
    <p style="color:#555;font-size:14px;line-height:1.6;">Would love to explore a referral partnership. 15 minutes to walk you through the platform?</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">Cheers,<br/><strong>Dr. Hampton</strong><br/>Netcare Technology</p>
  `);
  return { subject, html };
}

// ── Segment J: Clinical Champions ──
export function championInviteEmail({ recipientName, recipientTitle, organization }: TemplateData) {
  const subject = "Invitation: Become a Netcare Health OS Clinical Champion";
  const html = outreachBase(`
    <h2 style="margin:0 0 16px;color:#333;font-size:20px;">Clinical Champion Invitation</h2>
    <p style="color:#555;font-size:14px;line-height:1.6;">Dear ${recipientTitle ? `${recipientTitle} ` : ""}${recipientName},</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">Your work at ${organization || "your practice"} represents exactly the kind of clinical excellence we want championing better healthcare technology in SA.</p>
    <div style="background:#f8f8f8;border-radius:8px;padding:20px;margin:20px 0;">
      <p style="margin:4px 0;color:#333;font-size:14px;"><strong>What Clinical Champions get:</strong></p>
      <ul style="color:#555;font-size:14px;line-height:1.8;padding-left:20px;">
        <li><strong>Free lifetime access</strong> to Netcare Health OS Ops (Professional tier)</li>
        <li><strong>Co-authorship opportunities</strong> on future VRL papers</li>
        <li><strong>Speaking invitations</strong> at our events and partner conferences</li>
        <li><strong>Early access</strong> to new features and AI capabilities</li>
        <li><strong>Advisory input</strong> into product roadmap (quarterly sessions)</li>
      </ul>
    </div>
    <p style="color:#555;font-size:14px;line-height:1.6;">We're selecting only 10 champions nationally. Your clinical perspective would be invaluable in shaping how AI serves SA healthcare.</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">Would you be open to a conversation about this?</p>
    <p style="color:#555;font-size:14px;line-height:1.6;">With admiration,<br/><strong>Dr. Hampton</strong><br/>Netcare Technology</p>
  `);
  return { subject, html };
}

// ── Template Registry ──
export const SEGMENT_TEMPLATES: Record<string, {
  key: string;
  label: string;
  color: string;
  generator: (data: TemplateData) => { subject: string; html: string };
}> = {
  A: { key: "media_pitch", label: "Media & Journalists", color: "#ef4444", generator: mediaPitchEmail },
  B: { key: "founder_intro", label: "Health Tech Founders", color: "#f97316", generator: founderIntroEmail },
  C: { key: "hospital_proposal", label: "Hospital Executives", color: "#8B5CF6", generator: hospitalProposalEmail },
  D: { key: "scheme_integration", label: "Medical Scheme Execs", color: "#0ea5e9", generator: schemeIntegrationEmail },
  E: { key: "association_cpd", label: "Professional Associations", color: "#10b981", generator: associationCPDEmail },
  F: { key: "investor_deck", label: "Investors & Funds", color: "#D4AF37", generator: investorDeckEmail },
  G: { key: "conference_speaker", label: "Conference Organizers", color: "#ec4899", generator: conferenceSpeakerEmail },
  H: { key: "cpd_module", label: "CPD Platforms", color: "#14b8a6", generator: cpdModuleEmail },
  I: { key: "consultant_partner", label: "Practice Consultants", color: "#a855f7", generator: consultantPartnerEmail },
  J: { key: "champion_invite", label: "Clinical Champions", color: "#2DD4BF", generator: championInviteEmail },
};

export type { TemplateData };
