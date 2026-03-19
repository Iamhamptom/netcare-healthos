/**
 * Netcare Primary Healthcare Division — White-Label Setup
 * Creates Thirushen Pillay's account with Netcare branding + demo data
 *
 * Thirushen Pillay — Financial Director, Primary Healthcare Division
 * Email: Thirushen.Pillay@netcare.co.za
 *
 * Run: npx tsx scripts/seed-netcare-primarycare.ts
 */

import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "thirushen.pillay@netcare.co.za";

  // Check if already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("User already exists:", existing.id);
    console.log("Role:", existing.role);
    console.log("Practice:", existing.practiceId || "none");
    await prisma.$disconnect();
    return;
  }

  // =========================================================================
  // 1. Create Netcare Primary Care practice — white-labeled
  // =========================================================================
  const practice = await prisma.practice.create({
    data: {
      name: "Netcare Primary Healthcare",
      type: "primary_care_network",
      address: "76 Maude Street, Sandton, 2196, Gauteng",
      phone: "+27 11 301 0000",
      aiPersonality: "professional",
      // Netcare brand colors (from netcare.co.za CSS)
      primaryColor: "#1D3443",   // Netcare dark teal
      secondaryColor: "#3DA9D1", // Netcare accent blue
      subdomain: "netcare-primarycare",
      tagline: "Netcare Primary Healthcare — Providing you with the best and safest care",
      plan: "enterprise",
      planStatus: "trial",
      trialEndsAt: new Date(Date.now() + 30 * 86400000), // 30-day enterprise trial
      bookingEnabled: true,
      bookingRequiresApproval: false,
      bookingServices: JSON.stringify([
        { name: "GP Consultation", duration: 20, price: 650 },
        { name: "Follow-up Visit", duration: 15, price: 450 },
        { name: "Chronic Disease Management", duration: 30, price: 850 },
        { name: "Occupational Health Assessment", duration: 45, price: 1200 },
        { name: "Executive Wellness Screen", duration: 60, price: 3500 },
        { name: "Travel Health Consultation", duration: 30, price: 750 },
        { name: "Dental — General Check-up", duration: 30, price: 550 },
        { name: "Virtual Consultation", duration: 20, price: 500 },
      ]),
      bookingWelcomeMsg:
        "Welcome to Netcare Primary Healthcare. As part of South Africa's largest private primary care network (88 Medicross clinics, 37 pharmacies), we offer comprehensive GP, dental, pharmacy, and occupational health services. Book online and we'll confirm your appointment.",
      bookingConfirmMsg:
        "Your Netcare Medicross appointment has been confirmed. Please bring your medical aid card and ID. For queries, contact your nearest Medicross clinic.",
      integrations: JSON.stringify({
        emr: "HEAL Platform (Netcare Digital + A2D24)",
        erp: "SAP for Healthcare (IS-H)",
        claims: "EDI via MediSwitch — ICD-10 + NAPPI codes",
        cloud: "AWS Serverless (via A2D24)",
        hospital_emr: "CareOn (Deutsche Telekom + Apple iOS)",
      }),
    },
  });
  console.log("Created Netcare Primary Care practice:", practice.id);

  // =========================================================================
  // 2. Create Thirushen Pillay's account
  // =========================================================================
  const passwordHash = await bcrypt.hash("Netcare2026!", 10);
  const user = await prisma.user.create({
    data: {
      name: "Thirushen Pillay",
      email,
      passwordHash,
      role: "admin",
      practiceId: practice.id,
    },
  });
  console.log("Created user:", user.id, user.email);

  // =========================================================================
  // 3. Financial Director daily tasks (tailored to his role)
  // =========================================================================
  const dailyTasks = [
    // Morning
    { title: "Review overnight claims rejections across clinics", category: "morning", sortOrder: 1 },
    { title: "Check divisional revenue dashboard — MTD vs target", category: "morning", sortOrder: 2 },
    { title: "Review Prime Cure capitation utilisation reports", category: "morning", sortOrder: 3 },
    { title: "Flag high-value outstanding medical aid claims (>R5,000)", category: "morning", sortOrder: 4 },
    // During day
    { title: "Process medical scheme tariff reconciliations", category: "during_day", sortOrder: 1 },
    { title: "Review ICD-10 rejection analytics — top 10 rejection codes", category: "during_day", sortOrder: 2 },
    { title: "Monitor occupational health contract billing accuracy", category: "during_day", sortOrder: 3 },
    { title: "Approve pharmacy stock purchase orders", category: "during_day", sortOrder: 4 },
    // End of day
    { title: "Review daily collection ratios per clinic region", category: "end_of_day", sortOrder: 1 },
    { title: "Generate EBITDA variance report for Group reporting", category: "end_of_day", sortOrder: 2 },
    { title: "Check POPIA consent compliance dashboard", category: "end_of_day", sortOrder: 3 },
  ];

  for (const task of dailyTasks) {
    await prisma.dailyTask.create({
      data: { ...task, practiceId: practice.id, date: new Date() },
    });
  }
  console.log("Created", dailyTasks.length, "financial director daily tasks");

  // =========================================================================
  // 4. Demo patients across Medicross clinics (multi-site view)
  // =========================================================================
  const patients = [
    // --- Medicross Sandton ---
    {
      name: "Thandi Mkhize",
      phone: "+27 82 445 3312",
      email: "tmkhize@discovery.co.za",
      dateOfBirth: new Date("1985-04-22"),
      gender: "female",
      medicalAid: "Discovery Health",
      medicalAidNo: "DH-7823445",
      notes: "Chronic diabetes management. Medicross Sandton. Monthly HbA1c monitoring. On Metformin 1000mg BD + Jardiance 25mg OD.",
    },
    {
      name: "Johan van Wyk",
      phone: "+27 83 221 5567",
      email: "jvanwyk@gems.gov.za",
      dateOfBirth: new Date("1972-08-15"),
      gender: "male",
      medicalAid: "GEMS",
      medicalAidNo: "GEMS-445521",
      notes: "Hypertension management. Medicross Sandton. BP well-controlled on Amlodipine 10mg + Perindopril 8mg. 6-monthly bloods.",
    },
    // --- Medicross Fourways ---
    {
      name: "Priya Naidoo",
      phone: "+27 71 889 4456",
      email: "pnaidoo@bonitas.co.za",
      dateOfBirth: new Date("1990-01-30"),
      gender: "female",
      medicalAid: "Bonitas",
      medicalAidNo: "BON-998234",
      notes: "Medicross Fourways. Pregnancy — 28 weeks. High-risk: gestational diabetes. Referred from Netcare antenatal programme.",
    },
    {
      name: "David Moloi",
      phone: "+27 76 334 8821",
      email: "dmoloi@momentum.co.za",
      dateOfBirth: new Date("1968-11-03"),
      gender: "male",
      medicalAid: "Momentum Health",
      medicalAidNo: "MOM-223456",
      notes: "Medicross Fourways. Executive wellness screen — annual. CEO of logistics company. Full bloods, ECG, PSA.",
    },
    // --- Medicross Pretoria East ---
    {
      name: "Lerato Mabena",
      phone: "+27 82 112 6634",
      email: "lmabena@medihelp.co.za",
      dateOfBirth: new Date("1995-06-18"),
      gender: "female",
      medicalAid: "Medihelp",
      medicalAidNo: "MH-667823",
      notes: "Medicross Pretoria East. Asthma — moderate persistent. On Symbicort 200/6 BD. Spirometry due.",
    },
    {
      name: "Pieter Steenkamp",
      phone: "+27 83 776 2210",
      email: "psteenkamp@polmed.co.za",
      dateOfBirth: new Date("1960-03-12"),
      gender: "male",
      medicalAid: "Polmed",
      medicalAidNo: "POL-334521",
      notes: "Medicross Pretoria East. COPD Gold Stage 2. Occupational exposure history (SAPS). Spiriva + Symbicort.",
    },
    // --- Prime Cure Occupational Health ---
    {
      name: "Sipho Dlamini",
      phone: "+27 72 556 7743",
      email: "sdlamini@angloamerican.com",
      dateOfBirth: new Date("1988-09-25"),
      gender: "male",
      medicalAid: "Anglo Medical Scheme",
      medicalAidNo: "AMS-112455",
      notes: "Prime Cure — Anglo American occupational health contract. Annual medical surveillance. Noise exposure monitoring. Audiogram + spirometry.",
    },
    {
      name: "Nomsa Zwane",
      phone: "+27 61 443 5578",
      email: "nzwane@angloamerican.com",
      dateOfBirth: new Date("1992-12-07"),
      gender: "female",
      medicalAid: "Anglo Medical Scheme",
      medicalAidNo: "AMS-221876",
      notes: "Prime Cure — Anglo American occupational health. Pre-employment medical. Fit for duty assessment.",
    },
    // --- NetcarePlus (prepaid/uninsured) ---
    {
      name: "Blessing Moyo",
      phone: "+27 63 221 4490",
      email: "",
      dateOfBirth: new Date("1998-07-14"),
      gender: "male",
      medicalAid: "NetcarePlus Prepaid",
      medicalAidNo: "NCP-PREPAID-88234",
      notes: "NetcarePlus prepaid GP voucher patient. Medicross Randburg. Acute sinusitis. No medical aid — prepaid visit.",
    },
    {
      name: "Zanele Sithole",
      phone: "+27 79 887 2234",
      email: "",
      dateOfBirth: new Date("2001-02-28"),
      gender: "female",
      medicalAid: "NetcarePlus Prepaid",
      medicalAidNo: "NCP-PREPAID-99345",
      notes: "NetcarePlus prepaid patient. Medicross Soweto. Contraception counselling + script. Cash-pay.",
    },
    // --- Dental patients ---
    {
      name: "Aisha Patel",
      phone: "+27 84 556 3321",
      email: "apatel@discovery.co.za",
      dateOfBirth: new Date("1983-05-20"),
      gender: "female",
      medicalAid: "Discovery Health",
      medicalAidNo: "DH-5543892",
      notes: "Medicross Rosebank — Dental. Root canal treatment (tooth 36). ICD-10: K04.0. Dental benefits nearly exhausted.",
    },
    {
      name: "Mandla Khumalo",
      phone: "+27 82 990 1234",
      email: "mkhumalo@gems.gov.za",
      dateOfBirth: new Date("1977-10-08"),
      gender: "male",
      medicalAid: "GEMS",
      medicalAidNo: "GEMS-889234",
      notes: "Medicross Midrand — Dental. Periodontal treatment. Scaling & polishing + chlorhexidine. Recall 3 months.",
    },
    // --- Pharmacy patients ---
    {
      name: "Grace Ndlovu",
      phone: "+27 76 112 8834",
      email: "gndlovu@bonitas.co.za",
      dateOfBirth: new Date("1970-08-22"),
      gender: "female",
      medicalAid: "Bonitas",
      medicalAidNo: "BON-554321",
      notes: "Medicross Centurion — Pharmacy chronic dispensing. Monthly Rx: Metformin 850mg, Amlodipine 5mg, Atorvastatin 20mg. CDL programme.",
    },
    // --- Virtual consultation ---
    {
      name: "Tumelo Modise",
      phone: "+27 60 332 7789",
      email: "tmodise@medihelp.co.za",
      dateOfBirth: new Date("1993-04-11"),
      gender: "male",
      medicalAid: "Medihelp",
      medicalAidNo: "MH-998712",
      notes: "HEAL Virtual Care consultation. Acute upper respiratory infection. Script sent to nearest Medicross pharmacy.",
    },
    // --- Capitated patient (Prime Cure managed care) ---
    {
      name: "Palesa Mokoena",
      phone: "+27 81 665 3321",
      email: "pmokoena@bonmed.co.za",
      dateOfBirth: new Date("1986-01-19"),
      gender: "female",
      medicalAid: "Bonmed (managed by Prime Cure)",
      medicalAidNo: "BMED-445876",
      notes: "Prime Cure capitated patient. Bonmed medical scheme — full capitation. Well-woman check. Pap smear due. Capitation rate: R287 PMPM.",
    },
  ];

  const patientIds: string[] = [];
  for (const p of patients) {
    const patient = await prisma.patient.create({
      data: { ...p, practiceId: practice.id, status: "active" },
    });
    patientIds.push(patient.id);
  }
  console.log("Created", patientIds.length, "patients across Medicross/Prime Cure/NetcarePlus");

  // =========================================================================
  // 5. POPIA consent records
  // =========================================================================
  for (let i = 0; i < patients.length; i++) {
    await prisma.consentRecord.create({
      data: {
        patientName: patients[i].name,
        patientId: patientIds[i],
        consentType: "treatment",
        granted: true,
        method: "digital",
        practiceId: practice.id,
      },
    });
    await prisma.consentRecord.create({
      data: {
        patientName: patients[i].name,
        patientId: patientIds[i],
        consentType: "data_processing",
        granted: true,
        method: "digital",
        practiceId: practice.id,
        notes: "POPIA Section 18 — consent to process personal and special personal information for healthcare delivery",
      },
    });
  }
  console.log("Created", patients.length * 2, "POPIA consent records (treatment + data processing)");

  // =========================================================================
  // 6. Invoices showing multi-site billing with ICD-10 + claims status
  // =========================================================================
  const invoicesData = [
    {
      invoiceNo: "INV-NPC-2026-001",
      patientName: "Thandi Mkhize",
      patientId: patientIds[0],
      lineItems: JSON.stringify([
        { description: "GP Consultation — chronic disease management", icd10Code: "E11.9", quantity: 1, unitPrice: 650, total: 650 },
        { description: "HbA1c blood test", icd10Code: "E11.9", quantity: 1, unitPrice: 180, total: 180 },
        { description: "Metformin 1000mg x60", icd10Code: "E11.9", quantity: 1, unitPrice: 120, total: 120 },
        { description: "Jardiance 25mg x30", icd10Code: "E11.9", quantity: 1, unitPrice: 850, total: 850 },
      ]),
      subtotal: 1800,
      tax: 0,
      total: 1800,
      amountPaid: 1600,
      balance: 200,
      medicalAidClaim: 1600,
      patientPortion: 200,
      claimStatus: "partial",
      claimReference: "DH-CLM-2026-NPC001",
      status: "partial" as const,
      dueDate: new Date("2026-04-15"),
      notes: "Medicross Sandton. Discovery Health CDL — Jardiance shortfall R200 (not on formulary). ICD-10: E11.9 (Type 2 diabetes).",
    },
    {
      invoiceNo: "INV-NPC-2026-002",
      patientName: "David Moloi",
      patientId: patientIds[3],
      lineItems: JSON.stringify([
        { description: "Executive Wellness Screen — comprehensive", icd10Code: "Z00.0", quantity: 1, unitPrice: 3500, total: 3500 },
        { description: "Full blood count + lipogram + HbA1c + PSA + TFT", icd10Code: "Z00.0", quantity: 1, unitPrice: 1200, total: 1200 },
        { description: "Resting ECG", icd10Code: "Z00.0", quantity: 1, unitPrice: 450, total: 450 },
      ]),
      subtotal: 5150,
      tax: 0,
      total: 5150,
      amountPaid: 5150,
      balance: 0,
      medicalAidClaim: 4200,
      patientPortion: 950,
      claimStatus: "paid",
      claimReference: "MOM-CLM-2026-NPC002",
      status: "paid" as const,
      dueDate: new Date("2026-03-30"),
      paidAt: new Date("2026-03-15"),
      notes: "Medicross Fourways. Executive screen — fully paid. Momentum covered R4,200 (screening benefit). Patient paid R950 co-pay.",
    },
    {
      invoiceNo: "INV-NPC-2026-003",
      patientName: "Sipho Dlamini",
      patientId: patientIds[6],
      lineItems: JSON.stringify([
        { description: "Occupational Health — annual medical surveillance", icd10Code: "Z10.0", quantity: 1, unitPrice: 1200, total: 1200 },
        { description: "Audiometry — occupational", icd10Code: "Z10.0", quantity: 1, unitPrice: 380, total: 380 },
        { description: "Spirometry — occupational", icd10Code: "Z10.0", quantity: 1, unitPrice: 350, total: 350 },
        { description: "Drug screening — 5-panel", icd10Code: "Z10.0", quantity: 1, unitPrice: 280, total: 280 },
      ]),
      subtotal: 2210,
      tax: 0,
      total: 2210,
      amountPaid: 0,
      balance: 2210,
      medicalAidClaim: 0,
      patientPortion: 0,
      claimStatus: "submitted",
      claimReference: "ANGLO-PO-2026-Q1-NPC003",
      status: "sent" as const,
      dueDate: new Date("2026-04-30"),
      notes: "Prime Cure occupational health — Anglo American contract. Billed to employer (not medical aid). 30-day terms. PO: ANGLO-PO-2026-Q1.",
    },
    {
      invoiceNo: "INV-NPC-2026-004",
      patientName: "Aisha Patel",
      patientId: patientIds[10],
      lineItems: JSON.stringify([
        { description: "Root canal treatment — molar (tooth 36)", icd10Code: "K04.0", quantity: 1, unitPrice: 4200, total: 4200 },
        { description: "Dental X-ray — periapical", icd10Code: "K04.0", quantity: 2, unitPrice: 350, total: 700 },
        { description: "Local anaesthesia", icd10Code: "K04.0", quantity: 1, unitPrice: 250, total: 250 },
      ]),
      subtotal: 5150,
      tax: 0,
      total: 5150,
      amountPaid: 0,
      balance: 5150,
      medicalAidClaim: 3800,
      patientPortion: 1350,
      claimStatus: "rejected",
      claimReference: "DH-CLM-2026-NPC004",
      status: "overdue" as const,
      dueDate: new Date("2026-03-01"),
      notes: "REJECTED — Discovery dental benefits exhausted for 2026. Full amount now patient liability. Medicross Rosebank dental.",
    },
    {
      invoiceNo: "INV-NPC-2026-005",
      patientName: "Blessing Moyo",
      patientId: patientIds[8],
      lineItems: JSON.stringify([
        { description: "GP Consultation — acute", icd10Code: "J01.9", quantity: 1, unitPrice: 650, total: 650 },
        { description: "Augmentin 625mg x21", icd10Code: "J01.9", quantity: 1, unitPrice: 180, total: 180 },
      ]),
      subtotal: 830,
      tax: 0,
      total: 830,
      amountPaid: 830,
      balance: 0,
      medicalAidClaim: 0,
      patientPortion: 830,
      claimStatus: "",
      claimReference: "",
      status: "paid" as const,
      paidAt: new Date("2026-03-18"),
      notes: "NetcarePlus prepaid voucher — cash patient. No medical aid. Paid at point of service. Medicross Randburg.",
    },
    {
      invoiceNo: "INV-NPC-2026-006",
      patientName: "Palesa Mokoena",
      patientId: patientIds[14],
      lineItems: JSON.stringify([
        { description: "GP Consultation — well-woman check", icd10Code: "Z01.4", quantity: 1, unitPrice: 650, total: 650 },
        { description: "Pap smear — cervical cytology", icd10Code: "Z12.4", quantity: 1, unitPrice: 380, total: 380 },
      ]),
      subtotal: 1030,
      tax: 0,
      total: 1030,
      amountPaid: 0,
      balance: 1030,
      medicalAidClaim: 1030,
      patientPortion: 0,
      claimStatus: "submitted",
      claimReference: "BMED-CLM-2026-NPC006",
      status: "sent" as const,
      dueDate: new Date("2026-04-20"),
      notes: "Prime Cure capitated patient — Bonmed scheme. Full capitation (R287 PMPM). Costs exceeding cap this month — flag for actuarial review.",
    },
  ];

  for (const inv of invoicesData) {
    await prisma.invoice.create({
      data: { ...inv, practiceId: practice.id },
    });
  }
  console.log("Created", invoicesData.length, "multi-site invoices with ICD-10 codes");

  // =========================================================================
  // 7. Sample bookings
  // =========================================================================
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const bookings = [
    {
      patientName: "Thandi Mkhize",
      patientPhone: "+27 82 445 3312",
      patientEmail: "tmkhize@discovery.co.za",
      service: "Chronic Disease Management",
      scheduledAt: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 9, 0),
      status: "confirmed",
      source: "dashboard",
      notes: "Monthly diabetes review — Medicross Sandton. Check HbA1c results.",
    },
    {
      patientName: "Sipho Dlamini",
      patientPhone: "+27 72 556 7743",
      patientEmail: "sdlamini@angloamerican.com",
      service: "Occupational Health Assessment",
      scheduledAt: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 30),
      status: "confirmed",
      source: "dashboard",
      notes: "Anglo American — annual medical surveillance. Audiometry + spirometry + drug screen.",
    },
    {
      patientName: "Priya Naidoo",
      patientPhone: "+27 71 889 4456",
      patientEmail: "pnaidoo@bonitas.co.za",
      service: "GP Consultation",
      scheduledAt: new Date(dayAfter.getFullYear(), dayAfter.getMonth(), dayAfter.getDate(), 8, 30),
      status: "pending",
      source: "public",
      notes: "High-risk pregnancy follow-up — Medicross Fourways. 28-week check.",
    },
    {
      patientName: "Tumelo Modise",
      patientPhone: "+27 60 332 7789",
      patientEmail: "tmodise@medihelp.co.za",
      service: "Virtual Consultation",
      scheduledAt: new Date(dayAfter.getFullYear(), dayAfter.getMonth(), dayAfter.getDate(), 14, 0),
      status: "confirmed",
      source: "public",
      notes: "HEAL Virtual Care — follow-up. Acute URTI symptoms resolved?",
    },
  ];

  for (const booking of bookings) {
    await prisma.booking.create({
      data: { ...booking, practiceId: practice.id },
    });
  }
  console.log("Created", bookings.length, "sample bookings");

  // =========================================================================
  // 8. Credit allocation (enterprise trial)
  // =========================================================================
  await prisma.creditLedger.create({
    data: {
      practiceId: practice.id,
      type: "ai_agent",
      amount: 2000,
      balance: 2000,
      description: "Enterprise trial allocation — 2,000 AI agent credits (Netcare Primary Healthcare evaluation)",
    },
  });
  console.log("Allocated 2,000 AI agent credits");

  // =========================================================================
  // 9. Audit log — account creation
  // =========================================================================
  await prisma.auditLog.create({
    data: {
      action: "account_setup",
      resource: `practice:${practice.id}`,
      details: JSON.stringify({
        type: "white_label_setup",
        client: "Netcare Primary Healthcare Division",
        contact: "Thirushen Pillay — Financial Director",
        plan: "enterprise",
        trialDays: 30,
        clinics: 88,
        pharmacies: 37,
        practitioners: 568,
        capitated_lives: 254000,
        division_revenue: "R662M",
      }),
      ipAddress: "setup-script",
      userId: user.id,
      practiceId: practice.id,
    },
  });
  console.log("Created audit log entry");

  // =========================================================================
  // Summary
  // =========================================================================
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║  NETCARE PRIMARY HEALTHCARE — WHITE-LABEL READY     ║");
  console.log("╠══════════════════════════════════════════════════════╣");
  console.log("║                                                      ║");
  console.log("║  Brand: Netcare dark teal (#1D3443) + blue (#3DA9D1) ║");
  console.log("║  Plan:  Enterprise (30-day trial)                    ║");
  console.log("║                                                      ║");
  console.log("║  Login Credentials:                                   ║");
  console.log("║  Email:    thirushen.pillay@netcare.co.za            ║");
  console.log("║  Password: Netcare2026!                               ║");
  console.log("║                                                      ║");
  console.log("╠══════════════════════════════════════════════════════╣");
  console.log("║  Demo Data:                                          ║");
  console.log(`║  Patients:      ${patientIds.length} (across Medicross, Prime Cure, NetcarePlus)`);
  console.log(`║  Invoices:      ${invoicesData.length} (with ICD-10, claims status, multi-site)`);
  console.log(`║  Bookings:      ${bookings.length} (GP, occ health, virtual, dental)`);
  console.log(`║  Daily Tasks:   ${dailyTasks.length} (Financial Director workflow)`);
  console.log(`║  Consent:       ${patients.length * 2} (POPIA treatment + data processing)`);
  console.log("║  AI Credits:    2,000 (enterprise trial)              ║");
  console.log("║                                                      ║");
  console.log("╚══════════════════════════════════════════════════════╝");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
