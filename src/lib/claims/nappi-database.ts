// NAPPI Code Database — Public Domain Subset
// National Pharmaceutical Product Index (South Africa)
// Managed by MediKredit — this is a representative subset of common medicines

import type { NAPPIEntry } from "./types";

export const NAPPI_DATABASE: NAPPIEntry[] = [
  // ═══ CARDIOVASCULAR ═══
  { code: "7082280", description: "Amlodipine 5mg tablets", strength: "5mg", packSize: "30", manufacturer: "Generic", schedule: "S3", category: "cardiovascular" },
  { code: "7082281", description: "Amlodipine 10mg tablets", strength: "10mg", packSize: "30", manufacturer: "Generic", schedule: "S3", category: "cardiovascular" },
  { code: "7038420", description: "Atenolol 50mg tablets", strength: "50mg", packSize: "30", manufacturer: "Generic", schedule: "S3", category: "cardiovascular" },
  { code: "7076130", description: "Enalapril 10mg tablets", strength: "10mg", packSize: "30", manufacturer: "Generic", schedule: "S3", category: "cardiovascular" },
  { code: "7076131", description: "Enalapril 20mg tablets", strength: "20mg", packSize: "30", manufacturer: "Generic", schedule: "S3", category: "cardiovascular" },
  { code: "7100710", description: "Losartan 50mg tablets", strength: "50mg", packSize: "30", manufacturer: "Generic", schedule: "S3", category: "cardiovascular" },
  { code: "7116750", description: "Hydrochlorothiazide 25mg tablets", strength: "25mg", packSize: "30", manufacturer: "Generic", schedule: "S3", category: "cardiovascular" },
  { code: "7029300", description: "Furosemide 40mg tablets", strength: "40mg", packSize: "30", manufacturer: "Generic", schedule: "S3", category: "cardiovascular" },
  { code: "7049890", description: "Aspirin 100mg EC tablets (cardiovascular)", strength: "100mg", packSize: "30", manufacturer: "Generic", schedule: "S1", category: "cardiovascular" },
  { code: "7101130", description: "Atorvastatin 20mg tablets", strength: "20mg", packSize: "30", manufacturer: "Generic", schedule: "S3", category: "cardiovascular" },
  { code: "7101131", description: "Atorvastatin 40mg tablets", strength: "40mg", packSize: "30", manufacturer: "Generic", schedule: "S3", category: "cardiovascular" },
  { code: "7065230", description: "Simvastatin 20mg tablets", strength: "20mg", packSize: "30", manufacturer: "Generic", schedule: "S3", category: "cardiovascular" },
  { code: "7120550", description: "Clopidogrel 75mg tablets", strength: "75mg", packSize: "30", manufacturer: "Generic", schedule: "S3", category: "cardiovascular" },
  { code: "7085410", description: "Warfarin 5mg tablets", strength: "5mg", packSize: "30", manufacturer: "Generic", schedule: "S3", category: "cardiovascular" },
  { code: "7136830", description: "Rivaroxaban 20mg tablets", strength: "20mg", packSize: "30", manufacturer: "Bayer", schedule: "S3", category: "cardiovascular" },

  // ═══ DIABETES ═══
  { code: "7041220", description: "Metformin 500mg tablets", strength: "500mg", packSize: "60", manufacturer: "Generic", schedule: "S3", category: "diabetes" },
  { code: "7041221", description: "Metformin 850mg tablets", strength: "850mg", packSize: "60", manufacturer: "Generic", schedule: "S3", category: "diabetes" },
  { code: "7039280", description: "Glimepiride 2mg tablets", strength: "2mg", packSize: "30", manufacturer: "Generic", schedule: "S3", category: "diabetes" },
  { code: "7024510", description: "Gliclazide 80mg tablets", strength: "80mg", packSize: "60", manufacturer: "Generic", schedule: "S3", category: "diabetes" },
  { code: "7133690", description: "Insulin glargine 100 units/ml", strength: "100U/ml", packSize: "5x3ml", manufacturer: "Sanofi", schedule: "S4", category: "diabetes" },
  { code: "7140100", description: "Empagliflozin 10mg tablets", strength: "10mg", packSize: "30", manufacturer: "Boehringer", schedule: "S3", category: "diabetes" },

  // ═══ RESPIRATORY ═══
  { code: "7076060", description: "Salbutamol 100mcg inhaler", strength: "100mcg/dose", packSize: "200 doses", manufacturer: "Generic", schedule: "S2", category: "respiratory" },
  { code: "7113300", description: "Fluticasone/salmeterol 250/50 Accuhaler", strength: "250/50mcg", packSize: "60 doses", manufacturer: "GSK", schedule: "S3", category: "respiratory" },
  { code: "7130460", description: "Budesonide/formoterol 200/6 Turbuhaler", strength: "200/6mcg", packSize: "120 doses", manufacturer: "AstraZeneca", schedule: "S3", category: "respiratory" },
  { code: "7091540", description: "Ipratropium bromide 20mcg inhaler", strength: "20mcg/dose", packSize: "200 doses", manufacturer: "Generic", schedule: "S3", category: "respiratory" },
  { code: "7051200", description: "Theophylline SR 300mg tablets", strength: "300mg", packSize: "30", manufacturer: "Generic", schedule: "S3", category: "respiratory" },
  { code: "7074710", description: "Montelukast 10mg tablets", strength: "10mg", packSize: "28", manufacturer: "Generic", schedule: "S3", category: "respiratory" },

  // ═══ ANTIBIOTICS ═══
  { code: "7048620", description: "Amoxicillin 500mg capsules", strength: "500mg", packSize: "20", manufacturer: "Generic", schedule: "S2", category: "antibiotic" },
  { code: "7089450", description: "Amoxicillin/clavulanate 875/125mg tablets", strength: "875/125mg", packSize: "14", manufacturer: "Generic", schedule: "S2", category: "antibiotic" },
  { code: "7051640", description: "Azithromycin 500mg tablets", strength: "500mg", packSize: "3", manufacturer: "Generic", schedule: "S3", category: "antibiotic" },
  { code: "7046320", description: "Ciprofloxacin 500mg tablets", strength: "500mg", packSize: "10", manufacturer: "Generic", schedule: "S3", category: "antibiotic" },
  { code: "7082160", description: "Cephalexin 500mg capsules", strength: "500mg", packSize: "20", manufacturer: "Generic", schedule: "S2", category: "antibiotic" },
  { code: "7018960", description: "Doxycycline 100mg capsules", strength: "100mg", packSize: "20", manufacturer: "Generic", schedule: "S2", category: "antibiotic" },
  { code: "7037890", description: "Metronidazole 400mg tablets", strength: "400mg", packSize: "14", manufacturer: "Generic", schedule: "S2", category: "antibiotic" },
  { code: "7076200", description: "Fluconazole 150mg capsule", strength: "150mg", packSize: "1", manufacturer: "Generic", schedule: "S2", category: "antibiotic" },
  { code: "7024320", description: "Cloxacillin 500mg capsules", strength: "500mg", packSize: "20", manufacturer: "Generic", schedule: "S2", category: "antibiotic" },

  // ═══ PAIN / ANTI-INFLAMMATORY ═══
  { code: "7004030", description: "Paracetamol 500mg tablets", strength: "500mg", packSize: "24", manufacturer: "Generic", schedule: "S0", category: "analgesic" },
  { code: "7034690", description: "Ibuprofen 400mg tablets", strength: "400mg", packSize: "24", manufacturer: "Generic", schedule: "S1", category: "analgesic" },
  { code: "7067440", description: "Diclofenac 50mg tablets", strength: "50mg", packSize: "30", manufacturer: "Generic", schedule: "S2", category: "analgesic" },
  { code: "7110800", description: "Celecoxib 200mg capsules", strength: "200mg", packSize: "30", manufacturer: "Generic", schedule: "S3", category: "analgesic" },
  { code: "7031900", description: "Tramadol 50mg capsules", strength: "50mg", packSize: "30", manufacturer: "Generic", schedule: "S5", category: "analgesic" },
  { code: "7008310", description: "Codeine phosphate 30mg tablets", strength: "30mg", packSize: "20", manufacturer: "Generic", schedule: "S5", category: "analgesic" },

  // ═══ MENTAL HEALTH ═══
  { code: "7107640", description: "Escitalopram 10mg tablets", strength: "10mg", packSize: "28", manufacturer: "Generic", schedule: "S4", category: "mental_health" },
  { code: "7089520", description: "Fluoxetine 20mg capsules", strength: "20mg", packSize: "30", manufacturer: "Generic", schedule: "S4", category: "mental_health" },
  { code: "7040350", description: "Amitriptyline 25mg tablets", strength: "25mg", packSize: "30", manufacturer: "Generic", schedule: "S4", category: "mental_health" },
  { code: "7131280", description: "Sertraline 50mg tablets", strength: "50mg", packSize: "30", manufacturer: "Generic", schedule: "S4", category: "mental_health" },
  { code: "7067310", description: "Alprazolam 0.5mg tablets", strength: "0.5mg", packSize: "30", manufacturer: "Generic", schedule: "S5", category: "mental_health" },
  { code: "7064400", description: "Diazepam 5mg tablets", strength: "5mg", packSize: "30", manufacturer: "Generic", schedule: "S5", category: "mental_health" },
  { code: "7139450", description: "Quetiapine 25mg tablets", strength: "25mg", packSize: "30", manufacturer: "Generic", schedule: "S5", category: "mental_health" },
  { code: "7113000", description: "Risperidone 2mg tablets", strength: "2mg", packSize: "30", manufacturer: "Generic", schedule: "S5", category: "mental_health" },

  // ═══ GASTROINTESTINAL ═══
  { code: "7090140", description: "Omeprazole 20mg capsules", strength: "20mg", packSize: "28", manufacturer: "Generic", schedule: "S2", category: "gastrointestinal" },
  { code: "7112610", description: "Esomeprazole 40mg tablets", strength: "40mg", packSize: "28", manufacturer: "Generic", schedule: "S3", category: "gastrointestinal" },
  { code: "7110020", description: "Pantoprazole 40mg tablets", strength: "40mg", packSize: "28", manufacturer: "Generic", schedule: "S3", category: "gastrointestinal" },
  { code: "7020160", description: "Loperamide 2mg capsules", strength: "2mg", packSize: "8", manufacturer: "Generic", schedule: "S1", category: "gastrointestinal" },
  { code: "7028310", description: "Prochlorperazine 5mg tablets (anti-emetic)", strength: "5mg", packSize: "30", manufacturer: "Generic", schedule: "S3", category: "gastrointestinal" },

  // ═══ DERMATOLOGY ═══
  { code: "7060750", description: "Betamethasone valerate 0.1% cream", strength: "0.1%", packSize: "30g", manufacturer: "Generic", schedule: "S3", category: "dermatology" },
  { code: "7025800", description: "Hydrocortisone 1% cream", strength: "1%", packSize: "15g", manufacturer: "Generic", schedule: "S1", category: "dermatology" },
  { code: "7088100", description: "Aqueous cream BP", strength: "N/A", packSize: "500g", manufacturer: "Generic", schedule: "S0", category: "dermatology" },
  { code: "7078040", description: "Mupirocin 2% ointment", strength: "2%", packSize: "15g", manufacturer: "Generic", schedule: "S3", category: "dermatology" },
  { code: "7034800", description: "Clotrimazole 1% cream", strength: "1%", packSize: "20g", manufacturer: "Generic", schedule: "S1", category: "dermatology" },

  // ═══ THYROID ═══
  { code: "7033780", description: "Levothyroxine 50mcg tablets", strength: "50mcg", packSize: "100", manufacturer: "Generic", schedule: "S3", category: "thyroid" },
  { code: "7033781", description: "Levothyroxine 100mcg tablets", strength: "100mcg", packSize: "100", manufacturer: "Generic", schedule: "S3", category: "thyroid" },
  { code: "7048250", description: "Carbimazole 5mg tablets", strength: "5mg", packSize: "100", manufacturer: "Generic", schedule: "S4", category: "thyroid" },

  // ═══ VITAMINS & SUPPLEMENTS ═══
  { code: "7050900", description: "Ferrous sulphate 200mg tablets (iron)", strength: "200mg", packSize: "30", manufacturer: "Generic", schedule: "S0", category: "supplement" },
  { code: "7052310", description: "Folic acid 5mg tablets", strength: "5mg", packSize: "30", manufacturer: "Generic", schedule: "S0", category: "supplement" },
  { code: "7090800", description: "Calcium carbonate/Vitamin D3 tablets", strength: "500mg/400IU", packSize: "60", manufacturer: "Generic", schedule: "S0", category: "supplement" },
  { code: "7135600", description: "Vitamin D3 1000IU capsules", strength: "1000IU", packSize: "60", manufacturer: "Generic", schedule: "S0", category: "supplement" },

  // ═══ ANTIRETROVIRAL (ARV) ═══
  { code: "7130650", description: "Tenofovir/emtricitabine/efavirenz (TEE) FDC", strength: "300/200/600mg", packSize: "30", manufacturer: "Generic", schedule: "S4", category: "arv" },
  { code: "7140230", description: "Dolutegravir 50mg tablets", strength: "50mg", packSize: "30", manufacturer: "ViiV", schedule: "S4", category: "arv" },
  { code: "7141100", description: "Tenofovir/lamivudine/dolutegravir (TLD) FDC", strength: "300/300/50mg", packSize: "30", manufacturer: "Generic", schedule: "S4", category: "arv" },

  // ═══ ENT / OPHTHALMIC ═══
  { code: "7061500", description: "Chloramphenicol 0.5% eye drops", strength: "0.5%", packSize: "10ml", manufacturer: "Generic", schedule: "S2", category: "ophthalmic" },
  { code: "7070480", description: "Tobramycin/dexamethasone eye drops", strength: "0.3%/0.1%", packSize: "5ml", manufacturer: "Generic", schedule: "S3", category: "ophthalmic" },
  { code: "7036700", description: "Ciprofloxacin 0.3% ear drops", strength: "0.3%", packSize: "10ml", manufacturer: "Generic", schedule: "S3", category: "ent" },
  { code: "7045200", description: "Fluticasone nasal spray", strength: "50mcg/dose", packSize: "120 doses", manufacturer: "Generic", schedule: "S2", category: "ent" },
  { code: "7019300", description: "Xylometazoline nasal spray", strength: "0.1%", packSize: "10ml", manufacturer: "Generic", schedule: "S1", category: "ent" },

  // ═══ SURGICAL CONSUMABLES ═══
  { code: "8200100", description: "Examination gloves, latex, medium", strength: "N/A", packSize: "100", manufacturer: "Generic", schedule: "N/A", category: "consumable" },
  { code: "8200400", description: "Surgical suture, nylon 3-0", strength: "N/A", packSize: "12", manufacturer: "Ethicon", schedule: "N/A", category: "consumable" },
  { code: "8201050", description: "Adhesive bandage (plaster)", strength: "N/A", packSize: "100", manufacturer: "Generic", schedule: "N/A", category: "consumable" },
  { code: "8200700", description: "Syringe 5ml with needle", strength: "N/A", packSize: "100", manufacturer: "Generic", schedule: "N/A", category: "consumable" },
];

// Lookup
const nappiMap = new Map<string, NAPPIEntry>();
for (const entry of NAPPI_DATABASE) {
  nappiMap.set(entry.code, entry);
}

export function lookupNAPPI(code: string): NAPPIEntry | undefined {
  return nappiMap.get(code.trim().replace(/-/g, ""));
}

export function searchNAPPI(query: string, limit = 20): NAPPIEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const results: NAPPIEntry[] = [];
  for (const entry of NAPPI_DATABASE) {
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
