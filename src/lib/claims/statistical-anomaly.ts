// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Statistical Anomaly Detection — Layer 2 of the Neuro-Symbolic Funnel
//
// This layer runs AFTER deterministic rules (Layer 1) and BEFORE AI reasoning.
// It analyzes the ENTIRE batch holistically — looking for patterns that no
// single-claim rule can catch.
//
// Based on SA market data:
// - Average GP practice: 15-25 claims/day
// - Average rejection rate: 15-25% nationally
// - Top rejection causes: missing codes (30%), specificity (20%), duplicates (15%)
// - Average claim value: R400-R800 for GP, R1,200-R3,000 for specialist
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { ClaimLineItem, ValidationIssue } from "./types";

// ─── SA Market Benchmarks ────────────────────────────────────────────────────

const SA_BENCHMARKS = {
  // Daily volume benchmarks by practice type
  dailyVolume: {
    gp: { normal: 25, high: 40, suspicious: 60 },
    specialist: { normal: 15, high: 25, suspicious: 40 },
    pathology: { normal: 50, high: 100, suspicious: 200 },
  },
  // Average claim values by tariff prefix (Rands)
  avgClaimValue: {
    "01": { mean: 500, stdDev: 200, max: 1500 },    // GP consults
    "02": { mean: 1200, stdDev: 500, max: 4000 },   // Specialist consults
    "04": { mean: 3000, stdDev: 2000, max: 15000 },  // Surgery
    "05": { mean: 5000, stdDev: 3000, max: 30000 },  // Major surgery
    "45": { mean: 800, stdDev: 400, max: 3000 },     // Pathology
    "51": { mean: 600, stdDev: 300, max: 2500 },     // Radiology
  },
  // Typical diagnosis frequency — percentage of claims using this code
  commonDiagnoses: new Set([
    "J06.9", "J03.9", "J02.9", "J01.9", "J20.9",  // URI, tonsillitis, pharyngitis
    "I10", "E11.9", "J45.9",                         // Hypertension, diabetes, asthma (CDL)
    "M54.5", "M54.9",                                 // Back pain
    "K21.0", "K30",                                    // GERD, dyspepsia
    "N39.0",                                           // UTI
    "R51", "R10.4",                                    // Headache, abdominal pain
    "L30.9", "B35.9",                                  // Dermatitis, fungal
  ]),
  // SA rejection rate benchmarks (Council for Medical Schemes data)
  rejectionRates: {
    excellent: 5,    // < 5% = excellent practice
    good: 10,        // 5-10% = well-managed
    average: 20,     // 10-20% = industry average
    poor: 30,        // 20-30% = needs improvement
    critical: 30,    // > 30% = major billing issues
  },
};

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AnomalyInsight {
  type: "practice" | "patient" | "billing" | "clinical" | "temporal" | "market";
  severity: "info" | "warning" | "error";
  title: string;
  description: string;
  affectedLines: number[];
  metric?: { value: number; benchmark: number; unit: string };
}

// ─── Main Analysis Function ────────────────────────────────────────────────

export function detectAnomalies(lines: ClaimLineItem[]): {
  anomalies: AnomalyInsight[];
  batchProfile: BatchProfile;
} {
  const anomalies: AnomalyInsight[] = [];
  const profile = buildBatchProfile(lines);

  // ── 1. Practice Volume Analysis ──
  analyzeVolume(lines, profile, anomalies);

  // ── 2. Patient Concentration ──
  analyzePatientConcentration(lines, profile, anomalies);

  // ── 3. Billing Pattern Analysis ──
  analyzeBillingPatterns(lines, profile, anomalies);

  // ── 4. Temporal Patterns ──
  analyzeTemporalPatterns(lines, profile, anomalies);

  // ── 5. Clinical Plausibility ──
  analyzeClinicalPlausibility(lines, profile, anomalies);

  // ── 6. SA Market Context ──
  analyzeMarketContext(lines, profile, anomalies);

  return { anomalies, batchProfile: profile };
}

// ─── Batch Profile ─────────────────────────────────────────────────────────

interface BatchProfile {
  totalClaims: number;
  uniquePatients: number;
  uniquePractices: number;
  uniqueDiagnoses: number;
  dateRange: { earliest: string; latest: string; spanDays: number };
  totalValue: number;
  avgClaimValue: number;
  medianClaimValue: number;
  claimsPerPatient: number;
  claimsPerDay: Map<string, number>;
  diagnosisDistribution: Map<string, number>;
  tariffDistribution: Map<string, number>;
  practiceDistribution: Map<string, number>;
}

function buildBatchProfile(lines: ClaimLineItem[]): BatchProfile {
  const patients = new Set<string>();
  const practices = new Set<string>();
  const diagnoses = new Map<string, number>();
  const tariffs = new Map<string, number>();
  const practiceCount = new Map<string, number>();
  const daysCount = new Map<string, number>();
  const amounts: number[] = [];
  let earliest = "9999-12-31";
  let latest = "0000-01-01";

  for (const line of lines) {
    if (line.patientName) patients.add(line.patientName.toLowerCase());
    if (line.practiceNumber) {
      practices.add(line.practiceNumber);
      practiceCount.set(line.practiceNumber, (practiceCount.get(line.practiceNumber) || 0) + 1);
    }
    if (line.primaryICD10) diagnoses.set(line.primaryICD10, (diagnoses.get(line.primaryICD10) || 0) + 1);
    if (line.tariffCode) tariffs.set(line.tariffCode, (tariffs.get(line.tariffCode) || 0) + 1);
    if (line.dateOfService) {
      daysCount.set(line.dateOfService, (daysCount.get(line.dateOfService) || 0) + 1);
      if (line.dateOfService < earliest) earliest = line.dateOfService;
      if (line.dateOfService > latest) latest = line.dateOfService;
    }
    if (line.amount && line.amount > 0) amounts.push(line.amount);
  }

  amounts.sort((a, b) => a - b);
  const totalValue = amounts.reduce((s, a) => s + a, 0);

  return {
    totalClaims: lines.length,
    uniquePatients: patients.size,
    uniquePractices: practices.size,
    uniqueDiagnoses: diagnoses.size,
    dateRange: {
      earliest,
      latest,
      spanDays: earliest !== "9999-12-31" ? Math.max(1, Math.floor((new Date(latest).getTime() - new Date(earliest).getTime()) / 86400000)) : 0,
    },
    totalValue,
    avgClaimValue: amounts.length > 0 ? totalValue / amounts.length : 0,
    medianClaimValue: amounts.length > 0 ? amounts[Math.floor(amounts.length / 2)] : 0,
    claimsPerPatient: patients.size > 0 ? lines.length / patients.size : 0,
    claimsPerDay: daysCount,
    diagnosisDistribution: diagnoses,
    tariffDistribution: tariffs,
    practiceDistribution: practiceCount,
  };
}

// ─── Analysis Functions ────────────────────────────────────────────────────

function analyzeVolume(lines: ClaimLineItem[], profile: BatchProfile, anomalies: AnomalyInsight[]) {
  // Check daily claim volume per practice
  const practiceDaily = new Map<string, Map<string, number>>();
  for (const line of lines) {
    if (!line.practiceNumber || !line.dateOfService) continue;
    const key = line.practiceNumber;
    if (!practiceDaily.has(key)) practiceDaily.set(key, new Map());
    const dayMap = practiceDaily.get(key)!;
    dayMap.set(line.dateOfService, (dayMap.get(line.dateOfService) || 0) + 1);
  }

  for (const [practice, dayMap] of practiceDaily) {
    for (const [date, count] of dayMap) {
      if (count > SA_BENCHMARKS.dailyVolume.gp.suspicious) {
        const affectedLines = lines.filter(l => l.practiceNumber === practice && l.dateOfService === date).map(l => l.lineNumber);
        anomalies.push({
          type: "practice",
          severity: "warning",
          title: "Unusually High Daily Volume",
          description: `Practice ${practice} submitted ${count} claims on ${date}. The SA average for a GP practice is ${SA_BENCHMARKS.dailyVolume.gp.normal}/day. This could indicate batch billing or a high-volume day.`,
          affectedLines,
          metric: { value: count, benchmark: SA_BENCHMARKS.dailyVolume.gp.normal, unit: "claims/day" },
        });
      }
    }
  }
}

function analyzePatientConcentration(lines: ClaimLineItem[], profile: BatchProfile, anomalies: AnomalyInsight[]) {
  // Patient with too many claims in one batch
  const patientClaims = new Map<string, number[]>();
  for (const line of lines) {
    if (!line.patientName) continue;
    const key = line.patientName.toLowerCase();
    if (!patientClaims.has(key)) patientClaims.set(key, []);
    patientClaims.get(key)!.push(line.lineNumber);
  }

  for (const [patient, lineNums] of patientClaims) {
    if (lineNums.length >= 8) {
      anomalies.push({
        type: "patient",
        severity: "warning",
        title: "High Patient Claim Frequency",
        description: `Patient "${patient}" has ${lineNums.length} claims in this batch. This may indicate a complex case, chronic care, or potential over-servicing.`,
        affectedLines: lineNums,
        metric: { value: lineNums.length, benchmark: 3, unit: "claims/patient" },
      });
    }
  }

  // Single patient dominating the batch
  if (profile.uniquePatients > 0) {
    const maxPatientClaims = Math.max(...[...patientClaims.values()].map(l => l.length));
    const concentration = maxPatientClaims / lines.length;
    if (concentration > 0.15 && maxPatientClaims > 10) {
      anomalies.push({
        type: "patient",
        severity: "info",
        title: "Patient Concentration",
        description: `A single patient accounts for ${Math.round(concentration * 100)}% of all claims in this batch (${maxPatientClaims}/${lines.length}).`,
        affectedLines: [],
      });
    }
  }
}

function analyzeBillingPatterns(lines: ClaimLineItem[], profile: BatchProfile, anomalies: AnomalyInsight[]) {
  // Check for round-number amounts (suspicious — real claims rarely have exact round amounts)
  const roundAmounts = lines.filter(l => l.amount && l.amount > 100 && l.amount % 100 === 0);
  if (roundAmounts.length > lines.length * 0.3 && roundAmounts.length >= 5) {
    anomalies.push({
      type: "billing",
      severity: "info",
      title: "Frequent Round Amounts",
      description: `${roundAmounts.length} claims (${Math.round(roundAmounts.length / lines.length * 100)}%) have exact round amounts (R500, R1000, etc.). Real claims typically have specific Rand/cent values from tariff schedules.`,
      affectedLines: roundAmounts.map(l => l.lineNumber),
    });
  }

  // Check for amount clustering (many claims with exact same amount)
  const amountCounts = new Map<number, number[]>();
  for (const line of lines) {
    if (!line.amount) continue;
    if (!amountCounts.has(line.amount)) amountCounts.set(line.amount, []);
    amountCounts.get(line.amount)!.push(line.lineNumber);
  }
  for (const [amount, lineNums] of amountCounts) {
    if (lineNums.length >= 10 && lineNums.length > lines.length * 0.1) {
      anomalies.push({
        type: "billing",
        severity: "info",
        title: "Amount Clustering",
        description: `${lineNums.length} claims have the exact same amount (R${amount.toFixed(2)}). This is common for standard tariff rates but worth reviewing if the diagnoses are diverse.`,
        affectedLines: lineNums.slice(0, 20),
      });
    }
  }

  // Average claim value vs SA benchmarks
  if (profile.avgClaimValue > 0) {
    const gpBenchmark = SA_BENCHMARKS.avgClaimValue["01"];
    if (profile.avgClaimValue > gpBenchmark.mean + 3 * gpBenchmark.stdDev) {
      anomalies.push({
        type: "billing",
        severity: "warning",
        title: "Batch Average Significantly Above Benchmark",
        description: `Average claim value R${profile.avgClaimValue.toFixed(2)} is significantly above the SA GP benchmark of R${gpBenchmark.mean}. This may indicate upcoding or specialist-level billing.`,
        affectedLines: [],
        metric: { value: profile.avgClaimValue, benchmark: gpBenchmark.mean, unit: "R" },
      });
    }
  }
}

function analyzeTemporalPatterns(lines: ClaimLineItem[], profile: BatchProfile, anomalies: AnomalyInsight[]) {
  // Claims clustered on specific dates (batch billing pattern)
  const maxDayClaims = Math.max(...[...profile.claimsPerDay.values()]);
  if (maxDayClaims > 30 && profile.claimsPerDay.size <= 3) {
    anomalies.push({
      type: "temporal",
      severity: "info",
      title: "Claims Concentrated on Few Dates",
      description: `${lines.length} claims span only ${profile.claimsPerDay.size} unique dates, with up to ${maxDayClaims} on a single day. This is typical of monthly batch submissions.`,
      affectedLines: [],
    });
  }

  // Weekend/holiday billing
  const weekendClaims: number[] = [];
  for (const line of lines) {
    if (!line.dateOfService) continue;
    const day = new Date(line.dateOfService).getDay();
    if (day === 0 || day === 6) weekendClaims.push(line.lineNumber);
  }
  if (weekendClaims.length > lines.length * 0.2 && weekendClaims.length >= 5) {
    anomalies.push({
      type: "temporal",
      severity: "info",
      title: "High Weekend Billing",
      description: `${weekendClaims.length} claims (${Math.round(weekendClaims.length / lines.length * 100)}%) are for weekend dates. This is normal for emergency practices but unusual for standard GP/specialist practices.`,
      affectedLines: weekendClaims.slice(0, 20),
    });
  }
}

function analyzeClinicalPlausibility(lines: ClaimLineItem[], profile: BatchProfile, anomalies: AnomalyInsight[]) {
  // Diagnosis diversity — too few unique diagnoses for many patients
  if (profile.uniquePatients > 10 && profile.uniqueDiagnoses <= 3) {
    anomalies.push({
      type: "clinical",
      severity: "warning",
      title: "Low Diagnosis Diversity",
      description: `${profile.uniquePatients} patients but only ${profile.uniqueDiagnoses} unique diagnoses. A healthy practice typically has diverse diagnoses. This could indicate template billing.`,
      affectedLines: [],
      metric: { value: profile.uniqueDiagnoses, benchmark: Math.min(profile.uniquePatients, 15), unit: "unique diagnoses" },
    });
  }

  // Single diagnosis dominating
  for (const [diag, count] of profile.diagnosisDistribution) {
    const pct = count / lines.length;
    if (pct > 0.4 && count > 20) {
      anomalies.push({
        type: "clinical",
        severity: "info",
        title: "Dominant Diagnosis",
        description: `"${diag}" accounts for ${Math.round(pct * 100)}% of all claims (${count}/${lines.length}). ${
          SA_BENCHMARKS.commonDiagnoses.has(diag)
            ? "This is a common SA diagnosis — likely normal for a GP practice."
            : "This is not a typical high-frequency diagnosis — review for potential upcoding."
        }`,
        affectedLines: lines.filter(l => l.primaryICD10 === diag).map(l => l.lineNumber).slice(0, 10),
      });
    }
  }

  // Age-diagnosis plausibility — children with adult conditions, etc.
  const implausible: number[] = [];
  for (const line of lines) {
    if (!line.patientAge || !line.primaryICD10) continue;
    const code = line.primaryICD10;
    // Children (<12) with hypertension, diabetes, or chronic conditions
    if (line.patientAge < 12 && (code.startsWith("I10") || code.startsWith("E11") || code.startsWith("M54"))) {
      implausible.push(line.lineNumber);
    }
    // Very elderly (>90) with pregnancy codes
    if (line.patientAge > 90 && code.startsWith("O")) {
      implausible.push(line.lineNumber);
    }
  }
  if (implausible.length > 0) {
    anomalies.push({
      type: "clinical",
      severity: "warning",
      title: "Age-Diagnosis Implausibility",
      description: `${implausible.length} claims have clinically implausible age-diagnosis combinations (e.g., child with hypertension, elderly with pregnancy code).`,
      affectedLines: implausible,
    });
  }
}

function analyzeMarketContext(lines: ClaimLineItem[], profile: BatchProfile, anomalies: AnomalyInsight[]) {
  // SA market context — what does this batch tell us about the practice?
  const claimsPerDay = profile.dateRange.spanDays > 0 ? lines.length / profile.dateRange.spanDays : lines.length;

  // Practice health assessment
  let practiceHealth = "unknown";
  if (claimsPerDay <= SA_BENCHMARKS.dailyVolume.gp.normal) practiceHealth = "normal";
  else if (claimsPerDay <= SA_BENCHMARKS.dailyVolume.gp.high) practiceHealth = "busy";
  else practiceHealth = "very high volume";

  anomalies.push({
    type: "market",
    severity: "info",
    title: "SA Market Context",
    description: `Batch profile: ${profile.totalClaims} claims over ${profile.dateRange.spanDays || 1} days (${Math.round(claimsPerDay)}/day). ${profile.uniquePatients} unique patients, R${Math.round(profile.totalValue).toLocaleString()} total value. Practice volume: ${practiceHealth}. SA industry average rejection rate: 15-25%.`,
    affectedLines: [],
    metric: { value: claimsPerDay, benchmark: SA_BENCHMARKS.dailyVolume.gp.normal, unit: "claims/day" },
  });

  // Scheme distribution analysis
  const schemes = new Map<string, number>();
  for (const line of lines) {
    if (line.scheme) schemes.set(line.scheme, (schemes.get(line.scheme) || 0) + 1);
  }
  if (schemes.size > 0) {
    const schemeList = [...schemes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    anomalies.push({
      type: "market",
      severity: "info",
      title: "Scheme Distribution",
      description: `Claims by scheme: ${schemeList.map(([s, c]) => `${s} (${c})`).join(", ")}. ${schemes.size > 5 ? `+${schemes.size - 5} more.` : ""}`,
      affectedLines: [],
    });
  }
}
