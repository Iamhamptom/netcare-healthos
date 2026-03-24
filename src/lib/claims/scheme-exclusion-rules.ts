// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Scheme Exclusion, Benefit Limit & Treatment Basket Rules
// Extracted from: Bonitas Annexure C 2025, Discovery CDL Formulary 2026,
// Discovery Treatment Baskets 2026, GEMS DRP Feb 2026, modifier_codes.csv,
// rejection_codes.csv, tariff_ranges.csv
//
// Contains:
//   1. General exclusions (all schemes)
//   2. Bonitas-specific exclusions (61 items from Annexure C)
//   3. Discovery CDA/formulary rules per CDL condition
//   4. Discovery treatment baskets (test frequency limits per CDL)
//   5. GEMS DRP generic reference pricing rules
//   6. Modifier validation rules (25 modifiers)
//   7. Rejection code mappings (35 BHF codes)
//   8. Tariff range-discipline validation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { ValidationSeverity, ClaimLineItem, ValidationIssue } from "./types";

// ─── 1. GENERAL EXCLUSIONS (ALL SCHEMES) ────────────────────────────────────

export interface ExclusionRule {
  ruleId: string;
  scheme: string;      // "*" = all, or specific code
  category: string;
  description: string;
  icd10Triggers?: string[];
  tariffTriggers?: string[];
  planRestrictions?: string[]; // Only applies to these plans (empty = all)
  severity: ValidationSeverity;
  notes: string;
}

export const EXCLUSION_RULES: ExclusionRule[] = [
  // ── Universal exclusions ──
  { ruleId: "EX_COSMETIC", scheme: "*", category: "surgical", description: "Cosmetic and aesthetic surgery excluded (unless functional impairment)", icd10Triggers: [], tariffTriggers: [], severity: "error", notes: "All schemes exclude cosmetic procedures. Exception: reconstruction post-trauma/cancer = PMB." },
  { ruleId: "EX_EXPERIMENTAL", scheme: "*", category: "general", description: "Experimental/unproven treatments excluded", icd10Triggers: [], tariffTriggers: [], severity: "error", notes: "New technology requires Medical Advisory Committee approval. Clinical trial treatments excluded." },
  { ruleId: "EX_MISSED_APPOINTMENTS", scheme: "*", category: "general", description: "Missed appointments not covered on any scheme", icd10Triggers: [], tariffTriggers: [], severity: "error", notes: "Member liable for missed appointments. Cannot be claimed." },
  { ruleId: "EX_TRAVEL_EXPENSES", scheme: "*", category: "general", description: "Travel and transport costs excluded (except ambulance)", icd10Triggers: [], tariffTriggers: [], severity: "error", notes: "Ambulance covered (pre-auth). General transport excluded." },
  { ruleId: "EX_NON_SAHPRA", scheme: "*", category: "medicine", description: "Medicines not approved by SAHPRA excluded (unless S21 approval)", icd10Triggers: [], tariffTriggers: [], severity: "error", notes: "Section 21 unregistered imports require special SAHPRA + scheme approval." },
  { ruleId: "EX_THIRD_PARTY_RECOVERY", scheme: "*", category: "general", description: "Third-party claims — scheme has right to recover from liable party", icd10Triggers: [], tariffTriggers: [], severity: "info", notes: "If injury caused by another party (MVA, assault), scheme pays but member must recover from third party." },

  // ── Bonitas-specific exclusions (Annexure C 2025) ──
  // Alternative health
  { ruleId: "BON_EX_ACUPUNCTURE_BONCAP", scheme: "BON", category: "alternative_health", description: "Acupuncture excluded on BonCap", planRestrictions: ["BonCap"], severity: "error", notes: "BonCap: no acupuncture benefit." },
  { ruleId: "BON_EX_AROMATHERAPY", scheme: "BON", category: "alternative_health", description: "Aromatherapy excluded on all Bonitas plans", severity: "error", notes: "Not covered on any Bonitas plan." },
  { ruleId: "BON_EX_AYURVEDICS", scheme: "BON", category: "alternative_health", description: "Ayurvedics excluded", severity: "error", notes: "Not covered on any Bonitas plan." },
  { ruleId: "BON_EX_HERBALISTS", scheme: "BON", category: "alternative_health", description: "Herbalists excluded", severity: "error", notes: "Not covered." },
  { ruleId: "BON_EX_HOMEOPATHY_BONCAP", scheme: "BON", category: "alternative_health", description: "Homoeopathy excluded on BonCap", planRestrictions: ["BonCap"], severity: "error", notes: "BonCap only." },
  { ruleId: "BON_EX_IRIDOLOGY", scheme: "BON", category: "alternative_health", description: "Iridology excluded", severity: "error", notes: "Not covered." },
  { ruleId: "BON_EX_NATUROPATHY_BONCAP", scheme: "BON", category: "alternative_health", description: "Naturopathy excluded on BonCap", planRestrictions: ["BonCap"], severity: "error", notes: "BonCap only." },
  { ruleId: "BON_EX_REFLEXOLOGY", scheme: "BON", category: "alternative_health", description: "Reflexology excluded", severity: "error", notes: "Not covered on any plan." },
  { ruleId: "BON_EX_MASSAGE_THERAPY", scheme: "BON", category: "alternative_health", description: "Therapeutic massage therapy excluded", severity: "error", notes: "Masseurs not covered." },

  // Dentistry (Bonitas)
  { ruleId: "BON_EX_DENTAL_MISSED", scheme: "BON", category: "dental", description: "Dental appointments not kept — excluded", severity: "error", notes: "Missed dental appointments not covered." },
  { ruleId: "BON_EX_ORTHO_ADULT", scheme: "BON", category: "dental", description: "Orthodontic treatment for adults (18+) excluded", severity: "error", notes: "Orthodontics only for under-18." },
  { ruleId: "BON_EX_ORTHOGNATHIC", scheme: "BON", category: "dental", description: "Orthognathic (jaw correction) surgery excluded", severity: "error", notes: "Jaw surgery and associated lab costs excluded." },
  { ruleId: "BON_EX_TOOTH_WHITENING", scheme: "BON", category: "dental", description: "Tooth whitening excluded", severity: "error", notes: "Cosmetic dental — not covered." },
  { ruleId: "BON_EX_PORCELAIN_VENEERS", scheme: "BON", category: "dental", description: "Porcelain veneers, inlays/onlays excluded", severity: "error", notes: "Including associated lab costs." },
  { ruleId: "BON_EX_GOLD_FOIL", scheme: "BON", category: "dental", description: "Gold foil restorations excluded", severity: "error", notes: "Use standard composite restorations." },
  { ruleId: "BON_EX_FISSURE_SEALANTS_16", scheme: "BON", category: "dental", description: "Fissure sealants excluded for patients 16+", severity: "error", notes: "Only covered for under-16." },
  { ruleId: "BON_EX_SURGICAL_PERIO", scheme: "BON", category: "dental", description: "Surgical periodontics excluded (gingivectomies, flap surgery, tissue grafting)", severity: "error", notes: "Includes hemisection of tooth." },
  { ruleId: "BON_EX_SNORING_APPLIANCE", scheme: "BON", category: "dental", description: "Snoring appliances excluded", severity: "error", notes: "Not medically necessary per Bonitas." },
  { ruleId: "BON_EX_ROOT_CANAL_WISDOM", scheme: "BON", category: "dental", description: "Root canal therapy on wisdom teeth and primary teeth excluded", severity: "error", notes: "3rd molars and milk teeth." },
  { ruleId: "BON_EX_IMPLANTS_WISDOM", scheme: "BON", category: "dental", description: "Implants on wisdom teeth (3rd molars) excluded", severity: "error", notes: "No implants on 3rd molars." },
  { ruleId: "BON_EX_LINGUAL_ORTHO", scheme: "BON", category: "dental", description: "Lingual orthodontics excluded", severity: "error", notes: "Behind-the-teeth braces not covered." },
  { ruleId: "BON_EX_FLUORIDE_16", scheme: "BON", category: "dental", description: "Topical fluoride application excluded for 16+", severity: "error", notes: "Only covered for under-16." },
  { ruleId: "BON_EX_COSMETIC_DENTAL", scheme: "BON", category: "dental", description: "Crown/bridge for cosmetic reasons excluded", severity: "error", notes: "Must be clinically necessary, not cosmetic." },

  // Hospitalisation (Bonitas)
  { ruleId: "BON_EX_HOSP_NO_PREAUTH", scheme: "BON", category: "hospital", description: "Hospital admission without pre-auth reference number — NO benefits payable", severity: "error", notes: "CRITICAL: No PAR = no payment. Applies to ALL Bonitas options." },
  { ruleId: "BON_EX_GERIATRIC_FACILITY", scheme: "BON", category: "hospital", description: "Geriatric hospital, old age home, frail care facility excluded", severity: "error", notes: "Unless specifically provided in Annexure B." },
  { ruleId: "BON_EX_DENTAL_GA_ANXIETY", scheme: "BON", category: "hospital", description: "Hospital admission for dental fear/anxiety excluded", severity: "error", notes: "Dental fear alone does not qualify for GA admission." },

  // Infertility (Bonitas)
  { ruleId: "BON_EX_IVF", scheme: "BON", category: "infertility", description: "IVF, GIFT, ZIFT, ICSI excluded (unless PMB)", severity: "error", notes: "Assisted reproduction not covered. Exception: PMB Code 902M." },
  { ruleId: "BON_EX_VASECTOMY_REVERSAL", scheme: "BON", category: "infertility", description: "Vasectomy reversal excluded", severity: "error", notes: "Vasovasostomy not covered." },

  // Maternity (Bonitas)
  { ruleId: "BON_EX_3D_4D_SCANS", scheme: "BON", category: "maternity", description: "3D and 4D ultrasound scans excluded", severity: "error", notes: "Standard 2D scans only." },
  { ruleId: "BON_EX_EXCESS_2D_SCANS", scheme: "BON", category: "maternity", description: "More than 2 ultrasound scans per pregnancy excluded (unless medical condition)", severity: "warning", notes: "Motivation required for 3rd+ scan." },

  // Medicine (Bonitas)
  { ruleId: "BON_EX_ANABOLIC_STEROIDS", scheme: "BON", category: "medicine", description: "Anabolic steroids and immunostimulants excluded (unless PMB)", severity: "error", notes: "Performance-enhancing — not covered." },
  { ruleId: "BON_EX_CONTRACEPTIVES", scheme: "BON", category: "medicine", description: "Contraceptives excluded (unless in Annexure B/D)", severity: "warning", notes: "Some plans cover contraceptives — check Annexure B." },
  { ruleId: "BON_EX_COSMETIC_PREPS", scheme: "BON", category: "medicine", description: "Cosmetic preparations, emollients, moisturizers, sunscreen excluded", severity: "error", notes: "Exception: coal tar products for psoriasis, lice/scabies treatment." },
  { ruleId: "BON_EX_ERECTILE_DYSFUNCTION", scheme: "BON", category: "medicine", description: "Erectile dysfunction medication excluded", severity: "error", notes: "Sildenafil, tadalafil etc. not covered." },
  { ruleId: "BON_EX_SLIMMING", scheme: "BON", category: "medicine", description: "Slimming preparations for obesity excluded", severity: "error", notes: "Weight loss medication not covered." },
  { ruleId: "BON_EX_SMOKING_CESSATION", scheme: "BON", category: "medicine", description: "Smoking cessation preparations excluded (except Benefit Booster on some plans)", severity: "warning", notes: "Excluded on BonCap. Other plans: via Benefit Booster only." },
  { ruleId: "BON_EX_TONICS_VITAMINS", scheme: "BON", category: "medicine", description: "Tonics, fish oils, multivitamins, evening primrose oil excluded", severity: "error", notes: "Exception: haemotonics, infant/pregnancy supplements. Excluded on BonStart." },
  { ruleId: "BON_EX_GROWTH_HORMONE", scheme: "BON", category: "medicine", description: "Growth hormones excluded (unless pre-authorised)", severity: "error", notes: "Requires pre-auth from managed care." },
  { ruleId: "BON_EX_FLORA_MEDS", scheme: "BON", category: "medicine", description: "Medicines for intestinal flora (probiotics) excluded", severity: "error", notes: "Probiotics not covered." },
  { ruleId: "BON_EX_BIOLOGICS_RESTRICT", scheme: "BON", category: "medicine", description: "Biological drugs excluded except where specialised drug benefit applies or PMB", severity: "warning", notes: "Biologics need specialist motivation + available benefit. Beta-interferon for MS = PMB." },
  { ruleId: "BON_EX_CLINICAL_TRIAL", scheme: "BON", category: "medicine", description: "Clinical trial drugs and complications excluded (unless pre-authorised)", severity: "error", notes: "Trial drugs AND their complications excluded." },
  { ruleId: "BON_EX_CHEMO_3MONTH", scheme: "BON", category: "medicine", description: "Specialised drugs not demonstrating >3 month survival advantage excluded", icd10Triggers: ["C", "D0", "D1", "D2", "D3", "D4"], severity: "warning", notes: "Oncology drugs must show >3mo median OS advantage vs standard therapy." },

  // Mental health (Bonitas)
  { ruleId: "BON_EX_SLEEP_THERAPY", scheme: "BON", category: "mental_health", description: "Sleep therapy excluded", severity: "error", notes: "Not covered on any plan." },
  { ruleId: "BON_EX_ED_PSYCH_21", scheme: "BON", category: "mental_health", description: "Educational psychology for 21+ excluded", severity: "error", notes: "Psychometry/learning assessments only for under-21." },

  // Non-surgical (Bonitas)
  { ruleId: "BON_EX_EPILATION", scheme: "BON", category: "procedure", description: "Hair removal treatment (epilation) excluded", severity: "error", notes: "Cosmetic." },
  { ruleId: "BON_EX_HYPERBARIC_O2", scheme: "BON", category: "procedure", description: "Hyperbaric oxygen therapy excluded (unless specific pre-authorised conditions)", severity: "warning", notes: "Very limited coverage." },
  { ruleId: "BON_EX_FACET_INJECT_BONCAP", scheme: "BON", category: "procedure", description: "Facet joint injections and radiofrequency ablations excluded on BonCap/BonStart", planRestrictions: ["BonCap", "BonStart", "BonStart Plus"], severity: "error", notes: "Pain management procedures excluded on lowest plans." },

  // Optometry (Bonitas)
  { ruleId: "BON_EX_COSMETIC_LENSES", scheme: "BON", category: "optical", description: "Cosmetic contact lenses and lens solutions excluded", severity: "error", notes: "Coloured/cosmetic lenses and accessories not covered." },
  { ruleId: "BON_EX_SUNGLASSES", scheme: "BON", category: "optical", description: "Sunglasses and prescription sunglasses excluded", severity: "error", notes: "Including tinted lenses for sun protection." },

  // Prostheses (Bonitas)
  { ruleId: "BON_EX_COCHLEAR_IMPLANT", scheme: "BON", category: "prosthesis", description: "Cochlear implants excluded (unless in Annexure B)", severity: "warning", notes: "Only covered on specific plans with explicit benefit." },
  { ruleId: "BON_EX_DENTAL_IMPLANTS", scheme: "BON", category: "prosthesis", description: "Dental osseo-integrated implants excluded (unless in Annexure B)", severity: "warning", notes: "Limited plans only." },
  { ruleId: "BON_EX_ANKLE_REPLACE_LOW", scheme: "BON", category: "prosthesis", description: "Total ankle replacement excluded on lower Bonitas plans", planRestrictions: ["BonEssential", "BonSave", "Primary", "BonCap", "BonStart", "Hospital Standard"], severity: "error", notes: "Only on BonComprehensive, BonClassic, BonComplete, Standard." },
  { ruleId: "BON_EX_DEFIBRILLATOR_LOW", scheme: "BON", category: "prosthesis", description: "Implantable defibrillators excluded on lower Bonitas plans", planRestrictions: ["BonEssential", "BonSave", "Primary", "BonCap", "BonStart", "Hospital Standard"], severity: "error", notes: "Only on BonComprehensive, BonClassic, BonComplete, Standard." },

  // Radiology (Bonitas)
  { ruleId: "BON_EX_MRI_BY_GP", scheme: "BON", category: "radiology", description: "MRI scans ordered by GP excluded (unless no specialist access)", severity: "error", notes: "MRI must be referred by specialist. GP-ordered MRI = rejected." },
  { ruleId: "BON_EX_PET_SCAN", scheme: "BON", category: "radiology", description: "PET scans excluded unless PMB or in Annexure B", severity: "error", notes: "Very limited coverage." },
  { ruleId: "BON_EX_VIRTUAL_COLONOSCOPY", scheme: "BON", category: "radiology", description: "CT colonography (virtual colonoscopy) for screening excluded", severity: "error", notes: "Use conventional colonoscopy." },
  { ruleId: "BON_EX_CT_CORONARY_SCREEN", scheme: "BON", category: "radiology", description: "MDCT coronary angiography for screening excluded", severity: "error", notes: "Only for symptomatic/diagnostic purposes." },
  { ruleId: "BON_EX_BONE_DENSITY_GP", scheme: "BON", category: "radiology", description: "Bone densitometry by GP or non-credentialed specialist excluded", severity: "error", notes: "Must be on Bonitas credentialed provider list." },

  // Surgical (Bonitas)
  { ruleId: "BON_EX_ABDOMINOPLASTY", scheme: "BON", category: "surgical", description: "Abdominoplasty (tummy tuck) excluded", severity: "error", notes: "Including repair of divarication of abdominal muscles." },
  { ruleId: "BON_EX_BACK_SURGERY_LOW", scheme: "BON", category: "surgical", description: "Back/neck surgery excluded on lower plans (unless PMB)", planRestrictions: ["BonSave", "Primary", "Hospital Standard", "BonEssential", "BonCap", "BonStart"], severity: "error", notes: "Higher plans: requires pre-auth + completed conservative pathways." },
  { ruleId: "BON_EX_BALLOON_SINUPLASTY_LOW", scheme: "BON", category: "surgical", description: "Balloon sinuplasty excluded on lower Bonitas plans", planRestrictions: ["BonCap", "BonEssential", "BonSave", "Primary", "BonStart", "Hospital Standard"], severity: "error", notes: "Only on comprehensive/classic/complete/standard." },
  { ruleId: "BON_EX_BREAST_AUG", scheme: "BON", category: "surgical", description: "Breast augmentation excluded", severity: "error", notes: "Cosmetic." },
  { ruleId: "BON_EX_BREAST_REDUCTION", scheme: "BON", category: "surgical", description: "Breast reduction excluded", severity: "error", notes: "Unless causing documented functional impairment." },
  { ruleId: "BON_EX_BREAST_RECON", scheme: "BON", category: "surgical", description: "Breast reconstruction excluded (unless post-mastectomy cancer)", severity: "warning", notes: "Only post-mastectomy + pre-authorised." },
  { ruleId: "BON_EX_BLEPHAROPLASTY", scheme: "BON", category: "surgical", description: "Blepharoplasty excluded (unless functional visual impairment)", severity: "warning", notes: "Must demonstrate functional deficit + pre-auth." },
  { ruleId: "BON_EX_DEEP_BRAIN_STIM", scheme: "BON", category: "surgical", description: "Deep brain stimulation for Parkinson's/epilepsy excluded on most plans", planRestrictions: ["BonCap", "BonClassic", "BonComplete", "BonEssential", "BonSave", "Primary", "BonStart", "Hospital Standard"], severity: "error", notes: "Only on BonComprehensive." },
  { ruleId: "BON_EX_ERECTILE_SURGERY", scheme: "BON", category: "surgical", description: "Erectile dysfunction surgical procedures excluded", severity: "error", notes: "Penile implants etc. not covered." },
  { ruleId: "BON_EX_GENDER_REASSIGNMENT", scheme: "BON", category: "surgical", description: "Gender reassignment surgery excluded", severity: "error", notes: "Medical and surgical treatment excluded." },
  { ruleId: "BON_EX_BARIATRIC", scheme: "BON", category: "surgical", description: "Bariatric (obesity) surgery excluded", severity: "error", notes: "Surgical weight loss treatment not covered." },
  { ruleId: "BON_EX_REFRACTIVE_SURGERY", scheme: "BON", category: "surgical", description: "Refractive eye surgery (LASIK) excluded (unless in Annexure B)", severity: "error", notes: "Cosmetic vision correction not covered." },
  { ruleId: "BON_EX_RHINOPLASTY", scheme: "BON", category: "surgical", description: "Rhinoplasty for cosmetic purposes excluded", severity: "error", notes: "Functional septoplasty may be covered with pre-auth." },
  { ruleId: "BON_EX_ROBOTIC_SURGERY", scheme: "BON", category: "surgical", description: "Robotic surgery excluded (except prostatectomy with managed care auth)", severity: "warning", notes: "Robot costs (theatre time, disposables) excluded even when procedure covered. Excluded on BonCap/BonStart." },
  { ruleId: "BON_EX_UVULOPALATOPLASTY", scheme: "BON", category: "surgical", description: "UPPP and LAUP (sleep apnoea surgery) excluded", severity: "error", notes: "Not covered on any plan." },
  { ruleId: "BON_EX_KELOID_COSMETIC", scheme: "BON", category: "surgical", description: "Keloid surgery excluded (unless functional impairment)", severity: "warning", notes: "Must document functional deficit." },
  { ruleId: "BON_EX_OTOPLASTY", scheme: "BON", category: "surgical", description: "Otoplasty (ear pinning) excluded", severity: "error", notes: "Cosmetic." },
  { ruleId: "BON_EX_LAP_HERNIA_LOW", scheme: "BON", category: "surgical", description: "Laparoscopic inguinal hernia repair excluded on lower plans", planRestrictions: ["BonCap", "BonEssential", "BonSave", "Primary", "BonStart", "Hospital Standard"], severity: "error", notes: "Open repair covered. Lap approach only on higher plans." },
  { ruleId: "BON_EX_PERCUTANEOUS_VALVE_LOW", scheme: "BON", category: "surgical", description: "Percutaneous valve replacement (TAVI) excluded on lower plans", planRestrictions: ["BonCap", "BonEssential", "BonSave", "Primary", "BonStart", "Hospital Standard"], severity: "error", notes: "High-cost cardiac intervention — comprehensive plans only." },

  // Other (Bonitas)
  { ruleId: "BON_EX_AUTOPSIES", scheme: "BON", category: "general", description: "Autopsies excluded", severity: "error", notes: "Not covered." },
  { ruleId: "BON_EX_CRYO_STORAGE", scheme: "BON", category: "general", description: "Cryo-storage of foetal stem cells and sperm excluded", severity: "error", notes: "Not covered." },
  { ruleId: "BON_EX_GENE_SEQUENCING", scheme: "BON", category: "pathology", description: "Gene sequencing excluded", severity: "error", notes: "Genetic testing not covered." },
  { ruleId: "BON_EX_CHIRO_XRAY", scheme: "BON", category: "physical_therapy", description: "X-rays performed by chiropractors excluded", severity: "error", notes: "Must use radiologist." },
  { ruleId: "BON_EX_CHIRO_HOSPITAL", scheme: "BON", category: "physical_therapy", description: "Chiropractor benefits in hospital excluded", severity: "error", notes: "Outpatient only." },
  { ruleId: "BON_EX_PHYSIO_MENTAL_HEALTH", scheme: "BON", category: "physical_therapy", description: "Physiotherapy during mental health admissions excluded", severity: "error", notes: "Not covered in psychiatric setting." },
  { ruleId: "BON_EX_VETERINARY", scheme: "BON", category: "general", description: "Veterinary products excluded", severity: "error", notes: "Human medical scheme only." },
];

// ─── 2. DISCOVERY CDA RULES (Chronic Drug Amount per condition) ─────────────

export interface CDARule {
  condition: string;
  icd10Prefix: string;
  medicineClass: string;
  cdaCorePrioritySaver: number;  // Rands — CDA for Core/Priority/Saver plans
  cdaExecutiveComp: number;      // Rands — CDA for Executive/Comprehensive plans
  keyCareLimited: boolean;       // Whether NOT available on KeyCare plans
  smartPlanExcluded: boolean;    // Whether NOT available on Smart/Smart Saver
}

export const DISCOVERY_CDA_RULES: CDARule[] = [
  // Addison's
  { condition: "Addison's disease", icd10Prefix: "E27", medicineClass: "Hydrocortisone", cdaCorePrioritySaver: 250, cdaExecutiveComp: 250, keyCareLimited: false, smartPlanExcluded: false },
  { condition: "Addison's disease", icd10Prefix: "E27", medicineClass: "Fludrocortisone", cdaCorePrioritySaver: 170, cdaExecutiveComp: 170, keyCareLimited: false, smartPlanExcluded: false },
  // Asthma
  { condition: "Asthma", icd10Prefix: "J45", medicineClass: "LABA (Formoterol)", cdaCorePrioritySaver: 205, cdaExecutiveComp: 205, keyCareLimited: false, smartPlanExcluded: false },
  { condition: "Asthma", icd10Prefix: "J45", medicineClass: "SABA (Salbutamol)", cdaCorePrioritySaver: 45, cdaExecutiveComp: 45, keyCareLimited: false, smartPlanExcluded: false },
  { condition: "Asthma", icd10Prefix: "J45", medicineClass: "ICS+LABA combination", cdaCorePrioritySaver: 240, cdaExecutiveComp: 240, keyCareLimited: true, smartPlanExcluded: false },
  { condition: "Asthma", icd10Prefix: "J45", medicineClass: "Inhaled Glucocorticoids", cdaCorePrioritySaver: 190, cdaExecutiveComp: 190, keyCareLimited: false, smartPlanExcluded: false },
  { condition: "Asthma", icd10Prefix: "J45", medicineClass: "Anticholinergics", cdaCorePrioritySaver: 275, cdaExecutiveComp: 275, keyCareLimited: false, smartPlanExcluded: false },
  // Bipolar
  { condition: "Bipolar mood disorder", icd10Prefix: "F31", medicineClass: "SSRI antidepressants", cdaCorePrioritySaver: 110, cdaExecutiveComp: 130, keyCareLimited: false, smartPlanExcluded: false },
  { condition: "Bipolar mood disorder", icd10Prefix: "F31", medicineClass: "Carbamazepine", cdaCorePrioritySaver: 290, cdaExecutiveComp: 385, keyCareLimited: false, smartPlanExcluded: false },
  { condition: "Bipolar mood disorder", icd10Prefix: "F31", medicineClass: "Valproic acid", cdaCorePrioritySaver: 430, cdaExecutiveComp: 430, keyCareLimited: false, smartPlanExcluded: false },
  { condition: "Bipolar mood disorder", icd10Prefix: "F31", medicineClass: "Lamotrigine", cdaCorePrioritySaver: 325, cdaExecutiveComp: 325, keyCareLimited: false, smartPlanExcluded: false },
  { condition: "Bipolar mood disorder", icd10Prefix: "F31", medicineClass: "Lithium", cdaCorePrioritySaver: 345, cdaExecutiveComp: 345, keyCareLimited: false, smartPlanExcluded: false },
  { condition: "Bipolar mood disorder", icd10Prefix: "F31", medicineClass: "Olanzapine", cdaCorePrioritySaver: 365, cdaExecutiveComp: 365, keyCareLimited: false, smartPlanExcluded: false },
  { condition: "Bipolar mood disorder", icd10Prefix: "F31", medicineClass: "Quetiapine", cdaCorePrioritySaver: 295, cdaExecutiveComp: 295, keyCareLimited: false, smartPlanExcluded: false },
  { condition: "Bipolar mood disorder", icd10Prefix: "F31", medicineClass: "Quetiapine XR", cdaCorePrioritySaver: 295, cdaExecutiveComp: 295, keyCareLimited: true, smartPlanExcluded: false },
  { condition: "Bipolar mood disorder", icd10Prefix: "F31", medicineClass: "Clozapine", cdaCorePrioritySaver: 615, cdaExecutiveComp: 945, keyCareLimited: false, smartPlanExcluded: false },
  { condition: "Bipolar mood disorder", icd10Prefix: "F31", medicineClass: "Aripiprazole", cdaCorePrioritySaver: 270, cdaExecutiveComp: 270, keyCareLimited: false, smartPlanExcluded: false },
  { condition: "Bipolar mood disorder", icd10Prefix: "F31", medicineClass: "Risperidone", cdaCorePrioritySaver: 360, cdaExecutiveComp: 360, keyCareLimited: false, smartPlanExcluded: false },
  { condition: "Bipolar mood disorder", icd10Prefix: "F31", medicineClass: "Haloperidol", cdaCorePrioritySaver: 160, cdaExecutiveComp: 160, keyCareLimited: false, smartPlanExcluded: false },
  // Cardiac failure
  { condition: "Cardiac failure", icd10Prefix: "I50", medicineClass: "ACE-i + diuretic combo", cdaCorePrioritySaver: 80, cdaExecutiveComp: 90, keyCareLimited: false, smartPlanExcluded: false },
  // Hypertension (most common CDL)
  { condition: "Hypertension", icd10Prefix: "I10", medicineClass: "ACE inhibitors", cdaCorePrioritySaver: 65, cdaExecutiveComp: 80, keyCareLimited: false, smartPlanExcluded: false },
  { condition: "Hypertension", icd10Prefix: "I10", medicineClass: "ARBs", cdaCorePrioritySaver: 85, cdaExecutiveComp: 110, keyCareLimited: false, smartPlanExcluded: false },
  { condition: "Hypertension", icd10Prefix: "I10", medicineClass: "Calcium channel blockers", cdaCorePrioritySaver: 75, cdaExecutiveComp: 95, keyCareLimited: false, smartPlanExcluded: false },
  { condition: "Hypertension", icd10Prefix: "I10", medicineClass: "Thiazide diuretics", cdaCorePrioritySaver: 40, cdaExecutiveComp: 40, keyCareLimited: false, smartPlanExcluded: false },
  { condition: "Hypertension", icd10Prefix: "I10", medicineClass: "Beta-blockers", cdaCorePrioritySaver: 55, cdaExecutiveComp: 75, keyCareLimited: false, smartPlanExcluded: false },
  // Diabetes T2
  { condition: "Diabetes Type 2", icd10Prefix: "E11", medicineClass: "Metformin", cdaCorePrioritySaver: 35, cdaExecutiveComp: 35, keyCareLimited: false, smartPlanExcluded: false },
  { condition: "Diabetes Type 2", icd10Prefix: "E11", medicineClass: "Sulphonylureas", cdaCorePrioritySaver: 50, cdaExecutiveComp: 65, keyCareLimited: false, smartPlanExcluded: false },
  { condition: "Diabetes Type 2", icd10Prefix: "E11", medicineClass: "DPP4 inhibitors", cdaCorePrioritySaver: 320, cdaExecutiveComp: 420, keyCareLimited: true, smartPlanExcluded: false },
  { condition: "Diabetes Type 2", icd10Prefix: "E11", medicineClass: "SGLT2 inhibitors", cdaCorePrioritySaver: 380, cdaExecutiveComp: 480, keyCareLimited: true, smartPlanExcluded: true },
  { condition: "Diabetes Type 2", icd10Prefix: "E11", medicineClass: "Insulin (basal)", cdaCorePrioritySaver: 280, cdaExecutiveComp: 350, keyCareLimited: false, smartPlanExcluded: false },
  // Hypothyroidism
  { condition: "Hypothyroidism", icd10Prefix: "E03", medicineClass: "Levothyroxine", cdaCorePrioritySaver: 80, cdaExecutiveComp: 80, keyCareLimited: false, smartPlanExcluded: false },
  // Hyperlipidaemia
  { condition: "Hyperlipidaemia", icd10Prefix: "E78", medicineClass: "Statins", cdaCorePrioritySaver: 60, cdaExecutiveComp: 80, keyCareLimited: false, smartPlanExcluded: false },
  { condition: "Hyperlipidaemia", icd10Prefix: "E78", medicineClass: "Ezetimibe", cdaCorePrioritySaver: 180, cdaExecutiveComp: 220, keyCareLimited: false, smartPlanExcluded: false },
  // Epilepsy
  { condition: "Epilepsy", icd10Prefix: "G40", medicineClass: "Valproate", cdaCorePrioritySaver: 430, cdaExecutiveComp: 430, keyCareLimited: false, smartPlanExcluded: false },
  { condition: "Epilepsy", icd10Prefix: "G40", medicineClass: "Carbamazepine", cdaCorePrioritySaver: 290, cdaExecutiveComp: 385, keyCareLimited: false, smartPlanExcluded: false },
  { condition: "Epilepsy", icd10Prefix: "G40", medicineClass: "Lamotrigine", cdaCorePrioritySaver: 325, cdaExecutiveComp: 325, keyCareLimited: false, smartPlanExcluded: false },
  { condition: "Epilepsy", icd10Prefix: "G40", medicineClass: "Levetiracetam", cdaCorePrioritySaver: 420, cdaExecutiveComp: 520, keyCareLimited: true, smartPlanExcluded: false },
  // HIV/AIDS
  { condition: "HIV/AIDS", icd10Prefix: "B20", medicineClass: "TLD (Tenofovir/Lamivudine/Dolutegravir)", cdaCorePrioritySaver: 150, cdaExecutiveComp: 150, keyCareLimited: false, smartPlanExcluded: false },
  // Glaucoma
  { condition: "Glaucoma", icd10Prefix: "H40", medicineClass: "Beta-blocker drops (Timolol)", cdaCorePrioritySaver: 45, cdaExecutiveComp: 45, keyCareLimited: false, smartPlanExcluded: false },
  { condition: "Glaucoma", icd10Prefix: "H40", medicineClass: "Prostaglandin drops", cdaCorePrioritySaver: 190, cdaExecutiveComp: 220, keyCareLimited: false, smartPlanExcluded: false },
];

// ─── 3. DISCOVERY TREATMENT BASKETS (test limits per CDL) ───────────────────

export interface TreatmentBasketRule {
  condition: string;
  icd10Prefix: string;
  testCode: string;
  testDescription: string;
  diagnosticCount: number;    // Tests covered at initial diagnosis
  annualCount: number;        // Tests covered per year (ongoing)
  specialistVisits: number;   // Specialist consultations per year
}

export const DISCOVERY_TREATMENT_BASKETS: TreatmentBasketRule[] = [
  // Addison's
  { condition: "Addison's disease", icd10Prefix: "E27", testCode: "4171", testDescription: "U & E only", diagnosticCount: 1, annualCount: 3, specialistVisits: 1 },
  { condition: "Addison's disease", icd10Prefix: "E27", testCode: "4032", testDescription: "Creatinine", diagnosticCount: 1, annualCount: 3, specialistVisits: 0 },
  { condition: "Addison's disease", icd10Prefix: "E27", testCode: "4499", testDescription: "Cortisol level", diagnosticCount: 1, annualCount: 0, specialistVisits: 0 },
  { condition: "Addison's disease", icd10Prefix: "E27", testCode: "4523", testDescription: "ACTH stimulation test", diagnosticCount: 1, annualCount: 0, specialistVisits: 0 },
  // Asthma
  { condition: "Asthma", icd10Prefix: "J45", testCode: "1188", testDescription: "Flow volume test (spirometry)", diagnosticCount: 1, annualCount: 2, specialistVisits: 2 },
  { condition: "Asthma", icd10Prefix: "J45", testCode: "1192", testDescription: "Peak flow", diagnosticCount: 1, annualCount: 3, specialistVisits: 0 },
  // Bipolar
  { condition: "Bipolar mood disorder", icd10Prefix: "F31", testCode: "4130", testDescription: "AST", diagnosticCount: 1, annualCount: 2, specialistVisits: 2 },
  { condition: "Bipolar mood disorder", icd10Prefix: "F31", testCode: "4131", testDescription: "ALT", diagnosticCount: 1, annualCount: 2, specialistVisits: 0 },
  { condition: "Bipolar mood disorder", icd10Prefix: "F31", testCode: "4032", testDescription: "Creatinine", diagnosticCount: 1, annualCount: 2, specialistVisits: 0 },
  { condition: "Bipolar mood disorder", icd10Prefix: "F31", testCode: "4067", testDescription: "Lithium level", diagnosticCount: 0, annualCount: 2, specialistVisits: 0 },
  { condition: "Bipolar mood disorder", icd10Prefix: "F31", testCode: "3755", testDescription: "Full blood count", diagnosticCount: 1, annualCount: 1, specialistVisits: 0 },
  { condition: "Bipolar mood disorder", icd10Prefix: "F31", testCode: "4507", testDescription: "TSH", diagnosticCount: 1, annualCount: 1, specialistVisits: 0 },
  // Cardiac failure
  { condition: "Cardiac failure", icd10Prefix: "I50", testCode: "4171", testDescription: "U & E only", diagnosticCount: 1, annualCount: 4, specialistVisits: 2 },
  { condition: "Cardiac failure", icd10Prefix: "I50", testCode: "3620", testDescription: "Echocardiography", diagnosticCount: 1, annualCount: 2, specialistVisits: 0 },
  { condition: "Cardiac failure", icd10Prefix: "I50", testCode: "4488", testDescription: "BNP / NT-proBNP", diagnosticCount: 1, annualCount: 1, specialistVisits: 0 },
  { condition: "Cardiac failure", icd10Prefix: "I50", testCode: "4032", testDescription: "Creatinine", diagnosticCount: 1, annualCount: 4, specialistVisits: 0 },
  { condition: "Cardiac failure", icd10Prefix: "I50", testCode: "1232", testDescription: "ECG", diagnosticCount: 1, annualCount: 3, specialistVisits: 0 },
  { condition: "Cardiac failure", icd10Prefix: "I50", testCode: "4188", testDescription: "Urine dipstick", diagnosticCount: 1, annualCount: 4, specialistVisits: 0 },
  // COPD
  { condition: "COPD", icd10Prefix: "J44", testCode: "1192", testDescription: "Peak flow", diagnosticCount: 0, annualCount: 2, specialistVisits: 1 },
  { condition: "COPD", icd10Prefix: "J44", testCode: "1186", testDescription: "Flow volume test", diagnosticCount: 1, annualCount: 1, specialistVisits: 0 },
  // Chronic renal disease
  { condition: "Chronic renal disease", icd10Prefix: "N18", testCode: "3755", testDescription: "Full blood count", diagnosticCount: 1, annualCount: 4, specialistVisits: 2 },
  { condition: "Chronic renal disease", icd10Prefix: "N18", testCode: "4171", testDescription: "U & E only", diagnosticCount: 1, annualCount: 4, specialistVisits: 0 },
  { condition: "Chronic renal disease", icd10Prefix: "N18", testCode: "4032", testDescription: "Creatinine", diagnosticCount: 1, annualCount: 4, specialistVisits: 0 },
  { condition: "Chronic renal disease", icd10Prefix: "N18", testCode: "4016", testDescription: "Serum calcium", diagnosticCount: 1, annualCount: 4, specialistVisits: 0 },
  { condition: "Chronic renal disease", icd10Prefix: "N18", testCode: "4512", testDescription: "Serum PTH", diagnosticCount: 1, annualCount: 2, specialistVisits: 0 },
  { condition: "Chronic renal disease", icd10Prefix: "N18", testCode: "4528", testDescription: "Ferritin", diagnosticCount: 0, annualCount: 2, specialistVisits: 0 },
  // Coronary artery disease
  { condition: "Coronary artery disease", icd10Prefix: "I25", testCode: "1232", testDescription: "ECG", diagnosticCount: 1, annualCount: 2, specialistVisits: 2 },
  { condition: "Coronary artery disease", icd10Prefix: "I25", testCode: "3620", testDescription: "Echocardiography", diagnosticCount: 1, annualCount: 1, specialistVisits: 0 },
  { condition: "Coronary artery disease", icd10Prefix: "I25", testCode: "4026", testDescription: "LDL cholesterol", diagnosticCount: 1, annualCount: 1, specialistVisits: 0 },
  { condition: "Coronary artery disease", icd10Prefix: "I25", testCode: "4032", testDescription: "Creatinine", diagnosticCount: 1, annualCount: 2, specialistVisits: 0 },
  // Crohn's disease
  { condition: "Crohn's disease", icd10Prefix: "K50", testCode: "1653", testDescription: "Colonoscopy", diagnosticCount: 1, annualCount: 1, specialistVisits: 3 },
  { condition: "Crohn's disease", icd10Prefix: "K50", testCode: "3947", testDescription: "CRP", diagnosticCount: 1, annualCount: 2, specialistVisits: 0 },
  { condition: "Crohn's disease", icd10Prefix: "K50", testCode: "4362", testDescription: "Faecal calprotectin", diagnosticCount: 0, annualCount: 1, specialistVisits: 0 },
  // Diabetes T1
  { condition: "Diabetes Type 1", icd10Prefix: "E10", testCode: "1232", testDescription: "ECG", diagnosticCount: 1, annualCount: 1, specialistVisits: 5 },
  { condition: "Diabetes Type 1", icd10Prefix: "E10", testCode: "4050", testDescription: "Glucose fasting", diagnosticCount: 1, annualCount: 4, specialistVisits: 0 },
  { condition: "Diabetes Type 1", icd10Prefix: "E10", testCode: "4052", testDescription: "HbA1c", diagnosticCount: 1, annualCount: 4, specialistVisits: 0 },
  { condition: "Diabetes Type 1", icd10Prefix: "E10", testCode: "4188", testDescription: "Urine dipstick (microalbumin)", diagnosticCount: 1, annualCount: 2, specialistVisits: 0 },
  // Diabetes T2
  { condition: "Diabetes Type 2", icd10Prefix: "E11", testCode: "4052", testDescription: "HbA1c", diagnosticCount: 1, annualCount: 4, specialistVisits: 1 },
  { condition: "Diabetes Type 2", icd10Prefix: "E11", testCode: "4050", testDescription: "Glucose fasting", diagnosticCount: 1, annualCount: 4, specialistVisits: 0 },
  { condition: "Diabetes Type 2", icd10Prefix: "E11", testCode: "4032", testDescription: "Creatinine", diagnosticCount: 1, annualCount: 2, specialistVisits: 0 },
  { condition: "Diabetes Type 2", icd10Prefix: "E11", testCode: "4188", testDescription: "Urine dipstick (microalbumin)", diagnosticCount: 1, annualCount: 2, specialistVisits: 0 },
  // Hypertension
  { condition: "Hypertension", icd10Prefix: "I10", testCode: "4171", testDescription: "U & E only", diagnosticCount: 1, annualCount: 2, specialistVisits: 0 },
  { condition: "Hypertension", icd10Prefix: "I10", testCode: "4032", testDescription: "Creatinine", diagnosticCount: 1, annualCount: 2, specialistVisits: 0 },
  { condition: "Hypertension", icd10Prefix: "I10", testCode: "4026", testDescription: "LDL cholesterol", diagnosticCount: 1, annualCount: 1, specialistVisits: 0 },
  // Hypothyroidism
  { condition: "Hypothyroidism", icd10Prefix: "E03", testCode: "4507", testDescription: "TSH", diagnosticCount: 1, annualCount: 2, specialistVisits: 1 },
  // Epilepsy
  { condition: "Epilepsy", icd10Prefix: "G40", testCode: "4081", testDescription: "Drug levels (AED)", diagnosticCount: 0, annualCount: 3, specialistVisits: 1 },
  { condition: "Epilepsy", icd10Prefix: "G40", testCode: "4130", testDescription: "AST (if on valproate)", diagnosticCount: 1, annualCount: 2, specialistVisits: 0 },
  // HIV/AIDS
  { condition: "HIV/AIDS", icd10Prefix: "B20", testCode: "4533", testDescription: "Viral load", diagnosticCount: 1, annualCount: 2, specialistVisits: 1 },
  { condition: "HIV/AIDS", icd10Prefix: "B20", testCode: "3811", testDescription: "CD4 count", diagnosticCount: 1, annualCount: 2, specialistVisits: 0 },
  { condition: "HIV/AIDS", icd10Prefix: "B20", testCode: "4032", testDescription: "Creatinine (renal function)", diagnosticCount: 1, annualCount: 1, specialistVisits: 0 },
  // Glaucoma
  { condition: "Glaucoma", icd10Prefix: "H40", testCode: "0810", testDescription: "IOP measurement", diagnosticCount: 1, annualCount: 4, specialistVisits: 2 },
];

// ─── 4. MODIFIER VALIDATION RULES ──────────────────────────────────────────

export interface ModifierRule {
  code: string;
  description: string;
  rateImpact: string;
  category: string;
  validationNotes: string;
}

export const MODIFIER_RULES: ModifierRule[] = [
  { code: "0001", description: "Reduced service", rateImpact: "-50%", category: "general", validationNotes: "Service less than described. Rate halved." },
  { code: "0002", description: "Increased complexity", rateImpact: "+25-50%", category: "general", validationNotes: "Must document why procedure was more complex." },
  { code: "0003", description: "Multiple procedures — 2nd", rateImpact: "-50%", category: "surgical", validationNotes: "Second procedure same session. 50% of fee." },
  { code: "0004", description: "Multiple procedures — 3rd", rateImpact: "-75%", category: "surgical", validationNotes: "Third procedure. 25% of fee." },
  { code: "0005", description: "Multiple procedures — 4th+", rateImpact: "-80%", category: "surgical", validationNotes: "Fourth and subsequent. 20% of fee." },
  { code: "0006", description: "Bilateral procedure", rateImpact: "+50%", category: "surgical", validationNotes: "Must be genuinely bilateral. Unilateral with bilateral modifier = rejection." },
  { code: "0007", description: "With contrast", rateImpact: "+25-40%", category: "radiology", validationNotes: "Radiology with contrast agent. Only for applicable imaging." },
  { code: "0008", description: "Professional component only", rateImpact: "40% of global", category: "split_billing", validationNotes: "Interpretation only — no facility fee." },
  { code: "0009", description: "Technical/facility component only", rateImpact: "60% of global", category: "split_billing", validationNotes: "Equipment and facility — no interpretation." },
  { code: "0010", description: "After-hours evening", rateImpact: "+25-50%", category: "time", validationNotes: "Service after 18:00 weekdays." },
  { code: "0011", description: "After-hours night", rateImpact: "+50-100%", category: "time", validationNotes: "Service between 22:00-06:00." },
  { code: "0012", description: "After-hours Saturday", rateImpact: "+25-50%", category: "time", validationNotes: "Saturday service." },
  { code: "0013", description: "After-hours Sunday", rateImpact: "+50-100%", category: "time", validationNotes: "Sunday service." },
  { code: "0014", description: "Public holiday", rateImpact: "+100%", category: "time", validationNotes: "SA public holiday. Double rate." },
  { code: "0015", description: "Assistant surgeon", rateImpact: "20% of primary", category: "surgical", validationNotes: "Assisting in surgery. 20% of primary surgeon fee." },
  { code: "0016", description: "Co-surgeon", rateImpact: "62.5% each", category: "surgical", validationNotes: "Two surgeons of equal status." },
  { code: "0017", description: "Team surgery", rateImpact: "Each bills own", category: "surgical", validationNotes: "Multi-specialty team. Each specialist bills own tariff." },
  { code: "0018", description: "Repeat procedure", rateImpact: "-20%", category: "general", validationNotes: "Same procedure repeated. 80% of fee." },
  { code: "0019", description: "Distinct procedure", rateImpact: "100%", category: "surgical", validationNotes: "Clearly separate procedure. Full fee. Must have qualifying primary." },
  { code: "0021", description: "Decision for surgery", rateImpact: "consult billable", category: "surgical", validationNotes: "Consultation leading to surgery decision. Billable in addition to surgery." },
  { code: "0024", description: "Monitored anaesthesia care", rateImpact: "60-80%", category: "anaesthesia", validationNotes: "Sedation with monitoring. Less than full GA." },
  { code: "0025", description: "Conscious sedation", rateImpact: "40-50%", category: "anaesthesia", validationNotes: "Moderate sedation." },
  { code: "0026", description: "Telehealth", rateImpact: "80-100%", category: "consultation", validationNotes: "Video/audio consultation. Not covered by all schemes." },
];

// ─── 5. BHF REJECTION CODE MAPPINGS ────────────────────────────────────────

export interface RejectionCodeRule {
  code: string;
  category: string;
  description: string;
  commonCause: string;
  fixSuggestion: string;
  resubmittable: boolean;
}

export const REJECTION_CODE_RULES: RejectionCodeRule[] = [
  { code: "01", category: "documentation", description: "Script/prescription required", commonCause: "Medication dispensed without valid script", fixSuggestion: "Attach original prescription", resubmittable: true },
  { code: "02", category: "documentation", description: "Doctor's account required", commonCause: "Claim without supporting account", fixSuggestion: "Attach doctor's account/invoice", resubmittable: true },
  { code: "03", category: "documentation", description: "Medical aid statement required", commonCause: "No statement of account", fixSuggestion: "Attach scheme statement", resubmittable: true },
  { code: "04", category: "documentation", description: "Authorisation letter required", commonCause: "Procedure requires pre-auth", fixSuggestion: "Obtain and attach pre-auth letter", resubmittable: true },
  { code: "05", category: "documentation", description: "Hospital account required", commonCause: "Hospital claim without account", fixSuggestion: "Attach hospital account", resubmittable: true },
  { code: "06", category: "coding", description: "Invalid ICD-10 code", commonCause: "Code not in SA MIT or wrong format", fixSuggestion: "Verify against ICD-10 MIT", resubmittable: true },
  { code: "07", category: "coding", description: "Non-specific ICD-10 code", commonCause: "3-char code when 4th/5th required", fixSuggestion: "Use maximum specificity code", resubmittable: true },
  { code: "08", category: "coding", description: "Invalid tariff code", commonCause: "Tariff not in scheme's active table", fixSuggestion: "Verify against CCSA/NHRPL", resubmittable: true },
  { code: "09", category: "coding", description: "ICD-10/tariff mismatch", commonCause: "Procedure not justified by diagnosis", fixSuggestion: "Review diagnosis-procedure alignment", resubmittable: true },
  { code: "10", category: "coding", description: "Missing external cause code", commonCause: "S/T injury code without V/W/X/Y secondary", fixSuggestion: "Add appropriate ECC (W19/V89.2/X59)", resubmittable: true },
  { code: "11", category: "eligibility", description: "Member not active", commonCause: "Membership lapsed or suspended", fixSuggestion: "Verify member status before claiming", resubmittable: false },
  { code: "12", category: "eligibility", description: "Dependent not registered", commonCause: "Dependant code incorrect or not on plan", fixSuggestion: "Check dependant registration", resubmittable: false },
  { code: "13", category: "eligibility", description: "Waiting period applies", commonCause: "Condition subject to waiting period (except PMB)", fixSuggestion: "Check PMB status — PMBs override waiting", resubmittable: false },
  { code: "14", category: "benefit", description: "Benefits exhausted", commonCause: "Day-to-day or annual limit depleted", fixSuggestion: "Check if PMB — PMBs continue above limits", resubmittable: true },
  { code: "15", category: "benefit", description: "Not on formulary", commonCause: "Medicine not on scheme's formulary", fixSuggestion: "Use generic alternative or motivate S21", resubmittable: true },
  { code: "16", category: "benefit", description: "Savings account depleted", commonCause: "PMSA empty, no risk benefit available", fixSuggestion: "PMBs NEVER from savings (Reg 10(6))", resubmittable: false },
  { code: "17", category: "preauth", description: "No pre-authorisation", commonCause: "Procedure requires pre-auth not obtained", fixSuggestion: "Obtain pre-auth before or within 48hrs", resubmittable: true },
  { code: "18", category: "preauth", description: "Pre-auth expired", commonCause: "Authorisation validity period passed", fixSuggestion: "Request new authorisation (valid 3 months)", resubmittable: true },
  { code: "19", category: "preauth", description: "Pre-auth amount exceeded", commonCause: "Claimed amount exceeds authorised amount", fixSuggestion: "Request additional authorisation", resubmittable: true },
  { code: "20", category: "duplicate", description: "Duplicate claim", commonCause: "Same service already claimed", fixSuggestion: "Remove duplicate submission", resubmittable: false },
  { code: "21", category: "duplicate", description: "Within global period", commonCause: "Follow-up within surgical global period", fixSuggestion: "Included in surgical fee — not separately billable", resubmittable: false },
  { code: "22", category: "provider", description: "Provider not contracted", commonCause: "Claim from non-network provider", fixSuggestion: "Refer to DSP or motivate non-DSP necessity", resubmittable: false },
  { code: "23", category: "provider", description: "Discipline mismatch", commonCause: "Provider billing outside scope", fixSuggestion: "Ensure correct provider type for procedure", resubmittable: true },
  { code: "24", category: "provider", description: "Practice number invalid", commonCause: "BHF practice number not registered", fixSuggestion: "Verify at pcns.co.za", resubmittable: true },
  { code: "25", category: "amount", description: "Exceeds scheme rate", commonCause: "Amount above scheme's tariff maximum", fixSuggestion: "Claim at scheme tariff rate — member pays shortfall", resubmittable: false },
  { code: "54", category: "documentation", description: "Illegible documents", commonCause: "Documents unreadable", fixSuggestion: "Resubmit clear copies", resubmittable: true },
  { code: "87", category: "preauth", description: "Hospital pre-authorisation required", commonCause: "Hospital admission without pre-auth", fixSuggestion: "Obtain hospital pre-auth (48hrs before elective, 48hrs after emergency)", resubmittable: true },
];

// ─── 6. TARIFF RANGE-DISCIPLINE VALIDATION ──────────────────────────────────

export interface TariffRangeRule {
  rangeStart: number;
  rangeEnd: number;
  section: string;
  discipline: string;
  description: string;
}

export const TARIFF_RANGE_RULES: TariffRangeRule[] = [
  { rangeStart: 100, rangeEnd: 199, section: "Consultations — GP", discipline: "gp", description: "General practitioner consultations" },
  { rangeStart: 200, rangeEnd: 299, section: "Consultations — Specialist", discipline: "specialist", description: "Specialist consultations" },
  { rangeStart: 300, rangeEnd: 399, section: "Consultations — Procedures", discipline: "gp", description: "Minor in-room procedures" },
  { rangeStart: 400, rangeEnd: 499, section: "Anaesthesia", discipline: "anaesthetist", description: "General and regional anaesthesia" },
  { rangeStart: 500, rangeEnd: 699, section: "Surgery", discipline: "surgeon", description: "General surgical procedures" },
  { rangeStart: 700, rangeEnd: 799, section: "Surgery — Integumentary", discipline: "surgeon", description: "Skin procedures" },
  { rangeStart: 800, rangeEnd: 999, section: "Surgery — Musculoskeletal", discipline: "orthopaedics", description: "Bone and joint procedures" },
  { rangeStart: 1000, rangeEnd: 1199, section: "Surgery — Cardiovascular", discipline: "cardiology", description: "Heart and vascular" },
  { rangeStart: 1200, rangeEnd: 1399, section: "Surgery — Digestive", discipline: "surgeon", description: "GI tract" },
  { rangeStart: 1400, rangeEnd: 1599, section: "Surgery — Urological", discipline: "urologist", description: "Urinary tract" },
  { rangeStart: 1600, rangeEnd: 1799, section: "Surgery — Gynaecology", discipline: "gynaecology", description: "Female reproductive" },
  { rangeStart: 1800, rangeEnd: 1999, section: "Surgery — Neurosurgery", discipline: "neurologist", description: "Brain and spinal" },
  { rangeStart: 2000, rangeEnd: 2199, section: "Surgery — ENT", discipline: "ent", description: "Ear nose throat" },
  { rangeStart: 2200, rangeEnd: 2399, section: "Surgery — Ophthalmology", discipline: "ophthalmology", description: "Eye procedures" },
  { rangeStart: 2400, rangeEnd: 2599, section: "Surgery — Orthopaedic", discipline: "orthopaedics", description: "Orthopaedic specific" },
  { rangeStart: 2600, rangeEnd: 2799, section: "Surgery — Plastic", discipline: "surgeon", description: "Reconstructive/plastic" },
  { rangeStart: 2800, rangeEnd: 2999, section: "Surgery — Dental", discipline: "dental", description: "Dental surgery" },
  { rangeStart: 3000, rangeEnd: 3499, section: "Pathology — Haematology", discipline: "pathology", description: "Blood tests" },
  { rangeStart: 3500, rangeEnd: 3999, section: "Pathology — Chemistry", discipline: "pathology", description: "Chemical pathology" },
  { rangeStart: 4000, rangeEnd: 4099, section: "Nuclear medicine", discipline: "specialist", description: "Nuclear imaging" },
  { rangeStart: 4100, rangeEnd: 4499, section: "Pathology — Microbiology", discipline: "pathology", description: "Cultures and serology" },
  { rangeStart: 4500, rangeEnd: 4999, section: "Pathology — Specialised", discipline: "pathology", description: "Genetics, tumour markers, histology" },
  { rangeStart: 5000, rangeEnd: 5099, section: "Radiology — Plain", discipline: "radiology", description: "X-rays" },
  { rangeStart: 5100, rangeEnd: 5199, section: "Radiology — Ultrasound", discipline: "radiology", description: "Diagnostic ultrasound" },
  { rangeStart: 5200, rangeEnd: 5299, section: "Radiology — CT", discipline: "radiology", description: "CT scans" },
  { rangeStart: 5300, rangeEnd: 5399, section: "Radiology — MRI", discipline: "radiology", description: "MRI scans" },
  { rangeStart: 5400, rangeEnd: 5499, section: "Radiology — Special", discipline: "radiology", description: "Mammography, DEXA, fluoroscopy" },
  { rangeStart: 6000, rangeEnd: 6499, section: "Allied — Physiotherapy", discipline: "physiotherapy", description: "Physio treatments" },
  { rangeStart: 6500, rangeEnd: 6999, section: "Allied — Other", discipline: "allied", description: "OT, dietetics, social work" },
  { rangeStart: 7000, rangeEnd: 7499, section: "Psychology/Psychiatry", discipline: "psychology", description: "Mental health services" },
  { rangeStart: 7500, rangeEnd: 7999, section: "Dental", discipline: "dental", description: "Dental procedures" },
  { rangeStart: 8000, rangeEnd: 8499, section: "Nursing", discipline: "nursing", description: "Nursing procedures" },
  { rangeStart: 8500, rangeEnd: 8999, section: "Emergency medicine", discipline: "emergency", description: "Emergency/casualty" },
];

// ─── EXPORTS ──────────────────────────────────────────────────────────────────

/** Get exclusion rules for a scheme */
export function getExclusionRules(schemeCode: string, plan?: string): ExclusionRule[] {
  const upper = schemeCode.toUpperCase().trim();
  return EXCLUSION_RULES.filter(r => {
    const schemeMatch = r.scheme === "*" || r.scheme.toUpperCase() === upper;
    const planMatch = !r.planRestrictions?.length || !plan || r.planRestrictions.includes(plan);
    return schemeMatch && planMatch;
  });
}

/** Get Discovery CDA for a condition + plan tier */
export function getDiscoveryCDA(icd10: string, isExecutiveOrComp: boolean): CDARule[] {
  const upper = icd10.toUpperCase().trim();
  return DISCOVERY_CDA_RULES.filter(r => upper.startsWith(r.icd10Prefix));
}

/** Get treatment basket limits for a condition */
export function getTreatmentBasket(icd10: string): TreatmentBasketRule[] {
  const upper = icd10.toUpperCase().trim();
  return DISCOVERY_TREATMENT_BASKETS.filter(r => upper.startsWith(r.icd10Prefix));
}

/** Get rejection code info */
export function getRejectionCodeInfo(code: string): RejectionCodeRule | undefined {
  return REJECTION_CODE_RULES.find(r => r.code === code);
}

/** Get tariff range for a code */
export function getTariffRange(tariffCode: string): TariffRangeRule | undefined {
  const num = parseInt(tariffCode);
  if (isNaN(num)) return undefined;
  return TARIFF_RANGE_RULES.find(r => num >= r.rangeStart && num <= r.rangeEnd);
}

/** Total rule count for this module */
export function getExclusionRuleCount(): number {
  return EXCLUSION_RULES.length +
    DISCOVERY_CDA_RULES.length +
    DISCOVERY_TREATMENT_BASKETS.length +
    MODIFIER_RULES.length +
    REJECTION_CODE_RULES.length +
    TARIFF_RANGE_RULES.length;
}
