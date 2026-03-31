/**
 * AI Security Layer — Netcare Health OS
 *
 * Enforces PII stripping, prompt injection detection, and override gates
 * BEFORE any data reaches an LLM provider.
 *
 * Called automatically by the Intelligence Engine — not optional.
 */

// ─── PII Patterns (SA-specific) ─────────────────────────────────────────────

const SA_ID_REGEX = /\b\d{2}[01]\d[0-3]\d\d{4}[01]\d{2}\b/g;            // SA 13-digit ID
const PHONE_REGEX = /\b(?:\+27|0)[6-8]\d{8}\b/g;                          // SA mobile
const EMAIL_REGEX = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;
const MEMBERSHIP_REGEX = /\b[A-Z]{0,3}\d{6,12}\b/g;                       // Medical aid membership
const NAME_PATTERN = /\b[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g; // "FirstName LastName"

export interface PIIScrubResult {
  scrubbed: string;
  piiFound: number;
  types: string[];
}

/**
 * Strip PII from text BEFORE sending to LLM.
 * Returns scrubbed text + count of PII items found.
 */
export function scrubPII(text: string): PIIScrubResult {
  if (!text) return { scrubbed: text, piiFound: 0, types: [] };

  const types: string[] = [];
  let scrubbed = text;
  let piiFound = 0;

  // SA ID numbers → [SA_ID]
  const idMatches = scrubbed.match(SA_ID_REGEX);
  if (idMatches) {
    piiFound += idMatches.length;
    types.push("sa_id");
    scrubbed = scrubbed.replace(SA_ID_REGEX, "[SA_ID_REDACTED]");
  }

  // Phone numbers → [PHONE]
  const phoneMatches = scrubbed.match(PHONE_REGEX);
  if (phoneMatches) {
    piiFound += phoneMatches.length;
    types.push("phone");
    scrubbed = scrubbed.replace(PHONE_REGEX, "[PHONE_REDACTED]");
  }

  // Email addresses → [EMAIL]
  const emailMatches = scrubbed.match(EMAIL_REGEX);
  if (emailMatches) {
    piiFound += emailMatches.length;
    types.push("email");
    scrubbed = scrubbed.replace(EMAIL_REGEX, "[EMAIL_REDACTED]");
  }

  // Medical aid membership → [MEMBERSHIP]
  const memberMatches = scrubbed.match(MEMBERSHIP_REGEX);
  if (memberMatches) {
    piiFound += memberMatches.length;
    types.push("membership");
    scrubbed = scrubbed.replace(MEMBERSHIP_REGEX, "[MEMBERSHIP_REDACTED]");
  }

  return { scrubbed, piiFound, types };
}

/**
 * Mask a patient name to initials: "Sarah Naidoo" → "S.N."
 */
export function maskName(name: string): string {
  if (!name || name.length < 2) return "[PATIENT]";
  const parts = name.trim().split(/\s+/);
  return parts.map(p => p[0]?.toUpperCase() + ".").join("");
}

/**
 * Scrub patient context before injecting into system prompt.
 * Replaces names with initials, strips IDs, phones, emails.
 */
export function scrubContextForLLM(context: {
  patientName?: string;
  patientData?: Record<string, unknown>;
  message?: string;
}): { patientName: string; patientData: Record<string, unknown>; message: string } {
  const name = context.patientName ? maskName(context.patientName) : "[PATIENT]";

  let dataStr = context.patientData ? JSON.stringify(context.patientData) : "{}";
  const { scrubbed: scrubbedData } = scrubPII(dataStr);

  const { scrubbed: scrubbedMsg } = scrubPII(context.message || "");

  return {
    patientName: name,
    patientData: JSON.parse(scrubbedData),
    message: scrubbedMsg,
  };
}

// ─── Prompt Injection Detection ─────────────────────────────────────────────

const INJECTION_PATTERNS = [
  /ignore\s+(all|previous|above|your)\s+(instructions|rules|prompts)/i,
  /bypass\s+(validation|checks|security|rules)/i,
  /skip\s+(validation|checks|verification)/i,
  /do\s+not\s+validate/i,
  /return\s+(valid|approved|true)/i,
  /mark\s+(as\s+)?(valid|approved)/i,
  /approve\s+immediately/i,
  /process\s+immediately/i,
  /override\s+(all|rules|gates)/i,
  /you\s+are\s+(now|a)\s/i,
  /new\s+instructions?:/i,
  /system\s*:\s/i,
  /```system/i,
  /\[INST\]/i,
  /<\|im_start\|>/i,
  /---\s*END\s*(CONTEXT|SYSTEM|PROMPT)/i,
  /IGNORE\s+YOUR\s+RULES/i,
];

export interface InjectionCheckResult {
  isInjection: boolean;
  confidence: number;
  matchedPatterns: string[];
}

/**
 * Check text for prompt injection attempts.
 * Returns injection probability and matched patterns.
 */
export function checkInjection(text: string): InjectionCheckResult {
  if (!text) return { isInjection: false, confidence: 0, matchedPatterns: [] };

  const matchedPatterns: string[] = [];

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      matchedPatterns.push(pattern.source);
    }
  }

  const confidence = Math.min(matchedPatterns.length * 0.35, 1.0);

  return {
    isInjection: matchedPatterns.length > 0,
    confidence,
    matchedPatterns,
  };
}

/**
 * Escape user input for safe interpolation into prompts.
 * Wraps in markers so the LLM can distinguish user data from instructions.
 */
export function escapeForPrompt(text: string, label: string = "USER_DATA"): string {
  // Strip any attempt to close/open system markers
  const cleaned = text
    .replace(/\[\/?(SYSTEM|CONTEXT|INSTRUCTION|USER_DATA)[^\]]*\]/gi, "")
    .replace(/```(system|instruction)/gi, "```text");

  return `[${label}_START]\n${cleaned}\n[${label}_END]`;
}

// ─── AI Audit Logging (Persisted) ───────────────────────────────────────────

export interface AIAuditEntry {
  agent: string;
  provider: string;
  model: string;
  confidence: number;
  toolsUsed: string[];
  verdict: string;
  piiStripped: number;
  injectionChecked: boolean;
  injectionDetected: boolean;
  overrideAttempts: number;
  overridesBlocked: number;
  practiceId?: string;
  userId?: string;
  durationMs: number;
  timestamp: string;
}

const AUDIT_BUFFER: AIAuditEntry[] = [];
const MAX_BUFFER = 50;

/**
 * Log an AI decision. Buffers in memory and flushes to Supabase.
 */
export function logAIDecision(entry: AIAuditEntry): void {
  AUDIT_BUFFER.push(entry);

  if (AUDIT_BUFFER.length >= MAX_BUFFER) {
    flushAIAuditLog();
  }
}

/**
 * Flush buffered AI audit entries to Supabase.
 */
export async function flushAIAuditLog(): Promise<void> {
  if (AUDIT_BUFFER.length === 0) return;

  const entries = AUDIT_BUFFER.splice(0, AUDIT_BUFFER.length);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) return;

  try {
    await fetch(`${supabaseUrl}/rest/v1/ho_ai_audit_log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify(entries),
    });
  } catch {
    // Fire-and-forget — never block the request path
  }
}

// ─── Override Enforcement ────────────────────────────────────────────────────

/**
 * Tier 1 and Tier 2 rule codes that can NEVER be overridden by any AI layer.
 * Sourced from Medical Schemes Act, CMS circulars, PHISC specifications.
 */
const IMMUTABLE_RULE_CODES = new Set([
  // Tier 1 — SA Law (immutable)
  "MISSING_ICD10",
  "INVALID_ICD10",
  "GENDER_MISMATCH",
  "AGE_VIOLATION",
  "MISSING_ECC",
  "FABRICATED_NAPPI",
  "FABRICATED_ICD10",
  "FABRICATED_TARIFF",
  "IMPOSSIBLE_CODE",
  "DECEASED_PATIENT",
  // Tier 2 — CMS Circulars (immutable)
  "LATE_SUBMISSION_120",
  "FUTURE_DATE_CLAIM",
  "DUPLICATE_EXACT",
  "MISSING_PRACTICE_NUMBER",
  "MISSING_PATIENT_ID",
  "INVALID_SCHEME",
  "SUSPENDED_PRACTICE",
]);

export interface OverrideCheckResult {
  allowed: boolean;
  reason: string;
  ruleCode: string;
  tier: number;
}

/**
 * Check if an AI layer is allowed to override a specific rule verdict.
 * Returns false for Tier 1 and Tier 2 rules — these are IMMUTABLE.
 */
export function canOverrideRule(ruleCode: string): OverrideCheckResult {
  if (IMMUTABLE_RULE_CODES.has(ruleCode)) {
    return {
      allowed: false,
      reason: `Rule ${ruleCode} is Tier 1/2 (immutable). No AI layer can override. Source: Medical Schemes Act / CMS Circulars.`,
      ruleCode,
      tier: ruleCode.startsWith("LATE_") || ruleCode.startsWith("FUTURE_") || ruleCode.startsWith("DUPLICATE_") ? 2 : 1,
    };
  }

  return {
    allowed: true,
    reason: `Rule ${ruleCode} is Tier 3+ (configurable). AI advisory is permitted.`,
    ruleCode,
    tier: 3,
  };
}

/**
 * Filter AI suggestions to BLOCK any that attempt to override immutable rules.
 * Returns the filtered suggestions + count of blocked attempts.
 */
export function enforceOverrideGates(
  suggestions: Array<{ ruleCode: string; action: string; [key: string]: unknown }>,
): { filtered: typeof suggestions; blocked: number; blockedCodes: string[] } {
  const filtered: typeof suggestions = [];
  const blockedCodes: string[] = [];

  for (const suggestion of suggestions) {
    const check = canOverrideRule(suggestion.ruleCode);
    if (!check.allowed && (suggestion.action === "override" || suggestion.action === "downgrade" || suggestion.action === "remove")) {
      blockedCodes.push(suggestion.ruleCode);
    } else {
      filtered.push(suggestion);
    }
  }

  return { filtered, blocked: blockedCodes.length, blockedCodes };
}
