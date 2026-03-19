// Seed: Dr. Lamola Operations Data — Research, GP Leads, Content Strategy, Google Ads
// Run: npx tsx scripts/seed-drlamola-ops.ts

import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const PRACTICE_ID = "joburg-ent";

async function main() {
  console.log("Seeding Dr. Lamola operations data...\n");

  // Clear existing ops documents for this practice
  await prisma.opsDocument.deleteMany({ where: { practiceId: PRACTICE_ID } });

  // 1. Market Research
  await prisma.opsDocument.create({
    data: {
      practiceId: PRACTICE_ID,
      category: "market_research",
      title: "SA Medical Lead Gen Landscape",
      pinned: true,
      content: `# SA Medical Lead Generation Landscape

## Key Finding: No dominant "lead gen for doctors" company exists in SA

The market is fragmented across three layers:

| Layer | Key Players | What They Do |
|-------|------------|--------------|
| **Directories** | RecoMed (100K+ bookings/mo), Medpages (500K+ records), Doctor4U | Patients find & book doctors |
| **Agencies** | Avily (2,000+ clients), Marketify, myMed, Ad Ignite | SEO, Google Ads, social for practices |
| **Practice Mgmt** | Healthbridge (7,000+ practices), GoodX (since 1985) | Billing, scheduling, claims |

## Disruption Opportunity
- **Nobody charges per-booking** in SA — agencies use monthly retainers (R5K-R30K/mo)
- **No ZocDoc equivalent** — RecoMed is closest but lacks review depth
- **Specialists underserved** — most agencies market to GPs and dentists
- **No integrated CRM + lead gen** — HealthOps fills this gap

## Competitor ENT Analysis (Johannesburg)
- **Dr. Deon Rossouw** — earandnosesurgeon.co.za — 40 years exp, strong SEO
- **Dr. Sibulele Cezula** — drsibulelecezulaent.co.za — transparent pricing FAQ
- **Dr. Anton Smit** — drantonsmit.co.za — tech-forward
- **Dr. Tim Capon** — drtimcapon.co.za — Netcare Union, complex sinus

**Key weakness across ALL competitors:**
- Almost no Google Ads running
- No social media presence
- No online booking on their own sites
- Phone-only booking

## Demand Data
- **Allergic rhinitis**: 15-40% of SA population (9-24M people)
- **Chronic rhinosinusitis**: ~12% of adults → ~1.4M potential patients in Gauteng
- **Joburg-specific triggers**: Highveld pollen (Sep-May), industrial pollution, altitude (1,750m)
- **Sinus dilation market**: Growing 8.6% YoY globally ($3.15B → $3.42B)`,
      metadata: JSON.stringify({
        sources: ["Medpages", "RecoMed", "Avily", "Marketify", "LeadSquared", "PMC studies"],
        lastUpdated: "2026-03-16",
      }),
    },
  });

  // 2. 80 Bookings Plan
  await prisma.opsDocument.create({
    data: {
      practiceId: PRACTICE_ID,
      category: "market_research",
      title: "80 Bookings/Month — Channel Strategy",
      pinned: true,
      content: `# 80 Bookings/Month Plan

## Channel Mix

| Channel | Target Bookings | Monthly Cost | Time to Ramp |
|---------|----------------|-------------|--------------|
| **GP Referral Network** | 30-40 | ~R5K | 3-6 months |
| **Google Ads** | 15-20 | R15-25K | Immediate |
| **SEO + Content** | 10-15 | R8-12K | 3-6 months |
| **Medical Aid Directories** | 5-10 | R0 (free) | 1 month |
| **Social Media (TikTok/IG)** | 5-10 | R3-5K | 2-4 months |
| **RecoMed + Platforms** | 3-5 | R0-2K | 1 month |
| **Corporate Wellness** | 5-10 | R3-5K | 3-6 months |
| **TOTAL** | **78-120** | **R34-49K/month** | **Full ramp: 6 months** |

## Priority Execution Order
1. **Week 1-2**: Google Business Profile, medical aid directories, RecoMed listing
2. **Week 2-4**: Launch Google Ads (R15K budget, high-intent keywords)
3. **Month 1-2**: Practice website with online booking, blog content
4. **Month 1-3**: GP visit program (5-10 practices/month)
5. **Month 2-3**: TikTok/Instagram content (batch film monthly)
6. **Month 3-6**: First CME event, corporate wellness partnerships
7. **Month 4-6**: Scale what works, optimize, expand GP network

## Seasonal Calendar
| Period | Campaign |
|--------|----------|
| **May-Aug** (winter) | "Winter Sinus Season" — peak demand, push Google Ads hard |
| **Sep-Nov** (spring pollen) | "Spring Pollen Alert" — allergy→sinus pipeline |
| **Jan-Feb** | "New Year, Breathe Free" — elective surgery push |
| **Mar-Apr** | "Autumn Allergy Check" — free sinus assessments |

## Key Metrics to Track
- Bookings per channel per month
- Cost per booking by channel
- GP referral conversion rate
- Google review count + average rating
- Website traffic from organic vs paid
- No-show rate`,
      metadata: JSON.stringify({ lastUpdated: "2026-03-16" }),
    },
  });

  // 3. GP Leads
  await prisma.opsDocument.create({
    data: {
      practiceId: PRACTICE_ID,
      category: "gp_leads",
      title: "GP Referral Outreach List — 74 Practices",
      pinned: true,
      content: `# GP Referral Outreach List

**74 GP practices** within 15km of Netcare Park Lane, Parktown.

## High-Priority Targets (verified contact details)

| # | Practice | Area | Phone | Email |
|---|----------|------|-------|-------|
| 1 | Epione Health Villages (5 GPs) | Melrose | 011 880 5349 | Individual emails available |
| 2 | VillageMed / Drs Cohen Freinkel | Parktown North | 011 788 3404 | — |
| 3 | Parkmore Medical Centre | Sandton | 011 783 1140 | admin@parkdocs.co.za |
| 4 | Intercare Sandton | Sandton | 010 880 1500 | sandton@intercare.co.za |
| 5 | Intercare Fourways | Fourways | 011 745 6700 | fourways@intercare.co.za |
| 6 | NHC Bryanston | Bryanston | 011 700 6666 | bryanstonmanager@nhcltd.com |
| 7 | Dr Martie Landman & Associates (5 GPs) | Emmarentia | 011 888 1725 | — |
| 8 | Midrand Medical Centre | Midrand | 011 315 2512 | info@midrandmedicalcentre.co.za |
| 9 | Execuhealth | Mediclinic Sandton | 011 706 1231 | reception@execuhealth.co.za |
| 10 | Dr Alta Withers | Randburg | 010 143 3676 | Discovery Network GP |

## Coverage by Area
- **Parktown/Parktown West/North**: 10 GPs (immediate catchment)
- **Rosebank/Melrose/Houghton**: 11 GPs (affluent, 2-5km)
- **Sandton/Morningside**: 26 GPs (highest density)
- **Fourways/Lonehill/Dainfern**: 17 GPs (northern suburbs)
- **Bryanston**: 3 GPs
- **Randburg/Northcliff/Emmarentia/Greenside**: 10 GPs
- **Braamfontein/Hillbrow/Yeoville/CBD**: 3 GPs
- **Midrand**: 5 GPs
- **Norwood/Oaklands**: 2 GPs

## Outreach Strategy
1. **Personal visit** to top 10 practices within first 2 weeks
2. **Leave branded referral pads** with contact details + online referral URL
3. **Share referral portal link**: healthops.co.za/refer/drlamola
4. **Offer direct WhatsApp line** for urgent cases
5. **Host quarterly CME event** (provide CPD points)
6. **ALWAYS send consultation report** back to referring GP (automated via HealthOps)

## GP Communication Template
"Dear Dr. [Name], I'm Dr. Mogau Lamola, ENT surgeon at Netcare Park Lane and Head of ENT at Nelson Mandela Children's Hospital. I'm reaching out to introduce our digital referral system — you can refer patients directly at [URL] and receive a consultation report after every visit. I'd love to visit your practice to discuss how we can best serve your patients with ENT needs."

## Full CSV available at:
\`/joburg-ent-referral-leads.csv\``,
      metadata: JSON.stringify({
        totalLeads: 74,
        withPhone: 40,
        withEmail: 22,
        withWebsite: 46,
        lastUpdated: "2026-03-16",
      }),
    },
  });

  // 4. Google Ads Strategy
  await prisma.opsDocument.create({
    data: {
      practiceId: PRACTICE_ID,
      category: "google_ads",
      title: "Google Ads Campaign — Keywords & Ad Copy",
      pinned: true,
      content: `# Google Ads Campaign Strategy

## Budget: R15,000-R25,000/month
## Expected: 15-20 bookings/month from ads alone

## High-Intent Keywords (Bottom of Funnel)
| Keyword | Est. CPC | Priority |
|---------|----------|----------|
| ENT specialist Johannesburg | R25-40 | HIGH |
| ENT near me | R20-35 | HIGH |
| sinus surgery Johannesburg | R30-45 | HIGH |
| sinus specialist Parktown | R15-25 | HIGH |
| ENT doctor Netcare Park Lane | R10-20 | HIGH |
| balloon sinuplasty South Africa | R20-30 | MEDIUM |
| FESS surgery Johannesburg | R25-35 | MEDIUM |
| nasal polyp removal Johannesburg | R20-30 | MEDIUM |

## Mid-Intent Keywords
- chronic sinusitis treatment
- sinus headache won't go away
- blocked nose for months
- post nasal drip treatment

## Ad Copy (5 Variations)

### Ad 1: Sinus Consultation
- **Headlines**: Sinus Consultation — Joburg | ENT Specialist Park Lane | Chronic Sinus? Get Answers
- **Descriptions**: Expert ENT assessment with nasal endoscopy. Dr Lamola, Netcare Park Lane. Book today. | Blocked nose for months? A 30-minute consultation can find the cause. Book online now.
- **Landing**: /ent/drlamola

### Ad 2: ENT Specialist
- **Headlines**: ENT Specialist Johannesburg | Dr Lamola — Netcare Park Lane | Ear, Nose & Throat Surgeon
- **Descriptions**: Specialist ENT surgeon at Netcare Park Lane. Sinus, ear & throat conditions. Book now. | Head of ENT at Nelson Mandela Children's Hospital. Private consultations available.
- **Landing**: /ent/drlamola

### Ad 3: Sinus Surgery
- **Headlines**: Sinus Surgery Johannesburg | FESS & Balloon Sinuplasty | Breathe Freely Again
- **Descriptions**: Minimally invasive sinus surgery by specialist ENT surgeon. Netcare Park Lane, Joburg. | Chronic sinusitis? Modern sinus surgery with fast recovery. Consult Dr Lamola today.
- **Landing**: /ent/drlamola

### Ad 4: Blocked Nose
- **Headlines**: Blocked Nose? We Can Help | Stop Mouth Breathing at Night | Nasal Obstruction Treatment
- **Descriptions**: Chronic nasal blockage is treatable. ENT consultation with endoscopy at Park Lane. | Deviated septum, polyps, or allergies — find the cause and fix it. Book a consultation.
- **Landing**: /check/drlamola

### Ad 5: ENT Near Me
- **Headlines**: ENT Doctor Near You — Joburg | Parktown ENT Specialist | Book Your ENT Consultation
- **Descriptions**: Looking for an ENT in Johannesburg? Dr Lamola at Netcare Park Lane, Parktown. Book now. | Same-week ENT appointments available. Sinus, ears, throat. Netcare Park Lane Hospital.
- **Landing**: /ent/drlamola

## Tracking Setup
- UTM: ?src=google_ads on all landing URLs
- HealthOps tracks leadSource automatically on bookings
- Track: impressions → clicks → bookings → cost per booking`,
      metadata: JSON.stringify({
        monthlyBudget: "R15000-R25000",
        expectedBookings: "15-20/month",
        lastUpdated: "2026-03-16",
      }),
    },
  });

  // 5. Content Strategy
  await prisma.opsDocument.create({
    data: {
      practiceId: PRACTICE_ID,
      category: "content_strategy",
      title: "Social Media & Content Calendar",
      pinned: true,
      content: `# Content Strategy — 4-Week Calendar

## Platforms: TikTok + Instagram Reels + Facebook
## Posting: 3-5 times per week
## Batch filming: 1-2 hours per month

## Week 1 (Theme: Awareness)
| Day | Platform | Content |
|-----|----------|---------|
| Mon | TikTok+IG | "Your nose is not supposed to be blocked 24/7" |
| Tue | Facebook | "5 reasons to see an ENT" — carousel |
| Wed | TikTok+IG | "Sinus headache vs migraine" |
| Fri | IG+FB | Human Rights Day — values post at NMCH |

## Week 2 (Theme: Behind the Scenes)
| Day | Platform | Content |
|-----|----------|---------|
| Mon | TikTok+IG | "What your ENT sees inside your nose" — endoscopy |
| Tue | Facebook | "When should your GP refer to an ENT?" |
| Wed | TikTok+IG | "5 signs you need surgery, not medication" |
| Thu | Instagram | Professional portrait — bio + CTA |
| Fri | TikTok | "3 things to try before seeing an ENT" |

## Week 3 (Theme: Procedures & Patient Journey)
| Day | Platform | Content |
|-----|----------|---------|
| Mon | TikTok+IG | "Balloon sinuplasty in 30 seconds" |
| Tue | Facebook | Patient story (de-identified) |
| Wed | TikTok+IG | "Day in the life: Head of ENT at NMCH" |
| Fri | IG+FB | "What happens during a sinus consultation" — carousel |

## Week 4 (Theme: Johannesburg-Specific)
| Day | Platform | Content |
|-----|----------|---------|
| Mon | TikTok+IG | "Why Joburg's air makes your sinuses worse" |
| Tue | Facebook | "Autumn sinus flare-ups" — seasonal |
| Wed | TikTok+IG | "Why GPs refer to an ENT" |
| Thu | Instagram | Google review quote graphic |
| Fri | All | Q&A post — "Ask me anything about sinus surgery" |

## 10 Video Scripts Ready
1. "5 signs your sinus problem needs surgery"
2. "What your ENT sees inside your nose"
3. "Sinus headache vs migraine"
4. "Why Joburg's air makes your sinuses worse"
5. "What happens during a sinus consultation"
6. "3 things to try before seeing an ENT"
7. "Why GPs refer patients to an ENT"
8. "Balloon sinuplasty in 30 seconds"
9. "Day in the life: Head of ENT at NMCH"
10. "Your nose is not supposed to be blocked 24/7"

## 5 SEO Blog Posts Outlined
1. "ENT Specialist Johannesburg — When to See One"
2. "Chronic Sinusitis Treatment in South Africa"
3. "Sinus Surgery: What to Expect (FESS Guide)"
4. "Balloon Sinuplasty vs Traditional Sinus Surgery"
5. "Why Your Nose is Always Blocked in Johannesburg"

## Brand Voice
- Professional but approachable — surgeon first, not influencer
- Medical accuracy non-negotiable
- South African English (colour, specialise, theatre)
- HPCSA compliant: no outcome guarantees, no unapproved before/after
- Hashtags: #ENTSurgeon #Johannesburg #SinusSurgery #JoburgENT #DrLamola`,
      metadata: JSON.stringify({
        videoScripts: 10,
        blogOutlines: 5,
        weeksCovered: 4,
        lastUpdated: "2026-03-16",
      }),
    },
  });

  // 6. Practice Profile & Insights
  await prisma.opsDocument.create({
    data: {
      practiceId: PRACTICE_ID,
      category: "insights",
      title: "Dr. Lamola — Practice Profile & Intelligence",
      pinned: true,
      content: `# Dr. Mogau Lamola — Full Practice Profile

## Professional
- **Specialty**: Ear, Nose & Throat Surgery (Otorhinolaryngology)
- **Qualified**: 2018
- **Training**: Nelson R. Mandela School of Medicine (University of Natal)
- **Position**: Head of ENT, Nelson Mandela Children's Hospital
- **Fellow**: College of Otorhinolaryngologists of South Africa
- **Member**: ENT Society of South Africa
- **Notable**: Groundbreaking ear reconstruction surgery at NMCH (Aug 2025, Daily Maverick)

## Practice Locations
| Location | Address | Phone |
|----------|---------|-------|
| **Netcare Park Lane** (Primary) | South Wing, Corner Junction Ave & Park Lane, Parktown, 2193 | 011 480 4318 |
| **Netcare Waterfall / Midrand** | Magwa Cres & Mac-Mac Rd, Midrand, 1682 | 010 045 0480 |
| **Lenmed Zamokuhle (Tembisa)** | 128 Flint Mazibuko Dr, Hospital View, Tembisa, 1632 (Room G8) | 011 923 7750 |
| **NMCH** | Head of ENT Department | — |

## Contact
- **Website**: joburg-ent.co.za
- **Email (general)**: info@joburg-ent.co.za
- **Email (accounts)**: accounts@joburg-ent.co.za
- **Email (auth)**: authorizations@joburg-ent.co.za
- **Google Place ID**: ChIJA6RBjBINlR4RTUjHxZY5g_M
- **GPS**: -26.1818485, 28.0462939

## Online Presence
- **Google Rating**: 3.6/5 (TopReviews grade: B+)
- **Review volume**: Low — needs active review collection
- **Competitor gap**: None of the top 10 JHB ENTs run Google Ads or have active social media

## Medical Aid Status
- Ensure in-network with: Discovery Health, GEMS, Bonitas, Momentum, Medihelp
- Register on all "Find a Doctor" directories
- Discovery HP Zone registration for 24/7 portal access

## HealthOps URLs
| Page | URL |
|------|-----|
| Public booking | /book/drlamola |
| Symptom checker | /check/drlamola |
| GP referral portal | /refer/drlamola |
| SEO landing page | /ent/drlamola |
| Dashboard login | /dashboard |

## Login Credentials
- **Doctor**: drmglamola@gmail.com
- **Reception**: info@joburg-ent.co.za`,
      metadata: JSON.stringify({
        googlePlaceId: "ChIJA6RBjBINlR4RTUjHxZY5g_M",
        googleRating: 3.6,
        locations: 4,
        lastUpdated: "2026-03-16",
      }),
    },
  });

  // 7. Patient Journey Map
  await prisma.opsDocument.create({
    data: {
      practiceId: PRACTICE_ID,
      category: "insights",
      title: "Patient Journey & Acquisition Channels",
      content: `# Patient Acquisition Channels

## How Patients Find an ENT in SA

| Channel | % of Patients | Action Needed |
|---------|---------------|---------------|
| **GP Referral** | 40-50% | Build network of 30-50 GPs, digital referral portal live |
| **Google Search** | 20-25% | Google Ads live, SEO landing page built |
| **Medical Aid Directory** | 10-15% | Register on all scheme directories |
| **Word of Mouth** | 10-15% | Automated review collection live |
| **Online Platforms** | 5-10% | List on RecoMed, Medpages |

## The HealthOps Funnel

\`\`\`
Google Ads → /ent/drlamola (SEO Landing) → /book/drlamola?src=google_ads
                                          → /check/drlamola (Symptom Checker) → /book/drlamola
GP Referrals → /refer/drlamola → Dashboard notification → Accept → WhatsApp patient → /book/drlamola
Completed visits → Auto follow-up (24h) → Auto review request (48h) → Google Reviews → More patients
\`\`\`

## Key Insight: The GP Feedback Loop
Research showed GPs' #1 complaint is specialists never sending feedback.
HealthOps automatically emails the GP a consultation report when the specialist fills in feedback.
This alone will make Dr. Lamola the preferred referral target for every GP in the area.

## Google Ads Math
- SA Healthcare CPC: R20-R40/click
- Conversion rate: 5%
- Lead-to-booking: 35%
- R15K budget → ~20 bookings/month from ads alone
- Combined with GP referrals + organic → 80+ bookings achievable in 6 months`,
      metadata: JSON.stringify({ lastUpdated: "2026-03-16" }),
    },
  });

  const count = await prisma.opsDocument.count({ where: { practiceId: PRACTICE_ID } });
  console.log(`✓ ${count} operations documents seeded`);
  console.log("\n✅ All ops data loaded — accessible from /dashboard/ops");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
