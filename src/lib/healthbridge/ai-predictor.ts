// AI Rejection Predictor — predict claim rejection before submission
// Uses Gemini AI + SA medical aid scheme rules to flag high-risk claims
// Falls back to rule-based scoring when Gemini is unavailable

import { COMMON_CPT, MEDICAL_AID_SCHEMES, isValidICD10 } from "./codes";
import { isPMBCondition, isCDLCondition } from "./pmb";
import type { ClaimSubmission } from "./types";

export interface RejectionPrediction {
  probability: number; // 0-100
  risk: "low" | "medium" | "high";
  factors: { factor: string; impact: "positive" | "negative"; detail: string }[];
  recommendations: string[];
  alternativeCodes?: { current: string; suggested: string; reason: string }[];
}

const PREDICTOR_PROMPT = `You are a South African medical aid claims rejection prediction engine. Given a claim's details, predict the probability of rejection (0-100) and explain why.

CONSIDER THESE SA-SPECIFIC FACTORS:
1. Scheme-specific tariff compliance — does the charged amount match the scheme's NHRPL/tariff rate?
2. ICD-10 / CPT code matching — does the diagnosis justify the procedure?
3. Pre-authorization requirements — specialist procedures, hospital admissions, MRI, CT, scope procedures need pre-auth
4. Benefit limit exhaustion — out-of-hospital benefits, savings accounts, day-to-day limits
5. PMB/CDL status — if this is a PMB condition, rejection risk is lower (schemes MUST pay)
6. Membership validity — GEMS requires 9-digit membership numbers
7. Late submission — claims >4 months from date of service get rejected
8. Duplicate detection risk — same patient + date + procedure
9. Modifier compliance — after-hours (0002), emergency (0001) modifiers
10. Place of service vs procedure alignment

Respond in JSON format ONLY:
{
  "probability": 25,
  "risk": "low",
  "factors": [
    {"factor": "PMB condition", "impact": "positive", "detail": "Hypertension is a CDL condition — scheme must cover"}
  ],
  "recommendations": ["Ensure chronic authorization number is included"],
  "alternativeCodes": [{"current": "J06", "suggested": "J06.9", "reason": "Code to maximum specificity"}]
}`;

/** Predict rejection probability for a claim before submission */
export async function predictRejection(claim: ClaimSubmission): Promise<RejectionPrediction> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return fallbackPrediction(claim);
  }

  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    const claimSummary = buildClaimSummary(claim);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${PREDICTOR_PROMPT}\n\nClaim Details:\n${claimSummary}`,
      config: {
        temperature: 0.2,
        maxOutputTokens: 2000,
      },
    });

    const text = response.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return fallbackPrediction(claim);
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      probability?: number;
      risk?: string;
      factors?: { factor: string; impact: string; detail: string }[];
      recommendations?: string[];
      alternativeCodes?: { current: string; suggested: string; reason: string }[];
    };

    const probability = Math.max(0, Math.min(100, parsed.probability || 50));

    return {
      probability,
      risk: (parsed.risk as "low" | "medium" | "high") || riskFromProbability(probability),
      factors: (parsed.factors || []).map((f) => ({
        factor: f.factor,
        impact: (f.impact as "positive" | "negative") || "negative",
        detail: f.detail,
      })),
      recommendations: parsed.recommendations || [],
      alternativeCodes: parsed.alternativeCodes,
    };
  } catch (err) {
    console.error("AI predictor error:", err);
    return fallbackPrediction(claim);
  }
}

/** Build a text summary of claim data for the AI prompt */
function buildClaimSummary(claim: ClaimSubmission): string {
  const lines = [
    `Scheme: ${claim.medicalAidScheme}`,
    `Membership Number: ${claim.membershipNumber}`,
    `Dependent Code: ${claim.dependentCode}`,
    `Date of Service: ${claim.dateOfService}`,
    `Place of Service: ${claim.placeOfService}`,
    `Authorization Number: ${claim.authorizationNumber || "NONE"}`,
    `Provider: ${claim.treatingProvider}`,
    `Referring Provider: ${claim.referringProvider || "NONE"}`,
    "",
    "Line Items:",
  ];

  for (const item of claim.lineItems) {
    const tariffInfo = COMMON_CPT[item.cptCode];
    const tariffNote = tariffInfo ? ` (2026 tariff: R${(tariffInfo.tariff2026 / 100).toFixed(2)})` : "";
    lines.push(
      `  ICD-10: ${item.icd10Code} | CPT: ${item.cptCode} | Amount: R${(item.amount / 100).toFixed(2)}${tariffNote} | Qty: ${item.quantity} | ${item.description}`
    );
    if (item.modifiers?.length) {
      lines.push(`    Modifiers: ${item.modifiers.join(", ")}`);
    }
  }

  return lines.join("\n");
}

/** Determine risk level from probability */
function riskFromProbability(probability: number): "low" | "medium" | "high" {
  if (probability <= 30) return "low";
  if (probability <= 60) return "medium";
  return "high";
}

/** Rule-based fallback scoring when Gemini is unavailable */
function fallbackPrediction(claim: ClaimSubmission): RejectionPrediction {
  let riskScore = 10; // Base risk
  const factors: RejectionPrediction["factors"] = [];
  const recommendations: string[] = [];
  const alternativeCodes: { current: string; suggested: string; reason: string }[] = [];

  // Check each line item
  for (const item of claim.lineItems) {
    // +20 risk if no authorization on specialist codes
    const specialistCodes = ["0141", "0142", "0143", "0144"];
    if (specialistCodes.includes(item.cptCode) && !claim.authorizationNumber) {
      riskScore += 20;
      factors.push({
        factor: "No authorization for specialist procedure",
        impact: "negative",
        detail: `CPT ${item.cptCode} is a specialist code — most schemes require pre-authorization`,
      });
      recommendations.push("Obtain pre-authorization number before submitting specialist claims");
    }

    // +15 risk if amount exceeds common tariff by >50%
    const tariffInfo = COMMON_CPT[item.cptCode];
    if (tariffInfo) {
      const expectedTariff = tariffInfo.tariff2026;
      const chargedAmount = item.amount;
      if (chargedAmount > expectedTariff * 1.5) {
        riskScore += 15;
        const overchargePercent = Math.round(((chargedAmount - expectedTariff) / expectedTariff) * 100);
        factors.push({
          factor: "Amount exceeds scheme tariff",
          impact: "negative",
          detail: `CPT ${item.cptCode} charged at R${(chargedAmount / 100).toFixed(2)} — ${overchargePercent}% above 2026 tariff of R${(expectedTariff / 100).toFixed(2)}`,
        });
        recommendations.push(`Consider aligning CPT ${item.cptCode} charge to scheme tariff rate to avoid short-payment`);
      }
    }

    // +10 risk if ICD-10 not at max specificity (missing decimal)
    if (isValidICD10(item.icd10Code) && !item.icd10Code.includes(".")) {
      riskScore += 10;
      factors.push({
        factor: "ICD-10 code not at maximum specificity",
        impact: "negative",
        detail: `${item.icd10Code} should be coded to 4th/5th character level for maximum specificity`,
      });
      alternativeCodes.push({
        current: item.icd10Code,
        suggested: `${item.icd10Code}.9`,
        reason: "Add .9 for 'unspecified' to meet maximum specificity requirements",
      });
    }

    // -20 risk if PMB condition detected
    if (isPMBCondition(item.icd10Code)) {
      riskScore -= 20;
      factors.push({
        factor: "PMB condition detected",
        impact: "positive",
        detail: `${item.icd10Code} is a Prescribed Minimum Benefit — scheme MUST cover treatment`,
      });
    }

    // -10 risk if CDL with chronic authorization
    const cdl = isCDLCondition(item.icd10Code);
    if (cdl.found && claim.authorizationNumber) {
      riskScore -= 10;
      factors.push({
        factor: "CDL condition with chronic authorization",
        impact: "positive",
        detail: `${cdl.condition} is on the Chronic Disease List — guaranteed medication coverage with authorization`,
      });
    }
  }

  // +10 risk if GEMS and membership not 9 digits
  if (
    claim.medicalAidScheme.toUpperCase().includes("GEMS") &&
    claim.membershipNumber.replace(/\D/g, "").length !== 9
  ) {
    riskScore += 10;
    factors.push({
      factor: "GEMS membership number format",
      impact: "negative",
      detail: `GEMS requires 9-digit membership numbers — provided: ${claim.membershipNumber}`,
    });
    recommendations.push("Verify GEMS membership number is exactly 9 digits");
  }

  // Check for late submission (>4 months)
  const dosDate = new Date(claim.dateOfService);
  const now = new Date();
  const daysSinceDOS = Math.floor((now.getTime() - dosDate.getTime()) / 86400000);
  if (daysSinceDOS > 120) {
    riskScore += 25;
    factors.push({
      factor: "Late submission risk",
      impact: "negative",
      detail: `Date of service was ${daysSinceDOS} days ago — claims >4 months old are typically rejected`,
    });
    recommendations.push("Submit immediately — claim is at risk of late submission rejection");
  } else if (daysSinceDOS > 90) {
    riskScore += 10;
    factors.push({
      factor: "Approaching late submission deadline",
      impact: "negative",
      detail: `Date of service was ${daysSinceDOS} days ago — deadline approaching`,
    });
    recommendations.push("Submit soon to avoid late submission rejection");
  }

  // Check if scheme is known
  if (!MEDICAL_AID_SCHEMES[claim.medicalAidScheme]) {
    riskScore += 5;
    factors.push({
      factor: "Unrecognised scheme",
      impact: "negative",
      detail: `"${claim.medicalAidScheme}" is not in the known schemes database — verify spelling and switch routing`,
    });
    recommendations.push("Double-check scheme name spelling and confirm switch routing");
  }

  // Clamp score
  const probability = Math.max(0, Math.min(100, riskScore));

  if (factors.length === 0) {
    factors.push({
      factor: "Standard claim profile",
      impact: "positive",
      detail: "No significant risk factors detected in rule-based analysis",
    });
  }

  return {
    probability,
    risk: riskFromProbability(probability),
    factors,
    recommendations: recommendations.length > 0
      ? recommendations
      : ["Claim looks good for submission — proceed with standard workflow"],
    alternativeCodes: alternativeCodes.length > 0 ? alternativeCodes : undefined,
  };
}
