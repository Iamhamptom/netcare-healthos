// AI-Powered Advisory Engine for CareOn Bridge
// Uses Gemini 2.5 Flash for: ICD-10 coding from clinical notes,
// scheme-specific rejection prediction, benefits verification, lab trend analysis

import { logger } from "@/lib/logger";
import type { HL7Patient, HL7Diagnosis, HL7Observation, BridgeAdvisory } from "./types";

// ── Types ──

export interface AICodeSuggestion {
  code: string;
  description: string;
  confidence: number;
  reasoning: string;
  isPMB: boolean;
  isCDL: boolean;
  missedByDoctor: boolean;  // true if AI found it but CareOn didn't have it
}

export interface RejectionPrediction {
  probability: number;     // 0-1
  scheme: string;
  reasons: string[];
  preventiveActions: string[];
  historicalRejectionRate: number;
}

export interface BenefitsCheck {
  scheme: string;
  plan: string;
  covered: boolean;
  coveragePercentage: number;
  remainingBenefit: number | null;
  coPayEstimate: number;
  preAuthRequired: boolean;
  preAuthFormId?: string;
  notes: string;
}

export interface LabTrendAnalysis {
  testName: string;
  currentValue: number;
  unit: string;
  trend: "improving" | "stable" | "worsening" | "critical_trajectory";
  projectedValue?: number;
  suggestedDiagnosis?: { code: string; description: string };
  carePathway?: string;
  billingOpportunity?: { code: string; description: string; annualValue: number };
}

export interface EnhancedAdvisory extends BridgeAdvisory {
  aiCodeSuggestions?: AICodeSuggestion[];
  rejectionPrediction?: RejectionPrediction;
  benefitsCheck?: BenefitsCheck;
  labTrends?: LabTrendAnalysis[];
  aiConfidenceScore: number;
  aiModel: string;
  aiProcessingTimeMs: number;
}

// ── Gemini Integration ──

async function callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  // Use the newer @google/genai SDK pattern (consistent with claims/ai-suggestions.ts)
  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.2, // Low temp for medical coding accuracy
      maxOutputTokens: 2048,
    },
  });

  return response.text ?? "";
}

function safeParseJSON<T>(text: string): T | null {
  try {
    // Strip markdown fences if present
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

// ── AI ICD-10 Coding from Clinical Data ──

const CODING_SYSTEM_PROMPT = `You are a South African medical coding expert. Given clinical data extracted from a CareOn/iMedOne hospital EMR (HL7v2 message), analyze the diagnoses and suggest any ADDITIONAL ICD-10-ZA codes the doctor may have missed.

RULES:
1. Use ICD-10-ZA (South African adaptation) with MAXIMUM specificity (4th/5th character)
2. Flag PMB (Prescribed Minimum Benefit) conditions — medical aid MUST pay regardless of plan
3. Flag CDL (Chronic Disease List) conditions — guaranteed chronic coverage
4. Identify MISSED codes: comorbidities implied by lab results, medications, or clinical context that weren't explicitly coded
5. Consider DRG grouping impact — additional codes can significantly affect reimbursement
6. For injuries (S/T codes), suggest external cause codes (V/W/X/Y)
7. Assign confidence 0.0-1.0 based on how certain you are

Respond in JSON ONLY:
{
  "suggestions": [
    {"code": "E11.9", "description": "Type 2 diabetes mellitus", "confidence": 0.92, "reasoning": "HbA1c 8.2% indicates uncontrolled T2DM", "isPMB": true, "isCDL": true, "missedByDoctor": true}
  ],
  "drgImpact": "Adding E11.9 as comorbidity increases DRG weight by ~15%, estimated R22K uplift",
  "warnings": ["Any coding warnings"]
}`;

/** Analyze clinical data and suggest additional ICD-10 codes */
export async function aiSuggestCodes(
  patient: HL7Patient | null,
  diagnoses: HL7Diagnosis[],
  observations: HL7Observation[],
  encounterType: string,
): Promise<AICodeSuggestion[]> {
  const start = Date.now();

  const existingCodes = diagnoses.map((d) => `${d.code} - ${d.description} (${d.type === "F" ? "final" : d.type === "A" ? "admitting" : "working"})`).join("\n");
  const labResults = observations.map((o) => `${o.codeName}: ${o.value} ${o.unit} (ref ${o.referenceRange}, flag ${o.abnormalFlag})`).join("\n");

  const userPrompt = `
PATIENT: ${patient ? `${patient.firstName} ${patient.surname}, ${patient.gender}, DOB ${patient.dateOfBirth}` : "Unknown"}
ENCOUNTER TYPE: ${encounterType}
MEDICAL AID: ${patient?.medicalAidScheme || "Unknown"} ${patient?.medicalAidPlan || ""}

EXISTING DIAGNOSIS CODES FROM CAREON:
${existingCodes || "None captured"}

LAB RESULTS (if available):
${labResults || "No lab data"}

Analyze and suggest any ADDITIONAL or CORRECTED ICD-10-ZA codes.`;

  try {
    const response = await callGemini(CODING_SYSTEM_PROMPT, userPrompt);
    const parsed = safeParseJSON<{ suggestions: AICodeSuggestion[]; drgImpact?: string; warnings?: string[] }>(response);
    return parsed?.suggestions ?? [];
  } catch (err) {
    logger.error("AI code suggestion failed", { error: String(err) });
    return [];
  }
}

// ── Scheme-Specific Rejection Prediction ──

const REJECTION_SYSTEM_PROMPT = `You are a South African medical claims expert. Given a patient's medical aid scheme, plan, diagnosis codes, and procedure type, predict the probability of claim rejection.

YOU KNOW these SA medical aid schemes intimately:
- Discovery Health: Executive, Classic, Smart, KeyCare. Pre-auth required for hospital admissions, MRI/CT, procedures >R5000.
- Bonitas: BonComprehensive, BonEssential, Primary. Strict procedure code requirements. Rejects claims without CPT codes above R50K.
- GEMS: Emerald, Ruby, Onyx, Sapphire. Government scheme, PMB-focused. Good GP coverage, strict specialist referral rules.
- Momentum Health: Ingwe, Evolve, Summit. Pre-auth for all hospital admissions >48h.
- Medscheme administered: Medihelp, Fedhealth, Profmed. Each has unique formulary and pre-auth requirements.

Common rejection reasons:
1. Missing procedure codes (CPT/CCSA)
2. No pre-authorization obtained
3. ICD-10 code specificity insufficient (3-char when 4-char required)
4. Gender/age mismatch on code
5. Duplicate claim
6. Exhausted benefits
7. Non-PMB condition on lower plan
8. Missing referring doctor for specialist

Respond in JSON ONLY:
{
  "probability": 0.35,
  "reasons": ["Missing CPT code for cardiac catheterization"],
  "preventiveActions": ["Add CPT 93458 before submission", "Verify pre-auth reference number"],
  "historicalRejectionRate": 0.18
}`;

/** Predict claim rejection probability for a specific scheme */
export async function predictRejection(
  scheme: string,
  plan: string,
  diagnoses: HL7Diagnosis[],
  encounterType: string,
  estimatedValue: number,
): Promise<RejectionPrediction | null> {
  const codes = diagnoses.map((d) => `${d.code} - ${d.description}`).join(", ");

  const userPrompt = `
SCHEME: ${scheme}
PLAN: ${plan}
DIAGNOSIS CODES: ${codes || "None"}
ENCOUNTER TYPE: ${encounterType}
ESTIMATED CLAIM VALUE: R${estimatedValue.toLocaleString()}

Predict rejection probability and suggest preventive actions.`;

  try {
    const response = await callGemini(REJECTION_SYSTEM_PROMPT, userPrompt);
    const parsed = safeParseJSON<Omit<RejectionPrediction, "scheme">>(response);
    if (!parsed) return null;
    return { ...parsed, scheme };
  } catch (err) {
    logger.error("Rejection prediction failed", { error: String(err) });
    return null;
  }
}

// ── Lab Trend Analysis ──

const LAB_TREND_PROMPT = `You are a clinical analytics expert. Given lab results from a patient, identify concerning trends, suggest diagnoses that should be coded for billing, and recommend care pathways.

Focus on:
1. Patterns suggesting undiagnosed chronic conditions (diabetes, CKD, dyslipidaemia)
2. Worsening trends that need intervention
3. Billing opportunities from chronic disease management (CDL codes, PMB conditions)
4. CDL programme enrollment opportunities (worth R5K-R15K/year per patient in chronic management fees)

Respond in JSON ONLY:
{
  "trends": [
    {
      "testName": "HbA1c",
      "currentValue": 8.2,
      "unit": "%",
      "trend": "worsening",
      "projectedValue": 9.1,
      "suggestedDiagnosis": {"code": "E11.9", "description": "Type 2 diabetes mellitus"},
      "carePathway": "CDL programme enrollment + dietitian referral + 3-monthly HbA1c monitoring",
      "billingOpportunity": {"code": "0191", "description": "Chronic management follow-up", "annualValue": 8400}
    }
  ],
  "overallRisk": "high",
  "summary": "Brief clinical summary"
}`;

/** Analyze lab results for trends and billing opportunities */
export async function analyzeLabTrends(
  patient: HL7Patient | null,
  observations: HL7Observation[],
): Promise<LabTrendAnalysis[]> {
  if (observations.length === 0) return [];

  const results = observations.map((o) =>
    `${o.codeName}: ${o.value} ${o.unit} (ref ${o.referenceRange}, flag ${o.abnormalFlag}, status ${o.status})`
  ).join("\n");

  const userPrompt = `
PATIENT: ${patient ? `${patient.gender}, DOB ${patient.dateOfBirth}` : "Unknown demographics"}
MEDICAL AID: ${patient?.medicalAidScheme || "Unknown"}

LAB RESULTS:
${results}

Analyze trends, suggest diagnoses, and identify billing opportunities.`;

  try {
    const response = await callGemini(LAB_TREND_PROMPT, userPrompt);
    const parsed = safeParseJSON<{ trends: LabTrendAnalysis[] }>(response);
    return parsed?.trends ?? [];
  } catch (err) {
    logger.error("Lab trend analysis failed", { error: String(err) });
    return [];
  }
}

// ── Natural Language Advisory Generator ──

const NL_ADVISORY_PROMPT = `You are a healthcare billing advisor at Netcare. Write a concise, actionable advisory message for the billing team. Be specific about:
- Which forms to use
- Which codes to add
- Which scheme rules apply
- What the financial impact is

Write in 2-3 sentences. Professional, direct, no filler. Reference specific scheme rules and code numbers.`;

/** Generate a natural language advisory summary */
export async function generateNLAdvisory(
  patientName: string,
  scheme: string,
  plan: string,
  diagnoses: HL7Diagnosis[],
  encounterType: string,
  estimatedValue: number,
  aiSuggestions: AICodeSuggestion[],
  rejectionRisk: number,
): Promise<string> {
  const codes = diagnoses.map((d) => `${d.code} (${d.description})`).join(", ");
  const missed = aiSuggestions.filter((s) => s.missedByDoctor).map((s) => `${s.code} (${s.description})`).join(", ");

  const userPrompt = `
PATIENT: ${patientName}
SCHEME: ${scheme} ${plan}
ENCOUNTER: ${encounterType}
DIAGNOSIS CODES: ${codes || "None"}
AI-SUGGESTED ADDITIONAL CODES: ${missed || "None"}
ESTIMATED CLAIM: R${estimatedValue.toLocaleString()}
REJECTION RISK: ${Math.round(rejectionRisk * 100)}%

Write a billing advisory.`;

  try {
    return await callGemini(NL_ADVISORY_PROMPT, userPrompt);
  } catch {
    return "";
  }
}

// ── Anomaly Detection ──

export interface TrafficAnomaly {
  facility: string;
  type: "volume_drop" | "volume_spike" | "error_spike" | "latency_spike";
  severity: "info" | "warning" | "critical";
  message: string;
  currentValue: number;
  expectedValue: number;
  deviationPercent: number;
}

/** Simple anomaly detection on message traffic patterns */
export function detectTrafficAnomalies(
  facilities: { name: string; code: string; connected: boolean; messageCount24h: number }[],
): TrafficAnomaly[] {
  const anomalies: TrafficAnomaly[] = [];
  const counts = facilities.map((f) => f.messageCount24h);
  const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
  const stdDev = Math.sqrt(counts.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / counts.length);

  for (const fac of facilities) {
    const deviation = (fac.messageCount24h - avg) / (stdDev || 1);

    // Volume drop
    if (deviation < -1.5 && fac.messageCount24h < avg * 0.5) {
      anomalies.push({
        facility: fac.name,
        type: "volume_drop",
        severity: fac.connected ? "warning" : "critical",
        message: `Message volume ${Math.round((1 - fac.messageCount24h / avg) * 100)}% below average. ${!fac.connected ? "Facility appears OFFLINE." : "Possible CareOn maintenance or network issue."}`,
        currentValue: fac.messageCount24h,
        expectedValue: Math.round(avg),
        deviationPercent: Math.round((1 - fac.messageCount24h / avg) * 100),
      });
    }

    // Volume spike
    if (deviation > 2 && fac.messageCount24h > avg * 2) {
      anomalies.push({
        facility: fac.name,
        type: "volume_spike",
        severity: "info",
        message: `Message volume ${Math.round((fac.messageCount24h / avg - 1) * 100)}% above average. Possible batch processing or system recovery.`,
        currentValue: fac.messageCount24h,
        expectedValue: Math.round(avg),
        deviationPercent: Math.round((fac.messageCount24h / avg - 1) * 100),
      });
    }
  }

  return anomalies;
}
