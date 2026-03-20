// NAPPI code lookup via medicineprices.org.za (open-source, Code4SA)
// Free API — no API key needed. Returns SA Single Exit Price data.

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

/** Search for medicines by name — returns NAPPI codes and SEP prices */
export async function searchNAPPI(query: string): Promise<NAPPIResult[]> {
  try {
    const url = `https://medicineprices.org.za/api/search?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(`NAPPI API error: ${response.status}`);
      return searchNAPPIFallback(query);
    }

    const data = await response.json() as {
      nappi_code?: string;
      name?: string;
      dosage_form?: string;
      pack_size?: string;
      manufacturer?: string;
      sep?: string;
      dispensing_fee?: string;
      schedule?: string;
    }[];

    return (data || []).slice(0, 20).map((item) => ({
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

/** Lookup a specific NAPPI code */
export async function lookupNAPPI(nappiCode: string): Promise<NAPPIResult | null> {
  try {
    const url = `https://medicineprices.org.za/api/search?q=${encodeURIComponent(nappiCode)}`;
    const response = await fetch(url, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return null;

    const data = await response.json() as { nappi_code?: string; name?: string; dosage_form?: string; pack_size?: string; manufacturer?: string; sep?: string; dispensing_fee?: string; schedule?: string }[];
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

/** Fallback with common SA medicines when API is unavailable */
function searchNAPPIFallback(query: string): NAPPIResult[] {
  const q = query.toLowerCase();
  return COMMON_MEDICINES.filter((m) =>
    m.name.toLowerCase().includes(q) || m.nappiCode.includes(q)
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
