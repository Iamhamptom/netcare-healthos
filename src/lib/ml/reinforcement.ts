// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Reinforcement Learning Loop — Automatic self-improvement system
//
// This module creates a CLOSED LOOP where the system automatically:
// 1. OBSERVES: Tracks every claim submission, response, and outcome
// 2. EVALUATES: Compares predictions vs actual results
// 3. LEARNS: Updates scheme rules, rejection patterns, and training data
// 4. RE-EMBEDS: Refreshes the RAG knowledge base when new data arrives
// 5. REPORTS: Generates learning reports for review
//
// Triggers automatically via:
// - Cron job: /api/ml/reinforce (daily learning cycle)
// - Post-submission hook: called after every claim response
// - File watcher: re-embeds when docs/knowledge/ files change
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { readdirSync, statSync } from "fs";
import { join } from "path";
import { scrubJSON, scrubTrainingExample } from "./pii-scrubber";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface LearningEvent {
  id: string;
  type: LearningEventType;
  timestamp: string;
  data: Record<string, unknown>;
  outcome?: "positive" | "negative" | "neutral";
  applied: boolean;
}

export type LearningEventType =
  | "claim_accepted"
  | "claim_rejected"
  | "rejection_predicted_correctly"
  | "rejection_predicted_incorrectly"
  | "new_rejection_code_seen"
  | "scheme_rule_discovered"
  | "coding_correction_applied"
  | "fraud_flag_confirmed"
  | "fraud_flag_false_positive"
  | "preauth_outcome"
  | "era_reconciled"
  | "knowledge_base_updated"
  | "model_retrained";

export interface LearningMetrics {
  totalEvents: number;
  predictionAccuracy: number;
  rejectionPatterns: { code: string; count: number; schemes: string[] }[];
  newRulesDiscovered: number;
  modelDrift: number;
  lastLearningCycle: string;
  improvementRate: number;
}

// ─── In-Memory Learning Store (persisted to Supabase) ───────────────────────

const learningLog: LearningEvent[] = [];
const rejectionTracker = new Map<string, { count: number; schemes: Set<string>; lastSeen: string }>();
const predictionTracker = { correct: 0, incorrect: 0, total: 0 };
const schemeRuleCache = new Map<string, { rule: string; confidence: number; evidence: string[] }>();

// ─── 1. OBSERVE — Track Every Claim Outcome ─────────────────────────────────

/**
 * Record a claim submission outcome for learning.
 * Called automatically after every claim response from the switch.
 */
export function recordClaimOutcome(data: {
  claimRef: string;
  scheme: string;
  icd10Codes: string[];
  tariffCodes: string[];
  status: "accepted" | "rejected" | "partial";
  rejectionCode?: string;
  rejectionReason?: string;
  approvedAmount?: number;
  claimedAmount?: number;
  switchProvider: string;
  latencyMs: number;
  /** Was rejection predicted by our validation? */
  wasPredicted?: boolean;
  /** What did our validator say before submission? */
  validationIssues?: string[];
}): LearningEvent {
  // PII scrub claim data before storing in learning log
  const { data: scrubbedData } = scrubJSON(data as Record<string, unknown>);

  const event: LearningEvent = {
    id: `learn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: data.status === "rejected" ? "claim_rejected" : "claim_accepted",
    timestamp: new Date().toISOString(),
    data: scrubbedData,
    outcome: data.status === "accepted" ? "positive" : "negative",
    applied: false,
  };

  learningLog.push(event);

  // Track rejection patterns
  if (data.status === "rejected" && data.rejectionCode) {
    const key = `${data.rejectionCode}|${data.icd10Codes.join(",")}`;
    const existing = rejectionTracker.get(key);
    if (existing) {
      existing.count++;
      existing.schemes.add(data.scheme);
      existing.lastSeen = event.timestamp;
    } else {
      rejectionTracker.set(key, {
        count: 1,
        schemes: new Set([data.scheme]),
        lastSeen: event.timestamp,
      });
    }
  }

  // Track prediction accuracy
  if (data.status === "rejected") {
    predictionTracker.total++;
    if (data.wasPredicted) {
      predictionTracker.correct++;
      learningLog.push({
        ...event,
        id: `${event.id}-pred`,
        type: "rejection_predicted_correctly",
      });
    } else {
      predictionTracker.incorrect++;
      learningLog.push({
        ...event,
        id: `${event.id}-miss`,
        type: "rejection_predicted_incorrectly",
        outcome: "negative",
      });
    }
  }

  // Trim log to last 10,000 entries
  if (learningLog.length > 10000) {
    learningLog.splice(0, learningLog.length - 10000);
  }

  return event;
}

// ─── 2. EVALUATE — Analyze Patterns ─────────────────────────────────────────

/**
 * Analyze rejection patterns and discover new rules.
 * Returns actionable insights for the next learning cycle.
 */
export function analyzePatterns(): {
  newPatterns: { pattern: string; frequency: number; confidence: number; suggestion: string }[];
  predictionAccuracy: number;
  topRejectionCodes: { code: string; count: number; schemes: string[] }[];
  driftIndicators: string[];
} {
  const newPatterns: { pattern: string; frequency: number; confidence: number; suggestion: string }[] = [];
  const driftIndicators: string[] = [];

  // Find frequently rejected ICD-10 + tariff combinations
  for (const [key, data] of rejectionTracker) {
    if (data.count >= 3) {
      const [code, icd10s] = key.split("|");
      const schemes = Array.from(data.schemes);
      newPatterns.push({
        pattern: `Rejection code ${code} with ICD-10 ${icd10s} at ${schemes.join(", ")}`,
        frequency: data.count,
        confidence: Math.min(0.95, 0.5 + (data.count * 0.1)),
        suggestion: `Add validation rule: warn when submitting ${icd10s} to ${schemes.join("/")} — ${data.count} rejections observed`,
      });
    }
  }

  // Check for prediction drift
  const accuracy = predictionTracker.total > 0
    ? predictionTracker.correct / predictionTracker.total
    : 1;

  if (accuracy < 0.7 && predictionTracker.total > 20) {
    driftIndicators.push(`Prediction accuracy dropped to ${(accuracy * 100).toFixed(0)}% — model may need retraining`);
  }

  // Top rejection codes
  const rejectionCounts = new Map<string, { count: number; schemes: Set<string> }>();
  for (const [key, data] of rejectionTracker) {
    const code = key.split("|")[0];
    const existing = rejectionCounts.get(code);
    if (existing) {
      existing.count += data.count;
      for (const s of data.schemes) existing.schemes.add(s);
    } else {
      rejectionCounts.set(code, { count: data.count, schemes: new Set(data.schemes) });
    }
  }

  const topCodes = Array.from(rejectionCounts.entries())
    .map(([code, data]) => ({ code, count: data.count, schemes: Array.from(data.schemes) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    newPatterns,
    predictionAccuracy: accuracy,
    topRejectionCodes: topCodes,
    driftIndicators,
  };
}

// ─── 3. LEARN — Generate New Training Data From Outcomes ────────────────────

/**
 * Generate new training examples from observed claim outcomes.
 * These can be added to the fine-tuning dataset for model improvement.
 */
export function generateLearningExamples(): {
  instruction: string;
  input: string;
  output: string;
  category: string;
}[] {
  const examples: { instruction: string; input: string; output: string; category: string }[] = [];

  // Learn from rejections we DIDN'T predict — PII-scrubbed
  const missedRejections = learningLog.filter(e => e.type === "rejection_predicted_incorrectly");

  for (const event of missedRejections.slice(-50)) {
    const d = event.data as Record<string, unknown>;
    const raw = {
      instruction: "Predict whether this SA medical aid claim will be accepted or rejected.",
      input: JSON.stringify({
        icd10: d.icd10Codes,
        tariff: d.tariffCodes,
        scheme: d.scheme,
        amount: d.claimedAmount,
      }),
      output: JSON.stringify({
        willReject: true,
        rejectionCode: d.rejectionCode,
        rejectionReason: d.rejectionReason,
        note: "This rejection was NOT predicted by the validator — learned from outcome",
      }),
      category: "rejection_prediction_learned",
    };
    const scrubbed = scrubTrainingExample(raw);
    examples.push(scrubbed);
  }

  // Learn from scheme-specific patterns
  for (const [key, data] of rejectionTracker) {
    if (data.count >= 5) {
      const [code, icd10s] = key.split("|");
      const schemes = Array.from(data.schemes);
      examples.push({
        instruction: "What rejection patterns should I watch for with this scheme?",
        input: `Scheme: ${schemes.join(", ")}. ICD-10 codes: ${icd10s}`,
        output: `Warning: This combination has been rejected ${data.count} times with code ${code}. ${schemes.length > 1 ? `Observed across ${schemes.join(", ")}.` : `Specific to ${schemes[0]}.`} Verify before submission.`,
        category: "scheme_pattern_learned",
      });
    }
  }

  return examples;
}

// ─── 4. RE-EMBED — Refresh Knowledge Base ───────────────────────────────────

// Track last known file modification times for KB change detection
const kbFileTimestamps = new Map<string, number>();

/**
 * Check if knowledge base files have been updated and need re-embedding.
 * Stats all files in docs/knowledge/ and compares modification times.
 */
export function checkForKBUpdates(lastEmbedTimestamp: string): {
  needsReembed: boolean;
  changedFiles: string[];
  newFiles: string[];
} {
  const changedFiles: string[] = [];
  const newFiles: string[] = [];
  const cutoff = new Date(lastEmbedTimestamp).getTime();

  // Scan knowledge base directories
  const kbDirs = [
    join(process.cwd(), "docs/knowledge"),
    join(process.cwd(), "docs/knowledge/extracted"),
  ];

  for (const dir of kbDirs) {
    try {
      const files = readdirSync(dir);
      for (const file of files) {
        if (!file.endsWith(".md") && !file.endsWith(".csv")) continue;
        const fullPath = join(dir, file);
        try {
          const stat = statSync(fullPath);
          const mtime = stat.mtimeMs;
          const prevMtime = kbFileTimestamps.get(fullPath);

          if (!prevMtime) {
            // First time seeing this file
            if (mtime > cutoff) {
              newFiles.push(fullPath);
            }
          } else if (mtime > prevMtime) {
            // File was modified since last check
            changedFiles.push(fullPath);
          }

          kbFileTimestamps.set(fullPath, mtime);
        } catch {
          // File stat failed — skip
        }
      }
    } catch {
      // Directory doesn't exist — skip (may be running in deployed env)
    }
  }

  return {
    needsReembed: changedFiles.length > 0 || newFiles.length > 0,
    changedFiles,
    newFiles,
  };
}

// ─── 5. REPORT — Learning Cycle Summary ─────────────────────────────────────

/**
 * Get comprehensive learning metrics.
 */
export function getLearningMetrics(): LearningMetrics {
  const analysis = analyzePatterns();

  return {
    totalEvents: learningLog.length,
    predictionAccuracy: analysis.predictionAccuracy,
    rejectionPatterns: analysis.topRejectionCodes,
    newRulesDiscovered: analysis.newPatterns.length,
    modelDrift: analysis.driftIndicators.length > 0 ? 1 - analysis.predictionAccuracy : 0,
    lastLearningCycle: learningLog.length > 0 ? learningLog[learningLog.length - 1].timestamp : "never",
    improvementRate: predictionTracker.total > 10 ? analysis.predictionAccuracy : 0,
  };
}

/**
 * Run a complete learning cycle.
 * Called by the daily cron job.
 */
export async function runLearningCycle(): Promise<{
  patternsFound: number;
  examplesGenerated: number;
  accuracy: number;
  driftWarnings: string[];
  reembedNeeded: boolean;
  summary: string;
}> {
  const analysis = analyzePatterns();
  const newExamples = generateLearningExamples();
  const kbCheck = checkForKBUpdates(new Date(Date.now() - 86400000).toISOString());

  // Persist learning to Supabase if configured
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
      // Store new training examples
      for (const ex of newExamples) {
        await fetch(`${supabaseUrl}/rest/v1/ho_training_data`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`,
            "Prefer": "resolution=merge-duplicates",
          },
          body: JSON.stringify({
            instruction: ex.instruction,
            input: ex.input,
            output: ex.output,
            category: ex.category,
            source: "reinforcement_learning",
            quality_score: 0.8,
          }),
        });
      }

      // Store learning metrics
      await fetch(`${supabaseUrl}/rest/v1/ho_ml_evaluations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          model_name: "healthos-med",
          task: "learning_cycle",
          input_data: { totalEvents: learningLog.length, patterns: analysis.newPatterns.length },
          predicted_output: { accuracy: analysis.predictionAccuracy },
          confidence: analysis.predictionAccuracy,
          latency_ms: 0,
        }),
      });
    }
  } catch (dbError) {
    // Persistence fallback: write to local JSONL file so learning data survives restarts
    console.warn("[Learning Cycle] Supabase write failed, falling back to local file:", dbError instanceof Error ? dbError.message : "unknown");
    try {
      const { appendFileSync, mkdirSync } = await import("fs");
      const fallbackDir = join(process.cwd(), "ml/learning-fallback");
      mkdirSync(fallbackDir, { recursive: true });
      const fallbackPath = join(fallbackDir, `learning-${new Date().toISOString().slice(0, 10)}.jsonl`);
      for (const ex of newExamples) {
        appendFileSync(fallbackPath, JSON.stringify({ ...ex, source: "reinforcement_learning", timestamp: new Date().toISOString() }) + "\n");
      }
      appendFileSync(fallbackPath, JSON.stringify({ type: "metrics", accuracy: analysis.predictionAccuracy, patterns: analysis.newPatterns.length, timestamp: new Date().toISOString() }) + "\n");
      console.log(`[Learning Cycle] Fallback: saved ${newExamples.length} examples to ${fallbackPath}`);
    } catch (fileError) {
      console.error("[Learning Cycle] Local fallback also failed:", fileError instanceof Error ? fileError.message : "unknown");
    }
  }

  // Log the learning cycle
  learningLog.push({
    id: `cycle-${Date.now()}`,
    type: "model_retrained",
    timestamp: new Date().toISOString(),
    data: {
      patternsFound: analysis.newPatterns.length,
      examplesGenerated: newExamples.length,
      accuracy: analysis.predictionAccuracy,
    },
    outcome: "positive",
    applied: true,
  });

  return {
    patternsFound: analysis.newPatterns.length,
    examplesGenerated: newExamples.length,
    accuracy: analysis.predictionAccuracy,
    driftWarnings: analysis.driftIndicators,
    reembedNeeded: kbCheck.needsReembed,
    summary: `Learning cycle complete: ${analysis.newPatterns.length} patterns, ${newExamples.length} new examples, ${(analysis.predictionAccuracy * 100).toFixed(0)}% accuracy. ${analysis.driftIndicators.length > 0 ? "DRIFT DETECTED." : "No drift."}`,
  };
}

/**
 * Reset all learning state (for testing or fresh start).
 */
export function resetLearning(): void {
  learningLog.length = 0;
  rejectionTracker.clear();
  predictionTracker.correct = 0;
  predictionTracker.incorrect = 0;
  predictionTracker.total = 0;
  schemeRuleCache.clear();
}
