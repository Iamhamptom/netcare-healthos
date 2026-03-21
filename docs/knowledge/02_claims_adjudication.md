# 02 — Claims Adjudication Rules & Decision Logic
## VisioCorp Health Intelligence KB | Compiled 2026-03-21

---

## ADJUDICATION DECISION FLOWCHART

```
Claim received
  → 1. ELIGIBILITY → Member active? Dep registered? Waiting period? → FAIL → REJECT
  → 2. PROVIDER → BHF valid? HPCSA current? Discipline matches? → FAIL → REJECT
  → 3. CODE VALIDATION → ICD-10 valid? Tariff valid? NAPPI valid? → FAIL → REJECT
  → 4. DUPLICATE CHECK → Same member+date+procedure+provider? → YES → REJECT
  → 5. FREQUENCY CHECK → Exceeded per-year/lifetime limit? → YES → REJECT
  → 6. BUNDLING CHECK → Components billed separately? → YES → REJECT/ADJUST
  → 7. BENEFIT CHECK → Benefit available for this category? → NO → REJECT
  → 8. WAITING PERIOD → In general/condition-specific wait? → YES → REJECT (unless PMB)
  → 9. PRE-AUTH CHECK → Required but missing? → YES → PEND/REJECT
  → 10. PMB CHECK → Is this a PMB condition?
       → YES → Override rejections for benefit exhaustion, waiting periods, savings depletion
       → Pay from RISK pool (never savings)
  → 11. TARIFF → Amount ≤ scheme tariff → PAY_IN_FULL
                → Amount > scheme tariff → PAY_PARTIAL (member pays shortfall)
  → 12. CO-PAYMENT → Non-DSP? Off-formulary? → Deduct co-pay
  → 13. BENEFIT ROUTING → MSA → Gap → ATB → Risk (see decision tree)
  → 14. CLINICAL RULES → Suspicious pattern? → PEND_FOR_REVIEW
  → ALL CLEAR → PAY
```

### Four Possible Outcomes
1. **PAY_IN_FULL**: All validation passed, amount ≤ scheme tariff, benefit available
2. **PAY_PARTIAL**: Validated but amount > tariff, or co-payment applies, or benefit partially depleted
3. **REJECT**: Hard validation failure (invalid code, no eligibility, duplicate, frequency exceeded)
4. **PEND_FOR_REVIEW**: Soft flags (suspicious pattern, clinical review needed, above threshold)

---

## 1. MEMBER ELIGIBILITY

**Fields validated**: Membership number, dependent code (00=principal, 01-09=deps), DOB (SA ID positions 1-6), gender (SA ID 7-10: ≥5000=male), active status, plan/option, waiting period status.

**Real-time via switch**: Member ID + Dep Code + DOS + Provider BHF → Eligible Y/N + Plan + Benefits + Balance

---

## 2. PROVIDER VALIDATION

- **BHF Practice Number**: 7 digits, must be active. Verify: pcns.co.za/Search/Verify
- **HPCSA Registration**: Must be current
- **Discipline code**: Must match procedures (GP=01/14 cannot bill specialist codes=02/15)

| Code | Type | Code | Type |
|------|------|------|------|
| 01/14 | GP | 40-41 | Dental |
| 02/15 | Physician | 50-59 | Allied health |
| 16 | Surgeon | 60 | Optometrist |
| 18 | Orthopaedic | 70 | Pharmacy |
| 28 | Anaesthetist | 80-89 | Facility (skip discipline check) |
| 36 | Physiotherapist | 90 | Ambulance |

---

## 3. ICD-10 VALIDATION (SA uses WHO ICD-10, NOT US ICD-10-CM)

**Format**: `^[A-Z]\d{2}(\.\d{1,4})?$`

| Check | Rule |
|-------|------|
| Existence | Must be in SA ICD-10 MIT (2014 edition) |
| Primary validity | Column K = "Y" (asterisk codes CANNOT be primary) |
| Gender | N40-N51, C60-C63 = male only. O00-O99, N70-N98 = female only |
| Age | P00-P96 = neonates only. O00-O99 = reproductive age 12-55 |
| External cause | S/T injury codes MUST have V01-Y98 as secondary (SA MANDATORY) |
| Specificity | 4th character required where classification mandates. Discovery = STRICT |
| Conflicts | Cannot have both E10 (T1DM) and E11 (T2DM) |
| R-codes | Valid but may trigger review if definitive diagnosis available |

**Auto-rejection triggers**: Missing ICD-10 (30% of rejections), injury without ECC, gender mismatch, code not in MIT

---

## 4. TARIFF VALIDATION

**SA uses 4-digit CCSA codes (~9,000-10,000 active), NOT American CPT.**

| Check | Rule |
|-------|------|
| Existence | Must exist in scheme's active tariff table |
| Discipline match | Code within scope of provider's discipline |
| Modifier validity | Valid for the procedure type |
| Amount | Must not exceed scheme's maximum rate |
| Diagnosis match | ICD-10 must clinically justify the procedure |

---

## 5. NAPPI VALIDATION

| Check | Rule |
|-------|------|
| Format | 7-digit product + 3-digit pack suffix. `/^\d{1,13}$/` |
| Existence | Must be active in NAPPI database (updated weekly) |
| Schedule | S3+ requires prescription from appropriate prescriber |
| SEP | Price must not exceed Single Exit Price + dispensing fee |
| Formulary | On-formulary vs off-formulary (affects co-payment) |
| Chronic auth | CDL medications need active authorization |
| DUR | Drug interactions, allergies, duplications, dosage range |

---

## 6. DUPLICATE DETECTION

```
Rule 1 (Exact): Same member + date + procedure + provider → AUTO_REJECT
Rule 2 (Suspicious): Same member + date + procedure + DIFFERENT provider → PEND
Rule 3 (Frequency): Same member + procedure within minimum interval → PEND
```

---

## 7. BENEFIT POOL ROUTING

```
IN-HOSPITAL? → Risk Pool (pre-auth required)
CHRONIC CDL? → Chronic Benefit (not savings)
PMB CONDITION? → Risk Pool (overrides all limits)
DAY-TO-DAY? → MSA first
  MSA has funds → deduct → PAY
  MSA depleted → Self-Payment Gap
  Threshold crossed → Above Threshold Benefit (ATB)
```

---

## 8. CO-PAYMENT CALCULATION

```python
co_payment = 0
if provider NOT IN dsp_network:
    co_payment += amount × non_dsp_rate  # typically 20-40%
if medicine.is_brand AND generic_exists:
    co_payment += (brand_price - generic_reference_price)
if is_PMB AND provider IS DSP:
    co_payment = 0  # LEGALLY CANNOT co-pay PMBs at DSP
member_shortfall = max(0, claimed - scheme_tariff)  # separate from co-pay
payment = min(claimed, scheme_tariff) - co_payment
```

---

## 9. PRE-AUTHORIZATION

| Category | Pre-Auth? | Turnaround |
|----------|-----------|------------|
| Hospital admission (planned) | YES — all schemes | 48hrs before |
| Hospital admission (emergency) | Retrospective within 48hrs | — |
| MRI/CT/PET scans | YES | 2 days |
| Surgery (elective) | YES | 3 days |
| Physiotherapy | After 6 sessions | 1 day |
| Psychology | After 6 sessions | 2 days |
| Oncology | YES (always) | 5 days |
| Chronic medication init | CDL conditions | 5 days |

**PMBs override pre-auth** (scheme must cover regardless), EXCEPT oncology (treatment plan required).
**Auth validity**: 3 months — re-obtain if lapsed.

---

## 10. FREQUENCY LIMITS

| Procedure | Limit |
|-----------|-------|
| Mammogram (screening) | 1/24mo (40-54), 1/12mo (55+) |
| Pap smear | 1/36mo (if normal) |
| Eye test | 1/24mo |
| Dental scale & polish | 2/12mo |
| Blood glucose (non-diabetic) | 1/12mo |
| Colonoscopy (screening, 50+) | 1/60mo |
| PSA (45+) | 1/12mo |

---

## 11. REJECTION CODES (25 BHF + Discovery-Specific)

### 25 Standard BHF Adjustment Codes

| Code | Description | Resubmit? |
|------|-------------|-----------|
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
| 12 | ICD-10 invalid/unspecified | Yes (correct code) |
| 13 | Above scheme tariff | Disputable |
| 14 | Co-payment applied | No |
| 15 | Paid at scheme rate | Disputable |
| 16 | PMB — paid at cost | No |
| 17 | Waiting period | No |
| 18 | CPT invalid for diagnosis | Yes (correct) |
| 19 | Quantity exceeds limit | Yes (motivate) |
| 21 | Referring provider required | Yes (add) |
| 24 | Above-threshold case mgmt | Disputable |
| 25 | Therapeutic substitution available | No |

### Discovery-Specific Codes
| Code | Meaning |
|------|---------|
| 59 | Tariff code incorrect/not supplied |
| 02 | Doctor's account required |
| 04 | Authorization letter required |
| 54 | Illegible documents |

---

## 12. CLEAN CLAIM CHECKLIST

### Pre-Submission
- [ ] Member eligibility confirmed (active, no waiting)
- [ ] Member details verified (name, ID, membership, DOB)
- [ ] Provider BHF/PCNS valid and active
- [ ] Pre-authorization obtained if required

### Coding
- [ ] ICD-10 correct, specific, current, PDX first
- [ ] External Cause Code for injury/poisoning (S00-T98)
- [ ] Tariff code matches diagnosis logically
- [ ] NAPPI valid, pack size correct (pharmacy)
- [ ] Modifiers applied correctly
- [ ] No unbundling (comprehensive code used)
- [ ] PMB flag set if DTP or CDL

### Administrative
- [ ] Within 4-month (120-day) window
- [ ] No duplicate submitted
- [ ] DSP/network confirmed
- [ ] Clinical motivation attached if required

---

## SUBMISSION DEADLINES

| Rule | All Schemes |
|------|-------------|
| Initial submission | 4 months (120 days) from DOS |
| Resubmission after rejection | 60 days from rejection date |
| Scheme must pay/reject | 30 days from receipt |
| Pre-auth (planned) | 48+ hours before |
| Pre-auth (emergency) | Within 48 hours after |

---

## 7-STEP APPEALS PROCESS

1. **Internal** → contact scheme (30 days)
2. **Principal Officer** → written complaint
3. **Dispute Committee** → formal appeal (60-120 days)
4. **CMS Complaint (s47)** → 120-day resolution, **FREE**
5. **CMS Appeal (s48)** → within 3 months, **FREE**
6. **Appeal Board (s50)** → 60 days. **High Court powers**
7. **High Court** → final recourse, costly
