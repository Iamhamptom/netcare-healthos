// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Per-Scheme Tariff Rate Tables — South African Medical Schemes
// Allows comparing billed amounts against expected scheme rates.
//
// Sources:
//   - GEMS Non-Contracted Tariff File 2026 (docs/knowledge/databases/GEMS_tariffs_2026.csv)
//   - Scheme intelligence profiles (src/lib/claims/scheme-intelligence.ts)
//   - Discovery Health Rate (DHR) schedules, Medprax dual-tariff data
//   - Profmed Rand Conversion Factors 2024/2025 (ppsha.co.za)
//   - ECIPA Healthcare 2024 GP Tariffs (ecipahealthcare.com)
//   - Medinol GP Consultation Codes reference
//   - CMS Annual Reports, HealthMan comparative tariffs
//
// NOTE: Since the NHRPL was declared null (2010), each scheme sets its own
// tariff. These are non-contracted / "scheme rate" amounts. Contracted
// (network) rates may differ. Rates are VAT-inclusive where applicable.
//
// Rates are updated annually. This file reflects 2026 tariff year.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SchemeTariffRate {
  scheme: string;
  tariffCode: string;
  description: string;
  rate: number; // Rands (VAT-inclusive)
  year: number;
}

export type ComparisonStatus =
  | "within_range"
  | "above_rate"
  | "significantly_above"
  | "below_rate"
  | "unknown";

export interface SchemeRateComparison {
  schemeRate: number | null;
  ratio: number | null; // billed / scheme rate
  status: ComparisonStatus;
}

// ─── Scheme Codes ─────────────────────────────────────────────────────────────

export const SCHEME_CODES = {
  DISCOVERY: "DH",
  GEMS: "GEMS",
  BONITAS: "BON",
  MOMENTUM: "MH",
  MEDSHIELD: "MS",
  BESTMED: "BM",
} as const;

export type SchemeCode = (typeof SCHEME_CODES)[keyof typeof SCHEME_CODES];

// ─── Tariff Code Descriptions ─────────────────────────────────────────────────

export const TARIFF_DESCRIPTIONS: Record<string, string> = {
  "0190": "GP consultation — average duration/complexity (~15 min)",
  "0191": "GP consultation — moderately above average (~30 min)",
  "0192": "GP consultation — long duration/high complexity (~45 min)",
  "0193": "GP consultation — extended high complexity (46–60 min)",
  "0141": "Specialist consultation — new/established patient",
  "0142": "Specialist follow-up consultation",
  "4518": "Urine dipstick test",
  "3710": "Chest X-ray (PA view)",
  "5101": "X-ray — standard single view",
  "8101": "Dental scale and polish",
};

// ─── Rate Database ────────────────────────────────────────────────────────────
//
// Derivation methodology:
//
// GEMS: Consultation codes (0190-0193) are published in a separate GP
//       consultative services schedule. Procedure/path/radiology codes from
//       the non-contracted tariff CSV (discipline 014 = GP column).
//       GEMS pays ~90% of market rates. 2026 increase: ~5.5%.
//
// Discovery (DHR): Pays 100% of their own Discovery Health Rate. DHR is
//       generally the highest scheme rate in the market. GP consult baseline
//       R520 per scheme-intelligence.ts. 2026 DHR increase: ~5.4%.
//
// Bonitas: Administered by Medscheme (→Momentum Health Solutions from June
//       2026). Pays ~95% of market. 2025 increase: 5.2%. 2026: ~5.8%.
//
// Momentum: Own administration. Pays ~95% of market. GP consult R480 base.
//       2026 increase: ~6%.
//
// Medshield: Self-administered. Pays ~95% of market. Fast processing.
//       2026 increase: ~5.5%.
//
// Bestmed: Self-administered. Pays 100% of their rate (close to DHR).
//       2026 increase: ~5.2%.
//

export const SCHEME_TARIFF_RATES: SchemeTariffRate[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DISCOVERY HEALTH (DH) — 2026 DHR (Discovery Health Rate)
  // Highest payer in market. ~3.8M lives. 100% of DHR for in-network.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  { scheme: "DH", tariffCode: "0190", description: "GP consultation Level 1", rate: 520.00, year: 2026 },
  { scheme: "DH", tariffCode: "0191", description: "GP consultation Level 2", rate: 680.00, year: 2026 },
  { scheme: "DH", tariffCode: "0192", description: "GP consultation Level 3", rate: 890.00, year: 2026 },
  { scheme: "DH", tariffCode: "0193", description: "GP consultation Level 4", rate: 1120.00, year: 2026 },
  { scheme: "DH", tariffCode: "0141", description: "Specialist consultation", rate: 936.00, year: 2026 },
  { scheme: "DH", tariffCode: "0142", description: "Specialist follow-up", rate: 620.00, year: 2026 },
  { scheme: "DH", tariffCode: "4518", description: "Urine dipstick", rate: 165.00, year: 2026 },
  { scheme: "DH", tariffCode: "3710", description: "Chest X-ray", rate: 110.00, year: 2026 },
  { scheme: "DH", tariffCode: "5101", description: "X-ray single view", rate: 910.00, year: 2026 },
  { scheme: "DH", tariffCode: "8101", description: "Dental scale & polish", rate: 780.00, year: 2026 },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GEMS — 2026 GEMS Tariff (Non-Contracted)
  // Government scheme. ~2M lives. Generally lower tariffs.
  // Procedure rates from GEMS_tariffs_2026.csv (discipline 014 = GP).
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  { scheme: "GEMS", tariffCode: "0190", description: "GP consultation Level 1", rate: 430.00, year: 2026 },
  { scheme: "GEMS", tariffCode: "0191", description: "GP consultation Level 2", rate: 560.00, year: 2026 },
  { scheme: "GEMS", tariffCode: "0192", description: "GP consultation Level 3", rate: 740.00, year: 2026 },
  { scheme: "GEMS", tariffCode: "0193", description: "GP consultation Level 4", rate: 930.00, year: 2026 },
  { scheme: "GEMS", tariffCode: "0141", description: "Specialist consultation", rate: 688.00, year: 2026 },
  { scheme: "GEMS", tariffCode: "0142", description: "Specialist follow-up", rate: 480.00, year: 2026 },
  { scheme: "GEMS", tariffCode: "4518", description: "Urine dipstick", rate: 152.60, year: 2026 },
  { scheme: "GEMS", tariffCode: "3710", description: "Chest X-ray", rate: 97.40, year: 2026 },
  { scheme: "GEMS", tariffCode: "5101", description: "X-ray single view", rate: 837.40, year: 2026 },
  { scheme: "GEMS", tariffCode: "8101", description: "Dental scale & polish", rate: 640.00, year: 2026 },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BONITAS (BON) — 2026 Fund Tariff
  // ~731K beneficiaries. Administered by Medscheme (→Momentum from Jun 2026).
  // 2026 increase ~5.8% over 2025. 14 plan options.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  { scheme: "BON", tariffCode: "0190", description: "GP consultation Level 1", rate: 470.00, year: 2026 },
  { scheme: "BON", tariffCode: "0191", description: "GP consultation Level 2", rate: 615.00, year: 2026 },
  { scheme: "BON", tariffCode: "0192", description: "GP consultation Level 3", rate: 810.00, year: 2026 },
  { scheme: "BON", tariffCode: "0193", description: "GP consultation Level 4", rate: 1020.00, year: 2026 },
  { scheme: "BON", tariffCode: "0141", description: "Specialist consultation", rate: 799.00, year: 2026 },
  { scheme: "BON", tariffCode: "0142", description: "Specialist follow-up", rate: 545.00, year: 2026 },
  { scheme: "BON", tariffCode: "4518", description: "Urine dipstick", rate: 148.00, year: 2026 },
  { scheme: "BON", tariffCode: "3710", description: "Chest X-ray", rate: 98.00, year: 2026 },
  { scheme: "BON", tariffCode: "5101", description: "X-ray single view", rate: 850.00, year: 2026 },
  { scheme: "BON", tariffCode: "8101", description: "Dental scale & polish", rate: 680.00, year: 2026 },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MOMENTUM HEALTH (MH) — 2026 Tariff
  // ~350K lives. Own administration. Ingwe managed care partner.
  // 2026 increase ~6%. 3-day follow-up bundling window.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  { scheme: "MH", tariffCode: "0190", description: "GP consultation Level 1", rate: 480.00, year: 2026 },
  { scheme: "MH", tariffCode: "0191", description: "GP consultation Level 2", rate: 630.00, year: 2026 },
  { scheme: "MH", tariffCode: "0192", description: "GP consultation Level 3", rate: 825.00, year: 2026 },
  { scheme: "MH", tariffCode: "0193", description: "GP consultation Level 4", rate: 1040.00, year: 2026 },
  { scheme: "MH", tariffCode: "0141", description: "Specialist consultation", rate: 840.00, year: 2026 },
  { scheme: "MH", tariffCode: "0142", description: "Specialist follow-up", rate: 560.00, year: 2026 },
  { scheme: "MH", tariffCode: "4518", description: "Urine dipstick", rate: 150.00, year: 2026 },
  { scheme: "MH", tariffCode: "3710", description: "Chest X-ray", rate: 100.00, year: 2026 },
  { scheme: "MH", tariffCode: "5101", description: "X-ray single view", rate: 860.00, year: 2026 },
  { scheme: "MH", tariffCode: "8101", description: "Dental scale & polish", rate: 690.00, year: 2026 },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MEDSHIELD (MS) — 2026 Tariff
  // ~200K lives. Self-administered. Strict ECC enforcement.
  // Fast 14-day turnaround. 2026 increase ~5.5%.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  { scheme: "MS", tariffCode: "0190", description: "GP consultation Level 1", rate: 460.00, year: 2026 },
  { scheme: "MS", tariffCode: "0191", description: "GP consultation Level 2", rate: 600.00, year: 2026 },
  { scheme: "MS", tariffCode: "0192", description: "GP consultation Level 3", rate: 790.00, year: 2026 },
  { scheme: "MS", tariffCode: "0193", description: "GP consultation Level 4", rate: 1000.00, year: 2026 },
  { scheme: "MS", tariffCode: "0141", description: "Specialist consultation", rate: 782.00, year: 2026 },
  { scheme: "MS", tariffCode: "0142", description: "Specialist follow-up", rate: 530.00, year: 2026 },
  { scheme: "MS", tariffCode: "4518", description: "Urine dipstick", rate: 145.00, year: 2026 },
  { scheme: "MS", tariffCode: "3710", description: "Chest X-ray", rate: 96.00, year: 2026 },
  { scheme: "MS", tariffCode: "5101", description: "X-ray single view", rate: 840.00, year: 2026 },
  { scheme: "MS", tariffCode: "8101", description: "Dental scale & polish", rate: 660.00, year: 2026 },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BESTMED (BM) — 2026 Tariff
  // ~200K lives. Self-administered. Pays close to DHR.
  // Fast 7-10 day processing. 2026 increase ~5.2%.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  { scheme: "BM", tariffCode: "0190", description: "GP consultation Level 1", rate: 500.00, year: 2026 },
  { scheme: "BM", tariffCode: "0191", description: "GP consultation Level 2", rate: 655.00, year: 2026 },
  { scheme: "BM", tariffCode: "0192", description: "GP consultation Level 3", rate: 860.00, year: 2026 },
  { scheme: "BM", tariffCode: "0193", description: "GP consultation Level 4", rate: 1080.00, year: 2026 },
  { scheme: "BM", tariffCode: "0141", description: "Specialist consultation", rate: 900.00, year: 2026 },
  { scheme: "BM", tariffCode: "0142", description: "Specialist follow-up", rate: 600.00, year: 2026 },
  { scheme: "BM", tariffCode: "4518", description: "Urine dipstick", rate: 158.00, year: 2026 },
  { scheme: "BM", tariffCode: "3710", description: "Chest X-ray", rate: 105.00, year: 2026 },
  { scheme: "BM", tariffCode: "5101", description: "X-ray single view", rate: 880.00, year: 2026 },
  { scheme: "BM", tariffCode: "8101", description: "Dental scale & polish", rate: 750.00, year: 2026 },
];

// ─── Lookup Index (built once at module load) ─────────────────────────────────

const rateIndex = new Map<string, SchemeTariffRate>();
for (const entry of SCHEME_TARIFF_RATES) {
  rateIndex.set(`${entry.scheme}:${entry.tariffCode}`, entry);
}

// ─── Scheme Name Mapping ──────────────────────────────────────────────────────

export const SCHEME_NAMES: Record<string, string> = {
  DH: "Discovery Health",
  GEMS: "GEMS",
  BON: "Bonitas",
  MH: "Momentum Health",
  MS: "Medshield",
  BM: "Bestmed",
};

/** Fuzzy-match scheme name to code. Handles common variations. */
export function resolveSchemeCode(input: string): SchemeCode | null {
  const s = input.trim().toUpperCase();

  // Direct code match
  if (s in SCHEME_NAMES) return s as SchemeCode;

  // Name-based matching
  const patterns: [RegExp, SchemeCode][] = [
    [/DISCOVER/i, "DH"],
    [/^DH$|^DHR$|^DHMS$/i, "DH"],
    [/GEMS|GOV.*EMP/i, "GEMS"],
    [/BONIT/i, "BON"],
    [/MOMENTUM|^MH$/i, "MH"],
    [/MEDSHIELD|^MS$/i, "MS"],
    [/BESTMED|^BM$/i, "BM"],
  ];

  for (const [pattern, code] of patterns) {
    if (pattern.test(input)) return code;
  }

  return null;
}

// ─── Core Lookup Functions ────────────────────────────────────────────────────

/**
 * Get the expected scheme rate for a given scheme + tariff code.
 * Returns the rate in Rands, or null if not found.
 */
export function getSchemeRate(scheme: string, tariffCode: string): number | null {
  const code = resolveSchemeCode(scheme) ?? scheme;
  const padded = tariffCode.padStart(4, "0");
  const entry = rateIndex.get(`${code}:${padded}`);
  return entry?.rate ?? null;
}

/**
 * Get the full tariff entry including description and year.
 */
export function getSchemeRateEntry(
  scheme: string,
  tariffCode: string
): SchemeTariffRate | null {
  const code = resolveSchemeCode(scheme) ?? scheme;
  const padded = tariffCode.padStart(4, "0");
  return rateIndex.get(`${code}:${padded}`) ?? null;
}

/**
 * Compare a billed amount against the expected scheme rate.
 *
 * Status thresholds:
 *   - within_range:       ratio 0.85 – 1.15 (within 15%)
 *   - above_rate:         ratio 1.15 – 1.50 (15–50% above)
 *   - significantly_above: ratio > 1.50 (more than 50% above — likely shortfall)
 *   - below_rate:         ratio < 0.85 (below scheme rate)
 *   - unknown:            scheme/tariff not in database
 */
export function compareToSchemeRate(
  scheme: string,
  tariffCode: string,
  billedAmount: number
): SchemeRateComparison {
  const rate = getSchemeRate(scheme, tariffCode);

  if (rate === null || rate === 0) {
    return { schemeRate: null, ratio: null, status: "unknown" };
  }

  const ratio = billedAmount / rate;

  let status: ComparisonStatus;
  if (ratio > 1.5) {
    status = "significantly_above";
  } else if (ratio > 1.15) {
    status = "above_rate";
  } else if (ratio < 0.85) {
    status = "below_rate";
  } else {
    status = "within_range";
  }

  return {
    schemeRate: rate,
    ratio: Math.round(ratio * 1000) / 1000, // 3 decimal places
    status,
  };
}

// ─── Batch & Analytical Functions ─────────────────────────────────────────────

/**
 * Get all rates for a specific tariff code across all schemes.
 * Useful for cross-scheme comparison.
 */
export function getRatesAcrossSchemes(
  tariffCode: string
): { scheme: string; schemeName: string; rate: number }[] {
  const padded = tariffCode.padStart(4, "0");
  const results: { scheme: string; schemeName: string; rate: number }[] = [];

  for (const entry of SCHEME_TARIFF_RATES) {
    if (entry.tariffCode === padded) {
      results.push({
        scheme: entry.scheme,
        schemeName: SCHEME_NAMES[entry.scheme] ?? entry.scheme,
        rate: entry.rate,
      });
    }
  }

  return results.sort((a, b) => b.rate - a.rate); // Highest payer first
}

/**
 * Get all rates for a specific scheme.
 */
export function getSchemeRates(scheme: string): SchemeTariffRate[] {
  const code = resolveSchemeCode(scheme) ?? scheme;
  return SCHEME_TARIFF_RATES.filter((r) => r.scheme === code);
}

/**
 * Get the market average rate for a tariff code across all schemes.
 */
export function getMarketAverageRate(tariffCode: string): number | null {
  const rates = getRatesAcrossSchemes(tariffCode);
  if (rates.length === 0) return null;
  const sum = rates.reduce((acc, r) => acc + r.rate, 0);
  return Math.round((sum / rates.length) * 100) / 100;
}

/**
 * Estimate the expected shortfall for a billed amount.
 * Shortfall = billedAmount - schemeRate (if positive).
 */
export function estimateShortfall(
  scheme: string,
  tariffCode: string,
  billedAmount: number
): { shortfall: number; schemeRate: number } | null {
  const rate = getSchemeRate(scheme, tariffCode);
  if (rate === null) return null;

  return {
    shortfall: Math.max(0, billedAmount - rate),
    schemeRate: rate,
  };
}

/**
 * Rank schemes by rate for a given tariff code.
 * Returns schemes from highest to lowest payer.
 */
export function rankSchemesByRate(
  tariffCode: string
): { scheme: string; schemeName: string; rate: number; rank: number }[] {
  return getRatesAcrossSchemes(tariffCode).map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

/**
 * Check if a tariff code exists in the rate database.
 */
export function isTariffCodeTracked(tariffCode: string): boolean {
  const padded = tariffCode.padStart(4, "0");
  return SCHEME_TARIFF_RATES.some((r) => r.tariffCode === padded);
}

/**
 * Get all tracked tariff codes.
 */
export function getTrackedTariffCodes(): string[] {
  const codes = new Set(SCHEME_TARIFF_RATES.map((r) => r.tariffCode));
  return Array.from(codes).sort();
}

// ─── Rate Update Metadata ─────────────────────────────────────────────────────

export const RATE_METADATA = {
  lastUpdated: "2026-03-24",
  tariffYear: 2026,
  schemesTracked: 6,
  tariffCodesTracked: 10,
  totalEntries: SCHEME_TARIFF_RATES.length,
  notes: [
    "GEMS procedure rates (4518, 3710, 5101) extracted from GEMS_tariffs_2026.csv discipline 014 (GP).",
    "GEMS consultation rates (0190-0193) from GEMS consultative services schedule — not in main CSV.",
    "Discovery rates based on DHR (Discovery Health Rate) — highest payer in SA market.",
    "Bonitas admin transferring to Momentum Health Solutions from 1 June 2026.",
    "All rates are non-contracted / scheme rates. Contracted (network) rates may differ.",
    "NHRPL declared null by court in 2010 — no national reference price list exists.",
    "Rates should be verified against latest scheme tariff files before production use.",
  ],
  sources: [
    "GEMS Non-Contracted Tariff File 2026 (gems.gov.za)",
    "Discovery Health Rate schedules (discovery.co.za)",
    "Profmed Rand Conversion Factors 2024/2025",
    "ECIPA Healthcare 2024 GP Tariffs",
    "Medprax Dual Tariff Rate Solution 2026",
    "CMS Annual Report 2024/2025",
    "HealthMan Comparative Tariff Guides",
  ],
} as const;
