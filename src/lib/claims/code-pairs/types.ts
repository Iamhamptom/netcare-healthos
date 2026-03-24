// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Code-Pair Violation Types — Shared across all rule files
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type ViolationType =
  | "never_together"
  | "needs_modifier"
  | "component_of"
  | "mutually_exclusive";

export type ViolationCategory =
  | "icd10_exclusion"
  | "tariff_bundling"
  | "tariff_diagnosis_mismatch"
  | "procedure_hierarchy"
  | "pathology_panel"
  | "radiology_component"
  | "consultation_overlap"
  | "surgical_package"
  | "emergency_overlap"
  | "anaesthesia_bundling"
  | "nursing_overlap"
  | "dental_bundling"
  | "allied_health_overlap"
  | "gender_mismatch"
  | "specificity_conflict"
  | "discipline_mismatch"
  | "panel_component"
  | "maternity_bundling"
  | "ophthalmology_bundling"
  | "cardiology_bundling"
  | "orthopaedic_bundling"
  | "ent_bundling"
  | "urology_bundling"
  | "mental_health_overlap"
  | "age_mismatch"
  | "asterisk_primary"
  | "ecc_requirement"
  | "acute_chronic_conflict"
  | "contrast_conflict";

export interface CodePairViolation {
  /** First ICD-10 or tariff code in the pair */
  code1: string;
  /** Second ICD-10 or tariff code in the pair */
  code2: string;
  /** Type of violation */
  type: ViolationType;
  /** Human-readable explanation of why the pair violates coding rules */
  reason: string;
  /** Authoritative source for this rule */
  source: string;
  /** Category for grouping in reports */
  category?: ViolationCategory;
}

/** Result from dynamic rule generators */
export interface DynamicViolation extends CodePairViolation {
  /** Whether this was generated programmatically vs hand-curated */
  generated: true;
  /** Generator that produced this rule */
  generator: string;
}
