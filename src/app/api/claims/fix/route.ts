import { NextRequest, NextResponse } from "next/server";
import { parseCSV, autoMapColumns, extractClaimLines, validateClaims, suggestICD10Column } from "@/lib/claims/validation-engine";
import { requireClaimsAuth, validateFileSize } from "@/lib/claims/auth-guard";
import { isHealthbridgeFormat, parseHealthbridgeClaims } from "@/lib/claims/healthbridge-parser";
import { generateAutoCorrections, applyAutoCorrections } from "@/lib/claims/auto-correct";
import type { ColumnMapping } from "@/lib/claims/types";

// ─── Fix & Return Clean CSV ──────────────────────────────────────
// Takes an uploaded CSV, validates it, applies all auto-corrections,
// and returns the cleaned CSV as a downloadable file + a diff summary.

export async function POST(req: NextRequest) {
  const auth = await requireClaimsAuth(req, "fix", { limit: 20, windowMs: 60_000 });
  if (!auth.authorized) return auth.response!;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const applyMedium = formData.get("applyMedium") === "true";
    const schemeCode = (formData.get("scheme") as string) || "";

    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    const sizeErr = validateFileSize(file);
    if (sizeErr) return NextResponse.json({ error: sizeErr }, { status: 400 });

    const text = await file.text();
    const parsed = parseCSV(text);
    if (parsed.rows.length === 0) {
      return NextResponse.json({ error: "No data rows found" }, { status: 400 });
    }

    // Detect format and map columns
    let mapping: ColumnMapping;
    if (isHealthbridgeFormat(parsed.headers)) {
      // For Healthbridge, use standard mapping
      mapping = { primaryICD10: "ICD10_1" } as ColumnMapping;
    } else {
      mapping = autoMapColumns(parsed.headers, parsed.rows);
      if (!mapping.primaryICD10) {
        const suggestion = suggestICD10Column(parsed.headers, parsed.rows);
        if (suggestion && suggestion.confidence >= 0.5) {
          mapping.primaryICD10 = suggestion.header;
        } else {
          return NextResponse.json({
            error: "Could not identify ICD-10 column. Please fix the column headers first.",
            availableHeaders: parsed.headers,
          }, { status: 400 });
        }
      }
    }

    const claimLines = extractClaimLines(parsed.rows, mapping);

    // Run validation
    const result = validateClaims(claimLines);

    // Generate and apply corrections
    const corrections = generateAutoCorrections(claimLines, result.issues);
    const { correctedLines, applied } = applyAutoCorrections(claimLines, corrections, applyMedium);

    // Build the corrected CSV
    // Use original headers + rebuild rows with corrections applied
    const reverseMapping: Record<string, string> = {};
    for (const [field, header] of Object.entries(mapping)) {
      if (typeof header === "string") reverseMapping[field] = header;
    }

    // ─── STEP 1: Build correction lookup by line number ───
    const correctionsByLine = new Map<number, typeof correctedLines[0]>();
    for (const cl of correctedLines) {
      correctionsByLine.set(cl.lineNumber, cl);
    }

    // Lines removed (duplicates)
    const removedLines = new Set(
      applied.filter(c => c.field === "removeLine").map(c => c.lineNumber)
    );

    // ─── STEP 2: Re-validate ALL original lines (not just corrected) ───
    // This ensures every row gets a proper system_result
    const allClaimLines = extractClaimLines(parsed.rows, mapping);

    // Apply corrections to the full set
    for (const cl of allClaimLines) {
      const corrected = correctionsByLine.get(cl.lineNumber);
      if (corrected) {
        cl.primaryICD10 = corrected.primaryICD10;
        if (corrected.secondaryICD10) cl.secondaryICD10 = corrected.secondaryICD10;
        if (corrected.dependentCode) cl.dependentCode = corrected.dependentCode;
      }
    }

    // Validate all lines (not just the ones that survived duplicate removal)
    const fullRevalidation = validateClaims(allClaimLines);

    // Build result lookup by line number
    const resultByLine = new Map<number, { status: string; reason: string; code: string }>();
    for (const lr of fullRevalidation.lineResults) {
      const errorIssues = (lr.issues || []).filter((i: { severity: string }) => i.severity === "error");
      const warningIssues = (lr.issues || []).filter((i: { severity: string }) => i.severity === "warning");
      let status = "VALID";
      let reason = "";
      let errCode = "";
      if (errorIssues.length > 0) {
        status = "REJECTED";
        reason = errorIssues.map((i: { message: string }) => i.message).join(" | ");
        errCode = errorIssues.map((i: { code: string }) => i.code).join(",");
      } else if (warningIssues.length > 0) {
        status = "WARNING";
        reason = warningIssues.map((i: { message: string }) => i.message).join(" | ");
        errCode = warningIssues.map((i: { code: string }) => i.code).join(",");
      }
      resultByLine.set(lr.lineNumber, { status, reason, code: errCode });
    }

    // ─── STEP 3: Build output CSV ───
    const RESULT_COL = "system_result";
    const REASON_COL = "system_reason";
    const CODE_COL = "system_code";
    const outputHeaders = [...parsed.headers];
    if (!parsed.headers.includes(RESULT_COL)) outputHeaders.push(RESULT_COL);
    if (!parsed.headers.includes(REASON_COL)) outputHeaders.push(REASON_COL);
    if (!parsed.headers.includes(CODE_COL)) outputHeaders.push(CODE_COL);

    const fixedRows: Record<string, string>[] = [];
    for (let idx = 0; idx < parsed.rows.length; idx++) {
      const lineNum = idx + 1; // 1-based

      // Skip removed duplicates
      if (removedLines.has(lineNum)) continue;

      const originalRow = parsed.rows[idx];
      const newRow = { ...originalRow };

      // Apply corrections
      const corrected = correctionsByLine.get(lineNum);
      if (corrected) {
        if (reverseMapping.primaryICD10 && corrected.primaryICD10) {
          newRow[reverseMapping.primaryICD10] = corrected.primaryICD10;
        }
        if (reverseMapping.secondaryICD10 && corrected.secondaryICD10?.length) {
          newRow[reverseMapping.secondaryICD10] = corrected.secondaryICD10.join(";");
        }
        if (reverseMapping.dependentCode && corrected.dependentCode) {
          newRow[reverseMapping.dependentCode] = corrected.dependentCode;
        }
      }

      // Write validation result
      const result = resultByLine.get(lineNum);
      newRow[RESULT_COL] = result?.status ?? "VALID";
      newRow[REASON_COL] = result?.reason ?? "";
      newRow[CODE_COL] = result?.code ?? "";

      fixedRows.push(newRow);
    }

    // Detect original delimiter
    const firstLine = text.replace(/^\uFEFF/, "").split(/\r?\n/)[0] || "";
    const delimiter = firstLine.includes("\t") ? "\t"
      : firstLine.split(";").length > firstLine.split(",").length ? ";"
      : ",";

    // Rebuild CSV with output headers (includes system columns)
    const csvHeader = outputHeaders.join(delimiter);
    const csvBody = fixedRows.map(row =>
      outputHeaders.map(h => {
        const val = row[h] || "";
        return val.includes(delimiter) || val.includes('"') || val.includes("\n")
          ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(delimiter)
    ).join("\n");
    const fixedCSV = csvHeader + "\n" + csvBody + "\n";

    // Build diff summary
    const changesByType: Record<string, number> = {};
    for (const c of applied) {
      changesByType[c.rule] = (changesByType[c.rule] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      fixedCSV,
      originalFileName: file.name,
      suggestedFileName: file.name.replace(/\.(csv|tsv|txt)$/i, "_FIXED.$1"),
      stats: {
        before: {
          valid: result.validClaims,
          errors: result.invalidClaims,
          warnings: result.warningClaims,
          rejectionRate: result.summary.estimatedRejectionRate,
        },
        after: {
          valid: fullRevalidation.validClaims,
          errors: fullRevalidation.invalidClaims,
          warnings: fullRevalidation.warningClaims,
          rejectionRate: fullRevalidation.summary.estimatedRejectionRate,
        },
        totalCorrections: applied.length,
        correctionsAvailable: corrections.length,
        changesByType,
        improvement: {
          claimsFixed: fullRevalidation.validClaims - result.validClaims,
          rejectionRateDrop: result.summary.estimatedRejectionRate - fullRevalidation.summary.estimatedRejectionRate,
          estimatedSavingsRecovered: result.summary.estimatedSavings - fullRevalidation.summary.estimatedSavings,
        },
      },
      corrections: applied.map(c => ({
        line: c.lineNumber,
        field: c.field,
        from: c.originalValue,
        to: c.correctedValue,
        rule: c.rule,
        confidence: c.confidence,
        reason: c.reason,
      })),
      // Also include remaining issues that couldn't be auto-fixed
      remainingIssues: fullRevalidation.batchInsights || [],
    });
  } catch (err) {
    console.error("[fix] Error:", err);
    return NextResponse.json({ error: "Failed to fix file: " + (err as Error).message }, { status: 500 });
  }
}
