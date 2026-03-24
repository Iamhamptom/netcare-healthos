import { NextRequest, NextResponse } from "next/server";
import { requireClaimsAuth } from "@/lib/claims/auth-guard";
import { GoogleGenAI, Type } from "@google/genai";
import Anthropic from "@anthropic-ai/sdk";
import { lookupICD10, searchICD10, MALE_ONLY_PREFIXES, FEMALE_ONLY_PREFIXES } from "@/lib/claims/icd10-database";
import { lookupTariff } from "@/lib/claims/tariff-database";
import { validateSchemeRules, getSchemeProfile, SCHEME_PROFILES } from "@/lib/claims/scheme-rules";
import { explainRejection as aiExplainRejection, suggestICD10Codes } from "@/lib/claims/ai-suggestions";
import type { ClaimLineItem } from "@/lib/claims/types";
import type { Content, Part, FunctionCall, FunctionDeclaration } from "@google/genai";

// ─── Claims Chat Agent API ──────────────────────────────────────────────
// Tool-calling agent powered by Gemini 2.5 Flash.
// Has 7 tools for ICD-10 lookup, validation, rejection explanation, etc.
// Falls back to Claude for simple text response if Gemini fails.

const AGENT_SYSTEM_PROMPT = `You are the Claims AI agent for Netcare Health OS — South Africa's AI healthcare platform.

You have access to tools that let you look up ICD-10 codes, validate claims, explain rejections,
and query uploaded data. ALWAYS USE YOUR TOOLS — don't guess at codes or rules.

When a user asks about a specific code, LOOK IT UP with lookup_icd10_code.
When they ask "what's the code for X", use search_icd10.
When they ask why something was rejected, use explain_rejection.
When they ask about their uploaded data, use query_uploaded_claims.
When they want to know scheme-specific rules, use get_scheme_rules.
When they need the correct code for a diagnosis, use suggest_correct_code.

Be concise, practical, and reference specific codes with descriptions.
Format monetary amounts in Rands (R). This is South Africa — use ICD-10-ZA, not ICD-10-CM.
Use bullet points for clarity. If unsure, say so — never guess on medical codes.
When mentioning ICD-10 codes, always include the description in brackets.

=== SA CLAIMS VALIDATION RULES (from HealthOS Knowledge Base) ===

RULE 1: MISSING_PRACTICE_NUMBER — BHF practice number required. Provider validation is Step 5 of adjudication (PHISC MEDCLM).
RULE 2: INVALID_FORMAT — ICD-10 must be Letter + 2-4 digits with optional dot. No spaces, no special chars. WHO Volume 2 + SA MIT.
RULE 3: MISSING_DEPENDENT_CODE — 2-digit dependent code required (00=main member, 01=spouse, 02+=children). PHISC MEDCLM DEP segment.
RULE 4: GENDER_MISMATCH — ICD-10 MIT column 16 has WHO gender flags. C53/O-codes female-only, N40-N51 male-only. Anatomically determined.
RULE 5: MISSING_ECC — Injury codes (S00-T98) MUST have External Cause Code (V00-Y99) as secondary. SA CMS mandate.
RULE 6: ECC_AS_PRIMARY — V/W/X/Y codes cannot be primary diagnosis. Must be secondary to the injury code.
RULE 7: NON_SPECIFIC — 3-char codes must have 4th char where MIT specifies. E.g., J06 → J06.9 (unspecified).
RULE 8: DUPLICATE_CLAIM — Same patient + same ICD-10 + same date = likely duplicate. Flag for removal.
RULE 9: SYMPTOM_CODE — R-chapter codes (symptoms) as primary get warning. Prefer definitive diagnosis.
RULE 10: ASTERISK_PRIMARY — Manifestation codes (*) cannot be primary. Dagger (†) code must be primary.
RULE 11: PMB_ELIGIBLE — 270 DTPs + 27 CDL conditions must be covered by scheme regardless of benefits.
RULE 12: STALE_CLAIM — Claims older than 120 days from date of service are stale (most schemes reject).
RULE 13: FUTURE_DATE — Date of service cannot be in the future.
RULE 14: AGE_MISMATCH — Neonatal codes (P00-P96) only for patients < 28 days. Modifier 0019 only for neonates.
RULE 15: AMOUNT_VALIDATION — Negative/zero amounts rejected. Amounts > R100,000 flagged as suspicious.
RULE 16: UNBUNDLING — Certain tariff code pairs cannot be billed together (e.g., GP + specialist same day).
RULE 17: MOTIVATION_OVERRIDE — If motivation_text provides clinical justification, a soft rejection may be overridden.

=== SCHEME-SPECIFIC RULES ===
- Discovery Health: Strict ECC enforcement, PMB routing, no self-referral. Claim window: 120 days.
- GEMS: 9-digit membership format (pad with leading zeros). Government employee specific rules.
- Bonitas: Benefit limit checks, pre-authorization for specialist referrals.
- Medshield, Momentum, Bestmed: Standard CMS rules, 120-day claim window.

=== END KNOWLEDGE BASE ===`;

// ─── Tool Definitions ───────────────────────────────────────────────────

const TOOL_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: "lookup_icd10_code",
    description: "Look up a specific ICD-10-ZA code. Returns the code description, chapter, gender restrictions, validity, PMB status, and specificity information.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        code: { type: Type.STRING, description: "The ICD-10 code to look up (e.g. 'J06.9', 'E11.2', 'O80')" },
      },
      required: ["code"],
    },
  },
  {
    name: "search_icd10",
    description: "Search ICD-10-ZA codes by description text. Use this when the user asks 'what's the code for flu?' or similar natural language queries about diagnoses.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: "Search term — a diagnosis name or description (e.g. 'diabetes', 'acute bronchitis', 'hypertension')" },
      },
      required: ["query"],
    },
  },
  {
    name: "validate_single_claim",
    description: "Validate a single claim line item. Checks the ICD-10 code validity, gender restrictions, age restrictions, tariff compatibility, and scheme rules.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        icd10_code: { type: Type.STRING, description: "The primary ICD-10 code for the claim" },
        patient_gender: { type: Type.STRING, description: "Patient gender: 'M', 'F', or 'U'" },
        patient_age: { type: Type.NUMBER, description: "Patient age in years" },
        tariff_code: { type: Type.STRING, description: "The tariff/procedure code (e.g. '0190')" },
        scheme: { type: Type.STRING, description: "Medical scheme code (e.g. 'DH' for Discovery, 'GEMS')" },
      },
      required: ["icd10_code"],
    },
  },
  {
    name: "explain_rejection",
    description: "Explain why a claim was rejected. Provides a plain-English explanation, the likely cause, and what the practice should do to fix it.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        code: { type: Type.STRING, description: "The ICD-10 code that was rejected" },
        rule: { type: Type.STRING, description: "The rule or validation that was violated (e.g. 'GENDER_MISMATCH', 'INVALID_CODE')" },
        message: { type: Type.STRING, description: "The rejection error message" },
      },
      required: ["code", "rule", "message"],
    },
  },
  {
    name: "get_scheme_rules",
    description: "Get rules and profile for a specific South African medical scheme. Returns claim window, pre-auth requirements, PMB handling, chronic medication rules, and specificity requirements.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        scheme: { type: Type.STRING, description: "Scheme name or code (e.g. 'Discovery', 'DH', 'GEMS', 'Bonitas', 'Medshield', 'Momentum', 'Bestmed')" },
      },
      required: ["scheme"],
    },
  },
  {
    name: "query_uploaded_claims",
    description: "Filter and query the user's uploaded claims analysis results. Use this when the user asks about their data, e.g. 'show rejected claims', 'how many warnings?', 'which claims have gender issues?'",
    parameters: {
      type: Type.OBJECT,
      properties: {
        filter: {
          type: Type.STRING,
          description: "Filter type: 'all' for all claims, 'rejected' for errors only, 'valid' for clean claims, 'warnings' for warning-level issues",
        },
        limit: { type: Type.NUMBER, description: "Maximum number of results to return (default 10)" },
      },
      required: ["filter"],
    },
  },
  {
    name: "suggest_correct_code",
    description: "Suggest the correct ICD-10-ZA code for a given clinical description, optionally considering patient gender and age. Returns up to 5 suggestions ranked by confidence.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        description: { type: Type.STRING, description: "Clinical description or diagnosis (e.g. 'type 2 diabetes with renal complications')" },
        patient_gender: { type: Type.STRING, description: "Patient gender: 'M', 'F', or 'U'" },
        patient_age: { type: Type.NUMBER, description: "Patient age in years" },
      },
      required: ["description"],
    },
  },
];

// ─── Tool Execution ─────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnalysisContext = Record<string, any>;

async function executeTool(
  name: string,
  args: Record<string, unknown>,
  analysisContext?: AnalysisContext,
): Promise<Record<string, unknown>> {
  switch (name) {
    case "lookup_icd10_code": {
      const code = String(args.code || "").toUpperCase().trim();
      const entry = lookupICD10(code);
      if (!entry) {
        return { found: false, code, message: `ICD-10 code "${code}" not found in the database. Check the code format — SA uses WHO ICD-10.` };
      }
      // Determine gender restriction
      let genderNote = "No gender restriction";
      if (entry.genderRestriction === "M") genderNote = "Male-only code";
      else if (entry.genderRestriction === "F") genderNote = "Female-only code";
      else if (MALE_ONLY_PREFIXES.some(p => code.startsWith(p))) genderNote = "Male-only code (prefix rule)";
      else if (FEMALE_ONLY_PREFIXES.some(p => code.startsWith(p))) genderNote = "Female-only code (prefix rule)";

      return {
        found: true,
        code: entry.code,
        description: entry.description,
        chapter: entry.chapter,
        chapterTitle: entry.chapterTitle,
        category: entry.category,
        isValid: entry.isValid,
        maxSpecificity: entry.maxSpecificity,
        genderRestriction: genderNote,
        isPMB: entry.isPMB || false,
        isAsterisk: entry.isAsterisk || false,
        isDagger: entry.isDagger || false,
        requiresExternalCause: entry.requiresExternalCause || false,
      };
    }

    case "search_icd10": {
      const query = String(args.query || "");
      const results = searchICD10(query, 10);
      if (results.length === 0) {
        return { results: [], message: `No ICD-10 codes found matching "${query}". Try different search terms.` };
      }
      return {
        results: results.map(e => ({
          code: e.code,
          description: e.description,
          chapter: e.chapterTitle,
          isValid: e.isValid,
          isPMB: e.isPMB || false,
          genderRestriction: e.genderRestriction || null,
        })),
        count: results.length,
      };
    }

    case "validate_single_claim": {
      const code = String(args.icd10_code || "").toUpperCase().trim();
      const entry = lookupICD10(code);
      const issues: string[] = [];

      // Code existence check
      if (!entry) {
        issues.push(`ICD-10 code "${code}" not found in database — likely invalid or not in SA ICD-10`);
      } else {
        // Validity check
        if (!entry.isValid) {
          issues.push(`Code "${code}" exists but is NOT valid as a primary diagnosis — it requires more specificity (use a ${entry.maxSpecificity}-character subcode)`);
        }
        // Asterisk check
        if (entry.isAsterisk) {
          issues.push(`Code "${code}" is an asterisk (manifestation) code — cannot be used as primary diagnosis. Use the dagger (etiology) code as primary.`);
        }
        // Gender check
        const gender = args.patient_gender ? String(args.patient_gender).toUpperCase() : null;
        if (gender && entry.genderRestriction && entry.genderRestriction !== gender) {
          issues.push(`Gender mismatch: "${code}" [${entry.description}] is restricted to ${entry.genderRestriction === "M" ? "male" : "female"} patients, but patient is ${gender === "M" ? "male" : gender === "F" ? "female" : "unknown"}`);
        }
        if (gender === "M" && FEMALE_ONLY_PREFIXES.some(p => code.startsWith(p))) {
          issues.push(`Gender mismatch: Code "${code}" falls under a female-only prefix — cannot be used for male patients`);
        }
        if (gender === "F" && MALE_ONLY_PREFIXES.some(p => code.startsWith(p))) {
          issues.push(`Gender mismatch: Code "${code}" falls under a male-only prefix — cannot be used for female patients`);
        }
        // Age check
        const age = args.patient_age != null ? Number(args.patient_age) : null;
        if (age != null) {
          if (entry.ageMin != null && age < entry.ageMin) {
            issues.push(`Age restriction: "${code}" requires minimum age ${entry.ageMin}, patient is ${age}`);
          }
          if (entry.ageMax != null && age > entry.ageMax) {
            issues.push(`Age restriction: "${code}" has maximum age ${entry.ageMax}, patient is ${age}`);
          }
        }
        // External cause check
        if (entry.requiresExternalCause) {
          issues.push(`Code "${code}" (injury/poisoning) requires an accompanying external cause code (V/W/X/Y chapter)`);
        }
      }

      // Tariff cross-validation
      if (args.tariff_code) {
        const tariff = lookupTariff(String(args.tariff_code));
        if (!tariff) {
          issues.push(`Tariff code "${args.tariff_code}" not found in NHRPL database`);
        } else {
          // Just report the tariff info — full cross-validation is done by the validation engine
          if (tariff.validDiagnosisCategories.length > 0 && !tariff.validDiagnosisCategories.includes("ALL" as never)) {
            issues.push(`Note: Tariff "${args.tariff_code}" [${tariff.description}] has diagnosis category restrictions`);
          }
        }
      }

      // Scheme-specific validation
      if (args.scheme) {
        const claimLine: ClaimLineItem = {
          lineNumber: 1,
          primaryICD10: code,
          patientGender: (args.patient_gender as "M" | "F" | "U") || undefined,
          patientAge: args.patient_age != null ? Number(args.patient_age) : undefined,
          tariffCode: args.tariff_code ? String(args.tariff_code) : undefined,
          scheme: String(args.scheme),
        };
        const schemeIssues = validateSchemeRules(claimLine, String(args.scheme));
        for (const si of schemeIssues) {
          issues.push(`[${si.severity.toUpperCase()}] ${si.rule}: ${si.message}`);
        }
      }

      return {
        code,
        description: entry?.description || "Unknown code",
        issueCount: issues.length,
        status: issues.length === 0 ? "valid" : "issues_found",
        issues,
      };
    }

    case "explain_rejection": {
      const explanation = await aiExplainRejection({
        code: String(args.code || ""),
        rule: String(args.rule || ""),
        message: String(args.message || ""),
      });
      return { explanation };
    }

    case "get_scheme_rules": {
      const schemeInput = String(args.scheme || "").trim();
      // Try matching by code or name
      const profile = SCHEME_PROFILES.find(
        s => s.code.toUpperCase() === schemeInput.toUpperCase() ||
             s.name.toUpperCase().includes(schemeInput.toUpperCase())
      ) || getSchemeProfile(schemeInput);

      return {
        name: profile.name,
        code: profile.code,
        administrator: profile.administrator,
        claimWindowDays: profile.claimWindowDays,
        requiresPreAuth: profile.requiresPreAuth,
        specificityRequirements: profile.specificityRequirements,
        genderCheckEnabled: profile.genderCheckEnabled,
        ageCheckEnabled: profile.ageCheckEnabled,
        eccRequired: profile.eccRequired,
        maxConsultationsPerDay: profile.maxConsultationsPerDay,
        pmbRules: profile.pmbRules,
        chronicMedRules: profile.chronicMedRules,
      };
    }

    case "query_uploaded_claims": {
      if (!analysisContext) {
        return { error: "No claims data uploaded in this session. Please upload a CSV file first using the Claims Analyzer." };
      }

      const filter = String(args.filter || "all");
      const limit = Math.min(Number(args.limit) || 10, 50);
      const lineResults = analysisContext.lineResults || [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let filtered: any[];
      switch (filter) {
        case "rejected":
          filtered = lineResults.filter((l: { status: string }) => l.status === "error");
          break;
        case "valid":
          filtered = lineResults.filter((l: { status: string }) => l.status === "valid");
          break;
        case "warnings":
          filtered = lineResults.filter((l: { status: string }) => l.status === "warning");
          break;
        default:
          filtered = lineResults;
      }

      const total = filtered.length;
      const sample = filtered.slice(0, limit);

      return {
        filter,
        totalMatching: total,
        showing: sample.length,
        summary: {
          totalClaims: analysisContext.totalClaims || 0,
          validClaims: analysisContext.validClaims || 0,
          rejectedClaims: analysisContext.rejectedClaims || analysisContext.invalidClaims || 0,
          warningClaims: analysisContext.warningClaims || 0,
          rejectionRate: analysisContext.rejectionRate ?? analysisContext.summary?.estimatedRejectionRate ?? "N/A",
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        claims: sample.map((l: any) => ({
          line: l.lineNumber,
          status: l.status,
          code: l.claimData?.primaryICD10 || "N/A",
          patient: l.claimData?.patientName || "N/A",
          gender: l.claimData?.patientGender || "N/A",
          age: l.claimData?.patientAge ?? "N/A",
          tariff: l.claimData?.tariffCode || "N/A",
          issues: (l.issues || []).map((i: { rule: string; message: string; severity: string }) =>
            `[${i.severity}] ${i.rule}: ${i.message}`
          ),
        })),
      };
    }

    case "suggest_correct_code": {
      const suggestions = await suggestICD10Codes({
        description: String(args.description || ""),
        patientGender: args.patient_gender ? String(args.patient_gender) : undefined,
        patientAge: args.patient_age != null ? Number(args.patient_age) : undefined,
      });

      if (suggestions.length === 0) {
        return { suggestions: [], message: "Could not generate code suggestions. Try rephrasing the clinical description." };
      }

      return {
        suggestions: suggestions.map(s => ({
          code: s.code,
          description: s.description,
          confidence: s.confidence,
          reason: s.reason,
        })),
      };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// ─── RAG Context ──────────────────────────────────────────────────────
// Tries multiple sources in order:
// 1. HEALTHOS_SERVER_URL (external RAG server — set on Vercel env)
// 2. Internal /api/rag endpoint (same-origin, in-memory RAG)
// 3. Falls back to null (uses embedded rules in system prompt)

async function getRAGContext(query: string): Promise<string | null> {
  // RAG v3 — hybrid search (pgvector + BM25 + reranking)
  try {
    const { retrieve } = await import("@/lib/rag-v3");
    const result = await retrieve(query, { limit: 5, rerank: true });
    if (result.chunks.length > 0) {
      const context = result.chunks.map(c =>
        `[${c.metadata?.source || c.category}] ${c.contextPrefix ? c.contextPrefix + " " : ""}${c.content}`
      ).join("\n\n---\n\n");
      return context.length > 50 ? context : null;
    }
  } catch {
    // Fall back to v2
    try {
      const { retrieveWithMetrics } = await import("@/lib/rag");
      const { context } = retrieveWithMetrics(query);
      return context && context.length > 50 ? context : null;
    } catch { /* silent */ }
  }
  return null;
}

// ─── Gemini Agent Loop ──────────────────────────────────────────────────

const MAX_TOOL_ITERATIONS = 5;

async function runAgent(
  message: string,
  analysisContext?: AnalysisContext,
  conversationHistory?: { role: string; content: string }[],
): Promise<{ response: string; toolsUsed: string[] }> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!geminiKey) throw new Error("No Gemini API key configured");

  const ai = new GoogleGenAI({ apiKey: geminiKey });

  // Build context block from analysis results
  let contextBlock = "";
  if (analysisContext) {
    const a = analysisContext;
    contextBlock += `\n\n--- CURRENT ANALYSIS CONTEXT ---\n`;
    contextBlock += `File: ${a.totalClaims} claims analyzed\n`;
    contextBlock += `Valid: ${a.validClaims} | Rejected: ${a.rejectedClaims ?? a.invalidClaims ?? 0} | Warnings: ${a.warningClaims}\n`;
    contextBlock += `Rejection rate: ${a.rejectionRate ?? a.summary?.estimatedRejectionRate ?? "N/A"}%\n`;
    const topIssues = a.topIssues || a.summary?.topIssues || [];
    if (topIssues.length) {
      contextBlock += `Top issues:\n`;
      for (const i of topIssues.slice(0, 5)) {
        contextBlock += `  - ${i.issue || i.rule}: ${i.count}x (${i.severity})\n`;
      }
    }
    contextBlock += `--- END CONTEXT ---\n`;
  }

  // RAG enrichment (non-blocking, timeout 3s)
  const ragContext = await getRAGContext(message);
  if (ragContext) {
    contextBlock += `\n--- KNOWLEDGE BASE ---\n${ragContext}\n--- END KB ---\n`;
  }

  // Build the system instruction with context
  const systemInstruction = contextBlock
    ? `${AGENT_SYSTEM_PROMPT}\n${contextBlock}`
    : AGENT_SYSTEM_PROMPT;

  // Build conversation contents for multi-turn
  const contents: Content[] = [];

  // Add conversation history if provided
  if (conversationHistory && conversationHistory.length > 0) {
    for (const msg of conversationHistory) {
      const role = msg.role === "assistant" || msg.role === "model" ? "model" : "user";
      contents.push({ role, parts: [{ text: msg.content }] });
    }
  }

  // Add the current user message
  contents.push({ role: "user", parts: [{ text: message }] });

  const toolsUsed: string[] = [];

  // Agent loop: call Gemini, execute tools, feed results back, repeat
  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.3,
        maxOutputTokens: 2048,
        tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
      },
    });

    const functionCalls = response.functionCalls;

    // No tool calls — return the text response
    if (!functionCalls || functionCalls.length === 0) {
      return { response: response.text || "I wasn't able to generate a response. Please try rephrasing your question.", toolsUsed };
    }

    // Add the model's response (with function calls) to the conversation
    const modelParts: Part[] = [];
    // Include any text parts from the response
    if (response.text) {
      modelParts.push({ text: response.text });
    }
    // Include the function call parts
    for (const fc of functionCalls) {
      modelParts.push({ functionCall: fc });
    }
    contents.push({ role: "model", parts: modelParts });

    // Execute all tool calls and build function response parts
    const functionResponseParts: Part[] = [];
    for (const fc of functionCalls) {
      const toolName = fc.name || "unknown";
      toolsUsed.push(toolName);

      let result: Record<string, unknown>;
      try {
        result = await executeTool(toolName, (fc.args || {}) as Record<string, unknown>, analysisContext);
      } catch (err) {
        result = { error: `Tool execution failed: ${(err as Error).message}` };
        console.error(`[claims-chat] Tool ${toolName} failed:`, err);
      }

      functionResponseParts.push({
        functionResponse: {
          name: toolName,
          response: result,
        },
      });
    }

    // Add function responses back to the conversation
    contents.push({ role: "user", parts: functionResponseParts });
  }

  // If we hit the iteration limit, return whatever we have
  return {
    response: "I've completed my analysis. Let me know if you need anything else.",
    toolsUsed,
  };
}

// ─── Claude Fallback (simple text, no tools) ────────────────────────────

async function claudeFallback(
  message: string,
  analysisContext?: AnalysisContext,
): Promise<string> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) throw new Error("No AI provider available");

  let contextBlock = "";
  if (analysisContext) {
    const a = analysisContext;
    contextBlock += `\n\n--- CURRENT ANALYSIS CONTEXT ---\n`;
    contextBlock += `File: ${a.totalClaims} claims analyzed\n`;
    contextBlock += `Valid: ${a.validClaims} | Rejected: ${a.rejectedClaims ?? a.invalidClaims ?? 0} | Warnings: ${a.warningClaims}\n`;
    contextBlock += `Rejection rate: ${a.rejectionRate ?? "N/A"}%\n`;
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

  const userPrompt = contextBlock ? `${contextBlock}\n\nUser question: ${message}` : message;

  const client = new Anthropic({ apiKey: anthropicKey });
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    system: AGENT_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });
  const block = response.content[0];
  if (block.type === "text") return block.text;
  throw new Error("Unexpected Claude response format");
}

// ─── POST Handler ───────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const auth = await requireClaimsAuth(req, "chat", { limit: 30, windowMs: 60_000 });
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const { message, analysisContext, conversationHistory } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (message.length > 4000) {
      return NextResponse.json({ error: "Message too long (max 4000 characters)" }, { status: 400 });
    }

    // Try Gemini agent (with tools)
    try {
      const result = await runAgent(message, analysisContext, conversationHistory);
      return NextResponse.json({
        response: result.response,
        toolsUsed: result.toolsUsed.length > 0 ? result.toolsUsed : undefined,
      });
    } catch (geminiError) {
      console.warn("[claims-chat] Gemini agent failed, falling back to Claude:", (geminiError as Error).message);

      // Fallback to Claude (simple text response, no tools)
      try {
        const response = await claudeFallback(message, analysisContext);
        return NextResponse.json({ response, fallback: true });
      } catch (claudeError) {
        console.error("[claims-chat] Claude fallback also failed:", (claudeError as Error).message);
        throw claudeError;
      }
    }
  } catch (err) {
    console.error("[claims-chat] Error:", err);
    return NextResponse.json({
      response: "I'm having trouble connecting to the AI service right now. Please try again in a moment.",
    });
  }
}
