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

    // Re-validate corrected lines to show improvement
    const revalidated = validateClaims(correctedLines);

    // Build the corrected CSV
    // Use original headers + rebuild rows with corrections applied
    const reverseMapping: Record<string, string> = {};
    for (const [field, header] of Object.entries(mapping)) {
      if (typeof header === "string") reverseMapping[field] = header;
    }

    // Build a set of removed line numbers (duplicates)
    const removedLines = new Set(
      applied.filter(c => c.field === "removeLine").map(c => c.lineNumber)
    );

    const fixedRows = parsed.rows
      .filter((_, idx) => !removedLines.has(idx + 1)) // lineNumbers are 1-based
      .map((originalRow) => {
        // Find the corrected line by matching original row data
        const lineNum = parsed.rows.indexOf(originalRow) + 1;
        const correctedLine = correctedLines.find(cl => cl.lineNumber === lineNum);
        if (!correctedLine) return originalRow;

        const newRow = { ...originalRow };
        if (reverseMapping.primaryICD10 && correctedLine.primaryICD10) {
          newRow[reverseMapping.primaryICD10] = correctedLine.primaryICD10;
        }
        if (reverseMapping.secondaryICD10 && correctedLine.secondaryICD10?.length) {
          newRow[reverseMapping.secondaryICD10] = correctedLine.secondaryICD10.join(";");
        }
        if (reverseMapping.dependentCode && correctedLine.dependentCode) {
          newRow[reverseMapping.dependentCode] = correctedLine.dependentCode;
        }
        return newRow;
      });

    // Detect original delimiter
    const firstLine = text.replace(/^\uFEFF/, "").split(/\r?\n/)[0] || "";
    const delimiter = firstLine.includes("\t") ? "\t"
      : firstLine.split(";").length > firstLine.split(",").length ? ";"
      : ",";

    // Rebuild CSV with original delimiter
    const csvHeader = parsed.headers.join(delimiter);
    const csvBody = fixedRows.map(row =>
      parsed.headers.map(h => {
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
          valid: revalidated.validClaims,
          errors: revalidated.invalidClaims,
          warnings: revalidated.warningClaims,
          rejectionRate: revalidated.summary.estimatedRejectionRate,
        },
        totalCorrections: applied.length,
        correctionsAvailable: corrections.length,
        changesByType,
        improvement: {
          claimsFixed: revalidated.validClaims - result.validClaims,
          rejectionRateDrop: result.summary.estimatedRejectionRate - revalidated.summary.estimatedRejectionRate,
          estimatedSavingsRecovered: result.summary.estimatedSavings - revalidated.summary.estimatedSavings,
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
      remainingIssues: revalidated.batchInsights || [],
    });
  } catch (err) {
    console.error("[fix] Error:", err);
    return NextResponse.json({ error: "Failed to fix file: " + (err as Error).message }, { status: 500 });
  }
}
