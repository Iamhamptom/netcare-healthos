# 11. Business Intelligence — SA Health-Tech Market

> **Purpose**: Actionable CTO / legal / sales intelligence for VisioCorp entering the SA private healthcare software market.
> **Last updated**: 2026-03-21
> **Confidence key**: [VERIFIED] = sourced from official body; [ESTIMATED] = industry consensus / proxy data; [CONTACT] = must verify directly with vendor.

---

## A. INTEGRATION & VENDOR ACCREDITATION

### A1. MediKredit — PMS Vendor Accreditation

MediKredit operates its proprietary **HealthNet ST** switch, integrated with ~5,000 pharmacies, 22,000+ doctor practices, 300+ private hospitals, and 155 public hospitals.

| Item | Detail |
|------|--------|
| **Integration spec** | XML-based, single specification supporting eligibilities, FamCheck, AuthCheck, claims, reversals, resubmissions, re-sends across all disciplines |
| **Validation** | Comprehensive XSDs for request/response validation |
| **Submission methods** | Web services (SOAP/REST) or HealthNet ST application |
| **Test environment** | Dedicated vendor sandbox, available **24/7/365**, includes latest funder rules, NAPPI and tariff pricing, POPIA-compliant dummy beneficiary data |
| **Accreditation process** | 1) Request integration pack from MediKredit integration team → 2) Develop integration per specs → 3) Test in sandbox → 4) Formal accreditation in live environment → 5) Go-live |
| **Timeline** | [CONTACT] — not publicly stated; expect 2-4 months based on complexity |
| **Cost** | [CONTACT] — no public fee schedule for vendor accreditation |
| **Contact** | Switchboard: +27 (0) 11 770-6000 · Call Centre: +27 (0) 860-932-273 · 15 Tambach Rd, Sunninghill, Sandton, 2191 |
| **Source** | [MediKredit PMS Vendors](https://www.medikredit.co.za/clients/practice-management-software-vendors/) |

**Action item**: Request integration pack immediately — it contains the full XML specification, XSD schemas, and test beneficiary list.

### A2. Altron HealthTech / SwitchOn (formerly MediSwitch)

SwitchOn is the second major claims switch. **8,000+ healthcare practices** use SwitchOn for claims switching.

| Item | Detail |
|------|--------|
| **Parent** | Altron HealthTech (division of Altron Pty Ltd), formed 2016 from merger of MedeMass, MediSwitch, MedeServe |
| **Products** | SwitchOn (claims switching), HealthONE (EHR), Elixir Live (PMS) |
| **Vendor integration** | [CONTACT] — no public vendor accreditation program documented; integration appears to be handled on a partnership basis |
| **WEBDesk** | webdesk.mediswitch.co.za — practice-facing web portal |
| **Contact** | hello.za@cgm.com · +27 861 633 334 (note: CGM acquired MedeMass assets) |
| **Source** | [Altron HealthTech SwitchOn](https://altronhealthtech.com/switchon/) |

**Action item**: Contact Altron HealthTech business development directly. No public developer portal exists — this is a relationship-based integration.

### A3. Healthbridge — Partner/Integration Program

Healthbridge is a **vertically integrated** PMS + billing + switching company. They are less of a "switch" and more of a complete solution.

| Item | Detail |
|------|--------|
| **Market position** | 25+ years in SA, designed specifically for local market |
| **Existing integrations** | RecoMed (patient booking), SuperSwipe (card terminals), Wild Apple (COID claims), Discovery HealthID |
| **Vendor program** | [CONTACT] — no formal public partner API program documented |
| **Unique model** | Healthbridge processes claims in-house (not through MediKredit/SwitchOn) — they have direct connections to 80%+ of medical aids |
| **Source** | [Healthbridge](https://healthbridge.co.za/) |

**Key insight**: Healthbridge is a **competitor**, not a partner. They own their entire stack from PMS to switch. Building an alternative means competing directly.

### A4. BHF PCNS 2.0 — Practice Number Verification

| Item | Detail |
|------|--------|
| **What it is** | Real-time practice number verification system run by Board of Healthcare Funders |
| **PCNS 2.0** | New platform at [pcns.co.za](https://www.pcns.co.za) with real-time search (no delay), online registration for funding organisations, online payment of annual fees |
| **Mobile app** | Launched **9 February 2026** — Phase 1 available for Pharmacies and GPs |
| **API access** | [CONTACT] — no public API documentation found; funding organisations must re-register on PCNS 2.0 to access data |
| **Data available** | Practice numbers, service provider details, discipline, location |
| **Registration** | Healthcare funding organisations must register at pcns.co.za to access search/verification |
| **Contact** | BHF: clientservices@bhfglobal.com · (+27) 87 210 0500 |
| **Source** | [BHF PCNS](https://bhfglobal.com/pcns/) |

**Action item**: Register as a funding organisation / technology partner to get API access. The mobile app launch suggests an API layer exists underneath.

### A5. SAHPRA — Medical Device Establishment Licence (for Software)

**Critical question**: Does VisioCorp's software qualify as a medical device (SaMD)?

| Item | Detail |
|------|--------|
| **Classification system** | Four-tier: Class A (lowest risk) → Class D (highest risk) |
| **SaMD classification** | Software that drives/influences clinical decisions with potential for significant patient harm = Class C or D. Billing/admin-only software likely does NOT require SAHPRA registration. |
| **AI/ML guidance** | SAHPRA issued AI/ML medical device guidance (September 2025), aligned with IMDRF, FDA, MHRA, WHO frameworks |
| **Licence types** | Manufacturer, Distributor, Wholesaler |
| **Application timeline** | 6-8 weeks from submission (depends on applicant responsiveness) |
| **Application fees** | Class A: ~ZAR 2,000 · Class B: ~ZAR 5,000-15,000 · Class C: ~ZAR 30,000-50,000 · Class D: ~ZAR 70,000+ [ESTIMATED — refer to Government Gazette for current schedule] |
| **Annual retention fee** | Due by last working day of June annually; failure = licence cancellation |
| **ISO 13485 required** | From **1 June 2025**, ISO 13485:2016 certificate from SAHPRA-recognised CAB required for licence renewal. Full enforcement by **1 April 2028**. |
| **Payment** | EFT only to SAHPRA |
| **Contact** | mdnotifications@sahpra.org.za · finance@sahpra.org.za |
| **Source** | [SAHPRA Medical Devices](https://www.sahpra.org.za/medical-devices/) · [RegDesk Guide](https://www.regdesk.co/blog/sahpra-guidelines-on-establishment-licensing-costs-documents-and-cooperation/) |

**Decision point**: If VisioCorp builds **clinical decision support**, **AI triage**, or **AI diagnosis** features → SaMD classification likely applies (Class C/D). Pure billing/admin/scheduling software → no SAHPRA registration needed.

---

## B. COMPETITIVE INTELLIGENCE — PRICING

### B1. Market Pricing Overview

SA practice management software pricing is opaque. Most vendors use quote-based models. Here is what we have been able to establish:

| Vendor | Pricing Model | Known Price Points | Notes |
|--------|--------------|-------------------|-------|
| **GoodX** | Per-practice + per-user | Setup: ~R1,500 · Monthly: ~R1,200-R2,700/mo (before tax) · Additional diary: ~R380/mo · Additional user: ~R37/mo | Higher-earning practices pay more. No free trial. 3.4% fee on online payments. [Source: user reports, GetApp] |
| **Healthbridge** | % of claim value | Per-claim: from R8 excl VAT (received) / R10 excl VAT (processed) | Percentage model based on monthly claim value + specialty. No long-term contract; 1-month notice. [CONTACT for current rates] |
| **Solumed** | Quote-based | [CONTACT] | Operating since 1987. Modules for medical, dental, allied health. +27 11 719 2111 / info@solumed.co.za |
| **CGM (CompuGroup)** | Quote-based | [CONTACT] | Products: MEDEDI, Practice Perfect/Plus, XDENT (dental). 30+ years in SA. hello.za@cgm.com / +27 861 633 334 |
| **Kitrin** | Per-practitioner flat fee | R250/mo (monthly) · R200/mo (annual) · R250 per additional practitioner | Ideal for practices <R40K/mo turnover. Entry-level. [Source: kitrin.com/pricing] |
| **Navitas** | Tiered plans | Additional admin profiles: R99/mo over subscription | Green (basic) / Gold (premium) tiers. 10+ practitioners = custom pricing. [Source: navitas.co.za] |
| **Health Focus (Eminance)** | Per-practitioner flat fee | "Less than your DSTV subscription" (~R200-R800 implied) | 30+ years, strong in optometry. Month-to-month licensing. Entry-level option available. |

### B2. Market Price Range Summary

| Practice Size | Estimated Monthly Software Cost | Source |
|---------------|--------------------------------|--------|
| **Solo GP / starting out** | R200 - R500/mo | Kitrin, Navitas Green |
| **Solo specialist** | R500 - R1,500/mo | Healthbridge, GoodX |
| **Small group (2-5 practitioners)** | R1,500 - R5,000/mo | GoodX, Solumed |
| **Large group / multi-discipline** | R5,000 - R15,000+/mo | CGM, Solumed, GoodX |
| **Hospital / complex facility** | R15,000 - R50,000+/mo (negotiated) | Health Focus, CGM |

[ESTIMATED] — aggregated from available data points, user reviews, and industry knowledge.

### B3. Revenue Models in Use

1. **Flat monthly fee per practice** (Kitrin, Health Focus) — simplest, predictable
2. **Per-practitioner/diary fee** (GoodX, Kitrin) — scales with practice size
3. **Percentage of claim value** (Healthbridge) — aligns revenue with practice revenue
4. **Per-claim fee** (Healthbridge, MediKredit switching fees) — transaction-based
5. **Tiered plans** (Navitas) — good/better/best packaging
6. **Quote-based / enterprise** (Solumed, CGM) — higher ACV, longer sales cycle

**VisioCorp pricing strategy recommendation**: Consider a hybrid model — flat base fee (R300-500/mo for entry) + per-claim or percentage model for switching, capturing both the subscription floor and transactional upside.

---

## C. REGULATORY COMPLIANCE FOR TECH COMPANIES

### C1. Information Regulator Registration (POPIA)

| Item | Detail |
|------|--------|
| **Legal requirement** | Section 55 POPIA — Information Officers must be registered before assuming duties |
| **Registration portal** | [registrations.inforegulator.org.za](https://registrations.inforegulator.org.za/) |
| **Steps** | 1) Sign up on eServices portal → 2) Verify via OTP → 3) Submit IO details + Deputy IO details + responsible party info + statistical data → 4) Confirmation |
| **Fee** | [VERIFIED] — **No registration fee**. The Information Regulator does not charge for IO registration. |
| **Health data regulations** | Binding regulations published **6 March 2026**: "Regulations relating to the Processing of Data Subjects' Health Information by Certain Responsible Parties, 2026" — eight categories of organisations must comply with explicit obligations around lawful processing, security safeguards, cross-border transfers |
| **2025 amendments** | Administrative fines can now be paid in installments; simplified objection/correction processes |
| **Contact** | Registration.IO@inforegulator.org.za |
| **Sources** | [Information Regulator](https://inforegulator.org.za/) · [POPIA Health Data Regulations 2026](https://itlawco.com/popia-health-data-regulations-2026/) |

**Immediate action**: Register VisioCorp's Information Officer NOW — it is a legal prerequisite for processing health data.

### C2. POPIA Operator Agreement — Cloud Provider Contracts

Under Section 21 of POPIA, VisioCorp must have written operator agreements with **every** cloud provider processing personal information: Supabase, Vercel, Anthropic, AWS, etc.

**Required clauses** (for health data = "Special Personal Information"):

| Clause | Requirement |
|--------|------------|
| **Security measures** | Enhanced safeguards for special personal information; purpose limitation; trained personnel only |
| **Processing instructions** | Operator processes ONLY on documented instructions from VisioCorp |
| **Confidentiality** | Written confidentiality obligations binding all personnel and sub-processors |
| **Sub-processing** | Approved sub-contractors list; written agreements flowing down same obligations |
| **Retention & deletion** | Process only as long as necessary; secure deletion/return on termination; certification of completion |
| **Audit rights** | VisioCorp may audit operator compliance on reasonable notice |
| **Cross-border transfers** | Explicit provisions per POPIA Section 72 — adequate protection or binding corporate rules or consent |
| **Breach notification** | Mandatory notification within agreed timeframe (POPIA requires notification to Regulator and data subjects) |
| **Indemnification** | Operator liability for breaches caused by non-compliance |

**Templates available**: [Bidvest Operator Agreement Template](https://bidvest.co.za/pdf/home/data-protection/2022/operator-agreement.pdf) · [ITLawCo POPIA Operator Template](https://itlawco.com/operator-agreement-template-complying-with-popia/)

**Action item**: Draft POPIA-compliant operator agreements for Supabase, Vercel, and Anthropic. Verify each provider's existing DPA maps to POPIA requirements, especially cross-border transfer provisions (all three store data outside SA).

### C3. ISO 27001 Certification — Information Security

| Item | Detail |
|------|--------|
| **Timeline** | 9-18 months for SA businesses (kick-off to certification). SMEs with existing security practices: 3-6 months. |
| **Audit process** | Stage 1 (documentation review) → 6-8 week gap → Stage 2 (process/controls audit) → Certification |
| **Pre-audit** | ISMS must be operating for minimum 3 months (6 months preferred) before certification audit |
| **Cost** | ZAR 150,000 - R3,000,000+ depending on scope. Breakdown: consultancy (R200K-R1M), certification body audit (R100K-R500K), staff training, ongoing surveillance. |
| **Validity** | 3 years, with annual surveillance audits |
| **Accreditation body** | SANAS (South African National Accreditation System) |
| **SANAS-accredited CABs** | BSI Group South Africa, SACAS, SGS, TUV SUD |
| **Sources** | [ISMS.online SA Guide](https://www.isms.online/iso-27001/country/south-africa/) · [TopCertifier](https://www.iso-certification.co.za/iso-27001-certification.html) |

### C4. ISO 13485 Certification — Medical Device QMS

| Item | Detail |
|------|--------|
| **Required if** | VisioCorp software is classified as SaMD by SAHPRA |
| **SAHPRA deadline** | From 1 June 2025: required for licence renewal. Full enforcement by 1 April 2028. |
| **SAHPRA-recognised CABs** | DQS (SANAS-accredited), BSI (recognised since 2023), TUV SUD, Intertek |
| **Accreditation** | CABs must be accredited by SANAS or recognised under IAF |
| **Cost** | [CONTACT] — typically R200K-R800K for SMEs; includes QMS documentation, gap analysis, audit fees |
| **Timeline** | 6-12 months for implementation + certification |
| **Sources** | [DQS Guide](https://www.dqsglobal.com/en/explore/blog/sahpra,-sanas,-iso-13485-certification-a-comprehensive-exploration-into-medical-devices-in-south-africa) · [BSI Update](https://www.bsigroup.com/en-GB/insights-and-media/media-centre/press-releases/2025/june/update-on-iso-13485-certification-requirements-in-south-africa/) |

---

## D. MARKET DATA

### D1. Market Size — Private Healthcare

| Metric | Value | Source |
|--------|-------|--------|
| **Medical scheme beneficiaries** | 9.17 million (2024) | [VERIFIED] CMS Annual Report 2024/25 |
| **Registered medical schemes** | 71 (16 open, 55 restricted) | [VERIFIED] CMS |
| **% population on medical aid** | ~15.8% | [VERIFIED] CMS/Statista |
| **Total registered doctors (SA)** | ~46,000 (WHO data) | [VERIFIED] WHO |
| **Private GP practices (PCNS)** | ~13,000 | [ESTIMATED] BHF 2017 data |
| **Private specialist practices** | ~8,000 | [ESTIMATED] BHF 2017 data |
| **Total private doctor practices** | ~22,000+ | [ESTIMATED] MediKredit states integration with 22,000+ |
| **Private hospitals** | ~300+ | [VERIFIED] MediKredit |
| **Public hospitals on switch** | ~155 | [VERIFIED] MediKredit |
| **Registered pharmacies** | ~3,600 community pharmacies (2021) · ~5,000 total (incl. institutional) | [ESTIMATED] SAPC 2021 + MediKredit |
| **Registered dentists (HPCSA)** | ~6,100 dentists + ~500 specialists | [ESTIMATED] 2015 data; likely higher now |
| **Physiotherapists** | ~7,000-8,000 registered | [ESTIMATED] HPCSA board data |

### D2. Total Addressable Market (TAM) Estimate

| Segment | Estimated Practices | Avg Monthly Software Spend | Annual TAM |
|---------|-------------------|---------------------------|------------|
| GP practices | 13,000 | R800/mo | R124.8M |
| Specialist practices | 8,000 | R1,500/mo | R144M |
| Dental practices | 4,000 | R1,000/mo | R48M |
| Physiotherapy / allied | 5,000 | R500/mo | R30M |
| Pharmacies | 3,600 | R1,200/mo | R51.8M |
| Hospitals (private) | 300 | R20,000/mo | R72M |
| **Total TAM** | **~34,000** | | **~R470M/year** |

[ESTIMATED] — based on available practice counts and pricing data. The actual SAM (serviceable addressable market) for a new entrant is likely 5-15% of TAM in the first 3 years.

### D3. Electronic Claims Adoption

| Metric | Value |
|--------|-------|
| **Electronic claims adoption** | [ESTIMATED] 75-85% of private practices submit electronically |
| **Paper claims** | [ESTIMATED] 15-25% — mainly small rural practices, allied health |
| **Switch coverage** | Healthbridge claims direct integration with 80%+ of medical aids for GPs |
| **Growth trend** | Regulatory push + scheme requirements driving remaining paper practices to digital |

### D4. PMS Penetration by Discipline

| Discipline | Estimated PMS Adoption | Notes |
|-----------|----------------------|-------|
| Pharmacies | ~95%+ | Regulatory requirement for dispensing |
| Hospitals | ~98%+ | Mandatory for billing |
| Specialists | ~80-85% | High claim values drive adoption |
| GPs | ~70-75% | Some still use manual billing |
| Dentists | ~65-70% | Growing adoption |
| Physiotherapy | ~50-60% | Many small practices, lower claim values |
| Allied health (OT, speech, dietetics) | ~40-50% | Lowest adoption, biggest growth opportunity |

[ESTIMATED] — no single authoritative source exists. Based on switch volume data and industry reports.

---

## E. PARTNERSHIPS & CHANNELS

### E1. Medical Professional Associations

| Association | Full Name | Membership | Partnership Approach |
|------------|-----------|-----------|---------------------|
| **SAMA** | South African Medical Association | ~70% of all SA doctors (~32,000 members) | Conference sponsorship, CPD partnerships, endorsed software program. [samedical.org](https://samedical.org/) |
| **SADA** | South African Dental Association | 3,023 members (2025), 11 branches | CPD events, congress exhibit, endorsed product listings. [sada.co.za](https://www.sada.co.za/) |
| **SASP** | South African Society of Physiotherapy | Majority of SA physios (est. 4,000-5,000 members) | World Physio affiliate. CPD, congress, member benefits. [saphysio.co.za](https://www.saphysio.co.za/) |
| **PSSA** | Pharmaceutical Society of South Africa | Pharmacy professionals body | [pssa.org.za](https://www.pssa.org.za/) |
| **SAOA** | SA Orthopaedic Association | Specialist body | Conference partnerships |
| **SAAFP** | SA Academy of Family Physicians | Family medicine specialists | Academic partnerships |
| **HPCSA** | Health Professions Council of SA | All registered practitioners (regulatory, not voluntary) | Official channel for CPD accreditation |

**Strategy**: SAMA is the highest-leverage partnership — reaching ~32,000 doctors through one relationship. Offer a SAMA-endorsed or SAMA-discounted product tier.

### E2. Medical Scheme Administrators — Technology Partnerships

The top three administrators control ~90% of the market:

| Administrator | Market Share | Schemes Administered | Tech Notes |
|--------------|-------------|---------------------|------------|
| **Discovery Health** | ~50%+ | Discovery Health Medical Scheme (largest single scheme) | Advanced tech platform, HealthID digital identity, unlikely to partner with competitors |
| **Medscheme** | ~20% (dropping to ~15% post-Bonitas) | Bonitas (until May 2026), others | Nexus platform, 24/7 web-based. Lost Bonitas (750K beneficiaries) to Momentum. |
| **Momentum Health** | ~22% → ~30% (post-Bonitas) | Growing portfolio incl. Bonitas from June 2026 | Actively expanding, potential technology partnership opportunity |

**Other administrators**: Bestmed, Medshield, GEMS (government), Sasolmed

**Action item**: Target **Momentum Health** — they are actively growing and may need technology partners for their expanding portfolio. Discovery is essentially a closed ecosystem.

### E3. Health Tech Incubators & Accelerators in SA

| Program | Focus | Details |
|---------|-------|---------|
| **HealthTech Hub Africa (HTHA)** | Health tech startups | 2025 accelerator by Jhpiego + Villgro Africa. Virtual health, data-driven health systems, climate & health. [thehealthtech.org](https://thehealthtech.org/) |
| **Launch Lab (Stellenbosch)** | Agri, Climate & Health tech | SA's leading university-backed incubator. 44-week program. Stellenbosch University backing. |
| **mLab** | Sector-agnostic (incl. HealthTech) | 100+ businesses supported. EdTech, AgriTech, eCommerce, HealthTech. |
| **timbuktoo (UNDP)** | HealthTech Africa-wide | UN-backed accelerator for African health startups |
| **Futurize Incubator** | Health/general tech | South African incubator program |

**Funding landscape**: HealthTech Africa investment is growing significantly, with SA, Kenya, Nigeria, and Egypt as primary hubs. International investors actively looking at context-specific solutions.

---

## F. KEY CONTACTS DIRECTORY

### Switches & Integration
| Entity | Contact | Purpose |
|--------|---------|---------|
| MediKredit | +27 11 770-6000 · medikredit.co.za | Switch integration pack |
| Altron HealthTech | hello.za@cgm.com · +27 861 633 334 | SwitchOn vendor program |
| Healthbridge | healthbridge.co.za | Competitor analysis |

### Regulatory
| Entity | Contact | Purpose |
|--------|---------|---------|
| Information Regulator | Registration.IO@inforegulator.org.za | IO registration |
| SAHPRA Medical Devices | mdnotifications@sahpra.org.za | Establishment licence |
| BHF PCNS | clientservices@bhfglobal.com · +27 87 210 0500 | Practice verification API |
| CMS | medicalschemes.co.za | Scheme administrator accreditation list |

### Certification Bodies (ISO)
| Body | Scope | Contact |
|------|-------|---------|
| BSI Group SA | ISO 27001 + ISO 13485 | bsigroup.com/en-ZA |
| DQS | ISO 13485 (SANAS-accredited) | dqsglobal.com |
| TUV SUD | ISO 13485 (SAHPRA-authorised auditors) | tuvsud.com/en-za |
| SACAS | ISO 27001 | sacas.co.za |
| SGS South Africa | ISO 27001 | sgs.com/en-za |

### Professional Associations
| Association | Contact | Members |
|-------------|---------|---------|
| SAMA | samedical.org | ~32,000 |
| SADA | sada.co.za | ~3,000 |
| SASP | saphysio.co.za | ~4,000-5,000 |

---

## G. STRATEGIC RECOMMENDATIONS

### Immediate Actions (0-3 months)
1. **Register Information Officer** with the Information Regulator — legal prerequisite
2. **Request MediKredit integration pack** — start technical evaluation
3. **Draft POPIA operator agreements** for Supabase, Vercel, Anthropic
4. **Determine SaMD classification** — consult SAHPRA guideline SAHPGL-MD-04 to determine if AI features trigger medical device classification
5. **Register on PCNS 2.0** as a technology provider

### Medium-term (3-12 months)
6. **Begin ISO 27001 implementation** — 9-18 month journey, start now
7. **If SaMD applies**: Engage SAHPRA-recognised CAB for ISO 13485 gap analysis
8. **Approach SAMA** for endorsed software partnership
9. **Build MediKredit switch integration** — highest priority for claims switching
10. **Contact Momentum Health** re: technology partnership (they are scaling post-Bonitas acquisition)

### Pricing Strategy
11. **Entry tier**: R299-499/mo per practice (compete with Kitrin, Navitas)
12. **Professional tier**: R999-1,999/mo per practice (compete with Healthbridge, GoodX)
13. **Enterprise tier**: Custom pricing for groups/hospitals (compete with Solumed, CGM)
14. **Transaction fee**: R2-5 per claim processed (additional revenue stream via switching)

### Build vs Buy Decisions
| Capability | Recommendation | Rationale |
|-----------|---------------|-----------|
| Claims switching | **Integrate** with MediKredit | Building own switch = years + regulatory barriers. MediKredit integration = 2-4 months. |
| Practice number verification | **Integrate** with PCNS 2.0 API | BHF owns the authoritative registry |
| Billing engine | **Build** | Core differentiator, local tariff knowledge required |
| Clinical records / EMR | **Build** | AI differentiation opportunity |
| Payment processing | **Integrate** (Yoco, PayFast, Netcash) | Commodity |
| SMS/WhatsApp | **Integrate** (Twilio, ClickSend, WhatsApp Business API) | Commodity |

---

## H. SOURCES

- [MediKredit PMS Vendors](https://www.medikredit.co.za/clients/practice-management-software-vendors/)
- [MediKredit Claims Switching](https://www.medikredit.co.za/products-and-services/healthcare-claims-switching/)
- [Altron HealthTech SwitchOn](https://altronhealthtech.com/switchon/)
- [Healthbridge](https://healthbridge.co.za/)
- [BHF PCNS](https://bhfglobal.com/pcns/)
- [SAHPRA Medical Devices](https://www.sahpra.org.za/medical-devices/)
- [SAHPRA AI/ML Device Guidance (Sept 2025)](https://www.sahpra.org.za/wp-content/uploads/2025/09/MD08-20252026_-SAHPRA-Communication-to-Industry-AI-Medical-devices_Acknowledgements.pdf)
- [SAHPRA Establishment Licensing Guide](https://www.regdesk.co/blog/sahpra-guidelines-on-establishment-licensing-costs-documents-and-cooperation/)
- [Information Regulator SA](https://inforegulator.org.za/)
- [POPIA Health Data Regulations 2026](https://itlawco.com/popia-health-data-regulations-2026/)
- [ITLawCo POPIA Operator Agreement Template](https://itlawco.com/operator-agreement-template-complying-with-popia/)
- [ISMS.online ISO 27001 SA Guide](https://www.isms.online/iso-27001/country/south-africa/)
- [DQS ISO 13485 & SAHPRA](https://www.dqsglobal.com/en/explore/blog/sahpra,-sanas,-iso-13485-certification-a-comprehensive-exploration-into-medical-devices-in-south-africa)
- [CMS Annual Report 2024/25](https://pmg.org.za/files/CMS_-_Council_for_Medical_Schemes_Annual_Report_2024-2025.pdf)
- [Kitrin Pricing](https://kitrin.com/practice-management-software-pricing)
- [GoodX Reviews & Pricing](https://www.getapp.za.com/software/2063759/goodx)
- [SAMA](https://samedical.org/)
- [SADA](https://www.sada.co.za/)
- [SASP](https://www.saphysio.co.za/)
- [HealthTech Hub Africa](https://thehealthtech.org/)
- [Bidvest Operator Agreement Template](https://bidvest.co.za/pdf/home/data-protection/2022/operator-agreement.pdf)
