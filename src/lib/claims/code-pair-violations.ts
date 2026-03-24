// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SA ICD-10 / Tariff Code-Pair Violation Database
//
// The South African equivalent of the US NCCI (National Correct Coding Initiative)
// edits. Based on:
//   - PHISC CCSA v11 (October 2024) — bundling/unbundling rules
//   - CMS (Council for Medical Schemes) circulars and adjudication guidelines
//   - SAMA coding manual — procedure grouping and component logic
//   - BHF (Board of Healthcare Funders) coding standards
//   - WHO ICD-10 coding conventions (SA uses WHO variant, NOT US ICD-10-CM)
//   - Medical Schemes Act 131 of 1998 — PMB regulations
//   - HPCSA ethical billing rules (Booklet 4: Tariff Guidelines)
//   - Scheme-specific clinical edit sets (Discovery, GEMS, Bonitas, Momentum)
//
// SA does NOT have a single published NCCI-equivalent. Instead, coding edits are
// distributed across CCSA guidelines, scheme clinical edit engines, and switching
// house rules (Healthbridge, SwitchOn, MediKredit). This database consolidates
// the known rules from all authoritative sources.
//
// IMPORTANT: SA uses 4-digit CCSA tariff codes (NOT US CPT). ICD-10 is WHO
// variant (NOT US ICD-10-CM). NAPPI codes are for medicines, not procedures.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CodePairViolation {
  /** First ICD-10 or tariff code in the pair */
  code1: string;
  /** Second ICD-10 or tariff code in the pair */
  code2: string;
  /** Type of violation */
  type: "never_together" | "needs_modifier" | "component_of" | "mutually_exclusive";
  /** Human-readable explanation of why the pair violates coding rules */
  reason: string;
  /** Authoritative source for this rule */
  source: string;
  /** Optional: category for grouping in reports */
  category?: "icd10_exclusion" | "tariff_bundling" | "tariff_diagnosis_mismatch" | "procedure_hierarchy" | "pathology_panel" | "radiology_component" | "consultation_overlap" | "surgical_package" | "emergency_overlap" | "anaesthesia_bundling" | "nursing_overlap" | "dental_bundling" | "allied_health_overlap";
}

// ─── Code-Pair Violation Database ─────────────────────────────────────────────

export const CODE_PAIR_VIOLATIONS: CodePairViolation[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 1: ICD-10 MUTUAL EXCLUSIONS (25 pairs)
  // WHO ICD-10 coding conventions — conditions that cannot logically coexist
  // ═══════════════════════════════════════════════════════════════════════════

  // Diabetes type exclusions
  {
    code1: "E10", code2: "E11",
    type: "mutually_exclusive",
    reason: "Type 1 diabetes (E10) and Type 2 diabetes (E11) cannot coexist in the same patient. A patient has one or the other. If both insulin-dependent and insulin-resistant features exist, code E11 with insulin use (Z79.4) or reclassify.",
    source: "WHO ICD-10 coding conventions; CMS CDL guidelines",
    category: "icd10_exclusion",
  },
  {
    code1: "E10", code2: "E13",
    type: "mutually_exclusive",
    reason: "Type 1 diabetes (E10) and other specified diabetes (E13) are mutually exclusive diabetes classifications.",
    source: "WHO ICD-10 coding conventions",
    category: "icd10_exclusion",
  },
  {
    code1: "E10", code2: "E14",
    type: "mutually_exclusive",
    reason: "Type 1 diabetes (E10) and unspecified diabetes (E14) — if type is known, do not also code unspecified.",
    source: "WHO ICD-10 coding conventions",
    category: "icd10_exclusion",
  },
  {
    code1: "E11", code2: "E14",
    type: "mutually_exclusive",
    reason: "Type 2 diabetes (E11) and unspecified diabetes (E14) — if type is known, do not also code unspecified.",
    source: "WHO ICD-10 coding conventions",
    category: "icd10_exclusion",
  },

  // Hypertension type exclusions
  {
    code1: "I10", code2: "I15",
    type: "mutually_exclusive",
    reason: "Essential (primary) hypertension (I10) and secondary hypertension (I15) are mutually exclusive. Hypertension is either primary or secondary — use one classification.",
    source: "WHO ICD-10 Ch IX coding rules",
    category: "icd10_exclusion",
  },
  {
    code1: "I11", code2: "I13",
    type: "mutually_exclusive",
    reason: "Hypertensive heart disease (I11) is a subset of combined heart+renal disease (I13). Use I13 if both heart and renal involvement are present.",
    source: "WHO ICD-10 Ch IX coding rules; BHF coding standards",
    category: "icd10_exclusion",
  },
  {
    code1: "I12", code2: "I13",
    type: "mutually_exclusive",
    reason: "Hypertensive renal disease (I12) is a subset of combined heart+renal disease (I13). Use I13 if both heart and renal involvement are present.",
    source: "WHO ICD-10 Ch IX coding rules; BHF coding standards",
    category: "icd10_exclusion",
  },

  // Respiratory exclusions
  {
    code1: "J44", code2: "J45",
    type: "mutually_exclusive",
    reason: "COPD (J44) and asthma (J45) on the same claim line is clinically questionable. While asthma-COPD overlap syndrome exists, schemes flag this combination. Use J44.8 (other specified COPD) if overlap, or separate encounters.",
    source: "CCSA coding standards; Discovery clinical edits",
    category: "icd10_exclusion",
  },
  {
    code1: "J12", code2: "J18",
    type: "mutually_exclusive",
    reason: "Viral pneumonia (J12) and pneumonia of unspecified organism (J18) — if organism is identified as viral, do not also code unspecified.",
    source: "WHO ICD-10 coding conventions",
    category: "icd10_exclusion",
  },
  {
    code1: "J13", code2: "J18",
    type: "mutually_exclusive",
    reason: "Pneumococcal pneumonia (J13) and unspecified pneumonia (J18) — use the specific code when organism is known.",
    source: "WHO ICD-10 coding conventions",
    category: "icd10_exclusion",
  },

  // Gender-impossible combinations
  {
    code1: "O00", code2: "N40",
    type: "mutually_exclusive",
    reason: "Ectopic pregnancy (O00, female-only) and benign prostatic hyperplasia (N40, male-only) are gender-exclusive and anatomically impossible on the same patient.",
    source: "ICD-10 gender restrictions; SA MIT validation",
    category: "icd10_exclusion",
  },
  {
    code1: "C61", code2: "C56",
    type: "mutually_exclusive",
    reason: "Prostate cancer (C61, male-only) and ovarian cancer (C56, female-only) are gender-exclusive diagnoses.",
    source: "ICD-10 gender restrictions; SA MIT validation",
    category: "icd10_exclusion",
  },
  {
    code1: "N80", code2: "N41",
    type: "mutually_exclusive",
    reason: "Endometriosis (N80, female-only) and prostatitis (N41, male-only) are gender-exclusive diagnoses.",
    source: "ICD-10 gender restrictions; SA MIT validation",
    category: "icd10_exclusion",
  },

  // Acute vs. chronic of same condition
  {
    code1: "B16", code2: "B18.1",
    type: "mutually_exclusive",
    reason: "Acute hepatitis B (B16) and chronic hepatitis B (B18.1) on the same claim — hepatitis B is in either an acute or chronic phase, not simultaneously.",
    source: "WHO ICD-10 coding conventions",
    category: "icd10_exclusion",
  },
  {
    code1: "K25.0", code2: "K25.4",
    type: "mutually_exclusive",
    reason: "Acute gastric ulcer with haemorrhage (K25.0) and chronic gastric ulcer with haemorrhage (K25.4) — same site ulcer is either acute or chronic.",
    source: "WHO ICD-10 Ch XI coding rules",
    category: "icd10_exclusion",
  },
  {
    code1: "N17", code2: "N18",
    type: "mutually_exclusive",
    reason: "Acute kidney failure (N17) and chronic kidney disease (N18) should not both be primary. If acute-on-chronic, code N17 as primary with N18 as secondary.",
    source: "WHO ICD-10 coding conventions; CCSA coding standards",
    category: "icd10_exclusion",
  },
  {
    code1: "M54.4", code2: "M54.5",
    type: "mutually_exclusive",
    reason: "Lumbago with sciatica (M54.4) already includes low back pain — do not also code low back pain (M54.5) separately.",
    source: "WHO ICD-10 Ch XIII coding rules",
    category: "icd10_exclusion",
  },

  // Specific vs. unspecified of same condition
  {
    code1: "E05.0", code2: "E05.9",
    type: "mutually_exclusive",
    reason: "Thyrotoxicosis with diffuse goitre (E05.0) and unspecified thyrotoxicosis (E05.9) — use the more specific code only.",
    source: "WHO ICD-10 coding conventions; BHF specificity rules",
    category: "icd10_exclusion",
  },
  {
    code1: "I21.0", code2: "I21.9",
    type: "mutually_exclusive",
    reason: "Acute anterior wall MI (I21.0) and unspecified acute MI (I21.9) — if wall is identified, do not also code unspecified.",
    source: "WHO ICD-10 Ch IX coding rules",
    category: "icd10_exclusion",
  },
  {
    code1: "K35.0", code2: "K35.9",
    type: "mutually_exclusive",
    reason: "Acute appendicitis with peritonitis (K35.0) and unspecified acute appendicitis (K35.9) — use the more specific code.",
    source: "WHO ICD-10 coding conventions",
    category: "icd10_exclusion",
  },

  // Neoplasm staging conflicts
  {
    code1: "C50", code2: "D05",
    type: "mutually_exclusive",
    reason: "Malignant neoplasm of breast (C50) and carcinoma in situ of breast (D05) — a tumour is either invasive (C) or in situ (D), not both simultaneously at the same site.",
    source: "WHO ICD-10 Ch II coding rules; CCSA morphology rules",
    category: "icd10_exclusion",
  },
  {
    code1: "C53", code2: "D06",
    type: "mutually_exclusive",
    reason: "Malignant neoplasm of cervix (C53) and carcinoma in situ of cervix (D06) — cannot be both invasive and in situ at same site on same claim.",
    source: "WHO ICD-10 Ch II coding rules",
    category: "icd10_exclusion",
  },

  // HIV staging
  {
    code1: "B20", code2: "Z21",
    type: "mutually_exclusive",
    reason: "HIV disease resulting in infectious disease (B20) indicates symptomatic HIV/AIDS, while asymptomatic HIV (Z21) indicates no symptoms. Cannot be both symptomatic and asymptomatic.",
    source: "WHO ICD-10 coding conventions; SA HIV programme coding guidelines",
    category: "icd10_exclusion",
  },
  {
    code1: "B23.0", code2: "Z21",
    type: "mutually_exclusive",
    reason: "Acute HIV infection syndrome (B23.0) and asymptomatic HIV (Z21) are mutually exclusive stages.",
    source: "WHO ICD-10 coding conventions; SA HIV programme coding guidelines",
    category: "icd10_exclusion",
  },

  // Pregnancy exclusion
  {
    code1: "O00", code2: "O30",
    type: "mutually_exclusive",
    reason: "Ectopic pregnancy (O00) and multiple gestation (O30) are mutually exclusive — ectopic pregnancies are not multiple gestations in the uterus.",
    source: "WHO ICD-10 Ch XV coding rules",
    category: "icd10_exclusion",
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 2: TARIFF BUNDLING / UNBUNDLING RULES (55 pairs)
  // CCSA v11 (Oct 2024), SAMA, BHF, scheme clinical edits
  // ═══════════════════════════════════════════════════════════════════════════

  // ── 2a. Consultation overlap (same provider, same day) ─────────────────

  {
    code1: "0190", code2: "0191",
    type: "never_together",
    reason: "Brief GP consultation (0190) and intermediate GP consultation (0191) on the same day by same provider — bill the highest applicable level only.",
    source: "CCSA v11 consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0190", code2: "0192",
    type: "never_together",
    reason: "Brief GP consultation (0190) and comprehensive GP consultation (0192) on the same day — bill the comprehensive code only.",
    source: "CCSA v11 consultation rules",
    category: "consultation_overlap",
  },
  {
    code1: "0190", code2: "0193",
    type: "never_together",
    reason: "Brief GP consultation (0190) and extended GP consultation (0193) on the same day — bill extended only.",
    source: "CCSA v11 consultation rules",
    category: "consultation_overlap",
  },
  {
    code1: "0191", code2: "0193",
    type: "never_together",
    reason: "Intermediate and extended GP consultations on the same day — bill the highest level only.",
    source: "CCSA v11 consultation rules",
    category: "consultation_overlap",
  },
  {
    code1: "0141", code2: "0142",
    type: "never_together",
    reason: "Initial specialist consultation (0141) and follow-up specialist consultation (0142) on the same day by same provider.",
    source: "CCSA v11 consultation rules",
    category: "consultation_overlap",
  },
  {
    code1: "0141", code2: "0143",
    type: "never_together",
    reason: "Initial specialist consultation (0141) and extended specialist consultation (0143) on the same day — bill extended only.",
    source: "CCSA v11 consultation rules",
    category: "consultation_overlap",
  },
  {
    code1: "0141", code2: "0144",
    type: "never_together",
    reason: "Standard and extended specialist consultations on the same day — bill the highest level only.",
    source: "CCSA v11 consultation rules",
    category: "consultation_overlap",
  },
  {
    code1: "0190", code2: "0141",
    type: "never_together",
    reason: "GP consultation and specialist consultation by the same provider on the same day — cannot practise as both GP and specialist simultaneously.",
    source: "CCSA v11 consultation rules; HPCSA scope of practice",
    category: "consultation_overlap",
  },
  {
    code1: "0190", code2: "0290",
    type: "never_together",
    reason: "Standard GP consultation (0190) and after-hours GP consultation (0290) on the same day — after-hours replaces standard, not additive.",
    source: "CCSA v11; modifier/after-hours rules",
    category: "consultation_overlap",
  },
  {
    code1: "0192", code2: "0197",
    type: "never_together",
    reason: "Telephonic consultation (0192) and telehealth consultation (0197) on the same day — bill one modality only.",
    source: "CCSA v11 telehealth coding rules",
    category: "consultation_overlap",
  },

  // ── 2b. Consultation bundled into procedure ────────────────────────────

  {
    code1: "0190", code2: "0500",
    type: "needs_modifier",
    reason: "GP consultation on the same day as a surgical procedure — consultation is bundled into the procedure fee UNLESS modifier 0021 (decision for surgery) is applied to the consultation, or the consultation addresses a completely separate condition with different ICD-10.",
    source: "CCSA v11 surgical global period rules; HPCSA tariff guidelines",
    category: "surgical_package",
  },
  {
    code1: "0141", code2: "0500",
    type: "needs_modifier",
    reason: "Specialist consultation on the same day as a surgical procedure — bundled unless modifier 0021 (decision for surgery) or separate ICD-10.",
    source: "CCSA v11 surgical global period rules",
    category: "surgical_package",
  },
  {
    code1: "0190", code2: "0601",
    type: "component_of",
    reason: "GP consultation is bundled into emergency triage assessment (0601) — cannot bill both. The triage code includes the assessment component.",
    source: "CCSA v11 emergency coding; BHF triage guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0190", code2: "0602",
    type: "component_of",
    reason: "GP consultation is bundled into emergency assessment (0602) — cannot bill both.",
    source: "CCSA v11 emergency coding",
    category: "emergency_overlap",
  },
  {
    code1: "0141", code2: "0601",
    type: "component_of",
    reason: "Specialist consultation is bundled into emergency triage assessment (0601).",
    source: "CCSA v11 emergency coding",
    category: "emergency_overlap",
  },

  // ── 2c. Pathology panel bundling ───────────────────────────────────────

  {
    code1: "4059", code2: "4055",
    type: "component_of",
    reason: "Lipogram panel (4059) already includes total cholesterol (4055) — do not bill both. Total cholesterol is a component of the lipogram.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4059", code2: "4056",
    type: "component_of",
    reason: "Lipogram panel (4059) already includes HDL cholesterol (4056) — do not bill separately.",
    source: "CCSA v11 pathology bundling",
    category: "pathology_panel",
  },
  {
    code1: "4059", code2: "4057",
    type: "component_of",
    reason: "Lipogram panel (4059) already includes LDL cholesterol (4057) — do not bill separately.",
    source: "CCSA v11 pathology bundling",
    category: "pathology_panel",
  },
  {
    code1: "4059", code2: "4058",
    type: "component_of",
    reason: "Lipogram panel (4059) already includes triglycerides (4058) — do not bill separately.",
    source: "CCSA v11 pathology bundling",
    category: "pathology_panel",
  },
  {
    code1: "4014", code2: "4015",
    type: "component_of",
    reason: "Full blood count (4014/FBC) already includes differential white cell count (4015) — do not bill separately.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4014", code2: "4016",
    type: "component_of",
    reason: "Full blood count (4014/FBC) already includes platelet count (4016) — platelet count is a standard FBC component.",
    source: "CCSA v11 pathology bundling",
    category: "pathology_panel",
  },
  {
    code1: "4014", code2: "4017",
    type: "component_of",
    reason: "Full blood count (4014/FBC) already includes haemoglobin (4017) — do not bill Hb separately when FBC is ordered.",
    source: "CCSA v11 pathology bundling",
    category: "pathology_panel",
  },
  {
    code1: "4068", code2: "4064",
    type: "component_of",
    reason: "Liver function test panel (4068/LFT) already includes ALT (4064) — do not bill separately.",
    source: "CCSA v11 pathology bundling",
    category: "pathology_panel",
  },
  {
    code1: "4068", code2: "4065",
    type: "component_of",
    reason: "Liver function test panel (4068/LFT) already includes AST (4065) — do not bill separately.",
    source: "CCSA v11 pathology bundling",
    category: "pathology_panel",
  },
  {
    code1: "4068", code2: "4066",
    type: "component_of",
    reason: "Liver function test panel (4068/LFT) already includes GGT (4066) — do not bill separately.",
    source: "CCSA v11 pathology bundling",
    category: "pathology_panel",
  },
  {
    code1: "4068", code2: "4067",
    type: "component_of",
    reason: "Liver function test panel (4068/LFT) already includes ALP/alkaline phosphatase (4067) — do not bill separately.",
    source: "CCSA v11 pathology bundling",
    category: "pathology_panel",
  },
  {
    code1: "4068", code2: "4069",
    type: "component_of",
    reason: "Liver function test panel (4068/LFT) already includes total bilirubin (4069) — do not bill separately.",
    source: "CCSA v11 pathology bundling",
    category: "pathology_panel",
  },
  {
    code1: "4042", code2: "4043",
    type: "component_of",
    reason: "U&E panel (4042) already includes urea (4043) — do not bill separately.",
    source: "CCSA v11 pathology bundling",
    category: "pathology_panel",
  },
  {
    code1: "4042", code2: "4044",
    type: "component_of",
    reason: "U&E panel (4042) already includes creatinine (4044) — do not bill separately.",
    source: "CCSA v11 pathology bundling",
    category: "pathology_panel",
  },
  {
    code1: "4042", code2: "4045",
    type: "component_of",
    reason: "U&E panel (4042) already includes sodium and potassium (4045) — electrolytes are included in U&E.",
    source: "CCSA v11 pathology bundling",
    category: "pathology_panel",
  },
  {
    code1: "4070", code2: "4071",
    type: "component_of",
    reason: "Thyroid function panel (includes TSH 4070 + free T4 4071) — if a thyroid panel code exists, do not bill components separately.",
    source: "CCSA v11 pathology bundling",
    category: "pathology_panel",
  },

  // ── 2d. Radiology bundling ─────────────────────────────────────────────

  {
    code1: "3601", code2: "3602",
    type: "never_together",
    reason: "Chest X-ray PA only (3601) and chest X-ray PA+lateral (3602) — the PA+lateral includes the PA view. Bill one or the other.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },
  {
    code1: "3801", code2: "3802",
    type: "component_of",
    reason: "Complete abdominal ultrasound (3801) includes limited/focused abdominal US (3802) — do not bill both.",
    source: "CCSA v11 radiology coding",
    category: "radiology_component",
  },
  {
    code1: "3801", code2: "3810",
    type: "component_of",
    reason: "Complete abdominal ultrasound (3801) includes renal ultrasound (3810) — do not bill renal US separately when full abdo US is performed.",
    source: "CCSA v11 radiology coding",
    category: "radiology_component",
  },
  {
    code1: "3901", code2: "3902",
    type: "never_together",
    reason: "CT brain without contrast (3901) and CT brain with contrast (3902) — bill whichever was actually performed. If both performed (pre- and post-contrast), use the with-and-without code if available, or bill the with-contrast study only.",
    source: "CCSA v11 radiology coding; scheme CT authorisation rules",
    category: "radiology_component",
  },
  {
    code1: "3951", code2: "3952",
    type: "never_together",
    reason: "MRI brain without contrast (3951) and MRI brain with contrast (3952) — bill the study actually performed. Use with-and-without code if available.",
    source: "CCSA v11 radiology coding",
    category: "radiology_component",
  },
  {
    code1: "3903", code2: "3904",
    type: "never_together",
    reason: "CT chest without contrast (3903) and CT chest with contrast (3904) — bill the study performed.",
    source: "CCSA v11 radiology coding",
    category: "radiology_component",
  },
  {
    code1: "3905", code2: "3906",
    type: "never_together",
    reason: "CT abdomen without contrast (3905) and CT abdomen with contrast (3906) — bill the study performed.",
    source: "CCSA v11 radiology coding",
    category: "radiology_component",
  },
  {
    code1: "3751", code2: "3752",
    type: "never_together",
    reason: "Screening mammography (3751) and diagnostic mammography (3752) — bill one only per encounter. If screening detects abnormality and diagnostic views are taken, bill diagnostic only.",
    source: "CCSA v11 radiology coding; CMS mammography circular",
    category: "radiology_component",
  },

  // ── 2e. Surgical procedure bundling ────────────────────────────────────

  {
    code1: "0700", code2: "0701",
    type: "never_together",
    reason: "Simple wound repair (0700) and intermediate wound repair (0701) on the same wound — bill the highest complexity level. Multiple wounds of different complexity may be billed separately with modifier 0019.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines",
    category: "surgical_package",
  },
  {
    code1: "0701", code2: "0702",
    type: "never_together",
    reason: "Intermediate wound repair (0701) and complex wound repair (0702) on the same wound — bill highest complexity only.",
    source: "CCSA v11 surgical coding",
    category: "surgical_package",
  },
  {
    code1: "0700", code2: "0702",
    type: "never_together",
    reason: "Simple wound repair (0700) and complex wound repair (0702) on the same wound — bill highest complexity only.",
    source: "CCSA v11 surgical coding",
    category: "surgical_package",
  },
  {
    code1: "1200", code2: "1201",
    type: "component_of",
    reason: "Diagnostic gastroscopy (1200) is included in gastroscopy with biopsy (1201) — if biopsy is taken, bill 1201 only. The diagnostic component is integral to the therapeutic procedure.",
    source: "CCSA v11 endoscopy coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "1210", code2: "1211",
    type: "component_of",
    reason: "Diagnostic colonoscopy (1210) is included in colonoscopy with polypectomy (1211) — bill the therapeutic code only.",
    source: "CCSA v11 endoscopy coding",
    category: "surgical_package",
  },
  {
    code1: "1210", code2: "1212",
    type: "component_of",
    reason: "Diagnostic colonoscopy (1210) is included in colonoscopy with biopsy (1212) — bill the therapeutic code only.",
    source: "CCSA v11 endoscopy coding",
    category: "surgical_package",
  },

  // ── 2f. Emergency triage hierarchy ─────────────────────────────────────

  {
    code1: "0601", code2: "0602",
    type: "never_together",
    reason: "Green triage (0601) and yellow triage (0602) — bill the single highest applicable triage category. Triage is assessed once per encounter.",
    source: "CCSA v11 emergency medicine coding; SA Triage Scale",
    category: "emergency_overlap",
  },
  {
    code1: "0602", code2: "0603",
    type: "never_together",
    reason: "Yellow triage (0602) and orange triage (0603) — bill highest applicable triage category only.",
    source: "CCSA v11 emergency medicine coding; SA Triage Scale",
    category: "emergency_overlap",
  },
  {
    code1: "0603", code2: "0604",
    type: "never_together",
    reason: "Orange triage (0603) and red triage (0604) — bill highest applicable triage category only.",
    source: "CCSA v11 emergency medicine coding; SA Triage Scale",
    category: "emergency_overlap",
  },
  {
    code1: "0601", code2: "0603",
    type: "never_together",
    reason: "Green triage (0601) and orange triage (0603) — only one triage code per ER encounter.",
    source: "CCSA v11 emergency medicine coding",
    category: "emergency_overlap",
  },
  {
    code1: "0601", code2: "0604",
    type: "never_together",
    reason: "Green triage (0601) and red triage (0604) — only one triage code per ER encounter.",
    source: "CCSA v11 emergency medicine coding",
    category: "emergency_overlap",
  },
  {
    code1: "0602", code2: "0604",
    type: "never_together",
    reason: "Yellow triage (0602) and red triage (0604) — only one triage code per ER encounter.",
    source: "CCSA v11 emergency medicine coding",
    category: "emergency_overlap",
  },

  // ── 2g. Anaesthesia bundling ───────────────────────────────────────────

  {
    code1: "0420", code2: "0421",
    type: "never_together",
    reason: "General anaesthesia (0420) and conscious sedation (0421) for the same procedure — patient receives one or the other, not both.",
    source: "CCSA v11 anaesthesia coding; SASA guidelines",
    category: "anaesthesia_bundling",
  },
  {
    code1: "0425", code2: "0420",
    type: "component_of",
    reason: "Local anaesthesia by surgeon (0425) is bundled into the surgeon's procedure fee — do not bill separately. Only the anaesthetist bills anaesthesia codes.",
    source: "CCSA v11 surgical global period rules; HPCSA tariff guidelines",
    category: "anaesthesia_bundling",
  },
  {
    code1: "0426", code2: "0421",
    type: "never_together",
    reason: "Local anaesthesia with sedation — cannot bill both MAC/conscious sedation (0421) and separate local anaesthetic administration (0426) for the same procedure.",
    source: "CCSA v11 anaesthesia coding",
    category: "anaesthesia_bundling",
  },

  // ── 2h. Nursing vs practitioner overlap ────────────────────────────────

  {
    code1: "0308", code2: "8020",
    type: "component_of",
    reason: "ECG interpretation + recording by doctor (0308) includes the recording — do not also bill nursing ECG recording (8020) for the same ECG.",
    source: "CCSA v11 procedure coding; BHF nursing guidelines",
    category: "nursing_overlap",
  },
  {
    code1: "0382", code2: "8006",
    type: "never_together",
    reason: "Point-of-care glucose by doctor (0382) and nursing glucose monitoring (8006) — do not bill both for the same glucose measurement.",
    source: "CCSA v11; BHF nursing guidelines",
    category: "nursing_overlap",
  },
  {
    code1: "8010", code2: "4014",
    type: "needs_modifier",
    reason: "Phlebotomy/blood drawing (8010) and FBC (4014) — the pathology collection fee is often bundled into the pathology test fee. Check scheme rules; some schemes pay drawing fee separately, others do not.",
    source: "CCSA v11; scheme-specific pathology bundling rules",
    category: "nursing_overlap",
  },

  // ── 2i. Dental bundling ────────────────────────────────────────────────

  {
    code1: "8101", code2: "8102",
    type: "never_together",
    reason: "Limited dental examination (8101) and comprehensive dental examination (8102) on the same visit — bill the comprehensive code only.",
    source: "CCSA v11 dental coding; SADA coding guidelines",
    category: "dental_bundling",
  },
  {
    code1: "8155", code2: "8156",
    type: "component_of",
    reason: "Scaling and polishing (8155) includes polishing (8156) — do not bill polishing separately when done as part of scale and polish.",
    source: "CCSA v11 dental coding; SADA coding guidelines",
    category: "dental_bundling",
  },
  {
    code1: "8201", code2: "8202",
    type: "never_together",
    reason: "One-surface restoration (8201) and two-surface restoration (8202) on the same tooth — bill the multi-surface code encompassing all surfaces treated.",
    source: "CCSA v11 dental coding",
    category: "dental_bundling",
  },
  {
    code1: "8601", code2: "8605",
    type: "component_of",
    reason: "Simple extraction (8601) includes local anaesthesia — do not bill dental local anaesthetic (8605) separately with extractions.",
    source: "CCSA v11 dental coding; SADA fee guidelines",
    category: "dental_bundling",
  },

  // ── 2j. Allied health overlap ──────────────────────────────────────────

  {
    code1: "6001", code2: "6002",
    type: "never_together",
    reason: "Initial physiotherapy assessment (6001) and follow-up physiotherapy (6002) on the same day — bill the initial assessment which includes the first treatment session.",
    source: "CCSA v11 allied health coding; SASP guidelines",
    category: "allied_health_overlap",
  },
  {
    code1: "6100", code2: "6101",
    type: "never_together",
    reason: "Initial occupational therapy assessment (6100) and follow-up OT (6101) on the same day — bill initial assessment only.",
    source: "CCSA v11 allied health coding",
    category: "allied_health_overlap",
  },
  {
    code1: "6400", code2: "6401",
    type: "never_together",
    reason: "Initial psychology consultation (6400) and follow-up psychology (6401) on the same day — bill initial consultation only.",
    source: "CCSA v11 allied health coding",
    category: "allied_health_overlap",
  },


  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION 3: TARIFF–DIAGNOSIS MISMATCH PAIRS (15 pairs)
  // ICD-10 codes that are clinically inappropriate for specific tariff codes
  // ═══════════════════════════════════════════════════════════════════════════

  {
    code1: "4090", code2: "N83",
    type: "never_together",
    reason: "PSA test (tariff 4090) is a prostate-specific antigen test — clinically inappropriate with ovarian cyst diagnosis (N83, female-only). PSA is a male-only investigation.",
    source: "BHF clinical appropriateness rules; ICD-10 gender restrictions",
    category: "tariff_diagnosis_mismatch",
  },
  {
    code1: "3751", code2: "C61",
    type: "never_together",
    reason: "Mammography (tariff 3751) with prostate cancer diagnosis (C61, male-only) — mammography is a breast imaging procedure inappropriate for prostate conditions.",
    source: "BHF clinical appropriateness rules; ICD-10 gender restrictions",
    category: "tariff_diagnosis_mismatch",
  },
  {
    code1: "4052", code2: "J06.9",
    type: "never_together",
    reason: "HbA1c test (tariff 4052) with acute upper respiratory infection (J06.9) — HbA1c is a diabetes monitoring test unrelated to acute URTI. Requires diabetes diagnosis (E10-E14) or metabolic screening (Z13.1).",
    source: "CMS clinical edit guidelines; Discovery code-pair edits",
    category: "tariff_diagnosis_mismatch",
  },
  {
    code1: "4211", code2: "M54.5",
    type: "never_together",
    reason: "HIV viral load (tariff 4211) with low back pain diagnosis (M54.5) — viral load monitoring requires HIV diagnosis (B20-B24, Z21). No clinical link to musculoskeletal pain.",
    source: "CMS clinical edit guidelines; SA HIV programme coding",
    category: "tariff_diagnosis_mismatch",
  },
  {
    code1: "4070", code2: "S52",
    type: "never_together",
    reason: "TSH / thyroid function (tariff 4070) with forearm fracture (S52) — no clinical justification for thyroid testing with acute trauma unless pre-existing thyroid condition is also coded.",
    source: "BHF clinical appropriateness rules",
    category: "tariff_diagnosis_mismatch",
  },
  {
    code1: "1600", code2: "N40",
    type: "never_together",
    reason: "Hysterectomy (tariff 1600, gynaecological surgery) with benign prostatic hyperplasia (N40, male-only) — anatomically impossible; gender mismatch between procedure and diagnosis.",
    source: "CCSA v11 discipline-diagnosis validation; ICD-10 gender restrictions",
    category: "tariff_diagnosis_mismatch",
  },
  {
    code1: "1400", code2: "N80",
    type: "never_together",
    reason: "Prostatectomy (tariff 1400, urological surgery) with endometriosis (N80, female-only) — anatomically impossible; gender mismatch.",
    source: "CCSA v11 discipline-diagnosis validation; ICD-10 gender restrictions",
    category: "tariff_diagnosis_mismatch",
  },
  {
    code1: "0308", code2: "L30.9",
    type: "never_together",
    reason: "ECG recording and interpretation (tariff 0308) with dermatitis diagnosis (L30.9) — no clinical justification for cardiac investigation with a skin condition unless co-morbid cardiac condition is coded.",
    source: "BHF clinical appropriateness rules; scheme clinical edits",
    category: "tariff_diagnosis_mismatch",
  },
  {
    code1: "3951", code2: "K29.7",
    type: "never_together",
    reason: "MRI brain (tariff 3951) with gastritis diagnosis (K29.7) — no clinical justification for brain imaging with a GI condition.",
    source: "BHF clinical appropriateness rules; pre-auth requirements",
    category: "tariff_diagnosis_mismatch",
  },
  {
    code1: "4080", code2: "N39.0",
    type: "never_together",
    reason: "Troponin test (tariff 4080, cardiac marker) with urinary tract infection (N39.0) — troponin is indicated for suspected ACS/MI, not urinary infection.",
    source: "CMS clinical edit guidelines; pathology appropriateness",
    category: "tariff_diagnosis_mismatch",
  },
  {
    code1: "0800", code2: "F32",
    type: "never_together",
    reason: "Arthroscopy (tariff 0800, orthopaedic procedure) with depressive episode (F32) — no clinical justification for orthopaedic procedure with a primary psychiatric diagnosis.",
    source: "CCSA v11 discipline-diagnosis validation",
    category: "tariff_diagnosis_mismatch",
  },
  {
    code1: "2200", code2: "H65",
    type: "never_together",
    reason: "Cataract surgery (tariff 2200, ophthalmology) with non-suppurative otitis media (H65, ear condition) — eye surgery has no clinical link to ear pathology.",
    source: "CCSA v11 discipline-diagnosis validation",
    category: "tariff_diagnosis_mismatch",
  },
  {
    code1: "6001", code2: "E11.9",
    type: "never_together",
    reason: "Physiotherapy initial assessment (tariff 6001) with Type 2 diabetes (E11.9) as sole diagnosis — physiotherapy requires a musculoskeletal, neurological, or rehabilitation diagnosis. Diabetes alone does not justify physiotherapy unless diabetic neuropathy (G63.2*) or related complication is coded.",
    source: "CCSA v11 allied health coding; medical scheme allied health rules",
    category: "tariff_diagnosis_mismatch",
  },
  {
    code1: "6400", code2: "I10",
    type: "never_together",
    reason: "Psychology consultation (tariff 6400) with essential hypertension (I10) as sole diagnosis — psychology requires a mental/behavioural diagnosis (F00-F99) or recognised psychosocial indication (Z-codes). Hypertension alone does not justify psychology.",
    source: "CCSA v11 allied health coding; BHF psychology guidelines",
    category: "tariff_diagnosis_mismatch",
  },
  {
    code1: "8300", code2: "I10",
    type: "never_together",
    reason: "Root canal treatment (tariff 8300, endodontics) with essential hypertension (I10) as sole diagnosis — dental procedures require dental/oral diagnosis (K00-K14) or trauma (S02). Hypertension is not a dental indication.",
    source: "CCSA v11 dental coding; SADA coding guidelines",
    category: "tariff_diagnosis_mismatch",
  },
];


// ─── Lookup Helpers ───────────────────────────────────────────────────────────

/**
 * Check all submitted codes (ICD-10 + tariff) for code-pair violations.
 *
 * This function takes an array of codes from a single claim (or a batch grouped
 * by patient+date) and returns all violations found. It performs prefix matching
 * for ICD-10 codes (e.g., code "E10.9" matches rule code "E10").
 *
 * @param codes - Array of ICD-10 and/or tariff codes to check
 * @returns Array of CodePairViolation entries that are triggered
 */
export function checkCodePairViolations(codes: string[]): CodePairViolation[] {
  if (!codes || codes.length < 2) return [];

  const violations: CodePairViolation[] = [];
  const normalised = codes.map(c => c.trim().toUpperCase());

  for (const rule of CODE_PAIR_VIOLATIONS) {
    const code1Upper = rule.code1.toUpperCase();
    const code2Upper = rule.code2.toUpperCase();

    const hasCode1 = normalised.some(c => c === code1Upper || c.startsWith(code1Upper + ".") || code1Upper.startsWith(c + "."));
    const hasCode2 = normalised.some(c => c === code2Upper || c.startsWith(code2Upper + ".") || code2Upper.startsWith(c + "."));

    if (hasCode1 && hasCode2) {
      violations.push(rule);
    }
  }

  return violations;
}

/**
 * Check a specific pair of codes against the violation database.
 *
 * @param codeA - First code (ICD-10 or tariff)
 * @param codeB - Second code (ICD-10 or tariff)
 * @returns The matching violation, or null if the pair is allowed
 */
export function checkSinglePair(codeA: string, codeB: string): CodePairViolation | null {
  const a = codeA.trim().toUpperCase();
  const b = codeB.trim().toUpperCase();

  for (const rule of CODE_PAIR_VIOLATIONS) {
    const c1 = rule.code1.toUpperCase();
    const c2 = rule.code2.toUpperCase();

    const matchForward =
      (a === c1 || a.startsWith(c1 + ".") || c1.startsWith(a + ".")) &&
      (b === c2 || b.startsWith(c2 + ".") || c2.startsWith(b + "."));

    const matchReverse =
      (b === c1 || b.startsWith(c1 + ".") || c1.startsWith(b + ".")) &&
      (a === c2 || a.startsWith(c2 + ".") || c2.startsWith(a + "."));

    if (matchForward || matchReverse) {
      return rule;
    }
  }

  return null;
}

/**
 * Get all violations of a specific type.
 */
export function getViolationsByType(type: CodePairViolation["type"]): CodePairViolation[] {
  return CODE_PAIR_VIOLATIONS.filter(v => v.type === type);
}

/**
 * Get all violations in a specific category.
 */
export function getViolationsByCategory(category: CodePairViolation["category"]): CodePairViolation[] {
  return CODE_PAIR_VIOLATIONS.filter(v => v.category === category);
}

/**
 * Get all violations involving a specific code (either position).
 * Useful for showing all known edit rules for a particular ICD-10 or tariff code.
 */
export function getViolationsForCode(code: string): CodePairViolation[] {
  const c = code.trim().toUpperCase();
  return CODE_PAIR_VIOLATIONS.filter(v => {
    const c1 = v.code1.toUpperCase();
    const c2 = v.code2.toUpperCase();
    return c === c1 || c === c2 || c.startsWith(c1 + ".") || c.startsWith(c2 + ".") || c1.startsWith(c + ".") || c2.startsWith(c + ".");
  });
}

/**
 * Summary statistics for the violation database.
 */
export function getViolationStats(): {
  total: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
} {
  const byType: Record<string, number> = {};
  const byCategory: Record<string, number> = {};

  for (const v of CODE_PAIR_VIOLATIONS) {
    byType[v.type] = (byType[v.type] || 0) + 1;
    if (v.category) {
      byCategory[v.category] = (byCategory[v.category] || 0) + 1;
    }
  }

  return { total: CODE_PAIR_VIOLATIONS.length, byType, byCategory };
}
