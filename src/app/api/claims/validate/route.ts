import { NextRequest, NextResponse } from "next/server";
import { parseCSV, autoMapColumns, extractClaimLines, validateClaims, suggestICD10Column, validateAdvancedClinical } from "@/lib/claims/validation-engine";
import { validateSchemeRules, SCHEME_LIST } from "@/lib/claims/scheme-rules";
import { lookupTariff, findUnbundlingViolations, isDisciplineAllowed, isTariffValidForDiagnosis, checkMaxUnits, type Discipline } from "@/lib/claims/tariff-database";
import { requireClaimsAuth, validateFileSize } from "@/lib/claims/auth-guard";
import { isHealthbridgeFormat, parseHealthbridgeClaims } from "@/lib/claims/healthbridge-parser";
import { generateAutoCorrections } from "@/lib/claims/auto-correct";
import { runAdvancedValidation } from "@/lib/claims/advanced-rules";
import { detectAnomalies } from "@/lib/claims/statistical-anomaly";
import { detectGeographicFraud } from "@/lib/claims/geographic-fraud";
import { validateForSwitchboard, SWITCHBOARD_LIST } from "@/lib/claims/switchboard-rules";
import { checkCodePairViolations } from "@/lib/claims/code-pairs";
import { compareToSchemeRate } from "@/lib/claims/scheme-tariff-rates";
import { findNearestFacility, calculateDistance, lookupFacilityByPracticeNumber } from "@/lib/claims/facility-database";
import { getBehaviorStore } from "@/lib/claims/historical-behavior";
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
      // Only flag as info — our tariff database is GEMS-only (4,660 codes),
      // not the full SA NHRPL. Valid pathology/radiology codes won't be in it.
      // Don't generate false positives for codes we simply don't have.
      issues.push({
        lineNumber: ln, field: "tariffCode", code: "UNKNOWN_TARIFF",
        severity: "info", rule: "Tariff Not in Reference Database",
        message: `Tariff code "${line.tariffCode}" was not found in our reference database. It may still be valid.`,
      });
      continue;
    }

    // Tariff-diagnosis mismatch: downgraded to info for GP claims (GPs treat everything)
    // Only keep as warning for specialist claims where discipline match matters
    if (line.primaryICD10 && !isTariffValidForDiagnosis(line.tariffCode, line.primaryICD10)) {
      const isGPLine = line.practiceNumber && (line.practiceNumber.startsWith("014") || line.practiceNumber.startsWith("015"));
      issues.push({
        lineNumber: ln, field: "tariffCode", code: "TARIFF_DIAGNOSIS_MISMATCH",
        severity: isGPLine ? "info" : "warning", rule: "Diagnosis-Procedure Mismatch",
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

  // Cross-line unbundling — only check SAME patient + SAME date
  const byPatientDate = new Map<string, ClaimLineItem[]>();
  for (const line of lines) {
    if (!line.tariffCode) continue;
    const key = `${(line.patientName || "").toLowerCase()}|${line.dateOfService || ""}`;
    if (!byPatientDate.has(key)) byPatientDate.set(key, []);
    byPatientDate.get(key)!.push(line);
  }
  for (const [, group] of byPatientDate) {
    if (group.length < 2) continue;
    const tariffs = [...new Set(group.map(l => l.tariffCode).filter(Boolean) as string[])];
    if (tariffs.length < 2) continue;
    const violations = findUnbundlingViolations(tariffs);
    for (const v of violations) {
      const affectedLine = group.find(l => l.tariffCode === v.code1 || l.tariffCode === v.code2);
      issues.push({
        lineNumber: affectedLine?.lineNumber || 0, field: "tariffCode", code: "UNBUNDLING",
        severity: "error", rule: "Unbundling Violation",
        message: `Tariff codes "${v.code1}" and "${v.code2}" should not be billed together by the same provider on the same day: ${v.reason}`,
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
    let switchboardCode = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const mappingStr = formData.get("mapping") as string | null;
      schemeCode = (formData.get("scheme") as string) || "";
      switchboardCode = (formData.get("switchboard") as string) || "";

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
      const mapping = customMapping || autoMapColumns(parsed.headers, parsed.rows);
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

    // Advanced clinical validation (Gaps 15-19: formulary, pharmacist, uncertainty, consult distribution)
    mergeIssues(result, validateAdvancedClinical(claimLines));

    // Switchboard-specific rules (Healthbridge, MediSwitch, SwitchOn)
    if (switchboardCode) {
      const switchIssues = validateForSwitchboard(claimLines, switchboardCode);
      mergeIssues(result, switchIssues);
    }

    // ── AI Motivation Classification (Phase 2 — bounded LLM) ──
    // Find claims with clinical red flags that have motivation text
    const needsAIReview = result.issues
      .filter(i => i.code === "CLINICAL_NEEDS_AI_REVIEW")
      .map(i => {
        const ext = i as typeof i & { _motivationText?: string; _procedure?: string; _diagnosis?: string };
        return {
          lineNumber: i.lineNumber,
          procedure: ext._procedure || "",
          diagnosis: ext._diagnosis || "",
          motivationText: ext._motivationText || "",
          rule: "Imaging for non-specific back pain",
        };
      })
      .filter(item => item.motivationText);

    if (needsAIReview.length > 0) {
      try {
        const { classifyAllMotivations } = await import("@/lib/claims/motivation-classifier");
        const decisions = await classifyAllMotivations(needsAIReview);

        // Update issues based on AI decisions
        for (const [lineNum, decision] of decisions) {
          // Remove the "needs review" info issue
          const idx = result.issues.findIndex(i => i.lineNumber === lineNum && i.code === "CLINICAL_NEEDS_AI_REVIEW");
          if (idx !== -1) result.issues.splice(idx, 1);

          // Find the line result
          const lr = result.lineResults.find(r => r.lineNumber === lineNum);

          if (decision.override) {
            // AI approved the motivation — mark as valid with note
            result.issues.push({
              lineNumber: lineNum, field: "motivationText", code: "MOTIVATION_APPROVED",
              severity: "info", rule: "Clinical Motivation Approved",
              message: `AI approved: "${decision.reason}". The clinical justification is sufficient for this procedure.`,
            });
          } else {
            // AI rejected the motivation — keep as warning
            result.issues.push({
              lineNumber: lineNum, field: "motivationText", code: "WEAK_MOTIVATION",
              severity: "warning", rule: "Weak Clinical Motivation",
              message: `AI review: "${decision.reason}". The provided justification may not satisfy scheme requirements for this procedure.`,
              suggestion: "Strengthen the clinical motivation with specific findings, trauma mechanism, or failed conservative treatment.",
            });
            if (lr && lr.status === "valid") {
              lr.status = "warning";
              lr.issues.push({
                lineNumber: lineNum, field: "motivationText", code: "WEAK_MOTIVATION",
                severity: "warning", rule: "Weak Clinical Motivation",
                message: `AI review: "${decision.reason}"`,
              });
            }
          }
        }
      } catch (err) {
        console.warn("[validate] Motivation classification failed:", (err as Error).message);
        // Non-blocking — claims stay as-is if AI fails
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

    // ─── SELF-DIAGNOSIS: Detect column mapping errors ──────────────
    // If 80%+ claims hit the SAME error, the problem is likely a bad column
    // mapping, not bad data. Re-check and auto-fix if possible.
    let selfDiagnosis: { detected: boolean; problem: string; action: string; remapped?: boolean } | null = null;

    if (result.summary.estimatedRejectionRate >= 80 && result.summary.topIssues.length > 0) {
      const topRule = result.summary.topIssues[0];
      const topPct = Math.round((topRule.count / result.totalClaims) * 100);

      if (topPct >= 80 && topRule.rule === "Invalid Code Format") {
        // The mapped ICD-10 column likely contains non-ICD-10 data
        // Try to find the REAL ICD-10 column by scanning all columns
        const currentICD10Col = (customMapping || autoMapColumns(parsed.headers, parsed.rows)).primaryICD10;
        const suggestion = suggestICD10Column(parsed.headers, parsed.rows);

        if (suggestion && suggestion.header !== currentICD10Col && suggestion.confidence >= 0.4) {
          // Found a better column — re-run validation with the correct mapping
          const fixedMapping = { ...(customMapping || autoMapColumns(parsed.headers, parsed.rows)), primaryICD10: suggestion.header };
          const fixedClaimLines = extractClaimLines(parsed.rows, fixedMapping);
          const fixedResult = validateClaims(fixedClaimLines);

          // If the fixed result is significantly better, use it
          if (fixedResult.validClaims > result.validClaims) {
            selfDiagnosis = {
              detected: true,
              problem: `The system initially mapped column "${currentICD10Col}" as ICD-10 codes, but that column contains non-medical data (like claim IDs). The real ICD-10 codes are in column "${suggestion.header}".`,
              action: `Auto-corrected: remapped ICD-10 from "${currentICD10Col}" to "${suggestion.header}" — results below are from the corrected analysis.`,
              remapped: true,
            };

            // Replace everything with the fixed results
            Object.assign(result, fixedResult);
            claimLines.length = 0;
            claimLines.push(...fixedClaimLines);

            // Re-run tariff + advanced + scheme validation
            mergeIssues(result, validateTariffs(fixedClaimLines));
            mergeIssues(result, runAdvancedValidation(fixedClaimLines));
            if (schemeCode) {
              const pdi = new Map<string, ClaimLineItem[]>();
              for (const line of fixedClaimLines) {
                const key = `${(line.patientName || "").toLowerCase()}|${line.dateOfService || ""}`;
                if (!pdi.has(key)) pdi.set(key, []);
                pdi.get(key)!.push(line);
              }
              for (const lr of result.lineResults) {
                const key = `${(lr.claimData.patientName || "").toLowerCase()}|${lr.claimData.dateOfService || ""}`;
                mergeIssues(result, validateSchemeRules(lr.claimData, schemeCode, pdi.get(key) || []));
              }
            }

            // Recalculate summary
            result.summary.errorCount = result.issues.filter(i => i.severity === "error").length;
            result.summary.warningCount = result.issues.filter(i => i.severity === "warning").length;
            result.summary.estimatedRejectionRate = result.totalClaims > 0
              ? Math.round((result.invalidClaims / result.totalClaims) * 100) : 0;
            const avg2 = fixedClaimLines.reduce((s, l) => s + (l.amount || 800), 0) / (fixedClaimLines.length || 1);
            result.summary.estimatedSavings = Math.round(result.invalidClaims * avg2 * 0.85);
            const byRule2: Record<string, number> = {};
            for (const issue of result.issues) byRule2[issue.rule] = (byRule2[issue.rule] || 0) + 1;
            result.summary.byRule = byRule2;
            result.summary.topIssues = Object.entries(byRule2)
              .map(([rule, count]) => ({ rule, count, severity: result.issues.find(i => i.rule === rule)?.severity || "info" }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 10);
          }
        }

        if (!selfDiagnosis) {
          // Couldn't auto-fix, but still explain what happened
          selfDiagnosis = {
            detected: true,
            problem: `${topPct}% of claims (${topRule.count}/${result.totalClaims}) failed with "${topRule.rule}". This usually means the wrong column was mapped as ICD-10 codes. The values in the mapped column don't look like medical diagnosis codes.`,
            action: "Check your CSV headers — the ICD-10 column should be named 'icd10_code', 'diagnosis', or 'icd10'. If the codes are in a differently-named column, rename the header and re-upload.",
          };
        }
      } else if (topPct >= 80) {
        // Different systematic error — explain clearly
        selfDiagnosis = {
          detected: true,
          problem: `${topPct}% of claims (${topRule.count}/${result.totalClaims}) failed the same check: "${topRule.rule}". This is a systematic issue with your file, not individual claim errors.`,
          action: "See the batch analysis below for a detailed explanation and fix instructions.",
        };
      }
    }

    // ── Layer 2: Statistical Anomaly Detection ──
    // Analyzes the entire batch for patterns no single-claim rule can catch
    const { anomalies: statisticalAnomalies, batchProfile } = detectAnomalies(claimLines);

    // ── Layer 3: Geographic Fraud Detection ──
    // Detects geographic impossibility patterns (provider/patient location fraud)
    const geoFraudAlerts = detectGeographicFraud(claimLines);

    // ── Layer 4: Code-Pair Violations (104 rules) ──
    for (const line of claimLines) {
      const codes = [line.primaryICD10, ...(line.secondaryICD10 || [])];
      if (line.tariffCode) codes.push(line.tariffCode);
      const violations = checkCodePairViolations(codes);
      for (const v of violations) {
        const existing = result.issues.find(i => i.lineNumber === line.lineNumber && i.code === "CODE_PAIR_VIOLATION" && i.message.includes(v.code1));
        if (!existing) {
          result.issues.push({
            lineNumber: line.lineNumber, field: "primaryICD10", code: "CODE_PAIR_VIOLATION",
            severity: (v.type === "never_together" || v.type === "mutually_exclusive")
              && !(line.practiceNumber?.startsWith("014") || line.practiceNumber?.startsWith("015"))
              ? "error" : "warning",
            rule: "Code-Pair Violation",
            message: `${v.code1} + ${v.code2}: ${v.reason} (${v.source})`,
            suggestion: v.type === "needs_modifier" ? "Add the appropriate modifier to allow this combination." : "Review the code combination — these should not appear together.",
          });
          // Update line result status
          const lr = result.lineResults.find(r => r.lineNumber === line.lineNumber);
          if (lr) {
            lr.issues.push(result.issues[result.issues.length - 1]);
            const isGPLine = line.practiceNumber?.startsWith("014") || line.practiceNumber?.startsWith("015");
            if ((v.type === "never_together" || v.type === "mutually_exclusive") && !isGPLine && lr.status !== "error") {
              if (lr.status === "valid") result.validClaims--;
              else if (lr.status === "warning") result.warningClaims--;
              lr.status = "error";
              result.invalidClaims++;
            }
          }
        }
      }
    }

    // ── Layer 5: Scheme Tariff Rate Comparison ──
    for (const line of claimLines) {
      if (line.amount && line.tariffCode && line.scheme) {
        const comparison = compareToSchemeRate(line.scheme, line.tariffCode, line.amount);
        if (comparison.status === "significantly_above" && comparison.schemeRate) {
          result.issues.push({
            lineNumber: line.lineNumber, field: "amount", code: "ABOVE_SCHEME_RATE",
            severity: "info", rule: "Amount Exceeds Scheme Rate",
            message: `R${line.amount.toFixed(2)} is ${comparison.ratio?.toFixed(1)}x the ${line.scheme} rate (R${comparison.schemeRate.toFixed(2)}) for tariff ${line.tariffCode}. Patient may face a shortfall.`,
            suggestion: "Inform the patient of the potential out-of-pocket amount before submission.",
          });
          const lr = result.lineResults.find(r => r.lineNumber === line.lineNumber);
          if (lr) {
            lr.issues.push(result.issues[result.issues.length - 1]);
            if (lr.status === "valid") { lr.status = "warning"; result.validClaims--; result.warningClaims++; }
          }
        }
      }
    }

    // ── Layer 6: Facility Database Validation ──
    for (const line of claimLines) {
      if (line.practiceNumber) {
        const facility = lookupFacilityByPracticeNumber(line.practiceNumber);
        if (facility && facility.latitude && facility.longitude) {
          // Enrich line result with facility info (useful for geo fraud)
          const lr = result.lineResults.find(r => r.lineNumber === line.lineNumber);
          if (lr) {
            (lr as any).facilityName = facility.name;
            (lr as any).facilityProvince = facility.province;
          }
        }
      }
    }

    // ── Layer 7: Historical Behavior Tracking ──
    // Record this batch for future pattern detection
    const behaviorStore = getBehaviorStore();
    behaviorStore.recordBatch(claimLines, result);
    const providerAnomalies = behaviorStore.detectProviderAnomalies();
    const rejectionSpikes = behaviorStore.detectRejectionSpikes();

    // ── Layer 8a: Doctor Reasoning (clinical domain knowledge) ──
    const { runDoctorReasoning } = await import("@/lib/claims/doctor-reasoning");
    const doctorResult = runDoctorReasoning(result.lineResults, result);

    // ── Layer 8b: Deterministic Reasoning Pass (GP tariff scope safety net) ──
    const { runReasoningPass } = await import("@/lib/claims/reasoning-pass");
    const reasoningResult = runReasoningPass(result.lineResults, result);

    // ── Layer 9: AI SDK Agent Review (tools + multi-step reasoning) ──
    // Each flagged claim gets reviewed by a ToolLoopAgent with 7 tools:
    // ICD-10 lookup, NAPPI lookup, tariff lookup, clinical pattern check,
    // scheme validation, injection detection, knowledge base search.
    let agenticReview: Awaited<ReturnType<typeof import("@/lib/agents/batch-orchestrator").reviewBatchWithAgent>> | null = null;
    try {
      const { reviewBatchWithAgent } = await import("@/lib/agents/batch-orchestrator");
      agenticReview = await reviewBatchWithAgent(result.lineResults);

      // Apply agent verdicts back to the result
      for (const reviewed of agenticReview.reviews) {
        const lr = result.lineResults.find(r => r.lineNumber === reviewed.lineNumber);
        if (!lr) continue;

        const ruleVerdict = lr.status === "error" ? "REJECTED" : lr.status === "warning" ? "WARNING" : "VALID";
        if (reviewed.verdict === ruleVerdict) continue; // No change

        const oldStatus = lr.status;
        const newStatus = reviewed.verdict === "REJECTED" ? "error"
          : reviewed.verdict === "WARNING" ? "warning" : "valid";

        if (oldStatus !== newStatus) {
          if (oldStatus === "error") result.invalidClaims--;
          else if (oldStatus === "warning") result.warningClaims--;
          else result.validClaims--;

          if (newStatus === "error") result.invalidClaims++;
          else if (newStatus === "warning") result.warningClaims++;
          else result.validClaims++;

          lr.status = newStatus;
        }
      }
    } catch (agentErr) {
      console.warn("[Agentic Review] Failed — rule engine results stand:", agentErr instanceof Error ? agentErr.message : "unknown");
    }

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
      selfDiagnosis,
      doctorReasoning: doctorResult.totalOverrides > 0 ? doctorResult : undefined,
      reasoningPass: reasoningResult.totalCorrected > 0 ? reasoningResult : undefined,
      agenticReview: agenticReview ? {
        summary: agenticReview.summary,
        overrides: agenticReview.reviews.filter(r => {
          const lr = result.lineResults.find(l => l.lineNumber === r.lineNumber);
          const ruleVerdict = lr?.status === "error" ? "REJECTED" : lr?.status === "warning" ? "WARNING" : "VALID";
          return r.verdict !== ruleVerdict;
        }).map(r => ({
          line: r.lineNumber,
          to: r.verdict,
          reasoning: r.reasoning,
          confidence: r.confidence,
          toolsUsed: r.toolsUsed,
          steps: r.stepsUsed,
        })),
      } : undefined,
      statisticalAnomalies,
      geoFraudAlerts,
      providerAnomalies: providerAnomalies.length > 0 ? providerAnomalies : undefined,
      rejectionSpikes: rejectionSpikes.length > 0 ? rejectionSpikes : undefined,
      batchProfile: {
        totalClaims: batchProfile.totalClaims,
        uniquePatients: batchProfile.uniquePatients,
        uniquePractices: batchProfile.uniquePractices,
        uniqueDiagnoses: batchProfile.uniqueDiagnoses,
        totalValue: batchProfile.totalValue,
        avgClaimValue: Math.round(batchProfile.avgClaimValue),
        claimsPerPatient: Math.round(batchProfile.claimsPerPatient * 10) / 10,
        dateSpanDays: batchProfile.dateRange.spanDays,
      },
      parseErrors: parsed.errors,
      columnMapping: detectedFormat === "healthbridge" ? { primaryICD10: "ICD10_1", autoDetected: true } : autoMapColumns(parsed.headers, parsed.rows),
      headers: parsed.headers,
      schemeCode,
      schemeList: SCHEME_LIST,
      switchboardCode,
      switchboardList: SWITCHBOARD_LIST,
    });
  } catch (error) {
    console.error("Claims validation error:", error);
    return NextResponse.json({ error: "Failed to process claims file" }, { status: 500 });
  }
}
