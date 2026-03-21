# SA Healthcare Claims — Coding & Standards Reference
## For: Steinberg, Claims Analyzer, HealthOps, Netcare Health OS Agents
## Compiled: 2026-03-21

---

## 1. ICD-10 (SA IMPLEMENTATION)

**SA uses WHO ICD-10 (2016 revision) — NOT US ICD-10-CM.**
**Format**: `^[A-Z]\d{2}(\.\d{1,4})?$`
**Master reference**: SA ICD-10 Master Industry Table (MIT, 2014 edition)

### Top 20 Codes by Volume (SA Primary Care)

| Code | Description | PMB? |
|------|-------------|------|
| J06.9 | Acute upper respiratory infection | No |
| I10 | Essential hypertension | CDL |
| E11.9 | Type 2 diabetes mellitus | CDL |
| M54.5 | Low back pain | No |
| J20.9 | Acute bronchitis | No |
| R50.9 | Fever, unspecified | No |
| J32.9 | Chronic sinusitis | No |
| R51 | Headache | No |
| N39.0 | Urinary tract infection | No |
| R10.4 | Abdominal pain, unspecified | No |
| J45.9 | Asthma, unspecified | CDL |
| K29.7 | Gastritis, unspecified | No |
| Z00.0 | General medical examination | No |
| J03.9 | Acute tonsillitis | No |
| L30.9 | Dermatitis, unspecified | No |
| E78.5 | Hyperlipidaemia | CDL |
| J02.9 | Acute pharyngitis | No |
| R05 | Cough | No |
| K21.0 | GERD | No |
| G43.9 | Migraine, unspecified | No |

### Gender-Restricted Codes

**Male only**: N40-N51 (male genital), C60-C63 (male genital cancer), D29 (benign neoplasm male), D40, B26.0 (orchitis)
**Female only**: O00-O99 (ALL pregnancy/childbirth), N70-N98 (female genital), C51-C58 (female genital cancer), D06, D25-D28, D39

### Age-Restricted Codes

- P00-P96 (perinatal): Neonates only, auto-reject if age >1 year
- O00-O99 (pregnancy): Reproductive age 12-55
- M80.0 (postmenopausal osteoporosis): Female 45+ only

### Critical SA-Specific Rules

1. **Injury codes (S00-T98)**: MUST have External Cause Code (V01-Y98) as secondary. Auto-reject without ECC.
2. **Asterisk codes (**)**: CANNOT be primary diagnosis. Dagger codes (†) = underlying disease, can be primary.
3. **4th character specificity**: Required where classification mandates. Discovery demands maximum specificity (J18.1, not J18).
4. **R-codes** (signs/symptoms): Valid but may trigger review if definitive diagnosis should be available.
5. **Cannot have both**: E10 (T1DM) and E11 (T2DM) simultaneously.

### CDL ICD-10 Mapping (27 Chronic Conditions)

| Condition | ICD-10 |
|-----------|--------|
| Addison's | E27.1 |
| Asthma | J45 |
| Bipolar | F31 |
| Bronchiectasis | J47 |
| Cardiac failure | I50 |
| Cardiomyopathy | I42 |
| COPD | J44 |
| Chronic renal disease | N18 |
| Coronary artery disease | I25 |
| Crohn's | K50 |
| Diabetes insipidus | E23.2 |
| Diabetes T1 | E10 |
| Diabetes T2 | E11 |
| Dysrhythmia | I49 |
| Epilepsy | G40 |
| Glaucoma | H40 |
| Haemophilia | D66, D67 |
| HIV/AIDS | B20-B24 |
| Hyperlipidaemia | E78 |
| Hypertension | I10 |
| Hypothyroidism | E03 |
| Multiple sclerosis | G35 |
| Parkinson's | G20 |
| Rheumatoid arthritis | M05, M06 |
| Schizophrenia | F20 |
| SLE | M32 |
| Ulcerative colitis | K51 |

---

## 2. TARIFF CODES (CCSA / NHRPL)

**Format**: 4-digit numeric. SA uses CCSA codes — NOT American CPT.

### Consultation Codes

| Code | Description | Fee (approx) | Discipline |
|------|-------------|-------------|------------|
| 0190 | GP consultation (standard) | R520 | GP |
| 0191 | GP consultation (extended) | R780 | GP |
| 0192 | Telephonic consultation | R260 | GP |
| 0197 | Telehealth consultation | R440 | GP/Spec |
| 0290 | After-hours consultation | R780 | GP |
| 0291 | After-hours (weekend) | R900 | GP |
| 0295 | After-hours (public holiday) | R1,050 | GP |
| 0141 | Specialist consultation | R950 | Specialist |
| 0143 | Specialist follow-up | R650 | Specialist |

### Diagnostic Procedures

| Code | Description | Fee | Pre-auth? |
|------|-------------|-----|-----------|
| 0308 | ECG | R280 | No |
| 0312 | Spirometry | R350 | No |
| 0400 | Wound suturing | R450 | No |
| 5001 | X-ray (chest) | R180 | No |
| 5100 | Ultrasound (abdominal) | R550 | No |
| 5200 | CT scan (brain) | R2,800 | YES |
| 5300 | MRI (brain) | R5,000 | YES |
| 5400 | Mammography | R1,200 | No |

### Pathology Codes

| Code | Description | Fee |
|------|-------------|-----|
| 3710 | Full blood count (FBC) | R115 |
| 3720 | INR | R90 |
| 3810 | Glucose (fasting) | R50 |
| 3815 | HbA1c | R160 |
| 3820 | Urea | R45 |
| 3821 | Creatinine | R45 |
| 3835 | ALT | R45 |
| 3845 | Total cholesterol | R50 |
| 3846 | HDL | R55 |
| 3847 | LDL | R60 |
| 3848 | Triglycerides | R55 |
| 3849 | Lipogram (full panel) | R180 |
| 3850 | TSH | R120 |
| 3851 | Free T4 | R140 |
| 3860 | Troponin | R150 |
| 3862 | BNP | R250 |
| 3870 | PSA | R140 |

### Modifier Codes

| Code | Meaning | Rate Impact |
|------|---------|-------------|
| 0001 | Bilateral procedure | 150% of unilateral |
| 0002 | Multiple procedures same session | 2nd=50%, 3rd=25% |
| 0003 | Assistant surgeon | 20-25% of primary |
| 0007 | Own monitoring equipment | — |
| 0008 | Specialist surgeon assistant | 1/3 of fee |
| 0011 | After-hours | +50-100% |
| 0012 | Emergency/urgency | Premium |
| 0018 | Bilateral | 150% |

### Key Unbundling Rules (Cannot Bill Separately)

- Consultation + procedure same day (consultation included in procedure)
- FBC components (haemoglobin, WCC, differential, platelet) vs FBC panel code 3710
- Lipogram components (TC, HDL, LDL, TG) vs lipogram code 3849
- X-ray without contrast vs with contrast (cannot bill both)
- Surgical packages include theatre fee, consumables, certain post-op visits
- Maternity packages may bundle antenatal + delivery + postnatal

---

## 3. NAPPI CODES (Medicines & Devices)

**Format**: Up to 13 digits (typically 7). Regex: `/^\d{1,13}$/`
**Managed by**: MediKredit (Altron subsidiary). ~312,847 active products. Updated daily.

### Schedule Classification

| Schedule | Rules | Claimable? |
|----------|-------|------------|
| S0 | OTC, no prescription | Generally NOT claimable |
| S1 | Pharmacist-dispensed | Yes |
| S2 | Pharmacist-dispensed (e.g., amoxicillin) | Yes |
| S3 | Prescription required (e.g., statins) | Yes |
| S4 | Prescription required, stricter (e.g., antipsychotics) | Yes |
| S5 | Controlled (e.g., tramadol, benzodiazepines) | Yes, tracked |
| S6 | Narcotics (strict controls) | Yes, strict tracking |
| S7-S8 | Highly controlled/prohibited | Special authorization |

### SEP (Single Exit Price) + Dispensing Fee

Claims amount = **SEP + 15% VAT + Dispensing Fee**

| SEP Range | Fee Calculation |
|-----------|----------------|
| Up to R104 | R16 + 46% of SEP |
| R104 - R236 | R63.84 + 33% of (SEP - R104) |
| R236 - R736 | R107.36 + 15% of (SEP - R236) |
| R736 - R5,441 | R182.36 + 5% of (SEP - R736) |
| Above R5,441 | Capped at R164 |

### Common CDL Medicines by Condition

**Hypertension**: Amlodipine (NAPPI 704512), Enalapril (706131), Losartan (707823), HCTZ (702415)
**Diabetes T2**: Metformin (706685), Glimepiride (708234), Gliclazide (707156), Empagliflozin (713456)
**Hyperlipidaemia**: Atorvastatin (709123), Simvastatin (705234), Rosuvastatin (711567)
**Asthma**: Salbutamol inhaler (703234), Budesonide (706789), Fluticasone/Salmeterol (710456)
**HIV/AIDS**: TLD - Tenofovir/Lamivudine/Dolutegravir (714567), TEE (712345)
**Depression**: Fluoxetine (704567), Sertraline (706234), Citalopram (708567)

### Consumables (prefix 82)
- 8200100: Examination gloves
- 8200400: Sutures
- 8200700: Syringes

---

## 4. BHF (BOARD OF HEALTHCARE FUNDERS) CODES

### Practice Number (PCNS)
- **Format**: 7 digits (`/^\d{7}$/`)
- Verify: pcns.co.za/Search/Verify
- R120 application fee, R80/year renewal (by 31 March)
- Each practice LOCATION needs separate number
- 10-20 working days processing

### Provider Discipline Codes

| Code | Type | Code | Type |
|------|------|------|------|
| 01/14 | GP | 17 | Gynaecologist |
| 02/15 | Physician | 18 | Orthopaedic |
| 03/16 | Surgeon | 19 | Dermatologist |
| 05 | Psychiatrist | 20 | Oncologist |
| 07/28 | Anaesthetist | 36 | Physiotherapist |
| 08 | Radiologist | 40-41 | Dental |
| 09 | Pathologist | 47 | Clinical Psychologist |
| 10 | Paediatrician | 50-59 | Allied health |
| 11 | Ophthalmologist | 60 | Optometrist |
| 12 | Urologist | 70 | Pharmacy |
| 14 | Orthopaedic Surgeon | 71 | Nursing |
| 15 | ENT | 80-89 | Facility (no discipline check) |
| 16 | Cardiologist | 90 | Ambulance |

### Scheme Codes

| Code | Scheme | Code | Scheme |
|------|--------|------|--------|
| DH | Discovery Health | BM | Bestmed |
| GEMS | Government Employees | FH | Fedhealth |
| BON | Bonitas | POL | Polmed |
| MH | Medihelp | CC | CompCare |
| MOM | Momentum | SH | Sizwe Hosmed |
| MS | Medshield | KH | KeyHealth |

### Place of Service Codes

| Code | Location |
|------|----------|
| 11 | Office/Rooms |
| 12 | Home visit |
| 21 | Hospital inpatient |
| 22 | Outpatient |
| 23 | Emergency room |
| 31 | Nursing facility |
| 41 | Ambulance |
| 50 | Community health centre |
| 65 | Day clinic |
| 81 | Laboratory |

---

## 5. EDI STANDARDS (PHISC MEDCLM)

### Message Structure (EDIFACT v0:912:ZA)
```
UNB  — Interchange header (sender/recipient/date/control ref)
  UNH  — Message header (ref + type MEDCLM:0:912:ZA)
  BGM  — Batch number, transaction date
  DCR  — Correction type (ADJ/ADD/REV/RSV)
  DTM  — Dates (194=service, 155=service, 329=DOB)
  NAD+SUP — Practice/BHF number
  NAD+TDN — Treating doctor
  NAD+MPN — Member principal
  NAD+MSN — Member subordinate (dependent)
  RFF+AHI — Patient ID number
  RFF+ICD — ICD-10 diagnosis code (up to 4 per line)
  RFF+MOD — Modifier code
  RFF+AUT — Authorization number
  LIN+SRV — Tariff/procedure code
  LIN+NAP — NAPPI code (medicines)
  QTY+47  — Quantity
  MOA+203 — Line amount (cents)
  MOA+9   — Approved amount
  TAX     — VAT (15%)
  FTX     — Free text (max 70 chars)
  LOC     — Place of service
  UNT  — Message trailer
UNZ  — Interchange trailer
```

**Delimiters**: Segment terminator `'` | Data separator `+` | Component separator `:`

### Response Statuses
- `ACC` — Accepted
- `REJ` — Rejected (with adjustment reason code)
- `PAR` — Partial (some lines accepted, some rejected)
- `PEN` — Pending review

### Real-time vs Batch
- **Real-time**: Single claim, synchronous, response within 30-120 seconds
- **Batch**: Up to 500 claims per batch, SFTP/HTTPS, 2-48 hour processing

---

## 6. SWITCHING HOUSE ROUTING

| Scheme | Primary Switch |
|--------|---------------|
| Discovery Health | Healthbridge |
| Bonitas | Healthbridge |
| Medihelp | Healthbridge |
| Bankmed, LA Health | Healthbridge |
| GEMS | SwitchOn (Altron) |
| Momentum | SwitchOn |
| Bestmed | SwitchOn |
| Fedhealth | SwitchOn |
| Polmed | SwitchOn |
| CompCare | MediKredit |
| Medshield | MediKredit |
| PPS Healthcare | MediKredit |
| KeyHealth | MediKredit |

---

## 7. PRE-AUTHORIZATION TRIGGER CODES

| Tariff | Procedure | Always Pre-auth? |
|--------|-----------|-----------------|
| 0008 | MRI | YES |
| 0009 | CT scan | YES |
| 0078 | PET scan | YES |
| 0186 | Arthroscopy | YES |
| 0457 | Spinal surgery | YES |
| 0520 | Joint replacement | YES |
| 3601 | Cardiac catheterization | YES |
| 0500-0506 | Endoscopy | YES |
| 0600-0605 | Physiotherapy | After 6 sessions |
| 0700-0711 | Psychology | After 6 sessions |
| 0800-0821 | Major surgery | YES |
| 0900-0920 | Oncology | YES |
| 3600-3612 | Hospital admission | YES |

---

## 8. QUALITY METRICS

| Metric | Target |
|--------|--------|
| Clean claim rate | >95% |
| Rejection rate | <12% (industry avg 15-20%) |
| Average days to payment | <14 |
| Pre-auth compliance | 100% |
| ICD-10 specificity compliance | >90% |

---

## KEY TECHNICAL REFERENCES

| Document | Source |
|----------|--------|
| SA ICD-10 MIT (2014) | health.gov.za |
| SA ICD-10 Technical User Guide | health.gov.za/wp-content/uploads/2021/02/icd-10_technical_mzuserguide.pdf |
| SA ICD-10 Coding Standards V3 | medicalschemes.com/files/ICD10%20Codings/SA_ICD-10_Coding_Standards_V3_200903.pdf |
| PHISC MEDCLM v0-912-13.4 | phisc.net |
| CCSA Coding Standards V11 (Oct 2024) | phisc.net |
| PHISC Standardised Claim Form V5-04 | phisc.net |
| CMScript 10/2024 — Coding & Funding | medicalschemes.co.za |
| NAPPI Search | medikredit.co.za |
| PCNS Verify | pcns.co.za/Search/Verify |
| BHF | bhfglobal.com |

---

## EXISTING CODEBASE REFERENCE (Netcare Health OS)

| File | Contents |
|------|----------|
| `src/lib/claims/icd10-database.ts` | 1,800+ ICD-10-ZA codes with gender/age/PMB/asterisk-dagger metadata |
| `src/lib/claims/tariff-database.ts` | 500+ tariff entries with fees, disciplines, diagnosis validity, unbundling |
| `src/lib/claims/nappi-database.ts` | 300+ common medicines with NAPPI codes, schedules |
| `src/lib/claims/validation-engine.ts` | 20 validation rules (format, specificity, gender, age, ECC, unbundling, PMB) |
| `src/lib/claims/scheme-rules.ts` | Discovery & GEMS profiles with CDL prefixes, pre-auth triggers |
| `src/lib/claims/rejection-study.ts` | Full rejection taxonomy with prevalence data and auto-fix capabilities |
| `src/lib/switching/edifact.ts` | PHISC MEDCLM generator and parser |
| `src/lib/switching/router.ts` | 28 scheme routes across 3 switches |
| `src/lib/switching/era-parser.ts` | eRA parser, reconciliation, dispute generator |
| `src/lib/switching/preauth.ts` | Pre-authorization engine (9 categories) |
| `src/lib/healthbridge/codes.ts` | ICD-10, CPT, NAPPI validators, rejection codes |
| `src/lib/healthbridge/pmb.ts` | PMB/CDL condition lists and checkers |
