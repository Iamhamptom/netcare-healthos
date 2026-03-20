# VisioHealth OS — Sub-Processor Register

**Third-Party Data Processor Disclosure**
**Prepared by:** Visio Research Labs (Pty) Ltd
**Document Classification:** Confidential — For Vendor Assessment Only
**Version:** 2.0
**Date:** March 2026
**Next Review:** September 2026

---

## 1. Purpose

This register identifies all third-party sub-processors engaged by Visio Research Labs (Pty) Ltd in the delivery of the VisioHealth OS platform. It is maintained in compliance with POPIA Section 21 (security safeguards for operators) and is updated whenever a sub-processor is added, removed, or materially changes its processing activities.

Clients will be notified 30 days in advance of any new sub-processor addition and may object in accordance with the terms of our Data Processing Agreement.

---

## 2. Sub-Processor Register

### 2.1 Supabase Inc.

| Field | Detail |
|-------|--------|
| **Entity** | Supabase Inc. |
| **Registered Address** | 970 Toa Payoh North, #07-04, Singapore 318992 (US-incorporated, Delaware) |
| **Purpose** | Managed PostgreSQL database hosting, authentication services, object storage, real-time subscriptions |
| **Data Processed** | All patient data (PII, PHI), financial records, audit logs, consent records, user credentials (hashed) |
| **Data Location** | EU (eu-west-1, AWS Frankfurt) |
| **Encryption** | AES-256 at rest, TLS 1.3 in transit, encrypted backups |
| **Security Certifications** | SOC 2 Type II (annual audit) |
| **DPA Status** | Executed — Supabase standard DPA incorporating EU SCCs |
| **Backup & Recovery** | Daily automated backups, point-in-time recovery (30-day retention) |
| **Access Controls** | Database access restricted to application connections only; no direct public access. Row-Level Security enforced at database level. |
| **Sub-processor of Sub-processor** | AWS (eu-west-1) — SOC 2 Type II, ISO 27001, PCI DSS |

---

### 2.2 Vercel Inc.

| Field | Detail |
|-------|--------|
| **Entity** | Vercel Inc. |
| **Registered Address** | 440 N Barranca Ave #4133, Covina, CA 91723, United States |
| **Purpose** | Application hosting (serverless compute), global CDN, edge network, CI/CD deployment pipeline |
| **Data Processed** | Application code, environment variables (encrypted), request metadata (IP, user-agent). No patient data is stored or cached at the edge layer. |
| **Data Location** | Global edge network with South African point of presence. Serverless compute in US-East. |
| **Encryption** | TLS 1.3 in transit, encrypted environment variable storage |
| **Security Certifications** | SOC 2 Type II (annual audit) |
| **DPA Status** | Executed — Vercel standard DPA |
| **DDoS Protection** | Built-in DDoS mitigation and WAF at edge layer |
| **Access Controls** | Team-based access control, MFA enforced for deployment access |
| **Sub-processor of Sub-processor** | AWS (multiple regions) — SOC 2 Type II, ISO 27001 |

---

### 2.3 Anthropic PBC

| Field | Detail |
|-------|--------|
| **Entity** | Anthropic PBC |
| **Registered Address** | 548 Market St, San Francisco, CA 94104, United States |
| **Purpose** | AI language model API for clinical decision support suggestions, patient intake assistance, and follow-up recommendations |
| **Data Processed** | De-identified clinical context only. Explicitly excluded: patient names, ID numbers, contact details, medical aid numbers, and any directly identifying information. |
| **Data Location** | United States |
| **Encryption** | TLS 1.3 in transit, API key authentication |
| **Security Certifications** | ISO 27001, SOC 2 Type II |
| **DPA Status** | Governed by Anthropic API Terms of Service (no training on API inputs) |
| **Data Retention by Processor** | Anthropic does not retain API inputs/outputs for training. 30-day log retention for abuse monitoring, then deleted. |
| **De-identification Safeguard** | All data is de-identified server-side before API transmission. De-identification is enforced at the application layer — no client-side AI API calls are possible. |

---

### 2.4 Google LLC (Gemini AI)

| Field | Detail |
|-------|--------|
| **Entity** | Google LLC |
| **Registered Address** | 1600 Amphitheatre Parkway, Mountain View, CA 94043, United States |
| **Purpose** | AI language model API (Gemini) used as a secondary/fallback AI service for clinical suggestions and natural language processing |
| **Data Processed** | De-identified clinical context only. Same exclusions as Anthropic (no PII/PHI transmitted). |
| **Data Location** | United States |
| **Encryption** | TLS 1.3 in transit, API key authentication |
| **Security Certifications** | ISO 27001, SOC 2 Type II, FedRAMP |
| **DPA Status** | Governed by Google Cloud API Terms of Service / Data Processing Amendment |
| **Data Retention by Processor** | Google Gemini API does not use API data for training (when using paid API tier). |
| **De-identification Safeguard** | Same server-side de-identification applied as for Anthropic. |

---

### 2.5 Twilio Inc.

| Field | Detail |
|-------|--------|
| **Entity** | Twilio Inc. |
| **Registered Address** | 101 Spear Street, 5th Floor, San Francisco, CA 94105, United States |
| **Purpose** | WhatsApp Business API for patient appointment reminders, follow-up notifications, and recall campaigns |
| **Data Processed** | Patient first name, mobile phone number, appointment date and time. No clinical data, no surname, no ID number, no medical information. |
| **Data Location** | United States (message routing) |
| **Encryption** | TLS 1.3 in transit, encrypted message storage |
| **Security Certifications** | SOC 2 Type II, ISO 27001, HIPAA (BAA available) |
| **DPA Status** | Executed — Twilio DPA with EU SCCs |
| **Data Retention by Processor** | Message logs retained per Twilio's retention policy (configurable). We configure 30-day retention. |
| **Consent Safeguard** | Messages only sent to patients who have explicitly opted in to WhatsApp communications. Opt-in is tracked in our consent management system. |

---

### 2.6 ElevenLabs Inc.

| Field | Detail |
|-------|--------|
| **Entity** | ElevenLabs Inc. |
| **Registered Address** | New York, United States |
| **Purpose** | Text-to-speech voice synthesis for optional voice interface in patient-facing chatbot and agent responses |
| **Data Processed** | Synthesised text prompts only. No patient data, PII, or PHI is transmitted. Text is generated server-side from de-identified templates. |
| **Data Location** | United States |
| **Encryption** | TLS 1.3 in transit |
| **Security Certifications** | SOC 2 (in progress as of 2026) |
| **DPA Status** | Governed by ElevenLabs API Terms of Service |
| **Data Retention by Processor** | No persistent storage of synthesised text inputs |
| **Safeguard** | No patient-identifiable data is included in any text sent for synthesis. Voice output is streamed to the client and not stored. |

---

### 2.7 Paystack (Payments)

| Field | Detail |
|-------|--------|
| **Entity** | Paystack Payments Limited (Stripe subsidiary) |
| **Registered Address** | Lagos, Nigeria / Cape Town, South Africa |
| **Purpose** | Payment processing for patient co-payments and practice subscription billing |
| **Data Processed** | Transaction amounts, payment method tokens (no raw card data touches our servers). Payer name and email for receipts. |
| **Data Location** | Nigeria / South Africa |
| **Encryption** | TLS 1.3 in transit, PCI DSS Level 1 compliant infrastructure |
| **Security Certifications** | PCI DSS Level 1 |
| **DPA Status** | Governed by Paystack Merchant Agreement and Privacy Policy |
| **Safeguard** | Redirect/tokenised payment flow — no cardholder data is processed or stored by VisioHealth OS. |

---

### 2.8 Sentry (Functional Software Inc.)

| Field | Detail |
|-------|--------|
| **Entity** | Functional Software Inc. (trading as Sentry) |
| **Registered Address** | 45 Fremont Street, 8th Floor, San Francisco, CA 94105, United States |
| **Purpose** | Application error monitoring, performance tracking, and crash reporting |
| **Data Processed** | Application error telemetry: stack traces, request URLs, browser metadata. Explicitly excluded: patient data, PII, PHI, authentication tokens. |
| **Data Location** | United States |
| **Encryption** | TLS 1.3 in transit, encrypted at rest |
| **Security Certifications** | SOC 2 Type II |
| **DPA Status** | Executed — Sentry DPA with EU SCCs |
| **Safeguard** | Sentry SDK configured with data scrubbing rules to strip any inadvertent PII from error reports. Sensitive fields (cookies, authorization headers) are excluded from capture. |

---

## 3. Change Notification Process

| Event | Notification Period | Client Action |
|-------|-------------------|---------------|
| New sub-processor added | 30 days advance notice | May object within 14 days |
| Sub-processor removed | Notification at next register update | Informational |
| Material change in processing | 30 days advance notice | May object within 14 days |
| Security incident at sub-processor | Within 72 hours of our awareness | Per incident response plan |

---

## 4. Sub-Processor Assessment Criteria

Before engaging any new sub-processor, Visio Research Labs evaluates:

1. **Security certifications** (SOC 2, ISO 27001, or equivalent)
2. **Data processing agreement** availability and terms
3. **Data location** and cross-border transfer implications
4. **Encryption** standards (in transit and at rest)
5. **Data retention** and deletion capabilities
6. **Breach notification** commitments
7. **Relevance of data shared** — principle of data minimisation applied

---

*This document is provided for vendor assessment purposes only. Distribution or reproduction without written consent from Visio Research Labs (Pty) Ltd is prohibited.*

**Contact:** David Hampton, Managing Director
**Email:** david@visiolabs.co.za
**Entity:** Visio Research Labs (Pty) Ltd
