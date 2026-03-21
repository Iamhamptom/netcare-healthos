import { NextRequest, NextResponse } from "next/server";
import { parseCSV, autoMapColumns, extractClaimLines, validateClaims } from "@/lib/claims/validation-engine";
import { generateAutoCorrections, applyAutoCorrections } from "@/lib/claims/auto-correct";
import { requireClaimsAuth, validateFileSize } from "@/lib/claims/auth-guard";
import type { ColumnMapping } from "@/lib/claims/types";

// POST — Upload CSV, validate, auto-correct, and return corrected CSV
export async function POST(req: NextRequest) {
  const auth = await requireClaimsAuth(req, "autocorrect", { limit: 15 });
  if (!auth.authorized) return auth.response!;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const applyMedium = formData.get("applyMedium") === "true";

    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const sizeErr = validateFileSize(file);
    if (sizeErr) return NextResponse.json({ error: sizeErr }, { status: 400 });

    const csvText = await file.text();
    const parsed = parseCSV(csvText);
    if (parsed.rows.length === 0) {
      return NextResponse.json({ error: "No valid data rows found" }, { status: 400 });
    }

    const mapping = autoMapColumns(parsed.headers);
    if (!mapping.primaryICD10) {
      return NextResponse.json({ error: "Could not identify ICD-10 column" }, { status: 400 });
    }

    // Validate
    const claimLines = extractClaimLines(parsed.rows, mapping);
    const result = validateClaims(claimLines);

    // Generate corrections
    const corrections = generateAutoCorrections(claimLines, result.issues);

    // Apply high-confidence corrections (optionally medium too)
    const { correctedLines, applied } = applyAutoCorrections(claimLines, corrections, applyMedium);

    // Re-validate corrected lines
    const correctedResult = validateClaims(correctedLines);

    // Build corrected CSV
    const headers = [...parsed.headers];
    if (!headers.includes("validation_status")) headers.push("validation_status");
    if (!headers.includes("auto_corrected")) headers.push("auto_corrected");
    if (!headers.includes("issues")) headers.push("issues");

    const csvLines = [headers.join(",")];
    for (let i = 0; i < parsed.rows.length; i++) {
      const row = parsed.rows[i];
      const lineNum = i + 1;
      const lr = correctedResult.lineResults.find(r => r.lineNumber === lineNum);
      const appliedForLine = applied.filter(c => c.lineNumber === lineNum);

      // Apply corrections to original row
      for (const correction of appliedForLine) {
        if (correction.field === "primaryICD10" && mapping.primaryICD10) {
          row[mapping.primaryICD10] = correction.correctedValue;
        }
      }

      const csvEscape = (v: string) => {
        const s = (v || "").replace(/[\r\n]+/g, " ").replace(/"/g, '""');
        return s.includes(",") || s.includes('"') || s.includes(";") ? `"${s}"` : s;
      };

      const values = parsed.headers.map(h => csvEscape(row[h] || ""));
      values.push(lr?.status || "unknown");
      values.push(appliedForLine.length > 0 ? "yes" : "no");
      values.push(csvEscape(lr?.issues.filter(i => i.severity !== "info").map(i => i.rule).join("; ") || ""));

      csvLines.push(values.join(","));
    }

    // Sanitize each line: strip any control chars that would break JSON encoding
    const csvString = csvLines
      .map(line => line.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F]/g, ""))
      .join("\n");

    return NextResponse.json({
      corrections,
      applied,
      summary: {
        totalCorrections: corrections.length,
        highConfidence: corrections.filter(c => c.confidence === "high").length,
        mediumConfidence: corrections.filter(c => c.confidence === "medium").length,
        applied: applied.length,
        beforeRejectionRate: result.summary.estimatedRejectionRate,
        afterRejectionRate: correctedResult.summary.estimatedRejectionRate,
        improvement: result.summary.estimatedRejectionRate - correctedResult.summary.estimatedRejectionRate,
      },
      correctedCSV: csvString,
      beforeResult: result.summary,
      afterResult: correctedResult.summary,
    });
  } catch (error) {
    console.error("Auto-correct error:", error);
    return NextResponse.json({ error: "Auto-correction failed" }, { status: 500 });
  }
}
