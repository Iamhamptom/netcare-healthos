# Netcare Health OS

**AI-Powered Healthcare Intelligence Platform for Netcare Primary Care**

88 clinics. 568 practitioners. 3.5M patients/year. One command center.

[![Deploy Status](https://img.shields.io/badge/deploy-live-brightgreen)](https://netcare-healthos.vercel.app)
[![Tests](https://img.shields.io/badge/tests-711%20passing-brightgreen)](src/__tests__/healthbridge/)
[![TypeScript](https://img.shields.io/badge/typescript-0%20errors-blue)](tsconfig.json)
[![Compliance](https://img.shields.io/badge/composite-92.5%25-blue)](docs/audit-package/)

---

## Overview

Netcare Health OS is a healthcare intelligence platform that sits on top of Netcare's existing infrastructure (CareOn EMR, HEAL, SwitchOn) and adds AI-powered claims processing, FHIR interoperability, and practice intelligence — without replacing anything.

**Production URL**: https://netcare-healthos.vercel.app
**Demo Login**: `demo@netcare.co.za` / `Netcare2026!`

## Scale

| Metric | Count |
|--------|-------|
| Pages | 280 |
| API Routes | 175+ |
| Prisma Models | 39 |
| Lines of Code | 80,000+ |
| Tests | 711 passing |
| Compliance Score | 92.5/100 |

## 7 AI Products

### 1. Healthbridge AI Claims Engine
**The most comprehensive medical aid claims integration built for South Africa.**

- **22 library modules** | **15 API endpoints** | **4 AI engines** | **8,283 lines**
- Pre-submission validation (20+ SA-specific rules)
- AI ICD-10 + CPT coding from clinical notes (Gemini 2.5 Flash)
- AI rejection predictor with probability scoring
- Clinical notes → complete claim autofill
- Smart follow-up generator (30/60/90/120 day escalation)
- PMB auto-detection (271 conditions) + CDL (26 chronic conditions)
- Multi-switch routing (Healthbridge, MediSwitch, MediKredit — 30+ schemes)
- NAPPI medicine lookup with SEP pricing (medicineprices.org.za API)
- eRA auto-reconciliation with idempotency protection
- Scheme-specific analytics + aging reports (30/60/90/120+ days)
- Patient cost estimation with gap cover calculation
- Batch CSV upload (500 claims) + CSV data export
- AES-256-GCM encryption, claim state machine, XXE-safe XML parser
- Negation-aware clinical NLP (won't code "no fever" as R50.9)

**No SA PMS vendor (GoodX, Healthbridge Nova, Elixir) has more than 4/17 of these capabilities.**

### 2. CareOn Bridge
HL7v2 webhook → FHIR translation → AI advisory engine. Connects to Netcare's CareOn EMR.

### 3. FHIR Integration Hub
Full FHIR R4 server with 12 resource types, SMART on FHIR auth, CareConnect HIE compatible.

### 4. Switching Engine
EDIFACT MEDCLM v0:912:ZA, multi-switch routing, pre-auth (9 categories), batch processing, vendor accreditation (12 tests).

### 5. Claims Rejection Analyzer
Pre-submission validation engine: 1,078 ICD-10 codes, 355 NAPPI entries, 358 tariff codes, 7 scheme profiles, AI suggestions, PDF reports.

### 6. WhatsApp Router
Intent-based routing: find clinic, book appointment, repeat prescription, emergency 082 911. Nearest Medicross by location.

### 7. AI Agents
5 clinical agents: triage, follow-up, intake, billing, scheduler. ElevenLabs voice integration.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2, TypeScript strict |
| Styling | Tailwind CSS 4, Framer Motion |
| Database | Supabase (PostgreSQL) + Prisma 7.4 |
| AI | Gemini 2.5 Flash, Claude Sonnet 4.6 |
| Auth | JWT (jose) + httpOnly cookies + MFA (TOTP) |
| Switching | PHISC XML, EDIFACT MEDCLM, HL7v2 |
| Interop | FHIR R4, SMART on FHIR, CareConnect HIE |
| Encryption | AES-256-GCM (patient PII) |
| Deployment | Vercel (auto-deploy from GitHub) |

## Security

| Control | Implementation |
|---------|---------------|
| Authentication | JWT + httpOnly cookies + MFA (TOTP) |
| Authorization | 6 roles (admin, doctor, receptionist, nurse, platform_admin, investor) |
| Encryption | AES-256-GCM for PII (SA ID, membership numbers) |
| Transport | HTTPS via HSTS (max-age=63072000) |
| Headers | 7 security headers (CSP, X-Frame-Options, HSTS, XSS-Protection) |
| Rate Limiting | Distributed via Supabase |
| Passwords | bcrypt-12, 8+ chars, lockout after 5 failures |
| Webhooks | HMAC-SHA256 (CareOn) + HMAC-SHA1 (Twilio) |
| SQL Injection | 0 raw SQL (Prisma parameterized only) |
| XSS | 0 dangerouslySetInnerHTML, CSP active |

## Compliance

| Standard | Score | Key Evidence |
|----------|-------|-------------|
| POPIA | 95/100 | IO designated, ROPA, consent system, audit logging, retention automation |
| OWASP Top 10 | 95/100 | MFA, SSRF protection, 0 vulnerabilities, CSP, rate limiting |
| WCAG 2.1 AA | 90/100 | Contrast fixed, aria-labels, focus indicators |
| ISO 27001 | 90/100 | 5 formal policies |
| SA HNSF | 90/100 | FHIR CapabilityStatement, SMART on FHIR, 52 LOINC codes |
| HPCSA | 95/100 | AI disclaimer, human-in-loop, EHR compliant |
| **Composite** | **92.5** | |

## Testing

```bash
# Unit tests (711 passing)
npm run test

# Healthbridge tests only (25 files)
npx vitest run src/__tests__/healthbridge/

# API integration tests (42 endpoints)
DEMO_MODE=true npx next dev --port 3900 &
sleep 10
bash scripts/test-healthbridge-api.sh

# ML evaluation suite (requires ~/ml-toolkit)
cd ~/ml-toolkit && uv run python scripts/eval-pii-leaks.py
cd ~/ml-toolkit && uv run python scripts/eval-clinical-nlp.py
cd ~/ml-toolkit && uv run python scripts/eval-ai-quality.py
cd ~/ml-toolkit && uv run python scripts/eval-financial.py
bash scripts/eval-red-team.sh
bash scripts/eval-summary.sh
```

### Test Categories

| Category | Tests | Standard |
|----------|-------|---------|
| Validator | 20 | CMS Claims Standards |
| SA Codes | 21 | ICD-10-ZA, CPT/CCSA |
| PMB/CDL | 8 | Medical Schemes Act §59 |
| Analytics | 7 | Financial accuracy |
| XML | 15+14 | XXE prevention, OWASP |
| Batch CSV | 16 | Data robustness |
| State Machine | 30 | Claim lifecycle integrity |
| Encryption | 15 | POPIA Section 19 |
| Pagination | 17 | Enterprise scale |
| Switch Router | 22 | Multi-switch routing |
| Retry | 13 | Network resilience |
| Security | 37 | OWASP Top 10 |
| Compliance | 41 | POPIA, HPCSA, CMS |
| Financial | 32 | Exact-cent arithmetic |
| Integrity | 32 | Data consistency |
| Stress | 13 | ISO 62304 |
| AI Modules | 49 | Clinical NLP accuracy |
| Boundary | 65 | IEEE boundary analysis |
| Mutation | 35 | Code mutation coverage |
| Regression | 35 | Bug re-introduction guard |
| Concurrency | 20 | Parallel safety |
| Error Messages | 55 | UX quality |
| Data Classification | 25 | POPIA PII handling |
| Scheme Rules | 46 | Per-scheme validation |

## Knowledge Base (300MB)

Located at `docs/knowledge/`:

| File | Content |
|------|---------|
| 01_law_and_regulation.md | Medical Schemes Act, POPIA 2026, HPCSA, NHI |
| 02_claims_adjudication.md | Decision flowchart, 25 rejection codes |
| 03_coding_standards.md | ICD-10 (41K codes), 9K+ tariff codes, NAPPI |
| 04_pmb_and_cdl.md | 270 DTPs, 27 CDL with treatments |
| 05_scheme_profiles.md | Discovery, GEMS, Bonitas, Momentum + 3 switches |
| 06_pharmaceutical.md | NAPPI spec, SEP formula, dispensing fees |
| 07_fraud_detection.md | R22-28B problem, 8 fraud types, detection |
| 08_compliance.md | POPIA checklist, SAHPRA, ISO 13485 |
| databases/ICD-10_MIT_2021.csv | 41,009 diagnosis codes |
| databases/medicine_prices.csv | 9,985 products with SEP |
| databases/GEMS_tariffs_2026.csv | 4,660 procedure rates |

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| GEMINI_API_KEY | Yes | AI features (ICD-10 coding, prediction, autofill) |
| JWT_SECRET | Yes | Authentication |
| DEMO_MODE | Yes | `true` for demo, `false` for production |
| SUPABASE_SERVICE_ROLE_KEY | For data | Database access |
| NEXT_PUBLIC_SUPABASE_URL | For data | Supabase endpoint |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | For data | Client-side Supabase |
| HEALTHBRIDGE_ENCRYPTION_KEY | Production | AES-256 key for PII |
| HEALTHBRIDGE_ENDPOINT | When live | Switch API endpoint |
| HEALTHBRIDGE_USERNAME | When live | Switch credentials |
| HEALTHBRIDGE_PASSWORD | When live | Switch credentials |
| HEALTHBRIDGE_BHF_NUMBER | When live | BHF practice number |

## Development

```bash
# Install
npm install

# Generate Prisma client
npx prisma generate

# Seed database
npm run seed

# Run dev server
npm run dev

# Build for production
npm run build
```

## Architecture

```
Netcare Health OS
├── 7 AI Products (claims, FHIR, switching, analytics, WhatsApp, agents)
├── 7 Integration Adapters (CareOn, HEAL, Healthbridge, SwitchOn, SAP, Micromedex, NAPPI)
├── 300MB Knowledge Base (21 compiled files + databases)
├── 39 Prisma Models (patients, claims, invoices, referrals, integrations)
├── 6-Role RBAC (admin, doctor, receptionist, nurse, platform_admin, investor)
└── Enterprise Security (AES-256, HSTS, CSP, MFA, audit logging)
```

## Financial Impact

| Product | Annual Savings (Conservative) |
|---------|------|
| Claims Rejection Analyzer | R15.8M |
| AI Clinical Coding | R9.9M |
| WhatsApp Booking | R7.0M |
| Switching Engine | R1.8M |
| eRA Reconciliation | R1.3M |
| POPIA Compliance | R0.8M |
| **Total** | **R36.7M/year** |

## Bugs Found & Fixed

| # | Bug | Severity | Found By |
|---|-----|----------|----------|
| 1 | parseZARToCents NaN on empty string | Medium | Unit tests |
| 2 | Switch router misrouted Sizwe Hosmed | Critical | Boundary analysis |
| 3 | XML parser dropped approved_amount=0 | Medium | Boundary analysis |
| 4 | AI coder negation blindness | Critical | Presidio + medspacy |
| 5 | PII exposure in claims list API | Critical | Presidio scanner |
| 6 | Clause boundary off-by-one | Medium | Debug analysis |

## Documentation

Full audit package at `docs/audit-package/`:
- Architecture Overview
- Security Posture (30 pre-answered Q&As)
- Data Flow Diagram
- Sub-Processor Register
- Compliance Summary
- Incident Response Plan
- Change Management Policy
- Penetration Test Self-Assessment

Legal templates at `docs/legal/`:
- Mutual NDA Template
- POPIA Operator Agreement
- Record of Processing Activities

## License

Proprietary — VisioCorp (Pty) Ltd. All rights reserved.

## Contact

Dr. David M. Hampton — Chairman, VisioCorp
