// Pattern Learning Engine — Learn from historical rejection data
// Analyzes saved ClaimsAnalysis records to identify recurring patterns,
// predict rejection probability, and generate practice-specific insights

import type { ValidationIssue } from "./types";

export interface RejectionPattern {
  icd10Code: string;
  schemeCode: string;
  rejectionRule: string;
  frequency: number;      // How many times this pattern appeared
  lastSeen: string;        // ISO date
  avgClaimValue: number;
  suggestedFix: string;
  confidence: number;      // 0-1 confidence in the pattern
}

export interface PracticeInsight {
  type: "warning" | "improvement" | "benchmark";
  title: string;
  description: string;
  impact: string;          // e.g., "R12,000/month potential savings"
  priority: "high" | "medium" | "low";
}

export interface PredictionResult {
  icd10Code: string;
  predictedRejectionRate: number;  // 0-100
  basedOn: number;                  // number of historical data points
  topRiskFactors: string[];
  recommendation: string;
}

/**
 * Analyze stored analysis results to extract rejection patterns.
 * Call this with data from ClaimsAnalysis.resultJson + topIssuesJson.
 */
export function extractPatterns(
  analyses: { resultJson: string; schemeCode: string; createdAt: string }[],
): RejectionPattern[] {
  const patternMap = new Map<string, RejectionPattern>();

  for (const analysis of analyses) {
    let result: { lineResults?: { claimData?: { primaryICD10?: string; amount?: number }; issues?: ValidationIssue[] }[] };
    try { result = JSON.parse(analysis.resultJson); } catch { continue; }

    if (!result.lineResults) continue;

    for (const lr of result.lineResults) {
      if (!lr.issues || !lr.claimData?.primaryICD10) continue;

      for (const issue of lr.issues) {
        if (issue.severity !== "error") continue;

        const key = `${lr.claimData.primaryICD10}|${analysis.schemeCode}|${issue.rule}`;
        const existing = patternMap.get(key);

        if (existing) {
          existing.frequency++;
          existing.lastSeen = analysis.createdAt;
          existing.avgClaimValue = (existing.avgClaimValue * (existing.frequency - 1) + (lr.claimData.amount || 800)) / existing.frequency;
          existing.confidence = Math.min(0.95, 0.3 + existing.frequency * 0.1);
        } else {
          patternMap.set(key, {
            icd10Code: lr.claimData.primaryICD10,
            schemeCode: analysis.schemeCode,
            rejectionRule: issue.rule,
            frequency: 1,
            lastSeen: analysis.createdAt,
            avgClaimValue: lr.claimData.amount || 800,
            suggestedFix: issue.suggestion || "",
            confidence: 0.3,
          });
        }
      }
    }
  }

  return [...patternMap.values()]
    .sort((a, b) => b.frequency - a.frequency);
}

/**
 * Predict rejection probability for a given ICD-10 code based on historical patterns.
 */
export function predictRejection(
  icd10Code: string,
  schemeCode: string,
  patterns: RejectionPattern[],
): PredictionResult {
  const relevant = patterns.filter(p =>
    p.icd10Code === icd10Code ||
    p.icd10Code.startsWith(icd10Code.substring(0, 3)) // Same category
  );

  if (relevant.length === 0) {
    return {
      icd10Code,
      predictedRejectionRate: 0,
      basedOn: 0,
      topRiskFactors: [],
      recommendation: "No historical data for this code. Ensure it meets standard ICD-10 validation rules.",
    };
  }

  // Exact match patterns
  const exact = relevant.filter(p => p.icd10Code === icd10Code);
  const schemeSpecific = exact.filter(p => p.schemeCode === schemeCode);

  // Calculate weighted rejection probability
  const totalFrequency = relevant.reduce((s, p) => s + p.frequency, 0);
  const exactFrequency = exact.reduce((s, p) => s + p.frequency, 0);
  const schemeFrequency = schemeSpecific.reduce((s, p) => s + p.frequency, 0);

  // Weighted: scheme-specific > exact > category
  let rate = 0;
  if (schemeFrequency > 0) rate = Math.min(95, schemeFrequency * 15);
  else if (exactFrequency > 0) rate = Math.min(80, exactFrequency * 10);
  else rate = Math.min(50, totalFrequency * 5);

  const topRiskFactors = [...new Set(
    relevant
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 3)
      .map(p => p.rejectionRule)
  )];

  const topFix = relevant.sort((a, b) => b.frequency - a.frequency)[0]?.suggestedFix || "";

  return {
    icd10Code,
    predictedRejectionRate: rate,
    basedOn: totalFrequency,
    topRiskFactors,
    recommendation: rate > 50
      ? `High rejection risk (${rate}%). ${topFix || "Review coding carefully before submission."}`
      : rate > 20
        ? `Moderate risk (${rate}%). Common issue: ${topRiskFactors[0] || "specificity"}. ${topFix}`
        : `Low risk (${rate}%). This code generally passes validation.`,
  };
}

/**
 * Generate practice-specific insights by comparing to network averages.
 */
export function generateInsights(
  practicePatterns: RejectionPattern[],
  networkAvgRate: number,
  practiceRate: number,
  practiceTotalClaims: number,
): PracticeInsight[] {
  const insights: PracticeInsight[] = [];

  // Compare to network
  if (practiceRate > networkAvgRate * 1.5) {
    insights.push({
      type: "warning",
      title: "Rejection rate significantly above network average",
      description: `Your rejection rate (${practiceRate}%) is ${Math.round((practiceRate / networkAvgRate - 1) * 100)}% higher than the network average (${networkAvgRate}%).`,
      impact: `Estimated R${Math.round((practiceRate - networkAvgRate) / 100 * practiceTotalClaims * 800).toLocaleString()}/month in preventable rejections`,
      priority: "high",
    });
  } else if (practiceRate < networkAvgRate * 0.7) {
    insights.push({
      type: "benchmark",
      title: "Leading the network in claims accuracy",
      description: `Your rejection rate (${practiceRate}%) is well below the network average (${networkAvgRate}%). Your coding practices are exemplary.`,
      impact: "Consider sharing best practices with other clinics",
      priority: "low",
    });
  }

  // Top recurring issues
  const topIssues = practicePatterns
    .filter(p => p.frequency >= 3)
    .slice(0, 5);

  for (const pattern of topIssues) {
    const monthlyCost = Math.round(pattern.frequency * pattern.avgClaimValue);
    insights.push({
      type: "improvement",
      title: `Recurring: ${pattern.rejectionRule} on ${pattern.icd10Code}`,
      description: `This rejection pattern has occurred ${pattern.frequency} times${pattern.schemeCode ? ` with ${pattern.schemeCode}` : ""}. ${pattern.suggestedFix}`,
      impact: `~R${monthlyCost.toLocaleString()} at risk per batch`,
      priority: pattern.frequency >= 5 ? "high" : "medium",
    });
  }

  // Scheme-specific patterns
  const schemeMap = new Map<string, number>();
  for (const p of practicePatterns) {
    if (p.schemeCode) {
      schemeMap.set(p.schemeCode, (schemeMap.get(p.schemeCode) || 0) + p.frequency);
    }
  }
  const worstScheme = [...schemeMap.entries()].sort((a, b) => b[1] - a[1])[0];
  if (worstScheme && worstScheme[1] >= 5) {
    insights.push({
      type: "warning",
      title: `${worstScheme[0]} has the most rejections`,
      description: `${worstScheme[1]} rejection patterns detected for ${worstScheme[0]}. Consider reviewing ${worstScheme[0]}-specific coding requirements.`,
      impact: "Focus training on this scheme's rules",
      priority: "medium",
    });
  }

  return insights.sort((a, b) => {
    const prio = { high: 0, medium: 1, low: 2 };
    return prio[a.priority] - prio[b.priority];
  });
}
