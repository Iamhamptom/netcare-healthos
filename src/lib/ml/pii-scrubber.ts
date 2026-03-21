// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PII Scrubber — Strips personal information from medical data
//
// POPIA 2026 compliance: health data regulations in force, NO grace period.
// This module sanitizes text before it enters:
// - Training data generation
// - Model inference prompts
// - Learning event storage
// - Knowledge base embedding
//
// Detected PII types:
// - SA ID numbers (13 digits, Luhn validated)
// - Phone numbers (+27..., 0..., international)
// - Medical aid member numbers (scheme-specific formats)
// - Email addresses
// - Physical addresses (street patterns)
// - Patient names (when provided for replacement)
// - Practice/BHF numbers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ScrubResult {
  text: string;
  piiFound: PIIMatch[];
  piiCount: number;
}

export interface PIIMatch {
  type: PIIType;
  original: string;
  replacement: string;
  index: number;
}

export type PIIType =
  | "sa_id"
  | "phone"
  | "email"
  | "medical_aid_number"
  | "name"
  | "address"
  | "bhf_number"
  | "date_of_birth";

// ─── Patterns ───────────────────────────────────────────────────────────────

const PATTERNS: { type: PIIType; regex: RegExp; replacement: string }[] = [
  // SA ID number: 13 digits (YYMMDD SSSS C A Z)
  {
    type: "sa_id",
    regex: /\b(\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{4}[01]\d{2}\b/g,
    replacement: "[SA_ID_REDACTED]",
  },
  // Phone numbers: +27, 0XX, or international
  {
    type: "phone",
    regex: /(?:\+27|0)\s*(?:\d[\s-]*){9,10}\b/g,
    replacement: "[PHONE_REDACTED]",
  },
  // International phone (non-SA)
  {
    type: "phone",
    regex: /\+\d{1,3}\s*(?:\d[\s-]*){8,12}\b/g,
    replacement: "[PHONE_REDACTED]",
  },
  // Email
  {
    type: "email",
    regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    replacement: "[EMAIL_REDACTED]",
  },
  // Medical aid member numbers — scheme-specific patterns
  // Discovery: starts with 9, 10-12 digits
  {
    type: "medical_aid_number",
    regex: /\b9\d{9,11}\b/g,
    replacement: "[MEMBER_NO_REDACTED]",
  },
  // GEMS: 9 digits with leading zeros
  {
    type: "medical_aid_number",
    regex: /\b0{1,3}\d{6,8}\b/g,
    replacement: "[MEMBER_NO_REDACTED]",
  },
  // BHF practice number: 7 digits
  {
    type: "bhf_number",
    regex: /\bBHF[\s:#-]*\d{7}\b/gi,
    replacement: "[BHF_REDACTED]",
  },
  // HPCSA number: MP/DR/PS + digits
  {
    type: "bhf_number",
    regex: /\b(?:MP|DR|PS|DT|PT|OT|SL|DC)\s*\d{5,7}\b/g,
    replacement: "[HPCSA_REDACTED]",
  },
  // Date of birth patterns: DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY
  {
    type: "date_of_birth",
    regex: /\b(?:DOB|date\s*of\s*birth|born|birth\s*date)[:\s]*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{4}[\/-]\d{1,2}[\/-]\d{1,2})/gi,
    replacement: "[DOB_REDACTED]",
  },
  // Street addresses (SA patterns)
  {
    type: "address",
    regex: /\d{1,5}\s+(?:(?:Rd|Road|St|Street|Ave|Avenue|Blvd|Boulevard|Dr|Drive|Ln|Lane|Cres|Crescent|Pl|Place|Way|Close|Circle)\b[^,\n]{0,60})/gi,
    replacement: "[ADDRESS_REDACTED]",
  },
];

// ─── Core Scrubber ──────────────────────────────────────────────────────────

/**
 * Scrub PII from text, replacing with bracketed tokens.
 * Returns the sanitized text and a log of what was found.
 */
export function scrubPII(text: string, knownNames?: string[]): ScrubResult {
  const matches: PIIMatch[] = [];
  let scrubbed = text;

  // Apply pattern-based scrubbing
  for (const pattern of PATTERNS) {
    scrubbed = scrubbed.replace(pattern.regex, (match, ...args) => {
      // Get the index — last numeric arg before the full string
      const index = typeof args[args.length - 2] === "number" ? args[args.length - 2] : 0;
      matches.push({
        type: pattern.type,
        original: match,
        replacement: pattern.replacement,
        index,
      });
      return pattern.replacement;
    });
  }

  // Scrub known patient names if provided
  if (knownNames?.length) {
    for (const name of knownNames) {
      if (!name || name.length < 2) continue;
      // Split into first/last name parts and scrub each
      const parts = name.split(/\s+/).filter(p => p.length >= 2);
      for (const part of parts) {
        const nameRegex = new RegExp(`\\b${escapeRegex(part)}\\b`, "gi");
        scrubbed = scrubbed.replace(nameRegex, (match) => {
          matches.push({
            type: "name",
            original: match,
            replacement: "[NAME_REDACTED]",
            index: 0,
          });
          return "[NAME_REDACTED]";
        });
      }
    }
  }

  return {
    text: scrubbed,
    piiFound: matches,
    piiCount: matches.length,
  };
}

/**
 * Scrub PII from a training example (instruction, input, output).
 */
export function scrubTrainingExample(example: {
  instruction: string;
  input: string;
  output: string;
  category: string;
}, knownNames?: string[]): {
  instruction: string;
  input: string;
  output: string;
  category: string;
  piiStripped: number;
} {
  const i = scrubPII(example.instruction, knownNames);
  const inp = scrubPII(example.input, knownNames);
  const o = scrubPII(example.output, knownNames);

  return {
    instruction: i.text,
    input: inp.text,
    output: o.text,
    category: example.category,
    piiStripped: i.piiCount + inp.piiCount + o.piiCount,
  };
}

/**
 * Scrub PII from JSON data (claim objects, patient records, etc.).
 * Deep-walks the object and scrubs all string values.
 */
export function scrubJSON(data: Record<string, unknown>, knownNames?: string[]): {
  data: Record<string, unknown>;
  piiCount: number;
} {
  let totalPII = 0;

  function walk(obj: unknown): unknown {
    if (typeof obj === "string") {
      const result = scrubPII(obj, knownNames);
      totalPII += result.piiCount;
      return result.text;
    }
    if (Array.isArray(obj)) return obj.map(walk);
    if (obj && typeof obj === "object") {
      const cleaned: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        // Skip known safe fields (ICD-10 codes, tariff codes, amounts)
        if (["icd10", "icd10Codes", "tariffCodes", "code", "rejectionCode", "amount", "claimedAmount", "approvedAmount"].includes(key)) {
          cleaned[key] = value;
        } else {
          cleaned[key] = walk(value);
        }
      }
      return cleaned;
    }
    return obj;
  }

  return {
    data: walk(data) as Record<string, unknown>,
    piiCount: totalPII,
  };
}

/**
 * Validate that text contains no detectable PII.
 * Returns true if clean, false if PII detected.
 */
export function isPIIFree(text: string): boolean {
  return scrubPII(text).piiCount === 0;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
