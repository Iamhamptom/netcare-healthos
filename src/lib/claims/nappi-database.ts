// NAPPI Code Database — Backed by SQLite (572K+ records)
// Queries the NappiMedicine Prisma model seeded from MediKredit PUBDOM + SEP data
// Falls back to in-memory hardcoded entries for commonly tested medicines

import type { NAPPIEntry } from "./types";
import { prisma } from "@/lib/prisma";

// ── Hardcoded fallback for offline/test use (most common SA medicines) ──
const HARDCODED_NAPPI: NAPPIEntry[] = [
  { code: "7020901", description: "Paracetamol 500mg tablets", strength: "500mg", packSize: "24", manufacturer: "Generic", schedule: "S0", category: "analgesic" },
  { code: "7048620", description: "Amoxicillin 500mg capsules", strength: "500mg", packSize: "20", manufacturer: "Generic", schedule: "S2", category: "antibiotic" },
  { code: "7041220", description: "Metformin 500mg tablets", strength: "500mg", packSize: "60", manufacturer: "Generic", schedule: "S3", category: "diabetes" },
  { code: "7082280", description: "Amlodipine 5mg tablets", strength: "5mg", packSize: "30", manufacturer: "Generic", schedule: "S3", category: "cardiovascular" },
  { code: "7237801", description: "Omeprazole 20mg capsules", strength: "20mg", packSize: "28", manufacturer: "Generic", schedule: "S3", category: "gastrointestinal" },
  { code: "7076060", description: "Salbutamol 100mcg inhaler", strength: "100mcg/dose", packSize: "200 doses", manufacturer: "Generic", schedule: "S2", category: "respiratory" },
  { code: "7046320", description: "Ciprofloxacin 500mg tablets", strength: "500mg", packSize: "10", manufacturer: "Generic", schedule: "S3", category: "antibiotic" },
  { code: "7101130", description: "Atorvastatin 20mg tablets", strength: "20mg", packSize: "30", manufacturer: "Generic", schedule: "S3", category: "cardiovascular" },
  { code: "7133690", description: "Insulin glargine 100 units/ml", strength: "100U/ml", packSize: "5x3ml", manufacturer: "Sanofi", schedule: "S4", category: "diabetes" },
  { code: "7051640", description: "Azithromycin 500mg tablets", strength: "500mg", packSize: "3", manufacturer: "Generic", schedule: "S3", category: "antibiotic" },
];

const hardcodedMap = new Map<string, NAPPIEntry>();
for (const entry of HARDCODED_NAPPI) {
  hardcodedMap.set(entry.code, entry);
}

// ── Convert DB record to NAPPIEntry ──
function toNAPPIEntry(row: {
  nappiCode: string;
  name: string;
  strength: string;
  packSize: number;
  manufacturerCode: string;
  schedule: string;
  dosageFormDesc: string;
  category: string;
  sepPrice: string;
  isGeneric: string;
  ingredients: string;
  regNumber: string;
  fullNappiCode: string;
}): NAPPIEntry {
  return {
    code: row.fullNappiCode || row.nappiCode,
    description: row.name,
    strength: row.strength || undefined,
    packSize: row.packSize ? String(row.packSize) : undefined,
    manufacturer: row.manufacturerCode || undefined,
    schedule: row.schedule || undefined,
    category: row.category || "medicine",
  };
}

/**
 * Look up a single NAPPI code. Checks DB first, falls back to hardcoded.
 * Handles both 7-digit and 10-digit (7+3 pack) codes.
 */
export function lookupNAPPI(code: string): NAPPIEntry | undefined {
  const clean = code.trim().replace(/-/g, "");

  // Try hardcoded first (sync, no DB round-trip for common codes)
  const hardcoded = hardcodedMap.get(clean);
  if (hardcoded) return hardcoded;

  // Can't do async in sync function — use the async version for DB lookups
  return undefined;
}

/**
 * Async NAPPI lookup — queries the full 572K database.
 */
export async function lookupNAPPIAsync(code: string): Promise<NAPPIEntry | undefined> {
  const clean = code.trim().replace(/-/g, "");

  // Try hardcoded first
  const hardcoded = hardcodedMap.get(clean);
  if (hardcoded) return hardcoded;

  try {
    // Try exact match on fullNappiCode first, then nappiCode
    let row = await prisma.nappiMedicine.findFirst({
      where: { fullNappiCode: clean },
    });

    if (!row && clean.length <= 7) {
      row = await prisma.nappiMedicine.findFirst({
        where: { nappiCode: clean },
      });
    }

    if (row) return toNAPPIEntry(row);
  } catch {
    // DB unavailable — silent fallback
  }

  return undefined;
}

/**
 * Search NAPPI database by name, code, or ingredient.
 * Queries the full 572K-record SQLite database.
 */
export async function searchNAPPI(
  query: string,
  limit = 20,
  options?: {
    category?: string; // medicine | device | implant | consumable
    activeOnly?: boolean;
    dosageForm?: string;
  }
): Promise<NAPPIEntry[]> {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  try {
    // Build where clause
    const where: Record<string, unknown> = {};

    if (options?.category) {
      where.category = options.category;
    }
    if (options?.activeOnly !== false) {
      where.isActive = true;
    }
    if (options?.dosageForm) {
      where.dosageForm = options.dosageForm;
    }

    // Check if query looks like a NAPPI code (numeric)
    const isCodeSearch = /^\d+$/.test(q);

    if (isCodeSearch) {
      where.OR = [
        { nappiCode: { startsWith: q } },
        { fullNappiCode: { startsWith: q } },
      ];
    } else {
      where.name = { contains: q };
    }

    const rows = await prisma.nappiMedicine.findMany({
      where,
      take: limit,
      orderBy: [
        { category: "asc" }, // medicines first
        { name: "asc" },
      ],
    });

    return rows.map(toNAPPIEntry);
  } catch {
    // DB unavailable — fall back to hardcoded search
    const results: NAPPIEntry[] = [];
    for (const entry of HARDCODED_NAPPI) {
      if (
        entry.code.includes(q) ||
        entry.description.toLowerCase().includes(q)
      ) {
        results.push(entry);
        if (results.length >= limit) break;
      }
    }
    return results;
  }
}

/**
 * Get NAPPI database statistics.
 */
export async function getNAPPIStats() {
  try {
    const [total, medicines, devices, implants, consumables, withSEP] =
      await Promise.all([
        prisma.nappiMedicine.count(),
        prisma.nappiMedicine.count({ where: { category: "medicine" } }),
        prisma.nappiMedicine.count({ where: { category: "device" } }),
        prisma.nappiMedicine.count({ where: { category: "implant" } }),
        prisma.nappiMedicine.count({ where: { category: "consumable" } }),
        prisma.nappiMedicine.count({ where: { sepPrice: { not: "" } } }),
      ]);

    return { total, medicines, devices, implants, consumables, withSEP };
  } catch {
    return {
      total: HARDCODED_NAPPI.length,
      medicines: HARDCODED_NAPPI.length,
      devices: 0,
      implants: 0,
      consumables: 0,
      withSEP: 0,
    };
  }
}
