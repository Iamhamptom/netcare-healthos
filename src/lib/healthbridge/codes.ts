// SA Healthcare coding helpers — ICD-10-ZA, CPT/CCSA, NAPPI, BHF

/** Common ICD-10-ZA codes used in SA primary care */
export const COMMON_ICD10: Record<string, string> = {
  "J06.9": "Acute upper respiratory infection",
  "J20.9": "Acute bronchitis",
  "J32.9": "Chronic sinusitis",
  "J45.9": "Asthma",
  "I10": "Essential hypertension",
  "E11.9": "Type 2 diabetes mellitus",
  "E78.5": "Hyperlipidaemia",
  "M54.5": "Low back pain",
  "K29.7": "Gastritis",
  "N39.0": "Urinary tract infection",
  "R50.9": "Fever",
  "R51": "Headache",
  "R10.4": "Abdominal pain",
  "L30.9": "Dermatitis",
  "H66.9": "Otitis media",
  "B34.9": "Viral infection",
  "Z00.0": "General examination",
  "Z23": "Immunization",
  "Z01.0": "Eye examination",
  "K02.9": "Dental caries",
  "K05.1": "Chronic gingivitis",
  "K08.1": "Loss of teeth due to extraction",
};

/** Common CPT/CCSA procedure codes for SA primary care */
export const COMMON_CPT: Record<string, { description: string; tariff2026: number }> = {
  "0190": { description: "GP consultation", tariff2026: 52000 }, // R520
  "0191": { description: "GP follow-up consultation", tariff2026: 36000 },
  "0192": { description: "GP telephonic consultation", tariff2026: 26000 },
  "0193": { description: "GP extended consultation (>30 min)", tariff2026: 78000 },
  "0141": { description: "Specialist consultation", tariff2026: 95000 },
  "0142": { description: "Specialist follow-up", tariff2026: 60000 },
  "0290": { description: "After-hours consultation", tariff2026: 78000 },
  "0197": { description: "Telehealth consultation", tariff2026: 44000 },
  // Procedures
  "0308": { description: "ECG recording & interpretation", tariff2026: 35000 },
  "0312": { description: "Spirometry", tariff2026: 28000 },
  "0382": { description: "Blood glucose (point-of-care)", tariff2026: 6500 },
  "0400": { description: "Wound suturing (simple)", tariff2026: 42000 },
  "0410": { description: "Incision & drainage (abscess)", tariff2026: 48000 },
  "1101": { description: "Intramuscular injection", tariff2026: 12000 },
  "1102": { description: "Intravenous injection", tariff2026: 18000 },
  // Dental
  "8101": { description: "Dental examination", tariff2026: 38000 },
  "8131": { description: "Dental X-ray (periapical)", tariff2026: 22000 },
  "8201": { description: "Prophylaxis (scale & polish)", tariff2026: 56000 },
  "8501": { description: "Amalgam filling (1 surface)", tariff2026: 48000 },
  "8701": { description: "Extraction (simple)", tariff2026: 45000 },
};

/** Place of service codes */
export const PLACE_OF_SERVICE: Record<string, string> = {
  "11": "Office/consulting room",
  "12": "Home visit",
  "21": "Hospital inpatient",
  "22": "Hospital outpatient",
  "23": "Emergency department",
  "31": "Skilled nursing facility",
  "41": "Ambulance (land)",
  "50": "Community health centre",
  "65": "Day clinic/day hospital",
  "81": "Laboratory",
};

/** Major SA medical aid schemes */
export const MEDICAL_AID_SCHEMES: Record<string, { administrator: string; switchRoute: string }> = {
  "Discovery Health": { administrator: "Discovery Health (Pty) Ltd", switchRoute: "healthbridge" },
  "GEMS": { administrator: "Metropolitan Health", switchRoute: "mediswitch" },
  "Bonitas": { administrator: "Medscheme", switchRoute: "healthbridge" },
  "Medihelp": { administrator: "Medihelp", switchRoute: "healthbridge" },
  "Momentum Health": { administrator: "Momentum Health Solutions", switchRoute: "mediswitch" },
  "Bestmed": { administrator: "Bestmed Medical Scheme", switchRoute: "mediswitch" },
  "Fedhealth": { administrator: "Fedhealth", switchRoute: "mediswitch" },
  "Polmed": { administrator: "GEMS/Metropolitan", switchRoute: "mediswitch" },
  "CompCare": { administrator: "Universal Healthcare", switchRoute: "medikred" },
  "Sizwe Hosmed": { administrator: "Afrocentric Group", switchRoute: "mediswitch" },
};

/** Validate ICD-10 code format */
export function isValidICD10(code: string): boolean {
  return /^[A-Z]\d{2}(\.\d{1,2})?$/.test(code);
}

/** Validate CPT code format (4 digits) */
export function isValidCPT(code: string): boolean {
  return /^\d{4}$/.test(code);
}

/** Validate BHF practice number (7 digits) */
export function isValidBHF(code: string): boolean {
  return /^\d{7}$/.test(code);
}

/** Validate NAPPI code (up to 13 digits) */
export function isValidNAPPI(code: string): boolean {
  return /^\d{1,13}$/.test(code);
}

/** Format amount from cents to ZAR display string */
export function formatZAR(cents: number): string {
  return `R ${(cents / 100).toFixed(2)}`;
}

/** Parse ZAR string to cents */
export function parseZARToCents(zar: string | number): number {
  if (typeof zar === "number") return Math.round(zar * 100);
  const cleaned = String(zar).replace(/[R\s,]/g, "");
  return Math.round(parseFloat(cleaned) * 100);
}

/** Common claim rejection codes in SA switching */
export const REJECTION_CODES: Record<string, string> = {
  "01": "Member not found on scheme",
  "02": "Member not active / terminated",
  "03": "Dependent code not valid",
  "04": "Date of birth mismatch",
  "05": "ICD-10 code invalid or not covered",
  "06": "Procedure code not valid for diagnosis",
  "07": "Benefit exhausted for this category",
  "08": "Pre-authorization required but not provided",
  "09": "Duplicate claim already processed",
  "10": "Provider not contracted with scheme",
  "11": "Waiting period applies",
  "12": "Late submission (>4 months from date of service)",
  "13": "PMB condition — claim to be processed under PMBs",
  "14": "Co-payment applies",
  "15": "Amount exceeds scheme tariff",
};
