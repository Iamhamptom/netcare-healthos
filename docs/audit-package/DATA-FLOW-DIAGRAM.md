# VisioHealth OS — Data Flow Diagram

**POPIA-Compliant Data Flow Documentation**
**Prepared by:** Visio Research Labs (Pty) Ltd
**Document Classification:** Confidential — For Vendor Assessment Only
**Version:** 2.0
**Date:** March 2026

---

## 1. Overview

This document maps the flow of personal information (PI) and personal health information (PHI) through the VisioHealth OS platform, identifying encryption status, access controls, consent checkpoints, and cross-border transfers at each stage. It is prepared in accordance with the Protection of Personal Information Act (POPIA) and aligned with HPCSA electronic records guidelines.

---

## 2. Data Classification

| Classification | Description | Examples |
|---------------|-------------|----------|
| **PHI** (Protected Health Information) | Clinical and health-related personal data | Diagnoses, prescriptions, vitals, clinical notes, allergies |
| **PII** (Personally Identifiable Information) | Non-clinical personal data | Name, ID number, contact details, address |
| **Financial** | Payment and billing data | Invoice amounts, payment records, medical aid details |
| **Operational** | System and practice data | Appointments, staff records, audit logs |
| **De-identified** | Anonymised analytical data | Aggregated statistics, anonymised AI context |

---

## 3. Primary Data Flows

### Flow 1: Patient Registration & Consent

```
  PATIENT                 RECEPTIONIST              SYSTEM                  DATABASE
     |                        |                       |                       |
     |  1. Presents at        |                       |                       |
     |     reception          |                       |                       |
     |----------------------->|                       |                       |
     |                        |                       |                       |
     |  2. CONSENT            |                       |                       |
     |     CHECKPOINT         |                       |                       |
     |     - Treatment        |                       |                       |
     |     - Data processing  |                       |                       |
     |     - Marketing (opt)  |                       |                       |
     |     - Research (opt)   |                       |                       |
     |----------------------->|                       |                       |
     |                        |  3. Enter demographics |                       |
     |                        |  (PII: name, ID,      |                       |
     |                        |   contact, med aid)    |                       |
     |                        |----------------------->|                       |
     |                        |                       |  4. Store encrypted    |
     |                        |                       |  (AES-256, RLS scoped) |
     |                        |                       |----------------------->|
     |                        |                       |                       |
     |                        |                       |  5. Consent record     |
     |                        |                       |  stored with timestamp |
     |                        |                       |  + granular flags      |
     |                        |                       |----------------------->|
```

**Encryption**: TLS 1.3 (browser to server), AES-256 at rest
**Access**: Receptionist role + Practice Admin role
**Consent**: Captured and stored before any data processing
**Retention**: Patient record retained minimum 7 years post last encounter

---

### Flow 2: Clinical Consultation

```
  PRACTITIONER              SYSTEM                  DATABASE             AI SERVICE
     |                        |                       |                     |
     |  1. Access patient     |                       |                     |
     |     record             |                       |                     |
     |----------------------->|                       |                     |
     |                        |  2. Verify role +     |                     |
     |                        |     tenant (RLS)      |                     |
     |                        |----------------------->|                     |
     |                        |  3. Return scoped     |                     |
     |                        |     patient data      |                     |
     |                        |<-----------------------|                     |
     |  4. View patient       |                       |                     |
     |     record             |                       |                     |
     |<-----------------------|                       |                     |
     |                        |                       |                     |
     |  5. Request AI         |                       |                     |
     |     clinical assist    |                       |                     |
     |----------------------->|                       |                     |
     |                        |  6. DE-IDENTIFICATION |                     |
     |                        |     CHECKPOINT        |                     |
     |                        |     Strip: name, ID,  |                     |
     |                        |     contact, med aid  |                     |
     |                        |     Retain: symptoms, |                     |
     |                        |     vitals, age range |                     |
     |                        |------------------------------------------>|
     |                        |                       |                     |
     |                        |  7. AI response       |                     |
     |                        |     (suggestion only)  |                     |
     |                        |<------------------------------------------|
     |  8. Review AI          |                       |                     |
     |     suggestion         |                       |                     |
     |     (practitioner      |                       |                     |
     |      makes final       |                       |                     |
     |      clinical decision)|                       |                     |
     |<-----------------------|                       |                     |
     |                        |                       |                     |
     |  9. Save clinical      |                       |                     |
     |     notes              |                       |                     |
     |----------------------->|                       |                     |
     |                        |  10. Store with audit  |                     |
     |                        |      trail             |                     |
     |                        |----------------------->|                     |
```

**Encryption**: TLS 1.3 in transit, AES-256 at rest
**Access**: Practitioner role only (RLS enforced)
**De-identification**: Applied before any data leaves SA-hosted database to AI services
**AI Data Policy**: No PII/PHI transmitted. AI services receive de-identified clinical context only. AI responses are suggestions — practitioners make all clinical decisions.
**Audit**: Every record access and modification logged with user ID, timestamp, action

---

### Flow 3: Billing & Claims

```
  PRACTICE ADMIN            SYSTEM                  CLAIMS SWITCH        MED AID
     |                        |                       |                     |
     |  1. Generate invoice   |                       |                     |
     |     (ICD-10 + NAPPI)   |                       |                     |
     |----------------------->|                       |                     |
     |                        |  2. Format claim       |                     |
     |                        |     (encrypted payload) |                    |
     |                        |----------------------->|                     |
     |                        |                       |  3. Route to scheme  |
     |                        |                       |-------------------->|
     |                        |                       |  4. Adjudication     |
     |                        |                       |<--------------------|
     |                        |  5. Response           |                     |
     |                        |<-----------------------|                     |
     |  6. Update invoice     |                       |                     |
     |     status             |                       |                     |
     |<-----------------------|                       |                     |
```

**Data Shared with Claims Switch**: Patient medical aid number, ICD-10 codes, NAPPI codes, practitioner details, tariff amounts
**Encryption**: TLS 1.3 in transit, mutual TLS where supported by switch
**Retention**: Financial records retained minimum 5 years (SARS requirement)

---

### Flow 4: Patient Communication (WhatsApp)

```
  SYSTEM                    TWILIO (WhatsApp)        PATIENT PHONE
     |                        |                       |
     |  1. Send reminder      |                       |
     |     (first name +      |                       |
     |      appointment       |                       |
     |      date/time ONLY)   |                       |
     |----------------------->|                       |
     |                        |  2. Deliver message   |
     |                        |----------------------->|
     |                        |                       |
     |  3. Delivery receipt   |                       |
     |<-----------------------|                       |
```

**CONSENT CHECKPOINT**: Patient must explicitly opt in to WhatsApp communications
**Data Shared**: First name, appointment date and time ONLY. No clinical data, no surname, no ID number.
**Cross-border**: Message routed via Twilio (US) — disclosed in consent and sub-processor register

---

## 4. Cross-Border Transfer Summary

| Destination | Data Type | Purpose | Safeguard |
|-------------|-----------|---------|-----------|
| EU (Supabase, eu-west-1) | All patient data (PHI, PII, Financial) | Primary database | AES-256, RLS, SOC 2 Type II, DPA in place |
| US (Anthropic / Google AI) | De-identified clinical context only | AI-assisted clinical suggestions | De-identification before transmission, no PII/PHI, DPA in place |
| US (Twilio) | First name + appointment time only | WhatsApp reminders | Explicit consent, minimal data, SOC 2 Type II, DPA in place |
| US (Sentry) | Error telemetry (no patient data) | Application monitoring | No PII/PHI in error reports, SOC 2 Type II |
| US (ElevenLabs) | Synthesised text (no patient data) | Voice interface | No PII/PHI transmitted |
| Global (Vercel CDN) | Static assets + API routing only | Application delivery | No patient data cached at edge, SOC 2 Type II |

---

## 5. Consent Management

### Consent Types Tracked

| Consent Type | Required | Can Withdraw | Impact of Withdrawal |
|-------------|----------|-------------|---------------------|
| Treatment | Yes (for service) | Yes | Cannot continue treatment |
| Data Processing | Yes (POPIA s11) | Yes | Account deactivation, data retained per legal minimums |
| Marketing Communications | No (opt-in) | Yes, anytime | No further marketing, no service impact |
| Research (anonymised) | No (opt-in) | Yes, anytime | Excluded from anonymised datasets |

### Consent Record Fields
- Consent type
- Granted/withdrawn flag
- Timestamp (UTC)
- Method (digital, in-person)
- User who recorded consent
- Version of privacy notice presented

---

## 6. Data Retention Schedule

| Data Category | Retention Period | Legal Basis | Disposal Method |
|--------------|-----------------|-------------|-----------------|
| Patient clinical records | 7 years post last encounter | HPCSA guidelines | Secure deletion (crypto-shred) |
| Financial / billing records | 5 years | SARS Income Tax Act | Secure deletion |
| Audit logs | 7 years | HPCSA + POPIA accountability | Secure deletion |
| Consent records | Duration of relationship + 5 years | POPIA accountability | Secure deletion |
| Session / analytics data | 90 days | Legitimate interest | Aggregation + deletion |
| AI interaction logs | 30 days | Operational (de-identified) | Automatic purge |
| Backups | 30 days rolling | Business continuity | Automatic overwrite |

---

## 7. Access Control Matrix

| Data Type | Platform Admin | Practice Admin | Practitioner | Receptionist |
|-----------|---------------|---------------|-------------|-------------|
| Patient demographics (PII) | Read (cross-tenant) | Full CRUD | Read | Read + Create |
| Clinical records (PHI) | No access | Read (audit) | Full CRUD | No access |
| Billing / financial | Read (cross-tenant) | Full CRUD | Read own | Read |
| Audit logs | Full access | Read own practice | No access | No access |
| System configuration | Full access | Practice settings | No access | No access |
| Consent records | Read (cross-tenant) | Read + record | Read | Record |

---

*This document is provided for vendor assessment purposes only. Distribution or reproduction without written consent from Visio Research Labs (Pty) Ltd is prohibited.*

**Contact:** David Hampton, Managing Director
**Email:** david@visiolabs.co.za
**Entity:** Visio Research Labs (Pty) Ltd
