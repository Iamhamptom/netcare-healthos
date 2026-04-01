# Netcare Health OS — Complete Platform Knowledge
## For SDK Agent, RAG, and AI Assistant Context

This document is the master reference for the AI assistant. It knows EVERY product, EVERY page, EVERY tool, EVERY API in the VisioCorp Health Suite.

---

## THE ECOSYSTEM (5 Products, All Live)

### 1. NETCARE HEALTH OS (Main Platform)
- **URL**: https://healthos.visiocorp.co
- **What it is**: The central AI healthcare operating system. Claims intelligence, clinical coding, patient management, engagement, and 30+ AI tools.
- **Scale**: 110 dashboard pages, 243 API routes, 56 Prisma models, 8 AI agents, 60 agent tools

**Dashboard Pages (by section):**

CLAIMS AI:
- /dashboard/claims — Claims Rejection Analyzer. Upload CSV, 13 rules validate, auto-fix, PMB/CDL detection. The money tool.
- /dashboard/claims-chat — Chat with Claims AI. Ask questions about claims, codes, schemes.
- /dashboard/claims-copilot — Claims Copilot. "What ICD-10 code for diabetes?" Instant expert answers with RAG.
- /dashboard/claims-review — Human-in-the-loop approval before EDIFACT submission.
- /dashboard/claims-network — Network-wide claims analytics across 88 clinics.

AI PRODUCTS:
- /dashboard/bridge — CareOn Bridge. HL7v2 → FHIR R4 translation from Netcare hospitals. Drug interaction alerts.
- /dashboard/bridge/careon — Live CareOn console showing HL7 messages flowing.
- /dashboard/bridge/roi — ROI Calculator. R139M/yr value from CareOn data.
- /dashboard/bridge/research — VRL-001 research paper on CareOn Bridge.
- /dashboard/whatsapp — WhatsApp Router. Patient booking, clinic finder, NLP intent parsing.
- /dashboard/agents — AI Agents management page.
- /dashboard/fhir-hub — FHIR R4 Integration Hub. 12 resource types, SMART on FHIR, CareConnect HIE.
- /dashboard/switching — Claims Switching Engine. EDIFACT MEDCLM, 3 switches, 30+ schemes, circuit breaker.

OPERATIONS:
- /dashboard/intake — Clinical Intake. Text/photo/voice → AI SOAP → ICD-10 → claim draft.
- /dashboard/scribe — AI Medical Scribe. Ambient recording → live transcription → SOAP notes → ICD-10 codes.
- /dashboard/daily — Daily Tasks. Morning/during/end-of-day checklists with KPI briefing.
- /dashboard/patients — Patient Records. Full CRUD. Allergies, medications, vitals, records.
- /dashboard/billing — Billing & Invoicing. Create invoices, Yoco payments, medical aid tracking.
- /dashboard/bookings — Bookings. Create, confirm, cancel appointments.
- /dashboard/checkin — Check-in Queue. Kanban: waiting → with doctor → checked out.
- /dashboard/calendar — Schedule view.
- /dashboard/referrals — Referral management (inbound).
- /dashboard/recall — Patient Recall. Mark overdue patients, send reminders via Resend email.
- /dashboard/documents — Document Generator. AI generates referral letters, prescriptions, sick notes, SARAA motivations.
- /dashboard/notifications — Notification centre.
- /dashboard/reports — Reports hub.
- /dashboard/reviews — Patient reviews.

HEALTHBRIDGE (Claims Engine):
- /dashboard/healthbridge — Healthbridge Claims Dashboard. The main claims hub.
- /dashboard/healthbridge/ai-coder — AI ICD-10 + CPT Coder. Paste notes → get codes with PMB/CDL flags.
- /dashboard/healthbridge/submit — Submit claims to switch.
- /dashboard/healthbridge/eligibility — Medical aid eligibility check.
- /dashboard/healthbridge/analytics — Scheme analytics and rejection patterns.
- /dashboard/healthbridge/batch — Batch CSV upload (up to 500 claims).
- /dashboard/healthbridge/nappi — NAPPI medicine code lookup.
- /dashboard/healthbridge/followups — Follow-up management.
- /dashboard/healthbridge/export — Data export.

ENGAGEMENT:
- /dashboard/engagement — Patient Engagement Hub. KPIs, channel volumes, quick links.
- /dashboard/engagement/campaigns — Campaign builder. Target patients by age, gender, condition, scheme.
- /dashboard/engagement/sequences — Build automated patient journeys (medication reminders, chronic care, post-surgical).
- /dashboard/engagement/chronic — Chronic Care Gaps. Diabetes/hypertension/screening overdue patients.
- /dashboard/engagement/population — Population Health. Demographics, disease burden, NHI readiness.
- /dashboard/engagement/inbox — AI Email Inbox. Triaged inbound emails with priority and patient matching.

BUSINESS:
- /dashboard/executive — Executive Dashboard. R662M revenue, R54.2M recoverable, clinic P&L, 3-year ROI. Built for Sara Nayager.
- /dashboard/financial-director — Financial Director View. EBITDA impact model, investment vs return, risk mitigation. Built for Thirushen Pillay.
- /dashboard/cio — CIO Dashboard. CareOn Bridge detail, R449M digital dividend, zero disruption matrix. Built for Travis Dewing.
- /dashboard/business-development — Business Development. Cancer Care, Hospital, Mental Health, Pharmacy expansion. Built for Dr. Chris Mathew.
- /dashboard/clinical-quality — Clinical Quality Intelligence. 10 practitioner scorecards, drug interactions, CDL compliance. Built for Dr. Cathelijn.
- /dashboard/architecture — Technical Architecture. Tech stack, data flow, API surface, security, integration adapters. Built for Muhammad Simjee.
- /dashboard/ai-governance — AI Governance & Compliance. 5-tier framework, certifications, SAHPRA, POPIA, King V, risk matrix. Built for Gurshen.
- /dashboard/resources — Resources & Research Library. 25 documents, 15 benchmarks, 10 competitive stickers.
- /dashboard/product-map — Product Map & Value Chain. 8-phase value chain, product suite, ROI flow, data flow.
- /dashboard/integration-map — Integration Map. 13-step claims chain, 10 AI agents, product ecosystem.
- /dashboard/pitch — Interactive Pitch Deck. 10 slides, arrow key navigation, per-stakeholder highlighting.
- /dashboard/partnership — Partnership page.
- /dashboard/pilot — Pilot programme tracker.
- /dashboard/board-pack — Board pack generator.
- /dashboard/home — Home Screen. 6 tool cards + 6 staff modes + 8 engines + 3 standalone products.

INTELLIGENCE:
- /dashboard/network — Network Command Centre. 88 clinics at a glance.
- /dashboard/kpi — KPI Dashboard.
- /dashboard/analytics — Practice analytics.
- /dashboard/insights — Practice insights.
- /dashboard/performance — Performance tracking.
- /dashboard/intel — Visio Intel terminal.
- /dashboard/benchmarks — Industry benchmarks.
- /dashboard/assistant — Full AI Assistant. 30+ tools, voice, thread memory, RAG.

FRONT DESK MODULE:
- /dashboard/front-desk — Front Desk module with check-in, eligibility, engagement.
- /dashboard/front-desk/connections — Integration connection status.
- /dashboard/front-desk/engagement — Patient engagement enrollments.

SETTINGS:
- /dashboard/settings — Practice settings.
- /dashboard/settings/microsoft — Microsoft 365 integration (calendar, OneDrive, Outlook, Teams).
- /dashboard/settings/security — Security settings.
- /dashboard/settings/team — Team management.

---

### 2. DOCTOR OS (Standalone)
- **URL**: https://doctor-os.vercel.app
- **What it is**: Doctor's consultation workflow — scribe to claim in one flow.
- **Pages**: Dashboard, Scribe, Coding, Claims, Documents, Billing, Queue, Patients, Chat, Exports, Integrations, Settings
- **Key feature**: AI scribe with live transcription → SOAP → ICD-10 coding → claim draft → document generation

### 3. VISIOCODE (Standalone)
- **URL**: https://visiocode.vercel.app
- **What it is**: AI Clinical Coding Platform. ICD-10 browser, tariff lookup, medicine search, scheme validation.
- **Database**: 61,366 records (41K ICD-10, 10K tariff, 10K medicines, 36 PMB DTPs, 27 CDL conditions, 6 scheme profiles)
- **Key feature**: 11-tool AI agent that looks up codes, checks PMB/CDL, validates against schemes, self-learns from corrections

### 4. PATIENT FLOW AI (Standalone)
- **URL**: https://patient-flow-ai.vercel.app
- **What it is**: No-show prediction, schedule optimization, flow board, wait time management.
- **Pages**: Dashboard, No-Show, Flow Board, Chat (FlowBot), Schedule, Waitlist, Analytics, Doctors, Reminders, Settings
- **Key feature**: 13-tool FlowBot agent. Dual prediction (Gemini AI + statistical model). Self-learning. 90% accuracy on first retrain.

### 5. HEALTHOPS PLATFORM (White-Label)
- **URL**: https://healthops-platform.vercel.app
- **What it is**: White-label practice management OS. Multi-tenant. POPIA consent. 5 AI agents.
- **Scale**: 83 pages, 134 APIs, 19 Prisma models

---

## AI AGENTS (12 Total Across All Products)

### Health OS Agents:
1. **Command Assistant** — 30+ tools, full platform access, voice I/O, thread memory
2. **Claims Copilot** — ICD-10, NAPPI, scheme rules, knowledge base search
3. **Claims Reviewer** — ToolLoopAgent, 7 tools, validates flagged claims
4. **Triage Agent** — Clinical urgency assessment
5. **Billing Agent** — Invoices, claims, payments, scheme validation
6. **Intake Analyzer** — Notes → SOAP → ICD-10 → claim draft
7. **Follow-up Agent** — Patient recall, appointment scheduling
8. **Scheduler Agent** — Booking optimization, calendar sync
9. **WhatsApp Agent** — Patient comms, booking via chat
10. **Engagement Agent** — 18 tools, 25 steps, sequences, campaigns, chronic care

### Patient Flow AI:
11. **FlowBot** — 13 tools, no-show prediction, flow board, schedule optimization

### VisioCode:
12. **Coding Agent** — 11 tools, ICD-10 lookup, scheme validation, self-learning

---

## KNOWLEDGE BASE (300MB)

- **41,009** ICD-10-ZA codes (SA WHO variant, NOT US ICD-10-CM)
- **487,086** NAPPI medicine records
- **10,304** GEMS 2026 tariff codes
- **189,000** RAG searchable chunks in Supabase pgvector
- **6 scheme profiles**: Discovery Health, GEMS, Bonitas, Medshield, Momentum, Bestmed
- **270 PMB DTPs** (Prescribed Minimum Benefits)
- **27 CDL conditions** (Chronic Disease List)
- **13 compiled knowledge files** (law, adjudication, coding, PMBs, schemes, pharma, fraud, compliance, industry, market, business, commercial, clinical)

---

## INTEGRATIONS (7 Adapters)

| System | Protocol | Status |
|--------|----------|--------|
| CareOn / iMedOne | HL7v2 MLLP | Live (passive listener) |
| HEAL EMR | REST API | Planned (awaiting A2D24 specs) |
| Healthbridge | XML / EDI | Live |
| SwitchOn (Altron) | EDIFACT MEDCLM | Live |
| MediKredit | HealthNet ST | Live |
| SAP Financials | OData | Planned |
| Micromedex | Drug interaction DB | Live |

---

## CERTIFICATIONS

| Certification | Status |
|--------------|--------|
| POPIA Health Data (6 March 2026) | Certified |
| HPCSA Booklet 20 AI Ethics | Certified (First in SA) |
| King V Principle 10 | Compliant |
| SAHPRA MD08-2025/2026 | Not SaMD |
| HNSF | Compliant |
| CareConnect HIE | Ready |
| ISO 27001 | In Progress (Q3 2026) |
| OWASP Top 10 | 95% |

---

## THE 13-STEP CLAIMS CHAIN

1. Voice/Text Notes → 2. AI SOAP → 3. ICD-10 Coding → 4. Save to Record → 5. Claims Validation → 6. Auto-Fix → 7. Human Approval → 8. EDIFACT → 9. Switch Submission → 10. eRA Reconciliation → 11. Rejection Analysis → 12. Auto-Resubmission → 13. Revenue Recovery Report

Nobody else in SA connects all 13 steps. Nora AI stops at step 2. Healthbridge stops at step 9.

---

## SECURITY

- PII auto-stripped before any AI processing (names → initials, IDs → redacted)
- Prompt injection detection (15 patterns, auto-block at ≥70% confidence)
- 5-tier rule precedence (SA law immutable, AI advisory only)
- 37 hard-gate codes AI can NEVER override
- AES-256-GCM encryption on SA IDs and membership numbers
- 7 security headers (HSTS, CSP, X-Frame DENY, etc.)
- Rate limiting on all 243+ endpoints
- AI decision audit logging to Supabase

---

## DEMO ACCOUNTS

All password: Netcare2026!

| Email | Person | Landing Page |
|-------|--------|-------------|
| sara.nayager@netcare.co.za | Sara Nayager (MD) | /dashboard/executive |
| drrahul.gathiram@medicross.co.za | Dr Rahul Gathiram | /dashboard/executive |
| cathelijn.zeijlemaker@netcare.co.za | Dr Cathelijn (Champion) | /dashboard/suite/dr-cathelijn |
| muhammad_simjee@a2d24.com | Muhammad Simjee (A2D24) | /dashboard/architecture |
| thirushen.pillay@netcare.co.za | Thirushen Pillay (FD) | /dashboard/financial-director |
| chris.mathew@netcare.co.za | Dr Chris Mathew (BD) | /dashboard/business-development |
| travis.dewing@netcare.co.za | Travis Dewing (CIO) | /dashboard/cio |
| gurshen@netcare.co.za | Gurshen (AI Committee) | /dashboard/ai-governance |
| matsie.mpshane@netcare.co.za | Matsie Mpshane (FD) | /dashboard/financial-director |
| demo@netcare.co.za | Demo User | /dashboard/home |
