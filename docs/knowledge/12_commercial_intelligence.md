# 12 — Commercial Intelligence: Contracts, Pricing, Procurement & Accreditation

> Compiled: 2026-03-21
> Scope: South African health-tech companies selling software to medical practices, scheme administrators, hospital groups, and government schemes.
> Purpose: Legal-team reference for go-to-market preparation.

---

## 1. CONTRACT & SLA STANDARDS

### 1.1 SLAs Medical Schemes Expect from Technology Providers

There is no single CMS-mandated SLA template, but the following expectations are standard across scheme administrator and managed-care contracts:

| Metric | Typical Expectation | Notes |
|---|---|---|
| **System uptime** | 99.5 – 99.9 % (measured monthly) | Claims switches (MediKredit, Healthbridge) operate 24/7/365; downtime during business hours is contractually penalised |
| **Planned maintenance window** | Weekends / after 22:00 SAST | Must be communicated 48–72 hrs in advance |
| **Critical incident response** | ≤ 1 hour during business hours | SA Treasury Good Practice Guide on SLAs sets this benchmark for government entities |
| **High-priority response** | ≤ 2 hours | |
| **Medium-priority response** | ≤ 4 hours | |
| **Low-priority / general requests** | ≤ 8–24 hours | |
| **Claims adjudication latency** | < 5 seconds per real-time claim | MediKredit switch standard |
| **Data handling** | POPIA-compliant; encrypted at rest and in transit | Schemes increasingly require ISO 27001 or SOC 2 evidence |
| **Reporting** | Monthly uptime reports, incident post-mortems within 5 business days | |
| **Penalties** | Service credits (5–15 % of monthly fee per SLA breach), escalating to termination rights after repeated failures | |

**Key point:** Large schemes (Discovery, GEMS) will impose their own SLA addenda. Smaller schemes defer to administrator SLAs (Medscheme, Metropolitan Health, Momentum Health).

### 1.2 Standard Terms in PMS Vendor Agreements with Switching Houses

Switching houses (MediKredit, Healthbridge) require formal integration agreements. Standard terms include:

**MediKredit Integration Agreement:**
- PMS vendor must complete accreditation against MediKredit's XML specification (single XML spec covers eligibilities, FamCheck, AuthCheck, claims, reversals, resubmissions, re-sends)
- Comprehensive XSD validation of all request/response types
- Access to a dedicated 24/7/365 test environment with current funder rules, NAPPI tariff pricing, and POPIA-compliant dummy beneficiary data
- Integration can be via web services or the HealthNet ST application
- Post-accreditation: vendor must maintain compliance as specifications are updated
- Typical contractual provisions: data confidentiality, IP protection (MediKredit retains ownership of specification), indemnification for data breaches, termination for non-compliance

**Healthbridge:**
- EDI routing and data transport agreements
- Percentage-based pricing model tied to monthly claim value and speciality
- Minimum transaction volumes may apply for enterprise agreements
- Integration with 7,000+ practices, processing 3.25M+ encounters annually (2024 figures)

**Common contractual terms across both:**
- Non-disclosure / confidentiality obligations
- Compliance with Medical Schemes Act and POPIA
- Right to audit PMS vendor's security controls
- Liability caps and mutual indemnification
- Notice periods for termination (typically 3–6 months)
- Obligation to implement specification changes within defined timelines

### 1.3 Insurance Requirements for a Health-Tech Company

| Insurance Type | Recommended / Required | Typical Minimums | Notes |
|---|---|---|---|
| **Professional Indemnity (PI)** | Strongly recommended; required by most enterprise clients | R5M – R20M per claim | Covers errors, omissions, and negligent advice in software. FSPs regulated under FAIS are required to hold PI (R1M–R5M minimum depending on category) |
| **Cyber Liability Insurance** | Essential | R5M – R50M depending on data volume | Covers data breach costs, notification expenses, regulatory fines, business interruption. Major providers: Chubb, AIG, SHA, iTOO |
| **General Liability** | Required for office/premises | R1M – R5M | |
| **Directors & Officers (D&O)** | Recommended for any company with a board | R5M+ | |
| **Key Person Insurance** | Recommended for startups | Varies | |

**Important:** PI insurance is not strictly mandatory for IT companies in SA law, but scheme administrators, hospital groups, and government entities will refuse to contract without evidence of PI and cyber cover. Discovery Health and Netcare both require proof of insurance during vendor onboarding.

### 1.4 BEE Requirements for Selling to Government Schemes (GEMS, Polmed)

**Legal framework:** Broad-Based Black Economic Empowerment Act 53 of 2003, as amended. ICT-specific requirements fall under the **Amended ICT Sector Code**.

**ICT Sector Code Scorecard:**

| Element | Weighting | Target |
|---|---|---|
| **Ownership** | 28 points (+2 bonus) | 30% Black ownership (voting rights + economic interest) |
| **Management Control** | 15 points | Black representation in top, senior, middle, junior management |
| **Skills Development** | 25 points | Training spend on Black employees |
| **Enterprise & Supplier Development** | 40 points (+4 bonus) | Procurement from BEE-compliant suppliers; enterprise development contributions |
| **Socio-Economic Development** | 5 points | Community contributions |

**Enterprise classification thresholds:**
- **EME (Exempt Micro Enterprise):** Revenue ≤ R10M — automatic Level 4 (Level 1 if ≥51% Black-owned)
- **QSE (Qualifying Small Enterprise):** Revenue R10M – R50M — simplified scorecard
- **Large Enterprise:** Revenue > R50M — full scorecard

**Government procurement requirements:**
- GEMS procurement follows its **Supply Chain Management Policy** with formal RFQ/RFP/tender processes
- All government entities require a valid **BEE certificate** (verified by a SANAS-accredited verification agency or sworn affidavit for EMEs)
- **Level 1 = 135% procurement recognition** (preferred); Level 4 = 100%; Level 8 = 10%; Non-compliant = 0%
- GEMS operates a **Procurement Advice Centre (PAC)** offering tender training and supplier database registration coaching
- Polmed (police medical scheme) follows similar government procurement rules and may merge with GEMS

**Practical reality:** For a health-tech startup, achieving Level 1–2 BEE early is a major competitive advantage. A 51%+ Black-owned EME automatically qualifies as Level 1 with no verification audit needed.

### 1.5 CIPC Registration Requirements

**Standard registration (via BizPortal or CIPC eServices):**
- Choose entity type: Private Company (Pty) Ltd is standard for health-tech
- Minimum 1 director (SA ID required; foreign directors submit notarised passport)
- Name reservation (1–4 proposed names, R50)
- Registration fee: R175 (online via BizPortal — same-day processing)
- Required documents: certified IDs for all directors/incorporators, signed registration form (CoR 14.1), proof of address
- No passports or driver's licences accepted for SA citizens — only SA ID
- CIPC does not accept applications without a registered office address

**Health-tech specific considerations:**
- No special CIPC category for health-tech; register as a standard Pty Ltd
- Obtain a tax clearance certificate (SARS) — required for all government tenders
- Register for VAT if revenue exceeds R1M per annum (mandatory)
- Consider a trade name registration if operating under a brand name different from the company name

---

## 2. PRICING MODELS IN SA HEALTH-TECH

### 2.1 SaaS Pricing Models Used in SA Health-Tech

| Model | Description | Used By | Typical Range |
|---|---|---|---|
| **Per-user / per-seat** | Monthly fee per licensed user | GoodX, Elixir, Solumed | R600 – R3,000 /user/month |
| **Per-practice** | Flat monthly fee per practice location | Healthbridge (partially), smaller PMS vendors | R1,500 – R5,000 /practice/month |
| **Per-claim / transaction** | Fee per successfully processed claim | Healthbridge, MediKredit (to PMS vendors) | R0.50 – R5.00 per claim |
| **Percentage of revenue** | % of monthly claim value | Healthbridge (billing module) | 1–3 % of claim value |
| **Tiered subscription** | Feature-based tiers (Basic/Pro/Enterprise) | Navitas (Green/Gold), Pabau | R500 – R5,000+ /month |
| **Quote-based / bespoke** | Custom pricing based on assessment | GoodX, Solumed Pro, enterprise solutions | Varies widely |
| **White-label licence** | Annual or monthly licence to rebrand and resell | Enterprise/administrator market | R50K – R500K+ /year |

### 2.2 What Practices Are Willing to Pay Monthly

**Solo GP practice:** R800 – R2,000/month (basic billing + claims submission)
**Small practice (2–3 practitioners):** R2,000 – R5,000/month
**Medium practice (4–10 practitioners):** R5,000 – R15,000/month
**Large multi-disciplinary / specialist group:** R15,000 – R50,000+/month
**Hospital/clinic chain (per site):** R20,000 – R100,000+/month

**Key pricing factors:**
- Speciality type (specialists pay more due to complex billing)
- Number of users / practitioners
- Modules selected (billing, clinical notes, scheduling, stock management, reporting)
- Claims switching costs (often passed through or bundled)
- Setup/onboarding fees: R1,500 – R5,000 one-time (GoodX charges R1,500)
- SMS / communication add-ons: R0.30 – R0.50 per SMS
- Telemed links: R0.36 per link (GoodX)
- Online payment processing: 3.4% of transaction value (GoodX via payment gateway)

**Cancellation terms:** Typically 1–3 months' notice. GoodX requires 1 month.

### 2.3 Enterprise Pricing for Scheme Administrators

Scheme administrators (Medscheme, Discovery Health, Metropolitan Health, Momentum Health) consume technology at enterprise scale:

- **Per-member-per-month (PMPM):** R5 – R30 PMPM for technology platform fees, depending on modules
- **Per-beneficiary-per-month (PBPM):** Similar to PMPM but counts dependants
- **Administration cost benchmarks:** Compound administration cost increases have averaged 7.5% annually (2000–2016), exceeding inflation (5.7%). CMS monitors these closely
- **Technology outsourcing:** Medscheme outsources technology to Helios IT Solutions; Discovery Health builds in-house (Vitality platform). This creates two buyer profiles: build-vs-buy
- **Contract durations:** 3–5 year terms typical for scheme administrator technology contracts, with annual renewal options thereafter
- **Total contract values:** R10M – R500M+ over contract term for large administrator platforms

### 2.4 White-Label Licensing Models

White-label agreements in SA health-tech typically include:

- **Licence fee structure:** Annual licence (R100K – R500K+) or monthly SaaS fee with minimum commitment
- **Revenue share:** 10–30% of end-customer revenue generated through the platform
- **Branding rights:** Licensee may rebrand UI, domain, and communications; licensor retains underlying IP
- **IP ownership:** Source code remains with licensor; licensee gets a non-exclusive, non-transferable licence
- **Customisation costs:** Bespoke development billed separately (T&M or fixed-price SOWs)
- **Support tiers:** L1 support by licensee, L2/L3 escalation to licensor
- **Data ownership:** Data generated by end-users belongs to the licensee (or their customers); licensor may retain anonymised/aggregated data rights
- **Territorial exclusivity:** Often granted per province or market segment (e.g., "dental practices in Gauteng")
- **Minimum volume commitments:** Required to maintain exclusivity
- **Exit provisions:** Data portability, transition period (90–180 days), source code escrow if licensor becomes insolvent

---

## 3. DATA AGREEMENTS

### 3.1 Standard Data Processing Agreement (DPA) Terms for Health Data

Under POPIA, a DPA (called an "operator agreement") must be in writing between the responsible party and the operator. Key terms:

**Mandatory provisions (POPIA Section 21):**
1. Processing only on instructions of the responsible party
2. Operator must implement security measures per Section 19 (appropriate technical and organisational measures)
3. Confidentiality obligations binding all employees involved in processing
4. Notification of data breaches to the responsible party "immediately" upon discovery
5. Return or destruction of personal information upon termination

**Health-data-specific requirements (effective March 6, 2026):**
- Eight categories of organisations now have explicit obligations: employers, insurers, medical schemes, medical scheme administrators, managed care organisations, occupational health service providers, brokers, and health researchers
- Technical and organisational measures must align with "generally accepted information security practices applicable to the responsible party's own sector"
- This is a contextualised standard: a large insurer is held to financial-services-grade security; a small practice to a proportionate standard
- Confidentiality can arise from employment contracts, professional duties, or statute — not only from a signed agreement (Section 32(2) amendment)

**Recommended DPA additions (beyond POPIA minimum):**
- Sub-processor approval and flow-down obligations
- Data localisation / hosting location commitments
- Audit rights (annual or upon request)
- Data retention schedules aligned with HPCSA record-keeping requirements
- Incident response SLAs (notification within 24–72 hours)
- Insurance requirements (cyber liability minimum)
- Liability caps and indemnification

### 3.2 BAA Equivalent in South Africa

South Africa does not have a direct equivalent of the US HIPAA Business Associate Agreement (BAA). Instead, the framework is:

| US (HIPAA) | SA Equivalent | Legal Basis |
|---|---|---|
| BAA | **POPIA Operator Agreement** | POPIA Section 20–21 |
| Covered Entity | **Responsible Party** | POPIA Section 1 |
| Business Associate | **Operator** | POPIA Section 1 |
| PHI | **Special Personal Information (health data)** | POPIA Section 26–32 |
| HHS enforcement | **Information Regulator** | POPIA Section 39 |

**What's required:**
- Written agreement between responsible party and operator (Section 21)
- Operator must treat data with same level of security as the responsible party
- Operator must notify responsible party of any breach
- Responsible party remains ultimately liable for POPIA compliance — cannot outsource accountability

**Penalties for non-compliance:**
- Administrative fines up to R10 million
- Criminal prosecution (imprisonment up to 10 years for serious offences)
- Civil claims from affected data subjects

### 3.3 Data Escrow Requirements

There is no explicit CMS regulation mandating data escrow for medical scheme data. However:

- **Best practice:** Source code escrow is common in enterprise software agreements where the buyer depends on a single vendor. NCC Group and Iron Mountain offer escrow services in SA
- **Administrator accreditation:** CMS requires administrators to maintain "comprehensive data back-up and offsite storage measures" — this effectively mandates data resilience but not formal escrow
- **White-label contracts:** Should include source code escrow provisions in case the licensor becomes insolvent
- **Scheme data portability:** Medical schemes must be able to migrate data to a new administrator. Contracts should specify data export formats (CSV, HL7 FHIR, XML) and transition timelines

### 3.4 Cloud Hosting Requirements — SA-Hosted Data

**Legal position:**
- There is **no law explicitly requiring** SA-hosted infrastructure for health data
- However, POPIA Section 72 restricts cross-border transfers to countries with "adequate protection" or where the data subject consents
- The **National Data and Cloud Policy (2024)** encourages local hosting for sensitive government and healthcare data
- Nigeria and SA both "mandate local storage for sensitive government, financial, and healthcare data" in practice, even where legislation is not explicit

**Practical requirements from buyers:**
- **Government schemes (GEMS, Polmed):** Strongly prefer or require SA-hosted data. Azure South Africa (Johannesburg/Cape Town regions) and AWS Africa (Cape Town) are the accepted hyperscalers
- **Private schemes:** Discovery, Bonitas — generally accept Azure/AWS SA regions; some accept EU hosting if POPIA-compliant
- **Hospital groups:** Netcare and Mediclinic prefer SA-hosted; Life Healthcare is more flexible
- **CMS inspections:** The Registrar may order inspections and request copies of data. If data is offshore, this creates jurisdictional complications

**Recommended approach:**
- Host primary infrastructure in Azure South Africa or AWS af-south-1 (Cape Town)
- DR/backup can be in a second SA region or an "adequate" jurisdiction (EU)
- Document cross-border transfer justification in a POPIA Transfer Impact Assessment

### 3.5 Backup and Disaster Recovery Requirements from CMS

CMS administrator accreditation explicitly requires:
1. **Comprehensive disaster recovery plan** — documented, tested regularly
2. **Business continuity plan** — covering operations during and after a disruption
3. **Comprehensive data backup** — regular automated backups
4. **Offsite storage** — backups stored at a geographically separate location
5. **Fraud detection services** — systems to identify and flag fraudulent claims

**Industry-standard expectations (not explicitly in CMS regs but expected by schemes):**
- RPO (Recovery Point Objective): ≤ 1 hour for claims data
- RTO (Recovery Time Objective): ≤ 4 hours for critical systems
- Annual DR testing with documented results
- Geo-redundant backups (minimum 2 locations)
- Encryption of backups (AES-256 or equivalent)
- Backup retention: minimum 5 years (aligned with HPCSA record-keeping and prescription periods)

---

## 4. TENDER & PROCUREMENT

### 4.1 Government Scheme Procurement (GEMS, Polmed)

**GEMS procurement process:**
1. **Supplier registration:** Register on GEMS supplier database via their Procurement Advice Centre (PAC)
2. **Tender publication:** GEMS publishes RFQs, RFPs, and tenders in accordance with its Supply Chain Management Policy
3. **Evaluation criteria:** Technical capability (functionality, security, integration), BEE scorecard, price, transformation commitments, reference clients
4. **BEE weight:** Typically 20–30 points out of 100 in tender evaluation
5. **Mandatory documents:** Valid BEE certificate, tax clearance, CIPC registration, PI insurance, company profile, audited financials
6. **Award:** Board approval required; contracts typically 3–5 years with renewal options
7. **Oversight:** GEMS reports to the Minister of Public Service and Administration; procurement is subject to PFMA and SCM regulations

**GEMS scale:** 2M+ beneficiaries; one of the largest restricted medical schemes in Africa.

**Polmed:** Follows similar government procurement rules. Has been identified for potential amalgamation with GEMS.

**Key tip:** GEMS runs **Tender Training and Supplier Database Registration Coaching Programs** — attend these to understand evaluation criteria.

### 4.2 Private Scheme Vendor Selection (Discovery, Bonitas)

Private schemes and their administrators use a different procurement model:

- **Discovery Health** (administers Discovery Health Medical Scheme + Bonitas + others):
  - Primarily builds technology in-house (Vitality ecosystem)
  - External vendors selected via invitation-only RFP or direct approach
  - Heavy emphasis on innovation, scalability, and integration with existing Discovery systems
  - Long evaluation cycles (6–18 months)
  - Vendor must demonstrate POPIA compliance, cyber insurance, and BEE credentials

- **Medscheme** (administers Bonitas, Fedhealth, others):
  - Outsources technology to Helios IT Solutions (AfroCentric Group subsidiary)
  - External vendors may be contracted for niche capabilities
  - Formal RFP process for significant procurements
  - Evaluation: technical fit, cost, BEE, cultural alignment

- **General private scheme process:**
  1. Relationship-driven — warm introductions and industry presence matter
  2. Proof-of-concept / pilot before full contract
  3. Legal and compliance review (POPIA, MSA compliance)
  4. Commercial negotiation (pricing, SLAs, liability)
  5. Board / Exco approval
  6. Contract execution with 90-day implementation timeline

### 4.3 Hospital Group Technology Procurement

**Netcare:**
- All potential suppliers must complete an **accreditation questionnaire**
- Supplier registration via [netcare.co.za/Netcare-Suppliers](https://www.netcare.co.za/Netcare-Suppliers)
- Uses Zycus for source-to-contract management (iSource and iContract)
- Emphasis on digital integration, transparency, and compliance
- BEE, environmental sustainability, and transformation are evaluation criteria

**Mediclinic:**
- Formal vendor registration and accreditation process
- Strong preference for established vendors with hospital-grade security
- International procurement standards (Mediclinic operates in SA, Namibia, Switzerland, UAE)

**Life Healthcare:**
- Vendor registration form publicly available
- Considers environmental sustainability in vendor selection
- Formal procurement team with clinical input on technology decisions

**Common hospital group requirements:**
- Integration with existing HIS (Hospital Information Systems)
- HL7/FHIR interoperability
- 24/7 support with on-site capability
- Change management and training included
- Reference sites (other SA hospitals using the solution)

### 4.4 Typical Sales Cycles

| Buyer Type | Sales Cycle | Key Driver |
|---|---|---|
| **Solo / small practice** | 2–6 weeks | Demo → trial → sign |
| **Medium practice group** | 1–3 months | Practice manager decision |
| **Large practice group / IPA** | 3–6 months | Committee decision, pilot required |
| **Scheme administrator** | 6–18 months | RFP, legal review, board approval |
| **Government scheme (GEMS)** | 6–24 months | Tender process, BEE evaluation, board approval |
| **Hospital group** | 6–18 months | Accreditation, pilot, procurement committee |
| **Private medical scheme** | 6–12 months | Relationship + RFP hybrid |

**Industry average:** 8 months for enterprise health-tech sales globally. SA adds 2–4 months due to BEE evaluation, POPIA compliance verification, and government procurement requirements.

---

## 5. CERTIFICATION & ACCREDITATION

### 5.1 Does a PMS Need Formal Certification to Operate in SA?

**No mandatory government certification exists** for PMS software in South Africa. There is no equivalent of FDA clearance (US) or CE marking (EU) for practice management software.

However, in practice:
- **Switching house accreditation is functionally mandatory** — a PMS that cannot submit claims electronically via MediKredit or Healthbridge is commercially unviable
- **ICD-10 coding compliance** is expected (SA uses ICD-10 with local modifications)
- **NAPPI code integration** is required for pharmaceutical claims
- **POPIA compliance** is a legal requirement for any system handling personal health information

### 5.2 MediKredit / Healthbridge Accreditation

**MediKredit accreditation:**
- **Functionally mandatory** for any PMS that wants to submit real-time claims
- MediKredit's HealthNet ST switch is integrated with the "majority of PMS vendors in South Africa"
- Covers ~5,000 pharmacies, 22,000+ doctor practices, 300+ private hospitals, 155 public hospitals
- Process:
  1. Request integration pack from MediKredit
  2. Develop integration against XML specification and XSD schemas
  3. Test in MediKredit's 24/7/365 test environment
  4. Complete accreditation validation with MediKredit integration team
  5. Go live with ongoing compliance monitoring
- **Timeline:** 4–12 weeks depending on vendor capability
- **Cost:** Not publicly disclosed; typically included in switching fee arrangements

**Healthbridge accreditation:**
- Similar integration process for EDI routing
- Healthbridge provides its own data transport specifications
- 7,000+ practices already on the platform

**Bottom line:** While technically "optional," operating without switching house accreditation means practices cannot submit electronic claims — making it a de facto requirement.

### 5.3 CMS Accreditation for Administrators — Does It Apply to Tech Vendors?

**CMS accreditation applies to:**
- Medical scheme administrators
- Managed care organisations
- Brokers and broker organisations

**CMS accreditation does NOT directly apply to:**
- PMS software vendors
- Technology platform providers
- Claims switching houses (though they are regulated under the MSA indirectly)

**However:**
- If a technology vendor effectively performs administration functions (membership management, claims processing, benefit management), CMS may classify them as an administrator requiring accreditation
- CMS accreditation requirements for administrators include technology standards: disaster recovery plans, business continuity plans, data backup with offsite storage, fraud detection capabilities
- A tech vendor selling to an administrator must demonstrate compliance with these standards as a sub-contractor
- CMS can inspect administrators and their sub-contractors

**Key accreditation criteria for administrators (relevant to tech vendor contracts):**
- Applicants must be "fit and proper"
- Must have "necessary resources, skills, capacity, and infrastructure"
- Must be "financially sound"
- Must maintain registration and membership records
- Must provide claims advice statements
- Must have comprehensive disaster recovery and business continuity plans

### 5.4 HPCSA Position on Third-Party Software Handling Clinical Data

The HPCSA's **Guidelines for Good Practice (Booklet 9 — Patient Records)** establishes:

1. **Record-keeping obligation:** Healthcare practitioners must maintain patient records that are accurate, up-to-date, and complete
2. **Electronic records:** Accepted, but must meet the same standards as paper records
3. **Security:** Practitioners must "avoid accidental damage and loss of patient information" and "set out procedures to avoid any unwarranted alteration or elimination of patient data"
4. **Third-party disclosure:** "No health care practitioner shall make information available to any third party without the written authorisation of the patient or a court order or where non-disclosure of the information would represent a serious threat to public health"
5. **Software vendor liability:** The HPCSA limits liability for digital health apps in certain contexts, but the CPA (Consumer Protection Act), MRSA (Medicines and Related Substances Act), and SAHPRA can impose liability on software providers
6. **Practitioner remains responsible:** Even when using third-party software, the registered practitioner retains professional responsibility for patient data. The software vendor cannot assume clinical accountability

**Practical implications for tech vendors:**
- Build audit trails (who accessed what, when)
- Implement role-based access control
- Provide data export capability (practitioners must be able to retrieve their records)
- Maintain records for the HPCSA-mandated retention period (typically 5–10 years depending on record type; longer for minors)
- Include HPCSA compliance language in practitioner-facing terms of service

---

## 6. REGULATORY QUICK REFERENCE

### Key Legislation for SA Health-Tech

| Law / Regulation | Relevance |
|---|---|
| **Medical Schemes Act 131 of 1998** | Governs schemes, administrators, managed care; CMS accreditation requirements |
| **POPIA (Act 4 of 2013)** | Data protection; operator agreements; health data as special personal information |
| **POPIA Health Data Regulations (March 2026)** | Specific obligations for 8 categories of health data processors |
| **Consumer Protection Act 68 of 2008** | Software as a service to consumers; unfair contract terms |
| **Electronic Communications & Transactions Act 25 of 2002** | Legal validity of electronic records and signatures |
| **BBBEE Act 53 of 2003 + ICT Sector Code** | Procurement eligibility for government and large enterprise |
| **Cybercrimes Act 19 of 2020** | Data breach reporting; criminalises unauthorised access |
| **National Health Act 61 of 2003** | Framework for health information systems |
| **PFMA (Public Finance Management Act)** | Governs procurement by government entities including GEMS |

### Key Regulatory Bodies

| Body | Role |
|---|---|
| **CMS (Council for Medical Schemes)** | Regulates medical schemes, administrators, managed care |
| **Information Regulator** | Enforces POPIA; investigates data breaches |
| **HPCSA** | Regulates health practitioners; guidelines on patient records |
| **CIPC** | Company registration; BEE certificates for EMEs |
| **SARS** | Tax compliance; tax clearance for tenders |
| **SAHPRA** | Medical device regulation (if software qualifies as a medical device) |
| **BBBEE Commission** | Monitors and enforces BEE compliance |

---

## 7. GO-TO-MARKET CHECKLIST

For a health-tech company preparing to sell software to SA medical practices and schemes:

- [ ] **CIPC registration** — Pty Ltd, R175 via BizPortal
- [ ] **SARS registration** — Tax number + VAT if revenue > R1M
- [ ] **BEE certificate** — Sworn affidavit (EME) or SANAS-verified (QSE/Large)
- [ ] **POPIA compliance** — Information Officer registered with Information Regulator; operator agreement template ready
- [ ] **Professional Indemnity insurance** — Minimum R5M
- [ ] **Cyber Liability insurance** — Minimum R5M (R10M+ recommended)
- [ ] **MediKredit accreditation** — Integration pack requested; development against XML spec
- [ ] **Healthbridge integration** — EDI routing integration (optional but commercially important)
- [ ] **Cloud hosting** — Azure SA or AWS af-south-1 (Cape Town)
- [ ] **Disaster recovery plan** — Documented, tested, with offsite backup
- [ ] **Standard contracts ready** — SaaS subscription agreement, DPA/operator agreement, SLA, white-label licence template
- [ ] **GEMS supplier registration** — Register on database; attend PAC coaching
- [ ] **Hospital group registration** — Netcare, Mediclinic, Life Healthcare accreditation questionnaires
- [ ] **Tax clearance certificate** — Required for all government tenders
- [ ] **Audited financials** — Required for enterprise and government contracts

---

*This document is for strategic planning purposes. Consult qualified South African legal counsel (health regulatory, data protection, and commercial law) before finalising contracts.*
