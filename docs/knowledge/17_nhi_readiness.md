# 17 — NHI Readiness: Technical Architecture, DRG/Capitation & Transition Planning
## VisioCorp Health Intelligence KB | Compiled 2026-03-21

---

## TABLE OF CONTENTS

1. [NHI Act Overview & Legal Status](#nhi-act-overview--legal-status)
2. [NHI Fund IT System Architecture](#nhi-fund-it-system-architecture)
3. [Health Patient Registration System (HPRS)](#health-patient-registration-system-hprs)
4. [Central Beneficiary Registry](#central-beneficiary-registry)
5. [Provider Registry & Accreditation](#provider-registry--accreditation)
6. [NHI Claims Management System](#nhi-claims-management-system)
7. [NHI Fraud Detection — AI/ML Requirements](#nhi-fraud-detection--aiml-requirements)
8. [DRG Payment Model](#drg-payment-model)
9. [DRG Calculation Methodology](#drg-calculation-methodology)
10. [DRG Pricing & Case-Mix Index](#drg-pricing--case-mix-index)
11. [Impact on Providers & Claims Systems](#impact-on-providers--claims-systems)
12. [International DRG Lessons](#international-drg-lessons)
13. [Capitation Model — Primary Care](#capitation-model--primary-care)
14. [Risk Adjustment in Capitation](#risk-adjustment-in-capitation)
15. [Capitation Data Systems & PMS Requirements](#capitation-data-systems--pms-requirements)
16. [Quality Metrics & Pay-for-Performance](#quality-metrics--pay-for-performance)
17. [Transition Planning & Timeline](#transition-planning--timeline)
18. [Medical Schemes — Complementary Cover Transition](#medical-schemes--complementary-cover-transition)
19. [Switching Houses Under NHI](#switching-houses-under-nhi)
20. [EDIFACT to FHIR Transition](#edifact-to-fhir-transition)
21. [OHSC Certification](#ohsc-certification)
22. [VisioCorp NHI Readiness Checklist](#visiocorp-nhi-readiness-checklist)

---

## NHI ACT OVERVIEW & LEGAL STATUS

### The Act
- **National Health Insurance Act 20 of 2023** — signed by President Ramaphosa on 15 May 2024
- Creates a **single-payer NHI Fund** — all South Africans entitled to healthcare services purchased by the Fund
- Medical schemes restricted to **complementary cover only** (services NOT covered by NHI)
- Makes it **illegal** for medical aids to cover the same services as the NHI Fund

### Constitutional Challenge (CRITICAL — March 2026)
- **ConCourt hearing: 5-7 May 2026**
- 12+ constitutional challenges pending from Health Funders Association, Medical Association, BHF, Private Practitioners Forum, Hospital Association, Western Cape government, trade unions
- Primary challenge: inadequate **public participation** process before signing
- **President Ramaphosa and Minister Motsoaledi agreed to delay proclamation** of any sections until ConCourt judgment
- All NHI-related litigation **halted** pending ConCourt ruling (court order, Feb 2026)
- **Outcome possibilities**: Act upheld, sections struck down, sent back for public participation, or entire Act invalidated
- **For tech vendors: build NHI-ready regardless** — even if delayed, the direction is clear

### Implementation Phases (Per NHI White Paper & Act)
| Phase | Period | Focus |
|-------|--------|-------|
| Phase 1 | 2012-2017 | Pilot NHI districts, strengthen public health |
| Phase 2 | 2017-2022 | Establish NHI Fund, develop payment mechanisms |
| Phase 3 | 2023-2026 | Operationalise Fund, begin contracting, mandatory prepayments |
| Full Implementation | ~2028-2035 | Universal coverage, all providers contracted |

**Reality check (March 2026):** Phase 3 is behind schedule. No NHI Fund board appointed. No CEO hired. No provider contracts signed. HPRS not at scale. ConCourt challenge pending.

---

## NHI FUND IT SYSTEM ARCHITECTURE

### What the Act Requires (Sections 36-42)
The NHI Fund must build or procure:

| System | Purpose | Act Reference |
|--------|---------|---------------|
| **Beneficiary Registry** | Register all SA residents as NHI beneficiaries | s5, s9 |
| **Provider Registry** | Register and accredit all contracted providers | s39 |
| **Claims Management** | Process and pay claims from contracted providers | s40 |
| **Fraud Management** | Detect and prevent fraudulent claims | s41 |
| **Health Information System** | Collect, store, analyse health data | s42 |
| **Payment System** | Execute DRG, capitation, and fee-for-service payments | s37-38 |
| **Benefits Management** | Define and manage the benefits package | s7 |
| **Referral System** | Manage patient referral pathways | s8 |

### CSIR Role — Digital Systems Development
- The **CSIR (Council for Scientific and Industrial Research)** is the primary technology partner
- CSIR developed the **HPRS** (Health Patient Registration System)
- CSIR developed the **EVDS** (Electronic Vaccine Data System) — proved scalable during COVID-19
- CSIR uses **OpenHIE architecture** — open-source health information exchange framework
- Key components: OpenHIM (Health Information Mediator), OpenMRS, DHIS2

### National Digital Health Strategy 2019-2024
- Mandates **HL7 FHIR** as the interoperability standard
- Mandates **ICD-10** (WHO version) for diagnosis coding
- Mandates **NAPPI** for pharmaceutical coding
- Establishes **Health Normative Standards Framework (HNSF)** for all digital health systems
- Requires **Master Patient Index (MPI)** — implemented via HPRS
- Cloud-first approach but must comply with POPIA cross-border transfer rules

### RFPs and Procurement Status (March 2026)
- **No major IT system RFPs have been publicly issued** for the NHI Fund's core systems
- The NHI Fund itself is not yet operationally constituted (no board, no CEO)
- CSIR continues development of foundational systems (HPRS, interoperability layer)
- Budget 2025/26: Healthcare infrastructure investment includes digital modernisation, but specific NHI IT allocations remain unclear
- **Black Book 2026 SA EHR Report** identifies 7 watchlist items: NHI sequencing, HPRS data quality, interoperability enforcement, cybersecurity maturity, exchange model evolution, AI governance, infrastructure reliability

### Architecture Implications for VisioCorp
1. **FHIR-first**: All systems must speak HL7 FHIR R4 — VisioCorp FHIR Hub is ahead of market
2. **HPRS integration**: Must be able to look up and validate patients against the Master Patient Index
3. **OpenHIE compatible**: Systems should integrate with OpenHIM mediator layer
4. **ICD-10 + NAPPI**: Coding standards remain unchanged — existing VisioCorp coding engines are NHI-ready
5. **Dual-mode operation**: Must support current medical scheme claims AND future NHI Fund claims simultaneously

---

## HEALTH PATIENT REGISTRATION SYSTEM (HPRS)

### Overview
- Developed by **CSIR** for the National Department of Health
- Live at **hprs.health.gov.za**
- Purpose: Create a **unified digital identity** for every healthcare user in South Africa
- Assigns a unique **Health Patient Registration Number (HPRN)** — 10-digit system-generated identifier
- Links to SA ID number, passport number, asylum permit, refugee permit, or driver's licence

### Scale (Latest Available Data)
- **57+ million South Africans registered** (by mid-2022)
- Deployed across **3,111+ health facilities** (primarily public sector)
- Functions as both **Patient Registry** and **Master Patient Index (MPI)**

### Technical Architecture
- Built on **OpenHIE** stack
- Uses **OpenHIM** (Health Information Mediator) as the interoperability layer
- **FHIR-based** Master Household Index links patient data across systems
- Cross-references multiple identifier types (SA ID, passport, etc.)
- Integrates with **DHIS2** for health information reporting

### Current Limitations
- Not yet at full scale — **not fully integrated** with facility-specific systems (e.g., Tier.net for HIV)
- Data quality issues — duplicate registrations, incomplete demographic data
- Limited private sector integration — primarily deployed in public facilities
- No published API documentation for third-party integration
- Bandwidth and connectivity issues in rural facilities

### Integration Strategy for VisioCorp
- Build **HPRS lookup capability** — validate patient identity against MPI before claims
- Support **HPRN** as a patient identifier alongside SA ID
- Implement **patient matching algorithms** (probabilistic matching for records without HPRN)
- Prepare for **FHIR Patient resource** exchange with HPRS
- Monitor for CSIR to publish API specifications

---

## CENTRAL BENEFICIARY REGISTRY

### How Beneficiaries Will Be Identified
- The **HPRS national patient registry** becomes the **source of the NHI Beneficiary Registry**
- Every SA resident is entitled to NHI benefits — no opt-in required
- Identification via: SA ID number, HPRN, or alternative legal identification
- Children, undocumented persons, refugees, asylum seekers — all covered (Act s4)

### Registration Process (Proposed)
1. Patient visits any accredited facility
2. Facility registers patient on HPRS (if not already registered)
3. HPRS assigns/retrieves HPRN
4. Patient attributed to a primary care provider (for capitation)
5. All subsequent claims linked to HPRN

### Technical Requirements
- **Real-time MPI lookup** at point of care
- **Biometric verification** (planned but not yet implemented)
- **Population attribution** — linking patients to contracted providers
- **De-duplication** across multiple registration points
- **Offline capability** — many rural facilities have intermittent connectivity

---

## PROVIDER REGISTRY & ACCREDITATION

### NHI Act Requirements (s39)
- All providers must be **accredited by the NHI Fund** to receive payments
- Accreditation requires **OHSC certificate of compliance** (see OHSC section below)
- Providers must meet **quality, service delivery, and reporting standards**
- Both public and private providers can be contracted

### Credentialing System (Proposed)
| Requirement | Detail |
|-------------|--------|
| OHSC certification | Valid 4-year certificate of compliance |
| HPCSA/SANC registration | Professional registration verified |
| Practice registration | PCNS number active |
| Tax compliance | SARS tax clearance |
| BEE status | BEE verification certificate |
| Digital readiness | Electronic claims submission capability |
| Quality reporting | Ability to submit quality indicators |

### Provider Categories Under NHI
| Level | Provider Type | Payment Model |
|-------|--------------|---------------|
| Primary care | GPs, clinics, CHCs | **Capitation** (70%) + fee-for-service (20%) + performance (10%) |
| District hospital | General hospital | **Global budget** or **DRG** |
| Regional hospital | Specialist services | **DRG** |
| Tertiary/Central | Academic hospitals | **DRG** with teaching supplement |
| Specialist | Private specialists | **Fee-for-service** (NHI tariff) |
| Emergency | All accredited facilities | **Fee-for-service** (emergency tariff) |

---

## NHI CLAIMS MANAGEMENT SYSTEM

### What Needs to Be Built
The NHI Fund requires a claims management system capable of:

1. **Receiving claims** from all contracted providers (public + private)
2. **Validating claims** against beneficiary registry, provider registry, and benefits package
3. **Adjudicating claims** using DRG grouper (hospitals), capitation rules (primary care), or fee schedule (specialists)
4. **Detecting fraud** in real-time (see fraud section)
5. **Processing payments** within statutory timeframes
6. **Reporting** on utilisation, costs, quality outcomes

### Technology Direction
- **FHIR-based claims** — the Act mandates HL7 FHIR for data exchange
- Current SA claims use **PHISC EDIFACT MedClm format** — transition period required
- Must handle **50M+ beneficiaries** and potentially **500M+ transactions/year**
- Needs to process both **DRG-based hospital claims** and **capitation reconciliation**
- Must integrate with **National Treasury** payment systems

### Current Procurement Status (March 2026)
- **No claims management system RFP issued**
- No technology vendor selected
- CSIR building foundational infrastructure but claims engine not yet in scope
- Likely to be a **major multi-year procurement** — comparable to Australia's Medicare Claims System or UK's NHS Secondary Uses Service
- Private sector switching infrastructure (MediKredit, Healthbridge, MediSwitch) may be leveraged or contracted

---

## NHI FRAUD DETECTION — AI/ML REQUIREMENTS

### Scale of the Problem
- SA healthcare fraud: **R22-28 billion/year** (see 07_fraud_detection.md)
- NHI single-payer creates **single point of fraud risk** — all claims flow through one fund
- DRG systems are particularly vulnerable to **upcoding** (assigning higher-paying DRG)

### AI/ML Capabilities Required
| Capability | Purpose |
|------------|---------|
| **Real-time scoring** | Score every claim at submission for fraud probability |
| **Pattern detection** | Identify unusual billing patterns across providers |
| **Upcoding detection** | Flag DRG assignments inconsistent with clinical documentation |
| **Network analysis** | Detect collusion between providers, patients, and suppliers |
| **Peer comparison** | Compare provider billing to specialty/geography peers |
| **Benford's Law** | Detect unnatural digit distributions in billing amounts |
| **Time impossibility** | Flag physically impossible service timelines |
| **Duplicate detection** | Identify duplicate claims across providers |

### Racial Bias Safeguards (CRITICAL)
- Section 59 Investigation (2025) found **systemic racial discrimination** in FWA investigations
- Any NHI fraud system MUST implement:
  - **Bias testing** before deployment
  - **Demographic parity** monitoring
  - **No location-based scoring** that proxies for race
  - **Audit trails** for all automated decisions
  - **Human review** for high-impact decisions

### SA-Specific Challenges
- Government IT capacity is limited — **shortage of data scientists** in public sector
- POPIA constrains **cross-border AI processing** — models must be hosted locally or data de-identified
- Need for **partnerships** with universities, tech companies (opportunity for VisioCorp)
- Models must handle **ICD-10 WHO version** (not US ICD-10-CM)

---

## DRG PAYMENT MODEL

### What DRG System Is SA Adopting?
- The NHI Act (s37-38) mandates **DRG-based payment for hospitals** but does NOT specify which DRG system
- SA will likely adopt a **localised version** based on an international standard — options:

| System | Origin | Used By | Likelihood for SA |
|--------|--------|---------|-------------------|
| **AR-DRG** | Australia | Australia, NZ, Ireland, several LMICs | **HIGH** — most adopted by developing countries, ICD-10 based |
| **G-DRG** | Germany | Germany, Austria | Medium — complex, requires extensive cost data |
| **NordDRG** | Nordic | Scandinavia, Estonia, Latvia | Low — small population optimised |
| **MS-DRG** | USA | USA | Low — ICD-10-CM based (SA uses WHO ICD-10) |
| **Custom SA-DRG** | SA | Proposed | Possible — could build on AR-DRG with local adaptations |

### Why AR-DRG Is Most Likely
1. **ICD-10 based** — SA already uses WHO ICD-10 (AR-DRG uses ICD-10-AM, the Australian Modification)
2. **Proven in LMICs** — Iran piloted using AR-DRG; Indonesia adapted it
3. **Open documentation** — Australian IHPA publishes extensive technical guides
4. **CSIR alignment** — CSIR has historically referenced Australian digital health models
5. **WHO recommendation** — WHO guidance points to AR-DRG as suitable for developing countries

### How DRGs Work — Core Concept
A DRG groups hospital admissions into **clinically meaningful categories** with **similar resource consumption**:

```
Patient Admission → DRG Assignment → Fixed Payment
(not per-service billing)
```

**Key shift**: Hospital receives ONE payment per admission, not payment for each individual service rendered.

---

## DRG CALCULATION METHODOLOGY

### How a DRG Is Assigned

```
Step 1: Principal Diagnosis (ICD-10 code)
  → Assigns to a Major Diagnostic Category (MDC)

Step 2: Procedures Performed (procedure codes)
  → Splits into Medical vs Surgical partition

Step 3: Complications & Comorbidities (CC)
  → Severity level adjustment

Step 4: Patient Demographics
  → Age, sex, discharge status adjustments

Step 5: DRG Assignment
  → Final DRG code with cost weight
```

### AR-DRG Example (Version 11.0)
- **26 Major Diagnostic Categories** (MDCs) based on body system
- **~800 DRG codes** in total
- Each DRG has a **cost weight** (relative to average admission)
- **Inlier bounds**: expected length of stay range
- **Outlier payments**: additional payment for unusually long stays

### Data Requirements for DRG Assignment
| Data Element | Source | SA Readiness |
|-------------|--------|--------------|
| Principal diagnosis (ICD-10) | Clinical record | **74% accuracy** (SAMJ 2017) — MAJOR CONCERN |
| Secondary diagnoses | Clinical record | **45% completeness** — CRITICAL GAP |
| Procedure codes | Clinical record | Limited standardisation |
| Age, sex | Patient registration | Available via HPRS |
| Length of stay | Admission/discharge system | Available in hospital systems |
| Discharge status | Clinical record | Inconsistently recorded |
| Birth weight (neonates) | Clinical record | Available |

### SA's ICD-10 Coding Crisis
- **74% accuracy** and **45% completeness** in diagnosis coding (SAMJ 2017)
- DRG systems REQUIRE **>95% accuracy** to function correctly
- **Massive upskilling needed**: clinical coders, clinician documentation improvement
- **AI-assisted coding** (VisioCorp opportunity) could bridge the gap
- Without coding improvement, DRG payments will be systematically wrong

---

## DRG PRICING & CASE-MIX INDEX

### How Payment Amounts Are Determined

```
DRG Payment = Base Rate × Cost Weight × Adjustment Factors

Where:
- Base Rate = national average cost per admission (set by NHI Fund annually)
- Cost Weight = DRG-specific relative cost (e.g., hip replacement = 3.2, appendectomy = 1.1)
- Adjustments = teaching hospital, rural, complexity, outlier
```

### Case-Mix Index (CMI)
- **CMI = average cost weight** of all cases treated by a hospital
- Higher CMI = more complex/expensive case-mix
- Used to **benchmark hospitals** and adjust global budgets
- Formula: `CMI = Sum of all DRG weights / Total number of cases`

| Example CMI | Meaning |
|-------------|---------|
| 0.8 | Below-average complexity (community hospital) |
| 1.0 | Average complexity |
| 1.5 | Above-average (regional hospital) |
| 2.0+ | High complexity (tertiary/teaching hospital) |

### Implications for Hospital Reimbursement
- Hospitals with higher CMI receive proportionally more funding
- **Upcoding risk**: hospitals may assign higher-severity DRGs to increase revenue
- **Cherry-picking risk**: hospitals may prefer simple cases (lower cost, standard DRG payment)
- **Cost containment**: DRG incentivises efficiency — treat within budget or absorb the loss
- **Quality risk**: pressure to discharge early to reduce costs

### Price-Setting Process (Not Yet Established)
1. **Cost study** — NHI Fund must conduct national hospital cost study
2. **Relative weights** — calculate cost weights for each DRG from cost data
3. **Base rate** — set national base rate from total hospital budget
4. **Annual update** — adjust base rate for inflation, policy changes
5. **Outlier policy** — define thresholds for additional payments

**SA has NOT conducted a national hospital cost study.** This is a multi-year prerequisite.

---

## IMPACT ON PROVIDERS & CLAIMS SYSTEMS

### What Changes for Providers

| Current (Fee-for-Service) | Future (DRG) |
|---------------------------|--------------|
| Bill per service rendered | One payment per admission |
| Itemised claim (procedures, consumables, bed days) | Single DRG code claim |
| Revenue = volume × price | Revenue = case-mix × base rate |
| Incentive: do more | Incentive: be efficient |
| Coding optional beyond primary diagnosis | Coding accuracy = revenue |
| Claims = line items | Claim = DRG + supporting clinical data |

### How DRG Affects Claims Processing Systems

**Current EDIFACT/MedClm claim structure:**
```
Claim Header → Multiple Service Lines → Each with ICD-10 + tariff code + amount
```

**Future DRG claim structure:**
```
Claim Header → Single DRG Code → Supporting: principal diagnosis + procedures + CCs + demographics
(Amount is CALCULATED from DRG, not stated by provider)
```

### System Changes Required
1. **DRG Grouper** — software that assigns DRG from clinical data (must be built or licensed)
2. **Clinical Documentation Improvement (CDI)** — ensure complete coding at discharge
3. **DRG Validator** — check that submitted DRG matches clinical documentation
4. **Cost accounting** — hospitals must track costs per case (not just per department)
5. **Dual-mode billing** — support FFS for medical schemes AND DRG for NHI simultaneously
6. **Outlier management** — identify and manage high-cost outlier cases

### VisioCorp Opportunity
- **AI-powered DRG coding assistant** — suggest correct DRG from clinical notes
- **DRG validation engine** — check coding accuracy before claim submission
- **CDI tools** — flag missing diagnoses/procedures that affect DRG assignment
- **Cost-per-case analytics** — help hospitals understand profitability by DRG
- **Dual-mode claims engine** — submit to both medical schemes (EDIFACT) and NHI Fund (FHIR/DRG)

---

## INTERNATIONAL DRG LESSONS

### Australia (AR-DRG) — Gold Standard for SA
- **Implementation**: Phased over 10+ years (1990s-2000s)
- **Key success**: Built broad "casemix community" — clinicians, coders, administrators all trained
- **Education first**: Substantial investment in stakeholder education BEFORE implementation
- **Data collection**: Years of cost data collection before setting weights
- **IHPA** (Independent Hospital Pricing Authority) manages the system independently
- **Lesson for SA**: Don't rush — invest in coding capacity and cost data first

### UK (HRG — Healthcare Resource Groups)
- **NHS version of DRG** — ~2,500 HRGs (more granular than AR-DRG)
- **Payment by Results (PbR)** introduced 2003-2004
- **Key lesson**: National tariff must be updated annually based on actual cost data
- **Quality safeguard**: CQUIN (Commissioning for Quality and Innovation) payments for quality metrics
- **Lesson for SA**: Link DRG payments to quality indicators to prevent gaming

### Germany (G-DRG)
- **Most granular system**: ~1,300 DRGs
- **InEK** (Institute for Hospital Payment) manages — independent of payer and provider
- **Annual updates** based on comprehensive cost data from ~250 hospitals
- **Key feature**: Nursing care separated from DRG in 2020 (paid separately)
- **Lesson for SA**: Nursing costs need special consideration in under-resourced settings

### Low- and Middle-Income Countries
- **Iran**: Piloted AR-DRG — faced data quality issues (30% of records had only one diagnosis)
- **Indonesia**: Developed custom UNU-CBG system — adapted imported grouper to local context
- **Kyrgyzstan**: 25+ years of reform — gains only materialised when applied to ALL cases under single payer
- **Thailand**: DRG used since 2002 — key driver of universal coverage success
- **Key barriers in LMICs**:
  - Lack of open-source, low-cost groupers
  - Poor clinical documentation
  - Insufficient cost data
  - Shortage of trained clinical coders
  - IT infrastructure gaps

### Critical Lessons for SA
1. **Coding accuracy must come FIRST** — DRG without accurate coding = random payments
2. **Pilot extensively** — test in select hospitals before national rollout
3. **Independent pricing authority** — DRG management must be independent of both NHI Fund and providers
4. **Cost data collection** — minimum 3-5 years of good cost data needed before setting weights
5. **Open-source grouper** — avoid vendor lock-in, enable local adaptation
6. **Clinician engagement** — doctors must understand how documentation affects payment

---

## CAPITATION MODEL — PRIMARY CARE

### How NHI Capitation Will Work for GPs

**Core concept**: Provider receives a **fixed monthly payment per registered patient**, regardless of how many services are delivered.

### Proposed Payment Split
| Component | Allocation | Description |
|-----------|-----------|-------------|
| **Capitation** | **70%** of resource envelope | Fixed per-patient-per-month payment |
| **Fee-for-service** | **20%** | Medicines, investigations, procedures, preventive services |
| **Performance** | **10%** | Quality and outcome-based bonus payments |

### GP Contracting Structure
- **Community Practice Contract** between NHI Fund and "Accountable Doctor"
- **Panel size**: 2,000 (minimum) to 10,000 (maximum) patients per Accountable Doctor
- Minimum starting panel: 2,000 patients (~40 patients/day)
- **Minimum team**: 1 doctor + 5 nurses/clinical associates + 10 community health workers per 10,000 patients

### Service Package Included in Capitation
- Consultations (in-person and telehealth)
- Basic diagnostics (point-of-care testing)
- Chronic disease management
- Preventive care and screening
- Health promotion and education
- Referral management
- Minor procedures
- Maternal and child health services
- Mental health (primary level)

### Pilot Sites (Active as of 2025-2026)
- **9 national pilot sites** testing capitation-based funding
- **Phokwane Local Municipality** (Northern Cape) — includes Hartswater and surroundings
- Pilots testing: patient registration, attribution, capitation calculation, quality measurement
- Results informing national rollout design

---

## RISK ADJUSTMENT IN CAPITATION

### Why Risk Adjustment Matters
Without risk adjustment, providers serving sicker populations receive the same payment as those serving healthy populations — leading to:
- **Cherry-picking**: avoiding high-risk patients
- **Under-service**: providing fewer services to stay within budget
- **Provider flight**: abandoning high-burden areas

### SA's Proposed Risk Adjustment Factors

| Factor | Phase | Rationale |
|--------|-------|-----------|
| **Age** | Year 1 | Older patients cost more |
| **Gender** | Year 1 | Women (reproductive health) cost more at certain ages |
| **Social deprivation** | Year 1 | Poverty correlates with disease burden |
| **Rurality** | Year 1 | Rural areas have higher delivery costs |
| **Morbidity** | Year 2+ | Actual disease burden once data collected |

### Data Requirements for Risk Adjustment
1. **Complete patient registration** — accurate demographics for every registered patient
2. **Disease registry** — diagnosis data for chronic conditions (HIV, diabetes, hypertension, TB)
3. **Utilisation data** — service volumes per patient per period
4. **Socioeconomic indicators** — deprivation index per area
5. **Geographic classification** — urban/peri-urban/rural/deep rural
6. **Mortality data** — death registration linked to patient registry

### Challenge: Morbidity Data
- SA lacks comprehensive **primary care morbidity data** — most ICD-10 coding happens at hospital level
- Current primary care systems (DHIS2) capture **aggregate data**, not individual patient diagnoses
- **HPRS + electronic health records** needed to generate patient-level morbidity profiles
- Morbidity adjustment deferred to Year 2+ of capitation — once valid data is collected

---

## CAPITATION DATA SYSTEMS & PMS REQUIREMENTS

### What Practice Management Systems Must Support

| Capability | Current PMS | NHI-Ready PMS |
|------------|-------------|---------------|
| Patient registration | Basic demographics | HPRS integration + HPRN |
| Patient attribution | Not applicable | Panel management — who is registered with this practice |
| Billing | Fee-for-service claims | Capitation reconciliation + FFS component |
| Clinical coding | ICD-10 (basic) | Complete ICD-10 for morbidity profiling |
| Quality reporting | None | Automated quality indicator extraction |
| Referral tracking | Basic | Full referral chain with outcomes |
| Population health | None | Panel analytics — disease prevalence, utilisation, outcomes |
| Financial reporting | Revenue per service | Revenue per capita, cost per patient |

### New Data Flows Under Capitation

```
Practice → NHI Fund:
  - Monthly patient panel report (registered patients)
  - Service utilisation data (encounters, diagnoses)
  - Quality indicator reports
  - Referral reports

NHI Fund → Practice:
  - Monthly capitation payment
  - Performance score and bonus
  - Panel adjustment notifications
  - Benchmark reports
```

### VisioCorp Capitation Features to Build
1. **Panel management dashboard** — view registered patients, panel size, demographics
2. **Capitation calculator** — estimate monthly revenue based on panel composition and risk factors
3. **Quality indicator tracker** — automated extraction of pay-for-performance metrics
4. **Population health analytics** — disease prevalence, screening rates, chronic care gaps
5. **Referral management** — track referrals out and outcomes back
6. **Dual-mode billing** — capitation reconciliation + FFS claims to medical schemes
7. **Risk score viewer** — show practice's risk profile and adjustment factors

---

## QUALITY METRICS & PAY-FOR-PERFORMANCE

### Proposed Quality Indicators (from NHI Pilot Design)
The 10% performance payment is linked to measurable quality outcomes:

| Category | Indicator | Measurement |
|----------|-----------|-------------|
| **Access** | Panel coverage | % of attributed patients seen in 12 months |
| **Chronic care** | Diabetes control | % of diabetics with HbA1c <7% |
| **Chronic care** | Hypertension control | % of hypertensives at target BP |
| **HIV** | Viral suppression | % of HIV patients virally suppressed |
| **TB** | Treatment completion | % of TB patients completing treatment |
| **Maternal** | Antenatal visits | % of pregnant women with 8+ visits |
| **Child health** | Immunisation | % of children fully immunised by 12 months |
| **Prevention** | Cervical screening | % of eligible women screened |
| **Patient experience** | Satisfaction | Patient experience survey scores |
| **Efficiency** | Referral rate | Referral rate vs benchmark |

### Reporting Requirements
- **Quarterly quality reports** to NHI Fund
- **Automated extraction** from EHR/PMS where possible
- **Audit** by NHI Fund or designated quality agency
- **Benchmarking** against peer practices (same panel size, same district)

---

## TRANSITION PLANNING & TIMELINE

### When Do Medical Schemes Transition?

| Event | Expected Timeline |
|-------|-------------------|
| ConCourt judgment | H2 2026 (hearing May 2026) |
| NHI Fund board appointment | TBD — delayed indefinitely |
| NHI Fund CEO appointment | TBD — after board |
| First provider contracts | TBD — earliest 2027-2028 |
| First NHI claims processed | TBD — earliest 2028 |
| Medical schemes → complementary cover | TBD — phased, possibly 2030-2035 |
| Full NHI implementation | ~2035 (official) |

### What Services Will NHI Cover vs Schemes

**NHI Fund will cover** (once operational):
- Primary healthcare (comprehensive package)
- Hospital services (public + contracted private)
- Emergency medical services
- Prescribed minimum benefits (current PMB list expands)
- Mental health
- Rehabilitation
- Palliative care

**Medical schemes may still cover** (complementary):
- Services NOT in NHI benefits package
- Enhanced accommodation (private ward)
- Non-essential services (cosmetic, etc.)
- Supplementary benefits (gap cover equivalent)
- **Cannot duplicate** NHI-covered services

### How Tech Vendors Should Prepare

**Phase 1 — Now (2026):**
- Build FHIR R4 capability
- Implement HPRS patient lookup readiness
- Support ICD-10 coding accuracy tools
- Build quality metric reporting
- Maintain full EDIFACT/MedClm compatibility

**Phase 2 — NHI Contracting Begins (~2027-2028):**
- Dual-mode claims: EDIFACT to schemes + FHIR to NHI Fund
- DRG grouper integration (for hospital clients)
- Capitation panel management (for GP clients)
- Provider accreditation document management

**Phase 3 — Full NHI (~2030-2035):**
- Primary FHIR claims to NHI Fund
- Complementary cover claims to remaining schemes
- Full DRG/capitation reporting suite
- Population health analytics

---

## MEDICAL SCHEMES — COMPLEMENTARY COVER TRANSITION

### Current State (March 2026)
- **76 registered medical schemes**, 9.17M beneficiaries
- **4 administrators control 85%**: Discovery, Medscheme, Momentum, Medihelp
- **R259.3B annual claims market**
- Business as usual — NHI has NO operational impact today

### What Changes
1. Schemes **cannot cover the same services** as NHI Fund
2. Schemes become **"complementary medical insurance"** — top-up cover only
3. Scheme membership becomes **voluntary** (currently quasi-mandatory for employed)
4. **CMS continues to regulate** complementary schemes
5. Risk pool shrinks — schemes cover less, potentially fewer members

### Impact on Administrators and Tech
- Claims volumes **decrease** for scheme-covered services
- New claims category: **complementary cover claims** (different rules)
- Must track: what NHI covers vs what scheme covers (benefits mapping)
- **Gap cover** products likely to grow
- Administrators may pivot to NHI Fund claims processing (outsourced)

---

## SWITCHING HOUSES UNDER NHI

### Current Switching Infrastructure
| Switch | Market Position | Volume |
|--------|----------------|--------|
| **MediKredit** (Altron) | Market leader, owns NAPPI | 200M+ tx/yr, 9,500+ providers |
| **Healthbridge** | Strong GP segment | 7,000+ practices |
| **MediSwitch** | Multi-scheme connectivity | Broad coverage |
| **SwitchOn** (Altron) | Real-time switching | 99.8M tx/yr, 8,000+ practices |

### Will Switching Houses Survive Under NHI?
**Yes — but their role changes:**

1. **NHI Fund cannot build everything** — will likely outsource claims routing to existing infrastructure
2. Switches become **NHI claims intermediaries** — routing claims from providers to NHI Fund
3. Complementary cover claims still flow through switches to remaining medical schemes
4. **Real-time eligibility verification** — switches already do this, NHI Fund needs it
5. **Revenue model shifts** — from per-transaction fees (scheme-paid) to NHI Fund contract

### Risks for Switching Houses
- NHI Fund may build its own claims routing (unlikely given capacity constraints)
- Transaction volumes may decrease if complementary cover shrinks significantly
- New entrants may emerge with FHIR-native switching (displacing EDIFACT-era incumbents)

---

## EDIFACT TO FHIR TRANSITION

### Current Standard
- **PHISC EDIFACT MedClm** — proprietary South African healthcare claims format
- Maintained by **PHISC** (Private Health Information Standards Committee)
- Used by all switching houses, PMS vendors, scheme administrators
- Well-established, stable, but **not internationally interoperable**

### NHI Mandate
- NHI Act mandates **HL7 FHIR** for health data exchange
- National Digital Health Strategy (2019-2024) mandates FHIR adoption
- **Health Normative Standards Framework (HNSF)** requires FHIR alignment

### Transition Path
```
Phase 1 (Now): EDIFACT → Medical Schemes (current)
Phase 2 (2027-2028): EDIFACT → Schemes + FHIR → NHI Fund (dual mode)
Phase 3 (2030+): FHIR → NHI Fund (primary) + FHIR/EDIFACT → Schemes (complementary)
Phase 4 (2035+): FHIR only (if EDIFACT deprecated)
```

### FHIR Resources for Claims
| EDIFACT Element | FHIR Resource |
|-----------------|---------------|
| Patient demographics | `Patient` |
| Provider details | `Practitioner`, `Organization` |
| Claim header | `Claim` |
| Service lines | `Claim.item` |
| Diagnosis codes | `Claim.diagnosis` (ICD-10 coded) |
| Procedure codes | `Claim.procedure` |
| DRG assignment | `Claim.diagnosis.packageCode` |
| Payment response | `ClaimResponse` |
| Pre-authorisation | `CoverageEligibilityRequest` |
| Eligibility check | `CoverageEligibilityResponse` |
| Explanation of Benefits | `ExplanationOfBenefit` |

### VisioCorp Advantage
- **FHIR Hub already built** — ahead of ALL SA PMS competitors
- None of the major PMS vendors (Healthbridge, GoodX, Solumed, Health Focus) have FHIR capability
- VisioCorp can position as **FHIR bridge** — helping practices transition from EDIFACT to FHIR
- **CareConnect HIE** readiness in HealthOps/Netcare platforms

---

## OHSC CERTIFICATION

### Office of Health Standards Compliance
- Established under **National Health Act** to inspect and certify health facilities
- **OHSC certification is a PREREQUISITE** for NHI accreditation (NHI Act s39)
- Inspects: public hospitals, clinics, CHCs, private hospitals, GP practices

### National Core Standards (NCS) — 7 Domains
| Domain | Focus |
|--------|-------|
| 1. Patient Rights | Privacy, dignity, informed consent, complaints |
| 2. Patient Safety | Clinical governance, infection control, medication safety |
| 3. Clinical Governance | Clinical protocols, quality improvement, audit |
| 4. Clinical Support | Pharmacy, laboratory, radiology, blood services |
| 5. Public Health | Health promotion, disease prevention, reporting |
| 6. Governance & HR | Management, staffing, training, finance |
| 7. Operational Management | Infrastructure, equipment, supply chain, ICT |

### Compliance Statistics
| Metric | Value | Source |
|--------|-------|--------|
| Public facilities passing inspection | **~40%** | OHSC 2022/23 |
| Average service score | **67%** | OHSC 2022/23 |
| Routine inspections conducted | 734 (public) + 60 (private) | OHSC 2023/24 |
| Certificates issued | 618 | OHSC 2023/24 |
| Certificate validity | **4 years** (renewable) | OHSC regulations |

### The 40% Problem
- Only **4 in 10 public facilities** pass OHSC inspection
- This means **~60% of public facilities are NOT NHI-ready** from a quality perspective
- Private facilities generally perform better but face different standards gaps
- At current inspection pace (~800/year), it would take **years** to inspect all ~4,000+ facilities
- **This is the single biggest bottleneck** to NHI implementation

### Digital Quality Reporting Requirements
- Facilities must submit **quality indicator data** to OHSC
- Trend toward **automated reporting** from facility information systems
- OHSC developing **digital inspection tools** (tablet-based inspection checklists)
- Future: **continuous monitoring** vs periodic inspections (requires real-time data feeds)
- VisioCorp opportunity: automated OHSC quality metric extraction and reporting

---

## VISIOCORP NHI READINESS CHECKLIST

### Already Built (NHI-Ready Today)
- [x] HL7 FHIR R4 server and resources (FHIR Hub)
- [x] ICD-10 coding engine (WHO version)
- [x] NAPPI pharmaceutical coding
- [x] EDIFACT/MedClm claims submission (existing claims flow)
- [x] POPIA compliance framework
- [x] Multi-tenant architecture (white-label per practice)
- [x] AI-powered claims validation (rejection prediction)
- [x] Fraud detection patterns (peer comparison, billing anomalies)
- [x] 5 AI agents (triage, followup, intake, billing, scheduler)

### Build Next (Priority for NHI Readiness)
- [ ] **HPRS integration** — patient lookup against Master Patient Index
- [ ] **DRG grouper** — assign DRG from clinical data (license AR-DRG or build custom)
- [ ] **DRG coding assistant** — AI tool to suggest correct DRG from clinical notes
- [ ] **Capitation panel management** — patient attribution, panel dashboard
- [ ] **Dual-mode claims engine** — EDIFACT to schemes + FHIR to NHI Fund
- [ ] **Quality metric reporting** — automated OHSC and pay-for-performance indicators
- [ ] **Population health dashboard** — disease prevalence, screening rates per panel
- [ ] **Risk adjustment calculator** — estimate capitation payment from panel demographics
- [ ] **Provider accreditation tracker** — OHSC certificate, HPCSA, BEE status management
- [ ] **Clinical Documentation Improvement** — flag missing diagnoses/procedures for DRG accuracy

### Monitor (Dependent on Government Action)
- [ ] NHI Fund IT system RFP publication
- [ ] HPRS API specification release
- [ ] DRG grouper specification (which system SA adopts)
- [ ] Capitation tariff schedule publication
- [ ] NHI benefits package definition (Benefits Advisory Committee)
- [ ] FHIR claims profile specification (SA-specific FHIR profiles)
- [ ] OHSC digital reporting standards

---

## KEY DATES

| Date | Event | Impact |
|------|-------|--------|
| 15 May 2024 | NHI Act signed | Law exists but not proclaimed |
| Feb 2026 | NHI litigation halted pending ConCourt | Implementation frozen |
| **5-7 May 2026** | **ConCourt NHI hearing** | **Determines if Act survives** |
| H2 2026 | ConCourt judgment expected | Unlocks or blocks implementation |
| 2027-2028 | First provider contracts (if Act upheld) | DRG/capitation systems needed |
| 2030-2035 | Full NHI implementation | Complete transition |

---

## SOURCES

### Primary Legislation & Policy
- NHI Act 20 of 2023: saflii.org/za/legis/consol_act/nhia20o2023261.pdf
- National Digital Health Strategy 2019-2024: health.gov.za
- HPRS: hprs.health.gov.za
- OHSC: ohsc.org.za

### DRG & Payment Reform
- WHO DRG Q&A Guide: who.int/publications/i/item/WHO-UHC-HGF-Guidance-20.10
- World Bank DRG Transition Lessons: documents1.worldbank.org/curated/en/895741576646353914
- PMC: DRG in LMICs: pmc.ncbi.nlm.nih.gov/articles/PMC3791650
- DRGKB Global Knowledgebase: academic.oup.com/database/article/doi/10.1093/database/baae046

### Capitation
- NHI Capitation Contract Design: profmoosa.com/summary-of-proposed-nhi-capitation-contract-design
- NHI Unpacked Part 4 (Remuneration): pmc.ncbi.nlm.nih.gov/articles/PMC8378206
- Northern Cape Capitation Pilot: dfa.co.za (2025)
- Capitation SA Context: issuu.com/boardofhealthcarefunders

### OHSC & Quality
- OHSC Annual Report 2024/25: static.pmg.org.za/OHSC_Annual_Report_2024-2025.pdf
- OHSC FAQs: ohsc.org.za/faqs
- NCS Quality Standards: hst.org.za (SAHR 2011)

### NHI Legal Status
- Bhekisisa NHI Analysis: bhekisisa.org (March 2026)
- BusinessTech NHI Updates: businesstech.co.za
- Bowmans NHI Q&A: bowmanslaw.com
- Cliffe Dekker NHI Analysis: cliffedekkerhofmeyr.com

### Digital Health Infrastructure
- CSIR NHI Digital Systems: sanews.gov.za
- Health4Afrika FHIR: pubmed.ncbi.nlm.nih.gov/31437877
- Black Book SA EHR Report 2026: pressrelease.com
- PHISC Standards: phisc.net
