# SA Healthcare Claims — Legal & Regulatory Reference
## For: Steinberg, Claims Analyzer, HealthOps, Netcare Health OS Agents
## Compiled: 2026-03-21 | 13 Research Agents | 600+ Sources

---

## MEDICAL SCHEMES ACT 131 OF 1998

### Section 59 — Claims Processing (CRITICAL)
- **s59(2)**: Scheme must pay valid claims within **30 days** of receipt. Clock starts from date claim RECEIVED.
- Scheme has discretion to pay member OR provider (confirmed by CMS Appeal Board).
- **s59(3)**: Scheme may claw back overpayments by deducting from future benefits. Covers innocent errors AND fraud/theft/misconduct.
- **Regulation 6**: Claims must be submitted within **4 months (120 days)** of date of service. After rejection, provider has **60 days** to correct and resubmit.
- If scheme fails to notify rejection within 30 days, **burden of proof shifts to the scheme**.

### Section 29 — PMBs & Community Rating
- **s29(1)(n)**: Contributions based ONLY on income + number of dependants. NO individual risk profiling (community rating).
- **s29(1)(o)**: PMBs must be available to all beneficiaries as prescribed.
- **s29(1)(p)**: PMB costs paid in full at DSP. Non-DSP: co-payments allowed but must still cover at least DSP rate. If NO DSP appointed → scheme pays in full at ANY provider (Genesis SCA ruling).

### Section 26 — Open Enrollment
- Every applicant must be accepted regardless of age or health status.
- **General waiting period**: Up to 3 months (if no scheme in prior 24 months or gap >90 days).
- **Condition-specific waiting**: Up to 12 months for pre-existing conditions.
- **PMBs are NEVER subject to waiting periods** — must be paid from day 1.

### Section 35 — Solvency
- Minimum solvency ratio: **25% of gross annual contributions**.
- PMSA (savings) funds are **trust property** (Registrar v Genesis [2016] ZASCA 75).
- Maximum PMSA contribution: 25% of gross contribution.

### Section 66 — Penalties
- Maximum: Fine or **5 years imprisonment** or both.
- Continuing offences: **R1,000 per day**.

### Sections 47-50 — Disputes
1. Internal complaint → 2. Scheme dispute resolution → 3. CMS Registrar (s47) → 4. CMS Appeal Committee (s48, FREE) → 5. Appeal Board (s50, has High Court powers) → 6. High Court (s51)

---

## REGULATION 8 — PMB CONDITIONS

### Three Categories
1. **Emergency medical conditions** — ANY life-threatening emergency. No pre-auth required. Covered in full regardless of provider.
2. **271 Diagnosis Treatment Pairs (DTPs)** — Specific conditions with prescribed treatments (Annexure A).
3. **27 Chronic Disease List (CDL) conditions** — See below.

### PMB Payment Rules (FOR AI AGENTS)
1. At DSP: Pay in FULL — no co-payment, no deductible
2. At non-DSP (DSP appointed): Co-payments allowed, but MUST pay at least DSP rate
3. No DSP appointed: Pay in FULL at ANY provider (Genesis ruling)
4. Emergency: ALWAYS paid in full, regardless of provider
5. PMBs override waiting periods: Must be paid from day 1
6. PMBs override benefit limits: Cannot be funded from savings accounts; must come from risk pool
7. Schemes cannot reject PMB claims due to benefit exhaustion

### 27 CDL Conditions
Addison's | Asthma | Bipolar | Bronchiectasis | Cardiac failure | Cardiomyopathy | COPD | Chronic renal disease | Coronary artery disease | Crohn's | Diabetes insipidus | Diabetes mellitus T1 | Diabetes mellitus T2 | Dysrhythmia | Epilepsy | Glaucoma | Haemophilia | HIV/AIDS | Hyperlipidaemia | Hypertension | Hypothyroidism | Multiple sclerosis | Parkinson's | Rheumatoid arthritis | Schizophrenia | SLE | Ulcerative colitis

---

## REGULATION 13 — LATE JOINER PENALTIES

| Uncovered Years After Age 35 | Penalty |
|-----|---------|
| 1-4 years | 5% of contribution |
| 5-14 years | 25% |
| 15-24 years | 50% |
| 25+ years | 75% |

Applied to risk portion only. **Permanent — paid for life.** Periods as dependant under 21 excluded.

---

## LANDMARK COURT CASES

| Case | Year | Ruling |
|------|------|--------|
| **CMS v Genesis** | 2015 | Schemes without proper DSPs must pay PMBs in full at ANY provider |
| **Genesis v CMS** | 2017 | Reinforced 2015 ruling. Genesis held in non-compliance for refusing PMB payments |
| **Registrar v Genesis** | 2016 | PMSA credit balances = trust property |
| **Medscheme v Bhamjee** | 2005 | Schemes can compare practitioners' billing to peers for fraud investigation |
| **GEMS v Public Protector** | 2020 | Restricted schemes fully subject to Medical Schemes Act |

---

## POPIA — HEALTH DATA (SPECIAL PERSONAL INFORMATION)

### Section 32 — Health Data Processing
- Health data = **special personal information** under POPIA. Default: **prohibited** unless exception applies.
- Authorised processors: insurance companies, medical schemes, administrators, managed care organisations, employers.
- **Confidentiality obligation**: Must treat as confidential by written agreement if no inherent duty.

### NEW: POPIA Health Information Regulations 2026 (27 Feb 2026 — IN FORCE, NO GRACE PERIOD)
- Must maintain confidentiality, integrity and availability of health information.
- Physical AND electronic safeguards required.
- Technical measures must align with **generally accepted information security practices** for the sector.

### Section 72 — Cross-Border Transfer
- ANY use of international AI APIs (Anthropic, OpenAI, Google) processing patient data = **cross-border transfer** requiring s72 compliance.
- Must have: adequate protection in recipient country, OR data subject consent, OR contractual necessity.

### Children (s34-35)
- Under 18 = child. Consent from **competent person** (parent/guardian) required for data processing.
- **Dual consent needed**: Child 12+ consents to medical treatment (Children's Act s129), but parent must separately consent to data processing (POPIA).

---

## HPCSA GUIDELINES

### Booklet 20 — AI in Healthcare (NEW)
- AI = decision-support ONLY, not decision-maker.
- Practitioners retain legal/ethical accountability even when using AI.
- Must inform patients when AI tools are used.
- Must manage risks of AI bias, privacy concerns, over-reliance.

### Booklet 10 — Telehealth
- Requires **existing doctor-patient relationship** (prior face-to-face consultation).
- Same standard of care as face-to-face.
- Safeguard system for physical examination access.

### Booklet 9 — Patient Records
- Minimum 6 years retention from dormancy.
- Minors: until **21st birthday**.
- Mental health patients: **lifetime**.
- Electronic records: password-safeguarded, internationally accepted storage standards.

---

## SAHPRA — AI/ML AS MEDICAL DEVICES (MD08-2025)

### Classification
- **Class A**: Admin/wellness software (lowest risk)
- **Class B**: Decision support with practitioner override
- **Class C**: AI diagnostic tools influencing decisions
- **Class D**: Autonomous diagnostic/treatment decisions (highest risk)

Most decision-influencing AI SaMD = **Class C or D**. Requires SAHPRA authorization + **ISO 13485:2016** compliance.

---

## NHI ACT 20 OF 2023

- Signed 15 May 2024. **NOT YET PROCLAIMED.**
- **ConCourt hearing: 5-7 May 2026** — implementation fully on hold pending ruling.
- Creates single-payer NHI Fund. Medical schemes become complementary cover only.
- Standardised ICD-10 + NAPPI coding mandatory. HL7 FHIR mandated for data exchange.
- DRG/capitation payment models (not fee-for-service).
- Full implementation: **2035** (estimated).
- **For AI agents processing claims TODAY: NHI has NO impact on current processing. Continue applying Medical Schemes Act.**

---

## OTHER RELEVANT ACTS

| Act | Key Provision |
|-----|---------------|
| **ECTA (Act 25 of 2002)** | Electronic medical records satisfy "writing" requirement. Electronic signatures valid. Data messages admissible as evidence. |
| **National Health Act (Act 61 of 2003)** | Health records mandatory for every user. All information confidential (s14). Users have right to access records (s15). |
| **Consumer Protection Act (Act 68 of 2008)** | Patients = consumers. No-fault product liability for defective products (s61) — potentially applies to AI recommendations. |
| **Medicines Act (Act 101 of 1965)** | NAPPI codes mandatory. SEP (Single Exit Price) regulations. Generic substitution rules. |
| **Pharmacy Act** | Electronic prescriptions allowed (Reg 33). 5-year prescription retention. |
| **Mental Health Care Act (Act 17 of 2002)** | Enhanced confidentiality. Highest access control tier required. |
| **OHS Act (Act 85 of 1993)** | Occupational health records: 30-40 year retention. |

---

## CMS CIRCULARS (2023-2026)

- **Circular 56/2023**: Mandatory CCSA 2023 procedure codes.
- **Circular 57/2023**: PMB definition updates — expanded conditions and treatments.
- **Circular 80/2024**: Electronic claims submission standards — push toward real-time adjudication.
- **CMScript 10/2024**: ICD-10 coding and funding rules. No code "reserved" for specific disciplines.
- **Circular 8/2026**: Annual HIV, TB, STI data submission requirements.

---

## VISIOCORP COMPLIANCE CHECKLIST

- [ ] Appoint and register Information Officer with Information Regulator
- [ ] Conduct POPIA data protection impact assessment
- [ ] Section 72 compliance for ANY international cloud/AI service
- [ ] Determine if AI products qualify as SaMD — SAHPRA authorization if Class C/D
- [ ] Implement dual-consent for patients aged 12-17
- [ ] Enhanced access controls for mental health records
- [ ] Retention: 6 years minimum, 21st birthday for minors, 30-40 years for OHS
- [ ] ICD-10 and NAPPI coding at item level on all claims
- [ ] AI as decision-support only, practitioners retain accountability (Booklet 20)

---

## SOURCES

Medical Schemes Act: gov.za/documents/201409/a131-98.pdf | CMS: medicalschemes.co.za | POPIA: popia.co.za | HPCSA: hpcsa.co.za | SAHPRA: sahpra.org.za | NHI Act: gov.za/documents/acts/national-health-insurance-act-20-2023 | ECTA: gov.za/documents/electronic-communications-and-transactions-act | National Health Act: saflii.org/za/legis/consol_act/nha2003147 | CMS Circulars: medicalschemes.co.za/publications
