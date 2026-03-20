# POPIA OPERATOR AGREEMENT

## Data Processing Agreement in Terms of the Protection of Personal Information Act 4 of 2013

**DRAFT — Subject to legal review by both parties before execution**

---

**Date:** ____________________

**Between:**

**Responsible Party (Data Controller):**
Netcare Limited
Registration No.: 1996/015890/06
Address: 76 Maude Street, Sandton, 2196, Gauteng, South Africa
("Netcare" or "the Responsible Party")

**and**

**Operator (Data Processor):**
Touchline Agency (Pty) Ltd, trading as VisioHealth
Registration No.: ____________________
Address: ____________________
("VisioHealth" or "the Operator")

(each a "Party" and collectively the "Parties")

---

## RECITALS

A. Netcare is a Responsible Party as defined in Section 1 of the Protection of Personal Information Act 4 of 2013 ("POPIA") and processes personal information of data subjects in the course of its healthcare operations.

B. VisioHealth provides a cloud-based healthcare operating system platform ("VisioHealth OS") that offers claims validation, clinical coding assistance, practice management, patient engagement, and analytics services.

C. In providing the VisioHealth OS platform to Netcare, VisioHealth will process personal information on behalf of Netcare in its capacity as an Operator as defined in Section 1 of POPIA.

D. Section 21 of POPIA requires that an Operator processes personal information only with the knowledge or authorisation of the Responsible Party and treats it as confidential, subject to appropriate security safeguards established by contract.

E. The Parties wish to record the terms and conditions governing VisioHealth's processing of personal information on behalf of Netcare.

---

## 1. DEFINITIONS AND INTERPRETATION

**1.1** Unless the context indicates otherwise, capitalised terms in this Agreement have the meanings given to them in POPIA, and the following definitions apply:

"Agreement" means this POPIA Operator Agreement, including all annexures;

"Data Breach" means a breach of security leading to the accidental or unlawful destruction, loss, alteration, unauthorised disclosure of, or access to, personal information transmitted, stored, or otherwise processed;

"Data Subject" means the natural or juristic person to whom personal information relates, including patients, staff, and practitioners;

"Information Regulator" means the Information Regulator established in terms of Section 39 of POPIA;

"Main Agreement" means the commercial services agreement between the Parties for the provision of VisioHealth OS services, as may be amended from time to time;

"Personal Information" has the meaning given in Section 1 of POPIA and, for the purposes of this Agreement, includes the categories of information specified in Annexure A;

"Processing" has the meaning given in Section 1 of POPIA and includes any operation or activity concerning personal information as described in Annexure A;

"Sub-processor" means any third party engaged by the Operator to process Personal Information on behalf of the Responsible Party.

**1.2** This Agreement is supplementary to and forms part of the Main Agreement. In the event of any conflict between this Agreement and the Main Agreement with respect to the processing of Personal Information, this Agreement shall prevail.

---

## 2. ROLES AND RESPONSIBILITIES

**2.1** Netcare is the Responsible Party and determines the purpose and means of the processing of Personal Information.

**2.2** VisioHealth is the Operator and processes Personal Information only on behalf of and under the instruction of Netcare, in accordance with this Agreement and the Main Agreement.

**2.3** VisioHealth shall not process Personal Information for any purpose other than as set out in this Agreement or as instructed by Netcare in writing.

---

## 3. PURPOSE OF PROCESSING

**3.1** VisioHealth shall process Personal Information solely for the following purposes:

(a) Claims validation and adjudication support, including ICD-10 code verification, NAPPI code validation, and tariff compliance checking;

(b) Clinical coding assistance, including AI-assisted code suggestions and autocorrection;

(c) Patient administration, including appointment scheduling, check-in/out processing, and recall management;

(d) Billing and invoicing, including medical aid claims submission via claims switches (MediSwitch, Healthbridge);

(e) Analytics and reporting, including practice performance dashboards, claims analytics, and operational metrics;

(f) Patient engagement, including appointment reminders and follow-up notifications (via opt-in WhatsApp and SMS);

(g) Audit logging and compliance reporting as required by POPIA, HPCSA, and applicable healthcare regulations.

---

## 4. CATEGORIES OF PERSONAL INFORMATION PROCESSED

**4.1** The categories of Personal Information processed under this Agreement are detailed in Annexure A and include:

(a) **Patient demographics:** name, surname, identity number, date of birth, gender, contact details (phone, email, address);

(b) **Medical aid details:** medical aid scheme, plan, membership number, principal member details, dependant information;

(c) **Clinical data:** ICD-10 diagnostic codes, procedure codes, NAPPI medication codes, clinical notes (as entered by authorised practitioners), vitals, allergies, and medication records;

(d) **Financial data:** invoice amounts, payment records, co-payment information (no raw card data — tokenised via PCI DSS-compliant payment processor);

(e) **Practitioner data:** name, HPCSA registration number, practice number, professional qualifications;

(f) **Operational data:** appointment schedules, booking records, consent records, audit trail entries.

**4.2** VisioHealth shall not process special personal information as defined in Section 26 of POPIA (including health data beyond that required for the stated purposes) except as expressly authorised by Netcare and where a lawful basis under Section 27 of POPIA exists.

---

## 5. SECURITY MEASURES

**5.1** VisioHealth shall implement and maintain appropriate technical and organisational security measures to protect Personal Information against the risk of loss, damage, unauthorised destruction, or unlawful access, as required by Section 19 of POPIA. These measures include, without limitation:

### 5.1.1 Encryption

(a) All Personal Information at rest is encrypted using AES-256-GCM encryption (managed by the database provider);

(b) All Personal Information in transit is encrypted using TLS 1.3 (minimum TLS 1.2);

(c) HSTS headers are enforced with a minimum max-age of two years, including subdomains and preload;

(d) Database connections use TLS-encrypted PostgreSQL connections (SSL mode: require).

### 5.1.2 Access Controls

(a) Role-based access control (RBAC) with four defined roles: Platform Admin, Practice Admin, Practitioner, and Receptionist;

(b) Row-Level Security (RLS) at the PostgreSQL database level, ensuring data isolation between tenants;

(c) JWT-based authentication with httpOnly, Secure, SameSite cookies;

(d) Multi-factor authentication (MFA) via TOTP, available for all users and mandatable per tenant;

(e) API key authentication with SHA-256 hashing for system-to-system integrations;

(f) Principle of least privilege applied to all access grants.

### 5.1.3 Audit Logging

(a) Immutable audit trail recording: user identity, action performed, timestamp (UTC), affected resource, source IP, and tenant context;

(b) Audit logs retained for a minimum of 7 years in compliance with HPCSA record-keeping requirements;

(c) Structured logging with PII redaction at all log levels.

### 5.1.4 Application Security

(a) Content Security Policy (CSP) with 11 restrictive directives;

(b) 7 security headers enforced on all responses (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, X-XSS-Protection, HSTS, Permissions-Policy, CSP);

(c) Rate limiting on all API endpoints;

(d) Input validation and parameterised database queries (Prisma ORM);

(e) No client-side AI API access — all AI service calls are server-side with de-identified data.

### 5.1.5 Infrastructure Security

(a) Serverless deployment on Vercel (SOC 2 Type II certified) with built-in DDoS protection;

(b) Database hosted on Supabase (SOC 2 Type II certified) in EU region (eu-west-1);

(c) No direct public database access — connections restricted to authenticated application origins;

(d) Automated daily database backups with point-in-time recovery (30-day retention).

---

## 6. SUB-PROCESSORS

**6.1** Netcare hereby provides general authorisation for VisioHealth to engage the Sub-processors listed in Annexure B, subject to the conditions in this Section 6.

**6.2** VisioHealth shall:

(a) Provide Netcare with at least 30 days' written notice before engaging any new Sub-processor or making any material change to existing Sub-processor arrangements;

(b) Provide Netcare with the opportunity to object to the engagement of a new Sub-processor within 14 days of receiving notice;

(c) Ensure that each Sub-processor is bound by data protection obligations no less protective than those set out in this Agreement;

(d) Remain fully liable to Netcare for the acts and omissions of its Sub-processors.

**6.3** The current list of approved Sub-processors is set out in Annexure B.

---

## 7. DATA BREACH NOTIFICATION

**7.1** In the event of a Data Breach involving Personal Information processed under this Agreement, VisioHealth shall:

(a) Notify Netcare without undue delay and in no event later than 24 hours after becoming aware of the Data Breach;

(b) Provide Netcare with the following information (to the extent available at the time of notification, with supplementary information to follow as it becomes available):

   (i) A description of the nature of the breach, including the categories and approximate number of Data Subjects affected;

   (ii) The categories and approximate volume of Personal Information affected;

   (iii) The likely consequences of the breach;

   (iv) The measures taken or proposed to be taken to address the breach and mitigate its effects;

   (v) The identity of any Sub-processor involved.

**7.2** Netcare, as the Responsible Party, shall be responsible for:

(a) Determining whether notification to the Information Regulator is required under Section 22 of POPIA;

(b) Notifying the Information Regulator and affected Data Subjects as required by POPIA;

(c) Directing VisioHealth on any additional remediation steps required.

**7.3** VisioHealth shall cooperate fully with Netcare in the investigation and remediation of any Data Breach, including preserving evidence and providing access to relevant systems, logs, and personnel.

**7.4** VisioHealth shall not notify the Information Regulator or any Data Subject directly regarding a Data Breach unless instructed to do so by Netcare or required to do so by applicable law.

---

## 8. DATA SUBJECT REQUESTS

**8.1** VisioHealth shall assist Netcare in fulfilling its obligations to respond to requests from Data Subjects exercising their rights under POPIA, including rights of access (Section 23), correction (Section 24), and deletion (Section 24).

**8.2** If VisioHealth receives a request directly from a Data Subject, VisioHealth shall:

(a) Promptly redirect the Data Subject to Netcare;

(b) Notify Netcare of the request within 2 business days;

(c) Not respond to the Data Subject's request directly unless instructed to do so by Netcare.

**8.3** VisioHealth shall provide Netcare with the technical capability to export, correct, or delete Personal Information of specific Data Subjects within the VisioHealth OS platform.

---

## 9. DATA RETENTION AND RETURN/DELETION

**9.1** VisioHealth shall retain Personal Information only for as long as necessary to fulfil the purposes set out in this Agreement, or as required by applicable law.

**9.2** The following retention periods apply:

| Data Category | Minimum Retention | Basis |
|--------------|-------------------|-------|
| Patient clinical records | 7 years post last encounter | HPCSA requirements |
| Audit logs | 7 years | HPCSA requirements |
| Financial/billing records | 5 years | SARS requirements |
| Session/analytics data | 90 days (then aggregated/anonymised) | Operational |

**9.3** Upon termination or expiry of the Main Agreement, VisioHealth shall, at Netcare's election:

(a) Return all Personal Information to Netcare in a structured, machine-readable format (JSON, CSV, or FHIR R4 resources as applicable) within 30 days; or

(b) Securely delete all Personal Information within 30 days and provide written certification of destruction.

**9.4** VisioHealth may retain copies of Personal Information to the extent required by applicable law, provided that such retained data remains subject to the confidentiality and security obligations of this Agreement.

---

## 10. AUDIT RIGHTS

**10.1** Netcare, or its authorised representative, shall have the right to:

(a) Conduct audits of VisioHealth's processing activities under this Agreement, upon 30 days' written notice, during normal business hours, and no more than once per calendar year (unless a Data Breach has occurred);

(b) Request and receive copies of relevant security certifications, audit reports, and compliance assessments held by VisioHealth or its Sub-processors;

(c) Request information reasonably necessary to demonstrate compliance with POPIA.

**10.2** VisioHealth shall cooperate fully with any audit conducted under this Section and shall make available all information, systems, and personnel reasonably necessary to conduct the audit.

**10.3** Netcare shall bear its own costs in conducting any audit. VisioHealth shall bear its own costs of cooperating with the audit.

**10.4** Audit findings that identify non-compliance with this Agreement shall be remediated by VisioHealth within an agreed timeframe, which shall not exceed 30 days for material findings.

---

## 11. CROSS-BORDER TRANSFERS

**11.1** VisioHealth acknowledges that certain Sub-processors are located outside the Republic of South Africa, as detailed in Annexure B.

**11.2** VisioHealth warrants that all cross-border transfers of Personal Information comply with Section 72 of POPIA, specifically that:

(a) The recipient is subject to a law, binding corporate rules, or binding agreement that provides an adequate level of protection substantially similar to POPIA; or

(b) The Data Subject has consented to the transfer; or

(c) The transfer is necessary for the performance of a contract between the Data Subject and the Responsible Party; or

(d) The transfer is for the benefit of the Data Subject and it is not reasonably practicable to obtain the consent of the Data Subject.

**11.3** The following cross-border transfer safeguards are in place:

| Sub-processor | Location | Safeguard |
|--------------|----------|-----------|
| Supabase (database) | EU (eu-west-1) | SOC 2 Type II, DPA with EU SCCs |
| Vercel (hosting) | US/Global | SOC 2 Type II, DPA |
| Anthropic (AI) | US | De-identified data only — no PII transmitted |
| Google AI (AI) | US | De-identified data only — no PII transmitted |
| Twilio (messaging) | US | SOC 2 Type II, ISO 27001, DPA with EU SCCs |
| Paystack (payments) | NG/ZA | PCI DSS Level 1, tokenised — no card data |
| ElevenLabs (voice) | US | No patient data transmitted |
| Sentry (monitoring) | US | SOC 2 Type II, DPA — PII scrubbing configured |

**11.4** VisioHealth shall notify Netcare before transferring Personal Information to any new jurisdiction not listed above.

---

## 12. AI PROCESSING SAFEGUARDS

**12.1** VisioHealth uses artificial intelligence services (Anthropic Claude, Google Gemini) to provide clinical decision support suggestions and natural language processing capabilities. The following safeguards apply:

(a) All data transmitted to AI services is de-identified server-side before transmission. Patient names, identity numbers, contact details, medical aid numbers, and all directly identifying information are stripped;

(b) AI services do not retain API inputs or outputs for model training purposes;

(c) AI-generated suggestions are advisory only — all clinical decisions remain the responsibility of the treating practitioner;

(d) No client-side AI API access is possible — all AI calls originate from the server;

(e) AI service providers are listed as Sub-processors in Annexure B.

---

## 13. TERM AND TERMINATION

**13.1** This Agreement shall commence on the date of execution and shall remain in force for the duration of the Main Agreement.

**13.2** This Agreement shall automatically terminate upon the termination or expiry of the Main Agreement, subject to the survival of obligations relating to data retention, return/deletion, and confidentiality.

**13.3** Netcare may terminate this Agreement immediately upon written notice if:

(a) VisioHealth is in material breach of this Agreement and fails to remedy such breach within 30 days of receiving written notice;

(b) VisioHealth undergoes a change of control that Netcare reasonably determines may affect the security of Personal Information;

(c) VisioHealth becomes insolvent, enters business rescue, or is wound up.

---

## 14. LIABILITY

**14.1** VisioHealth shall indemnify Netcare against any loss, damage, cost, or expense (including reasonable legal fees) arising from:

(a) A breach of this Agreement by VisioHealth or its Sub-processors;

(b) Any claim by a Data Subject or the Information Regulator arising from VisioHealth's failure to comply with its obligations under this Agreement or POPIA.

**14.2** The liability provisions of the Main Agreement shall apply to this Agreement to the extent not inconsistent with this Section.

---

## 15. GENERAL PROVISIONS

**15.1 Governing Law.** This Agreement shall be governed by the laws of the Republic of South Africa.

**15.2 Jurisdiction.** The Parties submit to the exclusive jurisdiction of the High Court of South Africa, Gauteng Division, Johannesburg.

**15.3 Amendment.** No amendment to this Agreement shall be valid unless made in writing and signed by both Parties.

**15.4 Severability.** If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.

**15.5 Counterparts.** This Agreement may be executed in counterparts. Electronic signatures shall be deemed original signatures.

---

## SIGNED

**For and on behalf of Netcare Limited (Responsible Party):**

Name: ____________________

Title: ____________________

Signature: ____________________

Date: ____________________

---

**For and on behalf of Touchline Agency (Pty) Ltd t/a VisioHealth (Operator):**

Name: ____________________

Title: ____________________

Signature: ____________________

Date: ____________________

---

## ANNEXURE A — DESCRIPTION OF PROCESSING

| Element | Detail |
|---------|--------|
| **Data Subjects** | Patients, practitioners, practice staff, and administrative users of practices managed by or affiliated with Netcare |
| **Categories of Personal Information** | Patient demographics, medical aid details, ICD-10 diagnostic codes, procedure codes, NAPPI codes, clinical notes, vitals, allergies, medications, appointment records, billing/invoice data, consent records, audit trail entries, practitioner registration details |
| **Special Personal Information (s26)** | Health data (diagnostic codes, clinical notes, vitals, medications) — processed under s27(1)(a) (consent) and s27(1)(d) (medical purposes by healthcare provider) |
| **Purpose of Processing** | Claims validation, clinical coding assistance, patient administration, billing, analytics, patient engagement (reminders/follow-ups), audit and compliance |
| **Nature of Processing** | Collection, recording, organisation, storage, retrieval, consultation, use, transmission (to Sub-processors), restriction, erasure |
| **Duration of Processing** | For the duration of the Main Agreement, plus applicable retention periods |

---

## ANNEXURE B — APPROVED SUB-PROCESSORS

| Sub-processor | Purpose | Data Processed | Location | Certification |
|--------------|---------|----------------|----------|---------------|
| Supabase Inc. | Database hosting, authentication, storage | All personal information (encrypted) | EU (eu-west-1) | SOC 2 Type II |
| Vercel Inc. | Application hosting, CDN, CI/CD | Application code, request metadata (no patient data cached) | US/Global (SA edge) | SOC 2 Type II |
| Anthropic PBC | AI clinical decision support | De-identified clinical context only (no PII) | US | ISO 27001, SOC 2 Type II |
| Google LLC (Gemini) | AI fallback clinical support | De-identified clinical context only (no PII) | US | ISO 27001, SOC 2 Type II, FedRAMP |
| Twilio Inc. | WhatsApp/SMS patient notifications | First name, mobile number, appointment date/time only | US | SOC 2 Type II, ISO 27001 |
| ElevenLabs Inc. | Text-to-speech voice synthesis | Synthesised text only (no patient data) | US | SOC 2 (pending) |
| Paystack Payments Ltd | Payment processing | Transaction amounts, payment tokens (no card data) | NG/ZA | PCI DSS Level 1 |
| Functional Software Inc. (Sentry) | Error monitoring, performance tracking | Application error telemetry (PII scrubbed) | US | SOC 2 Type II |

---

*DRAFT — This document is a template provided for discussion purposes only and does not constitute legal advice. Both parties should obtain independent legal counsel before execution. This template is intended to demonstrate VisioHealth's understanding of POPIA operator obligations and to serve as a starting point for negotiation.*
