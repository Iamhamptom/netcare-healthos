# 15 — FHIR Implementation for South African Healthcare
## VisioCorp Health Intelligence KB | Compiled 2026-03-21

---

## TABLE OF CONTENTS
1. SA FHIR Profiles & Implementation Guides
2. Key FHIR Resources for SA Claims
3. SA-Specific Extensions
4. Health4Afrika & CSIR/NDoH Work
5. NHI FHIR Requirements
6. Claims Flow in FHIR/NHI Model
7. DRG Representation in FHIR
8. FHIR R4 vs R5 Decision
9. SMART on FHIR for SA
10. FHIR Bulk Data & Subscriptions
11. Terminology Bindings (ICD-10-ZA, NAPPI, CCSA)
12. FHIR-EDIFACT Bridge
13. FHIR-Switching House Integration
14. FHIR-EHR Integration (CareOn, Healthbridge, GoodX)
15. FHIR-Lab & FHIR-Pharmacy
16. OpenHIE & SA's Role
17. DHIS2 FHIR Adapter
18. Existing SA FHIR Implementations
19. VisioCorp FHIR Hub Architecture Recommendations

---

## 1. SA FHIR PROFILES & IMPLEMENTATION GUIDES

### Current State (2026)

South Africa does **not** have an officially published, government-endorsed FHIR Implementation Guide (IG) on the HL7 FHIR registry (https://registry.fhir.org) comparable to US Core, AU Base, or UK Core. This is a critical gap and a market opportunity.

### What Exists

| Initiative | Status | FHIR Version | Notes |
|-----------|--------|--------------|-------|
| **Health4Afrika** (Jembi + partners) | Pilot/Research (2017-2020) | FHIR STU3 → R4 | WHO-aligned profiles for African health systems |
| **OpenHIE SA Reference Implementation** | Active | FHIR R4 | Mediator architecture, generic African profiles |
| **CSIR/NDoH HPRS** | In development | FHIR R4 (partial) | NHI Health Patient Registration System |
| **HL7 South Africa** | Dormant/minimal | N/A | No published IGs on fhir.org |
| **Private sector (Discovery, Altron)** | Internal/proprietary | Mixed | Not publicly published |
| **DHIS2 FHIR adapter** | Active | FHIR R4 | District health information system bridge |

### Key Gap
SA lacks a canonical **"ZA Base" FHIR Implementation Guide** — the equivalent of:
- **US Core** (hl7.org/fhir/us/core)
- **AU Base** (hl7.org.au/fhir/core)
- **UK Core** (simplifier.net/HL7FHIRUKCoreR4)

**VisioCorp opportunity**: Define and publish the de facto SA FHIR profiles before the NHI mandates them. First-mover advantage is massive — whoever defines the profiles controls the ecosystem vocabulary.

---

## 2. KEY FHIR RESOURCES FOR SA CLAIMS

### Core Resource Map

| FHIR Resource | SA Use Case | SA-Specific Needs |
|--------------|-------------|-------------------|
| **Patient** | Member/beneficiary registration | SA ID number, passport (foreign nationals), scheme membership number, dependent code |
| **Practitioner** | Provider identification | HPCSA/AHPCSA number, BHF practice number, discipline code |
| **PractitionerRole** | Provider-at-practice link | Discipline-specific billing rights, scheme network status |
| **Organization** | Scheme, administrator, practice, hospital group | BHF number, scheme registration number, CMS registration |
| **Coverage** | Medical scheme membership | Scheme code, plan/option, member number, dependent code, effective dates, waiting periods |
| **Claim** | Claims submission (replaces MEDCLM) | CCSA tariff codes, ICD-10-ZA, NAPPI, modifiers, referring provider, pre-auth number |
| **ClaimResponse** | Adjudication result | Rejection codes (PHISC standard), benefit allocation, co-pay amount, scheme tariff vs charged |
| **ExplanationOfBenefit** | Member benefit statement / remittance | Benefit category breakdown, annual limits, savings balance |
| **Encounter** | Consultation/admission record | Admission type, ward type, DRG code, length of stay |
| **Condition** | Diagnosis (ICD-10-ZA) | Primary vs secondary, PMB flag, CDL flag, pre-existing condition flag |
| **Procedure** | Surgical/procedural codes | CCSA code, modifiers (0001-0027), assistant surgeon, theatre time |
| **MedicationRequest** | Prescription | NAPPI code, generic/originator, chronic vs acute, schedule (S0-S8) |
| **MedicationDispense** | Pharmacy dispensing | NAPPI, dispensing fee tier, generic substitution flag, SEP |
| **ServiceRequest** | Pre-authorization request | Clinical motivation, ICD-10-ZA, expected CCSA codes, scheme-specific auth rules |
| **DiagnosticReport** | Lab/pathology results | NHLS codes, pathology practice number, SNOMED-CT (where adopted) |
| **DocumentReference** | Supporting documents | Clinical notes, radiology images, pre-auth motivation letters |

### Claims Lifecycle in FHIR Resources

```
1. Coverage         → Member joins scheme (enrollment)
2. Encounter        → Patient visits provider
3. Condition        → Diagnosis recorded (ICD-10-ZA)
4. Procedure        → Treatment performed (CCSA)
5. MedicationRequest → Prescription written (NAPPI)
6. MedicationDispense → Medication dispensed
7. Claim            → Billing claim submitted
8. ClaimResponse    → Adjudication result returned
9. ExplanationOfBenefit → Statement to member
10. PaymentNotice   → Payment to provider
```

---

## 3. SA-SPECIFIC FHIR EXTENSIONS

SA healthcare requires extensions not in base FHIR. These should be defined in a **ZA Base IG**.

### Patient Extensions

```json
{
  "extension": [
    {
      "url": "http://fhir.health.gov.za/StructureDefinition/sa-id-number",
      "valueString": "8501015800086"
    },
    {
      "url": "http://fhir.health.gov.za/StructureDefinition/sa-passport-country",
      "valueCode": "ZW"
    },
    {
      "url": "http://fhir.health.gov.za/StructureDefinition/race",
      "valueCode": "african"
    },
    {
      "url": "http://fhir.health.gov.za/StructureDefinition/population-group",
      "valueCoding": {
        "system": "http://fhir.health.gov.za/CodeSystem/sa-population-group",
        "code": "1",
        "display": "African"
      }
    }
  ],
  "identifier": [
    {
      "type": { "coding": [{ "system": "http://fhir.health.gov.za/CodeSystem/identifier-type", "code": "SAID" }] },
      "system": "http://fhir.health.gov.za/sid/sa-id",
      "value": "8501015800086"
    },
    {
      "type": { "coding": [{ "system": "http://fhir.health.gov.za/CodeSystem/identifier-type", "code": "MEM" }] },
      "system": "http://fhir.health.gov.za/sid/scheme-membership",
      "value": "10012345-00"
    }
  ]
}
```

### Practitioner Extensions

| Extension | URI Pattern | Type | Description |
|-----------|------------|------|-------------|
| HPCSA Number | `za-hpcsa-number` | Identifier | e.g., MP0123456 |
| AHPCSA Number | `za-ahpcsa-number` | Identifier | Allied health council |
| SANC Number | `za-sanc-number` | Identifier | Nursing council |
| BHF Practice Number | `za-bhf-practice-number` | Identifier | 7-digit, e.g., 0012345 |
| Discipline Code | `za-discipline-code` | Coding | 2-digit HPCSA discipline |
| Scheme Network Status | `za-network-status` | Code | in-network / out-of-network / DSP |

### Claim Extensions

| Extension | Description |
|-----------|-------------|
| `za-pre-auth-number` | Pre-authorization reference |
| `za-scheme-tariff` | Scheme tariff percentage (e.g., 100%, 200%, 300% of scheme rate) |
| `za-modifier` | CCSA modifier codes (0001-0027) |
| `za-referring-practitioner` | Referring doctor BHF number |
| `za-claim-type` | in-hospital / out-of-hospital / pharmacy / dental / optical |
| `za-admission-date` | Hospital admission date (for in-hospital claims) |
| `za-discharge-date` | Hospital discharge date |
| `za-treatment-type` | acute / chronic / PMB / maternity / oncology |
| `za-dependent-code` | 2-digit dependent code (00 = principal, 01+ = dependents) |
| `za-nappi-code` | NAPPI medication identifier |
| `za-icd10-za-version` | ICD-10-ZA MIT version identifier |

### Coverage Extensions

| Extension | Description |
|-----------|-------------|
| `za-scheme-code` | CMS-registered scheme identifier |
| `za-option-code` | Plan/option within scheme |
| `za-waiting-period` | General (3 months), condition-specific (12 months), pre-existing |
| `za-late-joiner-penalty` | LJP percentage (5%-75% per year over age 35) |
| `za-savings-balance` | Medical savings account balance |
| `za-above-threshold-benefit` | ATB/AMTB remaining balance |
| `za-pmb-entitlement` | PMB benefits flag (all members entitled) |

---

## 4. HEALTH4AFRIKA & CSIR/NDoH FHIR WORK

### Health4Afrika Project (2017-2020)

**Partners**: Jembi Health Systems, University of KwaZulu-Natal, European partners (EU Horizon 2020 funded)

**What they built**:
- FHIR STU3 profiles for maternal health (ANC — Antenatal Care)
- Patient, Encounter, Observation profiles aligned with WHO ANC guidelines
- Tested in KZN clinics with the MomConnect platform
- Open-source reference implementation on GitHub (jembi/hearth FHIR server)

**Profiles defined**:
- `Health4Afrika-Patient` — extended with SA ID, population group
- `Health4Afrika-Encounter` — facility-based vs community visit
- `Health4Afrika-Observation` — vital signs, lab results mapped to LOINC
- `Health4Afrika-Condition` — ICD-10-ZA bindings

**Limitations**:
- Focused on maternal/public health, NOT claims/billing
- STU3 (now outdated — R4 is current standard)
- Limited adoption beyond pilot sites
- No claims-related resources (Claim, ClaimResponse, Coverage)

### CSIR/NDoH Work

The **Council for Scientific and Industrial Research (CSIR)** has been involved in:

1. **NHI HPRS Design** — The Health Patient Registration System uses a patient registry architecture influenced by FHIR Patient resource concepts, but the actual API specification has not been publicly released in full FHIR format
2. **National Digital Health Strategy (NDHS)** — References FHIR as the target interoperability standard but does not publish specific profiles
3. **mHealth standards** — CSIR contributed to mobile health data standards that align with FHIR Observation resources
4. **HIE Architecture** — The proposed SA Health Information Exchange architecture references OpenHIE patterns (which use FHIR internally)

### Jembi Health Systems (Key SA FHIR Organization)

Jembi is the primary technical implementer of FHIR in the SA public health context:
- **Hearth** — Open-source FHIR server (Node.js/MongoDB)
- **OpenHIM** — Open Health Information Mediator (message routing, not FHIR-native but FHIR-aware)
- **Instant OpenHIE** — Docker-based deployment of full OpenHIE stack with FHIR components
- **HAPI FHIR** — Java-based FHIR server used in some Jembi deployments

---

## 5. NHI FHIR REQUIREMENTS

### NHI IT Architecture (As Specified in NHI Act & Policy Documents)

The NHI Act (signed Dec 2023, ConCourt hearing May 2026) specifies a digital health information system but does **not** explicitly mandate FHIR. However, the NDoH National Digital Health Strategy and related policy documents reference interoperability standards that align with FHIR:

### Health Patient Registration System (HPRS)

| Aspect | Detail |
|--------|--------|
| **Purpose** | Single national patient registry — every SA resident gets a unique health identifier |
| **Architecture** | Centralized registry with Master Patient Index (MPI) |
| **FHIR alignment** | Patient resource with SA extensions (SA ID, biometrics reference, facility assignment) |
| **API** | REST-based (not publicly documented as FHIR, but conceptually aligned) |
| **Current status** | Piloted in limited facilities, not fully deployed |
| **Key fields** | National Health ID, SA ID/passport, biometric reference, assigned facility, NHI registration date |

### NHI Fund IT System Requirements

The NHI Fund (once operational) will need:

| System | FHIR Resources | Purpose |
|--------|----------------|---------|
| **Beneficiary Registry** | Patient, RelatedPerson | All SA residents registered for NHI |
| **Provider Registry** | Practitioner, PractitionerRole, Organization | Accredited NHI providers |
| **Benefits Package** | InsurancePlan, Coverage | Standard NHI benefit definitions |
| **Claims Processing** | Claim, ClaimResponse | Provider billing to NHI Fund |
| **Payment** | PaymentNotice, PaymentReconciliation | NHI Fund pays providers |
| **Formulary** | MedicationKnowledge, List | National Essential Medicines List (NEML) |
| **Referral Management** | ServiceRequest, Task | Referral pathways (PHC → district → tertiary) |
| **Quality Reporting** | MeasureReport, Measure | Provider performance metrics |

### NHI Interoperability Standards (Expected)

Based on policy documents and comparable universal health coverage systems:

1. **HL7 FHIR R4** — Target standard for new systems
2. **IHE profiles** — Patient identity (PIX/PDQ), document sharing (XDS)
3. **SNOMED CT** — SA has a SNOMED CT national license (2019)
4. **LOINC** — For laboratory observations
5. **ICD-10-ZA** — Diagnosis coding (SA-specific MIT version)
6. **CPT/CCSA** — Procedure coding (transitional, may move to ICHI)

---

## 6. CLAIMS FLOW IN FHIR/NHI MODEL

### Current Model (Private Schemes — EDIFACT)

```
Provider (PMS) → EDIFACT MEDCLM → Switch (Altron/MediKredit) → Administrator → Scheme
                                                                               ↓
Provider ← EDIFACT REMADV ← Switch ← Administrator ← Adjudication Engine
```

### Future Model (NHI — FHIR)

```
Provider (FHIR-enabled PMS)
    ↓
POST /Claim (FHIR R4 Claim resource)
    ↓
NHI Claims Gateway (FHIR facade)
    ↓
NHI Fund Claims Engine (adjudication)
    ↓
FHIR ClaimResponse (adjudication result)
    ↓
Provider receives ClaimResponse
    ↓
PaymentNotice → Provider bank account (NHI pays directly)
```

### Hybrid Transition Period (2026-2035)

During transition, both EDIFACT and FHIR will coexist:

```
┌─────────────────────────────────────────────┐
│           FHIR-EDIFACT Bridge               │
│                                             │
│  FHIR Claim ──→ Translator ──→ MEDCLM      │
│  MEDCLM     ──→ Translator ──→ FHIR Claim  │
│                                             │
│  FHIR ClaimResponse ←── REMADV             │
│  REMADV ←── FHIR ClaimResponse             │
│                                             │
│  Key mappings:                              │
│  - Claim.item.productOrService → CCSA code  │
│  - Claim.diagnosis → ICD-10-ZA              │
│  - Claim.item.detail → NAPPI                │
│  - Coverage.identifier → membership number  │
│  - ClaimResponse.adjudication → reject codes│
└─────────────────────────────────────────────┘
```

### FHIR Claim Resource for SA (Example)

```json
{
  "resourceType": "Claim",
  "status": "active",
  "type": {
    "coding": [{
      "system": "http://fhir.health.gov.za/CodeSystem/claim-type",
      "code": "professional",
      "display": "Out-of-Hospital Professional"
    }]
  },
  "patient": {
    "reference": "Patient/12345",
    "identifier": {
      "system": "http://fhir.health.gov.za/sid/scheme-membership",
      "value": "10012345-00"
    }
  },
  "created": "2026-03-21",
  "provider": {
    "reference": "PractitionerRole/67890",
    "identifier": {
      "system": "http://fhir.health.gov.za/sid/bhf-practice-number",
      "value": "0012345"
    }
  },
  "insurance": [{
    "coverage": {
      "reference": "Coverage/cov-1",
      "display": "Discovery Health KeyCare Plus"
    }
  }],
  "diagnosis": [
    {
      "sequence": 1,
      "diagnosisCodeableConcept": {
        "coding": [{
          "system": "http://fhir.health.gov.za/CodeSystem/icd-10-za",
          "code": "I10",
          "display": "Essential (primary) hypertension"
        }]
      },
      "type": [{
        "coding": [{
          "system": "http://fhir.health.gov.za/CodeSystem/diagnosis-type",
          "code": "principal"
        }]
      }]
    }
  ],
  "item": [
    {
      "sequence": 1,
      "productOrService": {
        "coding": [{
          "system": "http://fhir.health.gov.za/CodeSystem/ccsa-tariff",
          "code": "0190",
          "display": "Consultation — GP"
        }]
      },
      "unitPrice": {
        "value": 520.00,
        "currency": "ZAR"
      },
      "quantity": { "value": 1 }
    },
    {
      "sequence": 2,
      "productOrService": {
        "coding": [{
          "system": "http://fhir.health.gov.za/CodeSystem/nappi",
          "code": "715824001",
          "display": "Amlodipine 5mg tabs 30s"
        }]
      },
      "unitPrice": {
        "value": 89.50,
        "currency": "ZAR"
      },
      "quantity": { "value": 1 }
    }
  ],
  "total": {
    "value": 609.50,
    "currency": "ZAR"
  }
}
```

---

## 7. DRG REPRESENTATION IN FHIR

### SA DRG Background

SA has been developing a DRG system for hospital funding under NHI:
- **SA-IRG (SA Interim Revised Grouper)** — adapted from Australian AR-DRG
- **Purpose**: Prospective payment for hospitals (replacing fee-for-service for in-patient)
- **Planned use**: NHI will use DRGs for hospital reimbursement

### FHIR DRG Representation

```json
{
  "resourceType": "Encounter",
  "class": {
    "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
    "code": "IMP",
    "display": "inpatient encounter"
  },
  "extension": [
    {
      "url": "http://fhir.health.gov.za/StructureDefinition/sa-drg",
      "valueCoding": {
        "system": "http://fhir.health.gov.za/CodeSystem/sa-irg",
        "code": "E65A",
        "display": "Chronic obstructive airways disease, major complexity"
      }
    },
    {
      "url": "http://fhir.health.gov.za/StructureDefinition/sa-drg-weight",
      "valueDecimal": 1.2345
    },
    {
      "url": "http://fhir.health.gov.za/StructureDefinition/sa-drg-base-rate",
      "valueMoney": {
        "value": 15000.00,
        "currency": "ZAR"
      }
    }
  ],
  "diagnosis": [
    {
      "condition": { "reference": "Condition/primary-dx" },
      "use": {
        "coding": [{
          "system": "http://fhir.health.gov.za/CodeSystem/diagnosis-use",
          "code": "principal"
        }]
      }
    }
  ],
  "length": {
    "value": 5,
    "unit": "days"
  }
}
```

### DRG in ClaimResponse (Hospital Payment)

```json
{
  "resourceType": "ClaimResponse",
  "adjudication": [
    {
      "category": {
        "coding": [{
          "system": "http://fhir.health.gov.za/CodeSystem/adjudication",
          "code": "drg-payment"
        }]
      },
      "amount": {
        "value": 18517.50,
        "currency": "ZAR"
      },
      "reason": {
        "coding": [{
          "system": "http://fhir.health.gov.za/CodeSystem/sa-irg",
          "code": "E65A"
        }]
      }
    }
  ]
}
```

---

## 8. FHIR R4 vs R5 — WHICH VERSION FOR SA

### Recommendation: **FHIR R4 (4.0.1)** — Target R4 Now, Plan R5 Migration Path

| Factor | R4 | R5 | Decision |
|--------|----|----|----------|
| **Maturity** | Normative (stable since 2019) | STU (2023, still evolving) | R4 wins |
| **Ecosystem** | Widest library/tool support | Limited tooling | R4 wins |
| **SA Alignment** | OpenHIE, HAPI, most African implementations use R4 | No SA implementations yet | R4 wins |
| **Global IGs** | US Core, AU Base, UK Core all R4-based | Only experimental R5 IGs | R4 wins |
| **Cloud FHIR** | Azure FHIR (retiring Sep 2026 → Azure Health Data Services), Google Healthcare API, AWS HealthLake — all R4 | Limited R5 support | R4 wins |
| **Claims resources** | Claim, ClaimResponse mature | Minor improvements | R4 adequate |
| **Subscriptions** | Backport available | Native Topics model (better) | R5 nicer but not essential |
| **New features** | N/A | SubscriptionTopic, improved search, Requirements resource | Useful but not critical |

### Migration Strategy

```
Phase 1 (2026-2027): Build on FHIR R4
Phase 2 (2028-2029): Add R5 features via backport IGs where needed
Phase 3 (2030+):     Full R5 migration when SA IG is published in R5
```

### Azure FHIR Service Note

**CRITICAL**: Azure API for FHIR (standalone) retires **September 2026**. All SA implementations using Azure must migrate to **Azure Health Data Services** (which supports both R4 and partial R5). VisioCorp FHIR Hub should target Azure Health Data Services or self-hosted HAPI FHIR.

---

## 9. SMART ON FHIR FOR SA

### What Is SMART on FHIR

SMART (Substitutable Medical Applications, Reusable Technologies) on FHIR provides:
- **OAuth 2.0-based authorization** for health apps accessing FHIR servers
- **Launch framework** — apps launched from EHR/PMS context
- **Scopes** — granular access control (patient/*.read, user/Claim.write)
- **App gallery** — discoverable health applications

### SA Authentication Patterns

| Pattern | Use Case | Implementation |
|---------|----------|----------------|
| **EHR Launch** | App launched from within PMS (CareOn, GoodX) | PMS provides launch context with patient ID, practitioner ID |
| **Standalone Launch** | Patient-facing app (member portal) | OAuth2 authorization code flow, patient authenticates via scheme portal |
| **Backend Service** | Server-to-server (claims processing, batch) | OAuth2 client credentials flow, JWT assertion |
| **POPIA-Compliant Consent** | Patient consent for data sharing | FHIR Consent resource + OAuth scopes aligned with POPIA categories |

### SA-Specific SMART Scopes

```
# Provider scopes (practitioner context)
user/Patient.read            — Read patient demographics
user/Claim.write             — Submit claims
user/ClaimResponse.read      — Read adjudication results
user/Coverage.read           — Check membership eligibility
user/MedicationRequest.write — Write prescriptions

# Patient scopes (member context)
patient/ExplanationOfBenefit.read  — View own benefit statements
patient/Coverage.read              — View own coverage
patient/Claim.read                 — View own claims history
patient/Condition.read             — View own diagnoses

# System scopes (backend service)
system/Claim.write                 — Batch claims submission
system/Patient.read                — Patient lookup (MPI)
system/Bulk.read                   — Bulk data export
```

### POPIA Consent in SMART on FHIR

```json
{
  "resourceType": "Consent",
  "status": "active",
  "scope": {
    "coding": [{
      "system": "http://fhir.health.gov.za/CodeSystem/consent-scope",
      "code": "popia-health-data",
      "display": "POPIA Health Data Processing Consent"
    }]
  },
  "category": [{
    "coding": [{
      "system": "http://fhir.health.gov.za/CodeSystem/consent-category",
      "code": "treatment",
      "display": "Consent for treatment data processing"
    }]
  }],
  "patient": { "reference": "Patient/12345" },
  "dateTime": "2026-03-21",
  "provision": {
    "type": "permit",
    "purpose": [
      { "system": "http://fhir.health.gov.za/CodeSystem/popia-purpose", "code": "claims-processing" },
      { "system": "http://fhir.health.gov.za/CodeSystem/popia-purpose", "code": "chronic-management" }
    ],
    "dataPeriod": {
      "start": "2026-03-21",
      "end": "2027-03-21"
    }
  }
}
```

---

## 10. FHIR BULK DATA & SUBSCRIPTIONS

### Bulk Data for SA

The **FHIR Bulk Data Access** specification (IG: hl7.org/fhir/uv/bulkdata) enables large-scale data export. Critical for SA use cases:

| Use Case | Operation | Data |
|----------|-----------|------|
| **Claims data warehouse** | `GET /$export` on Group (all scheme members) | Claim, ClaimResponse, ExplanationOfBenefit |
| **Patient registry sync** | `GET /Patient/$export` | Patient demographics for MPI |
| **Chronic disease registry** | `GET /Group/[chronic-cohort]/$export` | Patient, Condition, MedicationRequest |
| **CMS regulatory reporting** | `GET /$export` with _type filter | Aggregate claims, membership, benefit data |
| **NHI enrollment** | `GET /Patient/$export` from HPRS | Full patient list for NHI beneficiary registry |

### Implementation Pattern

```
1. Client requests: GET /fhir/$export?_type=Claim,ClaimResponse&_since=2026-01-01
2. Server responds: 202 Accepted + Content-Location header
3. Client polls: GET /fhir/bulkstatus/job-123
4. When ready: Server returns NDJSON file URLs
5. Client downloads: GET /fhir/bulk-output/claims-2026.ndjson
```

**Format**: NDJSON (Newline Delimited JSON) — one FHIR resource per line
**Size consideration**: SA schemes process 100M+ claims/year. Bulk exports must support:
- Incremental (`_since` parameter)
- Type filtering (`_type=Claim,Patient`)
- Group-based (specific scheme or provider group)
- Compression (gzip for NDJSON files)

### FHIR Subscriptions for SA

**R4 Subscriptions** (backport available) or **R5 SubscriptionTopic**:

| Event | Trigger | Consumer |
|-------|---------|----------|
| **Claim status change** | ClaimResponse created | Provider PMS |
| **Pre-auth decision** | ClaimResponse for ServiceRequest | Provider, patient |
| **Benefit update** | ExplanationOfBenefit updated | Member app |
| **Formulary change** | MedicationKnowledge updated | Pharmacy systems |
| **Member enrollment** | Coverage created/updated | Provider networks |
| **PMB alert** | Condition flagged as PMB | Case manager |

### Subscription Example (Claim Status)

```json
{
  "resourceType": "Subscription",
  "status": "active",
  "reason": "Notify provider when claim is adjudicated",
  "criteria": "ClaimResponse?request=Claim/claim-123",
  "channel": {
    "type": "rest-hook",
    "endpoint": "https://provider-pms.co.za/fhir/webhook",
    "payload": "application/fhir+json",
    "header": ["Authorization: Bearer provider-api-key"]
  }
}
```

---

## 11. TERMINOLOGY BINDINGS — ICD-10-ZA, NAPPI, CCSA

### CodeSystem Definitions for SA

Every SA coding system needs a formal FHIR CodeSystem resource. These do not exist officially yet — VisioCorp should define them.

#### ICD-10-ZA CodeSystem

```json
{
  "resourceType": "CodeSystem",
  "url": "http://fhir.health.gov.za/CodeSystem/icd-10-za",
  "identifier": [{ "value": "ICD-10-ZA-MIT-2014" }],
  "version": "2014.01",
  "name": "ICD10ZA",
  "title": "ICD-10 South Africa (Master Industry Table)",
  "status": "active",
  "publisher": "National Department of Health, South Africa",
  "contact": [{ "telecom": [{ "value": "ICD10@health.gov.za" }] }],
  "description": "SA adaptation of WHO ICD-10, using the Master Industry Table (MIT) published by NDoH. NOT ICD-10-CM (US version).",
  "content": "complete",
  "count": 14400,
  "property": [
    { "code": "valid-clinical", "type": "boolean", "description": "MIT Column J — Valid for clinical use" },
    { "code": "valid-primary", "type": "boolean", "description": "MIT Column K — Valid as primary diagnosis" },
    { "code": "asterisk", "type": "boolean", "description": "MIT Column L — Manifestation code (requires dagger)" },
    { "code": "dagger", "type": "boolean", "description": "MIT Column M — Etiology code (requires asterisk)" },
    { "code": "pmb", "type": "boolean", "description": "PMB Prescribed Minimum Benefit condition" },
    { "code": "cdl", "type": "boolean", "description": "Chronic Disease List condition" }
  ]
}
```

#### NAPPI CodeSystem

```json
{
  "resourceType": "CodeSystem",
  "url": "http://fhir.health.gov.za/CodeSystem/nappi",
  "name": "NAPPI",
  "title": "National Pharmaceutical Product Interface",
  "status": "active",
  "publisher": "MediKredit (Altron HealthTech)",
  "description": "SA pharmaceutical product identifier. 9-digit numeric code. Covers medicines, surgical consumables, medical devices.",
  "content": "not-present",
  "property": [
    { "code": "schedule", "type": "code", "description": "SAHPRA schedule (S0-S8)" },
    { "code": "sep", "type": "decimal", "description": "Single Exit Price in ZAR" },
    { "code": "generic-indicator", "type": "boolean", "description": "Generic vs originator" },
    { "code": "atc", "type": "string", "description": "ATC classification code" }
  ]
}
```

#### CCSA Tariff CodeSystem

```json
{
  "resourceType": "CodeSystem",
  "url": "http://fhir.health.gov.za/CodeSystem/ccsa-tariff",
  "name": "CCSATariff",
  "title": "Coding Committee of South Africa Tariff Codes",
  "status": "active",
  "publisher": "Coding Committee of South Africa",
  "description": "SA medical procedure and service codes. 4-digit numeric codes (0100-9999) organized by discipline.",
  "content": "not-present",
  "property": [
    { "code": "discipline", "type": "string", "description": "Medical discipline (GP, surgeon, anaesthetist, etc.)" },
    { "code": "in-hospital", "type": "boolean", "description": "Valid for in-hospital use" },
    { "code": "out-hospital", "type": "boolean", "description": "Valid for out-of-hospital use" }
  ]
}
```

#### CCSA Modifier CodeSystem

```json
{
  "resourceType": "CodeSystem",
  "url": "http://fhir.health.gov.za/CodeSystem/ccsa-modifier",
  "name": "CCSAModifier",
  "title": "CCSA Tariff Modifiers",
  "status": "active",
  "content": "complete",
  "count": 27,
  "concept": [
    { "code": "0001", "display": "After-hours: Mon-Fri before 07:00 or after 18:00" },
    { "code": "0002", "display": "After-hours: Saturday after 13:00" },
    { "code": "0003", "display": "After-hours: Sunday and public holidays" },
    { "code": "0007", "display": "Repeat consultation same day" },
    { "code": "0011", "display": "Additional procedure via same incision" },
    { "code": "0018", "display": "Teaching hospital modifier" },
    { "code": "0023", "display": "Bilateral procedure" },
    { "code": "0027", "display": "Locum" }
  ]
}
```

#### BHF Practice Number

```json
{
  "resourceType": "NamingSystem",
  "name": "BHFPracticeNumber",
  "status": "active",
  "kind": "identifier",
  "description": "Board of Healthcare Funders practice number. 7-digit numeric identifier for healthcare practices.",
  "uniqueId": [
    { "type": "uri", "value": "http://fhir.health.gov.za/sid/bhf-practice-number", "preferred": true }
  ]
}
```

### ValueSet Bindings

| ValueSet | Binding Strength | Bound To |
|----------|-----------------|----------|
| ICD-10-ZA | Required | Condition.code, Claim.diagnosis |
| CCSA Tariff | Required | Claim.item.productOrService (professional services) |
| NAPPI | Required | Claim.item.productOrService (medicines), MedicationRequest.medication |
| CCSA Modifier | Required | Claim.item.modifier |
| BHF Practice | Required | PractitionerRole.identifier, Organization.identifier |
| HPCSA Discipline | Required | PractitionerRole.specialty |
| SA Population Group | Extensible | Patient.extension |
| SA Scheme Codes | Required | Coverage.payor, InsurancePlan.identifier |

---

## 12. FHIR-EDIFACT BRIDGE

### Why a Bridge Is Essential

SA's claims ecosystem runs on **EDIFACT (MEDCLM/REMADV/ELIGIB)** — see file `02_claims_adjudication.md`. FHIR adoption will be gradual. A bridge/translator is mandatory for the transition period.

### EDIFACT ↔ FHIR Mapping Table

| EDIFACT Segment | EDIFACT Field | FHIR Resource | FHIR Path |
|----------------|---------------|---------------|-----------|
| **UNH** | Message type (MEDCLM) | Claim | resourceType |
| **BGM** | Document number | Claim | Claim.identifier |
| **DTM** | Dates | Claim | Claim.created, Claim.billablePeriod |
| **NAD+PR** | Provider (BHF no) | PractitionerRole | PractitionerRole.identifier (BHF) |
| **NAD+PA** | Patient | Patient | Patient.identifier (membership) |
| **NAD+PY** | Payer (scheme) | Coverage | Coverage.payor |
| **CLI** | Clinical info (ICD-10) | Claim.diagnosis | Claim.diagnosis.diagnosisCodeableConcept |
| **GIS** | Treatment type | Claim.type | Claim.type + extensions |
| **LIN** | Line item (CCSA code) | Claim.item | Claim.item.productOrService |
| **MOA** | Monetary amount | Claim.item | Claim.item.unitPrice |
| **QTY** | Quantity | Claim.item | Claim.item.quantity |
| **RFF** | Reference (pre-auth) | Claim | Claim.preAuthRef |
| **ALC** | Modifier codes | Claim.item | Claim.item.modifier |

### REMADV → ClaimResponse Mapping

| EDIFACT Segment | FHIR Path |
|----------------|-----------|
| **BGM** (response ref) | ClaimResponse.identifier |
| **DTM** (process date) | ClaimResponse.created |
| **MOA+9** (paid amount) | ClaimResponse.payment.amount |
| **MOA+52** (claimed) | ClaimResponse.total (submitted) |
| **FTX+AAO** (rejection reason) | ClaimResponse.error.code |
| **AJT** (adjustment) | ClaimResponse.adjudication |
| **MOA+131** (co-pay) | ClaimResponse.adjudication (copay category) |
| **RFF+ACD** (reject code) | ClaimResponse.error.code |

### Bridge Architecture

```
┌──────────────┐     ┌──────────────────────┐     ┌──────────────┐
│ FHIR Client  │────→│   FHIR-EDIFACT       │────→│ Switch       │
│ (PMS/EHR)    │     │   Translation Layer   │     │ (Altron/     │
│              │←────│                        │←────│  MediKredit) │
└──────────────┘     │ ┌──────────────────┐  │     └──────────────┘
                     │ │ FHIR Claim       │  │
                     │ │    ↕              │  │
                     │ │ EDIFACT MEDCLM   │  │
                     │ ├──────────────────┤  │
                     │ │ EDIFACT REMADV   │  │
                     │ │    ↕              │  │
                     │ │ FHIR ClaimResp   │  │
                     │ └──────────────────┘  │
                     └──────────────────────┘
```

### Implementation Notes

1. **Validation both ways** — FHIR Claim must be valid before EDIFACT conversion; EDIFACT response must be valid before FHIR conversion
2. **Lossy translation** — FHIR carries more metadata than EDIFACT. Store the full FHIR resource and only send required fields via EDIFACT
3. **Round-trip fidelity** — FHIR Claim → EDIFACT → Switch → EDIFACT Response → FHIR ClaimResponse must preserve claim identity and line-item linking
4. **Error codes** — Map PHISC rejection codes (see `02_claims_adjudication.md`) to FHIR ClaimResponse.error with SA CodeSystem

---

## 13. FHIR ↔ SWITCHING HOUSE

### Can FHIR Replace EDIFACT for Claims?

**Short answer**: Not before 2030. Likely 2032-2035.

### Timeline Assessment

| Period | Status |
|--------|--------|
| **2026-2027** | EDIFACT dominant. FHIR used for eligibility checks, patient lookup, benefit inquiries (read-only) |
| **2028-2029** | FHIR claims submission piloted by 1-2 schemes (likely Discovery or GEMS). EDIFACT still primary |
| **2030-2032** | NHI Fund may mandate FHIR for NHI claims. Private schemes still on EDIFACT |
| **2032-2035** | Dual-stack period. Major schemes adopt FHIR. EDIFACT legacy maintained for small schemes |
| **2035+** | FHIR becomes primary standard (IF NHI implementation proceeds) |

### What Switches Would Need

For Altron/MediKredit to support FHIR:

1. **FHIR endpoint** — Accept `POST /Claim` in addition to EDIFACT MEDCLM
2. **FHIR response** — Return `ClaimResponse` in addition to EDIFACT REMADV
3. **FHIR eligibility** — `POST /CoverageEligibilityRequest` replacing ELIGIB
4. **FHIR pre-auth** — `POST /Claim` with `use: preauthorization`
5. **Terminology server** — Serve ICD-10-ZA, CCSA, NAPPI as FHIR CodeSystems
6. **Identity service** — FHIR Patient matching / $match operation
7. **Backwards compatibility** — Continue EDIFACT for non-FHIR practices

### VisioCorp Opportunity

Build the **FHIR-EDIFACT bridge** that sits between FHIR-native apps and legacy switches. This is the highest-value integration layer:
- FHIR-first developers build to your API
- You translate to EDIFACT for the switch
- When switches go FHIR-native, you become a pass-through (still valuable for routing, validation, analytics)

---

## 14. FHIR ↔ EHR INTEGRATION

### Major SA PMS/EHR Systems and FHIR Readiness

| System | Vendor | Market | FHIR Status | Integration Approach |
|--------|--------|--------|-------------|---------------------|
| **CareOn (Bridge)** | Altron | Hospital groups (Netcare, Life) | Partial R4 | HL7v2 ADT → FHIR via adapter. CareOn Bridge has emerging FHIR API |
| **Healthbridge** | Healthbridge | 6,000+ practices | EDIFACT only | Needs FHIR facade/adapter |
| **GoodX** | GoodX | GP, specialist, allied | No FHIR | REST API exists; needs FHIR mapping layer |
| **Elixir Live** | Altron | 1,200+ practices | No FHIR | Altron internal — likely first to get FHIR via SwitchOn upgrade |
| **Medx** | iMedx | Hospital groups | HL7v2 | v2 → FHIR adapter needed |
| **HealthOne** | Altron | EHR module | Partial | Altron ecosystem |
| **Rx Solutions** | Liberty | Pharmacy chains | No FHIR | NAPPI-based; needs MedicationDispense mapping |
| **Torex/iSOFT** | CSC/DXC | Public hospitals | HL7v2 | Legacy; v2 → FHIR via OpenHIM mediator |

### Integration Patterns

#### Pattern 1: FHIR Facade (Recommended for VisioCorp)

```
┌──────────┐     ┌──────────────────┐     ┌──────────┐
│ PMS/EHR  │────→│ VisioCorp FHIR   │────→│ FHIR     │
│ (any)    │     │ Facade           │     │ Consumer │
│          │←────│                  │←────│          │
└──────────┘     │ Adapters:       │     └──────────┘
  (proprietary    │ - HL7v2→FHIR   │
   API/HL7v2/     │ - REST→FHIR    │
   EDIFACT)       │ - CSV→FHIR     │
                  │ - EDIFACT→FHIR │
                  └──────────────────┘
```

#### Pattern 2: FHIR Proxy (For CareOn Bridge)

```
CareOn Bridge API → FHIR Proxy → Standardized FHIR R4 Resources
```

#### Pattern 3: Bulk Sync (For Legacy Systems)

```
Legacy DB → Nightly ETL → FHIR Bundle → POST to FHIR Server
```

---

## 15. FHIR ↔ LAB SYSTEMS & PHARMACY

### Lab/Pathology (DiagnosticReport)

SA pathology labs (Lancet, PathCare, Ampath, NHLS) primarily use **HL7v2 ORU messages** for results delivery.

#### FHIR DiagnosticReport for SA Lab Result

```json
{
  "resourceType": "DiagnosticReport",
  "status": "final",
  "category": [{
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/v2-0074",
      "code": "LAB"
    }]
  }],
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "2345-7",
        "display": "Glucose [Mass/volume] in Serum or Plasma"
      },
      {
        "system": "http://fhir.health.gov.za/CodeSystem/nhls-test-code",
        "code": "GLUC",
        "display": "Glucose — fasting"
      }
    ]
  },
  "subject": { "reference": "Patient/12345" },
  "performer": [{
    "reference": "Organization/lancet-lab",
    "display": "Lancet Laboratories"
  }],
  "result": [{
    "reference": "Observation/glucose-result"
  }],
  "conclusion": "Glucose 6.8 mmol/L — elevated. Suggest HbA1c."
}
```

#### HL7v2 ORU → FHIR Mapping

| HL7v2 Segment | FHIR Resource/Path |
|--------------|--------------------|
| MSH | Bundle.meta (message header) |
| PID | Patient |
| ORC | ServiceRequest |
| OBR | DiagnosticReport |
| OBX | Observation (individual result) |
| NTE | DiagnosticReport.conclusion or Observation.note |

### Pharmacy (MedicationDispense)

#### FHIR MedicationDispense for SA

```json
{
  "resourceType": "MedicationDispense",
  "status": "completed",
  "medicationCodeableConcept": {
    "coding": [
      {
        "system": "http://fhir.health.gov.za/CodeSystem/nappi",
        "code": "715824001",
        "display": "Amlodipine 5mg tablets 30s"
      },
      {
        "system": "http://www.whocc.no/atc",
        "code": "C08CA01",
        "display": "Amlodipine"
      }
    ]
  },
  "subject": { "reference": "Patient/12345" },
  "performer": [{
    "actor": {
      "reference": "Organization/pharmacy-123",
      "identifier": {
        "system": "http://fhir.health.gov.za/sid/bhf-practice-number",
        "value": "0098765"
      }
    }
  }],
  "quantity": {
    "value": 30,
    "unit": "tablet",
    "system": "http://unitsofmeasure.org",
    "code": "{tablet}"
  },
  "extension": [
    {
      "url": "http://fhir.health.gov.za/StructureDefinition/za-dispensing-fee",
      "valueMoney": { "value": 46.00, "currency": "ZAR" }
    },
    {
      "url": "http://fhir.health.gov.za/StructureDefinition/za-sep",
      "valueMoney": { "value": 89.50, "currency": "ZAR" }
    },
    {
      "url": "http://fhir.health.gov.za/StructureDefinition/za-generic-substitution",
      "valueBoolean": true
    },
    {
      "url": "http://fhir.health.gov.za/StructureDefinition/za-schedule",
      "valueCode": "S4"
    }
  ]
}
```

---

## 16. OPENHIE & SA's ROLE

### OpenHIE Architecture

**OpenHIE** (Open Health Information Exchange) is the reference architecture that SA's NHI digital health strategy is based on. SA organizations (Jembi, CSIR) are founding contributors.

### OpenHIE Components

```
┌─────────────────────────────────────────────────────────┐
│                    POINT OF SERVICE                      │
│  (PMS, EHR, Mobile App, Lab System, Pharmacy)           │
└────────────────────────┬────────────────────────────────┘
                         │
                    ┌────▼────┐
                    │ OpenHIM │  ← Health Information Mediator
                    │ (IOL)   │     (Interoperability Layer)
                    └────┬────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
   ┌──────▼──────┐ ┌────▼────┐ ┌──────▼──────┐
   │ Client      │ │ Facility│ │ Health      │
   │ Registry    │ │ Registry│ │ Worker      │
   │ (FHIR       │ │ (FHIR   │ │ Registry   │
   │  Patient)   │ │  Loc.)  │ │ (FHIR Prac)│
   └─────────────┘ └─────────┘ └─────────────┘
          │              │              │
   ┌──────▼──────┐ ┌────▼────┐ ┌──────▼──────┐
   │ Shared      │ │ Termin- │ │ FHIR Data  │
   │ Health      │ │ ology   │ │ Store      │
   │ Record      │ │ Service │ │            │
   │ (FHIR SHR)  │ │ (FHIR   │ │ (HAPI/     │
   │             │ │  CS/VS) │ │  Hearth)   │
   └─────────────┘ └─────────┘ └─────────────┘
```

### OpenHIE Components Using FHIR

| Component | FHIR Usage | SA Implementation |
|-----------|-----------|-------------------|
| **Client Registry (CR)** | FHIR Patient resource, $match operation | HPRS (NHI patient registry) |
| **Facility Registry (FR)** | FHIR Location, Organization | NDoH Master Facility List |
| **Health Worker Registry (HWR)** | FHIR Practitioner, PractitionerRole | HPCSA register |
| **Terminology Service (TS)** | FHIR CodeSystem, ValueSet, ConceptMap | ICD-10-ZA, NAPPI, CCSA (to be built) |
| **Shared Health Record (SHR)** | FHIR Bundle of clinical resources | Not yet implemented in SA |
| **Interoperability Layer (IOL)** | OpenHIM — routes, transforms, logs | Jembi OpenHIM deployed at NDoH |

### SA's Contribution to OpenHIE

- **Jembi Health Systems** (Cape Town) — primary technical contributor, maintains OpenHIM and Hearth
- **CSIR** — architecture advisory, NHI alignment
- **University of KwaZulu-Natal** — Health4Afrika research
- **WHO AFRO** — African region coordination, SMART Guidelines in FHIR

---

## 17. DHIS2 FHIR ADAPTER

### What DHIS2 Does in SA

**DHIS2** (District Health Information Software 2) is SA's national health data collection system for the public sector:
- Used by all 9 provinces for routine health data reporting
- Tracks disease surveillance, facility performance, maternal/child health indicators
- **NOT used for claims** — used for aggregate public health reporting

### DHIS2 FHIR Integration

The **DHIS2 FHIR Adapter** enables bidirectional data exchange:

| Direction | Use Case | FHIR Resources |
|-----------|----------|----------------|
| **DHIS2 → FHIR** | Export aggregate data as FHIR MeasureReport | MeasureReport, Measure |
| **DHIS2 → FHIR** | Export tracked entities as FHIR Patient | Patient, Encounter |
| **FHIR → DHIS2** | Import patient-level data from FHIR sources | Patient → Tracked Entity |
| **FHIR → DHIS2** | Import lab results for surveillance | Observation → Data Value |

### SA-Specific DHIS2-FHIR Flows

```
DHIS2 Tracker (TB/HIV/COVID surveillance)
    ↓ FHIR Adapter
FHIR Patient + Condition + Observation
    ↓
NHI Patient Registry (HPRS) — patient matching
    ↓
FHIR Shared Health Record — longitudinal view
```

### Relevance to VisioCorp

**Low priority** for claims/billing products. DHIS2-FHIR is relevant if VisioCorp builds:
- Public health reporting dashboards
- Disease surveillance analytics
- NHI population health management tools

---

## 18. EXISTING SA FHIR IMPLEMENTATIONS

### Known Implementations (2026)

| Organization | What | FHIR Version | Status |
|-------------|------|--------------|--------|
| **Jembi Health Systems** | OpenHIM + Hearth FHIR server for NDoH | R4 | Production (mediator), pilot (FHIR store) |
| **Discovery Health** | Internal FHIR POC for member API | R4 | Internal pilot |
| **Altron HealthTech** | CareOn Bridge FHIR endpoints | R4 (partial) | Development |
| **Netcare** | Hospital data exchange pilots | R4 | POC |
| **Life Healthcare** | Clinical data warehouse FHIR layer | R4 | POC |
| **NHLS** | Lab results FHIR endpoints (limited) | R4 | Pilot |
| **NDoH/CSIR** | HPRS (patient registry) FHIR concepts | R4 (influenced) | Development |
| **MomConnect** | Maternal health — FHIR-based data exchange | STU3 → R4 | Production (limited) |
| **Vula Mobile** | Referral system — partial FHIR | R4 | Production |
| **Western Cape DoH** | Provincial shared health record pilots | R4 | Pilot |

### Academic & Research

- **University of Cape Town** — FHIR for SA health data exchange (multiple papers)
- **Stellenbosch University** — Interoperability in SA healthcare (thesis work)
- **UKZN** — Health4Afrika FHIR profiles
- **Wits** — Digital health policy analysis including FHIR readiness

### Key Finding

**No SA organization has published a complete, publicly available SA FHIR Implementation Guide.** The market is wide open.

---

## 19. VISIOCORP FHIR HUB — ARCHITECTURE RECOMMENDATIONS

### What VisioCorp FHIR Hub Should Be

A **FHIR R4 server + translation layer + terminology service** that acts as the interoperability backbone for VisioCorp health products.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VisioCorp FHIR Hub                         │
│                                                               │
│  ┌───────────────┐  ┌───────────────┐  ┌──────────────────┐ │
│  │ FHIR R4       │  │ Translation   │  │ Terminology      │ │
│  │ Server        │  │ Engine        │  │ Service          │ │
│  │               │  │               │  │                  │ │
│  │ HAPI FHIR     │  │ FHIR↔EDIFACT │  │ ICD-10-ZA        │ │
│  │ (Java) or     │  │ FHIR↔HL7v2   │  │ CCSA Tariff      │ │
│  │ Medplum       │  │ FHIR↔CSV     │  │ NAPPI            │ │
│  │ (TypeScript)  │  │ FHIR↔JSON    │  │ CCSA Modifiers   │ │
│  │               │  │               │  │ PHISC Reject     │ │
│  └───────┬───────┘  └───────┬───────┘  │ BHF Numbers      │ │
│          │                  │          │ HPCSA Disciplines │ │
│          │                  │          └────────┬─────────┘ │
│          │                  │                   │           │
│  ┌───────▼──────────────────▼───────────────────▼─────────┐ │
│  │              FHIR Resource Store                        │ │
│  │         (PostgreSQL + JSONB or dedicated)               │ │
│  └─────────────────────────┬───────────────────────────────┘ │
│                            │                                 │
│  ┌─────────────────────────▼───────────────────────────────┐ │
│  │            API Gateway (REST + SMART on FHIR)           │ │
│  │  • OAuth2 / SMART launch                                │ │
│  │  • Rate limiting, audit logging                         │ │
│  │  • POPIA consent enforcement                            │ │
│  └─────────────────────────┬───────────────────────────────┘ │
└────────────────────────────┼─────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
    ┌─────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
    │ Netcare    │   │ HealthOps   │   │ Claims      │
    │ Health OS  │   │ Platform    │   │ Analyzer    │
    └────────────┘   └─────────────┘   └─────────────┘
```

### Technology Choices

| Component | Recommended | Alternative | Reason |
|-----------|-------------|-------------|--------|
| **FHIR Server** | **Medplum** (TypeScript) | HAPI FHIR (Java) | Medplum aligns with VisioCorp's TypeScript stack. Open-source, modern, Postgres-backed |
| **Database** | PostgreSQL (Supabase) | Dedicated FHIR store | Leverages existing Supabase infrastructure |
| **Translation** | Custom TypeScript | Smile CDR, Rhapsody | Full control over SA-specific mappings |
| **Terminology** | Built into FHIR server | Ontoserver, Snowstorm | Keep it simple, load SA CodeSystems directly |
| **Auth** | SMART on FHIR (OAuth2) | API keys | Standards-compliant, future-proof |
| **Hosting** | Vercel + Supabase | Azure Health Data Services | Cost-effective, existing infrastructure |

### Build Priority (Phases)

#### Phase 1: Foundation (4-6 weeks)
- [ ] Deploy FHIR R4 server (Medplum or HAPI)
- [ ] Load SA CodeSystems (ICD-10-ZA, CCSA, NAPPI, modifiers)
- [ ] Define SA Patient, Practitioner, Organization profiles
- [ ] Basic CRUD for Patient, Coverage, Claim, ClaimResponse
- [ ] API key authentication

#### Phase 2: Claims Translation (4-6 weeks)
- [ ] FHIR Claim → EDIFACT MEDCLM translator
- [ ] EDIFACT REMADV → FHIR ClaimResponse translator
- [ ] FHIR CoverageEligibilityRequest → ELIGIB translator
- [ ] Rejection code mapping (PHISC → FHIR)
- [ ] Round-trip validation testing

#### Phase 3: Clinical Integration (4-6 weeks)
- [ ] HL7v2 ADT/ORU → FHIR adapter (for CareOn, lab systems)
- [ ] FHIR DiagnosticReport (pathology results)
- [ ] FHIR MedicationDispense (pharmacy)
- [ ] SMART on FHIR authentication
- [ ] POPIA Consent resource enforcement

#### Phase 4: Advanced (6-8 weeks)
- [ ] FHIR Bulk Data export ($export)
- [ ] FHIR Subscriptions (claim status notifications)
- [ ] DRG representation (for NHI hospital funding)
- [ ] FHIR-to-DHIS2 adapter (public health reporting)
- [ ] Publish SA FHIR Implementation Guide (StructureDefinitions on Simplifier.net)

### Competitive Moat

Publishing the **first SA FHIR Implementation Guide** gives VisioCorp:
1. **De facto standard** — Other vendors implement YOUR profiles
2. **NHI alignment** — When NHI specifies FHIR, they'll reference existing work
3. **Ecosystem control** — Terminology server becomes the reference for SA codes in FHIR
4. **Consulting revenue** — Help schemes, administrators, PMS vendors adopt YOUR profiles
5. **CMS/NDoH partnership** — Offer the IG to government as a public good (builds goodwill + influence)

### Key Risks

| Risk | Mitigation |
|------|-----------|
| NHI delays (ConCourt, political) | Build for private scheme FHIR adoption first — NHI is bonus |
| Switches don't adopt FHIR | Bridge model means you're valuable either way |
| HAPI/Medplum operational complexity | Start with hosted Medplum; migrate if needed |
| SA CodeSystems not officially published | Define them yourself; seek NDoH endorsement later |
| POPIA compliance of FHIR data | Consent resource + audit logging + encryption |

---

## APPENDIX A: KEY URLS & REFERENCES

| Resource | URL |
|----------|-----|
| HL7 FHIR R4 Spec | https://hl7.org/fhir/R4/ |
| FHIR Registry (IGs) | https://registry.fhir.org |
| SMART on FHIR | https://smarthealthit.org |
| OpenHIE | https://ohie.org |
| OpenHIM | https://openhim.org |
| Jembi Health Systems | https://jembi.org |
| HAPI FHIR (Java) | https://hapifhir.io |
| Medplum (TypeScript) | https://medplum.com |
| DHIS2 | https://dhis2.org |
| DHIS2 FHIR Adapter | https://docs.dhis2.org/en/develop/using-the-api/dhis-core-version-master/fhir.html |
| Simplifier.net (IG publishing) | https://simplifier.net |
| US Core IG (reference) | https://hl7.org/fhir/us/core |
| AU Base IG (reference) | https://hl7.org.au/fhir/core |
| FHIR Bulk Data | https://hl7.org/fhir/uv/bulkdata |
| FHIR Subscriptions Backport | https://hl7.org/fhir/uv/subscriptions-backport |
| Health4Afrika | https://health4afrika.eu (archived) |
| NDoH (SA) | https://health.gov.za |
| CSIR | https://csir.co.za |
| CMS (Council for Medical Schemes) | https://medicalschemes.co.za |

## APPENDIX B: FHIR RESOURCE QUICK REFERENCE

| Resource | Create | Read | Search | Update | Delete |
|----------|--------|------|--------|--------|--------|
| Patient | POST /Patient | GET /Patient/[id] | GET /Patient?identifier=SAID\|8501015800086 | PUT /Patient/[id] | DELETE /Patient/[id] |
| Practitioner | POST /Practitioner | GET /Practitioner/[id] | GET /Practitioner?identifier=HPCSA\|MP0123456 | PUT /Practitioner/[id] | - |
| Organization | POST /Organization | GET /Organization/[id] | GET /Organization?identifier=BHF\|0012345 | PUT /Organization/[id] | - |
| Coverage | POST /Coverage | GET /Coverage/[id] | GET /Coverage?beneficiary=Patient/123 | PUT /Coverage/[id] | - |
| Claim | POST /Claim | GET /Claim/[id] | GET /Claim?patient=Patient/123&created=ge2026-01-01 | - | - |
| ClaimResponse | POST /ClaimResponse | GET /ClaimResponse/[id] | GET /ClaimResponse?request=Claim/456 | - | - |
| ExplanationOfBenefit | POST /EOB | GET /EOB/[id] | GET /EOB?patient=Patient/123 | - | - |
| Encounter | POST /Encounter | GET /Encounter/[id] | GET /Encounter?patient=Patient/123&type=IMP | PUT /Encounter/[id] | - |
| Condition | POST /Condition | GET /Condition/[id] | GET /Condition?patient=Patient/123&code=I10 | PUT /Condition/[id] | - |
| MedicationRequest | POST /MedicationRequest | GET /MR/[id] | GET /MR?patient=Patient/123&status=active | - | - |
| MedicationDispense | POST /MD | GET /MD/[id] | GET /MD?prescription=MR/789 | - | - |
| DiagnosticReport | POST /DR | GET /DR/[id] | GET /DR?patient=Patient/123&category=LAB | - | - |

---

*Last updated: 2026-03-21 | Next review: When NHI ConCourt ruling issued (May 2026)*
*Cross-references: 02_claims_adjudication.md (EDIFACT details), 03_coding_standards.md (ICD-10-ZA/CCSA/NAPPI), 05_scheme_profiles.md (switching routes), 09_industry_landscape.md (vendor landscape)*
