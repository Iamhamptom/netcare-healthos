# 14 — Claims Rejection Patterns, Prediction & Auto-Correction
## VisioCorp Health Intelligence KB | Compiled 2026-03-21

---

## PURPOSE
This file provides the data foundation for building a **Claims Rejection Analyzer AI** — covering rejection frequency data, prediction features, auto-correction patterns, and benchmarking metrics specific to the South African medical schemes ecosystem.

---

## 1. INDUSTRY-LEVEL REJECTION STATISTICS

### Overall Rejection Rate
| Metric | Value | Source |
|--------|-------|--------|
| Industry rejection rate (all schemes) | **15-20%** of claims | CMS Industry Report 2024 |
| Member out-of-pocket from denied claims | **R40 billion/year** | CMS 2023/24 via SmartAboutMoney |
| Total benefits paid | R259.3 billion (2024) | CMS Industry Report 2024 |
| Total contributions collected | R232 billion (2023/24) | CMS Annual Report 2024/25 |
| Beneficiaries affected | 9.17 million | CMS 2024 |
| Members who complained about denials | ~2,000 (of millions affected) | CMS 2024/25 |
| Complaints resolved in member's favour | **>50%** | CMS via News24 |
| ICD-10 coding accuracy (industry avg) | **74%** | CMS/Industry benchmarks |

### Rejection Rate by Cause (Estimated Distribution)

| Rank | Rejection Cause | % of All Rejections | Auto-Correctable? |
|------|-----------------|--------------------|--------------------|
| 1 | **Incorrect/missing ICD-10 code** | **30%** | Partially (specificity fix) |
| 2 | **Incomplete documentation** | **25%** | Partially (auto-attach) |
| 3 | **Benefit exhausted** | **12-15%** | No (PMB motivation needed) |
| 4 | **Pre-authorization missing** | **10-12%** | Partially (retrospective) |
| 5 | **Tariff code mismatch** | **8-10%** | Yes (code correction) |
| 6 | **Duplicate claim** | **5-7%** | No (genuine duplicate) |
| 7 | **Member eligibility (suspended/inactive)** | **4-6%** | No (admin issue) |
| 8 | **Non-DSP provider** | **3-5%** | No (patient choice) |
| 9 | **Filing deadline exceeded** | **2-3%** | No (time-barred) |
| 10 | **Frequency limit exceeded** | **2-3%** | Yes (motivate medical necessity) |

### Sources of Rejection Cause Data
- CMS Annual Reports 2020-2024 (complaint categories)
- Competition Commission Health Market Inquiry (HMI) — Funders Report & Practitioners Report (2019)
- HPCSA Booklet 20 coding error analysis
- Practice management vendor aggregates (Healthbridge, Practice Perfect, MediPractice)

---

## 2. REJECTION RATES BY MEDICAL SCHEME

### Scheme Strictness Ranking (Most to Least Rejections)

| Rank | Scheme | Est. Rejection Rate | Key Strictness Factors | Unpaid Claims Trend |
|------|--------|--------------------|-----------------------|---------------------|
| 1 | **Discovery Health** | **18-22%** | Maximum ICD-10 specificity (4th char mandatory), clawbacks months/years later, 78% auto-adjudication (FICO Blaze), strictest coding rules | Moderate — aggressive auto-adjudication |
| 2 | **Momentum Health** | **15-20%** | Strict pre-auth requirements (all hospital, MRI/CT/PET), PMB requires practice letter, >10% unpaid claims (HMI 2014 data) | High — per HMI Funders Report |
| 3 | **Medihelp** | **15-20%** | >10% unpaid claims (HMI 2014), short resubmission window (60 days), last workday of 4th month deadline | High — per HMI Funders Report |
| 4 | **GEMS** | **12-16%** | 9-digit membership (leading zeros catch errors), 60-day dispute turnaround (longest), rigid PMB interpretation, state as DSP | Low — per HMI Funders Report |
| 5 | **Bonitas** | **10-15%** | 30% co-payment for off-formulary (not rejection per se), GP referral required for specialists on certain plans | Low — per HMI Funders Report |
| 6 | **Bestmed** | **10-14%** | Self-administered, fewer auto-adjudication rules, smaller scale | Low |

### Scheme-Specific Rejection Codes

**Discovery Health** (most complex):
| Code | Meaning | Frequency |
|------|---------|-----------|
| 59 | Tariff code incorrect/not supplied | Very High |
| 02 | Doctor's account required | High |
| 04 | Authorization letter required | High |
| 54 | Illegible documents | Medium |

**GEMS**:
- 9-digit membership errors (leading zero omission) — common
- Missed appointment claims — auto-rejected
- Non-contracted provider for in-hospital — rejected or co-paid

**Bonitas**:
- Off-formulary drug claims — 30% co-payment (not full rejection)
- Missing GP referral for specialist (Standard/Standard Select plans)

---

## 3. REJECTION RATES BY MEDICAL DISCIPLINE

### Estimated Rejection Rates by Provider Type

| Discipline | Code Range | Est. Rejection Rate | Primary Rejection Reasons |
|------------|-----------|---------------------|---------------------------|
| **GP (General Practice)** | 01/14 | **12-15%** | ICD-10 unspecified (R-codes), consultation limits, chronic coding errors |
| **Specialist (Physician)** | 02/15 | **18-22%** | Pre-auth missing, tariff exceeds scheme rate, referral missing |
| **Surgeon** | 16/18 | **20-25%** | Pre-auth missing, bundling violations (billing components separately), modifier errors |
| **Dental** | 40-41 | **10-14%** | Frequency limits (scale & polish 2/yr), benefit exhaustion, annual limits |
| **Physiotherapy** | 36 | **15-20%** | Session limit exceeded (>6 without auth), diagnosis-procedure mismatch, ICD-10 specificity |
| **Pharmacy** | 70 | **8-12%** | Off-formulary, NAPPI errors, DUR conflicts, chronic auth expired, SEP exceeded |
| **Radiology** | 20-22 | **20-25%** | Pre-auth missing (MRI/CT/PET mandatory), clinical motivation absent |
| **Pathology** | 23-25 | **10-15%** | Frequency limits, duplicate tests, profile unbundling |
| **Optometry** | 60 | **8-12%** | Eye test frequency (1/24mo), benefit year limits, frame/lens limits |
| **Psychology** | 50-59 | **15-20%** | Session limits (15-21/yr), pre-auth after 6 sessions, ICD-10 specificity |
| **Anaesthesiology** | 28 | **15-18%** | Time unit disputes, modifier errors, surgeon code mismatch |

### HMI Practitioner Findings (CompCom 2019)
- **Gynaecologists**: High and increasing unpaid proportions
- **Orthopaedic surgeons**: High and increasing unpaid proportions
- **Dermatologists**: High and increasing unpaid proportions
- **General surgeons**: Very high initial unpaid level, but decreasing trend

---

## 4. MOST COMMONLY REJECTED ICD-10 CODES

### Codes That Trigger High Rejection Rates

| ICD-10 | Description | Why Rejected | Fix |
|--------|-------------|-------------|-----|
| **R-codes (R00-R99)** | Symptoms/signs (unspecified) | Schemes demand definitive diagnosis; R-codes flag for review | Replace with specific diagnosis after workup |
| **Z00.0** | General examination | Not covered on many plans unless screening benefit active | Confirm benefit, add secondary clinical code |
| **M54.5** | Low back pain (unspecified) | Needs specificity — L4/L5? Radiculopathy? | Use M54.1 (radiculopathy) or specific level |
| **J06.9** | URTI, unspecified | High volume but low per-claim rejection; flagged if used repeatedly | Acceptable for acute; flag if chronic pattern |
| **S00-T98** | Injury codes WITHOUT external cause | **Mandatory in SA**: injury MUST have V01-Y98 secondary | Add external cause code (ECC) |
| **E11.9** | T2 Diabetes, unspecified | CDL registration required; rejected if no chronic auth | Register CDL, get chronic number |
| **I10** | Essential hypertension | CDL condition — rejected without chronic authorization | Register CDL benefit |
| **L30.9** | Dermatitis, unspecified | Needs specificity: atopic? contact? seborrheic? | Use L20 (atopic), L23-L25 (contact) |
| **K21.0** | GERD with oesophagitis | Off-chronic formulary drugs trigger rejection | Use correct formulary medication |
| **N39.0** | UTI, site not specified | Needs gender-appropriate secondary codes | Add site specificity |

### ICD-10 Specificity Rules (Discovery = Strictest)
- **3-character code** (e.g., E11): Often rejected — lacks specificity
- **4-character code** (e.g., E11.9): Minimum required by most schemes
- **5-character code** (e.g., E11.65): Maximum specificity — always accepted
- **Discovery**: Mandates maximum specificity in all cases
- **GEMS/Bonitas**: Accept 4-character in most cases

---

## 5. MOST COMMONLY REJECTED TARIFF CODES

### High-Rejection Tariff Patterns

| Tariff Category | Common Rejection Reason | Example |
|----------------|------------------------|---------|
| **Specialist consultations** | Above scheme tariff rate | Charged R2,500, scheme pays R1,800 |
| **In-room procedures** | Unbundling — components billed separately | Excision + suture billed as 2 codes instead of 1 |
| **Modifier 0007 (after-hours)** | Applied without meeting time criteria | Claim at 17:05 — not after-hours per scheme rules |
| **Modifier 0019 (additional procedure)** | Missing primary procedure | Secondary modifier without qualifying primary |
| **Consultation + procedure same day** | Bundling rules — consult subsumed into procedure | Bill procedure only, not consult + procedure |
| **Physiotherapy codes** | Session count exceeded without auth extension | >6 sessions on same condition without new auth |
| **Pathology profiles** | Profile billed as individual tests (unbundling) | Full blood count components billed separately |
| **Radiology (MRI/CT)** | No pre-authorization number | Auth required for all advanced imaging |
| **Dental prosthetics** | Benefit year limit exceeded | Crown/bridge after annual limit depleted |
| **Chronic medication** | NAPPI not on formulary, no generic motivation | Brand prescribed when generic available |

### 27 CCSA Modifiers — Common Error Patterns
| Modifier | Description | Error Pattern |
|----------|-------------|---------------|
| 0001 | Second opinion | Applied without scheme request — rejected |
| 0007 | After-hours | Time not qualifying — rejected |
| 0008 | Emergency | Overused for non-emergency — flagged |
| 0011 | Bilateral | One-side procedure billed as bilateral |
| 0019 | Additional procedure | Missing primary — rejected |
| 0023 | Anaesthesia assist | Without qualifying surgeon code |

---

## 6. SEASONAL REJECTION PATTERNS

### Monthly/Quarterly Trends

| Period | Pattern | Reason |
|--------|---------|--------|
| **January** | **Spike in rejections (+15-25%)** | New benefit year resets; new plan options effective; system updates; member details not yet updated; waiting periods kick in for new joiners |
| **February-March** | Elevated rejections (settling) | Late January claims processed; scheme rule changes bedding down |
| **April-June** | Lowest rejection rates | Systems stable, benefits available, mid-year |
| **July** | Minor spike | Mid-year scheme adjustments on some plans |
| **September-October** | Rising rejections | Benefits depleting for heavy users; MSA running low; ATB thresholds approaching |
| **November-December** | **Second spike (+10-20%)** | Benefit exhaustion peak; year-end rush claims; locum/temp providers (unfamiliar with billing); 4-month filing deadline pressure for August claims |
| **Year-end (Dec 31)** | Filing deadline crunch | Claims from August must be submitted by December |

### Benefit Exhaustion Cycle
```
Jan ████░░░░░░░░░░ Benefits fresh — low rejection
Apr ██████░░░░░░░░ Mid-year — stable
Jul ████████░░░░░░ Benefits depleting
Oct ██████████░░░░ Heavy users exhausted
Dec ████████████░░ Peak exhaustion — maximum rejections for benefit-related
```

---

## 7. FIRST-SUBMISSION vs RESUBMISSION SUCCESS RATES

| Metric | Rate | Notes |
|--------|------|-------|
| **First-pass acceptance rate (industry avg)** | **68-82%** | Varies hugely by practice; best practices achieve 90%+ |
| **First-pass acceptance (top-performing practices)** | **90-95%** | Electronic submission, real-time validation, trained billers |
| **Resubmission success rate (corrected claims)** | **55-70%** | Depends on rejection reason — coding fixes succeed more |
| **Resubmission success (ICD-10 correction)** | **75-85%** | High success when specificity added |
| **Resubmission success (missing pre-auth)** | **40-60%** | Retrospective auth harder to obtain |
| **Resubmission success (benefit exhausted)** | **20-35%** | Requires PMB motivation — often denied |
| **Resubmission success (filing deadline)** | **<5%** | Time-barred — almost never overturned |
| **Resubmission window** | **60 days** | From date of rejection notification |
| **Average resubmissions before final outcome** | **1.8** | Most claims settled on first resubmission |

---

## 8. ELECTRONIC vs PAPER CLAIM REJECTION RATES

| Submission Method | Rejection Rate | Processing Time | Market Share |
|-------------------|---------------|-----------------|--------------|
| **Electronic (EDI via switch)** | **12-16%** | 2-7 days | **~92%** of claims |
| **Paper/manual** | **25-35%** | 14-30 days | **~8%** of claims |
| **Real-time switching** | **10-14%** | Seconds (eligibility) | Growing |

### Why Electronic Has Lower Rejection
- Pre-validation catches errors before submission (member ID, ICD-10 format, NAPPI validity)
- Auto-population of provider BHF, practice number
- Duplicate detection at point of entry
- Real-time eligibility checking (member active, benefits available)
- Structured format prevents missing fields

### Three SA Switching Houses
| Switch | Operator | Volume | Electronic Rejection Rate |
|--------|----------|--------|--------------------------|
| MediSwitch | Altron HealthTech | ~60% market | ~12-14% |
| Medscheme Gateway | Medscheme | ~25% market | ~13-15% |
| Discovery Direct | Discovery Health | ~15% market | ~11-13% |

---

## 9. PREDICTION FEATURES — WHAT SIGNALS A CLAIM WILL BE REJECTED

### Feature Engineering for ML Model

#### A. Coding Quality Features (Highest Predictive Value)
| Feature | Description | Weight |
|---------|-------------|--------|
| `icd10_specificity_level` | 3-char (0.3), 4-char (0.7), 5-char (1.0) | **Critical** |
| `icd10_valid_primary` | MIT Column K = "Y" | **Critical** |
| `icd10_gender_match` | Patient gender vs gender-restricted codes | **Critical** |
| `icd10_age_match` | Patient age vs age-restricted codes (P00-P96, O00-O99) | **High** |
| `diagnosis_procedure_match_score` | Clinical logic: does ICD-10 justify the tariff code? | **Critical** |
| `external_cause_present` | For S/T codes, V01-Y98 must be secondary | **Critical** |
| `r_code_flag` | Using R-codes (symptom codes) as primary | **High** |
| `nappi_formulary_status` | On-formulary (1.0) vs off-formulary (0.3) | **High** |
| `nappi_valid` | Active in NAPPI database | **Medium** |
| `modifier_valid` | Modifier appropriate for procedure type | **High** |
| `unbundling_risk_score` | Multiple component codes vs comprehensive code | **High** |

#### B. Administrative Features
| Feature | Description | Weight |
|---------|-------------|--------|
| `member_active` | Active membership status at DOS | **Critical** |
| `member_waiting_period` | In general or condition-specific waiting | **Critical** |
| `preauth_obtained` | Pre-authorization on file for requiring procedures | **Critical** |
| `preauth_valid` | Auth not expired (3-month validity) | **High** |
| `days_since_service` | Days between DOS and submission (max 120) | **High** |
| `dependent_code_valid` | 00 (principal) or 01-09 (valid dependent) | **Medium** |
| `provider_bhf_active` | BHF practice number current and active | **Medium** |
| `provider_hpcsa_current` | HPCSA registration not lapsed | **Medium** |
| `provider_discipline_match` | Provider discipline code matches procedure scope | **High** |
| `dsp_network_status` | Provider in scheme's DSP network | **Medium** |

#### C. Historical/Behavioural Features
| Feature | Description | Weight |
|---------|-------------|--------|
| `provider_historical_rejection_rate` | Provider's past rejection % with this scheme | **Critical** |
| `provider_avg_claim_amount` | vs peer group average (outlier detection) | **High** |
| `member_benefit_remaining` | % of annual benefit still available | **High** |
| `member_msa_balance` | Medical savings account balance | **Medium** |
| `days_since_last_similar_claim` | Frequency check — too soon? | **High** |
| `claim_count_this_year` | Volume anomaly detection | **Medium** |
| `scheme_rule_violation_count` | Known rule violations on this claim | **Critical** |
| `seasonal_risk_score` | Month-of-year risk factor (Jan/Dec = high) | **Medium** |
| `claim_amount_vs_scheme_tariff` | Ratio of claimed amount to scheme maximum | **High** |

#### D. Scheme-Specific Features
| Feature | Description | Weight |
|---------|-------------|--------|
| `scheme_id` | Which scheme (Discovery strictest) | **High** |
| `plan_option` | Which plan within scheme (affects benefits) | **High** |
| `scheme_auto_adjudication_rate` | Higher auto-adj = stricter rules | **Medium** |
| `cdl_registration_status` | For chronic conditions — CDL registered? | **High** |
| `pmb_flag` | Is this a PMB/DTP condition? (overrides many rejections) | **Critical** |

### Total Feature Count: ~35 engineered features

---

## 10. MACHINE LEARNING APPROACHES FOR CLAIMS PREDICTION

### Published Research

#### IEEE 2017 — Saripalli, Tirumala & Chimmad
- **Paper**: "Assessment of Healthcare Claims Rejection Risk Using Machine Learning"
- **Source**: IEEE 19th International Conference on e-Health Networking (Healthcom)
- **Finding**: ML can "fully automate identification of claims prone to rejection or denial with high accuracy"
- **Approach**: Feature engineering from claims data, classification models
- **Key insight**: Feature engineering (diagnosis-procedure alignment, provider history) more important than model choice

#### Springer 2021 — Responsible AI in Healthcare (Information Systems Frontiers)
- **Models tested**: 6 algorithms (white-box and glass-box)
- **Best performer**: **AdaBoost — AUC 0.83**
- **Cross-validation**: Used to tune hyperparameters
- **Key features**: Claim type, provider history, diagnosis complexity, prior denials

#### MDPI 2025 — Machine Learning for High-Cost Claims
- **Best model**: **Random Forest — AUC 0.94, Accuracy 0.89**
- **Runner-up**: XGBoost — AUC 0.92
- **Feature selection**: Permutation importance > embedded methods
- **Top features plateau**: Top 5-10 features capture most predictive power

### Recommended Model Architecture for SA Claims

```
TIER 1: RULE-BASED PRE-FILTER (catches 60-70% of rejectable claims)
  → Hard rules: missing ICD-10, invalid BHF, member inactive, expired auth
  → Deterministic: 100% precision on known rejection patterns

TIER 2: ML CLASSIFIER (catches remaining 30-40%)
  → Model: Gradient Boosted Trees (XGBoost or LightGBM)
  → Training data: Historical claims with rejection outcomes
  → Features: 35 engineered features (see Section 9)
  → Target: Binary (rejected/accepted) + multi-class (rejection reason)

TIER 3: EXPLAINABILITY LAYER
  → SHAP values for each prediction
  → Human-readable reason: "This claim will likely be rejected because..."
  → Actionable suggestion: "Add 4th character to ICD-10 code E11"
```

### Accuracy Benchmarks (What's Achievable)

| Metric | Rule-Based Only | ML Only | Hybrid (Recommended) |
|--------|----------------|---------|---------------------|
| **Precision** | 95%+ | 80-85% | 90-95% |
| **Recall** | 40-50% | 75-83% | 85-92% |
| **F1 Score** | 0.55-0.65 | 0.78-0.84 | 0.87-0.93 |
| **AUC** | N/A | 0.83-0.94 | 0.90-0.96 |
| **False positive rate** | <2% | 10-15% | 5-8% |

### Feature Importance Ranking (Expected for SA Data)

```
1. ████████████████████ icd10_specificity_level (0.18)
2. ███████████████████  diagnosis_procedure_match (0.16)
3. ██████████████████   preauth_status (0.14)
4. █████████████████    member_benefit_remaining (0.12)
5. ████████████████     provider_rejection_history (0.10)
6. ███████████████      scheme_id (0.08)
7. ██████████████       claim_amount_ratio (0.07)
8. █████████████        days_since_service (0.05)
9. ████████████         seasonal_risk (0.04)
10. ███████████         cdl_registration (0.03)
    ██████████          all_other_features (0.03)
```

---

## 11. AUTO-CORRECTION PATTERNS

### Tier 1: Fully Automatable (No Human Intervention)

| Rejection Type | Auto-Fix Method | Success Rate |
|---------------|----------------|--------------|
| **ICD-10 missing 4th character** | Lookup MIT table, add most specific valid subcode | 80-90% |
| **Missing external cause code (ECC)** | Infer from injury type (e.g., S52 fracture → W19 fall) | 70-80% |
| **Dependent code padding** | Add leading zero (1 → 01) | 95%+ |
| **Membership number format** | Add leading zeros for GEMS (9-digit), validate checksum | 90%+ |
| **Tariff code format** | Validate against active CCSA table, suggest nearest match | 75-85% |
| **NAPPI format correction** | Validate 7+3 digit format, check against active database | 85-90% |
| **Duplicate flag (false positive)** | Different DOS or different procedure → resubmit with note | 60-70% |
| **Provider BHF update** | Pull current BHF from PCNS registry | 90%+ |

### Tier 2: Semi-Automatable (System + Minimal Human Input)

| Rejection Type | Auto-Assist Method | Success Rate |
|---------------|-------------------|--------------|
| **Missing referring provider** | Look up from practice records, prompt for confirmation | 70-80% |
| **Missing pre-authorization** | Auto-submit retrospective auth request to scheme | 40-60% |
| **Off-formulary medication** | Suggest generic equivalent from formulary, prompt pharmacist | 50-70% |
| **Above scheme tariff** | Calculate difference, auto-generate patient liability notice | N/A (billing) |
| **Modifier error** | Suggest correct modifier based on procedure-time analysis | 65-75% |
| **Frequency limit exceeded** | Generate medical necessity motivation template | 40-55% |
| **CDL not registered** | Pre-fill CDL application form, route to practice | 50-60% |

### Tier 3: Human Intervention Required

| Rejection Type | Why Can't Auto-Fix | Required Action |
|---------------|-------------------|----------------|
| **Benefit exhaustion** | PMB motivation requires clinical assessment | Doctor writes clinical motivation letter |
| **Clinical motivation needed** | Medical judgment required | Doctor provides clinical rationale |
| **Non-DSP provider** | Patient's choice of provider | Patient must accept co-payment or change provider |
| **Waiting period** | Contractual waiting period active | Wait, or appeal if PMB emergency |
| **Member suspended (arrears)** | Contribution payment issue | Member must pay arrears |
| **Fraud flag/clinical review** | Investigation required | Practice must respond to audit queries |
| **Bundling dispute** | Clinical judgment on procedure grouping | Doctor must justify separate billing |

### Auto-Correction Decision Tree
```
REJECTION RECEIVED
  → Parse rejection code
  → Tier 1 check: Can we fix this automatically?
      → YES → Apply fix → Resubmit → Log outcome
      → NO → Tier 2 check: Can we assist?
          → YES → Generate suggestion → Route to user for 1-click approval → Resubmit
          → NO → Tier 3: Flag for human review → Generate checklist → Notify practice
```

---

## 12. BENCHMARKING TARGETS

### Clean Claim Rate Targets

| Level | Clean Claim Rate | Description |
|-------|-----------------|-------------|
| **Industry reality (SA avg)** | **68-78%** | Typical practice without active billing management |
| **Good practice** | **82-88%** | Trained biller, electronic submission, basic validation |
| **Best practice target** | **90-95%** | Real-time validation, clean claim checklist, trained coder |
| **AI-assisted target** | **95-98%** | Pre-submission AI screening, auto-correction, rule engine |
| **Theoretical maximum** | **~98%** | Some rejections unavoidable (benefit exhaustion, clinical review) |

### Financial Impact Per Percentage Point

| Practice Size | Revenue/Month | 1% Improvement | Annual Impact |
|--------------|--------------|----------------|---------------|
| Solo GP | R150,000 | R1,500/mo | **R18,000/yr** |
| Small practice (3 providers) | R500,000 | R5,000/mo | **R60,000/yr** |
| Multi-practice (10 providers) | R2,000,000 | R20,000/mo | **R240,000/yr** |
| Hospital group (50+ providers) | R20,000,000 | R200,000/mo | **R2,400,000/yr** |

**Note**: Each rejected claim also costs R50-R200 in administrative rework (staff time, resubmission, follow-up).

### Days-to-Payment by Scheme

| Scheme | Statutory Max | Typical (Electronic) | Typical (Paper) | Payment Runs |
|--------|-------------|---------------------|-----------------|--------------|
| **Discovery** | 30 days | **5-10 days** | 14-21 days | Weekly (cash claims) |
| **GEMS** | 30 days | **10-15 days** | 21-30 days | 2x/month (mid + end) |
| **Bonitas** | 30 days | **7-12 days** | 14-21 days | 2x/month |
| **Momentum** | 30 days | **7-14 days** | 14-28 days | 2x/month |
| **Medihelp** | 30 days | **10-14 days** | 21-30 days | 2x/month |
| **Bestmed** | 30 days | **7-10 days** | 14-21 days | 2x/month |

**Statutory rule**: Medical Schemes Act requires payment within 30 days of claim receipt.

### Appeals Statistics

| Metric | Value | Source |
|--------|-------|--------|
| Claims that go to formal appeal | **<3%** of rejected claims | CMS estimates |
| Members who escalate beyond first appeal | **7%** of appellants | SAMJ 2019 PMB study |
| PMB appeals won by members | **80.3%** when member appealed scheme liability | SAMJ PMB review (11 years) |
| PMB appeals won when scheme contested | **69.4%** in favour of members | SAMJ PMB review |
| CMS complaints related to PMBs | **~40%** of all CMS complaints | CMS Annual Reports |
| Ombudsman complaints resolved for member | **>50%** | CMS 2024/25 |
| CMS complaint resolution rate | **80%+ within prescribed timeframes** | CMS Annual Report 2024/25 |
| CMS complaints registered (2024/25) | 1,962 (1,879 resolved) | CMS Annual Report 2024/25 |

---

## 13. 25 STANDARD BHF REJECTION CODES (Quick Reference)

| Code | Description | Auto-Correctable | Tier |
|------|-------------|-------------------|------|
| 01 | Member not found | No | 3 |
| 02 | Membership number incorrect | Partial (format fix) | 1-2 |
| 03 | Dependent code invalid | Yes (padding) | 1 |
| 04 | Member suspended (arrears) | No | 3 |
| 05 | Duplicate claim | Partial (if false positive) | 2 |
| 07 | Benefit exhausted | No (needs PMB motivation) | 3 |
| 08 | Pre-auth not obtained | Partial (retrospective request) | 2 |
| 09 | Service not covered | No | 3 |
| 10 | Provider not on network | No | 3 |
| 11 | Past filing deadline | No | 3 |
| 12 | ICD-10 invalid/unspecified | Yes (specificity fix) | 1 |
| 13 | Above scheme tariff | Disputable | 2-3 |
| 14 | Co-payment applied | No (not rejection) | N/A |
| 15 | Paid at scheme rate | Disputable | 2-3 |
| 16 | PMB — paid at cost | No (not rejection) | N/A |
| 17 | Waiting period | No | 3 |
| 18 | CPT invalid for diagnosis | Yes (code correction) | 1 |
| 19 | Quantity exceeds limit | Partial (motivate) | 2 |
| 21 | Referring provider required | Yes (add from records) | 1 |
| 24 | Above-threshold case mgmt | Disputable | 2-3 |
| 25 | Therapeutic substitution available | No | 3 |

---

## 14. TRAINING DATA REQUIREMENTS

### For Building the Prediction Engine

| Data Source | What It Provides | Access Method |
|------------|-----------------|---------------|
| **Practice claims history** | Submitted claims with outcomes (paid/rejected/adjusted) | PMS export (Healthbridge/Practice Perfect API) |
| **Switching house logs** | Real-time response codes from schemes | MediSwitch/Altron API |
| **CMS Annual Reports** | Aggregate statistics, complaint patterns | Public PDF downloads |
| **CompCom HMI data** | Detailed claims analysis (2010-2014, anonymized) | Public reports |
| **Scheme-specific rules** | Tariff tables, formularies, pre-auth lists | Scheme provider portals |
| **ICD-10 MIT** | Valid codes, gender/age restrictions, primary validity | NDoH (icd10@health.gov.za) |
| **CCSA tariff tables** | Valid procedure codes, rates, modifiers | Annual publication |
| **NAPPI database** | Active medications, schedules, SEP | Updated weekly |
| **BHF/PCNS registry** | Active providers, discipline codes | pcns.co.za API |

### Minimum Training Set Size
| Model Type | Minimum Claims | Recommended | Notes |
|-----------|---------------|-------------|-------|
| Rule-based | N/A | N/A | Rules from scheme documentation |
| Logistic Regression | 10,000 | 50,000+ | Simple, interpretable |
| Random Forest | 50,000 | 200,000+ | Good with structured features |
| XGBoost/LightGBM | 50,000 | 500,000+ | Best accuracy, needs tuning |
| Deep Learning | 500,000+ | 2,000,000+ | Overkill for structured claims data |

### Data Split Strategy
```
Historical claims (3+ years)
  → 70% Training
  → 15% Validation
  → 15% Test (held-out, never seen during training)
  → Stratified by: scheme, discipline, rejection type
  → Time-based split: train on older, test on newer (prevents data leakage)
```

---

## 15. KEY REFERENCES

### CMS & Government
- CMS Annual Report 2024/25: https://www.medicalschemes.co.za/cms-annual-report-2024-25/
- CMS Industry Report 2024: https://www.medicalschemes.co.za/download/3817/industry-report-2024/30561/cms-industry-report-2024_4-dec.pdf
- Medical Schemes Act (s59 investigation): section59-investigation-report.pdf (raw_data)

### Competition Commission Health Market Inquiry
- Funders Report: https://www.compcom.co.za/wp-content/uploads/2020/02/Funders_Report-on-analysis-of-medical-schemes-claims-data.pdf
- Practitioners Report: https://www.compcom.co.za/wp-content/uploads/2020/02/Practitioners_Report-on-analysis-of-medical-scheme-claims-data.pdf
- Descriptive Statistics: https://www.compcom.co.za/wp-content/uploads/2020/03/Claims-data-analysis-descriptive-analyses-final.pdf
- Final Report (Sept 2019): https://www.compcom.co.za/wp-content/uploads/2020/01/Final-Findings-and-recommendations-report-Health-Market-Inquiry.pdf

### Academic / ML Research
- Saripalli et al. (2017): "Assessment of Healthcare Claims Rejection Risk Using ML" — IEEE Healthcom https://ieeexplore.ieee.org/document/8210758/
- Springer (2021): "Responsible AI in Healthcare: Predicting Claim Denials" — https://link.springer.com/article/10.1007/s10796-021-10137-5
- SAMJ (2019): "11-year review of PMB appeals" — https://scielo.org.za/scielo.php?script=sci_arttext&pid=S0256-95742019000700015

### Industry / Media
- R40B out-of-pocket: https://www.smartaboutmoney.co.za/hot-topics/south-africans-pay-r40-billion-for-denied-medical-scheme-claims-are-you-one-of-them/
- CMS member win rate: https://www.news24.com/business/money/more-than-50-of-unhappy-medical-scheme-members-win-their-case-at-regulator-20241022

### Coding Standards (raw_data)
- TRA Rejection Codes: tra-rejection-codes.pdf
- ICD-10 Coding Standards v3: icd10-coding-standards-v3.pdf
- CCSA Coding Standards v11: ccsa-coding-standards-v11.pdf
- PHISC Claim Form v504: phisc-claim-form-v504.pdf
- NPG Coding Guidelines: npg-coding-guidelines.pdf
