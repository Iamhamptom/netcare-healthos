# VisioHealth OS — Security Posture Assessment

**Pre-Filled Vendor Security Questionnaire**
**Prepared by:** Visio Research Labs (Pty) Ltd
**Document Classification:** Confidential — For Vendor Assessment Only
**Version:** 2.0
**Date:** March 2026

---

## Respondent Information

| Field | Detail |
|-------|--------|
| Vendor Name | Visio Research Labs (Pty) Ltd |
| Product Name | VisioHealth OS |
| Completed By | David Hampton, Managing Director |
| Date | March 2026 |
| Review Cycle | Annual (next review: March 2027) |

---

## Security Assessment Responses

### Encryption & Data Protection

**1. Do you encrypt data at rest?**
Yes. All data at rest is encrypted using AES-256-GCM encryption. This includes the primary PostgreSQL database, file/object storage, and all backup media. Encryption is managed at the infrastructure level by our database provider (Supabase) with keys rotated according to their key management schedule.

**2. Do you encrypt data in transit?**
Yes. All data in transit is encrypted using TLS 1.3 (minimum TLS 1.2). This applies to all client-server communication, server-to-database connections, API integrations, and inter-service communication. HSTS headers are enforced with a minimum max-age of one year. HTTP connections are automatically redirected to HTTPS.

**3. How do you manage encryption keys?**
Encryption keys are managed by our infrastructure providers (Supabase for database, Vercel for application secrets). Application-level secrets (API keys, webhook signing keys) are stored in encrypted environment variables and are never committed to source code repositories. We do not have direct access to infrastructure-level encryption keys.

**4. Do you support data anonymisation or pseudonymisation?**
Yes. All data transmitted to AI services is de-identified prior to transmission. Patient identifiers are stripped and replaced with session-scoped pseudonymous references. Clinical data used for AI-assisted workflows contains no PII or PHI. We maintain a documented de-identification procedure.

### Authentication & Access Control

**5. What authentication methods are supported?**
Email/password authentication with bcrypt password hashing, multi-factor authentication (MFA) via time-based one-time passwords (TOTP), and API key authentication for system-to-system integrations using HMAC-SHA256 signed requests.

**6. Do you enforce multi-factor authentication (MFA)?**
Yes. MFA is available for all users and can be mandated per-tenant by practice administrators. MFA uses industry-standard TOTP (RFC 6238) compatible with Google Authenticator, Authy, and similar applications.

**7. Do you implement role-based access control (RBAC)?**
Yes. Four distinct roles are enforced: Platform Admin, Practice Admin, Practitioner, and Receptionist. Each role has a defined permission set. Access control is enforced at both the application middleware layer and the database layer via PostgreSQL Row-Level Security (RLS) policies.

**8. How are user sessions managed?**
Sessions use short-lived JWT tokens (1-hour expiry) stored in httpOnly, Secure, SameSite=Strict cookies. Refresh token rotation is implemented. Sessions are invalidated on password change, role change, or administrative action. Failed login attempts trigger progressive lockout.

**9. Do you have a password policy?**
Yes. Minimum 8 characters, must include uppercase, lowercase, and numeric characters. Passwords are hashed using bcrypt with a cost factor of 12. Credential stuffing protection is provided via rate limiting on authentication endpoints.

**10. How do you handle API authentication?**
System-to-system API calls use API key authentication with HMAC-SHA256 request signing. Webhook endpoints verify inbound requests using HMAC-SHA256 signature validation. OAuth 2.0 Bearer tokens are used for FHIR API access. All API endpoints enforce rate limiting.

### Audit & Monitoring

**11. Do you maintain audit logs?**
Yes. Every data access, modification, and deletion is logged with: user identity, action performed, timestamp (UTC), affected resource, source IP address, and tenant context. Audit logs are immutable and retained for a minimum of 7 years in compliance with HPCSA record-keeping requirements.

**12. Can audit logs be exported?**
Yes. Audit logs can be exported in structured formats (JSON, CSV) for compliance review. Real-time log streaming can be configured for integration with enterprise SIEM solutions.

**13. Do you have real-time monitoring and alerting?**
Yes. Application performance monitoring and error tracking via Sentry (SOC 2 Type II certified). Infrastructure monitoring via Vercel Analytics. Automated alerting for: error rate spikes, latency degradation, failed authentication attempts, and security-relevant events.

**14. Do you perform regular security testing?**
Yes. Our security testing programme includes:
- Automated dependency vulnerability scanning (npm audit, Dependabot) — continuous
- Static code analysis — per deployment
- Manual security review of authentication and authorization flows — quarterly
- Infrastructure security assessment — annual
- We are committed to engaging a third-party penetration testing firm annually (timeline: Q3 2026 for first formal pentest)

### Vulnerability & Patch Management

**15. How do you manage software vulnerabilities?**
Automated vulnerability scanning is performed on every code commit via GitHub Dependabot. Critical and high-severity vulnerabilities are remediated within 72 hours. Dependencies are updated on a rolling basis. Security advisories from upstream providers are monitored and actioned promptly.

**16. What is your patch management process?**
Patches are applied through our standard deployment pipeline: automated testing, staging environment verification, production deployment. Critical security patches bypass the standard release cycle and are deployed as emergency releases within 24 hours of availability.

**17. Do you have a bug bounty or responsible disclosure programme?**
We have a responsible disclosure policy. Security researchers can report vulnerabilities to security@visiolabs.co.za. We commit to acknowledging reports within 48 hours and providing resolution timelines within 5 business days.

### Network & Infrastructure Security

**18. How is your network secured?**
Our application runs on Vercel's serverless infrastructure with built-in DDoS protection and Web Application Firewall (WAF) rules. Database access is restricted to authenticated application connections only — no direct database access is exposed to the public internet. IP allowlisting is available for webhook and API endpoints.

**19. Do you perform network segmentation?**
Yes. The application tier, database tier, and external integration tier are logically separated. Database connections are only accepted from verified application origins. AI service calls are made from server-side only — no client-side AI API access is possible.

**20. Do you protect against DDoS attacks?**
Yes. Vercel's edge network provides automatic DDoS mitigation at the network and application layers. Rate limiting is enforced on all API endpoints: 100 requests/minute for standard endpoints, 10 requests/minute for authentication endpoints.

### Data Governance & Privacy

**21. What is your data retention policy?**
- Patient clinical records: retained for minimum 7 years post last encounter (HPCSA requirement)
- Audit logs: retained for minimum 7 years
- Financial records: retained for minimum 5 years (SARS requirement)
- Session/analytics data: retained for 90 days, then aggregated/anonymised
- Data deletion requests are processed within 30 days, subject to legal retention obligations

**22. How do you handle data subject access requests (DSARs)?**
We support POPIA Section 23 data subject requests. Practice administrators can export all data held for a specific patient in structured format. Platform-level data subject requests are processed by our team within 30 days. A documented procedure exists for handling access, correction, and deletion requests.

**23. Where is data stored geographically?**
Primary database: EU (eu-west-1) via Supabase. Application hosting: Vercel global edge network with South African edge presence. AI processing: US-based API services (Anthropic, Google AI) — no PII/PHI is transmitted. Full cross-border transfer disclosure is provided in our Data Flow Diagram and Sub-Processor Register.

**24. Do you have a Data Protection Officer (DPO)?**
The Managing Director serves as the designated Information Officer as required under POPIA. For enterprise deployments, we support integration with the client's DPO and Information Regulator reporting processes.

### Business Continuity & Incident Response

**25. Do you have an incident response plan?**
Yes. A documented incident response plan covers: Detection, Containment, Assessment, Notification (within 72 hours as required by POPIA), and Remediation. Specific provisions exist for notifying Netcare as data controller in the event of a breach affecting their tenant data. Full details provided in our Incident Response Plan document.

**26. Do you have a business continuity plan?**
Yes. Our platform is designed for high availability with automated failover. Database backups are performed daily with point-in-time recovery capability (30-day retention). Recovery Time Objective (RTO): < 4 hours. Recovery Point Objective (RPO): < 1 hour.

**27. What is your uptime SLA?**
99.9% uptime target for platform infrastructure. Maintenance windows are scheduled during low-usage periods (typically Sunday 02:00–06:00 SAST) with advance notice. Unplanned downtime triggers incident response procedures.

### Compliance & Certifications

**28. What compliance frameworks do you adhere to?**
- **POPIA**: Full compliance — all 8 conditions mapped and implemented
- **HPCSA**: Alignment with Health Professions Council guidelines for electronic records
- **Medical Schemes Act**: Awareness and support for claims processing requirements
- **NHI**: Architectural readiness for National Health Insurance integration
- **International**: Working toward ISO 27001 and SOC 2 Type II (target: 2027)

**29. Do you conduct regular compliance audits?**
Internal compliance reviews are conducted quarterly. We engage with legal counsel specialising in South African health information law annually. Our sub-processors (Supabase, Vercel) maintain independent SOC 2 Type II certifications audited by third parties.

**30. Do you have contractual commitments for data protection?**
Yes. We execute Data Processing Agreements (DPAs) with all clients and sub-processors. Our standard commercial agreement includes clauses for: data protection obligations, breach notification, data return/deletion on termination, liability for data processing, and compliance with applicable South African law. Template agreements are available for review.

---

## Additional Security Measures

### Development Security
- Version-controlled source code (Git)
- Code review required before merge to production branch
- Secrets scanning in CI/CD pipeline
- No production credentials in source code
- Separate environments: development, staging, production

### Personnel Security
- Background checks for team members with production access
- Principle of least privilege for all access grants
- Access reviews conducted quarterly
- Onboarding/offboarding checklists include system access provisioning/deprovisioning

### Physical Security
- No on-premises infrastructure — fully cloud-hosted
- Physical security delegated to infrastructure providers (Supabase, Vercel) who maintain SOC 2 Type II certifications covering physical security controls

---

*This document is provided for vendor assessment purposes only. Distribution or reproduction without written consent from Visio Research Labs (Pty) Ltd is prohibited.*

**Contact:** David Hampton, Managing Director
**Email:** david@visiolabs.co.za
**Entity:** Visio Research Labs (Pty) Ltd
