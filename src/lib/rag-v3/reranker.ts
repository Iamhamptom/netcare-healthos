/**
 * RAG v3 Reranker — Netcare Health OS
 * Reranks retrieved chunks using Cohere Rerank API (primary)
 * or LLM-based scoring via Gemini (fallback).
 */

import type { RagChunk } from "./types";

const COHERE_RERANK_URL = "https://api.cohere.com/v2/rerank";
const COHERE_MODEL = "rerank-v3.5";

/**
 * Rerank chunks by relevance to the query.
 * Uses Cohere Rerank if COHERE_API_KEY is set, otherwise falls back to
 * Gemini-based relevance scoring, or simple heuristic scoring.
 *
 * @param query The user's search query
 * @param chunks Candidate chunks to rerank
 * @param topK Number of top results to return (default: 5)
 */
export async function rerank(
  query: string,
  chunks: RagChunk[],
  topK: number = 5
): Promise<RagChunk[]> {
  if (chunks.length === 0) return [];
  if (chunks.length <= topK) {
    // Already fewer than topK — just score and return
    return chunks.map((c, i) => ({
      ...c,
      rerankScore: c.combinedScore ?? 1 - i * 0.1,
    }));
  }

  // Try Cohere first
  if (process.env.COHERE_API_KEY) {
    try {
      return await cohereRerank(query, chunks, topK);
    } catch (err) {
      console.warn("[RAG v3 Reranker] Cohere failed, trying Gemini:", err);
    }
  }

  // Try Gemini-based reranking
  const geminiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      return await geminiRerank(query, chunks, topK);
    } catch (err) {
      console.warn("[RAG v3 Reranker] Gemini failed, using heuristic:", err);
    }
  }

  // Final fallback: heuristic reranking
  return heuristicRerank(query, chunks, topK);
}

// ── Cohere Rerank ─────────────────────────────────────────────────

async function cohereRerank(
  query: string,
  chunks: RagChunk[],
  topK: number
): Promise<RagChunk[]> {
  const documents = chunks.map((c) => {
    const prefix = c.contextPrefix ? `${c.contextPrefix}\n` : "";
    return `${prefix}${c.content}`;
  });

  const response = await fetch(COHERE_RERANK_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: COHERE_MODEL,
      query,
      documents,
      top_n: topK,
      return_documents: false,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Cohere Rerank ${response.status}: ${err}`);
  }

  const data = await response.json();
  const results: RagChunk[] = [];

  for (const result of data.results || []) {
    const chunk = chunks[result.index];
    if (chunk) {
      results.push({
        ...chunk,
        rerankScore: result.relevance_score,
      });
    }
  }

  return results;
}

// ── Gemini-based Rerank ───────────────────────────────────────────

async function geminiRerank(
  query: string,
  chunks: RagChunk[],
  topK: number
): Promise<RagChunk[]> {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("No Gemini API key");

  // Take top candidates to score (limit to 20 to control cost)
  const candidates = chunks.slice(0, 20);

  // Build a compact prompt asking Gemini to score relevance
  const docList = candidates
    .map((c, i) => `[${i}] ${c.content.slice(0, 300)}`)
    .join("\n\n");

  const prompt = `You are a relevance scoring system for a South African healthcare claims knowledge base.

Query: "${query}"

Score each document's relevance to this query on a scale of 0.0 to 1.0.
Consider: exact code matches (highest), scheme-specific rules, regulatory text, clinical guidelines, general context.

Documents:
${docList}

Return ONLY a JSON array of objects: [{"index": 0, "score": 0.95}, ...] for the top ${topK} most relevant documents.
No explanation, just JSON.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 512,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini Rerank ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Parse the JSON response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Gemini Rerank: Could not parse JSON from response");
  }

  const scores: { index: number; score: number }[] = JSON.parse(jsonMatch[0]);
  const results: RagChunk[] = [];

  // Sort by score descending and take topK
  scores.sort((a, b) => b.score - a.score);

  for (const item of scores.slice(0, topK)) {
    const chunk = candidates[item.index];
    if (chunk) {
      results.push({
        ...chunk,
        rerankScore: item.score,
      });
    }
  }

  return results;
}

// ── Heuristic Rerank (no API needed) ──────────────────────────────

function heuristicRerank(
  query: string,
  chunks: RagChunk[],
  topK: number
): RagChunk[] {
  const queryTerms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  const queryUpper = query.toUpperCase();

  // Extract codes from query for exact match boosting
  const queryCodes = new Set<string>();
  for (const m of queryUpper.match(/\b[A-Z]\d{2}\.?\d{0,2}\b/g) || []) {
    queryCodes.add(m);
    queryCodes.add(m.replace(".", ""));
  }
  for (const m of query.match(/\b\d{4,10}\b/g) || []) {
    queryCodes.add(m);
  }

  // Extract scheme names
  const schemePattern = /\b(discovery|gems|bonitas|momentum|medshield|bestmed|medihelp)\b/i;
  const queryScheme = query.match(schemePattern)?.[1]?.toLowerCase();

  const scored = chunks.map((chunk) => {
    let score = chunk.combinedScore ?? 0;
    const contentLower = chunk.content.toLowerCase();
    const contentUpper = chunk.content.toUpperCase();

    // Boost: exact code match in content
    for (const code of queryCodes) {
      if (contentUpper.includes(code)) {
        score += 0.3;
      }
    }

    // Boost: query term frequency
    let termHits = 0;
    for (const term of queryTerms) {
      const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      termHits += (contentLower.match(regex) || []).length;
    }
    score += Math.min(termHits * 0.05, 0.3);

    // Boost: scheme match
    if (queryScheme && chunk.scheme?.toLowerCase() === queryScheme) {
      score += 0.2;
    }

    // Boost: category relevance
    if (chunk.metadata.priority >= 8) score += 0.1;

    // Boost: context prefix presence (better indexed)
    if (chunk.contextPrefix) score += 0.05;

    // Penalize: very short chunks (likely fragments)
    if (chunk.content.length < 100) score -= 0.2;

    return { ...chunk, rerankScore: score };
  });

  scored.sort((a, b) => (b.rerankScore ?? 0) - (a.rerankScore ?? 0));
  return scored.slice(0, topK);
}
