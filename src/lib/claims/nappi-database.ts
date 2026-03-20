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

  // ═══ EXPANDED CARDIOVASCULAR (CDL chronic meds) ═══
  { code: "7082282", description: "Amlodipine/valsartan 5/160mg tablets", strength: "5/160mg", packSize: "28", manufacturer: "Adcock Ingram", schedule: "S3", category: "cardiovascular" },
  { code: "7100711", description: "Losartan 100mg tablets", strength: "100mg", packSize: "30", manufacturer: "Sandoz", schedule: "S3", category: "cardiovascular" },
  { code: "7100712", description: "Losartan/hydrochlorothiazide 50/12.5mg tablets", strength: "50/12.5mg", packSize: "30", manufacturer: "Cipla Medpro", schedule: "S3", category: "cardiovascular" },
  { code: "7038421", description: "Atenolol 100mg tablets", strength: "100mg", packSize: "30", manufacturer: "Aspen", schedule: "S3", category: "cardiovascular" },
  { code: "7091520", description: "Bisoprolol 5mg tablets", strength: "5mg", packSize: "30", manufacturer: "Sandoz", schedule: "S3", category: "cardiovascular" },
  { code: "7091521", description: "Bisoprolol 10mg tablets", strength: "10mg", packSize: "30", manufacturer: "Sandoz", schedule: "S3", category: "cardiovascular" },
  { code: "7098340", description: "Carvedilol 12.5mg tablets", strength: "12.5mg", packSize: "30", manufacturer: "Mylan", schedule: "S3", category: "cardiovascular" },
  { code: "7098341", description: "Carvedilol 25mg tablets", strength: "25mg", packSize: "30", manufacturer: "Mylan", schedule: "S3", category: "cardiovascular" },
  { code: "7076132", description: "Enalapril 5mg tablets", strength: "5mg", packSize: "30", manufacturer: "Aspen", schedule: "S3", category: "cardiovascular" },
  { code: "7087660", description: "Perindopril 4mg tablets", strength: "4mg", packSize: "30", manufacturer: "Adcock Ingram", schedule: "S3", category: "cardiovascular" },
  { code: "7087661", description: "Perindopril 8mg tablets", strength: "8mg", packSize: "30", manufacturer: "Adcock Ingram", schedule: "S3", category: "cardiovascular" },
  { code: "7098350", description: "Perindopril/amlodipine 4/5mg tablets", strength: "4/5mg", packSize: "30", manufacturer: "Adcock Ingram", schedule: "S3", category: "cardiovascular" },
  { code: "7099240", description: "Ramipril 5mg capsules", strength: "5mg", packSize: "28", manufacturer: "Cipla Medpro", schedule: "S3", category: "cardiovascular" },
  { code: "7099241", description: "Ramipril 10mg capsules", strength: "10mg", packSize: "28", manufacturer: "Cipla Medpro", schedule: "S3", category: "cardiovascular" },
  { code: "7116751", description: "Hydrochlorothiazide 12.5mg tablets", strength: "12.5mg", packSize: "30", manufacturer: "Aspen", schedule: "S3", category: "cardiovascular" },
  { code: "7102330", description: "Indapamide 2.5mg SR tablets", strength: "2.5mg", packSize: "30", manufacturer: "Mylan", schedule: "S3", category: "cardiovascular" },
  { code: "7104410", description: "Spironolactone 25mg tablets", strength: "25mg", packSize: "30", manufacturer: "Aspen", schedule: "S3", category: "cardiovascular" },
  { code: "7101132", description: "Atorvastatin 10mg tablets", strength: "10mg", packSize: "30", manufacturer: "Sandoz", schedule: "S3", category: "cardiovascular" },
  { code: "7101133", description: "Atorvastatin 80mg tablets", strength: "80mg", packSize: "30", manufacturer: "Sandoz", schedule: "S3", category: "cardiovascular" },
  { code: "7065231", description: "Simvastatin 10mg tablets", strength: "10mg", packSize: "30", manufacturer: "Aspen", schedule: "S3", category: "cardiovascular" },
  { code: "7065232", description: "Simvastatin 40mg tablets", strength: "40mg", packSize: "30", manufacturer: "Aspen", schedule: "S3", category: "cardiovascular" },
  { code: "7134560", description: "Rosuvastatin 10mg tablets", strength: "10mg", packSize: "30", manufacturer: "Cipla Medpro", schedule: "S3", category: "cardiovascular" },
  { code: "7134561", description: "Rosuvastatin 20mg tablets", strength: "20mg", packSize: "30", manufacturer: "Cipla Medpro", schedule: "S3", category: "cardiovascular" },
  { code: "7121470", description: "Ezetimibe 10mg tablets", strength: "10mg", packSize: "28", manufacturer: "Adcock Ingram", schedule: "S3", category: "cardiovascular" },
  { code: "7085411", description: "Warfarin 3mg tablets", strength: "3mg", packSize: "30", manufacturer: "Aspen", schedule: "S3", category: "cardiovascular" },
  { code: "7136831", description: "Rivaroxaban 10mg tablets", strength: "10mg", packSize: "30", manufacturer: "Bayer", schedule: "S3", category: "cardiovascular" },
  { code: "7137940", description: "Apixaban 5mg tablets", strength: "5mg", packSize: "60", manufacturer: "Aspen", schedule: "S3", category: "cardiovascular" },
  { code: "7137941", description: "Apixaban 2.5mg tablets", strength: "2.5mg", packSize: "60", manufacturer: "Aspen", schedule: "S3", category: "cardiovascular" },
  { code: "7104430", description: "Digoxin 0.25mg tablets", strength: "0.25mg", packSize: "30", manufacturer: "Aspen", schedule: "S3", category: "cardiovascular" },
  { code: "7096510", description: "Amiodarone 200mg tablets", strength: "200mg", packSize: "30", manufacturer: "Sandoz", schedule: "S4", category: "cardiovascular" },
  { code: "7108450", description: "Diltiazem 240mg SR capsules", strength: "240mg", packSize: "30", manufacturer: "Mylan", schedule: "S3", category: "cardiovascular" },
  { code: "7050710", description: "Nifedipine 30mg XL tablets", strength: "30mg", packSize: "30", manufacturer: "Adcock Ingram", schedule: "S3", category: "cardiovascular" },
  { code: "7107820", description: "Verapamil 240mg SR tablets", strength: "240mg", packSize: "30", manufacturer: "Mylan", schedule: "S3", category: "cardiovascular" },
  { code: "7103380", description: "Isosorbide mononitrate 20mg tablets", strength: "20mg", packSize: "30", manufacturer: "Aspen", schedule: "S3", category: "cardiovascular" },
  { code: "7115390", description: "Sacubitril/valsartan 49/51mg tablets", strength: "49/51mg", packSize: "28", manufacturer: "Adcock Ingram", schedule: "S3", category: "cardiovascular" },

  // ═══ EXPANDED DIABETES (CDL chronic meds) ═══
  { code: "7041222", description: "Metformin 1000mg tablets", strength: "1000mg", packSize: "60", manufacturer: "Aspen", schedule: "S3", category: "diabetes" },
  { code: "7041223", description: "Metformin XR 750mg tablets", strength: "750mg", packSize: "60", manufacturer: "Cipla Medpro", schedule: "S3", category: "diabetes" },
  { code: "7039281", description: "Glimepiride 4mg tablets", strength: "4mg", packSize: "30", manufacturer: "Sandoz", schedule: "S3", category: "diabetes" },
  { code: "7024511", description: "Gliclazide MR 60mg tablets", strength: "60mg", packSize: "30", manufacturer: "Adcock Ingram", schedule: "S3", category: "diabetes" },
  { code: "7140101", description: "Empagliflozin 25mg tablets", strength: "25mg", packSize: "30", manufacturer: "Boehringer", schedule: "S3", category: "diabetes" },
  { code: "7140110", description: "Dapagliflozin 10mg tablets", strength: "10mg", packSize: "28", manufacturer: "AstraZeneca", schedule: "S3", category: "diabetes" },
  { code: "7139310", description: "Sitagliptin 100mg tablets", strength: "100mg", packSize: "28", manufacturer: "Aspen", schedule: "S3", category: "diabetes" },
  { code: "7139320", description: "Vildagliptin 50mg tablets", strength: "50mg", packSize: "28", manufacturer: "Sandoz", schedule: "S3", category: "diabetes" },
  { code: "7139330", description: "Linagliptin 5mg tablets", strength: "5mg", packSize: "28", manufacturer: "Boehringer", schedule: "S3", category: "diabetes" },
  { code: "7133691", description: "Insulin glargine 300 units/ml SoloStar", strength: "300U/ml", packSize: "3x1.5ml", manufacturer: "Sanofi", schedule: "S4", category: "diabetes" },
  { code: "7133700", description: "Insulin aspart 100 units/ml FlexPen", strength: "100U/ml", packSize: "5x3ml", manufacturer: "Novo Nordisk", schedule: "S4", category: "diabetes" },
  { code: "7133710", description: "Insulin isophane (NPH) 100 units/ml", strength: "100U/ml", packSize: "5x3ml", manufacturer: "Novo Nordisk", schedule: "S4", category: "diabetes" },
  { code: "7133720", description: "Insulin degludec 100 units/ml FlexTouch", strength: "100U/ml", packSize: "5x3ml", manufacturer: "Novo Nordisk", schedule: "S4", category: "diabetes" },
  { code: "7142510", description: "Dulaglutide 1.5mg/0.5ml injection (GLP-1 RA)", strength: "1.5mg/0.5ml", packSize: "4 pens", manufacturer: "Eli Lilly", schedule: "S4", category: "diabetes" },
  { code: "7142520", description: "Semaglutide 1mg injection (GLP-1 RA)", strength: "1mg/dose", packSize: "1 pen", manufacturer: "Novo Nordisk", schedule: "S4", category: "diabetes" },
  { code: "7139340", description: "Metformin/sitagliptin 1000/50mg tablets", strength: "1000/50mg", packSize: "56", manufacturer: "Aspen", schedule: "S3", category: "diabetes" },

  // ═══ EXPANDED ARV (older regimens + 2nd/3rd line) ═══
  { code: "7130651", description: "Tenofovir/emtricitabine 300/200mg FDC", strength: "300/200mg", packSize: "30", manufacturer: "Mylan", schedule: "S4", category: "arv" },
  { code: "7125430", description: "Efavirenz 600mg tablets", strength: "600mg", packSize: "30", manufacturer: "Cipla Medpro", schedule: "S4", category: "arv" },
  { code: "7120880", description: "Nevirapine 200mg tablets", strength: "200mg", packSize: "60", manufacturer: "Aspen", schedule: "S4", category: "arv" },
  { code: "7120881", description: "Nevirapine XR 400mg tablets", strength: "400mg", packSize: "30", manufacturer: "Aspen", schedule: "S4", category: "arv" },
  { code: "7125440", description: "Lopinavir/ritonavir 200/50mg tablets", strength: "200/50mg", packSize: "120", manufacturer: "Mylan", schedule: "S4", category: "arv" },
  { code: "7135200", description: "Atazanavir/ritonavir 300/100mg tablets", strength: "300/100mg", packSize: "30", manufacturer: "Cipla Medpro", schedule: "S4", category: "arv" },
  { code: "7140231", description: "Dolutegravir 10mg tablets (paediatric)", strength: "10mg", packSize: "90", manufacturer: "ViiV", schedule: "S4", category: "arv" },
  { code: "7140240", description: "Darunavir 600mg tablets", strength: "600mg", packSize: "60", manufacturer: "Mylan", schedule: "S4", category: "arv" },
  { code: "7140241", description: "Ritonavir 100mg tablets (boosting)", strength: "100mg", packSize: "60", manufacturer: "Mylan", schedule: "S4", category: "arv" },
  { code: "7130660", description: "Zidovudine 300mg tablets", strength: "300mg", packSize: "60", manufacturer: "Cipla Medpro", schedule: "S4", category: "arv" },
  { code: "7130670", description: "Lamivudine 150mg tablets", strength: "150mg", packSize: "60", manufacturer: "Aspen", schedule: "S4", category: "arv" },
  { code: "7130680", description: "Abacavir 300mg tablets", strength: "300mg", packSize: "60", manufacturer: "Cipla Medpro", schedule: "S4", category: "arv" },
  { code: "7141110", description: "Abacavir/lamivudine 600/300mg FDC", strength: "600/300mg", packSize: "30", manufacturer: "Cipla Medpro", schedule: "S4", category: "arv" },
  { code: "7141120", description: "Zidovudine/lamivudine 300/150mg FDC", strength: "300/150mg", packSize: "60", manufacturer: "Aspen", schedule: "S4", category: "arv" },

  // ═══ EXPANDED ANTIBIOTICS ═══
  { code: "7048621", description: "Amoxicillin 250mg/5ml suspension", strength: "250mg/5ml", packSize: "100ml", manufacturer: "Aspen", schedule: "S2", category: "antibiotic" },
  { code: "7089451", description: "Amoxicillin/clavulanate 228mg/5ml suspension", strength: "228mg/5ml", packSize: "70ml", manufacturer: "Sandoz", schedule: "S2", category: "antibiotic" },
  { code: "7051641", description: "Azithromycin 200mg/5ml suspension", strength: "200mg/5ml", packSize: "15ml", manufacturer: "Cipla Medpro", schedule: "S3", category: "antibiotic" },
  { code: "7046321", description: "Ciprofloxacin 250mg tablets", strength: "250mg", packSize: "10", manufacturer: "Sandoz", schedule: "S3", category: "antibiotic" },
  { code: "7056710", description: "Levofloxacin 500mg tablets", strength: "500mg", packSize: "10", manufacturer: "Mylan", schedule: "S3", category: "antibiotic" },
  { code: "7024330", description: "Co-trimoxazole 480mg tablets", strength: "480mg", packSize: "20", manufacturer: "Aspen", schedule: "S2", category: "antibiotic" },
  { code: "7024331", description: "Co-trimoxazole 240mg/5ml suspension", strength: "240mg/5ml", packSize: "100ml", manufacturer: "Aspen", schedule: "S2", category: "antibiotic" },
  { code: "7037891", description: "Metronidazole 200mg/5ml suspension", strength: "200mg/5ml", packSize: "100ml", manufacturer: "Adcock Ingram", schedule: "S2", category: "antibiotic" },
  { code: "7076201", description: "Fluconazole 200mg capsules", strength: "200mg", packSize: "7", manufacturer: "Cipla Medpro", schedule: "S2", category: "antibiotic" },
  { code: "7051310", description: "Nitrofurantoin 100mg capsules", strength: "100mg", packSize: "14", manufacturer: "Aspen", schedule: "S2", category: "antibiotic" },
  { code: "7078630", description: "Clarithromycin 500mg tablets", strength: "500mg", packSize: "14", manufacturer: "Sandoz", schedule: "S3", category: "antibiotic" },
  { code: "7019360", description: "Erythromycin 250mg tablets", strength: "250mg", packSize: "28", manufacturer: "Aspen", schedule: "S2", category: "antibiotic" },
  { code: "7034540", description: "Clindamycin 300mg capsules", strength: "300mg", packSize: "16", manufacturer: "Mylan", schedule: "S3", category: "antibiotic" },
  { code: "7058210", description: "Moxifloxacin 400mg tablets", strength: "400mg", packSize: "5", manufacturer: "Bayer", schedule: "S3", category: "antibiotic" },
  { code: "7092310", description: "Itraconazole 100mg capsules", strength: "100mg", packSize: "15", manufacturer: "Adcock Ingram", schedule: "S3", category: "antibiotic" },
  { code: "7055160", description: "Nystatin 100000U/ml oral suspension", strength: "100000U/ml", packSize: "30ml", manufacturer: "Aspen", schedule: "S2", category: "antibiotic" },

  // ═══ EXPANDED MENTAL HEALTH (CDL chronic meds) ═══
  { code: "7107641", description: "Escitalopram 20mg tablets", strength: "20mg", packSize: "28", manufacturer: "Sandoz", schedule: "S4", category: "mental_health" },
  { code: "7131281", description: "Sertraline 100mg tablets", strength: "100mg", packSize: "30", manufacturer: "Cipla Medpro", schedule: "S4", category: "mental_health" },
  { code: "7089521", description: "Fluoxetine 20mg/5ml solution", strength: "20mg/5ml", packSize: "70ml", manufacturer: "Aspen", schedule: "S4", category: "mental_health" },
  { code: "7131290", description: "Venlafaxine XR 75mg capsules", strength: "75mg", packSize: "28", manufacturer: "Mylan", schedule: "S4", category: "mental_health" },
  { code: "7131291", description: "Venlafaxine XR 150mg capsules", strength: "150mg", packSize: "28", manufacturer: "Mylan", schedule: "S4", category: "mental_health" },
  { code: "7120430", description: "Duloxetine 30mg capsules", strength: "30mg", packSize: "28", manufacturer: "Adcock Ingram", schedule: "S4", category: "mental_health" },
  { code: "7120431", description: "Duloxetine 60mg capsules", strength: "60mg", packSize: "28", manufacturer: "Adcock Ingram", schedule: "S4", category: "mental_health" },
  { code: "7108870", description: "Mirtazapine 30mg tablets", strength: "30mg", packSize: "30", manufacturer: "Sandoz", schedule: "S4", category: "mental_health" },
  { code: "7108871", description: "Mirtazapine 15mg tablets", strength: "15mg", packSize: "30", manufacturer: "Sandoz", schedule: "S4", category: "mental_health" },
  { code: "7110220", description: "Bupropion SR 150mg tablets", strength: "150mg", packSize: "30", manufacturer: "Cipla Medpro", schedule: "S4", category: "mental_health" },
  { code: "7040351", description: "Amitriptyline 10mg tablets", strength: "10mg", packSize: "30", manufacturer: "Aspen", schedule: "S4", category: "mental_health" },
  { code: "7139451", description: "Quetiapine 100mg tablets", strength: "100mg", packSize: "30", manufacturer: "Mylan", schedule: "S5", category: "mental_health" },
  { code: "7139452", description: "Quetiapine 200mg tablets", strength: "200mg", packSize: "60", manufacturer: "Mylan", schedule: "S5", category: "mental_health" },
  { code: "7113001", description: "Risperidone 1mg tablets", strength: "1mg", packSize: "30", manufacturer: "Cipla Medpro", schedule: "S5", category: "mental_health" },
  { code: "7118540", description: "Olanzapine 10mg tablets", strength: "10mg", packSize: "28", manufacturer: "Sandoz", schedule: "S5", category: "mental_health" },
  { code: "7118541", description: "Olanzapine 5mg tablets", strength: "5mg", packSize: "28", manufacturer: "Sandoz", schedule: "S5", category: "mental_health" },
  { code: "7115120", description: "Haloperidol 5mg tablets", strength: "5mg", packSize: "30", manufacturer: "Aspen", schedule: "S5", category: "mental_health" },
  { code: "7116430", description: "Lithium carbonate 250mg capsules", strength: "250mg", packSize: "100", manufacturer: "Mylan", schedule: "S5", category: "mental_health" },
  { code: "7116431", description: "Lithium carbonate 400mg SR tablets", strength: "400mg", packSize: "100", manufacturer: "Mylan", schedule: "S5", category: "mental_health" },
  { code: "7055540", description: "Sodium valproate 500mg CR tablets", strength: "500mg", packSize: "30", manufacturer: "Sanofi", schedule: "S5", category: "mental_health" },
  { code: "7093120", description: "Lamotrigine 100mg tablets", strength: "100mg", packSize: "30", manufacturer: "Cipla Medpro", schedule: "S4", category: "mental_health" },
  { code: "7109810", description: "Methylphenidate 10mg tablets", strength: "10mg", packSize: "30", manufacturer: "Adcock Ingram", schedule: "S6", category: "mental_health" },
  { code: "7109811", description: "Methylphenidate LA 20mg capsules", strength: "20mg", packSize: "30", manufacturer: "Adcock Ingram", schedule: "S6", category: "mental_health" },
  { code: "7064401", description: "Diazepam 10mg tablets", strength: "10mg", packSize: "30", manufacturer: "Aspen", schedule: "S5", category: "mental_health" },
  { code: "7094020", description: "Clonazepam 0.5mg tablets", strength: "0.5mg", packSize: "30", manufacturer: "Sandoz", schedule: "S5", category: "mental_health" },
  { code: "7094030", description: "Lorazepam 2mg tablets", strength: "2mg", packSize: "30", manufacturer: "Mylan", schedule: "S5", category: "mental_health" },
  { code: "7075930", description: "Zolpidem 10mg tablets", strength: "10mg", packSize: "28", manufacturer: "Cipla Medpro", schedule: "S5", category: "mental_health" },

  // ═══ EXPANDED RESPIRATORY (CDL: asthma, COPD) ═══
  { code: "7076061", description: "Salbutamol 2mg/5ml syrup", strength: "2mg/5ml", packSize: "100ml", manufacturer: "Aspen", schedule: "S2", category: "respiratory" },
  { code: "7130461", description: "Budesonide 200mcg inhaler", strength: "200mcg/dose", packSize: "200 doses", manufacturer: "Cipla Medpro", schedule: "S3", category: "respiratory" },
  { code: "7130462", description: "Budesonide 0.5mg/ml nebules", strength: "0.5mg/ml", packSize: "20x2ml", manufacturer: "AstraZeneca", schedule: "S3", category: "respiratory" },
  { code: "7113301", description: "Fluticasone 250mcg inhaler", strength: "250mcg/dose", packSize: "120 doses", manufacturer: "Cipla Medpro", schedule: "S3", category: "respiratory" },
  { code: "7135210", description: "Tiotropium 18mcg HandiHaler", strength: "18mcg/dose", packSize: "30 capsules", manufacturer: "Boehringer", schedule: "S3", category: "respiratory" },
  { code: "7135220", description: "Tiotropium/olodaterol 2.5/2.5mcg Respimat", strength: "2.5/2.5mcg", packSize: "60 doses", manufacturer: "Boehringer", schedule: "S3", category: "respiratory" },
  { code: "7138100", description: "Umeclidinium/vilanterol 62.5/25mcg Ellipta", strength: "62.5/25mcg", packSize: "30 doses", manufacturer: "GSK", schedule: "S3", category: "respiratory" },
  { code: "7138110", description: "Fluticasone furoate/vilanterol 100/25mcg Ellipta", strength: "100/25mcg", packSize: "30 doses", manufacturer: "GSK", schedule: "S3", category: "respiratory" },
  { code: "7051201", description: "Theophylline SR 200mg tablets", strength: "200mg", packSize: "30", manufacturer: "Aspen", schedule: "S3", category: "respiratory" },
  { code: "7074711", description: "Montelukast 5mg chewable tablets (paediatric)", strength: "5mg", packSize: "28", manufacturer: "Cipla Medpro", schedule: "S3", category: "respiratory" },
  { code: "7074712", description: "Montelukast 4mg granules (paediatric)", strength: "4mg", packSize: "28", manufacturer: "Cipla Medpro", schedule: "S3", category: "respiratory" },

  // ═══ EXPANDED EPILEPSY (CDL chronic meds) ═══
  { code: "7055541", description: "Sodium valproate 200mg tablets", strength: "200mg", packSize: "100", manufacturer: "Sanofi", schedule: "S5", category: "epilepsy" },
  { code: "7055542", description: "Sodium valproate 200mg/5ml syrup", strength: "200mg/5ml", packSize: "300ml", manufacturer: "Sanofi", schedule: "S5", category: "epilepsy" },
  { code: "7046140", description: "Carbamazepine 200mg tablets", strength: "200mg", packSize: "50", manufacturer: "Aspen", schedule: "S4", category: "epilepsy" },
  { code: "7046141", description: "Carbamazepine CR 400mg tablets", strength: "400mg", packSize: "30", manufacturer: "Sandoz", schedule: "S4", category: "epilepsy" },
  { code: "7093121", description: "Lamotrigine 25mg tablets", strength: "25mg", packSize: "30", manufacturer: "Cipla Medpro", schedule: "S4", category: "epilepsy" },
  { code: "7093122", description: "Lamotrigine 200mg tablets", strength: "200mg", packSize: "30", manufacturer: "Cipla Medpro", schedule: "S4", category: "epilepsy" },
  { code: "7068440", description: "Phenytoin 100mg capsules", strength: "100mg", packSize: "100", manufacturer: "Aspen", schedule: "S4", category: "epilepsy" },
  { code: "7068441", description: "Phenytoin 30mg/5ml suspension", strength: "30mg/5ml", packSize: "200ml", manufacturer: "Aspen", schedule: "S4", category: "epilepsy" },
  { code: "7097640", description: "Levetiracetam 500mg tablets", strength: "500mg", packSize: "60", manufacturer: "Mylan", schedule: "S4", category: "epilepsy" },
  { code: "7097641", description: "Levetiracetam 1000mg tablets", strength: "1000mg", packSize: "30", manufacturer: "Mylan", schedule: "S4", category: "epilepsy" },
  { code: "7097642", description: "Levetiracetam 100mg/ml solution", strength: "100mg/ml", packSize: "300ml", manufacturer: "Mylan", schedule: "S4", category: "epilepsy" },
  { code: "7103210", description: "Topiramate 50mg tablets", strength: "50mg", packSize: "28", manufacturer: "Sandoz", schedule: "S4", category: "epilepsy" },
  { code: "7040680", description: "Clonazepam 2mg tablets", strength: "2mg", packSize: "30", manufacturer: "Sandoz", schedule: "S5", category: "epilepsy" },
  { code: "7015340", description: "Phenobarbitone 30mg tablets", strength: "30mg", packSize: "100", manufacturer: "Aspen", schedule: "S5", category: "epilepsy" },

  // ═══ EXPANDED GASTROINTESTINAL ═══
  { code: "7090141", description: "Omeprazole 40mg capsules", strength: "40mg", packSize: "28", manufacturer: "Cipla Medpro", schedule: "S3", category: "gastrointestinal" },
  { code: "7112611", description: "Esomeprazole 20mg tablets", strength: "20mg", packSize: "28", manufacturer: "Sandoz", schedule: "S3", category: "gastrointestinal" },
  { code: "7110021", description: "Pantoprazole 20mg tablets", strength: "20mg", packSize: "28", manufacturer: "Mylan", schedule: "S3", category: "gastrointestinal" },
  { code: "7110030", description: "Lansoprazole 30mg capsules", strength: "30mg", packSize: "28", manufacturer: "Adcock Ingram", schedule: "S3", category: "gastrointestinal" },
  { code: "7020161", description: "Loperamide 2mg tablets", strength: "2mg", packSize: "20", manufacturer: "Aspen", schedule: "S1", category: "gastrointestinal" },
  { code: "7028311", description: "Metoclopramide 10mg tablets", strength: "10mg", packSize: "30", manufacturer: "Aspen", schedule: "S3", category: "gastrointestinal" },
  { code: "7028320", description: "Domperidone 10mg tablets", strength: "10mg", packSize: "30", manufacturer: "Sandoz", schedule: "S2", category: "gastrointestinal" },
  { code: "7028330", description: "Ondansetron 4mg tablets", strength: "4mg", packSize: "10", manufacturer: "Cipla Medpro", schedule: "S3", category: "gastrointestinal" },
  { code: "7056200", description: "Mesalazine 500mg tablets (5-ASA)", strength: "500mg", packSize: "100", manufacturer: "Aspen", schedule: "S3", category: "gastrointestinal" },
  { code: "7082440", description: "Lactulose 10g/15ml syrup", strength: "10g/15ml", packSize: "300ml", manufacturer: "Adcock Ingram", schedule: "S0", category: "gastrointestinal" },
  { code: "7079510", description: "Bisacodyl 5mg tablets", strength: "5mg", packSize: "30", manufacturer: "Aspen", schedule: "S0", category: "gastrointestinal" },
  { code: "7095620", description: "Macrogol/electrolyte powder (MoviPrep/Laxette)", strength: "N/A", packSize: "20 sachets", manufacturer: "Adcock Ingram", schedule: "S0", category: "gastrointestinal" },
  { code: "7039440", description: "Oral rehydration salts (ORS) sachets", strength: "N/A", packSize: "20", manufacturer: "Aspen", schedule: "S0", category: "gastrointestinal" },

  // ═══ EXPANDED PAIN / ANTI-INFLAMMATORY ═══
  { code: "7004031", description: "Paracetamol 250mg/5ml syrup", strength: "250mg/5ml", packSize: "100ml", manufacturer: "Aspen", schedule: "S0", category: "analgesic" },
  { code: "7034691", description: "Ibuprofen 200mg tablets", strength: "200mg", packSize: "24", manufacturer: "Adcock Ingram", schedule: "S1", category: "analgesic" },
  { code: "7034692", description: "Ibuprofen 100mg/5ml suspension", strength: "100mg/5ml", packSize: "100ml", manufacturer: "Adcock Ingram", schedule: "S1", category: "analgesic" },
  { code: "7067441", description: "Diclofenac 75mg/3ml injection", strength: "75mg/3ml", packSize: "5", manufacturer: "Sandoz", schedule: "S3", category: "analgesic" },
  { code: "7067442", description: "Diclofenac 1% gel", strength: "1%", packSize: "50g", manufacturer: "Sandoz", schedule: "S2", category: "analgesic" },
  { code: "7108300", description: "Naproxen 500mg tablets", strength: "500mg", packSize: "30", manufacturer: "Mylan", schedule: "S2", category: "analgesic" },
  { code: "7031901", description: "Tramadol 100mg SR tablets", strength: "100mg", packSize: "30", manufacturer: "Cipla Medpro", schedule: "S5", category: "analgesic" },
  { code: "7095410", description: "Pregabalin 75mg capsules", strength: "75mg", packSize: "28", manufacturer: "Sandoz", schedule: "S4", category: "analgesic" },
  { code: "7095411", description: "Pregabalin 150mg capsules", strength: "150mg", packSize: "28", manufacturer: "Sandoz", schedule: "S4", category: "analgesic" },
  { code: "7078620", description: "Gabapentin 300mg capsules", strength: "300mg", packSize: "100", manufacturer: "Mylan", schedule: "S4", category: "analgesic" },
  { code: "7078621", description: "Gabapentin 400mg capsules", strength: "400mg", packSize: "100", manufacturer: "Mylan", schedule: "S4", category: "analgesic" },
  { code: "7058340", description: "Morphine sulphate 10mg tablets", strength: "10mg", packSize: "20", manufacturer: "Aspen", schedule: "S6", category: "analgesic" },
  { code: "7058341", description: "Morphine sulphate 30mg SR tablets", strength: "30mg", packSize: "28", manufacturer: "Aspen", schedule: "S6", category: "analgesic" },

  // ═══ EXPANDED DERMATOLOGY (topicals) ═══
  { code: "7060751", description: "Betamethasone dipropionate 0.05% cream", strength: "0.05%", packSize: "30g", manufacturer: "Aspen", schedule: "S3", category: "dermatology" },
  { code: "7060752", description: "Betamethasone/fusidic acid cream", strength: "0.1%/2%", packSize: "30g", manufacturer: "Sandoz", schedule: "S3", category: "dermatology" },
  { code: "7060760", description: "Mometasone furoate 0.1% cream", strength: "0.1%", packSize: "30g", manufacturer: "Cipla Medpro", schedule: "S3", category: "dermatology" },
  { code: "7060770", description: "Clobetasol propionate 0.05% cream", strength: "0.05%", packSize: "30g", manufacturer: "Mylan", schedule: "S3", category: "dermatology" },
  { code: "7025801", description: "Hydrocortisone 1% ointment", strength: "1%", packSize: "15g", manufacturer: "Adcock Ingram", schedule: "S1", category: "dermatology" },
  { code: "7034801", description: "Clotrimazole/betamethasone cream", strength: "1%/0.05%", packSize: "20g", manufacturer: "Sandoz", schedule: "S3", category: "dermatology" },
  { code: "7089930", description: "Terbinafine 1% cream", strength: "1%", packSize: "15g", manufacturer: "Sandoz", schedule: "S2", category: "dermatology" },
  { code: "7089931", description: "Terbinafine 250mg tablets", strength: "250mg", packSize: "28", manufacturer: "Sandoz", schedule: "S3", category: "dermatology" },
  { code: "7091820", description: "Ketoconazole 2% shampoo", strength: "2%", packSize: "100ml", manufacturer: "Cipla Medpro", schedule: "S2", category: "dermatology" },
  { code: "7091830", description: "Permethrin 5% cream", strength: "5%", packSize: "30g", manufacturer: "Aspen", schedule: "S2", category: "dermatology" },
  { code: "7067900", description: "Acyclovir 5% cream", strength: "5%", packSize: "5g", manufacturer: "Mylan", schedule: "S2", category: "dermatology" },
  { code: "7067901", description: "Acyclovir 200mg tablets", strength: "200mg", packSize: "25", manufacturer: "Mylan", schedule: "S2", category: "dermatology" },
  { code: "7067910", description: "Valaciclovir 500mg tablets", strength: "500mg", packSize: "10", manufacturer: "Cipla Medpro", schedule: "S3", category: "dermatology" },
  { code: "7082710", description: "Silver sulfadiazine 1% cream", strength: "1%", packSize: "50g", manufacturer: "Adcock Ingram", schedule: "S3", category: "dermatology" },
  { code: "7098210", description: "Tretinoin 0.05% cream", strength: "0.05%", packSize: "25g", manufacturer: "Aspen", schedule: "S3", category: "dermatology" },
  { code: "7082100", description: "Emollient cream (E45/Epizone)", strength: "N/A", packSize: "500g", manufacturer: "Adcock Ingram", schedule: "S0", category: "dermatology" },
  { code: "7078041", description: "Fusidic acid 2% cream", strength: "2%", packSize: "15g", manufacturer: "Sandoz", schedule: "S3", category: "dermatology" },
  { code: "7068550", description: "Calamine lotion", strength: "N/A", packSize: "200ml", manufacturer: "Aspen", schedule: "S0", category: "dermatology" },

  // ═══ VACCINATIONS ═══
  { code: "7200100", description: "Hexavalent vaccine (DTaP-IPV-Hib-HepB)", strength: "0.5ml", packSize: "1", manufacturer: "Sanofi", schedule: "S4", category: "vaccine" },
  { code: "7200110", description: "Pentavalent vaccine (DTaP-IPV-Hib)", strength: "0.5ml", packSize: "1", manufacturer: "Sanofi", schedule: "S4", category: "vaccine" },
  { code: "7200120", description: "MMR vaccine (measles, mumps, rubella)", strength: "0.5ml", packSize: "1", manufacturer: "GSK", schedule: "S4", category: "vaccine" },
  { code: "7200130", description: "Pneumococcal conjugate vaccine (PCV13)", strength: "0.5ml", packSize: "1", manufacturer: "Pfizer", schedule: "S4", category: "vaccine" },
  { code: "7200140", description: "Rotavirus vaccine (oral)", strength: "1ml", packSize: "1", manufacturer: "GSK", schedule: "S4", category: "vaccine" },
  { code: "7200150", description: "HPV vaccine (Gardasil 9)", strength: "0.5ml", packSize: "1", manufacturer: "Merck", schedule: "S4", category: "vaccine" },
  { code: "7200160", description: "Influenza vaccine (quadrivalent)", strength: "0.5ml", packSize: "1", manufacturer: "Sanofi", schedule: "S3", category: "vaccine" },
  { code: "7200170", description: "Hepatitis B vaccine (adult)", strength: "1ml", packSize: "1", manufacturer: "GSK", schedule: "S4", category: "vaccine" },
  { code: "7200180", description: "Tetanus toxoid vaccine", strength: "0.5ml", packSize: "1", manufacturer: "Sanofi", schedule: "S4", category: "vaccine" },
  { code: "7200190", description: "Pneumococcal polysaccharide vaccine (PPSV23)", strength: "0.5ml", packSize: "1", manufacturer: "Merck", schedule: "S4", category: "vaccine" },
  { code: "7200200", description: "Varicella vaccine", strength: "0.5ml", packSize: "1", manufacturer: "Merck", schedule: "S4", category: "vaccine" },
  { code: "7200210", description: "Rabies vaccine (post-exposure)", strength: "1ml", packSize: "1", manufacturer: "Sanofi", schedule: "S4", category: "vaccine" },
  { code: "7200220", description: "COVID-19 vaccine (bivalent mRNA)", strength: "0.3ml", packSize: "1", manufacturer: "Pfizer", schedule: "S4", category: "vaccine" },
  { code: "7200230", description: "BCG vaccine (tuberculosis)", strength: "0.05ml", packSize: "1", manufacturer: "SII", schedule: "S4", category: "vaccine" },
  { code: "7200240", description: "OPV vaccine (oral polio)", strength: "2 drops", packSize: "1", manufacturer: "Sanofi", schedule: "S4", category: "vaccine" },

  // ═══ EXPANDED SURGICAL CONSUMABLES (day theatre) ═══
  { code: "8200101", description: "Examination gloves, nitrile, medium", strength: "N/A", packSize: "100", manufacturer: "Generic", schedule: "N/A", category: "consumable" },
  { code: "8200200", description: "Surgical gloves, sterile, size 7.5", strength: "N/A", packSize: "50 pairs", manufacturer: "Generic", schedule: "N/A", category: "consumable" },
  { code: "8200300", description: "Surgical drape, sterile", strength: "N/A", packSize: "10", manufacturer: "Generic", schedule: "N/A", category: "consumable" },
  { code: "8200401", description: "Surgical suture, vicryl 3-0 (absorbable)", strength: "N/A", packSize: "12", manufacturer: "Ethicon", schedule: "N/A", category: "consumable" },
  { code: "8200402", description: "Surgical suture, prolene 4-0 (non-absorbable)", strength: "N/A", packSize: "12", manufacturer: "Ethicon", schedule: "N/A", category: "consumable" },
  { code: "8200403", description: "Skin stapler, disposable", strength: "N/A", packSize: "1", manufacturer: "Ethicon", schedule: "N/A", category: "consumable" },
  { code: "8200500", description: "Sterile gauze swabs 10x10cm", strength: "N/A", packSize: "100", manufacturer: "Generic", schedule: "N/A", category: "consumable" },
  { code: "8200501", description: "Combine dressing (ABD pad) 20x25cm", strength: "N/A", packSize: "25", manufacturer: "Generic", schedule: "N/A", category: "consumable" },
  { code: "8200600", description: "Crepe bandage 10cm", strength: "N/A", packSize: "12", manufacturer: "Generic", schedule: "N/A", category: "consumable" },
  { code: "8200701", description: "Syringe 10ml with needle", strength: "N/A", packSize: "100", manufacturer: "Generic", schedule: "N/A", category: "consumable" },
  { code: "8200702", description: "Syringe 20ml with needle", strength: "N/A", packSize: "50", manufacturer: "Generic", schedule: "N/A", category: "consumable" },
  { code: "8200800", description: "IV cannula 18G", strength: "N/A", packSize: "50", manufacturer: "Generic", schedule: "N/A", category: "consumable" },
  { code: "8200801", description: "IV cannula 20G", strength: "N/A", packSize: "50", manufacturer: "Generic", schedule: "N/A", category: "consumable" },
  { code: "8200900", description: "IV giving set (standard)", strength: "N/A", packSize: "50", manufacturer: "Generic", schedule: "N/A", category: "consumable" },
  { code: "8201000", description: "Urinary catheter (Foley) 16Fr", strength: "N/A", packSize: "10", manufacturer: "Generic", schedule: "N/A", category: "consumable" },
  { code: "8201010", description: "Urine drainage bag 2L", strength: "N/A", packSize: "10", manufacturer: "Generic", schedule: "N/A", category: "consumable" },
  { code: "8201051", description: "Micropore tape 2.5cm", strength: "N/A", packSize: "12 rolls", manufacturer: "3M", schedule: "N/A", category: "consumable" },
  { code: "8201100", description: "Nasogastric tube 16Fr", strength: "N/A", packSize: "10", manufacturer: "Generic", schedule: "N/A", category: "consumable" },
  { code: "8201200", description: "Endotracheal tube 7.5mm (cuffed)", strength: "N/A", packSize: "10", manufacturer: "Generic", schedule: "N/A", category: "consumable" },
  { code: "8201300", description: "Suction catheter 14Fr", strength: "N/A", packSize: "50", manufacturer: "Generic", schedule: "N/A", category: "consumable" },
  { code: "8201400", description: "Oxygen mask with reservoir bag (adult)", strength: "N/A", packSize: "10", manufacturer: "Generic", schedule: "N/A", category: "consumable" },
  { code: "8201500", description: "Pulse oximeter probe (disposable)", strength: "N/A", packSize: "25", manufacturer: "Generic", schedule: "N/A", category: "consumable" },
  { code: "8201600", description: "ECG electrodes (pack of 50)", strength: "N/A", packSize: "50", manufacturer: "Generic", schedule: "N/A", category: "consumable" },

  // ═══ EXPANDED SUPPLEMENTS & VITAMINS ═══
  { code: "7050901", description: "Ferrous fumarate 200mg tablets", strength: "200mg", packSize: "30", manufacturer: "Adcock Ingram", schedule: "S0", category: "supplement" },
  { code: "7052311", description: "Folic acid 0.4mg tablets (prophylaxis)", strength: "0.4mg", packSize: "30", manufacturer: "Aspen", schedule: "S0", category: "supplement" },
  { code: "7090801", description: "Calcium carbonate 1250mg tablets", strength: "1250mg", packSize: "60", manufacturer: "Sandoz", schedule: "S0", category: "supplement" },
  { code: "7135601", description: "Vitamin D3 50000IU capsules (weekly)", strength: "50000IU", packSize: "4", manufacturer: "Mylan", schedule: "S2", category: "supplement" },
  { code: "7050550", description: "Vitamin B complex tablets", strength: "N/A", packSize: "100", manufacturer: "Aspen", schedule: "S0", category: "supplement" },
  { code: "7050560", description: "Thiamine (Vitamin B1) 100mg tablets", strength: "100mg", packSize: "100", manufacturer: "Aspen", schedule: "S0", category: "supplement" },
  { code: "7050570", description: "Pyridoxine (Vitamin B6) 25mg tablets", strength: "25mg", packSize: "100", manufacturer: "Aspen", schedule: "S0", category: "supplement" },
  { code: "7050580", description: "Potassium chloride 600mg SR tablets", strength: "600mg", packSize: "30", manufacturer: "Cipla Medpro", schedule: "S2", category: "supplement" },
  { code: "7050590", description: "Magnesium glycinate 500mg capsules", strength: "500mg", packSize: "60", manufacturer: "Sandoz", schedule: "S0", category: "supplement" },

  // ═══ EXPANDED ENT / OPHTHALMIC ═══
  { code: "7061501", description: "Chloramphenicol 1% eye ointment", strength: "1%", packSize: "4g", manufacturer: "Aspen", schedule: "S2", category: "ophthalmic" },
  { code: "7071200", description: "Timolol 0.5% eye drops", strength: "0.5%", packSize: "5ml", manufacturer: "Sandoz", schedule: "S3", category: "ophthalmic" },
  { code: "7071210", description: "Latanoprost 0.005% eye drops", strength: "0.005%", packSize: "2.5ml", manufacturer: "Cipla Medpro", schedule: "S3", category: "ophthalmic" },
  { code: "7071220", description: "Brimonidine 0.2% eye drops", strength: "0.2%", packSize: "5ml", manufacturer: "Mylan", schedule: "S3", category: "ophthalmic" },
  { code: "7071230", description: "Artificial tears (carboxymethylcellulose)", strength: "0.5%", packSize: "15ml", manufacturer: "Adcock Ingram", schedule: "S0", category: "ophthalmic" },
  { code: "7071240", description: "Ofloxacin 0.3% eye drops", strength: "0.3%", packSize: "5ml", manufacturer: "Cipla Medpro", schedule: "S3", category: "ophthalmic" },
  { code: "7036701", description: "Ciprofloxacin/dexamethasone ear drops", strength: "0.3%/0.1%", packSize: "10ml", manufacturer: "Sandoz", schedule: "S3", category: "ent" },
  { code: "7045201", description: "Beclomethasone nasal spray", strength: "50mcg/dose", packSize: "200 doses", manufacturer: "Cipla Medpro", schedule: "S2", category: "ent" },
  { code: "7045210", description: "Mometasone nasal spray", strength: "50mcg/dose", packSize: "140 doses", manufacturer: "Mylan", schedule: "S3", category: "ent" },
  { code: "7058410", description: "Cetirizine 10mg tablets", strength: "10mg", packSize: "30", manufacturer: "Aspen", schedule: "S2", category: "ent" },
  { code: "7058420", description: "Loratadine 10mg tablets", strength: "10mg", packSize: "30", manufacturer: "Adcock Ingram", schedule: "S2", category: "ent" },
  { code: "7058430", description: "Fexofenadine 180mg tablets", strength: "180mg", packSize: "30", manufacturer: "Sandoz", schedule: "S2", category: "ent" },
  { code: "7047300", description: "Chlorpheniramine 4mg tablets", strength: "4mg", packSize: "30", manufacturer: "Aspen", schedule: "S2", category: "ent" },
  { code: "7047310", description: "Promethazine 25mg tablets", strength: "25mg", packSize: "30", manufacturer: "Aspen", schedule: "S3", category: "ent" },

  // ═══ EXPANDED GOUT / RHEUMATOLOGY (CDL) ═══
  { code: "7088400", description: "Allopurinol 100mg tablets", strength: "100mg", packSize: "100", manufacturer: "Aspen", schedule: "S3", category: "rheumatology" },
  { code: "7088401", description: "Allopurinol 300mg tablets", strength: "300mg", packSize: "30", manufacturer: "Aspen", schedule: "S3", category: "rheumatology" },
  { code: "7023440", description: "Colchicine 0.5mg tablets", strength: "0.5mg", packSize: "30", manufacturer: "Aspen", schedule: "S4", category: "rheumatology" },
  { code: "7046770", description: "Methotrexate 2.5mg tablets", strength: "2.5mg", packSize: "30", manufacturer: "Cipla Medpro", schedule: "S4", category: "rheumatology" },
  { code: "7092700", description: "Sulfasalazine 500mg tablets", strength: "500mg", packSize: "100", manufacturer: "Aspen", schedule: "S4", category: "rheumatology" },
  { code: "7091640", description: "Hydroxychloroquine 200mg tablets", strength: "200mg", packSize: "60", manufacturer: "Sandoz", schedule: "S4", category: "rheumatology" },
  { code: "7084020", description: "Azathioprine 50mg tablets", strength: "50mg", packSize: "50", manufacturer: "Aspen", schedule: "S4", category: "rheumatology" },
  { code: "7095770", description: "Prednisone 5mg tablets", strength: "5mg", packSize: "30", manufacturer: "Aspen", schedule: "S3", category: "rheumatology" },
  { code: "7095771", description: "Prednisone 20mg tablets", strength: "20mg", packSize: "30", manufacturer: "Aspen", schedule: "S3", category: "rheumatology" },

  // ═══ EXPANDED PARKINSON / NEURO (CDL) ═══
  { code: "7073590", description: "Levodopa/carbidopa 250/25mg tablets", strength: "250/25mg", packSize: "100", manufacturer: "Aspen", schedule: "S4", category: "neurological" },
  { code: "7073591", description: "Levodopa/carbidopa 100/25mg tablets", strength: "100/25mg", packSize: "100", manufacturer: "Aspen", schedule: "S4", category: "neurological" },
  { code: "7073600", description: "Levodopa/carbidopa CR 200/50mg tablets", strength: "200/50mg", packSize: "100", manufacturer: "Mylan", schedule: "S4", category: "neurological" },
  { code: "7108220", description: "Entacapone 200mg tablets", strength: "200mg", packSize: "30", manufacturer: "Sandoz", schedule: "S4", category: "neurological" },
  { code: "7107610", description: "Pramipexole 0.25mg tablets", strength: "0.25mg", packSize: "30", manufacturer: "Cipla Medpro", schedule: "S4", category: "neurological" },
  { code: "7044240", description: "Trihexyphenidyl 2mg tablets", strength: "2mg", packSize: "100", manufacturer: "Aspen", schedule: "S4", category: "neurological" },
  { code: "7113570", description: "Donepezil 10mg tablets", strength: "10mg", packSize: "28", manufacturer: "Adcock Ingram", schedule: "S4", category: "neurological" },
  { code: "7113580", description: "Memantine 10mg tablets", strength: "10mg", packSize: "28", manufacturer: "Sandoz", schedule: "S4", category: "neurological" },

  // ═══ EXPANDED THYROID (CDL) ═══
  { code: "7033782", description: "Levothyroxine 25mcg tablets", strength: "25mcg", packSize: "100", manufacturer: "Aspen", schedule: "S3", category: "thyroid" },
  { code: "7033783", description: "Levothyroxine 75mcg tablets", strength: "75mcg", packSize: "100", manufacturer: "Aspen", schedule: "S3", category: "thyroid" },
  { code: "7033784", description: "Levothyroxine 125mcg tablets", strength: "125mcg", packSize: "100", manufacturer: "Aspen", schedule: "S3", category: "thyroid" },
  { code: "7033785", description: "Levothyroxine 150mcg tablets", strength: "150mcg", packSize: "100", manufacturer: "Aspen", schedule: "S3", category: "thyroid" },
  { code: "7048251", description: "Carbimazole 20mg tablets", strength: "20mg", packSize: "100", manufacturer: "Aspen", schedule: "S4", category: "thyroid" },

  // ═══ TB TREATMENT ═══
  { code: "7126440", description: "RHZE FDC (Rifampicin/Isoniazid/Pyrazinamide/Ethambutol) tablets", strength: "150/75/400/275mg", packSize: "672", manufacturer: "Sandoz", schedule: "S4", category: "anti_tb" },
  { code: "7126450", description: "RH FDC (Rifampicin/Isoniazid) 150/75mg tablets", strength: "150/75mg", packSize: "672", manufacturer: "Sandoz", schedule: "S4", category: "anti_tb" },
  { code: "7019810", description: "Isoniazid 100mg tablets", strength: "100mg", packSize: "100", manufacturer: "Aspen", schedule: "S4", category: "anti_tb" },
  { code: "7019820", description: "Rifampicin 300mg capsules", strength: "300mg", packSize: "100", manufacturer: "Cipla Medpro", schedule: "S4", category: "anti_tb" },
  { code: "7019830", description: "Pyrazinamide 500mg tablets", strength: "500mg", packSize: "100", manufacturer: "Aspen", schedule: "S4", category: "anti_tb" },
  { code: "7019840", description: "Ethambutol 400mg tablets", strength: "400mg", packSize: "100", manufacturer: "Aspen", schedule: "S4", category: "anti_tb" },

  // ═══ MISC CDL / OTHER CHRONIC ═══
  { code: "7042250", description: "Tamsulosin 0.4mg MR capsules (BPH)", strength: "0.4mg", packSize: "30", manufacturer: "Cipla Medpro", schedule: "S3", category: "urological" },
  { code: "7042260", description: "Finasteride 5mg tablets (BPH)", strength: "5mg", packSize: "30", manufacturer: "Sandoz", schedule: "S4", category: "urological" },
  { code: "7064610", description: "Oxybutynin 5mg tablets (overactive bladder)", strength: "5mg", packSize: "30", manufacturer: "Aspen", schedule: "S3", category: "urological" },
  { code: "7087100", description: "Desmopressin 0.2mg tablets (diabetes insipidus/enuresis)", strength: "0.2mg", packSize: "30", manufacturer: "Sanofi", schedule: "S4", category: "hormonal" },
  { code: "7081320", description: "Alendronate 70mg weekly tablets (osteoporosis)", strength: "70mg", packSize: "4", manufacturer: "Sandoz", schedule: "S3", category: "osteoporosis" },
  { code: "7098770", description: "Denosumab 60mg/ml injection (osteoporosis)", strength: "60mg/ml", packSize: "1", manufacturer: "Amgen", schedule: "S4", category: "osteoporosis" },
  { code: "7034560", description: "Conjugated oestrogens 0.625mg tablets (HRT)", strength: "0.625mg", packSize: "28", manufacturer: "Pfizer", schedule: "S4", category: "hormonal" },
  { code: "7089650", description: "Norethisterone 5mg tablets", strength: "5mg", packSize: "30", manufacturer: "Aspen", schedule: "S4", category: "hormonal" },
  { code: "7076300", description: "Combined oral contraceptive (ethinylestradiol/levonorgestrel)", strength: "30/150mcg", packSize: "28", manufacturer: "Adcock Ingram", schedule: "S3", category: "hormonal" },
  { code: "7076310", description: "Medroxyprogesterone acetate 150mg/ml injection (Depo-Provera)", strength: "150mg/ml", packSize: "1ml", manufacturer: "Pfizer", schedule: "S4", category: "hormonal" },
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
