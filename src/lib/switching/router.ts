// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Multi-Switch Router — Routes claims to the correct switching house
// Based on scheme→administrator→switch mapping (SA healthcare ecosystem)
//
// Routing logic:
// 1. Look up the medical aid scheme
// 2. Determine which administrator handles it
// 3. Route to the switch that has bilateral agreements with that administrator
// 4. Fall back to alternative switches if primary is unavailable
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { logger } from "@/lib/logger";
import type { SwitchProvider, SwitchConfig, RoutingDecision, SwitchProtocol } from "./types";
import type { ClaimSubmission, ClaimResponse, EligibilityResult } from "../healthbridge/types";
import { submitClaim as submitHealthbridge, checkEligibility as checkHealthbridge } from "../healthbridge/client";
import { submitToMediKredit, checkMediKreditEligibility } from "./medikredit-client";
import { submitToSwitchOn, checkSwitchOnEligibility } from "./switchon-client";
import { generateEDIFACT } from "./edifact";

// ─── Scheme → Administrator → Switch Mapping ────────────────────────────────

export interface SchemeRoute {
  scheme: string;
  administrator: string;
  primarySwitch: SwitchProvider;
  fallbackSwitches: SwitchProvider[];
  protocol: SwitchProtocol;
  notes?: string;
}

/**
 * Comprehensive SA medical aid scheme routing table.
 * Maps every major scheme to its administrator and preferred switch.
 * Based on real bilateral agreements between switches and administrators.
 */
export const SCHEME_ROUTING_TABLE: SchemeRoute[] = [
  // ── Discovery Health (largest, ~3.5M beneficiaries) ──
  { scheme: "Discovery Health", administrator: "Discovery Health (Pty) Ltd", primarySwitch: "healthbridge", fallbackSwitches: ["medikredit", "switchon"], protocol: "xml" },
  { scheme: "Discovery Health KeyCare", administrator: "Discovery Health (Pty) Ltd", primarySwitch: "healthbridge", fallbackSwitches: ["medikredit"], protocol: "xml" },
  { scheme: "Discovery Health Coastal", administrator: "Discovery Health (Pty) Ltd", primarySwitch: "healthbridge", fallbackSwitches: ["medikredit"], protocol: "xml" },

  // ── Medscheme administered ──
  { scheme: "Bonitas", administrator: "Medscheme", primarySwitch: "healthbridge", fallbackSwitches: ["medikredit", "switchon"], protocol: "xml" },
  { scheme: "Samwumed", administrator: "Medscheme", primarySwitch: "healthbridge", fallbackSwitches: ["switchon"], protocol: "xml" },
  { scheme: "Netcare Medical Scheme", administrator: "Medscheme", primarySwitch: "healthbridge", fallbackSwitches: ["medikredit"], protocol: "xml" },
  { scheme: "Hosmed", administrator: "Medscheme", primarySwitch: "healthbridge", fallbackSwitches: ["switchon"], protocol: "xml" },
  { scheme: "Resolution Health", administrator: "Medscheme", primarySwitch: "healthbridge", fallbackSwitches: ["switchon"], protocol: "xml" },
  { scheme: "Spectramed", administrator: "Medscheme", primarySwitch: "healthbridge", fallbackSwitches: ["medikredit"], protocol: "xml" },

  // ── Metropolitan/GEMS ──
  { scheme: "GEMS", administrator: "Metropolitan Health", primarySwitch: "switchon", fallbackSwitches: ["medikredit", "healthbridge"], protocol: "xml", notes: "Government Employees Medical Scheme — 9-digit membership with leading zeros" },
  { scheme: "Polmed", administrator: "Metropolitan Health", primarySwitch: "switchon", fallbackSwitches: ["medikredit"], protocol: "xml" },

  // ── Momentum/MMI administered ──
  { scheme: "Momentum Health", administrator: "Momentum Health Solutions", primarySwitch: "switchon", fallbackSwitches: ["medikredit", "healthbridge"], protocol: "xml" },
  { scheme: "Bestmed", administrator: "Bestmed", primarySwitch: "switchon", fallbackSwitches: ["medikredit"], protocol: "xml" },
  { scheme: "Fedhealth", administrator: "Fedhealth", primarySwitch: "switchon", fallbackSwitches: ["medikredit", "healthbridge"], protocol: "xml" },

  // ── Self-administered ──
  { scheme: "Medihelp", administrator: "Medihelp", primarySwitch: "healthbridge", fallbackSwitches: ["medikredit", "switchon"], protocol: "xml" },
  { scheme: "Medshield", administrator: "Medshield", primarySwitch: "medikredit", fallbackSwitches: ["switchon", "healthbridge"], protocol: "xml" },

  // ── Afrocentric / Sizwe Hosmed ──
  { scheme: "Sizwe Hosmed", administrator: "Afrocentric Group", primarySwitch: "switchon", fallbackSwitches: ["medikredit"], protocol: "xml" },

  // ── Universal Healthcare ──
  { scheme: "CompCare", administrator: "Universal Healthcare", primarySwitch: "medikredit", fallbackSwitches: ["switchon"], protocol: "xml" },
  { scheme: "Makoti", administrator: "Universal Healthcare", primarySwitch: "medikredit", fallbackSwitches: ["switchon"], protocol: "xml" },

  // ── PPS ──
  { scheme: "PPS Healthcare", administrator: "PPS Healthcare Administrators", primarySwitch: "medikredit", fallbackSwitches: ["healthbridge"], protocol: "xml" },

  // ── Liberty ──
  { scheme: "Liberty Medical Scheme", administrator: "Liberty Health", primarySwitch: "switchon", fallbackSwitches: ["medikredit"], protocol: "xml" },

  // ── Anglo Medical ──
  { scheme: "Anglo Medical", administrator: "Anglo American", primarySwitch: "healthbridge", fallbackSwitches: ["medikredit"], protocol: "xml" },

  // ── Bankmed ──
  { scheme: "Bankmed", administrator: "Bankmed", primarySwitch: "healthbridge", fallbackSwitches: ["medikredit", "switchon"], protocol: "xml" },

  // ── Mining industry ──
  { scheme: "Minemed", administrator: "MMI Health", primarySwitch: "switchon", fallbackSwitches: ["medikredit"], protocol: "xml" },

  // ── Teacher schemes ──
  { scheme: "SAOU Med", administrator: "Momentum", primarySwitch: "switchon", fallbackSwitches: ["medikredit"], protocol: "xml" },

  // ── Open schemes ──
  { scheme: "Selfmed", administrator: "Momentum", primarySwitch: "switchon", fallbackSwitches: ["medikredit"], protocol: "xml" },
  { scheme: "KeyHealth", administrator: "Key Health", primarySwitch: "medikredit", fallbackSwitches: ["switchon"], protocol: "xml" },
  { scheme: "Profmed", administrator: "PPS", primarySwitch: "medikredit", fallbackSwitches: ["healthbridge"], protocol: "xml" },
  { scheme: "LA Health", administrator: "Discovery Health", primarySwitch: "healthbridge", fallbackSwitches: ["medikredit"], protocol: "xml" },
];

// ─── Switch Health Monitoring (EMA-based) ───────────────────────────────────

/** Configuration for health monitoring thresholds */
export const HEALTH_THRESHOLDS = {
  /** Error rate above this triggers failover (0-1 scale) */
  errorRateFailover: 0.5,
  /** Latency above this (ms) triggers failover */
  latencyFailoverMs: 800,
  /** EMA alpha for latency tracking (higher = more responsive to recent values) */
  latencyAlpha: 0.3,
  /** EMA alpha for error rate tracking */
  errorRateAlpha: 0.2,
  /** Rolling window size for error tracking */
  rollingWindowSize: 50,
  /** Health data considered stale after this many ms (5 minutes) */
  stalenessMs: 300_000,
  /** Minimum samples before health data is considered reliable */
  minSamples: 5,
} as const;

export type SwitchHealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";

interface SwitchHealthRecord {
  provider: SwitchProvider;
  /** Whether the switch is currently available for routing */
  available: boolean;
  /** EMA-smoothed latency in ms (alpha=0.3) */
  latencyEmaMs: number;
  /** EMA-smoothed error rate (0-1) */
  errorRateEma: number;
  /** Rolling window of recent request outcomes (true=success, false=failure) */
  rollingWindow: boolean[];
  /** Rolling window of recent latencies for percentile calculations */
  latencyWindow: number[];
  /** Total requests tracked */
  totalRequests: number;
  /** Total errors tracked */
  totalErrors: number;
  /** Last time health was updated */
  lastChecked: string;
  /** Last time the switch was confirmed healthy */
  lastHealthy: string | null;
  /** Current health status */
  status: SwitchHealthStatus;
  /** Consecutive failures (for circuit breaker pattern) */
  consecutiveFailures: number;
}

const switchHealthCache: Map<SwitchProvider, SwitchHealthRecord> = new Map();

/** Get switch configurations from environment */
export function getSwitchConfigs(): Map<SwitchProvider, SwitchConfig> {
  const configs = new Map<SwitchProvider, SwitchConfig>();

  // Healthbridge
  if (process.env.HEALTHBRIDGE_ENDPOINT) {
    configs.set("healthbridge", {
      provider: "healthbridge",
      protocol: "xml",
      endpoint: process.env.HEALTHBRIDGE_ENDPOINT,
      username: process.env.HEALTHBRIDGE_USERNAME || "",
      password: process.env.HEALTHBRIDGE_PASSWORD || "",
      bhfNumber: process.env.HEALTHBRIDGE_BHF_NUMBER || "",
      vendorId: "NETCAREOS",
      vendorName: "NetcareHealthOS",
      vendorVersion: "2.0.0",
      sandbox: process.env.HEALTHBRIDGE_SANDBOX === "true",
      timeout: 30000,
    });
  }

  // MediKredit
  if (process.env.MEDIKREDIT_ENDPOINT) {
    configs.set("medikredit", {
      provider: "medikredit",
      protocol: "xml",
      endpoint: process.env.MEDIKREDIT_ENDPOINT,
      username: process.env.MEDIKREDIT_USERNAME || "",
      password: process.env.MEDIKREDIT_PASSWORD || "",
      bhfNumber: process.env.MEDIKREDIT_BHF_NUMBER || process.env.HEALTHBRIDGE_BHF_NUMBER || "",
      vendorId: "NETCAREOS",
      vendorName: "NetcareHealthOS",
      vendorVersion: "2.0.0",
      sandbox: process.env.MEDIKREDIT_SANDBOX === "true",
      timeout: 30000,
    });
  }

  // SwitchOn / Altron HealthTech
  if (process.env.SWITCHON_ENDPOINT) {
    configs.set("switchon", {
      provider: "switchon",
      protocol: "xml",
      endpoint: process.env.SWITCHON_ENDPOINT,
      username: process.env.SWITCHON_USERNAME || "",
      password: process.env.SWITCHON_PASSWORD || "",
      bhfNumber: process.env.SWITCHON_BHF_NUMBER || process.env.HEALTHBRIDGE_BHF_NUMBER || "",
      vendorId: "NETCAREOS",
      vendorName: "NetcareHealthOS",
      vendorVersion: "2.0.0",
      sandbox: process.env.SWITCHON_SANDBOX === "true",
      timeout: 30000,
    });
  }

  return configs;
}

// ─── Routing Engine ─────────────────────────────────────────────────────────

/**
 * Determine which switch to route a claim to based on the medical aid scheme.
 * Checks switch availability and falls back to alternatives if needed.
 */
export function routeClaim(schemeName: string): RoutingDecision {
  const normalizedScheme = schemeName.trim().toLowerCase();
  const configs = getSwitchConfigs();

  // Find matching route
  const route = SCHEME_ROUTING_TABLE.find(r =>
    r.scheme.toLowerCase() === normalizedScheme ||
    normalizedScheme.includes(r.scheme.toLowerCase()) ||
    r.scheme.toLowerCase().includes(normalizedScheme)
  );

  if (!route) {
    // Unknown scheme — try all available switches
    const availableSwitches = Array.from(configs.keys());
    if (availableSwitches.length > 0) {
      return {
        switchProvider: availableSwitches[0],
        reason: `Unknown scheme "${schemeName}" — routing to first available switch (${availableSwitches[0]})`,
        alternatives: availableSwitches.slice(1),
        protocol: "xml",
        estimatedMs: 5000,
        confidence: "low",
      };
    }

    // No switches configured — use sandbox/demo mode
    return {
      switchProvider: "healthbridge",
      reason: `No switch configured — using sandbox mode for "${schemeName}"`,
      alternatives: [],
      protocol: "xml",
      estimatedMs: 100,
      confidence: "low",
    };
  }

  // Check if primary switch is available
  const primaryAvailable = configs.has(route.primarySwitch) && isSwitchHealthy(route.primarySwitch);

  if (primaryAvailable) {
    return {
      switchProvider: route.primarySwitch,
      reason: `${route.scheme} → ${route.administrator} → ${route.primarySwitch} (primary route)`,
      alternatives: route.fallbackSwitches,
      protocol: route.protocol,
      estimatedMs: 3000,
      confidence: "high",
    };
  }

  // Try fallbacks
  for (const fallback of route.fallbackSwitches) {
    if (configs.has(fallback) && isSwitchHealthy(fallback)) {
      return {
        switchProvider: fallback,
        reason: `${route.scheme} → ${route.administrator} → ${fallback} (fallback — primary ${route.primarySwitch} unavailable)`,
        alternatives: route.fallbackSwitches.filter(f => f !== fallback),
        protocol: route.protocol,
        estimatedMs: 4000,
        confidence: "medium",
      };
    }
  }

  // All switches unavailable — use primary anyway (will hit sandbox/demo mode)
  return {
    switchProvider: route.primarySwitch,
    reason: `${route.scheme} → ${route.administrator} → ${route.primarySwitch} (no switches available — sandbox mode)`,
    alternatives: route.fallbackSwitches,
    protocol: route.protocol,
    estimatedMs: 100,
    confidence: "low",
  };
}

/**
 * Submit a claim through the routed switch.
 * Automatically handles routing, protocol selection, and fallback.
 */
export async function submitRoutedClaim(
  claim: ClaimSubmission,
  options?: { forceSwitch?: SwitchProvider; forceProtocol?: SwitchProtocol }
): Promise<ClaimResponse & { routedTo: SwitchProvider; edifact?: string }> {
  const routing = options?.forceSwitch
    ? { switchProvider: options.forceSwitch, protocol: options.forceProtocol || "xml" as SwitchProtocol }
    : routeClaim(claim.medicalAidScheme);

  // Generate EDIFACT for audit trail (regardless of submission protocol)
  const edifact = generateEDIFACT(claim);

  let response: ClaimResponse;
  const startTime = Date.now();
  let success = false;

  try {
    switch (routing.switchProvider) {
      case "medikredit":
        response = await submitToMediKredit(claim);
        break;
      case "switchon":
        response = await submitToSwitchOn(claim);
        break;
      case "healthbridge":
      default:
        response = await submitHealthbridge(claim);
        break;
    }
    success = response.status !== "rejected" || !!response.transactionRef;
  } catch (err) {
    const latency = Date.now() - startTime;
    updateSwitchHealth(routing.switchProvider, false, latency);
    throw err;
  }

  const latency = Date.now() - startTime;
  updateSwitchHealth(routing.switchProvider, success, latency);

  return { ...response, routedTo: routing.switchProvider, edifact };
}

/**
 * Check eligibility through the routed switch.
 */
export async function checkRoutedEligibility(data: {
  membershipNumber: string;
  dependentCode: string;
  patientDob: string;
  scheme: string;
  bhfNumber?: string;
}): Promise<EligibilityResult & { routedTo: SwitchProvider }> {
  const routing = routeClaim(data.scheme);

  let result: EligibilityResult;

  switch (routing.switchProvider) {
    case "medikredit":
      result = await checkMediKreditEligibility(data);
      break;
    case "switchon":
      result = await checkSwitchOnEligibility(data);
      break;
    case "healthbridge":
    default:
      result = await checkHealthbridge(data);
      break;
  }

  return { ...result, routedTo: routing.switchProvider };
}

/** Compute rolling error rate from the window */
function computeRollingErrorRate(window: boolean[]): number {
  if (window.length === 0) return 0;
  const errors = window.filter(v => !v).length;
  return errors / window.length;
}

/** Determine health status from metrics */
function computeHealthStatus(record: SwitchHealthRecord): SwitchHealthStatus {
  if (record.totalRequests < HEALTH_THRESHOLDS.minSamples) return "unknown";
  if (record.errorRateEma > HEALTH_THRESHOLDS.errorRateFailover) return "unhealthy";
  if (record.latencyEmaMs > HEALTH_THRESHOLDS.latencyFailoverMs) return "unhealthy";
  if (record.errorRateEma > 0.2 || record.latencyEmaMs > 500) return "degraded";
  return "healthy";
}

/** Check if a switch is healthy enough for routing */
function isSwitchHealthy(provider: SwitchProvider): boolean {
  const health = switchHealthCache.get(provider);
  if (!health) return true; // Assume healthy if no data yet

  // Check data freshness — stale data defaults to healthy (optimistic)
  const age = Date.now() - new Date(health.lastChecked).getTime();
  if (age > HEALTH_THRESHOLDS.stalenessMs) return true;

  // Not enough data to judge — assume healthy
  if (health.totalRequests < HEALTH_THRESHOLDS.minSamples) return true;

  // Failover triggers
  if (health.errorRateEma > HEALTH_THRESHOLDS.errorRateFailover) {
    logger.warn(`[switch-health] ${provider} UNHEALTHY — error rate ${(health.errorRateEma * 100).toFixed(1)}% > ${HEALTH_THRESHOLDS.errorRateFailover * 100}%`);
    return false;
  }
  if (health.latencyEmaMs > HEALTH_THRESHOLDS.latencyFailoverMs) {
    logger.warn(`[switch-health] ${provider} UNHEALTHY — latency ${health.latencyEmaMs.toFixed(0)}ms > ${HEALTH_THRESHOLDS.latencyFailoverMs}ms`);
    return false;
  }

  return health.available;
}

/**
 * Update switch health metrics after a request.
 * Uses EMA (Exponential Moving Average) for smooth tracking.
 * - Latency EMA alpha = 0.3 (responsive to recent changes)
 * - Error rate EMA alpha = 0.2
 * - Rolling window of last 50 requests for windowed error rate
 */
export function updateSwitchHealth(provider: SwitchProvider, success: boolean, latencyMs: number): void {
  const now = new Date().toISOString();
  const existing = switchHealthCache.get(provider);

  if (existing) {
    // Update EMA for error rate
    const errorValue = success ? 0 : 1;
    existing.errorRateEma = existing.errorRateEma * (1 - HEALTH_THRESHOLDS.errorRateAlpha)
      + errorValue * HEALTH_THRESHOLDS.errorRateAlpha;

    // Update EMA for latency
    existing.latencyEmaMs = existing.latencyEmaMs * (1 - HEALTH_THRESHOLDS.latencyAlpha)
      + latencyMs * HEALTH_THRESHOLDS.latencyAlpha;

    // Update rolling windows
    existing.rollingWindow.push(success);
    if (existing.rollingWindow.length > HEALTH_THRESHOLDS.rollingWindowSize) {
      existing.rollingWindow.shift();
    }
    existing.latencyWindow.push(latencyMs);
    if (existing.latencyWindow.length > HEALTH_THRESHOLDS.rollingWindowSize) {
      existing.latencyWindow.shift();
    }

    // Update counters
    existing.totalRequests++;
    if (!success) existing.totalErrors++;
    existing.lastChecked = now;

    // Track consecutive failures
    if (success) {
      existing.consecutiveFailures = 0;
      existing.lastHealthy = now;
    } else {
      existing.consecutiveFailures++;
    }

    // Recompute health status
    existing.status = computeHealthStatus(existing);
    existing.available = existing.status !== "unhealthy";

    if (existing.status === "unhealthy") {
      logger.warn(`[switch-health] ${provider} marked UNHEALTHY — errorRate=${(existing.errorRateEma * 100).toFixed(1)}%, latency=${existing.latencyEmaMs.toFixed(0)}ms, consecutiveFailures=${existing.consecutiveFailures}`);
    }
  } else {
    const record: SwitchHealthRecord = {
      provider,
      available: success,
      latencyEmaMs: latencyMs,
      errorRateEma: success ? 0 : 1,
      rollingWindow: [success],
      latencyWindow: [latencyMs],
      totalRequests: 1,
      totalErrors: success ? 0 : 1,
      lastChecked: now,
      lastHealthy: success ? now : null,
      status: "unknown",
      consecutiveFailures: success ? 0 : 1,
    };
    record.status = computeHealthStatus(record);
    switchHealthCache.set(provider, record);
  }
}

/**
 * Get detailed health report for all switches.
 * Includes EMA metrics, rolling window stats, and health status.
 */
export function getSwitchHealthReport(): {
  provider: SwitchProvider;
  status: SwitchHealthStatus;
  errorRateEma: number;
  errorRateRolling: number;
  latencyEmaMs: number;
  latencyP95Ms: number;
  totalRequests: number;
  totalErrors: number;
  consecutiveFailures: number;
  lastChecked: string | null;
  lastHealthy: string | null;
}[] {
  const providers: SwitchProvider[] = ["healthbridge", "medikredit", "switchon"];

  return providers.map(provider => {
    const health = switchHealthCache.get(provider);
    if (!health) {
      return {
        provider,
        status: "unknown" as SwitchHealthStatus,
        errorRateEma: 0,
        errorRateRolling: 0,
        latencyEmaMs: 0,
        latencyP95Ms: 0,
        totalRequests: 0,
        totalErrors: 0,
        consecutiveFailures: 0,
        lastChecked: null,
        lastHealthy: null,
      };
    }

    // Calculate P95 latency from window
    const sortedLatencies = [...health.latencyWindow].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedLatencies.length * 0.95);
    const latencyP95Ms = sortedLatencies[p95Index] ?? 0;

    return {
      provider,
      status: health.status,
      errorRateEma: health.errorRateEma,
      errorRateRolling: computeRollingErrorRate(health.rollingWindow),
      latencyEmaMs: health.latencyEmaMs,
      latencyP95Ms,
      totalRequests: health.totalRequests,
      totalErrors: health.totalErrors,
      consecutiveFailures: health.consecutiveFailures,
      lastChecked: health.lastChecked,
      lastHealthy: health.lastHealthy,
    };
  });
}

/** Reset health data for a specific switch (e.g. after maintenance) */
export function resetSwitchHealth(provider: SwitchProvider): void {
  switchHealthCache.delete(provider);
  logger.warn(`[switch-health] Reset health data for ${provider}`);
}

/**
 * Get all configured switches and their health status.
 */
export function getSwitchStatus(): {
  provider: SwitchProvider;
  configured: boolean;
  healthy: boolean;
  status: SwitchHealthStatus;
  latencyMs: number;
  errorRate: number;
  schemes: string[];
}[] {
  const configs = getSwitchConfigs();
  const providers: SwitchProvider[] = ["healthbridge", "medikredit", "switchon"];

  return providers.map(provider => {
    const health = switchHealthCache.get(provider);
    const schemes = SCHEME_ROUTING_TABLE
      .filter(r => r.primarySwitch === provider)
      .map(r => r.scheme);

    return {
      provider,
      configured: configs.has(provider),
      healthy: isSwitchHealthy(provider),
      status: health?.status ?? "unknown",
      latencyMs: health?.latencyEmaMs ?? 0,
      errorRate: health?.errorRateEma ?? 0,
      schemes,
    };
  });
}
