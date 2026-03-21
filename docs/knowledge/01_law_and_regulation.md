# 01 — SA Healthcare Law & Regulatory Framework
## VisioCorp Health Intelligence KB | Compiled 2026-03-21

---

## MEDICAL SCHEMES ACT 131 OF 1998

### Section 59 — Claims Processing (VERBATIM)

**s59(1)** — "A supplier of a service who has rendered any service to a beneficiary in terms of which an account has been rendered, shall, notwithstanding the provisions of any other law, furnish to the member concerned an account or statement reflecting such particulars as may be prescribed."

**s59(2)** — "A medical scheme shall, in the case where an account has been rendered, subject to the provisions of this Act and the rules of the medical scheme concerned, **pay to a member or a supplier of service, any benefit owing to that member or supplier of service within 30 days** after the day on which the claim in respect of such benefit was received by the medical scheme."

**s59(3)** — "Notwithstanding anything to the contrary contained in any other law a medical scheme may, in the case of — (a) any amount which has been paid bona fide in accordance with the provisions of this Act to which a member or a supplier of health service is not entitled to; or (b) any loss which has been sustained by the medical scheme through theft, fraud, negligence or any misconduct which comes to the notice of the medical scheme, **deduct such amount from any benefit payable** to such a member or supplier of health service."

### Regulation 6 — Claims Procedures
- Claims must be submitted within **4 months (120 days)** of date of service
- Scheme must pay or notify rejection within **30 days** of receipt
- If rejected, provider has **60 days** to correct and resubmit
- If scheme fails to notify within 30 days → **burden of proof shifts to scheme**

### Regulation 8 — PMBs
- **"Any benefit option must pay in full, without co-payment or the use of deductibles, the diagnosis, treatment and care costs of PMB conditions"**
- PMBs override waiting periods, benefit limits, and savings account restrictions
- At DSP: pay in FULL. Non-DSP: co-payment allowed but must still cover at least DSP rate
- No DSP appointed → must pay in full at ANY provider (Genesis ruling)
- PMBs must be funded from RISK pool, never savings accounts (Regulation 10(6))

### Regulation 10 — Savings Accounts
- Maximum PMSA allocation: **25% of gross contribution**
- PMSA funds = trust property (Registrar v Genesis [2016])
- "The funds in a member's medical savings account shall NOT be used to pay for the costs of a prescribed minimum benefit"

### Regulation 13 — Late Joiner Penalties
| Uncovered Years (After Age 35) | Penalty |
|------|---------|
| 1-4 years | 5% |
| 5-14 years | 25% |
| 15-24 years | 50% |
| 25+ years | 75% |
Applied to risk portion only. **Permanent — paid for life.**

### Section 26 — Open Enrollment
- All applicants must be accepted regardless of age or health status (community rating)
- General waiting: up to 3 months. Condition-specific: up to 12 months
- **PMBs: NEVER subject to waiting periods — paid from day 1**

### Section 66 — Penalties
- Maximum: fine or **5 years imprisonment** or both
- Continuing offences: **R1,000 per day**

### Sections 47-50 — Dispute Resolution
1. Internal complaint → 2. Scheme dispute resolution → 3. CMS Registrar (s47) → 4. CMS Appeal Committee (s48, FREE) → 5. Appeal Board (s50, has **High Court powers** — can summon witnesses, administer oaths) → 6. High Court (s51). Aggrieved parties have 60 days to lodge appeal to Appeal Board.

---

## LANDMARK COURT CASES

| Case | Year | Ruling |
|------|------|--------|
| **CMS v Genesis** [2015] ZASCA 161 | 2015 | Schemes without DSPs must pay PMBs in full at ANY provider. Cannot push members to public facilities without formal DSP agreement. **The Medical Schemes Act supersedes scheme rules.** |
| **Genesis v CMS** [2017] ZAGPPHC 78 | 2017 | Reinforced 2015 ruling. Genesis held non-compliant for refusing PMB payments at private facilities. |
| **Registrar v Genesis** [2016] ZASCA 75 | 2016 | PMSA credit balances = **trust property**. |
| **Medscheme v Bhamjee** [2005] ZASCA 48 | 2005 | Schemes can compare practitioners' billing to peers for fraud investigation. |
| **GEMS v Public Protector** [2020] ZASCA 111 | 2020 | Restricted schemes fully subject to Medical Schemes Act. |
| **Optivest v CMS** [2024] ZASCA 64 | 2024 | Scope of CMS investigatory powers over brokers. |
| **BHF v CMS** [2025] ZAGPPHC 609 | 2025 | Leave to appeal in scheme vs regulator dispute. |

### Section 59 Investigation — Racial Discrimination (April 2025)
- Chaired by Adv Tembeka Ngcukaitobi
- **Discovery Health, GEMS, Medscheme** found to have engaged in **systemic racial discrimination** against Black providers in FWA investigations (2012-2019)
- Location-based scoring created **2-3x higher investigation probability** for township/rural practices
- AI claims systems MUST implement bias testing (see 08_compliance.md)

---

## POPIA — HEALTH DATA

### Core Framework
- Health data = **special personal information** (s26). Processing **prohibited by default** unless exception applies.
- **s32**: Authorized processors — insurers, medical schemes, administrators, managed care, employers
- **s32(2)**: Must treat as confidential by written agreement if no inherent duty

### POPIA Health Information Regulations 2026 (IN FORCE 6 March 2026, NO GRACE PERIOD)
- Signed 27 Feb 2026 by Chairperson Adv Pansy Tlakula (Government Gazette No. 54268)
- Requires "appropriate technical and organisational safeguards" for electronic AND physical health records
- Must align with **"generally accepted information security practices"** for the sector
- Eight responsible party categories: insurers, schemes, administrators, managed care, admin bodies, pension funds, employers, institutions working for any of above

### Cross-Border Transfer (s72) — CRITICAL FOR AI
- **ANY use of international AI APIs (Anthropic, OpenAI, Google) processing patient data = cross-border transfer**
- Requires: adequacy assessment + contractual safeguards + explicit consent OR de-identification before API calls
- **No adequacy determinations published by Information Regulator** — each party must self-assess
- Recommended: de-identify/anonymise patient data before API calls wherever possible

### Penalties
| Type | Maximum |
|------|---------|
| Administrative fine | R10 million |
| Criminal (s105, s107) | 10 years imprisonment |
| Civil damages | Unlimited |
| Director liability | Personal criminal prosecution |

### Data Retention
| Category | Period |
|----------|--------|
| Patient records (general) | 6 years from dormancy |
| Minor patient records | Until 21st birthday |
| Mental health records | Patient's lifetime |
| Occupational health | 30-40 years |
| Prescriptions | 5 years |

### Children (DUAL CONSENT)
- Children 12+ can consent to medical treatment (Children's Act s129)
- But parents must SEPARATELY consent to data processing (POPIA)
- Systems need dual consent mechanism

---

## HPCSA GUIDELINES

### Booklet 20 — AI in Healthcare (NEW)
- AI = **decision-support ONLY**, not decision-maker
- Practitioners retain **full legal/ethical accountability** even when using AI
- **Must inform patients** when AI tools are used
- Must manage risks of AI bias, privacy concerns, over-reliance

### Booklet 10 — Telehealth
- Requires **existing doctor-patient relationship** (prior face-to-face)
- Same standard of care as face-to-face
- Telehealth codes: 0192 (GP), 0197 (GP audio/video), 0149 (specialist)

### Booklet 9 — Patient Records
- Electronic records: password-safeguarded, internationally accepted standards
- Minimum contents: patient particulars, date/time/place, assessment, management plan, medications, referrals, test results, informed consent

---

## SAHPRA — AI/ML MEDICAL DEVICES (MD08-2025)

### SaMD Classification (Four-Tier)
| Class | Risk | Examples | Registration? |
|-------|------|---------|---------------|
| A | Lowest | Admin software, billing, scheduling | Self-declaration |
| B | Low-moderate | Decision support with practitioner override | Required |
| C | Moderate-high | AI diagnostics influencing decisions | Full review + reference regulator |
| D | Highest | Autonomous diagnostic/treatment | Strictest scrutiny |

- **ISO 13485:2016** mandatory from 1 June 2025. Certificate from SAHPRA CAB by **1 April 2028**.
- **IEC 62304** (software lifecycle) required for SaMD
- Claims validation AI: generally NOT SaMD if only administrative. MAY be SaMD if making clinical appropriateness determinations.

---

## NHI ACT 20 OF 2023

- Signed 15 May 2024. **NOT YET PROCLAIMED.**
- ConCourt hearing: **5-7 May 2026**. 12+ constitutional challenges pending.
- Creates single-payer NHI Fund. Medical schemes → complementary cover only.
- Mandates: HL7 FHIR for data exchange, standardised ICD-10/NAPPI, DRG/capitation models.
- Full implementation: ~2035.
- **For agents processing claims TODAY: NHI has NO operational impact. Apply Medical Schemes Act as-is.**

---

## OTHER APPLICABLE ACTS

| Act | Key Provision |
|-----|---------------|
| **ECTA (Act 25/2002)** | Electronic health records satisfy "writing" requirement. Electronic signatures valid. AI-generated reports admissible as data messages. |
| **National Health Act (Act 61/2003)** | Health records mandatory for every user (s13). All information confidential (s14). User access rights (s15). |
| **Consumer Protection Act (Act 68/2008)** | Patients = consumers. No-fault product liability (s61) — may apply to AI recommendations. |
| **Medicines Act (Act 101/1965)** | NAPPI codes mandatory. SEP regulations. Generic substitution (s22F). |
| **Pharmacy Act** | Electronic prescriptions allowed (Reg 33). 5-year retention. |
| **Mental Health Care Act (Act 17/2002)** | Enhanced confidentiality. Highest access control tier. Lifetime retention. |
| **OHS Act (Act 85/1993)** | Occupational health records: 30-40 year retention. |
| **POCA (Act 121/1998)** | Healthcare fraud syndicates = organized crime. Threshold: sustained, systematic fraud >R100,000. |

---

## CMS CIRCULARS (2024-2026)

### Key 2024 Circulars
| # | Topic |
|---|-------|
| 1/2024 | Iron Deficiency Anaemia as PMB condition |
| 13/2024 | PMB Definition Guidelines 2024/2025 |
| 35/2024 | Contribution increases & benefit changes for 2025 |
| 49/2024 | Approved benefit & contribution adjustments for 2025 |

### Key 2025/2026 Circulars
| # | Topic |
|---|-------|
| 8/2026 | Annual HIV, TB, STI data submission requirements |
| CMScript 10/2024 | Coding and funding of claims — ICD-10, tariff codes |

Full list: medicalschemes.co.za/publications/

---

## SOURCES
Medical Schemes Act: gov.za/documents/201409/a131-98.pdf | Regulations: medicalschemes.com/files/Acts%20and%20Regulations/MSREGS19July2004.pdf | CMS: medicalschemes.co.za | POPIA: popia.co.za | HPCSA: hpcsa.co.za | SAHPRA: sahpra.org.za | NHI: gov.za/documents/acts/national-health-insurance-act-20-2023 | SAFLII: saflii.org | Section 59 Report: health.gov.za/wp-content/uploads/2025/07/Final-Report-Section-59-Investigations-25042025.pdf
