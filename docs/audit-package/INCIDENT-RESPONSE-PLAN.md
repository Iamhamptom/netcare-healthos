# VisioHealth OS — Incident Response Plan

**Data Breach Response Procedure**
**Prepared by:** Visio Research Labs (Pty) Ltd
**Document Classification:** Confidential — For Vendor Assessment Only
**Version:** 2.0
**Date:** March 2026
**Next Review:** September 2026

---

## 1. Purpose & Scope

This plan establishes the procedures for detecting, responding to, and recovering from information security incidents affecting the VisioHealth OS platform, with specific attention to breaches involving personal information (PI) and protected health information (PHI) as defined under the Protection of Personal Information Act (POPIA).

This plan applies to all data processed on behalf of clients (including Netcare), and covers incidents originating from:
- Platform infrastructure or application vulnerabilities
- Sub-processor security events
- Insider threats or credential compromise
- Physical security events affecting data accessibility

---

## 2. Definitions

| Term | Definition |
|------|-----------|
| **Security Incident** | Any event that compromises the confidentiality, integrity, or availability of information assets |
| **Data Breach** | A security incident resulting in the unauthorised access, disclosure, alteration, or destruction of personal information |
| **Responsible Party** | The entity that determines the purpose and means of processing (typically the client / Netcare) |
| **Operator** | Visio Research Labs, processing personal information on behalf of the Responsible Party |
| **Information Regulator** | The South African Information Regulator established under POPIA |

---

## 3. Incident Response Team

| Role | Responsibility | Escalation Authority |
|------|---------------|---------------------|
| **Incident Commander** | David Hampton, Managing Director | Overall incident authority. External communications. Regulatory notification. |
| **Technical Lead** | Lead Engineer | Technical investigation, containment, and remediation. Evidence preservation. |
| **Communications Lead** | Managing Director | Client notification, media (if required), internal communications. |
| **Legal Advisor** | External legal counsel (health information law) | Regulatory obligations assessment, Information Regulator liaison. |
| **Data Protection Advisor** | Information Officer (MD) | POPIA compliance assessment, data subject notification decisions. |

---

## 4. Incident Response Phases

### Phase 1: Detection (0–1 hour)

**Objective**: Identify and confirm the security incident.

**Detection Sources**:
- Sentry application monitoring alerts (error spikes, unusual patterns)
- Vercel infrastructure alerts (traffic anomalies, deployment issues)
- Supabase database alerts (unusual query patterns, access violations)
- Sub-processor breach notifications
- User/client reports
- Automated vulnerability scan findings
- Audit log anomaly detection

**Actions**:
1. Receive and acknowledge alert/report
2. Assign initial severity classification:

| Severity | Definition | Response Time |
|----------|-----------|---------------|
| **Critical** | Confirmed breach of PHI/PII affecting multiple patients or tenants | Immediate (within 1 hour) |
| **High** | Confirmed breach of limited scope, or active exploitation of vulnerability | Within 4 hours |
| **Medium** | Potential breach under investigation, or vulnerability with no confirmed exploitation | Within 24 hours |
| **Low** | Security event with no evidence of data compromise | Within 72 hours |

3. Activate Incident Response Team for Critical/High severity
4. Begin evidence preservation (logs, screenshots, access records)

---

### Phase 2: Containment (1–4 hours)

**Objective**: Limit the scope and impact of the incident.

**Immediate Containment Actions**:
- Revoke compromised credentials or API keys
- Isolate affected tenant data if breach is tenant-specific
- Block suspicious IP addresses or access patterns
- Disable compromised user accounts
- Rotate affected secrets and environment variables
- Enable enhanced logging on affected systems

**Evidence Preservation**:
- Export and secure audit logs for the affected time period
- Capture database query logs
- Preserve application error logs from Sentry
- Document timeline of events with timestamps (UTC)
- Do not modify or delete any evidence

**Short-term Containment** (if immediate fix is not possible):
- Deploy temporary access restrictions
- Enable additional monitoring on affected systems
- Communicate containment status to Incident Commander

---

### Phase 3: Assessment (4–24 hours)

**Objective**: Determine the full scope, cause, and impact of the incident.

**Investigation Checklist**:

- [ ] What data was affected? (PII, PHI, financial, operational)
- [ ] How many data subjects are affected?
- [ ] Which tenants/practices are affected?
- [ ] What was the attack vector or root cause?
- [ ] When did the incident begin? (earliest evidence)
- [ ] When was it detected?
- [ ] Is the incident ongoing or contained?
- [ ] Were any sub-processors involved or affected?
- [ ] Is there evidence of data exfiltration?
- [ ] What is the potential harm to affected data subjects?

**Risk Assessment**:

| Factor | Assessment |
|--------|-----------|
| Volume of records affected | Number |
| Sensitivity of data (PHI vs PII vs operational) | Classification |
| Likelihood of harm to data subjects | Low / Medium / High |
| Whether data was encrypted at time of breach | Yes / No |
| Whether breach is contained | Yes / No / Unknown |
| Public exposure risk | Low / Medium / High |

---

### Phase 4: Notification (within 72 hours)

**Objective**: Notify all required parties in compliance with POPIA Section 22.

#### 4.1 Client Notification (Netcare as Responsible Party)

**Timeline**: As soon as reasonably possible, and no later than 48 hours after confirmation of a breach affecting their data.

**Notification Content**:
- Description of the incident
- Date/time of detection and estimated start
- Types of data affected
- Estimated number of affected data subjects
- Containment and remediation actions taken
- Recommended actions for the client
- Contact details for further information

**Template — Client Notification Email**:

```
Subject: VisioHealth OS — Security Incident Notification [Ref: INC-YYYY-NNN]

Dear [Client Contact],

We are writing to notify you of a security incident affecting the VisioHealth OS
platform that may involve data processed on behalf of [Practice/Organisation Name].

INCIDENT SUMMARY
- Date of Detection: [Date, Time UTC]
- Estimated Start: [Date, Time UTC]
- Nature: [Brief description]
- Data Affected: [Types of data]
- Estimated Scope: [Number of records/subjects if known]
- Current Status: [Contained / Under investigation]

ACTIONS TAKEN
[List of containment and remediation steps]

RECOMMENDED ACTIONS
[Any steps the client should take]

We will provide updates every [24/48] hours until resolution. Our Incident Commander
is available at [phone] and [email] for any questions.

Regards,
David Hampton
Managing Director, Visio Research Labs (Pty) Ltd
```

#### 4.2 Information Regulator Notification

**Timeline**: As soon as reasonably possible after confirming a breach involving personal information, in compliance with POPIA Section 22.

**Note**: As Operator, we will support the Responsible Party (Netcare) in making their notification to the Information Regulator. If Netcare is the Responsible Party, we provide all necessary information for their submission.

**Information Regulator Contact**:
- South African Information Regulator
- Website: https://inforegulator.org.za
- Email: complaints.ir@justice.gov.za
- POPIA Section 22 breach notification form

**Notification Content** (per POPIA Section 22(3)):
- Identity of the Responsible Party
- Description of the possible compromise
- Recommendation on measures the data subject can take
- Description of the measures taken or to be taken by the Responsible Party

#### 4.3 Data Subject Notification

**Decision**: Made by the Responsible Party (client/Netcare) in consultation with us.

**Our Support**: We provide:
- List of affected data subjects (within our tenant)
- Draft notification language
- Communication channel support (email, in-app notification)

#### 4.4 Law Enforcement

**When**: If the incident involves criminal activity (hacking, extortion, insider theft).

**Action**: Report to SAPS Cybercrime unit and/or the relevant authority, in coordination with the client and legal counsel.

---

### Phase 5: Remediation (24 hours – 30 days)

**Objective**: Eliminate the root cause and prevent recurrence.

**Remediation Actions**:
1. Deploy permanent fix for the exploited vulnerability
2. Conduct full security review of related systems
3. Update affected dependencies or configurations
4. Implement additional monitoring or controls as identified
5. Verify fix effectiveness through testing
6. Update security documentation and procedures

**Post-Incident Improvements**:
- Update incident response plan based on lessons learned
- Conduct post-incident review within 5 business days of resolution
- Document root cause analysis
- Implement preventive controls to address root cause
- Brief all relevant team members on changes

---

## 5. Incident Log Template

| Field | Value |
|-------|-------|
| Incident Reference | INC-YYYY-NNN |
| Date/Time Detected | |
| Date/Time Reported | |
| Reported By | |
| Severity | Critical / High / Medium / Low |
| Description | |
| Data Types Affected | |
| Tenants Affected | |
| Estimated Subjects Affected | |
| Containment Actions | |
| Root Cause | |
| Remediation Actions | |
| Notifications Sent | Client / Regulator / Data Subjects / Law Enforcement |
| Notification Dates | |
| Resolution Date | |
| Post-Incident Review Date | |
| Lessons Learned | |
| Preventive Measures Implemented | |

---

## 6. Escalation Matrix

```
  Severity       Detection        Containment      Client Notice    Regulator
  ─────────────────────────────────────────────────────────────────────────────
  Critical       < 1 hour         < 4 hours        < 24 hours       < 72 hours*
  High           < 4 hours        < 12 hours       < 48 hours       If required
  Medium         < 24 hours       < 48 hours       If required      If required
  Low            < 72 hours       As needed        Not typically     No

  * Regulator notification timeline per POPIA Section 22 — "as soon as
    reasonably possible." 72 hours is the target maximum.
```

---

## 7. Annual Testing

This incident response plan is tested annually through:
- **Tabletop Exercise**: Simulated breach scenario walked through with the Incident Response Team (minimum annual)
- **Communication Test**: Verify all contact details and escalation paths are current (semi-annual)
- **Post-Incident Review**: After any actual incident, the plan is reviewed and updated

**Last Test Date**: [To be completed after first exercise]
**Next Scheduled Test**: Q3 2026

---

## 8. Related Documents

- Security Posture Assessment
- Data Flow Diagram
- Sub-Processor Register
- Compliance Summary
- Change Management Policy

---

*This document is provided for vendor assessment purposes only. Distribution or reproduction without written consent from Visio Research Labs (Pty) Ltd is prohibited.*

**Contact:** David Hampton, Managing Director
**Email:** david@visiolabs.co.za
**Entity:** Visio Research Labs (Pty) Ltd
