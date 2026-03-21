# VisioCorp Health Intelligence Knowledge Base
## Master Index — Compiled 2026-03-21
## 21 Research Agents | 4 Waves | 1,000+ Sources | 5MB Raw Research

---

## PURPOSE
This knowledge base gives VisioCorp AI agents (Steinberg, Claims Analyzer, HealthOps, Netcare Health OS) end-to-end understanding of the SA healthcare claims ecosystem — the law, the codes, the schemes, the tech, the fraud patterns, and the compliance requirements.

## HOW TO USE
- **Before ANY claims work**: Read files 01-06
- **Before building features**: Read files 07-08
- **Before sales/pitch work**: Read files 09-10
- **Use `kb_read_file`** for full content (system prompt only shows 500-char preview)

---

## FILES

| # | File | Domain | Key Content |
|---|------|--------|-------------|
| 01 | `01_law_and_regulation.md` | **Law** | Medical Schemes Act (verbatim s59), POPIA 2026 health regs, HPCSA AI Booklet 20, SAHPRA SaMD, NHI, ECTA, court cases |
| 02 | `02_claims_adjudication.md` | **Rules Engine** | Full adjudication flowchart, validation logic, benefit routing, co-pay calc, 25 rejection codes, pre-auth triggers, clean claim checklist |
| 03 | `03_coding_standards.md` | **Codes** | ICD-10 SA (MIT columns, 14,400 codes), 9,000+ CCSA tariff codes, 27 modifiers, NAPPI format, BHF codes, EDI format |
| 04 | `04_pmb_and_cdl.md` | **PMBs** | 270 DTPs in 15 categories, 27 CDL with ALL subcodes + treatment algorithms + formulary, emergency rules, PMB case law, 8-step AI flagging |
| 05 | `05_scheme_profiles.md` | **Schemes** | Discovery, Bonitas, GEMS, Momentum, Medihelp, Bestmed — rules, contacts, rejection codes. 3 switches, 28 routes, 12-step lifecycle |
| 06 | `06_pharmaceutical.md` | **Pharma** | NAPPI spec, SEP formula, dispensing fees (4 tiers), schedules S0-S8, DUR 6-check engine, generic substitution, chronic workflow, formulary tiers |
| 07 | `07_fraud_detection.md` | **Fraud** | R22-28B breakdown, 8 fraud types, detection algorithms (peer comparison, Benford's, time impossibilities), Medscheme ML, racial bias safeguards |
| 08 | `08_compliance.md` | **Compliance** | POPIA full checklist, SAHPRA SaMD decision tree, ISO 13485, cross-border AI transfer rules, data retention, 30/90/365-day action matrix |
| 09 | `09_industry_landscape.md` | **Industry** | Altron, Medscheme, Discovery tech, CareOn, hospital IT, PMS market, global tech, startups, academic research |
| 10 | `10_market_intelligence.md` | **Market** | R259B market, 76 schemes, competitive landscape, investor targets, NHI policy, government strategy, key contacts |
| 12 | `12_commercial_intelligence.md` | **Commercial** | SLAs, PMS vendor contracts, insurance (PI/cyber), BEE/ICT sector codes, CIPC, SaaS pricing models, DPA/operator agreements, cloud hosting, tender processes, MediKredit accreditation, go-to-market checklist |

---

## KEY STATISTICS

| Metric | Value |
|--------|-------|
| Total claims market | R259.3 billion/year |
| Medical scheme beneficiaries | 9.17 million (16% of population) |
| Registered schemes | 76 (16 open, 55 restricted) |
| Industry rejection rate | 15-20% |
| #1 rejection cause | Incorrect/missing ICD-10 (30%) |
| ICD-10 coding accuracy | 74% |
| Healthcare fraud losses | R22-28 billion/year |
| Members denied claims (out-of-pocket) | R40 billion/year |
| PMB appeals won by members | 69.4% |
| Discovery auto-adjudication | 78% (FICO Blaze Advisor) |
| Altron switching volume | 99.8M transactions/year |
| SA Healthcare IT market | $2.76B → $5.71B by 2034 |

## KEY DATES

| Date | Event |
|------|-------|
| 27 Feb 2026 | POPIA Health Regulations in force (NO grace period) |
| 5-7 May 2026 | NHI ConCourt hearing |
| 1 June 2026 | Bonitas → Momentum Health admin transfer |
| Sept 2026 | Azure FHIR SA retirement |
| 1 April 2028 | SAHPRA ISO 13485 deadline |
| ~2035 | NHI full implementation |

## DEPLOYMENT

| Project | Location |
|---------|----------|
| Visio Workspace (Steinberg KB) | `steinberg/openai/health_kb/` (source of truth) |
| HealthOps Platform | `docs/knowledge/` |
| Netcare Health OS | `docs/knowledge/` |
