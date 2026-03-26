/**
 * AUTHORITATIVE RULES REGISTRY
 *
 * The SINGLE SOURCE OF TRUTH for all claims validation rules.
 * Every rule traced to actual SA law. Every severity defined here only.
 * All other files read from this registry via registry-lookup.ts.
 *
 * Legal sources:
 * - MSA = Medical Schemes Act 131 of 1998
 * - MSR = Medical Schemes Regulations (2024 amendments)
 * - PHISC = PHISC MEDCLM v0-912-13.4 specification
 * - HPCSA = HPCSA Ethical Rules / Booklet 20
 * - CMS = Council for Medical Schemes circulars
 * - WHO = WHO ICD-10 Volume 2 coding rules
 * - BHF = Board of Healthcare Funders adjustment codes
 */

// ── Types ──────────────────────────────────────────────────────

export interface LegalSource {
  code: string;
  description: string;
  type: "act" | "regulation" | "circular" | "phisc_spec" | "hpcsa_rule" | "who_standard" | "scheme_rule" | "bhf_standard";
  year: number;
}

export interface OverridePolicy {
  canBeOverridden: boolean;
  allowedLayers: OverrideLayer[];
  maxAction: "none" | "downgrade_one" | "downgrade_to_info" | "remove";
}

export type OverrideLayer = "reasoning_pass" | "doctor_reasoning" | "agentic_review";
export type RulePrecedence = 1 | 2 | 3 | 4 | 5;
export type RuleSeverity = "error" | "warning" | "info";

export interface RegistryRule {
  code: string;
  name: string;
  severity: RuleSeverity;
  precedence: RulePrecedence;
  override: OverridePolicy;
  legal: LegalSource[];
  schemes: string[];  // ["*"] = all, ["DH"] = Discovery only
  category: string;
  description: string;
  active: boolean;
}

// ── The Registry ───────────────────────────────────────────────

export const RULES_REGISTRY: RegistryRule[] = [

  // ═══════════════════════════════════════════════════════════════
  // TIER 1: HARD GATE — Switch will reject. NO override. EVER.
  // ═══════════════════════════════════════════════════════════════

  {
    code: "MISSING_ICD10",
    name: "Missing ICD-10 Diagnosis Code",
    severity: "error",
    precedence: 1,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "PHISC_MEDCLM_S5.2", description: "PHISC MEDCLM v0-912 Section 5.2 — DIA segment mandatory", type: "phisc_spec", year: 2013 },
      { code: "MSA_S59_1", description: "Medical Schemes Act s59(1) — claim must include diagnosis", type: "act", year: 1998 },
    ],
    schemes: ["*"], category: "coding",
    description: "Primary ICD-10 diagnosis code is required on every claim. Switches reject without it.",
    active: true,
  },
  {
    code: "INVALID_FORMAT",
    name: "Invalid ICD-10 Format",
    severity: "error",
    precedence: 1,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "WHO_ICD10_V2_S3", description: "WHO ICD-10 Volume 2 Section 3 — Code structure: Letter + 2-4 digits", type: "who_standard", year: 2019 },
      { code: "SA_MIT_2021", description: "SA Master Industry Table 2021 — valid code format", type: "circular", year: 2021 },
    ],
    schemes: ["*"], category: "coding",
    description: "ICD-10 must be uppercase letter + 2-4 digits with optional decimal. No spaces, special chars, or US ICD-10-CM codes.",
    active: true,
  },
  {
    code: "GENDER_MISMATCH",
    name: "Gender-Restricted Diagnosis Mismatch",
    severity: "error",
    precedence: 1,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "WHO_ICD10_V2_S4.4", description: "WHO ICD-10 Volume 2 Section 4.4 — Gender-specific codes", type: "who_standard", year: 2019 },
      { code: "SA_MIT_COL16", description: "SA MIT column 16 — Gender flag (M/F/B)", type: "circular", year: 2021 },
    ],
    schemes: ["*"], category: "coding",
    description: "Female-only codes (O00-O99, N70-N98, C51-C58) on male patient or male-only codes (N40-N51, C61-C62) on female.",
    active: true,
  },
  {
    code: "AGE_MISMATCH",
    name: "Age-Restricted Diagnosis Mismatch",
    severity: "error",
    precedence: 1,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "WHO_ICD10_V2_S4.3", description: "WHO ICD-10 Volume 2 — Age-specific codes (P-codes neonatal)", type: "who_standard", year: 2019 },
    ],
    schemes: ["*"], category: "coding",
    description: "Perinatal codes (P00-P96) only for patients ≤28 days. Neonatal modifier 0019 only for neonates.",
    active: true,
  },
  {
    code: "MISSING_ECC",
    name: "Missing External Cause Code",
    severity: "error",
    precedence: 1,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "PHISC_MEDCLM_S6.3", description: "PHISC MEDCLM Section 6.3 — S/T codes require V/W/X/Y external cause", type: "phisc_spec", year: 2013 },
      { code: "WHO_ICD10_V2_S3.1.3", description: "WHO ICD-10 Volume 2 Section 3.1.3 — Dual coding for injuries mandatory", type: "who_standard", year: 2019 },
      { code: "CMS_CIRC_2024_ICD", description: "CMS Circular — ICD-10 coding standards for SA", type: "circular", year: 2024 },
    ],
    schemes: ["*"], category: "coding",
    description: "Injury/poisoning codes (S00-T98) MUST have external cause code (V01-Y98) as secondary. Switches enforce this. Motivation text does NOT replace the formal code.",
    active: true,
  },
  {
    code: "ECC_AS_PRIMARY",
    name: "External Cause Code as Primary",
    severity: "error",
    precedence: 1,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "WHO_ICD10_V2_S3.1.3", description: "WHO ICD-10 — External cause codes are always secondary", type: "who_standard", year: 2019 },
    ],
    schemes: ["*"], category: "coding",
    description: "V/W/X/Y external cause codes cannot be the primary diagnosis. Must be secondary to S/T injury code.",
    active: true,
  },
  {
    code: "ASTERISK_PRIMARY",
    name: "Manifestation Code as Primary",
    severity: "error",
    precedence: 1,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "WHO_ICD10_V2_S3.1.2", description: "WHO ICD-10 — Asterisk (*) codes are manifestation codes, cannot be primary", type: "who_standard", year: 2019 },
    ],
    schemes: ["*"], category: "coding",
    description: "Asterisk (*) manifestation codes must be secondary to a dagger (†) etiology code.",
    active: true,
  },
  {
    code: "FABRICATED_NAPPI",
    name: "Fabricated NAPPI Code",
    severity: "error",
    precedence: 1,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "MSA_REG_8_1", description: "Medical Schemes Regulations reg 8(1) — valid medicine codes required", type: "regulation", year: 2003 },
    ],
    schemes: ["*"], category: "coding",
    description: "NAPPI code not found in MediKredit PUBDOM national database. Code may be fabricated.",
    active: true,
  },
  {
    code: "FUTURE_DATE",
    name: "Future Date of Service",
    severity: "error",
    precedence: 1,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "MSA_S59_2", description: "Medical Schemes Act s59(2) — claim must be for services rendered", type: "act", year: 1998 },
    ],
    schemes: ["*"], category: "administrative",
    description: "Date of service cannot be in the future. Claims are for services already rendered.",
    active: true,
  },
  {
    code: "FUTURE_DATE_SERVICE",
    name: "Future Service Date",
    severity: "error",
    precedence: 1,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "MSA_S59_2", description: "Medical Schemes Act s59(2)", type: "act", year: 1998 },
    ],
    schemes: ["*"], category: "administrative",
    description: "Service date is after today's date.",
    active: true,
  },
  {
    code: "STALE_CLAIM",
    name: "Stale Claim (>120 Days)",
    severity: "error",
    precedence: 1,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "MSA_REG_6_3", description: "Medical Schemes Regulations — 120-day submission window (most schemes)", type: "regulation", year: 2003 },
      { code: "BHF_ADJ_013", description: "BHF adjustment code 013 — Claim exceeds submission deadline", type: "bhf_standard", year: 2024 },
    ],
    schemes: ["*"], category: "administrative",
    description: "Claim older than 120 days from date of service. Boundary is INCLUSIVE (day 120 = valid, day 121 = rejected).",
    active: true,
  },
  {
    code: "CLAIM_WINDOW_EXPIRED",
    name: "Claim Window Expired",
    severity: "error",
    precedence: 1,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "MSA_REG_6_3", description: "Medical Schemes Regulations — submission deadline", type: "regulation", year: 2003 },
    ],
    schemes: ["*"], category: "administrative",
    description: "Claim submission window has expired.",
    active: true,
  },
  {
    code: "MISSING_PATIENT_NAME",
    name: "Missing Patient Name",
    severity: "error",
    precedence: 1,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "PHISC_MEDCLM_S3.1", description: "PHISC MEDCLM — NAD segment patient name mandatory", type: "phisc_spec", year: 2013 },
    ],
    schemes: ["*"], category: "administrative",
    description: "Patient name is required for member identification at the switch.",
    active: true,
  },
  {
    code: "MISSING_MEMBERSHIP",
    name: "Missing Membership Number",
    severity: "error",
    precedence: 1,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "PHISC_MEDCLM_S3.2", description: "PHISC MEDCLM — RFF+AHI membership reference mandatory", type: "phisc_spec", year: 2013 },
    ],
    schemes: ["*"], category: "administrative",
    description: "Medical aid membership number required for claim routing.",
    active: true,
  },
  {
    code: "NO_PATIENT_IDENTIFIER",
    name: "No Patient Identifier",
    severity: "error",
    precedence: 1,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "PHISC_MEDCLM_S3", description: "PHISC MEDCLM — Patient identification required", type: "phisc_spec", year: 2013 },
    ],
    schemes: ["*"], category: "administrative",
    description: "Neither SA ID number nor scheme membership number provided.",
    active: true,
  },
  {
    code: "NEONATAL_ON_ADULT",
    name: "Neonatal Code on Adult",
    severity: "error",
    precedence: 1,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "WHO_ICD10_V2_S4.3", description: "WHO ICD-10 — P-codes for neonatal period only", type: "who_standard", year: 2019 },
    ],
    schemes: ["*"], category: "coding",
    description: "Neonatal/perinatal codes (P00-P96) on a patient older than 28 days.",
    active: true,
  },
  {
    code: "OBSTETRIC_ON_MALE",
    name: "Obstetric Code on Male",
    severity: "error",
    precedence: 1,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "WHO_ICD10_V2_S4.4", description: "WHO ICD-10 — Obstetric codes female-only", type: "who_standard", year: 2019 },
    ],
    schemes: ["*"], category: "coding",
    description: "Obstetric code (O00-O99) used on a male patient.",
    active: true,
  },
  {
    code: "DUPLICATE_CLAIM",
    name: "Exact Duplicate Claim",
    severity: "error",
    precedence: 1,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "MSA_S59_3", description: "Medical Schemes Act — duplicate claims prohibited", type: "act", year: 1998 },
      { code: "BHF_ADJ_006", description: "BHF adjustment code 006 — Duplicate claim", type: "bhf_standard", year: 2024 },
    ],
    schemes: ["*"], category: "fraud",
    description: "Same patient + ICD-10 + tariff + date + amount = exact duplicate.",
    active: true,
  },
  {
    code: "EXCESSIVE_QUANTITY",
    name: "Excessive Quantity",
    severity: "error",
    precedence: 1,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "HPCSA_BK20_S4", description: "HPCSA Booklet 20 Section 4 — Ethical billing practices", type: "hpcsa_rule", year: 2022 },
    ],
    schemes: ["*"], category: "fraud",
    description: "Quantity exceeds clinical norm (e.g., >2 consultations per day per patient).",
    active: true,
  },
  {
    code: "INVALID_AMOUNT",
    name: "Invalid Claim Amount",
    severity: "error",
    precedence: 1,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "PHISC_MEDCLM_S7.1", description: "PHISC MEDCLM — MOA segment amount must be positive numeric", type: "phisc_spec", year: 2013 },
    ],
    schemes: ["*"], category: "financial",
    description: "Negative, zero, or non-numeric claim amount.",
    active: true,
  },
  {
    code: "INVALID_AMOUNT_FORMAT",
    name: "Invalid Amount Format",
    severity: "error",
    precedence: 1,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "PHISC_MEDCLM_S7.1", description: "PHISC MEDCLM — Amount format: numeric, no currency prefix", type: "phisc_spec", year: 2013 },
    ],
    schemes: ["*"], category: "financial",
    description: "Amount contains non-numeric characters (R-prefix, commas, spaces). Submit numeric only.",
    active: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // TIER 2: LEGAL MANDATE — Human reviewer only. No AI override.
  // ═══════════════════════════════════════════════════════════════

  {
    code: "INVALID_DATE_FORMAT",
    name: "Invalid Date Format",
    severity: "error",
    precedence: 2,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "PHISC_MEDCLM_S4.2", description: "PHISC MEDCLM — DTM segment format YYYYMMDD", type: "phisc_spec", year: 2013 },
    ],
    schemes: ["*"], category: "administrative",
    description: "Date format invalid (must be YYYY-MM-DD or YYYYMMDD).",
    active: true,
  },
  {
    code: "INVALID_PRACTICE_NUMBER",
    name: "Invalid Practice Number",
    severity: "error",
    precedence: 2,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "HPCSA_BHF_REG", description: "HPCSA/BHF — Practice number must be 7-digit numeric", type: "hpcsa_rule", year: 2022 },
    ],
    schemes: ["*"], category: "administrative",
    description: "Practice number must be 7-digit numeric (e.g., 0143721). Prefix indicates discipline.",
    active: true,
  },
  {
    code: "DENTAL_TARIFF_MISMATCH",
    name: "Dental Tariff with Non-Dental Diagnosis",
    severity: "error",
    precedence: 2,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "HPCSA_BK20_S3", description: "HPCSA Booklet 20 — Discipline-appropriate billing", type: "hpcsa_rule", year: 2022 },
    ],
    schemes: ["*"], category: "coding",
    description: "Dental tariffs (8100-8999) with non-dental ICD-10 (must be K00-K14).",
    active: true,
  },
  {
    code: "TARIFF_DISCIPLINE_MISMATCH",
    name: "Tariff-Discipline Mismatch",
    severity: "error",
    precedence: 2,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "HPCSA_BK20_S3", description: "HPCSA — Practitioners must bill within their discipline scope", type: "hpcsa_rule", year: 2022 },
    ],
    schemes: ["*"], category: "coding",
    description: "Practitioner billing tariff outside their registered discipline.",
    active: true,
  },
  {
    code: "INVALID_OPTION_CODE",
    name: "Invalid Scheme Option Code",
    severity: "error",
    precedence: 2,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "MSA_REG_10_6", description: "Medical Schemes Regulations reg 10(6) — valid plan option required", type: "regulation", year: 2003 },
    ],
    schemes: ["*"], category: "administrative",
    description: "Scheme option code not in the scheme's valid plan list.",
    active: true,
  },
  {
    code: "SCHEME_OPTION_MISSING",
    name: "Missing Scheme Option Code",
    severity: "error",
    precedence: 2,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "PHISC_MEDCLM_S3.4", description: "PHISC MEDCLM — Scheme option code required for benefit routing", type: "phisc_spec", year: 2013 },
    ],
    schemes: ["DH", "GEMS"], category: "administrative",
    description: "Discovery Health and GEMS strictly require option codes for Healthbridge benefit routing. Other schemes accept claims without option codes.",
    active: true,
  },
  {
    code: "SERVICE_NOT_RENDERED",
    name: "Service Not Rendered (No-Show)",
    severity: "error",
    precedence: 2,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "MSA_S59_1", description: "Medical Schemes Act s59(1) — claims for services actually rendered", type: "act", year: 1998 },
      { code: "HPCSA_BK20_S5", description: "HPCSA — Cannot bill scheme for no-show", type: "hpcsa_rule", year: 2022 },
    ],
    schemes: ["*"], category: "fraud",
    description: "Patient did not attend but consultation tariff billed to scheme. No-show fees are patient liability only.",
    active: true,
  },
  {
    code: "TELEPHONIC_ON_INPERSON",
    name: "Telephonic on In-Person Tariff",
    severity: "error",
    precedence: 2,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "HPCSA_BK20_S4.2", description: "HPCSA — Tariff must match service type", type: "hpcsa_rule", year: 2022 },
    ],
    schemes: ["*"], category: "fraud",
    description: "Telephonic consultation billed on in-person tariff (0190/0191/0192).",
    active: true,
  },
  {
    code: "PATIENT_NOT_PRESENT",
    name: "Patient Not Present",
    severity: "error",
    precedence: 2,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "HPCSA_BK20_S4.1", description: "HPCSA — Patient must be present for consultation tariffs", type: "hpcsa_rule", year: 2022 },
    ],
    schemes: ["*"], category: "fraud",
    description: "Patient not present for non-script tariff. Only 0199 (chronic repeat) allows absent patient.",
    active: true,
  },
  {
    code: "ICD_10_CM_DETECTED",
    name: "US ICD-10-CM Code (Not SA)",
    severity: "error",
    precedence: 2,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "SA_MIT_2021", description: "SA uses WHO ICD-10, not US ICD-10-CM", type: "circular", year: 2021 },
      { code: "CMS_CODING_STD_V3", description: "CMS SA ICD-10 Coding Standards Version 3", type: "circular", year: 2009 },
    ],
    schemes: ["*"], category: "coding",
    description: "Code has 2+ decimal digits (e.g., M54.50) — US ICD-10-CM format. SA uses max 1 decimal digit.",
    active: true,
  },
  {
    code: "TRAILING_WHITESPACE",
    name: "Amount Contains Whitespace",
    severity: "error",
    precedence: 2,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "PHISC_MEDCLM_S7.1", description: "PHISC MEDCLM — Numeric fields must not contain whitespace", type: "phisc_spec", year: 2013 },
    ],
    schemes: ["*"], category: "administrative",
    description: "Amount field has leading/trailing whitespace that may cause switch parsing failure.",
    active: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // TIER 3: SCHEME RULE — Downgrade with clinical motivation only
  // ═══════════════════════════════════════════════════════════════

  {
    code: "PREAUTH_REQUIRED",
    name: "Pre-Authorisation Required",
    severity: "warning",
    precedence: 3,
    override: { canBeOverridden: true, allowedLayers: ["doctor_reasoning", "agentic_review"], maxAction: "downgrade_to_info" },
    legal: [
      { code: "MSA_REG_9_1", description: "Medical Schemes Regulations — schemes may require pre-authorisation", type: "regulation", year: 2003 },
    ],
    schemes: ["*"], category: "scheme_specific",
    description: "Procedure may require pre-authorisation. GP routine orders (CXR, ECG, pathology) exempt.",
    active: true,
  },
  {
    code: "CDL_AUTH_REQUIRED",
    name: "CDL Authorisation Required",
    severity: "warning",
    precedence: 3,
    override: { canBeOverridden: true, allowedLayers: ["doctor_reasoning"], maxAction: "downgrade_to_info" },
    legal: [
      { code: "MSA_S27_1", description: "Medical Schemes Act s27(1) — CDL conditions must be covered", type: "act", year: 1998 },
    ],
    schemes: ["*"], category: "pmb",
    description: "CDL condition detected — chronic authorisation may be required.",
    active: true,
  },
  {
    code: "NON_SPECIFIC",
    name: "Insufficient ICD-10 Specificity",
    severity: "warning",
    precedence: 3,
    override: { canBeOverridden: true, allowedLayers: ["agentic_review"], maxAction: "downgrade_to_info" },
    legal: [
      { code: "WHO_ICD10_V2_S4.1", description: "WHO ICD-10 — Use most specific code available", type: "who_standard", year: 2019 },
    ],
    schemes: ["*"], category: "coding",
    description: "3-character code where 4th character exists. Exceptions: I10, B20, D66, G35, G20 (complete at 3).",
    active: true,
  },
  {
    code: "PROMPT_INJECTION_DETECTED",
    name: "Suspicious Motivation Text",
    severity: "warning",
    precedence: 3,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "POPIA_S19", description: "POPIA Section 19 — Security safeguards for personal information", type: "act", year: 2013 },
    ],
    schemes: ["*"], category: "fraud",
    description: "Motivation text contains adversarial instructions (bypass, skip, fake regulations, fake system messages).",
    active: true,
  },
  {
    code: "MED_DIAGNOSIS_MISMATCH",
    name: "Medication-Diagnosis Mismatch",
    severity: "warning",
    precedence: 3,
    override: { canBeOverridden: true, allowedLayers: ["agentic_review"], maxAction: "downgrade_to_info" },
    legal: [
      { code: "SAHPRA_GMP", description: "SAHPRA — Medicines prescribed for registered indications", type: "regulation", year: 2024 },
    ],
    schemes: ["*"], category: "clinical",
    description: "Medication category does not match the diagnosis. E.g., metformin (diabetes) for asthma.",
    active: true,
  },
  {
    code: "CROSS_SCHEME_REFERENCE",
    name: "Cross-Scheme Reference in Motivation",
    severity: "warning",
    precedence: 3,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "MSA_S59_1", description: "Medical Schemes Act — claim must be accurate", type: "act", year: 1998 },
    ],
    schemes: ["*"], category: "fraud",
    description: "Motivation references a different scheme than the claim (e.g., GEMS claim mentions Discovery).",
    active: true,
  },
  {
    code: "CODE_PAIR_VIOLATION",
    name: "Code Pair Violation (Unbundling)",
    severity: "warning",
    precedence: 3,
    override: { canBeOverridden: true, allowedLayers: ["agentic_review"], maxAction: "downgrade_to_info" },
    legal: [
      { code: "HPCSA_BK20_S6", description: "HPCSA — Unbundling is unethical billing", type: "hpcsa_rule", year: 2022 },
    ],
    schemes: ["*"], category: "bundling",
    description: "Tariff codes that should not be billed together (e.g., components of a panel).",
    active: true,
  },
  {
    code: "KEYCARE_CDL_NO_MOTIVATION",
    name: "KeyCare CDL Without Motivation",
    severity: "warning",
    precedence: 3,
    override: { canBeOverridden: false, allowedLayers: [], maxAction: "none" },
    legal: [
      { code: "DH_KC_NETWORK", description: "Discovery Health KeyCare Network Constraints", type: "scheme_rule", year: 2026 },
    ],
    schemes: ["DH"], category: "scheme_specific",
    description: "KeyCare plan with CDL condition but no clinical motivation.",
    active: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // TIER 4: CLINICAL ADVISORY — Override with justification
  // ═══════════════════════════════════════════════════════════════

  {
    code: "TARIFF_DIAGNOSIS_MISMATCH",
    name: "Tariff-Diagnosis Mismatch",
    severity: "warning",
    precedence: 4,
    override: { canBeOverridden: true, allowedLayers: ["doctor_reasoning", "agentic_review"], maxAction: "remove" },
    legal: [
      { code: "HPCSA_BK20_S4", description: "HPCSA — Tariff must match clinical indication", type: "hpcsa_rule", year: 2022 },
    ],
    schemes: ["*"], category: "clinical",
    description: "Tariff code may not match the diagnosis. GP claims are often legitimate (GPs treat everything).",
    active: true,
  },
  {
    code: "PROCEDURE_DIAGNOSIS_CONTRADICTION",
    name: "Procedure-Diagnosis Contradiction",
    severity: "warning",
    precedence: 4,
    override: { canBeOverridden: true, allowedLayers: ["agentic_review"], maxAction: "downgrade_to_info" },
    legal: [
      { code: "HPCSA_BK20_S4", description: "HPCSA — Clinical appropriateness", type: "hpcsa_rule", year: 2022 },
    ],
    schemes: ["*"], category: "clinical",
    description: "Procedure tariff contradicts the diagnosis (e.g., suturing with acid reflux code).",
    active: true,
  },
  {
    code: "IMAGING_DIAGNOSIS_MISMATCH",
    name: "Imaging-Diagnosis Mismatch",
    severity: "warning",
    precedence: 4,
    override: { canBeOverridden: true, allowedLayers: ["doctor_reasoning", "agentic_review"], maxAction: "downgrade_to_info" },
    legal: [
      { code: "HPCSA_BK20_S4", description: "HPCSA — Imaging must be clinically indicated", type: "hpcsa_rule", year: 2022 },
    ],
    schemes: ["*"], category: "clinical",
    description: "CXR for UTI/headache = genuinely inappropriate. CXR for respiratory = standard practice.",
    active: true,
  },
  {
    code: "CLINICAL_RED_FLAG",
    name: "Clinical Red Flag",
    severity: "warning",
    precedence: 4,
    override: { canBeOverridden: true, allowedLayers: ["doctor_reasoning", "agentic_review"], maxAction: "downgrade_to_info" },
    legal: [
      { code: "HPCSA_BK20_S4", description: "HPCSA — Clinical review", type: "hpcsa_rule", year: 2022 },
    ],
    schemes: ["*"], category: "clinical",
    description: "Clinical combination flagged for review (e.g., imaging for back pain without motivation).",
    active: true,
  },
  {
    code: "SYMPTOM_CODE",
    name: "Symptom Code as Primary",
    severity: "info",
    precedence: 4,
    override: { canBeOverridden: true, allowedLayers: ["doctor_reasoning", "agentic_review"], maxAction: "remove" },
    legal: [
      { code: "WHO_ICD10_V2_S4.5", description: "WHO — Symptom codes acceptable for undifferentiated presentations", type: "who_standard", year: 2019 },
    ],
    schemes: ["*"], category: "coding",
    description: "R-codes (symptoms) as primary. Valid for acute undifferentiated GP presentations.",
    active: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // TIER 5: INFORMATIONAL — Remove freely
  // ═══════════════════════════════════════════════════════════════

  {
    code: "BENFORD_LAW_DEVIATION",
    name: "Benford's Law Deviation",
    severity: "info",
    precedence: 5,
    override: { canBeOverridden: true, allowedLayers: ["reasoning_pass", "doctor_reasoning", "agentic_review"], maxAction: "remove" },
    legal: [],
    schemes: ["*"], category: "fraud",
    description: "Forensic accounting flag. First-digit distribution anomaly. Informational only.",
    active: true,
  },
  {
    code: "COPY_PASTE_MOTIVATION",
    name: "Duplicate Motivation Text",
    severity: "info",
    precedence: 5,
    override: { canBeOverridden: true, allowedLayers: ["reasoning_pass", "doctor_reasoning", "agentic_review"], maxAction: "remove" },
    legal: [],
    schemes: ["*"], category: "fraud",
    description: "Identical motivation across multiple claims. Common in template-based practices.",
    active: true,
  },
  {
    code: "AMOUNT_OUTLIER",
    name: "Amount Statistical Outlier",
    severity: "info",
    precedence: 5,
    override: { canBeOverridden: true, allowedLayers: ["reasoning_pass", "doctor_reasoning", "agentic_review"], maxAction: "remove" },
    legal: [],
    schemes: ["*"], category: "financial",
    description: "Amount is >3 standard deviations from batch mean. Normal price variance.",
    active: true,
  },
  {
    code: "WEEKEND_NO_AFTER_HOURS",
    name: "Weekend Without After-Hours Modifier",
    severity: "info",
    precedence: 5,
    override: { canBeOverridden: true, allowedLayers: ["reasoning_pass", "doctor_reasoning", "agentic_review"], maxAction: "remove" },
    legal: [],
    schemes: ["*"], category: "coding",
    description: "Saturday consultation without modifier. Saturday morning is normal GP hours in SA.",
    active: true,
  },
  {
    code: "UNKNOWN_TARIFF",
    name: "Unknown Tariff Code",
    severity: "info",
    precedence: 5,
    override: { canBeOverridden: true, allowedLayers: ["reasoning_pass", "doctor_reasoning", "agentic_review"], maxAction: "remove" },
    legal: [],
    schemes: ["*"], category: "coding",
    description: "Tariff code not in local reference database. May still be valid.",
    active: true,
  },
];
