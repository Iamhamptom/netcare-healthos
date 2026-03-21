// ICD-10 Master Industry Table (MIT) Loader
// Loads the full 41,009-code SA ICD-10 database from CSV at runtime
// Used as the authoritative existence check — if a code isn't in the MIT, it's invalid

import { readFileSync } from "fs";
import { join } from "path";

export interface MITEntry {
  code: string;
  description: string;
  chapter: string;
  group: string;
  isValidClinical: boolean;   // Valid_ICD10_ClinicalUse = Y
  isValidPrimary: boolean;    // Valid_ICD10_Primary = Y
  isAsterisk: boolean;        // Valid_ICD10_Asterisk = Y
  isDagger: boolean;          // Valid_ICD10_Dagger = Y
  isSequela: boolean;         // Valid_ICD10_Sequelae = Y
  gender: string;             // M, F, or empty
  ageRange: string;           // e.g., "0-28 days", "> 19 years", or empty
}

// Lazy-loaded singleton
let mitMap: Map<string, MITEntry> | null = null;
let mitLoaded = false;

function parseMITLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

function loadMIT(): Map<string, MITEntry> {
  if (mitMap) return mitMap;

  mitMap = new Map();

  try {
    // Try multiple paths (works in both dev and production)
    const possiblePaths = [
      join(process.cwd(), "docs/knowledge/databases/ICD-10_MIT_2021.csv"),
      join(process.cwd(), "public/data/ICD-10_MIT_2021.csv"),
    ];

    let csvContent = "";
    for (const p of possiblePaths) {
      try {
        csvContent = readFileSync(p, "utf-8");
        break;
      } catch { continue; }
    }

    if (!csvContent) {
      console.warn("[MIT] ICD-10 MIT CSV not found — falling back to built-in database only");
      mitLoaded = true;
      return mitMap;
    }

    const lines = csvContent.split("\n");
    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const fields = parseMITLine(line);
      if (fields.length < 16) continue;

      const code = (fields[7] || "").trim().toUpperCase(); // ICD10_Code (column 8, 0-indexed 7)
      if (!code) continue;

      const entry: MITEntry = {
        code,
        description: fields[8] || "",                       // WHO_Full_Desc
        chapter: fields[1] || "",                            // Chapter_No
        group: fields[4] || "",                              // Group_Desc
        isValidClinical: fields[9] === "Y",                  // Valid_ICD10_ClinicalUse
        isValidPrimary: fields[10] === "Y",                  // Valid_ICD10_Primary
        isAsterisk: fields[11] === "Y",                      // Valid_ICD10_Asterisk
        isDagger: fields[12] === "Y",                        // Valid_ICD10_Dagger
        isSequela: fields[13] === "Y",                       // Valid_ICD10_Sequelae
        gender: (fields[15] || "").trim(),                   // Gender (M/F/empty)
        ageRange: (fields[14] || "").trim(),                 // Age_Range
      };

      mitMap.set(code, entry);
    }

    mitLoaded = true;
    console.log(`[MIT] Loaded ${mitMap.size} ICD-10 codes from SA Master Industry Table`);
  } catch (error) {
    console.error("[MIT] Failed to load ICD-10 MIT:", error);
    mitLoaded = true;
  }

  return mitMap;
}

/**
 * Look up a code in the full 41K MIT database.
 * Returns the entry if found, undefined if not.
 */
export function lookupMIT(code: string): MITEntry | undefined {
  const map = loadMIT();
  return map.get(code.toUpperCase().trim());
}

/**
 * Check if a code exists in the MIT (existence validation).
 */
export function codeExistsInMIT(code: string): boolean {
  const map = loadMIT();
  return map.has(code.toUpperCase().trim());
}

/**
 * Get MIT database size (for stats).
 */
export function getMITSize(): number {
  const map = loadMIT();
  return map.size;
}

/**
 * Validate a code against the full MIT.
 * Returns validation issues specific to the MIT check.
 */
export function validateAgainstMIT(code: string): {
  exists: boolean;
  isValidPrimary: boolean;
  isAsterisk: boolean;
  isDagger: boolean;
  gender: string;
  description: string;
} | null {
  const entry = lookupMIT(code);
  if (!entry) return null;

  return {
    exists: true,
    isValidPrimary: entry.isValidPrimary,
    isAsterisk: entry.isAsterisk,
    isDagger: entry.isDagger,
    gender: entry.gender,
    description: entry.description,
  };
}
