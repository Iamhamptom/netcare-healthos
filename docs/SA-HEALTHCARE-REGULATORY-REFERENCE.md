# South African Healthcare Regulatory Reference

> **Compiled**: 20 March 2026
> **Purpose**: Authoritative regulatory reference for the Netcare Health OS platform
> **Status**: Living document -- update quarterly as regulations evolve

---

## Table of Contents

1. [Council for Medical Schemes (CMS)](#1-council-for-medical-schemes-cms)
2. [Board of Healthcare Funders (BHF) & PHISC Standards](#2-board-of-healthcare-funders-bhf--phisc-standards)
3. [Medical Schemes Act (Act 131 of 1998)](#3-medical-schemes-act-act-131-of-1998)
4. [POPIA for Healthcare (Updated March 2026)](#4-popia-for-healthcare-updated-march-2026)
5. [HPCSA Guidelines](#5-hpcsa-guidelines)
6. [NHI Status (National Health Insurance)](#6-nhi-status-national-health-insurance)

---

## 1. Council for Medical Schemes (CMS)

**Source**: [CMS Annual Report 2024/25](https://www.medicalschemes.co.za/cms-annual-report-2024-25/) | [CMS Industry Report 2024](https://www.medicalschemes.co.za/the-2024-cms-industry-report-is-now-available/)

### 1.1 Industry Overview (2024 Data Year)

| Metric | Value |
|---|---|
| Total medical schemes | **71** (16 open, 55 restricted) |
| Total beneficiaries | **9.17 million** (+0.45% from 2023) |
| Administrators | **33** accredited |
| Managed care organisations | **43** |
| Brokers and brokerages | **10,000+** |
| Total benefits paid | **R259.3 billion** (+8.52% YoY) |
| Benefits per beneficiary growth | +7.84% YoY |
| Net industry surplus | **R3.13 billion** (~2x prior year) |
| Industry net assets | **R109.24 billion** |
| Solvency ratio | **40.87%** (minimum required: 25%) |
| Average beneficiary age | **34.2 years** (up from 32 in 2023) |

### 1.2 Open vs Restricted Schemes

| Metric | Open Schemes | Restricted Schemes |
|---|---|---|
| Number of schemes | 16 | 55 |
| Average beneficiary age | 36.4 years | 31.8 years |
| Solvency position | Stable | Stronger than open |
| Membership trend | Open to public | Employer-linked |

### 1.3 Claims and Expenditure

- **Hospital expenditure**: 35.95% of total benefits (dominant cost driver)
- **Cost per admission**: increased 9.88% despite fewer total admissions
- **Claims growth outpacing contributions**: structural strain identified by CMS
- **Standard claims payment deadline**: 30 days from receipt (per Section 59(2) of the Act)
- **If unpaid after 30 days**: member may lodge complaint with CMS

### 1.4 Top Rejection/Dispute Reasons

Based on CMS complaints data and the 5-year PMB retrospective review ([SAMJ 2024](https://scielo.org.za/scielo.php?script=sci_arttext&pid=S0256-95742024000700002)):

1. **Incorrect interpretation of PMB levels of care** -- schemes dispute whether in-hospital or out-of-hospital treatment applies
2. **Non-designated service provider (DSP) usage** -- short-payments when members use non-network providers
3. **Treatment protocol and formulary disputes** -- perceived unfairness in application of drug formularies
4. **Monetary caps on PMB conditions** -- schemes incorrectly apply annual limits to conditions that must be covered in full
5. **Post-amputation prosthetics** -- recurring rulings that schemes cannot cap PMB funding for prosthetic limbs
6. **Diabetes (all forms)** -- 18.1% of PMB complaints; 73.7% not paid at all, 26.3% short-paid
7. **Cancer DTPs** -- breast, prostate, oral cavity, pharynx, nose, ear, larynx in top 10 most-complained DTPs

### 1.5 PMB Complaint Statistics (2023/24)

| Metric | Value |
|---|---|
| Total complaints investigated | 2,550 (down from 3,480 in 2022/23) |
| Carried over from prior year | 463 |
| Newly registered | 2,087 |
| PMB non-payment/short-payment resolved | 541 |

### 1.6 Key CMS Contact

- **Website**: [medicalschemes.co.za](https://www.medicalschemes.co.za/)
- **Complaints**: Online portal or call centre
- **Annual Report PDF**: [PMG archive](https://static.pmg.org.za/CMS_-_Council_for_Medical_Schemes_Annual_Report_2024-2025.pdf)

---

## 2. Board of Healthcare Funders (BHF) & PHISC Standards

**Sources**: [BHF Global](https://bhfglobal.com/) | [PHISC](https://www.phisc.net/) | [CMS CMScript 10/2024](https://www.medicalschemes.co.za/cmscript-10-of-2024-coding-and-funding-of-claims/)

### 2.1 PHISC Messaging Standards

The **Private Healthcare Information Standards Committee (PHISC)** develops and maintains standardised messaging for the SA private healthcare sector.

| Standard | Details |
|---|---|
| **Claims format** | MEDCLM / EDIFACT message format |
| **ICD-10 submission** | Via RFF+ICD segments in Groups 1, 3, and 4 |
| **XML schemas** | Standardised content for paper and electronic messages |
| **SA ICD-10 version** | WHO vanilla ICD-10 with local additions; SA ICD-10 Master Industry Table (MIT) from January 2014 is the official reference |
| **CPT coding** | PHISC Complete CPT for South Africa (CCSA) -- [Version 11 (October 2024)](https://www.phisc.net/system/files/PHISC%20CCSA%20Coding%20Standards%20and%20Guidelines%20Version%2011%20(October%202024).pdf) |

### 2.2 Coding Standards

| Code System | Purpose | Authority |
|---|---|---|
| **ICD-10** | Diagnosis coding | WHO + PHISC SA addendum (Version 4, July 2020) |
| **CPT (CCSA)** | Procedure coding | SAMA publishes annually; PHISC CCSA v11 (Oct 2024) |
| **NAPPI** | Pharmaceutical product identification | 9-digit code: first 6 = product, last 3 = pack size |
| **LOINC** | Laboratory/clinical observations | International standard, adopted via HNSF |

### 2.3 Tariff Structure

| Tariff | Status |
|---|---|
| **BHF tariff** | Discontinued January 2004 |
| **HPCSA suggested pricing** | Discontinued December 2008 |
| **NHRPL** (National Health Reference Price List) | Published annually by CMS; no negotiated prices, based on surveyed practice costs |
| **Scheme-specific tariffs** | Each scheme sets reimbursement as % of NHRPL (100%, 200%, 300% etc.) |
| **SAMA Rate of Exchange** | SAMA publishes annual fee guidance for practitioners |

**Source**: [NHRPL explanation](https://gap-cover-info.co.za/how-the-nhrpl-medical-aid-rates-and-tariffs-work) | [PMG guideline tariffs](https://pmg.org.za/files/docs/120822guideline.pdf)

### 2.4 Claims Submission Standards

1. **Electronic claims** must use PHISC MEDCLM/EDIFACT format
2. **ICD-10 codes** mandatory on all claims (CMScript 10/2024 reinforces this)
3. **NAPPI codes** required for all pharmaceutical claims
4. **CPT/CCSA codes** required for procedure billing
5. **Claims must include**: patient identifier, scheme number, provider practice number, ICD-10 diagnosis, CPT procedure code, NAPPI (if applicable), date of service

### 2.5 eRA (Electronic Remittance Advice)

- Standardised electronic remittance format for payment reconciliation
- Enables practices to match payments to claims automatically
- Part of the PHISC messaging ecosystem

---

## 3. Medical Schemes Act (Act 131 of 1998)

**Source**: [Government Gazette](https://www.gov.za/documents/medical-schemes-act) | [Act text (PDF)](https://www.gov.za/sites/default/files/gcis_document/201409/a131-98.pdf) | [Regulations](https://www.medicalschemes.com/files/Acts%20and%20Regulations/MSREGS19July2004.pdf)

### 3.1 Prescribed Minimum Benefits (PMB)

PMBs are defined in the Regulations to the Medical Schemes Act and consist of three components:

#### A. 271 Diagnosis Treatment Pairs (DTPs) -- Annexure A

DTPs link specific diagnoses to required treatments. They are divided into **15 broad categories** and are mostly hospital-based, though some cover out-of-hospital management.

Key categories include:
- Emergency medical conditions (any life-threatening condition)
- Infectious diseases (TB, meningitis, septicaemia)
- Cancers/neoplasms (breast, prostate, colorectal, lung, etc.)
- Cardiovascular conditions
- Respiratory conditions
- Endocrine/metabolic conditions
- Neurological conditions
- Surgical conditions
- Obstetric/gynaecological conditions
- Paediatric conditions
- Psychiatric conditions
- Orthopaedic conditions
- Ophthalmological conditions
- Renal conditions

**Note**: Where disagreement exists about treatment, public sector standards (practice and protocols) take precedence.

**Full DTP list**: [Engen Med PDF](https://www.engenmed.co.za/assets/medical-schemes/engen/pmb-list-of-271-diagnosis-and-treatment-pairs-dtps.pdf) | [HFA PDF](https://www.hfassociation.co.za/images/members-resources/The_270_PMB_Conditions.pdf)

#### B. Chronic Disease List (CDL) -- 27 Conditions

All medical schemes must cover diagnosis, treatment, and ongoing management of these conditions:

| # | Condition | # | Condition |
|---|---|---|---|
| 1 | Addison's disease | 15 | Epilepsy |
| 2 | Asthma | 16 | Glaucoma |
| 3 | Bipolar mood disorder | 17 | Haemophilia |
| 4 | Bronchiectasis | 18 | HIV and AIDS |
| 5 | Cardiac failure | 19 | Hyperlipidaemia |
| 6 | Cardiomyopathy | 20 | Hypertension |
| 7 | Chronic obstructive pulmonary disease (COPD) | 21 | Hypothyroidism |
| 8 | Chronic renal disease | 22 | Multiple sclerosis |
| 9 | Coronary artery disease | 23 | Parkinson's disease |
| 10 | Crohn's disease | 24 | Rheumatoid arthritis |
| 11 | Diabetes insipidus | 25 | Schizophrenia |
| 12 | Diabetes mellitus type 1 | 26 | Systemic lupus erythematosus |
| 13 | Diabetes mellitus type 2 | 27 | Ulcerative colitis |
| 14 | Dysrhythmia | | |

**Coverage rule**: Schemes must fund CDL conditions even on basic hospital plans, provided diagnosis and treatment meet clinical guidelines and correct ICD-10 codes are used.

#### C. Emergency Medical Conditions

Any emergency condition must be treated at any facility, regardless of DSP network, and funded as a PMB. This includes stabilisation and treatment until the patient can be safely transferred.

### 3.2 Section 29 -- Rights of Members

Section 29 prescribes the **minimum matters** that scheme rules must address, including:

- Admission and termination of membership
- Benefits and contributions
- Governance and management of the scheme
- Rights to information and fair treatment
- Grievance and dispute resolution procedures
- Waiting periods (general: 3 months; condition-specific: 12 months)
- Late joiner penalties (applied to members joining after age 35 without prior cover)

### 3.3 Section 59 -- Obligations of Schemes to Pay

**Section 59(2)** is the critical payment provision:

> *A medical scheme shall, in the case where an account has been rendered, subject to the provisions of this Act and the rules of the medical scheme concerned, pay to a member or a supplier of service, any benefit owing to that member or supplier of service **within 30 days** after the day on which the claim in respect of such benefit was received by the medical scheme.*

Key provisions:
- **30-day payment obligation** from date of claim receipt
- **Late payment penalties** apply to schemes/administrators that fail to pay within 30 days
- **Interest on late payments** accrues to the benefit of the member/provider
- **Non-payment of PMBs** is a specific violation that CMS actively enforces

### 3.4 Dispute Resolution Process

1. **Internal dispute**: Member raises complaint with scheme
2. **Scheme response**: Scheme must respond within a reasonable period
3. **CMS complaint**: If unresolved, member lodges formal complaint with CMS Complaints Adjudication Unit
4. **CMS investigation**: CMS investigates and may issue a ruling
5. **Appeal Board**: Either party may appeal to the CMS Appeal Board
6. **High Court**: Final recourse is judicial review in the High Court

**Source**: [CMS Complaints](https://www.medicalschemes.co.za/) | [Section 59 investigation](https://cmsinvestigation.org.za/index.php/section-59/)

---

## 4. POPIA for Healthcare (Updated March 2026)

**Sources**: [ITLawCo analysis](https://itlawco.com/popia-health-data-regulations-2026/) | [IT-Online](https://it-online.co.za/2026/03/13/popia-health-information-regulations-cross-the-finish-line/) | [Moonstone](https://www.moonstone.co.za/new-popia-regulations-on-health-information-now-in-force/) | [BizCommunity](https://www.bizcommunity.com/article/new-popia-regulations-on-health-data-protection-what-you-need-to-know-177076a)

### 4.1 The March 2026 Health Data Regulations

**Effective date**: 6 March 2026 -- NO transitional period.

The Information Regulator published the final **Regulations relating to the Processing of Data Subjects' Health Information by Certain Responsible Parties** under POPIA. These regulations:

- Were first published as draft in September 2025 for public comment
- Final version removed references to sex life information (now exclusively health information)
- Are binding, immediate, and enforceable from day one
- Apply to electronic records (databases, cloud, email) AND physical records (paper files, printed reports)

### 4.2 Eight Categories of Responsible Parties

The regulations apply to these categories of organisations:

| # | Category |
|---|---|
| 1 | **Medical schemes** |
| 2 | **Administrators** of medical schemes |
| 3 | **Insurance companies** (health/life) |
| 4 | **Pension funds** |
| 5 | **Employers** (processing employee health data) |
| 6 | **Managed care organisations** |
| 7 | **Institutions working for** any of the above |
| 8 | **Brokers and intermediaries** |

### 4.3 Definition of Health Information

"Health information" = personal information relating to the physical and/or mental health of a data subject, including:
- Provision of healthcare services
- Testing, treatment, and diagnosis
- Any information revealing health status

### 4.4 Consent Requirements

- Health information is classified as **special personal information** under POPIA Section 26
- Processing is prohibited UNLESS Section 27 conditions are satisfied
- **Explicit, informed consent** is required in most cases
- **Exceptions**: necessary for medical treatment by a healthcare professional, or required by law
- Consent must be specific, voluntary, and documented
- Data subjects must be informed of the purpose, recipients, and their right to withdraw

### 4.5 Breach Notification

- POPIA Section 22 requires notification of security compromises **as soon as reasonably possible**
- The Information Regulator's Guidance Note on Security Compromises (2021) sets a **72-hour expectation** (aligned with GDPR)
- Notification must go to both the **Information Regulator** and the **affected data subjects**
- Must include: nature of breach, categories of data affected, measures taken, recommendations to data subjects

### 4.6 Data Retention -- HPCSA vs POPIA

| Requirement | Retention Period | Authority |
|---|---|---|
| Adult patient records | **Minimum 6 years** from date records became dormant | HPCSA Booklet 9 |
| Minor patient records | **Until the patient turns 21** (3 years after majority to bring a claim) | HPCSA Booklet 9 |
| Mentally incompetent patients | **Duration of patient's lifetime** | HPCSA Booklet 9 |
| Occupational exposure records | **Minimum 25 years** (conditions with long latency) | HPCSA guidelines |
| Electronic records | **Ideally indefinite** (HPCSA recommends permanent electronic storage) | HPCSA Booklet 9 |
| POPIA general principle | Data must be **destroyed, deleted, or de-identified** once purpose is fulfilled | POPIA Section 14 |

**Conflict resolution**: Where HPCSA mandates longer retention than POPIA's minimisation principle would suggest, the HPCSA retention period takes precedence as it is required by law (POPIA Section 14(1) exemption for legal obligations).

### 4.7 Cross-Border Data Transfers

Health data may NOT be transferred to foreign jurisdictions unless one or more conditions in **POPIA Section 72(1)** are met:
- Data subject's explicit consent
- Binding agreement between parties with adequate protections
- Recipient country has comparable data protection laws
- Transfer is necessary for performance of a contract
- Transfer is for the benefit of the data subject

### 4.8 Security Requirements

The regulations require:
- **Technical and organisational measures** aligned with generally accepted information security practices for the responsible party's sector
- Contextualised standard: a large insurer is held to financial services standards; a small practice to a proportionate standard
- Must address risks for both **physical** (paper, printed) and **electronic** (database, cloud, email) records
- Must maintain **confidentiality, integrity, and availability** of health information

### 4.9 Information Regulator Enforcement (2025-2026)

| Development | Detail |
|---|---|
| **Enforcement posture** | "Grace period" officially over -- aggressive enforcement from 2025 onward |
| **Personal liability** | Information officers and heads of private bodies face up to **3 years imprisonment** and/or fines |
| **Criminal referrals** | Information Regulator has referred matters to SAPS for non-compliance |
| **Deep investigations** | Launched major investigations into data-handling practices (2025) |
| **Health data focus** | March 2026 regulations signal healthcare is a priority enforcement sector |
| **Administrative fines** | Up to **R10 million** per offence under POPIA |

**Source**: [Information Regulator](https://inforegulator.org.za/) | [Polity analysis](https://www.polity.org.za/article/code-red-to-code-regulated-south-africas-data-ai-and-cybersecurity-shift-in-2025-and-whats-to-come-in-2026-2026-01-21)

---

## 5. HPCSA Guidelines

**Sources**: [HPCSA Ethics](https://www.hpcsa.co.za/ethics) | [Booklet 9 -- Patient Records](https://www.hpcsa-blogs.co.za/wp-content/uploads/2022/08/Booklet-9-Guidelines-on-Patient-Records.pdf) | [Booklet 20 -- AI Guidelines](https://www.hpcsa-blogs.co.za/wp-content/uploads/2025/11/ETHICAL-GUIDELINES-USE-OF-AI.pdf)

### 5.1 Electronic Health Records (Booklet 9)

The HPCSA Guidelines for Good Practice (Booklet 9) govern patient records:

**Content requirements**:
- Complete clinical notes for every consultation
- Diagnosis and treatment plan
- Medications prescribed (with dosages)
- Test results and referrals
- Informed consent documentation

**Storage requirements**:
- Records must be stored in a **safe place**
- Electronic records must be **safeguarded by passwords**
- Must comply with POPIA security measures
- **Privacy and security** are paramount

**Retention periods** (see Section 4.6 above):
- Adults: minimum 6 years from dormancy
- Minors: until age 21
- Mentally incompetent: lifetime of patient
- Occupational exposure: minimum 25 years
- Electronic: ideally indefinite

### 5.2 E-Prescribing

- South Africa does not yet have comprehensive e-prescribing legislation equivalent to the US EPCS framework
- The SA Pharmacy Council oversees pharmacy practice standards
- Electronic prescriptions are increasingly used in private practice but lack a unified regulatory framework
- HPCSA requires that prescriptions (electronic or paper) contain: prescriber details, patient details, medication name, dose, frequency, quantity, and signature/authentication
- **Key gap**: No mandatory e-prescribing standard yet in SA -- this is an opportunity for digital health platforms

### 5.3 Clinical AI Guidelines (Booklet 20 -- September 2025)

The HPCSA published **Booklet 20: Ethical Guidelines on the Use of Artificial Intelligence** in September 2025.

**Core principles**:

| Principle | Requirement |
|---|---|
| **AI as tool, not substitute** | AI must never replace the ethical, human-centred practice of healthcare professionals |
| **Patient disclosure** | Patients must be informed when AI tools are used in their care |
| **Informed consent** | Patient autonomy and consent must be preserved in AI-assisted care |
| **Practitioner accountability** | The practitioner remains legally and ethically accountable for all decisions, even when AI tools are used |
| **Bias awareness** | Practitioners must be aware of potential bias in AI systems |
| **Data privacy** | AI use must comply with POPIA and patient confidentiality requirements |
| **Scope** | Covers digital workflows, telehealth, decision-support, and patient engagement |

**Current gaps** (identified by legal scholars):
- Telehealth guidelines remain anchored in outdated face-to-face consultation assumptions
- No specific provisions for semi-autonomous or autonomous AI in diagnostics
- Guidelines do not contemplate AI's growing role in clinical decision-making beyond decision-support
- **Implication for Health OS**: AI features should be clearly positioned as clinical decision support, not autonomous diagnosis

**Source**: [EZMed analysis](https://ezmed.solutions/hpcsa-updates-booklet-20-and-redefines-ai-use-in-allied-health/) | [Werksmans legal opinion](https://www.werksmans.com/legal-updates-and-opinions/from-promise-to-practice-responsible-ai-in-south-african-healthcare/)

### 5.4 Data Retention Summary

| Patient Category | Minimum Retention |
|---|---|
| Adults | 6 years from dormancy |
| Minors (under 18) | Until age 21 |
| Mentally incompetent | Patient's lifetime |
| Occupational exposure | 25 years |
| Electronic records | Indefinite (recommended) |

---

## 6. NHI Status (National Health Insurance)

**Sources**: [Central News](https://centralnews.co.za/nhi-implementation-on-hold-as-litigation-set-for-may-2026-presidency-confirms/) | [Bhekisisa/Daily Maverick](https://www.dailymaverick.co.za/article/2026-03-19-can-south-africa-fix-its-health-system-before-the-courts-decide-its-fate/) | [SA News](https://www.sanews.gov.za/south-africa/president-delays-proclamation-sections-nhi-act)

### 6.1 Current Status (as of March 2026)

| Aspect | Status |
|---|---|
| **NHI Act** | Signed into law May 2024 (Act No. 20 of 2023) |
| **Implementation** | FROZEN -- President Ramaphosa agreed to delay proclamation of all sections |
| **Court hearing** | **5-7 May 2026** -- Constitutional Court |
| **Number of legal challenges** | **12+ court cases** challenging constitutionality |
| **Preparatory work** | Department of Health continuing background preparations |

### 6.2 What the NHI Act Proposes

- Universal health coverage through a **single, state-run National Health Insurance Fund**
- Pool money from taxes and other sources
- Pay for quality care for everyone regardless of income
- End the two-tier system (private medical schemes vs underfunded public hospitals)
- Centralised procurement of health services

### 6.3 Court Challenges

**Challengers include**:
- Health Funders Association
- South African Medical Association (SAMA)
- Board of Healthcare Funders (BHF)
- Private Practitioners Forum
- Hospital Association of South Africa (HASA)
- Western Cape Provincial Government
- Trade unions

**Primary grounds**:
- Inadequate public participation process before Act was signed
- Constitutional concerns about property rights (medical scheme industry)
- Concerns about implementation feasibility
- Provincial autonomy issues

**Timeline**:
- Gauteng High Court ruled against implementation
- President Ramaphosa appealed to Constitutional Court (February 2026)
- Constitutional Court hearing: **5-7 May 2026**
- Health Minister states preparatory work continues regardless

### 6.4 Technology Requirements (HNSF)

The **Health Normative Standards Framework for Interoperability in eHealth** (HNSF), developed by CSIR and the National Department of Health, defines the technology standards for digital health interoperability:

| Layer | Standards |
|---|---|
| **Content standards** | HL7 Clinical Document Architecture (CDA), Continuity of Care Document (CCD) |
| **Identifier standards** | ISO 22220:2011, ISO/TS 27527:2010 |
| **Messaging standards** | HL7 V2.X, DICOM (imaging), SDMX-DM (statistics) |
| **Terminology standards** | ICD-10, LOINC, UPFS (Uniform Patient Fee Schedule), procedure codes, medicine codes |
| **Interoperability focus** | Semantic, syntactic, and organisational interoperability |

**Source**: [Government Gazette (2014)](https://www.gov.za/sites/default/files/gcis_document/201409/37583gen314.pdf) | [Updated 2021 framework](https://www.gov.za/documents/notices/national-health-act-national-2021-normative-standards-framework-interoperability)

### 6.5 Impact on Private Healthcare

**If NHI is upheld and implemented**:
- Medical schemes may transition to supplementary "gap cover" role
- Private practitioners would contract with the NHI Fund
- Centralised tariff/payment system
- Mandatory participation by all healthcare providers
- Private hospitals would serve NHI patients alongside private patients

**Current reality**:
- Implementation is indefinitely delayed pending court outcomes
- Private sector continues operating under Medical Schemes Act
- No immediate changes required for digital health platforms
- **Recommendation**: Build systems that are NHI-compatible (HNSF standards, HL7 CDA, ICD-10) to future-proof

### 6.6 Interoperability Mandates

Under NHI, all health information systems would need to:
1. Comply with HNSF standards
2. Support HL7 messaging for patient data exchange
3. Use standardised terminology (ICD-10, LOINC)
4. Enable patient identification across facilities
5. Support centralised reporting to NHI Fund
6. Maintain audit trails for all transactions

---

## Appendix A: Key Regulatory Bodies

| Body | Role | Website |
|---|---|---|
| **CMS** (Council for Medical Schemes) | Regulates medical schemes | [medicalschemes.co.za](https://www.medicalschemes.co.za/) |
| **BHF** (Board of Healthcare Funders) | Industry body for medical scheme funders | [bhfglobal.com](https://bhfglobal.com/) |
| **PHISC** (Private Healthcare Information Standards Committee) | Healthcare information standards | [phisc.net](https://www.phisc.net/) |
| **HPCSA** (Health Professions Council of South Africa) | Regulates healthcare practitioners | [hpcsa.co.za](https://www.hpcsa.co.za/) |
| **SAPC** (SA Pharmacy Council) | Regulates pharmacy practice | [pharmcouncil.co.za](https://www.pharmcouncil.co.za/) |
| **Information Regulator** | Enforces POPIA and PAIA | [inforegulator.org.za](https://inforegulator.org.za/) |
| **NDoH** (National Department of Health) | National health policy | [health.gov.za](https://www.health.gov.za/) |
| **OHSC** (Office of Health Standards Compliance) | Quality standards for health establishments | [ohsc.org.za](https://www.ohsc.org.za/) |
| **SAHPRA** (SA Health Products Regulatory Authority) | Medicines and devices regulation | [sahpra.org.za](https://www.sahpra.org.za/) |

## Appendix B: Key Legislation Quick Reference

| Legislation | Key Provisions for Health OS |
|---|---|
| **Medical Schemes Act 131/1998** | PMB obligations, 30-day payment, member rights, scheme governance |
| **POPIA (Act 4/2013)** | Health data as special personal information, consent, breach notification, retention |
| **POPIA Health Regulations (March 2026)** | 8 categories of responsible parties, immediate compliance, security standards |
| **National Health Act 61/2003** | HNSF interoperability framework, NHI implementation |
| **NHI Act 20/2023** | Universal coverage (implementation frozen pending ConCourt, May 2026) |
| **Electronic Communications & Transactions Act 25/2002** | Legal validity of electronic records and signatures |
| **Consumer Protection Act 68/2008** | Patient rights as consumers of healthcare services |
| **Medicines and Related Substances Act 101/1965** | Prescribing, dispensing, scheduling of medicines |

## Appendix C: Compliance Checklist for Health OS

### Must-Have (Legal Requirements)

- [ ] **POPIA compliance**: Privacy policy, consent management, breach notification process
- [ ] **Health data regulations (March 2026)**: Security measures for electronic health records
- [ ] **HPCSA record retention**: 6 years adults, 21 for minors, indefinite electronic
- [ ] **ICD-10 coding**: All diagnoses coded per SA ICD-10 MIT
- [ ] **CPT/CCSA coding**: All procedures coded per PHISC CCSA v11
- [ ] **NAPPI codes**: All pharmaceutical items identified
- [ ] **30-day claims tracking**: Alert when claims approach/exceed 30-day payment deadline
- [ ] **PMB flagging**: Auto-identify PMB conditions to prevent incorrect rejections
- [ ] **CDL management**: Track and manage all 27 chronic disease conditions
- [ ] **Audit trail**: All data access and modifications logged
- [ ] **AI disclosure**: Inform patients when AI tools are used (HPCSA Booklet 20)

### Should-Have (Best Practice / Future-Proofing)

- [ ] **HNSF compliance**: HL7 CDA, LOINC, ISO identifiers
- [ ] **HL7 FHIR support**: Modern interoperability standard (global trend)
- [ ] **NHI readiness**: Centralised reporting, standardised tariffs
- [ ] **eRA integration**: Electronic remittance advice processing
- [ ] **MEDCLM/EDIFACT**: Electronic claims submission
- [ ] **Cross-border data controls**: POPIA Section 72 compliance for cloud hosting
- [ ] **72-hour breach notification**: Automated process per Regulator guidance
- [ ] **Data minimisation**: Only collect health data necessary for stated purpose

---

*This document is for reference purposes and does not constitute legal advice. Consult with healthcare regulatory specialists for compliance decisions. Regulations are subject to change -- verify current versions at the source websites linked above.*
