/**
 * AI Intake Analyzer
 * Takes a medical consultation transcript and extracts structured clinical data.
 * Uses Gemini 2.0 Flash with SA health knowledge base context.
 */

import { chat } from "./gemini";

export interface IntakeSymptom {
  name: string;
  severity: "mild" | "moderate" | "severe";
  duration: string;
  location: string;
  notes: string;
}

export interface IntakeMedication {
  name: string;
  dosage: string;
  frequency: string;
  prescriber: string;
}

export interface IntakeAllergy {
  name: string;
  severity: "mild" | "moderate" | "severe" | "life-threatening";
  reaction: string;
}

export interface IntakeVitals {
  bloodPressureSys?: number;
  bloodPressureDia?: number;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  oxygenSat?: number;
  bloodGlucose?: number;
  respiratoryRate?: number;
  painLevel?: number;
}

export interface ICD10Suggestion {
  code: string;
  description: string;
  confidence: number; // 0-100
}

export interface IntakeAnalysis {
  chiefComplaint: string;
  symptoms: IntakeSymptom[];
  historyOfPresentIllness: string;
  pastMedicalHistory: string[];
  medications: IntakeMedication[];
  allergies: IntakeAllergy[];
  vitalsMentioned: IntakeVitals;
  socialHistory: string;
  familyHistory: string;
  reviewOfSystems: string;
  icd10Suggestions: ICD10Suggestion[];
  redFlags: string[];
  clinicalSummary: string;
  recommendedActions: string[];
}

const SYSTEM_PROMPT = `You are a clinical documentation AI specialist trained on South African healthcare standards.
You extract structured medical data from consultation transcripts.

CRITICAL RULES:
- Use ICD-10 coding (WHO standard used in SA, NOT ICD-10-CM)
- Be accurate — do NOT fabricate information not mentioned in the transcript
- Mark confidence levels honestly
- Flag any red flags or urgent findings
- Use SA medical terminology (e.g., "medical aid" not "insurance", "theatre" not "OR")
- If something is unclear or not mentioned, leave it empty — do not guess

Return a valid JSON object matching this schema exactly:
{
  "chiefComplaint": "single sentence summary of main reason for visit",
  "symptoms": [{"name": "", "severity": "mild|moderate|severe", "duration": "", "location": "", "notes": ""}],
  "historyOfPresentIllness": "narrative paragraph of current illness",
  "pastMedicalHistory": ["condition 1", "condition 2"],
  "medications": [{"name": "", "dosage": "", "frequency": "", "prescriber": ""}],
  "allergies": [{"name": "", "severity": "mild|moderate|severe|life-threatening", "reaction": ""}],
  "vitalsMentioned": {"bloodPressureSys": null, "bloodPressureDia": null, "heartRate": null, "temperature": null, "weight": null, "oxygenSat": null, "bloodGlucose": null, "respiratoryRate": null, "painLevel": null},
  "socialHistory": "smoking, alcohol, occupation etc if mentioned",
  "familyHistory": "family conditions if mentioned",
  "reviewOfSystems": "brief systems review if conducted",
  "icd10Suggestions": [{"code": "M54.5", "description": "Low back pain, unspecified", "confidence": 85}],
  "redFlags": ["any urgent/dangerous findings"],
  "clinicalSummary": "2-3 sentence clinical summary suitable for medical record",
  "recommendedActions": ["suggested next steps based on findings"]
}

Return ONLY the JSON object, no markdown fences, no commentary.`;

export async function analyzeIntakeTranscript(transcript: string): Promise<IntakeAnalysis> {
  const userMessage = `Analyze this medical consultation transcript and extract all structured clinical data:\n\n---\n${transcript}\n---`;

  const response = await chat(
    SYSTEM_PROMPT,
    [{ role: "user", content: userMessage }],
    { temperature: 0.3, maxTokens: 4096 }
  );

  try {
    // Clean response — strip markdown fences if present
    let cleaned = response.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const analysis = JSON.parse(cleaned) as IntakeAnalysis;

    // Validate required fields
    if (!analysis.chiefComplaint) {
      analysis.chiefComplaint = "Not clearly stated in transcript";
    }
    if (!Array.isArray(analysis.symptoms)) analysis.symptoms = [];
    if (!Array.isArray(analysis.medications)) analysis.medications = [];
    if (!Array.isArray(analysis.allergies)) analysis.allergies = [];
    if (!Array.isArray(analysis.icd10Suggestions)) analysis.icd10Suggestions = [];
    if (!Array.isArray(analysis.redFlags)) analysis.redFlags = [];
    if (!Array.isArray(analysis.pastMedicalHistory)) analysis.pastMedicalHistory = [];
    if (!Array.isArray(analysis.recommendedActions)) analysis.recommendedActions = [];
    if (!analysis.vitalsMentioned) analysis.vitalsMentioned = {};

    return analysis;
  } catch {
    // If JSON parsing fails, return a minimal analysis with the raw response as summary
    return {
      chiefComplaint: "Unable to parse — see clinical summary",
      symptoms: [],
      historyOfPresentIllness: "",
      pastMedicalHistory: [],
      medications: [],
      allergies: [],
      vitalsMentioned: {},
      socialHistory: "",
      familyHistory: "",
      reviewOfSystems: "",
      icd10Suggestions: [],
      redFlags: [],
      clinicalSummary: response.substring(0, 500),
      recommendedActions: ["Manual review recommended — AI analysis could not be structured"],
    };
  }
}
