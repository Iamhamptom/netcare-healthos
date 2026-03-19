/**
 * Seed script for VRL Outreach Campaign System
 * Parses intelligence from SA-HEALTH-SECTOR-DEEP-INTEL-V2.md
 *
 * Run: npx tsx prisma/seed-outreach.ts
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const CAMPAIGNS = [
  {
    name: "VRL Media Blitz",
    segment: "A",
    description: "Get VRL-001 published/featured in SA health media — MedicalBrief, Spotlight, Bhekisisa",
    status: "active",
    emailTemplateKey: "media_pitch",
  },
  {
    name: "Founder Network",
    segment: "B",
    description: "Connect with SA health-tech founders — peer network, champions, collaboration",
    status: "active",
    emailTemplateKey: "founder_intro",
  },
  {
    name: "Hospital Pilots",
    segment: "C",
    description: "Secure pilot partnerships with hospital executives — 30-day free trial",
    status: "draft",
    emailTemplateKey: "hospital_proposal",
  },
  {
    name: "Scheme Integrations",
    segment: "D",
    description: "Medical scheme integration partnerships — claims routing intelligence",
    status: "draft",
    emailTemplateKey: "scheme_integration",
  },
  {
    name: "Association CPD",
    segment: "E",
    description: "CPD module partnerships with professional associations — free education",
    status: "draft",
    emailTemplateKey: "association_cpd",
  },
  {
    name: "Investor Outreach",
    segment: "F",
    description: "Funding or accelerator — R2B SA health tech with research moat",
    status: "draft",
    emailTemplateKey: "investor_deck",
  },
  {
    name: "Conference Circuit",
    segment: "G",
    description: "Speaker slots and abstract submissions — HISA, BHF, WCPH",
    status: "active",
    emailTemplateKey: "conference_speaker",
  },
  {
    name: "CPD Platform Partners",
    segment: "H",
    description: "CPD module distribution via deNovo Medica, Clinical Care Platform, etc.",
    status: "draft",
    emailTemplateKey: "cpd_module",
  },
  {
    name: "Consultant Referrals",
    segment: "I",
    description: "Practice management consultant referral partnerships",
    status: "draft",
    emailTemplateKey: "consultant_partner",
  },
  {
    name: "Clinical Champions",
    segment: "J",
    description: "Recruit 10 clinical champions nationally — free lifetime access + co-authorship",
    status: "draft",
    emailTemplateKey: "champion_invite",
  },
];

// Targets parsed from SA-HEALTH-SECTOR-DEEP-INTEL-V2.md
const TARGETS: {
  campaignSegment: string;
  name: string;
  title: string;
  organization: string;
  priority: number;
  notes: string;
}[] = [
  // Segment A: Media & Journalists
  { campaignSegment: "A", name: "MedicalBrief Editors", title: "Editorial Team", organization: "MedicalBrief", priority: 1, notes: "mbenquiries@juta.co.za — 50K doctors read every Thursday" },
  { campaignSegment: "A", name: "Spotlight Editors", title: "Editorial Team", organization: "Spotlight NSP", priority: 1, notes: "Editors@SpotlightNSP.co.za — NCD angle" },
  { campaignSegment: "A", name: "Bhekisisa Editors", title: "Editorial Team", organization: "Bhekisisa Health Journalism", priority: 2, notes: "Pitch routing crisis narrative" },
  { campaignSegment: "A", name: "The Conversation Africa", title: "Academic Editor", organization: "The Conversation Africa", priority: 2, notes: "Submit academic summary" },
  { campaignSegment: "A", name: "mediBytes Podcast", title: "Host", organization: "mediBytes", priority: 3, notes: "Pitch guest spot" },
  { campaignSegment: "A", name: "Clinical Care Platform", title: "Events Team", organization: "Clinical Care Platform", priority: 2, notes: "Propose live webinar (8-10/month)" },
  { campaignSegment: "A", name: "EMSSA", title: "Communications", organization: "Emergency Medicine Society of SA", priority: 3, notes: "Share with emergency medicine society" },
  { campaignSegment: "A", name: "SAMA Gauteng", title: "Branch Coordinator", organization: "SA Medical Association (Gauteng)", priority: 3, notes: "Share with branch" },

  // Segment B: Health Tech Founders (from V2 intel)
  { campaignSegment: "B", name: "Neo Hutiri", title: "Founder & CEO", organization: "Pelebox", priority: 1, notes: "Smart medicine lockers — Africa Prize winner, TIME 100 Inventions" },
  { campaignSegment: "B", name: "Nneile Nkholise", title: "Founder & CEO", organization: "iMed Tech / Likoebe", priority: 1, notes: "3D-printed prosthetics — Forbes 30 Under 30" },
  { campaignSegment: "B", name: "De Wet Swanepoel", title: "Founder", organization: "hearX / LXE Hearing", priority: 1, notes: "$100M merger with Eargo" },
  { campaignSegment: "B", name: "Dr Yael Joffe", title: "Founder & CEO", organization: "3X4 Genetics", priority: 2, notes: "Nutrigenomics DNA testing — $2.5M raised" },
  { campaignSegment: "B", name: "Kathryn Malherbe", title: "Founder", organization: "MedSol AI", priority: 2, notes: "AI breast cancer detection — SAB Foundation winner" },
  { campaignSegment: "B", name: "Saul Kornik", title: "Founder", organization: "Healthforce / Kena Health", priority: 1, notes: "Nurse-led telehealth — $3.03M + $2M" },
  { campaignSegment: "B", name: "Sheraan Amod", title: "Founder & CEO", organization: "RecoMed", priority: 1, notes: "550K+ bookings — connect on LinkedIn" },
  { campaignSegment: "B", name: "David Chen", title: "Founder", organization: "Kapsule", priority: 3, notes: "Healthcare data aggregation across Africa" },
  { campaignSegment: "B", name: "Marc Gregory Knowles", title: "Founder", organization: "Ollie Health", priority: 3, notes: "Mental health credits — Launch Africa invested" },
  { campaignSegment: "B", name: "Dr Jaishree Naidoo", title: "Founder & CEO", organization: "Envisionit Deep AI", priority: 2, notes: "AI radiology 25 pathologies — $1.65M" },
  { campaignSegment: "B", name: "Njabulo Skhosana", title: "Founder", organization: "HealthDart", priority: 2, notes: "Google Black Founders Fund 2023" },
  { campaignSegment: "B", name: "Avian Bell", title: "Founder", organization: "Quantumed", priority: 3, notes: "Personal healthcare — Forbes Africa 30 Under 30" },
  { campaignSegment: "B", name: "Mphati Jezile", title: "Founder", organization: "BusyMed", priority: 3, notes: "Pharmacy delivery for rural communities" },
  { campaignSegment: "B", name: "Sizwe Nzima", title: "Founder", organization: "Iyeza Health", priority: 3, notes: "Medicine delivery — Cape Town" },
  { campaignSegment: "B", name: "Werner Vorster", title: "Founder", organization: "Vitls", priority: 3, notes: "Health wearable tech" },
  { campaignSegment: "B", name: "Zanele Matome", title: "Founder", organization: "Health Tech Company", priority: 1, notes: "Connect on LinkedIn — priority from V2" },

  // Segment C: Hospital Executives
  { campaignSegment: "C", name: "Dr Dumani Kula", title: "CEO", organization: "Busamed", priority: 1, notes: "BHF 2025 speaker" },
  { campaignSegment: "C", name: "Bernadette Breton", title: "CEO", organization: "Alliance International Medical Services", priority: 2, notes: "From V2 intelligence" },
  { campaignSegment: "C", name: "Gerrit Benecke", title: "Group COO", organization: "Africa Health Care", priority: 2, notes: "From V2 intelligence" },
  { campaignSegment: "C", name: "Francilene Baartman", title: "Director of Nursing", organization: "Tygerberg Hospital", priority: 2, notes: "Largest hospital in Western Cape" },

  // Segment D: Medical Scheme Execs
  { campaignSegment: "D", name: "Kerissa Naidoo", title: "Chief Medical Officer", organization: "Old Mutual Limited", priority: 1, notes: "From V2 intelligence" },
  { campaignSegment: "D", name: "Dr Morwesi Mahlangu", title: "Senior Manager, Medical Advisory", organization: "GEMS", priority: 1, notes: "Government employees medical scheme" },
  { campaignSegment: "D", name: "MedScheme Executive", title: "Innovation Lead", organization: "MedScheme (AfroCentric)", priority: 2, notes: "SA's largest health risk management — 3M+ people" },
  { campaignSegment: "D", name: "MediKredit Team", title: "Partnership Lead", organization: "MediKredit", priority: 2, notes: "3,436 pharmacies, 5,559 doctors, 428 hospitals" },

  // Segment E: Professional Associations
  { campaignSegment: "E", name: "Refiloe Mogale", title: "Executive Director", organization: "PSSA", priority: 1, notes: "Pharmaceutical Society of SA" },
  { campaignSegment: "E", name: "SAMA National", title: "CPD Coordinator", organization: "SA Medical Association", priority: 1, notes: "Official medical association" },
  { campaignSegment: "E", name: "HPCSA CPD", title: "CPD Committee", organization: "Health Professions Council of SA", priority: 1, notes: "Mandatory CPD regulator" },
  { campaignSegment: "E", name: "DENOSA Leadership", title: "President's Office", organization: "Democratic Nursing Org of SA", priority: 2, notes: "82K union members" },
  { campaignSegment: "E", name: "SASP Leadership", title: "National Executive", organization: "SA Society of Physiotherapy", priority: 3, notes: "8K+ followers" },
  { campaignSegment: "E", name: "SADA Leadership", title: "CEO's Office", organization: "SA Dental Association", priority: 2, notes: "Dental profession" },
  { campaignSegment: "E", name: "SAOA Leadership", title: "Board", organization: "SA Optometric Association", priority: 3, notes: "Optometry profession" },

  // Segment F: Investors & Funds
  { campaignSegment: "F", name: "Launch Africa Ventures", title: "Partner", organization: "Launch Africa Ventures", priority: 1, notes: "Invested in Ollie Health — aligned thesis" },
  { campaignSegment: "F", name: "E4E Africa", title: "Partner", organization: "E4E Africa", priority: 1, notes: "Funded BusyMed — health-tech focus" },
  { campaignSegment: "F", name: "Founders Factory Africa", title: "Venture Team", organization: "Netcare Founders Factory Africa", priority: 1, notes: "Netcare-backed — healthcare accelerator" },
  { campaignSegment: "F", name: "Google Black Founders", title: "Program Lead", organization: "Google for Startups", priority: 2, notes: "Funded HealthDart — SA focused" },
  { campaignSegment: "F", name: "SAB Foundation", title: "Innovation Fund", organization: "SAB Foundation", priority: 2, notes: "Backed MedSol AI" },

  // Segment G: Conference Organizers
  { campaignSegment: "G", name: "HISA Conference", title: "Conference Chair", organization: "Health Informatics SA", priority: 1, notes: "May 27-28 JHB — submit abstract" },
  { campaignSegment: "G", name: "BHF Conference", title: "Programme Director", organization: "Board of Healthcare Funders", priority: 1, notes: "July 4-8 Cape Town" },
  { campaignSegment: "G", name: "WCPH Conference", title: "Abstract Committee", organization: "World Congress on Public Health", priority: 2, notes: "Sep 6-9 Cape Town" },
  { campaignSegment: "G", name: "deNovo Medica Events", title: "Events Manager", organization: "deNovo Medica", priority: 2, notes: "20K HCPs/year — free CPD" },

  // Segment H: CPD Platforms
  { campaignSegment: "H", name: "deNovo Medica", title: "Content Director", organization: "deNovo Medica", priority: 1, notes: "20K captive audience — free CPD leader" },
  { campaignSegment: "H", name: "EMGuidance Team", title: "Partnership Lead", organization: "EMGuidance", priority: 1, notes: "80K HCPs, 87% daily usage, 1.6M searches/month" },
  { campaignSegment: "H", name: "MedPages", title: "Content Manager", organization: "MedPages", priority: 2, notes: "720K visits/month — doctor directory" },

  // Segment I: Practice Consultants
  { campaignSegment: "I", name: "Anton Fatti", title: "CTO", organization: "Healthbridge", priority: 1, notes: "Former SARS Chief Tech Officer — 7K+ practices" },
  { campaignSegment: "I", name: "Theo Leonard", title: "CIO", organization: "PMSA", priority: 2, notes: "Practice Management Systems Association" },

  // Segment J: Clinical Champions
  { campaignSegment: "J", name: "Dr Brett Lyndall Singh", title: "Healthcare Equity Leader", organization: "Forbes 30 Under 30", priority: 1, notes: "Forbes 30 Under 30 — healthcare equity" },
  { campaignSegment: "J", name: "Dr Alveera Singh", title: "Postdoctoral Fellow", organization: "AHRI", priority: 1, notes: "M&G 200 Young South Africans" },
  { campaignSegment: "J", name: "Samkele Mkumbuzi", title: "Digital Health Pharmacist", organization: "AMR Youth Ambassador", priority: 2, notes: "Digital health + antimicrobial resistance" },
  { campaignSegment: "J", name: "Dr Oliver Preisig", title: "CEO", organization: "Inqaba Biotec", priority: 2, notes: "Africa's Genomics Company — 9 countries" },
  { campaignSegment: "J", name: "Simon Travers", title: "Founder", organization: "Hyrax Biosciences", priority: 3, notes: "UCT/UWC spin-out — HIV drug resistance testing" },
  { campaignSegment: "J", name: "Onkgopotse Khumalo", title: "Founder", organization: "The Pocket Couch", priority: 3, notes: "Mental health tech — democratizing mental healthcare" },
  { campaignSegment: "J", name: "Ernest Mhlongo", title: "Founder", organization: "Remote Doctors 4 Africa", priority: 3, notes: "Cross-border telehealth" },
  { campaignSegment: "J", name: "Sylvia Klopper", title: "Founder", organization: "CareChamp", priority: 3, notes: "Elderly home care tech" },
];

async function main() {
  console.log("Seeding outreach campaigns...");

  // Clear existing outreach data
  await prisma.outreachEmail.deleteMany();
  await prisma.outreachTarget.deleteMany();
  await prisma.outreachCampaign.deleteMany();
  console.log("Cleared existing outreach data");

  // Create campaigns
  const campaignMap: Record<string, string> = {};
  for (const c of CAMPAIGNS) {
    const campaign = await prisma.outreachCampaign.create({ data: c });
    campaignMap[c.segment] = campaign.id;
    console.log(`  Created campaign: ${c.name} (${c.segment})`);
  }

  // Create targets
  let targetCount = 0;
  for (const t of TARGETS) {
    const campaignId = campaignMap[t.campaignSegment];
    if (!campaignId) {
      console.warn(`  Skipped target ${t.name} — no campaign for segment ${t.campaignSegment}`);
      continue;
    }
    await prisma.outreachTarget.create({
      data: {
        campaignId,
        name: t.name,
        title: t.title,
        organization: t.organization,
        segment: t.campaignSegment,
        priority: t.priority,
        notes: t.notes,
      },
    });
    targetCount++;
  }
  console.log(`  Created ${targetCount} targets across ${CAMPAIGNS.length} campaigns`);

  // Update target counts on campaigns
  for (const [segment, campaignId] of Object.entries(campaignMap)) {
    const count = await prisma.outreachTarget.count({ where: { campaignId } });
    await prisma.outreachCampaign.update({
      where: { id: campaignId },
      data: { targetCount: count },
    });
  }

  console.log("Outreach seed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
