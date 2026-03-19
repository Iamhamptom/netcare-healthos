/**
 * Seed Dr. Mogau Lamola's ENT Practice with realistic data
 * Run: npx tsx scripts/seed-lamola-practice.ts
 */

import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "mogau.lamola@visiohealth.co.za";

  // Find Dr. Lamola's user and practice
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error("User not found:", email);
    console.error("Run setup-investor.ts first.");
    await prisma.$disconnect();
    process.exit(1);
  }
  if (!user.practiceId) {
    console.error("User has no practice assigned.");
    await prisma.$disconnect();
    process.exit(1);
  }

  const practiceId = user.practiceId;
  console.log("Found Dr. Lamola — User:", user.id, "Practice:", practiceId);

  // =========================================================================
  // 1. Update practice with ENT details, booking services & messages
  // =========================================================================
  const bookingServices = [
    { name: "ENT Consultation", duration: 30, price: 1250 },
    { name: "Follow-up Visit", duration: 15, price: 900 },
    { name: "Nasal Endoscopy", duration: 30, price: 2500 },
    { name: "Hearing Assessment Referral", duration: 20, price: 1100 },
    { name: "Paediatric ENT Consultation", duration: 30, price: 1400 },
    { name: "Pre-operative Assessment", duration: 45, price: 1800 },
    { name: "Post-operative Review", duration: 15, price: 900 },
    { name: "Emergency ENT", duration: 0, price: 2000 },
  ];

  await prisma.practice.update({
    where: { id: practiceId },
    data: {
      name: "Joburg ENT — Dr. Mogau Lamola",
      type: "ent",
      address: "Netcare Park Lane Hospital, Cnr Junction Ave & Park Lane, Parktown 2193",
      phone: "+27 11 480 5600",
      tagline: "ENT Surgery & Paediatric ENT — Netcare Park Lane Hospital",
      bookingServices: JSON.stringify(bookingServices),
      bookingWelcomeMsg:
        "Welcome to Joburg ENT. Dr. Mogau Lamola specialises in ENT surgery and paediatric ENT at Netcare Park Lane Hospital, Parktown.",
      bookingConfirmMsg:
        "Your appointment with Dr. Lamola at Joburg ENT has been confirmed. Netcare Park Lane Hospital, Cnr Junction Ave & Park Lane, Parktown 2193. Please bring your medical aid card and any referral letters.",
    },
  });
  console.log("Updated practice details, booking services & messages");

  // =========================================================================
  // 2. Delete existing daily tasks and create ENT-specific ones
  // =========================================================================
  const deletedTasks = await prisma.dailyTask.deleteMany({
    where: { practiceId },
  });
  console.log("Deleted", deletedTasks.count, "existing daily tasks");

  const dailyTasks = [
    // Morning
    { title: "Review referral letters", category: "morning", sortOrder: 1 },
    { title: "Check post-op patient list", category: "morning", sortOrder: 2 },
    { title: "Review lab/imaging results", category: "morning", sortOrder: 3 },
    // During day
    { title: "Update patient records after consultations", category: "during_day", sortOrder: 1 },
    { title: "Process medical aid pre-authorisations", category: "during_day", sortOrder: 2 },
    { title: "Review AI agent suggestions", category: "during_day", sortOrder: 3 },
    // End of day
    { title: "Send post-op follow-up reminders", category: "end_of_day", sortOrder: 1 },
    { title: "Update HPCSA CPD log", category: "end_of_day", sortOrder: 2 },
    { title: "Review tomorrow's theatre list", category: "end_of_day", sortOrder: 3 },
  ];

  for (const task of dailyTasks) {
    await prisma.dailyTask.create({
      data: { ...task, practiceId, date: new Date() },
    });
  }
  console.log("Created", dailyTasks.length, "ENT-specific daily tasks");

  // =========================================================================
  // 3. Create 20 realistic ENT patients
  // =========================================================================
  const today = new Date();
  const patients = [
    // --- Paediatric: recurrent tonsillitis ---
    {
      name: "Lerato Mokoena",
      phone: "+27 82 341 5567",
      email: "smokoena@discovery.co.za",
      dateOfBirth: new Date("2019-06-14"),
      gender: "female",
      medicalAid: "Discovery Health",
      medicalAidNo: "DH-9827341",
      notes: "Paediatric. Recurrent tonsillitis — 6 episodes in 12 months. GP referral for tonsillectomy assessment. Parent: Sibongile Mokoena.",
    },
    // --- Paediatric: glue ear ---
    {
      name: "Thabo Nkosi",
      phone: "+27 73 556 8823",
      email: "mnkosi@gems.gov.za",
      dateOfBirth: new Date("2020-03-22"),
      gender: "male",
      medicalAid: "GEMS",
      medicalAidNo: "GEMS-445521",
      notes: "Paediatric. Bilateral glue ear (otitis media with effusion). Speech delay concerns. Audiogram pending. Parent: Mpho Nkosi.",
    },
    // --- Paediatric: adenoid hypertrophy ---
    {
      name: "Amahle Dlamini",
      phone: "+27 61 223 4490",
      email: "tdlamini@bonitas.co.za",
      dateOfBirth: new Date("2018-11-05"),
      gender: "female",
      medicalAid: "Bonitas",
      medicalAidNo: "BON-667823",
      notes: "Paediatric. Adenoid hypertrophy with chronic mouth breathing and snoring. Sleep-disordered breathing suspected. Parent: Thandeka Dlamini.",
    },
    // --- Paediatric: foreign body ---
    {
      name: "Liam van der Merwe",
      phone: "+27 82 990 1234",
      email: "jvdmerwe@momentum.co.za",
      dateOfBirth: new Date("2022-08-30"),
      gender: "male",
      medicalAid: "Momentum Health",
      medicalAidNo: "MOM-334512",
      notes: "Paediatric. Nasal foreign body (bead) removed under sedation 2026-02-28. Follow-up to check healing. Parent: Johann van der Merwe.",
    },
    // --- Paediatric: recurrent otitis media ---
    {
      name: "Naledi Mahlangu",
      phone: "+27 76 443 5578",
      email: "kmahlangu@medihelp.co.za",
      dateOfBirth: new Date("2021-01-17"),
      gender: "female",
      medicalAid: "Medihelp",
      medicalAidNo: "MH-221876",
      notes: "Paediatric. Recurrent acute otitis media — 5 episodes in 8 months. Candidate for grommets. Parent: Kgomotso Mahlangu.",
    },
    // --- Adult: chronic sinusitis ---
    {
      name: "Pieter Botha",
      phone: "+27 83 776 2210",
      email: "pieter.botha@gmail.com",
      dateOfBirth: new Date("1978-04-12"),
      gender: "male",
      medicalAid: "Discovery Health",
      medicalAidNo: "DH-5543892",
      notes: "Chronic maxillary sinusitis. Failed 3 courses of antibiotics. CT sinuses shows bilateral mucosal thickening. FESS candidate.",
    },
    // --- Adult: deviated septum ---
    {
      name: "Nomvula Zulu",
      phone: "+27 71 889 3345",
      email: "nomvula.z@webmail.co.za",
      dateOfBirth: new Date("1990-09-28"),
      gender: "female",
      medicalAid: "GEMS",
      medicalAidNo: "GEMS-889234",
      notes: "Deviated nasal septum with chronic nasal obstruction. Failed medical therapy. Septoplasty planned.",
    },
    // --- Adult: hearing loss ---
    {
      name: "David Pretorius",
      phone: "+27 82 112 6678",
      email: "dpretorius@mweb.co.za",
      dateOfBirth: new Date("1965-02-19"),
      gender: "male",
      medicalAid: "Bonitas",
      medicalAidNo: "BON-112455",
      notes: "Progressive bilateral sensorineural hearing loss. Noise exposure history (mining). Referred for hearing aid fitting. Audiogram: moderate loss bilateral.",
    },
    // --- Adult: sleep apnoea ---
    {
      name: "Fatima Patel",
      phone: "+27 84 556 7743",
      email: "fatima.patel@yahoo.com",
      dateOfBirth: new Date("1982-12-03"),
      gender: "female",
      medicalAid: "Discovery Health",
      medicalAidNo: "DH-7762109",
      notes: "Obstructive sleep apnoea — AHI 28 (moderate-severe). BMI 34. Trialled CPAP, non-compliant. Evaluate for UPPP or alternative surgical intervention.",
    },
    // --- Adult: hoarseness ---
    {
      name: "Bongani Sithole",
      phone: "+27 72 334 8891",
      email: "bsithole@gems.gov.za",
      dateOfBirth: new Date("1975-07-15"),
      gender: "male",
      medicalAid: "GEMS",
      medicalAidNo: "GEMS-553467",
      notes: "Persistent hoarseness x 6 weeks. Heavy smoker (20 pack-years). Laryngoscopy revealed right vocal cord leukoplakia. Biopsy scheduled.",
    },
    // --- Adult: chronic tonsillitis ---
    {
      name: "Zanele Mthembu",
      phone: "+27 63 221 4456",
      email: "zanele.m@outlook.com",
      dateOfBirth: new Date("1995-05-20"),
      gender: "female",
      medicalAid: "Momentum Health",
      medicalAidNo: "MOM-998234",
      notes: "Chronic tonsillitis with tonsillar stones. 5+ episodes per year. Tonsillectomy planned.",
    },
    // --- Adult: nasal polyps ---
    {
      name: "Andries Venter",
      phone: "+27 82 445 3367",
      email: "andries.v@telkomsa.net",
      dateOfBirth: new Date("1970-03-08"),
      gender: "male",
      medicalAid: "Medihelp",
      medicalAidNo: "MH-334521",
      notes: "Bilateral nasal polyposis with anosmia. Asthmatic. On Dupixent. Nasal endoscopy shows Grade 3 polyps. FESS with polypectomy planned.",
    },
    // --- Adult: epistaxis ---
    {
      name: "Grace Molefe",
      phone: "+27 79 887 2234",
      email: "gmolefe@bonitas.co.za",
      dateOfBirth: new Date("1988-10-25"),
      gender: "female",
      medicalAid: "Bonitas",
      medicalAidNo: "BON-778234",
      notes: "Recurrent epistaxis — anterior septal source (Little's area). Cauterised x2. Ongoing episodes. Bloods normal. Consider sphenopalatine artery ligation if recurs.",
    },
    // --- Adult: thyroid nodule ---
    {
      name: "Sipho Ndaba",
      phone: "+27 60 112 9945",
      email: "sipho.ndaba@gmail.com",
      dateOfBirth: new Date("1980-06-30"),
      gender: "male",
      medicalAid: "Discovery Health",
      medicalAidNo: "DH-3321876",
      notes: "Thyroid nodule — 2.8cm right lobe. FNA: Bethesda III (atypia). Referred for diagnostic hemithyroidectomy. TFTs normal.",
    },
    // --- Post-surgical: tonsillectomy follow-up ---
    {
      name: "Karabo Tshabalala",
      phone: "+27 81 665 3321",
      email: "ktshabalala@discovery.co.za",
      dateOfBirth: new Date("2016-04-11"),
      gender: "male",
      medicalAid: "Discovery Health",
      medicalAidNo: "DH-8854321",
      notes: "Post-op: Tonsillectomy + adenoidectomy 2026-03-07. Day 7 review. No secondary bleeding. Eating soft diet. Parent: Refilwe Tshabalala.",
      lastVisit: new Date("2026-03-07"),
    },
    // --- Post-surgical: grommet check ---
    {
      name: "Emma Joubert",
      phone: "+27 83 221 5567",
      email: "ejoubert@momentum.co.za",
      dateOfBirth: new Date("2019-12-02"),
      gender: "female",
      medicalAid: "Momentum Health",
      medicalAidNo: "MOM-445876",
      notes: "Post-op: Bilateral grommet insertion 2026-02-14. 4-week check — grommets in situ, no discharge. Hearing improved per parent. Next review 3 months. Parent: Megan Joubert.",
      lastVisit: new Date("2026-02-14"),
    },
    // --- Post-surgical: septoplasty review ---
    {
      name: "Tumelo Khumalo",
      phone: "+27 72 998 1123",
      email: "tkhumalo@gems.gov.za",
      dateOfBirth: new Date("1992-08-18"),
      gender: "male",
      medicalAid: "GEMS",
      medicalAidNo: "GEMS-776234",
      notes: "Post-op: Septoplasty 2026-03-01. 2-week review. Splints removed. Mild crusting — saline irrigation. No septal haematoma. Breathing improved.",
      lastVisit: new Date("2026-03-01"),
    },
    // --- Adult: vertigo ---
    {
      name: "Lindiwe Maseko",
      phone: "+27 84 332 7789",
      email: "lmaseko@medihelp.co.za",
      dateOfBirth: new Date("1985-01-22"),
      gender: "female",
      medicalAid: "Medihelp",
      medicalAidNo: "MH-998712",
      notes: "Benign paroxysmal positional vertigo (BPPV) — right posterior canal. Epley manoeuvre performed x2. Symptoms resolving. Review if recurs.",
    },
    // --- Adult: salivary gland ---
    {
      name: "Willem du Plessis",
      phone: "+27 82 554 1198",
      email: "wduplessis@mweb.co.za",
      dateOfBirth: new Date("1972-11-14"),
      gender: "male",
      medicalAid: "Discovery Health",
      medicalAidNo: "DH-2234567",
      notes: "Right submandibular gland swelling — recurrent sialadenitis. Ultrasound shows 8mm calculus in Wharton's duct. Sialendoscopy planned.",
    },
    // --- Adult: allergic rhinitis ---
    {
      name: "Ayanda Ngcobo",
      phone: "+27 76 112 8834",
      email: "angcobo@bonitas.co.za",
      dateOfBirth: new Date("1998-03-09"),
      gender: "female",
      medicalAid: "Bonitas",
      medicalAidNo: "BON-554321",
      notes: "Severe allergic rhinitis — perennial. Failed intranasal steroids and antihistamines. RAST positive: HDM, grass pollen, cat dander. Consider sublingual immunotherapy.",
    },
  ];

  const patientIds: string[] = [];
  for (const p of patients) {
    const patient = await prisma.patient.create({
      data: {
        ...p,
        practiceId,
        status: "active",
        lastVisit: p.lastVisit || null,
      },
    });
    patientIds.push(patient.id);
  }
  console.log("Created", patientIds.length, "ENT patients");

  // =========================================================================
  // 4. POPIA consent records for each patient
  // =========================================================================
  for (let i = 0; i < patients.length; i++) {
    await prisma.consentRecord.create({
      data: {
        patientName: patients[i].name,
        patientId: patientIds[i],
        consentType: "treatment",
        granted: true,
        method: "digital",
        practiceId,
      },
    });
  }
  console.log("Created", patients.length, "POPIA treatment consent records");

  // =========================================================================
  // 5. Sample bookings for the next few days
  // =========================================================================
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);
  const day3 = new Date(today);
  day3.setDate(day3.getDate() + 3);

  const bookings = [
    {
      patientName: "Pieter Botha",
      patientPhone: "+27 83 776 2210",
      patientEmail: "pieter.botha@gmail.com",
      service: "Pre-operative Assessment",
      scheduledAt: new Date(tomorrow.setHours(8, 30, 0, 0)),
      status: "confirmed",
      source: "dashboard",
      notes: "Pre-op for FESS. Bring CT scan images.",
    },
    {
      patientName: "Karabo Tshabalala",
      patientPhone: "+27 81 665 3321",
      patientEmail: "ktshabalala@discovery.co.za",
      service: "Post-operative Review",
      scheduledAt: new Date(tomorrow.setHours(10, 0, 0, 0)),
      status: "confirmed",
      source: "public",
      notes: "Day 14 post-tonsillectomy check. Parent: Refilwe Tshabalala.",
    },
    {
      patientName: "Naledi Mahlangu",
      patientPhone: "+27 76 443 5578",
      patientEmail: "kmahlangu@medihelp.co.za",
      service: "Paediatric ENT Consultation",
      scheduledAt: new Date(dayAfter.setHours(9, 0, 0, 0)),
      status: "confirmed",
      source: "dashboard",
      notes: "Recurrent otitis media — grommet assessment. Parent: Kgomotso Mahlangu.",
    },
    {
      patientName: "Bongani Sithole",
      patientPhone: "+27 72 334 8891",
      patientEmail: "bsithole@gems.gov.za",
      service: "Nasal Endoscopy",
      scheduledAt: new Date(dayAfter.setHours(11, 30, 0, 0)),
      status: "pending",
      source: "public",
      notes: "Laryngoscopy + biopsy of right vocal cord leukoplakia.",
    },
    {
      patientName: "Ayanda Ngcobo",
      patientPhone: "+27 76 112 8834",
      patientEmail: "angcobo@bonitas.co.za",
      service: "Follow-up Visit",
      scheduledAt: new Date(day3.setHours(14, 0, 0, 0)),
      status: "pending",
      source: "public",
      notes: "Allergic rhinitis follow-up — discuss immunotherapy options.",
    },
  ];

  for (const booking of bookings) {
    await prisma.booking.create({
      data: { ...booking, practiceId },
    });
  }
  console.log("Created", bookings.length, "sample bookings");

  // =========================================================================
  // 6. Sample invoices with ENT ICD-10 codes
  // =========================================================================
  const invoicesData = [
    {
      invoiceNo: "INV-2026-ENT-001",
      patientName: "Zanele Mthembu",
      patientId: patientIds[10], // index 10 = Zanele
      lineItems: JSON.stringify([
        {
          description: "Tonsillectomy — bilateral",
          icd10Code: "J35.0",
          quantity: 1,
          unitPrice: 12500,
          total: 12500,
        },
        {
          description: "General anaesthesia (facility fee)",
          icd10Code: "J35.0",
          quantity: 1,
          unitPrice: 4800,
          total: 4800,
        },
      ]),
      subtotal: 17300,
      tax: 0, // medical procedures VAT exempt in SA
      total: 17300,
      amountPaid: 0,
      balance: 17300,
      medicalAidClaim: 15200,
      patientPortion: 2100,
      claimStatus: "submitted",
      claimReference: "MOM-CLM-2026-44521",
      status: "sent",
      dueDate: new Date("2026-04-14"),
      notes: "Tonsillectomy under GA — Netcare Park Lane Hospital theatre. ICD-10: J35.0 (Chronic tonsillitis).",
    },
    {
      invoiceNo: "INV-2026-ENT-002",
      patientName: "Pieter Botha",
      patientId: patientIds[5], // index 5 = Pieter
      lineItems: JSON.stringify([
        {
          description: "Functional Endoscopic Sinus Surgery (FESS) — bilateral",
          icd10Code: "J32.0",
          quantity: 1,
          unitPrice: 18000,
          total: 18000,
        },
        {
          description: "CT sinuses — pre-operative",
          icd10Code: "J32.0",
          quantity: 1,
          unitPrice: 3200,
          total: 3200,
        },
        {
          description: "General anaesthesia (facility fee)",
          icd10Code: "J32.0",
          quantity: 1,
          unitPrice: 4800,
          total: 4800,
        },
      ]),
      subtotal: 26000,
      tax: 0,
      total: 26000,
      amountPaid: 26000,
      balance: 0,
      medicalAidClaim: 22800,
      patientPortion: 3200,
      claimStatus: "paid",
      claimReference: "DH-CLM-2026-88213",
      status: "paid",
      dueDate: new Date("2026-03-30"),
      paidAt: new Date("2026-03-10"),
      notes: "FESS bilateral for chronic maxillary sinusitis — Netcare Park Lane Hospital. ICD-10: J32.0.",
    },
    {
      invoiceNo: "INV-2026-ENT-003",
      patientName: "Naledi Mahlangu",
      patientId: patientIds[4], // index 4 = Naledi
      lineItems: JSON.stringify([
        {
          description: "Bilateral grommet insertion (myringotomy + ventilation tubes)",
          icd10Code: "H66.9",
          quantity: 1,
          unitPrice: 8500,
          total: 8500,
        },
        {
          description: "General anaesthesia — paediatric (facility fee)",
          icd10Code: "H66.9",
          quantity: 1,
          unitPrice: 3800,
          total: 3800,
        },
      ]),
      subtotal: 12300,
      tax: 0,
      total: 12300,
      amountPaid: 0,
      balance: 12300,
      medicalAidClaim: 10500,
      patientPortion: 1800,
      claimStatus: "pending",
      claimReference: "",
      status: "draft",
      dueDate: new Date("2026-04-15"),
      notes: "Pending — grommet insertion for recurrent otitis media. ICD-10: H66.9. Pre-authorisation required from Medihelp.",
    },
  ];

  for (const inv of invoicesData) {
    await prisma.invoice.create({
      data: { ...inv, practiceId },
    });
  }
  console.log("Created", invoicesData.length, "ENT invoices with ICD-10 codes");

  // =========================================================================
  // Summary
  // =========================================================================
  console.log("\n=== SEED COMPLETE ===");
  console.log("Practice:", "Joburg ENT — Dr. Mogau Lamola");
  console.log("Practice ID:", practiceId);
  console.log("Booking services:", bookingServices.length);
  console.log("Daily tasks:", dailyTasks.length);
  console.log("Patients:", patientIds.length);
  console.log("Consent records:", patients.length);
  console.log("Bookings:", bookings.length);
  console.log("Invoices:", invoicesData.length);
  console.log("\nICD-10 codes used:");
  console.log("  J35.0 — Chronic tonsillitis (tonsillectomy)");
  console.log("  J32.0 — Chronic maxillary sinusitis (FESS)");
  console.log("  H66.9 — Otitis media, unspecified (grommet insertion)");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
