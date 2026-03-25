# VisioCorp Health Intelligence Knowledge Base
## Master Index — Compiled 2026-03-21
## 21 Research Agents | 4 Waves | 1,000+ Sources | 5MB Raw Research

---

## PURPOSE
This knowledge base gives VisioCorp AI agents (Steinberg, Claims Analyzer, HealthOps, Netcare Health OS) end-to-end understanding of the SA healthcare claims ecosystem — the law, the codes, the schemes, the tech, the fraud patterns, and the compliance requirements.

## HOW TO USE
- **Before ANY claims work**: Read files 01-06, 13, 22 (clinical guidelines + human reasoning patterns)
- **Before building features**: Read files 07-08
- **Before building practice management software**: Read file 19
- **Before telehealth/digital health/WhatsApp/payment features**: Read file 16
- **Before sales/pitch work**: Read files 09-10, 21
- **Before enterprise/partnership meetings**: Read file 21 (benchmarks, financials, compliance)
- **Before clinical validation/formulary work**: Read file 13
- **Before NHI/DRG/capitation work**: Read file 17
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
| 14 | `14_rejection_patterns.md` | **Rejections & Prediction** | Rejection rates by scheme/discipline/cause, ICD-10/tariff rejection triggers, seasonal patterns, ML prediction features (35 engineered), auto-correction tiers, clean claim benchmarks, financial impact, training data requirements |
| 15 | `15_fhir_implementation.md` | **FHIR/Interop** | SA FHIR profiles (none published — opportunity), NHI HPRS/Fund IT, FHIR R4 claims flow, SA extensions (SA ID, BHF, NAPPI, ICD-10-ZA), EDIFACT bridge, switching house timeline, OpenHIE/DHIS2, terminology bindings, SMART on FHIR, VisioCorp FHIR Hub architecture |
| 17 | `17_nhi_readiness.md` | **NHI Readiness** | NHI Fund IT architecture (CSIR/OpenHIE/HPRS), DRG payment model (AR-DRG likely), DRG calculation & pricing, capitation model (70/20/10 split), risk adjustment, OHSC certification (40% compliance), ConCourt challenge (May 2026), EDIFACT→FHIR transition, switching house futures, dual-mode claims engine, VisioCorp NHI readiness checklist |
| 13 | `13_clinical_guidelines.md` | **Clinical Guidelines** | SA clinical treatment guidelines for claims validation: SEMDSA diabetes (step therapy metformin→SU→DPP4i→SGLT2i→insulin), SASHA hypertension (ACE-i/ARB/CCB/thiazide step-up), SATS/GINA asthma (ICS step 1-5), DoH ART 2023 (TLD first-line, VL monitoring), TB (2HRZE/4HR + DR-TB), mental health (SSRI first-line), antibiotic stewardship (AWaRe classification, first-line by infection), CKD (eGFR staging, SGLT2i), dyslipidaemia (LDL targets, statin tiers), STG/EML 2024 structure, claims validation decision matrix |
| 18 | `18_scheme_pricing_comparison.md` | **Sales Intel** | What 6 major schemes pay for same procedures: consultation rates (GP/specialist/after-hours/telehealth), procedure rates (ECG/spirometry/pathology/radiology/dental), benefit limits (day-to-day/dental/optometry/physio/psych/chronic), payment behavior (days-to-pay/rejection rates/co-payments/clawbacks/PMB compliance), DSP network sizes, scheme financial health, revenue optimization by scheme |
| 20 | `20_ehr_clinical_standards.md` | **EHR/Clinical** | HPCSA Booklet 9 record requirements (18 elements), medico-legal documentation, informed consent (Booklet 4), referral letter standards, sick note/prescription requirements, pathology/radiology request forms, EHR minimum dataset (HPRS-aligned), ICD-10 auto-suggest workflow, allergy/medication/problem list management, EPI-SA immunisation schedule, growth charts (WHO z-scores), HL7 v2/FHIR interoperability, TIER.Net/HIV-TB integration, maternal/child health tracking (MCR/RTH), multi-language support, offline-first architecture, CHW data capture, RBAC role matrix, break-the-glass access, audit trails, POPIA de-identification, consent management |
| 19 | `19_practice_workflows.md` | **Practice Ops** | End-to-end workflows: GP patient journey (arrival→billing→payment→reconciliation), specialist referral/pre-auth/hospital admission, dental billing (FDI tooth numbering, SADA codes, surface notation), pharmacy dispensing (chronic 28-day cycle, S5/S6 controls, generic substitution), allied health (physio/psych session limits), practice admin (EOD reconciliation, monthly reporting, debt collection, January renewal chaos), staff roles (reception/practice manager/billing clerk/clinical), PMS market, claim lifecycle state machine, software integration points |
| 21 | `21_enterprise_benchmarks.md` | **Benchmarks & Intel** | Enterprise benchmarks, competitive analysis, Netcare financials (R25.5B revenue, R400-550M bad debt, 58-63 debtor days), claims rejection data across 15 SA industries, interoperability standards, compliance readiness (10 documents ready), AI model chain (7 layers), 557K knowledge base details, revenue cycle coverage (12/14 stages), financial impact projections (R89M/year), SaaS pricing model, legal framework |
| 22 | `22_sa_claims_reasoning_patterns.md` | **Human Reasoning** | How SA GPs, billing clerks, and scheme adjudicators actually think and reason when processing claims. GP clinical reasoning, ICD-10 coding workflow, consultation code selection, clerk translation patterns, 12 common clerk mistakes, rejection handling psychology, adjudication pipeline, false positive prevention, scope matrices, decision frameworks. |
| 16 | `16_telehealth_digital.md` | **Telehealth/Digital** | Telehealth tariff codes (0190-0192 video, 0130 telephonic, 0197 virtual), rate comparison (telehealth 30-40% lower), scheme-specific rules (Discovery DrConnect, GEMS, Bonitas WhatsUpDoctor, Momentum Hello Doctor), after-hours modifiers (0148/0149), prescriptions by schedule (S0-S4 yes, S5 restricted, S6+ no), e-prescribing workflow (ECT Act), documentation checklist, RPM (no SA billing code), AI triage (not billable), digital mental health (12-15 sessions/year), WhatsApp in healthcare (HPCSA/POPIA rules), patient payment collection (Yoco/Paystack/gap cover), medical debt (3-year prescription), COVID legacy (5,708% telehealth growth, permanent HPCSA changes), regulatory framework summary |

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
