# 22 — SA Medical Claims: How Doctors, Clerks, and Schemes Actually Think
## VisioCorp Health Intelligence KB | Compiled 2026-03-25

---

## PURPOSE

This document captures the **practical reasoning patterns** of the three human actors in the SA claims lifecycle: the GP/doctor who generates the clinical encounter, the billing clerk who translates it into a claim, and the scheme adjudicator who decides to pay or reject. An AI claims validator must understand not just the rules, but HOW and WHY humans make the decisions they do — including the systematic errors they commit.

---

## PART 1: SA GP CLINICAL REASONING

---

### 1.1 How a SA GP Thinks During a Consultation

A GP in South Africa sees 30-50 patients per day. The consultation is compressed — 7-15 minutes on average. The GP's cognitive workflow follows this pattern:

```
Patient presents
  → 1. TRIAGE (30 seconds): Is this urgent? Life-threatening? Refer immediately?
  → 2. HISTORY (2-4 min): Presenting complaint, duration, severity, associated symptoms
  → 3. EXAMINATION (2-5 min): Targeted examination based on history
  → 4. PATTERN MATCH (10-30 seconds): Match symptom complex to known diagnosis
  → 5. DECIDE (30 seconds):
       a. I am confident → definitive diagnosis → code it
       b. I am uncertain → working diagnosis → R-code or "most likely" code
       c. I need more info → order investigations → code presenting symptom
  → 6. TREAT (1-2 min): Prescribe, procedure, or refer
  → 7. DOCUMENT (1-2 min): Write notes + select ICD-10 + select tariff
```

**Key insight**: Steps 5-7 happen almost simultaneously. The GP picks the ICD-10 code WHILE deciding on treatment. This is why coding errors happen — the cognitive load is divided between clinical reasoning and administrative coding at the exact same moment.

### 1.2 ICD-10-ZA Coding Workflow (GP Mental Model)

Most SA GPs do NOT think in ICD-10 codes. They think in diagnoses, then translate. The translation happens one of three ways:

**Method A — Memory (70% of coding):**
- GP knows top 20 codes by heart: J06.9, I10, E11.9, M54.5, J20.9, R50.9, N39.0, K29.7, J45.9, Z00.0
- These codes become reflexive — "sore throat" = J02.9, "BP follow-up" = I10
- **Error pattern**: GP defaults to unspecified (.9) codes even when specificity is available because the specific code is not memorised

**Method B — PMS Dropdown (25% of coding):**
- GP types "diabetes" into practice management software search
- PMS shows: E10 (Type 1), E11 (Type 2), E13 (Other), E14 (Unspecified)
- GP selects E11 or E11.9 because most diabetics are Type 2
- **Error pattern**: GP selects first match rather than most specific match. If typing "pain" the GP may get R52 (Pain, unspecified) before M54.5 (Low back pain)

**Method C — Code Book/Reference (5% of coding):**
- Only for unusual diagnoses the GP encounters rarely
- May use WHO ICD-10 manual, pocket reference card, or EMGuidance app
- **Error pattern**: Longer lookup = more time pressure = more likely to select "good enough" code

### 1.3 How GPs Choose Between Consultation Codes

The consultation tariff code selection is one of the most disputed areas in SA billing. Here is how GPs actually decide:

| Code | Official Criteria | GP's Real Decision |
|------|------------------|--------------------|
| **0190** (Brief) | <10 min | "Quick follow-up, script renewal, single simple complaint — I was in and out" |
| **0191** (Intermediate) | 10-20 min | "Standard consult — examined the patient, made a diagnosis, wrote a script" (DEFAULT for most GPs) |
| **0192** (Comprehensive) | 20-30 min | "Multiple complaints, new chronic diagnosis, detailed examination, counselling involved" |
| **0193** (Extended) | >30 min | "Complex patient — multiple systems, chronic review with medication changes, long discussion" |
| **0194** (Follow-up) | Brief follow-up | "Results review, wound check, post-procedure check — no new complaint" |
| **0197** (Telehealth) | Audio/video consult | "Phone/video call — modifier 0023 for telehealth" |
| **0199** (After-hours) | After-hours equivalent | "Seen after 18:00 or on weekend/holiday — add after-hours modifier" |

**The Upcoding Temptation:**
- GP average distribution should be roughly: 0190 (15%), 0191 (55%), 0192 (20%), 0193 (8%), 0194 (2%)
- Red flag: >70% at 0192-0193 when seeing 40+ patients/day is time-impossible
- A 40-patient day at 0192 average = 40 × 25 min = 16.7 hours of consult time alone — impossible
- Scheme algorithms calculate: total_consultation_minutes / working_hours → flag if >100% utilisation

**The Downcoding Problem:**
- Conversely, GPs who always bill 0190-0191 may be underbilling for complex chronic reviews
- A genuine 45-minute diabetes management consult SHOULD be 0193, but GPs worry about triggering audits

### 1.4 When GPs Order Investigations vs Refer

```
GP Decision Tree for Investigations:

PATHOLOGY (bloods):
  → Routine chronic monitoring? → Order standard panel:
      Diabetes: HbA1c (4052), glucose (4050), U&E (4042), lipogram (4059), ACR
      Hypertension: U&E (4042), creatinine, lipogram (4059), glucose (4050)
      Annual screening: FBC (4014), glucose, lipogram, LFT (4068), TSH (4070)
  → Diagnostic workup? → Targeted based on differential:
      Fatigue: FBC, TSH, glucose, ferritin (4075), Vitamin B12
      Abdominal pain: FBC, LFT, amylase (4055), CRP (4027)
      Chest pain: Troponin (4080), ECG (1211) → if positive, REFER immediately

RADIOLOGY:
  → Chest X-ray (3601): Cough >3 weeks, suspected pneumonia, TB screening
  → Abdominal X-ray: Suspected obstruction, foreign body
  → Abdominal ultrasound (3801): RUQ pain, hepatomegaly, renal colic → REFER to radiologist
  → MRI/CT: ALWAYS refer to specialist → GP does NOT order advanced imaging directly
    (Exception: some GPs order CT brain for headache, but this requires pre-auth)

REFER TO SPECIALIST:
  → Clinical suspicion of cancer → refer urgently
  → Failed standard therapy (e.g., HbA1c >9% on triple therapy → endocrinologist)
  → Procedural need beyond GP scope (e.g., colonoscopy → gastroenterologist)
  → Diagnostic uncertainty after reasonable workup
  → Mental health beyond mild-moderate depression → psychiatrist
```

**GP scope for in-room procedures (legitimately billable by GP):**
- ECG (1211) — interpretation included
- Spirometry (5033)
- Nebulisation (5034)
- Wound suturing (0515-0520)
- Excision of small skin lesions (0700-0750)
- I&D of abscess (0710)
- Joint injection (0890)
- Ear syringing (2001)
- Pap smear (6851)
- Blood draw / specimen collection (4001)
- Urine dip (4400)
- Rapid tests: malaria (4215), HIV (4210), strep (4220), pregnancy (4410), glucose finger prick

### 1.5 SA-Specific Clinical Protocol Decision Points

When a GP diagnoses a CDL condition, the clinical protocol drives both treatment AND billing:

**SEMDSA Algorithm for Type 2 Diabetes — GP Billing Implications:**
```
Diagnosis: E11.9 (or E11.x with complication code)
Step 1: Metformin → NAPPI for metformin 500/850/1000mg → CDL auth required
Step 2: Add gliclazide/glimepiride → second NAPPI code → CDL amendment
Step 3: Add DPP4i or SGLT2i → may need formulary motivation (off-formulary = co-pay)
Step 4: Insulin initiation → MUST include insulin NAPPI + consumables (needles, strips)
Monitoring: HbA1c (4052) every 3 months, annual bloods panel → these are EXPECTED claims
```
A claims AI should EXPECT to see: E11 + metformin NAPPI + 3-monthly HbA1c + annual lipogram/renal/eye exam. ABSENCE of monitoring bloods on a CDL diabetic is itself a quality flag.

**SASHA Hypertension — GP Billing Implications:**
```
Diagnosis: I10 (essential hypertension — 3 characters is COMPLETE, not unspecified)
Step 1: Monotherapy (amlodipine for black patients, enalapril for non-black <55)
Step 2: Dual therapy → second medication → CDL amendment
Step 3: Triple → third medication
Step 4: Resistant → add spironolactone → consider specialist referral
Monitoring: BP every visit, U&E at 2 weeks post ACE-i/ARB start, annual bloods
```
**CRITICAL for AI**: I10 is frequently flagged as "unspecified" — this is WRONG. I10 (Essential primary hypertension) is the complete, maximum-specificity code. There is no I10.x subcategory. Same for B20 (HIV), G35 (Multiple sclerosis), E78.5 (Hyperlipidaemia). The AI must NOT flag these as "missing specificity."

**GINA/SA Thoracic Society Asthma — GP Billing Implications:**
```
Diagnosis: J45.x (asthma) with specificity:
  J45.0 = predominantly allergic
  J45.1 = non-allergic
  J45.8 = mixed
  J45.9 = unspecified (acceptable for first-visit, but should be specified on follow-up)
Step 1-2: ICS ± SABA → NAPPI for inhaler(s)
Step 3-4: ICS-LABA combination → different NAPPI → CDL amendment
Step 5: Add LAMA / biologic → specialist referral required
Monitoring: Spirometry annually, ACT score at visits
```

---

## PART 2: BILLING CLERK REASONING

---

### 2.1 How a Billing Clerk Reads Doctor's Notes

The billing clerk (often also the receptionist in small GP practices) performs the critical translation from clinical encounter to electronic claim. Here is their actual workflow:

```
Doctor completes consultation
  → 1. RECEIVE: Doctor hands over encounter form / enters in PMS
       - Paper form: handwritten diagnosis + code (if doctor writes one)
       - Electronic: doctor selects codes in EMR during consult
       - Verbal: doctor tells receptionist "it's a standard consult, URTI"
  → 2. INTERPRET:
       - Read diagnosis (often abbreviated: "URTI", "HTN", "DM2", "LBP")
       - Translate to ICD-10 code (if doctor didn't code it)
       - Determine consultation level from notes/time spent
  → 3. ASSEMBLE CLAIM:
       - Patient header (membership, dependent, DOB)
       - Provider header (BHF, HPCSA, discipline)
       - Line items: tariff + ICD-10 + amount for each service
  → 4. VALIDATE (mental checklist):
       - Does this ICD-10 make sense with this tariff?
       - Is the amount within scheme range?
       - Do I need to add an ECC for injury codes?
       - Is this a chronic condition that needs CDL auth number?
  → 5. SUBMIT via PMS → switching house
  → 6. HANDLE RESPONSE: accepted/rejected/pended
```

### 2.2 The Clerk's ICD-10 Translation Table (Common Abbreviations)

Clerks develop their own shorthand-to-code mappings:

| Doctor Says/Writes | Clerk Codes As | Correct? | Common Error |
|--------------------|---------------|----------|-------------|
| "URTI" / "Cold" / "Flu" | J06.9 | Yes | Sometimes coded as J11 (influenza) when it's not |
| "Tonsillitis" | J03.9 | Yes | Should be J03.0 (streptococcal) if strep test positive |
| "Chest infection" | J20.9 (bronchitis) | Usually | May need J18.9 (pneumonia) if CXR confirms |
| "Gastro" | A09 or K52.9 | Depends | A09 = infectious, K52.9 = non-infectious — clerk may not distinguish |
| "UTI" | N39.0 | Yes | — |
| "BP check" / "HTN" | I10 | Yes | Clerk may add .0 or .9 which don't exist for I10 |
| "Sugar check" / "DM" | E11.9 | Usually | May code E10 (Type 1) when patient is Type 2 |
| "Headache" | R51 | Yes | Should be G43 (migraine) if doctor diagnosed migraine |
| "Back pain" | M54.5 | Yes | Should be more specific if doctor noted sciatica (M54.3) |
| "Rash" | L30.9 | Acceptable | Should be specific: L20 (eczema), L40 (psoriasis), L50 (urticaria) |
| "Wound" / "Cut" / "Laceration" | S61.0 (hand) | Depends | MUST add ECC — clerk often forgets this |
| "Depression" | F32.9 | Yes | May need F32.0 (mild), F32.1 (moderate), F32.2 (severe) |
| "Anxiety" | F41.9 | Acceptable | F41.0 (panic), F41.1 (GAD) preferred if specified |
| "Ear infection" | H66.9 | Yes | H65 (serous) vs H66 (suppurative) distinction often missed |
| "Pink eye" | H10.9 | Yes | Allergic (H10.1) vs bacterial (H10.0) often not distinguished |
| "Sprained ankle" | S93.4 | Yes | MUST add ECC (W01 = fall, W19 = unspecified fall) |

### 2.3 The 12 Most Common Clerk Mistakes

| # | Mistake | Why It Happens | Consequence | Fix |
|---|---------|---------------|-------------|-----|
| 1 | **Missing ICD-10 code** | Doctor didn't write one; clerk submitted anyway | Auto-reject (30% of all rejections) | PMS should block submission without ICD-10 |
| 2 | **Unspecified codes when specific available** | Clerk uses J06.9 when doctor wrote "pharyngitis" (J02.9) | May pass but flagged for review at Discovery | Train clerks on specificity |
| 3 | **Missing External Cause Code (ECC)** | Clerk doesn't know S/T codes need V01-Y98 secondary | Auto-reject for injury claims | PMS should prompt for ECC on any S/T primary |
| 4 | **Wrong gender code** | Coded O-code (pregnancy) for male patient due to data entry | Hard reject — gender mismatch | PMS should validate gender vs ICD-10 |
| 5 | **Dependent code wrong** | Used 00 (principal) instead of 03 (3rd dependent) | Reject — member not found | Verify on medical aid card |
| 6 | **Asterisk code as primary** | Selected manifestation code (G63* diabetic neuropathy) as primary instead of dagger (E11†) | Reject — invalid primary | Train on dagger/asterisk system |
| 7 | **Amount exceeds scheme rate** | Used practice fee instead of scheme tariff | Partial payment (not rejection) — patient pays gap | Check scheme tariff before billing |
| 8 | **Stale claim** | Submitted >120 days after DOS | Hard reject — time-barred | PMS should flag claims approaching deadline |
| 9 | **Wrong tariff for discipline** | GP billing specialist tariff code (0141 instead of 0191) | Reject — discipline mismatch | PMS should validate tariff vs discipline |
| 10 | **Missing CDL auth number** | Chronic medication claimed without active authorization | Reject or pend | Check CDL status before billing chronic |
| 11 | **Duplicate claim** | Already submitted; clerk submits again thinking first failed | Reject — duplicate | PMS should track submitted claims |
| 12 | **Wrong scheme/option code** | Patient changed plans; clerk using old details | Reject — benefit not available | Re-verify at each visit |

### 2.4 The Claim Submission Workflow (Complete)

```
STEP 1 — CAPTURE (Clerk at PMS)
  ├── Enter patient demographics (from medical aid card)
  ├── Verify membership (real-time via switch: membership + dep code + DOS + BHF)
  ├── Receive benefit response: active/suspended, plan, balances
  └── If suspended → inform patient → cash payment OR reschedule

STEP 2 — CODE (Clerk translates doctor's notes)
  ├── Primary ICD-10 code (from doctor's diagnosis)
  ├── Secondary ICD-10 codes (additional diagnoses, ECC if injury)
  ├── Tariff code(s) (from consultation level + procedures performed)
  ├── NAPPI code(s) (if medicines dispensed in-room)
  ├── Modifier(s) (after-hours, bilateral, emergency)
  └── Amounts (practice fee schedule, must be within reason)

STEP 3 — VALIDATE (PMS pre-submission checks)
  ├── ICD-10 exists in SA MIT? → if not, prompt correction
  ├── ICD-10 valid as primary? → asterisk codes blocked from primary position
  ├── Gender match? → O-codes for female only, N40-51 for male only
  ├── Age match? → P-codes for neonates, O-codes for reproductive age
  ├── ECC present for S/T codes? → prompt if missing
  ├── Tariff matches discipline? → GP codes vs specialist codes
  ├── Amount within scheme range? → warn if exceeds expected
  ├── Duplicate? → check recent submissions for same patient/date/procedure
  └── Claim window? → reject if DOS >120 days ago

STEP 4 — SUBMIT
  ├── PMS formats into PHISC MEDCLM/EDIFACT message
  ├── Transmits to switching house (MediSwitch or Healthbridge)
  ├── Switch validates format → routes to correct scheme
  └── Two modes:
        REAL-TIME: response in 2-15 seconds (preferred)
        BATCH: accumulated, sent end-of-day, response in 24-48 hours

STEP 5 — HANDLE RESPONSE
  ├── ACCEPTED FULL → no action needed; scheme pays provider
  ├── ACCEPTED PARTIAL → calculate patient shortfall → collect from patient
  ├── REJECTED → classify:
  │     CORRECTABLE → fix code/data → resubmit as CORRECTION
  │     APPEALABLE → draft motivation → submit via scheme portal
  │     UNCOLLECTABLE → transfer to patient account → invoice patient
  └── PENDED → follow up in 5-30 days; provide additional info if requested
```

### 2.5 How Clerks Handle Rejections

The rejection handling process reveals the clerk's reasoning patterns:

**Step 1 — Read the rejection code:**
```
Clerk receives rejection via PMS or eRA download
  → Rejection code + reason text displayed
  → Clerk classifies mentally:
      "Is this MY mistake?" (data entry, wrong code, missing field)
      "Is this the DOCTOR's mistake?" (wrong diagnosis, insufficient notes)
      "Is this a SCHEME problem?" (benefit issue, system glitch, PMB underpayment)
```

**Step 2 — Correction decision tree:**

| Rejection Code | Clerk's Response | Action |
|---------------|-----------------|--------|
| 12 (ICD-10 invalid) | "I need the right code" | Ask doctor for specific diagnosis → recode → resubmit |
| 05 (Duplicate) | "Did I send this twice?" | Check PMS history → if genuine duplicate, do nothing; if not, resubmit with explanation |
| 08 (Pre-auth missing) | "Was auth obtained?" | Check with doctor → if yes, attach auth number → resubmit; if no, apply retrospectively |
| 07 (Benefit exhausted) | "Is this PMB?" | Check ICD-10 against PMB list → if PMB, resubmit with PMB motivation letter |
| 13 (Above tariff) | "We charged more than scheme rate" | Accept partial payment OR motivate clinical complexity |
| 01/02/03 (Member issues) | "Wrong patient details" | Re-verify with patient → correct membership/dependent → resubmit |
| 11 (Past deadline) | "Too late" | Almost never recoverable — write off or patient pays |

**Step 3 — Resubmission mechanics:**
```
Resubmission via PMS:
  1. Open original rejected claim
  2. Apply corrections (new ICD-10, updated amount, missing fields)
  3. Flag as CORRECTION (not new claim) — includes original claim reference
  4. Attach supporting documentation if required (clinical notes, auth letter)
  5. Submit through switch
  6. Track resubmission outcome separately
  7. If rejected again → escalate to formal appeal (motivation letter to scheme)
```

**Step 4 — Appeal process (for clinical disputes):**
```
Formal Appeal:
  1. Clerk drafts motivation letter (or gets doctor to sign template letter)
  2. Includes:
     - Original claim details (date, codes, amount)
     - Rejection reason
     - Clinical justification (why this treatment was necessary)
     - Supporting evidence (lab results, specialist reports, clinical notes)
  3. Submit via:
     - Scheme online portal (preferred — fastest)
     - Fax to scheme appeals department
     - Email to scheme provider relations
  4. Scheme must respond within 30 days (CMS regulation)
  5. If scheme denies appeal → CMS complaint (last resort)
```

---

## PART 3: SA MEDICAL SCHEME ADJUDICATION

---

### 3.1 How Scheme Adjudication Engines Think

Modern SA scheme adjudication is 70-80% automated (Discovery claims 78% auto-adjudication via FICO Blaze Advisor). The engine follows a strict sequential pipeline:

```
CLAIM RECEIVED
  │
  ├─ GATE 1: FORMAT (1ms)
  │   Is the EDIFACT/MEDCLM message well-formed?
  │   All mandatory segments present?
  │   → FAIL: Rejection code 99 (format error)
  │
  ├─ GATE 2: ELIGIBILITY (50ms)
  │   Member active on date of service?
  │   Dependent registered? (00=principal, 01-09=deps)
  │   Waiting period? (3-month general, 12-month condition-specific)
  │   Premiums paid?
  │   → FAIL: Rejection codes 01-04
  │
  ├─ GATE 3: PROVIDER (50ms)
  │   BHF practice number active? (7 digits, verified via PCNS)
  │   HPCSA registration current?
  │   Discipline matches claimed codes?
  │   On scheme network/DSP?
  │   → FAIL: Rejection code 10 (not on network), provider error
  │
  ├─ GATE 4: CODE VALIDATION (100ms)
  │   ICD-10 exists in SA MIT?
  │   ICD-10 valid for primary position? (not asterisk)
  │   ICD-10 gender-appropriate? (O-codes female, N40-51 male)
  │   ICD-10 age-appropriate? (P-codes neonates, O-codes 12-55)
  │   S/T codes have V01-Y98 ECC?
  │   Tariff code exists and active?
  │   Tariff within discipline scope?
  │   NAPPI active? Amount ≤ SEP + dispensing fee?
  │   → FAIL: Rejection code 12 (ICD-10), 59 (tariff)
  │
  ├─ GATE 5: DUPLICATE (200ms)
  │   Exact match: same member + date + procedure + provider → REJECT
  │   Fuzzy match: same member + date + procedure + different provider → PEND
  │   → FAIL: Rejection code 05
  │
  ├─ GATE 6: FREQUENCY (100ms)
  │   Exceeded daily/annual/lifetime limit?
  │   Consultation: 1 per patient per day (most schemes)
  │   Dental scale: 2 per 12 months
  │   Mammogram: 1 per 24 months (40-54), 1 per 12 months (55+)
  │   Eye test: 1 per 24 months
  │   → FAIL: Rejection code 20 (frequency exceeded)
  │
  ├─ GATE 7: BUNDLING (200ms)
  │   Components billed separately that should be one code?
  │   Consultation included in procedure? (consult subsumed)
  │   FBC components billed individually?
  │   → ADJUSTMENT: Reduce to bundled code amount
  │
  ├─ GATE 8: PRE-AUTHORIZATION (100ms)
  │   Service requires auth? (MRI, CT, PET, hospital, oncology)
  │   Auth number present and valid?
  │   Auth matches procedure and provider?
  │   → FAIL: Rejection code 08 (auth missing)
  │
  ├─ GATE 9: PMB CHECK (critical — 200ms)
  │   Is this a PMB condition? (270 DTPs, 27 CDL, emergency)
  │   → YES: Override gates 6 (frequency), 7 (benefit limit), waiting period
  │   → PMB at DSP: Pay in full, no co-payment
  │   → PMB at non-DSP: Pay at DSP rate, member pays shortfall
  │   → Emergency PMB: Pay in full at ANY provider
  │
  ├─ GATE 10: BENEFIT ROUTING (100ms)
  │   In-hospital → Risk Pool
  │   Chronic CDL → Chronic Benefit
  │   Day-to-day → MSA first → Self-Payment Gap → ATB
  │   → FAIL: Rejection code 07 (benefit exhausted)
  │
  ├─ GATE 11: TARIFF COMPARISON (50ms)
  │   Amount ≤ scheme tariff → PAY_IN_FULL
  │   Amount > scheme tariff → PAY_AT_TARIFF (shortfall to patient)
  │   → ADJUSTMENT: Rejection code 13 (above tariff)
  │
  ├─ GATE 12: CO-PAYMENT (50ms)
  │   Non-DSP provider? → 20-40% co-payment
  │   Off-formulary medicine? → Brand-generic differential co-payment
  │   PMB at DSP? → NO co-payment (legally prohibited)
  │   → ADJUSTMENT: Rejection code 14 (co-payment applied)
  │
  ├─ GATE 13: CLINICAL RULES (500ms — most complex)
  │   Diagnosis-procedure mismatch? (ECG for URTI → flag)
  │   Unusual combination? (colonoscopy for back pain → flag)
  │   High-value outlier? (amount > 3 SD from peer mean → flag)
  │   Fraud score? (ensemble model → green/amber/red)
  │   → PEND_FOR_REVIEW if amber/red
  │
  └─ OUTCOME:
      PAY_IN_FULL → EFT scheduled
      PAY_PARTIAL → Approved amount < billed amount → shortfall to patient
      REJECT → Reason code → back to practice
      PEND → Clinical review queue → response within 30 days
```

### 3.2 The 25 Most Common Rejection Codes (with Triggers)

| Code | Description | % of Rejections | What Triggers It | Resubmittable? |
|------|-------------|----------------|-----------------|----------------|
| 01 | Member not found | 4% | Wrong membership number, typo | Fix number, resubmit |
| 02 | Account/documentation required | 8% | Paper claim, missing details | Supply documents |
| 03 | Dependent code invalid | 3% | Wrong dep code, dep not registered | Correct dep code |
| 04 | Member suspended (arrears) | 5% | Premiums unpaid | Patient must resolve with scheme |
| 05 | Duplicate claim | 7% | Same claim submitted twice | Verify, don't resubmit |
| 06 | Claim not scheme liability | 2% | RAF/COIDA case, third party | Bill correct party |
| 07 | Benefit exhausted | 13% | Annual limit reached | PMB motivation if applicable |
| 08 | Pre-auth not obtained | 10% | MRI/CT/hospital without auth | Apply retrospectively |
| 09 | Service not covered | 3% | Excluded benefit, cosmetic | Usually not resubmittable |
| 10 | Provider not on network | 3% | Non-DSP provider | Patient pays co-pay |
| 11 | Past filing deadline | 2% | >120 days from DOS | Almost never recoverable |
| 12 | ICD-10 invalid/unspecified | 15% | Wrong code, missing code, insufficient specificity | Correct code, resubmit |
| 13 | Above scheme tariff | 8% | Practice rate > scheme rate | Accept partial or motivate |
| 14 | Co-payment applied | 5% | Non-DSP, off-formulary | Not a full rejection |
| 15 | Waiting period applies | 3% | New member, condition-specific wait | Check PMB override |
| 17 | Tariff code incorrect | 5% | Wrong tariff, discipline mismatch | Correct code |
| 20 | Frequency limit exceeded | 3% | Too many of same service in period | Motivate if clinically justified |
| 22 | Bundling violation | 3% | Components billed separately | Rebill as bundled code |
| 25 | Missing external cause code | 3% | S/T injury without V01-Y98 | Add ECC, resubmit |
| 30 | Clinical review | 2% | Suspicious pattern, high amount | Supply clinical notes |
| 35 | NAPPI invalid/inactive | 2% | Wrong medicine code | Correct NAPPI |
| 40 | Chronic auth expired/missing | 3% | CDL auth lapsed | Renew authorization |
| 45 | Age/gender mismatch | 1% | Paediatric code on adult, pregnancy on male | Correct code or patient data |
| 50 | Modifier invalid | 1% | After-hours on weekday afternoon | Remove/correct modifier |
| 55 | Referral missing | 2% | Specialist seen without GP referral (restricted plan) | Get referral letter |

### 3.3 Scheme-Specific Adjudication Differences

**Discovery Health (strictest):**
- 78% auto-adjudication via FICO Blaze Advisor
- Mandates 4th character ICD-10 specificity on all claims
- Known for post-payment clawbacks months/years later
- KeyCare/Delta plans: mandatory GP network referral for specialists
- Vitality integration: wellness screenings have specific modifier requirements
- Rejection codes: 59 (tariff incorrect), 02 (account required), 04 (auth letter), 54 (illegible)
- Most claims go through Healthbridge switch

**GEMS (second strictest):**
- 9-digit membership numbers (leading zeros catch errors — omitting zeros = rejection)
- 60-day dispute turnaround (longest of any scheme)
- State facilities as DSP for in-hospital on lower options (Sapphire, Beryl)
- Strict PMB interpretation — conservative on what qualifies
- Claims routed through SwitchOn
- Maternity registration required by 14 weeks gestation
- Missed appointments: explicitly NOT covered

**Bonitas:**
- 4-tier formulary (A-D): off-formulary = 30% co-payment, not full rejection
- Mandatory GP referral for specialists on Standard/Standard Select plans
- BonComprehensive covers 61 chronic conditions (vs standard 27 CDL)
- Transitioning administrator from Medscheme to Momentum Health Solutions (June 2026)
- Claims routed through Healthbridge

**Momentum Health:**
- Strictest pre-auth requirements: all hospital, MRI/CT/PET/MRCP, oncology, rehab
- PMB claims require practice letter requesting PMB — more manual than other schemes
- Contact: 0860 117 859

### 3.4 CDL/PMB Routing Logic

When the adjudication engine encounters a CDL or PMB claim, the routing changes fundamentally:

```
CDL CLAIM ROUTING:
  ICD-10 matches CDL condition? (27 conditions)
    → YES:
        CDL authorization on file?
          → YES: Route to Chronic Benefit pool → pay within formulary
          → NO: PEND → request CDL application
        Medication on formulary?
          → YES: Pay in full (no co-payment at DSP)
          → NO: Pay generic reference price → member pays brand differential
        Dispensing within 28/30-day limit?
          → YES: Process normally
          → NO: Reject quantity → clerk must correct

PMB CLAIM ROUTING (270 DTPs):
  ICD-10 matches DTP condition?
    → YES:
        At DSP?
          → YES: Pay in FULL. No co-payment. No deductible. Override benefit limits.
          → NO:
              DSP exists for this service?
                → YES: Pay at DSP rate. Member pays shortfall.
                → NO: Pay in FULL at any provider (Genesis ruling 2015).
        Emergency?
          → ALWAYS pay in full. Any provider. No pre-auth required.
        Override waiting period? → YES (PMBs exempt from waiting periods)
        Override benefit exhaustion? → YES (PMBs paid from risk pool, not savings)
        Pay from PMSA? → NEVER (Regulation 10(6))
```

### 3.5 Pre-Authorization Workflows

| Service Category | Pre-Auth Required? | How to Obtain | Turnaround |
|-----------------|-------------------|---------------|------------|
| Elective hospital admission | YES — all schemes | Submit via scheme portal/call centre: ICD-10, procedure codes, hospital BHF, estimated LOS | 48 hours before admission |
| Emergency admission | Retrospective within 24-48hrs | Notify scheme within 48hrs of admission | Immediate telephonic notification |
| MRI scan | YES | Clinical motivation + ICD-10 + scan type | 2-3 working days |
| CT scan | YES | Clinical motivation + ICD-10 + scan type | 2-3 working days |
| PET scan | YES | Clinical motivation + ICD-10 + specialist letter | 3-5 working days |
| Elective surgery | YES | ICD-10 + procedure code + surgeon + anaesthetist BHF + hospital | 3-5 working days |
| Oncology (all) | YES (always) | Staging, histology, treatment protocol | 5 working days |
| Physiotherapy >6 sessions | YES | Treatment plan + progress notes | 1-2 working days |
| Psychology >6 sessions | YES | Treatment plan + diagnostic assessment | 2-3 working days |
| Chronic medication initiation | CDL application | ICD-10 + treatment protocol + supporting bloods | 5-10 working days |

---

## PART 4: PSYCHOLOGY OF ERRORS

---

### 4.1 Why Doctors Submit R-Codes as Primary Diagnosis

R-codes (R00-R99: Symptoms, signs and abnormal clinical/laboratory findings) are the single largest source of claim disputes. Here is why doctors use them:

**Reason 1 — Genuine Diagnostic Uncertainty (40% of R-code usage):**
- Patient presents with headache (R51). Doctor does not yet know if it's migraine (G43), tension-type (G44.2), or sinusitis (J01). The R-code is CLINICALLY CORRECT at this stage.
- Patient presents with fever (R50.9) and cough (R05). Could be viral URTI (J06.9), pneumonia (J18.9), or TB (A15). Before investigation results, R-code is appropriate.
- **AI should accept**: First-visit R-codes are valid. Flag R-codes only on follow-up visits for the same complaint where a definitive diagnosis should have been established.

**Reason 2 — Time Pressure (30% of R-code usage):**
- GP has 30 patients waiting. Selecting J06.9 requires thinking about which specific respiratory code. R05 (cough) is faster.
- The PMS search may surface R-codes before specific diagnoses (e.g., typing "cough" shows R05 before J06.9).
- **AI should flag**: Repeated R-code usage for the same patient where clinical workup has been completed.

**Reason 3 — Avoiding ECC Requirements (15% of R-code usage):**
- Doctor sees a patient with hand laceration. The correct code is S61.0 + W26 (contact with knife). But S-codes REQUIRE an ECC.
- To avoid the ECC requirement, some doctors code the wound as T14.1 (wound, unspecified) or even L97 (non-pressure ulcer) to dodge the system.
- **THIS IS A RED FLAG** — converting injury codes to medical codes to avoid ECC is considered a form of billing fraud by CMS.

**Reason 4 — Investigation-Driven Encounters (15% of R-code usage):**
- Patient comes for blood test results or radiology results. No new diagnosis made. Doctor codes R69 (Unknown/unspecified causes of morbidity).
- This is legitimately tricky — what ICD-10 do you use for "reviewing blood results"? Options: Z01.7 (laboratory examination), Z71.3 (dietary counselling), or the original diagnosis that prompted the investigation.

### 4.2 Why GPs Bill Specialist Tariffs

This is one of the most misunderstood billing patterns. A GP billing "specialist" codes is not necessarily fraud:

**Legitimate Reasons:**
- **Minor surgical procedures ARE within GP scope**: A GP can suture a wound (0515), excise a skin lesion (0700), drain an abscess (0710), perform a joint injection (0890). These are procedure codes, not "specialist" codes.
- **Pathology and radiology ordering**: GPs legitimately order and bill for blood draws (4001), in-room tests, and X-ray referrals. The pathology code is the same regardless of who orders it.
- **ECG in rooms**: A GP performing and interpreting an ECG in their rooms bills 1211. This is a procedure, not a specialist consultation.

**Illegitimate Patterns:**
- GP billing specialist consultation codes (0141-0149 instead of 0190-0197) — discipline mismatch
- GP billing surgical assistant fees (modifier 0015) without an actual surgery
- GP billing anaesthetic codes — GPs cannot administer general anaesthesia

**The AI distinction**: Tariff codes in the 0100-0399 consultation range have discipline-specific versions. Procedure codes (0400+) can often be billed by any qualified practitioner who performs them. The check should be: "Is this PROCEDURE within GP scope?" not "Is this code in the specialist section?"

### 4.3 Why Amounts Exceed Scheme Rates

This is NOT a billing error in most cases. It is the legal reality of SA healthcare:

**The Legal Background:**
- Since the NHRPL was invalidated in 2010, there is NO national tariff in SA
- Each scheme sets its own rates based on 2006 NHRPL × annual CPI escalation
- Doctors are legally entitled to charge more than the scheme rate
- The difference (shortfall) is the patient's responsibility
- This is NOT billing fraud — it is the healthcare economics of SA

**Why Amounts Differ:**
| Reason | Example | AI Action |
|--------|---------|-----------|
| Practice rate > scheme rate | GP charges R580 for 0191, scheme pays R480 | INFO only — patient pays R100 shortfall |
| After-hours premium | 0191 + modifier 0011 = R580 × 1.5 = R870 | VALIDATE modifier is appropriate for time of day |
| Specialist premium | Cardiologist charges R1,800 for 0141, scheme pays R1,200 | INFO only — legal in SA |
| Materials markup | NAPPI consumables marked up > SEP | WARNING — SEP + dispensing fee is the legal maximum for medicines |
| Intentional uplift | Amounts consistently 300%+ of scheme rate | RED FLAG — possible abuse, but still legal unless misrepresentation |

**CRITICAL for AI**: "Amount exceeds scheme rate" should NEVER be a rejection-level flag. It should be INFO level. The only amount-related rejection should be: NAPPI price > SEP + dispensing fee (which is a legal ceiling for medicines, not for professional services).

### 4.4 Why Dependent Codes Don't Match Age

This is a common misunderstanding in claims validation:

**How dependent codes work in SA:**
- 00 = principal member (the person who pays)
- 01 = first dependent registered (usually spouse)
- 02 = second dependent (usually first child)
- 03-09 = additional dependents

**The codes are sequential by registration order, NOT by age.** A 45-year-old spouse can be dependent 01 while a 20-year-old child is dependent 02. There is NO expected correlation between dependent code number and age.

**Common AI false positive**: "Dependent 05 is 2 years old — suspicious" — this just means the child was the 5th person registered on the plan (after principal + spouse + 3 older children). Perfectly normal.

**What IS suspicious:**
- Dependent over 21 (usually 24 for students) who is not a disabled child → may have aged off the plan
- Dependent under 12 with a listed occupation → data quality issue
- Principal member under 18 → unusual (except emancipated minors)

### 4.5 Common Billing Psychology by Practice Type

| Practice Type | Billing Pattern | Why | AI Sensitivity |
|--------------|----------------|-----|----------------|
| **Solo GP (high volume)** | High 0191 frequency, limited pathology, few procedures | Time-pressured, cost-conscious, conservative billing | Low sensitivity — these are the most "normal" claims |
| **GP group practice** | Mix of 0190-0193, more procedures, better coding | More infrastructure, dedicated billing clerk, PMS training | Medium sensitivity |
| **Specialist rooms** | High-value consults (0141-0143), pre-auth procedures | Expects scheme pushback on tariffs, often over scheme rate | High sensitivity for pre-auth compliance |
| **Day hospital / theatre** | Bundled surgical + anaesthetic + facility fees | Complex multi-provider billing, modifier-heavy | Very high — bundling rules critical |
| **Pharmacy** | NAPPI-heavy, chronic repeats, DUR compliance | Formulary matters most, SEP ceiling, CDL auth | Medium — formulary and auth validation |
| **Allied health (physio, psycho)** | Session count, ICD-10 specificity, auth thresholds | Hit session limits frequently, need auth extensions | High — session limit monitoring |

---

## PART 5: SOUTH AFRICAN SPECIFIC CONTEXT

---

### 5.1 HPCSA Ethical Billing Guidelines

The Health Professions Council of South Africa (HPCSA) governs practitioner billing through several key documents:

**HPCSA Booklet 20 — Coding and Billing:**
- Practitioners must use appropriate ICD-10 codes that accurately reflect the diagnosis
- Tariff codes must reflect services actually rendered
- Practitioners must not code for services not personally provided (except under supervision)
- "No patient may be charged for a service not rendered" (the cornerstone anti-fraud rule)
- Practitioners must keep clinical records that support every billed item

**HPCSA Guidelines on Fees (2012 update):**
- Suggested fee = 2006 NHRPL rate × 1.4666 (46.66% escalation from 2006 to 2012)
- This is a GUIDELINE, not a binding tariff
- Practitioners may charge more but must inform patients in advance of expected shortfall
- "Informed financial consent" before consultation is ethically required

**Key Ethical Violations:**
| Violation | HPCSA Rule | Penalty |
|-----------|-----------|---------|
| Billing for services not rendered | Booklet 20, Rule 10 | Fine, suspension, erasure |
| Upcoding (higher tariff than service justifies) | Booklet 20, Rule 12 | Fine, suspension |
| Unbundling (billing components separately) | Booklet 20, Rule 14 | Fine, audit |
| Balance billing PMB patients at DSP | Medical Schemes Act s 49 | Fine, deregistration from scheme |
| Not maintaining adequate clinical records | HPCSA Rule 15 | Investigation, fine |
| Operating outside scope of practice | HPCSA Act, specific scopes | Suspension, criminal liability |

### 5.2 Council for Medical Schemes (CMS) Rules

The CMS is the regulator of all medical schemes in SA, operating under the Medical Schemes Act 131 of 1998.

**Key CMS Rules Affecting Claims:**

| Rule | Description | Practical Impact |
|------|-------------|-----------------|
| **Section 26** | Prescribed Minimum Benefits MUST be covered | Schemes cannot reject PMB claims for benefit exhaustion or waiting period |
| **Section 29** | Contributions may not unfairly discriminate | Age/sex rating allowed, but NOT health status or claims history |
| **Section 49** | No co-payment for PMBs at DSP | Scheme AND provider must ensure zero co-pay for PMB at DSP |
| **Section 59** | Schemes may investigate fraud | But must follow fair process (s59 investigation) — see below |
| **Regulation 8** | PMB treatment must be evidence-based | Treatments must align with published clinical guidelines |
| **Regulation 10(6)** | PMBs may NOT be paid from PMSA | Risk pool only — crucial for benefit routing |

**Section 59 Investigations (Critical Context):**
- April 2025: Advocate Ngcukaitobi's investigation found systemic racial discrimination in fraud investigations at Discovery, GEMS, and Medscheme
- Location-based scoring resulted in 2-3x higher investigation probability for Black practitioners in township/rural practices
- AI claims systems MUST implement bias safeguards (see fraud detection section)
- Every flag must have an explainable, auditable reason — no single-metric flags

### 5.3 Medical Schemes Act 131 of 1998 — Key Provisions

| Section | Provision | Claims Impact |
|---------|-----------|--------------|
| s1 | Definitions (incl. "dependant" — note SA spelling) | Dependent codes 00-09 |
| s24 | Minimum benefits prescribed by Minister | PMB framework |
| s26 | PMBs detailed — payment at cost, no co-payment at DSP | Claims routing |
| s29 | Non-discrimination in contributions | Rating rules |
| s30 | Governance | Scheme board accountability |
| s49 | Service provider agreements (DSP) | Network billing rules |
| s57 | Member complaints to CMS | Appeals escalation path |
| s59 | Investigations into fraud | FWA investigation framework |

**Regulation Annexure A:**
- Lists all 270 DTP conditions with treatment protocols
- Specifies which services MUST be covered as PMB
- Used by schemes to determine PMB eligibility during adjudication
- Updated periodically — last major revision 2022

### 5.4 PHISC MEDCLM Specification for EDI Claims

The PHISC (Private Health Industry Standards Committee) MEDCLM specification is the national standard for electronic claims submission in SA.

**Technical Details:**
- Based on UN/EDIFACT (United Nations Electronic Data Interchange for Administration, Commerce and Transport)
- SA adaptation: version 0:912:ZA (version 0, message type 912, country ZA)
- Current working version: v0-912-13.4

**Message Structure:**
```
UNA:+.?*'                    — Service string (separator definition)
UNB+...+sender+receiver+date+ref'  — Interchange header
  UNH+ref+MEDCLM:0:912:ZA'       — Message header
  BGM+code+doc_ref+doc_type'       — Document type (new claim / resubmission / reversal)
  DTM+date_qualifier:date:format'  — Date segments
  NAD+qualifier+id::scheme+name'   — Name/address (provider, member, scheme)
  RFF+ref_qualifier:ref_number'    — Reference (auth number, referral number)
  GRP1 — Provider details
    PVD+practice_number+hpcsa_number+discipline'
  GRP3 — Patient encounter
    MEM+membership_number+dependent_code'
    DTM+service_date'
    DIA+icd10_code+sequence'       — Diagnosis codes (primary + secondary)
  GRP4 — Service line items
    CLM+tariff_code+modifier+amount+quantity'
    NAP+nappi_code+nappi_amount'   — Medicine codes (if applicable)
  UNT+segment_count+ref'          — Message trailer
UNZ+message_count+ref'             — Interchange trailer
```

**Key MEDCLM Rules:**
- Amounts: implied 2 decimal places, no commas, right-justified, not zero-filled
- ICD-10: up to 10 codes per claim line (1 primary + 9 secondary)
- Modifiers: appended to tariff code with separator
- Character encoding: ASCII (no special characters in clinical text)
- Transport: HTTPS/TLS to switching house endpoint
- Response: same format with acceptance/rejection per line item

### 5.5 BHF Practice Number Structure

The Board of Healthcare Funders (BHF) assigns practice numbers via the Practice Code Numbering System (PCNS):

**Format:** 7 digits: `DDNNNNN`
- **DD** = Discipline prefix (2 digits)
- **NNNNN** = Sequential number (5 digits)

**Discipline Prefix Table:**

| Prefix | Discipline | Tariff Section |
|--------|-----------|---------------|
| 01 | General Medical Practitioner | 0190-0199 |
| 02 | Physician (Internal Medicine) | 0141-0149 |
| 03 | Paediatrician | 0141-0149 |
| 04 | Surgeon (General) | 0141-0149 + surgical |
| 05 | Cardiothoracic Surgeon | Surgical |
| 06 | Neurosurgeon | Surgical |
| 07 | Plastic & Reconstructive | Surgical |
| 08 | Urologist | Surgical |
| 09 | Gynaecologist/Obstetrician | 0141-0149 + O&G |
| 10 | Ophthalmologist | 0141-0149 + ophthalmic |
| 11 | Orthopaedic Surgeon | Surgical |
| 12 | ENT Surgeon | Surgical |
| 13 | Dermatologist | 0141-0149 |
| 14 | GP (additional category) | 0190-0199 |
| 15 | Physician (additional) | 0141-0149 |
| 16 | Psychiatrist | 0141-0149 |
| 17 | Anaesthetist | Anaesthetic codes |
| 18 | Radiologist | Radiology codes |
| 19 | Pathologist | Pathology codes |
| 20 | Nuclear Medicine | Nuclear medicine |
| 21 | Radiation Oncologist | Oncology |
| 22 | Medical Oncologist | Oncology |
| 36 | Physiotherapist | 6001-6099 |
| 40 | Dental General | 8100-8899 |
| 41 | Dental Specialist | 8100-8899 |
| 50 | Clinical Psychologist | 6400-6499 |
| 51 | Counselling Psychologist | 6400-6499 |
| 55 | Occupational Therapist | 6100-6199 |
| 56 | Speech Therapist | 6200-6299 |
| 60 | Optometrist | Optometry codes |
| 70 | Pharmacist | NAPPI dispensing |
| 80-89 | Hospitals/Facilities | Facility fees |
| 90 | Ambulance/Emergency | Emergency codes |

**Validation Logic:**
```
Practice number: 0112345
  → Prefix 01 = GP
  → Valid consultation tariffs: 0190-0199
  → Valid procedures: GP scope (minor surgical, pathology ordering, ECG)
  → INVALID: Specialist consultation codes (0141-0149)
  → INVALID: Major surgical codes (unless in GP scope — excision, suture)
```

**Common AI pitfall**: Prefixes 01 and 14 BOTH mean GP. Don't reject a practice number starting with 14 for billing GP tariffs.

---

## PART 6: DECISION FRAMEWORKS FOR AI CLAIMS VALIDATION

---

### 6.1 The "What Would a Reasonable Clerk Do?" Test

Before flagging any claim, the AI should ask: "Would a competent billing clerk with 5 years experience flag this?" This prevents over-flagging legitimate patterns.

**Claims that pass the clerk test (should NOT be flagged):**
- GP billing 0191 for URTI (J06.9) — most common claim in SA
- I10 without 4th character — I10 IS the complete code
- Amount R100 above scheme rate — normal shortfall
- R51 (headache) as primary on first visit — genuinely uncertain
- Multiple ICD-10 codes on a chronic review — multi-morbidity is normal
- CDL condition without CDL auth number on first encounter — auth takes time

**Claims that fail the clerk test (SHOULD be flagged):**
- S61.0 (hand wound) without any ECC — clerk should have caught this
- Male patient with O-code — obvious data entry error
- Claim from 6 months ago — past filing deadline
- Same patient + same date + same code as existing claim — duplicate
- NAPPI code that doesn't exist — data entry error

### 6.2 The "GP vs Specialist" Scope Matrix

| Tariff Range | GP Can Bill? | Specialist Can Bill? | Notes |
|-------------|-------------|--------------------|----|
| 0190-0199 (GP consults) | YES | NO | GP-specific codes |
| 0141-0149 (Specialist consults) | NO | YES | Specialist-specific codes |
| 0401-0407 (Minor procedures) | YES | YES | Within scope of any qualified practitioner |
| 0515-0520 (Wound repair) | YES | YES | Common GP procedure |
| 0700-0750 (Skin excision) | YES | YES | In-room procedure |
| 1211 (ECG) | YES | YES | GP can perform and interpret |
| 3601 (Chest X-ray) | NO (order only) | NO (radiologist reads) | GP orders, radiologist bills prof fee |
| 3901 (CT scan) | NO | NO (radiologist) | Requires pre-auth + radiologist |
| 4014-4090 (Pathology) | YES (order) | YES (order) | Lab bills directly, GP can order |
| 5033 (Spirometry) | YES | YES | In-room procedure |
| 6001 (Physiotherapy) | NO | Physio only (prefix 36) | Discipline-specific |
| 8100-8899 (Dental) | NO | Dentist only (prefix 40/41) | Discipline-specific |

### 6.3 Severity Classification Framework

| Severity | Definition | AI Action | Examples |
|----------|-----------|-----------|---------|
| **ERROR** (hard reject) | Claim will definitely be rejected by scheme | Block submission, require correction | Missing ICD-10, gender mismatch, future date, injury without ECC, asterisk as primary |
| **WARNING** (likely problem) | Claim may be rejected or is clinically questionable | Alert user, suggest correction | Missing CDL auth, above scheme tariff, R-code on follow-up, suspect bundling |
| **INFO** (awareness only) | Legal/valid claim but worth noting | Inform only, no action required | Amount above scheme rate, PMB condition detected, CDL eligibility, first-visit R-code |

### 6.4 False Positive Prevention Rules

The AI MUST implement these rules to avoid flagging legitimate claims:

1. **I10, B20, G35, R10-R69 at 3 characters**: These ARE complete codes. Do not flag for "missing specificity."
2. **GP billing pathology/radiology/ECG/minor procedure**: GPs legitimately bill these. Check scope, not discipline.
3. **Amount above scheme rate**: Legal in SA. INFO only, never ERROR.
4. **R-codes on first visit**: Clinically appropriate for undifferentiated presentations.
5. **Multiple ICD-10 codes on single visit**: Multi-morbidity is normal, especially in chronic patients.
6. **Dependent code number vs patient age**: No correlation expected (sequential registration order).
7. **After-hours modifier on public holiday**: Verify against public holiday calendar, not just day-of-week.
8. **CDL condition without immediate auth**: Authorization takes 5-10 working days — first encounter may not have it.
9. **GP referring to themselves for lab work**: GPs are the treating AND ordering provider for their own patients.
10. **Consultation + procedure on same day**: Valid with modifier 0021 (decision for surgery) or if procedure is unrelated to consultation diagnosis.

---

## APPENDIX A: QUICK REFERENCE — TOP 50 GP DIAGNOSIS CODES (SA)

| # | ICD-10 | Description | CDL? | Notes |
|---|--------|-------------|------|-------|
| 1 | J06.9 | Acute URTI, unspecified | No | Most common GP code |
| 2 | I10 | Essential hypertension | CDL | 3-char is COMPLETE |
| 3 | E11.9 | Type 2 diabetes, unspecified | CDL | .9 acceptable, but specify complications when known |
| 4 | M54.5 | Low back pain | No | Consider M54.1 (radiculopathy) if radiating |
| 5 | J20.9 | Acute bronchitis, unspecified | No | |
| 6 | R50.9 | Fever, unspecified | No | Valid for first visit |
| 7 | J45.9 | Asthma, unspecified | CDL | Specify J45.0-J45.8 on follow-up |
| 8 | N39.0 | UTI, site not specified | No | |
| 9 | K29.7 | Gastritis, unspecified | No | |
| 10 | Z00.0 | General examination | No | Not covered on all plans |
| 11 | E78.5 | Hyperlipidaemia, unspecified | CDL | |
| 12 | J02.9 | Acute pharyngitis, unspecified | No | |
| 13 | L30.9 | Dermatitis, unspecified | No | Specify type on follow-up |
| 14 | R05 | Cough | No | Valid for undifferentiated |
| 15 | K21.0 | GERD with oesophagitis | No | |
| 16 | J03.9 | Acute tonsillitis, unspecified | No | |
| 17 | R51 | Headache | No | Consider G43 (migraine) if recurrent |
| 18 | J44.1 | COPD with acute exacerbation | CDL | |
| 19 | B34.9 | Viral infection, unspecified | No | |
| 20 | K52.9 | Non-infective gastroenteritis | No | |
| 21 | A09 | Infectious gastroenteritis | No | |
| 22 | H66.9 | Otitis media, unspecified | No | |
| 23 | R10.4 | Other abdominal pain | No | |
| 24 | M79.3 | Panniculitis/soft tissue | No | |
| 25 | G43.9 | Migraine, unspecified | No | |
| 26 | H10.9 | Conjunctivitis, unspecified | No | |
| 27 | L02.9 | Cutaneous abscess | No | |
| 28 | J18.9 | Pneumonia, unspecified | No | Consider CXR |
| 29 | N76.0 | Vaginitis | No | |
| 30 | R11 | Nausea and vomiting | No | |
| 31 | F32.9 | Depressive episode, unspecified | CDL (F32/33) | |
| 32 | F41.9 | Anxiety disorder, unspecified | No | |
| 33 | B20 | HIV disease | CDL | 3-char is COMPLETE |
| 34 | E03.9 | Hypothyroidism, unspecified | CDL | |
| 35 | G40.9 | Epilepsy, unspecified | CDL | |
| 36 | R52 | Pain, unspecified | No | Specify site if possible |
| 37 | L50.9 | Urticaria, unspecified | No | |
| 38 | J01.9 | Acute sinusitis, unspecified | No | |
| 39 | B37.3 | Vaginal candidiasis | No | |
| 40 | K30 | Dyspepsia | No | |
| 41 | R06.0 | Dyspnoea | No | Investigate if persistent |
| 42 | Z01.7 | Laboratory examination | No | For results review visit |
| 43 | M75.1 | Rotator cuff syndrome | No | |
| 44 | H65.9 | Serous otitis media | No | |
| 45 | E66.9 | Obesity, unspecified | CDL (programme) | |
| 46 | N18.9 | Chronic kidney disease, unsp | CDL | |
| 47 | I25.9 | Chronic IHD, unspecified | CDL | |
| 48 | J45.0 | Predominantly allergic asthma | CDL | |
| 49 | S61.0 | Open wound of finger(s) | No | MUST have ECC |
| 50 | W26 | Contact with knife/sword | ECC | External cause for S61.0 |

---

## APPENDIX B: SEASONAL REJECTION PATTERN CALENDAR

| Month | Rejection Risk | Key Driver | AI Sensitivity Adjustment |
|-------|---------------|-----------|--------------------------|
| January | HIGH (+15-25%) | New benefit year, plan changes, system updates | Lower sensitivity — allow transition period |
| February | Elevated | Late Jan claims processing, rule changes bedding down | Normal |
| March | Normal | Systems stable | Normal |
| April-June | LOW | Mid-year stability, benefits available | Normal |
| July | Minor spike | Mid-year scheme adjustments | Normal |
| August-September | Rising | Benefits depleting, MSA running low | Increase PMB awareness |
| October | Elevated | Benefit exhaustion approaching | Flag PMB eligibility proactively |
| November | HIGH (+10-20%) | Benefit exhaustion peak, year-end rush | Increase PMB flagging, warn on filing deadlines |
| December | HIGHEST | Filing deadline crunch, benefit exhaustion, locum providers | Maximum alerts on filing deadline, PMB routing |

---

## APPENDIX C: COMPLETE REJECTION CODE REFERENCE

### Standard BHF Adjustment Codes (Extended)

| Code | Description | Correctable? | Typical Fix |
|------|-------------|-------------|-------------|
| 01 | Member not found | Yes | Correct membership number |
| 02 | Doctor's account required | Yes | Supply documentation |
| 03 | Dependent code invalid | Yes | Correct dependent code |
| 04 | Member suspended | No (admin) | Patient resolves with scheme |
| 05 | Duplicate claim | No | Verify not already paid |
| 06 | Not scheme liability (RAF/COIDA) | No | Bill correct insurer |
| 07 | Benefit exhausted | Conditional | PMB motivation if applicable |
| 08 | Pre-authorization missing | Yes | Apply retrospectively |
| 09 | Service not covered/excluded | No | Patient pays |
| 10 | Provider not on network | No | Patient pays co-payment |
| 11 | Past filing deadline (120 days) | No | Almost never overturned |
| 12 | ICD-10 code invalid | Yes | Correct code, resubmit |
| 13 | Amount above scheme tariff | Partial | Accept partial or motivate |
| 14 | Co-payment applied | No | Not a full rejection |
| 15 | Waiting period applies | Conditional | PMB overrides waiting period |
| 17 | Tariff code invalid/incorrect | Yes | Correct code |
| 20 | Frequency limit exceeded | Conditional | Motivate medical necessity |
| 22 | Bundling/unbundling adjustment | Partial | Rebill correctly |
| 25 | Missing external cause code | Yes | Add ECC (V01-Y98) |
| 30 | Pended for clinical review | Conditional | Supply clinical notes |
| 35 | NAPPI code invalid/inactive | Yes | Correct NAPPI code |
| 40 | Chronic authorization missing/expired | Yes | Submit CDL application/renewal |
| 45 | Age/gender mismatch | Yes | Correct code or patient data |
| 50 | Modifier invalid | Yes | Remove or correct modifier |
| 55 | Referral missing | Yes | Obtain GP referral letter |

---

## SOURCES

- CMS Annual Report 2024/25
- CMS Industry Report 2024
- Medical Schemes Act 131 of 1998 (full text)
- Medical Schemes Regulations (Annexure A — PMB DTPs)
- HPCSA Booklet 20: Coding and Billing Guidelines
- HPCSA Guideline Tariffs (2012 update)
- PHISC MEDCLM Specification v0-912-13.4
- SA ICD-10 Coding Standards V3 (MIT 2014)
- SEMDSA Type 2 Diabetes Guidelines (4th Edition, 2017)
- SASHA Hypertension Practice Guideline (2014)
- SA Thoracic Society Asthma Position Statement (2021)
- GINA Strategy Report (2024, SA-adapted)
- SA DoH National ART Guidelines (2023)
- SA DoH TB Guidelines (2023)
- BHF Practice Code Numbering System (PCNS) specification
- Competition Commission Health Market Inquiry — Funders and Practitioners Reports (2019)
- CMS Section 59 Investigation (Adv Ngcukaitobi, April 2025)
- Discovery Health Provider Manual (2025)
- GEMS Provider Guide (2025)
- Bonitas Provider Guide (2025)
- Healthbridge Claims Processing Documentation
- MediKredit Technical Documentation
- National STG/EML (8th Edition, 2024)
- NHRPL Medical Practitioners (2006)
