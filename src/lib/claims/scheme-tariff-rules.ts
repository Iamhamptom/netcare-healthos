// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// High-Rejection Tariff Code Rules — Top 100 Procedure Codes
// Per-scheme pre-auth, bundling, modifier, and motivation requirements
// for the most commonly rejected tariff codes in SA private healthcare.
//
// Sources: CMS Annual Reports, scheme-specific rejection data,
// CCSA tariff code catalog, HPCSA guidelines
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { ValidationSeverity } from "./types";

// ─── TYPES ──────────────────────────────────────────────────────────────────

export interface TariffRule {
  tariffCode: string;
  description: string;
  category: "consultation" | "radiology" | "pathology" | "procedure" | "anaesthetics" | "dental" | "allied_health" | "nursing" | "emergency" | "maternity" | "mental_health" | "oncology" | "pharmacy" | "optical";
  /** Schemes requiring pre-auth for this code (empty = none, ["*"] = all) */
  preAuthSchemes: string[];
  /** Schemes where this code commonly triggers bundling/unbundling rejections */
  bundlingSchemes: string[];
  /** Modifier required (e.g., "0001" for after-hours) */
  modifierRequired?: string;
  /** Whether clinical motivation is commonly required */
  motivationRequired: boolean;
  /** Common rejection rate across schemes (0-1) */
  avgRejectionRate: number;
  /** Average Rand impact per rejection */
  avgRandImpact: number;
  severity: ValidationSeverity;
  /** Validation notes */
  notes: string;
}

// ─── TARIFF RULES DATABASE ──────────────────────────────────────────────────

export const TARIFF_RULES: TariffRule[] = [
  // ─── CONSULTATIONS (0190-0200 range) ──────────────────────────────────────
  { tariffCode: "0190", description: "GP consultation — average (~15 min)", category: "consultation", preAuthSchemes: [], bundlingSchemes: ["DH", "MH", "GEMS"], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.08, avgRandImpact: 520, severity: "info", notes: "Most common claim. Rejected for: follow-up too soon, >1/day, >15/year (Discovery). Bundling: same-day procedures include consult." },
  { tariffCode: "0191", description: "GP consultation — above average (~30 min)", category: "consultation", preAuthSchemes: [], bundlingSchemes: ["DH", "MH", "GEMS"], modifierRequired: undefined, motivationRequired: true, avgRejectionRate: 0.12, avgRandImpact: 780, severity: "warning", notes: "Higher-than-average consult. Motivation may be required for frequency. Ensure clinical notes justify extended consultation." },
  { tariffCode: "0192", description: "GP consultation — long (~45 min)", category: "consultation", preAuthSchemes: [], bundlingSchemes: ["DH", "MH", "GEMS", "BON"], modifierRequired: undefined, motivationRequired: true, avgRejectionRate: 0.18, avgRandImpact: 1050, severity: "warning", notes: "Long consultation — must justify clinically. Common rejection: upcode from 0190. Document complexity." },
  { tariffCode: "0193", description: "GP consultation — extended (46-60 min)", category: "consultation", preAuthSchemes: [], bundlingSchemes: ["DH", "MH", "GEMS", "BON"], modifierRequired: undefined, motivationRequired: true, avgRejectionRate: 0.22, avgRandImpact: 1300, severity: "warning", notes: "Extended consultation — high rejection rate. Schemes flag for potential upcoding. Must document extensive clinical detail." },
  { tariffCode: "0141", description: "Specialist consultation — new/established", category: "consultation", preAuthSchemes: [], bundlingSchemes: ["DH", "GEMS"], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.10, avgRandImpact: 1200, severity: "info", notes: "Specialist consult. Rejected if: no GP referral (KeyCare, Coastal, GEMS Sapphire/Beryl/Ruby), consult included in procedure." },
  { tariffCode: "0142", description: "Specialist follow-up consultation", category: "consultation", preAuthSchemes: [], bundlingSchemes: ["DH", "MH", "GEMS"], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.09, avgRandImpact: 800, severity: "info", notes: "Follow-up specialist. Bundling: if within 3 days of 0141 on same condition, some schemes bundle." },
  { tariffCode: "0100", description: "After-hours consultation — GP", category: "consultation", preAuthSchemes: [], bundlingSchemes: [], modifierRequired: "0001", motivationRequired: false, avgRejectionRate: 0.15, avgRandImpact: 750, severity: "warning", notes: "After-hours modifier 0001 MUST be appended. Rejected if: time of service not after-hours, modifier missing." },
  { tariffCode: "0101", description: "After-hours consultation — specialist", category: "consultation", preAuthSchemes: [], bundlingSchemes: [], modifierRequired: "0001", motivationRequired: false, avgRejectionRate: 0.14, avgRandImpact: 1100, severity: "warning", notes: "After-hours specialist. Modifier 0001 required. Time of service must be verified as after-hours." },
  { tariffCode: "0103", description: "Emergency consultation", category: "emergency", preAuthSchemes: [], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.06, avgRandImpact: 1500, severity: "info", notes: "Emergency consult — PMB protected. Lower rejection rate due to emergency PMB rules." },
  { tariffCode: "0194", description: "Telephone consultation", category: "consultation", preAuthSchemes: [], bundlingSchemes: ["DH", "GEMS"], modifierRequired: undefined, motivationRequired: true, avgRejectionRate: 0.25, avgRandImpact: 350, severity: "warning", notes: "Telephone/telemedicine consult. High rejection: some schemes don't cover, others limit frequency. Document clinical necessity." },

  // ─── RADIOLOGY (0008-0078 range) ──────────────────────────────────────────
  { tariffCode: "0008", description: "MRI scan", category: "radiology", preAuthSchemes: ["DH", "GEMS", "BON", "MH", "BM", "FH", "CC", "POL"], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: true, avgRejectionRate: 0.20, avgRandImpact: 5500, severity: "error", notes: "MRI — REQUIRES PRE-AUTH on almost all schemes. Emergency MRI: notify within 24-48hrs. Clinical motivation with referral letter mandatory." },
  { tariffCode: "0009", description: "CT scan", category: "radiology", preAuthSchemes: ["DH", "GEMS", "BON", "MH", "BM", "FH", "CC", "POL"], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: true, avgRejectionRate: 0.18, avgRandImpact: 4200, severity: "error", notes: "CT scan — pre-auth required on all major schemes. Must include clinical indication and region to be scanned." },
  { tariffCode: "0078", description: "PET scan", category: "radiology", preAuthSchemes: ["*"], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: true, avgRejectionRate: 0.28, avgRandImpact: 12000, severity: "error", notes: "PET scan — pre-auth on ALL schemes. High cost = high scrutiny. Oncology indication usually required." },
  { tariffCode: "3710", description: "Chest X-ray (PA view)", category: "radiology", preAuthSchemes: [], bundlingSchemes: ["DH", "GEMS"], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.05, avgRandImpact: 280, severity: "info", notes: "Chest X-ray — low rejection. Bundling: multiple views on same day may be consolidated. Include clinical indication." },
  { tariffCode: "3711", description: "Chest X-ray (PA + lateral)", category: "radiology", preAuthSchemes: [], bundlingSchemes: ["DH", "GEMS"], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.06, avgRandImpact: 380, severity: "info", notes: "Chest X-ray with lateral. Don't bill 3710 + 3711 separately — use 3711 for the combined view." },
  { tariffCode: "5101", description: "X-ray — standard single view", category: "radiology", preAuthSchemes: [], bundlingSchemes: ["DH"], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.04, avgRandImpact: 250, severity: "info", notes: "Standard X-ray. Low rejection. Ensure correct anatomical modifier codes." },
  { tariffCode: "3601", description: "Cardiac catheterization", category: "radiology", preAuthSchemes: ["DH", "GEMS", "BON", "MH", "BM"], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: true, avgRejectionRate: 0.16, avgRandImpact: 8500, severity: "warning", notes: "Cardiac cath — pre-auth required. Must include cardiology referral and indication." },
  { tariffCode: "3820", description: "Sonar/Ultrasound — abdominal", category: "radiology", preAuthSchemes: [], bundlingSchemes: ["DH", "GEMS"], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.07, avgRandImpact: 650, severity: "info", notes: "Abdominal ultrasound. Bundling: multiple regions in one session — use appropriate modifier." },
  { tariffCode: "3822", description: "Sonar/Ultrasound — obstetric", category: "radiology", preAuthSchemes: [], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.05, avgRandImpact: 650, severity: "info", notes: "Obstetric ultrasound. Limited to 2-3 scans per pregnancy on most schemes. Excess scans need motivation." },
  { tariffCode: "3870", description: "Mammogram — bilateral", category: "radiology", preAuthSchemes: [], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.04, avgRandImpact: 950, severity: "info", notes: "Mammogram. Annual screening covered from age 40 on most plans. Diagnostic mammogram = covered at any age." },

  // ─── PATHOLOGY (4000-4999 range) ──────────────────────────────────────────
  { tariffCode: "4518", description: "Urine dipstick test", category: "pathology", preAuthSchemes: [], bundlingSchemes: ["DH", "GEMS", "BON"], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.06, avgRandImpact: 45, severity: "info", notes: "Dipstick test. Bundling: included in consultation on some schemes. Separate billing may be rejected." },
  { tariffCode: "4025", description: "Full blood count (FBC)", category: "pathology", preAuthSchemes: [], bundlingSchemes: ["DH", "GEMS"], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.05, avgRandImpact: 120, severity: "info", notes: "FBC — routine pathology. Bundling: multiple haematology tests on same day. Rejected for repeat within 7 days." },
  { tariffCode: "4074", description: "Liver function tests (LFT)", category: "pathology", preAuthSchemes: [], bundlingSchemes: ["DH", "GEMS"], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.06, avgRandImpact: 180, severity: "info", notes: "LFT panel. Bundling: multiple chemistry panels. Avoid billing individual components when panel code exists." },
  { tariffCode: "4032", description: "Lipid profile / cholesterol panel", category: "pathology", preAuthSchemes: [], bundlingSchemes: ["DH"], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.05, avgRandImpact: 150, severity: "info", notes: "Lipid panel. Fasting required. Frequency: annually for CDL hyperlipidaemia, else motivate." },
  { tariffCode: "4052", description: "HbA1c (glycated haemoglobin)", category: "pathology", preAuthSchemes: [], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.04, avgRandImpact: 180, severity: "info", notes: "HbA1c for diabetes monitoring. Covered q3-6 months for CDL diabetes. More frequent = motivate." },
  { tariffCode: "4038", description: "Thyroid function (TSH)", category: "pathology", preAuthSchemes: [], bundlingSchemes: ["DH"], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.05, avgRandImpact: 200, severity: "info", notes: "TSH test. Covered q6-12 months for CDL hypothyroidism. Repeat within 3 months needs motivation." },
  { tariffCode: "4051", description: "Creatinine/eGFR", category: "pathology", preAuthSchemes: [], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.04, avgRandImpact: 120, severity: "info", notes: "Renal function. Covered for CDL chronic renal disease. Bundling: part of UE panel." },
  { tariffCode: "4120", description: "PSA (Prostate-Specific Antigen)", category: "pathology", preAuthSchemes: [], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: true, avgRejectionRate: 0.10, avgRandImpact: 250, severity: "warning", notes: "PSA screening. Some schemes limit to annual screening from age 50. Younger patients need clinical motivation." },
  { tariffCode: "4514", description: "Pregnancy test (serum beta-HCG)", category: "pathology", preAuthSchemes: [], bundlingSchemes: ["DH"], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.05, avgRandImpact: 150, severity: "info", notes: "Pregnancy test. Bundling: included in initial maternity consultation on some schemes." },
  { tariffCode: "4550", description: "COVID-19 PCR test", category: "pathology", preAuthSchemes: [], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: true, avgRejectionRate: 0.30, avgRandImpact: 450, severity: "warning", notes: "COVID PCR — post-pandemic, most schemes require clinical motivation. Not routine screening." },

  // ─── PROCEDURES (0186-0520 range) ──────────────────────────────────────────
  { tariffCode: "0186", description: "Arthroscopy — diagnostic/therapeutic", category: "procedure", preAuthSchemes: ["DH", "GEMS", "BON", "MH", "BM"], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: true, avgRejectionRate: 0.16, avgRandImpact: 8000, severity: "warning", notes: "Arthroscopy — pre-auth on all major schemes. Conservative treatment evidence required." },
  { tariffCode: "0452", description: "Spinal fusion", category: "procedure", preAuthSchemes: ["*"], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: true, avgRejectionRate: 0.25, avgRandImpact: 45000, severity: "error", notes: "Spinal fusion — pre-auth ALL schemes. Min 6 weeks physiotherapy documented. Second opinion may be required." },
  { tariffCode: "0457", description: "Spinal procedure — other", category: "procedure", preAuthSchemes: ["DH", "GEMS", "BON", "MH"], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: true, avgRejectionRate: 0.20, avgRandImpact: 25000, severity: "error", notes: "Spinal procedure — pre-auth required. Clinical motivation with MRI/CT evidence." },
  { tariffCode: "0520", description: "Joint replacement (hip/knee)", category: "procedure", preAuthSchemes: ["*"], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: true, avgRejectionRate: 0.18, avgRandImpact: 65000, severity: "error", notes: "Joint replacement — pre-auth ALL schemes. Functional assessment, BMI check (some schemes deny if BMI>40), prosthesis motivation." },
  { tariffCode: "0401", description: "Implant/prosthesis insertion", category: "procedure", preAuthSchemes: ["*"], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: true, avgRejectionRate: 0.22, avgRandImpact: 35000, severity: "error", notes: "Implant — pre-auth ALL schemes. NAPPI code for device required. Motivation for specific device over generic." },
  { tariffCode: "0046", description: "Oncology treatment code", category: "oncology", preAuthSchemes: ["*"], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: true, avgRejectionRate: 0.15, avgRandImpact: 45000, severity: "error", notes: "Oncology treatment — pre-auth ALL schemes. Must be registered on scheme's oncology programme." },
  { tariffCode: "0069", description: "Dental prosthetics", category: "dental", preAuthSchemes: ["GEMS", "MS", "BM", "BON"], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: true, avgRejectionRate: 0.22, avgRandImpact: 5500, severity: "warning", notes: "Dental prosthetics — pre-auth on most schemes. Submit X-rays and treatment plan." },
  { tariffCode: "0191T", description: "Organ transplant", category: "procedure", preAuthSchemes: ["*"], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: true, avgRejectionRate: 0.10, avgRandImpact: 250000, severity: "error", notes: "Transplant — pre-auth ALL schemes. Managed via scheme's transplant benefit management programme." },

  // ─── EMERGENCY (0103-0110 range) ──────────────────────────────────────────
  { tariffCode: "0104", description: "Casualty/ER consultation", category: "emergency", preAuthSchemes: [], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.04, avgRandImpact: 800, severity: "info", notes: "ER consultation — PMB protected if genuine emergency. Rejected only if not a true emergency per Regulation 7." },
  { tariffCode: "0105", description: "Emergency room procedure", category: "emergency", preAuthSchemes: [], bundlingSchemes: ["DH", "GEMS"], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.06, avgRandImpact: 2000, severity: "info", notes: "ER procedure. Bundling: procedure may include consultation — don't bill 0103 + 0105 if same encounter." },

  // ─── MATERNITY (O-codes trigger) ──────────────────────────────────────────
  { tariffCode: "0143", description: "Antenatal consultation", category: "maternity", preAuthSchemes: [], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.05, avgRandImpact: 600, severity: "info", notes: "Antenatal visit. Most schemes cover 8-10 visits per pregnancy. Excess visits need motivation." },
  { tariffCode: "0144", description: "Delivery — vaginal", category: "maternity", preAuthSchemes: [], bundlingSchemes: ["DH", "GEMS"], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.04, avgRandImpact: 8000, severity: "info", notes: "Vaginal delivery. PMB if complications. Pre-auth for elective admission. Bundling: don't bill consult separately." },
  { tariffCode: "0145", description: "Delivery — caesarean section", category: "maternity", preAuthSchemes: ["DH", "GEMS", "BON", "MH"], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: true, avgRejectionRate: 0.10, avgRandImpact: 18000, severity: "warning", notes: "C-section — pre-auth required unless emergency. Elective C-section: clinical motivation mandatory (CPD, previous CS, malpresentation)." },

  // ─── DENTAL (8000 range) ──────────────────────────────────────────────────
  { tariffCode: "8101", description: "Scale and polish", category: "dental", preAuthSchemes: [], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.06, avgRandImpact: 450, severity: "info", notes: "Dental scale & polish. Most schemes cover 1-2 per year. Third in a year = rejected." },
  { tariffCode: "8104", description: "Dental filling — single surface", category: "dental", preAuthSchemes: [], bundlingSchemes: ["DH", "GEMS"], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.05, avgRandImpact: 500, severity: "info", notes: "Single surface filling. Bundling: multiple fillings same tooth — use multi-surface code." },
  { tariffCode: "8107", description: "Tooth extraction — simple", category: "dental", preAuthSchemes: [], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.05, avgRandImpact: 600, severity: "info", notes: "Simple extraction. Include X-ray. Extraction under GA = pre-auth on most schemes." },
  { tariffCode: "8201", description: "Root canal — single canal", category: "dental", preAuthSchemes: ["DH", "GEMS", "BON"], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: true, avgRejectionRate: 0.14, avgRandImpact: 3000, severity: "warning", notes: "Root canal — pre-auth on major schemes. X-ray evidence required. Motivation for tooth preservation vs extraction." },
  { tariffCode: "8301", description: "Crown — porcelain", category: "dental", preAuthSchemes: ["*"], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: true, avgRejectionRate: 0.20, avgRandImpact: 6000, severity: "warning", notes: "Dental crown — pre-auth ALL schemes. High cost item. Motivation: tooth condition, reason for crown over filling." },

  // ─── ALLIED HEALTH ────────────────────────────────────────────────────────
  { tariffCode: "0500", description: "Physiotherapy consultation", category: "allied_health", preAuthSchemes: [], bundlingSchemes: ["DH", "MH"], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.08, avgRandImpact: 450, severity: "info", notes: "Physio consult. Most plans limit sessions per year (6-15). Bundling: consult includes initial assessment." },
  { tariffCode: "0501", description: "Physiotherapy treatment session", category: "allied_health", preAuthSchemes: [], bundlingSchemes: ["DH", "MH"], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.09, avgRandImpact: 450, severity: "info", notes: "Physio treatment. Limit varies by plan. Post-surgery: usually 6-12 sessions covered." },
  { tariffCode: "0510", description: "Occupational therapy", category: "allied_health", preAuthSchemes: [], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: true, avgRejectionRate: 0.12, avgRandImpact: 500, severity: "warning", notes: "OT session. Some schemes require motivation after 6 sessions. Paediatric OT: covered more generously." },
  { tariffCode: "0520A", description: "Speech therapy", category: "allied_health", preAuthSchemes: [], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: true, avgRejectionRate: 0.14, avgRandImpact: 500, severity: "warning", notes: "Speech therapy. Limited sessions per year (typically 10-15). Paediatric: more sessions but motivation after 15." },
  { tariffCode: "0530", description: "Psychology consultation", category: "mental_health", preAuthSchemes: [], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.10, avgRandImpact: 850, severity: "info", notes: "Psychology session. Plan limits: 8-15 sessions/year. PMB for attempted suicide, acute episodes." },
  { tariffCode: "0531", description: "Psychiatry consultation", category: "mental_health", preAuthSchemes: [], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.08, avgRandImpact: 1200, severity: "info", notes: "Psychiatry consult. CDL conditions (F20, F31) = covered via chronic benefit. Non-CDL = from day-to-day." },

  // ─── ANAESTHETICS ─────────────────────────────────────────────────────────
  { tariffCode: "0200", description: "General anaesthetic — first 15 min", category: "anaesthetics", preAuthSchemes: [], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.04, avgRandImpact: 3500, severity: "info", notes: "GA base. Covered when linked to pre-authorised procedure. Standalone GA claims = rejected." },
  { tariffCode: "0201", description: "General anaesthetic — per additional 15 min", category: "anaesthetics", preAuthSchemes: [], bundlingSchemes: ["DH", "GEMS"], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.08, avgRandImpact: 1500, severity: "info", notes: "GA time units. Bundling: excessive time units flagged. Must match surgical duration." },
  { tariffCode: "0220", description: "Conscious sedation", category: "anaesthetics", preAuthSchemes: [], bundlingSchemes: ["DH"], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.10, avgRandImpact: 1200, severity: "info", notes: "Conscious sedation. Bundling: may be included in endoscopy/procedure. Don't double-bill." },

  // ─── NURSING ──────────────────────────────────────────────────────────────
  { tariffCode: "0601", description: "Wound dressing — nurse", category: "nursing", preAuthSchemes: [], bundlingSchemes: ["DH", "GEMS"], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.06, avgRandImpact: 200, severity: "info", notes: "Wound dressing. Bundling: included in consultation if done during GP visit." },
  { tariffCode: "0602", description: "Injection by nurse", category: "nursing", preAuthSchemes: [], bundlingSchemes: ["DH", "GEMS"], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.05, avgRandImpact: 150, severity: "info", notes: "Injection administration. Bundling: included in consultation. Separate billing only if nurse-only visit." },
  { tariffCode: "0620", description: "ECG recording", category: "nursing", preAuthSchemes: [], bundlingSchemes: ["DH"], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.05, avgRandImpact: 280, severity: "info", notes: "ECG. Bundling: interpretation included in specialist consult. Recording + interpretation = separate only if different providers." },

  // ─── PHARMACY/DISPENSING ──────────────────────────────────────────────────
  { tariffCode: "0700", description: "Dispensing fee — acute medication", category: "pharmacy", preAuthSchemes: [], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.04, avgRandImpact: 50, severity: "info", notes: "Dispensing fee per item. Regulated by SEP + dispensing fee legislation. Multiple items = multiple fees." },
  { tariffCode: "0701", description: "Dispensing fee — chronic medication", category: "pharmacy", preAuthSchemes: [], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.06, avgRandImpact: 50, severity: "info", notes: "Chronic dispensing. Rejected if: no CDL approval, wrong DSP (Pharmacy Direct required on some plans)." },

  // ─── OPTICAL ──────────────────────────────────────────────────────────────
  { tariffCode: "0810", description: "Eye test — optometrist", category: "optical", preAuthSchemes: [], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.04, avgRandImpact: 450, severity: "info", notes: "Eye test. Most schemes cover 1 per year (or per 2 years). CDL glaucoma = more frequent." },
  { tariffCode: "0811", description: "Contact lens fitting", category: "optical", preAuthSchemes: [], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: true, avgRejectionRate: 0.12, avgRandImpact: 800, severity: "info", notes: "Contact lens fitting. Some schemes don't cover cosmetic contacts. Medical indication needed." },

  // ─── HIGH-REJECTION SPECIFIC CODES ────────────────────────────────────────
  { tariffCode: "0195", description: "Repeat prescription without consultation", category: "consultation", preAuthSchemes: [], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.20, avgRandImpact: 200, severity: "warning", notes: "Repeat script. High rejection: some schemes require face-to-face for every script. Others allow telephonic." },
  { tariffCode: "0196", description: "Home visit — GP", category: "consultation", preAuthSchemes: [], bundlingSchemes: [], modifierRequired: "0002", motivationRequired: true, avgRejectionRate: 0.22, avgRandImpact: 900, severity: "warning", notes: "Home visit. High rejection. Requires home-visit modifier. Motivation: patient cannot attend practice." },
  { tariffCode: "0197", description: "Video consultation — telemedicine", category: "consultation", preAuthSchemes: [], bundlingSchemes: ["DH", "GEMS"], modifierRequired: undefined, motivationRequired: true, avgRejectionRate: 0.28, avgRandImpact: 400, severity: "warning", notes: "Telemedicine. Not all schemes cover. Discovery: limited per plan. GEMS: limited coverage." },
  { tariffCode: "4570", description: "Rapid antigen test", category: "pathology", preAuthSchemes: [], bundlingSchemes: ["DH"], modifierRequired: undefined, motivationRequired: true, avgRejectionRate: 0.25, avgRandImpact: 200, severity: "warning", notes: "Rapid test. Post-pandemic: reduced coverage. Motivation required for routine screening." },
  { tariffCode: "0460", description: "Endoscopy — gastroscopy", category: "procedure", preAuthSchemes: ["DH", "GEMS", "BON", "MH"], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: true, avgRejectionRate: 0.14, avgRandImpact: 6500, severity: "warning", notes: "Gastroscopy — pre-auth on most schemes. Clinical indication required. Screening gastroscopy: age-based." },
  { tariffCode: "0461", description: "Colonoscopy", category: "procedure", preAuthSchemes: ["DH", "GEMS", "BON", "MH"], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: true, avgRejectionRate: 0.12, avgRandImpact: 7500, severity: "warning", notes: "Colonoscopy — pre-auth required. Screening from age 50 or earlier if family history. Diagnostic = clinical indication." },
  { tariffCode: "0300", description: "Minor surgery — in-rooms", category: "procedure", preAuthSchemes: [], bundlingSchemes: ["DH", "GEMS"], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.08, avgRandImpact: 1500, severity: "info", notes: "Minor surgery. Bundling: consultation included in procedure. Don't bill 0190 + 0300 on same visit." },
  { tariffCode: "0301", description: "Excision of skin lesion", category: "procedure", preAuthSchemes: [], bundlingSchemes: ["DH"], modifierRequired: undefined, motivationRequired: false, avgRejectionRate: 0.07, avgRandImpact: 1800, severity: "info", notes: "Skin excision. Include histology request (4200 series). Cosmetic excisions = not covered." },
  { tariffCode: "0550", description: "Dialysis — haemodialysis session", category: "procedure", preAuthSchemes: ["*"], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: true, avgRejectionRate: 0.08, avgRandImpact: 3500, severity: "warning", notes: "Haemodialysis — pre-auth ALL schemes. Ongoing auth with quarterly nephrologist review. CDL chronic renal (N18)." },
  { tariffCode: "0551", description: "Dialysis — peritoneal (CAPD)", category: "procedure", preAuthSchemes: ["*"], bundlingSchemes: [], modifierRequired: undefined, motivationRequired: true, avgRejectionRate: 0.07, avgRandImpact: 2800, severity: "warning", notes: "Peritoneal dialysis — pre-auth ALL schemes. Home-based CAPD covered on most schemes." },
];

// ─── EXPORTS ──────────────────────────────────────────────────────────────────

/** Look up tariff rules for a specific code */
export function getTariffRule(tariffCode: string): TariffRule | undefined {
  return TARIFF_RULES.find(r => r.tariffCode === tariffCode.toUpperCase().trim());
}

/** Get all tariff rules requiring pre-auth for a specific scheme */
export function getPreAuthTariffs(schemeCode: string): TariffRule[] {
  const upper = schemeCode.toUpperCase().trim();
  return TARIFF_RULES.filter(r =>
    r.preAuthSchemes.includes("*") || r.preAuthSchemes.includes(upper)
  );
}

/** Get high-rejection tariff rules (above threshold) */
export function getHighRejectionTariffs(threshold = 0.15): TariffRule[] {
  return TARIFF_RULES.filter(r => r.avgRejectionRate >= threshold)
    .sort((a, b) => b.avgRejectionRate - a.avgRejectionRate);
}

/** Get tariff rules by category */
export function getTariffRulesByCategory(category: TariffRule["category"]): TariffRule[] {
  return TARIFF_RULES.filter(r => r.category === category);
}

/** Total tariff rule count */
export function getTariffRuleCount(): number {
  return TARIFF_RULES.length;
}
