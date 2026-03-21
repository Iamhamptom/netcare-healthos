# 06 — Pharmaceutical Claims: NAPPI, SEP, Dispensing, DUR
## VisioCorp Health Intelligence KB | Compiled 2026-03-21

---

## NAPPI CODE SYSTEM

### Format
- **7-digit product identifier + 3-digit pack suffix** = 10 digits total
- Pack suffix is ordinal (001=first registered pack, 002=second, etc.)
- **No check digit** — validation = database lookup only
- **~60,000-80,000 active product codes**, 200,000+ total with surgicals
- Updated **weekly** (Tue/Wed) by MediKredit (Altron HealthTech)
- Legacy 6-digit codes → left-padded with 0 for 7-digit

### Access
- **Subscription service** from MediKredit — commercial (no free public API)
- Delivered as structured flat files or CSV/XML
- RESTful API available to contracted switching partners

### Validation Rules
1. Format: numeric, 7 digits (or 10 with pack)
2. Range: within allocated NAPPI ranges
3. Database lookup: must exist and be ACTIVE (not discontinued)
4. Status: not withdrawn or suspended

---

## SEP (SINGLE EXIT PRICE)

### What It Is
- **Maximum manufacturer price** (Medicines Act s22G)
- Includes: manufacturing, packaging, margin, freight, customs, QA
- Excludes: VAT, dispensing fee, logistics fee

### Annual Adjustment
- Published in Government Gazette (Mar/Apr each year)
- Guided by CPI + exchange rate + international benchmarking
- Recent adjustments: 4-5%
- ~15,000-20,000 unique molecules/strengths have SEP values

### When SEP Does NOT Apply
- Section 21 unregistered imports (individual patient use)
- Clinical trial medicines
- Government tender pricing (may be below SEP)
- Surgicals/consumables (no transparent pricing regulation)

---

## DISPENSING FEE SCHEDULE

Calculated on SEP (excluding VAT):

| SEP Range (excl. VAT) | Dispensing Fee |
|------------------------|----------------|
| R0.01 – R107.00 | R8.00 + 46% of SEP |
| R107.01 – R321.00 | R58.00 + 33% of (SEP - R107) |
| R321.01 – R1,100.00 | R128.00 + 15% of (SEP - R321) |
| Above R1,100.00 | **R245.00 (fixed cap)** |

Then add **15% VAT** to dispensing fee.

**Total patient price** = SEP + VAT on SEP + Dispensing Fee + VAT on Fee

### No Difference Chronic vs Acute
Same fee schedule applies regardless of prescription type. Some schemes cap dispensing fees per month for chronic (1 fee per 28-day cycle).

### Compound Medicines
Dispensing fee on total ingredient cost + separate compounding fee (SAPC-regulated).

### Wholesaler Logistics Fee
Maximum ~8% of SEP (verify current Gazette).

---

## SCHEDULE CLASSIFICATION (S0-S8)

| Schedule | Type | Prescribing | Dispensing |
|----------|------|-------------|-----------|
| **S0** | OTC | No script | Any retail |
| **S1** | Pharmacy (OTC) | No script | Pharmacy |
| **S2** | Pharmacy medicine | Pharmacist supervision | Pharmacy |
| **S3** | Pharmacist-initiated | Pharmacist (PCDT), doctor | Pharmacy |
| **S4** | Prescription only | Doctor, dentist, authorized nurse | Pharmacy on script |
| **S5** | Controlled (low) | Doctor, dentist (limited) | Register, retain script |
| **S6** | Controlled (high) | Doctor | Bound register, monthly returns, 5yr retention |
| **S7** | Special authorization | Dir-General permit | Special facility |
| **S8** | Prohibited | Cannot prescribe | Cannot dispense |

### S5/S6 Documentation
- **S5**: Record in register (date, patient, prescriber, medicine, quantity). Script retained.
- **S6**: **Bound register** (sequential). Monthly returns to Provincial Pharmacist Inspector. 5-year retention. Stock reconciliation monthly. Theft/loss → SAPS within 24 hours.

---

## GENERIC SUBSTITUTION (MANDATORY — Medicines Act s22F)

1. Pharmacist **MUST** substitute generic unless:
   - Prescriber writes "no substitution" with clinical reason
   - Patient declines (pays the difference)
   - Generic unavailable
2. Generic must be SAHPRA-registered and therapeutically equivalent
3. **Narrow therapeutic index drugs**: verify SAHPRA interchangeability (anti-epileptics, warfarin)

---

## FORMULARY SYSTEMS

### How Schemes Build Formularies
1. SAHPRA registration → 2. Clinical evidence review → 3. ATC classification grouping → 4. Reference pricing per therapeutic category → 5. Tier assignment → 6. Annual review (January)

### Reference Pricing
- Medicines in same ATC class grouped
- Reference price = lowest-cost generic in category
- Scheme pays up to reference price; member pays difference

### Formulary Tiers (Bonitas Example)
| Tier | Name | Co-payment |
|------|------|-----------|
| A | Formulary (preferred generics) | None/minimal |
| B | Alternate (branded generics) | Low |
| C | Non-formulary (originator brands) | Significant |
| D | Excluded | 100% patient |

---

## DUR (DRUG UTILISATION REVIEW) — 6 REAL-TIME CHECKS

MediKredit DUR engine runs in real-time during claim adjudication:

| Check | What It Does | Severity |
|-------|-------------|----------|
| **Drug-drug interactions** | Cross-refs all active meds | L1=hard reject, L2-3=warning, L4=minor |
| **Drug-allergy** | Checks recorded allergies + cross-allergenicity | Hard reject |
| **Drug-condition contraindication** | Cross-refs ICD-10 on file | Warning/reject |
| **Therapeutic duplication** | Same ATC class, 2+ products | Warning/reject |
| **Dosage range** | Max daily/single dose exceeded | Warning |
| **Age/gender appropriateness** | Pediatric, geriatric, pregnancy flags | Warning |

### DUR Response Codes
- **00**: Passed | **01-09**: Informational | **10-19**: Warnings (acknowledge)
- **20-29**: Soft rejects (override with reason) | **30-39**: Hard rejects (must resolve)

---

## CHRONIC MEDICATION WORKFLOW

### Authorization Process
1. Doctor diagnoses + initiates treatment
2. Chronic application: ICD-10 + NAPPI + dosage + supporting docs
3. Scheme clinical review (CDL criteria, formulary, guidelines)
4. Outcome: Approved (12 months) / Approved with amendment / Declined / Pend
5. Monthly dispensing against auth number
6. Annual renewal with updated clinical info

### Dispensing Cycles
- **28-day**: Discovery, Bonitas, Momentum, GEMS (most schemes)
- **30-day**: Some smaller schemes
- **90-day**: Some schemes allow via courier pharmacy (reduces fees)

### Early Refill Detection
- **Not before 75-80% of supply consumed** (day 21-22 on 28-day)
- Override codes available: travel, lost medication, hospitalization
- Multiple early refills → fraud investigation trigger

### Step Therapy
- First-line must be tried before second-line approved (4-8 weeks minimum)
- Treatment failure documentation required (labs, clinical notes, adverse effects)
- Specialist motivation can bypass step therapy

### Common CDL Medications
| Condition | First-Line |
|-----------|-----------|
| Hypertension | HCTZ, enalapril, amlodipine, losartan |
| Diabetes T2 | Metformin → SU/DPP4i → insulin |
| Hyperlipidaemia | Simvastatin, atorvastatin |
| Asthma | Salbutamol, beclomethasone |
| HIV/AIDS | TLD (tenofovir/lamivudine/dolutegravir) |
| Depression | Fluoxetine, citalopram (SSRI first) |
| Hypothyroidism | Levothyroxine |

---

## PHARMACY CLAIMS EDI (LIN+NAP)

```edifact
LIN+1++7065410:NAP'        (NAPPI code)
QTY+21:30'                  (Quantity: 30 units)
QTY+50:28'                  (Days supply: 28)
MOA+203:150.00'             (SEP amount)
MOA+210:50.00'              (Dispensing fee)
MOA+124:30.00'              (VAT)
MOA+86:230.00'              (Total)
RFF+AUJ:CHR123456'          (Chronic auth number)
CIN+ICD:I10'                (ICD-10: hypertension)
```

### Compound Medicine Coding
Individual ingredients with own NAPPI codes + compounding fee + dispensing fee on total.

---

## VALIDATION ENGINE CHECKLIST

1. NAPPI: 7-digit format + database lookup (active)
2. SEP: claimed price ≤ current SEP (allow VAT)
3. Dispensing fee: calculate max using tiered formula
4. Schedule: prescription present for S3+; register for S5/S6
5. Formulary: match NAPPI to scheme tier; calc co-payment
6. Chronic auth: verify number exists, active, refill timing
7. DUR: interactions, duplications, allergies, contraindications, dosage
8. Generic substitution: flag branded when generic available (s22F)
9. Pack size: quantity matches pack multiples
10. Early refill: days since last vs days supply
