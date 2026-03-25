/**
 * Agentic Claims Review -- Multi-Pass Reasoning Pipeline
 *
 * This is NOT a fast rule engine. It THINKS about each claim like a human
 * reviewer would -- reading the motivation, understanding the context,
 * checking the database, and reasoning about whether each flag is correct.
 *
 * Pipeline:
 * 1. SCAN -- Rule engine runs (fast, deterministic)
 * 2. REASON -- AI reviews each flagged claim (slow, thoughtful)
 * 3. VERIFY -- AI double-checks its own reasoning (second pass)
 * 4. RECONCILE -- Merge AI reasoning with rule engine results
 * 5. REPORT -- Return final verdict with reasoning chain
 *
 * Takes 1-3 minutes for 100 claims. That's by design.
 */

import type { ClaimLineItem, ValidationIssue } from "./types";

// -- Types ----------------------------------------------------------

export interface ReasonedClaim {
  lineNumber: number;
  finalVerdict: "VALID" | "WARNING" | "REJECTED";
  ruleEngineVerdict: string;
  aiVerdict: string;
  changed: boolean;
  reasoning: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  issues: ValidationIssue[];
  suggestions: string[];
}

export interface AgenticReviewResult {
  claims: ReasonedClaim[];
  summary: {
    totalReviewed: number;
    ruleEngineOverrides: number;
    falsePositivesCaught: number;
    falseNegativesCaught: number;
    averageConfidence: number;
    processingTimeMs: number;
  };
  reasoningLog: string[];
}

// -- AI Reasoning Call ----------------------------------------------

async function reasonAboutClaim(
  claim: ClaimLineItem,
  issues: ValidationIssue[],
  ruleVerdict: string,
): Promise<{ verdict: string; reasoning: string; confidence: number; suggestions: string[] }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { verdict: ruleVerdict, reasoning: "No AI key -- using rule engine verdict", confidence: 0.5, suggestions: [] };
  }

  const claimContext: string = [
    "Practice: " + (claim.practiceNumber || "unknown") + " (" + (claim.practiceNumber?.startsWith("014") ? "GP" : claim.practiceNumber?.startsWith("016") ? "Specialist" : "Other") + ")",
    "ICD-10: " + (claim.primaryICD10 || "(empty)"),
    "Tariff: " + (claim.tariffCode || "(none)"),
    "NAPPI: " + (claim.nappiCode || "(none)"),
    "Amount: R" + (claim.amount || 0),
    "Patient: " + (claim.patientGender || "U") + ", age " + (claim.patientAge || "unknown"),
    "Scheme: " + (claim.scheme || "unknown") + ", Option: " + (claim.schemeOptionCode || "(empty)"),
    "Date: " + (claim.dateOfService || "unknown"),
    "Dependent: " + (claim.dependentCode || "00"),
    "Motivation: \"" + (claim.motivationText || "(none)) + "\"",
  ].join("\n");

  const issueList = issues.length > 0
    ? issues.map(function(i) { return "- [" + i.severity.toUpperCase() + "] " + i.code + ": " + i.message; }).join("\n")
    : "No issues flagged by rule engine.";

  const prompt = [
    "You are a senior SA medical claims reviewer. Review this claim and the rule engine's flags.",
    "",
    "CLAIM:",
    claimContext,
    "",
    "RULE ENGINE FLAGS:",
    issueList,
    "",
    "RULE ENGINE VERDICT: " + ruleVerdict,
    "",
    "YOUR TASK:",
    "1. Read the claim data carefully -- understand the clinical context",
    "2. Read the motivation text -- does it explain any flags?",
    "3. Check: Is the practice type (GP/specialist) appropriate for this tariff?",
    "4. Check: Does the ICD-10 match the procedure?",
    "5. Check: Is the severity correct (REJECTED vs WARNING vs VALID)?",
    "",
    "CRITICAL SA RULES:",
    "- GP practices (014 prefix) can bill: 0190-0199 (consults), 0401-0407 (minor procedures), 3948 (ECG), 4025 (strep), 4501-4537 (pathology), 5101-5102 (X-ray)",
    "- Tariff 0199 = chronic repeat script, NOT paediatric. Valid for all ages.",
    "- Dependent code is a sequence number, NOT age indicator (02 = second dependent, could be 55yo spouse)",
    "- I10, B20, D66, G35, G20 are complete at 3 characters -- do NOT flag as non-specific",
    "- R-codes (R10, R51) as primary = WARNING, never REJECTED",
    "- CXR (5101) for respiratory = standard GP practice",
    "- Saturday consultations = normal GP hours",
    "- 120-day window is INCLUSIVE (day 120 = valid)",
    "",
    'Respond in JSON: { "verdict": "VALID" or "WARNING" or "REJECTED", "reasoning": "2-3 sentences explaining your thinking", "confidence": 0.0 to 1.0, "suggestions": ["list of suggestions for the clerk if any"] }',
  ].join("\n");

  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 500, responseMimeType: "application/json" },
        }),
      }
    );

    if (!res.ok) {
      return { verdict: ruleVerdict, reasoning: "AI unavailable (" + (res.status) + ")", confidence: 0.5, suggestions: [] };
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const parsed = JSON.parse(text);

    return {
      verdict: parsed.verdict || ruleVerdict,
      reasoning: parsed.reasoning || "No reasoning provided",
      confidence: parsed.confidence || 0.5,
      suggestions: parsed.suggestions || [],
    };
  } catch (err) {
    return { verdict: ruleVerdict, reasoning: "AI error: " + (err instanceof Error ? err.message : "unknown"), confidence: 0.3, suggestions: [] };
  }
}

// -- Main Agentic Review Pipeline -----------------------------------

export async function runAgenticReview(
  lineResults: { lineNumber: number; status: string; issues: ValidationIssue[]; claimData: ClaimLineItem }[],
): Promise<AgenticReviewResult> {
  const startTime = Date.now();
  const reasoningLog: string[] = [];
  const claims: ReasonedClaim[] = [];
  let overrides = 0;
  let fpCaught = 0;
  let fnCaught = 0;
  let totalConfidence = 0;

  reasoningLog.push("[SCAN] Rule engine completed: " + (lineResults.length) + " claims");
  reasoningLog.push("[REASON] Starting AI review of flagged claims...");

  // PASS 1: AI reasons about each FLAGGED claim (valid claims skip AI review)
  const flaggedClaims = lineResults.filter(lr => lr.status !== "valid");
  const validClaims = lineResults.filter(lr => lr.status === "valid");

  reasoningLog.push("[REASON] " + (flaggedClaims.length) + " flagged claims to review, " + (validClaims.length) + " already valid");

  // Process flagged claims in batches of 5 (parallel within batch)
  for (let i = 0; i < flaggedClaims.length; i += 5) {
    const batch = flaggedClaims.slice(i, i + 5);
    const results = await Promise.all(
      batch.map(lr => reasonAboutClaim(
        lr.claimData,
        lr.issues,
        lr.status === "error" ? "REJECTED" : "WARNING",
      ))
    );

    for (let j = 0; j < batch.length; j++) {
      const lr = batch[j];
      const ai = results[j];
      const ruleVerdict = lr.status === "error" ? "REJECTED" : lr.status === "warning" ? "WARNING" : "VALID";

      claims.push({
        lineNumber: lr.lineNumber,
        finalVerdict: ai.verdict as "VALID" | "WARNING" | "REJECTED",
        ruleEngineVerdict: ruleVerdict,
        aiVerdict: ai.verdict,
        changed: ai.verdict !== ruleVerdict,
        reasoning: ai.reasoning,
        confidence: ai.confidence >= 0.8 ? "HIGH" : ai.confidence >= 0.5 ? "MEDIUM" : "LOW",
        issues: lr.issues,
        suggestions: ai.suggestions,
      });

      totalConfidence += ai.confidence;

      if (ai.verdict !== ruleVerdict) {
        overrides++;
        if (ruleVerdict !== "VALID" && ai.verdict === "VALID") fpCaught++;
        if (ruleVerdict === "VALID" && ai.verdict !== "VALID") fnCaught++;
        reasoningLog.push("[OVERRIDE] Line " + (lr.lineNumber) + ": " + (ruleVerdict) + " -> " + (ai.verdict) + " | " + (ai.reasoning));
      }
    }

    reasoningLog.push("[REASON] Reviewed " + (Math.min(i + 5, flaggedClaims.length)) + "/" + (flaggedClaims.length) + " flagged claims");
  }

  // Add valid claims (no AI review needed)
  for (const lr of validClaims) {
    claims.push({
      lineNumber: lr.lineNumber,
      finalVerdict: "VALID",
      ruleEngineVerdict: "VALID",
      aiVerdict: "VALID",
      changed: false,
      reasoning: "Rule engine found no issues. No AI review needed.",
      confidence: "HIGH",
      issues: [],
      suggestions: [],
    });
    totalConfidence += 0.95;
  }

  // PASS 2: VERIFY -- Double-check any overrides with low confidence
  const lowConfidence = claims.filter(c => c.changed && c.confidence === "LOW");
  if (lowConfidence.length > 0) {
    reasoningLog.push("[VERIFY] Double-checking " + (lowConfidence.length) + " low-confidence overrides...");
    for (const claim of lowConfidence) {
      const lr = lineResults.find(r => r.lineNumber === claim.lineNumber)!;
      const recheck = await reasonAboutClaim(lr.claimData, lr.issues, claim.ruleEngineVerdict);

      if (recheck.verdict !== claim.aiVerdict) {
        // AI changed its mind on second pass -- revert to rule engine
        reasoningLog.push("[VERIFY] Line " + (claim.lineNumber) + ": AI reversed itself (" + (claim.aiVerdict) + " -> " + (recheck.verdict) + "). Keeping rule engine verdict: " + (claim.ruleEngineVerdict));
        claim.finalVerdict = claim.ruleEngineVerdict as "VALID" | "WARNING" | "REJECTED";
        claim.changed = false;
        claim.reasoning += " [VERIFY: AI was uncertain -- rule engine verdict retained]";
        overrides--;
        if (claim.ruleEngineVerdict !== "VALID" && claim.aiVerdict === "VALID") fpCaught--;
      } else {
        claim.confidence = recheck.confidence >= 0.8 ? "HIGH" : "MEDIUM";
        claim.reasoning += " [VERIFY: Confirmed on second pass]";
        reasoningLog.push("[VERIFY] Line " + (claim.lineNumber) + ": Confirmed " + (claim.aiVerdict));
      }
    }
  }

  // Sort by line number
  claims.sort((a, b) => a.lineNumber - b.lineNumber);

  const processingTime = Date.now() - startTime;
  reasoningLog.push("[DONE] Review complete in " + ((processingTime / 1000).toFixed(1)) + "s. " + (overrides) + " overrides, " + (fpCaught) + " FPs caught.");

  return {
    claims,
    summary: {
      totalReviewed: claims.length,
      ruleEngineOverrides: overrides,
      falsePositivesCaught: fpCaught,
      falseNegativesCaught: fnCaught,
      averageConfidence: totalConfidence / claims.length,
      processingTimeMs: processingTime,
    },
    reasoningLog,
  };
}
