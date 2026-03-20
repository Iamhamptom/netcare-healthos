# Netcare Health OS — Integration Master Context
## For All Terminal Agents (Updated: 2026-03-20)

---

## WHAT WE'RE BUILDING

A healthcare platform (Next.js 16, Supabase, Vercel) that sits as an **intelligence layer on top of Netcare's existing systems**. We don't replace anything — we connect everything.

**Production URL**: https://netcare-healthos.vercel.app
**Local**: `/Users/hga/netcare-healthos`
**Supabase**: `xquzbgaenmohruluyhgv` (eu-west-1)

---

## ARCHITECTURE — DATA SOURCE ADAPTER PATTERN

All data flows through a **pluggable adapter layer** at `src/lib/data-sources/`:

```
src/lib/data-sources/
├── types.ts          — Shared TypeScript interfaces (DO NOT MODIFY without coordinating)
├── index.ts          — Factory: getNetworkSource(), getSavingsSource(), etc.
├── supabase-source.ts — Default: reads from seeded Supabase tables
└── netcare.ts        — STUB: NetcareApiDataSource (delegates to all adapters)
```

**How it works**: Every API route calls `getXxxSource()` which returns either:
- `SupabaseDataSource` (default — reads from `ho_*` tables)
- `NetcareApiDataSource` (when `NETCARE_API_MODE=live` — calls real Netcare APIs)

**Your adapter** should be a class that implements the relevant interface from `types.ts` and gets called by `NetcareApiDataSource`.

---

## SUPABASE TABLE MAP (src/lib/supabase.ts)

All tables use `ho_` prefix. New tables created by migration at `scripts/migration-network-tables.sql`:

```
ho_clinics              — 40 real Medicross locations (geocoded)
ho_clinic_metrics       — Monthly KPIs per clinic (revenue, claims, rejections, savings)
ho_clinic_directory     — Services, hours, WhatsApp routing per clinic
ho_medical_scheme_metrics — Discovery, GEMS, Bonitas, etc.
ho_rejection_codes      — Top rejection reasons with AI recommendations
ho_division_kpis        — Division-level KPIs
ho_icd10_codes          — ICD-10-ZA database (needs 20K+ codes imported)
ho_integration_status   — Connection status for each external system
```

Existing tables: ho_patients, ho_bookings, ho_invoices, ho_payments, ho_consent_records, ho_audit_logs, etc.

---

## API ROUTES (existing)

```
/api/network?tab=kpis|clinics|schemes|rejections  — Network Command Center
/api/savings?clinic_id=                           — Savings calculator
/api/bridge                                       — Integration status
/api/whatsapp/directory?lat=&lng=&service=        — Clinic finder
/api/icd10?q=&code=&limit=                        — ICD-10 search + validation
/api/invoices                                     — Invoice CRUD
/api/webhook/whatsapp                             — Twilio WhatsApp webhook
/api/agents/triage|followup|intake                — AI agents
```

All routes use `guardRoute()` or `guardPlatformAdmin()` from `src/lib/api-helpers.ts`.

---

## NETCARE'S SYSTEMS YOU'RE INTEGRATING WITH

| System | Owner | Protocol | What It Does |
|--------|-------|----------|-------------|
| **CareOn EMR** | Deutsche Telekom (iMedOne) | HL7, FHIR, IHE | Hospital clinical records, 34K users, 13K iPads |
| **HEAL** | A2D24 / Netcare Digital | Unknown (proprietary) | Medicross primary care EMR |
| **SwitchOn** | Altron HealthTech | PHISC EDIFACT, proprietary API | Claims switch, 99.8M tx/yr, R5.90/claim |
| **Healthbridge** | Tradebridge | Published integration specs | PMS + claims switch, 7K practices |
| **SAP** | SAP SE | RFC/BAPI, OData | Finance, billing, procurement, HR |
| **Micromedex** | Merative (ex-IBM Watson) | REST API, embedded | Drug interactions, 4.5M drug pairs |
| **MediKredit** | Universal Healthcare/BHF | Proprietary | NAPPI database (300K+ products), pharmacy switching |

---

## SHARED INTERFACES (src/lib/data-sources/types.ts)

Every adapter must implement one or more of:

```typescript
NetworkDataSource    — getDivisionKPIs(), getClinicPerformance(), getMedicalSchemeMetrics(), getTopRejections()
SavingsDataSource    — getMonthlySavings()
ClaimsDataSource     — searchICD10(), validateICD10()
BridgeDataSource     — getIntegrationStatus()
WhatsAppDataSource   — getClinicDirectory(), findNearestClinic()
```

---

## CODING CONVENTIONS

- Next.js 16 (async searchParams, `proxy.ts` not `middleware.ts`)
- TypeScript strict
- Supabase with `ho_` prefix for all tables
- `camelCase` in app code, `snake_case` in Supabase columns
- Helper functions `toCamel()` / `toSnake()` in `src/lib/db.ts`
- Rate limiting via `guardRoute()` on all API routes
- Demo mode: `DEMO_MODE=true` uses in-memory data for patient/booking/invoice routes
- Integration adapters should fail gracefully with circuit breaker → fallback to cached Supabase data

---

## MASTER TASK TRACKER

Report completions to the master terminal (this file's author). Tasks:

| # | Task | Assigned To | Blocked By |
|---|------|-------------|------------|
| 1 | Supabase migration (8 tables) | — | — |
| 2 | Seed clinics + metrics | — | #1 |
| 3 | Import ICD-10-ZA (20K codes) | — | #1 |
| 4 | WhatsApp end-to-end | — | #2 |
| 5 | Healthbridge adapter | — | — |
| 6 | SwitchOn adapter | — | — |
| 7 | eRA reconciliation | — | #6 |
| 8 | CareOn adapter (HL7/FHIR) | — | — |
| 9 | HEAL bridge | — | — |
| 10 | SAP connector | — | — |
| 11 | Micromedex integration | — | — |
| 12 | NAPPI sync | — | — |
| 13 | Master integration switcher | — | #5,6,8,9,10 |
| 14 | WhatsApp page refactor | — | #2,4 |
| 15 | Bridge page refactor | — | #2 |
| 16 | Deploy + verify | — | #2,3,4 |

---

## COORDINATION RULES

1. **DO NOT modify `src/lib/data-sources/types.ts`** without telling the master terminal — all adapters depend on these interfaces
2. **DO NOT modify existing API routes** — add new routes or extend via the adapter pattern
3. **Place your adapter** in `src/lib/integrations/<system-name>/` (e.g., `src/lib/integrations/switchon/`)
4. **Export a class** that can be instantiated by `NetcareApiDataSource`
5. **Update `ho_integration_status`** table when your adapter connects/disconnects
6. **Log to console** with prefix `[your-system]` (e.g., `[switchon] Claim submitted: ...`)
7. **When done**, tell master terminal: "Task #X complete" with a summary of what was built
