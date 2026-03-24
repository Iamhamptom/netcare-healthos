/**
 * RAG v3 Query Expander — Netcare Health OS
 * Implements RAG Fusion (multiple query variants) and HyDE (hypothetical document embedding).
 * Uses Gemini for LLM-based expansion, with deterministic fallbacks.
 */

// ── RAG Fusion: Multiple query variants ───────────────────────────

/**
 * Expand a single query into 3-5 variants for RAG Fusion.
 * Uses LLM to generate semantically diverse reformulations.
 * Falls back to deterministic expansion if LLM is unavailable.
 *
 * @param query Original user query
 * @returns Array of query variants (always includes original)
 */
export async function expandQuery(query: string): Promise<string[]> {
  const variants = [query]; // Always include original

  // Try LLM expansion
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const llmVariants = await llmExpandQuery(query, apiKey);
      variants.push(...llmVariants);
      return Array.from(new Set(variants)).slice(0, 5);
    } catch (err) {
      console.warn("[RAG v3 QueryExpander] LLM expansion failed, using deterministic:", err);
    }
  }

  // Deterministic fallback
  variants.push(...deterministicExpand(query));
  return Array.from(new Set(variants)).slice(0, 5);
}

/**
 * Generate a hypothetical document that would answer the query (HyDE).
 * The embedding of this document is often closer to relevant chunks
 * than the embedding of the original query.
 *
 * @param query Original user query
 * @returns A hypothetical document string
 */
export async function generateHypotheticalDoc(query: string): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Deterministic fallback: construct a pseudo-document from the query
    return deterministicHyDE(query);
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a South African healthcare claims expert. Write a concise knowledge base article (150-250 words) that would perfectly answer this query. Use specific SA healthcare terminology (ICD-10-ZA, CCSA tariffs, NAPPI codes, scheme names, PMBs, CDL). Be factual and technical.

Query: "${query}"

Article:`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 400,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini HyDE ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (text.length > 50) {
      return text.slice(0, 1200); // Cap at ~300 tokens
    }

    return deterministicHyDE(query);
  } catch (err) {
    console.warn("[RAG v3 HyDE] Failed, using deterministic:", err);
    return deterministicHyDE(query);
  }
}

// ── LLM-based query expansion ─────────────────────────────────────

async function llmExpandQuery(query: string, apiKey: string): Promise<string[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `You are a search query reformulator for a South African healthcare claims knowledge base.
Given the user's query, generate 3 alternative search queries that:
1. Use different terminology but seek the same information
2. Include SA-specific healthcare terms where relevant
3. Vary between specific and broader formulations

Query: "${query}"

Return ONLY a JSON array of 3 strings. No explanation.
Example: ["query variant 1", "query variant 2", "query variant 3"]`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 256,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini expand ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Could not parse expansion JSON");
  }

  const variants: string[] = JSON.parse(jsonMatch[0]);
  return variants.filter((v) => typeof v === "string" && v.length > 5);
}

// ── Deterministic expansion (no LLM needed) ──────────────────────

function deterministicExpand(query: string): string[] {
  const variants: string[] = [];

  // Expand ICD-10 codes with "diagnosis code"
  for (const code of query.toUpperCase().match(/\b[A-Z]\d{2}\.?\d{0,2}\b/g) || []) {
    variants.push(`ICD-10 diagnosis code ${code} description treatment`);
  }

  // Expand scheme names with "medical scheme rules"
  for (const scheme of query.match(
    /\b(Discovery|GEMS|Bonitas|Momentum|Medshield|Bestmed|Medihelp)\b/gi
  ) || []) {
    variants.push(`${scheme} medical scheme rules guidelines`);
  }

  // Expand clinical terms
  if (/\b(reject|denial|decline)\b/i.test(query)) {
    variants.push("claims rejection reasons resolution fixes");
    variants.push("common rejection codes and how to resolve them");
  }

  if (/\b(cdl|chronic)\b/i.test(query)) {
    variants.push("chronic disease list CDL conditions treatment pairs");
  }

  if (/\b(pmb|prescribed minimum)\b/i.test(query)) {
    variants.push("prescribed minimum benefits PMB regulations conditions");
  }

  if (/\b(tariff|fee|rate|price)\b/i.test(query)) {
    variants.push("CCSA tariff rates procedure fees discipline");
  }

  if (/\b(nappi|medicine|drug|medication)\b/i.test(query)) {
    variants.push("NAPPI code medicine price SEP dispensing");
  }

  if (/\b(pre.?auth|authoris|authoriz)\b/i.test(query)) {
    variants.push("prior authorization pre-auth requirements medical scheme");
  }

  if (/\b(fraud|waste|abuse)\b/i.test(query)) {
    variants.push("healthcare fraud detection billing abuse patterns");
  }

  // If no specific expansions, add generic reformulations
  if (variants.length === 0) {
    // Broader version
    const terms = query.split(/\s+/).filter((t) => t.length > 3);
    if (terms.length >= 2) {
      variants.push(terms.join(" ") + " South African healthcare");
      variants.push(terms.slice(0, 3).join(" ") + " medical claims");
    }
  }

  return variants;
}

function deterministicHyDE(query: string): string {
  // Construct a pseudo-document that contains the query terms
  // in a context that mimics a knowledge base article
  const lines = [
    `South African Healthcare Claims Knowledge Base Entry`,
    ``,
    `Topic: ${query}`,
    ``,
    `This section covers ${query.toLowerCase()} within the South African healthcare claims ecosystem.`,
  ];

  // Add domain-specific context based on detected patterns
  if (/icd/i.test(query)) {
    lines.push(
      "ICD-10-ZA is the official diagnosis coding system used in South Africa, based on WHO ICD-10."
    );
    lines.push(
      "Valid primary diagnosis codes must have Valid_ICD10_Primary flag set. Codes may have asterisk/dagger conventions."
    );
  }

  if (/tariff/i.test(query)) {
    lines.push(
      "CCSA 4-digit tariff codes are used for procedure billing. No national tariff has existed since 2010."
    );
    lines.push(
      "Rates vary by discipline (GP, specialist, allied) and are negotiated per scheme."
    );
  }

  if (/scheme|discovery|gems|bonitas/i.test(query)) {
    lines.push(
      "Medical schemes in South Africa operate under the Medical Schemes Act 131 of 1998."
    );
    lines.push(
      "Each scheme has specific formularies, networks, authorization requirements, and benefit structures."
    );
  }

  if (/reject/i.test(query)) {
    lines.push(
      "The most common rejection reason is incorrect or missing ICD-10 codes, accounting for approximately 30% of all rejections."
    );
    lines.push(
      "Other frequent causes include authorization failures, benefit exhaustion, and coding mismatches."
    );
  }

  if (/pmb|cdl|chronic/i.test(query)) {
    lines.push(
      "Prescribed Minimum Benefits cover 270 Diagnosis-Treatment Pairs and 27 Chronic Disease List conditions."
    );
    lines.push(
      "PMBs must be paid in full at Designated Service Providers, overriding waiting periods and benefit limits."
    );
  }

  return lines.join("\n");
}
