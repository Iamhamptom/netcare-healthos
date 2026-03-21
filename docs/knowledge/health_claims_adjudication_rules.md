# SA Healthcare Claims — Adjudication Rules & Decision Logic
## For: Steinberg, Claims Analyzer, HealthOps, Netcare Health OS Agents
## Compiled: 2026-03-21

---

## ADJUDICATION DECISION FLOWCHART

```
Claim received
  → Eligibility check → FAIL → REJECT
  → Provider check → FAIL → REJECT
  → Code validation (ICD-10, CPT, NAPPI) → FAIL → REJECT
  → Duplicate check → DUPLICATE → REJECT
  → Frequency check → EXCEEDED → REJECT
  → Bundling check → UNBUNDLED → REJECT / ADJUST
  → Benefit check → NO BENEFIT → REJECT
  → Waiting period check → IN WAITING PERIOD → REJECT (unless PMB)
  → Pre-auth check (if required) → NO AUTH → PEND / REJECT
  → PMB check → IS PMB → override certain rejections, pay from risk
  → Tariff comparison → amount <= scheme tariff → PAY_IN_FULL
                       → amount > scheme tariff → PAY_PARTIAL
  → Co-payment rules → applies → PAY_PARTIAL (minus co-pay)
  → Savings/Risk allocation → MSA has funds → deduct from MSA
                             → MSA depleted → check ATB / self-payment gap
  → All clear → PAY
```

---

## 1. MEMBER ELIGIBILITY CHECK

**Fields validated:**
- Membership number (format varies by scheme)
- Dependant code (00=principal, 01=spouse, 02+=children)
- Date of birth (cross-checked against SA ID: positions 1-6 = YYMMDD)
- Gender (SA ID positions 7-10: ≥5000=male, <5000=female)
- Active membership (not suspended/terminated/lapsed)
- Plan/option (determines benefit structure)
- Waiting period status

**Real-time eligibility (via switch):**
```
Request:  Member ID + Dependant Code + Date of Service + Provider BHF
Response: Eligible (Y/N) + Plan Option + Benefit Status + Outstanding Balance + Waiting Period Flag
```

---

## 2. PROVIDER VALIDATION

- **BHF Practice Number**: 7 digits, must be active in BHF register
- **HPCSA Registration**: Must be current and valid
- **Discipline code**: Must match procedures being billed (GP=14 cannot bill specialist codes for ortho=18)
- **Banking details**: Must be on file for EFT payment

### BHF Provider Type Codes
| Code | Type | Code | Type |
|------|------|------|------|
| 01/14 | GP | 40-41 | Dental |
| 02/15 | Specialist/Physician | 50-61 | Allied health |
| 16 | Surgeon | 60 | Optometrist |
| 17 | Gynaecologist | 70 | Pharmacy |
| 18 | Orthopaedic | 71 | Nursing |
| 28 | Anaesthetist | 80-89 | Facility (no discipline check) |
| 36 | Physiotherapist | 86 | Pharmacist |
| 47 | Clinical Psychologist | 90 | Ambulance |

---

## 3. ICD-10 VALIDATION (SA USES WHO ICD-10, NOT US ICD-10-CM)

**Format**: Letter + 2 digits + optional decimal + 1-2 digits. Regex: `/^[A-Z]\d{2}(\.\d{1,2})?$/`

**Validation checks:**
1. Code must exist in SA ICD-10 Master Industry Table (MIT, 2014 edition)
2. Code must be valid as primary (asterisk codes CANNOT be primary)
3. **Gender validation**: N40-N51, C60-C63 = male only. O00-O99, N70-N98, C51-C58 = female only
4. **Age validation**: P00-P96 = age 0-1 only. M80.0 = female 45+ only
5. **External cause codes (V01-Y98)**: NEVER primary. MUST accompany injury codes (S/T chapter)
6. **4th character specificity**: Required where classification mandates. Discovery demands maximum specificity
7. Cannot have both diabetes T1 (E10) and T2 (E11) simultaneously
8. "Possible" or "query" diagnoses must NOT be coded as confirmed

**Auto-rejection triggers:**
- Missing ICD-10 code entirely (~30% of all rejections)
- Injury codes (S00-T98) without mandatory External Cause Code
- Gender-inappropriate codes
- Codes not in current MIT

---

## 4. TARIFF/PROCEDURE CODE VALIDATION

**SA uses CCSA codes (4-5 digits), NOT American CPT.**

| Range | Discipline | Example |
|-------|-----------|---------|
| 0190-0199 | GP consultations | 0190 = standard (R520) |
| 0141-0149 | Specialist consultations | 0141 = specialist (R950) |
| 0197 | Telehealth consult | R440 |
| 0290 | After-hours | R780 |
| 0308-0382 | Diagnostic procedures | 0308=ECG, 0312=spirometry |
| 0400-0410 | Minor surgery | 0400=wound suturing |
| 0500-0515 | MRI/CT imaging | Pre-auth required |
| 0600-0605 | Physiotherapy | Pre-auth after 6 sessions |
| 0700-0711 | Psychology/Psychiatry | Pre-auth after 6 sessions |
| 0800-0821 | Major surgery | Always pre-auth |
| 3600-3612 | Hospital admissions | Always pre-auth |
| 8101-8701 | Dental | Various |

**Modifier codes:**
| Modifier | Meaning | Rate Impact |
|----------|---------|-------------|
| 0007 | Own monitoring equipment | — |
| 0008 | Specialist surgeon assistant | 1/3 of fee |
| 0009 | Full fee for second condition | — |
| 0010 | Related procedure | — |
| 0011 | After-hours | +50-100% |
| 0012 | Emergency/urgency | Premium |
| 0018 | Bilateral procedure | 150% of unilateral |

**Unbundling rules (40+)**: Cannot bill component procedures separately when a bundled code exists. E.g., full blood count includes haemoglobin, WCC, differential, platelet — billing individually = fraud.

---

## 5. NAPPI CODE VALIDATION (Medicines)

**Format**: Up to 13 digits. Regex: `/^\d{1,13}$/`

**Checks:**
1. Code exists in active NAPPI database (maintained by MediKredit, updated daily)
2. Code not delisted
3. Schedule (S0-S8) appropriate for prescribing provider
4. SEP (Single Exit Price) + dispensing fee not exceeded
5. Formulary check (on-formulary vs off-formulary)
6. Chronic authorization on file for CDL medications
7. Quantity matches dosage and days supply
8. Generic substitution rules (Medicines Act mandates generic unless "no substitution" specified)

---

## 6. DUPLICATE DETECTION

```
Rule 1 (Exact): Same member + same date + same procedure + same provider → AUTO_REJECT
Rule 2 (Suspicious): Same member + same date + same procedure + DIFFERENT provider → PEND_FOR_REVIEW
Rule 3 (Frequency): Same member + same procedure within minimum interval → PEND_FOR_REVIEW
```

---

## 7. BENEFIT POOL ROUTING

```
Is this IN-HOSPITAL?
├── YES → Risk Pool (Hospital Benefit). Pre-auth required.
└── NO → Is this an approved CHRONIC condition (CDL)?
          ├── YES → Chronic Benefit pool (not savings)
          └── NO → Is this a PMB condition?
                    ├── YES → Risk Pool (PMB overrides all limits)
                    └── NO → Day-to-Day?
                              ├── YES → Medical Savings Account (MSA)
                              │   IF MSA depleted → Self-Payment Gap
                              │   IF threshold crossed → Above Threshold Benefit (ATB)
                              └── NO → Relevant sub-benefit
```

---

## 8. CO-PAYMENT CALCULATION

```
co_payment = 0

IF provider NOT IN scheme.dsp_network:
    co_payment += claim_amount × non_dsp_percentage (typically 20-40%)

IF medicine.is_brand AND generic_equivalent_exists:
    co_payment += (brand_price - generic_reference_price)

IF claimed_amount > scheme_tariff:
    member_shortfall = claimed_amount - scheme_tariff (separate from co-pay)

IF is_PMB AND provider IS DSP:
    co_payment = 0  // LEGALLY CANNOT apply co-payments to PMBs at DSP

payment_to_provider = MIN(claimed_amount, scheme_tariff) - co_payment
```

---

## 9. PRE-AUTHORIZATION REQUIREMENTS

| Category | Pre-Auth | Turnaround |
|----------|----------|------------|
| Hospital admission (planned) | All schemes | 48hrs+ before |
| Hospital admission (emergency) | Retrospective within 48hrs | — |
| MRI/CT/PET scans | All schemes | 2 days |
| Surgery (elective) | All schemes | 3 days |
| Physiotherapy | After 6 sessions | 1 day |
| Psychology | After 6 sessions | 2 days |
| Oncology | All schemes | 5 days |
| Chronic medication initiation | CDL conditions | 5 days |
| High-cost (>R5,000) | Most schemes | 2 days |

**PMB conditions override pre-auth requirements** (scheme must cover regardless), EXCEPT oncology which always requires treatment plan approval.

### Auth-to-Claim Matching
- auth.member_id must match claim.member_id
- auth.admission_date must match claim.date_of_service (within tolerance)
- auth.icd10_code must match claim.primary_diagnosis
- auth.status must be APPROVED (not expired/cancelled)
- auth validity: **3 months** — must re-obtain if lapsed

---

## 10. FREQUENCY LIMITS

| Procedure | Limit |
|-----------|-------|
| Mammogram (screening) | 1/24 months (40-54), 1/12 months (55+) |
| Pap smear | 1/36 months (if normal) |
| Eye test | 1/24 months |
| Dental scale & polish | 2/12 months |
| Dental X-rays (full mouth) | 1/36 months |
| Blood glucose (non-diabetic) | 1/12 months |
| Cholesterol (low risk) | 1/60 months |
| DEXA bone density | 1/24 months |
| Colonoscopy (screening, 50+) | 1/60 months |
| PSA test (45+) | 1/12 months |

---

## 11. MANAGED CARE PROTOCOLS

### Step Therapy
```
Step 1: Generic first-line agent → minimum trial period
Step 2: If Step 1 documented failure → second-line approved
Step 3: If Step 2 failure → specialist motivation required for third-line
```

### Generic Substitution (Medicines Act)
Mandatory unless: prescriber writes "no substitution" with clinical reason, OR patient declines (pays difference), OR generic unavailable.

---

## 12. STANDARD REJECTION CODES (25 BHF CODES)

| Code | Description | Auto-Resubmit? |
|------|-------------|----------------|
| 01 | Member not found | No |
| 02 | Membership number incorrect | No |
| 03 | Dependent code invalid | No |
| 04 | Member suspended (arrears) | No |
| 05 | Duplicate claim | No |
| 07 | Benefit exhausted | Yes (PMB motivation) |
| 08 | Pre-auth not obtained | Yes (retrospective) |
| 09 | Service not covered | No |
| 10 | Provider not on network | No |
| 11 | Past filing deadline | No |
| 12 | ICD-10 invalid/unspecified | Yes (correct to 4th char) |
| 13 | Above scheme tariff | Dispute-worthy |
| 14 | Co-payment applied | No |
| 15 | Paid at scheme rate | Dispute-worthy |
| 16 | PMB — paid at cost | No |
| 17 | Waiting period | No |
| 18 | CPT invalid for diagnosis | Yes (correct code) |
| 19 | Quantity exceeds limit | Yes (adjust + motivate) |
| 21 | Referring provider required | Yes (add referral) |
| 24 | Above-threshold case mgmt | No |

### Discovery-Specific Codes
| Code | Meaning |
|------|---------|
| 59 | Tariff code incorrect or not supplied |
| 02 | Doctor's account required |
| 03 | Medical aid statement required |
| 04 | Authorization letter required |
| 54 | Illegible documents |
| 70 | Specialist account required |

---

## 13. CLEAN CLAIM SUBMISSION CHECKLIST

### Pre-Submission
- [ ] Member eligibility confirmed (active, no waiting periods)
- [ ] Member details verified (name, ID, membership number, DOB match card)
- [ ] Dependent registered
- [ ] Provider PCNS/BHF number valid and active
- [ ] Pre-authorization obtained (if required), dates cover service, scope matches

### Coding
- [ ] ICD-10 correct, specific, current, properly sequenced (PDX first)
- [ ] External Cause Code included for injury/poisoning (S00-T98)
- [ ] Tariff code correct and matches ICD-10 logically
- [ ] NAPPI code valid (pharmacy/device), pack size verified
- [ ] Modifiers correctly applied
- [ ] No unbundling (comprehensive code used if available)
- [ ] PMB flag set if on DTP or CDL list

### Administrative
- [ ] Within 4-month (120-day) window
- [ ] No duplicate already submitted
- [ ] DSP/network status confirmed
- [ ] Clinical motivation attached if required

---

## KEY STATISTICS

| Metric | Value |
|--------|-------|
| Industry rejection rate | 15-20% |
| #1 rejection reason | Incorrect/missing ICD-10 (~30%) |
| ICD-10 coding accuracy (practitioners) | 74% |
| ICD-10 coding completeness | 45% |
| Annual fraud losses | R22-28 billion |
| CMS complaints (PMB-related) | ~40% |
| PMB appeals won by members | 69.4% |
| Claims paid annually | R259.3 billion |
| Total beneficiaries | 9.17 million |
| Discovery auto-adjudication rate | 78% |
