/**
 * LOINC Code Registry — Top 50 codes used in South African primary care.
 *
 * Covers vitals, common laboratory panels, urinalysis, and SA-priority
 * clinical observations (HIV, CD4, TB, malaria).
 *
 * Reference: LOINC (Logical Observation Identifiers Names and Codes)
 * System URI: http://loinc.org
 */

export interface LOINCEntry {
  /** LOINC code (e.g. "85354-9") */
  code: string;
  /** Human-readable display name */
  display: string;
  /** Coding system URI */
  system: string;
  /** Typical unit of measurement */
  unit: string;
  /** Clinical category for grouping */
  category: "vitals" | "chemistry" | "hematology" | "endocrine" | "lipids" | "liver" | "renal" | "urinalysis" | "infectious" | "immunology" | "coagulation";
}

const LOINC_SYSTEM = "http://loinc.org";

/**
 * Top 50 LOINC codes for SA primary care, indexed by code.
 */
export const LOINC_CODES: Record<string, LOINCEntry> = {
  // ── Vitals ──
  "85354-9": { code: "85354-9", display: "Blood Pressure Panel", system: LOINC_SYSTEM, unit: "mmHg", category: "vitals" },
  "8480-6": { code: "8480-6", display: "Systolic Blood Pressure", system: LOINC_SYSTEM, unit: "mmHg", category: "vitals" },
  "8462-4": { code: "8462-4", display: "Diastolic Blood Pressure", system: LOINC_SYSTEM, unit: "mmHg", category: "vitals" },
  "8867-4": { code: "8867-4", display: "Heart Rate", system: LOINC_SYSTEM, unit: "/min", category: "vitals" },
  "8310-5": { code: "8310-5", display: "Body Temperature", system: LOINC_SYSTEM, unit: "Cel", category: "vitals" },
  "29463-7": { code: "29463-7", display: "Body Weight", system: LOINC_SYSTEM, unit: "kg", category: "vitals" },
  "8302-2": { code: "8302-2", display: "Body Height", system: LOINC_SYSTEM, unit: "cm", category: "vitals" },
  "39156-5": { code: "39156-5", display: "Body Mass Index (BMI)", system: LOINC_SYSTEM, unit: "kg/m2", category: "vitals" },
  "2708-6": { code: "2708-6", display: "Oxygen Saturation (SpO2)", system: LOINC_SYSTEM, unit: "%", category: "vitals" },
  "9279-1": { code: "9279-1", display: "Respiratory Rate", system: LOINC_SYSTEM, unit: "/min", category: "vitals" },

  // ── Chemistry / Glucose ──
  "2339-0": { code: "2339-0", display: "Glucose [Mass/volume] in Blood", system: LOINC_SYSTEM, unit: "mmol/L", category: "chemistry" },
  "4548-4": { code: "4548-4", display: "Hemoglobin A1c (HbA1c)", system: LOINC_SYSTEM, unit: "%", category: "endocrine" },

  // ── Lipid Panel ──
  "2093-3": { code: "2093-3", display: "Total Cholesterol", system: LOINC_SYSTEM, unit: "mmol/L", category: "lipids" },
  "2085-9": { code: "2085-9", display: "HDL Cholesterol", system: LOINC_SYSTEM, unit: "mmol/L", category: "lipids" },
  "13457-7": { code: "13457-7", display: "LDL Cholesterol (Calculated)", system: LOINC_SYSTEM, unit: "mmol/L", category: "lipids" },
  "2571-8": { code: "2571-8", display: "Triglycerides", system: LOINC_SYSTEM, unit: "mmol/L", category: "lipids" },

  // ── Renal Function ──
  "2160-0": { code: "2160-0", display: "Creatinine [Mass/volume] in Serum", system: LOINC_SYSTEM, unit: "umol/L", category: "renal" },
  "33914-3": { code: "33914-3", display: "eGFR (CKD-EPI)", system: LOINC_SYSTEM, unit: "mL/min/1.73m2", category: "renal" },
  "3094-0": { code: "3094-0", display: "Urea Nitrogen (BUN)", system: LOINC_SYSTEM, unit: "mmol/L", category: "renal" },
  "2823-3": { code: "2823-3", display: "Potassium [Moles/volume] in Serum", system: LOINC_SYSTEM, unit: "mmol/L", category: "renal" },
  "2951-2": { code: "2951-2", display: "Sodium [Moles/volume] in Serum", system: LOINC_SYSTEM, unit: "mmol/L", category: "renal" },

  // ── Liver Function ──
  "1742-6": { code: "1742-6", display: "ALT (Alanine Aminotransferase)", system: LOINC_SYSTEM, unit: "U/L", category: "liver" },
  "1920-8": { code: "1920-8", display: "AST (Aspartate Aminotransferase)", system: LOINC_SYSTEM, unit: "U/L", category: "liver" },
  "1975-2": { code: "1975-2", display: "Total Bilirubin", system: LOINC_SYSTEM, unit: "umol/L", category: "liver" },
  "6768-6": { code: "6768-6", display: "Alkaline Phosphatase (ALP)", system: LOINC_SYSTEM, unit: "U/L", category: "liver" },
  "2336-6": { code: "2336-6", display: "GGT (Gamma-Glutamyl Transferase)", system: LOINC_SYSTEM, unit: "U/L", category: "liver" },
  "2885-2": { code: "2885-2", display: "Total Protein in Serum", system: LOINC_SYSTEM, unit: "g/L", category: "liver" },
  "1751-7": { code: "1751-7", display: "Albumin in Serum", system: LOINC_SYSTEM, unit: "g/L", category: "liver" },

  // ── Hematology (FBC) ──
  "718-7": { code: "718-7", display: "Hemoglobin [Mass/volume] in Blood", system: LOINC_SYSTEM, unit: "g/dL", category: "hematology" },
  "6690-2": { code: "6690-2", display: "White Blood Cell Count (WBC)", system: LOINC_SYSTEM, unit: "x10^9/L", category: "hematology" },
  "777-3": { code: "777-3", display: "Platelet Count", system: LOINC_SYSTEM, unit: "x10^9/L", category: "hematology" },
  "789-8": { code: "789-8", display: "Red Blood Cell Count (RBC)", system: LOINC_SYSTEM, unit: "x10^12/L", category: "hematology" },
  "4544-3": { code: "4544-3", display: "Hematocrit", system: LOINC_SYSTEM, unit: "%", category: "hematology" },
  "785-6": { code: "785-6", display: "Mean Corpuscular Volume (MCV)", system: LOINC_SYSTEM, unit: "fL", category: "hematology" },
  "786-4": { code: "786-4", display: "Mean Corpuscular Hemoglobin Concentration (MCHC)", system: LOINC_SYSTEM, unit: "g/dL", category: "hematology" },

  // ── Endocrine ──
  "3016-3": { code: "3016-3", display: "TSH (Thyroid Stimulating Hormone)", system: LOINC_SYSTEM, unit: "mIU/L", category: "endocrine" },
  "3026-2": { code: "3026-2", display: "Free T4 (Thyroxine)", system: LOINC_SYSTEM, unit: "pmol/L", category: "endocrine" },

  // ── Infectious Disease (SA Priority) ──
  "33660-2": { code: "33660-2", display: "HIV-1 p24 Antigen", system: LOINC_SYSTEM, unit: "", category: "infectious" },
  "24467-3": { code: "24467-3", display: "CD4 Count", system: LOINC_SYSTEM, unit: "cells/uL", category: "immunology" },
  "20447-9": { code: "20447-9", display: "HIV-1 RNA Viral Load", system: LOINC_SYSTEM, unit: "copies/mL", category: "infectious" },
  "6584-7": { code: "6584-7", display: "Malaria Smear (Thick/Thin Film)", system: LOINC_SYSTEM, unit: "", category: "infectious" },
  "71774-4": { code: "71774-4", display: "TB GeneXpert MTB/RIF", system: LOINC_SYSTEM, unit: "", category: "infectious" },

  // ── Urinalysis ──
  "2888-6": { code: "2888-6", display: "Protein [Presence] in Urine", system: LOINC_SYSTEM, unit: "", category: "urinalysis" },
  "2350-7": { code: "2350-7", display: "Glucose [Presence] in Urine", system: LOINC_SYSTEM, unit: "", category: "urinalysis" },
  "2756-5": { code: "2756-5", display: "pH of Urine", system: LOINC_SYSTEM, unit: "pH", category: "urinalysis" },
  "5811-5": { code: "5811-5", display: "Specific Gravity of Urine", system: LOINC_SYSTEM, unit: "", category: "urinalysis" },
  "5794-3": { code: "5794-3", display: "Blood [Presence] in Urine", system: LOINC_SYSTEM, unit: "", category: "urinalysis" },
  "5799-2": { code: "5799-2", display: "Leukocyte Esterase [Presence] in Urine", system: LOINC_SYSTEM, unit: "", category: "urinalysis" },
  "5802-4": { code: "5802-4", display: "Nitrite [Presence] in Urine", system: LOINC_SYSTEM, unit: "", category: "urinalysis" },

  // ── Coagulation ──
  "5902-2": { code: "5902-2", display: "Prothrombin Time (PT)", system: LOINC_SYSTEM, unit: "s", category: "coagulation" },
  "6301-6": { code: "6301-6", display: "INR (International Normalised Ratio)", system: LOINC_SYSTEM, unit: "", category: "coagulation" },

  // ── Inflammatory Markers ──
  "1988-5": { code: "1988-5", display: "C-Reactive Protein (CRP)", system: LOINC_SYSTEM, unit: "mg/L", category: "chemistry" },
};

/**
 * Look up a LOINC code and return its metadata.
 *
 * @param code - The LOINC code to look up (e.g. "85354-9")
 * @returns The LOINC entry or undefined if not found
 *
 * @example
 * ```ts
 * const bp = lookupLOINC("85354-9");
 * // { code: "85354-9", display: "Blood Pressure Panel", system: "http://loinc.org", unit: "mmHg" }
 * ```
 */
export function lookupLOINC(code: string): { code: string; display: string; system: string; unit: string } | undefined {
  const entry = LOINC_CODES[code];
  if (!entry) return undefined;
  return {
    code: entry.code,
    display: entry.display,
    system: entry.system,
    unit: entry.unit,
  };
}

/**
 * Get all LOINC codes for a given clinical category.
 */
export function getCodesByCategory(category: LOINCEntry["category"]): LOINCEntry[] {
  return Object.values(LOINC_CODES).filter((entry) => entry.category === category);
}

/**
 * Get all registered LOINC codes as an array.
 */
export function getAllCodes(): LOINCEntry[] {
  return Object.values(LOINC_CODES);
}
