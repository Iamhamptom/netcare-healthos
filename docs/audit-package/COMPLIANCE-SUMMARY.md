# VisioHealth OS — Compliance Summary

**One-Page Compliance Overview**
**Prepared by:** Visio Research Labs (Pty) Ltd
**Document Classification:** Confidential — For Vendor Assessment Only
**Version:** 2.0
**Date:** March 2026

---

## POPIA Compliance — 8 Conditions Mapped

| # | Condition | Status | Implementation |
|---|-----------|--------|----------------|
| 1 | **Accountability** | Compliant | Information Officer designated (MD). Audit logging on all data access. Sub-processor register maintained. DPAs executed with all processors. |
| 2 | **Processing Limitation** | Compliant | Data collected only for specified, lawful purposes. Consent captured before processing (4 types: treatment, data processing, marketing, research). Data minimisation enforced — only necessary fields collected. |
| 3 | **Purpose Specification** | Compliant | Purposes documented in privacy notice presented at registration. Data not processed beyond stated purposes. AI services receive de-identified data only. Retention periods defined per data category. |
| 4 | **Further Processing Limitation** | Compliant | No secondary use of patient data without explicit consent. De-identified data used for AI suggestions is not re-identifiable. Research use requires separate opt-in consent. |
| 5 | **Information Quality** | Compliant | Patient records editable by authorised practitioners. Data validation on input fields. Correction requests processed within 30 days (POPIA s24). Audit trail preserves history of changes. |
| 6 | **Openness** | Compliant | Privacy notice provided at registration. Sub-processor register available on request. This compliance documentation package demonstrates openness. Data subject access request (DSAR) process documented. |
| 7 | **Security Safeguards** | Compliant | AES-256-GCM encryption at rest. TLS 1.3 in transit. Role-based access control (4 roles). Row-Level Security at database level. MFA available. Vulnerability management programme. Incident response plan. See Security Posture document. |
| 8 | **Data Subject Participation** | Compliant | Patients can request access to their data (s23). Correction of records supported (s24). Deletion supported subject to legal retention obligations. Consent withdrawal mechanism implemented. |

---

## HPCSA Alignment

| Requirement | Status | Notes |
|------------|--------|-------|
| Patient record retention (minimum 7 years) | Aligned | Enforced via retention policy. Crypto-shred after retention period. |
| Clinical record integrity | Aligned | Immutable audit trail on all clinical notes. Version history maintained. |
| Practitioner accountability | Aligned | All clinical actions linked to authenticated practitioner identity. |
| Informed consent | Aligned | Consent captured and stored digitally with timestamp, type, and method. |
| Confidentiality of patient information | Aligned | RLS, encryption, role-based access. AI receives de-identified data only. |
| Electronic prescriptions | Aligned | ICD-10 and NAPPI coding. Practitioner identity verified for all prescriptions. |

---

## Medical Schemes Act Awareness

| Aspect | Status | Notes |
|--------|--------|-------|
| ICD-10 coding for claims | Supported | Integrated into billing workflow |
| NAPPI code support | Supported | Medication and consumable coding |
| Claims switch integration | Supported | MediSwitch, Healthbridge (configurable) |
| Tariff-based billing | Supported | Configurable tariff schedules |
| PMB (Prescribed Minimum Benefits) awareness | Roadmap | Planned for H2 2026 |
| Medical aid scheme validation | Supported | Real-time eligibility checks via claims switch |

---

## NHI Readiness

| Requirement | Status | Notes |
|------------|--------|-------|
| Unique patient identifier support | Ready | Database schema supports national patient ID when assigned |
| Standardised clinical coding (ICD-10) | Ready | Already implemented in billing and clinical modules |
| FHIR R4 interoperability | Ready | API supports Patient, Practitioner, Appointment, Observation, Condition, MedicationRequest resources |
| HL7v2 message processing | Ready | Inbound ADT webhook operational |
| Central reporting capability | Architecturally ready | Data export and API endpoints can feed central registries |
| Multi-facility support | Ready | Multi-tenant architecture supports facility-level separation |

---

## International Standards Readiness

### ISO 27001 (Information Security Management)

| Domain | Readiness | Gap |
|--------|-----------|-----|
| Information security policies | Documented | Formal ISMS framework pending |
| Organisation of information security | In place | Roles defined, responsibilities assigned |
| Asset management | In place | Data classification implemented |
| Access control | In place | RBAC + RLS + MFA |
| Cryptography | In place | AES-256, TLS 1.3, HMAC-SHA256 |
| Physical security | Delegated | Cloud-only; SOC 2 certified providers |
| Operations security | In place | Change management, vulnerability scanning |
| Communications security | In place | Network segmentation, TLS enforcement |
| Supplier relationships | In place | Sub-processor register, DPAs executed |
| Incident management | In place | Incident response plan documented |
| Business continuity | In place | Backups, failover, RTO/RPO defined |
| Compliance | In place | POPIA mapped, HPCSA aligned |

**Target**: Formal ISO 27001 certification by Q4 2027.

### SOC 2 Type II

| Trust Service Criteria | Readiness | Gap |
|-----------------------|-----------|-----|
| Security | High | Controls in place, formal audit pending |
| Availability | High | 99.9% target, monitoring in place |
| Processing Integrity | Medium | Audit trails in place, formal testing pending |
| Confidentiality | High | Encryption, access controls, data classification |
| Privacy | High | POPIA compliance demonstrated |

**Target**: SOC 2 Type II audit engagement by Q2 2027.

---

## Compliance Governance

| Activity | Frequency | Responsible |
|----------|-----------|-------------|
| POPIA compliance review | Quarterly | Information Officer (MD) |
| Sub-processor register update | Semi-annual + on change | Information Officer |
| Security posture assessment | Quarterly | Technical team |
| Incident response plan test | Annual | Full team |
| Data retention review | Annual | Information Officer |
| Privacy notice review | Annual | Legal counsel |
| Staff security awareness | Annual | Information Officer |

---

*This document is provided for vendor assessment purposes only. Distribution or reproduction without written consent from Visio Research Labs (Pty) Ltd is prohibited.*

**Contact:** David Hampton, Managing Director
**Email:** david@visiolabs.co.za
**Entity:** Visio Research Labs (Pty) Ltd
