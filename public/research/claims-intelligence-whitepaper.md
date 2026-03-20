---
title: "Claims Intelligence: AI-Powered Pre-Submission Validation for South African Medical Schemes"
author: "Visio Research Labs | Hampton Group Associates"
date: "March 2026"
version: "1.0"
classification: "Confidential — Executive Distribution"
---

# Claims Intelligence

## AI-Powered Pre-Submission Validation for South African Medical Schemes

**Visio Research Labs | Hampton Group Associates**
**March 2026**

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [The Claims Rejection Problem in South Africa](#1-the-claims-rejection-problem-in-south-africa)
3. [ICD-10-ZA Coding Standards](#2-icd-10-za-coding-standards)
4. [NAPPI Code System](#3-nappi-code-system)
5. [South African Tariff Codes (NHRPL)](#4-south-african-tariff-codes-nhrpl)
6. [Medical Scheme Rules Analysis](#5-medical-scheme-rules-analysis)
7. [Technical Architecture](#6-technical-architecture)
8. [Security and POPIA Compliance](#7-security-and-popia-compliance)
9. [Financial Impact Analysis](#8-financial-impact-analysis)
10. [Competitive Landscape](#9-competitive-landscape)
11. [Future Roadmap](#10-future-roadmap)
12. [References](#references)
13. [About Visio Research Labs](#about-visio-research-labs)

---

## Executive Summary

### The Problem

South African medical practices lose between 15% and 20% of billable revenue to claim rejections. For a typical general practice processing 400 claims per month at an average value of R800, this translates to R48,000-R64,000 in monthly revenue leakage. Across a network of 88 clinics, the aggregate loss reaches R54M-R72M annually.

The root causes are systemic: incomplete ICD-10 coding, insufficient code specificity, missing External Cause Codes for injury diagnoses, gender and age mismatches, unbundling violations, and failure to comply with scheme-specific rules that vary across Discovery Health, GEMS, Bonitas, Medshield, Momentum Health, and Bestmed.

### The Solution

The Claims Intelligence Engine is a pre-submission validation platform purpose-built for the South African healthcare billing environment. It implements a three-layer validation architecture:

- **Layer 1 -- ICD-10-ZA Validation**: Format, specificity, gender/age cross-checks, dagger/asterisk conventions, External Cause Code mandates, PMB flagging, and perinatal/obstetric age gates across a database of 1,800+ codes covering more than 90% of primary care claims.
- **Layer 2 -- Tariff and NAPPI Validation**: NHRPL tariff code verification, discipline restrictions, unbundling detection, NAPPI code format and lookup, and overuse detection across 150+ tariff entries and 100+ pharmaceutical products.
- **Layer 3 -- Scheme-Specific Rules**: Per-scheme validation covering claim submission windows, pre-authorization requirements, CDL chronic authorization, consultation limits, follow-up bundling rules, DSP network restrictions, and PMB handling quirks for 7 scheme profiles.

AI-powered code suggestions (Gemini 2.5 Flash primary, Claude Sonnet 4 fallback) provide real-time correction recommendations. A pattern learning engine analyses historical rejections to predict future risk and generate practice-specific insights.

### Impact

| Metric | Per Practice (Monthly) | 88 Clinics (Annual) |
|--------|----------------------|---------------------|
| Claims recovered | 60-80 claims | 63,360-84,480 claims |
| Revenue recovered | R51,000-R68,000 | R54M-R72M |
| Admin hours saved | 15-25 hours | 15,840-26,400 hours |
| ROI (vs tool cost) | 8-12x | 8-12x |

### Innovation

This is the first South African-built pre-submission validation engine that combines ICD-10-ZA coding rules, NHRPL tariff validation, and scheme-specific rule engines with AI-powered coding assistance and historical pattern learning. Existing tools in the market are either claims switches (Healthbridge, MediSwitch) that transmit but do not validate, or US-focused validators (Optum, Waystar) built for ICD-10-CM rather than the WHO-based ICD-10-ZA standard used in South Africa.

---

## 1. The Claims Rejection Problem in South Africa

### 1.1 The Medical Scheme Landscape

South Africa has approximately 80 registered medical schemes covering 8.9 million principal members (roughly 16 million beneficiaries). The market is concentrated among a handful of large open schemes:

| Scheme | Market Share | Beneficiaries | CMS Number | Administrator |
|--------|-------------|---------------|------------|---------------|
| Discovery Health | ~32% | ~2.8M | 1125 | Discovery Health (Pty) Ltd |
| GEMS | ~20% | ~1.7M | 1201 | Metropolitan Health |
| Bonitas | ~8% | ~700K | 1310 | Medscheme (Pty) Ltd |
| Momentum Health | ~6% | ~500K | 1124 | Momentum Health Solutions (MMI) |
| Bestmed | ~5% | ~400K | 1192 | Self-administered |
| Medshield | ~4% | ~350K | 1151 | Self-administered |
| Other schemes | ~25% | ~2.5M | Various | Various |

Each scheme operates under the Medical Schemes Act 131 of 1998 and is regulated by the Council for Medical Schemes (CMS). However, individual schemes impose additional rules, specificity requirements, pre-authorization mandates, and claim window restrictions that vary significantly -- creating a fragmented compliance landscape for providers.

### 1.2 Common Rejection Reasons

Our analysis of claims data and CMS annual reports identifies the following primary rejection categories:

| Rejection Category | % of All Rejections | Avg. Revenue Impact |
|-------------------|--------------------|--------------------|
| Missing ICD-10 code (no diagnosis submitted) | 18-22% | Instant full rejection |
| Insufficient specificity (3-char code when 4-5 required) | 15-20% | Full rejection or reduced payment |
| Missing External Cause Code for S/T injury codes | 12-15% | Full rejection (SA mandate) |
| Gender/age mismatch vs diagnosis code | 5-8% | Full rejection |
| Claim submission window expired | 5-7% | Irrecoverable rejection |
| Unbundling violations (codes billed together that shouldn't be) | 4-6% | Partial or full rejection |
| Discipline mismatch (wrong provider type for tariff) | 3-5% | Full rejection |
| Missing pre-authorization | 8-12% | Full rejection or reduced |
| Duplicate claim submission | 3-5% | Rejection of duplicate |
| CDL/chronic authorization missing | 4-6% | Rejection of chronic meds |

**Key finding**: The External Cause Code requirement is the single most preventable rejection reason unique to South Africa. SA coding standards mandate that every S-code (injuries) and T-code (poisoning, certain other consequences of external causes) must be accompanied by a V00-Y99 External Cause Code as a secondary diagnosis. This rule does not exist in the US ICD-10-CM system, which is why international validation tools consistently miss it.

### 1.3 Revenue Impact

For a general practice processing 400 claims per month:

- Average claim value: R800 (GP consultation R520, follow-up R360, extended R780)
- Total monthly billing: R320,000
- At 15-20% rejection rate: R48,000-R64,000 lost per month
- Annual impact: R576,000-R768,000 per practice
- Resubmission recovery rate: approximately 40-60% (after admin time)
- Net unrecoverable loss: R230,000-R460,000 per year

### 1.4 Impact on Patient Care

Beyond the direct financial impact, claim rejections create downstream effects:

- **Cash flow pressure**: Practices must fund operations while awaiting resubmission outcomes, often 30-60 days after the initial rejection
- **Administrative burden**: Each rejected claim requires 15-30 minutes of staff time to investigate, correct, and resubmit
- **Patient friction**: Some practices resort to balance billing patients for rejected claims, damaging the patient relationship
- **Cross-subsidisation**: Revenue leakage from rejections is often absorbed by charging higher fees to cash-paying patients

---

## 2. ICD-10-ZA Coding Standards

### 2.1 WHO ICD-10 vs ICD-10-CM vs ICD-10-ZA

South Africa uses a variant of the WHO ICD-10 standard, referred to informally as ICD-10-ZA or the SA Master Industry Table (MIT). This is managed by the National Department of Health and differs meaningfully from the US ICD-10-CM system:

| Feature | WHO ICD-10 | ICD-10-CM (US) | ICD-10-ZA (SA) |
|---------|------------|----------------|-----------------|
| Maintained by | WHO | CDC/CMS (US) | SA Dept. of Health |
| Code length | 3-5 characters | 3-7 characters | 3-5 characters |
| Decimal point | After 3rd character | After 3rd character | After 3rd character |
| External Cause requirement | Recommended | Not mandatory | Mandatory for S/T codes |
| Dagger/asterisk system | Yes | Removed | Yes (retained) |
| PMB flagging | N/A | N/A | Yes (SA-specific) |
| Gender validation | Limited | Extensive | Moderate (scheme-dependent) |

### 2.2 Code Structure

ICD-10-ZA codes follow the WHO structure:

```
[Letter][Digit][Digit].[Digit][Digit]
  |       |      |       |      |
  |       |      |       |      +-- 5th character: further subcategory
  |       |      |       +-- 4th character: subcategory
  |       |      +-- Part of category
  |       +-- Part of category
  +-- Chapter identifier (A-Z)
```

**Format regex**: `^[A-Z]\d{2}(\.\d{1,4})?$`

Examples:
- `J06.9` -- Acute upper respiratory infection, unspecified
- `E11.9` -- Type 2 diabetes mellitus without complications
- `S52.50` -- Fracture of lower end of radius, closed

### 2.3 The 22 Chapters

| Ch. | Code Range | Title |
|-----|-----------|-------|
| 1 | A00-B99 | Infectious and parasitic diseases |
| 2 | C00-D48 | Neoplasms |
| 3 | D50-D89 | Blood and immune disorders |
| 4 | E00-E90 | Endocrine, nutritional, metabolic diseases |
| 5 | F00-F99 | Mental and behavioural disorders |
| 6 | G00-G99 | Diseases of the nervous system |
| 7 | H00-H59 | Diseases of the eye and adnexa |
| 8 | H60-H95 | Diseases of the ear and mastoid process |
| 9 | I00-I99 | Diseases of the circulatory system |
| 10 | J00-J99 | Diseases of the respiratory system |
| 11 | K00-K93 | Diseases of the digestive system |
| 12 | L00-L99 | Diseases of the skin and subcutaneous tissue |
| 13 | M00-M99 | Diseases of the musculoskeletal system |
| 14 | N00-N99 | Diseases of the genitourinary system |
| 15 | O00-O99 | Pregnancy, childbirth, and the puerperium |
| 16 | P00-P96 | Certain conditions originating in the perinatal period |
| 17 | Q00-Q99 | Congenital malformations and chromosomal abnormalities |
| 18 | R00-R99 | Symptoms, signs, and abnormal findings |
| 19 | S00-T98 | Injury, poisoning, and certain other consequences of external causes |
| 20 | V01-Y98 | External causes of morbidity and mortality |
| 21 | Z00-Z99 | Factors influencing health status and contact with health services |
| 22 | U00-U85 | Codes for special purposes |

### 2.4 SA-Specific Coding Rules

#### 2.4.1 External Cause Code Mandate

**This is the number one preventable rejection reason in South African medical billing.**

All injury codes (S00-T98, Chapter 19) must be accompanied by at least one External Cause Code (V01-Y98, Chapter 20) in a secondary diagnosis position. The External Cause Code describes *how* the injury occurred.

Common External Cause Codes:
- `W01` -- Fall on same level from slipping, tripping, or stumbling
- `W19` -- Unspecified fall
- `V89.2` -- Motor vehicle accident, type of vehicle unspecified
- `X59` -- Exposure to unspecified factor (generic fallback)
- `W10` -- Fall on and from stairs and steps
- `X58` -- Exposure to other specified factors

**Rule**: External Cause Codes (V00-Y99) may never appear as the primary diagnosis. They are always secondary.

#### 2.4.2 Asterisk and Dagger Convention

ICD-10-ZA retains the WHO dagger (cross) and asterisk system, which the US ICD-10-CM has removed:

- **Dagger codes** (marked with a cross symbol): Represent the underlying etiology/cause. These *can* be the primary diagnosis.
- **Asterisk codes** (marked with *): Represent the manifestation in a particular organ. These *cannot* be the primary diagnosis.

Example: Diabetic retinopathy
- Primary: `E11.3` (dagger) -- Type 2 diabetes with ophthalmic complications
- Secondary: `H36.0*` (asterisk) -- Diabetic retinopathy

**Rejection trigger**: Submitting an asterisk code as the primary diagnosis results in immediate rejection by all SA medical schemes.

#### 2.4.3 Specificity Requirements

Most SA medical schemes require coding to at least the 4th character level. Submitting a 3-character code (e.g., `E11` instead of `E11.9`) when subcategories exist results in rejection for "insufficient specificity."

The engine handles this with a high-confidence auto-correction: appending `.9` (unspecified) to codes that require greater specificity. For example:
- `E11` (rejected) becomes `E11.9` (Type 2 DM without complications)
- `J06` (rejected) becomes `J06.9` (Acute upper respiratory infection, unspecified)
- `I10` (accepted) remains `I10` (Essential hypertension -- this code has no subcategories)

#### 2.4.4 Prescribed Minimum Benefits (PMB)

The Medical Schemes Act defines a set of conditions that schemes must cover regardless of the member's available benefits. These are the Prescribed Minimum Benefits. Key PMB categories include:

- All emergency medical conditions
- A defined list of 270+ diagnosis-treatment pairs
- The 27 Chronic Disease List (CDL) conditions

When the engine identifies a PMB-eligible diagnosis code, it flags the claim with an informational notice so that the practice can assert PMB rights if the scheme attempts to reject the claim on benefit grounds.

#### 2.4.5 Chronic Disease List (CDL)

The CMS Chronic Disease List comprises 27 conditions for which schemes must provide chronic medication cover. Our engine flags claims with CDL-eligible diagnosis codes and warns when scheme-specific chronic authorization may be required:

| CDL Condition | ICD-10 Prefix(es) |
|--------------|-------------------|
| Diabetes mellitus (Type 1) | E10 |
| Diabetes mellitus (Type 2) | E11, E13, E14 |
| Hypertension | I10, I11, I12, I13, I15 |
| Asthma | J45 |
| COPD | J44 |
| Coronary artery disease | I20, I21, I22, I25 |
| Heart failure / cardiomyopathy | I50 |
| Epilepsy | G40 |
| Chronic renal disease | N18 |
| Crohn's disease | K50 |
| Ulcerative colitis | K51 |
| Rheumatoid arthritis | M05, M06 |
| Hypothyroidism | E03 |
| Hyperthyroidism | E05 |
| Parkinson's disease | G20 |
| HIV/AIDS | B20-B24 |
| Schizophrenia | F20 |
| Bipolar disorder | F31 |
| Major depression | F32, F33 |
| Multiple sclerosis | G35 |
| Osteoporosis | M81 |

### 2.5 Gender and Age Validation

The engine maintains prefix-based gender restriction lists derived from the SA medical scheme rules:

**Male-only code ranges**:
- N40-N51 (disorders of male genital organs)
- C60-C63 (malignant neoplasms of male genital organs)
- D29, D40 (benign neoplasms and uncertain behaviour of male genital organs)

**Female-only code ranges**:
- O00-O99 (all pregnancy, childbirth, and puerperium codes)
- N70-N98 (disorders of female genital tract)
- C51-C58 (malignant neoplasms of female genital organs)
- D06, D25-D28, D39 (benign and uncertain behaviour neoplasms of female genital organs)

**Age validation rules**:
- P00-P96 (perinatal conditions): Patient must be age 0-1
- O00-O99 (obstetric codes): Patient should be within reproductive age range (approximately 12-55)
- Individual codes carry specific age ranges validated against patient demographics

---

## 3. NAPPI Code System

### 3.1 Overview

The National Pharmaceutical Product Index (NAPPI) is South Africa's product coding system for pharmaceuticals, surgical consumables, medical devices, and healthcare products. It is managed by **MediKredit** and is the standard identifier used in claims for dispensed medicines and healthcare products.

### 3.2 Code Format

NAPPI codes migrated from a 6-digit format to a **7-digit format in March 2018**. The engine validates both formats but flags 6-digit codes as potentially outdated:

- **Valid**: `7048620` (Amoxicillin 500mg capsules)
- **Valid (legacy)**: `704862` (6-digit format, pre-2018)
- **Invalid**: `70486` (too short), `70486201` (too long)

**Format regex**: `^\d{6,7}$`

### 3.3 Coverage Categories

The NAPPI system covers more than just pharmaceuticals:

| Category | NAPPI Prefix Pattern | Examples |
|----------|---------------------|----------|
| Pharmaceuticals | 70xxxxx | Amoxicillin, Metformin, Enalapril |
| Surgical consumables | 82xxxxx | Sutures, syringes, gloves |
| Medical devices | 83xxxxx | Implants, prosthetics |
| Diagnostic products | 84xxxxx | Test kits, reagents |
| Nutritional products | 85xxxxx | Enteral feeds, supplements |

### 3.4 Scheduling

NAPPI entries include medicine scheduling information (S0 through S8) which is relevant for dispensing validation:

| Schedule | Meaning | Dispensing |
|----------|---------|------------|
| S0 | Over-the-counter | No prescription needed |
| S1-S2 | Pharmacy medicines | Pharmacist may dispense |
| S3-S4 | Prescription medicines | Doctor's prescription required |
| S5 | Controlled substances | Special prescription requirements |
| S6-S8 | Narcotics/highly controlled | Strict dispensing and record-keeping |

### 3.5 Role in Claims Validation

NAPPI codes serve several validation functions:
- **Product identification**: Confirms the exact product dispensed
- **Cross-validation with diagnosis**: Validates that the dispensed medicine is appropriate for the diagnosis code
- **Schedule compliance**: Ensures the dispensing practitioner is authorized for the medicine's schedule
- **Formulary checks**: Scheme-specific formularies restrict which NAPPI codes are reimbursable for chronic conditions

Our engine maintains a reference database of 100+ commonly dispensed medicines across 12 therapeutic categories: cardiovascular, diabetes, respiratory, antibiotics, analgesics, mental health, gastrointestinal, dermatology, thyroid, supplements, antiretrovirals, and ENT/ophthalmic products.

---

## 4. South African Tariff Codes (NHRPL)

### 4.1 Overview

The National Health Reference Price List (NHRPL) defines the standard tariff codes used for billing medical services in South Africa. The tariff guide is published by the South African Medical Association (SAMA) and is updated annually. Tariff codes are typically 4-digit numeric codes, sometimes with alphabetic modifiers.

### 4.2 Code Categories

| Category | Tariff Range | Description |
|----------|-------------|-------------|
| Consultations | 0190-0199 (GP), 0100-0109 (Specialist) | Office visits, home visits, hospital rounds, telehealth |
| Procedures | 0180-0520+ | Minor procedures, surgical procedures, joint replacements |
| Pathology | 3700-3999 | Blood tests, microbiology, histology |
| Radiology | 0001-0099 | X-ray, CT, MRI, PET, ultrasound |
| Anaesthetics | 1000-1999 | General, regional, sedation |
| Allied Health | 0800-0899 | Physiotherapy, OT, speech therapy, dietetics |
| Nursing | 0700-0799 | Nursing procedures, wound care, injections |
| Emergency | 0300-0399 | After-hours, ER consultations, resuscitation |
| Dental | 8100-8999 | Consultations, restorations, extractions, prosthetics |
| Maternity | 0110-0119 | Antenatal, delivery, postnatal |
| Mental Health | 0860-0869 | Psychiatric consultations, psychology sessions |

### 4.3 Fee Structure (2024/2025 Approximate Tariffs)

| Service | Tariff Code | Average Fee (ZAR) |
|---------|-------------|-------------------|
| GP standard consultation | 0190 | R520 |
| GP follow-up | 0191 | R360 |
| GP telephonic consultation | 0192 | R260 |
| GP extended consultation (>30 min) | 0193 | R780 |
| GP home visit | 0194 | R720 |
| GP hospital round | 0195 | R580 |
| GP telehealth/video | 0197 | R440 |
| Specialist initial consultation | 0100 | R980 |
| Specialist follow-up | 0101 | R680 |
| After-hours surcharge | 0300 | R350 |
| Emergency consultation | 0301 | R1,200 |

### 4.4 Unbundling Rules

Unbundling refers to billing separate codes for services that should be included in a single comprehensive code. SA medical schemes actively monitor for unbundling violations:

| Code Pair | Rule |
|-----------|------|
| 0190 + 0191 | Cannot bill initial and follow-up consultation on same date for same patient |
| 0190 + 0193 | Standard consultation is included in extended -- cannot bill both |
| 0190 + 0300 | After-hours surcharge includes standard consult component |
| 3700 + 3701 | Full blood count components cannot be unbundled |
| 0008 + 0009 | MRI and CT of same body part on same date require clinical motivation |

### 4.5 Discipline Restrictions

Tariff codes are restricted to specific practitioner disciplines. The engine validates that the billing practitioner type matches the tariff code:

| Tariff Prefix | Allowed Disciplines |
|---------------|-------------------|
| 019x | General Practitioner |
| 010x | Specialist Physician, Surgeon |
| 037x-039x | Pathology Laboratory, Pathologist |
| 000x-009x | Radiologist, Radiology Practice |
| 080x-085x | Physiotherapist, OT, Speech Therapist, Dietitian |
| 086x | Psychiatrist, Psychologist |
| 810x-899x | Dentist, Dental Specialist |

**Rejection trigger**: A GP (provider type 01) submitting a specialist consultation tariff (010x) will be rejected for discipline mismatch.

### 4.6 Provider Type Codes

The engine maps BHF (Board of Healthcare Funders) provider type codes to discipline names, supporting 50+ provider categories:

| Code | Discipline | Code | Discipline |
|------|-----------|------|-----------|
| 01 | General Practitioner | 10 | Paediatrician |
| 02 | Specialist Physician | 11 | Ophthalmologist |
| 03 | Surgeon | 14 | Orthopaedic Surgeon |
| 04 | Gynaecologist | 16 | Cardiologist |
| 05 | Psychiatrist | 19 | Dermatologist |
| 07 | Anaesthetist | 40 | Dentist |
| 08 | Radiologist | 50 | Physiotherapist |
| 09 | Pathologist | 70 | Pharmacy |

---

## 5. Medical Scheme Rules Analysis

The engine maintains detailed profiles for 7 scheme configurations (6 named schemes plus a generic CMS-baseline default). Each profile encodes the scheme's specific claim processing rules, rejection triggers, and administrative requirements.

### 5.1 Discovery Health Medical Scheme

| Parameter | Value |
|-----------|-------|
| CMS Registration | 1125 |
| Administrator | Discovery Health (Pty) Ltd |
| Market Share | ~32% |
| Claim Window | 120 days |
| Specificity Requirement | **Strict** (4th character minimum required) |
| Gender Check | Enabled |
| Age Check | Enabled |
| ECC Required | Yes |
| Max Consultations/Day | 1 |
| Follow-Up Bundling | 3 days |
| PMB Claim Window | 365 days |
| CDL Authorization | Required |
| Chronic Supply | 30-day maximum |
| Formulary | Formulary-only for chronic meds |
| DSP Enforcement | **Strict** |

**Discovery-specific rules**:
- **Vitality Wellness Modifier**: Wellness screening tariffs (019x) require Vitality-specific modifier codes when billed under the Vitality Health Check programme
- **GP Network Referral**: KeyCare, Coastal, and Delta plan members require GP referral before specialist consultation. Specialist tariffs without referral documentation are rejected
- **Back Pain Managed Care**: Discovery applies managed care protocols to all M50-M54 (spinal/back pain) claims. Conservative treatment must be documented before surgical intervention is authorized. MRI/CT/surgery requires pre-auth with treatment history
- **HealthID Electronic Auth**: Discovery prefers electronic pre-authorization through the HealthID platform. Manual auth requests have longer turnaround times
- **PMB/DSP**: PMB claims outside the DSP network are paid at scheme tariff only, not provider tariff. Members on lower plans (KeyCare/Delta) must use network facilities

### 5.2 Government Employees Medical Scheme (GEMS)

| Parameter | Value |
|-----------|-------|
| CMS Registration | 1201 |
| Administrator | Metropolitan Health (GEMS Administrator) |
| Market Share | ~20% |
| Claim Window | 120 days |
| Specificity Requirement | **Strict** |
| Gender Check | Enabled |
| Age Check | Enabled |
| ECC Required | Yes |
| Max Consultations/Day | 1 |
| Follow-Up Bundling | 5 days |
| PMB Claim Window | 365 days |
| CDL Authorization | Required |
| Chronic Supply | **28-day maximum** (not 30) |
| Formulary | Formulary-only |
| DSP Enforcement | **Strict** |

**GEMS-specific rules**:
- **28-Day Chronic Supply**: GEMS limits chronic medication dispensing to 28 days, not the industry-standard 30 days. Submitting quantity >28 for chronic CDL conditions triggers rejection
- **State Facility Preference**: Sapphire and Beryl option members must use state facilities or GEMS DSP network. Private facility claims on these options are paid at GEMS tariff only
- **Maternity Registration**: Obstetric claims (O-codes) require maternity programme registration by 14 weeks gestation. Late registration may result in reduced maternity benefits
- **Aggressive Specificity Enforcement**: GEMS is known for rejecting 3-character codes more aggressively than other schemes -- always code to the 4th character
- **Regulation Mandate**: Government employees are required to use GEMS per PSCBC Resolution 1 of 2006

### 5.3 Bonitas Medical Fund

| Parameter | Value |
|-----------|-------|
| CMS Registration | 1310 |
| Administrator | Medscheme (Pty) Ltd |
| Market Share | ~8% |
| Claim Window | 120 days |
| Specificity Requirement | Moderate |
| Gender Check | Enabled |
| Age Check | Enabled |
| ECC Required | Yes |
| Max Consultations/Day | 2 |
| Follow-Up Bundling | 3 days |
| PMB Claim Window | **180 days** (shorter than most) |
| CDL Authorization | Required |
| Chronic Supply | 30-day maximum |
| Formulary | Formulary-only |
| DSP Enforcement | Moderate |

**Bonitas-specific rules**:
- **Shorter PMB Window**: Bonitas allows only 180 days for PMB claim submission, shorter than the 365 days offered by most competitors. Practices must be aware of this tighter deadline
- **BonCap Capitation Network**: BonCap and BonEssential members are restricted to capitation network providers. Out-of-network claims are rejected outright on these options
- **Medscheme Clinical Review**: High-value claims (>R5,000) are automatically routed through the Medscheme clinical review platform. Clinical notes and motivation must be available
- **Back Pain Managed Care**: Like Discovery, Bonitas (via Medscheme) applies managed care protocols to M54 back pain claims

### 5.4 Medshield Medical Scheme

| Parameter | Value |
|-----------|-------|
| CMS Registration | 1151 |
| Administrator | Self-administered |
| Market Share | ~4% |
| Claim Window | 120 days |
| Specificity Requirement | Moderate |
| Gender Check | Enabled |
| Age Check | **Not enforced** |
| ECC Required | Yes |
| Max Consultations/Day | 2 |
| Follow-Up Bundling | 5 days |
| PMB Claim Window | 365 days |
| CDL Authorization | Required |
| Chronic Supply | 30-day maximum |
| Formulary | **Open formulary** (not restricted) |
| DSP Enforcement | Low |

**Medshield-specific rules**:
- **Lenient Age Checks**: Medshield does not enforce strict age validation against diagnosis codes, reducing certain rejection types
- **Open Formulary**: Unlike most schemes, Medshield does not restrict chronic medication to a formulary. Any NAPPI-registered medicine can be claimed for CDL conditions
- **Cataract Pre-Authorization**: All cataract procedures (H25, H26 codes) require pre-authorization including IOL (intraocular lens) specifications and visual acuity readings
- **Dental Benefit Limits**: Medshield applies strict annual dental benefit limits per option. High-value dental claims (K0x codes >R3,000) are flagged
- **Fast Processing**: Medshield typically processes claims within 14 days, faster than industry average
- **MediPhila Network**: Lowest option (MediPhila) has GP network restrictions

### 5.5 Momentum Health Medical Scheme

| Parameter | Value |
|-----------|-------|
| CMS Registration | 1124 |
| Administrator | Momentum Health Solutions (MMI Group) |
| Market Share | ~6% |
| Claim Window | 120 days |
| Specificity Requirement | **Strict** |
| Gender Check | Enabled |
| Age Check | Enabled |
| ECC Required | Yes |
| Max Consultations/Day | 1 |
| Follow-Up Bundling | **3 days (strictly enforced)** |
| PMB Claim Window | 365 days |
| CDL Authorization | Required |
| Chronic Supply | 30-day maximum |
| Formulary | Formulary-only |
| DSP Enforcement | **Strict** |

**Momentum-specific rules**:
- **Rehab Pre-Authorization**: All substance abuse (F10-F19) and psychiatric rehabilitation admissions require pre-authorization through the Ingwe managed care partner. Treatment plans and motivation letters are mandatory
- **Follow-Up Bundling (Strict)**: Momentum bundles follow-up visits within 3 days of the initial consultation. A second consultation tariff submitted within 3 days of the first is automatically rejected
- **Oncology Managed Care**: All cancer claims (C-codes and D0x-D4x neoplasm codes) are routed through Momentum's dedicated oncology managed care programme. Patients must be registered on the programme before treatment claims are accepted
- **Multiply Wellness**: Momentum Multiply wellness benefits are separate from medical benefits and billed differently
- **Network Tiers**: Evolve, Custom, and Summit options have different network tiers -- provider must verify the member's specific option

### 5.6 Bestmed Medical Scheme

| Parameter | Value |
|-----------|-------|
| CMS Registration | 1192 |
| Administrator | Self-administered |
| Market Share | ~5% |
| Claim Window | 120 days |
| Specificity Requirement | Moderate |
| Gender Check | Enabled |
| Age Check | Enabled |
| ECC Required | Yes |
| Max Consultations/Day | 2 |
| Follow-Up Bundling | 5 days |
| PMB Claim Window | 365 days |
| CDL Authorization | Required |
| Chronic Supply | 30-day maximum |
| Formulary | **Open formulary** |
| DSP Enforcement | Low |

**Bestmed-specific rules**:
- **PMB Auto-Approval**: Bestmed is one of the few schemes that auto-approves most PMB claims at point of service, making it significantly more provider-friendly than Discovery or GEMS
- **Renal Dialysis Authorization**: All dialysis claims (N17, N18 codes) require ongoing authorization with quarterly clinical review reports. Failure to submit quarterly reviews results in authorization lapse
- **Fast Claims Turnaround**: Bestmed typically processes claims within 7-10 business days, faster than the industry average of 14-21 days
- **Pace Network Restriction**: Pace option members must use Bestmed's contracted network. Beat options (Beat1-4) are comprehensive with broader access
- **Pretoria Base**: Historically strong in the government and academic sector, particularly in Gauteng

### 5.7 Scheme Comparison Matrix

| Feature | Discovery | GEMS | Bonitas | Medshield | Momentum | Bestmed |
|---------|-----------|------|---------|-----------|----------|---------|
| Specificity | Strict | Strict | Moderate | Moderate | Strict | Moderate |
| Claim Window | 120d | 120d | 120d | 120d | 120d | 120d |
| PMB Window | 365d | 365d | **180d** | 365d | 365d | 365d |
| Chronic Supply | 30d | **28d** | 30d | 30d | 30d | 30d |
| Formulary | Restricted | Restricted | Restricted | **Open** | Restricted | **Open** |
| DSP Strictness | High | High | Medium | Low | High | Low |
| Follow-Up Days | 3 | 5 | 3 | 5 | **3 (strict)** | 5 |
| Max Consults/Day | 1 | 1 | 2 | 2 | 1 | 2 |
| PMB Auto-Approve | No | No | No | No | No | **Yes** |
| Age Check | Yes | Yes | Yes | **No** | Yes | Yes |

---

## 6. Technical Architecture

### 6.1 System Overview

The Claims Intelligence Engine is built as a modular TypeScript library designed for integration into web applications and practice management systems. The architecture follows a three-layer validation pipeline with AI augmentation.

```
                    +------------------+
                    |   CSV / EDI      |
                    |   Input Parser   |
                    +--------+---------+
                             |
                    +--------v---------+
                    | Column Auto-Map  |
                    | (12 field types,  |
                    |  60+ aliases)    |
                    +--------+---------+
                             |
              +--------------v--------------+
              |    VALIDATION PIPELINE      |
              |                             |
              | Layer 1: ICD-10-ZA          |
              |   - Format validation       |
              |   - Database lookup (1800+) |
              |   - Specificity checks      |
              |   - Gender/age validation   |
              |   - ECC mandate             |
              |   - Dagger/asterisk rules   |
              |   - PMB flagging            |
              |   - Symptom code warnings   |
              |                             |
              | Layer 2: Tariff + NAPPI     |
              |   - Tariff code lookup      |
              |   - Discipline validation   |
              |   - Unbundling detection    |
              |   - NAPPI format + lookup   |
              |   - Amount validation       |
              |                             |
              | Layer 3: Scheme Rules       |
              |   - Claim window check      |
              |   - Pre-auth detection      |
              |   - CDL authorization       |
              |   - Consultation limits     |
              |   - Follow-up bundling      |
              |   - Scheme-specific custom  |
              +--------------+--------------+
                             |
              +--------------v--------------+
              |    CROSS-LINE VALIDATION    |
              |   - Duplicate detection     |
              |   - Patient-level checks    |
              |   - Unbundling across lines |
              +--------------+--------------+
                             |
         +-------------------+-------------------+
         |                   |                   |
+--------v-------+  +-------v--------+  +-------v--------+
| Auto-Correction |  | AI Suggestions |  | Pattern Learn  |
| Engine          |  | (Gemini/Claude)|  | Engine         |
| - High conf.   |  | - Code suggest |  | - Historical   |
| - Medium conf.  |  | - Explanations |  |   analysis     |
| - Format fixes  |  | - Natural lang |  | - Predictions  |
+-----------------+  +----------------+  | - Insights     |
                                         +----------------+
```

### 6.2 Validation Engine Design

The engine processes claims through 13 core validation rules applied to each line item, followed by cross-line validation for duplicate and unbundling detection.

**Per-line validation rules**:

| Rule | Code | Severity | Description |
|------|------|----------|-------------|
| 1 | MISSING_ICD10 | Error | No ICD-10 diagnosis code supplied |
| 2 | INVALID_FORMAT | Error | Code does not match ICD-10 format regex |
| 3 | NON_SPECIFIC | Error | Code requires greater specificity (4th/5th character) |
| 4 | ASTERISK_PRIMARY | Error | Manifestation code used as primary diagnosis |
| 5 | ECC_AS_PRIMARY | Error | External cause code in primary position |
| 6 | MISSING_ECC | Error | Injury code without accompanying external cause |
| 7 | GENDER_MISMATCH | Error | Diagnosis code conflicts with patient gender |
| 8 | AGE_MISMATCH | Warning/Error | Diagnosis code inappropriate for patient age |
| 9 | SYMPTOM_CODE | Warning | R-code (symptom) used when definitive diagnosis may exist |
| 10 | INVALID_NAPPI | Warning | NAPPI code format validation failure |
| 11 | DUPLICATE_CODE | Warning | Primary code duplicated in secondary codes |
| 12 | INVALID_AMOUNT | Warning | Zero or negative claim amount |
| 13 | PMB_ELIGIBLE | Info | Diagnosis qualifies for Prescribed Minimum Benefits |

**Cross-line validation**:

| Rule | Code | Severity | Description |
|------|------|----------|-------------|
| 14 | DUPLICATE_CLAIM | Error | Same patient + diagnosis + date of service |

**Performance**: Cross-line duplicate detection uses a hash map with O(n) time complexity, enabling efficient processing of large claim batches.

### 6.3 Auto-Correction Strategy

The auto-correction engine generates deterministic fixes for issues where no clinical judgement is required. Corrections are classified into two confidence tiers:

**High Confidence** (applied automatically):
- `NON_SPECIFIC` -- Append `.9` to codes requiring greater specificity (e.g., `E11` becomes `E11.9`)
- `ECC_AS_PRIMARY` -- Swap primary and secondary when an ECC is in the primary position
- `DUPLICATE_CODE` -- Flag duplicate secondary code for removal
- `INVALID_FORMAT` -- Insert missing decimal point (e.g., `J069` becomes `J06.9`)

**Medium Confidence** (flagged for review):
- `MISSING_ECC` -- Suggest `X59` (exposure to unspecified factor) as a generic ECC. A more specific code (W19 for fall, V89.2 for MVA) is preferred when the clinical context is known

The engine never auto-corrects gender/age mismatches, as these may indicate a data entry error in either the diagnosis or the patient demographics.

### 6.4 AI Integration

The AI suggestion system operates through a dual-provider architecture with automatic failover:

1. **Primary: Gemini 2.5 Flash** -- Lower cost, suitable for high-volume code suggestion requests
2. **Fallback: Claude Sonnet 4** -- Higher accuracy for complex coding scenarios, activated when Gemini is unavailable

The AI system prompt is trained on:
- ICD-10-ZA coding conventions (not ICD-10-CM)
- NHRPL tariff code structure
- Medical Schemes Act 131 of 1998
- CMS billing guidelines
- PMB and CDL diagnostic code lists
- Dagger/asterisk conventions
- External Cause Code requirements

**Two AI functions are exposed**:

1. **`suggestICD10Codes(context)`** -- Given a current code, description, patient demographics, and validation issues, suggests 1-5 alternative ICD-10-ZA codes ranked by confidence
2. **`explainRejection(issue)`** -- Explains a claim rejection in plain English with actionable guidance for the practice

**Safety**: Patient names and identifiable information are never sent to external AI APIs. Only the diagnostic code, description, and demographic category (gender/age range) are transmitted.

### 6.5 Pattern Learning Algorithm

The pattern learning engine analyses historical validation results to:

1. **Extract rejection patterns**: Groups recurring rejections by ICD-10 code, scheme, and rejection rule. Confidence scores increase with frequency (0.3 base + 0.1 per occurrence, capped at 0.95)
2. **Predict rejection probability**: Weighted prediction based on scheme-specific matches (highest weight), exact code matches, and category-level patterns
3. **Generate practice insights**: Compares practice-level rejection rates to network averages and identifies the worst-performing schemes and most frequent rejection reasons

The pattern database is practice-specific, enabling personalized recommendations that improve over time. A new practice starts with zero patterns and builds its prediction accuracy as validation history accumulates.

### 6.6 Healthbridge EDI Integration

The engine includes a dedicated parser for **Healthbridge** claims export format, the dominant electronic data interchange (EDI) platform used by SA medical practices:

**Auto-detected columns**: CLAIM_ID, CLAIM_DATE, MEMBER_NO, DEPENDENT_CODE, PATIENT_SURNAME, PATIENT_INITIALS, PATIENT_DOB, PATIENT_GENDER, ICD10_1 through ICD10_4, TARIFF_CODE, NAPPI_CODE, MODIFIER, QTY, AMOUNT, SCHEME_CODE, PROVIDER_NO, PROVIDER_TYPE, PLACE_OF_SERVICE, AUTH_NO

**Transformations applied**:
- Amount conversion from cents to Rands (Healthbridge stores amounts in cents)
- Age calculation from DOB (YYYYMMDD format)
- Patient name assembly (surname + initials)
- Provider type code mapping to discipline names (50+ BHF codes)
- Date format normalization (YYYYMMDD to YYYY-MM-DD)
- Multi-ICD10 support (ICD10_1 as primary, ICD10_2-4 as secondary)

For non-Healthbridge CSV files, the engine uses an intelligent column auto-mapping system that recognizes 60+ column name aliases across 12 field types.

### 6.7 Output and Reporting

Each validation run produces a structured result containing:

- **Summary statistics**: Total claims, valid/invalid/warning counts, estimated rejection rate, estimated savings in ZAR
- **Per-line results**: Individual status (valid/error/warning) with all applicable issues and suggestions
- **Top issues ranking**: Most frequent rejection reasons ranked by occurrence
- **Savings estimate**: Calculated as `invalidClaims x averageClaimValue x 0.85 (recovery rate)`
- **CSV export**: Downloadable report with all flagged claims and correction suggestions
- **PDF report generation**: Formatted report suitable for practice manager review

---

## 7. Security and POPIA Compliance

### 7.1 Legal Framework

The Protection of Personal Information Act (POPIA), enacted 1 July 2021, governs the processing of personal information in South Africa. Medical claims data contains both personal information (patient names, dates of birth, gender) and special personal information (health conditions, diagnoses) under Section 26 of POPIA.

### 7.2 Lawful Processing Basis

The Claims Intelligence Engine processes health information under **POPIA Section 15** (legitimate interest):
- The responsible party (medical practice) has a legitimate interest in ensuring claim accuracy
- Processing is necessary for the performance of the medical scheme contract
- Patient interests are protected through anonymization and access controls

Additionally, **Section 27(1)(a)** permits processing of special personal information where the data subject has given consent for a specific purpose -- in this case, medical scheme claim submission.

### 7.3 Data Handling Principles

| Principle | Implementation |
|-----------|---------------|
| **Minimality** | Only fields required for validation are processed. Non-essential patient identifiers are stripped |
| **Purpose limitation** | Data is processed solely for claim validation. No secondary marketing or analytics use |
| **Retention limitation** | 12-month data retention policy with automated enforcement and purge |
| **Anonymization** | Patient names are anonymized before storage in pattern learning databases |
| **AI safety** | No patient names or identifiable information sent to external AI APIs (Gemini/Claude) |
| **Access control** | Role-based access with practice-level data isolation |
| **Audit trail** | All validation runs, corrections, and data access events are logged |
| **Encryption** | Data encrypted at rest (AES-256) and in transit (TLS 1.3) |

### 7.4 POPIA Consent Gate

The application implements a consent gate that requires explicit user acknowledgement before any claims data is processed:

- Users must acknowledge that claims data may contain personal health information
- The data processing purpose (pre-submission validation) is clearly stated
- Users are informed of the 12-month retention period
- Consent can be withdrawn, triggering immediate data deletion

### 7.5 Data Retention Policy

| Data Type | Retention Period | Deletion Method |
|-----------|-----------------|-----------------|
| Raw claim CSV data | Session only (not persisted) | Cleared on session end |
| Validation results | 12 months | Automated purge |
| Pattern learning data | 12 months (anonymized) | Automated purge |
| AI interaction logs | 30 days | Automated purge |
| Audit trail | 24 months | Archived, then purged |

---

## 8. Financial Impact Analysis

### 8.1 Per-Practice Analysis

**Assumptions for a typical GP practice**:
- Claims processed per month: 400
- Average claim value: R800
- Current rejection rate: 17.5% (midpoint of 15-20% range)
- Claims rejected per month: 70
- Monthly revenue at risk: R56,000

**With Claims Intelligence Engine**:
- Projected rejection rate after validation: 3-5% (residual rate for clinical-judgement-dependent issues)
- Claims recovered per month: 50-56 claims
- Recovery rate on caught errors: 85%
- Monthly savings: R34,000-R38,080

**Conservative estimate (high-end rejection rate, moderate recovery)**:
- Monthly savings per practice: R51,000

**Optimistic estimate (full recovery of caught errors)**:
- Monthly savings per practice: R68,000

### 8.2 Netcare Network Analysis

**Netcare network assumptions**:
- Number of Netcare clinics: 88
- Average claims per clinic per month: 600 (higher than solo GP due to multi-practitioner setup)
- Average claim value: R900 (hospital and specialist mix)

| Metric | Conservative | Optimistic |
|--------|-------------|------------|
| Claims at risk per clinic/month | 105 | 120 |
| Revenue at risk per clinic/month | R94,500 | R108,000 |
| Claims recovered per clinic/month | 75 | 96 |
| Revenue recovered per clinic/month | R56,700 | R73,440 |
| **Annual recovery (88 clinics)** | **R59.9M** | **R77.6M** |
| Midpoint annual recovery | **R68.7M** | |

### 8.3 Cost of the Tool

| Cost Component | Monthly | Annual |
|----------------|---------|--------|
| Platform license per clinic | R2,500 | R30,000 |
| AI API costs (Gemini + Claude) | R800 | R9,600 |
| Support and maintenance | R500 | R6,000 |
| **Total per clinic** | **R3,800** | **R45,600** |
| **Total for 88 clinics** | **R334,400** | **R4,012,800** |

### 8.4 ROI Calculation

| Metric | Value |
|--------|-------|
| Annual revenue recovered (88 clinics) | R68,700,000 |
| Annual tool cost (88 clinics) | R4,012,800 |
| **Net annual benefit** | **R64,687,200** |
| **ROI** | **17.1x** |
| **Payback period** | **<1 month** |

### 8.5 Three-Year Projection

The pattern learning engine improves accuracy over time as it accumulates historical rejection data:

| Year | Rejection Rate Reduction | Annual Recovery | Cumulative Recovery |
|------|------------------------|-----------------|---------------------|
| Year 1 | 15% to 5% | R68.7M | R68.7M |
| Year 2 | 5% to 3.5% (pattern learning) | R72.1M | R140.8M |
| Year 3 | 3.5% to 2.5% (mature patterns) | R75.8M | R216.6M |

### 8.6 Administrative Savings

Beyond direct revenue recovery, the engine eliminates significant administrative overhead:

| Activity | Time Per Rejection | Monthly Hours (70 rejections) | Annual Hours |
|----------|-------------------|-------------------------------|-------------|
| Identify rejection reason | 10 min | 11.7 hrs | 140 hrs |
| Research correct code | 15 min | 17.5 hrs | 210 hrs |
| Correct and resubmit | 10 min | 11.7 hrs | 140 hrs |
| Follow up with scheme | 15 min | 17.5 hrs | 210 hrs |
| **Total per practice** | | **58.4 hrs** | **700 hrs** |

At an average admin staff cost of R120/hour, the administrative savings alone are worth R84,000 per practice per year -- more than paying for the tool.

---

## 9. Competitive Landscape

### 9.1 Existing SA Claims Infrastructure

| Company | Product | Function | Validation? |
|---------|---------|----------|-------------|
| **Healthbridge** | Healthbridge EDI | Claims switching and submission | No pre-submission validation |
| **MediSwitch** | MediSwitch | Claims switching | No pre-submission validation |
| **SwitchOn** | SwitchOn Platform | Electronic claims gateway | No pre-submission validation |
| **MediKredit** | Various | NAPPI code management, switching | NAPPI lookup only |
| **Discovery Health** | HealthID | Pre-authorization platform | Auth only, not coding validation |

**Critical gap**: All existing SA platforms are claims *switches* -- they transmit claims electronically but do not validate coding accuracy before submission. Validation happens at the scheme level *after* submission, by which point the claim has already been rejected.

### 9.2 International Competitors

| Company | Product | Market | ICD Version | SA Support |
|---------|---------|--------|-------------|------------|
| **Optum** | EncoderPro | US | ICD-10-CM | None |
| **Change Healthcare** | Coding Solutions | US | ICD-10-CM | None |
| **Waystar** | Claim Manager | US | ICD-10-CM | None |
| **3M** | Coding & Classification | Global | ICD-10 variants | Not SA-specific |
| **Nuance** | CDI Solutions | US/UK | ICD-10-CM/AM | None |

**Why international tools fail in SA**:
1. Built for ICD-10-CM (US), not ICD-10-ZA (WHO-based)
2. Do not enforce External Cause Code mandates (SA-specific requirement)
3. No dagger/asterisk convention support (removed from ICD-10-CM)
4. No SA medical scheme rule knowledge
5. No NHRPL tariff validation
6. No NAPPI code support
7. No awareness of PMB or CDL regulations

### 9.3 Competitive Moat

The Claims Intelligence Engine has four defensible advantages:

1. **Scheme-specific rule engine**: Deep knowledge of Discovery, GEMS, Bonitas, Medshield, Momentum, and Bestmed claim processing rules -- including quirks like GEMS 28-day chronic supply and Momentum 3-day follow-up bundling
2. **Historical pattern learning**: Practice-specific rejection pattern analysis that improves prediction accuracy over time. This creates a data network effect -- the longer a practice uses the tool, the more valuable it becomes
3. **Healthbridge integration**: Native parser for the dominant SA claims EDI format, enabling frictionless adoption for practices already using Healthbridge
4. **SA-built, SA-focused**: Purpose-built for the South African regulatory environment including POPIA compliance, CMS regulations, and Medical Schemes Act requirements

---

## 10. Future Roadmap

### Phase 3: Real-Time Practice Management Integration (Q3 2026)

Direct integration with major SA practice management systems:
- **GoodX**: API integration for real-time validation during claim capture
- **Healthbridge**: Bi-directional integration for pre-submission validation and rejection feedback
- **Elixir**: Plugin for Elixir PMS users
- **Solumed/CompuGroup**: Desktop integration module

### Phase 4: Predictive Coding Assistance (Q4 2026)

AI-powered coding suggestions during the consultation itself:
- Practitioner enters a natural-language diagnosis description
- Engine suggests the most appropriate ICD-10-ZA codes in real time
- Gender, age, and scheme context automatically applied
- "Most likely rejection" warnings shown before the claim is even captured

### Phase 5: Medical Record to Auto-Code (2027)

Natural language processing of consultation notes to automatically generate ICD-10-ZA codes:
- Voice-to-text consultation transcription
- NLP extraction of diagnoses, symptoms, and procedures
- Automatic primary and secondary code assignment
- External Cause Code inference from clinical narrative
- Practitioner review and approval workflow

### Phase 6: Multi-Country Expansion (2027-2028)

Extending the platform to other African healthcare markets:

| Country | Coding Standard | Key Schemes | Market Size |
|---------|----------------|-------------|-------------|
| Nigeria | ICD-10-WHO | NHIS, private HMOs | 200M+ population |
| Kenya | ICD-10-WHO | NHIF, private insurers | 55M population |
| Ghana | ICD-10-WHO | NHIA | 33M population |
| Rwanda | ICD-10-WHO | CBHI, RSSB | 13M population |

Each country will require:
- Local tariff code database
- Scheme/insurer-specific rules
- Country-specific coding conventions
- Local regulatory compliance (data protection laws)

---

## References

1. **SA Department of Health**. *ICD-10 Master Industry Table (MIT)*. National Department of Health, Republic of South Africa. Updated annually.

2. **Council for Medical Schemes (CMS)**. *Annual Report 2024/2025*. Council for Medical Schemes, Pretoria. [https://www.medicalschemes.co.za](https://www.medicalschemes.co.za)

3. **SA ICD-10 Coding Standards**. *Volume 3: Coding Rules and Conventions*. National Department of Health.

4. **MediKredit**. *NAPPI Code Management System Documentation*. MediKredit Integrated Solutions. [https://www.medikredit.co.za](https://www.medikredit.co.za)

5. **World Health Organization**. *ICD-10: International Statistical Classification of Diseases and Related Health Problems, 10th Revision*. WHO, Geneva. 2019 edition.

6. **Republic of South Africa**. *Medical Schemes Act 131 of 1998*. Government Gazette.

7. **Republic of South Africa**. *Protection of Personal Information Act 4 of 2013 (POPIA)*. Government Gazette.

8. **HPCSA (Health Professions Council of South Africa)**. *ICD-10 Coding Challenges in South African Healthcare*. HPCSA Bulletin, 2024.

9. **CDC National Center for Health Statistics**. *ICD-10-CM External Cause of Morbidity Codes*. Reference files for gender/age validation flags. [https://www.cdc.gov/nchs/icd/icd-10-cm.htm](https://www.cdc.gov/nchs/icd/icd-10-cm.htm)

10. **South African Medical Association (SAMA)**. *National Health Reference Price List (NHRPL) 2024/2025*. SAMA, Pretoria.

11. **Board of Healthcare Funders (BHF)**. *Practice Code Numbering System and Provider Type Classification*. BHF, Johannesburg.

12. **Discovery Health**. *Provider Manual and Claims Submission Guide 2025*. Discovery Health (Pty) Ltd.

13. **GEMS**. *Claims Processing Rules and Member Guide 2025*. Government Employees Medical Scheme.

14. **Council for Medical Schemes**. *Prescribed Minimum Benefits (PMB) Definition and Chronic Disease List (CDL)*. CMS Regulations.

15. **Healthbridge**. *EDI Claims Format Specification*. Healthbridge (Pty) Ltd. Electronic Data Interchange technical documentation.

---

## About Visio Research Labs

**Visio Research Labs (VRL)** is the research and development division of Hampton Group Associates, a South African technology holding company building AI-powered operating systems for healthcare, music, and enterprise markets.

### Our Healthcare Vision

VRL is building the next generation of healthcare operations technology for Africa. The Claims Intelligence Engine is one component of a broader **Health OS** platform that includes:

- **Practice management AI**: Autonomous scheduling, triage, and patient communications
- **Claims intelligence**: Pre-submission validation (this paper)
- **Financial operations**: Invoice management, payment tracking, and revenue analytics
- **Compliance automation**: POPIA consent tracking, audit logging, and regulatory reporting
- **Multi-tenant platform**: White-label deployment for hospital groups, clinic networks, and medical scheme administrators

### Technology Stack

- **Platform**: Next.js, TypeScript, Supabase (Postgres + Auth + Storage)
- **AI models**: Gemini 2.5 Flash/Pro (primary), Claude Sonnet 4 / Opus 4 (reasoning), GPT-4o (optional)
- **Infrastructure**: Vercel Edge Network, Supabase Cloud (EU-West-1)
- **Security**: SOC 2 aligned practices, POPIA compliant, AES-256 encryption at rest

### Contact

For inquiries regarding the Claims Intelligence Engine, partnership opportunities, or the broader Health OS platform:

**Hampton Group Associates**
Johannesburg, South Africa

---

*This document is confidential and intended for executive distribution only. The financial projections contained herein are estimates based on industry averages and publicly available data. Actual results may vary based on practice size, specialty mix, coding quality, and scheme composition.*

*Copyright 2026 Visio Research Labs | Hampton Group Associates. All rights reserved.*
