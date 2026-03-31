# NETCARE HEALTH OS — QA HANDOVER FOR ANTIGRAVITY
**Production**: https://healthos.visiocorp.co
**Date**: 2026-03-31
**Last Deploy**: commit d0a4131
**PASSWORD FOR ALL ACCOUNTS**: `Netcare2026!`

---

## TEST 1: STAKEHOLDER LOGINS + ROUTING

Each person must land on THEIR page after login, not the generic dashboard.

| # | Email | Expected Landing Page |
|---|-------|----------------------|
| 1 | sara.nayager@netcare.co.za | /dashboard/executive |
| 2 | drrahul.gathiram@medicross.co.za | /dashboard/executive |
| 3 | cathelijn.zeijlemaker@netcare.co.za | /dashboard/suite/dr-cathelijn |
| 4 | muhammad_simjee@a2d24.com | /dashboard/architecture |
| 5 | thirushen.pillay@netcare.co.za | /dashboard/financial-director |
| 6 | chris.mathew@netcare.co.za | /dashboard/business-development |
| 7 | travis.dewing@netcare.co.za | /dashboard/cio |
| 8 | gurshen@netcare.co.za | /dashboard/ai-governance |
| 9 | matsie.mpshane@netcare.co.za | /dashboard/financial-director |
| 10 | demo@netcare.co.za | /dashboard (generic) |

For each: Login → verify URL matches expected → screenshot → logout → next

---

## TEST 2: STAKEHOLDER PAGES — VISUAL QA

For each page below, take screenshot and verify:
- Page loads without errors
- No broken layouts, missing icons, or console errors
- Data displays correctly (numbers, charts, tables)
- Tabs/navigation within the page all work
- Mobile responsive (test at 375px width)

### 2a. /dashboard/executive (Sara's view)
- [ ] R662M revenue stat visible
- [ ] R54.2M rejection cost card (red)
- [ ] R54.2M recoverable card (green)
- [ ] "The Bottom Line" dark banner with 8.2% callout
- [ ] Three tabs work: Financial Impact, Division Performance, Transformation ROI
- [ ] Clinic table shows 8 clinics with revenue, rejection %, trend arrows
- [ ] Strategy tab shows Year 1/2/3 cards with R13.5M/R38M/R54M+

### 2b. /dashboard/suite/dr-cathelijn (Deep Dive)
- [ ] 8 products listed with stats and demo links
- [ ] Each product card expands with description
- [ ] Links to actual product pages work

### 2c. /dashboard/clinical-quality (Clinical Quality)
- [ ] 10 practitioner scorecards visible
- [ ] Drug interaction alerts (4 alerts)
- [ ] CDL condition compliance table (9 conditions)

### 2d. /dashboard/architecture (Muhammad's view)
- [ ] Dark theme renders correctly
- [ ] 5 tabs work: Tech Stack, Data Flow, API Surface, Security & Compliance, Integration Adapters
- [ ] Tech stack shows 8 technologies
- [ ] Data flow shows 6-step pipeline with PII stripping callout
- [ ] API surface shows 53 total endpoints across 8 groups
- [ ] Security shows 6 compliance scores
- [ ] Integration adapters table shows 7 adapters (5 live, 2 planned)

### 2e. /dashboard/ai-governance (Gurshen's view)
- [ ] Dark theme renders
- [ ] 6 tabs work: 5-Tier Framework, Certifications, SAHPRA, POPIA, AI Risk Matrix, Audit Metrics
- [ ] Certifications tab: 7 Active + 2 In Progress + 92.5% composite
- [ ] 10 certification cards with badges (ACTIVE, FIRST IN SA, NOT SaMD, etc.)
- [ ] SAHPRA tab: big "NO" answer with reasoning table
- [ ] POPIA tab: 6 sections all marked "compliant"
- [ ] Risk matrix: 6 risks with likelihood/impact/mitigation/residual
- [ ] King V (NOT King IV) referenced throughout

### 2f. /dashboard/financial-director (Thirushen's view)
- [ ] 5 KPI cards at top (R662M, R82M EBITDA, R38.4M rejection, R54.2M recoverable, +66% uplift)
- [ ] 4 tabs: Cost of Inaction, Per-Clinic Economics, Investment Model, Risk Mitigation
- [ ] Investment table: Pilot (R0) → Year 1 (R2M→R13.5M) → Year 2 → Year 3
- [ ] "The Pilot is Free" green callout box
- [ ] Risk tab: 6 risks all rated low/very low residual

### 2g. /dashboard/cio (Travis's view)
- [ ] Dark theme
- [ ] "R256M becomes R449M" banner (+75%)
- [ ] 4 tabs: CareOn Bridge, Digital Dividend, Zero Disruption, Deployment Options
- [ ] CareOn tab: R82M investment stat, 34K users, 13K iPads
- [ ] HL7→FHIR translation table (4 mappings, all LIVE)
- [ ] Zero Disruption: 8 systems, ALL marked "None" for changes required
- [ ] Deployment options: 4 cards (Vercel, Azure JHB, AWS CPT, On-Premise)

### 2h. /dashboard/business-development (Dr. Chris's view)
- [ ] "R24.4B annual claims" banner
- [ ] 3 tabs: Division Deep Dive, Referral Network, Expansion Roadmap
- [ ] 4 divisions: Cancer Care, Hospitals, Mental Health, Pharmacy
- [ ] Each has claims volume, complexity, and 3 example validation scenarios
- [ ] Roadmap: Now (R54M) → Q3 (R12M) → Q4 (R45M) → 2027 (R180M+)

---

## TEST 3: AI CHAIN — 13 STEPS

Login as sara.nayager@netcare.co.za for all tests.

### 3a. AI ICD-10 Coding
- Navigate to /dashboard/healthbridge → AI Coder tab (or /dashboard/claims-copilot)
- Enter: "55yo male, Type 2 diabetes HbA1c 9.2%, peripheral neuropathy bilateral feet, BP 148/92, BMI 32"
- [ ] Response within 15 seconds
- [ ] Returns E11.40 (diabetes with neuropathy) — NOT generic E11.9
- [ ] Returns I10 (hypertension) with PMB + CDL flags
- [ ] Returns E66.0 (obesity) — BMI 32
- [ ] Model shows "claude-sonnet-4" (not "keyword-fallback")

### 3b. Claims Validation
- Navigate to /dashboard/claims
- Upload a CSV with these columns: patientName, patientGender, patientAge, icd10Code, cptCode, amount, quantity, medicalAidScheme, membershipNumber, bhfNumber
- Include a line: Male patient, age 25, icd10Code "Z32.1" (pregnancy confirmed)
- [ ] GENDER_MISMATCH error flagged (male + pregnancy code)
- [ ] PMB conditions detected for diabetes/hypertension codes
- [ ] Rejection risk shown per line

### 3c. Claims Copilot
- Navigate to /dashboard/claims-copilot
- Ask: "What ICD-10 code for lobar pneumonia?"
- [ ] Returns J18.1 or similar specific code
- [ ] Shows tools used (search_icd10, lookup_icd10, etc.)
- [ ] Provider shown (gemini or claude)

### 3d. CareOn Bridge
- Navigate to /dashboard/bridge
- [ ] Advisory cards load
- [ ] HL7→FHIR panel visible
- [ ] Integration status shows connected systems

### 3e. Documents + PDF
- Navigate to /dashboard/documents
- Select "Referral Letter"
- Fill in patient name, diagnosis (E11.9), referring doctor details
- Generate document
- [ ] Document generates with proper formatting
- [ ] If PDF export button exists, downloads valid PDF

### 3f. AI Assistant
- Navigate to /dashboard/assistant
- [ ] Shows "Claude + Gemini AI" (NOT "GPT-4 Integrated")
- [ ] Shows "Connected to 25 Endpoints"
- Ask: "What is the rejection rate for Discovery Health claims?"
- [ ] Gets meaningful response using tools

---

## TEST 4: CORE WORKFLOWS

### 4a. Check-in Queue (/dashboard/checkin)
- [ ] Kanban columns visible (Waiting, With Doctor, Checked Out)
- [ ] Can add a patient
- [ ] Can move patient between columns
- [ ] Wait time displays

### 4b. Patients (/dashboard/patients)
- [ ] Patient list loads
- [ ] Can search by name
- [ ] Can click into patient detail
- [ ] Allergies, medications, records tabs visible

### 4c. Bookings (/dashboard/bookings)
- [ ] Booking list loads
- [ ] Can create new booking
- [ ] Status filter works (all, pending, confirmed)

### 4d. Billing (/dashboard/billing)
- [ ] Invoice list loads
- [ ] Can create new invoice with line items
- [ ] Payment recording works

### 4e. Recall (/dashboard/recall)
- [ ] Recall items list loads
- [ ] Can add new recall item
- [ ] Can mark as contacted

### 4f. Daily Tasks (/dashboard/daily)
- [ ] Three columns: Morning, During Day, End of Day
- [ ] Can check off tasks
- [ ] Progress percentage updates

### 4g. Notifications (/dashboard/notifications)
- [ ] Notification list loads
- [ ] Read/unread filter works

---

## TEST 5: SECURITY CHECKS

### 5a. Rate Limiting
- Hit any API endpoint 35 times rapidly
- [ ] Should get 429 "Too many requests" after ~30 requests

### 5b. Auth Required
- Open incognito, go to /dashboard/claims
- [ ] Should redirect to /login (not show data)

### 5c. Security Headers
- Open browser dev tools → Network → check response headers on any page
- [ ] X-Frame-Options: DENY
- [ ] Strict-Transport-Security present
- [ ] Content-Security-Policy present
- [ ] X-Content-Type-Options: nosniff

### 5d. Demo Watermarks
- [ ] DEMO watermark visible on dashboard pages

---

## TEST 6: MOBILE RESPONSIVE

Test at 375px width (iPhone SE):
- [ ] /dashboard — cards stack vertically
- [ ] /dashboard/executive — stats readable, table scrolls horizontally
- [ ] /dashboard/architecture — tabs wrap, content readable
- [ ] Login page — form usable, brand panel hidden or stacked
- [ ] Sidebar — hamburger menu works

---

## TEST 7: PUBLIC PAGES

These should work WITHOUT login:
- [ ] https://healthos.visiocorp.co/ (landing page loads)
- [ ] https://healthos.visiocorp.co/about
- [ ] https://healthos.visiocorp.co/features
- [ ] https://healthos.visiocorp.co/pricing
- [ ] https://healthos.visiocorp.co/privacy
- [ ] https://healthos.visiocorp.co/terms
- [ ] https://healthos.visiocorp.co/research/claims-intelligence

---

## KNOWN ISSUES (NOT BUGS)

1. /api/scribe/transcribe returns 405 on GET — correct, it's POST-only (needs audio data)
2. /api/intake/save returns 500 with "demo-patient-1" — correct in demo mode, works with real patient IDs
3. /api/switching/edifact returns 405 on GET — POST-only, needs full claim object
4. WhatsApp/SMS notifications log but don't send — needs per-clinic Twilio configuration
5. Google Reviews integration stubbed — needs Google Business API key
6. Claims submission to real switches is demo mode — needs Healthbridge/SwitchOn credentials from Netcare

---

## CRITICAL FOR MEETING (April 1, 2026)

These MUST work flawlessly:
1. Sara login → executive dashboard with R54.2M story
2. Dr. Cathelijn login → deep dive page with 8 products
3. Claims Copilot → ask about ICD-10 codes → get correct answer
4. AI Coding → paste clinical notes → get ICD-10 with PMB/CDL flags
5. Claims upload → CSV validates → errors flagged → auto-fix suggested
6. AI Governance → certifications tab → 7 Active + King V + HPCSA Booklet 20
7. CIO page → "R256M becomes R449M" digital dividend story
8. Architecture page → tech stack + zero disruption matrix

**If ANY of these fail, flag immediately.**
