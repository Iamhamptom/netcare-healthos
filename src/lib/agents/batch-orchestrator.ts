/**
 * Batch Orchestrator — Reviews flagged claims using the Claims Reviewer Agent
 *
 * Replaces the raw Gemini fetch in agentic-review.ts with proper AI SDK agents.
 * Each flagged claim gets reviewed by the claims reviewer agent which has
 * tools to look up real data.
 */

import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { claimsReviewerAgent } from "./claims-reviewer";
import type { ClaimLineItem, ValidationIssue } from "@/lib/claims/types";

export interface AgentReviewResult {
  lineNumber: number;
  verdict: "VALID" | "WARNING" | "REJECTED";
  reasoning: string;
  flags: string[];
  confidence: number;
  toolsUsed: string[];
  stepsUsed: number;
}

// Codes that should NEVER be overridden by the agent
const HARD_REJECT_CODES = new Set([
  "MISSING_ICD10", "INVALID_FORMAT", "GENDER_MISMATCH", "AGE_MISMATCH",
  "FABRICATED_NAPPI", "FUTURE_DATE", "FUTURE_DATE_SERVICE", "STALE_CLAIM",
  "DUPLICATE_CLAIM", "ASTERISK_PRIMARY", "ECC_AS_PRIMARY", "MISSING_ECC",
  "MISSING_PATIENT_NAME", "NEONATAL_ON_ADULT", "OBSTETRIC_ON_MALE",
  "INVALID_AMOUNT", "INVALID_AMOUNT_FORMAT", "INVALID_DATE_FORMAT",
  "SCHEME_OPTION_MISSING", "MISSING_MEMBERSHIP", "NO_PATIENT_IDENTIFIER",
  "EXCESSIVE_QUANTITY", "DENTAL_TARIFF_MISMATCH", "CLAIM_WINDOW_EXPIRED",
  "INVALID_PRACTICE_NUMBER", "INVALID_OPTION_CODE",
]);

/**
 * Review a single claim using the AI SDK agent.
 */
async function reviewSingleClaim(
  claim: ClaimLineItem,
  issues: ValidationIssue[],
  ruleVerdict: string,
): Promise<AgentReviewResult> {
  // Skip AI for hard reject codes — save API calls
  const hasHardReject = issues.some(i => HARD_REJECT_CODES.has(i.code));
  if (hasHardReject && ruleVerdict === "REJECTED") {
    return {
      lineNumber: claim.lineNumber,
      verdict: "REJECTED",
      reasoning: "Hard rejection code — no override possible",
      flags: issues.filter(i => HARD_REJECT_CODES.has(i.code)).map(i => i.code),
      confidence: 0.99,
      toolsUsed: [],
      stepsUsed: 0,
    };
  }

  // Build claim context for the agent
  const practiceType = claim.practiceNumber?.startsWith("014") ? "GP" : "Other";
  const claimText = [
    "Practice: " + (claim.practiceNumber || "unknown") + " (" + practiceType + ")",
    "ICD-10: " + (claim.primaryICD10 || "(empty)"),
    "Tariff: " + (claim.tariffCode || "(none)"),
    "NAPPI: " + (claim.nappiCode || "(none)"),
    "Amount: R" + (claim.amount || 0),
    "Patient: " + (claim.patientGender || "U") + ", age " + (claim.patientAge || "unknown"),
    "Scheme: " + (claim.scheme || "unknown") + ", Option: " + (claim.schemeOptionCode || "(empty)"),
    "Date: " + (claim.dateOfService || "unknown"),
    "Dependent: " + (claim.dependentCode || "00"),
    "Motivation: \"" + (claim.motivationText || "(none)") + "\"",
    "",
    "Rule engine flags: " + (issues.map(function(i) { return i.code + "(" + i.severity + ")"; }).join(", ") || "none"),
    "Rule engine verdict: " + ruleVerdict,
  ].join("\n");

  try {
    const result = await claimsReviewerAgent.generate({
      prompt: "Review this claim and give your verdict:\n\n" + claimText,
    });

    // Parse the agent's text response for verdict
    const text = result.text;
    let parsed: { verdict?: string; reasoning?: string; flags?: string[]; confidence?: number } = {};

    try {
      // Try JSON parse first
      const jsonMatch = text.match(/\{[\s\S]*"verdict"[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Extract verdict from raw text
      const verdictMatch = text.match(/"verdict"\s*:\s*"(VALID|WARNING|REJECTED)"/i);
      if (verdictMatch) {
        parsed = { verdict: verdictMatch[1].toUpperCase() };
      }
    }

    const verdict = (parsed.verdict || ruleVerdict).toUpperCase() as "VALID" | "WARNING" | "REJECTED";

    // Safety: if rule engine said REJECTED and agent says VALID, require high confidence
    let finalVerdict = verdict;
    if (ruleVerdict === "REJECTED" && verdict === "VALID" && (parsed.confidence || 0.5) < 0.8) {
      finalVerdict = "WARNING";
    }

    return {
      lineNumber: claim.lineNumber,
      verdict: finalVerdict,
      reasoning: parsed.reasoning || text.slice(0, 200),
      flags: parsed.flags || [],
      confidence: parsed.confidence || 0.7,
      toolsUsed: result.steps?.flatMap(s => s.toolCalls?.map(tc => tc.toolName) || []) || [],
      stepsUsed: result.steps?.length || 0,
    };
  } catch (err) {
    // Agent failed — keep rule engine verdict
    return {
      lineNumber: claim.lineNumber,
      verdict: ruleVerdict as "VALID" | "WARNING" | "REJECTED",
      reasoning: "Agent error: " + (err instanceof Error ? err.message : "unknown"),
      flags: [],
      confidence: 0.3,
      toolsUsed: [],
      stepsUsed: 0,
    };
  }
}

/**
 * Review all flagged claims in a batch.
 */
export async function reviewBatchWithAgent(
  lineResults: { lineNumber: number; status: string; issues: ValidationIssue[]; claimData: ClaimLineItem }[],
): Promise<{
  reviews: AgentReviewResult[];
  summary: { totalReviewed: number; overrides: number; fpsCaught: number; totalSteps: number; totalToolCalls: number; timeMs: number };
}> {
  const startTime = Date.now();
  const flaggedClaims = lineResults.filter(lr => lr.status !== "valid");
  const reviews: AgentReviewResult[] = [];
  let overrides = 0;
  let fpsCaught = 0;
  let totalSteps = 0;
  let totalToolCalls = 0;

  console.log("[Agent Batch] Starting review of " + flaggedClaims.length + " flagged claims");

  // Process in batches of 3 (parallel within batch)
  for (let i = 0; i < flaggedClaims.length; i += 3) {
    const batch = flaggedClaims.slice(i, i + 3);
    const results = await Promise.all(
      batch.map(lr => reviewSingleClaim(
        lr.claimData,
        lr.issues,
        lr.status === "error" ? "REJECTED" : "WARNING",
      ))
    );

    for (const review of results) {
      reviews.push(review);
      totalSteps += review.stepsUsed;
      totalToolCalls += review.toolsUsed.length;

      const lr = lineResults.find(r => r.lineNumber === review.lineNumber);
      if (!lr) continue;

      const ruleVerdict = lr.status === "error" ? "REJECTED" : "WARNING";
      if (review.verdict !== ruleVerdict) {
        overrides++;
        if (ruleVerdict !== "VALID" && (review.verdict === "VALID" || review.verdict === "WARNING")) {
          fpsCaught++;
        }
      }
    }
  }

  // Add valid claims (no review needed)
  for (const lr of lineResults.filter(r => r.status === "valid")) {
    reviews.push({
      lineNumber: lr.lineNumber,
      verdict: "VALID",
      reasoning: "No flags — valid claim",
      flags: [],
      confidence: 0.95,
      toolsUsed: [],
      stepsUsed: 0,
    });
  }

  reviews.sort((a, b) => a.lineNumber - b.lineNumber);

  return {
    reviews,
    summary: {
      totalReviewed: lineResults.length,
      overrides,
      fpsCaught,
      totalSteps,
      totalToolCalls,
      timeMs: Date.now() - startTime,
    },
  };
}
