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

// ─── ALL EXTENDED BENEFIT LIMITS ────────────────────────────────────────────

export const ALL_EXTENDED_BENEFIT_LIMITS: BenefitLimitRule[] = [
  ...MEDIHELP_LIMITS,
  ...COMPCARE_LIMITS,
  ...BANKMED_ADDITIONAL_LIMITS,
  ...PPS_LIMITS,
  ...MEDSHIELD_MEDICURVE_LIMITS,
  ...FEDHEALTH_LIMITS,
  ...REMEDI_LIMITS,
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
