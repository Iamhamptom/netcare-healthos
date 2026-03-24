/**
 * RAG v3 Structured Retriever — Netcare Health OS
 * Wraps existing SQL/in-memory lookup functions for exact data retrieval.
 * ICD-10, Tariff, NAPPI, Facility, Code Pair violations.
 */

import { lookupICD10, searchICD10 } from "@/lib/claims/icd10-database";
import { lookupTariff, searchTariffs } from "@/lib/claims/tariff-database";
import { lookupNAPPI, lookupNAPPIAsync } from "@/lib/claims/nappi-database";
import {
  lookupFacilityByPracticeNumber,
  searchFacilities,
} from "@/lib/claims/facility-database";
import { checkCodePairViolations } from "@/lib/claims/code-pairs";
import type { StructuredResult } from "./types";

// ── Pattern matchers for entity detection ─────────────────────────

const ICD10_PATTERN = /\b([A-Z]\d{2}\.?\d{0,2})\b/gi;
const TARIFF_PATTERN = /\b(\d{4})\b/g;
const NAPPI_PATTERN = /\b(\d{7,10})\b/g;
const PRACTICE_NUMBER_PATTERN = /\b(MP|PR|DN|DP|PS|PT|OT|SW|DT|NU|OP|RD)\d{5,7}\b/gi;
const FACILITY_KEYWORDS =
  /\b(hospital|clinic|facility|practice|netcare|mediclinic|life\s?healthcare|milpark|sunninghill|christiaan\s?barnard)\b/gi;

/**
 * Detect entity type from query and perform structured lookup.
 * Returns formatted results with confidence score.
 */
export async function structuredLookup(
  query: string,
  entityType?: string
): Promise<StructuredResult> {
  // If entity type is explicitly specified, go directly to that lookup
  if (entityType) {
    switch (entityType) {
      case "icd10":
        return lookupICD10Codes(query);
      case "tariff":
        return lookupTariffCodes(query);
      case "nappi":
        return await lookupNAPPICodes(query);
      case "facility":
        return lookupFacilities(query);
      case "code_pair":
        return checkPairViolations(query);
    }
  }

  // Auto-detect entity type from query patterns
  const results: StructuredResult[] = [];

  // Check ICD-10 codes
  const icd10Matches = query.match(ICD10_PATTERN);
  if (icd10Matches && icd10Matches.length > 0) {
    results.push(lookupICD10Codes(query));
  }

  // Check NAPPI codes (check before tariff since NAPPI codes are longer)
  const nappiMatches = query.match(NAPPI_PATTERN);
  if (nappiMatches && nappiMatches.length > 0) {
    results.push(await lookupNAPPICodes(query));
  }

  // Check tariff codes (4-digit numbers not already matched as NAPPI)
  const tariffMatches = query.match(TARIFF_PATTERN);
  if (tariffMatches && tariffMatches.length > 0 && !nappiMatches) {
    results.push(lookupTariffCodes(query));
  }

  // Check practice numbers
  const practiceMatches = query.match(PRACTICE_NUMBER_PATTERN);
  if (practiceMatches && practiceMatches.length > 0) {
    results.push(lookupFacilities(query));
  }

  // Check facility keywords
  if (FACILITY_KEYWORDS.test(query)) {
    results.push(lookupFacilities(query));
  }

  // Check for code pair violation queries
  if (/\b(unbundl|pair|violation|combin|together)\b/i.test(query)) {
    const codes = extractAllCodes(query);
    if (codes.length >= 2) {
      results.push(checkPairViolations(query));
    }
  }

  // Return the highest confidence result, or combine if multiple
  if (results.length === 0) {
    return { type: "none", data: [], formatted: "", confidence: 0 };
  }

  // Filter out empty results
  const valid = results.filter((r) => r.data.length > 0);
  if (valid.length === 0) {
    return { type: "none", data: [], formatted: "", confidence: 0 };
  }

  if (valid.length === 1) {
    return valid[0];
  }

  // Combine multiple results
  const combined: StructuredResult = {
    type: valid[0].type,
    data: valid.flatMap((r) => r.data),
    formatted: valid.map((r) => r.formatted).join("\n\n"),
    confidence: Math.max(...valid.map((r) => r.confidence)),
  };

  return combined;
}

// ── Helpers for safe property access ──────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function prop(obj: any, key: string): string {
  return String(obj?.[key] ?? "");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toRecord(obj: any): Record<string, unknown> {
  return obj as Record<string, unknown>;
}

// ── Individual lookup functions ───────────────────────────────────

function lookupICD10Codes(query: string): StructuredResult {
  const codes = query.toUpperCase().match(ICD10_PATTERN) || [];
  const data: Record<string, unknown>[] = [];
  const lines: string[] = [];

  for (const code of codes) {
    const normalized = code.replace(".", "");
    const entry = lookupICD10(code) || lookupICD10(normalized);
    if (entry) {
      data.push(toRecord(entry));
      lines.push(
        `ICD-10-ZA ${code}: ${prop(entry, "ICD10_Description") || prop(entry, "description") || JSON.stringify(entry)}`
      );
    }
  }

  // If no exact matches, try search
  if (data.length === 0) {
    const searchResults = searchICD10(query, 5);
    for (const entry of searchResults) {
      data.push(toRecord(entry));
      lines.push(
        `ICD-10-ZA ${prop(entry, "ICD10_Code") || prop(entry, "code")}: ${prop(entry, "ICD10_Description") || prop(entry, "description")}`
      );
    }
  }

  return {
    type: "icd10",
    data,
    formatted:
      data.length > 0
        ? `=== ICD-10 LOOKUP ===\n${lines.join("\n")}`
        : "",
    confidence: codes.length > 0 && data.length > 0 ? 0.95 : 0.3,
  };
}

function lookupTariffCodes(query: string): StructuredResult {
  const codes = query.match(TARIFF_PATTERN) || [];
  const data: Record<string, unknown>[] = [];
  const lines: string[] = [];

  for (const code of codes) {
    const entry = lookupTariff(code);
    if (entry) {
      data.push(toRecord(entry));
      const desc = prop(entry, "description");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rates = (entry as any).rates as Record<string, number> | undefined;
      const rateStr = rates
        ? Object.entries(rates)
            .map(([d, r]) => `${d}: R${r.toFixed(2)}`)
            .join(", ")
        : "";
      lines.push(`CCSA Tariff ${code}: ${desc.slice(0, 200)}${rateStr ? `. Rates: ${rateStr}` : ""}`);
    }
  }

  // If no exact matches, try search
  if (data.length === 0) {
    const searchResults = searchTariffs(query);
    for (const entry of searchResults.slice(0, 5)) {
      data.push(toRecord(entry));
      lines.push(
        `CCSA Tariff ${prop(entry, "code")}: ${prop(entry, "description").slice(0, 200)}`
      );
    }
  }

  return {
    type: "tariff",
    data,
    formatted:
      data.length > 0
        ? `=== TARIFF LOOKUP ===\n${lines.join("\n")}`
        : "",
    confidence: codes.length > 0 && data.length > 0 ? 0.95 : 0.3,
  };
}

async function lookupNAPPICodes(query: string): Promise<StructuredResult> {
  const codes = query.match(NAPPI_PATTERN) || [];
  const data: Record<string, unknown>[] = [];
  const lines: string[] = [];

  for (const code of codes) {
    // Try sync first, then async
    let entry = lookupNAPPI(code);
    if (!entry) {
      entry = await lookupNAPPIAsync(code);
    }
    if (entry) {
      data.push(toRecord(entry));
      const name = prop(entry, "name") || prop(entry, "product_name");
      const sep = prop(entry, "sep") || prop(entry, "SEP");
      lines.push(`NAPPI ${code}: ${name}${sep ? ` (SEP: R${sep})` : ""}`);
    }
  }

  return {
    type: "nappi",
    data,
    formatted:
      data.length > 0
        ? `=== NAPPI/MEDICINE LOOKUP ===\n${lines.join("\n")}`
        : "",
    confidence: codes.length > 0 && data.length > 0 ? 0.95 : 0.2,
  };
}

function lookupFacilities(query: string): StructuredResult {
  const data: Record<string, unknown>[] = [];
  const lines: string[] = [];

  // Try practice number lookup
  const practiceNumbers = query.match(PRACTICE_NUMBER_PATTERN) || [];
  for (const pn of practiceNumbers) {
    const facility = lookupFacilityByPracticeNumber(pn.toUpperCase());
    if (facility) {
      data.push(toRecord(facility));
      lines.push(
        `Facility ${pn}: ${prop(facility, "name")} — ${prop(facility, "province")}`
      );
    }
  }

  // Try name search if no practice number results
  if (data.length === 0) {
    const results = searchFacilities(query);
    for (const f of results.slice(0, 5)) {
      data.push(toRecord(f));
      lines.push(
        `${prop(f, "name")} — ${prop(f, "type")}, ${prop(f, "province")}`
      );
    }
  }

  return {
    type: "facility",
    data,
    formatted:
      data.length > 0
        ? `=== FACILITY LOOKUP ===\n${lines.join("\n")}`
        : "",
    confidence: data.length > 0 ? 0.9 : 0.1,
  };
}

function checkPairViolations(query: string): StructuredResult {
  const codes = extractAllCodes(query);
  if (codes.length < 2) {
    return { type: "code_pair", data: [], formatted: "", confidence: 0 };
  }

  const violations = checkCodePairViolations(codes);
  const data = violations.map((v) => toRecord(v));
  const lines = violations.map(
    (v) =>
      `${prop(v, "type").toUpperCase() || "VIOLATION"}: ${prop(v, "codeA")} + ${prop(v, "codeB")} — ${prop(v, "description") || prop(v, "reason")}`
  );

  return {
    type: "code_pair",
    data,
    formatted:
      violations.length > 0
        ? `=== CODE PAIR VIOLATIONS ===\n${lines.join("\n")}`
        : `=== CODE PAIR CHECK ===\nNo violations found for codes: ${codes.join(", ")}`,
    confidence: 0.95,
  };
}

// ── Helpers ───────────────────────────────────────────────────────

function extractAllCodes(query: string): string[] {
  const codes: string[] = [];

  // ICD-10 codes
  for (const m of query.toUpperCase().match(ICD10_PATTERN) || []) {
    codes.push(m);
  }
  // Tariff codes (4 digits)
  for (const m of query.match(TARIFF_PATTERN) || []) {
    codes.push(m);
  }

  return Array.from(new Set(codes));
}
