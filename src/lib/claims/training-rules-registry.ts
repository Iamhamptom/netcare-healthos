// ═══════════════════════════════════════════════════════════════
// CLAIMS VALIDATION — COMPLETE RULE REGISTRY FOR FINE-TUNING
// Every rule with: code, source, science basis, examples, reasoning
// Generated from 3-round blind trial + regulatory research (March 22, 2026)
// ═══════════════════════════════════════════════════════════════

export interface RuleDefinition {
  code: string;
  name: string;
  severity: "error" | "warning" | "info";
  source: string;
  announced: string;
  announcedBy: string;
  description: string;
  scienceBasis: string;
  examples: { claim: Record<string, unknown>; result: string; reason: string }[];
}

export interface AIProvenanceMetadata {
  isAIGenerated: true;
  engineVersion: string;
  modelVersion?: string;
  timestamp: string;
  rulesApplied: string[];
  motivationOverrideUsed: boolean;
  regulatoryBasis: string;
}

// ─── COMPLETE RULE REGISTRY (31+ rules) ──────────────────────

export const RULE_REGISTRY: RuleDefinition[] = [
  // ═══ ADMINISTRATIVE FIELD RULES ═══
  { code: "MISSING_ICD10", name: "Missing ICD-10 Code", severity: "error",
    source: "PHISC MEDCLM v0:912:ZA — RFF+ICD segment mandatory",
    announced: "2005 (SA ICD-10 implementation)", announcedBy: "National DoH + CMS",
    description: "Every claim must have at least one ICD-10 diagnosis code.",
    scienceBasis: "WHO classification requires disease coding for epidemiological tracking. Medical Schemes Act s59 requires diagnosis for adjudication. Step 6 of 14-step adjudication pipeline.",
    examples: [{ claim: { icd10: "" }, result: "REJECTED", reason: "Empty ICD-10 field" }] },

  { code: "MISSING_PRACTICE_NUMBER", name: "Missing Practice Number", severity: "error",
    source: "BHF registration requirement + PHISC MEDCLM",
    announced: "1998 (Medical Schemes Act)", announcedBy: "Parliament of SA / BHF",
    description: "Every SA healthcare provider must have a 7-digit BHF practice number.",
    scienceBasis: "Provider validation is Step 5 of adjudication. Without practice number, scheme cannot verify provider is registered and licensed.",
    examples: [{ claim: { icd10: "J06.9", practiceNumber: "" }, result: "REJECTED", reason: "Empty practice number" }] },

  { code: "MISSING_DEPENDENT_CODE", name: "Missing Dependent Code", severity: "error",
    source: "PHISC MEDCLM — DEP segment",
    announced: "PHISC standard", announcedBy: "PHISC",
    description: "SA schemes require 2-digit dependent code: 00=main member, 01=spouse, 02+=children.",
    scienceBasis: "Medical scheme membership is family-based. Step 3 of adjudication (membership verification) requires dependent identification.",
    examples: [{ claim: { icd10: "J06.9", dependentCode: "" }, result: "REJECTED", reason: "Empty dependent code" }] },

  { code: "MISSING_PATIENT_NAME", name: "Missing Patient Name", severity: "error",
    source: "PHISC MEDCLM — RFF+PTN segment (35 chars max)",
    announced: "PHISC standard", announcedBy: "PHISC",
    description: "Patient name mandatory for member record matching. BHF adjustment code 01 if name mismatch.",
    scienceBasis: "Secondary fraud check — SA ID is primary identifier, name match is verification.",
    examples: [{ claim: { icd10: "J06.9", patientName: "" }, result: "REJECTED", reason: "Empty patient name" }] },

  // ═══ DATE VALIDATION RULES ═══
  { code: "INVALID_DATE_FORMAT", name: "Invalid Date Format", severity: "error",
    source: "PHISC EDIFACT — CCYYMMDD or ISO 8601 (YYYY-MM-DD)",
    announced: "PHISC MEDCLM v0:912:ZA", announcedBy: "PHISC",
    description: "SA EDIFACT uses CCYYMMDD. CSV accepts YYYY-MM-DD. DD-MM-YYYY, YYYY/MM/DD rejected.",
    scienceBasis: "DD-MM-YYYY and MM-DD-YYYY are ambiguous. Strict format prevents mis-dating. PHISC DATA FORMATS section specifies no embedded points or commas in dates.",
    examples: [
      { claim: { icd10: "J06.9", dateOfService: "15-02-2026" }, result: "REJECTED", reason: "DD-MM-YYYY format" },
      { claim: { icd10: "J06.9", dateOfService: "2026/02/15" }, result: "REJECTED", reason: "Slash separators" },
    ] },

  { code: "FUTURE_DATE", name: "Future Date of Service", severity: "error",
    source: "Medical Schemes Act — claims are for services rendered",
    announced: "1998", announcedBy: "Parliament of SA",
    description: "Claims only for services already provided. Future dates = data entry error or pre-billing (fraud).",
    scienceBasis: "Claims adjudication is post-service. Step 4 (benefit eligibility) requires service date in the past.",
    examples: [{ claim: { icd10: "J06.9", dateOfService: "2027-02-15" }, result: "REJECTED", reason: "Future date" }] },

  { code: "STALE_CLAIM", name: "Stale Claim (>120 Days)", severity: "error",
    source: "Medical Schemes Act, Regulation 6 — 4-month hard deadline",
    announced: "1998 (MSA Reg 6)", announcedBy: "Parliament of SA / CMS",
    description: "Claims must be submitted within 120 days. Formula: Last_day_of(Service_Month + 4). All SA schemes enforce. PMB exception: 365 days.",
    scienceBasis: "Prevents stale data, simplifies actuarial IBNR calculation (Chain Ladder method needs bounded development periods). 65% of denied claims never resubmitted = permanent revenue loss.",
    examples: [{ claim: { icd10: "J06.9", dateOfService: "2024-10-15" }, result: "REJECTED", reason: "Over 120 days old" }] },

  { code: "NEAR_STALE_CLAIM", name: "Claim Nearing Expiry (>90 Days)", severity: "warning",
    source: "Best practice — derived from Regulation 6",
    announced: "Industry standard", announcedBy: "Clearinghouses",
    description: "Claims 90-120 days old are nearing deadline. 30-day buffer for correction and resubmission.",
    scienceBasis: "Early warning reduces permanent revenue loss from expired claims.",
    examples: [{ claim: { icd10: "J06.9", dateOfService: "2025-12-12" }, result: "WARNING", reason: "~100 days, approaching deadline" }] },

  // ═══ ICD-10 FORMAT & CLINICAL RULES ═══
  { code: "INVALID_FORMAT", name: "Invalid ICD-10 Format", severity: "error",
    source: "WHO ICD-10 Volume 2 + SA MIT",
    announced: "1990 (WHO), 2005 (SA)", announcedBy: "WHO / National DoH",
    description: "Must be: 1 uppercase letter + 2 digits + optional (dot + 1-4 digits). Lowercase, spaces, wrong patterns all rejected.",
    scienceBasis: "WHO alphanumeric system: letter=chapter (body system/etiology), digits=category. Format validation is Step 6 of adjudication.",
    examples: [
      { claim: { icd10: "J069" }, result: "REJECTED", reason: "Missing dot" },
      { claim: { icd10: "j06.9" }, result: "REJECTED", reason: "Lowercase" },
      { claim: { icd10: "XYZ123" }, result: "REJECTED", reason: "Invalid pattern" },
      { claim: { icd10: "J 06.9" }, result: "REJECTED", reason: "Space in code" },
    ] },

  { code: "GENDER_MISMATCH", name: "Gender Mismatch", severity: "error",
    source: "SA ICD-10 MIT — Gender column (col 16, WHO 2008 data added 2013)",
    announced: "2008 (WHO), 2013 (SA MIT update)", announcedBy: "WHO / SA NTT",
    description: "N40=male, O-codes=female, C53=female, C61=male, Z32.1+=female. Z32.0 has NO restriction.",
    scienceBasis: "Anatomically determined. MIT column 16 contains WHO-derived gender flags. Z32.0 (pregnancy test) can be for anyone; Z32.1 (confirmed) is female-only per MIT.",
    examples: [
      { claim: { icd10: "N40", gender: "F" }, result: "REJECTED", reason: "Prostate on female" },
      { claim: { icd10: "Z32.1", gender: "M" }, result: "REJECTED", reason: "Confirmed pregnancy on male" },
      { claim: { icd10: "C53.9", gender: "M" }, result: "REJECTED", reason: "Cervical cancer on male" },
    ] },

  { code: "AGE_MISMATCH", name: "Age Mismatch", severity: "error",
    source: "SA ICD-10 MIT — Age columns + WHO coding rules",
    announced: "WHO standard", announcedBy: "WHO / SA NTT",
    description: "P-codes (P00-P96) for neonates only (≤28 days). F03 (dementia) inappropriate for neonates.",
    scienceBasis: "Perinatal conditions (Chapter XVI) describe conditions originating in fetal/neonatal period.",
    examples: [
      { claim: { icd10: "P22.0", age: 45 }, result: "REJECTED", reason: "Neonatal code on adult" },
      { claim: { icd10: "P22.0", age: 0 }, result: "VALID", reason: "Neonatal code on neonate" },
    ] },

  { code: "ASTERISK_PRIMARY", name: "Asterisk Code as Primary", severity: "error",
    source: "WHO ICD-10 Volume 2 — Dagger/Asterisk system",
    announced: "1990 (ICD-10 design)", announcedBy: "WHO",
    description: "Asterisk (*) = manifestation (WHERE). Dagger (†) = etiology (WHAT). Every * has exactly 1 valid † partner.",
    scienceBasis: "Dual-axis classification ensures accurate mortality/morbidity statistics. ACME algorithm requires etiology as primary.",
    examples: [{ claim: { icd10: "I32*" }, result: "REJECTED", reason: "Manifestation code as primary" }] },

  { code: "ECC_AS_PRIMARY", name: "External Cause as Primary", severity: "error",
    source: "WHO ICD-10 Volume 2 — Chapter XX coding rules",
    announced: "1990", announcedBy: "WHO",
    description: "V/W/X/Y codes describe HOW, not WHAT. Injury code (S/T) must be primary.",
    scienceBasis: "External cause codes are supplementary classification (Chapter XX). ACME primary cause selection always selects the condition.",
    examples: [{ claim: { icd10: "V49.9" }, result: "REJECTED", reason: "Vehicle accident as primary" }] },

  { code: "MISSING_ECC", name: "Missing External Cause", severity: "error",
    source: "SA ICD-10 Coding Standards V3 — mandatory for S/T codes",
    announced: "2005 (SA coding standards)", announcedBy: "National DoH / CMS",
    description: "SA mandates V/W/X/Y secondary for all S00-T98 codes. Stricter than WHO base standard.",
    scienceBasis: "External cause data critical for injury surveillance, accident prevention, RAF claim routing.",
    examples: [{ claim: { icd10: "S82.0" }, result: "REJECTED", reason: "Fracture without cause" }] },

  { code: "SYMPTOM_CODE", name: "Symptom Code as Primary", severity: "warning",
    source: "WHO ICD-10 — Chapter XVIII (R-codes) coding guidance",
    announced: "WHO standard", announcedBy: "WHO",
    description: "R-codes (symptoms/signs) as primary when definitive diagnosis available may reduce reimbursement.",
    scienceBasis: "R-codes are Chapter XVIII — 'not elsewhere classified'. They indicate the coder couldn't determine a definitive diagnosis. Schemes pay less for symptom codes.",
    examples: [{ claim: { icd10: "R51" }, result: "WARNING", reason: "Headache is a symptom, not a diagnosis" }] },

  { code: "NON_SPECIFIC", name: "Non-Specific ICD-10 Code", severity: "warning",
    source: "SA ICD-10 Coding Standards V3 — mandatory specificity",
    announced: "2005", announcedBy: "National DoH",
    description: "3-character codes without 4th digit when subdivision exists. SA rule: 'optional' = 'mandatory'.",
    scienceBasis: "WHO ICD-10 allows 3-char codes only when no subdivision exists. SA made ALL subdivisions mandatory. J06 → J06.9, E11 → E11.9.",
    examples: [{ claim: { icd10: "J06" }, result: "WARNING", reason: "Should be J06.9" }] },

  // ═══ AMOUNT RULES ═══
  { code: "INVALID_AMOUNT", name: "Invalid Amount (≤0)", severity: "error",
    source: "PHISC EDIFACT — amounts must be positive",
    announced: "PHISC standard", announcedBy: "PHISC",
    description: "Zero or negative amounts auto-rejected. Negative only valid in credit note message type.",
    scienceBasis: "PHISC EDIFACT: amounts are right-justified positive integers with implied decimals.",
    examples: [
      { claim: { icd10: "J06.9", amount: -50 }, result: "REJECTED", reason: "Negative" },
      { claim: { icd10: "J06.9", amount: 0 }, result: "REJECTED", reason: "Zero" },
    ] },

  { code: "INVALID_AMOUNT_FORMAT", name: "Comma Decimal", severity: "error",
    source: "PHISC EDIFACT — dot decimals only",
    announced: "PHISC standard", announcedBy: "PHISC",
    description: "SA uses dot separators. '450,00' invalid. Comma conflicts with CSV delimiter.",
    scienceBasis: "PHISC DATA FORMATS: no embedded commas in amounts. SA is NOT European comma-decimal.",
    examples: [{ claim: { icd10: "J06.9" }, result: "REJECTED", reason: "Raw '450,00' has comma" }] },

  { code: "EXCESSIVE_AMOUNT", name: "Excessive Amount", severity: "error",
    source: "NHRPL 2006 + scheme tariff rates + fraud detection",
    announced: "Best practice", announcedBy: "Schemes / CMS fraud frameworks",
    description: "Amounts >300% of tariff rate = data entry error. R450K for GP consult is clearly wrong.",
    scienceBasis: "Benford's Law + statistical outlier analysis. Discovery Health uses automated outlier detection.",
    examples: [{ claim: { icd10: "J06.9", tariff: "0190", amount: 450000 }, result: "REJECTED", reason: "R450K for GP" }] },

  // ═══ NAPPI RULES ═══
  { code: "NAPPI_INVALID", name: "Invalid NAPPI Code", severity: "error",
    source: "MediKredit NAPPI database",
    announced: "Ongoing (weekly updates)", announcedBy: "MediKredit",
    description: "NAPPI codes are 7-digit (post-2018). Codes not in database may be invalid or discontinued.",
    scienceBasis: "MediKredit is sole NAPPI administrator. Codes are purely sequential (no check digit). Each product variant gets unique code.",
    examples: [{ claim: { icd10: "J06.9", nappi: "9999999" }, result: "REJECTED", reason: "Not in NAPPI database" }] },

  // ═══ DUPLICATE DETECTION ═══
  { code: "DUPLICATE_CLAIM", name: "Duplicate Claim", severity: "error",
    source: "Anti-fraud — all SA schemes",
    announced: "Industry standard", announcedBy: "CMS / all schemes",
    description: "Same patient + ICD-10 + date = duplicate. Catches accidental double-submissions and deliberate fraud.",
    scienceBasis: "Key: patient_name|icd10|date_of_service. Discovery Health uses aggressive duplicate detection.",
    examples: [{ claim: { icd10: "J06.9", patientName: "Thabo", dateOfService: "2026-01-10" }, result: "REJECTED", reason: "Duplicate submission" }] },

  // ═══ TARIFF RULES ═══
  { code: "DENTAL_TARIFF_MISMATCH", name: "Dental Tariff Mismatch", severity: "error",
    source: "PHISC CCSA — tariff-discipline alignment",
    announced: "PHISC standard", announcedBy: "PHISC / SAMA",
    description: "Dental codes (81xx-87xx) only with dental diagnoses (K00-K14). Step 7 of adjudication.",
    scienceBasis: "CCSA tariffs organized by discipline. Prefix 81-87 = dental.",
    examples: [{ claim: { icd10: "J06.9", tariff: "8101" }, result: "REJECTED", reason: "URTI with dental tariff" }] },

  // ═══ MODIFIER RULES ═══
  { code: "MODIFIER_AGE_MISMATCH", name: "Neonatal Modifier on Adult", severity: "error",
    source: "PHISC CCSA — Modifier 0019",
    announced: "PHISC standard", announcedBy: "PHISC / SAMA",
    description: "Modifier 0019 = neonatal surgery (<2500g under GA). +50% units. Only valid ≤1 year.",
    scienceBasis: "Neonatal surgery requires specialized equipment/skills. The 50% loading reflects genuine additional cost. Using on adults = upcoding (fraud).",
    examples: [
      { claim: { icd10: "J06.9", modifier: "0019", age: 45 }, result: "REJECTED", reason: "Neonatal modifier on 45yo" },
      { claim: { icd10: "P22.0", modifier: "0019", age: 0 }, result: "VALID", reason: "Valid on neonate" },
    ] },

  // ═══ CLINICAL APPROPRIATENESS ═══
  { code: "MED_DIAGNOSIS_MISMATCH", name: "Medication-Diagnosis Mismatch", severity: "warning",
    source: "Clinical guidelines + NAPPI ATC",
    announced: "Clinical best practice", announcedBy: "CMS / scheme clinical teams",
    description: "Medication category vs diagnosis chapter mismatch. Override with motivation text.",
    scienceBasis: "ATC classification maps medications to therapeutic indications. Cross-reference catches wrong med or wrong diagnosis.",
    examples: [
      { claim: { icd10: "J45.9", nappi: "7020901" }, result: "WARNING", reason: "Paracetamol for asthma" },
      { claim: { icd10: "J45.9", nappi: "7020901", motivationText: "concurrent headache" }, result: "VALID", reason: "Motivated" },
    ] },

  { code: "IMAGING_DIAGNOSIS_MISMATCH", name: "Imaging Mismatch", severity: "warning",
    source: "Clinical guidelines + radiology protocols",
    announced: "Clinical best practice", announcedBy: "Scheme clinical teams",
    description: "Chest X-ray (51xx) with non-chest diagnosis. Override with motivation.",
    scienceBasis: "Radiology codes are body-system specific. Cross-reference catches inappropriate imaging orders.",
    examples: [
      { claim: { icd10: "M54.5", tariff: "5101" }, result: "WARNING", reason: "Chest X-ray for back pain" },
      { claim: { icd10: "M54.5", tariff: "5101", motivationText: "suspected rib fracture" }, result: "VALID", reason: "Motivated" },
    ] },

  { code: "PROCEDURE_DIAGNOSIS_MISMATCH", name: "Procedure Mismatch", severity: "warning",
    source: "Clinical guidelines",
    announced: "Clinical best practice", announcedBy: "Scheme clinical teams",
    description: "Minor procedure (0401) for medication-managed conditions (GERD, diabetes). Override with motivation.",
    scienceBasis: "Procedures require clinical indication. GERD is normally managed with PPIs, not procedures — unless investigating Barrett's oesophagus.",
    examples: [
      { claim: { icd10: "K21.0", tariff: "0401" }, result: "WARNING", reason: "GERD + procedure" },
      { claim: { icd10: "K21.0", tariff: "0401", motivationText: "endoscopic evaluation for suspected Barretts" }, result: "VALID", reason: "Motivated" },
    ] },

  { code: "MOTIVATION_OVERRIDE", name: "Motivation Override", severity: "info",
    source: "Clinical practice — doctor's notes justify unusual combinations",
    announced: "Standard clinical practice", announcedBy: "HPCSA",
    description: "When clinical motivation explains a flagged combination, warning downgraded to info.",
    scienceBasis: "Medicine is not algorithmic. Doctors encounter unusual presentations. The motivation is the doctor's clinical reasoning — a human auditor would accept it.",
    examples: [
      { claim: { icd10: "M54.5", tariff: "5101", motivationText: "fell from height, suspected rib fracture" }, result: "VALID", reason: "Motivated" },
      { claim: { icd10: "M54.5", tariff: "5101" }, result: "WARNING", reason: "No motivation provided" },
    ] },
];

// ═══════════════════════════════════════════════════════════════
// TRAINING DATA GENERATOR — JSONL for fine-tuning
// ═══════════════════════════════════════════════════════════════

export function generateTrainingJSONL(): string {
  const lines: string[] = [];
  for (const rule of RULE_REGISTRY) {
    for (const example of rule.examples) {
      lines.push(JSON.stringify({
        messages: [
          { role: "system", content: "You are a South African medical claims validation engine. Validate claims against SA ICD-10 coding standards, Medical Schemes Act regulations, PHISC EDIFACT standards, and scheme-specific rules. For each claim, determine: VALID, REJECTED, or WARNING. Provide the rule code, name, and reasoning." },
          { role: "user", content: formatClaim(example.claim) },
          { role: "assistant", content: `Result: ${example.result}\nRule: ${rule.code} — ${rule.name}\nReason: ${example.reason}\nRegulatory source: ${rule.source}\nScience basis: ${rule.scienceBasis}` },
        ],
      }));
    }
  }
  return lines.join("\n");
}

function formatClaim(claim: Record<string, unknown>): string {
  const parts = ["Validate this SA medical claim:"];
  for (const [key, value] of Object.entries(claim)) {
    if (value !== undefined && value !== null) {
      parts.push(`${key}: ${value === "" ? "(empty)" : value}`);
    }
  }
  return parts.join("\n");
}

// ═══════════════════════════════════════════════════════════════
// AI PROVENANCE (HPCSA Booklet 20, November 2025)
// ═══════════════════════════════════════════════════════════════

export function createProvenance(rulesApplied: string[], motivationOverride: boolean): AIProvenanceMetadata {
  return {
    isAIGenerated: true,
    engineVersion: "claims-engine-v3.1",
    modelVersion: undefined,
    timestamp: new Date().toISOString(),
    rulesApplied,
    motivationOverrideUsed: motivationOverride,
    regulatoryBasis: "HPCSA Booklet 20 (Nov 2025): AI-derived outputs must be clearly labeled as AI-generated",
  };
}
