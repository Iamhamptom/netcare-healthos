// Scheme Intelligence Database
// Deep profiles for each major SA medical scheme — acceptance benchmarks,
// rejection patterns, submission windows, pre-auth requirements, CDL handling,
// PMB interpretation, tariff rates, and contact details.
//
// Source context: CMS Annual Reports, scheme-specific claim processing guidelines,
// and observed rejection patterns in SA private healthcare billing.

import type { ValidationSeverity } from "./types";

// ─── TYPES ──────────────────────────────────────────────────────

export interface RejectionReason {
  rank: number;
  code: string;
  description: string;
  prevalence: number; // % of this scheme's rejections
  avgRandImpact: number;
  preventionTip: string;
}

export interface SubmissionWindow {
  standardDays: number;
  pmbDays: number;
  lateSubmissionAllowed: boolean;
  lateAppealWindowDays: number;
  electronicSubmissionCutoff: string; // e.g. "23:59 SAST"
  batchProcessingDays: string[]; // e.g. ["Monday", "Wednesday", "Friday"]
  averagePaymentDays: number; // typical turnaround
}

export interface PreAuthRequirement {
  category: string;
  icd10Prefixes: string[];
  tariffPrefixes: string[];
  method: "electronic" | "phone" | "fax" | "portal";
  turnaroundHours: number;
  notes: string;
}

export interface CDLHandling {
  requiresApplication: boolean;
  applicationMethod: string;
  approvalTurnaroundDays: number;
  renewalRequired: boolean;
  renewalIntervalMonths: number;
  formularyEnforced: boolean;
  maxDaysSupply: number;
  genericSubstitutionRequired: boolean;
  notes: string;
}

export interface PMBInterpretation {
  strictDSP: boolean;
  paymentBasis: "scheme_tariff" | "provider_tariff" | "nhrpl_100" | "nhrpl_negotiated";
  autoPMBCodes: string[];
  pmbDisputeProcess: string;
  emergencyPMBHandling: string;
  notes: string;
}

export interface TariffInfo {
  nhrplPercentage: number; // % of NHRPL the scheme pays
  consultationRate: number; // GP consultation rate in Rands
  specialistMultiplier: number; // multiplier on GP rate for specialist
  dispensingFeePolicy: string;
  coPaymentApplies: boolean;
  notes: string;
}

export interface SchemeContact {
  claimsPhone: string;
  claimsEmail: string;
  preAuthPhone: string;
  preAuthEmail: string;
  disputeEmail: string;
  brokerLine: string;
  website: string;
  portalUrl: string;
}

export interface SchemeIntelligenceProfile {
  name: string;
  code: string;
  cmsRegistrationNumber: string;
  administrator: string;
  totalLives: number; // approximate beneficiaries
  marketSharePercent: number;

  // Acceptance benchmarks
  acceptanceRate: number; // % of claims accepted first time
  cleanClaimRate: number; // % of claims with zero issues
  averageRejectionRate: number;
  appealSuccessRate: number; // % of appeals that overturn rejection

  // Top 10 rejection reasons
  topRejectionReasons: RejectionReason[];

  // Submission windows and deadlines
  submissionWindow: SubmissionWindow;

  // Pre-auth requirements
  preAuthRequirements: PreAuthRequirement[];

  // CDL handling
  cdlHandling: CDLHandling;

  // PMB interpretation
  pmbInterpretation: PMBInterpretation;

  // Tariff rates
  tariffInfo: TariffInfo;

  // Contact details
  contact: SchemeContact;
}

// ─── SCHEME PROFILES ────────────────────────────────────────────

const discoveryIntelligence: SchemeIntelligenceProfile = {
  name: "Discovery Health Medical Scheme",
  code: "DH",
  cmsRegistrationNumber: "1125",
  administrator: "Discovery Health (Pty) Ltd",
  totalLives: 3800000,
  marketSharePercent: 42.5,

  acceptanceRate: 87.2,
  cleanClaimRate: 72.1,
  averageRejectionRate: 12.8,
  appealSuccessRate: 34.5,

  topRejectionReasons: [
    { rank: 1, code: "RJ001", description: "Insufficient ICD-10 specificity (3-char code where 4th required)", prevalence: 18.2, avgRandImpact: 450, preventionTip: "Always code to 4th character minimum. Discovery is the strictest scheme on specificity." },
    { rank: 2, code: "RJ002", description: "No pre-authorization obtained", prevalence: 14.7, avgRandImpact: 8500, preventionTip: "Use HealthID portal for electronic pre-auth. Turnaround is 2-4 hours for elective procedures." },
    { rank: 3, code: "RJ003", description: "Claim submitted outside 120-day window", prevalence: 11.3, avgRandImpact: 1200, preventionTip: "Submit within 90 days as buffer. Set up auto-submission via practice management software." },
    { rank: 4, code: "RJ004", description: "Duplicate claim (same patient, same date, same tariff)", prevalence: 9.8, avgRandImpact: 650, preventionTip: "Check claim status before resubmitting. Discovery's portal shows real-time claim status." },
    { rank: 5, code: "RJ005", description: "Benefit exhausted / annual limit reached", prevalence: 8.4, avgRandImpact: 2100, preventionTip: "Check remaining benefits on Discovery app before service. Consider PMB override if applicable." },
    { rank: 6, code: "RJ006", description: "Missing external cause code for injury (S/T codes)", prevalence: 7.1, avgRandImpact: 780, preventionTip: "Always pair S/T injury codes with a V/W/X/Y external cause code." },
    { rank: 7, code: "RJ007", description: "Gender-diagnosis mismatch", prevalence: 5.9, avgRandImpact: 520, preventionTip: "Verify patient gender on file matches diagnosis. Common issue with prostate/gynae codes." },
    { rank: 8, code: "RJ008", description: "Member not registered / inactive membership", prevalence: 5.5, avgRandImpact: 1800, preventionTip: "Always verify membership status via real-time eligibility check before treatment." },
    { rank: 9, code: "RJ009", description: "Tariff unbundling violation", prevalence: 4.8, avgRandImpact: 3200, preventionTip: "Do not bill component procedures separately when a comprehensive tariff exists." },
    { rank: 10, code: "RJ010", description: "Service not covered on member's plan option", prevalence: 4.3, avgRandImpact: 1500, preventionTip: "Verify plan option (KeyCare vs Executive). Lower plans have restricted benefits." },
  ],

  submissionWindow: {
    standardDays: 120,
    pmbDays: 365,
    lateSubmissionAllowed: false,
    lateAppealWindowDays: 60,
    electronicSubmissionCutoff: "23:59 SAST",
    batchProcessingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    averagePaymentDays: 14,
  },

  preAuthRequirements: [
    { category: "Hospital admissions", icd10Prefixes: [], tariffPrefixes: ["0008", "0009", "0046"], method: "electronic", turnaroundHours: 4, notes: "All elective admissions require pre-auth via HealthID. Emergency admissions must be notified within 48 hours." },
    { category: "Advanced radiology", icd10Prefixes: [], tariffPrefixes: ["0078", "0008", "0009"], method: "electronic", turnaroundHours: 24, notes: "MRI, CT, PET scans require clinical motivation. GP referral needed for KeyCare members." },
    { category: "Oncology", icd10Prefixes: ["C", "D0", "D1", "D2", "D3", "D4", "Z51"], tariffPrefixes: ["0046"], method: "electronic", turnaroundHours: 48, notes: "All cancer treatment must be registered on Discovery's oncology programme." },
    { category: "Spinal surgery", icd10Prefixes: ["M50", "M51", "M47", "M54"], tariffPrefixes: ["0452", "0457"], method: "electronic", turnaroundHours: 72, notes: "Conservative treatment evidence required. Minimum 6 weeks physiotherapy before surgical auth." },
    { category: "Joint replacements", icd10Prefixes: ["M16", "M17"], tariffPrefixes: ["0520"], method: "electronic", turnaroundHours: 48, notes: "Functional assessment required. BMI considerations for joint replacement approval." },
    { category: "Organ transplants", icd10Prefixes: ["Z94"], tariffPrefixes: ["0191"], method: "phone", turnaroundHours: 72, notes: "Referred to Discovery's transplant benefit management programme." },
  ],

  cdlHandling: {
    requiresApplication: true,
    applicationMethod: "Electronic via HealthID or GP submission",
    approvalTurnaroundDays: 14,
    renewalRequired: true,
    renewalIntervalMonths: 12,
    formularyEnforced: true,
    maxDaysSupply: 30,
    genericSubstitutionRequired: true,
    notes: "Discovery enforces formulary strictly. Non-formulary chronic meds require clinical motivation and are often rejected. Generic substitution is mandatory unless contra-indicated. CDL application can be submitted electronically with ICD-10 codes and recent pathology.",
  },

  pmbInterpretation: {
    strictDSP: true,
    paymentBasis: "scheme_tariff",
    autoPMBCodes: ["I21", "I60", "I61", "I62", "I63", "J45", "E10", "E11", "B20"],
    pmbDisputeProcess: "Submit via Discovery app > Claims > Dispute. Escalate to CMS if unresolved after 30 days.",
    emergencyPMBHandling: "Emergency PMB claims are paid regardless of network, but at scheme tariff. Member must notify within 48 hours of admission.",
    notes: "Discovery applies DSP rules strictly. KeyCare members outside DSP network get paid at scheme tariff only — significant shortfall risk. PMB conditions treated outside DSP will be reimbursed but provider must accept scheme rate.",
  },

  tariffInfo: {
    nhrplPercentage: 100,
    consultationRate: 520,
    specialistMultiplier: 1.8,
    dispensingFeePolicy: "SEP + regulated dispensing fee. Formulary pricing for chronic meds.",
    coPaymentApplies: true,
    notes: "Discovery pays 100% of NHRPL for in-network claims. Out-of-network claims paid at scheme tariff (often 70-80% of provider rate). Co-payments apply on certain plans for non-DSP usage.",
  },

  contact: {
    claimsPhone: "0860 99 88 77",
    claimsEmail: "claims@discovery.co.za",
    preAuthPhone: "0860 99 88 77 (option 2)",
    preAuthEmail: "preauth@discovery.co.za",
    disputeEmail: "disputes@discovery.co.za",
    brokerLine: "0860 00 46 47",
    website: "https://www.discovery.co.za",
    portalUrl: "https://healthid.discovery.co.za",
  },
};

const gemsIntelligence: SchemeIntelligenceProfile = {
  name: "Government Employees Medical Scheme",
  code: "GEMS",
  cmsRegistrationNumber: "1201",
  administrator: "Metropolitan Health (GEMS Administrator)",
  totalLives: 1700000,
  marketSharePercent: 19.0,

  acceptanceRate: 83.5,
  cleanClaimRate: 67.8,
  averageRejectionRate: 16.5,
  appealSuccessRate: 28.7,

  topRejectionReasons: [
    { rank: 1, code: "RJ001", description: "Insufficient ICD-10 specificity", prevalence: 19.5, avgRandImpact: 380, preventionTip: "GEMS is extremely strict on specificity. Code to 5th character where possible." },
    { rank: 2, code: "RJ011", description: "Service outside DSP network (Sapphire/Beryl)", prevalence: 15.2, avgRandImpact: 2400, preventionTip: "Verify member option. Sapphire/Beryl must use state facilities or GEMS DSP." },
    { rank: 3, code: "RJ002", description: "No pre-authorization obtained", prevalence: 12.8, avgRandImpact: 7200, preventionTip: "GEMS requires pre-auth for most elective procedures. Use Metropolitan's portal." },
    { rank: 4, code: "RJ012", description: "Maternity not registered by 14 weeks", prevalence: 9.6, avgRandImpact: 15000, preventionTip: "Register all pregnancies within 14 weeks gestation. Late registration reduces benefits." },
    { rank: 5, code: "RJ003", description: "Claim outside submission window", prevalence: 8.9, avgRandImpact: 950, preventionTip: "Submit within 90 days as safety margin. GEMS strictly enforces the 120-day window." },
    { rank: 6, code: "RJ006", description: "Missing external cause code for injuries", prevalence: 7.4, avgRandImpact: 620, preventionTip: "Always include V/W/X/Y external cause code with S/T injury diagnoses." },
    { rank: 7, code: "RJ013", description: "Chronic medication exceeds 28-day supply", prevalence: 6.8, avgRandImpact: 340, preventionTip: "GEMS uses 28-day supply limit, not 30. Dispense for 28 days exactly." },
    { rank: 8, code: "RJ004", description: "Duplicate claim submission", prevalence: 5.7, avgRandImpact: 480, preventionTip: "Check claim status on GEMS portal before resubmitting." },
    { rank: 9, code: "RJ007", description: "Gender-diagnosis mismatch", prevalence: 4.9, avgRandImpact: 410, preventionTip: "Cross-check patient gender with diagnosis code gender restrictions." },
    { rank: 10, code: "RJ014", description: "Incorrect dependent code / beneficiary not on plan", prevalence: 4.2, avgRandImpact: 750, preventionTip: "Verify dependent status and code. Government employees must have dependents registered." },
  ],

  submissionWindow: {
    standardDays: 120,
    pmbDays: 365,
    lateSubmissionAllowed: false,
    lateAppealWindowDays: 30,
    electronicSubmissionCutoff: "23:59 SAST",
    batchProcessingDays: ["Monday", "Wednesday", "Friday"],
    averagePaymentDays: 21,
  },

  preAuthRequirements: [
    { category: "Hospital admissions", icd10Prefixes: [], tariffPrefixes: ["0008", "0009"], method: "phone", turnaroundHours: 8, notes: "Emergency admissions: notify within 24 hours. Elective: pre-auth required 72 hours before." },
    { category: "Advanced radiology", icd10Prefixes: [], tariffPrefixes: ["0078", "0008", "0009"], method: "phone", turnaroundHours: 48, notes: "MRI/CT require GP referral letter and clinical motivation." },
    { category: "Dental prosthetics", icd10Prefixes: ["K00"], tariffPrefixes: ["0069"], method: "fax", turnaroundHours: 72, notes: "Submit X-rays and treatment plan. Only certain prosthetics covered per option." },
    { category: "Spinal surgery", icd10Prefixes: ["M50", "M51", "M47"], tariffPrefixes: ["0452"], method: "phone", turnaroundHours: 96, notes: "Conservative treatment evidence mandatory. Second opinion may be required." },
    { category: "Sterilisation", icd10Prefixes: ["Z30"], tariffPrefixes: [], method: "phone", turnaroundHours: 48, notes: "Counselling documentation required. Cooling-off period applies." },
    { category: "Organ transplants", icd10Prefixes: ["Z94"], tariffPrefixes: ["0191"], method: "phone", turnaroundHours: 96, notes: "Managed through GEMS transplant programme. State facility preferred." },
  ],

  cdlHandling: {
    requiresApplication: true,
    applicationMethod: "Fax or post via Metropolitan Health administrator",
    approvalTurnaroundDays: 21,
    renewalRequired: true,
    renewalIntervalMonths: 12,
    formularyEnforced: true,
    maxDaysSupply: 28,
    genericSubstitutionRequired: true,
    notes: "GEMS uses a 28-day supply limit, not the industry-standard 30 days. Formulary is strictly enforced — non-formulary chronic meds almost always rejected. CDL applications are processed by Metropolitan Health and can take up to 3 weeks.",
  },

  pmbInterpretation: {
    strictDSP: true,
    paymentBasis: "scheme_tariff",
    autoPMBCodes: ["I21", "I60", "I61", "I62", "I63", "J45", "E10", "E11", "B20", "O"],
    pmbDisputeProcess: "Write to GEMS Disputes department. Escalate to CMS ombudsman after 30 days.",
    emergencyPMBHandling: "Emergency PMB at any facility, but notification required within 24 hours. State facility transfer as soon as stable.",
    notes: "GEMS enforces DSP strictly for lower options. Sapphire and Beryl members must use state facilities as primary DSP. Ruby and Emerald have broader private network access. PMB outside DSP paid at GEMS tariff only.",
  },

  tariffInfo: {
    nhrplPercentage: 90,
    consultationRate: 430,
    specialistMultiplier: 1.6,
    dispensingFeePolicy: "SEP + capped dispensing fee. Strict formulary pricing.",
    coPaymentApplies: true,
    notes: "GEMS pays approximately 90% of NHRPL. Lower options (Sapphire/Beryl) have significant co-payments for private providers. Ruby/Emerald pay closer to 100% NHRPL.",
  },

  contact: {
    claimsPhone: "0860 00 4367",
    claimsEmail: "claims@gems.gov.za",
    preAuthPhone: "0860 00 4367 (option 3)",
    preAuthEmail: "preauth@gems.gov.za",
    disputeEmail: "disputes@gems.gov.za",
    brokerLine: "0860 00 4367 (option 5)",
    website: "https://www.gems.gov.za",
    portalUrl: "https://www.gems.gov.za/members",
  },
};

const bonitasIntelligence: SchemeIntelligenceProfile = {
  name: "Bonitas Medical Fund",
  code: "BON",
  cmsRegistrationNumber: "1310",
  administrator: "Medscheme (Pty) Ltd",
  totalLives: 680000,
  marketSharePercent: 7.6,

  acceptanceRate: 85.1,
  cleanClaimRate: 69.5,
  averageRejectionRate: 14.9,
  appealSuccessRate: 31.2,

  topRejectionReasons: [
    { rank: 1, code: "RJ002", description: "No pre-authorization (Medscheme clinical review)", prevalence: 16.8, avgRandImpact: 6800, preventionTip: "Bonitas uses Medscheme clinical review for all pre-auths. Submit via Medscheme portal." },
    { rank: 2, code: "RJ001", description: "ICD-10 specificity insufficient", prevalence: 14.1, avgRandImpact: 390, preventionTip: "Moderate specificity requirements but still rejects 3-char codes frequently." },
    { rank: 3, code: "RJ015", description: "BonCap/BonEssential network violation", prevalence: 12.4, avgRandImpact: 1900, preventionTip: "BonCap members are in a capitation network. Verify network status before treatment." },
    { rank: 4, code: "RJ005", description: "Benefit exhausted / sub-limit reached", prevalence: 10.2, avgRandImpact: 1700, preventionTip: "Check remaining benefits via Medscheme portal. Consider PMB if applicable." },
    { rank: 5, code: "RJ003", description: "Late claim submission", prevalence: 8.7, avgRandImpact: 880, preventionTip: "Bonitas PMB window is 180 days (shorter than others). Standard is 120 days." },
    { rank: 6, code: "RJ009", description: "Tariff unbundling / billing irregularity", prevalence: 7.5, avgRandImpact: 2800, preventionTip: "Medscheme actively monitors for unbundling patterns. Use comprehensive tariffs." },
    { rank: 7, code: "RJ006", description: "Missing external cause code", prevalence: 6.9, avgRandImpact: 590, preventionTip: "Required for all S/T injury codes. V/W/X/Y cause code mandatory." },
    { rank: 8, code: "RJ004", description: "Duplicate claim", prevalence: 5.8, avgRandImpact: 420, preventionTip: "Medscheme deduplication is aggressive. Wait for rejection confirmation before resubmitting." },
    { rank: 9, code: "RJ016", description: "Clinical review — insufficient motivation", prevalence: 5.1, avgRandImpact: 4500, preventionTip: "High-value claims (>R5,000) go through clinical review. Submit detailed motivation upfront." },
    { rank: 10, code: "RJ007", description: "Gender-diagnosis mismatch", prevalence: 4.5, avgRandImpact: 360, preventionTip: "Standard gender cross-check. Verify patient file." },
  ],

  submissionWindow: {
    standardDays: 120,
    pmbDays: 180,
    lateSubmissionAllowed: false,
    lateAppealWindowDays: 30,
    electronicSubmissionCutoff: "23:59 SAST",
    batchProcessingDays: ["Monday", "Wednesday", "Friday"],
    averagePaymentDays: 18,
  },

  preAuthRequirements: [
    { category: "Hospital admissions", icd10Prefixes: [], tariffPrefixes: ["0008", "0009"], method: "electronic", turnaroundHours: 8, notes: "Via Medscheme clinical review platform. Emergency notification within 48 hours." },
    { category: "Advanced radiology", icd10Prefixes: [], tariffPrefixes: ["0078", "0008", "0009"], method: "electronic", turnaroundHours: 24, notes: "GP referral and clinical motivation required." },
    { category: "Spinal procedures", icd10Prefixes: ["M54", "M50", "M51"], tariffPrefixes: ["0452"], method: "electronic", turnaroundHours: 72, notes: "Medscheme managed care protocol applies. Conservative treatment evidence required." },
    { category: "Implants", icd10Prefixes: [], tariffPrefixes: ["0401"], method: "electronic", turnaroundHours: 48, notes: "Implant quotes and clinical motivation required." },
    { category: "Oncology", icd10Prefixes: ["C", "Z51"], tariffPrefixes: [], method: "electronic", turnaroundHours: 48, notes: "Managed through Medscheme oncology programme." },
  ],

  cdlHandling: {
    requiresApplication: true,
    applicationMethod: "Electronic via Medscheme portal or fax",
    approvalTurnaroundDays: 14,
    renewalRequired: true,
    renewalIntervalMonths: 12,
    formularyEnforced: true,
    maxDaysSupply: 30,
    genericSubstitutionRequired: true,
    notes: "Medscheme processes all CDL applications. Formulary strictly enforced. Non-formulary requests require clinical motivation and are approved case-by-case. 30-day supply standard.",
  },

  pmbInterpretation: {
    strictDSP: false,
    paymentBasis: "scheme_tariff",
    autoPMBCodes: ["I21", "I60", "I61", "I62", "I63", "J45", "E10", "E11", "B20"],
    pmbDisputeProcess: "Submit dispute via Medscheme portal. Escalate to Bonitas Principal Officer, then CMS.",
    emergencyPMBHandling: "Emergency PMB at any facility. Notification within 48 hours. Transfer to network facility when stable.",
    notes: "Bonitas has moderate DSP enforcement. BonCap is strict (capitation), while BonComplete offers broader access. PMB claims paid at 100% scheme tariff. PMB window is only 180 days — shorter than most schemes.",
  },

  tariffInfo: {
    nhrplPercentage: 95,
    consultationRate: 470,
    specialistMultiplier: 1.7,
    dispensingFeePolicy: "SEP + standard dispensing fee. Formulary pricing for chronic.",
    coPaymentApplies: true,
    notes: "Bonitas pays approximately 95% of NHRPL for comprehensive options. BonCap uses capitation rates. Co-payments apply for non-network usage on restricted plans.",
  },

  contact: {
    claimsPhone: "0860 002 108",
    claimsEmail: "claims@bonitas.co.za",
    preAuthPhone: "0860 002 108 (option 2)",
    preAuthEmail: "preauth@bonitas.co.za",
    disputeEmail: "disputes@bonitas.co.za",
    brokerLine: "0860 002 108 (option 4)",
    website: "https://www.bonitas.co.za",
    portalUrl: "https://www.bonitas.co.za/member-portal",
  },
};

const medshieldIntelligence: SchemeIntelligenceProfile = {
  name: "Medshield Medical Scheme",
  code: "MS",
  cmsRegistrationNumber: "1151",
  administrator: "Medshield Medical Scheme (self-administered)",
  totalLives: 310000,
  marketSharePercent: 3.5,

  acceptanceRate: 86.3,
  cleanClaimRate: 71.2,
  averageRejectionRate: 13.7,
  appealSuccessRate: 36.8,

  topRejectionReasons: [
    { rank: 1, code: "RJ006", description: "Missing external cause code (ECC strict enforcement)", prevalence: 17.8, avgRandImpact: 650, preventionTip: "Medshield is known for strict ECC enforcement. Always include external cause codes for injuries." },
    { rank: 2, code: "RJ001", description: "ICD-10 specificity insufficient", prevalence: 13.2, avgRandImpact: 350, preventionTip: "Moderate requirements but code to 4th character as standard practice." },
    { rank: 3, code: "RJ002", description: "No pre-authorization", prevalence: 11.5, avgRandImpact: 5800, preventionTip: "Medshield processes pre-auths internally. Call claims line directly." },
    { rank: 4, code: "RJ005", description: "Annual dental benefit limit exceeded", prevalence: 10.8, avgRandImpact: 2200, preventionTip: "Medshield has strict dental limits per option. Check remaining dental benefits first." },
    { rank: 5, code: "RJ017", description: "Cataract surgery without IOL specification pre-auth", prevalence: 8.4, avgRandImpact: 12000, preventionTip: "Submit pre-auth with visual acuity readings AND IOL make/model before surgery." },
    { rank: 6, code: "RJ003", description: "Late claim submission", prevalence: 7.9, avgRandImpact: 750, preventionTip: "Submit within 90 days. Medshield processes quickly (14 days) so no need to delay." },
    { rank: 7, code: "RJ004", description: "Duplicate claim", prevalence: 6.5, avgRandImpact: 400, preventionTip: "Wait for claim status before resubmitting. Medshield has fast turnaround." },
    { rank: 8, code: "RJ018", description: "MediPhila network violation", prevalence: 6.1, avgRandImpact: 1400, preventionTip: "MediPhila (lowest option) has strict GP network. Verify member option." },
    { rank: 9, code: "RJ009", description: "Tariff unbundling", prevalence: 5.4, avgRandImpact: 2100, preventionTip: "Use comprehensive tariffs rather than billing components separately." },
    { rank: 10, code: "RJ008", description: "Inactive membership / member not found", prevalence: 4.4, avgRandImpact: 950, preventionTip: "Real-time eligibility check before treatment. Medshield supports electronic verification." },
  ],

  submissionWindow: {
    standardDays: 120,
    pmbDays: 365,
    lateSubmissionAllowed: false,
    lateAppealWindowDays: 30,
    electronicSubmissionCutoff: "23:59 SAST",
    batchProcessingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    averagePaymentDays: 14,
  },

  preAuthRequirements: [
    { category: "Hospital admissions", icd10Prefixes: [], tariffPrefixes: ["0008", "0009"], method: "phone", turnaroundHours: 8, notes: "Self-administered — call Medshield directly. Emergency notification within 48 hours." },
    { category: "Cataract surgery", icd10Prefixes: ["H25", "H26"], tariffPrefixes: [], method: "phone", turnaroundHours: 48, notes: "Visual acuity readings and IOL specifications mandatory with pre-auth request." },
    { category: "Dental prosthetics", icd10Prefixes: ["K00"], tariffPrefixes: ["0069"], method: "fax", turnaroundHours: 72, notes: "X-rays and detailed treatment plan required. Annual limits apply." },
    { category: "Spinal surgery", icd10Prefixes: ["M50", "M51"], tariffPrefixes: ["0452"], method: "phone", turnaroundHours: 72, notes: "Conservative treatment evidence. Second opinion may be requested." },
    { category: "Renal dialysis", icd10Prefixes: ["N17", "N18"], tariffPrefixes: [], method: "phone", turnaroundHours: 48, notes: "Ongoing authorization with clinical reviews every 6 months." },
  ],

  cdlHandling: {
    requiresApplication: true,
    applicationMethod: "Post or fax directly to Medshield",
    approvalTurnaroundDays: 14,
    renewalRequired: true,
    renewalIntervalMonths: 12,
    formularyEnforced: false,
    maxDaysSupply: 30,
    genericSubstitutionRequired: false,
    notes: "Medshield is more lenient on formulary than Discovery or GEMS. Non-formulary chronic meds are sometimes approved without extensive motivation. Generic substitution encouraged but not mandatory. Self-administered so decisions are faster.",
  },

  pmbInterpretation: {
    strictDSP: false,
    paymentBasis: "scheme_tariff",
    autoPMBCodes: ["I21", "I60", "I61", "I62", "I63", "J45", "E10", "E11", "B20"],
    pmbDisputeProcess: "Submit to Medshield Principal Officer. Direct escalation to scheme ombudsman available.",
    emergencyPMBHandling: "Emergency PMB at any facility. Notification within 48 hours. Medshield is generally flexible on emergency PMB.",
    notes: "Medshield has moderate DSP enforcement. MediPhila has GP network restrictions, but other options have broad access. Self-administered so disputes are resolved faster. PMB claims processed within standard timeframes.",
  },

  tariffInfo: {
    nhrplPercentage: 95,
    consultationRate: 460,
    specialistMultiplier: 1.7,
    dispensingFeePolicy: "SEP + standard dispensing fee. Lenient on non-formulary chronic.",
    coPaymentApplies: false,
    notes: "Medshield pays approximately 95% of NHRPL. Generally no co-payments on comprehensive options. MediPhila has co-payments for out-of-network usage. Fastest claims processing in SA (average 14 days).",
  },

  contact: {
    claimsPhone: "0860 100 078",
    claimsEmail: "claims@medshield.co.za",
    preAuthPhone: "0860 100 078 (option 2)",
    preAuthEmail: "preauth@medshield.co.za",
    disputeEmail: "disputes@medshield.co.za",
    brokerLine: "0860 100 078 (option 3)",
    website: "https://www.medshield.co.za",
    portalUrl: "https://www.medshield.co.za/member-zone",
  },
};

const momentumIntelligence: SchemeIntelligenceProfile = {
  name: "Momentum Health Medical Scheme",
  code: "MH",
  cmsRegistrationNumber: "1124",
  administrator: "Momentum Health Solutions (MMI Group)",
  totalLives: 420000,
  marketSharePercent: 4.7,

  acceptanceRate: 84.8,
  cleanClaimRate: 68.3,
  averageRejectionRate: 15.2,
  appealSuccessRate: 30.1,

  topRejectionReasons: [
    { rank: 1, code: "RJ001", description: "Insufficient ICD-10 specificity (strict enforcement)", prevalence: 17.9, avgRandImpact: 420, preventionTip: "Momentum is strict on specificity — always code to 4th character minimum, 5th where available." },
    { rank: 2, code: "RJ002", description: "No pre-authorization (Ingwe managed care)", prevalence: 15.3, avgRandImpact: 7800, preventionTip: "Momentum uses Ingwe as managed care partner. Pre-auth through Ingwe portal or phone." },
    { rank: 3, code: "RJ019", description: "Follow-up visit within 3-day bundling window", prevalence: 11.7, avgRandImpact: 520, preventionTip: "Momentum bundles follow-up visits within 3 days. Use follow-up tariff codes instead." },
    { rank: 4, code: "RJ020", description: "Oncology not registered on managed care programme", prevalence: 8.9, avgRandImpact: 18000, preventionTip: "ALL cancer treatment must be registered on Momentum's oncology programme before claims." },
    { rank: 5, code: "RJ005", description: "Benefit limit reached", prevalence: 8.2, avgRandImpact: 1900, preventionTip: "Check benefits on Momentum app. Evolve/Custom/Summit have different limits." },
    { rank: 6, code: "RJ006", description: "Missing external cause code", prevalence: 7.1, avgRandImpact: 580, preventionTip: "Standard ECC requirement for S/T codes." },
    { rank: 7, code: "RJ021", description: "Substance abuse rehab without pre-auth", prevalence: 5.9, avgRandImpact: 25000, preventionTip: "All rehab admissions require Ingwe pre-auth. Treatment plan and motivation letter mandatory." },
    { rank: 8, code: "RJ003", description: "Late claim submission", prevalence: 5.4, avgRandImpact: 820, preventionTip: "120-day window strictly enforced. Submit early." },
    { rank: 9, code: "RJ007", description: "Gender-diagnosis mismatch", prevalence: 4.8, avgRandImpact: 380, preventionTip: "Standard gender cross-check. Both gender and age checks are enabled." },
    { rank: 10, code: "RJ004", description: "Duplicate claim", prevalence: 4.6, avgRandImpact: 440, preventionTip: "Check claim status before resubmitting." },
  ],

  submissionWindow: {
    standardDays: 120,
    pmbDays: 365,
    lateSubmissionAllowed: false,
    lateAppealWindowDays: 30,
    electronicSubmissionCutoff: "23:59 SAST",
    batchProcessingDays: ["Monday", "Wednesday", "Friday"],
    averagePaymentDays: 18,
  },

  preAuthRequirements: [
    { category: "Hospital admissions", icd10Prefixes: [], tariffPrefixes: ["0008", "0009"], method: "electronic", turnaroundHours: 8, notes: "Via Ingwe managed care. Emergency notification within 48 hours." },
    { category: "Oncology", icd10Prefixes: ["C", "D0", "D1", "D2", "D3", "D4", "Z51"], tariffPrefixes: ["0046"], method: "electronic", turnaroundHours: 48, notes: "Must register on Momentum oncology programme. Treatment protocol approval required." },
    { category: "Substance abuse rehabilitation", icd10Prefixes: ["F10", "F11", "F12", "F13", "F14", "F15", "F19"], tariffPrefixes: [], method: "phone", turnaroundHours: 24, notes: "Ingwe pre-auth mandatory. Treatment plan, motivation letter, and assessment required." },
    { category: "Spinal surgery", icd10Prefixes: ["M50", "M51", "M47"], tariffPrefixes: ["0452"], method: "electronic", turnaroundHours: 72, notes: "Conservative treatment evidence required. Managed care protocol applies." },
    { category: "Advanced radiology", icd10Prefixes: [], tariffPrefixes: ["0078", "0008", "0009"], method: "electronic", turnaroundHours: 24, notes: "GP referral and clinical motivation required." },
    { category: "Cataracts", icd10Prefixes: ["H25"], tariffPrefixes: [], method: "electronic", turnaroundHours: 48, notes: "Visual acuity readings required. IOL selection pre-approved." },
  ],

  cdlHandling: {
    requiresApplication: true,
    applicationMethod: "Electronic via Momentum portal or Ingwe",
    approvalTurnaroundDays: 14,
    renewalRequired: true,
    renewalIntervalMonths: 12,
    formularyEnforced: true,
    maxDaysSupply: 30,
    genericSubstitutionRequired: true,
    notes: "Momentum enforces formulary strictly. CDL applications processed via Ingwe managed care. Generic substitution mandatory. Non-formulary chronic meds require detailed clinical motivation and are frequently rejected on first attempt.",
  },

  pmbInterpretation: {
    strictDSP: true,
    paymentBasis: "scheme_tariff",
    autoPMBCodes: ["I21", "I60", "I61", "I62", "I63", "J45", "E10", "E11", "B20", "C"],
    pmbDisputeProcess: "Submit through Momentum member portal. Escalate to Principal Officer, then CMS.",
    emergencyPMBHandling: "Emergency PMB at any facility. Notification within 48 hours via Ingwe.",
    notes: "Momentum applies DSP rules strictly. Evolve option members have limited network. Summit and Custom have broader access. Oncology C-codes are auto-flagged for managed care review regardless of plan option.",
  },

  tariffInfo: {
    nhrplPercentage: 95,
    consultationRate: 480,
    specialistMultiplier: 1.75,
    dispensingFeePolicy: "SEP + regulated dispensing fee. Strict formulary pricing for chronic.",
    coPaymentApplies: true,
    notes: "Momentum pays approximately 95% of NHRPL for comprehensive options. Evolve has co-payments for out-of-network. Multiply wellness benefits are separate from medical scheme benefits.",
  },

  contact: {
    claimsPhone: "0860 11 78 59",
    claimsEmail: "claims@momentumhealth.co.za",
    preAuthPhone: "0860 11 78 59 (option 2)",
    preAuthEmail: "preauth@momentumhealth.co.za",
    disputeEmail: "disputes@momentumhealth.co.za",
    brokerLine: "0860 11 78 59 (option 4)",
    website: "https://www.momentumhealth.co.za",
    portalUrl: "https://www.momentumhealth.co.za/member",
  },
};

const bestmedIntelligence: SchemeIntelligenceProfile = {
  name: "Bestmed Medical Scheme",
  code: "BM",
  cmsRegistrationNumber: "1192",
  administrator: "Bestmed Medical Scheme (self-administered)",
  totalLives: 200000,
  marketSharePercent: 2.2,

  acceptanceRate: 88.7,
  cleanClaimRate: 74.5,
  averageRejectionRate: 11.3,
  appealSuccessRate: 41.2,

  topRejectionReasons: [
    { rank: 1, code: "RJ001", description: "ICD-10 specificity insufficient", prevalence: 15.4, avgRandImpact: 340, preventionTip: "Moderate requirements. Code to 4th character as standard practice." },
    { rank: 2, code: "RJ002", description: "No pre-authorization", prevalence: 13.2, avgRandImpact: 5200, preventionTip: "Bestmed processes pre-auths internally. Call directly for fast turnaround." },
    { rank: 3, code: "RJ006", description: "Missing external cause code", prevalence: 10.8, avgRandImpact: 540, preventionTip: "Standard ECC requirement for S/T injury codes." },
    { rank: 4, code: "RJ022", description: "Pace option network violation", prevalence: 9.6, avgRandImpact: 1600, preventionTip: "Pace members must use Bestmed's contracted network. Verify option before treatment." },
    { rank: 5, code: "RJ003", description: "Late claim submission", prevalence: 8.3, avgRandImpact: 680, preventionTip: "120-day window. Bestmed has fast processing (7-10 days) so submit early." },
    { rank: 6, code: "RJ023", description: "Renal dialysis authorization expired", prevalence: 7.1, avgRandImpact: 8500, preventionTip: "Dialysis requires quarterly clinical review and ongoing authorization renewal." },
    { rank: 7, code: "RJ005", description: "Benefit limit reached", prevalence: 6.8, avgRandImpact: 1400, preventionTip: "Check benefits via Bestmed portal. Beat options have higher limits than Pace/Tempo." },
    { rank: 8, code: "RJ004", description: "Duplicate claim", prevalence: 5.7, avgRandImpact: 380, preventionTip: "Bestmed's fast processing means duplicates are caught quickly. Check status first." },
    { rank: 9, code: "RJ007", description: "Gender-diagnosis mismatch", prevalence: 4.9, avgRandImpact: 320, preventionTip: "Standard gender and age cross-checks enabled." },
    { rank: 10, code: "RJ009", description: "Tariff unbundling", prevalence: 4.2, avgRandImpact: 1800, preventionTip: "Use comprehensive tariffs. Bestmed's audit system flags common unbundling patterns." },
  ],

  submissionWindow: {
    standardDays: 120,
    pmbDays: 365,
    lateSubmissionAllowed: false,
    lateAppealWindowDays: 30,
    electronicSubmissionCutoff: "23:59 SAST",
    batchProcessingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    averagePaymentDays: 10,
  },

  preAuthRequirements: [
    { category: "Hospital admissions", icd10Prefixes: [], tariffPrefixes: ["0008", "0009"], method: "phone", turnaroundHours: 4, notes: "Self-administered — fast turnaround. Emergency notification within 48 hours." },
    { category: "Advanced radiology", icd10Prefixes: [], tariffPrefixes: ["0078", "0008", "0009"], method: "phone", turnaroundHours: 24, notes: "GP referral for non-specialists. Clinical motivation required." },
    { category: "Cataracts", icd10Prefixes: ["H25"], tariffPrefixes: [], method: "phone", turnaroundHours: 48, notes: "Visual acuity and IOL specification required." },
    { category: "Renal dialysis", icd10Prefixes: ["N17", "N18"], tariffPrefixes: [], method: "phone", turnaroundHours: 48, notes: "Initial authorization plus quarterly clinical reviews. GFR reports required." },
    { category: "Dental prosthetics", icd10Prefixes: [], tariffPrefixes: ["0069"], method: "fax", turnaroundHours: 72, notes: "X-rays and treatment plan required." },
    { category: "Spinal surgery", icd10Prefixes: ["M50", "M51"], tariffPrefixes: ["0452"], method: "phone", turnaroundHours: 72, notes: "Conservative treatment evidence. 6-week physio minimum." },
  ],

  cdlHandling: {
    requiresApplication: true,
    applicationMethod: "Electronic via Bestmed portal or post",
    approvalTurnaroundDays: 10,
    renewalRequired: true,
    renewalIntervalMonths: 12,
    formularyEnforced: false,
    maxDaysSupply: 30,
    genericSubstitutionRequired: false,
    notes: "Bestmed is the most lenient on formulary and chronic medication. Non-formulary meds are frequently approved with minimal motivation. Generic substitution encouraged but not enforced. Self-administered so CDL application turnaround is fast (7-10 days).",
  },

  pmbInterpretation: {
    strictDSP: false,
    paymentBasis: "nhrpl_100",
    autoPMBCodes: ["I21", "I60", "I61", "I62", "I63", "J45", "E10", "E11", "B20", "O", "C"],
    pmbDisputeProcess: "Submit to Bestmed Principal Officer directly. Fast resolution (typically 14 days).",
    emergencyPMBHandling: "Emergency PMB auto-approved at any facility. Notification within 48 hours. Bestmed is generally flexible.",
    notes: "Bestmed auto-approves most PMB claims at point of service. This is provider-friendly — fewer rejections on PMB conditions. Pace option has some network restrictions but Beat options have open access. Bestmed pays PMB at 100% NHRPL.",
  },

  tariffInfo: {
    nhrplPercentage: 100,
    consultationRate: 500,
    specialistMultiplier: 1.8,
    dispensingFeePolicy: "SEP + standard dispensing fee. Lenient on non-formulary.",
    coPaymentApplies: false,
    notes: "Bestmed pays 100% of NHRPL for Beat options. Pace options have some co-payments. No co-payments on comprehensive plans. Fastest claims processing in the industry (7-10 business days).",
  },

  contact: {
    claimsPhone: "0860 00 22 78",
    claimsEmail: "claims@bestmed.co.za",
    preAuthPhone: "0860 00 22 78 (option 2)",
    preAuthEmail: "preauth@bestmed.co.za",
    disputeEmail: "disputes@bestmed.co.za",
    brokerLine: "0860 00 22 78 (option 3)",
    website: "https://www.bestmed.co.za",
    portalUrl: "https://www.bestmed.co.za/member-portal",
  },
};

const defaultIntelligence: SchemeIntelligenceProfile = {
  name: "Generic / Default Scheme Rules",
  code: "DEFAULT",
  cmsRegistrationNumber: "N/A",
  administrator: "N/A — CMS baseline rules",
  totalLives: 0,
  marketSharePercent: 0,

  acceptanceRate: 85.0,
  cleanClaimRate: 70.0,
  averageRejectionRate: 15.0,
  appealSuccessRate: 33.0,

  topRejectionReasons: [
    { rank: 1, code: "RJ001", description: "Insufficient ICD-10 specificity", prevalence: 16.5, avgRandImpact: 400, preventionTip: "Always code to 4th character minimum. 5th character where available." },
    { rank: 2, code: "RJ002", description: "No pre-authorization for elective procedures", prevalence: 14.0, avgRandImpact: 6500, preventionTip: "Always obtain pre-auth for hospital admissions and advanced procedures." },
    { rank: 3, code: "RJ003", description: "Claim submitted outside submission window", prevalence: 10.5, avgRandImpact: 900, preventionTip: "Submit within 90 days as buffer against the 120-day deadline." },
    { rank: 4, code: "RJ006", description: "Missing external cause code for injuries", prevalence: 9.0, avgRandImpact: 600, preventionTip: "Pair S/T injury codes with V/W/X/Y external cause codes." },
    { rank: 5, code: "RJ005", description: "Benefit exhausted / annual limit reached", prevalence: 8.5, avgRandImpact: 1800, preventionTip: "Verify remaining benefits before service. Check PMB applicability." },
    { rank: 6, code: "RJ004", description: "Duplicate claim", prevalence: 7.0, avgRandImpact: 450, preventionTip: "Check claim status before resubmitting. Allow processing time." },
    { rank: 7, code: "RJ007", description: "Gender-diagnosis mismatch", prevalence: 5.5, avgRandImpact: 400, preventionTip: "Verify patient gender matches diagnosis code gender restrictions." },
    { rank: 8, code: "RJ009", description: "Tariff unbundling", prevalence: 5.0, avgRandImpact: 2500, preventionTip: "Use comprehensive tariffs instead of billing components separately." },
    { rank: 9, code: "RJ008", description: "Member not registered / inactive", prevalence: 4.5, avgRandImpact: 1200, preventionTip: "Perform real-time eligibility check before treatment." },
    { rank: 10, code: "RJ024", description: "Missing tariff or NAPPI code", prevalence: 4.0, avgRandImpact: 350, preventionTip: "Always include a valid NHRPL tariff code or NAPPI code." },
  ],

  submissionWindow: {
    standardDays: 120,
    pmbDays: 365,
    lateSubmissionAllowed: false,
    lateAppealWindowDays: 30,
    electronicSubmissionCutoff: "23:59 SAST",
    batchProcessingDays: ["Monday", "Wednesday", "Friday"],
    averagePaymentDays: 18,
  },

  preAuthRequirements: [
    { category: "Hospital admissions", icd10Prefixes: [], tariffPrefixes: ["0008", "0009"], method: "phone", turnaroundHours: 8, notes: "All schemes require pre-auth for elective admissions." },
    { category: "Advanced radiology", icd10Prefixes: [], tariffPrefixes: ["0078", "0008", "0009"], method: "phone", turnaroundHours: 24, notes: "MRI, CT, PET scans typically require pre-auth." },
    { category: "Oncology", icd10Prefixes: ["C", "Z51"], tariffPrefixes: ["0046"], method: "phone", turnaroundHours: 48, notes: "Most schemes have oncology managed care programmes." },
    { category: "Spinal surgery", icd10Prefixes: ["M50", "M51", "M47"], tariffPrefixes: ["0452", "0457"], method: "phone", turnaroundHours: 72, notes: "Conservative treatment evidence typically required." },
    { category: "Joint replacements", icd10Prefixes: ["M16", "M17"], tariffPrefixes: ["0520"], method: "phone", turnaroundHours: 48, notes: "Functional assessments generally required." },
  ],

  cdlHandling: {
    requiresApplication: true,
    applicationMethod: "Via scheme administrator",
    approvalTurnaroundDays: 14,
    renewalRequired: true,
    renewalIntervalMonths: 12,
    formularyEnforced: false,
    maxDaysSupply: 30,
    genericSubstitutionRequired: false,
    notes: "CMS baseline: all schemes must cover CDL conditions. 27 conditions on the Chronic Disease List. Application required for ongoing chronic medication benefits.",
  },

  pmbInterpretation: {
    strictDSP: false,
    paymentBasis: "scheme_tariff",
    autoPMBCodes: ["I21", "I60", "I61", "I62", "I63", "J45", "E10", "E11", "B20"],
    pmbDisputeProcess: "Submit to scheme Principal Officer. Escalate to CMS if unresolved after 30 days.",
    emergencyPMBHandling: "Emergency PMB must be covered at any facility per Medical Schemes Act.",
    notes: "All registered SA medical schemes must cover PMB conditions (270 diagnosis-treatment pairs). Schemes cannot refuse PMB claims. Members can escalate to CMS (Council for Medical Schemes) for any PMB dispute.",
  },

  tariffInfo: {
    nhrplPercentage: 95,
    consultationRate: 460,
    specialistMultiplier: 1.7,
    dispensingFeePolicy: "SEP + regulated dispensing fee per CMS guidelines.",
    coPaymentApplies: false,
    notes: "Default baseline assumes approximately 95% of NHRPL. Actual rates vary by scheme and plan option.",
  },

  contact: {
    claimsPhone: "N/A",
    claimsEmail: "N/A",
    preAuthPhone: "N/A",
    preAuthEmail: "N/A",
    disputeEmail: "N/A",
    brokerLine: "N/A",
    website: "https://www.medicalschemes.co.za",
    portalUrl: "N/A",
  },
};

// ─── INTELLIGENCE MAP ───────────────────────────────────────────

const SCHEME_INTELLIGENCE: Record<string, SchemeIntelligenceProfile> = {
  DH: discoveryIntelligence,
  GEMS: gemsIntelligence,
  BON: bonitasIntelligence,
  MS: medshieldIntelligence,
  MH: momentumIntelligence,
  BM: bestmedIntelligence,
  DEFAULT: defaultIntelligence,
};

// ─── EXPORTS ────────────────────────────────────────────────────

/** Get full intelligence profile for a scheme by code */
export function getSchemeIntelligence(schemeCode: string): SchemeIntelligenceProfile {
  const upper = schemeCode.toUpperCase().trim();
  return SCHEME_INTELLIGENCE[upper] || defaultIntelligence;
}

/** Get all scheme intelligence profiles */
export function getAllSchemeIntelligence(): SchemeIntelligenceProfile[] {
  return Object.values(SCHEME_INTELLIGENCE);
}

/** Get scheme codes with names for UI dropdowns */
export function getSchemeIntelligenceList(): { code: string; name: string; acceptanceRate: number }[] {
  return Object.values(SCHEME_INTELLIGENCE)
    .filter(s => s.code !== "DEFAULT")
    .map(s => ({ code: s.code, name: s.name, acceptanceRate: s.acceptanceRate }));
}

/** Compare two schemes side-by-side */
export function compareSchemes(
  codeA: string,
  codeB: string,
): { schemeA: SchemeIntelligenceProfile; schemeB: SchemeIntelligenceProfile } {
  return {
    schemeA: getSchemeIntelligence(codeA),
    schemeB: getSchemeIntelligence(codeB),
  };
}

/** Get the top N rejection reasons across all schemes, deduplicated by code */
export function getTopRejectionReasonsIndustry(limit: number = 10): RejectionReason[] {
  const allReasons = new Map<string, RejectionReason & { totalPrevalence: number; schemeCount: number }>();

  for (const scheme of Object.values(SCHEME_INTELLIGENCE)) {
    if (scheme.code === "DEFAULT") continue;
    for (const reason of scheme.topRejectionReasons) {
      const existing = allReasons.get(reason.code);
      if (existing) {
        existing.totalPrevalence += reason.prevalence;
        existing.schemeCount += 1;
        existing.avgRandImpact = Math.round(
          (existing.avgRandImpact * (existing.schemeCount - 1) + reason.avgRandImpact) / existing.schemeCount,
        );
      } else {
        allReasons.set(reason.code, {
          ...reason,
          totalPrevalence: reason.prevalence,
          schemeCount: 1,
        });
      }
    }
  }

  return Array.from(allReasons.values())
    .sort((a, b) => b.totalPrevalence - a.totalPrevalence)
    .slice(0, limit)
    .map(({ totalPrevalence, schemeCount, ...reason }, idx) => ({
      ...reason,
      rank: idx + 1,
      prevalence: Math.round((totalPrevalence / schemeCount) * 10) / 10,
    }));
}
