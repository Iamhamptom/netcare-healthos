// Clinical Coder — Consultation Notes → Complete Claim Line
// The feature that replaces the billing clerk's core job:
// Read clinical notes → suggest ICD-10 + tariff + NAPPI → validate → ready to submit

import { GoogleGenAI } from "@google/genai";
import { lookupMIT, codeExistsInMIT } from "./mit-loader";
import { lookupICD10 } from "./icd10-database";
import { lookupTariff } from "./tariff-database";
import { lookupNAPPI } from "./nappi-database";
import { validateClaims } from "./validation-engine";
import type { ClaimLineItem, ValidationResult } from "./types";

export interface ClinicalNote {
  text: string;                    // Free-text consultation notes (SOAP, plain, or structured)
  patientGender?: "M" | "F";
  patientAge?: number;
  patientName?: string;
  practitionerType?: string;       // gp, specialist, physio, etc.
  schemeCode?: string;             // DISC, GEMS, etc.
  dateOfService?: string;
}

export interface CodedClaim {
  primaryICD10: string;
  primaryDescription: string;
  secondaryICD10: string[];
  secondaryDescriptions: string[];
  tariffCode: string;
  tariffDescription: string;
  nappiCode?: string;
  nappiDescription?: string;
  modifier?: string;
  confidence: "high" | "medium" | "low";
  reasoning: string;
  clinicalSummary: string;
}

export interface CodingResult {
  codedClaim: CodedClaim;
  claimLine: ClaimLineItem;
  validation: ValidationResult;
  isClean: boolean;                // true = no errors, ready to submit
  issues: string[];                // human-readable list of any problems
  submissionReady: boolean;
  healthbridgeFormat?: string;     // EDI-compatible format string
}

const SYSTEM_PROMPT = `You are an expert South African medical claims coder. You read clinical consultation notes and produce accurate ICD-10-ZA codes, NHRPL tariff codes, and NAPPI codes for medical scheme claims.

CRITICAL RULES:
1. Use WHO ICD-10 codes (SA variant), NOT ICD-10-CM (US variant)
2. Always code to maximum specificity (4th/5th character where available)
3. S/T injury codes MUST have an accompanying External Cause Code (V/W/X/Y)
4. Asterisk (*) codes CANNOT be primary — use the dagger (†) code as primary
5. PMB conditions must be coded accurately — schemes must cover these
6. Choose the definitive diagnosis code, not symptom codes (R-codes), when a diagnosis is established
7. GP consultations use tariff 0190 (standard), 0191 (follow-up), 0192 (extended >30min)
8. Specialist consultations use tariff 0290 (new), 0291 (follow-up)
9. For dispensed medication, include the NAPPI code (7-digit)

For each consultation, determine:
- Primary ICD-10 code (the main reason for the visit)
- Secondary ICD-10 codes (comorbidities, external causes for injuries)
- Tariff code (the procedure/service performed)
- NAPPI code (if medication was dispensed)
- Modifier (if applicable: 0002=bilateral, 0011=after-hours)

Respond with ONLY valid JSON — no markdown, no commentary:
{
  "primaryICD10": "J06.9",
  "primaryDescription": "Acute upper respiratory infection, unspecified",
  "secondaryICD10": ["Z25.1"],
  "secondaryDescriptions": ["Need for immunization against influenza"],
  "tariffCode": "0190",
  "tariffDescription": "GP consultation — standard",
  "nappiCode": "7048620",
  "nappiDescription": "Amoxicillin 500mg capsules",
  "modifier": null,
  "confidence": "high",
  "reasoning": "Patient presents with acute URTI symptoms (sore throat, runny nose, cough). No bacterial features — viral URTI most likely. Amoxicillin prescribed as empirical antibiotic.",
  "clinicalSummary": "URTI with empirical antibiotic therapy"
}`;

function parseJSON(raw: string): CodedClaim {
  const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const parsed = JSON.parse(cleaned);
  return {
    primaryICD10: String(parsed.primaryICD10 || "").toUpperCase().trim(),
    primaryDescription: String(parsed.primaryDescription || ""),
    secondaryICD10: (parsed.secondaryICD10 || []).map((c: string) => String(c).toUpperCase().trim()),
    secondaryDescriptions: parsed.secondaryDescriptions || [],
    tariffCode: String(parsed.tariffCode || "").trim(),
    tariffDescription: String(parsed.tariffDescription || ""),
    nappiCode: parsed.nappiCode ? String(parsed.nappiCode).trim() : undefined,
    nappiDescription: parsed.nappiDescription || undefined,
    modifier: parsed.modifier || undefined,
    confidence: ["high", "medium", "low"].includes(parsed.confidence) ? parsed.confidence : "medium",
    reasoning: String(parsed.reasoning || ""),
    clinicalSummary: String(parsed.clinicalSummary || ""),
  };
}

/**
 * Code a clinical consultation from free-text notes.
 * Returns a complete, validated, submission-ready claim.
 */
export async function codeFromNotes(note: ClinicalNote): Promise<CodingResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  // Build context for the AI
  const parts: string[] = [`Consultation notes:\n${note.text}`];
  if (note.patientGender) parts.push(`Patient gender: ${note.patientGender === "M" ? "Male" : "Female"}`);
  if (note.patientAge !== undefined) parts.push(`Patient age: ${note.patientAge} years`);
  if (note.practitionerType) parts.push(`Practitioner: ${note.practitionerType}`);
  if (note.schemeCode) parts.push(`Medical scheme: ${note.schemeCode}`);

  const userPrompt = parts.join("\n") + "\n\nGenerate the complete claim coding as JSON.";

  // Call AI
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: userPrompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.1, // Low temp for accurate coding
      maxOutputTokens: 2048,
    },
  });

  const text = response.text;
  if (!text) throw new Error("Empty AI response");

  const codedClaim = parseJSON(text);

  // ── Validate codes against MIT (41K) ──
  const mitPrimary = lookupMIT(codedClaim.primaryICD10);
  if (!mitPrimary) {
    // AI hallucinated a code — try to find a close match
    codedClaim.confidence = "low";
    codedClaim.reasoning += " [WARNING: Primary code not found in SA MIT — verify manually]";
  }

  // ── Build claim line ──
  const claimLine: ClaimLineItem = {
    lineNumber: 1,
    patientName: note.patientName,
    patientGender: note.patientGender || "U",
    patientAge: note.patientAge,
    primaryICD10: codedClaim.primaryICD10,
    secondaryICD10: codedClaim.secondaryICD10.length > 0 ? codedClaim.secondaryICD10 : undefined,
    tariffCode: codedClaim.tariffCode,
    nappiCode: codedClaim.nappiCode,
    modifier: codedClaim.modifier,
    practitionerType: note.practitionerType,
    dateOfService: note.dateOfService || new Date().toISOString().split("T")[0],
    amount: undefined, // Practice fills in their rate
  };

  // ── Validate through the full engine ──
  const validation = validateClaims([claimLine]);
  const lr = validation.lineResults[0];
  const errors = lr?.issues.filter(i => i.severity === "error") || [];
  const warnings = lr?.issues.filter(i => i.severity === "warning") || [];
  const isClean = errors.length === 0;

  const issues: string[] = [];
  for (const e of errors) issues.push(`ERROR: ${e.message}`);
  for (const w of warnings) issues.push(`WARNING: ${w.message}`);

  // ── Generate Healthbridge EDI format ──
  const hbLine = [
    note.dateOfService || new Date().toISOString().split("T")[0].replace(/-/g, ""),
    codedClaim.primaryICD10,
    codedClaim.secondaryICD10[0] || "",
    codedClaim.secondaryICD10[1] || "",
    codedClaim.secondaryICD10[2] || "",
    codedClaim.tariffCode,
    codedClaim.nappiCode || "",
    codedClaim.modifier || "",
    "1", // quantity
    "", // amount (practice fills in)
  ].join(",");

  return {
    codedClaim,
    claimLine,
    validation,
    isClean,
    issues,
    submissionReady: isClean,
    healthbridgeFormat: `DATE,ICD10_1,ICD10_2,ICD10_3,ICD10_4,TARIFF_CODE,NAPPI_CODE,MODIFIER,QTY,AMOUNT\n${hbLine}`,
  };
}

/**
 * Batch code multiple consultations.
 */
export async function batchCodeFromNotes(notes: ClinicalNote[]): Promise<CodingResult[]> {
  const results: CodingResult[] = [];
  for (const note of notes) {
    try {
      results.push(await codeFromNotes(note));
    } catch (error) {
      results.push({
        codedClaim: {
          primaryICD10: "", primaryDescription: "CODING FAILED",
          secondaryICD10: [], secondaryDescriptions: [],
          tariffCode: "", tariffDescription: "",
          confidence: "low",
          reasoning: `AI coding failed: ${error instanceof Error ? error.message : "unknown error"}`,
          clinicalSummary: note.text.substring(0, 100),
        },
        claimLine: { lineNumber: results.length + 1, primaryICD10: "", patientGender: "U" },
        validation: { totalClaims: 1, validClaims: 0, invalidClaims: 1, warningClaims: 0, issues: [], summary: { errorCount: 1, warningCount: 0, infoCount: 0, byRule: {}, estimatedRejectionRate: 100, estimatedSavings: 0, topIssues: [] }, lineResults: [] },
        isClean: false,
        issues: ["CODING FAILED — requires manual coding"],
        submissionReady: false,
      });
    }
  }
  return results;
}
