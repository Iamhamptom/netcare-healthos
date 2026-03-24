/**
 * RAG v3 Embedder — Netcare Health OS
 * Generates embeddings using Gemini (primary) or OpenAI (fallback)
 * Both produce 1536-dimensional vectors for pgvector compatibility
 */

import type { EmbeddingResult } from "./types";

const GEMINI_MODEL = "text-embedding-004";
const OPENAI_MODEL = "text-embedding-3-small";
const EMBEDDING_DIM = 1536;

// Cache the provider check so we don't re-detect on every call
let _provider: "gemini" | "openai" | null = null;

function detectProvider(): "gemini" | "openai" {
  if (_provider) return _provider;
  if (process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY) {
    _provider = "gemini";
  } else if (process.env.OPENAI_API_KEY) {
    _provider = "openai";
  } else {
    throw new Error(
      "[RAG v3 Embedder] No embedding API key found. Set GOOGLE_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY."
    );
  }
  return _provider;
}

function getGeminiKey(): string {
  return process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";
}

// ── Gemini Embedding ──────────────────────────────────────────────

async function embedWithGemini(text: string): Promise<EmbeddingResult> {
  const apiKey = getGeminiKey();
  // Use REST API directly to avoid SDK version issues
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:embedContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: `models/${GEMINI_MODEL}`,
      content: { parts: [{ text }] },
      outputDimensionality: EMBEDDING_DIM,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`[Gemini Embed] ${response.status}: ${err}`);
  }

  const data = await response.json();
  const values: number[] = data.embedding?.values ?? [];

  if (values.length === 0) {
    throw new Error("[Gemini Embed] Empty embedding returned");
  }

  // Pad or truncate to target dimension
  const embedding = normalizeVector(values, EMBEDDING_DIM);

  return {
    embedding,
    model: GEMINI_MODEL,
    tokens: Math.ceil(text.length / 4), // approximate
  };
}

async function embedBatchWithGemini(
  texts: string[],
  batchSize: number
): Promise<EmbeddingResult[]> {
  const apiKey = getGeminiKey();
  const results: EmbeddingResult[] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    // Gemini batchEmbedContents endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:batchEmbedContents?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: batch.map((text) => ({
          model: `models/${GEMINI_MODEL}`,
          content: { parts: [{ text }] },
          outputDimensionality: EMBEDDING_DIM,
        })),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`[Gemini BatchEmbed] ${response.status}: ${err}`);
    }

    const data = await response.json();
    const embeddings = data.embeddings ?? [];

    for (let j = 0; j < batch.length; j++) {
      const values: number[] = embeddings[j]?.values ?? [];
      results.push({
        embedding: normalizeVector(values, EMBEDDING_DIM),
        model: GEMINI_MODEL,
        tokens: Math.ceil(batch[j].length / 4),
      });
    }

    // Rate limit: small delay between batches
    if (i + batchSize < texts.length) {
      await sleep(100);
    }
  }

  return results;
}

// ── OpenAI Embedding ──────────────────────────────────────────────

async function embedWithOpenAI(text: string): Promise<EmbeddingResult> {
  const apiKey = process.env.OPENAI_API_KEY!;

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: text,
      dimensions: EMBEDDING_DIM,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`[OpenAI Embed] ${response.status}: ${err}`);
  }

  const data = await response.json();
  const emb = data.data?.[0];

  return {
    embedding: emb.embedding,
    model: OPENAI_MODEL,
    tokens: data.usage?.total_tokens ?? Math.ceil(text.length / 4),
  };
}

async function embedBatchWithOpenAI(
  texts: string[],
  batchSize: number
): Promise<EmbeddingResult[]> {
  const apiKey = process.env.OPENAI_API_KEY!;
  const results: EmbeddingResult[] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        input: batch,
        dimensions: EMBEDDING_DIM,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`[OpenAI BatchEmbed] ${response.status}: ${err}`);
    }

    const data = await response.json();
    const totalTokens = data.usage?.total_tokens ?? 0;
    const tokensPerItem = Math.ceil(totalTokens / batch.length);

    for (const item of data.data) {
      results.push({
        embedding: item.embedding,
        model: OPENAI_MODEL,
        tokens: tokensPerItem,
      });
    }

    if (i + batchSize < texts.length) {
      await sleep(200);
    }
  }

  return results;
}

// ── Public API ────────────────────────────────────────────────────

/**
 * Embed a single text string into a 1536-dimensional vector.
 * Uses Gemini (GOOGLE_API_KEY) as primary, OpenAI as fallback.
 */
export async function embed(text: string): Promise<number[]> {
  const provider = detectProvider();
  const truncated = text.slice(0, 8000); // Max ~2K tokens

  try {
    if (provider === "gemini") {
      const result = await embedWithGemini(truncated);
      return result.embedding;
    } else {
      const result = await embedWithOpenAI(truncated);
      return result.embedding;
    }
  } catch (err) {
    // If primary fails, try the other provider
    console.warn(`[RAG v3 Embedder] ${provider} failed, trying fallback:`, err);
    try {
      if (provider === "gemini" && process.env.OPENAI_API_KEY) {
        const result = await embedWithOpenAI(truncated);
        return result.embedding;
      } else if (provider === "openai" && getGeminiKey()) {
        const result = await embedWithGemini(truncated);
        return result.embedding;
      }
    } catch {
      // Both failed
    }
    throw new Error(
      `[RAG v3 Embedder] All embedding providers failed for text: "${text.slice(0, 50)}..."`
    );
  }
}

/**
 * Embed multiple texts in batches. Returns array of 1536-dim vectors.
 * @param texts Array of text strings to embed
 * @param batchSize Number of texts per API call (default: 50 for Gemini, 100 for OpenAI)
 */
export async function embedBatch(
  texts: string[],
  batchSize?: number
): Promise<number[][]> {
  if (texts.length === 0) return [];
  if (texts.length === 1) return [await embed(texts[0])];

  const provider = detectProvider();
  const defaultBatch = provider === "gemini" ? 50 : 100;
  const size = batchSize ?? defaultBatch;

  // Truncate all texts
  const truncated = texts.map((t) => t.slice(0, 8000));

  try {
    if (provider === "gemini") {
      const results = await embedBatchWithGemini(truncated, size);
      return results.map((r) => r.embedding);
    } else {
      const results = await embedBatchWithOpenAI(truncated, size);
      return results.map((r) => r.embedding);
    }
  } catch (err) {
    console.warn(
      `[RAG v3 Embedder] Batch embed with ${provider} failed, falling back to sequential:`,
      err
    );
    // Fallback: embed one by one
    const results: number[][] = [];
    for (const text of truncated) {
      try {
        results.push(await embed(text));
      } catch {
        // Use zero vector as placeholder for failed embeddings
        console.warn(`[RAG v3 Embedder] Failed to embed: "${text.slice(0, 40)}..."`);
        results.push(new Array(EMBEDDING_DIM).fill(0));
      }
    }
    return results;
  }
}

/**
 * Get embedding with full metadata (model used, token count)
 */
export async function embedWithMetadata(text: string): Promise<EmbeddingResult> {
  const provider = detectProvider();
  const truncated = text.slice(0, 8000);

  if (provider === "gemini") {
    return embedWithGemini(truncated);
  } else {
    return embedWithOpenAI(truncated);
  }
}

// ── Helpers ───────────────────────────────────────────────────────

function normalizeVector(values: number[], targetDim: number): number[] {
  if (values.length === targetDim) return values;
  if (values.length > targetDim) return values.slice(0, targetDim);
  // Pad with zeros
  return [...values, ...new Array(targetDim - values.length).fill(0)];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
