/**
 * Shared Brain Bridge — Connects Netcare Health OS Claims Analyzer to VisioCode
 *
 * VisioCode has 244,421 codes across 5 systems + 250+ validation rules + F1=0.91
 * This bridge gives Claims Analyzer access to all of it via API.
 *
 * Falls back to local hardcoded database if API unavailable.
 */

import { VisioCodeBrain, type Code, type ValidationResult } from "@/lib/shared-brain";
import { ICD10_DATABASE } from "./icd10-database";

const BRAIN_URL = process.env.VISIOCODE_API_URL || "https://visiocode.vercel.app";
const BRAIN_KEY = process.env.VISIOCODE_API_KEY || process.env.VISIO_GATEWAY_KEY || "";

const brain = BRAIN_KEY ? new VisioCodeBrain(BRAIN_URL, BRAIN_KEY, "netcare-healthos") : null;

const cache = new Map<string, { data: unknown; expires: number }>();
const TTL = 5 * 60 * 1000;

function cached<T>(key: string): T | null {
  const e = cache.get(key);
  if (e && e.expires > Date.now()) return e.data as T;
  cache.delete(key);
  return null;
}

/** Search ICD-10 codes — 244K via brain, 1.8K local fallback */
export async function brainLookupICD10(query: string, limit = 20): Promise<Code[]> {
  const key = `icd10:${query}:${limit}`;
  const c = cached<Code[]>(key);
  if (c) return c;

  if (brain) {
    try {
      const codes = await brain.lookupICD10(query, "icd10_za", limit);
      cache.set(key, { data: codes, expires: Date.now() + TTL });
      return codes;
    } catch { /* fallback */ }
  }

  const q = query.toLowerCase();
  const results = ICD10_DATABASE
    .filter(e => e.code.toLowerCase().includes(q) || e.description.toLowerCase().includes(q))
    .slice(0, limit)
    .map(e => ({
      code: e.code,
      description: e.description,
      chapter: e.chapter || 0,
      pmb: e.isPMB || false,
      cdl: e.isCDL || false,
      gender: (e.genderRestriction as "M" | "F" | null) || null,
      valid_primary: e.validAsPrimary !== false,
    }));

  cache.set(key, { data: results, expires: Date.now() + TTL });
  return results;
}

/** Validate code combinations — 250+ rules via brain, basic local fallback */
export async function brainValidateCodes(codes: string[]): Promise<ValidationResult> {
  const key = `val:${codes.sort().join(",")}`;
  const c = cached<ValidationResult>(key);
  if (c) return c;

  if (brain) {
    try {
      const result = await brain.validateCodes(codes);
      cache.set(key, { data: result, expires: Date.now() + TTL });
      return result;
    } catch { /* fallback */ }
  }

  const { checkCodePairViolations } = await import("./code-pair-violations");
  const violations = checkCodePairViolations(codes);
  const result: ValidationResult = {
    codes, system: "icd10_za", valid: violations.length === 0,
    pair_violations: violations.map(v => ({ pair: [v.code1, v.code2], type: v.type, reason: v.reason })),
    external_cause: { valid: true, missing: [], message: "Local only" },
  };
  cache.set(key, { data: result, expires: Date.now() + TTL });
  return result;
}

/** Assign ICD-10 codes from clinical note — brain only (no local equivalent) */
export async function brainAssignCodes(note: string): Promise<{ code: string; description: string; confidence: number; is_primary: boolean }[]> {
  if (!brain) return [];
  try {
    const res = await fetch(`${BRAIN_URL}/api/v1/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": BRAIN_KEY, "x-product-id": "netcare-healthos" },
      body: JSON.stringify({ note, system: "icd10_za" }),
    });
    if (!res.ok) return [];
    return (await res.json()).codes || [];
  } catch { return []; }
}

/** Check if shared brain is available */
export async function brainIsConnected(): Promise<boolean> {
  if (!brain) return false;
  try {
    const res = await fetch(`${BRAIN_URL}/api/health`);
    const d = await res.json();
    return d.status === "healthy";
  } catch { return false; }
}
