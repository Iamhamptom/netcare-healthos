# VisioHealth OS Technical Architecture

**Vendor Assessment Document**
**Prepared by:** Visio Research Labs (Pty) Ltd
**Document Classification:** Confidential — For Vendor Assessment Only
**Version:** 2.0
**Date:** March 2026

---

## 1. Executive Summary

VisioHealth OS is a cloud-native, multi-tenant healthcare practice management platform purpose-built for the South African private healthcare market. The platform provides AI-assisted clinical workflows, patient engagement, billing, and compliance management through a modern web-based interface optimised for both desktop and tablet (iPad) use in clinical environments.

---

## 2. High-Level System Architecture

```
                        VISIOHEALTH OS — SYSTEM ARCHITECTURE
 ============================================================================

  CLIENTS                    EDGE / CDN                 APPLICATION TIER
 +-----------------+     +------------------+      +----------------------+
 |                 |     |                  |      |                      |
 |  Web Browser    |     |  Vercel Edge     |      |   Next.js App        |
 |  (Desktop/iPad) | --> |  Network         | ---> |   Server (Node.js)   |
 |                 |     |                  |      |                      |
 |  TLS 1.3        |     |  Global CDN      |      |  +----------------+ |
 |  encrypted      |     |  with SA edge    |      |  | API Routes     | |
 |                 |     |  presence         |      |  | (Server-side)  | |
 +-----------------+     |                  |      |  +-------+--------+ |
                         |  DDoS Protection |      |          |          |
                         |  WAF Rules       |      |  +-------v--------+ |
                         +------------------+      |  | Auth Middleware | |
                                                   |  | (JWT + MFA)    | |
                                                   |  +-------+--------+ |
                                                   |          |          |
                                                   +----------+----------+
                                                              |
                    +-----------------------------------------+----------+
                    |                     |                               |
                    v                     v                               v
          +-----------------+   +-----------------+            +------------------+
          |                 |   |                 |            |                  |
          |  PostgreSQL     |   |  AI Services    |            |  External        |
          |  (Supabase)     |   |  (Anthropic /   |            |  Integrations    |
          |                 |   |   Google AI)    |            |                  |
          |  EU Region      |   |                 |            |  - HL7v2 Webhook |
          |  AES-256 at     |   |  De-identified  |            |  - FHIR R4 API   |
          |  rest           |   |  data only      |            |  - Claims Switch |
          |                 |   |                 |            |  - WhatsApp API  |
          |  Row-Level      |   |  No PII/PHI     |            |  - Payment GW    |
          |  Security       |   |  transmitted    |            |                  |
          +-----------------+   +-----------------+            +------------------+
```

---

## 3. Data Encryption

### 3.1 In Transit
- **All connections**: TLS 1.3 enforced (minimum TLS 1.2)
- **Client to Edge**: HTTPS only, HSTS enabled, automatic HTTP redirect
- **Edge to Application**: Encrypted internal network
- **Application to Database**: TLS-encrypted PostgreSQL connections (SSL mode: require)
- **Application to AI Services**: HTTPS API calls
- **Webhook Endpoints**: HMAC-SHA256 signature verification on all inbound webhooks

### 3.2 At Rest
- **Database**: AES-256-GCM encryption (Supabase managed, EU region)
- **File Storage**: AES-256 encrypted object storage
- **Backups**: Encrypted at rest, point-in-time recovery enabled
- **Log Data**: Encrypted storage with automatic rotation

---

## 4. Authentication & Authorization Flow

```
  USER                    APPLICATION                  DATABASE
   |                          |                           |
   |  1. Login (email/pwd)    |                           |
   |------------------------->|                           |
   |                          |  2. Validate credentials  |
   |                          |-------------------------->|
   |                          |  3. Check MFA status      |
   |                          |<--------------------------|
   |  4. MFA Challenge        |                           |
   |<-------------------------|                           |
   |  5. MFA Response         |                           |
   |------------------------->|                           |
   |                          |  6. Verify MFA token      |
   |                          |-------------------------->|
   |                          |  7. Confirmed             |
   |                          |<--------------------------|
   |  8. JWT issued           |                           |
   |  (short-lived, signed)   |                           |
   |<-------------------------|                           |
   |                          |                           |
   |  9. Subsequent requests  |                           |
   |  (JWT in httpOnly cookie)|                           |
   |------------------------->|                           |
   |                          |  10. RLS enforced per     |
   |                          |      tenant + role        |
   |                          |-------------------------->|
   |                          |  11. Scoped data returned |
   |                          |<--------------------------|
   |  12. Response            |                           |
   |<-------------------------|                           |
```

### Roles
| Role | Access Level |
|------|-------------|
| Platform Admin | Cross-tenant system administration |
| Practice Admin | Full practice management, billing, staff |
| Practitioner | Patient records, clinical notes, prescriptions |
| Receptionist | Bookings, check-in/out, basic patient info |

### Session Security
- JWT tokens: short-lived (1 hour), refresh rotation
- Stored in httpOnly, Secure, SameSite=Strict cookies
- Session invalidation on password change or admin action
- Concurrent session limits enforced per role

---

## 5. Integration Points

### 5.1 HL7v2 — Inbound Webhook
- **Purpose**: Receive ADT messages from hospital information systems
- **Security**: HMAC-SHA256 signature verification, IP allowlisting available
- **Format**: HL7v2 pipe-delimited messages (ADT^A01, ADT^A04, ADT^A08)
- **Processing**: Asynchronous queue, idempotent processing

### 5.2 FHIR R4 — REST API
- **Purpose**: Structured clinical data exchange
- **Supported Resources**: Patient, Practitioner, Appointment, Observation, Condition, MedicationRequest
- **Authentication**: OAuth 2.0 Bearer tokens
- **Rate Limiting**: 100 requests/minute per client

### 5.3 Medical Aid Claims
- **Purpose**: Electronic claims submission and adjudication
- **Switches**: MediSwitch, Healthbridge (configurable)
- **Format**: NAPPI codes, ICD-10 coding, tariff-based
- **Security**: Encrypted payload, mutual TLS where supported

### 5.4 Messaging (WhatsApp Business API)
- **Purpose**: Patient appointment reminders, follow-ups, recall
- **Provider**: Twilio WhatsApp Business
- **Data Shared**: First name, appointment date/time only (no clinical data)
- **Consent**: Explicit opt-in required, tracked in consent register

### 5.5 Payment Gateway
- **Purpose**: Patient co-payment processing
- **Provider**: Paystack (PCI DSS Level 1 compliant)
- **Data**: No card data touches our servers (redirect/tokenised)

---

## 6. Multi-Tenancy Architecture

```
  +------------------------------------------------------+
  |                   SHARED INFRASTRUCTURE               |
  |                                                      |
  |  +------------------+  +------------------+          |
  |  |  Practice A      |  |  Practice B      |   ...    |
  |  |  (Tenant 1)      |  |  (Tenant 2)      |          |
  |  |                  |  |                  |          |
  |  |  Own branding    |  |  Own branding    |          |
  |  |  Own patients    |  |  Own patients    |          |
  |  |  Own billing     |  |  Own billing     |          |
  |  +------------------+  +------------------+          |
  |                                                      |
  |  Database-Level Isolation: Row-Level Security (RLS)  |
  |  Every query scoped to tenant_id automatically       |
  +------------------------------------------------------+
```

- **Isolation Model**: Shared database, row-level security (RLS) enforced at the PostgreSQL level
- **Branding**: Per-tenant white-label (logo, colours, subdomain, tagline)
- **Data Segregation**: No cross-tenant data access possible — enforced at database policy level, not application level

---

## 7. Infrastructure Summary

| Component | Provider | Location | Certification |
|-----------|----------|----------|---------------|
| Hosting / CDN | Vercel | Global (SA edge) | SOC 2 Type II |
| Database | Supabase (PostgreSQL) | EU (eu-west-1) | SOC 2 Type II |
| AI Processing | Anthropic / Google AI | US | ISO 27001 |
| Messaging | Twilio | US | SOC 2 Type II |
| Payments | Paystack | NG/ZA | PCI DSS Level 1 |
| Voice | ElevenLabs | US | — |
| Monitoring | Sentry | US | SOC 2 Type II |

---

## 8. Availability & Disaster Recovery

- **Uptime Target**: 99.9% (platform infrastructure)
- **Database Backups**: Automated daily, point-in-time recovery (30-day retention)
- **Failover**: Vercel automatic failover across edge network
- **RTO**: < 4 hours
- **RPO**: < 1 hour (point-in-time recovery)

---

*This document is provided for vendor assessment purposes only. Distribution or reproduction without written consent from Visio Research Labs (Pty) Ltd is prohibited.*

**Contact:** David Hampton, Managing Director
**Email:** david@visiolabs.co.za
**Entity:** Visio Research Labs (Pty) Ltd
