# Claims Code Science — Deep Research (March 22, 2026)
## How SA Medical Claims Codes Are Created: The Math, Science, and Algorithms

### 1. ICD-10 — WHO Classification Methodology

**Design**: Variable-axis classification (member-of, not strict parent-child). Alphanumeric: 1 letter + 2 digits = 14,400+ codes. Letter U reserved for provisional.

**Hierarchy**:
- Level 1: 21 Chapters (etiology/body system/purpose)
- Level 2: Blocks (clinically similar conditions within chapter)
- Level 3: Categories (3-char — ~2,036 total, fundamental unit)
- Level 4: Subcategories (4th char after decimal, 0-9; .8=other specified, .9=unspecified)
- Level 5: Extended subcategories (Chapters XIII, XIX, XX only)

**Letter Assignment**: Sequential through alphabet, NOT semantic. 4 chapters use 2+ letters. D shared (Chapters II/III), H shared (VII/VIII).

**Dagger/Asterisk**: Dual-axis for etiology+manifestation. Dagger(†)=cause (PRIMARY, always used). Asterisk(*)=manifestation (SUPPLEMENTARY, never alone). Every * has exactly 1 valid † partner.

**SA Specificity Rule**: WHO "optional" → SA "mandatory". All supplementary characters MUST be assigned. Max 10 codes per line item.

**Primary Cause Selection Algorithm (ACME — 99% concordance with manual)**:
- General Principle → Selection Rules 1-3 → Modification Rules A-F
- Rule A: Ignore ill-defined (R00-R94, R96-R99)
- Rule B: Ignore trivial conditions
- Rule C: Linkage (combine related conditions)
- Rule D: Specificity (prefer informative term)
- Rule E: Early/late stages → select late
- Rule F: Sequelae → select original condition

**MIT (Master Industry Table)**: 41,009 codes. Maintained by Ministerial ICD-10 Task Team. 36 columns including: code, description, Valid_Primary, Valid_ClinicalUse, Dagger, Asterisk, Sequelae, Gender, Age, WHO/SA discontinued dates.

**PMB Selection**: 270 DTPs chosen by: (1) evidence of clinical effectiveness, (2) affordability, (3) public sector protocol alignment. 27 CDL conditions have Government Gazette treatment algorithms.

### 2. NAPPI — MediKredit Assignment System

**Format**: 7-digit product ID + 3-digit pack size = 10 digits. Purely sequential, no therapeutic classification in number. ATC captured separately.

**Assignment**: MediKredit sole administrator. Requires SAHPRA registration. 10 working days turnaround. Each variant (strength/pack) gets unique code.

**SEP Formula**:
```
SEPA = (0.70 × CPI_inflation) + (0.30 × Exchange_rate_impact)
```
Health Minister has final discretion. Recent: 5.25% (2025), 1.47% (2026 max).

**Dispensing Fee (Pharmacists)**:
- SEP < R118.80: R15.80 + 46.0% of SEP
- R118.80–R315.53: R30.24 + 33.0% of SEP
- R315.53–R1,104.40: R86.11 + 15.0% of SEP
- SEP ≥ R1,104.40: R198.36 + 5.0% of SEP

**Non-pharmacist (s22C)**: SEP < R150 = max 30%; SEP ≥ R150 = max R45 flat.

### 3. CCSA Tariff Codes — The Math

**Two systems**: NRPL (4-digit SA) and CCSA (5-digit, adapted from US CPT).

**NHRPL 2006**: Established by CMS + DoH. Gathered actual running cost data. Declared invalid July 2010 (legal challenge). No national tariff since.

**Current Rate Formula**:
```
Current_Rate = NHRPL_2006_Rate × (1 + Cumulative_CPI_since_2006)
```
HPCSA 2012 guideline: 2006 rate × 1.4666 (46.66% inflator).

**Multiple Procedure Reduction**:
```
Procedure 1 (major): 100%
Procedure 2: 75%
Procedure 3: 50%
Procedure 4+: 25%
```

**Anaesthetic Time**:
```
Fee = Base_Units + Time_Units
First 60 min: 2.00 units per 15-min period
After 60 min: 3.00 units per 15-min period
```

### 4. Modifier System

| Modifier | Rate Impact |
|----------|------------|
| 0003 | -15% (equipment not owned) |
| 0005 | Triggers 100/75/50/25% cascade |
| 0008 | 50% for additional physio procedures |
| 0011 | Fixed Rand surcharge (after-hours) |
| 0018 | +50% anaesthetic time units (BMI≥35) |
| 0019 | +50% anaesthetic time units (neonatal) |

Stacking: Multiple modifiers allowed on one code. No sequencing rule.

### 5. 14-Step Adjudication Pipeline

```
1.  RECEIVE CLAIM (electronic via switch or paper)
2.  FORMAT VALIDATION (EDIFACT/MEDCLM structure)
3.  MEMBERSHIP VERIFICATION (active? dependent registered?)
4.  BENEFIT ELIGIBILITY (service date within coverage?)
5.  PROVIDER VALIDATION (registered? correct practice number?)
6.  ICD-10 VALIDATION (valid per MIT? valid primary? gender/age?)
7.  TARIFF CODE VALIDATION (valid? discipline-appropriate?)
8.  MODIFIER VALIDATION (valid? correctly applied?)
9.  CLINICAL EDIT CHECKS (diagnosis-procedure match? unbundling?)
10. PRE-AUTHORIZATION CHECK (auth obtained if required?)
11. PMB CHECK (PMB condition? auto-approve if DTP match)
12. BENEFIT LIMIT CHECK (annual/daily limits? sub-limits?)
13. CO-PAYMENT CALCULATION (gap between charged and scheme rate)
14. PAYMENT DETERMINATION (risk pool, savings, or reject)
```

### 6. Fraud Detection Algorithms

**Benford's Law**: P(d) = log₁₀(1 + 1/d). MAD > 0.022 = nonconformity flag.

**Unsupervised**: K-means clustering + PCA. Outlier threshold: 95th percentile of distance to centroid. Isolation Forest: anomaly score near 1 = fraud.

**ML Models**: Random Forest (0.887 accuracy, 0.944 AUC), XGBoost (0.870-0.890), Logistic Regression (0.820-0.850).

**SA fraud cost**: R22B/year (midpoint estimate). R8.22B–R43.2B range.

### 7. Economics

- Total contributions: R232B. Benefits paid: R218B.
- 9.17M beneficiaries. 78 registered schemes.
- Hospital: 35.95%. Specialists: 28.02%. Medicines: 14.05%.
- Denial rate benchmark: ~11.8%. Cost per denied claim: R400-R3,000.
- 65% of denied claims NEVER resubmitted (permanent revenue loss).

### 8. EDIFACT MEDCLM Structure

```
UNA:+.?*'           Separator definition
UNB---UNZ            Interchange envelope
  UNH+ref+MEDCLM:0:912:ZA'   Message header
  BGM                         Document type
  DTM                         Dates
  NAD                         Names/addresses
  GRP1: RFF+ICD              Referral diagnosis
  GRP3: RFF+ICD              Patient encounter
  GRP4: RFF+ICD              Service line items
  UNT                        Message trailer
UNZ                          Interchange trailer
```

Amounts: implied decimals, no commas, right-justified, not zero-filled.

### Sources
CMS Annual Report 2024, Medical Schemes Act (131/1998), PHISC MEDCLM v0:912:ZA, SA ICD-10 Coding Standards V3, BfArM ICD-10 Structure, WHO ICD-10 Volume 2 (2019), MediKredit NAPPI Allocation Policies, NHRPL Medical Practitioners 2006, HPCSA Guideline Tariffs 2012, CMS PMB Resources, SEP Impact Study (BMC Health Services), Healthbridge, MediKredit Claims Switching, SwitchOn/Altron HealthTech, APN 303 (ASSA), CMS Solvency Framework, REF Formula Task Group 2004, Deep Neural Network ICD-10 Coding (PMC), GNN Fraud Detection (Nature), Benford's Law Healthcare Fraud (Springer/PMC), Isolation Forest (Taylor & Francis).
