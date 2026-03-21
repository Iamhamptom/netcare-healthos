// Live Demo Simulator — makes the Bridge Console feel alive
// Generates realistic HL7 messages at intervals, creating new advisories in real-time
// Used when DEMO_MODE=true to simulate CareOn sending data

import type { BridgeAdvisory, BridgeMessageLog, HL7MessageType } from "./types";

const FACILITIES = [
  "Netcare Milpark Hospital",
  "Netcare Sunninghill Hospital",
  "Christiaan Barnard Memorial Hospital",
  "Netcare Garden City Hospital",
  "Netcare Olivedale Hospital",
  "Netcare Unitas Hospital",
  "Medicross Sandton City",
  "Netcare Waterfall City Hospital",
  "Medicross Fourways",
  "Netcare N1 City Hospital",
];

const PATIENT_NAMES = [
  "Sipho Mthembu", "Lerato Moloi", "Pieter du Plessis", "Fatima Abrahams",
  "Thandi Nkosi", "Willem Botha", "Nomvula Zulu", "Ahmed Patel",
  "Chantal van Wyk", "Bongani Dlamini", "Ingrid Kruger", "Mpho Mokoena",
  "Sandra Liebenberg", "Kabelo Maseko", "Yusuf Khan", "Ntombi Shabalala",
];

const DOCTORS = [
  "Dr P. Naidoo", "Dr R. Patel", "Dr A. Khan", "Dr S. Botha",
  "Dr L. Molefe", "Dr M. van der Merwe", "Dr T. Dlamini", "Dr J. Pretorius",
];

const SCHEMES = [
  { name: "Discovery", plan: "Executive", prefix: "DH" },
  { name: "Discovery", plan: "Classic Comp", prefix: "DH" },
  { name: "Bonitas", plan: "BonComprehensive", prefix: "BON" },
  { name: "GEMS", plan: "Emerald", prefix: "GEMS" },
  { name: "GEMS", plan: "Onyx", prefix: "GEMS" },
  { name: "Momentum", plan: "Ingwe", prefix: "MOM" },
  { name: "Medshield", plan: "MedElite", prefix: "MSH" },
  { name: "Medihelp", plan: "MedSaver", prefix: "MH" },
];

const MESSAGE_TYPES: { type: HL7MessageType; weight: number }[] = [
  { type: "ADT^A01", weight: 25 },  // Admit
  { type: "ADT^A03", weight: 20 },  // Discharge
  { type: "ADT^A04", weight: 30 },  // Outpatient register
  { type: "ADT^A08", weight: 10 },  // Update (no advisory)
  { type: "ORU^R01", weight: 10 },  // Lab results
  { type: "ORM^O01", weight: 5 },   // Orders
];

const DIAGNOSES = [
  { code: "J06.9", desc: "Acute upper respiratory infection", severity: "info" as const, value: 650 },
  { code: "I10", desc: "Essential hypertension", severity: "info" as const, value: 850 },
  { code: "E11.9", desc: "Type 2 diabetes mellitus", severity: "warning" as const, value: 1200 },
  { code: "M54.5", desc: "Low back pain", severity: "info" as const, value: 750 },
  { code: "K21.0", desc: "GERD with oesophagitis", severity: "info" as const, value: 950 },
  { code: "J45.9", desc: "Asthma, unspecified", severity: "info" as const, value: 800 },
  { code: "M17.1", desc: "Primary gonarthrosis, unilateral", severity: "warning" as const, value: 185000 },
  { code: "I25.1", desc: "Atherosclerotic heart disease", severity: "critical" as const, value: 72000 },
  { code: "C50.9", desc: "Malignant neoplasm of breast", severity: "critical" as const, value: 245000 },
  { code: "N18.3", desc: "Chronic kidney disease, stage 3", severity: "warning" as const, value: 15000 },
  { code: "G43.9", desc: "Migraine, unspecified", severity: "info" as const, value: 650 },
  { code: "F32.1", desc: "Moderate depressive episode", severity: "info" as const, value: 1100 },
];

const ADVISORY_TEMPLATES = {
  billing: [
    "Billing pack prepared. {scheme} {plan} detected. {codes} coded. Verify procedure codes before submission.",
    "Patient discharged. {count} diagnosis code(s) captured. Submit claim to {scheme} within 30 days.",
    "{scheme} {plan} requires pre-authorization for procedures above R{threshold}. Check before submitting.",
  ],
  clinical: [
    "Critical lab value detected: {test} = {value} (ref {range}). Clinical follow-up recommended.",
    "Abnormal results flagged. {count} values outside reference range. Review for chronic disease management coding.",
  ],
  eligibility: [
    "{scheme} {plan} eligibility confirmed. GP consultation covered at 100% of scheme rate.",
    "{scheme} membership verified. Benefits available. No pre-authorization needed for this visit type.",
  ],
  compliance: [
    "CT/MRI ordered. Most schemes require pre-authorization for imaging above R3,000. Verify before proceeding.",
    "{scheme} requires referral letter for specialist consultations. Ensure documentation is complete.",
  ],
  coding: [
    "AI detected possible under-coding: {missed} not captured. Adding as comorbidity increases DRG weight by ~{uplift}%.",
    "Procedure code missing for {proc}. {scheme} will reject claims above R{threshold} without CPT code.",
  ],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedPick<T extends { weight: number }>(items: T[]): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

let simCounter = 0;

/** Generate a single simulated bridge event (message + optional advisory) */
export function generateSimulatedEvent(): {
  message: BridgeMessageLog;
  advisory: BridgeAdvisory | null;
} {
  simCounter++;
  const now = new Date();
  const facility = pick(FACILITIES);
  const patient = pick(PATIENT_NAMES);
  const doctor = pick(DOCTORS);
  const scheme = pick(SCHEMES);
  const msgType = weightedPick(MESSAGE_TYPES);
  const diag = pick(DIAGNOSES);
  const mrn = `MRN-${10000 + simCounter}`;
  const processingMs = Math.floor(30 + Math.random() * 200);

  // Determine if this message generates an advisory
  const generatesAdvisory = msgType.type !== "ADT^A08"; // A08 updates rarely generate advisories

  const message: BridgeMessageLog = {
    id: `sim-msg-${now.getTime()}-${simCounter}`,
    receivedAt: now.toISOString(),
    messageType: msgType.type,
    facility,
    patientMRN: mrn,
    status: generatesAdvisory ? "advisory_generated" : "processed",
    advisoryCount: generatesAdvisory ? 1 : 0,
    processingTimeMs: processingMs,
  };

  if (!generatesAdvisory) {
    return { message, advisory: null };
  }

  // Pick advisory category based on message type
  type Cat = "billing" | "clinical" | "eligibility" | "compliance" | "coding";
  let category: Cat;
  if (msgType.type === "ORU^R01") category = "clinical";
  else if (msgType.type === "ORM^O01") category = "compliance";
  else if (msgType.type === "ADT^A04") category = Math.random() > 0.5 ? "eligibility" : "billing";
  else if (msgType.type === "ADT^A03") category = Math.random() > 0.7 ? "coding" : "billing";
  else category = "billing";

  const templates = ADVISORY_TEMPLATES[category];
  let desc = pick(templates)
    .replace("{scheme}", scheme.name)
    .replace("{plan}", scheme.plan)
    .replace("{codes}", diag.code)
    .replace("{count}", String(Math.floor(1 + Math.random() * 3)))
    .replace("{test}", "HbA1c")
    .replace("{value}", "8.2%")
    .replace("{range}", "4.0-5.6%")
    .replace("{threshold}", String(Math.floor(3000 + Math.random() * 50000)))
    .replace("{missed}", "E11.9 (Type 2 diabetes)")
    .replace("{uplift}", String(Math.floor(8 + Math.random() * 15)))
    .replace("{proc}", "cardiac catheterization");

  const encounterTypes: Record<string, string> = {
    "ADT^A01": "Admission",
    "ADT^A03": "Discharge",
    "ADT^A04": "Outpatient Visit",
    "ORU^R01": "Lab Results",
    "ORM^O01": "Order",
  };

  const advisory: BridgeAdvisory = {
    id: `sim-adv-${now.getTime()}-${simCounter}`,
    timestamp: now.toISOString(),
    patientMRN: mrn,
    patientName: patient,
    encounterType: encounterTypes[msgType.type] ?? "Visit",
    facility,
    category,
    severity: category === "clinical" ? "critical" : category === "coding" ? "warning" : diag.severity,
    title: `${encounterTypes[msgType.type] ?? "Visit"} — ${diag.desc} (${diag.code})`,
    description: desc,
    suggestedICD10: [
      { code: diag.code, description: diag.desc, confidence: 0.85 + Math.random() * 0.14 },
      ...(Math.random() > 0.5 ? [{ code: "E11.9", description: "Type 2 diabetes mellitus", confidence: 0.7 + Math.random() * 0.2 }] : []),
    ],
    estimatedValue: diag.value,
    actionRequired: category !== "eligibility",
    autoResolvable: category === "eligibility",
    sourceMessageType: msgType.type,
    sourceMessageId: `SIM-${simCounter}`,
  };

  return { message, advisory };
}

/** Get a batch of simulated events (for initial page load) */
export function getSimulatedBatch(count: number): {
  messages: BridgeMessageLog[];
  advisories: BridgeAdvisory[];
} {
  const messages: BridgeMessageLog[] = [];
  const advisories: BridgeAdvisory[] = [];

  for (let i = 0; i < count; i++) {
    const event = generateSimulatedEvent();
    messages.push(event.message);
    if (event.advisory) advisories.push(event.advisory);
  }

  return { messages, advisories };
}
