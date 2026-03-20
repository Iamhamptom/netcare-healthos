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
 * Map Healthbridge PROVIDER_TYPE codes to SA discipline names.
 * Based on BHF (Board of Healthcare Funders) practice codes.
 */
function mapProviderType(code: string): string | undefined {
  if (!code) return undefined;

  const providerTypeMap: Record<string, string> = {
    "01": "General Practitioner",
    "02": "Specialist Physician",
    "03": "Surgeon",
    "04": "Gynaecologist",
    "05": "Psychiatrist",
    "06": "Neurosurgeon",
    "07": "Anaesthetist",
    "08": "Radiologist",
    "09": "Pathologist",
    "10": "Paediatrician",
    "11": "Ophthalmologist",
    "12": "Urologist",
    "13": "Plastic Surgeon",
    "14": "Orthopaedic Surgeon",
    "15": "ENT Specialist",
    "16": "Cardiologist",
    "17": "Neurologist",
    "18": "Cardiothoracic Surgeon",
    "19": "Dermatologist",
    "20": "Oncologist",
    "21": "Nuclear Medicine",
    "22": "Physical Rehabilitation",
    "23": "Maxillofacial Surgeon",
    "24": "Pulmonologist",
    "25": "Nephrologist",
    "26": "Gastroenterologist",
    "27": "Rheumatologist",
    "28": "Clinical Haematologist",
    "29": "Endocrinologist",
    "30": "Geriatrician",
    "31": "Neonatologist",
    "32": "Infectious Diseases",
    "40": "Dentist",
    "41": "Dental Specialist",
    "50": "Physiotherapist",
    "51": "Occupational Therapist",
    "52": "Speech Therapist",
    "53": "Audiologist",
    "54": "Dietitian",
    "55": "Psychologist",
    "56": "Social Worker",
    "57": "Biokineticist",
    "58": "Chiropractor",
    "59": "Homeopath",
    "60": "Optometrist",
    "61": "Podiatrist",
    "70": "Pharmacy",
    "71": "Nursing",
    "80": "Hospital",
    "81": "Day Clinic",
    "82": "Sub-Acute Facility",
    "83": "Hospice",
    "90": "Ambulance",
    "91": "Pathology Laboratory",
    "92": "Radiology Practice",
  };

  return providerTypeMap[code.padStart(2, "0")] ?? code;
}
