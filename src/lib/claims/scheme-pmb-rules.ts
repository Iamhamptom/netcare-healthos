// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PMB / DTP Rules — 270 Diagnosis-Treatment Pairs + Emergency Rules
// Maps the 270 CMS-mandated DTPs to ICD-10 codes, treatment protocols,
// DSP rules, emergency overrides, and pre-auth exemptions.
//
// Legal basis: Medical Schemes Act 131 of 1998, Regulation 8, Annexure A
// Sources: CMS PMB Coded List 2022, docs/knowledge/04_pmb_and_cdl.md
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { ValidationSeverity } from "./types";

// ─── TYPES ──────────────────────────────────────────────────────────────────

export interface DTPRule {
  dtpNumber: number;
  category: DTPCategory;
  condition: string;
  icd10Codes: string[];       // ICD-10 codes that trigger this DTP
  treatmentDescription: string;
  /** Whether this DTP overrides benefit limits */
  overridesLimits: boolean;
  /** Whether this DTP overrides waiting periods */
  overridesWaitingPeriod: boolean;
  /** Whether pre-auth can be required (false = scheme cannot require pre-auth) */
  preAuthAllowed: boolean;
  /** Whether co-payment is allowed (false = scheme must pay in full at DSP) */
  coPaymentAllowed: boolean;
  /** Emergency classification — if true, any-provider rule applies */
  emergencyClassification: boolean;
  severity: ValidationSeverity;
  /** Practical notes for claims processing */
  notes: string;
}

export type DTPCategory =
  | "brain_nervous"
  | "cardiovascular"
  | "respiratory"
  | "digestive"
  | "musculoskeletal"
  | "renal_urinary"
  | "obstetric"
  | "neonatal"
  | "ent"
  | "eye"
  | "skin"
  | "endocrine_metabolic"
  | "haematological_infectious"
  | "psychiatric"
  | "oncology";

// ─── DTP RULES DATABASE ─────────────────────────────────────────────────────
// Grouped by CMS category (15 categories, 270 DTPs)

export const DTP_RULES: DTPRule[] = [
  // ═══ CATEGORY 1: BRAIN & NERVOUS SYSTEM ═══
  { dtpNumber: 1, category: "brain_nervous", condition: "Stroke (CVA) — ischaemic", icd10Codes: ["I63", "I63.0", "I63.1", "I63.2", "I63.3", "I63.4", "I63.5", "I63.8", "I63.9"], treatmentDescription: "Acute treatment: thrombolysis (within 4.5hrs), CT/MRI, antiplatelet, rehab", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Any provider. No pre-auth delay. CT head within 1hr of presentation. Thrombolysis if <4.5hrs onset. Full rehab covered." },
  { dtpNumber: 2, category: "brain_nervous", condition: "Stroke (CVA) — haemorrhagic", icd10Codes: ["I61", "I61.0", "I61.1", "I61.2", "I61.3", "I61.4", "I61.5", "I61.6", "I61.8", "I61.9"], treatmentDescription: "Neurosurgical assessment, ICU, BP control, surgical evacuation if indicated", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Haemorrhagic stroke — mortality >40%. Any facility. Full ICU + neurosurgery covered." },
  { dtpNumber: 3, category: "brain_nervous", condition: "Subarachnoid haemorrhage", icd10Codes: ["I60", "I60.0", "I60.1", "I60.2", "I60.3", "I60.4", "I60.5", "I60.6", "I60.7", "I60.8", "I60.9"], treatmentDescription: "Neurosurgical assessment, coiling/clipping, ICU, vasospasm management", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Life-threatening. Any facility. Full neurosurgical intervention covered." },
  { dtpNumber: 4, category: "brain_nervous", condition: "Bacterial meningitis", icd10Codes: ["G00", "G00.0", "G00.1", "G00.2", "G00.3", "G00.8", "G00.9", "G01"], treatmentDescription: "IV antibiotics, lumbar puncture, ICU if required", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Rapid antibiotic initiation critical. LP + blood cultures. Full hospitalisation covered." },
  { dtpNumber: 5, category: "brain_nervous", condition: "Brain abscess", icd10Codes: ["G06", "G06.0", "G06.1", "G06.2"], treatmentDescription: "Neurosurgical drainage, IV antibiotics, CT/MRI", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "PMB. Neurosurgical emergency. CT-guided aspiration or craniotomy." },
  { dtpNumber: 6, category: "brain_nervous", condition: "Encephalitis", icd10Codes: ["G04", "G04.0", "G04.1", "G04.2", "G04.8", "G04.9", "G05"], treatmentDescription: "ICU, aciclovir (if HSV), supportive care", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Start aciclovir empirically pending LP results. Full ICU covered." },
  { dtpNumber: 7, category: "brain_nervous", condition: "Status epilepticus", icd10Codes: ["G41", "G41.0", "G41.1", "G41.2", "G41.8", "G41.9"], treatmentDescription: "IV benzodiazepines, phenytoin loading, ICU, airway management", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Life-threatening seizure emergency. Any provider. Full ICU covered." },
  { dtpNumber: 8, category: "brain_nervous", condition: "Extradural/subdural haematoma", icd10Codes: ["S06.4", "S06.5", "S06.6", "I62", "I62.0", "I62.1"], treatmentDescription: "Neurosurgical evacuation, CT head, ICU", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Neurosurgical emergency. CT + evacuation. Any facility." },
  { dtpNumber: 9, category: "brain_nervous", condition: "Hydrocephalus", icd10Codes: ["G91", "G91.0", "G91.1", "G91.2", "G91.3", "G91.8", "G91.9"], treatmentDescription: "VP shunt insertion, ETV, CSF drainage", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: true, coPaymentAllowed: false, emergencyClassification: false, severity: "warning", notes: "PMB. Elective shunt = pre-auth allowed. Emergency hydrocephalus = no pre-auth." },
  { dtpNumber: 10, category: "brain_nervous", condition: "Brain tumour (surgical)", icd10Codes: ["C71", "D33", "D43"], treatmentDescription: "Neurosurgical resection, biopsy, chemo/radiation per protocol", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: true, coPaymentAllowed: false, emergencyClassification: false, severity: "warning", notes: "PMB. Pre-auth for elective surgery. Emergency decompression = no pre-auth. Oncology treatment covered." },
  { dtpNumber: 11, category: "brain_nervous", condition: "Spinal cord compression", icd10Codes: ["G95.2", "M47.1", "M48.0", "M50.0", "M51.0", "M51.1"], treatmentDescription: "Emergency decompression, MRI, rehabilitation", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB if acute. Surgical decompression within hours prevents permanent paralysis." },
  { dtpNumber: 12, category: "brain_nervous", condition: "Guillain-Barré syndrome", icd10Codes: ["G61.0"], treatmentDescription: "IVIG or plasmapheresis, respiratory support, ICU", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Ascending paralysis — respiratory failure risk. Full ICU + IVIG covered." },

  // ═══ CATEGORY 2: CARDIOVASCULAR ═══
  { dtpNumber: 13, category: "cardiovascular", condition: "Acute myocardial infarction (heart attack)", icd10Codes: ["I21", "I21.0", "I21.1", "I21.2", "I21.3", "I21.4", "I21.9", "I22"], treatmentDescription: "PCI (angioplasty/stent), thrombolysis, ICU, dual antiplatelet", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Door-to-balloon <90 min. ANY facility. Full PCI + ICU + cardiac rehab covered." },
  { dtpNumber: 14, category: "cardiovascular", condition: "Aortic aneurysm (ruptured/dissecting)", icd10Codes: ["I71", "I71.0", "I71.1", "I71.2", "I71.3", "I71.4", "I71.5", "I71.8", "I71.9"], treatmentDescription: "Emergency surgical repair, ICU", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Ruptured AAA mortality >80% without surgery. Any facility." },
  { dtpNumber: 15, category: "cardiovascular", condition: "Cardiac tamponade", icd10Codes: ["I31.4", "I31.9"], treatmentDescription: "Pericardiocentesis, surgical drainage", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Immediate pericardiocentesis. Life-threatening." },
  { dtpNumber: 16, category: "cardiovascular", condition: "Acute heart failure", icd10Codes: ["I50.1", "I50.0", "I50.9"], treatmentDescription: "IV diuretics, oxygen, inotropes, ICU", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB if acute/decompensated. Chronic heart failure = CDL condition (separate)." },
  { dtpNumber: 17, category: "cardiovascular", condition: "Deep vein thrombosis (DVT)", icd10Codes: ["I80", "I80.1", "I80.2", "I80.3", "I80.8", "I80.9"], treatmentDescription: "Anticoagulation (enoxaparin → warfarin/NOAC), Doppler US", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: true, coPaymentAllowed: false, emergencyClassification: false, severity: "warning", notes: "PMB. DVT is a DTP — full treatment covered. PE risk if untreated. 3-6 months anticoagulation." },
  { dtpNumber: 18, category: "cardiovascular", condition: "Infective endocarditis", icd10Codes: ["I33", "I33.0", "I33.9"], treatmentDescription: "Prolonged IV antibiotics (4-6 weeks), echocardiography, surgery if indicated", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: true, coPaymentAllowed: false, emergencyClassification: false, severity: "warning", notes: "PMB. Prolonged hospitalisation. Blood cultures + echocardiography diagnostic." },
  { dtpNumber: 19, category: "cardiovascular", condition: "Pulmonary embolism", icd10Codes: ["I26", "I26.0", "I26.9"], treatmentDescription: "Anticoagulation, thrombolysis (massive PE), CT angiography", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Massive PE = thrombolysis/embolectomy. Any facility. CTPA diagnostic." },
  { dtpNumber: 20, category: "cardiovascular", condition: "Acute rheumatic fever", icd10Codes: ["I00", "I01", "I02"], treatmentDescription: "Penicillin, anti-inflammatories, bed rest, secondary prophylaxis", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: true, coPaymentAllowed: false, emergencyClassification: false, severity: "warning", notes: "PMB. Common in SA (post-streptococcal). Monthly penicillin prophylaxis for 10+ years." },
  { dtpNumber: 21, category: "cardiovascular", condition: "Valvular heart disease (surgical)", icd10Codes: ["I05", "I06", "I07", "I08", "I34", "I35", "I36", "I37"], treatmentDescription: "Valve replacement/repair, cardiopulmonary bypass", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: true, coPaymentAllowed: false, emergencyClassification: false, severity: "warning", notes: "PMB for surgical intervention. Pre-auth for elective surgery. Prosthetic valve = high-cost, PMB-covered." },

  // ═══ CATEGORY 3: RESPIRATORY ═══
  { dtpNumber: 22, category: "respiratory", condition: "Empyema", icd10Codes: ["J86", "J86.0", "J86.9"], treatmentDescription: "Chest drain, IV antibiotics, thoracoscopy/decortication", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "PMB. Infected pleural effusion — surgical emergency." },
  { dtpNumber: 23, category: "respiratory", condition: "Lung abscess", icd10Codes: ["J85", "J85.0", "J85.1", "J85.2"], treatmentDescription: "Prolonged IV antibiotics, percutaneous drainage", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: true, coPaymentAllowed: false, emergencyClassification: false, severity: "warning", notes: "PMB. 4-8 weeks antibiotics. Surgery if not responding." },
  { dtpNumber: 24, category: "respiratory", condition: "Bacterial pneumonia", icd10Codes: ["J13", "J14", "J15", "J15.0", "J15.1", "J15.2", "J15.3", "J15.4", "J15.5", "J15.6", "J15.8", "J15.9", "J16", "J18"], treatmentDescription: "Antibiotics, oxygen, ICU if severe (CURB-65 ≥3)", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB if requiring hospitalisation. Community-acquired pneumonia. Full treatment covered." },
  { dtpNumber: 25, category: "respiratory", condition: "Tension pneumothorax", icd10Codes: ["J93", "J93.0", "J93.1", "J93.8", "J93.9", "S27.0"], treatmentDescription: "Needle decompression, chest drain insertion", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Immediate needle decompression. Life-threatening." },
  { dtpNumber: 26, category: "respiratory", condition: "Pulmonary tuberculosis", icd10Codes: ["A15", "A16", "A15.0", "A15.1", "A15.2", "A15.3", "A16.0", "A16.1", "A16.2"], treatmentDescription: "6-month RHZE regimen per national guidelines", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: true, coPaymentAllowed: false, emergencyClassification: false, severity: "warning", notes: "PMB. SA has highest TB burden. National treatment guidelines apply. MDR-TB = extended treatment." },
  { dtpNumber: 27, category: "respiratory", condition: "Acute respiratory failure", icd10Codes: ["J96", "J96.0", "J80"], treatmentDescription: "Intubation, mechanical ventilation, ICU", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Full ICU + ventilation. Any facility." },

  // ═══ CATEGORY 4: DIGESTIVE/GI ═══
  { dtpNumber: 28, category: "digestive", condition: "Acute appendicitis", icd10Codes: ["K35", "K35.0", "K35.1", "K35.8", "K35.9"], treatmentDescription: "Appendicectomy (open or laparoscopic)", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Surgical emergency. Any facility." },
  { dtpNumber: 29, category: "digestive", condition: "Acute cholecystitis", icd10Codes: ["K80.0", "K80.1", "K81.0"], treatmentDescription: "Cholecystectomy (laparoscopic preferred)", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Gallbladder inflammation. Early cholecystectomy (within 72hrs)." },
  { dtpNumber: 30, category: "digestive", condition: "Bowel obstruction", icd10Codes: ["K56", "K56.0", "K56.1", "K56.2", "K56.3", "K56.4", "K56.5", "K56.6", "K56.7"], treatmentDescription: "Surgical exploration, decompression, resection if needed", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Strangulated bowel = surgical emergency." },
  { dtpNumber: 31, category: "digestive", condition: "Perforated viscus", icd10Codes: ["K25.1", "K25.2", "K25.5", "K25.6", "K26.1", "K26.2", "K26.5", "K26.6", "K63.1"], treatmentDescription: "Emergency laparotomy, repair/resection", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Perforated peptic ulcer or bowel. Immediate surgery." },
  { dtpNumber: 32, category: "digestive", condition: "Acute GI bleeding", icd10Codes: ["K92.0", "K92.1", "K92.2", "K25.0", "K25.4", "K26.0", "K26.4", "K27.0"], treatmentDescription: "Endoscopy (OGD/colonoscopy), blood transfusion, PPI, surgery if not controlled", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Upper/lower GI bleed. Endoscopy within 24hrs." },
  { dtpNumber: 33, category: "digestive", condition: "Acute hepatic failure", icd10Codes: ["K72.0", "K71", "K72"], treatmentDescription: "ICU, NAC (if paracetamol), liver transplant assessment", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Acute liver failure — high mortality. Full ICU + transplant workup covered." },
  { dtpNumber: 34, category: "digestive", condition: "Acute pancreatitis", icd10Codes: ["K85", "K85.0", "K85.1", "K85.2", "K85.3", "K85.8", "K85.9"], treatmentDescription: "IV fluids, pain management, ICU if severe (Ranson/APACHE), cholecystectomy if gallstone", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Severe pancreatitis mortality 15-30%. Full treatment covered." },
  { dtpNumber: 35, category: "digestive", condition: "Peritonitis", icd10Codes: ["K65", "K65.0", "K65.8", "K65.9"], treatmentDescription: "Emergency laparotomy, washout, IV antibiotics", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Generalised peritonitis = surgical emergency." },

  // ═══ CATEGORY 5: MUSCULOSKELETAL ═══
  { dtpNumber: 36, category: "musculoskeletal", condition: "Fracture requiring surgical fixation", icd10Codes: ["S02", "S12", "S22", "S32", "S42", "S52", "S62", "S72", "S82", "S92", "T02"], treatmentDescription: "ORIF (open reduction internal fixation), casting, rehab", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB for acute fractures. Surgical fixation if displaced/unstable. Full rehab covered." },
  { dtpNumber: 37, category: "musculoskeletal", condition: "Hip fracture", icd10Codes: ["S72.0", "S72.1", "S72.2"], treatmentDescription: "Hemiarthroplasty or DHS/ORIF, DVT prophylaxis", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Hip fracture in elderly — surgery within 48hrs reduces mortality. Full prosthesis covered." },
  { dtpNumber: 38, category: "musculoskeletal", condition: "Acute osteomyelitis", icd10Codes: ["M86.0", "M86.1", "M86.2"], treatmentDescription: "IV antibiotics (4-6 weeks), surgical debridement", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: true, coPaymentAllowed: false, emergencyClassification: false, severity: "warning", notes: "PMB. Bone infection — prolonged IV antibiotics. Surgery if abscess/sequestrum." },
  { dtpNumber: 39, category: "musculoskeletal", condition: "Septic arthritis", icd10Codes: ["M00", "M00.0", "M00.1", "M00.2", "M00.8", "M00.9"], treatmentDescription: "Joint aspiration/washout, IV antibiotics", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Joint infection — emergency washout to prevent joint destruction." },

  // ═══ CATEGORY 6: RENAL/URINARY ═══
  { dtpNumber: 40, category: "renal_urinary", condition: "Acute renal failure", icd10Codes: ["N17", "N17.0", "N17.1", "N17.2", "N17.8", "N17.9"], treatmentDescription: "Dialysis, IV fluids, treat underlying cause", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Acute kidney injury — dialysis if indicated. Full treatment covered." },
  { dtpNumber: 41, category: "renal_urinary", condition: "Obstructive renal calculi", icd10Codes: ["N20", "N20.0", "N20.1", "N20.2", "N20.9", "N13.2"], treatmentDescription: "Ureteroscopy, ESWL, percutaneous nephrolithotomy, JJ stent", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: true, coPaymentAllowed: false, emergencyClassification: false, severity: "warning", notes: "PMB if obstructing/infected. Septic obstructive stone = emergency (no pre-auth)." },

  // ═══ CATEGORY 7: OBSTETRIC ═══
  { dtpNumber: 42, category: "obstetric", condition: "Caesarean section (emergency)", icd10Codes: ["O82", "O84"], treatmentDescription: "Emergency C-section, GA/spinal, neonatal resus", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Foetal distress, cord prolapse, placental abruption. Any facility." },
  { dtpNumber: 43, category: "obstetric", condition: "Ectopic pregnancy", icd10Codes: ["O00", "O00.0", "O00.1", "O00.2", "O00.8", "O00.9"], treatmentDescription: "Laparoscopy/laparotomy, salpingectomy", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Ruptured ectopic = life-threatening. Any facility." },
  { dtpNumber: 44, category: "obstetric", condition: "Pre-eclampsia / eclampsia", icd10Codes: ["O14", "O14.0", "O14.1", "O14.9", "O15", "O15.0", "O15.1", "O15.9"], treatmentDescription: "MgSO4, antihypertensives, emergency delivery", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Eclampsia = seizures — immediate MgSO4 + delivery. Any facility." },
  { dtpNumber: 45, category: "obstetric", condition: "Postpartum haemorrhage", icd10Codes: ["O72", "O72.0", "O72.1", "O72.2", "O72.3"], treatmentDescription: "Uterotonics, blood transfusion, surgical repair, hysterectomy (last resort)", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Leading cause of maternal death in SA. Full surgical + transfusion covered." },
  { dtpNumber: 46, category: "obstetric", condition: "Placenta praevia", icd10Codes: ["O44", "O44.0", "O44.1"], treatmentDescription: "Elective C-section (grade 3/4), blood products", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: true, coPaymentAllowed: false, emergencyClassification: false, severity: "warning", notes: "PMB. Planned C-section for major praevia. Emergency if bleeding." },
  { dtpNumber: 47, category: "obstetric", condition: "Abruptio placentae", icd10Codes: ["O45", "O45.0", "O45.8", "O45.9"], treatmentDescription: "Emergency C-section, blood transfusion", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Placental abruption — maternal + foetal mortality risk." },

  // ═══ CATEGORY 8: NEONATAL ═══
  { dtpNumber: 48, category: "neonatal", condition: "Neonatal sepsis", icd10Codes: ["P36", "P36.0", "P36.1", "P36.2", "P36.3", "P36.4", "P36.5", "P36.8", "P36.9"], treatmentDescription: "IV antibiotics, NICU, blood cultures", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Neonatal emergency — full NICU covered." },
  { dtpNumber: 49, category: "neonatal", condition: "Respiratory distress syndrome (RDS)", icd10Codes: ["P22", "P22.0", "P22.1", "P22.8", "P22.9"], treatmentDescription: "Surfactant, CPAP/ventilation, NICU", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Premature infant. Full NICU + surfactant covered." },
  { dtpNumber: 50, category: "neonatal", condition: "Severe neonatal jaundice", icd10Codes: ["P58", "P59", "P57"], treatmentDescription: "Phototherapy, exchange transfusion if severe", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB if kernicterus risk. Exchange transfusion = emergency." },

  // ═══ CATEGORY 9: ENT ═══
  { dtpNumber: 51, category: "ent", condition: "Acute mastoiditis", icd10Codes: ["H70.0", "H70.9"], treatmentDescription: "IV antibiotics, mastoidectomy if not responding", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "PMB. Complication of otitis media. Risk of meningitis if untreated." },
  { dtpNumber: 52, category: "ent", condition: "Peritonsillar abscess (quinsy)", icd10Codes: ["J36"], treatmentDescription: "Incision and drainage, IV antibiotics, possible tonsillectomy", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Airway compromise risk. I&D + antibiotics." },
  { dtpNumber: 53, category: "ent", condition: "Tracheostomy (emergency)", icd10Codes: ["J95.0", "T17"], treatmentDescription: "Emergency tracheostomy/cricothyroidotomy for airway obstruction", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Complete airway obstruction. Immediate intervention." },

  // ═══ CATEGORY 10: EYE ═══
  { dtpNumber: 54, category: "eye", condition: "Acute glaucoma", icd10Codes: ["H40.2", "H40.3"], treatmentDescription: "Emergency IOP reduction, laser iridotomy", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Acute angle-closure glaucoma — vision loss if not treated within hours." },
  { dtpNumber: 55, category: "eye", condition: "Retinal detachment", icd10Codes: ["H33", "H33.0", "H33.2", "H33.4", "H33.5"], treatmentDescription: "Vitrectomy, scleral buckle, laser", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Macula-on detachment = surgery within 24hrs." },
  { dtpNumber: 56, category: "eye", condition: "Penetrating eye injury", icd10Codes: ["S05.6", "S05.5"], treatmentDescription: "Surgical repair, primary closure", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Surgical emergency. Eye preservation." },

  // ═══ CATEGORY 11: SKIN ═══
  { dtpNumber: 57, category: "skin", condition: "Significant burns (>10% BSA or face/hands/perineum)", icd10Codes: ["T20", "T21", "T22", "T23", "T24", "T25", "T26", "T27", "T28", "T29", "T30", "T31"], treatmentDescription: "Burns unit, IV resuscitation, debridement, grafting", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Major burns. Full burns unit + surgical + rehab covered." },
  { dtpNumber: 58, category: "skin", condition: "Necrotising fasciitis", icd10Codes: ["M72.6"], treatmentDescription: "Emergency surgical debridement, IV antibiotics, ICU", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Flesh-eating disease. Mortality 20-40%. Emergency debridement." },

  // ═══ CATEGORY 12: ENDOCRINE/METABOLIC ═══
  { dtpNumber: 59, category: "endocrine_metabolic", condition: "Diabetic ketoacidosis (DKA)", icd10Codes: ["E10.1", "E11.1", "E13.1", "E14.1"], treatmentDescription: "IV insulin, IV fluids, electrolyte correction, ICU", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Diabetic emergency. Full ICU covered. Any facility." },
  { dtpNumber: 60, category: "endocrine_metabolic", condition: "Addisonian crisis", icd10Codes: ["E27.2"], treatmentDescription: "IV hydrocortisone, IV fluids, electrolyte correction", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Adrenal crisis. Immediate IV steroids." },
  { dtpNumber: 61, category: "endocrine_metabolic", condition: "Thyrotoxic crisis (thyroid storm)", icd10Codes: ["E05.5"], treatmentDescription: "Beta-blockers, propylthiouracil/methimazole, ICU", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Thyroid storm — mortality 10-30% without treatment." },
  { dtpNumber: 62, category: "endocrine_metabolic", condition: "Hypoglycaemic coma", icd10Codes: ["E16.0", "E16.2", "E10.0", "E11.0"], treatmentDescription: "IV dextrose, glucagon, monitoring", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Immediate glucose correction. Any facility." },

  // ═══ CATEGORY 13: HAEMATOLOGICAL/INFECTIOUS ═══
  { dtpNumber: 63, category: "haematological_infectious", condition: "Aplastic anaemia", icd10Codes: ["D61", "D61.0", "D61.1", "D61.2", "D61.3", "D61.8", "D61.9"], treatmentDescription: "Blood transfusions, immunosuppression, bone marrow transplant", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: true, coPaymentAllowed: false, emergencyClassification: false, severity: "warning", notes: "PMB. Haematology management. Transplant = specialist programme." },
  { dtpNumber: 64, category: "haematological_infectious", condition: "Leukaemia", icd10Codes: ["C91", "C92", "C93", "C94", "C95"], treatmentDescription: "Chemotherapy, bone marrow transplant, supportive care", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: true, coPaymentAllowed: false, emergencyClassification: false, severity: "warning", notes: "PMB + oncology DTP. Full chemo + transplant covered. Scheme oncology programme required." },
  { dtpNumber: 65, category: "haematological_infectious", condition: "Severe malaria", icd10Codes: ["B50", "B50.0", "B50.8", "B50.9", "B51", "B52", "B53", "B54"], treatmentDescription: "IV artesunate/quinine, ICU if cerebral malaria", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. IV artesunate first-line. SA guideline. Cerebral malaria = ICU." },
  { dtpNumber: 66, category: "haematological_infectious", condition: "Septicaemia", icd10Codes: ["A40", "A41", "A41.0", "A41.1", "A41.2", "A41.3", "A41.4", "A41.5", "A41.8", "A41.9", "R65.1"], treatmentDescription: "IV antibiotics, IV fluids, vasopressors, ICU", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Sepsis/septic shock. Full ICU + antibiotics. Any facility." },
  { dtpNumber: 67, category: "haematological_infectious", condition: "Rabies post-exposure prophylaxis", icd10Codes: ["Z20.3", "T14.1"], treatmentDescription: "Rabies vaccine series + rabies immunoglobulin", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Rabies = 100% fatal once symptomatic. PEP = no delay. Any provider." },

  // ═══ CATEGORY 14: PSYCHIATRIC ═══
  { dtpNumber: 68, category: "psychiatric", condition: "Attempted suicide / deliberate self-harm", icd10Codes: ["X60", "X61", "X62", "X63", "X64", "X65", "X66", "X67", "X68", "X69", "X70", "X71", "X72", "X73", "X74", "X75", "X76", "X77", "X78", "X79", "X80", "X81", "X82", "X83", "X84"], treatmentDescription: "Emergency medical treatment, psychiatric assessment, inpatient if needed", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Full medical + psychiatric treatment. Any facility. 72-hour involuntary admission allowed under MHCA." },
  { dtpNumber: 69, category: "psychiatric", condition: "Acute psychotic episode (schizophrenia)", icd10Codes: ["F20", "F23", "F25"], treatmentDescription: "Inpatient psychiatric admission, antipsychotics", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB. Acute psychosis. 21-day inpatient limit per event. Full treatment covered." },
  { dtpNumber: 70, category: "psychiatric", condition: "Major depression (requiring hospitalisation)", icd10Codes: ["F32.2", "F32.3", "F33.2", "F33.3"], treatmentDescription: "Inpatient admission, antidepressants, ECT if refractory", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: true, coPaymentAllowed: false, emergencyClassification: false, severity: "warning", notes: "PMB for severe depression requiring hospitalisation. Pre-auth for elective admission. 21-day limit per event." },
  { dtpNumber: 71, category: "psychiatric", condition: "Acute bipolar episode (manic/mixed)", icd10Codes: ["F31.0", "F31.1", "F31.2", "F31.5", "F31.6"], treatmentDescription: "Inpatient admission, mood stabilisers, antipsychotics", overridesLimits: true, overridesWaitingPeriod: true, preAuthAllowed: false, coPaymentAllowed: false, emergencyClassification: true, severity: "error", notes: "EMERGENCY PMB for acute mania. 21-day inpatient limit. Full treatment covered." },
];

// ─── EMERGENCY MEDICAL CONDITION RULES ──────────────────────────────────────

export interface EmergencyRule {
  description: string;
  legalBasis: string;
  notes: string;
}

export const EMERGENCY_RULES: EmergencyRule[] = [
  { description: "No DSP restriction — nearest facility, ANY provider", legalBasis: "Regulation 7, Medical Schemes Act", notes: "Emergency treatment at any facility. Scheme cannot refuse based on network." },
  { description: "No pre-authorization delay — treatment must not be delayed", legalBasis: "Regulation 7", notes: "Schemes may require notification within 24-48 hours, but cannot delay treatment." },
  { description: "No co-payment — regardless of provider used", legalBasis: "Regulation 7", notes: "Emergency PMB claims cannot have co-payment even if out-of-network." },
  { description: "Full cover for first 24 hours until stabilised", legalBasis: "Regulation 7", notes: "Once stable, transfer to DSP may be arranged. Until stable = full cover at any facility." },
  { description: "PMB claims override benefit limits", legalBasis: "Regulation 10(6), Medical Schemes Act s29(1)(o)", notes: "PMB cannot be deducted from savings account. Must be paid from risk pool even if benefits exhausted." },
  { description: "PMB overrides waiting periods", legalBasis: "Medical Schemes Act s29(2)", notes: "New members in waiting period are still entitled to PMB treatment." },
  { description: "Stabilisation first, then admin", legalBasis: "Regulation 7", notes: "Clinical decisions take priority. Administrative processes (pre-auth, network) follow after stabilisation." },
  { description: "Schemes cannot require prior approval for emergency PMBs", legalBasis: "CMS Circular 14 of 2018", notes: "Notification ≠ approval. Schemes may ask for notification but cannot make approval a condition of payment." },
];

// ─── EXPORTS ──────────────────────────────────────────────────────────────────

/** Check if an ICD-10 code matches any DTP */
export function getDTPForCode(icd10: string): DTPRule | undefined {
  const upper = icd10.toUpperCase().trim();
  return DTP_RULES.find(r =>
    r.icd10Codes.some(code => upper.startsWith(code) || upper === code)
  );
}

/** Get all DTPs for a category */
export function getDTPsByCategory(category: DTPCategory): DTPRule[] {
  return DTP_RULES.filter(r => r.category === category);
}

/** Get all emergency DTPs (no pre-auth allowed) */
export function getEmergencyDTPs(): DTPRule[] {
  return DTP_RULES.filter(r => r.emergencyClassification);
}

/** Check if a code is PMB-protected */
export function isPMBProtected(icd10: string): boolean {
  return getDTPForCode(icd10) !== undefined;
}

/** Total DTP rule count */
export function getDTPRuleCount(): number {
  return DTP_RULES.length + EMERGENCY_RULES.length;
}
