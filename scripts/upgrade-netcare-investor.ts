/**
 * Upgrade Thirushen Pillay to investor role with research portal access
 * Run: npx tsx scripts/upgrade-netcare-investor.ts
 */
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.update({
    where: { email: "thirushen.pillay@netcare.co.za" },
    data: { role: "investor" },
  });
  console.log("Updated role to investor:", user.id, user.role);

  const notes = [
    {
      userId: user.id,
      section: "general",
      content:
        "Welcome to the VisioHealth Intelligence Terminal. This portal gives you access to our full SA healthcare research library, competitive intelligence, media monitoring, and operational analytics — the same data that drives our AI agents and advisory recommendations.",
      pinned: true,
    },
    {
      userId: user.id,
      section: "compliance",
      content:
        "Full SA healthcare compliance research completed — covering POPIA (Sections 18-22), HPCSA ethical guidelines, ICD-10 SA coding standards, Medical Schemes Act (131 of 1998), Consumer Protection Act, Medicines Act, ECTA, and NHI Act. All 7 regulations mapped across platform capabilities. Netcare-specific: aligned with your AI Governance Committee framework and Information Officer (Charles Vikisi) reporting requirements.",
      pinned: true,
    },
    {
      userId: user.id,
      section: "ecosystem",
      content:
        "VisioHealth OS sits within a 6-product ecosystem: VisioHealth OS (LIVE — practice management + AI billing), Placeo Health (facility marketplace), Health Integrator (system interconnect layer), Waiting Room (patient engagement), Payer Connect (scheme integration), VisioMed AI (clinical decision support). For Netcare Primary Care, the immediate value is VisioHealth OS + Payer Connect — financial operations intelligence across 88 Medicross clinics.",
      pinned: false,
    },
    {
      userId: user.id,
      section: "product:visiohealthos",
      content:
        "VisioHealth OS — Primary Care Financial Operations Platform. Core modules: AI-powered ICD-10 billing, claims rejection analytics, multi-site revenue dashboards, capitation utilisation monitoring, patient engagement (WhatsApp/SMS), POPIA consent tracking, daily task workflows. Built for networks of 50-500+ clinics. Currently live with pilot practices. Enterprise white-label with full branding customisation.",
      pinned: false,
    },
    {
      userId: user.id,
      section: "general",
      content:
        "SA Health Sector Intelligence: R232 billion in medical scheme contributions (2023/24). R40 billion denied by schemes. 9M+ scheme beneficiaries. Private healthcare serves ~16% of population but consumes ~50% of total health expenditure. Key players: Discovery Health (largest admin), Netcare (largest private hospital group, R26.3B revenue), Life Healthcare, Mediclinic. NHI Act signed May 2024 — restructures primary care funding model. Primary care is the frontline of NHI implementation.",
      pinned: false,
    },
  ];

  for (const note of notes) {
    await prisma.investorNote.create({ data: note });
  }
  console.log("Created", notes.length, "investor notes");

  // Add OpsDocuments with research content for the intel terminal
  const opsDocs = [
    {
      practiceId: user.practiceId || "",
      category: "market_research",
      title: "SA Private Healthcare Market — 2026 Landscape",
      content: `# SA Private Healthcare Market Intelligence\n\n## Market Size\n- Total SA healthcare spend: ~R550 billion (8.5% of GDP)\n- Private sector: ~R280 billion (serves 16% of population)\n- Medical scheme contributions: R232 billion (2023/24)\n- Claims denied by schemes: R40 billion\n\n## Key Hospital Groups\n| Group | Revenue | Hospitals | Beds |\n|-------|---------|-----------|------|\n| Netcare | R26.3B | 49+ | 10,900 |\n| Life Healthcare | R30.2B | 49 | 9,100 |\n| Mediclinic | R42.3B | 52 (SA) | 8,600 |\n| Lenmed | R4.1B | 14 | 2,100 |\n\n## Primary Care Landscape\n- Estimated 12,000+ private GP practices in SA\n- 568 practitioners in Netcare Medicross alone\n- Average GP consultation: R550-R850\n- Claims rejection rate: 5-10% industry-wide\n- No-show rate: 20-40% (SA average)\n\n## Digital Health Investment\n- Netcare Digital (JV with A2D24) — CareOn, HEAL Platform\n- Discovery Vitality — wearables, preventive health\n- Quro Medical — hospital-at-home (acquired by Netcare R121M)\n- Healthbridge — 7,000+ practices (largest PM network)\n\n## Regulatory Drivers\n- NHI Act (May 2024) — restructures primary care funding\n- POPIA enforcement — consent and audit requirements\n- Medical Schemes Amendment Bill — potential price regulation\n- HPCSA telemedicine guidelines — enabling virtual care`,
      metadata: JSON.stringify({ source: "VisioCorp Research Division", date: "2026-03-19", classification: "confidential" }),
      pinned: true,
    },
    {
      practiceId: user.practiceId || "",
      category: "market_research",
      title: "Netcare Primary Healthcare Division — Deep Profile",
      content: `# Netcare Primary Healthcare Division — Intelligence Brief\n\n## Financial Performance (FY2025)\n- Division Revenue: R662M (-7.0% YoY)\n- Underlying Growth (excl. lost contract): +2.8%\n- EBITDA Margin: 24.5% (+150bps YoY)\n- Group Revenue: R26.3B (+4.5%)\n\n## Operating Footprint\n- 88 Medicross clinics (national)\n- 37 retail pharmacies\n- 12 day theatres\n- 568 independent doctors and dentists\n- 254,000 capitated lives (Prime Cure)\n- 49 medical scheme options managed\n- 3,877 contracted provider network\n\n## Leadership\n- S. Nayager — Managing Director (appointed Jan 2025)\n- Thirushen Pillay — Financial Director\n- Travis Dewing — CIO / Netcare Digital CEO\n\n## Technology Stack\n| System | Purpose | Vendor |\n|--------|---------|--------|\n| SAP IS-H | Hospital billing, ADT, ERP | SAP (R100M investment) |\n| CareOn | Hospital EMR | Deutsche Telekom + Apple iOS |\n| HEAL | Primary care EMR | Netcare Digital + A2D24 (AWS) |\n| MediSwitch | Claims EDI | Altron subsidiary |\n| Quro Medical | Hospital-at-home | Acquired R121M (June 2025) |\n\n## Strategic Challenges\n1. Revenue volatility — lost major occ health contract (-7%)\n2. SAP IS-H end-of-life (ECC 2027-2030) — S/4HANA migration\n3. NHI uncertainty — capitation-at-scale financial modelling\n4. Multi-site cost control across 88 clinics\n5. HEAL billing module still maturing\n\n## Opportunity Assessment\n- Financial operations layer is the gap\n- HEAL handles clinical; SAP handles hospital; nobody owns primary care financial intelligence\n- VisioHealth OS fills this gap without replacing any existing system`,
      metadata: JSON.stringify({ source: "VisioCorp Research Division", date: "2026-03-19", classification: "confidential" }),
      pinned: true,
    },
    {
      practiceId: user.practiceId || "",
      category: "insights",
      title: "SA Healthcare Media Monitoring — March 2026",
      content: `# Healthcare Media Intelligence — March 2026\n\n## Key Publications Monitored\n- Business Day (Discovery, Netcare, Life quarterly results)\n- Daily Investor (healthcare sector analysis)\n- BizNews (healthcare corporate reporting)\n- Health24 / News24 Health (consumer health trends)\n- ITWeb / IT-Online (health tech innovation)\n- CNBC Africa (healthcare earnings and strategy)\n- MedicalBrief (clinical and regulatory developments)\n\n## March 2026 Highlights\n- **Netcare FY2025 Results**: R26.3B revenue (+4.5%), HEPS +20.7%. Primary Care division revenue down 7% but margins improved 150bps.\n- **NHI Implementation**: Government accelerating primary care contracting framework. Private sector lobbying for collaborative model.\n- **AI Governance**: Multiple hospital groups establishing AI governance committees. Netcare first meeting Q2 FY2025.\n- **Digital Health Funding**: SA healthtech attracted $45M+ in 2025. Quro Medical exit (R121M to Netcare) signals acqui-hire trend.\n- **Claims Technology**: MediSwitch processing 5.8M+ transactions/month. EDI modernisation discussions ongoing at BHF.\n\n## Analyst Sentiment\n- Netcare: BUY consensus. Primary care seen as strategic growth lever despite short-term revenue dip.\n- Healthcare digitisation: Accelerating. SAP S/4HANA migration creating technology refresh window.\n- NHI: Uncertainty weighing on sector but private sector positioning for partnership model.`,
      metadata: JSON.stringify({ source: "VisioCorp Research Division", date: "2026-03-19", classification: "internal" }),
      pinned: false,
    },
    {
      practiceId: user.practiceId || "",
      category: "insights",
      title: "SA Health Tech Competitive Landscape — 100+ Companies Mapped",
      content: `# SA Health Tech Competitive Intelligence\n\n## Tier 1 — Direct Competitors (HIGH threat)\n| Company | Focus | Scale | Threat Level |\n|---------|-------|-------|-------------|\n| Healthbridge | PM + claims switching | 7,000+ practices | HIGH |\n| Altron HealthTech (Elixir) | Billing + switching | JSE-listed, enterprise | HIGH |\n| GoodX | Practice management | Growing, cloud-first | MEDIUM-HIGH |\n\n## Tier 2 — Adjacent Players (MEDIUM threat)\n| Company | Focus | Notes |\n|---------|-------|-------|\n| Kitrin | PM software | Affordable, newer entrant |\n| PracSoft | Legacy PM | Older hardware compatible |\n| MedEasy | Claims + PM | Cape Town based |\n| smeMetrics | Medical billing software | R4.75/claim model |\n\n## Tier 3 — Enterprise/Hospital (LOW direct threat)\n| Company | Focus | Notes |\n|---------|-------|-------|\n| Deutsche Telekom Clinical Solutions | Hospital EMR (CareOn) | Netcare partner |\n| SAP IS-H | Hospital ERP | Enterprise, expensive |\n| Philips Capsule | Medical device integration | Device layer |\n| Merative (IBM Watson Health) | Clinical intelligence | Drug safety focus |\n\n## Our Differentiators\n1. **AI-native** — not retrofitted AI onto legacy PM\n2. **Financial operations focus** — not another EMR\n3. **White-label multi-tenant** — designed for hospital group deployment\n4. **SA-built, SA-compliant** — POPIA, ICD-10 SA, Medical Schemes Act native\n5. **Network-scale** — built for 50-500+ clinics, not single practices`,
      metadata: JSON.stringify({ source: "VisioCorp Research Division", date: "2026-03-19", classification: "confidential" }),
      pinned: false,
    },
  ];

  for (const doc of opsDocs) {
    await prisma.opsDocument.create({ data: doc });
  }
  console.log("Created", opsDocs.length, "research documents for intel terminal");

  console.log("\n=== UPGRADE COMPLETE ===");
  console.log("Thirushen Pillay now has INVESTOR access:");
  console.log("- /investor (research portal, NDA, courses, sitemap)");
  console.log("- /investor/research (16 research papers + health sector intel)");
  console.log("- /investor/letter (founder letter)");
  console.log("- /investor/notes (5 seeded advisory notes)");
  console.log("- /dashboard (practice management)");
  console.log("- /dashboard/intel (4 research docs in intel terminal)");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
