// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Extended Scheme Benefit Limits — Additional Schemes (2025-2026)
// Extracted from official scheme brochures:
//   - Medihelp Member Guide 2026 (52 pages, 10 options)
//   - CompCare 2025 Benefit Guide (45 pages, 7 options)
//   - Bankmed 2026 Benefit Enhancements (11 pages, 6 plans)
//   - PPS/Profmed 2025 Benefits at a Glance (8 pages, 5 options)
//   - Medshield MediCurve 2026 (4 pages)
//   - Fedhealth/Aon Alert 2026 (8 pages, flexiFED range)
//   - Remedi 2026 Benefit Brochure (58 pages, 3 options)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { ValidationSeverity } from "./types";
import type { BenefitLimitRule, BenefitCategory } from "./scheme-benefit-limits";

// ─── MEDIHELP BENEFIT LIMITS (2026) ─────────────────────────────────────────
// Source: Medihelp Member Guide 2026
// 10 options: MedMove! Student, MedMove!, MedVital Elect, MedVital, MedAdd Elect,
//             MedAdd, MedSaver, MedReach, MedPrime Elect, MedPrime, MedElite, MedPlus

export const MEDIHELP_LIMITS: BenefitLimitRule[] = [
  // ── Hospital ────────────────────────────────────────────────────────────
  { ruleId: "MED_HOSPITAL_ALL", scheme: "MED", plan: "*", category: "hospital", description: "Hospital: unlimited at 100% Medihelp tariff, pre-auth required. 20% co-payment if not pre-authorised", networkRequired: false, preAuthRequired: true, severity: "info", notes: "No overall annual limit on any plan. Network plans require network hospitals." },
  { ruleId: "MED_HOSPITAL_NETWORK_COPAY", scheme: "MED", plan: "MedVital Elect", category: "hospital", description: "Non-network hospital: 35% co-payment on hospital account (network plans)", coPaymentPercent: 35, networkRequired: true, preAuthRequired: true, severity: "error", notes: "Applies to MedVital Elect, MedAdd Elect, MedReach, MedPrime Elect, MedMove!." },
  { ruleId: "MED_DAY_PROC_COPAY", scheme: "MED", plan: "*", category: "hospital", description: "Day procedures outside day procedure facility: 35% co-payment", coPaymentPercent: 35, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Network plans must use day procedure network. Non-network plans must use a day procedure facility." },

  // ── Hospital on discharge medicine ──────────────────────────────────────
  { ruleId: "MED_MEDVITAL_DISCHARGE_MED", scheme: "MED", plan: "MedVital", category: "medicine_acute", description: "Hospital medicine on discharge: R440/admission", perEventLimitRands: 440, networkRequired: false, preAuthRequired: false, severity: "info", notes: "MedVital, MedVital Elect, MedAdd, MedAdd Elect, MedReach." },
  { ruleId: "MED_MEDPRIME_DISCHARGE_MED", scheme: "MED", plan: "MedPrime", category: "medicine_acute", description: "Hospital medicine on discharge: R570/admission", perEventLimitRands: 570, networkRequired: false, preAuthRequired: false, severity: "info", notes: "MedPrime and MedPrime Elect." },
  { ruleId: "MED_MEDELITE_DISCHARGE_MED", scheme: "MED", plan: "MedElite", category: "medicine_acute", description: "Hospital medicine on discharge: R630/admission", perEventLimitRands: 630, networkRequired: false, preAuthRequired: false, severity: "info", notes: "MedElite and MedPlus plans." },

  // ── Specialised radiology (MRI/CT) ─────────────────────────────────────
  { ruleId: "MED_MEDVITAL_SPEC_RAD", scheme: "MED", plan: "MedVital", category: "radiology", description: "Specialised radiology (MRI/CT): R20,000/family/year, R2,600 co-pay per exam", annualLimitRands: 20000, coPaymentRands: 2600, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "MedVital and MedVital Elect. Combined in- and out-of-hospital." },
  { ruleId: "MED_MEDADD_SPEC_RAD", scheme: "MED", plan: "MedAdd", category: "radiology", description: "Specialised radiology (MRI/CT): R22,000/family/year, R2,100 co-pay per exam", annualLimitRands: 22000, coPaymentRands: 2100, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "MedAdd and MedAdd Elect." },
  { ruleId: "MED_MEDSAVER_SPEC_RAD", scheme: "MED", plan: "MedSaver", category: "radiology", description: "Specialised radiology (MRI/CT): R30,000/family/year, R2,000 co-pay per exam", annualLimitRands: 30000, coPaymentRands: 2000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "MedSaver plan." },
  { ruleId: "MED_MEDREACH_SPEC_RAD", scheme: "MED", plan: "MedReach", category: "radiology", description: "Specialised radiology (MRI/CT): R22,000/family/year, R1,900 co-pay per exam", annualLimitRands: 22000, coPaymentRands: 1900, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "MedReach plan." },
  { ruleId: "MED_MEDPRIME_SPEC_RAD", scheme: "MED", plan: "MedPrime", category: "radiology", description: "Specialised radiology (MRI/CT): R35,000/family/year, R1,900 co-pay per exam", annualLimitRands: 35000, coPaymentRands: 1900, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "MedPrime and MedPrime Elect." },
  { ruleId: "MED_MEDELITE_SPEC_RAD", scheme: "MED", plan: "MedElite", category: "radiology", description: "Specialised radiology (MRI/CT): R40,000/family/year, R1,500 co-pay per exam", annualLimitRands: 40000, coPaymentRands: 1500, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "MedElite and MedPlus. Highest Medihelp radiology limit." },

  // ── Radiographer consultation fees ──────────────────────────────────────
  { ruleId: "MED_RADIOGRAPHER", scheme: "MED", plan: "*", category: "radiology", description: "Radiographer consultation fees: R1,365/family/year", annualLimitRands: 1365, networkRequired: false, preAuthRequired: false, severity: "info", notes: "All plans. Separate from radiology imaging limits." },

  // ── Post-hospital care ──────────────────────────────────────────────────
  { ruleId: "MED_POST_HOSP_CARE", scheme: "MED", plan: "*", category: "physiotherapy", description: "Post-hospital care (speech, OT, physio): M=R2,415, M+=R3,465/year, up to 30 days after discharge", annualLimitRands: 2415, networkRequired: false, preAuthRequired: true, severity: "info", notes: "All plans. Including after day procedure." },

  // ── Prostatectomy co-payment ────────────────────────────────────────────
  { ruleId: "MED_MEDVITAL_PROSTATECTOMY", scheme: "MED", plan: "MedVital", category: "hospital", description: "Prostatectomy: R8,240 co-payment per procedure", coPaymentRands: 8240, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "MedVital and MedReach. Robotic-assisted not covered on basic plans." },
  { ruleId: "MED_MEDADD_PROSTATECTOMY", scheme: "MED", plan: "MedAdd", category: "hospital", description: "Prostatectomy: R7,520 co-payment per procedure", coPaymentRands: 7520, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "MedAdd and MedSaver plans." },
  { ruleId: "MED_MEDPRIME_PROSTATECTOMY", scheme: "MED", plan: "MedPrime", category: "hospital", description: "Prostatectomy: unlimited, no co-payment", networkRequired: false, preAuthRequired: true, severity: "info", notes: "MedPrime, MedElite, MedPlus: no co-payment." },

  // ── Cornea implants ─────────────────────────────────────────────────────
  { ruleId: "MED_CORNEA_IMPLANT", scheme: "MED", plan: "*", category: "prosthesis", description: "Cornea implants: R37,600 per implant per year", perEventLimitRands: 37600, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "All plans." },

  // ── Day-to-day (MedVital — insured pooled) ─────────────────────────────
  { ruleId: "MED_MEDVITAL_D2D", scheme: "MED", plan: "MedVital", category: "day_to_day", description: "Day-to-day insured benefit: M=R1,575, M+=R3,045/year", annualLimitRands: 1575, networkRequired: false, preAuthRequired: false, severity: "info", notes: "GP/specialist visits, physio, virtual consults, medicine." },
  { ruleId: "MED_MEDVITAL_D2D_EXTRA", scheme: "MED", plan: "MedVital", category: "day_to_day", description: "Once day-to-day depleted: M=R2,100, M+=R4,200/year", annualLimitRands: 2100, networkRequired: false, preAuthRequired: false, severity: "info", notes: "GP/specialist visits, physio, virtual consults, medicine, radiology, pathology." },

  // ── Day-to-day (MedReach — insured) ────────────────────────────────────
  { ruleId: "MED_MEDREACH_D2D", scheme: "MED", plan: "MedReach", category: "day_to_day", description: "Insured day-to-day: M=R6,700, M+1=R9,950, M+2=R12,100, M+3=R13,300/year", annualLimitRands: 6700, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Network plan. Subject to overall annual limit (OAL)." },
  { ruleId: "MED_MEDREACH_RAD_PATH", scheme: "MED", plan: "MedReach", category: "radiology", description: "Radiology, pathology, med tech: R3,750/family/year within day-to-day", annualLimitRands: 3750, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Sub-limit within day-to-day benefit." },
  { ruleId: "MED_MEDREACH_SPECIALIST", scheme: "MED", plan: "MedReach", category: "specialist", description: "Specialist sub-limit: R1,575/family/year within day-to-day", annualLimitRands: 1575, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Sub-limit within day-to-day benefit." },
  { ruleId: "MED_MEDREACH_ACUTE_MED", scheme: "MED", plan: "MedReach", category: "medicine_acute", description: "Acute medicine: M=R1,575, M+1=R2,600, M+2+=R3,150/year", annualLimitRands: 1575, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Within day-to-day benefit." },
  { ruleId: "MED_MEDREACH_SELF_MED", scheme: "MED", plan: "MedReach", category: "medicine_otc", description: "Self-medication: M=R525, M+=R2,100/year", annualLimitRands: 525, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Within day-to-day benefit." },
  { ruleId: "MED_MEDREACH_GP_NETWORK", scheme: "MED", plan: "MedReach", category: "gp_consultation", description: "Network GP, clinical psychology, virtual care: M=R2,400, M+1=R4,450, M+2+=R5,150/year", annualLimitRands: 2400, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Subject to day-to-day benefit and OAL." },
  { ruleId: "MED_MEDREACH_GP_OON", scheme: "MED", plan: "MedReach", category: "gp_consultation", description: "Out-of-network GP: M=R1,470, M+=R2,940/year", annualLimitRands: 1470, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Subject to day-to-day benefit and OAL." },
  { ruleId: "MED_MEDREACH_PHYSIO", scheme: "MED", plan: "MedReach", category: "physiotherapy", description: "Physio and OT in/out of hospital: M=R2,600, M+=R4,095/year", annualLimitRands: 2600, networkRequired: false, preAuthRequired: false, severity: "info", notes: "In-hospital physio: unlimited." },

  // ── Day-to-day (MedPrime — savings + insured) ──────────────────────────
  { ruleId: "MED_MEDPRIME_D2D", scheme: "MED", plan: "MedPrime", category: "day_to_day", description: "Insured day-to-day: M=R7,550, M+=R13,900/year (after savings depleted)", annualLimitRands: 7550, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Separate comprehensive optometry and dentistry benefits." },

  // ── Day-to-day (MedElite — savings + insured) ──────────────────────────
  { ruleId: "MED_MEDELITE_D2D", scheme: "MED", plan: "MedElite", category: "day_to_day", description: "Insured day-to-day: M=R15,200, M+1=R17,700, M+2=R20,200, M+3+=R22,700/year", annualLimitRands: 15200, networkRequired: false, preAuthRequired: false, severity: "info", notes: "After 10% savings depleted. Includes GP/specialist, psychology, physio, medicine, radiology, pathology." },
  { ruleId: "MED_MEDELITE_GP_SPEC", scheme: "MED", plan: "MedElite", category: "gp_consultation", description: "GP/specialist sub-limit: M=R3,850, M+1=R5,000, M+2=R6,300, M+3+=R7,550/year", annualLimitRands: 3850, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Within insured day-to-day benefit." },
  { ruleId: "MED_MEDELITE_ACUTE_MED", scheme: "MED", plan: "MedElite", category: "medicine_acute", description: "Acute medicine: M=R5,000, M+1=R6,300, M+2=R7,550, M+3+=R8,850/year", annualLimitRands: 5000, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Within insured day-to-day benefit." },
  { ruleId: "MED_MEDELITE_RADIOLOGY", scheme: "MED", plan: "MedElite", category: "radiology", description: "Radiology (standard) sub-limit: R3,600/family/year", annualLimitRands: 3600, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Within insured day-to-day benefit." },
  { ruleId: "MED_MEDELITE_PATHOLOGY", scheme: "MED", plan: "MedElite", category: "pathology", description: "Pathology sub-limit: R3,600/family/year", annualLimitRands: 3600, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Within insured day-to-day benefit." },

  // ── Non-PMB chronic medicine ────────────────────────────────────────────
  { ruleId: "MED_MEDELITE_CHRONIC", scheme: "MED", plan: "MedElite", category: "chronic", description: "Non-PMB chronic medicine: M=R5,950, M+1=R8,950, M+2=R11,900, M+3+=R12,800/year", annualLimitRands: 5950, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "MedElite non-CDL chronic limit." },

  // ── Savings ─────────────────────────────────────────────────────────────
  { ruleId: "MED_MEDADD_SAVINGS", scheme: "MED", plan: "MedAdd", category: "savings", description: "Medical Savings Account: 15% of contribution (M=R7,272, A=R6,120, C=R2,448/year)", annualLimitRands: 7272, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Credit facility from day one. Unused funds carry over." },
  { ruleId: "MED_MEDSAVER_SAVINGS", scheme: "MED", plan: "MedSaver", category: "savings", description: "Medical Savings Account: 25% of contribution (M=R12,744, A=R10,512, C=R3,888/year)", annualLimitRands: 12744, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Highest savings percentage at Medihelp." },
  { ruleId: "MED_MEDPRIME_SAVINGS", scheme: "MED", plan: "MedPrime", category: "savings", description: "Medical Savings Account: 10% of contribution (M=R6,984, A=R5,904, C=R2,016/year)", annualLimitRands: 6984, networkRequired: false, preAuthRequired: false, severity: "info", notes: "SavingsBase and SavingsGrow accounts." },
  { ruleId: "MED_MEDELITE_SAVINGS", scheme: "MED", plan: "MedElite", category: "savings", description: "Medical Savings Account: 10% of contribution (M=R10,728, A=R10,008, C=R2,880/year)", annualLimitRands: 10728, networkRequired: false, preAuthRequired: false, severity: "info", notes: "SavingsBase and SavingsGrow accounts." },

  // ── Emergency transport ──────────────────────────────────────────────────
  { ruleId: "MED_EMS_DOMESTIC", scheme: "MED", plan: "*", category: "ambulance", description: "Emergency transport (road and air): unlimited within RSA via Netcare 911", networkRequired: true, preAuthRequired: true, severity: "info", notes: "50% co-payment if not pre-authorised. All plans." },
  { ruleId: "MED_EMS_FOREIGN_ROAD", scheme: "MED", plan: "*", category: "ambulance", description: "Emergency transport outside RSA (road): R2,600 per case", perEventLimitRands: 2600, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Outside beneficiary's country of residence." },
  { ruleId: "MED_EMS_FOREIGN_AIR", scheme: "MED", plan: "*", category: "ambulance", description: "Emergency transport outside RSA (air): R17,700 per case", perEventLimitRands: 17700, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Outside beneficiary's country of residence." },

  // ── Home delivery ───────────────────────────────────────────────────────
  { ruleId: "MED_HOME_DELIVERY", scheme: "MED", plan: "*", category: "maternity", description: "Home delivery: R17,100 per event, pre-auth required. 20% co-pay if not pre-authorised", perEventLimitRands: 17100, coPaymentPercent: 20, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Professional nursing fees, equipment, material and medicine." },

  // ── Renal dialysis ──────────────────────────────────────────────────────
  { ruleId: "MED_RENAL_DIALYSIS", scheme: "MED", plan: "*", category: "renal", description: "Renal dialysis: unlimited, 30% co-pay if non-DSP", coPaymentPercent: 30, networkRequired: true, preAuthRequired: true, severity: "info", notes: "All plans. Acute and chronic/peritoneal dialysis." },

  // ── Wound care ──────────────────────────────────────────────────────────
  { ruleId: "MED_WOUND_CARE", scheme: "MED", plan: "*", category: "wound_care", description: "Wound care: unlimited (nurse consultations and material)", networkRequired: false, preAuthRequired: false, severity: "info", notes: "All plans." },

  // ── Care extender benefit ───────────────────────────────────────────────
  { ruleId: "MED_CARE_EXTENDER_GP", scheme: "MED", plan: "*", category: "gp_consultation", description: "Care extender: 1 free GP consultation after completing health tests", visitLimit: 1, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: false, severity: "info", notes: "All plans. Unlocked by completing wellness health assessments." },
  { ruleId: "MED_CARE_EXTENDER_MED", scheme: "MED", plan: "*", category: "medicine_otc", description: "Care extender: R1,000 self-medication benefit after preventive combo screening", annualLimitRands: 1000, networkRequired: false, preAuthRequired: false, severity: "info", notes: "All plans. Unlocked by preventive combo screening." },

  // ── Occupational therapy ────────────────────────────────────────────────
  { ruleId: "MED_OT_LIMIT", scheme: "MED", plan: "*", category: "allied_health", description: "Occupational therapy: M=R2,600, M+1=R4,095/year (in and out of hospital)", annualLimitRands: 2600, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Separate from physiotherapy. All plans." },

  // ── GP referral changes for 2026 ────────────────────────────────────────
  { ruleId: "MED_NONNETWORK_GP_COPAY", scheme: "MED", plan: "MedVital Elect", category: "gp_consultation", description: "Non-network GP consultation: 35% co-payment (NEW 2026)", coPaymentPercent: 35, networkRequired: true, preAuthRequired: false, severity: "warning", notes: "MedVital Elect, MedAdd Elect, MedPrime Elect. GP referral for specialist no longer required on these plans." },

  // ── MedAdd depleted savings extra ───────────────────────────────────────
  { ruleId: "MED_MEDADD_DEPLETED", scheme: "MED", plan: "MedAdd", category: "day_to_day", description: "Once savings depleted: R2,600/family for GP, specialist, self-medication, acute medicine", annualLimitRands: 2600, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Activated when savings account is fully used." },
];

// ─── COMPCARE BENEFIT LIMITS (2025) ─────────────────────────────────────────
// Source: CompCare 2025 Benefit Guide
// 7 options: SelfCare+, SaverCare+, ExtraCare, UltraCare, UltraCare+, ExecuCare, ExecuCare+

export const COMPCARE_LIMITS: BenefitLimitRule[] = [
  // ── Hospital ────────────────────────────────────────────────────────────
  { ruleId: "CC_SELFCARE_HOSPITAL", scheme: "CC", plan: "SelfCare Plus", category: "hospital", description: "Hospital: unlimited at Netcare and Mediclinic hospitals", networkRequired: true, preAuthRequired: true, severity: "info", notes: "SelfCare: Netcare only. SelfCare Plus: Netcare or Mediclinic." },
  { ruleId: "CC_SAVERCARE_HOSPITAL", scheme: "CC", plan: "SaverCare Plus", category: "hospital", description: "Hospital: unlimited at any private hospital", networkRequired: false, preAuthRequired: true, severity: "info", notes: "SaverCare Corporate: Netcare or Mediclinic. SaverCare Plus: any private." },
  { ruleId: "CC_EXTRACARE_HOSPITAL", scheme: "CC", plan: "ExtraCare", category: "hospital", description: "Hospital: unlimited at Netcare and Mediclinic hospitals", networkRequired: true, preAuthRequired: true, severity: "info", notes: "ExtraCare network plan." },
  { ruleId: "CC_ULTRACARE_HOSPITAL", scheme: "CC", plan: "UltraCare Plus", category: "hospital", description: "Hospital: unlimited at any private hospital", networkRequired: false, preAuthRequired: true, severity: "info", notes: "UltraCare Plus: any. UltraCare: Netcare only." },
  { ruleId: "CC_EXECUCARE_HOSPITAL", scheme: "CC", plan: "ExecuCare Plus", category: "hospital", description: "Hospital: unlimited at any private hospital. Specialists at 150% scheme rate", networkRequired: false, preAuthRequired: true, severity: "info", notes: "ExecuCare Plus: any. ExecuCare: Netcare only." },
  { ruleId: "CC_NONNETWORK_COPAY", scheme: "CC", plan: "*", category: "hospital", description: "Non-network hospital: 35% co-payment on all associated costs", coPaymentPercent: 35, networkRequired: true, preAuthRequired: true, severity: "error", notes: "Applies to voluntary use of non-DSP/network hospital/facility." },

  // ── Hospital medicine on discharge ──────────────────────────────────────
  { ruleId: "CC_TTO_MED", scheme: "CC", plan: "*", category: "medicine_acute", description: "Medicine on discharge: limited to 7 days per discharge", daysLimit: 7, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Subject to Reference Pricing and formularies." },

  // ── Surgical prostheses ─────────────────────────────────────────────────
  { ruleId: "CC_SELFCARE_PROSTHESIS", scheme: "CC", plan: "SelfCare Plus", category: "prosthesis", description: "Surgical prostheses: R32,000/family overall limit", annualLimitRands: 32000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Sub-limits per category apply." },
  { ruleId: "CC_SAVERCARE_PROSTHESIS", scheme: "CC", plan: "SaverCare Plus", category: "prosthesis", description: "Surgical prostheses: R36,750/family overall limit", annualLimitRands: 36750, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Sub-limits per category apply." },
  { ruleId: "CC_EXTRACARE_PROSTHESIS", scheme: "CC", plan: "ExtraCare", category: "prosthesis", description: "Surgical prostheses: R42,000/family overall limit", annualLimitRands: 42000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Sub-limits per category apply." },
  { ruleId: "CC_ULTRACARE_PROSTHESIS", scheme: "CC", plan: "UltraCare", category: "prosthesis", description: "Surgical prostheses: R47,000/family overall limit", annualLimitRands: 47000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "UltraCare and UltraCare Plus." },
  { ruleId: "CC_EXECUCARE_PROSTHESIS", scheme: "CC", plan: "ExecuCare", category: "prosthesis", description: "Surgical prostheses: R60,000/family overall limit", annualLimitRands: 60000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "ExecuCare and ExecuCare Plus. Highest prosthesis limit." },

  // ── Specialised radiology ───────────────────────────────────────────────
  { ruleId: "CC_SELFCARE_SPEC_RAD", scheme: "CC", plan: "SelfCare Plus", category: "radiology", description: "Specialised radiology (MRI/CT): R23,000/family, R3,800 co-payment per scan", annualLimitRands: 23000, coPaymentRands: 3800, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Combined in- and out-of-hospital." },
  { ruleId: "CC_SAVERCARE_SPEC_RAD", scheme: "CC", plan: "SaverCare Plus", category: "radiology", description: "Specialised radiology (MRI/CT): R30,000/family, R3,800 co-payment per scan", annualLimitRands: 30000, coPaymentRands: 3800, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Combined in- and out-of-hospital." },
  { ruleId: "CC_EXTRACARE_SPEC_RAD", scheme: "CC", plan: "ExtraCare", category: "radiology", description: "Specialised radiology (MRI/CT): R30,000/family, R3,800 co-payment per scan", annualLimitRands: 30000, coPaymentRands: 3800, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Combined in- and out-of-hospital." },
  { ruleId: "CC_ULTRACARE_SPEC_RAD", scheme: "CC", plan: "UltraCare", category: "radiology", description: "Specialised radiology (MRI/CT): unlimited, R3,800 co-payment per scan", coPaymentRands: 3800, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "UltraCare and UltraCare Plus." },
  { ruleId: "CC_EXECUCARE_SPEC_RAD", scheme: "CC", plan: "ExecuCare", category: "radiology", description: "Specialised radiology (MRI/CT): unlimited, R3,800 co-payment per scan", coPaymentRands: 3800, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "ExecuCare and ExecuCare Plus." },

  // ── Day-to-day (savings/AFB) ────────────────────────────────────────────
  { ruleId: "CC_SELFCARE_D2D_SAVINGS", scheme: "CC", plan: "SelfCare Plus", category: "savings", description: "PMSA: R3,072 (principal), R3,072 (adult), R1,068 (child)/year", annualLimitRands: 3072, networkRequired: false, preAuthRequired: false, severity: "info", notes: "10% PMSA. Unlimited virtual consults." },
  { ruleId: "CC_SAVERCARE_D2D_AFB", scheme: "CC", plan: "SaverCare Plus", category: "day_to_day", description: "AFB (after PMSA): P=R4,809, A=R4,020, C=R1,446/year", annualLimitRands: 4809, networkRequired: false, preAuthRequired: false, severity: "info", notes: "15% PMSA first, then AFB." },
  { ruleId: "CC_EXTRACARE_D2D", scheme: "CC", plan: "ExtraCare", category: "day_to_day", description: "Day-to-Day Benefit: P=R6,700, A=R4,700, C=R2,400/year", annualLimitRands: 6700, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Extender Benefit: R6,700/beneficiary max R10,440/family for radiology/pathology/dentistry/physio." },
  { ruleId: "CC_EXTRACARE_EXTENDER", scheme: "CC", plan: "ExtraCare", category: "day_to_day", description: "Day-to-Day Extender Benefit: R6,700/beneficiary, max R10,440/family", annualLimitRands: 6700, networkRequired: false, preAuthRequired: false, severity: "info", notes: "For radiology, pathology, basic dentistry, physiotherapy and biokinetics." },
  { ruleId: "CC_EXTRACARE_OPTOMETRY", scheme: "CC", plan: "ExtraCare", category: "optical", description: "Optometry benefit: R6,500/family", annualLimitRands: 6500, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Separate from day-to-day benefit." },
  { ruleId: "CC_ULTRACARE_D2D_AFB", scheme: "CC", plan: "UltraCare", category: "day_to_day", description: "AFB: P=R16,000, A=R12,000, C=R4,600/year", annualLimitRands: 16000, networkRequired: false, preAuthRequired: false, severity: "info", notes: "ATB: R9,660/beneficiary max R17,200/family after threshold." },
  { ruleId: "CC_EXECUCARE_D2D_AFB", scheme: "CC", plan: "ExecuCare", category: "day_to_day", description: "AFB: P=R22,050, A=R16,800, C=R6,100/year", annualLimitRands: 22050, networkRequired: false, preAuthRequired: false, severity: "info", notes: "ATB: R11,250/beneficiary max R23,000/family after threshold." },

  // ── GP consultations ────────────────────────────────────────────────────
  { ruleId: "CC_SELFCARE_GP_COPAY", scheme: "CC", plan: "SelfCare Plus", category: "gp_consultation", description: "GP face-to-face: R100 co-payment per consultation (from PMSA). Pre-auth after 6th visit", coPaymentRands: 100, visitLimit: 6, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Unlimited virtual consults. Pre-auth from 7th visit." },
  { ruleId: "CC_SELFCARE_SPECIALIST", scheme: "CC", plan: "SelfCare Plus", category: "specialist", description: "Specialist: 2 consultations/family, max R2,260. R120 co-payment", annualLimitRands: 2260, visitLimit: 2, visitPeriodMonths: 12, coPaymentRands: 120, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "GP referral required. 35% co-payment without pre-auth." },

  // ── Chronic medicine ────────────────────────────────────────────────────
  { ruleId: "CC_CHRONIC_CDL_COPAY", scheme: "CC", plan: "*", category: "chronic", description: "CDL chronic: 25% co-payment for non-formulary medicine", coPaymentPercent: 25, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "All plans. DSP pharmacies apply on network options." },
  { ruleId: "CC_SELFCARE_DEPRESSION", scheme: "CC", plan: "SelfCare Plus", category: "chronic", description: "Non-CDL depression medicine: R160/beneficiary/month", perBeneficiaryLimit: 1920, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Only depression medicine on SelfCare. R160 x 12 = R1,920/year." },
  { ruleId: "CC_ULTRACARE_NONCDL", scheme: "CC", plan: "UltraCare", category: "chronic", description: "Non-CDL chronic: 38 conditions, R3,600/family limit from ATB", annualLimitRands: 3600, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "UltraCare and UltraCare Plus: 38 non-CDL conditions." },
  { ruleId: "CC_EXECUCARE_NONCDL", scheme: "CC", plan: "ExecuCare", category: "chronic", description: "Non-CDL chronic: 47 conditions, unlimited from ATB", networkRequired: true, preAuthRequired: true, severity: "info", notes: "ExecuCare and ExecuCare Plus: 47 non-CDL conditions." },

  // ── Acute medicine ──────────────────────────────────────────────────────
  { ruleId: "CC_SAVERCARE_ACUTE_MED", scheme: "CC", plan: "SaverCare Plus", category: "medicine_acute", description: "Acute medicine from AFB: R2,000/family", annualLimitRands: 2000, networkRequired: false, preAuthRequired: false, severity: "info", notes: "25% co-payment when no generic available. MMAP applies." },
  { ruleId: "CC_ULTRACARE_ACUTE_MED", scheme: "CC", plan: "UltraCare", category: "medicine_acute", description: "Acute medicine from ATB: R3,490/family subject to overall ATB", annualLimitRands: 3490, networkRequired: false, preAuthRequired: false, severity: "info", notes: "25% co-payment when no generic available." },

  // ── OTC medicine ────────────────────────────────────────────────────────
  { ruleId: "CC_ULTRACARE_OTC", scheme: "CC", plan: "UltraCare", category: "medicine_otc", description: "OTC medicine: R1,050/beneficiary, R1,500/family, max R240/event", annualLimitRands: 1050, networkRequired: false, preAuthRequired: false, severity: "info", notes: "1 prescription/day. UltraCare and UltraCare Plus." },
  { ruleId: "CC_EXECUCARE_OTC", scheme: "CC", plan: "ExecuCare", category: "medicine_otc", description: "OTC medicine: R1,250/beneficiary, R1,800/family, max R315/event", annualLimitRands: 1250, networkRequired: false, preAuthRequired: false, severity: "info", notes: "ExecuCare and ExecuCare Plus." },

  // ── Dental ──────────────────────────────────────────────────────────────
  { ruleId: "CC_ULTRACARE_DENTAL", scheme: "CC", plan: "UltraCare", category: "dental", description: "Conservative dentistry: R4,700/beneficiary from AFB", perBeneficiaryLimit: 4700, networkRequired: false, preAuthRequired: false, severity: "info", notes: "UltraCare and UltraCare Plus." },
  { ruleId: "CC_EXECUCARE_DENTAL", scheme: "CC", plan: "ExecuCare", category: "dental", description: "Conservative dentistry: R6,700/beneficiary from AFB", perBeneficiaryLimit: 6700, networkRequired: false, preAuthRequired: false, severity: "info", notes: "ExecuCare and ExecuCare Plus." },
  { ruleId: "CC_ULTRACARE_SPEC_DENT", scheme: "CC", plan: "UltraCare", category: "dental", description: "Specialised dentistry: R15,400/beneficiary, R20,800/family from AFB", annualLimitRands: 20800, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "UltraCare and UltraCare Plus." },
  { ruleId: "CC_EXECUCARE_SPEC_DENT", scheme: "CC", plan: "ExecuCare", category: "dental", description: "Specialised dentistry: R18,000/beneficiary, R24,000/family from AFB", annualLimitRands: 24000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "ExecuCare and ExecuCare Plus." },
  { ruleId: "CC_EXTRACARE_DENTAL_COPAY", scheme: "CC", plan: "ExtraCare", category: "dental", description: "Specialised dentistry: R2,080 co-payment applies", coPaymentRands: 2080, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "From Day-to-Day Benefit." },

  // ── Optical ─────────────────────────────────────────────────────────────
  { ruleId: "CC_EXTRACARE_OPTICAL_LENSES", scheme: "CC", plan: "ExtraCare", category: "optical", description: "Lenses/contacts: R1,140/beneficiary every 24 months within R6,500 optometry limit", perBeneficiaryLimit: 1140, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Frames: R650/beneficiary." },
  { ruleId: "CC_ULTRACARE_OPTICAL", scheme: "CC", plan: "UltraCare", category: "optical", description: "Lenses/contacts: R4,800/beneficiary, frames: R2,080. 2 visits/year", perBeneficiaryLimit: 4800, networkRequired: false, preAuthRequired: false, severity: "info", notes: "UltraCare and UltraCare Plus." },
  { ruleId: "CC_EXECUCARE_OPTICAL", scheme: "CC", plan: "ExecuCare", category: "optical", description: "Lenses/contacts: R5,900/beneficiary, frames: R3,000. 2 visits/year", perBeneficiaryLimit: 5900, networkRequired: false, preAuthRequired: false, severity: "info", notes: "ExecuCare and ExecuCare Plus." },

  // ── Mental health ───────────────────────────────────────────────────────
  { ruleId: "CC_MENTAL_HEALTH_INPATIENT", scheme: "CC", plan: "*", category: "mental_health", description: "Psychiatric treatment in hospital: 21 days admission OR 15 consultations", daysLimit: 21, visitLimit: 15, visitPeriodMonths: 12, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "All plans. PMB applies." },
  { ruleId: "CC_SELFCARE_PSYCH_NONHOSP", scheme: "CC", plan: "SelfCare Plus", category: "mental_health", description: "Psychology non-psychiatric (non-hospital): R2,190/family", annualLimitRands: 2190, networkRequired: false, preAuthRequired: true, severity: "info", notes: "In-hospital psychology sub-limit." },
  { ruleId: "CC_SAVERCARE_PSYCH_NONHOSP", scheme: "CC", plan: "SaverCare Plus", category: "mental_health", description: "Psychology non-psychiatric (non-hospital): R3,130/family", annualLimitRands: 3130, networkRequired: false, preAuthRequired: true, severity: "info", notes: "In-hospital psychology sub-limit." },
  { ruleId: "CC_EXTRACARE_PSYCH_NONHOSP", scheme: "CC", plan: "ExtraCare", category: "mental_health", description: "Psychology non-psychiatric (non-hospital): R4,470/family", annualLimitRands: 4470, networkRequired: false, preAuthRequired: true, severity: "info", notes: "In-hospital psychology sub-limit." },
  { ruleId: "CC_ULTRACARE_PSYCH", scheme: "CC", plan: "UltraCare", category: "mental_health", description: "Psychology: R3,100/family. Psychiatry: R13,050/family from AFB", annualLimitRands: 13050, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "UltraCare and UltraCare Plus." },
  { ruleId: "CC_EXECUCARE_PSYCH", scheme: "CC", plan: "ExecuCare", category: "mental_health", description: "Psychology: R6,260/family. Psychiatry: R22,960/family from AFB", annualLimitRands: 22960, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "ExecuCare and ExecuCare Plus." },
  { ruleId: "CC_PSYCHOSOCIAL", scheme: "CC", plan: "*", category: "mental_health", description: "Psychosocial counselling: unlimited telephonic + 3 referral sessions/beneficiary/year", visitLimit: 3, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Paid from risk. All plans." },

  // ── Allied health / physiotherapy ───────────────────────────────────────
  { ruleId: "CC_SELFCARE_ALLIED", scheme: "CC", plan: "SelfCare Plus", category: "allied_health", description: "Auxiliary services (physio, psychology etc): R3,000/family combined in/out hospital", annualLimitRands: 3000, networkRequired: false, preAuthRequired: true, severity: "info", notes: "20% co-payment if not pre-authorised." },
  { ruleId: "CC_EXTRACARE_PHYSIO", scheme: "CC", plan: "ExtraCare", category: "physiotherapy", description: "Physiotherapy and biokinetics: R5,000/family combined in/out hospital", annualLimitRands: 5000, networkRequired: false, preAuthRequired: true, severity: "info", notes: "From Day-to-Day Extender Benefit." },
  { ruleId: "CC_ULTRACARE_ALLIED", scheme: "CC", plan: "UltraCare", category: "allied_health", description: "Allied health: R8,800/family combined in/out hospital from AFB", annualLimitRands: 8800, networkRequired: false, preAuthRequired: true, severity: "info", notes: "UltraCare and UltraCare Plus." },
  { ruleId: "CC_EXECUCARE_ALLIED", scheme: "CC", plan: "ExecuCare", category: "allied_health", description: "Allied health: R12,500/family combined in/out hospital from AFB", annualLimitRands: 12500, networkRequired: false, preAuthRequired: true, severity: "info", notes: "ExecuCare and ExecuCare Plus." },

  // ── Home nursing ────────────────────────────────────────────────────────
  { ruleId: "CC_ULTRACARE_HOME_NURSE", scheme: "CC", plan: "UltraCare", category: "hospital", description: "Home nursing: 40 days/family from AFB", daysLimit: 40, networkRequired: false, preAuthRequired: true, severity: "info", notes: "UltraCare and UltraCare Plus." },
  { ruleId: "CC_EXECUCARE_HOME_NURSE", scheme: "CC", plan: "ExecuCare", category: "hospital", description: "Home nursing: 60 days/family from AFB", daysLimit: 60, networkRequired: false, preAuthRequired: true, severity: "info", notes: "ExecuCare and ExecuCare Plus." },

  // ── In-hospital pathology (ExtraCare) ───────────────────────────────────
  { ruleId: "CC_EXTRACARE_PATHOLOGY", scheme: "CC", plan: "ExtraCare", category: "pathology", description: "In-hospital pathology combined: R41,700/family", annualLimitRands: 41700, networkRequired: false, preAuthRequired: false, severity: "warning", notes: "Combined in- and out-of-hospital limit." },

  // ── Care Maximiser ──────────────────────────────────────────────────────
  { ruleId: "CC_CARE_MAXIMISER", scheme: "CC", plan: "*", category: "day_to_day", description: "Care Maximiser benefit: up to R26,000 (preventative + wellness R15,000)", annualLimitRands: 26000, networkRequired: false, preAuthRequired: false, severity: "info", notes: "All options. Worth up to R40,000 total with wellness." },
];

// ─── BANKMED ADDITIONAL LIMITS (2026 Benefit Enhancements) ──────────────────
// Source: Bankmed 2026 Benefit & Contribution Summary (beyond exclusions in main file)

export const BANKMED_ADDITIONAL_LIMITS: BenefitLimitRule[] = [
  // ── Plan structure ──────────────────────────────────────────────────────
  { ruleId: "BANK_ESSENTIAL_PMB_ONLY", scheme: "BANK", plan: "Essential", category: "hospital", description: "Essential Plan: PMB-only cover, restricted hospital network, 0% contribution increase 2026", networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Lowest Bankmed plan. 34 hospitals removed for 2026 (alternatives within 30km)." },
  { ruleId: "BANK_BASIC_PLAN", scheme: "BANK", plan: "Basic", category: "hospital", description: "Basic Plan: in-hospital and out-of-hospital benefits, restricted GP Entry Plan Network", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Low-contribution plan with chronic disease benefits." },

  // ── MSA changes (2026 enhancement) ─────────────────────────────────────
  { ruleId: "BANK_CORESAVER_MSA", scheme: "BANK", plan: "Core Saver", category: "savings", description: "Core Saver MSA: reduced to 10% of contribution (from 14.7%)", networkRequired: false, preAuthRequired: false, severity: "info", notes: "2026 enhancement to make plan more affordable." },
  { ruleId: "BANK_COMPREHENSIVE_MSA", scheme: "BANK", plan: "Comprehensive", category: "savings", description: "Comprehensive MSA: reduced to 15% of contribution (from 17%)", networkRequired: false, preAuthRequired: false, severity: "info", notes: "2026 enhancement to make plan more affordable." },
  { ruleId: "BANK_PLUS_MSA", scheme: "BANK", plan: "Plus", category: "savings", description: "Plus Plan MSA: reduced to 20% of contribution (from 22.5%). ATB threshold M=R25,700, A=R19,100, C=R6,300", networkRequired: false, preAuthRequired: false, severity: "info", notes: "2026 enhancement. MSA and Above Threshold Benefit." },

  // ── Network reimbursement (Traditional plan) ───────────────────────────
  { ruleId: "BANK_TRADITIONAL_NETWORK_GP", scheme: "BANK", plan: "Traditional", category: "gp_consultation", description: "Network GP/specialist: 100% Scheme Rate. Non-network: 80% Scheme Rate", coPaymentPercent: 20, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Traditional Plan network reimbursement rules." },

  // ── Dental enhancements (2026) ──────────────────────────────────────────
  { ruleId: "BANK_CHILDREN_DENTAL", scheme: "BANK", plan: "*", category: "dental", description: "NEW 2026: Children's preventative dental care (ages 3-17): check-ups, hygiene, polishing, fluoride", networkRequired: false, preAuthRequired: false, severity: "info", notes: "New benefit for 2026." },
  { ruleId: "BANK_WISDOM_TEETH_COPAY", scheme: "BANK", plan: "*", category: "dental", description: "NEW 2026: Wisdom teeth removal in dentist office: covered with pre-auth and co-payment", networkRequired: false, preAuthRequired: true, severity: "info", notes: "For impacted wisdom teeth." },

  // ── Cancer screening (2026) ─────────────────────────────────────────────
  { ruleId: "BANK_CANCER_SCREENING", scheme: "BANK", plan: "*", category: "hospital", description: "NEW 2026: At-home cancer screening kits for cervical and colorectal cancers", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Self-screening for early detection." },

  // ── Hearing (2026 enhancement) ──────────────────────────────────────────
  { ruleId: "BANK_COCHLEAR_INCREASE", scheme: "BANK", plan: "Traditional", category: "appliance", description: "Cochlear implant speech processor limits increased (Traditional, Comprehensive, Plus)", networkRequired: true, preAuthRequired: true, severity: "info", notes: "2026 enhancement across higher plans." },

  // ── Diabetes (2026 enhancement) ─────────────────────────────────────────
  { ruleId: "BANK_INSULIN_PUMP_EXPAND", scheme: "BANK", plan: "Core Saver", category: "chronic", description: "Insulin pump benefits expanded (Core Saver, Traditional, Comprehensive, Plus). Clinical motivation required", networkRequired: false, preAuthRequired: true, severity: "info", notes: "2026 enhancement for diabetes management." },

  // ── OHDTP management (2026) ─────────────────────────────────────────────
  { ruleId: "BANK_OHDTP_RULES", scheme: "BANK", plan: "*", category: "hospital", description: "2026: Stricter out-of-hospital PMB management (OHDTP). Non-PMB claims from day-to-day benefits", networkRequired: false, preAuthRequired: true, severity: "warning", notes: "PMB claims covered in full. Non-PMB from day-to-day benefits." },

  // ── Optometry ───────────────────────────────────────────────────────────
  { ruleId: "BANK_BASIC_OPTOMETRY", scheme: "BANK", plan: "Basic", category: "optical", description: "Optometry: Isoleso Optometry Network (Basic plan only)", networkRequired: true, preAuthRequired: false, severity: "info", notes: "Essential plan: no optometry benefit." },
];

// ─── PPS/PROFMED BENEFIT LIMITS (2025) ──────────────────────────────────────
// Source: PPS/Profmed 2025 Benefits at a Glance

export const PPS_LIMITS: BenefitLimitRule[] = [
  // ── Hospital ────────────────────────────────────────────────────────────
  { ruleId: "PPS_HOSPITAL_UNLIMITED", scheme: "PPS", plan: "*", category: "hospital", description: "Hospital: unlimited cover on all options", networkRequired: false, preAuthRequired: true, severity: "info", notes: "No co-payments for hospitalisation on Premium options (excluding ProSelect)." },
  { ruleId: "PPS_SAVVY_HOSP_COPAY", scheme: "PPS", plan: "Savvy", category: "hospital", description: "Savvy DSPN non-network: R12,500 co-payment", coPaymentRands: 12500, networkRequired: true, preAuthRequired: true, severity: "error", notes: "Savvy options require Designated Service Provider Network. Voluntary non-network = R12,500 co-pay." },
  { ruleId: "PPS_PROSELECT_HOSP_COPAY", scheme: "PPS", plan: "ProSelect", category: "hospital", description: "ProSelect DSPN non-network: R12,500 co-payment", coPaymentRands: 12500, networkRequired: true, preAuthRequired: true, severity: "error", notes: "ProSelect: Mediclinic, Life Healthcare, NHN, JMH hospitals." },
  { ruleId: "PPS_DAY_PROC_COPAY", scheme: "PPS", plan: "ProSecure Plus", category: "hospital", description: "Day Procedure Network non-network: R5,000 co-payment", coPaymentRands: 5000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "ProSecure Plus, ProSecure, ProActive Plus." },

  // ── Hospitalisation tariff rates ────────────────────────────────────────
  { ruleId: "PPS_PROPINNACLE_HOSP_RATE", scheme: "PPS", plan: "ProPinnacle", category: "hospital", description: "In-hospital doctors: 300% Profmed Tariff, private wards, maternity", networkRequired: false, preAuthRequired: true, severity: "info", notes: "Highest option. Full maternity in private wards." },
  { ruleId: "PPS_PROSECURE_PLUS_RATE", scheme: "PPS", plan: "ProSecure Plus", category: "hospital", description: "In-hospital doctors: 200% Profmed Tariff, maternity post-delivery private wards", networkRequired: false, preAuthRequired: true, severity: "info", notes: "ProSecure Plus option." },
  { ruleId: "PPS_PROACTIVE_PLUS_RATE", scheme: "PPS", plan: "ProActive Plus", category: "hospital", description: "In-hospital doctors: 175% Profmed Tariff, general ward maternity, in-hospital dentistry specific cases", networkRequired: false, preAuthRequired: true, severity: "info", notes: "ProActive Plus option." },
  { ruleId: "PPS_PROSELECT_RATE", scheme: "PPS", plan: "ProSelect", category: "hospital", description: "In-hospital doctors: Specific Tariff (120% procedures, R602 GP/R882 specialist consults)", networkRequired: true, preAuthRequired: true, severity: "info", notes: "ProSelect option. Day-to-day dentistry benefits only." },

  // ── Chronic conditions ──────────────────────────────────────────────────
  { ruleId: "PPS_PROPINNACLE_CHRONIC", scheme: "PPS", plan: "ProPinnacle", category: "chronic", description: "Chronic medication: 58 conditions, unlimited benefit", networkRequired: false, preAuthRequired: true, severity: "info", notes: "ProPinnacle and ProPinnacle Savvy. Includes DTPs." },
  { ruleId: "PPS_PROSECURE_CHRONIC", scheme: "PPS", plan: "ProSecure", category: "chronic", description: "Chronic medication: 39 conditions, benefit limit applies", networkRequired: false, preAuthRequired: true, severity: "warning", notes: "ProSecure, ProSecure Plus and Savvy equivalents." },
  { ruleId: "PPS_PROACTIVE_CHRONIC", scheme: "PPS", plan: "ProActive Plus", category: "chronic", description: "Chronic medication: 26 conditions per formulary and algorithm", networkRequired: false, preAuthRequired: true, severity: "warning", notes: "ProActive Plus, ProSelect and Savvy equivalents. Restricted to CDL conditions." },

  // ── International travel ────────────────────────────────────────────────
  { ruleId: "PPS_PROPINNACLE_TRAVEL", scheme: "PPS", plan: "ProPinnacle", category: "hospital", description: "International travel: R8M/beneficiary/journey, R10,000 out-of-hospital, R2,000 excess", perBeneficiaryLimit: 8000000, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Up to 150 days/journey. ProPinnacle and ProPinnacle Savvy." },
  { ruleId: "PPS_PROSECURE_TRAVEL", scheme: "PPS", plan: "ProSecure", category: "hospital", description: "International travel: R5M/beneficiary/journey, R10,000 out-of-hospital, R2,000 excess", perBeneficiaryLimit: 5000000, networkRequired: false, preAuthRequired: false, severity: "info", notes: "ProSecure, ProSecure Plus and Savvy equivalents." },
  { ruleId: "PPS_PROACTIVE_TRAVEL", scheme: "PPS", plan: "ProActive Plus", category: "hospital", description: "International travel: R2.5M/beneficiary/journey, no out-of-hospital cover", perBeneficiaryLimit: 2500000, networkRequired: false, preAuthRequired: false, severity: "info", notes: "ProActive Plus, ProSelect and Savvy equivalents." },

  // ── MRI/CT (ProActive Plus) ─────────────────────────────────────────────
  { ruleId: "PPS_PROACTIVE_MRI_CT", scheme: "PPS", plan: "ProActive Plus", category: "radiology", description: "Out-of-hospital MRI & CT: R6,000/family, 80% benefit from risk", annualLimitRands: 6000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "ProActive Plus only." },
  { ruleId: "PPS_PROPINNACLE_MRI_CT", scheme: "PPS", plan: "ProPinnacle", category: "radiology", description: "Out-of-hospital MRI & CT: 80% benefit paid from risk", networkRequired: false, preAuthRequired: true, severity: "info", notes: "ProPinnacle — no Rand limit." },

  // ── Dental ──────────────────────────────────────────────────────────────
  { ruleId: "PPS_DENTAL_RATE", scheme: "PPS", plan: "*", category: "dental", description: "Dentists paid at 135% Profmed Tariff on all options", networkRequired: false, preAuthRequired: false, severity: "info", notes: "All options with dental benefits." },

  // ── Day-to-day (Specific Tariff) ────────────────────────────────────────
  { ruleId: "PPS_SPECIFIC_TARIFF", scheme: "PPS", plan: "ProSecure Plus", category: "gp_consultation", description: "Day-to-day consultations: Specific Tariff (120% procedures, R602 GP, R882 specialist)", networkRequired: false, preAuthRequired: false, severity: "info", notes: "ProSecure Plus, ProSecure, ProActive Plus, ProSelect." },

  // ── Maternity (ProActive Plus) ──────────────────────────────────────────
  { ruleId: "PPS_PROACTIVE_MATERNITY", scheme: "PPS", plan: "ProActive Plus", category: "maternity", description: "Maternity: 6 ante-natal consults, 2 2D scans, 2 GP/paediatrician consults, pathology", visitLimit: 6, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: false, severity: "info", notes: "From risk. ProActive Plus and ProActive Plus Savvy." },

  // ── Sabbatical benefit ──────────────────────────────────────────────────
  { ruleId: "PPS_SABBATICAL", scheme: "PPS", plan: "*", category: "hospital", description: "Sabbatical benefit: up to 3 years, no underwriting on return", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Available after 1 year membership. On return, available again after 1 year." },

  // ── Wellness benefit enhancer (NEW) ─────────────────────────────────────
  { ruleId: "PPS_WELLNESS_ENHANCER", scheme: "PPS", plan: "*", category: "day_to_day", description: "Wellness benefit enhancer: R2,500 extra for out-of-hospital consultations after completing screenings", annualLimitRands: 2500, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Complete preventative care screenings to unlock. Subject to qualifying criteria." },
];

// ─── MEDSHIELD MEDICURVE BENEFIT LIMITS (2026) ──────────────────────────────
// Source: Medshield MediCurve 2026 Benefit Guide

export const MEDSHIELD_MEDICURVE_LIMITS: BenefitLimitRule[] = [
  // ── Hospital ────────────────────────────────────────────────────────────
  { ruleId: "MS_MC_HOSPITAL", scheme: "MS", plan: "MediCurve", category: "hospital", description: "Hospital limit: unlimited (increased from limited for 2026)", networkRequired: true, preAuthRequired: true, severity: "info", notes: "MediCurve 2026 enhancement. 20% penalty for no pre-auth." },
  { ruleId: "MS_MC_NONNETWORK_HOSP", scheme: "MS", plan: "MediCurve", category: "hospital", description: "Non-Compact Network Hospital: 30% upfront co-payment", coPaymentPercent: 30, networkRequired: true, preAuthRequired: true, severity: "error", notes: "Also applies to organ/tissue transplant and mental health." },

  // ── Physical rehabilitation ─────────────────────────────────────────────
  { ruleId: "MS_MC_PHYS_REHAB", scheme: "MS", plan: "MediCurve", category: "physiotherapy", description: "Physical rehabilitation: R35,500/family (increased 2026)", annualLimitRands: 35500, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Alternative to hospitalisation." },

  // ── Terminal care ───────────────────────────────────────────────────────
  { ruleId: "MS_MC_TERMINAL_CARE", scheme: "MS", plan: "MediCurve", category: "hospital", description: "Terminal care benefit: R31,350/family (increased 2026)", annualLimitRands: 31350, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Alternative to hospitalisation." },

  // ── Virtual care ────────────────────────────────────────────────────────
  { ruleId: "MS_MC_VIRTUAL_GP", scheme: "MS", plan: "MediCurve", category: "gp_consultation", description: "NEW 2026: Virtual GP care: unlimited (Network GP)", networkRequired: true, preAuthRequired: false, severity: "info", notes: "New benefit for 2026." },

  // ── Maxillo-facial surgery ──────────────────────────────────────────────
  { ruleId: "MS_MC_MAXFAC", scheme: "MS", plan: "MediCurve", category: "dental", description: "Maxillo-facial surgery: R6,450/family (increased 2026)", annualLimitRands: 6450, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "R4,000 co-payment for the procedure." },

  // ── Acute medicine ──────────────────────────────────────────────────────
  { ruleId: "MS_MC_ACUTE_MED_M0", scheme: "MS", plan: "MediCurve", category: "medicine_acute", description: "Acute medicine (network GP): M0=R700, M1=R1,400, M2+=R1,800/year", annualLimitRands: 700, networkRequired: true, preAuthRequired: false, severity: "info", notes: "When prescribed by Network GP. Increased for 2026." },

  // ── Pharmacy advised therapy ────────────────────────────────────────────
  { ruleId: "MS_MC_PHARMACY_OTC", scheme: "MS", plan: "MediCurve", category: "medicine_otc", description: "Pharmacy Advised Therapy: R550/family (increased 2026)", annualLimitRands: 550, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Over-the-counter type benefit." },

  // ── Mental health ───────────────────────────────────────────────────────
  { ruleId: "MS_MC_MENTAL_MED", scheme: "MS", plan: "MediCurve", category: "mental_health", description: "Mental health medicine: R5,850/beneficiary (increased 2026)", perBeneficiaryLimit: 5850, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Per beneficiary limit." },

  // ── Oncology ────────────────────────────────────────────────────────────
  { ruleId: "MS_MC_BREAST_RECON", scheme: "MS", plan: "MediCurve", category: "oncology", description: "Breast reconstruction: R105,000/family (increased 2026)", annualLimitRands: 105000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Oncology benefit." },

  // ── Optical ─────────────────────────────────────────────────────────────
  { ruleId: "MS_MC_OPTICAL_LIMIT", scheme: "MS", plan: "MediCurve", category: "optical", description: "Optical: R1,900/beneficiary per 24-month cycle (increased 2026)", perBeneficiaryLimit: 1900, networkRequired: false, preAuthRequired: false, severity: "info", notes: "1 eye test/year. 1 pair lenses/beneficiary." },
  { ruleId: "MS_MC_OPTICAL_FRAME", scheme: "MS", plan: "MediCurve", category: "optical", description: "Frames: R750/beneficiary (increased 2026)", perBeneficiaryLimit: 750, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Within optical benefit." },
  { ruleId: "MS_MC_OPTICAL_READERS", scheme: "MS", plan: "MediCurve", category: "optical", description: "Readers: R220/beneficiary (increased 2026)", perBeneficiaryLimit: 220, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Within optical benefit." },

  // ── Radiology ───────────────────────────────────────────────────────────
  { ruleId: "MS_MC_SPEC_RADIOLOGY", scheme: "MS", plan: "MediCurve", category: "radiology", description: "Specialised radiology: R6,450/family (increased 2026)", annualLimitRands: 6450, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "In- and out-of-hospital." },

  // ── Wellness ────────────────────────────────────────────────────────────
  { ruleId: "MS_MC_MAMMOGRAM", scheme: "MS", plan: "MediCurve", category: "hospital", description: "NEW 2026: Mammogram (breast screening): 1/year for females 30+ years", visitLimit: 1, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: false, severity: "info", notes: "New wellness screening benefit." },
  { ruleId: "MS_MC_PSA", scheme: "MS", plan: "MediCurve", category: "hospital", description: "PSA screening: 1/year for males 40+ years", visitLimit: 1, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Enhanced wellness benefit." },

  // ── Co-payments ─────────────────────────────────────────────────────────
  { ruleId: "MS_MC_DENTAL_COPAY", scheme: "MS", plan: "MediCurve", category: "dental", description: "Dental consultation: R150 upfront co-payment", coPaymentRands: 150, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Per consultation." },
  { ruleId: "MS_MC_OPTICAL_TEST_COPAY", scheme: "MS", plan: "MediCurve", category: "optical", description: "Optical test: R100 upfront co-payment", coPaymentRands: 100, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Per eye test." },
  { ruleId: "MS_MC_SPECIALIST_COPAY", scheme: "MS", plan: "MediCurve", category: "specialist", description: "Specialist consultation: R250 upfront co-payment", coPaymentRands: 250, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Per consultation." },
  { ruleId: "MS_MC_SPECIALIST_NOREFERRAL", scheme: "MS", plan: "MediCurve", category: "specialist", description: "Specialist without GP referral: 20% upfront co-payment", coPaymentPercent: 20, networkRequired: true, preAuthRequired: false, severity: "warning", notes: "Must have referral from MediCurve Network GP." },
  { ruleId: "MS_MC_NONNETWORK_GP_COPAY", scheme: "MS", plan: "MediCurve", category: "gp_consultation", description: "Non-network GP: 40% upfront co-payment", coPaymentPercent: 40, networkRequired: true, preAuthRequired: false, severity: "warning", notes: "Must use MediCurve Network GP." },
  { ruleId: "MS_MC_NONDSP_CHRONIC_COPAY", scheme: "MS", plan: "MediCurve", category: "chronic", description: "Non-DSP chronic medication: 20% upfront co-payment", coPaymentPercent: 20, networkRequired: true, preAuthRequired: false, severity: "warning", notes: "Must use DSP pharmacy." },
  { ruleId: "MS_MC_NONDSP_ONCOLOGY_COPAY", scheme: "MS", plan: "MediCurve", category: "oncology", description: "Non-ICON oncology provider: 40% upfront co-payment", coPaymentPercent: 40, networkRequired: true, preAuthRequired: true, severity: "error", notes: "Must use ICON network for oncology." },
  { ruleId: "MS_MC_NONDSP_DIALYSIS_COPAY", scheme: "MS", plan: "MediCurve", category: "renal", description: "Non-DSP renal dialysis: 35% upfront co-payment", coPaymentPercent: 35, networkRequired: true, preAuthRequired: true, severity: "error", notes: "Must use DSP for dialysis." },
  { ruleId: "MS_MC_NONDSP_HIV_COPAY", scheme: "MS", plan: "MediCurve", category: "chronic", description: "Non-DSP HIV/AIDS medication: 30% upfront co-payment", coPaymentPercent: 30, networkRequired: true, preAuthRequired: false, severity: "warning", notes: "Must use DSP pharmacy." },
  { ruleId: "MS_MC_PET_SCAN_COPAY", scheme: "MS", plan: "MediCurve", category: "radiology", description: "Non-DSP PET scan: 25% upfront co-payment", coPaymentPercent: 25, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Must use DSP for PET scans." },

  // ── Procedural co-payments ──────────────────────────────────────────────
  { ruleId: "MS_MC_WISDOM_TEETH_COPAY", scheme: "MS", plan: "MediCurve", category: "dental", description: "Wisdom teeth extraction (day clinic): R1,800 upfront co-payment", coPaymentRands: 1800, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Non-PMB procedural co-payment." },
  { ruleId: "MS_MC_ENDOSCOPY_COPAY", scheme: "MS", plan: "MediCurve", category: "hospital", description: "Endoscopic procedures: R2,000 upfront co-payment (no co-pay for children <=8)", coPaymentRands: 2000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Non-PMB procedural co-payment." },
  { ruleId: "MS_MC_ORAL_SURGERY_COPAY", scheme: "MS", plan: "MediCurve", category: "dental", description: "Oral surgery / impacted teeth / maxillo-facial: R4,000 upfront co-payment", coPaymentRands: 4000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Non-PMB procedural co-payment." },
  { ruleId: "MS_MC_HYSTERECTOMY_COPAY", scheme: "MS", plan: "MediCurve", category: "hospital", description: "Hysterectomy: R5,000 upfront co-payment", coPaymentRands: 5000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Non-PMB procedural co-payment." },
  { ruleId: "MS_MC_ELECTIVE_CAESAR_COPAY", scheme: "MS", plan: "MediCurve", category: "maternity", description: "Elective caesarean: R10,000 upfront co-payment", coPaymentRands: 10000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Non-PMB procedural co-payment." },
  { ruleId: "MS_MC_NONNETWORK_EMERGENCY_GP", scheme: "MS", plan: "MediCurve", category: "gp_consultation", description: "Non-network emergency GP after 2 allocated visits: 40% co-payment", coPaymentPercent: 40, visitLimit: 2, visitPeriodMonths: 12, networkRequired: true, preAuthRequired: false, severity: "warning", notes: "Applies once the 2 non-network emergency visits are depleted." },
];

// ─── FEDHEALTH BENEFIT LIMITS (2026) ────────────────────────────────────────
// Source: Fedhealth Aon Alert 2026

export const FEDHEALTH_LIMITS: BenefitLimitRule[] = [
  // ── Day 2 Day Plus (NEW 2026) ───────────────────────────────────────────
  { ruleId: "FH_FLEXIFED1_D2D_PLUS", scheme: "FH", plan: "flexiFED 1", category: "day_to_day", description: "NEW D2D+ benefit: R3,000/family/year (unlock via Health Risk Assessment + Sanlam Health Rewards)", annualLimitRands: 3000, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Covers GP consults, specialist consults, basic dentistry, prescribed medicine, pathology, general radiology." },
  { ruleId: "FH_FLEXIFED2_D2D_PLUS", scheme: "FH", plan: "flexiFED 2", category: "day_to_day", description: "NEW D2D+ benefit: R3,500/family/year", annualLimitRands: 3500, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Same coverage as flexiFED 1 D2D+." },
  { ruleId: "FH_FLEXIFED3_D2D_PLUS", scheme: "FH", plan: "flexiFED 3", category: "day_to_day", description: "NEW D2D+ benefit: R4,000/family/year", annualLimitRands: 4000, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Same coverage as flexiFED 1 D2D+." },
  { ruleId: "FH_FLEXIFED4_D2D_PLUS", scheme: "FH", plan: "flexiFED 4", category: "day_to_day", description: "NEW D2D+ benefit: R4,500/family/year", annualLimitRands: 4500, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Highest D2D+ tier." },

  // ── Maternity (flexiFED 1 — NEW) ────────────────────────────────────────
  { ruleId: "FH_FLEXIFED1_MATERNITY", scheme: "FH", plan: "flexiFED 1", category: "maternity", description: "NEW: Out-of-hospital maternity: 2x 2D scans, 6 ante/post-natal consults, 1 amniocentesis, antenatal classes/doula", visitLimit: 6, visitPeriodMonths: 12, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Network GP or gynaecologist." },

  // ── Mental health ───────────────────────────────────────────────────────
  { ruleId: "FH_SAVVY_DEPRESSION_MED", scheme: "FH", plan: "flexiFED Savvy", category: "mental_health", description: "Depression medication out-of-hospital: R2,160/beneficiary/year", perBeneficiaryLimit: 2160, networkRequired: false, preAuthRequired: true, severity: "info", notes: "NEW 2026. flexiFED Savvy only." },
  { ruleId: "FH_FLEXIFED12_DEPRESSION_MED", scheme: "FH", plan: "flexiFED 1", category: "mental_health", description: "Depression medication out-of-hospital: R2,400/beneficiary/year", perBeneficiaryLimit: 2400, networkRequired: false, preAuthRequired: true, severity: "info", notes: "NEW 2026. flexiFED 1 and flexiFED 2." },

  // ── Female contraceptives ───────────────────────────────────────────────
  { ruleId: "FH_EMERGENCY_CONTRACEPTION", scheme: "FH", plan: "*", category: "contraceptive", description: "Emergency contraception: 1/year for females up to age 55, paid from risk", visitLimit: 1, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: false, severity: "info", notes: "All options. NEW 2026." },

  // ── Vaccinations ────────────────────────────────────────────────────────
  { ruleId: "FH_PNEUMOCOCCAL_65", scheme: "FH", plan: "*", category: "hospital", description: "Additional Pneumococcal vaccination for members 65+ years", visitLimit: 1, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: false, severity: "info", notes: "All options except myFED and flexiFED Savvy." },

  // ── Oncology ────────────────────────────────────────────────────────────
  { ruleId: "FH_FLEXIFED4_BRACHYTHERAPY", scheme: "FH", plan: "flexiFED 4", category: "oncology", description: "Brachytherapy: R62,100/year (25% increase for 2026)", annualLimitRands: 62100, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "flexiFED 4 only." },

  // ── Self-payment gap removal ────────────────────────────────────────────
  { ruleId: "FH_SPG_REMOVAL", scheme: "FH", plan: "flexiFED 1", category: "day_to_day", description: "Self-payment gap REMOVED (2026): unlimited network GP with 20% co-pay + dental after savings depleted", coPaymentPercent: 20, networkRequired: true, preAuthRequired: false, severity: "info", notes: "flexiFED 1, 2, and 3. Previously had SPG." },

  // ── Prosthesis ──────────────────────────────────────────────────────────
  { ruleId: "FH_FLEXIFED12_PROSTHESIS", scheme: "FH", plan: "flexiFED 1", category: "prosthesis", description: "Internal non-PMB prosthesis: R1,220/family/year", annualLimitRands: 1220, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "flexiFED 1 and flexiFED 2. NEW 2026 limit." },

  // ── Co-payment changes ──────────────────────────────────────────────────
  { ruleId: "FH_COPAY_RESTRUCTURE", scheme: "FH", plan: "myFED", category: "hospital", description: "Co-payment restructured to 30% (from fixed Rand value)", coPaymentPercent: 30, networkRequired: false, preAuthRequired: false, severity: "warning", notes: "myFED, flexiFED Savvy, flexiFED 1, Grid options." },

  // ── Elect options excess ────────────────────────────────────────────────
  { ruleId: "FH_ELECT_EXCESS", scheme: "FH", plan: "Elect", category: "hospital", description: "Non-emergency in-hospital excess: R15,950 (increased from R15,470)", coPaymentRands: 15950, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "All Elect options." },

  // ── Benefit limit increase ──────────────────────────────────────────────
  { ruleId: "FH_LIMIT_INCREASE_2026", scheme: "FH", plan: "*", category: "hospital", description: "Average 3.1% benefit limit increase on all options for 2026", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Fixed savings increased 7-56% depending on option and family size." },

  // ── Chronic DSP ─────────────────────────────────────────────────────────
  { ruleId: "FH_CHRONIC_DSP", scheme: "FH", plan: "*", category: "chronic", description: "Chronic medication: Scriptpharm Network Pharmacies as DSP (2026)", networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Formulary updated for 2026." },
];

// ─── REMEDI BENEFIT LIMITS (2026) ───────────────────────────────────────────
// Source: Remedi 2026 Benefit Brochure
// 3 options: Comprehensive, Classic, Standard

export const REMEDI_LIMITS: BenefitLimitRule[] = [
  // ── Hospital / OAL ──────────────────────────────────────────────────────
  { ruleId: "REMEDI_COMP_HOSPITAL", scheme: "REMEDI", plan: "Comprehensive", category: "hospital", description: "Hospital: unlimited. PMSA available for day-to-day. Extra GP visits when IOH + PMSA depleted", networkRequired: false, preAuthRequired: true, severity: "info", notes: "Administered by Discovery Health. R3,550 co-pay if not pre-authorised." },
  { ruleId: "REMEDI_CLASSIC_HOSPITAL", scheme: "REMEDI", plan: "Classic", category: "hospital", description: "Hospital: R2,675,000/family/year overall annual limit", annualLimitRands: 2675000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "R3,550 co-pay if not pre-authorised." },
  { ruleId: "REMEDI_STANDARD_HOSPITAL", scheme: "REMEDI", plan: "Standard", category: "hospital", description: "Hospital: R800,000/family/year overall annual limit", annualLimitRands: 800000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "DSP and network required. R3,550 co-pay if not pre-authorised." },
  { ruleId: "REMEDI_PREAUTH_COPAY", scheme: "REMEDI", plan: "*", category: "hospital", description: "No pre-authorisation: R3,550 co-payment per admission", coPaymentRands: 3550, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "All plans." },
  { ruleId: "REMEDI_DAY_SURGERY_COPAY", scheme: "REMEDI", plan: "*", category: "hospital", description: "Acute hospital instead of Day Surgery Network: R7,250 deductible", coPaymentRands: 7250, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "When recommended for Day Surgery Network facility." },

  // ── IOH day-to-day sub-limits ───────────────────────────────────────────
  { ruleId: "REMEDI_COMP_IOH", scheme: "REMEDI", plan: "Comprehensive", category: "day_to_day", description: "IOH sub-limit: M=R13,830, A=R8,160, C=R2,300 (max 3 children). Excludes specialised dentistry and optical", annualLimitRands: 13830, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Once depleted, non-PMB from PMSA." },
  { ruleId: "REMEDI_CLASSIC_IOH", scheme: "REMEDI", plan: "Classic", category: "day_to_day", description: "IOH sub-limit: M=R12,260, A=R7,230, C=R2,040 (max 3 children). Includes specialised dentistry and optical", annualLimitRands: 12260, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Once depleted, member pays from own pocket." },
  { ruleId: "REMEDI_STANDARD_IOH", scheme: "REMEDI", plan: "Standard", category: "day_to_day", description: "IOH sub-limit: M=R4,040, A=R2,540, C=R820 (max 3 children). Specialists and casualty only", annualLimitRands: 4040, networkRequired: true, preAuthRequired: false, severity: "warning", notes: "GP unlimited at Remedi Standard Option Network GP. OOA: 3 visits, R2,300/family/year." },

  // ── Extra GP visits (Comprehensive) ─────────────────────────────────────
  { ruleId: "REMEDI_COMP_EXTRA_GP", scheme: "REMEDI", plan: "Comprehensive", category: "gp_consultation", description: "Extra GP visits once IOH + PMSA depleted: M=3, Family=6 at Network GP", visitLimit: 3, visitPeriodMonths: 12, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Paid from hospital benefit. Pathology excluded." },

  // ── Standard GP Network ─────────────────────────────────────────────────
  { ruleId: "REMEDI_STANDARD_GP", scheme: "REMEDI", plan: "Standard", category: "gp_consultation", description: "Network GP: unlimited consultations and minor procedures. OOA: 3 visits, R2,300/family", visitLimit: 3, visitPeriodMonths: 12, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Out-of-area benefit for non-network GP." },

  // ── Chronic medicine ────────────────────────────────────────────────────
  { ruleId: "REMEDI_COMP_ADL", scheme: "REMEDI", plan: "Comprehensive", category: "chronic", description: "ADL chronic medicine: R2,725/person/month + Specialised Medicine Benefit R210,000/person/year", perBeneficiaryLimit: 32700, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Additional Disease List. Including non-PMB treatment and bariatric surgery." },
  { ruleId: "REMEDI_CLASSIC_ADL", scheme: "REMEDI", plan: "Classic", category: "chronic", description: "ADL chronic medicine: R2,275/person/month", perBeneficiaryLimit: 27300, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Lower than Comprehensive." },
  { ruleId: "REMEDI_STANDARD_CHRONIC", scheme: "REMEDI", plan: "Standard", category: "chronic", description: "Chronic medicine: PMB/CDL only. 20% co-payment at non-DSP pharmacy", coPaymentPercent: 20, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "No ADL conditions covered on Standard." },

  // ── Oral contraceptives ─────────────────────────────────────────────────
  { ruleId: "REMEDI_CONTRACEPTIVE", scheme: "REMEDI", plan: "*", category: "contraceptive", description: "Oral contraceptives: R205/prescription, R2,870/year per female. 20% co-pay at non-DSP", annualLimitRands: 2870, coPaymentPercent: 20, networkRequired: true, preAuthRequired: false, severity: "info", notes: "All plans. DSP pharmacies preferred." },

  // ── OTC medicine (Standard) ─────────────────────────────────────────────
  { ruleId: "REMEDI_STANDARD_OTC", scheme: "REMEDI", plan: "Standard", category: "medicine_otc", description: "OTC medicine (Schedule 0, 1, 2): R205/prescription, R420/person/year from hospital benefit", annualLimitRands: 420, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Standard option only. From hospital benefit." },

  // ── Oncology ────────────────────────────────────────────────────────────
  { ruleId: "REMEDI_COMP_ONCOLOGY", scheme: "REMEDI", plan: "Comprehensive", category: "oncology", description: "Oncology: 100% Remedi Rate over 12-month cycle. After limit, 80% up to yearly limit. Innovation Benefit available", networkRequired: true, preAuthRequired: true, severity: "warning", notes: "25% co-pay on innovative cancer medicine. ICON Network providers. Oncology pharmacy DSP required." },
  { ruleId: "REMEDI_STANDARD_ONCOLOGY", scheme: "REMEDI", plan: "Standard", category: "oncology", description: "Oncology: PMB conditions only over 12-month cycle", networkRequired: true, preAuthRequired: true, severity: "warning", notes: "PMB-only coverage on Standard." },

  // ── Mental health ───────────────────────────────────────────────────────
  { ruleId: "REMEDI_MENTAL_HEALTH_NETWORK", scheme: "REMEDI", plan: "*", category: "mental_health", description: "Mental Health Network: no co-payments at network psychologists/social workers/counsellors", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Non-network: paid at Scheme Rate, member pays difference." },

  // ── PMB hospital network ────────────────────────────────────────────────
  { ruleId: "REMEDI_PMB_HOSP_NETWORK", scheme: "REMEDI", plan: "*", category: "hospital", description: "PMB Hospital Network: Mediclinic hospitals — full cover, no co-payments at DSP", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Non-DSP: paid at Scheme Rate, member responsible for difference." },

  // ── Specialised medicine and bariatric ───────────────────────────────────
  { ruleId: "REMEDI_COMP_SPEC_MED", scheme: "REMEDI", plan: "Comprehensive", category: "chronic", description: "Specialised Medicine & Bariatric Surgery Benefit: R210,000/person/year", perBeneficiaryLimit: 210000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "High-cost medicines and bariatric surgery. Comprehensive only." },

  // ── Advanced illness benefit ────────────────────────────────────────────
  { ruleId: "REMEDI_ADV_ILLNESS", scheme: "REMEDI", plan: "*", category: "hospital", description: "Advanced Illness Benefit: unlimited palliative care at home, care coordination, counselling", networkRequired: false, preAuthRequired: true, severity: "info", notes: "All plans. Includes Epilog digital tool." },

  // ── Day Surgery Network ─────────────────────────────────────────────────
  { ruleId: "REMEDI_DAY_SURGERY", scheme: "REMEDI", plan: "*", category: "hospital", description: "Day Surgery Network: full cover for defined list of procedures. Non-network: R7,250 deductible", coPaymentRands: 7250, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "All plans. Must use Day Surgery Network to avoid deductible." },

  // ── Dentistry (Standard) ────────────────────────────────────────────────
  { ruleId: "REMEDI_STANDARD_DENTAL", scheme: "REMEDI", plan: "Standard", category: "dental", description: "Dentistry managed by Dental Risk Company (DRC). Basic benefits only", networkRequired: true, preAuthRequired: false, severity: "info", notes: "Standard only. Comprehensive and Classic have basic + specialised." },

  // ── Optical ─────────────────────────────────────────────────────────────
  { ruleId: "REMEDI_OPTICAL_PPN", scheme: "REMEDI", plan: "*", category: "optical", description: "Optical managed by PPN (Preferred Provider Negotiators). Co-payments for non-PPN", networkRequired: true, preAuthRequired: false, severity: "info", notes: "All plans. Subject to IOH limits on Comprehensive and Classic." },

  // ── Emergency services ──────────────────────────────────────────────────
  { ruleId: "REMEDI_EMS", scheme: "REMEDI", plan: "*", category: "ambulance", description: "Emergency transport via ER24 (dial 084 124): covered for all plans", networkRequired: true, preAuthRequired: false, severity: "info", notes: "All plans. Includes trauma support and GBV counselling." },

  // ── Contributions 2026 ──────────────────────────────────────────────────
  { ruleId: "REMEDI_COMPREHENSIVE_CONTRIB", scheme: "REMEDI", plan: "Comprehensive", category: "savings", description: "PMSA: available for out-of-hospital expenses. Interest earned on unused funds", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Comprehensive option only. Credit facility from day one." },
];

// ─── BONITAS COMPREHENSIVE PLAN LIMITS (2026) ──────────────────────────────
// Source: Bonitas BonComprehensive, BonComplete, BonClassic 2026 brochures
// Plans: BonComprehensive, BonComplete, BonClassic

export const BONITAS_COMPREHENSIVE_LIMITS: BenefitLimitRule[] = [
  // ── Savings ────────────────────────────────────────────────────────────
  { ruleId: "BON_COMP_SAVINGS_M", scheme: "BON", plan: "BonComprehensive", category: "savings", description: "Savings: M=R22,512, A=R21,228, C=R4,584/year", annualLimitRands: 22512, networkRequired: false, preAuthRequired: false, severity: "info", notes: "BonComprehensive plan savings allocation." },
  { ruleId: "BON_COMPLETE_SAVINGS_M", scheme: "BON", plan: "BonComplete", category: "savings", description: "Savings: M=R11,880, A=R9,516, C=R3,216/year", annualLimitRands: 11880, networkRequired: false, preAuthRequired: false, severity: "info", notes: "BonComplete plan savings allocation." },
  { ruleId: "BON_CLASSIC_SAVINGS_M", scheme: "BON", plan: "BonClassic", category: "savings", description: "Savings: M=R14,832, A=R12,732, C=R3,660/year", annualLimitRands: 14832, networkRequired: false, preAuthRequired: false, severity: "info", notes: "BonClassic plan savings allocation." },

  // ── Self-payment gap ──────────────────────────────────────────────────
  { ruleId: "BON_COMP_SPG_M", scheme: "BON", plan: "BonComprehensive", category: "day_to_day", description: "Self-payment gap: M=R5,420, A=R4,490, C=R2,050", annualLimitRands: 5420, networkRequired: false, preAuthRequired: false, severity: "info", notes: "After savings depleted, pay gap before above-threshold kicks in." },
  { ruleId: "BON_COMPLETE_SPG_M", scheme: "BON", plan: "BonComplete", category: "day_to_day", description: "Self-payment gap: M=R2,350, A=R1,990, C=R510", annualLimitRands: 2350, networkRequired: false, preAuthRequired: false, severity: "info", notes: "BonComplete self-payment gap." },

  // ── Above-threshold benefit ───────────────────────────────────────────
  { ruleId: "BON_COMP_ATB", scheme: "BON", plan: "BonComprehensive", category: "day_to_day", description: "Above threshold benefit: unlimited", networkRequired: false, preAuthRequired: false, severity: "info", notes: "BonComprehensive: unlimited above threshold for all beneficiaries." },
  { ruleId: "BON_COMPLETE_ATB_M", scheme: "BON", plan: "BonComplete", category: "day_to_day", description: "Above threshold benefit: M=R6,250, A=R3,660, C=R1,600", annualLimitRands: 6250, networkRequired: false, preAuthRequired: false, severity: "info", notes: "BonComplete above threshold limit." },

  // ── Specialised radiology (MRI/CT) ─────────────────────────────────────
  { ruleId: "BON_COMP_SPEC_RAD", scheme: "BON", plan: "BonComprehensive", category: "radiology", description: "MRI/CT scans: R38,470/family, R2,800 co-pay per scan except PMB", annualLimitRands: 38470, coPaymentRands: 2800, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Combined in- and out-of-hospital." },
  { ruleId: "BON_COMPLETE_SPEC_RAD", scheme: "BON", plan: "BonComplete", category: "radiology", description: "MRI/CT scans: R30,430/family, R2,800 co-pay per scan except PMB", annualLimitRands: 30430, coPaymentRands: 2800, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Combined in- and out-of-hospital." },
  { ruleId: "BON_CLASSIC_SPEC_RAD", scheme: "BON", plan: "BonClassic", category: "radiology", description: "MRI/CT scans: R37,800/family, R2,800 co-pay per scan except PMB", annualLimitRands: 37800, coPaymentRands: 2800, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Combined in- and out-of-hospital." },

  // ── Acute medicine + OTC (above threshold) ────────────────────────────
  { ruleId: "BON_COMPLETE_ACUTE_MED_ATB", scheme: "BON", plan: "BonComplete", category: "medicine_acute", description: "Acute + OTC medicine above threshold: R18,560/family", annualLimitRands: 18560, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Combined acute and OTC. 20% co-pay for non-network/non-formulary." },

  // ── Mental health ─────────────────────────────────────────────────────
  { ruleId: "BON_COMP_MENTAL_OOH", scheme: "BON", plan: "BonComprehensive", category: "mental_health", description: "Mental health consultations: R20,310/family (in and out of hospital)", annualLimitRands: 20310, networkRequired: false, preAuthRequired: false, severity: "warning", notes: "Included in mental health hospitalisation benefit." },
  { ruleId: "BON_COMPLETE_MENTAL_OOH", scheme: "BON", plan: "BonComplete", category: "mental_health", description: "Mental health consultations: R20,310/family (in and out of hospital)", annualLimitRands: 20310, networkRequired: false, preAuthRequired: false, severity: "warning", notes: "Included in mental health hospitalisation benefit." },
  { ruleId: "BON_CLASSIC_MENTAL_OOH", scheme: "BON", plan: "BonClassic", category: "mental_health", description: "Mental health consultations: R20,310/family (in and out of hospital)", annualLimitRands: 20310, networkRequired: false, preAuthRequired: false, severity: "warning", notes: "Included in mental health hospitalisation benefit." },

  // ── Mental health hospitalisation ─────────────────────────────────────
  { ruleId: "BON_COMP_MENTAL_HOSP", scheme: "BON", plan: "BonComprehensive", category: "mental_health", description: "Mental health hospitalisation: R59,920/family", annualLimitRands: 59920, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "No physio cover for mental health admissions." },
  { ruleId: "BON_COMPLETE_MENTAL_HOSP", scheme: "BON", plan: "BonComplete", category: "mental_health", description: "Mental health hospitalisation: R41,190/family", annualLimitRands: 41190, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "30% co-pay if non-network hospital. No physio for mental health." },
  { ruleId: "BON_CLASSIC_MENTAL_HOSP", scheme: "BON", plan: "BonClassic", category: "mental_health", description: "Mental health hospitalisation: R52,670/family", annualLimitRands: 52670, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "30% co-pay if non-network hospital." },

  // ── Chronic medicine ──────────────────────────────────────────────────
  { ruleId: "BON_COMP_CHRONIC", scheme: "BON", plan: "BonComprehensive", category: "chronic", description: "Chronic medicine: R18,760/beneficiary, R37,360/family (61 conditions)", annualLimitRands: 37360, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "30% co-pay for non-formulary/non-network pharmacy. 27 PMB unlimited after limit." },
  { ruleId: "BON_CLASSIC_CHRONIC", scheme: "BON", plan: "BonClassic", category: "chronic", description: "Chronic medicine: R15,370/beneficiary, R31,770/family (46 conditions)", annualLimitRands: 31770, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "30% co-pay for non-formulary/non-network. 27 PMB unlimited after limit." },

  // ── Internal prostheses ───────────────────────────────────────────────
  { ruleId: "BON_COMP_INT_PROSTH", scheme: "BON", plan: "BonComprehensive", category: "prosthesis", description: "Internal prostheses: R67,640/family", annualLimitRands: 67640, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "BonComprehensive." },
  { ruleId: "BON_COMPLETE_INT_PROSTH", scheme: "BON", plan: "BonComplete", category: "prosthesis", description: "Internal prostheses: R57,630/family", annualLimitRands: 57630, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "BonComplete." },
  { ruleId: "BON_CLASSIC_INT_PROSTH", scheme: "BON", plan: "BonClassic", category: "prosthesis", description: "Internal and external prostheses: R67,640/family", annualLimitRands: 67640, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "BonClassic. Sub-limit R7,130/breast prosthesis." },

  // ── External prostheses ───────────────────────────────────────────────
  { ruleId: "BON_COMP_EXT_PROSTH", scheme: "BON", plan: "BonComprehensive", category: "prosthesis", description: "External prostheses: R67,640/family, breast sub-limit R6,710 each (max 2/year)", annualLimitRands: 67640, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "BonComprehensive." },

  // ── Internal nerve stimulators ────────────────────────────────────────
  { ruleId: "BON_COMP_NERVE_STIM", scheme: "BON", plan: "BonComprehensive", category: "prosthesis", description: "Internal nerve stimulators: R211,300/family", annualLimitRands: 211300, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "BonComprehensive only." },

  // ── Deep brain stimulation ────────────────────────────────────────────
  { ruleId: "BON_COMP_DEEP_BRAIN", scheme: "BON", plan: "BonComprehensive", category: "prosthesis", description: "Deep brain stimulation: R298,000/beneficiary (excl prostheses)", annualLimitRands: 298000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "BonComprehensive only." },

  // ── Cochlear implants ─────────────────────────────────────────────────
  { ruleId: "BON_COMP_COCHLEAR", scheme: "BON", plan: "BonComprehensive", category: "prosthesis", description: "Cochlear implants: R354,600/family", annualLimitRands: 354600, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "BonComprehensive only." },
  { ruleId: "BON_CLASSIC_COCHLEAR", scheme: "BON", plan: "BonClassic", category: "prosthesis", description: "Cochlear implants: R376,600/family", annualLimitRands: 376600, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "BonClassic." },

  // ── Cataract surgery co-payment ───────────────────────────────────────
  { ruleId: "BON_COMP_CATARACT_COPAY", scheme: "BON", plan: "BonComprehensive", category: "hospital", description: "Cataract surgery: R7,420 co-payment if non-DSP", coPaymentRands: 7420, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "All Bonitas comprehensive plans. Avoid co-pay by using DSP." },

  // ── Refractive surgery ────────────────────────────────────────────────
  { ruleId: "BON_COMP_REFRACTIVE", scheme: "BON", plan: "BonComprehensive", category: "hospital", description: "Refractive surgery: R26,520/family", annualLimitRands: 26520, networkRequired: false, preAuthRequired: true, severity: "info", notes: "BonComprehensive only." },

  // ── Hip/knee replacement co-payment ───────────────────────────────────
  { ruleId: "BON_COMP_HIP_KNEE_COPAY", scheme: "BON", plan: "BonComprehensive", category: "hospital", description: "Hip/knee replacement: R38,560 co-payment if non-DSP", coPaymentRands: 38560, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "All comprehensive/classic plans." },

  // ── Take-home medicine ────────────────────────────────────────────────
  { ruleId: "BON_COMP_TTO", scheme: "BON", plan: "BonComprehensive", category: "medicine_acute", description: "Take-home medicine: R670 per hospital stay (7-day supply)", perEventLimitRands: 670, networkRequired: false, preAuthRequired: false, severity: "info", notes: "BonComprehensive." },
  { ruleId: "BON_COMPLETE_TTO", scheme: "BON", plan: "BonComplete", category: "medicine_acute", description: "Take-home medicine: R535 per hospital stay (7-day supply)", perEventLimitRands: 535, networkRequired: false, preAuthRequired: false, severity: "info", notes: "BonComplete." },
  { ruleId: "BON_CLASSIC_TTO", scheme: "BON", plan: "BonClassic", category: "medicine_acute", description: "Take-home medicine: R605 per hospital stay (7-day supply)", perEventLimitRands: 605, networkRequired: false, preAuthRequired: false, severity: "info", notes: "BonClassic." },

  // ── Physical rehabilitation ───────────────────────────────────────────
  { ruleId: "BON_COMP_PHYS_REHAB", scheme: "BON", plan: "BonComprehensive", category: "physiotherapy", description: "Physical rehabilitation: R63,340/family", annualLimitRands: 63340, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "BonComprehensive." },
  { ruleId: "BON_COMPLETE_PHYS_REHAB", scheme: "BON", plan: "BonComplete", category: "physiotherapy", description: "Physical rehabilitation: R67,270/family", annualLimitRands: 67270, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "BonComplete." },
  { ruleId: "BON_CLASSIC_PHYS_REHAB", scheme: "BON", plan: "BonClassic", category: "physiotherapy", description: "Physical rehabilitation: R67,270/family", annualLimitRands: 67270, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "BonClassic." },

  // ── Alternatives to hospital ──────────────────────────────────────────
  { ruleId: "BON_COMP_ALT_HOSP", scheme: "BON", plan: "BonComprehensive", category: "hospital", description: "Alternatives to hospital (hospice, step-down): R21,570/family", annualLimitRands: 21570, networkRequired: false, preAuthRequired: true, severity: "info", notes: "All comprehensive/classic plans." },

  // ── Cancer treatment ──────────────────────────────────────────────────
  { ruleId: "BON_COMP_CANCER", scheme: "BON", plan: "BonComprehensive", category: "oncology", description: "Non-PMB cancer: R448,200/family (80% at DSP). Specialised drugs sub-limit R448,200", annualLimitRands: 448200, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "PMB unlimited. Brachytherapy sub-limit R63,110/beneficiary." },
  { ruleId: "BON_COMPLETE_CANCER", scheme: "BON", plan: "BonComplete", category: "oncology", description: "Non-PMB cancer: R280,100/family (80% at DSP). No specialised drugs unless PMB", annualLimitRands: 280100, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "PMB unlimited. Brachytherapy sub-limit R63,110/beneficiary." },
  { ruleId: "BON_CLASSIC_CANCER", scheme: "BON", plan: "BonClassic", category: "oncology", description: "Non-PMB cancer: R336,100/family (80% at DSP). Specialised drugs R164,100 sub-limit", annualLimitRands: 336100, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "PMB unlimited. Brachytherapy sub-limit R63,110/beneficiary." },

  // ── Non-cancer specialised drugs ──────────────────────────────────────
  { ruleId: "BON_COMP_SPEC_DRUGS", scheme: "BON", plan: "BonComprehensive", category: "medicine_acute", description: "Non-cancer specialised drugs (incl biologicals): R257,300/family", annualLimitRands: 257300, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "BonComprehensive only." },

  // ── Organ transplants ─────────────────────────────────────────────────
  { ruleId: "BON_COMP_CORNEAL_GRAFT", scheme: "BON", plan: "BonComprehensive", category: "hospital", description: "Corneal grafts sub-limit: R40,220/beneficiary (organ transplants unlimited)", annualLimitRands: 40220, networkRequired: false, preAuthRequired: true, severity: "info", notes: "BonComprehensive." },
  { ruleId: "BON_COMPLETE_CORNEAL_GRAFT", scheme: "BON", plan: "BonComplete", category: "hospital", description: "Corneal grafts sub-limit: R42,710/beneficiary (organ transplants unlimited)", annualLimitRands: 42710, networkRequired: false, preAuthRequired: true, severity: "info", notes: "BonComplete and BonClassic." },

  // ── Day surgery co-payment ────────────────────────────────────────────
  { ruleId: "BON_COMP_DAY_SURG_COPAY", scheme: "BON", plan: "BonComprehensive", category: "hospital", description: "Day surgery: R5,440 co-payment if non-network day hospital", coPaymentRands: 5440, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "All comprehensive/classic plans." },

  // ── Insulin pump and CGM ──────────────────────────────────────────────
  { ruleId: "BON_COMP_INSULIN_PUMP", scheme: "BON", plan: "BonComprehensive", category: "chronic", description: "Insulin pump: R65,000/family every 5 years. CGM: R28,000/family/year. Consumables: R93,000/family", annualLimitRands: 93000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Type 1 diabetic younger than 18. All comprehensive/classic plans." },

  // ── Audiology / hearing aids ──────────────────────────────────────────
  { ruleId: "BON_COMP_HEARING", scheme: "BON", plan: "BonComprehensive", category: "allied_health", description: "Hearing aids: R11,340/device (max 2/beneficiary), every 3 years. 25% co-pay if non-DSP", perBeneficiaryLimit: 11340, networkRequired: true, preAuthRequired: false, severity: "info", notes: "BonComprehensive." },
  { ruleId: "BON_COMPLETE_HEARING", scheme: "BON", plan: "BonComplete", category: "allied_health", description: "Hearing aids: R10,090/device (max 2/beneficiary), every 3 years. 25% co-pay if non-DSP", perBeneficiaryLimit: 10090, networkRequired: true, preAuthRequired: false, severity: "info", notes: "BonComplete and BonClassic." },

  // ── Optometry ─────────────────────────────────────────────────────────
  { ruleId: "BON_COMP_OPTOMETRY", scheme: "BON", plan: "BonComprehensive", category: "optical", description: "Optometry: R4,225/beneficiary every 2 years. Eye test R420 non-network", perBeneficiaryLimit: 4225, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Frames R1,040/beneficiary. Contacts R2,555/beneficiary. BonClassic." },

  // ── Basic dentistry ───────────────────────────────────────────────────
  { ruleId: "BON_CLASSIC_BASIC_DENT", scheme: "BON", plan: "BonClassic", category: "dental", description: "Basic dentistry: R6,400/family/year", annualLimitRands: 6400, networkRequired: false, preAuthRequired: false, severity: "info", notes: "BonClassic. Subject to Bonitas Dental Tariff." },

  // ── Specialised dentistry ─────────────────────────────────────────────
  { ruleId: "BON_CLASSIC_SPEC_DENT", scheme: "BON", plan: "BonClassic", category: "dental", description: "Specialised dentistry: R7,710/family/year", annualLimitRands: 7710, networkRequired: false, preAuthRequired: true, severity: "info", notes: "BonClassic." },

  // ── Dental implants ───────────────────────────────────────────────────
  { ruleId: "BON_COMP_IMPLANTS", scheme: "BON", plan: "BonComprehensive", category: "dental", description: "Dental implants: 2/beneficiary every 5 years, R3,710/implant component limit", perBeneficiaryLimit: 3710, networkRequired: false, preAuthRequired: true, severity: "info", notes: "BonComprehensive only." },

  // ── Blood pressure monitor ────────────────────────────────────────────
  { ruleId: "BON_COMP_BP_MONITOR", scheme: "BON", plan: "BonComprehensive", category: "chronic", description: "Blood pressure monitor: R1,250/family every 2 years", annualLimitRands: 1250, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Must have registered hypertension. All comprehensive/classic plans." },

  // ── International travel ──────────────────────────────────────────────
  { ruleId: "BON_COMP_TRAVEL", scheme: "BON", plan: "BonComprehensive", category: "ambulance", description: "International travel: up to R1,200,000/family for medical emergencies abroad", annualLimitRands: 1200000, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Must register before departure. All Bonitas plans." },

  // ── Dental hospitalisation co-payments ────────────────────────────────
  { ruleId: "BON_COMPLETE_DENTAL_HOSP_COPAY", scheme: "BON", plan: "BonComplete", category: "dental", description: "Dental hospitalisation: R3,640 co-pay (under 5) / R5,200 (other) / R2,600 day hospital", coPaymentRands: 3640, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "BonComplete and BonClassic. 30% co-pay if non-network hospital." },
];

// ─── BONITAS LOWER PLAN LIMITS (2026) ──────────────────────────────────────
// Source: BonEssential, BonSave, BonFit, BonStart, BonStart Plus, BonCap 2026 brochures
// Plans: BonEssential, BonEssential Select, BonSave, BonFit, BonStart, BonStart Plus, BonCap

export const BONITAS_LOWER_PLAN_LIMITS: BenefitLimitRule[] = [
  // ── Savings (BonSave/BonFit) ──────────────────────────────────────────
  { ruleId: "BON_SAVE_SAVINGS_M", scheme: "BON", plan: "BonSave", category: "savings", description: "Savings: M=R12,144, A=R9,180, C=R3,636/year", annualLimitRands: 12144, networkRequired: false, preAuthRequired: false, severity: "info", notes: "BonSave savings." },
  { ruleId: "BON_FIT_SAVINGS_M", scheme: "BON", plan: "BonFit", category: "savings", description: "Savings: M=R4,848, A=R3,636, C=R1,632/year", annualLimitRands: 4848, networkRequired: false, preAuthRequired: false, severity: "info", notes: "BonFit savings." },

  // ── MRI/CT scans ──────────────────────────────────────────────────────
  { ruleId: "BON_ESSENTIAL_SPEC_RAD", scheme: "BON", plan: "BonEssential", category: "radiology", description: "MRI/CT scans (in-hospital): R15,960/family, R2,800 co-pay per scan except PMB", annualLimitRands: 15960, coPaymentRands: 2800, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "BonEssential and BonEssential Select." },
  { ruleId: "BON_SAVE_SPEC_RAD", scheme: "BON", plan: "BonSave", category: "radiology", description: "MRI/CT scans: R30,430/family, R1,860 co-pay per scan except PMB", annualLimitRands: 30430, coPaymentRands: 1860, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "BonSave. Combined in- and out-of-hospital." },
  { ruleId: "BON_FIT_SPEC_RAD", scheme: "BON", plan: "BonFit", category: "radiology", description: "MRI/CT scans (in-hospital): R15,960/family, R2,800 co-pay per scan except PMB", annualLimitRands: 15960, coPaymentRands: 2800, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "BonFit." },
  { ruleId: "BON_START_SPEC_RAD", scheme: "BON", plan: "BonStart", category: "radiology", description: "MRI/CT scans: R14,090/family, R2,800 co-pay per scan except PMB", annualLimitRands: 14090, coPaymentRands: 2800, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "BonStart and BonStart Plus." },
  { ruleId: "BON_CAP_SPEC_RAD", scheme: "BON", plan: "BonCap", category: "radiology", description: "MRI/CT scans: R14,250/family, R1,230 co-pay per scan except PMB", annualLimitRands: 14250, coPaymentRands: 1230, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "BonCap. Included in specialist consultation benefit." },

  // ── Mental health hospitalisation ─────────────────────────────────────
  { ruleId: "BON_ESSENTIAL_MENTAL_HOSP", scheme: "BON", plan: "BonEssential", category: "mental_health", description: "Mental health hospitalisation: R19,060/family", annualLimitRands: 19060, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "BonEssential and BonEssential Select. 30% co-pay non-network." },
  { ruleId: "BON_SAVE_MENTAL_HOSP", scheme: "BON", plan: "BonSave", category: "mental_health", description: "Mental health hospitalisation: R41,190/family", annualLimitRands: 41190, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "BonSave. 30% co-pay non-network." },
  { ruleId: "BON_FIT_MENTAL_HOSP", scheme: "BON", plan: "BonFit", category: "mental_health", description: "Mental health hospitalisation: R19,060/family", annualLimitRands: 19060, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "BonFit. 30% co-pay non-network." },

  // ── Mental health consultations (BonSave) ─────────────────────────────
  { ruleId: "BON_SAVE_MENTAL_OOH", scheme: "BON", plan: "BonSave", category: "mental_health", description: "Mental health consultations: R15,440/family (in and out of hospital)", annualLimitRands: 15440, networkRequired: false, preAuthRequired: false, severity: "warning", notes: "BonSave. Included in mental health hospitalisation benefit." },

  // ── Take-home medicine ────────────────────────────────────────────────
  { ruleId: "BON_ESSENTIAL_TTO", scheme: "BON", plan: "BonEssential", category: "medicine_acute", description: "Take-home medicine: R470 per hospital stay (7-day supply)", perEventLimitRands: 470, networkRequired: false, preAuthRequired: false, severity: "info", notes: "BonEssential, BonEssential Select, BonFit, BonStart, BonCap." },
  { ruleId: "BON_SAVE_TTO", scheme: "BON", plan: "BonSave", category: "medicine_acute", description: "Take-home medicine: R500 per hospital stay (7-day supply)", perEventLimitRands: 500, networkRequired: false, preAuthRequired: false, severity: "info", notes: "BonSave." },

  // ── Physical rehabilitation ───────────────────────────────────────────
  { ruleId: "BON_ESSENTIAL_PHYS_REHAB", scheme: "BON", plan: "BonEssential", category: "physiotherapy", description: "Physical rehabilitation: R63,340/family", annualLimitRands: 63340, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "BonEssential and BonEssential Select." },
  { ruleId: "BON_SAVE_PHYS_REHAB", scheme: "BON", plan: "BonSave", category: "physiotherapy", description: "Physical rehabilitation: R67,270/family", annualLimitRands: 67270, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "BonSave and BonFit." },
  { ruleId: "BON_START_PHYS_REHAB", scheme: "BON", plan: "BonStart", category: "physiotherapy", description: "Physical rehabilitation: R62,620/family", annualLimitRands: 62620, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "BonStart and BonStart Plus." },
  { ruleId: "BON_CAP_PHYS_REHAB", scheme: "BON", plan: "BonCap", category: "physiotherapy", description: "Physical rehabilitation: R63,340/family", annualLimitRands: 63340, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "BonCap." },

  // ── Alternatives to hospital ──────────────────────────────────────────
  { ruleId: "BON_ESSENTIAL_ALT_HOSP", scheme: "BON", plan: "BonEssential", category: "hospital", description: "Alternatives to hospital: R20,310/family", annualLimitRands: 20310, networkRequired: false, preAuthRequired: true, severity: "info", notes: "BonEssential, BonEssential Select, BonFit." },
  { ruleId: "BON_SAVE_ALT_HOSP", scheme: "BON", plan: "BonSave", category: "hospital", description: "Alternatives to hospital: R21,570/family", annualLimitRands: 21570, networkRequired: false, preAuthRequired: true, severity: "info", notes: "BonSave." },
  { ruleId: "BON_START_ALT_HOSP", scheme: "BON", plan: "BonStart", category: "hospital", description: "Alternatives to hospital: R17,340/family", annualLimitRands: 17340, networkRequired: false, preAuthRequired: true, severity: "info", notes: "BonStart." },
  { ruleId: "BON_STARTPLUS_ALT_HOSP", scheme: "BON", plan: "BonStart Plus", category: "hospital", description: "Alternatives to hospital: R20,090/family", annualLimitRands: 20090, networkRequired: false, preAuthRequired: true, severity: "info", notes: "BonStart Plus." },
  { ruleId: "BON_CAP_ALT_HOSP", scheme: "BON", plan: "BonCap", category: "hospital", description: "Alternatives to hospital: R17,550/family", annualLimitRands: 17550, networkRequired: false, preAuthRequired: true, severity: "info", notes: "BonCap." },

  // ── Cancer treatment ──────────────────────────────────────────────────
  { ruleId: "BON_SAVE_CANCER", scheme: "BON", plan: "BonSave", category: "oncology", description: "Non-PMB cancer: R224,100/family. Brachytherapy sub-limit R63,110/beneficiary", annualLimitRands: 224100, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "BonSave. PMB unlimited. 80% at DSP." },
  { ruleId: "BON_FIT_CANCER", scheme: "BON", plan: "BonFit", category: "oncology", description: "Non-PMB cancer: R168,100/family. Brachytherapy sub-limit R63,110/beneficiary", annualLimitRands: 168100, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "BonFit. PMB unlimited. 80% at DSP." },

  // ── Internal prostheses ───────────────────────────────────────────────
  { ruleId: "BON_SAVE_INT_PROSTH", scheme: "BON", plan: "BonSave", category: "prosthesis", description: "Internal prostheses: R41,070/family (no joint replacement except PMB)", annualLimitRands: 41070, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "BonSave." },

  // ── Organ transplant corneal grafts ───────────────────────────────────
  { ruleId: "BON_SAVE_CORNEAL", scheme: "BON", plan: "BonSave", category: "hospital", description: "Corneal grafts: R42,710/beneficiary (organ transplants unlimited)", annualLimitRands: 42710, networkRequired: false, preAuthRequired: true, severity: "info", notes: "BonSave." },

  // ── Day surgery co-payments ───────────────────────────────────────────
  { ruleId: "BON_SAVE_DAY_SURG_COPAY", scheme: "BON", plan: "BonSave", category: "hospital", description: "Day surgery: R5,440 co-payment if non-network day hospital", coPaymentRands: 5440, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "BonSave." },
  { ruleId: "BON_ESSENTIAL_DAY_SURG_COPAY", scheme: "BON", plan: "BonEssential", category: "hospital", description: "Day surgery: R6,500 co-payment if non-network day hospital", coPaymentRands: 6500, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "BonEssential." },
  { ruleId: "BON_FIT_DAY_SURG_COPAY", scheme: "BON", plan: "BonFit", category: "hospital", description: "Day surgery: R6,500 co-payment if non-network. BonEssential Select: R7,100", coPaymentRands: 6500, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "BonFit." },
  { ruleId: "BON_START_DAY_SURG_COPAY", scheme: "BON", plan: "BonStart", category: "hospital", description: "Day surgery: R12,680 co-payment if non-network day hospital", coPaymentRands: 12680, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "BonStart and BonStart Plus." },

  // ── Cataract co-payments ──────────────────────────────────────────────
  { ruleId: "BON_ESSENTIAL_CATARACT_COPAY", scheme: "BON", plan: "BonEssential", category: "hospital", description: "Cataract surgery: R9,800 co-payment if non-DSP", coPaymentRands: 9800, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "BonEssential, BonEssential Select, BonFit, BonStart, BonCap." },
  { ruleId: "BON_SAVE_CATARACT_COPAY", scheme: "BON", plan: "BonSave", category: "hospital", description: "Cataract surgery: R8,400 co-payment if non-DSP", coPaymentRands: 8400, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "BonSave." },

  // ── BonStart specific benefits ────────────────────────────────────────
  { ruleId: "BON_START_ADMISSION_COPAY", scheme: "BON", plan: "BonStart", category: "hospital", description: "Hospital admission: R1,850 co-payment per admission (except PMB emergencies)", coPaymentRands: 1850, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "BonStart. R12,680 co-payment if non-network hospital." },
  { ruleId: "BON_STARTPLUS_ADMISSION_COPAY", scheme: "BON", plan: "BonStart Plus", category: "hospital", description: "Hospital admission: R1,240 co-payment per admission (except PMB emergencies)", coPaymentRands: 1240, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "BonStart Plus. R12,680 co-payment if non-network." },
  { ruleId: "BON_START_BLOOD_TESTS", scheme: "BON", plan: "BonStart", category: "pathology", description: "Blood tests (in-hospital): R32,120/family except PMB", annualLimitRands: 32120, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "BonStart only." },
  { ruleId: "BON_START_BLOOD_TRANSFUSION", scheme: "BON", plan: "BonStart", category: "hospital", description: "Blood transfusions: R23,330/family except PMB", annualLimitRands: 23330, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "BonStart only." },
  { ruleId: "BON_START_NEONATAL", scheme: "BON", plan: "BonStart", category: "hospital", description: "Neonatal care: R57,280/family except PMB", annualLimitRands: 57280, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "BonStart and BonStart Plus." },
  { ruleId: "BON_START_GP_REF_MED", scheme: "BON", plan: "BonStart", category: "medicine_acute", description: "GP-referred acute medicine, X-rays and blood tests: R1,850/family", annualLimitRands: 1850, networkRequired: false, preAuthRequired: false, severity: "info", notes: "BonStart. BonStart Plus: R3,450/family." },
  { ruleId: "BON_STARTPLUS_GP_REF_MED", scheme: "BON", plan: "BonStart Plus", category: "medicine_acute", description: "GP-referred acute medicine, X-rays and blood tests: R3,450/family", annualLimitRands: 3450, networkRequired: false, preAuthRequired: false, severity: "info", notes: "BonStart Plus." },
  { ruleId: "BON_START_OTC", scheme: "BON", plan: "BonStart", category: "medicine_otc", description: "OTC medicine: R115/event, max R565/family/year", annualLimitRands: 565, networkRequired: false, preAuthRequired: false, severity: "info", notes: "BonStart." },
  { ruleId: "BON_STARTPLUS_OTC", scheme: "BON", plan: "BonStart Plus", category: "medicine_otc", description: "OTC medicine: R180/event, max R860/family/year", annualLimitRands: 860, networkRequired: false, preAuthRequired: false, severity: "info", notes: "BonStart Plus." },
  { ruleId: "BON_START_SPECIALIST", scheme: "BON", plan: "BonStart", category: "specialist", description: "Specialist: 1 visit/family up to R1,370. R275 co-payment per visit", annualLimitRands: 1370, coPaymentRands: 275, visitLimit: 1, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: false, severity: "info", notes: "BonStart." },
  { ruleId: "BON_STARTPLUS_SPECIALIST", scheme: "BON", plan: "BonStart Plus", category: "specialist", description: "Specialist: 2 visits/family up to R2,480. R130 co-payment per visit", annualLimitRands: 2480, coPaymentRands: 130, visitLimit: 2, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: false, severity: "info", notes: "BonStart Plus." },
  { ruleId: "BON_STARTPLUS_APPLIANCES", scheme: "BON", plan: "BonStart Plus", category: "prosthesis", description: "General appliances: R6,860/family", annualLimitRands: 6860, networkRequired: false, preAuthRequired: false, severity: "info", notes: "BonStart Plus only." },

  // ── BonCap specific benefits ──────────────────────────────────────────
  { ruleId: "BON_CAP_GP_REF_MED_M", scheme: "BON", plan: "BonCap", category: "medicine_acute", description: "GP-referred acute medicine, X-rays, blood tests: M=R2,390, M+1=R3,990, M+2=R4,780, M+3=R5,220, M+4+=R5,790", annualLimitRands: 2390, networkRequired: true, preAuthRequired: false, severity: "info", notes: "BonCap. Subject to formularies and network." },
  { ruleId: "BON_CAP_SPECIALIST", scheme: "BON", plan: "BonCap", category: "specialist", description: "Network specialist: 3 visits/beneficiary up to R4,060, 5 visits/family up to R6,030", annualLimitRands: 6030, visitLimit: 5, visitPeriodMonths: 12, networkRequired: true, preAuthRequired: true, severity: "info", notes: "BonCap. GP referral required." },
  { ruleId: "BON_CAP_OTC", scheme: "BON", plan: "BonCap", category: "medicine_otc", description: "OTC medicine: R120/event, max R340/beneficiary/year", annualLimitRands: 340, networkRequired: true, preAuthRequired: false, severity: "info", notes: "BonCap." },
  { ruleId: "BON_CAP_APPLIANCES", scheme: "BON", plan: "BonCap", category: "prosthesis", description: "General medical appliances: R7,370/family", annualLimitRands: 7370, networkRequired: false, preAuthRequired: false, severity: "info", notes: "BonCap." },
  { ruleId: "BON_CAP_BLOOD_TESTS", scheme: "BON", plan: "BonCap", category: "pathology", description: "Blood tests (in-hospital): R32,480/family except PMB", annualLimitRands: 32480, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "BonCap." },
  { ruleId: "BON_CAP_BLOOD_TRANSFUSION", scheme: "BON", plan: "BonCap", category: "hospital", description: "Blood transfusions: R23,600/family except PMB", annualLimitRands: 23600, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "BonCap." },
  { ruleId: "BON_CAP_NEONATAL", scheme: "BON", plan: "BonCap", category: "hospital", description: "Neonatal care: R57,940/family except PMB", annualLimitRands: 57940, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "BonCap." },
  { ruleId: "BON_CAP_CONTRACEPTIVES", scheme: "BON", plan: "BonCap", category: "medicine_acute", description: "Contraceptives: R1,330/family (women up to 50)", annualLimitRands: 1330, networkRequired: true, preAuthRequired: false, severity: "info", notes: "BonCap. 40% co-pay if non-DSP pharmacy." },

  // ── Procedure co-payments (BonEssential/BonFit) ───────────────────────
  { ruleId: "BON_ESSENTIAL_PROC_COPAY_2020", scheme: "BON", plan: "BonEssential", category: "hospital", description: "Procedure co-payments: R2,020 (group 1), R5,130 (group 2), R9,500 (group 3)", coPaymentRands: 2020, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Colonoscopy, gastroscopy, tonsillectomy etc. BonEssential/BonEssential Select." },
];

// ─── SASOLMED LIMITS (2026) ────────────────────────────────────────────────
// Source: Sasolmed 2026 Benefit Schedule (31 pages)
// Two options: Comprehensive Network and Restricted Network (same limits)

export const SASOLMED_LIMITS: BenefitLimitRule[] = [
  // ── GP consultations ──────────────────────────────────────────────────
  { ruleId: "SASOL_GP_CONSULT", scheme: "SASOL", plan: "*", category: "gp_consultation", description: "GP consultations: 8/beneficiary/year (PGP). 20% co-pay for non-PGP", visitLimit: 8, visitPeriodMonths: 12, coPaymentPercent: 20, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Must be referred from Sasolmed Online Practice. Antenatal, preventative and mental health excluded from limit." },

  // ── Virtual consultations ─────────────────────────────────────────────
  { ruleId: "SASOL_VIRTUAL_GP", scheme: "SASOL", plan: "*", category: "gp_consultation", description: "Virtual GP/nurse consultations: 20/family/year", visitLimit: 20, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Virtual urgent care: 4/family/year." },

  // ── Allied health ─────────────────────────────────────────────────────
  { ruleId: "SASOL_ALLIED_HEALTH", scheme: "SASOL", plan: "*", category: "allied_health", description: "Allied health services: R5,120/beneficiary, R7,820/family/year. 20% co-payment", annualLimitRands: 7820, coPaymentPercent: 20, networkRequired: false, preAuthRequired: false, severity: "warning", notes: "Includes acupuncture, homeopathy, audiology, biokineticists, chiro, dietitians, OT, physio, podiatry, speech. In-hospital excluded." },

  // ── Appliances ────────────────────────────────────────────────────────
  { ruleId: "SASOL_APPLIANCES", scheme: "SASOL", plan: "*", category: "prosthesis", description: "General medical/surgical appliances: R13,850/family", annualLimitRands: 13850, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Sub-limits: foot orthotics R5,460/beneficiary, nebulisers R1,250/family/48mo, walking aids R1,615/family/48mo, keratoconus lenses R3,200/lens/year." },

  // ── Hearing aids ──────────────────────────────────────────────────────
  { ruleId: "SASOL_HEARING_AIDS", scheme: "SASOL", plan: "*", category: "allied_health", description: "Hearing aids: R27,600/beneficiary every 36 months. R1,000 co-payment per purchase", annualLimitRands: 27600, coPaymentRands: 1000, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Repairs: R2,760/beneficiary/36 months." },

  // ── Cochlear implants ─────────────────────────────────────────────────
  { ruleId: "SASOL_COCHLEAR", scheme: "SASOL", plan: "*", category: "prosthesis", description: "Cochlear implant: R310,000/beneficiary/lifetime (unilateral)", annualLimitRands: 310000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Speech processor upgrade: R214,500/beneficiary/5-year cycle." },

  // ── Insulin pump/CGM ──────────────────────────────────────────────────
  { ruleId: "SASOL_INSULIN_PUMP", scheme: "SASOL", plan: "*", category: "chronic", description: "Insulin pumps, CGMs and consumables: unlimited", networkRequired: false, preAuthRequired: true, severity: "info", notes: "Subject to patient compliance monitoring." },

  // ── Home monitoring devices ───────────────────────────────────────────
  { ruleId: "SASOL_HOME_MONITOR", scheme: "SASOL", plan: "*", category: "chronic", description: "Home monitoring devices: R4,650/beneficiary/year", annualLimitRands: 4650, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Must be approved by Scheme." },

  // ── Dentistry — basic ─────────────────────────────────────────────────
  { ruleId: "SASOL_BASIC_DENT", scheme: "SASOL", plan: "*", category: "dental", description: "Basic dentistry (out-of-hospital): unlimited. 200% scheme tariff for wisdom teeth in rooms", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Managed by DRC. Restricted Network: DRC network only, no cover out of network." },

  // ── Dentistry — advanced ──────────────────────────────────────────────
  { ruleId: "SASOL_ADV_DENT", scheme: "SASOL", plan: "*", category: "dental", description: "Advanced dentistry: R12,500/beneficiary, R16,150/family/year. 20% co-pay on instalments", annualLimitRands: 16150, coPaymentPercent: 20, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Inlays, crowns, bridges, implants, orthodontics (under 21)." },

  // ── Dental hospitalisation co-payment ─────────────────────────────────
  { ruleId: "SASOL_DENTAL_HOSP_COPAY", scheme: "SASOL", plan: "*", category: "dental", description: "Dental hospitalisation: R2,000 co-pay (under 8) / R3,500 (8+)", coPaymentRands: 2000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Only children under 8 and bony impactions." },

  // ── TTO medicine ──────────────────────────────────────────────────────
  { ruleId: "SASOL_TTO", scheme: "SASOL", plan: "*", category: "medicine_acute", description: "Take-home medicine on discharge: R930/beneficiary/admission", perEventLimitRands: 930, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Subject to medicine management protocols." },

  // ── Acute medicine ────────────────────────────────────────────────────
  { ruleId: "SASOL_ACUTE_MED_M", scheme: "SASOL", plan: "*", category: "medicine_acute", description: "Acute medicine: M=R5,940, M+1=R11,000, M+2=R13,800, M+3+=R17,600 (max R5,940/beneficiary). 20% co-pay", annualLimitRands: 5940, coPaymentPercent: 20, networkRequired: false, preAuthRequired: false, severity: "warning", notes: "Including contraceptives and alternative medicine." },

  // ── OTC / PAT medicine ────────────────────────────────────────────────
  { ruleId: "SASOL_OTC_MED", scheme: "SASOL", plan: "*", category: "medicine_otc", description: "OTC/pharmacy-advised therapy: R1,685 (single) or R2,220/family, max R345/beneficiary/day", annualLimitRands: 2220, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Subject to acute medicine limit. Vitamins/minerals excluded." },

  // ── Chronic medicine ──────────────────────────────────────────────────
  { ruleId: "SASOL_CHRONIC_MED", scheme: "SASOL", plan: "*", category: "chronic", description: "Chronic medicine: R28,400/beneficiary combined PMB + non-PMB. Then PMB unlimited", annualLimitRands: 28400, coPaymentPercent: 20, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "20% co-pay for non-formulary. Restricted: Medipost courier pharmacy. 10% co-pay on non-PMB." },

  // ── Non-oncology specialised medicine ─────────────────────────────────
  { ruleId: "SASOL_SPEC_MED", scheme: "SASOL", plan: "*", category: "medicine_acute", description: "Non-oncology specialised medicine (biologicals etc): R200,000/family", annualLimitRands: 200000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Macular degeneration sub-limit R58,150/family within R200,000." },

  // ── Oncology ──────────────────────────────────────────────────────────
  { ruleId: "SASOL_ONCOLOGY", scheme: "SASOL", plan: "*", category: "oncology", description: "Overall oncology: R625,000/family. Specialised drugs sub-limit R237,500", annualLimitRands: 625000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Brachytherapy: R55,650/family. PET scans: 2/family. Oncology specialised medicine: R237,500 sub-limit." },

  // ── Mental health ─────────────────────────────────────────────────────
  { ruleId: "SASOL_MENTAL_HEALTH", scheme: "SASOL", plan: "*", category: "mental_health", description: "Mental health overall: R61,500/family. Out-of-hospital: R21,850/family. Extra R16,250/beneficiary on programme", annualLimitRands: 61500, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Excludes medicine. SANCA/Ramot for drug/alcohol rehab. 20% co-pay if not on programme." },

  // ── Pathology out-of-hospital ─────────────────────────────────────────
  { ruleId: "SASOL_PATHOLOGY_OOH", scheme: "SASOL", plan: "*", category: "pathology", description: "Pathology out-of-hospital: R5,750/beneficiary", annualLimitRands: 5750, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Maternity, oncology, transplant, dialysis excluded from this limit." },

  // ── Physio out-of-hospital ────────────────────────────────────────────
  { ruleId: "SASOL_PHYSIO_OOH", scheme: "SASOL", plan: "*", category: "physiotherapy", description: "Physiotherapy/biokinetics/chiro out-of-hospital: subject to allied health limit R7,820/family, R5,210/beneficiary. 20% co-pay", annualLimitRands: 7820, coPaymentPercent: 20, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Post-hospitalisation: max 10 treatments within 30 days." },

  // ── Internal prostheses ───────────────────────────────────────────────
  { ruleId: "SASOL_INT_PROSTH", scheme: "SASOL", plan: "*", category: "prosthesis", description: "Internal prostheses: R68,000/beneficiary. Intraocular lens sub-limit R3,450/lens (R6,900 both)", annualLimitRands: 68000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Cochlear and dental implants excluded (separate limits)." },

  // ── External prostheses ───────────────────────────────────────────────
  { ruleId: "SASOL_EXT_PROSTH", scheme: "SASOL", plan: "*", category: "prosthesis", description: "External prostheses: R72,500/beneficiary", annualLimitRands: 72500, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Including artificial limbs, eyes, breast prostheses." },

  // ── Specialised radiology ─────────────────────────────────────────────
  { ruleId: "SASOL_SPEC_RAD", scheme: "SASOL", plan: "*", category: "radiology", description: "Specialised radiology (MRI/CT/MUGA/angiography): R26,800/family", annualLimitRands: 26800, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Bone density scans excluded from limit. Maternity/oncology/transplant/dialysis excluded." },

  // ── Optometry ─────────────────────────────────────────────────────────
  { ruleId: "SASOL_OPTOMETRY", scheme: "SASOL", plan: "*", category: "optical", description: "Optometry overall: R5,000/beneficiary per 24-month cycle. Frames R2,290, contacts R2,870", annualLimitRands: 5000, networkRequired: true, preAuthRequired: false, severity: "info", notes: "1 consultation/beneficiary/year. Iso Leso network. Restricted: network only." },

  // ── Refractive surgery ────────────────────────────────────────────────
  { ruleId: "SASOL_REFRACTIVE", scheme: "SASOL", plan: "*", category: "optical", description: "Refractive surgery (LASIK etc): R16,500/beneficiary/lifetime", annualLimitRands: 16500, networkRequired: true, preAuthRequired: true, severity: "info", notes: "Both lenses where applicable. Network compulsory." },

  // ── Organ transplant / corneal grafts ─────────────────────────────────
  { ruleId: "SASOL_CORNEAL_GRAFT", scheme: "SASOL", plan: "*", category: "hospital", description: "Corneal grafts: R41,900/beneficiary. Other organ transplants: unlimited", annualLimitRands: 41900, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Organ harvesting limited to SA except corneal grafts." },

  // ── Maternity ─────────────────────────────────────────────────────────
  { ruleId: "SASOL_MATERNITY_ANTENATAL", scheme: "SASOL", plan: "*", category: "maternity", description: "Antenatal: 12 visits/pregnancy. Antenatal classes: R550. Lactation: R730/pregnancy", annualLimitRands: 730, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Must register on Maternity Management Programme." },

  // ── Hip/knee co-payment ───────────────────────────────────────────────
  { ruleId: "SASOL_HIP_KNEE_COPAY", scheme: "SASOL", plan: "*", category: "hospital", description: "Hip/knee replacement: 20% co-payment if non-network", coPaymentPercent: 20, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Must use preferred DSP." },
];

// ─── GENESIS LIMITS (2026) ─────────────────────────────────────────────────
// Source: Genesis 2026 Benefits Brochure (11 pages)
// Plans: MED-100, MED-200, MED-200 Plus

export const GENESIS_LIMITS: BenefitLimitRule[] = [
  // ── Hospital — specialists ────────────────────────────────────────────
  { ruleId: "GEN_100_SPECIALIST", scheme: "GEN", plan: "MED-100", category: "specialist", description: "In-hospital specialists: 100% of Scheme Tariff", networkRequired: false, preAuthRequired: true, severity: "info", notes: "MED-100 base plan." },
  { ruleId: "GEN_200_SPECIALIST", scheme: "GEN", plan: "MED-200", category: "specialist", description: "In-hospital specialists: 200% of Scheme Tariff", networkRequired: false, preAuthRequired: true, severity: "info", notes: "MED-200 and MED-200 Plus." },

  // ── MRI/CT scans ──────────────────────────────────────────────────────
  { ruleId: "GEN_100_MRI_COPAY", scheme: "GEN", plan: "MED-100", category: "radiology", description: "In-hospital MRI/CT: R3,000 co-payment per scan. Excludes dento-alveolar, migraine, conservative back/neck", coPaymentRands: 3000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "MED-100 only." },
  { ruleId: "GEN_200_MRI_HOSP", scheme: "GEN", plan: "MED-200", category: "radiology", description: "In-hospital MRI/CT: 100% scheme tariff. Back/neck: 50% up to R8,400/beneficiary/year", annualLimitRands: 8400, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "MED-200 and MED-200 Plus." },
  { ruleId: "GEN_200_MRI_OOH", scheme: "GEN", plan: "MED-200", category: "radiology", description: "Out-of-hospital MRI/CT: 50% of scheme tariff, R8,400/beneficiary/year", annualLimitRands: 8400, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "MED-200 and MED-200 Plus only." },
  { ruleId: "GEN_200_XRAY_OOH", scheme: "GEN", plan: "MED-200", category: "radiology", description: "Out-of-hospital X-rays/ultrasound: 50% of scheme tariff, R5,800/beneficiary/year", annualLimitRands: 5800, networkRequired: false, preAuthRequired: false, severity: "info", notes: "MED-200 and MED-200 Plus. Includes maternity." },

  // ── Internal prostheses ───────────────────────────────────────────────
  { ruleId: "GEN_100_INT_PROSTH", scheme: "GEN", plan: "MED-100", category: "prosthesis", description: "Internal prostheses: 50% of cost up to R23,300/beneficiary/year", annualLimitRands: 23300, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "MED-100." },
  { ruleId: "GEN_200_INT_PROSTH", scheme: "GEN", plan: "MED-200", category: "prosthesis", description: "Internal prostheses: 100% of cost up to R35,000/beneficiary/year", annualLimitRands: 35000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "MED-200 and MED-200 Plus." },

  // ── External appliances ───────────────────────────────────────────────
  { ruleId: "GEN_EXT_APPLIANCES", scheme: "GEN", plan: "*", category: "prosthesis", description: "External surgical appliances (fractures): up to R20,000/beneficiary/year", annualLimitRands: 20000, networkRequired: false, preAuthRequired: true, severity: "info", notes: "All plans." },

  // ── Mental health ─────────────────────────────────────────────────────
  { ruleId: "GEN_MENTAL_HEALTH", scheme: "GEN", plan: "*", category: "mental_health", description: "Mental health: PMB only. Non-DSP out-of-hospital: R1,350/contact, R54,000/beneficiary/year", annualLimitRands: 54000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "All plans. In full at DSP." },

  // ── Cancer (MED-200/Plus) ─────────────────────────────────────────────
  { ruleId: "GEN_200_CANCER", scheme: "GEN", plan: "MED-200", category: "oncology", description: "Oncology: R275,000/beneficiary/year (consults, chemo, radio, PET, pathology, meds)", annualLimitRands: 275000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "MED-200 and MED-200 Plus. No benefit on MED-100." },

  // ── Organ transplant (MED-200/Plus) ───────────────────────────────────
  { ruleId: "GEN_200_TRANSPLANT_MEDS", scheme: "GEN", plan: "MED-200", category: "chronic", description: "Immuno-suppressant medication: R84,000/beneficiary/year", annualLimitRands: 84000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "MED-200 and MED-200 Plus. No benefit on MED-100." },

  // ── Haemodialysis (MED-200/Plus) ──────────────────────────────────────
  { ruleId: "GEN_200_DIALYSIS", scheme: "GEN", plan: "MED-200", category: "renal", description: "Haemodialysis: R300,000/beneficiary/year at Scheme Tariff", annualLimitRands: 300000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "MED-200 and MED-200 Plus. No benefit on MED-100." },

  // ── Endoscopy (MED-200/Plus) ──────────────────────────────────────────
  { ruleId: "GEN_200_COLONOSCOPY", scheme: "GEN", plan: "MED-200", category: "hospital", description: "Colonoscopy: R7,900/procedure all-inclusive. Gastroscopy: R5,300. Both: R10,300", perEventLimitRands: 7900, networkRequired: false, preAuthRequired: false, severity: "info", notes: "MED-200 and MED-200 Plus. 2 claims/beneficiary/year. Pathology R1,750/beneficiary." },

  // ── Pain relief (MED-200/Plus) ────────────────────────────────────────
  { ruleId: "GEN_200_PAIN_RELIEF", scheme: "GEN", plan: "MED-200", category: "hospital", description: "Conservative back/neck pain relief (epidural): 75% of cost, R7,500/beneficiary/year", annualLimitRands: 7500, networkRequired: false, preAuthRequired: true, severity: "info", notes: "MED-200 and MED-200 Plus." },

  // ── Self Managed Fund (MED-200 Plus) ──────────────────────────────────
  { ruleId: "GEN_200PLUS_SMF", scheme: "GEN", plan: "MED-200 Plus", category: "savings", description: "Self Managed Fund: R10,800/adult/year (pro-rated quarterly)", annualLimitRands: 10800, networkRequired: false, preAuthRequired: false, severity: "info", notes: "MED-200 Plus only. For medicines, glasses, consults, appliances, pathology at 200% scheme tariff." },

  // ── Dentistry ─────────────────────────────────────────────────────────
  { ruleId: "GEN_BASIC_DENT", scheme: "GEN", plan: "*", category: "dental", description: "Basic dentistry: 3 exams, 6 fillings, 2 root canals, 2 scale/polish, crowns/bridges/dentures R5,750, X-rays R750, 1 implant R10,000/3yr", annualLimitRands: 5750, networkRequired: false, preAuthRequired: false, severity: "info", notes: "All plans. Per beneficiary per year." },
  { ruleId: "GEN_DENTAL_HOSPITAL", scheme: "GEN", plan: "*", category: "dental", description: "In-hospital dental: wisdom teeth R15,000/case, children under 9 R10,000/case. 1 admission/beneficiary/year", perEventLimitRands: 15000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "All plans." },
  { ruleId: "GEN_DENTAL_IMPLANT", scheme: "GEN", plan: "*", category: "dental", description: "Dental implant: 1/beneficiary, R10,000 per 3-year cycle", annualLimitRands: 10000, networkRequired: false, preAuthRequired: false, severity: "info", notes: "All plans." },

  // ── Hospice (MED-200/Plus) ────────────────────────────────────────────
  { ruleId: "GEN_200_HOSPICE", scheme: "GEN", plan: "MED-200", category: "hospital", description: "Hospice: 100% cost. Home visits R200/day", networkRequired: false, preAuthRequired: false, severity: "info", notes: "MED-200 and MED-200 Plus." },
];

// ─── LA HEALTH LIMITS (2025) ───────────────────────────────────────────────
// Source: LA Health 2025 Benefit Brochure (64 pages)
// Plans: LA KeyPlus, LA Focus, LA Active, LA Core, LA Comprehensive

export const LAHEALTH_LIMITS: BenefitLimitRule[] = [
  // ── Hospital ──────────────────────────────────────────────────────────
  { ruleId: "LAH_KEYPLUS_HOSPITAL", scheme: "LAH", plan: "LA KeyPlus", category: "hospital", description: "Hospital: unlimited at KeyCare network hospitals only. Planned: pre-auth 48hrs before", networkRequired: true, preAuthRequired: true, severity: "info", notes: "No cover for non-network planned procedures. PMB in full at DSP." },
  { ruleId: "LAH_FOCUS_HOSPITAL", scheme: "LAH", plan: "LA Focus", category: "hospital", description: "Hospital: unlimited at LA Focus network. PMB at KeyCare network. Non-network: deductible applies", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Provinces with coastline: any hospital. Inland: KeyCare network." },
  { ruleId: "LAH_ACTIVE_HOSPITAL", scheme: "LAH", plan: "LA Active", category: "hospital", description: "Hospital: unlimited at any private hospital. Pre-auth required", networkRequired: false, preAuthRequired: true, severity: "info", notes: "No overall limit. Deductible if no pre-auth." },
  { ruleId: "LAH_CORE_HOSPITAL", scheme: "LAH", plan: "LA Core", category: "hospital", description: "Hospital: unlimited at any private hospital. Pre-auth required", networkRequired: false, preAuthRequired: true, severity: "info", notes: "No overall limit. Deductible if no pre-auth." },
  { ruleId: "LAH_COMP_HOSPITAL", scheme: "LAH", plan: "LA Comprehensive", category: "hospital", description: "Hospital: unlimited at any private hospital. Pre-auth required", networkRequired: false, preAuthRequired: true, severity: "info", notes: "No overall limit. Deductible if no pre-auth." },

  // ── Day-to-day structure ──────────────────────────────────────────────
  { ruleId: "LAH_KEYPLUS_D2D", scheme: "LAH", plan: "LA KeyPlus", category: "day_to_day", description: "Day-to-day: paid from Major Medical Benefit (no savings account)", networkRequired: true, preAuthRequired: false, severity: "info", notes: "Network providers only." },
  { ruleId: "LAH_FOCUS_D2D", scheme: "LAH", plan: "LA Focus", category: "day_to_day", description: "Day-to-day: Medical Savings Account, then carried-over savings", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Basic dentistry from Major Medical at network dentist." },
  { ruleId: "LAH_ACTIVE_D2D", scheme: "LAH", plan: "LA Active", category: "day_to_day", description: "Day-to-day: Medical Savings Account, then Extended Day-to-day Benefit, then carried-over savings", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Extended benefit covers GP, specialist, dental, optical, radiology, pathology, acute medicine." },
  { ruleId: "LAH_CORE_D2D", scheme: "LAH", plan: "LA Core", category: "day_to_day", description: "Day-to-day: Medical Savings Account, then Extended Day-to-day Benefit, then carried-over savings", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Same structure as LA Active." },
  { ruleId: "LAH_COMP_D2D", scheme: "LAH", plan: "LA Comprehensive", category: "day_to_day", description: "Day-to-day: Medical Savings Account, then Above Threshold Benefit, then carried-over savings", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Above Threshold activates after MSA + threshold level reached." },

  // ── External medical items ────────────────────────────────────────────
  { ruleId: "LAH_KEYPLUS_EXT_ITEMS", scheme: "LAH", plan: "LA KeyPlus", category: "prosthesis", description: "External medical items (wheelchairs, calipers): up to R10,000/family at preferred suppliers", annualLimitRands: 10000, networkRequired: true, preAuthRequired: true, severity: "info", notes: "LA KeyPlus. Preferred suppliers only." },

  // ── Maternity ─────────────────────────────────────────────────────────
  { ruleId: "LAH_MATERNITY", scheme: "LAH", plan: "*", category: "maternity", description: "Maternity: 8 antenatal consults, 2 ultrasound scans, 1 NIPT/nuchal, 5 pre/postnatal classes, blood tests", networkRequired: false, preAuthRequired: true, severity: "info", notes: "All plans. Must preauthorise delivery or register pregnancy. Baby/toddler: 2 GP visits." },

  // ── Assisted reproductive therapy ─────────────────────────────────────
  { ruleId: "LAH_COMP_ART", scheme: "LAH", plan: "LA Comprehensive", category: "hospital", description: "Assisted reproductive therapy: 75% of LA Health Rate, subject to limit", networkRequired: true, preAuthRequired: true, severity: "info", notes: "LA Comprehensive only. DSP required." },

  // ── Cancer ────────────────────────────────────────────────────────────
  { ruleId: "LAH_KEYPLUS_ONCOLOGY", scheme: "LAH", plan: "LA KeyPlus", category: "oncology", description: "Cancer: PMB types only. KeyCare ICON network oncologist required. 20% co-pay at SAOC", coPaymentPercent: 20, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "LA KeyPlus. Only PMB-listed cancers." },
  { ruleId: "LAH_OTHER_ONCOLOGY", scheme: "LAH", plan: "LA Focus", category: "oncology", description: "Cancer: Oncology Programme. Must contact before treatment", networkRequired: false, preAuthRequired: true, severity: "info", notes: "LA Focus, Active, Core, Comprehensive — broader cover." },

  // ── Chronic illness ───────────────────────────────────────────────────
  { ruleId: "LAH_CHRONIC", scheme: "LAH", plan: "*", category: "chronic", description: "Chronic: PMB CDL conditions covered on all plans. Core/Comprehensive: additional non-PMB chronic conditions", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Must register. DSP pharmacies for HIV/AIDS medicine." },
];

// ─── LIBCARE LIMITS (2026) ─────────────────────────────────────────────────
// Source: Libcare 2026 Benefit Guide (68 pages)
// Single plan: Libcare (restricted membership — Liberty Group)

export const LIBCARE_LIMITS: BenefitLimitRule[] = [
  // ── Savings ────────────────────────────────────────────────────────────
  { ruleId: "LIB_MSF", scheme: "LIB", plan: "*", category: "savings", description: "Medical Savings Facility: 16% of contribution. Credit advanced Jan 1. Positive balance rolls over", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Unused funds earn interest. Negative balance is debt." },

  // ── Hospital ──────────────────────────────────────────────────────────
  { ruleId: "LIB_HOSPITAL", scheme: "LIB", plan: "*", category: "hospital", description: "Hospital: unlimited at general ward rate. Pre-auth required (30% co-pay if not obtained)", networkRequired: false, preAuthRequired: true, severity: "info", notes: "Private ward only for medically justifiable cases." },

  // ── TTO medicine ──────────────────────────────────────────────────────
  { ruleId: "LIB_TTO", scheme: "LIB", plan: "*", category: "medicine_acute", description: "Take-home medicine on discharge: R1,730/admission", perEventLimitRands: 1730, networkRequired: false, preAuthRequired: false, severity: "info", notes: "From Major Medical Benefit." },

  // ── Alternatives to hospital ──────────────────────────────────────────
  { ruleId: "LIB_ALT_HOSP", scheme: "LIB", plan: "*", category: "hospital", description: "Alternatives to hospital (rehab facilities, excl frail care): R59,800/family", annualLimitRands: 59800, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Hospice and sub-acute: unlimited. Nursing: unlimited." },

  // ── Blood products ────────────────────────────────────────────────────
  { ruleId: "LIB_BLOOD", scheme: "LIB", plan: "*", category: "hospital", description: "Blood, blood products and transportation: R472,000/beneficiary", annualLimitRands: 472000, networkRequired: false, preAuthRequired: false, severity: "info", notes: "From Major Medical Benefit." },

  // ── Casualty ──────────────────────────────────────────────────────────
  { ruleId: "LIB_CASUALTY", scheme: "LIB", plan: "*", category: "ambulance", description: "Emergency after-hours casualty: R2,990/beneficiary", annualLimitRands: 2990, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Auth within 48 hours. After-hours and physical injury emergencies." },

  // ── Consultations out-of-hospital ─────────────────────────────────────
  { ruleId: "LIB_CONSULT_OOH", scheme: "LIB", plan: "*", category: "gp_consultation", description: "Out-of-hospital consultations: R11,050/beneficiary, R21,900/family", annualLimitRands: 21900, networkRequired: false, preAuthRequired: false, severity: "info", notes: "GPs, nurses, specialists, alternative providers, antenatal classes." },

  // ── Crime trauma ──────────────────────────────────────────────────────
  { ruleId: "LIB_CRIME_TRAUMA", scheme: "LIB", plan: "*", category: "hospital", description: "Crime trauma rehabilitation: R47,800/family. Psychologists: R6,350/beneficiary", annualLimitRands: 47800, networkRequired: false, preAuthRequired: true, severity: "info", notes: "HIV prophylaxis for rape: unlimited. 12 months max after event." },

  // ── Dentistry ─────────────────────────────────────────────────────────
  { ruleId: "LIB_BASIC_DENT", scheme: "LIB", plan: "*", category: "dental", description: "Basic dentistry: R15,600/beneficiary, R23,900/family", annualLimitRands: 23900, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Consultations, dentures, dental tech etc." },
  { ruleId: "LIB_ADV_DENT", scheme: "LIB", plan: "*", category: "dental", description: "Advanced dentistry: R30,300/family (orthodontics under 21)", annualLimitRands: 30300, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Inlays, crowns, bridges, orthodontics, oral surgery." },
  { ruleId: "LIB_DENTAL_SURG", scheme: "LIB", plan: "*", category: "dental", description: "Dental surgery (in/out hospital): R26,600/beneficiary, R39,700/family", annualLimitRands: 39700, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Implants, impacted wisdom teeth, apicectomies, GA for children under 8." },

  // ── External appliances/prostheses ────────────────────────────────────
  { ruleId: "LIB_HEARING_AIDS", scheme: "LIB", plan: "*", category: "allied_health", description: "Hearing aids: R24,700/family every 2 years. Repair: R1,870/family", annualLimitRands: 24700, networkRequired: false, preAuthRequired: false, severity: "info", notes: "1 per ear." },
  { ruleId: "LIB_STOMA", scheme: "LIB", plan: "*", category: "prosthesis", description: "Stoma products: R32,600/family", annualLimitRands: 32600, networkRequired: false, preAuthRequired: false, severity: "info", notes: "From Risk Benefit." },
  { ruleId: "LIB_HOME_OXYGEN", scheme: "LIB", plan: "*", category: "prosthesis", description: "Home oxygen, CPAP, ventilation: R32,600/family (subject to MA approval)", annualLimitRands: 32600, networkRequired: false, preAuthRequired: true, severity: "info", notes: "From Risk Benefit." },
  { ruleId: "LIB_EXT_PROSTH", scheme: "LIB", plan: "*", category: "prosthesis", description: "External prostheses: R100,000/beneficiary/year. Artificial limbs R76,700/2yr, eyes R53,700/2yr, post-mastectomy R9,600/2yr", annualLimitRands: 100000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Long-leg calipers: R10,200/beneficiary/year." },
  { ruleId: "LIB_INT_PROSTH", scheme: "LIB", plan: "*", category: "prosthesis", description: "Internal prostheses (surgically implanted): R254,500/beneficiary", annualLimitRands: 254500, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Sub-limits apply per category." },

  // ── Medicine ──────────────────────────────────────────────────────────
  { ruleId: "LIB_ACUTE_MED", scheme: "LIB", plan: "*", category: "medicine_acute", description: "Acute/routine medicine: R11,150/beneficiary, R32,450/family", annualLimitRands: 32450, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Including homeopathic medicine. Network pharmacy required." },
  { ruleId: "LIB_OTC_MED", scheme: "LIB", plan: "*", category: "medicine_otc", description: "OTC/pharmacy-advised therapy: R1,890/family", annualLimitRands: 1890, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Network pharmacy required." },
  { ruleId: "LIB_CHRONIC_MED", scheme: "LIB", plan: "*", category: "chronic", description: "Chronic medication: R49,200/beneficiary (List A: 27 PMB CDL + List B: 38 additional conditions)", annualLimitRands: 49200, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "List A unlimited above limit if approved. Must register." },

  // ── Mental health ─────────────────────────────────────────────────────
  { ruleId: "LIB_MENTAL_HOSP", scheme: "LIB", plan: "*", category: "mental_health", description: "Mental health in-hospital: R68,700/family (incl substance abuse rehab)", annualLimitRands: 68700, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Psychologists, psychiatrists, social workers." },
  { ruleId: "LIB_MENTAL_OOH", scheme: "LIB", plan: "*", category: "mental_health", description: "Mental health out-of-hospital: R15,500/beneficiary, R23,300/family", annualLimitRands: 23300, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Consultations and visits." },

  // ── Procedures out-of-hospital ────────────────────────────────────────
  { ruleId: "LIB_PROC_OOH", scheme: "LIB", plan: "*", category: "hospital", description: "Out-of-hospital procedures/tests: R6,800/beneficiary, R17,400/family", annualLimitRands: 17400, networkRequired: false, preAuthRequired: false, severity: "info", notes: "POP, stitches etc." },

  // ── Oncology ──────────────────────────────────────────────────────────
  { ruleId: "LIB_ONCOLOGY", scheme: "LIB", plan: "*", category: "oncology", description: "Oncology: R881,600/beneficiary. Specialised drugs R605,600 sub-limit. Diagnostics R88,800 sub-limit", annualLimitRands: 881600, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Must register on Oncology Management Programme. PET scans: 1/family for staging." },

  // ── Optometry ─────────────────────────────────────────────────────────
  { ruleId: "LIB_OPTOMETRY", scheme: "LIB", plan: "*", category: "optical", description: "Optometry: eye exam R900/beneficiary, frames R2,805, lenses/contacts R7,170/beneficiary R17,630/family", annualLimitRands: 17630, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Refractive surgery included in limit, subject to MA approval." },

  // ── Paramedical/allied health ─────────────────────────────────────────
  { ruleId: "LIB_PARAMEDICAL", scheme: "LIB", plan: "*", category: "allied_health", description: "Paramedical (audiology, dietetics, OT, physio, podiatry, speech, social work): R9,500/beneficiary, R13,570/family", annualLimitRands: 13570, networkRequired: false, preAuthRequired: false, severity: "info", notes: "In-hospital: unlimited. Out-of-hospital only." },

  // ── Pathology ─────────────────────────────────────────────────────────
  { ruleId: "LIB_PATHOLOGY_OOH", scheme: "LIB", plan: "*", category: "pathology", description: "Out-of-hospital pathology: R9,500/beneficiary, R13,570/family", annualLimitRands: 13570, networkRequired: false, preAuthRequired: false, severity: "info", notes: "In-hospital: unlimited." },

  // ── Radiology ─────────────────────────────────────────────────────────
  { ruleId: "LIB_RAD_MRI_HOSP", scheme: "LIB", plan: "*", category: "radiology", description: "In-hospital MRI/CT: R52,700/family", annualLimitRands: 52700, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "General in-hospital radiology: unlimited." },
  { ruleId: "LIB_RAD_OOH", scheme: "LIB", plan: "*", category: "radiology", description: "Out-of-hospital radiology (general + specialised): R9,180/beneficiary, R13,570/family", annualLimitRands: 13570, networkRequired: false, preAuthRequired: false, severity: "info", notes: "MRI/CT out-of-hospital: first 2/family from MMB, then MSF/OHEB." },

  // ── Renal dialysis ────────────────────────────────────────────────────
  { ruleId: "LIB_CHRONIC_HAEMO", scheme: "LIB", plan: "*", category: "renal", description: "Chronic haemodialysis: R529,600/beneficiary", annualLimitRands: 529600, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Peritoneal: R442,600/beneficiary. Acute: unlimited from MMB." },

  // ── Robotic surgery ───────────────────────────────────────────────────
  { ruleId: "LIB_ROBOTIC_PROSTATECTOMY", scheme: "LIB", plan: "*", category: "hospital", description: "Robotic radical prostatectomy: R212,800 (without lymph) / R222,200 (with lymph)", perEventLimitRands: 212800, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Hemicolectomy: R178,300. Partial nephrectomy: R119,500." },

  // ── Contraceptives ────────────────────────────────────────────────────
  { ruleId: "LIB_CONTRACEPTIVES", scheme: "LIB", plan: "*", category: "medicine_acute", description: "Oral/injectable contraceptives: R3,610/beneficiary. IUD/Implanon: R4,110/beneficiary", annualLimitRands: 3610, networkRequired: false, preAuthRequired: false, severity: "info", notes: "From Preventative Care Benefit." },

  // ── Emergency transport ───────────────────────────────────────────────
  { ruleId: "LIB_EMS", scheme: "LIB", plan: "*", category: "ambulance", description: "Emergency transport via Netcare 911: unlimited (local). No cover outside common monetary area", networkRequired: true, preAuthRequired: false, severity: "info", notes: "Covers SA, Namibia, Botswana, Swaziland, Lesotho, Mozambique (to Beira)." },
];

// ─── GEMS EMERALD VALUE BENEFIT LIMITS (2025) ──────────────────────────────
// Source: GEMS Emerald Value Annexure C 2025 (OCR, 78 pages)
// Scheme: GEMS, Plan: Emerald Value

export const GEMS_EMERALD_VALUE_LIMITS: BenefitLimitRule[] = [
  // ── Hospital ────────────────────────────────────────────────────────────
  { ruleId: "GEV_HOSPITAL", scheme: "GEMS", plan: "Emerald Value", category: "hospital", description: "Hospital: unlimited at 100% Scheme Rate. Must use State or Network facility; R15,000 co-pay if non-network", coPaymentRands: 15000, networkRequired: true, preAuthRequired: true, severity: "error", notes: "R1,000 co-payment if not pre-authorised 48hrs before admission." },
  { ruleId: "GEV_HOSPITAL_EMERGENCY_LATE", scheme: "GEMS", plan: "Emerald Value", category: "hospital", description: "Emergency admission: R1,000 co-payment if Scheme not notified within 1 working day", coPaymentRands: 1000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Must notify within 1 working day of emergency admission." },

  // ── Maternity ──────────────────────────────────────────────────────────
  { ruleId: "GEV_MATERNITY", scheme: "GEMS", plan: "Emerald Value", category: "maternity", description: "Maternity: unlimited at 100% Scheme Rate in State/Network facility. Includes midwife and NIPT for high-risk", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Elective C-sections subject to second opinion and managed care protocols." },

  // ── Advanced radiology ─────────────────────────────────────────────────
  { ruleId: "GEV_ADV_RADIOLOGY", scheme: "GEMS", plan: "Emerald Value", category: "radiology", description: "Advanced radiology (MRI/CT/PET/angiography): R29,694/family/year shared in- and out-of-hospital", annualLimitRands: 29694, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Shared between B8 (in-hospital) and C9 (out-of-hospital). PMBs unlimited." },

  // ── Basic radiology ────────────────────────────────────────────────────
  { ruleId: "GEV_BASIC_RAD_OOH", scheme: "GEMS", plan: "Emerald Value", category: "radiology", description: "Basic radiology out-of-hospital: R4,930/beneficiary, R9,034/family/year", annualLimitRands: 9034, perBeneficiaryLimit: 4930, networkRequired: false, preAuthRequired: false, severity: "info", notes: "X-rays and soft tissue ultrasound. Includes 2x 2D ultrasound per pregnancy." },

  // ── Physiotherapy ──────────────────────────────────────────────────────
  { ruleId: "GEV_PHYSIO_HOSP", scheme: "GEMS", plan: "Emerald Value", category: "physiotherapy", description: "Physiotherapy in-hospital: R6,673/beneficiary/year", perBeneficiaryLimit: 6673, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Subject to hospital pre-authorisation." },
  { ruleId: "GEV_PHYSIO_POST_JOINT", scheme: "GEMS", plan: "Emerald Value", category: "physiotherapy", description: "Post hip/knee/shoulder replacement physio: 10 visits, R7,044/beneficiary/event within 60 days", perEventLimitRands: 7044, visitLimit: 10, visitPeriodMonths: 2, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Shared between B12 and C1.6." },
  { ruleId: "GEV_PHYSIO_OOH", scheme: "GEMS", plan: "Emerald Value", category: "physiotherapy", description: "Physiotherapy out-of-hospital: R6,132/family, R3,066/beneficiary sub-limit within day-to-day block", annualLimitRands: 6132, perBeneficiaryLimit: 3066, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Part of C1 day-to-day block benefit." },

  // ── Transplants ────────────────────────────────────────────────────────
  { ruleId: "GEV_TRANSPLANT", scheme: "GEMS", plan: "Emerald Value", category: "hospital", description: "Organ/tissue transplants: R824,901/beneficiary/year. Corneal grafts sub-limit R28,001", annualLimitRands: 824901, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Includes all costs, materials, immunosuppressants. Organ harvesting limited to RSA (except cornea)." },

  // ── Prostheses & appliances ────────────────────────────────────────────
  { ruleId: "GEV_PROSTHESIS", scheme: "GEMS", plan: "Emerald Value", category: "prosthesis", description: "Prostheses and appliances: R56,131/family/year general + R56,131/family for joint revisions", annualLimitRands: 56131, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Shared B14/C11. Sub-limit R21,901/family for C11 out-of-hospital appliances." },
  { ruleId: "GEV_APPLIANCES_OOH", scheme: "GEMS", plan: "Emerald Value", category: "prosthesis", description: "Out-of-hospital appliances: R21,901/family sub-limit. Foot orthotics R6,164/beneficiary (shoes R1,761)", annualLimitRands: 21901, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Crutches R701/beneficiary. Wheelchair R7,716/beneficiary/24 months. Knee/back brace R3,499/beneficiary." },
  { ruleId: "GEV_HEARING_AID", scheme: "GEMS", plan: "Emerald Value", category: "prosthesis", description: "Hearing aids: R11,223/aid/beneficiary every 36 months", perEventLimitRands: 11223, networkRequired: false, preAuthRequired: true, severity: "info", notes: "One unilateral or one pair bilateral." },
  { ruleId: "GEV_CPAP", scheme: "GEMS", plan: "Emerald Value", category: "prosthesis", description: "CPAP device: R13,328/beneficiary every 36 months", perEventLimitRands: 13328, networkRequired: false, preAuthRequired: true, severity: "info", notes: "One device per beneficiary." },

  // ── CGM and insulin pumps ──────────────────────────────────────────────
  { ruleId: "GEV_CGM_DEVICES", scheme: "GEMS", plan: "Emerald Value", category: "prosthesis", description: "CGM and insulin pump devices: R59,531/family/year. One device/beneficiary/60 months", annualLimitRands: 59531, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Type 1 diabetics under 19 only. Excludes consumables (from C8.2)." },
  { ruleId: "GEV_CGM_CONSUMABLES", scheme: "GEMS", plan: "Emerald Value", category: "chronic", description: "CGM/insulin pump consumables: R28,324/beneficiary/year from chronic medication benefit", perBeneficiaryLimit: 28324, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Type 1 diabetics under 19 only." },

  // ── Renal dialysis ─────────────────────────────────────────────────────
  { ruleId: "GEV_RENAL", scheme: "GEMS", plan: "Emerald Value", category: "renal", description: "Chronic renal dialysis: R353,521/beneficiary/year. 30% co-pay if non-DSP", annualLimitRands: 353521, coPaymentPercent: 30, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Includes materials and related pathology. PMBs unlimited once limit depleted." },

  // ── Oncology ───────────────────────────────────────────────────────────
  { ruleId: "GEV_ONCOLOGY", scheme: "GEMS", plan: "Emerald Value", category: "oncology", description: "Oncology (chemo/radiotherapy): R494,945/family/year. Biologics sub-limit R336,702", annualLimitRands: 494945, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Includes pathology, radiology, medicines, materials. PMBs unlimited once depleted." },

  // ── Mental health ──────────────────────────────────────────────────────
  { ruleId: "GEV_MENTAL_HEALTH", scheme: "GEMS", plan: "Emerald Value", category: "mental_health", description: "Mental health: R24,746/family/year shared in-hospital (B18) and out-of-hospital (C10)", annualLimitRands: 24746, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Sub-limits: R7,338 OOH psychologist, R2,879 educational/industrial psychologists. Max 3 days hospitalisation by FP." },

  // ── Dental ─────────────────────────────────────────────────────────────
  { ruleId: "GEV_DENTAL", scheme: "GEMS", plan: "Emerald Value", category: "dental", description: "Dental: R6,900/beneficiary/year shared in-hospital (B6) and out-of-hospital (C2)", perBeneficiaryLimit: 6900, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Conservative, restorative, specialised dentistry. Includes dentures, implant crowns/bridges." },

  // ── Optical ────────────────────────────────────────────────────────────
  { ruleId: "GEV_OPTICAL", scheme: "GEMS", plan: "Emerald Value", category: "optical", description: "Optical: R5,942/family/year. R3,099/beneficiary/2 years. Frames max R1,636", annualLimitRands: 5942, perBeneficiaryLimit: 3099, networkRequired: false, preAuthRequired: false, severity: "info", notes: "1 eye exam/beneficiary/12 months. 1 frame + 1 pair lenses/beneficiary/24 months. Keratoconus booster R2,751/family." },

  // ── Day-to-day block benefit ───────────────────────────────────────────
  { ruleId: "GEV_D2D_BLOCK", scheme: "GEMS", plan: "Emerald Value", category: "day_to_day", description: "Day-to-day block: R12,351/family, R6,173/beneficiary/year (FP, specialist, physio, audiology, pathology)", annualLimitRands: 12351, perBeneficiaryLimit: 6173, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Pro-rated from admission date. 30% co-payment at non-nominated FP. Primary Care Extender adds R2,063/beneficiary." },

  // ── Acute medicine ─────────────────────────────────────────────────────
  { ruleId: "GEV_ACUTE_MEDICINE", scheme: "GEMS", plan: "Emerald Value", category: "medicine_acute", description: "Acute medicine: R14,847/family, R4,950/beneficiary/year. Homeopathic sub-limit R738/family", annualLimitRands: 14847, perBeneficiaryLimit: 4950, networkRequired: false, preAuthRequired: false, severity: "info", notes: "30% co-payment for out-of-formulary. TTO limited to 7 days." },

  // ── Non-PMB chronic ────────────────────────────────────────────────────
  { ruleId: "GEV_NONPMB_CHRONIC", scheme: "GEMS", plan: "Emerald Value", category: "chronic", description: "Non-PMB chronic medicine: R29,897/family, R14,847/beneficiary/year", annualLimitRands: 29897, perBeneficiaryLimit: 14847, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "30% co-payment for out-of-formulary or non-DSP pharmacy. No benefit for conditions not in Annexure D." },

  // ── Contraceptives ─────────────────────────────────────────────────────
  { ruleId: "GEV_CONTRACEPTIVES", scheme: "GEMS", plan: "Emerald Value", category: "medicine_acute", description: "Female contraceptives: R3,757/beneficiary sub-limit within acute medicine", perBeneficiaryLimit: 3757, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Oral, insertables, injectables, dermal." },

  // ── OTC / self-medication ──────────────────────────────────────────────
  { ruleId: "GEV_OTC", scheme: "GEMS", plan: "Emerald Value", category: "medicine_otc", description: "OTC self-medication: R1,994/family, R1,247/beneficiary sub-limit. R334/event limit", annualLimitRands: 1994, perBeneficiaryLimit: 1247, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Schedule 0, 1, 2 only. Within acute medicine limit." },

  // ── Allied health ──────────────────────────────────────────────────────
  { ruleId: "GEV_ALLIED_HEALTH", scheme: "GEMS", plan: "Emerald Value", category: "allied_health", description: "Allied health (chiro, homeopath, acupuncture): R2,128/family shared in- and out-of-hospital", annualLimitRands: 2128, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Shared B22/C5. Other professionals (dietician, podiatrist, social worker): R1,652/family sub-limit." },

  // ── Vaccinations ───────────────────────────────────────────────────────
  { ruleId: "GEV_VACCINATIONS", scheme: "GEMS", plan: "Emerald Value", category: "day_to_day", description: "Vaccinations: R950/beneficiary/year. Flu 1/year, pneumococcal 1/5 years, HPV 1/lifetime", annualLimitRands: 950, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Dental sealants for under 18s. Dental polishing for ages 3-9." },

  // ── Infertility ────────────────────────────────────────────────────────
  { ruleId: "GEV_INFERTILITY_COPAY", scheme: "GEMS", plan: "Emerald Value", category: "hospital", description: "Non-DSP infertility: R15,000 co-payment if not using State/Network facility", coPaymentRands: 15000, networkRequired: true, preAuthRequired: true, severity: "error", notes: "Limited to PMBs only." },

  // ── Circumcision ───────────────────────────────────────────────────────
  { ruleId: "GEV_CIRCUMCISION", scheme: "GEMS", plan: "Emerald Value", category: "hospital", description: "Circumcision: R1,994 global fee per beneficiary/year", perEventLimitRands: 1994, networkRequired: true, preAuthRequired: true, severity: "info", notes: "Includes all related costs and post-op care within month of procedure." },
];

// ─── MAKOTI BENEFIT LIMITS (2025) ──────────────────────────────────────────
// Source: Makoti 2025 Benefit Guide (19 pages)
// Scheme: MAK, Plans: Primary, Comprehensive

export const MAKOTI_LIMITS: BenefitLimitRule[] = [
  // ── Hospital — Primary ─────────────────────────────────────────────────
  { ruleId: "MAK_PRIMARY_HOSPITAL", scheme: "MAK", plan: "Primary", category: "hospital", description: "Hospital: State hospitals only. PMBs covered in full", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Primary option has no private hospital cover (except PMBs)." },

  // ── Hospital — Comprehensive ───────────────────────────────────────────
  { ruleId: "MAK_COMP_HOSPITAL", scheme: "MAK", plan: "Comprehensive", category: "hospital", description: "Hospital: unlimited in private hospitals. Step-down benefits as appropriate", networkRequired: false, preAuthRequired: true, severity: "info", notes: "Subject to pre-authorisation and clinical protocols." },

  // ── GP ─────────────────────────────────────────────────────────────────
  { ruleId: "MAK_GP", scheme: "MAK", plan: "*", category: "gp_consultation", description: "GP: unlimited at chosen GP, at Makoti Scheme tariff", networkRequired: true, preAuthRequired: false, severity: "info", notes: "Both options. Must select a nominated GP." },

  // ── OTC — Primary ──────────────────────────────────────────────────────
  { ruleId: "MAK_PRIMARY_OTC", scheme: "MAK", plan: "Primary", category: "medicine_otc", description: "OTC generic medicine: R452/family/year", annualLimitRands: 452, networkRequired: false, preAuthRequired: false, severity: "info", notes: "As per formulary." },

  // ── OTC — Comprehensive ────────────────────────────────────────────────
  { ruleId: "MAK_COMP_OTC", scheme: "MAK", plan: "Comprehensive", category: "medicine_otc", description: "OTC generic medicine: R482/family/year", annualLimitRands: 482, networkRequired: false, preAuthRequired: false, severity: "info", notes: "As per formulary." },

  // ── Maternity — Primary ────────────────────────────────────────────────
  { ruleId: "MAK_PRIMARY_MATERNITY", scheme: "MAK", plan: "Primary", category: "maternity", description: "Maternity: confinement in private hospital limited to R29,400. Pre-auth in 2nd trimester", annualLimitRands: 29400, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Primary option has a capped maternity benefit." },

  // ── Maternity — Comprehensive ──────────────────────────────────────────
  { ruleId: "MAK_COMP_MATERNITY", scheme: "MAK", plan: "Comprehensive", category: "maternity", description: "Maternity: unlimited at any private hospital. Pre-auth and protocols apply", networkRequired: false, preAuthRequired: true, severity: "info", notes: "Comprehensive option has full maternity cover." },

  // ── Internal prostheses ────────────────────────────────────────────────
  { ruleId: "MAK_PROSTHESIS", scheme: "MAK", plan: "*", category: "prosthesis", description: "Internal prostheses: R61,728/family/year. Cardiac stents limited to 3 (1 per lesion)", annualLimitRands: 61728, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Both options. Subject to pre-authorisation and clinical protocols." },

  // ── Optometry — Primary ────────────────────────────────────────────────
  { ruleId: "MAK_PRIMARY_OPTICAL", scheme: "MAK", plan: "Primary", category: "optical", description: "Optometry: R1,123/beneficiary every 24 months (includes test, frames, lenses)", perBeneficiaryLimit: 1123, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Cover only for correcting significant visual impairment (>=0.5 dioptre). No replacement of lost spectacles." },

  // ── Optometry — Comprehensive ──────────────────────────────────────────
  { ruleId: "MAK_COMP_OPTICAL", scheme: "MAK", plan: "Comprehensive", category: "optical", description: "Optometry: R3,116/beneficiary every 24 months (includes test, frames, lenses, multifocal, contacts)", perBeneficiaryLimit: 3116, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Cover only for correcting significant visual impairment (>=0.5 dioptre). No replacement of lost spectacles." },

  // ── Dentistry — Comprehensive ──────────────────────────────────────────
  { ruleId: "MAK_COMP_DENTAL", scheme: "MAK", plan: "Comprehensive", category: "dental", description: "Specialised dentistry: R4,211/family/year (includes root canal, periodontal)", annualLimitRands: 4211, networkRequired: true, preAuthRequired: true, severity: "info", notes: "Via Dental Information Systems. Conservative dentistry per managed care protocols on both plans." },

  // ── Psychology — Comprehensive ─────────────────────────────────────────
  { ruleId: "MAK_COMP_PSYCHOLOGY", scheme: "MAK", plan: "Comprehensive", category: "mental_health", description: "Clinical psychology: 8 consultations/family/year at agreed 2025 rate", visitLimit: 8, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Subject to referral from chosen GP." },

  // ── Hearing aids — Comprehensive ───────────────────────────────────────
  { ruleId: "MAK_COMP_HEARING", scheme: "MAK", plan: "Comprehensive", category: "prosthesis", description: "Hearing aids: R4,082/beneficiary every 4 years", perBeneficiaryLimit: 4082, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Comprehensive option only." },

  // ── External prostheses — Comprehensive ────────────────────────────────
  { ruleId: "MAK_COMP_EXT_PROSTHESIS", scheme: "MAK", plan: "Comprehensive", category: "prosthesis", description: "External prostheses/appliances: R4,042/family/year. Glucometer R315/member/24 months", annualLimitRands: 4042, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Includes wheelchairs, walking frames, crutches, home oxygen." },

  // ── Specialist — Primary ───────────────────────────────────────────────
  { ruleId: "MAK_PRIMARY_SPECIALIST", scheme: "MAK", plan: "Primary", category: "specialist", description: "Specialists: PMBs only, in State hospitals", networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Primary option has no private specialist cover." },

  // ── Specialist — Comprehensive ─────────────────────────────────────────
  { ruleId: "MAK_COMP_SPECIALIST", scheme: "MAK", plan: "Comprehensive", category: "specialist", description: "Specialists: 8 consultations/family/year at accredited providers", visitLimit: 8, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Subject to referral by chosen GP and managed care protocols." },

  // ── Allied health — Comprehensive ──────────────────────────────────────
  { ruleId: "MAK_COMP_ALLIED", scheme: "MAK", plan: "Comprehensive", category: "allied_health", description: "Allied health (physio, OT, dietitian, podiatry, speech, audiologist): 20 consultations/family/year", visitLimit: 20, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Subject to pre-authorisation and clinical protocols." },

  // ── Oncology ───────────────────────────────────────────────────────────
  { ruleId: "MAK_ONCOLOGY", scheme: "MAK", plan: "Comprehensive", category: "oncology", description: "Oncology: PMB level of care per ICON treatment plan. No biologicals or brachytherapy materials", networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Comprehensive option only." },

  // ── Vaccinations ───────────────────────────────────────────────────────
  { ruleId: "MAK_VACCINATIONS", scheme: "MAK", plan: "*", category: "day_to_day", description: "Flu vaccine: 1/beneficiary/year. HPV: 1/females 9-12. Pneumococcal: 1/5 years for over 65 or immune-compromised", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Both options." },

  // ── Ambulance ──────────────────────────────────────────────────────────
  { ruleId: "MAK_AMBULANCE", scheme: "MAK", plan: "*", category: "ambulance", description: "Ambulance: via Advanced Paramedic Assist (APA). Life-threatening emergencies only. Co-payment if not authorised by APA", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Call 0860 102 214. Both options." },
];

// ─── RETAIL MEDICAL SCHEME (RESOLUTION HEALTH) BENEFIT LIMITS (2026) ───────
// Source: Retail Medical Scheme 2026 Benefit Brochure (80 pages)
// Scheme: RH, Plans: Essential, Essential Plus
// Administered by Discovery Health for Shoprite Group

export const RETAIL_MEDICAL_LIMITS: BenefitLimitRule[] = [
  // ── Hospital ────────────────────────────────────────────────────────────
  { ruleId: "RH_HOSPITAL", scheme: "RH", plan: "*", category: "hospital", description: "Hospital: unlimited at 100% Scheme Rate. 20% co-payment at non-DSP for major joint replacement/psychiatric", coPaymentPercent: 20, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Both options. 30% co-payment if not pre-authorised or notified within 48hrs." },

  // ── Assisted reproductive therapy (Essential Plus only) ────────────────
  { ruleId: "RH_ART", scheme: "RH", plan: "Essential Plus", category: "hospital", description: "Assisted reproductive therapy: R140,300/person/year at 75% Scheme Rate (in addition to PMB)", annualLimitRands: 140300, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Essential Plus only. Cryopreservation paid for up to 5 years." },

  // ── Cochlear/auditory implants ─────────────────────────────────────────
  { ruleId: "RH_COCHLEAR", scheme: "RH", plan: "*", category: "prosthesis", description: "Cochlear and auditory brain implants: R288,700/beneficiary", perBeneficiaryLimit: 288700, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Both options." },

  // ── Internal nerve stimulators ─────────────────────────────────────────
  { ruleId: "RH_NERVE_STIM", scheme: "RH", plan: "*", category: "prosthesis", description: "Internal nerve stimulators: R288,700/beneficiary", perBeneficiaryLimit: 288700, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Both options." },

  // ── Day surgery deductible ─────────────────────────────────────────────
  { ruleId: "RH_DAY_SURGERY_DEDUCTIBLE", scheme: "RH", plan: "*", category: "hospital", description: "Day surgery non-network deductible: R7,250 if defined procedure done at non-network facility", coPaymentRands: 7250, networkRequired: true, preAuthRequired: true, severity: "error", notes: "Both options. Defined list of procedures must use DSP day surgery network." },

  // ── Dental deductibles ─────────────────────────────────────────────────
  { ruleId: "RH_DENTAL_DEDUCTIBLE", scheme: "RH", plan: "*", category: "dental", description: "Dental surgery deductibles: Adult day case R5,750 / in-hospital R8,950; Child <12 R1,600 / R3,470", coPaymentRands: 5750, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Both options. Dental appliances/prostheses/orthodontics limited to R71,000/person/year (Essential Plus)." },
  { ruleId: "RH_DENTAL_PROSTHESES", scheme: "RH", plan: "Essential Plus", category: "dental", description: "Dental appliances, prostheses and orthodontics: R71,000/person/year from Major Medical Benefit", annualLimitRands: 71000, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Essential Plus only. In- and out-of-hospital." },
  { ruleId: "RH_DENTAL_DEVICES_OOH", scheme: "RH", plan: "Essential Plus", category: "dental", description: "Dental devices/appliances/orthodontics out-of-hospital: R24,900/beneficiary from MSA/ATB", perBeneficiaryLimit: 24900, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Essential Plus only." },

  // ── Oncology ───────────────────────────────────────────────────────────
  { ruleId: "RH_ONCOLOGY", scheme: "RH", plan: "*", category: "oncology", description: "Oncology: unlimited, but 80% Scheme Rate after R250,000 threshold in 12-month cycle", annualLimitRands: 250000, coPaymentPercent: 20, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "PMB oncology paid in full at DSP. Bone marrow: R1M limit if non-preferred provider." },

  // ── Mental health ──────────────────────────────────────────────────────
  { ruleId: "RH_MENTAL_HEALTH", scheme: "RH", plan: "*", category: "mental_health", description: "Mental health: 21 days in-hospital OR 15 out-of-hospital sessions. 20% co-pay if non-DSP hospital", daysLimit: 21, visitLimit: 15, visitPeriodMonths: 12, coPaymentPercent: 20, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Both options. Mental Care Programme for major depression adds GP basket." },

  // ── Drug/alcohol rehab ─────────────────────────────────────────────────
  { ruleId: "RH_DRUG_REHAB", scheme: "RH", plan: "*", category: "mental_health", description: "Drug and alcohol rehabilitation: 21 days in-hospital, detox limited to 3 days", daysLimit: 21, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Both options. DSP: SANCA, Nishtara Lodge, RAMOT." },

  // ── Endoscopic procedures ──────────────────────────────────────────────
  { ruleId: "RH_ENDOSCOPY_DEDUCTIBLE", scheme: "RH", plan: "*", category: "hospital", description: "In-hospital endoscopy (gastroscopy/colonoscopy): first R5,950 payable by member", coPaymentRands: 5950, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Both options. Remainder from Core Benefit." },

  // ── Overseas treatment (Essential Plus only) ────────────────────────────
  { ruleId: "RH_OVERSEAS", scheme: "RH", plan: "Essential Plus", category: "hospital", description: "Overseas treatment: 80% of cost, limited to R617,000/beneficiary/year", annualLimitRands: 617000, coPaymentPercent: 20, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Essential Plus only. Treatment not available in SA. Member pays upfront." },

  // ── Specialty Medical Technology (Essential Plus only) ──────────────────
  { ruleId: "RH_SMTB", scheme: "RH", plan: "Essential Plus", category: "hospital", description: "Specialty Medical Technology Benefit: R200,000/beneficiary with up to 20% co-payment", annualLimitRands: 200000, coPaymentPercent: 20, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Essential Plus only. Variable co-payment based on condition." },

  // ── Maternity programme ────────────────────────────────────────────────
  { ruleId: "RH_MATERNITY", scheme: "RH", plan: "*", category: "maternity", description: "Maternity: 8 antenatal consults, 2 ultrasounds, 1 NIPT, 5 nurse classes, 2 infant visits", networkRequired: false, preAuthRequired: true, severity: "info", notes: "Both options. 2 mental health consults during/after pregnancy. 1 dietitian assessment." },

  // ── Trauma recovery ────────────────────────────────────────────────────
  { ruleId: "RH_TRAUMA_ALLIED", scheme: "RH", plan: "*", category: "allied_health", description: "Trauma recovery allied health: M=R10,200, M+1=R15,250, M+2=R19,000, M+3+=R22,900/year", annualLimitRands: 10200, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Both options. 6 counselling sessions/beneficiary. Until end of year following trauma." },
  { ruleId: "RH_TRAUMA_MEDICINE", scheme: "RH", plan: "*", category: "medicine_acute", description: "Trauma recovery medicine: M=R19,800, M+1=R23,450, M+2=R27,800, M+3+=R33,800/year", annualLimitRands: 19800, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Both options. Until end of year following trauma." },
  { ruleId: "RH_TRAUMA_APPLIANCES", scheme: "RH", plan: "*", category: "prosthesis", description: "Trauma external appliances: R31,700/family. Hearing aids R17,650. Prosthetic limbs R108,000", annualLimitRands: 31700, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Both options." },

  // ── Day-to-day — Essential ─────────────────────────────────────────────
  { ruleId: "RH_ESSENTIAL_OOH", scheme: "RH", plan: "Essential", category: "day_to_day", description: "Out-of-Hospital Benefit: R2,200/beneficiary, max R4,400/family", annualLimitRands: 4400, perBeneficiaryLimit: 2200, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Essential option. Limited pooled benefit for all day-to-day services." },

  // ── Day-to-day — Essential Plus (MSA + ATB) ────────────────────────────
  { ruleId: "RH_ESSPLUS_MSA", scheme: "RH", plan: "Essential Plus", category: "savings", description: "Medical Savings Account: P=R14,160, A=R12,120, C=R5,520 (max 3 children)", annualLimitRands: 14160, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Upfront access from 1 January. Unused funds carry over." },
  { ruleId: "RH_ESSPLUS_ATB", scheme: "RH", plan: "Essential Plus", category: "day_to_day", description: "Above Threshold Benefit: P=R15,100, A=R9,200, C=R3,200 (max 3 children)", annualLimitRands: 15100, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Activated once MSA claims reach Annual Threshold." },

  // ── Acute medicine sub-limit (Essential Plus) ──────────────────────────
  { ruleId: "RH_ESSPLUS_ACUTE_MED", scheme: "RH", plan: "Essential Plus", category: "medicine_acute", description: "Acute medicine from MSA/ATB: M=R18,700, M+1=R22,100, M+2=R26,200, M+3+=R31,750", annualLimitRands: 18700, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Preferentially priced at 100%, non-preferential at 75% Scheme Rate." },

  // ── Allied health sub-limit (Essential Plus) ───────────────────────────
  { ruleId: "RH_ESSPLUS_ALLIED", scheme: "RH", plan: "Essential Plus", category: "allied_health", description: "Allied/alternative health from MSA/ATB: M=R18,100, M+1=R24,300, M+2=R29,700, M+3+=R34,150", annualLimitRands: 18100, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Biokineticists limited to 15 treatments/year." },

  // ── Optical (Essential Plus) ───────────────────────────────────────────
  { ruleId: "RH_ESSPLUS_OPTICAL", scheme: "RH", plan: "Essential Plus", category: "optical", description: "Optical from MSA/ATB: R7,050/beneficiary sub-limit", perBeneficiaryLimit: 7050, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Essential Plus only." },

  // ── Antenatal care sub-limit (Essential Plus) ──────────────────────────
  { ruleId: "RH_ESSPLUS_ANTENATAL", scheme: "RH", plan: "Essential Plus", category: "maternity", description: "Antenatal care (if not on Maternity Programme): R2,500/beneficiary from MSA/ATB", perBeneficiaryLimit: 2500, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Essential Plus only." },

  // ── WELLTH Fund ────────────────────────────────────────────────────────
  { ruleId: "RH_WELLTH_FUND", scheme: "RH", plan: "*", category: "day_to_day", description: "WELLTH Fund: R2,500/member+adult, R1,250/child 2+, max R10,000/family. Once per lifetime", annualLimitRands: 10000, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Activated by completing screening tests at MediRite. Available for 2 benefit years." },

  // ── Screening ──────────────────────────────────────────────────────────
  { ruleId: "RH_SCREENING", scheme: "RH", plan: "*", category: "day_to_day", description: "Screening: pharmacy screening 1/year. Mammogram 1/2yrs, HPV/Pap 1/3yrs, PSA 1/year, colorectal 1/year", networkRequired: true, preAuthRequired: false, severity: "info", notes: "Both options. At DSP providers. Self-sampling kits for colorectal/HPV from DSP pharmacy." },
];

// ─── TFG MEDICAL AID BENEFIT LIMITS (2026) ─────────────────────────────────
// Source: TFG Medical Aid Annexures 2026 (102 pages)
// Scheme: TFG, Plans: TFG Health, TFG Health Plus
// Administered by Discovery Health. KeyCare network.

export const TFG_LIMITS: BenefitLimitRule[] = [
  // ── Hospital ────────────────────────────────────────────────────────────
  { ruleId: "TFG_HOSPITAL_NETWORK", scheme: "TFG", plan: "TFG Health", category: "hospital", description: "Hospital: unlimited at 100% Scheme Rate in full-cover KeyCare Network Hospital only", networkRequired: true, preAuthRequired: true, severity: "info", notes: "70% Scheme Rate at partial-cover network hospital. No cover at non-network (non-emergency)." },
  { ruleId: "TFG_HOSPITAL_NONNETWORK", scheme: "TFG", plan: "TFG Health", category: "hospital", description: "Non-network hospital (non-emergency): no cover. Emergency: 100% then transfer to network", networkRequired: true, preAuthRequired: true, severity: "error", notes: "Patient must be transferred to KeyCare Network Hospital once stabilised." },
  { ruleId: "TFG_HOME_DEDUCTIBLE", scheme: "TFG", plan: "*", category: "hospital", description: "Home-based care: R5,550 deductible for elective admissions at non-DSP facility if home-eligible", coPaymentRands: 5550, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Both plans." },
  { ruleId: "TFG_HOME_MONITOR_DEVICES", scheme: "TFG", plan: "*", category: "prosthesis", description: "Home-monitoring devices: R4,850/person/year", annualLimitRands: 4850, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Both plans. Must be approved by Scheme." },

  // ── Specialists (out-of-hospital) ──────────────────────────────────────
  { ruleId: "TFG_SPECIALIST_OOH", scheme: "TFG", plan: "TFG Health", category: "specialist", description: "Out-of-hospital specialists: R5,750/person/year (includes radiology/pathology referred). MRI/CT accumulates to this", annualLimitRands: 5750, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Must be referred by chosen KeyCare Network GP." },

  // ── GP consultations ───────────────────────────────────────────────────
  { ruleId: "TFG_GP", scheme: "TFG", plan: "TFG Health", category: "gp_consultation", description: "GP: unlimited at chosen KeyCare Network GP. Pre-auth after 15th visit/person/year. 3 emergency visits", visitLimit: 15, visitPeriodMonths: 12, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Can change GP 3 times/year." },

  // ── Out-of-network GP visits ───────────────────────────────────────────
  { ruleId: "TFG_OON_GP", scheme: "TFG", plan: "TFG Health", category: "gp_consultation", description: "Out-of-network GP: 2 consults + 2 nurse-led consults/person/year. 2 pathology + 2 radiology + 2 pharmacy claims", visitLimit: 2, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Subject to PMBs." },

  // ── Casualty ───────────────────────────────────────────────────────────
  { ruleId: "TFG_CASUALTY_COPAY", scheme: "TFG", plan: "TFG Health", category: "ambulance", description: "Casualty at KeyCare Network Hospital: first R520 payable by beneficiary", coPaymentRands: 520, networkRequired: true, preAuthRequired: true, severity: "info", notes: "Non-network casualty: no cover." },

  // ── Acute medicine ─────────────────────────────────────────────────────
  { ruleId: "TFG_ACUTE_MED", scheme: "TFG", plan: "TFG Health", category: "medicine_acute", description: "Acute medicine: unlimited within KeyCare Formulary if prescribed by chosen KeyCare Network GP", networkRequired: true, preAuthRequired: false, severity: "info", notes: "Subject to KeyCare Acute Medicine Formulary and Protocols." },

  // ── TTO medicine ───────────────────────────────────────────────────────
  { ruleId: "TFG_TTO", scheme: "TFG", plan: "*", category: "medicine_acute", description: "Medicine on discharge (TTO): R230/hospital admission", perEventLimitRands: 230, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Both plans." },

  // ── Mental health ──────────────────────────────────────────────────────
  { ruleId: "TFG_MENTAL_HEALTH", scheme: "TFG", plan: "*", category: "mental_health", description: "Mental health: 21 days in-hospital OR 15 out-of-hospital consultations. 80% Scheme Rate if non-network", daysLimit: 21, visitLimit: 15, visitPeriodMonths: 12, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Both plans. Depression management programme adds baskets of care + digital tools." },

  // ── Drug/alcohol rehab ─────────────────────────────────────────────────
  { ruleId: "TFG_DRUG_REHAB", scheme: "TFG", plan: "*", category: "mental_health", description: "Drug and alcohol rehabilitation: 21 days in-hospital/person/year", daysLimit: 21, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Both plans." },

  // ── Oncology ───────────────────────────────────────────────────────────
  { ruleId: "TFG_ONCOLOGY", scheme: "TFG", plan: "*", category: "oncology", description: "Oncology: unlimited at 100% Scheme Rate at KeyCare DPA. 80% at non-network. Non-preferred product at 80%", networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Both plans. Medicine via designated oncology pharmacy. ICON network." },

  // ── Cardiac stents ─────────────────────────────────────────────────────
  { ruleId: "TFG_STENT_NONNETWORK", scheme: "TFG", plan: "*", category: "prosthesis", description: "Cardiac stents (non-network): drug-eluting R8,150/stent, bare metal R6,400/stent per admission", perEventLimitRands: 8150, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Unlimited at network KeyCare DPA supplier." },

  // ── Dentistry ──────────────────────────────────────────────────────────
  { ruleId: "TFG_DENTAL", scheme: "TFG", plan: "TFG Health", category: "dental", description: "Dentistry: unlimited at KeyCare Network dentist. In-hospital excluded", networkRequired: true, preAuthRequired: false, severity: "info", notes: "Subject to list of codes and managed care criteria. Severe dental: in-hospital unlimited." },
  { ruleId: "TFG_DENTAL_HOSP_NONE", scheme: "TFG", plan: "TFG Health", category: "dental", description: "In-hospital dentistry (Rule 33.1.33): no cover except severe/oral procedures", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Severe dental and oral procedures covered unlimited under Rule 33.1.17." },

  // ── Optometry ──────────────────────────────────────────────────────────
  { ruleId: "TFG_OPTOMETRY", scheme: "TFG", plan: "TFG Health", category: "optical", description: "Optometry: 1 pair single/bifocal/multifocal lenses + basic frame or contacts per person every 24 months", networkRequired: true, preAuthRequired: false, severity: "info", notes: "KeyCare Network optometrist (IsoLeso) only." },

  // ── Radiology/pathology (in-hospital) ──────────────────────────────────
  { ruleId: "TFG_RAD_PATH_HOSP", scheme: "TFG", plan: "*", category: "radiology", description: "In-hospital radiology and pathology: unlimited at 100% Scheme Rate. Pathology subject to preferred provider", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Both plans." },

  // ── Basic X-rays/blood tests (out-of-hospital) ─────────────────────────
  { ruleId: "TFG_BASIC_XRAY_OOH", scheme: "TFG", plan: "TFG Health", category: "radiology", description: "Basic X-rays out-of-hospital: unlimited at KeyCare DPA if requested by chosen GP", networkRequired: true, preAuthRequired: false, severity: "info", notes: "Subject to procedure code list and PMB." },
  { ruleId: "TFG_BASIC_BLOOD_OOH", scheme: "TFG", plan: "TFG Health", category: "pathology", description: "Basic blood tests out-of-hospital: unlimited if requested by chosen KeyCare Network GP", networkRequired: true, preAuthRequired: false, severity: "info", notes: "Subject to procedure code list and PMB." },

  // ── MRI/CT (out-of-hospital) ───────────────────────────────────────────
  { ruleId: "TFG_MRI_CT_OOH", scheme: "TFG", plan: "TFG Health", category: "radiology", description: "MRI/CT out-of-hospital: accumulates to specialist limit of R5,750/person/year", annualLimitRands: 5750, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Must be referred by chosen KeyCare Network GP. At KeyCare DPA practitioners." },

  // ── Mobility devices ───────────────────────────────────────────────────
  { ruleId: "TFG_MOBILITY", scheme: "TFG", plan: "*", category: "prosthesis", description: "Mobility devices (wheelchair, callipers, crutches): R6,050/family/year", annualLimitRands: 6050, networkRequired: true, preAuthRequired: true, severity: "info", notes: "Both plans. Must be obtained from KeyCare DPA practitioner." },

  // ── Emergency transport ────────────────────────────────────────────────
  { ruleId: "TFG_EMS", scheme: "TFG", plan: "*", category: "ambulance", description: "Emergency medical services: unlimited within RSA. Inter-hospital transfer subject to pre-auth", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Both plans." },

  // ── Trauma benefit ─────────────────────────────────────────────────────
  { ruleId: "TFG_TRAUMA_EXT_ITEMS", scheme: "TFG", plan: "*", category: "prosthesis", description: "Trauma external medical items: R28,900/family/year. Prosthetic limbs R107,650/person/year", annualLimitRands: 28900, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Both plans. Cover to 31 Dec of following year." },
  { ruleId: "TFG_TRAUMA_HEARING", scheme: "TFG", plan: "*", category: "prosthesis", description: "Trauma hearing aids: R17,850/family/year", annualLimitRands: 17850, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Both plans." },
  { ruleId: "TFG_TRAUMA_ALLIED", scheme: "TFG", plan: "*", category: "allied_health", description: "Trauma allied health: M=R10,100, M+1=R15,250, M+2=R18,950, M+3+=R22,800. 6 counselling sessions/beneficiary", annualLimitRands: 10100, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Both plans. Cover to 31 Dec of following year." },
  { ruleId: "TFG_TRAUMA_MEDICINE", scheme: "TFG", plan: "*", category: "medicine_acute", description: "Trauma prescribed medicine: M=R19,700, M+1=R23,350, M+2=R27,700, M+3+=R33,700", annualLimitRands: 19700, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Both plans. Excludes OTC, optometry, dentistry." },

  // ── Maternity programme ────────────────────────────────────────────────
  { ruleId: "TFG_MATERNITY", scheme: "TFG", plan: "*", category: "maternity", description: "Maternity: 8 antenatal consults, 2 scans, 1 NIPT, 5 postnatal visits, 2 mental health, 2 infant visits", networkRequired: true, preAuthRequired: true, severity: "info", notes: "Both plans. 1 dietician assessment. KeyCare Network gynaecologist." },

  // ── Screening ──────────────────────────────────────────────────────────
  { ruleId: "TFG_FLU_VACCINE", scheme: "TFG", plan: "*", category: "day_to_day", description: "Flu vaccine: 1/person/year", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Consultation to administer from day-to-day benefits." },
  { ruleId: "TFG_PNEUMOCOCCAL", scheme: "TFG", plan: "*", category: "day_to_day", description: "Pneumococcal vaccine: 2 doses/person/lifetime", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Subject to clinical entry criteria." },
  { ruleId: "TFG_SCREENING_B", scheme: "TFG", plan: "*", category: "day_to_day", description: "Screening B: HIV unlimited, mammogram 1/2yrs, Pap smear 1/3yrs, PSA 1/year, colorectal 1/year (R1,090 limit)", annualLimitRands: 1090, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Self-sampling kits from DSP." },

  // ── Day-surgery deductible (TFG Health Plus) ───────────────────────────
  { ruleId: "TFG_PLUS_DAY_DEDUCTIBLE", scheme: "TFG", plan: "TFG Health Plus", category: "hospital", description: "TFG Health Plus: R7,250 deductible for elective day-case at non-network facility", coPaymentRands: 7250, networkRequired: true, preAuthRequired: true, severity: "error", notes: "TFG Health Plus plan. Day-case procedures per Annexure B3." },
];

// ─── ALL EXTENDED BENEFIT LIMITS ────────────────────────────────────────────

export const ALL_EXTENDED_BENEFIT_LIMITS: BenefitLimitRule[] = [
  ...MEDIHELP_LIMITS,
  ...COMPCARE_LIMITS,
  ...BANKMED_ADDITIONAL_LIMITS,
  ...PPS_LIMITS,
  ...MEDSHIELD_MEDICURVE_LIMITS,
  ...FEDHEALTH_LIMITS,
  ...REMEDI_LIMITS,
  ...BONITAS_COMPREHENSIVE_LIMITS,
  ...BONITAS_LOWER_PLAN_LIMITS,
  ...SASOLMED_LIMITS,
  ...GENESIS_LIMITS,
  ...LAHEALTH_LIMITS,
  ...LIBCARE_LIMITS,
  ...GEMS_EMERALD_VALUE_LIMITS,
  ...MAKOTI_LIMITS,
  ...RETAIL_MEDICAL_LIMITS,
  ...TFG_LIMITS,
  // GEMS_TANZANITE_LIMITS and GEMS_SAPPHIRE_LIMITS defined below — added at runtime
];

// ─── GEMS TANZANITE ONE (SAPPHIRE) BENEFIT LIMITS (2025) ────────────────────
// Source: GEMS Annexure C Tanzanite One 2025 (OCR extracted)
// Most restricted GEMS option — lowest limits, state as primary DSP

export const GEMS_TANZANITE_LIMITS: BenefitLimitRule[] = [
  { ruleId: "GEMS_TAN_HOSPITAL_LIMIT", scheme: "GEMS", plan: "Tanzanite One", category: "hospital", description: "Hospital overall limit: R316,308/family/year (lowest GEMS option)", annualLimitRands: 316308, networkRequired: true, preAuthRequired: true, severity: "error", notes: "Tanzanite One has a hard hospital limit unlike other GEMS options. State as primary DSP." },
  { ruleId: "GEMS_TAN_HOSP_COPAY", scheme: "GEMS", plan: "Tanzanite One", category: "hospital", description: "No pre-auth hospital penalty: R1,000 co-payment per admission", coPaymentRands: 1000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "48 hours before for planned, 1 working day after for emergency." },
  { ruleId: "GEMS_TAN_NON_DSP_COPAY", scheme: "GEMS", plan: "Tanzanite One", category: "hospital", description: "Non-DSP/non-State facility: R15,000 co-payment on first bill", coPaymentRands: 15000, networkRequired: true, preAuthRequired: true, severity: "error", notes: "Must use State or Network facility. Non-DSP = R15,000 penalty." },
  { ruleId: "GEMS_TAN_PROSTHESIS", scheme: "GEMS", plan: "Tanzanite One", category: "prosthesis", description: "Internal prosthesis: R37,227/family/year + R37,227 joint revisions (lowest GEMS)", annualLimitRands: 37227, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Sub-limits: R6,164 foot orthotics, R1,761 orthotic shoes. Unlimited for PMBs once depleted." },
  { ruleId: "GEMS_TAN_MENTAL_HEALTH", scheme: "GEMS", plan: "Tanzanite One", category: "mental_health", description: "Mental health: R12,652/beneficiary/year (lowest GEMS)", perBeneficiaryLimit: 12652, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Sub-limit R2,879/family for educational/industrial psychologists." },
  { ruleId: "GEMS_TAN_TRANSPLANT", scheme: "GEMS", plan: "Tanzanite One", category: "organ_transplant", description: "Organ transplant: R28,001/beneficiary for corneal grafts", perBeneficiaryLimit: 28001, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Imported corneal grafts subject to managed care." },
  { ruleId: "GEMS_TAN_PHYSIO_POST_SURG", scheme: "GEMS", plan: "Tanzanite One", category: "physiotherapy", description: "Post hip/knee/shoulder surgery physio: 10 visits, R7,044/beneficiary/event", visitLimit: 10, perBeneficiaryLimit: 7044, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Within 60 days of surgery." },
  { ruleId: "GEMS_TAN_ADV_RADIOLOGY", scheme: "GEMS", plan: "Tanzanite One", category: "radiology", description: "Advanced radiology: R10,122/beneficiary OR R15,183 if sub-limit not reached", perBeneficiaryLimit: 10122, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Lowest GEMS radiology limit. Shared with out-of-hospital." },
  { ruleId: "GEMS_TAN_PHYSIO_IN_HOSP", scheme: "GEMS", plan: "Tanzanite One", category: "physiotherapy", description: "Physiotherapy in-hospital: R3,164/beneficiary/year", perBeneficiaryLimit: 3164, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Lowest GEMS physio limit." },
  { ruleId: "GEMS_TAN_HEARING_AID", scheme: "GEMS", plan: "Tanzanite One", category: "appliance", description: "Hearing aids: R6,314/beneficiary per 36 months (lower than other GEMS options)", perBeneficiaryLimit: 6314, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Other GEMS options: R11,223. Tanzanite One significantly lower." },
  { ruleId: "GEMS_TAN_CPAP", scheme: "GEMS", plan: "Tanzanite One", category: "appliance", description: "CPAP: R8,761/beneficiary per 36 months", perBeneficiaryLimit: 8761, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Other GEMS options: R13,328." },
  { ruleId: "GEMS_TAN_WHEELCHAIR", scheme: "GEMS", plan: "Tanzanite One", category: "appliance", description: "Wheelchair: R7,716/beneficiary per 24 months", perBeneficiaryLimit: 7716, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Same as other GEMS options." },
  { ruleId: "GEMS_TAN_CRUTCHES", scheme: "GEMS", plan: "Tanzanite One", category: "appliance", description: "Crutches: R701/beneficiary/year", perBeneficiaryLimit: 701, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Same as all GEMS." },
  { ruleId: "GEMS_TAN_APPLIANCE_OOH", scheme: "GEMS", plan: "Tanzanite One", category: "appliance", description: "Out-of-hospital appliances: R8,761/family/year (lowest GEMS)", annualLimitRands: 8761, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "Other options: R21,901. Tanzanite One significantly lower." },
  { ruleId: "GEMS_TAN_OPTICAL", scheme: "GEMS", plan: "Tanzanite One", category: "optical", description: "Optical: R1,519/beneficiary per 2 years (lowest GEMS)", perBeneficiaryLimit: 1519, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Network provider only. Other options: R1,924-R3,659." },
  { ruleId: "GEMS_TAN_ALLIED_HEALTH", scheme: "GEMS", plan: "Tanzanite One", category: "allied_health", description: "Allied health (physio, OT, speech, dietitian): R2,025/family, R1,266/beneficiary/year", annualLimitRands: 2025, perBeneficiaryLimit: 1266, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Lowest GEMS allied health. Shared between all allied disciplines." },
  { ruleId: "GEMS_TAN_CHRONIC_NON_PMB", scheme: "GEMS", plan: "Tanzanite One", category: "chronic", description: "Non-PMB chronic conditions: R4,429/beneficiary/year (lowest GEMS)", perBeneficiaryLimit: 4429, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Other options: R5,567-R25,353. Formulary + DSP pharmacy required." },
  { ruleId: "GEMS_TAN_CGM_CONSUMABLES", scheme: "GEMS", plan: "Tanzanite One", category: "chronic", description: "CGM consumables: R28,324/beneficiary/year (under 19, Type 1 DM)", perBeneficiaryLimit: 28324, networkRequired: false, preAuthRequired: true, severity: "info", notes: "Same as all GEMS options." },
  { ruleId: "GEMS_TAN_CGM_DEVICE", scheme: "GEMS", plan: "Tanzanite One", category: "chronic", description: "CGM/Insulin pump devices: R59,531/family/year", annualLimitRands: 59531, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "1 device per beneficiary per 60 months. Under 19, Type 1 DM only." },
  { ruleId: "GEMS_TAN_HOMEO", scheme: "GEMS", plan: "Tanzanite One", category: "medicine_acute", description: "Homeopathic medicine: R738/family/year", annualLimitRands: 738, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Same as all GEMS options." },
  { ruleId: "GEMS_TAN_ACUTE_MED", scheme: "GEMS", plan: "Tanzanite One", category: "medicine_acute", description: "Acute medicine dispensing: R253/script x 3 scripts/beneficiary/year", perBeneficiaryLimit: 759, networkRequired: true, preAuthRequired: false, severity: "info", notes: "DSP/Network pharmacy only. 3 scripts max." },
  { ruleId: "GEMS_TAN_MINOR_AILMENT", scheme: "GEMS", plan: "Tanzanite One", category: "medicine_acute", description: "Minor ailment medicine: R120/event, R334/beneficiary/year", perBeneficiaryLimit: 334, networkRequired: true, preAuthRequired: false, severity: "info", notes: "Network pharmacist only. Schedule 0, 1, 2 medicines." },
  { ruleId: "GEMS_TAN_SPECIALIST_OOH", scheme: "GEMS", plan: "Tanzanite One", category: "specialist", description: "Specialist out-of-hospital: 70% Scheme Rate for non-network (30% co-payment)", coPaymentPercent: 30, networkRequired: false, preAuthRequired: false, severity: "warning", notes: "Highest co-payment for non-network specialist on any GEMS option." },
  { ruleId: "GEMS_TAN_VACCINATION", scheme: "GEMS", plan: "Tanzanite One", category: "gp_consultation", description: "Vaccinations: R950/beneficiary/year", perBeneficiaryLimit: 950, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Same as all GEMS." },
  { ruleId: "GEMS_TAN_CIRCUMCISION", scheme: "GEMS", plan: "Tanzanite One", category: "hospital", description: "Male circumcision: R1,994/beneficiary/year", perBeneficiaryLimit: 1994, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Global fee." },
  { ruleId: "GEMS_TAN_INFERTILITY", scheme: "GEMS", plan: "Tanzanite One", category: "maternity", description: "Infertility: PMB only. Non-DSP = R15,000 co-payment", coPaymentRands: 15000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "State or Network DSP required." },
  { ruleId: "GEMS_TAN_GP_AUTH_16TH", scheme: "GEMS", plan: "Tanzanite One", category: "gp_consultation", description: "GP consultations: auth required from 16th visit onwards (NEW 2025)", visitLimit: 15, visitPeriodMonths: 12, networkRequired: false, preAuthRequired: true, severity: "warning", notes: "First 15 visits free. Auth from 16th." },
  { ruleId: "GEMS_TAN_DENTAL_SEALANT", scheme: "GEMS", plan: "Tanzanite One", category: "dental", description: "Dental sealants: under 18 only, network provider (NEW 2025)", networkRequired: true, preAuthRequired: false, severity: "info", notes: "Preventive care benefit." },
];

// ─── GEMS SAPPHIRE (PMB-ONLY) BENEFIT LIMITS (2025) ────────────────────────
// Sapphire is GEMS' most restricted option — PMB-only, State as primary DSP
// No Annexure C available (PMB-only = no discretionary benefits to list)
// Rules derived from GEMS Main Body + scheme profiles KB

export const GEMS_SAPPHIRE_LIMITS: BenefitLimitRule[] = [
  { ruleId: "GEMS_SAPPH_HOSPITAL_PMB_ONLY", scheme: "GEMS", plan: "Sapphire", category: "hospital", description: "Hospital: PMB conditions ONLY at State facilities as primary DSP", networkRequired: true, preAuthRequired: true, severity: "error", notes: "Sapphire = PMB-only option. Private hospital only for emergencies. State is primary DSP." },
  { ruleId: "GEMS_SAPPH_HOSP_COPAY", scheme: "GEMS", plan: "Sapphire", category: "hospital", description: "No pre-auth penalty: R1,000 co-payment per admission", coPaymentRands: 1000, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Same as all GEMS options." },
  { ruleId: "GEMS_SAPPH_NON_STATE_COPAY", scheme: "GEMS", plan: "Sapphire", category: "hospital", description: "Non-State/non-DSP facility: R15,000 co-payment on first bill", coPaymentRands: 15000, networkRequired: true, preAuthRequired: true, severity: "error", notes: "Sapphire members MUST use State. Private = R15,000 penalty." },
  { ruleId: "GEMS_SAPPH_GP_PMB_ONLY", scheme: "GEMS", plan: "Sapphire", category: "gp_consultation", description: "GP: PMB conditions only. Non-PMB GP visits = member pays", networkRequired: true, preAuthRequired: false, severity: "error", notes: "No day-to-day benefit for non-PMB GP visits." },
  { ruleId: "GEMS_SAPPH_SPECIALIST_PMB", scheme: "GEMS", plan: "Sapphire", category: "specialist", description: "Specialist: PMB only. 70% Scheme Rate non-network (30% co-pay)", coPaymentPercent: 30, networkRequired: true, preAuthRequired: true, severity: "error", notes: "Non-PMB specialist = not covered." },
  { ruleId: "GEMS_SAPPH_DENTAL_PMB", scheme: "GEMS", plan: "Sapphire", category: "dental", description: "Dental: PMB only (emergency drainage, trauma). No routine dental.", networkRequired: true, preAuthRequired: true, severity: "error", notes: "No scale & polish, no fillings, no crowns unless PMB." },
  { ruleId: "GEMS_SAPPH_OPTICAL_NONE", scheme: "GEMS", plan: "Sapphire", category: "optical", description: "Optical: R0 benefit. No eye tests, no spectacles (unless PMB)", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Sapphire has zero optical benefit." },
  { ruleId: "GEMS_SAPPH_CHRONIC_PMB_CDL", scheme: "GEMS", plan: "Sapphire", category: "chronic", description: "Chronic: 27 CDL conditions only at State/DSP pharmacy. 28-day supply.", networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Non-CDL chronic = not covered." },
  { ruleId: "GEMS_SAPPH_MENTAL_PMB", scheme: "GEMS", plan: "Sapphire", category: "mental_health", description: "Mental health: PMB only (acute psychosis, attempted suicide). State facility.", networkRequired: true, preAuthRequired: true, severity: "error", notes: "No outpatient psychology/psychiatry benefit unless PMB." },
  { ruleId: "GEMS_SAPPH_ONCOLOGY_PMB", scheme: "GEMS", plan: "Sapphire", category: "oncology", description: "Oncology: PMB only at State/DSP. Private = R15,000 co-payment.", networkRequired: true, preAuthRequired: true, severity: "error", notes: "Cancer treatment only at State or designated facility." },
  { ruleId: "GEMS_SAPPH_RENAL_PMB", scheme: "GEMS", plan: "Sapphire", category: "renal", description: "Renal dialysis: PMB only at State/DSP.", networkRequired: true, preAuthRequired: true, severity: "error", notes: "Must use State dialysis unit." },
  { ruleId: "GEMS_SAPPH_MATERNITY_PMB", scheme: "GEMS", plan: "Sapphire", category: "maternity", description: "Maternity: PMB — delivery covered. Limited antenatal at State.", networkRequired: true, preAuthRequired: true, severity: "warning", notes: "State facility for delivery. Emergency C-section = PMB at any facility." },
  { ruleId: "GEMS_SAPPH_PHYSIO_NONE", scheme: "GEMS", plan: "Sapphire", category: "physiotherapy", description: "Physiotherapy: PMB only. No routine physio benefit.", networkRequired: true, preAuthRequired: false, severity: "error", notes: "Post-surgery PMB physio at State only." },
  { ruleId: "GEMS_SAPPH_ALLIED_NONE", scheme: "GEMS", plan: "Sapphire", category: "allied_health", description: "Allied health (OT, speech, dietitian): PMB only", networkRequired: true, preAuthRequired: false, severity: "error", notes: "No routine allied health benefit." },
  { ruleId: "GEMS_SAPPH_MEDICINE_NONE", scheme: "GEMS", plan: "Sapphire", category: "medicine_acute", description: "Acute medicine: PMB only. No day-to-day medicine benefit.", networkRequired: true, preAuthRequired: false, severity: "error", notes: "Member pays for all non-PMB medication." },
  { ruleId: "GEMS_SAPPH_APPLIANCE_PMB", scheme: "GEMS", plan: "Sapphire", category: "appliance", description: "Appliances: PMB only. Wheelchair/crutches only for PMB conditions.", networkRequired: true, preAuthRequired: true, severity: "error", notes: "No routine appliance benefit." },
  { ruleId: "GEMS_SAPPH_PROSTHESIS_PMB", scheme: "GEMS", plan: "Sapphire", category: "prosthesis", description: "Internal prosthesis: PMB only at State/DSP", networkRequired: true, preAuthRequired: true, severity: "error", notes: "Joint replacements, stents etc. only for PMB at State." },
  { ruleId: "GEMS_SAPPH_SCREENING", scheme: "GEMS", plan: "Sapphire", category: "gp_consultation", description: "Screening: limited preventive care as per GEMS preventive programme", networkRequired: true, preAuthRequired: false, severity: "info", notes: "Some screenings covered from Risk benefit." },
  { ruleId: "GEMS_SAPPH_VACCINATION", scheme: "GEMS", plan: "Sapphire", category: "gp_consultation", description: "Vaccinations: R950/beneficiary/year", perBeneficiaryLimit: 950, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Same as all GEMS." },
  { ruleId: "GEMS_SAPPH_CGM", scheme: "GEMS", plan: "Sapphire", category: "chronic", description: "CGM/Insulin pump: R59,531/family devices, R28,324 consumables (under 19 T1DM)", annualLimitRands: 59531, networkRequired: true, preAuthRequired: true, severity: "info", notes: "NEW 2025 — same across all GEMS options." },
  { ruleId: "GEMS_SAPPH_EMERGENCY", scheme: "GEMS", plan: "Sapphire", category: "hospital", description: "Emergency: PMB at ANY facility — no DSP restriction for emergencies", networkRequired: false, preAuthRequired: false, severity: "info", notes: "Regulation 7 — emergency PMB at any provider." },
  { ruleId: "GEMS_SAPPH_RADIOLOGY_PMB", scheme: "GEMS", plan: "Sapphire", category: "radiology", description: "Radiology: PMB only. MRI/CT requires PMB indication + pre-auth.", networkRequired: true, preAuthRequired: true, severity: "error", notes: "No routine radiology benefit." },
  { ruleId: "GEMS_SAPPH_PATHOLOGY_PMB", scheme: "GEMS", plan: "Sapphire", category: "pathology", description: "Pathology: PMB only. Blood tests only for PMB conditions.", networkRequired: true, preAuthRequired: false, severity: "error", notes: "No routine pathology benefit." },
  { ruleId: "GEMS_SAPPH_DAY_TO_DAY_ZERO", scheme: "GEMS", plan: "Sapphire", category: "day_to_day", description: "Day-to-day: R0. No savings account, no block benefit, no threshold benefit.", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Sapphire has NO day-to-day benefits. Everything is PMB-only." },
  { ruleId: "GEMS_SAPPH_AMBULANCE_PMB", scheme: "GEMS", plan: "Sapphire", category: "ambulance", description: "Ambulance: PMB emergency transport only", networkRequired: true, preAuthRequired: false, severity: "info", notes: "Non-emergency transport not covered." },
  { ruleId: "GEMS_SAPPH_INFERTILITY_PMB", scheme: "GEMS", plan: "Sapphire", category: "maternity", description: "Infertility: PMB basic investigation only at State/DSP", networkRequired: true, preAuthRequired: true, severity: "error", notes: "No IVF/ART. PMB 902M basic investigation only." },
  { ruleId: "GEMS_SAPPH_REHAB_PMB", scheme: "GEMS", plan: "Sapphire", category: "hospital", description: "Rehabilitation: PMB only — substance abuse/mental health rehab at State", networkRequired: true, preAuthRequired: true, severity: "error", notes: "21-day limit for PMB conditions. State facility." },
  { ruleId: "GEMS_SAPPH_CONTRACEPTIVE_NONE", scheme: "GEMS", plan: "Sapphire", category: "contraceptive", description: "Contraceptives: not covered (not PMB)", networkRequired: false, preAuthRequired: false, severity: "error", notes: "Member pays." },
  { ruleId: "GEMS_SAPPH_OTC_NONE", scheme: "GEMS", plan: "Sapphire", category: "medicine_otc", description: "OTC medicine: not covered", networkRequired: false, preAuthRequired: false, severity: "error", notes: "No over-the-counter benefit." },
  { ruleId: "GEMS_SAPPH_TRAVEL_NONE", scheme: "GEMS", plan: "Sapphire", category: "hospital", description: "International travel: not covered", networkRequired: false, preAuthRequired: false, severity: "error", notes: "No travel benefit on Sapphire." },
  { ruleId: "GEMS_SAPPH_GP_AUTH_16TH", scheme: "GEMS", plan: "Sapphire", category: "gp_consultation", description: "GP PMB consultations: auth required from 16th visit (NEW 2025)", visitLimit: 15, visitPeriodMonths: 12, networkRequired: true, preAuthRequired: true, severity: "warning", notes: "Even PMB GP visits require auth from 16th onwards." },
  { ruleId: "GEMS_SAPPH_DENTAL_SEALANT", scheme: "GEMS", plan: "Sapphire", category: "dental", description: "Dental sealants: under 18, network provider (NEW 2025)", networkRequired: true, preAuthRequired: false, severity: "info", notes: "Preventive care — newly added for 2025." },
  { ruleId: "GEMS_SAPPH_CIRCUMCISION", scheme: "GEMS", plan: "Sapphire", category: "hospital", description: "Male circumcision: R1,994/beneficiary", perBeneficiaryLimit: 1994, networkRequired: false, preAuthRequired: false, severity: "info", notes: "Global fee. Same across all GEMS." },
  { ruleId: "GEMS_SAPPH_TRANSPLANT_PMB", scheme: "GEMS", plan: "Sapphire", category: "organ_transplant", description: "Organ transplant: PMB only at State/DSP", networkRequired: true, preAuthRequired: true, severity: "error", notes: "Transplant managed programme via State." },
  { ruleId: "GEMS_SAPPH_WOUND_CARE_PMB", scheme: "GEMS", plan: "Sapphire", category: "wound_care", description: "Wound care: PMB only", networkRequired: true, preAuthRequired: true, severity: "error", notes: "No routine wound care benefit." },
  { ruleId: "GEMS_SAPPH_HEARING_PMB", scheme: "GEMS", plan: "Sapphire", category: "appliance", description: "Hearing aids: PMB only", networkRequired: true, preAuthRequired: true, severity: "error", notes: "No routine hearing aid benefit." },
  { ruleId: "GEMS_SAPPH_HOMEO_NONE", scheme: "GEMS", plan: "Sapphire", category: "medicine_acute", description: "Homeopathic medicine: not covered", networkRequired: false, preAuthRequired: false, severity: "error", notes: "No homeopathic benefit on Sapphire." },
  { ruleId: "GEMS_SAPPH_EXTERNAL_PMB", scheme: "GEMS", plan: "Sapphire", category: "prosthesis", description: "External prosthesis: PMB only", networkRequired: true, preAuthRequired: true, severity: "error", notes: "Artificial limbs, braces only for PMB." },
];

// ─── EXPORTS ────────────────────────────────────────────────────────────────

/** Get extended benefit limits for a scheme + plan, optionally filtered by category */
export function getBenefitLimitsExtended(
  schemeCode?: string,
  plan?: string,
  category?: BenefitCategory
): BenefitLimitRule[] {
  if (!schemeCode) return ALL_EXTENDED_BENEFIT_LIMITS;

  const upper = schemeCode.toUpperCase().trim();
  return ALL_EXTENDED_BENEFIT_LIMITS.filter((r) => {
    if (r.scheme.toUpperCase() !== upper) return false;
    if (plan && r.plan !== "*" && r.plan.toUpperCase() !== plan.toUpperCase()) return false;
    if (category && r.category !== category) return false;
    return true;
  });
}

/** Total extended benefit limit rule count */
export function getExtendedBenefitLimitRuleCount(): number {
  return ALL_EXTENDED_BENEFIT_LIMITS.length;
}
