// Multi-switch routing — auto-routes claims to the correct SA switching house
// based on the medical aid scheme. In SA, certain schemes are only accessible
// through specific switches due to historical exclusivity arrangements.

import { MEDICAL_AID_SCHEMES } from "./codes";

export type SwitchProvider = "healthbridge" | "mediswitch" | "medikred";

export interface SwitchRoute {
  provider: SwitchProvider;
  name: string;
  description: string;
  configured: boolean;
  endpoint: string;
}

/** SA switch provider details */
const SWITCH_PROVIDERS: Record<SwitchProvider, { name: string; description: string; envPrefix: string }> = {
  healthbridge: {
    name: "Healthbridge",
    description: "Healthbridge (Pty) Ltd — Discovery Health, Medscheme, Bonitas, Medihelp",
    envPrefix: "HEALTHBRIDGE",
  },
  mediswitch: {
    name: "MediSwitch / SwitchON",
    description: "Altron HealthTech SwitchON — GEMS, Momentum, Bestmed, Fedhealth, Polmed, Sizwe Hosmed",
    envPrefix: "MEDISWITCH",
  },
  medikred: {
    name: "MediKredit HealthNet ST",
    description: "MediKredit — CompCare, Universal Healthcare, smaller schemes",
    envPrefix: "MEDIKRED",
  },
};

/** Extended scheme → switch mapping (more complete than codes.ts) */
const SCHEME_ROUTES: Record<string, SwitchProvider> = {
  // Healthbridge routes (Discovery/Medscheme ecosystem)
  "Discovery Health": "healthbridge",
  "Bonitas": "healthbridge",
  "Medihelp": "healthbridge",
  "Profmed": "healthbridge",
  "Selfmed": "healthbridge",
  "Hosmed": "healthbridge",
  "LA Health": "healthbridge",
  "Sasolmed": "healthbridge",
  "Transmed": "healthbridge",
  "Umvuzo": "healthbridge",

  // MediSwitch/SwitchON routes (Altron ecosystem)
  "GEMS": "mediswitch",
  "Momentum Health": "mediswitch",
  "Bestmed": "mediswitch",
  "Fedhealth": "mediswitch",
  "Polmed": "mediswitch",
  "Sizwe Hosmed": "mediswitch",
  "Bankmed": "mediswitch",
  "Medshield": "mediswitch",
  "Keyhealth": "mediswitch",
  "Resolution Health": "mediswitch",
  "Genesis": "mediswitch",
  "Liberty Medical Scheme": "mediswitch",

  // MediKredit routes
  "CompCare": "medikred",
  "Spectramed": "medikred",
  "Makoti": "medikred",
};

/** Determine which switch to route a claim through based on the scheme name */
export function routeToSwitch(schemeName: string): SwitchRoute {
  // Exact match first
  let provider = SCHEME_ROUTES[schemeName];

  // Fuzzy match if no exact — two-pass strategy to avoid partial misrouting
  // Pass 1: Input contains a known scheme name (strongest match, prefer longest)
  //   e.g. "sizwe hosmed" contains "hosmed" (6) AND "sizwe hosmed" (12) → prefer 12
  // Pass 2: Known scheme name contains the input (weaker, for partial input like "discovery")
  if (!provider && schemeName.trim().length > 0) {
    const lower = schemeName.toLowerCase();
    let bestMatchLength = 0;

    // Pass 1: Input contains scheme name (prefer longest matching scheme)
    for (const [scheme, route] of Object.entries(SCHEME_ROUTES)) {
      const schemeLower = scheme.toLowerCase();
      if (lower.includes(schemeLower) && scheme.length > bestMatchLength) {
        bestMatchLength = scheme.length;
        provider = route;
      }
    }

    // Pass 2: Only if pass 1 found nothing — scheme name contains input
    if (!provider) {
      for (const [scheme, route] of Object.entries(SCHEME_ROUTES)) {
        const schemeLower = scheme.toLowerCase();
        if (schemeLower.includes(lower) && scheme.length > bestMatchLength) {
          bestMatchLength = scheme.length;
          provider = route;
        }
      }
    }
  }

  // Check codes.ts mapping
  if (!provider && MEDICAL_AID_SCHEMES[schemeName]) {
    provider = MEDICAL_AID_SCHEMES[schemeName].switchRoute as SwitchProvider;
  }

  // Default to healthbridge (largest switch)
  if (!provider) provider = "healthbridge";

  const config = SWITCH_PROVIDERS[provider];
  const prefix = config.envPrefix;

  return {
    provider,
    name: config.name,
    description: config.description,
    configured: !!(process.env[`${prefix}_ENDPOINT`] && process.env[`${prefix}_USERNAME`]),
    endpoint: process.env[`${prefix}_ENDPOINT`] || "",
  };
}

/** Get status of all configured switches */
export function getSwitchStatus(): { switches: SwitchRoute[]; configured: number; total: number } {
  const switches: SwitchRoute[] = Object.entries(SWITCH_PROVIDERS).map(([key, config]) => {
    const prefix = config.envPrefix;
    return {
      provider: key as SwitchProvider,
      name: config.name,
      description: config.description,
      configured: !!(process.env[`${prefix}_ENDPOINT`] && process.env[`${prefix}_USERNAME`]),
      endpoint: process.env[`${prefix}_ENDPOINT`] || "",
    };
  });

  return {
    switches,
    configured: switches.filter((s) => s.configured).length,
    total: switches.length,
  };
}

/** Get all schemes supported by a specific switch */
export function getSchemesForSwitch(provider: SwitchProvider): string[] {
  return Object.entries(SCHEME_ROUTES)
    .filter(([, route]) => route === provider)
    .map(([scheme]) => scheme);
}
