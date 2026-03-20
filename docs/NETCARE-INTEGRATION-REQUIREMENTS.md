# Netcare Technical Integration Requirements — Deep Research

> **Compiled**: 20 March 2026
> **Author**: Visio Research Labs (Claude Code Architect)
> **Purpose**: Technical deep-dive into how vendors integrate with Netcare's systems — protocols, certifications, infrastructure, and what we need to deliver
> **Entity**: Touchline Agency (Pty) Ltd / Visio Health OS
> **Status**: Research document — verified against public sources, annual reports, vendor documentation

---

## Table of Contents

1. [Deutsche Telekom / iMedOne Integration](#1-deutsche-telekom--imedone-integration)
2. [Philips Capsule MDIP Integration](#2-philips-capsule-mdip-integration)
3. [A2D24 / Netcare Digital Integration](#3-a2d24--netcare-digital-integration)
4. [SwitchOn / MediKredit Claims Switching](#4-switchon--medikredit-claims-switching)
5. [CareConnect HIE](#5-careconnect-hie)
6. [Corsano Health Wearable Integration](#6-corsano-health-wearable-integration)
7. [Netcare Vendor Requirements](#7-netcare-vendor-requirements)
8. [Network and Infrastructure](#8-network-and-infrastructure)
9. [Certification and Accreditation Processes](#9-certification-and-accreditation-processes)
10. [What We Need to Provide Technically](#10-what-we-need-to-provide-technically)

---

## 1. Deutsche Telekom / iMedOne Integration

### What iMedOne Is

iMedOne is the **Hospital Information System (HIS)** that forms the core of Netcare's CareOn platform. Developed by Deutsche Telekom Healthcare Solutions, it is the digital backbone connecting patient records, billing, pharmacy, radiology, pathology, and clinical workflows across all Netcare hospitals.

- **Architecture**: Modern modular architecture with tightly integrated workflow modules
- **Key claim**: "Open and flexible interfaces, high level of standardization combined with flexibility"
- **Development**: Built over 7 years by 40 workstreams across South Africa, Germany, and India
- **Scale**: 34,000+ active users, 45+ hospitals, 13,000+ iPads

### Integration Protocols

**Confirmed protocols used by Deutsche Telekom's Interoperability Platform (IOP):**

| Standard | Usage |
|----------|-------|
| **HL7v2** | Primary messaging standard — ADT (Admit/Discharge/Transfer), ORM (Orders), ORU (Observation Results) |
| **HL7 FHIR** | Modern REST API-based interoperability — used for the Clinical Data Repository (CDR) |
| **IHE profiles** | Integration profiles for cross-system workflows (XDS, PIX/PDQ, etc.) |
| **openEHR** | Vendor-neutral clinical data archetype model used in CDR |

**The IOP (Interoperability Platform)** is the middleware layer that:
- Consolidates patient data from HIS, LIS (Lab), PACS (Imaging), and other systems
- Standardizes into a semantically structured data model
- Separates demographic from medical data (for privacy/research)
- Provides "maximum data security" through data separation architecture

### How iMedOne Connects to External Systems

Based on Deutsche Telekom's published architecture:

1. **Interface Engine**: iMedOne uses an HL7 interface engine (likely Mirth Connect, Rhapsody, or proprietary) to route messages
2. **Message types flowing through the engine**:
   - **ADT^A01/A02/A03/A04**: Patient admission, transfer, discharge, registration
   - **ORM^O01**: Orders to lab/radiology/pharmacy
   - **ORU^R01**: Results back from lab/radiology
   - **SIU^S12**: Scheduling information
3. **FHIR endpoints**: The CDR exposes FHIR R4 resources for modern integrations
4. **Network**: On-premise deployment within hospital LAN, connected via Netcare's internal network

### Access Model (How They Got In)

- **Strategic partnership**: R82 million investment announced 2023 — this is not a vendor-applies-and-gets-approved scenario; Deutsche Telekom was selected through a multi-year strategic procurement
- **On-premise deployment**: iMedOne runs on-premise within Netcare hospital infrastructure
- **Managed by**: Joint teams (Netcare IT + Deutsche Telekom engineers)
- **Network access**: Direct LAN access — the HIS IS the network

### What This Means for Us

iMedOne is the **system of record**. Any integration with Netcare hospital data must ultimately connect to or through iMedOne. The question is: do we connect directly to iMedOne, or do we connect to a layer above it (CareConnect HIE, Netcare's API gateway, or the Corsano model of cloud-to-EMR)?

**Most likely path for us**: We do NOT integrate directly with iMedOne. We either:
- Connect via CareConnect HIE (FHIR/HL7 standards)
- Connect via a Netcare API gateway (if one exists for third-party vendors)
- Follow the Corsano model: cloud platform streams data that Netcare's integration team maps into CareOn

---

## 2. Philips Capsule MDIP Integration

### What MDIP Does

The Medical Device Information Platform (MDIP) captures real-time data from bedside medical devices (monitors, ventilators, infusion pumps, anesthesia machines) and routes it to the EMR (iMedOne/CareOn).

- **Scale**: Installed in 3,000+ healthcare facilities globally
- **Device support**: 1,000+ unique medical device models from multiple vendors
- **Netcare role**: Core medical device integration layer for CareOn

### Data Flow Architecture

```
Medical Device (bedside)
    ↓ (proprietary serial/USB/network protocol)
DataCaptor / SmartLinx Gateway (bedside hub)
    ↓ (standardized data via hospital LAN)
MDIP Server (on-premise)
    ↓ (HL7 ORU messages)
iMedOne HIS / CareOn EMR
```

**Detailed flow:**

1. **Device → Gateway**: Bedside devices connect to a **DataCaptor** (legacy) or **SmartLinx** gateway via serial, USB, or network connections. The gateway has device-specific drivers (DDIs — Device Driver Interfaces) for 1,000+ device models
2. **Gateway → MDIP Server**: Data transmitted over hospital LAN to the MDIP server. Supports binary, XML, or HL7 formats
3. **MDIP Server → EMR**: MDIP transforms and contextualizes data, then sends **HL7 ORU (Observation Result)** messages to iMedOne
4. **Contextual enrichment**: MDIP adds patient identification, encounter association, time synchronization, asset location, and user access context before sending to EMR

### Security

- **End-to-end encryption**: Data encrypted from bedside gateway to HL7 consumer
- **Secure outbound connections**: To HL7 consumers and authentication systems
- **Secure device connections**: Between MDIP and medical devices
- **On-premise**: Entire flow stays within hospital network

### Network Requirements

- **Hospital LAN**: MDIP requires dedicated network segments within the hospital
- **Not cloud-based**: All processing happens on-premise
- **Direct integration**: MDIP connects directly to iMedOne — no intermediary cloud layer

### What This Means for Us

MDIP shows that Netcare accepts **on-premise integration via HL7 ORU messages**. However, MDIP is a strategic vendor (Philips) with deep physical presence in hospitals. Our cloud-based SaaS model is fundamentally different. The Corsano model (Section 6) is more relevant to our architecture.

---

## 3. A2D24 / Netcare Digital Integration

### What A2D24 / Netcare Digital Is

A2D24 (Africa's first AWS Advanced Partner) formed a **joint venture** with Netcare called **Netcare Digital** in 2021, headed by CIO Travis Dewing as CEO.

### Platform Architecture

| Component | Details |
|-----------|---------|
| **Cloud provider** | AWS (Amazon Web Services) |
| **Computing model** | Serverless cloud computing (Lambda, API Gateway) |
| **Search/Analytics** | Elasticsearch-based analytics |
| **AI/Chat** | Chatbot integrations |
| **Telehealth** | VirtualCare platform — video consultations |
| **Practice Management** | Deployed at 70+ occupational health sites |
| **VirtualCare** | 60+ sites across all 9 provinces |

### How AWS Cloud Connects to Netcare

This is the **most important precedent for us** — it proves cloud-based SaaS CAN integrate with Netcare:

1. **Cloud-hosted**: A2D24 solutions run on AWS, not on-premise
2. **API-based**: Serverless architecture implies RESTful API communication
3. **Data flows**: Cloud platform ↔ Netcare systems (details of VPN/direct connection not publicly documented)
4. **Joint venture structure**: A2D24 has deeper access than a typical vendor because they are a JV partner

### The HEAL Platform

The Netcare app (patient-facing) provides:
- Emergency geolocating via Netcare 911
- Appointment booking (specialists, GPs, dentists)
- Virtual consultations
- Hospital pre-admissions
- Health records access (Summary of Care)
- Sharing records with other providers

**Key insight**: The Netcare app exposes a **Summary of Care** that can be shared with other healthcare providers. This suggests there IS an API or data export mechanism for patient records.

### What This Means for Us

- **Cloud IS accepted**: A2D24 proves AWS-hosted SaaS can integrate with Netcare
- **But**: A2D24 is a JV partner, not a third-party vendor — they have privileged access
- **The VirtualCare/practice management platform** is the closest analog to what we're building
- **Question**: Did A2D24 connect via VPN, direct API, or through a Netcare integration gateway?

---

## 4. SwitchOn / MediKredit Claims Switching

### Overview

Claims switching is how medical practices submit billing claims to medical aid schemes electronically. There are two major switches in SA:

| Switch | Owner | Market Share |
|--------|-------|-------------|
| **SwitchOn** (formerly MediSwitch) | Altron HealthTech | ~30,000 healthcare professionals |
| **MediKredit** | MediKredit (Pty) Ltd | Majority of PMS vendors integrated |

### SwitchOn / MediSwitch Technical Integration

**Communication Protocol:**
- **SwitchComm Plus**: Desktop software that handles data transmission between PMS and MediSwitch servers
- **Communication API**: Generic API independent of transaction type — new transaction types can be added without PMS upgrades
- **Supported platforms**: DOS, Windows (3.1/95/NT/10/11), Unix
- **Supported languages**: Delphi, C, Visual Basic
- **Transmission**: Batch send/receive from practice to MediSwitch servers
- **Real-time**: Synchronous claims submission with immediate feedback

**Already-integrated PMS vendors**: Multidoc, Ultimate Medix, Med-It, Medsolve 2000, Winorion

**Data format**: PHISC EDIFACT MEDCLM message format (South African healthcare EDI standard)

### MediKredit Technical Integration

**Vendor Accreditation Process (CONFIRMED):**

1. **Integration Pack**: MediKredit provides a complete integration pack containing:
   - Information about what is required
   - Explanation of why it is required
   - How the integration should function
   - **Specified data file layouts** (claim file format specs)

2. **Testing Environment**: MediKredit provides a **dedicated testing environment**:
   - Available **24/7/365**
   - Includes latest funder rules
   - NAPPI (medication codes) and tariff pricing
   - Comprehensive test beneficiaries (dummy data, POPIA compliant — no real patient data)

3. **Accreditation Test**: On completion of integration, MediKredit conducts an accreditation to validate:
   - Incoming claim file data is in valid format
   - Successful real-time online switching works
   - Integration functions flawlessly in a live environment

4. **HealthNet ST**: MediKredit's switch platform providing:
   - Synchronous AND asynchronous switch connections
   - Continuous data transfer within seconds
   - No break in data flow

### PHISC EDIFACT MEDCLM Standard

The **Private Healthcare Information Standards Committee (PHISC)** manages South Africa's healthcare data transmission standards:

| Standard | Details |
|----------|---------|
| **UN/EDIFACT** | International messaging standard adopted by PHISC as national standard |
| **MEDCLM** | South African-specific message format (differs from UN standard messages) |
| **ICD-10** | Diagnosis codes in RFF+ICD segments (Groups 1, 3, and 4) |
| **CPT codes** | Procedure codes per PHISC CCSA (Complete CPT for South Africa) coding standards |
| **NAPPI** | National Pharmaceutical Product Index — medication identifiers |

### What This Means for Us

If we want to handle claims/billing integration:
- We need to integrate with SwitchOn AND/OR MediKredit
- MediKredit has a formal, documented vendor accreditation process with a 24/7 test environment
- We must support PHISC EDIFACT MEDCLM message format
- We must support ICD-10, CPT, and NAPPI coding

**However**: For a practice management AI tool (our product), claims switching integration is a Phase 2/3 feature. The immediate need is clinical workflow, not billing.

---

## 5. CareConnect HIE

### What CareConnect Is

South Africa's first private-sector **Health Information Exchange (HIE)** — a registered NPO founded by the six largest private healthcare organizations:

| Founder | Type |
|---------|------|
| **Netcare** | Hospital group |
| **Life Healthcare** | Hospital group |
| **Mediclinic** | Hospital group |
| **Discovery Health** | Medical scheme administrator |
| **Medscheme** | Medical scheme administrator |
| **Momentum Health** | Medical scheme administrator |

### Technical Platform

| Component | Details |
|-----------|---------|
| **Platform** | InterSystems HealthShare |
| **Products** | HealthShare Unified Care Record + HealthShare Patient Index |
| **Standards** | HL7 FHIR, HL7v2, IHE profiles |
| **Purpose** | Consolidated patient view across all participating providers |

### How Hospitals Connect

InterSystems HealthShare supports multiple connection methods:

1. **HL7v2 feeds**: Traditional message-based integration (ADT, ORU, ORM)
2. **FHIR R4 endpoints**: Modern REST API-based resources
3. **IHE profiles**: Standardized workflows (XDS for document sharing, PIX for patient identity)
4. **Proprietary connectors**: InterSystems has adapters for major EMR systems

### The DURSA Agreement

The **Data Use and Reciprocal Support Agreement (DURSA)** is a condition of participation:

| Requirement | Details |
|-------------|---------|
| **Mandatory** | All participants must sign the DURSA |
| **Data use rules** | Specifies permitted purposes for data sharing |
| **Security obligations** | Each participant must ensure sufficient mechanisms for data safety |
| **Privacy compliance** | Conforms to local (POPIA) and international data privacy regulations |
| **Governance** | Strict data privacy and governance standards above and beyond regulatory requirements |

### Technical Requirements Imposed by DURSA

Based on the eHealth Exchange DURSA model (which CareConnect adapted):

1. **Authentication and authorization**: Must implement identity verification for all data requests
2. **Encryption**: Data in transit must be encrypted (TLS 1.2+)
3. **Audit logging**: All data access must be logged and auditable
4. **Consent management**: Patient consent must be verified before sharing data
5. **Incident reporting**: Security breaches must be reported within defined timeframes
6. **Business continuity**: Must demonstrate disaster recovery capabilities

### How to Join CareConnect

The public documentation does not detail a specific onboarding process. Based on the structure:

1. **NPO membership**: Apply to join CareConnect as a participating organization
2. **Sign DURSA**: Execute the data sharing agreement
3. **Technical onboarding**: Implement HL7 FHIR/v2 or IHE interfaces
4. **InterSystems integration**: Work with InterSystems to connect your system to the HealthShare platform
5. **Testing and validation**: Verify data flows before going live

### What This Means for Us

CareConnect is the **ideal integration point** for our product:
- It is vendor-neutral (InterSystems platform, not tied to any single hospital group)
- It supports modern standards (FHIR R4)
- Netcare is a founding member, so CareOn data flows through it
- If we connect to CareConnect, we can potentially access data from Netcare, Life, Mediclinic, AND the medical schemes

**Challenge**: CareConnect is designed for large institutional participants (hospitals, schemes). Whether a SaaS vendor like us can join as a participant or technology partner is unclear and must be explored.

---

## 6. Corsano Health Wearable Integration

### Why This Matters Most

Corsano is the **closest analog to our integration model** — a cloud-based health technology company that streams data into Netcare's EMR:

### The Corsano-Netcare Integration

| Aspect | Details |
|--------|---------|
| **Partnership** | Strategic partnership announced late 2025 |
| **Product** | CardioWatch medical-grade wearable bracelet |
| **Deployment** | Pilot at flagship Netcare facility, then phased rollout to ~6,000 beds |
| **Cloud platform** | Corsano's cloud (hosted externally, not on-premise) |
| **EMR integration** | "Seamlessly integrated into Netcare's Electronic Medical Record environment" |

### Data Flow

```
CardioWatch Bracelet (patient wrist)
    ↓ (Bluetooth)
Corsano Mobile App (smartphone)
    ↓ (HTTPS/REST API)
Corsano Cloud Platform (external cloud)
    ↓ (API / integration layer — protocol TBD)
Netcare CareOn EMR (iMedOne)
```

### What Corsano Provides Technically

From Corsano's developer documentation:

1. **REST API**: Primary integration method — flexible, lightweight
2. **Bluetooth libraries**: For direct bracelet-to-app communication (pairing, smart sync)
3. **Cloud platform**: Corsano's "Medically Certified Health Cloud"
4. **Developer portal**: developer.corsano.com — documented API
5. **Data types**: Heart rate, respiratory rate, core body temperature, SpO2, cuffless blood pressure

### Integration Capabilities Enabled

The Netcare-Corsano integration enables:
- Automated early warning scores and predictive risk algorithms
- Centralized monitoring and alerting beyond ICU/high-care
- Reduced manual vital-sign documentation for nursing staff
- High-resolution datasets for clinical research and AI innovation

### What This Proves for Us

1. **Cloud SaaS CAN integrate with CareOn**: Corsano's platform is cloud-hosted and connects to Netcare's EMR — proof that on-premise is NOT required
2. **REST API is acceptable**: Corsano uses REST APIs, not just HL7v2
3. **Data streams into CareOn**: The integration maps external cloud data into the EMR
4. **Netcare's integration team handles the EMR side**: The vendor provides the cloud platform and API; Netcare's team maps it into CareOn
5. **Strategic partnership required**: This is not a self-service integration — it required a formal partnership announcement

---

## 7. Netcare Vendor Requirements

### Supplier Accreditation Policy (PRC02)

**Three-step process:**

#### Step 1: Accreditation Questionnaire
- Complete the Netcare supplier accreditation questionnaire
- Score must be **75% or above** to proceed
- Below 75% requires written motivation from Commodity Manager/Supply Manager
- Submissions limited to **50 pages**
- Must attach original cancelled cheque or bank verification letter
- Information must be current — outdated info leads to disqualification

#### Step 2: Supplier Registration
- Register on **Zycus** procurement platform (dewdrops.zycus.com)
- No cost to suppliers
- No system integration required on vendor side

#### Step 3: Adoption
- Guided through remaining adoption steps by Netcare procurement

### Security and Privacy Requirements

**From Netcare's 2024 Annual Report and policies:**

| Requirement | Details |
|-------------|---------|
| **Non-disclosure agreements** | Required for all vendors with data access |
| **Annual privacy impact assessment** | Questionnaire-based assessment each year |
| **User access agreements** | Formal agreements for any system access |
| **Annual security assurance** | Confirmation of security and privacy measures annually |
| **Breach notification** | Must notify Netcare of any security breaches |
| **Threat intelligence monitoring** | Netcare monitors vendor connections via threat intelligence tools |
| **Biennial supplier audits** | Strategic suppliers audited every two years |
| **Right to audit** | Netcare reserves right to audit vendor information; incorrect info = blacklisting |

### Cybersecurity Standards

Netcare's internal cybersecurity program includes:
- 100% employee participation in monthly cybersecurity training
- Simulated phishing exercises
- Access revocation for non-compliance with training
- AI Governance Committee (established FY2025)
- Dedicated privacy compliance framework

**What vendors likely need (inferred from Netcare's own standards):**
- ISO 27001 certification (or equivalent ISMS)
- Evidence of penetration testing
- Data processing agreement (operator agreement per POPIA)
- Incident response plan
- Business continuity/disaster recovery documentation
- Encryption at rest and in transit

### POPIA Compliance Requirements

As a technology vendor processing Netcare patient data, we are an "operator" under POPIA:

| Obligation | Details |
|------------|---------|
| **Written operator agreement** | Mandatory contract mirroring responsible party's obligations |
| **Security measures** | Must establish and maintain security measures per POPIA Section 19 |
| **Breach disclosure** | Express breach-disclosure requirements in contract |
| **Confidentiality** | All staff handling data must sign confidentiality agreements |
| **Data disposal** | Explicit disposal requirements for data no longer needed |
| **Cross-border transfers** | New POPIA regulations require assessment of offshore data flows |
| **Consent management** | Healthcare data requires explicit patient consent |

---

## 8. Network and Infrastructure

### Netcare's Hospital Network

Based on the CareOn deployment model:

| Component | Details |
|-----------|---------|
| **Hospital LAN** | Each hospital has its own local area network |
| **Wi-Fi infrastructure** | Upgraded for iPad deployment (13,000+ devices) |
| **MDM** | Mobile Device Management for iPads (Apple DEP/ABM) |
| **Network upgrades** | Comprehensive infrastructure assessment before CareOn deployment at each hospital |
| **Electrical infrastructure** | Also assessed and upgraded per hospital |

### External Vendor Connectivity Models

Based on how existing vendors connect:

| Vendor | Connection Type | Model |
|--------|----------------|-------|
| **Deutsche Telekom (iMedOne)** | On-premise | Direct LAN access — the HIS runs on hospital infrastructure |
| **Philips Capsule (MDIP)** | On-premise | Dedicated network segments within hospital LAN |
| **A2D24 (Netcare Digital)** | Cloud (AWS) | JV partner with likely VPN or dedicated connection |
| **Corsano Health** | Cloud | External cloud platform integrating via API to CareOn |
| **CareConnect HIE** | Cloud/Hybrid | InterSystems HealthShare — participating organizations connect via HL7/FHIR |

### Can Cloud-Based SaaS (Vercel) Connect?

**Yes, with conditions:**

1. **Corsano proves cloud is accepted**: Their cloud platform integrates with CareOn
2. **A2D24 proves AWS cloud is accepted**: Serverless cloud computing deployed successfully
3. **CareConnect is cloud-based**: InterSystems HealthShare operates as a cloud/hybrid platform

**Likely requirements for cloud vendors:**
- TLS 1.2+ encryption on all connections
- IP whitelisting (Netcare likely restricts inbound connections)
- VPN tunnel (possible requirement for direct EMR access)
- Data residency in South Africa (POPIA requirement for health data)
- API authentication (OAuth 2.0, API keys, or mTLS)

**Potential issue with Vercel**: Vercel's edge network is globally distributed. Netcare may require:
- South African data residency → Vercel's Johannesburg region or use of Supabase (eu-west-1 may not suffice)
- Dedicated IP addresses → Vercel's default shared IPs may not work for IP whitelisting
- VPN termination → May need a separate VPN gateway (AWS/Azure in AF-South-1)

### Travis Dewing's Team — Integration Onboarding

- **Travis Dewing**: CIO since 2012, also CEO of Netcare Digital (JV with A2D24)
- **IT Department**: 269 employees
- **Background**: Started as analyst programmer (1997), then MIS manager (2000), system integration manager (2008)
- **Decision authority**: As CIO, Travis controls technology vendor access and integration approvals
- **Integration approach**: Based on CareOn and Corsano partnerships, Netcare's IT team manages the EMR-side integration — they expect vendors to provide APIs/platforms, not to touch iMedOne directly

---

## 9. Certification and Accreditation Processes

### MediKredit / Claims Switch Vendor Accreditation

**Timeline**: Not publicly documented, but based on the process:
1. Request integration pack from MediKredit
2. Develop integration per their file layout specs
3. Test in their 24/7 sandbox environment
4. Schedule and pass accreditation test
5. Go live with real-time switching

**Estimated timeline**: 3-6 months (development + testing + accreditation)

### PHISC EDIFACT Compliance

| Aspect | Details |
|--------|---------|
| **Standard** | PHISC EDIFACT MEDCLM |
| **Maintained by** | Private Healthcare Information Standards Committee (PHISC) |
| **Certification** | No formal "PHISC certified" badge — compliance is validated through switch accreditation |
| **Key codes** | ICD-10 (diagnosis), CPT/CCSA (procedures), NAPPI (medications) |
| **Documentation** | PHISC CCSA Coding Standards and Guidelines (Version 11, October 2024) available at phisc.net |

### CareConnect HIE Membership

| Requirement | Details |
|-------------|---------|
| **Legal entity** | Must be a registered healthcare organization |
| **DURSA signature** | Must sign Data Use and Reciprocal Support Agreement |
| **Technical compliance** | Must implement HL7 FHIR and/or HL7v2 interfaces |
| **Privacy compliance** | Must comply with POPIA + CareConnect's additional governance |
| **Data security** | Must demonstrate sufficient security mechanisms |
| **Participant type** | Hospitals, schemes, labs, radiology, clinician practices, rehab centers |

### Netcare Supplier Accreditation

| Stage | Requirement |
|-------|-------------|
| **Questionnaire** | Complete accreditation questionnaire (score ≥75%) |
| **Documentation** | Company registration, B-BBEE cert, tax clearance, bank verification |
| **Zycus registration** | Register on procurement platform |
| **NDA** | Sign non-disclosure agreement |
| **Privacy assessment** | Annual privacy impact assessment questionnaire |
| **Security assurance** | Annual confirmation of security measures |
| **Supplier audit** | Biennial audit for strategic suppliers |

### Is There a Formal "Netcare Approved Vendor" Status?

Not explicitly documented as a badge or certification. However:
- Successful accreditation = approved supplier on Zycus
- Strategic vendors get deeper access and integration support
- Technology vendors specifically likely go through an additional IT/security review beyond standard procurement

---

## 10. What We Need to Provide Technically

### Based on How Other Vendors Integrate

#### Tier 1: Minimum Required (For Any Engagement)

| Deliverable | Priority | Status |
|-------------|----------|--------|
| **API Documentation** (OpenAPI/Swagger spec) | CRITICAL | Needed |
| **Security Assessment** (pen test results, vulnerability scan) | CRITICAL | Needed |
| **Architecture Diagram** (system architecture, data flows) | CRITICAL | Needed |
| **Data Processing Agreement** (POPIA operator agreement) | CRITICAL | Needed |
| **Privacy Impact Assessment** (for Netcare's annual review) | CRITICAL | Needed |
| **NDA** (mutual non-disclosure) | CRITICAL | Needed |
| **Company registration docs** (CIPC, tax clearance, B-BBEE) | CRITICAL | In progress |
| **Business continuity / DR plan** | HIGH | Needed |

#### Tier 2: Technical Integration (For System Access)

| Deliverable | Priority | Notes |
|-------------|----------|-------|
| **FHIR R4 API endpoints** | HIGH | For CareConnect HIE or direct EMR integration |
| **HL7v2 message support** | MEDIUM | If direct iMedOne integration required (unlikely for us) |
| **REST API with OAuth 2.0** | HIGH | Follow Corsano model — provide REST API for data exchange |
| **Sandbox/test environment** | HIGH | MediKredit provides one; we should too |
| **Integration test suite** | HIGH | Automated tests proving our API works correctly |
| **Webhook support** | MEDIUM | For real-time event notifications |
| **Data export formats** | MEDIUM | CSV, JSON, FHIR bundles |

#### Tier 3: Compliance & Certification (For Scale)

| Deliverable | Priority | Notes |
|-------------|----------|-------|
| **ISO 27001 certification** | HIGH | Industry standard for ISMS — Netcare likely expects this |
| **SOC 2 Type II report** | MEDIUM | International trust signal — may not be required in SA |
| **PHISC EDIFACT support** | MEDIUM | Only if we handle claims/billing |
| **MediKredit/SwitchOn accreditation** | MEDIUM | Only if we handle claims switching |
| **CareConnect HIE membership** | FUTURE | Long-term play for industry-wide interoperability |

#### Tier 4: Infrastructure (For Production)

| Deliverable | Priority | Notes |
|-------------|----------|-------|
| **SA data residency** | CRITICAL | POPIA requires health data to stay in SA (or adequate protection) |
| **TLS 1.2+ on all endpoints** | CRITICAL | Standard encryption requirement |
| **IP whitelisting capability** | HIGH | Netcare may restrict connections to known IPs |
| **VPN gateway (if required)** | MEDIUM | May need IPSec or WireGuard VPN for direct access |
| **Uptime SLA (99.9%+)** | HIGH | Healthcare systems require high availability |
| **Audit logging** | CRITICAL | Every data access logged, retained, auditable |
| **Encryption at rest** | CRITICAL | AES-256 for stored patient data |

### Recommended Technical Architecture for Netcare Integration

```
Visio Health OS (Vercel + Supabase)
    │
    ├── REST API (OpenAPI spec, OAuth 2.0)
    │       ↕
    │   Netcare Integration Layer (built by Netcare IT team)
    │       ↕
    │   CareOn / iMedOne (HL7v2/FHIR internally)
    │
    ├── FHIR R4 Endpoints (for CareConnect HIE)
    │       ↕
    │   InterSystems HealthShare
    │       ↕
    │   CareConnect HIE (all participating hospitals/schemes)
    │
    └── Webhook/Event Stream
            ↕
        Corsano-style cloud-to-EMR bridge
```

### Priority Action Items

1. **Build OpenAPI/Swagger documentation** for our API — this is table stakes
2. **Implement FHIR R4 resources** for Patient, Observation, Encounter, and Condition — this enables CareConnect integration
3. **Get penetration test done** — Netcare will ask for this
4. **Draft POPIA operator agreement** — legal must prepare this
5. **Ensure SA data residency** — evaluate Supabase AF region or dedicated SA hosting
6. **Contact CareConnect HIE** — explore membership or technology partner status
7. **Contact MediKredit** — request integration pack if claims switching is in scope
8. **Prepare architecture review document** — for Netcare IT team evaluation

---

## Sources

### Deutsche Telekom / iMedOne
- [iMedOne Hospital Information System — Telekom Healthcare](https://www.telekom-healthcare.com/en/solutions/digitalization-in-hospitals/hospital-information-system-imedone-mobile)
- [Health Data Management — Telekom Healthcare IOP](https://www.telekom-healthcare.com/en/solutions/digital-health-data-analytics/health-data-management)
- [Digital care record with iMedOne — Telekom Healthcare](https://www.telekom-healthcare.com/en/clinic-it/clinical-information-system/documentation-of-care-imedone)

### Philips Capsule MDIP
- [Capsule MDIP Software Platform — Philips](https://www.usa.philips.com/healthcare/product/779005/capsule-mdip-software-platform)
- [Medical Device Information Platform — Capsule Technologies](https://capsuletech.com/mdip)
- [MDIP Data Sheet (PDF) — Philips](https://www.documents.philips.com/assets/20210727/ccb597e739154342a39cad72012027ba.pdf)
- [DataCaptor Technical Data Sheet (PDF)](https://cdn2.hubspot.net/hub/162893/file-18207551-pdf/docs/technical-data_sheet-datacaptor.pdf)
- [PIC iX and Capsule MDIP Integration — Philips](https://www.usa.philips.com/healthcare/technology/picix-capsule-mdip-integration)

### A2D24 / Netcare Digital
- [Netcare and A2D24 Join Forces — Netcare](https://www.netcare.co.za/News-Hub/Articles/netcare-and-a2d24-join-forces-to-shape-future-of-healthcare)
- [Netcare Establishes Digital Unit — ITWeb](https://www.itweb.co.za/content/G98YdMLY6AAqX2PD)
- [A2D24 — AWS Partner](https://partners.amazonaws.com/partners/0010L00001kYdu3QAC/A2D24%20Dot%20Com%20(Pty)%20Ltd)

### SwitchOn / MediKredit
- [SwitchOn — Altron HealthTech](https://healthtech.altron.com/product-switchon)
- [Practice Management Software Vendors — MediKredit](https://www.medikredit.co.za/clients/practice-management-software-vendors/)
- [Healthcare Claims Switching — MediKredit](https://www.medikredit.co.za/products-and-services/healthcare-claims-switching/)
- [MediSwitch Speeds Up Real-Time Claims — ITWeb](https://www.itweb.co.za/article/mediswitch-speeds-up-the-process-with-real-time-claims-to-medscheme/2j5alrMQnjOqpYQk)
- [SwitchComm Plus — Software Informer](https://switchcomm-plus.software.informer.com/)

### CareConnect HIE
- [CareConnect HIE — Official Website](https://www.careconnecthie.org/)
- [Africa's First Private Healthcare Information Exchange — ITWeb](https://www.itweb.co.za/content/KWEBb7yZWy3MmRjO)
- [InterSystems HealthShare for CareConnect — Africa Health IT News](https://africahealthitnews.com/south-africa-intersystems-to-implement-healthshare-unified-care-record-and-healthshare-patient-index/)
- [SA Health Sector Launches Information Exchange — Engineering News](https://www.engineeringnews.co.za/article/south-african-health-sector-launches-information-exchange-2022-04-08)
- [Health Data Saves Lives — Mediclinic Family](https://mediclinicfamily.co.za/how-health-data-saves-lives-careconnects-impact-on-patient-safety/)

### Corsano Health
- [Corsano-Netcare Partnership Announcement](https://corsano.com/corsano-health-and-netcare-limited-announce-strategic-partnership-to-roll-out-continuous-wearable-monitoring-across-general-wards-in-south-africa/)
- [Netcare Turns to Wearables — TechCentral](https://techcentral.co.za/netcare-turns-to-wearables-for-24-7-hospital-patient-monitoring/274774/)
- [Corsano Developer Portal](https://developer.corsano.com/)
- [Corsano Data Access](https://corsano.com/products/data-access/)

### Netcare Vendor Requirements
- [Netcare Supplier Accreditation Policy PRC02 (PDF)](https://www.netcare.co.za/Portals/0/Investor%20Relations/Governance/JSE%20SRI/Environmental%20Survey/E14_Supplier_Accredition_Policy.pdf)
- [Netcare Supplier Accreditation SOP PR-SOP-005 (PDF)](https://www.netcare.co.za/Portals/0/Investor%20Relations/Policies/PR-SOP-005-Supplier-Accreditation.pdf)
- [Netcare Supplier Management Policy (PDF)](https://www.netcare.co.za/Portals/0/Images/Content-Images/suppliers/policies/supplier-management-policy.pdf)
- [Netcare Suppliers Page](https://www.netcare.co.za/Netcare-Suppliers)
- [Netcare Suppliers Accreditation Form](https://www.netcare.co.za/Netcare-Suppliers/Suppliers-Accreditation-Form)

### Netcare Annual Reports & Digital Transformation
- [Netcare 2024 Digital Transformation and Data (PDF)](https://netcare-reports.co.za/2024/pdf/digital-transformation-and-data.pdf)
- [Netcare 2024 Integrated Report](https://netcare-reports.co.za/2024/index.php)
- [Netcare 2024 ESG Report (PDF)](https://www.netcare.co.za/portals/0/Annual%20Reports/pdf/Netcare-ESG-2024.pdf)
- [CareOn Game-Changer — LinkedIn](https://www.linkedin.com/pulse/netcares-careon-game-changer-healthcare-technology-lepeke-mogashoa-3zqbf)
- [End-to-End Digital Healthcare with Apple — ITWeb](https://www.itweb.co.za/content/KA3Ww7dzJXyqrydZ)

### Standards & Regulatory
- [PHISC — Private Healthcare Information Standards Committee](https://www.phisc.net/)
- [PHISC CCSA Coding Standards V11 (PDF)](https://www.phisc.net/system/files/PHISC%20CCSA%20Coding%20Standards%20and%20Guidelines%20Version%2011%20(October%202024).pdf)
- [POPIA Health Data Regulations 2026 — ITLawCo](https://itlawco.com/popia-health-data-regulations-2026/)
- [POPIA Compliance Guide — Qualysec](https://qualysec.com/popia-compliance/)
- [Travis Dewing Profile — CIO South Africa](https://cio-sa.co.za/profiles/travis-dewing/)
