# CareOn/iMedOne Bridge — Product Documentation

## Overview

The CareOn Bridge is a read-only middleware layer that receives HL7v2 messages from Netcare's CareOn hospital EMR (Deutsche Telekom Clinical Solutions / iMedOne), parses clinical data, maps it to FHIR R4 resources, and generates AI-powered billing advisories using Gemini 2.5 Flash.

It does NOT write data back to CareOn. All output is advisory — recommendations for the billing team to review and act on.

**Production URL**: https://healthos.visiocorp.co  
**GitHub**: https://github.com/Iamhamptom/netcare-healthos  
**Status**: Production-ready (persistent Supabase storage, AI verified, 1,580 tests passing)

---

## Architecture

```
CareOn EMR (26 hospitals, 34,000 users, 13,000 iPads)
    │
    │ HL7v2 messages (ADT, ORU, ORM)
    │ HMAC-SHA256 / Bearer token auth
    ▼
┌─────────────────────────────────────────────┐
│  HL7v2 Parser (src/lib/hl7/parser.ts)       │
│  Extracts: Patient, Encounter, Observations,│
│  Diagnoses, Orders from raw pipe-delimited  │
│  HL7v2 messages                             │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│  FHIR R4 Mapper (src/lib/hl7/fhir-mapper)  │
│  Converts to: Patient, Encounter,           │
│  Observation, Condition resources           │
│  Standards: FHIR R4 4.0.1, ICD-10-ZA, LOINC│
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│  Advisory Engine (src/lib/careon-bridge.ts) │
│  Rule-based: billing, eligibility, clinical,│
│  compliance advisories                      │
│  AI-enhanced: Gemini 2.5 Flash for:        │
│    - ICD-10 code suggestions (missed codes) │
│    - Scheme-specific rejection prediction   │
│    - Lab trend analysis (chronic detection) │
│    - Natural language advisory generation   │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│  Supabase Persistent Storage                │
│  ho_bridge_advisories — advisory + resolution│
│  ho_bridge_messages — HL7 message log       │
│  ho_bridge_audit — POPIA 5-year retention   │
└─────────────────────────────────────────────┘
```

---

## Dashboard Pages

| Page | URL | Description |
|------|-----|-------------|
| Bridge Overview | `/dashboard/bridge` | Live integration status, before/after workflow, links to all sub-pages |
| Bridge Console | `/dashboard/bridge/careon` | Real-time message feed (8s simulation), advisory cards with 4 action buttons, facility status grid |
| ROI Calculator | `/dashboard/bridge/roi` | FY2025 actuals, 6 adjustable sliders, 5 revenue streams, pilot recommendation, PDF download |
| Research Paper | `/dashboard/bridge/research` | Visio Research Labs white paper — problem, architecture, AI, security, financial model |
| Business Model | `/dashboard/bridge/business-model` | 3 revenue layers (SaaS + revenue share + data intel), projections, GTM, competitive moat |
| System Health | `/dashboard/bridge/health` | SLA tracking, facility throughput bars, uptime/latency/error metrics, per-facility cards |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/bridge/careon?view=stats` | Session | Bridge statistics (facilities, messages, advisories, anomalies) |
| GET | `/api/bridge/careon?view=advisories` | Session | Advisories with de-identification per role |
| GET | `/api/bridge/careon?view=messages` | Session | HL7 message processing log |
| GET | `/api/bridge/careon?view=connection` | Session | 10 facility connection statuses |
| GET | `/api/bridge/careon?view=anomalies` | Session | Traffic volume anomaly detection |
| GET | `/api/bridge/careon?view=audit` | Session | POPIA audit trail |
| GET | `/api/bridge/careon?view=resolutions` | Session | Resolution action statistics |
| POST | `/api/bridge/careon` | HMAC/Bearer/Demo | HL7v2 webhook — receives messages, generates advisories |
| POST | `/api/bridge/careon?ai=true` | HMAC/Bearer/Demo | AI-enhanced webhook (Gemini ICD-10 coding + rejection prediction) |
| PATCH | `/api/bridge/careon` | Session | Resolve advisory (resolve/generate_claim/notify_doctor/dismiss) |
| GET | `/api/bridge/careon/simulate` | None | Generate simulated event for demo mode |
| POST | `/api/bridge/careon/generate-claim` | Session | Create Healthbridge claim draft from advisory |
| GET | `/api/bridge/careon/export-pdf` | Session | Download branded PDF executive summary |

---

## File Structure

```
src/lib/hl7/
├── types.ts          (205 lines)  — HL7v2, FHIR R4, advisory types
├── parser.ts         (182 lines)  — HL7v2 message parser (ADT, ORU, ORM)
├── fhir-mapper.ts    (142 lines)  — HL7v2 → FHIR R4 resource mapping
├── security.ts       (185 lines)  — HMAC, de-identification, audit, facility scoping
├── ai-advisor.ts     (361 lines)  — Gemini AI: coding, prediction, trends, NL
├── scheme-rules.ts   (124 lines)  — 34 rules from real KB data (5 schemes)
├── bridge-store.ts   (293 lines)  — Supabase persistent storage + in-memory fallback
├── demo-messages.ts  (213 lines)  — 5 realistic HL7 messages, 5 advisories, 10 facilities
├── demo-simulator.ts (212 lines)  — Live event generator (16 patients, 8 doctors, 12 diagnoses)
└── index.ts          (7 lines)    — Barrel export

src/lib/careon-bridge.ts (455 lines) — Orchestrator: processing, advisory gen, resolution, stats

src/app/api/bridge/careon/
├── route.ts               (215 lines) — GET/POST/PATCH main API
├── simulate/route.ts      (12 lines)  — Demo simulation endpoint
├── generate-claim/route.ts (120 lines) — Advisory → claim draft
└── export-pdf/route.ts    (94 lines)  — PDF report generator

src/app/dashboard/bridge/
├── page.tsx                 — Overview + live integration status
├── careon/page.tsx          — Bridge Console (live simulation)
├── roi/page.tsx             — ROI Calculator
├── research/page.tsx        — Research Paper
├── business-model/page.tsx  — Business Model
└── health/page.tsx          — System Health Monitor
```

---

## Testing

**243 bridge-specific tests** across 3 test files, mapped to international standards:

| File | Tests | Coverage |
|------|-------|----------|
| `hl7-bridge.test.ts` | 74 | Parser, mapper, security, bridge adapter, demo data |
| `hl7-bridge-standards.test.ts` | 104 | HL7v2.4, FHIR R4 4.0.1, SA HNSF, POPIA, OWASP |
| `hl7-bridge-clinical.test.ts` | 65 | Real ICD-10 codes, CDL/PMB, scheme rules, clinical scenarios, performance |

**10-round stress test**: 170/170 passing (17 endpoints × 10 rounds, 0 failures)

**Full project suite**: 1,580 tests passing, 0 failures

---

## Standards Compliance

| Standard | Implementation |
|----------|---------------|
| HL7v2.4 | Parser supports ADT^A01-A08, ORU^R01, ORM^O01, DFT^P03, SIU^S12, MDM^T02 |
| FHIR R4 4.0.1 | Patient, Encounter, Observation, Condition resources with correct value sets |
| ICD-10-ZA | SA Master Industry Table (41,008 codes), maximum specificity validation |
| LOINC | 8+ common lab codes detected and mapped to loinc.org system |
| POPIA | Role-based de-identification, HMAC auth, 5-year audit trail, facility scoping |
| OWASP Top 10 | HMAC-SHA256 timing-safe, injection handling, access control, auth validation |
| SA HNSF | ICD-10-ZA, NAPPI, CCSA tariff codes, CareConnect HIE compatible |
| Medical Schemes Act | PMB/CDL conditions, scheme-specific rules, 270 DTPs, 27 CDL conditions |

---

## Scheme Rules Database

Sourced from docs/knowledge/05_scheme_profiles.md (CMS data + scheme brochures):

| Scheme | Rules | Key Facts |
|--------|-------|-----------|
| Discovery | 9 | 78% auto-adjudication (FICO Blaze), KeyCare 31% rejection, clawback risk |
| Bonitas | 7 | Migrating to Momentum June 2026, 4 formulary tiers, CDL 61/28 per plan |
| GEMS | 7 | 9-digit membership, 60-day dispute, Ruby/Beryl PMB-only (28% rejection) |
| Momentum | 3 | PMB letter required, Ingwe network restriction |
| Medihelp | 1 | 4-month submission deadline |
| Bestmed | 2 | 21-day mental health inpatient limit |
| Universal | 4 | ICD-10 #1 cause (30%), PMB override, duplicate detection |

---

## Security

| Layer | Implementation |
|-------|---------------|
| Webhook Auth | HMAC-SHA256 (timing-safe) + Bearer token + demo mode bypass |
| Data De-identification | SA ID (850101****086), phone (+27***1234), name (J. v** d** M**), medical aid |
| Role-Based Access | platform_admin=full, doctor=full, admin=partial, receptionist=minimal, unknown=masked |
| Facility Scoping | Non-admin users restricted to assigned facility data |
| Audit Trail | Every view, action, and webhook logged with user/role/timestamp/detail |
| Rate Limiting | 120/min GET, 60/min write (Supabase-backed with in-memory fallback + 3s timeout) |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Gemini 2.5 Flash for AI features |
| `GOOGLE_API_KEY` | Yes | Same key (some SDKs use this name) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (prod) | Persistent storage. Falls back to in-memory without it |
| `CAREON_BRIDGE_TOKEN` | Recommended | Bearer token for webhook auth. If unset, DEMO_MODE allows all |
| `CAREON_HMAC_SECRET` | Recommended | HMAC-SHA256 secret for Deutsche Telekom integration |
| `DEMO_MODE` | Yes (demo) | Set "true" for demo credentials and simulation |

---

## Business Model

| Layer | Revenue | At Scale (88 clinics) |
|-------|---------|----------------------|
| SaaS | R2,500-8,500/clinic/month | R4.75M/year |
| Revenue Share | 15% recovery + 10% DRG + R500/CDL | R16.83M/year |
| Data Intelligence | Anonymized insights licensing | R2-10M/year |

**5-Year Projection**: R1.2M → R10.4M → R32.6M → R65M → R108M+

---

## Quick Start

```bash
# Clone
git clone https://github.com/Iamhamptom/netcare-healthos.git
cd netcare-healthos

# Install
npm install

# Set environment
cp .env.example .env
# Add: GEMINI_API_KEY, JWT_SECRET, DEMO_MODE=true

# Run
npm run dev

# Test
npx vitest run src/__tests__/hl7-bridge*.test.ts

# Login
# Email: sara.nayager@netcare.co.za
# Password: Netcare2026!
# Navigate to: /dashboard/bridge
```

---

*Built by VisioCorp / Visio Research Labs | March 2026*
*243 tests | 1,580 project tests | 0 failures | Production at healthos.visiocorp.co*
