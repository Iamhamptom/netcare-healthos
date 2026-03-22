// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Deep Parser — Extracts training data from EVERY row of EVERY document
//
// Handles:
// - Pipe-delimited table rows (GEMS DRP, GEMS Formulary, Discovery CDL)
// - Single # headings (legal texts)
// - Paragraph-level chunking (Section 59 investigation, Medical Schemes Act)
// - Raw text sections without markdown headings
//
// Target: Parse 30,000+ lines of extracted data into training examples
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { readFileSync } from "fs";
import { join } from "path";

interface TrainingExample {
  instruction: string;
  input: string;
  output: string;
  category: string;
}

const EXTRACTED = join(process.cwd(), "docs/knowledge/extracted");

// ═══════════════════════════════════════════════════════════════════════════════
// GEMS Drug Reference Prices — 10,343 lines → ~5,000+ drug entries
// ═══════════════════════════════════════════════════════════════════════════════

export function parseGEMSDRP(): TrainingExample[] {
  const examples: TrainingExample[] = [];
  try {
    const content = readFileSync(join(EXTRACTED, "gems-drp-feb2026-data.md"), "utf-8");
    const lines = content.split("\n");

    for (const line of lines) {
      // Match pipe-delimited rows: | CLASS | NAPPI | NAME | PACK | PRICE_EX | PRICE_INC | UNIT |
      // Handle rows starting with | or [x2] |
      const cleanLine = line.replace(/^\[x\d*\]\s*/, "");
      const match = cleanLine.match(/^\|\s*([A-Za-z][A-Za-z0-9_.,/\s()-]*[A-Za-z0-9)]+)\s*\|\s*(\d{5,})\s*\|\s*([^|]+)\|\s*([^|]*)\|\s*R?\s*([\d,.]+)\s*\|\s*R?\s*([\d,.]+)\s*\|\s*R?\s*([\d,.]+)\s*\|/);
      if (!match) continue;

      const [, drugClass, nappi, name, packSize, priceExVat, priceIncVat, unitPrice] = match;
      const cleanName = name.trim();
      if (!cleanName || cleanName.length < 2) continue;

      examples.push({
        instruction: "What is the GEMS 2026 Drug Reference Price for this medicine?",
        input: `NAPPI: ${nappi} — ${cleanName}`,
        output: JSON.stringify({
          nappi,
          name: cleanName,
          drugClass,
          packSize: packSize?.trim() || "1",
          priceExclVAT: `R${priceExVat}`,
          priceInclVAT: `R${priceIncVat}`,
          unitPriceInclVAT: `R${unitPrice}`,
          source: "GEMS Drug Reference Price List February 2026",
          sepIncrease: "1.47% effective 14 January 2026",
        }),
        category: "gems_drug_prices",
      });
    }
  } catch { /* file not found */ }

  return examples;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GEMS Chronic Formulary — 5,298 lines → drug reimbursement criteria
// ═══════════════════════════════════════════════════════════════════════════════

export function parseGEMSFormulary(): TrainingExample[] {
  const examples: TrainingExample[] = [];
  try {
    const content = readFileSync(join(EXTRACTED, "gems-formulary-jan2025-data.md"), "utf-8");
    const lines = content.split("\n");

    for (const line of lines) {
      // Match: | NAPPI | DRUG NAME | INGREDIENT | STRENGTH | FORM | CRITERIA |
      const match = line.match(/^\|\s*(\d{6,})\s*\|\s*([^|]+)\|\s*([^|]*)\|\s*([^|]*)\|\s*([^|]*)\|\s*([^|]*)\|/);
      if (!match) continue;

      const [, nappi, name, ingredient, strength, form, criteria] = match;
      const cleanName = name.trim();
      const cleanCriteria = criteria.trim();
      if (!cleanName || cleanName.length < 2) continue;

      examples.push({
        instruction: "What is the GEMS formulary status and reimbursement criteria for this medicine?",
        input: `Medicine: ${cleanName} (NAPPI: ${nappi})`,
        output: JSON.stringify({
          nappi,
          name: cleanName,
          activeIngredient: ingredient?.trim(),
          strength: strength?.trim(),
          form: form?.trim(),
          reimbursementCriteria: cleanCriteria || "Check scheme",
          source: "GEMS Comprehensive PMB Formulary January 2025",
          note: cleanCriteria === "Accepted treatment" ? "Covered without additional clinical information" :
                cleanCriteria === "Clinical Review" ? "Requires drug history/co-morbidity review" :
                cleanCriteria === "Clinical Motivation" ? "Requires specific clinical information before reimbursement" :
                cleanCriteria === "Specialist script" ? "Requires relevant specialist prescription" :
                cleanCriteria === "Specialist Motivation" ? "Requires relevant specialist motivation" : "",
        }),
        category: "gems_formulary",
      });
    }
  } catch { /* file not found */ }

  return examples;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Discovery CDL Formulary — 1,698 lines → CDL drug coverage
// ═══════════════════════════════════════════════════════════════════════════════

export function parseDiscoveryCDL(): TrainingExample[] {
  const examples: TrainingExample[] = [];
  try {
    const content = readFileSync(join(EXTRACTED, "discovery-cdl-formulary-2026-data.md"), "utf-8");
    const lines = content.split("\n");
    let currentCondition = "";

    for (const line of lines) {
      // Match pipe rows with CDL data
      const match = line.match(/^\|\s*([^|]*)\|\s*R?([\d,.]*)\s*\|\s*[^|]*\|\s*[^|]*\|\s*R?([\d,.]*)\s*\|\s*([^|]*)\|\s*([^|]*)\|\s*([^|]*)\|/);
      if (!match) continue;

      const [, condition, cdaCoreSaver, , medClass, ingredient, medicineName] = match;
      const cleanCondition = condition?.trim();
      const cleanMedicine = medicineName?.trim();
      const cleanIngredient = ingredient?.trim();
      const cleanClass = medClass?.trim();

      if (cleanCondition && cleanCondition.length > 3 && !cleanCondition.includes("CHRONIC") && !cleanCondition.includes("PLANS")) {
        currentCondition = cleanCondition;
      }

      if (!cleanMedicine || cleanMedicine.length < 3) continue;

      examples.push({
        instruction: "What Discovery Health CDL formulary coverage applies to this medicine?",
        input: `CDL condition: ${currentCondition || "Unknown"}, Medicine: ${cleanMedicine}`,
        output: JSON.stringify({
          cdlCondition: currentCondition,
          medicineClass: cleanClass,
          activeIngredient: cleanIngredient,
          medicineName: cleanMedicine,
          cdaCoreSaverPriority: cdaCoreSaver ? `R${cdaCoreSaver}` : "N/A",
          source: "Discovery Health CDL Formulary 2026",
          rules: "Non-formulary covered up to CDA/DHR/Reference Price (whichever lowest). 20% co-payment if DSP not used.",
        }),
        category: "discovery_cdl_formulary",
      });
    }
  } catch { /* file not found */ }

  return examples;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Legal Texts — paragraph-level chunking for Act, Regulations, Section 59
// ═══════════════════════════════════════════════════════════════════════════════

function parseLegalDoc(filename: string, docTitle: string, category: string): TrainingExample[] {
  const examples: TrainingExample[] = [];
  try {
    const content = readFileSync(join(EXTRACTED, filename), "utf-8");

    // Strategy 1: Split on any heading level (# ## ### ####)
    const headingSections = content.split(/^#{1,4}\s+/m).filter(s => s.trim().length > 50);

    for (const section of headingSections) {
      const lines = section.split("\n");
      const heading = lines[0]?.trim();
      if (!heading || heading.length < 3) continue;

      const body = lines.slice(1).join("\n").trim();
      if (body.length < 30) continue;

      examples.push({
        instruction: `What does the ${docTitle} say about: ${heading}?`,
        input: heading,
        output: body.slice(0, 2500),
        category,
      });
    }

    // Strategy 2: Chunk by numbered sections (Section X, Regulation X, N. Title)
    const sectionRegex = /(?:^|\n)((?:Section\s+\d+|Regulation\s+\d+|\d{1,3}\.\s+[A-Z])[^\n]*)\n((?:(?!\nSection\s+\d+|\nRegulation\s+\d+|\n\d{1,3}\.\s+[A-Z])[^\n]*\n?){2,})/g;
    let match;
    while ((match = sectionRegex.exec(content)) !== null) {
      const sectionTitle = match[1].trim();
      const sectionBody = match[2].trim();
      if (sectionBody.length < 50) continue;

      examples.push({
        instruction: `Explain this section of the ${docTitle}.`,
        input: sectionTitle,
        output: sectionBody.slice(0, 2500),
        category: `${category}_sections`,
      });
    }

    // Strategy 3: Paragraph chunking — for docs without clear headings
    // Split on double newlines, group into ~500-char training chunks
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 80);
    let chunk = "";
    let chunkNum = 0;
    for (const para of paragraphs) {
      chunk += para.trim() + "\n\n";
      if (chunk.length >= 500) {
        chunkNum++;
        // Extract a topic from the first line
        const firstLine = chunk.split("\n")[0].trim().slice(0, 100);
        examples.push({
          instruction: `From the ${docTitle}, explain the following:`,
          input: firstLine,
          output: chunk.trim().slice(0, 2500),
          category: `${category}_chunks`,
        });
        chunk = "";
      }
    }
    // Flush remaining
    if (chunk.length >= 100) {
      chunkNum++;
      const firstLine = chunk.split("\n")[0].trim().slice(0, 100);
      examples.push({
        instruction: `From the ${docTitle}, explain the following:`,
        input: firstLine,
        output: chunk.trim().slice(0, 2500),
        category: `${category}_chunks`,
      });
    }

    // Strategy 4: Table rows as individual examples
    const tableRows = content.split("\n").filter(l => l.trim().startsWith("|") && !l.includes("---") && l.split("|").length >= 4);
    for (const row of tableRows) {
      const cells = row.split("|").map(c => c.trim()).filter(c => c.length > 0);
      if (cells.length < 3 || cells.every(c => c.length < 3)) continue;

      examples.push({
        instruction: `What information does the ${docTitle} provide about: ${cells[0]}?`,
        input: cells[0],
        output: cells.join(" | "),
        category: `${category}_data`,
      });
    }
  } catch { /* file not found */ }

  return examples;
}

export function parseMedicalSchemesAct(): TrainingExample[] {
  return parseLegalDoc("medical-schemes-act-full-text.md", "Medical Schemes Act 131 of 1998", "medical_schemes_act");
}

export function parseMedicalSchemesRegulations(): TrainingExample[] {
  return parseLegalDoc("medical-schemes-regulations-full-text.md", "Medical Schemes Regulations", "medical_schemes_regulations");
}

export function parseSection59(): TrainingExample[] {
  return parseLegalDoc("section59-investigation-extracted.md", "Section 59 Investigation Panel Report (2025)", "section59_investigation");
}

export function parsePHISCSpec(): TrainingExample[] {
  return parseLegalDoc("phisc-medclm-spec-extracted.md", "PHISC MEDCLM EDIFACT Specification", "phisc_medclm");
}

export function parseHPCSABooklet(): TrainingExample[] {
  return parseLegalDoc("hpcsa-booklet-20-ai-extracted.md", "HPCSA Booklet 20 — AI in Healthcare", "hpcsa_ai_ethics_full");
}

export function parseSAHPRA(): TrainingExample[] {
  return parseLegalDoc("sahpra-ai-ml-devices-extracted.md", "SAHPRA AI/ML Medical Device Guidelines", "sahpra_guidelines");
}

export function parseCMSReport(): TrainingExample[] {
  return parseLegalDoc("cms-industry-report-2024-data.md", "CMS Annual Industry Report 2024", "cms_report_full");
}

export function parseBonitas(): TrainingExample[] {
  return parseLegalDoc("bonitas-annexure-c-2025-data.md", "Bonitas Medical Fund Annexure C 2025", "bonitas_benefits_full");
}

export function parseDiscoveryBaskets(): TrainingExample[] {
  return parseLegalDoc("discovery-treatment-baskets-2026-data.md", "Discovery Health Treatment Baskets 2026", "discovery_baskets");
}

// ═══════════════════════════════════════════════════════════════════════════════
// MASTER — Parse ALL extracted documents
// ═══════════════════════════════════════════════════════════════════════════════

export function deepParseAllDocuments(): {
  examples: TrainingExample[];
  stats: Record<string, number>;
} {
  const allExamples: TrainingExample[] = [];
  const stats: Record<string, number> = {};

  const parsers: [string, () => TrainingExample[]][] = [
    ["GEMS DRP (10K lines)", parseGEMSDRP],
    ["GEMS Formulary (5K lines)", parseGEMSFormulary],
    ["Discovery CDL Formulary", parseDiscoveryCDL],
    ["Medical Schemes Act (full text)", parseMedicalSchemesAct],
    ["Medical Schemes Regulations (full text)", parseMedicalSchemesRegulations],
    ["Section 59 Investigation (227 pages)", parseSection59],
    ["PHISC MEDCLM Spec", parsePHISCSpec],
    ["HPCSA Booklet 20 AI", parseHPCSABooklet],
    ["SAHPRA AI/ML Guidelines", parseSAHPRA],
    ["CMS Industry Report 2024", parseCMSReport],
    ["Bonitas Annexure C", parseBonitas],
    ["Discovery Treatment Baskets", parseDiscoveryBaskets],
  ];

  for (const [name, parser] of parsers) {
    const examples = parser();
    allExamples.push(...examples);
    stats[name] = examples.length;
    console.log(`[Deep Parse] ${name}: ${examples.length} examples`);
  }

  console.log(`[Deep Parse] TOTAL: ${allExamples.length} examples from ${parsers.length} documents`);

  return { examples: allExamples, stats };
}
