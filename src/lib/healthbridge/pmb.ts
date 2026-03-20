// Prescribed Minimum Benefits (PMB) and Chronic Disease List (CDL)
// PMBs = 271 conditions that medical aids MUST cover regardless of benefit limits
// CDL = 26 chronic conditions with guaranteed treatment coverage

/** Common PMB ICD-10 codes — schemes MUST pay these */
export const PMB_ICD10_CODES: Record<string, string> = {
  // Emergency conditions (always PMB)
  "I21.9": "Acute myocardial infarction (heart attack)",
  "I63.9": "Cerebral infarction (stroke)",
  "I64": "Stroke, not specified",
  "J96.0": "Acute respiratory failure",
  "K35.8": "Acute appendicitis",
  "K80.0": "Gallstones with acute cholecystitis",
  "S72.0": "Fracture of neck of femur (hip fracture)",
  "S06.9": "Intracranial injury (head trauma)",
  "T78.2": "Anaphylactic shock",
  "O80": "Single spontaneous delivery (normal birth)",
  "O82": "Caesarean delivery",
  // Cancers (all in situ and malignant neoplasms are PMB)
  "C50.9": "Malignant neoplasm of breast",
  "C34.9": "Malignant neoplasm of bronchus/lung",
  "C18.9": "Malignant neoplasm of colon",
  "C61": "Malignant neoplasm of prostate",
  "C73": "Malignant neoplasm of thyroid",
  // HIV/AIDS
  "B20": "HIV disease (PMB — full ARV treatment covered)",
  "B24": "Unspecified HIV disease",
  // Maternity
  "Z34.0": "Supervision of normal first pregnancy",
  "Z34.9": "Supervision of normal pregnancy",
  "O00.9": "Ectopic pregnancy",
  "O03.9": "Spontaneous abortion",
  // Paediatric
  "P07.3": "Extreme prematurity",
  "Q21.0": "Ventricular septal defect",
  // Mental health (emergency)
  "F32.2": "Severe depressive episode without psychotic symptoms",
  "F20.0": "Paranoid schizophrenia",
  // Other common PMBs
  "E10.9": "Type 1 diabetes mellitus",
  "E11.9": "Type 2 diabetes mellitus",
  "I10": "Essential hypertension",
  "J45.9": "Asthma",
  "N18.5": "Chronic kidney disease stage 5",
  "M05.9": "Rheumatoid arthritis",
};

/** 26 Chronic Disease List (CDL) conditions — guaranteed chronic medication coverage */
export const CDL_CONDITIONS: {
  name: string;
  icdPrefix: string;
  formularyRequired: boolean;
}[] = [
  { name: "Addison's disease", icdPrefix: "E27.1", formularyRequired: true },
  { name: "Asthma", icdPrefix: "J45", formularyRequired: true },
  { name: "Bipolar mood disorder", icdPrefix: "F31", formularyRequired: true },
  { name: "Bronchiectasis", icdPrefix: "J47", formularyRequired: true },
  { name: "Cardiac failure", icdPrefix: "I50", formularyRequired: true },
  { name: "Cardiomyopathy", icdPrefix: "I42", formularyRequired: true },
  { name: "Chronic obstructive pulmonary disease (COPD)", icdPrefix: "J44", formularyRequired: true },
  { name: "Chronic renal disease", icdPrefix: "N18", formularyRequired: true },
  { name: "Coronary artery disease", icdPrefix: "I25", formularyRequired: true },
  { name: "Crohn's disease", icdPrefix: "K50", formularyRequired: true },
  { name: "Diabetes insipidus", icdPrefix: "E23.2", formularyRequired: true },
  { name: "Diabetes mellitus type 1", icdPrefix: "E10", formularyRequired: true },
  { name: "Diabetes mellitus type 2", icdPrefix: "E11", formularyRequired: true },
  { name: "Dysrhythmias", icdPrefix: "I49", formularyRequired: true },
  { name: "Epilepsy", icdPrefix: "G40", formularyRequired: true },
  { name: "Glaucoma", icdPrefix: "H40", formularyRequired: true },
  { name: "Haemophilia", icdPrefix: "D66", formularyRequired: false },
  { name: "HIV/AIDS", icdPrefix: "B20", formularyRequired: true },
  { name: "Hyperlipidaemia", icdPrefix: "E78", formularyRequired: true },
  { name: "Hypertension", icdPrefix: "I10", formularyRequired: true },
  { name: "Hypothyroidism", icdPrefix: "E03", formularyRequired: true },
  { name: "Multiple sclerosis", icdPrefix: "G35", formularyRequired: true },
  { name: "Parkinson's disease", icdPrefix: "G20", formularyRequired: true },
  { name: "Rheumatoid arthritis", icdPrefix: "M05", formularyRequired: true },
  { name: "Schizophrenia", icdPrefix: "F20", formularyRequired: true },
  { name: "Ulcerative colitis", icdPrefix: "K51", formularyRequired: true },
];

/** Check if an ICD-10 code is a PMB condition */
export function isPMBCondition(icd10: string): boolean {
  if (PMB_ICD10_CODES[icd10]) return true;
  // All malignant neoplasms (C00-C97) are PMBs
  if (/^C\d{2}/.test(icd10)) return true;
  // All injuries/trauma requiring emergency care are PMBs
  if (/^[ST]\d{2}/.test(icd10)) return true;
  // Maternity (O00-O99)
  if (/^O\d{2}/.test(icd10)) return true;
  return false;
}

/** Check if an ICD-10 code is a CDL condition */
export function isCDLCondition(icd10: string): { found: boolean; condition?: string } {
  const match = CDL_CONDITIONS.find((c) => icd10.startsWith(c.icdPrefix));
  return match ? { found: true, condition: match.name } : { found: false };
}

/** Get PMB/CDL status summary for claim display */
export function getPMBStatus(icd10Codes: string[]): {
  hasPMB: boolean;
  hasCDL: boolean;
  pmbConditions: string[];
  cdlConditions: string[];
  coverageNote: string;
} {
  const pmbConditions: string[] = [];
  const cdlConditions: string[] = [];

  for (const code of icd10Codes) {
    if (isPMBCondition(code)) {
      pmbConditions.push(`${code}: ${PMB_ICD10_CODES[code] || "PMB condition"}`);
    }
    const cdl = isCDLCondition(code);
    if (cdl.found) {
      cdlConditions.push(`${code}: ${cdl.condition}`);
    }
  }

  const hasPMB = pmbConditions.length > 0;
  const hasCDL = cdlConditions.length > 0;

  let coverageNote = "";
  if (hasPMB && hasCDL) {
    coverageNote = "PMB + CDL conditions detected — scheme MUST cover treatment and chronic medication regardless of benefit limits.";
  } else if (hasPMB) {
    coverageNote = "PMB condition detected — scheme MUST cover this treatment regardless of benefit limits. Ensure treatment matches PMB protocol.";
  } else if (hasCDL) {
    coverageNote = "CDL chronic condition detected — patient should have approved chronic authorization. Medication must be on formulary.";
  }

  return { hasPMB, hasCDL, pmbConditions, cdlConditions, coverageNote };
}
