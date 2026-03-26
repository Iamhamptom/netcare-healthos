import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";

/**
 * Outreach Campaign Generator
 *
 * POST /api/outreach/generate
 * Generates targeted patient acquisition campaigns:
 * - Ad copy (Google Ads, Facebook/Instagram, LinkedIn)
 * - Social media posts
 * - Email/WhatsApp templates
 * - Landing page content
 * - SEO keyword targets
 *
 * All campaigns end with "Book now on WhatsApp" CTA
 */

interface OutreachRequest {
  practiceId?: string;
  campaignType: "google_ads" | "social_media" | "email_sequence" | "whatsapp_blast" | "seo_content" | "full_campaign";
  target: {
    condition?: string;       // e.g. "rheumatoid arthritis", "lupus", "joint pain"
    location?: string;        // e.g. "Johannesburg", "Boksburg", "Pretoria"
    demographic?: string;     // e.g. "women 30-55", "men over 40"
    painPoint?: string;       // e.g. "been in pain for months", "GP can't diagnose"
  };
  practice: {
    name: string;
    whatsappNumber?: string;
    whatsappLink?: string;    // wa.me/27xxxxxxx
    website?: string;
    services?: string[];
    locations?: string[];
    pricing?: { consultation?: number; followUp?: number };
  };
  tone?: "professional" | "empathetic" | "urgent" | "educational";
}

export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, "outreach/generate", { limit: 15 });
  if (!rl.allowed) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  try {
    const body: OutreachRequest = await request.json();
    const { campaignType, target, practice, tone = "empathetic" } = body;

    if (!campaignType || !target || !practice?.name) {
      return NextResponse.json({ error: "campaignType, target, and practice.name required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI not configured" }, { status: 500 });
    }

    const prompt = buildOutreachPrompt(campaignType, target, practice, tone);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 4096 },
        }),
      }
    );

    const result = await res.json();
    const content = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      return NextResponse.json({ error: "Generation failed" }, { status: 500 });
    }

    return NextResponse.json({
      campaign: content,
      type: campaignType,
      target,
      generatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Outreach generation failed" }, { status: 500 });
  }
}

function buildOutreachPrompt(
  type: OutreachRequest["campaignType"],
  target: OutreachRequest["target"],
  practice: OutreachRequest["practice"],
  tone: string
): string {
  const whatsappCTA = practice.whatsappLink
    ? `Book now on WhatsApp: ${practice.whatsappLink}`
    : `Message us on WhatsApp to book`;

  const practiceInfo = `
Practice: ${practice.name}
Website: ${practice.website || "rheumcare.co.za"}
WhatsApp: ${practice.whatsappNumber || "Available"}
Locations: ${practice.locations?.join(", ") || "Johannesburg, Boksburg, Pretoria, Trichardt"}
New consultation: R${practice.pricing?.consultation || 2600}
Follow-up: R${practice.pricing?.followUp || 1400}
Services: ${practice.services?.join(", ") || "Rheumatoid arthritis, Lupus, Gout, Psoriatic arthritis, Joint injections, Biologic infusions, Musculoskeletal ultrasound"}`;

  const targetInfo = `
Condition focus: ${target.condition || "autoimmune/rheumatic conditions"}
Location targeting: ${target.location || "Gauteng, South Africa"}
Demographic: ${target.demographic || "adults 25-65"}
Pain point: ${target.painPoint || "chronic joint pain, undiagnosed autoimmune symptoms, long wait times"}`;

  const toneGuide: Record<string, string> = {
    professional: "Clinical, authoritative, evidence-based. Position the doctor as an expert.",
    empathetic: "Warm, understanding, patient-first. Acknowledge the pain and frustration.",
    urgent: "Time-sensitive, action-oriented. Emphasize early diagnosis prevents damage.",
    educational: "Informative, myth-busting. Teach about the condition, then offer help.",
  };

  const base = `You are a healthcare marketing specialist for South African specialist practices. Create compelling, HPCSA-compliant patient acquisition content. Do NOT make medical claims or guarantee outcomes. Do NOT use before/after language. All content must be ethical, truthful, and end with a clear WhatsApp booking CTA.

${practiceInfo}
${targetInfo}
Tone: ${toneGuide[tone] || toneGuide.empathetic}
CTA: ${whatsappCTA}

IMPORTANT: All content must comply with HPCSA advertising guidelines (no testimonials, no guarantees, no comparison with other practitioners, no claims of superiority). Focus on services offered, doctor qualifications, and patient convenience.`;

  switch (type) {
    case "google_ads":
      return `${base}

Generate 5 Google Ads campaigns for this practice:

For EACH campaign, provide:
1. **Campaign name**
2. **Target keywords** (10 keywords, mix of exact, phrase, and broad match)
3. **Headline 1** (max 30 chars)
4. **Headline 2** (max 30 chars)
5. **Headline 3** (max 30 chars)
6. **Description 1** (max 90 chars)
7. **Description 2** (max 90 chars)
8. **Display URL path** (/path1/path2)
9. **Sitelink extensions** (4 sitelinks with titles and descriptions)
10. **Suggested daily budget** (in ZAR)
11. **Expected CPC range** (in ZAR)
12. **Negative keywords** (to avoid wasted spend)

Campaigns should cover:
1. Condition-specific (e.g., "rheumatoid arthritis specialist")
2. Symptom-based (e.g., "joint pain doctor Johannesburg")
3. Location-based (e.g., "rheumatologist Sandton")
4. Urgent/emergency (e.g., "sudden joint swelling")
5. Brand awareness (e.g., "RheumCare specialist clinic")`;

    case "social_media":
      return `${base}

Generate a 2-week social media content calendar (14 posts) for Facebook and Instagram:

For EACH post, provide:
1. **Day and platform** (FB, IG, or both)
2. **Post type** (image, carousel, reel/video, story)
3. **Caption** (engaging, with relevant hashtags — max 5 hashtags)
4. **Image/visual description** (what the creative should show)
5. **Call to action** (always include WhatsApp booking link)

Content mix should include:
- Educational (what is RA, lupus, gout — myth busting)
- Patient convenience (5 locations, WhatsApp booking, short wait times)
- Doctor credentials (Dr. Ziki's qualifications, experience)
- Service spotlight (biologic infusions, joint injections, ultrasound)
- Community (autoimmune awareness, World Arthritis Day themes)
- Behind the scenes (practice, team, facilities)

Also generate:
- **5 Instagram/Facebook Story ad designs** with swipe-up to WhatsApp
- **3 Facebook Lead Ad forms** with qualifying questions
- **Suggested monthly ad budget**: ZAR amount with expected reach`;

    case "email_sequence":
      return `${base}

Generate a 5-email nurture sequence for potential patients who have expressed interest but haven't booked:

For EACH email:
1. **Subject line** (compelling, max 60 chars)
2. **Preview text** (max 100 chars)
3. **Email body** (200-300 words, formatted in markdown)
4. **CTA button text** and link (WhatsApp booking)
5. **Send timing** (day 1, day 3, day 7, day 14, day 30)

Sequence strategy:
- Email 1 (Day 1): Welcome + introduce the practice
- Email 2 (Day 3): Educational — understanding your condition
- Email 3 (Day 7): Convenience — how easy it is to visit (5 locations, WhatsApp booking)
- Email 4 (Day 14): Urgency — early diagnosis prevents joint damage
- Email 5 (Day 30): Re-engagement — special offer or new service announcement

Also generate:
- **3 WhatsApp broadcast messages** for existing patient recall
- **1 GP referral outreach email** (to GPs who might refer patients)`;

    case "whatsapp_blast":
      return `${base}

Generate 10 WhatsApp broadcast message templates for different patient scenarios:

For EACH template:
1. **Template name** (e.g., "new_patient_welcome")
2. **Target audience** (who receives this)
3. **Message body** (max 1024 chars for WhatsApp Business API)
4. **Quick reply buttons** (max 3, each max 20 chars)
5. **Trigger** (when to send — manual or automated)

Templates should cover:
1. New patient welcome after first booking
2. Appointment reminder (24 hours)
3. Appointment reminder (2 hours)
4. Post-consultation follow-up
5. Blood test reminder (monitoring schedule)
6. Biologic infusion reminder
7. Recall — patient hasn't visited in 6 months
8. New service announcement
9. Seasonal health tip (flu season + autoimmune)
10. Birthday/anniversary message

All templates must comply with WhatsApp Business Policy and POPIA (patient must have opted in).`;

    case "seo_content":
      return `${base}

Generate SEO content strategy for rheumcare.co.za:

1. **10 Blog article titles + outlines** (each targeting a specific keyword cluster):
   - Each with: title, target keyword, estimated monthly search volume (SA), outline (5 sections), meta description, internal linking suggestions

2. **Local SEO checklist**:
   - Google Business Profile optimization for each of the 5 locations
   - Local citation targets (SA directories: MedPages, Medpages.info, HelloDoctor, etc.)
   - Review generation strategy

3. **FAQ schema markup** — 15 questions and answers about rheumatology that can be added to the website for rich snippets

4. **Keyword map** — top 30 keywords organized by:
   - Head terms (high volume)
   - Long-tail (high intent)
   - Local terms (city-specific)
   - Condition-specific terms

Each piece of content should naturally include a WhatsApp booking CTA.`;

    case "full_campaign":
      return `${base}

Generate a COMPLETE 30-day patient acquisition campaign:

**Week 1: Foundation**
- Google Ads setup (3 campaigns, 30 keywords)
- Social media calendar (7 posts)
- Email sequence start
- Website SDK widget go-live

**Week 2: Acceleration**
- Social media calendar (7 posts)
- WhatsApp broadcast to existing patients
- GP referral outreach (email template)
- Blog article #1 published

**Week 3: Optimization**
- Review ad performance, adjust budget
- Social media calendar (7 posts)
- Email sequence follow-ups
- Patient testimonial collection (video)

**Week 4: Scale**
- Double budget on best-performing ads
- Social media calendar (7 posts)
- Second blog article
- Performance report

For EACH deliverable, provide ready-to-use copy/content.
Include estimated costs, expected leads, and conversion projections.
All CTAs point to WhatsApp booking.`;

    default:
      return `${base}\n\nGenerate a patient acquisition campaign.`;
  }
}
