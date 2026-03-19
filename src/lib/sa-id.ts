// South African ID Number Parser
// Format: YYMMDD GSSS C A Z (13 digits)
// - YYMMDD: Date of birth
// - G: Gender (0-4 female, 5-9 male)
// - SSS: Sequence
// - C: Citizenship (0 = SA, 1 = permanent resident)
// - A: Usually 8 (legacy)
// - Z: Luhn checksum digit

export interface SAIDResult {
  valid: boolean;
  dateOfBirth?: Date;
  gender?: "male" | "female";
  citizen?: boolean;
  age?: number;
  error?: string;
}

function luhnCheck(id: string): boolean {
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    let digit = parseInt(id[i]);
    if (i % 2 !== 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

export function parseSAID(id: string): SAIDResult {
  const cleaned = id.replace(/[\s-]/g, "");

  if (cleaned.length !== 13 || !/^\d{13}$/.test(cleaned)) {
    return { valid: false, error: "Must be exactly 13 digits" };
  }

  if (!luhnCheck(cleaned)) {
    return { valid: false, error: "Invalid checksum" };
  }

  const yy = parseInt(cleaned.substring(0, 2));
  const mm = parseInt(cleaned.substring(2, 4));
  const dd = parseInt(cleaned.substring(4, 6));
  const genderDigit = parseInt(cleaned.substring(6, 7));
  const citizenDigit = parseInt(cleaned.substring(10, 11));

  // Determine century: 00-25 → 2000s, 26-99 → 1900s
  const year = yy <= 25 ? 2000 + yy : 1900 + yy;

  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) {
    return { valid: false, error: "Invalid date in ID" };
  }

  const dateOfBirth = new Date(year, mm - 1, dd);
  const gender = genderDigit >= 5 ? "male" : "female";
  const citizen = citizenDigit === 0;

  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }

  return { valid: true, dateOfBirth, gender, citizen, age };
}
