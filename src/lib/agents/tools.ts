/**
 * Claims Agent Tools — AI SDK v6 format
 *
 * These tools give agents the ability to look up real data,
 * validate claims, search codes, and reason about clinical patterns.
 */

import { tool } from "ai";
import { z } from "zod";

// ── ICD-10 Lookup ──────────────────────────────────────────────

export const lookupICD10 = tool({
  description: "Look up an ICD-10 code in the SA MIT database. Returns description, gender/age restrictions, validity, and chapter.",
  inputSchema: z.object({
    code: z.string().describe("ICD-10 code to look up, e.g. J06.9, I10, N40"),
  }),
  execute: async ({ code }) => {
    const { lookupICD10Code } = await import("@/lib/claims/icd10-database");
    const entry = lookupICD10Code(code.toUpperCase());
    if (!entry) return { found: false, code, message: `ICD-10 code "${code}" not found in SA MIT database` };
    return {
      found: true,
      code: entry.code,
      description: entry.description,
      chapter: entry.chapter,
      isValid: entry.isValid,
      genderRestriction: entry.genderRestriction || "none",
      ageMin: entry.ageMin,
      ageMax: entry.ageMax,
      isPMB: entry.isPMB,
      isAsterisk: entry.isAsterisk,
      isDagger: entry.isDagger,
      requiresExternalCause: entry.requiresExternalCause,
    };
  },
});

// ── NAPPI Medicine Lookup ──────────────────────────────────────

export const lookupNAPPI = tool({
  description: "Look up a NAPPI medicine code. Returns drug name, strength, schedule, manufacturer.",
  inputSchema: z.object({
    code: z.string().describe("NAPPI code (7 digits), e.g. 7175002"),
  }),
  execute: async ({ code }) => {
    const { lookupNAPPI: lookup } = await import("@/lib/claims/nappi-database");
    const entry = lookup(code.replace(/-/g, ""));
    if (!entry) return { found: false, code, message: `NAPPI "${code}" not in reference database` };
    return { found: true, ...entry };
  },
});

// ── Tariff Code Lookup ─────────────────────────────────────────

export const lookupTariff = tool({
  description: "Look up a SA CCSA tariff code. Returns description, category, discipline, pre-auth requirements.",
  inputSchema: z.object({
    code: z.string().describe("4-digit tariff code, e.g. 0190, 5101, 0401"),
  }),
  execute: async ({ code }) => {
    const { lookupTariff: lookup } = await import("@/lib/claims/tariff-database");
    const entry = lookup(code);
    if (!entry) return { found: false, code, message: `Tariff "${code}" not in reference database` };
    return { found: true, code: entry.tariffCode, description: entry.description, category: entry.category, discipline: entry.discipline, requiresPreAuth: entry.requiresPreAuth };
  },
});

// ── Clinical Pattern Check ─────────────────────────────────────

export const checkClinicalPattern = tool({
  description: "Check if a tariff+diagnosis combination is a standard GP clinical pattern. Returns whether the combo is clinically reasonable.",
  inputSchema: z.object({
    tariffCode: z.string().describe("Tariff code"),
    icd10Code: z.string().describe("ICD-10 diagnosis code"),
    practicePrefix: z.string().optional().describe("First 3 digits of practice number (014=GP, 016=specialist)"),
  }),
  execute: async ({ tariffCode, icd10Code, practicePrefix }) => {
    const { isClinicallyReasonable, GP_CLINICAL_PATTERNS } = await import("@/lib/claims/doctor-reasoning");
    const isReasonable = isClinicallyReasonable(tariffCode, icd10Code);
    const isGP = practicePrefix === "014" || practicePrefix === "015";
    const matchedPattern = GP_CLINICAL_PATTERNS.find(p =>
      p.icd10Prefixes.some(pfx => icd10Code.startsWith(pfx)) && p.validTariffs.includes(tariffCode)
    );
    return {
      isReasonable,
      isGPPractice: isGP,
      matchedPattern: matchedPattern?.description || null,
      notes: matchedPattern?.notes || null,
      gpScope: isGP ? "GP can bill 0190-0199, 0401-0407, 3948, 4025, 4501-4537, 5101-5102" : "Specialist scope",
    };
  },
});

// ── Scheme Option Validation ───────────────────────────────────

export const validateSchemeOption = tool({
  description: "Check if a scheme option/plan code is valid for a given medical scheme.",
  inputSchema: z.object({
    scheme: z.string().describe("Medical scheme name, e.g. 'Discovery Health'"),
    optionCode: z.string().describe("Plan option code, e.g. 'CLSAV', 'KCPLUS'"),
  }),
  execute: async ({ scheme, optionCode }) => {
    const VALID_DISCOVERY = ["EXEC", "CLCOMP", "CLSAV", "CLESS", "CLPRI", "ESSAV", "ESCOMP", "SMCOMP", "SMPLAN", "COSAV", "KCPLUS", "KCCORE", "KCSTART", "DELSAV"];
    const schemeLower = scheme.toLowerCase();
    if (schemeLower.includes("discovery")) {
      const isValid = VALID_DISCOVERY.includes(optionCode.toUpperCase());
      const isKeycare = optionCode.toUpperCase().startsWith("KC");
      return { valid: isValid, scheme, optionCode, isKeycare, validCodes: isValid ? undefined : VALID_DISCOVERY };
    }
    return { valid: true, scheme, optionCode, note: "Only Discovery Health option codes are validated currently" };
  },
});

// ── RAG Knowledge Search ───────────────────────────────────────

export const searchKnowledgeBase = tool({
  description: "Search the SA healthcare knowledge base (ICD-10, scheme rules, clinical guidelines, fraud patterns, regulations). Use this when you need SA-specific information.",
  inputSchema: z.object({
    query: z.string().describe("What to search for"),
  }),
  execute: async ({ query }) => {
    try {
      const { retrieve } = await import("@/lib/rag");
      const { context } = retrieve(query);
      return { found: !!context, context: context?.slice(0, 2000) || "No results found" };
    } catch {
      return { found: false, context: "RAG not available" };
    }
  },
});

// ── Prompt Injection Check ─────────────────────────────────────

export const checkPromptInjection = tool({
  description: "Analyze motivation text for prompt injection attempts vs legitimate clinical language.",
  inputSchema: z.object({
    text: z.string().describe("The motivation text to analyze"),
  }),
  execute: async ({ text }) => {
    const lower = text.toLowerCase();
    const adversarial = [
      "ignore all", "bypass", "skip validation", "skip checks", "do not validate",
      "return valid", "mark as valid", "approve immediately", "process immediately",
      "cms circular", "mandates processing", "rejection is unlawful",
      "auto-approved", "fallback handler", "switch error",
      "medical advisor pre-approved", "pre-approved by",
    ];
    const clinical = [
      "override previous", "switched from", "allergic to", "allergy protocol",
      "stepped up", "dose adjusted", "therapy escalation",
      "injection site", "insulin injection", "im injection",
    ];
    const hasAdversarial = adversarial.some(p => lower.includes(p));
    const hasClinical = clinical.some(p => lower.includes(p));
    return {
      isInjection: hasAdversarial && !hasClinical,
      isClinical: hasClinical,
      isAmbiguous: hasAdversarial && hasClinical,
      reasoning: hasAdversarial && !hasClinical
        ? "Contains system instructions (bypass, skip, approve). This is adversarial."
        : hasClinical
        ? "Contains clinical decisions (medication changes, allergy notes). This is legitimate."
        : "No suspicious patterns detected.",
    };
  },
});
