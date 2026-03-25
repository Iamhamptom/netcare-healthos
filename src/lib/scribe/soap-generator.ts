import { chat } from "../gemini";
import type { ScribeAnalysis } from "./types";

const SYSTEM_PROMPT = `You are a clinical documentation AI specialist trained on South African healthcare standards.
You generate structured SOAP notes from medical consultation transcripts.

SOAP FORMAT:
- S (Subjective): Patient reported symptoms, concerns, history in their own words. Chief complaint, HPI, PMH, social/family history.
- O (Objective): Observable and measurable findings. Vitals, physical exam, test results.
- A (Assessment): Clinical assessment, differential diagnoses. Use ICD-10 WHO codes (NOT ICD-10-CM).
- P (Plan): Treatment plan, prescriptions with dosages, referrals, investigations, follow-up.

CRITICAL RULES:
- Use ICD-10 coding (WHO standard used in SA, NOT ICD-10-CM)
- Use SA medical terminology ("medical aid" not "insurance", "theatre" not "OR", "Panado" not "Tylenol")
- Be accurate - do NOT fabricate information not in the transcript
- If something is not mentioned, leave the section brief or empty
- Mark confidence levels honestly on ICD-10 codes

Return a valid JSON object matching this schema exactly:
{
  "soap": { "subjective": "...", "objective": "...", "assessment": "...", "plan": "..." },
  "icd10Codes": [{"code": "G43.9", "description": "Migraine, unspecified", "confidence": 85}],
  "redFlags": ["any urgent findings"],
  "chiefComplaint": "single sentence summary",
  "medications": [{"name": "", "dosage": "", "frequency": ""}],
  "allergies": [{"name": "", "severity": "mild|moderate|severe", "reaction": ""}],
  "vitalsMentioned": {"bloodPressureSys": null, "bloodPressureDia": null, "heartRate": null, "temperature": null, "painLevel": null, "oxygenSat": null}
}

Return ONLY the JSON object, no markdown fences, no commentary.`;

export async function generateSOAP(
  transcript: string,
  patientContext?: string
): Promise<ScribeAnalysis> {
  let userMessage = "Generate a SOAP note from this consultation transcript:\n\n---\n" + transcript + "\n---";

  if (patientContext) {
    userMessage += "\n\nPrevious consultation context for this patient:\n" + patientContext;
  }

  const response = await chat(
    SYSTEM_PROMPT,
    [{ role: "user", content: userMessage }],
    { temperature: 0.3, maxTokens: 4096 }
  );

  try {
    let cleaned = response.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const result = JSON.parse(cleaned) as ScribeAnalysis;

    if (!result.soap) {
      result.soap = { subjective: "", objective: "", assessment: "", plan: "" };
    }
    if (!result.icd10Codes) result.icd10Codes = [];
    if (!result.redFlags) result.redFlags = [];
    if (!result.chiefComplaint) result.chiefComplaint = "Not clearly stated";
    if (!result.medications) result.medications = [];
    if (!result.allergies) result.allergies = [];
    if (!result.vitalsMentioned) result.vitalsMentioned = {};

    return result;
  } catch {
    return {
      soap: {
        subjective: "Unable to parse - see transcript",
        objective: "",
        assessment: response.substring(0, 300),
        plan: "Manual review recommended",
      },
      icd10Codes: [],
      redFlags: [],
      chiefComplaint: "Parse error - review transcript",
      medications: [],
      allergies: [],
      vitalsMentioned: {},
    };
  }
}
