import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // ─── Demo User ───
  const passwordHash = await bcrypt.hash("demo1234", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@smiledental.co.za" },
    update: {},
    create: {
      email: "demo@smiledental.co.za",
      name: "Dr. Sarah Mitchell",
      passwordHash,
      role: "admin",
    },
  });

  // ─── Practice (with branding) ───
  let practice = await prisma.practice.findFirst({ where: { users: { some: { id: user.id } } } });
  if (!practice) {
    practice = await prisma.practice.create({
      data: {
        name: "Smile Dental — Sandton",
        type: "dental",
        address: "45 Rivonia Rd, Sandton, 2196",
        phone: "+27 11 783 4500",
        hours: "Mon-Fri 8:00-17:00, Sat 8:00-13:00",
        aiPersonality: "friendly",
        primaryColor: "#059669",
        tagline: "Your smile, our passion",
        plan: "professional",
        planStatus: "active",
      },
    });
    await prisma.user.update({ where: { id: user.id }, data: { practiceId: practice.id } });
  }

  // ─── Second staff member (receptionist) ───
  const receptionistHash = await bcrypt.hash("demo1234", 10);
  await prisma.user.upsert({
    where: { email: "reception@smiledental.co.za" },
    update: {},
    create: {
      email: "reception@smiledental.co.za",
      name: "Naledi Moloi",
      passwordHash: receptionistHash,
      role: "receptionist",
      practiceId: practice.id,
    },
  });

  // ─── Patients ───
  const patientsData = [
    { name: "Maria Santos", phone: "+27 82 345 6789", email: "maria@email.com", dateOfBirth: new Date("1988-03-15"), gender: "female", bloodType: "O+", medicalAid: "Discovery Health" },
    { name: "James Khumalo", phone: "+27 83 456 7890", email: "james@email.com", dateOfBirth: new Date("1975-07-22"), gender: "male", bloodType: "A+", medicalAid: "Bonitas" },
    { name: "Thandi Mokoena", phone: "+27 84 567 8901", email: "thandi@email.com", dateOfBirth: new Date("1992-11-08"), gender: "female", bloodType: "B+", medicalAid: "Momentum Health" },
    { name: "David Robinson", phone: "+27 85 678 9012", email: "david@email.com", dateOfBirth: new Date("1983-01-30"), gender: "male", bloodType: "AB+", medicalAid: "Fedhealth" },
    { name: "Lerato Phiri", phone: "+27 86 789 0123", email: "lerato@email.com", dateOfBirth: new Date("1995-06-12"), gender: "female", medicalAid: "Discovery Health" },
    { name: "Sipho Ndlovu", phone: "+27 87 234 5678", email: "sipho@email.com", dateOfBirth: new Date("1970-09-05"), gender: "male", bloodType: "O-", medicalAid: "GEMS" },
    { name: "Zanele Dlamini", phone: "+27 88 345 6789", email: "zanele@email.com", dateOfBirth: new Date("2001-04-18"), gender: "female", medicalAid: "Medihelp" },
    { name: "Peter van der Merwe", phone: "+27 82 111 2233", email: "peter@email.com", dateOfBirth: new Date("1965-12-01"), gender: "male", bloodType: "A-", medicalAid: "Discovery Health" },
  ];

  const patients = [];
  for (const p of patientsData) {
    const patient = await prisma.patient.create({
      data: {
        ...p,
        practiceId: practice.id,
        lastVisit: new Date(Date.now() - Math.random() * 60 * 86400000),
      },
    });
    patients.push(patient);
  }

  // ─── Allergies ───
  await prisma.allergy.createMany({
    data: [
      { patientId: patients[0].id, name: "Penicillin", severity: "severe", reaction: "Anaphylaxis risk — use alternative antibiotics" },
      { patientId: patients[0].id, name: "Latex", severity: "moderate", reaction: "Contact dermatitis — use nitrile gloves" },
      { patientId: patients[3].id, name: "Lidocaine", severity: "mild", reaction: "Mild numbness reaction — use articaine" },
      { patientId: patients[5].id, name: "Aspirin", severity: "moderate", reaction: "GI bleeding — cross-reactivity with NSAIDs" },
    ],
  });

  // ─── Medications ───
  await prisma.medication.createMany({
    data: [
      { patientId: patients[5].id, name: "Metformin", dosage: "500mg", frequency: "Twice daily", prescriber: "Dr. Nkosi (GP)", active: true },
      { patientId: patients[5].id, name: "Enalapril", dosage: "10mg", frequency: "Once daily", prescriber: "Dr. Nkosi (GP)", active: true },
      { patientId: patients[7].id, name: "Warfarin", dosage: "5mg", frequency: "Once daily", prescriber: "Dr. Botha (Cardiology)", active: true },
      { patientId: patients[1].id, name: "Amoxicillin", dosage: "500mg", frequency: "3x daily for 7 days", prescriber: "Dr. Mitchell", active: false },
    ],
  });

  // ─── Medical Records ───
  await prisma.medicalRecord.createMany({
    data: [
      { patientId: patients[0].id, type: "consultation", title: "Routine Check-up", diagnosis: "Mild gingivitis — lower anterior", treatment: "Scale and polish, oral hygiene instruction", provider: "Dr. Mitchell", date: new Date(Date.now() - 30 * 86400000) },
      { patientId: patients[1].id, type: "procedure", title: "Composite Filling #36", diagnosis: "Class II caries, distal surface", treatment: "Local anaesthesia, composite restoration", provider: "Dr. Mitchell", date: new Date(Date.now() - 14 * 86400000) },
      { patientId: patients[2].id, type: "consultation", title: "Whitening Consultation", diagnosis: "Extrinsic staining — tea/coffee", treatment: "Recommended in-office whitening, provided dietary advice", provider: "Dr. Mitchell", date: new Date(Date.now() - 7 * 86400000) },
      { patientId: patients[5].id, type: "consultation", title: "Diabetic Oral Assessment", diagnosis: "Periodontal disease stage II — diabetes-related", treatment: "Deep cleaning scheduled, HbA1c review requested", provider: "Dr. Mitchell", date: new Date(Date.now() - 21 * 86400000) },
      { patientId: patients[7].id, type: "lab", title: "Panoramic X-ray", diagnosis: "Impacted wisdom tooth #48, no pathology", treatment: "Monitor, surgical extraction if symptomatic", provider: "Dr. Mitchell", date: new Date(Date.now() - 45 * 86400000) },
    ],
  });

  // ─── Vitals ───
  await prisma.vitals.createMany({
    data: [
      { patientId: patients[5].id, bloodPressureSys: 148, bloodPressureDia: 92, heartRate: 78, temperature: 36.6, weight: 94, bloodGlucose: 8.2, painLevel: 0 },
      { patientId: patients[7].id, bloodPressureSys: 132, bloodPressureDia: 84, heartRate: 72, temperature: 36.4, weight: 82, painLevel: 0 },
      { patientId: patients[4].id, bloodPressureSys: 118, bloodPressureDia: 76, heartRate: 88, temperature: 37.1, painLevel: 7 },
    ],
  });

  // ─── Conversations ───
  const convoData = [
    {
      patientIdx: 0,
      messages: [
        { role: "patient", content: "Hi, I'd like to reschedule my cleaning appointment from Thursday to next week." },
        { role: "practice", content: "Hi Maria! Of course, we can reschedule. Would Monday or Wednesday next week work for you? We have slots at 9:00 and 14:00 on both days." },
        { role: "patient", content: "Wednesday at 14:00 would be perfect, thank you!" },
      ],
    },
    {
      patientIdx: 1,
      messages: [
        { role: "patient", content: "What are your prices for teeth whitening?" },
        { role: "ai_suggestion", content: "Hi James! Great question. Our teeth whitening treatments start from R2,500 for in-office whitening, which gives you results in about an hour. We also offer take-home kits from R1,200. Would you like to book a consultation to discuss which option would work best for you?" },
      ],
    },
    {
      patientIdx: 4,
      messages: [
        { role: "patient", content: "I need an emergency appointment please. I have severe pain in my back tooth." },
        { role: "ai_suggestion", content: "Hi Lerato, I'm sorry to hear you're in pain. We always prioritise emergency cases. Can you come in today? We have an opening at 15:30. If the pain is severe, please take an anti-inflammatory in the meantime. If it worsens, please call us directly at +27 11 783 4500." },
      ],
    },
    {
      patientIdx: 6,
      messages: [
        { role: "patient", content: "Hi! I'm new to the area. Do you accept Medihelp?" },
        { role: "practice", content: "Welcome Zanele! Yes, we do accept Medihelp. We're a preferred provider so your benefits cover most routine treatments. Would you like to book a first visit?" },
        { role: "patient", content: "Yes please! What's available this week?" },
        { role: "ai_suggestion", content: "Great news! We have availability on Thursday at 10:00 or Friday at 14:30. Your first visit includes a comprehensive exam, X-rays if needed, and a cleaning — all covered by Medihelp. Which works better for you?" },
      ],
    },
  ];

  for (const c of convoData) {
    const conversation = await prisma.conversation.create({
      data: { patientId: patients[c.patientIdx].id, practiceId: practice.id },
    });
    for (const msg of c.messages) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: msg.role,
          content: msg.content,
          approved: msg.role !== "ai_suggestion",
        },
      });
    }
  }

  // ─── Bookings (mix of today, upcoming, past) ───
  const now = new Date();
  const today9am = new Date(now); today9am.setHours(9, 0, 0, 0);
  const today11am = new Date(now); today11am.setHours(11, 0, 0, 0);
  const today2pm = new Date(now); today2pm.setHours(14, 0, 0, 0);

  const bookingsData = [
    { patientName: "Thandi Mokoena", service: "Check-up & Clean", scheduledAt: today9am, status: "confirmed", patientPhone: "+27 84 567 8901", patientEmail: "thandi@email.com" },
    { patientName: "Maria Santos", service: "Cleaning", scheduledAt: today11am, status: "confirmed", patientPhone: "+27 82 345 6789", patientEmail: "maria@email.com" },
    { patientName: "Lerato Phiri", service: "Emergency — Toothache", scheduledAt: today2pm, status: "confirmed", patientPhone: "+27 86 789 0123", patientEmail: "lerato@email.com" },
    { patientName: "James Khumalo", service: "Whitening Consultation", scheduledAt: new Date(now.getTime() + 2 * 86400000), status: "pending", patientPhone: "+27 83 456 7890" },
    { patientName: "David Robinson", service: "Filling #36 Review", scheduledAt: new Date(now.getTime() + 3 * 86400000), status: "pending", patientPhone: "+27 85 678 9012" },
    { patientName: "Sipho Ndlovu", service: "Deep Cleaning (Perio)", scheduledAt: new Date(now.getTime() + 4 * 86400000), status: "confirmed", patientPhone: "+27 87 234 5678" },
    { patientName: "Zanele Dlamini", service: "New Patient Exam", scheduledAt: new Date(now.getTime() + 5 * 86400000), status: "pending", patientPhone: "+27 88 345 6789" },
    { patientName: "Peter van der Merwe", service: "Wisdom Tooth Consult", scheduledAt: new Date(now.getTime() + 7 * 86400000), status: "confirmed", patientPhone: "+27 82 111 2233" },
  ];

  for (const b of bookingsData) {
    await prisma.booking.create({ data: { ...b, practiceId: practice.id } });
  }

  // ─── Invoices & Payments ───
  const inv1 = await prisma.invoice.create({
    data: {
      practiceId: practice.id,
      invoiceNo: "INV-2026-001",
      patientName: "James Khumalo",
      lineItems: JSON.stringify([
        { description: "Composite Filling #36", icd10Code: "D2391", quantity: 1, unitPrice: 1850, total: 1850 },
        { description: "Local Anaesthesia", icd10Code: "D9215", quantity: 1, unitPrice: 350, total: 350 },
      ]),
      subtotal: 2200,
      tax: 0,
      total: 2200,
      balance: 0,
      amountPaid: 2200,
      status: "paid",
      claimStatus: "approved",
      claimReference: "BON-2026-0342",
    },
  });

  await prisma.payment.create({
    data: {
      invoiceId: inv1.id,
      practiceId: practice.id,
      amount: 2200,
      method: "medical_aid",
      reference: "BON-2026-0342",
      patientName: "James Khumalo",
    },
  });

  const inv2 = await prisma.invoice.create({
    data: {
      practiceId: practice.id,
      invoiceNo: "INV-2026-002",
      patientName: "Thandi Mokoena",
      lineItems: JSON.stringify([
        { description: "Consultation", icd10Code: "D0150", quantity: 1, unitPrice: 650, total: 650 },
        { description: "Scale & Polish", icd10Code: "D1110", quantity: 1, unitPrice: 1200, total: 1200 },
      ]),
      subtotal: 1850,
      tax: 0,
      total: 1850,
      balance: 550,
      amountPaid: 1300,
      status: "partial",
      claimStatus: "pending",
    },
  });

  await prisma.payment.create({
    data: {
      invoiceId: inv2.id,
      practiceId: practice.id,
      amount: 1300,
      method: "card",
      reference: "YCO-4821",
      patientName: "Thandi Mokoena",
    },
  });

  await prisma.invoice.create({
    data: {
      practiceId: practice.id,
      invoiceNo: "INV-2026-003",
      patientName: "Sipho Ndlovu",
      lineItems: JSON.stringify([
        { description: "Periodontal Assessment", icd10Code: "D0180", quantity: 1, unitPrice: 850, total: 850 },
        { description: "Panoramic X-ray", icd10Code: "D0330", quantity: 1, unitPrice: 650, total: 650 },
      ]),
      subtotal: 1500,
      tax: 0,
      total: 1500,
      balance: 1500,
      amountPaid: 0,
      status: "sent",
      claimStatus: "submitted",
    },
  });

  // ─── Reviews ───
  const reviewsData = [
    { rating: 5, comment: "Dr. Mitchell is amazing! Painless filling and the staff were so friendly.", source: "google", authorName: "James K." },
    { rating: 5, comment: "Best dental experience I've had. Modern clinic and great communication via WhatsApp.", source: "google", authorName: "Thandi M." },
    { rating: 4, comment: "Good service overall. Waiting time was a bit long but treatment was excellent.", source: "facebook", authorName: "David R." },
    { rating: 5, comment: "Love the appointment reminders! Never miss a check-up anymore.", source: "whatsapp", authorName: "Maria S." },
    { rating: 5, comment: "The AI chatbot answered my questions instantly at 10pm. Booked my appointment right there.", source: "google", authorName: "Zanele D." },
    { rating: 4, comment: "Very professional practice. My kids actually enjoy going to the dentist now.", source: "in-person", authorName: "Peter vdM." },
  ];

  for (const r of reviewsData) {
    await prisma.review.create({ data: { ...r, practiceId: practice.id } });
  }

  // ─── Recall Items ───
  const recallData = [
    { patientName: "Maria Santos", reason: "6-month check-up", dueDate: new Date(now.getTime() + 7 * 86400000), phone: "+27 82 345 6789" },
    { patientName: "David Robinson", reason: "Follow-up: filling #36", dueDate: new Date(now.getTime() - 3 * 86400000), phone: "+27 85 678 9012" },
    { patientName: "Thandi Mokoena", reason: "Annual X-rays due", dueDate: new Date(now.getTime() + 14 * 86400000), phone: "+27 84 567 8901" },
    { patientName: "Peter van der Merwe", reason: "Wisdom tooth monitoring", dueDate: new Date(now.getTime() + 60 * 86400000), phone: "+27 82 111 2233" },
  ];

  for (const r of recallData) {
    await prisma.recallItem.create({ data: { ...r, practiceId: practice.id } });
  }

  // ─── Daily Tasks ───
  await prisma.dailyTask.createMany({
    data: [
      { practiceId: practice.id, title: "Review today's appointment list", category: "morning", completed: true },
      { practiceId: practice.id, title: "Check sterilisation log", category: "morning", completed: true },
      { practiceId: practice.id, title: "Confirm tomorrow's appointments", category: "morning", completed: false },
      { practiceId: practice.id, title: "Process medical aid claims", category: "during", completed: false },
      { practiceId: practice.id, title: "Follow up on overdue recall patients", category: "during", completed: false },
      { practiceId: practice.id, title: "Review and approve AI message suggestions", category: "during", completed: false },
      { practiceId: practice.id, title: "Cash up and reconcile payments", category: "end", completed: false },
      { practiceId: practice.id, title: "Backup patient records", category: "end", completed: false },
    ],
  });

  // ─── Consent Records (POPIA) ───
  for (const patient of patients.slice(0, 5)) {
    await prisma.consentRecord.create({
      data: {
        patientName: patient.name,
        patientId: patient.id,
        practiceId: practice.id,
        consentType: "treatment",
        granted: true,
        notes: "Consent for dental examination and treatment",
      },
    });
    await prisma.consentRecord.create({
      data: {
        patientName: patient.name,
        patientId: patient.id,
        practiceId: practice.id,
        consentType: "data_processing",
        granted: true,
        notes: "Consent for processing personal and health data under POPIA",
      },
    });
  }

  // ─── Audit Log entries ───
  await prisma.auditLog.createMany({
    data: [
      { practiceId: practice.id, userId: user.id, action: "patient.create", details: "Created patient: Maria Santos" },
      { practiceId: practice.id, userId: user.id, action: "booking.confirm", details: "Confirmed booking for Thandi Mokoena" },
      { practiceId: practice.id, userId: user.id, action: "invoice.create", details: "Created invoice #INV-001 for James Khumalo — R2,200" },
      { practiceId: practice.id, userId: user.id, action: "payment.record", details: "Recorded payment R2,200 via medical aid for James Khumalo" },
      { practiceId: practice.id, userId: user.id, action: "ai.triage", details: "AI triaged emergency for Lerato Phiri — URGENT" },
    ],
  });

  // ─── Credit Ledger (Professional plan — R3,000 monthly) ───
  const creditNow = new Date();
  const creditDay = 86400000;

  // Opening balance
  await prisma.creditLedger.create({
    data: {
      practiceId: practice.id,
      type: "top_up",
      amount: 3000,
      balance: 3000,
      description: "Professional plan — March 2026 monthly allowance",
      createdAt: new Date(creditNow.getTime() - 14 * creditDay),
    },
  });

  // Sample usage entries
  const creditUsage = [
    { type: "ai_agent", amount: -2.0, balance: 2998, description: "AI triage — Maria Santos toothache assessment", reference: "conv-001", daysAgo: 12 },
    { type: "whatsapp", amount: -0.75, balance: 2997.25, description: "WhatsApp reminder — Thabo Mokoena appointment", reference: "notif-001", daysAgo: 10 },
    { type: "sms", amount: -0.5, balance: 2996.75, description: "SMS recall — Lerato Dlamini 6-month check-up", reference: "recall-001", daysAgo: 8 },
    { type: "ai_agent", amount: -2.0, balance: 2994.75, description: "AI follow-up — Sipho Ndlovu post-extraction care", reference: "conv-002", daysAgo: 5 },
    { type: "email", amount: -0.1, balance: 2994.65, description: "Email invoice — Naledi Khumalo INV-2026-004", reference: "inv-004", daysAgo: 3 },
    { type: "api_call", amount: -0.25, balance: 2994.4, description: "External API call — booking sync", reference: "api-001", daysAgo: 1 },
  ];

  for (const entry of creditUsage) {
    await prisma.creditLedger.create({
      data: {
        practiceId: practice.id,
        type: entry.type,
        amount: entry.amount,
        balance: entry.balance,
        description: entry.description,
        reference: entry.reference,
        createdAt: new Date(creditNow.getTime() - entry.daysAgo * creditDay),
      },
    });
  }

  console.log("Seed complete!");
  console.log("─────────────────────────────────────");
  console.log("Demo login:  demo@smiledental.co.za / demo1234");
  console.log("Receptionist: reception@smiledental.co.za / demo1234");
  console.log("Practice:    Smile Dental — Sandton");
  console.log("Patients:    8 | Bookings: 8 | Invoices: 3");
  console.log("Credits:     R2,994.40 balance (Professional plan)");
  console.log("─────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
