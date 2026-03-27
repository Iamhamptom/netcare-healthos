/**
 * Unified AI Intelligence Engine — Netcare Health OS
 *
 * The BRAIN behind every chatbot, agent, and voice assistant.
 * Every AI interaction goes through this engine.
 *
 * Features:
 * - RAG v3 enrichment (300MB SA health knowledge base)
 * - Dual-provider AI (Gemini 2.5 Flash primary, Claude Sonnet fallback)
 * - Tool calling with unified registry
 * - Conversation memory (session-scoped)
 * - Feedback loop (learns from corrections)
 * - Context-aware system prompts per agent persona
 * - Medical knowledge grounding (ICD-10, tariffs, NAPPI, schemes)
 */

import { GoogleGenAI, Type } from "@google/genai";
import type { Content, Part, FunctionDeclaration } from "@google/genai";
import Anthropic from "@anthropic-ai/sdk";
import { getToolDeclarations, getAnthropicTools, executeTool } from "./tools-registry";
import type { AgentPersona, IntelligenceResult, ToolFilter } from "./types";

// ── Provider Setup ──────────────────────────────────────────────────────

function getGemini() {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({ apiKey: key });
}

function getAnthropic() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || key === "your-anthropic-api-key-here") return null;
  return new Anthropic({ apiKey: key });
}

// ── RAG Enrichment ──────────────────────────────────────────────────────

async function enrichWithRAG(query: string, category?: string): Promise<string | null> {
  // Try RAG v3 first (hybrid search + reranking)
  try {
    const { retrieve } = await import("@/lib/rag-v3");
    const result = await retrieve(query, {
      limit: 6,
      rerank: true,
      includeStructured: true,
      category,
    });
    if (result.chunks.length > 0) {
      const context = result.chunks
        .map((c) => {
          const source = c.metadata?.source || c.category || "kb";
          const prefix = c.contextPrefix ? `${c.contextPrefix}\n` : "";
          return `[${source}] ${prefix}${c.content}`;
        })
        .join("\n\n---\n\n");
      if (context.length > 50) return context;
    }
  } catch {
    // Fall through to v2
  }

  // RAG v2 fallback (keyword + exact lookup)
  try {
    const { retrieveWithMetrics } = await import("@/lib/rag");
    const { context } = retrieveWithMetrics(query);
    if (context && context.length > 50) return context;
  } catch {
    // Silent — no RAG available
  }

  return null;
}

// ── Knowledge Base Context Builder ──────────────────────────────────────

function buildKnowledgeContext(ragContext: string | null): string {
  if (!ragContext) return "";
  return `\n\n=== VERIFIED SA HEALTH KNOWLEDGE BASE ===
${ragContext}
=== END KNOWLEDGE BASE ===

IMPORTANT: Use the knowledge base above to ground your responses. Cite specific codes, rules, and sources. If the KB doesn't cover the question, say so — never guess on medical codes or regulations.`;
}

// ── System Prompt Builder ───────────────────────────────────────────────

const CORE_MEDICAL_RULES = `
SOUTH AFRICAN HEALTHCARE STANDARDS (non-negotiable):
- ICD-10-ZA (WHO variant, 41,009 codes) — NOT US ICD-10-CM
- CCSA 4-digit tariff codes — NOT US CPT codes
- NAPPI pharmaceutical codes (7-digit product + 3-digit pack)
- Medical Schemes Act 131 of 1998
- 270 PMB DTP conditions, 27 CDL chronic conditions
- POPIA 2026 health regulations in force — NO grace period
- 3 switching houses: Healthbridge, SwitchOn (MediSwitch), MediKredit
- Emergency number: 10177 (national) or 082 911 (private)

CRITICAL RULES:
- NEVER diagnose patients — you are an administrative/operational AI
- ALWAYS err on the side of caution for medical triage
- Amounts in South African Rand (R)
- All data handling must comply with POPIA Section 19
- When unsure about a code or rule, say so — never guess

FEATURE REQUEST PROTOCOL (MANDATORY):
- If a user asks you to do something you CANNOT do — a missing capability, unsupported action, data you don't have, or a tool that doesn't exist — you MUST call the log_feature_request tool BEFORE responding.
- Never just say "I can't do that." Always log it first, then tell the user: "I've logged this as a feature request. VisioCorp will review it and build it into the system. You'll be notified when it ships."
- This applies to ALL unfulfillable requests — integrations, reports you can't generate, actions you can't take, data you can't access.
- Feature requests drive the product roadmap. Every logged request is a vote for what gets built next.`;

export function buildSystemPrompt(persona: AgentPersona, extraContext?: string): string {
  const parts: string[] = [];

  // Persona identity
  parts.push(persona.systemPrompt);

  // Core medical rules (always included)
  parts.push(CORE_MEDICAL_RULES);

  // Persona-specific capabilities
  if (persona.capabilities?.length) {
    parts.push(`\nYOUR CAPABILITIES:\n${persona.capabilities.map((c) => `- ${c}`).join("\n")}`);
  }

  // Tool usage instructions
  if (persona.toolFilter !== "none") {
    parts.push(`\nTOOL USAGE:
- You have access to tools that query real data and take real actions
- ALWAYS use tools to get data before answering — don't guess
- When asked to DO something, call the tool — don't just describe how
- If a tool fails, explain what happened and suggest alternatives`);
  }

  // Extra context (practice info, analysis data, etc.)
  if (extraContext) {
    parts.push(`\n${extraContext}`);
  }

  return parts.join("\n\n");
}

// ── Gemini Agent Loop ───────────────────────────────────────────────────

async function runGeminiAgent(
  systemPrompt: string,
  messages: Array<{ role: "user" | "model"; content: string }>,
  tools: FunctionDeclaration[],
  toolExecutor: (name: string, args: Record<string, unknown>) => Promise<string>,
  maxSteps: number,
): Promise<IntelligenceResult> {
  const ai = getGemini();
  if (!ai) throw new Error("No Gemini API key");

  const toolsUsed: string[] = [];
  const contents: Content[] = [];

  // Build conversation history
  for (const msg of messages.slice(0, -1)) {
    contents.push({ role: msg.role, parts: [{ text: msg.content }] });
  }
  contents.push({ role: "user", parts: [{ text: messages[messages.length - 1].content }] });

  for (let step = 0; step < maxSteps; step++) {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.4,
        maxOutputTokens: 4096,
        tools: tools.length > 0 ? [{ functionDeclarations: tools }] : undefined,
      },
    });

    const functionCalls = response.functionCalls;

    if (!functionCalls || functionCalls.length === 0) {
      return {
        response: response.text || "I wasn't able to generate a response.",
        toolsUsed,
        provider: "gemini",
        stepsUsed: step + 1,
      };
    }

    // Add model response with function calls
    const modelParts: Part[] = [];
    if (response.text) modelParts.push({ text: response.text });
    for (const fc of functionCalls) modelParts.push({ functionCall: fc });
    contents.push({ role: "model", parts: modelParts });

    // Execute tools
    const functionResponseParts: Part[] = [];
    for (const fc of functionCalls) {
      const toolName = fc.name || "unknown";
      toolsUsed.push(toolName);
      let result: string;
      try {
        result = await toolExecutor(toolName, (fc.args || {}) as Record<string, unknown>);
      } catch (err) {
        result = JSON.stringify({ error: `Tool failed: ${(err as Error).message}` });
      }
      functionResponseParts.push({
        functionResponse: {
          name: toolName,
          response: JSON.parse(result),
        },
      });
    }
    contents.push({ role: "user", parts: functionResponseParts });
  }

  return {
    response: "I've completed the analysis. Let me know if you need anything else.",
    toolsUsed,
    provider: "gemini",
    stepsUsed: maxSteps,
  };
}

// ── Claude Agent Loop ───────────────────────────────────────────────────

async function runClaudeAgent(
  systemPrompt: string,
  messages: Array<{ role: "user" | "model"; content: string }>,
  anthropicTools: Anthropic.Tool[],
  toolExecutor: (name: string, args: Record<string, unknown>) => Promise<string>,
  maxSteps: number,
): Promise<IntelligenceResult> {
  const anthropic = getAnthropic();
  if (!anthropic) throw new Error("No Anthropic API key");

  const toolsUsed: string[] = [];
  const currentMessages: Anthropic.MessageParam[] = messages.map((m) => ({
    role: m.role === "model" ? ("assistant" as const) : ("user" as const),
    content: m.content,
  }));

  for (let step = 0; step < maxSteps; step++) {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      tools: anthropicTools.length > 0 ? anthropicTools : undefined,
      messages: currentMessages,
    });

    const textBlocks = response.content.filter((b) => b.type === "text");
    const toolBlocks = response.content.filter((b) => b.type === "tool_use");

    if (toolBlocks.length === 0 || response.stop_reason === "end_turn") {
      return {
        response: textBlocks.map((b) => (b.type === "text" ? b.text : "")).join("\n") || "Done!",
        toolsUsed,
        provider: "claude",
        stepsUsed: step + 1,
      };
    }

    currentMessages.push({ role: "assistant", content: response.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const tool of toolBlocks) {
      if (tool.type === "tool_use") {
        toolsUsed.push(tool.name);
        let result: string;
        try {
          result = await toolExecutor(tool.name, tool.input as Record<string, unknown>);
        } catch (err) {
          result = JSON.stringify({ error: `Tool failed: ${(err as Error).message}` });
        }
        toolResults.push({ type: "tool_result", tool_use_id: tool.id, content: result });
      }
    }
    currentMessages.push({ role: "user", content: toolResults });
  }

  return {
    response: "I've completed the analysis. Let me know if you need anything else.",
    toolsUsed,
    provider: "claude",
    stepsUsed: maxSteps,
  };
}

// ── Main Intelligence Function ──────────────────────────────────────────

export interface RunOptions {
  /** Agent persona defining behavior and system prompt */
  persona: AgentPersona;
  /** User message */
  message: string;
  /** Conversation history */
  history?: Array<{ role: "user" | "model" | "assistant"; content: string }>;
  /** Additional context to inject (practice info, analysis data, etc.) */
  extraContext?: string;
  /** Override max tool-calling steps (default: persona.maxSteps or 8) */
  maxSteps?: number;
  /** Practice ID for database tool access */
  practiceId?: string;
  /** Whether to use demo mode tool executors */
  isDemoMode?: boolean;
  /** Custom tool executor (overrides default) */
  toolExecutor?: (name: string, args: Record<string, unknown>) => Promise<string>;
  /** RAG category filter */
  ragCategory?: string;
  /** Skip RAG enrichment */
  skipRAG?: boolean;
}

export async function runIntelligence(options: RunOptions): Promise<IntelligenceResult> {
  const {
    persona,
    message,
    history = [],
    extraContext,
    practiceId,
    isDemoMode = false,
    ragCategory,
    skipRAG = false,
  } = options;

  const maxSteps = options.maxSteps ?? persona.maxSteps ?? 8;

  // 1. RAG enrichment — ground the AI in real knowledge
  let ragContext: string | null = null;
  if (!skipRAG && persona.useRAG !== false) {
    ragContext = await enrichWithRAG(message, ragCategory || persona.ragCategory);
  }

  // 2. Build system prompt with knowledge context
  const knowledgeBlock = buildKnowledgeContext(ragContext);
  const systemPrompt = buildSystemPrompt(persona, (extraContext || "") + knowledgeBlock);

  // 3. Build conversation messages
  const messages: Array<{ role: "user" | "model"; content: string }> = history.map((m) => ({
    role: m.role === "assistant" ? ("model" as const) : (m.role as "user" | "model"),
    content: m.content,
  }));
  messages.push({ role: "user", content: message });

  // 4. Get tools for this persona
  const geminiTools = persona.toolFilter !== "none" ? getToolDeclarations(persona.toolFilter) : [];
  const anthropicToolDefs = persona.toolFilter !== "none" ? getAnthropicTools(persona.toolFilter) : [];

  // 5. Build tool executor
  const toolExecutor =
    options.toolExecutor ||
    ((name: string, args: Record<string, unknown>) => executeTool(name, args, { practiceId, isDemoMode }));

  // 6. Run with Gemini primary, Claude fallback
  const hasGemini = !!getGemini();
  const hasClaude = !!getAnthropic();

  if (hasGemini) {
    try {
      return await runGeminiAgent(systemPrompt, messages, geminiTools, toolExecutor, maxSteps);
    } catch (err) {
      console.error(`[intelligence] Gemini failed for ${persona.name}:`, (err as Error).message);
      // Fall through to Claude
    }
  }

  if (hasClaude) {
    try {
      return await runClaudeAgent(systemPrompt, messages, anthropicToolDefs, toolExecutor, maxSteps);
    } catch (err) {
      console.error(`[intelligence] Claude failed for ${persona.name}:`, (err as Error).message);
    }
  }

  // 7. Graceful degradation — no AI available
  return {
    response: "Our AI system is temporarily unavailable. Please try again in a moment or contact the practice directly.",
    toolsUsed: [],
    provider: "none",
    stepsUsed: 0,
  };
}

// ── Simple Text Generation (no tools) ───────────────────────────────────

export async function generateResponse(
  systemPrompt: string,
  message: string,
  options?: { temperature?: number; maxTokens?: number; history?: Array<{ role: "user" | "model"; content: string }> },
): Promise<{ text: string; provider: string }> {
  const temperature = options?.temperature ?? 0.5;
  const maxTokens = options?.maxTokens ?? 2048;
  const messages = [...(options?.history || []), { role: "user" as const, content: message }];

  // Gemini first
  const ai = getGemini();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: messages.map((m) => ({
          role: m.role,
          parts: [{ text: m.content }],
        })),
        config: {
          systemInstruction: systemPrompt,
          temperature,
          maxOutputTokens: maxTokens,
        },
      });
      return { text: response.text || "", provider: "gemini" };
    } catch (err) {
      console.error("[intelligence] Gemini text gen failed:", (err as Error).message);
    }
  }

  // Claude fallback
  const anthropic = getAnthropic();
  if (anthropic) {
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: messages.map((m) => ({
          role: m.role === "model" ? ("assistant" as const) : ("user" as const),
          content: m.content,
        })),
      });
      const text = response.content.find((b) => b.type === "text");
      return { text: text?.type === "text" ? text.text : "", provider: "claude" };
    } catch (err) {
      console.error("[intelligence] Claude text gen failed:", (err as Error).message);
    }
  }

  return { text: "AI is temporarily unavailable.", provider: "none" };
}
