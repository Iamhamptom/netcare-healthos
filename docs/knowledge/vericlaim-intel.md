# VeriClaim (MediCharge) — Competitive & Partnership Intelligence

> Last updated: 2026-03-26
> Source: Deep web research, HTTP header analysis, BUI/Microsoft case study, LinkedIn, app stores
> Status: **Next targeted partnership**

## Company Overview

| Field | Detail |
|-------|--------|
| **Legal entity** | MediCharge (Pty) Ltd |
| **Trading as** | VeriClaim |
| **Parent** | SpesNet Global Group |
| **HQ** | Crossway Office Park, Building 2, 240 Lenchen Avenue, Centurion 0157, Gauteng |
| **Founded** | 2007 (dev start), 2009 (market launch) |
| **Employees** | 50-200+ (~12 devs) |
| **Revenue** | Est. R10-25M/year |
| **B-BBEE** | Level 2 (via SpesNet) |
| **Market** | SA's largest specialist billing bureau + PMS |
| **Installed base** | ~1,500 specialist practices |
| **Phone** | 086 183 7425 / 012 683 0360 |
| **Email** | info@vericlaim.co.za / info@medicharge.co.za |
| **Website** | vericlaim.co.za (portal), e.vericlaim.co.za (marketing), medicharge.co.za (corporate) |

## Key Contacts

| Name | Role | Notes |
|------|------|-------|
| **Mark Howell** | Managing Director | Business decision-maker |
| **Brian Bear** | Head of Development | Technical decision-maker, led Azure migration, Masters IT from UP |
| **JP Veldtman** | Team Lead, Software Dev | Day-to-day dev leadership |
| **Heinrich Bohmer** | Technical Lead / Senior Dev | BCom Informatics UP, previously Fujitsu/DSV |
| **Thando Kaptein** | Sales Consultant | Entry point for partnership conversations |

## Technology Stack (CONFIRMED)

| Layer | Technology | Status |
|-------|-----------|--------|
| **Language** | C# | Confirmed via ASP.NET + Evolve Medical statements |
| **Framework** | ASP.NET MVC 5.2 / .NET Framework 4.0.30319 | Legacy — not .NET Core/6+ |
| **Frontend** | AngularJS 1.x + jQuery | AngularJS EOL since Dec 2021 |
| **Database** | SQL Server (~14TB, BLOBs in DB) | On-premise, partial Azure DR |
| **Web Server** | IIS 10.0 / Windows Server | Traditional hosting |
| **Hosting** | On-premise at Stem-Connect-Pretoria ISP (IP: 41.180.40.171) | Not cloud-native |
| **Cloud** | Azure (DR + Blob Storage only) | Partial migration via BUI (2021-2023) |
| **Mobile** | Likely Xamarin/MAUI (com.Medicharge.VericlaimX) | iOS 13+ / Android 7+ |
| **SSL** | Sectigo RSA DV, TLS 1.3 | Standard |
| **DNS** | Amazon Route 53 | DNS only |
| **AI/ML** | **NONE at VeriClaim level** | Rules engine only. SpesNet has ML at funder level |
| **API** | **No public API** | No developer ecosystem |
| **Interoperability** | Proprietary MediSwitch EDI only | No FHIR, no HL7 |
| **Security certs** | None found (no ISO 27001, no SOC2) | Basic POPIA compliance |
| **MFA** | Not detected | Username/password only |

## Core Product — VeriClaim PMS

### Modules
1. Electronic Diary (central hub)
2. Patient Database (Medical/Private/IOD/Insurance patient types)
3. Billing Engine (in-hospital + out-of-hospital, modifiers, assistant surgeon)
4. Clinical Rules Engine (gender validation, code combos, modifiers)
5. ICD-10 Search Engine
6. RPL (procedure code) Search Engine
7. NAPPI Lookup
8. Clinical Notes (templates: prescriptions, referrals, sick notes, reports)
9. Document Upload (images, x-rays)
10. Batch Mailing & SMS
11. Reporting (PDF/Excel export)
12. Funder Database (medical scheme info)
13. Pro Forma / Quoting
14. Discovery Virtual Claims (real-time pre-submission quoting)
15. Lab Integration (Ampath, Lancet, PathCare — electronic ordering + results)
16. Nexion Payment Processing (card payments from within billing)
17. LogBox (patient demographics + digital consent)
18. User Access Management (role-based, audit trails)
19. Word Add-in (ICD-10 search in clinical notes)

### Discovery Virtual Claims (Key Feature)
- Real-time simulated claim submission to Discovery before actual claim
- Returns per-line payment breakdown (provider amount, patient liable, rejection reasons)
- NOT a guarantee of payment, does NOT reserve funds
- Unique enquiry number per submission
- Pro Forma → Virtual Claim check → Convert to Invoice workflow
- Only works for Discovery and Discovery-administered schemes

## Bureau Services (VBS)

- "SA's largest Specialist Bureau"
- Outsourced billing and administration
- Trained professionals managing claim submissions
- Outstanding debtor tracking and recovery
- Complete practice assessments (HR, workflow, accounting)
- Removes need for in-house billing staff
- **Flourish SA** is a reseller/partner using VeriClaim exclusively

## Integration Partners

| Partner | Function |
|---------|----------|
| MediSwitch / Altron SwitchOn | Claims switching (real-time submission + ERA) |
| Discovery Health | Virtual Claims (direct API integration) |
| Ampath | Lab ordering + results (bidirectional) |
| Lancet Laboratories | Lab ordering + results (bidirectional) |
| PathCare | Lab results (one-way) |
| Nexion | Payment processing (card terminal replacement) |
| LogBox | Patient demographics + POPI consent |
| SpesNet | Clinical coding support + claims escalation |

## SpesNet Group Structure

| Company | Product | Notes |
|---------|---------|-------|
| MediCharge | VeriClaim | Specialist billing (this report) |
| Evolve Medical | Evolve Hospital | Hospital management (C#/.NET + SAP Business One/HANA) |
| ProfNet Medical | EZMed | GP/Allied billing (cloud-based) |
| SpesNet | Funder Management | ML/Risk Engine for insurers |
| DUXAH | DUX Academy | Healthcare training (30+ courses) |
| Tech4Group | Tech4Green | Healthcare risk waste management |

## Technical Debt (Vulnerabilities for Partnership Pitch)

1. **AngularJS 1.x** — end-of-life Dec 2021, no security patches, no new features
2. **.NET Framework 4.x** — legacy, Microsoft pushing .NET 8+
3. **14TB monolithic SQL Server** — BLOBs stored in DB (recently offloaded to Azure Blob)
4. **On-premise hosting** at SA ISP — not cloud-native, single point of failure
5. **No FHIR/HL7** — proprietary integrations only, not NHI-ready
6. **No public API** — can't build an ecosystem around it
7. **10-12 person dev team** — too lean to modernize + maintain simultaneously
8. **Marketing site last updated 2017** — brand/marketing neglect
9. **No AI/ML** — rules engine only, no predictive capabilities
10. **No MFA** — security gap for healthcare data

## What We Offer That VeriClaim Cannot

| Capability | VeriClaim | Health OS |
|-----------|-----------|-----------|
| AI claims pre-validation | ✗ | ✓ |
| WhatsApp patient routing | ✗ | ✓ |
| FHIR R4 interoperability | ✗ | ✓ (FHIR Hub) |
| GP referral tracking | ✗ | ✓ |
| Practice analytics dashboard | ✗ | ✓ (real-time) |
| Multi-location ops view | ✗ | ✓ |
| POPIA automation | ✗ (basic LogBox) | ✓ (full s18-s72) |
| Patient recall AI | ✗ | ✓ |
| Pre-auth automation | ✗ (manual Virtual Claims) | ✓ (AI-driven) |
| Modern tech stack | ✗ (AngularJS/.NET 4) | ✓ (Next.js 16/React 19) |
| NHI readiness | ✗ | ✓ (FHIR/HL7) |

## Partnership Strategy

### Pitch Angle
"We're the AI intelligence layer VeriClaim can't build fast enough. 1,500 specialist practices × our AI = massive value for both companies."

### Value to VeriClaim
1. Adds AI capabilities without rebuilding their stack
2. Makes their platform NHI-ready via FHIR Hub
3. Modernizes their offering without dev team distraction
4. Increases client stickiness (AI features lock-in)
5. Revenue share on AI module upsells to existing 1,500 practices

### Value to Us
1. Instant distribution to 1,500 specialist practices
2. Deep specialist billing data for ML training
3. MediSwitch integration via their existing connection
4. Discovery Virtual Claims data for pre-auth automation
5. SpesNet Group relationship (funder-level ML + training academy)

### Entry Points
1. **Brian Bear** (Head of Dev) — technical partnership conversation, he led Azure migration and understands modernization needs
2. **Mark Howell** (MD) — business/commercial partnership
3. **Thando Kaptein** (Sales) — warm intro route
4. **Flourish SA** — bureau partner, could be a pilot site

### Proposed Partnership Phases
- **Phase 1**: API integration — Health OS reads VeriClaim claims data, provides AI pre-validation layer
- **Phase 2**: Embedded AI modules — VeriClaim practices access Health OS dashboard alongside VeriClaim
- **Phase 3**: White-label — VeriClaim offers "VeriClaim AI" powered by Health OS
- **Phase 4**: SpesNet Group deal — extend to Evolve Hospital + EZMed

---

*This intelligence is for internal strategic use only. Do not share with VeriClaim until partnership discussions begin.*
