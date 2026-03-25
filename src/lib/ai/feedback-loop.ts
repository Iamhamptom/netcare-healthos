/**
 * Feedback & Learning Loop — Reinforcement Learning for AI Agents
 *
 * Tracks every AI interaction and learns from corrections.
 * Uses Supabase to persist feedback across sessions.
 *
 * Learning mechanisms:
 * 1. RAG boost/penalize — upweight docs that led to good answers, downweight bad ones
 * 2. Correction memory — store corrections for common queries (few-shot examples)
 * 3. Tool success tracking — identify which tools fail often and need fixes
 * 4. Query classification — learn which persona handles which query type best
 * 5. Response quality scoring — track thumbs up/down ratios per persona
 */

import type { FeedbackEntry } from "./types";

// ── In-Memory Feedback Cache ────────────────────────────────────────────
// Fast lookup for recent feedback. Synced to Supabase periodically.

const feedbackCache: FeedbackEntry[] = [];
const correctionIndex: Map<string, string> = new Map(); // query hash → corrected response
const toolSuccessRates: Map<string, { success: number; fail: number }> = new Map();
const MAX_CACHE = 500;

// ── Core Functions ──────────────────────────────────────────────────────

/** Record feedback for an AI interaction */
export async function recordFeedback(entry: Omit<FeedbackEntry, "id" | "timestamp">): Promise<string> {
  const feedback: FeedbackEntry = {
    ...entry,
    id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };

  // Add to in-memory cache
  feedbackCache.push(feedback);
  if (feedbackCache.length > MAX_CACHE) feedbackCache.shift();

  // If it's a correction, index it for future use
  if (feedback.type === "correction" && feedback.correctedResponse) {
    const queryKey = normalizeQuery(feedback.query);
    correctionIndex.set(queryKey, feedback.correctedResponse);
  }

  // Persist to Supabase (fire-and-forget)
  persistFeedback(feedback).catch((err) =>
    console.error("[feedback] Persist error:", err),
  );

  return feedback.id;
}

/** Record tool execution success/failure */
export function recordToolResult(toolName: string, success: boolean): void {
  const current = toolSuccessRates.get(toolName) || { success: 0, fail: 0 };
  if (success) current.success++;
  else current.fail++;
  toolSuccessRates.set(toolName, current);
}

/** Check if there's a known correction for this query */
export function getCorrection(query: string): string | null {
  return correctionIndex.get(normalizeQuery(query)) || null;
}

/** Get few-shot examples from past corrections for a persona */
export function getCorrectionExamples(persona: string, limit: number = 3): Array<{ query: string; corrected: string }> {
  return feedbackCache
    .filter((f) => f.persona === persona && f.type === "correction" && f.correctedResponse)
    .slice(-limit)
    .map((f) => ({ query: f.query, corrected: f.correctedResponse! }));
}

/** Build a correction context block for system prompts */
export function buildCorrectionContext(persona: string): string {
  const examples = getCorrectionExamples(persona, 5);
  if (examples.length === 0) return "";

  const lines = examples.map(
    (e) => `QUERY: "${e.query}"\nCORRECT RESPONSE: "${e.corrected}"`,
  );

  return `\n=== LEARNED CORRECTIONS (apply these patterns) ===\n${lines.join("\n\n")}\n=== END CORRECTIONS ===`;
}

/** Get quality score for a persona (0-1, based on thumbs up/down ratio) */
export function getPersonaQuality(persona: string): { score: number; total: number; positive: number; negative: number } {
  const entries = feedbackCache.filter((f) => f.persona === persona);
  const positive = entries.filter((f) => f.type === "thumbs_up").length;
  const negative = entries.filter((f) => f.type === "thumbs_down" || f.type === "correction").length;
  const total = positive + negative;
  return {
    score: total > 0 ? positive / total : 0.5,
    total,
    positive,
    negative,
  };
}

/** Get tool reliability metrics */
export function getToolMetrics(): Array<{ tool: string; successRate: number; total: number }> {
  return Array.from(toolSuccessRates.entries())
    .map(([tool, stats]) => ({
      tool,
      successRate: stats.success / (stats.success + stats.fail),
      total: stats.success + stats.fail,
    }))
    .sort((a, b) => a.successRate - b.successRate);
}

/** Get all recent feedback entries (for dashboard display) */
export function getRecentFeedback(limit: number = 50): FeedbackEntry[] {
  return feedbackCache.slice(-limit);
}

// ── RAG Relevance Scoring ───────────────────────────────────────────────
// When a user gives thumbs up/down, adjust the relevance of RAG docs used

const ragDocScores: Map<string, number> = new Map();

/** Boost RAG documents that were part of a positive response */
export function boostRAGDocs(docIds: string[]): void {
  for (const id of docIds) {
    const current = ragDocScores.get(id) || 0;
    ragDocScores.set(id, Math.min(current + 0.1, 1.0));
  }
}

/** Penalize RAG documents that were part of a negative response */
export function penalizeRAGDocs(docIds: string[]): void {
  for (const id of docIds) {
    const current = ragDocScores.get(id) || 0;
    ragDocScores.set(id, Math.max(current - 0.15, -1.0));
  }
}

/** Get the boost/penalty for a RAG doc (used in reranking) */
export function getRAGDocScore(docId: string): number {
  return ragDocScores.get(docId) || 0;
}

// ── Supabase Persistence ────────────────────────────────────────────────

async function persistFeedback(entry: FeedbackEntry): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) return;

  await fetch(`${supabaseUrl}/rest/v1/ho_ai_feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      id: entry.id,
      persona: entry.persona,
      query: entry.query,
      response: entry.response,
      feedback_type: entry.type,
      corrected_response: entry.correctedResponse || null,
      rag_doc_ids: entry.ragDocIds || null,
      practice_id: entry.practiceId || null,
      created_at: entry.timestamp,
    }),
  });
}

/** Load historical corrections from Supabase into memory */
export async function loadCorrections(): Promise<number> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) return 0;

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/ho_ai_feedback?feedback_type=eq.correction&order=created_at.desc&limit=100`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      },
    );
    if (!res.ok) return 0;

    const entries = (await res.json()) as Array<{
      query: string;
      corrected_response: string;
      persona: string;
      response: string;
      feedback_type: string;
      created_at: string;
    }>;

    for (const e of entries) {
      if (e.corrected_response) {
        correctionIndex.set(normalizeQuery(e.query), e.corrected_response);
        feedbackCache.push({
          id: `loaded_${feedbackCache.length}`,
          persona: e.persona,
          query: e.query,
          response: e.response,
          type: "correction",
          correctedResponse: e.corrected_response,
          timestamp: e.created_at,
        });
      }
    }

    return entries.length;
  } catch {
    return 0;
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────

function normalizeQuery(query: string): string {
  return query.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}
