# POPIA Health Data Compliance Statement
## Netcare Health OS — Visio Research Labs

**Document**: VRL-POPIA-HEALTH-2026-001
**Version**: 1.0
**Date**: 31 March 2026
**Prepared by**: David Hampton, CEO — Visio Research Labs
**Applicable Regulation**: Protection of Personal Information Act 4 of 2013, Health-Specific Regulations (effective 6 March 2026)

---

## 1. Scope

This compliance statement covers the Netcare Health OS platform ("the System") — an AI-powered claims intelligence and practice management system developed by Visio Research Labs (Pty) Ltd ("VRL") for deployment within Netcare Limited's Primary Care Division.

The System processes health information as defined in Section 32 of POPIA, specifically for claims assessment, medical aid billing validation, and clinical documentation.

---

## 2. Legal Basis for Processing

| POPIA Section | Basis | Application |
|---------------|-------|-------------|
| Section 27(1)(a) — Consent | Patient consent | Processing relies on Netcare's existing treatment agreements which include consent for billing and claims administration |
| Section 27(1)(d) — Legitimate interest | Accurate billing | Accurate claims coding benefits both provider (revenue recovery) and patient (correct coverage, reduced out-of-pocket) |
| Section 32 — Health information | Claims assessment | Section 32(4)(b) permits processing for "assessment and management of health insurance claims" |
| Section 26 — Special personal information | Health data | Processing is necessary for the management of health services as contemplated in Section 32 |

---

## 3. Health-Specific Regulations (6 March 2026)

The POPIA health-specific regulations became effective on 6 March 2026. VRL confirms compliance with the following provisions:

### 3.1 Data Minimisation
- Only billing-relevant data is processed (ICD-10 codes, tariff codes, scheme information, practice number)
- Patient names are masked to initials (e.g., "Sarah Naidoo" → "S.N.") before AI processing
- SA ID numbers are stripped before any data reaches the AI layer
- Clinical notes are processed for coding purposes only — the full narrative is not stored

### 3.2 Purpose Limitation
- Data is processed exclusively for claims validation, coding accuracy, and billing administration
- No data is used for marketing, profiling, or purposes beyond claims management
- No secondary use of health data without explicit consent

### 3.3 Retention
- Validation results: 12 months (configurable to match Netcare's retention policy)
- AI audit logs: 24 months
- Conversation history: session-scoped, auto-cleared
- Raw patient data: NOT retained by VRL — processed in-transit and discarded

### 3.4 Cross-Border Transfer (Section 72)
- Default deployment: Vercel (EU-West-1)
- Production option: Azure South Africa North (Johannesburg) — zero cross-border transfer
- Alternative: Netcare's own Azure/AWS tenant — VRL has no access to data at rest
- Containerised deployment: can run entirely on-premise within Netcare's network

---

## 4. Section 71 — Automated Decision-Making

### 4.1 Human-in-the-Loop (Mandatory)
The System does NOT make autonomous decisions about claims. The architecture enforces:
1. **AI suggests** — the system flags potential coding errors and suggests corrections
2. **Human reviews** — a billing staff member reviews every flag before action
3. **Human approves** — no claim is altered, submitted, or rejected without explicit human confirmation
4. **Override permitted** — any staff member can override any AI recommendation

### 4.2 Explainability
Every AI recommendation includes:
- The specific rule that was triggered (e.g., "ICD-10 code I10 lacks 4th character specificity")
- The source of the rule (e.g., "Medical Schemes Act Section 59", "Discovery Health Provider Manual 2026")
- A suggested correction with reasoning
- A confidence level (high/medium/low)

### 4.3 Right to Contest
- Section 71(3) provides the right to contest automated decisions
- Any staff member can reject an AI recommendation with one click
- All overrides are logged with timestamp, user, and reason
- The AI learns from overrides to improve future accuracy

---

## 5. Technical Security Controls

| Control | Implementation |
|---------|---------------|
| Encryption at rest | AES-256-GCM (SA ID numbers, membership numbers) |
| Encryption in transit | TLS 1.3 on all connections |
| Access control | Role-based (admin, doctor, staff), session-based authentication |
| Multi-factor auth | TOTP MFA available for all accounts |
| Audit logging | All data access logged with timestamp, user, IP address |
| PII stripping | Automatic before AI processing (names → initials, IDs → redacted) |
| Rate limiting | All API endpoints (30 req/min default, 20 req/min for claims) |
| Security headers | HSTS, CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff |
| Prompt injection detection | Automatic on all AI inputs (15 adversarial patterns) |

---

## 6. Data Processing Agreement

VRL is prepared to execute a Data Processing Agreement (DPA) with Netcare covering:
- Defined processing purposes and limitations
- Sub-processor disclosure (Google Cloud for Gemini AI, Anthropic for Claude AI)
- Data breach notification procedures (72-hour notification as per POPIA Section 22)
- Right to audit VRL's compliance
- Data deletion procedures on contract termination

---

## 7. Information Officer

**Responsible Party**: Visio Research Labs (Pty) Ltd
**Information Officer**: Dr. David Hampton
**Contact**: davidhampton@visiocorp.co
**POPIA Registration**: Pending (CIPC registration in process)

---

## 8. Attestation

This compliance statement is based on our assessment of the POPIA Act and the health-specific regulations effective 6 March 2026. VRL commits to maintaining compliance as regulations evolve and to cooperating with Netcare's compliance team and the Information Regulator.

**Signed**: _________________________
**Name**: Dr. David Hampton
**Title**: CEO, Visio Research Labs
**Date**: 31 March 2026
