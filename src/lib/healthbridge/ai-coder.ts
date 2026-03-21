// AI-powered ICD-10 coding assistant — the feature NO SA PMS has
// Uses Gemini to suggest ICD-10 codes from clinical notes
// This is the #1 differentiator from GoodX, Healthbridge Nova, and Elixir

import { COMMON_ICD10, COMMON_CPT } from "./codes";
import { isPMBCondition, isCDLCondition } from "./pmb";

export interface ICD10Suggestion {
  code: string;
  description: string;
  confidence: "high" | "medium" | "low";
  isPMB: boolean;
  isCDL: boolean;
  cdlCondition?: string;
  reasoning: string;
}

export interface CodingSuggestion {
  icd10Codes: ICD10Suggestion[];
  cptCodes: { code: string; description: string; estimatedTariff: number; reasoning: string }[];
  clinicalSummary: string;
  warnings: string[];
}

const SYSTEM_PROMPT = `You are a South African medical coding expert. Given clinical notes from a consultation, suggest the most appropriate ICD-10-ZA codes and CPT/CCSA tariff codes.

RULES:
1. Always code to MAXIMUM specificity (4th/5th character level). E.g., use J06.9 not J06.
2. Use SA-specific ICD-10 codes (ICD-10-ZA).
3. Suggest CPT codes from the SA CCSA/SAMA code set (4-digit numeric).
4. Flag if any diagnosis is a PMB (Prescribed Minimum Benefit) — medical aid MUST pay.
5. Flag if any diagnosis is on the CDL (Chronic Disease List) — guaranteed chronic coverage.
6. Consider clinical context: symptoms, examination findings, investigations, management.
7. If uncertain between codes, suggest all reasonable options with confidence levels.

Common CPT codes:
- 0190: GP consultation
- 0191: GP follow-up
- 0193: Extended consultation (>30 min)
- 0141: Specialist consultation
- 0308: ECG
- 0312: Spirometry
- 0382: Blood glucose POC
- 0400: Wound suturing
- 1101: IM injection
- 8101: Dental examination
- 8201: Scale & polish

Respond in JSON format ONLY:
{
  "icd10Codes": [{"code": "I10", "description": "Essential hypertension", "confidence": "high", "reasoning": "BP 160/100 documented"}],
  "cptCodes": [{"code": "0190", "description": "GP consultation", "estimatedTariff": 520, "reasoning": "Standard consultation"}],
  "clinicalSummary": "Brief summary of clinical encounter",
  "warnings": ["Any coding warnings or considerations"]
}`;

/** Suggest ICD-10 and CPT codes from clinical notes using Gemini AI */
export async function suggestCodes(clinicalNotes: string): Promise<CodingSuggestion> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return fallbackSuggestion(clinicalNotes);
  }

  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${SYSTEM_PROMPT}\n\nClinical Notes:\n${clinicalNotes}`,
      config: {
        temperature: 0.2,
        maxOutputTokens: 2000,
      },
    });

    const text = response.text || "";
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return fallbackSuggestion(clinicalNotes);
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      icd10Codes?: { code: string; description: string; confidence?: string; reasoning?: string }[];
      cptCodes?: { code: string; description: string; estimatedTariff?: number; reasoning?: string }[];
      clinicalSummary?: string;
      warnings?: string[];
    };

    // Enrich with PMB/CDL data
    const icd10Codes: ICD10Suggestion[] = (parsed.icd10Codes || []).map((c) => {
      const cdl = isCDLCondition(c.code);
      return {
        code: c.code,
        description: c.description,
        confidence: (c.confidence as "high" | "medium" | "low") || "medium",
        isPMB: isPMBCondition(c.code),
        isCDL: cdl.found,
        cdlCondition: cdl.condition,
        reasoning: c.reasoning || "",
      };
    });

    return {
      icd10Codes,
      cptCodes: (parsed.cptCodes || []).map((c) => ({
        code: c.code,
        description: c.description,
        estimatedTariff: c.estimatedTariff || 0,
        reasoning: c.reasoning || "",
      })),
      clinicalSummary: parsed.clinicalSummary || "",
      warnings: parsed.warnings || [],
    };
  } catch (err) {
    console.error("AI coding error:", err);
    return fallbackSuggestion(clinicalNotes);
  }
}

/** Keyword-based fallback when Gemini is unavailable */
function fallbackSuggestion(notes: string): CodingSuggestion {
  const lower = notes.toLowerCase();
  const icd10Codes: ICD10Suggestion[] = [];
  const cptCodes: { code: string; description: string; estimatedTariff: number; reasoning: string }[] = [];

  // Keyword matching for common conditions
  const keywords: { terms: string[]; code: string; desc: string }[] = [
    { terms: ["hypertension", "high blood pressure", "bp elevated", "bp 1"], code: "I10", desc: "Essential hypertension" },
    { terms: ["diabetes", "diabetic", "blood sugar", "glucose high", "hba1c"], code: "E11.9", desc: "Type 2 diabetes mellitus" },
    { terms: ["asthma", "wheeze", "wheezing", "bronchospasm"], code: "J45.9", desc: "Asthma" },
    { terms: ["upper respiratory", "urti", "common cold", "sore throat", "pharyngitis"], code: "J06.9", desc: "Acute upper respiratory infection" },
    { terms: ["bronchitis", "productive cough", "chest infection"], code: "J20.9", desc: "Acute bronchitis" },
    { terms: ["sinusitis", "sinus"], code: "J32.9", desc: "Chronic sinusitis" },
    { terms: ["urinary tract", "uti", "dysuria", "burning urine"], code: "N39.0", desc: "Urinary tract infection" },
    { terms: ["back pain", "lower back", "lumbar", "lumbago"], code: "M54.5", desc: "Low back pain" },
    { terms: ["gastritis", "epigastric", "heartburn", "reflux", "gerd"], code: "K29.7", desc: "Gastritis" },
    { terms: ["headache", "cephalgia", "migraine"], code: "R51", desc: "Headache" },
    { terms: ["fever", "pyrexia", "temperature"], code: "R50.9", desc: "Fever" },
    { terms: ["cholesterol", "lipid", "hyperlipid"], code: "E78.5", desc: "Hyperlipidaemia" },
    { terms: ["otitis", "ear infection", "ear pain"], code: "H66.9", desc: "Otitis media" },
    { terms: ["dermatitis", "eczema", "rash", "skin"], code: "L30.9", desc: "Dermatitis" },
    { terms: ["dental", "tooth", "caries", "cavity"], code: "K02.9", desc: "Dental caries" },
    { terms: ["immunization", "vaccination", "vaccine"], code: "Z23", desc: "Immunization" },
    { terms: ["general exam", "check-up", "checkup", "routine", "wellness"], code: "Z00.0", desc: "General examination" },
  ];

  for (const kw of keywords) {
    if (kw.terms.some((t) => {
      const idx = lower.indexOf(t);
      if (idx === -1) return false;
      // Negation-aware: find the clause boundary (sentence or comma) then check for negation
      // Look back to the nearest sentence/clause break (. , ; :) or start of string
      const beforeMatch = lower.slice(0, idx);
      const breaks = [
        beforeMatch.lastIndexOf(". "),
        beforeMatch.lastIndexOf(", "),
        beforeMatch.lastIndexOf("; "),
        beforeMatch.lastIndexOf(": "),
      ].filter((i) => i >= 0).map((i) => i + 2);
      const clauseStart = breaks.length > 0 ? Math.max(...breaks) : 0;
      // Include trailing space so negation words at end of clause are caught
      const clause = lower.slice(clauseStart, idx);
      const negations = ["no ", "not ", "denies ", "denied ", "without ", "absent ", "negative for ", "rules out ", "ruled out ", "unlikely ", "no evidence of "];
      if (negations.some((neg) => clause.includes(neg))) return false;
      return true;
    })) {
      const cdl = isCDLCondition(kw.code);
      icd10Codes.push({
        code: kw.code,
        description: kw.desc,
        confidence: "medium",
        isPMB: isPMBCondition(kw.code),
        isCDL: cdl.found,
        cdlCondition: cdl.condition,
        reasoning: `Matched keywords in clinical notes`,
      });
    }
  }

  // Suggest default CPT
  if (lower.includes("follow") || lower.includes("review")) {
    cptCodes.push({ code: "0191", description: "GP follow-up consultation", estimatedTariff: 360, reasoning: "Follow-up visit indicated" });
  } else {
    cptCodes.push({ code: "0190", description: "GP consultation", estimatedTariff: 520, reasoning: "Standard consultation" });
  }

  // If no ICD-10 matched, suggest general exam
  if (icd10Codes.length === 0) {
    icd10Codes.push({
      code: "Z00.0", description: "General examination", confidence: "low",
      isPMB: false, isCDL: false, reasoning: "No specific condition keywords detected — defaulting to general exam",
    });
  }

  return {
    icd10Codes,
    cptCodes,
    clinicalSummary: "AI suggestion based on keyword matching (Gemini unavailable)",
    warnings: ["Using keyword fallback — connect Gemini API for AI-powered coding accuracy"],
  };
}
