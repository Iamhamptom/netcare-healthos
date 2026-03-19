// Input validation helpers — no external deps

/** Strip HTML tags and trim */
export function sanitize(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

/** Validate email format */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Validate SA phone number (loose) */
export function isValidPhone(phone: string): boolean {
  return /^\+?[\d\s()-]{7,20}$/.test(phone);
}

/** Validate date string */
export function isValidDate(dateStr: string): boolean {
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

/** Clamp number to range */
export function clampInt(val: unknown, min: number, max: number): number | null {
  const n = Number(val);
  if (isNaN(n)) return null;
  return Math.max(min, Math.min(max, Math.round(n)));
}

/** Clamp float to range */
export function clampFloat(val: unknown, min: number, max: number): number | null {
  const n = Number(val);
  if (isNaN(n)) return null;
  return Math.max(min, Math.min(max, n));
}

/** Validate required string fields from a body object */
export function validateRequired(body: Record<string, unknown>, fields: string[]): string | null {
  for (const field of fields) {
    const val = body[field];
    if (val === undefined || val === null || (typeof val === "string" && val.trim() === "")) {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}
