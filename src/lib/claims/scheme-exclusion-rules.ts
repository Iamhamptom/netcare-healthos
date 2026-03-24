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

  // ── Momentum-specific exclusions (2026 Brochure) ──
  // General
  { ruleId: "MOM_EX_WAITING_PERIOD_COSTS", scheme: "MOM", category: "general", description: "All costs incurred during waiting periods and undisclosed pre-existing conditions excluded", severity: "error", notes: "Conditions not disclosed at application — no benefits." },
  { ruleId: "MOM_EX_WAR_RIOT", scheme: "MOM", category: "general", description: "Injuries from willful participation in riot, war, invasion, terrorism or rebellion excluded", severity: "error", notes: "Political/military violence exclusion." },
  { ruleId: "MOM_EX_SPEED_CONTESTS", scheme: "MOM", category: "general", description: "Professional speed contests and speed trials excluded", severity: "error", notes: "Where beneficiary's main income is from such contests." },
  { ruleId: "MOM_EX_UNREGISTERED_PROVIDER", scheme: "MOM", category: "general", description: "Healthcare provider not registered with recognised professional body excluded", severity: "error", notes: "Must be registered per Act of Parliament." },
  { ruleId: "MOM_EX_RECUPERATIVE_HOLIDAY", scheme: "MOM", category: "general", description: "Holidays for recuperative purposes excluded, including headache and stress relief clinics", severity: "error", notes: "Wellness retreats not covered." },
  { ruleId: "MOM_EX_UNPROVEN_TREATMENT", scheme: "MOM", category: "general", description: "Treatment where efficacy and safety cannot be proved excluded", severity: "error", notes: "Experimental/unproven treatments." },
  { ruleId: "MOM_EX_COSMETIC", scheme: "MOM", category: "surgical", description: "Cosmetic surgery, transsexual procedures and personal-choice treatments excluded", severity: "error", notes: "Including gender reassignment surgery." },
  { ruleId: "MOM_EX_OBESITY", scheme: "MOM", category: "general", description: "Treatment of obesity excluded", severity: "error", notes: "Weight loss treatment not covered." },
  { ruleId: "MOM_EX_SUICIDE_EXCESS", scheme: "MOM", category: "general", description: "Attempted suicide costs exceeding PMB limits excluded", severity: "warning", notes: "PMB portion covered; excess excluded." },
  { ruleId: "MOM_EX_BREAST_AUG_REDUCTION", scheme: "MOM", category: "surgical", description: "Breast reduction, breast augmentation, gynaecomastia, otoplasty and blepharoplasty excluded", severity: "error", notes: "Cosmetic breast/ear/eyelid surgery." },
  { ruleId: "MOM_EX_UNREGISTERED_MEDS", scheme: "MOM", category: "medicine", description: "Medication not registered by Medicine Control Council excluded", severity: "error", notes: "Must have SAHPRA registration." },
  { ruleId: "MOM_EX_NURSING_HOME", scheme: "MOM", category: "general", description: "Unregistered nursing homes or similar institutions excluded", severity: "error", notes: "Must be registered per law." },
  { ruleId: "MOM_EX_GUM_GUARDS_GOLD", scheme: "MOM", category: "dental", description: "Gum guards and gold in dentures excluded", severity: "error", notes: "Dental cosmetics not covered." },
  { ruleId: "MOM_EX_FRAIL_CARE", scheme: "MOM", category: "general", description: "Frail care excluded", severity: "error", notes: "Not a medical scheme benefit." },
  { ruleId: "MOM_EX_TRAVEL_EXPENSES", scheme: "MOM", category: "general", description: "Travelling expenses excluded (except emergency rescue and international cover)", severity: "error", notes: "General transport not covered." },
  { ruleId: "MOM_EX_NOT_MEDICALLY_NECESSARY", scheme: "MOM", category: "general", description: "Costs deemed not medically necessary by Medical Assessor excluded", severity: "error", notes: "Clinical appropriateness review." },
  { ruleId: "MOM_EX_MISSED_APPOINTMENTS", scheme: "MOM", category: "general", description: "Appointments beneficiary fails to keep excluded", severity: "error", notes: "Missed appointments not payable." },
  { ruleId: "MOM_EX_CIRCUMCISION", scheme: "MOM", category: "surgical", description: "Circumcision excluded unless clinically indicated; contraceptive measures/devices excluded", severity: "error", notes: "Elective circumcision and contraceptives excluded." },
  { ruleId: "MOM_EX_VASECTOMY_REVERSAL", scheme: "MOM", category: "infertility", description: "Reversal of vasectomy or tubal ligation excluded", severity: "error", notes: "Sterilisation reversal not covered." },
  { ruleId: "MOM_EX_NARCOTISM_ALCOHOL", scheme: "MOM", category: "general", description: "Injuries from narcotism or alcohol abuse excluded (except PMB)", severity: "error", notes: "Substance abuse injuries — PMB portion only." },
  { ruleId: "MOM_EX_INFERTILITY", scheme: "MOM", category: "infertility", description: "Infertility treatment excluded (PMB covered at State facilities only)", severity: "error", notes: "IVF etc. excluded except PMB entitlement." },
  { ruleId: "MOM_EX_SCUBA_CAVE_DIVING", scheme: "MOM", category: "general", description: "Injury from scuba diving below 40m and cave diving excluded", severity: "error", notes: "Deep/cave diving injuries excluded." },

  // ── Medihelp-specific exclusions (2026 Member Guide) ──
  // General
  { ruleId: "MHE_EX_SUBSTANCE_ABUSE", scheme: "MHE", category: "general", description: "Alcohol, drug and substance abuse treatment excluded (non-PMB, non-DSP)", severity: "error", notes: "Must use designated service provider for PMB portion." },
  { ruleId: "MHE_EX_AMBULANCE_NO_ADMIT", scheme: "MHE", category: "general", description: "Ambulance/emergency vehicle transport not related to hospital admission excluded", severity: "error", notes: "Transport must link to admission." },
  { ruleId: "MHE_EX_MISSED_APPOINTMENTS", scheme: "MHE", category: "general", description: "Appointments for medical services not kept excluded", severity: "error", notes: "No-show fees not payable." },
  { ruleId: "MHE_EX_BARIATRIC", scheme: "MHE", category: "surgical", description: "Bariatric surgery and obesity-related procedures (gastroplasty, lipectomy) excluded", severity: "error", notes: "Not applicable for MedPlus members." },
  { ruleId: "MHE_EX_COCHLEAR", scheme: "MHE", category: "prosthesis", description: "Cochlear implants and related procedures, services and devices excluded", severity: "error", notes: "Not applicable for MedPlus/MedElite/MedPrime/MedPrime Elect." },
  { ruleId: "MHE_EX_COSMETIC", scheme: "MHE", category: "surgical", description: "Cosmetic and reconstructive surgery and treatment excluded", severity: "error", notes: "All cosmetic procedures excluded." },
  { ruleId: "MHE_EX_CRYOPRESERVATION", scheme: "MHE", category: "general", description: "Cryopreservation excluded", severity: "error", notes: "Freezing of eggs/sperm/embryos." },
  { ruleId: "MHE_EX_POLYSOMNOGRAM", scheme: "MHE", category: "procedure", description: "Diagnostic polysomnograms excluded", severity: "error", notes: "Not applicable for MedPlus/MedElite/MedPrime/MedPrime Elect/MedReach." },
  { ruleId: "MHE_EX_ER_FACILITY_FEE", scheme: "MHE", category: "hospital", description: "Emergency room facility fees excluded (except MedMove)", severity: "error", notes: "Admin fees at casualty not covered." },
  { ruleId: "MHE_EX_GENDER_AFFIRMATION", scheme: "MHE", category: "surgical", description: "Gender affirmation care excluded", severity: "error", notes: "Gender reassignment surgery/treatment excluded." },
  { ruleId: "MHE_EX_UNNECESSARY_HOSP", scheme: "MHE", category: "hospital", description: "Healthcare services in hospital that should be done out of hospital excluded", severity: "error", notes: "Step-down to outpatient where appropriate." },
  { ruleId: "MHE_EX_LARGE_JOINT", scheme: "MHE", category: "surgical", description: "Large joint replacements and surgery excluded", planRestrictions: ["MedSaver", "MedReach", "MedValue"], severity: "error", notes: "Not applicable for MedPlus/MedElite." },
  { ruleId: "MHE_EX_PHYSIO_WISDOM", scheme: "MHE", category: "dental", description: "Physiotherapy services for removal of wisdom teeth excluded", severity: "error", notes: "Physio not covered for dental." },
  { ruleId: "MHE_EX_REFRACTIVE", scheme: "MHE", category: "surgical", description: "Refractive surgery (LASIK) excluded", severity: "error", notes: "Not applicable for MedPlus/MedElite/MedPrime/MedPrime Elect." },
  { ruleId: "MHE_EX_RHIZOTOMY", scheme: "MHE", category: "procedure", description: "Rhizotomy excluded", severity: "error", notes: "Not applicable for MedPlus/MedElite/MedPrime/MedPrime Elect." },
  { ruleId: "MHE_EX_TRAVEL", scheme: "MHE", category: "general", description: "Travelling and accommodation costs including meals excluded", severity: "error", notes: "No travel benefit." },
  { ruleId: "MHE_EX_SPECIALISED_MEDS", scheme: "MHE", category: "medicine", description: "All specialised medicines (biological/biosimilar) on exclusion list excluded", severity: "error", notes: "Not applicable for MedPlus. Formulary applies." },
  { ruleId: "MHE_EX_EXPERIMENTAL", scheme: "MHE", category: "general", description: "High-technology treatment modalities, devices and medicines that are experimental/investigational excluded", severity: "error", notes: "Not applicable for MedPlus." },
  { ruleId: "MHE_EX_INSULIN_PUMPS", scheme: "MHE", category: "appliance", description: "Insulin pumps and continuous glucose monitors including consumables excluded", severity: "error", notes: "Not applicable for MedPlus/MedElite." },
  { ruleId: "MHE_EX_HEARING_DEVICES", scheme: "MHE", category: "prosthesis", description: "Implanted hearing devices excluded", severity: "error", notes: "Not applicable for MedPlus/MedElite/MedPrime/MedPrime Elect." },
  { ruleId: "MHE_EX_NEUROSTIMULATORS", scheme: "MHE", category: "prosthesis", description: "Neurostimulators excluded", severity: "error", notes: "Not applicable for MedPlus/MedElite/MedPrime/MedPrime Elect." },
  { ruleId: "MHE_EX_HYPERBARIC_O2", scheme: "MHE", category: "procedure", description: "Hyperbaric oxygen treatment excluded", severity: "error", notes: "Excluded on multiple plans." },
  { ruleId: "MHE_EX_SPEECH_HEARING_AIDS", scheme: "MHE", category: "appliance", description: "Speech and hearing aids, artificial eyes, limbs, prostheses after reconstructive surgery, external breast prostheses excluded", severity: "error", notes: "Plan-specific; check MedPlus/MedElite coverage." },
  { ruleId: "MHE_EX_ALTERNATIVE_MEDS", scheme: "MHE", category: "alternative_health", description: "Complementary and alternative medicines including homeopathic and herbal medicines excluded", severity: "error", notes: "No alternative medicine benefit." },
  { ruleId: "MHE_EX_DENTAL_GA_KIDS", scheme: "MHE", category: "dental", description: "Dental procedures under general anaesthesia excluded (including children <7 and special needs)", severity: "error", notes: "Plan-specific exclusion." },
  { ruleId: "MHE_EX_SKIN_LESIONS_HOSP", scheme: "MHE", category: "surgical", description: "Excision of superficial skin lesions in hospital excluded (except lipomas/cysts/tumours requiring deep intervention)", severity: "warning", notes: "Should be done out-of-hospital." },
  { ruleId: "MHE_EX_FACET_JOINT", scheme: "MHE", category: "procedure", description: "Facet joint injection excluded", severity: "error", notes: "Pain management exclusion." },
  { ruleId: "MHE_EX_MINOR_JOINT", scheme: "MHE", category: "surgical", description: "Minor joint arthroplasty excluded", severity: "error", notes: "Small joint replacements excluded." },
  { ruleId: "MHE_EX_NAIL_WARTS", scheme: "MHE", category: "procedure", description: "Nail disorders and cauterisation of warts excluded", severity: "error", notes: "Minor dermatological procedures." },
  { ruleId: "MHE_EX_VARICOSE_VEIN", scheme: "MHE", category: "surgical", description: "Varicose vein-related intervention excluded", severity: "error", notes: "Plan-specific; check higher plans." },
  // MedReach-specific additions
  { ruleId: "MHE_EX_BIOPSIES_MEDREACH", scheme: "MHE", category: "procedure", description: "Biopsies including fine needle aspirations excluded", planRestrictions: ["MedReach"], severity: "error", notes: "MedReach only." },
  { ruleId: "MHE_EX_ELECTIVE_CAESAR", scheme: "MHE", category: "maternity", description: "Elective caesarean sections and related maternity services excluded", planRestrictions: ["MedReach"], severity: "error", notes: "MedReach only — must be medically indicated." },
  { ruleId: "MHE_EX_ENDOSCOPY_HOSP", scheme: "MHE", category: "procedure", description: "Endoscopic procedures not done in doctor's rooms excluded (gastroscopy, colonoscopy, laparoscopy, cystoscopy)", planRestrictions: ["MedReach"], severity: "error", notes: "MedReach: must be in-rooms." },
  { ruleId: "MHE_EX_GENETIC_TESTING", scheme: "MHE", category: "pathology", description: "Genetic and metabolic testing including cryopreservation excluded", planRestrictions: ["MedReach"], severity: "error", notes: "MedReach only." },
  { ruleId: "MHE_EX_ORTHO_SPINAL", scheme: "MHE", category: "surgical", description: "Orthopaedic and spinal procedures excluded", planRestrictions: ["MedReach"], severity: "error", notes: "MedReach only — unless PMB." },
  { ruleId: "MHE_EX_NERVE_INJECTIONS", scheme: "MHE", category: "procedure", description: "Injection of diagnostic/therapeutic/anaesthetic agents into nerves and intrathecal space excluded", planRestrictions: ["MedReach"], severity: "error", notes: "MedReach only." },
  { ruleId: "MHE_EX_HERNIA_REFLUX", scheme: "MHE", category: "surgical", description: "Surgery for oesophageal reflux, nasal/sinus surgery, umbilical/incisional/hiatus hernia repair excluded", planRestrictions: ["MedReach"], severity: "error", notes: "MedReach only." },
  { ruleId: "MHE_EX_OUTSIDE_SA", scheme: "MHE", category: "general", description: "Services rendered outside the borders of South Africa excluded", planRestrictions: ["MedReach"], severity: "error", notes: "MedReach: no cross-border benefit." },
  { ruleId: "MHE_EX_CHRONIC_MEDS_NONPMB", scheme: "MHE", category: "medicine", description: "Medicines for treatment of non-PMB chronic conditions excluded", planRestrictions: ["MedReach"], severity: "error", notes: "MedReach: only PMB chronic conditions covered." },

  // ── CompCare-specific exclusions (2025 Benefit Guide) ──
  // Procedures
  { ruleId: "CPC_EX_BACK_NECK", scheme: "CPC", category: "surgical", description: "Back and neck surgery excluded", severity: "error", notes: "Subject to PMB. Excluded on most plans." },
  { ruleId: "CPC_EX_BARIATRIC", scheme: "CPC", category: "surgical", description: "Bariatric surgery and treatment relating to obesity excluded", severity: "error", notes: "Weight loss surgery not covered." },
  { ruleId: "CPC_EX_BREAST_REDUCTION", scheme: "CPC", category: "surgical", description: "Breast reduction and gynaecomastia surgery excluded", severity: "error", notes: "Cosmetic breast surgery." },
  { ruleId: "CPC_EX_BUNION", scheme: "CPC", category: "surgical", description: "Bunion surgery (correction of Hallux Valgus) excluded", severity: "error", notes: "Foot surgery exclusion." },
  { ruleId: "CPC_EX_ELECTIVE_CAESAR", scheme: "CPC", category: "maternity", description: "Elective caesarean sections for non-medical reasons excluded", severity: "error", notes: "Must be medically indicated." },
  { ruleId: "CPC_EX_COCHLEAR", scheme: "CPC", category: "prosthesis", description: "Cochlear implants, auditory brain implants, bone-anchored hearing aids excluded", severity: "error", notes: "Limits apply on higher plans." },
  { ruleId: "CPC_EX_COSMETIC", scheme: "CPC", category: "surgical", description: "Cosmetic surgery — blepharoplasty, septoplasty, nasal tip reconstruction, otoplasty and cosmetic preparations excluded", severity: "error", notes: "All cosmetic procedures excluded." },
  { ruleId: "CPC_EX_CORNEAL_TRANSPLANT", scheme: "CPC", category: "surgical", description: "Corneal transplants excluded", severity: "error", notes: "Subject to PMB. Lower plans excluded." },
  { ruleId: "CPC_EX_DEEP_BRAIN", scheme: "CPC", category: "prosthesis", description: "Deep brain implants excluded", severity: "error", notes: "High-cost neuro device." },
  { ruleId: "CPC_EX_REFRACTIVE", scheme: "CPC", category: "surgical", description: "Excimer laser / refractive surgery (LASIK) excluded", severity: "error", notes: "Savings may apply on some plans." },
  { ruleId: "CPC_EX_NASAL_SINUS", scheme: "CPC", category: "surgical", description: "Functional nasal and sinus surgery excluded", severity: "error", notes: "Savings may apply on some plans." },
  { ruleId: "CPC_EX_GENDER_REASSIGNMENT", scheme: "CPC", category: "surgical", description: "Gender reassignment surgery, medicines and treatment excluded", severity: "error", notes: "Not covered on any plan." },
  { ruleId: "CPC_EX_INFERTILITY", scheme: "CPC", category: "infertility", description: "Infertility — AI, IVF, GIFT, ZIFT, ICSI excluded", severity: "error", notes: "All assisted reproduction excluded." },
  { ruleId: "CPC_EX_DENTAL_HOSP", scheme: "CPC", category: "dental", description: "In-hospital dental surgery excluded", severity: "error", notes: "Savings may apply on some plans." },
  { ruleId: "CPC_EX_NERVE_STIMULATORS", scheme: "CPC", category: "prosthesis", description: "Internal nerve stimulators excluded", severity: "error", notes: "High-cost devices." },
  { ruleId: "CPC_EX_DIAG_HOSP_ONLY", scheme: "CPC", category: "procedure", description: "Investigations and diagnostic work-up only in hospital excluded", severity: "error", notes: "Must be clinically justified for admission." },
  { ruleId: "CPC_EX_JOINT_REPLACEMENT", scheme: "CPC", category: "surgical", description: "Joint replacement surgery and related prostheses (hip, knee, shoulder, elbow, ankle, wrist, finger) excluded", severity: "error", notes: "Limits apply on UltraCare+ and ExecuCare plans." },
  { ruleId: "CPC_EX_POLYSOMNOGRAM", scheme: "CPC", category: "procedure", description: "Polysomnograms and CPAP titrations excluded", severity: "error", notes: "Sleep studies not covered on most plans." },
  { ruleId: "CPC_EX_SKIN_DISORDERS", scheme: "CPC", category: "surgical", description: "Removal of skin disorders including benign growths and lipomas excluded", severity: "error", notes: "Minor skin surgery excluded." },
  { ruleId: "CPC_EX_PORTWINE_TATTOO", scheme: "CPC", category: "surgical", description: "Removal of port-wine stains, scars and tattoos excluded", severity: "error", notes: "Cosmetic removal." },
  { ruleId: "CPC_EX_VASECTOMY_REVERSAL", scheme: "CPC", category: "infertility", description: "Reversal of vasectomy or tubal ligation excluded", severity: "error", notes: "Sterilisation reversal not covered." },
  { ruleId: "CPC_EX_ROBOTIC", scheme: "CPC", category: "surgical", description: "Robotic assisted surgery excluded", severity: "error", notes: "Robot costs not covered." },
  { ruleId: "CPC_EX_REFLUX_HERNIA", scheme: "CPC", category: "surgical", description: "Reflux and hiatus hernia repair surgery excluded", severity: "error", notes: "Subject to PMB." },
  { ruleId: "CPC_EX_SPINAL", scheme: "CPC", category: "surgical", description: "Spinal surgery and related prostheses (instrumentation, devices, cages) excluded", severity: "error", notes: "Limits apply on higher plans." },
  { ruleId: "CPC_EX_SLEEP_THERAPY", scheme: "CPC", category: "procedure", description: "Sleep therapy excluded", severity: "error", notes: "Not covered." },
  { ruleId: "CPC_EX_KELOID", scheme: "CPC", category: "surgical", description: "Treatment of keloids excluded (except burns and functional impairment)", severity: "warning", notes: "Must be post-burn or functional deficit." },
  // Dental (CompCare)
  { ruleId: "CPC_EX_TEETH_BLEACHING", scheme: "CPC", category: "dental", description: "Bleaching of teeth excluded", severity: "error", notes: "Cosmetic dental." },
  { ruleId: "CPC_EX_DENTAL_SEDATION", scheme: "CPC", category: "dental", description: "Conscious sedation and general anaesthetics for dental — 7 years and older excluded", severity: "error", notes: "GA only for under-7." },
  { ruleId: "CPC_EX_LINGUAL_ORTHO", scheme: "CPC", category: "dental", description: "Lingual orthodontics excluded", severity: "error", notes: "Behind-the-teeth braces not covered." },
  { ruleId: "CPC_EX_ORTHO_ADULT", scheme: "CPC", category: "dental", description: "Orthodontic treatment over age 18 excluded", severity: "error", notes: "Orthodontics for children only." },
  { ruleId: "CPC_EX_OSSEO_IMPLANTS", scheme: "CPC", category: "dental", description: "Osseo-integrated implants, implant-related procedures and orthognathic surgery excluded", severity: "error", notes: "Dental implants and jaw surgery excluded." },
  { ruleId: "CPC_EX_RESIN_BONDING", scheme: "CPC", category: "dental", description: "Resin bonding of metal fillings excluded", severity: "error", notes: "Cosmetic dental restoration." },
  // Medicine (CompCare)
  { ruleId: "CPC_EX_UNREGISTERED_MEDS", scheme: "CPC", category: "medicine", description: "Medication not registered by SAHPRA excluded", severity: "error", notes: "Must have SAHPRA registration." },
  { ruleId: "CPC_EX_CLINICAL_TRIAL_MEDS", scheme: "CPC", category: "medicine", description: "Medication used in clinical trials and treatment resulting from clinical trials excluded", severity: "error", notes: "Trial drugs and complications excluded." },
  { ruleId: "CPC_EX_ANABOLIC_STEROIDS", scheme: "CPC", category: "medicine", description: "Anabolic steroids and immunostimulants excluded", severity: "error", notes: "Performance-enhancing drugs." },
  { ruleId: "CPC_EX_VITAMINS", scheme: "CPC", category: "medicine", description: "Vitamins and minerals excluded", severity: "error", notes: "Supplements not covered." },
  // Prosthesis (CompCare)
  { ruleId: "CPC_EX_LVAD", scheme: "CPC", category: "prosthesis", description: "Implantable ventricular assist devices (LVAD) and total artificial hearts excluded", severity: "error", notes: "High-cost cardiac devices." },
  { ruleId: "CPC_EX_INTERNAL_FIXATORS", scheme: "CPC", category: "prosthesis", description: "Internal fixators for fractures excluded", severity: "error", notes: "Limits apply on higher plans." },
  // External appliances (CompCare)
  { ruleId: "CPC_EX_TENS", scheme: "CPC", category: "appliance", description: "APS/TENS machines excluded", severity: "error", notes: "Pain devices not covered." },
  { ruleId: "CPC_EX_HOSPITAL_BEDS", scheme: "CPC", category: "appliance", description: "Hospital beds (purchase/rental) excluded", severity: "error", notes: "Home hospital beds not covered." },
  { ruleId: "CPC_EX_HEALTH_SHOES", scheme: "CPC", category: "appliance", description: "Health shoes excluded", severity: "error", notes: "Orthopaedic footwear not covered." },
  { ruleId: "CPC_EX_HEARING_AIDS", scheme: "CPC", category: "appliance", description: "Hearing aids excluded", severity: "error", notes: "Paid from PMSA on some plans." },
  { ruleId: "CPC_EX_INCONTINENCE", scheme: "CPC", category: "appliance", description: "Incontinence products (linen savers, disposable nappies, waterproof sheets) excluded", severity: "error", notes: "Not covered." },
  { ruleId: "CPC_EX_MOTORISED_SCOOTERS", scheme: "CPC", category: "appliance", description: "Motorised scooters excluded", severity: "error", notes: "Mobility devices not covered." },
  { ruleId: "CPC_EX_SUNGLASSES", scheme: "CPC", category: "optical", description: "Sunglasses (prescription and non-prescription) excluded", severity: "error", notes: "Including tinted lenses." },
  { ruleId: "CPC_EX_WIGS", scheme: "CPC", category: "appliance", description: "Wigs excluded", severity: "error", notes: "Paid from PMSA on some plans." },
  // Other (CompCare)
  { ruleId: "CPC_EX_CORNEA_IMPORT", scheme: "CPC", category: "general", description: "Difference in cost between imported and local cornea excluded", severity: "error", notes: "Use locally acquired cornea." },
  { ruleId: "CPC_EX_PHYSIO_WISDOM", scheme: "CPC", category: "dental", description: "Physiotherapy services for wisdom teeth and caesareans excluded", severity: "error", notes: "Physio not covered for dental/maternity." },
  { ruleId: "CPC_EX_GENETIC_TESTING", scheme: "CPC", category: "pathology", description: "Genetic and metabolic testing excluded", severity: "error", notes: "Genetic screening not covered." },
  { ruleId: "CPC_EX_APHRODISIACS", scheme: "CPC", category: "medicine", description: "Aphrodisiacs excluded", severity: "error", notes: "Sexual enhancement drugs not covered." },
  { ruleId: "CPC_EX_SMOKING_CESSATION", scheme: "CPC", category: "medicine", description: "Smoking cessation agents excluded", severity: "error", notes: "Anti-smoking medication not covered." },
  { ruleId: "CPC_EX_CONTACT_LENS_PREPS", scheme: "CPC", category: "optical", description: "Contact lens preparations excluded", severity: "error", notes: "Solutions/cleaners not covered." },
  { ruleId: "CPC_EX_COSMETIC_PREPS", scheme: "CPC", category: "medicine", description: "Cosmetic preparations excluded", severity: "error", notes: "Emollients for cosmetic use excluded." },

  // ── Polmed-specific exclusions (2026 Member Guide) ──
  // General
  { ruleId: "POL_EX_NOT_TREATMENT", scheme: "POL", category: "general", description: "Services not aimed at treatment of actual illness/disablement excluded (ageing not an illness)", severity: "error", notes: "Anti-ageing treatments excluded." },
  { ruleId: "POL_EX_SLEEP_THERAPY", scheme: "POL", category: "procedure", description: "Sleep therapy excluded", severity: "error", notes: "Not covered on any plan." },
  { ruleId: "POL_EX_STERILISATION_REVERSAL", scheme: "POL", category: "infertility", description: "Reversal of sterilisation procedures excluded", severity: "error", notes: "Board may grant in exceptional circumstances." },
  { ruleId: "POL_EX_IVF", scheme: "POL", category: "infertility", description: "Artificial insemination in/outside human body excluded (except PMB at public hospital)", severity: "error", notes: "PMB portion at public hospital with pre-auth only." },
  { ruleId: "POL_EX_MISSED_APPOINTMENTS", scheme: "POL", category: "general", description: "Appointments member/dependant fails to keep excluded", severity: "error", notes: "No-show not payable." },
  { ruleId: "POL_EX_COSMETIC", scheme: "POL", category: "surgical", description: "Operations, treatments and procedures for cosmetic purposes excluded", severity: "error", notes: "Must have pathological proof of necessity." },
  { ruleId: "POL_EX_PRENATAL_EXERCISES", scheme: "POL", category: "maternity", description: "Prenatal and/or postnatal exercises excluded", severity: "error", notes: "Exercise classes not covered." },
  { ruleId: "POL_EX_OLD_AGE_HOME", scheme: "POL", category: "general", description: "Accommodation in old-age home or institution for general care of aged/chronically ill excluded", severity: "error", notes: "Frail care not covered." },
  { ruleId: "POL_EX_SPORT_MOUTHGUARDS", scheme: "POL", category: "general", description: "Aids for participation in sport (e.g. mouthguards) excluded", severity: "error", notes: "Sport accessories not medical." },
  { ruleId: "POL_EX_GOLD_DENTURES", scheme: "POL", category: "dental", description: "Gold inlays in dentures, soft/metal base dentures, invisible retainers, vital teeth bleaching excluded", severity: "error", notes: "Cosmetic dental excluded." },
  { ruleId: "POL_EX_ORTHO_ADULT", scheme: "POL", category: "dental", description: "Fixed orthodontics for beneficiaries above 18 years excluded (subject to ICON)", severity: "error", notes: "Adult orthodontics excluded." },
  { ruleId: "POL_EX_TMJ_SURGICAL", scheme: "POL", category: "dental", description: "Temporo-mandibular joint (TMJ) benefit limited to non-surgical intervention", severity: "warning", notes: "Surgical TMJ excluded." },
  { ruleId: "POL_EX_ORTHOGNATHIC", scheme: "POL", category: "dental", description: "Orthognathic (jaw correction) and orthodontic-related surgery and hospital/lab costs excluded (PMB only)", severity: "error", notes: "Jaw surgery excluded." },
  { ruleId: "POL_EX_ORAL_HYGIENE_ED", scheme: "POL", category: "dental", description: "Oral hygiene education and plaque control instruction excluded", severity: "error", notes: "Educational dental services excluded." },
  { ruleId: "POL_EX_INSURANCE_REPORTS", scheme: "POL", category: "general", description: "Reports/tests for insurance, university admission, fitness, employment, emigration excluded", severity: "error", notes: "Non-medical purpose investigations." },
  { ruleId: "POL_EX_SEX_CHANGE", scheme: "POL", category: "surgical", description: "Sex change operations excluded", severity: "error", notes: "Gender reassignment not covered." },
  { ruleId: "POL_EX_TRAVEL", scheme: "POL", category: "general", description: "Beneficiary travelling costs excluded (except per Annexure A/B)", severity: "error", notes: "General transport excluded." },
  { ruleId: "POL_EX_UNREGISTERED_PROVIDER", scheme: "POL", category: "general", description: "Accounts of providers not registered with recognised professional body excluded", severity: "error", notes: "Must be registered per Act of Parliament." },
  { ruleId: "POL_EX_SPAS_RESORTS", scheme: "POL", category: "general", description: "Accommodation in spas, health or rest resorts excluded", severity: "error", notes: "Wellness retreats excluded." },
  { ruleId: "POL_EX_RECUPERATIVE_HOLIDAY", scheme: "POL", category: "general", description: "Holidays for recuperative purposes excluded", severity: "error", notes: "Rest holidays not covered." },
  { ruleId: "POL_EX_OBESITY", scheme: "POL", category: "general", description: "Treatment of obesity excluded (morbid obesity may be approved with motivation)", severity: "warning", notes: "Morbid obesity requires prior approval." },
  { ruleId: "POL_EX_MUSCULAR_FATIGUE", scheme: "POL", category: "procedure", description: "Muscular fatigue tests excluded (except if specialist-requested with motivation)", severity: "error", notes: "Must have specialist referral." },
  { ruleId: "POL_EX_SURROGATE", scheme: "POL", category: "maternity", description: "Any treatment as a result of surrogate pregnancy excluded", severity: "error", notes: "Surrogacy costs excluded." },
  { ruleId: "POL_EX_NON_FUNCTIONAL_PROSTHESIS", scheme: "POL", category: "prosthesis", description: "Non-functional prostheses for reconstructive/restorative surgery excluded (except PMB)", severity: "error", notes: "Must be functional prosthesis." },
  { ruleId: "POL_EX_APPLIANCE_REPAIR", scheme: "POL", category: "appliance", description: "Costs for repair, maintenance, parts or accessories for appliances/prostheses excluded", severity: "error", notes: "No maintenance benefit." },
  { ruleId: "POL_EX_EXPERIMENTAL", scheme: "POL", category: "general", description: "Newly-developed interventions/technologies where safety and cost-benefit not supported excluded", severity: "error", notes: "Unproven treatments excluded." },
  { ruleId: "POL_EX_PAIN_SUFFERING", scheme: "POL", category: "general", description: "Compensation for pain/suffering, loss of income, funeral expenses or damages excluded", severity: "error", notes: "Not a medical benefit." },
  { ruleId: "POL_EX_DONOR_NON_MEMBER", scheme: "POL", category: "surgical", description: "Organ transplant donors to recipients who are not Scheme members excluded", severity: "error", notes: "Donor must be for Polmed member recipient." },
  { ruleId: "POL_EX_APTITUDE_IQ", scheme: "POL", category: "mental_health", description: "Aptitude tests, IQ tests, school readiness, questionnaires, learning/behavioural problems excluded", severity: "error", notes: "Educational/developmental assessments excluded." },
  { ruleId: "POL_EX_COSMETICS_SUNBLOCK", scheme: "POL", category: "medicine", description: "Cosmetics and sunblock excluded (sunblock may be considered for albinism)", severity: "error", notes: "Exception: clinical albinism." },
  { ruleId: "POL_EX_NON_EMERGENCY_TRANSPORT", scheme: "POL", category: "general", description: "Non-clinically essential or non-emergency ambulance transport excluded", severity: "error", notes: "Must be emergency." },
  { ruleId: "POL_EX_CLINICAL_TRIALS", scheme: "POL", category: "general", description: "All benefits for clinical trials excluded", severity: "error", notes: "Trial drugs and complications." },
  { ruleId: "POL_EX_CHEMO_3MONTH", scheme: "POL", category: "medicine", description: "New chemo drugs not demonstrating >3 month survival advantage in advanced malignancies excluded", icd10Triggers: ["C", "D0", "D1", "D2", "D3", "D4"], severity: "warning", notes: "Unless pre-authorised as cost-effective alternative." },
  { ruleId: "POL_EX_DUAL_POWER_DEVICES", scheme: "POL", category: "appliance", description: "Devices without dual power options (no built-in battery) excluded", severity: "error", notes: "Medical devices must have backup power." },
  { ruleId: "POL_EX_LOADSHEDDING", scheme: "POL", category: "appliance", description: "Expenses for backup power sources required due to loadshedding/power disruptions excluded", severity: "error", notes: "UPS/generator costs excluded." },
  { ruleId: "POL_EX_DENTAL_LAB_DELIVERY", scheme: "POL", category: "dental", description: "Delivery fees from dental laboratory excluded", severity: "error", notes: "Lab delivery costs not payable." },
  // Polmed acute medicine exclusions
  { ruleId: "POL_EX_INFERTILITY_MEDS", scheme: "POL", category: "medicine", description: "Female infertility-related medication excluded from acute benefits", severity: "error", notes: "Clomid, Profasi, Cyclogest etc." },
  { ruleId: "POL_EX_ANABOLIC_STEROIDS", scheme: "POL", category: "medicine", description: "Androgens and anabolic steroids excluded", severity: "error", notes: "Sustanon etc." },
  { ruleId: "POL_EX_SLIMMING", scheme: "POL", category: "medicine", description: "Slimming preparations excluded", severity: "error", notes: "Thinz, Obex LA etc." },
  { ruleId: "POL_EX_HOUSEHOLD_REMEDIES", scheme: "POL", category: "medicine", description: "Patent household remedies excluded", severity: "error", notes: "Lennons etc." },
  { ruleId: "POL_EX_EMOLLIENTS", scheme: "POL", category: "medicine", description: "Patent emollients excluded from acute benefits", severity: "error", notes: "Aqueous cream etc." },
  { ruleId: "POL_EX_PATENT_FOOD", scheme: "POL", category: "medicine", description: "Patent foods and nutrition products excluded", severity: "error", notes: "Infasoy, Ensure etc." },
  { ruleId: "POL_EX_SOAPS_CLEANSERS", scheme: "POL", category: "medicine", description: "Soaps and cleansers excluded", severity: "error", notes: "Brasivol, Phisoac etc." },
  { ruleId: "POL_EX_COSMETIC_MEDS", scheme: "POL", category: "medicine", description: "Cosmetic medications excluded", severity: "error", notes: "Classique etc." },
  { ruleId: "POL_EX_CONTACT_LENS_PREPS", scheme: "POL", category: "optical", description: "Contact lens preparations excluded", severity: "error", notes: "Bausch+Lomb etc." },
  { ruleId: "POL_EX_SUNSCREENS", scheme: "POL", category: "medicine", description: "Patent sunscreens excluded", severity: "error", notes: "Piz Buin etc." },
  { ruleId: "POL_EX_MEDICATED_SHAMPOO", scheme: "POL", category: "medicine", description: "Medicated shampoos excluded", severity: "error", notes: "Denorex, Niz shampoo etc." },
  { ruleId: "POL_EX_VETERINARY", scheme: "POL", category: "general", description: "Veterinary products excluded", severity: "error", notes: "Human medical scheme only." },
  { ruleId: "POL_EX_IMPOTENCE", scheme: "POL", category: "medicine", description: "Treatment of impotence or sexual dysfunction excluded", severity: "error", notes: "Viagra, Cialis, Caverject etc." },
  { ruleId: "POL_EX_VITAMINS_TONICS", scheme: "POL", category: "medicine", description: "Vitamin/mineral supplements, geriatric vitamins, tonics, stimulants excluded", severity: "error", notes: "Bioplus, Gericomplex, Sportron etc." },
  { ruleId: "POL_EX_HOMEOPATHIC", scheme: "POL", category: "alternative_health", description: "Naturo- and homeopathic remedies/supplements, natural oils excluded", severity: "error", notes: "Weleda, primrose oils, fish liver oil etc." },
  { ruleId: "POL_EX_GROWTH_HORMONES", scheme: "POL", category: "medicine", description: "Growth hormones excluded", severity: "error", notes: "Genotropin etc." },
  { ruleId: "POL_EX_PRIVATE_ROOMS", scheme: "POL", category: "hospital", description: "Private/semi-private rooms excluded unless motivated and approved for clinical need", severity: "warning", notes: "General ward standard." },
  { ruleId: "POL_EX_3RD_GEN_BABIES", scheme: "POL", category: "maternity", description: "3rd generation babies excluded from maternity benefit", severity: "error", notes: "Grandchildren of member excluded." },

  // ── Sasolmed-specific exclusions (2026 Benefit Schedule) ──
  { ruleId: "SAS_EX_COSMETIC_DENTAL", scheme: "SAS", category: "dental", description: "Dentistry cosmetic procedures excluded from benefits", severity: "error", notes: "All cosmetic dental excluded." },
  { ruleId: "SAS_EX_ORTHO_21", scheme: "SAS", category: "dental", description: "Orthodontic treatment for members 21 years and above excluded", severity: "error", notes: "Adult orthodontics not covered." },
  { ruleId: "SAS_EX_NON_EMERGENCY_TRANSPORT", scheme: "SAS", category: "general", description: "Non-emergency transportation excluded", severity: "error", notes: "Only medically justified emergency transport covered." },
  { ruleId: "SAS_EX_VITAMINS", scheme: "SAS", category: "medicine", description: "Vitamin and mineral supplements excluded from day-to-day benefits", severity: "error", notes: "May be covered under chronic benefit when prescribed for registered condition." },
  { ruleId: "SAS_EX_NON_PMB_RESTRICTED", scheme: "SAS", category: "general", description: "Non-PMB services outside network hubs excluded on Restricted Network Option", planRestrictions: ["Restricted Network"], severity: "error", notes: "Must use Mediclinic/Intercare network." },
  { ruleId: "SAS_EX_AMBULANCE_OUTSIDE_SA", scheme: "SAS", category: "general", description: "Ambulance services outside borders of South Africa and repatriation excluded", severity: "error", notes: "No cross-border ambulance benefit." },
  { ruleId: "SAS_EX_ACUPUNCTURE", scheme: "SAS", category: "alternative_health", description: "Acupuncture, homeopathy, naturopathy and osteopathy subject to limits", severity: "warning", notes: "Limited alternative health benefit — check plan limits." },
  { ruleId: "SAS_EX_INFERTILITY", scheme: "SAS", category: "infertility", description: "Infertility investigations, treatment, procedures and surgery subject to strict limits", severity: "warning", notes: "Very limited benefit. Must be pre-authorised." },
  { ruleId: "SAS_EX_FORMULARY_EXCLUSIONS", scheme: "SAS", category: "medicine", description: "Medicine formulary exclusions apply on chronic and specialised drugs", severity: "warning", notes: "Must use Sasolmed formulary medicines." },
  { ruleId: "SAS_EX_SPEC_RADIOLOGY", scheme: "SAS", category: "radiology", description: "Maternity, oncology, organ transplant and renal dialysis excluded from specialised radiology limit", severity: "info", notes: "Covered under separate dedicated benefits." },
  { ruleId: "SAS_EX_FACILITY_ADMIN_FEE", scheme: "SAS", category: "hospital", description: "Facility/admin fee at emergency room excluded", severity: "error", notes: "ER admin fees not payable." },
  { ruleId: "SAS_EX_CO_PAY_NON_FORMULARY", scheme: "SAS", category: "medicine", description: "20% deductible co-payment on non-formulary acute medicine", severity: "warning", notes: "Must use formulary to avoid co-pay." },
  { ruleId: "SAS_EX_OUT_OF_NETWORK", scheme: "SAS", category: "general", description: "20% co-payment for out-of-network services", severity: "warning", notes: "Must use designated network providers." },
  { ruleId: "SAS_EX_OSSEO_IMPLANTS", scheme: "SAS", category: "dental", description: "Osseo-integrated implants subject to advanced dentistry limit", severity: "warning", notes: "Pre-authorisation required. Limit applies." },
  { ruleId: "SAS_EX_EX_GRATIA_EXCLUSIONS", scheme: "SAS", category: "general", description: "Scheme exclusions, stale claims (>120 days), co-payments and amounts <R1000 excluded from ex gratia", severity: "info", notes: "Cannot appeal exclusions via ex gratia." },
  { ruleId: "SAS_EX_APPLIANCE_MAINTENANCE", scheme: "SAS", category: "appliance", description: "All costs for maintenance of medical appliances are a Scheme exclusion", severity: "error", notes: "Repair and maintenance not covered." },
  { ruleId: "SAS_EX_DENTAL_GA_SEDATION", scheme: "SAS", category: "dental", description: "General anaesthesia and conscious sedation for dental procedures subject to strict protocols", severity: "warning", notes: "Must meet clinical criteria for GA." },
  { ruleId: "SAS_EX_NON_NETWORK_RESTRICTED", scheme: "SAS", category: "general", description: "No cover out of network on Restricted Network Option unless PMB", planRestrictions: ["Restricted Network"], severity: "error", notes: "Strictly network-bound." },
  { ruleId: "SAS_EX_CT_COLONOGRAPHY", scheme: "SAS", category: "radiology", description: "CT colonography (virtual colonoscopy) excluded from specialised radiology benefit", severity: "error", notes: "Use conventional colonoscopy." },
  { ruleId: "SAS_EX_SPECIALIST_NO_REFERRAL", scheme: "SAS", category: "general", description: "35% co-payment on specialist services without GP referral", severity: "warning", notes: "Must have GP referral to avoid penalty." },

  // ── Libcare-specific exclusions (2026 Benefit Guide) ──
  { ruleId: "LIB_EX_4D_SCAN", scheme: "LIB", category: "maternity", description: "4D pregnancy scans excluded", severity: "error", notes: "Standard 2D scans only." },
  { ruleId: "LIB_EX_ABDOMINOPLASTY", scheme: "LIB", category: "surgical", description: "Abdominoplasties excluded", severity: "error", notes: "Tummy tuck not covered." },
  { ruleId: "LIB_EX_WORK_ACCIDENTS", scheme: "LIB", category: "general", description: "Accidents that happen at work excluded", severity: "error", notes: "Covered by COIDA/Workmen's Compensation." },
  { ruleId: "LIB_EX_ACNE_ORAL", scheme: "LIB", category: "medicine", description: "Oral acne preparations excluded", severity: "error", notes: "Roaccutane etc. excluded." },
  { ruleId: "LIB_EX_OUTSIDE_SA", scheme: "LIB", category: "general", description: "All expenses outside common monetary area of Southern Africa excluded", severity: "error", notes: "Arrange travel insurance separately." },
  { ruleId: "LIB_EX_ANABOLIC_STEROIDS", scheme: "LIB", category: "medicine", description: "Anabolic steroids excluded", severity: "error", notes: "Performance-enhancing drugs." },
  { ruleId: "LIB_EX_ANTI_ADDICTION", scheme: "LIB", category: "medicine", description: "Anti-addiction and anti-habit agents excluded", severity: "error", notes: "Substance abuse medication excluded." },
  { ruleId: "LIB_EX_MISSED_APPOINTMENTS", scheme: "LIB", category: "general", description: "Appointments not kept excluded", severity: "error", notes: "No-show fees not payable." },
  { ruleId: "LIB_EX_AROMATHERAPY", scheme: "LIB", category: "alternative_health", description: "Aromatherapy excluded", severity: "error", notes: "Alternative therapy not covered." },
  { ruleId: "LIB_EX_ART_THERAPY", scheme: "LIB", category: "alternative_health", description: "Art therapy excluded", severity: "error", notes: "Not a medical benefit." },
  { ruleId: "LIB_EX_AUTOPSIES", scheme: "LIB", category: "general", description: "Autopsies excluded", severity: "error", notes: "Post-mortem not covered." },
  { ruleId: "LIB_EX_AYURVEDICS", scheme: "LIB", category: "alternative_health", description: "Ayurvedics excluded", severity: "error", notes: "Alternative medicine excluded." },
  { ruleId: "LIB_EX_BACKRESTS_BEDS", scheme: "LIB", category: "appliance", description: "Back rests, chair seats, beds, mattresses, orthopaedic shoes, boots, arch support and inner soles excluded", severity: "error", notes: "Home comfort devices excluded." },
  { ruleId: "LIB_EX_BITE_PLATES", scheme: "LIB", category: "dental", description: "Bite plates and mouth (gum) guards excluded", severity: "error", notes: "Sport accessories excluded." },
  { ruleId: "LIB_EX_BP_MONITORS", scheme: "LIB", category: "appliance", description: "Blood pressure monitors excluded", severity: "error", notes: "Home monitoring devices excluded." },
  { ruleId: "LIB_EX_BREAST_AUG_REDUCTION", scheme: "LIB", category: "surgical", description: "Breast augmentation and reductions excluded", severity: "error", notes: "Cosmetic breast surgery excluded." },
  { ruleId: "LIB_EX_COCHLEAR", scheme: "LIB", category: "prosthesis", description: "Cochlear implants excluded", severity: "error", notes: "High-cost hearing device excluded." },
  { ruleId: "LIB_EX_COSMETIC_PREPS", scheme: "LIB", category: "medicine", description: "Cosmetic preparations, emollients and moisturisers excluded", severity: "error", notes: "Skincare products not covered." },
  { ruleId: "LIB_EX_CRYO_STORAGE", scheme: "LIB", category: "general", description: "Cryo-storage of foetal stem cells and sperm excluded", severity: "error", notes: "Preservation not covered." },
  { ruleId: "LIB_EX_IMPOTENCE", scheme: "LIB", category: "medicine", description: "Drugs for treatment of impotence, sexual dysfunction, aphrodisiacs excluded", severity: "error", notes: "Erectile dysfunction medication excluded." },
  { ruleId: "LIB_EX_EPILATION", scheme: "LIB", category: "procedure", description: "Epilation treatment for hair removal excluded", severity: "error", notes: "Cosmetic hair removal." },
  { ruleId: "LIB_EX_ERECTILE_SURGERY", scheme: "LIB", category: "surgical", description: "Erectile dysfunction surgical procedures excluded", severity: "error", notes: "Penile implants etc." },
  { ruleId: "LIB_EX_EVENING_PRIMROSE", scheme: "LIB", category: "medicine", description: "Evening primrose oil, fish liver oil preparations and combinations excluded", severity: "error", notes: "Supplements excluded." },
  { ruleId: "LIB_EX_FOOD_SUPPLEMENTS", scheme: "LIB", category: "medicine", description: "Food and nutritional supplements excluded", severity: "error", notes: "Nutritional products not covered." },
  { ruleId: "LIB_EX_GENDER_REALIGNMENT", scheme: "LIB", category: "surgical", description: "Gender re-alignment excluded", severity: "error", notes: "Gender reassignment not covered." },
  { ruleId: "LIB_EX_GROWTH_HORMONES", scheme: "LIB", category: "medicine", description: "Growth hormones excluded", severity: "error", notes: "Not covered." },
  { ruleId: "LIB_EX_HUMIDIFIERS", scheme: "LIB", category: "appliance", description: "Humidifiers excluded", severity: "error", notes: "Home devices excluded." },
  { ruleId: "LIB_EX_HYPERBARIC_O2", scheme: "LIB", category: "procedure", description: "Hyperbaric oxygen treatment excluded", severity: "error", notes: "Limited clinical evidence." },
  { ruleId: "LIB_EX_IMMUNOSUPPRESSIVES", scheme: "LIB", category: "medicine", description: "Immuno-suppressives and immuno-stimulants excluded", severity: "error", notes: "Unless PMB or transplant." },
  { ruleId: "LIB_EX_INFERTILITY", scheme: "LIB", category: "infertility", description: "Infertility treatment excluded except as specified in Medical Schemes Act", severity: "error", notes: "PMB portion only." },
  { ruleId: "LIB_EX_INSULIN_PUMPS", scheme: "LIB", category: "appliance", description: "Insulin pumps and consumables excluded", severity: "error", notes: "Pump therapy excluded." },
  { ruleId: "LIB_EX_IRIDOLOGY", scheme: "LIB", category: "alternative_health", description: "Iridology excluded", severity: "error", notes: "Alternative practice excluded." },
  { ruleId: "LIB_EX_KELOID", scheme: "LIB", category: "surgical", description: "Keloid surgery and revision of scars excluded (except post-burns and functional impairment)", severity: "warning", notes: "Must be post-burn or functional deficit." },
  { ruleId: "LIB_EX_MASSAGES", scheme: "LIB", category: "alternative_health", description: "Massages excluded", severity: "error", notes: "Massage therapy not covered." },
  { ruleId: "LIB_EX_MEDICATED_SHAMPOO", scheme: "LIB", category: "medicine", description: "Medicated shampoos and conditioners including hair loss treatments excluded", severity: "error", notes: "Hair products excluded." },
  { ruleId: "LIB_EX_MOTORISED_WHEELCHAIR", scheme: "LIB", category: "appliance", description: "Motorised wheelchairs excluded", severity: "error", notes: "Manual wheelchairs may be covered." },
  { ruleId: "LIB_EX_MRI_BY_GP", scheme: "LIB", category: "radiology", description: "MRI scans ordered by GP excluded", severity: "error", notes: "Must be referred by specialist." },
  { ruleId: "LIB_EX_OBESITY", scheme: "LIB", category: "surgical", description: "Certain surgical treatment for obesity excluded", severity: "error", notes: "Bariatric surgery excluded." },
  { ruleId: "LIB_EX_ORGAN_DONOR_NON_MEMBER", scheme: "LIB", category: "surgical", description: "Organ donations to non-member/non-dependant excluded", severity: "error", notes: "Donor must be for Libcare member." },
  { ruleId: "LIB_EX_ORTHO_21", scheme: "LIB", category: "dental", description: "Orthodontic treatment for patients over 21 years excluded", severity: "error", notes: "Adult orthodontics excluded." },
  { ruleId: "LIB_EX_ORTHOGNATHIC", scheme: "LIB", category: "dental", description: "Orthognatic surgery for cosmetic purposes excluded", severity: "error", notes: "Jaw surgery excluded." },
  { ruleId: "LIB_EX_OTOPLASTY", scheme: "LIB", category: "surgical", description: "Otoplasties excluded", severity: "error", notes: "Ear pinning not covered." },
  { ruleId: "LIB_EX_PAIN_MACHINES", scheme: "LIB", category: "appliance", description: "Pain-relieving machines excluded", severity: "error", notes: "TENS etc. excluded." },
  { ruleId: "LIB_EX_ANTI_AGEING_PATH", scheme: "LIB", category: "pathology", description: "Pathology investigations pertaining to anti-ageing excluded", severity: "error", notes: "Anti-ageing testing excluded." },
  { ruleId: "LIB_EX_REFLEXOLOGY", scheme: "LIB", category: "alternative_health", description: "Reflexology excluded", severity: "error", notes: "Alternative practice excluded." },
  { ruleId: "LIB_EX_TUBAL_REVERSAL", scheme: "LIB", category: "infertility", description: "Reversal of tubal ligation excluded", severity: "error", notes: "Sterilisation reversal excluded." },
  { ruleId: "LIB_EX_VASECTOMY_REVERSAL", scheme: "LIB", category: "infertility", description: "Reversal of vasectomy excluded", severity: "error", notes: "Sterilisation reversal excluded." },
  { ruleId: "LIB_EX_RHINOPLASTY", scheme: "LIB", category: "surgical", description: "Rhinoplasties excluded", severity: "error", notes: "Cosmetic nose surgery excluded." },
  { ruleId: "LIB_EX_SLEEP_THERAPY", scheme: "LIB", category: "procedure", description: "Sleep therapy excluded", severity: "error", notes: "Not covered." },
  { ruleId: "LIB_EX_SLIMMING", scheme: "LIB", category: "medicine", description: "Slimming preparations excluded", severity: "error", notes: "Weight loss drugs excluded." },
  { ruleId: "LIB_EX_SOAPS_CLEANSERS", scheme: "LIB", category: "medicine", description: "Soaps, scrubs and other cleansers excluded", severity: "error", notes: "Personal care products excluded." },
  { ruleId: "LIB_EX_STIMULANT_LAXATIVES", scheme: "LIB", category: "medicine", description: "Stimulant laxatives excluded", severity: "error", notes: "OTC laxatives excluded." },
  { ruleId: "LIB_EX_SUNGLASSES", scheme: "LIB", category: "optical", description: "Sunglasses, readers and coloured contact lenses excluded", severity: "error", notes: "Non-prescription optical excluded." },
  { ruleId: "LIB_EX_SUNSCREEN", scheme: "LIB", category: "medicine", description: "Sunscreening and suntanning preparations excluded", severity: "error", notes: "Sun products excluded." },
  { ruleId: "LIB_EX_TELEPHONE_CONSULT", scheme: "LIB", category: "general", description: "Telephone consultations excluded", severity: "error", notes: "Telephonic advice not payable." },
  { ruleId: "LIB_EX_TRAVEL", scheme: "LIB", category: "general", description: "Travelling expenses incurred by member or dependant excluded", severity: "error", notes: "General transport excluded." },
  { ruleId: "LIB_EX_VETERINARY", scheme: "LIB", category: "general", description: "Veterinary products excluded", severity: "error", notes: "Human scheme only." },
  { ruleId: "LIB_EX_VITAMINS", scheme: "LIB", category: "medicine", description: "Vitamin and mineral supplements excluded", severity: "error", notes: "Supplements not covered." },
  { ruleId: "LIB_EX_SCRIPT_NO_CONSULT", scheme: "LIB", category: "general", description: "Writing of a script without being present at consultation excluded", severity: "error", notes: "Must have in-person consultation." },
  { ruleId: "LIB_EX_READERS", scheme: "LIB", category: "optical", description: "Reading glasses (readers) excluded from optometry benefit", severity: "error", notes: "OTC readers excluded." },

  // ── Makoti-specific exclusions (2025 Benefit Guide) ──
  { ruleId: "MAK_EX_OBESITY", scheme: "MAK", category: "general", description: "Treatment of obesity and direct complications excluded", severity: "error", notes: "Weight loss treatment excluded." },
  { ruleId: "MAK_EX_NOT_MEDICALLY_INDICATED", scheme: "MAK", category: "general", description: "Items or treatments that are not medically indicated excluded", severity: "error", notes: "Must have clinical justification." },
  { ruleId: "MAK_EX_SELF_INFLICTED", scheme: "MAK", category: "general", description: "Willfully self-inflicted injuries excluded", severity: "error", notes: "Unless PMB. Self-harm excluded." },
  { ruleId: "MAK_EX_PROFESSIONAL_SPORT", scheme: "MAK", category: "general", description: "Injuries arising from professional sport and speed contests excluded", severity: "error", notes: "Professional athletes excluded." },
  { ruleId: "MAK_EX_APPLIANCE_HIRE", scheme: "MAK", category: "appliance", description: "Hire of medical, surgical and other appliances excluded", severity: "error", notes: "Rental devices not covered." },
  { ruleId: "MAK_EX_SURGICAL_STOCKINGS", scheme: "MAK", category: "appliance", description: "Surgical stockings excluded", severity: "error", notes: "Compression stockings not covered." },
  { ruleId: "MAK_EX_UNREGISTERED_PROVIDER", scheme: "MAK", category: "general", description: "Medical services by unregistered providers (HPCSA, SANC, SAPC) excluded", severity: "error", notes: "Must be professionally registered." },
  { ruleId: "MAK_EX_RECUPERATIVE_HOLIDAY", scheme: "MAK", category: "general", description: "Recuperative holidays excluded", severity: "error", notes: "Wellness retreats not covered." },
  { ruleId: "MAK_EX_DENTAL_NON_MEDICAL", scheme: "MAK", category: "dental", description: "Dental extractions for non-medical purposes excluded", severity: "error", notes: "Must be clinically indicated." },
  { ruleId: "MAK_EX_GOLD_INLAYS", scheme: "MAK", category: "dental", description: "Gold inlays excluded", severity: "error", notes: "Dental gold work excluded." },
  { ruleId: "MAK_EX_EXPERIMENTAL", scheme: "MAK", category: "general", description: "Unproven or experimental treatment excluded", severity: "error", notes: "Must have clinical evidence." },
  { ruleId: "MAK_EX_COSMETIC", scheme: "MAK", category: "surgical", description: "Cosmetic and reconstructive surgery, treatment or appliances excluded", severity: "error", notes: "All cosmetic procedures excluded." },
  { ruleId: "MAK_EX_FRAIL_CARE", scheme: "MAK", category: "general", description: "Frail care and convalescence excluded", severity: "error", notes: "Long-term care not covered." },
  { ruleId: "MAK_EX_EMPLOYER_MEDICAL_EXAM", scheme: "MAK", category: "general", description: "Employee medical examinations initiated by employer excluded", severity: "error", notes: "Occupational health excluded." },
  { ruleId: "MAK_EX_THIRD_PARTY", scheme: "MAK", category: "general", description: "Injuries where another party is responsible (RAF, Workmen's Compensation) excluded", severity: "error", notes: "Must claim from liable party." },
  { ruleId: "MAK_EX_ROACCUTANE", scheme: "MAK", category: "medicine", description: "Roaccutane and Retin A for skin conditions excluded", severity: "error", notes: "Isotretinoin excluded." },
  { ruleId: "MAK_EX_CONTRACEPTIVES", scheme: "MAK", category: "medicine", description: "Contraceptives and contraceptive devices excluded", severity: "error", notes: "Birth control not covered." },
  { ruleId: "MAK_EX_TRAVEL", scheme: "MAK", category: "general", description: "Member-related travelling expenses excluded", severity: "error", notes: "Transport not covered." },
  { ruleId: "MAK_EX_MISSED_APPOINTMENTS", scheme: "MAK", category: "general", description: "Charges for appointments beneficiary fails to keep excluded", severity: "error", notes: "No-show not payable." },
  { ruleId: "MAK_EX_AFTER_HOURS", scheme: "MAK", category: "general", description: "Elective (non-emergency) after-hours consultations excluded", severity: "error", notes: "Must be emergency for after-hours." },
  { ruleId: "MAK_EX_EMPLOYER_INOCULATION", scheme: "MAK", category: "general", description: "Medical examinations or mass inoculation initiated by employers excluded", severity: "error", notes: "Occupational health not covered." },
  { ruleId: "MAK_EX_ALLERGY_PATH", scheme: "MAK", category: "pathology", description: "Pathology tests for allergies excluded", severity: "error", notes: "Allergy panel testing excluded." },
  { ruleId: "MAK_EX_INFERTILITY", scheme: "MAK", category: "infertility", description: "Infertility treatment excluded (except PMB)", severity: "error", notes: "IVF etc. excluded." },
  { ruleId: "MAK_EX_NASAL_BREAST_RECON", scheme: "MAK", category: "surgical", description: "Nasal or breast reconstruction excluded except for medical reasons", severity: "error", notes: "Functional reasons only." },
  { ruleId: "MAK_EX_UNREGISTERED_MEDS", scheme: "MAK", category: "medicine", description: "Medicines not registered with Medicines Control Council excluded", severity: "error", notes: "Must have SAHPRA registration." },
  { ruleId: "MAK_EX_TOILETRIES", scheme: "MAK", category: "medicine", description: "Toiletries and beauty preparations excluded", severity: "error", notes: "Personal care products." },
  { ruleId: "MAK_EX_HOMEMADE_REMEDIES", scheme: "MAK", category: "alternative_health", description: "Homemade remedies excluded", severity: "error", notes: "Non-pharmaceutical remedies." },
  { ruleId: "MAK_EX_ALTERNATIVE_MEDS", scheme: "MAK", category: "alternative_health", description: "Alternative medicines excluded", severity: "error", notes: "Herbal, homeopathic etc." },
  { ruleId: "MAK_EX_BANDAGES_AIDS", scheme: "MAK", category: "appliance", description: "Bandages and aids excluded", severity: "error", notes: "First aid supplies excluded." },
  { ruleId: "MAK_EX_PATENT_BABY_FOOD", scheme: "MAK", category: "medicine", description: "Patented foods including baby foods and milk substitutes excluded", severity: "error", notes: "Infant formula excluded." },
  { ruleId: "MAK_EX_SLIMMING", scheme: "MAK", category: "medicine", description: "Slimming preparations excluded", severity: "error", notes: "Weight loss drugs excluded." },
  { ruleId: "MAK_EX_TONICS_SUPPLEMENTS", scheme: "MAK", category: "medicine", description: "Tonics and nutritional supplements excluded", severity: "error", notes: "Supplements excluded." },
  { ruleId: "MAK_EX_HERBAL_REMEDIES", scheme: "MAK", category: "alternative_health", description: "Household biochemical and herbal remedies excluded", severity: "error", notes: "Traditional/herbal remedies." },
  { ruleId: "MAK_EX_VITAMINS", scheme: "MAK", category: "medicine", description: "Vitamins and mineral supplements excluded", severity: "error", notes: "Supplements not covered." },
  { ruleId: "MAK_EX_DONOR_NOT_COVERED", scheme: "MAK", category: "surgical", description: "Organ transplant donor costs not covered", severity: "error", notes: "Subject to PMBs and pre-auth." },
  { ruleId: "MAK_EX_LOST_SPECTACLES", scheme: "MAK", category: "optical", description: "Replacement of lost spectacles not covered", severity: "error", notes: "Only initial provision covered." },
  { ruleId: "MAK_EX_SPECIALISED_DENTISTRY_PRIMARY", scheme: "MAK", category: "dental", description: "No benefit for specialised dentistry or dentures on Primary option", planRestrictions: ["Primary"], severity: "error", notes: "Primary option: basic dentistry only." },
  { ruleId: "MAK_EX_VITAMINS_LAXATIVES", scheme: "MAK", category: "medicine", description: "Vitamins, laxatives and proton pump inhibitors not on formulary excluded", severity: "error", notes: "Must use formulary medicines." },

  // ── Retail Medical Scheme-specific exclusions (2026 Member Guide) ──
  { ruleId: "RET_EX_COSMETIC", scheme: "RET", category: "surgical", description: "Cosmetic procedures excluded — otoplasty, port-wine stains, blepharoplasty, keloid scars, hair removal, nasal reconstruction, gender reassignment", severity: "error", notes: "All cosmetic and gender reassignment excluded." },
  { ruleId: "RET_EX_BREAST_REDUCTION_IMPLANTS", scheme: "RET", category: "surgical", description: "Breast reductions and implants excluded", severity: "error", notes: "Cosmetic breast surgery excluded." },
  { ruleId: "RET_EX_OBESITY", scheme: "RET", category: "general", description: "Treatment for obesity excluded", severity: "error", notes: "Weight loss treatment excluded." },
  { ruleId: "RET_EX_INFERTILITY", scheme: "RET", category: "infertility", description: "Treatment for infertility excluded (subject to PMB)", severity: "error", notes: "PMB portion only." },
  { ruleId: "RET_EX_FRAIL_CARE", scheme: "RET", category: "general", description: "Frail care excluded", severity: "error", notes: "Long-term care not covered." },
  { ruleId: "RET_EX_EXPERIMENTAL", scheme: "RET", category: "general", description: "Experimental, unproven or unregistered treatment or practices excluded", severity: "error", notes: "Must have clinical evidence and SAHPRA registration." },
  { ruleId: "RET_EX_CT_ANGIOGRAM", scheme: "RET", category: "radiology", description: "CT angiogram of coronary vessels and CT colonoscopy excluded", severity: "error", notes: "Use conventional diagnostic methods." },
  { ruleId: "RET_EX_REHAB_NON_PMB", scheme: "RET", category: "general", description: "Alcohol and drug rehabilitation treatment excluded unless PMB-related", severity: "error", notes: "Substance abuse — PMB only." },
  { ruleId: "RET_EX_TOILETRIES", scheme: "RET", category: "medicine", description: "Applicators, toiletries and beauty preparations excluded (unless prescribed)", severity: "error", notes: "Personal care products excluded." },
  { ruleId: "RET_EX_BANDAGES", scheme: "RET", category: "appliance", description: "Bandages, cotton wool and other consumable items excluded (unless prescribed)", severity: "error", notes: "First aid supplies excluded." },
  { ruleId: "RET_EX_PATENT_BABY_FOOD", scheme: "RET", category: "medicine", description: "Patented foods including baby foods excluded (unless prescribed)", severity: "error", notes: "Infant formula excluded." },
  { ruleId: "RET_EX_TONICS_SLIMMING", scheme: "RET", category: "medicine", description: "Tonics, slimming preparations and drugs excluded (unless prescribed)", severity: "error", notes: "Weight loss and tonics excluded." },
  { ruleId: "RET_EX_HOUSEHOLD_REMEDIES", scheme: "RET", category: "alternative_health", description: "Household and biochemical remedies excluded", severity: "error", notes: "Traditional remedies excluded." },
  { ruleId: "RET_EX_ANABOLIC_STEROIDS", scheme: "RET", category: "medicine", description: "Anabolic steroids excluded", severity: "error", notes: "Performance-enhancing drugs excluded." },
  { ruleId: "RET_EX_SUNSCREEN", scheme: "RET", category: "medicine", description: "Sunscreen agents excluded", severity: "error", notes: "Sun protection products excluded." },
  { ruleId: "RET_EX_SEARCH_RESCUE", scheme: "RET", category: "general", description: "Costs of search and rescue excluded", severity: "error", notes: "Emergency search operations excluded." },
  { ruleId: "RET_EX_THIRD_PARTY", scheme: "RET", category: "general", description: "Costs where another party is legally responsible excluded", severity: "error", notes: "RAF, COIDA etc." },
  { ruleId: "RET_EX_ER_FACILITY_FEE", scheme: "RET", category: "hospital", description: "Facility fees at casualty facilities excluded (unless stated for specific benefits)", severity: "error", notes: "Admin fees at ER not payable." },
  { ruleId: "RET_EX_RECUPERATIVE_HOLIDAY", scheme: "RET", category: "general", description: "Holidays for recuperative purposes excluded", severity: "error", notes: "Wellness retreats excluded." },
  { ruleId: "RET_EX_MISSED_APPOINTMENTS", scheme: "RET", category: "general", description: "Appointments not kept excluded", severity: "error", notes: "No-show not payable." },
  { ruleId: "RET_EX_INTEREST_LATE_CLAIMS", scheme: "RET", category: "general", description: "Interest charges for late claims payments caused by member excluded", severity: "error", notes: "Member responsible for timely submission." },
  { ruleId: "RET_EX_PMB_OUTSIDE_SA", scheme: "RET", category: "general", description: "PMB-related healthcare services received outside South Africa excluded", severity: "error", notes: "PMB only covered within SA borders." },
  { ruleId: "RET_EX_CLINICAL_PROTOCOLS", scheme: "RET", category: "general", description: "Services not meeting Scheme clinical protocols and treatment guidelines excluded", severity: "error", notes: "Must follow clinical pathways." },
  { ruleId: "RET_EX_FRAUDULENT_CLAIMS", scheme: "RET", category: "general", description: "Costs related to fraudulent claims excluded", severity: "error", notes: "Fraud = no benefit." },
  { ruleId: "RET_EX_WAITING_PERIOD", scheme: "RET", category: "general", description: "Healthcare services during applicable waiting periods excluded", severity: "error", notes: "No cover during waiting periods." },
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
