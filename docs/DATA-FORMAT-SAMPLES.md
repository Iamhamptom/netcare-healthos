# Netcare Health OS — Data Format Reference

**Version**: 1.0.0 | **Last Updated**: 2026-03-20
**Classification**: Internal — CEO Training / Staff Onboarding / Demo Preparation
**Author**: Visio Workspace Engineering

> This document contains annotated, line-by-line samples of every data format that
> Netcare Health OS ingests, transforms, and produces. Each sample uses realistic
> South African healthcare data so you can read it like a real production message.

---

## Table of Contents

1. [HL7v2 ADT^A01 — Patient Admission](#1-hl7v2-adta01--patient-admission)
2. [HL7v2 ORU^R01 — Lab Results](#2-hl7v2-orur01--lab-results)
3. [HL7v2 ORM^O01 — Clinical Orders](#3-hl7v2-ormo01--clinical-orders)
4. [FHIR R4 Patient Resource (JSON)](#4-fhir-r4-patient-resource-json)
5. [FHIR R4 Observation — Blood Pressure](#5-fhir-r4-observation--blood-pressure)
6. [EDIFACT MEDCLM — Medical Claim](#6-edifact-medclm--medical-claim)
7. [eRA XML — Electronic Remittance Advice](#7-era-xml--electronic-remittance-advice)
8. [PHISC XML — Pre-Authorization Request](#8-phisc-xml--pre-authorization-request)
9. [ICD-10-ZA Code Entries](#9-icd-10-za-code-entries)
10. [NAPPI Code Entries](#10-nappi-code-entries)
11. [Top 15 Rejection Codes](#11-top-15-rejection-codes)
12. [Claim Lifecycle Diagram](#12-claim-lifecycle-diagram)

---

## 1. HL7v2 ADT^A01 — Patient Admission

**What is it?** ADT = Admit/Discharge/Transfer. The A01 trigger means "a patient has been
admitted." Every hospital system sends this when a patient is registered on a ward. It is the
foundational message — without it, nothing else (billing, labs, pharmacy) can reference the
patient's visit.

**When you see it**: The moment a patient is admitted — reception scans their ID, the PAS
(Patient Administration System) fires an ADT^A01 to every connected system.

```
MSH|^~\&|MILPARK_PAS|NETCARE_JHB|HEALTHOS|VISIO|20260320091500||ADT^A01^ADT_A01|MSG00001|P|2.4|||AL|NE||UTF-8
```

| Position | Field | Value | Meaning |
|----------|-------|-------|---------|
| MSH-1 | Field Separator | `\|` | The pipe character separates every field in HL7v2 |
| MSH-2 | Encoding Characters | `^~\&` | Sub-component (`^`), repetition (`~`), escape (`\`), sub-sub (`&`) |
| MSH-3 | Sending Application | `MILPARK_PAS` | The Patient Admin System at Milpark Hospital sent this |
| MSH-4 | Sending Facility | `NETCARE_JHB` | Netcare Johannesburg region identifier |
| MSH-5 | Receiving Application | `HEALTHOS` | Our system — the intended recipient |
| MSH-6 | Receiving Facility | `VISIO` | Our organisation identifier |
| MSH-7 | Date/Time of Message | `20260320091500` | 2026-03-20 at 09:15:00 (YYYYMMDDHHMMSS) |
| MSH-9 | Message Type | `ADT^A01^ADT_A01` | Message type = ADT, trigger = A01, structure = ADT_A01 |
| MSH-10 | Message Control ID | `MSG00001` | Unique ID for this message — used for acknowledgements |
| MSH-11 | Processing ID | `P` | P = Production (T = Training, D = Debugging) |
| MSH-12 | Version ID | `2.4` | HL7 version 2.4 — the standard in SA hospitals |
| MSH-15 | Accept Ack Type | `AL` | Always send an acknowledgement |
| MSH-16 | Application Ack Type | `NE` | Never send application-level ack |
| MSH-18 | Character Set | `UTF-8` | Supports South African names with diacritics |

```
EVN|A01|20260320091500|||DRPATEL^Patel^Ravi^^^Dr||NETCARE_JHB
```

| Position | Field | Value | Meaning |
|----------|-------|-------|---------|
| EVN-1 | Event Type Code | `A01` | Admission event |
| EVN-2 | Recorded Date/Time | `20260320091500` | When the event was recorded in the PAS |
| EVN-5 | Operator ID | `DRPATEL^Patel^Ravi^^^Dr` | Dr Ravi Patel triggered the admission |
| EVN-7 | Event Facility | `NETCARE_JHB` | Where the event occurred |

```
PID|1||PAT445566^^^MILPARK_MRN^MR~8501015800085^^^ZA_ID^NI||Mthembu^Sipho^Thabo^^Mr||19850101|M|||42 Vilakazi Street^^Soweto^GP^1804^ZA||+27825551234^PRN~+27115559876^WPN||ZU|M|CHR|||8501015800085||||Soweto|||||Y
```

| Position | Field | Value | Meaning |
|----------|-------|-------|---------|
| PID-1 | Set ID | `1` | First (and usually only) PID segment |
| PID-3 | Patient Identifier List | `PAT445566^^^MILPARK_MRN^MR` | Hospital MRN (Medical Record Number) at Milpark = PAT445566 |
| | (repeated) | `8501015800085^^^ZA_ID^NI` | SA National ID number — 8501015800085 (male, born 1985-01-01) |
| PID-5 | Patient Name | `Mthembu^Sipho^Thabo^^Mr` | Family^Given^Middle^^Prefix — Mr Sipho Thabo Mthembu |
| PID-7 | Date of Birth | `19850101` | 1 January 1985 |
| PID-8 | Sex | `M` | Male |
| PID-11 | Address | `42 Vilakazi Street^^Soweto^GP^1804^ZA` | Street^^City^Province^PostalCode^Country |
| PID-13 | Phone (Home) | `+27825551234^PRN` | PRN = Primary Residence Number (mobile) |
| | (repeated) | `+27115559876^WPN` | WPN = Work Phone Number |
| PID-15 | Primary Language | `ZU` | isiZulu (ISO 639-1) |
| PID-16 | Marital Status | `M` | Married |
| PID-17 | Religion | `CHR` | Christian |
| PID-19 | SSN / National ID | `8501015800085` | SA ID repeated here for legacy system compat |
| PID-23 | Birth Place | `Soweto` | Place of birth |
| PID-30 | Patient Death Indicator | `Y` — NOT SET | Would be Y if deceased (blank = alive) |

```
PD1||||DRPATEL^Patel^Ravi^^^Dr^^MPSA^L^^^MP0512345|||||||N
```

| Position | Field | Value | Meaning |
|----------|-------|-------|---------|
| PD1-4 | Patient Primary Care Provider | `DRPATEL^Patel^Ravi^^^Dr^^MPSA^L^^^MP0512345` | Dr Ravi Patel, HPCSA practice number MP0512345, registered with MPSA (Medical Protection Society) |
| PD1-12 | Protection Indicator | `N` | No special protections on this record |

```
NK1|1|Mthembu^Nomsa^^^Mrs|SPO^Spouse|42 Vilakazi Street^^Soweto^GP^1804^ZA|+27825559999||EC
```

| Position | Field | Value | Meaning |
|----------|-------|-------|---------|
| NK1-1 | Set ID | `1` | First next-of-kin entry |
| NK1-2 | Name | `Mthembu^Nomsa^^^Mrs` | Mrs Nomsa Mthembu |
| NK1-3 | Relationship | `SPO^Spouse` | Spouse |
| NK1-4 | Address | Same as patient | Lives at same address |
| NK1-5 | Phone | `+27825559999` | Contact number |
| NK1-7 | Contact Role | `EC` | Emergency Contact |

```
PV1|1|I|SURG^WARD4^BED12^MILPARK||||DRPATEL^Patel^Ravi^^^Dr^^MPSA|||SUR||||A|||DRPATEL^Patel^Ravi^^^Dr^^MPSA|IN||DH^Discovery Health||||||||||||||||||MILPARK|||A|||20260320091500
```

| Position | Field | Value | Meaning |
|----------|-------|-------|---------|
| PV1-1 | Set ID | `1` | First visit segment |
| PV1-2 | Patient Class | `I` | I = Inpatient (O = Outpatient, E = Emergency) |
| PV1-3 | Assigned Patient Location | `SURG^WARD4^BED12^MILPARK` | Surgery department, Ward 4, Bed 12, Milpark Hospital |
| PV1-7 | Attending Doctor | `DRPATEL^Patel^Ravi^^^Dr^^MPSA` | Dr Patel is the attending physician |
| PV1-10 | Hospital Service | `SUR` | Surgery service |
| PV1-14 | Admit Source | `A` | A = Accident/Emergency referral |
| PV1-17 | Admitting Doctor | `DRPATEL^Patel^Ravi^^^Dr^^MPSA` | Same as attending (common) |
| PV1-18 | Patient Type | `IN` | Inpatient |
| PV1-20 | Financial Class | `DH^Discovery Health` | Patient's medical aid — Discovery Health |
| PV1-39 | Servicing Facility | `MILPARK` | Netcare Milpark Hospital |
| PV1-41 | Account Status | `A` | Active admission |
| PV1-44 | Admit Date/Time | `20260320091500` | Admitted 2026-03-20 at 09:15 |

```
IN1|1|DH001^Discovery Health Executive|600001234|Discovery Health Medical Scheme||PO Box 786722^^Sandton^^2146^ZA|+27860998877||GRP001|||20260101|20261231|||Mthembu^Sipho^Thabo|SEL|19850101|42 Vilakazi Street^^Soweto^GP^1804^ZA|||1|||Y||||||||||1234567890||||||M
```

| Position | Field | Value | Meaning |
|----------|-------|-------|---------|
| IN1-1 | Set ID | `1` | Primary insurance |
| IN1-2 | Insurance Plan ID | `DH001^Discovery Health Executive` | Discovery Health Executive plan |
| IN1-3 | Insurance Company ID | `600001234` | Discovery's BHF (Board of Healthcare Funders) registration |
| IN1-4 | Insurance Company Name | `Discovery Health Medical Scheme` | Scheme name as registered with CMS |
| IN1-12 | Plan Effective Date | `20260101` | Cover starts 1 Jan 2026 |
| IN1-13 | Plan Expiration Date | `20261231` | Cover ends 31 Dec 2026 |
| IN1-16 | Insured's Name | `Mthembu^Sipho^Thabo` | The member (self) |
| IN1-17 | Insured's Relationship | `SEL` | Self — he is the principal member |
| IN1-36 | Policy Number | `1234567890` | Discovery membership number |
| IN1-47 | Insured's Sex | `M` | Male |

```
DG1|1||K35.80^Acute appendicitis, unspecified^I10-ZA||20260320||A|||DRPATEL^Patel^Ravi^^^Dr
```

| Position | Field | Value | Meaning |
|----------|-------|-------|---------|
| DG1-1 | Set ID | `1` | First diagnosis |
| DG1-3 | Diagnosis Code | `K35.80^Acute appendicitis, unspecified^I10-ZA` | ICD-10-ZA code K35.80 — appendicitis |
| DG1-5 | Diagnosis Date/Time | `20260320` | Diagnosed today |
| DG1-6 | Diagnosis Type | `A` | A = Admitting diagnosis |
| DG1-16 | Diagnosing Clinician | `DRPATEL^Patel^Ravi^^^Dr` | Dr Patel made the diagnosis |

```
PR1|1||0718^Appendectomy, laparoscopic^NHRPL||20260320101500|S||||||DRPATEL^Patel^Ravi^^^Dr
```

| Position | Field | Value | Meaning |
|----------|-------|-------|---------|
| PR1-1 | Set ID | `1` | First procedure |
| PR1-3 | Procedure Code | `0718^Appendectomy, laparoscopic^NHRPL` | NHRPL tariff code 0718 — laparoscopic appendectomy |
| PR1-5 | Procedure Date/Time | `20260320101500` | Scheduled for 10:15 today |
| PR1-6 | Procedure Functional Type | `S` | S = Surgical |
| PR1-12 | Procedure Practitioner | `DRPATEL^Patel^Ravi^^^Dr` | Surgeon |

> **What to say in a meeting**: "When a patient is admitted at any Netcare facility,
> the PAS fires an ADT^A01 message. Our system receives this in real time, parses
> the SA ID number, verifies Discovery membership, and creates the encounter record
> in under 200 milliseconds. Every downstream process — billing, lab orders, pharmacy
> — hangs off this single admission event."

---

## 2. HL7v2 ORU^R01 — Lab Results

**What is it?** ORU = Observation Result Unsolicited. R01 = the lab is pushing results
to us without being asked. This is how every blood test, urine test, and pathology
result arrives from NHLS or private labs like Lancet, Ampath, or PathCare.

**When you see it**: 2-24 hours after a specimen is collected, the lab system sends
this message with the actual numerical results and flags.

```
MSH|^~\&|LANCET_LIS|LANCET_JHB|HEALTHOS|VISIO|20260320143000||ORU^R01^ORU_R01|LAB20260320001|P|2.4|||AL|NE||UTF-8
```

| Field | Value | Meaning |
|-------|-------|---------|
| MSH-3 | `LANCET_LIS` | Lancet Laboratories' Laboratory Information System |
| MSH-4 | `LANCET_JHB` | Lancet Johannesburg branch |
| MSH-9 | `ORU^R01^ORU_R01` | Unsolicited lab result message |
| MSH-10 | `LAB20260320001` | Unique lab message ID — use this to deduplicate |

```
PID|1||PAT445566^^^MILPARK_MRN^MR~8501015800085^^^ZA_ID^NI||Mthembu^Sipho^Thabo^^Mr||19850101|M|||42 Vilakazi Street^^Soweto^GP^1804^ZA
```

*(Same PID as the admission — linked by MRN PAT445566 and SA ID.)*

```
ORC|RE|ORD20260320A|LAB20260320001||CM||||20260320080000|||DRPATEL^Patel^Ravi^^^Dr
```

| Field | Value | Meaning |
|-------|-------|---------|
| ORC-1 | `RE` | Order control = Results (observations being returned) |
| ORC-2 | `ORD20260320A` | Placer order number (what the hospital called this order) |
| ORC-3 | `LAB20260320001` | Filler order number (what the lab calls this order) |
| ORC-5 | `CM` | Order status = Completed |
| ORC-9 | `20260320080000` | When the order was completed at the lab |
| ORC-12 | `DRPATEL^Patel^Ravi^^^Dr` | Ordering physician |

```
OBR|1|ORD20260320A|LAB20260320001|DIABPANEL^Diabetes Panel^L|||20260320070000|||||||||DRPATEL^Patel^Ravi^^^Dr||||||20260320143000|||F
```

| Field | Value | Meaning |
|-------|-------|---------|
| OBR-1 | `1` | First observation request |
| OBR-4 | `DIABPANEL^Diabetes Panel^L` | The test battery ordered — a diabetes screening panel |
| OBR-7 | `20260320070000` | Specimen collected at 07:00 |
| OBR-22 | `20260320143000` | Results reported at 14:30 |
| OBR-25 | `F` | Result status: F = Final (P = Preliminary, C = Corrected) |

```
OBX|1|NM|4548-4^HbA1c^LN||8.2|%|4.0-5.6|HH|||F|||20260320140000||LANCET_AUTO
```

| Field | Value | Meaning |
|-------|-------|---------|
| OBX-1 | `1` | First observation result in this set |
| OBX-2 | `NM` | Value type = Numeric |
| OBX-3 | `4548-4^HbA1c^LN` | LOINC code 4548-4 = Hemoglobin A1c (glycated hemoglobin) |
| OBX-5 | `8.2` | **THE RESULT: 8.2%** |
| OBX-6 | `%` | Unit = percentage |
| OBX-7 | `4.0-5.6` | Reference range — normal is 4.0% to 5.6% |
| OBX-8 | `HH` | **Abnormal flag: HH = Critically High** (H = High, L = Low, LL = Critically Low, N = Normal) |
| OBX-11 | `F` | Observation result status = Final |
| OBX-14 | `20260320140000` | When this observation was made |
| OBX-16 | `LANCET_AUTO` | Responsible observer — automated analyser |

> **Clinical note**: HbA1c of 8.2% indicates poorly controlled diabetes. Target is below 7% for
> most diabetics. This patient needs medication adjustment.

```
OBX|2|NM|2345-7^Glucose^LN||12.4|mmol/L|3.9-5.8|HH|||F|||20260320140000||LANCET_AUTO
```

| Field | Value | Meaning |
|-------|-------|---------|
| OBX-3 | `2345-7^Glucose^LN` | LOINC 2345-7 = Glucose (fasting) |
| OBX-5 | `12.4` | **12.4 mmol/L — more than double the upper normal limit** |
| OBX-7 | `3.9-5.8` | Normal fasting glucose range |
| OBX-8 | `HH` | Critically high |

```
OBX|3|NM|2093-3^Cholesterol Total^LN||6.8|mmol/L|<5.0|H|||F|||20260320140000||LANCET_AUTO
```

| Field | Value | Meaning |
|-------|-------|---------|
| OBX-3 | `2093-3^Cholesterol Total^LN` | LOINC 2093-3 = Total Cholesterol |
| OBX-5 | `6.8` | **6.8 mmol/L — elevated** |
| OBX-7 | `<5.0` | Desirable level is below 5.0 |
| OBX-8 | `H` | Abnormal high (not critically high, just high) |

```
OBX|4|NM|2085-9^HDL Cholesterol^LN||0.9|mmol/L|>1.0|L|||F|||20260320140000||LANCET_AUTO
```

| Field | Value | Meaning |
|-------|-------|---------|
| OBX-3 | `2085-9^HDL Cholesterol^LN` | LOINC 2085-9 = HDL ("good") Cholesterol |
| OBX-5 | `0.9` | **0.9 mmol/L — low** (you want this number HIGH) |
| OBX-7 | `>1.0` | Should be above 1.0 |
| OBX-8 | `L` | Abnormal low |

```
OBX|5|NM|2089-1^LDL Cholesterol^LN||4.2|mmol/L|<3.0|H|||F|||20260320140000||LANCET_AUTO
```

| Field | Value | Meaning |
|-------|-------|---------|
| OBX-3 | `2089-1^LDL Cholesterol^LN` | LOINC 2089-1 = LDL ("bad") Cholesterol |
| OBX-5 | `4.2` | **4.2 mmol/L — elevated** (you want this LOW) |
| OBX-7 | `<3.0` | Desirable below 3.0 |
| OBX-8 | `H` | Abnormal high |

```
OBX|6|NM|2571-8^Triglycerides^LN||3.5|mmol/L|<1.7|H|||F|||20260320140000||LANCET_AUTO
```

| Field | Value | Meaning |
|-------|-------|---------|
| OBX-3 | `2571-8^Triglycerides^LN` | LOINC 2571-8 = Triglycerides |
| OBX-5 | `3.5` | **3.5 mmol/L — double the limit** |
| OBX-7 | `<1.7` | Normal below 1.7 |
| OBX-8 | `H` | Abnormal high |

> **What to say in a meeting**: "Lab results arrive as HL7v2 ORU messages, typically
> from Lancet, Ampath, or PathCare. Each result line includes a LOINC code — that's
> the universal lab code — the actual value, the reference range, and a flag telling
> us if it's normal, high, or critically high. Our system parses these in real time,
> flags critical values for the clinician, and stores them as FHIR Observations for
> longitudinal trending."

---

## 3. HL7v2 ORM^O01 — Clinical Orders

**What is it?** ORM = Order Message. O01 = a new order has been placed. This is how
a doctor at Christiaan Barnard Memorial Hospital orders a CT Brain scan. The order
flows from the HIS (Hospital Information System) to the Radiology Information System.

```
MSH|^~\&|CBMH_HIS|NETCARE_CPT|HEALTHOS|VISIO|20260320110000||ORM^O01^ORM_O01|ORD20260320B|P|2.4|||AL|NE||UTF-8
```

| Field | Value | Meaning |
|-------|-------|---------|
| MSH-3 | `CBMH_HIS` | Christiaan Barnard Memorial Hospital — Hospital Information System |
| MSH-4 | `NETCARE_CPT` | Netcare Cape Town region |
| MSH-9 | `ORM^O01^ORM_O01` | New order message |

```
PID|1||PAT778899^^^CBMH_MRN^MR~7209185200089^^^ZA_ID^NI||Jacobs^Pieter^Johannes^^Mr||19720918|M|||15 Kloof Street^^Gardens^WC^8001^ZA||+27214441234^PRN||AF|S||||7209185200089||||Cape Town
```

| Field | Value | Meaning |
|-------|-------|---------|
| PID-3 | `PAT778899^^^CBMH_MRN^MR` | Christiaan Barnard MRN |
| PID-3 (rep) | `7209185200089^^^ZA_ID^NI` | SA ID — male born 18 Sep 1972 |
| PID-5 | `Jacobs^Pieter^Johannes^^Mr` | Mr Pieter Johannes Jacobs |
| PID-15 | `AF` | Afrikaans |

```
PV1|1|E|EMER^MAIN^BAY3^CBMH||||DRVDMERWE^Van der Merwe^Anita^^^Dr^^MPSA|||EMR||||7|||DRVDMERWE^Van der Merwe^Anita^^^Dr^^MPSA|EM||MH^Medscheme Holdings||||||||||||||||||CBMH|||A|||20260320103000
```

| Field | Value | Meaning |
|-------|-------|---------|
| PV1-2 | `E` | Patient class = Emergency |
| PV1-3 | `EMER^MAIN^BAY3^CBMH` | Emergency department, Main area, Bay 3 |
| PV1-7 | `DRVDMERWE^Van der Merwe^Anita^^^Dr` | Dr Anita van der Merwe — attending |
| PV1-10 | `EMR` | Emergency service |
| PV1-18 | `EM` | Emergency patient type |
| PV1-20 | `MH^Medscheme Holdings` | Medical aid administrator |

```
ORC|NW|ORD20260320B||CBMH_RAD001|IP||||20260320110000|||DRVDMERWE^Van der Merwe^Anita^^^Dr||+27214441000^WPN|||||CBMH^Christiaan Barnard Memorial Hospital
```

| Field | Value | Meaning |
|-------|-------|---------|
| ORC-1 | `NW` | **NW = New Order** (other values: CA = Cancel, SC = Status Changed, XO = Change) |
| ORC-2 | `ORD20260320B` | Placer order number from the ordering system |
| ORC-5 | `IP` | Order status = In Progress |
| ORC-12 | `DRVDMERWE^Van der Merwe^Anita^^^Dr` | Who placed the order |
| ORC-21 | `CBMH^Christiaan Barnard Memorial Hospital` | Ordering facility |

```
OBR|1|ORD20260320B||70551^CT Brain without contrast^NHRPL|||20260320110000||||STAT|||||DRVDMERWE^Van der Merwe^Anita^^^Dr||||||20260320||RAD|IP||^^^20260320113000^^STAT||||R5091^Severe headache with neurological deficit^I10-ZA~G43.909^Migraine, unspecified^I10-ZA
```

| Field | Value | Meaning |
|-------|-------|---------|
| OBR-4 | `70551^CT Brain without contrast^NHRPL` | The actual order — NHRPL tariff 70551 = CT Brain (non-contrast) |
| OBR-7 | `20260320110000` | Requested at 11:00 |
| OBR-12 | `STAT` | **Priority = STAT (urgent)** — other values: R = Routine, A = ASAP |
| OBR-25 | `IP` | Status = In Progress |
| OBR-27 | `^^^20260320113000^^STAT` | Timing — scheduled for 11:30, STAT priority |
| OBR-31 | `R5091^Severe headache with neurological deficit^I10-ZA` | Clinical reason for the order |
| | `~G43.909^Migraine, unspecified^I10-ZA` | Differential diagnosis (second reason) |

> **What to say in a meeting**: "When a doctor orders a scan or test, an ORM message
> fires immediately. The key is the OBR segment — it carries the exact procedure code,
> the clinical reason, and the urgency. STAT orders trigger alerts in our system within
> seconds. This is how we track turnaround times and ensure nothing falls through the cracks."

---

## 4. FHIR R4 Patient Resource (JSON)

**What is it?** FHIR (Fast Healthcare Interoperability Resources, pronounced "fire") is the
modern replacement for HL7v2. Instead of pipe-delimited text, it uses JSON. This is
the same Sipho Mthembu from the ADT^A01 above, now represented as a FHIR Patient resource.

**Why it matters**: FHIR is mandatory for NHI (National Health Insurance) integration in
South Africa. Every new system must speak FHIR.

```json
{
  // The type of resource — FHIR has ~150 resource types (Patient, Observation, etc.)
  "resourceType": "Patient",

  // Server-assigned unique ID — used in all references to this patient
  "id": "pat-445566-milpark",

  // Metadata about this record
  "meta": {
    // Every time this record is updated, the version increments
    "versionId": "3",
    // When this version was last updated (ISO 8601 with timezone)
    "lastUpdated": "2026-03-20T09:15:00+02:00",
    // FHIR profiles this resource conforms to — this is the SA national patient profile
    "profile": [
      "http://fhir.health.gov.za/StructureDefinition/sa-patient"
    ]
  },

  // Human-readable summary — always present for safety
  "text": {
    "status": "generated",
    "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Sipho Thabo Mthembu, Male, DOB 1985-01-01, SA ID 8501015800085</div>"
  },

  // All known identifiers for this patient
  "identifier": [
    {
      // SA National ID — the primary identifier in South Africa
      "use": "official",
      "type": {
        "coding": [
          {
            // This code means "National unique individual identifier"
            "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
            "code": "NI",
            "display": "National unique individual identifier"
          }
        ]
      },
      // The namespace for SA ID numbers
      "system": "http://fhir.health.gov.za/identifier/sa-id",
      // The actual SA ID number — 13 digits, encodes DOB + gender + citizenship
      "value": "8501015800085"
    },
    {
      // Hospital MRN — specific to Milpark
      "use": "usual",
      "type": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
            "code": "MR",
            "display": "Medical record number"
          }
        ]
      },
      "system": "http://netcare.co.za/identifier/mrn/milpark",
      "value": "PAT445566"
    },
    {
      // Discovery Health membership number
      "use": "secondary",
      "type": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
            "code": "MB",
            "display": "Member Number"
          }
        ]
      },
      "system": "http://discovery.co.za/identifier/membership",
      "value": "1234567890",
      // The assigner is Discovery Health Medical Scheme
      "assigner": {
        "display": "Discovery Health Medical Scheme"
      }
    }
  ],

  // Whether this patient record is active (true) or merged/inactive (false)
  "active": true,

  // Patient name — FHIR supports multiple names (maiden, nickname, etc.)
  "name": [
    {
      "use": "official",
      "family": "Mthembu",
      "given": ["Sipho", "Thabo"],
      "prefix": ["Mr"]
    }
  ],

  // Telecom — all contact points
  "telecom": [
    {
      "system": "phone",
      "value": "+27825551234",
      "use": "mobile",
      // Rank 1 = preferred contact method
      "rank": 1
    },
    {
      "system": "phone",
      "value": "+27115559876",
      "use": "work",
      "rank": 2
    }
  ],

  // Administrative gender (not clinical sex)
  "gender": "male",

  // Date of birth in ISO format
  "birthDate": "1985-01-01",

  // Not deceased
  "deceasedBoolean": false,

  // Physical address
  "address": [
    {
      "use": "home",
      "type": "physical",
      "line": ["42 Vilakazi Street"],
      "city": "Soweto",
      // SA province — GP = Gauteng Province
      "state": "GP",
      "postalCode": "1804",
      "country": "ZA"
    }
  ],

  // Marital status — coded concept
  "maritalStatus": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/v3-MaritalStatus",
        "code": "M",
        "display": "Married"
      }
    ]
  },

  // Emergency contact
  "contact": [
    {
      "relationship": [
        {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/v2-0131",
              "code": "N",
              "display": "Next-of-Kin"
            }
          ]
        }
      ],
      "name": {
        "family": "Mthembu",
        "given": ["Nomsa"]
      },
      "telecom": [
        {
          "system": "phone",
          "value": "+27825559999"
        }
      ]
    }
  ],

  // Communication preferences — important for SA's 11 official languages
  "communication": [
    {
      "language": {
        "coding": [
          {
            "system": "urn:ietf:bcp:47",
            "code": "zu",
            "display": "isiZulu"
          }
        ]
      },
      // This is the patient's preferred language
      "preferred": true
    },
    {
      "language": {
        "coding": [
          {
            "system": "urn:ietf:bcp:47",
            "code": "en",
            "display": "English"
          }
        ]
      },
      "preferred": false
    }
  ],

  // General practitioner reference
  "generalPractitioner": [
    {
      "reference": "Practitioner/dr-patel-mp0512345",
      "display": "Dr Ravi Patel"
    }
  ],

  // The organization managing this patient record
  "managingOrganization": {
    "reference": "Organization/netcare-milpark",
    "display": "Netcare Milpark Hospital"
  }
}
```

> **What to say in a meeting**: "This is the same patient data you saw in the HL7v2
> message, but now in FHIR — the modern JSON format that NHI requires. Notice the
> SA ID number, the Discovery membership, the isiZulu language preference. Every
> field is coded to international standards. Our system translates between HL7v2
> and FHIR automatically, so legacy hospital systems and modern NHI endpoints both work."

---

## 5. FHIR R4 Observation — Blood Pressure

**What is it?** A FHIR Observation resource representing a blood pressure reading. Blood
pressure is special because it's a *composite* observation — one parent resource (the BP)
contains two *component* observations (systolic and diastolic).

```json
{
  "resourceType": "Observation",
  "id": "bp-20260320-pat445566",

  "meta": {
    "profile": [
      // This profile defines the structure for blood pressure observations
      "http://hl7.org/fhir/StructureDefinition/bp"
    ]
  },

  // Status of this observation
  // final = complete and verified, preliminary = not yet verified,
  // amended = changed after final, cancelled = test was cancelled
  "status": "final",

  // Category: vital-signs (as opposed to laboratory, imaging, etc.)
  "category": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/observation-category",
          "code": "vital-signs",
          "display": "Vital Signs"
        }
      ]
    }
  ],

  // LOINC code for Blood Pressure Panel
  // 85354-9 is the "parent" code that means "Blood pressure panel"
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "85354-9",
        "display": "Blood pressure panel with all children optional"
      }
    ],
    "text": "Blood Pressure"
  },

  // Who this observation is about
  "subject": {
    "reference": "Patient/pat-445566-milpark",
    "display": "Sipho Thabo Mthembu"
  },

  // When the blood pressure was taken (ISO 8601)
  "effectiveDateTime": "2026-03-20T09:20:00+02:00",

  // Who performed the observation
  "performer": [
    {
      "reference": "Practitioner/nurse-mokoena-nc001",
      "display": "Sr Thandi Mokoena"
    }
  ],

  // Clinical interpretation of the overall result
  "interpretation": [
    {
      "coding": [
        {
          // H = High — this patient has elevated blood pressure
          "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
          "code": "H",
          "display": "High"
        }
      ]
    }
  ],

  // Body site and method — important for accuracy
  "bodySite": {
    "coding": [
      {
        "system": "http://snomed.info/sct",
        "code": "368209003",
        "display": "Right upper arm structure"
      }
    ]
  },

  // How was it measured?
  "method": {
    "coding": [
      {
        "system": "http://snomed.info/sct",
        "code": "271649006",
        "display": "Systolic blood pressure, automated"
      }
    ]
  },

  // The two components — systolic (top number) and diastolic (bottom number)
  "component": [
    {
      // SYSTOLIC — the pressure when the heart beats
      "code": {
        "coding": [
          {
            "system": "http://loinc.org",
            // LOINC 8480-6 = Systolic blood pressure
            "code": "8480-6",
            "display": "Systolic blood pressure"
          }
        ]
      },
      "valueQuantity": {
        // 148 mmHg — elevated (normal is below 120)
        "value": 148,
        "unit": "mmHg",
        "system": "http://unitsofmeasure.org",
        "code": "mm[Hg]"
      },
      "interpretation": [
        {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
              "code": "H",
              "display": "High"
            }
          ]
        }
      ],
      // Reference range for systolic
      "referenceRange": [
        {
          "low": { "value": 90, "unit": "mmHg" },
          "high": { "value": 120, "unit": "mmHg" },
          "text": "Normal: 90-120 mmHg"
        }
      ]
    },
    {
      // DIASTOLIC — the pressure between heartbeats
      "code": {
        "coding": [
          {
            "system": "http://loinc.org",
            // LOINC 8462-4 = Diastolic blood pressure
            "code": "8462-4",
            "display": "Diastolic blood pressure"
          }
        ]
      },
      "valueQuantity": {
        // 94 mmHg — elevated (normal is below 80)
        "value": 94,
        "unit": "mmHg",
        "system": "http://unitsofmeasure.org",
        "code": "mm[Hg]"
      },
      "interpretation": [
        {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
              "code": "H",
              "display": "High"
            }
          ]
        }
      ],
      "referenceRange": [
        {
          "low": { "value": 60, "unit": "mmHg" },
          "high": { "value": 80, "unit": "mmHg" },
          "text": "Normal: 60-80 mmHg"
        }
      ]
    }
  ]
}
```

> **What to say in a meeting**: "Blood pressure in FHIR is a composite observation —
> one resource with two components. The parent has LOINC code 85354-9, and the children
> are 8480-6 for systolic and 8462-4 for diastolic. This patient reads 148/94, which our
> system flags as Stage 2 hypertension. Combined with their diabetes panel, this is a
> high-risk patient that triggers our automated care pathway."

---

## 6. EDIFACT MEDCLM — Medical Claim

**What is it?** EDIFACT (Electronic Data Interchange for Administration, Commerce and Transport)
is the claims standard used between medical practices and medical aids in South Africa.
The MEDCLM message is how a practice submits a bill to the scheme. This is the money message —
get it wrong, and you don't get paid.

**When you see it**: After a patient visit, the practice management software generates this
and transmits it to the medical aid via a switch (MediSwitch, Healthbridge, etc.).

```
UNB+UNOC:3+PRNCROSS01:ZZ+DISCOVERY01:ZZ+260320:1430+REF20260320001++MEDCLM+++1'
```

| Segment | Element | Value | Meaning |
|---------|---------|-------|---------|
| UNB | Syntax ID | `UNOC:3` | UN/EDIFACT character set C, version 3 (supports SA characters) |
| | Sender | `PRNCROSS01:ZZ` | Medicross Sandton practice — ZZ = mutually agreed ID |
| | Recipient | `DISCOVERY01:ZZ` | Discovery Health — the medical aid being billed |
| | Date/Time | `260320:1430` | 20 March 2026, 14:30 |
| | Interchange Ref | `REF20260320001` | Unique interchange reference |
| | Application Ref | `MEDCLM` | This is a medical claim interchange |
| | Test Indicator | `1` | 1 = Production (0 = Test) |

```
UNH+1+MEDCLM:0:912:ZA'
```

| Element | Value | Meaning |
|---------|-------|---------|
| Message Ref | `1` | First message in this interchange |
| Message Type | `MEDCLM` | Medical Claim |
| Version | `0` | Version 0 |
| Release | `912` | Release 912 — the current SA standard |
| Controlling Agency | `ZA` | South Africa-specific implementation |

```
BGM+380+CLM20260320001+9'
```

| Element | Value | Meaning |
|---------|-------|---------|
| Document Type | `380` | 380 = Commercial Invoice (standard for claims) |
| Document Number | `CLM20260320001` | Unique claim number generated by the practice |
| Message Function | `9` | 9 = Original (5 = Replace, 1 = Cancellation) |

```
DTM+137:20260320:102'
```

| Element | Value | Meaning |
|---------|-------|---------|
| Date Qualifier | `137` | 137 = Document/message date |
| Date | `20260320` | 20 March 2026 |
| Format | `102` | 102 = CCYYMMDD format |

```
DTM+232:20260320:102'
```

| Element | Value | Meaning |
|---------|-------|---------|
| Date Qualifier | `232` | 232 = Date of service (when the patient was seen) |
| Date | `20260320` | Treatment date — 20 March 2026 |

```
RFF+ACD:MP0567890'
```

| Element | Value | Meaning |
|---------|-------|---------|
| Reference Qualifier | `ACD` | ACD = HPCSA Practice Number |
| Reference Number | `MP0567890` | The treating doctor's practice number — critical for payment routing |

```
RFF+AHI:1234567890'
```

| Element | Value | Meaning |
|---------|-------|---------|
| Reference Qualifier | `AHI` | AHI = Medical Aid Membership Number |
| Reference Number | `1234567890` | Patient's Discovery membership number |

```
RFF+ABO:00'
```

| Element | Value | Meaning |
|---------|-------|---------|
| Reference Qualifier | `ABO` | ABO = Dependant Code |
| Reference Number | `00` | 00 = Principal member (01 = spouse, 02+ = children) |

```
NAD+SU+MP0567890::ZZ++Van Niekerk^Elna^Dr+Medicross Sandton^Cnr West and Rivonia Rd^^Sandton^2196+Sandton++2196+ZA'
```

| Element | Value | Meaning |
|---------|-------|---------|
| Party Qualifier | `SU` | SU = Supplier (the healthcare provider) |
| Party ID | `MP0567890::ZZ` | HPCSA practice number |
| Party Name | `Van Niekerk^Elna^Dr` | Dr Elna van Niekerk — the treating GP |
| Street Address | `Medicross Sandton^Cnr West and Rivonia Rd^^Sandton^2196` | Practice address |
| City | `Sandton` | City |
| Postal Code | `2196` | Postal code |
| Country | `ZA` | South Africa |

```
NAD+PA+8501015800085::ZZ++Mthembu^Sipho^Mr+42 Vilakazi Street^^Soweto^^1804+Soweto++1804+ZA'
```

| Element | Value | Meaning |
|---------|-------|---------|
| Party Qualifier | `PA` | PA = Patient |
| Party ID | `8501015800085::ZZ` | SA ID number as the patient identifier |
| Party Name | `Mthembu^Sipho^Mr` | Patient name |

```
GIS+N'
```

| Element | Value | Meaning |
|---------|-------|---------|
| Processing Indicator | `N` | N = New claim (R = Re-submission, S = Supplementary) |

```
PDI+1'
```

| Element | Value | Meaning |
|---------|-------|---------|
| Gender | `1` | 1 = Male (2 = Female) |

```
ATT+2+19850101:ZA'
```

| Element | Value | Meaning |
|---------|-------|---------|
| Attribute Qualifier | `2` | 2 = Date of birth attribute |
| Attribute Value | `19850101:ZA` | 1 January 1985, South Africa format |

```
LIN+1'
```

| Element | Value | Meaning |
|---------|-------|---------|
| Line Number | `1` | First line item on the claim |

```
IMD+C++:::GP consultation^0190:NHRPL'
```

| Element | Value | Meaning |
|---------|-------|---------|
| Item Description Type | `C` | C = Code and description |
| Description | `GP consultation^0190:NHRPL` | Tariff code 0190 from the NHRPL (National Health Reference Price List) = GP consultation |

```
QTY+47:1'
```

| Element | Value | Meaning |
|---------|-------|---------|
| Quantity Qualifier | `47` | 47 = Invoiced quantity |
| Quantity | `1` | One consultation |

```
PRI+AAA:550.00:CA'
```

| Element | Value | Meaning |
|---------|-------|---------|
| Price Qualifier | `AAA` | AAA = Calculation net price |
| Price | `550.00` | **R550.00 — the amount being claimed** |
| Price Type | `CA` | CA = Catalogue price |

```
MOA+203:550.00:ZAR'
```

| Element | Value | Meaning |
|---------|-------|---------|
| Amount Qualifier | `203` | 203 = Line item amount |
| Amount | `550.00` | R550.00 |
| Currency | `ZAR` | South African Rand |

```
FTX+DIA+++J06.9:I10-ZA:Acute upper respiratory infection, unspecified'
```

| Element | Value | Meaning |
|---------|-------|---------|
| Text Subject | `DIA` | DIA = Diagnosis |
| Text | `J06.9:I10-ZA:Acute upper respiratory infection, unspecified` | ICD-10-ZA code J06.9 — acute URTI (common cold/flu) |

```
UNT+18+1'
```

| Element | Value | Meaning |
|---------|-------|---------|
| Segment Count | `18` | Total number of segments in this message (including UNH and UNT) |
| Message Ref | `1` | Matches the UNH reference |

```
UNZ+1+REF20260320001'
```

| Element | Value | Meaning |
|---------|-------|---------|
| Interchange Count | `1` | One message in this interchange |
| Interchange Ref | `REF20260320001` | Matches the UNB reference — used for reconciliation |

> **What to say in a meeting**: "Every claim to a medical aid in South Africa goes through
> EDIFACT — it's the pipe that carries the money. The key fields are the HPCSA practice
> number, the tariff code (0190 for a GP consultation), the ICD-10 diagnosis code (J06.9
> for URTI), and the claimed amount in Rand. Our system validates all of these before
> submission — if the tariff doesn't match the diagnosis, we flag it before it gets rejected."

---

## 7. eRA XML — Electronic Remittance Advice

**What is it?** The Electronic Remittance Advice (eRA) is what comes back from the medical
aid after they process your claim. It tells you: approved, partially paid, or rejected — and
why. This is the single most important document for practice revenue.

### Scenario A: Fully Approved Claim

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!-- Electronic Remittance Advice — this is the medical aid's response to our claim -->
<RemittanceAdvice
    xmlns="http://www.medicalschemes.co.za/era/v2"
    version="2.0">

  <!-- Header: identifies which claim batch this response covers -->
  <Header>
    <!-- Unique ID for this remittance from the scheme -->
    <RemittanceNumber>ERA20260321001</RemittanceNumber>
    <!-- Which scheme sent this -->
    <SchemeName>Discovery Health Medical Scheme</SchemeName>
    <SchemeRegistration>1125</SchemeRegistration>
    <!-- Administrator (sometimes different from scheme) -->
    <AdministratorName>Discovery Health (Pty) Ltd</AdministratorName>
    <AdministratorBHFNumber>600001234</AdministratorBHFNumber>
    <!-- Date the remittance was generated -->
    <RemittanceDate>2026-03-21</RemittanceDate>
    <!-- Payment date — when the money hits the practice bank account -->
    <PaymentDate>2026-03-23</PaymentDate>
    <!-- Payment reference for bank reconciliation -->
    <PaymentReference>DH-EFT-20260323-44521</PaymentReference>
  </Header>

  <!-- Provider: who is getting paid -->
  <Provider>
    <PracticeNumber>MP0567890</PracticeNumber>
    <ProviderName>Dr Elna van Niekerk</ProviderName>
    <BankAccount>
      <BankName>FNB</BankName>
      <BranchCode>250655</BranchCode>
      <AccountNumber>62XXXXXXXX89</AccountNumber>
    </BankAccount>
  </Provider>

  <Claims>
    <!-- CLAIM 1: FULLY APPROVED -->
    <Claim>
      <!-- Our original claim number — links back to our submission -->
      <ClaimNumber>CLM20260320001</ClaimNumber>
      <!-- Overall claim status: APPROVED, PARTIAL, REJECTED -->
      <ClaimStatus>APPROVED</ClaimStatus>
      <PatientName>Mthembu, Sipho</PatientName>
      <MembershipNumber>1234567890</MembershipNumber>
      <DependantCode>00</DependantCode>
      <DateOfService>2026-03-20</DateOfService>

      <LineItems>
        <LineItem>
          <LineNumber>1</LineNumber>
          <TariffCode>0190</TariffCode>
          <Description>GP Consultation</Description>
          <DiagnosisCode>J06.9</DiagnosisCode>
          <!-- What we charged -->
          <AmountClaimed>550.00</AmountClaimed>
          <!-- What the scheme approved (may differ) -->
          <AmountApproved>550.00</AmountApproved>
          <!-- What the scheme is paying from scheme funds -->
          <AmountPaid>550.00</AmountPaid>
          <!-- What the patient owes (co-payment) -->
          <PatientLiable>0.00</PatientLiable>
          <!-- Line item status -->
          <Status>PAID</Status>
          <!-- No adjustment — full payment -->
          <AdjustmentReasonCode></AdjustmentReasonCode>
        </LineItem>
      </LineItems>

      <!-- Claim-level totals -->
      <TotalClaimed>550.00</TotalClaimed>
      <TotalApproved>550.00</TotalApproved>
      <TotalPaid>550.00</TotalPaid>
      <TotalPatientLiable>0.00</TotalPatientLiable>
    </Claim>
```

### Scenario B: Partially Paid Claim (Scheme Tariff Applied)

```xml
    <!-- CLAIM 2: PARTIALLY PAID — scheme applied their own tariff rate -->
    <Claim>
      <ClaimNumber>CLM20260320002</ClaimNumber>
      <ClaimStatus>PARTIAL</ClaimStatus>
      <PatientName>Naidoo, Priya</PatientName>
      <MembershipNumber>9876543210</MembershipNumber>
      <DependantCode>01</DependantCode>
      <DateOfService>2026-03-20</DateOfService>

      <LineItems>
        <LineItem>
          <LineNumber>1</LineNumber>
          <TariffCode>0190</TariffCode>
          <Description>GP Consultation</Description>
          <DiagnosisCode>J06.9</DiagnosisCode>
          <!-- We charged R550 -->
          <AmountClaimed>550.00</AmountClaimed>
          <!-- Scheme only approves R420 (their scheme tariff rate) -->
          <AmountApproved>420.00</AmountApproved>
          <!-- Scheme pays R420 from benefits -->
          <AmountPaid>420.00</AmountPaid>
          <!-- Patient owes R130 (the gap between charged and approved) -->
          <PatientLiable>130.00</PatientLiable>
          <Status>PARTIAL</Status>
          <!-- Reason code explains WHY they paid less -->
          <AdjustmentReasonCode>ST01</AdjustmentReasonCode>
          <AdjustmentDescription>
            Scheme tariff applied — amount exceeds scheme rate for tariff 0190.
            Patient liable for difference of R130.00.
          </AdjustmentDescription>
        </LineItem>
      </LineItems>

      <TotalClaimed>550.00</TotalClaimed>
      <TotalApproved>420.00</TotalApproved>
      <TotalPaid>420.00</TotalPaid>
      <TotalPatientLiable>130.00</TotalPatientLiable>
    </Claim>
```

### Scenario C: Rejected Claim (Benefits Exhausted)

```xml
    <!-- CLAIM 3: REJECTED — patient's benefits are used up for the year -->
    <Claim>
      <ClaimNumber>CLM20260320003</ClaimNumber>
      <ClaimStatus>REJECTED</ClaimStatus>
      <PatientName>Botha, Jan</PatientName>
      <MembershipNumber>5551234567</MembershipNumber>
      <DependantCode>00</DependantCode>
      <DateOfService>2026-03-20</DateOfService>

      <LineItems>
        <LineItem>
          <LineNumber>1</LineNumber>
          <TariffCode>0190</TariffCode>
          <Description>GP Consultation</Description>
          <DiagnosisCode>J06.9</DiagnosisCode>
          <AmountClaimed>550.00</AmountClaimed>
          <!-- Nothing approved -->
          <AmountApproved>0.00</AmountApproved>
          <AmountPaid>0.00</AmountPaid>
          <!-- Patient owes the full amount -->
          <PatientLiable>550.00</PatientLiable>
          <Status>REJECTED</Status>
          <!-- BE01 = Benefits Exhausted — one of the most common rejections -->
          <AdjustmentReasonCode>BE01</AdjustmentReasonCode>
          <AdjustmentDescription>
            Benefits exhausted for benefit type: Day-to-day.
            Annual limit of R5,200.00 reached on 2026-03-15.
            Patient is liable for full amount. Consider PMB application
            if condition qualifies as Prescribed Minimum Benefit.
          </AdjustmentDescription>
        </LineItem>
      </LineItems>

      <TotalClaimed>550.00</TotalClaimed>
      <TotalApproved>0.00</TotalApproved>
      <TotalPaid>0.00</TotalPaid>
      <TotalPatientLiable>550.00</TotalPatientLiable>
    </Claim>
  </Claims>

  <!-- Remittance summary — what's actually being deposited -->
  <Summary>
    <TotalClaimsInBatch>3</TotalClaimsInBatch>
    <TotalAmountClaimed>1650.00</TotalAmountClaimed>
    <TotalAmountApproved>970.00</TotalAmountApproved>
    <TotalAmountPaid>970.00</TotalAmountPaid>
    <TotalPatientLiable>680.00</TotalPatientLiable>
    <!-- This is the amount that will land in the bank account -->
    <NetPaymentAmount>970.00</NetPaymentAmount>
  </Summary>
</RemittanceAdvice>
```

> **What to say in a meeting**: "The eRA is where the money lives. Out of three claims
> we submitted at R550 each, only one was fully paid. One was cut to R420 because Discovery
> applied their scheme tariff — the patient owes R130. The third was rejected entirely
> because the patient's day-to-day benefits ran out. Our system reads this automatically,
> updates each claim status, generates patient statements for the R680 owed, and flags
> the rejected claim for the front desk to collect."

---

## 8. PHISC XML — Pre-Authorization Request

**What is it?** Before a patient can be admitted for a planned procedure, the medical aid must
approve it. This is the pre-authorisation (pre-auth) request sent via the PHISC (Private
Health Information Standards Committee) standard. Without this, the hospital may not get paid.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!-- Pre-Authorization Request — sent BEFORE hospital admission -->
<PreAuthorisationRequest
    xmlns="http://www.phisc.org.za/preauth/v3"
    version="3.0">

  <!-- Message routing -->
  <Header>
    <!-- Unique request ID — we track this until approval comes back -->
    <RequestId>PREAUTH-2026032001</RequestId>
    <!-- Type of request: ADMIT (hospital), PROCEDURE, CHRONIC, REHAB -->
    <RequestType>ADMIT</RequestType>
    <!-- When this request was generated -->
    <RequestDate>2026-03-20T10:00:00+02:00</RequestDate>
    <!-- How urgent: ELECTIVE, URGENT, EMERGENCY -->
    <Priority>ELECTIVE</Priority>

    <!-- Who is sending this request -->
    <Sender>
      <FacilityName>Netcare Milpark Hospital</FacilityName>
      <!-- BHF number for Milpark -->
      <FacilityBHFNumber>0100001</FacilityBHFNumber>
      <FacilityType>PRIVATE_HOSPITAL</FacilityType>
      <ContactNumber>+27117804000</ContactNumber>
    </Sender>

    <!-- Where the request is going -->
    <Recipient>
      <SchemeName>Discovery Health Medical Scheme</SchemeName>
      <SchemeRegistration>1125</SchemeRegistration>
      <PlanName>Executive</PlanName>
    </Recipient>
  </Header>

  <!-- Patient / member details -->
  <Member>
    <MembershipNumber>1234567890</MembershipNumber>
    <DependantCode>00</DependantCode>
    <Surname>Mthembu</Surname>
    <FirstName>Sipho</FirstName>
    <DateOfBirth>1985-01-01</DateOfBirth>
    <Gender>M</Gender>
    <IDNumber>8501015800085</IDNumber>
  </Member>

  <!-- The treating doctor requesting authorisation -->
  <TreatingProvider>
    <!-- HPCSA practice number — schemes verify this is a registered practitioner -->
    <PracticeNumber>MP0512345</PracticeNumber>
    <ProviderName>Dr Ravi Patel</ProviderName>
    <!-- Specialty code from HPCSA — 015 = Orthopaedic Surgery -->
    <SpecialtyCode>015</SpecialtyCode>
    <SpecialtyDescription>Orthopaedic Surgery</SpecialtyDescription>
    <ContactNumber>+27117804500</ContactNumber>
  </TreatingProvider>

  <!-- What we're requesting authorisation FOR -->
  <AdmissionDetails>
    <!-- Planned admission date -->
    <PlannedAdmissionDate>2026-04-02</PlannedAdmissionDate>
    <!-- Expected length of stay in days -->
    <ExpectedLengthOfStay>5</ExpectedLengthOfStay>
    <!-- Expected discharge date -->
    <PlannedDischargeDate>2026-04-07</PlannedDischargeDate>
    <!-- Ward type requested -->
    <WardType>GENERAL</WardType>
    <!-- Will ICU be needed? -->
    <ICURequired>false</ICURequired>
    <!-- Expected ICU days (0 if not needed) -->
    <ExpectedICUDays>0</ExpectedICUDays>
  </AdmissionDetails>

  <!-- Clinical details — the scheme's clinical team reviews this -->
  <ClinicalInformation>
    <!-- Primary diagnosis requiring admission -->
    <PrimaryDiagnosis>
      <Code>M17.11</Code>
      <CodeSystem>ICD-10-ZA</CodeSystem>
      <Description>Primary osteoarthritis, right knee</Description>
    </PrimaryDiagnosis>

    <!-- Additional relevant diagnoses -->
    <SecondaryDiagnoses>
      <Diagnosis>
        <Code>E11.9</Code>
        <CodeSystem>ICD-10-ZA</CodeSystem>
        <Description>Type 2 diabetes mellitus without complications</Description>
      </Diagnosis>
      <Diagnosis>
        <Code>I10</Code>
        <CodeSystem>ICD-10-ZA</CodeSystem>
        <Description>Essential (primary) hypertension</Description>
      </Diagnosis>
    </SecondaryDiagnoses>

    <!-- The procedure being requested -->
    <PlannedProcedures>
      <Procedure>
        <!-- NHRPL tariff code for total knee replacement -->
        <TariffCode>0882</TariffCode>
        <CodeSystem>NHRPL</CodeSystem>
        <Description>Total knee replacement arthroplasty, right</Description>
        <!-- Laterality matters — prevents wrong-side surgery -->
        <Laterality>RIGHT</Laterality>
      </Procedure>
    </PlannedProcedures>

    <!-- Clinical motivation — WHY this procedure is needed -->
    <ClinicalMotivation>
      Patient presents with severe right knee osteoarthritis (Kellgren-Lawrence
      Grade IV on X-ray dated 2026-02-15). Conservative management over 18 months
      including physiotherapy, NSAIDs, and intra-articular cortisone injections has
      failed to provide adequate pain relief. Patient reports significant impact on
      daily activities and quality of life. BMI 28.2, HbA1c 8.2% (endocrinologist
      Dr Naidoo adjusting medication pre-operatively). Anaesthetic assessment done
      by Dr Govender (ASA Class II). Recommend total knee replacement.
    </ClinicalMotivation>

    <!-- Supporting documents (references, not inline) -->
    <SupportingDocuments>
      <Document>
        <Type>RADIOLOGY_REPORT</Type>
        <Description>Right knee X-ray AP and lateral</Description>
        <Date>2026-02-15</Date>
        <Reference>RAD-2026-02-15-KR001</Reference>
      </Document>
      <Document>
        <Type>SPECIALIST_REPORT</Type>
        <Description>Orthopaedic assessment report</Description>
        <Date>2026-03-10</Date>
        <Reference>ORTH-2026-03-10-SP001</Reference>
      </Document>
    </SupportingDocuments>
  </ClinicalInformation>

  <!-- Estimated costs — the scheme uses this for benefit allocation -->
  <CostEstimate>
    <Currency>ZAR</Currency>
    <!-- Surgeon's fee -->
    <SurgeonFee>45000.00</SurgeonFee>
    <!-- Anaesthetist's fee -->
    <AnaesthetistFee>12000.00</AnaesthetistFee>
    <!-- Hospital (facility) fee — ward, theatre, nursing -->
    <FacilityFee>85000.00</FacilityFee>
    <!-- Prosthesis (the actual knee implant) -->
    <ProsthesisCost>42000.00</ProsthesisCost>
    <!-- Consumables, medication, pathology -->
    <ConsumablesCost>8000.00</ConsumablesCost>
    <!-- Grand total estimate -->
    <TotalEstimate>192000.00</TotalEstimate>
  </CostEstimate>

  <!-- PMB indicator — Prescribed Minimum Benefits -->
  <PMBDetails>
    <!-- Is this a PMB condition? If yes, the scheme MUST cover it by law -->
    <IsPMBCondition>true</IsPMBCondition>
    <!-- PMB CDL condition number (Chronic Disease List) — OA is a PMB -->
    <PMBCode>910Y</PMBCode>
    <PMBDescription>Orthopaedic procedure — joint replacement (PMB level of care)</PMBDescription>
  </PMBDetails>
</PreAuthorisationRequest>
```

> **What to say in a meeting**: "Before any planned hospital admission, we send a
> pre-auth request to the medical aid. This one is for a R192,000 knee replacement.
> It includes the clinical motivation, X-ray references, the exact prosthesis cost,
> and crucially, the PMB flag — because osteoarthritis requiring joint replacement is
> a Prescribed Minimum Benefit, Discovery is legally obligated to cover it at cost.
> Our system tracks the pre-auth number through to discharge and final billing."

---

## 9. ICD-10-ZA Code Entries

**What is it?** ICD-10 (International Classification of Diseases, 10th Revision) is the
global standard for coding diagnoses. South Africa uses ICD-10-ZA, which adds local
specificity. Every claim requires an ICD-10 code. Getting it wrong is the number-one
cause of claim rejections.

### Code 1: J06.9 — Acute Upper Respiratory Tract Infection

| Field | Value |
|-------|-------|
| **Code** | `J06.9` |
| **Description** | Acute upper respiratory tract infection, unspecified |
| **Long Description** | Acute upper respiratory infection NOS (includes common cold, acute nasopharyngitis, pharyngitis, rhinitis, and tracheitis not otherwise specified) |
| **Chapter** | X — Diseases of the Respiratory System (J00-J99) |
| **Block** | J00-J06 — Acute upper respiratory infections |
| **Specificity Level** | 4-character (maximum specificity for this condition) |
| **Gender Restriction** | None |
| **Age Range** | All ages |
| **PMB Status** | No — not a Prescribed Minimum Benefit (unless complications arise) |
| **Requires Pre-Auth** | No |
| **Common Rejection Reasons** | (1) Claimed with specialist tariff — should be GP; (2) Claimed with chronic medication — acute code cannot justify chronic script; (3) Multiple visits within 7 days for same code — possible duplicate |

### Code 2: E11.9 — Type 2 Diabetes Mellitus

| Field | Value |
|-------|-------|
| **Code** | `E11.9` |
| **Description** | Type 2 diabetes mellitus without complications |
| **Long Description** | Non-insulin-dependent diabetes mellitus without mention of complications (includes adult-onset, maturity-onset, and obese-type diabetes) |
| **Chapter** | IV — Endocrine, Nutritional and Metabolic Diseases (E00-E90) |
| **Block** | E10-E14 — Diabetes mellitus |
| **Specificity Level** | 4-character (use 5th character for complications: .0 coma, .1 ketoacidosis, .2 renal, .3 ophthalmic, .4 neurological, .5 peripheral vascular, .6 other specified, .7 multiple, .8 unspecified, .9 without) |
| **Gender Restriction** | None |
| **Age Range** | Typically 25+ (use E10 for Type 1, which presents younger) |
| **PMB Status** | **Yes — CDL Condition #12** (Chronic Disease List). Scheme must cover diagnosis, treatment, and medication at PMB level |
| **Requires Pre-Auth** | Yes — chronic application required to register on CDL programme |
| **Common Rejection Reasons** | (1) No CDL application on file — must register as chronic first; (2) E11.9 used when complications exist — should be E11.2, E11.3, etc.; (3) Wrong medication for code — Insulin claimed on E11 instead of E10 |

### Code 3: I10 — Essential (Primary) Hypertension

| Field | Value |
|-------|-------|
| **Code** | `I10` |
| **Description** | Essential (primary) hypertension |
| **Long Description** | High blood pressure without identifiable cause. Excludes: hypertension complicating pregnancy (O10-O16), neonatal hypertension (P29.2), secondary hypertension (I15) |
| **Chapter** | IX — Diseases of the Circulatory System (I00-I99) |
| **Block** | I10-I15 — Hypertensive diseases |
| **Specificity Level** | 3-character (no further subdivision in ICD-10-ZA) |
| **Gender Restriction** | None |
| **Age Range** | Typically 18+ (paediatric hypertension is secondary — use I15) |
| **PMB Status** | **Yes — CDL Condition #14** |
| **Requires Pre-Auth** | Yes — chronic application required |
| **Common Rejection Reasons** | (1) No CDL registration; (2) Duplicate claim — patient already seen this month on chronic programme; (3) Medication not on formulary — scheme has specific drug list for hypertension |

### Code 4: S52.5 — Fracture of Lower End of Radius (Colles Fracture)

| Field | Value |
|-------|-------|
| **Code** | `S52.5` |
| **Description** | Fracture of lower end of radius |
| **Long Description** | Colles fracture — distal radius fracture typically from a fall on outstretched hand. Includes: Smith fracture (reverse Colles). Use additional code for laterality and open/closed status. |
| **Chapter** | XIX — Injury, Poisoning and Certain Other Consequences of External Causes (S00-T98) |
| **Block** | S50-S59 — Injuries to the elbow and forearm |
| **Specificity Level** | 4-character (5th character available: .50 closed, .51 open) |
| **Gender Restriction** | None (but far more common in post-menopausal women — osteoporosis) |
| **Age Range** | All ages (peak in children 5-14 and women 60+) |
| **PMB Status** | **Yes — emergency condition** (fracture management is a PMB) |
| **Requires Pre-Auth** | No for emergency treatment; Yes if elective surgery (ORIF plating) is needed |
| **Common Rejection Reasons** | (1) No external cause code (W-code) — schemes require cause of injury; (2) S52.5 used without .50/.51 — must specify open or closed; (3) Follow-up visit coded as S52.5 instead of aftercare code Z09.4 |

### Code 5: B20 — Human Immunodeficiency Virus [HIV] Disease

| Field | Value |
|-------|-------|
| **Code** | `B20` |
| **Description** | Human immunodeficiency virus [HIV] disease |
| **Long Description** | HIV disease resulting in infectious and parasitic diseases, malignant neoplasms, other specified diseases, or unspecified disease. In ICD-10-ZA, B20 is used as the umbrella code. Use B20.0-B20.9 for specific manifestations. |
| **Chapter** | I — Certain Infectious and Parasitic Diseases (A00-B99) |
| **Block** | B20-B24 — Human immunodeficiency virus [HIV] disease |
| **Specificity Level** | 3-character (subdivisions: .0 mycobacterial, .1 other infections, .2 cytomegaloviral, .3 other viral, .4 candidiasis, .5 other mycoses, .6 pneumocystis, .7 multiple infections, .8 other conditions, .9 unspecified) |
| **Gender Restriction** | None |
| **Age Range** | All ages (vertical transmission: use P-codes for perinatal HIV) |
| **PMB Status** | **Yes — CDL Condition #13** (HIV/AIDS is a PMB with mandatory ARV coverage) |
| **Requires Pre-Auth** | Yes — CDL application required. ARV regimen must match national treatment guidelines |
| **Common Rejection Reasons** | (1) No CDL registration; (2) ARV regimen not on scheme formulary — must use first-line unless documented failure; (3) CD4/viral load not done within required monitoring period; (4) CONFIDENTIALITY — special handling required under National Health Act Section 14 |

> **What to say in a meeting**: "ICD-10 codes are the language of diagnosis. Every claim
> needs one, and getting it wrong is the number one cause of rejections. The codes we
> see most are J06.9 for URTI — your everyday flu — and the chronic codes: E11 for
> diabetes, I10 for hypertension. These are CDL conditions, which means the medical aid
> is legally obligated to cover them. Our system validates the code against the tariff
> before submission, so we catch mismatches before they become rejections."

---

## 10. NAPPI Code Entries

**What is it?** NAPPI (National Approved Products Pricing Index) codes uniquely identify
every medicine, surgical consumable, and medical device in South Africa. The NAPPI code
is what appears on prescriptions, dispensing records, and claims. The SEP (Single Exit
Price) is the maximum price set by government.

### Medicine 1: Panado 500mg Tablets

| Field | Value |
|-------|-------|
| **NAPPI Code** | `703630001` (7-digit base + 2 pack variant digits) |
| **Trade Name** | Panado |
| **Generic Name (INN)** | Paracetamol (Acetaminophen) |
| **Strength** | 500 mg |
| **Dosage Form** | Tablet |
| **Pack Size** | 24 tablets |
| **Manufacturer** | Adcock Ingram Healthcare (Pty) Ltd |
| **Schedule** | Schedule 0 (S0) — available without prescription, over the counter |
| **SEP (excl. VAT)** | R22.38 |
| **Dispensing Fee** | R27.60 (regulated maximum for S0 medicines) |
| **Maximum Patient Price** | R49.98 (SEP + dispensing fee) |
| **ATC Code** | N02BE01 (Nervous system > Analgesics > Anilides > Paracetamol) |
| **Chronic / Acute** | Acute (not for chronic claims unless motivation provided) |

### Medicine 2: Amloc 5mg Tablets (Amlodipine)

| Field | Value |
|-------|-------|
| **NAPPI Code** | `706542003` |
| **Trade Name** | Amloc |
| **Generic Name (INN)** | Amlodipine besylate |
| **Strength** | 5 mg |
| **Dosage Form** | Tablet |
| **Pack Size** | 30 tablets |
| **Manufacturer** | Aspen Pharmacare |
| **Schedule** | Schedule 3 (S3) — prescription required |
| **SEP (excl. VAT)** | R58.94 |
| **Dispensing Fee** | R46.00 (regulated maximum for S3 medicines up to R107) |
| **Maximum Patient Price** | R104.94 |
| **ATC Code** | C08CA01 (Cardiovascular > Calcium channel blockers > Dihydropyridines > Amlodipine) |
| **Chronic / Acute** | Chronic — used for hypertension (I10) on CDL |

### Medicine 3: Glycomin 850mg Tablets (Metformin)

| Field | Value |
|-------|-------|
| **NAPPI Code** | `705201002` |
| **Trade Name** | Glycomin |
| **Generic Name (INN)** | Metformin hydrochloride |
| **Strength** | 850 mg |
| **Dosage Form** | Tablet |
| **Pack Size** | 60 tablets |
| **Manufacturer** | Austell Pharmaceuticals (Pty) Ltd |
| **Schedule** | Schedule 3 (S3) |
| **SEP (excl. VAT)** | R44.12 |
| **Dispensing Fee** | R46.00 |
| **Maximum Patient Price** | R90.12 |
| **ATC Code** | A10BA02 (Alimentary > Drugs used in diabetes > Biguanides > Metformin) |
| **Chronic / Acute** | Chronic — first-line treatment for Type 2 DM (E11.9) on CDL |

### Medicine 4: Betamox 500mg Capsules (Amoxicillin)

| Field | Value |
|-------|-------|
| **NAPPI Code** | `700863001` |
| **Trade Name** | Betamox |
| **Generic Name (INN)** | Amoxicillin trihydrate |
| **Strength** | 500 mg |
| **Dosage Form** | Capsule |
| **Pack Size** | 100 capsules |
| **Manufacturer** | Aspen Pharmacare |
| **Schedule** | Schedule 4 (S4) — prescription required, pharmacist must record |
| **SEP (excl. VAT)** | R92.45 |
| **Dispensing Fee** | R46.00 |
| **Maximum Patient Price** | R138.45 |
| **ATC Code** | J01CA04 (Anti-infectives > Beta-lactam antibacterials > Penicillins > Amoxicillin) |
| **Chronic / Acute** | Acute — antibiotic course (5-7 days). Chronic use requires motivation. |

### Medicine 5: Altosec 20mg Capsules (Omeprazole)

| Field | Value |
|-------|-------|
| **NAPPI Code** | `708413001` |
| **Trade Name** | Altosec |
| **Generic Name (INN)** | Omeprazole |
| **Strength** | 20 mg |
| **Dosage Form** | Capsule (enteric-coated granules) |
| **Pack Size** | 28 capsules |
| **Manufacturer** | Adcock Ingram Healthcare (Pty) Ltd |
| **Schedule** | Schedule 3 (S3) |
| **SEP (excl. VAT)** | R68.77 |
| **Dispensing Fee** | R46.00 |
| **Maximum Patient Price** | R114.77 |
| **ATC Code** | A02BC01 (Alimentary > Drugs for acid related disorders > Proton pump inhibitors > Omeprazole) |
| **Chronic / Acute** | Both — acute for GERD treatment (4-8 weeks), chronic with motivation for ongoing reflux or NSAID prophylaxis |

> **What to say in a meeting**: "NAPPI codes are to medicines what barcodes are to groceries.
> Every medicine in SA has one. The key thing is the SEP — the Single Exit Price — which
> is the maximum price set by government. Then there's a regulated dispensing fee on top.
> When we process a prescription, our system validates the NAPPI code against the formulary,
> checks if it's covered on the patient's plan, and flags if a cheaper generic is available.
> For chronic patients, we auto-check the CDL registration."

---

## 11. Top 15 Rejection Codes

**What is it?** When a medical aid rejects a claim, they include a reason code. These are the
15 most common rejections in South African medical billing, representing approximately 85% of
all rejections by volume. Understanding these is essential for revenue recovery.

| # | Code | Description | Category | Est. % of Rejections | Rand Impact (per 1000 claims at avg R500) | Fix Action |
|---|------|-------------|----------|---------------------|-------------------------------------------|------------|
| 1 | **BE01** | Benefits exhausted | Manual | 18% | R90,000 | Check benefits before consultation. Inform patient they will be liable. Collect upfront or set up payment plan. |
| 2 | **ST01** | Scheme tariff applied (partial payment) | Auto-fixable | 15% | R75,000 (shortfall) | Invoice patient for gap amount. Consider joining scheme network to get full tariff. Auto-generate patient statement. |
| 3 | **MM01** | Membership not active / not found | Auto-fixable | 12% | R60,000 | Verify membership at check-in with real-time eligibility check. Re-submit with corrected membership number. |
| 4 | **DC01** | Duplicate claim | Auto-fixable | 8% | R40,000 | Check claim history before submitting. If truly duplicate, do not resubmit. If different service, add modifier or change date. |
| 5 | **DG01** | Invalid/missing diagnosis code | Auto-fixable | 7% | R35,000 | Validate ICD-10 code before submission. Ensure 4th character specificity. Resubmit with correct code. |
| 6 | **PA01** | No pre-authorisation | Manual | 6% | R30,000 | Obtain retro-authorisation within 48 hours (some schemes allow). For future: automate pre-auth check on admission. |
| 7 | **TM01** | Tariff/diagnosis mismatch | Auto-fixable | 5% | R25,000 | Tariff 0190 (GP) cannot have surgical diagnosis. Correct the tariff or diagnosis code. System should validate combinations. |
| 8 | **CD01** | Not registered on Chronic Disease List | Manual | 5% | R25,000 | Submit CDL application. Meanwhile, bill as acute (limited visits). Follow up on CDL application status weekly. |
| 9 | **DP01** | Dependant not registered | Auto-fixable | 4% | R20,000 | Verify dependant code at check-in. Common with newborns not yet added to policy. Patient must update with scheme. |
| 10 | **EX01** | Claim submitted after deadline | Non-resubmittable | 4% | R20,000 | Most schemes require claims within 4 months. Automate daily claim submission. This money is lost if deadline passed. |
| 11 | **PR01** | Provider not contracted/registered | Manual | 3% | R15,000 | Verify HPCSA registration is current. Check scheme network status. Re-register if needed. |
| 12 | **FM01** | Medicine not on formulary | Manual | 3% | R15,000 | Check formulary before prescribing. Request Section 21 motivation for non-formulary items. Switch to generic alternative. |
| 13 | **AG01** | Age/gender mismatch | Auto-fixable | 3% | R15,000 | Paediatric code on adult, or gender-specific code mismatch. Correct the code. System should validate automatically. |
| 14 | **WP01** | Waiting period applies | Non-resubmittable | 2% | R10,000 | New members have waiting periods (general: 3 months, pre-existing: 12 months). Patient is liable. Cannot be overridden. |
| 15 | **CO01** | Co-payment required (PMB) | Manual | 2% | R10,000 | PMB claims at non-designated provider attract co-payment. Inform patient of designated provider network. |

### Summary by Category

| Category | Codes | Total % | Recovery Potential |
|----------|-------|---------|-------------------|
| **Auto-fixable** (system can correct and resubmit) | ST01, MM01, DC01, DG01, TM01, DP01, AG01 | **54%** | High — our system catches these before submission |
| **Manual** (requires human intervention) | BE01, PA01, CD01, PR01, FM01, CO01 | **37%** | Medium — staff action needed within time window |
| **Non-resubmittable** (money is lost) | EX01, WP01 | **6%** | Zero — prevention only |

> **What to say in a meeting**: "Over half of all claim rejections are auto-fixable —
> things like wrong membership numbers, missing diagnosis codes, or duplicate submissions.
> Our system catches these before the claim even leaves the practice. The manual ones
> need staff action, like getting a retro-auth or registering a chronic condition. The
> ones that hurt most are late submissions — that money is gone. We enforce a same-day
> submission rule that eliminates that entirely."

---

## 12. Claim Lifecycle Diagram

**What is it?** The complete journey of a medical claim from the moment a patient walks in
to the moment the money is reconciled in the practice bank account. Every system touchpoint
is shown.

```
CLAIM LIFECYCLE — From Clinical Encounter to Payment Reconciliation
====================================================================

PHASE 1: PATIENT ENCOUNTER
---------------------------

  Patient arrives
       |
       v
  +-------------------+     +------------------------+
  | FRONT DESK        |---->| ELIGIBILITY CHECK      |
  | - Verify ID       |     | - Real-time query to   |
  | - Scan med aid    |     |   medical aid           |
  | - Check benefits  |     | - Confirm membership    |
  | - Collect co-pay  |     |   active, dependant     |
  |   if applicable   |     |   registered, benefits  |
  +-------------------+     |   available             |
                            +------------------------+
                                     |
                         +-----------+-----------+
                         |                       |
                    [ELIGIBLE]            [NOT ELIGIBLE]
                         |                       |
                         v                       v
                  +-------------+      +------------------+
                  | CONTINUE    |      | INFORM PATIENT   |
                  | ADMISSION   |      | - Cash/self-pay  |
                  +-------------+      | - Payment plan   |
                         |             | - Refer to scheme|
                         v             +------------------+
                  +-------------------+
                  | CLINICAL CONSULT  |
                  | - Doctor sees pt  |
                  | - Diagnosis made  |
                  | - Treatment given |
                  | - Notes captured  |
                  +-------------------+
                         |
                         v

PHASE 2: CLAIM CREATION
------------------------

  +---------------------------------------------+
  | PRACTICE MANAGEMENT SYSTEM (PMS)            |
  |                                             |
  |  Clinical data captured:                    |
  |  - ICD-10 diagnosis code(s)                 |
  |  - NHRPL tariff code(s)                     |
  |  - NAPPI codes (if dispensing)              |
  |  - Treating provider HPCSA number           |
  |  - Date and time of service                 |
  |  - Modifiers (if applicable)                |
  +---------------------------------------------+
           |
           v
  +---------------------------------------------+
  | HEALTHOS PRE-SUBMISSION VALIDATION          |
  |                                             |
  |  Auto-checks (prevents 54% of rejections): |
  |  [x] ICD-10 code valid and specific enough  |
  |  [x] Tariff matches diagnosis               |
  |  [x] No duplicate claim in last 7 days      |
  |  [x] Membership number format correct       |
  |  [x] Dependant code valid                   |
  |  [x] Provider HPCSA active                  |
  |  [x] Age/gender matches diagnosis           |
  |  [x] NAPPI on formulary (if applicable)     |
  |  [x] Pre-auth obtained (if required)        |
  |  [x] Claim within submission deadline       |
  +---------------------------------------------+
           |
           +--------+
           |        |
      [PASS]   [FAIL - fix required]
           |        |
           |        v
           |   +------------------+
           |   | FLAG FOR STAFF   |
           |   | - Show what's    |
           |   |   wrong          |
           |   | - Suggest fix    |
           |   | - Auto-fix if    |
           |   |   possible       |
           |   +------------------+
           |        |
           |        v (after fix)
           |<-------+
           |
           v

PHASE 3: CLAIM SUBMISSION
--------------------------

  +-------------------+
  | FORMAT AS EDIFACT |
  | MEDCLM v0:912:ZA  |
  | (See Section 6)   |
  +-------------------+
           |
           v
  +-------------------------------+
  | SWITCH / CLEARINGHOUSE       |
  | (MediSwitch / Healthbridge)  |
  |                              |
  | - Validates EDIFACT syntax   |
  | - Routes to correct scheme   |
  | - Returns switch reference   |
  | - Typical: 2-5 seconds       |
  +-------------------------------+
           |
           v
  +-------------------------------+
  | MEDICAL AID / SCHEME         |
  | (Discovery, Medscheme, etc.) |
  |                              |
  | Processing pipeline:         |
  | 1. Member verification       |
  | 2. Benefit check             |
  | 3. Clinical rules engine     |
  | 4. Tariff adjudication       |
  | 5. PMB assessment            |
  | 6. Fraud detection           |
  | 7. Payment decision          |
  +-------------------------------+
           |
           v

PHASE 4: ADJUDICATION & RESPONSE
----------------------------------

  +----------------------------------------------------------+
  | SCHEME RETURNS eRA (Electronic Remittance Advice)        |
  | (See Section 7)                                          |
  |                                                          |
  |   Three possible outcomes:                               |
  |                                                          |
  |   APPROVED -----> Full payment at claimed amount         |
  |                   R550 claimed, R550 paid                 |
  |                                                          |
  |   PARTIAL ------> Scheme tariff / co-payment applied     |
  |                   R550 claimed, R420 paid, R130 patient   |
  |                                                          |
  |   REJECTED -----> No payment, reason code given          |
  |                   R550 claimed, R0 paid, R550 patient     |
  +----------------------------------------------------------+
           |
           +--------------------+---------------------+
           |                    |                     |
      [APPROVED]           [PARTIAL]            [REJECTED]
           |                    |                     |
           v                    v                     v
  +--------------+   +------------------+   +-------------------+
  | CLOSE CLAIM  |   | PATIENT BILLING  |   | REJECTION HANDLER |
  | - Mark paid  |   | - Generate       |   | - Parse reason    |
  | - Update     |   |   statement for  |   |   code            |
  |   ledger     |   |   R130 gap       |   | - Auto-fix if     |
  +--------------+   | - SMS patient    |   |   possible         |
                     | - Offer payment  |   | - Resubmit or     |
                     |   options        |   |   flag for manual  |
                     +------------------+   |   review           |
                                            +-------------------+
                                                     |
                                            +--------+--------+
                                            |                 |
                                     [AUTO-FIXABLE]   [MANUAL/LOST]
                                            |                 |
                                            v                 v
                                     +-----------+   +---------------+
                                     | RESUBMIT  |   | PATIENT BILL  |
                                     | corrected |   | or WRITE OFF  |
                                     | claim     |   +---------------+
                                     +-----------+

PHASE 5: PAYMENT & RECONCILIATION
-----------------------------------

  +------------------------------------------------------+
  | SCHEME EFT PAYMENT                                   |
  | - Paid in batch (weekly/bi-weekly)                   |
  | - Single deposit covers multiple claims              |
  | - Payment reference matches eRA batch number         |
  +------------------------------------------------------+
           |
           v
  +------------------------------------------------------+
  | BANK ACCOUNT                                         |
  | FNB Business Account                                 |
  | - Deposit arrives: R970.00                           |
  | - Reference: DH-EFT-20260323-44521                   |
  +------------------------------------------------------+
           |
           v
  +------------------------------------------------------+
  | HEALTHOS RECONCILIATION ENGINE                       |
  |                                                      |
  | 1. Match EFT deposit to eRA batch                    |
  | 2. Allocate payment to individual claims              |
  | 3. Update claim status: PAID                          |
  | 4. Calculate: claimed vs received vs outstanding      |
  | 5. Generate patient statements for balances           |
  | 6. Update practice financial dashboard                |
  | 7. Flag unmatched deposits for manual review          |
  +------------------------------------------------------+
           |
           v
  +------------------------------------------------------+
  | PRACTICE FINANCIAL DASHBOARD                          |
  |                                                      |
  | Today's Summary:                                      |
  |   Claims submitted:     R12,500                       |
  |   Claims approved:       R9,800                       |
  |   Claims paid (banked):  R8,200                       |
  |   Patient liable:        R2,700                       |
  |   Rejections:            R1,600 (3 claims)            |
  |   Collection rate:        78.4%                       |
  |                                                      |
  | Aged Debtors:                                         |
  |   Current (0-30 days):   R14,200                      |
  |   30-60 days:             R6,800                      |
  |   60-90 days:             R3,100                      |
  |   90+ days:               R1,900 (flag for write-off) |
  +------------------------------------------------------+

TIMELINE (typical GP claim):
==============================

  Day 0     Patient visit + claim created + submitted
  Day 0     Switch acknowledgement (seconds)
  Day 1-3   Scheme adjudicates
  Day 1-3   eRA returned (approved/partial/rejected)
  Day 3-7   If rejected: auto-fix and resubmit
  Day 7-14  Scheme EFT payment batch processed
  Day 14    Money in bank account
  Day 14    Reconciliation complete

  Total: 7-14 days from consultation to cash
  Target: <10 days average (industry avg is 21 days)
```

> **What to say in a meeting**: "A claim touches seven systems from the moment a patient
> walks in to the money hitting the bank. Our system sits in the middle, validating
> before submission, parsing the response, auto-fixing rejections, and reconciling
> payments. The industry average is 21 days from consultation to cash. We target under
> 10. The key is catching errors before submission — 54% of rejections are preventable
> with automated validation."

---

## Appendix: Quick Reference Card

| Format | Direction | Purpose | When |
|--------|-----------|---------|------|
| HL7v2 ADT^A01 | Hospital -> HealthOS | Patient admitted | Admission |
| HL7v2 ORU^R01 | Lab -> HealthOS | Results ready | After specimen processing |
| HL7v2 ORM^O01 | HealthOS -> Department | Order placed | Doctor orders test/scan |
| FHIR R4 Patient | HealthOS <-> NHI | Patient record | Any patient interaction |
| FHIR R4 Observation | HealthOS <-> NHI | Clinical data | Vitals, labs, assessments |
| EDIFACT MEDCLM | Practice -> Scheme | Bill the medical aid | After consultation |
| eRA XML | Scheme -> Practice | Payment response | 1-3 days after claim |
| PHISC Pre-Auth | Hospital -> Scheme | Approve admission | Before planned procedure |
| ICD-10-ZA | In claims & orders | Diagnosis coding | Every clinical encounter |
| NAPPI | In claims & scripts | Medicine identification | Every prescription |

---

*Document generated by Visio Workspace Engineering for Netcare Health OS.
For questions, contact the integration team.*
