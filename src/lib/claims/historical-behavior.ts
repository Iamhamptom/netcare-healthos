// Historical Payer Behavior Framework
// Tracks acceptance/rejection patterns per (scheme x tariffCode x practiceNumber) triplet
// Learns from every batch processed — builds statistical model over time

import type {
  ClaimLineItem,
  ValidationResult,
  LineValidationResult,
} from './types';

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export interface PayerBehaviorTriplet {
  scheme: string;
  tariffCode: string;
  practiceNumber: string;
  totalClaims: number;
  acceptedClaims: number;
  rejectedClaims: number;
  warningClaims: number;
  acceptanceRate: number;
  rejectionRate: number;
  avgAmount: number;
  totalAmount: number;
  minAmount: number;
  maxAmount: number;
  /** ISO date string of last update */
  lastUpdated: string;
  /** ISO date string of first observation */
  firstSeen: string;
  /** Rolling window of recent rejection rates (last N batches) */
  recentRejectionRates: number[];
}

export interface ProviderAnomaly {
  practiceNumber: string;
  scheme: string;
  tariffCode: string;
  providerAcceptanceRate: number;
  peerAcceptanceRate: number;
  deviation: number; // standard deviations below peer mean
  totalClaims: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface SchemePattern {
  scheme: string;
  totalClaims: number;
  overallAcceptanceRate: number;
  topRejectedTariffs: { tariffCode: string; rejectionRate: number; count: number }[];
  topRejectedProviders: { practiceNumber: string; rejectionRate: number; count: number }[];
}

export interface BehaviorStats {
  totalTriplets: number;
  totalClaimsRecorded: number;
  uniqueSchemes: number;
  uniqueProviders: number;
  uniqueTariffCodes: number;
  overallAcceptanceRate: number;
  oldestRecord: string | null;
  newestRecord: string | null;
}

export interface PredictedOutcome {
  expectedAcceptanceRate: number;
  confidence: 'none' | 'low' | 'medium' | 'high';
  sampleSize: number;
  recommendation: string | null;
}

// --------------------------------------------------------------------------
// Constants
// --------------------------------------------------------------------------

const TRIPLET_KEY_SEP = '|||';
const MIN_CLAIMS_FOR_ANOMALY = 10;
const MIN_PEERS_FOR_COMPARISON = 3;
const ANOMALY_DEVIATION_THRESHOLD = 1.5; // std devs below mean
const RECENT_WINDOW_SIZE = 20; // track last N batch rejection rates
const HIGH_CONFIDENCE_THRESHOLD = 50; // claims needed for high confidence
const MEDIUM_CONFIDENCE_THRESHOLD = 15;

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function makeTripletKey(scheme: string, tariffCode: string, practiceNumber: string): string {
  return `${scheme.toUpperCase().trim()}${TRIPLET_KEY_SEP}${tariffCode.trim()}${TRIPLET_KEY_SEP}${practiceNumber.trim()}`;
}

function parseTripletKey(key: string): { scheme: string; tariffCode: string; practiceNumber: string } {
  const [scheme, tariffCode, practiceNumber] = key.split(TRIPLET_KEY_SEP);
  return { scheme: scheme ?? '', tariffCode: tariffCode ?? '', practiceNumber: practiceNumber ?? '' };
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map((v) => (v - mean) ** 2);
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / (values.length - 1));
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function classifyLineResult(line: LineValidationResult): 'accepted' | 'rejected' | 'warning' {
  if (line.status === 'error') return 'rejected';
  if (line.status === 'warning') return 'warning';
  return 'accepted';
}

// --------------------------------------------------------------------------
// HistoricalBehaviorStore
// --------------------------------------------------------------------------

export class HistoricalBehaviorStore {
  private triplets: Map<string, PayerBehaviorTriplet> = new Map();

  constructor(serialized?: string) {
    if (serialized) {
      this.deserialize(serialized);
    }
  }

  // ---------- Core: Record a batch ----------

  /**
   * Record a batch of validation results. Each line item with scheme + tariffCode + practiceNumber
   * is recorded as a triplet observation. Lines missing any of these three fields are skipped.
   */
  recordBatch(lines: ClaimLineItem[], results: ValidationResult): void {
    const now = new Date().toISOString();

    // Build a lookup from lineNumber -> LineValidationResult
    const lineResultMap = new Map<number, LineValidationResult>();
    for (const lr of results.lineResults) {
      lineResultMap.set(lr.lineNumber, lr);
    }

    // Track per-triplet batch stats for recentRejectionRates
    const batchTripletStats = new Map<string, { total: number; rejected: number }>();

    for (const line of lines) {
      const scheme = line.scheme?.toUpperCase().trim();
      const tariffCode = line.tariffCode?.trim();
      const practiceNumber = line.practiceNumber?.trim();

      // Skip lines missing required triplet fields
      if (!scheme || !tariffCode || !practiceNumber) continue;

      const key = makeTripletKey(scheme, tariffCode, practiceNumber);
      const lineResult = lineResultMap.get(line.lineNumber);
      const outcome = lineResult ? classifyLineResult(lineResult) : 'accepted';
      const amount = line.amount ?? 0;

      // Upsert triplet
      let triplet = this.triplets.get(key);
      if (!triplet) {
        triplet = {
          scheme,
          tariffCode,
          practiceNumber,
          totalClaims: 0,
          acceptedClaims: 0,
          rejectedClaims: 0,
          warningClaims: 0,
          acceptanceRate: 0,
          rejectionRate: 0,
          avgAmount: 0,
          totalAmount: 0,
          minAmount: amount > 0 ? amount : Infinity,
          maxAmount: amount > 0 ? amount : 0,
          lastUpdated: now,
          firstSeen: now,
          recentRejectionRates: [],
        };
        this.triplets.set(key, triplet);
      }

      // Update counts
      triplet.totalClaims += 1;
      if (outcome === 'accepted') triplet.acceptedClaims += 1;
      else if (outcome === 'rejected') triplet.rejectedClaims += 1;
      else triplet.warningClaims += 1;

      // Update amounts
      if (amount > 0) {
        triplet.totalAmount += amount;
        triplet.avgAmount = triplet.totalAmount / triplet.totalClaims;
        if (amount < triplet.minAmount) triplet.minAmount = amount;
        if (amount > triplet.maxAmount) triplet.maxAmount = amount;
      }

      // Recalculate rates
      triplet.acceptanceRate = triplet.totalClaims > 0
        ? triplet.acceptedClaims / triplet.totalClaims
        : 0;
      triplet.rejectionRate = triplet.totalClaims > 0
        ? triplet.rejectedClaims / triplet.totalClaims
        : 0;

      triplet.lastUpdated = now;

      // Track batch stats for this triplet
      const bs = batchTripletStats.get(key) ?? { total: 0, rejected: 0 };
      bs.total += 1;
      if (outcome === 'rejected') bs.rejected += 1;
      batchTripletStats.set(key, bs);
    }

    // Update recentRejectionRates for each triplet that appeared in this batch
    for (const [key, bs] of Array.from(batchTripletStats.entries())) {
      const triplet = this.triplets.get(key);
      if (!triplet) continue;
      const batchRejRate = bs.total > 0 ? bs.rejected / bs.total : 0;
      triplet.recentRejectionRates.push(batchRejRate);
      // Keep only the last N entries
      if (triplet.recentRejectionRates.length > RECENT_WINDOW_SIZE) {
        triplet.recentRejectionRates = triplet.recentRejectionRates.slice(-RECENT_WINDOW_SIZE);
      }
    }
  }

  // ---------- Query: Acceptance rate ----------

  /**
   * Get the historical acceptance rate for a specific scheme/tariff/provider combination.
   * Returns null if no data exists for this triplet.
   */
  getAcceptanceRate(scheme: string, tariffCode: string, practiceNumber: string): number | null {
    const key = makeTripletKey(scheme, tariffCode, practiceNumber);
    const triplet = this.triplets.get(key);
    if (!triplet) return null;
    return triplet.acceptanceRate;
  }

  /**
   * Get the full triplet record for a specific combination.
   */
  getTriplet(scheme: string, tariffCode: string, practiceNumber: string): PayerBehaviorTriplet | null {
    const key = makeTripletKey(scheme, tariffCode, practiceNumber);
    return this.triplets.get(key) ?? null;
  }

  /**
   * Predict the likely outcome for a claim line based on historical data.
   * Uses the triplet if available, falls back to scheme+tariff or scheme+provider aggregates.
   */
  predictOutcome(scheme: string, tariffCode: string, practiceNumber: string): PredictedOutcome {
    // Try exact triplet first
    const exact = this.getTriplet(scheme, tariffCode, practiceNumber);
    if (exact && exact.totalClaims >= MEDIUM_CONFIDENCE_THRESHOLD) {
      const confidence = exact.totalClaims >= HIGH_CONFIDENCE_THRESHOLD ? 'high' : 'medium';
      return {
        expectedAcceptanceRate: exact.acceptanceRate,
        confidence,
        sampleSize: exact.totalClaims,
        recommendation: exact.rejectionRate > 0.3
          ? `High rejection rate (${(exact.rejectionRate * 100).toFixed(1)}%) for this scheme/tariff/provider — review carefully before submission`
          : null,
      };
    }

    // Fallback: aggregate across all providers for this scheme+tariff
    const schemeTariffStats = this.aggregateSchemeTariff(scheme, tariffCode);
    if (schemeTariffStats.totalClaims >= MEDIUM_CONFIDENCE_THRESHOLD) {
      return {
        expectedAcceptanceRate: schemeTariffStats.acceptanceRate,
        confidence: 'low',
        sampleSize: schemeTariffStats.totalClaims,
        recommendation: schemeTariffStats.rejectionRate > 0.3
          ? `This tariff code has a ${(schemeTariffStats.rejectionRate * 100).toFixed(1)}% rejection rate with ${scheme} — double-check coding`
          : null,
      };
    }

    // No useful data
    return {
      expectedAcceptanceRate: 0,
      confidence: 'none',
      sampleSize: exact?.totalClaims ?? schemeTariffStats.totalClaims,
      recommendation: null,
    };
  }

  // ---------- Anomaly detection ----------

  /**
   * Detect providers whose acceptance rates deviate significantly from their peers
   * for the same scheme+tariff combination.
   */
  detectProviderAnomalies(): ProviderAnomaly[] {
    const anomalies: ProviderAnomaly[] = [];

    // Group by scheme+tariff, compare providers within each group
    const schemeTariffGroups = new Map<string, PayerBehaviorTriplet[]>();
    for (const triplet of Array.from(this.triplets.values())) {
      const groupKey = `${triplet.scheme}${TRIPLET_KEY_SEP}${triplet.tariffCode}`;
      const group = schemeTariffGroups.get(groupKey) ?? [];
      group.push(triplet);
      schemeTariffGroups.set(groupKey, group);
    }

    for (const [, group] of Array.from(schemeTariffGroups.entries())) {
      // Need minimum peer count for meaningful comparison
      const qualified = group.filter((t) => t.totalClaims >= MIN_CLAIMS_FOR_ANOMALY);
      if (qualified.length < MIN_PEERS_FOR_COMPARISON) continue;

      const rates = qualified.map((t) => t.acceptanceRate);
      const peerMean = mean(rates);
      const peerStdDev = stdDev(rates);

      if (peerStdDev === 0) continue; // all providers have identical rates

      for (const triplet of qualified) {
        const deviation = (peerMean - triplet.acceptanceRate) / peerStdDev;

        if (deviation >= ANOMALY_DEVIATION_THRESHOLD) {
          let severity: ProviderAnomaly['severity'] = 'low';
          if (deviation >= 3) severity = 'critical';
          else if (deviation >= 2.5) severity = 'high';
          else if (deviation >= 2) severity = 'medium';

          anomalies.push({
            practiceNumber: triplet.practiceNumber,
            scheme: triplet.scheme,
            tariffCode: triplet.tariffCode,
            providerAcceptanceRate: triplet.acceptanceRate,
            peerAcceptanceRate: peerMean,
            deviation: Math.round(deviation * 100) / 100,
            totalClaims: triplet.totalClaims,
            severity,
            description: `Provider ${triplet.practiceNumber} has a ${(triplet.acceptanceRate * 100).toFixed(1)}% acceptance rate for ${triplet.tariffCode} on ${triplet.scheme}, vs peer average of ${(peerMean * 100).toFixed(1)}% (${deviation.toFixed(1)} std devs below)`,
          });
        }
      }
    }

    // Sort by severity (critical first) then deviation
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    anomalies.sort((a, b) => {
      const so = severityOrder[a.severity] - severityOrder[b.severity];
      if (so !== 0) return so;
      return b.deviation - a.deviation;
    });

    return anomalies;
  }

  /**
   * Detect trending rejection spikes — providers whose recent batch rejection rates
   * are significantly higher than their historical average.
   */
  detectRejectionSpikes(): ProviderAnomaly[] {
    const spikes: ProviderAnomaly[] = [];

    for (const triplet of Array.from(this.triplets.values())) {
      const rates = triplet.recentRejectionRates;
      if (rates.length < 5) continue; // need enough history

      // Compare last 3 batches vs. earlier batches
      const recentSlice = rates.slice(-3);
      const historicalSlice = rates.slice(0, -3);
      if (historicalSlice.length < 2) continue;

      const recentAvg = mean(recentSlice);
      const historicalAvg = mean(historicalSlice);
      const historicalStd = stdDev(historicalSlice);

      if (historicalStd === 0) continue;

      const spikeDeviation = (recentAvg - historicalAvg) / historicalStd;

      if (spikeDeviation >= ANOMALY_DEVIATION_THRESHOLD && recentAvg > 0.1) {
        let severity: ProviderAnomaly['severity'] = 'low';
        if (spikeDeviation >= 3) severity = 'critical';
        else if (spikeDeviation >= 2.5) severity = 'high';
        else if (spikeDeviation >= 2) severity = 'medium';

        spikes.push({
          practiceNumber: triplet.practiceNumber,
          scheme: triplet.scheme,
          tariffCode: triplet.tariffCode,
          providerAcceptanceRate: 1 - recentAvg,
          peerAcceptanceRate: 1 - historicalAvg,
          deviation: Math.round(spikeDeviation * 100) / 100,
          totalClaims: triplet.totalClaims,
          severity,
          description: `Provider ${triplet.practiceNumber} rejection rate for ${triplet.tariffCode}/${triplet.scheme} spiked to ${(recentAvg * 100).toFixed(1)}% in recent batches (historical avg: ${(historicalAvg * 100).toFixed(1)}%)`,
        });
      }
    }

    return spikes.sort((a, b) => b.deviation - a.deviation);
  }

  // ---------- Analytics ----------

  /**
   * Get per-scheme aggregated patterns including top rejected tariffs and providers.
   */
  getSchemePatterns(): SchemePattern[] {
    const schemeMap = new Map<string, {
      totalClaims: number;
      acceptedClaims: number;
      tariffRej: Map<string, { rejected: number; total: number }>;
      providerRej: Map<string, { rejected: number; total: number }>;
    }>();

    for (const triplet of Array.from(this.triplets.values())) {
      let data = schemeMap.get(triplet.scheme);
      if (!data) {
        data = { totalClaims: 0, acceptedClaims: 0, tariffRej: new Map(), providerRej: new Map() };
        schemeMap.set(triplet.scheme, data);
      }

      data.totalClaims += triplet.totalClaims;
      data.acceptedClaims += triplet.acceptedClaims;

      // Tariff rejection tracking
      const tariffData = data.tariffRej.get(triplet.tariffCode) ?? { rejected: 0, total: 0 };
      tariffData.rejected += triplet.rejectedClaims;
      tariffData.total += triplet.totalClaims;
      data.tariffRej.set(triplet.tariffCode, tariffData);

      // Provider rejection tracking
      const providerData = data.providerRej.get(triplet.practiceNumber) ?? { rejected: 0, total: 0 };
      providerData.rejected += triplet.rejectedClaims;
      providerData.total += triplet.totalClaims;
      data.providerRej.set(triplet.practiceNumber, providerData);
    }

    const patterns: SchemePattern[] = [];
    for (const [scheme, data] of Array.from(schemeMap.entries())) {
      // Top rejected tariffs (by rejection rate, min 5 claims)
      const topTariffs = Array.from(data.tariffRej.entries())
        .filter(([, v]) => v.total >= 5)
        .map(([code, v]) => ({
          tariffCode: code,
          rejectionRate: v.total > 0 ? v.rejected / v.total : 0,
          count: v.total,
        }))
        .sort((a, b) => b.rejectionRate - a.rejectionRate)
        .slice(0, 10);

      // Top rejected providers (by rejection rate, min 5 claims)
      const topProviders = Array.from(data.providerRej.entries())
        .filter(([, v]) => v.total >= 5)
        .map(([pn, v]) => ({
          practiceNumber: pn,
          rejectionRate: v.total > 0 ? v.rejected / v.total : 0,
          count: v.total,
        }))
        .sort((a, b) => b.rejectionRate - a.rejectionRate)
        .slice(0, 10);

      patterns.push({
        scheme,
        totalClaims: data.totalClaims,
        overallAcceptanceRate: data.totalClaims > 0 ? data.acceptedClaims / data.totalClaims : 0,
        topRejectedTariffs: topTariffs,
        topRejectedProviders: topProviders,
      });
    }

    return patterns.sort((a, b) => b.totalClaims - a.totalClaims);
  }

  /**
   * Get overall store statistics.
   */
  getStats(): BehaviorStats {
    const schemes = new Set<string>();
    const providers = new Set<string>();
    const tariffs = new Set<string>();
    let totalClaims = 0;
    let totalAccepted = 0;
    let oldest: string | null = null;
    let newest: string | null = null;

    for (const triplet of Array.from(this.triplets.values())) {
      schemes.add(triplet.scheme);
      providers.add(triplet.practiceNumber);
      tariffs.add(triplet.tariffCode);
      totalClaims += triplet.totalClaims;
      totalAccepted += triplet.acceptedClaims;

      if (!oldest || triplet.firstSeen < oldest) oldest = triplet.firstSeen;
      if (!newest || triplet.lastUpdated > newest) newest = triplet.lastUpdated;
    }

    return {
      totalTriplets: this.triplets.size,
      totalClaimsRecorded: totalClaims,
      uniqueSchemes: schemes.size,
      uniqueProviders: providers.size,
      uniqueTariffCodes: tariffs.size,
      overallAcceptanceRate: totalClaims > 0 ? totalAccepted / totalClaims : 0,
      oldestRecord: oldest,
      newestRecord: newest,
    };
  }

  // ---------- Persistence ----------

  /**
   * Serialize the entire store to a JSON string for persistence.
   */
  serialize(): string {
    const entries: [string, PayerBehaviorTriplet][] = [];
    for (const [key, triplet] of Array.from(this.triplets.entries())) {
      entries.push([key, triplet]);
    }
    return JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      entries,
    });
  }

  /**
   * Deserialize from a previously serialized JSON string.
   * Replaces current store contents.
   */
  deserialize(data: string): void {
    try {
      const parsed = JSON.parse(data) as {
        version: number;
        entries: [string, PayerBehaviorTriplet][];
      };

      if (parsed.version !== 1) {
        console.warn(`[HistoricalBehaviorStore] Unknown version ${parsed.version}, attempting load anyway`);
      }

      this.triplets.clear();
      for (const [key, triplet] of parsed.entries) {
        // Fix Infinity serialization (JSON turns Infinity to null)
        if (triplet.minAmount === null || triplet.minAmount === undefined) {
          triplet.minAmount = Infinity;
        }
        this.triplets.set(key, triplet);
      }
    } catch (err) {
      console.error('[HistoricalBehaviorStore] Failed to deserialize:', err);
      this.triplets.clear();
    }
  }

  /**
   * Merge another store into this one (for combining data from multiple sources).
   * Newer records win on conflict for lastUpdated, counts are summed.
   */
  merge(other: HistoricalBehaviorStore): void {
    for (const [key, otherTriplet] of Array.from(other.triplets.entries())) {
      const existing = this.triplets.get(key);
      if (!existing) {
        this.triplets.set(key, { ...otherTriplet });
        continue;
      }

      // Merge: sum counts, recalculate rates
      existing.totalClaims += otherTriplet.totalClaims;
      existing.acceptedClaims += otherTriplet.acceptedClaims;
      existing.rejectedClaims += otherTriplet.rejectedClaims;
      existing.warningClaims += otherTriplet.warningClaims;
      existing.totalAmount += otherTriplet.totalAmount;
      existing.avgAmount = existing.totalClaims > 0
        ? existing.totalAmount / existing.totalClaims
        : 0;
      existing.minAmount = Math.min(existing.minAmount, otherTriplet.minAmount);
      existing.maxAmount = Math.max(existing.maxAmount, otherTriplet.maxAmount);
      existing.acceptanceRate = existing.totalClaims > 0
        ? existing.acceptedClaims / existing.totalClaims
        : 0;
      existing.rejectionRate = existing.totalClaims > 0
        ? existing.rejectedClaims / existing.totalClaims
        : 0;

      // Keep earliest firstSeen, latest lastUpdated
      if (otherTriplet.firstSeen < existing.firstSeen) {
        existing.firstSeen = otherTriplet.firstSeen;
      }
      if (otherTriplet.lastUpdated > existing.lastUpdated) {
        existing.lastUpdated = otherTriplet.lastUpdated;
      }

      // Merge recent rejection rates (interleave and keep last N)
      existing.recentRejectionRates = [
        ...existing.recentRejectionRates,
        ...otherTriplet.recentRejectionRates,
      ].slice(-RECENT_WINDOW_SIZE);
    }
  }

  // ---------- Internal helpers ----------

  private aggregateSchemeTariff(scheme: string, tariffCode: string): {
    totalClaims: number;
    acceptanceRate: number;
    rejectionRate: number;
  } {
    const normalizedScheme = scheme.toUpperCase().trim();
    const normalizedTariff = tariffCode.trim();
    let total = 0;
    let accepted = 0;
    let rejected = 0;

    for (const triplet of Array.from(this.triplets.values())) {
      if (triplet.scheme === normalizedScheme && triplet.tariffCode === normalizedTariff) {
        total += triplet.totalClaims;
        accepted += triplet.acceptedClaims;
        rejected += triplet.rejectedClaims;
      }
    }

    return {
      totalClaims: total,
      acceptanceRate: total > 0 ? accepted / total : 0,
      rejectionRate: total > 0 ? rejected / total : 0,
    };
  }
}

// --------------------------------------------------------------------------
// Singleton / persistence helpers
// --------------------------------------------------------------------------

const STORAGE_KEY = 'netcare-healthos-payer-behavior-v1';

let _instance: HistoricalBehaviorStore | null = null;

/**
 * Get the singleton store instance. On first call, attempts to load from
 * localStorage (browser) or returns an empty store (server).
 */
export function getBehaviorStore(): HistoricalBehaviorStore {
  if (_instance) return _instance;

  let serialized: string | null = null;

  // Try localStorage (browser context)
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      serialized = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // localStorage may be disabled
    }
  }

  _instance = new HistoricalBehaviorStore(serialized ?? undefined);
  return _instance;
}

/**
 * Persist the singleton store to localStorage (browser only).
 * Call this after recordBatch() to save state.
 */
export function persistBehaviorStore(): boolean {
  if (!_instance) return false;

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, _instance.serialize());
      return true;
    } catch (err) {
      console.error('[persistBehaviorStore] Failed to save:', err);
      return false;
    }
  }

  return false;
}

/**
 * Reset the singleton (for testing or to clear accumulated data).
 */
export function resetBehaviorStore(): void {
  _instance = new HistoricalBehaviorStore();
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}
