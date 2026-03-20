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

// ─── Switch Availability ────────────────────────────────────────────────────

interface SwitchHealth {
  provider: SwitchProvider;
  available: boolean;
  latencyMs: number;
  lastChecked: string;
  errorRate: number;
}

const switchHealthCache: Map<SwitchProvider, SwitchHealth> = new Map();

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

/** Check if a switch is healthy (recent successful requests, low error rate) */
function isSwitchHealthy(provider: SwitchProvider): boolean {
  const health = switchHealthCache.get(provider);
  if (!health) return true; // Assume healthy if no data
  if (!health.available) return false;
  if (health.errorRate > 0.5) return false; // >50% error rate = unhealthy
  // Check if health data is fresh (within 5 minutes)
  const age = Date.now() - new Date(health.lastChecked).getTime();
  if (age > 300000) return true; // Stale data — assume healthy
  return true;
}

/** Update switch health after a request */
export function updateSwitchHealth(provider: SwitchProvider, success: boolean, latencyMs: number): void {
  const existing = switchHealthCache.get(provider);
  const now = new Date().toISOString();

  if (existing) {
    // Exponential moving average for error rate
    const alpha = 0.1;
    existing.errorRate = existing.errorRate * (1 - alpha) + (success ? 0 : 1) * alpha;
    existing.latencyMs = existing.latencyMs * (1 - alpha) + latencyMs * alpha;
    existing.available = existing.errorRate < 0.8;
    existing.lastChecked = now;
  } else {
    switchHealthCache.set(provider, {
      provider,
      available: success,
      latencyMs,
      lastChecked: now,
      errorRate: success ? 0 : 1,
    });
  }
}

/**
 * Get all configured switches and their health status.
 */
export function getSwitchStatus(): {
  provider: SwitchProvider;
  configured: boolean;
  healthy: boolean;
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
      latencyMs: health?.latencyMs ?? 0,
      errorRate: health?.errorRate ?? 0,
      schemes,
    };
  });
}
