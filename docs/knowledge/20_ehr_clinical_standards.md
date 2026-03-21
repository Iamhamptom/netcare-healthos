# 20 — EHR Standards & Clinical Documentation Requirements (South Africa)
## VisioCorp Health Intelligence KB | Compiled 2026-03-21

---

## PURPOSE

This file defines every clinical documentation and EHR standard that VisioCorp health IT systems (HealthOps, Netcare Health OS, Claims Analyzer) must meet. It covers HPCSA record-keeping rules, medico-legal documentation, informed consent, prescriptions, referrals, sick notes, pathology/radiology requests, EHR data standards, interoperability, SA-specific features, and security/access control. All requirements are mapped to the relevant South African legislation, regulation, or guideline.

---

## PART A — CLINICAL DOCUMENTATION REQUIREMENTS

---

### 1. HPCSA MINIMUM CLINICAL RECORD REQUIREMENTS (BOOKLET 9)

**Authority**: Health Professions Council of South Africa — *Guidelines on the Keeping of Patient Records* (Booklet 9, revised November 2022)

#### 1.1 Compulsory Record Contents

Every consultation note MUST contain:

| # | Required Element | Detail |
|---|-----------------|--------|
| 1 | **Patient identifying particulars** | Full name, date of birth, ID/passport number, gender, contact details, next of kin |
| 2 | **Bio-psychosocial history** | Medical history, surgical history, family history, social history, **allergies** |
| 3 | **Date, time, and place** of every consultation | Including telehealth/WhatsApp interactions |
| 4 | **Clinical history** | Presenting complaint, history of present illness, review of systems |
| 5 | **Clinical examination findings** | Physical examination, vital signs, relevant negative findings |
| 6 | **Differential diagnoses** | All considered diagnoses, not just the final one |
| 7 | **Assessment / diagnosis** | Working diagnosis with ICD-10 code |
| 8 | **Proposed clinical management** | Treatment plan, clinical decisions made (who made them and when) |
| 9 | **Information and advice given** to patient | Education, lifestyle modifications, warnings |
| 10 | **Decisions agreed to by patient** | Shared decision-making documentation |
| 11 | **Medication prescribed** | Drug name, dosage, route, frequency, duration |
| 12 | **Treatment administered** | Procedures performed, injections given |
| 13 | **Investigations ordered** | Pathology, radiology, special investigations |
| 14 | **Results received** | Lab results, imaging reports, with dates |
| 15 | **Details of referrals** | To whom, why, urgency, what information sent |
| 16 | **Patient reaction to treatment** | Including adverse effects and complications |
| 17 | **Follow-up arrangements** | Next appointment date, conditions for earlier return |
| 18 | **Written proof of informed consent** | Where applicable (see Section 3) |

#### 1.2 Record Format Requirements

- **Legible** — if handwritten, must be readable by other practitioners
- **Non-erasable ink** — no pencil, no erasure fluid (Tipp-Ex)
- **Chronological order** — entries must be in date/time sequence
- **Signed and dated** — every entry must identify the author (name, designation, signature/electronic ID)
- **Corrections** — single line through error, initialled and dated; never obliterate
- **Electronic records** — must have secure access controls, audit trails, backup systems, and comply with ECTA (Electronic Communications and Transactions Act, 2002)

#### 1.3 Record Retention Periods

| Patient Category | Minimum Retention |
|-----------------|-------------------|
| Adult patients | **6 years** from date record became dormant |
| Minor patients (under 18) | Until the patient's **21st birthday** |
| Mental health patients | **6 years** after discharge or death |
| Occupational health | **40 years** (per OHSA, Mine Health and Safety Act) |
| Records involved in litigation | **Indefinitely** until matter concluded + 3 years |
| Public sector (National Archives Act) | **5 years** minimum, but may not destroy without Archives authority |

> **EHR implication**: Systems MUST enforce retention policies with automated alerts before any record deletion. "Soft delete" preferred — mark as dormant, never physically destroy without authorisation.

---

### 2. MEDICO-LEGAL DOCUMENTATION STANDARDS

**Authority**: HPCSA Ethical Rules, MPS (Medical Protection Society) Guidelines, common law

#### 2.1 What Protects the Practitioner in Court

The clinical record is the **primary evidence** in any medico-legal proceeding. Courts apply the principle: **"If it's not documented, it didn't happen."**

**Essential elements for legal defensibility:**

| Element | Why It Matters |
|---------|---------------|
| **Contemporaneous notes** | Written at or near the time of consultation — not reconstructed later |
| **Objective findings** | Physical examination findings documented factually, not interpretively |
| **Clinical reasoning** | Why a particular diagnosis or treatment was chosen over alternatives |
| **Differential diagnoses documented** | Shows the practitioner considered alternatives |
| **Risk-benefit discussion recorded** | Proves informed consent was obtained |
| **Non-compliance documented** | Patient refusal of advice/treatment must be recorded with witness if possible |
| **Follow-up plan documented** | Demonstrates continuity of care |
| **Adverse events documented** | Immediate, honest, factual recording of complications |
| **Referral documentation** | When, to whom, why, what information was communicated |
| **Communication with patient** | Telephonic/WhatsApp advice must be documented in the record |

#### 2.2 Format Standards

- **Standardised format** recommended: History → Physical findings → Investigations → Diagnosis → Treatment → Outcome (HPIDTO or SOAP format)
- **Legible handwriting** or electronic entry — illegible scrawlings are "valueless" and can be misinterpreted (MPS guidance)
- **No abbreviations** unless universally understood (avoid idiosyncratic shorthand)
- **Corrections** must never obscure the original entry — single strikethrough, initial, date
- **Electronic systems** must maintain complete audit trail of all modifications

#### 2.3 Time-Critical Documentation

| Scenario | Documentation Deadline |
|----------|----------------------|
| Routine consultation | Same day (ideally immediately after) |
| Emergency/trauma | Within 6 hours of stabilisation |
| Surgical procedure | Operative note before leaving theatre/recovery |
| Death | Death notification (DHA-1663) within 24 hours |
| Adverse event / complication | Immediately upon recognition |
| Reportable condition (NHA s45) | Within 24 hours to provincial DoH |

---

### 3. INFORMED CONSENT DOCUMENTATION

**Authority**: HPCSA Booklet 4 — *Seeking Patients' Informed Consent: The Ethical Considerations* (revised December 2021); National Health Act s6-s8; Constitution s12(2)

#### 3.1 What Must Be Disclosed

The practitioner must provide **full and frank disclosure** of:

| # | Disclosure Element |
|---|-------------------|
| 1 | **Diagnosis** — the patient's condition explained in understandable terms |
| 2 | **Nature of proposed treatment/procedure** — what will be done |
| 3 | **Treatment goals** — expected outcomes |
| 4 | **Treatment options** — all reasonable alternatives, including no treatment |
| 5 | **Material risks** — risks that a reasonable person in the patient's position would want to know (Castell v De Greef standard) |
| 6 | **Benefits** of the proposed treatment |
| 7 | **Risks of refusing treatment** |
| 8 | **Costs** — estimated fees and financial implications |
| 9 | **Right to refuse** — patient's right to decline or withdraw consent |
| 10 | **Right to a second opinion** |

#### 3.2 Documentation Requirements

- **Form**: Oral or written, but **written consent strongly recommended** for all invasive procedures, anaesthesia, surgery, and high-risk treatments
- **Language**: Must be in a language the patient understands; interpreter used if necessary (documented)
- **Literacy**: Manner of explanation must account for the patient's level of literacy
- **Signature**: Patient (or legal guardian for minors/incapacitated), practitioner, and ideally a witness
- **Ongoing process**: Consent is not a once-off event — must be renewed if treatment plan changes materially
- **Emergency exception**: If patient cannot consent and delay would be life-threatening → treat under necessity, document circumstances (NHA s7(1)(e))

#### 3.3 Special Consent Scenarios

| Scenario | Requirement |
|----------|-------------|
| **Minors (under 18)** | Parent/guardian consent; child over 12 may consent to medical treatment (Children's Act s129); surgical consent from age 12 with parent |
| **HIV testing** | Pre- and post-test counselling documented; written consent required |
| **Research participation** | Separate informed consent, ethics committee approval, voluntary, may withdraw |
| **Sterilisation** | Written consent mandatory; 30-day waiting period (Sterilisation Act 44 of 1998) |
| **Termination of pregnancy** | Informed consent of the woman only (CTOPA); no spousal consent required |
| **Organ donation** | Written consent, two witnesses (National Health Act s55-s68) |
| **Telemedicine** | Consent for remote consultation AND for data transmission must be documented |

> **EHR implication**: System must support digital consent capture (e-signature or checkbox with timestamp + practitioner ID), consent versioning, consent withdrawal tracking, and consent status visibility on patient dashboard.

---

### 4. REFERRAL LETTER REQUIREMENTS

**Authority**: HPCSA guidelines; Medical scheme rules; NDoH Referral Policy for SA Health Services

#### 4.1 Minimum Content for Scheme Payment

For a medical scheme to pay a specialist claim, the referral must contain:

| # | Required Field | Notes |
|---|---------------|-------|
| 1 | **Patient full name** | As per scheme records |
| 2 | **Date of birth** | For patient identification |
| 3 | **Medical scheme name and number** | Including option/plan |
| 4 | **Dependant code** | Main member vs dependant |
| 5 | **Patient contact number** | For scheme follow-up |
| 6 | **Referring doctor details** | Name, practice number (PCNS), HPCSA number, contact details |
| 7 | **Date of referral** | Must precede specialist consultation date |
| 8 | **Date of appointment** (if known) | For pre-authorisation alignment |
| 9 | **Clinical details** | Presenting complaint, relevant history, examination findings |
| 10 | **Diagnosis / ICD-10 code** | Primary and secondary diagnoses |
| 11 | **Reason for referral** | What question needs answering or what procedure is needed |
| 12 | **Supporting documents** | ECG, X-ray, sonar, blood results — attach copies |
| 13 | **Urgency indication** | Routine / Urgent / Emergency |

#### 4.2 Scheme-Specific Rules

- **Discovery Health**: Requires pre-authorisation number on referral for in-hospital specialist consultations
- **GEMS**: Referral valid for 6 months from date of issue; new referral required for ongoing specialist care beyond this period
- **Most schemes**: Specialist cannot claim without a valid referral letter from the GP/referring practitioner — claims will be rejected with code "no valid referral"
- **Direct access specialists** (ophthalmology, psychiatry, gynaecology in some schemes): Referral may not be required — check scheme rules

#### 4.3 NDoH Public Sector Referral Levels

| Level | Facility | Referral Route |
|-------|----------|---------------|
| 1 | PHC clinic / CHC | First contact — no referral needed |
| 2 | District hospital | Referral from PHC |
| 3 | Regional hospital | Referral from district hospital |
| 4 | Tertiary / Central hospital | Referral from regional hospital |
| 5 | National / Specialised | Referral from tertiary |

> **EHR implication**: System must generate structured referral letters auto-populated from the patient record, support bi-directional referral tracking (sent/received/acknowledged), and flag when specialist claims lack a matching referral.

---

### 5. SICK NOTE / MEDICAL CERTIFICATE REQUIREMENTS

**Authority**: Basic Conditions of Employment Act 75 of 1997 (BCEA) s23; Health Professions Act; Ethical Rule 16; Sectoral Determination 13

#### 5.1 When Required

- Absence of **more than 2 consecutive days**
- Absence on **more than 2 occasions in any 8-week period**
- Employer may require certificate for shorter absences only if company policy states this

#### 5.2 Who May Issue

Per Sectoral Determination 13, the following are authorised to issue medical certificates:

| Practitioner | Max Duration |
|-------------|-------------|
| Medical practitioner (doctor) | Unlimited |
| Dentist | For dental conditions |
| Clinical psychologist | For psychological conditions |
| Professional nurse practitioner | **Maximum 2 days** — refer to doctor if not improved |
| Traditional healer (registered with THPCSA) | Accepted under BCEA |
| Community health worker | Limited — accepted under Sectoral Determination 13 |

#### 5.3 Required Contents (Ethical Rule 16)

| # | Element | Mandatory? |
|---|---------|-----------|
| 1 | **Name of practitioner** | Yes |
| 2 | **Address of practitioner** | Yes |
| 3 | **Professional qualifications** | Yes |
| 4 | **HPCSA/SANC registration number** | Yes |
| 5 | **Name of patient** | Yes |
| 6 | **Date and time of examination** | Yes |
| 7 | **Statement**: issued based on personal examination OR based on patient-reported information | Yes — must specify which |
| 8 | **Exact period of recommended sick leave** (from date X to date Y) | Yes |
| 9 | **Date of issue** | Yes |
| 10 | **Practitioner signature** | Yes |
| 11 | **Practitioner initials and surname in BLOCK LETTERS** | Yes |
| 12 | **Diagnosis** | **NO** — BCEA does not require it; "medical condition" is sufficient; diagnosis is confidential under POPIA |

#### 5.4 Legal Constraints

- A practitioner **may not** issue a certificate for a condition they have not personally assessed or been consulted about
- **Backdating** a sick note is professional misconduct (HPCSA can sanction)
- A certificate stating the practitioner examined the patient when they did not is **fraud** (criminal offence)
- Employer may request **second opinion** if they have reasonable grounds to doubt the certificate

> **EHR implication**: System must generate compliant sick certificates with all mandatory fields, enforce the personal-observation vs reported-information distinction, and NEVER auto-populate the diagnosis field on the certificate (POPIA).

---

### 6. PRESCRIPTION REQUIREMENTS

**Authority**: Medicines and Related Substances Act 101 of 1965; General Regulations (2017, as amended); Good Pharmacy Practice Rules (SAPC)

#### 6.1 Valid Prescription Must Contain

| # | Element | Detail |
|---|---------|--------|
| 1 | **Name of prescriber** | Full name |
| 2 | **Qualification of prescriber** | e.g., MBChB, BDS, BPharm |
| 3 | **Registration number** | HPCSA or SAPC number |
| 4 | **Address of prescriber** | Practice address |
| 5 | **Contact details** | Telephone number |
| 6 | **Name of patient** | Full name |
| 7 | **ID number of patient** | SA ID or passport number |
| 8 | **Address of patient** | Residential address |
| 9 | **Age of patient** | Mandatory for paediatric dosing safety |
| 10 | **Gender of patient** | For drug interaction/dosing checks |
| 11 | **Date of prescription** | When written |
| 12 | **Medication name** | Approved name (generic) or proprietary name |
| 13 | **Dosage form** | Tablet, capsule, syrup, injection, etc. |
| 14 | **Strength** | mg, ml, units, etc. |
| 15 | **Dosage instructions** | Route, frequency, duration |
| 16 | **Quantity** | Total amount to dispense |
| 17 | **Number of repeats** | If applicable |
| 18 | **Prescriber signature** | Handwritten or advanced electronic signature (per ECTA s13) |

#### 6.2 Schedule-Specific Rules

| Schedule | Prescription Required? | Repeat Rules | Max Supply |
|----------|----------------------|--------------|------------|
| S0 | No | N/A | OTC |
| S1 | No (pharmacist sale) | N/A | Pharmacist supervision |
| S2 | No (pharmacist must record) | N/A | Pharmacist must record |
| S3-S4 | **Yes** | Pharmacist may supply once-off for max 30 days on original Rx | 6 months of repeats |
| S5 | **Yes** | Repeats allowed beyond 6 months under strict conditions | 30 days per supply |
| S6 | **Yes** | **No repeats** | Max **30 days** supply |
| S7 | Not for medical use | N/A | Research/forensic only |
| S8 | **Yes** (special permit from DoH) | **No repeats** | As per permit |

#### 6.3 Electronic Prescriptions

- Permitted under ECTA and Medicines Act General Regulations
- Must have **advanced electronic signature** (ECTA s13) — not a scanned image of a handwritten signature
- Must be transmitted via a secure system
- Original must be retained by prescriber; copy transmitted to pharmacy
- Pharmacist must verify prescriber identity before dispensing

> **EHR implication**: System must enforce all mandatory fields, validate schedule rules, check for drug interactions (DUR — see `06_pharmaceutical.md`), support e-prescribing with ECTA-compliant electronic signatures, and maintain a prescription audit trail.

---

### 7. PATHOLOGY / RADIOLOGY REQUEST FORM REQUIREMENTS

**Authority**: HPCSA guidelines; NHLS Standard Operating Procedures; SAAPMB guidelines; Private laboratory standards (Ampath, Lancet, PathCare)

#### 7.1 Pathology Request Form — Minimum Fields

| # | Field | Notes |
|---|-------|-------|
| 1 | **Requesting practitioner details** | Name, HPCSA number, practice number, contact details |
| 2 | **Patient demographics** | Full name, DOB, ID number, gender |
| 3 | **Medical scheme details** | Scheme name, number, option, dependant code |
| 4 | **Clinical information** | Presenting complaint, relevant history, current medication |
| 5 | **ICD-10 code** | Primary diagnosis — **required for scheme payment** |
| 6 | **Tests requested** | Specific test names (not just "full blood count" — specify components if needed) |
| 7 | **Specimen type** | Blood, urine, stool, swab, tissue, etc. |
| 8 | **Date and time of collection** | Critical for time-sensitive tests (e.g., cortisol, glucose) |
| 9 | **Urgency** | Routine / Urgent / STAT |
| 10 | **Fasting status** | For glucose, lipid profiles |
| 11 | **Pregnancy status** | For females of reproductive age |
| 12 | **Relevant medication** | Anticoagulants, immunosuppressants, etc. |

#### 7.2 Radiology Request — Minimum Fields

| # | Field | Notes |
|---|-------|-------|
| 1 | **Requesting practitioner details** | Name, HPCSA number, practice number |
| 2 | **Patient demographics** | Full name, DOB, ID number, gender |
| 3 | **Medical scheme details** | Scheme, number, option, authorisation number (if required) |
| 4 | **Clinical indication** | Why the imaging is needed — critical for radiologist interpretation |
| 5 | **ICD-10 code** | **Required for scheme payment** |
| 6 | **Examination requested** | Body part, view, modality (X-ray, CT, MRI, ultrasound) |
| 7 | **Laterality** | Left / Right / Bilateral |
| 8 | **Contrast required?** | Yes / No — affects scheduling and preparation |
| 9 | **Pregnancy status** | Mandatory for females of reproductive age (radiation/contrast risk) |
| 10 | **Allergy history** | Especially contrast/iodine allergies |
| 11 | **Relevant previous imaging** | For comparison |
| 12 | **Urgency** | Routine / Urgent / STAT |
| 13 | **Pre-authorisation number** | If required by scheme (MRI, CT, nuclear medicine usually require pre-auth) |

> **EHR implication**: System must generate structured request forms with all mandatory fields auto-populated from patient record, validate ICD-10 code presence before submission, and support electronic ordering with bi-directional result import.

---

## PART B — EHR DATA STANDARDS

---

### 8. MINIMUM DATASET FOR A PATIENT RECORD IN SA

**Authority**: NDoH Health Patient Registration System (HPRS); HNSF; HPCSA Booklet 9; POPIA

#### 8.1 Patient Demographics (HPRS Standard)

| Field | Format | Mandatory? | Source |
|-------|--------|-----------|--------|
| **SA ID number** | 13-digit (YYMMDD SSSS C A Z) | Yes (SA citizens) | DHA |
| **Passport number** | Country-specific format | Yes (foreign nationals) | Patient |
| **First name(s)** | Text, Unicode | Yes | Patient/ID |
| **Surname** | Text, Unicode | Yes | Patient/ID |
| **Date of birth** | YYYY-MM-DD (ISO 8601) | Yes | ID number derivation |
| **Gender** | M / F / Other / Unknown | Yes | Patient |
| **Population group** | For PEPFAR/research reporting only — **never for clinical decisions** | Optional | Patient (voluntary) |
| **Preferred language** | ISO 639-1 code (11 official languages) | Recommended | Patient |
| **Contact number (mobile)** | +27 XXXXXXXXX | Yes | Patient |
| **Contact number (alternative)** | +27 XXXXXXXXX | Recommended | Patient |
| **Email address** | standard format | Optional | Patient |
| **Physical address** | Street, suburb, city, province, postal code | Yes | Patient |
| **Postal address** | If different from physical | Optional | Patient |
| **Next of kin** | Name, relationship, contact number | Recommended | Patient |
| **Emergency contact** | Name, relationship, contact number | Yes | Patient |
| **Medical scheme** | Scheme name, number, option, dependant code | Yes (if insured) | Patient/scheme |
| **Employer** | For occupational health | Optional | Patient |

#### 8.2 Clinical Minimum Dataset

| Domain | Required Fields |
|--------|----------------|
| **Allergies** | Substance, reaction type, severity, date recorded, source (see Section 10) |
| **Current medications** | Drug name, dose, frequency, route, start date, prescriber (see Section 11) |
| **Active conditions/problems** | Diagnosis, ICD-10 code, date of onset, status (see Section 12) |
| **Surgical history** | Procedure, date, surgeon, facility |
| **Family history** | Condition, family member, status |
| **Social history** | Smoking, alcohol, substance use, occupation, living conditions |
| **Immunisation history** | Vaccine, date, batch number, site, administrator (see Section 13) |
| **Vital signs history** | See Section 14 |
| **Blood type** | ABO + Rh factor |
| **Chronic disease status** | HIV status (with consent), TB status, diabetes, hypertension, etc. |

#### 8.3 National Patient Master Index (MPI)

The CSIR-developed Health Patient Registration System (HPRS) provides:
- **Unique patient identifier** using SA ID number + biometric (where available)
- **Cross-facility patient matching** — allowing patient tracking across any public health facility
- **Integration with DHIS2** for aggregate reporting
- **Planned integration with NHI** patient registry

> **EHR implication**: Systems MUST support the HPRS unique identifier scheme, implement probabilistic patient matching (for patients without SA ID), and be ready for NHI patient registry integration.

---

### 9. CLINICAL CODING IN EHR

**Authority**: CMS CMScript 10/2024; NTT for ICD-10 Implementation; SA ICD-10 Coding Standards v3

#### 9.1 Should Clinical Notes Auto-Suggest ICD-10 Codes?

**Yes — but with safeguards.**

| Principle | Detail |
|-----------|--------|
| **Auto-suggestion is valuable** | SA ICD-10 has ~14,400 codes; practitioners frequently submit incorrect codes (74% accuracy rate — see `03_coding_standards.md`); auto-suggestion improves accuracy |
| **Practitioner must confirm** | AI-suggested codes must NEVER be auto-submitted — practitioner must review and approve |
| **Show confidence score** | Display the AI's confidence level alongside each suggestion |
| **Support 4th/5th character specificity** | SA coding standards require maximum specificity — suggest the most specific code, not just 3-character categories |
| **MIT columns** | SA uses the MIT (Master Industry Table) with columns for Age, Gender, Setting, and Clinical validation — EHR should validate against these |
| **Map to CCSA tariff codes** | Auto-suggest linked procedure codes (CCSA/CPT) based on the diagnosis |
| **NAPPI codes** | For dispensing claims, auto-link medications to NAPPI codes |
| **Multiple ICD-10 per claim** | Must support primary + secondary + comorbidity codes |
| **PMB flagging** | Auto-flag when an ICD-10 code maps to a PMB condition (see `04_pmb_and_cdl.md`) — trigger benefit routing |

#### 9.2 Coding Workflow in EHR

```
Practitioner documents clinical notes
  → NLP engine extracts key clinical terms
  → AI maps terms to candidate ICD-10 codes
  → System displays top 3-5 suggestions with confidence scores
  → Practitioner selects/confirms code(s)
  → System validates against MIT columns (age, gender, setting)
  → System auto-suggests linked CCSA procedure codes
  → System flags PMB conditions
  → Codes attached to claim for submission
```

> **Bias safeguard**: Auto-coding AI must be tested for demographic bias (see `07_fraud_detection.md` — racial discrimination in claims investigation). Code suggestions must be based solely on clinical content, never on patient demographics.

---

### 10. ALLERGY RECORDING STANDARDS

**Authority**: SNOMED CT Implementation Guide for Allergy; HL7 FHIR AllergyIntolerance resource; HPCSA Booklet 9

#### 10.1 Data Model

Every allergy/adverse reaction entry must capture:

| Field | Coding System | Values |
|-------|--------------|--------|
| **Type** | Local or SNOMED | Allergy / Non-allergic hypersensitivity / Intolerance |
| **Causative agent** | SNOMED CT + NAPPI (for drugs) | Substance or drug name |
| **Reaction/manifestation** | SNOMED CT | Anaphylaxis, rash, angioedema, GI upset, etc. |
| **Severity** | HL7 FHIR value set | Mild / Moderate / Severe / Life-threatening |
| **Criticality** | HL7 FHIR value set | Low / High / Unable to assess |
| **Certainty/verification** | HL7 FHIR value set | Confirmed / Unconfirmed / Refuted / Entered in error |
| **Date of onset** | ISO 8601 | When the reaction first occurred |
| **Date recorded** | ISO 8601 | When entered into the EHR |
| **Recorded by** | Practitioner ID | Who documented it |
| **Source** | Enum | Patient-reported / Clinician-observed / Laboratory-confirmed |
| **Clinical notes** | Free text | Additional context |

#### 10.2 Display Requirements

- **Allergy list must be visible** on every clinical screen (banner or sidebar)
- **Drug allergy alerts** must fire at point of prescribing — **blocking alert** for severe/life-threatening, **warning alert** for mild/moderate
- **"No Known Allergies" (NKA)** must be actively documented — an empty allergy list is not the same as NKA
- **Cross-reactivity checking** — e.g., penicillin allergy should flag cephalosporin caution
- **Colour coding** — red for severe/life-threatening, orange for moderate, yellow for mild

---

### 11. MEDICATION LIST MANAGEMENT

**Authority**: SAPC Good Pharmacy Practice Rules; HPCSA Booklet 9; Medicines Act

#### 11.1 Medication List Structure

| Status | Definition | Display |
|--------|-----------|---------|
| **Active** | Currently prescribed and being taken | Primary list — always visible |
| **Discontinued** | Stopped by prescriber — with reason and date | Secondary list — accessible but not prominent |
| **On hold** | Temporarily paused (e.g., pre-surgery) | Flagged with resume date |
| **Completed** | Course finished (e.g., antibiotics) | Archived |
| **Entered in error** | Data entry mistake | Hidden from clinical view, audit trail preserved |

#### 11.2 Per-Medication Data

| Field | Required? |
|-------|----------|
| Medication name (generic + brand) | Yes |
| NAPPI code | Yes (for claims) |
| Dose | Yes |
| Route | Yes |
| Frequency | Yes |
| Duration / end date | Yes |
| Prescriber | Yes |
| Date prescribed | Yes |
| Date last dispensed | Yes |
| Repeat information | Yes (repeats remaining, repeat interval) |
| Indication / linked diagnosis | Recommended |
| Special instructions | As needed |

#### 11.3 Drug Interaction Checking (DUR Engine)

The EHR must perform the 6-check Drug Utilisation Review (see `06_pharmaceutical.md`):

1. **Drug-drug interactions** — contraindicated combinations
2. **Drug-allergy interactions** — cross-reference allergy list
3. **Therapeutic duplication** — same drug class prescribed twice
4. **Drug-age appropriateness** — paediatric/geriatric contraindications
5. **Drug-gender appropriateness** — pregnancy category checks
6. **Dose range check** — flag sub-therapeutic or toxic doses

> **EHR implication**: Interaction alerts must be classified (contraindicated / major / moderate / minor) and the system must log practitioner override decisions with reasons.

---

### 12. PROBLEM LIST MANAGEMENT

**Authority**: HPCSA Booklet 9; ICD-10 SA coding standards

#### 12.1 Structure

| Status | Definition |
|--------|-----------|
| **Active** | Current condition requiring ongoing management |
| **Resolved** | Condition that has been cured or is no longer clinically significant |
| **Inactive** | Past condition with potential future relevance (e.g., previous cancer) |
| **Rule out** | Suspected but not yet confirmed — under investigation |

#### 12.2 Per-Problem Data

| Field | Required? |
|-------|----------|
| Problem/diagnosis description | Yes |
| ICD-10 code | Yes |
| Date of onset | Yes |
| Date diagnosed | Yes |
| Date resolved (if applicable) | As needed |
| Severity | Recommended |
| Treating practitioner | Recommended |
| Linked medications | Recommended |
| Linked investigations | Recommended |
| Notes | As needed |

#### 12.3 PMB Integration

- When a problem list entry maps to a **Prescribed Minimum Benefit (PMB)** condition, the system must:
  - Flag the condition as PMB-eligible
  - Alert billing that PMB funding rules apply
  - Trigger CDL (Chronic Disease List) workflow if one of the 27 CDL conditions (see `04_pmb_and_cdl.md`)
  - Ensure the patient is registered on the scheme's chronic programme

---

### 13. IMMUNISATION RECORDS

**Authority**: NDoH Expanded Programme on Immunisation (EPI-SA); Road to Health Booklet; WHO EPI standards

#### 13.1 Current EPI-SA Schedule (Revised January 2025)

| Age | Vaccine | Doses |
|-----|---------|-------|
| **Birth** | BCG, OPV 0 | 1 each |
| **6 weeks** | DTaP-IPV-Hib-HBV (Hexavalent), PCV 1, RV 1 | 3 |
| **10 weeks** | DTaP-IPV-Hib-HBV 2, RV 2 | 2 |
| **14 weeks** | DTaP-IPV-Hib-HBV 3, PCV 2 | 2 |
| **6 months** | Measles 1 (catch-up in high-risk areas) | 1 |
| **9 months** | PCV 3, Measles 1 | 2 |
| **12 months** | Measles 2 | 1 |
| **18 months** | DTaP-IPV-Hib booster | 1 |
| **6 years** | Td booster | 1 |
| **9 years** | HPV 1 (girls — school programme) | 1 |
| **9 years + 6 months** | HPV 2 (girls) | 1 |
| **12 years** | Td booster | 1 |

*Note: Private sector may include additional vaccines (varicella, hepatitis A, meningococcal, influenza).*

#### 13.2 Recording Requirements Per Vaccination

| Field | Required? |
|-------|----------|
| Vaccine name (trade name + generic) | Yes |
| Batch/lot number | Yes |
| Expiry date | Yes |
| Date administered | Yes |
| Dose number in series | Yes |
| Route of administration | Yes (IM / SC / oral) |
| Site of administration | Yes (left deltoid, right thigh, etc.) |
| Administering practitioner | Yes (name + registration number) |
| Facility | Yes |
| Adverse event (if any) | Yes — AEFI reporting mandatory |
| Linked to Road to Health booklet number | Recommended (public sector) |

#### 13.3 Digital Integration

- **Road to Health App (RTHA)**: Digitised version of the paper Road to Health booklet — EHR should integrate with or replicate its immunisation tracking
- **DHIS2 reporting**: Immunisation data must aggregate to the District Health Information System
- **EVDS (Electronic Vaccination Data System)**: Established during COVID-19; potential for broader immunisation tracking
- **Catch-up schedule generation**: System should auto-calculate catch-up schedules for children who missed vaccines

---

### 14. GROWTH CHARTS / VITALS RECORDING STANDARDS

#### 14.1 Adult Vital Signs

| Vital Sign | Unit | Normal Range | Recording Frequency |
|-----------|------|-------------|-------------------|
| **Blood pressure** | mmHg (systolic/diastolic) | <140/90 (general); <130/80 (diabetic) | Every visit |
| **Heart rate** | bpm | 60-100 | Every visit |
| **Respiratory rate** | breaths/min | 12-20 | Every visit |
| **Temperature** | °C | 36.1-37.2 | When clinically indicated |
| **Oxygen saturation** | % (SpO2) | 95-100% | When clinically indicated |
| **Weight** | kg | Tracked over time | Every visit |
| **Height** | cm | Once (adult) | On registration |
| **BMI** | kg/m² | 18.5-24.9 (normal) | Calculated from weight/height |
| **Waist circumference** | cm | <94 (male), <80 (female) | For metabolic risk |
| **Blood glucose** | mmol/L | Fasting 4.0-5.5; Random <7.8 | Diabetic/at-risk patients |
| **Pain score** | 0-10 (NRS) or Wong-Baker faces | 0 = no pain | When clinically indicated |

#### 14.2 Paediatric Growth Monitoring (Road to Health)

| Measurement | Chart Type | Standard |
|------------|-----------|----------|
| **Weight-for-age** | WHO growth curves (z-scores) | Plotted at every visit |
| **Length/height-for-age** | WHO growth curves | Plotted at every visit |
| **Weight-for-length/height** | WHO growth curves | Plotted at every visit |
| **Head circumference** | WHO growth curves | Birth to 5 years |
| **BMI-for-age** | WHO growth curves | 2-19 years |
| **Mid-upper arm circumference (MUAC)** | Colour-coded tape | 6 months - 5 years (malnutrition screening) |

**Z-score interpretation:**

| Z-score | Weight-for-age | Weight-for-height |
|---------|---------------|-------------------|
| > +3 | Very high weight | Obese |
| > +2 | High weight | Overweight |
| +2 to -2 | Normal | Normal |
| < -2 | **Underweight** | **Wasted** (acute malnutrition) |
| < -3 | **Severely underweight** | **Severely wasted** (severe acute malnutrition — REFER) |

> **EHR implication**: System must plot WHO growth curves automatically, calculate z-scores, generate visual growth charts for parent/caregiver counselling, and trigger alerts for z-scores below -2 (refer) or below -3 (emergency referral).

---

## PART C — INTEROPERABILITY REQUIREMENTS

---

### 15. DATA EXCHANGE REQUIREMENTS

**Authority**: NDoH Health Normative Standards Framework (HNSF, 2014, updated 2021); National Digital Health Strategy 2019-2024

#### 15.1 What Data Must an EHR Exchange?

| Data Type | Standard | Direction | Priority |
|-----------|----------|-----------|----------|
| **Referral letters** | HL7 FHIR ReferralRequest / ServiceRequest | Bi-directional | High |
| **Laboratory results** | HL7 v2.x (ORM/ORU) or FHIR DiagnosticReport | Inbound | High |
| **Radiology reports** | HL7 v2.x (ORU) or FHIR DiagnosticReport / ImagingStudy | Inbound | High |
| **Prescriptions** | HL7 FHIR MedicationRequest | Outbound to pharmacy | High |
| **Discharge summaries** | HL7 CDA (Clinical Document Architecture) or FHIR Composition | Bi-directional | High |
| **Claims / billing** | EDI (PHISC format) or HL7 FHIR Claim | Outbound to scheme/switch | High |
| **Patient demographics** | HL7 FHIR Patient / ADT messages | Bi-directional (via HPRS/MPI) | High |
| **Immunisation records** | HL7 FHIR Immunization | Bi-directional (EVDS, DHIS2) | Medium |
| **Allergy/adverse reaction** | HL7 FHIR AllergyIntolerance | Bi-directional | Medium |
| **Chronic disease registrations** | Custom + FHIR Condition | Outbound to scheme | Medium |
| **Notifiable conditions** | HL7 FHIR Communication / custom | Outbound to DoH/NICD | High |
| **Public health aggregates** | DHIS2 API / ADX format | Outbound | Medium |

#### 15.2 HNSF Standards Mandated

The HNSF specifies:

| Layer | Standard |
|-------|---------|
| **Content** | HL7 CDA r2, HL7 FHIR R4+ |
| **Messaging** | HL7 v2.x (legacy), HL7 FHIR messaging |
| **Terminology** | ICD-10 SA, SNOMED CT, LOINC (lab), NAPPI, CCSA/CPT |
| **Identifiers** | SA ID number (HPRS), HPCSA practice number, facility code |
| **Transport** | HTTPS/TLS 1.2+, REST API, SOAP (legacy) |
| **Security** | ATNA (Audit Trail and Node Authentication), IHE profiles |

---

### 16. LABORATORY RESULT IMPORT

**Authority**: HL7 v2.x messaging standard; SA lab provider specifications (NHLS, Ampath, Lancet, PathCare)

#### 16.1 HL7 v2 Message Structure for Lab Results

```
MSH — Message Header (sending lab, receiving EHR, timestamp)
PID — Patient Identification (name, ID number, DOB, gender)
PV1 — Patient Visit (encounter context)
ORC — Common Order (order control, order number)
OBR — Observation Request (test panel ordered, requesting doctor, specimen)
OBX — Observation/Result (individual result — one per analyte)
  OBX-2: Value type (NM=numeric, ST=string, TX=text, CE=coded)
  OBX-3: Test identifier (LOINC code recommended)
  OBX-4: Sub-ID
  OBX-5: Result value
  OBX-6: Units
  OBX-7: Reference range
  OBX-8: Abnormal flag (H=high, L=low, A=abnormal, N=normal, C=critical)
  OBX-11: Result status (F=final, P=preliminary, C=corrected)
NTE — Notes (free-text comments from pathologist)
```

#### 16.2 Structured Result Display

| Display Element | Source |
|----------------|--------|
| Test name | OBR-4 / OBX-3 |
| Result value | OBX-5 |
| Units | OBX-6 |
| Reference range | OBX-7 |
| Abnormal flag (with colour) | OBX-8 (red for critical/high, blue for low) |
| Status | OBX-11 (show "PRELIMINARY" prominently if not final) |
| Trending (graph) | Plot sequential OBX-5 values over time for the same OBX-3 |

#### 16.3 SA Lab Providers

| Provider | Sector | Integration Method |
|----------|--------|-------------------|
| **NHLS** (National Health Laboratory Service) | Public (80% of SA population) | HL7 v2, TrakCare LIS |
| **Ampath Laboratories** | Private | HL7 v2, web portal, API |
| **Lancet Laboratories** | Private | HL7 v2, web portal |
| **PathCare** | Private | HL7 v2, web portal |
| **Dis-Chem / Clicks** | Retail pharmacy | Limited integration |

> **EHR implication**: Must support HL7 v2 ORU message parsing, FHIR DiagnosticReport for modern integrations, result trending/graphing, critical value alerts, and acknowledgement workflows.

---

### 17. RADIOLOGY REPORT IMPORT

#### 17.1 Report Structure

| Section | Content |
|---------|---------|
| **Header** | Patient demographics, referring doctor, examination date |
| **Clinical indication** | Why the study was requested |
| **Technique** | Modality, contrast used, protocol |
| **Findings** | Detailed radiological observations |
| **Comparison** | With prior studies if available |
| **Impression/Conclusion** | Summary diagnosis, recommendations |
| **Critical findings** | Must be communicated verbally to referring doctor AND documented |

#### 17.2 Integration Standards

- **DICOM** (Digital Imaging and Communications in Medicine) for image exchange
- **HL7 v2 ORU** messages for report text
- **IHE XDS-I** (Cross-Enterprise Document Sharing for Imaging) profile for image sharing between facilities
- **FHIR ImagingStudy** + **DiagnosticReport** for modern integration
- **PACS integration** — EHR should link to PACS viewer for image display

---

### 18. DISCHARGE SUMMARY FORMAT AND CONTENT

**Authority**: HPCSA guidelines; HL7 CDA; NDoH standards

#### 18.1 Required Content

| Section | Content |
|---------|---------|
| **Patient demographics** | Full identification details |
| **Admission details** | Date, time, admitting doctor, admission diagnosis |
| **Discharge details** | Date, time, discharging doctor |
| **Principal diagnosis** | ICD-10 coded |
| **Secondary diagnoses** | ICD-10 coded — all comorbidities |
| **Procedures performed** | CCSA/CPT coded, dates, surgeons |
| **Summary of hospital course** | Key events, complications, response to treatment |
| **Significant findings** | Lab results, imaging, pathology |
| **Discharge medications** | Full list with dosage, frequency, duration |
| **Allergies** | Current allergy list |
| **Follow-up plan** | Appointments, referrals, investigations needed |
| **Patient education** | Instructions given, activity restrictions, diet |
| **Condition at discharge** | Stable / Improved / Unchanged / Deteriorated |
| **Functional status** | Mobility, self-care ability |
| **Advanced directives** | If applicable (DNR, living will) |

#### 18.2 Electronic Format

- **HL7 CDA r2** — structured XML document with human-readable and machine-processable sections
- **FHIR Composition** (type = discharge-summary) — for modern systems
- Must be **signed** by the discharging doctor
- Must be **transmitted** to the patient's GP/referring doctor within **48 hours** of discharge

---

### 19. CLINICAL DOCUMENT SHARING BETWEEN PROVIDERS

#### 19.1 Continuity of Care Requirements

| Scenario | Data to Share | Standard |
|----------|--------------|---------|
| **GP → Specialist referral** | Demographics, allergies, medications, problem list, relevant results, referral reason | FHIR DocumentReference / CDA |
| **Specialist → GP feedback** | Findings, diagnosis, treatment plan, follow-up plan | FHIR DocumentReference / CDA |
| **Hospital → GP discharge** | Full discharge summary (Section 18) | FHIR Composition / CDA |
| **Provider → Provider transfer** | Complete clinical summary | FHIR Bundle / CDA CCD |
| **Provider → NHI** | Subset defined by NHI data requirements (planned) | FHIR / HPRS API |
| **Provider → Scheme** | Claims data, chronic registrations, PMB motivations | EDI / FHIR Claim |

#### 19.2 Consent for Sharing

- **POPIA s27**: Health data may only be processed (shared) if:
  - Patient has given explicit consent, OR
  - It is necessary for medical treatment, OR
  - Required by law (notifiable conditions), OR
  - To protect the patient's vital interest (emergency)
- The EHR must record **which data was shared, with whom, when, and under what legal basis**

---

## PART D — SA-SPECIFIC EHR FEATURES

---

### 20. MULTI-LANGUAGE SUPPORT

**Authority**: Constitution s6; NHA s6(2); POPIA

South Africa has **11 official languages**:

| ISO 639-1 | Language | % Home Language |
|-----------|----------|----------------|
| zu | isiZulu | 25.3% |
| xh | isiXhosa | 14.8% |
| af | Afrikaans | 12.2% |
| en | English | 8.1% |
| nso | Sepedi (Northern Sotho) | 10.1% |
| st | Sesotho (Southern Sotho) | 7.9% |
| tn | Setswana | 8.9% |
| ss | siSwati | 2.8% |
| ts | Xitsonga | 3.6% |
| ve | Tshivenda | 2.5% |
| nr | isiNdebele | 1.6% |

#### 20.1 EHR Language Requirements

| Requirement | Detail |
|------------|--------|
| **UI language selection** | Minimum: English + isiZulu + isiXhosa + Afrikaans + Sepedi + Setswana (covers >79% of population) |
| **Patient-facing materials** | Consent forms, patient education, appointment reminders — in patient's preferred language |
| **Clinical documentation** | Practitioners may document in English (lingua franca of SA medicine) |
| **Interpreter flag** | System must record when an interpreter was used and the language pair |
| **Language preference** | Stored in patient demographics, used for appointment reminders, SMS, patient portal |

---

### 21. RURAL / LOW-CONNECTIVITY REQUIREMENTS

**Authority**: NDoH Digital Health Strategy; WHO recommendations for LMICs

#### 21.1 Offline-First Architecture

| Capability | Requirement |
|-----------|-------------|
| **Local data storage** | Patient records cached on device for offline access |
| **Offline data capture** | Full consultation, vitals, prescribing must work without connectivity |
| **Sync when connected** | Automatic background sync when connectivity is restored |
| **Conflict resolution** | Server-side merge with conflict detection and manual resolution for discrepancies |
| **Minimum bandwidth** | System must function on 2G/EDGE connections (optimise payload sizes) |
| **Progressive Web App (PWA)** | Preferred deployment model — works on any device with a browser |
| **SMS fallback** | Critical alerts (lab results, appointment reminders) must have SMS fallback |

#### 21.2 Infrastructure Realities

| Factor | SA Reality |
|--------|-----------|
| Broadband penetration | ~70% mobile, but rural coverage patchy |
| Load shedding | Power outages affect device charging and connectivity |
| Device availability | CHWs typically use basic Android smartphones |
| Data costs | Among the highest in Africa — system must minimise data usage |
| Literacy | Varies widely — UI must support low-literacy users (icons, visual cues) |

---

### 22. COMMUNITY HEALTH WORKER (CHW) DATA CAPTURE

**Authority**: NDoH Ward-Based Primary Health Care Outreach Team (WBPHCOT) Policy; 2018/19 Revised CHW Framework

#### 22.1 CHW Scope of Data Capture

| Data Domain | Tools |
|-------------|-------|
| **Household registration** | Head of household, members, address, GPS coordinates |
| **Vital events** | Births, deaths in community |
| **Screening** | TB symptoms, HIV risk, malnutrition (MUAC), hypertension, diabetes |
| **Referrals** | To PHC facility — must track if patient attended |
| **Adherence monitoring** | ART adherence, TB DOT, chronic medication compliance |
| **Health education** | Topics covered, materials distributed |
| **Maternal health** | Pregnant women identified, ANC attendance tracking |
| **Child health** | Growth monitoring, immunisation reminders, danger sign recognition |
| **Environmental health** | Water source, sanitation, household risk factors |

#### 22.2 Reporting Flow

```
CHW captures data (paper or mobile app)
  → Outreach Team Leader (OTL) consolidates daily/weekly
  → Data submitted to DHIS2 monthly
  → District/Provincial/National aggregation
```

#### 22.3 Digital Tools

- **CommCare** — widely used for CHW data capture in SA
- **DHIS2 Android Capture App** — direct capture to DHIS2
- **MomConnect** — maternal/child health registration via USSD/WhatsApp
- **Catch and Match** — pilot system linking CHW data to facility records
- **Custom offline-capable apps** — preferred for integrated EHR connection

---

### 23. HIV/TB INTEGRATED MANAGEMENT

**Authority**: NDoH; TIER.Net; PEPFAR MER indicators; WHO treatment guidelines

#### 23.1 TIER.Net Integration

TIER.Net (Three Interlinked Electronic Registers) is the national patient-level monitoring system for HIV and TB, developed by the University of Cape Town and managed by NDoH HMIS division.

| Component | Content |
|-----------|---------|
| **ART register** | Patient demographics, CD4, viral load, regimen, start date, outcomes |
| **Pre-ART register** | Patients diagnosed but not yet on treatment |
| **TB register** | TB diagnosis, category, treatment regimen, sputum results, outcomes |
| **Integration** | Single patient record linking HIV and TB data |

#### 23.2 EHR Requirements for HIV/TB

| Requirement | Detail |
|------------|--------|
| **ART regimen tracking** | Current regimen, line of treatment (1st/2nd/3rd), switch reasons |
| **Viral load monitoring** | Graph over time, flag unsuppressed (>50 copies/ml), trigger enhanced adherence |
| **CD4 monitoring** | Track over time (less critical with universal test-and-treat but still used) |
| **TB screening** | Automated symptom screening at every HIV visit (cough >2 weeks, weight loss, night sweats, fever) |
| **IPT tracking** | Isoniazid Preventive Therapy — start date, duration, completion |
| **Drug resistance** | Flag rifampicin resistance (GeneXpert result), MDR-TB, XDR-TB |
| **Outcome recording** | Alive on treatment, lost to follow-up, died, transferred out, stopped |
| **PEPFAR reporting** | MER indicator auto-calculation (TX_CURR, TX_NEW, VL suppression rate) |
| **Confidentiality** | HIV status is **special personal information** under POPIA — strict access controls |
| **DHIS2 aggregate export** | Monthly summaries for district/provincial reporting |

#### 23.3 TIER.Net Data Exchange

- TIER.Net is a **non-networked** facility-based system — data is consolidated via USB/email
- Modern EHR should provide **API-based data exchange** with TIER.Net or its successor
- NDoH is planning migration to **e-impilo** (web-based national EHR) — systems must be ready for this transition

---

### 24. MATERNAL HEALTH TRACKING

**Authority**: NDoH Guidelines for Maternity Care in SA; SA National Maternity Case Record (MCR); MomConnect

#### 24.1 Antenatal Card Data Elements

| Data | Detail |
|------|--------|
| **Booking visit** | Gestational age at booking, LMP, EDD |
| **Obstetric history** | Gravidity, parity, previous complications |
| **Risk assessment** | Age, parity, previous C/S, medical conditions, HIV status |
| **Antenatal visits** | Blood pressure, weight, fundal height, fetal heart rate, urine dipstick, oedema |
| **Investigations** | Hb, blood group, Rh factor, RPR (syphilis), HIV test, HBsAg, urine MCS |
| **Tetanus immunisation** | Status and doses given |
| **PMTCT** | ART regimen (if HIV+), viral load, infant prophylaxis plan |
| **Complications** | Pre-eclampsia, gestational diabetes, APH, PPROM |
| **Birth plan** | Planned place of delivery, mode of delivery |
| **Labour and delivery** | Mode, complications, APGAR scores, birth weight, feeding method |
| **Postnatal** | Maternal review at 6 hours, 6 days, 6 weeks; infant review |

#### 24.2 MomConnect Integration

- **MomConnect** is SA's national maternal health messaging platform (NDoH + Jembi + Praekelt)
- Registers pregnant women via USSD (*134*550# in public sector)
- Sends stage-based SMS/WhatsApp health messages throughout pregnancy and first year
- EHR should integrate with MomConnect for registration and messaging coordination

---

### 25. CHILD HEALTH TRACKING

**Authority**: Road to Health Booklet (RTH); NDoH Child Health Policy; WHO IMCI guidelines

#### 25.1 Road to Health Booklet — Digital Equivalent

The RTH booklet is the **universal child health record** in SA, issued at birth. An EHR must digitise all its components:

| Component | Content |
|-----------|---------|
| **Identification** | Name, DOB, birth facility, birth weight, APGAR, mother's details |
| **Growth monitoring** | Weight-for-age, length/height-for-age, weight-for-length/height, head circumference (see Section 14.2) |
| **Immunisation record** | Full EPI-SA schedule (see Section 13) |
| **Developmental milestones** | Gross motor, fine motor, language, social — by age |
| **Feeding** | Breastfeeding status, complementary feeding, nutritional supplements |
| **Vitamin A supplementation** | 6 months, 12 months, then 6-monthly to 5 years |
| **Deworming** | 12 months, then 6-monthly to 5 years |
| **PMTCT** | HIV-exposed infant follow-up, PCR results, infant prophylaxis |
| **Danger signs** | Visual reference for caregiver — digital equivalent needed |
| **Dental checks** | First visit, follow-up schedule |
| **Eye/hearing screening** | School entry screening |

#### 25.2 Road to Health App (RTHA)

- Digitised version of the RTH booklet — developed by NDoH
- Allows caregivers to track immunisations, growth, milestones
- EHR systems should integrate with or parallel the RTHA data model
- Data feeds into DHIS2 for national child health indicators

---

## PART E — SECURITY AND ACCESS CONTROL

---

### 26. ROLE-BASED ACCESS CONTROL (RBAC)

**Authority**: POPIA s19 (security safeguards); NHA; HPCSA guidelines

#### 26.1 Minimum Role Matrix

| Role | Demographics | Appointments | Clinical Notes | Prescriptions | Billing | Lab Results | Audit Logs |
|------|-------------|-------------|---------------|--------------|---------|-------------|-----------|
| **Doctor** | Read/Write | Read/Write | Read/Write | Read/Write | Read | Read/Write | Read (own) |
| **Specialist** | Read | Read (own patients) | Read/Write (own) | Read/Write (own) | Read | Read/Write (own) | Read (own) |
| **Nurse** | Read/Write | Read/Write | Read/Write (scoped) | Read (no prescribe unless APN) | Read | Read | Read (own) |
| **Pharmacist** | Read (limited) | No | Read (medication-relevant) | Read/Dispense | No | Read (relevant) | Read (own) |
| **Receptionist** | Read/Write (demographics only) | Read/Write | **No access** | **No access** | Read/Write | **No access** | No |
| **Billing clerk** | Read (name, scheme details) | Read | **No access** | Read (for coding) | Read/Write | **No access** | No |
| **Practice manager** | Read | Read/Write | Read (with audit) | Read (with audit) | Read/Write | Read | Read/Write |
| **System admin** | Read/Write | Read/Write | **No access** (technical only) | **No access** | Read | **No access** | Read/Write |
| **Patient (portal)** | Read (own) | Read/Write (own) | Read (own) | Read (own) | Read (own) | Read (own) | No |

#### 26.2 Access Control Principles

- **Least privilege** — users get minimum access needed for their role
- **Need-to-know** — clinical data only accessible when there is a treatment relationship
- **Segregation of duties** — billing staff cannot modify clinical records
- **Time-limited access** — temporary access grants expire automatically
- **Multi-factor authentication** — mandatory for clinical data access (POPIA s19)
- **Session timeout** — auto-lock after inactivity (recommended: 5-15 minutes)
- **IP/device restrictions** — optional additional layer

---

### 27. BREAK-THE-GLASS EMERGENCY ACCESS

**Authority**: POPIA s27(1)(d) — processing necessary to protect vital interest; NHA s7 — emergency treatment

#### 27.1 When Permitted

Break-the-glass (BTG) access is permitted when:
- A patient presents in a **life-threatening emergency**
- The treating practitioner does **not have normal access** to the patient's record
- Delay in accessing information could result in **harm to the patient**

#### 27.2 Implementation Requirements

| Requirement | Detail |
|------------|--------|
| **Explicit action** | User must click a clearly labelled "Emergency Access" button |
| **Mandatory reason** | User must enter a free-text reason before access is granted |
| **Time-limited** | Access expires after a defined period (e.g., 4 hours) |
| **Full audit** | Every BTG access is logged with user ID, patient ID, timestamp, reason, and data accessed |
| **Notification** | Patient's primary practitioner is notified of the BTG access |
| **Review** | All BTG events must be reviewed by a compliance officer within 48 hours |
| **No retrospective justification** | Reason must be entered BEFORE access is granted |
| **Scope limitation** | BTG should grant access to emergency-relevant data only (allergies, medications, conditions, recent results) — not full historical record |

---

### 28. AUDIT TRAIL REQUIREMENTS

**Authority**: POPIA s19; ECTA; HPCSA Booklet 9; NHA

#### 28.1 What Must Be Logged

| Event Type | Fields to Capture |
|-----------|------------------|
| **Record access** (view) | User ID, role, patient ID, timestamp, data viewed, access type (normal/BTG) |
| **Record creation** | User ID, patient ID, timestamp, data created |
| **Record modification** | User ID, patient ID, timestamp, field changed, old value, new value |
| **Record deletion** | User ID, patient ID, timestamp, data deleted (soft delete preferred), authorisation |
| **Prescription events** | Prescribed by, dispensed by, timestamp, medication details |
| **Consent events** | Consent given/withdrawn, by whom, timestamp, scope |
| **Data export/sharing** | User ID, recipient, timestamp, data shared, legal basis |
| **Login/logout** | User ID, timestamp, IP address, device, success/failure |
| **Failed access attempts** | User ID, timestamp, resource attempted, reason for denial |
| **BTG events** | All fields from Section 27.2 |
| **System configuration changes** | User ID, setting changed, old value, new value, timestamp |

#### 28.2 Audit Trail Properties

- **Immutable** — audit records cannot be modified or deleted (write-once storage)
- **Tamper-evident** — any modification attempt must be detectable (cryptographic hashing recommended)
- **Retained** — minimum **5 years** (align with POPIA data retention + litigation periods)
- **Searchable** — must support queries by user, patient, date range, event type
- **Reportable** — generate compliance reports for the Information Regulator on request

---

### 29. CLINICAL DATA DE-IDENTIFICATION FOR RESEARCH / AI TRAINING

**Authority**: POPIA s6(1)(e) (historical/research exemption); s1 (definition of de-identify); POPIA Compliance Framework for Research (ASSAf 2025)

#### 29.1 POPIA De-identification Standard

POPIA defines de-identified data as data that **"cannot be re-identified by any reasonably foreseeable method"**. This is more stringent than the GDPR anonymisation standard.

| Level | Method | POPIA Status |
|-------|--------|-------------|
| **Pseudonymisation** | Replace direct identifiers with pseudonyms; indirect identifiers intact | **Still personal information** — POPIA fully applies |
| **De-identification** | Remove ALL direct AND indirect identifiers; no reasonably foreseeable re-identification method exists | **POPIA does not apply** |
| **Aggregation** | Statistical summaries only, no individual records | **POPIA does not apply** (if group size sufficient) |

#### 29.2 Minimum De-identification Steps for Health Data

| Step | Action |
|------|--------|
| 1 | Remove: Name, ID number, passport number, contact details, address |
| 2 | Remove: Medical scheme number, practice number, facility name (if small) |
| 3 | Generalise: Date of birth → age range (e.g., 30-35); exact dates → year only |
| 4 | Generalise: Geographic data → province or district level only |
| 5 | Suppress: Rare conditions (fewer than 5 patients in dataset) |
| 6 | Suppress: Unique combinations of quasi-identifiers (age + gender + diagnosis + facility) |
| 7 | Assess: k-anonymity (each record indistinguishable from at least k-1 others; recommended k≥5) |
| 8 | Assess: Re-identification risk using expert determination |

#### 29.3 AI Training Data Requirements

| Requirement | Detail |
|------------|--------|
| **Ethics approval** | Required from a registered Research Ethics Committee (REC) before using clinical data for AI training |
| **POPIA compliance** | De-identification to POPIA standard, OR explicit consent, OR s27(1)(a) exemption for research |
| **Data use agreement** | Written agreement specifying purpose, retention, destruction, security measures |
| **No re-identification** | AI models must not be able to reconstruct patient identity from outputs |
| **Bias testing** | AI trained on clinical data must be tested for demographic bias before deployment |
| **SAHPRA** | If the AI constitutes a Software as Medical Device (SaMD), SAHPRA registration required (see `08_compliance.md`) |

---

### 30. CONSENT MANAGEMENT FOR DATA SHARING

**Authority**: POPIA s11, s18, s26, s27; NHA s14-s17; HPCSA Booklet 5

#### 30.1 Consent Types to Track

| Consent Type | Scope | Required For |
|-------------|-------|-------------|
| **Treatment consent** | Permission to treat | Every clinical encounter |
| **Data processing consent** | Permission to store and process health data | Registration (POPIA s11) |
| **Data sharing consent** | Permission to share with specific third parties | Referrals, second opinions, scheme claims |
| **Marketing consent** | Permission to send health-related marketing | Wellness programmes, scheme marketing |
| **Research consent** | Permission to use data for research | Clinical trials, registries, AI training |
| **Telemedicine consent** | Permission for remote consultation + data transmission | Telehealth encounters |

#### 30.2 Consent Data Model

| Field | Required? |
|-------|----------|
| Consent type | Yes |
| Patient ID | Yes |
| Date/time of consent | Yes |
| Method (written / verbal / digital) | Yes |
| Language of consent | Yes |
| Who obtained consent | Yes (practitioner ID) |
| Scope of consent | Yes (what data, which recipients) |
| Duration / expiry | Yes |
| Right to withdraw | Yes (must be explained) |
| Withdrawal date (if withdrawn) | As applicable |
| Version of consent form | Yes |
| Digital signature / checkbox + timestamp | Yes (for digital) |

#### 30.3 Withdrawal of Consent

- Patient may withdraw consent **at any time** (POPIA s11(2)(b))
- System must **stop processing** within a reasonable period after withdrawal
- **Cannot withdraw** for data already lawfully shared or required by law
- Withdrawal must be **logged** with timestamp and scope
- Previously shared data cannot be "un-shared" — but further sharing must stop

---

## PART F — IMPLEMENTATION CHECKLIST FOR VISIOCORP EHR SYSTEMS

### Compliance Readiness Matrix

| # | Requirement | HealthOps | Netcare Health OS | Priority |
|---|------------|-----------|-------------------|----------|
| 1 | HPCSA Booklet 9 record contents (all 18 elements) | Verify | Verify | P0 |
| 2 | Record retention enforcement (6yr / minor / 40yr OHS) | Build | Build | P1 |
| 3 | Informed consent capture + versioning | Partial | Partial | P1 |
| 4 | Referral letter generation + tracking | Build | Build | P1 |
| 5 | Sick certificate generation (Rule 16 compliant) | Build | Build | P2 |
| 6 | Prescription generation (Reg 34 compliant) | Partial | Partial | P1 |
| 7 | Pathology request form generation | Build | Build | P2 |
| 8 | Patient demographics (HPRS-aligned) | Partial | Partial | P1 |
| 9 | ICD-10 auto-suggest from clinical notes | Build | Build | P1 |
| 10 | Allergy recording (SNOMED CT model) | Partial | Partial | P1 |
| 11 | Medication list + DUR 6-check engine | Partial | Partial | P0 |
| 12 | Problem list management with PMB flagging | Build | Build | P1 |
| 13 | Immunisation tracking (EPI-SA schedule) | Build | Build | P2 |
| 14 | Growth charts / vitals (WHO z-scores) | Build | Build | P2 |
| 15 | HL7 v2 lab result import | Partial (FHIR) | Partial | P1 |
| 16 | Radiology report import | Build | Build | P2 |
| 17 | Discharge summary generation | Build | Build | P2 |
| 18 | Multi-language UI (6 priority languages) | Build | Build | P2 |
| 19 | Offline-first capability | Build | Build | P1 (rural) |
| 20 | CHW data capture tools | Build | Build | P2 |
| 21 | TIER.Net / HIV-TB integration | Build | Build | P1 |
| 22 | Maternal health tracking (MCR) | Build | Build | P2 |
| 23 | Child health tracking (RTH) | Build | Build | P2 |
| 24 | RBAC (minimum role matrix) | Partial | Partial | P0 |
| 25 | Break-the-glass emergency access | Build | Build | P1 |
| 26 | Audit trail (immutable, searchable) | Partial | Partial | P0 |
| 27 | De-identification pipeline for research/AI | Build | Build | P2 |
| 28 | Consent management system | Partial | Partial | P1 |

---

## SOURCES AND REFERENCES

### Legislation
- Medical Schemes Act 131 of 1998 (especially s59)
- Medicines and Related Substances Act 101 of 1965 (General Regulations 2017)
- Protection of Personal Information Act 4 of 2013 (POPIA)
- National Health Act 61 of 2003 (s6-s8 informed consent, s14-s17 confidentiality)
- Basic Conditions of Employment Act 75 of 1997 (s23 sick leave)
- Electronic Communications and Transactions Act 25 of 2002 (ECTA)
- Children's Act 38 of 2005 (s129 consent by children)
- Sterilisation Act 44 of 1998

### HPCSA Guidelines
- Booklet 1: Guidelines for Good Practice (Dec 2021)
- Booklet 4: Seeking Patients' Informed Consent (Dec 2021)
- Booklet 5: Confidentiality — Protecting and Providing Information (Dec 2021)
- Booklet 9: Guidelines on the Keeping of Patient Records (Nov 2022)

### Standards Frameworks
- National Health Normative Standards Framework for Interoperability in eHealth (HNSF, 2014/2021)
- National Digital Health Strategy for South Africa 2019-2024
- SA ICD-10 Coding Standards v3 (NTT for ICD-10 Implementation)
- HL7 v2.x, HL7 FHIR R4, HL7 CDA r2
- SNOMED CT Implementation Guide for Allergy
- WHO Growth Standards (child growth curves)
- DICOM (imaging), IHE profiles (cross-enterprise sharing)

### Clinical Guidelines
- EPI-SA Revised Childhood Immunisation Schedule (January 2025)
- Guidelines for Maternity Care in South Africa (NDoH)
- SA National Maternity Case Record (MCR v6, August 2020)
- TIER.Net system documentation (UCT / NDoH HMIS)
- Road to Health Booklet and RTHA app

### Industry Resources
- Medical Protection Society (MPS) — Medical Records in South Africa
- CMS CMScript 10/2024 — Coding and Funding of Claims
- SAPC Good Pharmacy Practice Rules
- ASSAf POPIA Compliance Framework for Research (2025)
- Jembi Health Systems — Digital Road to Health Project, MomConnect

---

*Last updated: 2026-03-21 | VisioCorp Health Intelligence KB*
*Cross-references: 01_law_and_regulation.md (POPIA, NHA), 03_coding_standards.md (ICD-10, CCSA), 04_pmb_and_cdl.md (PMB/CDL), 06_pharmaceutical.md (DUR engine, NAPPI), 08_compliance.md (SAHPRA SaMD, POPIA checklist)*
