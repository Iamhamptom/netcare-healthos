// NAPPI code lookup — backed by local SQLite (572K+ records)
// Seeded from MediKredit PUBDOM + DoH SEP pricing data
// Falls back to medicineprices.org.za API if DB is unavailable

import { prisma } from "@/lib/prisma";

export interface NAPPIResult {
  nappiCode: string;
  name: string;
  dosageForm: string;
  packSize: string;
  manufacturer: string;
  /** Single Exit Price in ZAR cents */
  sepPrice: number;
  /** Dispensing fee in ZAR cents */
  dispensingFee: number;
  schedule: string; // S0-S8
}

function parseZAR(s: string): number {
  // "R 399.78" → 39978 (cents)
  const num = parseFloat(s.replace(/[^0-9.]/g, "") || "0");
  return Math.round(num * 100);
}

function toNAPPIResult(row: {
  nappiCode: string;
  fullNappiCode: string;
  name: string;
  dosageFormDesc: string;
  packSize: number;
  manufacturerCode: string;
  sepPrice: string;
  dispensingFee: string;
  schedule: string;
}): NAPPIResult {
  return {
    nappiCode: row.fullNappiCode || row.nappiCode,
    name: row.name,
    dosageForm: row.dosageFormDesc,
    packSize: row.packSize ? String(row.packSize) : "",
    manufacturer: row.manufacturerCode,
    sepPrice: parseZAR(row.sepPrice),
    dispensingFee: parseZAR(row.dispensingFee),
    schedule: row.schedule,
  };
}

/** Search for medicines by name or code — queries 572K local records */
export async function searchNAPPI(query: string, limit = 20): Promise<NAPPIResult[]> {
  const q = query.trim();
  if (!q) return [];

  try {
    const isCode = /^\d+$/.test(q);
    const where = isCode
      ? { OR: [{ nappiCode: { startsWith: q } }, { fullNappiCode: { startsWith: q } }] }
      : { name: { contains: q } };

    const rows = await prisma.nappiMedicine.findMany({
      where: { ...where, isActive: true },
      take: limit,
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    if (rows.length > 0) return rows.map(toNAPPIResult);
  } catch {
    // DB unavailable
  }

  // Fallback to external API
  return searchNAPPIExternal(q, limit);
}

/** Lookup a specific NAPPI code — local DB first, then external API */
export async function lookupNAPPI(nappiCode: string): Promise<NAPPIResult | null> {
  const clean = nappiCode.trim().replace(/-/g, "");
  if (!clean) return null;

  try {
    let row = await prisma.nappiMedicine.findFirst({
      where: { fullNappiCode: clean },
    });
    if (!row && clean.length <= 7) {
      row = await prisma.nappiMedicine.findFirst({
        where: { nappiCode: clean },
      });
    }
    if (row) return toNAPPIResult(row);
  } catch {
    // DB unavailable
  }

  // Fallback to external API
  return lookupNAPPIExternal(clean);
}

// ── External API fallbacks ──

async function searchNAPPIExternal(query: string, limit: number): Promise<NAPPIResult[]> {
  try {
    const url = `https://medicineprices.org.za/api/search?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return searchNAPPIFallback(query);

    const data = (await response.json()) as {
      nappi_code?: string; name?: string; dosage_form?: string;
      pack_size?: string; manufacturer?: string; sep?: string;
      dispensing_fee?: string; schedule?: string;
    }[];

    return (data || []).slice(0, limit).map((item) => ({
      nappiCode: item.nappi_code || "",
      name: item.name || "",
      dosageForm: item.dosage_form || "",
      packSize: item.pack_size || "",
      manufacturer: item.manufacturer || "",
      sepPrice: Math.round(parseFloat(item.sep || "0") * 100),
      dispensingFee: Math.round(parseFloat(item.dispensing_fee || "0") * 100),
      schedule: item.schedule || "",
    }));
  } catch {
    return searchNAPPIFallback(query);
  }
}

async function lookupNAPPIExternal(nappiCode: string): Promise<NAPPIResult | null> {
  try {
    const url = `https://medicineprices.org.za/api/search?q=${encodeURIComponent(nappiCode)}`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;

    const data = (await response.json()) as {
      nappi_code?: string; name?: string; dosage_form?: string;
      pack_size?: string; manufacturer?: string; sep?: string;
      dispensing_fee?: string; schedule?: string;
    }[];
    const match = (data || []).find((item) => item.nappi_code === nappiCode);
    if (!match) return null;

    return {
      nappiCode: match.nappi_code || "",
      name: match.name || "",
      dosageForm: match.dosage_form || "",
      packSize: match.pack_size || "",
      manufacturer: match.manufacturer || "",
      sepPrice: Math.round(parseFloat(match.sep || "0") * 100),
      dispensingFee: Math.round(parseFloat(match.dispensing_fee || "0") * 100),
      schedule: match.schedule || "",
    };
  } catch {
    return null;
  }
}

/** Hardcoded fallback for when both DB and API are down */
function searchNAPPIFallback(query: string): NAPPIResult[] {
  const q = query.toLowerCase();
  return COMMON_MEDICINES.filter(
    (m) => m.name.toLowerCase().includes(q) || m.nappiCode.includes(q)
  );
}

const COMMON_MEDICINES: NAPPIResult[] = [
  { nappiCode: "7081709001", name: "Metformin 500mg tablets", dosageForm: "Tablet", packSize: "60", manufacturer: "Adcock Ingram", sepPrice: 5490, dispensingFee: 2640, schedule: "S3" },
  { nappiCode: "7086300001", name: "Amlodipine 5mg tablets", dosageForm: "Tablet", packSize: "30", manufacturer: "Pharma Dynamics", sepPrice: 3290, dispensingFee: 2640, schedule: "S3" },
  { nappiCode: "7089803001", name: "Atorvastatin 20mg tablets", dosageForm: "Tablet", packSize: "30", manufacturer: "Pharma Dynamics", sepPrice: 6990, dispensingFee: 2640, schedule: "S3" },
  { nappiCode: "7060102001", name: "Amoxicillin 500mg capsules", dosageForm: "Capsule", packSize: "20", manufacturer: "Sandoz", sepPrice: 4590, dispensingFee: 2640, schedule: "S2" },
  { nappiCode: "7014901001", name: "Paracetamol 500mg tablets", dosageForm: "Tablet", packSize: "24", manufacturer: "Adco", sepPrice: 1290, dispensingFee: 2640, schedule: "S0" },
  { nappiCode: "7021502001", name: "Ibuprofen 400mg tablets", dosageForm: "Tablet", packSize: "24", manufacturer: "Adco", sepPrice: 2190, dispensingFee: 2640, schedule: "S2" },
  { nappiCode: "7093901001", name: "Omeprazole 20mg capsules", dosageForm: "Capsule", packSize: "28", manufacturer: "Pharma Dynamics", sepPrice: 4890, dispensingFee: 2640, schedule: "S2" },
  { nappiCode: "7055301001", name: "Prednisone 5mg tablets", dosageForm: "Tablet", packSize: "30", manufacturer: "Aspen", sepPrice: 3190, dispensingFee: 2640, schedule: "S4" },
  { nappiCode: "7042701001", name: "Losartan 50mg tablets", dosageForm: "Tablet", packSize: "30", manufacturer: "Pharma Dynamics", sepPrice: 5290, dispensingFee: 2640, schedule: "S3" },
  { nappiCode: "7098801001", name: "Salbutamol 100mcg inhaler", dosageForm: "Inhaler", packSize: "200 doses", manufacturer: "GSK", sepPrice: 6890, dispensingFee: 2640, schedule: "S3" },
];
