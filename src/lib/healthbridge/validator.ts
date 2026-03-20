// Claims pre-submission validation engine
// Catches rejections BEFORE submission — the #1 revenue-saving feature
// Based on real SA scheme rejection data: incorrect ICD-10, mismatched patient details,
// missing auth, benefit exhaustion, late submission, PMB coding errors

import { COMMON_ICD10, COMMON_CPT, isValidICD10, isValidCPT, isValidBHF, REJECTION_CODES } from "./codes";
import { PMB_ICD10_CODES, CDL_CONDITIONS } from "./pmb";
import type { ClaimLineItem } from "./types";

export interface ValidationIssue {
  line?: number;
  field: string;
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  suggestion?: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  warnings: number;
  errors: number;
  pmbDetected: boolean;
  pmbConditions: string[];
  estimatedRejectionRisk: "low" | "medium" | "high";
}

/** Validate a claim before submission — catches all common SA rejection causes */
export function validateClaim(data: {
  patientName: string;
  patientDob?: string;
  patientIdNumber?: string;
  medicalAidScheme: string;
  membershipNumber: string;
  dependentCode: string;
  dateOfService: string;
  placeOfService: string;
  bhfNumber: string;
  providerNumber?: string;
  treatingProvider?: string;
  authorizationNumber?: string;
  lineItems: ClaimLineItem[];
  patientGender?: string;
  notes?: string;
}): ValidationResult {
  const issues: ValidationIssue[] = [];
  let pmbDetected = false;
  const pmbConditions: string[] = [];

  // ── Patient details validation ──
  if (!data.patientName || data.patientName.trim().length < 2) {
    issues.push({ field: "patientName", severity: "error", code: "MISSING_PATIENT_NAME", message: "Patient name is required (min 2 characters)", suggestion: "Check patient record for full name" });
  }
  if (data.patientName && data.patientName.length > 100) {
    issues.push({ field: "patientName", severity: "error", code: "PATIENT_NAME_TOO_LONG", message: "Patient name must not exceed 100 characters", suggestion: "Abbreviate middle names or use initials" });
  }
  if (data.notes && data.notes.length > 1000) {
    issues.push({ field: "notes", severity: "error", code: "NOTES_TOO_LONG", message: "Notes must not exceed 1000 characters", suggestion: "Shorten the notes or move detailed information to the patient record" });
  }

  if (data.patientDob) {
    const dob = new Date(data.patientDob);
    if (isNaN(dob.getTime())) {
      issues.push({ field: "patientDob", severity: "error", code: "INVALID_DOB", message: "Date of birth is invalid", suggestion: "Use YYYY-MM-DD format" });
    } else if (dob > new Date()) {
      issues.push({ field: "patientDob", severity: "error", code: "FUTURE_DOB", message: "Date of birth cannot be in the future" });
    }
  }

  if (data.patientIdNumber) {
    // SA ID number is 13 digits
    if (!/^\d{13}$/.test(data.patientIdNumber) && data.patientIdNumber.length > 0) {
      issues.push({ field: "patientIdNumber", severity: "warning", code: "INVALID_SA_ID", message: "SA ID number should be 13 digits (or use passport number)", suggestion: "Verify ID number on patient's ID document" });
    } else if (/^\d{13}$/.test(data.patientIdNumber) && data.patientDob) {
      // Cross-validate DOB with SA ID (first 6 digits = YYMMDD)
      const idDob = data.patientIdNumber.slice(0, 6);
      const dobFormatted = data.patientDob.replace(/-/g, "").slice(2, 8);
      if (idDob !== dobFormatted) {
        issues.push({ field: "patientIdNumber", severity: "error", code: "DOB_ID_MISMATCH", message: `Date of birth (${data.patientDob}) does not match ID number (implies ${idDob})`, suggestion: "Rejection code 04 — verify patient DOB against ID document" });
      }
      // Cross-validate gender with SA ID (digit 7-10: 0000-4999 = female, 5000-9999 = male)
      if (data.patientGender) {
        const genderDigits = parseInt(data.patientIdNumber.slice(6, 10));
        const idGender = genderDigits >= 5000 ? "male" : "female";
        if (data.patientGender.toLowerCase() !== idGender && data.patientGender !== "") {
          issues.push({ field: "patientGender", severity: "warning", code: "GENDER_MISMATCH", message: `Patient gender (${data.patientGender}) does not match ID number (implies ${idGender})`, suggestion: "Some schemes reject on gender mismatch" });
        }
      }
    }
  }

  // ── Membership validation ──
  if (!data.membershipNumber || data.membershipNumber.trim().length < 3) {
    issues.push({ field: "membershipNumber", severity: "error", code: "MISSING_MEMBERSHIP", message: "Medical aid membership number is required", suggestion: "Check patient's medical aid card" });
  }
  if (data.membershipNumber && data.membershipNumber.length > 20) {
    issues.push({ field: "membershipNumber", severity: "error", code: "MEMBERSHIP_TOO_LONG", message: "Membership number must not exceed 20 characters", suggestion: "Verify membership number on medical aid card" });
  }
  // GEMS requires 9 digits including leading zeros
  if (data.medicalAidScheme.toLowerCase().includes("gems") && data.membershipNumber) {
    if (!/^\d{9}$/.test(data.membershipNumber)) {
      issues.push({ field: "membershipNumber", severity: "error", code: "GEMS_MEMBERSHIP_FORMAT", message: "GEMS membership number must be exactly 9 digits (including leading zeros)", suggestion: "Pad with leading zeros: e.g., '12345' → '000012345'" });
    }
  }

  if (!data.dependentCode || !/^\d{2}$/.test(data.dependentCode)) {
    issues.push({ field: "dependentCode", severity: "error", code: "INVALID_DEPENDENT_CODE", message: "Dependent code must be 2 digits (00 = main member, 01-09 = dependents)", suggestion: "Check medical aid card for dependent number" });
  }

  // ── Provider validation ──
  if (data.bhfNumber && !isValidBHF(data.bhfNumber)) {
    issues.push({ field: "bhfNumber", severity: "error", code: "INVALID_BHF", message: "BHF practice number must be 7 digits", suggestion: "Check your BHF registration certificate" });
  }
  if (!data.bhfNumber || data.bhfNumber === "0000000") {
    issues.push({ field: "bhfNumber", severity: "error", code: "MISSING_BHF", message: "BHF practice number is required for all claims", suggestion: "Apply at pcns.co.za if not registered (R120 fee, 10-20 working days)" });
  }

  // ── Date validation ──
  if (data.dateOfService) {
    const dos = new Date(data.dateOfService);
    const now = new Date();
    if (dos > now) {
      issues.push({ field: "dateOfService", severity: "error", code: "FUTURE_DOS", message: "Date of service cannot be in the future" });
    }
    // 4-month (120 day) submission deadline — universal across all schemes
    const daysSinceDos = Math.floor((now.getTime() - dos.getTime()) / 86400000);
    if (daysSinceDos > 120) {
      issues.push({ field: "dateOfService", severity: "error", code: "LATE_SUBMISSION", message: `Claim is ${daysSinceDos} days old — exceeds 4-month (120-day) submission deadline`, suggestion: "Rejection code 12 — claim will be rejected as late submission. Apply for late submission exemption with the scheme if extenuating circumstances exist." });
    } else if (daysSinceDos > 90) {
      issues.push({ field: "dateOfService", severity: "warning", code: "APPROACHING_DEADLINE", message: `Claim is ${daysSinceDos} days old — approaching 120-day submission deadline`, suggestion: "Submit immediately to avoid late submission rejection" });
    }
  }

  // ── Line items validation ──
  if (!data.lineItems || data.lineItems.length === 0) {
    issues.push({ field: "lineItems", severity: "error", code: "NO_LINE_ITEMS", message: "At least one line item (procedure/service) is required" });
  }

  const icd10Codes: string[] = [];
  for (let i = 0; i < (data.lineItems || []).length; i++) {
    const item = data.lineItems[i];
    const lineNum = i + 1;

    // ICD-10 validation
    if (!item.icd10Code || item.icd10Code.trim() === "") {
      issues.push({ line: lineNum, field: "icd10Code", severity: "error", code: "MISSING_ICD10", message: `Line ${lineNum}: ICD-10 diagnosis code is required`, suggestion: "All SA medical aid claims require an ICD-10 code" });
    } else if (!isValidICD10(item.icd10Code)) {
      issues.push({ line: lineNum, field: "icd10Code", severity: "error", code: "INVALID_ICD10_FORMAT", message: `Line ${lineNum}: Invalid ICD-10 code format '${item.icd10Code}'`, suggestion: "Format: letter + 2 digits + optional .1-2 digits (e.g., J06.9, I10, E11.65)" });
    } else {
      icd10Codes.push(item.icd10Code);
      // Check if code is at maximum specificity
      if (item.icd10Code.length <= 3) {
        issues.push({ line: lineNum, field: "icd10Code", severity: "warning", code: "ICD10_LOW_SPECIFICITY", message: `Line ${lineNum}: ICD-10 code '${item.icd10Code}' may lack specificity`, suggestion: "SA coding standards require maximum specificity (4th/5th character). E.g., use 'J06.9' not 'J06'" });
      }

      // PMB detection
      if (PMB_ICD10_CODES[item.icd10Code]) {
        pmbDetected = true;
        pmbConditions.push(`${item.icd10Code}: ${PMB_ICD10_CODES[item.icd10Code]}`);
        issues.push({ line: lineNum, field: "icd10Code", severity: "info", code: "PMB_DETECTED", message: `Line ${lineNum}: PMB condition detected — '${item.icd10Code}' (${PMB_ICD10_CODES[item.icd10Code]})`, suggestion: "Prescribed Minimum Benefit — scheme MUST cover this regardless of benefit limits. Ensure treatment matches PMB protocol." });
      }

      // CDL (Chronic Disease List) detection
      const cdl = CDL_CONDITIONS.find((c) => item.icd10Code.startsWith(c.icdPrefix));
      if (cdl) {
        issues.push({ line: lineNum, field: "icd10Code", severity: "info", code: "CDL_CONDITION", message: `Line ${lineNum}: Chronic Disease List condition — '${cdl.name}'`, suggestion: `Ensure patient has approved chronic benefit authorization. Medication must be on formulary.` });
      }
    }

    // CPT validation
    if (!item.cptCode || item.cptCode.trim() === "") {
      issues.push({ line: lineNum, field: "cptCode", severity: "error", code: "MISSING_CPT", message: `Line ${lineNum}: Tariff/CPT code is required` });
    } else if (!isValidCPT(item.cptCode)) {
      issues.push({ line: lineNum, field: "cptCode", severity: "error", code: "INVALID_CPT_FORMAT", message: `Line ${lineNum}: Invalid CPT/tariff code format '${item.cptCode}'`, suggestion: "CPT codes are 4 digits (e.g., 0190 for GP consultation)" });
    }

    // ICD-10 / CPT clinical cross-match (common mismatches that cause rejections)
    if (item.icd10Code && item.cptCode) {
      const mismatch = checkClinicalMismatch(item.icd10Code, item.cptCode);
      if (mismatch) {
        issues.push({ line: lineNum, field: "cptCode", severity: "warning", code: "CLINICAL_MISMATCH", message: `Line ${lineNum}: ${mismatch.message}`, suggestion: mismatch.suggestion });
      }
    }

    // Amount validation
    if (!item.amount || item.amount <= 0) {
      issues.push({ line: lineNum, field: "amount", severity: "error", code: "INVALID_AMOUNT", message: `Line ${lineNum}: Amount must be greater than zero` });
    }

    // Quantity validation
    if (!item.quantity || item.quantity <= 0) {
      issues.push({ line: lineNum, field: "quantity", severity: "error", code: "INVALID_QUANTITY", message: `Line ${lineNum}: Quantity must be at least 1` });
    }

    // Description length validation
    if (item.description && item.description.length > 500) {
      issues.push({ line: lineNum, field: "description", severity: "error", code: "DESCRIPTION_TOO_LONG", message: `Line ${lineNum}: Description must not exceed 500 characters`, suggestion: "Use concise clinical descriptions" });
    }

    // NAPPI code validation (if provided)
    if (item.nappiCode && !/^\d{1,13}$/.test(item.nappiCode)) {
      issues.push({ line: lineNum, field: "nappiCode", severity: "warning", code: "INVALID_NAPPI", message: `Line ${lineNum}: NAPPI code should be up to 13 digits` });
    }
  }

  // ── Duplicate ICD-10 check ──
  const icd10Set = new Set(icd10Codes);
  if (icd10Set.size < icd10Codes.length) {
    issues.push({ field: "lineItems", severity: "warning", code: "DUPLICATE_ICD10", message: "Duplicate ICD-10 codes detected across line items", suggestion: "Some schemes flag duplicate diagnosis codes — ensure each line has a distinct clinical reason" });
  }

  // ── Authorization length check ──
  if (data.authorizationNumber && data.authorizationNumber.length > 50) {
    issues.push({ field: "authorizationNumber", severity: "error", code: "AUTH_NUMBER_TOO_LONG", message: "Authorization number must not exceed 50 characters", suggestion: "Verify the authorization number from the scheme approval" });
  }

  // ── Authorization check ──
  if (!data.authorizationNumber) {
    // Check if any line items typically require pre-auth
    const requiresAuth = (data.lineItems || []).some((item) => {
      const code = item.cptCode;
      // Specialist consults, procedures, hospital admissions typically need auth
      return code && (code.startsWith("01") && parseInt(code) >= 140 && parseInt(code) <= 149) || // specialist codes
        (code && parseInt(code) >= 400); // procedures
    });
    if (requiresAuth) {
      issues.push({ field: "authorizationNumber", severity: "warning", code: "POSSIBLE_AUTH_REQUIRED", message: "This claim may require pre-authorization", suggestion: "Rejection code 08 — specialist consultations and procedures often need pre-auth. Check with the scheme." });
    }
  }

  // ── Calculate risk score ──
  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const estimatedRejectionRisk: "low" | "medium" | "high" =
    errors > 0 ? "high" : warnings > 2 ? "medium" : "low";

  return {
    valid: errors === 0,
    issues,
    warnings,
    errors,
    pmbDetected,
    pmbConditions,
    estimatedRejectionRisk,
  };
}

/** Check for clinical mismatches between ICD-10 and CPT codes */
function checkClinicalMismatch(icd10: string, cpt: string): { message: string; suggestion: string } | null {
  // Respiratory procedure with non-respiratory diagnosis
  if (cpt === "0312" && !icd10.startsWith("J") && !icd10.startsWith("R06")) {
    return {
      message: `Spirometry (${cpt}) with non-respiratory diagnosis (${icd10})`,
      suggestion: "Spirometry is typically used for respiratory conditions (J-codes). Schemes may reject this combination.",
    };
  }
  // Nebulisation with UTI
  if ((cpt === "1136" || cpt === "1137") && icd10.startsWith("N39")) {
    return {
      message: `Nebulisation (${cpt}) with UTI diagnosis (${icd10}) — clinically inconsistent`,
      suggestion: "This combination will be rejected. Use appropriate respiratory ICD-10 code.",
    };
  }
  // ECG with non-cardiovascular diagnosis
  if (cpt === "0308" && !icd10.startsWith("I") && !icd10.startsWith("R00") && !icd10.startsWith("R01")) {
    return {
      message: `ECG (${cpt}) with non-cardiovascular diagnosis (${icd10})`,
      suggestion: "Consider adding a cardiovascular ICD-10 code (I-codes) to support the ECG procedure.",
    };
  }
  return null;
}
