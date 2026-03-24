// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CDL Treatment Protocol Rules — 27 Chronic Conditions x Scheme Variations
// Per-condition rules: formulary tiers, generic substitution, monitoring,
// renewal intervals, max supply, step therapy, co-payment.
//
// Sources: CMS CDL regulations, scheme formularies, GEMS DRP,
// Discovery CIB formulary, Bonitas formulary tiers A-D
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { ValidationSeverity } from "./types";

// ─── TYPES ──────────────────────────────────────────────────────────────────

export interface CDLConditionRule {
  cdlNumber: number;          // 1-27 per CMS list
  condition: string;
  icd10Primary: string;       // Primary ICD-10 code
  icd10Extended: string[];    // Extended/related codes
  /** Per-scheme chronic medication rules */
  schemeRules: CDLSchemeRule[];
  /** Standard monitoring requirements */
  monitoring: MonitoringRule[];
  /** Whether step therapy is commonly enforced */
  stepTherapy: boolean;
  /** PMB-protected — schemes cannot deny */
  pmbProtected: boolean;
}

export interface CDLSchemeRule {
  scheme: string;             // "DH", "GEMS", "BON", "MH", "BM", "MS", "*" (all)
  /** Max days supply per dispensing */
  maxDaysSupply: number;
  /** Whether generic substitution is mandatory */
  genericMandatory: boolean;
  /** Whether formulary is strictly enforced */
  formularyStrict: boolean;
  /** Formulary tier (Bonitas-specific: A-D) */
  formularyTier?: "A" | "B" | "C" | "D";
  /** Co-payment percentage for off-formulary */
  offFormularyCopay: number;  // 0-100%
  /** CDL renewal interval in months */
  renewalMonths: number;
  /** Whether chronic application form is required */
  applicationRequired: boolean;
  /** Application method */
  applicationMethod: string;
  /** Approval turnaround days */
  approvalDays: number;
  /** Step therapy requirement */
  stepTherapyRequired: boolean;
  /** First-line medication class */
  firstLineMeds: string;
  /** Notes */
  notes: string;
}

export interface MonitoringRule {
  test: string;               // "HbA1c", "TSH", "Lipid panel", etc.
  frequencyMonths: number;    // How often (in months)
  coveredByScheme: boolean;   // Whether the monitoring test is covered under CDL
  notes: string;
}

// ─── CDL CONDITION RULES ────────────────────────────────────────────────────

export const CDL_CONDITION_RULES: CDLConditionRule[] = [
  // ── 1. Addison's Disease ──
  {
    cdlNumber: 1, condition: "Addison's Disease", icd10Primary: "E27.1",
    icd10Extended: ["E27.2", "E27.9"],
    pmbProtected: true, stepTherapy: false,
    monitoring: [
      { test: "Cortisol levels", frequencyMonths: 6, coveredByScheme: true, notes: "Morning cortisol + ACTH" },
      { test: "Electrolytes (Na/K)", frequencyMonths: 3, coveredByScheme: true, notes: "Monitor sodium/potassium balance" },
    ],
    schemeRules: [
      { scheme: "*", maxDaysSupply: 30, genericMandatory: false, formularyStrict: false, offFormularyCopay: 0, renewalMonths: 12, applicationRequired: true, applicationMethod: "Doctor submission with pathology", approvalDays: 14, stepTherapyRequired: false, firstLineMeds: "Hydrocortisone + fludrocortisone", notes: "Rare condition — most schemes approve readily. Fludrocortisone has no generic in SA." },
      { scheme: "GEMS", maxDaysSupply: 28, genericMandatory: false, formularyStrict: true, offFormularyCopay: 30, renewalMonths: 12, applicationRequired: true, applicationMethod: "Fax/post via Metropolitan Health", approvalDays: 21, stepTherapyRequired: false, firstLineMeds: "Hydrocortisone + fludrocortisone", notes: "GEMS 28-day supply. Formulary strictly enforced." },
    ],
  },

  // ── 2. Asthma ──
  {
    cdlNumber: 2, condition: "Asthma", icd10Primary: "J45",
    icd10Extended: ["J45.0", "J45.1", "J45.8", "J45.9", "J46"],
    pmbProtected: true, stepTherapy: true,
    monitoring: [
      { test: "Peak flow / spirometry", frequencyMonths: 12, coveredByScheme: true, notes: "Annual lung function assessment" },
      { test: "Asthma control questionnaire", frequencyMonths: 3, coveredByScheme: false, notes: "In-consultation assessment" },
    ],
    schemeRules: [
      { scheme: "DH", maxDaysSupply: 30, genericMandatory: true, formularyStrict: true, offFormularyCopay: 20, renewalMonths: 12, applicationRequired: true, applicationMethod: "Electronic via HealthID", approvalDays: 14, stepTherapyRequired: true, firstLineMeds: "SABA (salbutamol) + low-dose ICS (budesonide/beclomethasone)", notes: "Discovery enforces step therapy: SABA → ICS → ICS+LABA → add-on. Biologics (omalizumab) require special motivation." },
      { scheme: "GEMS", maxDaysSupply: 28, genericMandatory: true, formularyStrict: true, offFormularyCopay: 30, renewalMonths: 12, applicationRequired: true, applicationMethod: "Fax/post via Metropolitan", approvalDays: 21, stepTherapyRequired: true, firstLineMeds: "SABA + low-dose ICS (generic)", notes: "GEMS 28-day supply. Generic ICS mandatory. Brand-name = rejected unless motivation." },
      { scheme: "BON", maxDaysSupply: 30, genericMandatory: true, formularyStrict: true, formularyTier: "A", offFormularyCopay: 30, renewalMonths: 12, applicationRequired: true, applicationMethod: "Via Medscheme", approvalDays: 14, stepTherapyRequired: true, firstLineMeds: "SABA + low-dose ICS", notes: "Bonitas Tier A for first-line. Tier D biologics = 30% co-pay. Pharmacy Direct DSP on lower plans." },
      { scheme: "MH", maxDaysSupply: 30, genericMandatory: true, formularyStrict: true, offFormularyCopay: 25, renewalMonths: 12, applicationRequired: true, applicationMethod: "Via Ingwe managed care", approvalDays: 14, stepTherapyRequired: true, firstLineMeds: "SABA + low-dose ICS", notes: "Momentum via Ingwe. Step therapy enforced. Biologics require Ingwe approval." },
      { scheme: "BM", maxDaysSupply: 30, genericMandatory: false, formularyStrict: false, offFormularyCopay: 0, renewalMonths: 12, applicationRequired: true, applicationMethod: "Direct to Bestmed", approvalDays: 10, stepTherapyRequired: false, firstLineMeds: "SABA + ICS", notes: "Bestmed more lenient on formulary. Faster approval." },
      { scheme: "MS", maxDaysSupply: 30, genericMandatory: true, formularyStrict: false, offFormularyCopay: 15, renewalMonths: 12, applicationRequired: true, applicationMethod: "Direct to Medshield", approvalDays: 14, stepTherapyRequired: true, firstLineMeds: "SABA + ICS", notes: "Medshield moderate formulary enforcement." },
    ],
  },

  // ── 3. Bipolar Disorder ──
  {
    cdlNumber: 3, condition: "Bipolar Disorder", icd10Primary: "F31",
    icd10Extended: ["F31.0", "F31.1", "F31.2", "F31.3", "F31.4", "F31.5", "F31.6", "F31.7", "F31.8", "F31.9"],
    pmbProtected: true, stepTherapy: false,
    monitoring: [
      { test: "Lithium levels (if on lithium)", frequencyMonths: 3, coveredByScheme: true, notes: "Therapeutic range: 0.6-1.2 mmol/L" },
      { test: "Thyroid function (TSH)", frequencyMonths: 6, coveredByScheme: true, notes: "Lithium affects thyroid" },
      { test: "Renal function (creatinine)", frequencyMonths: 6, coveredByScheme: true, notes: "Lithium nephrotoxicity monitoring" },
      { test: "Liver function (valproate)", frequencyMonths: 6, coveredByScheme: true, notes: "If on valproate — hepatotoxicity risk" },
    ],
    schemeRules: [
      { scheme: "*", maxDaysSupply: 30, genericMandatory: true, formularyStrict: true, offFormularyCopay: 20, renewalMonths: 12, applicationRequired: true, applicationMethod: "Psychiatrist submission recommended", approvalDays: 14, stepTherapyRequired: false, firstLineMeds: "Lithium, valproate, or carbamazepine", notes: "CDL psychiatric condition. Psychiatrist motivation strengthens application. Hospital admission = PMB (DTP)." },
      { scheme: "GEMS", maxDaysSupply: 28, genericMandatory: true, formularyStrict: true, offFormularyCopay: 30, renewalMonths: 12, applicationRequired: true, applicationMethod: "Fax/post via Metropolitan", approvalDays: 21, stepTherapyRequired: false, firstLineMeds: "Lithium, valproate", notes: "GEMS 28-day. Second-gen antipsychotics (quetiapine, olanzapine) on formulary but closely monitored." },
    ],
  },

  // ── 4. Bronchiectasis ──
  {
    cdlNumber: 4, condition: "Bronchiectasis", icd10Primary: "J47",
    icd10Extended: ["J47.0", "J47.1", "J47.9"],
    pmbProtected: true, stepTherapy: false,
    monitoring: [
      { test: "Sputum culture", frequencyMonths: 6, coveredByScheme: true, notes: "Identify colonising organisms" },
      { test: "Spirometry", frequencyMonths: 12, coveredByScheme: true, notes: "Track lung function decline" },
      { test: "CT chest (high-resolution)", frequencyMonths: 24, coveredByScheme: true, notes: "Baseline + follow-up HRCT" },
    ],
    schemeRules: [
      { scheme: "*", maxDaysSupply: 30, genericMandatory: true, formularyStrict: false, offFormularyCopay: 0, renewalMonths: 12, applicationRequired: true, applicationMethod: "Pulmonologist/GP submission", approvalDays: 14, stepTherapyRequired: false, firstLineMeds: "Antibiotics (prophylactic), bronchodilators, mucolytics", notes: "Less common CDL condition. Most schemes approve readily. Nebuliser may be covered as DME." },
      { scheme: "GEMS", maxDaysSupply: 28, genericMandatory: true, formularyStrict: true, offFormularyCopay: 30, renewalMonths: 12, applicationRequired: true, applicationMethod: "Metropolitan Health", approvalDays: 21, stepTherapyRequired: false, firstLineMeds: "Generic antibiotics + bronchodilators", notes: "GEMS 28-day. Prophylactic azithromycin on formulary." },
    ],
  },

  // ── 5. Cardiac Failure ──
  {
    cdlNumber: 5, condition: "Cardiac Failure", icd10Primary: "I50",
    icd10Extended: ["I50.0", "I50.1", "I50.9"],
    pmbProtected: true, stepTherapy: true,
    monitoring: [
      { test: "Echocardiogram", frequencyMonths: 12, coveredByScheme: true, notes: "Annual echo to assess EF" },
      { test: "BNP / NT-proBNP", frequencyMonths: 6, coveredByScheme: true, notes: "Heart failure biomarker" },
      { test: "Renal function + electrolytes", frequencyMonths: 3, coveredByScheme: true, notes: "ACE-i/ARB + diuretic monitoring" },
    ],
    schemeRules: [
      { scheme: "DH", maxDaysSupply: 30, genericMandatory: true, formularyStrict: true, offFormularyCopay: 20, renewalMonths: 12, applicationRequired: true, applicationMethod: "Electronic via HealthID", approvalDays: 14, stepTherapyRequired: true, firstLineMeds: "ACE-i/ARB + beta-blocker + diuretic", notes: "Step therapy: ACE-i → add beta-blocker → add diuretic → add MRA. Sacubitril/valsartan (Entresto) = special motivation." },
      { scheme: "GEMS", maxDaysSupply: 28, genericMandatory: true, formularyStrict: true, offFormularyCopay: 30, renewalMonths: 12, applicationRequired: true, applicationMethod: "Metropolitan Health", approvalDays: 21, stepTherapyRequired: true, firstLineMeds: "Generic ACE-i + beta-blocker + diuretic", notes: "GEMS 28-day. Entresto NOT on standard formulary — requires cardiologist motivation + prior ACE-i failure." },
      { scheme: "BON", maxDaysSupply: 30, genericMandatory: true, formularyStrict: true, formularyTier: "B", offFormularyCopay: 30, renewalMonths: 12, applicationRequired: true, applicationMethod: "Medscheme", approvalDays: 14, stepTherapyRequired: true, firstLineMeds: "ACE-i/ARB + beta-blocker", notes: "Bonitas Tier B for standard HF meds. Entresto = Tier D (30% co-pay)." },
    ],
  },

  // ── 6. Cardiomyopathy ──
  {
    cdlNumber: 6, condition: "Cardiomyopathy", icd10Primary: "I42",
    icd10Extended: ["I42.0", "I42.1", "I42.2", "I42.5", "I42.6", "I42.7", "I42.8", "I42.9"],
    pmbProtected: true, stepTherapy: true,
    monitoring: [
      { test: "Echocardiogram", frequencyMonths: 12, coveredByScheme: true, notes: "Annual echo" },
      { test: "ECG", frequencyMonths: 6, coveredByScheme: true, notes: "Rhythm monitoring" },
    ],
    schemeRules: [
      { scheme: "*", maxDaysSupply: 30, genericMandatory: true, formularyStrict: true, offFormularyCopay: 20, renewalMonths: 12, applicationRequired: true, applicationMethod: "Cardiologist submission", approvalDays: 14, stepTherapyRequired: true, firstLineMeds: "As per cardiac failure protocol", notes: "Treatment overlaps with cardiac failure (CDL 5). Same medication classes." },
      { scheme: "GEMS", maxDaysSupply: 28, genericMandatory: true, formularyStrict: true, offFormularyCopay: 30, renewalMonths: 12, applicationRequired: true, applicationMethod: "Metropolitan Health", approvalDays: 21, stepTherapyRequired: true, firstLineMeds: "Generic ACE-i + beta-blocker", notes: "GEMS 28-day supply." },
    ],
  },

  // ── 7. COPD ──
  {
    cdlNumber: 7, condition: "Chronic Obstructive Pulmonary Disease", icd10Primary: "J44",
    icd10Extended: ["J43", "J44.0", "J44.1", "J44.8", "J44.9"],
    pmbProtected: true, stepTherapy: true,
    monitoring: [
      { test: "Spirometry", frequencyMonths: 12, coveredByScheme: true, notes: "Annual FEV1/FVC" },
      { test: "Chest X-ray", frequencyMonths: 12, coveredByScheme: true, notes: "Annual or as clinically indicated" },
    ],
    schemeRules: [
      { scheme: "DH", maxDaysSupply: 30, genericMandatory: true, formularyStrict: true, offFormularyCopay: 20, renewalMonths: 12, applicationRequired: true, applicationMethod: "HealthID", approvalDays: 14, stepTherapyRequired: true, firstLineMeds: "SABA + LAMA (tiotropium) → add LABA → add ICS", notes: "Step therapy enforced. Triple therapy (ICS/LABA/LAMA) = must fail dual first." },
      { scheme: "GEMS", maxDaysSupply: 28, genericMandatory: true, formularyStrict: true, offFormularyCopay: 30, renewalMonths: 12, applicationRequired: true, applicationMethod: "Metropolitan", approvalDays: 21, stepTherapyRequired: true, firstLineMeds: "SABA + LAMA", notes: "GEMS 28-day. Spiriva (tiotropium) on formulary. Triple inhaler requires motivation." },
      { scheme: "BON", maxDaysSupply: 30, genericMandatory: true, formularyStrict: true, formularyTier: "B", offFormularyCopay: 30, renewalMonths: 12, applicationRequired: true, applicationMethod: "Medscheme", approvalDays: 14, stepTherapyRequired: true, firstLineMeds: "SABA + LAMA", notes: "Bonitas Tier B for standard COPD. Triple therapy = Tier C/D." },
    ],
  },

  // ── 8. Chronic Renal Disease ──
  {
    cdlNumber: 8, condition: "Chronic Renal Disease", icd10Primary: "N18",
    icd10Extended: ["N03", "N11", "N18.1", "N18.2", "N18.3", "N18.4", "N18.5", "N18.9"],
    pmbProtected: true, stepTherapy: false,
    monitoring: [
      { test: "Creatinine/eGFR", frequencyMonths: 3, coveredByScheme: true, notes: "Track renal function decline" },
      { test: "Urine ACR (albumin-creatinine ratio)", frequencyMonths: 6, coveredByScheme: true, notes: "Proteinuria monitoring" },
      { test: "Electrolytes", frequencyMonths: 3, coveredByScheme: true, notes: "K+, Na+, phosphate, calcium" },
      { test: "FBC (anaemia)", frequencyMonths: 6, coveredByScheme: true, notes: "Renal anaemia — EPO if Hb <10" },
    ],
    schemeRules: [
      { scheme: "*", maxDaysSupply: 30, genericMandatory: true, formularyStrict: true, offFormularyCopay: 20, renewalMonths: 12, applicationRequired: true, applicationMethod: "Nephrologist submission", approvalDays: 14, stepTherapyRequired: false, firstLineMeds: "ACE-i/ARB, EPO (if anaemic), phosphate binders", notes: "Dialysis = separate pre-auth (ongoing). Transplant = managed programme. EPO (erythropoietin) = high-cost, requires quarterly review." },
      { scheme: "GEMS", maxDaysSupply: 28, genericMandatory: true, formularyStrict: true, offFormularyCopay: 30, renewalMonths: 12, applicationRequired: true, applicationMethod: "Metropolitan", approvalDays: 21, stepTherapyRequired: false, firstLineMeds: "Generic ACE-i + EPO", notes: "GEMS 28-day. EPO authorization strict — must show Hb <10 g/dL." },
      { scheme: "BM", maxDaysSupply: 30, genericMandatory: false, formularyStrict: false, offFormularyCopay: 0, renewalMonths: 12, applicationRequired: true, applicationMethod: "Direct to Bestmed", approvalDays: 10, stepTherapyRequired: false, firstLineMeds: "ACE-i/ARB + EPO", notes: "Bestmed quarterly clinical review for dialysis. More flexible than GEMS." },
    ],
  },

  // ── 9. Coronary Artery Disease ──
  {
    cdlNumber: 9, condition: "Coronary Artery Disease", icd10Primary: "I25",
    icd10Extended: ["I20", "I20.0", "I20.1", "I20.8", "I20.9", "I21", "I22", "I25.0", "I25.1", "I25.5", "I25.9"],
    pmbProtected: true, stepTherapy: false,
    monitoring: [
      { test: "Lipid panel", frequencyMonths: 12, coveredByScheme: true, notes: "LDL target <1.8 mmol/L for high-risk" },
      { test: "Stress test / stress echo", frequencyMonths: 12, coveredByScheme: true, notes: "If symptomatic or post-event" },
      { test: "HbA1c (if diabetic)", frequencyMonths: 6, coveredByScheme: true, notes: "Common comorbidity" },
    ],
    schemeRules: [
      { scheme: "*", maxDaysSupply: 30, genericMandatory: true, formularyStrict: true, offFormularyCopay: 15, renewalMonths: 12, applicationRequired: true, applicationMethod: "Cardiologist/GP submission", approvalDays: 14, stepTherapyRequired: false, firstLineMeds: "Antiplatelet (aspirin/clopidogrel) + statin + beta-blocker", notes: "Standard triple therapy. High-intensity statin (atorvastatin 40-80mg) covered. PCSK9 inhibitors = special motivation." },
      { scheme: "DH", maxDaysSupply: 30, genericMandatory: true, formularyStrict: true, offFormularyCopay: 20, renewalMonths: 12, applicationRequired: true, applicationMethod: "HealthID", approvalDays: 14, stepTherapyRequired: false, firstLineMeds: "Generic aspirin + atorvastatin + beta-blocker", notes: "Discovery: generic statin mandatory. Brand Lipitor = CDA co-pay. PCSK9i (Repatha) requires cardiology motivation + statin failure." },
      { scheme: "GEMS", maxDaysSupply: 28, genericMandatory: true, formularyStrict: true, offFormularyCopay: 30, renewalMonths: 12, applicationRequired: true, applicationMethod: "Metropolitan", approvalDays: 21, stepTherapyRequired: false, firstLineMeds: "Generic antiplatelet + statin + beta-blocker", notes: "GEMS 28-day. Generic atorvastatin on formulary. Brand names = rejected." },
    ],
  },

  // ── 10. Crohn's Disease ──
  {
    cdlNumber: 10, condition: "Crohn's Disease", icd10Primary: "K50",
    icd10Extended: ["K50.0", "K50.1", "K50.8", "K50.9"],
    pmbProtected: true, stepTherapy: true,
    monitoring: [
      { test: "Colonoscopy", frequencyMonths: 24, coveredByScheme: true, notes: "Surveillance colonoscopy every 2 years" },
      { test: "CRP/ESR", frequencyMonths: 3, coveredByScheme: true, notes: "Inflammation markers" },
      { test: "FBC + LFTs", frequencyMonths: 3, coveredByScheme: true, notes: "If on azathioprine — monitor for myelosuppression/hepatotoxicity" },
      { test: "Calprotectin (stool)", frequencyMonths: 6, coveredByScheme: true, notes: "Non-invasive inflammation marker" },
    ],
    schemeRules: [
      { scheme: "*", maxDaysSupply: 30, genericMandatory: true, formularyStrict: true, offFormularyCopay: 25, renewalMonths: 12, applicationRequired: true, applicationMethod: "Gastroenterologist submission", approvalDays: 14, stepTherapyRequired: true, firstLineMeds: "5-ASA (mesalazine) → steroids → azathioprine → biologics", notes: "Step therapy: 5-ASA → immunomodulators → biologics (infliximab/adalimumab). Biologics = high-cost, require specialist motivation." },
      { scheme: "DH", maxDaysSupply: 30, genericMandatory: true, formularyStrict: true, offFormularyCopay: 20, renewalMonths: 12, applicationRequired: true, applicationMethod: "HealthID", approvalDays: 14, stepTherapyRequired: true, firstLineMeds: "5-ASA → azathioprine", notes: "Biologics on Discovery require: failed 2+ conventional therapies, documented disease activity, gastroenterologist motivation. Biosimilars preferred." },
    ],
  },

  // ── 11. Diabetes Insipidus ──
  {
    cdlNumber: 11, condition: "Diabetes Insipidus", icd10Primary: "E23.2",
    icd10Extended: ["N25.1"],
    pmbProtected: true, stepTherapy: false,
    monitoring: [
      { test: "Fluid balance (24hr urine)", frequencyMonths: 6, coveredByScheme: true, notes: "Monitor output" },
      { test: "Electrolytes (Na+)", frequencyMonths: 3, coveredByScheme: true, notes: "Hyponatraemia risk with desmopressin" },
    ],
    schemeRules: [
      { scheme: "*", maxDaysSupply: 30, genericMandatory: false, formularyStrict: false, offFormularyCopay: 0, renewalMonths: 12, applicationRequired: true, applicationMethod: "Endocrinologist submission", approvalDays: 14, stepTherapyRequired: false, firstLineMeds: "Desmopressin (DDAVP)", notes: "Rare condition. Desmopressin is the only treatment. No generic alternative in SA for nasal spray." },
    ],
  },

  // ── 12. Diabetes Mellitus Type 1 ──
  {
    cdlNumber: 12, condition: "Diabetes Mellitus Type 1", icd10Primary: "E10",
    icd10Extended: ["E10.0", "E10.1", "E10.2", "E10.3", "E10.4", "E10.5", "E10.6", "E10.7", "E10.8", "E10.9"],
    pmbProtected: true, stepTherapy: false,
    monitoring: [
      { test: "HbA1c", frequencyMonths: 3, coveredByScheme: true, notes: "Target <7% (53 mmol/mol)" },
      { test: "Annual screening panel", frequencyMonths: 12, coveredByScheme: true, notes: "Eyes, feet, renal, lipids, BP" },
      { test: "Urine microalbumin", frequencyMonths: 12, coveredByScheme: true, notes: "Early nephropathy detection" },
    ],
    schemeRules: [
      { scheme: "DH", maxDaysSupply: 30, genericMandatory: false, formularyStrict: true, offFormularyCopay: 20, renewalMonths: 12, applicationRequired: true, applicationMethod: "HealthID", approvalDays: 14, stepTherapyRequired: false, firstLineMeds: "Basal-bolus insulin or insulin pump", notes: "Insulin pump on Discovery: requires endocrinologist motivation + >3 hypos/month or HbA1c >8.5%. CGM (Libre/Dexcom) = special application." },
      { scheme: "GEMS", maxDaysSupply: 28, genericMandatory: false, formularyStrict: true, offFormularyCopay: 30, renewalMonths: 12, applicationRequired: true, applicationMethod: "Metropolitan", approvalDays: 21, stepTherapyRequired: false, firstLineMeds: "Basal-bolus insulin", notes: "GEMS 28-day insulin supply. Insulin pump = very difficult to get approved. CGM not standard." },
      { scheme: "BON", maxDaysSupply: 30, genericMandatory: false, formularyStrict: true, formularyTier: "A", offFormularyCopay: 30, renewalMonths: 12, applicationRequired: true, applicationMethod: "Medscheme", approvalDays: 14, stepTherapyRequired: false, firstLineMeds: "Basal-bolus insulin", notes: "Insulin on Tier A. Insulin pump on BonComprehensive only. CGM via BonComprehensive." },
    ],
  },

  // ── 13. Diabetes Mellitus Type 2 ──
  {
    cdlNumber: 13, condition: "Diabetes Mellitus Type 2", icd10Primary: "E11",
    icd10Extended: ["E11.0", "E11.1", "E11.2", "E11.3", "E11.4", "E11.5", "E11.6", "E11.7", "E11.8", "E11.9"],
    pmbProtected: true, stepTherapy: true,
    monitoring: [
      { test: "HbA1c", frequencyMonths: 3, coveredByScheme: true, notes: "Target <7% (53 mmol/mol)" },
      { test: "Annual screening panel", frequencyMonths: 12, coveredByScheme: true, notes: "Eyes, feet, renal, lipids, BP" },
      { test: "Renal function", frequencyMonths: 6, coveredByScheme: true, notes: "Creatinine + eGFR + microalbumin" },
    ],
    schemeRules: [
      { scheme: "DH", maxDaysSupply: 30, genericMandatory: true, formularyStrict: true, offFormularyCopay: 20, renewalMonths: 12, applicationRequired: true, applicationMethod: "HealthID", approvalDays: 14, stepTherapyRequired: true, firstLineMeds: "Metformin → add SU/DPP4i → add SGLT2i/GLP-1 → insulin", notes: "STRICT step therapy: metformin first, must fail before adding. GLP-1 agonists (Ozempic) = special motivation + BMI >35 or CVD risk. SGLT2i approved more easily." },
      { scheme: "GEMS", maxDaysSupply: 28, genericMandatory: true, formularyStrict: true, offFormularyCopay: 30, renewalMonths: 12, applicationRequired: true, applicationMethod: "Metropolitan", approvalDays: 21, stepTherapyRequired: true, firstLineMeds: "Generic metformin → generic SU", notes: "GEMS 28-day. Very strict: generic metformin first. GLP-1 agonists nearly impossible to get approved. DPP4i = Tier 2." },
      { scheme: "BON", maxDaysSupply: 30, genericMandatory: true, formularyStrict: true, formularyTier: "A", offFormularyCopay: 30, renewalMonths: 12, applicationRequired: true, applicationMethod: "Medscheme", approvalDays: 14, stepTherapyRequired: true, firstLineMeds: "Metformin → SU → DPP4i → SGLT2i → insulin", notes: "Bonitas: metformin Tier A. DPP4i Tier B. GLP-1 Tier D (30% co-pay). SGLT2i Tier C." },
      { scheme: "MH", maxDaysSupply: 30, genericMandatory: true, formularyStrict: true, offFormularyCopay: 25, renewalMonths: 12, applicationRequired: true, applicationMethod: "Ingwe", approvalDays: 14, stepTherapyRequired: true, firstLineMeds: "Metformin → SU → DPP4i", notes: "Momentum: generic metformin first. GLP-1 = Ingwe special motivation." },
      { scheme: "BM", maxDaysSupply: 30, genericMandatory: false, formularyStrict: false, offFormularyCopay: 10, renewalMonths: 12, applicationRequired: true, applicationMethod: "Direct to Bestmed", approvalDays: 10, stepTherapyRequired: false, firstLineMeds: "Metformin → add based on clinical need", notes: "Bestmed more flexible. SGLT2i and DPP4i approved more easily." },
    ],
  },

  // ── 14. Dysrhythmias ──
  {
    cdlNumber: 14, condition: "Dysrhythmias", icd10Primary: "I49",
    icd10Extended: ["I44", "I45", "I46", "I47", "I48", "I49.0", "I49.1", "I49.5", "I49.9"],
    pmbProtected: true, stepTherapy: false,
    monitoring: [
      { test: "ECG", frequencyMonths: 6, coveredByScheme: true, notes: "Rhythm monitoring" },
      { test: "Holter monitor", frequencyMonths: 12, coveredByScheme: true, notes: "24-48hr ambulatory monitoring" },
      { test: "INR (if on warfarin)", frequencyMonths: 1, coveredByScheme: true, notes: "Warfarin anticoagulation — monthly INR" },
    ],
    schemeRules: [
      { scheme: "*", maxDaysSupply: 30, genericMandatory: true, formularyStrict: true, offFormularyCopay: 15, renewalMonths: 12, applicationRequired: true, applicationMethod: "Cardiologist submission", approvalDays: 14, stepTherapyRequired: false, firstLineMeds: "Amiodarone, beta-blocker, warfarin/NOAC", notes: "NOACs (rivaroxaban, apixaban) preferred over warfarin for AF — no INR monitoring. But NOACs more expensive. Schemes vary on NOAC access." },
      { scheme: "GEMS", maxDaysSupply: 28, genericMandatory: true, formularyStrict: true, offFormularyCopay: 30, renewalMonths: 12, applicationRequired: true, applicationMethod: "Metropolitan", approvalDays: 21, stepTherapyRequired: false, firstLineMeds: "Generic beta-blocker + warfarin", notes: "GEMS: warfarin preferred (cheaper). NOAC requires cardiologist motivation + bleeding risk score." },
    ],
  },

  // ── 15. Epilepsy ──
  {
    cdlNumber: 15, condition: "Epilepsy", icd10Primary: "G40",
    icd10Extended: ["G40.0", "G40.1", "G40.2", "G40.3", "G40.4", "G40.5", "G40.8", "G40.9", "G41"],
    pmbProtected: true, stepTherapy: true,
    monitoring: [
      { test: "Drug levels (AED)", frequencyMonths: 6, coveredByScheme: true, notes: "Carbamazepine, valproate, phenytoin levels" },
      { test: "EEG", frequencyMonths: 12, coveredByScheme: true, notes: "If clinically indicated / new onset" },
      { test: "LFTs (if on valproate)", frequencyMonths: 6, coveredByScheme: true, notes: "Hepatotoxicity monitoring" },
    ],
    schemeRules: [
      { scheme: "*", maxDaysSupply: 30, genericMandatory: true, formularyStrict: true, offFormularyCopay: 20, renewalMonths: 12, applicationRequired: true, applicationMethod: "Neurologist/GP submission", approvalDays: 14, stepTherapyRequired: true, firstLineMeds: "Valproate (generalised) or carbamazepine (focal) → lamotrigine → levetiracetam", notes: "IMPORTANT: AEDs should NOT be substituted to generic without clinical oversight — bioequivalence issues. Schemes may mandate generic but clinicians can motivate brand." },
      { scheme: "DH", maxDaysSupply: 30, genericMandatory: true, formularyStrict: true, offFormularyCopay: 20, renewalMonths: 12, applicationRequired: true, applicationMethod: "HealthID", approvalDays: 14, stepTherapyRequired: true, firstLineMeds: "Generic valproate/carbamazepine → lamotrigine", notes: "Discovery allows brand AED motivation if seizure breakthrough on generic. Levetiracetam (Keppra) = Tier 2." },
      { scheme: "GEMS", maxDaysSupply: 28, genericMandatory: true, formularyStrict: true, offFormularyCopay: 30, renewalMonths: 12, applicationRequired: true, applicationMethod: "Metropolitan", approvalDays: 21, stepTherapyRequired: true, firstLineMeds: "Generic valproate/carbamazepine", notes: "GEMS 28-day. Brand AED very hard to motivate. Must show seizure breakthrough on generic + neurologist letter." },
    ],
  },

  // ── 16. Glaucoma ──
  {
    cdlNumber: 16, condition: "Glaucoma", icd10Primary: "H40",
    icd10Extended: ["H40.0", "H40.1", "H40.2", "H40.3", "H40.4", "H40.5", "H40.8", "H40.9"],
    pmbProtected: true, stepTherapy: true,
    monitoring: [
      { test: "Intraocular pressure (IOP)", frequencyMonths: 3, coveredByScheme: true, notes: "Target IOP based on severity" },
      { test: "Visual fields", frequencyMonths: 6, coveredByScheme: true, notes: "Humphrey or equivalent" },
      { test: "OCT (optic nerve)", frequencyMonths: 12, coveredByScheme: true, notes: "Nerve fibre layer thickness" },
    ],
    schemeRules: [
      { scheme: "*", maxDaysSupply: 30, genericMandatory: true, formularyStrict: true, offFormularyCopay: 15, renewalMonths: 12, applicationRequired: true, applicationMethod: "Ophthalmologist submission", approvalDays: 14, stepTherapyRequired: true, firstLineMeds: "Beta-blocker drops (timolol) → prostaglandin (latanoprost) → combination", notes: "Step therapy: generic timolol first → add/switch to prostaglandin → combination drops. Brand prostaglandins (Lumigan, Xalatan) = co-pay." },
    ],
  },

  // ── 17. Haemophilia ──
  {
    cdlNumber: 17, condition: "Haemophilia", icd10Primary: "D66",
    icd10Extended: ["D67", "D68.0", "D68.1", "D68.2", "D68.4"],
    pmbProtected: true, stepTherapy: false,
    monitoring: [
      { test: "Factor levels", frequencyMonths: 3, coveredByScheme: true, notes: "Factor VIII or IX levels" },
      { test: "FBC", frequencyMonths: 3, coveredByScheme: true, notes: "Anaemia monitoring" },
      { test: "Inhibitor screening", frequencyMonths: 6, coveredByScheme: true, notes: "Check for inhibitory antibodies" },
    ],
    schemeRules: [
      { scheme: "*", maxDaysSupply: 30, genericMandatory: false, formularyStrict: false, offFormularyCopay: 0, renewalMonths: 12, applicationRequired: true, applicationMethod: "Haematologist submission", approvalDays: 14, stepTherapyRequired: false, firstLineMeds: "Factor VIII or IX replacement (recombinant preferred)", notes: "Ultra-high-cost CDL condition. Factor replacement = R50,000-R500,000/month. Schemes manage via specialist haematology programme. Emicizumab (Hemlibra) for inhibitor patients." },
    ],
  },

  // ── 18. HIV/AIDS ──
  {
    cdlNumber: 18, condition: "HIV/AIDS", icd10Primary: "B20",
    icd10Extended: ["B21", "B22", "B23", "B24", "Z21"],
    pmbProtected: true, stepTherapy: true,
    monitoring: [
      { test: "Viral load", frequencyMonths: 6, coveredByScheme: true, notes: "Target: undetectable (<50 copies/mL)" },
      { test: "CD4 count", frequencyMonths: 6, coveredByScheme: true, notes: "Baseline + monitoring" },
      { test: "Renal function", frequencyMonths: 12, coveredByScheme: true, notes: "If on TDF — renal toxicity" },
      { test: "LFTs", frequencyMonths: 12, coveredByScheme: true, notes: "ART hepatotoxicity screening" },
    ],
    schemeRules: [
      { scheme: "*", maxDaysSupply: 30, genericMandatory: true, formularyStrict: true, offFormularyCopay: 10, renewalMonths: 12, applicationRequired: true, applicationMethod: "Via scheme's HIV programme", approvalDays: 7, stepTherapyRequired: true, firstLineMeds: "TLD (tenofovir + lamivudine + dolutegravir) — SA national guideline first-line", notes: "SA follows national ART guidelines. TLD is first-line. Schemes must cover per PMB. Most schemes have dedicated HIV management programmes. Fast-track approval (7 days)." },
      { scheme: "DH", maxDaysSupply: 30, genericMandatory: true, formularyStrict: true, offFormularyCopay: 15, renewalMonths: 12, applicationRequired: true, applicationMethod: "Discovery HIV Programme", approvalDays: 7, stepTherapyRequired: true, firstLineMeds: "TLD (generic)", notes: "Discovery has dedicated HIV Programme. Generic TLD = R150/month. Second-line requires motivation + genotype resistance test." },
      { scheme: "GEMS", maxDaysSupply: 28, genericMandatory: true, formularyStrict: true, offFormularyCopay: 30, renewalMonths: 12, applicationRequired: true, applicationMethod: "Metropolitan HIV Programme", approvalDays: 7, stepTherapyRequired: true, firstLineMeds: "TLD (generic)", notes: "GEMS 28-day. Generic TLD. Government employees — stigma-sensitive processing." },
    ],
  },

  // ── 19. Hyperlipidaemia ──
  {
    cdlNumber: 19, condition: "Hyperlipidaemia", icd10Primary: "E78",
    icd10Extended: ["E78.0", "E78.1", "E78.2", "E78.3", "E78.4", "E78.5"],
    pmbProtected: true, stepTherapy: true,
    monitoring: [
      { test: "Lipid panel (fasting)", frequencyMonths: 12, coveredByScheme: true, notes: "Total chol, LDL, HDL, TG" },
      { test: "LFTs (if on statin)", frequencyMonths: 12, coveredByScheme: true, notes: "Baseline + annual if symptomatic" },
      { test: "CK (if on statin + muscle symptoms)", frequencyMonths: 12, coveredByScheme: true, notes: "Myopathy screening" },
    ],
    schemeRules: [
      { scheme: "*", maxDaysSupply: 30, genericMandatory: true, formularyStrict: true, offFormularyCopay: 15, renewalMonths: 12, applicationRequired: true, applicationMethod: "GP submission with lipid results", approvalDays: 14, stepTherapyRequired: true, firstLineMeds: "Generic statin (atorvastatin/simvastatin) → add ezetimibe → PCSK9i (last resort)", notes: "Most common CDL condition. Generic statin mandatory on all schemes. Ezetimibe for statin-intolerant. PCSK9 inhibitors (evolocumab/alirocumab) = R5,000+/month, require specialist motivation + failed max statin + ezetimibe." },
    ],
  },

  // ── 20. Hypertension ──
  {
    cdlNumber: 20, condition: "Hypertension", icd10Primary: "I10",
    icd10Extended: ["I10", "I11", "I12", "I13", "I15"],
    pmbProtected: true, stepTherapy: true,
    monitoring: [
      { test: "Blood pressure", frequencyMonths: 3, coveredByScheme: false, notes: "In-consultation — no separate billing" },
      { test: "Renal function + electrolytes", frequencyMonths: 12, coveredByScheme: true, notes: "If on ACE-i/ARB — annual K+, creatinine" },
      { test: "Lipid panel", frequencyMonths: 12, coveredByScheme: true, notes: "CV risk assessment" },
    ],
    schemeRules: [
      { scheme: "DH", maxDaysSupply: 30, genericMandatory: true, formularyStrict: true, offFormularyCopay: 20, renewalMonths: 12, applicationRequired: true, applicationMethod: "HealthID", approvalDays: 14, stepTherapyRequired: true, firstLineMeds: "ACE-i/ARB or CCB → add thiazide → triple therapy", notes: "Most common CDL application. Generic mandatory. Combination pills (e.g., perindopril/amlodipine) on formulary but must use generic components if available." },
      { scheme: "GEMS", maxDaysSupply: 28, genericMandatory: true, formularyStrict: true, offFormularyCopay: 30, renewalMonths: 12, applicationRequired: true, applicationMethod: "Metropolitan", approvalDays: 21, stepTherapyRequired: true, firstLineMeds: "Generic ACE-i/ARB + thiazide", notes: "GEMS 28-day. Cheapest generic ACE-i first. Combination pills resisted — GEMS prefers individual components." },
      { scheme: "BON", maxDaysSupply: 30, genericMandatory: true, formularyStrict: true, formularyTier: "A", offFormularyCopay: 30, renewalMonths: 12, applicationRequired: true, applicationMethod: "Medscheme", approvalDays: 14, stepTherapyRequired: true, firstLineMeds: "Generic ACE-i/ARB → add CCB/thiazide", notes: "Bonitas Tier A for first-line BP meds. Combination pills = Tier B. ARBs (losartan, valsartan) = Tier A." },
    ],
  },

  // ── 21. Hypothyroidism ──
  {
    cdlNumber: 21, condition: "Hypothyroidism", icd10Primary: "E03",
    icd10Extended: ["E02", "E03.0", "E03.1", "E03.2", "E03.3", "E03.4", "E03.5", "E03.8", "E03.9"],
    pmbProtected: true, stepTherapy: false,
    monitoring: [
      { test: "TSH", frequencyMonths: 6, coveredByScheme: true, notes: "Target: 0.5-4.0 mIU/L. More frequent when adjusting dose." },
      { test: "Free T4", frequencyMonths: 12, coveredByScheme: true, notes: "If TSH abnormal" },
    ],
    schemeRules: [
      { scheme: "*", maxDaysSupply: 30, genericMandatory: false, formularyStrict: false, offFormularyCopay: 0, renewalMonths: 12, applicationRequired: true, applicationMethod: "GP submission with TSH results", approvalDays: 10, stepTherapyRequired: false, firstLineMeds: "Levothyroxine (Euthyrox/Eltroxin)", notes: "Simple CDL. Levothyroxine is cheap (~R80/month). Brand switching controversial (narrow therapeutic index) — most schemes allow brand choice." },
    ],
  },

  // ── 22. Multiple Sclerosis ──
  {
    cdlNumber: 22, condition: "Multiple Sclerosis", icd10Primary: "G35",
    icd10Extended: [],
    pmbProtected: true, stepTherapy: true,
    monitoring: [
      { test: "MRI brain/spine", frequencyMonths: 12, coveredByScheme: true, notes: "Annual MRI for disease activity" },
      { test: "Neurologist review", frequencyMonths: 6, coveredByScheme: true, notes: "EDSS scoring" },
      { test: "LFTs (if on fingolimod/teriflunomide)", frequencyMonths: 3, coveredByScheme: true, notes: "Hepatotoxicity monitoring" },
    ],
    schemeRules: [
      { scheme: "*", maxDaysSupply: 30, genericMandatory: false, formularyStrict: true, offFormularyCopay: 20, renewalMonths: 12, applicationRequired: true, applicationMethod: "Neurologist submission mandatory", approvalDays: 21, stepTherapyRequired: true, firstLineMeds: "Interferon beta / glatiramer → fingolimod → natalizumab → ocrelizumab", notes: "High-cost CDL. Disease-modifying therapies (DMTs) = R5,000-R30,000/month. Neurologist mandatory. Step therapy: injectables first, then oral, then infusion." },
    ],
  },

  // ── 23. Parkinson's Disease ──
  {
    cdlNumber: 23, condition: "Parkinson's Disease", icd10Primary: "G20",
    icd10Extended: ["G21"],
    pmbProtected: true, stepTherapy: false,
    monitoring: [
      { test: "Neurologist review", frequencyMonths: 6, coveredByScheme: true, notes: "Motor assessment, dose titration" },
    ],
    schemeRules: [
      { scheme: "*", maxDaysSupply: 30, genericMandatory: true, formularyStrict: true, offFormularyCopay: 15, renewalMonths: 12, applicationRequired: true, applicationMethod: "Neurologist submission", approvalDays: 14, stepTherapyRequired: false, firstLineMeds: "Levodopa/carbidopa (Sinemet) ± dopamine agonist", notes: "Levodopa is cornerstone. Generic available. Dopamine agonists (pramipexole, ropinirole) = second-line. MAO-B inhibitors (rasagiline) on formulary." },
    ],
  },

  // ── 24. Rheumatoid Arthritis ──
  {
    cdlNumber: 24, condition: "Rheumatoid Arthritis", icd10Primary: "M05",
    icd10Extended: ["M05.0", "M05.1", "M05.2", "M05.3", "M05.8", "M05.9", "M06.0", "M06.1", "M06.8", "M06.9"],
    pmbProtected: true, stepTherapy: true,
    monitoring: [
      { test: "ESR / CRP", frequencyMonths: 3, coveredByScheme: true, notes: "Disease activity markers" },
      { test: "LFTs (if on methotrexate)", frequencyMonths: 3, coveredByScheme: true, notes: "Hepatotoxicity screening" },
      { test: "FBC (if on methotrexate)", frequencyMonths: 3, coveredByScheme: true, notes: "Myelosuppression monitoring" },
    ],
    schemeRules: [
      { scheme: "*", maxDaysSupply: 30, genericMandatory: true, formularyStrict: true, offFormularyCopay: 20, renewalMonths: 12, applicationRequired: true, applicationMethod: "Rheumatologist submission", approvalDays: 14, stepTherapyRequired: true, firstLineMeds: "NSAIDs + methotrexate → add hydroxychloroquine → add leflunomide → biologics", notes: "Step therapy: must fail methotrexate ± conventional DMARDs before biologics. Biologics (adalimumab, etanercept, infliximab) = R5,000-R15,000/month. Biosimilars preferred." },
    ],
  },

  // ── 25. Schizophrenia ──
  {
    cdlNumber: 25, condition: "Schizophrenia", icd10Primary: "F20",
    icd10Extended: ["F20.0", "F20.1", "F20.2", "F20.3", "F20.5", "F20.6", "F20.8", "F20.9"],
    pmbProtected: true, stepTherapy: true,
    monitoring: [
      { test: "Metabolic monitoring (glucose, lipids, weight)", frequencyMonths: 6, coveredByScheme: true, notes: "Antipsychotics cause metabolic syndrome" },
      { test: "Prolactin (if on risperidone)", frequencyMonths: 12, coveredByScheme: true, notes: "Hyperprolactinaemia" },
      { test: "ECG (if on high-dose antipsychotic)", frequencyMonths: 12, coveredByScheme: true, notes: "QTc prolongation risk" },
    ],
    schemeRules: [
      { scheme: "*", maxDaysSupply: 30, genericMandatory: true, formularyStrict: true, offFormularyCopay: 20, renewalMonths: 12, applicationRequired: true, applicationMethod: "Psychiatrist submission", approvalDays: 14, stepTherapyRequired: true, firstLineMeds: "First-gen (haloperidol) or second-gen (risperidone/olanzapine) → clozapine (treatment-resistant)", notes: "Step therapy: generic first-line → if side effects/failure → second-gen → clozapine for treatment-resistant. Clozapine requires monthly FBC (agranulocytosis risk)." },
    ],
  },

  // ── 26. Systemic Lupus Erythematosus (SLE) ──
  {
    cdlNumber: 26, condition: "Systemic Lupus Erythematosus", icd10Primary: "M32",
    icd10Extended: ["M32.0", "M32.1", "M32.8", "M32.9"],
    pmbProtected: true, stepTherapy: false,
    monitoring: [
      { test: "ANA / anti-dsDNA", frequencyMonths: 6, coveredByScheme: true, notes: "Disease activity markers" },
      { test: "Complement (C3/C4)", frequencyMonths: 6, coveredByScheme: true, notes: "Low complement = active disease" },
      { test: "Renal function + urine", frequencyMonths: 3, coveredByScheme: true, notes: "Lupus nephritis screening" },
      { test: "FBC", frequencyMonths: 3, coveredByScheme: true, notes: "Cytopenia monitoring" },
    ],
    schemeRules: [
      { scheme: "*", maxDaysSupply: 30, genericMandatory: true, formularyStrict: true, offFormularyCopay: 15, renewalMonths: 12, applicationRequired: true, applicationMethod: "Rheumatologist submission", approvalDays: 14, stepTherapyRequired: false, firstLineMeds: "Hydroxychloroquine + NSAIDs ± steroids", notes: "Hydroxychloroquine is backbone of SLE treatment. Biologics (belimumab) for refractory disease — requires specialist motivation." },
    ],
  },

  // ── 27. Ulcerative Colitis ──
  {
    cdlNumber: 27, condition: "Ulcerative Colitis", icd10Primary: "K51",
    icd10Extended: ["K51.0", "K51.1", "K51.2", "K51.3", "K51.4", "K51.5", "K51.8", "K51.9"],
    pmbProtected: true, stepTherapy: true,
    monitoring: [
      { test: "Colonoscopy", frequencyMonths: 24, coveredByScheme: true, notes: "Surveillance every 2 years (cancer risk)" },
      { test: "CRP/ESR", frequencyMonths: 3, coveredByScheme: true, notes: "Inflammation markers" },
      { test: "Calprotectin (stool)", frequencyMonths: 6, coveredByScheme: true, notes: "Non-invasive activity marker" },
      { test: "LFTs (if on azathioprine)", frequencyMonths: 3, coveredByScheme: true, notes: "Hepatotoxicity monitoring" },
    ],
    schemeRules: [
      { scheme: "*", maxDaysSupply: 30, genericMandatory: true, formularyStrict: true, offFormularyCopay: 20, renewalMonths: 12, applicationRequired: true, applicationMethod: "Gastroenterologist submission", approvalDays: 14, stepTherapyRequired: true, firstLineMeds: "5-ASA (mesalazine) → steroids → azathioprine → biologics", notes: "Same step therapy as Crohn's (CDL 10). Biologics = must fail conventional therapy. Vedolizumab (gut-selective) gaining approval over infliximab for UC." },
    ],
  },
];

// ─── EXPORTS ──────────────────────────────────────────────────────────────────

/** Look up CDL rules for a specific ICD-10 code */
export function getCDLRulesForCode(icd10: string): CDLConditionRule | undefined {
  const upper = icd10.toUpperCase().trim();
  return CDL_CONDITION_RULES.find(r =>
    upper.startsWith(r.icd10Primary) ||
    r.icd10Extended.some(ext => upper.startsWith(ext))
  );
}

/** Get scheme-specific CDL rules for a condition + scheme */
export function getCDLSchemeRule(cdlNumber: number, schemeCode: string): CDLSchemeRule | undefined {
  const condition = CDL_CONDITION_RULES.find(r => r.cdlNumber === cdlNumber);
  if (!condition) return undefined;
  const upper = schemeCode.toUpperCase().trim();
  return condition.schemeRules.find(r => r.scheme.toUpperCase() === upper) ||
    condition.schemeRules.find(r => r.scheme === "*");
}

/** Get monitoring rules for a CDL condition */
export function getCDLMonitoring(cdlNumber: number): MonitoringRule[] {
  const condition = CDL_CONDITION_RULES.find(r => r.cdlNumber === cdlNumber);
  return condition?.monitoring || [];
}

/** Total CDL rule count (conditions × scheme variants × monitoring rules) */
export function getCDLRuleCount(): number {
  let count = 0;
  for (const condition of CDL_CONDITION_RULES) {
    count += condition.schemeRules.length;
    count += condition.monitoring.length;
  }
  return count;
}

/** Get all conditions */
export function getAllCDLConditions(): { cdlNumber: number; condition: string; icd10: string }[] {
  return CDL_CONDITION_RULES.map(r => ({
    cdlNumber: r.cdlNumber,
    condition: r.condition,
    icd10: r.icd10Primary,
  }));
}
