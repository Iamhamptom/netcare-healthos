# Information Security Policy

**Visio Research Labs (Pty) Ltd / VisioHealth OS**
**Document Classification:** Confidential
**Version:** 1.0
**Effective Date:** March 2026
**Next Review:** March 2027 (Annual)
**Owner:** Information Officer (Managing Director)

---

## 1. Purpose

This policy establishes the framework for managing information security across the VisioHealth OS platform and Visio Research Labs operations. It ensures the confidentiality, integrity, and availability of all information assets, with particular emphasis on protected health information (PHI) and personal information (PI) processed on behalf of healthcare clients.

---

## 2. Scope

This policy applies to:

- All employees, contractors, and third parties with access to VisioHealth OS systems
- All information assets including source code, databases, infrastructure configurations, and documentation
- All environments: development, staging, and production
- All data processed on behalf of clients, including patient records, clinical data, billing information, and practice management data
- All sub-processors and third-party services integrated with the platform

---

## 3. Information Security Objectives

1. **Protect patient data** — Ensure PHI and PI are processed lawfully and securely in compliance with POPIA and HPCSA guidelines
2. **Maintain system availability** — Achieve 99.9% uptime for production services with defined RTO/RPO targets
3. **Prevent unauthorised access** — Implement defence-in-depth with multi-layered access controls
4. **Enable secure interoperability** — Support FHIR R4, HL7v2, and SA HNSF standards without compromising security
5. **Continuous improvement** — Regularly assess and improve security posture through audits, testing, and incident review

---

## 4. Roles and Responsibilities

### 4.1 Information Officer (IO)

- Overall accountability for information security
- Approve security policies and risk treatment plans
- Ensure regulatory compliance (POPIA, HPCSA, ISO 27001)
- Report to the Information Regulator as required
- Approve access to sensitive systems and data

### 4.2 Technical Lead / Security Team

- Implement and maintain technical security controls
- Conduct vulnerability assessments and penetration testing
- Monitor security alerts and respond to incidents
- Manage encryption keys, certificates, and secrets
- Review and approve code changes for security implications
- Maintain security documentation and audit trails

### 4.3 Development Team

- Follow secure coding practices (OWASP Top 10, TypeScript strict mode)
- Submit all code changes for peer review before merge
- Report security concerns or vulnerabilities immediately
- Complete security awareness training annually
- Never commit secrets, credentials, or PHI to source control

### 4.4 All Staff and Contractors

- Comply with this policy and all related procedures
- Use strong, unique passwords and multi-factor authentication
- Report suspected security incidents within 1 hour of detection
- Lock workstations when unattended
- Handle PHI and PI only as authorised by their role
- Complete security awareness training upon onboarding and annually thereafter

---

## 5. Risk Management Approach

### 5.1 Risk Assessment

- Conduct formal risk assessments annually and upon significant system changes
- Identify threats to confidentiality, integrity, and availability of information assets
- Evaluate likelihood and impact using a 5x5 risk matrix
- Document risks in the Information Security Risk Register

### 5.2 Risk Treatment

- **Mitigate**: Implement controls to reduce risk to acceptable levels
- **Transfer**: Use insurance or contractual arrangements where appropriate
- **Accept**: Document acceptance of residual risk with IO approval
- **Avoid**: Eliminate the activity or condition creating the risk

### 5.3 Risk Monitoring

- Review the risk register quarterly
- Re-assess risks after security incidents
- Track risk treatment progress and effectiveness

---

## 6. Access Control Principles

### 6.1 Least Privilege

- Users receive only the minimum access required for their role
- Multi-tenant isolation ensures practices cannot access other practices' data
- Row-Level Security (RLS) enforced at the database layer (Supabase)
- API routes validate tenant context on every request

### 6.2 Authentication

- All user access requires authentication via Supabase Auth
- Session tokens use secure, httpOnly cookies with SameSite protection
- JWT tokens are signed with practice-scoped claims
- API keys use SHA-256 hashing for storage

### 6.3 Authorisation

- Role-based access control (RBAC): platform_admin, practice_admin, practitioner, receptionist, billing_clerk
- Practice-scoped data isolation at application and database layers
- Administrative functions require platform_admin role
- All authorisation decisions are logged

### 6.4 Access Reviews

- Review user access rights quarterly
- Remove access within 24 hours of role change or termination
- Audit privileged access monthly

---

## 7. Acceptable Use

### 7.1 Permitted Use

- Access systems only for legitimate business purposes
- Use approved devices and networks for accessing production systems
- Store PHI only in approved, encrypted systems

### 7.2 Prohibited Activities

- Sharing credentials or authentication tokens
- Accessing data outside of assigned role or practice scope
- Storing PHI on personal devices or unapproved cloud services
- Disabling security controls or monitoring
- Installing unauthorised software on systems with access to PHI
- Exporting bulk patient data without IO approval

---

## 8. Data Protection and Encryption

### 8.1 Data at Rest

- Database encryption via Supabase (AES-256)
- Sensitive fields (SA ID numbers, medical aid details) encrypted at application layer using AES-256-GCM via HealthBridge encryption
- Encryption keys stored in environment variables, never in source code

### 8.2 Data in Transit

- All communications over TLS 1.2+ (enforced by Vercel edge network)
- FHIR and HL7 integrations use mutual TLS where supported
- Internal API calls use HTTPS exclusively

### 8.3 Data Retention

- Retain clinical data per HPCSA requirements (minimum 6 years for adults, until age 21 for minors)
- Audit logs retained for minimum 2 years
- Anonymise or delete data upon client contract termination per agreed schedule

---

## 9. Incident Reporting Obligations

All personnel must report suspected or confirmed security incidents:

- **What to report**: Unauthorised access, data exposure, system compromise, phishing, lost/stolen devices, suspicious activity
- **How to report**: Immediately notify the Technical Lead and Information Officer via designated secure channel
- **Timeline**: Within 1 hour of detection for suspected PHI/PI breaches
- **Protection**: No retaliation against good-faith reporting of security concerns

Refer to the **Incident Response Plan** (docs/audit-package/INCIDENT-RESPONSE-PLAN.md) for detailed response procedures.

---

## 10. Compliance Requirements

### 10.1 POPIA (Protection of Personal Information Act)

- Lawful processing of personal information
- Data subject consent management
- Information Regulator notification for breaches
- Cross-border transfer restrictions

### 10.2 HPCSA (Health Professions Council of South Africa)

- Patient record confidentiality
- Clinical data retention requirements
- Practitioner-patient privilege
- Telemedicine guidelines compliance

### 10.3 ISO 27001

- Information Security Management System (ISMS) aligned with ISO 27001:2022
- Statement of Applicability maintained
- Internal audits conducted annually
- Management review of ISMS effectiveness

### 10.4 SA Health Normative Standards Framework (HNSF)

- FHIR R4 interoperability compliance
- HL7v2 messaging support for lab and ADT integrations
- ICD-10 and LOINC coding standards
- Patient identifier management per SA standards

---

## 11. Policy Review Schedule

| Activity | Frequency | Responsible |
|----------|-----------|-------------|
| Full policy review | Annual (March) | Information Officer |
| Risk register review | Quarterly | Technical Lead + IO |
| Access rights review | Quarterly | Technical Lead |
| Security awareness training | Annual | All staff |
| Penetration testing | Annual | External assessor |
| Vulnerability scanning | Monthly | Technical Lead |
| Incident response plan test | Annual | Incident Response Team |
| Business continuity test | Quarterly | Technical Lead + IO |

---

## 12. Enforcement

Violation of this policy may result in:

- Disciplinary action up to and including termination
- Revocation of system access
- Legal action where warranted
- Reporting to regulatory authorities if required by law

---

## 13. Related Documents

- Incident Response Plan
- Business Continuity / Disaster Recovery Plan
- Key Rotation Policy
- Secure SDLC Documentation
- Data Processing Agreement (template)
- Sub-Processor Register
- Security Posture Assessment

---

*This document is provided for vendor assessment purposes only. Distribution or reproduction without written consent from Visio Research Labs (Pty) Ltd is prohibited.*

**Approved by:** David Hampton, Managing Director & Information Officer
**Entity:** Visio Research Labs (Pty) Ltd
**Contact:** david@visiolabs.co.za
