import type { ClaimLineItem } from "./types";

/**
 * Required Healthbridge column names (case-insensitive matching).
 * A CSV is considered Healthbridge format if it contains at least these core columns.
 */
const HEALTHBRIDGE_REQUIRED_COLUMNS = [
  "CLAIM_ID",
  "ICD10_1",
  "TARIFF_CODE",
  "AMOUNT",
];

const HEALTHBRIDGE_ALL_COLUMNS = [
  "CLAIM_ID",
  "CLAIM_DATE",
  "MEMBER_NO",
  "DEPENDENT_CODE",
  "PATIENT_SURNAME",
  "PATIENT_INITIALS",
  "PATIENT_DOB",
  "PATIENT_GENDER",
  "ICD10_1",
  "ICD10_2",
  "ICD10_3",
  "ICD10_4",
  "TARIFF_CODE",
  "NAPPI_CODE",
  "MODIFIER",
  "QTY",
  "AMOUNT",
  "SCHEME_CODE",
  "PROVIDER_NO",
  "PROVIDER_TYPE",
  "PLACE_OF_SERVICE",
  "AUTH_NO",
];

/**
 * Detect whether CSV headers match the Healthbridge claims export format.
 */
export function isHealthbridgeFormat(headers: string[]): boolean {
  const upperHeaders = new Set(headers.map((h) => h.trim().toUpperCase()));
  return HEALTHBRIDGE_REQUIRED_COLUMNS.every((col) => upperHeaders.has(col));
}

/**
 * Parse Healthbridge claims CSV rows into the standard ClaimLineItem format.
 */
export function parseHealthbridgeClaims(
  rows: Record<string, string>[]
): ClaimLineItem[] {
  return rows.map((row, index) => {
    const get = (key: string): string => {
      // Try exact match first, then case-insensitive
      if (row[key] !== undefined) return row[key].trim();
      const upper = key.toUpperCase();
      for (const k of Object.keys(row)) {
        if (k.trim().toUpperCase() === upper) return row[k].trim();
      }
      return "";
    };

    // Primary and secondary ICD-10 codes
    const primaryICD10 = get("ICD10_1");
    const secondaryCodes = [get("ICD10_2"), get("ICD10_3"), get("ICD10_4")]
      .filter(Boolean);

    // Convert amount from cents to Rand
    const amountCents = parseInt(get("AMOUNT"), 10);
    const amount = !isNaN(amountCents) ? amountCents / 100 : undefined;

    // Quantity
    const qtyRaw = parseInt(get("QTY"), 10);
    const quantity = !isNaN(qtyRaw) ? qtyRaw : undefined;

    // Gender mapping (M/F/U already matches our type)
    const genderRaw = get("PATIENT_GENDER").toUpperCase();
    const patientGender: "M" | "F" | "U" | undefined =
      genderRaw === "M" ? "M" : genderRaw === "F" ? "F" : genderRaw === "U" ? "U" : undefined;

    // Calculate age from DOB (YYYYMMDD format)
    const patientAge = calculateAge(get("PATIENT_DOB"));

    // Patient name (surname + initials)
    const surname = get("PATIENT_SURNAME");
    const initials = get("PATIENT_INITIALS");
    const patientName =
      surname && initials
        ? `${surname}, ${initials}`
        : surname || initials || undefined;

    // Map provider type code to discipline name
    const practitionerType = mapProviderType(get("PROVIDER_TYPE"));

    const item: ClaimLineItem = {
      lineNumber: index + 1,
      patientName,
      patientGender,
      patientAge,
      primaryICD10,
      secondaryICD10: secondaryCodes.length > 0 ? secondaryCodes : undefined,
      tariffCode: get("TARIFF_CODE") || undefined,
      nappiCode: get("NAPPI_CODE") || undefined,
      quantity,
      amount,
      modifier: get("MODIFIER") || undefined,
      practitionerType,
      dateOfService: formatClaimDate(get("CLAIM_DATE")),
    };

    return item;
  });
}

/**
 * Calculate age from a YYYYMMDD date string.
 */
function calculateAge(dob: string): number | undefined {
  if (!dob || dob.length < 8) return undefined;

  const year = parseInt(dob.substring(0, 4), 10);
  const month = parseInt(dob.substring(4, 6), 10) - 1; // 0-indexed
  const day = parseInt(dob.substring(6, 8), 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return undefined;

  const birthDate = new Date(year, month, day);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age >= 0 && age < 150 ? age : undefined;
}

/**
 * Format a Healthbridge claim date (YYYYMMDD) to ISO-style YYYY-MM-DD.
 */
function formatClaimDate(dateStr: string): string | undefined {
  if (!dateStr || dateStr.length < 8) return undefined;
  const y = dateStr.substring(0, 4);
  const m = dateStr.substring(4, 6);
  const d = dateStr.substring(6, 8);
  return `${y}-${m}-${d}`;
}

/**
 * Map Healthbridge PROVIDER_TYPE codes to tariff Discipline values.
 * Based on BHF (Board of Healthcare Funders) practice codes.
 *
 * IMPORTANT: Returns Discipline-compatible strings that match the tariff
 * database's discipline array (e.g., "gp", "specialist", "surgeon").
 * Facility codes (80-89) return undefined since facilities don't have
 * a practitioner discipline for tariff validation.
 */
function mapProviderType(code: string): string | undefined {
  if (!code) return undefined;

  // Maps BHF provider codes to tariff Discipline values.
  // Facility codes (80-89) are intentionally omitted — they have no
  // practitioner discipline, so discipline validation is skipped for them.
  const providerToDiscipline: Record<string, string> = {
    "01": "gp",
    "02": "specialist",
    "03": "surgeon",
    "04": "gynaecology",
    "05": "psychiatry",
    "06": "surgeon",              // Neurosurgeon
    "07": "anaesthetist",
    "08": "radiology",
    "09": "pathology",
    "10": "paediatrics",
    "11": "ophthalmology",
    "12": "urologist",
    "13": "surgeon",              // Plastic Surgeon
    "14": "orthopaedics",
    "15": "ent",
    "16": "cardiology",
    "17": "neurologist",
    "18": "surgeon",              // Cardiothoracic Surgeon
    "19": "dermatology",
    "20": "oncologist",
    "21": "specialist",           // Nuclear Medicine
    "22": "physiotherapy",        // Physical Rehabilitation
    "23": "surgeon",              // Maxillofacial Surgeon
    "24": "pulmonologist",
    "25": "specialist",           // Nephrologist
    "26": "gastroenterologist",
    "27": "specialist",           // Rheumatologist
    "28": "specialist",           // Clinical Haematologist
    "29": "specialist",           // Endocrinologist
    "30": "specialist",           // Geriatrician
    "31": "paediatrics",          // Neonatologist
    "32": "specialist",           // Infectious Diseases
    "40": "dental",
    "41": "dental",               // Dental Specialist
    "50": "physiotherapy",
    "51": "occupational_therapy",
    "52": "specialist",           // Speech Therapist
    "53": "specialist",           // Audiologist
    "54": "dietetics",
    "55": "psychology",
    "56": "specialist",           // Social Worker
    "57": "specialist",           // Biokineticist
    "58": "specialist",           // Chiropractor
    "59": "specialist",           // Homeopath
    "60": "ophthalmology",        // Optometrist
    "61": "specialist",           // Podiatrist
    "70": "specialist",           // Pharmacy
    "71": "nursing",
    // 80-89: Facility codes — omitted (no practitioner discipline)
    "90": "emergency",            // Ambulance
    "91": "pathology",            // Pathology Laboratory
    "92": "radiology",            // Radiology Practice
  };

  const normalized = code.padStart(2, "0");
  // Return undefined for facility codes (80-89) and unknown codes
  // so that discipline validation is skipped for them
  return providerToDiscipline[normalized] || undefined;
}
