// Seed script: Set up Dr. Mogau Lamola's ENT practice
// Run: npx tsx scripts/seed-drlamola.ts

import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { hash } from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Setting up Dr. Lamola's practice...\n");

  // 1. Create the practice
  const practice = await prisma.practice.upsert({
    where: { id: "joburg-ent" },
    update: {},
    create: {
      id: "joburg-ent",
      name: "Joburg ENT — Dr. Mogau Lamola",
      type: "ent",
      address: "Netcare Park Lane Hospital, South Wing Sessional Rooms, Corner Junction Ave & Park Lane, Parktown, Johannesburg, 2193",
      phone: "011 480 4318",
      hours: "Mon-Fri 08:30-17:00, Sat 08:30-13:00",
      aiPersonality: "professional",
      // Branding
      logoUrl: "",
      primaryColor: "#0D6E4F", // Medical green
      secondaryColor: "#2DD4BF",
      subdomain: "drlamola",
      tagline: "Expert ENT & Sinus Surgery — Breathe Freely, Live Fully",
      // Subscription
      plan: "professional",
      planStatus: "active",
      // Booking settings
      bookingEnabled: true,
      bookingRequiresApproval: true,
      bookingDepositEnabled: false,
      bookingDepositAmount: 0,
      bookingServices: JSON.stringify([
        { name: "Sinus Consultation", duration: 30, price: 950 },
        { name: "FESS Surgery Consultation", duration: 45, price: 1200 },
        { name: "Balloon Sinuplasty Consultation", duration: 45, price: 1200 },
        { name: "Septoplasty Consultation", duration: 45, price: 1200 },
        { name: "Allergy Assessment", duration: 30, price: 950 },
        { name: "Ear Consultation", duration: 30, price: 950 },
        { name: "Throat Consultation", duration: 30, price: 950 },
        { name: "Sleep & Snoring Assessment", duration: 45, price: 1200 },
        { name: "Paediatric ENT", duration: 30, price: 950 },
        { name: "Follow-up Visit", duration: 15, price: 650 },
        { name: "Tonsillectomy Consultation", duration: 30, price: 950 },
        { name: "Hearing Assessment", duration: 30, price: 950 },
      ]),
      bookingWelcomeMsg: "Welcome to Joburg ENT. Dr. Mogau Lamola is a fellowship-trained ENT surgeon and Head of ENT at Nelson Mandela Children's Hospital. Select your service below to book a consultation.",
      bookingConfirmMsg: "Thank you for booking with Joburg ENT. We'll confirm your appointment via WhatsApp within 24 hours.",
      googlePlaceId: "ChIJA6RBjBINlR4RTUjHxZY5g_M",
    },
  });

  console.log(`✓ Practice created: ${practice.name} (subdomain: ${practice.subdomain})`);

  // 2. Create the doctor user
  const passwordHash = await hash("JoburgENT2026!", 12);
  const user = await prisma.user.upsert({
    where: { email: "drmglamola@gmail.com" },
    update: {},
    create: {
      id: "dr-lamola",
      email: "drmglamola@gmail.com",
      passwordHash,
      name: "Dr. Mogau Lamola",
      role: "admin",
      practiceId: practice.id,
    },
  });

  console.log(`✓ User created: ${user.name} (${user.email})`);

  // 3. Create a receptionist account
  const receptionistHash = await hash("Reception2026!", 12);
  const receptionist = await prisma.user.upsert({
    where: { email: "info@joburg-ent.co.za" },
    update: {},
    create: {
      id: "joburg-ent-reception",
      email: "info@joburg-ent.co.za",
      passwordHash: receptionistHash,
      name: "Joburg ENT Reception",
      role: "receptionist",
      practiceId: practice.id,
    },
  });

  console.log(`✓ Receptionist created: ${receptionist.name}`);

  // 4. Set up daily tasks
  const dailyTasks = [
    // Morning
    { title: "Review overnight GP referrals", category: "morning", sortOrder: 1 },
    { title: "Check today's appointment confirmations", category: "morning", sortOrder: 2 },
    { title: "Review pending booking approvals", category: "morning", sortOrder: 3 },
    { title: "Check WhatsApp for patient messages", category: "morning", sortOrder: 4 },
    // During day
    { title: "Process new referrals — accept/decline within 24h", category: "during_day", sortOrder: 1 },
    { title: "Send GP feedback for completed referral patients", category: "during_day", sortOrder: 2 },
    { title: "Check Google Reviews — respond to new reviews", category: "during_day", sortOrder: 3 },
    { title: "Post social media content (check content calendar)", category: "during_day", sortOrder: 4 },
    // End of day
    { title: "Mark today's completed appointments as 'completed'", category: "end_of_day", sortOrder: 1 },
    { title: "Review tomorrow's schedule — confirm all patients", category: "end_of_day", sortOrder: 2 },
    { title: "Process outstanding invoices", category: "end_of_day", sortOrder: 3 },
  ];

  for (const task of dailyTasks) {
    await prisma.dailyTask.create({
      data: {
        ...task,
        practiceId: practice.id,
        isRecurring: true,
      },
    });
  }

  console.log(`✓ ${dailyTasks.length} daily tasks created`);

  console.log("\n✅ Dr. Lamola's practice is fully set up!");
  console.log(`\n📋 Access URLs:`);
  console.log(`   Booking:          /book/drlamola`);
  console.log(`   Symptom Checker:  /check/drlamola`);
  console.log(`   GP Referral:      /refer/drlamola`);
  console.log(`   SEO Landing:      /ent/drlamola`);
  console.log(`   Dashboard:        /dashboard (login: drmglamola@gmail.com)`);
  console.log(`\n📊 Google Place ID: ${practice.googlePlaceId}`);
  console.log(`📍 Address: ${practice.address}`);
  console.log(`📞 Phone: ${practice.phone}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
