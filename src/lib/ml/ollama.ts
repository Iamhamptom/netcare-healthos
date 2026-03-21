// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Ollama Medical LLM Integration
// Connects Med42 (8B) and MedLlama2 for SA healthcare-specific AI tasks:
// - ICD-10 code suggestion with SA coding standards
// - Clinical validation reasoning
// - Rejection prediction with scheme-specific knowledge
// - PMB condition analysis
// - Fraud pattern explanation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

// Model selection by task
const MODELS = {
  /** HealthOS Med — VisioCorp fine-tuned model (primary for ALL tasks) */
  clinical: "healthos-med:latest",
  /** HealthOS Med — also primary for knowledge Q&A */
  knowledge: "healthos-med:latest",
  /** HealthOS Med — also primary for reasoning (falls back to qwen3 if needed) */
  reasoning: "healthos-med:latest",
} as const;

/** Fallback models if healthos-med is not available */
const FALLBACK_MODELS = {
  clinical: "thewindmom/llama3-med42-8b:latest",
  knowledge: "medllama2:latest",
  reasoning: "qwen3:8b",
} as const;

type ModelRole = keyof typeof MODELS;

// ─── Types ──────────────────────────────────────────────────────────────────

export interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
  totalDuration?: number;
  evalCount?: number;
}

export interface MedicalCodingSuggestion {
  code: string;
  description: string;
  confidence: number;
  reasoning: string;
  isPMB: boolean;
  isCDL: boolean;
  genderRestriction?: "M" | "F";
}

export interface RejectionPrediction {
  willReject: boolean;
  probability: number;
  likelyCode: string;
  likelyReason: string;
  preventionSteps: string[];
}

// ─── Core Ollama Interface ──────────────────────────────────────────────────

/**
 * Check if Ollama is running and accessible.
 */
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get list of available models from Ollama.
 */
export async function getAvailableModels(): Promise<string[]> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!response.ok) return [];
    const data = await response.json() as { models: { name: string }[] };
    return data.models.map(m => m.name);
  } catch {
    return [];
  }
}

/**
 * Generate a completion from Ollama.
 */
async function generate(
  model: string,
  prompt: string,
  system?: string,
  options?: { temperature?: number; maxTokens?: number },
): Promise<string> {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      system: system || "",
      stream: false,
      options: {
        temperature: options?.temperature ?? 0.3,
        num_predict: options?.maxTokens ?? 1024,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama generate error: ${response.status}`);
  }

  const data = await response.json() as OllamaResponse;
  return data.response;
}

/**
 * Select the best model for a task, with fallback.
 */
async function selectModel(role: ModelRole): Promise<string> {
  const preferred = MODELS[role];
  const available = await getAvailableModels();

  // Try primary (healthos-med)
  if (available.some(m => m.includes(preferred.split(":")[0]))) return preferred;

  // Try role-specific fallback
  const fallback = FALLBACK_MODELS[role];
  if (available.some(m => m.includes(fallback.split(":")[0]))) return fallback;

  // Try any available model
  for (const fb of Object.values(FALLBACK_MODELS)) {
    if (available.some(m => m.includes(fb.split(":")[0]))) return fb;
  }

  throw new Error("No Ollama models available. Run: ollama pull healthos-med");
}

// ─── Medical AI Tasks ───────────────────────────────────────────────────────

const SA_CODING_SYSTEM = `You are a South African medical coding expert. You use:
- ICD-10-ZA (WHO variant, NOT US ICD-10-CM)
- CCSA 4-digit tariff codes (NOT American CPT)
- NAPPI codes for pharmaceuticals (7-digit + 3-digit pack)
- SA Medical Schemes Act rules for PMBs and CDL conditions
- 27 CDL chronic conditions with formulary requirements
- 270 DTPs as Prescribed Minimum Benefits
Always respond with valid JSON. No markdown fences.`;

/**
 * Suggest ICD-10 codes for a clinical description using Med42.
 */
export async function suggestICD10Codes(
  clinicalDescription: string,
  context?: { patientAge?: number; patientGender?: string; existingCodes?: string[] },
): Promise<MedicalCodingSuggestion[]> {
  const model = await selectModel("clinical");

  const prompt = `Given this clinical description, suggest the most appropriate ICD-10-ZA codes.

Clinical description: "${clinicalDescription}"
${context?.patientAge ? `Patient age: ${context.patientAge}` : ""}
${context?.patientGender ? `Patient gender: ${context.patientGender}` : ""}
${context?.existingCodes?.length ? `Existing codes: ${context.existingCodes.join(", ")}` : ""}

Respond with JSON array: [{"code": "X00.0", "description": "...", "confidence": 0.95, "reasoning": "...", "isPMB": false, "isCDL": false}]
Return up to 5 suggestions ordered by confidence.`;

  const response = await generate(model, prompt, SA_CODING_SYSTEM, { temperature: 0.2 });

  try {
    const cleaned = response.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]);
  } catch {
    return [];
  }
}

/**
 * Predict whether a claim will be rejected, using medical domain knowledge.
 */
export async function predictRejection(data: {
  icd10Code: string;
  tariffCode: string;
  scheme: string;
  amount: number;
  patientAge?: number;
  patientGender?: string;
  hasPreAuth?: boolean;
}): Promise<RejectionPrediction> {
  const model = await selectModel("reasoning");

  const prompt = `Analyze this SA medical aid claim for rejection risk.

Claim details:
- ICD-10: ${data.icd10Code}
- Tariff code: ${data.tariffCode}
- Scheme: ${data.scheme}
- Amount: R${(data.amount / 100).toFixed(2)}
${data.patientAge ? `- Patient age: ${data.patientAge}` : ""}
${data.patientGender ? `- Gender: ${data.patientGender}` : ""}
- Pre-auth: ${data.hasPreAuth ? "Yes" : "No"}

Based on SA medical scheme rejection patterns, assess:
1. Will this claim likely be rejected?
2. What rejection code is most likely?
3. What can be done to prevent rejection?

Respond with JSON: {"willReject": false, "probability": 0.15, "likelyCode": "05", "likelyReason": "...", "preventionSteps": ["..."]}`;

  const response = await generate(model, prompt, SA_CODING_SYSTEM, { temperature: 0.1 });

  try {
    const cleaned = response.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { willReject: false, probability: 0, likelyCode: "", likelyReason: "", preventionSteps: [] };
    return JSON.parse(jsonMatch[0]);
  } catch {
    return { willReject: false, probability: 0, likelyCode: "", likelyReason: "", preventionSteps: [] };
  }
}

/**
 * Analyze a PMB condition using medical knowledge.
 */
export async function analyzePMBCondition(icd10Code: string, clinicalContext?: string): Promise<{
  isPMB: boolean;
  category: string;
  treatmentProtocol: string;
  schemeObligations: string;
  reasoning: string;
}> {
  const model = await selectModel("knowledge");

  const prompt = `Analyze ICD-10 code "${icd10Code}" under the SA Medical Schemes Act PMB rules.
${clinicalContext ? `Clinical context: ${clinicalContext}` : ""}

Determine:
1. Is this a Prescribed Minimum Benefit condition?
2. Which PMB category (DTP, CDL, or emergency)?
3. What treatment protocol must the scheme follow?
4. What are the scheme's legal obligations?

Respond with JSON: {"isPMB": true, "category": "DTP Category 2 — Cardiovascular", "treatmentProtocol": "...", "schemeObligations": "...", "reasoning": "..."}`;

  const response = await generate(model, prompt, SA_CODING_SYSTEM, { temperature: 0.2 });

  try {
    const cleaned = response.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { isPMB: false, category: "", treatmentProtocol: "", schemeObligations: "", reasoning: "Unable to analyze" };
    return JSON.parse(jsonMatch[0]);
  } catch {
    return { isPMB: false, category: "", treatmentProtocol: "", schemeObligations: "", reasoning: "Parse error" };
  }
}

/**
 * Explain a fraud detection flag in clinical terms.
 */
export async function explainFraudFlag(flag: {
  type: string;
  description: string;
  evidence: string;
}): Promise<string> {
  const model = await selectModel("reasoning");

  const prompt = `A fraud detection system flagged this claim pattern. Explain it in clear clinical terms for a practice manager:

Flag type: ${flag.type}
Description: ${flag.description}
Evidence: ${flag.evidence}

Provide a 2-3 sentence explanation that a non-technical person can understand. Include what they should check and what action to take.`;

  return generate(model, prompt, undefined, { temperature: 0.3, maxTokens: 256 });
}
