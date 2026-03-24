// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Scheme Benefit Limits — Per-Plan Annual Rand Limits & Restrictions
// Extracted from official scheme benefit brochures/annexures (2025-2026):
//   - Bestmed Annexure B.1 Beat Range 2026 (54 pages)
//   - Medshield MediPlus 2026 Benefit Guide
//   - Momentum Custom 2025 Benefits
//   - Bankmed Annexure C Exclusions 2026 (6 pages)
//   - Discovery/Netcare Annexure C 2025 (3 pages)
//   - GEMS 2025 Changes Summary
//   - Momentum Health 2026 Benefits Brochure (23 pages)
//   - Bonitas Annexure B Primary 2026 (37 pages)
//   - Bonitas Standard/Standard Select 2026 (16 pages)
//   - Polmed Member Guide 2026 (45 pages)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { ValidationSeverity } from "./types";

// ─── TYPES ──────────────────────────────────────────────────────────────────

export interface BenefitLimitRule {
  ruleId: string;
  scheme: string;
  plan: string;           // "*" = all plans, or specific plan
  category: BenefitCategory;
  description: string;
  annualLimitRands?: number;     // Annual Rand limit (undefined = unlimited)
  perEventLimitRands?: number;   // Per-event/admission limit
  perBeneficiaryLimit?: number;  // Per-beneficiary limit
  visitLimit?: number;           // Number of visits/sessions
  visitPeriodMonths?: number;    // Period for visit limit (12 = annual)
  daysLimit?: number;            // Inpatient day limit
  coPaymentPercent?: number;     // Co-payment percentage (0-100)
  coPaymentRands?: number;       // Fixed Rand co-payment
  networkRequired: boolean;      // Whether DSP/network required
  preAuthRequired: boolean;      // Whether pre-auth required
  severity: ValidationSeverity;
  notes: string;
}

export type BenefitCategory =
  | "hospital"
  | "gp_consultation"
  | "specialist"
  | "dental"
  | "optical"
  | "chronic"
  | "mental_health"
  | "maternity"
  | "radiology"
  | "pathology"
  | "physiotherapy"
  | "allied_health"
  | "oncology"
  | "renal"
  | "prosthesis"
  | "appliance"
  | "medicine_acute"
  | "medicine_otc"
  | "ambulance"
  | "day_to_day"
  | "savings"
  | "wound_care"
  | "contraceptive"
  | "refractive_surgery"
  | "organ_transplant";

// ─── BESTMED BENEFIT LIMITS (Beat Range 2026) ──────────────────────────────
// Source: Annexure B.1 Beat Benefit Options 2026

export const BESTMED_BENEFIT_LIMITS: BenefitLimitRule[] = [
  // Hospital
  { ruleId: "BM_BEAT_HOSPITAL", scheme: "BM", plan: "*", category: "hospital", description: "Hospital: unlimited at 100% Scheme tariff, DSP Network, pre-auth required", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Full cross-subsidisation. No annual limit. DSP Hospital Network applies." },
  { ruleId: "BM_BEAT_HOSP_COPAY_DAY", scheme: "BM", plan: "*", category: "hospital", description: "Day procedure in acute hospital (not day hospital): R2,872 co-payment", coPaymentRands: 2872, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Co-payment waived if DSP doesn't work in day hospital and arranged with Scheme." },
  { ruleId: "BM_BEAT_HOSP_COPAY_NETWORK", scheme: "BM", plan: "Beat1 Network", category: "hospital", description: "Non-designated Hospital Network voluntary use: R15,025 co-payment", coPaymentRands: 15025, networkRequired: true, preAuthRequired: true, severity: "error", notes: "Beat1/Beat2/Beat3 Network options — voluntary non-network = R15,025 co-payment per event." },

  // Mental health
  { ruleId: "BM_BEAT1_MENTAL", scheme: "BM", plan: "Beat1", category: "mental_health", description: "Mental health: R12,144/family/year, 21 inpatient days OR 15 outpatient sessions", annualLimitRands: 12144, daysLimit: 21, visitLimit: 15, visitPeriodMonths: 12, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Beat1: lowest mental health limit." },
  { ruleId: "BM_BEAT2_MENTAL", scheme: "BM", plan: "Beat2", category: "mental_health", description: "Mental health: R18,215/family/year", annualLimitRands: 18215, daysLimit: 21, visitLimit: 15, visitPeriodMonths: 12, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Beat2 mental health." },
  { ruleId: "BM_BEAT3_MENTAL", scheme: "BM", plan: "Beat3", category: "mental_health", description: "Mental health: R24,286/family/year", annualLimitRands: 24286, daysLimit: 21, visitLimit: 15, visitPeriodMonths: 12, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Beat3 mental health." },
  { ruleId: "BM_BEAT4_MENTAL", scheme: "BM", plan: "Beat4", category: "mental_health", description: "Mental health: R30,357/family/year", annualLimitRands: 30357, daysLimit: 21, visitLimit: 15, visitPeriodMonths: 12, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Beat4: highest mental health limit." },

  // Dental (in-hospital)
  { ruleId: "BM_BEAT1_DENTAL_HOSP", scheme: "BM", plan: "Beat1", category: "dental", description: "Dental in-hospital: PMB only", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Beat1: dental hospitalisation limited to PMB." },
  { ruleId: "BM_BEAT2_DENTAL_HOSP", scheme: "BM", plan: "Beat2", category: "dental", description: "Dental in-hospital: R10,217/family/year", annualLimitRands: 10217, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Beat2 dental in-hospital limit." },
  { ruleId: "BM_BEAT3_DENTAL_HOSP", scheme: "BM", plan: "Beat3", category: "dental", description: "Dental in-hospital: R12,772/family/year", annualLimitRands: 12772, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Beat3 dental in-hospital limit." },
  { ruleId: "BM_BEAT4_DENTAL_HOSP", scheme: "BM", plan: "Beat4", category: "dental", description: "Dental in-hospital: R16,678/family/year", annualLimitRands: 16678, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Beat4 dental in-hospital limit." },

  // Prosthesis
  { ruleId: "BM_BEAT1_PROSTHESIS", scheme: "BM", plan: "Beat1", category: "prosthesis", description: "Internal prosthesis overall limit: R99,764/family/year", annualLimitRands: 99764, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Sub-limits: Vascular R57,441, Joint R54,390, Mesh R13,975, Gynae/Uro R11,419, Lens R8,713/lens." },
  { ruleId: "BM_BEAT2_PROSTHESIS", scheme: "BM", plan: "Beat2", category: "prosthesis", description: "Internal prosthesis overall limit: R100,818/family/year", annualLimitRands: 100818, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Sub-limits: Vascular R68,929, Joint R54,390, Mesh R14,047, Lens R8,713/lens." },
  { ruleId: "BM_BEAT3_PROSTHESIS", scheme: "BM", plan: "Beat3", category: "prosthesis", description: "Internal prosthesis overall limit: R123,064/family/year", annualLimitRands: 123064, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Beat3 highest prosthesis limit." },

  // Joint replacement sub-limits
  { ruleId: "BM_BEAT1_HIP_REPLACE", scheme: "BM", plan: "Beat1", category: "prosthesis", description: "Hip replacement prosthesis: R41,918", perEventLimitRands: 41918, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Within overall prosthesis limit." },
  { ruleId: "BM_BEAT1_KNEE_REPLACE", scheme: "BM", plan: "Beat1", category: "prosthesis", description: "Knee/shoulder replacement prosthesis: R51,686", perEventLimitRands: 51686, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Within overall prosthesis limit." },

  // Oncology
  { ruleId: "BM_BEAT1_ONCOLOGY", scheme: "BM", plan: "Beat1", category: "oncology", description: "Oncology: R20,920/family/year combined in/out hospital", annualLimitRands: 20920, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Beat1 oncology." },
  { ruleId: "BM_BEAT2_ONCOLOGY", scheme: "BM", plan: "Beat2", category: "oncology", description: "Oncology: R23,012/family/year", annualLimitRands: 23012, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Beat2 oncology." },
  { ruleId: "BM_BEAT3_ONCOLOGY", scheme: "BM", plan: "Beat3", category: "oncology", description: "Oncology: R33,472/family/year", annualLimitRands: 33472, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Beat3 oncology." },
  { ruleId: "BM_BEAT4_ONCOLOGY", scheme: "BM", plan: "Beat4", category: "oncology", description: "Oncology: R41,840/family/year", annualLimitRands: 41840, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Beat4 oncology." },

  // Refractive surgery
  { ruleId: "BM_BEAT_REFRACTIVE", scheme: "BM", plan: "*", category: "refractive_surgery", description: "Refractive surgery: R10,518-R11,871 per eye", perEventLimitRands: 10518, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Beat1: R10,518/eye. Beat2+: R11,871/eye." },

  // Renal
  { ruleId: "BM_BEAT1_RENAL", scheme: "BM", plan: "Beat1", category: "renal", description: "Renal dialysis: R72,858/beneficiary/year", perBeneficiaryLimit: 72858, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Beat1 renal." },
  { ruleId: "BM_BEAT4_RENAL", scheme: "BM", plan: "Beat4", category: "renal", description: "Renal dialysis: R109,288/beneficiary/year", perBeneficiaryLimit: 109288, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Beat4 renal." },

  // Chronic medicine
  { ruleId: "BM_BEAT1_CHRONIC", scheme: "BM", plan: "Beat1", category: "chronic", description: "Non-CDL chronic: M=R4,358, M1+=R8,865 with 20% co-pay (Scheme tariff) / 30% (non-Scheme)", annualLimitRands: 4358, coPaymentPercent: 20, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "CDL/PMB chronic = from risk. Non-CDL from this limit first." },
  { ruleId: "BM_BEAT3_CHRONIC", scheme: "BM", plan: "Beat3", category: "chronic", description: "Non-CDL chronic: M=R9,571, M1+=R19,143", annualLimitRands: 9571, coPaymentPercent: 10, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Beat3: 10% co-pay Scheme tariff, 20% non-Scheme." },

  // Day-to-day overall
  { ruleId: "BM_BEAT3_DAY_OVERALL", scheme: "BM", plan: "Beat3", category: "day_to_day", description: "Overall day-to-day: M=R16,227, M1+=R32,452", annualLimitRands: 16227, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Combined limit for all out-of-hospital day-to-day benefits." },

  // Dental (out of hospital)
  { ruleId: "BM_BEAT3_DENTAL_OOH", scheme: "BM", plan: "Beat3", category: "dental", description: "Dental out-of-hospital: M=R7,149, M1+=R14,359", annualLimitRands: 7149, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Within day-to-day limit. Dental implants included." },

  // Acute medicine
  { ruleId: "BM_BEAT1_ACUTE_MED", scheme: "BM", plan: "Beat1", category: "medicine_acute", description: "Acute medicine: M=R3,652, M1+=R7,376", annualLimitRands: 3652, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Prescribed out of hospital by medical practitioner." },

  // Optical
  { ruleId: "BM_BEAT1_OPTICAL_FRAME", scheme: "BM", plan: "Beat1", category: "optical", description: "Optical frame: R990 (network) / R420 (non-network)", annualLimitRands: 990, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Via PPN optical network." },
  { ruleId: "BM_BEAT2_OPTICAL_FRAME", scheme: "BM", plan: "Beat2", category: "optical", description: "Optical frame: R1,270 (network)", annualLimitRands: 1270, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Beat2 optical frame limit." },
  { ruleId: "BM_BEAT_OPTICAL_LENSES", scheme: "BM", plan: "*", category: "optical", description: "Single vision lenses: R420, Bifocal: R485", perEventLimitRands: 420, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Per lens. Varifocal limits higher." },
  { ruleId: "BM_BEAT_CONTACTS", scheme: "BM", plan: "*", category: "optical", description: "Contact lenses: R1,760 (Beat1/2) / R2,085 (Beat3/4)", annualLimitRands: 1760, networkRequired: false, preAuthRequired: false, severity: "info", notes: "In lieu of spectacle benefit." },

  // Contraceptive
  { ruleId: "BM_BEAT1_CONTRACEPTIVE", scheme: "BM", plan: "Beat1", category: "contraceptive", description: "Oral contraceptives: R2,092/beneficiary. IUD: R3,295 per 5 years", annualLimitRands: 2092, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Beat1 contraceptive." },
  { ruleId: "BM_BEAT3_CONTRACEPTIVE", scheme: "BM", plan: "Beat3", category: "contraceptive", description: "Oral contraceptives: R2,510/beneficiary. IUD: R3,795 per 5 years", annualLimitRands: 2510, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Beat3 contraceptive." },

  // Wound care
  { ruleId: "BM_BEAT_WOUND_CARE", scheme: "BM", plan: "*", category: "wound_care", description: "General wound care: R4,463/family/year. NPWT: unlimited with pre-auth.", annualLimitRands: 4463, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Negative pressure wound therapy unlimited if pre-authorised." },

  // Appliance
  { ruleId: "BM_BEAT_APPLIANCE", scheme: "BM", plan: "*", category: "appliance", description: "Appliances: R15,690/family/year (medically necessary)", annualLimitRands: 15690, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Subject to pre-auth. In-hospital appliances included." },

  // Physiotherapy (out of hospital)
  { ruleId: "BM_BEAT_PHYSIO_OOH", scheme: "BM", plan: "*", category: "physiotherapy", description: "Physiotherapy out-of-hospital: R2,188/family/year", annualLimitRands: 2188, networkRequired: false, preAuthRequired: false, severity: "info", notes: "In-hospital physio = unlimited if pre-authorised during admission." },

  // Maternity supplement
  { ruleId: "BM_BEAT_MATERNITY_SUPP", scheme: "BM", plan: "*", category: "maternity", description: "Maternity supplement: R145/month for 9 months", perEventLimitRands: 145, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Monthly claim for supplements." },

  // Organ transplant
  { ruleId: "BM_BEAT1_TRANSPLANT", scheme: "BM", plan: "Beat1", category: "organ_transplant", description: "Organ transplant: R250,000/beneficiary", perBeneficiaryLimit: 250000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Beat1 transplant limit." },

  // OTC
  { ruleId: "BM_BEAT2_OTC", scheme: "BM", plan: "Beat2", category: "medicine_otc", description: "OTC medicine: R1,214/family/year", annualLimitRands: 1214, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Not available on Beat1. Includes sunscreen, vitamins with NAPPI codes." },

  // Travel
  { ruleId: "BM_BEAT_TRAVEL_USA", scheme: "BM", plan: "*", category: "hospital", description: "Overseas travel: USA R1M/family (90 days leisure, 60 days business)", annualLimitRands: 1000000, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Other countries: R5M. Elective procedures abroad = excluded." },
];

// ─── MEDSHIELD BENEFIT LIMITS (MediPlus 2026) ──────────────────────────────
// Source: MediPlus 2026 Benefit Guide

export const MEDSHIELD_BENEFIT_LIMITS: BenefitLimitRule[] = [
  // Hospital
  { ruleId: "MS_MEDIPLUS_HOSPITAL", scheme: "MS", plan: "MediPlus", category: "hospital", description: "Hospital: unlimited, Prime or Compact Hospital Network", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Two network tiers: Prime (broader) and Compact (value)." },
  { ruleId: "MS_MEDIPLUS_HOSP_COPAY", scheme: "MS", plan: "MediPlus", category: "hospital", description: "Non-network hospital: 30% upfront co-payment", coPaymentPercent: 30, networkRequired: true, preAuthRequired: true, severity: "error", notes: "Both Prime and Compact options: 30% co-pay for non-network hospital." },
  { ruleId: "MS_MEDIPLUS_DISCHARGE_MED", scheme: "MS", plan: "MediPlus", category: "medicine_acute", description: "Medicine on discharge from hospital: R700 per admission", perEventLimitRands: 700, networkRequired: false, preAuthRequired: false, severity: "info", notes: "According to Maximum Generic Pricing or Medicine Formulary." },

  // Alternatives to hospitalisation
  { ruleId: "MS_MEDIPLUS_ALT_HOSP_PRIME", scheme: "MS", plan: "MediPlus Prime", category: "hospital", description: "Alternatives to hospitalisation: R82,000/family/year", annualLimitRands: 82000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "30% co-payment for non-network facility." },
  { ruleId: "MS_MEDIPLUS_ALT_HOSP_COMPACT", scheme: "MS", plan: "MediPlus Compact", category: "hospital", description: "Alternatives to hospitalisation: R57,500/family/year", annualLimitRands: 57500, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Within hospitalisation limit." },

  // Back/neck surgery
  { ruleId: "MS_MEDIPLUS_BACK_SURGERY", scheme: "MS", plan: "MediPlus", category: "hospital", description: "Back/neck surgery: unlimited if DBC conservative pathway completed, else R5,000-R20,000 co-payment", coPaymentRands: 5000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "DBC Programme pre-auth. No GP referral = 20% co-payment (Compact only)." },

  // Appliance
  { ruleId: "MS_MEDIPLUS_APPLIANCE", scheme: "MS", plan: "MediPlus", category: "appliance", description: "Appliances: R950/beneficiary/year", perBeneficiaryLimit: 950, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Subject to Appliance Limit." },

  // Chronic
  { ruleId: "MS_MEDIPLUS_CHRONIC_APPLIANCE", scheme: "MS", plan: "MediPlus", category: "chronic", description: "Diabetes appliance (CDL): R26,500/family/year", annualLimitRands: 26500, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Type 1 diabetes devices/supplies. Subject to Chronic Medicine Limit." },

  // Refractive surgery
  { ruleId: "MS_MEDIPLUS_REFRACTIVE", scheme: "MS", plan: "MediPlus", category: "refractive_surgery", description: "Refractive surgery: R22,000/family/year", annualLimitRands: 22000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Including hospitalisation." },

  // Oncology
  { ruleId: "MS_MEDIPLUS_ONCOLOGY", scheme: "MS", plan: "MediPlus", category: "oncology", description: "Oncology programme: R191,000/family/year", annualLimitRands: 191000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Organ harvesting limited separately. 30% co-payment for non-Prime network." },

  // Prosthesis
  { ruleId: "MS_MEDIPLUS_PROSTHESIS", scheme: "MS", plan: "MediPlus", category: "prosthesis", description: "Internal prosthesis: R47,550/family/year (surgically implanted)", annualLimitRands: 47550, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Preferred Provider Network applies." },

  // External prosthesis
  { ruleId: "MS_MEDIPLUS_EXT_PROSTHESIS", scheme: "MS", plan: "MediPlus", category: "prosthesis", description: "External prosthesis/orthotic: R75,000/family/year", annualLimitRands: 75000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Preferred Provider Network applies." },

  // Physiotherapy
  { ruleId: "MS_MEDIPLUS_PHYSIO", scheme: "MS", plan: "MediPlus", category: "physiotherapy", description: "Physiotherapy out-of-hospital: R3,450/beneficiary/year", perBeneficiaryLimit: 3450, networkRequired: false, preAuthRequired: false, severity: "info", notes: "In-hospital physio = pre-auth required. Subject to Day-to-Day limit." },

  // Specialised radiology
  { ruleId: "MS_MEDIPLUS_SPEC_RADIOLOGY", scheme: "MS", plan: "MediPlus", category: "radiology", description: "Specialised radiology (MRI/CT/PET): R17,500/family/year in- and out-of-hospital", annualLimitRands: 17500, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "DSP or Network Provider required." },

  // Organ transplant
  { ruleId: "MS_MEDIPLUS_TRANSPLANT_SEARCH", scheme: "MS", plan: "MediPlus", category: "organ_transplant", description: "Organ/bone marrow transplant: R54,250/beneficiary (search), R23,250/beneficiary (other)", perBeneficiaryLimit: 54250, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Donor search and related costs." },

  // Radiology (general)
  { ruleId: "MS_MEDIPLUS_GEN_RADIOLOGY", scheme: "MS", plan: "MediPlus", category: "radiology", description: "General radiology (X-rays, sonar): unlimited", networkRequired: false, preAuthRequired: false, severity: "info", notes: "No pre-auth for standard X-rays/ultrasound." },

  // Specialist network
  { ruleId: "MS_MEDIPLUS_SPECIALIST", scheme: "MS", plan: "MediPlus", category: "specialist", description: "Specialist: R12,000/family/year (in-hospital specialist network)", annualLimitRands: 12000, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Medshield Specialist Network may apply." },
];

// ─── GEMS BENEFIT LIMITS (2025) ─────────────────────────────────────────────
// Source: GEMS 2025 Changes + scheme profiles KB

export const GEMS_BENEFIT_LIMITS: BenefitLimitRule[] = [
  // 4.6% increase on all limits for 2025
  { ruleId: "GEMS_ALL_LIMIT_INCREASE", scheme: "GEMS", plan: "*", category: "hospital", description: "2025: 4.6% increase on all in-hospital and out-of-hospital monetary benefit limits", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Annual inflation adjustment." },

  // CGM and insulin pumps (NEW 2025)
  { ruleId: "GEMS_CGM_INSULIN_PUMP", scheme: "GEMS", plan: "*", category: "chronic", description: "NEW 2025: CGM and insulin pumps funded — 1 device per beneficiary per 5 years, under-19 Type 1 DM only", visitLimit: 1, visitPeriodMonths: 60, networkRequired: true, preAuthRequired: true, severity: "info", notes: "Major new benefit for paediatric Type 1 diabetes." },

  // Consultation limit (Tanzanite One / Beryl)
  { ruleId: "GEMS_TAN_BERYL_GP_AUTH", scheme: "GEMS", plan: "Tanzanite One", category: "gp_consultation", description: "GP/nurse consultation: auth required from 16th visit onwards (NEW 2025)", visitLimit: 15, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Tanzanite One and Beryl: first 15 consultations free, auth from 16th." },
  { ruleId: "GEMS_BERYL_GP_AUTH", scheme: "GEMS", plan: "Beryl", category: "gp_consultation", description: "GP/nurse consultation: auth required from 16th visit onwards (NEW 2025)", visitLimit: 15, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Same as Tanzanite One." },

  // Dental sealants (Tanzanite One / Beryl)
  { ruleId: "GEMS_TAN_BERYL_DENTAL_SEALANT", scheme: "GEMS", plan: "Tanzanite One", category: "dental", description: "Dental sealants: now funded for under-18 (NEW 2025), network provider required", networkRequired: true, preAuthRequired: false, severity: "info", notes: "Previously excluded on Tanzanite One/Beryl. Now aligned with other options." },

  // Frenectomies (Ruby/Emerald/EVO/Onyx)
  { ruleId: "GEMS_FRENECTOMY_HOSP", scheme: "GEMS", plan: "Ruby", category: "dental", description: "Frenectomy: now funded in-hospital for children under 6 (NEW 2025)", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Ruby, Emerald, EVO, Onyx. Already existed for other dental procedures." },

  // Sapphire (most restricted)
  { ruleId: "GEMS_SAPPH_OOH", scheme: "GEMS", plan: "Sapphire", category: "day_to_day", description: "Sapphire: PMB-only option, minimal out-of-hospital non-PMB benefits", networkRequired: true, preAuthRequired: false, severity: "warning", notes: "Lowest GEMS option. State as DSP." },
];

// ─── BANKMED EXCLUSION RULES ────────────────────────────────────────────────
// Source: Bankmed Annexure C Exclusions 2026 (6 pages)

export const BANKMED_EXCLUSION_RULES: BenefitLimitRule[] = [
  { ruleId: "BANK_EX_AMBULANCE_FOREIGN", scheme: "BANK", plan: "*", category: "ambulance", description: "Emergency/ambulance transport outside SA excluded", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Bankmed Annexure C 1.1" },
  { ruleId: "BANK_EX_COSMETIC", scheme: "BANK", plan: "*", category: "hospital", description: "Cosmetic procedures excluded (can apply on medical grounds with prior approval + 2nd opinion)", networkRequired: false, preAuthRequired: true, severity: "error", notes: "Must submit medical report with estimated costs. Bankmed Annexure C 1.2" },
  { ruleId: "BANK_EX_INFERTILITY", scheme: "BANK", plan: "*", category: "maternity", description: "Infertility treatment excluded (except PMB Code 902M)", networkRequired: false, preAuthRequired: false, severity: "error", notes: "IVF, GIFT, ZIFT, artificial insemination. PMB basic investigation covered. Bankmed 1.3" },
  { ruleId: "BANK_EX_APPLIANCES", scheme: "BANK", plan: "*", category: "appliance", description: "Medical appliances excluded unless prescribed and approved (beds, TENS, BP monitors, etc.)", networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Exception: oxygen cylinders. Bankmed 1.5" },
  { ruleId: "BANK_EX_SUNSCREEN", scheme: "BANK", plan: "*", category: "medicine_acute", description: "Sun-screening/tanning agents, non-scheduled soaps, shampoos excluded", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Bankmed 1.7.2-1.7.3" },
  { ruleId: "BANK_EX_SLIMMING", scheme: "BANK", plan: "*", category: "medicine_acute", description: "Slimming preparations, tonics, stimulants, appetite suppressants, food supplements excluded", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Including baby foods. Bankmed 1.7.5" },
  { ruleId: "BANK_EX_ERECTILE", scheme: "BANK", plan: "*", category: "medicine_acute", description: "Erectile dysfunction drugs and devices excluded (Viagra, etc.)", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Including auto injectors. Bankmed 1.7.6" },
  { ruleId: "BANK_EX_ANABOLIC", scheme: "BANK", plan: "*", category: "medicine_acute", description: "Anabolic steroids excluded unless authorised for bona fide medical condition (not athletes/bodybuilders)", networkRequired: false, preAuthRequired: true, severity: "error", notes: "Primobolan, Deca-durabolin etc. Bankmed 1.7.9" },
  { ruleId: "BANK_EX_INSURANCE_EXAM", scheme: "BANK", plan: "*", category: "gp_consultation", description: "Insurance/school/visa/employment examinations excluded", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Including aptitude and intelligence testing. Bankmed 1.8" },
  { ruleId: "BANK_EX_OLD_AGE_HOME", scheme: "BANK", plan: "*", category: "hospital", description: "Old age homes and similar institutions excluded", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Bankmed 1.10" },
  { ruleId: "BANK_EX_STRESS_CLINIC", scheme: "BANK", plan: "*", category: "hospital", description: "Headache/stress clinics, spas, health resorts excluded", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Bankmed 1.11" },
  { ruleId: "BANK_EX_RECUPERATIVE", scheme: "BANK", plan: "*", category: "hospital", description: "Holidays for recuperative purposes excluded", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Bankmed 1.12" },
  { ruleId: "BANK_EX_MISSED_APPT", scheme: "BANK", plan: "*", category: "gp_consultation", description: "Missed appointments, interest charges, legal/collection fees excluded", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Bankmed 1.13" },
  { ruleId: "BANK_EX_ANTENATAL_CLASS", scheme: "BANK", plan: "*", category: "maternity", description: "Antenatal/postnatal classes excluded (unless pre-authorised maternity programme)", networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Bankmed 1.14" },
  { ruleId: "BANK_EX_SUNGLASSES", scheme: "BANK", plan: "*", category: "optical", description: "Sunglasses and spectacle cases excluded", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Bankmed 1.15" },
  { ruleId: "BANK_EX_HEARING_AID_BATTERY", scheme: "BANK", plan: "*", category: "appliance", description: "Replacement batteries for hearing aids excluded", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Bankmed 1.16" },
  { ruleId: "BANK_EX_CLINICAL_TRIALS", scheme: "BANK", plan: "*", category: "hospital", description: "Clinical trials excluded unless pre-authorised", networkRequired: false, preAuthRequired: true, severity: "error", notes: "Bankmed 1.17" },
  { ruleId: "BANK_EX_EXPERIMENTAL", scheme: "BANK", plan: "*", category: "hospital", description: "Experimental/unproven/unregistered treatments excluded", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Bankmed 1.18" },
  { ruleId: "BANK_EX_VOCATIONAL", scheme: "BANK", plan: "*", category: "mental_health", description: "Vocational/child/marriage guidance, sex therapy, school readiness excluded", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Bankmed 1.19" },
  { ruleId: "BANK_EX_DENTAL_BLEACH", scheme: "BANK", plan: "*", category: "dental", description: "Tooth bleaching (non-root canal treated) and gold in dentures excluded", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Bankmed 1.20" },
  { ruleId: "BANK_EX_SLEEP_HYPNO", scheme: "BANK", plan: "*", category: "mental_health", description: "Sleep therapy and hypnotherapy excluded", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Bankmed 1.21" },
  { ruleId: "BANK_EX_COMPLICATION_EXCLUSION", scheme: "BANK", plan: "*", category: "hospital", description: "Complications from excluded procedures also excluded (unless PMB)", networkRequired: false, preAuthRequired: false, severity: "warning", notes: "Bankmed 1.22. Exception: if complication is PMB." },
  { ruleId: "BANK_EX_FOREIGN_CLAIMS", scheme: "BANK", plan: "*", category: "hospital", description: "Foreign claims: PMB does not apply. Same Rand limits as SA claims. Non-emergency admission needs prior approval.", networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Bankmed 5.1-5.3" },
  { ruleId: "BANK_EX_DENTAL_SCALING", scheme: "BANK", plan: "*", category: "dental", description: "Scaling/polishing more than twice a year may be declined per managed care protocols", visitLimit: 2, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: false, severity: "warning", notes: "Bankmed 3" },
];

// ─── DISCOVERY/NETCARE EXCLUSION RULES ──────────────────────────────────────
// Source: Netcare Medical Scheme Annexure C 2025 (3 pages)

export const DISCOVERY_EXCLUSION_RULES: BenefitLimitRule[] = [
  { ruleId: "DH_EX_SELF_INFLICTED", scheme: "DH", plan: "*", category: "hospital", description: "Wilful self-inflicted injury excluded (except PMB)", networkRequired: false, preAuthRequired: false, severity: "warning", notes: "PMB exception applies — attempted suicide = PMB." },
  { ruleId: "DH_EX_RECUPERATIVE", scheme: "DH", plan: "*", category: "hospital", description: "Holidays for recuperative purposes excluded", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Discovery Annexure C." },
  { ruleId: "DH_EX_OLD_AGE_HOME", scheme: "DH", plan: "*", category: "hospital", description: "Geriatric hospital, old age home, frail care facility excluded", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Discovery Annexure C." },
  { ruleId: "DH_EX_THIRD_PARTY", scheme: "DH", plan: "*", category: "hospital", description: "Third-party liability injuries: scheme pays but member must reimburse from recovery", networkRequired: false, preAuthRequired: false, severity: "info", notes: "MVA injuries etc. Scheme has subrogation rights." },
  { ruleId: "DH_EX_RESEARCH", scheme: "DH", plan: "*", category: "hospital", description: "Research environment expenses excluded", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Clinical trial related." },
  { ruleId: "DH_EX_INSURANCE_EXAM", scheme: "DH", plan: "*", category: "gp_consultation", description: "Insurance/fitness/overseas visit medical examinations excluded", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Discovery Annexure C." },
  { ruleId: "DH_EX_PRO_SPORT_INJURY", scheme: "DH", plan: "*", category: "hospital", description: "Professional sport/speed contest injuries excluded (unless PMB)", networkRequired: false, preAuthRequired: false, severity: "warning", notes: "Professional athletes — COIDA may apply." },
  { ruleId: "DH_EX_SUBSTANCE_ABUSE", scheme: "DH", plan: "*", category: "hospital", description: "Drug/alcohol abuse injuries excluded (unless SANCA programme or PMB)", networkRequired: false, preAuthRequired: false, severity: "warning", notes: "Must be registered with SANCA-approved programme." },
  { ruleId: "DH_EX_OBESITY", scheme: "DH", plan: "*", category: "medicine_acute", description: "Obesity treatment and slimming preparations excluded", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Discovery Annexure C." },
  { ruleId: "DH_EX_IVF", scheme: "DH", plan: "*", category: "maternity", description: "IVF, GIFT, ZIFT, embryo transport, surrogate parenting excluded (except PMB 902M basic)", networkRequired: false, preAuthRequired: false, severity: "error", notes: "PMB covers basic investigations only (HSG, blood tests, laparoscopy)." },
  { ruleId: "DH_EX_BABY_FOOD", scheme: "DH", plan: "*", category: "medicine_acute", description: "Patent foods and baby food excluded (unless PMB condition)", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Discovery Annexure C." },
  { ruleId: "DH_EX_BANDAGES_SUNSCREEN", scheme: "DH", plan: "*", category: "medicine_acute", description: "Bandages, cotton wool, sunscreen, shampoos, skin cleansers excluded", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Over-the-counter items." },
  { ruleId: "DH_EX_COSMETIC", scheme: "DH", plan: "*", category: "hospital", description: "Cosmetic surgery excluded (gastroplasty, blepharoplasty, breast aug/reduction, liposuction, rhinoplasty, face lift)", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Comprehensive list of excluded cosmetic procedures." },
  { ruleId: "DH_EX_VITAMINS", scheme: "DH", plan: "*", category: "medicine_acute", description: "Vitamins, tonics, mineral supplements excluded (unless with antibiotic or PMB)", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Discovery Annexure C." },
  { ruleId: "DH_EX_MISSED_APPT", scheme: "DH", plan: "*", category: "gp_consultation", description: "Missed appointments excluded", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Discovery Annexure C." },
  { ruleId: "DH_EX_ORTHO_21", scheme: "DH", plan: "*", category: "dental", description: "Orthodontic treatment for 21+ excluded", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Under 21 only." },
  { ruleId: "DH_EX_STI", scheme: "DH", plan: "*", category: "hospital", description: "STI treatment excluded (except PMBs)", networkRequired: false, preAuthRequired: false, severity: "warning", notes: "HIV = CDL/PMB. Other STIs = excluded unless PMB." },
  { ruleId: "DH_EX_SUNGLASSES", scheme: "DH", plan: "*", category: "optical", description: "Sunglasses and tinted lenses excluded (unless from positive savings)", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Can use savings account balance." },
  { ruleId: "DH_EX_PREVENTIVE_UNLISTED", scheme: "DH", plan: "*", category: "gp_consultation", description: "Preventive healthcare services not explicitly listed under Preventive Care benefit excluded", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Only listed preventive screenings covered." },
  { ruleId: "DH_EX_FOREIGN_TREATMENT", scheme: "DH", plan: "*", category: "hospital", description: "Treatment outside SA excluded", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Unless emergency travel benefit applies." },
  { ruleId: "DH_EX_LAP_APPROACH", scheme: "DH", plan: "*", category: "hospital", description: "Laparoscopic approach excluded unless specifically authorised", networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Open procedure default. Lap approach needs specific auth." },
  { ruleId: "DH_EX_ANTENATAL_CLASS", scheme: "DH", plan: "*", category: "maternity", description: "Antenatal/postnatal classes excluded unless registered on maternity programme", networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Register on maternity programme for coverage." },
];

// ─── DISCOVERY COMPREHENSIVE BENEFIT LIMITS (2026) ──────────────────────────
// Source: Discovery Comprehensive Plan Guide 2026 (Classic, Classic Smart)

export const DISCOVERY_COMPREHENSIVE_LIMITS: BenefitLimitRule[] = [
  // Hospital — unlimited
  { ruleId: "DH_COMP_HOSPITAL", scheme: "DH", plan: "Classic Comprehensive", category: "hospital", description: "Hospital: unlimited, any private/public hospital approved by Scheme", networkRequired: false, preAuthRequired: true, severity: "info", notes: "No overall hospital limit. Payment at agreed rate for contracted providers, up to 200% DHR for others." },
  { ruleId: "DH_SMART_HOSPITAL", scheme: "DH", plan: "Classic Smart Comprehensive", category: "hospital", description: "Hospital: unlimited, Smart Hospital Network required", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Must use Smart Hospital Network. R12,650 upfront for non-network planned admissions." },
  { ruleId: "DH_SMART_HOSP_COPAY", scheme: "DH", plan: "Classic Smart Comprehensive", category: "hospital", description: "Non-network hospital: R12,650 upfront co-payment", coPaymentRands: 12650, networkRequired: true, preAuthRequired: true, severity: "error", notes: "Applies to planned admissions outside Smart Hospital Network." },

  // Day Surgery Network co-payments
  { ruleId: "DH_COMP_DSN_COPAY", scheme: "DH", plan: "Classic Comprehensive", category: "hospital", description: "Out-of-Day Surgery Network: R7,250 upfront co-payment", coPaymentRands: 7250, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Classic Comprehensive: upfront payment for procedures outside Day Surgery Network." },
  { ruleId: "DH_SMART_DSN_COPAY", scheme: "DH", plan: "Classic Smart Comprehensive", category: "hospital", description: "Out-of-Day Surgery Network: R12,650 upfront co-payment", coPaymentRands: 12650, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Classic Smart: upfront payment for procedures outside Smart Day Surgery Network." },

  // Scopes co-payments (Classic Comprehensive)
  { ruleId: "DH_COMP_SCOPE_HOSP", scheme: "DH", plan: "Classic Comprehensive", category: "hospital", description: "Scope in hospital: R6,800 co-payment (single), R8,400 (bidirectional)", coPaymentRands: 6800, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Reduces to R5,450/R6,850 with value-based network doctor. Day clinic: R4,650/R5,700." },
  { ruleId: "DH_COMP_SCOPE_ROOMS", scheme: "DH", plan: "*", category: "hospital", description: "In-rooms scope non-network: R1,800 (single), R3,100 (bidirectional)", coPaymentRands: 1800, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "No co-payment at network in-rooms provider." },
  { ruleId: "DH_SMART_SCOPE_NONNETWORK", scheme: "DH", plan: "Classic Smart Comprehensive", category: "hospital", description: "Scope outside Day Surgery Network: R12,650 upfront co-payment", coPaymentRands: 12650, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Classic Smart must use Smart Day Surgery Network for scopes." },

  // MRI/CT out of hospital
  { ruleId: "DH_COMP_MRI_CT_OOH", scheme: "DH", plan: "*", category: "radiology", description: "MRI/CT out-of-hospital: first R4,000 from day-to-day benefits, rest from Hospital Benefit", perEventLimitRands: 4000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "If not related to current admission. Conservative back/neck: 1 scan per spinal/neck region per year." },

  // Oncology
  { ruleId: "DH_COMP_ONCOLOGY", scheme: "DH", plan: "Classic Comprehensive", category: "oncology", description: "Oncology: first R500,000 at 100% DHR per 12-month cycle, then 80% DHR", annualLimitRands: 500000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Extended Oncology Benefit + Innovation Benefit available. 50% co-pay on innovative cancer medicine." },
  { ruleId: "DH_SMART_ONCOLOGY", scheme: "DH", plan: "Classic Smart Comprehensive", category: "oncology", description: "Oncology: first R375,000 at 100% DHR per 12-month cycle, then 80% DHR", annualLimitRands: 375000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Sub-set of precision cancer medicine covered. 50% co-pay. No Extended Oncology Benefit." },

  // Prosthesis — joint replacement
  { ruleId: "DH_COMP_PROSTHESIS_HIP_KNEE", scheme: "DH", plan: "*", category: "prosthesis", description: "Hip/knee prosthesis: unlimited in-network, R31,850/admission out-of-network", perEventLimitRands: 31850, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "No limit if network provider used. R31,850 max per prosthesis per admission if out-of-network." },
  { ruleId: "DH_COMP_PROSTHESIS_SHOULDER", scheme: "DH", plan: "*", category: "prosthesis", description: "Shoulder prosthesis: unlimited in-network, R51,500 out-of-network", perEventLimitRands: 51500, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "No limit if network provider used. R51,500 max if out-of-network." },
  { ruleId: "DH_COMP_SPINAL_PROSTHESIS", scheme: "DH", plan: "*", category: "prosthesis", description: "Spinal surgery prosthesis: unlimited with preferred supplier; non-preferred R27,000 (1 level) / R53,950 (2+ levels)", perEventLimitRands: 27000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Limited to 1 procedure per person per year. Full cover at spinal surgery network." },

  // Cochlear implants / hearing aids
  { ruleId: "DH_COMP_COCHLEAR_CLASSIC", scheme: "DH", plan: "Classic Comprehensive", category: "appliance", description: "Cochlear implants: R252,000/person. Processor upgrade R190,000 per 3 years", perBeneficiaryLimit: 252000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Auditory brain implants included." },
  { ruleId: "DH_COMP_COCHLEAR_SMART", scheme: "DH", plan: "Classic Smart Comprehensive", category: "appliance", description: "Cochlear implants: R150,000/person. Processor upgrade R78,000 per 3 years", perBeneficiaryLimit: 150000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Lower limit on Classic Smart." },
  { ruleId: "DH_COMP_BONE_HEARING", scheme: "DH", plan: "*", category: "appliance", description: "Bone-Anchored Hearing Aids: R192,000/person", perBeneficiaryLimit: 192000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Internal nerve stimulators." },

  // Mental health
  { ruleId: "DH_COMP_MENTAL_INPATIENT", scheme: "DH", plan: "*", category: "mental_health", description: "Mental health in-hospital: 21 days/year (major affective/anorexia/bulimia) OR 15 outpatient sessions, 3 days for attempted suicide", daysLimit: 21, visitLimit: 15, visitPeriodMonths: 12, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "12 out-of-hospital consults for acute stress. Full cover at network facility, 80% DHR elsewhere." },

  // Rehabilitation
  { ruleId: "DH_COMP_REHAB", scheme: "DH", plan: "*", category: "hospital", description: "Alcohol/drug rehab: 21 days/person/year + 3 days detox per admission", daysLimit: 21, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Full cover at network facility. 80% DHR at non-network." },

  // Maternity
  { ruleId: "DH_COMP_MATERNITY_WARD", scheme: "DH", plan: "*", category: "maternity", description: "Maternity private ward: R2,800/day", perEventLimitRands: 2800, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Paid from Maternity Benefit for deliveries." },
  { ruleId: "DH_COMP_MATERNITY_ANTENATAL", scheme: "DH", plan: "*", category: "maternity", description: "Antenatal consultations: up to 12 (Classic) / covered (both plans)", visitLimit: 12, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Gynaecologist, GP or midwife. 2x 2D ultrasounds or 1 + nuchal translucency." },
  { ruleId: "DH_COMP_MATERNITY_DEVICES", scheme: "DH", plan: "*", category: "maternity", description: "Essential maternity devices (breast pump, thermometer): R6,500", perEventLimitRands: 6500, networkRequired: false, preAuthRequired: false, severity: "info", notes: "25% co-payment applies. Clinical protocols apply." },
  { ruleId: "DH_COMP_MATERNITY_CLASSES", scheme: "DH", plan: "*", category: "maternity", description: "Antenatal/postnatal classes: 5 sessions, up to 2 years after birth", visitLimit: 5, visitPeriodMonths: 24, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Plus 1 breastfeeding consultation + 1 dietitian + 2 mental health consults." },

  // Optical
  { ruleId: "DH_COMP_OPTICAL", scheme: "DH", plan: "*", category: "optical", description: "Optical: R7,500/person (lenses, frames, contacts, refractive surgery)", perBeneficiaryLimit: 7500, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Day-to-day benefit limit. Paid from MSA/ATB." },

  // Dental
  { ruleId: "DH_COMP_DENTAL_DAY", scheme: "DH", plan: "*", category: "dental", description: "Dental appliances/orthodontic: R37,500/person from day-to-day benefits", perBeneficiaryLimit: 37500, networkRequired: false, preAuthRequired: false, severity: "info", notes: "No overall limit for basic dental. Complex/orthodontic up to R37,500/person or ATB limit." },
  { ruleId: "DH_COMP_DENTAL_TRAUMA", scheme: "DH", plan: "*", category: "dental", description: "Dental trauma: R70,800/person/year for appliances and prostheses", perBeneficiaryLimit: 70800, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Basic Dental Trauma Benefit. Clinical entry criteria apply." },
  { ruleId: "DH_COMP_DENTAL_HOSP_ADULT", scheme: "DH", plan: "*", category: "dental", description: "Dental hospital admission co-pay (13+): R8,950 hospital / R5,750 day clinic", coPaymentRands: 8950, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Under 13: R3,470 hospital / R1,550 day clinic. Waived for severe dental/oral surgery." },

  // Allied health
  { ruleId: "DH_COMP_ALLIED_HEALTH", scheme: "DH", plan: "*", category: "allied_health", description: "Allied/therapeutic/psychology: R25,500 (single) to R49,050 (3+ dependants)", annualLimitRands: 25500, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Physio, chiro, psychologist, OT, speech, audio, dietitian, etc. From MSA/ATB." },

  // External medical items
  { ruleId: "DH_COMP_EXTERNAL_ITEMS", scheme: "DH", plan: "*", category: "appliance", description: "External medical items (wheelchairs, crutches, prostheses): R64,200/family", annualLimitRands: 64200, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Day-to-day benefit." },
  { ruleId: "DH_COMP_HEARING_AIDS", scheme: "DH", plan: "*", category: "appliance", description: "Hearing aids: R31,250/family", annualLimitRands: 31250, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Accessories from external medical items benefit." },

  // Antenatal classes
  { ruleId: "DH_COMP_ANTENATAL_CLASSES", scheme: "DH", plan: "*", category: "maternity", description: "Antenatal classes: R2,500/family", annualLimitRands: 2500, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Day-to-day benefit." },

  // Personal Health Fund
  { ruleId: "DH_COMP_PHF_BASE", scheme: "DH", plan: "*", category: "day_to_day", description: "Personal Health Fund: up to R12,000 base, R24,000 with Vitality challenges", annualLimitRands: 12000, networkRequired: false, preAuthRequired: false, severity: "info", notes: "R1,000 advance per adult. Boost: R3,000/adult/year via actions + R3,000/adult via challenges." },

  // Smart GP
  { ruleId: "DH_SMART_GP", scheme: "DH", plan: "Classic Smart Comprehensive", category: "gp_consultation", description: "Smart GP Network: unlimited consultations, R75 co-payment per visit", coPaymentRands: 75, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Video consultations covered in full up to DHR. Claims from ATB after threshold reached." },

  // MSA
  { ruleId: "DH_COMP_MSA_CLASSIC", scheme: "DH", plan: "Classic Comprehensive", category: "savings", description: "Medical Savings Account: 25% of monthly contribution", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Unused balance carries over. DEB available in self-payment gap." },
  { ruleId: "DH_COMP_MSA_SMART", scheme: "DH", plan: "Classic Smart Comprehensive", category: "savings", description: "Medical Savings Account: 15% of monthly contribution", networkRequired: false, preAuthRequired: false, severity: "info", notes: "No DEB on Classic Smart. Smart GP visits instead." },

  // Specialised Medicine & Technology
  { ruleId: "DH_COMP_SPEC_MED_TECH", scheme: "DH", plan: "Classic Comprehensive", category: "hospital", description: "Specialised Medicine & Technology Benefit: R200,000/person/year", perBeneficiaryLimit: 200000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "High-cost medicine and advanced treatments. 20% co-payment. Not available on Classic Smart." },

  // Overseas treatment
  { ruleId: "DH_COMP_OVERSEAS", scheme: "DH", plan: "*", category: "hospital", description: "Overseas Treatment Benefit: R500,000/person. International Travel: R5M/person/journey", perBeneficiaryLimit: 500000, networkRequired: false, preAuthRequired: true, severity: "info", notes: "20% co-payment on overseas treatment. Travel benefit = 90 days, pre-existing excluded." },

  // ART (fertility)
  { ruleId: "DH_COMP_ART", scheme: "DH", plan: "*", category: "maternity", description: "Assisted Reproductive Therapy: R140,000/person/year at 75% DHR", perBeneficiaryLimit: 140000, coPaymentPercent: 25, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "1-2 cycles per year depending on age. Includes consultations, retrieval, transfer, medicine." },

  // Home monitoring devices
  { ruleId: "DH_COMP_HOME_MONITOR", scheme: "DH", plan: "*", category: "appliance", description: "Home Monitoring Device Benefit: R4,850/person/year", perBeneficiaryLimit: 4850, networkRequired: false, preAuthRequired: true, severity: "info", notes: "For chronic and acute conditions. Does not affect day-to-day benefits." },

  // Prescribed medicine limits
  { ruleId: "DH_COMP_PRESCRIBED_MED", scheme: "DH", plan: "*", category: "medicine_acute", description: "Prescribed medicine (Sch 3+): R43,600 (single) to R67,650 (3+ dependants)", annualLimitRands: 43600, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Day-to-day benefit limit. OTC from PHF/MSA — no ATB accumulation." },

  // Virtual Urgent Care
  { ruleId: "DH_COMP_VIRTUAL_URGENT", scheme: "DH", plan: "*", category: "gp_consultation", description: "Virtual Urgent Care: 4 sessions/family/year", visitLimit: 4, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: false, severity: "info", notes: "24/7 online doctor consultation. Clinical entry criteria apply." },
];

// ─── DISCOVERY KEYCARE BENEFIT LIMITS (2026) ────────────────────────────────
// Source: Discovery KeyCare Plan Guide 2026 (Plus, Core, Start, Start Regional)

export const DISCOVERY_KEYCARE_LIMITS: BenefitLimitRule[] = [
  // Hospital — unlimited but network-dependent
  { ruleId: "DH_KC_PLUS_HOSPITAL", scheme: "DH", plan: "KeyCare Plus", category: "hospital", description: "Hospital: unlimited in KeyCare Hospital Network", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Any hospital in KeyCare Network. Non-network planned = not paid." },
  { ruleId: "DH_KC_CORE_HOSPITAL", scheme: "DH", plan: "KeyCare Core", category: "hospital", description: "Hospital: unlimited in KeyCare Hospital Network", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Same network as KeyCare Plus." },
  { ruleId: "DH_KC_START_HOSPITAL", scheme: "DH", plan: "KeyCare Start", category: "hospital", description: "Hospital: unlimited at chosen KeyCare Start Network Hospital", networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Must use chosen KeyCare Start Network Hospital. Non-network planned = not paid." },

  // Non-network hospital
  { ruleId: "DH_KC_NONNETWORK_HOSP", scheme: "DH", plan: "*", category: "hospital", description: "Non-network hospital: will not pay hospital/related accounts for planned procedures", networkRequired: true, preAuthRequired: true, severity: "error", notes: "PMB exceptions apply — if PMB, pays at 80% DHR." },

  // Home-based hospital DSP upfront
  { ruleId: "DH_KC_HOME_HOSP_COPAY", scheme: "DH", plan: "*", category: "hospital", description: "Decline home-based hospital care when recommended: R5,450 upfront", coPaymentRands: 5450, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Applies when treating provider recommends home-based care and member declines." },

  // Cataract non-network co-payment (Start/Start Regional)
  { ruleId: "DH_KC_START_CATARACT_COPAY", scheme: "DH", plan: "KeyCare Start", category: "hospital", description: "Cataract surgery at non-network facility: R6,250 upfront", coPaymentRands: 6250, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "KeyCare Start and Start Regional: R6,250 at non-network facility." },

  // GP consultations — unlimited with network
  { ruleId: "DH_KC_GP_UNLIMITED", scheme: "DH", plan: "*", category: "gp_consultation", description: "GP consultations: unlimited at nominated KeyCare Network GP. Pre-auth after 15th visit", visitLimit: 15, visitPeriodMonths: 12, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Must nominate GP from plan-specific network. Pre-auth required from 16th visit." },

  // Specialist benefit
  { ruleId: "DH_KC_PLUS_SPECIALIST", scheme: "DH", plan: "KeyCare Plus", category: "specialist", description: "Specialist: R5,750/person/year, GP referral required", perBeneficiaryLimit: 5750, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "MRI/CT out-of-hospital paid up to specialist limit. Maxillo-facial/periodontist/maternity — no referral needed." },
  { ruleId: "DH_KC_CORE_SPECIALIST", scheme: "DH", plan: "KeyCare Core", category: "specialist", description: "Specialist: R5,750/person/year, GP referral required", perBeneficiaryLimit: 5750, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Same as KeyCare Plus specialist benefit." },
  { ruleId: "DH_KC_START_SPECIALIST", scheme: "DH", plan: "KeyCare Start", category: "specialist", description: "Specialist: R2,850/person/year, 2 visits max, GP referral required", perBeneficiaryLimit: 2850, visitLimit: 2, visitPeriodMonths: 12, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Must be referred by nominated KeyCare Start Network GP." },

  // Casualty
  { ruleId: "DH_KC_PLUS_CASUALTY", scheme: "DH", plan: "KeyCare Plus", category: "gp_consultation", description: "Casualty: 1 visit/person/year at KeyCare network hospital, R520 co-payment", visitLimit: 1, visitPeriodMonths: 12, coPaymentRands: 520, networkRequired: true, preAuthRequired: true, severity: "info", notes: "Pre-auth required. Not covered on Core/Start." },

  // Medical equipment (Plus only)
  { ruleId: "DH_KC_PLUS_EQUIPMENT", scheme: "DH", plan: "KeyCare Plus", category: "appliance", description: "Medical equipment (wheelchairs, crutches, walkers): R6,050/family/year", annualLimitRands: 6050, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Network provider required. Not covered on Start/Start Regional." },

  // Optical
  { ruleId: "DH_KC_OPTICAL", scheme: "DH", plan: "*", category: "optical", description: "Optical: 1 eye test per person every 24 months at KeyCare Optometry Network", visitLimit: 1, visitPeriodMonths: 24, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Specific range of glasses. Contacts in lieu of glasses. New glasses/contacts every 24 months." },

  // Dental
  { ruleId: "DH_KC_DENTAL", scheme: "DH", plan: "*", category: "dental", description: "Dental: consultations, fillings, tooth removals at network dentist", networkRequired: true, preAuthRequired: false, severity: "info", notes: "Certain rules and limits may apply. Network dentist required." },

  // Maternity (Plus/Core)
  { ruleId: "DH_KC_MATERNITY_ANTENATAL", scheme: "DH", plan: "KeyCare Plus", category: "maternity", description: "Maternity: 8 antenatal consultations, 2 ultrasounds, flu vaccine, blood tests", visitLimit: 8, visitPeriodMonths: 12, networkRequired: true, preAuthRequired: false, severity: "info", notes: "GP must refer on Plus. 5 antenatal/postnatal classes. 2 mental health consults. Not available on Start." },

  // Mental health
  { ruleId: "DH_KC_MENTAL_HEALTH", scheme: "DH", plan: "*", category: "mental_health", description: "Mental health: all admissions covered in full at network facility, 80% DHR elsewhere", networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Same day limits as Comprehensive (21 days). Network facility required." },

  // Rehabilitation
  { ruleId: "DH_KC_REHAB", scheme: "DH", plan: "*", category: "hospital", description: "Rehab: 21 days/person/year, 3 days detox per admission", daysLimit: 21, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Full cover at network. 80% DHR at non-network." },

  // Chronic medicine
  { ruleId: "DH_KC_CHRONIC", scheme: "DH", plan: "*", category: "chronic", description: "Chronic medicine: CDL conditions on KeyCare medicine list at network pharmacy/GP", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Non-network = 20% co-payment. Start = state facility. Start Regional = network pharmacy or GP." },

  // Nurse-led consultations
  { ruleId: "DH_KC_NURSE_CONSULT", scheme: "DH", plan: "*", category: "gp_consultation", description: "Nurse-led consultations: 2 per person per year at network provider", visitLimit: 2, visitPeriodMonths: 12, networkRequired: true, preAuthRequired: false, severity: "info", notes: "With or without video GP consultation. GP referral for face-to-face if needed." },

  // Virtual Urgent Care
  { ruleId: "DH_KC_VIRTUAL_URGENT", scheme: "DH", plan: "*", category: "gp_consultation", description: "Virtual Urgent Care: 1 session/person/year", visitLimit: 1, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Clinical entry criteria apply." },

  // Personal Health Fund
  { ruleId: "DH_KC_PHF", scheme: "DH", plan: "*", category: "day_to_day", description: "Personal Health Fund: up to R1,000 base, R2,000 with Vitality challenges", annualLimitRands: 1000, networkRequired: false, preAuthRequired: false, severity: "info", notes: "R500 advance per adult. Boost: R250/challenge, R500 max/person/year." },

  // Home monitoring
  { ruleId: "DH_KC_HOME_MONITOR", scheme: "DH", plan: "*", category: "appliance", description: "Home Monitoring Device Benefit: R4,850/person/year", perBeneficiaryLimit: 4850, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Same as Comprehensive plans." },

  // Day surgery
  { ruleId: "DH_KC_DAY_SURGERY", scheme: "DH", plan: "*", category: "hospital", description: "Day Surgery: covered at 100% DHR in plan-specific KeyCare Day Surgery Network", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Plus = KeyCare DSN. Start = KeyCare Start DSN. Start Regional = KeyCare Start Regional DSN." },

  // Cancer
  { ruleId: "DH_KC_CANCER", scheme: "DH", plan: "*", category: "oncology", description: "Cancer: PMB cover at network provider. 20% co-payment for non-designated providers", coPaymentPercent: 20, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Start/Start Regional: state facility only. Plus/Core: network provider." },

  // Dialysis
  { ruleId: "DH_KC_DIALYSIS", scheme: "DH", plan: "*", category: "renal", description: "Chronic dialysis: full cover at network provider, 80% DHR elsewhere", networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Start/Start Regional: state facility. Network required for full cover." },

  // KeyCare exclusions (additional to general)
  { ruleId: "DH_KC_EX_JOINT_REPLACE", scheme: "DH", plan: "*", category: "prosthesis", description: "Joint replacements (hips, knees, etc.) excluded on KeyCare plans", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Extra KeyCare exclusion. Not available on any KeyCare plan." },
];

// ─── BESTMED PACE BENEFIT LIMITS (2026) ─────────────────────────────────────
// Source: Annexure B.2 Pace Benefit Options 2026

export const BESTMED_PACE_LIMITS: BenefitLimitRule[] = [
  // Hospital — unlimited at Scheme tariff
  { ruleId: "BM_PACE_HOSPITAL", scheme: "BM", plan: "*", category: "hospital", description: "Hospital: unlimited at 100% Scheme tariff, DSP Network, pre-auth required", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Full cross-subsidisation. No annual limit. DSP Hospital Network." },
  { ruleId: "BM_PACE_DAY_COPAY", scheme: "BM", plan: "*", category: "hospital", description: "Day procedure in acute hospital (not day hospital): R2,872 co-payment", coPaymentRands: 2872, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Co-payment waived if DSP doesn't work in day hospital and arranged with Scheme." },

  // Mental health
  { ruleId: "BM_PACE_MENTAL", scheme: "BM", plan: "*", category: "mental_health", description: "Mental health: 21 inpatient days OR 15 outpatient sessions per beneficiary/year, DSP Network", daysLimit: 21, visitLimit: 15, visitPeriodMonths: 12, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "All Pace options: same 21-day/15-session limit." },

  // Substance abuse
  { ruleId: "BM_PACE_SUBSTANCE", scheme: "BM", plan: "*", category: "mental_health", description: "Chemical/substance abuse: 21 days in-hospital, PMB only, DSP Network", daysLimit: 21, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Limited to PMB conditions." },

  // Take-home medicine
  { ruleId: "BM_PACE1_TAKEHOME", scheme: "BM", plan: "Pace1", category: "medicine_acute", description: "Take-home medicine from retail pharmacy: R550 per discharge", perEventLimitRands: 550, networkRequired: false, preAuthRequired: false, severity: "info", notes: "7-day supply max. Must claim within 3 days of discharge." },
  { ruleId: "BM_PACE2_TAKEHOME", scheme: "BM", plan: "Pace2", category: "medicine_acute", description: "Take-home medicine from retail pharmacy: R600 per discharge", perEventLimitRands: 600, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Pace2 and Pace3 same limit." },
  { ruleId: "BM_PACE3_TAKEHOME", scheme: "BM", plan: "Pace3", category: "medicine_acute", description: "Take-home medicine from retail pharmacy: R600 per discharge", perEventLimitRands: 600, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Same as Pace2." },

  // Biological medicine
  { ruleId: "BM_PACE1_BIOLOGICAL", scheme: "BM", plan: "Pace1", category: "hospital", description: "Biological medicine: R36,430/family/year (in-hospital only)", annualLimitRands: 36430, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Pace1: in-hospital only, PMB conditions." },
  { ruleId: "BM_PACE2_BIOLOGICAL", scheme: "BM", plan: "Pace2", category: "chronic", description: "Biological medicine: R210,208/beneficiary/year", perBeneficiaryLimit: 210208, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "In/out of hospital combined." },
  { ruleId: "BM_PACE3_BIOLOGICAL", scheme: "BM", plan: "Pace3", category: "chronic", description: "Biological medicine: R420,695/beneficiary/year", perBeneficiaryLimit: 420695, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Pace3 biological limit." },

  // Dental / oral surgery (in-hospital)
  { ruleId: "BM_PACE1_DENTAL_HOSP", scheme: "BM", plan: "Pace1", category: "dental", description: "Dental in-hospital: R10,217/family/year", annualLimitRands: 10217, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Surgical extractions, dental surgery, implant surgery, orthodontic surgery." },
  { ruleId: "BM_PACE2_DENTAL_HOSP", scheme: "BM", plan: "Pace2", category: "dental", description: "Dental in-hospital: R16,979/family/year", annualLimitRands: 16979, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Pace2 dental in-hospital." },
  { ruleId: "BM_PACE3_DENTAL_HOSP", scheme: "BM", plan: "Pace3", category: "dental", description: "Dental in-hospital: R21,335/family/year", annualLimitRands: 21335, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Pace3 dental in-hospital." },

  // Major maxillo-facial surgery
  { ruleId: "BM_PACE1_MAXFAC", scheme: "BM", plan: "Pace1", category: "dental", description: "Major maxillo-facial surgery: R16,527/family/year", annualLimitRands: 16527, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Pace1 only — limited list of conditions. Pace2-4: unlimited for listed conditions." },

  // Prosthesis — Internal
  { ruleId: "BM_PACE1_PROSTHESIS", scheme: "BM", plan: "Pace1", category: "prosthesis", description: "Internal prosthesis: R114,189/family/year", annualLimitRands: 114189, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Sub-limits: Vascular R74,674, Pacemaker R71,068 (DSP), Spinal R41,618, Mesh R15,626, Gynae/Uro R11,269, Lens R8,565/eye, Functional R39,060." },
  { ruleId: "BM_PACE2_PROSTHESIS", scheme: "BM", plan: "Pace2", category: "prosthesis", description: "Internal prosthesis: R146,642/family/year", annualLimitRands: 146642, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Sub-limits: Vascular R74,674, Pacemaker R79,255, Spinal R73,517, Stents R24,040, Mesh R24,040, Gynae/Uro R17,954, Lens R15,416/eye, Hip/Major R66,033, Knee/Shoulder R76,627, Minor R28,471, Functional R41,358." },
  { ruleId: "BM_PACE3_PROSTHESIS", scheme: "BM", plan: "Pace3", category: "prosthesis", description: "Internal prosthesis: R147,394/family/year", annualLimitRands: 147394, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Sub-limits: Vascular R79,269, Pacemaker R79,255, Spinal R73,657, Stents R24,040, Mesh R24,040, Gynae/Uro R18,030, Lens R15,416/eye, Hip/Major R66,108, Knee/Shoulder R77,001, Minor R28,471, Functional R41,358." },

  // Prosthesis — External
  { ruleId: "BM_PACE1_EXT_PROSTHESIS", scheme: "BM", plan: "Pace1", category: "prosthesis", description: "External prosthesis: R28,998/family/year", annualLimitRands: 28998, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Artificial limbs: 1 per 60 months. 2 quotations required." },
  { ruleId: "BM_PACE2_EXT_PROSTHESIS", scheme: "BM", plan: "Pace2", category: "prosthesis", description: "External prosthesis: R34,557/family/year", annualLimitRands: 34557, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Same conditions as Pace1." },
  { ruleId: "BM_PACE3_EXT_PROSTHESIS", scheme: "BM", plan: "Pace3", category: "prosthesis", description: "External prosthesis: R34,708/family/year", annualLimitRands: 34708, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Same conditions as Pace1/2." },

  // Joint replacement exclusion (Pace1 only)
  { ruleId: "BM_PACE1_JOINT_EXCL", scheme: "BM", plan: "Pace1", category: "prosthesis", description: "Joint replacement: PMB only. Hip R42,369, Knee/Shoulder R56,344, Minor R17,505", networkRequired: true, preAuthRequired: true, severity: "error", notes: "Pace1: non-PMB joint replacement excluded. Sub-limits from internal prosthesis." },

  // Breast reduction
  { ruleId: "BM_PACE_BREAST_REDUCTION", scheme: "BM", plan: "Pace2", category: "hospital", description: "Medically necessary breast reduction: R100,000/family/year (Pace2-4)", annualLimitRands: 100000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "No benefit on Pace1. Pace2/3/4: R100,000 limit." },

  // Appliances during hospitalisation
  { ruleId: "BM_PACE_APPLIANCE_HOSP", scheme: "BM", plan: "*", category: "appliance", description: "Appliances during hospitalisation: R15,690/family/year", annualLimitRands: 15690, networkRequired: true, preAuthRequired: true, severity: "info", notes: "Back, leg, arm, neck support, crutches, surgical footwear, elastic stockings." },

  // Specialised radiology (MRI/CT)
  { ruleId: "BM_PACE1_SPEC_RADIOLOGY", scheme: "BM", plan: "Pace1", category: "radiology", description: "Specialised radiology (MRI/CT): R41,840/family/year combined in/out hospital", annualLimitRands: 41840, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "PET scan: 1/beneficiary/year, separate from limit." },
  { ruleId: "BM_PACE2_SPEC_RADIOLOGY", scheme: "BM", plan: "Pace2", category: "radiology", description: "Specialised radiology (MRI/CT): R43,932/family/year", annualLimitRands: 43932, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Pace2 and Pace3 same limit." },
  { ruleId: "BM_PACE3_SPEC_RADIOLOGY", scheme: "BM", plan: "Pace3", category: "radiology", description: "Specialised radiology (MRI/CT): R43,932/family/year", annualLimitRands: 43932, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Same as Pace2." },

  // Refractive surgery
  { ruleId: "BM_PACE1_REFRACTIVE", scheme: "BM", plan: "Pace1", category: "refractive_surgery", description: "Refractive surgery: R11,359/eye", perEventLimitRands: 11359, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Pace1 refractive surgery per eye." },
  { ruleId: "BM_PACE2_REFRACTIVE", scheme: "BM", plan: "Pace2", category: "refractive_surgery", description: "Refractive surgery: R11,869/eye", perEventLimitRands: 11869, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Pace2 refractive surgery per eye." },
  { ruleId: "BM_PACE3_REFRACTIVE", scheme: "BM", plan: "Pace3", category: "refractive_surgery", description: "Refractive surgery: R12,772/eye", perEventLimitRands: 12772, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Pace3 and Pace4 same limit." },

  // Cochlear implants
  { ruleId: "BM_PACE1_COCHLEAR", scheme: "BM", plan: "Pace1", category: "appliance", description: "Cochlear implants: R250,000/beneficiary/year", perBeneficiaryLimit: 250000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Sound processor upgrade every 5 years." },
  { ruleId: "BM_PACE2_COCHLEAR", scheme: "BM", plan: "Pace2", category: "appliance", description: "Cochlear implants: R285,000/beneficiary/year", perBeneficiaryLimit: 285000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Sound processor upgrade every 5 years." },
  { ruleId: "BM_PACE3_COCHLEAR", scheme: "BM", plan: "Pace3", category: "appliance", description: "Cochlear implants: R320,000/beneficiary/year", perBeneficiaryLimit: 320000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Sound processor upgrade every 5 years." },

  // Advanced illness
  { ruleId: "BM_PACE1_ADV_ILLNESS", scheme: "BM", plan: "Pace1", category: "hospital", description: "Advanced illness benefit: R91,073/beneficiary/year", perBeneficiaryLimit: 91073, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Palliative care/end-of-life." },
  { ruleId: "BM_PACE2_ADV_ILLNESS", scheme: "BM", plan: "Pace2", category: "hospital", description: "Advanced illness benefit: R145,716/beneficiary/year", perBeneficiaryLimit: 145716, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Pace2/3/4 same limit." },

  // Ambulance
  { ruleId: "BM_PACE_AMBULANCE", scheme: "BM", plan: "*", category: "ambulance", description: "Ambulance: Netcare 911 capitated preferred provider", networkRequired: true, preAuthRequired: false, severity: "info", notes: "Non-preferred provider only if involuntary. PMB at cost." },

  // International travel
  { ruleId: "BM_PACE_TRAVEL", scheme: "BM", plan: "*", category: "hospital", description: "International travel: USA R1M/family (90 days leisure, 60 business). Other R5M/family", annualLimitRands: 1000000, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Europ Assistance SA. 48 hours advance notice required. Elective abroad excluded." },

  // Non-CDL chronic medicine
  { ruleId: "BM_PACE1_CHRONIC", scheme: "BM", plan: "Pace1", category: "chronic", description: "Non-CDL chronic: M=R8,414, M1+=R16,827. 10% formulary co-pay / 25% non-formulary", annualLimitRands: 8414, coPaymentPercent: 10, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "7 non-CDL conditions covered. Major Depression as life-sustaining after limit depleted." },
  { ruleId: "BM_PACE2_CHRONIC", scheme: "BM", plan: "Pace2", category: "chronic", description: "Non-CDL chronic: M=R11,488, M1+=R22,976. 10% formulary / 20% non-formulary", annualLimitRands: 11488, coPaymentPercent: 10, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "20 non-CDL conditions covered." },
  { ruleId: "BM_PACE3_CHRONIC", scheme: "BM", plan: "Pace3", category: "chronic", description: "Non-CDL chronic: M=R17,654, M1+=R35,310. 10% formulary / 15% non-formulary", annualLimitRands: 17654, coPaymentPercent: 10, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "20 non-CDL conditions covered." },

  // CDL chronic medicine co-payments
  { ruleId: "BM_PACE1_CDL_COPAY", scheme: "BM", plan: "Pace1", category: "chronic", description: "CDL medicine: 100% on formulary, 25% co-pay non-formulary", coPaymentPercent: 25, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Pace1 CDL formulary co-payment." },
  { ruleId: "BM_PACE2_CDL_COPAY", scheme: "BM", plan: "Pace2", category: "chronic", description: "CDL medicine: 100% on formulary, 20% co-pay non-formulary", coPaymentPercent: 20, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Pace2 CDL formulary co-payment." },
  { ruleId: "BM_PACE3_CDL_COPAY", scheme: "BM", plan: "Pace3", category: "chronic", description: "CDL medicine: 100% on formulary, 15% co-pay non-formulary", coPaymentPercent: 15, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Pace3 CDL formulary co-payment." },

  // Acute medicine
  { ruleId: "BM_PACE1_ACUTE_MED", scheme: "BM", plan: "Pace1", category: "medicine_acute", description: "Acute medicine: M=R2,977, M1+=R6,161 (from PMSA then day-to-day limit)", annualLimitRands: 2977, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Subject to overall day-to-day limit." },
  { ruleId: "BM_PACE2_ACUTE_MED", scheme: "BM", plan: "Pace2", category: "medicine_acute", description: "Acute medicine: M=R3,447, M1+=R6,893", annualLimitRands: 3447, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Subject to overall day-to-day limit." },
  { ruleId: "BM_PACE3_ACUTE_MED", scheme: "BM", plan: "Pace3", category: "medicine_acute", description: "Acute medicine: M=R2,298, M1+=R5,169", annualLimitRands: 2298, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Subject to overall day-to-day limit." },

  // OTC medicine
  { ruleId: "BM_PACE_OTC", scheme: "BM", plan: "*", category: "medicine_otc", description: "OTC medicine: R1,214/family/year from PMSA, or unlimited PMSA with self-payment gap", annualLimitRands: 1214, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Includes sunscreen, vitamins with NAPPI codes." },

  // Overall day-to-day limits
  { ruleId: "BM_PACE1_DAY_OVERALL", scheme: "BM", plan: "Pace1", category: "day_to_day", description: "Overall day-to-day: M=R13,794, M1+=R27,586", annualLimitRands: 13794, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Combined limit for all out-of-hospital day-to-day benefits." },
  { ruleId: "BM_PACE2_DAY_OVERALL", scheme: "BM", plan: "Pace2", category: "day_to_day", description: "Overall day-to-day: M=R17,233, M1+=R34,465", annualLimitRands: 17233, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Combined limit." },
  { ruleId: "BM_PACE3_DAY_OVERALL", scheme: "BM", plan: "Pace3", category: "day_to_day", description: "Overall day-to-day: M=R23,028, M1+=R47,590", annualLimitRands: 23028, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Combined limit." },

  // Contraceptive
  { ruleId: "BM_PACE_CONTRACEPTIVE", scheme: "BM", plan: "*", category: "contraceptive", description: "Oral/injectable/implantable contraceptives: R2,801/beneficiary/year. IUD: R4,225 per 5 years", annualLimitRands: 2801, networkRequired: false, preAuthRequired: false, severity: "info", notes: "IUD insertion by gynaecologist or GP once every 5 years." },

  // Maternity
  { ruleId: "BM_PACE_MATERNITY", scheme: "BM", plan: "*", category: "maternity", description: "Maternity: 9 antenatal + 1 postnatal consult, 2 ultrasounds, R145/month supplements", visitLimit: 10, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: true, severity: "info", notes: "2D ultrasounds at 1st and 2nd trimester. Supplement: R145/month x 9 months." },

  // Optical (Pace1)
  { ruleId: "BM_PACE1_OPTICAL_FRAME", scheme: "BM", plan: "Pace1", category: "optical", description: "Optical: frame R1,270 (PPN) / R953 (non-network), every 24 months", annualLimitRands: 1270, networkRequired: false, preAuthRequired: false, severity: "info", notes: "PPN optometrist network. Contact lenses R2,085 in lieu." },
  // Optical (Pace2/3)
  { ruleId: "BM_PACE2_OPTICAL_FRAME", scheme: "BM", plan: "Pace2", category: "optical", description: "Optical: frame R1,325 (PPN) / R994 (non-network), every 24 months", annualLimitRands: 1325, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Contact lenses R2,280 in lieu. Lens enhancements R750." },
  { ruleId: "BM_PACE3_OPTICAL_FRAME", scheme: "BM", plan: "Pace3", category: "optical", description: "Optical: frame R1,325 (PPN) / R994 (non-network), every 24 months", annualLimitRands: 1325, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Contact lenses R2,700 in lieu. Lens enhancements R750." },

  // Preventive dentistry
  { ruleId: "BM_PACE_PREV_DENTAL", scheme: "BM", plan: "*", category: "dental", description: "Preventive dentistry: exam 1-2x/year, scaling every 6 months, fluoride every 6 months", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Under 12: exam 2x/year. 12+: exam 1x/year. Fissure sealing up to 21 years." },
];

// ─── MEDSHIELD ADDITIONAL BENEFIT LIMITS (PremiumPlus + MediValue 2026) ─────
// Source: Medshield PremiumPlus 2026, Medshield MediValue 2026 Benefit Summaries

export const MEDSHIELD_ADDITIONAL_LIMITS: BenefitLimitRule[] = [
  // === PREMIUMPLUS ===
  // Savings
  { ruleId: "MS_PP_SAVINGS", scheme: "MS", plan: "PremiumPlus", category: "savings", description: "PSA: 25% of contribution. Principal R28,464, Adult R26,076, Child R5,448", annualLimitRands: 28464, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Allocated 12 months in advance." },

  // Above Threshold
  { ruleId: "MS_PP_ATB", scheme: "MS", plan: "PremiumPlus", category: "day_to_day", description: "Above Threshold: Member R7,500, Adult Dep R5,500, Child R3,700", annualLimitRands: 7500, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Out-of-hospital above threshold benefit." },

  // Physical rehabilitation
  { ruleId: "MS_PP_PHYS_REHAB", scheme: "MS", plan: "PremiumPlus", category: "physiotherapy", description: "Physical rehabilitation (alternatives to hospitalisation): R173,000/family/year", annualLimitRands: 173000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Alternatives to hospitalisation benefit." },

  // Terminal care
  { ruleId: "MS_PP_TERMINAL", scheme: "MS", plan: "PremiumPlus", category: "hospital", description: "Terminal care benefit: R63,000/family/year", annualLimitRands: 63000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Sub-limit of alternatives to hospitalisation." },

  // Appliances
  { ruleId: "MS_PP_APPLIANCE", scheme: "MS", plan: "PremiumPlus", category: "appliance", description: "Appliances (general, medical, surgical): R18,300/family/year", annualLimitRands: 18300, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Increased for 2026." },

  // CGM
  { ruleId: "MS_PP_CGM", scheme: "MS", plan: "PremiumPlus", category: "chronic", description: "CGM (Continuous Glucose Monitoring): R26,500/beneficiary/year, under 18, Type 1 DM", perBeneficiaryLimit: 26500, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "NEW 2026 benefit." },

  // Virtual consultations
  { ruleId: "MS_PP_VIRTUAL", scheme: "MS", plan: "PremiumPlus", category: "gp_consultation", description: "Virtual GP/Specialist consultations: 5/family/year (NEW 2026)", visitLimit: 5, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: false, severity: "info", notes: "New benefit for 2026." },

  // Contraception
  { ruleId: "MS_PP_CONTRACEPTIVE", scheme: "MS", plan: "PremiumPlus", category: "contraceptive", description: "Oral birth control: R235/script x 13 scripts/year", annualLimitRands: 3055, networkRequired: false, preAuthRequired: false, severity: "info", notes: "13 scripts annually." },

  // Specialised dentistry
  { ruleId: "MS_PP_DENTAL_SPEC", scheme: "MS", plan: "PremiumPlus", category: "dental", description: "Specialised dentistry: R24,050/family/year", annualLimitRands: 24050, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Increased for 2026." },

  // Maxillo-facial
  { ruleId: "MS_PP_MAXFAC", scheme: "MS", plan: "PremiumPlus", category: "dental", description: "Maxillo-facial surgery: R24,000/family/year", annualLimitRands: 24000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Increased for 2026." },

  // Chronic medication
  { ruleId: "MS_PP_CHRONIC", scheme: "MS", plan: "PremiumPlus", category: "chronic", description: "Chronic medication: R38,500/family, R19,250/beneficiary", annualLimitRands: 38500, perBeneficiaryLimit: 19250, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Increased for 2026. 20% co-pay for out-of-formulary or non-DSP." },

  // Mental health
  { ruleId: "MS_PP_MENTAL", scheme: "MS", plan: "PremiumPlus", category: "mental_health", description: "Mental health: R100,000/family combined in- and out-of-hospital", annualLimitRands: 100000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Sub-limit removed for consultations — included in R100,000." },

  // Oncology specialised drugs
  { ruleId: "MS_PP_ONCOLOGY_DRUGS", scheme: "MS", plan: "PremiumPlus", category: "oncology", description: "Oncology specialised drugs: R500,000/beneficiary", perBeneficiaryLimit: 500000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Enhanced for 2026." },

  // Oncology breast reconstruction
  { ruleId: "MS_PP_BREAST_RECON", scheme: "MS", plan: "PremiumPlus", category: "oncology", description: "Oncology breast reconstruction: R105,000/family", annualLimitRands: 105000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Increased for 2026." },

  // Optical
  { ruleId: "MS_PP_OPTICAL", scheme: "MS", plan: "PremiumPlus", category: "optical", description: "Optical: R9,900/beneficiary per 24-month cycle", perBeneficiaryLimit: 9900, networkRequired: false, preAuthRequired: false, severity: "info", notes: "1 eye test/beneficiary/year. 1 pair spectacles + contacts. Frames R7,300. Readers R220." },
  { ruleId: "MS_PP_OPTICAL_FRAME", scheme: "MS", plan: "PremiumPlus", category: "optical", description: "Optical frames: R7,300/beneficiary per 24-month cycle", perBeneficiaryLimit: 7300, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Within optical limit." },

  // Corneal grafts
  { ruleId: "MS_PP_CORNEAL", scheme: "MS", plan: "PremiumPlus", category: "hospital", description: "Corneal grafts: R54,250 (international) / R23,250 (local) per beneficiary", perBeneficiaryLimit: 54250, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Per beneficiary limit." },

  // Physiotherapy in-hospital
  { ruleId: "MS_PP_PHYSIO_HOSP", scheme: "MS", plan: "PremiumPlus", category: "physiotherapy", description: "Physiotherapy in-hospital: R5,000/beneficiary/year", perBeneficiaryLimit: 5000, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Increased for 2026." },

  // Prosthesis
  { ruleId: "MS_PP_PROSTHESIS", scheme: "MS", plan: "PremiumPlus", category: "prosthesis", description: "Internal prosthesis: R140,000/family/year", annualLimitRands: 140000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Increased for 2026." },

  // Refractive surgery
  { ruleId: "MS_PP_REFRACTIVE", scheme: "MS", plan: "PremiumPlus", category: "refractive_surgery", description: "Refractive surgery: R36,500/family/year", annualLimitRands: 36500, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Including hospitalisation. Increased for 2026." },

  // Specialised radiology
  { ruleId: "MS_PP_SPEC_RADIOLOGY", scheme: "MS", plan: "PremiumPlus", category: "radiology", description: "Specialised radiology: R34,600/family/year in- and out-of-hospital", annualLimitRands: 34600, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Increased for 2026." },

  // Diabetic retinal screening
  { ruleId: "MS_PP_RETINAL_SCREEN", scheme: "MS", plan: "PremiumPlus", category: "chronic", description: "Diabetic AI retinal screening: R250/beneficiary/year (40+, Type 1/2 DM)", perBeneficiaryLimit: 250, networkRequired: false, preAuthRequired: false, severity: "info", notes: "NEW 2026 benefit." },

  // Vaccination
  { ruleId: "MS_PP_VACCINATION", scheme: "MS", plan: "PremiumPlus", category: "gp_consultation", description: "Adult vaccination: R2,100/family/year", annualLimitRands: 2100, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Increased for 2026." },

  // Co-payments (PremiumPlus)
  { ruleId: "MS_PP_COPAY_FORMULARY", scheme: "MS", plan: "PremiumPlus", category: "chronic", description: "Out-of-formulary medication: 20% upfront co-payment", coPaymentPercent: 20, networkRequired: false, preAuthRequired: false, severity: "warning", notes: "Voluntary non-DSP also 20%." },
  { ruleId: "MS_PP_COPAY_HIV_NONDSP", scheme: "MS", plan: "PremiumPlus", category: "chronic", description: "Non-DSP HIV/AIDS medication: 30% upfront co-payment", coPaymentPercent: 30, networkRequired: true, preAuthRequired: false, severity: "warning", notes: "Higher co-pay for HIV non-DSP." },
  { ruleId: "MS_PP_COPAY_RENAL_NONDSP", scheme: "MS", plan: "PremiumPlus", category: "renal", description: "Non-DSP chronic renal dialysis: 35% upfront co-payment", coPaymentPercent: 35, networkRequired: true, preAuthRequired: false, severity: "error", notes: "Highest co-payment category." },
  { ruleId: "MS_PP_COPAY_ONCO_NONDSP", scheme: "MS", plan: "PremiumPlus", category: "oncology", description: "Non-ICON oncology provider: 40% upfront co-payment", coPaymentPercent: 40, networkRequired: true, preAuthRequired: false, severity: "error", notes: "Must use ICON provider to avoid co-payment." },
  { ruleId: "MS_PP_COPAY_WISDOM", scheme: "MS", plan: "PremiumPlus", category: "dental", description: "Wisdom teeth day clinic: R800 co-payment", coPaymentRands: 800, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Day clinic extraction." },
  { ruleId: "MS_PP_COPAY_ENDOSCOPE", scheme: "MS", plan: "PremiumPlus", category: "hospital", description: "Endoscopic procedures: R1,000 co-payment", coPaymentRands: 1000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Addendum B procedures." },
  { ruleId: "MS_PP_COPAY_NASAL", scheme: "MS", plan: "PremiumPlus", category: "hospital", description: "Functional nasal surgery: R1,000 co-payment", coPaymentRands: 1000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "" },
  { ruleId: "MS_PP_COPAY_LAPARO", scheme: "MS", plan: "PremiumPlus", category: "hospital", description: "Laparoscopic procedures: R2,000 co-payment", coPaymentRands: 2000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "" },
  { ruleId: "MS_PP_COPAY_ARTHRO", scheme: "MS", plan: "PremiumPlus", category: "hospital", description: "Arthroscopic procedures: R2,000 co-payment", coPaymentRands: 2000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "" },
  { ruleId: "MS_PP_COPAY_IMPACTED", scheme: "MS", plan: "PremiumPlus", category: "dental", description: "Impacted teeth/wisdom teeth/apicectomy: R2,000 co-payment", coPaymentRands: 2000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "" },
  { ruleId: "MS_PP_COPAY_HERNIA", scheme: "MS", plan: "PremiumPlus", category: "hospital", description: "Hernia repair (except infants): R3,000 co-payment", coPaymentRands: 3000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "" },
  { ruleId: "MS_PP_COPAY_BACK", scheme: "MS", plan: "PremiumPlus", category: "hospital", description: "Back and neck surgery: R4,000 co-payment", coPaymentRands: 4000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "" },
  { ruleId: "MS_PP_COPAY_NISSEN", scheme: "MS", plan: "PremiumPlus", category: "hospital", description: "Nissen Fundoplication: R5,000 co-payment", coPaymentRands: 5000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "" },
  { ruleId: "MS_PP_COPAY_HYSTERECTOMY", scheme: "MS", plan: "PremiumPlus", category: "hospital", description: "Hysterectomy: R5,000 co-payment", coPaymentRands: 5000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "" },
  { ruleId: "MS_PP_COPAY_NOAUTH", scheme: "MS", plan: "PremiumPlus", category: "hospital", description: "No pre-auth penalty: 20% additional co-payment", coPaymentPercent: 20, networkRequired: false, preAuthRequired: true, severity: "error", notes: "Added to any other co-payment if auth not obtained before admission." },

  // === MEDIVALUE ===
  // Day-to-day limits
  { ruleId: "MS_MV_DAY_M0", scheme: "MS", plan: "MediValue", category: "day_to_day", description: "Day-to-day limits: M0=R8,500, M+1=R10,200, M+2=R10,600, M+3=R12,000, M+4=R13,000", annualLimitRands: 8500, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Limits increase with family size." },

  // Physical rehabilitation
  { ruleId: "MS_MV_PHYS_REHAB", scheme: "MS", plan: "MediValue", category: "physiotherapy", description: "Physical rehabilitation: R38,350/family/year", annualLimitRands: 38350, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Alternatives to hospitalisation." },

  // Terminal care
  { ruleId: "MS_MV_TERMINAL", scheme: "MS", plan: "MediValue", category: "hospital", description: "Terminal care: R38,350/family/year", annualLimitRands: 38350, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Same limit as physical rehab." },

  // Appliances
  { ruleId: "MS_MV_APPLIANCE", scheme: "MS", plan: "MediValue", category: "appliance", description: "Appliances: R3,450/family/year", annualLimitRands: 3450, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Lower than PremiumPlus." },

  // Virtual consultations
  { ruleId: "MS_MV_VIRTUAL", scheme: "MS", plan: "MediValue", category: "gp_consultation", description: "Virtual GP/Specialist consultations: 5/family/year (NEW 2026)", visitLimit: 5, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: false, severity: "info", notes: "New benefit for 2026." },

  // Contraception
  { ruleId: "MS_MV_CONTRACEPTIVE", scheme: "MS", plan: "MediValue", category: "contraceptive", description: "Oral birth control: R235/script x 13 scripts/year", annualLimitRands: 3055, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Same as PremiumPlus." },

  // Dentistry
  { ruleId: "MS_MV_DENTAL", scheme: "MS", plan: "MediValue", category: "dental", description: "Specialised dentistry: R7,700/family/year (basic included in this limit)", annualLimitRands: 7700, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Basic sub-limit removed, included in specialised." },

  // Maxillo-facial
  { ruleId: "MS_MV_MAXFAC", scheme: "MS", plan: "MediValue", category: "dental", description: "Maxillo-facial surgery: R9,150/family/year", annualLimitRands: 9150, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "" },

  // Mental health
  { ruleId: "MS_MV_MENTAL", scheme: "MS", plan: "MediValue", category: "mental_health", description: "Mental health medicine: R5,850/beneficiary/year", perBeneficiaryLimit: 5850, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Medicine only, not consultations." },

  // Vitreoretinal
  { ruleId: "MS_MV_VITREOR", scheme: "MS", plan: "MediValue", category: "hospital", description: "Specialised vitreoretinal drugs: R41,800/family/year", annualLimitRands: 41800, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "" },

  // Oncology breast reconstruction
  { ruleId: "MS_MV_BREAST_RECON", scheme: "MS", plan: "MediValue", category: "oncology", description: "Oncology breast reconstruction: R105,000/family", annualLimitRands: 105000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Same as PremiumPlus." },

  // Optical
  { ruleId: "MS_MV_OPTICAL", scheme: "MS", plan: "MediValue", category: "optical", description: "Optical: R5,200/beneficiary per 24-month cycle", perBeneficiaryLimit: 5200, networkRequired: false, preAuthRequired: false, severity: "info", notes: "1 eye test/year. 1 pair spectacles or contacts. Frames R2,230. Readers R220." },
  { ruleId: "MS_MV_OPTICAL_FRAME", scheme: "MS", plan: "MediValue", category: "optical", description: "Optical frames: R2,230/beneficiary per 24-month cycle", perBeneficiaryLimit: 2230, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Within optical limit." },

  // Corneal grafts
  { ruleId: "MS_MV_CORNEAL", scheme: "MS", plan: "MediValue", category: "hospital", description: "Corneal grafts: R54,250 (international) / R23,250 (local) per beneficiary", perBeneficiaryLimit: 54250, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Same as PremiumPlus." },

  // Physiotherapy in-hospital
  { ruleId: "MS_MV_PHYSIO_HOSP", scheme: "MS", plan: "MediValue", category: "physiotherapy", description: "Physiotherapy in-hospital: R3,450/beneficiary/year", perBeneficiaryLimit: 3450, networkRequired: false, preAuthRequired: true, severity: "info", notes: "" },

  // Specialised radiology
  { ruleId: "MS_MV_SPEC_RADIOLOGY", scheme: "MS", plan: "MediValue", category: "radiology", description: "Specialised radiology: R12,100/family/year in- and out-of-hospital", annualLimitRands: 12100, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "" },

  // Diabetic retinal screening
  { ruleId: "MS_MV_RETINAL_SCREEN", scheme: "MS", plan: "MediValue", category: "chronic", description: "Diabetic AI retinal screening: R250/beneficiary/year (40+, Type 1/2 DM)", perBeneficiaryLimit: 250, networkRequired: false, preAuthRequired: false, severity: "info", notes: "NEW 2026 benefit." },

  // Vaccination
  { ruleId: "MS_MV_VACCINATION", scheme: "MS", plan: "MediValue", category: "gp_consultation", description: "Adult vaccination: R520/family/year", annualLimitRands: 520, networkRequired: false, preAuthRequired: false, severity: "info", notes: "" },

  // Co-payments (MediValue)
  { ruleId: "MS_MV_COPAY_SPEC_COMPACT", scheme: "MS", plan: "MediValue Compact", category: "specialist", description: "Specialist no referral (Compact): 20% co-payment", coPaymentPercent: 20, networkRequired: false, preAuthRequired: false, severity: "warning", notes: "Compact only. Prime = no co-payment." },
  { ruleId: "MS_MV_COPAY_FORMULARY", scheme: "MS", plan: "MediValue", category: "chronic", description: "Out-of-formulary medication: 20% upfront co-payment", coPaymentPercent: 20, networkRequired: false, preAuthRequired: false, severity: "warning", notes: "" },
  { ruleId: "MS_MV_COPAY_HOSPITAL", scheme: "MS", plan: "MediValue", category: "hospital", description: "Non-network hospital: 30% upfront co-payment", coPaymentPercent: 30, networkRequired: true, preAuthRequired: true, severity: "error", notes: "Prime and Compact hospital networks." },
  { ruleId: "MS_MV_COPAY_RENAL", scheme: "MS", plan: "MediValue", category: "renal", description: "Non-DSP chronic renal dialysis: 35% upfront co-payment", coPaymentPercent: 35, networkRequired: true, preAuthRequired: false, severity: "error", notes: "" },
  { ruleId: "MS_MV_COPAY_ONCO", scheme: "MS", plan: "MediValue", category: "oncology", description: "Non-ICON oncology: 40% upfront co-payment", coPaymentPercent: 40, networkRequired: true, preAuthRequired: false, severity: "error", notes: "" },
  { ruleId: "MS_MV_COPAY_WISDOM", scheme: "MS", plan: "MediValue", category: "dental", description: "Wisdom teeth day clinic: R800 co-payment", coPaymentRands: 800, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "" },
  { ruleId: "MS_MV_COPAY_ENDOSCOPE", scheme: "MS", plan: "MediValue", category: "hospital", description: "Endoscopic procedures: R2,000 co-payment", coPaymentRands: 2000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Higher than PremiumPlus." },
  { ruleId: "MS_MV_COPAY_NASAL", scheme: "MS", plan: "MediValue", category: "hospital", description: "Functional nasal surgery: R2,000 co-payment", coPaymentRands: 2000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "" },
  { ruleId: "MS_MV_COPAY_CAESAREAN", scheme: "MS", plan: "MediValue", category: "maternity", description: "Voluntary caesarean: R2,500 co-payment", coPaymentRands: 2500, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "" },
  { ruleId: "MS_MV_COPAY_HERNIA", scheme: "MS", plan: "MediValue", category: "hospital", description: "Hernia repair (except infants): R3,000 co-payment", coPaymentRands: 3000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "" },
  { ruleId: "MS_MV_COPAY_LAPARO", scheme: "MS", plan: "MediValue", category: "hospital", description: "Laparoscopic procedures: R4,000 co-payment", coPaymentRands: 4000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Higher than PremiumPlus." },
  { ruleId: "MS_MV_COPAY_ARTHRO", scheme: "MS", plan: "MediValue", category: "hospital", description: "Arthroscopic procedures: R4,000 co-payment", coPaymentRands: 4000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "" },
  { ruleId: "MS_MV_COPAY_IMPACTED", scheme: "MS", plan: "MediValue", category: "dental", description: "Impacted teeth/wisdom teeth/apicectomy: R4,000 co-payment", coPaymentRands: 4000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "" },
  { ruleId: "MS_MV_COPAY_NISSEN", scheme: "MS", plan: "MediValue", category: "hospital", description: "Nissen Fundoplication: R5,000 co-payment", coPaymentRands: 5000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "" },
  { ruleId: "MS_MV_COPAY_HYSTERECTOMY", scheme: "MS", plan: "MediValue", category: "hospital", description: "Hysterectomy: R5,000 co-payment", coPaymentRands: 5000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "" },
  { ruleId: "MS_MV_COPAY_NOAUTH", scheme: "MS", plan: "MediValue", category: "hospital", description: "No pre-auth penalty: 20% additional co-payment", coPaymentPercent: 20, networkRequired: false, preAuthRequired: true, severity: "error", notes: "Added to any other co-payment if auth not obtained." },
];

// ─── GEMS RUBY BENEFIT LIMITS (2025) ────────────────────────────────────────
// Source: GEMS Annexure C Ruby 2025 (61 pages, OCR extracted via vision)

export const GEMS_RUBY_LIMITS: BenefitLimitRule[] = [
  // Hospital
  { ruleId: "GEMS_RUBY_HOSPITAL", scheme: "GEMS", plan: "Ruby", category: "hospital", description: "Hospital (B1): unlimited at 100% Scheme Rate, pre-auth required 48hrs before", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Includes accommodation, theatre, medicines, materials, neonatal. 130% for Network." },
  { ruleId: "GEMS_RUBY_HOSP_COPAY", scheme: "GEMS", plan: "Ruby", category: "hospital", description: "Hospital no pre-auth penalty: R1,000 co-payment per admission", coPaymentRands: 1000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Emergency: notify within 1 working day. Private ward subject to motivation." },

  // Maternity
  { ruleId: "GEMS_RUBY_MATERNITY", scheme: "GEMS", plan: "Ruby", category: "maternity", description: "Maternity (B2): unlimited, subject to PMB. R1,000 co-pay if no pre-auth.", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Home birth and registered birthing units covered. 2 x 2D ultrasounds per pregnancy." },
  { ruleId: "GEMS_RUBY_MATERNITY_SCAN", scheme: "GEMS", plan: "Ruby", category: "maternity", description: "Maternity ultrasound: 2 x 2D scans per pregnancy. 3D/4D funded up to 2D cost.", visitLimit: 2, networkRequired: false, preAuthRequired: false, severity: "info", notes: "3D/4D substitution allowed but paid at 2D rate only." },

  // GP
  { ruleId: "GEMS_RUBY_GP", scheme: "GEMS", plan: "Ruby", category: "gp_consultation", description: "Family Practitioner (B3): unlimited, 100% (non-network) / 130% (network)", networkRequired: false, preAuthRequired: false, severity: "info", notes: "200% Scheme Rate for managed care procedures in rooms instead of hospital." },

  // Specialist
  { ruleId: "GEMS_RUBY_SPECIALIST", scheme: "GEMS", plan: "Ruby", category: "specialist", description: "Specialist (B4): unlimited, 100% (non-network) / 130% (network)", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Reimbursement according to Scheme-approved tariff file." },

  // Surgery
  { ruleId: "GEMS_RUBY_SURGERY", scheme: "GEMS", plan: "Ruby", category: "hospital", description: "Surgical procedures (B5): unlimited, 100%/200% for managed care in-rooms procedures", networkRequired: false, preAuthRequired: true, severity: "info", notes: "Refer to Annexure E for exclusions." },

  // Advanced radiology
  { ruleId: "GEMS_RUBY_ADV_RADIOLOGY", scheme: "GEMS", plan: "Ruby", category: "radiology", description: "Advanced radiology (B8): unlimited in-hospital, pre-auth required for CT/MRI/PET/MUGA", networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Angiography, CT, Coronary Angiography, MDCT, MRI, MUGA, PET, Radio-isotope studies." },

  // Pathology
  { ruleId: "GEMS_RUBY_PATHOLOGY", scheme: "GEMS", plan: "Ruby", category: "pathology", description: "Pathology (B9): unlimited, subject to managed care protocols", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Tests must be related to admission diagnosis." },

  // Dentistry in-hospital
  { ruleId: "GEMS_RUBY_DENTAL_HOSP", scheme: "GEMS", plan: "Ruby", category: "dental", description: "Dentistry in-hospital (B6): shared limits with C6 dental. GA only for under 6 or severe trauma.", networkRequired: true, preAuthRequired: true, severity: "warning", notes: "General anaesthesia/conscious sedation: only under 6 years or severe trauma. Pre-auth required." },

  // Prosthesis
  { ruleId: "GEMS_RUBY_PROSTHESIS", scheme: "GEMS", plan: "Ruby", category: "prosthesis", description: "Internal prosthesis (B14): R56,131/family/year", annualLimitRands: 56131, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Sub-limits shared with C17. Joint revisions: additional R56,131. Once depleted, unlimited for PMBs." },
  { ruleId: "GEMS_RUBY_PROSTH_FOOT", scheme: "GEMS", plan: "Ruby", category: "prosthesis", description: "Foot orthotics/prosthetics sub-limit: R6,164/beneficiary/year", perBeneficiaryLimit: 6164, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Includes shoes, inserts, levelers." },
  { ruleId: "GEMS_RUBY_PROSTH_SHOES", scheme: "GEMS", plan: "Ruby", category: "prosthesis", description: "Orthotic shoes sub-limit: R1,781/beneficiary/year", perBeneficiaryLimit: 1781, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Within foot orthotics sub-limit." },

  // Emergency
  { ruleId: "GEMS_RUBY_EMERGENCY", scheme: "GEMS", plan: "Ruby", category: "hospital", description: "Emergency/casualty (B15): PMB only, cost defrayed from C3 GP Services for non-PMB", networkRequired: true, preAuthRequired: false, severity: "warning", notes: "Use facility as per B1. Non-PMB/unauthorised defrayed from GP benefit." },

  // Renal dialysis
  { ruleId: "GEMS_RUBY_RENAL", scheme: "GEMS", plan: "Ruby", category: "renal", description: "Renal dialysis (B16): R353,521/beneficiary/year for chronic dialysis", perBeneficiaryLimit: 353521, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Acute dialysis included in B1 hospital. Erythropoietin in B10 Blood Services. Unlimited for PMBs once depleted." },

  // Oncology
  { ruleId: "GEMS_RUBY_ONCOLOGY", scheme: "GEMS", plan: "Ruby", category: "oncology", description: "Oncology chemo/radiotherapy (B17): R445,453/family/year", annualLimitRands: 445453, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Sub-limit R336,702 for biological and specialised medicines. Includes pathology, radiology, medical technologists." },
  { ruleId: "GEMS_RUBY_ONCOLOGY_BIO", scheme: "GEMS", plan: "Ruby", category: "oncology", description: "Oncology biological/specialised medicine sub-limit: R336,702/family/year", annualLimitRands: 336702, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Within overall oncology limit. Subject to Medicine Price List (MPL)." },

  // Alternatives to hospitalisation
  { ruleId: "GEMS_RUBY_ALT_HOSP", scheme: "GEMS", plan: "Ruby", category: "hospital", description: "Alternatives to hospitalisation (B19): unlimited, subject to PMB", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Sub-acute hospitals, physical rehab, private nursing, hospice. Excludes frail care and recuperative holidays." },

  // Out-of-hospital: GP (PMSA + Block)
  { ruleId: "GEMS_RUBY_GP_OOH", scheme: "GEMS", plan: "Ruby", category: "gp_consultation", description: "GP out-of-hospital (C3): from PMSA and Block Benefit, 100%/130% network", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Includes consultations, visits, minor procedures. Limit pro-rated from admission date." },

  // GP Network Extender
  { ruleId: "GEMS_RUBY_GP_EXTENDER", scheme: "GEMS", plan: "Ruby", category: "gp_consultation", description: "GP Network Extender (C4): 1 additional consultation at network per chronic condition", visitLimit: 1, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Paid from Risk. For chronic conditions registered on the Scheme." },

  // Dental out-of-hospital
  { ruleId: "GEMS_RUBY_DENTAL_OOH", scheme: "GEMS", plan: "Ruby", category: "dental", description: "Dental (C6): R4,489/beneficiary/year for conservative, restorative, specialised", perBeneficiaryLimit: 4489, networkRequired: false, preAuthRequired: false, severity: "warning", notes: "Panoramic X-ray: 1 per 3 years. Bitewing: 6 per year. CBCT: 1 per lifetime for surgical procedures." },
  { ruleId: "GEMS_RUBY_DENTAL_XRAY", scheme: "GEMS", plan: "Ruby", category: "dental", description: "Dental panoramic X-ray: 1 per 3 years per beneficiary", visitLimit: 1, visitPeriodMonths: 36, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Bitewing X-rays: 6 per year. Periapical: 10 per year." },

  // Optical
  { ruleId: "GEMS_RUBY_OPTICAL", scheme: "GEMS", plan: "Ruby", category: "optical", description: "Optical (C11): from PMSA and Block Benefit, 1 eye exam per year", visitLimit: 1, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Spectacles or contacts (not both). Tinted lenses up to 35% for albinism. Not pro-rated." },

  // Physiotherapy
  { ruleId: "GEMS_RUBY_PHYSIO", scheme: "GEMS", plan: "Ruby", category: "physiotherapy", description: "Physiotherapy (C14): from PMSA and Block Benefit, subject to PMBs", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Post hip/knee/shoulder replacement: 10 visits (shared with B12)." },

  // Post-surgery physio
  { ruleId: "GEMS_RUBY_POST_SURG_PHYSIO", scheme: "GEMS", plan: "Ruby", category: "physiotherapy", description: "Post hip/knee/shoulder replacement physio (C16): 10 visits/year", visitLimit: 10, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Shared with B12 post-surgery benefit." },

  // Appliances (out-of-hospital)
  { ruleId: "GEMS_RUBY_APPLIANCE", scheme: "GEMS", plan: "Ruby", category: "appliance", description: "Medical & surgical appliances (C17): R21,901/family/year", annualLimitRands: 21901, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Sub-limit R6,164/beneficiary foot orthotics. Shared with B14 prosthesis." },
  { ruleId: "GEMS_RUBY_WHEELCHAIR", scheme: "GEMS", plan: "Ruby", category: "appliance", description: "Wheelchair: R7,716/beneficiary per 24 months", perBeneficiaryLimit: 7716, networkRequired: false, preAuthRequired: true, severity: "info", notes: "1 wheelchair per 24 months." },
  { ruleId: "GEMS_RUBY_CRUTCHES", scheme: "GEMS", plan: "Ruby", category: "appliance", description: "Crutches: R701/beneficiary/year", perBeneficiaryLimit: 701, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Annual limit." },
  { ruleId: "GEMS_RUBY_HEARING_AID", scheme: "GEMS", plan: "Ruby", category: "appliance", description: "Hearing aids: R11,223/beneficiary per 36 months (1 bilateral pair)", perBeneficiaryLimit: 11223, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "1 pair every 36 months." },
  { ruleId: "GEMS_RUBY_CPAP", scheme: "GEMS", plan: "Ruby", category: "appliance", description: "CPAP device: R13,328/beneficiary per 36 months", perBeneficiaryLimit: 13328, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "1 device per 36 months." },

  // CGM / Insulin pumps
  { ruleId: "GEMS_RUBY_CGM_DEVICE", scheme: "GEMS", plan: "Ruby", category: "chronic", description: "CGM/Insulin pump devices: R59,531/family/year (under 19, Type 1 DM only)", annualLimitRands: 59531, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "1 device per beneficiary per 60 months. Excludes consumables." },
  { ruleId: "GEMS_RUBY_CGM_CONSUMABLES", scheme: "GEMS", plan: "Ruby", category: "chronic", description: "CGM consumables: R28,324/beneficiary/year", perBeneficiaryLimit: 28324, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Provided via chronic medication benefit (C7.2)." },

  // Chronic medicine
  { ruleId: "GEMS_RUBY_CHRONIC_PMB", scheme: "GEMS", plan: "Ruby", category: "chronic", description: "Chronic PMB/CDL conditions: unlimited, subject to formulary/MPL, 28-day supply", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Prior application and approval required. Chronic Medicine Pharmacy DSP. 28-day supply limit." },

  // Homeopathic
  { ruleId: "GEMS_RUBY_HOMEO", scheme: "GEMS", plan: "Ruby", category: "medicine_acute", description: "Homeopathic medicine: R738/family/year, 30% co-pay for out-of-formulary", annualLimitRands: 738, coPaymentPercent: 30, networkRequired: false, preAuthRequired: false, severity: "info", notes: "From PMSA. Out-of-formulary = 30% co-payment." },

  // Screening/preventive
  { ruleId: "GEMS_RUBY_SCREENING", scheme: "GEMS", plan: "Ruby", category: "gp_consultation", description: "Screening services (C19): 1 per year (cholesterol, bone density, PSA, mammogram, etc.)", visitLimit: 1, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Paid from Risk. HPV vaccination: 1 course per female beneficiary lifetime." },
  { ruleId: "GEMS_RUBY_VACCINATION", scheme: "GEMS", plan: "Ruby", category: "gp_consultation", description: "Other vaccinations: R950/beneficiary/year", perBeneficiaryLimit: 950, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Annual vaccination benefit." },

  // Dental sealants
  { ruleId: "GEMS_RUBY_DENTAL_SEALANT", scheme: "GEMS", plan: "Ruby", category: "dental", description: "Dental sealants: under 18 only, network provider required (NEW 2025)", networkRequired: true, preAuthRequired: false, severity: "info", notes: "Under Preventive Care Services. Aligned across all GEMS options for 2025." },

  // Infertility
  { ruleId: "GEMS_RUBY_INFERTILITY", scheme: "GEMS", plan: "Ruby", category: "maternity", description: "Infertility (C23): PMB only. Non-DSP/State = R15,000 co-payment on first bill", coPaymentRands: 15000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Must use DSP (State or Network). Non-DSP = R15,000 penalty on first bill." },
];

// ─── DISCOVERY SAVER BENEFIT LIMITS (2026) ──────────────────────────────────
// Source: Discovery Saver Plan Guide 2026 (Classic Saver, Classic Delta Saver,
//         Essential Saver, Essential Delta Saver, Coastal Saver)

export const DISCOVERY_SAVER_LIMITS: BenefitLimitRule[] = [
  // Hospital — unlimited, no overall limit
  { ruleId: "DH_SAVER_HOSPITAL", scheme: "DH", plan: "Classic Saver", category: "hospital", description: "Hospital: unlimited, any private/public hospital approved by Scheme", networkRequired: false, preAuthRequired: true, severity: "info", notes: "No overall hospital limit. Payment at agreed rate for contracted providers, up to 200% DHR for non-contracted." },
  { ruleId: "DH_SAVER_ESSENTIAL_HOSPITAL", scheme: "DH", plan: "Essential Saver", category: "hospital", description: "Hospital: unlimited, any private/public hospital approved by Scheme, 100% DHR", networkRequired: false, preAuthRequired: true, severity: "info", notes: "Essential plans: 100% DHR for non-contracted healthcare professionals." },
  { ruleId: "DH_SAVER_DELTA_HOSPITAL", scheme: "DH", plan: "Classic Delta Saver", category: "hospital", description: "Hospital: unlimited, Delta Hospital Network required", networkRequired: true, preAuthRequired: true, severity: "warning", notes: "R11,100 upfront for planned admissions to hospitals not in Delta Hospital Network." },
  { ruleId: "DH_SAVER_ESS_DELTA_HOSPITAL", scheme: "DH", plan: "Essential Delta Saver", category: "hospital", description: "Hospital: unlimited, Delta Hospital Network required, 100% DHR", networkRequired: true, preAuthRequired: true, severity: "warning", notes: "R11,100 upfront for planned admissions outside Delta Network. 100% DHR for non-contracted." },
  { ruleId: "DH_SAVER_COASTAL_HOSPITAL", scheme: "DH", plan: "Coastal Saver", category: "hospital", description: "Hospital: unlimited, must use approved hospital in four coastal provinces", networkRequired: true, preAuthRequired: true, severity: "warning", notes: "70% DHR if hospital outside coastal region for planned admissions." },

  // Non-network hospital upfront payments
  { ruleId: "DH_SAVER_DELTA_NONNETWORK_COPAY", scheme: "DH", plan: "Classic Delta Saver", category: "hospital", description: "Non-Delta network hospital: R11,100 upfront", coPaymentRands: 11100, networkRequired: true, preAuthRequired: true, severity: "error", notes: "Applies to all Delta options for planned admissions outside Delta Hospital Network." },
  { ruleId: "DH_SAVER_COASTAL_NONCOASTAL_COPAY", scheme: "DH", plan: "Coastal Saver", category: "hospital", description: "Hospital outside coastal regions: 70% DHR payment only", coPaymentPercent: 30, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Coastal plan pays 70% DHR for non-coastal hospitals." },

  // Home-based hospital DSP upfront
  { ruleId: "DH_SAVER_HOME_HOSP_COPAY", scheme: "DH", plan: "*", category: "hospital", description: "Decline home-based hospital care when recommended: R5,450 upfront", coPaymentRands: 5450, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Applies when treating provider recommends home-based care and member declines." },

  // Day Surgery Network co-payments
  { ruleId: "DH_SAVER_DSN_COPAY", scheme: "DH", plan: "Classic Saver", category: "hospital", description: "Out-of-Day Surgery Network: R7,250 upfront co-payment", coPaymentRands: 7250, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Classic, Essential and Coastal: R7,250. Delta options: R11,100." },
  { ruleId: "DH_SAVER_DELTA_DSN_COPAY", scheme: "DH", plan: "Classic Delta Saver", category: "hospital", description: "Out-of-Delta Day Surgery Network: R11,100 upfront co-payment", coPaymentRands: 11100, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Delta options use Delta Day Surgery Network." },

  // Scopes co-payments (all Saver plans)
  { ruleId: "DH_SAVER_SCOPE_DAY_CLINIC", scheme: "DH", plan: "*", category: "hospital", description: "Scope in day clinic: R4,650 co-payment (single), R5,700 (bidirectional)", coPaymentRands: 4650, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Bidirectional (gastroscopy + colonoscopy): R5,700." },
  { ruleId: "DH_SAVER_SCOPE_HOSPITAL", scheme: "DH", plan: "*", category: "hospital", description: "Scope in hospital: R8,000 co-payment (single), reduces to R6,650 with value-based network doctor", coPaymentRands: 8000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Bidirectional in hospital: R9,950 (reduces to R8,250 with value-based network)." },
  { ruleId: "DH_SAVER_SCOPE_DSN_COPAY", scheme: "DH", plan: "*", category: "hospital", description: "Scope outside Day Surgery Network: R7,250 upfront (R8,000 in hospital, R9,850 bidirectional)", coPaymentRands: 7250, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Delta options: R11,100 out-of-network." },
  { ruleId: "DH_SAVER_SCOPE_ROOMS", scheme: "DH", plan: "*", category: "hospital", description: "In-rooms scope non-network: R1,800 (single), R3,100 (bidirectional)", coPaymentRands: 1800, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "No co-payment at network in-rooms provider." },

  // MRI/CT out of hospital
  { ruleId: "DH_SAVER_MRI_CT_OOH", scheme: "DH", plan: "*", category: "radiology", description: "MRI/CT out-of-hospital: first R4,000 from day-to-day benefits, rest from Hospital Benefit", perEventLimitRands: 4000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Conservative back/neck: 1 scan per spinal/neck region per year." },

  // Cataract surgery
  { ruleId: "DH_SAVER_CATARACT_NONNETWORK", scheme: "DH", plan: "*", category: "hospital", description: "Cataract surgery at non-network facility: 80% DHR for hospital account", coPaymentPercent: 20, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Full account at agreed rate at network facility." },

  // Oncology
  { ruleId: "DH_SAVER_ONCOLOGY", scheme: "DH", plan: "Classic Saver", category: "oncology", description: "Oncology: R250,000 cover amount per 12-month cycle, then 80% DHR", annualLimitRands: 250000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Classic/Essential: any provider. PMB cancer treatment always covered in full at DSP." },
  { ruleId: "DH_SAVER_ONCOLOGY_DELTA", scheme: "DH", plan: "Classic Delta Saver", category: "oncology", description: "Oncology: R250,000 at network provider, then 80% DHR", annualLimitRands: 250000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Delta and Coastal Saver: network provider required." },
  { ruleId: "DH_SAVER_ONCOLOGY_PRECISION", scheme: "DH", plan: "*", category: "oncology", description: "Oncology Precision Medicine: 50% co-payment on approved precision treatments", coPaymentPercent: 50, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Sub-set of precision medicine. Clinical entry criteria apply." },

  // Prosthesis — joint replacement
  { ruleId: "DH_SAVER_PROSTHESIS_HIP_KNEE", scheme: "DH", plan: "*", category: "prosthesis", description: "Hip/knee prosthesis: unlimited in-network, R31,850/admission out-of-network", perEventLimitRands: 31850, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "No limit if network provider used. 80% DHR at non-network." },
  { ruleId: "DH_SAVER_PROSTHESIS_SHOULDER", scheme: "DH", plan: "*", category: "prosthesis", description: "Shoulder prosthesis: unlimited in-network, R48,500 out-of-network", perEventLimitRands: 48500, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "No limit if network provider used." },
  { ruleId: "DH_SAVER_SPINAL_PROSTHESIS", scheme: "DH", plan: "*", category: "prosthesis", description: "Spinal surgery prosthesis: unlimited with preferred supplier; non-preferred R21,600 (1 level) / R43,150 (2+ levels)", perEventLimitRands: 21600, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Limited to 1 procedure per person per year. Full cover in spinal surgery network." },

  // Cochlear implants / hearing aids
  { ruleId: "DH_SAVER_COCHLEAR", scheme: "DH", plan: "*", category: "appliance", description: "Cochlear implants: R252,000/person. Processor upgrade R190,000 per 3 years", perBeneficiaryLimit: 252000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Auditory brain implants included." },
  { ruleId: "DH_SAVER_COCHLEAR_LOW", scheme: "DH", plan: "*", category: "appliance", description: "Alternative cochlear: R150,000/person. Processor upgrade R78,000 per 3 years", perBeneficiaryLimit: 150000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Lower tier cochlear benefit." },
  { ruleId: "DH_SAVER_BONE_HEARING", scheme: "DH", plan: "*", category: "appliance", description: "Bone-Anchored Hearing Aids: R192,000/person", perBeneficiaryLimit: 192000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Internal nerve stimulators." },

  // Mental health
  { ruleId: "DH_SAVER_MENTAL_INPATIENT", scheme: "DH", plan: "*", category: "mental_health", description: "Mental health in-hospital: 21 days/year (major affective/anorexia/bulimia) OR 15 outpatient sessions, 3 days for attempted suicide", daysLimit: 21, visitLimit: 15, visitPeriodMonths: 12, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "12 out-of-hospital consults for acute stress. Full cover at network facility, 80% DHR elsewhere." },

  // Rehabilitation
  { ruleId: "DH_SAVER_REHAB", scheme: "DH", plan: "*", category: "hospital", description: "Alcohol/drug rehab: 21 days/person/year + 3 days detox per admission", daysLimit: 21, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Full cover at network facility. 80% DHR at non-network." },

  // Maternity
  { ruleId: "DH_SAVER_MATERNITY_ANTENATAL", scheme: "DH", plan: "*", category: "maternity", description: "Antenatal consultations: up to 8 with gynaecologist, GP or midwife", visitLimit: 8, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: false, severity: "info", notes: "2x 2D ultrasounds or 1 + nuchal translucency. 1 flu vaccination. Defined blood tests." },
  { ruleId: "DH_SAVER_MATERNITY_CLASSES", scheme: "DH", plan: "*", category: "maternity", description: "Antenatal/postnatal classes: 5 sessions, up to 2 years after birth", visitLimit: 5, visitPeriodMonths: 24, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Plus 1 breastfeeding consultation + 1 dietitian + 2 mental health consults." },
  { ruleId: "DH_SAVER_MATERNITY_POSTNATAL", scheme: "DH", plan: "*", category: "maternity", description: "Postnatal: 2 visits to GP/paediatrician/ENT for baby under 2", visitLimit: 2, visitPeriodMonths: 24, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Postnatal care including consultation for complications after delivery." },

  // Dental
  { ruleId: "DH_SAVER_DENTAL_TRAUMA", scheme: "DH", plan: "*", category: "dental", description: "Dental trauma: R70,800/person/year for appliances and prostheses", perBeneficiaryLimit: 70800, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Basic Dental Trauma Benefit. Clinical entry criteria apply." },
  { ruleId: "DH_SAVER_DENTAL_HOSP_ADULT", scheme: "DH", plan: "*", category: "dental", description: "Dental hospital admission co-pay (13+): R8,950 hospital / R5,750 day clinic", coPaymentRands: 8950, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Under 13: R3,470 hospital / R1,550 day clinic. Waived for severe dental/oral surgery." },

  // MSA allocations
  { ruleId: "DH_SAVER_MSA_CLASSIC", scheme: "DH", plan: "Classic Saver", category: "savings", description: "Medical Savings Account: 20% of monthly contribution", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Classic Saver MSA: R10,872 (member), R8,580 (adult dep), R4,344 (child). Unused carries over." },
  { ruleId: "DH_SAVER_MSA_CLASSIC_DELTA", scheme: "DH", plan: "Classic Delta Saver", category: "savings", description: "Medical Savings Account: 20% of monthly contribution", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Classic Delta Saver MSA: R8,688 (member), R6,864 (adult dep), R3,492 (child)." },
  { ruleId: "DH_SAVER_MSA_ESSENTIAL", scheme: "DH", plan: "Essential Saver", category: "savings", description: "Medical Savings Account: 10% of monthly contribution", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Essential Saver MSA: R4,356 (member), R3,264 (adult dep), R1,740 (child)." },
  { ruleId: "DH_SAVER_MSA_ESSENTIAL_DELTA", scheme: "DH", plan: "Essential Delta Saver", category: "savings", description: "Medical Savings Account: 10% of monthly contribution", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Essential Delta Saver MSA: R3,468 (member), R2,616 (adult dep), R1,392 (child)." },
  { ruleId: "DH_SAVER_MSA_COASTAL", scheme: "DH", plan: "Coastal Saver", category: "savings", description: "Medical Savings Account: 15% of monthly contribution", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Coastal Saver MSA: R6,828 (member), R5,136 (adult dep), R2,760 (child)." },

  // Personal Health Fund
  { ruleId: "DH_SAVER_PHF_CLASSIC", scheme: "DH", plan: "Classic Saver", category: "day_to_day", description: "Personal Health Fund: up to R10,000 base + R10,000 boost (max R20,000/family)", annualLimitRands: 10000, networkRequired: false, preAuthRequired: false, severity: "info", notes: "R1,000 advance/adult. Base: R2,500/adult, R1,250/child. Boost: R1,250/adult/challenge, max R10,000." },
  { ruleId: "DH_SAVER_PHF_ESSENTIAL", scheme: "DH", plan: "Essential Saver", category: "day_to_day", description: "Personal Health Fund: up to R6,000 base + R6,000 boost (max R12,000/family)", annualLimitRands: 6000, networkRequired: false, preAuthRequired: false, severity: "info", notes: "R1,000 advance/adult. Base: R1,500/adult, R750/child. Boost: R750/adult/challenge, max R6,000." },

  // DEB consultations
  { ruleId: "DH_SAVER_DEB_CLASSIC", scheme: "DH", plan: "Classic Saver", category: "gp_consultation", description: "Day-to-day Extender Benefit: 3 (single) / 6 (family) face-to-face GP consultations after MSA depleted", visitLimit: 3, visitPeriodMonths: 12, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Classic and Coastal plans. Plus video GP and pharmacy clinic consultations." },
  { ruleId: "DH_SAVER_DEB_ESSENTIAL", scheme: "DH", plan: "Essential Saver", category: "gp_consultation", description: "Day-to-day Extender Benefit: 2 (single) / 4 (family) face-to-face GP consultations after MSA depleted", visitLimit: 2, visitPeriodMonths: 12, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Essential plans. Plus video GP and pharmacy clinic consultations." },

  // Kids casualty visits
  { ruleId: "DH_SAVER_KIDS_CASUALTY", scheme: "DH", plan: "Classic Saver", category: "gp_consultation", description: "Kids casualty visits: 2/year for children under 10 at network provider", visitLimit: 2, visitPeriodMonths: 12, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Classic plans only. Not available on Essential or Coastal." },

  // Virtual Urgent Care
  { ruleId: "DH_SAVER_VIRTUAL_URGENT", scheme: "DH", plan: "*", category: "gp_consultation", description: "Virtual Urgent Care: 4 sessions/family/year", visitLimit: 4, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: false, severity: "info", notes: "24/7 online doctor consultation. Clinical entry criteria apply." },

  // Home monitoring
  { ruleId: "DH_SAVER_HOME_MONITOR", scheme: "DH", plan: "*", category: "appliance", description: "Home Monitoring Device Benefit: R4,850/person/year", perBeneficiaryLimit: 4850, networkRequired: false, preAuthRequired: true, severity: "info", notes: "For chronic and acute conditions. Does not affect day-to-day benefits." },

  // International Travel
  { ruleId: "DH_SAVER_TRAVEL", scheme: "DH", plan: "*", category: "hospital", description: "International Travel Benefit: R5M/person/journey, 90 days", perBeneficiaryLimit: 5000000, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Pre-existing conditions excluded. Elective treatment covered at equivalent local costs." },

  // International Second Opinion
  { ruleId: "DH_SAVER_SECOND_OPINION", scheme: "DH", plan: "*", category: "hospital", description: "International Second Opinion: 75% of cost via The Clinic by Cleveland Clinic", coPaymentPercent: 25, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Life-threatening and life-changing conditions." },

  // Trauma recovery
  { ruleId: "DH_SAVER_TRAUMA_RECOVERY", scheme: "DH", plan: "*", category: "mental_health", description: "Trauma Recovery Extender: 6 counselling sessions/person/year", visitLimit: 6, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Out-of-hospital claims related to traumatic events. Covers year of trauma plus next year." },

  // Chronic — CDL / CIB
  { ruleId: "DH_SAVER_CHRONIC_CDL", scheme: "DH", plan: "*", category: "chronic", description: "CDL chronic medicine: full cover on formulary at network pharmacy", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Non-formulary: up to Generic Reference Price or CDA. 20% co-payment at non-DSP pharmacy." },
  { ruleId: "DH_SAVER_CHRONIC_DIALYSIS", scheme: "DH", plan: "*", category: "renal", description: "Chronic dialysis: full cover at network provider, 80% DHR elsewhere", networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Must use approved treatment plan and network provider for full cover." },

  // Oncology medicine co-payment
  { ruleId: "DH_SAVER_ONCOLOGY_MED_COPAY", scheme: "DH", plan: "*", category: "oncology", description: "Oncology medicine: 20% co-payment if not using designated service provider", coPaymentPercent: 20, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Use DSP to avoid co-payment. Paid up to 100% DHR or Oncology Reference Price." },

  // Specialist cover in hospital
  { ruleId: "DH_SAVER_SPECIALIST_CLASSIC", scheme: "DH", plan: "Classic Saver", category: "specialist", description: "In-hospital specialists: up to 200% DHR for non-contracted, full cover for contracted", networkRequired: false, preAuthRequired: true, severity: "info", notes: "Classic plans: 200% DHR. Essential/Coastal: 100% DHR." },
  { ruleId: "DH_SAVER_SPECIALIST_ESSENTIAL", scheme: "DH", plan: "Essential Saver", category: "specialist", description: "In-hospital specialists: up to 100% DHR for non-contracted, full cover for contracted", networkRequired: false, preAuthRequired: true, severity: "info", notes: "Essential and Coastal plans: 100% DHR for non-contracted." },
];

// ─── DISCOVERY PRIORITY BENEFIT LIMITS (2026) ────────────────────────────────
// Source: Discovery Priority Plan Guide 2026 (Classic Priority, Essential Priority)

export const DISCOVERY_PRIORITY_LIMITS: BenefitLimitRule[] = [
  // Hospital — unlimited, no overall limit
  { ruleId: "DH_PRIORITY_HOSPITAL", scheme: "DH", plan: "Classic Priority", category: "hospital", description: "Hospital: unlimited, any private/public hospital approved by Scheme", networkRequired: false, preAuthRequired: true, severity: "info", notes: "No overall hospital limit. Payment at agreed rate for contracted providers, up to 200% DHR for others." },
  { ruleId: "DH_PRIORITY_ESSENTIAL_HOSPITAL", scheme: "DH", plan: "Essential Priority", category: "hospital", description: "Hospital: unlimited, any private/public hospital approved by Scheme, 100% DHR", networkRequired: false, preAuthRequired: true, severity: "info", notes: "Essential Priority: 100% DHR for non-contracted healthcare professionals." },

  // In-hospital procedure upfront payments
  { ruleId: "DH_PRIORITY_PROC_COPAY_LOW", scheme: "DH", plan: "*", category: "hospital", description: "Conservative back/neck, adenoidectomy, grommets, tonsillectomy: R5,000 upfront", coPaymentRands: 5000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Upfront payment for defined procedures." },
  { ruleId: "DH_PRIORITY_PROC_COPAY_MID", scheme: "DH", plan: "*", category: "hospital", description: "Arthroscopy, functional nasal, hysterectomy, laparoscopy, hysteroscopy, endometrial ablation: R11,500 upfront", coPaymentRands: 11500, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Except hysterectomy for pre-operatively diagnosed cancer." },
  { ruleId: "DH_PRIORITY_PROC_COPAY_HIGH", scheme: "DH", plan: "*", category: "hospital", description: "Nissen fundoplication, spinal surgery, joint replacements: R23,700 upfront", coPaymentRands: 23700, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Highest tier in-hospital procedure upfront payment." },

  // Day Surgery Network co-payments
  { ruleId: "DH_PRIORITY_DSN_COPAY", scheme: "DH", plan: "*", category: "hospital", description: "Out-of-Day Surgery Network: R7,250 upfront co-payment", coPaymentRands: 7250, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Higher of the two upfront amounts applies if procedure is on both lists." },

  // Scopes co-payments
  { ruleId: "DH_PRIORITY_SCOPE_DAY_CLINIC", scheme: "DH", plan: "*", category: "hospital", description: "Scope in day clinic: R4,650 co-payment (single), R5,700 (bidirectional)", coPaymentRands: 4650, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Same for Classic and Essential Priority." },
  { ruleId: "DH_PRIORITY_SCOPE_HOSPITAL", scheme: "DH", plan: "*", category: "hospital", description: "Scope in hospital: R7,500 co-payment (single, reduces to R6,050 with value-based network)", coPaymentRands: 7500, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Bidirectional: R9,450 (reduces to R7,650 with value-based network)." },
  { ruleId: "DH_PRIORITY_SCOPE_DSN_COPAY", scheme: "DH", plan: "*", category: "hospital", description: "Scope outside Day Surgery Network: R7,250 upfront (R7,500 in hospital, R9,450 bidirectional)", coPaymentRands: 7250, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "In-hospital outside DSN: R7,500. Bidirectional in hospital: R9,450." },
  { ruleId: "DH_PRIORITY_SCOPE_ROOMS", scheme: "DH", plan: "*", category: "hospital", description: "In-rooms scope non-network: R1,800 (single), R3,100 (bidirectional)", coPaymentRands: 1800, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "No co-payment at network in-rooms provider." },

  // MRI/CT out of hospital
  { ruleId: "DH_PRIORITY_MRI_CT_OOH", scheme: "DH", plan: "*", category: "radiology", description: "MRI/CT out-of-hospital: first R4,000 from day-to-day benefits, rest from Hospital Benefit", perEventLimitRands: 4000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Conservative back/neck: first R5,000 from hospital. 1 scan per spinal/neck region per year." },

  // Cataract surgery
  { ruleId: "DH_PRIORITY_CATARACT_NONNETWORK", scheme: "DH", plan: "*", category: "hospital", description: "Cataract surgery at non-network facility: 80% DHR for hospital account", coPaymentPercent: 20, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Full account at agreed rate at network facility." },

  // Oncology
  { ruleId: "DH_PRIORITY_ONCOLOGY", scheme: "DH", plan: "*", category: "oncology", description: "Oncology: R250,000 cover amount per 12-month cycle, then 80% DHR", annualLimitRands: 250000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Any provider. PMB cancer treatment always covered in full at DSP." },
  { ruleId: "DH_PRIORITY_ONCOLOGY_PRECISION", scheme: "DH", plan: "*", category: "oncology", description: "Oncology Precision Medicine: 50% co-payment on approved precision treatments", coPaymentPercent: 50, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Sub-set of precision medicine. Clinical entry criteria apply." },
  { ruleId: "DH_PRIORITY_ONCOLOGY_MED_COPAY", scheme: "DH", plan: "*", category: "oncology", description: "Oncology medicine: 20% co-payment if not using designated service provider", coPaymentPercent: 20, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Use DSP to avoid co-payment. Paid up to 100% DHR or Oncology Reference Price." },

  // Prosthesis — joint replacement
  { ruleId: "DH_PRIORITY_PROSTHESIS_HIP_KNEE", scheme: "DH", plan: "*", category: "prosthesis", description: "Hip/knee prosthesis: unlimited in-network, R31,850/admission out-of-network", perEventLimitRands: 31850, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "No limit if network provider used. 80% DHR at non-network." },
  { ruleId: "DH_PRIORITY_PROSTHESIS_SHOULDER", scheme: "DH", plan: "*", category: "prosthesis", description: "Shoulder prosthesis: unlimited in-network, R50,000 out-of-network", perEventLimitRands: 50000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "No limit if network provider used." },
  { ruleId: "DH_PRIORITY_SPINAL_PROSTHESIS", scheme: "DH", plan: "*", category: "prosthesis", description: "Spinal surgery prosthesis: unlimited with preferred supplier; non-preferred R24,250 (1 level) / R48,550 (2+ levels)", perEventLimitRands: 24250, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Limited to 1 procedure per person per year. Full cover in spinal surgery network." },

  // Cochlear implants / hearing aids
  { ruleId: "DH_PRIORITY_COCHLEAR", scheme: "DH", plan: "*", category: "appliance", description: "Cochlear implants: R252,000/person. Processor upgrade R190,000 per 3 years", perBeneficiaryLimit: 252000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Auditory brain implants included." },
  { ruleId: "DH_PRIORITY_COCHLEAR_LOW", scheme: "DH", plan: "*", category: "appliance", description: "Alternative cochlear: R150,000/person. Processor upgrade R78,000 per 3 years", perBeneficiaryLimit: 150000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Lower tier cochlear benefit." },
  { ruleId: "DH_PRIORITY_BONE_HEARING", scheme: "DH", plan: "*", category: "appliance", description: "Bone-Anchored Hearing Aids: R192,000/person", perBeneficiaryLimit: 192000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Internal nerve stimulators." },

  // Mental health
  { ruleId: "DH_PRIORITY_MENTAL_INPATIENT", scheme: "DH", plan: "*", category: "mental_health", description: "Mental health in-hospital: 21 days/year (major affective/anorexia/bulimia) OR 15 outpatient sessions, 3 days for attempted suicide", daysLimit: 21, visitLimit: 15, visitPeriodMonths: 12, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "12 out-of-hospital consults for acute stress. Full cover at network facility, 80% DHR elsewhere." },

  // Rehabilitation
  { ruleId: "DH_PRIORITY_REHAB", scheme: "DH", plan: "*", category: "hospital", description: "Alcohol/drug rehab: 21 days/person/year + 3 days detox per admission", daysLimit: 21, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Full cover at network facility. 80% DHR at non-network." },

  // Maternity
  { ruleId: "DH_PRIORITY_MATERNITY_ANTENATAL", scheme: "DH", plan: "*", category: "maternity", description: "Antenatal consultations: up to 8 with gynaecologist, GP or midwife", visitLimit: 8, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: false, severity: "info", notes: "2x 2D ultrasounds or 1 + nuchal translucency. 1 flu vaccination. Defined blood tests." },
  { ruleId: "DH_PRIORITY_MATERNITY_CLASSES", scheme: "DH", plan: "*", category: "maternity", description: "Antenatal/postnatal classes: 5 sessions, up to 2 years after birth", visitLimit: 5, visitPeriodMonths: 24, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Plus 1 breastfeeding consultation + 1 dietitian + 2 mental health consults." },
  { ruleId: "DH_PRIORITY_MATERNITY_POSTNATAL", scheme: "DH", plan: "*", category: "maternity", description: "Postnatal: 2 visits to GP/paediatrician/ENT for baby under 2", visitLimit: 2, visitPeriodMonths: 24, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Postnatal care including consultation for complications after delivery." },
  { ruleId: "DH_PRIORITY_ANTENATAL_CLASSES_LIMIT", scheme: "DH", plan: "*", category: "maternity", description: "Antenatal classes: R2,500/family from day-to-day benefits", annualLimitRands: 2500, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Day-to-day benefit limit." },

  // Dental — day-to-day limits
  { ruleId: "DH_PRIORITY_DENTAL_APPLIANCE", scheme: "DH", plan: "*", category: "dental", description: "Dental appliances/orthodontic: R23,400/person from day-to-day benefits", perBeneficiaryLimit: 23400, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Paid at 100% DHR from MSA/ATB. Pro-rated if joining after January." },
  { ruleId: "DH_PRIORITY_DENTAL_TRAUMA", scheme: "DH", plan: "*", category: "dental", description: "Dental trauma: R70,800/person/year for appliances and prostheses", perBeneficiaryLimit: 70800, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Basic Dental Trauma Benefit. Clinical entry criteria apply." },
  { ruleId: "DH_PRIORITY_DENTAL_HOSP_ADULT", scheme: "DH", plan: "*", category: "dental", description: "Dental hospital admission co-pay (13+): R8,950 hospital / R5,750 day clinic", coPaymentRands: 8950, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Under 13: R3,470 hospital / R1,550 day clinic. Waived for severe dental/oral surgery." },

  // Optical
  { ruleId: "DH_PRIORITY_OPTICAL", scheme: "DH", plan: "*", category: "optical", description: "Optical: R6,850/person (lenses, frames, contacts, refractive surgery)", perBeneficiaryLimit: 6850, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Day-to-day benefit limit. Paid from MSA/ATB." },

  // Allied health
  { ruleId: "DH_PRIORITY_ALLIED_CLASSIC", scheme: "DH", plan: "Classic Priority", category: "allied_health", description: "Allied/therapeutic/psychology: R15,250 (single) to R32,950 (3+ dependants)", annualLimitRands: 15250, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Physio, chiro, psychologist, OT, speech, audio, dietitian, etc. From MSA/ATB." },
  { ruleId: "DH_PRIORITY_ALLIED_ESSENTIAL", scheme: "DH", plan: "Essential Priority", category: "allied_health", description: "Allied/therapeutic/psychology: R10,100 (single) to R22,800 (3+ dependants)", annualLimitRands: 10100, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Essential Priority allied health limits." },

  // External medical items
  { ruleId: "DH_PRIORITY_EXTERNAL_ITEMS_CLASSIC", scheme: "DH", plan: "Classic Priority", category: "appliance", description: "External medical items (wheelchairs, crutches, prostheses): R43,000/family", annualLimitRands: 43000, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Day-to-day benefit." },
  { ruleId: "DH_PRIORITY_EXTERNAL_ITEMS_ESSENTIAL", scheme: "DH", plan: "Essential Priority", category: "appliance", description: "External medical items (wheelchairs, crutches, prostheses): R28,900/family", annualLimitRands: 28900, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Essential Priority external items." },

  // Hearing aids
  { ruleId: "DH_PRIORITY_HEARING_AIDS_CLASSIC", scheme: "DH", plan: "Classic Priority", category: "appliance", description: "Hearing aids: R25,150/family", annualLimitRands: 25150, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Classic Priority hearing aid limit." },
  { ruleId: "DH_PRIORITY_HEARING_AIDS_ESSENTIAL", scheme: "DH", plan: "Essential Priority", category: "appliance", description: "Hearing aids: R17,850/family", annualLimitRands: 17850, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Essential Priority hearing aid limit." },

  // Prescribed medicine limits
  { ruleId: "DH_PRIORITY_PRESCRIBED_MED_CLASSIC", scheme: "DH", plan: "Classic Priority", category: "medicine_acute", description: "Prescribed medicine (Sch 3+): R27,850 (single) to R44,350 (3+ dependants)", annualLimitRands: 27850, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Day-to-day benefit limit. OTC from PHF/MSA — no ATB accumulation." },
  { ruleId: "DH_PRIORITY_PRESCRIBED_MED_ESSENTIAL", scheme: "DH", plan: "Essential Priority", category: "medicine_acute", description: "Prescribed medicine (Sch 3+): R19,700 (single) to R33,700 (3+ dependants)", annualLimitRands: 19700, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Essential Priority prescribed medicine limits." },

  // MSA allocations
  { ruleId: "DH_PRIORITY_MSA_CLASSIC", scheme: "DH", plan: "Classic Priority", category: "savings", description: "Medical Savings Account: 25% of monthly contribution", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Classic Priority MSA: R17,376 (member), R13,704 (adult dep), R6,948 (child). Unused carries over." },
  { ruleId: "DH_PRIORITY_MSA_ESSENTIAL", scheme: "DH", plan: "Essential Priority", category: "savings", description: "Medical Savings Account: 15% of monthly contribution", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Essential Priority MSA: R8,964 (member), R7,044 (adult dep), R3,576 (child)." },

  // Annual Threshold
  { ruleId: "DH_PRIORITY_THRESHOLD", scheme: "DH", plan: "*", category: "day_to_day", description: "Annual Threshold: R27,160 (member), R20,410 (adult dep), R9,050 (child)", annualLimitRands: 27160, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Claims must add up to Annual Threshold before ATB kicks in." },

  // Limited Above Threshold Benefit
  { ruleId: "DH_PRIORITY_ATB", scheme: "DH", plan: "*", category: "day_to_day", description: "Limited Above Threshold Benefit: R20,080 (member), R14,330 (adult dep), R7,020 (child)", annualLimitRands: 20080, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Day-to-day expenses at DHR or portion of DHR once Annual Threshold reached. Benefit limits may apply." },

  // Personal Health Fund
  { ruleId: "DH_PRIORITY_PHF_CLASSIC", scheme: "DH", plan: "Classic Priority", category: "day_to_day", description: "Personal Health Fund: up to R10,000 base + R10,000 boost (max R20,000/family)", annualLimitRands: 10000, networkRequired: false, preAuthRequired: false, severity: "info", notes: "R1,000 advance/adult. Base: R2,500/adult, R1,250/child. Boost: R1,250/adult/challenge, max R10,000." },
  { ruleId: "DH_PRIORITY_PHF_ESSENTIAL", scheme: "DH", plan: "Essential Priority", category: "day_to_day", description: "Personal Health Fund: up to R6,000 base + R6,000 boost (max R12,000/family)", annualLimitRands: 6000, networkRequired: false, preAuthRequired: false, severity: "info", notes: "R1,000 advance/adult. Base: R1,500/adult, R750/child. Boost: R750/adult/challenge, max R6,000." },

  // DEB consultations (Priority has Self-payment Gap before ATB)
  { ruleId: "DH_PRIORITY_DEB_CLASSIC", scheme: "DH", plan: "Classic Priority", category: "gp_consultation", description: "Day-to-day Extender Benefit: video GP + pharmacy clinic consultations in Self-payment Gap, plus kids casualty", networkRequired: true, preAuthRequired: false, severity: "info", notes: "Classic Priority: DEB in Self-payment Gap between MSA depletion and Annual Threshold. Kids under 10: 2 casualty visits." },
  { ruleId: "DH_PRIORITY_DEB_ESSENTIAL", scheme: "DH", plan: "Essential Priority", category: "gp_consultation", description: "Day-to-day Extender Benefit: video GP + pharmacy clinic consultations in Self-payment Gap", networkRequired: true, preAuthRequired: false, severity: "info", notes: "Essential Priority: DEB in Self-payment Gap. No kids casualty visits." },

  // Virtual Urgent Care
  { ruleId: "DH_PRIORITY_VIRTUAL_URGENT", scheme: "DH", plan: "*", category: "gp_consultation", description: "Virtual Urgent Care: 4 sessions/family/year", visitLimit: 4, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: false, severity: "info", notes: "24/7 online doctor consultation. Clinical entry criteria apply." },

  // Home monitoring
  { ruleId: "DH_PRIORITY_HOME_MONITOR", scheme: "DH", plan: "*", category: "appliance", description: "Home Monitoring Device Benefit: R4,850/person/year", perBeneficiaryLimit: 4850, networkRequired: false, preAuthRequired: true, severity: "info", notes: "For chronic and acute conditions. Does not affect day-to-day benefits." },

  // International Travel
  { ruleId: "DH_PRIORITY_TRAVEL", scheme: "DH", plan: "*", category: "hospital", description: "International Travel Benefit: R5M/person/journey, 90 days", perBeneficiaryLimit: 5000000, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Pre-existing conditions excluded. Elective treatment covered at equivalent local costs." },

  // International Second Opinion
  { ruleId: "DH_PRIORITY_SECOND_OPINION", scheme: "DH", plan: "*", category: "hospital", description: "International Second Opinion: 75% of cost via The Clinic by Cleveland Clinic", coPaymentPercent: 25, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Life-threatening and life-changing conditions." },

  // Trauma recovery
  { ruleId: "DH_PRIORITY_TRAUMA_RECOVERY", scheme: "DH", plan: "*", category: "mental_health", description: "Trauma Recovery Extender: 6 counselling sessions/person/year", visitLimit: 6, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Out-of-hospital claims related to traumatic events. Covers year of trauma plus next year." },

  // Chronic — CDL / CIB
  { ruleId: "DH_PRIORITY_CHRONIC_CDL", scheme: "DH", plan: "*", category: "chronic", description: "CDL chronic medicine: full cover on formulary at network pharmacy", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Non-formulary: up to Generic Reference Price or CDA. 20% co-payment at non-DSP pharmacy." },
  { ruleId: "DH_PRIORITY_CHRONIC_DIALYSIS", scheme: "DH", plan: "*", category: "renal", description: "Chronic dialysis: full cover at network provider, 80% DHR elsewhere", networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Must use approved treatment plan and network provider for full cover." },

  // Specialist cover in hospital
  { ruleId: "DH_PRIORITY_SPECIALIST_CLASSIC", scheme: "DH", plan: "Classic Priority", category: "specialist", description: "In-hospital specialists: up to 200% DHR for non-contracted, full cover for contracted", networkRequired: false, preAuthRequired: true, severity: "info", notes: "Classic Priority: 200% DHR." },
  { ruleId: "DH_PRIORITY_SPECIALIST_ESSENTIAL", scheme: "DH", plan: "Essential Priority", category: "specialist", description: "In-hospital specialists: up to 100% DHR for non-contracted, full cover for contracted", networkRequired: false, preAuthRequired: true, severity: "info", notes: "Essential Priority: 100% DHR." },

  // Non-preferred medicine day-to-day
  { ruleId: "DH_PRIORITY_NONPREF_MED", scheme: "DH", plan: "*", category: "medicine_acute", description: "Non-preferred medicine: 75% DHR (within 25% of preferred) or 50% DHR (>50% above preferred)", networkRequired: false, preAuthRequired: false, severity: "warning", notes: "Preferred medicine at 100% DHR. Non-preferred reduced rates from ATB." },
];

// ─── GEMS EMERALD BENEFIT LIMITS (2025) ─────────────────────────────────────
// Source: GEMS Emerald Annexure C 2025 (75 pages)

export const GEMS_EMERALD_LIMITS: BenefitLimitRule[] = [
  // Hospital — unlimited
  { ruleId: "GEMS_EMERALD_HOSPITAL", scheme: "GEMS", plan: "Emerald", category: "hospital", description: "Hospital (B1): unlimited at 100% Scheme Rate, pre-auth required 48hrs before", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Includes accommodation, theatre, medicines, materials, neonatal. 130% for Network." },
  { ruleId: "GEMS_EMERALD_HOSP_COPAY", scheme: "GEMS", plan: "Emerald", category: "hospital", description: "Hospital no pre-auth penalty: R1,000 co-payment per admission", coPaymentRands: 1000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Emergency: notify within 1 working day. Private ward subject to motivation." },

  // Maternity
  { ruleId: "GEMS_EMERALD_MATERNITY", scheme: "GEMS", plan: "Emerald", category: "maternity", description: "Maternity (B2): unlimited, subject to PMB. R1,000 co-pay if no pre-auth.", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Home birth and registered birthing units covered. Includes midwife services." },
  { ruleId: "GEMS_EMERALD_MATERNITY_SCAN", scheme: "GEMS", plan: "Emerald", category: "maternity", description: "Maternity ultrasound: 2 x 2D scans per pregnancy. 3D/4D funded up to 2D cost.", visitLimit: 2, networkRequired: false, preAuthRequired: false, severity: "info", notes: "3D/4D substitution allowed but paid at 2D rate only." },

  // GP
  { ruleId: "GEMS_EMERALD_GP", scheme: "GEMS", plan: "Emerald", category: "gp_consultation", description: "Family Practitioner (B3): unlimited, 100% (non-network) / 130% (network)", networkRequired: false, preAuthRequired: false, severity: "info", notes: "200% Scheme Rate for managed care procedures in rooms instead of hospital." },

  // Specialist
  { ruleId: "GEMS_EMERALD_SPECIALIST", scheme: "GEMS", plan: "Emerald", category: "specialist", description: "Specialist (B4): unlimited, 100% (non-network) / 130% (network)", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Reimbursement according to Scheme-approved tariff file." },

  // Surgery
  { ruleId: "GEMS_EMERALD_SURGERY", scheme: "GEMS", plan: "Emerald", category: "hospital", description: "Surgical procedures (B5): unlimited, 100%/200% for managed care in-rooms procedures", networkRequired: false, preAuthRequired: true, severity: "info", notes: "Includes maxillofacial surgery and surgical removal of impacted teeth." },

  // Dentistry in-hospital
  { ruleId: "GEMS_EMERALD_DENTAL_HOSP", scheme: "GEMS", plan: "Emerald", category: "dental", description: "Dentistry in-hospital (B6): shared limits with C2 dental. GA only for under 6 or severe trauma.", networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Conservative, restorative and specialised. Implant crowns, bridges, dentures subject to pre-auth." },

  // Advanced radiology
  { ruleId: "GEMS_EMERALD_ADV_RADIOLOGY", scheme: "GEMS", plan: "Emerald", category: "radiology", description: "Advanced radiology (B8/C9): R29,694/family/year shared in/out hospital", annualLimitRands: 29694, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Angiography, CT, Coronary Angiography, MDCT, MRI, MUGA, PET, Radio-isotope studies." },

  // Pathology
  { ruleId: "GEMS_EMERALD_PATHOLOGY", scheme: "GEMS", plan: "Emerald", category: "pathology", description: "Pathology (B9): unlimited, subject to managed care protocols", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Tests must be related to admission diagnosis." },

  // Physiotherapy in-hospital
  { ruleId: "GEMS_EMERALD_PHYSIO_HOSP", scheme: "GEMS", plan: "Emerald", category: "physiotherapy", description: "Physiotherapy in-hospital (B11): R6,673/beneficiary/year", perBeneficiaryLimit: 6673, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Subject to hospital pre-auth and services related to admission diagnosis." },

  // Post-surgery physio
  { ruleId: "GEMS_EMERALD_POST_SURG_PHYSIO", scheme: "GEMS", plan: "Emerald", category: "physiotherapy", description: "Post hip/knee/shoulder replacement physio (B12/C1.6): R7,044/beneficiary/event, 10 visits", perBeneficiaryLimit: 7044, visitLimit: 10, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Shared between B12 and C1.6. Within 60 days of surgery." },

  // Organ transplant
  { ruleId: "GEMS_EMERALD_TRANSPLANT", scheme: "GEMS", plan: "Emerald", category: "organ_transplant", description: "Organ/tissue transplant (B13): R824,901/beneficiary/year", perBeneficiaryLimit: 824901, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Sub-limit R28,001 for corneal grafts. Includes materials and immunosuppressants. Organ harvesting limited to RSA except cornea." },

  // Prosthesis
  { ruleId: "GEMS_EMERALD_PROSTHESIS", scheme: "GEMS", plan: "Emerald", category: "prosthesis", description: "Internal prosthesis (B14): R56,131/family/year shared with C11 appliances", annualLimitRands: 56131, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Plus R56,131/family for joint revisions only. Once depleted, unlimited for PMBs." },
  { ruleId: "GEMS_EMERALD_PROSTH_JOINT_REV", scheme: "GEMS", plan: "Emerald", category: "prosthesis", description: "Joint revisions prosthesis: additional R56,131/family/year", annualLimitRands: 56131, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Additional limit for joint revisions only." },
  { ruleId: "GEMS_EMERALD_PROSTH_FOOT", scheme: "GEMS", plan: "Emerald", category: "prosthesis", description: "Foot orthotics/prosthetics sub-limit: R6,164/beneficiary/year", perBeneficiaryLimit: 6164, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Sub-limit R1,761/beneficiary for orthotic shoes, inserts, levelers." },

  // Emergency
  { ruleId: "GEMS_EMERALD_EMERGENCY", scheme: "GEMS", plan: "Emerald", category: "hospital", description: "Emergency/casualty (B15): PMB only, cost defrayed from C1.1 GP Services for non-PMB", networkRequired: true, preAuthRequired: false, severity: "warning", notes: "Use facility as per B1. Non-PMB/unauthorised defrayed from GP benefit." },

  // Renal dialysis
  { ruleId: "GEMS_EMERALD_RENAL", scheme: "GEMS", plan: "Emerald", category: "renal", description: "Renal dialysis (B16): R353,521/beneficiary/year for chronic dialysis", perBeneficiaryLimit: 353521, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Acute dialysis included in B1. Erythropoietin in B10 Blood Services. Unlimited for PMBs once depleted." },

  // Oncology
  { ruleId: "GEMS_EMERALD_ONCOLOGY", scheme: "GEMS", plan: "Emerald", category: "oncology", description: "Oncology chemo/radiotherapy (B17): R494,945/family/year", annualLimitRands: 494945, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Sub-limit R336,702 for biological and specialised medicines. Includes pathology, radiology, medical technologists." },
  { ruleId: "GEMS_EMERALD_ONCOLOGY_BIO", scheme: "GEMS", plan: "Emerald", category: "oncology", description: "Oncology biological/specialised medicine sub-limit: R336,702/family/year", annualLimitRands: 336702, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Within overall oncology limit. Subject to Medicine Price List (MPL)." },

  // Mental health
  { ruleId: "GEMS_EMERALD_MENTAL", scheme: "GEMS", plan: "Emerald", category: "mental_health", description: "Mental health (B18/C10): R24,746/family/year shared in/out hospital", annualLimitRands: 24746, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Sub-limit R7,338 for out-of-hospital psychologist consultations. R2,879/family for Educational/Industrial Psychologists." },
  { ruleId: "GEMS_EMERALD_MENTAL_PSYCH", scheme: "GEMS", plan: "Emerald", category: "mental_health", description: "Mental health psychologist out-of-hospital sub-limit: R7,338/family/year", annualLimitRands: 7338, networkRequired: false, preAuthRequired: false, severity: "warning", notes: "Within overall mental health limit. Max 1 individual + 1 group consultation per day." },

  // Allied health
  { ruleId: "GEMS_EMERALD_ALLIED", scheme: "GEMS", plan: "Emerald", category: "allied_health", description: "Allied health (B22/C5): R2,128/family/year shared in/out hospital", annualLimitRands: 2128, networkRequired: false, preAuthRequired: false, severity: "warning", notes: "Chiropractors, Homeopaths, Phytotherapists, Acupuncturists, Chinese Medicine Practitioners." },
  { ruleId: "GEMS_EMERALD_OTHER_PROF", scheme: "GEMS", plan: "Emerald", category: "allied_health", description: "Other professional health (B23/C6): shared with allied, sub-limit R1,652/family for Social Workers/Counsellors", annualLimitRands: 1652, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Dieticians, Podiatrists, Social Workers, Registered Counsellors, Orthoptists." },

  // Alternatives to hospitalisation
  { ruleId: "GEMS_EMERALD_ALT_HOSP", scheme: "GEMS", plan: "Emerald", category: "hospital", description: "Alternatives to hospitalisation (B19): unlimited, subject to PMB", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Sub-acute hospitals, physical rehab, private nursing, hospice. Excludes frail care and recuperative holidays." },

  // Out-of-hospital: Day-to-Day Block
  { ruleId: "GEMS_EMERALD_BLOCK", scheme: "GEMS", plan: "Emerald", category: "day_to_day", description: "Day-to-Day Block Benefit (C1): R12,351/family, R6,173/beneficiary/year", annualLimitRands: 12351, perBeneficiaryLimit: 6173, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Shared between C1.1-C1.9: GP, specialist, physio, maternity, audiology/OT/speech, pathology. Pro-rated." },

  // Primary Care Extender
  { ruleId: "GEMS_EMERALD_EXTENDER", scheme: "GEMS", plan: "Emerald", category: "gp_consultation", description: "Primary Care Extender (C1.2): R2,063/beneficiary/year additional from Risk", perBeneficiaryLimit: 2063, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Payable from Risk when Block Benefit exhausted. Network FP required." },

  // GP Network Extender
  { ruleId: "GEMS_EMERALD_GP_EXTENDER", scheme: "GEMS", plan: "Emerald", category: "gp_consultation", description: "GP Network Extender (C1.3): 2 additional consultations at network per chronic condition", visitLimit: 2, networkRequired: true, preAuthRequired: true, severity: "info", notes: "Paid from Risk. For chronic conditions registered on Disease Management Programme." },

  // Physiotherapy out-of-hospital
  { ruleId: "GEMS_EMERALD_PHYSIO_OOH", scheme: "GEMS", plan: "Emerald", category: "physiotherapy", description: "Physiotherapy out-of-hospital (C1.5): R6,132/family, R3,066/beneficiary sub-limit", annualLimitRands: 6132, perBeneficiaryLimit: 3066, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Within Day-to-Day Block Benefit." },

  // Audiology/OT/Speech sub-limit
  { ruleId: "GEMS_EMERALD_AUDIO_OT_SPEECH", scheme: "GEMS", plan: "Emerald", category: "allied_health", description: "Audiology/OT/Speech (C1.8): R6,034/family, R3,011/beneficiary sub-limit", annualLimitRands: 6034, perBeneficiaryLimit: 3011, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Shared with C1.9 Pathology. Further sub-limit R4,840/family, R2,424/beneficiary." },

  // Dental out-of-hospital
  { ruleId: "GEMS_EMERALD_DENTAL_OOH", scheme: "GEMS", plan: "Emerald", category: "dental", description: "Dental (C2): R6,900/beneficiary/year for conservative, restorative, specialised", perBeneficiaryLimit: 6900, networkRequired: false, preAuthRequired: false, severity: "warning", notes: "Panoramic X-ray: 1 per 3 years. Bitewing: 6 per year. Periapical: 10 per year. CBCT: 1 per lifetime." },

  // Optical
  { ruleId: "GEMS_EMERALD_OPTICAL", scheme: "GEMS", plan: "Emerald", category: "optical", description: "Optical (C3): R5,942/family/year, R3,099/beneficiary per 2 years", annualLimitRands: 5942, perBeneficiaryLimit: 3099, networkRequired: false, preAuthRequired: false, severity: "warning", notes: "Frames max R1,636. 1 eye exam/year. 1 frame + lenses per 24 months. Keratoconus booster R2,751/family." },
  { ruleId: "GEMS_EMERALD_OPTICAL_CATARACT", scheme: "GEMS", plan: "Emerald", category: "optical", description: "Post-cataract optical PMB: R1,744 for lens+frame, sub-limit R293 for frame", perEventLimitRands: 1744, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Limited to cost of bifocal lens." },

  // Basic radiology out-of-hospital
  { ruleId: "GEMS_EMERALD_BASIC_RAD_OOH", scheme: "GEMS", plan: "Emerald", category: "radiology", description: "Basic radiology out-of-hospital (C4): R9,034/family, R4,930/beneficiary sub-limit", annualLimitRands: 9034, perBeneficiaryLimit: 4930, networkRequired: false, preAuthRequired: false, severity: "info", notes: "X-rays and soft tissue ultrasound scans. Includes 2x2D pregnancy scans." },

  // Prescribed medication — acute
  { ruleId: "GEMS_EMERALD_ACUTE_MED", scheme: "GEMS", plan: "Emerald", category: "medicine_acute", description: "Acute medicine (C8.1): R14,847/family, R4,950/beneficiary/year", annualLimitRands: 14847, perBeneficiaryLimit: 4950, networkRequired: false, preAuthRequired: false, severity: "warning", notes: "30% co-pay for out-of-formulary. Includes maternity vitamin supplements." },
  { ruleId: "GEMS_EMERALD_HOMEO", scheme: "GEMS", plan: "Emerald", category: "medicine_acute", description: "Homeopathic medicine: R738/family/year, 30% co-pay for out-of-formulary", annualLimitRands: 738, coPaymentPercent: 30, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Within acute medicine limit." },

  // OTC
  { ruleId: "GEMS_EMERALD_OTC", scheme: "GEMS", plan: "Emerald", category: "medicine_otc", description: "OTC medicine: R1,994/family, R1,247/beneficiary/year, R334/beneficiary event", annualLimitRands: 1994, perBeneficiaryLimit: 1247, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Schedule 0, 1 and 2 only. Within acute medicine limit." },

  // Female contraceptives
  { ruleId: "GEMS_EMERALD_CONTRACEPTIVE", scheme: "GEMS", plan: "Emerald", category: "contraceptive", description: "Female contraceptives: R3,757/beneficiary/year", perBeneficiaryLimit: 3757, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Oral, insertables, injectables and dermal. Within acute medicine limit." },

  // Non-PMB chronic
  { ruleId: "GEMS_EMERALD_CHRONIC_NONPMB", scheme: "GEMS", plan: "Emerald", category: "chronic", description: "Non-PMB chronic conditions: R29,897/family, R14,847/beneficiary/year", annualLimitRands: 29897, perBeneficiaryLimit: 14847, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Annexure D conditions. No benefit for non-PMB conditions not in Annexure D. Unlimited for PMBs once depleted." },
  { ruleId: "GEMS_EMERALD_CHRONIC_PMB", scheme: "GEMS", plan: "Emerald", category: "chronic", description: "Chronic PMB/CDL conditions: unlimited, subject to formulary/MPL, 28-day supply", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Prior application and approval required. Chronic Medicine Pharmacy DSP. 30% co-pay for non-formulary/non-DSP." },

  // CGM / Insulin pumps
  { ruleId: "GEMS_EMERALD_CGM_CONSUMABLES", scheme: "GEMS", plan: "Emerald", category: "chronic", description: "CGM consumables: R28,324/beneficiary/year", perBeneficiaryLimit: 28324, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Type 1 diabetics under 19 only. Devices via C11 appliances." },
  { ruleId: "GEMS_EMERALD_CGM_DEVICE", scheme: "GEMS", plan: "Emerald", category: "chronic", description: "CGM/Insulin pump devices: R59,531/family/year (under 19, Type 1 DM only)", annualLimitRands: 59531, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "1 device per beneficiary per 60 months. Via C11 appliances." },

  // Appliances (out-of-hospital)
  { ruleId: "GEMS_EMERALD_APPLIANCE", scheme: "GEMS", plan: "Emerald", category: "appliance", description: "Medical & surgical appliances (C11): R21,901/family/year sub-limit, shared with B14 R56,131", annualLimitRands: 21901, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "C11 sub-limit within shared B14 prosthesis limit of R56,131/family." },
  { ruleId: "GEMS_EMERALD_WHEELCHAIR", scheme: "GEMS", plan: "Emerald", category: "appliance", description: "Wheelchair: R7,716/beneficiary per 24 months", perBeneficiaryLimit: 7716, networkRequired: false, preAuthRequired: true, severity: "info", notes: "1 wheelchair per 24 months." },
  { ruleId: "GEMS_EMERALD_CRUTCHES", scheme: "GEMS", plan: "Emerald", category: "appliance", description: "Crutches: R701/beneficiary/year", perBeneficiaryLimit: 701, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Annual limit." },
  { ruleId: "GEMS_EMERALD_HEARING_AID", scheme: "GEMS", plan: "Emerald", category: "appliance", description: "Hearing aids: R11,223/beneficiary per 36 months (1 bilateral pair)", perBeneficiaryLimit: 11223, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "1 pair every 36 months." },
  { ruleId: "GEMS_EMERALD_CPAP", scheme: "GEMS", plan: "Emerald", category: "appliance", description: "CPAP device: R13,328/beneficiary per 36 months", perBeneficiaryLimit: 13328, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "1 device per 36 months." },
  { ruleId: "GEMS_EMERALD_COMPRESSION", scheme: "GEMS", plan: "Emerald", category: "appliance", description: "Compression stockings: R584/pair, 3 pairs/beneficiary/year", perEventLimitRands: 584, networkRequired: false, preAuthRequired: false, severity: "info", notes: "3 pairs per beneficiary per annum." },
  { ruleId: "GEMS_EMERALD_PULSE_OX", scheme: "GEMS", plan: "Emerald", category: "appliance", description: "Pulse oximeter: R467/family/year", annualLimitRands: 467, networkRequired: false, preAuthRequired: false, severity: "info", notes: "1 per family per annum." },
  { ruleId: "GEMS_EMERALD_BRACE", scheme: "GEMS", plan: "Emerald", category: "appliance", description: "Knee/back brace: R3,499/brace/beneficiary/year", perBeneficiaryLimit: 3499, networkRequired: false, preAuthRequired: false, severity: "info", notes: "1 knee and 1 back brace per beneficiary per annum." },

  // Screening/preventive
  { ruleId: "GEMS_EMERALD_SCREENING", scheme: "GEMS", plan: "Emerald", category: "gp_consultation", description: "Screening services (C13): 1 per year each (cholesterol, bone density, PSA, mammogram, etc.)", visitLimit: 1, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Paid from Risk. HPV vaccination: 1 course per female beneficiary lifetime." },
  { ruleId: "GEMS_EMERALD_VACCINATION", scheme: "GEMS", plan: "Emerald", category: "gp_consultation", description: "Other vaccinations: R950/beneficiary/year", perBeneficiaryLimit: 950, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Annual vaccination benefit." },

  // Dental sealants
  { ruleId: "GEMS_EMERALD_DENTAL_SEALANT", scheme: "GEMS", plan: "Emerald", category: "dental", description: "Dental sealants/polishing: under 18 only, network provider required", networkRequired: true, preAuthRequired: false, severity: "info", notes: "Dental polishing: ages 3-9. Under Preventive Care Services." },

  // Infertility
  { ruleId: "GEMS_EMERALD_INFERTILITY", scheme: "GEMS", plan: "Emerald", category: "maternity", description: "Infertility (C16): PMB only. Non-DSP/State = Scheme not liable for first bill", networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Must use DSP (State or Network). Non-DSP = Scheme not liable for facility bill." },
];

// ─── GEMS BERYL BENEFIT LIMITS (2025) ───────────────────────────────────────
// Source: GEMS Beryl Annexure C 2025 (69 pages)

export const GEMS_BERYL_LIMITS: BenefitLimitRule[] = [
  // Hospital — overall limit
  { ruleId: "GEMS_BERYL_HOSPITAL", scheme: "GEMS", plan: "Beryl", category: "hospital", description: "Hospital (B): R1,460,702/family/year overall limit at 100% Scheme Rate", annualLimitRands: 1460702, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Subject to overall hospital limit. All in-hospital sub-limits within this. 130% for Network." },
  { ruleId: "GEMS_BERYL_HOSP_COPAY", scheme: "GEMS", plan: "Beryl", category: "hospital", description: "Hospital no pre-auth penalty: R1,000 co-payment per admission", coPaymentRands: 1000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Emergency: notify within 1 working day. TTO limited to 7 days." },

  // Maternity
  { ruleId: "GEMS_BERYL_MATERNITY", scheme: "GEMS", plan: "Beryl", category: "maternity", description: "Maternity (B2): unlimited, subject to PMB. R1,000 co-pay if no pre-auth.", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Home birth and accredited birthing units covered. Includes midwife services." },
  { ruleId: "GEMS_BERYL_MATERNITY_SCAN", scheme: "GEMS", plan: "Beryl", category: "maternity", description: "Maternity ultrasound: 2 x 2D scans per pregnancy. 3D/4D funded up to 2D cost.", visitLimit: 2, networkRequired: false, preAuthRequired: false, severity: "info", notes: "3D/4D substitution allowed but paid at 2D rate only." },

  // GP — DSP/Network only, unlimited
  { ruleId: "GEMS_BERYL_GP", scheme: "GEMS", plan: "Beryl", category: "gp_consultation", description: "Family Practitioner: unlimited at DSP/Network, 200% for managed care in-rooms procedures", networkRequired: true, preAuthRequired: false, severity: "info", notes: "16th+ consultation per beneficiary requires pre-auth. Non-DSP: 70% rate, max 3 visits/family, R1,445/event." },
  { ruleId: "GEMS_BERYL_GP_NON_DSP", scheme: "GEMS", plan: "Beryl", category: "gp_consultation", description: "GP non-DSP voluntary use: 70% Scheme Rate, 3 visits/family, R1,445/event", annualLimitRands: 1445, coPaymentPercent: 30, visitLimit: 3, networkRequired: false, preAuthRequired: false, severity: "warning", notes: "Member must pay claim and submit with proof for reimbursement." },

  // Specialist — very limited
  { ruleId: "GEMS_BERYL_SPECIALIST_OOH", scheme: "GEMS", plan: "Beryl", category: "specialist", description: "Specialist out-of-hospital (C4): 5 consultations or R5,255/family, 3 or R3,505/beneficiary", annualLimitRands: 5255, perBeneficiaryLimit: 3505, visitLimit: 5, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Requires DSP/Network FP referral + pre-auth for each visit. 130% for Network, 200% for in-rooms procedures." },

  // Surgery
  { ruleId: "GEMS_BERYL_SURGERY", scheme: "GEMS", plan: "Beryl", category: "hospital", description: "Surgical procedures (B5): within overall hospital limit, maxillofacial R29,213/family sub-limit", annualLimitRands: 29213, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Maxillofacial surgery and impacted teeth sub-limit." },

  // Advanced radiology
  { ruleId: "GEMS_BERYL_ADV_RADIOLOGY", scheme: "GEMS", plan: "Beryl", category: "radiology", description: "Advanced radiology (B8/C8): R28,226/beneficiary/year shared in/out hospital", perBeneficiaryLimit: 28226, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Within overall hospital limit. CT, MRI, PET, MUGA, Angiography, Radio-isotope studies." },

  // Physiotherapy in-hospital
  { ruleId: "GEMS_BERYL_PHYSIO_HOSP", scheme: "GEMS", plan: "Beryl", category: "physiotherapy", description: "Physiotherapy in-hospital (B11): R6,344/beneficiary/year within hospital limit", perBeneficiaryLimit: 6344, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Subject to hospital pre-auth, services related to admission diagnosis." },

  // Post-surgery physio
  { ruleId: "GEMS_BERYL_POST_SURG_PHYSIO", scheme: "GEMS", plan: "Beryl", category: "physiotherapy", description: "Post hip/knee/shoulder replacement physio (B12/C15): R7,044/beneficiary/event, 10 visits", perBeneficiaryLimit: 7044, visitLimit: 10, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Shared between B12 and C15. Within 60 days of surgery." },

  // Organ transplant
  { ruleId: "GEMS_BERYL_TRANSPLANT", scheme: "GEMS", plan: "Beryl", category: "organ_transplant", description: "Organ/tissue transplant (B13): R824,901/beneficiary/year", perBeneficiaryLimit: 824901, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Sub-limit R28,001 for corneal grafts. Includes materials and immunosuppressants. Within hospital limit." },

  // Prosthesis
  { ruleId: "GEMS_BERYL_PROSTHESIS", scheme: "GEMS", plan: "Beryl", category: "prosthesis", description: "Internal prosthesis (B14): R43,823/family/year within hospital limit", annualLimitRands: 43823, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Plus R43,823/family for joint revisions only. Shared with C16 appliances. Once depleted, unlimited for PMBs." },
  { ruleId: "GEMS_BERYL_PROSTH_JOINT_REV", scheme: "GEMS", plan: "Beryl", category: "prosthesis", description: "Joint revisions prosthesis: additional R43,823/family/year", annualLimitRands: 43823, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Additional limit for joint revisions only." },
  { ruleId: "GEMS_BERYL_PROSTH_FOOT", scheme: "GEMS", plan: "Beryl", category: "prosthesis", description: "Foot orthotics/prosthetics sub-limit: R6,164/beneficiary/year", perBeneficiaryLimit: 6164, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Sub-limit R1,761/beneficiary for orthotic shoes, inserts, levelers." },

  // Emergency
  { ruleId: "GEMS_BERYL_EMERGENCY", scheme: "GEMS", plan: "Beryl", category: "hospital", description: "Emergency/casualty (B15): PMB only, within hospital limit", networkRequired: true, preAuthRequired: false, severity: "warning", notes: "Use facility as per B1. Subject to hospital authorisation." },

  // Renal dialysis
  { ruleId: "GEMS_BERYL_RENAL", scheme: "GEMS", plan: "Beryl", category: "renal", description: "Renal dialysis (B16): R292,135/family/year for chronic dialysis", annualLimitRands: 292135, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Within overall hospital limit. Acute dialysis in B1. Unlimited for PMBs once depleted." },

  // Oncology
  { ruleId: "GEMS_BERYL_ONCOLOGY", scheme: "GEMS", plan: "Beryl", category: "oncology", description: "Oncology chemo/radiotherapy (B17): R292,135/family/year", annualLimitRands: 292135, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Within overall hospital limit. Subject to MPL. Unlimited for PMBs once depleted." },

  // Mental health
  { ruleId: "GEMS_BERYL_MENTAL_HOSP", scheme: "GEMS", plan: "Beryl", category: "mental_health", description: "Mental health in-hospital (B18): R23,523/beneficiary/year within hospital limit", perBeneficiaryLimit: 23523, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Less beneficiary usage of C19 sub-limit. Max 3 days hospitalisation by FP. R2,879/family for Educational/Industrial Psychologists." },
  { ruleId: "GEMS_BERYL_MENTAL_OOH", scheme: "GEMS", plan: "Beryl", category: "mental_health", description: "Mental health out-of-hospital (C19): R13,272/family/year", annualLimitRands: 13272, networkRequired: true, preAuthRequired: false, severity: "warning", notes: "DSP/Network required. Non-DSP: 30% co-payment. R2,879/family for Educational/Industrial Psychologists." },

  // Allied health
  { ruleId: "GEMS_BERYL_ALLIED", scheme: "GEMS", plan: "Beryl", category: "allied_health", description: "Allied health (B22/C11-C14): R4,255/family, R2,830/beneficiary/year", annualLimitRands: 4255, perBeneficiaryLimit: 2830, networkRequired: false, preAuthRequired: false, severity: "warning", notes: "Shared between Allied, Other Professional, Physio, Audiology/OT/Speech. Requires FP/Specialist referral." },
  { ruleId: "GEMS_BERYL_OTHER_PROF", scheme: "GEMS", plan: "Beryl", category: "allied_health", description: "Other professional health (C12): sub-limit R2,128/family for Social Workers/Counsellors", annualLimitRands: 2128, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Dieticians, Podiatrists, Social Workers, Registered Counsellors, Orthoptists." },
  { ruleId: "GEMS_BERYL_OTHER_PROF_SW", scheme: "GEMS", plan: "Beryl", category: "allied_health", description: "Social Workers/Registered Counsellors sub-limit: R2,046/family/year", annualLimitRands: 2046, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Within other professional health services limit." },

  // Breast reductions — no benefit
  { ruleId: "GEMS_BERYL_BREAST_RED", scheme: "GEMS", plan: "Beryl", category: "hospital", description: "Breast reductions (B21): no benefit unless PMB", networkRequired: false, preAuthRequired: false, severity: "error", notes: "No benefit for breast reductions on Beryl, unless PMB." },

  // Medical technologists
  { ruleId: "GEMS_BERYL_MED_TECH", scheme: "GEMS", plan: "Beryl", category: "hospital", description: "Medical technologists (B20): R29,213/family/year sub-limit within hospital limit", annualLimitRands: 29213, networkRequired: true, preAuthRequired: true, severity: "info", notes: "Includes materials." },

  // Screening
  { ruleId: "GEMS_BERYL_SCREENING", scheme: "GEMS", plan: "Beryl", category: "gp_consultation", description: "Screening services (C2): 1 per year each, paid from Risk", visitLimit: 1, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Cholesterol, bone density, pap smear, PSA, mammogram, etc. HPV: 1 course per female lifetime." },
  { ruleId: "GEMS_BERYL_VACCINATION", scheme: "GEMS", plan: "Beryl", category: "gp_consultation", description: "Other vaccinations: R950/beneficiary/year", perBeneficiaryLimit: 950, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Annual vaccination benefit." },

  // Dental — limited
  { ruleId: "GEMS_BERYL_DENTAL", scheme: "GEMS", plan: "Beryl", category: "dental", description: "Dental (C5): DSP/Network only, limited events per beneficiary/year", networkRequired: true, preAuthRequired: false, severity: "warning", notes: "Exams: 2/year. Pain/sepsis: 2/year. Fillings: unlimited at DSP. Extractions: 1/year. Panoramic X-ray: 1 per 3 years. Bitewing: 4/year. Root canal: 1/year. Emergency non-DSP: 1/year." },
  { ruleId: "GEMS_BERYL_DENTAL_SEALANT", scheme: "GEMS", plan: "Beryl", category: "dental", description: "Dental sealants: under 18 only, network provider required", networkRequired: true, preAuthRequired: false, severity: "info", notes: "Under Preventive Care Services C3." },

  // Basic radiology out-of-hospital
  { ruleId: "GEMS_BERYL_BASIC_RAD", scheme: "GEMS", plan: "Beryl", category: "radiology", description: "Basic radiology out-of-hospital (C7): unlimited, requires FP/Specialist referral", networkRequired: false, preAuthRequired: false, severity: "info", notes: "X-rays and soft tissue ultrasound. Includes 2x2D pregnancy scans." },

  // Pathology
  { ruleId: "GEMS_BERYL_PATHOLOGY", scheme: "GEMS", plan: "Beryl", category: "pathology", description: "Pathology (C9): unlimited, subject to approved services and pre-auth for certain tests", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Specified in GEMS Pathology Clinical Request Form." },

  // Optical — very limited
  { ruleId: "GEMS_BERYL_OPTICAL", scheme: "GEMS", plan: "Beryl", category: "optical", description: "Optical (C10): R1,924/beneficiary per 2 years, GEMS Optical Network required", perBeneficiaryLimit: 1924, networkRequired: true, preAuthRequired: false, severity: "warning", notes: "1 eye exam/12 months. 1 frame (approved list) + single/bifocal lenses or 4 boxes disposable contacts per 24 months. Either spectacles or contacts, not both." },
  { ruleId: "GEMS_BERYL_OPTICAL_CATARACT", scheme: "GEMS", plan: "Beryl", category: "optical", description: "Post-cataract optical PMB: R1,744 for lens+frame, sub-limit R293 for frame", perEventLimitRands: 1744, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Limited to cost of bifocal lens." },

  // Prescribed medication — acute
  { ruleId: "GEMS_BERYL_ACUTE_MED", scheme: "GEMS", plan: "Beryl", category: "medicine_acute", description: "Acute medicine: unlimited, R738/family homeopathic sub-limit. DSP scripts: 3x R253/beneficiary", networkRequired: true, preAuthRequired: false, severity: "info", notes: "DSP/Network pharmacy or dispensing FP. 30% co-pay for out-of-formulary or non-DSP." },
  { ruleId: "GEMS_BERYL_HOMEO", scheme: "GEMS", plan: "Beryl", category: "medicine_acute", description: "Homeopathic medicine: R738/family/year, 30% co-pay for out-of-formulary", annualLimitRands: 738, coPaymentPercent: 30, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Within acute medicine benefit." },

  // OTC
  { ruleId: "GEMS_BERYL_OTC", scheme: "GEMS", plan: "Beryl", category: "medicine_otc", description: "OTC medicine: R334/beneficiary/year, R120/event, schedule 0-2 only", annualLimitRands: 334, perBeneficiaryLimit: 334, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Network Pharmacy or Network FP. 30% co-pay for non-network." },

  // Female contraceptives
  { ruleId: "GEMS_BERYL_CONTRACEPTIVE", scheme: "GEMS", plan: "Beryl", category: "contraceptive", description: "Female contraceptives: R3,757/beneficiary/year", perBeneficiaryLimit: 3757, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Oral, insertables, injectables and dermal." },

  // Non-PMB chronic
  { ruleId: "GEMS_BERYL_CHRONIC_NONPMB", scheme: "GEMS", plan: "Beryl", category: "chronic", description: "Non-PMB chronic conditions: R5,567/beneficiary/year", perBeneficiaryLimit: 5567, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Annexure D conditions only. No benefit for non-PMB conditions not in Annexure D. Unlimited for PMBs once depleted." },
  { ruleId: "GEMS_BERYL_CHRONIC_PMB", scheme: "GEMS", plan: "Beryl", category: "chronic", description: "Chronic PMB/CDL conditions: unlimited, subject to formulary/MPL", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Chronic Medicine Pharmacy DSP. 30% co-pay for non-formulary/non-DSP." },

  // CGM / Insulin pumps
  { ruleId: "GEMS_BERYL_CGM_CONSUMABLES", scheme: "GEMS", plan: "Beryl", category: "chronic", description: "CGM consumables: R28,324/beneficiary/year", perBeneficiaryLimit: 28324, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Type 1 diabetics under 19 only. Devices via C16 appliances." },
  { ruleId: "GEMS_BERYL_CGM_DEVICE", scheme: "GEMS", plan: "Beryl", category: "chronic", description: "CGM/Insulin pump devices: R59,531/family/year (under 19, Type 1 DM only)", annualLimitRands: 59531, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "1 device per beneficiary per 60 months. Via C16 appliances." },

  // Appliances (out-of-hospital)
  { ruleId: "GEMS_BERYL_APPLIANCE", scheme: "GEMS", plan: "Beryl", category: "appliance", description: "Medical & surgical appliances (C16): R14,606/family/year sub-limit, shared with B14", annualLimitRands: 14606, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Within overall hospital limit. Shared sub-limits with B14 prostheses." },
  { ruleId: "GEMS_BERYL_WHEELCHAIR", scheme: "GEMS", plan: "Beryl", category: "appliance", description: "Wheelchair: R7,716/beneficiary per 24 months", perBeneficiaryLimit: 7716, networkRequired: false, preAuthRequired: true, severity: "info", notes: "1 wheelchair per 24 months." },
  { ruleId: "GEMS_BERYL_CRUTCHES", scheme: "GEMS", plan: "Beryl", category: "appliance", description: "Crutches: R701/beneficiary/year", perBeneficiaryLimit: 701, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Annual limit." },
  { ruleId: "GEMS_BERYL_HEARING_AID", scheme: "GEMS", plan: "Beryl", category: "appliance", description: "Hearing aids: R11,223/beneficiary per 36 months (1 bilateral pair)", perBeneficiaryLimit: 11223, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "1 pair every 36 months." },
  { ruleId: "GEMS_BERYL_CPAP", scheme: "GEMS", plan: "Beryl", category: "appliance", description: "CPAP device: R13,328/beneficiary per 36 months", perBeneficiaryLimit: 13328, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "1 device per 36 months." },
  { ruleId: "GEMS_BERYL_COMPRESSION", scheme: "GEMS", plan: "Beryl", category: "appliance", description: "Compression stockings: R584/pair, 3 pairs/beneficiary/year", perEventLimitRands: 584, networkRequired: false, preAuthRequired: false, severity: "info", notes: "3 pairs per beneficiary per annum." },
  { ruleId: "GEMS_BERYL_PULSE_OX", scheme: "GEMS", plan: "Beryl", category: "appliance", description: "Pulse oximeter: R467/family/year", annualLimitRands: 467, networkRequired: false, preAuthRequired: false, severity: "info", notes: "1 per family per annum." },
  { ruleId: "GEMS_BERYL_BRACE", scheme: "GEMS", plan: "Beryl", category: "appliance", description: "Knee/back brace: R3,499/brace/beneficiary/year", perBeneficiaryLimit: 3499, networkRequired: false, preAuthRequired: false, severity: "info", notes: "1 knee and 1 back brace per beneficiary per annum." },

  // Maternity programme
  { ruleId: "GEMS_BERYL_MATERNITY_PROG", scheme: "GEMS", plan: "Beryl", category: "maternity", description: "Maternity programme (C21): paid from Risk, subject to programme registration", networkRequired: false, preAuthRequired: false, severity: "info", notes: "If not registered, C1: Maternity applies." },

  // Infertility
  { ruleId: "GEMS_BERYL_INFERTILITY", scheme: "GEMS", plan: "Beryl", category: "maternity", description: "Infertility (C20): PMB only. Non-DSP/State = R15,000 co-payment on first bill", coPaymentRands: 15000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Must use DSP (State or Network). Non-DSP = R15,000 penalty on first bill." },
];

// ─── GEMS ONYX BENEFIT LIMITS (2025) ────────────────────────────────────────
// Source: GEMS Onyx Annexure C 2025 (64 pages)

export const GEMS_ONYX_LIMITS: BenefitLimitRule[] = [
  // Hospital — unlimited
  { ruleId: "GEMS_ONYX_HOSPITAL", scheme: "GEMS", plan: "Onyx", category: "hospital", description: "Hospital (B1): unlimited at 100% Scheme Rate, pre-auth required 48hrs before", networkRequired: true, preAuthRequired: true, severity: "info", notes: "No overall limit. Includes accommodation, theatre, medicines, materials, neonatal. 130% for Network." },
  { ruleId: "GEMS_ONYX_HOSP_COPAY", scheme: "GEMS", plan: "Onyx", category: "hospital", description: "Hospital no pre-auth penalty: R1,000 co-payment per admission", coPaymentRands: 1000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Emergency: notify within 1 working day. Private ward subject to motivation." },

  // Maternity
  { ruleId: "GEMS_ONYX_MATERNITY", scheme: "GEMS", plan: "Onyx", category: "maternity", description: "Maternity (B2): unlimited, subject to PMB. R1,000 co-pay if no pre-auth.", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Home birth and registered birthing units covered. Includes midwife services." },
  { ruleId: "GEMS_ONYX_MATERNITY_SCAN", scheme: "GEMS", plan: "Onyx", category: "maternity", description: "Maternity ultrasound: 2 x 2D scans per pregnancy. 3D/4D funded up to 2D cost.", visitLimit: 2, networkRequired: false, preAuthRequired: false, severity: "info", notes: "3D/4D substitution allowed but paid at 2D rate only." },

  // GP
  { ruleId: "GEMS_ONYX_GP", scheme: "GEMS", plan: "Onyx", category: "gp_consultation", description: "Family Practitioner (B3): unlimited, 100% (non-network) / 130% (network)", networkRequired: false, preAuthRequired: false, severity: "info", notes: "200% Scheme Rate for managed care procedures in rooms instead of hospital." },

  // Specialist
  { ruleId: "GEMS_ONYX_SPECIALIST", scheme: "GEMS", plan: "Onyx", category: "specialist", description: "Specialist (B4): unlimited, 100% (non-network) / 130% (network)", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Reimbursement according to Scheme-approved tariff file." },

  // Surgery
  { ruleId: "GEMS_ONYX_SURGERY", scheme: "GEMS", plan: "Onyx", category: "hospital", description: "Surgical procedures (B5): unlimited, 100%/200% for managed care in-rooms procedures", networkRequired: false, preAuthRequired: true, severity: "info", notes: "Includes maxillofacial surgery and surgical removal of impacted teeth." },

  // Dentistry in-hospital
  { ruleId: "GEMS_ONYX_DENTAL_HOSP", scheme: "GEMS", plan: "Onyx", category: "dental", description: "Dentistry in-hospital (B6): shared limits with C3 dental. GA only for under 6 or severe trauma.", networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Conservative, restorative and specialised. Implant crowns, bridges, dentures subject to pre-auth." },

  // Advanced radiology
  { ruleId: "GEMS_ONYX_ADV_RADIOLOGY", scheme: "GEMS", plan: "Onyx", category: "radiology", description: "Advanced radiology (B8/C5): R37,123/family/year shared in/out hospital", annualLimitRands: 37123, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Highest GEMS option. Angiography, CT, Coronary Angiography, MDCT, MRI, MUGA, PET, Radio-isotope studies." },

  // Pathology
  { ruleId: "GEMS_ONYX_PATHOLOGY", scheme: "GEMS", plan: "Onyx", category: "pathology", description: "Pathology (B9): unlimited, subject to managed care protocols", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Tests must be related to admission diagnosis." },

  // Physiotherapy in-hospital
  { ruleId: "GEMS_ONYX_PHYSIO_HOSP", scheme: "GEMS", plan: "Onyx", category: "physiotherapy", description: "Physiotherapy in-hospital (B11): R6,673/beneficiary/year", perBeneficiaryLimit: 6673, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Subject to pre-auth and services related to admission diagnosis." },

  // Post-surgery physio
  { ruleId: "GEMS_ONYX_POST_SURG_PHYSIO", scheme: "GEMS", plan: "Onyx", category: "physiotherapy", description: "Post hip/knee/shoulder replacement physio (B12/C1.9): R7,044/beneficiary/event, 10 visits", perBeneficiaryLimit: 7044, visitLimit: 10, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Shared between B12 and C1.9. Within 60 days of surgery." },

  // Organ transplant
  { ruleId: "GEMS_ONYX_TRANSPLANT", scheme: "GEMS", plan: "Onyx", category: "organ_transplant", description: "Organ/tissue transplant (B13): R824,901/beneficiary/year", perBeneficiaryLimit: 824901, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Sub-limit R28,001 for corneal grafts. Includes materials and immunosuppressants. Organ harvesting limited to RSA except cornea." },

  // Prosthesis
  { ruleId: "GEMS_ONYX_PROSTHESIS", scheme: "GEMS", plan: "Onyx", category: "prosthesis", description: "Internal prosthesis (B14): R75,823/family/year shared with C7 appliances", annualLimitRands: 75823, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Highest GEMS option. Plus R75,823/family for joint revisions only. Once depleted, unlimited for PMBs." },
  { ruleId: "GEMS_ONYX_PROSTH_JOINT_REV", scheme: "GEMS", plan: "Onyx", category: "prosthesis", description: "Joint revisions prosthesis: additional R75,823/family/year", annualLimitRands: 75823, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Additional limit for joint revisions only." },
  { ruleId: "GEMS_ONYX_PROSTH_FOOT", scheme: "GEMS", plan: "Onyx", category: "prosthesis", description: "Foot orthotics/prosthetics sub-limit: R6,164/beneficiary/year", perBeneficiaryLimit: 6164, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Sub-limit R1,761/beneficiary for orthotic shoes, inserts, levelers." },

  // Emergency
  { ruleId: "GEMS_ONYX_EMERGENCY", scheme: "GEMS", plan: "Onyx", category: "hospital", description: "Emergency/casualty (B15): PMB only, cost defrayed from C1.1 GP Services for non-PMB", networkRequired: true, preAuthRequired: false, severity: "warning", notes: "Use facility as per B1. Non-PMB/unauthorised defrayed from GP benefit." },

  // Renal dialysis
  { ruleId: "GEMS_ONYX_RENAL", scheme: "GEMS", plan: "Onyx", category: "renal", description: "Renal dialysis (B16): R353,521/beneficiary/year for chronic dialysis", perBeneficiaryLimit: 353521, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Acute dialysis included in B1. Erythropoietin in B10 Blood Services. Unlimited for PMBs once depleted." },

  // Oncology
  { ruleId: "GEMS_ONYX_ONCOLOGY", scheme: "GEMS", plan: "Onyx", category: "oncology", description: "Oncology chemo/radiotherapy (B17): R649,619/family/year", annualLimitRands: 649619, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Highest GEMS option. Sub-limit R439,078 for biological and specialised medicines." },
  { ruleId: "GEMS_ONYX_ONCOLOGY_BIO", scheme: "GEMS", plan: "Onyx", category: "oncology", description: "Oncology biological/specialised medicine sub-limit: R439,078/family/year", annualLimitRands: 439078, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Within overall oncology limit. Subject to Medicine Price List (MPL)." },

  // Mental health
  { ruleId: "GEMS_ONYX_MENTAL", scheme: "GEMS", plan: "Onyx", category: "mental_health", description: "Mental health (B18/C1.10): R51,966/family/year shared in/out hospital", annualLimitRands: 51966, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Highest GEMS option. R2,879/family for Educational/Industrial Psychologists. Max 3 days FP hospitalisation." },

  // Allied health — within Block Benefit
  { ruleId: "GEMS_ONYX_ALLIED", scheme: "GEMS", plan: "Onyx", category: "allied_health", description: "Allied health (B22/C1.6): within Day-to-Day Block Benefit", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Chiropractors, Homeopaths, Phytotherapists, Acupuncturists, Chinese Medicine Practitioners. In-hospital from B1." },
  { ruleId: "GEMS_ONYX_OTHER_PROF", scheme: "GEMS", plan: "Onyx", category: "allied_health", description: "Other professional health (B23/C1.7): sub-limit R1,652/family for Social Workers/Counsellors", annualLimitRands: 1652, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Dieticians, Podiatrists, Social Workers, Registered Counsellors, Orthoptists." },

  // Alternatives to hospitalisation
  { ruleId: "GEMS_ONYX_ALT_HOSP", scheme: "GEMS", plan: "Onyx", category: "hospital", description: "Alternatives to hospitalisation (B19): unlimited, subject to PMB", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Sub-acute hospitals, physical rehab, private nursing, hospice. Excludes frail care and recuperative holidays." },

  // Out-of-hospital: Day-to-Day Block
  { ruleId: "GEMS_ONYX_BLOCK", scheme: "GEMS", plan: "Onyx", category: "day_to_day", description: "Day-to-Day Block Benefit (C1): R25,973/family, R12,986/beneficiary/year", annualLimitRands: 25973, perBeneficiaryLimit: 12986, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Shared between C1.1-C1.12: GP, specialist, basic radiology, pathology, allied, physio, audiology/OT/speech, mental health, maternity, contraceptives. Pro-rated." },

  // GP Network Extender
  { ruleId: "GEMS_ONYX_GP_EXTENDER", scheme: "GEMS", plan: "Onyx", category: "gp_consultation", description: "GP Network Extender (C1.2): 1 additional consultation at network per chronic condition", visitLimit: 1, networkRequired: true, preAuthRequired: true, severity: "info", notes: "Paid from Risk. For chronic conditions registered on Disease Management Programme." },

  // Female Contraceptives sub-limit
  { ruleId: "GEMS_ONYX_CONTRACEPTIVE", scheme: "GEMS", plan: "Onyx", category: "contraceptive", description: "Female contraceptives (C1.12): R4,707/family/year within Block Benefit", annualLimitRands: 4707, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Oral, insertables, injectables and dermal." },

  // Dental out-of-hospital
  { ruleId: "GEMS_ONYX_DENTAL_OOH", scheme: "GEMS", plan: "Onyx", category: "dental", description: "Dental (C3): R12,310/beneficiary/year for conservative, restorative, specialised", perBeneficiaryLimit: 12310, networkRequired: false, preAuthRequired: false, severity: "warning", notes: "Highest GEMS option. Panoramic X-ray: 1 per 3 years. Bitewing: 6 per year. Periapical: 10 per year. CBCT: 1 per lifetime." },

  // Dental sealants
  { ruleId: "GEMS_ONYX_DENTAL_SEALANT", scheme: "GEMS", plan: "Onyx", category: "dental", description: "Dental sealants/polishing: under 18 only, network provider required", networkRequired: true, preAuthRequired: false, severity: "info", notes: "Dental polishing: ages 3-9. Under Preventive Care Services C10." },

  // Optical
  { ruleId: "GEMS_ONYX_OPTICAL", scheme: "GEMS", plan: "Onyx", category: "optical", description: "Optical (C6): R7,033/family/year, R3,659/beneficiary per 2 years, frames max R2,645", annualLimitRands: 7033, perBeneficiaryLimit: 3659, networkRequired: false, preAuthRequired: false, severity: "warning", notes: "Highest GEMS option. 1 eye exam/year. 1 frame + lenses per 24 months. Keratoconus booster R2,751/family." },
  { ruleId: "GEMS_ONYX_OPTICAL_CATARACT", scheme: "GEMS", plan: "Onyx", category: "optical", description: "Post-cataract optical PMB: R1,744 for lens+frame, sub-limit R293 for frame", perEventLimitRands: 1744, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Limited to cost of bifocal lens." },

  // Prescribed medication — acute
  { ruleId: "GEMS_ONYX_ACUTE_MED", scheme: "GEMS", plan: "Onyx", category: "medicine_acute", description: "Acute medicine (C4.1): R23,368/family, R8,343/beneficiary/year", annualLimitRands: 23368, perBeneficiaryLimit: 8343, networkRequired: false, preAuthRequired: false, severity: "warning", notes: "30% co-pay for out-of-formulary. Includes maternity vitamin supplements." },
  { ruleId: "GEMS_ONYX_HOMEO", scheme: "GEMS", plan: "Onyx", category: "medicine_acute", description: "Homeopathic medicine: R738/family/year, 30% co-pay for out-of-formulary", annualLimitRands: 738, coPaymentPercent: 30, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Within acute medicine limit." },

  // OTC
  { ruleId: "GEMS_ONYX_OTC", scheme: "GEMS", plan: "Onyx", category: "medicine_otc", description: "OTC medicine: R2,519/family, R1,521/beneficiary/year, R415/event", annualLimitRands: 2519, perBeneficiaryLimit: 1521, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Schedule 0, 1 and 2 only. Within acute medicine limit." },

  // TTO
  { ruleId: "GEMS_ONYX_TTO", scheme: "GEMS", plan: "Onyx", category: "medicine_acute", description: "Prescribed medication from hospital stay (TTO): shared with acute, 7 days limit", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Payable from Risk once acute limit exhausted. TTO limited to 7 days." },

  // Non-PMB chronic
  { ruleId: "GEMS_ONYX_CHRONIC_NONPMB", scheme: "GEMS", plan: "Onyx", category: "chronic", description: "Non-PMB chronic conditions: R51,966/family, R25,353/beneficiary/year", annualLimitRands: 51966, perBeneficiaryLimit: 25353, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Highest GEMS option. Annexure D conditions. No benefit for non-PMB conditions not in Annexure D. Unlimited for PMBs once depleted." },
  { ruleId: "GEMS_ONYX_CHRONIC_PMB", scheme: "GEMS", plan: "Onyx", category: "chronic", description: "Chronic PMB/CDL conditions: unlimited, subject to formulary/MPL", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Prior application and approval required. Chronic Medicine Pharmacy DSP. 30% co-pay for non-formulary/non-DSP." },

  // CGM / Insulin pumps
  { ruleId: "GEMS_ONYX_CGM_CONSUMABLES", scheme: "GEMS", plan: "Onyx", category: "chronic", description: "CGM consumables: R28,324/beneficiary/year", perBeneficiaryLimit: 28324, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Type 1 diabetics under 19 only. Devices via C7 appliances." },
  { ruleId: "GEMS_ONYX_CGM_DEVICE", scheme: "GEMS", plan: "Onyx", category: "chronic", description: "CGM/Insulin pump devices: R59,531/family/year (under 19, Type 1 DM only)", annualLimitRands: 59531, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "1 device per beneficiary per 60 months. Via C7 appliances." },

  // Appliances (out-of-hospital)
  { ruleId: "GEMS_ONYX_APPLIANCE", scheme: "GEMS", plan: "Onyx", category: "appliance", description: "Medical & surgical appliances (C7): R25,349/family/year sub-limit, shared with B14 R75,823", annualLimitRands: 25349, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "C7 sub-limit within shared B14 prosthesis limit of R75,823/family." },
  { ruleId: "GEMS_ONYX_WHEELCHAIR", scheme: "GEMS", plan: "Onyx", category: "appliance", description: "Wheelchair: R7,716/beneficiary per 24 months", perBeneficiaryLimit: 7716, networkRequired: false, preAuthRequired: true, severity: "info", notes: "1 wheelchair per 24 months." },
  { ruleId: "GEMS_ONYX_CRUTCHES", scheme: "GEMS", plan: "Onyx", category: "appliance", description: "Crutches: R701/beneficiary/year", perBeneficiaryLimit: 701, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Annual limit." },
  { ruleId: "GEMS_ONYX_HEARING_AID", scheme: "GEMS", plan: "Onyx", category: "appliance", description: "Hearing aids: R11,223/beneficiary per 36 months (1 bilateral pair)", perBeneficiaryLimit: 11223, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "1 pair every 36 months." },
  { ruleId: "GEMS_ONYX_CPAP", scheme: "GEMS", plan: "Onyx", category: "appliance", description: "CPAP device: R13,328/beneficiary per 36 months", perBeneficiaryLimit: 13328, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "1 device per 36 months." },
  { ruleId: "GEMS_ONYX_COMPRESSION", scheme: "GEMS", plan: "Onyx", category: "appliance", description: "Compression stockings: R584/pair, 3 pairs/beneficiary/year", perEventLimitRands: 584, networkRequired: false, preAuthRequired: false, severity: "info", notes: "3 pairs per beneficiary per annum." },
  { ruleId: "GEMS_ONYX_PULSE_OX", scheme: "GEMS", plan: "Onyx", category: "appliance", description: "Pulse oximeter: R467/family/year", annualLimitRands: 467, networkRequired: false, preAuthRequired: false, severity: "info", notes: "1 per family per annum." },
  { ruleId: "GEMS_ONYX_BRACE", scheme: "GEMS", plan: "Onyx", category: "appliance", description: "Knee/back brace: R3,499/brace/beneficiary/year", perBeneficiaryLimit: 3499, networkRequired: false, preAuthRequired: false, severity: "info", notes: "1 knee and 1 back brace per beneficiary per annum." },

  // Renal out-of-hospital
  { ruleId: "GEMS_ONYX_RENAL_OOH", scheme: "GEMS", plan: "Onyx", category: "renal", description: "Renal dialysis out-of-hospital (C8): PMB only, 30% co-pay if non-DSP", coPaymentPercent: 30, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Must use Renal Dialysis Network DSP. Includes materials and pathology tests." },

  // Screening/preventive
  { ruleId: "GEMS_ONYX_SCREENING", scheme: "GEMS", plan: "Onyx", category: "gp_consultation", description: "Screening services (C9): 1 per year each (cholesterol, bone density, PSA, mammogram, etc.)", visitLimit: 1, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Paid from Risk. HPV vaccination: 1 course per female beneficiary lifetime." },
  { ruleId: "GEMS_ONYX_VACCINATION", scheme: "GEMS", plan: "Onyx", category: "gp_consultation", description: "Other vaccinations: R950/beneficiary/year", perBeneficiaryLimit: 950, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Annual vaccination benefit." },

  // Circumcision
  { ruleId: "GEMS_ONYX_CIRCUMCISION", scheme: "GEMS", plan: "Onyx", category: "hospital", description: "Circumcision (C14): R1,994/beneficiary/year global fee", perBeneficiaryLimit: 1994, networkRequired: false, preAuthRequired: true, severity: "info", notes: "All related costs including consultations, medication, post-op care within 1 month." },

  // Maternity programme
  { ruleId: "GEMS_ONYX_MATERNITY_PROG", scheme: "GEMS", plan: "Onyx", category: "maternity", description: "Maternity programme (C2): paid from Risk, subject to programme registration", networkRequired: false, preAuthRequired: false, severity: "info", notes: "If not registered, C1.11 Maternity applies. 2x2D ultrasounds per pregnancy." },

  // Infertility
  { ruleId: "GEMS_ONYX_INFERTILITY", scheme: "GEMS", plan: "Onyx", category: "maternity", description: "Infertility (C12): PMB only. Non-DSP/State = R15,000 co-payment on first bill", coPaymentRands: 15000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Must use DSP (State or Network). Non-DSP = R15,000 penalty on first bill." },
];

// ─── MOMENTUM HEALTH BENEFIT LIMITS (2026 Brochure) ─────────────────────────
// Source: Momentum 2026 Benefits Brochure (23 pages)
// Plans: Ingwe, Evolve, Custom, Incentive, Extender, Summit

export const MOMENTUM_LIMITS: BenefitLimitRule[] = [
  // ── INGWE OPTION ──
  // Hospital
  { ruleId: "MH_INGWE_HOSPITAL", scheme: "MH", plan: "Ingwe", category: "hospital", description: "Hospital: unlimited at negotiated rate, Connect/Ingwe/Any network", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Connect Network, Ingwe Network, or Any hospital. 30% co-payment if not using chosen network." },
  { ruleId: "MH_INGWE_ICU", scheme: "MH", plan: "Ingwe", category: "hospital", description: "High/intensive care: 10 days per admission", daysLimit: 10, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "10 days ICU limit per admission." },
  { ruleId: "MH_INGWE_APPLIANCE_HOSP", scheme: "MH", plan: "Ingwe", category: "appliance", description: "Appliances in-hospital: R7,000/family", annualLimitRands: 7000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Support stockings, knee/back braces etc." },
  { ruleId: "MH_INGWE_REHAB", scheme: "MH", plan: "Ingwe", category: "hospital", description: "Rehabilitation/step-down: R17,500/beneficiary", perBeneficiaryLimit: 17500, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Combined limit for medical rehab, step-down. Private nursing/hospice not covered." },
  { ruleId: "MH_INGWE_HIV", scheme: "MH", plan: "Ingwe", category: "hospital", description: "HIV hospital (preferred provider): R42,300/family; other: R42,800/family", annualLimitRands: 42300, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "R42,800 at chosen hospital provider." },
  { ruleId: "MH_INGWE_SPECIALIST_OOH", scheme: "MH", plan: "Ingwe", category: "specialist", description: "Specialist OOH: 2 visits/family, R1,425/visit, max R2,850/family", annualLimitRands: 2850, visitLimit: 2, visitPeriodMonths: 12, perEventLimitRands: 1425, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Subject to referral and pre-auth." },
  { ruleId: "MH_INGWE_MENTAL_HEALTH", scheme: "MH", plan: "Ingwe", category: "mental_health", description: "Mental health: PMB only at State facilities", networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Ingwe: mental health limited to PMB at State." },
  { ruleId: "MH_INGWE_ONCOLOGY", scheme: "MH", plan: "Ingwe", category: "oncology", description: "Oncology: PMB only at State/Connect Network", networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Connect Network: PMB at Connect hospitals. Ingwe/Any: PMB at State." },
  { ruleId: "MH_INGWE_PROSTHESIS_INT", scheme: "MH", plan: "Ingwe", category: "prosthesis", description: "Internal prosthesis: PMB only at State", networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Limited to PMB at State facilities." },
  { ruleId: "MH_INGWE_RENAL", scheme: "MH", plan: "Ingwe", category: "renal", description: "Renal dialysis: PMB only at State facilities", networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Limited to PMB at State." },
  { ruleId: "MH_INGWE_DENTAL_BASIC", scheme: "MH", plan: "Ingwe", category: "dental", description: "Basic dentistry: fillings, extractions per network. 1 consultation/year/beneficiary", visitLimit: 1, visitPeriodMonths: 12, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Pre-auth required if >4 fillings or >4 extractions." },
  { ruleId: "MH_INGWE_OPTICAL", scheme: "MH", plan: "Ingwe", category: "optical", description: "Optical: 1 eye test + 1 pair standard lenses + frame per beneficiary every 2 years", networkRequired: true, preAuthRequired: false, severity: "info", notes: "Refraction must be >0.5. As per formulary." },

  // ── EVOLVE OPTION ──
  { ruleId: "MH_EVOLVE_HOSPITAL", scheme: "MH", plan: "Evolve", category: "hospital", description: "Hospital: unlimited at Evolve Network. R2,000 co-payment per authorisation", coPaymentRands: 2000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "30% co-payment for non-Evolve Network hospitals. Co-payment waived for MVA, maternity, emergencies." },
  { ruleId: "MH_EVOLVE_ONCOLOGY", scheme: "MH", plan: "Evolve", category: "oncology", description: "Oncology: R200,000/beneficiary/year, then 20% co-payment", annualLimitRands: 200000, coPaymentPercent: 20, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Evolve Network oncologists. Reference pricing on chemo." },
  { ruleId: "MH_EVOLVE_PROSTHESIS_IOL", scheme: "MH", plan: "Evolve", category: "prosthesis", description: "Intraocular lenses: R6,600/beneficiary/event, max 2 events/year", perEventLimitRands: 6600, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Maximum 2 events per year." },
  { ruleId: "MH_EVOLVE_PROSTHESIS_INT", scheme: "MH", plan: "Evolve", category: "prosthesis", description: "Other internal prostheses: R43,900/beneficiary/event, max 2 events/year", perEventLimitRands: 43900, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Joint replacements limited to PMB at State." },
  { ruleId: "MH_EVOLVE_PROSTHESIS_EXT", scheme: "MH", plan: "Evolve", category: "prosthesis", description: "External prosthesis: R28,200/family", annualLimitRands: 28200, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Artificial arms/legs etc." },
  { ruleId: "MH_EVOLVE_APPLIANCE_HOSP", scheme: "MH", plan: "Evolve", category: "appliance", description: "Appliances in-hospital: R7,850/family", annualLimitRands: 7850, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Support stockings, knee/back braces etc." },
  { ruleId: "MH_EVOLVE_MRI_CT", scheme: "MH", plan: "Evolve", category: "radiology", description: "MRI/CT scans: unlimited, R3,850 co-payment per scan", coPaymentRands: 3850, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "In- and out-of-hospital." },
  { ruleId: "MH_EVOLVE_REHAB", scheme: "MH", plan: "Evolve", category: "hospital", description: "Rehab/nursing/hospice/step-down: R61,000/family", annualLimitRands: 61000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Combined limit, subject to case management." },
  { ruleId: "MH_EVOLVE_HIV", scheme: "MH", plan: "Evolve", category: "hospital", description: "HIV hospital: unlimited at preferred, R50,500/family at Evolve Network", annualLimitRands: 50500, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "No limit at preferred provider." },
  { ruleId: "MH_EVOLVE_TRAVEL", scheme: "MH", plan: "Evolve", category: "hospital", description: "International travel: R5,000,000/beneficiary/90-day journey", annualLimitRands: 5000000, coPaymentRands: 2280, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Includes R15,500 emergency optometry, R15,500 emergency dentistry, R765,000 terrorism." },
  { ruleId: "MH_EVOLVE_SPORTS_INJURY", scheme: "MH", plan: "Evolve", category: "physiotherapy", description: "Sports injury: 2 physio/biokineticist sessions/beneficiary, R1,200/year", annualLimitRands: 1200, visitLimit: 2, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Per beneficiary per year." },

  // ── CUSTOM OPTION ──
  { ruleId: "MH_CUSTOM_HOSPITAL", scheme: "MH", plan: "Custom", category: "hospital", description: "Hospital: unlimited, Any or Associated. R2,000 co-payment per authorisation", coPaymentRands: 2000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "30% co-payment for non-Associated hospital if Associated chosen." },
  { ruleId: "MH_CUSTOM_ONCOLOGY", scheme: "MH", plan: "Custom", category: "oncology", description: "Oncology: R300,000/beneficiary/year, then 20% co-payment", annualLimitRands: 300000, coPaymentPercent: 20, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Reference pricing on chemo. State if chronic provider is State." },
  { ruleId: "MH_CUSTOM_PROSTHESIS_IOL", scheme: "MH", plan: "Custom", category: "prosthesis", description: "Intraocular lenses: R7,200/beneficiary/event, max 2 events/year", perEventLimitRands: 7200, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Max 2 events per year." },
  { ruleId: "MH_CUSTOM_PROSTHESIS_INT", scheme: "MH", plan: "Custom", category: "prosthesis", description: "Other internal prostheses: R62,000/beneficiary/event, max 2 events/year", perEventLimitRands: 62000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Max 2 events per year." },
  { ruleId: "MH_CUSTOM_PROSTHESIS_EXT", scheme: "MH", plan: "Custom", category: "prosthesis", description: "External prosthesis: R29,300/family", annualLimitRands: 29300, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Artificial arms/legs." },
  { ruleId: "MH_CUSTOM_APPLIANCE_HOSP", scheme: "MH", plan: "Custom", category: "appliance", description: "Appliances in-hospital: R8,400/family", annualLimitRands: 8400, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Support stockings, knee/back braces." },
  { ruleId: "MH_CUSTOM_MRI_CT", scheme: "MH", plan: "Custom", category: "radiology", description: "MRI/CT scans: unlimited, R3,850 co-payment per scan", coPaymentRands: 3850, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "In- and out-of-hospital." },
  { ruleId: "MH_CUSTOM_MENTAL_HEALTH", scheme: "MH", plan: "Custom", category: "mental_health", description: "Mental health: R47,300/beneficiary", perBeneficiaryLimit: 47300, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Includes psychiatry, psychology, drug/alcohol rehab." },
  { ruleId: "MH_CUSTOM_REHAB", scheme: "MH", plan: "Custom", category: "hospital", description: "Rehab/nursing/hospice/step-down: R67,000/family", annualLimitRands: 67000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Combined limit." },
  { ruleId: "MH_CUSTOM_HIV", scheme: "MH", plan: "Custom", category: "hospital", description: "HIV hospital: unlimited at preferred, R89,500/family at chosen hospital", annualLimitRands: 89500, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "No limit at preferred provider." },
  { ruleId: "MH_CUSTOM_DONOR", scheme: "MH", plan: "Custom", category: "organ_transplant", description: "Organ transplant donor: R26,000 cadaver, R53,000 live donor", perEventLimitRands: 53000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "R26,000 cadaver costs. R53,000 live donor incl. transport." },
  { ruleId: "MH_CUSTOM_DENTAL_WISDOM", scheme: "MH", plan: "Custom", category: "dental", description: "Wisdom teeth extraction: R3,600 co-pay (day hospital), R6,800 (other)", coPaymentRands: 3600, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "R6,800 co-payment at non-day hospital." },
  { ruleId: "MH_CUSTOM_TRAVEL", scheme: "MH", plan: "Custom", category: "hospital", description: "International travel: R7,660,000/beneficiary/90-day journey", annualLimitRands: 7660000, coPaymentRands: 2280, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Includes R15,500 emergency optometry/dentistry, R765,000 terrorism." },

  // ── INCENTIVE OPTION ──
  { ruleId: "MH_INCENTIVE_HOSPITAL", scheme: "MH", plan: "Incentive", category: "hospital", description: "Hospital: unlimited, Any or Associated, specialists up to 200% Scheme Rate", networkRequired: true, preAuthRequired: true, severity: "info", notes: "No overall annual limit. Co-payments may apply for specialised procedures." },
  { ruleId: "MH_INCENTIVE_ONCOLOGY", scheme: "MH", plan: "Incentive", category: "oncology", description: "Oncology: R400,000/beneficiary/year, then 20% co-payment", annualLimitRands: 400000, coPaymentPercent: 20, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Reference pricing on chemo." },
  { ruleId: "MH_INCENTIVE_COCHLEAR", scheme: "MH", plan: "Incentive", category: "prosthesis", description: "Cochlear implants: R223,600/beneficiary, max 1 event/year", perBeneficiaryLimit: 223600, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Max 1 event per year." },
  { ruleId: "MH_INCENTIVE_PROSTHESIS_IOL", scheme: "MH", plan: "Incentive", category: "prosthesis", description: "Intraocular lenses: R8,900/beneficiary/event, max 2 events/year", perEventLimitRands: 8900, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Max 2 events per year." },
  { ruleId: "MH_INCENTIVE_PROSTHESIS_INT", scheme: "MH", plan: "Incentive", category: "prosthesis", description: "Other internal prostheses: R67,000/beneficiary/event, max 2 events/year", perEventLimitRands: 67000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Max 2 events per year." },
  { ruleId: "MH_INCENTIVE_PROSTHESIS_EXT", scheme: "MH", plan: "Incentive", category: "prosthesis", description: "External prosthesis: R30,700/family", annualLimitRands: 30700, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Artificial arms/legs." },
  { ruleId: "MH_INCENTIVE_APPLIANCE_HOSP", scheme: "MH", plan: "Incentive", category: "appliance", description: "Appliances in-hospital: R8,800/family", annualLimitRands: 8800, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Support stockings, knee/back braces." },
  { ruleId: "MH_INCENTIVE_MRI_CT", scheme: "MH", plan: "Incentive", category: "radiology", description: "MRI/CT scans: unlimited, R3,500 co-payment per scan", coPaymentRands: 3500, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "In- and out-of-hospital." },
  { ruleId: "MH_INCENTIVE_MENTAL_HEALTH", scheme: "MH", plan: "Incentive", category: "mental_health", description: "Mental health: R50,600/beneficiary", perBeneficiaryLimit: 50600, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Includes psychiatry, psychology, drug/alcohol rehab." },
  { ruleId: "MH_INCENTIVE_REHAB", scheme: "MH", plan: "Incentive", category: "hospital", description: "Rehab/nursing/hospice/step-down: R70,000/family", annualLimitRands: 70000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Combined limit." },
  { ruleId: "MH_INCENTIVE_HIV", scheme: "MH", plan: "Incentive", category: "hospital", description: "HIV hospital: unlimited at preferred, R96,800/family at chosen hospital", annualLimitRands: 96800, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "No limit at preferred provider." },
  { ruleId: "MH_INCENTIVE_DONOR", scheme: "MH", plan: "Incentive", category: "organ_transplant", description: "Organ transplant donor: R28,700 cadaver, R59,000 live donor", perEventLimitRands: 59000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "R28,700 cadaver, R59,000 live donor incl. transport." },
  { ruleId: "MH_INCENTIVE_CHRONIC_EXTRA", scheme: "MH", plan: "Incentive", category: "chronic", description: "Non-CDL chronic (6 additional conditions): R13,700/family", annualLimitRands: 13700, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "26 CDL conditions unlimited. 6 additional conditions limited." },
  { ruleId: "MH_INCENTIVE_SAVINGS", scheme: "MH", plan: "Incentive", category: "savings", description: "Savings: 10% of total contribution", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Fixed at 10% of contribution." },
  { ruleId: "MH_INCENTIVE_DENTAL_WISDOM", scheme: "MH", plan: "Incentive", category: "dental", description: "Wisdom teeth extraction: R3,600 co-pay (day hospital), R6,800 (other)", coPaymentRands: 3600, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "R1,820 co-payment for maxillo-facial/GA for children <7." },
  { ruleId: "MH_INCENTIVE_TRAVEL", scheme: "MH", plan: "Incentive", category: "hospital", description: "International travel: R8,000,000/beneficiary/90-day journey", annualLimitRands: 8000000, coPaymentRands: 2280, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Includes R15,500 emergency optometry/dentistry, R765,000 terrorism." },

  // ── EXTENDER OPTION ──
  { ruleId: "MH_EXTENDER_HOSPITAL", scheme: "MH", plan: "Extender", category: "hospital", description: "Hospital: unlimited, Any or Associated, specialists up to 200% Scheme Rate", networkRequired: true, preAuthRequired: true, severity: "info", notes: "No overall annual limit." },
  { ruleId: "MH_EXTENDER_ONCOLOGY", scheme: "MH", plan: "Extender", category: "oncology", description: "Oncology: R500,000/beneficiary/year, then 20% co-payment", annualLimitRands: 500000, coPaymentPercent: 20, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Reference pricing on chemo." },
  { ruleId: "MH_EXTENDER_COCHLEAR", scheme: "MH", plan: "Extender", category: "prosthesis", description: "Cochlear implants: R245,000/beneficiary, max 1 event/year", perBeneficiaryLimit: 245000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Max 1 event per year." },
  { ruleId: "MH_EXTENDER_PROSTHESIS_IOL", scheme: "MH", plan: "Extender", category: "prosthesis", description: "Intraocular lenses: R9,540/beneficiary/event, max 2 events/year", perEventLimitRands: 9540, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Max 2 events per year." },
  { ruleId: "MH_EXTENDER_PROSTHESIS_INT", scheme: "MH", plan: "Extender", category: "prosthesis", description: "Other internal prostheses: R92,200/beneficiary/event, max 2 events/year", perEventLimitRands: 92200, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Max 2 events per year." },
  { ruleId: "MH_EXTENDER_PROSTHESIS_EXT", scheme: "MH", plan: "Extender", category: "prosthesis", description: "External prosthesis: R32,000/family", annualLimitRands: 32000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Artificial arms/legs." },
  { ruleId: "MH_EXTENDER_APPLIANCE_HOSP", scheme: "MH", plan: "Extender", category: "appliance", description: "Appliances in-hospital: R9,230/family", annualLimitRands: 9230, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Support stockings, knee/back braces." },
  { ruleId: "MH_EXTENDER_MRI_CT", scheme: "MH", plan: "Extender", category: "radiology", description: "MRI/CT scans: unlimited, R3,500 co-payment per scan", coPaymentRands: 3500, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "In- and out-of-hospital." },
  { ruleId: "MH_EXTENDER_MENTAL_HEALTH", scheme: "MH", plan: "Extender", category: "mental_health", description: "Mental health: R50,600/beneficiary", perBeneficiaryLimit: 50600, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Includes psychiatry, psychology, drug/alcohol rehab." },
  { ruleId: "MH_EXTENDER_MENTAL_OOH", scheme: "MH", plan: "Extender", category: "mental_health", description: "Mental health OOH: R26,300/family", annualLimitRands: 26300, networkRequired: false, preAuthRequired: false, severity: "warning", notes: "Out-of-hospital psychology/psychiatry." },
  { ruleId: "MH_EXTENDER_REHAB", scheme: "MH", plan: "Extender", category: "hospital", description: "Rehab/nursing/hospice/step-down: R75,000/family", annualLimitRands: 75000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Combined limit." },
  { ruleId: "MH_EXTENDER_HIV", scheme: "MH", plan: "Extender", category: "hospital", description: "HIV hospital: unlimited at preferred, R96,800/family at chosen hospital", annualLimitRands: 96800, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "No limit at preferred provider." },
  { ruleId: "MH_EXTENDER_DONOR", scheme: "MH", plan: "Extender", category: "organ_transplant", description: "Organ transplant donor: R28,700 cadaver, R59,000 live donor", perEventLimitRands: 59000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "R28,700 cadaver, R59,000 live donor incl. transport." },
  { ruleId: "MH_EXTENDER_CHRONIC_EXTRA", scheme: "MH", plan: "Extender", category: "chronic", description: "Non-CDL chronic (36 additional conditions): R13,700/family", annualLimitRands: 13700, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "26 CDL conditions unlimited. 36 additional limited." },
  { ruleId: "MH_EXTENDER_SAVINGS", scheme: "MH", plan: "Extender", category: "savings", description: "Savings: 25% of total contribution. Threshold: M=R36,900, A=R32,000, C=R10,600", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Extended Cover activates after Threshold reached." },
  { ruleId: "MH_EXTENDER_DENTAL_SPEC", scheme: "MH", plan: "Extender", category: "dental", description: "Specialised dentistry: R18,100/beneficiary, R46,900/family", annualLimitRands: 46900, perBeneficiaryLimit: 18100, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "In- and out-of-hospital dental specialist accounts." },
  { ruleId: "MH_EXTENDER_APPLIANCE_OOH", scheme: "MH", plan: "Extender", category: "appliance", description: "Appliances OOH: R32,600/family, hearing aids sub-limit R9,840", annualLimitRands: 32600, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "R9,840 sub-limit for hearing aids." },
  { ruleId: "MH_EXTENDER_OPTICAL", scheme: "MH", plan: "Extender", category: "optical", description: "Optical: R5,500/beneficiary overall, frame sub-limit R3,000", perBeneficiaryLimit: 5500, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Frame sub-limit R3,000." },
  { ruleId: "MH_EXTENDER_MEDICINE_ACUTE", scheme: "MH", plan: "Extender", category: "medicine_acute", description: "Prescribed medicine: R23,200/beneficiary, R44,000/family", annualLimitRands: 44000, perBeneficiaryLimit: 23200, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Subject to Savings/Extended Cover provisions." },
  { ruleId: "MH_EXTENDER_TRAVEL", scheme: "MH", plan: "Extender", category: "hospital", description: "International travel: R8,220,000/beneficiary/90-day journey", annualLimitRands: 8220000, coPaymentRands: 2280, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Includes R15,500 emergency optometry/dentistry, R765,000 terrorism." },

  // ── SUMMIT OPTION ──
  { ruleId: "MH_SUMMIT_HOSPITAL", scheme: "MH", plan: "Summit", category: "hospital", description: "Hospital: unlimited at any hospital, specialists up to 300% Scheme Rate", networkRequired: false, preAuthRequired: true, severity: "info", notes: "No overall annual limit. Any hospital." },
  { ruleId: "MH_SUMMIT_ONCOLOGY", scheme: "MH", plan: "Summit", category: "oncology", description: "Oncology: unlimited. Reference pricing on chemo", networkRequired: true, preAuthRequired: true, severity: "info", notes: "No annual limit. Reference pricing on chemo and adjuvant medication." },
  { ruleId: "MH_SUMMIT_COCHLEAR", scheme: "MH", plan: "Summit", category: "prosthesis", description: "Cochlear implants: R245,000/beneficiary, max 1 event/year", perBeneficiaryLimit: 245000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Max 1 event per year." },
  { ruleId: "MH_SUMMIT_PROSTHESIS_IOL", scheme: "MH", plan: "Summit", category: "prosthesis", description: "Intraocular lenses: R9,540/beneficiary/event, max 2 events/year", perEventLimitRands: 9540, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Max 2 events per year." },
  { ruleId: "MH_SUMMIT_PROSTHESIS_INT", scheme: "MH", plan: "Summit", category: "prosthesis", description: "Other internal prostheses: R92,200/beneficiary/event, max 2 events/year", perEventLimitRands: 92200, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Max 2 events per year." },
  { ruleId: "MH_SUMMIT_PROSTHESIS_EXT", scheme: "MH", plan: "Summit", category: "prosthesis", description: "External prosthesis: R32,000/family", annualLimitRands: 32000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Artificial arms/legs." },
  { ruleId: "MH_SUMMIT_APPLIANCE_HOSP", scheme: "MH", plan: "Summit", category: "appliance", description: "Appliances in-hospital: R9,230/family", annualLimitRands: 9230, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Support stockings, knee/back braces." },
  { ruleId: "MH_SUMMIT_MRI_CT", scheme: "MH", plan: "Summit", category: "radiology", description: "MRI/CT scans: unlimited, R3,500 co-payment per scan", coPaymentRands: 3500, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "In- and out-of-hospital." },
  { ruleId: "MH_SUMMIT_MENTAL_HEALTH", scheme: "MH", plan: "Summit", category: "mental_health", description: "Mental health in-hospital: R50,600/beneficiary", perBeneficiaryLimit: 50600, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Includes psychiatry, psychology, drug/alcohol rehab." },
  { ruleId: "MH_SUMMIT_MENTAL_OOH", scheme: "MH", plan: "Summit", category: "mental_health", description: "Mental health OOH: R29,600/family", annualLimitRands: 29600, networkRequired: false, preAuthRequired: false, severity: "warning", notes: "Subject to overall day-to-day limit." },
  { ruleId: "MH_SUMMIT_REHAB", scheme: "MH", plan: "Summit", category: "hospital", description: "Rehab/nursing/hospice/step-down: R75,000/family", annualLimitRands: 75000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Combined limit." },
  { ruleId: "MH_SUMMIT_HIV", scheme: "MH", plan: "Summit", category: "hospital", description: "HIV hospital: unlimited at any provider, R96,800/family at any hospital", annualLimitRands: 96800, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "No limit at any provider." },
  { ruleId: "MH_SUMMIT_DONOR", scheme: "MH", plan: "Summit", category: "organ_transplant", description: "Organ transplant donor: R28,700 cadaver, R59,000 live donor", perEventLimitRands: 59000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "R28,700 cadaver, R59,000 live donor incl. transport." },
  { ruleId: "MH_SUMMIT_DAY_TO_DAY", scheme: "MH", plan: "Summit", category: "day_to_day", description: "Day-to-day: R34,500/beneficiary overall limit", perBeneficiaryLimit: 34500, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Combined limit for all OOH including 36 additional chronic conditions." },
  { ruleId: "MH_SUMMIT_ALLIED_OOH", scheme: "MH", plan: "Summit", category: "allied_health", description: "Allied health OOH: R9,840/family", annualLimitRands: 9840, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Acupuncture, homeopathy, physio, chiro, dietician etc. Subject to R34,500 overall." },
  { ruleId: "MH_SUMMIT_DENTAL_SPEC", scheme: "MH", plan: "Summit", category: "dental", description: "Specialised dentistry: R20,700/beneficiary, R49,800/family", annualLimitRands: 49800, perBeneficiaryLimit: 20700, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "In- and out-of-hospital dental specialist." },
  { ruleId: "MH_SUMMIT_APPLIANCE_OOH", scheme: "MH", plan: "Summit", category: "appliance", description: "Appliances OOH: R40,100/family, hearing aids sub-limit R23,200", annualLimitRands: 40100, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "R23,200 sub-limit for hearing aids." },
  { ruleId: "MH_SUMMIT_OPTICAL", scheme: "MH", plan: "Summit", category: "optical", description: "Optical: R6,100/beneficiary overall, frame sub-limit R3,080", perBeneficiaryLimit: 6100, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Frame sub-limit R3,080." },
  { ruleId: "MH_SUMMIT_MEDICINE_ACUTE", scheme: "MH", plan: "Summit", category: "medicine_acute", description: "Prescribed medicine: R26,900/beneficiary, R44,200/family", annualLimitRands: 44200, perBeneficiaryLimit: 26900, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Subject to R34,500 overall day-to-day limit." },
  { ruleId: "MH_SUMMIT_TRAVEL", scheme: "MH", plan: "Summit", category: "hospital", description: "International travel: R9,010,000/beneficiary/90-day journey", annualLimitRands: 9010000, coPaymentRands: 2280, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Includes R15,500 emergency optometry/dentistry, R765,000 terrorism." },
];

// ─── BONITAS BENEFIT LIMITS (Primary + Standard/Standard Select 2026) ───────
// Source: Bonitas Annexure B Primary 2026 (37 pages), Bonitas Standard 2026 (16 pages)
// Plans: Primary, Standard, Standard Select

export const BONITAS_BENEFIT_LIMITS: BenefitLimitRule[] = [
  // ── PRIMARY OPTION ──
  // Day-to-day
  { ruleId: "BON_PRIMARY_DAY_TO_DAY", scheme: "BON", plan: "Primary", category: "day_to_day", description: "Day-to-day: M=R5,540, M1=R8,860, M2=R11,080, M3+=R12,190", annualLimitRands: 5540, networkRequired: false, preAuthRequired: false, severity: "info", notes: "M+1=R8,860, M+2=R11,080, M+3+=R12,190. All OOH benefits subject to this." },
  { ruleId: "BON_PRIMARY_GP_SPEC", scheme: "BON", plan: "Primary", category: "gp_consultation", description: "GP & Specialist OOH: M=R2,330, M1=R4,080, M2=R5,240, M3+=R5,240", annualLimitRands: 2330, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Within day-to-day limit. GP referral required for specialist." },
  { ruleId: "BON_PRIMARY_ALT_HEALTH", scheme: "BON", plan: "Primary", category: "allied_health", description: "Alternative healthcare: M=R2,330, M1=R2,910, M2=R3,500, M3+=R3,500", annualLimitRands: 2330, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Within day-to-day limit. Includes homeopathy, acupuncture, naturopathy, osteopathy." },

  // Hospital
  { ruleId: "BON_PRIMARY_HOSPITAL", scheme: "BON", plan: "Primary", category: "hospital", description: "Hospital: unlimited, Primary Hospital Network, 30% co-payment non-network", coPaymentPercent: 30, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "No overall annual limit. No joint replacements, back/neck surgery unless PMB." },
  { ruleId: "BON_PRIMARY_TTO", scheme: "BON", plan: "Primary", category: "medicine_acute", description: "Take-home medicine: R470/beneficiary/admission, 7 days supply", perEventLimitRands: 470, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Except anticoagulants post-surgery." },

  // Appliances
  { ruleId: "BON_PRIMARY_CPAP", scheme: "BON", plan: "Primary", category: "appliance", description: "CPAP apparatus: R8,560/family", annualLimitRands: 8560, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Sleep apnoea. Subject to managed care programme." },

  // Acute medicine
  { ruleId: "BON_PRIMARY_ACUTE_MED", scheme: "BON", plan: "Primary", category: "medicine_acute", description: "Acute medicine: M=R1,750, M1=R2,910, M2=R3,500, M3+=R3,500", annualLimitRands: 1750, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Within day-to-day limit. 20% co-payment for non-formulary or non-DSP." },
  { ruleId: "BON_PRIMARY_OTC", scheme: "BON", plan: "Primary", category: "medicine_otc", description: "OTC (Schedule 0-2): R590/beneficiary, R2,330/family", annualLimitRands: 2330, perBeneficiaryLimit: 590, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Within acute medicine limit." },
  { ruleId: "BON_PRIMARY_CONTRACEPTIVE", scheme: "BON", plan: "Primary", category: "contraceptive", description: "Contraceptives: R1,970/family, females up to 50 years", annualLimitRands: 1970, networkRequired: true, preAuthRequired: false, severity: "info", notes: "40% co-payment for non-network pharmacy." },
  { ruleId: "BON_PRIMARY_ANTENATAL_VIT", scheme: "BON", plan: "Primary", category: "maternity", description: "Ante-natal vitamins: R200/beneficiary/month during pregnancy", perEventLimitRands: 200, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Within acute medicine and wellness benefit." },

  // Chronic medicine
  { ruleId: "BON_PRIMARY_CHRONIC", scheme: "BON", plan: "Primary", category: "chronic", description: "Chronic medicine: PMB only at DSP. 30% co-payment non-formulary/non-DSP", networkRequired: true, preAuthRequired: true, severity: "warning", notes: "PMB conditions only on Primary. Depression limited to R165/beneficiary/month." },

  // Mental health
  { ruleId: "BON_PRIMARY_MENTAL_HEALTH", scheme: "BON", plan: "Primary", category: "mental_health", description: "Mental health: R38,780/family, DSP required", annualLimitRands: 38780, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "30% co-payment non-DSP. Physio not covered for mental health admissions." },
  { ruleId: "BON_PRIMARY_MENTAL_CONSULT", scheme: "BON", plan: "Primary", category: "mental_health", description: "Mental health consultations: R9,780/family within mental health limit", annualLimitRands: 9780, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Included in R38,780 limit." },
  { ruleId: "BON_PRIMARY_MENTAL_PROGRAMME", scheme: "BON", plan: "Primary", category: "mental_health", description: "Mental Health Programme: R14,400/beneficiary, subject to enrolment", perBeneficiaryLimit: 14400, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "OOH treatment only. Does not pay concurrently with PMB treatment." },

  // Oncology
  { ruleId: "BON_PRIMARY_ONCOLOGY", scheme: "BON", plan: "Primary", category: "oncology", description: "Oncology: R224,100/family. Unlimited for PMB. Non-PMB: unlimited at network with 20% co-pay", annualLimitRands: 224100, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "30% co-payment non-network. Subject to Oncology Network DSP." },
  { ruleId: "BON_PRIMARY_BRACHYTHERAPY", scheme: "BON", plan: "Primary", category: "oncology", description: "Brachytherapy: R63,110/beneficiary within oncology limit", perBeneficiaryLimit: 63110, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Within R224,100 oncology limit." },
  { ruleId: "BON_PRIMARY_ONCOLOGY_SW", scheme: "BON", plan: "Primary", category: "oncology", description: "Oncology social worker: R3,640/family within oncology limit", annualLimitRands: 3640, networkRequired: true, preAuthRequired: true, severity: "info", notes: "Within oncology limit." },

  // Optometry
  { ruleId: "BON_PRIMARY_OPTICAL_FRAME", scheme: "BON", plan: "Primary", category: "optical", description: "Optical frame: R665 (network), R499 (non-network), biennial", annualLimitRands: 665, networkRequired: false, preAuthRequired: false, severity: "info", notes: "24-month cycle from last service date." },
  { ruleId: "BON_PRIMARY_OPTICAL_EYE", scheme: "BON", plan: "Primary", category: "optical", description: "Eye test: 1 composite consultation (network) or R420 (non-network), biennial", perEventLimitRands: 420, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Includes refraction, glaucoma screening, AI screening." },
  { ruleId: "BON_PRIMARY_OPTICAL_LENS_SV", scheme: "BON", plan: "Primary", category: "optical", description: "Single vision lenses: 100% network, R225/lens non-network", perEventLimitRands: 225, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Per lens, biennial." },
  { ruleId: "BON_PRIMARY_OPTICAL_LENS_BI", scheme: "BON", plan: "Primary", category: "optical", description: "Bifocal lenses: 100% network, R485/lens non-network", perEventLimitRands: 485, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Per lens, biennial." },
  { ruleId: "BON_PRIMARY_OPTICAL_LENS_MF", scheme: "BON", plan: "Primary", category: "optical", description: "Multifocal lenses: R850/base lens + R50/branded add-on non-network", perEventLimitRands: 850, networkRequired: false, preAuthRequired: false, severity: "info", notes: "100% base + group 1 at network." },
  { ruleId: "BON_PRIMARY_CONTACTS", scheme: "BON", plan: "Primary", category: "optical", description: "Contact lenses: R1,520/beneficiary, biennial", perBeneficiaryLimit: 1520, networkRequired: false, preAuthRequired: false, severity: "info", notes: "In lieu of spectacles." },

  // Pathology
  { ruleId: "BON_PRIMARY_PATHOLOGY", scheme: "BON", plan: "Primary", category: "pathology", description: "Pathology OOH: M=R2,330, M1=R2,910, M2=R3,500, M3+=R3,500", annualLimitRands: 2330, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Within day-to-day limit." },

  // Maternity
  { ruleId: "BON_PRIMARY_MATERNITY", scheme: "BON", plan: "Primary", category: "maternity", description: "Maternity: unlimited hospital, 6 ante-natal consults, R1,100 ante-natal classes", networkRequired: true, preAuthRequired: true, severity: "info", notes: "30% co-payment non-network. 2x2D pregnancy scans, 1 amniocentesis." },

  // Alternatives to hospitalisation
  { ruleId: "BON_PRIMARY_REHAB", scheme: "BON", plan: "Primary", category: "hospital", description: "Physical rehabilitation: R63,340/family", annualLimitRands: 63340, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "All services included." },
  { ruleId: "BON_PRIMARY_SUB_ACUTE", scheme: "BON", plan: "Primary", category: "hospital", description: "Sub-acute/hospice: R20,310/family", annualLimitRands: 20310, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Includes nursing services for psychiatric nursing, excludes midwifery." },

  // Organ transplant
  { ruleId: "BON_PRIMARY_TRANSPLANT", scheme: "BON", plan: "Primary", category: "organ_transplant", description: "Organ transplant: PMB only, network required", networkRequired: true, preAuthRequired: true, severity: "warning", notes: "No corneal grafts unless PMB. 30% co-payment non-network." },

  // ── STANDARD & STANDARD SELECT OPTIONS ──
  // Day-to-day
  { ruleId: "BON_STD_DAY_TO_DAY", scheme: "BON", plan: "Standard", category: "day_to_day", description: "Day-to-day: M=R13,980, M1=R20,980, M2=R23,310, M3+=R25,640", annualLimitRands: 13980, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Same limits for Standard and Standard Select." },
  { ruleId: "BON_STDSEL_DAY_TO_DAY", scheme: "BON", plan: "Standard Select", category: "day_to_day", description: "Day-to-day: M=R13,980, M1=R20,980, M2=R23,310, M3+=R25,640", annualLimitRands: 13980, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Must nominate 2 network GPs per beneficiary." },

  // Sublimits (same for both)
  { ruleId: "BON_STD_GP_SUBLIMIT", scheme: "BON", plan: "Standard", category: "gp_consultation", description: "GP/specialist sublimit: M=R3,500, M1=R5,240, M2=R5,830, M3+=R6,990", annualLimitRands: 3500, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Within overall day-to-day limit." },
  { ruleId: "BON_STD_ACUTE_MED", scheme: "BON", plan: "Standard", category: "medicine_acute", description: "Acute/OTC medicine sublimit: M=R3,500, M1=R5,240, M2=R5,830, M3+=R6,990", annualLimitRands: 3500, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Standard Select: 20% co-payment non-network pharmacy. OTC R930/beneficiary, R2,910/family." },
  { ruleId: "BON_STD_XRAY_BLOOD", scheme: "BON", plan: "Standard", category: "pathology", description: "X-rays/blood tests sublimit: M=R3,500, M1=R5,240, M2=R5,830, M3+=R6,990", annualLimitRands: 3500, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Labs, X-rays, ultrasounds." },
  { ruleId: "BON_STD_AUXILIARY", scheme: "BON", plan: "Standard", category: "allied_health", description: "Auxiliary services sublimit: M=R3,500, M1=R5,240, M2=R5,830, M3+=R6,990", annualLimitRands: 3500, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Physio, podiatry, biokinetics, dieticians, speech/occupational therapy, alternative healthcare." },
  { ruleId: "BON_STD_APPLIANCE", scheme: "BON", plan: "Standard", category: "appliance", description: "Appliances: within day-to-day. Stoma/CPAP: R8,890/family", annualLimitRands: 8890, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Wheelchairs, crutches, CPAP machines." },

  // Additional benefits (both Standard & Standard Select)
  { ruleId: "BON_STD_AUDIOLOGY", scheme: "BON", plan: "Standard", category: "appliance", description: "Hearing aids: R9,460/device, max 2 devices/family, every 3 years", perEventLimitRands: 9460, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "25% co-payment if not using DSP." },
  { ruleId: "BON_STD_MRI_CT", scheme: "BON", plan: "Standard", category: "radiology", description: "MRI/CT scans: R34,020/family in- and out-of-hospital", annualLimitRands: 34020, coPaymentRands: 1860, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "R1,860 co-payment per scan event except PMB." },
  { ruleId: "BON_STD_MENTAL_CONSULT", scheme: "BON", plan: "Standard", category: "mental_health", description: "Mental health consultations: R20,310/family in- and out-of-hospital", annualLimitRands: 20310, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Included in mental health hospitalisation benefit." },
  { ruleId: "BON_STD_INSULIN_PUMP", scheme: "BON", plan: "Standard", category: "appliance", description: "Insulin pump: R65,000/family every 5 years (Type 1 <18)", annualLimitRands: 65000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Per Type 1 diabetic younger than 18." },
  { ruleId: "BON_STD_CGM", scheme: "BON", plan: "Standard", category: "appliance", description: "CGM: R28,000/family/year; consumables R93,000/family", annualLimitRands: 28000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Continuous glucose monitor. Consumables R93,000/family." },
  { ruleId: "BON_STD_BP_MONITOR", scheme: "BON", plan: "Standard", category: "appliance", description: "Blood pressure monitor: R1,250/family every 2 years", annualLimitRands: 1250, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Subject to hypertension registration." },

  // Optical (both Standard & Standard Select)
  { ruleId: "BON_STD_OPTICAL_EYE", scheme: "BON", plan: "Standard", category: "optical", description: "Eye test: 1 composite (network) or R420 non-network, biennial", perEventLimitRands: 420, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Every 2 years." },
  { ruleId: "BON_STD_OPTICAL_LENS_SV", scheme: "BON", plan: "Standard", category: "optical", description: "Single vision lenses: 100% network, R220/lens non-network", perEventLimitRands: 220, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Per lens, biennial." },
  { ruleId: "BON_STD_OPTICAL_LENS_BI", scheme: "BON", plan: "Standard", category: "optical", description: "Bifocal lenses: 100% network, R480/lens non-network", perEventLimitRands: 480, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Per lens, biennial." },
  { ruleId: "BON_STD_OPTICAL_LENS_MF", scheme: "BON", plan: "Standard", category: "optical", description: "Multifocal lenses: max R900/designer lens in- and out-of-network", perEventLimitRands: 900, networkRequired: false, preAuthRequired: false, severity: "info", notes: "100% base at network." },
  { ruleId: "BON_STD_OPTICAL_FRAME", scheme: "BON", plan: "Standard", category: "optical", description: "Frames: R1,460 (network), R1,100 (non-network)", annualLimitRands: 1460, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Per beneficiary, biennial." },
  { ruleId: "BON_STD_CONTACTS", scheme: "BON", plan: "Standard", category: "optical", description: "Contact lenses: R2,185/beneficiary, biennial", perBeneficiaryLimit: 2185, networkRequired: false, preAuthRequired: false, severity: "info", notes: "In lieu of spectacles." },

  // Chronic (both Standard & Standard Select)
  { ruleId: "BON_STD_CHRONIC", scheme: "BON", plan: "Standard", category: "chronic", description: "Chronic: R13,030/beneficiary, R26,150/family for 45 conditions", annualLimitRands: 26150, perBeneficiaryLimit: 13030, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "30% co-payment non-formulary or non-network. 27 PMBs continue after limit." },

  // In-hospital (both Standard & Standard Select)
  { ruleId: "BON_STD_HOSPITAL", scheme: "BON", plan: "Standard", category: "hospital", description: "Hospital: unlimited, Standard Select requires network hospital", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Standard Select: 30% co-payment non-network. Standard: any private hospital." },
  { ruleId: "BON_STD_PROSTHESIS", scheme: "BON", plan: "Standard", category: "prosthesis", description: "Internal/external prostheses: R57,630/family", annualLimitRands: 57630, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Breast prosthesis sub-limit R7,130 per prosthesis (max 2/year)." },
  { ruleId: "BON_STD_HIP_KNEE_COPAY", scheme: "BON", plan: "Standard", category: "prosthesis", description: "Hip/knee replacement: R38,560 co-payment if not using DSP", coPaymentRands: 38560, networkRequired: true, preAuthRequired: true, severity: "error", notes: "Avoid by using DSP." },
  { ruleId: "BON_STD_NERVE_STIM", scheme: "BON", plan: "Standard", category: "prosthesis", description: "Internal nerve stimulators: R224,400/family", annualLimitRands: 224400, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "In-hospital." },
  { ruleId: "BON_STD_MENTAL_HOSP", scheme: "BON", plan: "Standard", category: "mental_health", description: "Mental health hospitalisation: R51,900/family", annualLimitRands: 51900, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "30% co-payment non-network. No physio for mental health admissions." },
  { ruleId: "BON_STD_CATARACT_COPAY", scheme: "BON", plan: "Standard", category: "hospital", description: "Cataract surgery: R7,420 co-payment if not using DSP", coPaymentRands: 7420, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Avoid by using DSP." },
  { ruleId: "BON_STD_TTO", scheme: "BON", plan: "Standard", category: "medicine_acute", description: "Take-home medicine: R605/hospital stay, 7-day supply", perEventLimitRands: 605, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Per hospital stay." },
  { ruleId: "BON_STD_REHAB", scheme: "BON", plan: "Standard", category: "hospital", description: "Physical rehabilitation: R67,270/family", annualLimitRands: 67270, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "In-hospital." },
  { ruleId: "BON_STD_SUB_ACUTE", scheme: "BON", plan: "Standard", category: "hospital", description: "Sub-acute/step-down/hospice: R21,570/family", annualLimitRands: 21570, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Alternatives to hospital." },
  { ruleId: "BON_STD_CANCER_NONPMB", scheme: "BON", plan: "Standard", category: "oncology", description: "Cancer (non-PMB): R280,100/family. Specialised drugs sub-limit R164,100", annualLimitRands: 280100, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "80% at DSP, no cover at non-DSP once limit reached. Brachytherapy R63,110/beneficiary." },
  { ruleId: "BON_STD_TRANSPLANT", scheme: "BON", plan: "Standard", category: "organ_transplant", description: "Organ transplant: unlimited. Corneal graft sub-limit R42,710/beneficiary", networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Corneal graft sub-limit R42,710/beneficiary." },
  { ruleId: "BON_STD_DAY_SURGERY_COPAY", scheme: "BON", plan: "Standard", category: "hospital", description: "Day surgery co-payment: R5,440 (Standard), R7,100 (Standard Select) if non-network day hospital", coPaymentRands: 5440, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Standard Select = R7,100." },
  { ruleId: "BON_STD_DENTAL_HOSP_COPAY", scheme: "BON", plan: "Standard", category: "dental", description: "Dental hospitalisation co-payment: R3,640 (<5 years), R5,200 (other), R2,600 (day hospital)", coPaymentRands: 3640, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "30% co-payment non-network hospital." },
  { ruleId: "BON_STD_TRAVEL", scheme: "BON", plan: "Standard", category: "hospital", description: "International travel: up to R1.2 million/family", annualLimitRands: 1200000, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Must register before departure." },
];

// ─── POLMED BENEFIT LIMITS (2026 Member Guide) ──────────────────────────────
// Source: Polmed Member Guide 2026 (45 pages)
// Plans: Marine, Aquarium (SAPS restricted scheme)
// Note: Polmed has unique IOD (injury on duty) benefits for SAPS members

export const POLMED_LIMITS: BenefitLimitRule[] = [
  // ── MARINE OPTION ──
  // Hospital
  { ruleId: "POL_MARINE_HOSPITAL", scheme: "POL", plan: "Marine", category: "hospital", description: "Hospital: unlimited at network. Open network. R5,000 penalty if no pre-auth", networkRequired: false, preAuthRequired: true, severity: "info", notes: "Open network applies. Scheme rates applicable." },
  { ruleId: "POL_MARINE_ANAESTHETIST", scheme: "POL", plan: "Marine", category: "hospital", description: "Anaesthetist: 150% of POLMED rate", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Network anaesthetist at agreed rate." },

  // Mental health
  { ruleId: "POL_MARINE_MENTAL_HEALTH", scheme: "POL", plan: "Marine", category: "mental_health", description: "Mental health: 21 days in-hospital or 15 OOH sessions/beneficiary", daysLimit: 21, visitLimit: 15, visitPeriodMonths: 12, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Max 3 days if admitted by GP/specialist physician. Additional requires motivation." },

  // Oncology
  { ruleId: "POL_MARINE_ONCOLOGY", scheme: "POL", plan: "Marine", category: "oncology", description: "Oncology: R590,393/beneficiary/year incl. MRI/CT or 2 PET scans", annualLimitRands: 590393, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Specialised drugs sub-limit R354,236. Subject to oncology formulary." },

  // Prosthesis
  { ruleId: "POL_MARINE_PROSTHESIS", scheme: "POL", plan: "Marine", category: "prosthesis", description: "Prosthesis: R91,874/beneficiary overall", perBeneficiaryLimit: 91874, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Sub-limits: Knee R69,349, Hip R69,349, Shoulder R82,685, IOL R4,000, Cardiac stent R34,006, Pacemaker R74,682, Spinal R82,964." },
  { ruleId: "POL_MARINE_PROSTHESIS_KNEE", scheme: "POL", plan: "Marine", category: "prosthesis", description: "Knee joint prosthesis: R69,349", perEventLimitRands: 69349, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Within overall prosthesis benefit." },
  { ruleId: "POL_MARINE_PROSTHESIS_HIP", scheme: "POL", plan: "Marine", category: "prosthesis", description: "Hip joint prosthesis: R69,349", perEventLimitRands: 69349, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Within overall prosthesis benefit." },
  { ruleId: "POL_MARINE_PROSTHESIS_SHOULDER", scheme: "POL", plan: "Marine", category: "prosthesis", description: "Shoulder joint prosthesis: R82,685", perEventLimitRands: 82685, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Within overall prosthesis benefit." },
  { ruleId: "POL_MARINE_PROSTHESIS_IOL", scheme: "POL", plan: "Marine", category: "prosthesis", description: "Intraocular lens: R4,000", perEventLimitRands: 4000, networkRequired: true, preAuthRequired: true, severity: "info", notes: "Within overall prosthesis benefit." },
  { ruleId: "POL_MARINE_PROSTHESIS_AORTA", scheme: "POL", plan: "Marine", category: "prosthesis", description: "Aorta/peripheral arterial stent grafts: R60,013", perEventLimitRands: 60013, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Within overall prosthesis benefit." },
  { ruleId: "POL_MARINE_PROSTHESIS_CARDIAC_STENT", scheme: "POL", plan: "Marine", category: "prosthesis", description: "Cardiac stents: R34,006", perEventLimitRands: 34006, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Within overall prosthesis benefit." },
  { ruleId: "POL_MARINE_PROSTHESIS_PACEMAKER", scheme: "POL", plan: "Marine", category: "prosthesis", description: "Cardiac pacemaker: R74,682", perEventLimitRands: 74682, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Within overall prosthesis benefit." },
  { ruleId: "POL_MARINE_PROSTHESIS_SPINAL", scheme: "POL", plan: "Marine", category: "prosthesis", description: "Spinal plates/screws: R82,964; spinal implantable: R76,207", perEventLimitRands: 82964, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Unlisted items R82,964." },

  // Specialised drugs
  { ruleId: "POL_MARINE_SPEC_DRUGS", scheme: "POL", plan: "Marine", category: "hospital", description: "Specialised drugs (biologicals): R225,322/family", annualLimitRands: 225322, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "E.g. biologicals. Pre-auth required." },

  // Dentistry in-hospital
  { ruleId: "POL_MARINE_DENTAL_HOSP", scheme: "POL", plan: "Marine", category: "dental", description: "Dentistry in-hospital: dentist costs from OOH limit. M=R6,350, M1=R7,303, M2=R8,256, M3=R9,208, M4+=R10,162", annualLimitRands: 6350, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Hospital/anaesthetist from in-hospital benefit." },

  // Caesarean
  { ruleId: "POL_MARINE_CAESAREAN", scheme: "POL", plan: "Marine", category: "maternity", description: "Voluntary caesarean: R10,000 co-payment", coPaymentRands: 10000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Subject to PMB. Emergency caesareans covered." },

  // Out-of-hospital overall
  { ruleId: "POL_MARINE_OOH", scheme: "POL", plan: "Marine", category: "day_to_day", description: "OOH overall: M=R17,428, M1=R30,479, M2=R36,746, M3=R42,208, M4+=R45,901", annualLimitRands: 17428, networkRequired: false, preAuthRequired: false, severity: "info", notes: "PMBs accrue but are not subject to limit." },

  // GP visits
  { ruleId: "POL_MARINE_GP_VISITS", scheme: "POL", plan: "Marine", category: "gp_consultation", description: "GP consultations: M=11, M1=16, M2=20, M3=24, M4+=29 visits/family", visitLimit: 11, visitPeriodMonths: 12, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Includes pharmacy consultation. 2 non-nominated GP visits allowed per beneficiary." },

  // Specialist visits
  { ruleId: "POL_MARINE_SPECIALIST", scheme: "POL", plan: "Marine", category: "specialist", description: "Specialist: 5 visits/beneficiary or 11/family. R1,000 co-payment if no referral", visitLimit: 5, visitPeriodMonths: 12, coPaymentRands: 1000, networkRequired: true, preAuthRequired: false, severity: "warning", notes: "2 visits without GP referral allowed. Co-payment not applicable to gynae, psychiatry, oncology, ophthalmology." },

  // Audiology
  { ruleId: "POL_MARINE_AUDIOLOGY", scheme: "POL", plan: "Marine", category: "appliance", description: "Audiology: R35,706/beneficiary per 3-year cycle", perBeneficiaryLimit: 35706, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "20% co-payment for non-formulary. HearConnect network." },

  // Dentistry OOH
  { ruleId: "POL_MARINE_DENTAL_OOH", scheme: "POL", plan: "Marine", category: "dental", description: "Dentistry OOH: M=R7,348, M1=R8,307, M2=R9,099, M3=R10,143, M4+=R11,318", annualLimitRands: 7348, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Within OOH limit. 2 annual check-ups per beneficiary." },

  // Specialised dentistry
  { ruleId: "POL_MARINE_DENTAL_SPEC", scheme: "POL", plan: "Marine", category: "dental", description: "Specialised dentistry: R18,042/family", annualLimitRands: 18042, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Crowns/bridges 5-year cycle. Includes maxillofacial surgery." },

  // Acute medicine
  { ruleId: "POL_MARINE_ACUTE_MED", scheme: "POL", plan: "Marine", category: "medicine_acute", description: "Acute medicine: M=R5,840, M1=R9,929, M2=R14,015, M3=R18,104, M4+=R22,219", annualLimitRands: 5840, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Within OOH limit. 20% co-payment non-formulary/non-network." },

  // OTC
  { ruleId: "POL_MARINE_OTC", scheme: "POL", plan: "Marine", category: "medicine_otc", description: "OTC medicine: R1,537/family, R200/script limit", annualLimitRands: 1537, perEventLimitRands: 200, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Within OOH and acute sublimits." },

  // Pathology
  { ruleId: "POL_MARINE_PATHOLOGY", scheme: "POL", plan: "Marine", category: "pathology", description: "Pathology OOH: M=R4,270, M1=R6,156, M2=R7,362, M3=R9,067, M4+=R11,117", annualLimitRands: 4270, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Within OOH limit." },

  // Physiotherapy
  { ruleId: "POL_MARINE_PHYSIO", scheme: "POL", plan: "Marine", category: "physiotherapy", description: "Physiotherapy: R6,155/family", annualLimitRands: 6155, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Within OOH limit." },

  // Occupational/speech therapy
  { ruleId: "POL_MARINE_OCC_SPEECH", scheme: "POL", plan: "Marine", category: "allied_health", description: "Occupational/speech therapy: R3,550/family", annualLimitRands: 3550, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Within OOH limit." },

  // Psychology
  { ruleId: "POL_MARINE_PSYCHOLOGY", scheme: "POL", plan: "Marine", category: "mental_health", description: "Psychologist/social worker: R8,256/family", annualLimitRands: 8256, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Within OOH limit. Includes marriage counselling." },

  // Allied health
  { ruleId: "POL_MARINE_ALLIED", scheme: "POL", plan: "Marine", category: "allied_health", description: "Allied/alternative health: R3,473/family", annualLimitRands: 3473, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Art therapy, biokineticists, chiro, dieticians, homeopaths, naturopaths, osteopaths etc." },

  // Chronic medication
  { ruleId: "POL_MARINE_CHRONIC", scheme: "POL", plan: "Marine", category: "chronic", description: "Non-PMB chronic: M=R12,393, M1=R14,854, M2=R17,317, M3=R19,779, M4+=R22,242", annualLimitRands: 12393, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "PMB-CDL unlimited. 20% co-payment non-network/non-formulary." },

  // Radiology
  { ruleId: "POL_MARINE_RADIOLOGY_BASIC", scheme: "POL", plan: "Marine", category: "radiology", description: "Basic radiology: R8,115/family in- and out-of-hospital", annualLimitRands: 8115, networkRequired: false, preAuthRequired: false, severity: "info", notes: "X-rays and soft tissue ultrasounds." },
  { ruleId: "POL_MARINE_RADIOLOGY_SPEC", scheme: "POL", plan: "Marine", category: "radiology", description: "Specialised radiology: 1 MRI + 2 CT scans/family. R1,000 co-pay if no pre-auth", visitLimit: 3, visitPeriodMonths: 12, coPaymentRands: 1000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "1 MRI, 2 CT scans per family except PMB." },

  // Optical
  { ruleId: "POL_MARINE_OPTICAL_CONSULT", scheme: "POL", plan: "Marine", category: "optical", description: "Optical consultation: R800 composite (network), R420 (non-network), biennial", perEventLimitRands: 800, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Every 24 months." },
  { ruleId: "POL_MARINE_OPTICAL_FRAME", scheme: "POL", plan: "Marine", category: "optical", description: "Optical frame: R1,686 (network), R1,265 (non-network)", annualLimitRands: 1686, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Biennial. Or towards lens enhancements." },
  { ruleId: "POL_MARINE_OPTICAL_LENS_SV", scheme: "POL", plan: "Marine", category: "optical", description: "Single vision lenses: R225/lens", perEventLimitRands: 225, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Per lens, biennial." },
  { ruleId: "POL_MARINE_OPTICAL_LENS_BI", scheme: "POL", plan: "Marine", category: "optical", description: "Bifocal lenses: R485/lens", perEventLimitRands: 485, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Per lens, biennial." },
  { ruleId: "POL_MARINE_OPTICAL_LENS_MF", scheme: "POL", plan: "Marine", category: "optical", description: "Multifocal lenses: R900/lens + R50/designer add-on", perEventLimitRands: 900, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Per lens, biennial." },
  { ruleId: "POL_MARINE_CONTACTS", scheme: "POL", plan: "Marine", category: "optical", description: "Contact lenses: R1,710/beneficiary, R255 re-examination", perBeneficiaryLimit: 1710, networkRequired: false, preAuthRequired: false, severity: "info", notes: "In lieu of spectacles. Biennial." },

  // Appliances
  { ruleId: "POL_MARINE_HEARING_AID", scheme: "POL", plan: "Marine", category: "appliance", description: "Hearing aids: R17,964/aid or R35,706/set, every 3 years", perEventLimitRands: 17964, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "HearConnect network. 20% co-payment non-formulary." },
  { ruleId: "POL_MARINE_NEBULISER", scheme: "POL", plan: "Marine", category: "appliance", description: "Nebuliser: R1,704/family every 4 years", annualLimitRands: 1704, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Every 4 years." },
  { ruleId: "POL_MARINE_GLUCOMETER", scheme: "POL", plan: "Marine", category: "appliance", description: "Glucometer: R1,704/family every 4 years", annualLimitRands: 1704, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Every 4 years." },
  { ruleId: "POL_MARINE_PAP_MACHINE", scheme: "POL", plan: "Marine", category: "appliance", description: "PAP machine: R20,160/beneficiary every 4 years", perBeneficiaryLimit: 20160, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Every 4 years." },
  { ruleId: "POL_MARINE_WHEELCHAIR", scheme: "POL", plan: "Marine", category: "appliance", description: "Wheelchair: R28,181 (non-motorised) or R67,080 (motorised)/beneficiary every 3 years", perBeneficiaryLimit: 28181, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Motorised = R67,080. Every 3 years." },
  { ruleId: "POL_MARINE_MED_DEVICES", scheme: "POL", plan: "Marine", category: "appliance", description: "Medical assistive devices: R8,700/family", annualLimitRands: 8700, networkRequired: false, preAuthRequired: true, severity: "info", notes: "In/out of hospital." },
  { ruleId: "POL_MARINE_INSULIN_PUMP", scheme: "POL", plan: "Marine", category: "appliance", description: "Insulin pump: R86,407/beneficiary/year, device every 5 years", perBeneficiaryLimit: 86407, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Type 1 diabetics. One device every 5 years." },
  { ruleId: "POL_MARINE_INSULIN_CONSUMABLES", scheme: "POL", plan: "Marine", category: "appliance", description: "Insulin pump consumables: R43,369/beneficiary/year", perBeneficiaryLimit: 43369, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Annual." },
  { ruleId: "POL_MARINE_CGM_DEVICE", scheme: "POL", plan: "Marine", category: "appliance", description: "CGM device: R32,521/beneficiary, every 5 years", perBeneficiaryLimit: 32521, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "One device every 5 years." },
  { ruleId: "POL_MARINE_CGM_CONSUMABLES", scheme: "POL", plan: "Marine", category: "appliance", description: "CGM consumables: R42,823/beneficiary/year", perBeneficiaryLimit: 42823, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Annual." },
  { ruleId: "POL_MARINE_BP_MONITOR", scheme: "POL", plan: "Marine", category: "appliance", description: "Blood pressure monitor: R1,324/family every 2 years", annualLimitRands: 1324, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Subject to chronic hypertension registration." },
  { ruleId: "POL_MARINE_COCHLEAR_UNI", scheme: "POL", plan: "Marine", category: "appliance", description: "Cochlear implant (unilateral): R266,758/beneficiary/lifetime", perBeneficiaryLimit: 266758, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Subject to clinical and funding protocols." },
  { ruleId: "POL_MARINE_COCHLEAR_BI", scheme: "POL", plan: "Marine", category: "appliance", description: "Cochlear implant (bilateral): R521,919/beneficiary/lifetime", perBeneficiaryLimit: 521919, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Subject to clinical and funding protocols." },
  { ruleId: "POL_MARINE_COCHLEAR_MAINT", scheme: "POL", plan: "Marine", category: "appliance", description: "Cochlear processor maintenance: R158,316/beneficiary every 5 years", perBeneficiaryLimit: 158316, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Every 5 years." },
  { ruleId: "POL_MARINE_TAVI", scheme: "POL", plan: "Marine", category: "prosthesis", description: "Trans Aortic Valve Insertion: R336,580/family/year", annualLimitRands: 336580, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "TAVI." },
  { ruleId: "POL_MARINE_ICD", scheme: "POL", plan: "Marine", category: "prosthesis", description: "Implantable Cardiac Defibrillators: R241,323/family/year", annualLimitRands: 241323, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "ICD." },
  { ruleId: "POL_MARINE_ADULT_NAPPIES", scheme: "POL", plan: "Marine", category: "appliance", description: "Adult nappies: R1,261/month (2/day) or R1,797/month (3/day)", perEventLimitRands: 1261, networkRequired: false, preAuthRequired: false, severity: "info", notes: "R1,797/month for 3 nappies/day." },

  // Maternity
  { ruleId: "POL_MARINE_MATERNITY", scheme: "POL", plan: "Marine", category: "maternity", description: "Maternity: 3 specialist consults/pregnancy, home birth R22,442, ultrasound R6,066", networkRequired: true, preAuthRequired: true, severity: "info", notes: "2x2D scans per pregnancy. R10,000 co-payment for voluntary caesarean." },

  // Refractive surgery
  { ruleId: "POL_MARINE_REFRACTIVE", scheme: "POL", plan: "Marine", category: "refractive_surgery", description: "Refractive surgery: covered at POLMED rate", networkRequired: false, preAuthRequired: true, severity: "info", notes: "Out-of-hospital and day clinics." },

  // EMS
  { ruleId: "POL_MARINE_AMBULANCE", scheme: "POL", plan: "Marine", category: "ambulance", description: "Emergency medical services: ER24, 40% co-payment if non-network", coPaymentPercent: 40, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "72-hour post-authorisation rule." },

  // ── AQUARIUM OPTION ──
  // Hospital
  { ruleId: "POL_AQUARIUM_HOSPITAL", scheme: "POL", plan: "Aquarium", category: "hospital", description: "Hospital (non-PMB): R226,336/family. Network required. 30% co-payment non-network", annualLimitRands: 226336, coPaymentPercent: 30, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "PMB unlimited. R5,000 penalty if no pre-auth. Mediclinic/Netcare + selected others." },

  // Mental health
  { ruleId: "POL_AQUARIUM_MENTAL_HEALTH", scheme: "POL", plan: "Aquarium", category: "mental_health", description: "Mental health: 21 days in-hospital or 15 OOH sessions/beneficiary", daysLimit: 21, visitLimit: 15, visitPeriodMonths: 12, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Max 3 days if admitted by GP/specialist physician." },

  // Oncology
  { ruleId: "POL_AQUARIUM_ONCOLOGY", scheme: "POL", plan: "Aquarium", category: "oncology", description: "Oncology: R307,138/beneficiary/year incl. MRI/CT or 2 PET scans", annualLimitRands: 307138, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Specialised drugs PMB only. 30% co-payment non-network." },

  // Prosthesis
  { ruleId: "POL_AQUARIUM_PROSTHESIS", scheme: "POL", plan: "Aquarium", category: "prosthesis", description: "Prosthesis: R67,675/beneficiary overall", perBeneficiaryLimit: 67675, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Sub-limits: Knee R47,410, Hip R47,410, Shoulder R55,686, IOL R2,735, Cardiac stent R23,250, Pacemaker R51,056, Spinal R55,686." },
  { ruleId: "POL_AQUARIUM_PROSTHESIS_KNEE", scheme: "POL", plan: "Aquarium", category: "prosthesis", description: "Knee joint prosthesis: R47,410", perEventLimitRands: 47410, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Within overall prosthesis benefit." },
  { ruleId: "POL_AQUARIUM_PROSTHESIS_HIP", scheme: "POL", plan: "Aquarium", category: "prosthesis", description: "Hip joint prosthesis: R47,410", perEventLimitRands: 47410, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Within overall prosthesis benefit." },
  { ruleId: "POL_AQUARIUM_PROSTHESIS_SHOULDER", scheme: "POL", plan: "Aquarium", category: "prosthesis", description: "Shoulder joint prosthesis: R55,686", perEventLimitRands: 55686, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Within overall prosthesis benefit." },
  { ruleId: "POL_AQUARIUM_PROSTHESIS_IOL", scheme: "POL", plan: "Aquarium", category: "prosthesis", description: "Intraocular lens: R2,735", perEventLimitRands: 2735, networkRequired: true, preAuthRequired: true, severity: "info", notes: "Within overall prosthesis benefit." },
  { ruleId: "POL_AQUARIUM_PROSTHESIS_AORTA", scheme: "POL", plan: "Aquarium", category: "prosthesis", description: "Aorta/peripheral arterial stent grafts: R41,027", perEventLimitRands: 41027, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Within overall prosthesis benefit." },
  { ruleId: "POL_AQUARIUM_PROSTHESIS_CARDIAC_STENT", scheme: "POL", plan: "Aquarium", category: "prosthesis", description: "Cardiac stents: R23,250", perEventLimitRands: 23250, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Within overall prosthesis benefit." },
  { ruleId: "POL_AQUARIUM_PROSTHESIS_PACEMAKER", scheme: "POL", plan: "Aquarium", category: "prosthesis", description: "Cardiac pacemaker: R51,056", perEventLimitRands: 51056, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Within overall prosthesis benefit." },
  { ruleId: "POL_AQUARIUM_PROSTHESIS_SPINAL", scheme: "POL", plan: "Aquarium", category: "prosthesis", description: "Spinal plates/screws: R55,686; spinal implantable: R52,099", perEventLimitRands: 55686, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Unlisted items R55,686." },

  // Specialised drugs
  { ruleId: "POL_AQUARIUM_SPEC_DRUGS", scheme: "POL", plan: "Aquarium", category: "hospital", description: "Specialised drugs (biologicals): R163,119/family", annualLimitRands: 163119, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "E.g. biologicals." },

  // Dentistry in-hospital
  { ruleId: "POL_AQUARIUM_DENTAL_HOSP", scheme: "POL", plan: "Aquarium", category: "dental", description: "Dentistry in-hospital: dentist costs from OOH. M=R4,527, M1=R5,093, M2=R5,659, M3=R6,224, M4+=R6,790", annualLimitRands: 4527, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Hospital/anaesthetist from in-hospital benefit." },

  // Caesarean
  { ruleId: "POL_AQUARIUM_CAESAREAN", scheme: "POL", plan: "Aquarium", category: "maternity", description: "Voluntary caesarean: 30% co-payment", coPaymentPercent: 30, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "PMBs apply." },

  // Out-of-hospital overall
  { ruleId: "POL_AQUARIUM_OOH", scheme: "POL", plan: "Aquarium", category: "day_to_day", description: "OOH overall: M=R8,696, M1=R12,092, M2=R14,689, M3=R15,679, M4+=R17,962", annualLimitRands: 8696, networkRequired: false, preAuthRequired: false, severity: "info", notes: "PMBs accrue but not subject to limit." },

  // GP visits
  { ruleId: "POL_AQUARIUM_GP_VISITS", scheme: "POL", plan: "Aquarium", category: "gp_consultation", description: "GP consultations: M=4, M1=6, M2=9, M3=12, M4+=15 visits/family. Nominated network GP required", visitLimit: 4, visitPeriodMonths: 12, coPaymentPercent: 30, networkRequired: true, preAuthRequired: false, severity: "warning", notes: "30% co-payment for non-nominated GP. 2 non-nominated visits allowed per beneficiary." },

  // Specialist visits
  { ruleId: "POL_AQUARIUM_SPECIALIST", scheme: "POL", plan: "Aquarium", category: "specialist", description: "Specialist: 4 visits/beneficiary or 8/family. R5,270/beneficiary limit. 30% co-payment if no referral", visitLimit: 4, visitPeriodMonths: 12, coPaymentPercent: 30, perBeneficiaryLimit: 5270, networkRequired: true, preAuthRequired: false, severity: "warning", notes: "2 visits without GP referral allowed." },

  // Audiology
  { ruleId: "POL_AQUARIUM_AUDIOLOGY", scheme: "POL", plan: "Aquarium", category: "appliance", description: "Audiology: R25,456/beneficiary OOH limit", perBeneficiaryLimit: 25456, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "20% co-payment non-formulary. Network required." },

  // Dentistry OOH
  { ruleId: "POL_AQUARIUM_DENTAL_OOH", scheme: "POL", plan: "Aquarium", category: "dental", description: "Dentistry OOH: M=R5,253, M1=R5,924, M2=R6,550, M3=R7,188, M4+=R7,842", annualLimitRands: 5253, networkRequired: true, preAuthRequired: false, severity: "info", notes: "30% co-payment non-network. 2 annual check-ups/beneficiary." },

  // Acute medicine
  { ruleId: "POL_AQUARIUM_ACUTE_MED", scheme: "POL", plan: "Aquarium", category: "medicine_acute", description: "Acute medicine: M=R2,631, M1=R4,474, M2=R6,316, M3=R8,158, M4+=R9,999", annualLimitRands: 2631, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Within OOH limit. 20% co-payment non-formulary/non-network." },

  // OTC
  { ruleId: "POL_AQUARIUM_OTC", scheme: "POL", plan: "Aquarium", category: "medicine_otc", description: "OTC medicine: R1,132/family, R160/script limit", annualLimitRands: 1132, perEventLimitRands: 160, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Shared with acute. 20% co-payment non-formulary." },

  // Pathology
  { ruleId: "POL_AQUARIUM_PATHOLOGY", scheme: "POL", plan: "Aquarium", category: "pathology", description: "Pathology OOH: M=R3,508, M1=R5,189, M2=R6,276, M3=R7,769, M4+=R9,624", annualLimitRands: 3508, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Within OOH limit." },

  // Physiotherapy
  { ruleId: "POL_AQUARIUM_PHYSIO", scheme: "POL", plan: "Aquarium", category: "physiotherapy", description: "Physiotherapy: R2,108/family, PMBs only", annualLimitRands: 2108, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Within OOH limit." },

  // Psychology
  { ruleId: "POL_AQUARIUM_PSYCHOLOGY", scheme: "POL", plan: "Aquarium", category: "mental_health", description: "Psychologist/social worker: R5,659/family", annualLimitRands: 5659, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Within OOH limit. Includes marriage counselling." },

  // Chronic medication
  { ruleId: "POL_AQUARIUM_CHRONIC", scheme: "POL", plan: "Aquarium", category: "chronic", description: "Chronic medicine: PMB only. Non-PMB: no benefit except PMBs", networkRequired: true, preAuthRequired: true, severity: "warning", notes: "PMB-CDL unlimited. Non-PMB chronic not covered." },

  // Appliances
  { ruleId: "POL_AQUARIUM_HEARING_AID", scheme: "POL", plan: "Aquarium", category: "appliance", description: "Hearing aids: R12,809/aid or R25,456/set, every 3 years", perEventLimitRands: 12809, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Audiology network required." },
  { ruleId: "POL_AQUARIUM_NEBULISER", scheme: "POL", plan: "Aquarium", category: "appliance", description: "Nebuliser: R1,452/family every 4 years", annualLimitRands: 1452, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Every 4 years." },
  { ruleId: "POL_AQUARIUM_GLUCOMETER", scheme: "POL", plan: "Aquarium", category: "appliance", description: "Glucometer: R1,452/family every 4 years", annualLimitRands: 1452, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Every 4 years." },
  { ruleId: "POL_AQUARIUM_PAP_MACHINE", scheme: "POL", plan: "Aquarium", category: "appliance", description: "PAP machine: R14,112/beneficiary every 4 years", perBeneficiaryLimit: 14112, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Every 4 years." },
  { ruleId: "POL_AQUARIUM_WHEELCHAIR_NM", scheme: "POL", plan: "Aquarium", category: "appliance", description: "Wheelchair (non-motorised): R15,611/beneficiary every 3 years", perBeneficiaryLimit: 15611, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Every 3 years." },
  { ruleId: "POL_AQUARIUM_WHEELCHAIR_M", scheme: "POL", plan: "Aquarium", category: "appliance", description: "Wheelchair (motorised): R38,896/beneficiary every 3 years", perBeneficiaryLimit: 38896, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Every 3 years." },
  { ruleId: "POL_AQUARIUM_MED_DEVICES", scheme: "POL", plan: "Aquarium", category: "appliance", description: "Medical assistive devices: R6,224/family", annualLimitRands: 6224, networkRequired: false, preAuthRequired: true, severity: "info", notes: "In/out of hospital." },
  { ruleId: "POL_AQUARIUM_INSULIN_PUMP", scheme: "POL", plan: "Aquarium", category: "appliance", description: "Insulin pump: R42,160/beneficiary, device every 5 years", perBeneficiaryLimit: 42160, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Type 1 diabetics." },
  { ruleId: "POL_AQUARIUM_INSULIN_CONSUMABLES", scheme: "POL", plan: "Aquarium", category: "appliance", description: "Insulin pump consumables: R29,853/beneficiary/year", perBeneficiaryLimit: 29853, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Annual." },
  { ruleId: "POL_AQUARIUM_CGM_DEVICE", scheme: "POL", plan: "Aquarium", category: "appliance", description: "CGM device: R32,521/beneficiary, every 5 years", perBeneficiaryLimit: 32521, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Every 5 years." },
  { ruleId: "POL_AQUARIUM_CGM_CONSUMABLES", scheme: "POL", plan: "Aquarium", category: "appliance", description: "CGM consumables: R42,823/beneficiary/year", perBeneficiaryLimit: 42823, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Annual." },
  { ruleId: "POL_AQUARIUM_BP_MONITOR", scheme: "POL", plan: "Aquarium", category: "appliance", description: "Blood pressure monitor: R1,324/family every 2 years", annualLimitRands: 1324, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Subject to chronic hypertension registration." },

  // Maternity
  { ruleId: "POL_AQUARIUM_MATERNITY", scheme: "POL", plan: "Aquarium", category: "maternity", description: "Maternity: 3 specialist consults/pregnancy, home birth R17,132, ultrasound R4,570", networkRequired: true, preAuthRequired: true, severity: "info", notes: "30% co-payment voluntary caesarean." },

  // Optical
  { ruleId: "POL_AQUARIUM_OPTICAL_CONSULT", scheme: "POL", plan: "Aquarium", category: "optical", description: "Optical consultation: R755 composite (network), biennial", perEventLimitRands: 755, networkRequired: true, preAuthRequired: true, severity: "info", notes: "Pre-auth required. Every 24 months." },
  { ruleId: "POL_AQUARIUM_OPTICAL_FRAME", scheme: "POL", plan: "Aquarium", category: "optical", description: "Optical frame: R835 (network)", annualLimitRands: 835, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Biennial." },
  { ruleId: "POL_AQUARIUM_CONTACTS", scheme: "POL", plan: "Aquarium", category: "optical", description: "Contact lenses: R1,178/beneficiary (non-network)", perBeneficiaryLimit: 1178, networkRequired: false, preAuthRequired: false, severity: "info", notes: "R255 re-examination." },

  // Refractive surgery
  { ruleId: "POL_AQUARIUM_REFRACTIVE", scheme: "POL", plan: "Aquarium", category: "refractive_surgery", description: "Refractive surgery: no benefit on Aquarium", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Not covered on Aquarium option." },

  // Allied health
  { ruleId: "POL_AQUARIUM_ALLIED", scheme: "POL", plan: "Aquarium", category: "allied_health", description: "Allied/alternative health: no benefit on Aquarium", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Not covered. Marine only." },

  // EMS
  { ruleId: "POL_AQUARIUM_AMBULANCE", scheme: "POL", plan: "Aquarium", category: "ambulance", description: "Emergency medical services: ER24, 40% co-payment if non-network", coPaymentPercent: 40, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "72-hour post-authorisation rule." },

  // Renal
  { ruleId: "POL_RENAL", scheme: "POL", plan: "*", category: "renal", description: "Chronic renal dialysis: network required, 30% co-payment non-network", coPaymentPercent: 30, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Both Marine and Aquarium. PMBs apply." },

  // IOD (injury on duty) — unique to SAPS
  { ruleId: "POL_IOD", scheme: "POL", plan: "*", category: "hospital", description: "Injury-on-duty (IOD): separate benefit for SAPS members injured on duty", networkRequired: false, preAuthRequired: false, severity: "info", notes: "POLMED-specific: IOD claims processed separately per SAPS protocol." },
];

// ─── ALL BENEFIT LIMIT RULES ────────────────────────────────────────────────

export const ALL_BENEFIT_LIMIT_RULES: BenefitLimitRule[] = [
  ...BESTMED_BENEFIT_LIMITS,
  ...MEDSHIELD_BENEFIT_LIMITS,
  ...GEMS_BENEFIT_LIMITS,
  ...BANKMED_EXCLUSION_RULES,
  ...DISCOVERY_EXCLUSION_RULES,
  ...DISCOVERY_COMPREHENSIVE_LIMITS,
  ...DISCOVERY_KEYCARE_LIMITS,
  ...BESTMED_PACE_LIMITS,
  ...MEDSHIELD_ADDITIONAL_LIMITS,
  ...GEMS_RUBY_LIMITS,
  ...GEMS_EMERALD_LIMITS,
  ...GEMS_BERYL_LIMITS,
  ...GEMS_ONYX_LIMITS,
  ...DISCOVERY_SAVER_LIMITS,
  ...DISCOVERY_PRIORITY_LIMITS,
  ...MOMENTUM_LIMITS,
  ...BONITAS_BENEFIT_LIMITS,
  ...POLMED_LIMITS,
];

// ─── EXPORTS ──────────────────────────────────────────────────────────────────

/** Get benefit limits for a scheme + plan */
export function getBenefitLimits(schemeCode: string, plan?: string, category?: BenefitCategory): BenefitLimitRule[] {
  const upper = schemeCode.toUpperCase().trim();
  return ALL_BENEFIT_LIMIT_RULES.filter(r => {
    if (r.scheme.toUpperCase() !== upper) return false;
    if (plan && r.plan !== "*" && r.plan.toUpperCase() !== plan.toUpperCase()) return false;
    if (category && r.category !== category) return false;
    return true;
  });
}

/** Total benefit limit rule count */
export function getBenefitLimitRuleCount(): number {
  return ALL_BENEFIT_LIMIT_RULES.length;
}
