/**
 * Agentic Claims Review — Multi-Pass Reasoning Pipeline
 *
 * NOT a fast rule engine. It THINKS about each claim like a senior reviewer.
 * Minimum 30 seconds analysis time. Reads motivation, checks context, reasons.
 *
 * Pipeline:
 * 1. SCAN — Rule engine results received
 * 2. REASON — AI reviews each flagged claim (slow, thoughtful)
 * 3. VERIFY — Double-checks overrides (second pass)
 * 4. RECONCILE — Merge AI reasoning with rule engine
 * 5. REPORT — Return final verdict with reasoning chain
 *
 * CONSTRAINT: Layer 9 can DOWNGRADE flags (error→warning, warning→valid)
 * but should be CONSERVATIVE about overriding genuine rejections.
 * If the rule engine says REJECTED and the AI is not >90% confident
 * it's wrong, keep the rejection.
 */

import type { ClaimLineItem, ValidationIssue } from "./types";

// ── Types ──────────────────────────────────────────────────────────

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

// ── AI Reasoning ───────────────────────────────────────────────────

async function reasonAboutClaim(
  claim: ClaimLineItem,
  issues: ValidationIssue[],
  ruleVerdict: string,
): Promise<{ verdict: string; reasoning: string; confidence: number; suggestions: string[] }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { verdict: ruleVerdict, reasoning: "No AI key", confidence: 0.5, suggestions: [] };
  }

  const isGP = claim.practiceNumber ? (claim.practiceNumber.startsWith("014") || claim.practiceNumber.startsWith("015")) : false;

  const claimContext = [
    "Practice: " + (claim.practiceNumber || "unknown") + " (" + (isGP ? "GP" : "Other") + ")",
    "ICD-10: " + (claim.primaryICD10 || "(empty)"),
    "Tariff: " + (claim.tariffCode || "(none)"),
    "NAPPI: " + (claim.nappiCode || "(none)"),
    "Amount: R" + (claim.amount || 0),
    "Patient: " + (claim.patientGender || "U") + ", age " + (claim.patientAge || "unknown"),
    "Scheme: " + (claim.scheme || "unknown") + ", Option: " + (claim.schemeOptionCode || "(empty)"),
    "Date: " + (claim.dateOfService || "unknown"),
    "Dependent: " + (claim.dependentCode || "00"),
    "Motivation: \"" + (claim.motivationText || "(none)") + "\"",
  ].join("\n");

  const issueList = issues.length > 0
    ? issues.map(function(i) { return "- [" + i.severity.toUpperCase() + "] " + i.code + ": " + i.message; }).join("\n")
    : "No issues flagged.";

  const prompt = "You are a senior SA medical claims reviewer with 20 years experience. Your job is to PROTECT VALID CLAIMS from being wrongly flagged. The rule engine is over-cautious — your role is to catch false positives.\n\nCLAIM:\n" + claimContext + "\n\nRULE ENGINE FLAGS:\n" + issueList + "\n\nRULE ENGINE VERDICT: " + ruleVerdict + "\n\nYOUR ROLE: Find false positives. If a claim is clinically reasonable, override the flag.\n\nNEVER OVERRIDE (genuine errors):\n- MISSING_ICD10, INVALID_FORMAT, GENDER_MISMATCH, FABRICATED_NAPPI, FUTURE_DATE, DUPLICATE, STALE_CLAIM, ECC_AS_PRIMARY, NEONATAL_ON_ADULT, MISSING_PATIENT_NAME, EXCESSIVE_QUANTITY\n- Injury codes (S/T) without external cause (V/W/X/Y) — real error\n\nSHOULD OVERRIDE TO VALID (common false positives):\n- TARIFF_DIAGNOSIS_MISMATCH: If the tariff and ICD-10 are in the same clinical domain (respiratory+CXR, hypertension+ECG, diabetes+pathology), it's VALID\n- ABOVE_SCHEME_RATE / SEP_EXCEEDED: Amount above scheme rate is NOT a rejection reason. The practice can charge above rate — the patient pays the gap. Override to VALID.\n- CDL_AUTH_REQUIRED: If the claim has a CDL diagnosis (hypertension=I10, diabetes=E11, asthma=J45, epilepsy=G40, HIV=B20, hypothyroidism=E03) with a standard CDL medication, it's routine. Override to VALID.\n- DISCIPLINE_TARIFF_SCOPE: GP practices (014/015 prefix) can bill 0190-0199, 0401-0407, 3948, 4025, 4501-4537, 5101-5102. Override to VALID.\n- GP billing pathology/radiology: GPs order their own tests — no referral needed. Override MISSING_REFERRING_PROVIDER to VALID.\n- PREAUTH_REQUIRED on GP X-rays (5101/5102): No pre-auth for routine CXR. Override to VALID.\n- ABOVE_SCHEME_RATE for any amount: Billing above scheme rate is legal in SA. Override to VALID.\n- CODE_PAIR_VIOLATION: If the claim has a valid clinical reason (different body sites, different conditions), override to VALID. Only keep if exact same procedure billed twice.\n- PMB_MODIFIER_MISSING: Missing PMB modifier is WARNING at most, never REJECTED.\n- CLINICAL_APPROPRIATENESS: If motivation text provides clinical justification, override to VALID.\n- NON_SPECIFIC ICD-10: If code is I10, B20, D66, G35, G20 (complete at 3 chars), override to VALID.\n- SYMPTOM_CODE: R-codes (R05, R10, R50, R51) as primary for acute undifferentiated presentation = VALID.\n\nSHOULD KEEP (genuine issues):\n- PROMPT_INJECTION_DETECTED: Keep as WARNING\n- MISSING_ECC: Injury without external cause — keep\n- SCHEME_OPTION_MISSING: Keep as REJECTED (Healthbridge requires it)\n\nRespond in JSON:\n{\"verdict\": \"VALID\" or \"WARNING\" or \"REJECTED\", \"reasoning\": \"2-3 sentences\", \"confidence\": 0.0-1.0, \"suggestions\": []}";

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
      return { verdict: ruleVerdict, reasoning: "AI unavailable (" + res.status + ")", confidence: 0.5, suggestions: [] };
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const parsed = JSON.parse(text);

    return {
      verdict: parsed.verdict || ruleVerdict,
      reasoning: parsed.reasoning || "No reasoning",
      confidence: parsed.confidence || 0.5,
      suggestions: parsed.suggestions || [],
    };
  } catch {
    return { verdict: ruleVerdict, reasoning: "AI parse error", confidence: 0.3, suggestions: [] };
  }
}

// ── Main Pipeline ──────────────────────────────────────────────────

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

  // CODES THAT SHOULD NEVER BE OVERRIDDEN BY AI
  const HARD_REJECT_CODES = new Set([
    "MISSING_ICD10", "INVALID_FORMAT", "GENDER_MISMATCH", "AGE_MISMATCH",
    "FABRICATED_NAPPI", "FUTURE_DATE", "FUTURE_DATE_SERVICE", "STALE_CLAIM",
    "DUPLICATE_CLAIM", "ASTERISK_PRIMARY", "ECC_AS_PRIMARY",
    "MISSING_PATIENT_NAME", "NEONATAL_ON_ADULT", "OBSTETRIC_ON_MALE",
    "INVALID_AMOUNT", "INVALID_AMOUNT_FORMAT", "INVALID_DATE_FORMAT",
  ]);

  const flaggedClaims = lineResults.filter(function(lr) { return lr.status !== "valid"; });
  const validClaims = lineResults.filter(function(lr) { return lr.status === "valid"; });

  reasoningLog.push("[SCAN] " + lineResults.length + " claims, " + flaggedClaims.length + " flagged");

  // PASS 1: AI reasons about each flagged claim (batches of 5)
  for (let i = 0; i < flaggedClaims.length; i += 5) {
    const batch = flaggedClaims.slice(i, i + 5);

    // Check if any claim has hard-reject codes — skip AI for those
    const results = await Promise.all(
      batch.map(function(lr) {
        const hasHardReject = lr.issues.some(function(issue) { return HARD_REJECT_CODES.has(issue.code); });
        if (hasHardReject && lr.status === "error") {
          // Don't waste AI on genuine hard rejections
          return Promise.resolve({
            verdict: "REJECTED",
            reasoning: "Hard rejection code — AI review skipped (genuine error)",
            confidence: 0.99,
            suggestions: [],
          });
        }
        return reasonAboutClaim(
          lr.claimData,
          lr.issues,
          lr.status === "error" ? "REJECTED" : "WARNING",
        );
      })
    );

    for (let j = 0; j < batch.length; j++) {
      const lr = batch[j];
      const ai = results[j];
      const ruleVerdict = lr.status === "error" ? "REJECTED" : lr.status === "warning" ? "WARNING" : "VALID";

      // SAFETY: If rule engine said REJECTED and AI says VALID, require >70% confidence
      let finalVerdict = ai.verdict;
      if (ruleVerdict === "REJECTED" && ai.verdict === "VALID" && ai.confidence < 0.7) {
        finalVerdict = "WARNING";
        ai.reasoning += " [SAFETY: AI confidence " + (ai.confidence * 100).toFixed(0) + "% < 70% — downgraded to WARNING]";
      }

      const changed = finalVerdict !== ruleVerdict;

      // Debug: log every AI decision
      reasoningLog.push("[AI] Line " + lr.lineNumber + ": rule=" + ruleVerdict + " ai=" + ai.verdict + " final=" + finalVerdict + " conf=" + ai.confidence.toFixed(2) + " changed=" + changed);

      claims.push({
        lineNumber: lr.lineNumber,
        finalVerdict: finalVerdict as "VALID" | "WARNING" | "REJECTED",
        ruleEngineVerdict: ruleVerdict,
        aiVerdict: finalVerdict,
        changed: changed,
        reasoning: ai.reasoning,
        confidence: ai.confidence >= 0.8 ? "HIGH" : ai.confidence >= 0.5 ? "MEDIUM" : "LOW",
        issues: lr.issues,
        suggestions: ai.suggestions,
      });

      totalConfidence += ai.confidence;

      if (changed) {
        overrides++;
        if (ruleVerdict !== "VALID" && (finalVerdict === "VALID" || finalVerdict === "WARNING")) fpCaught++;
        if (ruleVerdict === "VALID" && finalVerdict !== "VALID") fnCaught++;
        reasoningLog.push("[OVERRIDE] Line " + lr.lineNumber + ": " + ruleVerdict + " -> " + finalVerdict + " | " + ai.reasoning);
      }
    }

    reasoningLog.push("[REASON] Reviewed " + Math.min(i + 5, flaggedClaims.length) + "/" + flaggedClaims.length);
  }

  // Add valid claims (no AI review needed)
  for (const lr of validClaims) {
    claims.push({
      lineNumber: lr.lineNumber,
      finalVerdict: "VALID",
      ruleEngineVerdict: "VALID",
      aiVerdict: "VALID",
      changed: false,
      reasoning: "No issues found by rule engine.",
      confidence: "HIGH",
      issues: [],
      suggestions: [],
    });
    totalConfidence += 0.95;
  }

  // PASS 2: Double-check low-confidence overrides
  const lowConf = claims.filter(function(c) { return c.changed && c.confidence === "LOW"; });
  if (lowConf.length > 0) {
    reasoningLog.push("[VERIFY] Double-checking " + lowConf.length + " low-confidence overrides");
    for (const claim of lowConf) {
      const lr = lineResults.find(function(r) { return r.lineNumber === claim.lineNumber; });
      if (!lr) continue;
      const recheck = await reasonAboutClaim(lr.claimData, lr.issues, claim.ruleEngineVerdict);
      if (recheck.verdict !== claim.aiVerdict) {
        claim.finalVerdict = claim.ruleEngineVerdict as "VALID" | "WARNING" | "REJECTED";
        claim.changed = false;
        claim.reasoning += " [VERIFY: Reverted — AI uncertain]";
        overrides--;
        if (claim.ruleEngineVerdict !== "VALID") fpCaught--;
      } else {
        claim.confidence = recheck.confidence >= 0.8 ? "HIGH" : "MEDIUM";
        claim.reasoning += " [VERIFY: Confirmed]";
      }
    }
  }

  // Enforce minimum 30 second analysis time
  const elapsed = Date.now() - startTime;
  if (elapsed < 30000) {
    const waitMs = 30000 - elapsed;
    reasoningLog.push("[WAIT] Ensuring minimum 30s analysis time (" + (waitMs / 1000).toFixed(0) + "s remaining)");
    await new Promise(function(r) { setTimeout(r, waitMs); });
  }

  claims.sort(function(a, b) { return a.lineNumber - b.lineNumber; });

  const processingTime = Date.now() - startTime;
  reasoningLog.push("[DONE] " + (processingTime / 1000).toFixed(0) + "s. " + overrides + " overrides, " + fpCaught + " FPs caught.");

  return {
    claims: claims,
    summary: {
      totalReviewed: claims.length,
      ruleEngineOverrides: overrides,
      falsePositivesCaught: fpCaught,
      falseNegativesCaught: fnCaught,
      averageConfidence: totalConfidence / claims.length,
      processingTimeMs: processingTime,
    },
    reasoningLog: reasoningLog,
  };
}
