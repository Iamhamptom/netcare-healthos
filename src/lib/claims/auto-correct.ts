// Auto-Correction Engine — High-confidence fixes applied automatically
// Only auto-corrects issues where the fix is deterministic (no clinical judgement needed)

import type { ValidationIssue, ClaimLineItem } from "./types";
import { lookupICD10 } from "./icd10-database";

export interface AutoCorrection {
  lineNumber: number;
  field: string;
  originalValue: string;
  correctedValue: string;
  rule: string;
  confidence: "high" | "medium" | "low";
  reason: string;
  applied: boolean;
}

/**
 * Analyze validation issues and generate auto-corrections for deterministic fixes.
 * High-confidence = the fix is unambiguous (e.g., E11 → E11.9, missing ECC → add X59)
 * Medium-confidence = likely correct but should be reviewed (e.g., symptom code suggestions)
 */
export function generateAutoCorrections(
  lines: ClaimLineItem[],
  issues: ValidationIssue[],
): AutoCorrection[] {
  const corrections: AutoCorrection[] = [];

  for (const issue of issues) {
    const line = lines.find(l => l.lineNumber === issue.lineNumber);
    if (!line) continue;

    switch (issue.code) {
      // ── Non-specific codes: append .9 (unspecified) ──
      case "NON_SPECIFIC": {
        const code = line.primaryICD10;
        const withNine = `${code}.9`;
        const entry = lookupICD10(withNine);
        if (entry?.isValid) {
          corrections.push({
            lineNumber: issue.lineNumber,
            field: "primaryICD10",
            originalValue: code,
            correctedValue: withNine,
            rule: "Insufficient Specificity",
            confidence: "high",
            reason: `"${code}" requires greater specificity. "${withNine}" (${entry.description}) is the standard unspecified subcategory.`,
            applied: false,
          });
        }
        break;
      }

      // ── Missing External Cause Code: add X59 (unspecified) ──
      case "MISSING_ECC": {
        corrections.push({
          lineNumber: issue.lineNumber,
          field: "secondaryICD10",
          originalValue: line.secondaryICD10?.join(", ") || "",
          correctedValue: "X59",
          rule: "Missing External Cause Code",
          confidence: "medium",
          reason: `Injury code "${line.primaryICD10}" requires an ECC. X59 (exposure to unspecified factor) is the generic fallback. A more specific ECC (W19 for fall, V89.2 for MVA) is preferred.`,
          applied: false,
        });
        break;
      }

      // ── External cause as primary: swap primary ↔ secondary ──
      case "ECC_AS_PRIMARY": {
        if (line.secondaryICD10?.length) {
          // If there are secondary codes, the first non-ECC one should be primary
          const nonECC = line.secondaryICD10.find(c => !/^[VWXYvwxy]/.test(c));
          if (nonECC) {
            corrections.push({
              lineNumber: issue.lineNumber,
              field: "primaryICD10",
              originalValue: line.primaryICD10,
              correctedValue: nonECC,
              rule: "External Cause Code as Primary",
              confidence: "high",
              reason: `Swapped ECC "${line.primaryICD10}" with "${nonECC}" — external cause codes must be secondary.`,
              applied: false,
            });
          }
        }
        break;
      }

      // ── Duplicate code: flag for removal ──
      case "DUPLICATE_CODE": {
        corrections.push({
          lineNumber: issue.lineNumber,
          field: "secondaryICD10",
          originalValue: line.primaryICD10,
          correctedValue: "(remove duplicate)",
          rule: "Duplicate ICD-10 Code",
          confidence: "high",
          reason: `Primary code "${line.primaryICD10}" duplicated in secondary codes — remove the duplicate.`,
          applied: false,
        });
        break;
      }

      // ── Invalid format: try common typo fixes ──
      case "INVALID_FORMAT": {
        const code = line.primaryICD10;
        // Remove spaces: "J 06.9" → "J06.9"
        const noSpaces = code.replace(/\s+/g, "");
        if (noSpaces !== code) {
          const entry = lookupICD10(noSpaces);
          if (entry) {
            corrections.push({
              lineNumber: issue.lineNumber, field: "primaryICD10",
              originalValue: code, correctedValue: noSpaces,
              rule: "Invalid Code Format", confidence: "high",
              reason: `Removed space — "${code}" corrected to "${noSpaces}" (${entry.description}).`,
              applied: false,
            });
            break;
          }
        }
        // Missing dot: J069 → J06.9
        if (/^[A-Z]\d{3,}$/i.test(code) && code.length >= 4) {
          const fixed = code.substring(0, 3) + "." + code.substring(3);
          const entry = lookupICD10(fixed);
          if (entry) {
            corrections.push({
              lineNumber: issue.lineNumber, field: "primaryICD10",
              originalValue: code, correctedValue: fixed,
              rule: "Invalid Code Format", confidence: "high",
              reason: `Missing decimal point — "${code}" corrected to "${fixed}" (${entry.description}).`,
              applied: false,
            });
            break;
          }
        }
        // Uppercase fix: "j06.9" → "J06.9"
        const upper = code.toUpperCase();
        if (upper !== code) {
          const entry = lookupICD10(upper);
          if (entry) {
            corrections.push({
              lineNumber: issue.lineNumber, field: "primaryICD10",
              originalValue: code, correctedValue: upper,
              rule: "Invalid Code Format", confidence: "high",
              reason: `Uppercase fix — "${code}" corrected to "${upper}".`,
              applied: false,
            });
            break;
          }
        }
        // Letter O vs digit 0 confusion: "O19O" → "O190" or "019O" → "O19.0"
        const fixedO = code.replace(/O/g, "0").replace(/^0/, code[0]);
        if (fixedO !== code) {
          const entry = lookupICD10(fixedO);
          if (entry) {
            corrections.push({
              lineNumber: issue.lineNumber, field: "primaryICD10",
              originalValue: code, correctedValue: fixedO,
              rule: "Invalid Code Format", confidence: "medium",
              reason: `Letter O/digit 0 confusion — "${code}" may be "${fixedO}" (${entry.description}).`,
              applied: false,
            });
          }
        }
        break;
      }

      // ── Duplicate claim: mark for removal ──
      case "DUPLICATE_CLAIM": {
        corrections.push({
          lineNumber: issue.lineNumber, field: "removeLine",
          originalValue: `Row ${issue.lineNumber}: ${line.primaryICD10} — ${line.patientName}`,
          correctedValue: "(remove duplicate row)",
          rule: "Duplicate Claim", confidence: "medium",
          reason: `${issue.message}`,
          applied: false,
        });
        break;
      }

      // ── Missing dependent code: default to 00 (main member) ──
      case "MISSING_DEPENDENT_CODE": {
        corrections.push({
          lineNumber: issue.lineNumber, field: "dependentCode",
          originalValue: line.dependentCode || "(empty)",
          correctedValue: "00",
          rule: "Missing Dependent Code", confidence: "medium",
          reason: `No dependent code provided. Defaulting to "00" (main member). Change to "01" for spouse or "02"+ for children.`,
          applied: false,
        });
        break;
      }

      // ── Missing practice number: flag but can't auto-fix with real number ──
      case "MISSING_PRACTICE_NUMBER": {
        corrections.push({
          lineNumber: issue.lineNumber, field: "practiceNumber",
          originalValue: line.practiceNumber || "(empty)",
          correctedValue: "(needs real BHF number)",
          rule: "Missing Practice Number", confidence: "low",
          reason: `BHF practice number is required. This must be the provider's actual 7-digit BHF/PCNS number — cannot be auto-generated.`,
          applied: false,
        });
        break;
      }
    }
  }

  return corrections;
}

/**
 * Apply high-confidence auto-corrections to claim lines.
 * Returns the corrected lines + list of applied corrections.
 */
export function applyAutoCorrections(
  lines: ClaimLineItem[],
  corrections: AutoCorrection[],
  applyMediumConfidence = false,
): { correctedLines: ClaimLineItem[]; applied: AutoCorrection[] } {
  const correctedLines = lines.map(l => ({ ...l })); // shallow clone
  const applied: AutoCorrection[] = [];

  const linesToRemove = new Set<number>();

  for (const c of corrections) {
    if (c.confidence === "medium" && !applyMediumConfidence) continue;
    if (c.confidence === "low") continue; // Never auto-apply low confidence

    const line = correctedLines.find(l => l.lineNumber === c.lineNumber);
    if (!line) continue;

    if (c.field === "removeLine") {
      linesToRemove.add(c.lineNumber);
      c.applied = true;
      applied.push(c);
    } else if (c.field === "primaryICD10" && c.correctedValue !== "(remove duplicate)") {
      line.primaryICD10 = c.correctedValue;
      c.applied = true;
      applied.push(c);
    } else if (c.field === "secondaryICD10" && c.correctedValue !== "(remove duplicate)") {
      if (!line.secondaryICD10) line.secondaryICD10 = [];
      line.secondaryICD10.push(c.correctedValue);
      c.applied = true;
      applied.push(c);
    } else if (c.field === "dependentCode") {
      line.dependentCode = c.correctedValue;
      c.applied = true;
      applied.push(c);
    }
  }

  // Remove duplicate lines
  const filteredLines = linesToRemove.size > 0
    ? correctedLines.filter(l => !linesToRemove.has(l.lineNumber))
    : correctedLines;

  return { correctedLines: filteredLines, applied };
}
