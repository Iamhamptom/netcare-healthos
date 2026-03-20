// Realistic demo HL7v2 messages simulating CareOn/iMedOne output
// These represent real hospital workflows at Netcare facilities

import type { BridgeAdvisory, BridgeMessageLog } from "./types";

const now = new Date();
const hour = 3600000;
const min = 60000;

// HL7v2 encoding chars as a constant to avoid escaping in heredocs
const ENC = "^~\\&";

/** Sample HL7v2 messages that CareOn would send */
export const DEMO_HL7_MESSAGES = {
  // Patient admitted to Milpark Hospital — knee replacement
  admit_milpark: [
    `MSH|${ENC}|CAREON|NETCARE_MILPARK|VISIOHEALTH|NETCARE_OS|20260320091500||ADT${ENC.charAt(0)}A01|MSG001|P|2.4`,
    `PID|||MRN-4521${ENC.charAt(0)}${ENC.charAt(0)}${ENC.charAt(0)}8501015800086||VAN_DER_MERWE${ENC.charAt(0)}JOHAN||19850101|M|||42 Oak Avenue${ENC.charAt(0)}Sandton${ENC.charAt(0)}Gauteng${ENC.charAt(0)}2196||+27824561234`,
    `PV1||I|ORTHO${ENC.charAt(0)}${ENC.charAt(0)}BED-12${ENC.charAt(0)}MILPARK|||NAIDOO${ENC.charAt(0)}PRIYA${ENC.charAt(0)}DR||||||||||||V-20260320-001|||||||||||||||||||||||20260320091500`,
    `IN1||||DISCOVERY${ENC.charAt(0)}Discovery Health Medical Scheme||||||||||||||||||||||||||||||||||DH-001-4521-88||Executive Plan`,
    `DG1|1|ICD10|M17.1${ENC.charAt(0)}Primary gonarthrosis, unilateral||20260320|A`,
    `DG1|2|ICD10|E11.9${ENC.charAt(0)}Type 2 diabetes mellitus without complications||20260320|W`,
  ].join("\r"),

  // Discharge from Sunninghill — post cardiac catheterization
  discharge_sunninghill: [
    `MSH|${ENC}|CAREON|NETCARE_SUNNINGHILL|VISIOHEALTH|NETCARE_OS|20260320143000||ADT${ENC.charAt(0)}A03|MSG002|P|2.4`,
    `PID|||MRN-7823${ENC.charAt(0)}${ENC.charAt(0)}${ENC.charAt(0)}7403125800089||MOKOENA${ENC.charAt(0)}THABO||19740312|M|||18 Protea Rd${ENC.charAt(0)}Fourways${ENC.charAt(0)}Gauteng${ENC.charAt(0)}2191||+27831234567`,
    `PV1||I|CARDIO${ENC.charAt(0)}${ENC.charAt(0)}BED-03${ENC.charAt(0)}SUNNINGHILL|||PATEL${ENC.charAt(0)}RAJESH${ENC.charAt(0)}DR||||||||||||V-20260318-042|||||||||||||||||||||||20260318100000|20260320143000`,
    `IN1||||BONITAS${ENC.charAt(0)}Bonitas Medical Fund||||||||||||||||||||||||||||||||||BON-7823-445||BonComprehensive`,
    `DG1|1|ICD10|I25.1${ENC.charAt(0)}Atherosclerotic heart disease of native coronary artery||20260320|F`,
    `DG1|2|ICD10|I10${ENC.charAt(0)}Essential (primary) hypertension||20260320|F`,
    `DG1|3|ICD10|E78.0${ENC.charAt(0)}Pure hypercholesterolaemia||20260320|W`,
  ].join("\r"),

  // Lab results from Garden City — blood panel
  lab_gardencity: [
    `MSH|${ENC}|CAREON|NETCARE_GARDEN_CITY|VISIOHEALTH|NETCARE_OS|20260320110000||ORU${ENC.charAt(0)}R01|MSG003|P|2.4`,
    `PID|||MRN-3341${ENC.charAt(0)}${ENC.charAt(0)}${ENC.charAt(0)}9202280800085||DLAMINI${ENC.charAt(0)}NOMSA||19920228|F|||7 Jacaranda St${ENC.charAt(0)}Mamelodi${ENC.charAt(0)}Gauteng${ENC.charAt(0)}0122||+27769876543`,
    `PV1||O|PATH${ENC.charAt(0)}${ENC.charAt(0)}${ENC.charAt(0)}GARDEN_CITY|||BOTHA${ENC.charAt(0)}ANNA${ENC.charAt(0)}DR`,
    `OBX|1|NM|2339-0${ENC.charAt(0)}Glucose [Mass/volume] in Blood||7.8|mmol/L|3.9-5.6|H|||F|||20260320103000`,
    `OBX|2|NM|4548-4${ENC.charAt(0)}Hemoglobin A1c/Hemoglobin.total in Blood||8.2|%|4.0-5.6|HH|||F|||20260320103000`,
    `OBX|3|NM|2093-3${ENC.charAt(0)}Cholesterol [Mass/volume] in Serum||6.4|mmol/L|<5.0|H|||F|||20260320103000`,
    `OBX|4|NM|2571-8${ENC.charAt(0)}Triglyceride [Mass/volume] in Serum||2.3|mmol/L|<1.7|H|||F|||20260320103000`,
    `OBX|5|NM|718-7${ENC.charAt(0)}Hemoglobin [Mass/volume] in Blood||13.2|g/dL|12.0-16.0|N|||F|||20260320103000`,
    `OBX|6|NM|2160-0${ENC.charAt(0)}Creatinine [Mass/volume] in Serum||68|umol/L|53-97|N|||F|||20260320103000`,
  ].join("\r"),

  // Outpatient registration — Medicross primary care visit
  outpatient_medicross: [
    `MSH|${ENC}|CAREON|NETCARE_MEDICROSS_SANDTON|VISIOHEALTH|NETCARE_OS|20260320083000||ADT${ENC.charAt(0)}A04|MSG004|P|2.4`,
    `PID|||MRN-9102${ENC.charAt(0)}${ENC.charAt(0)}${ENC.charAt(0)}0005155800083||SMITH${ENC.charAt(0)}SARAH||20000515|F|||22 Rivonia Rd${ENC.charAt(0)}Sandton${ENC.charAt(0)}Gauteng${ENC.charAt(0)}2196||+27845556789`,
    `PV1||O|GP${ENC.charAt(0)}${ENC.charAt(0)}${ENC.charAt(0)}MEDICROSS_SANDTON|||MOLEFE${ENC.charAt(0)}DAVID${ENC.charAt(0)}DR||||||||||||V-20260320-088|||||||||||||||||||||||20260320083000`,
    `IN1||||GEMS${ENC.charAt(0)}Government Employees Medical Scheme||||||||||||||||||||||||||||||||||GEMS-9102-221||Emerald`,
    `DG1|1|ICD10|J06.9${ENC.charAt(0)}Acute upper respiratory infection, unspecified||20260320|A`,
  ].join("\r"),

  // Radiology order — CT scan from Christiaan Barnard Memorial
  order_cbmh: [
    `MSH|${ENC}|CAREON|NETCARE_CBMH|VISIOHEALTH|NETCARE_OS|20260320120000||ORM${ENC.charAt(0)}O01|MSG005|P|2.4`,
    `PID|||MRN-6678${ENC.charAt(0)}${ENC.charAt(0)}${ENC.charAt(0)}6808235800082||WILLIAMS${ENC.charAt(0)}PETER||19680823|M|||5 Sea Point Main Rd${ENC.charAt(0)}Cape Town${ENC.charAt(0)}WC${ENC.charAt(0)}8005||+27217891234`,
    `PV1||I|NEURO${ENC.charAt(0)}${ENC.charAt(0)}BED-07${ENC.charAt(0)}CBMH|||KHAN${ENC.charAt(0)}AHMED${ENC.charAt(0)}DR||||||||||||V-20260319-112`,
    `ORC|NW|ORD-20260320-001`,
    `OBR||ORD-20260320-001||70553${ENC.charAt(0)}CT Brain without contrast|||20260320120000||||||||KHAN${ENC.charAt(0)}AHMED${ENC.charAt(0)}DR||||||||||S`,
  ].join("\r"),
};

/** Pre-computed demo advisories (what the bridge generates from processing messages) */
export const DEMO_ADVISORIES: BridgeAdvisory[] = [
  {
    id: "adv-001",
    timestamp: new Date(now.getTime() - 3 * hour).toISOString(),
    patientMRN: "MRN-4521",
    patientName: "Johan van der Merwe",
    encounterType: "Admission",
    facility: "Netcare Milpark Hospital",
    category: "billing",
    severity: "info",
    title: "Knee Replacement Admission — Billing Pack Ready",
    description: "Patient admitted for primary gonarthrosis (M17.1). Discovery Executive Plan detected. Pre-authorization likely required for total knee arthroplasty (TKA). Comorbidity E11.9 (T2DM) should be included as secondary diagnosis for accurate DRG grouping.",
    suggestedICD10: [
      { code: "M17.1", description: "Primary gonarthrosis, unilateral", confidence: 0.98 },
      { code: "E11.9", description: "Type 2 diabetes mellitus without complications", confidence: 0.95 },
      { code: "Z96.641", description: "Presence of right artificial knee joint (post-op)", confidence: 0.85 },
    ],
    estimatedValue: 185000,
    actionRequired: true,
    autoResolvable: false,
    sourceMessageType: "ADT^A01",
    sourceMessageId: "MSG001",
  },
  {
    id: "adv-002",
    timestamp: new Date(now.getTime() - 1 * hour).toISOString(),
    patientMRN: "MRN-7823",
    patientName: "Thabo Mokoena",
    encounterType: "Discharge",
    facility: "Netcare Sunninghill Hospital",
    category: "coding",
    severity: "warning",
    title: "Cardiac Discharge — Missing Procedure Code",
    description: "Patient discharged after cardiac catheterization. Final diagnoses I25.1 + I10 + E78.0 are correct, but no procedure code for the catheterization itself. Bonitas BonComprehensive requires procedure codes for claims above R50,000. Add CPT 93458 (Left heart catheterization) or risk rejection.",
    suggestedICD10: [
      { code: "I25.1", description: "Atherosclerotic heart disease of native coronary artery", confidence: 0.99 },
      { code: "I10", description: "Essential (primary) hypertension", confidence: 0.97 },
      { code: "E78.0", description: "Pure hypercholesterolaemia", confidence: 0.94 },
    ],
    estimatedValue: 72000,
    actionRequired: true,
    autoResolvable: false,
    sourceMessageType: "ADT^A03",
    sourceMessageId: "MSG002",
  },
  {
    id: "adv-003",
    timestamp: new Date(now.getTime() - 45 * min).toISOString(),
    patientMRN: "MRN-3341",
    patientName: "Nomsa Dlamini",
    encounterType: "Lab Results",
    facility: "Netcare Garden City Hospital",
    category: "clinical",
    severity: "critical",
    title: "Critical HbA1c — Undiagnosed Diabetes Likely",
    description: "Blood panel shows HbA1c 8.2% (critically high, ref 4.0-5.6%), fasting glucose 7.8 mmol/L (high), cholesterol 6.4 mmol/L (high), triglycerides 2.3 mmol/L (high). Pattern strongly suggests undiagnosed Type 2 diabetes with dyslipidaemia. Doctor should be alerted for clinical follow-up. If diagnosed, E11.9 + E78.5 should be added for chronic disease management billing.",
    suggestedICD10: [
      { code: "E11.9", description: "Type 2 diabetes mellitus without complications", confidence: 0.92 },
      { code: "E78.5", description: "Dyslipidaemia, unspecified", confidence: 0.88 },
      { code: "R73.0", description: "Abnormal glucose (if not yet formally diagnosed)", confidence: 0.95 },
    ],
    estimatedValue: 2400,
    actionRequired: true,
    autoResolvable: false,
    sourceMessageType: "ORU^R01",
    sourceMessageId: "MSG003",
  },
  {
    id: "adv-004",
    timestamp: new Date(now.getTime() - 30 * min).toISOString(),
    patientMRN: "MRN-9102",
    patientName: "Sarah Smith",
    encounterType: "Outpatient Visit",
    facility: "Medicross Sandton City",
    category: "eligibility",
    severity: "success",
    title: "GEMS Emerald — Eligibility Confirmed",
    description: "Outpatient visit for acute URTI (J06.9). GEMS Emerald plan benefits confirmed. GP consultation covered at 100% of scheme rate. No pre-authorization needed for this visit type. Claim can be auto-submitted.",
    suggestedICD10: [
      { code: "J06.9", description: "Acute upper respiratory infection, unspecified", confidence: 0.99 },
    ],
    estimatedValue: 650,
    actionRequired: false,
    autoResolvable: true,
    sourceMessageType: "ADT^A04",
    sourceMessageId: "MSG004",
  },
  {
    id: "adv-005",
    timestamp: new Date(now.getTime() - 15 * min).toISOString(),
    patientMRN: "MRN-6678",
    patientName: "Peter Williams",
    encounterType: "Radiology Order",
    facility: "Christiaan Barnard Memorial Hospital",
    category: "compliance",
    severity: "warning",
    title: "CT Brain — Pre-Authorization Check Required",
    description: "Stat CT Brain ordered by Dr Khan (Neurology). Most medical aid schemes require pre-authorization for CT scans. Patient insurance details not in this message — recommend checking scheme rules before scan. If patient is on Discovery, pre-auth is required for radiology above R3,000.",
    suggestedICD10: [],
    estimatedValue: 8500,
    actionRequired: true,
    autoResolvable: false,
    sourceMessageType: "ORM^O01",
    sourceMessageId: "MSG005",
  },
];

/** Pre-computed demo message log */
export const DEMO_MESSAGE_LOG: BridgeMessageLog[] = [
  { id: "log-001", receivedAt: new Date(now.getTime() - 3 * hour).toISOString(), messageType: "ADT^A01", facility: "Netcare Milpark Hospital", patientMRN: "MRN-4521", status: "advisory_generated", advisoryCount: 1, processingTimeMs: 145 },
  { id: "log-002", receivedAt: new Date(now.getTime() - 2.5 * hour).toISOString(), messageType: "ADT^A08", facility: "Netcare Milpark Hospital", patientMRN: "MRN-4521", status: "processed", advisoryCount: 0, processingTimeMs: 32 },
  { id: "log-003", receivedAt: new Date(now.getTime() - 1 * hour).toISOString(), messageType: "ADT^A03", facility: "Netcare Sunninghill Hospital", patientMRN: "MRN-7823", status: "advisory_generated", advisoryCount: 1, processingTimeMs: 189 },
  { id: "log-004", receivedAt: new Date(now.getTime() - 45 * min).toISOString(), messageType: "ORU^R01", facility: "Netcare Garden City Hospital", patientMRN: "MRN-3341", status: "advisory_generated", advisoryCount: 1, processingTimeMs: 267 },
  { id: "log-005", receivedAt: new Date(now.getTime() - 40 * min).toISOString(), messageType: "ADT^A01", facility: "Netcare Olivedale Hospital", patientMRN: "MRN-1190", status: "processed", advisoryCount: 0, processingTimeMs: 41 },
  { id: "log-006", receivedAt: new Date(now.getTime() - 35 * min).toISOString(), messageType: "ADT^A04", facility: "Medicross Sandton City", patientMRN: "MRN-9102", status: "advisory_generated", advisoryCount: 1, processingTimeMs: 98 },
  { id: "log-007", receivedAt: new Date(now.getTime() - 30 * min).toISOString(), messageType: "ADT^A01", facility: "Netcare Unitas Hospital", patientMRN: "MRN-5543", status: "processed", advisoryCount: 0, processingTimeMs: 38 },
  { id: "log-008", receivedAt: new Date(now.getTime() - 25 * min).toISOString(), messageType: "ORU^R01", facility: "Netcare N1 City Hospital", patientMRN: "MRN-8821", status: "processed", advisoryCount: 0, processingTimeMs: 55 },
  { id: "log-009", receivedAt: new Date(now.getTime() - 15 * min).toISOString(), messageType: "ORM^O01", facility: "Christiaan Barnard Memorial Hospital", patientMRN: "MRN-6678", status: "advisory_generated", advisoryCount: 1, processingTimeMs: 134 },
  { id: "log-010", receivedAt: new Date(now.getTime() - 5 * min).toISOString(), messageType: "ADT^A08", facility: "Netcare Sunninghill Hospital", patientMRN: "MRN-7823", status: "processed", advisoryCount: 0, processingTimeMs: 29 },
];

/** Demo connection status for CareOn bridge */
export function getDemoCareOnStatus() {
  return {
    connected: true,
    lastHeartbeat: new Date(now.getTime() - 30000).toISOString(),
    messagesReceived24h: 1247,
    messagesProcessed24h: 1243,
    advisoriesGenerated24h: 186,
    errorRate: 0.003,
    avgProcessingTimeMs: 87,
    facilities: [
      { name: "Netcare Milpark Hospital", code: "NETCARE_MILPARK", connected: true, lastMessage: new Date(now.getTime() - 3 * min).toISOString(), messageCount24h: 189 },
      { name: "Netcare Sunninghill Hospital", code: "NETCARE_SUNNINGHILL", connected: true, lastMessage: new Date(now.getTime() - 5 * min).toISOString(), messageCount24h: 156 },
      { name: "Christiaan Barnard Memorial Hospital", code: "NETCARE_CBMH", connected: true, lastMessage: new Date(now.getTime() - 15 * min).toISOString(), messageCount24h: 201 },
      { name: "Netcare Garden City Hospital", code: "NETCARE_GARDEN_CITY", connected: true, lastMessage: new Date(now.getTime() - 45 * min).toISOString(), messageCount24h: 98 },
      { name: "Netcare Olivedale Hospital", code: "NETCARE_OLIVEDALE", connected: true, lastMessage: new Date(now.getTime() - 40 * min).toISOString(), messageCount24h: 134 },
      { name: "Netcare Unitas Hospital", code: "NETCARE_UNITAS", connected: true, lastMessage: new Date(now.getTime() - 30 * min).toISOString(), messageCount24h: 112 },
      { name: "Netcare N1 City Hospital", code: "NETCARE_N1_CITY", connected: true, lastMessage: new Date(now.getTime() - 25 * min).toISOString(), messageCount24h: 145 },
      { name: "Medicross Sandton City", code: "NETCARE_MEDICROSS_SANDTON", connected: true, lastMessage: new Date(now.getTime() - 30 * min).toISOString(), messageCount24h: 67 },
      { name: "Netcare Akasia Hospital", code: "NETCARE_AKASIA", connected: false, lastMessage: new Date(now.getTime() - 4 * hour).toISOString(), messageCount24h: 78 },
      { name: "Netcare Waterfall City Hospital", code: "NETCARE_WATERFALL", connected: true, lastMessage: new Date(now.getTime() - 8 * min).toISOString(), messageCount24h: 67 },
    ],
  };
}
