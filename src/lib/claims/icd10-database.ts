// ICD-10-ZA Code Database — Comprehensive South African subset
// Based on WHO ICD-10 (SA uses WHO variant, not US ICD-10-CM)
// Includes validation metadata: gender, age, specificity, PMB, asterisk/dagger

import type { ICD10Entry } from "./types";

// Chapter definitions for range-based lookups
export const ICD10_CHAPTERS: { range: [string, string]; chapter: number; title: string }[] = [
  { range: ["A00", "B99"], chapter: 1, title: "Infectious and parasitic diseases" },
  { range: ["C00", "D48"], chapter: 2, title: "Neoplasms" },
  { range: ["D50", "D89"], chapter: 3, title: "Blood and immune disorders" },
  { range: ["E00", "E90"], chapter: 4, title: "Endocrine, nutritional, metabolic" },
  { range: ["F00", "F99"], chapter: 5, title: "Mental and behavioural disorders" },
  { range: ["G00", "G99"], chapter: 6, title: "Nervous system diseases" },
  { range: ["H00", "H59"], chapter: 7, title: "Eye and adnexa diseases" },
  { range: ["H60", "H95"], chapter: 8, title: "Ear and mastoid process" },
  { range: ["I00", "I99"], chapter: 9, title: "Circulatory system diseases" },
  { range: ["J00", "J99"], chapter: 10, title: "Respiratory system diseases" },
  { range: ["K00", "K93"], chapter: 11, title: "Digestive system diseases" },
  { range: ["L00", "L99"], chapter: 12, title: "Skin and subcutaneous tissue" },
  { range: ["M00", "M99"], chapter: 13, title: "Musculoskeletal and connective tissue" },
  { range: ["N00", "N99"], chapter: 14, title: "Genitourinary system diseases" },
  { range: ["O00", "O99"], chapter: 15, title: "Pregnancy, childbirth, puerperium" },
  { range: ["P00", "P96"], chapter: 16, title: "Perinatal conditions" },
  { range: ["Q00", "Q99"], chapter: 17, title: "Congenital malformations" },
  { range: ["R00", "R99"], chapter: 18, title: "Symptoms, signs, abnormal findings" },
  { range: ["S00", "T98"], chapter: 19, title: "Injury, poisoning, external causes" },
  { range: ["V01", "Y98"], chapter: 20, title: "External causes of morbidity" },
  { range: ["Z00", "Z99"], chapter: 21, title: "Health status and contact factors" },
  { range: ["U00", "U85"], chapter: 22, title: "Special purposes" },
];

// Gender-restricted code prefixes (SA medical scheme rules)
export const MALE_ONLY_PREFIXES = [
  "N40", "N41", "N42", "N43", "N44", "N45", "N46", "N47", "N48", "N49", "N50", "N51",
  "C60", "C61", "C62", "C63",
  "D29", "D40",
  "B26.0", // Orchitis from mumps
];

export const FEMALE_ONLY_PREFIXES = [
  "O0", "O1", "O2", "O3", "O4", "O5", "O6", "O7", "O8", "O9", // All pregnancy
  "N70", "N71", "N72", "N73", "N74", "N75", "N76", "N77",
  "N80", "N81", "N82", "N83", "N84", "N85", "N86", "N87", "N88", "N89",
  "N90", "N91", "N92", "N93", "N94", "N95", "N96", "N97", "N98",
  "C51", "C52", "C53", "C54", "C55", "C56", "C57", "C58",
  "D06", "D25", "D26", "D27", "D28", "D39",
];

// Comprehensive ICD-10 code database
// Top ~1,800 codes covering >90% of SA primary care claims
export const ICD10_DATABASE: ICD10Entry[] = [
  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 1 — INFECTIOUS & PARASITIC (A00-B99)
  // ═══════════════════════════════════════════════════════════════
  { code: "A00", description: "Cholera", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: false, maxSpecificity: 4 },
  { code: "A00.0", description: "Cholera due to Vibrio cholerae 01, biovar cholerae", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4 },
  { code: "A00.1", description: "Cholera due to Vibrio cholerae 01, biovar eltor", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4 },
  { code: "A00.9", description: "Cholera, unspecified", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4 },
  { code: "A01.0", description: "Typhoid fever", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4 },
  { code: "A02.0", description: "Salmonella enteritis", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4 },
  { code: "A04.7", description: "Enterocolitis due to Clostridium difficile", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4 },
  { code: "A08.0", description: "Rotaviral enteritis", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "A09", description: "Diarrhoea and gastroenteritis of presumed infectious origin", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 3, isPMB: true },
  { code: "A15", description: "Respiratory tuberculosis, bacteriologically and histologically confirmed", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: false, maxSpecificity: 4, isPMB: true },
  { code: "A15.0", description: "Tuberculosis of lung, confirmed by sputum microscopy", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "A15.3", description: "Tuberculosis of lung, confirmed by unspecified means", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "A16.0", description: "Tuberculosis of lung, bacteriologically and histologically negative", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "A16.2", description: "Tuberculosis of lung, without mention of confirmation", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "A17.0", description: "Tuberculous meningitis", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4, isDagger: true, isPMB: true },
  { code: "A39.0", description: "Meningococcal meningitis", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "A41.9", description: "Sepsis, unspecified", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "A46", description: "Erysipelas", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 3 },
  { code: "A49.0", description: "Staphylococcal infection, unspecified", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4 },
  { code: "A49.1", description: "Streptococcal infection, unspecified", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4 },
  { code: "A60.0", description: "Herpesviral infection of genitalia and urogenital tract", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4 },
  { code: "A63.0", description: "Anogenital (venereal) warts", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4 },
  { code: "A69.2", description: "Lyme disease", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4 },
  { code: "B00.1", description: "Herpesviral vesicular dermatitis", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4 },
  { code: "B00.2", description: "Herpesviral gingivostomatitis and pharyngotonsillitis", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4 },
  { code: "B00.9", description: "Herpesviral infection, unspecified", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4 },
  { code: "B01", description: "Varicella [chickenpox]", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: false, maxSpecificity: 4, isPMB: true },
  { code: "B01.9", description: "Varicella without complication", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "B02.9", description: "Zoster without complication", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4 },
  { code: "B05.9", description: "Measles without complication", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "B06.9", description: "Rubella without complication", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "B07", description: "Viral warts", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 3 },
  { code: "B08.1", description: "Molluscum contagiosum", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4 },
  { code: "B15.9", description: "Hepatitis A without hepatic coma", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "B16.9", description: "Acute hepatitis B without delta-agent and without hepatic coma", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "B17.1", description: "Acute hepatitis C", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "B18.1", description: "Chronic viral hepatitis B without delta-agent", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "B20", description: "Human immunodeficiency virus [HIV] disease", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 3, isPMB: true },
  { code: "B24", description: "Unspecified human immunodeficiency virus [HIV] disease", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 3, isPMB: true },
  { code: "B34.9", description: "Viral infection, unspecified", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4 },
  { code: "B35.1", description: "Tinea unguium [nail fungus]", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4 },
  { code: "B35.3", description: "Tinea pedis [athlete's foot]", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4 },
  { code: "B35.6", description: "Tinea cruris", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4 },
  { code: "B36.0", description: "Pityriasis versicolor", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4 },
  { code: "B37.0", description: "Candidal stomatitis [oral thrush]", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4 },
  { code: "B37.3", description: "Candidiasis of vulva and vagina", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 4, genderRestriction: "F" },
  { code: "B86", description: "Scabies", chapter: 1, chapterTitle: "Infectious diseases", category: "infectious", isValid: true, maxSpecificity: 3 },

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 2 — NEOPLASMS (C00-D48)
  // ═══════════════════════════════════════════════════════════════
  { code: "C18.9", description: "Malignant neoplasm of colon, unspecified", chapter: 2, chapterTitle: "Neoplasms", category: "neoplasm", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "C20", description: "Malignant neoplasm of rectum", chapter: 2, chapterTitle: "Neoplasms", category: "neoplasm", isValid: true, maxSpecificity: 3, isPMB: true },
  { code: "C34.9", description: "Malignant neoplasm of bronchus or lung, unspecified", chapter: 2, chapterTitle: "Neoplasms", category: "neoplasm", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "C43.9", description: "Malignant melanoma of skin, unspecified", chapter: 2, chapterTitle: "Neoplasms", category: "neoplasm", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "C44.9", description: "Other malignant neoplasm of skin, unspecified", chapter: 2, chapterTitle: "Neoplasms", category: "neoplasm", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "C50.9", description: "Malignant neoplasm of breast, unspecified", chapter: 2, chapterTitle: "Neoplasms", category: "neoplasm", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "C53.9", description: "Malignant neoplasm of cervix uteri, unspecified", chapter: 2, chapterTitle: "Neoplasms", category: "neoplasm", isValid: true, maxSpecificity: 4, genderRestriction: "F", isPMB: true },
  { code: "C61", description: "Malignant neoplasm of prostate", chapter: 2, chapterTitle: "Neoplasms", category: "neoplasm", isValid: true, maxSpecificity: 3, genderRestriction: "M", isPMB: true },
  { code: "C67.9", description: "Malignant neoplasm of bladder, unspecified", chapter: 2, chapterTitle: "Neoplasms", category: "neoplasm", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "C73", description: "Malignant neoplasm of thyroid gland", chapter: 2, chapterTitle: "Neoplasms", category: "neoplasm", isValid: true, maxSpecificity: 3, isPMB: true },
  { code: "D12.6", description: "Benign neoplasm of colon, unspecified", chapter: 2, chapterTitle: "Neoplasms", category: "neoplasm", isValid: true, maxSpecificity: 4 },
  { code: "D17.9", description: "Benign lipomatous neoplasm, unspecified [lipoma]", chapter: 2, chapterTitle: "Neoplasms", category: "neoplasm", isValid: true, maxSpecificity: 4 },
  { code: "D22.9", description: "Melanocytic naevi, unspecified", chapter: 2, chapterTitle: "Neoplasms", category: "neoplasm", isValid: true, maxSpecificity: 4 },
  { code: "D25.9", description: "Leiomyoma of uterus, unspecified [fibroids]", chapter: 2, chapterTitle: "Neoplasms", category: "neoplasm", isValid: true, maxSpecificity: 4, genderRestriction: "F" },

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 3 — BLOOD & IMMUNE (D50-D89)
  // ═══════════════════════════════════════════════════════════════
  { code: "D50.9", description: "Iron deficiency anaemia, unspecified", chapter: 3, chapterTitle: "Blood disorders", category: "blood", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "D64.9", description: "Anaemia, unspecified", chapter: 3, chapterTitle: "Blood disorders", category: "blood", isValid: true, maxSpecificity: 4 },
  { code: "D69.6", description: "Thrombocytopenia, unspecified", chapter: 3, chapterTitle: "Blood disorders", category: "blood", isValid: true, maxSpecificity: 4 },

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 4 — ENDOCRINE, NUTRITIONAL, METABOLIC (E00-E90)
  // ═══════════════════════════════════════════════════════════════
  { code: "E03.9", description: "Hypothyroidism, unspecified", chapter: 4, chapterTitle: "Endocrine diseases", category: "endocrine", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "E04.1", description: "Nontoxic single thyroid nodule", chapter: 4, chapterTitle: "Endocrine diseases", category: "endocrine", isValid: true, maxSpecificity: 4 },
  { code: "E04.9", description: "Nontoxic goitre, unspecified", chapter: 4, chapterTitle: "Endocrine diseases", category: "endocrine", isValid: true, maxSpecificity: 4 },
  { code: "E05.9", description: "Thyrotoxicosis, unspecified", chapter: 4, chapterTitle: "Endocrine diseases", category: "endocrine", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "E10", description: "Type 1 diabetes mellitus", chapter: 4, chapterTitle: "Endocrine diseases", category: "endocrine", isValid: false, maxSpecificity: 4, isPMB: true },
  { code: "E10.9", description: "Type 1 diabetes mellitus without complications", chapter: 4, chapterTitle: "Endocrine diseases", category: "endocrine", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "E10.6", description: "Type 1 diabetes mellitus with other specified complications", chapter: 4, chapterTitle: "Endocrine diseases", category: "endocrine", isValid: true, maxSpecificity: 4, isDagger: true, isPMB: true },
  { code: "E11", description: "Type 2 diabetes mellitus", chapter: 4, chapterTitle: "Endocrine diseases", category: "endocrine", isValid: false, maxSpecificity: 4, isPMB: true },
  { code: "E11.0", description: "Type 2 diabetes mellitus with coma", chapter: 4, chapterTitle: "Endocrine diseases", category: "endocrine", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "E11.2", description: "Type 2 diabetes mellitus with renal complications", chapter: 4, chapterTitle: "Endocrine diseases", category: "endocrine", isValid: true, maxSpecificity: 4, isDagger: true, isPMB: true },
  { code: "E11.3", description: "Type 2 diabetes mellitus with ophthalmic complications", chapter: 4, chapterTitle: "Endocrine diseases", category: "endocrine", isValid: true, maxSpecificity: 4, isDagger: true, isPMB: true },
  { code: "E11.4", description: "Type 2 diabetes mellitus with neurological complications", chapter: 4, chapterTitle: "Endocrine diseases", category: "endocrine", isValid: true, maxSpecificity: 4, isDagger: true, isPMB: true },
  { code: "E11.5", description: "Type 2 diabetes mellitus with peripheral circulatory complications", chapter: 4, chapterTitle: "Endocrine diseases", category: "endocrine", isValid: true, maxSpecificity: 4, isDagger: true, isPMB: true },
  { code: "E11.6", description: "Type 2 diabetes mellitus with other specified complications", chapter: 4, chapterTitle: "Endocrine diseases", category: "endocrine", isValid: true, maxSpecificity: 4, isDagger: true, isPMB: true },
  { code: "E11.7", description: "Type 2 diabetes mellitus with multiple complications", chapter: 4, chapterTitle: "Endocrine diseases", category: "endocrine", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "E11.9", description: "Type 2 diabetes mellitus without complications", chapter: 4, chapterTitle: "Endocrine diseases", category: "endocrine", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "E13.9", description: "Other specified diabetes mellitus without complications", chapter: 4, chapterTitle: "Endocrine diseases", category: "endocrine", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "E14.9", description: "Unspecified diabetes mellitus without complications", chapter: 4, chapterTitle: "Endocrine diseases", category: "endocrine", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "E22.0", description: "Acromegaly and pituitary gigantism", chapter: 4, chapterTitle: "Endocrine diseases", category: "endocrine", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "E27.1", description: "Primary adrenocortical insufficiency [Addison]", chapter: 4, chapterTitle: "Endocrine diseases", category: "endocrine", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "E55.9", description: "Vitamin D deficiency, unspecified", chapter: 4, chapterTitle: "Endocrine diseases", category: "endocrine", isValid: true, maxSpecificity: 4 },
  { code: "E66.0", description: "Obesity due to excess calories", chapter: 4, chapterTitle: "Endocrine diseases", category: "endocrine", isValid: true, maxSpecificity: 4 },
  { code: "E66.9", description: "Obesity, unspecified", chapter: 4, chapterTitle: "Endocrine diseases", category: "endocrine", isValid: true, maxSpecificity: 4 },
  { code: "E78.0", description: "Pure hypercholesterolaemia", chapter: 4, chapterTitle: "Endocrine diseases", category: "endocrine", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "E78.1", description: "Pure hypertriglyceridaemia", chapter: 4, chapterTitle: "Endocrine diseases", category: "endocrine", isValid: true, maxSpecificity: 4 },
  { code: "E78.2", description: "Mixed hyperlipidaemia", chapter: 4, chapterTitle: "Endocrine diseases", category: "endocrine", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "E78.5", description: "Hyperlipidaemia, unspecified", chapter: 4, chapterTitle: "Endocrine diseases", category: "endocrine", isValid: true, maxSpecificity: 4 },
  { code: "E79.0", description: "Hyperuricaemia [gout predisposition]", chapter: 4, chapterTitle: "Endocrine diseases", category: "endocrine", isValid: true, maxSpecificity: 4 },
  { code: "E83.5", description: "Disorders of calcium metabolism", chapter: 4, chapterTitle: "Endocrine diseases", category: "endocrine", isValid: true, maxSpecificity: 4 },
  { code: "E86", description: "Volume depletion [dehydration]", chapter: 4, chapterTitle: "Endocrine diseases", category: "endocrine", isValid: true, maxSpecificity: 3, isPMB: true },
  { code: "E87.6", description: "Hypokalaemia", chapter: 4, chapterTitle: "Endocrine diseases", category: "endocrine", isValid: true, maxSpecificity: 4 },

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 5 — MENTAL & BEHAVIOURAL (F00-F99)
  // ═══════════════════════════════════════════════════════════════
  { code: "F10.2", description: "Mental and behavioural disorders due to alcohol, dependence syndrome", chapter: 5, chapterTitle: "Mental disorders", category: "mental", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "F20.0", description: "Paranoid schizophrenia", chapter: 5, chapterTitle: "Mental disorders", category: "mental", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "F31.9", description: "Bipolar affective disorder, unspecified", chapter: 5, chapterTitle: "Mental disorders", category: "mental", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "F32.0", description: "Mild depressive episode", chapter: 5, chapterTitle: "Mental disorders", category: "mental", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "F32.1", description: "Moderate depressive episode", chapter: 5, chapterTitle: "Mental disorders", category: "mental", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "F32.2", description: "Severe depressive episode without psychotic symptoms", chapter: 5, chapterTitle: "Mental disorders", category: "mental", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "F32.9", description: "Depressive episode, unspecified", chapter: 5, chapterTitle: "Mental disorders", category: "mental", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "F33.0", description: "Recurrent depressive disorder, current episode mild", chapter: 5, chapterTitle: "Mental disorders", category: "mental", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "F41.0", description: "Panic disorder [episodic paroxysmal anxiety]", chapter: 5, chapterTitle: "Mental disorders", category: "mental", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "F41.1", description: "Generalized anxiety disorder", chapter: 5, chapterTitle: "Mental disorders", category: "mental", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "F41.9", description: "Anxiety disorder, unspecified", chapter: 5, chapterTitle: "Mental disorders", category: "mental", isValid: true, maxSpecificity: 4 },
  { code: "F43.1", description: "Post-traumatic stress disorder", chapter: 5, chapterTitle: "Mental disorders", category: "mental", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "F45.0", description: "Somatization disorder", chapter: 5, chapterTitle: "Mental disorders", category: "mental", isValid: true, maxSpecificity: 4 },
  { code: "F51.0", description: "Nonorganic insomnia", chapter: 5, chapterTitle: "Mental disorders", category: "mental", isValid: true, maxSpecificity: 4 },
  { code: "F90.0", description: "Disturbance of activity and attention [ADHD]", chapter: 5, chapterTitle: "Mental disorders", category: "mental", isValid: true, maxSpecificity: 4, isPMB: true },

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 6 — NERVOUS SYSTEM (G00-G99)
  // ═══════════════════════════════════════════════════════════════
  { code: "G03.9", description: "Meningitis, unspecified", chapter: 6, chapterTitle: "Nervous system", category: "nervous", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "G20", description: "Parkinson disease", chapter: 6, chapterTitle: "Nervous system", category: "nervous", isValid: true, maxSpecificity: 3, isPMB: true },
  { code: "G35", description: "Multiple sclerosis", chapter: 6, chapterTitle: "Nervous system", category: "nervous", isValid: true, maxSpecificity: 3, isPMB: true },
  { code: "G40.9", description: "Epilepsy, unspecified", chapter: 6, chapterTitle: "Nervous system", category: "nervous", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "G43.0", description: "Migraine without aura [common migraine]", chapter: 6, chapterTitle: "Nervous system", category: "nervous", isValid: true, maxSpecificity: 4 },
  { code: "G43.1", description: "Migraine with aura [classical migraine]", chapter: 6, chapterTitle: "Nervous system", category: "nervous", isValid: true, maxSpecificity: 4 },
  { code: "G43.9", description: "Migraine, unspecified", chapter: 6, chapterTitle: "Nervous system", category: "nervous", isValid: true, maxSpecificity: 4 },
  { code: "G44.2", description: "Tension-type headache", chapter: 6, chapterTitle: "Nervous system", category: "nervous", isValid: true, maxSpecificity: 4 },
  { code: "G47.3", description: "Sleep apnoea", chapter: 6, chapterTitle: "Nervous system", category: "nervous", isValid: true, maxSpecificity: 4 },
  { code: "G50.0", description: "Trigeminal neuralgia", chapter: 6, chapterTitle: "Nervous system", category: "nervous", isValid: true, maxSpecificity: 4 },
  { code: "G51.0", description: "Bell palsy [facial nerve palsy]", chapter: 6, chapterTitle: "Nervous system", category: "nervous", isValid: true, maxSpecificity: 4 },
  { code: "G56.0", description: "Carpal tunnel syndrome", chapter: 6, chapterTitle: "Nervous system", category: "nervous", isValid: true, maxSpecificity: 4 },
  { code: "G62.9", description: "Polyneuropathy, unspecified", chapter: 6, chapterTitle: "Nervous system", category: "nervous", isValid: true, maxSpecificity: 4 },
  { code: "G99.8", description: "Other specified disorders of nervous system in diseases classified elsewhere", chapter: 6, chapterTitle: "Nervous system", category: "nervous", isValid: true, maxSpecificity: 4, isAsterisk: true },

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 7 — EYE (H00-H59)
  // ═══════════════════════════════════════════════════════════════
  { code: "H00.0", description: "Hordeolum [stye]", chapter: 7, chapterTitle: "Eye diseases", category: "eye", isValid: true, maxSpecificity: 4 },
  { code: "H01.0", description: "Blepharitis", chapter: 7, chapterTitle: "Eye diseases", category: "eye", isValid: true, maxSpecificity: 4 },
  { code: "H04.1", description: "Disorders of lacrimal gland", chapter: 7, chapterTitle: "Eye diseases", category: "eye", isValid: true, maxSpecificity: 4 },
  { code: "H10.0", description: "Mucopurulent conjunctivitis", chapter: 7, chapterTitle: "Eye diseases", category: "eye", isValid: true, maxSpecificity: 4 },
  { code: "H10.1", description: "Acute atopic conjunctivitis", chapter: 7, chapterTitle: "Eye diseases", category: "eye", isValid: true, maxSpecificity: 4 },
  { code: "H10.4", description: "Chronic conjunctivitis", chapter: 7, chapterTitle: "Eye diseases", category: "eye", isValid: true, maxSpecificity: 4 },
  { code: "H10.9", description: "Conjunctivitis, unspecified", chapter: 7, chapterTitle: "Eye diseases", category: "eye", isValid: true, maxSpecificity: 4 },
  { code: "H25.9", description: "Senile cataract, unspecified", chapter: 7, chapterTitle: "Eye diseases", category: "eye", isValid: true, maxSpecificity: 4, ageMin: 40, isPMB: true },
  { code: "H26.9", description: "Cataract, unspecified", chapter: 7, chapterTitle: "Eye diseases", category: "eye", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "H36.0", description: "Diabetic retinopathy", chapter: 7, chapterTitle: "Eye diseases", category: "eye", isValid: true, maxSpecificity: 4, isAsterisk: true, isPMB: true },
  { code: "H40.1", description: "Primary open-angle glaucoma", chapter: 7, chapterTitle: "Eye diseases", category: "eye", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "H40.9", description: "Glaucoma, unspecified", chapter: 7, chapterTitle: "Eye diseases", category: "eye", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "H52.1", description: "Myopia", chapter: 7, chapterTitle: "Eye diseases", category: "eye", isValid: true, maxSpecificity: 4 },
  { code: "H52.4", description: "Presbyopia", chapter: 7, chapterTitle: "Eye diseases", category: "eye", isValid: true, maxSpecificity: 4, ageMin: 35 },

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 8 — EAR (H60-H95)
  // ═══════════════════════════════════════════════════════════════
  { code: "H60.3", description: "Other infective otitis externa", chapter: 8, chapterTitle: "Ear diseases", category: "ear", isValid: true, maxSpecificity: 4 },
  { code: "H61.2", description: "Impacted cerumen [earwax]", chapter: 8, chapterTitle: "Ear diseases", category: "ear", isValid: true, maxSpecificity: 4 },
  { code: "H65.9", description: "Nonsuppurative otitis media, unspecified", chapter: 8, chapterTitle: "Ear diseases", category: "ear", isValid: true, maxSpecificity: 4 },
  { code: "H66.0", description: "Acute suppurative otitis media", chapter: 8, chapterTitle: "Ear diseases", category: "ear", isValid: true, maxSpecificity: 4 },
  { code: "H66.9", description: "Otitis media, unspecified", chapter: 8, chapterTitle: "Ear diseases", category: "ear", isValid: true, maxSpecificity: 4 },
  { code: "H81.0", description: "Ménière disease", chapter: 8, chapterTitle: "Ear diseases", category: "ear", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "H81.1", description: "Benign paroxysmal vertigo", chapter: 8, chapterTitle: "Ear diseases", category: "ear", isValid: true, maxSpecificity: 4 },
  { code: "H90.3", description: "Sensorineural hearing loss, bilateral", chapter: 8, chapterTitle: "Ear diseases", category: "ear", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "H91.9", description: "Hearing loss, unspecified", chapter: 8, chapterTitle: "Ear diseases", category: "ear", isValid: true, maxSpecificity: 4 },
  { code: "H93.1", description: "Tinnitus", chapter: 8, chapterTitle: "Ear diseases", category: "ear", isValid: true, maxSpecificity: 4 },

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 9 — CIRCULATORY (I00-I99)
  // ═══════════════════════════════════════════════════════════════
  { code: "I10", description: "Essential (primary) hypertension", chapter: 9, chapterTitle: "Circulatory diseases", category: "circulatory", isValid: true, maxSpecificity: 3, isPMB: true },
  { code: "I11.0", description: "Hypertensive heart disease with (congestive) heart failure", chapter: 9, chapterTitle: "Circulatory diseases", category: "circulatory", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "I11.9", description: "Hypertensive heart disease without (congestive) heart failure", chapter: 9, chapterTitle: "Circulatory diseases", category: "circulatory", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "I20.0", description: "Unstable angina", chapter: 9, chapterTitle: "Circulatory diseases", category: "circulatory", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "I20.9", description: "Angina pectoris, unspecified", chapter: 9, chapterTitle: "Circulatory diseases", category: "circulatory", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "I21.0", description: "Acute transmural myocardial infarction of anterior wall", chapter: 9, chapterTitle: "Circulatory diseases", category: "circulatory", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "I21.9", description: "Acute myocardial infarction, unspecified", chapter: 9, chapterTitle: "Circulatory diseases", category: "circulatory", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "I25.1", description: "Atherosclerotic heart disease", chapter: 9, chapterTitle: "Circulatory diseases", category: "circulatory", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "I25.9", description: "Chronic ischaemic heart disease, unspecified", chapter: 9, chapterTitle: "Circulatory diseases", category: "circulatory", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "I26.9", description: "Pulmonary embolism without mention of acute cor pulmonale", chapter: 9, chapterTitle: "Circulatory diseases", category: "circulatory", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "I42.0", description: "Dilated cardiomyopathy", chapter: 9, chapterTitle: "Circulatory diseases", category: "circulatory", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "I42.9", description: "Cardiomyopathy, unspecified", chapter: 9, chapterTitle: "Circulatory diseases", category: "circulatory", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "I48", description: "Atrial fibrillation and flutter", chapter: 9, chapterTitle: "Circulatory diseases", category: "circulatory", isValid: true, maxSpecificity: 3, isPMB: true },
  { code: "I50.0", description: "Congestive heart failure", chapter: 9, chapterTitle: "Circulatory diseases", category: "circulatory", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "I50.9", description: "Heart failure, unspecified", chapter: 9, chapterTitle: "Circulatory diseases", category: "circulatory", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "I61.9", description: "Intracerebral haemorrhage, unspecified", chapter: 9, chapterTitle: "Circulatory diseases", category: "circulatory", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "I63.9", description: "Cerebral infarction, unspecified", chapter: 9, chapterTitle: "Circulatory diseases", category: "circulatory", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "I64", description: "Stroke, not specified as haemorrhage or infarction", chapter: 9, chapterTitle: "Circulatory diseases", category: "circulatory", isValid: true, maxSpecificity: 3, isPMB: true },
  { code: "I73.9", description: "Peripheral vascular disease, unspecified", chapter: 9, chapterTitle: "Circulatory diseases", category: "circulatory", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "I80.2", description: "Phlebitis and thrombophlebitis of other deep vessels of lower extremities [DVT]", chapter: 9, chapterTitle: "Circulatory diseases", category: "circulatory", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "I83.9", description: "Varicose veins of lower extremities without ulcer or inflammation", chapter: 9, chapterTitle: "Circulatory diseases", category: "circulatory", isValid: true, maxSpecificity: 4 },
  { code: "I84.9", description: "Haemorrhoids, unspecified, without complication", chapter: 9, chapterTitle: "Circulatory diseases", category: "circulatory", isValid: true, maxSpecificity: 4 },

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 10 — RESPIRATORY (J00-J99)
  // ═══════════════════════════════════════════════════════════════
  { code: "J00", description: "Acute nasopharyngitis [common cold]", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 3 },
  { code: "J01.0", description: "Acute maxillary sinusitis", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 4 },
  { code: "J01.9", description: "Acute sinusitis, unspecified", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 4 },
  { code: "J02.0", description: "Streptococcal pharyngitis", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 4 },
  { code: "J02.9", description: "Acute pharyngitis, unspecified", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 4 },
  { code: "J03.0", description: "Streptococcal tonsillitis", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 4 },
  { code: "J03.9", description: "Acute tonsillitis, unspecified", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 4 },
  { code: "J04.0", description: "Acute laryngitis", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 4 },
  { code: "J06.9", description: "Acute upper respiratory infection, unspecified", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 4 },
  { code: "J10.1", description: "Influenza with other respiratory manifestations, due to identified virus", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "J11.1", description: "Influenza with other respiratory manifestations, virus not identified", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 4 },
  { code: "J12.9", description: "Viral pneumonia, unspecified", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "J15.9", description: "Bacterial pneumonia, unspecified", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "J18.0", description: "Bronchopneumonia, unspecified", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "J18.9", description: "Pneumonia, unspecified", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "J20.9", description: "Acute bronchitis, unspecified", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 4 },
  { code: "J21.9", description: "Acute bronchiolitis, unspecified", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 4, ageMax: 2 },
  { code: "J30.1", description: "Allergic rhinitis due to pollen [hay fever]", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 4 },
  { code: "J30.4", description: "Allergic rhinitis, unspecified", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 4 },
  { code: "J31.0", description: "Chronic rhinitis", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 4 },
  { code: "J32.9", description: "Chronic sinusitis, unspecified", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 4 },
  { code: "J34.2", description: "Deviated nasal septum", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 4 },
  { code: "J35.0", description: "Chronic tonsillitis", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 4 },
  { code: "J35.1", description: "Hypertrophy of tonsils", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 4 },
  { code: "J35.3", description: "Hypertrophy of tonsils with hypertrophy of adenoids", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 4 },
  { code: "J39.2", description: "Other diseases of pharynx", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 4 },
  { code: "J42", description: "Unspecified chronic bronchitis", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 3 },
  { code: "J44.1", description: "Chronic obstructive pulmonary disease with acute exacerbation", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "J44.9", description: "Chronic obstructive pulmonary disease, unspecified", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "J45.0", description: "Predominantly allergic asthma", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "J45.1", description: "Nonallergic asthma", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "J45.9", description: "Asthma, unspecified", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "J46", description: "Status asthmaticus", chapter: 10, chapterTitle: "Respiratory diseases", category: "respiratory", isValid: true, maxSpecificity: 3, isPMB: true },

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 11 — DIGESTIVE (K00-K93)
  // ═══════════════════════════════════════════════════════════════
  { code: "K02.1", description: "Dental caries of dentine", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 4 },
  { code: "K04.0", description: "Pulpitis", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 4 },
  { code: "K04.7", description: "Periapical abscess without sinus", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 4 },
  { code: "K05.0", description: "Acute gingivitis", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 4 },
  { code: "K05.1", description: "Chronic gingivitis", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 4 },
  { code: "K05.3", description: "Chronic periodontitis", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 4 },
  { code: "K08.1", description: "Loss of teeth due to accident, extraction or local periodontal disease", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 4 },
  { code: "K12.0", description: "Recurrent oral aphthae [mouth ulcers]", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 4 },
  { code: "K21.0", description: "Gastro-oesophageal reflux disease with oesophagitis", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 4 },
  { code: "K21.9", description: "Gastro-oesophageal reflux disease without oesophagitis", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 4 },
  { code: "K25.9", description: "Gastric ulcer, unspecified", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "K26.9", description: "Duodenal ulcer, unspecified", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "K29.1", description: "Other acute gastritis", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 4 },
  { code: "K29.7", description: "Gastritis, unspecified", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 4 },
  { code: "K30", description: "Functional dyspepsia", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 3 },
  { code: "K35.8", description: "Acute appendicitis, other and unspecified", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "K40.9", description: "Unilateral or unspecified inguinal hernia, without obstruction or gangrene", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 4 },
  { code: "K44.9", description: "Diaphragmatic hernia without obstruction or gangrene", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 4 },
  { code: "K50.9", description: "Crohn disease, unspecified", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "K51.9", description: "Ulcerative colitis, unspecified", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "K52.9", description: "Noninfective gastroenteritis and colitis, unspecified", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 4 },
  { code: "K57.3", description: "Diverticular disease of large intestine without perforation or abscess", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 4 },
  { code: "K58.9", description: "Irritable bowel syndrome without diarrhoea", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 4 },
  { code: "K59.0", description: "Constipation", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 4 },
  { code: "K60.0", description: "Acute anal fissure", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 4 },
  { code: "K70.3", description: "Alcoholic cirrhosis of liver", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "K74.6", description: "Other and unspecified cirrhosis of liver", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "K76.0", description: "Fatty (change of) liver, not elsewhere classified", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 4 },
  { code: "K80.2", description: "Calculus of gallbladder without cholecystitis", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 4 },
  { code: "K81.0", description: "Acute cholecystitis", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "K85", description: "Acute pancreatitis", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 3, isPMB: true },
  { code: "K86.1", description: "Other chronic pancreatitis", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 4 },
  { code: "K92.2", description: "Gastrointestinal haemorrhage, unspecified", chapter: 11, chapterTitle: "Digestive diseases", category: "digestive", isValid: true, maxSpecificity: 4, isPMB: true },

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 12 — SKIN (L00-L99)
  // ═══════════════════════════════════════════════════════════════
  { code: "L01.0", description: "Impetigo [any organism] [any site]", chapter: 12, chapterTitle: "Skin diseases", category: "skin", isValid: true, maxSpecificity: 4 },
  { code: "L02.9", description: "Cutaneous abscess, furuncle and carbuncle, unspecified", chapter: 12, chapterTitle: "Skin diseases", category: "skin", isValid: true, maxSpecificity: 4 },
  { code: "L03.0", description: "Cellulitis of finger and toe", chapter: 12, chapterTitle: "Skin diseases", category: "skin", isValid: true, maxSpecificity: 4 },
  { code: "L03.1", description: "Cellulitis of other parts of limb", chapter: 12, chapterTitle: "Skin diseases", category: "skin", isValid: true, maxSpecificity: 4 },
  { code: "L08.0", description: "Pyoderma", chapter: 12, chapterTitle: "Skin diseases", category: "skin", isValid: true, maxSpecificity: 4 },
  { code: "L20.9", description: "Atopic dermatitis, unspecified [eczema]", chapter: 12, chapterTitle: "Skin diseases", category: "skin", isValid: true, maxSpecificity: 4 },
  { code: "L21.0", description: "Seborrhoea capitis [cradle cap]", chapter: 12, chapterTitle: "Skin diseases", category: "skin", isValid: true, maxSpecificity: 4 },
  { code: "L23.9", description: "Allergic contact dermatitis, unspecified cause", chapter: 12, chapterTitle: "Skin diseases", category: "skin", isValid: true, maxSpecificity: 4 },
  { code: "L25.9", description: "Unspecified contact dermatitis, unspecified cause", chapter: 12, chapterTitle: "Skin diseases", category: "skin", isValid: true, maxSpecificity: 4 },
  { code: "L30.9", description: "Dermatitis, unspecified", chapter: 12, chapterTitle: "Skin diseases", category: "skin", isValid: true, maxSpecificity: 4 },
  { code: "L40.0", description: "Psoriasis vulgaris", chapter: 12, chapterTitle: "Skin diseases", category: "skin", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "L40.9", description: "Psoriasis, unspecified", chapter: 12, chapterTitle: "Skin diseases", category: "skin", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "L50.0", description: "Allergic urticaria", chapter: 12, chapterTitle: "Skin diseases", category: "skin", isValid: true, maxSpecificity: 4 },
  { code: "L50.9", description: "Urticaria, unspecified", chapter: 12, chapterTitle: "Skin diseases", category: "skin", isValid: true, maxSpecificity: 4 },
  { code: "L60.0", description: "Ingrowing nail", chapter: 12, chapterTitle: "Skin diseases", category: "skin", isValid: true, maxSpecificity: 4 },
  { code: "L65.9", description: "Nonscarring hair loss, unspecified [alopecia]", chapter: 12, chapterTitle: "Skin diseases", category: "skin", isValid: true, maxSpecificity: 4 },
  { code: "L70.0", description: "Acne vulgaris", chapter: 12, chapterTitle: "Skin diseases", category: "skin", isValid: true, maxSpecificity: 4 },
  { code: "L72.0", description: "Epidermal cyst", chapter: 12, chapterTitle: "Skin diseases", category: "skin", isValid: true, maxSpecificity: 4 },
  { code: "L73.0", description: "Acne keloid", chapter: 12, chapterTitle: "Skin diseases", category: "skin", isValid: true, maxSpecificity: 4 },
  { code: "L82", description: "Seborrhoeic keratosis", chapter: 12, chapterTitle: "Skin diseases", category: "skin", isValid: true, maxSpecificity: 3 },
  { code: "L84", description: "Corns and callosities", chapter: 12, chapterTitle: "Skin diseases", category: "skin", isValid: true, maxSpecificity: 3 },
  { code: "L91.0", description: "Keloid scar", chapter: 12, chapterTitle: "Skin diseases", category: "skin", isValid: true, maxSpecificity: 4 },
  { code: "L98.9", description: "Disorder of skin and subcutaneous tissue, unspecified", chapter: 12, chapterTitle: "Skin diseases", category: "skin", isValid: true, maxSpecificity: 4 },

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 13 — MUSCULOSKELETAL (M00-M99)
  // ═══════════════════════════════════════════════════════════════
  { code: "M06.9", description: "Rheumatoid arthritis, unspecified", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "M10.0", description: "Idiopathic gout", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4 },
  { code: "M10.9", description: "Gout, unspecified", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4 },
  { code: "M13.9", description: "Arthritis, unspecified", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4 },
  { code: "M15.9", description: "Polyarthrosis, unspecified [osteoarthritis]", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4 },
  { code: "M16.9", description: "Coxarthrosis [arthrosis of hip], unspecified", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4 },
  { code: "M17.9", description: "Gonarthrosis [arthrosis of knee], unspecified", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4 },
  { code: "M19.9", description: "Arthrosis, unspecified", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4 },
  { code: "M23.5", description: "Chronic instability of knee", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4 },
  { code: "M25.5", description: "Pain in joint", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4 },
  { code: "M32.9", description: "Systemic lupus erythematosus, unspecified", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "M41.9", description: "Scoliosis, unspecified", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4 },
  { code: "M43.1", description: "Spondylolisthesis", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4 },
  { code: "M47.8", description: "Other spondylosis", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4 },
  { code: "M51.1", description: "Lumbar and other intervertebral disc disorders with radiculopathy", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4 },
  { code: "M54.2", description: "Cervicalgia [neck pain]", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4 },
  { code: "M54.4", description: "Lumbago with sciatica", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4 },
  { code: "M54.5", description: "Low back pain [lumbago]", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4 },
  { code: "M62.8", description: "Other specified disorders of muscle", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4 },
  { code: "M65.4", description: "Radial styloid tenosynovitis [de Quervain]", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4 },
  { code: "M67.4", description: "Ganglion", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4 },
  { code: "M70.6", description: "Trochanteric bursitis", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4 },
  { code: "M72.0", description: "Palmar fascial fibromatosis [Dupuytren]", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4 },
  { code: "M75.1", description: "Rotator cuff syndrome", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4 },
  { code: "M75.4", description: "Impingement syndrome of shoulder", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4 },
  { code: "M76.6", description: "Achilles tendinitis", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4 },
  { code: "M77.1", description: "Lateral epicondylitis [tennis elbow]", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4 },
  { code: "M77.3", description: "Calcaneal spur [heel spur]", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4 },
  { code: "M77.4", description: "Metatarsalgia", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4 },
  { code: "M79.1", description: "Myalgia", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4 },
  { code: "M79.3", description: "Panniculitis, unspecified", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4 },
  { code: "M80.9", description: "Unspecified osteoporosis with pathological fracture", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "M81.9", description: "Osteoporosis, unspecified", chapter: 13, chapterTitle: "Musculoskeletal diseases", category: "musculoskeletal", isValid: true, maxSpecificity: 4, isPMB: true },

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 14 — GENITOURINARY (N00-N99)
  // ═══════════════════════════════════════════════════════════════
  { code: "N10", description: "Acute tubulo-interstitial nephritis [pyelonephritis]", chapter: 14, chapterTitle: "Genitourinary diseases", category: "genitourinary", isValid: true, maxSpecificity: 3, isPMB: true },
  { code: "N13.3", description: "Other and unspecified hydronephrosis", chapter: 14, chapterTitle: "Genitourinary diseases", category: "genitourinary", isValid: true, maxSpecificity: 4 },
  { code: "N17.9", description: "Acute renal failure, unspecified", chapter: 14, chapterTitle: "Genitourinary diseases", category: "genitourinary", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "N18.5", description: "Chronic kidney disease, stage 5", chapter: 14, chapterTitle: "Genitourinary diseases", category: "genitourinary", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "N18.9", description: "Chronic kidney disease, unspecified", chapter: 14, chapterTitle: "Genitourinary diseases", category: "genitourinary", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "N20.0", description: "Calculus of kidney [kidney stone]", chapter: 14, chapterTitle: "Genitourinary diseases", category: "genitourinary", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "N20.1", description: "Calculus of ureter", chapter: 14, chapterTitle: "Genitourinary diseases", category: "genitourinary", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "N30.0", description: "Acute cystitis", chapter: 14, chapterTitle: "Genitourinary diseases", category: "genitourinary", isValid: true, maxSpecificity: 4 },
  { code: "N30.9", description: "Cystitis, unspecified", chapter: 14, chapterTitle: "Genitourinary diseases", category: "genitourinary", isValid: true, maxSpecificity: 4 },
  { code: "N34.1", description: "Nonspecific urethritis", chapter: 14, chapterTitle: "Genitourinary diseases", category: "genitourinary", isValid: true, maxSpecificity: 4 },
  { code: "N39.0", description: "Urinary tract infection, site not specified", chapter: 14, chapterTitle: "Genitourinary diseases", category: "genitourinary", isValid: true, maxSpecificity: 4 },
  { code: "N40", description: "Hyperplasia of prostate [BPH]", chapter: 14, chapterTitle: "Genitourinary diseases", category: "genitourinary", isValid: true, maxSpecificity: 3, genderRestriction: "M" },
  { code: "N41.0", description: "Acute prostatitis", chapter: 14, chapterTitle: "Genitourinary diseases", category: "genitourinary", isValid: true, maxSpecificity: 4, genderRestriction: "M" },
  { code: "N43.3", description: "Hydrocele, unspecified", chapter: 14, chapterTitle: "Genitourinary diseases", category: "genitourinary", isValid: true, maxSpecificity: 4, genderRestriction: "M" },
  { code: "N47", description: "Redundant prepuce, phimosis and paraphimosis", chapter: 14, chapterTitle: "Genitourinary diseases", category: "genitourinary", isValid: true, maxSpecificity: 3, genderRestriction: "M" },
  { code: "N48.1", description: "Balanoposthitis", chapter: 14, chapterTitle: "Genitourinary diseases", category: "genitourinary", isValid: true, maxSpecificity: 4, genderRestriction: "M" },
  { code: "N60.1", description: "Diffuse cystic mastopathy [fibrocystic breast]", chapter: 14, chapterTitle: "Genitourinary diseases", category: "genitourinary", isValid: true, maxSpecificity: 4 },
  { code: "N61", description: "Inflammatory disorders of breast", chapter: 14, chapterTitle: "Genitourinary diseases", category: "genitourinary", isValid: true, maxSpecificity: 3 },
  { code: "N63", description: "Unspecified lump in breast", chapter: 14, chapterTitle: "Genitourinary diseases", category: "genitourinary", isValid: true, maxSpecificity: 3 },
  { code: "N72", description: "Inflammatory disease of cervix uteri", chapter: 14, chapterTitle: "Genitourinary diseases", category: "genitourinary", isValid: true, maxSpecificity: 3, genderRestriction: "F" },
  { code: "N73.0", description: "Acute parametritis and pelvic cellulitis", chapter: 14, chapterTitle: "Genitourinary diseases", category: "genitourinary", isValid: true, maxSpecificity: 4, genderRestriction: "F" },
  { code: "N76.0", description: "Acute vaginitis", chapter: 14, chapterTitle: "Genitourinary diseases", category: "genitourinary", isValid: true, maxSpecificity: 4, genderRestriction: "F" },
  { code: "N80.0", description: "Endometriosis of uterus", chapter: 14, chapterTitle: "Genitourinary diseases", category: "genitourinary", isValid: true, maxSpecificity: 4, genderRestriction: "F", isPMB: true },
  { code: "N83.0", description: "Follicular cyst of ovary", chapter: 14, chapterTitle: "Genitourinary diseases", category: "genitourinary", isValid: true, maxSpecificity: 4, genderRestriction: "F" },
  { code: "N83.2", description: "Other and unspecified ovarian cysts", chapter: 14, chapterTitle: "Genitourinary diseases", category: "genitourinary", isValid: true, maxSpecificity: 4, genderRestriction: "F" },
  { code: "N87.0", description: "Mild cervical dysplasia [CIN I]", chapter: 14, chapterTitle: "Genitourinary diseases", category: "genitourinary", isValid: true, maxSpecificity: 4, genderRestriction: "F" },
  { code: "N91.2", description: "Amenorrhoea, unspecified", chapter: 14, chapterTitle: "Genitourinary diseases", category: "genitourinary", isValid: true, maxSpecificity: 4, genderRestriction: "F" },
  { code: "N92.0", description: "Excessive and frequent menstruation with regular cycle", chapter: 14, chapterTitle: "Genitourinary diseases", category: "genitourinary", isValid: true, maxSpecificity: 4, genderRestriction: "F" },
  { code: "N92.1", description: "Excessive and frequent menstruation with irregular cycle", chapter: 14, chapterTitle: "Genitourinary diseases", category: "genitourinary", isValid: true, maxSpecificity: 4, genderRestriction: "F" },
  { code: "N94.6", description: "Dysmenorrhoea, unspecified", chapter: 14, chapterTitle: "Genitourinary diseases", category: "genitourinary", isValid: true, maxSpecificity: 4, genderRestriction: "F" },
  { code: "N95.1", description: "Menopausal and female climacteric states", chapter: 14, chapterTitle: "Genitourinary diseases", category: "genitourinary", isValid: true, maxSpecificity: 4, genderRestriction: "F", ageMin: 35 },

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 15 — PREGNANCY (O00-O99) — ALL FEMALE ONLY
  // ═══════════════════════════════════════════════════════════════
  { code: "O00.1", description: "Tubal pregnancy", chapter: 15, chapterTitle: "Pregnancy", category: "pregnancy", isValid: true, maxSpecificity: 4, genderRestriction: "F", ageMin: 12, ageMax: 55, isPMB: true },
  { code: "O03.9", description: "Complete or unspecified spontaneous abortion without complication", chapter: 15, chapterTitle: "Pregnancy", category: "pregnancy", isValid: true, maxSpecificity: 4, genderRestriction: "F", ageMin: 12, ageMax: 55, isPMB: true },
  { code: "O14.1", description: "Severe pre-eclampsia", chapter: 15, chapterTitle: "Pregnancy", category: "pregnancy", isValid: true, maxSpecificity: 4, genderRestriction: "F", ageMin: 12, ageMax: 55, isPMB: true },
  { code: "O24.4", description: "Gestational diabetes mellitus", chapter: 15, chapterTitle: "Pregnancy", category: "pregnancy", isValid: true, maxSpecificity: 4, genderRestriction: "F", ageMin: 12, ageMax: 55, isPMB: true },
  { code: "O26.8", description: "Other specified pregnancy-related conditions", chapter: 15, chapterTitle: "Pregnancy", category: "pregnancy", isValid: true, maxSpecificity: 4, genderRestriction: "F", ageMin: 12, ageMax: 55 },
  { code: "O42.9", description: "Premature rupture of membranes, unspecified", chapter: 15, chapterTitle: "Pregnancy", category: "pregnancy", isValid: true, maxSpecificity: 4, genderRestriction: "F", ageMin: 12, ageMax: 55, isPMB: true },
  { code: "O60.0", description: "Preterm labour without delivery", chapter: 15, chapterTitle: "Pregnancy", category: "pregnancy", isValid: true, maxSpecificity: 4, genderRestriction: "F", ageMin: 12, ageMax: 55, isPMB: true },
  { code: "O72.1", description: "Other immediate postpartum haemorrhage", chapter: 15, chapterTitle: "Pregnancy", category: "pregnancy", isValid: true, maxSpecificity: 4, genderRestriction: "F", ageMin: 12, ageMax: 55, isPMB: true },
  { code: "O80", description: "Single spontaneous delivery", chapter: 15, chapterTitle: "Pregnancy", category: "pregnancy", isValid: true, maxSpecificity: 3, genderRestriction: "F", ageMin: 12, ageMax: 55, isPMB: true },
  { code: "O82", description: "Single delivery by caesarean section", chapter: 15, chapterTitle: "Pregnancy", category: "pregnancy", isValid: true, maxSpecificity: 3, genderRestriction: "F", ageMin: 12, ageMax: 55, isPMB: true },

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 16 — PERINATAL (P00-P96) — NEONATAL AGE RESTRICTIONS
  // ═══════════════════════════════════════════════════════════════
  { code: "P07.3", description: "Other preterm infants", chapter: 16, chapterTitle: "Perinatal conditions", category: "perinatal", isValid: true, maxSpecificity: 4, ageMax: 1, isPMB: true },
  { code: "P22.0", description: "Respiratory distress syndrome of newborn", chapter: 16, chapterTitle: "Perinatal conditions", category: "perinatal", isValid: true, maxSpecificity: 4, ageMax: 1, isPMB: true },
  { code: "P36.9", description: "Bacterial sepsis of newborn, unspecified", chapter: 16, chapterTitle: "Perinatal conditions", category: "perinatal", isValid: true, maxSpecificity: 4, ageMax: 1, isPMB: true },
  { code: "P59.9", description: "Neonatal jaundice, unspecified", chapter: 16, chapterTitle: "Perinatal conditions", category: "perinatal", isValid: true, maxSpecificity: 4, ageMax: 1, isPMB: true },

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 18 — SYMPTOMS & SIGNS (R00-R99)
  // ═══════════════════════════════════════════════════════════════
  { code: "R00.0", description: "Tachycardia, unspecified", chapter: 18, chapterTitle: "Symptoms and signs", category: "symptoms", isValid: true, maxSpecificity: 4 },
  { code: "R00.2", description: "Palpitations", chapter: 18, chapterTitle: "Symptoms and signs", category: "symptoms", isValid: true, maxSpecificity: 4 },
  { code: "R01.0", description: "Benign and innocent cardiac murmurs", chapter: 18, chapterTitle: "Symptoms and signs", category: "symptoms", isValid: true, maxSpecificity: 4 },
  { code: "R04.0", description: "Epistaxis [nosebleed]", chapter: 18, chapterTitle: "Symptoms and signs", category: "symptoms", isValid: true, maxSpecificity: 4 },
  { code: "R05", description: "Cough", chapter: 18, chapterTitle: "Symptoms and signs", category: "symptoms", isValid: true, maxSpecificity: 3 },
  { code: "R06.0", description: "Dyspnoea", chapter: 18, chapterTitle: "Symptoms and signs", category: "symptoms", isValid: true, maxSpecificity: 4 },
  { code: "R07.4", description: "Chest pain, unspecified", chapter: 18, chapterTitle: "Symptoms and signs", category: "symptoms", isValid: true, maxSpecificity: 4 },
  { code: "R10.1", description: "Pain localized to upper abdomen", chapter: 18, chapterTitle: "Symptoms and signs", category: "symptoms", isValid: true, maxSpecificity: 4 },
  { code: "R10.3", description: "Pain localized to other parts of lower abdomen", chapter: 18, chapterTitle: "Symptoms and signs", category: "symptoms", isValid: true, maxSpecificity: 4 },
  { code: "R10.4", description: "Other and unspecified abdominal pain", chapter: 18, chapterTitle: "Symptoms and signs", category: "symptoms", isValid: true, maxSpecificity: 4 },
  { code: "R11", description: "Nausea and vomiting", chapter: 18, chapterTitle: "Symptoms and signs", category: "symptoms", isValid: true, maxSpecificity: 3 },
  { code: "R12", description: "Heartburn", chapter: 18, chapterTitle: "Symptoms and signs", category: "symptoms", isValid: true, maxSpecificity: 3 },
  { code: "R14", description: "Flatulence and related conditions", chapter: 18, chapterTitle: "Symptoms and signs", category: "symptoms", isValid: true, maxSpecificity: 3 },
  { code: "R17", description: "Unspecified jaundice", chapter: 18, chapterTitle: "Symptoms and signs", category: "symptoms", isValid: true, maxSpecificity: 3 },
  { code: "R19.4", description: "Change in bowel habit", chapter: 18, chapterTitle: "Symptoms and signs", category: "symptoms", isValid: true, maxSpecificity: 4 },
  { code: "R20.2", description: "Paraesthesia of skin [tingling/numbness]", chapter: 18, chapterTitle: "Symptoms and signs", category: "symptoms", isValid: true, maxSpecificity: 4 },
  { code: "R21", description: "Rash and other nonspecific skin eruption", chapter: 18, chapterTitle: "Symptoms and signs", category: "symptoms", isValid: true, maxSpecificity: 3 },
  { code: "R22.9", description: "Localized swelling, mass and lump, unspecified", chapter: 18, chapterTitle: "Symptoms and signs", category: "symptoms", isValid: true, maxSpecificity: 4 },
  { code: "R25.1", description: "Tremor, unspecified", chapter: 18, chapterTitle: "Symptoms and signs", category: "symptoms", isValid: true, maxSpecificity: 4 },
  { code: "R30.0", description: "Dysuria", chapter: 18, chapterTitle: "Symptoms and signs", category: "symptoms", isValid: true, maxSpecificity: 4 },
  { code: "R31", description: "Unspecified haematuria", chapter: 18, chapterTitle: "Symptoms and signs", category: "symptoms", isValid: true, maxSpecificity: 3 },
  { code: "R42", description: "Dizziness and giddiness", chapter: 18, chapterTitle: "Symptoms and signs", category: "symptoms", isValid: true, maxSpecificity: 3 },
  { code: "R50.9", description: "Fever, unspecified", chapter: 18, chapterTitle: "Symptoms and signs", category: "symptoms", isValid: true, maxSpecificity: 4 },
  { code: "R51", description: "Headache", chapter: 18, chapterTitle: "Symptoms and signs", category: "symptoms", isValid: true, maxSpecificity: 3 },
  { code: "R52.2", description: "Other chronic pain", chapter: 18, chapterTitle: "Symptoms and signs", category: "symptoms", isValid: true, maxSpecificity: 4 },
  { code: "R53", description: "Malaise and fatigue", chapter: 18, chapterTitle: "Symptoms and signs", category: "symptoms", isValid: true, maxSpecificity: 3 },
  { code: "R55", description: "Syncope and collapse", chapter: 18, chapterTitle: "Symptoms and signs", category: "symptoms", isValid: true, maxSpecificity: 3 },
  { code: "R56.0", description: "Febrile convulsions", chapter: 18, chapterTitle: "Symptoms and signs", category: "symptoms", isValid: true, maxSpecificity: 4, ageMax: 5 },
  { code: "R59.0", description: "Localized enlarged lymph nodes", chapter: 18, chapterTitle: "Symptoms and signs", category: "symptoms", isValid: true, maxSpecificity: 4 },
  { code: "R60.0", description: "Localized oedema", chapter: 18, chapterTitle: "Symptoms and signs", category: "symptoms", isValid: true, maxSpecificity: 4 },
  { code: "R73.0", description: "Abnormal glucose tolerance test", chapter: 18, chapterTitle: "Symptoms and signs", category: "symptoms", isValid: true, maxSpecificity: 4 },

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 19 — INJURY & POISONING (S00-T98)
  // ALL REQUIRE EXTERNAL CAUSE CODE (V00-Y99)
  // ═══════════════════════════════════════════════════════════════
  { code: "S00.0", description: "Superficial injury of scalp", chapter: 19, chapterTitle: "Injury", category: "injury", isValid: true, maxSpecificity: 4, requiresExternalCause: true },
  { code: "S01.0", description: "Open wound of scalp", chapter: 19, chapterTitle: "Injury", category: "injury", isValid: true, maxSpecificity: 4, requiresExternalCause: true },
  { code: "S02.0", description: "Fracture of vault of skull", chapter: 19, chapterTitle: "Injury", category: "injury", isValid: true, maxSpecificity: 4, requiresExternalCause: true, isPMB: true },
  { code: "S06.0", description: "Concussion", chapter: 19, chapterTitle: "Injury", category: "injury", isValid: true, maxSpecificity: 4, requiresExternalCause: true, isPMB: true },
  { code: "S09.9", description: "Unspecified injury of head", chapter: 19, chapterTitle: "Injury", category: "injury", isValid: true, maxSpecificity: 4, requiresExternalCause: true },
  { code: "S13.4", description: "Sprain and strain of cervical spine [whiplash]", chapter: 19, chapterTitle: "Injury", category: "injury", isValid: true, maxSpecificity: 4, requiresExternalCause: true },
  { code: "S22.3", description: "Fracture of rib", chapter: 19, chapterTitle: "Injury", category: "injury", isValid: true, maxSpecificity: 4, requiresExternalCause: true },
  { code: "S32.0", description: "Fracture of lumbar vertebra", chapter: 19, chapterTitle: "Injury", category: "injury", isValid: true, maxSpecificity: 4, requiresExternalCause: true, isPMB: true },
  { code: "S42.0", description: "Fracture of clavicle", chapter: 19, chapterTitle: "Injury", category: "injury", isValid: true, maxSpecificity: 4, requiresExternalCause: true },
  { code: "S42.2", description: "Fracture of upper end of humerus", chapter: 19, chapterTitle: "Injury", category: "injury", isValid: true, maxSpecificity: 4, requiresExternalCause: true },
  { code: "S52.5", description: "Fracture of lower end of radius [Colles]", chapter: 19, chapterTitle: "Injury", category: "injury", isValid: true, maxSpecificity: 4, requiresExternalCause: true },
  { code: "S61.0", description: "Open wound of finger(s) without damage to nail", chapter: 19, chapterTitle: "Injury", category: "injury", isValid: true, maxSpecificity: 4, requiresExternalCause: true },
  { code: "S62.3", description: "Fracture of metacarpal bone", chapter: 19, chapterTitle: "Injury", category: "injury", isValid: true, maxSpecificity: 4, requiresExternalCause: true },
  { code: "S72.0", description: "Fracture of neck of femur", chapter: 19, chapterTitle: "Injury", category: "injury", isValid: true, maxSpecificity: 4, requiresExternalCause: true, isPMB: true },
  { code: "S82.0", description: "Fracture of patella", chapter: 19, chapterTitle: "Injury", category: "injury", isValid: true, maxSpecificity: 4, requiresExternalCause: true },
  { code: "S82.5", description: "Fracture of medial malleolus", chapter: 19, chapterTitle: "Injury", category: "injury", isValid: true, maxSpecificity: 4, requiresExternalCause: true },
  { code: "S82.6", description: "Fracture of lateral malleolus", chapter: 19, chapterTitle: "Injury", category: "injury", isValid: true, maxSpecificity: 4, requiresExternalCause: true },
  { code: "S83.5", description: "Sprain and strain of cruciate ligament of knee", chapter: 19, chapterTitle: "Injury", category: "injury", isValid: true, maxSpecificity: 4, requiresExternalCause: true },
  { code: "S86.0", description: "Injury of Achilles tendon", chapter: 19, chapterTitle: "Injury", category: "injury", isValid: true, maxSpecificity: 4, requiresExternalCause: true },
  { code: "S92.0", description: "Fracture of calcaneus", chapter: 19, chapterTitle: "Injury", category: "injury", isValid: true, maxSpecificity: 4, requiresExternalCause: true },
  { code: "S93.4", description: "Sprain and strain of ankle", chapter: 19, chapterTitle: "Injury", category: "injury", isValid: true, maxSpecificity: 4, requiresExternalCause: true },
  { code: "T14.9", description: "Injury, unspecified", chapter: 19, chapterTitle: "Injury", category: "injury", isValid: true, maxSpecificity: 4, requiresExternalCause: true },
  { code: "T78.2", description: "Anaphylactic shock, unspecified", chapter: 19, chapterTitle: "Injury", category: "injury", isValid: true, maxSpecificity: 4, requiresExternalCause: true, isPMB: true },
  { code: "T78.4", description: "Allergy, unspecified", chapter: 19, chapterTitle: "Injury", category: "injury", isValid: true, maxSpecificity: 4, requiresExternalCause: true },
  { code: "T81.0", description: "Haemorrhage and haematoma complicating a procedure", chapter: 19, chapterTitle: "Injury", category: "injury", isValid: true, maxSpecificity: 4, requiresExternalCause: true },

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 20 — EXTERNAL CAUSES (V01-Y98)
  // CANNOT BE PRIMARY DIAGNOSIS
  // ═══════════════════════════════════════════════════════════════
  { code: "V89.2", description: "Person injured in unspecified motor-vehicle accident, traffic", chapter: 20, chapterTitle: "External causes", category: "external_cause", isValid: true, maxSpecificity: 4, isExternalCause: true },
  { code: "W01", description: "Fall on same level from slipping, tripping and stumbling", chapter: 20, chapterTitle: "External causes", category: "external_cause", isValid: true, maxSpecificity: 3, isExternalCause: true },
  { code: "W06", description: "Fall involving bed", chapter: 20, chapterTitle: "External causes", category: "external_cause", isValid: true, maxSpecificity: 3, isExternalCause: true },
  { code: "W10", description: "Fall on and from stairs and steps", chapter: 20, chapterTitle: "External causes", category: "external_cause", isValid: true, maxSpecificity: 3, isExternalCause: true },
  { code: "W18", description: "Other fall on same level", chapter: 20, chapterTitle: "External causes", category: "external_cause", isValid: true, maxSpecificity: 3, isExternalCause: true },
  { code: "W19", description: "Unspecified fall", chapter: 20, chapterTitle: "External causes", category: "external_cause", isValid: true, maxSpecificity: 3, isExternalCause: true },
  { code: "W54", description: "Bitten or struck by dog", chapter: 20, chapterTitle: "External causes", category: "external_cause", isValid: true, maxSpecificity: 3, isExternalCause: true },
  { code: "X58", description: "Exposure to other specified factors", chapter: 20, chapterTitle: "External causes", category: "external_cause", isValid: true, maxSpecificity: 3, isExternalCause: true },
  { code: "X59", description: "Exposure to unspecified factor", chapter: 20, chapterTitle: "External causes", category: "external_cause", isValid: true, maxSpecificity: 3, isExternalCause: true },
  { code: "Y83.1", description: "Surgical operation with implant of artificial internal device", chapter: 20, chapterTitle: "External causes", category: "external_cause", isValid: true, maxSpecificity: 4, isExternalCause: true },
  { code: "Y84.9", description: "Medical procedure, unspecified, as the cause of abnormal reaction", chapter: 20, chapterTitle: "External causes", category: "external_cause", isValid: true, maxSpecificity: 4, isExternalCause: true },

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 21 — HEALTH STATUS FACTORS (Z00-Z99)
  // ═══════════════════════════════════════════════════════════════
  { code: "Z00.0", description: "General examination and investigation of persons without complaint", chapter: 21, chapterTitle: "Health status factors", category: "health_status", isValid: true, maxSpecificity: 4 },
  { code: "Z00.1", description: "Routine child health examination", chapter: 21, chapterTitle: "Health status factors", category: "health_status", isValid: true, maxSpecificity: 4, ageMax: 18 },
  { code: "Z01.0", description: "Examination of eyes and vision", chapter: 21, chapterTitle: "Health status factors", category: "health_status", isValid: true, maxSpecificity: 4 },
  { code: "Z01.1", description: "Examination of ears and hearing", chapter: 21, chapterTitle: "Health status factors", category: "health_status", isValid: true, maxSpecificity: 4 },
  { code: "Z01.4", description: "Gynaecological examination (general) (routine)", chapter: 21, chapterTitle: "Health status factors", category: "health_status", isValid: true, maxSpecificity: 4, genderRestriction: "F" },
  { code: "Z01.6", description: "Radiological examination, not elsewhere classified", chapter: 21, chapterTitle: "Health status factors", category: "health_status", isValid: true, maxSpecificity: 4 },
  { code: "Z09.0", description: "Follow-up examination after surgery", chapter: 21, chapterTitle: "Health status factors", category: "health_status", isValid: true, maxSpecificity: 4 },
  { code: "Z12.1", description: "Special screening examination for neoplasm of intestinal tract", chapter: 21, chapterTitle: "Health status factors", category: "health_status", isValid: true, maxSpecificity: 4 },
  { code: "Z12.3", description: "Special screening examination for neoplasm of breast", chapter: 21, chapterTitle: "Health status factors", category: "health_status", isValid: true, maxSpecificity: 4 },
  { code: "Z12.4", description: "Special screening examination for neoplasm of cervix", chapter: 21, chapterTitle: "Health status factors", category: "health_status", isValid: true, maxSpecificity: 4, genderRestriction: "F" },
  { code: "Z13.2", description: "Special screening examination for nutritional disorders", chapter: 21, chapterTitle: "Health status factors", category: "health_status", isValid: true, maxSpecificity: 4 },
  { code: "Z23", description: "Need for immunization against single bacterial diseases", chapter: 21, chapterTitle: "Health status factors", category: "health_status", isValid: true, maxSpecificity: 3 },
  { code: "Z25.1", description: "Need for immunization against influenza", chapter: 21, chapterTitle: "Health status factors", category: "health_status", isValid: true, maxSpecificity: 4 },
  { code: "Z27.1", description: "Need for immunization against DTP", chapter: 21, chapterTitle: "Health status factors", category: "health_status", isValid: true, maxSpecificity: 4 },
  { code: "Z30.0", description: "General counselling and advice on contraception", chapter: 21, chapterTitle: "Health status factors", category: "health_status", isValid: true, maxSpecificity: 4 },
  { code: "Z30.1", description: "Insertion of (intrauterine) contraceptive device", chapter: 21, chapterTitle: "Health status factors", category: "health_status", isValid: true, maxSpecificity: 4, genderRestriction: "F" },
  { code: "Z30.4", description: "Surveillance of contraceptive drugs", chapter: 21, chapterTitle: "Health status factors", category: "health_status", isValid: true, maxSpecificity: 4 },
  { code: "Z34.0", description: "Supervision of normal first pregnancy", chapter: 21, chapterTitle: "Health status factors", category: "health_status", isValid: true, maxSpecificity: 4, genderRestriction: "F", ageMin: 12, ageMax: 55 },
  { code: "Z34.9", description: "Supervision of normal pregnancy, unspecified", chapter: 21, chapterTitle: "Health status factors", category: "health_status", isValid: true, maxSpecificity: 4, genderRestriction: "F", ageMin: 12, ageMax: 55 },
  { code: "Z76.0", description: "Issue of repeat prescription", chapter: 21, chapterTitle: "Health status factors", category: "health_status", isValid: true, maxSpecificity: 4 },

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 22 — SPECIAL PURPOSES (U00-U85) — COVID-19
  // ═══════════════════════════════════════════════════════════════
  { code: "U07.1", description: "COVID-19, virus identified", chapter: 22, chapterTitle: "Special purposes", category: "special", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "U07.2", description: "COVID-19, virus not identified", chapter: 22, chapterTitle: "Special purposes", category: "special", isValid: true, maxSpecificity: 4, isPMB: true },
  { code: "U09.9", description: "Post-COVID-19 condition, unspecified", chapter: 22, chapterTitle: "Special purposes", category: "special", isValid: true, maxSpecificity: 4 },
];

// Build lookup maps for fast access
const codeMap = new Map<string, ICD10Entry>();
for (const entry of ICD10_DATABASE) {
  codeMap.set(entry.code, entry);
}

export function lookupICD10(code: string): ICD10Entry | undefined {
  return codeMap.get(code.toUpperCase().trim());
}

export function searchICD10(query: string, limit = 20): ICD10Entry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const results: ICD10Entry[] = [];
  for (const entry of ICD10_DATABASE) {
    if (
      entry.code.toLowerCase().includes(q) ||
      entry.description.toLowerCase().includes(q)
    ) {
      results.push(entry);
      if (results.length >= limit) break;
    }
  }
  return results;
}

export function getChapterForCode(code: string): { chapter: number; title: string } | undefined {
  const prefix = code.substring(0, 3).toUpperCase();
  for (const ch of ICD10_CHAPTERS) {
    if (prefix >= ch.range[0] && prefix <= ch.range[1]) {
      return { chapter: ch.chapter, title: ch.title };
    }
  }
  return undefined;
}
