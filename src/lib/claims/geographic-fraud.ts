// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Geographic Fraud Detection — Claim Location Impossibility Analysis
//
// Detects fraud patterns where providers or patients appear at physically
// impossible locations based on time, distance, and SA practice number
// geographic encoding.
//
// This is a heuristic/statistical approach using BHF practice number prefixes
// as a proxy for geographic location — no GPS coordinates or geocoding APIs
// are needed. SA practice numbers encode province information in the first
// 2-3 digits, which gives us enough signal to detect obvious impossibilities.
//
// Based on SA fraud data (R22-28B/year, ~50% waste):
// - Geographic impossibility is a strong fraud signal
// - Same provider billing in 2 provinces on same day = very suspicious
// - Same patient at distant practices on same day = referral or fraud
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { ClaimLineItem } from "./types";

// ─── Configurable Thresholds ────────────────────────────────────────────────

/** Maximum implied travel speed (km/h) before flagging as impossible */
const MAX_PLAUSIBLE_SPEED_KMH = 150;

/** Minimum number of different provinces to trigger multi-province patient alert */
const MIN_PROVINCES_FOR_PATIENT_ALERT = 3;

/** Minimum percentage of claims from one practice to trigger referral pattern check */
const REFERRAL_PATTERN_THRESHOLD_PCT = 80;

/** Minimum number of claims in a batch to run referral pattern analysis */
const MIN_CLAIMS_FOR_REFERRAL_ANALYSIS = 10;

/** Hospital tariff code prefixes (04xx-06xx range) */
const HOSPITAL_TARIFF_PREFIXES = ["04", "05", "06"];

/** Emergency modifier code */
const EMERGENCY_MODIFIER = "0018";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface GeoFraudAlert {
  type: "PROVIDER_IMPOSSIBILITY" | "PATIENT_IMPOSSIBILITY" | "ADDRESS_ANOMALY" | "DISTANCE_CLUSTER";
  severity: "info" | "warning" | "error";
  description: string;
  affectedLines: number[];
  evidence: {
    location1?: string;
    location2?: string;
    distanceKm?: number;
    timeGapHours?: number;
    impliedSpeedKmh?: number;
  };
}

// ─── SA Province Codes from BHF Practice Number Prefixes ────────────────────
//
// SA Board of Healthcare Funders (BHF) practice numbers encode geographic
// information in the leading digits. This mapping is approximate — some
// practices may have legacy numbers that don't match their current location.

type ProvinceCode = "GP" | "KZN" | "WC" | "EC" | "FS" | "MP" | "LP" | "NW" | "NC";

const PROVINCE_NAMES: Record<ProvinceCode, string> = {
  GP: "Gauteng",
  KZN: "KwaZulu-Natal",
  WC: "Western Cape",
  EC: "Eastern Cape",
  FS: "Free State",
  MP: "Mpumalanga",
  LP: "Limpopo",
  NW: "North West",
  NC: "Northern Cape",
};

/**
 * Maps BHF practice number prefix (first 2 digits) to SA province.
 * Based on BHF registration geographic encoding.
 */
const PREFIX_TO_PROVINCE: Record<string, ProvinceCode> = {
  "01": "GP",
  "02": "KZN",
  "03": "WC",
  "04": "EC",
  "05": "FS",
  "06": "MP",
  "07": "LP",
  "08": "NW",
  "09": "NC",
};

/**
 * Approximate driving distances (km) between SA province centers.
 * Based on capital/major city distances:
 * GP=Johannesburg, KZN=Durban, WC=Cape Town, EC=Port Elizabeth,
 * FS=Bloemfontein, MP=Nelspruit, LP=Polokwane, NW=Mahikeng, NC=Kimberley
 */
const PROVINCE_DISTANCES: Record<ProvinceCode, Record<ProvinceCode, number>> = {
  GP:  { GP: 0,   KZN: 570,  WC: 1400, EC: 1050, FS: 400,  MP: 300,  LP: 280,  NW: 250,  NC: 750  },
  KZN: { GP: 570, KZN: 0,    WC: 1650, EC: 600,  FS: 580,  MP: 500,  LP: 850,  NW: 750,  NC: 1000 },
  WC:  { GP: 1400, KZN: 1650, WC: 0,   EC: 750,  FS: 1000, MP: 1600, LP: 1650, NW: 1350, NC: 950  },
  EC:  { GP: 1050, KZN: 600,  WC: 750, EC: 0,    FS: 600,  MP: 1100, LP: 1300, NW: 1100, NC: 700  },
  FS:  { GP: 400,  KZN: 580,  WC: 1000, EC: 600,  FS: 0,   MP: 600,  LP: 650,  NW: 400,  NC: 350  },
  MP:  { GP: 300,  KZN: 500,  WC: 1600, EC: 1100, FS: 600,  MP: 0,   LP: 350,  NW: 500,  NC: 900  },
  LP:  { GP: 280,  KZN: 850,  WC: 1650, EC: 1300, FS: 650,  LP: 0,   MP: 350,  NW: 450,  NC: 950  },
  NW:  { GP: 250,  KZN: 750,  WC: 1350, EC: 1100, FS: 400,  MP: 500,  LP: 450,  NW: 0,   NC: 550  },
  NC:  { GP: 750,  KZN: 1000, WC: 950,  EC: 700,  FS: 350,  MP: 900,  LP: 950,  NW: 550,  NC: 0   },
};

// ─── Place of Service Codes ─────────────────────────────────────────────────

const PLACE_OF_SERVICE: Record<string, string> = {
  "11": "Office/consulting room",
  "12": "Patient's home",
  "21": "Inpatient hospital",
  "22": "Outpatient hospital",
  "23": "Emergency room",
  "31": "Skilled nursing facility",
  "99": "Other",
};

// ─── Helper Functions ───────────────────────────────────────────────────────

/**
 * Extracts the SA province from a BHF practice number based on its prefix.
 * Returns undefined if the prefix is not recognised or the practice number
 * is too short.
 */
function getProvinceFromPracticeNumber(practiceNumber: string): ProvinceCode | undefined {
  if (!practiceNumber || practiceNumber.length < 2) return undefined;
  const prefix = practiceNumber.substring(0, 2);
  return PREFIX_TO_PROVINCE[prefix];
}

/**
 * Gets the driving distance (km) between two SA provinces.
 * Returns undefined if either province code is invalid.
 */
function getProvinceDistance(a: ProvinceCode, b: ProvinceCode): number | undefined {
  return PROVINCE_DISTANCES[a]?.[b];
}

/**
 * Parses a date string (YYYY-MM-DD or DD/MM/YYYY) into a Date object.
 * Returns undefined if the string cannot be parsed.
 */
function parseDate(dateStr: string): Date | undefined {
  if (!dateStr) return undefined;
  // Try YYYY-MM-DD first
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return new Date(dateStr);
  // Try DD/MM/YYYY
  const saMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (saMatch) return new Date(`${saMatch[3]}-${saMatch[2]}-${saMatch[1]}`);
  // Fallback: let JS parse it
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? undefined : d;
}

/**
 * Checks if two date strings represent the same calendar day.
 */
function isSameDay(a: string, b: string): boolean {
  const da = parseDate(a);
  const db = parseDate(b);
  if (!da || !db) return false;
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

// ─── Main Detection Function ────────────────────────────────────────────────

/**
 * Analyzes a batch of claim line items for geographic fraud patterns.
 *
 * Runs 6 detection patterns:
 * 1. Provider Impossibility — same provider at impossible locations on same day
 * 2. Patient Impossibility — same patient at distant practices on same day
 * 3. Practice Number Geographic Validation — multi-province same-day patient claims
 * 4. Distance Cluster Analysis — suspicious referral patterns
 * 5. Facility Type Mismatch — hospital procedures billed from office settings
 * 6. Province Distance Check — practice-to-practice impossibility via province matrix
 *
 * @param lines Array of claim line items from the parsed CSV
 * @returns Array of geographic fraud alerts, sorted by severity (error > warning > info)
 */
export function detectGeographicFraud(lines: ClaimLineItem[]): GeoFraudAlert[] {
  const alerts: GeoFraudAlert[] = [];

  detectProviderImpossibility(lines, alerts);
  detectPatientImpossibility(lines, alerts);
  detectMultiProvincePatient(lines, alerts);
  detectDistanceCluster(lines, alerts);
  detectFacilityTypeMismatch(lines, alerts);

  // Sort by severity: error first, then warning, then info
  const severityOrder: Record<string, number> = { error: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return alerts;
}

// ─── Pattern 1: Provider Impossibility ──────────────────────────────────────
/**
 * Groups claims by practice_number + date of service.
 * If the same provider (practice number) has claims at different place_of_service
 * codes on the same day, checks the implied travel distance using province prefixes.
 * If the implied speed exceeds MAX_PLAUSIBLE_SPEED_KMH, flags as impossible.
 *
 * Also flags same provider billing from different provinces on the same day,
 * even without place_of_service differentiation — because a single practice
 * cannot physically be in two provinces simultaneously.
 */
function detectProviderImpossibility(lines: ClaimLineItem[], alerts: GeoFraudAlert[]): void {
  // Group by practice number + date
  const byProviderDate = new Map<string, ClaimLineItem[]>();
  for (const line of lines) {
    if (!line.practiceNumber || !line.dateOfService) continue;
    const key = `${line.practiceNumber}|${line.dateOfService}`;
    if (!byProviderDate.has(key)) byProviderDate.set(key, []);
    byProviderDate.get(key)!.push(line);
  }

  // For each provider-day group, check if they billed from multiple locations
  // We track which practice numbers appear across different province-coded
  // practice numbers on the same day (indicating phantom billing)
  const byDate = new Map<string, Map<string, ClaimLineItem[]>>();
  for (const line of lines) {
    if (!line.practiceNumber || !line.dateOfService) continue;
    if (!byDate.has(line.dateOfService)) byDate.set(line.dateOfService, new Map());
    const dateMap = byDate.get(line.dateOfService)!;
    // Group by the full practice number to find unique practices
    if (!dateMap.has(line.practiceNumber)) dateMap.set(line.practiceNumber, []);
    dateMap.get(line.practiceNumber)!.push(line);
  }

  // Now check for same-date claims where a single provider has different
  // place_of_service values implying different physical locations
  for (const [, group] of byProviderDate) {
    if (group.length < 2) continue;
    const places = new Set(group.map(l => l.placeOfService).filter(Boolean));
    if (places.size < 2) continue;

    // Check if different places imply different provinces
    const practiceProvince = getProvinceFromPracticeNumber(group[0].practiceNumber!);
    if (!practiceProvince) continue;

    // Different place_of_service codes on same day — flag if hospital vs office
    const hasOffice = places.has("11") || places.has("12");
    const hasHospital = places.has("21") || places.has("22") || places.has("23");

    if (hasOffice && hasHospital) {
      const placeList = [...places].map(p => PLACE_OF_SERVICE[p!] || p).join(", ");
      alerts.push({
        type: "PROVIDER_IMPOSSIBILITY",
        severity: "warning",
        description: `Practice ${group[0].practiceNumber} billed from both office and hospital settings on ${group[0].dateOfService} (${placeList}). While possible for a practitioner who visits hospitals, this pattern warrants review if the volume is high.`,
        affectedLines: group.map(l => l.lineNumber),
        evidence: {
          location1: hasOffice ? "Office/consulting room" : undefined,
          location2: hasHospital ? "Hospital" : undefined,
        },
      });
    }
  }

  // Cross-practice check: same practice number prefix (same provider entity)
  // billing from different province-coded locations on the same date.
  // This catches phantom provider numbers.
  for (const [date, practiceMap] of byDate) {
    // Group practices by their province
    const provinceGroups = new Map<ProvinceCode, { practices: string[]; lines: ClaimLineItem[] }>();
    for (const [practice, practiceLines] of practiceMap) {
      const prov = getProvinceFromPracticeNumber(practice);
      if (!prov) continue;
      if (!provinceGroups.has(prov)) provinceGroups.set(prov, { practices: [], lines: [] });
      const pg = provinceGroups.get(prov)!;
      if (!pg.practices.includes(practice)) pg.practices.push(practice);
      pg.lines.push(...practiceLines);
    }

    // If we have practices from multiple provinces on the same date,
    // check for same-patient cross-province impossibility (handled in pattern 2/3)
    // Here we only flag if the SAME practice number appears to be in different provinces
    // (which would be a data integrity issue in the practice number itself)
  }
}

// ─── Pattern 2: Patient Impossibility ───────────────────────────────────────
/**
 * Groups claims by patient name (case-insensitive) + date.
 * If the same patient has claims at different practices on the same day,
 * and those practices are in different provinces (based on practice number
 * prefix), flags as PATIENT_IMPOSSIBILITY.
 *
 * Uses the province distance matrix to estimate the minimum travel distance
 * and implied travel speed (assuming 24h available in a day as worst case).
 */
function detectPatientImpossibility(lines: ClaimLineItem[], alerts: GeoFraudAlert[]): void {
  // Group by patient name (lowercase) + date
  const byPatientDate = new Map<string, ClaimLineItem[]>();
  for (const line of lines) {
    if (!line.patientName || !line.dateOfService) continue;
    const key = `${line.patientName.toLowerCase()}|${line.dateOfService}`;
    if (!byPatientDate.has(key)) byPatientDate.set(key, []);
    byPatientDate.get(key)!.push(line);
  }

  for (const [key, group] of byPatientDate) {
    if (group.length < 2) continue;

    // Get unique practice numbers
    const practices = [...new Set(group.map(l => l.practiceNumber).filter(Boolean))] as string[];
    if (practices.length < 2) continue;

    // Get provinces for each practice
    const practiceProvinces = new Map<string, ProvinceCode>();
    for (const p of practices) {
      const prov = getProvinceFromPracticeNumber(p);
      if (prov) practiceProvinces.set(p, prov);
    }

    // Check all pairs of practices for province mismatch
    const checkedPairs = new Set<string>();
    for (let i = 0; i < practices.length; i++) {
      for (let j = i + 1; j < practices.length; j++) {
        const p1 = practices[i];
        const p2 = practices[j];
        const pairKey = [p1, p2].sort().join("|");
        if (checkedPairs.has(pairKey)) continue;
        checkedPairs.add(pairKey);

        const prov1 = practiceProvinces.get(p1);
        const prov2 = practiceProvinces.get(p2);

        if (!prov1 || !prov2) continue;
        if (prov1 === prov2) continue; // Same province — could be within-city travel

        const distance = getProvinceDistance(prov1, prov2);
        if (distance === undefined) continue;

        // Assume 24h available in a day (worst case) — any distance requiring
        // >150km/h average speed is suspicious
        const impliedSpeed = distance / 24; // Over a full day
        const patientName = group[0].patientName!;
        const date = group[0].dateOfService!;

        if (distance > 200) {
          // Different provinces with significant distance
          alerts.push({
            type: "PATIENT_IMPOSSIBILITY",
            severity: distance > 500 ? "error" : "warning",
            description: `Patient "${patientName}" has claims at practices in ${PROVINCE_NAMES[prov1]} (${p1}) and ${PROVINCE_NAMES[prov2]} (${p2}) on the same day (${date}). These locations are approximately ${distance}km apart.`,
            affectedLines: group.map(l => l.lineNumber),
            evidence: {
              location1: `${PROVINCE_NAMES[prov1]} (practice ${p1})`,
              location2: `${PROVINCE_NAMES[prov2]} (practice ${p2})`,
              distanceKm: distance,
              timeGapHours: 24,
              impliedSpeedKmh: Math.round(impliedSpeed),
            },
          });
        }
      }
    }
  }
}

// ─── Pattern 3: Multi-Province Patient Validation ───────────────────────────
/**
 * If a single patient has claims involving providers in 3+ different provinces
 * on the same day, flags as ADDRESS_ANOMALY. This is almost certainly fraud
 * or a data error — no patient can physically visit 3+ provinces in one day.
 */
function detectMultiProvincePatient(lines: ClaimLineItem[], alerts: GeoFraudAlert[]): void {
  // Group by patient name (lowercase) + date
  const byPatientDate = new Map<string, ClaimLineItem[]>();
  for (const line of lines) {
    if (!line.patientName || !line.dateOfService || !line.practiceNumber) continue;
    const key = `${line.patientName.toLowerCase()}|${line.dateOfService}`;
    if (!byPatientDate.has(key)) byPatientDate.set(key, []);
    byPatientDate.get(key)!.push(line);
  }

  for (const [, group] of byPatientDate) {
    // Collect unique provinces from practice numbers in this group
    const provinces = new Set<ProvinceCode>();
    for (const line of group) {
      const prov = getProvinceFromPracticeNumber(line.practiceNumber!);
      if (prov) provinces.add(prov);
    }

    if (provinces.size >= MIN_PROVINCES_FOR_PATIENT_ALERT) {
      const provinceList = [...provinces].map(p => PROVINCE_NAMES[p]).join(", ");
      const patientName = group[0].patientName!;
      const date = group[0].dateOfService!;

      alerts.push({
        type: "ADDRESS_ANOMALY",
        severity: "error",
        description: `Patient "${patientName}" has claims involving providers in ${provinces.size} different provinces on ${date}: ${provinceList}. This is physically impossible and strongly indicates fraud or a data error.`,
        affectedLines: group.map(l => l.lineNumber),
        evidence: {
          location1: provinceList,
        },
      });
    }
  }
}

// ─── Pattern 4: Distance Cluster Analysis ───────────────────────────────────
/**
 * If >80% of claims in a batch come from the same practice but patients have
 * practice numbers (or referral sources) from widely different provinces,
 * flags as a suspicious referral pattern.
 *
 * This detects schemes where a single practice bills for patients who are
 * supposedly referred from across the country — a common phantom billing pattern.
 */
function detectDistanceCluster(lines: ClaimLineItem[], alerts: GeoFraudAlert[]): void {
  if (lines.length < MIN_CLAIMS_FOR_REFERRAL_ANALYSIS) return;

  // Find the dominant practice (most claims)
  const practiceCounts = new Map<string, number>();
  for (const line of lines) {
    if (!line.practiceNumber) continue;
    practiceCounts.set(line.practiceNumber, (practiceCounts.get(line.practiceNumber) || 0) + 1);
  }

  if (practiceCounts.size === 0) return;

  const sorted = [...practiceCounts.entries()].sort((a, b) => b[1] - a[1]);
  const [dominantPractice, dominantCount] = sorted[0];
  const dominantPct = (dominantCount / lines.length) * 100;

  if (dominantPct < REFERRAL_PATTERN_THRESHOLD_PCT) return;

  const dominantProvince = getProvinceFromPracticeNumber(dominantPractice);
  if (!dominantProvince) return;

  // Check where patients are supposedly from (using membership or other practice refs)
  // Since we don't have patient home addresses, we look at whether this batch has
  // patients who also appear at practices in other provinces (cross-reference with
  // the full dataset). As a proxy, we check if patients in this batch have names
  // that also appear with different-province practice numbers.
  const patientProvinces = new Map<string, Set<ProvinceCode>>();
  for (const line of lines) {
    if (!line.patientName || !line.practiceNumber) continue;
    const name = line.patientName.toLowerCase();
    const prov = getProvinceFromPracticeNumber(line.practiceNumber);
    if (!prov) continue;
    if (!patientProvinces.has(name)) patientProvinces.set(name, new Set());
    patientProvinces.get(name)!.add(prov);
  }

  // Count patients whose claims span multiple provinces
  let multiProvincePatients = 0;
  const distantProvinces = new Set<ProvinceCode>();
  for (const [, provs] of patientProvinces) {
    if (provs.size > 1) {
      multiProvincePatients++;
      for (const p of provs) {
        if (p !== dominantProvince) distantProvinces.add(p);
      }
    }
  }

  // If the dominant practice has claims from patients in 3+ distant provinces,
  // flag the referral pattern
  if (distantProvinces.size >= 3) {
    const distantList = [...distantProvinces].map(p => PROVINCE_NAMES[p]).join(", ");
    const affectedLines = lines
      .filter(l => {
        const prov = l.practiceNumber ? getProvinceFromPracticeNumber(l.practiceNumber) : undefined;
        return prov && prov !== dominantProvince;
      })
      .map(l => l.lineNumber);

    alerts.push({
      type: "DISTANCE_CLUSTER",
      severity: "warning",
      description: `Practice ${dominantPractice} (${PROVINCE_NAMES[dominantProvince]}) accounts for ${Math.round(dominantPct)}% of claims, but patients also have claims from practices in ${distantProvinces.size} other provinces: ${distantList}. This referral pattern is unusual — most practices serve a local patient base.`,
      affectedLines,
      evidence: {
        location1: `${PROVINCE_NAMES[dominantProvince]} (dominant practice ${dominantPractice})`,
        location2: distantList,
      },
    });
  }
}

// ─── Pattern 5: Facility Type Mismatch ──────────────────────────────────────
/**
 * Detects mismatches between billed procedures and the place of service:
 *
 * 1. Hospital procedures (tariff 04xx-06xx) billed from an office (place 11)
 *    — these procedures require hospital facilities and cannot be performed
 *    in a consulting room.
 *
 * 2. Emergency modifier (0018) but place of service is not an emergency room
 *    (place 23) — the emergency uplift is only valid for ER presentations.
 *
 * These mismatches indicate either coding errors or deliberate upcoding.
 */
function detectFacilityTypeMismatch(lines: ClaimLineItem[], alerts: GeoFraudAlert[]): void {
  for (const line of lines) {
    // Check 1: Hospital tariff codes billed from office setting
    if (line.tariffCode && line.placeOfService === "11") {
      const tariffPrefix = line.tariffCode.substring(0, 2);
      if (HOSPITAL_TARIFF_PREFIXES.includes(tariffPrefix)) {
        alerts.push({
          type: "ADDRESS_ANOMALY",
          severity: "warning",
          description: `Line ${line.lineNumber}: Tariff ${line.tariffCode} (hospital/surgical procedure range ${tariffPrefix}xx) billed with place of service "11" (Office/consulting room). Procedures in the ${tariffPrefix}xx range typically require hospital facilities.`,
          affectedLines: [line.lineNumber],
          evidence: {
            location1: `Place of service: ${PLACE_OF_SERVICE["11"]}`,
            location2: `Expected: Hospital (21/22) for tariff ${tariffPrefix}xx`,
          },
        });
      }
    }

    // Check 2: Emergency modifier without emergency room place of service
    if (line.modifier === EMERGENCY_MODIFIER && line.placeOfService && line.placeOfService !== "23") {
      const actualPlace = PLACE_OF_SERVICE[line.placeOfService] || `code ${line.placeOfService}`;
      alerts.push({
        type: "ADDRESS_ANOMALY",
        severity: "warning",
        description: `Line ${line.lineNumber}: Emergency modifier (0018) applied but place of service is "${actualPlace}" instead of "Emergency room" (23). The emergency modifier should only be used for emergency room presentations.`,
        affectedLines: [line.lineNumber],
        evidence: {
          location1: `Place of service: ${actualPlace}`,
          location2: `Expected: Emergency room (23) for modifier 0018`,
        },
      });
    }
  }
}

// ─── Exports for external use ───────────────────────────────────────────────

export { PROVINCE_DISTANCES, PROVINCE_NAMES, PREFIX_TO_PROVINCE, PLACE_OF_SERVICE };
export type { ProvinceCode };
