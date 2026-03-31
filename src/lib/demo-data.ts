// Demo data for Vercel deployment (no persistent SQLite in serverless)
// Used when DEMO_MODE=true or DB is unavailable

const now = new Date();
const day = 86400000;

export const demoPractice = {
  id: "demo-practice",
  name: "Netcare Primary Healthcare",
  type: "primary_care_network",
  address: "76 Maude Street, Sandton, 2196, Gauteng",
  phone: "+27 11 301 0000",
  hours: "Mon-Fri 7:00-18:00, Sat 8:00-13:00",
  aiPersonality: "professional",
  // White-label branding — Netcare
  logoUrl: "/images/netcare-logo.png",
  primaryColor: "#1D3443",
  secondaryColor: "#3DA9D1",
  subdomain: "netcare-primarycare",
  tagline: "88 clinics. One command center.",
  // Subscription
  plan: "enterprise",
  planStatus: "active",
  trialEndsAt: null,
  paystackSubId: "",
  paystackCustId: "",
  // Booking page settings
  bookingEnabled: true,
  bookingRequiresApproval: false,
  bookingDepositEnabled: false,
  bookingDepositAmount: 0,
  bookingServices: JSON.stringify([
    { name: "GP Consultation", duration: 20, price: 650 },
    { name: "Follow-up Visit", duration: 15, price: 450 },
    { name: "Chronic Disease Management", duration: 30, price: 850 },
    { name: "Occupational Health Assessment", duration: 45, price: 1200 },
    { name: "Executive Wellness Screen", duration: 60, price: 3500 },
    { name: "Dental — General Check-up", duration: 30, price: 550 },
    { name: "Virtual Consultation", duration: 20, price: 500 },
  ]),
  bookingWelcomeMsg: "Welcome to Netcare Primary Healthcare. As South Africa's largest private primary care network (88 Medicross clinics, 37 pharmacies), we offer comprehensive GP, dental, pharmacy, and occupational health services.",
  bookingConfirmMsg: "Your Netcare Medicross appointment has been confirmed. Please bring your medical aid card and ID.",
  googlePlaceId: "",
  // Netcare real tech stack (from research)
  integrations: JSON.stringify({
    hospital_emr: "CareOn EMR (34,000+ users, 7 provinces, International Quality Award winner)",
    clinic_pms: "Healthbridge / GoodX (varied across 568 practitioners — key integration gap)",
    claims_switch: "Altron SwitchOn + MediSwitch EDI (eRA processing, ICD-10-ZA, NAPPI)",
    drug_safety: "IBM Watson Health Micromedex (eliminates 60% potential medication errors)",
    icu_prediction: "Early Clinical Deterioration Algorithm (live across all Netcare ICUs from May 2025)",
    erp: "Group ERP (integrated with CMS regulatory reporting)",
  }),
  createdAt: new Date(now.getTime() - 30 * day),
};

export const demoUser = {
  id: "demo-user",
  name: "Demo User",
  email: "demo@netcare.co.za",
  role: "admin",
  practice: demoPractice,
};

export const demoUsers: Record<string, { id: string; name: string; email: string; role: string; practice: typeof demoPractice }> = {
  "thirushen.pillay@netcare.co.za": {
    id: "demo-user-thirushen",
    name: "Thirushen Pillay",
    email: "thirushen.pillay@netcare.co.za",
    role: "platform_admin",
    practice: demoPractice,
  },
  "sara.nayager@netcare.co.za": {
    id: "demo-user-sara",
    name: "Sara Nayager",
    email: "sara.nayager@netcare.co.za",
    role: "platform_admin",
    practice: demoPractice,
  },
  "chris.mathew@netcare.co.za": {
    id: "demo-user-chris",
    name: "Dr Chris Mathew",
    email: "chris.mathew@netcare.co.za",
    role: "admin",
    practice: demoPractice,
  },
  "demo@netcare.co.za": {
    id: "demo-user-generic",
    name: "Demo User",
    email: "demo@netcare.co.za",
    role: "admin",
    practice: demoPractice,
  },
  // === Netcare Stakeholder Accounts (25 March 2026 meeting follow-up) ===
  "drrahul.gathiram@medicross.co.za": {
    id: "demo-user-rahul",
    name: "Dr Rahul Gathiram",
    email: "drrahul.gathiram@medicross.co.za",
    role: "platform_admin",
    practice: demoPractice,
  },
  "cathelijn.zeijlemaker@netcare.co.za": {
    id: "demo-user-cathelijn",
    name: "Dr Cathelijn Zeijlemaker",
    email: "cathelijn.zeijlemaker@netcare.co.za",
    role: "admin",
    practice: demoPractice,
  },
  "muhammad_simjee@a2d24.com": {
    id: "demo-user-simjee",
    name: "Muhammad Simjee",
    email: "muhammad_simjee@a2d24.com",
    role: "admin",
    practice: demoPractice,
  },
  // === Additional stakeholders (follow-up meeting April 1, 2026) ===
  "travis.dewing@netcare.co.za": {
    id: "demo-user-travis",
    name: "Travis Dewing",
    email: "travis.dewing@netcare.co.za",
    role: "platform_admin",
    practice: demoPractice,
  },
  "gurshen@netcare.co.za": {
    id: "demo-user-gurshen",
    name: "Gurshen",
    email: "gurshen@netcare.co.za",
    role: "admin",
    practice: demoPractice,
  },
  "matsie.mpshane@netcare.co.za": {
    id: "demo-user-matsie",
    name: "Matsie Mpshane",
    email: "matsie.mpshane@netcare.co.za",
    role: "platform_admin",
    practice: demoPractice,
  },
};

export const demoPlatformAdmin = {
  id: "platform-admin",
  name: "Sara Nayager",
  email: "sara.nayager@netcare.co.za",
  role: "platform_admin",
  practice: demoPractice,
};

// All Medicross clinics across the Netcare Primary Healthcare network
export const demoPractices = [
  demoPractice,
  {
    id: "prac-2", name: "Medicross Sandton City", type: "medicross_gp",
    address: "Sandton City Mall, Rivonia Rd, Sandton, 2196", phone: "+27 11 784 2100",
    hours: "Mon-Fri 7:00-18:00, Sat 8:00-13:00", aiPersonality: "professional",
    logoUrl: "/images/medicross-logo.svg", primaryColor: "#1D3443", secondaryColor: "#3DA9D1",
    subdomain: "medicross-sandton", tagline: "Medicross Sandton City — GP & Dental",
    plan: "enterprise", planStatus: "active", trialEndsAt: null,
    paystackSubId: "", paystackCustId: "",
    createdAt: new Date(now.getTime() - 365 * day),
    _stats: { patients: 4250, bookingsThisMonth: 1890, revenue: 2450000, mrr: 0 },
  },
  {
    id: "prac-3", name: "Medicross Fourways", type: "medicross_gp",
    address: "Fourways Crossing, William Nicol Dr, Fourways, 2191", phone: "+27 11 465 3300",
    hours: "Mon-Fri 7:00-18:00, Sat 8:00-14:00", aiPersonality: "professional",
    logoUrl: "/images/medicross-logo.svg", primaryColor: "#1D3443", secondaryColor: "#3DA9D1",
    subdomain: "medicross-fourways", tagline: "Medicross Fourways — GP, Dental & Pharmacy",
    plan: "enterprise", planStatus: "active", trialEndsAt: null,
    paystackSubId: "", paystackCustId: "",
    createdAt: new Date(now.getTime() - 365 * day),
    _stats: { patients: 3890, bookingsThisMonth: 1650, revenue: 1980000, mrr: 0 },
  },
  {
    id: "prac-4", name: "Medicross Pretoria East", type: "medicross_gp",
    address: "Atterbury Value Mart, Pretoria East, 0081", phone: "+27 12 991 4200",
    hours: "Mon-Fri 7:00-18:00, Sat 8:00-13:00", aiPersonality: "professional",
    logoUrl: "/images/medicross-logo.svg", primaryColor: "#1D3443", secondaryColor: "#3DA9D1",
    subdomain: "medicross-pta-east", tagline: "Medicross Pretoria East — Full Service",
    plan: "enterprise", planStatus: "active", trialEndsAt: null,
    paystackSubId: "", paystackCustId: "",
    createdAt: new Date(now.getTime() - 365 * day),
    _stats: { patients: 3120, bookingsThisMonth: 1340, revenue: 1640000, mrr: 0 },
  },
  {
    id: "prac-5", name: "Medicross Rosebank", type: "medicross_dental",
    address: "The Zone, Rosebank, 2196", phone: "+27 11 880 5500",
    hours: "Mon-Fri 8:00-17:00, Sat 8:00-13:00", aiPersonality: "professional",
    logoUrl: "/images/medicross-logo.svg", primaryColor: "#1D3443", secondaryColor: "#E3964C",
    subdomain: "medicross-rosebank", tagline: "Medicross Rosebank — Dental Centre",
    plan: "enterprise", planStatus: "active", trialEndsAt: null,
    paystackSubId: "", paystackCustId: "",
    createdAt: new Date(now.getTime() - 365 * day),
    _stats: { patients: 2340, bookingsThisMonth: 980, revenue: 1420000, mrr: 0 },
  },
  {
    id: "prac-6", name: "Prime Cure Occupational Health", type: "occupational_health",
    address: "76 Maude St, Sandton, 2196", phone: "+27 11 301 0088",
    hours: "Mon-Fri 6:00-17:00", aiPersonality: "professional",
    logoUrl: "", primaryColor: "#1D3443", secondaryColor: "#E3964C",
    subdomain: "primecure-occ", tagline: "Prime Cure — Occupational Health Services",
    plan: "enterprise", planStatus: "active", trialEndsAt: null,
    paystackSubId: "", paystackCustId: "",
    createdAt: new Date(now.getTime() - 365 * day),
    _stats: { patients: 8900, bookingsThisMonth: 2100, revenue: 3200000, mrr: 0 },
  },
  {
    id: "prac-7", name: "Medicross Soweto", type: "medicross_gp",
    address: "Maponya Mall, Chris Hani Rd, Soweto, 1818", phone: "+27 11 938 2200",
    hours: "Mon-Fri 7:30-17:00, Sat 8:00-12:00", aiPersonality: "empathetic",
    logoUrl: "/images/medicross-logo.svg", primaryColor: "#1D3443", secondaryColor: "#3DA9D1",
    subdomain: "medicross-soweto", tagline: "Medicross Soweto — Community Healthcare",
    plan: "enterprise", planStatus: "active", trialEndsAt: null,
    paystackSubId: "", paystackCustId: "",
    createdAt: new Date(now.getTime() - 365 * day),
    _stats: { patients: 5670, bookingsThisMonth: 2890, revenue: 1890000, mrr: 0 },
  },
  {
    id: "prac-8", name: "Medicross Cape Town CBD", type: "medicross_gp",
    address: "Adderley St, Cape Town, 8001", phone: "+27 21 421 3300",
    hours: "Mon-Fri 7:00-18:00, Sat 8:00-13:00", aiPersonality: "professional",
    logoUrl: "/images/medicross-logo.svg", primaryColor: "#1D3443", secondaryColor: "#3DA9D1",
    subdomain: "medicross-cpt-cbd", tagline: "Medicross Cape Town CBD",
    plan: "enterprise", planStatus: "active", trialEndsAt: null,
    paystackSubId: "", paystackCustId: "",
    createdAt: new Date(now.getTime() - 365 * day),
    _stats: { patients: 4100, bookingsThisMonth: 1720, revenue: 2100000, mrr: 0 },
  },
];

export const demoPatients = [
  {
    id: "p1", name: "Thandi Mkhize", phone: "+27 82 445 3312", email: "tmkhize@discovery.co.za",
    dateOfBirth: "1985-04-22", gender: "female", idNumber: "8504220123089", address: "14 Sandton Dr, Sandton",
    medicalAid: "Discovery Health", medicalAidNo: "DH-7823445", bloodType: "O+",
    emergencyName: "Sipho Mkhize", emergencyPhone: "+27 82 999 1111",
    notes: "Chronic diabetes management. Medicross Sandton. Monthly HbA1c. Metformin 1000mg BD + Jardiance 25mg OD.", status: "active",
    lastVisit: new Date(now.getTime() - 14 * day).toISOString(), practiceId: "demo-practice",
    createdAt: new Date(now.getTime() - 180 * day).toISOString(),
    updatedAt: new Date(now.getTime() - 14 * day).toISOString(),
  },
  {
    id: "p2", name: "Johan van Wyk", phone: "+27 83 221 5567", email: "jvanwyk@gems.gov.za",
    dateOfBirth: "1972-08-15", gender: "male", idNumber: "7208150098087", address: "88 Rivonia Blvd, Sandton",
    medicalAid: "GEMS", medicalAidNo: "GEMS-445521", bloodType: "A+",
    emergencyName: "Annemarie van Wyk", emergencyPhone: "+27 83 888 2222",
    notes: "Hypertension. Medicross Sandton. BP controlled on Amlodipine 10mg + Perindopril 8mg. 6-monthly bloods.", status: "active",
    lastVisit: new Date(now.getTime() - 30 * day).toISOString(), practiceId: "demo-practice",
    createdAt: new Date(now.getTime() - 120 * day).toISOString(),
    updatedAt: new Date(now.getTime() - 30 * day).toISOString(),
  },
  {
    id: "p3", name: "Priya Naidoo", phone: "+27 71 889 4456", email: "pnaidoo@bonitas.co.za",
    dateOfBirth: "1990-01-30", gender: "female", idNumber: "9001300234082", address: "22 Fourways Blvd, Fourways",
    medicalAid: "Bonitas", medicalAidNo: "BON-998234", bloodType: "B+",
    emergencyName: "Ravi Naidoo", emergencyPhone: "+27 71 777 3333",
    notes: "Medicross Fourways. Pregnancy — 28 weeks. High-risk: gestational diabetes. Netcare antenatal programme.", status: "active",
    lastVisit: new Date(now.getTime() - 7 * day).toISOString(), practiceId: "demo-practice",
    createdAt: new Date(now.getTime() - 365 * day).toISOString(),
    updatedAt: new Date(now.getTime() - 7 * day).toISOString(),
  },
  {
    id: "p4", name: "David Moloi", phone: "+27 76 334 8821", email: "dmoloi@momentum.co.za",
    dateOfBirth: "1968-11-03", gender: "male", idNumber: "6811030055088", address: "10 William Nicol Dr, Fourways",
    medicalAid: "Momentum Health", medicalAidNo: "MOM-223456", bloodType: "AB-",
    emergencyName: "Grace Moloi", emergencyPhone: "+27 76 666 4444",
    notes: "Medicross Fourways. Executive wellness screen — annual. CEO, logistics co. Full bloods, ECG, PSA.", status: "active",
    lastVisit: new Date(now.getTime() - 7 * day).toISOString(), practiceId: "demo-practice",
    createdAt: new Date(now.getTime() - 90 * day).toISOString(),
    updatedAt: new Date(now.getTime() - 7 * day).toISOString(),
  },
  {
    id: "p5", name: "Sipho Dlamini", phone: "+27 72 556 7743", email: "sdlamini@angloamerican.com",
    dateOfBirth: "1988-09-25", gender: "male", idNumber: "8809250188083", address: "45 Main Reef Rd, Boksburg",
    medicalAid: "Anglo Medical Scheme", medicalAidNo: "AMS-112455", bloodType: "O-",
    emergencyName: "Nomsa Dlamini", emergencyPhone: "+27 72 555 5555",
    notes: "Prime Cure — Anglo American occ health contract. Annual surveillance. Noise exposure. Audiogram + spirometry.", status: "active",
    lastVisit: new Date(now.getTime() - 3 * day).toISOString(), practiceId: "demo-practice",
    createdAt: new Date(now.getTime() - 200 * day).toISOString(),
    updatedAt: new Date(now.getTime() - 3 * day).toISOString(),
  },
];

// Allergies per patient
const _demoAllergies = [
  { id: "al1", name: "Penicillin", severity: "severe", reaction: "Anaphylaxis", patientId: "p1", createdAt: new Date(now.getTime() - 180 * day).toISOString() },
  { id: "al2", name: "Latex", severity: "moderate", reaction: "Contact dermatitis", patientId: "p1", createdAt: new Date(now.getTime() - 180 * day).toISOString() },
  { id: "al3", name: "Ibuprofen", severity: "mild", reaction: "Stomach upset", patientId: "p2", createdAt: new Date(now.getTime() - 120 * day).toISOString() },
  { id: "al4", name: "Codeine", severity: "severe", reaction: "Respiratory distress", patientId: "p4", createdAt: new Date(now.getTime() - 90 * day).toISOString() },
  { id: "al5", name: "Sulfonamides", severity: "moderate", reaction: "Rash", patientId: "p5", createdAt: new Date(now.getTime() - 200 * day).toISOString() },
];

// Medications
const _demoMedications = [
  { id: "med1", name: "Metformin 500mg", dosage: "1 tablet", frequency: "Twice daily", prescriber: "Dr. Naidoo", startDate: new Date(now.getTime() - 365 * day).toISOString(), endDate: null, active: true, patientId: "p4", createdAt: new Date(now.getTime() - 365 * day).toISOString() },
  { id: "med2", name: "Prenatal Vitamins", dosage: "1 tablet", frequency: "Daily", prescriber: "Dr. Govender", startDate: new Date(now.getTime() - 180 * day).toISOString(), endDate: null, active: true, patientId: "p5", createdAt: new Date(now.getTime() - 180 * day).toISOString() },
  { id: "med3", name: "Amoxicillin 250mg", dosage: "1 capsule", frequency: "Three times daily", prescriber: "Dr. Govender", startDate: new Date(now.getTime() - 14 * day).toISOString(), endDate: new Date(now.getTime() - 7 * day).toISOString(), active: false, patientId: "p1", createdAt: new Date(now.getTime() - 14 * day).toISOString() },
  { id: "med4", name: "Sensodyne Toothpaste", dosage: "Pea-sized amount", frequency: "Twice daily", prescriber: "Dr. Govender", startDate: new Date(now.getTime() - 30 * day).toISOString(), endDate: null, active: true, patientId: "p2", createdAt: new Date(now.getTime() - 30 * day).toISOString() },
];

// Medical records
const _demoMedicalRecords = [
  { id: "rec1", type: "consultation", title: "Routine dental check-up", description: "Patient presented for 6-month routine check-up. No complaints.", diagnosis: "Healthy dentition", treatment: "Professional cleaning performed", provider: "Dr. Govender", patientId: "p1", practiceId: "demo-practice", date: new Date(now.getTime() - 14 * day).toISOString(), createdAt: new Date(now.getTime() - 14 * day).toISOString() },
  { id: "rec2", type: "procedure", title: "Composite filling — tooth #16", description: "Mesial cavity detected on X-ray. Local anaesthetic administered.", diagnosis: "Dental caries — tooth #16", treatment: "Composite restoration (Class II)", provider: "Dr. Govender", patientId: "p4", practiceId: "demo-practice", date: new Date(now.getTime() - 7 * day).toISOString(), createdAt: new Date(now.getTime() - 7 * day).toISOString() },
  { id: "rec3", type: "imaging", title: "Panoramic X-ray (OPG)", description: "Full mouth panoramic radiograph taken for routine screening.", diagnosis: "", treatment: "", provider: "Radiographer Nkosi", patientId: "p3", practiceId: "demo-practice", date: new Date(now.getTime() - 60 * day).toISOString(), createdAt: new Date(now.getTime() - 60 * day).toISOString() },
  { id: "rec4", type: "consultation", title: "Emergency — severe toothache", description: "Patient presented with acute pain in lower right molar. Periapical abscess suspected.", diagnosis: "Acute periapical abscess — tooth #46", treatment: "Antibiotics prescribed, drainage performed, root canal scheduled", provider: "Dr. Govender", patientId: "p5", practiceId: "demo-practice", date: new Date(now.getTime() - 3 * day).toISOString(), createdAt: new Date(now.getTime() - 3 * day).toISOString() },
  { id: "rec5", type: "lab_result", title: "Blood glucose — pre-procedure", description: "Fasting blood glucose test before filling procedure.", diagnosis: "Elevated glucose (8.2 mmol/L)", treatment: "Proceed with caution, GP notified", provider: "Nurse Botha", patientId: "p4", practiceId: "demo-practice", date: new Date(now.getTime() - 7 * day).toISOString(), createdAt: new Date(now.getTime() - 7 * day).toISOString() },
  { id: "rec6", type: "referral", title: "Referral to orthodontist", description: "Patient referred for assessment of crowding in anterior teeth.", diagnosis: "Dental crowding — mild", treatment: "Orthodontic assessment recommended", provider: "Dr. Govender", patientId: "p2", practiceId: "demo-practice", date: new Date(now.getTime() - 30 * day).toISOString(), createdAt: new Date(now.getTime() - 30 * day).toISOString() },
];

// Vitals
const _demoVitals = [
  { id: "v1", bloodPressureSys: 118, bloodPressureDia: 76, heartRate: 72, temperature: 36.5, weight: 65, height: 168, oxygenSat: 98, bloodGlucose: null, respiratoryRate: 16, painLevel: 0, notes: "Pre-procedure vitals", recordedBy: "Nurse Botha", patientId: "p1", recordedAt: new Date(now.getTime() - 14 * day).toISOString(), createdAt: new Date(now.getTime() - 14 * day).toISOString() },
  { id: "v2", bloodPressureSys: 135, bloodPressureDia: 88, heartRate: 80, temperature: 36.7, weight: 92, height: 180, oxygenSat: 97, bloodGlucose: 8.2, respiratoryRate: 18, painLevel: 2, notes: "Elevated BP — monitor", recordedBy: "Nurse Botha", patientId: "p4", recordedAt: new Date(now.getTime() - 7 * day).toISOString(), createdAt: new Date(now.getTime() - 7 * day).toISOString() },
  { id: "v3", bloodPressureSys: 110, bloodPressureDia: 70, heartRate: 88, temperature: 37.1, weight: 72, height: 162, oxygenSat: 99, bloodGlucose: null, respiratoryRate: 18, painLevel: 7, notes: "In pain from abscess", recordedBy: "Nurse Botha", patientId: "p5", recordedAt: new Date(now.getTime() - 3 * day).toISOString(), createdAt: new Date(now.getTime() - 3 * day).toISOString() },
  { id: "v4", bloodPressureSys: 122, bloodPressureDia: 78, heartRate: 68, temperature: 36.4, weight: 78, height: 175, oxygenSat: 98, bloodGlucose: null, respiratoryRate: 14, painLevel: 0, notes: "", recordedBy: "Nurse Botha", patientId: "p2", recordedAt: new Date(now.getTime() - 30 * day).toISOString(), createdAt: new Date(now.getTime() - 30 * day).toISOString() },
];

export const demoConversations = [
  {
    id: "c1",
    patientId: "p1",
    patient: demoPatients[0],
    practiceId: "demo-practice",
    status: "active",
    createdAt: new Date(now.getTime() - 2 * day),
    updatedAt: new Date(now.getTime() - 120000),
    messages: [
      { id: "m1", conversationId: "c1", role: "patient", content: "Hi, I need to reschedule my chronic disease management appointment at Medicross Sandton.", approved: true, createdAt: new Date(now.getTime() - 3600000) },
      { id: "m2", conversationId: "c1", role: "practice", content: "Hi Thandi! Of course. We have availability at Medicross Sandton on Monday at 9:00 or Wednesday at 14:00. Which works for you?", approved: true, createdAt: new Date(now.getTime() - 3000000) },
      { id: "m3", conversationId: "c1", role: "patient", content: "Wednesday at 14:00 please. Will Dr Govender be available for my HbA1c review?", approved: true, createdAt: new Date(now.getTime() - 2400000) },
    ],
  },
  {
    id: "c2",
    patientId: "p2",
    patient: demoPatients[1],
    practiceId: "demo-practice",
    status: "active",
    createdAt: new Date(now.getTime() - day),
    updatedAt: new Date(now.getTime() - 480000),
    messages: [
      { id: "m4", conversationId: "c2", role: "patient", content: "I need a GP consultation near Fourways. Do you have same-day availability?", approved: true, createdAt: new Date(now.getTime() - 600000) },
      { id: "m5", conversationId: "c2", role: "ai_suggestion", content: "Hi Johan! Medicross Fourways has a GP slot today at 14:30. Consultation fee is R650 (medical aid covers most of this). Shall I book you in? Your GEMS benefits are still available.", approved: false, createdAt: new Date(now.getTime() - 540000) },
    ],
  },
  {
    id: "c3",
    patientId: "p5",
    patient: demoPatients[4],
    practiceId: "demo-practice",
    status: "active",
    createdAt: new Date(now.getTime() - 3600000),
    updatedAt: new Date(now.getTime() - 300000),
    messages: [
      { id: "m6", conversationId: "c3", role: "patient", content: "My blood pressure medication is running out. Can I get a repeat script from Medicross?", approved: true, createdAt: new Date(now.getTime() - 900000) },
      { id: "m7", conversationId: "c3", role: "ai_suggestion", content: "Hi Sipho! I can see your Amlodipine 10mg + Perindopril 8mg script is on file. The nearest Clicks pharmacy at Medicross Sandton has stock. Shall I send the repeat script there, or would you prefer a different Medicross location?", approved: false, createdAt: new Date(now.getTime() - 840000) },
    ],
  },
];

// Helper: create a date N days from now at a specific hour:minute (business hours)
function bizDate(daysOffset: number, hour: number, minute = 0): Date {
  const d = new Date(now.getTime() + daysOffset * day);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export const demoBookings = [
  { id: "b1", patientName: "Maria Santos", patientPhone: "+27 82 345 6789", patientEmail: "maria@example.com", service: "GP Consultation", scheduledAt: bizDate(2, 10, 0), status: "confirmed", source: "public", notes: "", depositAmount: 0, depositPaid: false, paymentRef: "", confirmedAt: new Date(now.getTime() - day / 2), confirmedBy: "demo-user", rejectedAt: null, rejectionReason: "", reminderSentAt: null, followupSentAt: null, checkinSentAt: null, practiceId: "demo-practice", createdAt: new Date(now.getTime() - day) },
  { id: "b2", patientName: "James Khumalo", patientPhone: "+27 83 456 7890", patientEmail: "", service: "GP Consultation", scheduledAt: bizDate(3, 14, 30), status: "pending", source: "public", notes: "", depositAmount: 200, depositPaid: false, paymentRef: "", confirmedAt: null, confirmedBy: "", rejectedAt: null, rejectionReason: "", reminderSentAt: null, followupSentAt: null, checkinSentAt: null, practiceId: "demo-practice", createdAt: new Date(now.getTime() - day) },
  { id: "b3", patientName: "Thandi Mokoena", patientPhone: "+27 84 567 8901", patientEmail: "thandi@example.com", service: "Follow-up Visit", scheduledAt: bizDate(1, 9, 0), status: "confirmed", source: "whatsapp", notes: "", depositAmount: 0, depositPaid: false, paymentRef: "", confirmedAt: new Date(now.getTime() - 2 * day), confirmedBy: "demo-user", rejectedAt: null, rejectionReason: "", reminderSentAt: null, followupSentAt: null, checkinSentAt: null, practiceId: "demo-practice", createdAt: new Date(now.getTime() - 2 * day) },
  { id: "b4", patientName: "David Robinson", patientPhone: "+27 85 678 9012", patientEmail: "", service: "Executive Wellness Screen", scheduledAt: bizDate(5, 11, 30), status: "pending", source: "phone", notes: "Nervous patient — needs extra care", depositAmount: 0, depositPaid: false, paymentRef: "", confirmedAt: null, confirmedBy: "", rejectedAt: null, rejectionReason: "", reminderSentAt: null, followupSentAt: null, checkinSentAt: null, practiceId: "demo-practice", createdAt: new Date(now.getTime() - day) },
  { id: "b5", patientName: "Lerato Phiri", patientPhone: "+27 86 789 0123", patientEmail: "lerato@example.com", service: "Urgent GP — Chest Pain", scheduledAt: bizDate(0, 15, 0), status: "confirmed", source: "dashboard", notes: "", depositAmount: 0, depositPaid: false, paymentRef: "", confirmedAt: now, confirmedBy: "demo-user", rejectedAt: null, rejectionReason: "", reminderSentAt: null, followupSentAt: null, checkinSentAt: null, practiceId: "demo-practice", createdAt: now },
  { id: "b6", patientName: "Sipho Ndlovu", patientPhone: "+27 71 234 5678", patientEmail: "", service: "Chronic Disease Review", scheduledAt: bizDate(4, 8, 30), status: "pending", source: "public", notes: "First visit", depositAmount: 100, depositPaid: false, paymentRef: "", confirmedAt: null, confirmedBy: "", rejectedAt: null, rejectionReason: "", reminderSentAt: null, followupSentAt: null, checkinSentAt: null, practiceId: "demo-practice", createdAt: new Date(now.getTime() - 3600000) },
  { id: "b7", patientName: "Naledi Mogale", patientPhone: "+27 72 345 6789", patientEmail: "naledi@email.co.za", service: "Occupational Health Assessment", scheduledAt: bizDate(6, 13, 0), status: "pending", source: "whatsapp", notes: "Referred by Dr. Patel", depositAmount: 0, depositPaid: false, paymentRef: "", confirmedAt: null, confirmedBy: "", rejectedAt: null, rejectionReason: "", reminderSentAt: null, followupSentAt: null, checkinSentAt: null, practiceId: "demo-practice", createdAt: new Date(now.getTime() - 7200000) },
];

export const demoReviews = [
  { id: "r1", rating: 5, comment: "Excellent service at Medicross Sandton. Dr Govender managed my chronic care review efficiently.", source: "google", authorName: "James K.", practiceId: "demo-practice", createdAt: new Date(now.getTime() - 3 * day) },
  { id: "r2", rating: 5, comment: "Best primary care experience I've had. Modern clinic and great communication via WhatsApp.", source: "google", authorName: "Thandi M.", practiceId: "demo-practice", createdAt: new Date(now.getTime() - 7 * day) },
  { id: "r3", rating: 4, comment: "Good service overall. Efficient service. The WhatsApp booking made it seamless..", source: "facebook", authorName: "David R.", practiceId: "demo-practice", createdAt: new Date(now.getTime() - 10 * day) },
  { id: "r4", rating: 5, comment: "The reminder system is brilliant — I never miss my chronic medication reviews now.", source: "whatsapp", authorName: "Maria S.", practiceId: "demo-practice", createdAt: new Date(now.getTime() - 14 * day) },
];

export const demoRecallItems = [
  { id: "rc1", patientName: "Maria Santos", reason: "6-month check-up", dueDate: new Date(now.getTime() + 7 * day), contacted: false, phone: "+27 82 345 6789", practiceId: "demo-practice", createdAt: new Date(now.getTime() - 5 * day) },
  { id: "rc2", patientName: "David Robinson", reason: "Follow-up: filling", dueDate: new Date(now.getTime() - 3 * day), contacted: false, phone: "+27 85 678 9012", practiceId: "demo-practice", createdAt: new Date(now.getTime() - 10 * day) },
  { id: "rc3", patientName: "Thandi Mokoena", reason: "Annual X-rays due", dueDate: new Date(now.getTime() + 14 * day), contacted: false, phone: "+27 84 567 8901", practiceId: "demo-practice", createdAt: new Date(now.getTime() - 7 * day) },
];

// === Invoices ===
const _demoInvoices = [
  {
    id: "inv1", invoiceNo: "INV-2026-001", patientName: "Maria Santos", patientId: "p1",
    lineItems: JSON.stringify([
      { description: "Professional cleaning", icd10Code: "Z01.20", quantity: 1, unitPrice: 850, total: 850 },
      { description: "Fluoride treatment", icd10Code: "Z29.3", quantity: 1, unitPrice: 350, total: 350 },
    ]),
    subtotal: 1200, tax: 180, discount: 0, total: 1380, amountPaid: 1380, balance: 0,
    medicalAidClaim: 1000, patientPortion: 380, claimStatus: "paid", claimReference: "DH-CLM-44521",
    status: "paid", dueDate: new Date(now.getTime() - 7 * day).toISOString(), paidAt: new Date(now.getTime() - 10 * day).toISOString(),
    notes: "", practiceId: "demo-practice", createdAt: new Date(now.getTime() - 14 * day).toISOString(),
  },
  {
    id: "inv2", invoiceNo: "INV-2026-002", patientName: "David Robinson", patientId: "p4",
    lineItems: JSON.stringify([
      { description: "Composite filling — tooth #16", icd10Code: "K02.1", quantity: 1, unitPrice: 1500, total: 1500 },
      { description: "Local anaesthetic", icd10Code: "Z51.81", quantity: 1, unitPrice: 200, total: 200 },
      { description: "Panoramic X-ray", icd10Code: "Z01.20", quantity: 1, unitPrice: 450, total: 450 },
    ]),
    subtotal: 2150, tax: 322.50, discount: 0, total: 2472.50, amountPaid: 1800, balance: 672.50,
    medicalAidClaim: 1800, patientPortion: 672.50, claimStatus: "partial", claimReference: "MHP-CLM-11234",
    status: "partial", dueDate: new Date(now.getTime() + 14 * day).toISOString(), paidAt: null,
    notes: "Patient to pay balance on next visit", practiceId: "demo-practice", createdAt: new Date(now.getTime() - 7 * day).toISOString(),
  },
  {
    id: "inv3", invoiceNo: "INV-2026-003", patientName: "Lerato Phiri", patientId: "p5",
    lineItems: JSON.stringify([
      { description: "Emergency consultation", icd10Code: "K04.0", quantity: 1, unitPrice: 650, total: 650 },
      { description: "Periapical X-ray x2", icd10Code: "Z01.20", quantity: 2, unitPrice: 180, total: 360 },
      { description: "Abscess drainage", icd10Code: "K04.7", quantity: 1, unitPrice: 800, total: 800 },
    ]),
    subtotal: 1810, tax: 271.50, discount: 0, total: 2081.50, amountPaid: 0, balance: 2081.50,
    medicalAidClaim: 2081.50, patientPortion: 0, claimStatus: "submitted", claimReference: "",
    status: "sent", dueDate: new Date(now.getTime() + 30 * day).toISOString(), paidAt: null,
    notes: "Claim submitted to Discovery", practiceId: "demo-practice", createdAt: new Date(now.getTime() - 3 * day).toISOString(),
  },
];

// === Payments ===
const _demoPayments = [
  { id: "pay1", amount: 380, method: "card", reference: "YCO-TXN-8812", invoiceId: "inv1", patientName: "Maria Santos", notes: "Patient co-pay", practiceId: "demo-practice", createdAt: new Date(now.getTime() - 14 * day).toISOString() },
  { id: "pay2", amount: 1000, method: "medical_aid", reference: "DH-CLM-44521", invoiceId: "inv1", patientName: "Maria Santos", notes: "Discovery claim paid", practiceId: "demo-practice", createdAt: new Date(now.getTime() - 10 * day).toISOString() },
  { id: "pay3", amount: 1800, method: "medical_aid", reference: "MHP-CLM-11234", invoiceId: "inv2", patientName: "David Robinson", notes: "Medihelp partial payment", practiceId: "demo-practice", createdAt: new Date(now.getTime() - 5 * day).toISOString() },
  { id: "pay4", amount: 500, method: "cash", reference: "", invoiceId: null, patientName: "James Khumalo", notes: "Walk-in consultation (cash)", practiceId: "demo-practice", createdAt: new Date(now.getTime() - 2 * day).toISOString() },
];

// === Check-ins (today's queue) ===
const _demoCheckIns = [
  { id: "ci1", patientName: "Maria Santos", patientId: "p1", status: "checked_out", arrivedAt: new Date(now.getTime() - 3 * 3600000).toISOString(), seenAt: new Date(now.getTime() - 2.5 * 3600000).toISOString(), leftAt: new Date(now.getTime() - 2 * 3600000).toISOString(), notes: "", practiceId: "demo-practice", createdAt: new Date(now.getTime() - 3 * 3600000).toISOString() },
  { id: "ci2", patientName: "James Khumalo", patientId: "p2", status: "in_consultation", arrivedAt: new Date(now.getTime() - 1.5 * 3600000).toISOString(), seenAt: new Date(now.getTime() - 0.5 * 3600000).toISOString(), leftAt: null, notes: "Nervous — offer water", practiceId: "demo-practice", createdAt: new Date(now.getTime() - 1.5 * 3600000).toISOString() },
  { id: "ci3", patientName: "Thandi Mokoena", patientId: "p3", status: "waiting", arrivedAt: new Date(now.getTime() - 0.3 * 3600000).toISOString(), seenAt: null, leftAt: null, notes: "", practiceId: "demo-practice", createdAt: new Date(now.getTime() - 0.3 * 3600000).toISOString() },
];

// === Notifications ===
const _demoNotifications = [
  { id: "notif1", type: "whatsapp", recipient: "+27 82 345 6789", patientName: "Maria Santos", subject: "", message: "Hi Maria! Reminder: Your dental cleaning appointment is tomorrow at 14:00. Reply YES to confirm or RESCHEDULE to change. — Netcare Medicross", status: "delivered", template: "reminder_24h", practiceId: "demo-practice", sentAt: new Date(now.getTime() - day).toISOString(), createdAt: new Date(now.getTime() - day).toISOString() },
  { id: "notif2", type: "whatsapp", recipient: "+27 83 456 7890", patientName: "James Khumalo", subject: "", message: "Hi James! Reminder: Your whitening consultation is in 2 days. We look forward to seeing you! Reply YES to confirm. — Netcare Medicross", status: "delivered", template: "reminder_48h", practiceId: "demo-practice", sentAt: new Date(now.getTime() - 2 * day).toISOString(), createdAt: new Date(now.getTime() - 2 * day).toISOString() },
  { id: "notif3", type: "sms", recipient: "+27 85 678 9012", patientName: "David Robinson", subject: "", message: "Hi David, your follow-up filling appointment is overdue. Please call us at 011 783 4500 to rebook. — Netcare Medicross", status: "sent", template: "recall", practiceId: "demo-practice", sentAt: new Date(now.getTime() - 3 * day).toISOString(), createdAt: new Date(now.getTime() - 3 * day).toISOString() },
  { id: "notif4", type: "whatsapp", recipient: "+27 86 789 0123", patientName: "Lerato Phiri", subject: "", message: "Hi Lerato, how are you feeling after your procedure? If you experience any swelling or pain, please contact us immediately. — Netcare Medicross", status: "delivered", template: "followup", practiceId: "demo-practice", sentAt: new Date(now.getTime() - 2 * day).toISOString(), createdAt: new Date(now.getTime() - 2 * day).toISOString() },
];

// === POPIA Consent Records ===
const _demoConsents = [
  { id: "con1", patientName: "Maria Santos", patientId: "p1", consentType: "treatment", granted: true, method: "digital", ipAddress: "192.168.1.100", notes: "", practiceId: "demo-practice", grantedAt: new Date(now.getTime() - 180 * day).toISOString(), revokedAt: null, createdAt: new Date(now.getTime() - 180 * day).toISOString() },
  { id: "con2", patientName: "Maria Santos", patientId: "p1", consentType: "data_processing", granted: true, method: "digital", ipAddress: "192.168.1.100", notes: "POPIA consent", practiceId: "demo-practice", grantedAt: new Date(now.getTime() - 180 * day).toISOString(), revokedAt: null, createdAt: new Date(now.getTime() - 180 * day).toISOString() },
  { id: "con3", patientName: "James Khumalo", patientId: "p2", consentType: "treatment", granted: true, method: "digital", ipAddress: "192.168.1.101", notes: "", practiceId: "demo-practice", grantedAt: new Date(now.getTime() - 120 * day).toISOString(), revokedAt: null, createdAt: new Date(now.getTime() - 120 * day).toISOString() },
  { id: "con4", patientName: "James Khumalo", patientId: "p2", consentType: "marketing", granted: false, method: "digital", ipAddress: "192.168.1.101", notes: "Patient opted out of marketing", practiceId: "demo-practice", grantedAt: new Date(now.getTime() - 120 * day).toISOString(), revokedAt: new Date(now.getTime() - 120 * day).toISOString(), createdAt: new Date(now.getTime() - 120 * day).toISOString() },
  { id: "con5", patientName: "David Robinson", patientId: "p4", consentType: "treatment", granted: true, method: "paper", ipAddress: "", notes: "Signed paper form on file", practiceId: "demo-practice", grantedAt: new Date(now.getTime() - 90 * day).toISOString(), revokedAt: null, createdAt: new Date(now.getTime() - 90 * day).toISOString() },
];

// === Daily Tasks (admin checklist) ===
const todayStr = now.toISOString().split("T")[0];
const _demoDailyTasks = [
  { id: "dt1", title: "Review overnight claims rejections across 88 clinics", category: "morning", completed: true, completedBy: "AI Claims Engine", completedAt: new Date(`${todayStr}T06:30:00`).toISOString(), isRecurring: true, sortOrder: 1, practiceId: "demo-practice", date: now.toISOString(), createdAt: now.toISOString() },
  { id: "dt2", title: "Check divisional revenue dashboard — MTD vs R55M target", category: "morning", completed: true, completedBy: "Thirushen Pillay", completedAt: new Date(`${todayStr}T07:15:00`).toISOString(), isRecurring: true, sortOrder: 2, practiceId: "demo-practice", date: now.toISOString(), createdAt: now.toISOString() },
  { id: "dt3", title: "Review Prime Cure capitation utilisation reports", category: "morning", completed: true, completedBy: "Thirushen Pillay", completedAt: new Date(`${todayStr}T07:45:00`).toISOString(), isRecurring: true, sortOrder: 3, practiceId: "demo-practice", date: now.toISOString(), createdAt: now.toISOString() },
  { id: "dt4", title: "Flag high-value outstanding medical aid claims (>R5,000)", category: "morning", completed: false, completedBy: "", completedAt: null, isRecurring: true, sortOrder: 4, practiceId: "demo-practice", date: now.toISOString(), createdAt: now.toISOString() },
  { id: "dt5", title: "Process medical scheme tariff reconciliations", category: "during_day", completed: false, completedBy: "", completedAt: null, isRecurring: true, sortOrder: 5, practiceId: "demo-practice", date: now.toISOString(), createdAt: now.toISOString() },
  { id: "dt6", title: "Review ICD-10 rejection analytics — top 10 rejection codes", category: "during_day", completed: false, completedBy: "", completedAt: null, isRecurring: true, sortOrder: 6, practiceId: "demo-practice", date: now.toISOString(), createdAt: now.toISOString() },
  { id: "dt7", title: "Monitor occupational health contract billing accuracy", category: "during_day", completed: false, completedBy: "", completedAt: null, isRecurring: true, sortOrder: 7, practiceId: "demo-practice", date: now.toISOString(), createdAt: now.toISOString() },
  { id: "dt8", title: "Approve pharmacy stock purchase orders (37 pharmacies)", category: "during_day", completed: false, completedBy: "", completedAt: null, isRecurring: true, sortOrder: 8, practiceId: "demo-practice", date: now.toISOString(), createdAt: now.toISOString() },
  { id: "dt9", title: "Review daily collection ratios per clinic region", category: "end_of_day", completed: false, completedBy: "", completedAt: null, isRecurring: true, sortOrder: 9, practiceId: "demo-practice", date: now.toISOString(), createdAt: now.toISOString() },
  { id: "dt10", title: "Generate EBITDA variance report for Group reporting", category: "end_of_day", completed: false, completedBy: "", completedAt: null, isRecurring: true, sortOrder: 10, practiceId: "demo-practice", date: now.toISOString(), createdAt: now.toISOString() },
  { id: "dt11", title: "Check POPIA consent compliance dashboard (88 clinics)", category: "end_of_day", completed: false, completedBy: "", completedAt: null, isRecurring: true, sortOrder: 11, practiceId: "demo-practice", date: now.toISOString(), createdAt: now.toISOString() },
];

// Types for mutable stores
type DemoPatient = Record<string, unknown>;
type DemoAllergy = Record<string, unknown>;
type DemoMedication = Record<string, unknown>;
type DemoMedicalRecord = Record<string, unknown>;
type DemoVital = Record<string, unknown>;
type DemoInvoice = Record<string, unknown>;
type DemoPayment = Record<string, unknown>;
type DemoCheckIn = Record<string, unknown>;
type DemoNotification = Record<string, unknown>;
type DemoConsent = Record<string, unknown>;
type DemoDailyTask = Record<string, unknown>;

// In-memory mutable store for demo mode interactivity
let _patients: DemoPatient[] = [...demoPatients];
let _allergies: DemoAllergy[] = [..._demoAllergies];
let _medications: DemoMedication[] = [..._demoMedications];
let _medicalRecords: DemoMedicalRecord[] = [..._demoMedicalRecords];
let _vitals: DemoVital[] = [..._demoVitals];
let _invoices: DemoInvoice[] = [..._demoInvoices];
let _payments: DemoPayment[] = [..._demoPayments];
let _checkIns: DemoCheckIn[] = [..._demoCheckIns];
let _notificationsList: DemoNotification[] = [..._demoNotifications];
let _consents: DemoConsent[] = [..._demoConsents];
let _dailyTasks: DemoDailyTask[] = [..._demoDailyTasks];
let _conversations = [...demoConversations.map(c => ({ ...c, messages: [...c.messages] }))];
let _bookings = [...demoBookings];
let _reviews = [...demoReviews];
let _recallItems = [...demoRecallItems];
let _teamMembers = [
  { id: "demo-user-sara", name: "Sara Nayager", email: "sara.nayager@netcare.co.za", role: "platform_admin", status: "active" as const, lastLogin: new Date(now.getTime() - 2 * 3600000).toISOString(), practiceId: "demo-practice", createdAt: new Date(now.getTime() - 365 * day).toISOString(), updatedAt: new Date(now.getTime() - 2 * 3600000).toISOString() },
  { id: "demo-user-thirushen", name: "Thirushen Pillay", email: "thirushen.pillay@netcare.co.za", role: "platform_admin", status: "active" as const, lastLogin: new Date(now.getTime() - 1 * 3600000).toISOString(), practiceId: "demo-practice", createdAt: new Date(now.getTime() - 365 * day).toISOString(), updatedAt: new Date(now.getTime() - 1 * 3600000).toISOString() },
  { id: "demo-user-chris", name: "Dr Chris Mathew", email: "chris.mathew@netcare.co.za", role: "admin", status: "active" as const, lastLogin: new Date(now.getTime() - 4 * 3600000).toISOString(), practiceId: "demo-practice", createdAt: new Date(now.getTime() - 300 * day).toISOString(), updatedAt: new Date(now.getTime() - 4 * 3600000).toISOString() },
  { id: "demo-user-nurse1", name: "Nurse Botha", email: "nurse.botha@netcare.co.za", role: "nurse", status: "active" as const, lastLogin: new Date(now.getTime() - 6 * 3600000).toISOString(), practiceId: "demo-practice", createdAt: new Date(now.getTime() - 200 * day).toISOString(), updatedAt: new Date(now.getTime() - 6 * 3600000).toISOString() },
  { id: "demo-user-recep1", name: "Lindiwe Moyo", email: "lindiwe.moyo@netcare.co.za", role: "receptionist", status: "active" as const, lastLogin: new Date(now.getTime() - 3 * 3600000).toISOString(), practiceId: "demo-practice", createdAt: new Date(now.getTime() - 150 * day).toISOString(), updatedAt: new Date(now.getTime() - 3 * 3600000).toISOString() },
  { id: "demo-user-doc2", name: "Dr Priya Govender", email: "priya.govender@netcare.co.za", role: "doctor", status: "active" as const, lastLogin: new Date(now.getTime() - 8 * 3600000).toISOString(), practiceId: "demo-practice", createdAt: new Date(now.getTime() - 250 * day).toISOString(), updatedAt: new Date(now.getTime() - 8 * 3600000).toISOString() },
  { id: "demo-user-inactive1", name: "Dr James Patel", email: "james.patel@netcare.co.za", role: "doctor", status: "inactive" as const, lastLogin: new Date(now.getTime() - 60 * day).toISOString(), practiceId: "demo-practice", createdAt: new Date(now.getTime() - 400 * day).toISOString(), updatedAt: new Date(now.getTime() - 30 * day).toISOString() },
];
let _auditLogs = [
  { id: "log-1", action: "login", details: "Logged in from Sandton office", userId: "demo-user-sara", userName: "Sara Nayager", ipAddress: "196.21.45.100", practiceId: "demo-practice", createdAt: new Date(now.getTime() - 2 * 3600000).toISOString() },
  { id: "log-2", action: "patient_view", details: "Viewed patient record: Thandi Mkhize", userId: "demo-user-chris", userName: "Dr Chris Mathew", ipAddress: "196.21.45.101", practiceId: "demo-practice", createdAt: new Date(now.getTime() - 4 * 3600000).toISOString() },
  { id: "log-3", action: "invoice_create", details: "Created invoice INV-2026-001 for Maria Santos", userId: "demo-user-thirushen", userName: "Thirushen Pillay", ipAddress: "196.21.45.100", practiceId: "demo-practice", createdAt: new Date(now.getTime() - 5 * 3600000).toISOString() },
  { id: "log-4", action: "booking_confirm", details: "Confirmed booking for Lerato Phiri", userId: "demo-user-recep1", userName: "Lindiwe Moyo", ipAddress: "196.21.45.102", practiceId: "demo-practice", createdAt: new Date(now.getTime() - 6 * 3600000).toISOString() },
  { id: "log-5", action: "settings_update", details: "Updated notification preferences", userId: "demo-user-sara", userName: "Sara Nayager", ipAddress: "196.21.45.100", practiceId: "demo-practice", createdAt: new Date(now.getTime() - day).toISOString() },
  { id: "log-6", action: "login", details: "Logged in via mobile", userId: "demo-user-thirushen", userName: "Thirushen Pillay", ipAddress: "105.18.22.45", practiceId: "demo-practice", createdAt: new Date(now.getTime() - day).toISOString() },
  { id: "log-7", action: "patient_create", details: "Added new patient: Sipho Dlamini", userId: "demo-user-nurse1", userName: "Nurse Botha", ipAddress: "196.21.45.103", practiceId: "demo-practice", createdAt: new Date(now.getTime() - 2 * day).toISOString() },
  { id: "log-8", action: "prescription_create", details: "Prescribed Metformin 500mg to David Moloi", userId: "demo-user-doc2", userName: "Dr Priya Govender", ipAddress: "196.21.45.104", practiceId: "demo-practice", createdAt: new Date(now.getTime() - 2 * day).toISOString() },
];
let _counter = 100;

export const demoStore = {
  // === Patients ===
  getPatients: () => _patients.map(p => ({
    ...p,
    allergies: _allergies.filter(a => a.patientId === p.id),
    medications: _medications.filter(m => m.patientId === p.id && m.active),
  })),
  getPatient: (id: string) => {
    const p = _patients.find(x => x.id === id);
    if (!p) return null;
    return {
      ...p,
      allergies: _allergies.filter(a => a.patientId === id),
      medications: _medications.filter(m => m.patientId === id),
      medicalRecords: _medicalRecords.filter(r => r.patientId === id),
      vitals: _vitals.filter(v => v.patientId === id),
    };
  },
  addPatient: (data: Record<string, string>) => {
    const p = {
      id: `p${_counter++}`,
      name: data.name || "",
      phone: data.phone || "",
      email: data.email || "",
      dateOfBirth: data.dateOfBirth || "",
      gender: data.gender || "",
      idNumber: data.idNumber || "",
      address: data.address || "",
      medicalAid: data.medicalAid || "",
      medicalAidNo: data.medicalAidNo || "",
      bloodType: data.bloodType || "",
      emergencyName: data.emergencyName || "",
      emergencyPhone: data.emergencyPhone || "",
      notes: data.notes || "",
      status: "active",
      lastVisit: "",
      practiceId: "demo-practice",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    _patients.push(p);
    return p;
  },
  updatePatient: (id: string, data: Record<string, unknown>) => {
    const p = _patients.find(x => x.id === id);
    if (!p) return null;
    Object.assign(p, data, { updatedAt: new Date().toISOString() });
    return p;
  },
  deletePatient: (id: string) => { _patients = _patients.filter(x => x.id !== id); },

  // === Allergies ===
  getAllergies: (patientId: string) => _allergies.filter(a => a.patientId === patientId),
  addAllergy: (patientId: string, data: Record<string, string>) => {
    const a = { id: `al${_counter++}`, name: data.name, severity: data.severity || "moderate", reaction: data.reaction || "", patientId, createdAt: new Date().toISOString() };
    _allergies.push(a);
    return a;
  },
  deleteAllergy: (id: string) => { _allergies = _allergies.filter(x => x.id !== id); },

  // === Medications ===
  getMedications: (patientId: string) => _medications.filter(m => m.patientId === patientId),
  addMedication: (patientId: string, data: Record<string, string | boolean>) => {
    const m = {
      id: `med${_counter++}`, name: String(data.name), dosage: String(data.dosage || ""),
      frequency: String(data.frequency || ""), prescriber: String(data.prescriber || ""),
      startDate: data.startDate ? String(data.startDate) : "", endDate: "",
      active: true, patientId, createdAt: new Date().toISOString(),
    };
    _medications.push(m);
    return m;
  },
  updateMedication: (id: string, data: Record<string, unknown>) => {
    const m = _medications.find(x => x.id === id);
    if (m) {
      if (data.active !== undefined) m.active = Boolean(data.active);
      if (data.endDate !== undefined) m.endDate = data.endDate ? String(data.endDate) : null;
    }
    return m;
  },

  // === Medical Records ===
  getMedicalRecords: (patientId: string) => _medicalRecords.filter(r => r.patientId === patientId),
  addMedicalRecord: (patientId: string, data: Record<string, string>) => {
    const r = {
      id: `rec${_counter++}`, type: data.type, title: data.title,
      description: data.description || "", diagnosis: data.diagnosis || "",
      treatment: data.treatment || "", provider: data.provider || "",
      patientId, practiceId: "demo-practice",
      date: data.date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    _medicalRecords.push(r);
    return r;
  },

  // === Vitals ===
  getVitals: (patientId: string) => _vitals.filter(v => v.patientId === patientId),
  addVitals: (patientId: string, data: Record<string, unknown>) => {
    const v = {
      id: `v${_counter++}`,
      bloodPressureSys: data.bloodPressureSys ?? null,
      bloodPressureDia: data.bloodPressureDia ?? null,
      heartRate: data.heartRate ?? null,
      temperature: data.temperature ?? null,
      weight: data.weight ?? null,
      height: data.height ?? null,
      oxygenSat: data.oxygenSat ?? null,
      bloodGlucose: data.bloodGlucose ?? null,
      respiratoryRate: data.respiratoryRate ?? null,
      painLevel: data.painLevel ?? null,
      notes: String(data.notes || ""),
      recordedBy: String(data.recordedBy || ""),
      patientId,
      recordedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    _vitals.push(v);
    return v;
  },

  // === Conversations (existing) ===
  getConversations: () => _conversations,
  getConversation: (id: string) => _conversations.find(c => c.id === id),
  addMessage: (convoId: string, role: string, content: string) => {
    const convo = _conversations.find(c => c.id === convoId);
    if (!convo) return null;
    const msg = { id: `dm${_counter++}`, conversationId: convoId, role, content, approved: role !== "ai_suggestion", createdAt: new Date() };
    convo.messages.push(msg);
    convo.updatedAt = new Date();
    return msg;
  },
  approveMessage: (convoId: string, msgId: string, newContent?: string) => {
    const convo = _conversations.find(c => c.id === convoId);
    const msg = convo?.messages.find(m => m.id === msgId);
    if (!msg) return false;
    if (newContent) msg.content = newContent;
    msg.role = "practice";
    msg.approved = true;
    return true;
  },
  simulatePatient: () => {
    const messages = [
      "Hi, I'd like to reschedule my appointment for next week",
      "I need a GP consultation near Fourways. Do you have same-day availability?",
      "Do you have availability this Thursday afternoon?",
      "I have a toothache, can I come in today?",
      "Do you accept medical aid?",
      "Can I book a cleaning for my daughter too?",
    ];
    const patient = demoPatients[Math.floor(Math.random() * demoPatients.length)];
    const content = messages[Math.floor(Math.random() * messages.length)];

    let convo = _conversations.find(c => c.patientId === patient.id);
    if (!convo) {
      convo = {
        id: `c${_counter++}`,
        patientId: patient.id,
        patient,
        practiceId: "demo-practice",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      };
      _conversations.unshift(convo);
    }

    const msg = { id: `dm${_counter++}`, conversationId: convo.id, role: "patient", content, approved: true, createdAt: new Date() };
    convo.messages.push(msg);
    convo.updatedAt = new Date();

    const aiContent = generateMockAIReply(content, patient.name);
    const aiMsg = { id: `dm${_counter++}`, conversationId: convo.id, role: "ai_suggestion", content: aiContent, approved: false, createdAt: new Date() };
    convo.messages.push(aiMsg);

    return { conversationId: convo.id, message: content };
  },

  // === Bookings (existing) ===
  getBookings: () => _bookings,
  addBooking: (data: { patientName: string; patientPhone?: string; patientEmail?: string; service: string; scheduledAt: string; notes?: string; source?: string }) => {
    const b = { id: `b${_counter++}`, patientName: data.patientName, patientPhone: data.patientPhone || "", patientEmail: data.patientEmail || "", service: data.service, scheduledAt: new Date(data.scheduledAt), status: "pending", source: data.source || "dashboard", notes: data.notes || "", depositAmount: 0, depositPaid: false, paymentRef: "", confirmedAt: null, confirmedBy: "", rejectedAt: null, rejectionReason: "", reminderSentAt: null, followupSentAt: null, checkinSentAt: null, practiceId: "demo-practice", createdAt: new Date() };
    _bookings.push(b);
    return b;
  },
  updateBooking: (id: string, data: { status?: string }) => {
    const b = _bookings.find(x => x.id === id);
    if (b && data.status) b.status = data.status;
    return b;
  },
  deleteBooking: (id: string) => { _bookings = _bookings.filter(x => x.id !== id); },

  // === Reviews (existing) ===
  getReviews: () => _reviews,
  addReview: (data: { rating: number; comment?: string; source?: string; authorName?: string }) => {
    const r = { id: `r${_counter++}`, rating: data.rating, comment: data.comment || "", source: data.source || "google", authorName: data.authorName || "", practiceId: "demo-practice", createdAt: new Date() };
    _reviews.unshift(r);
    return r;
  },
  deleteReview: (id: string) => { _reviews = _reviews.filter(x => x.id !== id); },

  // === Recall (existing) ===
  getRecallItems: () => _recallItems,
  addRecallItem: (data: { patientName: string; reason: string; dueDate: string; phone?: string }) => {
    const item = { id: `rc${_counter++}`, ...data, dueDate: new Date(data.dueDate), contacted: false, phone: data.phone || "", practiceId: "demo-practice", createdAt: new Date() };
    _recallItems.push(item);
    return item;
  },
  updateRecallItem: (id: string, data: { contacted?: boolean }) => {
    const item = _recallItems.find(x => x.id === id);
    if (item && data.contacted !== undefined) item.contacted = data.contacted;
    return item;
  },
  deleteRecallItem: (id: string) => { _recallItems = _recallItems.filter(x => x.id !== id); },

  // === Invoices ===
  getInvoices: () => _invoices,
  getInvoice: (id: string) => _invoices.find(x => x.id === id) || null,
  addInvoice: (data: Record<string, unknown>) => {
    const inv = {
      id: `inv${_counter++}`, invoiceNo: `INV-2026-${String(_counter).padStart(3, "0")}`,
      patientName: String(data.patientName || ""), patientId: String(data.patientId || ""),
      lineItems: String(data.lineItems || "[]"),
      subtotal: Number(data.subtotal || 0), tax: Number(data.tax || 0), discount: Number(data.discount || 0),
      total: Number(data.total || 0), amountPaid: 0, balance: Number(data.total || 0),
      medicalAidClaim: Number(data.medicalAidClaim || 0), patientPortion: Number(data.patientPortion || 0),
      claimStatus: "", claimReference: "",
      status: "draft", dueDate: data.dueDate || null, paidAt: null,
      notes: String(data.notes || ""), practiceId: "demo-practice", createdAt: new Date().toISOString(),
    };
    _invoices.push(inv);
    return inv;
  },
  updateInvoice: (id: string, data: Record<string, unknown>) => {
    const inv = _invoices.find(x => x.id === id);
    if (inv) Object.assign(inv, data);
    return inv;
  },

  // === Payments ===
  getPayments: () => _payments,
  addPayment: (data: Record<string, unknown>) => {
    const p = {
      id: `pay${_counter++}`, amount: Number(data.amount || 0),
      method: String(data.method || "cash"), reference: String(data.reference || ""),
      invoiceId: data.invoiceId ? String(data.invoiceId) : null,
      patientName: String(data.patientName || ""), notes: String(data.notes || ""),
      practiceId: "demo-practice", createdAt: new Date().toISOString(),
    };
    _payments.push(p);
    // Update invoice if linked
    if (p.invoiceId) {
      const inv = _invoices.find(x => x.id === p.invoiceId);
      if (inv) {
        inv.amountPaid = Number(inv.amountPaid || 0) + p.amount;
        inv.balance = Number(inv.total || 0) - Number(inv.amountPaid);
        inv.status = Number(inv.balance) <= 0 ? "paid" : "partial";
        if (Number(inv.balance) <= 0) inv.paidAt = new Date().toISOString();
      }
    }
    return p;
  },
  getDailyRevenue: () => 147000,

  // === Check-ins ===
  getCheckIns: () => _checkIns,
  addCheckIn: (data: Record<string, string>) => {
    const ci = {
      id: `ci${_counter++}`, patientName: data.patientName || "", patientId: data.patientId || "",
      status: "waiting", arrivedAt: new Date().toISOString(), seenAt: null, leftAt: null,
      notes: data.notes || "", practiceId: "demo-practice", createdAt: new Date().toISOString(),
    };
    _checkIns.push(ci);
    return ci;
  },
  updateCheckIn: (id: string, data: Record<string, unknown>) => {
    const ci = _checkIns.find(x => x.id === id);
    if (!ci) return null;
    if (data.status === "in_consultation") { ci.status = "in_consultation"; ci.seenAt = new Date().toISOString(); }
    if (data.status === "checked_out") { ci.status = "checked_out"; ci.leftAt = new Date().toISOString(); }
    if (data.status === "no_show") ci.status = "no_show";
    if (data.notes !== undefined) ci.notes = String(data.notes);
    return ci;
  },

  // === Notifications ===
  getNotifications: () => _notificationsList,
  addNotification: (data: Record<string, string>) => {
    const n = {
      id: `notif${_counter++}`, type: data.type || "whatsapp", recipient: data.recipient || "",
      patientName: data.patientName || "", subject: data.subject || "", message: data.message || "",
      status: "sent", template: data.template || "custom",
      practiceId: "demo-practice", sentAt: new Date().toISOString(), createdAt: new Date().toISOString(),
    };
    _notificationsList.push(n);
    return n;
  },

  // === Consent Records ===
  getConsents: (patientId?: string) => patientId ? _consents.filter(c => c.patientId === patientId) : _consents,
  addConsent: (data: Record<string, unknown>) => {
    const c = {
      id: `con${_counter++}`, patientName: String(data.patientName || ""), patientId: String(data.patientId || ""),
      consentType: String(data.consentType || "treatment"), granted: data.granted !== false,
      method: String(data.method || "digital"), ipAddress: String(data.ipAddress || ""),
      notes: String(data.notes || ""), practiceId: "demo-practice",
      grantedAt: new Date().toISOString(), revokedAt: data.granted === false ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
    };
    _consents.push(c);
    return c;
  },
  revokeConsent: (id: string) => {
    const c = _consents.find(x => x.id === id);
    if (c) { c.granted = false; c.revokedAt = new Date().toISOString(); }
    return c;
  },

  // === Daily Tasks ===
  getDailyTasks: () => _dailyTasks,
  toggleDailyTask: (id: string, completedBy: string) => {
    const t = _dailyTasks.find(x => x.id === id);
    if (!t) return null;
    t.completed = !t.completed;
    t.completedBy = t.completed ? completedBy : "";
    t.completedAt = t.completed ? new Date().toISOString() : null;
    return t;
  },
  addDailyTask: (data: Record<string, unknown>) => {
    const t = {
      id: `dt${_counter++}`, title: String(data.title || ""), category: String(data.category || "during_day"),
      completed: false, completedBy: "", completedAt: null,
      isRecurring: data.isRecurring !== false, sortOrder: _dailyTasks.length + 1,
      practiceId: "demo-practice", date: new Date().toISOString(), createdAt: new Date().toISOString(),
    };
    _dailyTasks.push(t);
    return t;
  },
  deleteDailyTask: (id: string) => { _dailyTasks = _dailyTasks.filter(x => x.id !== id); },

  // === Team Management ===
  getTeamMembers: () => _teamMembers,
  getTeamMember: (id: string) => _teamMembers.find(m => m.id === id) || null,
  addTeamMember: (data: Record<string, string>) => {
    const m = {
      id: `user-${_counter++}`,
      name: data.name || "",
      email: data.email || "",
      role: data.role || "receptionist",
      status: "active" as const,
      lastLogin: "",
      practiceId: "demo-practice",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    _teamMembers.push(m);
    return m;
  },
  updateTeamMember: (id: string, data: Record<string, unknown>) => {
    const m = _teamMembers.find(x => x.id === id);
    if (!m) return null;
    if (data.role !== undefined) m.role = String(data.role);
    if (data.status !== undefined) m.status = String(data.status) as "active" | "inactive";
    if (data.name !== undefined) m.name = String(data.name);
    m.updatedAt = new Date().toISOString();
    return m;
  },
  deleteTeamMember: (id: string) => {
    const m = _teamMembers.find(x => x.id === id);
    if (m) { m.status = "inactive"; m.updatedAt = new Date().toISOString(); }
    return m;
  },

  // === Audit Logs ===
  getAuditLogs: (userId?: string) => {
    if (userId) return _auditLogs.filter(l => l.userId === userId);
    return _auditLogs;
  },
  addAuditLog: (data: Record<string, string>) => {
    const l = {
      id: `log-${_counter++}`,
      action: data.action || "",
      details: data.details || "",
      userId: data.userId || "",
      userName: data.userName || "",
      ipAddress: data.ipAddress || "",
      practiceId: "demo-practice",
      createdAt: new Date().toISOString(),
    };
    _auditLogs.unshift(l);
    return l;
  },

  // === Analytics ===
  getAnalytics: () => {
    const today = new Date().toDateString();
    const bookingsToday = _bookings.filter(b => new Date(b.scheduledAt).toDateString() === today).length;
    const ratings = _reviews.map(r => r.rating);
    const avgRating = ratings.length ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)) : 0;
    const recallDue = _recallItems.filter(r => !r.contacted).length;
    const recallOverdue = _recallItems.filter(r => !r.contacted && new Date(r.dueDate) < now).length;

    const serviceCounts: Record<string, number> = {};
    for (const b of _bookings) { const s = String(b.service); serviceCounts[s] = (serviceCounts[s] || 0) + 1; }
    const topServices = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));

    const reviewsBySource: Record<string, number> = {};
    for (const r of _reviews) { const s = String(r.source); reviewsBySource[s] = (reviewsBySource[s] || 0) + 1; }

    const recordsByType: Record<string, number> = {};
    for (const r of _medicalRecords) { const t = String(r.type); recordsByType[t] = (recordsByType[t] || 0) + 1; }

    return {
      patients: { total: 4250, active: 3890, newThisMonth: 312 },
      bookings: { total: 1890, today: 147, pending: 23, confirmed: 124, cancelled: 8, completed: 1735 },
      topServices,
      reviews: { total: 847, avgRating: 4.6, bySource: { google: 412, whatsapp: 234, facebook: 128, internal: 73 } },
      recall: { due: 234, overdue: 67 },
      conversations: { total: 1245, active: 89 },
      records: { total: 12450, byType: { consultation: 8200, procedure: 2100, imaging: 1200, lab_result: 650, referral: 300 } },
      vitals: { total: 8900 },
      billing: {
        totalInvoices: 3456,
        totalRevenue: 4250000,
        outstanding: 890000,
        paidToday: 147000,
        byMethod: { medical_aid: 3200000, card: 520000, cash: 380000, eft: 150000 },
      },
      checkIns: {
        waiting: 12,
        inConsultation: 8,
        checkedOut: 134,
        noShows: 3,
      },
      notifications: {
        total: 8920,
        sent: 8756,
        failed: 164,
      },
      dailyTasks: {
        total: 11,
        completed: 3,
        progress: 27,
      },
    };
  },
};

function generateMockAIReply(patientMessage: string, patientName: string): string {
  const lower = patientMessage.toLowerCase();
  const firstName = patientName.split(" ")[0];

  if (lower.includes("reschedule") || lower.includes("appointment")) {
    return `Hi ${firstName}! Of course, we can help with that. We have availability on Monday at 10:00, Wednesday at 14:00, and Friday at 9:00. Which works best for you?`;
  }
  if (lower.includes("price") || lower.includes("cost") || lower.includes("whitening")) {
    return `Hi ${firstName}! Great question. Our Medicross Fourways has same-day GP slots at 14:00 and 15:30. Consultation is R650. Discovery/GEMS/Bonitas cover most of this. Shall I book you in?`;
  }
  if (lower.includes("availability") || lower.includes("thursday") || lower.includes("book")) {
    return `Hi ${firstName}! Let me check our schedule. We have openings at 14:00 and 15:30. Shall I book one of those for you?`;
  }
  if (lower.includes("pain") || lower.includes("emergency") || lower.includes("toothache")) {
    return `Hi ${firstName}, I'm sorry to hear that. We prioritise emergencies — can you come in today at 15:30? Please take an anti-inflammatory in the meantime. If pain worsens, call us at 082 911 (Netcare 911).`;
  }
  if (lower.includes("medical aid") || lower.includes("insurance")) {
    return `Hi ${firstName}! Yes, we accept all major medical aids including Discovery, Bonitas, Momentum, and Medihelp. We can also do a benefits check before your appointment.`;
  }
  if (lower.includes("cancel")) {
    return `Hi ${firstName}, no problem! I've noted the cancellation. Would you like to rebook for another day?`;
  }
  return `Hi ${firstName}! Thanks for reaching out. Let me connect you with our team who can assist. Is there anything specific I can help with in the meantime?`;
}
