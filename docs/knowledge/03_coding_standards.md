# 03 — Coding Standards: ICD-10, CCSA Tariff, NAPPI, BHF, Modifiers
## VisioCorp Health Intelligence KB | Compiled 2026-03-21

---

## 1. ICD-10 SA (WHO ICD-10, NOT US ICD-10-CM)

### Master Industry Table (MIT)
- **Version**: January 2014 (National Department of Health)
- **Format**: Excel/CSV with 14 columns (A-N)
- **Contact**: ICD10@health.gov.za

### MIT Column Definitions

| Col | Field | Values |
|-----|-------|--------|
| A | Number | Sequential sort |
| B | Chapter_No | CHAPTER I-XXII |
| C | Chapter_Desc | Chapter description |
| F | ICD10_3_Code | 3-character code |
| H | ICD10_Code | Code at max specificity (claimable) |
| I | WHO_Full_Desc | Full description |
| J | Valid_ICD10_ClinicalUse | Y/N (must be Y to use) |
| K | Valid_ICD10_Primary | Y/N (must be Y for primary position) |
| L | Asterisk | Y/N (manifestation code) |
| M | Dagger | Y/N (etiology code) |
| N | Morph | Y/N (morphology applies) |

### Top 20 Codes by Volume (SA Primary Care)

| Code | Description | PMB? |
|------|-------------|------|
| J06.9 | Acute upper respiratory infection | No |
| I10 | Essential hypertension | CDL |
| E11.9 | Type 2 diabetes | CDL |
| M54.5 | Low back pain | No |
| J20.9 | Acute bronchitis | No |
| R50.9 | Fever | No |
| J45.9 | Asthma | CDL |
| N39.0 | UTI | No |
| K29.7 | Gastritis | No |
| Z00.0 | General examination | No |
| E78.5 | Hyperlipidaemia | CDL |
| J02.9 | Acute pharyngitis | No |
| L30.9 | Dermatitis | No |
| R05 | Cough | No |
| K21.0 | GERD | No |

### Gender-Restricted Codes
**Male only**: N40-N51, C60-C63, D29, D40
**Female only**: O00-O99 (ALL pregnancy), N70-N98, C51-C58, D06, D25-D28

### Age-Restricted Codes
- P00-P96 (perinatal): neonates only, reject if age >1
- O00-O99 (pregnancy): reproductive age 12-55

### Asterisk (✻) / Dagger (†) System
- **Dagger** = underlying disease (CAN be primary)
- **Asterisk** = manifestation (CANNOT be primary)
- Always sequence dagger first, asterisk second
- Symbols dropped in electronic claims but sequence maintained

### External Cause Code (ECC) — SA MANDATORY
- **ALL S/T codes (S00-T98) MUST have V01-Y98 as secondary**
- Without ECC: scheme cannot determine liability (RAF/COIDA/scheme)
- **Auto-reject** without ECC at most switches
- Changing S-codes to M-codes to avoid ECC = **FRAUD**

### Morphology Codes (M8000-M9989)
- Required with ALL Chapter 2 neoplasm codes (C00-D48) when surgery/pathology performed
- Format: M-xxxx/y where /0=benign, /1=uncertain, /2=in-situ, /3=malignant, /6=metastatic

---

## 2. CCSA TARIFF CODES (~9,000-10,000 active codes)

**Format**: 4-digit numeric (0100-9999). Version: CCSA V11 (October 2024). Licensed by SAMA from AMA.

**No national tariff since 2010** — each scheme derives rates from 2006 NHRPL base × annual escalation (5-8%/yr).

### Code Ranges by Section

| Range | Section |
|-------|---------|
| 0100-0399 | Consultations (E&M) |
| 0400-0499 | Anaesthesia |
| 0500-0699 | Surgery — General |
| 0700-0799 | Surgery — Integumentary |
| 0800-0999 | Surgery — Musculoskeletal |
| 1000-1199 | Surgery — Cardiovascular |
| 1200-1399 | Surgery — Digestive |
| 1400-1599 | Surgery — Urological |
| 1600-1799 | Surgery — Gynaecology |
| 1800-1999 | Surgery — Neurosurgery |
| 2000-2199 | Surgery — ENT |
| 2200-2399 | Surgery — Ophthalmology |
| 3600-3699 | Radiology — X-ray |
| 3750-3769 | Mammography |
| 3800-3899 | Ultrasound |
| 3900-3949 | CT scan |
| 3950-3999 | MRI |
| 4000-4099 | Nuclear medicine |
| 4200-4799 | Pathology |
| 5000-5499 | Medicine specialties |
| 6000-6999 | Allied health |
| 8100-8899 | Dental |

### GP Consultations (0190-0199)
| Code | Description | Est. Rate |
|------|-------------|-----------|
| 0190 | Brief (<10 min) | R350-420 |
| 0191 | Intermediate (10-20 min) | R480-580 |
| 0192 | Comprehensive (20-30 min) | R580-720 |
| 0193 | Extended/complex (>30 min) | R720-900 |
| 0194 | Follow-up (brief) | R280-350 |
| 0197 | Telehealth audio/video | R400-520 |

### Specialist Consultations (0141-0149)
| Code | Description | Est. Rate |
|------|-------------|-----------|
| 0141 | Initial/comprehensive | R850-1,200 |
| 0142 | Follow-up | R550-780 |
| 0143 | Extended (>45 min) | R1,200-1,800 |
| 0146 | Emergency/urgent | R1,100-1,600 |
| 0149 | Telehealth | R700-1,000 |

### Pathology (Key Codes)
| Code | Test | Rate |
|------|------|------|
| 4014 | FBC | R85-120 |
| 4042 | U&E panel | R180-250 |
| 4050 | Glucose (fasting) | R35-50 |
| 4052 | HbA1c | R120-180 |
| 4059 | Lipogram | R180-260 |
| 4068 | LFT panel | R220-320 |
| 4070 | TSH | R120-180 |
| 4080 | Troponin | R150-220 |
| 4090 | PSA | R150-220 |
| 4210 | HIV ELISA | R100-150 |
| 4211 | HIV viral load | R450-650 |

### Radiology (Key Codes)
| Code | Procedure | Prof. Fee | Facility Fee |
|------|-----------|-----------|-------------|
| 3601 | Chest X-ray | R180-280 | R250-400 |
| 3751 | Mammogram | R350-500 | R400-600 |
| 3801 | Abdominal U/S | R350-500 | R300-450 |
| 3901 | CT brain | R800-1,200 | R1,500-2,500 |
| 3951 | MRI brain | R1,200-1,800 | R2,500-4,500 |

### Dental (8100-8899)
| Range | Category | Example Rates |
|-------|----------|--------------|
| 8100-8149 | Diagnostic | Exam R250-500, OPG R250-400 |
| 8150-8199 | Preventive | Scale R350-550, fluoride R150-250 |
| 8200-8299 | Restorative | 1-surf amalgam R300-450, composite R350-520 |
| 8300-8399 | Endodontics | Root canal ant R1,800-2,800, molar R3,500-5,500 |
| 8500-8549 | Removable prosth | Full denture R3,500-6,000 |
| 8550-8599 | Fixed prosth | PFM crown R3,000-5,000, ceramic R4,000-7,000 |
| 8600-8699 | Oral surgery | Extraction R400-600, impaction R1,500-3,000 |

### Allied Health
| Discipline | Code | Initial | Follow-up | Limit |
|-----------|------|---------|-----------|-------|
| Physiotherapy | 6001/6002 | R450-650 | R350-500 | 12-15/yr |
| OT | 6100/6101 | R450-650 | R350-500 | 12-15/yr |
| Speech | 6200/6201 | R500-750 | R380-520 | 12/yr |
| Dietetics | 6300/6301 | R450-650 | R300-450 | 3-6/yr |
| Psychology | 6400/6401 | R800-1,200 | R650-950 | 15-21/yr |
| Chiropractic | 6500/6501 | R500-720 | R350-500 | 12/yr |

---

## 3. MODIFIER CODES (27 Complete)

| Mod | Description | Rate Impact |
|-----|-------------|-------------|
| 0001 | Reduced service | -50% |
| 0002 | Increased complexity | +25-50% |
| 0003 | Multiple procedures — 2nd | -50% |
| 0004 | Multiple procedures — 3rd | -75% |
| 0005 | Multiple procedures — 4th+ | -80% |
| 0006 | Bilateral | +50% (150%) |
| 0007 | With contrast (radiology) | +25-40% |
| 0008 | Professional component only | 40% of global |
| 0009 | Technical/facility only | 60% of global |
| 0010 | After-hours evening | +25-50% |
| 0011 | After-hours night | +50-100% |
| 0012 | After-hours Saturday | +25-50% |
| 0013 | After-hours Sunday | +50-100% |
| 0014 | Public holiday | +100% |
| 0015 | Assistant surgeon | 20% of primary |
| 0016 | Co-surgeon | 62.5% each |
| 0017 | Team surgery | Each bills own |
| 0018 | Repeat procedure | -20% |
| 0019 | Distinct procedure | 100% |
| 0021 | Decision for surgery | Consult billable |
| 0024 | MAC | 60-80% |
| 0025 | Conscious sedation | 40-50% |
| 0026 | Telehealth | 80-100% |

### Anaesthesia
Base units (3-15 per procedure) + Time units (1 per 15 min) × Per-unit rate (R180-280). ASA 3+ adds 1-3 units. Emergency +2 units.

### Surgical Global Periods
Minor: 0-10 days | Intermediate: 21 days | Major: 42-90 days
During global period: routine follow-up NOT separately billable.

---

## 4. UNBUNDLING RULES

**Unbundling = billing components separately when a bundled code exists = FRAUD**

| Rule | Detail |
|------|--------|
| Consult + procedure same day | Consult NOT billable unless decision for surgery (mod 0021) or different ICD-10 |
| Pathology panels | FBC, U&E, LFT, lipogram, thyroid panel — must use panel code, not components |
| Surgical package includes | Pre-op assessment, local anaesthesia by surgeon, post-op care in global period, wound care, drain/suture removal |
| Surgical package excludes | Pre-op workup (days before), separate anaesthetist, complications, beyond global period, implants |
| Left + right | Use bilateral code (mod 0006), not two separate claims |

---

## 5. BHF CODES

### Practice Number: 7 digits (`/^\d{7}$/`). Verify: pcns.co.za

### Place of Service
| Code | Location |
|------|----------|
| 11 | Office/Rooms |
| 12 | Home visit |
| 21 | Hospital inpatient |
| 22 | Outpatient |
| 23 | Emergency room |
| 41 | Ambulance |
| 65 | Day clinic |
| 81 | Laboratory |

### Scheme Codes
DH (Discovery) | GEMS | BON (Bonitas) | MH (Medihelp) | MOM (Momentum) | BM (Bestmed) | FH (Fedhealth) | POL (Polmed) | CC (CompCare) | SH (Sizwe Hosmed) | MS (Medshield) | KH (KeyHealth)

---

## 6. EDI FORMAT (PHISC MEDCLM v0-912-13.4)

### Message Structure
```
UNB  — Interchange header
  UNH  — Message header (MEDCLM:0:912:ZA)
  BGM  — Batch number (18 digits)
  DTM  — Dates (194=DOS, 329=DOB)
  NAD+SUP — Practice BHF
  NAD+TDN — Treating provider
  NAD+MPN — Membership number
  NAD+MSN — Dependent code + patient name
  RFF+AHI — SA ID number
  LIN+SRV — Tariff code  |  LIN+NAP — NAPPI code
  RFF+ICD — ICD-10 (per line, up to 4)
  RFF+MOD — Modifier
  RFF+AUT — Authorization number
  QTY+47  — Quantity
  MOA+203 — Amount (ZAR cents)
  TAX     — VAT (15%)
  LOC     — Place of service
  UNT  — Trailer
UNZ  — Interchange trailer
```

**Delimiters**: `'` (segment) | `+` (data) | `:` (component) | `?` (release)

### Response: STS segment with ACC (accepted) / REJ (rejected) / PAR (partial) + BHF adjustment code

---

## 7. SWITCHING HOUSE ROUTING

| Scheme | Switch |
|--------|--------|
| Discovery, Bonitas, Medihelp, Bankmed, LA Health | **Healthbridge** |
| GEMS, Momentum, Bestmed, Fedhealth, Polmed, Sizwe Hosmed | **SwitchOn** (Altron) |
| CompCare, Medshield, PPS, KeyHealth, Profmed | **MediKredit** |

### Protocols
- **Healthbridge**: XML/HTTPS, username/password auth
- **SwitchOn**: XML/HTTPS (namespace `urn:altron:switchon:v4`), Bearer/Basic auth
- **MediKredit**: XML/HTTPS (namespace `urn:medikredit:healthnet:v3`), Basic auth + X-Practice-Number header
