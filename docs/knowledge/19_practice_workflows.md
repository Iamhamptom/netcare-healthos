# 19 — End-to-End Practice Workflows: Patient Journey to Payment
## VisioCorp Health Intelligence KB | Compiled 2026-03-21

---

## PART A: GP PRACTICE — FULL PATIENT JOURNEY

---

### 1. PATIENT ARRIVAL & RECEPTION WORKFLOW

#### Walk-In / Appointment Arrival
```
Patient arrives
  → 1. Greet, confirm identity (SA ID / passport)
  → 2. New patient? → Full registration (demographics, next of kin, employer, medical aid details)
  → 3. Returning patient? → Verify details still current (address, contact, medical aid plan changes)
  → 4. Capture/scan medical aid card (front and back)
  → 5. Extract: Scheme name, plan/option, membership number, dependent code (00=principal, 01-09=dep)
```

#### Real-Time Benefit Verification (via Switch)
```
Reception sends eligibility query through PMS → Switch (MediSwitch/Healthbridge)
  → Query contains: Membership number + Dependent code + DOS + Provider BHF number
  → Switch routes to scheme → Scheme responds within 2-5 seconds

Response contains:
  - Member active: YES/NO
  - Dependent registered: YES/NO
  - Plan/option name
  - Benefit category balances (MSA remaining, day-to-day, chronic, hospital)
  - Waiting period status (general 3-month, condition-specific 12-month)
  - Co-payment indicators (network status of this provider)
  - Outstanding premiums flag
```

#### Key Reception Decisions
| Scenario | Action |
|----------|--------|
| Member active, benefits available | Proceed to consultation |
| Member active, MSA depleted | Inform patient of self-payment gap; collect estimated co-pay upfront |
| Member in waiting period | Inform patient; check if PMB condition (overrides waiting period) |
| Membership lapsed / premiums in arrears | Patient pays cash; advise to contact scheme |
| No medical aid (cash patient) | Quote consultation fee upfront; collect payment before or after consult |
| Wrong provider network | Inform patient of non-DSP co-payment (typically 20-40% surcharge) |

#### Co-Payment Collection at Reception
- **Cash patients**: Full fee collected (card/cash/EFT)
- **Medical aid with co-pay**: Estimated co-pay collected upfront based on benefit check
- **Non-DSP patients**: Inform of shortfall; some practices collect estimated shortfall upfront
- **Receipt issued** for all payments (SARS-compliant for tax certificate claims)

#### Systems Used by Reception
- **Practice Management Software (PMS)**: GoodX, Healthbridge Elixir, Health Focus Eminance, MeDAP, EZMed, Medinol, Navitas, iMedPrac
- **Switching connection**: MediSwitch and/or Healthbridge (integrated into PMS)
- **Card machine**: Yoco, iKhokha, or bank-issued (for co-pays and cash patients)
- **Appointment book**: Digital (PMS calendar) or physical diary

---

### 2. CONSULTATION & CLINICAL DOCUMENTATION

#### What MUST Be Recorded for Valid Claims
```
Minimum clinical documentation (HPCSA + scheme requirements):
  1. Date of service
  2. Patient demographics (name, DOB, ID number)
  3. Presenting complaint / reason for visit
  4. Relevant history (medical, surgical, family, social — as appropriate)
  5. Examination findings (vitals: BP, pulse, temp, weight at minimum)
  6. Assessment / Diagnosis — mapped to ICD-10 code(s)
  7. Plan: Treatment, prescriptions, referrals, follow-up
  8. Duration of consultation (determines tariff code level)
  9. Procedures performed (if any) — mapped to CCSA tariff code(s)
```

#### Consultation Level Selection (GP)
| Code | Duration | Complexity | When to Use |
|------|----------|------------|-------------|
| 0190 | <10 min | Brief | Simple follow-up, script renewal, single complaint |
| 0191 | 10-20 min | Intermediate | Standard consultation, examination + diagnosis |
| 0192 | 20-30 min | Comprehensive | Multiple complaints, new chronic diagnosis, complex history |
| 0193 | >30 min | Extended | Complex multi-system, counselling-heavy, chronic review |
| 0194 | — | Follow-up (brief) | Quick post-procedure or result review |
| 0197 | — | Telehealth | Audio/video consultation |

#### Additional Billable Items During Consultation
- **Procedures in rooms**: ECG (1211), spirometry (5033), nebulisation (5034), wound suturing (0515-0520), excision of lesion (0700-0750)
- **Injections**: IM/IV injection (0146 modifier), joint injection (0890)
- **Materials used**: Suture material, dressings, consumables (NAPPI codes)
- **Specimen collection**: Blood draw (4001), urine dip (4400)

---

### 3. PRESCRIBING & E-PRESCRIBING WORKFLOW

#### Prescription Requirements (Medicines Act, Regulation 28)
Every prescription must contain:
1. Prescriber name, qualification, practice address, BHF number, HPCSA number
2. Patient name, address, date of birth/age
3. Date of prescription
4. Medication: approved name (INN), strength, dosage form, quantity, dosage instructions
5. Number of repeats (if any) — maximum determined by schedule
6. Prescriber signature (handwritten or digital)
7. For S5: "Schedule 5" must appear on script
8. For S6: "Schedule 6" must appear; no repeats allowed; max 30-day supply

#### E-Prescribing Workflow
```
Doctor prescribes in PMS/EMR
  → System suggests from NAPPI database (drug name, strength, form)
  → DUR check runs (interactions, allergies, duplications)
  → Doctor selects/confirms → Electronic script generated
  → Script transmitted to pharmacy via:
      Option A: EMGuidance Script (prescriber → pharmacy electronically)
      Option B: CGM Advanced eScripts
      Option C: Scriptpharm network (DSP pharmacy routing)
      Option D: Printed/PDF script to patient (carries to pharmacy)
  → Pharmacy receives → Validates authenticity → Dispenses
```

#### Key E-Prescribing Platforms in SA
| Platform | Function |
|----------|----------|
| **EMGuidance Script** | Prescriber-to-pharmacy electronic transmission |
| **CGM Advanced eScripts** | Full e-prescribing with clinical decision support |
| **Scriptpharm** | DSP pharmacy network + prescription routing |
| **MediKredit DUR** | Real-time drug utilisation review during claim |

#### Prescription Validity
| Schedule | Validity | Repeats |
|----------|----------|---------|
| S1-S2 | No script required | N/A |
| S3 | 6 months | Up to 5 repeats |
| S4 | 6 months | Up to 5 repeats |
| S5 | 6 months | Up to 5 repeats (register entry required) |
| S6 | 6 months | **NO repeats** (new script each time, max 30-day supply) |

---

### 4. BILLING & CLAIM CREATION

#### Step-by-Step Claim Assembly
```
1. PATIENT HEADER
   - Membership number + dependent code
   - SA ID number (for DOB/gender validation)
   - Date of service

2. PROVIDER HEADER
   - BHF practice number (7 digits)
   - HPCSA registration number
   - Discipline code (01/14 = GP)
   - Treating provider vs billing practice (if different)

3. LINE ITEMS (each line = one billable service)
   For each line:
   a. CCSA tariff code (4 digits, e.g., 0191)
   b. ICD-10 code(s) — primary diagnosis MUST be linked to every line
      - Up to 5 ICD-10 codes per line (primary + up to 4 secondary)
      - Primary must have Valid_ICD10_Primary = Y
      - Injury codes (S/T) MUST include external cause (V01-Y98)
   c. Modifier code(s) — if applicable (after-hours 0146, emergency, etc.)
   d. Quantity (usually 1 for consultations; variable for procedures)
   e. Amount charged (in Rands and cents)
   f. NAPPI code — for medicines/materials dispensed (7+3 digits)
   g. NAPPI amount — must not exceed SEP + dispensing fee + VAT

4. VALIDATION (PMS runs pre-submission checks)
   - ICD-10 exists in SA MIT and is valid for clinical use
   - Tariff code exists and matches provider discipline
   - ICD-10/tariff combination is clinically plausible
   - Amounts within scheme tariff range
   - No duplicate of recently submitted claim
   - Gender/age appropriate codes
```

#### Common GP Claim Scenarios
| Visit Type | Tariff | ICD-10 | Modifier | Notes |
|-----------|--------|--------|----------|-------|
| Standard consult | 0191 | J06.9 (URTI) | — | Most common GP claim |
| After-hours consult | 0191 | J06.9 | 0146 | Emergency modifier adds premium |
| Consult + blood draw | 0191 + 4014 | I10 (HTN) | — | Two line items, same ICD-10 |
| Chronic review + script | 0192 | E11.9 + I10 | — | Multiple ICD-10s, comprehensive |
| Wound suture | 0191 + 0515 | S61.0 + W26 | — | Injury needs external cause code |
| ECG in rooms | 0191 + 1211 | R00.2 (palpitations) | — | Procedure + interpretation |

---

### 5. CLAIM SUBMISSION VIA SWITCHING HOUSE

#### Switching House Architecture
```
Practice PMS → [MediSwitch OR Healthbridge] → Medical Scheme Adjudication Engine

Two Submission Modes:
  REAL-TIME: Claim sent and response received before patient leaves (~2-15 seconds)
  BATCH: Claims accumulated and sent end-of-day/periodically (response within 24-48 hours)
```

#### Real-Time Claim Flow (Preferred — Modern Standard)
```
1. Receptionist/doctor finalises account in PMS
2. PMS formats claim into PHISC MEDCLM/EDIFACT message
3. PMS transmits to switching house (MediSwitch or Healthbridge)
4. Switch validates format, routes to correct scheme
5. Scheme adjudication engine processes (2-15 seconds):
   - Eligibility → Provider → Code → Duplicate → Frequency → Bundling
   - Benefit → Waiting period → Pre-auth → PMB → Tariff → Co-pay → Routing
6. Response returned to PMS with LINE-BY-LINE outcome:
   - Each line: ACCEPTED / REJECTED / PARTIAL + reason code + amount approved
7. PMS displays result to reception
8. Reception informs patient of any patient liability
```

#### Switching Houses in SA
| Switch | Owner | Market Share | Key Feature |
|--------|-------|-------------|-------------|
| **MediSwitch** | MediKredit (Altron HealthTech) | ~60% | Largest, NAPPI owner |
| **Healthbridge** | Healthbridge (Pty) Ltd | ~25-30% | Cloud-native, PMS integrated |
| **Discovery Direct** | Discovery Health | Discovery only | Scheme-specific direct |
| **MedX** | Independent | Small | Newer entrant |

#### PHISC MEDCLM Message Format
- **Standard**: UN/EDIFACT adapted for SA (PHISC national standard)
- **Version**: 0.912-13.4
- **Segments**: Header (UNH) → Provider (PVD) → Member (MEM) → Claim lines (CLM) → Diagnosis (DIA) → Footer (UNT)
- **Character encoding**: ASCII
- **Transport**: HTTPS/TLS to switching house API endpoint

---

### 6. CLAIM RESPONSE HANDLING

#### Response Types and Actions
| Response | Meaning | Reception Action | Financial Impact |
|----------|---------|-----------------|-----------------|
| **ACCEPTED — Full** | Scheme pays full amount at tariff | Inform patient: no balance | Scheme pays provider directly |
| **ACCEPTED — Partial** | Scheme pays at scheme tariff (< billed amount) | Inform patient: shortfall = R[X] | Patient pays shortfall |
| **REJECTED** | Claim declined with reason code | Identify reason; correct and resubmit OR patient pays | No scheme payment |
| **PENDED** | Held for clinical review / additional info | Inform patient: pending; follow up | Payment delayed 5-30 days |

#### Top 10 Rejection Reasons (SA Practice Reality)
| # | Reason | Frequency | Fix |
|---|--------|-----------|-----|
| 1 | Missing/invalid ICD-10 code | ~30% | Add correct diagnosis code |
| 2 | Member not active on DOS | ~15% | Verify membership; patient pays cash |
| 3 | Benefit exhausted | ~12% | Check if PMB (overrides); else patient pays |
| 4 | Duplicate claim | ~10% | Verify not already submitted; resubmit with explanation |
| 5 | Invalid tariff/diagnosis combination | ~8% | Correct ICD-10 to match procedure |
| 6 | Pre-authorization required | ~7% | Obtain auth retrospectively if possible |
| 7 | Provider BHF invalid/inactive | ~5% | Update practice number with BHF |
| 8 | Waiting period applies | ~4% | Check PMB override; else patient pays |
| 9 | Injury without external cause code | ~4% | Add V01-Y98 secondary code |
| 10 | Frequency limit exceeded | ~3% | Verify; appeal if clinically justified |

#### Patient Liability Communication
```
After claim response received:
  → Calculate: Billed amount - Scheme payment = Patient liability
  → Patient liability = Shortfall + Co-payment + Rejected amounts
  → Print/email patient statement showing:
    - Total billed
    - Scheme approved
    - Scheme payment
    - Patient responsible amount (with breakdown)
  → Collect payment or arrange payment plan
  → Issue tax invoice / receipt
```

---

### 7. PAYMENT & eRA RECONCILIATION

#### Payment Cycle
```
Real-time accepted claims:
  → Scheme processes payment within 7-30 days (varies by scheme)
  → Payment via EFT to practice bank account
  → Electronic Remittance Advice (eRA) generated

eRA contains per-claim:
  - Claim reference number
  - Member details
  - Date of service
  - Each line item: code, amount billed, amount approved, amount paid, adjustment reason
  - Co-payment amount (deducted from payment)
  - Shortfall amount (patient responsibility)
```

#### eRA Reconciliation Workflow (Daily/Weekly)
```
1. Download eRA from MediKredit/Healthbridge portal or auto-import into PMS
2. PMS auto-matches eRA lines to submitted claims
3. For each claim:
   a. MATCHED — payment = expected → Mark as PAID
   b. PARTIAL — payment < expected → Note adjustment reason; flag patient shortfall
   c. UNMATCHED — claim not in eRA → Flag as OUTSTANDING; investigate
   d. REJECTED in eRA — zero payment → Route to rejection queue
4. Bank reconciliation: Total eRA amount should match bank deposit
5. Update patient accounts: post scheme payment; calculate outstanding balance
```

#### Key eRA Fields for Reconciliation
| Field | Purpose |
|-------|---------|
| Claim reference | Match to submitted claim |
| Scheme reference | Scheme's internal tracking |
| Amount billed | Original charge |
| Amount approved | What scheme accepted at tariff |
| Amount paid | What scheme actually pays (approved minus co-pay) |
| Reason code | Why adjusted/rejected |
| Patient liability | Amount patient must pay |

---

### 8. REJECTION CORRECTION & RESUBMISSION

#### Rejection Handling Workflow
```
Rejection received (via real-time response or eRA)
  → 1. Billing clerk reviews reason code
  → 2. Classify:
       CORRECTABLE: Wrong code, missing info, data entry error
       APPEALABLE: Clinical disagreement, benefit interpretation
       UNCOLLECTABLE: Membership genuinely lapsed, excluded benefit
  → 3. For CORRECTABLE:
       a. Correct the error in PMS (fix ICD-10, add modifier, update member details)
       b. Resubmit as CORRECTION (not new claim — use original claim reference)
       c. Mark in PMS as "Resubmitted" with date
  → 4. For APPEALABLE:
       a. Draft motivation letter with clinical notes
       b. Submit via scheme's appeal channel (portal/fax/email)
       c. Track appeal timeline (scheme has 30 days to respond per CMS rules)
  → 5. For UNCOLLECTABLE:
       a. Transfer balance to patient account
       b. Send patient statement
       c. Follow debt collection process if unpaid after 30/60/90 days
```

#### Resubmission Rules
- **Timeframe**: Most schemes allow resubmission within 4-6 months of DOS
- **Format**: Same MEDCLM format with resubmission indicator
- **Original reference**: Must include original claim reference for linking
- **Supporting documents**: May attach clinical notes, auth letters via portal
- **Limit**: Typically 2-3 resubmission attempts before formal appeal required

#### Appeal Escalation Path
```
1. Resubmission with correction → Scheme re-adjudicates
2. Internal appeal to scheme (30-day response required)
3. External appeal to Council for Medical Schemes (CMS) if scheme unresponsive
4. CMS complaint process (regulatory intervention)
```

---

### 9. CHRONIC DISEASE MANAGEMENT & REPEAT PRESCRIPTIONS

#### CDL Registration Workflow
```
1. Doctor diagnoses CDL condition (one of 27 conditions)
2. Doctor completes chronic application:
   - ICD-10 code for condition
   - Treatment protocol (NAPPI codes for medications)
   - Supporting clinical evidence (blood results, specialist reports)
3. Application submitted to scheme via switch or portal
4. Scheme clinical team reviews against CDL criteria and formulary
5. Outcome (within 5-10 working days):
   APPROVED → Auth number issued, valid 12 months
   APPROVED WITH AMENDMENT → Different drug/dosage (formulary preference)
   DECLINED → Doesn't meet CDL criteria; can appeal
   PENDED → Additional info required
6. Monthly dispensing against authorization number
7. Annual renewal: Updated clinical results + review
```

#### 27 CDL Conditions (PMB)
Addison's disease, asthma, bipolar disorder, bronchiectasis, cardiac failure, cardiomyopathy, chronic obstructive pulmonary disease, chronic renal disease, coronary artery disease, Crohn's disease, diabetes insipidus, diabetes mellitus (type 1 and 2), dysrhythmia, epilepsy, glaucoma, haemophilia, hyperlipidaemia, hypertension, hypothyroidism, multiple sclerosis, Parkinson's disease, rheumatoid arthritis, schizophrenia, SLE, ulcerative colitis.

#### Repeat Prescription Cycle
```
Prescription validity: 6 months (Medicines Act)
Dispensing cycle: 28 days (some schemes) or 30 days (calendar month)
  → Patient visits pharmacy monthly for refill
  → Pharmacy claims using:
      - Chronic auth number
      - NAPPI code (must match authorized product)
      - 28/30-day quantity
  → Scheme validates against active authorization
  → After 6 months: NEW prescription required from doctor
  → At 12 months: Full clinical review + authorization renewal
```

#### Chronic Management Touchpoints in PMS
| When | What | Who |
|------|------|-----|
| Initial diagnosis | CDL application submission | Doctor + reception |
| Monthly | Monitor pharmacy claims against auth | Billing clerk |
| 6-monthly | Flag for new prescription | PMS automated alert → Doctor |
| Annually | Clinical review + renewal application | Doctor + reception |
| Ad-hoc | Medication change → new application | Doctor |

---

## PART B: SPECIALIST PRACTICE WORKFLOW

---

### 10. REFERRAL FROM GP TO SPECIALIST

#### Referral Letter Requirements
```
GP referral letter must contain:
  1. GP practice details (name, BHF, HPCSA, contact)
  2. Patient details (name, DOB, medical aid)
  3. Reason for referral (clinical summary)
  4. Relevant history and examination findings
  5. Investigation results (bloods, imaging)
  6. Current medications
  7. Specific question / what is being requested
  8. Urgency level
```

#### Scheme Referral Requirements
| Scheme Type | Referral Needed? | Auth Needed? |
|-------------|-----------------|--------------|
| Open scheme (e.g., Discovery Classic) | GP referral recommended, not always mandatory | Depends on specialist type |
| Network/capitation (e.g., KeyCare) | **Mandatory** GP referral + scheme authorization number | YES — before specialist visit |
| Hospital plan only | Only for hospital admission | YES — for hospital |

#### Specialist Consultation Billing
| Code | Description | Rate Range |
|------|-------------|-----------|
| 0141 | Initial comprehensive | R850-1,200 |
| 0142 | Follow-up | R550-780 |
| 0143 | Extended (>45 min) | R1,200-1,800 |
| 0146 | Emergency/urgent | R1,100-1,600 |
| 0149 | Telehealth | R700-1,000 |

#### Back-Referral to GP
- Specialist writes report to GP (diagnosis, findings, management plan)
- Chronic management typically reverts to GP
- Specialist may retain for periodic review (e.g., 6-monthly cardiology)
- GP continues to manage day-to-day, prescribe chronic meds

---

### 11. PRE-AUTHORIZATION WORKFLOW (SPECIALIST)

#### When Pre-Auth is Required
| Service | Lead Time | Information Needed |
|---------|-----------|-------------------|
| Elective hospital admission | 14+ days before | ICD-10, procedure codes, estimated LOS, hospital BHF |
| Emergency admission | Within 24-48 hours retrospectively | Same + admission notes |
| MRI / CT / PET scan | 2-3 days before | ICD-10, scan type, clinical motivation |
| Elective surgery | 3-5 days before | ICD-10, procedure code, surgeon + anaesthetist BHF |
| Oncology (all) | Before treatment starts | Staging, histology, treatment protocol |
| Specialist allied health (after threshold) | After 6 initial sessions | Treatment plan, progress notes |

#### Pre-Auth Submission Process
```
1. Specialist/rooms manager prepares request:
   - Patient membership details
   - ICD-10 diagnosis code(s)
   - CCSA procedure code(s) planned
   - Hospital/facility details + BHF number
   - Estimated duration of stay
   - All provider BHF numbers (surgeon, anaesthetist, assistant)
2. Submit via:
   - Scheme member app/portal (most common)
   - Scheme call centre (telephonic)
   - Email to scheme pre-auth department
   - Practice management software (integrated — Healthbridge, GoodX)
3. Scheme responds with:
   - Authorization number (valid 3 months)
   - Approved procedures and facility
   - Estimated cover and patient liability
   - Conditions (e.g., "DSP facility only")
4. Authorization number attached to ALL claims for this episode
```

#### Pre-Auth vs. Quote vs. Payment Guarantee
| Term | Meaning |
|------|---------|
| **Pre-authorization** | Scheme confirms procedure is a benefit and medically necessary |
| **Quote/Estimate** | Estimated cost breakdown — NOT a payment guarantee |
| **Payment guarantee** | Very rare in SA; pre-auth does NOT guarantee exact payment |

---

### 12. IN-ROOMS PROCEDURES — BILLING COMPLEXITIES

#### Fee Components for In-Rooms Procedures
```
When a specialist performs a procedure in their rooms:
  Professional fee: Specialist's skill (CCSA tariff code)
  + Consumables/materials: NAPPI codes for items used
  + Equipment modifier: 0007 if own monitoring equipment used (15 units)

When performed in a day hospital/theatre:
  Professional fee: Specialist (CCSA tariff)
  + Facility fee: Hospital/day clinic charges (ward, theatre, nursing)
  + Anaesthesia fee: Anaesthetist (separate provider, separate claim)
  + Assistant fee: If surgical assistant used (modifier 0008 = 33.33% of surgeon fee)
  + Materials: Hospital bills consumables separately
```

#### Modifier 0007 — Own Equipment in Rooms
- Billed when specialist uses their own monitoring equipment for procedures under IV sedation in rooms
- Valued at 15.00 clinical procedure units (regardless of how many items)
- Also applies in hospital when hospital does not provide required equipment
- Common for: dermatology procedures, gastroscopy in rooms, minor surgery

#### Split Billing (Multiple Providers, One Episode)
```
Hospital admission for surgery generates MULTIPLE claims:
  1. Surgeon → Professional fee (procedure codes + modifiers)
  2. Anaesthetist → Anaesthesia fee (time-based + procedure complexity)
  3. Assistant surgeon → 33.33% of surgeon fee (modifier 0008)
  4. Hospital → Facility fee (ward fees, theatre, ICU, materials, pharmacy)
  5. Radiologist → If imaging done (separate professional + facility)
  6. Pathologist → If specimens sent (separate professional fee)

All claims linked by: Same patient + Same DOS + Same authorization number
```

---

### 13. HOSPITAL ADMISSION WORKFLOW (FROM SPECIALIST ROOMS)

#### Elective Admission Process
```
1. Specialist decision to admit → Inform patient
2. Pre-authorization obtained (see section 11)
3. Booking made with hospital (admission office):
   - Patient details, medical aid, auth number
   - Procedure planned, estimated LOS
   - Surgeon + anaesthetist confirmed
   - Special requirements (ICU bed, specific equipment)
4. Patient arrives at hospital on admission date
5. Hospital admission office:
   - Verifies medical aid eligibility (real-time check)
   - Confirms pre-auth number with scheme
   - Collects co-payment/deposit if required
   - Patient signs consent forms (procedure, anaesthesia, POPIA)
   - Wristband issued
6. Ward admission → Nursing assessment → Pre-op preparation
7. Procedure performed
8. Post-op recovery (ward or ICU)
9. Discharge:
   - Surgeon authorises discharge
   - Discharge summary prepared
   - Take-home medications dispensed (hospital pharmacy or script to pharmacy)
   - Follow-up appointment booked with specialist rooms
10. Hospital submits facility claim (ward days, theatre, meds, consumables)
11. Specialist submits professional claim (procedure + post-op visits)
```

#### Emergency Admission Process
```
1. Patient presents at hospital ER / specialist calls admission
2. Hospital admits — treatment begins immediately
3. Retrospective pre-auth: Scheme notified within 24-48 hours
4. Information submitted: ICD-10, procedures performed, admission details
5. Scheme issues retrospective authorization
6. PMB conditions: Scheme MUST cover regardless of pre-auth status
7. Claims submitted as per normal process
```

---

## PART C: DENTAL PRACTICE WORKFLOW

---

### 14. DENTAL-SPECIFIC BILLING

#### Tooth Numbering — FDI/ISO Two-Digit System (SA Standard)
```
PERMANENT TEETH (adults):
  Upper Right (Q1): 18 17 16 15 14 13 12 11 | 21 22 23 24 25 26 27 28 :Upper Left (Q2)
  Lower Right (Q4): 48 47 46 45 44 43 42 41 | 31 32 33 34 35 36 37 38 :Lower Left (Q3)

DECIDUOUS TEETH (children):
  Upper Right (Q5): 55 54 53 52 51 | 61 62 63 64 65 :Upper Left (Q6)
  Lower Right (Q8): 85 84 83 82 81 | 71 72 73 74 75 :Lower Left (Q7)

First digit = quadrant (1-4 permanent, 5-8 deciduous)
Second digit = tooth position (1=central incisor → 8=third molar)
```

#### Surface Notation (Compulsory on Claims)
| Code | Surface | Description |
|------|---------|-------------|
| M | Mesial | Towards midline |
| O/I | Occlusal/Incisal | Biting surface (O for premolars/molars, I for anteriors) |
| D | Distal | Away from midline |
| B/V | Buccal/Vestibular | Cheek side |
| L/P | Lingual/Palatal | Tongue/palate side |

**Multi-surface notation**: MOD = mesial + occlusal + distal (3-surface filling)

#### Tooth Identification (TID) and Surface Identification (SID) Rules
- **Compulsory** for all dental procedures identified with letter (T) in SADA codes
- Incorrect TID/SID is a **frequent rejection reason**
- Must use FDI notation (NOT American Universal numbering)
- Each tooth/surface combination = separate line item

#### SADA Dental Code Structure (8100-8899)
| Range | Category | Pre-Auth? |
|-------|----------|-----------|
| 8100-8149 | Diagnostic (exam, X-rays, study models) | No |
| 8150-8199 | Preventive (scale, polish, fluoride, sealants) | No |
| 8200-8299 | Restorative (fillings — amalgam, composite, inlay) | No (unless >3 surfaces) |
| 8300-8399 | Endodontics (root canals, pulpotomy) | Sometimes (molar RCT) |
| 8400-8449 | Periodontics (deep scaling, surgery) | Yes (surgery) |
| 8450-8499 | Oral surgery (extractions, impactions) | Yes (GA, impacted 3rd molars) |
| 8500-8549 | Removable prosthodontics (dentures) | **Yes** |
| 8550-8599 | Fixed prosthodontics (crowns, bridges) | **Yes** |
| 8600-8699 | Orthodontics | **Yes** (all orthodontic treatment) |
| 8700-8799 | Implants | **Yes** |

#### Dental ICD-10 Quick Reference (SADA QRC)
| Code | Condition |
|------|-----------|
| K02.1 | Dental caries of dentine |
| K04.0 | Pulpitis |
| K04.1 | Necrosis of pulp |
| K05.1 | Chronic gingivitis |
| K05.3 | Chronic periodontitis |
| K08.1 | Loss of teeth due to extraction |
| K01.1 | Impacted teeth |
| K07.3 | Anomalies of tooth position (ortho) |
| S02.5 | Fracture of tooth |

---

### 15. DENTAL BENEFIT VERIFICATION

#### Dental Benefit Structure (Typical)
```
Medical aid dental benefits are usually:
  - Annual limit per beneficiary (e.g., R5,000-R15,000)
  - Separate from medical benefits
  - Sub-limits per category:
      Conservative: R3,000-R8,000
      Prosthodontics: R5,000-R10,000 (if available)
      Orthodontics: Lifetime limit R10,000-R25,000 (if available)
  - Network requirements: Many schemes require DSP dentist
  - Frequency limits:
      Examination: 2 per year
      Scale & polish: 2 per year (some schemes: 1)
      Full-mouth X-ray (OPG): 1 per 2 years
      Fluoride: 2 per year (children only, some schemes)
```

#### Dental Benefit Check at Reception
```
Same real-time eligibility check as medical:
  → Membership + dep code + provider BHF → Switch → Scheme
  → Response includes:
    - Dental benefit remaining (Rands)
    - Sub-limit balances per category
    - Frequency counts (exams/scales used this year)
    - Network status of this dental provider
    - Co-payment indicator
```

---

### 16. DENTAL PRE-AUTHORIZATION

#### Procedures Requiring Pre-Auth
| Procedure | Code Range | Why Pre-Auth |
|-----------|-----------|-------------|
| General anaesthesia (dental) | 0400-0499 | High cost, medical necessity required |
| Removable dentures | 8500-8549 | High cost, alternative options |
| Fixed crowns/bridges | 8550-8599 | High cost, clinical necessity |
| Orthodontic treatment | 8600-8699 | Long-term, high cost |
| Implants | 8700-8799 | High cost, not always covered |
| Periodontal surgery | 8400-8449 | Clinical necessity |
| Impacted third molar (in GA) | 8450+ | Hospital/GA component |

#### GA for Dental — Special Process
```
Required for: Children under 6, severe anxiety, multiple extractions, intellectual disability
1. Dentist motivates medical necessity (clinical notes)
2. Pre-auth request includes:
   - ICD-10 for dental condition
   - ICD-10 for reason requiring GA (e.g., F93.1 phobic anxiety, F70 intellectual disability)
   - List of all procedures planned
   - Hospital/day clinic details
3. Scheme evaluates: Is GA medically necessary or merely convenient?
4. If PMB dental condition + GA medically necessary → Must cover
5. Authorization issued for facility + anaesthesia + dental procedures
```

---

## PART D: PHARMACY WORKFLOW

---

### 17. PRESCRIPTION RECEIPT TO PAYMENT

#### Full Pharmacy Dispensing Workflow
```
1. PRESCRIPTION RECEIPT
   - Patient presents script (paper, SMS, email, or electronic via eScript)
   - Pharmacist validates:
     a. Script from authorised prescriber (doctor, dentist, authorised nurse)
     b. All legal requirements present (Regulation 28)
     c. Not expired (< 6 months)
     d. Repeat available (if repeat script)
     e. Schedule appropriate for prescriber type
   - Electronic scripts: Verify authenticity (Regulation 33(4))

2. CLINICAL VALIDATION
   - Check for drug interactions (against patient medication history)
   - Verify dosage within therapeutic range
   - Check allergies on file
   - Pregnancy/lactation flags
   - Schedule compliance (S5/S6 restrictions)

3. GENERIC SUBSTITUTION DECISION (Mandatory — s22F Medicines Act)
   - Generic equivalent available? → MUST offer to patient
   - Exceptions:
     a. Prescriber wrote "no substitution" with clinical reason (own handwriting)
     b. Patient declines (pays price difference)
     c. No generic available / out of stock
     d. Product on SAHPRA non-substitutable list (narrow therapeutic index)
   - If substituted: Inform prescriber within reasonable time

4. DISPENSING
   - Select product (NAPPI code)
   - Pick correct strength, form, quantity
   - Label: Patient name, medication name, strength, dosage, pharmacist name, date, pharmacy details
   - Pharmacist final check
   - Counselling: How to take, side effects, storage, interactions

5. CLAIM SUBMISSION (if medical aid)
   - Real-time claim via switch:
     NAPPI code + quantity + ICD-10 + member details + dispensing fee
   - DUR check runs at scheme (drug interactions, duplications, formulary check)
   - Response: Approved/Rejected/Partial
   - Co-payment calculated and collected from patient
   - If off-formulary: Higher co-payment (reference pricing differential)

6. PAYMENT
   - Scheme portion: Paid to pharmacy via eRA (7-30 days)
   - Patient portion: Collected at counter (cash/card/EFT)
   - Receipt issued
```

---

### 18. CHRONIC MEDICATION DISPENSING CYCLE

#### 28-Day vs 30-Day Dispensing
| Aspect | 28-Day Cycle | 30-Day (Calendar Month) |
|--------|-------------|------------------------|
| Used by | Discovery, GEMS, most large schemes | Some smaller schemes |
| Logic | Fixed 28-day intervals | Once per calendar month |
| "Too early" rejection | If claimed before 28 days from last dispense | If claimed twice in same month |
| Impact on patient | Must plan pharmacy visits precisely | Slightly more flexible |
| December/January gap | 28-day cycle may cause misalignment over holidays | Calendar month aligns with benefit year |

#### Monthly Chronic Dispensing Flow
```
1. Patient visits pharmacy (or courier pharmacy delivers)
2. Pharmacy checks:
   - Active chronic authorization with scheme
   - Authorization not expired
   - Correct medication on auth
   - Not dispensed too early (28/30-day rule)
3. Dispense medication (max 30-day supply per cycle)
4. Submit claim with chronic auth number
5. Scheme validates:
   - Auth active and valid
   - NAPPI matches authorized product
   - Quantity within approved dosage
   - Not duplicate dispensing
6. Response: Approved → Scheme pays; Patient pays co-pay (if any)
```

#### Courier/Mail-Order Pharmacy
- Growing trend (MediPost, Clicks Direct, Dis-Chem Direct)
- Chronic medications delivered to patient's door
- Same claim process, often preferred by schemes (lower cost)
- Patient must still have valid prescription on file
- Delivery within 3-5 working days typically

---

### 19. GENERIC SUBSTITUTION AT THE COUNTER

#### Decision Flow
```
Patient presents script for Brand X (originator):
  → Pharmacist checks: Is there a SAHPRA-registered generic equivalent?
  → YES:
      → Is it on the SAHPRA non-substitutable list? → NO SUBSTITUTION (dispense as written)
      → Is it a narrow therapeutic index drug (NTI)? → Caution; verify interchangeability
      → Prescriber wrote "no substitution" in own handwriting? → NO SUBSTITUTION
      → All clear → MUST offer generic to patient
      → Patient accepts? → Dispense generic; inform prescriber
      → Patient declines? → Dispense brand; patient pays price difference
  → NO generic available:
      → Dispense as written
```

#### Financial Impact of Generic Substitution
```
Example: Lipitor (atorvastatin) 20mg, 30 tablets
  Brand SEP: R389.00 + dispensing fee R128.00 + VAT = ~R594.00
  Generic SEP: R89.00 + dispensing fee R49.00 + VAT = ~R159.00
  Scheme reference price: Based on cheapest generic
  If patient insists on brand: Pays ~R435.00 out-of-pocket difference
```

---

### 20. CONTROLLED SUBSTANCE (S5/S6) DISPENSING

#### Schedule 5 Requirements
```
- Prescription required from authorised prescriber
- Script retained by pharmacy (filed for inspection)
- Entry in S5 register: Date, patient, prescriber, medicine, quantity
- Repeats allowed (up to 5 within 6 months)
- Examples: Codeine-containing analgesics, benzodiazepines (some), testosterone
```

#### Schedule 6 Requirements (Strict Controls — Section 22A)
```
- Prescription required — EACH dispensing needs NEW script
- NO repeats allowed (s22A(6)(i))
- Maximum 30-day supply at prescribed dose per dispensing (s22A(6)(o))
- BOUND register (sequential, no loose pages)
- Monthly returns to Provincial Pharmacist Inspector
- 5-year retention of all records
- Monthly stock reconciliation (physical count vs register)
- Theft/loss: Report to SAPS within 24 hours
- Examples: Methylphenidate (Ritalin/Concerta), morphine, fentanyl, oxycodone
```

#### S5/S6 Claiming Differences
- Same NAPPI claim process as regular medicines
- Additional validation: Scheme checks prescriber authorisation for schedule
- Some schemes require pre-authorization for chronic S6 use
- DUR checks more stringent (quantity limits, frequency monitoring)

---

## PART E: ALLIED HEALTH WORKFLOW

---

### 21. PHYSIOTHERAPY WORKFLOW

#### Referral & Assessment
```
Patient pathway:
  1. GP/specialist referral (letter with diagnosis + clinical findings)
     - Some schemes mandate GP referral; others allow direct access
  2. Initial assessment by physiotherapist:
     - Subjective: Pain history, functional limitations, goals
     - Objective: Range of motion, strength, special tests, functional assessment
     - Assessment: Clinical diagnosis + ICD-10 coding
     - Plan: Treatment protocol, frequency, expected duration
  3. Treatment plan documented in clinical notes
```

#### Session Billing
| Code | Description | Rate Range |
|------|-------------|-----------|
| 6001 | Initial assessment | R450-650 |
| 6002 | Follow-up treatment | R350-500 |
| 6003 | Extended session | R500-700 |
| + modifiers | Specific modalities (e.g., dry needling, hydrotherapy) | Varies |

#### Session Limits & Authorization
```
Typical scheme limits:
  - 12-15 sessions per beneficiary per year (combined physio/OT/chiro)
  - First 6 sessions: No pre-auth required
  - After 6 sessions: Pre-authorization needed
    → Submit: Treatment plan, progress notes, ICD-10, expected remaining sessions
    → Scheme clinical review → Approve additional sessions or decline
  - PMB conditions (e.g., post-stroke rehab): Override session limits
  - Workers' compensation (COIDA): Separate limits and tariffs
```

#### Physiotherapy Claim Structure
```
Each session claim:
  - Tariff code (6001/6002)
  - ICD-10 (e.g., M54.5 low back pain, S83.5 knee ligament sprain)
  - Referring provider BHF (if required by scheme)
  - Modifiers for specific techniques
  - Amount charged
```

---

### 22. PSYCHOLOGY WORKFLOW

#### Referral & Assessment
```
1. GP/psychiatrist referral (recommended, not always mandatory)
   - Some schemes require GP referral for reimbursement
   - Emergency/crisis: Direct access may be allowed
2. Initial assessment (60-90 minutes):
   - Clinical interview
   - Psychometric testing (if indicated — separate billing codes)
   - Diagnosis: ICD-10 (F-codes for mental health)
   - Treatment plan: Modality, frequency, expected duration
3. Ongoing therapy sessions (45-60 minutes each)
```

#### Session Billing
| Code | Description | Rate Range |
|------|-------------|-----------|
| 6400 | Initial assessment/intake | R800-1,200 |
| 6401 | Follow-up therapy session | R650-950 |
| 6402 | Extended session | R900-1,300 |
| 6410-6419 | Psychometric testing | R500-2,000 per test |

#### Session Limits & Mental Health Benefits
```
Typical scheme limits:
  - 15-21 sessions per beneficiary per year
  - Discovery 2026: R3,479 per person per year (from day-to-day benefits)
    or higher on comprehensive plans (R9,300-R49,700 family limit for allied/therapeutic)
  - First 6 sessions: Usually no pre-auth
  - After 6-8 sessions: Pre-authorization required
    → Submit: Treatment plan, diagnosis, progress assessment, remaining sessions needed
  - PMB mental health conditions (e.g., schizophrenia, bipolar): Must cover at DSP
  - Reports: Schemes may request progress reports for authorization renewal
```

#### Mental Health ICD-10 Codes (Common)
| Code | Condition |
|------|-----------|
| F32.1 | Moderate depressive episode |
| F33.1 | Recurrent depressive disorder |
| F41.1 | Generalized anxiety disorder |
| F43.1 | Post-traumatic stress disorder |
| F43.2 | Adjustment disorder |
| F40.1 | Social phobia |
| F50.0 | Anorexia nervosa |
| F90.0 | ADHD |

---

## PART F: PRACTICE ADMINISTRATION

---

### 23. END-OF-DAY RECONCILIATION

#### Daily Close-Off Process
```
1. CASH/CARD RECONCILIATION
   - Count cash drawer against opening float
   - Match card machine total to PMS receipts
   - Reconcile: Total collected = Sum of all payments received today
   - Identify discrepancies → Investigate immediately

2. CLAIMS RECONCILIATION
   - Review all claims submitted today:
     → How many submitted?
     → How many accepted real-time?
     → How many rejected? (flag for next-day correction)
     → How many pended?
   - Outstanding batch claims: Confirm transmission successful

3. PATIENT ACCOUNT REVIEW
   - New outstanding balances created today
   - Patient payments received against old balances
   - Cash patients: All invoices paid in full?
   - Medical aid patients: All shortfalls communicated?

4. DIARY/APPOINTMENT REVIEW
   - No-shows: Did not attend → Flag for follow-up
   - Late cancellations: Apply cancellation policy if applicable
   - Tomorrow's bookings: Confirm appointments, check benefit status

5. CLINICAL AUDIT
   - All patient files/notes complete?
   - All prescriptions documented?
   - All procedures documented and coded?
```

---

### 24. MONTHLY FINANCIAL REPORTING

#### Key Reports for Practice Manager
| Report | Content | Action |
|--------|---------|--------|
| **Revenue Summary** | Total billed, scheme payments received, patient payments, write-offs | Compare to target |
| **Aged Debtors (Schemes)** | Claims outstanding 30/60/90/120+ days by scheme | Follow up on old claims |
| **Aged Debtors (Patients)** | Patient balances outstanding 30/60/90/120+ days | Send statements; escalate old debt |
| **Rejection Rate** | % of claims rejected, by reason code | Identify training needs; systemic issues |
| **Collection Rate** | (Total collected / Total billed) × 100 | Target: >90% (medical aid), >85% (overall) |
| **Average Revenue Per Patient (ARPP)** | Total revenue / Total patients seen | Track productivity |
| **Days Sales Outstanding (DSO)** | Average time from billing to payment | Target: <30 days (scheme), <45 days (patient) |
| **Scheme Payment Analysis** | Breakdown by scheme: billed vs paid vs shortfall | Identify problematic schemes |
| **Procedure Mix** | Top procedures by volume and revenue | Strategic planning |
| **Expense Report** | Staff costs, rent, consumables, subscriptions | Monitor profit margin |

#### Revenue Recognition
```
SA medical practices typically use:
  CASH BASIS: Recognise revenue when payment received
    → Simpler, more conservative, common for small practices
  ACCRUAL BASIS: Recognise revenue when service rendered (claim submitted)
    → More accurate, requires bad debt provisioning
    → Revenue from monthly PMS report with age-based bad debt adjustment

SARS requirement: Practices must keep records for 5 years
Tax year: March to February (for individuals/sole props) or financial year (companies)
```

---

### 25. PATIENT ACCOUNT MANAGEMENT

#### Account Lifecycle
```
Service rendered
  → Invoice created (tariff amount)
  → Claim submitted to scheme
  → Scheme response received:
      PAID IN FULL → Account balance = R0.00; closed
      PARTIAL PAYMENT → Patient balance = Billed - Scheme payment
      REJECTED → Patient balance = Full billed amount (unless correctable)
  → Patient statement generated (30 days after DOS if balance outstanding)
  → Payment collected:
      At reception (cash/card) → Allocate to oldest invoice first
      Via EFT → Match to statement reference number
      Debit order (some practices offer monthly arrangements)
  → Account cleared → Tax certificate issued (annually in March)
```

#### Statement Requirements
- Patient name and account number
- Itemised services with dates
- Scheme payment received
- Outstanding balance with ageing
- Payment methods accepted
- Practice banking details for EFT
- Contact details for queries

---

### 26. DEBT COLLECTION WORKFLOW

#### Internal Collection Process
```
30 days: First statement sent (postal/email/SMS)
60 days: Second statement + SMS/phone reminder
90 days: Final demand letter (warning of legal action / handover to collectors)
120 days: Decision point:
  → Balance < R500: Consider write-off
  → Balance R500-R5,000: Hand to debt collection agency
  → Balance > R5,000: Consider legal action (letter of demand via attorney)
```

#### Legal Framework
- **National Credit Act (NCA)**: May apply to payment arrangements; debtor must be notified per s129 before legal action
- **Consumer Protection Act (CPA)**: Governs fair treatment, complaints, billing transparency
- **Prescription of Debt**: Medical debt prescribes after **3 years** from date of service if no acknowledgement of debt
- **POPIA**: Patient data in debt collection must comply with data protection

#### Debt Collection Agency Engagement
- Commission: Typically 15-25% of amount recovered (no-win, no-fee common)
- Handover requirements: Patient details, invoices, proof of service, statements sent
- Agency must be registered with DCSCC (Debt Collectors Council)
- Patient must be informed that account has been handed over

---

### 27. ANNUAL BENEFIT RENEWAL — "JANUARY CHAOS"

#### What Happens on 1 January
```
ALL medical aid benefits reset to full annual limits:
  - MSA (Medical Savings Account) refilled
  - Day-to-day limits reset
  - Chronic authorizations continue (not annual)
  - Allied health session counts reset to 0
  - Dental limits reset
  - Optical limits reset

Simultaneously:
  - New contribution rates take effect (annual increases 5-10%)
  - Plan/option changes take effect (members who switched)
  - New members join (switched from other schemes)
  - Dependents added/removed
  - New tariff rates applied by schemes
  - Network changes (some providers added/removed from networks)
```

#### Impact on Practice Workflow (January-February)
| Challenge | Impact | Mitigation |
|-----------|--------|------------|
| Benefits reset | Every patient effectively "new" — must re-verify | Run benefit checks for ALL patients in January |
| Plan changes | Patients on different plans than December | Update PMS with new plan details |
| New members | Registration data may not be in switch yet | Manual verification with scheme call centre |
| New tariff rates | PMS must be updated with 2026 tariff files | Update tariff tables before 2 January |
| Scheme mergers/exits | Some schemes merge or close annually | Update scheme master list in PMS |
| Higher contributions | Patients may have changed to cheaper plans | Verify network status (may now be non-DSP) |
| Waiting periods | New members/new dependents: 3-month general wait | Check waiting period flags on benefit check |
| Chronic auth continuation | Chronic auths generally continue across years | Verify chronic auth still valid for Jan fill |
| "January rush" | Patients use fresh benefits for deferred procedures | Extended hours, higher volumes expected |

#### Practice Preparation Checklist (December)
```
□ Download and install new tariff files for all schemes
□ Update medical aid scheme/plan master data in PMS
□ Verify switching house connections active for new year
□ Send patient communications about new year benefits
□ Reschedule chronic patients' January pharmacy visits if needed
□ Review and renew practice licenses, HPCSA registrations
□ Update provider contracts with scheme networks
□ Brief reception staff on common January queries
□ Prepare for higher patient volumes in first 2 weeks
□ Test real-time claiming connectivity before 2 January
```

---

## PART G: STAFF ROLES IN A PRACTICE

---

### 28. RECEPTION STAFF

#### Systems Used
| System | Purpose |
|--------|---------|
| PMS (Practice Management Software) | Patient registration, appointments, billing, claiming |
| Switch interface (MediSwitch/Healthbridge) | Benefit verification, real-time claiming |
| Card payment terminal | Co-payments, cash patient payments |
| Phone system | Appointments, patient queries, scheme follow-ups |
| Email | Patient communication, appointment confirmations |
| WhatsApp (some practices) | Appointment reminders, results notification |

#### Key Decisions Made by Reception
| Decision | Context |
|----------|---------|
| Is this patient on a medical aid? | Determines billing workflow |
| Is the medical aid active? | Decides if patient can be seen on account or must pay cash |
| Does the patient need a referral? | Network plan patients need GP referral for specialist |
| Is pre-authorization required? | Certain procedures need scheme approval first |
| How much must the patient pay now? | Based on benefit check: co-pay, shortfall, cash payment |
| Which doctor/slot is appropriate? | Urgent vs routine, practice availability |
| Should we collect payment now or bill later? | Practice policy on cash collection |

#### Daily Routine
```
07:30  Open practice, switch on systems, check switch connectivity
07:45  Review day's appointments; print patient lists
08:00  First patients arrive — registration, benefit checks, payments
        Throughout day: Manage walk-ins, phone calls, payments, filing
12:30  Lunch cover (staggered if multiple reception staff)
16:00  Begin end-of-day: Cash up, reconcile payments, review outstanding
16:30  Process batch claims (if not real-time)
17:00  Close practice, secure cash, lock up
```

---

### 29. PRACTICE MANAGER

#### Responsibilities
| Area | Tasks |
|------|-------|
| **Financial oversight** | Monthly revenue review, aged debtors management, budget monitoring, bank reconciliation, financial reporting to doctor/partners |
| **Claim management** | Rejection rate monitoring, resubmission oversight, scheme query resolution, eRA reconciliation |
| **Staff management** | Hiring, scheduling, performance management, training, leave management |
| **Compliance** | HPCSA practice requirements, POPIA compliance, health & safety, BHF registration maintenance |
| **Patient experience** | Complaint handling, process improvement, patient satisfaction |
| **Procurement** | Medical supplies, consumables, equipment maintenance, PMS license management |
| **Scheme relationships** | Network contract management, tariff negotiations, DSP applications |
| **Reporting** | Monthly management report to doctor(s)/partners |

#### Key KPIs Monitored
| KPI | Target | Frequency |
|-----|--------|-----------|
| Collection rate (overall) | >85% | Monthly |
| Collection rate (medical aid) | >92% | Monthly |
| Rejection rate | <5% | Weekly |
| First-pass acceptance rate | >90% | Weekly |
| Days Sales Outstanding (DSO) | <30 days | Monthly |
| Patient no-show rate | <10% | Weekly |
| Patients seen per day per doctor | 25-35 (GP) | Daily |
| Revenue per consultation | R450-R800 (GP) | Monthly |

---

### 30. BILLING CLERK

#### Core Functions
```
1. CLAIM SUBMISSION
   - Code procedures (ICD-10 + CCSA tariff) from doctor's notes
   - Ensure all required fields populated
   - Submit claims via PMS through switch
   - Verify real-time responses

2. REJECTION HANDLING
   - Review all rejected claims daily
   - Classify: correctable, appealable, uncollectable
   - Correct and resubmit within 48 hours
   - Track resubmission outcomes

3. eRA PROCESSING
   - Download/import eRAs from switches/schemes
   - Match payments to claims in PMS
   - Identify discrepancies and short-payments
   - Update patient accounts with scheme payments

4. PATIENT BILLING
   - Generate patient statements (30/60/90 day)
   - Process patient payments and allocations
   - Handle payment queries
   - Escalate overdue accounts

5. SCHEME QUERIES
   - Contact schemes regarding unpaid/underpaid claims
   - Submit supporting documentation for appeals
   - Track query resolution timelines
   - Maintain query register
```

#### Billing Clerk Daily Workflow
```
08:00  Check previous day's real-time responses — flag rejections
08:30  Process overnight eRA downloads — reconcile payments
09:00  Correct and resubmit rejected claims from previous day
10:00  Code and submit any batch claims not sent real-time
11:00  Patient statement queries — resolve billing disputes
12:00  Follow up on outstanding scheme queries (phone/portal)
13:00  Review aged debtors list — identify priority follow-ups
14:00  Submit pre-authorization requests as needed
15:00  Contact patients with outstanding balances
16:00  End-of-day claim submission status review
16:30  Prepare daily billing report for practice manager
```

---

### 31. CLINICAL STAFF (NURSING / CLINICAL ASSOCIATES)

#### Documentation Responsibilities
| Task | Detail |
|------|--------|
| **Vitals capture** | BP, pulse, temperature, weight, height, BMI — entered into PMS/EMR before doctor sees patient |
| **Triage** | Assess urgency, direct to appropriate doctor/time slot |
| **Procedure assistance** | Assist with in-rooms procedures; document items used for billing |
| **Specimen management** | Label specimens, complete lab request forms, track results |
| **Clinical notes** | Ensure doctor's notes are complete; prompt for missing information |
| **Chronic monitoring** | Track chronic patient follow-ups due; manage recall lists |
| **Stock management** | Monitor medication/consumable stock levels; reorder before depletion |
| **Infection control** | Sterilisation, waste management (healthcare risk waste — HCRW) |

#### Coding Assistance
- Clinical staff (especially in larger practices) may assist with ICD-10 code selection
- Doctor remains ultimately responsible for diagnosis coding
- Clinical staff may identify procedure codes from consultation notes
- **Upcoding** (selecting higher-level code than justified) is **fraud** — HPCSA and CMS enforce
- **Unbundling** (billing components separately when a single code exists) is also **fraud**

---

## APPENDIX: PRACTICE MANAGEMENT SOFTWARE MARKET (SA)

| Software | Vendor | Strengths | Switch Integration |
|----------|--------|-----------|-------------------|
| **GoodX** | GoodX Software | Market leader, comprehensive, large install base | MediSwitch + Healthbridge |
| **Elixir** | Healthbridge | Cloud-native, built-in switch | Healthbridge (native) |
| **Eminance** | Health Focus | Full EMR + billing, modern UI | MediSwitch + Healthbridge |
| **MeDAP** | MeDAP | Easy to use, cost-effective | MediSwitch + Healthbridge |
| **EZMed** | EZMed Solutions | Cloud-based, modern | MediSwitch + Healthbridge |
| **Medinol** | Medinol | Strong dental features | MediSwitch |
| **Navitas** | Navitas | Specialist-focused | MediSwitch + Healthbridge |
| **iMedPrac** | iMedPrac | Practice + financial management | MediSwitch + Healthbridge |
| **SynchraMed** | SynchraMed | Specialist billing focus | MediSwitch |
| **GoodX Web** | GoodX Software | Cloud version of GoodX | MediSwitch + Healthbridge |

---

## APPENDIX: WORKFLOW INTEGRATION POINTS FOR SOFTWARE DEVELOPMENT

### Critical Data Flows to Model
```
1. Patient Registration → Demographics → Medical Aid Verification → Eligibility Status
2. Appointment Booking → Diary → SMS/WhatsApp Reminder → Check-In
3. Clinical Encounter → Notes → ICD-10 Coding → Tariff Selection → Invoice
4. Invoice → MEDCLM Message → Switch → Scheme → Response → Patient Liability
5. Response → eRA → Bank Reconciliation → Patient Account Update
6. Rejection → Correction → Resubmission → Tracking → Resolution
7. Chronic Application → Authorization → Monthly Dispensing → Annual Renewal
8. Pre-Auth Request → Approval → Linked Claims → Episode Tracking
9. Patient Statement → Payment → Allocation → Account Balance Update
10. Daily Reconciliation → Monthly Reporting → Financial Dashboard
```

### State Machine: Claim Lifecycle
```
DRAFT → SUBMITTED → [ACCEPTED | REJECTED | PENDED]
  ACCEPTED → [PAID_FULL | PAID_PARTIAL] → RECONCILED → CLOSED
  REJECTED → CORRECTED → RESUBMITTED → [ACCEPTED | REJECTED_FINAL]
  PENDED → [ACCEPTED | REJECTED] (after clinical review)
  REJECTED_FINAL → PATIENT_LIABLE → [PAID_BY_PATIENT | WRITTEN_OFF | DEBT_COLLECTION]
  PAID_PARTIAL → PATIENT_SHORTFALL → [PAID_BY_PATIENT | WRITTEN_OFF | DEBT_COLLECTION]
```

### State Machine: Patient Account
```
ZERO_BALANCE → SERVICE_RENDERED → INVOICED → CLAIM_SUBMITTED
  → SCHEME_PAID_FULL → ZERO_BALANCE
  → SCHEME_PAID_PARTIAL → PATIENT_BALANCE → STATEMENT_SENT
    → PATIENT_PAID → ZERO_BALANCE
    → OVERDUE_30 → OVERDUE_60 → OVERDUE_90 → OVERDUE_120+
      → DEBT_COLLECTION | WRITE_OFF | PRESCRIBED (3 years)
```

---

*Compiled from: PHISC MEDCLM v0.912-13.4, CCSA V11 (2024), Medicines Act 101/1965 (s22A, s22F), SAHPRA scheduling guidelines, SADA Dental Codes 2022, BHF tariff publications, CMS regulations, HPCSA practice guidelines, MediKredit/Healthbridge documentation, Discovery/GEMS/Bonitas scheme rules, National Credit Act, SAPC dispensing regulations. Cross-referenced with existing VisioCorp KB files 02 (Claims Adjudication), 03 (Coding Standards), 06 (Pharmaceutical).*
