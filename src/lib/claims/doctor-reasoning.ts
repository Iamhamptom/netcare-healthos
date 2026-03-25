/**
 * Doctor Reasoning Layer — Clinical Decision Framework
 *
 * Models how SA doctors, nurses, and billing clerks actually think
 * when creating and processing claims. This layer sits between Layer 9
 * (agentic AI review) and the final verdict, providing domain-specific
 * clinical logic that pure rule engines and generic AI miss.
 *
 * Based on:
 * - SA PHC STG (Standard Treatment Guidelines) 2020
 * - SEMDSA Type 2 Diabetes Guidelines 2024
 * - SA Hypertension Society Guidelines 2023
 * - GINA Asthma Strategy adapted for SA
 * - HPCSA Ethical Billing Guidelines
 * - CMS Annual Report rejection pattern analysis
 * - Discovery Health, GEMS, Bonitas provider manuals
 * - 7 test rounds with 1,350+ real claims
 */

import type { ClaimLineItem, ValidationIssue } from "./types";

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: GP Clinical Reasoning Patterns
// "How does a SA GP think when they see a patient?"
// ═══════════════════════════════════════════════════════════════════

/**
 * GP encounter workflow:
 * 1. Patient presents with chief complaint
 * 2. GP does history + examination (tariff 0190-0192)
 * 3. GP may order point-of-care tests (4518 urine, 4537 CRP, 3948 ECG)
 * 4. GP may order pathology (4501-4510 blood panel)
 * 5. GP may order radiology (5101 CXR, rarely 5608 CT)
 * 6. GP may do a procedure (0401-0407 minor ops)
 * 7. GP prescribes medication (NAPPI codes)
 * 8. GP writes ICD-10 code — often the SYMPTOM not the diagnosis
 *    (because definitive diagnosis requires specialist workup)
 * 9. GP may issue chronic script (0199) for CDL patients
 */

// Common GP diagnosis-tariff-medication combinations
// If a claim matches one of these patterns, it's almost certainly valid
export const GP_CLINICAL_PATTERNS: {
  description: string;
  icd10Prefixes: string[];
  validTariffs: string[];
  validNAPPIs?: string[];
  notes: string;
}[] = [
  {
    description: "Acute upper respiratory infection (URTI/common cold)",
    icd10Prefixes: ["J06", "J00", "J01", "J02", "J03", "J04", "J11"],
    validTariffs: ["0190", "0191", "5101", "5102", "4518", "4537"],
    notes: "CXR for persistent cough is standard. CRP to rule out bacterial infection.",
  },
  {
    description: "Hypertension management",
    icd10Prefixes: ["I10", "I11", "I12", "I13", "I15"],
    validTariffs: ["0190", "0191", "0199", "3948", "4518", "4520", "4501"],
    validNAPPIs: ["7031401", "7175002", "7119501", "7044901"],
    notes: "ECG for cardiac screening. Urine for kidney function. Chronic script (0199) routine.",
  },
  {
    description: "Type 2 diabetes management",
    icd10Prefixes: ["E11", "E14"],
    validTariffs: ["0190", "0191", "0199", "4518", "4520", "4501"],
    validNAPPIs: ["7175002", "7024601"],
    notes: "Glucose test + HbA1c are standard. Chronic script for metformin. Annual eye/foot check.",
  },
  {
    description: "Asthma management",
    icd10Prefixes: ["J45", "J46"],
    validTariffs: ["0190", "0191", "0199", "5101"],
    validNAPPIs: ["7155101", "0700920"],
    notes: "CXR to rule out other causes. Chronic script for inhalers.",
  },
  {
    description: "HIV management",
    icd10Prefixes: ["B20", "B21", "B22", "B23", "B24", "Z21"],
    validTariffs: ["0190", "0191", "0199", "4501", "4518"],
    notes: "Blood panel + viral load monitoring. Chronic script for ARVs.",
  },
  {
    description: "Musculoskeletal/back pain",
    icd10Prefixes: ["M54", "M79", "M25", "M77", "M75"],
    validTariffs: ["0190", "0191", "5101", "5102"],
    notes: "CXR/X-ray for persistent pain is standard. Physio referral common.",
  },
  {
    description: "Urinary tract infection",
    icd10Prefixes: ["N39", "N30"],
    validTariffs: ["0190", "0191", "4518", "4519"],
    notes: "Urine dipstick + culture are standard. MCS (4519) for recurrent UTI.",
  },
  {
    description: "Wound care / minor surgery",
    icd10Prefixes: ["S01", "S51", "S61", "S71", "S81", "S91", "T14", "T79", "W"],
    validTariffs: ["0190", "0401", "0402", "0403", "0404", "0407"],
    notes: "Suturing (0407) for lacerations. Always needs external cause (V/W/X/Y).",
  },
  {
    description: "Depression/anxiety",
    icd10Prefixes: ["F32", "F33", "F41", "F43"],
    validTariffs: ["0190", "0191", "0199"],
    validNAPPIs: ["7211301", "7155101"],
    notes: "Chronic script for antidepressants. Refer to psychologist for therapy.",
  },
  {
    description: "Epilepsy management",
    icd10Prefixes: ["G40", "G41"],
    validTariffs: ["0190", "0191", "0199", "3948"],
    validNAPPIs: ["3001174", "7161901"],
    notes: "ECG for carbamazepine monitoring (cardiac effects). Chronic script.",
  },
  {
    description: "Hypothyroidism",
    icd10Prefixes: ["E03"],
    validTariffs: ["0190", "0199", "4501"],
    validNAPPIs: ["7211301"],
    notes: "Annual TSH monitoring. Chronic script for levothyroxine.",
  },
  {
    description: "Gastro-oesophageal reflux / acid-related",
    icd10Prefixes: ["K21", "K25", "K26", "K29"],
    validTariffs: ["0190", "0191"],
    validNAPPIs: ["7044901", "7237801", "0703534"],
    notes: "PPI therapy. Endoscopy referral if >6 weeks or red flags.",
  },
  {
    description: "Acute gastroenteritis",
    icd10Prefixes: ["A09", "K52"],
    validTariffs: ["0190", "0191", "4518", "4537"],
    notes: "Stool MCS for severe cases. CRP for severity assessment.",
  },
  {
    description: "Allergic conditions",
    icd10Prefixes: ["J30", "L20", "L23", "L50", "T78"],
    validTariffs: ["0190", "0191"],
    validNAPPIs: ["7161901"],
    notes: "Antihistamines. Refer to allergist for recurrent/severe.",
  },
  {
    description: "Chronic repeat/script visit (no patient present)",
    icd10Prefixes: ["E11", "I10", "J45", "G40", "B20", "E03", "F32"],
    validTariffs: ["0199"],
    notes: "CDL patient — chronic medication refill. Patient doesn't need to be present.",
  },
];

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: Clinical Domain Matching
// "Does this tariff make sense for this diagnosis?"
// ═══════════════════════════════════════════════════════════════════

const CLINICAL_DOMAINS: Record<string, { tariffs: string[]; icd10Chapters: string[] }> = {
  respiratory: {
    tariffs: ["0190", "5101", "5102", "4537", "4518"],
    icd10Chapters: ["J", "R05", "R06"],
  },
  cardiovascular: {
    tariffs: ["0190", "3948", "4501", "4518"],
    icd10Chapters: ["I"],
  },
  endocrine: {
    tariffs: ["0190", "0199", "4501", "4518", "4520"],
    icd10Chapters: ["E"],
  },
  musculoskeletal: {
    tariffs: ["0190", "5101", "5102"],
    icd10Chapters: ["M"],
  },
  infectious: {
    tariffs: ["0190", "4501", "4518", "4519", "4537"],
    icd10Chapters: ["A", "B"],
  },
  mental: {
    tariffs: ["0190", "0191", "0199"],
    icd10Chapters: ["F"],
  },
  gastrointestinal: {
    tariffs: ["0190", "4518", "4537"],
    icd10Chapters: ["K"],
  },
  genitourinary: {
    tariffs: ["0190", "4518", "4519"],
    icd10Chapters: ["N"],
  },
  injury: {
    tariffs: ["0190", "0401", "0402", "0403", "0404", "0407", "5101"],
    icd10Chapters: ["S", "T"],
  },
  symptoms: {
    tariffs: ["0190", "0191", "5101", "4518", "4537", "4501"],
    icd10Chapters: ["R"],
  },
};

/**
 * Check if a tariff-diagnosis combination is clinically reasonable.
 * Returns true if the tariff is commonly used with this type of diagnosis.
 */
export function isClinicallyReasonable(tariffCode: string, icd10Code: string): boolean {
  // GP consultations are valid for EVERYTHING
  if (["0190", "0191", "0192", "0193", "0194", "0195", "0199"].includes(tariffCode)) return true;

  // Point-of-care tests are valid for almost anything
  if (["4518", "4519", "4520", "4537", "4501"].includes(tariffCode)) return true;

  // Check clinical domain match
  const icdPrefix = icd10Code.substring(0, 1);
  for (const domain of Object.values(CLINICAL_DOMAINS)) {
    if (domain.tariffs.includes(tariffCode) && domain.icd10Chapters.some(c => icd10Code.startsWith(c))) {
      return true;
    }
  }

  // Check specific GP patterns
  for (const pattern of GP_CLINICAL_PATTERNS) {
    if (pattern.icd10Prefixes.some(p => icd10Code.startsWith(p)) && pattern.validTariffs.includes(tariffCode)) {
      return true;
    }
  }

  return false;
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: Billing Clerk Reasoning
// "How does a clerk translate doctor notes to codes?"
// ═══════════════════════════════════════════════════════════════════

/**
 * Common clerk coding errors and their correct handling:
 *
 * 1. WRONG SPECIFICITY: Clerk writes R10 instead of R10.4 (left lower quad pain)
 *    → WARNING, not REJECT. The claim can still process.
 *
 * 2. WRONG ICD FOR PROCEDURE: Doctor sutured a wound but clerk coded K21.0 (reflux)
 *    because the patient has chronic reflux as their ongoing condition.
 *    → WARNING. The tariff code (0407) tells the real story.
 *
 * 3. MISSING ECC: Doctor treated a fall injury but clerk forgot V/W/X/Y code.
 *    → REJECT. SA switches enforce this. The clerk MUST add it.
 *
 * 4. R-CODE AS PRIMARY: Doctor hasn't made a definitive diagnosis yet.
 *    → VALID for first visit. WARNING if repeated over 3+ consults.
 *
 * 5. DEPENDENT CODE: Clerk enters 02 for the spouse. Some systems show this as "child".
 *    → VALID. Dependent code is a sequence number, not an age indicator.
 *
 * 6. ABOVE SCHEME RATE: Doctor charges R650 but scheme rate is R450.
 *    → VALID. Legal in SA. Patient pays the R200 gap ("co-payment").
 */

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: Doctor Reasoning Pass
// Applies clinical reasoning to override false positives
// ═══════════════════════════════════════════════════════════════════

export interface DoctorReasoningResult {
  overrides: { lineNumber: number; code: string; reason: string; clinicalPattern?: string }[];
  totalOverrides: number;
}

export function runDoctorReasoning(
  lineResults: { lineNumber: number; status: string; issues: ValidationIssue[]; claimData: ClaimLineItem }[],
  result: { validClaims: number; invalidClaims: number; warningClaims: number; issues: ValidationIssue[] },
): DoctorReasoningResult {
  const overrides: DoctorReasoningResult["overrides"] = [];

  for (const lr of lineResults) {
    const claim = lr.claimData;
    const isGP = claim.practiceNumber?.startsWith("014") || claim.practiceNumber?.startsWith("015");
    if (!isGP) continue; // Doctor reasoning layer only applies to GP claims for now

    const issuesToDowngrade: number[] = [];

    for (let i = 0; i < lr.issues.length; i++) {
      const issue = lr.issues[i];
      if (issue.severity !== "warning") continue; // Only review warnings

      // Check if the claim matches a known GP clinical pattern
      if (issue.code === "TARIFF_DIAGNOSIS_MISMATCH" || issue.code === "PROCEDURE_DIAGNOSIS_MISMATCH"
          || issue.code === "PROCEDURE_DIAGNOSIS_CONTRADICTION" || issue.code === "CLINICAL_APPROPRIATENESS"
          || issue.code === "IMAGING_DIAGNOSIS_MISMATCH") {
        if (claim.primaryICD10 && claim.tariffCode && isClinicallyReasonable(claim.tariffCode, claim.primaryICD10)) {
          issuesToDowngrade.push(i);
          const matchedPattern = GP_CLINICAL_PATTERNS.find(p =>
            p.icd10Prefixes.some(pfx => claim.primaryICD10!.startsWith(pfx)) &&
            p.validTariffs.includes(claim.tariffCode!)
          );
          overrides.push({
            lineNumber: lr.lineNumber,
            code: issue.code,
            reason: `Clinically reasonable: ${claim.tariffCode} with ${claim.primaryICD10} is a standard GP billing pattern`,
            clinicalPattern: matchedPattern?.description,
          });
        }
      }

      // Above scheme rate — legal in SA, not a rejection reason
      if (issue.code === "ABOVE_SCHEME_RATE" || issue.code === "AMOUNT_ABOVE_SCHEME_RATE" || issue.code === "SEP_EXCEEDED") {
        issuesToDowngrade.push(i);
        overrides.push({
          lineNumber: lr.lineNumber,
          code: issue.code,
          reason: "Billing above scheme rate is legal in SA. Patient pays the gap (co-payment).",
        });
      }

      // Missing referring provider — GP IS the provider
      if (issue.code === "MISSING_REFERRING_PROVIDER") {
        issuesToDowngrade.push(i);
        overrides.push({
          lineNumber: lr.lineNumber,
          code: issue.code,
          reason: "GP billing own pathology/radiology — no referral needed. GP IS the treating provider.",
        });
      }

      // Pre-auth not needed for GP routine orders
      if (issue.code === "PREAUTH_REQUIRED") {
        const gpNoPreauth = ["5101", "5102", "3948", "4025", "4518", "4519", "4520", "4537", "0401", "0407"];
        if (claim.tariffCode && gpNoPreauth.includes(claim.tariffCode)) {
          issuesToDowngrade.push(i);
          overrides.push({
            lineNumber: lr.lineNumber,
            code: issue.code,
            reason: `GP routine order ${claim.tariffCode} — no pre-auth needed`,
          });
        }
      }

      // CDL chronic management — always valid if diagnosis + medication match
      if (issue.code === "CDL_AUTH_REQUIRED" || issue.code === "CDL_WITHOUT_PMB") {
        const cdlDiagnoses = ["I10", "E11", "J45", "G40", "B20", "E03", "F32", "G35", "G20"];
        if (claim.primaryICD10 && cdlDiagnoses.some(d => claim.primaryICD10!.startsWith(d))) {
          issuesToDowngrade.push(i);
          overrides.push({
            lineNumber: lr.lineNumber,
            code: issue.code,
            reason: `CDL chronic management: ${claim.primaryICD10} is a CDL condition — routine chronic script/medication`,
          });
        }
      }
    }

    // Apply downgrades
    for (const idx of issuesToDowngrade.sort((a, b) => b - a)) {
      lr.issues[idx].severity = "info";
      // Also update global
      const gi = result.issues.findIndex(i => i.lineNumber === lr.lineNumber && i.code === lr.issues[idx].code);
      if (gi !== -1) result.issues[gi].severity = "info";
    }

    // Recalculate line status
    if (issuesToDowngrade.length > 0) {
      const hasError = lr.issues.some(i => i.severity === "error");
      const hasWarning = lr.issues.some(i => i.severity === "warning");
      const oldStatus = lr.status;

      if (!hasError && !hasWarning && (oldStatus === "error" || oldStatus === "warning")) {
        if (oldStatus === "error") { result.invalidClaims--; result.validClaims++; }
        if (oldStatus === "warning") { result.warningClaims--; result.validClaims++; }
        lr.status = "valid";
      } else if (!hasError && hasWarning && oldStatus === "error") {
        result.invalidClaims--;
        result.warningClaims++;
        lr.status = "warning";
      }
    }
  }

  return { overrides, totalOverrides: overrides.length };
}
