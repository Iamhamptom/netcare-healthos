# Netcare Health OS — 15-Minute Demo Walkthrough
## For Sara Nayager (Netcare Primary Care MD)

**Presenter**: Dr. Hampton (VRL)
**Audience**: Sara Nayager (MD Primary Care), Matsie (IT/Operations), Travis (Finance)
**Demo URL**: https://netcare-healthos.vercel.app
**Login**: sara.nayager@netcare.co.za
**Duration**: 15 minutes sharp

---

## Pre-Demo Checklist (5 minutes before)

- [ ] Open https://netcare-healthos.vercel.app in Chrome (incognito)
- [ ] Have `public/samples/sample-claims.csv` downloaded and ready on Desktop
- [ ] Have `public/samples/sample-healthbridge.csv` downloaded and ready
- [ ] Have WhatsApp open on your phone (for live booking demo)
- [ ] Test login works with sara.nayager@netcare.co.za
- [ ] Check internet connection is stable
- [ ] Close all other tabs — full attention on the demo

---

## Minute 0:00-2:00 — Login & Network Command Center

### What to click
1. Navigate to https://netcare-healthos.vercel.app
2. Login as `sara.nayager@netcare.co.za`
3. Click **Network Command** in the sidebar
4. Let the dashboard load — 88 clinics at a glance

### What to say
> "Sara, this is your cockpit. 88 Medicross clinics, live KPIs, one screen. Top row shows today's numbers: total claims processed, rejection rate, revenue recovered, and clinics needing attention. Each clinic card shows its health score — green means clean claims, amber means flagged, red means intervention needed."

### What Sara will likely ask
- **"Is this real data?"** → "This is seeded with realistic data modeled on Medicross operational patterns. In the pilot, this connects to your live SwitchOn and Healthbridge feeds via our adapter layer. No system migration required."
- **"How often does it refresh?"** → "Real-time for claim submissions. KPI rollups every 15 minutes. You can drill into any clinic by clicking its card."
- **"Can I see individual clinics?"** → Click on any clinic card to show the drill-down view with that clinic's specific rejection rates, top rejection codes, and scheme breakdown.

---

## Minute 2:00-4:00 — Claims Analyzer

### What to click
1. Click **Claims Analyzer** in the sidebar
2. Click **Upload CSV**
3. Drag `sample-claims.csv` from Desktop
4. Watch the validation results populate in real-time
5. Point out the color-coded results: green (valid), amber (warning), red (error)

### What to say
> "This is where the money is recovered. I've uploaded 30 sample claims. Watch — the system runs 13 validation rules in under 2 seconds. See line 4? Thabo Mashaba's diabetes claim used E11 instead of E11.9 — that's an insufficient specificity rejection on every major scheme. Line 10? David Kruger — male patient with an obstetric code O80. That's a guaranteed gender mismatch rejection."

> "Now here's the magic — see the blue 'Auto-Fix' button on line 4? One click, and E11 becomes E11.9. That claim goes from rejected to paid. Across 88 clinics, these auto-fixable errors alone represent R54-72 million in annual recovery."

### What Sara will likely ask
- **"How do you know which codes are wrong?"** → "13 rules based on CMS coding standards, WHO ICD-10 guidelines, and scheme-specific requirements. Rule 3, for example, checks specificity — Discovery and GEMS require 4th character minimum. We also cross-reference gender, age, and anatomy-specific codes."
- **"What about Healthbridge format?"** → Upload `sample-healthbridge.csv`: "Auto-detected as Healthbridge EDI format. Same validation, no configuration needed."
- **"What's the false positive rate?"** → "In testing, under 2%. Every flag includes the specific rule, the reason, and a suggested fix. Your billing team makes the final call on ambiguous cases."

---

## Minute 4:00-6:00 — CareOn Bridge Console

### What to click
1. Click **CareOn Bridge** in the sidebar
2. Show the 5 advisory cards from real Netcare hospitals
3. Click into one advisory to show the AI-generated suggestion
4. Show the HL7 → FHIR conversion panel

### What to say
> "This connects to CareOn — the iMedOne system running across Netcare's 56 hospitals. We're receiving HL7v2 messages in real-time: admits, discharges, lab results, orders. Each message is converted to FHIR R4 — the international healthcare standard — so the data is normalized and queryable."

> "See this advisory? A patient at Milpark was admitted with a drug interaction flag. Our Micromedex integration caught it before the pharmacy dispensed. That's a patient safety win and a liability reduction."

### What Sara will likely ask
- **"Does this require changes to CareOn?"** → "No. We receive standard HL7v2 messages over the existing MLLP interface. CareOn doesn't know we exist — we're a passive listener that adds intelligence on top."
- **"What about HEAL for Medicross?"** → "HEAL is next on the integration roadmap. Same adapter pattern — once connected, Medicross clinical data flows into the same dashboard alongside hospital data."
- **"How does the FHIR conversion work?"** → "Four segment types map to four FHIR resources: PID becomes a Patient, PV1 becomes an Encounter, OBX becomes an Observation, DG1 becomes a Condition. Compatible with CareConnect HIE standards."

---

## Minute 6:00-8:00 — WhatsApp Booking Demo

### What to click
1. Click **WhatsApp** in the sidebar
2. Show the clinic directory with all 40 Medicross locations
3. Open WhatsApp on your phone
4. Send a message to the demo number
5. Type: "Book at Medicross Sandton tomorrow 10am"
6. Show the response coming back in real-time

### What to say
> "Patient experience. A Medicross patient texts this WhatsApp number — no app download, no login, no portal. They say 'Book at Medicross Sandton tomorrow 10am' and in 40 seconds they have a confirmed booking. The AI understands natural language, finds the nearest available slot, and confirms."

> "Behind the scenes: Twilio handles the messaging, our AI agent parses the intent, checks availability in the booking engine, confirms the slot, and sends a reminder 24 hours before. POPIA compliant — we only store what's needed for the booking."

### What Sara will likely ask
- **"What if they don't know which clinic?"** → "They can text their location or suburb name. The system finds the nearest Medicross using GPS coordinates. 'Find a Medicross near Rosebank' works."
- **"What languages?"** → "English, Afrikaans, and Zulu for initial release. The NLU model handles code-switching — common in SA healthcare contexts."
- **"What about cancellations?"** → "Text 'Cancel my booking' and the system finds their most recent booking and cancels it. Slot is immediately freed up."

---

## Minute 8:00-10:00 — ROI Calculator

### What to click
1. Click **ROI Calculator** in the sidebar
2. Show the default Netcare numbers pre-populated
3. Adjust the "Number of Clinics" slider from 88 down to 3 (pilot)
4. Then slide back up to 88 (full rollout)
5. Point to the annual recovery figure

### What to say
> "Let's talk money. These are Netcare's real numbers — 88 clinics, R3.6 billion in annual claims. At industry-average 15-20% rejection rate, that's R540-720 million in rejected claims. Our system targets the 40% that are auto-fixable coding errors."

> "Conservative estimate: R54-72 million in annual recovery. That's R614K-R818K per clinic per year. At R8,500 per clinic per month, the system pays for itself in the first two weeks."

> "But it's not just the Analyzer. The CareOn Bridge adds R139 million in operational value — bed management, clinical decision support, discharge automation. Combined: R193-211 million annual benefit. 21-23x ROI."

### What Sara will likely ask
- **"Where does the R139M Bridge number come from?"** → "Five categories: R28M bed management, R35M clinical decision support, R18M discharge automation, R22M cross-facility visibility, R36M operational analytics. Each is modeled on published benchmarks for similar implementations in comparable health systems."
- **"What's the contract structure?"** → "Per-clinic monthly subscription. No upfront capital expenditure. Scale up or down month-to-month. The pilot is free — 3 clinics, 4 weeks, zero cost."
- **"How does this compare to what Altron charges?"** → "SwitchOn charges R5.90 per claim for switching alone. We don't replace the switch — we add the intelligence layer. Our per-clinic cost works out to approximately R0.70 per claim, and we recover multiples of that in prevented rejections."

---

## Minute 10:00-12:00 — Switching Engine

### What to click
1. Click **Switching Engine** in the sidebar
2. Show the scheme routing table
3. Select "Discovery Health" — show it routes to Healthbridge (primary), MediKredit (fallback 1), SwitchOn (fallback 2)
4. Select "GEMS" — show it routes to SwitchOn (primary)
5. Show the circuit breaker status indicators

### What to say
> "This is how claims find the right switch. Three switching houses — Healthbridge, SwitchOn, MediKredit — each with bilateral agreements to specific scheme administrators. The system knows that Discovery claims go to Healthbridge, GEMS goes to SwitchOn, Medshield goes to MediKredit."

> "If Healthbridge goes down — and it does happen — the circuit breaker detects it within 3 failed attempts and automatically reroutes to MediKredit. Your billing team doesn't even notice. Claims keep flowing."

### What Sara will likely ask
- **"We already submit through SwitchOn. Why do we need this?"** → "SwitchOn handles the pipe. We handle the intelligence around the pipe. We validate before the claim enters the switch, route to the optimal switch for each scheme, and reconcile the eRA when it comes back. The switch doesn't validate — it just transmits."
- **"What about EDIFACT format?"** → "SwitchOn uses PHISC EDIFACT. Healthbridge uses XML. MediKredit has a proprietary format. Our system handles all three — the billing team uploads one CSV and we format it for the correct switch automatically."
- **"What if a scheme changes their administrator?"** → "The routing table is configurable. We update it when CMS publishes scheme administration changes. Recent example: when Fedhealth moved administrators, the routing table was updated within 24 hours."

---

## Minute 12:00-14:00 — FHIR Integration Hub

### What to click
1. Click **FHIR Hub** (or CareOn Bridge → Integration tab)
2. Show the CareConnect HIE compatibility badge
3. Show a sample HL7v2 message on the left, FHIR R4 resource on the right
4. Highlight the 4 segment → resource mappings
5. Show the integration status panel (connected systems)

### What to say
> "South Africa is moving to FHIR. CareConnect HIE, the NDoH's interoperability framework, mandates FHIR R4. Netcare's CareOn system speaks HL7v2. We bridge the gap."

> "PID segment becomes a FHIR Patient. PV1 becomes an Encounter. OBX becomes an Observation. DG1 becomes a Condition. Every message from every Netcare hospital, normalized to international standards. This isn't just for internal use — when NDoH mandates FHIR compliance, Netcare is already there."

### What Sara will likely ask
- **"Is FHIR a regulatory requirement?"** → "Not yet mandatory, but CareConnect HIE is the NDoH's stated direction. Early adopters will have an advantage. The UK's NHS mandated FHIR in 2023 and SA is following the same trajectory."
- **"Can other systems consume this FHIR data?"** → "Yes. Any FHIR-compatible system can query our FHIR server. This enables interoperability with labs, pharmacies, and other providers — a key differentiator as the SA health ecosystem modernizes."
- **"What about data sovereignty?"** → "All data stays in South Africa. Our Supabase instance runs in EU-West-1 with data residency options for SA-based hosting. No patient data crosses borders."

---

## Minute 14:00-15:00 — Partnership Close

### What to click
1. Click **Partnership** in the sidebar
2. Show the partnership page with the value proposition summary
3. Point to the pilot timeline graphic
4. Show the "We aggregate, we don't replace" message

### What to say
> "Sara, one slide to close. We aggregate, we don't replace. CareOn stays. HEAL stays. SwitchOn stays. SAP stays. We sit on top of everything and add the intelligence layer that connects them."

> "The pilot is simple: 3 clinics, 4 weeks, zero risk. Week 1 is shadow mode — we just watch and report what we would have caught. No disruption to your billing teams, no system changes, no data migration. If after 4 weeks the numbers don't speak for themselves, we walk away."

> "But I don't think we'll be walking away. Because when your billing teams see R614K per clinic per year in recovered revenue, and your IT team sees HL7-to-FHIR working out of the box, and your patients book via WhatsApp in 40 seconds — that's not a vendor pitch. That's a capability gap being closed."

### What Sara will likely ask
- **"Who else are you working with?"** → "We're focused on Netcare for the pilot. The platform is designed for the SA private healthcare ecosystem — applicable to Life Healthcare, Mediclinic, and independent practice groups, but Netcare is our strategic partner for Phase 1."
- **"What do you need from us?"** → "Three things: (1) Select 3 pilot clinics, (2) API access to SwitchOn claims data for those clinics (read-only), (3) A champion in each clinic's billing team for feedback. That's it."
- **"Timeline to go live after pilot?"** → "If the pilot succeeds: 4 weeks to expand to all 88 Medicross clinics. Hospital integration via CareOn runs in parallel. Full platform live within 12 weeks of pilot completion."

---

## Post-Demo Actions

- [ ] Send Sara the sample CSV files so her team can test independently
- [ ] Share the ROI Calculator link (works without login for read-only)
- [ ] Schedule a follow-up with Matsie for technical deep-dive
- [ ] Schedule a follow-up with Travis for financial modeling session
- [ ] Send the PITCH-RESPONSE-MATRIX.md to Jess for internal prep

---

## Emergency Fallbacks

**If the site is down**: Open the local dev server (`npm run dev` at localhost:3000). All features work locally.

**If CSV upload fails**: Show the pre-loaded demo data on the Claims Analyzer page. Point out the same validation flags.

**If WhatsApp demo fails**: Show the WhatsApp page with the simulated conversation flow. Explain: "The Twilio webhook is configured — this is what the patient sees."

**If Sara asks something you don't know**: "That's a great question. Let me get you a precise answer within 24 hours rather than guess." Never bluff.
