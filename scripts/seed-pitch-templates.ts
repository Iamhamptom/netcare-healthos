// Seed: Specialty Pitch Templates — 6 templates for dental, paeds, ENT, derm, ophth, GP
// Run: npx tsx scripts/seed-pitch-templates.ts

import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const templates = [
  {
    title: "Pitch Template — Dental Practices",
    content: `# VisioHealth OS — Dental Practice Pitch

## Opening (30 seconds)
"Dr [Name], I noticed you run [practice name] in [area]. I work with dental practices in Johannesburg to add 10-15 new patients per month while cutting 2 hours of daily admin. Can I show you how in 15 minutes?"

## The Problem (their pain)
- You're doing admin between patients — booking confirmations, medical aid pre-auths, follow-up calls
- Patients call to book but your receptionist is busy — you lose them to the dentist down the road
- No-shows cost you R3,000-R5,000/week in lost chair time
- Medical aid claims get rejected because of ICD-10 coding errors — you lose R10K-R30K/month
- Your online presence is a basic website that doesn't convert visitors to bookings

## The Solution (what they get)
At R35,000/month (Professional plan), Dr [Name] gets:

1. **VisioHealth OS** — Complete practice management
   - Patient records, ICD-10 billing, medical aid claim tracking
   - 5 AI agents (triage, intake, follow-up, billing, scheduler)
   - WhatsApp/SMS appointment reminders (reduces no-shows by 20%)
   - Daily workflow automation (morning/during/end-of-day checklists)

2. **White-Labeled Digital Practice** — Built on our stack
   - SEO landing page: /dental/[yourname] — ranks for "dentist [area]"
   - Online booking: /book/[yourname] — patients book 24/7
   - GP referral portal: /refer/[yourname] — GPs refer digitally
   - AI symptom checker: patients describe issue → funneled to right service

3. **Patient Acquisition Package**
   - 100 qualified leads loaded at onboarding
   - Google Business Profile optimization
   - Medpages, RecoMed directory listings
   - R3,000 AI credits/month included

4. **Staff AI Training**
   - 5 courses for your entire team
   - AI Fundamentals, Platform Mastery, Staff Literacy, POPIA, Clinical AI

## The ROI (the no-brainer math)
- Average dental consultation: R1,500
- Extra patients needed to cover R35K: just 1-2 per day
- No-show reduction (20%): saves R12,000-R20,000/month
- Claim rejection reduction (5%): recovers R10,000-R30,000/month
- Admin time saved (2hrs/day): capacity for 4-6 more patients/day
- **Total ROI: 3-4x the subscription cost**

## Competitors Don't Have This
- No dental practice in Johannesburg has AI triage
- No dental practice has a GP referral portal
- No dental practice has an AI symptom checker
- Most don't even have online booking
- You'd be the first in [area] with this full stack

## The Close
"Dr [Name], this is R35,000/month. Your consultation rate is R1,500. That means if we bring you just 2 extra patients per day — which the booking page, referral portal, and leads alone will do — this pays for itself. And everything else is profit. Can we get you started this week?"

## Objection Handlers
- "That's expensive" → "It's 2 patients per day. Your receptionist costs R15K and doesn't bring new patients."
- "I need to think about it" → "Of course. What if I set up a demo with your team this week so they can see it too?"
- "I already have a website" → "Does it have online booking, AI triage, and a GP referral portal? We build all that on top."
- "What about data security?" → "POPIA-compliant from day one, audit logging, encrypted, consent tracking built in."`,
  },
  {
    title: "Pitch Template — Paediatric Practices",
    content: `# VisioHealth OS — Paediatric Practice Pitch

## Opening (30 seconds)
"Dr [Name], I work with paediatric practices in Johannesburg to help them handle high patient volumes without burning out their staff. Parents want to book at 10pm when their child is sick — right now they can't. Can I show you how we fix that in 15 minutes?"

## The Problem (their pain)
- Parents call at 10pm when their child has a fever — your phone is off, they go to the ER or another paed
- Kids are always sick = high volume, but your admin can't keep up with bookings, follow-ups, and immunization tracking
- Immunization schedules are tracked manually — missed vaccines mean missed revenue and unhappy parents
- No digital intake forms — parents fill out the same paperwork every visit
- Your waiting room is chaos — sick kids next to well-baby checks, no queue management

## The Solution (what they get)
At R35,000/month (Professional plan), Dr [Name] gets:

1. **VisioHealth OS** — Complete practice management
   - Patient records with paediatric growth charts, immunization tracking, allergy alerts
   - 5 AI agents (triage, intake, follow-up, billing, scheduler)
   - WhatsApp/SMS appointment reminders + immunization recall notifications
   - Daily workflow automation (morning/during/end-of-day checklists)

2. **White-Labeled Digital Practice** — Built on our stack
   - SEO landing page: /paediatrics/[yourname] — ranks for "paediatrician [area]"
   - Online booking: /book/[yourname] — parents book 24/7, even at midnight
   - GP referral portal: /refer/[yourname] — GPs refer children digitally
   - AI symptom checker: parents describe child's symptoms → triaged to urgency level → booked

3. **Patient Acquisition Package**
   - 100 qualified leads (families with children in your area) loaded at onboarding
   - Google Business Profile optimization
   - Medpages, RecoMed directory listings
   - R3,000 AI credits/month included

4. **Staff AI Training**
   - 5 courses for your entire team
   - AI Fundamentals, Platform Mastery, Staff Literacy, POPIA, Clinical AI

## The ROI (the no-brainer math)
- Average paediatric consultation: R1,200
- Extra patients needed to cover R35K: just 2 per day
- No-show reduction (20%): saves R8,000-R15,000/month
- Immunization recall automation: recovers R5,000-R10,000/month in missed well-baby visits
- After-hours online booking: captures 5-10 bookings/week you'd otherwise lose
- **Total ROI: 3-4x the subscription cost**

## Competitors Don't Have This
- No paediatric practice in Johannesburg has AI triage for children's symptoms
- No paediatric practice has automated immunization recall via WhatsApp
- No paediatric practice has a GP referral portal for child referrals
- Parents expect to book online — most paeds still require a phone call
- You'd be the first paediatrician in [area] with this full stack

## The Close
"Dr [Name], parents want to book online at midnight when their child is sick. Right now they can't — so they go to the ER or the paed who does have online booking. At R35,000/month, you need just 2 extra kids per day to cover the cost. The booking page alone will do that. Can we get you started this week?"

## Objection Handlers
- "That's expensive" → "It's 2 consultations per day. One sick child at midnight who books online instead of going elsewhere — that's already half."
- "Parents prefer calling" → "Parents prefer calling because they have no other option. Give them online booking and 60% will use it — that frees your receptionist for in-practice patients."
- "I don't need AI" → "The AI isn't replacing you — it's triaging inquiries so your receptionist isn't fielding 'is this an emergency?' calls all day. It routes the right patients to the right appointment type."
- "What about child data privacy?" → "POPIA-compliant from day one. Parental consent workflows built in. Audit logging on every record access."`,
  },
  {
    title: "Pitch Template — ENT Practices",
    content: `# VisioHealth OS — ENT Practice Pitch

## Opening (30 seconds)
"Dr [Name], I work with ENT specialists in Johannesburg. I know your biggest bottleneck isn't surgery — it's the admin around GP referrals, pre-auths, and post-op follow-ups. Can I show you how we cut 2 hours of daily admin and bring in 10+ new referrals per month? It takes 15 minutes."

## The Problem (their pain)
- GP referrals come by fax or phone call — details get lost in translation, incomplete histories
- Post-op follow-ups (FESS, tonsillectomy, grommets) are manual phone calls — your staff spends hours chasing patients
- Medical aid pre-authorisations for ENT surgery take days of back-and-forth
- High surgical volume but admin is the bottleneck — you could see more patients if referral intake was streamlined
- Your online presence doesn't reflect your specialisation — patients can't find you for specific ENT procedures

## The Solution (what they get)
At R35,000/month (Professional plan), Dr [Name] gets:

1. **VisioHealth OS** — Complete practice management
   - Patient records with ENT-specific procedure tracking (FESS, tonsillectomy, grommets, septoplasty, hearing assessments)
   - 5 AI agents (triage, intake, follow-up, billing, scheduler)
   - WhatsApp/SMS post-op follow-up reminders (automated at day 3, day 7, day 14)
   - Daily workflow automation (morning/during/end-of-day checklists)

2. **White-Labeled Digital Practice** — Built on our stack
   - SEO landing page: /ent/[yourname] — ranks for "ENT specialist [area]", "tonsillectomy [area]", "hearing test [area]"
   - Online booking: /book/[yourname] — patients book consultations 24/7
   - GP referral portal: /refer/[yourname] — GPs refer digitally with full patient history attached
   - AI symptom checker: patients describe ENT symptoms → routed to right service (hearing, sinus, throat, etc.)

3. **Patient Acquisition Package**
   - 100 qualified leads (GPs in your area + patients searching for ENT services) loaded at onboarding
   - Google Business Profile optimization for ENT-specific keywords
   - Medpages, RecoMed directory listings
   - R3,000 AI credits/month included

4. **Staff AI Training**
   - 5 courses for your entire team
   - AI Fundamentals, Platform Mastery, Staff Literacy, POPIA, Clinical AI

## The ROI (the no-brainer math)
- Average ENT consultation: R1,250
- 2 extra patients per day covers the R35K subscription
- One tonsillectomy referral from the GP portal = R17,000 revenue
- Post-op follow-up automation: saves 1.5 hours/day of staff phone time
- Pre-auth tracking: reduces claim rejections by 5-10%, recovering R15,000-R40,000/month
- **Total ROI: 4-5x the subscription cost**

## Competitors Don't Have This
- SA has one of the highest tonsillectomy rates globally but zero ENT practices have online booking or AI triage
- No ENT practice in Johannesburg has a digital GP referral portal
- GPs still fax referrals — you'd be the first ENT they can refer to with one link
- No competitor offers post-op follow-up automation for surgical ENT practices

## The Close
"Dr [Name], you're losing GP referrals because they can't refer digitally. We fix that with one link. One tonsillectomy referral per month from that portal pays for the entire platform. Can we get you set up this week?"

## Objection Handlers
- "That's expensive" → "One tonsillectomy referral is R17K. The GP referral portal alone will generate that within the first month."
- "My GPs already know to call me" → "They know, but they refer to whoever is easiest. Give them a link where they can refer in 30 seconds with the patient's history attached — you become the easiest."
- "I don't have time for a new system" → "That's exactly why you need this. The system saves you 2 hours/day. Your staff handles the setup — we train them in 4 hours."
- "What about surgical scheduling?" → "The booking engine handles consultation slots. Surgical scheduling integrates with your existing theatre booking — we don't replace that, we feed it."`,
  },
  {
    title: "Pitch Template — Dermatology Practices",
    content: `# VisioHealth OS — Dermatology Practice Pitch

## Opening (30 seconds)
"Dr [Name], I noticed you run a derm practice in [area]. You've got two revenue streams — medical and aesthetic — but probably one messy admin system handling both. I work with dermatologists to streamline operations and bring in new aesthetic patients online. Can I show you how in 15 minutes?"

## The Problem (their pain)
- Medical derm + aesthetic derm = two revenue streams but one overwhelmed admin system
- Aesthetic patients (Botox, fillers, peels) expect online booking — they book hair and nails online, why not skin?
- Skin checks and lesion monitoring need follow-up tracking — patients fall through the cracks
- Before/after photo management is disorganised — critical for aesthetic consultations and marketing
- Your website doesn't differentiate between medical and aesthetic services — you're losing aesthetic patients to med spas

## The Solution (what they get)
At R35,000/month (Professional plan), Dr [Name] gets:

1. **VisioHealth OS** — Complete practice management
   - Patient records with dermatology-specific tracking (skin type, lesion monitoring, treatment history)
   - 5 AI agents (triage, intake, follow-up, billing, scheduler)
   - WhatsApp/SMS follow-up reminders for skin checks and aesthetic appointments
   - Daily workflow automation (morning/during/end-of-day checklists)

2. **White-Labeled Digital Practice** — Built on our stack
   - SEO landing page: /dermatology/[yourname] — ranks for "dermatologist [area]", "Botox [area]", "skin check [area]"
   - Online booking: /book/[yourname] — separate booking flows for medical and aesthetic services
   - GP referral portal: /refer/[yourname] — GPs refer skin conditions digitally
   - AI symptom checker: patients describe skin concern → triaged to medical or aesthetic → booked into right slot

3. **Patient Acquisition Package**
   - 100 qualified leads (aesthetic patients + medical referrals in your area) loaded at onboarding
   - Google Business Profile optimization for derm-specific keywords
   - Medpages, RecoMed directory listings
   - R3,000 AI credits/month included

4. **Staff AI Training**
   - 5 courses for your entire team
   - AI Fundamentals, Platform Mastery, Staff Literacy, POPIA, Clinical AI

## The ROI (the no-brainer math)
- Average dermatology consultation: R1,800
- Just 1 extra patient per day covers the R35K subscription
- Aesthetic procedures (Botox, fillers, chemical peels): R5,000-R15,000 each
- One extra Botox patient per week = R20,000-R60,000/month additional revenue
- Follow-up automation for skin checks: recovers R5,000-R10,000/month in missed appointments
- **Total ROI: 4-6x the subscription cost**

## Competitors Don't Have This
- No dermatology practice in Johannesburg has AI symptom assessment for skin concerns
- No derm practice has separate online booking flows for medical vs aesthetic services
- Med spas have online booking — dermatologists don't. You're losing aesthetic patients to non-specialists
- No competitor offers AI triage that routes "I have a mole" to medical and "I want Botox" to aesthetic

## The Close
"Dr [Name], your aesthetic patients are already booking hair and nails online. Why can't they book skin treatments the same way? At R35,000/month, one extra Botox patient per week more than covers the cost — and the booking page will bring far more than that. Can we get you started this week?"

## Objection Handlers
- "That's expensive" → "One Botox treatment is R5,000-R8,000. One extra aesthetic patient per week pays for the platform twice over."
- "My aesthetic patients come from word of mouth" → "Word of mouth is great — but when they hear about you, the first thing they do is Google you. If they can't book online right then, they book with someone else."
- "I don't want to mix medical and aesthetic in one system" → "That's exactly what we solve. Separate booking flows, separate intake forms, separate follow-up protocols — but one unified patient record. Best of both worlds."
- "What about before/after photos?" → "The patient record system supports image attachments with timestamps. POPIA-compliant consent for clinical photography built in."`,
  },
  {
    title: "Pitch Template — Ophthalmology/Eye Care Practices",
    content: `# VisioHealth OS — Ophthalmology Practice Pitch

## Opening (30 seconds)
"Dr [Name], I work with ophthalmology practices in Johannesburg. I know your referral pipeline from optometrists needs structure, and your post-op follow-up for cataract and LASIK patients is critical but manual. Can I show you how we streamline both and bring in new patients? It takes 15 minutes."

## The Problem (their pain)
- Cataract and LASIK patients need extensive pre-op workup tracking — scattered across paper files and different systems
- Post-op follow-ups are critical (day 1, week 1, month 1, month 3) but rely on manual phone calls — patients miss appointments
- Referral pipeline from optometrists needs structure — referrals come by phone, fax, or WhatsApp with incomplete information
- Medical aid pre-authorisations for eye surgery are complex and time-consuming
- Patients searching for LASIK or cataract surgery can't find you online — you're invisible to the highest-value patients

## The Solution (what they get)
At R35,000/month (Professional plan), Dr [Name] gets:

1. **VisioHealth OS** — Complete practice management
   - Patient records with ophthalmology-specific tracking (visual acuity history, IOP, surgical outcomes)
   - 5 AI agents (triage, intake, follow-up, billing, scheduler)
   - Automated post-op follow-up reminders (day 1, week 1, month 1, month 3, month 6)
   - Daily workflow automation (morning/during/end-of-day checklists)

2. **White-Labeled Digital Practice** — Built on our stack
   - SEO landing page: /ophthalmology/[yourname] — ranks for "LASIK [area]", "cataract surgery [area]", "eye doctor [area]"
   - Online booking: /book/[yourname] — patients book consultations 24/7
   - Optometrist referral portal: /refer/[yourname] — optometrists refer digitally with full eye exam data attached
   - AI symptom checker: patients describe eye symptoms → triaged to urgency level → booked into right appointment type

3. **Patient Acquisition Package**
   - 100 qualified leads (optometrists in your area + patients searching for eye care) loaded at onboarding
   - Google Business Profile optimization for ophthalmology-specific keywords
   - Medpages, RecoMed directory listings
   - R3,000 AI credits/month included

4. **Staff AI Training**
   - 5 courses for your entire team
   - AI Fundamentals, Platform Mastery, Staff Literacy, POPIA, Clinical AI

## The ROI (the no-brainer math)
- Average ophthalmology consultation: R2,000
- Just 1 extra patient per day covers the R35K subscription
- LASIK: R20,000-R40,000 per eye — one LASIK case per month pays for the platform for a year
- Cataract surgery: R15,000-R25,000 per eye — one extra cataract referral per month = R30K-R50K
- Post-op follow-up automation: ensures compliance, reduces complications, protects your reputation
- **Total ROI: 5-10x the subscription cost**

## Competitors Don't Have This
- No eye care practice in Johannesburg has AI triage for eye symptoms
- No ophthalmologist has a digital optometrist referral portal
- Optometrists refer to whoever is easiest — give them a link and you become the default
- No competitor offers automated post-op follow-up sequences for eye surgery patients

## The Close
"Dr [Name], one LASIK case per month pays for this entire platform for a year. The optometrist referral portal alone will generate that. Right now, optometrists are referring by phone to whoever picks up first. We make you the one-click option. Can we get you set up this week?"

## Objection Handlers
- "That's expensive" → "One LASIK case is R40K-R80K for both eyes. One case per month from the referral portal pays for the platform 12 times over."
- "My optometrists already refer to me" → "They do — but how easy is it? If they can refer to you in 30 seconds with a link versus calling your rooms and waiting on hold, you'll get every referral instead of half."
- "Post-op follow-ups are fine as they are" → "How many patients miss their month-3 follow-up? Automated WhatsApp reminders at each interval means near-100% compliance. That protects your outcomes and your reputation."
- "I need to see a demo first" → "Absolutely. Let me set up a 30-minute demo with your practice manager this week. They'll see exactly how the booking page, referral portal, and follow-up automation work."`,
  },
  {
    title: "Pitch Template — GP / Family Practices",
    content: `# VisioHealth OS — GP / Family Practice Pitch

## Opening (30 seconds)
"Dr [Name], I work with GP practices in Johannesburg. You probably see 30-50 patients a day and you're drowning in admin — booking confirmations, medical aid claims, follow-up calls. I help GPs add 10-15 new patients per month while cutting 2 hours of daily admin. Can I show you how in 15 minutes?"

## The Problem (their pain)
- 30-50 patients per day = drowning in admin between consults
- Medical aid claims get rejected due to ICD-10 coding errors — you lose R10K-R30K/month
- No time for follow-ups — chronic patients (diabetes, hypertension) slip through the cracks
- Patients go to the GP down the road because they can't book online with you
- After-hours, patients call and get voicemail — they go to the ER or another practice

## The Solution (what they get)
At R35,000/month (Professional plan), Dr [Name] gets:

1. **VisioHealth OS** — Complete practice management
   - Patient records with chronic disease management tracking (diabetes, hypertension, HIV, TB)
   - 5 AI agents (triage, intake, follow-up, billing, scheduler)
   - WhatsApp/SMS appointment reminders + chronic care follow-up automation
   - Daily workflow automation (morning/during/end-of-day checklists)

2. **White-Labeled Digital Practice** — Built on our stack
   - SEO landing page: /gp/[yourname] — ranks for "GP [area]", "doctor [area]", "family doctor [area]"
   - Online booking: /book/[yourname] — patients book 24/7, including after hours
   - Specialist referral tracking: /refer/[yourname] — track outbound referrals and get reports back
   - AI symptom checker: patients describe symptoms → triaged to urgency → booked into right slot (or directed to ER if urgent)

3. **Patient Acquisition Package**
   - 100 qualified leads (residents in your area searching for a GP) loaded at onboarding
   - Google Business Profile optimization
   - Medpages, RecoMed directory listings
   - R3,000 AI credits/month included

4. **Staff AI Training**
   - 5 courses for your entire team
   - AI Fundamentals, Platform Mastery, Staff Literacy, POPIA, Clinical AI

## The ROI (the no-brainer math)
- Average GP consultation: R550
- 4 extra patients per day covers the R35K subscription
- After-hours online booking: captures 5-10 patients/week you'd otherwise lose to competitors
- Claim rejection reduction (5-10%): recovers R10,000-R30,000/month
- Chronic care follow-up automation: retains patients worth R6,600-R13,200/year each (monthly visits)
- Admin time saved (2hrs/day): capacity for 6-8 more patients/day
- **Total ROI: 3-5x the subscription cost**

## Competitors Don't Have This
- Even Intercare and Medicross don't have AI agents — independent GPs can leapfrog the chains
- No GP in [area] has an AI symptom checker that triages before the patient even arrives
- Most GPs have no online booking — patients call, get hold music, and go elsewhere
- Chronic care automation doesn't exist in any competing GP system in SA

## The Close
"Dr [Name], you see 40 patients a day. If 4 of those came from our booking page instead of walking to the GP down the road, this is free. And the chronic care follow-ups, claim automation, and admin savings are all on top. Can we get you started this week?"

## Objection Handlers
- "That's expensive for a GP practice" → "It's 4 patients per day at R550. Your receptionist costs R15K and doesn't bring a single new patient. This brings 10-15 per month AND handles admin."
- "My patients are loyal, they don't need online booking" → "Your loyal patients are great. But every month, new people move to your area and Google 'GP near me.' If you don't have online booking, they book with the GP who does."
- "I'm too busy to learn a new system" → "That's the point — you're too busy because you don't have a system. Your staff learns it in 4 hours. You'll get 2 hours back every day."
- "What about the starter plan at R15K?" → "The starter plan gives you the OS and booking page. The Professional plan adds the full digital presence — website, referral tracking, AI symptom checker, 100 leads, and training. The ROI on Professional is significantly higher."
- "I already use [competitor]" → "Does it have AI agents, an online booking page, a symptom checker, and qualified leads? We replace 5-7 tools with one platform."`,
  },
];

async function main() {
  console.log("Seeding specialty pitch templates...\n");

  // Remove existing pitch templates
  const existing = await prisma.opsDocument.findMany({
    where: {
      category: "strategy",
      title: { startsWith: "Pitch Template" },
    },
  });

  if (existing.length > 0) {
    await prisma.opsDocument.deleteMany({
      where: { id: { in: existing.map((d) => d.id) } },
    });
    console.log(`Removed ${existing.length} existing pitch template(s).`);
  }

  for (const template of templates) {
    await prisma.opsDocument.create({
      data: {
        practiceId: "",
        category: "strategy",
        title: template.title,
        pinned: false,
        content: template.content,
        metadata: JSON.stringify({
          type: "pitch_template",
          version: "1.0",
          createdDate: "2026-03-16",
        }),
      },
    });
    console.log(`  + ${template.title}`);
  }

  console.log(`\n${templates.length} pitch templates saved to Ops Hub (category: strategy).`);
  console.log("  Accessible from /dashboard/ops\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
