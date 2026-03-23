// Motivation Text Classifier — Binary AI Decision
// Uses the LLM as a PURE CLASSIFIER, not a general reasoner.
// Input: a clinical warning + motivation text
// Output: { override: boolean, reason: string }
//
// The LLM never sees patient names, amounts, dates, or BHF numbers.
// Its entire context window is focused on one question:
// "Does this justification satisfy clinical necessity?"

function getGeminiKey(): string | null {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null;
}

interface MotivationDecision {
  override: boolean;
  reason: string;
}

interface MotivationInput {
  procedure: string;      // e.g., "5101" (X-ray)
  diagnosis: string;      // e.g., "M54.5" (back pain)
  motivationText: string; // The doctor's free-text justification
  rule: string;           // e.g., "Imaging for non-specific back pain"
}

/**
 * Classify a clinical motivation text as sufficient or insufficient.
 * Returns { override: true } if the motivation justifies the procedure,
 * or { override: false } if the motivation is weak/irrelevant.
 */
export async function classifyMotivation(input: MotivationInput): Promise<MotivationDecision> {
  const key = getGeminiKey();
  if (!key) {
    // No AI available — default to warning (don't override)
    return { override: false, reason: "AI classification unavailable — manual review required." };
  }

  const prompt = `You are a clinical classifier for South African medical claims.

A validation rule flagged this claim:
- RULE: ${input.rule}
- PROCEDURE: Tariff ${input.procedure}
- DIAGNOSIS: ICD-10 ${input.diagnosis}

The doctor provided this clinical justification:
"${input.motivationText}"

Does this justification provide sufficient clinical necessity for the procedure?

CRITERIA FOR OVERRIDE (return true):
- Trauma or injury mechanism described (fall, accident, assault)
- Red flag symptoms (neurological deficit, fever + back pain, unexplained weight loss)
- Failed conservative treatment mentioned
- Specific clinical finding that warrants the procedure

CRITERIA FOR REJECTION (return false):
- Patient request only ("patient wants an x-ray")
- Vague justification ("for peace of mind", "routine check")
- No clinical reasoning provided
- Justification doesn't relate to the procedure

You MUST respond with ONLY this JSON — no other text:
{"override": true, "reason": "brief explanation"} or {"override": false, "reason": "brief explanation"}`;

  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { temperature: 0, maxOutputTokens: 200 },
    });

    const text = (response.text || "").trim().replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(text);
    return {
      override: parsed.override === true,
      reason: parsed.reason || "No reason provided",
    };
  } catch (err) {
    console.warn("[motivation-classifier] AI classification failed:", (err as Error).message);
    return { override: false, reason: "AI classification failed — defaulting to manual review." };
  }
}

/**
 * Process all claims that need motivation review.
 * Runs AI classification in parallel (batched) for speed.
 */
export async function classifyAllMotivations(
  items: Array<{ lineNumber: number; procedure: string; diagnosis: string; motivationText: string; rule: string }>
): Promise<Map<number, MotivationDecision>> {
  const results = new Map<number, MotivationDecision>();

  if (items.length === 0) return results;

  // Process in parallel batches of 5
  const batchSize = 5;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const decisions = await Promise.all(
      batch.map(item => classifyMotivation(item))
    );
    batch.forEach((item, idx) => {
      results.set(item.lineNumber, decisions[idx]);
    });
  }

  return results;
}
