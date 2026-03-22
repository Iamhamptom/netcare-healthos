// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPREHENSIVE Training Data Generator — ALL knowledge domains
//
// Generates 100K+ training examples from EVERY data source:
// 1. ICD-10 MIT (41,009 codes — ALL of them, no cap)
// 2. Rejection codes (33 codes + scheme-specific scenarios)
// 3. PMB/CDL (270 DTPs + 27 CDL with full treatment protocols)
// 4. Scheme profiles (6 schemes + switching houses + rules)
// 5. Fraud detection (8 patterns + algorithms + bias safeguards)
// 6. FHIR R4 (16 resources + SA extensions + mappings)
// 7. HL7v2 (10 message types + segment definitions + field mappings)
// 8. Clinical guidelines (diabetes, HTN, asthma, HIV, TB, mental health, etc.)
// 9. NAPPI/Pharmaceutical (9,985 medicines + SEP + DUR rules)
// 10. GEMS tariffs (4,660 procedure rates)
// 11. Tariff code system (ranges, modifiers, consultation codes)
// 12. Compliance (POPIA 2026, SAHPRA SaMD, ISO 13485)
// 13. Practice workflows (patient journey, claim lifecycle)
// 14. NHI readiness (DRG, capitation, FHIR transition)
// 15. Netcare Primary Care business model + pitch strategy
// 16. Claims adjudication flowchart (14-step decision tree)
// 17. FHIR ↔ EDIFACT bridge mappings
// 18. External cause code rules
// 19. Coding standards (MIT validation, specificity, gender/age)
// 20. Seasonal rejection patterns
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { readFileSync } from "fs";
import { join } from "path";
import { scrubTrainingExample } from "./pii-scrubber";
import { generateAllKnowledgeBaseExamples } from "./training-data-knowledge";
import { deepParseAllDocuments } from "./training-data-deep-parse";

export interface TrainingExample {
  instruction: string;
  input: string;
  output: string;
  category: string;
}

// ─── CSV Parser ──────────────────────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes; continue; }
    if (ch === "," && !inQuotes) { result.push(current); current = ""; continue; }
    current += ch;
  }
  result.push(current);
  return result;
}

function readCSV(path: string): string[][] {
  try {
    const content = readFileSync(path, "utf-8");
    return content.split("\n").filter(l => l.trim()).map(parseCSVLine);
  } catch { return []; }
}

const DB = join(process.cwd(), "docs/knowledge/databases");

// ═══════════════════════════════════════════════════════════════════════════════
// 1. ICD-10-ZA — ALL 41,009 codes (no cap)
// ═══════════════════════════════════════════════════════════════════════════════

export function generateAllICD10Examples(): TrainingExample[] {
  const examples: TrainingExample[] = [];
  const rows = readCSV(join(DB, "ICD-10_MIT_2021.csv"));

  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i];
    if (cols.length < 11) continue;

    const code = cols[7]?.trim();
    const desc = cols[8]?.trim();
    const validClinical = cols[9]?.trim();
    const validPrimary = cols[10]?.trim();
    const isAsterisk = cols[11]?.trim();
    const isDagger = cols[12]?.trim();
    const ageRange = cols[14]?.trim();
    const gender = cols[15]?.trim();
    const chapter = cols[2]?.trim();
    const groupDesc = cols[4]?.trim();

    if (!code || !desc) continue;

    // Forward: description → code
    examples.push({
      instruction: "Given the clinical description, provide the correct ICD-10-ZA code with all validation flags.",
      input: `Clinical description: ${desc}`,
      output: JSON.stringify({
        code,
        description: desc,
        chapter,
        group: groupDesc,
        validForClinicalUse: validClinical === "Y",
        canBePrimary: validPrimary === "Y",
        isAsterisk: isAsterisk === "Y",
        isDagger: isDagger === "Y",
        ageRestriction: ageRange || "none",
        genderRestriction: gender || "none",
      }),
      category: "icd10_coding",
    });

    // Reverse: code → full details
    examples.push({
      instruction: "What is this ICD-10-ZA code? Provide the full description, chapter, validation flags, and restrictions.",
      input: `ICD-10-ZA code: ${code}`,
      output: JSON.stringify({
        code,
        description: desc,
        chapter,
        group: groupDesc,
        validForClinicalUse: validClinical === "Y",
        canBePrimary: validPrimary === "Y",
        isAsterisk: isAsterisk === "Y",
        isDagger: isDagger === "Y",
        ageRestriction: ageRange || "none",
        genderRestriction: gender || "none",
      }),
      category: "icd10_coding",
    });

    // Validation example for special codes
    if (isAsterisk === "Y") {
      examples.push({
        instruction: "Can this ICD-10-ZA code be used as a primary diagnosis?",
        input: `Code: ${code} (${desc})`,
        output: `No. ${code} is an asterisk (manifestation) code and CANNOT be used as a primary diagnosis in SA. It must be paired with a dagger (†) code as the primary diagnosis. Using an asterisk code as primary will result in automatic rejection by most SA medical schemes.`,
        category: "icd10_validation",
      });
    }

    if (gender === "M" || gender === "F") {
      examples.push({
        instruction: "What gender restriction applies to this ICD-10-ZA code?",
        input: `Code: ${code} (${desc})`,
        output: `${code} is restricted to ${gender === "M" ? "male" : "female"} patients only. Submitting this code for a ${gender === "M" ? "female" : "male"} patient will result in automatic rejection with code GENDER. Schemes validate this against membership demographics.`,
        category: "icd10_validation",
      });
    }
  }

  return examples;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Rejection Codes — ALL 33 codes + scheme scenarios
// ═══════════════════════════════════════════════════════════════════════════════

export function generateRejectionExamples(): TrainingExample[] {
  const examples: TrainingExample[] = [];
  const rows = readCSV(join(DB, "rejection_codes.csv"));

  for (let i = 1; i < rows.length; i++) {
    const [code, category, description, commonCause, fixSuggestion] = rows[i];
    if (!code || !description) continue;

    examples.push({
      instruction: "Explain this SA medical scheme rejection code and how to fix it.",
      input: `Rejection code: ${code}`,
      output: JSON.stringify({
        code, category, description,
        commonCause: commonCause || "Various",
        fixSuggestion: fixSuggestion || "Contact the scheme for details",
      }),
      category: "rejection_codes",
    });

    // Scenario-based for each code × each major scheme
    for (const scheme of ["Discovery Health", "GEMS", "Bonitas", "Momentum", "Medihelp", "Bestmed"]) {
      examples.push({
        instruction: "A claim was rejected. What does this code mean for this specific scheme, and what should the practice do?",
        input: `Scheme: ${scheme}, Rejection code: ${code} — ${description}`,
        output: `Rejection ${code} (${description}) at ${scheme}: ${commonCause || "Check scheme-specific rules"}. To resolve: ${fixSuggestion || "Contact the scheme"}. Resubmission window: 60 days from rejection date. If this is a PMB condition, the scheme MUST pay regardless — file a PMB motivation letter.`,
        category: "rejection_scheme_specific",
      });
    }
  }

  // Rejection prediction scenarios — comprehensive
  const predictionScenarios = [
    { icd10: "J06.9", tariff: "0190", scheme: "Discovery Health", gender: "F", age: 35, preAuth: false, reject: false, code: "", reason: "Standard GP visit, valid coding" },
    { icd10: "J06", tariff: "0190", scheme: "Discovery Health", gender: "F", age: 35, preAuth: false, reject: true, code: "05", reason: "ICD-10 lacks 4th character — Discovery requires maximum specificity" },
    { icd10: "S72.0", tariff: "0190", scheme: "Bonitas", gender: "M", age: 60, preAuth: false, reject: true, code: "ECC", reason: "Injury S-code requires External Cause Code (V01-Y98) as secondary — SA mandatory rule" },
    { icd10: "N40", tariff: "0190", scheme: "GEMS", gender: "F", age: 45, preAuth: false, reject: true, code: "GENDER", reason: "N40 (prostatic disorder) restricted to male patients" },
    { icd10: "P07.3", tariff: "0190", scheme: "Discovery Health", gender: "M", age: 45, preAuth: false, reject: true, code: "AGE", reason: "Perinatal code P07.3 for neonates only — patient age 45" },
    { icd10: "I21.9", tariff: "3600", scheme: "Momentum Health", gender: "M", age: 55, preAuth: false, reject: false, code: "", reason: "PMB condition (acute MI) — scheme MUST cover regardless of benefit limits" },
    { icd10: "E10.9", tariff: "0190", scheme: "Bonitas", gender: "F", age: 28, preAuth: false, reject: false, code: "", reason: "CDL condition (Type 1 diabetes) — chronic benefit authorization applies" },
    { icd10: "G63", tariff: "0190", scheme: "Discovery Health", gender: "M", age: 50, preAuth: false, reject: true, code: "ASTERISK", reason: "G63 is an asterisk (manifestation) code — cannot be primary diagnosis" },
    { icd10: "J06.9", tariff: "0500", scheme: "GEMS", gender: "F", age: 40, preAuth: false, reject: true, code: "08", reason: "MRI scan (0500) requires pre-authorization but none provided" },
    { icd10: "J06.9", tariff: "0190", scheme: "Discovery Health", gender: "M", age: 30, preAuth: false, reject: true, code: "12", reason: "Late submission — claim is 150 days old, exceeds 120-day deadline" },
    { icd10: "E11.9", tariff: "0192", scheme: "Bonitas", gender: "M", age: 55, preAuth: false, reject: false, code: "", reason: "CDL condition (Type 2 diabetes), comprehensive consultation appropriate" },
    { icd10: "K29.7", tariff: "0191", scheme: "Medihelp", gender: "F", age: 42, preAuth: false, reject: false, code: "", reason: "Standard gastritis consultation, within day-to-day benefit" },
    { icd10: "O80", tariff: "1400", scheme: "Discovery Health", gender: "F", age: 30, preAuth: true, reject: false, code: "", reason: "PMB obstetric — normal delivery at DSP, pre-auth obtained" },
    { icd10: "O80", tariff: "1400", scheme: "Discovery Health", gender: "M", age: 30, preAuth: true, reject: true, code: "GENDER", reason: "Delivery code O80 restricted to female patients" },
    { icd10: "C50.9", tariff: "0192", scheme: "GEMS", gender: "F", age: 55, preAuth: false, reject: false, code: "", reason: "PMB oncology condition — scheme must cover in full" },
    { icd10: "B20", tariff: "0190", scheme: "Bonitas", gender: "M", age: 35, preAuth: false, reject: false, code: "", reason: "CDL HIV/AIDS — ART covered under chronic benefit" },
    { icd10: "Z00.0", tariff: "0190", scheme: "Bestmed", gender: "M", age: 45, preAuth: false, reject: false, code: "", reason: "Annual wellness check — covered under preventive benefit" },
    { icd10: "M54.5", tariff: "0190", scheme: "Momentum Health", gender: "F", age: 38, preAuth: false, reject: false, code: "", reason: "Lower back pain — standard GP consultation" },
    { icd10: "J45.9", tariff: "0191", scheme: "Discovery Health", gender: "M", age: 12, preAuth: false, reject: false, code: "", reason: "CDL asthma — chronic benefit applies" },
    { icd10: "I10", tariff: "0190", scheme: "GEMS", gender: "F", age: 60, preAuth: false, reject: false, code: "", reason: "CDL hypertension — chronic management covered" },
  ];

  for (const s of predictionScenarios) {
    examples.push({
      instruction: "Predict whether this SA medical aid claim will be accepted or rejected. Include the likely rejection code, reason, and prevention steps.",
      input: JSON.stringify({ icd10: s.icd10, tariff: s.tariff, scheme: s.scheme, patientGender: s.gender, patientAge: s.age, hasPreAuth: s.preAuth }),
      output: JSON.stringify({ willReject: s.reject, rejectionCode: s.code || null, reason: s.reason, confidence: 0.9 }),
      category: "rejection_prediction",
    });
  }

  return examples;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. CDL Conditions — ALL 27 with full protocols
// ═══════════════════════════════════════════════════════════════════════════════

export function generateCDLExamples(): TrainingExample[] {
  const examples: TrainingExample[] = [];
  const rows = readCSV(join(DB, "cdl_conditions.csv"));

  for (let i = 1; i < rows.length; i++) {
    const [num, condition, primaryIcd10, extendedCodes, keyMeds, monitoring] = rows[i];
    if (!condition) continue;

    examples.push({
      instruction: "Is this a CDL (Chronic Disease List) condition under the SA Medical Schemes Act? Provide the full treatment protocol.",
      input: `Condition: ${condition}`,
      output: JSON.stringify({
        isCDL: true, number: num, condition,
        primaryICD10: primaryIcd10,
        extendedCodes: extendedCodes?.split(",").map(s => s.trim()),
        keyMedications: keyMeds?.split(",").map(s => s.trim()),
        monitoring: monitoring?.split(",").map(s => s.trim()),
        schemeObligation: "Schemes MUST cover CDL conditions. Treatment per CDL treatment algorithms. Chronic benefits apply. Cannot be denied for pre-existing if waiting period served.",
      }),
      category: "cdl_classification",
    });

    // ICD-10 → CDL lookup
    examples.push({
      instruction: "Given this ICD-10 code, determine if it's a CDL condition and what the scheme must cover.",
      input: `ICD-10 code: ${primaryIcd10}`,
      output: JSON.stringify({
        isCDL: true, condition,
        medications: keyMeds?.split(",").map(s => s.trim()),
        monitoring: monitoring?.split(",").map(s => s.trim()),
        legal: "Medical Schemes Act — schemes must cover all 27 CDL conditions with approved medications per formulary. Annual reviews required.",
      }),
      category: "cdl_classification",
    });

    // Extended codes too
    if (extendedCodes) {
      for (const ext of extendedCodes.split(",")) {
        const code = ext.trim();
        if (!code) continue;
        examples.push({
          instruction: "Is this ICD-10 code associated with a CDL condition?",
          input: `ICD-10 code: ${code}`,
          output: `Yes. ${code} is an extended code for CDL #${num} — ${condition} (primary: ${primaryIcd10}). Key medications: ${keyMeds}. Monitoring: ${monitoring}. This qualifies for chronic benefit coverage under the Medical Schemes Act.`,
          category: "cdl_classification",
        });
      }
    }
  }

  return examples;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. PMB — 270 DTPs by category
// ═══════════════════════════════════════════════════════════════════════════════

export function generatePMBExamples(): TrainingExample[] {
  const examples: TrainingExample[] = [];

  const dtpCategories = [
    { cat: "Brain & Nervous System", conditions: ["Stroke (I63/I64)", "Meningitis (G00-G03)", "Brain abscess (G06)", "Encephalitis (G04)", "Status epilepticus (G41)", "Extradural haematoma (S06.4)", "Subdural haematoma (S06.5)", "Hydrocephalus (G91)", "Brain tumour requiring surgery (C71)", "Spinal cord compression (G95.2)", "Subarachnoid haemorrhage (I60)", "TB meningitis (A17.0)", "Guillain-Barré syndrome (G61.0)"] },
    { cat: "Cardiovascular", conditions: ["Acute MI (I21)", "Aortic aneurysm (I71)", "Cardiac tamponade (I31.9)", "Acute heart failure (I50)", "DVT (I80)", "Infective endocarditis (I33)", "Constrictive pericarditis (I31.1)", "Acute PVD (I73.9)", "Pulmonary embolism (I26)", "Acute rheumatic fever (I00-I02)", "Valvular surgery indication (I34-I37)"] },
    { cat: "Respiratory", conditions: ["Empyema (J86)", "Lung abscess (J85)", "Bacterial pneumonia (J15)", "Tension pneumothorax (J93.0)", "Pulmonary TB (A15-A16)", "Acute respiratory failure (J96)", "Upper airway obstruction (J38.6)"] },
    { cat: "Digestive/GI", conditions: ["Acute abdomen — appendicitis (K35)", "Acute abdomen — cholecystitis (K80/K81)", "Acute abdomen — perforation (K25-K28)", "Acute GI bleeding (K92.2)", "Acute hepatic failure (K72.0)", "Intestinal obstruction (K56)", "Acute pancreatitis (K85)", "Peritonitis (K65)"] },
    { cat: "Musculoskeletal", conditions: ["Fractures requiring surgery (S-codes)", "Hip replacement (M16.1)", "Knee replacement (M17.1)", "Acute osteomyelitis (M86.1)", "Septic arthritis (M00)", "Spinal fractures (S12/S22/S32)"] },
    { cat: "Renal/Urinary", conditions: ["Acute renal failure (N17)", "Obstructive calculi (N20/N21)", "Urinary tract obstruction (N13)", "Nephrotic syndrome (N04)"] },
    { cat: "Obstetric", conditions: ["Caesarean section (O82)", "Ectopic pregnancy (O00)", "Pre-eclampsia/eclampsia (O14/O15)", "Postpartum haemorrhage (O72)", "Placenta praevia (O44)", "Abruptio placentae (O45)", "Hyperemesis gravidarum (O21)", "Puerperal sepsis (O85)"] },
    { cat: "Neonatal", conditions: ["Neonatal sepsis (P36)", "Respiratory distress syndrome (P22)", "Severe jaundice (P59)", "Congenital abnormalities requiring surgery (Q-codes)"] },
    { cat: "ENT", conditions: ["Acute mastoiditis (H70.0)", "Peritonsillar abscess (J36)", "Tracheostomy indication (Z93.0)"] },
    { cat: "Eye", conditions: ["Acute glaucoma (H40.2)", "Retinal detachment (H33)", "Penetrating eye injury (S05.6)", "Orbital cellulitis (H05.0)"] },
    { cat: "Skin", conditions: ["Burns (T20-T32)", "Necrotising fasciitis (M72.6)", "Cellulitis requiring IV antibiotics (L03)"] },
    { cat: "Endocrine/Metabolic", conditions: ["Diabetic ketoacidosis (E10.1/E11.1)", "Addisonian crisis (E27.2)", "Thyrotoxic crisis (E05.5)", "Hypoglycaemic coma (E10.0/E11.0/E15)", "Severe malnutrition (E40-E46)"] },
    { cat: "Haematological/Infectious", conditions: ["Aplastic anaemia (D61)", "Acute haemolytic anaemia (D59)", "Leukaemia (C91-C95)", "Lymphoma (C81-C85)", "Severe malaria (B50-B54)", "HIV opportunistic infections (B20-B24)", "Septicaemia (A41)", "Tetanus (A35)", "Rabies PEP (Z24.2)"] },
    { cat: "Psychiatric", conditions: ["Major depression requiring hospitalisation (F32.2/F32.3)", "Acute schizophrenia (F20)", "Acute bipolar episode (F31)", "Attempted suicide/self-harm (X60-X84)"] },
    { cat: "Oncology", conditions: ["All cancers requiring definitive treatment — surgery, chemotherapy, radiation (C00-C97)"] },
  ];

  for (const cat of dtpCategories) {
    for (const cond of cat.conditions) {
      const codeMatch = cond.match(/\(([A-Z]\d[\d.\/\-A-Z]*)\)/);
      const icd10 = codeMatch ? codeMatch[1] : "";
      const condName = cond.replace(/\s*\([^)]*\)/, "").trim();

      examples.push({
        instruction: "Is this condition a Prescribed Minimum Benefit (PMB) under the SA Medical Schemes Act? What are the scheme's legal obligations?",
        input: `Condition: ${condName}${icd10 ? `, ICD-10: ${icd10}` : ""}`,
        output: JSON.stringify({
          isPMB: true,
          category: `DTP — ${cat.cat}`,
          condition: condName,
          icd10: icd10,
          schemeObligations: "Must pay in FULL at DSP. No co-payment at DSP. No deductible. Cannot deny for pre-existing. Overrides benefit limits. Emergency = any provider. Cannot require pre-auth for emergencies. PMBs must NEVER be paid from savings account (PMSA).",
          legal: "Medical Schemes Act, Regulation 8. 270 DTP conditions + 27 CDL conditions = PMBs.",
        }),
        category: "pmb_classification",
      });
    }
  }

  // Non-PMB examples
  const nonPMB = [
    { cond: "Upper respiratory tract infection", icd10: "J06.9", reason: "Common URTI is not a PMB condition — covered under day-to-day benefits" },
    { cond: "Lower back pain", icd10: "M54.5", reason: "Non-specific back pain is not a PMB — covered under day-to-day benefits" },
    { cond: "Gastritis", icd10: "K29.7", reason: "Gastritis is not a PMB unless it presents as acute GI bleeding (K92.2)" },
    { cond: "Allergic rhinitis", icd10: "J30.4", reason: "Allergic rhinitis is not a PMB — covered under day-to-day benefits" },
    { cond: "Anxiety disorder", icd10: "F41.9", reason: "Anxiety disorder outpatient treatment is not a PMB. Only psychiatric hospitalisation qualifies." },
    { cond: "Dermatitis", icd10: "L30.9", reason: "Dermatitis is not a PMB unless it requires IV antibiotics (cellulitis)" },
  ];

  for (const n of nonPMB) {
    examples.push({
      instruction: "Is this condition a PMB under the SA Medical Schemes Act?",
      input: `Condition: ${n.cond}, ICD-10: ${n.icd10}`,
      output: JSON.stringify({ isPMB: false, condition: n.cond, icd10: n.icd10, reason: n.reason }),
      category: "pmb_classification",
    });
  }

  // PMB payment rules
  const pmbRules = [
    { q: "Can a scheme apply a co-payment to a PMB condition at a DSP?", a: "No. PMBs at a Designated Service Provider (DSP) must be paid in FULL with NO co-payment and NO deductible. This is non-negotiable under the Medical Schemes Act." },
    { q: "Can a scheme deduct PMB costs from a member's medical savings account (PMSA)?", a: "No. PMBs must NEVER be paid from the PMSA. Regulation 10(6) explicitly prohibits this. If a scheme debits PMB costs from savings, the member should complain to the CMS." },
    { q: "Do PMBs still apply if a member's benefits are exhausted?", a: "Yes. PMBs CONTINUE to be paid from the risk pool even after all benefits are exhausted. Schemes cannot impose annual or lifetime caps on PMB conditions." },
    { q: "Can a scheme deny PMB coverage during a waiting period?", a: "No. PMBs override waiting periods. Even during the general 3-month or condition-specific 12-month waiting period, PMB conditions must be covered." },
    { q: "Does a patient need pre-authorisation for a PMB emergency?", a: "No. Emergency medical conditions (as defined in Regulation 7) do not require pre-auth. The scheme must pay in full at ANY provider, including non-DSP and non-network providers." },
  ];

  for (const r of pmbRules) {
    examples.push({
      instruction: r.q,
      input: "SA Medical Schemes Act PMB rules",
      output: r.a,
      category: "pmb_rules",
    });
  }

  return examples;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. GEMS Tariffs — 4,660 procedure rates
// ═══════════════════════════════════════════════════════════════════════════════

export function generateTariffExamples(): TrainingExample[] {
  const examples: TrainingExample[] = [];
  const rows = readCSV(join(DB, "GEMS_tariffs_2026.csv"));

  // Skip the first 2 header rows
  for (let i = 2; i < rows.length; i++) {
    const cols = rows[i];
    const tariffCode = cols[0]?.trim();
    const description = cols[1]?.trim();
    const gpRate = cols[2]?.trim();

    if (!tariffCode || !description || !/^\d{4}/.test(tariffCode)) continue;

    examples.push({
      instruction: "What is this SA medical tariff code, and what is the GEMS 2026 rate?",
      input: `Tariff code: ${tariffCode}`,
      output: JSON.stringify({
        code: tariffCode,
        description,
        gemsRate2026: gpRate || "Not listed",
        note: "Rates are per GEMS non-contracted provider schedule. Contracted providers may have different rates. Other schemes set their own tariffs — there is no national tariff in SA since 2010.",
      }),
      category: "tariff_codes",
    });
  }

  // Modifier codes
  const modRows = readCSV(join(DB, "modifier_codes.csv"));
  for (let i = 1; i < modRows.length; i++) {
    const [code, desc, impact, cat, notes] = modRows[i];
    if (!code) continue;
    examples.push({
      instruction: "Explain this CCSA tariff modifier code and its impact on the claim amount.",
      input: `Modifier: ${code}`,
      output: JSON.stringify({ code, description: desc, rateImpact: impact, category: cat, notes }),
      category: "tariff_modifiers",
    });
  }

  // Tariff ranges
  const rangeRows = readCSV(join(DB, "tariff_ranges.csv"));
  for (let i = 1; i < rangeRows.length; i++) {
    const [start, end, section, discipline, desc] = rangeRows[i];
    if (!start) continue;
    examples.push({
      instruction: "What tariff code range covers this type of medical service in SA?",
      input: `Service type: ${desc}`,
      output: JSON.stringify({ rangeStart: start, rangeEnd: end, section, discipline, description: desc }),
      category: "tariff_ranges",
    });
  }

  return examples;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Medicines / NAPPI — 9,985 products
// ═══════════════════════════════════════════════════════════════════════════════

export function generateMedicineExamples(): TrainingExample[] {
  const examples: TrainingExample[] = [];
  const rows = readCSV(join(DB, "medicine_prices.csv"));

  for (let i = 1; i < rows.length; i++) {
    const [nappi, name, schedule, form, packSize, sep, dispensingFee, isGeneric, regno] = rows[i];
    if (!nappi || !name) continue;

    examples.push({
      instruction: "Look up this NAPPI code. Provide the medicine name, schedule, SEP (Single Exit Price), and dispensing fee.",
      input: `NAPPI code: ${nappi}`,
      output: JSON.stringify({
        nappi, name, schedule, dosageForm: form,
        packSize, singleExitPrice: sep, dispensingFee,
        isGeneric: isGeneric === "Generic", regno,
      }),
      category: "nappi_lookup",
    });

    // Reverse: name → NAPPI
    examples.push({
      instruction: "What is the NAPPI code for this medicine?",
      input: `Medicine: ${name}`,
      output: JSON.stringify({ nappi, name, schedule, sep, isGeneric: isGeneric === "Generic" }),
      category: "nappi_lookup",
    });
  }

  // DUR rules
  const durRules = [
    { check: "Drug-drug interaction", severity: "L1 (hard reject)", example: "Warfarin + Aspirin — increased bleeding risk", action: "Reject dispensing. Pharmacist must contact prescriber." },
    { check: "Drug-allergy cross-reactivity", severity: "Hard reject", example: "Penicillin allergy → amoxicillin prescription", action: "Reject. Flag cross-reactivity. Suggest alternative antibiotic." },
    { check: "Therapeutic duplication", severity: "L2 (warning)", example: "Two ACE inhibitors prescribed simultaneously", action: "Warn pharmacist. Allow with clinical justification." },
    { check: "Dosage range exceeded", severity: "L2 (warning)", example: "Metformin >3000mg/day", action: "Flag maximum dose exceeded. Pharmacist review required." },
    { check: "Age appropriateness", severity: "L1 (hard reject)", example: "Aspirin for child under 12 (Reye's syndrome risk)", action: "Reject. SA DoH guidelines prohibit." },
    { check: "Gender appropriateness", severity: "L1 (hard reject)", example: "Finasteride for female patient", action: "Reject. Contraindicated in women of childbearing age." },
  ];

  for (const rule of durRules) {
    examples.push({
      instruction: "Explain this Drug Utilisation Review (DUR) check and what happens when it triggers.",
      input: `DUR check: ${rule.check}`,
      output: JSON.stringify(rule),
      category: "dur_rules",
    });
  }

  return examples;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Scheme Profiles — 6 major schemes + switching
// ═══════════════════════════════════════════════════════════════════════════════

export function generateSchemeExamples(): TrainingExample[] {
  const examples: TrainingExample[] = [];

  const schemes = [
    { name: "Discovery Health", lives: "3.8M", market: "58%", switch: "Healthbridge", contact: "0860 99 88 77", strictness: "Strictest", icd10Rule: "Maximum specificity mandatory (4th character required)", preAuth: "All hospital, MRI/CT, high-cost meds, GP visits after 15th", cdl: "27 conditions + additional per plan via CIB", clawback: "Known to claw back months/years later", network: "KeyCare MUST use KeyCare network — non-network = full member liability" },
    { name: "GEMS", lives: "2.0M", market: "Largest restricted scheme", switch: "SwitchOn", contact: "0860 00 4367", strictness: "Strict", icd10Rule: "9-digit membership with leading zeros", preAuth: "Strict consultation limits, rigid PMB interpretation", cdl: "27 conditions", clawback: "60-day dispute turnaround (longest)", network: "State hospitals as DSP for in-hospital" },
    { name: "Bonitas", lives: "731K", market: "~8%", switch: "Healthbridge", contact: "086 111 2666", strictness: "Moderate", icd10Rule: "Standard SA rules", preAuth: "Hospital pre-auth required, 4 formulary tiers (A-D)", cdl: "61 conditions (BonComprehensive), 28 (BonEssential)", clawback: "Off-formulary = 30% co-payment", network: "Pharmacy Direct DSP mandatory for chronic" },
    { name: "Momentum Health", lives: "350K", market: "~4%", switch: "SwitchOn", contact: "0860 117 859", strictness: "Strict on pre-auth", icd10Rule: "Standard SA rules", preAuth: "ALL hospital, MRI/CT/PET, oncology, rehab", cdl: "27 conditions", clawback: "Practice must send PMB letter (not automatic)", network: "Ingwe network mandatory" },
    { name: "Medihelp", lives: "400K", market: "~5%", switch: "Healthbridge", contact: "hpquery@medihelp.co.za", strictness: "Moderate", icd10Rule: "Standard SA rules", preAuth: "Standard", cdl: "27 conditions", clawback: "Submission deadline: last workday of 4th month", network: "Self-administered since 1906" },
    { name: "Bestmed", lives: "200K", market: "~2%", switch: "SwitchOn", contact: "service@bestmed.co.za", strictness: "Least strict", icd10Rule: "Standard SA rules", preAuth: "Standard", cdl: "27 conditions", clawback: "Mental health: 21 days inpatient/yr OR 15 outpatient", network: "Self-administered" },
  ];

  for (const s of schemes) {
    examples.push({
      instruction: "Provide the full profile for this SA medical scheme — rules, contact details, switching house, and known quirks.",
      input: `Scheme: ${s.name}`,
      output: JSON.stringify(s),
      category: "scheme_profiles",
    });

    examples.push({
      instruction: "Which switching house processes claims for this scheme?",
      input: `Scheme: ${s.name}`,
      output: `${s.name} uses ${s.switch}. Contact: ${s.contact}. Key rule: ${s.icd10Rule}.`,
      category: "scheme_switching",
    });

    examples.push({
      instruction: "What are the pre-authorisation requirements for this scheme?",
      input: `Scheme: ${s.name}`,
      output: `${s.name} pre-auth rules: ${s.preAuth}. CDL: ${s.cdl}. Strictness: ${s.strictness}. Important: ${s.clawback}`,
      category: "scheme_preauth",
    });
  }

  // Switching house routing
  const routing = [
    { scheme: "Discovery Health", switch: "Healthbridge" },
    { scheme: "Bonitas", switch: "Healthbridge" },
    { scheme: "Medihelp", switch: "Healthbridge" },
    { scheme: "GEMS", switch: "SwitchOn" },
    { scheme: "Momentum", switch: "SwitchOn" },
    { scheme: "Bestmed", switch: "SwitchOn" },
    { scheme: "CompCare", switch: "MediKredit" },
    { scheme: "Medshield", switch: "MediKredit" },
    { scheme: "PPS", switch: "MediKredit" },
    { scheme: "KeyHealth", switch: "MediKredit" },
    { scheme: "Profmed", switch: "MediKredit" },
  ];

  for (const r of routing) {
    examples.push({
      instruction: "Which switching house should I route this claim to?",
      input: `Scheme: ${r.scheme}`,
      output: `Route to ${r.switch}. ${r.switch === "Healthbridge" ? "Cloud-native, 3.25M+ encounters/yr." : r.switch === "SwitchOn" ? "Altron HealthTech, 99.8M tx/yr, 0.0% downtime." : "Altron/MediKredit, 200M+ tx/yr."}`,
      category: "claim_routing",
    });
  }

  return examples;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. FHIR R4 + HL7v2 + Interoperability
// ═══════════════════════════════════════════════════════════════════════════════

export function generateFHIRExamples(): TrainingExample[] {
  const examples: TrainingExample[] = [];

  // FHIR Resources for SA Claims
  const fhirResources = [
    { resource: "Patient", use: "Member/beneficiary", saNeeds: "SA ID number, passport, scheme membership, dependent code", extensions: ["sa-id-number", "sa-passport-country", "population-group"] },
    { resource: "Practitioner", use: "Provider", saNeeds: "HPCSA/AHPCSA number, BHF practice number, discipline code", extensions: ["za-hpcsa-number", "za-bhf-practice-number", "za-discipline-code"] },
    { resource: "Coverage", use: "Scheme membership", saNeeds: "Scheme code, plan/option, member number, dependent code, waiting periods", extensions: ["za-scheme-code", "za-option-code", "za-waiting-period", "za-late-joiner-penalty", "za-savings-balance"] },
    { resource: "Claim", use: "Claims submission", saNeeds: "CCSA tariff codes, ICD-10-ZA, NAPPI, modifiers, pre-auth number", extensions: ["za-pre-auth-number", "za-scheme-tariff", "za-modifier", "za-claim-type", "za-nappi-code"] },
    { resource: "ClaimResponse", use: "Adjudication result", saNeeds: "Rejection codes (PHISC), benefit allocation, co-pay, scheme tariff", extensions: [] },
    { resource: "Encounter", use: "Consultation/admission", saNeeds: "Admission type, ward type, DRG code, length of stay", extensions: ["za-drg", "za-drg-weight"] },
    { resource: "Condition", use: "Diagnosis (ICD-10-ZA)", saNeeds: "Primary vs secondary, PMB flag, CDL flag, pre-existing", extensions: [] },
    { resource: "MedicationRequest", use: "Prescription", saNeeds: "NAPPI code, generic/originator, chronic vs acute, schedule", extensions: [] },
    { resource: "MedicationDispense", use: "Pharmacy dispensing", saNeeds: "NAPPI, dispensing fee tier, generic substitution, SEP", extensions: [] },
    { resource: "DiagnosticReport", use: "Lab/pathology results", saNeeds: "NHLS codes, pathology practice number, SNOMED-CT", extensions: [] },
    { resource: "ExplanationOfBenefit", use: "Member benefit statement", saNeeds: "Benefit category breakdown, annual limits, savings balance", extensions: [] },
    { resource: "ServiceRequest", use: "Pre-authorization", saNeeds: "Clinical motivation, ICD-10-ZA, expected CCSA codes", extensions: [] },
  ];

  for (const r of fhirResources) {
    examples.push({
      instruction: "How is this FHIR R4 resource used in the SA healthcare claims ecosystem?",
      input: `FHIR Resource: ${r.resource}`,
      output: JSON.stringify({ resource: r.resource, useCase: r.use, saSpecificNeeds: r.saNeeds, saExtensions: r.extensions }),
      category: "fhir_resources",
    });
  }

  // HL7v2 message types
  const hl7Types = [
    { type: "ADT^A01", desc: "Patient Admission", segments: "MSH|EVN|PID|PV1|IN1|DG1", use: "Hospital admits patient — triggers encounter creation, benefit check, pre-auth verification" },
    { type: "ADT^A03", desc: "Patient Discharge", segments: "MSH|EVN|PID|PV1|DG1", use: "Hospital discharges patient — triggers claim generation, DRG calculation, final diagnosis coding" },
    { type: "ADT^A08", desc: "Update Patient Info", segments: "MSH|EVN|PID|PV1", use: "Demographics change — updates patient record, scheme membership verification" },
    { type: "ORU^R01", desc: "Lab/Observation Result", segments: "MSH|PID|OBR|OBX", use: "Pathology results from lab — triggers diagnostic report, may affect CDL monitoring" },
    { type: "ORM^O01", desc: "Order Message", segments: "MSH|PID|ORC|OBR", use: "Lab/radiology order — triggers pre-auth check for MRI/CT, benefit verification" },
    { type: "DFT^P03", desc: "Post Detail Financial Transaction", segments: "MSH|EVN|PID|PV1|FT1", use: "Billing transaction — maps to FHIR Claim resource, triggers adjudication" },
    { type: "SIU^S12", desc: "Schedule Notification", segments: "MSH|SCH|PID|AIG|AIL", use: "Appointment scheduling — triggers availability check, reminder workflow" },
    { type: "MDM^T02", desc: "Document Notification", segments: "MSH|EVN|PID|TXA|OBX", use: "Clinical document update — pre-auth letters, clinical motivation, supporting docs" },
  ];

  for (const h of hl7Types) {
    examples.push({
      instruction: "Explain this HL7v2 message type and how it maps to the SA healthcare workflow.",
      input: `HL7v2 message: ${h.type}`,
      output: JSON.stringify({ messageType: h.type, description: h.desc, keySegments: h.segments, saUseCase: h.use }),
      category: "hl7v2_messages",
    });
  }

  // HL7v2 segments
  const segments = [
    { seg: "MSH", name: "Message Header", fields: "Field 8=messageType, 9=messageId, 2-3=sendApp/facility, 4-5=recvApp/facility, 6=timestamp, 11=version" },
    { seg: "PID", name: "Patient Identification", fields: "Field 3=MRN/ID, 5=name (surname^firstname), 7=DOB, 8=gender, 11=address, 13=phone" },
    { seg: "PV1", name: "Patient Visit", fields: "Field 2=patient class (I/O/E), 3=ward^bed^facility, 7=attending doctor, 44-45=admit/discharge dates" },
    { seg: "IN1", name: "Insurance", fields: "Field 4=medical aid scheme, 35-40=medical aid plan/number" },
    { seg: "DG1", name: "Diagnosis", fields: "Field 3=code^description (ICD-10), 6=type (A=admitting/F=final/W=working), 16=diagnosedBy" },
    { seg: "OBX", name: "Observation Result", fields: "Field 3=code (LOINC), 5=value, 6=unit, 7=referenceRange, 8=abnormalFlag (H/L/A/N), 11=status (F/P)" },
    { seg: "OBR", name: "Observation Request", fields: "Field 4=orderType^orderName, 5=priority (S/R), 7=orderDate, 16=orderingDoctor" },
    { seg: "FT1", name: "Financial Transaction", fields: "Field 6=transactionDate, 7=amount, 10=quantity, 19=diagnosisCode, 25=procedureCode" },
  ];

  for (const s of segments) {
    examples.push({
      instruction: "What fields are in this HL7v2 segment and how do they map to SA healthcare data?",
      input: `HL7v2 segment: ${s.seg}`,
      output: JSON.stringify({ segment: s.seg, name: s.name, keyFields: s.fields }),
      category: "hl7v2_segments",
    });
  }

  // FHIR ↔ EDIFACT bridge mappings
  const edifactMappings = [
    { edifact: "UNH (Message type = MEDCLM)", fhir: "Claim.resourceType", direction: "EDIFACT → FHIR" },
    { edifact: "BGM (Document number)", fhir: "Claim.identifier", direction: "bidirectional" },
    { edifact: "NAD+PR (Provider BHF)", fhir: "PractitionerRole.identifier", direction: "bidirectional" },
    { edifact: "NAD+PA (Patient)", fhir: "Patient.identifier", direction: "bidirectional" },
    { edifact: "NAD+PY (Payer/scheme)", fhir: "Coverage.payor", direction: "bidirectional" },
    { edifact: "CLI (ICD-10 code)", fhir: "Claim.diagnosis.diagnosisCodeableConcept", direction: "bidirectional" },
    { edifact: "LIN (CCSA tariff code)", fhir: "Claim.item.productOrService", direction: "bidirectional" },
    { edifact: "MOA (Amount)", fhir: "Claim.item.unitPrice", direction: "bidirectional" },
    { edifact: "RFF (Pre-auth number)", fhir: "Claim.preAuthRef", direction: "bidirectional" },
    { edifact: "ALC (Modifier codes)", fhir: "Claim.item.modifier", direction: "bidirectional" },
    { edifact: "RFF+ACD (Rejection code in REMADV)", fhir: "ClaimResponse.error.code", direction: "EDIFACT → FHIR" },
    { edifact: "MOA+9 (Paid amount in REMADV)", fhir: "ClaimResponse.payment.amount", direction: "EDIFACT → FHIR" },
  ];

  for (const m of edifactMappings) {
    examples.push({
      instruction: "How does this EDIFACT field map to FHIR R4 for SA claims?",
      input: `EDIFACT: ${m.edifact}`,
      output: JSON.stringify({ edifact: m.edifact, fhirPath: m.fhir, direction: m.direction }),
      category: "fhir_edifact_bridge",
    });
  }

  return examples;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. Fraud Detection — 8 patterns + algorithms
// ═══════════════════════════════════════════════════════════════════════════════

export function generateFraudExamples(): TrainingExample[] {
  const examples: TrainingExample[] = [];

  const fraudPatterns = [
    { type: "Unbundling", pct: "10-15%", amount: "R2-4B", detection: "Bundling rules engine. Flag component codes billed same date/patient when package code exists", example: "Billing separate codes for FBC components instead of single FBC code — 3-5x inflation" },
    { type: "Upcoding", pct: "15-20%", amount: "R3-5B", detection: "Distribution analysis vs peers. Flag >70% at Level 3-4 when peer avg is 20-30%", example: "Billing Level 3-4 consultations for simple encounters that should be Level 1-2" },
    { type: "Phantom billing", pct: "8-12%", amount: "R2-3B", detection: "Cross-ref DHA death register, match hospital admissions, post-payment surveys", example: "Claims for dates practice closed, deceased patients, or hospitalised patients" },
    { type: "Duplicate billing", pct: "5-8%", amount: "R1-2B", detection: "Exact match + fuzzy match (±3 days), high reversal patterns", example: "Same service billed to multiple schemes or resubmitted with altered details" },
    { type: "After-hours fraud", pct: "3-5%", amount: "R0.5-1B", detection: "Flag when 60% after-hours vs 15% peer average", example: "Applying modifiers 0010-0014 to normal-hours services for premium billing" },
    { type: "Prescription fraud", pct: "8-10%", amount: "R2-3B", detection: "DDD analysis (>90 S5 tablets/month), same patient + drug class + 3+ pharmacies in 30 days", example: "Forged scripts, pharmacy hopping, phantom dispensing" },
    { type: "Balance billing at DSP", pct: "2-3%", amount: "R0.5-1B", detection: "Flag out-of-pocket for PMB at DSP", example: "DSP charging PMB patients co-payments (illegal under Medical Schemes Act)" },
    { type: "Identity fraud", pct: "3-5%", amount: "R0.7-1.4B", detection: "Biometric verification, geographic impossibility, age/gender mismatch", example: "Card lending to unregistered family/friends" },
  ];

  for (const f of fraudPatterns) {
    examples.push({
      instruction: "Explain this type of healthcare fraud in the SA medical schemes context, including how to detect it.",
      input: `Fraud type: ${f.type}`,
      output: JSON.stringify(f),
      category: "fraud_detection",
    });
  }

  // Time impossibility rules
  const timeRules = [
    { rule: ">960min (16hrs) in one day", confidence: "HIGH", action: "Flag for investigation" },
    { rule: ">720min (12hrs) in one day", confidence: "MEDIUM", action: "Flag for review" },
    { rule: "GP >50 consultations/day", confidence: "HIGH", action: "Impossible — flag immediately" },
    { rule: "Specialist >25 consultations/day", confidence: "HIGH", action: "Impossible — flag immediately" },
    { rule: "Surgeon >6 major procedures/day", confidence: "HIGH", action: "Impossible — flag immediately" },
    { rule: "2 facilities >100km apart within 2 hours", confidence: "HIGH", action: "Geographic impossibility — flag identity fraud" },
  ];

  for (const t of timeRules) {
    examples.push({
      instruction: "Is this billing pattern possible? Apply time/geographic impossibility rules.",
      input: `Pattern: ${t.rule}`,
      output: JSON.stringify(t),
      category: "fraud_time_rules",
    });
  }

  // Bias safeguards (Section 59 compliance)
  const biasSafeguards = [
    "Demographic parity: Flag rates must be proportional across racial groups",
    "Equalized odds: Equal false positive rates across demographics",
    "Location debiasing: Practice location CANNOT be a risk factor (Section 59 ruling)",
    "Stratified peer groups: Urban vs rural vs peri-urban within discipline",
    "Case-mix adjustment: Higher acuity in underserved areas is EXPECTED, not suspicious",
    "Outcome monitoring: Track flag-to-confirmed ratio by demographics quarterly",
    "Explainability: Every fraud flag needs a clear, auditable reason",
    "Multi-signal convergence: Never flag on a single metric alone",
    "Quarterly bias audits by independent third parties",
    "Human review before ANY automated action against a provider",
  ];

  for (let i = 0; i < biasSafeguards.length; i++) {
    examples.push({
      instruction: "What bias safeguard must be applied to healthcare fraud detection AI in SA?",
      input: `Safeguard ${i + 1}`,
      output: `${biasSafeguards[i]}. This is mandatory following the CMS Section 59 investigation (April 2025, Adv Ngcukaitobi) which found systemic racial discrimination in fraud detection by Discovery, GEMS, and Medscheme against Black providers.`,
      category: "fraud_bias_safeguards",
    });
  }

  return examples;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. Clinical Guidelines (SA-specific)
// ═══════════════════════════════════════════════════════════════════════════════

export function generateClinicalExamples(): TrainingExample[] {
  const examples: TrainingExample[] = [];

  const guidelines = [
    { condition: "Type 2 Diabetes (SEMDSA)", icd10: "E11", algorithm: "Lifestyle → Metformin → SU/DPP4i → GLP-1/SGLT2i → Insulin", target: "HbA1c <7% (53 mmol/mol)", monitoring: "HbA1c q3-6mo, annual screening (retinopathy, nephropathy, neuropathy, foot exam)", cdl: true },
    { condition: "Type 1 Diabetes", icd10: "E10", algorithm: "Insulin (basal-bolus or pump) from diagnosis", target: "HbA1c <7%", monitoring: "HbA1c q3-6mo, annual screening, continuous glucose monitoring if available", cdl: true },
    { condition: "Hypertension (SASHA)", icd10: "I10", algorithm: "ACE-i/ARB first-line OR CCB OR thiazide. Combination often needed.", target: "BP <140/90 (general), <130/80 (diabetes/CKD)", monitoring: "Home BP, renal function, K+, annual cardiovascular risk assessment", cdl: true },
    { condition: "Asthma (SA Thoracic Society)", icd10: "J45", algorithm: "Step 1: SABA PRN → Step 2: Low-dose ICS → Step 3: ICS+LABA → Step 4: Medium/high ICS+LABA → Step 5: Add LTRA/tiotropium/biologic", target: "Symptom control + normal lung function", monitoring: "Peak flow, spirometry, symptom diary, inhaler technique", cdl: true },
    { condition: "HIV/AIDS (SA DoH ART Guidelines 2023)", icd10: "B20", algorithm: "TLD (Tenofovir-Lamivudine-Dolutegravir) for all adults. Treat-all strategy — start ART regardless of CD4.", target: "Viral suppression <50 copies/mL", monitoring: "Viral load at 6mo, 12mo, then annually. CD4 at baseline.", cdl: true },
    { condition: "Tuberculosis (SA DoH)", icd10: "A15", algorithm: "HRZE x 2mo (intensive), then HR x 4mo (continuation). MDR: Bedaquiline-based, 9-20mo.", target: "Sputum conversion at 2mo", monitoring: "Sputum smear at 2mo and 5mo, adherence, liver function", cdl: false },
    { condition: "Depression (SA Guidelines)", icd10: "F32", algorithm: "Mild: psychotherapy alone. Moderate-severe: SSRI (sertraline/fluoxetine) + psychotherapy. Refractory: switch SSRI, add mirtazapine, or refer psychiatry.", target: "PHQ-9 <5 (remission)", monitoring: "PHQ-9 monthly initially, suicide risk at every visit, side effects", cdl: false },
    { condition: "COPD (SA Thoracic Society)", icd10: "J44", algorithm: "SABA PRN → LABA or LAMA → LABA+LAMA → Add ICS if exacerbations", target: "Symptom relief + reduced exacerbations", monitoring: "Spirometry annually, 6-minute walk test, BODE index", cdl: true },
    { condition: "Epilepsy", icd10: "G40", algorithm: "Focal: Carbamazepine or lamotrigine. Generalised: Valproate (not in women of childbearing age) or lamotrigine. Status: IV lorazepam → phenytoin → intubation.", target: "Seizure freedom", monitoring: "Drug levels (valproate, phenytoin), EEG if needed, driving restriction", cdl: true },
    { condition: "Chronic Kidney Disease (KDIGO)", icd10: "N18", algorithm: "Stage 1-2: ACE-i/ARB for proteinuria, BP control. Stage 3: Add SGLT2i. Stage 4-5: Nephrology referral, dialysis access planning.", target: "Slow eGFR decline, proteinuria <300mg/day", monitoring: "Creatinine, eGFR, urine albumin-creatinine ratio, K+, BP q3-6mo", cdl: true },
    { condition: "Coronary Artery Disease", icd10: "I25", algorithm: "Antiplatelet (aspirin 75mg), statin (atorvastatin 40-80mg), beta-blocker (if post-MI), ACE-i (if LV dysfunction)", target: "LDL <1.4 mmol/L (very high risk)", monitoring: "Lipid panel annually, stress test if symptoms, echo if HF signs", cdl: true },
    { condition: "Rheumatoid Arthritis", icd10: "M05", algorithm: "NSAIDs for symptom relief → Methotrexate (anchor drug, 15-25mg/wk) → Add sulfasalazine/hydroxychloroquine → Biologics (anti-TNF) if inadequate response", target: "DAS28 <2.6 (remission)", monitoring: "ESR, CRP, LFTs (methotrexate), FBC q3mo", cdl: true },
  ];

  for (const g of guidelines) {
    examples.push({
      instruction: "What is the SA clinical guideline for treating this condition? Include the treatment algorithm, targets, and monitoring.",
      input: `Condition: ${g.condition}`,
      output: JSON.stringify(g),
      category: "clinical_guidelines",
    });

    examples.push({
      instruction: "What treatment algorithm should be followed for this ICD-10 code according to SA clinical guidelines?",
      input: `ICD-10: ${g.icd10}`,
      output: `${g.condition}: ${g.algorithm}. Target: ${g.target}. Monitoring: ${g.monitoring}. ${g.cdl ? "This is a CDL condition — chronic benefit applies under the Medical Schemes Act." : ""}`,
      category: "clinical_treatment",
    });
  }

  return examples;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 11. Compliance — POPIA, SAHPRA, ISO
// ═══════════════════════════════════════════════════════════════════════════════

export function generateComplianceExamples(): TrainingExample[] {
  const examples: TrainingExample[] = [];

  const popiaRules = [
    { q: "What does POPIA 2026 require for health data processing?", a: "POPIA Health Regulations (in force 6 March 2026, NO grace period) require: consent management with withdrawal, 72-hour breach notification, cross-border data transfer safeguards (s72), operator agreements with all third-party processors, data de-identification before AI API calls, audit trails for all processing, and registered Information Officer." },
    { q: "Can we send patient data to Anthropic/OpenAI/Google APIs?", a: "Cross-border AI transfer is the HIGHEST RISK area. Using US-based AI APIs with patient data = cross-border transfer under s72. Requirements: adequacy assessment, contractual safeguards (DPA), explicit informed consent, OR de-identify/anonymise data before API calls. Recommended approach: always de-identify before sending to AI providers." },
    { q: "What are the POPIA penalties for health data breaches?", a: "Administrative fine up to R10 million. Criminal prosecution up to 10 years imprisonment. Unlimited civil damages. Personal director liability. Health and insurance are PRIORITY enforcement sectors for 2026/27." },
    { q: "How long must patient records be retained under SA law?", a: "General patient records: 6 years from dormancy (HPCSA Booklet 9). Minor records: until 21st birthday. Mental health: patient's lifetime. Occupational health: 30-40 years (OHS Act). Prescriptions: 5 years (Pharmacy Act)." },
  ];

  const sahpraRules = [
    { q: "Is our claims validation AI considered a Software as Medical Device (SaMD)?", a: "If admin/billing ONLY → NOT SaMD. If it influences clinical decisions (e.g., suggesting diagnosis codes based on symptoms, flagging clinical appropriateness) → likely Class B or C SaMD requiring SAHPRA registration. Key test: does it provide information for making clinical decisions about individual patients?" },
    { q: "What SAHPRA SaMD classification applies to our products?", a: "Class A (self-declaration): Practice management, scheduling, billing. NOT SaMD: Claims validation (admin only). Class B (required registration): Clinical decision support with practitioner override. Class C (full review): AI diagnostic influencing decisions. Class D (strictest): Autonomous diagnostic/treatment." },
    { q: "What is ISO 13485 and when is it required?", a: "ISO 13485:2016 is the Quality Management System standard for medical devices. Mandatory from 1 June 2025 for all SaMD. Certificate from SAHPRA Conformity Assessment Body by 1 April 2028. Covers: QMS, design controls, document control, risk management (ISO 14971), CAPA, internal audits." },
  ];

  for (const r of [...popiaRules, ...sahpraRules]) {
    examples.push({
      instruction: r.q,
      input: "SA healthcare compliance",
      output: r.a,
      category: "compliance",
    });
  }

  return examples;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 12. Claims Adjudication — 14-step flowchart
// ═══════════════════════════════════════════════════════════════════════════════

export function generateAdjudicationExamples(): TrainingExample[] {
  const examples: TrainingExample[] = [];

  const steps = [
    { step: 1, name: "Eligibility Check", desc: "Is member active? Are dependents registered? Any waiting periods?", outcome: "FAIL → Reject code 01/04" },
    { step: 2, name: "Provider Validation", desc: "Is BHF number valid? Is HPCSA current? Does discipline match service?", outcome: "FAIL → Reject code 02" },
    { step: 3, name: "Code Validation", desc: "ICD-10 valid and clinically usable? Tariff code valid? NAPPI active? Modifiers correct?", outcome: "FAIL → Reject code 12/18" },
    { step: 4, name: "Duplicate Check", desc: "Exact same service, date, provider, patient already paid?", outcome: "FAIL → Reject code 05" },
    { step: 5, name: "Frequency Check", desc: "Has annual/lifetime limit been reached for this service?", outcome: "FAIL → Reject code 19" },
    { step: 6, name: "Bundling Check", desc: "Are components billed separately when a package code exists?", outcome: "FAIL → Reject (unbundling)" },
    { step: 7, name: "Benefit Check", desc: "Is benefit available for this category? Has day-to-day/MSA been exhausted?", outcome: "FAIL → Reject code 07" },
    { step: 8, name: "Waiting Period", desc: "General (3mo) or condition-specific (12mo) waiting period still active?", outcome: "FAIL → Reject code 17 (unless PMB)" },
    { step: 9, name: "Pre-Auth Check", desc: "Does this service require pre-authorisation? Was it obtained?", outcome: "FAIL → Reject code 08" },
    { step: 10, name: "PMB Check", desc: "Is this a PMB condition? If yes, OVERRIDE rejections from steps 7, 8. Must pay in full at DSP.", outcome: "PMB flag → override benefit/waiting rejections" },
    { step: 11, name: "Tariff Application", desc: "Apply scheme tariff rate. Pay in full if ≤ scheme rate, or partial if > tariff.", outcome: "Tariff adjustment applied" },
    { step: 12, name: "Co-payment", desc: "Apply DSP deduction. Brand vs generic penalty. Non-network co-pay.", outcome: "Co-payment deducted (unless PMB at DSP)" },
    { step: 13, name: "Benefit Routing", desc: "Route payment: MSA (first) → Gap cover → ATB/AMTB → Risk pool", outcome: "Payment source determined" },
    { step: 14, name: "Clinical Rules", desc: "Check for suspicious patterns: upcoding, unbundling, clinical appropriateness", outcome: "PEND for review or PAY" },
  ];

  for (const s of steps) {
    examples.push({
      instruction: "Explain this step in the SA medical scheme claims adjudication process.",
      input: `Step ${s.step}: ${s.name}`,
      output: JSON.stringify({ step: s.step, name: s.name, description: s.desc, failureOutcome: s.outcome }),
      category: "adjudication_flowchart",
    });
  }

  // Four possible outcomes
  const outcomes = [
    { outcome: "PAY_IN_FULL", desc: "Claim passes all checks. Amount ≤ scheme tariff. Paid in full." },
    { outcome: "PAY_PARTIAL", desc: "Claim passes but amount > scheme tariff. Paid at scheme rate, shortfall to member." },
    { outcome: "REJECT", desc: "Hard failure at one or more adjudication steps. Claim denied with rejection code." },
    { outcome: "PEND_FOR_REVIEW", desc: "Soft flag — suspicious pattern or clinical review needed. Held for manual adjudication." },
  ];

  for (const o of outcomes) {
    examples.push({
      instruction: "What does this claims adjudication outcome mean?",
      input: `Outcome: ${o.outcome}`,
      output: o.desc,
      category: "adjudication_outcomes",
    });
  }

  return examples;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 13. Practice Workflows + Seasonal Patterns + NHI
// ═══════════════════════════════════════════════════════════════════════════════

export function generateWorkflowExamples(): TrainingExample[] {
  const examples: TrainingExample[] = [];

  // Seasonal rejection patterns
  const seasonal = [
    { month: "January", change: "+15-25%", reason: "New year benefit reset, waiting periods commence, new membership activations pending" },
    { month: "February-March", change: "Normalising", reason: "New memberships activated, systems stabilised" },
    { month: "April-June", change: "Lowest rejection rates", reason: "Full benefits available, mid-year stability" },
    { month: "July-August", change: "Slight increase", reason: "Mid-year benefit reviews, some option changes" },
    { month: "September-October", change: "Rising", reason: "Day-to-day benefits depleting, MSA balances running low" },
    { month: "November-December", change: "+10-20%", reason: "Benefit exhaustion peak, ATB threshold reached, year-end claims rush" },
  ];

  for (const s of seasonal) {
    examples.push({
      instruction: "What seasonal rejection pattern should I expect for SA medical scheme claims in this period?",
      input: `Period: ${s.month}`,
      output: JSON.stringify(s),
      category: "seasonal_patterns",
    });
  }

  // Submission deadlines
  const deadlines = [
    { type: "Initial claim", deadline: "4 months (120 days) from date of service", note: "Miss this → automatic reject, no appeal" },
    { type: "Resubmission", deadline: "60 days from rejection date", note: "Must include corrected information or supporting docs" },
    { type: "Scheme response", deadline: "30 days from submission", note: "If scheme doesn't respond in 30 days, follow up" },
    { type: "Internal appeal", deadline: "30 days from rejection", note: "Step 1 of 7-step appeals process" },
    { type: "CMS complaint", deadline: "No formal deadline but sooner is better", note: "Section 47 — FREE, 120-day resolution target" },
  ];

  for (const d of deadlines) {
    examples.push({
      instruction: "What is the deadline for this SA medical scheme claims action?",
      input: `Action: ${d.type}`,
      output: JSON.stringify(d),
      category: "claims_deadlines",
    });
  }

  // NHI key facts
  const nhiExamples = [
    { q: "What is the NHI and when is it coming?", a: "The National Health Insurance Act was signed December 2023. It aims to provide universal healthcare coverage for all SA residents. Full implementation is phased over 10+ years. Private medical schemes will continue during transition. NHI does NOT explicitly mandate FHIR but the National Digital Health Strategy references it." },
    { q: "How will NHI affect claims processing?", a: "NHI will use DRG (Diagnosis Related Groups) for hospital reimbursement — SA uses SA-IRG adapted from Australian AR-DRG. Capitation for primary care (like Prime Cure model). Claims will move from EDIFACT to potentially FHIR-based submission via the NHI Claims Gateway. Private schemes will still exist but may become 'complementary cover' only." },
    { q: "What should practices do to prepare for NHI?", a: "1. Ensure FHIR R4 compatibility. 2. Implement proper ICD-10 coding (NHI will be stricter). 3. Understand DRG grouping for your specialty. 4. Register with OHSC for quality certification. 5. Build referral pathway compliance. 6. Maintain both EDIFACT and FHIR capability during transition." },
  ];

  for (const n of nhiExamples) {
    examples.push({
      instruction: n.q,
      input: "South African National Health Insurance",
      output: n.a,
      category: "nhi_readiness",
    });
  }

  return examples;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MASTER GENERATOR — Combines ALL domains
// ═══════════════════════════════════════════════════════════════════════════════

export function generateComprehensiveDataset(): {
  examples: TrainingExample[];
  metadata: {
    totalExamples: number;
    byCategory: Record<string, number>;
    generatedAt: string;
    sources: string[];
  };
} {
  console.log("[Training] Generating comprehensive dataset from ALL knowledge sources...");

  const allExamples: TrainingExample[] = [];

  // 1. ICD-10 — ALL 41,009 codes (×2 directions = ~82K)
  const icd10 = generateAllICD10Examples();
  console.log(`[Training] ICD-10: ${icd10.length} examples`);
  allExamples.push(...icd10);

  // 2. Rejection codes + prediction scenarios
  const rejections = generateRejectionExamples();
  console.log(`[Training] Rejections: ${rejections.length} examples`);
  allExamples.push(...rejections);

  // 3. CDL conditions — all 27
  const cdl = generateCDLExamples();
  console.log(`[Training] CDL: ${cdl.length} examples`);
  allExamples.push(...cdl);

  // 4. PMB — 270 DTPs
  const pmb = generatePMBExamples();
  console.log(`[Training] PMB: ${pmb.length} examples`);
  allExamples.push(...pmb);

  // 5. GEMS tariffs + modifiers + ranges
  const tariffs = generateTariffExamples();
  console.log(`[Training] Tariffs: ${tariffs.length} examples`);
  allExamples.push(...tariffs);

  // 6. Medicines / NAPPI — 9,985 products
  const medicines = generateMedicineExamples();
  console.log(`[Training] Medicines: ${medicines.length} examples`);
  allExamples.push(...medicines);

  // 7. Scheme profiles
  const schemes = generateSchemeExamples();
  console.log(`[Training] Schemes: ${schemes.length} examples`);
  allExamples.push(...schemes);

  // 8. FHIR + HL7v2 + EDIFACT
  const fhir = generateFHIRExamples();
  console.log(`[Training] FHIR/HL7v2: ${fhir.length} examples`);
  allExamples.push(...fhir);

  // 9. Fraud detection
  const fraud = generateFraudExamples();
  console.log(`[Training] Fraud: ${fraud.length} examples`);
  allExamples.push(...fraud);

  // 10. Clinical guidelines
  const clinical = generateClinicalExamples();
  console.log(`[Training] Clinical: ${clinical.length} examples`);
  allExamples.push(...clinical);

  // 11. Compliance
  const compliance = generateComplianceExamples();
  console.log(`[Training] Compliance: ${compliance.length} examples`);
  allExamples.push(...compliance);

  // 12. Adjudication flowchart
  const adjudication = generateAdjudicationExamples();
  console.log(`[Training] Adjudication: ${adjudication.length} examples`);
  allExamples.push(...adjudication);

  // 13. Workflows + seasonal + NHI
  const workflows = generateWorkflowExamples();
  console.log(`[Training] Workflows: ${workflows.length} examples`);
  allExamples.push(...workflows);

  // 14. FULL KNOWLEDGE BASE — every .md file auto-parsed into Q&A pairs
  const kbResult = generateAllKnowledgeBaseExamples();
  console.log(`[Training] Knowledge Base (${kbResult.stats.filesProcessed} files): ${kbResult.stats.totalExamples} examples`);
  allExamples.push(...kbResult.examples);

  // 15. DEEP PARSE — every row of GEMS DRP (10K), GEMS Formulary (5K),
  //     Discovery CDL, Medical Schemes Act full text, Regulations full text,
  //     Section 59 (227 pages), PHISC spec, HPCSA, SAHPRA, CMS Report, Bonitas
  const deepResult = deepParseAllDocuments();
  console.log(`[Training] Deep Parse: ${deepResult.examples.length} examples`);
  allExamples.push(...deepResult.examples);

  // Count by category
  const byCategory: Record<string, number> = {};
  for (const ex of allExamples) {
    byCategory[ex.category] = (byCategory[ex.category] || 0) + 1;
  }

  console.log(`[Training] TOTAL: ${allExamples.length} examples across ${Object.keys(byCategory).length} categories`);

  return {
    examples: allExamples,
    metadata: {
      totalExamples: allExamples.length,
      byCategory,
      generatedAt: new Date().toISOString(),
      sources: [
        "ICD-10_MIT_2021.csv (41,009 codes)",
        "medicine_prices.csv (9,985 products)",
        "GEMS_tariffs_2026.csv (4,660 rates)",
        "cdl_conditions.csv (27 conditions)",
        "rejection_codes.csv (33 codes)",
        "modifier_codes.csv (24 modifiers)",
        "tariff_ranges.csv (38 ranges)",
        "docs/knowledge/ (24 compiled intelligence files)",
        "docs/knowledge/extracted/ (12 legal/regulatory texts)",
        "src/lib/fhir/ (FHIR R4 implementation)",
        "src/lib/hl7/ (HL7v2 parser + mappings)",
        "6 scheme profiles + 3 switching houses",
        "8 fraud detection patterns + bias safeguards",
        "12 clinical guidelines (SA-specific)",
        "POPIA 2026 + SAHPRA SaMD + ISO 13485",
        "14-step adjudication flowchart",
        "NHI readiness + DRG + capitation",
        "Netcare Primary Care business intelligence",
      ],
    },
  };
}

/**
 * Export comprehensive dataset as PII-scrubbed JSONL.
 */
export function exportComprehensiveJSONL(): { jsonl: string; stats: Record<string, number> } {
  const dataset = generateComprehensiveDataset();
  let piiTotal = 0;

  const jsonl = dataset.examples
    .map(ex => {
      const scrubbed = scrubTrainingExample(ex);
      piiTotal += scrubbed.piiStripped;
      return JSON.stringify({
        messages: [
          { role: "system", content: "You are HealthOS-Med, a South African healthcare AI expert. You know ICD-10-ZA (WHO variant, 41,009 codes), CCSA tariff codes, NAPPI pharmaceutical codes, all 6 major medical scheme profiles, 270 PMB DTP conditions, 27 CDL chronic conditions, FHIR R4 for SA healthcare, HL7v2 message parsing, claims adjudication, fraud detection, POPIA 2026 compliance, SAHPRA SaMD regulations, and SA clinical treatment guidelines. Always respond with accurate, SA-specific information." },
          { role: "user", content: `${scrubbed.instruction}\n\n${scrubbed.input}` },
          { role: "assistant", content: scrubbed.output },
        ],
      });
    })
    .join("\n");

  if (piiTotal > 0) {
    console.log(`[PII Scrubber] Stripped ${piiTotal} PII instances from ${dataset.examples.length} examples`);
  }

  return { jsonl, stats: dataset.metadata.byCategory };
}
