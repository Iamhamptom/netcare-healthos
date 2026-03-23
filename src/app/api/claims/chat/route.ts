import { NextRequest, NextResponse } from "next/server";
import { requireClaimsAuth } from "@/lib/claims/auth-guard";
import { GoogleGenAI } from "@google/genai";
import Anthropic from "@anthropic-ai/sdk";

// ─── Claims Chat API ──────────────────────────────────────────────
// Powers the conversational claims analyzer chat interface.
// Uses Gemini (primary) with Claude fallback, enriched with
// the HealthOS-Med RAG context when available.

const CHAT_SYSTEM_PROMPT = `You are the Claims AI assistant for Netcare Health OS — South Africa's AI-powered healthcare operations platform.

You are an expert in:
- ICD-10-ZA (South African ICD-10 coding)
- NHRPL tariff codes and SA billing procedures
- Medical Schemes Act 131 of 1998
- CMS billing guidelines and rejection patterns
- Prescribed Minimum Benefits (PMB) and CDL conditions
- Gender/age validation rules for ICD-10 codes
- Dagger/asterisk conventions, external cause codes
- Scheme-specific rules: Discovery Health, GEMS, Bonitas, Medshield, Momentum, Bestmed

Your role:
1. Help users understand their claims analysis results
2. Explain why specific claims were rejected
3. Suggest correct ICD-10 codes when asked
4. Advise on how to fix common submission errors
5. Answer questions about SA medical billing, coding standards, and scheme rules

Style:
- Be concise and practical — this is a busy medical practice
- Use bullet points for clarity
- Reference specific ICD-10 codes, rules, and scheme names
- If unsure, say so — never guess on medical codes
- Format monetary amounts in Rands (R)
- When mentioning ICD-10 codes, include the description in brackets

You have access to the user's recent claims analysis results which will be provided as context.`;

const HEALTHOS_SERVER = process.env.HEALTHOS_SERVER_URL || "http://localhost:8800";

async function getRAGContext(query: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${HEALTHOS_SERVER}/rag`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, top_k: 3 }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    return data.context || null;
  } catch {
    return null;
  }
}

async function queryAI(systemPrompt: string, userPrompt: string): Promise<string> {
  // Try Gemini first
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userPrompt,
        config: { systemInstruction: systemPrompt, temperature: 0.3, maxOutputTokens: 1500 },
      });
      if (response.text) return response.text;
    } catch (e) {
      console.warn("[claims-chat] Gemini failed:", (e as Error).message);
    }
  }

  // Fallback to Claude
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    const client = new Anthropic({ apiKey: anthropicKey });
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });
    const block = response.content[0];
    if (block.type === "text") return block.text;
  }

  throw new Error("No AI provider available");
}

export async function POST(req: NextRequest) {
  const auth = await requireClaimsAuth(req, "chat", { limit: 30, windowMs: 60_000 });
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const { message, analysisContext } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Build context from analysis results if available
    let contextBlock = "";
    if (analysisContext) {
      const a = analysisContext;
      contextBlock += `\n\n--- CURRENT ANALYSIS CONTEXT ---\n`;
      contextBlock += `File: ${a.totalClaims} claims analyzed\n`;
      contextBlock += `Valid: ${a.validClaims} | Rejected: ${a.rejectedClaims} | Warnings: ${a.warningClaims}\n`;
      contextBlock += `Rejection rate: ${a.rejectionRate ?? 'N/A'}%\n`;
      if (a.topIssues?.length) {
        contextBlock += `Top issues:\n`;
        for (const i of a.topIssues.slice(0, 5)) {
          contextBlock += `  - ${i.issue}: ${i.count}x (${i.severity})\n`;
        }
      }
      if (a.rejectedLines?.length) {
        contextBlock += `\nRejected claims (sample):\n`;
        for (const r of a.rejectedLines.slice(0, 10)) {
          contextBlock += `  Row ${r.line}: ${r.code} — ${r.patient} — ${r.reasons}\n`;
        }
      }
      contextBlock += `--- END CONTEXT ---\n`;
    }

    // Try RAG enrichment
    const ragContext = await getRAGContext(message);
    if (ragContext) {
      contextBlock += `\n--- KNOWLEDGE BASE ---\n${ragContext}\n--- END KB ---\n`;
    }

    const userPrompt = contextBlock
      ? `${contextBlock}\n\nUser question: ${message}`
      : message;

    const response = await queryAI(CHAT_SYSTEM_PROMPT, userPrompt);

    return NextResponse.json({ response });
  } catch (err) {
    console.error("[claims-chat] Error:", err);
    return NextResponse.json({
      response: "I'm having trouble connecting to the AI service right now. Please try again in a moment.",
    });
  }
}
