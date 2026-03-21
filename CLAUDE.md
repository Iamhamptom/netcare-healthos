# Netcare Health OS — AI Agent Protocol

## Project
- Next.js, TypeScript, Prisma, Supabase
- 247 pages, 153 API routes, 39 Prisma models, 60K+ lines
- 6 AI Products: CareOn Bridge, FHIR Hub, Switching Engine, Healthbridge Claims, Claims Analyzer, WhatsApp

## Health Claims Knowledge Base (300MB)
This project has a comprehensive health intelligence KB at `docs/knowledge/`:

### Compiled Intelligence (13 files)
- `01_law_and_regulation.md` — Medical Schemes Act (verbatim s59), POPIA 2026, HPCSA AI, SAHPRA, NHI
- `02_claims_adjudication.md` — Full decision flowchart, 25 rejection codes, benefit routing
- `03_coding_standards.md` — ICD-10 (41K codes), 9K+ tariff codes, 27 modifiers, NAPPI, EDI
- `04_pmb_and_cdl.md` — 270 DTPs, 27 CDL with ALL subcodes + treatments, emergency rules
- `05_scheme_profiles.md` — Discovery, Bonitas, GEMS, Momentum, Medihelp, Bestmed + 3 switches
- `06_pharmaceutical.md` — NAPPI spec, SEP formula, dispensing fees, DUR engine, chronic workflow
- `07_fraud_detection.md` — R22-28B problem, 8 fraud types, detection algorithms, bias safeguards
- `08_compliance.md` — POPIA checklist, SAHPRA SaMD, ISO 13485, cross-border AI rules
- `09_industry_landscape.md` — Vendors, tech, hospitals, startups, academic research
- `10_market_intelligence.md` — Competitive landscape, investors, contacts
- `11_business_intelligence.md` — Vendor accreditation, competitor pricing, TAM, channels
- `12_commercial_intelligence.md` — Contracts, SLAs, insurance, BEE, procurement

### Databases (docs/knowledge/databases/)
- `ICD-10_MIT_2021.csv` — 41,009 diagnosis codes with validation flags (Valid_Primary, Asterisk, Dagger, Age, Gender)
- `medicine_prices.csv` — 9,985 products with SEP prices, dispensing fees, ingredients
- `GEMS_tariffs_2026.csv` — 4,660 procedure rates per discipline

### Extracted Law & Specs (docs/knowledge/extracted/)
Full text of Medical Schemes Act (44 pages), Regulations + Annexure A (103 pages), PHISC MEDCLM spec (51 pages), HPCSA AI Booklet 20, SAHPRA AI/ML, Section 59 investigation (227 pages), Discovery CDL formulary, GEMS DRP (10,327 drug prices), GEMS Formulary (5,278 entries), CMS Industry Report 2024

### Source Data (steinberg/openai/health_kb/raw_data/ in workspace)
- NAPPI Active: 487,086 medicine records
- 67 source PDFs (legislation, scheme rules, coding standards)

### Key Rules for Claims Engine Development
- ICD-10: SA uses WHO ICD-10, NOT US ICD-10-CM. MIT has 36 columns including Valid_ICD10_Primary
- Tariff: SA uses 4-digit CCSA codes, NOT American CPT. No national tariff since 2010
- NAPPI: 7-digit product + 3-digit pack suffix. No check digit. Weekly updates from MediKredit
- Switching: 3 houses (Healthbridge, SwitchOn, MediKredit). EDIFACT MEDCLM v0-912-13.4
- PMBs: Must pay in full at DSP. Override waiting periods + benefit limits. 270 DTPs + 27 CDL
- Rejection #1 cause: Incorrect/missing ICD-10 (30% of all rejections)
- POPIA 2026: Health regs in force, NO grace period. Cross-border AI = s72 compliance
- Fraud: R22-28B/year. 50% is waste (clinical appropriateness), not fraud
- SAHPRA: Claims validation AI is generally NOT SaMD if admin-only. May be SaMD if making clinical decisions
