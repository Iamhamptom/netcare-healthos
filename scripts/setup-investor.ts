/**
 * Setup Dr. Mogau Lamola — Investor + Client
 * Run: npx tsx scripts/setup-investor.ts
 */

import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "mogau.lamola@visiohealth.co.za";

  // Check if already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("User already exists:", existing.id);
    console.log("Role:", existing.role);
    console.log("Practice:", existing.practiceId || "none");
    await prisma.$disconnect();
    return;
  }

  // 1. Create Dr. Lamola's practice (client onboarding)
  const practice = await prisma.practice.create({
    data: {
      name: "Dr. Lamola Practice",
      type: "gp", // Will update once we know his specialty
      address: "",
      phone: "",
      aiPersonality: "professional",
      primaryColor: "#8B5CF6", // Purple — investor brand
      secondaryColor: "#10b981",
      subdomain: "drlamola",
      tagline: "Dr. Mogau Lamola",
      plan: "professional",
      planStatus: "active",
      bookingEnabled: true,
      bookingRequiresApproval: true,
    },
  });
  console.log("Practice created:", practice.id, practice.name);

  // 2. Create Dr. Lamola's user account (investor + admin of his practice)
  const passwordHash = await bcrypt.hash("VisioHealth2026!", 10);
  const user = await prisma.user.create({
    data: {
      name: "Dr. Mogau Lamola",
      email,
      passwordHash,
      role: "investor", // Investor role — access to /investor portal
      practiceId: practice.id,
    },
  });
  console.log("User created:", user.id, user.email, "role:", user.role);

  // 3. Seed initial investor notes (from our research)
  const notes = [
    {
      userId: user.id,
      section: "general",
      content: "Welcome to the VisioHealth Investor Portal. Use this space to add your notes, questions, and advisory feedback on any part of the ecosystem.",
      pinned: true,
    },
    {
      userId: user.id,
      section: "compliance",
      content: "Full SA healthcare compliance research completed — covering POPIA, HPCSA, ICD-10 SA MIT, CPA, Medical Schemes Act, Medicines Act, and ECTA. All 7 regulations mapped across all 6 products.",
      pinned: true,
    },
    {
      userId: user.id,
      section: "ecosystem",
      content: "VisioHealth OS (core product) is market-ready. 5 sub-products (Placeo Health, Health Integrator, Waiting Room, Payer Connect, VisioMed AI) are in concept/idea stage. Investment accelerates build-out of sub-products.",
      pinned: false,
    },
  ];

  for (const note of notes) {
    await prisma.investorNote.create({ data: note });
  }
  console.log("Seeded", notes.length, "investor notes");

  // 4. Seed default daily tasks for his practice
  const dailyTasks = [
    { title: "Review new patient bookings", category: "morning", sortOrder: 1 },
    { title: "Check WhatsApp messages", category: "morning", sortOrder: 2 },
    { title: "Review AI agent suggestions", category: "during_day", sortOrder: 1 },
    { title: "Process outstanding invoices", category: "during_day", sortOrder: 2 },
    { title: "Send patient reminders for tomorrow", category: "end_of_day", sortOrder: 1 },
    { title: "Review daily analytics", category: "end_of_day", sortOrder: 2 },
  ];

  for (const task of dailyTasks) {
    await prisma.dailyTask.create({
      data: { ...task, practiceId: practice.id, date: new Date() },
    });
  }
  console.log("Seeded", dailyTasks.length, "daily tasks");

  // 5. Create POPIA consent record template
  await prisma.consentRecord.create({
    data: {
      patientName: "TEMPLATE — Treatment Consent",
      consentType: "treatment",
      granted: true,
      method: "digital",
      practiceId: practice.id,
    },
  });

  console.log("\n=== SETUP COMPLETE ===");
  console.log("Email:", email);
  console.log("Password: VisioHealth2026!");
  console.log("Role: investor");
  console.log("Practice:", practice.name, `(${practice.id})`);
  console.log("Plan: Professional (active)");
  console.log("Portal: /investor (ecosystem, sitemap, compliance, notes, policies)");
  console.log("Dashboard: /dashboard (practice management)");
  console.log("\nDr. Lamola can access BOTH the investor portal AND his practice dashboard.");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
