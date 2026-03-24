// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Pathology Panel Bundling Rules — SA Healthcare Claims
// ~200 rules covering CCSA v11, NHLS panel definitions, BHF coding standards
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { CodePairViolation } from "./types";

export const PATHOLOGY_PANELS: CodePairViolation[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. LIPOGRAM / LIPID PANEL (4059) — 5 rules
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "4059",
    code2: "4055",
    type: "component_of",
    reason:
      "Lipogram panel (4059) already includes total cholesterol (4055) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4059",
    code2: "4056",
    type: "component_of",
    reason:
      "Lipogram panel (4059) already includes HDL cholesterol (4056) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4059",
    code2: "4057",
    type: "component_of",
    reason:
      "Lipogram panel (4059) already includes LDL cholesterol (4057), whether measured or calculated — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4059",
    code2: "4058",
    type: "component_of",
    reason:
      "Lipogram panel (4059) already includes triglycerides (4058) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4059",
    code2: "4058B",
    type: "component_of",
    reason:
      "Lipogram panel (4059) already includes VLDL calculation from triglycerides — do not bill VLDL separately.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. FULL BLOOD COUNT / FBC (4014) — 7 rules
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "4014",
    code2: "4015",
    type: "component_of",
    reason:
      "FBC (4014) includes automated differential white cell count (4015) — do not bill both. Manual differential is separately billable only when flagged by analyser.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4014",
    code2: "4016",
    type: "component_of",
    reason:
      "FBC (4014) includes platelet count (4016) as a standard parameter — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4014",
    code2: "4017",
    type: "component_of",
    reason:
      "FBC (4014) includes haemoglobin measurement (4017) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4014",
    code2: "4018",
    type: "component_of",
    reason:
      "FBC (4014) includes haematocrit/PCV (4018) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4014",
    code2: "4019",
    type: "component_of",
    reason:
      "FBC (4014) includes red blood cell count (4019) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4014",
    code2: "4020",
    type: "component_of",
    reason:
      "FBC (4014) includes red cell indices MCV, MCH, and MCHC (4020) — these are calculated from Hb, RBC, and HCT already in the panel.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4014",
    code2: "4020B",
    type: "component_of",
    reason:
      "FBC (4014) may include reticulocyte count in extended panels — do not bill reticulocytes (4020B) separately if included in the FBC panel ordered.",
    source: "CCSA v11 pathology bundling; NHLS extended FBC panel definitions",
    category: "pathology_panel",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. LIVER FUNCTION TEST / LFT (4068) — 8 rules
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "4068",
    code2: "4064",
    type: "component_of",
    reason:
      "LFT panel (4068) includes ALT/SGPT (4064) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4068",
    code2: "4065",
    type: "component_of",
    reason:
      "LFT panel (4068) includes AST/SGOT (4065) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4068",
    code2: "4066",
    type: "component_of",
    reason:
      "LFT panel (4068) includes GGT/gamma-GT (4066) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4068",
    code2: "4067",
    type: "component_of",
    reason:
      "LFT panel (4068) includes alkaline phosphatase/ALP (4067) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4068",
    code2: "4069",
    type: "component_of",
    reason:
      "LFT panel (4068) includes total bilirubin (4069) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4068",
    code2: "4069B",
    type: "component_of",
    reason:
      "LFT panel (4068) includes direct/conjugated bilirubin (4069B) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4068",
    code2: "4046",
    type: "component_of",
    reason:
      "LFT panel (4068) includes serum albumin (4046) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4068",
    code2: "4047",
    type: "component_of",
    reason:
      "LFT panel (4068) includes total protein (4047) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. UREA & ELECTROLYTES / U&E (4042) — 7 rules
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "4042",
    code2: "4043",
    type: "component_of",
    reason:
      "U&E panel (4042) includes urea/BUN (4043) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4042",
    code2: "4044",
    type: "component_of",
    reason:
      "U&E panel (4042) includes serum creatinine (4044) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4042",
    code2: "4045A",
    type: "component_of",
    reason:
      "U&E panel (4042) includes sodium (4045A) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4042",
    code2: "4045B",
    type: "component_of",
    reason:
      "U&E panel (4042) includes potassium (4045B) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4042",
    code2: "4045C",
    type: "component_of",
    reason:
      "U&E panel (4042) includes chloride (4045C) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4042",
    code2: "4045D",
    type: "component_of",
    reason:
      "U&E panel (4042) includes CO2/bicarbonate (4045D) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4042",
    code2: "4044E",
    type: "component_of",
    reason:
      "U&E panel (4042) includes creatinine from which eGFR is calculated — do not bill eGFR (4044E) separately as it is a derived value.",
    source: "CCSA v11 pathology bundling; BHF coding standards",
    category: "pathology_panel",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5. THYROID FUNCTION (4070) — 5 rules
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "4070",
    code2: "4070A",
    type: "component_of",
    reason:
      "Thyroid function panel (4070) includes TSH (4070A) — bill the panel, not TSH separately. If only TSH was ordered, bill 4070A alone.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4070",
    code2: "4071",
    type: "component_of",
    reason:
      "Thyroid function panel (4070) includes free T4/fT4 (4071) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4070",
    code2: "4072",
    type: "component_of",
    reason:
      "Thyroid function panel (4070) includes free T3/fT3 (4072) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4070",
    code2: "4073",
    type: "component_of",
    reason:
      "Thyroid function panel (4070) includes total T4 (4073) — do not bill both. Total T4 is rarely indicated when fT4 is available.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4070",
    code2: "4074",
    type: "component_of",
    reason:
      "Thyroid function panel (4070) includes total T3 (4074) — do not bill both. Total T3 is rarely indicated when fT3 is available.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 6. BONE PROFILE / METABOLIC (4075) — 5 rules
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "4075",
    code2: "4076",
    type: "component_of",
    reason:
      "Bone profile panel (4075) includes serum calcium (4076) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4075",
    code2: "4077",
    type: "component_of",
    reason:
      "Bone profile panel (4075) includes serum phosphate (4077) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4075",
    code2: "4067",
    type: "component_of",
    reason:
      "Bone profile panel (4075) includes alkaline phosphatase/ALP (4067) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4075",
    code2: "4046",
    type: "component_of",
    reason:
      "Bone profile panel (4075) includes albumin (4046) for corrected calcium calculation — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4075",
    code2: "4078",
    type: "component_of",
    reason:
      "Bone profile panel (4075) includes serum magnesium (4078) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 7. IRON STUDIES (4030) — 4 rules
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "4030",
    code2: "4031",
    type: "component_of",
    reason:
      "Iron studies panel (4030) includes serum iron (4031) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4030",
    code2: "4032",
    type: "component_of",
    reason:
      "Iron studies panel (4030) includes ferritin (4032) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4030",
    code2: "4033",
    type: "component_of",
    reason:
      "Iron studies panel (4030) includes TIBC/transferrin (4033) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4030",
    code2: "4033B",
    type: "component_of",
    reason:
      "Iron studies panel (4030) includes transferrin saturation (4033B) calculated from serum iron and TIBC — do not bill separately.",
    source: "CCSA v11 pathology bundling; BHF coding standards",
    category: "pathology_panel",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 8. COAGULATION PANEL (4021) — 6 rules
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "4021",
    code2: "4022",
    type: "component_of",
    reason:
      "Coagulation panel (4021) includes INR (4022) — do not bill both. INR is derived from prothrombin time.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4021",
    code2: "4023",
    type: "component_of",
    reason:
      "Coagulation panel (4021) includes prothrombin time/PT (4023) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4021",
    code2: "4024",
    type: "component_of",
    reason:
      "Coagulation panel (4021) includes activated partial thromboplastin time/APTT (4024) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4021",
    code2: "4025",
    type: "component_of",
    reason:
      "Coagulation panel (4021) includes fibrinogen (4025) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4021",
    code2: "4026",
    type: "component_of",
    reason:
      "Coagulation panel (4021) includes D-dimer (4026) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4021",
    code2: "4027",
    type: "component_of",
    reason:
      "Coagulation panel (4021) includes bleeding time (4027) — do not bill both when ordered as part of the full coagulation screen.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 9. CARDIAC ENZYMES / MARKERS (4080) — 6 rules
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "4080",
    code2: "4081",
    type: "component_of",
    reason:
      "Cardiac marker panel (4080) includes troponin I or T (4081) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4080",
    code2: "4082",
    type: "component_of",
    reason:
      "Cardiac marker panel (4080) includes CK-MB (4082) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4080",
    code2: "4083",
    type: "component_of",
    reason:
      "Cardiac marker panel (4080) includes total CK/creatine kinase (4083) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4080",
    code2: "4084",
    type: "component_of",
    reason:
      "Cardiac marker panel (4080) includes BNP or NT-proBNP (4084) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4080",
    code2: "4085",
    type: "component_of",
    reason:
      "Cardiac marker panel (4080) includes myoglobin (4085) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4080",
    code2: "4086",
    type: "component_of",
    reason:
      "Cardiac marker panel (4080) includes LDH (4086) — do not bill both. LDH is a non-specific marker included in cardiac panels.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 10. DIABETES PANEL — 4 rules
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "4052",
    code2: "4050",
    type: "component_of",
    reason:
      "When HbA1c (4052) and fasting glucose (4050) are ordered together as a diabetes panel, bill the panel code — not individual components.",
    source: "CCSA v11 pathology bundling; scheme pathology rules",
    category: "pathology_panel",
  },
  {
    code1: "4052",
    code2: "4053",
    type: "component_of",
    reason:
      "When HbA1c (4052) and fructosamine (4053) are ordered on the same day, clinical justification is required — both measure glycaemic control over different periods and billing both may be rejected as redundant.",
    source: "BHF coding standards; scheme pathology rules",
    category: "pathology_panel",
  },
  {
    code1: "4050",
    code2: "4051",
    type: "mutually_exclusive",
    reason:
      "Fasting glucose (4050) and random glucose (4051) on the same day for the same patient — bill only the fasting specimen. A random glucose adds no clinical value when a fasting sample is available.",
    source: "CCSA v11 pathology bundling; BHF coding standards",
    category: "pathology_panel",
  },
  {
    code1: "4053",
    code2: "4050",
    type: "component_of",
    reason:
      "Fructosamine (4053) with fasting glucose (4050) on the same visit — when ordered as a diabetes monitoring panel, bill the composite panel code rather than individual tests.",
    source: "BHF coding standards; scheme pathology rules",
    category: "pathology_panel",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 11. HORMONE PANEL — FEMALE (4095) — 6 rules
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "4095",
    code2: "4096",
    type: "component_of",
    reason:
      "Female hormone panel (4095) includes estradiol/E2 (4096) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4095",
    code2: "4097",
    type: "component_of",
    reason:
      "Female hormone panel (4095) includes progesterone (4097) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4095",
    code2: "4098",
    type: "component_of",
    reason:
      "Female hormone panel (4095) includes luteinising hormone/LH (4098) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4095",
    code2: "4099",
    type: "component_of",
    reason:
      "Female hormone panel (4095) includes follicle-stimulating hormone/FSH (4099) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4095",
    code2: "4100",
    type: "component_of",
    reason:
      "Female hormone panel (4095) includes prolactin (4100) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4095",
    code2: "4101",
    type: "component_of",
    reason:
      "Female hormone panel (4095) includes sex hormone-binding globulin/SHBG (4101) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 12. HORMONE PANEL — MALE (4102) — 5 rules
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "4102",
    code2: "4103",
    type: "component_of",
    reason:
      "Male hormone panel (4102) includes total testosterone (4103) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4102",
    code2: "4104",
    type: "component_of",
    reason:
      "Male hormone panel (4102) includes free testosterone (4104) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4102",
    code2: "4098",
    type: "component_of",
    reason:
      "Male hormone panel (4102) includes luteinising hormone/LH (4098) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4102",
    code2: "4099",
    type: "component_of",
    reason:
      "Male hormone panel (4102) includes follicle-stimulating hormone/FSH (4099) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4102",
    code2: "4101",
    type: "component_of",
    reason:
      "Male hormone panel (4102) includes sex hormone-binding globulin/SHBG (4101) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 13. AUTOIMMUNE SCREEN (4110) — 7 rules
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "4110",
    code2: "4111",
    type: "component_of",
    reason:
      "Autoimmune screen (4110) includes ANA/antinuclear antibody (4111) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4110",
    code2: "4112",
    type: "component_of",
    reason:
      "Autoimmune screen (4110) includes anti-dsDNA antibody (4112) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4110",
    code2: "4113",
    type: "component_of",
    reason:
      "Autoimmune screen (4110) includes complement C3 (4113) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4110",
    code2: "4114",
    type: "component_of",
    reason:
      "Autoimmune screen (4110) includes complement C4 (4114) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4110",
    code2: "4115",
    type: "component_of",
    reason:
      "Autoimmune screen (4110) includes rheumatoid factor/RF (4115) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4110",
    code2: "4116",
    type: "component_of",
    reason:
      "Autoimmune screen (4110) includes anti-CCP antibody (4116) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4110",
    code2: "4117",
    type: "component_of",
    reason:
      "Autoimmune screen (4110) includes ESR/erythrocyte sedimentation rate (4117) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 14. TUMOUR MARKERS — 8 rules
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "4090",
    code2: "4091",
    type: "component_of",
    reason:
      "Total PSA (4090) and free PSA (4091) — when both ordered, bill as PSA panel. Free PSA ratio is only meaningful with total PSA and should not be billed as a standalone add-on without clinical indication.",
    source: "CCSA v11 pathology bundling; BHF coding standards",
    category: "pathology_panel",
  },
  {
    code1: "4091",
    code2: "4090",
    type: "component_of",
    reason:
      "Free PSA (4091) requires total PSA (4090) for the free/total ratio — if free PSA is ordered, total PSA is implicit and only one panel charge applies.",
    source: "CCSA v11 pathology bundling; BHF coding standards",
    category: "pathology_panel",
  },
  {
    code1: "4120",
    code2: "4121",
    type: "never_together",
    reason:
      "CEA (4120) and CA-125 (4121) are markers for different tumour types (colorectal vs ovarian). Ordering both simultaneously without specific clinical indication may be rejected as a shotgun panel.",
    source: "BHF coding standards; scheme pathology rules",
    category: "pathology_panel",
  },
  {
    code1: "4121",
    code2: "4122",
    type: "component_of",
    reason:
      "CA-125 (4121) and HE4 (4122) together constitute the ROMA (Risk of Ovarian Malignancy Algorithm) panel — bill as ROMA panel, not individual markers.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4123",
    code2: "4124",
    type: "component_of",
    reason:
      "AFP (4123) and beta-HCG (4124) together constitute the germ cell tumour panel — bill as panel, not individual markers.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4125",
    code2: "4126",
    type: "never_together",
    reason:
      "CA 15-3 (4125) is a breast marker and CA 19-9 (4126) is a pancreatic/GI marker. Ordering both without specific clinical indication for dual-site malignancy may be rejected as non-specific screening.",
    source: "BHF coding standards; scheme pathology rules",
    category: "pathology_panel",
  },
  {
    code1: "4090",
    code2: "4120",
    type: "never_together",
    reason:
      "PSA (4090) and CEA (4120) are site-specific tumour markers (prostate vs colorectal). Billing both without dual-site clinical indication may trigger rejection as unfocused screening.",
    source: "BHF coding standards; scheme pathology rules",
    category: "pathology_panel",
  },
  {
    code1: "4123",
    code2: "4121",
    type: "never_together",
    reason:
      "AFP (4123) and CA-125 (4121) target different tumour types (liver/germ cell vs ovarian). Billing both without specific dual-site indication may be rejected.",
    source: "BHF coding standards; scheme pathology rules",
    category: "pathology_panel",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 15. URINE ANALYSIS — 6 rules
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "4132",
    code2: "4131",
    type: "component_of",
    reason:
      "Urine MCS/microscopy, culture & sensitivity (4132) includes dipstick analysis (4131) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4134",
    code2: "4133",
    type: "component_of",
    reason:
      "Urine albumin-creatinine ratio/ACR (4134) supersedes spot urine protein (4133) — ACR is more specific for early nephropathy detection and billing both is redundant.",
    source: "CCSA v11 pathology bundling; BHF coding standards",
    category: "pathology_panel",
  },
  {
    code1: "4135",
    code2: "4136",
    type: "component_of",
    reason:
      "24-hour urine panel (4135) includes spot urine collection results (4136) — do not bill a spot collection on the same day as a 24-hour collection for the same analyte.",
    source: "CCSA v11 pathology bundling; scheme pathology rules",
    category: "pathology_panel",
  },
  {
    code1: "4132",
    code2: "4133",
    type: "component_of",
    reason:
      "Urine MCS (4132) often includes protein assessment — do not bill urine protein (4133) separately if already part of the MCS request.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4135",
    code2: "4134",
    type: "component_of",
    reason:
      "24-hour urine protein panel (4135) provides total protein quantification, making a spot ACR (4134) on the same day redundant — bill one collection method only.",
    source: "BHF coding standards; scheme pathology rules",
    category: "pathology_panel",
  },
  {
    code1: "4131",
    code2: "4133",
    type: "component_of",
    reason:
      "Urine dipstick (4131) includes a protein pad — do not bill urine protein (4133) separately unless quantitative measurement was specifically requested and performed.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 16. BLOOD GAS / ABG (4140) — 7 rules
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "4140",
    code2: "4141",
    type: "component_of",
    reason:
      "ABG panel (4140) includes pH measurement (4141) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4140",
    code2: "4142",
    type: "component_of",
    reason:
      "ABG panel (4140) includes partial pressure of CO2/pCO2 (4142) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4140",
    code2: "4143",
    type: "component_of",
    reason:
      "ABG panel (4140) includes partial pressure of O2/pO2 (4143) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4140",
    code2: "4144",
    type: "component_of",
    reason:
      "ABG panel (4140) includes bicarbonate/HCO3 (4144) — do not bill both. Bicarbonate is calculated from pH and pCO2.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4140",
    code2: "4145",
    type: "component_of",
    reason:
      "ABG panel (4140) includes base excess (4145) — do not bill both. Base excess is a derived value from the blood gas analysis.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4140",
    code2: "4146",
    type: "component_of",
    reason:
      "ABG panel (4140) includes lactate (4146) when measured on the blood gas analyser — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4140",
    code2: "4045",
    type: "component_of",
    reason:
      "ABG panel (4140) includes electrolytes (sodium, potassium, chloride) (4045) when measured on the blood gas analyser — do not bill U&E electrolytes separately if already reported on ABG.",
    source: "CCSA v11 pathology bundling; BHF coding standards",
    category: "pathology_panel",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 17. CSF ANALYSIS (4150) — 4 rules
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "4150",
    code2: "4151",
    type: "component_of",
    reason:
      "CSF analysis panel (4150) includes CSF protein (4151) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4150",
    code2: "4152",
    type: "component_of",
    reason:
      "CSF analysis panel (4150) includes CSF glucose (4152) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4150",
    code2: "4153",
    type: "component_of",
    reason:
      "CSF analysis panel (4150) includes CSF cell count and differential (4153) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4150",
    code2: "4154",
    type: "component_of",
    reason:
      "CSF analysis panel (4150) includes CSF culture (4154) when ordered as a full CSF workup — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 18. SEMEN ANALYSIS (4160) — 3 rules
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "4160",
    code2: "4161",
    type: "component_of",
    reason:
      "Semen analysis (4160) includes sperm count/concentration (4161) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4160",
    code2: "4162",
    type: "component_of",
    reason:
      "Semen analysis (4160) includes motility assessment (4162) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4160",
    code2: "4163",
    type: "component_of",
    reason:
      "Semen analysis (4160) includes morphology assessment (4163) per WHO strict criteria — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 19. HEPATITIS SCREEN (4200) — 5 rules
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "4200",
    code2: "4201",
    type: "component_of",
    reason:
      "Hepatitis B screen panel (4200) includes HBsAg/hepatitis B surface antigen (4201) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4200",
    code2: "4202",
    type: "component_of",
    reason:
      "Hepatitis B screen panel (4200) includes anti-HBs/hepatitis B surface antibody (4202) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4200",
    code2: "4203",
    type: "component_of",
    reason:
      "Hepatitis B screen panel (4200) includes anti-HBc/hepatitis B core antibody (4203) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4200",
    code2: "4204",
    type: "component_of",
    reason:
      "Hepatitis B screen panel (4200) includes HBeAg/hepatitis B e-antigen (4204) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4200",
    code2: "4205",
    type: "component_of",
    reason:
      "Hepatitis screen panel (4200) includes anti-HCV/hepatitis C antibody (4205) when ordered as a combined hepatitis screen — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 20. HIV-RELATED PANELS — 4 rules
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "4210",
    code2: "4210B",
    type: "component_of",
    reason:
      "CD4 count (4210) includes CD4 percentage (4210B) — the percentage is derived from the same flow cytometry run and should not be billed separately.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4211",
    code2: "4212",
    type: "never_together",
    reason:
      "HIV viral load (4211) and HIV genotype/resistance testing (4212) serve different clinical purposes — viral load for monitoring, genotype for resistance. However, if both ordered on the same specimen, specific billing rules apply: genotype includes a viral load measurement, so do not bill both from the same sample.",
    source: "CCSA v11 pathology bundling; BHF coding standards",
    category: "pathology_panel",
  },
  {
    code1: "4213",
    code2: "4214",
    type: "mutually_exclusive",
    reason:
      "HIV rapid test (4213) and HIV ELISA (4214) on the same day for the same patient — do not bill both. Use rapid for screening and ELISA for confirmation, not both simultaneously.",
    source: "BHF coding standards; scheme pathology rules",
    category: "pathology_panel",
  },
  {
    code1: "4210",
    code2: "4211",
    type: "never_together",
    reason:
      "CD4 count (4210) and HIV viral load (4211) may both be clinically indicated but schemes require motivation when ordered on the same day — CD4 is for baseline/monitoring, viral load for treatment response. Same-day billing requires clinical justification.",
    source: "BHF coding standards; scheme pathology rules",
    category: "pathology_panel",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 21. ALLERGY PANEL (4220) — 5 rules
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "4220",
    code2: "4221",
    type: "component_of",
    reason:
      "Allergy panel (4220) includes total IgE (4221) — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4220",
    code2: "4222",
    type: "component_of",
    reason:
      "Allergy panel (4220) includes specific IgE for food allergens (4222) — do not bill individual food allergen IgE when a full panel was ordered.",
    source: "CCSA v11 pathology bundling; BHF coding standards",
    category: "pathology_panel",
  },
  {
    code1: "4220",
    code2: "4223",
    type: "component_of",
    reason:
      "Allergy panel (4220) includes specific IgE for inhalant allergens (4223) — do not bill individual inhalant allergen IgE when a full panel was ordered.",
    source: "CCSA v11 pathology bundling; BHF coding standards",
    category: "pathology_panel",
  },
  {
    code1: "4220",
    code2: "4224",
    type: "component_of",
    reason:
      "Allergy panel (4220) includes specific IgE for environmental allergens (4224) — do not bill individual environmental allergen IgE tests when a full panel was ordered.",
    source: "CCSA v11 pathology bundling; BHF coding standards",
    category: "pathology_panel",
  },
  {
    code1: "4221",
    code2: "4222",
    type: "never_together",
    reason:
      "Total IgE (4221) and individual specific IgE (4222) — total IgE alone is non-diagnostic; billing total IgE alongside a specific IgE panel is redundant unless clinical motivation is provided for the total IgE.",
    source: "BHF coding standards; scheme pathology rules",
    category: "pathology_panel",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 22. DRUG LEVELS / TDM — 5 rules
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "4230",
    code2: "4231",
    type: "never_together",
    reason:
      "Lithium level (4230) and phenytoin level (4231) — if ordered as part of a comprehensive TDM panel, bill the panel code. Individual drug levels should not be unbundled from a TDM panel order.",
    source: "CCSA v11 pathology bundling; scheme pathology rules",
    category: "pathology_panel",
  },
  {
    code1: "4232",
    code2: "4233",
    type: "never_together",
    reason:
      "Valproate level (4232) and carbamazepine level (4233) — when both anti-epileptic drug levels are ordered together as a polytherapy monitoring panel, bill the epilepsy TDM panel code rather than individual drug levels.",
    source: "CCSA v11 pathology bundling; BHF coding standards",
    category: "pathology_panel",
  },
  {
    code1: "4236",
    code2: "4237",
    type: "never_together",
    reason:
      "Vancomycin level (4236) and gentamicin level (4237) — when both aminoglycoside/glycopeptide levels are ordered together as an antimicrobial TDM panel, bill the combined panel code rather than individual drug levels.",
    source: "CCSA v11 pathology bundling; BHF coding standards",
    category: "pathology_panel",
  },
  {
    code1: "4234",
    code2: "4235",
    type: "never_together",
    reason:
      "Theophylline level (4234) and digoxin level (4235) — these are unrelated drug classes. Billing both without clinical indication for monitoring both drugs simultaneously may be flagged as a non-specific TDM screen.",
    source: "BHF coding standards; scheme pathology rules",
    category: "pathology_panel",
  },
  {
    code1: "4230",
    code2: "4232",
    type: "never_together",
    reason:
      "Lithium level (4230) and valproate level (4232) — when ordered as part of a mood-stabiliser monitoring panel, bill as a combined psychiatric TDM panel rather than individual drug levels.",
    source: "CCSA v11 pathology bundling; scheme pathology rules",
    category: "pathology_panel",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 23. MICROBIOLOGY BUNDLING — 8 rules
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "4250",
    code2: "4251",
    type: "component_of",
    reason:
      "Blood culture (4250) includes aerobic culture bottle (4251) — do not bill both. Blood culture code covers the complete set.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4250",
    code2: "4252",
    type: "component_of",
    reason:
      "Blood culture (4250) includes anaerobic culture bottle (4252) — do not bill both. Blood culture code covers aerobic and anaerobic bottles as a set.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4251",
    code2: "4252",
    type: "component_of",
    reason:
      "Aerobic blood culture (4251) and anaerobic blood culture (4252) — when both bottles are drawn as a blood culture set, bill the combined blood culture code (4250), not individual bottles.",
    source: "CCSA v11 pathology bundling; BHF coding standards",
    category: "pathology_panel",
  },
  {
    code1: "4255",
    code2: "4256",
    type: "component_of",
    reason:
      "Wound swab MCS (4255) includes culture (4256) — microscopy, culture, and sensitivity is a single investigation. Do not bill culture separately.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4255",
    code2: "4257",
    type: "component_of",
    reason:
      "Wound swab MCS (4255) includes sensitivity/antibiogram (4257) — sensitivity testing is an integral part of MCS. Do not bill separately.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4260",
    code2: "4261",
    type: "component_of",
    reason:
      "Stool MCS (4260) includes culture for individual enteric organisms (4261) — do not bill Salmonella, Shigella, Campylobacter cultures separately when a full stool MCS was ordered.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4260",
    code2: "4262",
    type: "component_of",
    reason:
      "Stool MCS (4260) includes ova, cysts, and parasites examination (4262) when ordered as part of the full stool workup — do not bill both.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4265",
    code2: "4266",
    type: "mutually_exclusive",
    reason:
      "Group A strep rapid antigen test (4265) and throat swab culture (4266) on the same visit — rapid test is for immediate diagnosis; culture is for confirmation if rapid is negative. Do not bill both if the rapid test is positive.",
    source: "BHF coding standards; scheme pathology rules",
    category: "pathology_panel",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 24. HISTOLOGY / CYTOLOGY — 4 rules
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "4270",
    code2: "4271",
    type: "mutually_exclusive",
    reason:
      "Conventional Pap smear (4270) and liquid-based cytology/LBC (4271) — these are alternative methods for cervical screening. Bill only one per visit.",
    source: "CCSA v11 pathology bundling; BHF coding standards",
    category: "pathology_panel",
  },
  {
    code1: "4275",
    code2: "4276",
    type: "component_of",
    reason:
      "Fine needle aspiration/FNA (4275) includes cytology preparation and interpretation (4276) — do not bill cytology separately as it is an integral part of FNA.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4280",
    code2: "4281",
    type: "mutually_exclusive",
    reason:
      "Frozen section (4280) and permanent section (4281) from the same specimen — frozen section is an intraoperative consultation. If a permanent section follows on the same specimen, do not bill both as independent investigations; the frozen section fee may be subsumed into the permanent section report.",
    source: "CCSA v11 pathology bundling; BHF coding standards",
    category: "pathology_panel",
  },
  {
    code1: "4270",
    code2: "4275",
    type: "never_together",
    reason:
      "Pap smear (4270) and FNA (4275) are different specimen types and procedures — billing both on the same visit requires clinical justification for separate anatomical sites.",
    source: "BHF coding standards; scheme pathology rules",
    category: "pathology_panel",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 25. CROSS-PANEL OVERLAP RULES — 20 rules
  // ─────────────────────────────────────────────────────────────────────────

  // ALP overlap: LFT + Bone Profile
  {
    code1: "4068",
    code2: "4075",
    type: "component_of",
    reason:
      "LFT (4068) and bone profile (4075) both include ALP (4067). When both panels are ordered, ALP must be billed only once — do not charge ALP in both panels. Deduct ALP from one panel or bill components individually.",
    source: "CCSA v11 pathology bundling; BHF cross-panel deduction rules",
    category: "pathology_panel",
  },
  {
    code1: "4067",
    code2: "4068",
    type: "component_of",
    reason:
      "ALP (4067) is a component of LFT (4068) — if LFT is ordered, standalone ALP is not separately billable.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4067",
    code2: "4075",
    type: "component_of",
    reason:
      "ALP (4067) is a component of bone profile (4075) — if bone profile is ordered, standalone ALP is not separately billable.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // Albumin overlap: LFT + Bone Profile
  {
    code1: "4046",
    code2: "4068",
    type: "component_of",
    reason:
      "Albumin (4046) is a component of LFT (4068) — if LFT is ordered, standalone albumin is not separately billable.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4046",
    code2: "4075",
    type: "component_of",
    reason:
      "Albumin (4046) is a component of bone profile (4075) — if bone profile is ordered, standalone albumin is not separately billable.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4046",
    code2: "4042",
    type: "never_together",
    reason:
      "Albumin (4046) billed alongside U&E (4042) — albumin is not a component of U&E but if ordered on the same specimen alongside LFT or bone profile, ensure it is only billed once across all panels.",
    source: "BHF coding standards; scheme pathology cross-panel rules",
    category: "pathology_panel",
  },

  // Creatinine overlap: U&E + eGFR
  {
    code1: "4044",
    code2: "4042",
    type: "component_of",
    reason:
      "Creatinine (4044) is a component of U&E (4042) — if U&E is ordered, standalone creatinine is not separately billable.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4044",
    code2: "4044E",
    type: "component_of",
    reason:
      "Creatinine (4044) is required for eGFR calculation (4044E) — eGFR is a derived value from creatinine and should not be billed in addition to a creatinine test.",
    source: "CCSA v11 pathology bundling; BHF coding standards",
    category: "pathology_panel",
  },

  // Sodium/Potassium overlap: U&E + ABG
  {
    code1: "4042",
    code2: "4140",
    type: "component_of",
    reason:
      "U&E (4042) and ABG (4140) both measure sodium and potassium. When both panels are ordered, electrolytes should be billed only once. ABG electrolytes are point-of-care; laboratory U&E is definitive — do not double-bill Na/K.",
    source: "CCSA v11 pathology bundling; BHF cross-panel deduction rules",
    category: "pathology_panel",
  },
  {
    code1: "4045A",
    code2: "4140",
    type: "component_of",
    reason:
      "Sodium (4045A) is measured in both U&E and ABG (4140) panels. When ABG is ordered and includes electrolytes, do not bill sodium separately or in U&E — deduct the overlap.",
    source: "CCSA v11 pathology bundling; BHF cross-panel deduction rules",
    category: "pathology_panel",
  },
  {
    code1: "4045B",
    code2: "4140",
    type: "component_of",
    reason:
      "Potassium (4045B) is measured in both U&E and ABG (4140) panels. When ABG is ordered and includes electrolytes, do not bill potassium separately or in U&E — deduct the overlap.",
    source: "CCSA v11 pathology bundling; BHF cross-panel deduction rules",
    category: "pathology_panel",
  },

  // Glucose overlap: Diabetes + Metabolic
  {
    code1: "4050",
    code2: "4042",
    type: "never_together",
    reason:
      "Fasting glucose (4050) billed alongside U&E (4042) — glucose is not a standard U&E component. If a metabolic panel including glucose and U&E is ordered, bill the comprehensive metabolic panel code, not individual components.",
    source: "BHF coding standards; scheme pathology rules",
    category: "pathology_panel",
  },
  {
    code1: "4050",
    code2: "4140",
    type: "component_of",
    reason:
      "Fasting glucose (4050) — ABG (4140) includes glucose on most modern blood gas analysers. If glucose is already reported on ABG, do not bill a separate fasting glucose from the same specimen.",
    source: "CCSA v11 pathology bundling; BHF cross-panel deduction rules",
    category: "pathology_panel",
  },

  // ESR overlap: Autoimmune + FBC workup
  {
    code1: "4117",
    code2: "4014",
    type: "never_together",
    reason:
      "ESR (4117) and FBC (4014) — ESR is not part of FBC but is often ordered alongside it. If an autoimmune screen (4110) is also ordered and includes ESR, do not bill ESR twice.",
    source: "BHF coding standards; scheme pathology cross-panel rules",
    category: "pathology_panel",
  },
  {
    code1: "4117",
    code2: "4110",
    type: "component_of",
    reason:
      "ESR (4117) is a component of the autoimmune screen (4110). If the autoimmune screen is ordered, ESR should not be billed separately.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // LDH overlap: Cardiac markers + LFT
  {
    code1: "4086",
    code2: "4080",
    type: "component_of",
    reason:
      "LDH (4086) is a component of cardiac marker panel (4080). If the cardiac panel is ordered, do not bill LDH separately.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4086",
    code2: "4068",
    type: "never_together",
    reason:
      "LDH (4086) is not a standard LFT component but is sometimes ordered alongside LFT. If a cardiac marker panel (4080) is also ordered and includes LDH, do not bill LDH twice.",
    source: "BHF coding standards; scheme pathology cross-panel rules",
    category: "pathology_panel",
  },

  // Bicarbonate overlap: U&E + ABG
  {
    code1: "4045D",
    code2: "4140",
    type: "component_of",
    reason:
      "CO2/bicarbonate (4045D) appears in both U&E (4042) and ABG (4140). When both panels are ordered, bicarbonate must be billed only once — ABG-derived HCO3 and venous CO2 are from different specimens but do not double-bill for the same analyte.",
    source: "CCSA v11 pathology bundling; BHF cross-panel deduction rules",
    category: "pathology_panel",
  },

  // LH/FSH overlap: Female + Male hormone panels
  {
    code1: "4095",
    code2: "4102",
    type: "mutually_exclusive",
    reason:
      "Female hormone panel (4095) and male hormone panel (4102) both include LH (4098) and FSH (4099). These panels are gender-specific — do not order both for the same patient. If LH and FSH are needed without a full panel, bill individually.",
    source: "BHF coding standards; scheme pathology rules",
    category: "pathology_panel",
  },

  // Total protein overlap: LFT panel
  {
    code1: "4047",
    code2: "4068",
    type: "component_of",
    reason:
      "Total protein (4047) is a component of LFT (4068). If LFT is ordered, standalone total protein is not separately billable.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // Chloride overlap: U&E + ABG
  {
    code1: "4045C",
    code2: "4140",
    type: "component_of",
    reason:
      "Chloride (4045C) is measured in both U&E and ABG (4140) panels. When ABG includes electrolytes, do not bill chloride separately — deduct the overlap.",
    source: "CCSA v11 pathology bundling; BHF cross-panel deduction rules",
    category: "pathology_panel",
  },

  // Calcium overlap: Bone profile + ABG
  {
    code1: "4076",
    code2: "4140",
    type: "component_of",
    reason:
      "Ionised calcium is measured on modern blood gas analysers (4140). If bone profile (4075) is also ordered with serum calcium (4076), the ABG calcium should not generate an additional charge.",
    source: "CCSA v11 pathology bundling; BHF cross-panel deduction rules",
    category: "pathology_panel",
  },

  // Urea overlap: U&E standalone
  {
    code1: "4043",
    code2: "4042",
    type: "component_of",
    reason:
      "Urea (4043) is a component of U&E (4042). If U&E is ordered, standalone urea is not separately billable.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 26. ADDITIONAL INTRA-PANEL COMPONENT RULES
  // ─────────────────────────────────────────────────────────────────────────

  // INR derived from PT
  {
    code1: "4022",
    code2: "4023",
    type: "component_of",
    reason:
      "INR (4022) is mathematically derived from prothrombin time (4023). Do not bill both — INR is a calculated ratio, not a separate test.",
    source: "CCSA v11 pathology bundling; BHF coding standards",
    category: "pathology_panel",
  },

  // CK-MB vs total CK
  {
    code1: "4082",
    code2: "4083",
    type: "component_of",
    reason:
      "CK-MB (4082) is an isoenzyme fraction of total CK (4083). When both are ordered, bill the cardiac panel (4080) — do not bill CK-MB and total CK as separate tests alongside the panel.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // TSH reflex testing
  {
    code1: "4070A",
    code2: "4071",
    type: "component_of",
    reason:
      "TSH (4070A) with reflex free T4 (4071) — when the lab reflexes to fT4 based on abnormal TSH, bill the thyroid panel (4070), not TSH + fT4 individually.",
    source: "CCSA v11 pathology bundling; NHLS reflex testing protocols",
    category: "pathology_panel",
  },
  {
    code1: "4070A",
    code2: "4072",
    type: "component_of",
    reason:
      "TSH (4070A) with reflex free T3 (4072) — when the lab reflexes to fT3 based on abnormal TSH and fT4, bill the thyroid panel (4070), not individual components.",
    source: "CCSA v11 pathology bundling; NHLS reflex testing protocols",
    category: "pathology_panel",
  },

  // Total T4 vs Free T4
  {
    code1: "4073",
    code2: "4071",
    type: "mutually_exclusive",
    reason:
      "Total T4 (4073) and free T4 (4071) — free T4 is preferred as it is unaffected by binding protein changes. Billing both is clinically redundant unless specific protein-binding disorder is suspected.",
    source: "BHF coding standards; scheme pathology rules",
    category: "pathology_panel",
  },

  // Total T3 vs Free T3
  {
    code1: "4074",
    code2: "4072",
    type: "mutually_exclusive",
    reason:
      "Total T3 (4074) and free T3 (4072) — free T3 is preferred. Billing both is clinically redundant in most clinical scenarios.",
    source: "BHF coding standards; scheme pathology rules",
    category: "pathology_panel",
  },

  // Direct bilirubin requires total bilirubin
  {
    code1: "4069B",
    code2: "4069",
    type: "component_of",
    reason:
      "Direct bilirubin (4069B) is only meaningful with total bilirubin (4069) — if LFT (4068) is ordered, both are included. Do not bill direct bilirubin separately alongside LFT.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // Allergy additional allergen groups
  {
    code1: "4220",
    code2: "4225",
    type: "component_of",
    reason:
      "Allergy panel (4220) includes specific IgE for insect venom allergens (4225) — do not bill individual venom allergen IgE tests when a full panel was ordered.",
    source: "CCSA v11 pathology bundling; BHF coding standards",
    category: "pathology_panel",
  },
  {
    code1: "4220",
    code2: "4226",
    type: "component_of",
    reason:
      "Allergy panel (4220) includes specific IgE for drug allergens (4226) — do not bill individual drug allergen IgE tests when a full panel was ordered.",
    source: "CCSA v11 pathology bundling; BHF coding standards",
    category: "pathology_panel",
  },

  // Microbiology — additional MCS patterns
  {
    code1: "4255",
    code2: "4258",
    type: "component_of",
    reason:
      "Wound swab MCS (4255) includes Gram stain (4258) — microscopy with Gram stain is the first step of MCS. Do not bill Gram stain separately.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4260",
    code2: "4263",
    type: "component_of",
    reason:
      "Stool MCS (4260) includes C. difficile toxin testing (4263) when ordered as part of a comprehensive stool workup — do not bill separately.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // Urine MCS — sensitivity bundling
  {
    code1: "4132",
    code2: "4137",
    type: "component_of",
    reason:
      "Urine MCS (4132) includes urine culture and sensitivity (4137) — culture and sensitivity are integral components of the MCS workflow. Do not bill separately.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // Sputum MCS bundling
  {
    code1: "4267",
    code2: "4268",
    type: "component_of",
    reason:
      "Sputum MCS (4267) includes sputum culture (4268) — microscopy, culture, and sensitivity is a single investigation. Do not bill culture separately.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
  {
    code1: "4267",
    code2: "4269",
    type: "component_of",
    reason:
      "Sputum MCS (4267) includes sputum sensitivity/antibiogram (4269) — sensitivity testing is an integral part of MCS. Do not bill separately.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 27. REPEAT / SAME-DAY DUPLICATE RULES
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "4014",
    code2: "4014",
    type: "mutually_exclusive",
    reason:
      "Duplicate FBC (4014) on the same day — a second FBC requires clinical motivation (e.g., acute haemorrhage, post-transfusion check). Routine duplicate billing is rejected.",
    source: "BHF coding standards; scheme duplicate test rules",
    category: "pathology_panel",
  },
  {
    code1: "4042",
    code2: "4042",
    type: "mutually_exclusive",
    reason:
      "Duplicate U&E (4042) on the same day — a second U&E requires clinical motivation (e.g., post-fluid resuscitation, critical electrolyte monitoring). Routine duplicate billing is rejected.",
    source: "BHF coding standards; scheme duplicate test rules",
    category: "pathology_panel",
  },
  {
    code1: "4068",
    code2: "4068",
    type: "mutually_exclusive",
    reason:
      "Duplicate LFT (4068) on the same day — a repeat LFT within 24 hours requires clinical justification. Routine duplicate billing is rejected.",
    source: "BHF coding standards; scheme duplicate test rules",
    category: "pathology_panel",
  },
  {
    code1: "4059",
    code2: "4059",
    type: "mutually_exclusive",
    reason:
      "Duplicate lipogram (4059) on the same day — lipid levels do not change acutely. A repeat lipogram within 24 hours has no clinical utility and will be rejected.",
    source: "BHF coding standards; scheme duplicate test rules",
    category: "pathology_panel",
  },
  {
    code1: "4070",
    code2: "4070",
    type: "mutually_exclusive",
    reason:
      "Duplicate thyroid function (4070) on the same day — thyroid hormones do not change acutely. A repeat panel within 24 hours has no clinical utility and will be rejected.",
    source: "BHF coding standards; scheme duplicate test rules",
    category: "pathology_panel",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 28. ADDITIONAL CROSS-PANEL AND SUPPLEMENTARY RULES
  // ─────────────────────────────────────────────────────────────────────────

  // Magnesium overlap: Bone profile standalone
  {
    code1: "4078",
    code2: "4075",
    type: "component_of",
    reason:
      "Magnesium (4078) is a component of bone profile (4075). If bone profile is ordered, standalone magnesium is not separately billable.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // Phosphate overlap: Bone profile standalone
  {
    code1: "4077",
    code2: "4075",
    type: "component_of",
    reason:
      "Phosphate (4077) is a component of bone profile (4075). If bone profile is ordered, standalone phosphate is not separately billable.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // Calcium overlap: Bone profile standalone
  {
    code1: "4076",
    code2: "4075",
    type: "component_of",
    reason:
      "Calcium (4076) is a component of bone profile (4075). If bone profile is ordered, standalone calcium is not separately billable.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // Ferritin standalone when iron studies ordered
  {
    code1: "4032",
    code2: "4030",
    type: "component_of",
    reason:
      "Ferritin (4032) is a component of iron studies (4030). If the iron studies panel is ordered, standalone ferritin is not separately billable.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // HbA1c + glucose tolerance test
  {
    code1: "4052",
    code2: "4054",
    type: "never_together",
    reason:
      "HbA1c (4052) and oral glucose tolerance test/OGTT (4054) on the same day — HbA1c reflects 3-month average and OGTT is a dynamic test. Billing both on the same visit requires clinical justification as they serve different diagnostic purposes.",
    source: "BHF coding standards; scheme pathology rules",
    category: "pathology_panel",
  },

  // Tumour marker: PSA + free PSA ratio
  {
    code1: "4091",
    code2: "4091B",
    type: "component_of",
    reason:
      "Free PSA (4091) includes the free/total PSA ratio calculation (4091B) — the ratio is a derived value and should not be billed as a separate test.",
    source: "CCSA v11 pathology bundling; BHF coding standards",
    category: "pathology_panel",
  },

  // Hepatitis: HBV DNA + HBsAg
  {
    code1: "4201",
    code2: "4206",
    type: "never_together",
    reason:
      "HBsAg (4201) and HBV DNA viral load (4206) — HBsAg is a qualitative screen; HBV DNA is quantitative for treatment monitoring. Same-day billing requires motivation: viral load is typically ordered after positive HBsAg, not simultaneously.",
    source: "BHF coding standards; scheme pathology rules",
    category: "pathology_panel",
  },

  // Hepatitis: HCV Ab + HCV RNA
  {
    code1: "4205",
    code2: "4207",
    type: "never_together",
    reason:
      "Anti-HCV (4205) and HCV RNA viral load (4207) — antibody is for screening, RNA for confirmation and treatment monitoring. Same-day billing of both requires motivation: RNA is typically reflexed after positive antibody.",
    source: "BHF coding standards; scheme pathology rules",
    category: "pathology_panel",
  },

  // LH standalone when female panel ordered
  {
    code1: "4098",
    code2: "4095",
    type: "component_of",
    reason:
      "LH (4098) is a component of female hormone panel (4095). If the female panel is ordered, standalone LH is not separately billable.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // FSH standalone when female panel ordered
  {
    code1: "4099",
    code2: "4095",
    type: "component_of",
    reason:
      "FSH (4099) is a component of female hormone panel (4095). If the female panel is ordered, standalone FSH is not separately billable.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // LH standalone when male panel ordered
  {
    code1: "4098",
    code2: "4102",
    type: "component_of",
    reason:
      "LH (4098) is a component of male hormone panel (4102). If the male panel is ordered, standalone LH is not separately billable.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // FSH standalone when male panel ordered
  {
    code1: "4099",
    code2: "4102",
    type: "component_of",
    reason:
      "FSH (4099) is a component of male hormone panel (4102). If the male panel is ordered, standalone FSH is not separately billable.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // SHBG standalone when female panel ordered
  {
    code1: "4101",
    code2: "4095",
    type: "component_of",
    reason:
      "SHBG (4101) is a component of female hormone panel (4095). If the female panel is ordered, standalone SHBG is not separately billable.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // SHBG standalone when male panel ordered
  {
    code1: "4101",
    code2: "4102",
    type: "component_of",
    reason:
      "SHBG (4101) is a component of male hormone panel (4102). If the male panel is ordered, standalone SHBG is not separately billable.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // Lactate overlap: ABG + standalone
  {
    code1: "4146",
    code2: "4140",
    type: "component_of",
    reason:
      "Lactate (4146) is a component of ABG (4140) on modern analysers. If ABG is ordered and includes lactate, standalone lactate is not separately billable from the same specimen.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // Troponin serial testing
  {
    code1: "4081",
    code2: "4081",
    type: "mutually_exclusive",
    reason:
      "Serial troponin (4081) testing — while clinically appropriate at 0h and 3h intervals for ACS rule-out, schemes may reject more than 2 troponins within 24 hours without documented clinical protocol (e.g., HEART pathway).",
    source: "BHF coding standards; scheme pathology rules",
    category: "pathology_panel",
  },

  // D-dimer standalone vs coag panel
  {
    code1: "4026",
    code2: "4021",
    type: "component_of",
    reason:
      "D-dimer (4026) is a component of coagulation panel (4021). If the coag panel is ordered, standalone D-dimer is not separately billable.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // Fibrinogen standalone vs coag panel
  {
    code1: "4025",
    code2: "4021",
    type: "component_of",
    reason:
      "Fibrinogen (4025) is a component of coagulation panel (4021). If the coag panel is ordered, standalone fibrinogen is not separately billable.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // PT standalone vs coag panel
  {
    code1: "4023",
    code2: "4021",
    type: "component_of",
    reason:
      "PT/prothrombin time (4023) is a component of coagulation panel (4021). If the coag panel is ordered, standalone PT is not separately billable.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // APTT standalone vs coag panel
  {
    code1: "4024",
    code2: "4021",
    type: "component_of",
    reason:
      "APTT (4024) is a component of coagulation panel (4021). If the coag panel is ordered, standalone APTT is not separately billable.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // Serum iron standalone vs iron studies
  {
    code1: "4031",
    code2: "4030",
    type: "component_of",
    reason:
      "Serum iron (4031) is a component of iron studies (4030). If the iron studies panel is ordered, standalone serum iron is not separately billable.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // TIBC standalone vs iron studies
  {
    code1: "4033",
    code2: "4030",
    type: "component_of",
    reason:
      "TIBC/transferrin (4033) is a component of iron studies (4030). If the iron studies panel is ordered, standalone TIBC is not separately billable.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // ANA standalone vs autoimmune screen
  {
    code1: "4111",
    code2: "4110",
    type: "component_of",
    reason:
      "ANA (4111) is a component of autoimmune screen (4110). If the autoimmune screen is ordered, standalone ANA is not separately billable.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },

  // Complement C3 standalone vs autoimmune screen
  {
    code1: "4113",
    code2: "4110",
    type: "component_of",
    reason:
      "Complement C3 (4113) is a component of autoimmune screen (4110). If the autoimmune screen is ordered, standalone C3 is not separately billable.",
    source: "CCSA v11 pathology bundling; NHLS panel definitions",
    category: "pathology_panel",
  },
];
