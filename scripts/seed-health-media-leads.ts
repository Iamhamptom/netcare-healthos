/**
 * Seed SA Health Media intelligence as ClientPipeline leads
 * Run: npx tsx scripts/seed-health-media-leads.ts
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const LEADS: {
  practiceName: string;
  doctorName: string;
  specialty: string;
  location: string;
  source: string;
  notes: string;
  monthlyValue: number;
  planTier: string;
}[] = [
  // Health Tech Founders — potential partners / clients
  { practiceName: "Pelebox", doctorName: "Neo Hutiri", specialty: "Health Tech — Medicine Dispensing", location: "SA", source: "vrl-research", notes: "Africa Prize winner, TIME 100. Smart medicine lockers — 123 facilities", monthlyValue: 50000, planTier: "enterprise" },
  { practiceName: "iMed Tech / Likoebe", doctorName: "Nneile Nkholise", specialty: "Health Tech — 3D Prosthetics", location: "SA", source: "vrl-research", notes: "Forbes 30 Under 30. 3D-printed medical prosthetics", monthlyValue: 35000, planTier: "professional" },
  { practiceName: "hearX / LXE Hearing", doctorName: "De Wet Swanepoel", specialty: "Health Tech — Hearing Care", location: "SA", source: "vrl-research", notes: "$100M merger with Eargo. Mobile hearing care", monthlyValue: 75000, planTier: "enterprise" },
  { practiceName: "3X4 Genetics", doctorName: "Dr Yael Joffe", specialty: "Health Tech — Genomics", location: "SA", source: "vrl-research", notes: "$2.5M raised. Nutrigenomics DNA testing", monthlyValue: 50000, planTier: "enterprise" },
  { practiceName: "MedSol AI", doctorName: "Kathryn Malherbe", specialty: "Health Tech — AI Diagnostics", location: "SA", source: "vrl-research", notes: "SAB Foundation winner. AI breast cancer detection", monthlyValue: 35000, planTier: "professional" },
  { practiceName: "Healthforce / Kena Health", doctorName: "Saul Kornik", specialty: "Health Tech — Telehealth", location: "SA", source: "vrl-research", notes: "$3.03M + $2M. Nurse-led telehealth, 300K+ downloads", monthlyValue: 50000, planTier: "enterprise" },
  { practiceName: "RecoMed", doctorName: "Sheraan Amod", specialty: "Health Tech — Patient Booking", location: "SA", source: "vrl-research", notes: "$1.5M raised. 550K+ bookings", monthlyValue: 50000, planTier: "enterprise" },
  { practiceName: "Envisionit Deep AI", doctorName: "Dr Jaishree Naidoo", specialty: "Health Tech — AI Radiology", location: "SA", source: "vrl-research", notes: "$1.65M. 25 pathologies on chest X-ray", monthlyValue: 50000, planTier: "enterprise" },
  { practiceName: "HealthDart", doctorName: "Njabulo Skhosana", specialty: "Health Tech", location: "SA", source: "vrl-research", notes: "Google Black Founders Fund 2023", monthlyValue: 35000, planTier: "professional" },
  { practiceName: "Quantumed", doctorName: "Avian Bell", specialty: "Health Tech — Personal Health", location: "SA", source: "vrl-research", notes: "Forbes Africa 30 Under 30 (2025)", monthlyValue: 35000, planTier: "professional" },
  { practiceName: "BusyMed", doctorName: "Mphati Jezile", specialty: "Health Tech — Pharmacy Delivery", location: "SA", source: "vrl-research", notes: "E4E Africa funded. Rural pharmacy delivery", monthlyValue: 25000, planTier: "starter" },
  { practiceName: "Ollie Health", doctorName: "Marc Gregory Knowles", specialty: "Health Tech — Mental Health", location: "SA", source: "vrl-research", notes: "Launch Africa invested. Mental health credits", monthlyValue: 35000, planTier: "professional" },

  // Hospital Executives — pilot leads
  { practiceName: "Busamed", doctorName: "Dr Dumani Kula", specialty: "Hospital Group — CEO", location: "SA", source: "vrl-research", notes: "BHF 2025 speaker. Hospital group executive", monthlyValue: 75000, planTier: "enterprise" },
  { practiceName: "Alliance International Medical Services", doctorName: "Bernadette Breton", specialty: "Hospital Group — CEO", location: "SA", source: "vrl-research", notes: "International medical services", monthlyValue: 75000, planTier: "enterprise" },
  { practiceName: "Africa Health Care", doctorName: "Gerrit Benecke", specialty: "Hospital Group — COO", location: "SA", source: "vrl-research", notes: "Group COO", monthlyValue: 75000, planTier: "enterprise" },
  { practiceName: "Tygerberg Hospital", doctorName: "Francilene Baartman", specialty: "Hospital — Nursing Director", location: "Western Cape", source: "vrl-research", notes: "Largest hospital in Western Cape", monthlyValue: 75000, planTier: "enterprise" },

  // Medical Scheme Executives — integration leads
  { practiceName: "Old Mutual Health", doctorName: "Kerissa Naidoo", specialty: "Medical Scheme — CMO", location: "SA", source: "vrl-research", notes: "Chief Medical Officer, Old Mutual Limited", monthlyValue: 75000, planTier: "enterprise" },
  { practiceName: "GEMS", doctorName: "Dr Morwesi Mahlangu", specialty: "Medical Scheme — Medical Advisory", location: "SA", source: "vrl-research", notes: "Government employees medical scheme", monthlyValue: 75000, planTier: "enterprise" },

  // Key Platform Partnerships
  { practiceName: "EMGuidance", doctorName: "EMGuidance Team", specialty: "Platform — Clinical Reference", location: "SA", source: "vrl-research", notes: "80K HCPs, 87% daily use, 1.6M searches/month. #1 priority partner", monthlyValue: 50000, planTier: "enterprise" },
  { practiceName: "deNovo Medica", doctorName: "deNovo Medica Team", specialty: "Platform — CPD Provider", location: "SA", source: "vrl-research", notes: "20K HCPs/year. CPD module partnership target", monthlyValue: 35000, planTier: "professional" },
  { practiceName: "MedPages", doctorName: "MedPages Team", specialty: "Platform — Doctor Directory", location: "SA", source: "vrl-research", notes: "720K visits/month. Directory + content partner", monthlyValue: 25000, planTier: "professional" },

  // Investor Leads
  { practiceName: "Launch Africa Ventures", doctorName: "Launch Africa Team", specialty: "Investor — VC", location: "SA", source: "vrl-research", notes: "Invested in Ollie Health — aligned healthtech thesis", monthlyValue: 0, planTier: "enterprise" },
  { practiceName: "E4E Africa", doctorName: "E4E Africa Team", specialty: "Investor — Impact", location: "SA", source: "vrl-research", notes: "Funded BusyMed — health-tech impact focus", monthlyValue: 0, planTier: "enterprise" },
  { practiceName: "Netcare Founders Factory Africa", doctorName: "Founders Factory Team", specialty: "Accelerator — Healthcare", location: "SA", source: "vrl-research", notes: "Netcare-backed healthcare accelerator", monthlyValue: 0, planTier: "enterprise" },

  // Clinical Champions
  { practiceName: "Private Practice", doctorName: "Dr Brett Lyndall Singh", specialty: "Healthcare Equity", location: "SA", source: "vrl-research", notes: "Forbes 30 Under 30 — healthcare equity leader. Champion candidate", monthlyValue: 35000, planTier: "professional" },
  { practiceName: "AHRI", doctorName: "Dr Alveera Singh", specialty: "Research — Postdoctoral", location: "SA", source: "vrl-research", notes: "M&G 200 Young South Africans. Champion candidate", monthlyValue: 35000, planTier: "professional" },
  { practiceName: "Digital Health Practice", doctorName: "Samkele Mkumbuzi", specialty: "Digital Health Pharmacy", location: "SA", source: "vrl-research", notes: "AMR Youth Ambassador. Digital health pharmacist. Champion candidate", monthlyValue: 25000, planTier: "professional" },
];

async function main() {
  console.log("Seeding Health Media SA leads to ClientPipeline...");

  let created = 0;
  let skipped = 0;

  for (const lead of LEADS) {
    // Check if already exists by doctorName
    const existing = await prisma.clientPipeline.findFirst({
      where: { doctorName: lead.doctorName },
    });

    if (existing) {
      console.log(`  Skipped (exists): ${lead.doctorName}`);
      skipped++;
      continue;
    }

    await prisma.clientPipeline.create({
      data: {
        ...lead,
        stage: "lead",
        nextAction: "Research & personalize outreach",
        assignedTo: "chairman",
      },
    });

    // Create activity log
    const client = await prisma.clientPipeline.findFirst({
      where: { doctorName: lead.doctorName },
    });
    if (client) {
      await prisma.clientActivity.create({
        data: {
          clientId: client.id,
          type: "lead_created",
          title: "Lead imported from VRL research",
          description: `Source: SA Health Sector Deep Intel V2 (600+ queries). ${lead.notes}`,
          createdBy: "vrl-research",
        },
      });
    }

    created++;
  }

  console.log(`Done! Created ${created} leads, skipped ${skipped} existing.`);
  console.log(`Total ClientPipeline records: ${await prisma.clientPipeline.count()}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
