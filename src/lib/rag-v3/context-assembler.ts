/**
 * RAG v3 Context Assembler — Netcare Health OS
 * Assembles retrieved chunks into a coherent context string
 * with source provenance and token budget management.
 */

import type { AssembledContext, RagChunk, StructuredResult } from "./types";

const DEFAULT_MAX_TOKENS = 4000; // ~16K chars, fits in most LLM context windows
const CHARS_PER_TOKEN = 4; // rough approximation

/**
 * Assemble retrieved chunks into a context string for the LLM.
 * Respects token budget, deduplicates, and includes provenance.
 *
 * @param chunks Ranked chunks (highest relevance first)
 * @param maxTokens Maximum token budget for the assembled context
 * @param structuredData Optional structured lookup results to prepend
 */
export function assembleContext(
  chunks: RagChunk[],
  maxTokens: number = DEFAULT_MAX_TOKENS,
  structuredData?: StructuredResult
): AssembledContext {
  const maxChars = maxTokens * CHARS_PER_TOKEN;
  const parts: string[] = [];
  const sources: string[] = [];
  const chunkIds: number[] = [];
  let currentChars = 0;

  // 1. Prepend structured data if available (always gets priority)
  let structuredText: string | undefined;
  if (structuredData && structuredData.formatted) {
    structuredText = structuredData.formatted;
    parts.push(structuredText);
    currentChars += structuredText.length;
    sources.push(`structured:${structuredData.type}`);
  }

  // 2. Deduplicate chunks by content hash
  const seen = new Set<string>();
  const uniqueChunks: RagChunk[] = [];

  for (const chunk of chunks) {
    // Use first 120 chars as dedup key (catches near-duplicates)
    const key = chunk.content.slice(0, 120).trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueChunks.push(chunk);
  }

  // 3. Group chunks by category for better readability
  const grouped = groupByCategory(uniqueChunks);

  // 4. Assemble within token budget
  for (const [category, categoryChunks] of grouped) {
    if (currentChars >= maxChars) break;

    const categoryHeader = `\n=== ${formatCategoryName(category).toUpperCase()} ===\n`;
    const headerChars = categoryHeader.length;

    if (currentChars + headerChars >= maxChars) break;

    const sectionParts: string[] = [];
    let sectionChars = headerChars;

    for (const chunk of categoryChunks) {
      const chunkText = formatChunk(chunk);
      const chunkChars = chunkText.length + 4; // +4 for separator

      if (currentChars + sectionChars + chunkChars > maxChars) {
        // Try to fit a truncated version
        const remaining = maxChars - currentChars - sectionChars - 20;
        if (remaining > 200) {
          sectionParts.push(truncateChunk(chunkText, remaining));
          chunkIds.push(chunk.id);
          sources.push(formatSource(chunk));
        }
        break;
      }

      sectionParts.push(chunkText);
      sectionChars += chunkChars;
      chunkIds.push(chunk.id);
      sources.push(formatSource(chunk));
    }

    if (sectionParts.length > 0) {
      parts.push(categoryHeader + sectionParts.join("\n---\n"));
      currentChars += sectionChars;
    }
  }

  const text = parts.join("\n");
  const tokenCount = Math.ceil(text.length / CHARS_PER_TOKEN);

  return {
    text,
    tokenCount,
    sources: Array.from(new Set(sources)),
    chunkIds,
    structuredData: structuredText,
  };
}

/**
 * Assemble a minimal context (just concatenated text) for quick queries.
 * No headers, no grouping — used for simple lookups.
 */
export function assembleMinimal(
  chunks: RagChunk[],
  maxTokens: number = 2000
): string {
  const maxChars = maxTokens * CHARS_PER_TOKEN;
  let result = "";

  for (const chunk of chunks) {
    const text = chunk.contextPrefix
      ? `${chunk.contextPrefix}\n${chunk.content}`
      : chunk.content;

    if (result.length + text.length + 4 > maxChars) break;
    result += (result ? "\n\n" : "") + text;
  }

  return result;
}

// ── Helpers ───────────────────────────────────────────────────────

function formatChunk(chunk: RagChunk): string {
  const parts: string[] = [];

  // Add context prefix if available
  if (chunk.contextPrefix) {
    parts.push(`[Context: ${chunk.contextPrefix}]`);
  }

  // Add the main content
  parts.push(chunk.content);

  // Add provenance footer
  const scores: string[] = [];
  if (chunk.rerankScore !== undefined) scores.push(`rerank: ${chunk.rerankScore.toFixed(3)}`);
  else if (chunk.combinedScore !== undefined) scores.push(`score: ${chunk.combinedScore.toFixed(3)}`);

  if (scores.length > 0) {
    parts.push(`[Source: ${chunk.metadata.filename || chunk.docId} | ${scores.join(", ")}]`);
  }

  return parts.join("\n");
}

function truncateChunk(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;

  // Try to truncate at a sentence boundary
  const truncated = text.slice(0, maxChars);
  const lastSentence = truncated.lastIndexOf(".");
  if (lastSentence > maxChars * 0.5) {
    return truncated.slice(0, lastSentence + 1) + " [...]";
  }

  return truncated + " [...]";
}

function groupByCategory(
  chunks: RagChunk[]
): [string, RagChunk[]][] {
  const groups = new Map<string, RagChunk[]>();

  for (const chunk of chunks) {
    const cat = chunk.category || "general";
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(chunk);
  }

  // Sort groups by the highest-scoring chunk in each
  const entries = Array.from(groups.entries());
  entries.sort((a, b) => {
    const aMax = Math.max(...a[1].map((c) => c.rerankScore ?? c.combinedScore ?? 0));
    const bMax = Math.max(...b[1].map((c) => c.rerankScore ?? c.combinedScore ?? 0));
    return bMax - aMax;
  });

  return entries;
}

function formatCategoryName(category: string): string {
  const names: Record<string, string> = {
    law: "Law & Regulation",
    claims: "Claims Adjudication",
    coding: "Coding Standards",
    pmb: "PMB & CDL",
    scheme: "Medical Scheme Rules",
    pharma: "Pharmaceutical",
    fraud: "Fraud Detection",
    compliance: "Compliance",
    clinical: "Clinical Guidelines",
    general: "Knowledge Base",
    learned_correction: "Verified Corrections",
  };
  return names[category] || category;
}

function formatSource(chunk: RagChunk): string {
  const file = chunk.metadata.filename || chunk.docId;
  return `${chunk.category}:${file}`;
}
