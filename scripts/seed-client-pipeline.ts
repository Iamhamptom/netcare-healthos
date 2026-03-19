// Seed script: Populate Client Pipeline with Top 20 Gauteng doctors
// Run: npx tsx scripts/seed-client-pipeline.ts

import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

interface LeadData {
  practiceName: string;
  doctorName: string;
  specialty: string;
  location: string;
  phone: string;
  email: string;
  stage: string;
  practiceId?: string | null;
}

const LEADS: LeadData[] = [
  { practiceName: "Joburg ENT — Dr. Mogau Lamola", doctorName: "Dr Mogau Lamola", specialty: "ENT", location: "Parktown", phone: "011 480 4318", email: "drmglamola@gmail.com", stage: "active", practiceId: null },
  { practiceName: "Houghton Dental — Dr Aadil Jeena", doctorName: "Dr Aadil Jeena", specialty: "Dental", location: "Houghton", phone: "074 804 0271", email: "", stage: "lead" },
  { practiceName: "Fourways Orthopaedics — Dr Lipalo Mokete", doctorName: "Dr Lipalo Mokete", specialty: "Orthopaedic", location: "Fourways", phone: "011 875 1855", email: "", stage: "lead" },
  { practiceName: "Bryanston Aesthetics — Dr Kevin Scheepers", doctorName: "Dr Kevin Scheepers", specialty: "GP & Aesthetics", location: "Bryanston", phone: "011 706 6800", email: "", stage: "lead" },
  { practiceName: "Sandton Dental — Dr Wynand van der Merwe", doctorName: "Dr Wynand van der Merwe", specialty: "Dental", location: "Sandton", phone: "011 326 5153", email: "", stage: "lead" },
  { practiceName: "Morningside Eye — Dr Darren Stoler", doctorName: "Dr Darren Stoler", specialty: "Ophthalmology", location: "Morningside", phone: "011 783 0099", email: "", stage: "lead" },
  { practiceName: "Morningside Derm — Dr Mary Rouhani", doctorName: "Dr Mary Rouhani", specialty: "Dermatology", location: "Morningside", phone: "011 875 1870", email: "", stage: "lead" },
  { practiceName: "Rosebank Dental — Dr Sebasch Ranchod", doctorName: "Dr Sebasch Ranchod", specialty: "Dental", location: "Rosebank", phone: "011 615 9352", email: "", stage: "lead" },
  { practiceName: "Sandton Gynae — Dr Anusha Naidoo", doctorName: "Dr Anusha Naidoo", specialty: "Gynaecology", location: "Sandton", phone: "011 463 3856", email: "", stage: "lead" },
  { practiceName: "Morningside Paeds — Dr Enrico Maraschin", doctorName: "Dr Enrico Maraschin", specialty: "Paediatrics", location: "Morningside", phone: "011 784 2729", email: "", stage: "lead" },
  { practiceName: "Bryanston Paeds — Dr Graham Jones", doctorName: "Dr Graham Jones", specialty: "Paediatrics", location: "Bryanston", phone: "011 706 1153", email: "", stage: "lead" },
  { practiceName: "Sandton ENT — Dr Boipelo Tselapedi", doctorName: "Dr Boipelo Tselapedi", specialty: "ENT", location: "Sandton", phone: "", email: "", stage: "lead" },
  { practiceName: "Rosebank Derm — Dr Danny Pincus", doctorName: "Dr Danny Pincus", specialty: "Dermatology", location: "Rosebank", phone: "011 268 1382", email: "", stage: "lead" },
  { practiceName: "Bryanston Gynae — Dr Neelan Pillay", doctorName: "Dr Neelan Pillay", specialty: "Gynaecology", location: "Bryanston", phone: "011 463 7599", email: "", stage: "lead" },
  { practiceName: "Bryanston Paeds — Dr Roshni Naicker", doctorName: "Dr Roshni Naicker", specialty: "Paediatrics", location: "Bryanston", phone: "087 133 0248", email: "", stage: "lead" },
  { practiceName: "Bryanston Dental — Dr Cerina Green", doctorName: "Dr Cerina Green", specialty: "Dental", location: "Bryanston", phone: "", email: "", stage: "lead" },
  { practiceName: "Morningside GP — Dr Coenraad van Schoor", doctorName: "Dr Coenraad van Schoor", specialty: "GP", location: "Morningside", phone: "069 886 9255", email: "", stage: "lead" },
  { practiceName: "Morningside Eye — Dr Philip Phatudi", doctorName: "Dr Philip Phatudi", specialty: "Ophthalmology", location: "Morningside", phone: "011 884 5624", email: "", stage: "lead" },
  { practiceName: "Linksfield ENT — Dr Mohammed Nathie", doctorName: "Dr Mohammed Nathie", specialty: "ENT", location: "Linksfield", phone: "063 860 7924", email: "", stage: "lead" },
  { practiceName: "Bryanston Ortho — Dr Michael McDonald", doctorName: "Dr Michael McDonald", specialty: "Orthopaedic", location: "Bryanston", phone: "011 706 1244", email: "", stage: "lead" },
];

async function main() {
  console.log("Seeding Client Pipeline — Top 20 Gauteng doctors\n");

  // Check if Dr Lamola's practice exists to link
  let lamolaId: string | null = null;
  try {
    const lamola = await prisma.practice.findFirst({
      where: { name: { contains: "Lamola" } },
    });
    if (lamola) {
      lamolaId = lamola.id;
      console.log(`Found existing practice for Dr Lamola: ${lamola.id}`);
    }
  } catch {
    // No practice found, that's fine
  }

  // Set Lamola's practiceId if found
  LEADS[0].practiceId = lamolaId;

  let created = 0;
  for (const lead of LEADS) {
    // Check if already exists by doctor name
    const existing = await prisma.clientPipeline.findFirst({
      where: { doctorName: lead.doctorName },
    });
    if (existing) {
      console.log(`  Skipping ${lead.doctorName} — already exists`);
      continue;
    }

    const client = await prisma.clientPipeline.create({
      data: {
        practiceName: lead.practiceName,
        doctorName: lead.doctorName,
        specialty: lead.specialty,
        location: lead.location,
        phone: lead.phone,
        email: lead.email,
        stage: lead.stage,
        planTier: "professional",
        monthlyValue: 35000,
        source: "outbound",
        assignedTo: "Dr. Hampton",
        nextAction: "Research and prepare outreach",
        practiceId: lead.practiceId || null,
      },
    });

    await prisma.clientActivity.create({
      data: {
        clientId: client.id,
        type: "stage_change",
        title: "Lead added from Gauteng health research",
        description: `${lead.doctorName} — ${lead.specialty}, ${lead.location}`,
        createdBy: "system",
      },
    });

    created++;
    console.log(`  + ${lead.doctorName} (${lead.specialty}, ${lead.location}) — ${lead.stage}`);
  }

  console.log(`\n${created} clients seeded (${LEADS.length - created} skipped).`);

  // Summary
  const total = await prisma.clientPipeline.count();
  const leads = await prisma.clientPipeline.count({ where: { stage: "lead" } });
  const active = await prisma.clientPipeline.count({ where: { stage: "active" } });
  console.log(`\nPipeline totals: ${total} total, ${leads} leads, ${active} active`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
