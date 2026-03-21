// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Training Data Generator — Creates fine-tuning datasets from SA healthcare data
// Generates instruction-following pairs for medical LLM fine-tuning:
// - ICD-10 coding (clinical description → code)
// - Rejection prediction (claim data → accept/reject)
// - PMB classification (code → PMB status + treatment)
// - Scheme rule application (claim + scheme → issues)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { readFileSync } from "fs";
import { join } from "path";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TrainingExample {
  instruction: string;
  input: string;
  output: string;
  category: "icd10_coding" | "rejection_prediction" | "pmb_classification" | "scheme_rules" | "fraud_detection" | "clinical_validation";
}

export interface FineTuneDataset {
  examples: TrainingExample[];
  metadata: {
    totalExamples: number;
    byCategory: Record<string, number>;
    generatedAt: string;
    sources: string[];
  };
}

// ─── ICD-10 Training Data ───────────────────────────────────────────────────

/**
 * Generate ICD-10 coding training examples from the MIT database.
 * Creates (description → code) instruction pairs.
 */
export function generateICD10TrainingData(csvPath: string, maxExamples = 5000): TrainingExample[] {
  const examples: TrainingExample[] = [];

  try {
    const csv = readFileSync(csvPath, "utf-8");
    const lines = csv.split("\n").slice(1); // Skip header

    for (const line of lines) {
      if (examples.length >= maxExamples) break;
      const cols = parseCSVLine(line);
      if (cols.length < 11) continue;

      const code = cols[7]?.trim(); // ICD10_Code (column H)
      const description = cols[8]?.trim(); // WHO_Full_Desc (column I)
      const validClinical = cols[9]?.trim(); // Valid_ICD10_ClinicalUse
      const validPrimary = cols[10]?.trim(); // Valid_ICD10_Primary
      const isAsterisk = cols[11]?.trim(); // Valid_ICD10_Asterisk
      const chapter = cols[2]?.trim(); // Chapter_Desc

      if (!code || !description || validClinical !== "Y") continue;

      // Generate instruction-following pair
      examples.push({
        instruction: "Given the clinical description, provide the correct ICD-10-ZA code. Include whether it can be a primary diagnosis and if it's an asterisk (manifestation) code.",
        input: `Clinical description: ${description}`,
        output: JSON.stringify({
          code,
          description,
          canBePrimary: validPrimary === "Y",
          isAsterisk: isAsterisk === "Y",
          chapter,
        }),
        category: "icd10_coding",
      });

      // Reverse: code → description
      examples.push({
        instruction: "Given the ICD-10-ZA code, provide the full clinical description, chapter, and validation rules.",
        input: `ICD-10 code: ${code}`,
        output: JSON.stringify({
          code,
          description,
          chapter,
          canBePrimary: validPrimary === "Y",
          isAsterisk: isAsterisk === "Y",
          validForClinicalUse: true,
        }),
        category: "icd10_coding",
      });
    }
  } catch (err) {
    console.error("Error reading ICD-10 CSV:", err);
  }

  return examples;
}

// ─── Rejection Prediction Training Data ─────────────────────────────────────

/**
 * Generate rejection prediction training examples from known rejection patterns.
 */
export function generateRejectionTrainingData(): TrainingExample[] {
  const examples: TrainingExample[] = [];

  // Common rejection scenarios
  const scenarios = [
    { icd10: "J06.9", tariff: "0190", scheme: "Discovery Health", amount: 52000, reject: false, code: "", reason: "" },
    { icd10: "J06", tariff: "0190", scheme: "Discovery Health", amount: 52000, reject: true, code: "05", reason: "ICD-10 code lacks 4th character specificity — Discovery requires maximum specificity" },
    { icd10: "S72.0", tariff: "0190", scheme: "Bonitas", amount: 52000, reject: true, code: "ECC", reason: "Injury code S72.0 requires External Cause Code (V01-Y98) as secondary — SA mandatory rule" },
    { icd10: "N40", tariff: "0190", scheme: "GEMS", amount: 52000, reject: false, code: "", reason: "", patientGender: "M" },
    { icd10: "N40", tariff: "0190", scheme: "GEMS", amount: 52000, reject: true, code: "GENDER", reason: "N40 (prostatic disorder) restricted to male patients but patient is female", patientGender: "F" },
    { icd10: "P07.3", tariff: "0190", scheme: "Discovery Health", amount: 52000, reject: true, code: "AGE", reason: "Perinatal code P07.3 for neonates only but patient age is 45", patientAge: 45 },
    { icd10: "I21.9", tariff: "3600", scheme: "Momentum Health", amount: 1500000, reject: false, code: "", reason: "PMB condition (acute MI) — scheme must cover regardless of benefit limits" },
    { icd10: "E10.9", tariff: "0190", scheme: "Bonitas", amount: 52000, reject: false, code: "", reason: "CDL condition (Type 1 diabetes) — chronic benefit authorization applies" },
    { icd10: "G63", tariff: "0190", scheme: "Discovery Health", amount: 52000, reject: true, code: "ASTERISK", reason: "G63 is an asterisk (manifestation) code — cannot be primary diagnosis" },
    { icd10: "R50.9", tariff: "0190", scheme: "Bonitas", amount: 52000, reject: false, code: "", reason: "R-code (symptom) as primary — valid but may trigger clinical review" },
    { icd10: "J06.9", tariff: "0190", scheme: "Discovery Health", amount: 52000, reject: true, code: "12", reason: "Late submission — claim is 150 days old, exceeds 120-day deadline" },
    { icd10: "J06.9", tariff: "0190", scheme: "GEMS", amount: 52000, reject: true, code: "01", reason: "Member not found — membership number format invalid (GEMS requires 9 digits with leading zeros)" },
    { icd10: "J06.9", tariff: "0500", scheme: "Bonitas", amount: 350000, reject: true, code: "08", reason: "MRI scan requires pre-authorization but none provided" },
  ];

  for (const s of scenarios) {
    examples.push({
      instruction: "Predict whether this SA medical aid claim will be accepted or rejected. Provide the likely rejection code and reason if rejected.",
      input: JSON.stringify({
        icd10: s.icd10,
        tariff: s.tariff,
        scheme: s.scheme,
        amount: `R${(s.amount / 100).toFixed(2)}`,
        patientGender: (s as Record<string, unknown>).patientGender || "unknown",
        patientAge: (s as Record<string, unknown>).patientAge || "unknown",
      }),
      output: JSON.stringify({
        willReject: s.reject,
        rejectionCode: s.code || null,
        rejectionReason: s.reason,
        confidence: 0.9,
      }),
      category: "rejection_prediction",
    });
  }

  return examples;
}

// ─── PMB Classification Training Data ───────────────────────────────────────

/**
 * Generate PMB/CDL classification training examples.
 */
export function generatePMBTrainingData(): TrainingExample[] {
  const examples: TrainingExample[] = [];

  const pmbCases = [
    { code: "I21.9", isPMB: true, category: "DTP — Cardiovascular", treatment: "Emergency PCI/thrombolysis, cardiac rehab" },
    { code: "I63.9", isPMB: true, category: "DTP — Brain & Nervous System", treatment: "Stroke unit admission, thrombolysis if within window" },
    { code: "C50.9", isPMB: true, category: "DTP — Oncology", treatment: "Surgery, chemotherapy, radiation per NCCN guidelines" },
    { code: "B20", isPMB: true, category: "CDL — HIV/AIDS", treatment: "Full ARV treatment, viral load monitoring, CD4 testing" },
    { code: "O82", isPMB: true, category: "DTP — Obstetric", treatment: "Caesarean delivery, hospital stay, post-operative care" },
    { code: "E10.9", isPMB: true, category: "CDL — Diabetes Type 1", treatment: "Insulin, HbA1c monitoring, diabetic clinic visits" },
    { code: "E11.9", isPMB: true, category: "CDL — Diabetes Type 2", treatment: "Metformin first-line, HbA1c monitoring, lifestyle management" },
    { code: "I10", isPMB: true, category: "CDL — Hypertension", treatment: "ACE inhibitor/ARB first-line, BP monitoring, lifestyle" },
    { code: "J45.9", isPMB: true, category: "CDL — Asthma", treatment: "ICS/LABA, peak flow monitoring, asthma action plan" },
    { code: "J06.9", isPMB: false, category: "Not PMB", treatment: "Standard GP consultation, symptomatic treatment" },
    { code: "M54.5", isPMB: false, category: "Not PMB", treatment: "Standard GP consultation, physiotherapy referral" },
    { code: "K29.7", isPMB: false, category: "Not PMB", treatment: "PPI, H. pylori testing if indicated" },
  ];

  for (const c of pmbCases) {
    examples.push({
      instruction: "Classify this ICD-10 code under the SA Medical Schemes Act PMB rules. Determine if it's a Prescribed Minimum Benefit, which category it falls under, and the required treatment protocol.",
      input: `ICD-10 code: ${c.code}`,
      output: JSON.stringify(c),
      category: "pmb_classification",
    });
  }

  return examples;
}

// ─── Full Dataset Generator ─────────────────────────────────────────────────

/**
 * Generate the complete fine-tuning dataset from all sources.
 */
export function generateFullDataset(icd10CsvPath?: string): FineTuneDataset {
  const examples: TrainingExample[] = [];

  // ICD-10 coding examples (from CSV if available)
  if (icd10CsvPath) {
    examples.push(...generateICD10TrainingData(icd10CsvPath, 3000));
  }

  // Rejection prediction examples
  examples.push(...generateRejectionTrainingData());

  // PMB classification examples
  examples.push(...generatePMBTrainingData());

  // Count by category
  const byCategory: Record<string, number> = {};
  for (const ex of examples) {
    byCategory[ex.category] = (byCategory[ex.category] || 0) + 1;
  }

  return {
    examples,
    metadata: {
      totalExamples: examples.length,
      byCategory,
      generatedAt: new Date().toISOString(),
      sources: [
        icd10CsvPath ? "ICD-10_MIT_2021.csv" : "Built-in ICD-10 subset",
        "Built-in rejection scenarios",
        "Built-in PMB/CDL cases",
      ],
    },
  };
}

/**
 * Export dataset in Ollama fine-tuning format (JSONL).
 */
export function exportAsJSONL(dataset: FineTuneDataset): string {
  return dataset.examples
    .map(ex => JSON.stringify({
      messages: [
        { role: "system", content: "You are a South African medical coding and claims expert. Use ICD-10-ZA (WHO variant), CCSA tariff codes, NAPPI codes, and SA Medical Schemes Act rules." },
        { role: "user", content: `${ex.instruction}\n\n${ex.input}` },
        { role: "assistant", content: ex.output },
      ],
    }))
    .join("\n");
}

// ─── Helpers ────────────────────────────────────────────────────────────────

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
