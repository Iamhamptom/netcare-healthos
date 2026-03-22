import { NextRequest, NextResponse } from "next/server";
import { parseCSV, autoMapColumns, extractClaimLines, validateClaims, suggestICD10Column } from "@/lib/claims/validation-engine";
import { validateSchemeRules, SCHEME_LIST } from "@/lib/claims/scheme-rules";
import { lookupTariff, findUnbundlingViolations, isDisciplineAllowed, isTariffValidForDiagnosis, checkMaxUnits, type Discipline } from "@/lib/claims/tariff-database";
import { requireClaimsAuth, validateFileSize } from "@/lib/claims/auth-guard";
import { isHealthbridgeFormat, parseHealthbridgeClaims } from "@/lib/claims/healthbridge-parser";
import { generateAutoCorrections } from "@/lib/claims/auto-correct";
import { runAdvancedValidation } from "@/lib/claims/advanced-rules";
import type { ColumnMapping, ValidationIssue, ClaimLineItem } from "@/lib/claims/types";

// Max rows to prevent O(n²) timeout
const MAX_CLAIMS = 10_000;

// ── Tariff validation ──
function validateTariffs(lines: ClaimLineItem[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const line of lines) {
    if (!line.tariffCode) continue;
    const ln = line.lineNumber;
    const tariff = lookupTariff(line.tariffCode);

    if (!tariff) {
      issues.push({
        lineNumber: ln, field: "tariffCode", code: "UNKNOWN_TARIFF",
        severity: "warning", rule: "Unknown Tariff Code",
        message: `Tariff code "${line.tariffCode}" was not found in the NHRPL reference database.`,
        suggestion: "Verify the tariff code is correct and currently active.",
      });
      continue;
    }

    if (line.primaryICD10 && !isTariffValidForDiagnosis(line.tariffCode, line.primaryICD10)) {
      issues.push({
        lineNumber: ln, field: "tariffCode", code: "TARIFF_DIAGNOSIS_MISMATCH",
        severity: "warning", rule: "Diagnosis-Procedure Mismatch",
        message: `Tariff "${line.tariffCode}" (${tariff.description}) may not be appropriate for diagnosis "${line.primaryICD10}".`,
        suggestion: "Verify that the procedure is clinically appropriate for this diagnosis.",
      });
    }

    if (line.practitionerType && !isDisciplineAllowed(line.tariffCode, line.practitionerType as Discipline)) {
      issues.push({
        lineNumber: ln, field: "tariffCode", code: "DISCIPLINE_MISMATCH",
        severity: "error", rule: "Practitioner Discipline Mismatch",
        message: `Tariff "${line.tariffCode}" (${tariff.description}) cannot be billed by a "${line.practitionerType}" practitioner. Allowed: ${tariff.discipline.join(", ")}.`,
        suggestion: "Only practitioners in the correct discipline can bill this code.",
      });
    }

    if (line.quantity) {
      const unitCheck = checkMaxUnits(line.tariffCode, line.quantity);
      if (unitCheck.exceeded) {
        issues.push({
          lineNumber: ln, field: "quantity", code: "EXCESS_UNITS",
          severity: "warning", rule: "Excessive Units",
          message: `Tariff "${line.tariffCode}" billed ${line.quantity} units but max per day is ${unitCheck.maxAllowed}.`,
          suggestion: "Verify the quantity is correct. Split across multiple days if appropriate.",
        });
      }
    }

    if (tariff.requiresPreAuth) {
      issues.push({
        lineNumber: ln, field: "tariffCode", code: "PREAUTH_REQUIRED",
        severity: "info", rule: "Pre-Authorisation Required",
        message: `Tariff "${line.tariffCode}" (${tariff.description}) typically requires pre-authorisation.`,
        suggestion: "Ensure pre-authorisation was obtained before submission.",
      });
    }
  }

  // Cross-line unbundling (use Set for O(1) lookups)
  const allTariffCodes = [...new Set(lines.map(l => l.tariffCode).filter(Boolean) as string[])];
  if (allTariffCodes.length > 1) {
    const violations = findUnbundlingViolations(allTariffCodes);
    for (const v of violations) {
      const affectedLine = lines.find(l => l.tariffCode === v.code1 || l.tariffCode === v.code2);
      issues.push({
        lineNumber: affectedLine?.lineNumber || 0, field: "tariffCode", code: "UNBUNDLING",
        severity: "error", rule: "Unbundling Violation",
        message: `Tariff codes "${v.code1}" and "${v.code2}" should not be billed together: ${v.reason}`,
        suggestion: "Use the bundled/comprehensive code instead of billing components separately.",
      });
    }
  }

  return issues;
}

// ── Helper: merge issues into result ──
function mergeIssues(result: ReturnType<typeof validateClaims>, newIssues: ValidationIssue[]) {
  for (const issue of newIssues) {
    result.issues.push(issue);
    const lr = result.lineResults.find(r => r.lineNumber === issue.lineNumber);
    if (lr) {
      lr.issues.push(issue);
      if (issue.severity === "error" && lr.status !== "error") {
        if (lr.status === "valid") result.validClaims--;
        else if (lr.status === "warning") result.warningClaims--;
        lr.status = "error";
        result.invalidClaims++;
      } else if (issue.severity === "warning" && lr.status === "valid") {
        result.validClaims--;
        lr.status = "warning";
        result.warningClaims++;
      }
    }
  }
}

export async function POST(req: NextRequest) {
  // Auth + rate limit
  const auth = await requireClaimsAuth(req, "validate", { limit: 30, windowMs: 60_000 });
  if (!auth.authorized) return auth.response!;

  try {
    const contentType = req.headers.get("content-type") || "";
    let csvText: string;
    let customMapping: ColumnMapping | undefined;
    let schemeCode = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const mappingStr = formData.get("mapping") as string | null;
      schemeCode = (formData.get("scheme") as string) || "";

      if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

      // File size check
      const sizeErr = validateFileSize(file);
      if (sizeErr) return NextResponse.json({ error: sizeErr }, { status: 400 });

      csvText = await file.text();
      if (mappingStr) {
        try { customMapping = JSON.parse(mappingStr); } catch { /* use auto */ }
      }
    } else {
      const body = await req.json();
      csvText = body.csv;
      customMapping = body.mapping;
      schemeCode = body.scheme || "";
      if (!csvText) return NextResponse.json({ error: "No CSV data provided" }, { status: 400 });
    }

    // Parse CSV
    const parsed = parseCSV(csvText);
    if (parsed.rows.length === 0) {
      return NextResponse.json({ error: "No valid data rows found", parseErrors: parsed.errors }, { status: 400 });
    }
    if (parsed.rows.length > MAX_CLAIMS) {
      return NextResponse.json({ error: `Too many rows (${parsed.rows.length}). Maximum is ${MAX_CLAIMS.toLocaleString()} claims per upload.` }, { status: 400 });
    }

    // Auto-detect Healthbridge format or use standard mapping
    let claimLines: ClaimLineItem[];
    let detectedFormat = "standard";

    if (isHealthbridgeFormat(parsed.headers)) {
      claimLines = parseHealthbridgeClaims(parsed.rows);
      detectedFormat = "healthbridge";
      // Auto-detect scheme from Healthbridge data
      if (!schemeCode) {
        const firstScheme = parsed.rows[0]?.SCHEME_CODE || parsed.rows[0]?.scheme_code;
        if (firstScheme) schemeCode = firstScheme;
      }
    } else {
      const mapping = customMapping || autoMapColumns(parsed.headers);
      if (!mapping.primaryICD10) {
        // Smart detection: scan actual cell values to find the ICD-10 column
        const suggestion = suggestICD10Column(parsed.headers, parsed.rows);
        if (suggestion && suggestion.confidence >= 0.5) {
          mapping.primaryICD10 = suggestion.header;
        } else {
          const headerList = parsed.headers.map(h => `"${h}"`).join(", ");
          const sampleRow = parsed.rows[0] || {};
          const sampleValues = parsed.headers.slice(0, 6).map(h => `${h}: ${sampleRow[h] || "(empty)"}`);
          return NextResponse.json({
            error: "We couldn't automatically detect which column contains ICD-10 codes.",
            availableHeaders: parsed.headers,
            sampleData: sampleValues,
            suggestion: suggestion
              ? `Column "${suggestion.header}" looks like it might contain ICD-10 codes (${Math.round(suggestion.confidence * 100)}% match) but confidence is too low to auto-map.`
              : null,
            fix: [
              `Your CSV has these columns: ${headerList}`,
              "To fix this, rename your ICD-10 column header to one of: icd10, diagnosis, icd10_code, dx_code",
              "Or use Healthbridge export format (columns: CLAIM_ID, ICD10_1, TARIFF_CODE, AMOUNT)",
              "Tip: Only the ICD-10 column is required — all other columns are optional.",
            ],
          }, { status: 400 });
        }
      }
      claimLines = extractClaimLines(parsed.rows, mapping);
    }

    // Core validation
    const result = validateClaims(claimLines);

    // Tariff validation
    mergeIssues(result, validateTariffs(claimLines));

    // Advanced rules (modifiers, place-of-service, clinical appropriateness)
    mergeIssues(result, runAdvancedValidation(claimLines));

    // Scheme-specific rules
    if (schemeCode) {
      // For large datasets, pre-index by patient+date to avoid O(n²)
      const patientDateIndex = new Map<string, ClaimLineItem[]>();
      for (const line of claimLines) {
        const key = `${(line.patientName || "").toLowerCase()}|${line.dateOfService || ""}`;
        if (!patientDateIndex.has(key)) patientDateIndex.set(key, []);
        patientDateIndex.get(key)!.push(line);
      }

      // Pass only relevant lines (same patient) for cross-line checks — O(n) total instead of O(n²)
      for (const lineResult of result.lineResults) {
        const cd = lineResult.claimData;
        const key = `${(cd.patientName || "").toLowerCase()}|${cd.dateOfService || ""}`;
        const relevantLines = patientDateIndex.get(key) || [];
        const schemeIssues = validateSchemeRules(cd, schemeCode, relevantLines);
        mergeIssues(result, schemeIssues);
      }
    }

    // Recalculate summary
    result.summary.errorCount = result.issues.filter(i => i.severity === "error").length;
    result.summary.warningCount = result.issues.filter(i => i.severity === "warning").length;
    result.summary.infoCount = result.issues.filter(i => i.severity === "info").length;
    result.summary.estimatedRejectionRate = result.totalClaims > 0
      ? Math.round((result.invalidClaims / result.totalClaims) * 100) : 0;

    const avgClaimValue = claimLines.reduce((sum, l) => sum + (l.amount || 800), 0) / (claimLines.length || 1);
    result.summary.estimatedSavings = Math.round(result.invalidClaims * avgClaimValue * 0.85);

    const byRule: Record<string, number> = {};
    for (const issue of result.issues) byRule[issue.rule] = (byRule[issue.rule] || 0) + 1;
    result.summary.byRule = byRule;
    result.summary.topIssues = Object.entries(byRule)
      .map(([rule, count]) => ({ rule, count, severity: result.issues.find(i => i.rule === rule)?.severity || "info" }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Auto-corrections for deterministic fixes
    const autoCorrections = generateAutoCorrections(claimLines, result.issues);

    // Reinforcement learning — record validation event
    try {
      const { recordHealthEvent } = await import("@/lib/ml/system-hooks");
      recordHealthEvent("claims_analyzer", "validation_complete", {
        totalClaims: result.totalClaims,
        validClaims: result.validClaims,
        invalidClaims: result.invalidClaims,
        scheme: schemeCode,
        issues: result.issues.slice(0, 20).map(i => ({ code: i.code, severity: i.severity })),
        rejectionRate: result.summary.estimatedRejectionRate,
      });
    } catch { /* Non-blocking */ }

    return NextResponse.json({
      ...result,
      detectedFormat,
      autoCorrections,
      parseErrors: parsed.errors,
      columnMapping: detectedFormat === "healthbridge" ? { primaryICD10: "ICD10_1", autoDetected: true } : autoMapColumns(parsed.headers),
      headers: parsed.headers,
      schemeCode,
      schemeList: SCHEME_LIST,
    });
  } catch (error) {
    console.error("Claims validation error:", error);
    return NextResponse.json({ error: "Failed to process claims file" }, { status: 500 });
  }
}
