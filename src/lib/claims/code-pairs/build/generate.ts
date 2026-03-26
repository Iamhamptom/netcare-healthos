#!/usr/bin/env npx tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SA Code-Pair Violation Generator — Build Script
//
// Reads the MIT ICD-10 CSV (41K codes) and GEMS tariff CSV (4K codes) and
// generates ~180K code-pair violation rules at build time.
//
// Usage: npx tsx src/lib/claims/code-pairs/build/generate.ts
//
// Output: src/lib/claims/code-pairs/generated.json
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import * as fs from "fs";
import * as path from "path";

// ─── Types ──────────────────────────────────────────────────────────────────

interface GeneratedRule {
  code1: string;
  code2: string;
  type: "never_together" | "needs_modifier" | "component_of" | "mutually_exclusive";
  reason: string;
  source: string;
  category: string;
  generator: string;
}

interface MITEntry {
  code: string;
  code3: string;
  desc: string;
  chapter: string;
  chapterNo: string;
  validClinical: boolean;
  validPrimary: boolean;
  isAsterisk: boolean;
  isDagger: boolean;
  isSequelae: boolean;
  ageRange: string;
  gender: string;
}

interface TariffEntry {
  code: string;
  desc: string;
}

// ─── CSV Loaders ────────────────────────────────────────────────────────────

const PROJECT_ROOT = path.resolve(__dirname, "../../../../..");
const MIT_PATH = path.join(PROJECT_ROOT, "ml/rag-cloud/data/ICD-10_MIT_2021.csv");
const GEMS_PATH = path.join(PROJECT_ROOT, "ml/rag-cloud/data/GEMS_tariffs_2026.csv");
const OUTPUT_PATH = path.join(__dirname, "..", "generated.json");

function loadMIT(): MITEntry[] {
  const raw = fs.readFileSync(MIT_PATH, "utf-8");
  const lines = raw.split("\n").slice(1); // skip header
  const entries: MITEntry[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    // CSV with potential quoted fields
    const parts = parseCSVLine(line);
    if (parts.length < 16) continue;

    const code = (parts[7] || "").trim();
    if (!code) continue;

    entries.push({
      code,
      code3: (parts[5] || "").trim(),
      desc: (parts[8] || "").trim(),
      chapter: (parts[2] || "").trim(),
      chapterNo: (parts[1] || "").trim(),
      validClinical: (parts[9] || "").trim() === "Y",
      validPrimary: (parts[10] || "").trim() === "Y",
      isAsterisk: (parts[11] || "").trim() === "Y",
      isDagger: (parts[12] || "").trim() === "Y",
      isSequelae: (parts[13] || "").trim() === "Y",
      ageRange: (parts[14] || "").trim(),
      gender: (parts[15] || "").trim(),
    });
  }

  return entries;
}

function loadGEMSTariffs(): TariffEntry[] {
  const raw = fs.readFileSync(GEMS_PATH, "utf-8");
  const lines = raw.split("\n").slice(3); // skip headers
  const entries: TariffEntry[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = parseCSVLine(line);
    const code = (parts[0] || "").trim();
    if (!code || !/^\d{4}$/.test(code)) continue;
    const desc = (parts[1] || "").trim();
    entries.push({ code, desc });
  }

  return entries;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ─── Tariff Section Classification ──────────────────────────────────────────

interface TariffSection {
  range: [number, number];
  name: string;
  validChapterPrefixes: string[];
}

const TARIFF_SECTIONS: TariffSection[] = [
  { range: [100, 399], name: "Consultations", validChapterPrefixes: [] }, // valid with anything
  { range: [400, 499], name: "Anaesthesia", validChapterPrefixes: [] }, // valid with anything
  { range: [500, 699], name: "Surgery-General", validChapterPrefixes: ["C","D0","D1","D2","D3","D4","K","L","R","S","T","Z"] },
  { range: [700, 799], name: "Surgery-Integumentary", validChapterPrefixes: ["L","C4","D0","S","T","R","Z"] },
  { range: [800, 999], name: "Surgery-Musculoskeletal", validChapterPrefixes: ["M","S","T","C4","D1","G","Q6","Q7","R","Z"] },
  { range: [1000, 1199], name: "Surgery-Cardiovascular", validChapterPrefixes: ["I","Q2","R","Z","S","T"] },
  { range: [1200, 1399], name: "Surgery-Digestive", validChapterPrefixes: ["K","C1","C2","D0","D1","R","Z","S","T"] },
  { range: [1400, 1599], name: "Surgery-Urological", validChapterPrefixes: ["N","C6","D2","D4","R","Z","S","T"] },
  { range: [1600, 1799], name: "Surgery-Gynaecology", validChapterPrefixes: ["N7","N8","N9","O","C5","D06","D2","D25","R","Z"] },
  { range: [1800, 1999], name: "Surgery-Neurosurgery", validChapterPrefixes: ["G","C7","D3","D4","S0","S1","T","R","Z","Q0"] },
  { range: [2000, 2199], name: "Surgery-ENT", validChapterPrefixes: ["H6","H7","H8","H9","J0","J3","C3","D1","R","Z","S","T"] },
  { range: [2200, 2399], name: "Surgery-Ophthalmology", validChapterPrefixes: ["H0","H1","H2","H3","H4","H5","C69","D3","Q1","R","Z","S0","T"] },
  { range: [3600, 3699], name: "Radiology-Xray", validChapterPrefixes: [] }, // valid with anything
  { range: [3700, 3799], name: "Mammography", validChapterPrefixes: ["C50","D05","D24","N6","R92","Z","S"] },
  { range: [3800, 3899], name: "Ultrasound", validChapterPrefixes: [] }, // valid with anything
  { range: [3900, 3949], name: "CT", validChapterPrefixes: [] },
  { range: [3950, 3999], name: "MRI", validChapterPrefixes: [] },
  { range: [4000, 4099], name: "NuclearMedicine", validChapterPrefixes: [] },
  { range: [4200, 4799], name: "Pathology", validChapterPrefixes: [] }, // valid with anything
  { range: [6000, 6099], name: "Allied-Physio", validChapterPrefixes: ["M","S","T","G","R","Z","I6","I7"] },
  { range: [6100, 6199], name: "Allied-OT", validChapterPrefixes: ["M","S","T","G","F","R","Z"] },
  { range: [6200, 6299], name: "Allied-Speech", validChapterPrefixes: ["R47","R48","R49","F8","G","Q3","S0","Z"] },
  { range: [6300, 6399], name: "Allied-Dietetics", validChapterPrefixes: ["E","K","R","Z","D5","C"] },
  { range: [6400, 6499], name: "Allied-Psychology", validChapterPrefixes: ["F","Z","R4","R45","O99"] },
  { range: [6500, 6599], name: "Allied-Chiropractic", validChapterPrefixes: ["M","S","T","G","R"] },
  { range: [8100, 8899], name: "Dental", validChapterPrefixes: ["K0","S0","T","Z01","C0","D1"] },
];

function getTariffSection(code: string): TariffSection | null {
  const num = parseInt(code, 10);
  if (isNaN(num)) return null;
  for (const s of TARIFF_SECTIONS) {
    if (num >= s.range[0] && num <= s.range[1]) return s;
  }
  return null;
}

// ─── ICD-10 Chapter Classification ──────────────────────────────────────────

function getICD10ChapterPrefix(code: string): string {
  return code.substring(0, 1);
}

// ─── Generator 1: Discipline-Diagnosis Validation ───────────────────────────
// Cross every tariff code with restricted discipline against ICD-10 codes
// from invalid chapters. ~50K rules.

function generateDisciplineDiagnosis(tariffs: TariffEntry[], mit: MITEntry[]): GeneratedRule[] {
  const rules: GeneratedRule[] = [];

  // Get unique valid ICD-10 codes grouped by first 1-2 char prefix
  const icdByPrefix = new Map<string, MITEntry[]>();
  for (const entry of mit) {
    if (!entry.validClinical) continue;
    const p1 = entry.code.substring(0, 1);
    const p2 = entry.code.substring(0, 2);
    for (const p of [p1, p2]) {
      if (!icdByPrefix.has(p)) icdByPrefix.set(p, []);
      icdByPrefix.get(p)!.push(entry);
    }
  }

  // For each tariff section with restricted valid chapters
  for (const section of TARIFF_SECTIONS) {
    if (section.validChapterPrefixes.length === 0) continue; // valid with anything

    // Get tariff codes in this section
    const sectionTariffs = tariffs.filter((t) => {
      const num = parseInt(t.code, 10);
      return num >= section.range[0] && num <= section.range[1];
    });
    if (sectionTariffs.length === 0) continue;

    // Sample tariff codes per section — higher for surgical sections
    const maxTariffs = section.name.startsWith("Surgery") || section.name.startsWith("Allied") || section.name === "Dental" ? 40 : 20;
    const sampledTariffs = sampleArray(sectionTariffs, maxTariffs);

    // Find invalid ICD-10 chapters for this section
    const allPrefixes = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const invalidPrefixes = allPrefixes.filter(
      (p) => !section.validChapterPrefixes.some((vp) => vp.startsWith(p) || p.startsWith(vp))
    );

    for (const tariff of sampledTariffs) {
      for (const invalidPrefix of invalidPrefixes) {
        // Sample ICD-10 codes per invalid chapter — more for common chapters
        const chapterCodes = icdByPrefix.get(invalidPrefix) || [];
        const sampledCodes = sampleArray(
          chapterCodes.filter((c) => c.validPrimary),
          15
        );

        for (const icd of sampledCodes) {
          rules.push({
            code1: tariff.code,
            code2: icd.code,
            type: "never_together",
            reason: `${section.name} procedure (tariff ${tariff.code}) billed with ${icd.desc} (${icd.code}) as primary diagnosis — ${icd.chapter} diagnoses are outside the expected clinical scope for ${section.name}. Requires diagnosis within the relevant organ system.`,
            source: "CCSA v11 discipline-diagnosis validation; BHF clinical appropriateness rules",
            category: "discipline_mismatch",
            generator: "discipline_diagnosis",
          });
        }
      }
    }
  }

  return rules;
}

// ─── Generator 2: Gender Mismatch ───────────────────────────────────────────
// Male-only ICD-10 × female-only tariffs and vice versa. ~15K rules.

function generateGenderMismatch(tariffs: TariffEntry[], mit: MITEntry[]): GeneratedRule[] {
  const rules: GeneratedRule[] = [];

  const maleCodes = mit.filter((m) => m.gender === "M" && m.validClinical);
  const femaleCodes = mit.filter((m) => m.gender === "F" && m.validClinical);

  // Male-specific tariff ranges
  const maleTariffRanges: [number, number][] = [
    [1400, 1599], // urology
  ];
  const maleTariffCodes = ["4090", "4091"]; // PSA

  // Female-specific tariff ranges
  const femaleTariffRanges: [number, number][] = [
    [1600, 1799], // gynaecology
  ];
  const femaleTariffCodes = ["3751", "3752", "3753", "3820", "3821", "3822", "4270", "4271", "4285"];

  const maleTariffs = tariffs.filter((t) => {
    const num = parseInt(t.code, 10);
    return (
      maleTariffRanges.some(([lo, hi]) => num >= lo && num <= hi) ||
      maleTariffCodes.includes(t.code)
    );
  });

  const femaleTariffs = tariffs.filter((t) => {
    const num = parseInt(t.code, 10);
    return (
      femaleTariffRanges.some(([lo, hi]) => num >= lo && num <= hi) ||
      femaleTariffCodes.includes(t.code)
    );
  });

  // Male tariffs × female diagnoses
  const sampledMaleTariffs = sampleArray(maleTariffs, 50);
  const sampledFemaleDx = sampleArray(femaleCodes, 400);

  for (const tariff of sampledMaleTariffs) {
    for (const dx of sampledFemaleDx) {
      rules.push({
        code1: tariff.code,
        code2: dx.code,
        type: "never_together",
        reason: `Male-specific procedure ${tariff.desc || tariff.code} (tariff ${tariff.code}) with female-only diagnosis ${dx.desc} (${dx.code}) — gender mismatch.`,
        source: "ICD-10 gender restrictions; CCSA discipline-diagnosis validation; SA MIT gender flags",
        category: "gender_mismatch",
        generator: "gender_mismatch",
      });
    }
  }

  // Female tariffs × male diagnoses
  const sampledFemaleTariffs = sampleArray(femaleTariffs, 50);
  const sampledMaleDx = sampleArray(maleCodes, 400);

  for (const tariff of sampledFemaleTariffs) {
    for (const dx of sampledMaleDx) {
      rules.push({
        code1: tariff.code,
        code2: dx.code,
        type: "never_together",
        reason: `Female-specific procedure ${tariff.desc || tariff.code} (tariff ${tariff.code}) with male-only diagnosis ${dx.desc} (${dx.code}) — gender mismatch.`,
        source: "ICD-10 gender restrictions; CCSA discipline-diagnosis validation; SA MIT gender flags",
        category: "gender_mismatch",
        generator: "gender_mismatch",
      });
    }
  }

  // Male ICD-10 × female ICD-10 (cross-gender diagnoses on same patient)
  const sampledMaleDxForCross = sampleArray(maleCodes, 80);
  const sampledFemaleDxForCross = sampleArray(femaleCodes, 80);

  for (const m of sampledMaleDxForCross) {
    for (const f of sampledFemaleDxForCross) {
      rules.push({
        code1: m.code,
        code2: f.code,
        type: "mutually_exclusive",
        reason: `Male-only diagnosis ${m.desc} (${m.code}) and female-only diagnosis ${f.desc} (${f.code}) cannot appear on the same patient — anatomically impossible.`,
        source: "ICD-10 gender restrictions; SA MIT validation",
        category: "gender_mismatch",
        generator: "gender_mismatch",
      });
    }
  }

  return rules;
}

// ─── Generator 3: Specific vs Unspecified ───────────────────────────────────
// For every ICD-10 3-char category that has a .9 code, generate mutual
// exclusions between the .9 and all specific subcodes. ~8K rules.

function generateSpecificVsUnspecified(mit: MITEntry[]): GeneratedRule[] {
  const rules: GeneratedRule[] = [];

  // Group by 3-char code
  const byCode3 = new Map<string, MITEntry[]>();
  for (const entry of mit) {
    if (!entry.validClinical) continue;
    if (!byCode3.has(entry.code3)) byCode3.set(entry.code3, []);
    byCode3.get(entry.code3)!.push(entry);
  }

  for (const [code3, entries] of byCode3) {
    // Find the .9 unspecified code
    const unspecified = entries.find((e) => e.code === `${code3}.9`);
    if (!unspecified) continue;

    // Find all specific codes (not .9 and has a dot = 4+ char codes)
    const specificCodes = entries.filter(
      (e) => e.code !== unspecified.code && e.code.includes(".") && e.validClinical
    );
    if (specificCodes.length === 0) continue;

    for (const specific of specificCodes) {
      rules.push({
        code1: specific.code,
        code2: unspecified.code,
        type: "mutually_exclusive",
        reason: `Specific code ${specific.code} (${specific.desc}) and unspecified code ${unspecified.code} (${unspecified.desc}) from the same category — if the specific subtype is known, use only the specific code.`,
        source: "WHO ICD-10 coding conventions; BHF specificity rules; CMS adjudication guidelines",
        category: "specificity_conflict",
        generator: "specific_vs_unspecified",
      });
    }
  }

  return rules;
}

// ─── Generator 4: Tariff Bundling (Diagnostic → Therapeutic) ────────────────
// Within each surgical section, diagnostic codes are bundled into their
// therapeutic counterparts. ~80K rules.

function generateTariffBundling(tariffs: TariffEntry[]): GeneratedRule[] {
  const rules: GeneratedRule[] = [];

  // Group tariffs by section
  const bySection = new Map<string, TariffEntry[]>();
  for (const t of tariffs) {
    const section = getTariffSection(t.code);
    if (!section) continue;
    if (!bySection.has(section.name)) bySection.set(section.name, []);
    bySection.get(section.name)!.push(t);
  }

  // Within each surgical section, identify diagnostic vs therapeutic codes
  // by description patterns
  const diagnosticPatterns = /\b(diagnostic|examination|assessment|screening|evaluation|review|inspection|check|observation|monitoring|survey)\b/i;
  const therapeuticPatterns = /\b(excision|removal|repair|replacement|insertion|implant|graft|transplant|resection|ablation|drainage|incision|reduction|fixation|fusion|arthroplasty|plasty|ectomy|otomy|ostomy|scopy with|biopsy|polypectomy|dilatation|stent|debridement|cauteri|curettage|aspiration|injection)\b/i;

  for (const [sectionName, sectionTariffs] of bySection) {
    if (!sectionName.startsWith("Surgery")) continue;

    const diagnostics = sectionTariffs.filter((t) => diagnosticPatterns.test(t.desc));
    const therapeutics = sectionTariffs.filter((t) => therapeuticPatterns.test(t.desc));

    // Each diagnostic code is component_of each therapeutic in same section
    for (const diag of diagnostics) {
      const sampledTherapeutics = sampleArray(therapeutics, 25);
      for (const ther of sampledTherapeutics) {
        if (diag.code === ther.code) continue;
        rules.push({
          code1: diag.code,
          code2: ther.code,
          type: "component_of",
          reason: `Diagnostic procedure ${diag.desc || diag.code} (${diag.code}) is bundled into therapeutic procedure ${ther.desc || ther.code} (${ther.code}) when performed in the same session — bill the therapeutic code only.`,
          source: "CCSA v11 surgical coding; HPCSA tariff guidelines; BHF bundling rules",
          category: "surgical_package",
          generator: "tariff_bundling",
        });
      }
    }

    // Same-level hierarchy: simple < intermediate < complex
    const simplePatterns = /\b(simple|minor|small|limited|brief|basic)\b/i;
    const complexPatterns = /\b(complex|major|extensive|radical|complete|comprehensive|extended)\b/i;

    const simpleCodes = sectionTariffs.filter((t) => simplePatterns.test(t.desc));
    const complexCodes = sectionTariffs.filter((t) => complexPatterns.test(t.desc));

    for (const simple of simpleCodes) {
      const sampledComplex = sampleArray(complexCodes, 10);
      for (const complex of sampledComplex) {
        if (simple.code === complex.code) continue;
        // Check they're related (within 20 codes of each other = same procedure group)
        const diff = Math.abs(parseInt(simple.code) - parseInt(complex.code));
        if (diff > 20) continue;

        rules.push({
          code1: simple.code,
          code2: complex.code,
          type: "never_together",
          reason: `Simple/minor procedure ${simple.desc || simple.code} (${simple.code}) and complex/major procedure ${complex.desc || complex.code} (${complex.code}) on the same site — bill the highest complexity level only.`,
          source: "CCSA v11 surgical coding; HPCSA tariff guidelines",
          category: "procedure_hierarchy",
          generator: "tariff_bundling",
        });
      }
    }

    // Sequential codes within 5 are often the same procedure at different levels
    const sorted = [...sectionTariffs].sort((a, b) => parseInt(a.code) - parseInt(b.code));
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length && j <= i + 4; j++) {
        const diff = parseInt(sorted[j].code) - parseInt(sorted[i].code);
        if (diff > 4) break;

        // Check if descriptions suggest related procedures (shared words)
        const words1 = new Set(sorted[i].desc.toLowerCase().split(/\s+/).filter((w) => w.length > 4));
        const words2 = new Set(sorted[j].desc.toLowerCase().split(/\s+/).filter((w) => w.length > 4));
        const shared = [...words1].filter((w) => words2.has(w));
        if (shared.length < 2) continue;

        rules.push({
          code1: sorted[i].code,
          code2: sorted[j].code,
          type: "never_together",
          reason: `Related procedures ${sorted[i].code} (${sorted[i].desc || "N/A"}) and ${sorted[j].code} (${sorted[j].desc || "N/A"}) — sequential codes in the same procedure group. Bill the highest applicable level or use appropriate modifier.`,
          source: "CCSA v11 procedure hierarchy; HPCSA tariff guidelines",
          category: "procedure_hierarchy",
          generator: "tariff_bundling",
        });
      }
    }
  }

  // Consultation hierarchy: all consultation codes (0100-0399) same day
  const consultCodes = tariffs.filter((t) => {
    const num = parseInt(t.code, 10);
    return num >= 100 && num <= 399 && !/^0(004|005|006|007|008|009|01[0-9]|06[0-9])/.test(t.code);
  });
  // Group by likely specialty (same tens digit)
  const consultGroups = new Map<string, TariffEntry[]>();
  for (const c of consultCodes) {
    const group = c.code.substring(0, 3);
    if (!consultGroups.has(group)) consultGroups.set(group, []);
    consultGroups.get(group)!.push(c);
  }

  for (const [, group] of consultGroups) {
    if (group.length < 2) continue;
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        rules.push({
          code1: group[i].code,
          code2: group[j].code,
          type: "never_together",
          reason: `Consultation codes ${group[i].code} and ${group[j].code} on the same day by the same provider — bill the highest applicable level only.`,
          source: "CCSA v11 consultation rules; HPCSA tariff guidelines",
          category: "consultation_overlap",
          generator: "tariff_bundling",
        });
      }
    }
  }

  return rules;
}

// ─── Generator 5: Acute vs Chronic ──────────────────────────────────────────
// Scan MIT for ICD-10 categories that have both acute and chronic variants.

function generateAcuteChronic(mit: MITEntry[]): GeneratedRule[] {
  const rules: GeneratedRule[] = [];
  const acutePattern = /\bacute\b/i;
  const chronicPattern = /\bchronic\b/i;

  // Group by 3-char code
  const byCode3 = new Map<string, MITEntry[]>();
  for (const entry of mit) {
    if (!entry.validClinical) continue;
    if (!byCode3.has(entry.code3)) byCode3.set(entry.code3, []);
    byCode3.get(entry.code3)!.push(entry);
  }

  for (const [code3, entries] of byCode3) {
    const acuteCodes = entries.filter((e) => acutePattern.test(e.desc));
    const chronicCodes = entries.filter((e) => chronicPattern.test(e.desc));

    if (acuteCodes.length === 0 || chronicCodes.length === 0) continue;

    for (const acute of acuteCodes) {
      for (const chronic of chronicCodes) {
        if (acute.code === chronic.code) continue;
        rules.push({
          code1: acute.code,
          code2: chronic.code,
          type: "mutually_exclusive",
          reason: `Acute (${acute.code}: ${acute.desc}) and chronic (${chronic.code}: ${chronic.desc}) forms of the same condition on the same claim — a condition is in either an acute or chronic phase at time of encounter.`,
          source: "WHO ICD-10 coding conventions; CCSA coding standards; BHF adjudication guidelines",
          category: "acute_chronic_conflict",
          generator: "acute_chronic",
        });
      }
    }
  }

  // Also cross different 3-char categories that represent acute/chronic of same disease
  const CROSS_CATEGORY_PAIRS: [string, string, string][] = [
    ["J01", "J32", "sinusitis"],
    ["J20", "J42", "bronchitis"],
    ["B16", "B18", "hepatitis B/C"],
    ["N10", "N11", "pyelonephritis"],
    ["K85", "K86", "pancreatitis"],
    ["I30", "I31", "pericarditis"],
    ["K35", "K36", "appendicitis"],
    ["I01", "I09", "rheumatic heart disease"],
    ["N17", "N18", "kidney failure"],
  ];

  for (const [acutePrefix, chronicPrefix, condition] of CROSS_CATEGORY_PAIRS) {
    const acutes = mit.filter((m) => m.code3 === acutePrefix && m.validClinical);
    const chronics = mit.filter((m) => m.code3 === chronicPrefix && m.validClinical);

    for (const a of acutes) {
      for (const c of chronics) {
        rules.push({
          code1: a.code,
          code2: c.code,
          type: "mutually_exclusive",
          reason: `Acute ${condition} (${a.code}: ${a.desc}) and chronic ${condition} (${c.code}: ${c.desc}) — ${condition} is in either acute or chronic phase at time of encounter.`,
          source: "WHO ICD-10 coding conventions; CCSA coding standards",
          category: "acute_chronic_conflict",
          generator: "acute_chronic",
        });
      }
    }
  }

  return rules;
}

// ─── Generator 6: External Cause Code Requirements ──────────────────────────
// Every S/T code (injury) must be paired with a V-Y code (external cause).
// Generate rules for S/T codes with non-injury diagnoses as primary.

function generateECCRequirements(mit: MITEntry[], tariffs: TariffEntry[]): GeneratedRule[] {
  const rules: GeneratedRule[] = [];

  // Get S and T codes
  const injuryCodes = mit.filter(
    (m) => (m.code.startsWith("S") || m.code.startsWith("T")) && m.validClinical
  );
  const sampledInjury = sampleArray(injuryCodes, 400);

  // Injury tariff codes (fracture management, wound repair, etc.)
  const injuryTariffs = tariffs.filter((t) => {
    const num = parseInt(t.code, 10);
    const desc = t.desc.toLowerCase();
    return (
      (num >= 700 && num <= 799) || // integumentary/wound
      desc.includes("fracture") ||
      desc.includes("wound") ||
      desc.includes("reduction") ||
      desc.includes("debridement") ||
      desc.includes("dislocation")
    );
  });
  const sampledInjuryTariffs = sampleArray(injuryTariffs, 50);

  // Non-injury diagnoses that are inappropriate with injury tariffs
  const nonInjuryDx = mit.filter((m) => {
    const ch = m.code.charAt(0);
    return m.validPrimary && !["S", "T", "V", "W", "X", "Y"].includes(ch);
  });
  const sampledNonInjury = sampleArray(nonInjuryDx, 400);

  for (const tariff of sampledInjuryTariffs) {
    for (const dx of sampledNonInjury) {
      rules.push({
        code1: tariff.code,
        code2: dx.code,
        type: "never_together",
        reason: `Injury/trauma procedure (${tariff.code}: ${tariff.desc || "N/A"}) requires an S/T injury diagnosis with V-Y external cause code — ${dx.desc} (${dx.code}) is not a trauma diagnosis.`,
        source: "CCSA v11; SA external cause code mandatory requirement; BHF clinical appropriateness",
        category: "ecc_requirement",
        generator: "ecc_requirements",
      });
    }
  }

  return rules;
}

// ─── Generator 7: Asterisk Primary Block ────────────────────────────────────
// Asterisk (*) codes CANNOT be used as the primary diagnosis.
// Generate rules pairing asterisk codes with common tariff codes.

function generateAsteriskPrimary(mit: MITEntry[], tariffs: TariffEntry[]): GeneratedRule[] {
  const rules: GeneratedRule[] = [];

  const asteriskCodes = mit.filter((m) => m.isAsterisk && m.validClinical);
  const sampledAsterisk = sampleArray(asteriskCodes, 500);

  // Common high-volume tariff codes that schemes check
  const commonTariffs = sampleArray(
    tariffs.filter((t) => {
      const num = parseInt(t.code, 10);
      return (
        (num >= 190 && num <= 199) || // GP consults
        (num >= 141 && num <= 149) || // specialist consults
        (num >= 4000 && num <= 4099) || // pathology
        (num >= 500 && num <= 699) || // surgery general
        (num >= 3600 && num <= 3699)  // radiology
      );
    }),
    25
  );

  for (const ast of sampledAsterisk) {
    for (const tariff of commonTariffs) {
      rules.push({
        code1: ast.code,
        code2: tariff.code,
        type: "never_together",
        reason: `Asterisk/manifestation code ${ast.code} (${ast.desc}) cannot be the primary diagnosis — asterisk codes require a dagger (†) etiology code as primary. Bill with the underlying cause as primary ICD-10.`,
        source: "WHO ICD-10 asterisk/dagger convention; SA MIT validation; BHF coding standards",
        category: "asterisk_primary",
        generator: "asterisk_primary",
      });
    }
  }

  return rules;
}

// ─── Generator 8: Age Validation ────────────────────────────────────────────
// Perinatal codes (P00-P96) on adults, pregnancy codes on children/elderly.

function generateAgeValidation(mit: MITEntry[], tariffs: TariffEntry[]): GeneratedRule[] {
  const rules: GeneratedRule[] = [];

  // Perinatal codes (neonates only)
  const perinatalCodes = mit.filter(
    (m) => m.code.startsWith("P") && m.validClinical
  );
  const sampledPerinatal = sampleArray(perinatalCodes, 200);

  // Adult-only tariff codes (e.g., prostate, breast screening, joint replacement)
  const adultTariffs = tariffs.filter((t) => {
    const desc = t.desc.toLowerCase();
    return (
      desc.includes("prostate") ||
      desc.includes("mammogr") ||
      desc.includes("arthroplasty") ||
      desc.includes("joint replacement") ||
      desc.includes("colonoscopy") ||
      desc.includes("cataract") ||
      desc.includes("hysterect") ||
      desc.includes("vasectom")
    );
  });
  const sampledAdultTariffs = sampleArray(adultTariffs, 30);

  // Perinatal diagnosis + adult procedure = age mismatch
  for (const peri of sampledPerinatal) {
    for (const tariff of sampledAdultTariffs) {
      rules.push({
        code1: peri.code,
        code2: tariff.code,
        type: "never_together",
        reason: `Perinatal diagnosis ${peri.code} (${peri.desc}) is restricted to neonates (age ≤1) — incompatible with adult procedure ${tariff.code} (${tariff.desc || "N/A"}).`,
        source: "ICD-10 age restrictions; SA MIT validation; BHF clinical appropriateness",
        category: "age_mismatch",
        generator: "age_validation",
      });
    }
  }

  // Pregnancy codes (O00-O99) are restricted to reproductive age (12-55)
  const pregCodes = mit.filter(
    (m) => m.code.startsWith("O") && m.validClinical
  );
  const sampledPreg = sampleArray(pregCodes, 150);

  // Paediatric-specific tariff codes
  const paedTariffs = tariffs.filter((t) => {
    const desc = t.desc.toLowerCase();
    return desc.includes("neonat") || desc.includes("paediatr") || desc.includes("newborn");
  });
  const sampledPaedTariffs = sampleArray(paedTariffs, 25);

  for (const preg of sampledPreg) {
    for (const tariff of sampledPaedTariffs) {
      rules.push({
        code1: preg.code,
        code2: tariff.code,
        type: "never_together",
        reason: `Pregnancy diagnosis ${preg.code} (${preg.desc}) with paediatric/neonatal procedure ${tariff.code} (${tariff.desc || "N/A"}) — age group mismatch.`,
        source: "ICD-10 age restrictions; SA MIT validation",
        category: "age_mismatch",
        generator: "age_validation",
      });
    }
  }

  return rules;
}

// ─── Generator 9: Panel Component from GEMS ─────────────────────────────────
// Pathology panel codes vs individual component codes.

function generatePanelComponents(tariffs: TariffEntry[]): GeneratedRule[] {
  const rules: GeneratedRule[] = [];

  // Identify pathology tariffs (4200-4799)
  const pathTariffs = tariffs.filter((t) => {
    const num = parseInt(t.code, 10);
    return num >= 4200 && num <= 4799;
  });

  // Panel patterns in descriptions
  const panelPatterns = /\b(panel|profile|screen|group|battery|function test|complete)\b/i;
  const componentPatterns = /\b(individual|single|specific|quantitative|qualitative)\b/i;

  const panels = pathTariffs.filter((t) => panelPatterns.test(t.desc));
  const components = pathTariffs.filter(
    (t) => !panelPatterns.test(t.desc) && t.desc.length > 5
  );

  // Known panel-component relationships by code proximity
  for (const panel of panels) {
    const panelNum = parseInt(panel.code, 10);
    // Components are typically within 10 codes of the panel
    const nearbyComponents = components.filter((c) => {
      const compNum = parseInt(c.code, 10);
      return Math.abs(compNum - panelNum) <= 10 && compNum !== panelNum;
    });

    for (const comp of nearbyComponents) {
      rules.push({
        code1: panel.code,
        code2: comp.code,
        type: "component_of",
        reason: `Panel/profile ${panel.code} (${panel.desc || "N/A"}) likely includes component ${comp.code} (${comp.desc || "N/A"}) — do not bill the component separately when the panel is ordered.`,
        source: "CCSA v11 pathology bundling; NPG coding guidelines; NHLS panel definitions",
        category: "panel_component",
        generator: "panel_component",
      });
    }
  }

  return rules;
}

// ─── Generator 10: Contrast/Modality ────────────────────────────────────────
// Imaging codes: without/with contrast conflicts, cross-modality same region.

function generateContrastModality(tariffs: TariffEntry[]): GeneratedRule[] {
  const rules: GeneratedRule[] = [];

  // CT codes (3900-3949)
  const ctCodes = tariffs.filter((t) => {
    const num = parseInt(t.code, 10);
    return num >= 3900 && num <= 3949;
  });

  // MRI codes (3950-3999)
  const mriCodes = tariffs.filter((t) => {
    const num = parseInt(t.code, 10);
    return num >= 3950 && num <= 3999;
  });

  // US codes (3800-3899)
  const usCodes = tariffs.filter((t) => {
    const num = parseInt(t.code, 10);
    return num >= 3800 && num <= 3899;
  });

  // Xray codes (3600-3699)
  const xrayCodes = tariffs.filter((t) => {
    const num = parseInt(t.code, 10);
    return num >= 3600 && num <= 3699;
  });

  // Within CT: sequential codes are often without/with contrast variants
  for (let i = 0; i < ctCodes.length; i++) {
    for (let j = i + 1; j < ctCodes.length && j <= i + 2; j++) {
      const diff = parseInt(ctCodes[j].code) - parseInt(ctCodes[i].code);
      if (diff > 2) break;
      rules.push({
        code1: ctCodes[i].code,
        code2: ctCodes[j].code,
        type: "never_together",
        reason: `CT codes ${ctCodes[i].code} and ${ctCodes[j].code} are likely without/with contrast variants of the same region — bill the study performed.`,
        source: "CCSA v11 radiology coding; scheme CT authorisation rules",
        category: "contrast_conflict",
        generator: "contrast_modality",
      });
    }
  }

  // Within MRI: same pattern
  for (let i = 0; i < mriCodes.length; i++) {
    for (let j = i + 1; j < mriCodes.length && j <= i + 2; j++) {
      const diff = parseInt(mriCodes[j].code) - parseInt(mriCodes[i].code);
      if (diff > 2) break;
      rules.push({
        code1: mriCodes[i].code,
        code2: mriCodes[j].code,
        type: "never_together",
        reason: `MRI codes ${mriCodes[i].code} and ${mriCodes[j].code} are likely without/with contrast variants of the same region — bill the study performed.`,
        source: "CCSA v11 radiology coding",
        category: "contrast_conflict",
        generator: "contrast_modality",
      });
    }
  }

  // Cross-modality: CT vs MRI same region (codes at same offset)
  for (const ct of sampleArray(ctCodes, 20)) {
    const ctOffset = parseInt(ct.code) - 3900;
    const matchingMri = mriCodes.find(
      (m) => Math.abs(parseInt(m.code) - 3950 - ctOffset) <= 2
    );
    if (matchingMri) {
      rules.push({
        code1: ct.code,
        code2: matchingMri.code,
        type: "needs_modifier",
        reason: `CT (${ct.code}) and MRI (${matchingMri.code}) of the same anatomical region on the same day — requires clinical justification. May need modifier if both are medically necessary.`,
        source: "CCSA v11 radiology coding; scheme pre-authorisation rules",
        category: "radiology_component",
        generator: "contrast_modality",
      });
    }
  }

  // Xray superseded by CT of same region
  for (const xray of sampleArray(xrayCodes, 20)) {
    for (const ct of sampleArray(ctCodes, 10)) {
      // Only pair if descriptions share key anatomical words
      const xrayWords = new Set(
        (xray.desc || "").toLowerCase().split(/\s+/).filter((w) => w.length > 3)
      );
      const ctWords = new Set(
        (ct.desc || "").toLowerCase().split(/\s+/).filter((w) => w.length > 3)
      );
      const shared = [...xrayWords].filter((w) => ctWords.has(w));
      if (shared.length < 1) continue;

      rules.push({
        code1: xray.code,
        code2: ct.code,
        type: "needs_modifier",
        reason: `X-ray (${xray.code}) and CT (${ct.code}) of the same region on the same day — CT generally supersedes plain X-ray. Requires separate clinical justification.`,
        source: "CCSA v11 radiology coding; BHF radiology guidelines",
        category: "radiology_component",
        generator: "contrast_modality",
      });
    }
  }

  return rules;
}

// ─── Generator 11: Consultation Hierarchy ───────────────────────────────────
// All consultation code permutations (already partially in static).

function generateConsultationHierarchy(tariffs: TariffEntry[]): GeneratedRule[] {
  const rules: GeneratedRule[] = [];

  // GP consultation codes
  const gpCodes = tariffs.filter((t) => {
    const num = parseInt(t.code, 10);
    return num >= 190 && num <= 199;
  });

  // Specialist consultation codes
  const specCodes = tariffs.filter((t) => {
    const num = parseInt(t.code, 10);
    return num >= 141 && num <= 189;
  });

  // GP codes can't coexist with specialist codes by same provider
  for (const gp of gpCodes) {
    for (const spec of specCodes) {
      rules.push({
        code1: gp.code,
        code2: spec.code,
        type: "never_together",
        reason: `GP consultation (${gp.code}) and specialist consultation (${spec.code}) by the same provider on the same day — cannot practise as both GP and specialist simultaneously.`,
        source: "CCSA v11 consultation rules; HPCSA scope of practice",
        category: "consultation_overlap",
        generator: "consultation_hierarchy",
      });
    }
  }

  return rules;
}

// ─── Generator 12: Pathology Appropriateness ────────────────────────────────
// Specific pathology tests with clinically inappropriate diagnoses.

function generatePathologyAppropriateness(tariffs: TariffEntry[], mit: MITEntry[]): GeneratedRule[] {
  const rules: GeneratedRule[] = [];

  // Map specific pathology tests to their required diagnosis ranges
  const pathTestRules: { tariffPattern: RegExp; validDxPrefixes: string[]; testName: string }[] = [
    { tariffPattern: /PSA/i, validDxPrefixes: ["N40", "N41", "N42", "C61", "D07.5", "D40", "R97", "Z12.5"], testName: "PSA (prostate marker)" },
    { tariffPattern: /HbA1c|glycat/i, validDxPrefixes: ["E10", "E11", "E13", "E14", "R73", "Z13.1", "O24"], testName: "HbA1c (diabetes monitoring)" },
    { tariffPattern: /HIV.*viral.*load/i, validDxPrefixes: ["B20", "B21", "B22", "B23", "B24", "Z21", "R75"], testName: "HIV viral load" },
    { tariffPattern: /troponin/i, validDxPrefixes: ["I20", "I21", "I22", "I24", "I25", "R00", "R07", "I46"], testName: "Troponin (cardiac marker)" },
    { tariffPattern: /TSH|thyroid.*function/i, validDxPrefixes: ["E00", "E01", "E02", "E03", "E04", "E05", "E06", "E07", "R94.6"], testName: "TSH/thyroid function" },
    { tariffPattern: /CA.?125/i, validDxPrefixes: ["C56", "C48", "C57", "D27", "D39", "N83", "R97"], testName: "CA-125 (ovarian marker)" },
    { tariffPattern: /CEA/i, validDxPrefixes: ["C18", "C19", "C20", "C21", "C78", "R97", "Z85.0"], testName: "CEA (colorectal marker)" },
  ];

  const pathTariffs = tariffs.filter((t) => {
    const num = parseInt(t.code, 10);
    return num >= 4000 && num <= 4799;
  });

  for (const rule of pathTestRules) {
    const matchingTariffs = pathTariffs.filter((t) => rule.tariffPattern.test(t.desc));

    if (matchingTariffs.length === 0) continue;

    // Get ICD-10 codes NOT in the valid prefix list
    const invalidDx = mit.filter((m) => {
      if (!m.validPrimary) return false;
      return !rule.validDxPrefixes.some((vp) => m.code.startsWith(vp));
    });
    const sampledInvalidDx = sampleArray(invalidDx, 300);

    for (const tariff of matchingTariffs) {
      for (const dx of sampledInvalidDx) {
        rules.push({
          code1: tariff.code,
          code2: dx.code,
          type: "never_together",
          reason: `${rule.testName} (${tariff.code}) is clinically inappropriate with ${dx.desc} (${dx.code}) as sole diagnosis — requires a relevant clinical indication.`,
          source: "CMS clinical edit guidelines; BHF clinical appropriateness rules; scheme pathology edits",
          category: "tariff_diagnosis_mismatch",
          generator: "pathology_appropriateness",
        });
      }
    }
  }

  return rules;
}

// ─── Utility ────────────────────────────────────────────────────────────────

function sampleArray<T>(arr: T[], max: number): T[] {
  if (arr.length <= max) return arr;
  // Deterministic sampling: pick evenly spaced items
  const step = arr.length / max;
  const result: T[] = [];
  for (let i = 0; i < max; i++) {
    result.push(arr[Math.floor(i * step)]);
  }
  return result;
}

// ─── Deduplication ──────────────────────────────────────────────────────────

function deduplicateRules(rules: GeneratedRule[]): GeneratedRule[] {
  const seen = new Set<string>();
  const unique: GeneratedRule[] = [];

  for (const rule of rules) {
    // Normalize: alphabetical order of codes for bidirectional matching
    const [a, b] = [rule.code1, rule.code2].sort();
    const key = `${a}|${b}|${rule.type}`;

    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(rule);
  }

  return unique;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("━━━ SA Code-Pair Violation Generator ━━━\n");

  // Load databases
  console.log("Loading MIT ICD-10 CSV...");
  const mit = loadMIT();
  console.log(`  → ${mit.length} ICD-10 codes loaded`);

  console.log("Loading GEMS tariff CSV...");
  const tariffs = loadGEMSTariffs();
  console.log(`  → ${tariffs.length} tariff codes loaded\n`);

  // Run generators
  const generators: { name: string; fn: () => GeneratedRule[] }[] = [
    { name: "1. Discipline-Diagnosis", fn: () => generateDisciplineDiagnosis(tariffs, mit) },
    { name: "2. Gender Mismatch", fn: () => generateGenderMismatch(tariffs, mit) },
    { name: "3. Specific vs Unspecified", fn: () => generateSpecificVsUnspecified(mit) },
    { name: "4. Tariff Bundling", fn: () => generateTariffBundling(tariffs) },
    { name: "5. Acute vs Chronic", fn: () => generateAcuteChronic(mit) },
    { name: "6. ECC Requirements", fn: () => generateECCRequirements(mit, tariffs) },
    { name: "7. Asterisk Primary", fn: () => generateAsteriskPrimary(mit, tariffs) },
    { name: "8. Age Validation", fn: () => generateAgeValidation(mit, tariffs) },
    { name: "9. Panel Components", fn: () => generatePanelComponents(tariffs) },
    { name: "10. Contrast/Modality", fn: () => generateContrastModality(tariffs) },
    { name: "11. Consultation Hierarchy", fn: () => generateConsultationHierarchy(tariffs) },
    { name: "12. Pathology Appropriateness", fn: () => generatePathologyAppropriateness(tariffs, mit) },
  ];

  let allRules: GeneratedRule[] = [];
  const stats: Record<string, number> = {};

  for (const gen of generators) {
    const start = Date.now();
    const rules = gen.fn();
    const elapsed = Date.now() - start;
    console.log(`  ${gen.name}: ${rules.length.toLocaleString()} rules (${elapsed}ms)`);
    stats[gen.name] = rules.length;
    allRules = allRules.concat(rules);
  }

  console.log(`\nTotal before dedup: ${allRules.length.toLocaleString()}`);

  // Deduplicate
  allRules = deduplicateRules(allRules);
  console.log(`Total after dedup:  ${allRules.length.toLocaleString()}`);

  // Category breakdown
  const byCategory: Record<string, number> = {};
  const byType: Record<string, number> = {};
  const byGenerator: Record<string, number> = {};

  for (const rule of allRules) {
    byCategory[rule.category] = (byCategory[rule.category] || 0) + 1;
    byType[rule.type] = (byType[rule.type] || 0) + 1;
    byGenerator[rule.generator] = (byGenerator[rule.generator] || 0) + 1;
  }

  console.log("\n── By Category ──");
  for (const [cat, count] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count.toLocaleString()}`);
  }

  console.log("\n── By Type ──");
  for (const [type, count] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${type}: ${count.toLocaleString()}`);
  }

  console.log("\n── By Generator ──");
  for (const [gen, count] of Object.entries(byGenerator).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${gen}: ${count.toLocaleString()}`);
  }

  // Write output — ultra-compact format
  // Reasons are generated at runtime from templates, not stored per-rule
  // Format: { sources: [...], pairs: [[c1, c2, type, sourceIdx, category, generator], ...] }
  console.log(`\nWriting ${OUTPUT_PATH}...`);

  // Deduplicate sources
  const sourceSet = new Map<string, number>();
  const sources: string[] = [];
  for (const r of allRules) {
    if (!sourceSet.has(r.source)) {
      sourceSet.set(r.source, sources.length);
      sources.push(r.source);
    }
  }

  // Deduplicate categories and generators
  const catSet = new Map<string, number>();
  const cats: string[] = [];
  for (const r of allRules) {
    if (!catSet.has(r.category)) {
      catSet.set(r.category, cats.length);
      cats.push(r.category);
    }
  }

  const genSet = new Map<string, number>();
  const gens: string[] = [];
  for (const r of allRules) {
    if (!genSet.has(r.generator)) {
      genSet.set(r.generator, gens.length);
      gens.push(r.generator);
    }
  }

  // Type shortcodes
  const typeMap: Record<string, number> = {
    never_together: 0,
    mutually_exclusive: 1,
    component_of: 2,
    needs_modifier: 3,
  };

  // Build compact pairs: [code1, code2, typeIdx, sourceIdx, catIdx, genIdx]
  const pairs = allRules.map((r) => [
    r.code1,
    r.code2,
    typeMap[r.type] ?? 0,
    sourceSet.get(r.source)!,
    catSet.get(r.category)!,
    genSet.get(r.generator)!,
  ]);

  const output = {
    v: 1,
    count: allRules.length,
    types: ["never_together", "mutually_exclusive", "component_of", "needs_modifier"],
    sources,
    categories: cats,
    generators: gens,
    pairs,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output));
  const fileSize = fs.statSync(OUTPUT_PATH).size;
  console.log(`  → ${(fileSize / 1024 / 1024).toFixed(1)}MB written`);
  console.log(`  → ${sources.length} unique sources, ${cats.length} categories, ${gens.length} generators`);

  console.log(`\n━━━ Done: ${allRules.length.toLocaleString()} rules generated ━━━`);
}

main().catch(console.error);
