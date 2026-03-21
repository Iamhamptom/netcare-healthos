# 07 — Fraud, Waste & Abuse Detection
## VisioCorp Health Intelligence KB | Compiled 2026-03-21

---

## THE R22-28 BILLION PROBLEM

- **7-10% of total medical scheme expenditure** lost to FWA annually
- Total expenditure ~R230-280B → **R22-28B in losses**
- **Fraud** (intentional): 20-25% = R4-7B
- **Waste** (unnecessary, no intent): 50-55% = R11-15B ← **BIGGEST**
- **Abuse** (improper, grey area): 20-30% = R5-8B
- Scheme recoveries: ~R1-1.5B/yr. Recovery rate: 30-40%. ROI: R1 → R4-6

### Breakdown by Type
| Type | % | Est. Loss |
|------|---|-----------|
| Over-servicing (Waste) | 30-35% | R7-9B |
| Upcoding | 15-20% | R3-5B |
| Unbundling | 10-15% | R2-4B |
| Phantom billing | 8-12% | R2-3B |
| Prescription fraud | 8-10% | R2-3B |
| Duplicate billing | 5-8% | R1-2B |
| Collusion | 5-8% | R1-2B |
| Identity fraud | 3-5% | R0.7-1.4B |
| Other | 5-7% | R1-2B |

**Key insight**: Biggest savings = waste reduction (clinical appropriateness), NOT fraud detection.

---

## 8 FRAUD PATTERNS + DETECTION RULES

### 1. Unbundling (10-15%)
- Laparoscopic cholecystectomy billed as trocar + pneumoperitoneum + lap + cholecystectomy + wound closure
- FBC billed as haemoglobin + WCC + platelet + differential (3-5x inflation)
- **Detection**: Bundling rules engine. Flag component codes together on same date/patient.

### 2. Upcoding (15-20%)
- Billing Level 3-4 (0192-0193) for simple encounters
- **Red flag**: >70% at Level 3-4 when peer avg is 20-30%
- **Detection**: Distribution analysis vs peers. Diagnosis-level correlation. Time analysis (40 patients × 45min = 30hrs → impossible).

### 3. Phantom Billing (8-12%)
- Claims for dates practice closed, deceased patients, hospitalized patients
- **Detection**: Cross-ref DHA death register. Match hospital admissions. Post-payment surveys.

### 4. Duplicate Billing (5-8%)
- Same service to multiple schemes. Resubmitting rejected claims with altered details.
- **Detection**: Exact match (same all fields). Fuzzy match (±3 days). High reversal patterns.

### 5. After-Hours Fraud
- Applying modifiers 0010-0014 to normal-hours services
- **Detection**: 60% after-hours when peer avg is 15% → flag. Weekday daytime with after-hours modifier.

### 6. Prescription Fraud (8-10%)
- Forged scripts, pharmacy hopping, phantom dispensing
- **Detection**: DDD analysis (>90 S5 tablets/month). Same patient + drug class + 3+ pharmacies in 30 days.

### 7. Balance Billing at DSP (Illegal)
- DSP charging PMB patients co-payments that should be covered
- **Detection**: Flag out-of-pocket for PMB at DSP. Cross-ref contracts vs billing.

### 8. Identity Fraud
- Card lending to unregistered family/friends
- **Detection**: Biometric verification. Geographic impossibility. Age/gender mismatch.

---

## DETECTION ALGORITHMS

### Peer Comparison (Backbone of SA FWA Systems)
**Peer group**: Same discipline + region + practice type + case-mix adjusted

**9 Metrics**: Avg cost/patient, avg cost/consult, consult frequency, procedure:consult ratio, script:consult ratio, referral rate, items/script, modifier usage, chronic:acute ratio

**Method**: Z-scores. Flag at >2 SD (amber) or >3 SD (red). Composite score 0-100.

### Benford's Law
- First-digit distribution of claim amounts should follow logarithmic pattern
- Round-number clustering (R500, R4999) = manipulation
- Need minimum ~500 transactions for significance
- Chi-squared or KS test for deviation

### Time Impossibilities
```
Per provider, per day:
  total_minutes = SUM(procedure minimum durations)
  > 960min (16hrs) → HIGH confidence flag
  > 720min (12hrs) → MEDIUM confidence flag
```
- GP >50 consults/day = impossible
- Specialist >25/day = impossible
- Surgeon >6 major/day = impossible

### Geographic Impossibilities
- 2 facilities >100km apart within 2 hours → impossible
- Patient in 2 locations >50km apart same day → identity fraud

### Seasonal Deviation
- Flat pattern when peers show seasonal variation → fabrication
- Counter-seasonal (flu treatments in summer)

---

## MEDSCHEME/AFROCENTRIC FWA SYSTEM

**Scale**: R37B claims/yr, 3.9M lives, 300 investigations/month

### ML Features
**Provider**: volume, avg value, consult level distribution, code diversity, panel size, referral patterns, rejection rates
**Patient**: visit frequency, multi-provider usage, benefit utilization, geographic dispersion
**Claim**: code combinations, bundling compliance, diagnosis-procedure alignment, time/day
**Network**: referral graph centrality, patient-provider bipartite anomalies

### Three-Tier Scoring (Real-time, <30s SLA)
- **Green (0-30)**: Auto-adjudicate
- **Amber (31-70)**: Clinical review queue
- **Red (71-100)**: Forensic investigation hold

Score = weighted ensemble: rules + statistical anomaly + ML (gradient boosted trees) + network analysis

### Recovery: R200-400M/yr. ROI: 4-6x.

---

## CMS SECTION 59 — RACIAL BIAS (MANDATORY READING)

### Findings (April 2025, Adv Ngcukaitobi)
- **Discovery, GEMS, Medscheme**: systemic racial discrimination against Black providers (2012-2019)
- Location scoring → **2-3x higher investigation probability** for township/rural practices
- Billing patterns in underserved areas (higher volume, more after-hours) flagged as "anomalous"
- Solo practitioners disadvantaged (more common among Black practitioners)

### 10 MANDATORY Bias Safeguards for AI Systems
1. **Demographic parity**: Flag rates proportional across racial groups
2. **Equalized odds**: Equal false positive rates across demographics
3. **Location debiasing**: Practice location CANNOT be a risk factor
4. **Stratified peer groups**: Urban vs rural vs peri-urban, within discipline
5. **Case-mix adjustment**: Higher acuity in underserved areas is EXPECTED
6. **Outcome monitoring**: Track flag-to-confirmed ratio by demographics
7. **Explainability**: Every flag needs clear, auditable reason
8. **Multi-signal convergence**: No single-metric flags
9. **Quarterly bias audits** by independent third parties
10. **Human review** before any automated action — AI flags, humans decide

---

## LEGAL FRAMEWORK

| Law | Application |
|-----|-------------|
| POCA (Act 121/1998) | Healthcare fraud syndicates = organized crime. Threshold >R100,000. Asset seizure. |
| Medical Schemes Act s59 | Schemes may investigate + recover. Can deduct from future benefits. |
| HPCSA | Fraud = unprofessional conduct. Penalties: fine → suspension → erasure. 2-5 years to resolve. |
| Criminal (SAPS) | For egregious cases. Beyond reasonable doubt standard. |
| Civil (90% of recoveries) | Balance of probabilities. Faster, cheaper. Provider repayment plans. |

### Provider Rights During Investigation
- Right to be informed of investigation nature
- Right to legal representation
- Right to access evidence (audi alteram partem)
- Right to respond before adverse finding
- Right to continue practicing unless HPCSA suspends
- Right to appeal through CMS or courts

---

## RECOMMENDED AI ARCHITECTURE

### Layer 1 — Real-Time Rules (<500ms)
Time/geographic impossibilities, deceased patient, gender/age mismatch, bundling violations, duplicates

### Layer 2 — Statistical Analysis (batch daily/weekly)
Peer comparison z-scores, Benford's Law, frequency analysis, seasonal deviation

### Layer 3 — ML Models (scored real-time, trained batch)
Gradient boosted trees (claim risk), neural network (provider behavior), graph neural network (collusion), isolation forest (novel patterns)

### Layer 4 — Investigation Workflow
Case management, evidence packaging, outcome tracking, feedback loop to retrain models
