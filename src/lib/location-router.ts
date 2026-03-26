/**
 * Multi-Location Routing Engine
 *
 * Routes patients to the nearest practice site based on their location.
 * Supports geo-coordinates, suburb/city names, and province matching.
 */

export interface PracticeSite {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  lat: number;
  lng: number;
  days: string;
  phone: string;
  services: string[];
}

// Registered practice sites (configurable per practice)
const RHEUMCARE_SITES: PracticeSite[] = [
  {
    id: "dgmc",
    name: "Wits Donald Gordon Medical Centre",
    address: "21 Eton Rd, Parktown, Johannesburg, 2193",
    city: "Johannesburg",
    province: "Gauteng",
    lat: -26.1753,
    lng: 28.0407,
    days: "Monday – Friday",
    phone: "011 356 6317",
    services: ["consultation", "infusion", "injection", "ultrasound", "das28", "aspiration"],
  },
  {
    id: "sunward",
    name: "Netcare Sunward Park Hospital",
    address: "Cnr Kingfisher & Swartkoppies Rd, Boksburg, 1459",
    city: "Boksburg",
    province: "Gauteng",
    lat: -26.2197,
    lng: 28.2295,
    days: "Monday & Wednesday",
    phone: "011 918 8000",
    services: ["consultation", "injection", "das28"],
  },
  {
    id: "groenkloof",
    name: "Life Groenkloof Hospital",
    address: "97 George Storrar Dr, Groenkloof, Pretoria, 0181",
    city: "Pretoria",
    province: "Gauteng",
    lat: -25.7803,
    lng: 28.2156,
    days: "Fridays",
    phone: "012 430 6600",
    services: ["consultation", "injection", "das28"],
  },
  {
    id: "trichardt",
    name: "Mediclinic Highveld",
    address: "Hospital St, Trichardt, Mpumalanga, 2300",
    city: "Trichardt",
    province: "Mpumalanga",
    lat: -26.4836,
    lng: 29.3122,
    days: "Last Saturday of month",
    phone: "017 638 5000",
    services: ["consultation", "das28"],
  },
  {
    id: "eswatini",
    name: "Linamandla Medical Centre",
    address: "Manzini, Eswatini",
    city: "Manzini",
    province: "Eswatini",
    lat: -26.4833,
    lng: 31.3667,
    days: "By arrangement",
    phone: "+268 2505 1234",
    services: ["consultation"],
  },
];

// Common suburb-to-site mapping for Gauteng (fast lookup without geocoding)
const SUBURB_MAPPINGS: Record<string, string> = {
  // Johannesburg - route to DGMC
  sandton: "dgmc", parktown: "dgmc", rosebank: "dgmc", houghton: "dgmc",
  hyde_park: "dgmc", melrose: "dgmc", braamfontein: "dgmc", hillbrow: "dgmc",
  yeoville: "dgmc", berea: "dgmc", joubert_park: "dgmc", newtown: "dgmc",
  soweto: "dgmc", orlando: "dgmc", meadowlands: "dgmc", diepkloof: "dgmc",
  randburg: "dgmc", fourways: "dgmc", midrand: "dgmc", alexandra: "dgmc",
  roodepoort: "dgmc", florida: "dgmc", krugersdorp: "dgmc",
  // East Rand - route to Sunward Park
  boksburg: "sunward", benoni: "sunward", kempton_park: "sunward",
  germiston: "sunward", edenvale: "sunward", bedfordview: "sunward",
  springs: "sunward", brakpan: "sunward", alberton: "sunward",
  // Pretoria - route to Groenkloof
  pretoria: "groenkloof", centurion: "groenkloof", hatfield: "groenkloof",
  menlo_park: "groenkloof", brooklyn: "groenkloof", arcadia: "groenkloof",
  sunnyside: "groenkloof", garsfontein: "groenkloof", faerie_glen: "groenkloof",
  montana: "groenkloof", silverton: "groenkloof", mamelodi: "groenkloof",
  // Mpumalanga - route to Trichardt
  trichardt: "trichardt", secunda: "trichardt", witbank: "trichardt",
  emalahleni: "trichardt", middelburg: "trichardt", standerton: "trichardt",
  ermelo: "trichardt", bethal: "trichardt", highveld: "trichardt",
  // Eswatini
  manzini: "eswatini", mbabane: "eswatini", matsapha: "eswatini",
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface RouteResult {
  recommended: PracticeSite;
  distance_km: number | null;
  alternatives: Array<{ site: PracticeSite; distance_km: number | null }>;
  method: "suburb" | "coordinates" | "province" | "default";
}

/**
 * Route a patient to the nearest practice site
 */
export function routeToNearest(input: {
  suburb?: string;
  city?: string;
  province?: string;
  lat?: number;
  lng?: number;
  serviceNeeded?: string;
}): RouteResult {
  let sites = [...RHEUMCARE_SITES];

  // Filter by service if specified
  if (input.serviceNeeded) {
    const filtered = sites.filter(s => s.services.includes(input.serviceNeeded!));
    if (filtered.length > 0) sites = filtered;
  }

  // Method 1: Suburb lookup (fastest, no API needed)
  if (input.suburb) {
    const normalized = input.suburb.toLowerCase().replace(/[^a-z]/g, "_").replace(/_+/g, "_");
    const siteId = SUBURB_MAPPINGS[normalized];
    if (siteId) {
      const recommended = sites.find(s => s.id === siteId) || sites[0];
      const alternatives = sites.filter(s => s.id !== recommended.id).map(s => ({ site: s, distance_km: null }));
      return { recommended, distance_km: null, alternatives, method: "suburb" };
    }
  }

  // Method 2: Coordinates (most accurate)
  if (input.lat && input.lng) {
    const ranked = sites.map(s => ({
      site: s,
      distance_km: Math.round(haversineDistance(input.lat!, input.lng!, s.lat, s.lng) * 10) / 10,
    })).sort((a, b) => a.distance_km - b.distance_km);

    return {
      recommended: ranked[0].site,
      distance_km: ranked[0].distance_km,
      alternatives: ranked.slice(1),
      method: "coordinates",
    };
  }

  // Method 3: Province matching
  if (input.province) {
    const prov = input.province.toLowerCase();
    const match = sites.find(s => s.province.toLowerCase().includes(prov));
    if (match) {
      const alternatives = sites.filter(s => s.id !== match.id).map(s => ({ site: s, distance_km: null }));
      return { recommended: match, distance_km: null, alternatives, method: "province" };
    }
  }

  // Method 4: City matching
  if (input.city) {
    const city = input.city.toLowerCase();
    const match = sites.find(s => s.city.toLowerCase().includes(city));
    if (match) {
      const alternatives = sites.filter(s => s.id !== match.id).map(s => ({ site: s, distance_km: null }));
      return { recommended: match, distance_km: null, alternatives, method: "province" };
    }
  }

  // Default: DGMC (main practice)
  return {
    recommended: sites[0],
    distance_km: null,
    alternatives: sites.slice(1).map(s => ({ site: s, distance_km: null })),
    method: "default",
  };
}

/**
 * Get all practice sites
 */
export function getAllSites(): PracticeSite[] {
  return RHEUMCARE_SITES;
}

/**
 * Check availability for a site on a given day
 */
export function isAvailable(siteId: string, dayOfWeek: string): boolean {
  const site = RHEUMCARE_SITES.find(s => s.id === siteId);
  if (!site) return false;

  const day = dayOfWeek.toLowerCase();
  const siteDays = site.days.toLowerCase();

  if (siteDays.includes("monday") && siteDays.includes("friday") && !siteDays.includes("&")) {
    // Mon-Fri range
    return ["monday", "tuesday", "wednesday", "thursday", "friday"].includes(day);
  }

  if (siteDays.includes("last saturday")) {
    return day === "saturday"; // Simplified — caller should check if it's the last Saturday
  }

  return siteDays.includes(day);
}
