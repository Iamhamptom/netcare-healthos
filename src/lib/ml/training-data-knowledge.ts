// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Knowledge Base Training Data — Generates Q&A pairs from FULL docs/knowledge/
//
// This reads every .md file in the knowledge base and generates instruction-
// following pairs from the actual text. Combined with training-data-comprehensive.ts,
// this gives the model deep knowledge of ALL domains:
//
// - SA healthcare law (Medical Schemes Act sections, verbatim)
// - Regulations (all 15 key regulations)
// - Industry landscape (vendors, competitors, market)
// - Business intelligence (contracts, SLAs, procurement, BEE)
// - Commercial intelligence (pricing, channels, TAM)
// - Telehealth/digital health (tariff codes, WhatsApp rules)
// - NHI readiness (DRG, capitation, FHIR transition timeline)
// - Scheme pricing comparison (6 schemes side-by-side)
// - Practice workflows (end-to-end patient journey)
// - EHR/clinical standards (HPCSA Booklet 9, ICD-10 workflows)
// - Netcare Primary Care business model + pitch strategy
// - FHIR implementation guide (43KB of SA FHIR detail)
// - Extracted legal texts (Medical Schemes Act, Regulations, PHISC spec)
// - Discovery/GEMS/Bonitas formularies
// - CMS Industry Report 2024 statistics
// - Section 59 investigation findings
// - HPCSA AI ethics (Booklet 20)
// - SAHPRA SaMD classification
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { readFileSync, readdirSync } from "fs";
import { join } from "path";

interface TrainingExample {
  instruction: string;
  input: string;
  output: string;
  category: string;
}

const KB_DIR = join(process.cwd(), "docs/knowledge");
const EXTRACTED_DIR = join(KB_DIR, "extracted");

// ─── Chunk-based Q&A Generator ──────────────────────────────────────────────

/**
 * Split a markdown document into sections and generate Q&A pairs from each.
 * Each ## or ### heading becomes a question topic.
 */
function generateQAFromMarkdown(content: string, docTitle: string, category: string): TrainingExample[] {
  const examples: TrainingExample[] = [];
  const sections = content.split(/^##\s+/m).filter(s => s.trim());

  for (const section of sections) {
    const lines = section.split("\n");
    const heading = lines[0]?.trim();
    if (!heading || heading.length < 5) continue;

    const body = lines.slice(1).join("\n").trim();
    if (body.length < 50) continue; // Skip tiny sections

    // Generate a Q&A pair for each meaningful section
    examples.push({
      instruction: `In the context of SA healthcare (${docTitle}), explain: ${heading}`,
      input: `Topic: ${heading}`,
      output: body.slice(0, 2000), // Cap at 2000 chars per answer
      category,
    });

    // Also generate subsection Q&As from ### headings
    const subsections = body.split(/^###\s+/m).filter(s => s.trim());
    for (const sub of subsections) {
      const subLines = sub.split("\n");
      const subHeading = subLines[0]?.trim();
      const subBody = subLines.slice(1).join("\n").trim();
      if (!subHeading || subHeading.length < 5 || subBody.length < 50) continue;

      examples.push({
        instruction: `Regarding ${heading} in SA healthcare: ${subHeading}`,
        input: subHeading,
        output: subBody.slice(0, 2000),
        category,
      });
    }
  }

  return examples;
}

/**
 * Extract tables from markdown and generate lookup/comparison examples.
 */
function generateTableExamples(content: string, docTitle: string, category: string): TrainingExample[] {
  const examples: TrainingExample[] = [];
  const tableRegex = /\|[^\n]+\|[\n\r]+\|[-| :]+\|[\n\r]+((?:\|[^\n]+\|[\n\r]*)+)/g;

  let match;
  let tableNum = 0;
  while ((match = tableRegex.exec(content)) !== null) {
    tableNum++;
    const fullTable = match[0];
    const rows = fullTable.split("\n").filter(r => r.trim().startsWith("|") && !r.includes("---"));

    if (rows.length < 2) continue;

    // Get the heading before this table
    const beforeTable = content.slice(0, match.index);
    const headingMatch = beforeTable.match(/#{1,3}\s+([^\n]+)\n[^#]*$/);
    const tableContext = headingMatch ? headingMatch[1].trim() : `Table ${tableNum}`;

    examples.push({
      instruction: `Provide the data table for: ${tableContext} (from ${docTitle})`,
      input: tableContext,
      output: fullTable.slice(0, 2000),
      category,
    });
  }

  return examples;
}

// ─── Document-Specific Generators ───────────────────────────────────────────

/**
 * Generate law & regulation training examples with specific section references.
 */
export function generateLawExamples(): TrainingExample[] {
  const examples: TrainingExample[] = [];

  // Medical Schemes Act key sections
  const actSections = [
    { section: "s59(2)", rule: "A medical scheme shall pay to a member or supplier of service any benefit owing within 30 days after the day on which the claim was received.", category: "Claims payment deadline" },
    { section: "s59(3)", rule: "Schemes may deduct amounts from benefits if paid in error or lost through fraud/negligence.", category: "Error recovery" },
    { section: "Regulation 6", rule: "Claims must be submitted within 4 months (120 days) of service date. Scheme must pay or notify rejection within 30 days. If rejected, provider has 60 days to correct and resubmit. If scheme fails to notify within 30 days, burden of proof shifts TO THE SCHEME.", category: "Claims procedure" },
    { section: "Regulation 8", rule: "Any benefit option must pay in full, WITHOUT co-payment or deductibles, the diagnosis, treatment and care costs of PMB conditions. PMBs override waiting periods, benefit limits, savings account restrictions. At DSP: pay FULL. Non-DSP: co-payment allowed but must still cover at least DSP rate. No DSP appointed → MUST pay in full at ANY provider (Genesis ruling 2015). PMBs funded from RISK pool ONLY — never from savings accounts.", category: "Prescribed Minimum Benefits" },
    { section: "Regulation 10(6)", rule: "PMBs must NEVER be paid from the Personal Medical Savings Account (PMSA). This is explicitly prohibited.", category: "Savings account restriction" },
    { section: "Regulation 13", rule: "Late Joiner Penalties: 5% per year of non-membership after age 35, compounding. Maximum 75%. Applies at initial joining, not when switching schemes. Calculation: Years without cover (after age 35) × 5% = LJP percentage added to contribution.", category: "Late joiner penalties" },
    { section: "Regulation 7", rule: "Emergency medical conditions: sudden and unexpected onset requiring immediate medical/surgical treatment, where failure would result in serious impairment, dysfunction, or jeopardy to life. No DSP restriction, no pre-auth, stabilisation first, no co-payment, 24-hour rule.", category: "Emergency definition" },
    { section: "Regulation 2", rule: "Minimum 6,000 members required within 3 months of medical scheme registration.", category: "Scheme registration" },
    { section: "Regulation 15", rule: "Managed health care provisions: network management requirements, referral processes, pre-authorization rules.", category: "Managed care" },
    { section: "Section 27", rule: "Cancellation and suspension of scheme registration by the Registrar for non-compliance.", category: "Enforcement" },
    { section: "POPIA s72", rule: "Cross-border transfer of personal information only if adequate protection exists. Using US-based AI APIs (Anthropic, OpenAI, Google) with patient data = cross-border transfer requiring: adequacy assessment, contractual safeguards, explicit consent, OR de-identification before API call.", category: "Cross-border data" },
    { section: "POPIA Breach", rule: "72-hour benchmark for breach notification to Information Regulator AND data subjects. Penalties: up to R10 million admin fine, 10 years imprisonment, unlimited civil damages, personal director liability.", category: "Data breach" },
  ];

  for (const s of actSections) {
    examples.push({
      instruction: `What does ${s.section} of the SA Medical Schemes Act/Regulations require?`,
      input: `${s.section} — ${s.category}`,
      output: s.rule,
      category: "law_and_regulation",
    });
  }

  // HPCSA AI ethics
  const hpcsaRules = [
    "AI use must be disclosed to patients. Practitioners remain the decision-makers — AI is assistive only.",
    "Practitioners maintain clinical responsibility for ALL AI-assisted decisions. AI does not replace clinical judgment.",
    "Fair outcomes across demographics required. Explainability mandatory for all AI outputs.",
    "Rigorous testing and continuous monitoring required. Adverse event reporting mandatory.",
    "POPIA 2026 compliance required. No unauthorized secondary use of patient data.",
    "Practitioners must understand AI limitations through CPD (Continuing Professional Development).",
  ];

  for (let i = 0; i < hpcsaRules.length; i++) {
    examples.push({
      instruction: `What does HPCSA Booklet 20 (AI Ethics) say about principle ${i + 1}?`,
      input: "HPCSA AI ethics guidelines for healthcare practitioners",
      output: hpcsaRules[i],
      category: "hpcsa_ai_ethics",
    });
  }

  // SAHPRA SaMD classification
  const samdClasses = [
    { product: "Practice management software (scheduling, billing)", class: "A", registration: "Self-declaration only", reason: "Administrative tool, no clinical decision-making" },
    { product: "Claims validation — admin/billing checks only", class: "Not SaMD", registration: "No registration required", reason: "Does not influence clinical decisions" },
    { product: "Claims validation with clinical appropriateness flagging", class: "B or C", registration: "Registration may be required", reason: "Influences clinical decision by flagging inappropriateness" },
    { product: "Clinical decision support with practitioner override", class: "B", registration: "Registration required", reason: "Provides clinical recommendations but practitioner has final authority" },
    { product: "AI diagnostic system influencing treatment decisions", class: "C", registration: "Full SAHPRA review required", reason: "Directly influences treatment selection or diagnosis" },
    { product: "Autonomous diagnostic or treatment AI", class: "D", registration: "Strictest regulation — full clinical trial data required", reason: "Makes decisions without practitioner override" },
  ];

  for (const s of samdClasses) {
    examples.push({
      instruction: "What SAHPRA SaMD classification applies to this product?",
      input: `Product: ${s.product}`,
      output: JSON.stringify(s),
      category: "sahpra_samd",
    });
  }

  return examples;
}

/**
 * Generate Netcare Primary Care business intelligence examples.
 */
export function generateNetcareExamples(): TrainingExample[] {
  const examples: TrainingExample[] = [];

  const netcareFacts = [
    { q: "What is Netcare Primary Care's business model?", a: "Platform + Managed Care Hybrid. Netcare doesn't employ most doctors — it's a landlord + admin services platform. 568 independent GPs/dentists practice from their clinics, paying facility and management fees. Four revenue engines: 1) Fee-for-service (GPs bill schemes), 2) Capitation via Prime Cure (R PMPM for 254,000 lives across 49 scheme options), 3) Occupational health corporate SLAs, 4) Cash/self-pay discounted vouchers." },
    { q: "What is Netcare Primary Care's scale?", a: "55 Medicross clinics, ~33 Prime Cure centres, 41 retail pharmacies, 12 day theatres, 3 occupational health centres = 88 clinics total, 3.5M patient visits/year, 568 independent doctors/dentists, 10,000+ contracted providers in Prime Cure network, 254,000 capitated lives, 8 of 9 provinces." },
    { q: "What are Netcare Primary Care's financials?", a: "FY2025 (year ended Sept 2025): Revenue R662M (down 7% from R712M FY2024), EBITDA R162M, EBITDA margin 24.5% (up from 23.0%). The 7% drop was one large occupational health contract non-renewal. Underlying growth +2.8% — barely keeping pace with ~5% inflation, shrinking in real terms." },
    { q: "What are Netcare Primary Care's key challenges?", a: "1) Flat real growth (2.8% vs 5% inflation), 2) Claims leakage — 568 independent GPs coding differently, no standardization, 3) Contract concentration risk (lost one occ-health contract → 7% revenue swing), 4) GP shortage — can't attract/retain practitioners, 5) Medical aid stagnation (only 16% of SA has medical aid), 6) NHI uncertainty — CEO Friedland said NHI 'completely unaffordable', 7) Independent contractor complexity — hard to align 568 GPs on quality/billing." },
    { q: "How does VisioCorp solve Netcare's problems?", a: "Claims Analyzer → recovers lost revenue from claims leakage. Switching Engine + Claims Analyzer → standardizes coding across 568 GPs. WhatsApp Router → patient retention to offset contract losses. HealthOps → reduces admin burden per GP, makes Medicross more attractive. FHIR Hub → NHI-ready compliance regardless of outcome. White-label HealthOps → standardizes operations without removing GP independence." },
    { q: "What is Prime Cure and how does it work?", a: "Prime Cure is Netcare's capitated managed care division. It receives fixed per-member-per-month (PMPM) fees to manage 254,000 lives across 49 scheme options. Located in townships and industrial areas for low-income populations. Revenue is predictable (capitation) vs volatile (fee-for-service). Prime Cure has 3,877 doctors/dentists in its provider network and ~33 centres." },
  ];

  for (const f of netcareFacts) {
    examples.push({
      instruction: f.q,
      input: "Netcare Primary Care Division — SA healthcare business intelligence",
      output: f.a,
      category: "netcare_business_intel",
    });
  }

  return examples;
}

/**
 * Generate CMS industry statistics training examples.
 */
export function generateIndustryExamples(): TrainingExample[] {
  const examples: TrainingExample[] = [];

  const stats = [
    { q: "How large is the SA medical schemes industry?", a: "71 registered medical schemes (36 open, 35 restricted). 9.17 million beneficiaries (modest growth +41,000 from 2023). Total healthcare expenditure: R259.3 billion (8.52% growth YoY). Out-of-pocket payments: R46.3 billion. Only 16% of SA's population has medical aid — the rest use public healthcare." },
    { q: "Which SA medical schemes are growing fastest?", a: "Top growth 2023-2024: LA-HEALTH +6.7%, ALLIANCE-MIDMED +5.8%, UMVUZO +5.4%, GEMS +5.2%, RETAIL +5.1%, FOODMED +5.1%. EDO (Efficiency Discounted Options) expanding rapidly — 73 options in 2024 (up from 50 in 2017), covering 1.47M lives." },
    { q: "Which SA medical schemes are declining?", a: "Warning signs: BP MEDICAL -27.7%, SUREMED -32.8% (severe), MEDIPOS -36.6% (potential closure risk), COMPCARE -10.3%, MBMED -10.1%, SISONKE -10.0%. Industry consolidation trend continues." },
    { q: "What is the SA healthcare fraud problem?", a: "R22-28 billion annual losses (7-10% of R259B total expenditure). Breakdown: Waste (unnecessary, no intent) 50-55% = R11-15B (BIGGEST), Abuse (improper) 20-30% = R5-8B, Fraud (intentional) 20-25% = R4-7B. Scheme recoveries only R1-1.5B/yr (30-40% recovery rate, ROI R1 → R4-6)." },
    { q: "What are the main SA healthcare cost drivers?", a: "Hospital services (largest), specialist care, medicines, ageing membership profile (+0.29 years annually). Healthcare expenditure growth: 7.8% in analysis period vs 4.5% CPI — healthcare inflating faster than general economy." },
  ];

  for (const s of stats) {
    examples.push({
      instruction: s.q,
      input: "CMS Industry Report 2024 — SA medical schemes",
      output: s.a,
      category: "industry_statistics",
    });
  }

  return examples;
}

/**
 * Generate telehealth and digital health examples.
 */
export function generateTelehealthExamples(): TrainingExample[] {
  const examples: TrainingExample[] = [];

  const telehealth = [
    { q: "What tariff codes apply to telehealth consultations in SA?", a: "Tariff 0197 (telehealth consultation) — R400-520. Most schemes now cover video consultations at 80-100% of in-person rate. Modifier 0026 (telehealth) applied to standard consultation codes. Requirements: patient consent documented, secure video platform, clinical notes equivalent to in-person. WhatsApp consultations generally NOT billable as formal consults unless scheme-specific agreement exists." },
    { q: "What are the rules for WhatsApp in SA healthcare?", a: "WhatsApp is widely used for patient communication but has limitations: 1) Not a formal consultation platform (can't bill tariff codes), 2) POPIA compliance required — patient consent for data processing, 3) No PHI (Protected Health Information) in plain text — use encrypted channels, 4) Booking and reminders are safe use cases, 5) Clinical advice via WhatsApp creates liability, 6) Records must be maintained equivalent to other channels." },
    { q: "What is e-prescribing status in SA?", a: "Electronic prescriptions valid under ECTA (Electronic Communications and Transactions Act). Pharmacy Act recognizes electronic signatures for S4-S6 medications. Some schemes (Discovery) have dedicated e-prescribing platforms. NAPPI validation mandatory for electronic scripts. Schedule 5-6 medications require additional controls (bound register, monthly returns). Digital prescriptions admissible but may face scrutiny in disputes." },
  ];

  for (const t of telehealth) {
    examples.push({
      instruction: t.q,
      input: "SA telehealth and digital health regulations",
      output: t.a,
      category: "telehealth_digital",
    });
  }

  return examples;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MASTER: Generate from ALL knowledge base files
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Read every .md file in docs/knowledge/ and generate Q&A training examples.
 * This produces thousands of examples from the full text of every document.
 */
export function generateAllKnowledgeBaseExamples(): {
  examples: TrainingExample[];
  stats: { filesProcessed: number; totalExamples: number; byFile: Record<string, number> };
} {
  const allExamples: TrainingExample[] = [];
  const byFile: Record<string, number> = {};

  // 1. Structured generators (high-quality, hand-crafted)
  const lawExamples = generateLawExamples();
  allExamples.push(...lawExamples);
  byFile["law_regulation_structured"] = lawExamples.length;

  const netcareExamples = generateNetcareExamples();
  allExamples.push(...netcareExamples);
  byFile["netcare_business_intel"] = netcareExamples.length;

  const industryExamples = generateIndustryExamples();
  allExamples.push(...industryExamples);
  byFile["industry_statistics"] = industryExamples.length;

  const telehealthExamples = generateTelehealthExamples();
  allExamples.push(...telehealthExamples);
  byFile["telehealth_digital"] = telehealthExamples.length;

  // 2. Auto-generate Q&A from every knowledge doc
  let filesProcessed = 0;
  const kbFiles = [
    { file: "01_law_and_regulation.md", category: "law_and_regulation" },
    { file: "02_claims_adjudication.md", category: "claims_adjudication" },
    { file: "03_coding_standards.md", category: "coding_standards" },
    { file: "04_pmb_and_cdl.md", category: "pmb_cdl" },
    { file: "05_scheme_profiles.md", category: "scheme_profiles_detail" },
    { file: "06_pharmaceutical.md", category: "pharmaceutical" },
    { file: "07_fraud_detection.md", category: "fraud_detection_detail" },
    { file: "08_compliance.md", category: "compliance_detail" },
    { file: "09_industry_landscape.md", category: "industry_landscape" },
    { file: "10_market_intelligence.md", category: "market_intelligence" },
    { file: "11_business_intelligence.md", category: "business_intelligence" },
    { file: "12_commercial_intelligence.md", category: "commercial_intelligence" },
    { file: "13_clinical_guidelines.md", category: "clinical_guidelines_detail" },
    { file: "13_netcare_primary_care_intel.md", category: "netcare_intel" },
    { file: "14_rejection_patterns.md", category: "rejection_patterns_detail" },
    { file: "15_fhir_implementation.md", category: "fhir_implementation_detail" },
    { file: "16_telehealth_digital.md", category: "telehealth_detail" },
    { file: "17_nhi_readiness.md", category: "nhi_readiness_detail" },
    { file: "18_scheme_pricing_comparison.md", category: "scheme_pricing" },
    { file: "19_practice_workflows.md", category: "practice_workflows_detail" },
    { file: "20_ehr_clinical_standards.md", category: "ehr_clinical_standards" },
  ];

  for (const { file, category } of kbFiles) {
    try {
      const content = readFileSync(join(KB_DIR, file), "utf-8");
      const qaExamples = generateQAFromMarkdown(content, file.replace(".md", ""), category);
      const tableExamples = generateTableExamples(content, file.replace(".md", ""), `${category}_tables`);
      allExamples.push(...qaExamples, ...tableExamples);
      byFile[file] = qaExamples.length + tableExamples.length;
      filesProcessed++;
    } catch {
      // File doesn't exist — skip
    }
  }

  // 3. Auto-generate from extracted legal/regulatory texts
  const extractedFiles = [
    { file: "medical-schemes-act-full-text.md", category: "medical_schemes_act" },
    { file: "medical-schemes-regulations-full-text.md", category: "medical_schemes_regulations" },
    { file: "phisc-medclm-spec-extracted.md", category: "phisc_medclm_spec" },
    { file: "hpcsa-booklet-20-ai-extracted.md", category: "hpcsa_ai_booklet" },
    { file: "sahpra-ai-ml-devices-extracted.md", category: "sahpra_samd_detail" },
    { file: "section59-investigation-extracted.md", category: "section59_investigation" },
    { file: "discovery-cdl-formulary-2026-data.md", category: "discovery_formulary" },
    { file: "gems-drp-feb2026-data.md", category: "gems_drug_prices" },
    { file: "gems-formulary-jan2025-data.md", category: "gems_formulary" },
    { file: "bonitas-annexure-c-2025-data.md", category: "bonitas_benefits" },
    { file: "discovery-treatment-baskets-2026-data.md", category: "discovery_treatment_baskets" },
    { file: "cms-industry-report-2024-data.md", category: "cms_industry_report" },
  ];

  for (const { file, category } of extractedFiles) {
    try {
      const content = readFileSync(join(EXTRACTED_DIR, file), "utf-8");
      const qaExamples = generateQAFromMarkdown(content, file.replace(".md", ""), category);
      const tableExamples = generateTableExamples(content, file.replace(".md", ""), `${category}_tables`);
      allExamples.push(...qaExamples, ...tableExamples);
      byFile[`extracted/${file}`] = qaExamples.length + tableExamples.length;
      filesProcessed++;
    } catch {
      // File doesn't exist — skip
    }
  }

  console.log(`[KB Training] Processed ${filesProcessed} files → ${allExamples.length} examples`);

  return {
    examples: allExamples,
    stats: { filesProcessed, totalExamples: allExamples.length, byFile },
  };
}
