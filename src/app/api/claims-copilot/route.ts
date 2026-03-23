import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";

const COPILOT_SYSTEM = `You are HealthOS Claims Copilot — an expert South African healthcare claims AI assistant. You help billing clerks, practice managers, and healthcare providers with:

CAPABILITIES:
1. **Claims Validation** — Validate ICD-10-ZA codes, CCSA tariff codes, NAPPI codes, modifiers
2. **Rejection Analysis** — Explain why claims were rejected, how to fix them, how to prevent future rejections
3. **Code Suggestions** — Suggest correct ICD-10-ZA codes from clinical descriptions or notes
4. **Document Generation** — Create claim correction letters, audit reports, coding summaries, comparison tables
5. **Scheme Rules** — Explain scheme-specific rules for Discovery, GEMS, Bonitas, Momentum, Medshield, Bestmed, Medihelp
6. **CDL/PMB Guidance** — Advise on Chronic Disease List and Prescribed Minimum Benefit claims
7. **Compliance** — POPIA health data rules, HPCSA coding ethics, SAHPRA AI requirements
8. **Training** — Teach coding best practices, common errors, modifier usage

SA HEALTHCARE KNOWLEDGE:
- ICD-10-ZA (WHO variant, 41,009 codes) — NOT US ICD-10-CM
- CCSA tariff codes (4-digit) — NOT US CPT codes
- NAPPI pharmaceutical codes (7-digit product + 3-digit pack)
- Medical Schemes Act 131 of 1998
- 270 PMB DTP conditions, 27 CDL chronic conditions
- GEMS = Government Employees Medical Scheme (NOT "Guideline for...")
- No national tariff in SA since 2010 — each scheme sets own rates
- 3 switching houses: Healthbridge, SwitchOn (MediSwitch), MediKredit
- Industry rejection rate: 15-20% (R13-26 billion lost annually)

RESPONSE FORMAT:
- Be direct and specific — cite exact codes, rates, and rules
- Use markdown tables for comparisons and data
- Use code blocks for EDI/CSV formats
- Bold important codes and warnings
- When generating documents, use proper formatting with headers
- When showing claim corrections, show BEFORE → AFTER clearly
- Always specify which scheme's rules you're referencing
- If unsure about a specific rate or code, say so — never guess

COMMON TASKS:
- "Validate this claim" → Ask for ICD-10, tariff, scheme, patient details
- "Fix this rejection" → Ask for rejection code, explain cause, provide correction
- "Code these notes" → Convert clinical description to ICD-10 + tariff
- "Compare schemes" → Generate table comparing rules/rates across schemes
- "Generate report" → Create formatted markdown report
- "Explain [code/rule/term]" → Detailed SA-specific explanation`;

/** POST /api/claims-copilot — Claims AI co-pilot chat */
export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, "claims-copilot", {
    limit: 30,
    windowMs: 60_000,
  });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json();
  const message = String(body.message || "").trim();
  const history = (body.history || []) as {
    role: string;
    content: string;
  }[];
  const context = body.context as {
    claimData?: string;
    scheme?: string;
    mode?: string;
  } | undefined;

  if (!message) {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }

  // Build enhanced system prompt with optional context
  let systemPrompt = COPILOT_SYSTEM;
  if (context?.claimData) {
    systemPrompt += `\n\nCURRENT CLAIM DATA:\n${context.claimData}`;
  }
  if (context?.scheme) {
    systemPrompt += `\n\nSELECTED SCHEME: ${context.scheme}`;
  }

  // Enrich with local RAG if available
  const ragContext = await fetchRAGContext(message);
  if (ragContext) {
    systemPrompt += `\n\n=== VERIFIED SA HEALTH DATABASE ===\n${ragContext}`;
  }

  // Build chat messages (keep last 20 for longer context)
  const chatMessages = history.slice(-20).map((msg) => ({
    role: (msg.role === "user" ? "user" : "model") as "user" | "model",
    content: msg.content,
  }));
  chatMessages.push({ role: "user", content: message });

  // Try Gemini first (cheaper), then Claude
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (geminiKey) {
    try {
      const { chat } = await import("@/lib/gemini");
      const reply = await chat(systemPrompt, chatMessages, {
        maxTokens: 4096,
        temperature: 0.3,
      });
      return NextResponse.json({ reply, source: "gemini" });
    } catch (err) {
      console.error("[claims-copilot] Gemini error:", err);
    }
  }

  if (anthropicKey) {
    try {
      const Anthropic = (await import("@anthropic-ai/sdk")).default;
      const anthropic = new Anthropic({ apiKey: anthropicKey });
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        messages: chatMessages.map((m) => ({
          role: m.role === "model" ? ("assistant" as const) : ("user" as const),
          content: m.content,
        })),
      });
      const reply =
        response.content.find((b) => b.type === "text")?.text ||
        "Unable to generate response.";
      return NextResponse.json({ reply, source: "claude" });
    } catch (err) {
      console.error("[claims-copilot] Claude error:", err);
    }
  }

  return NextResponse.json({
    reply:
      "Claims Copilot is temporarily unavailable. Please check that GEMINI_API_KEY or ANTHROPIC_API_KEY is configured.",
    source: "fallback",
  });
}

/** Fetch RAG context — uses internal /api/rag route (works on Vercel + local) */
async function fetchRAGContext(query: string): Promise<string | null> {
  try {
    // Import the retrieve function directly (same process, no network call)
    const { retrieve } = await import("@/lib/rag");
    const { context } = retrieve(query);
    return context || null;
  } catch {
    return null;
  }
}
