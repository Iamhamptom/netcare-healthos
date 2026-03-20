// AI-Powered ICD-10 Code Suggestion Engine
// Uses Gemini (primary, cheaper) with Claude fallback for medical coding suggestions

import { GoogleGenAI } from "@google/genai";
import Anthropic from "@anthropic-ai/sdk";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CodeSuggestion {
  code: string;
  description: string;
  confidence: "high" | "medium" | "low";
  reason: string;
}

export interface SuggestionContext {
  currentCode?: string;
  description?: string;
  patientGender?: string;
  patientAge?: number;
  issues?: string[];
}

export interface RejectionIssue {
  code: string;
  rule: string;
  message: string;
}

// ─── System Prompt ──────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a South African medical coding expert specializing in:
- ICD-10-ZA (South African adaptation of ICD-10-WHO)
- NHRPL (National Health Reference Price List) tariff codes
- Medical scheme rules per the Medical Schemes Act 131 of 1998
- Council for Medical Schemes (CMS) billing guidelines
- Prescribed Minimum Benefits (PMB) CDL conditions and their diagnostic codes
- Gender and age validation rules for ICD-10 codes
- Dagger/asterisk conventions and external cause code requirements (V/W/X/Y codes for S/T injuries)

When suggesting ICD-10 codes:
1. Always use the South African ICD-10-ZA coding conventions
2. Include the full code with correct specificity (4th and 5th characters where required)
3. Flag PMB-qualifying codes when relevant
4. Note gender or age restrictions on codes
5. Suggest both primary and secondary codes where appropriate
6. Consider common medical scheme rejection reasons

Respond ONLY with valid JSON — no markdown fences, no commentary outside the JSON.`;

// ─── AI Provider Abstraction ────────────────────────────────────────────────

async function queryGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.2,
      maxOutputTokens: 2048,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}

async function queryClaude(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type from Claude");
  return block.text;
}

async function queryAI(systemPrompt: string, userPrompt: string): Promise<string> {
  // Try Gemini first (cheaper), fall back to Claude
  try {
    return await queryGemini(systemPrompt, userPrompt);
  } catch (geminiErr) {
    console.warn("[ai-suggestions] Gemini failed, falling back to Claude:", (geminiErr as Error).message);
    try {
      return await queryClaude(systemPrompt, userPrompt);
    } catch (claudeErr) {
      console.error("[ai-suggestions] Both AI providers failed");
      throw new Error(`AI suggestion unavailable: Gemini (${(geminiErr as Error).message}), Claude (${(claudeErr as Error).message})`);
    }
  }
}

// ─── JSON Parsing Helper ────────────────────────────────────────────────────

function parseJSON<T>(raw: string): T {
  // Strip markdown fences if present
  const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  return JSON.parse(cleaned);
}

// ─── Exported Functions ─────────────────────────────────────────────────────

/**
 * Suggest ICD-10 codes based on context: a flagged issue, partial code, or diagnosis description.
 */
export async function suggestICD10Codes(context: SuggestionContext): Promise<CodeSuggestion[]> {
  const parts: string[] = [];

  if (context.currentCode) {
    parts.push(`Current ICD-10 code: ${context.currentCode}`);
  }
  if (context.description) {
    parts.push(`Diagnosis description: ${context.description}`);
  }
  if (context.patientGender) {
    parts.push(`Patient gender: ${context.patientGender === "M" ? "Male" : context.patientGender === "F" ? "Female" : "Unknown"}`);
  }
  if (context.patientAge !== undefined) {
    parts.push(`Patient age: ${context.patientAge} years`);
  }
  if (context.issues && context.issues.length > 0) {
    parts.push(`Validation issues:\n${context.issues.map(i => `  - ${i}`).join("\n")}`);
  }

  if (parts.length === 0) {
    return [];
  }

  const userPrompt = `Given the following medical claim context, suggest the most appropriate ICD-10-ZA codes.

${parts.join("\n")}

Return a JSON array of suggestions, each with:
- "code": the ICD-10-ZA code (e.g. "J06.9")
- "description": what the code represents
- "confidence": "high", "medium", or "low"
- "reason": why this code is suggested, including any specificity or gender/age considerations

Return 1-5 suggestions ordered by confidence (highest first). Format: [{ "code": "...", "description": "...", "confidence": "...", "reason": "..." }]`;

  try {
    const raw = await queryAI(SYSTEM_PROMPT, userPrompt);
    const suggestions = parseJSON<CodeSuggestion[]>(raw);

    // Validate shape
    return suggestions
      .filter(s => s.code && s.description && s.confidence && s.reason)
      .map(s => ({
        code: String(s.code).toUpperCase().trim(),
        description: String(s.description),
        confidence: (["high", "medium", "low"].includes(s.confidence) ? s.confidence : "low") as "high" | "medium" | "low",
        reason: String(s.reason),
      }))
      .slice(0, 5);
  } catch (err) {
    console.error("[ai-suggestions] Failed to get ICD-10 suggestions:", (err as Error).message);
    return [];
  }
}

/**
 * Explain a claim rejection in plain English with actionable guidance.
 */
export async function explainRejection(issue: RejectionIssue): Promise<string> {
  const userPrompt = `A medical claim was flagged with the following validation issue:

- ICD-10 Code: ${issue.code}
- Rule violated: ${issue.rule}
- Error message: ${issue.message}

Explain in 2-3 sentences:
1. What this rejection means in plain English
2. The most likely cause
3. What the practice should do to fix it and avoid future rejections

Return a JSON object: { "explanation": "..." }`;

  try {
    const raw = await queryAI(SYSTEM_PROMPT, userPrompt);
    const result = parseJSON<{ explanation: string }>(raw);
    return result.explanation || "Unable to generate explanation for this rejection.";
  } catch (err) {
    console.error("[ai-suggestions] Failed to explain rejection:", (err as Error).message);
    return `Claim rejected: code ${issue.code} violated rule "${issue.rule}". ${issue.message}`;
  }
}
