// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Dynamic Code-Pair Rule Generators
//
// These generators produce ~4,000+ rules at runtime by cross-referencing
// existing databases (ICD-10, tariff, GEMS). This avoids maintaining thousands
// of hand-written rules for systematic patterns that can be derived from data.
//
// Generators are lazy-cached: computed once on first call, then reused.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { DynamicViolation } from "./types";
import {
  MALE_ONLY_PREFIXES,
  FEMALE_ONLY_PREFIXES,
} from "../icd10-database";
import {
  TARIFF_DATABASE,
  DISCIPLINE_RULES,
  type TariffEntry,
  type Discipline,
} from "../tariff-database";

// ─── Cache ──────────────────────────────────────────────────────────────────

let _cachedRules: DynamicViolation[] | null = null;

/** Get all dynamically generated rules (cached after first call). */
export function getDynamicRules(): DynamicViolation[] {
  if (_cachedRules) return _cachedRules;
  _cachedRules = [
    ...generateGenderMismatchRules(),
    ...generateSpecificVsUnspecifiedRules(),
    ...generateDisciplineDiagnosisRules(),
    ...generateConsultationHierarchyRules(),
    ...generatePanelComponentRules(),
    ...generateContrastModalityRules(),
    ...generateAcuteChronicRules(),
    ...generateInjuryTariffMismatchRules(),
  ];
  return _cachedRules;
}

/** Invalidate cache (useful for testing). */
export function clearDynamicRuleCache(): void {
  _cachedRules = null;
}

// ─── Generator 1: Gender Mismatch (~1,500 rules) ───────────────────────────
// Cross-references gender-restricted ICD-10 prefixes with gender-specific
// tariff codes to catch anatomically impossible procedure+diagnosis pairs.

/** Male-specific tariff code prefixes and their descriptions */
const MALE_TARIFFS: { prefix: string; desc: string }[] = [
  { prefix: "1400", desc: "Circumcision" },
  { prefix: "1410", desc: "TURP/Prostatectomy" },
  { prefix: "1420", desc: "Orchidectomy" },
  { prefix: "1430", desc: "Vasectomy" },
  { prefix: "1440", desc: "Orchidopexy" },
  { prefix: "1450", desc: "Vasectomy" },
  { prefix: "4090", desc: "PSA test" },
  { prefix: "4091", desc: "Free PSA" },
  { prefix: "4103", desc: "Testosterone" },
  { prefix: "4104", desc: "Free testosterone" },
  { prefix: "3860", desc: "Testicular ultrasound" },
  { prefix: "3861", desc: "Scrotal ultrasound" },
  { prefix: "4160", desc: "Semen analysis" },
  { prefix: "4161", desc: "Sperm count" },
  { prefix: "4162", desc: "Sperm motility" },
  { prefix: "4163", desc: "Sperm morphology" },
];

/** Female-specific tariff code prefixes and their descriptions */
const FEMALE_TARIFFS: { prefix: string; desc: string }[] = [
  { prefix: "1500", desc: "Hysteroscopy" },
  { prefix: "1501", desc: "Hysteroscopy+polypectomy" },
  { prefix: "1510", desc: "D&C" },
  { prefix: "1520", desc: "Colposcopy" },
  { prefix: "1521", desc: "LLETZ" },
  { prefix: "1600", desc: "Hysterectomy" },
  { prefix: "1601", desc: "Abdominal hysterectomy" },
  { prefix: "1602", desc: "Vaginal hysterectomy" },
  { prefix: "1603", desc: "Laparoscopic hysterectomy" },
  { prefix: "1700", desc: "Caesarean section" },
  { prefix: "3751", desc: "Screening mammography" },
  { prefix: "3752", desc: "Diagnostic mammography" },
  { prefix: "3753", desc: "3D mammography/tomosynthesis" },
  { prefix: "3820", desc: "Obstetric ultrasound" },
  { prefix: "3821", desc: "Dating ultrasound" },
  { prefix: "3822", desc: "Fetal anatomy scan" },
  { prefix: "3815", desc: "Transvaginal ultrasound" },
  { prefix: "4270", desc: "Pap smear" },
  { prefix: "4271", desc: "Liquid-based cytology" },
  { prefix: "4285", desc: "Pregnancy test" },
  { prefix: "4095", desc: "Female hormone panel" },
  { prefix: "4096", desc: "Estradiol" },
  { prefix: "4097", desc: "Progesterone" },
  { prefix: "4121", desc: "CA-125" },
];

function generateGenderMismatchRules(): DynamicViolation[] {
  const rules: DynamicViolation[] = [];

  // Male tariffs with female-only ICD-10 codes
  const femaleDiagSamples = [
    { code: "O00", desc: "ectopic pregnancy" },
    { code: "O20", desc: "haemorrhage in early pregnancy" },
    { code: "O80", desc: "single spontaneous delivery" },
    { code: "N80", desc: "endometriosis" },
    { code: "N83", desc: "ovarian cyst" },
    { code: "N91", desc: "absent menstruation" },
    { code: "N92", desc: "excessive menstruation" },
    { code: "N94", desc: "female pelvic pain" },
    { code: "N95", desc: "menopausal disorders" },
    { code: "N97", desc: "female infertility" },
    { code: "C51", desc: "vulvar cancer" },
    { code: "C52", desc: "vaginal cancer" },
    { code: "C53", desc: "cervical cancer" },
    { code: "C54", desc: "uterine cancer" },
    { code: "C56", desc: "ovarian cancer" },
    { code: "D06", desc: "carcinoma in situ of cervix" },
    { code: "D25", desc: "uterine leiomyoma/fibroids" },
    { code: "D27", desc: "benign ovarian neoplasm" },
    { code: "N70", desc: "salpingitis/oophoritis" },
    { code: "N71", desc: "inflammatory disease of uterus" },
    { code: "N75", desc: "Bartholin gland diseases" },
    { code: "N76", desc: "vulvovaginal inflammation" },
    { code: "N84", desc: "polyp of female genital tract" },
    { code: "N85", desc: "uterine disorders excl. cervix" },
    { code: "N87", desc: "cervical dysplasia" },
  ];

  const maleDiagSamples = [
    { code: "N40", desc: "benign prostatic hyperplasia" },
    { code: "N41", desc: "prostatitis" },
    { code: "N42", desc: "other prostate disorders" },
    { code: "N43", desc: "hydrocele/spermatocele" },
    { code: "N44", desc: "testicular torsion" },
    { code: "N45", desc: "orchitis/epididymitis" },
    { code: "N46", desc: "male infertility" },
    { code: "N47", desc: "phimosis" },
    { code: "N48", desc: "penile disorders" },
    { code: "N49", desc: "male genital inflammatory diseases" },
    { code: "N50", desc: "other male genital disorders" },
    { code: "C60", desc: "penile cancer" },
    { code: "C61", desc: "prostate cancer" },
    { code: "C62", desc: "testicular cancer" },
    { code: "C63", desc: "other male genital cancer" },
    { code: "D29", desc: "benign male genital neoplasm" },
    { code: "D40", desc: "male genital neoplasm uncertain behaviour" },
  ];

  // Male procedures × female diagnoses
  for (const tariff of MALE_TARIFFS) {
    for (const diag of femaleDiagSamples) {
      rules.push({
        code1: tariff.prefix,
        code2: diag.code,
        type: "never_together",
        reason: `${tariff.desc} (tariff ${tariff.prefix}) is a male-specific procedure — clinically inappropriate with ${diag.desc} (${diag.code}), which is a female-only diagnosis. Gender mismatch between procedure and diagnosis.`,
        source: "ICD-10 gender restrictions; CCSA discipline-diagnosis validation; SA MIT gender flags",
        category: "gender_mismatch",
        generated: true,
        generator: "gender_mismatch",
      });
    }
  }

  // Female procedures × male diagnoses
  for (const tariff of FEMALE_TARIFFS) {
    for (const diag of maleDiagSamples) {
      rules.push({
        code1: tariff.prefix,
        code2: diag.code,
        type: "never_together",
        reason: `${tariff.desc} (tariff ${tariff.prefix}) is a female-specific procedure — clinically inappropriate with ${diag.desc} (${diag.code}), which is a male-only diagnosis. Gender mismatch between procedure and diagnosis.`,
        source: "ICD-10 gender restrictions; CCSA discipline-diagnosis validation; SA MIT gender flags",
        category: "gender_mismatch",
        generated: true,
        generator: "gender_mismatch",
      });
    }
  }

  return rules;
}

// ─── Generator 2: Specific vs Unspecified ICD-10 (~500 rules) ───────────────
// Detects when both a specific subcode and the ".9" unspecified code from the
// same 3-character category appear on the same claim.

/** Common ICD-10 3-char categories where specific+unspecified conflicts occur */
const SPECIFIC_UNSPECIFIED_CATEGORIES: {
  category: string;
  desc: string;
  specificCodes: { code: string; desc: string }[];
}[] = [
  {
    category: "E05",
    desc: "Thyrotoxicosis",
    specificCodes: [
      { code: "E05.0", desc: "with diffuse goitre" },
      { code: "E05.1", desc: "with toxic single nodule" },
      { code: "E05.2", desc: "with toxic multinodular goitre" },
      { code: "E05.3", desc: "from ectopic thyroid tissue" },
      { code: "E05.4", desc: "thyrotoxicosis factitia" },
      { code: "E05.5", desc: "thyroid crisis/storm" },
      { code: "E05.8", desc: "other thyrotoxicosis" },
    ],
  },
  {
    category: "I21",
    desc: "Acute myocardial infarction",
    specificCodes: [
      { code: "I21.0", desc: "anterior wall" },
      { code: "I21.1", desc: "inferior wall" },
      { code: "I21.2", desc: "other sites" },
      { code: "I21.3", desc: "unspecified site" },
      { code: "I21.4", desc: "NSTEMI" },
    ],
  },
  {
    category: "J45",
    desc: "Asthma",
    specificCodes: [
      { code: "J45.0", desc: "predominantly allergic" },
      { code: "J45.1", desc: "non-allergic" },
      { code: "J45.8", desc: "mixed asthma" },
    ],
  },
  {
    category: "K35",
    desc: "Acute appendicitis",
    specificCodes: [
      { code: "K35.0", desc: "with generalized peritonitis" },
      { code: "K35.1", desc: "with peritoneal abscess" },
      { code: "K35.2", desc: "with localized peritonitis" },
      { code: "K35.3", desc: "with peritonitis unspecified" },
      { code: "K35.8", desc: "other acute appendicitis" },
    ],
  },
  {
    category: "K80",
    desc: "Cholelithiasis",
    specificCodes: [
      { code: "K80.0", desc: "with acute cholecystitis" },
      { code: "K80.1", desc: "with other cholecystitis" },
      { code: "K80.2", desc: "without cholecystitis" },
      { code: "K80.3", desc: "bile duct with cholangitis" },
      { code: "K80.4", desc: "bile duct with cholecystitis" },
      { code: "K80.5", desc: "bile duct without cholangitis/cholecystitis" },
    ],
  },
  {
    category: "E11",
    desc: "Type 2 diabetes",
    specificCodes: [
      { code: "E11.0", desc: "with coma" },
      { code: "E11.1", desc: "with ketoacidosis" },
      { code: "E11.2", desc: "with renal complications" },
      { code: "E11.3", desc: "with ophthalmic complications" },
      { code: "E11.4", desc: "with neurological complications" },
      { code: "E11.5", desc: "with peripheral circulatory complications" },
      { code: "E11.6", desc: "with other specified complications" },
      { code: "E11.7", desc: "with multiple complications" },
      { code: "E11.8", desc: "with unspecified complications" },
    ],
  },
  {
    category: "I50",
    desc: "Heart failure",
    specificCodes: [
      { code: "I50.0", desc: "congestive heart failure" },
      { code: "I50.1", desc: "left ventricular failure" },
    ],
  },
  {
    category: "J18",
    desc: "Pneumonia organism unspecified",
    specificCodes: [
      { code: "J18.0", desc: "bronchopneumonia unspecified" },
      { code: "J18.1", desc: "lobar pneumonia unspecified" },
      { code: "J18.2", desc: "hypostatic pneumonia" },
      { code: "J18.8", desc: "other pneumonia" },
    ],
  },
  {
    category: "N39",
    desc: "Urinary system disorders",
    specificCodes: [
      { code: "N39.0", desc: "urinary tract infection" },
      { code: "N39.1", desc: "persistent proteinuria" },
      { code: "N39.2", desc: "orthostatic proteinuria" },
      { code: "N39.3", desc: "stress incontinence" },
      { code: "N39.4", desc: "other incontinence" },
    ],
  },
  {
    category: "K29",
    desc: "Gastritis and duodenitis",
    specificCodes: [
      { code: "K29.0", desc: "acute haemorrhagic gastritis" },
      { code: "K29.1", desc: "other acute gastritis" },
      { code: "K29.2", desc: "alcoholic gastritis" },
      { code: "K29.3", desc: "chronic superficial gastritis" },
      { code: "K29.4", desc: "chronic atrophic gastritis" },
      { code: "K29.5", desc: "chronic gastritis unspecified" },
      { code: "K29.6", desc: "other gastritis" },
    ],
  },
  {
    category: "G43",
    desc: "Migraine",
    specificCodes: [
      { code: "G43.0", desc: "without aura" },
      { code: "G43.1", desc: "with aura" },
      { code: "G43.2", desc: "status migrainosus" },
      { code: "G43.3", desc: "complicated migraine" },
      { code: "G43.8", desc: "other migraine" },
    ],
  },
  {
    category: "M54",
    desc: "Dorsalgia/back pain",
    specificCodes: [
      { code: "M54.0", desc: "panniculitis of neck/back" },
      { code: "M54.1", desc: "radiculopathy" },
      { code: "M54.2", desc: "cervicalgia" },
      { code: "M54.3", desc: "sciatica" },
      { code: "M54.4", desc: "lumbago with sciatica" },
      { code: "M54.5", desc: "low back pain" },
      { code: "M54.6", desc: "pain in thoracic spine" },
      { code: "M54.8", desc: "other dorsalgia" },
    ],
  },
  {
    category: "L50",
    desc: "Urticaria",
    specificCodes: [
      { code: "L50.0", desc: "allergic urticaria" },
      { code: "L50.1", desc: "idiopathic urticaria" },
      { code: "L50.2", desc: "urticaria due to cold/heat" },
      { code: "L50.3", desc: "dermatographic urticaria" },
      { code: "L50.4", desc: "vibratory urticaria" },
      { code: "L50.5", desc: "cholinergic urticaria" },
      { code: "L50.6", desc: "contact urticaria" },
      { code: "L50.8", desc: "other urticaria" },
    ],
  },
  {
    category: "N20",
    desc: "Calculus of kidney and ureter",
    specificCodes: [
      { code: "N20.0", desc: "calculus of kidney" },
      { code: "N20.1", desc: "calculus of ureter" },
      { code: "N20.2", desc: "calculus of kidney with ureter" },
    ],
  },
  {
    category: "K70",
    desc: "Alcoholic liver disease",
    specificCodes: [
      { code: "K70.0", desc: "alcoholic fatty liver" },
      { code: "K70.1", desc: "alcoholic hepatitis" },
      { code: "K70.2", desc: "alcoholic fibrosis/sclerosis" },
      { code: "K70.3", desc: "alcoholic cirrhosis" },
      { code: "K70.4", desc: "alcoholic hepatic failure" },
    ],
  },
  {
    category: "F32",
    desc: "Depressive episode",
    specificCodes: [
      { code: "F32.0", desc: "mild depressive episode" },
      { code: "F32.1", desc: "moderate depressive episode" },
      { code: "F32.2", desc: "severe without psychotic features" },
      { code: "F32.3", desc: "severe with psychotic features" },
      { code: "F32.8", desc: "other depressive episodes" },
    ],
  },
  {
    category: "J06",
    desc: "Acute URTI",
    specificCodes: [
      { code: "J06.0", desc: "acute laryngopharyngitis" },
      { code: "J06.8", desc: "other acute URTI of multiple sites" },
    ],
  },
  {
    category: "J20",
    desc: "Acute bronchitis",
    specificCodes: [
      { code: "J20.0", desc: "due to Mycoplasma pneumoniae" },
      { code: "J20.1", desc: "due to Haemophilus influenzae" },
      { code: "J20.2", desc: "due to streptococcus" },
      { code: "J20.5", desc: "due to RSV" },
      { code: "J20.8", desc: "due to other organisms" },
    ],
  },
  {
    category: "I10",
    desc: "Essential hypertension — note: I10 has no subcodes",
    specificCodes: [], // I10 is a single code, skip
  },
  {
    category: "N18",
    desc: "Chronic kidney disease",
    specificCodes: [
      { code: "N18.1", desc: "CKD stage 1" },
      { code: "N18.2", desc: "CKD stage 2" },
      { code: "N18.3", desc: "CKD stage 3" },
      { code: "N18.4", desc: "CKD stage 4" },
      { code: "N18.5", desc: "CKD stage 5" },
    ],
  },
  {
    category: "E10",
    desc: "Type 1 diabetes",
    specificCodes: [
      { code: "E10.0", desc: "with coma" },
      { code: "E10.1", desc: "with ketoacidosis" },
      { code: "E10.2", desc: "with renal complications" },
      { code: "E10.3", desc: "with ophthalmic complications" },
      { code: "E10.4", desc: "with neurological complications" },
      { code: "E10.5", desc: "with peripheral circulatory complications" },
      { code: "E10.6", desc: "with other specified complications" },
      { code: "E10.7", desc: "with multiple complications" },
    ],
  },
  {
    category: "I48",
    desc: "Atrial fibrillation and flutter",
    specificCodes: [
      { code: "I48.0", desc: "paroxysmal atrial fibrillation" },
      { code: "I48.1", desc: "persistent atrial fibrillation" },
      { code: "I48.2", desc: "chronic atrial fibrillation" },
      { code: "I48.3", desc: "typical atrial flutter" },
      { code: "I48.4", desc: "atypical atrial flutter" },
    ],
  },
  {
    category: "D50",
    desc: "Iron deficiency anaemia",
    specificCodes: [
      { code: "D50.0", desc: "due to blood loss" },
      { code: "D50.1", desc: "sideropenic dysphagia" },
      { code: "D50.8", desc: "other iron deficiency anaemias" },
    ],
  },
  {
    category: "M17",
    desc: "Gonarthrosis/knee osteoarthritis",
    specificCodes: [
      { code: "M17.0", desc: "primary bilateral" },
      { code: "M17.1", desc: "primary unilateral" },
      { code: "M17.2", desc: "post-traumatic bilateral" },
      { code: "M17.3", desc: "post-traumatic unilateral" },
      { code: "M17.4", desc: "other secondary bilateral" },
      { code: "M17.5", desc: "other secondary unilateral" },
    ],
  },
  {
    category: "M16",
    desc: "Coxarthrosis/hip osteoarthritis",
    specificCodes: [
      { code: "M16.0", desc: "primary bilateral" },
      { code: "M16.1", desc: "primary unilateral" },
      { code: "M16.2", desc: "due to dysplasia bilateral" },
      { code: "M16.3", desc: "due to dysplasia unilateral" },
      { code: "M16.4", desc: "post-traumatic bilateral" },
      { code: "M16.5", desc: "post-traumatic unilateral" },
      { code: "M16.6", desc: "other secondary bilateral" },
      { code: "M16.7", desc: "other secondary unilateral" },
    ],
  },
  {
    category: "I63",
    desc: "Cerebral infarction",
    specificCodes: [
      { code: "I63.0", desc: "due to thrombosis of precerebral arteries" },
      { code: "I63.1", desc: "due to embolism of precerebral arteries" },
      { code: "I63.2", desc: "due to unspecified occlusion of precerebral arteries" },
      { code: "I63.3", desc: "due to thrombosis of cerebral arteries" },
      { code: "I63.4", desc: "due to embolism of cerebral arteries" },
      { code: "I63.5", desc: "due to unspecified occlusion of cerebral arteries" },
      { code: "I63.8", desc: "other cerebral infarction" },
    ],
  },
  {
    category: "K25",
    desc: "Gastric ulcer",
    specificCodes: [
      { code: "K25.0", desc: "acute with haemorrhage" },
      { code: "K25.1", desc: "acute with perforation" },
      { code: "K25.2", desc: "acute with haemorrhage and perforation" },
      { code: "K25.3", desc: "acute without haemorrhage or perforation" },
      { code: "K25.4", desc: "chronic with haemorrhage" },
      { code: "K25.5", desc: "chronic with perforation" },
      { code: "K25.7", desc: "chronic without haemorrhage or perforation" },
    ],
  },
  {
    category: "B18",
    desc: "Chronic viral hepatitis",
    specificCodes: [
      { code: "B18.0", desc: "chronic hepatitis B with delta-agent" },
      { code: "B18.1", desc: "chronic hepatitis B without delta-agent" },
      { code: "B18.2", desc: "chronic hepatitis C" },
      { code: "B18.8", desc: "other chronic viral hepatitis" },
    ],
  },
  {
    category: "C50",
    desc: "Breast cancer",
    specificCodes: [
      { code: "C50.0", desc: "nipple and areola" },
      { code: "C50.1", desc: "central portion" },
      { code: "C50.2", desc: "upper-inner quadrant" },
      { code: "C50.3", desc: "lower-inner quadrant" },
      { code: "C50.4", desc: "upper-outer quadrant" },
      { code: "C50.5", desc: "lower-outer quadrant" },
      { code: "C50.6", desc: "axillary tail" },
      { code: "C50.8", desc: "overlapping lesion" },
    ],
  },
  {
    category: "K81",
    desc: "Cholecystitis",
    specificCodes: [
      { code: "K81.0", desc: "acute cholecystitis" },
      { code: "K81.1", desc: "chronic cholecystitis" },
      { code: "K81.8", desc: "other cholecystitis" },
    ],
  },
  {
    category: "H25",
    desc: "Senile cataract",
    specificCodes: [
      { code: "H25.0", desc: "senile incipient cataract" },
      { code: "H25.1", desc: "senile nuclear cataract" },
      { code: "H25.2", desc: "senile cataract, morgagnian type" },
      { code: "H25.8", desc: "other senile cataract" },
    ],
  },
  {
    category: "I25",
    desc: "Chronic ischaemic heart disease",
    specificCodes: [
      { code: "I25.0", desc: "atherosclerotic cardiovascular disease" },
      { code: "I25.1", desc: "atherosclerotic heart disease" },
      { code: "I25.2", desc: "old myocardial infarction" },
      { code: "I25.5", desc: "ischaemic cardiomyopathy" },
      { code: "I25.6", desc: "silent myocardial ischaemia" },
      { code: "I25.8", desc: "other chronic IHD" },
    ],
  },
  {
    category: "H40",
    desc: "Glaucoma",
    specificCodes: [
      { code: "H40.0", desc: "glaucoma suspect" },
      { code: "H40.1", desc: "primary open-angle glaucoma" },
      { code: "H40.2", desc: "primary angle-closure glaucoma" },
      { code: "H40.3", desc: "secondary to eye trauma" },
      { code: "H40.4", desc: "secondary to eye inflammation" },
      { code: "H40.5", desc: "secondary to other eye disorders" },
      { code: "H40.6", desc: "secondary to drugs" },
    ],
  },
  {
    category: "J44",
    desc: "COPD",
    specificCodes: [
      { code: "J44.0", desc: "with acute lower respiratory infection" },
      { code: "J44.1", desc: "with acute exacerbation" },
      { code: "J44.8", desc: "other specified COPD" },
    ],
  },
  {
    category: "E78",
    desc: "Disorders of lipoprotein metabolism",
    specificCodes: [
      { code: "E78.0", desc: "pure hypercholesterolaemia" },
      { code: "E78.1", desc: "pure hypertriglyceridaemia" },
      { code: "E78.2", desc: "mixed hyperlipidaemia" },
      { code: "E78.3", desc: "hyperchylomicronaemia" },
      { code: "E78.4", desc: "other hyperlipidaemia" },
      { code: "E78.5", desc: "hyperlipidaemia unspecified" },
    ],
  },
  {
    category: "N80",
    desc: "Endometriosis",
    specificCodes: [
      { code: "N80.0", desc: "of uterus" },
      { code: "N80.1", desc: "of ovary" },
      { code: "N80.2", desc: "of fallopian tube" },
      { code: "N80.3", desc: "of pelvic peritoneum" },
      { code: "N80.4", desc: "of rectovaginal septum" },
      { code: "N80.5", desc: "of intestine" },
      { code: "N80.8", desc: "other endometriosis" },
    ],
  },
  {
    category: "L40",
    desc: "Psoriasis",
    specificCodes: [
      { code: "L40.0", desc: "psoriasis vulgaris" },
      { code: "L40.1", desc: "generalized pustular psoriasis" },
      { code: "L40.2", desc: "acrodermatitis continua" },
      { code: "L40.3", desc: "pustulosis palmaris et plantaris" },
      { code: "L40.4", desc: "guttate psoriasis" },
      { code: "L40.5", desc: "arthropathic psoriasis" },
      { code: "L40.8", desc: "other psoriasis" },
    ],
  },
];

function generateSpecificVsUnspecifiedRules(): DynamicViolation[] {
  const rules: DynamicViolation[] = [];

  for (const cat of SPECIFIC_UNSPECIFIED_CATEGORIES) {
    if (cat.specificCodes.length === 0) continue;

    const unspecified = `${cat.category}.9`;

    for (const specific of cat.specificCodes) {
      rules.push({
        code1: specific.code,
        code2: unspecified,
        type: "mutually_exclusive",
        reason: `${cat.desc} — specific code ${specific.code} (${specific.desc}) and unspecified code ${unspecified} should not both appear. If the specific subtype is known, use only the specific code. The unspecified code is for cases where the subtype cannot be determined.`,
        source: "WHO ICD-10 coding conventions; BHF specificity rules; CMS adjudication guidelines",
        category: "specificity_conflict",
        generated: true,
        generator: "specific_vs_unspecified",
      });
    }
  }

  return rules;
}

// ─── Generator 3: Discipline–Diagnosis Validation (~1,500 rules) ────────────
// Cross-references tariff discipline restrictions with ICD-10 chapter ranges.
// Flags procedures billed with diagnoses outside their valid chapter range.

/** Discipline-to-expected-ICD-10 mappings for common specialties */
const DISCIPLINE_DIAGNOSIS_MAP: {
  discipline: string;
  tariffPrefixes: string[];
  tariffDesc: string;
  invalidChapters: { prefix: string; desc: string }[];
}[] = [
  {
    discipline: "ophthalmology",
    tariffPrefixes: ["2200", "2210", "2220", "2230", "2240", "2250"],
    tariffDesc: "ophthalmology procedures",
    invalidChapters: [
      { prefix: "K", desc: "digestive system" },
      { prefix: "M", desc: "musculoskeletal (non-orbital)" },
      { prefix: "N", desc: "genitourinary" },
      { prefix: "J", desc: "respiratory" },
      { prefix: "L", desc: "skin/subcutaneous" },
      { prefix: "O", desc: "pregnancy/obstetric" },
    ],
  },
  {
    discipline: "ent",
    tariffPrefixes: ["2300", "2301", "2302", "2310", "2311", "2312", "2320", "2330", "2331", "2340"],
    tariffDesc: "ENT procedures",
    invalidChapters: [
      { prefix: "H0", desc: "eye diseases (H00-H59)" },
      { prefix: "N", desc: "genitourinary" },
      { prefix: "M", desc: "musculoskeletal" },
      { prefix: "O", desc: "pregnancy/obstetric" },
      { prefix: "L", desc: "skin/subcutaneous" },
    ],
  },
  {
    discipline: "cardiology",
    tariffPrefixes: ["0900", "0901", "0910", "0920", "0930", "0310", "0312", "0315"],
    tariffDesc: "cardiology/cardiothoracic procedures",
    invalidChapters: [
      { prefix: "H0", desc: "eye diseases" },
      { prefix: "H6", desc: "ear diseases" },
      { prefix: "K0", desc: "dental/oral diseases" },
      { prefix: "L", desc: "skin diseases" },
      { prefix: "N7", desc: "female genital diseases" },
      { prefix: "N8", desc: "female genital diseases" },
      { prefix: "N9", desc: "female genital diseases" },
    ],
  },
  {
    discipline: "orthopaedics",
    tariffPrefixes: ["0750", "0760", "0770", "0780", "0785", "0800", "0801", "0802", "0803", "0804", "0810", "0811", "0820", "0821", "0825", "0826"],
    tariffDesc: "orthopaedic procedures",
    invalidChapters: [
      { prefix: "F", desc: "mental/behavioural disorders" },
      { prefix: "H0", desc: "eye diseases" },
      { prefix: "H6", desc: "ear diseases" },
      { prefix: "K0", desc: "dental/oral diseases" },
      { prefix: "N7", desc: "female genital diseases" },
      { prefix: "N8", desc: "female genital diseases" },
      { prefix: "O", desc: "pregnancy/obstetric" },
    ],
  },
  {
    discipline: "gynaecology",
    tariffPrefixes: ["1500", "1501", "1510", "1520", "1521", "1600", "1601", "1602", "1603"],
    tariffDesc: "gynaecology procedures",
    invalidChapters: [
      { prefix: "H0", desc: "eye diseases" },
      { prefix: "H6", desc: "ear diseases" },
      { prefix: "J", desc: "respiratory diseases" },
      { prefix: "M", desc: "musculoskeletal diseases" },
      { prefix: "N4", desc: "male genital diseases" },
    ],
  },
  {
    discipline: "urology",
    tariffPrefixes: ["1400", "1410", "1420", "1430", "1440", "1450", "1300", "1301", "1302"],
    tariffDesc: "urology procedures",
    invalidChapters: [
      { prefix: "H0", desc: "eye diseases" },
      { prefix: "H6", desc: "ear diseases" },
      { prefix: "J", desc: "respiratory diseases" },
      { prefix: "K0", desc: "dental/oral diseases" },
      { prefix: "F", desc: "mental/behavioural disorders" },
      { prefix: "O", desc: "pregnancy/obstetric" },
    ],
  },
  {
    discipline: "dental",
    tariffPrefixes: ["8101", "8102", "8103", "8155", "8156", "8160", "8165", "8170", "8180", "8185", "8201", "8202", "8203", "8204", "8230", "8250", "8300", "8400", "8500", "8601", "8602"],
    tariffDesc: "dental procedures",
    invalidChapters: [
      { prefix: "H0", desc: "eye diseases" },
      { prefix: "H6", desc: "ear diseases" },
      { prefix: "I", desc: "circulatory diseases" },
      { prefix: "J", desc: "respiratory diseases" },
      { prefix: "M", desc: "musculoskeletal diseases" },
      { prefix: "N", desc: "genitourinary diseases" },
      { prefix: "O", desc: "pregnancy/obstetric" },
      { prefix: "F", desc: "mental/behavioural disorders" },
      { prefix: "E", desc: "endocrine/metabolic diseases" },
    ],
  },
  {
    discipline: "psychiatry",
    tariffPrefixes: ["0181", "0182", "0183", "0185", "0186"],
    tariffDesc: "psychiatry procedures",
    invalidChapters: [
      { prefix: "S", desc: "injury (without mental health co-morbidity)" },
      { prefix: "K", desc: "digestive diseases" },
      { prefix: "H0", desc: "eye diseases" },
      { prefix: "H6", desc: "ear diseases" },
      { prefix: "L", desc: "skin diseases" },
      { prefix: "M", desc: "musculoskeletal diseases" },
      { prefix: "N", desc: "genitourinary diseases" },
    ],
  },
  {
    discipline: "neurosurgery",
    tariffPrefixes: ["1800", "1801", "1810", "1820", "1821", "1830", "1831", "1840", "1850"],
    tariffDesc: "neurosurgery procedures",
    invalidChapters: [
      { prefix: "K", desc: "digestive diseases" },
      { prefix: "H6", desc: "ear diseases" },
      { prefix: "L", desc: "skin diseases" },
      { prefix: "N7", desc: "female genital diseases" },
      { prefix: "N8", desc: "female genital diseases" },
      { prefix: "O", desc: "pregnancy/obstetric" },
      { prefix: "K0", desc: "dental/oral diseases" },
    ],
  },
  {
    discipline: "plastic_surgery",
    tariffPrefixes: ["0710", "0711", "0712", "0715", "0720", "0725", "0730"],
    tariffDesc: "plastic/reconstructive surgery",
    invalidChapters: [
      { prefix: "F", desc: "mental/behavioural disorders" },
      { prefix: "H6", desc: "ear diseases (unless pinnaplasty)" },
      { prefix: "K", desc: "digestive diseases" },
      { prefix: "N", desc: "genitourinary diseases" },
      { prefix: "O", desc: "pregnancy/obstetric" },
    ],
  },
  {
    discipline: "vascular_surgery",
    tariffPrefixes: ["1050", "1051", "1060", "1061", "1070", "1071", "1080"],
    tariffDesc: "vascular surgery procedures",
    invalidChapters: [
      { prefix: "F", desc: "mental/behavioural disorders" },
      { prefix: "H0", desc: "eye diseases" },
      { prefix: "H6", desc: "ear diseases" },
      { prefix: "K0", desc: "dental/oral diseases" },
      { prefix: "L", desc: "skin diseases" },
      { prefix: "O", desc: "pregnancy/obstetric" },
    ],
  },
  {
    discipline: "gastroenterology_procedural",
    tariffPrefixes: ["1200", "1201", "1202", "1203", "1204", "1210", "1211", "1212", "1213", "1214", "1250", "1260"],
    tariffDesc: "GI endoscopy procedures",
    invalidChapters: [
      { prefix: "H0", desc: "eye diseases" },
      { prefix: "H6", desc: "ear diseases" },
      { prefix: "M", desc: "musculoskeletal diseases" },
      { prefix: "N7", desc: "female genital diseases" },
      { prefix: "N8", desc: "female genital diseases" },
      { prefix: "L", desc: "skin diseases" },
      { prefix: "F", desc: "mental/behavioural disorders" },
    ],
  },
  {
    discipline: "dermatology_procedural",
    tariffPrefixes: ["0550", "0551", "0552", "0560", "0565", "0570"],
    tariffDesc: "dermatology/skin procedures",
    invalidChapters: [
      { prefix: "H0", desc: "eye diseases" },
      { prefix: "H6", desc: "ear diseases" },
      { prefix: "K", desc: "digestive diseases" },
      { prefix: "N", desc: "genitourinary diseases" },
      { prefix: "O", desc: "pregnancy/obstetric" },
      { prefix: "F", desc: "mental/behavioural disorders" },
    ],
  },
  {
    discipline: "radiology_interventional",
    tariffPrefixes: ["3850", "3851", "3852", "3853", "3860", "3870"],
    tariffDesc: "interventional radiology procedures",
    invalidChapters: [
      { prefix: "F", desc: "mental/behavioural disorders" },
      { prefix: "K0", desc: "dental/oral diseases" },
      { prefix: "O", desc: "pregnancy/obstetric" },
    ],
  },
  {
    discipline: "anaesthesia_standalone",
    tariffPrefixes: ["0420", "0421", "0422", "0423", "0424", "0425", "0430", "0431", "0432", "0433"],
    tariffDesc: "anaesthesia services",
    invalidChapters: [
      { prefix: "K0", desc: "dental/oral diseases (unless dental GA)" },
      { prefix: "F", desc: "mental/behavioural disorders" },
    ],
  },
];

/** Common ICD-10 codes per invalid chapter prefix for generating specific pairs */
const CHAPTER_SAMPLE_CODES: Record<string, { code: string; desc: string }[]> = {
  K: [
    { code: "K29.7", desc: "gastritis unspecified" },
    { code: "K80.2", desc: "gallstones without cholecystitis" },
    { code: "K21.0", desc: "GORD with oesophagitis" },
    { code: "K57.3", desc: "diverticular disease of large intestine" },
    { code: "K50.9", desc: "Crohn's disease unspecified" },
    { code: "K51.9", desc: "ulcerative colitis unspecified" },
    { code: "K40.9", desc: "inguinal hernia unspecified" },
  ],
  M: [
    { code: "M54.5", desc: "low back pain" },
    { code: "M17.9", desc: "gonarthrosis unspecified" },
    { code: "M79.3", desc: "panniculitis" },
    { code: "M75.1", desc: "rotator cuff syndrome" },
    { code: "M16.9", desc: "coxarthrosis unspecified" },
    { code: "M25.5", desc: "pain in joint" },
    { code: "M10.9", desc: "gout unspecified" },
  ],
  N: [
    { code: "N39.0", desc: "urinary tract infection" },
    { code: "N40", desc: "benign prostatic hyperplasia" },
    { code: "N83", desc: "ovarian cyst" },
    { code: "N20.0", desc: "calculus of kidney" },
    { code: "N18.9", desc: "chronic kidney disease unspecified" },
  ],
  J: [
    { code: "J06.9", desc: "acute URTI unspecified" },
    { code: "J18.9", desc: "pneumonia unspecified" },
    { code: "J44.1", desc: "COPD with acute exacerbation" },
    { code: "J45.9", desc: "asthma unspecified" },
    { code: "J01.9", desc: "acute sinusitis unspecified" },
    { code: "J20.9", desc: "acute bronchitis unspecified" },
  ],
  L: [
    { code: "L30.9", desc: "dermatitis unspecified" },
    { code: "L50.9", desc: "urticaria unspecified" },
    { code: "L40.0", desc: "psoriasis vulgaris" },
    { code: "L02.9", desc: "cutaneous abscess unspecified" },
    { code: "L70.0", desc: "acne vulgaris" },
  ],
  O: [
    { code: "O80", desc: "single spontaneous delivery" },
    { code: "O00", desc: "ectopic pregnancy" },
    { code: "O26.9", desc: "pregnancy-related condition unspecified" },
    { code: "O47.0", desc: "false labour before 37 weeks" },
  ],
  F: [
    { code: "F32.9", desc: "depressive episode unspecified" },
    { code: "F41.9", desc: "anxiety disorder unspecified" },
    { code: "F10.2", desc: "alcohol dependence syndrome" },
    { code: "F20.9", desc: "schizophrenia unspecified" },
    { code: "F31.9", desc: "bipolar disorder unspecified" },
    { code: "F43.1", desc: "post-traumatic stress disorder" },
  ],
  E: [
    { code: "E11.9", desc: "type 2 diabetes unspecified" },
    { code: "E05.9", desc: "thyrotoxicosis unspecified" },
    { code: "E78.0", desc: "pure hypercholesterolaemia" },
    { code: "E66.9", desc: "obesity unspecified" },
    { code: "E03.9", desc: "hypothyroidism unspecified" },
    { code: "E10.9", desc: "type 1 diabetes unspecified" },
  ],
  I: [
    { code: "I10", desc: "essential hypertension" },
    { code: "I50.9", desc: "heart failure unspecified" },
    { code: "I25.9", desc: "chronic IHD unspecified" },
    { code: "I48.9", desc: "atrial fibrillation unspecified" },
    { code: "I63.9", desc: "cerebral infarction unspecified" },
    { code: "I73.9", desc: "peripheral vascular disease unspecified" },
  ],
  S: [
    { code: "S52.5", desc: "fracture of lower end of radius" },
    { code: "S72.0", desc: "fracture of neck of femur" },
    { code: "S42.0", desc: "fracture of clavicle" },
    { code: "S82.0", desc: "fracture of patella" },
    { code: "S83.5", desc: "sprain of cruciate ligament of knee" },
    { code: "S62.5", desc: "fracture of thumb" },
  ],
  T: [
    { code: "T78.4", desc: "allergy unspecified" },
    { code: "T14.0", desc: "superficial injury of unspecified region" },
    { code: "T81.0", desc: "haemorrhage complicating a procedure" },
  ],
  A: [
    { code: "A09.9", desc: "gastroenteritis unspecified" },
    { code: "A49.9", desc: "bacterial infection unspecified" },
    { code: "A69.2", desc: "Lyme disease" },
  ],
  B: [
    { code: "B34.9", desc: "viral infection unspecified" },
    { code: "B37.9", desc: "candidiasis unspecified" },
    { code: "B20", desc: "HIV disease" },
  ],
  C: [
    { code: "C50.9", desc: "breast cancer unspecified" },
    { code: "C34.9", desc: "lung cancer unspecified" },
    { code: "C18.9", desc: "colon cancer unspecified" },
    { code: "C61", desc: "prostate cancer" },
    { code: "C73", desc: "thyroid cancer" },
  ],
  D: [
    { code: "D50.9", desc: "iron deficiency anaemia unspecified" },
    { code: "D64.9", desc: "anaemia unspecified" },
    { code: "D25.9", desc: "leiomyoma of uterus unspecified" },
  ],
  G: [
    { code: "G43.9", desc: "migraine unspecified" },
    { code: "G40.9", desc: "epilepsy unspecified" },
    { code: "G47.3", desc: "sleep apnoea" },
    { code: "G35", desc: "multiple sclerosis" },
  ],
  R: [
    { code: "R50.9", desc: "fever unspecified" },
    { code: "R10.4", desc: "other abdominal pain" },
    { code: "R51", desc: "headache" },
    { code: "R05", desc: "cough" },
  ],
  Z: [
    { code: "Z00.0", desc: "general medical examination" },
    { code: "Z01.0", desc: "examination of eyes" },
    { code: "Z30.0", desc: "general counselling on contraception" },
  ],
  "H0": [
    { code: "H10.9", desc: "conjunctivitis unspecified" },
    { code: "H25.9", desc: "senile cataract unspecified" },
    { code: "H40.9", desc: "glaucoma unspecified" },
    { code: "H52.1", desc: "myopia" },
    { code: "H04.1", desc: "lacrimal gland disorder" },
  ],
  "H6": [
    { code: "H65.9", desc: "otitis media unspecified" },
    { code: "H66.9", desc: "suppurative otitis media unspecified" },
    { code: "H61.2", desc: "impacted cerumen" },
    { code: "H91.9", desc: "hearing loss unspecified" },
  ],
  "K0": [
    { code: "K02.9", desc: "dental caries unspecified" },
    { code: "K04.0", desc: "pulpitis" },
    { code: "K05.1", desc: "chronic gingivitis" },
    { code: "K08.1", desc: "loss of teeth due to extraction" },
    { code: "K12.0", desc: "recurrent oral aphthae" },
  ],
  "N4": [
    { code: "N40", desc: "BPH" },
    { code: "N41", desc: "prostatitis" },
    { code: "N45", desc: "orchitis/epididymitis" },
    { code: "N43", desc: "hydrocele/spermatocele" },
  ],
  "N7": [
    { code: "N70", desc: "salpingitis/oophoritis" },
    { code: "N71", desc: "inflammatory disease of uterus" },
    { code: "N73", desc: "other female pelvic inflammatory diseases" },
  ],
  "N8": [
    { code: "N80", desc: "endometriosis" },
    { code: "N83", desc: "ovarian cyst" },
    { code: "N84", desc: "polyp of female genital tract" },
    { code: "N85", desc: "uterine disorders" },
  ],
  "N9": [
    { code: "N91", desc: "absent menstruation" },
    { code: "N92", desc: "excessive menstruation" },
    { code: "N95", desc: "menopausal disorders" },
    { code: "N97", desc: "female infertility" },
  ],
};

function generateDisciplineDiagnosisRules(): DynamicViolation[] {
  const rules: DynamicViolation[] = [];

  for (const mapping of DISCIPLINE_DIAGNOSIS_MAP) {
    for (const tariffCode of mapping.tariffPrefixes) {
      for (const invalidChapter of mapping.invalidChapters) {
        const sampleCodes = CHAPTER_SAMPLE_CODES[invalidChapter.prefix] || [];
        for (const sample of sampleCodes) {
          rules.push({
            code1: tariffCode,
            code2: sample.code,
            type: "never_together",
            reason: `${mapping.tariffDesc} (tariff ${tariffCode}) billed with ${sample.desc} (${sample.code}) as primary diagnosis — ${invalidChapter.desc} diagnoses are outside the expected clinical scope for ${mapping.discipline}. Requires a diagnosis within the relevant organ system.`,
            source: "CCSA v11 discipline-diagnosis validation; BHF clinical appropriateness rules; scheme clinical edits",
            category: "discipline_mismatch",
            generated: true,
            generator: "discipline_diagnosis",
          });
        }
      }
    }
  }

  return rules;
}

// ─── Generator 4: Consultation Hierarchy (~100 rules) ───────────────────────
// Generates all permutations of consultation level conflicts for specialty
// consultation codes not covered in the static rules.

const SPECIALTY_CONSULTS: {
  specialty: string;
  codes: { code: string; level: string }[];
}[] = [
  {
    specialty: "dermatology",
    codes: [
      { code: "0171", level: "initial" },
      { code: "0172", level: "follow-up" },
      { code: "0173", level: "extended" },
    ],
  },
  {
    specialty: "neurology",
    codes: [
      { code: "0174", level: "initial" },
      { code: "0175", level: "follow-up" },
      { code: "0176", level: "extended" },
    ],
  },
  {
    specialty: "pulmonology",
    codes: [
      { code: "0177", level: "initial" },
      { code: "0178", level: "follow-up" },
      { code: "0179", level: "extended" },
    ],
  },
  {
    specialty: "rheumatology",
    codes: [
      { code: "0231", level: "initial" },
      { code: "0232", level: "follow-up" },
      { code: "0233", level: "extended" },
    ],
  },
  {
    specialty: "endocrinology",
    codes: [
      { code: "0234", level: "initial" },
      { code: "0235", level: "follow-up" },
      { code: "0236", level: "extended" },
    ],
  },
  {
    specialty: "nephrology",
    codes: [
      { code: "0237", level: "initial" },
      { code: "0238", level: "follow-up" },
      { code: "0239", level: "extended" },
    ],
  },
  {
    specialty: "gastroenterology",
    codes: [
      { code: "0241", level: "initial" },
      { code: "0242", level: "follow-up" },
      { code: "0243", level: "extended" },
    ],
  },
  {
    specialty: "oncology",
    codes: [
      { code: "0244", level: "initial" },
      { code: "0245", level: "follow-up" },
      { code: "0246", level: "extended" },
    ],
  },
  {
    specialty: "haematology",
    codes: [
      { code: "0247", level: "initial" },
      { code: "0248", level: "follow-up" },
      { code: "0249", level: "extended" },
    ],
  },
  {
    specialty: "infectious_disease",
    codes: [
      { code: "0251", level: "initial" },
      { code: "0252", level: "follow-up" },
      { code: "0253", level: "extended" },
    ],
  },
];

function generateConsultationHierarchyRules(): DynamicViolation[] {
  const rules: DynamicViolation[] = [];

  for (const spec of SPECIALTY_CONSULTS) {
    const codes = spec.codes;
    for (let i = 0; i < codes.length; i++) {
      for (let j = i + 1; j < codes.length; j++) {
        rules.push({
          code1: codes[i].code,
          code2: codes[j].code,
          type: "never_together",
          reason: `${spec.specialty} ${codes[i].level} consultation (${codes[i].code}) and ${codes[j].level} consultation (${codes[j].code}) on the same day by same provider — bill the highest applicable level only.`,
          source: "CCSA v11 consultation rules; HPCSA tariff guidelines",
          category: "consultation_overlap",
          generated: true,
          generator: "consultation_hierarchy",
        });
      }
    }

    // Cross with GP consultation
    for (const code of codes) {
      rules.push({
        code1: "0190",
        code2: code.code,
        type: "never_together",
        reason: `GP consultation (0190) and ${spec.specialty} ${code.level} consultation (${code.code}) by the same provider on the same day — cannot practise as both GP and ${spec.specialty} specialist simultaneously.`,
        source: "CCSA v11 consultation rules; HPCSA scope of practice",
        category: "consultation_overlap",
        generated: true,
        generator: "consultation_hierarchy",
      });
    }
  }

  return rules;
}

// ─── Generator 5: Panel–Component from Tariff DB (~200 rules) ───────────────
// Uses the UNBUNDLING_RULES from tariff-database.ts to generate code-pair
// violations, avoiding duplicates with static rules.

function generatePanelComponentRules(): DynamicViolation[] {
  // This generator creates rules from tariff entries where one code's
  // description indicates it's a "panel" or "profile" and another code
  // is a known component.
  const rules: DynamicViolation[] = [];

  // Panel codes and their known component patterns
  const panelPatterns: { panel: string; panelDesc: string; components: string[] }[] = [
    // Metabolic panel components
    { panel: "4040", panelDesc: "Metabolic panel", components: ["4041", "4042", "4043", "4044", "4045", "4046", "4047", "4050"] },
    // Renal function
    { panel: "4044", panelDesc: "Renal function (eGFR+creatinine)", components: ["4043"] },
    // Coagulation comprehensive
    { panel: "4028", panelDesc: "Comprehensive coagulation panel", components: ["4021", "4022", "4023", "4024", "4025", "4026", "4027"] },
    // Infection screen
    { panel: "4215", panelDesc: "HIV screening panel", components: ["4213", "4214"] },
    // Antenatal screen
    { panel: "4290", panelDesc: "Antenatal screening panel", components: ["4014", "4042", "4044", "4050", "4201", "4205", "4210", "4270", "4285"] },
    // Pre-operative screen
    { panel: "4295", panelDesc: "Pre-operative screening panel", components: ["4014", "4042", "4021", "4050", "3601"] },
    // Metabolic bone
    { panel: "4079", panelDesc: "Metabolic bone panel", components: ["4075", "4076", "4077", "4078", "4067"] },
    // Comprehensive metabolic
    { panel: "4048", panelDesc: "Comprehensive metabolic panel", components: ["4042", "4043", "4044", "4045", "4046", "4047", "4050", "4064", "4068"] },
  ];

  for (const panel of panelPatterns) {
    for (const comp of panel.components) {
      rules.push({
        code1: panel.panel,
        code2: comp,
        type: "component_of",
        reason: `${panel.panelDesc} (${panel.panel}) includes component test ${comp} — do not bill the component separately when the comprehensive panel is ordered.`,
        source: "CCSA v11 pathology bundling; NHLS panel definitions; scheme pathology rules",
        category: "panel_component",
        generated: true,
        generator: "panel_component",
      });
    }
  }

  return rules;
}

// ─── Generator 6: Contrast/Modality Variants (~200 rules) ──────────────────
// For imaging codes, generates without/with/combined contrast conflicts
// and cross-modality same-region rules.

function generateContrastModalityRules(): DynamicViolation[] {
  const rules: DynamicViolation[] = [];

  // Same-region, different modality combinations that need review
  const crossModalityPairs: {
    code1: string; desc1: string;
    code2: string; desc2: string;
    region: string;
  }[] = [
    // CT + MRI same region same day
    { code1: "3901", desc1: "CT brain", code2: "3951", desc2: "MRI brain", region: "brain" },
    { code1: "3910", desc1: "CT chest", code2: "3976", desc2: "Cardiac MRI", region: "chest" },
    { code1: "3920", desc1: "CT abdomen", code2: "3973", desc2: "MRI abdomen", region: "abdomen" },
    { code1: "3925", desc1: "CT pelvis", code2: "3970", desc2: "MRI pelvis", region: "pelvis" },
    { code1: "3930", desc1: "CT cervical spine", code2: "3955", desc2: "MRI cervical spine", region: "cervical spine" },
    { code1: "3935", desc1: "CT lumbar spine", code2: "3960", desc2: "MRI lumbar spine", region: "lumbar spine" },
    // X-ray + CT same region (CT supersedes)
    { code1: "3601", desc1: "Chest X-ray", code2: "3910", desc2: "CT chest", region: "chest" },
    { code1: "3614", desc1: "Lumbar spine X-ray", code2: "3935", desc2: "CT lumbar spine", region: "lumbar spine" },
    { code1: "3610", desc1: "Cervical spine X-ray", code2: "3930", desc2: "CT cervical spine", region: "cervical spine" },
    { code1: "3650", desc1: "Skull X-ray", code2: "3901", desc2: "CT brain", region: "head" },
    { code1: "3640", desc1: "Knee X-ray", code2: "3965", desc2: "MRI knee", region: "knee" },
    { code1: "3625", desc1: "Shoulder X-ray", code2: "3968", desc2: "MRI shoulder", region: "shoulder" },
    // US + CT/MRI same region
    { code1: "3801", desc1: "Abdominal US", code2: "3920", desc2: "CT abdomen", region: "abdomen" },
    { code1: "3812", desc1: "Pelvic US", code2: "3925", desc2: "CT pelvis", region: "pelvis" },
    { code1: "3812", desc1: "Pelvic US", code2: "3970", desc2: "MRI pelvis", region: "pelvis" },
    { code1: "3845", desc1: "Thyroid US", code2: "3945", desc2: "CT neck", region: "neck" },
    { code1: "3850", desc1: "Breast US", code2: "3975", desc2: "Breast MRI", region: "breast" },
  ];

  for (const pair of crossModalityPairs) {
    rules.push({
      code1: pair.code1,
      code2: pair.code2,
      type: "needs_modifier",
      reason: `${pair.desc1} (${pair.code1}) and ${pair.desc2} (${pair.code2}) are different imaging modalities for the same ${pair.region} region on the same day. While sometimes clinically justified (e.g., US screening then CT for detailed assessment), this combination requires clinical justification and may be flagged for review. Use modifier if both are medically necessary.`,
      source: "CCSA v11 radiology coding; scheme pre-authorization rules; BHF radiology guidelines",
      category: "radiology_component",
      generated: true,
      generator: "contrast_modality",
    });
  }

  // PET-CT includes the CT component
  const petCtRegions = [
    { pet: "3740", ct: "3901", region: "brain" },
    { pet: "3740", ct: "3910", region: "chest" },
    { pet: "3740", ct: "3920", region: "abdomen" },
    { pet: "3740", ct: "3925", region: "pelvis" },
    { pet: "3741", ct: "3901", region: "brain" },
    { pet: "3741", ct: "3910", region: "chest" },
    { pet: "3741", ct: "3920", region: "abdomen" },
    { pet: "3741", ct: "3925", region: "pelvis" },
  ];

  for (const pair of petCtRegions) {
    rules.push({
      code1: pair.pet,
      code2: pair.ct,
      type: "component_of",
      reason: `PET-CT (${pair.pet}) includes the CT component for ${pair.region} — do not bill a separate CT (${pair.ct}) for the same region when PET-CT is performed. The CT in PET-CT is integral to the study.`,
      source: "CCSA v11 nuclear medicine/radiology coding; BHF PET-CT billing rules",
      category: "radiology_component",
      generated: true,
      generator: "contrast_modality",
    });
  }

  return rules;
}

// ─── Generator 7: Acute vs Chronic Conflicts (~200 rules) ──────────────────
// Generates mutually exclusive pairs where the same condition has distinct
// acute and chronic ICD-10 codes that cannot coexist on the same claim.

const ACUTE_CHRONIC_PAIRS: {
  acuteCode: string; acuteDesc: string;
  chronicCode: string; chronicDesc: string;
  condition: string;
}[] = [
  { acuteCode: "J01.0", acuteDesc: "acute maxillary sinusitis", chronicCode: "J32.0", chronicDesc: "chronic maxillary sinusitis", condition: "maxillary sinusitis" },
  { acuteCode: "J01.1", acuteDesc: "acute frontal sinusitis", chronicCode: "J32.1", chronicDesc: "chronic frontal sinusitis", condition: "frontal sinusitis" },
  { acuteCode: "J01.2", acuteDesc: "acute ethmoidal sinusitis", chronicCode: "J32.2", chronicDesc: "chronic ethmoidal sinusitis", condition: "ethmoidal sinusitis" },
  { acuteCode: "J01.3", acuteDesc: "acute sphenoidal sinusitis", chronicCode: "J32.3", chronicDesc: "chronic sphenoidal sinusitis", condition: "sphenoidal sinusitis" },
  { acuteCode: "J01.4", acuteDesc: "acute pansinusitis", chronicCode: "J32.4", chronicDesc: "chronic pansinusitis", condition: "pansinusitis" },
  { acuteCode: "J01.9", acuteDesc: "acute sinusitis unspecified", chronicCode: "J32.9", chronicDesc: "chronic sinusitis unspecified", condition: "sinusitis" },
  { acuteCode: "H65.0", acuteDesc: "acute serous otitis media", chronicCode: "H65.2", chronicDesc: "chronic serous otitis media", condition: "serous otitis media" },
  { acuteCode: "H66.0", acuteDesc: "acute suppurative otitis media", chronicCode: "H66.1", chronicDesc: "chronic tubotympanic OM", condition: "suppurative otitis media" },
  { acuteCode: "K81.0", acuteDesc: "acute cholecystitis", chronicCode: "K81.1", chronicDesc: "chronic cholecystitis", condition: "cholecystitis" },
  { acuteCode: "K85", acuteDesc: "acute pancreatitis", chronicCode: "K86.1", chronicDesc: "chronic pancreatitis", condition: "pancreatitis" },
  { acuteCode: "N10", acuteDesc: "acute pyelonephritis", chronicCode: "N11", chronicDesc: "chronic pyelonephritis", condition: "pyelonephritis" },
  { acuteCode: "N17", acuteDesc: "acute kidney failure", chronicCode: "N18", chronicDesc: "chronic kidney disease", condition: "renal failure" },
  { acuteCode: "I30", acuteDesc: "acute pericarditis", chronicCode: "I31", chronicDesc: "chronic pericarditis", condition: "pericarditis" },
  { acuteCode: "B16", acuteDesc: "acute hepatitis B", chronicCode: "B18.1", chronicDesc: "chronic hepatitis B", condition: "hepatitis B" },
  { acuteCode: "B17.1", acuteDesc: "acute hepatitis C", chronicCode: "B18.2", chronicDesc: "chronic hepatitis C", condition: "hepatitis C" },
  { acuteCode: "K25.0", acuteDesc: "acute gastric ulcer with haemorrhage", chronicCode: "K25.4", chronicDesc: "chronic gastric ulcer with haemorrhage", condition: "gastric ulcer with haemorrhage" },
  { acuteCode: "K25.3", acuteDesc: "acute gastric ulcer without complication", chronicCode: "K25.7", chronicDesc: "chronic gastric ulcer without complication", condition: "gastric ulcer" },
  { acuteCode: "K26.0", acuteDesc: "acute duodenal ulcer with haemorrhage", chronicCode: "K26.4", chronicDesc: "chronic duodenal ulcer with haemorrhage", condition: "duodenal ulcer with haemorrhage" },
  { acuteCode: "K26.3", acuteDesc: "acute duodenal ulcer without complication", chronicCode: "K26.7", chronicDesc: "chronic duodenal ulcer without complication", condition: "duodenal ulcer" },
  { acuteCode: "H10.1", acuteDesc: "acute atopic conjunctivitis", chronicCode: "H10.4", chronicDesc: "chronic conjunctivitis", condition: "conjunctivitis" },
  { acuteCode: "J20.9", acuteDesc: "acute bronchitis", chronicCode: "J42", chronicDesc: "chronic bronchitis", condition: "bronchitis" },
  { acuteCode: "H04.0", acuteDesc: "acute dacryoadenitis", chronicCode: "H04.1", chronicDesc: "chronic dacryoadenitis", condition: "dacryoadenitis" },
  { acuteCode: "M65.0", acuteDesc: "abscess of tendon sheath (acute)", chronicCode: "M65.8", chronicDesc: "other synovitis/tenosynovitis (chronic)", condition: "tenosynovitis" },
  { acuteCode: "N30.0", acuteDesc: "acute cystitis", chronicCode: "N30.1", chronicDesc: "chronic interstitial cystitis", condition: "cystitis" },
  { acuteCode: "N41.0", acuteDesc: "acute prostatitis", chronicCode: "N41.1", chronicDesc: "chronic prostatitis", condition: "prostatitis" },
  { acuteCode: "N70.0", acuteDesc: "acute salpingitis/oophoritis", chronicCode: "N70.1", chronicDesc: "chronic salpingitis/oophoritis", condition: "salpingitis" },
  { acuteCode: "N71.0", acuteDesc: "acute inflammatory disease of uterus", chronicCode: "N71.1", chronicDesc: "chronic inflammatory disease of uterus", condition: "uterine inflammatory disease" },
  { acuteCode: "I01", acuteDesc: "acute rheumatic fever with heart involvement", chronicCode: "I09", chronicDesc: "chronic rheumatic heart disease", condition: "rheumatic heart disease" },
  { acuteCode: "M86.0", acuteDesc: "acute haematogenous osteomyelitis", chronicCode: "M86.3", chronicDesc: "chronic multifocal osteomyelitis", condition: "osteomyelitis" },
  { acuteCode: "L03", acuteDesc: "cellulitis (acute)", chronicCode: "L98.4", chronicDesc: "chronic ulcer of skin", condition: "skin infection/ulcer" },
  { acuteCode: "K35", acuteDesc: "acute appendicitis", chronicCode: "K36", chronicDesc: "other appendicitis (chronic/recurrent)", condition: "appendicitis" },
  { acuteCode: "K65.0", acuteDesc: "acute peritonitis", chronicCode: "K65.8", chronicDesc: "other peritonitis (chronic)", condition: "peritonitis" },
];

function generateAcuteChronicRules(): DynamicViolation[] {
  return ACUTE_CHRONIC_PAIRS.map((pair) => ({
    code1: pair.acuteCode,
    code2: pair.chronicCode,
    type: "mutually_exclusive" as const,
    reason: `Acute ${pair.condition} (${pair.acuteCode}, ${pair.acuteDesc}) and chronic ${pair.condition} (${pair.chronicCode}, ${pair.chronicDesc}) on the same claim — ${pair.condition} is in either an acute or chronic phase at time of encounter, not simultaneously. If acute-on-chronic, code the acute presentation as primary.`,
    source: "WHO ICD-10 coding conventions; CCSA coding standards; BHF adjudication guidelines",
    category: "icd10_exclusion" as const,
    generated: true as const,
    generator: "acute_vs_chronic",
  }));
}


// ─── Generator 8: External Cause Code Requirements (~150 rules) ─────────
// S/T codes (injuries) MUST have an external cause code (V01-Y98) as
// secondary diagnosis. Claims without ECC are auto-rejected at most switches.

const INJURY_CODES: { code: string; desc: string }[] = [
  { code: "S00", desc: "superficial injury of head" },
  { code: "S01", desc: "open wound of head" },
  { code: "S02", desc: "fracture of skull/facial bones" },
  { code: "S06", desc: "intracranial injury" },
  { code: "S09", desc: "other head injuries" },
  { code: "S12", desc: "fracture of cervical vertebra" },
  { code: "S22", desc: "fracture of rib/sternum/thoracic spine" },
  { code: "S32", desc: "fracture of lumbar spine/pelvis" },
  { code: "S42", desc: "fracture of shoulder/upper arm" },
  { code: "S52", desc: "fracture of forearm" },
  { code: "S62", desc: "fracture of wrist/hand" },
  { code: "S72", desc: "fracture of femur" },
  { code: "S82", desc: "fracture of lower leg" },
  { code: "S83", desc: "dislocation/sprain of knee" },
  { code: "S93", desc: "dislocation/sprain of ankle" },
  { code: "T14", desc: "injury of unspecified body region" },
  { code: "T78", desc: "adverse effects not elsewhere classified" },
  { code: "T81", desc: "complications of procedures" },
  { code: "T84", desc: "complications of orthopaedic implants" },
  { code: "T85", desc: "complications of other implants" },
];

const NON_INJURY_CODES_WITH_INJURY_TARIFFS: { tariff: string; tariffDesc: string }[] = [
  { tariff: "0810", tariffDesc: "Closed fracture reduction" },
  { tariff: "0811", tariffDesc: "Open fracture reduction/ORIF" },
  { tariff: "0700", tariffDesc: "Simple wound repair" },
  { tariff: "0701", tariffDesc: "Intermediate wound repair" },
  { tariff: "0702", tariffDesc: "Complex wound repair" },
  { tariff: "0704", tariffDesc: "Wound debridement" },
];

const NON_INJURY_DIAGNOSES: { code: string; desc: string }[] = [
  { code: "E11.9", desc: "type 2 diabetes" },
  { code: "I10", desc: "essential hypertension" },
  { code: "J06.9", desc: "acute URTI" },
  { code: "K29.7", desc: "gastritis" },
  { code: "F32.9", desc: "depressive episode" },
  { code: "N39.0", desc: "UTI" },
  { code: "L30.9", desc: "dermatitis" },
  { code: "H65.9", desc: "otitis media" },
];

function generateInjuryTariffMismatchRules(): DynamicViolation[] {
  const rules: DynamicViolation[] = [];

  // Trauma/injury tariff codes with non-trauma diagnoses
  for (const tariff of NON_INJURY_CODES_WITH_INJURY_TARIFFS) {
    for (const diag of NON_INJURY_DIAGNOSES) {
      rules.push({
        code1: tariff.tariff,
        code2: diag.code,
        type: "never_together",
        reason: `${tariff.tariffDesc} (tariff ${tariff.tariff}) is a trauma/injury procedure — clinically inappropriate with ${diag.desc} (${diag.code}) as primary diagnosis. Requires an S/T-code injury diagnosis with V-Y external cause code.`,
        source: "CCSA v11 discipline-diagnosis validation; SA external cause code requirements; BHF clinical appropriateness",
        category: "tariff_diagnosis_mismatch",
        generated: true,
        generator: "injury_tariff_mismatch",
      });
    }
  }

  return rules;
}


// ─── Stats ──────────────────────────────────────────────────────────────────

/** Get statistics about dynamic rule generation. */
export function getDynamicRuleStats(): {
  total: number;
  byGenerator: Record<string, number>;
} {
  const rules = getDynamicRules();
  const byGenerator: Record<string, number> = {};

  for (const rule of rules) {
    byGenerator[rule.generator] = (byGenerator[rule.generator] || 0) + 1;
  }

  return { total: rules.length, byGenerator };
}
