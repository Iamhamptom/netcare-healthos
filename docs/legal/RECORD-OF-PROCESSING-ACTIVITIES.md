# Record of Processing Activities (ROPA)

**Responsible Party:** Touchline Agency (Pty) Ltd t/a VisioHealth
**Information Officer:** David M. Hampton, Managing Director
**Contact:** davidhampton@visiocorp.co
**Last Updated:** 2026-03-21

---

## Processing Activities

### 1. Patient Registration

| Field | Detail |
|---|---|
| **Purpose** | Register patients for healthcare services; create and maintain patient demographic records |
| **Lawful Basis** | Consent (POPIA s11(1)(a)) and Legal Obligation (HPCSA record-keeping requirements) |
| **Data Categories** | Name, ID number, date of birth, gender, contact details (phone, email, address), emergency contact, medical aid details, blood type |
| **Data Subjects** | Patients |
| **Recipients** | Treating healthcare practitioners, practice administrators, medical aid schemes (for claims) |
| **Retention Period** | Minimum 5 years after last consultation (adults); until age 21 (minors) per HPCSA guidelines. Never auto-deleted. |
| **Cross-border Transfers** | Supabase (EU), Vercel (US) |

### 2. Appointment Booking

| Field | Detail |
|---|---|
| **Purpose** | Schedule, confirm, and manage patient appointments; send reminders; track no-shows |
| **Lawful Basis** | Consent (POPIA s11(1)(a)) and Legitimate Interest (POPIA s11(1)(f) — operational necessity) |
| **Data Categories** | Patient name, phone, email, service type, scheduled date/time, booking source, lead source, deposit information |
| **Data Subjects** | Patients, prospective patients (public bookings) |
| **Recipients** | Practice staff, patients (via notifications) |
| **Retention Period** | Retained as part of clinical record (never auto-deleted per HPCSA) |
| **Cross-border Transfers** | Supabase (EU), Vercel (US) |

### 3. Claims Validation & Submission

| Field | Detail |
|---|---|
| **Purpose** | Validate, submit, and track medical aid claims via switching houses (Healthbridge, Medikredit, SwitchOn) |
| **Lawful Basis** | Legal Obligation (medical aid billing requirements) and Consent (patient consent for claims submission) |
| **Data Categories** | Patient name, ID number, medical aid scheme, membership number, dependent code, ICD-10 codes, CPT codes, NAPPI codes, procedure descriptions, amounts, provider details |
| **Data Subjects** | Patients, healthcare practitioners |
| **Recipients** | Medical aid schemes, switching houses (Healthbridge, Medikredit, SwitchOn), practice billing staff |
| **Retention Period** | 5 years (SARS tax requirement) for financial records; claims analysis data retained 12 months (POPIA minimal retention) |
| **Cross-border Transfers** | Supabase (EU) |

### 4. AI Clinical Coding & Decision Support

| Field | Detail |
|---|---|
| **Purpose** | AI-assisted clinical triage, follow-up recommendations, intake processing, billing code suggestions, and scheduling |
| **Lawful Basis** | Consent (POPIA s11(1)(a)) — patients informed of AI use; practitioner retains clinical responsibility |
| **Data Categories** | De-identified or minimally-identified clinical information: symptoms, conditions, treatment context. No raw ID numbers sent to AI. |
| **Data Subjects** | Patients (de-identified data only) |
| **Recipients** | Anthropic (Claude AI) — US-based processor; responses not stored by AI provider for training |
| **Retention Period** | AI conversation logs retained 12 months; clinical decisions recorded in medical records (never auto-deleted) |
| **Cross-border Transfers** | Anthropic (US) — consent-based, only de-identified data |

### 5. Clinical Records Management

| Field | Detail |
|---|---|
| **Purpose** | Create, store, and retrieve patient medical records including consultations, procedures, lab results, imaging, referrals, and clinical notes |
| **Lawful Basis** | Legal Obligation (HPCSA record-keeping) and Consent (POPIA s26-27 — special personal information for health data) |
| **Data Categories** | Consultation notes, diagnoses (ICD-10), treatment plans, medications, allergies, vitals, lab results, imaging, referral information |
| **Data Subjects** | Patients |
| **Recipients** | Treating healthcare practitioners, referring practitioners (via referral feedback), medical aid schemes (for claims) |
| **Retention Period** | Minimum 5 years after last consultation (adults); until age 21 (minors). Never auto-deleted per HPCSA. |
| **Cross-border Transfers** | Supabase (EU) |

### 6. Team & Staff Management

| Field | Detail |
|---|---|
| **Purpose** | Manage practice staff accounts, roles, access permissions, and audit trails |
| **Lawful Basis** | Legitimate Interest (POPIA s11(1)(f)) and Legal Obligation (HPCSA — practitioner identification in records) |
| **Data Categories** | Name, email, role, access permissions, login activity, audit logs |
| **Data Subjects** | Practice staff (administrators, doctors, nurses, receptionists) |
| **Recipients** | Practice administrators, platform administrators |
| **Retention Period** | Duration of employment/access + 7 years for audit logs (HPCSA record-keeping) |
| **Cross-border Transfers** | Supabase (EU), Vercel (US) |

### 7. Billing & Invoicing

| Field | Detail |
|---|---|
| **Purpose** | Generate invoices, record payments, track medical aid claims, manage accounts receivable |
| **Lawful Basis** | Legal Obligation (SARS tax compliance, medical aid billing) and Contractual Necessity (POPIA s11(1)(b)) |
| **Data Categories** | Patient name, invoice details, ICD-10 codes, line items, amounts, payment method, medical aid claim status, payment references |
| **Data Subjects** | Patients |
| **Recipients** | Practice billing staff, medical aid schemes, SARS (tax records) |
| **Retention Period** | 5 years (SARS requirement) |
| **Cross-border Transfers** | Supabase (EU) |

### 8. WhatsApp/SMS/Email Messaging

| Field | Detail |
|---|---|
| **Purpose** | Send appointment reminders, follow-up messages, recall notifications, and custom communications to patients |
| **Lawful Basis** | Consent (POPIA s11(1)(a)) for marketing; Legitimate Interest (POPIA s11(1)(f)) for appointment reminders and clinical follow-ups |
| **Data Categories** | Phone number, email address, patient name, message content, delivery status, template type |
| **Data Subjects** | Patients |
| **Recipients** | Twilio (WhatsApp/SMS delivery — US), Resend (email delivery — US), patients |
| **Retention Period** | 6 months (operational relevance) |
| **Cross-border Transfers** | Twilio (US) — consent-based, phone numbers only; Resend (US) — email addresses only |

---

## Cross-Border Transfer Adequacy Assessment (POPIA Section 72)

POPIA Section 72 permits cross-border transfers of personal information only where the recipient country has adequate data protection laws, or where other safeguards are in place.

### 1. Supabase (EU — AWS eu-west-1)

| Assessment | Detail |
|---|---|
| **Location** | European Union (Ireland, eu-west-1) |
| **Adequacy** | **Adequate.** The EU operates under GDPR, which provides an equivalent or higher level of protection than POPIA. South Africa's Information Regulator recognises GDPR jurisdictions as adequate under s72(1)(a). |
| **Safeguards** | Data encrypted at rest (AES-256) and in transit (TLS 1.2+). SOC 2 Type II certified. Row-level security enforced. |
| **Data Transferred** | All platform data (patient records, billing, audit logs, staff accounts) |

### 2. Vercel (United States)

| Assessment | Detail |
|---|---|
| **Location** | United States |
| **Adequacy** | **Consent-based transfer under s72(1)(b).** The US does not have omnibus data protection legislation equivalent to POPIA. Transfer is lawful based on: (1) user consent disclosed in the Privacy Policy, (2) contractual necessity for hosting the application. |
| **Safeguards** | SOC 2 Type II certified. Data encrypted in transit. Serverless architecture — no persistent storage of personal data on Vercel infrastructure beyond application hosting. |
| **Data Transferred** | Application hosting, server-side rendering, API route execution. No persistent patient data stored on Vercel. |

### 3. Anthropic / Claude AI (United States)

| Assessment | Detail |
|---|---|
| **Location** | United States |
| **Adequacy** | **Consent-based transfer under s72(1)(b).** |
| **Safeguards** | Only de-identified or minimally-identified clinical data is sent. AI provider does not store data for training. Data processing agreement in place. Real-time inference only — no data retention by processor. |
| **Data Transferred** | De-identified clinical context for AI decision support (no raw ID numbers, no full patient records) |

### 4. Google AI / Gemini (United States)

| Assessment | Detail |
|---|---|
| **Location** | United States |
| **Adequacy** | **Consent-based transfer under s72(1)(b).** |
| **Safeguards** | Only de-identified data sent for AI processing. Google Cloud SOC 2/3, ISO 27001 certified. No training on customer data per API terms of service. |
| **Data Transferred** | De-identified clinical context only |

### 5. Twilio (United States)

| Assessment | Detail |
|---|---|
| **Location** | United States |
| **Adequacy** | **Consent-based transfer under s72(1)(b).** |
| **Safeguards** | SOC 2 Type II, ISO 27001. Data limited to phone numbers and message content required for delivery. Messages not stored beyond delivery confirmation period. |
| **Data Transferred** | Patient phone numbers and message content (appointment reminders, recall notices) |

---

## Review Schedule

This ROPA is reviewed and updated:
- Quarterly (minimum)
- When new processing activities are added
- When new third-party processors are engaged
- When data categories or retention periods change

**Next Review Due:** 2026-06-21
