// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RAG (Retrieval-Augmented Generation) Pipeline
// Combines vector search over knowledge base with medical LLM generation
// for grounded, accurate, SA healthcare-specific AI responses.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { searchKnowledgeBase } from "./embeddings";
import { isOllamaAvailable } from "./ollama";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RAGResponse {
  answer: string;
  sources: { content: string; source: string; section: string; similarity: number }[];
  model: string;
  ragUsed: boolean;
  confidence: "high" | "medium" | "low";
  processingTimeMs: number;
}

export interface RAGOptions {
  /** Which model to use: clinical (Med42), knowledge (MedLlama2), reasoning (Qwen3) */
  model?: "clinical" | "knowledge" | "reasoning";
  /** Maximum knowledge base results to include */
  maxSources?: number;
  /** Minimum similarity threshold for KB results */
  similarityThreshold?: number;
  /** Category filter for KB search */
  category?: string;
  /** Temperature for generation */
  temperature?: number;
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** System prompt override */
  systemPrompt?: string;
}

// ─── Model Selection ────────────────────────────────────────────────────────

const MODEL_MAP = {
  clinical: "healthos-med:latest",
  knowledge: "healthos-med:latest",
  reasoning: "healthos-med:latest",
};

// ─── RAG Pipeline ───────────────────────────────────────────────────────────

/**
 * Full RAG pipeline: retrieve relevant knowledge → augment prompt → generate answer.
 */
export async function ragQuery(
  query: string,
  options?: RAGOptions,
): Promise<RAGResponse> {
  const startTime = Date.now();
  const model = MODEL_MAP[options?.model || "reasoning"];

  // Step 1: Check if Ollama is available
  const ollamaUp = await isOllamaAvailable();
  if (!ollamaUp) {
    return {
      answer: "Local AI models are not available. Start Ollama with: ollama serve",
      sources: [],
      model: "none",
      ragUsed: false,
      confidence: "low",
      processingTimeMs: Date.now() - startTime,
    };
  }

  // Step 2: Retrieve relevant knowledge from vector store
  let sources: { content: string; source: string; section: string; similarity: number }[] = [];
  let ragUsed = false;

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      sources = await searchKnowledgeBase(query, SUPABASE_URL, SUPABASE_KEY, {
        limit: options?.maxSources ?? 5,
        threshold: options?.similarityThreshold ?? 0.6,
        category: options?.category,
      });
      ragUsed = sources.length > 0;
    } catch (err) {
      console.error("RAG retrieval error:", err);
    }
  }

  // Step 3: Build augmented prompt
  const systemPrompt = options?.systemPrompt || `You are a South African healthcare AI expert. You have deep knowledge of:
- ICD-10-ZA coding standards (WHO variant, not US ICD-10-CM)
- SA Medical Schemes Act 131 of 1998
- Prescribed Minimum Benefits (270 DTPs + 27 CDL conditions)
- EDIFACT MEDCLM v0:912:ZA switching protocol
- CCSA tariff codes and NHRPL pricing
- NAPPI pharmaceutical product codes
- POPIA data protection compliance

Answer accurately based on SA healthcare context. Cite specific sections of law, scheme rules, or coding standards where applicable.`;

  let augmentedPrompt = query;
  if (ragUsed) {
    const contextBlock = sources
      .map((s, i) => `[Source ${i + 1}: ${s.source} — ${s.section}]\n${s.content}`)
      .join("\n\n---\n\n");

    augmentedPrompt = `Use the following knowledge base context to answer the question. If the context doesn't contain the answer, use your medical knowledge but indicate the response is not from the knowledge base.

CONTEXT:
${contextBlock}

QUESTION:
${query}

ANSWER:`;
  }

  // Step 4: Generate answer
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt: augmentedPrompt,
        system: systemPrompt,
        stream: false,
        options: {
          temperature: options?.temperature ?? 0.3,
          num_predict: options?.maxTokens ?? 2048,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json() as { response: string };

    // Determine confidence based on RAG match quality
    const avgSimilarity = sources.length > 0
      ? sources.reduce((sum, s) => sum + s.similarity, 0) / sources.length
      : 0;
    const confidence = avgSimilarity > 0.8 ? "high" : avgSimilarity > 0.6 ? "medium" : "low";

    return {
      answer: data.response,
      sources,
      model,
      ragUsed,
      confidence: ragUsed ? confidence : "medium",
      processingTimeMs: Date.now() - startTime,
    };
  } catch (err) {
    return {
      answer: `Error generating response: ${err instanceof Error ? err.message : "Unknown error"}`,
      sources,
      model,
      ragUsed,
      confidence: "low",
      processingTimeMs: Date.now() - startTime,
    };
  }
}

/**
 * RAG query specifically for claims-related questions.
 */
export async function ragClaimsQuery(query: string): Promise<RAGResponse> {
  return ragQuery(query, {
    model: "clinical",
    category: "claims",
    maxSources: 5,
    similarityThreshold: 0.65,
  });
}

/**
 * RAG query for regulatory/compliance questions.
 */
export async function ragComplianceQuery(query: string): Promise<RAGResponse> {
  return ragQuery(query, {
    model: "knowledge",
    category: "regulation",
    maxSources: 8,
    similarityThreshold: 0.6,
  });
}

/**
 * RAG query for scheme-specific rules.
 */
export async function ragSchemeQuery(query: string, scheme?: string): Promise<RAGResponse> {
  return ragQuery(query, {
    model: "reasoning",
    category: scheme ? "schemes" : undefined,
    maxSources: 5,
    similarityThreshold: 0.7,
  });
}
