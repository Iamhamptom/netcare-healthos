import { NextRequest, NextResponse } from "next/server";
import { parseCSV, autoMapColumns, extractClaimLines, validateClaims, suggestICD10Column } from "@/lib/claims/validation-engine";
import { requireClaimsAuth, validateFileSize } from "@/lib/claims/auth-guard";
import { isHealthbridgeFormat, parseHealthbridgeClaims } from "@/lib/claims/healthbridge-parser";
import { runAdvancedValidation } from "@/lib/claims/advanced-rules";
import { validateSchemeRules } from "@/lib/claims/scheme-rules";
import { detectAnomalies } from "@/lib/claims/statistical-anomaly";
import type { ClaimLineItem, ColumnMapping } from "@/lib/claims/types";

// ─── Blind Test Scoring Endpoint ──────────────────────────────────────
// Upload claims CSV + outcomes CSV → get exact match rate with breakdown

function mergeIssues(result: ReturnType<typeof validateClaims>, newIssues: any[]) {
  for (const issue of newIssues) {
    result.issues.push(issue);
    const lr = result.lineResults.find(r => r.lineNumber === issue.lineNumber);
    if (lr) {
      lr.issues.push(issue);
      const prevStatus = lr.status;
      if (issue.severity === "error" && prevStatus !== "error") {
        lr.status = "error";
        result.invalidClaims++;
        if (prevStatus === "valid") result.validClaims--;
        else if (prevStatus === "warning") result.warningClaims--;
      } else if (issue.severity === "warning" && prevStatus === "valid") {
        lr.status = "warning";
        result.warningClaims++;
        result.validClaims--;
      }
    }
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireClaimsAuth(req, "score", { limit: 10, windowMs: 60_000 });
  if (!auth.authorized) return auth.response!;

  try {
    const formData = await req.formData();
    const claimsFile = formData.get("claims") as File | null;
    const outcomesFile = formData.get("outcomes") as File | null;

    if (!claimsFile || !outcomesFile) {
      return NextResponse.json({ error: "Both 'claims' and 'outcomes' files are required" }, { status: 400 });
    }

    // Parse claims
    const claimsText = await claimsFile.text();
    const parsed = parseCSV(claimsText);
    if (parsed.rows.length === 0) {
      return NextResponse.json({ error: "No data rows in claims file" }, { status: 400 });
    }

    // Detect format and map columns
    let claimLines: ClaimLineItem[];
    if (isHealthbridgeFormat(parsed.headers)) {
      claimLines = parseHealthbridgeClaims(parsed.rows);
    } else {
      const mapping = autoMapColumns(parsed.headers, parsed.rows);
      if (!mapping.primaryICD10) {
        const suggestion = suggestICD10Column(parsed.headers, parsed.rows);
        if (suggestion && suggestion.confidence >= 0.4) mapping.primaryICD10 = suggestion.header;
        else return NextResponse.json({ error: "Could not identify ICD-10 column" }, { status: 400 });
      }
      claimLines = extractClaimLines(parsed.rows, mapping);
    }

    // Run full validation pipeline
    const result = validateClaims(claimLines);

    // Advanced rules
    mergeIssues(result, runAdvancedValidation(claimLines));

    // Statistical anomalies
    detectAnomalies(claimLines);

    // Parse outcomes
    const outcomesText = await outcomesFile.text();
    const outcomesParsed = parseCSV(outcomesText);
    const expected: Record<number, { result: string; reason: string; code: string }> = {};
    for (const row of outcomesParsed.rows) {
      const ln = parseInt(row.line_number || row.lineNumber || "0", 10);
      if (ln > 0) {
        expected[ln] = {
          result: (row.expected_result || "").trim().toUpperCase(),
          reason: (row.rejection_reason || "").trim(),
          code: (row.rejection_code || "").trim(),
        };
      }
    }

    // Compare
    let match = 0;
    let falsePositive = 0;
    let falseNegative = 0;
    const fpDetails: any[] = [];
    const fnDetails: any[] = [];
    const matchDetails: any[] = [];

    for (const ln of Object.keys(expected).map(Number).sort((a, b) => a - b)) {
      const exp = expected[ln];
      const lr = result.lineResults.find(r => r.lineNumber === ln);
      const ourStatus = lr
        ? lr.status === "valid" ? "VALID" : lr.status === "error" ? "REJECTED" : "WARNING"
        : "UNKNOWN";

      // Normalize for comparison: WARNING counts as VALID unless expected is WARNING
      const ourCmp = ourStatus === "WARNING" ? "VALID" : ourStatus;
      const expCmp = exp.result === "WARNING" ? "VALID" : exp.result;

      if (ourCmp === expCmp) {
        match++;
        matchDetails.push({ line: ln, expected: exp.result, ours: ourStatus });
      } else if (ourCmp === "REJECTED" && expCmp === "VALID") {
        falsePositive++;
        const issues = lr?.issues.filter(i => i.severity === "error" || i.severity === "warning").map(i => i.rule) || [];
        fpDetails.push({ line: ln, expected: exp.result, ours: ourStatus, ourReason: issues.join(", ") });
      } else if (ourCmp === "VALID" && expCmp === "REJECTED") {
        falseNegative++;
        fnDetails.push({ line: ln, expected: exp.result, expectedCode: exp.code, expectedReason: exp.reason, ours: ourStatus });
      } else {
        // Other mismatch
        if (ourCmp === "REJECTED") falsePositive++;
        else falseNegative++;
        fnDetails.push({ line: ln, expected: exp.result, expectedCode: exp.code, ours: ourStatus });
      }
    }

    const total = match + falsePositive + falseNegative;
    const score = total > 0 ? Math.round((match / total) * 1000) / 10 : 0;

    // Group false negatives by expected code
    const fnByCode: Record<string, number> = {};
    for (const fn of fnDetails) {
      const code = fn.expectedCode || fn.expectedReason || "UNKNOWN";
      fnByCode[code] = (fnByCode[code] || 0) + 1;
    }

    // Group false positives by our reason
    const fpByReason: Record<string, number> = {};
    for (const fp of fpDetails) {
      const reason = fp.ourReason || "UNKNOWN";
      fpByReason[reason] = (fpByReason[reason] || 0) + 1;
    }

    return NextResponse.json({
      score: `${score}%`,
      match,
      total,
      falsePositives: falsePositive,
      falseNegatives: falseNegative,
      ourResults: {
        totalClaims: result.totalClaims,
        valid: result.validClaims,
        rejected: result.invalidClaims,
        warnings: result.warningClaims,
      },
      expectedResults: {
        valid: Object.values(expected).filter(e => e.result === "VALID").length,
        rejected: Object.values(expected).filter(e => e.result === "REJECTED").length,
        warning: Object.values(expected).filter(e => e.result === "WARNING").length,
      },
      falseNegativesByCode: fnByCode,
      falsePositivesByReason: fpByReason,
      details: {
        falsePositives: fpDetails.slice(0, 20),
        falseNegatives: fnDetails.slice(0, 20),
      },
    });
  } catch (err) {
    console.error("[score] Error:", err);
    return NextResponse.json({ error: "Scoring failed: " + (err as Error).message }, { status: 500 });
  }
}
