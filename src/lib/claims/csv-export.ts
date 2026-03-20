import type { ValidationResult } from "./types";

/**
 * Generate a corrected CSV from validation results.
 * Preserves all original columns and appends validation metadata columns.
 */
export function generateCorrectedCSV(
  result: ValidationResult,
  originalHeaders: string[]
): string {
  const outputHeaders = [
    ...originalHeaders,
    "validation_status",
    "issues",
    "suggestions",
    "corrected_icd10",
  ];

  const rows: string[][] = [];

  for (const lineResult of result.lineResults) {
    // Rebuild the original row values from claimData in header order.
    // The caller is responsible for ensuring originalHeaders align with claimData fields.
    const originalValues = originalHeaders.map((header) => {
      const claim = lineResult.claimData;
      const key = header.trim().toLowerCase();

      // Try to map common header names back to claimData fields
      if (key === "line" || key === "linenumber" || key === "line_number")
        return String(claim.lineNumber);
      if (key === "patient_name" || key === "patientname" || key === "patient")
        return claim.patientName ?? "";
      if (
        key === "patient_gender" ||
        key === "patientgender" ||
        key === "gender"
      )
        return claim.patientGender ?? "";
      if (key === "patient_age" || key === "patientage" || key === "age")
        return claim.patientAge != null ? String(claim.patientAge) : "";
      if (
        key === "icd10" ||
        key === "icd10_code" ||
        key === "primary_icd10" ||
        key === "primaryicd10" ||
        key === "icd10_1" ||
        key === "diagnosis"
      )
        return claim.primaryICD10;
      if (
        key === "secondary_icd10" ||
        key === "secondaryicd10" ||
        key === "icd10_2"
      )
        return claim.secondaryICD10?.join(";") ?? "";
      if (key === "tariff" || key === "tariff_code" || key === "tariffcode")
        return claim.tariffCode ?? "";
      if (key === "nappi" || key === "nappi_code" || key === "nappicode")
        return claim.nappiCode ?? "";
      if (key === "quantity" || key === "qty")
        return claim.quantity != null ? String(claim.quantity) : "";
      if (key === "amount" || key === "charge")
        return claim.amount != null ? String(claim.amount) : "";
      if (key === "modifier")
        return claim.modifier ?? "";
      if (
        key === "practitioner_type" ||
        key === "provider_type" ||
        key === "discipline"
      )
        return claim.practitionerType ?? "";
      if (
        key === "date_of_service" ||
        key === "dateofservice" ||
        key === "service_date" ||
        key === "claim_date"
      )
        return claim.dateOfService ?? "";

      return "";
    });

    // Validation status
    const status = lineResult.status;

    // Collect issue messages and suggestions
    const issueMessages = lineResult.issues.map((i) => i.message).join("; ");
    const suggestionMessages = lineResult.issues
      .filter((i) => i.suggestion)
      .map((i) => i.suggestion!)
      .join("; ");

    // Find auto-fixable ICD10 corrections (non-specific code suggestions)
    const icd10Corrections = lineResult.issues
      .filter(
        (i) =>
          i.field === "primaryICD10" &&
          i.suggestion &&
          /[A-Z]\d{2}(\.\d{1,4})?/.test(extractCode(i.suggestion))
      )
      .map((i) => extractCode(i.suggestion!))
      .filter(Boolean);

    const correctedIcd10 =
      icd10Corrections.length > 0 ? icd10Corrections[0] : "";

    rows.push([
      ...originalValues,
      status,
      issueMessages,
      suggestionMessages,
      correctedIcd10,
    ]);
  }

  // Build CSV string
  const lines: string[] = [];
  lines.push(outputHeaders.map(escapeCSVField).join(","));
  for (const row of rows) {
    lines.push(row.map(escapeCSVField).join(","));
  }

  return lines.join("\n");
}

/** Escape a CSV field — wrap in quotes if it contains commas, quotes, or newlines. */
function escapeCSVField(value: string): string {
  if (
    value.includes(",") ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes(";")
  ) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

/** Extract an ICD-10 code pattern from a suggestion string. */
function extractCode(suggestion: string): string {
  const match = suggestion.match(/[A-Z]\d{2}(?:\.\d{1,4})?/);
  return match ? match[0] : "";
}
