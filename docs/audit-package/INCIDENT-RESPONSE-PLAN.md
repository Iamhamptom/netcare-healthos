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

## 8. Scenario-Specific Playbooks

### Playbook A: Unauthorised Access to Patient Data

**Detection Indicators**:
- Audit log entries showing access to patient records outside normal working hours or from unusual IP addresses
- Access to records outside the user's assigned practice/tenant scope
- Bulk patient record queries exceeding normal clinical patterns
- Failed login attempts followed by successful access
- Sentry alerts for RLS (Row-Level Security) bypass attempts
- User reports of records they did not access appearing in their audit trail

**Immediate Actions** (0–1 hour):
1. Disable the compromised user account immediately
2. Revoke all active sessions and API tokens for the affected account
3. Block the source IP address(es) at the edge (Vercel)
4. Capture full audit log for the affected account (last 30 days)
5. Export Supabase auth logs and query logs for the compromise window
6. Notify the Incident Commander

**Investigation Steps** (1–24 hours):
1. Determine the attack vector:
   - Credential theft (phishing, brute force, credential stuffing)?
   - Session hijacking?
   - Application vulnerability (RLS bypass, IDOR)?
   - Insider threat (legitimate credentials misused)?
2. Identify all records accessed during the compromise window
3. Map affected data subjects (patients) and affected tenants (practices)
4. Determine if data was exfiltrated (check for bulk export, API responses, copy/download events)
5. Review code changes deployed near the time of compromise
6. Check for lateral movement to other accounts or systems

**Notification Requirements**:
- Client (practice/Netcare): Within 24 hours of confirmation
- Information Regulator: Within 72 hours if PHI was accessed (POPIA Section 22)
- Affected data subjects: As directed by the Responsible Party and legal counsel
- SAPS Cybercrime unit: If criminal activity is confirmed

**Recovery Steps**:
1. Force password reset for all users in the affected practice
2. Enable MFA if not already active
3. Patch the vulnerability if application-level (deploy hotfix)
4. Restore any modified records from backup
5. Implement additional monitoring rules for the compromised pattern
6. Verify RLS policies are correctly enforced with automated tests

**Post-Incident Review**:
- Complete root cause analysis within 5 business days
- Update access control policies as needed
- Brief all team members on the attack vector
- Schedule additional security awareness training if insider threat

---

### Playbook B: Ransomware / Malware Infection

**Detection Indicators**:
- Sudden inability to access application or database
- Ransom note displayed or received via email
- File encryption detected on development machines
- Unusual outbound network traffic (data exfiltration before encryption)
- Sentry alerts showing mass application errors
- Database queries returning encrypted/garbled data

**Immediate Actions** (0–1 hour):
1. **DO NOT** pay the ransom under any circumstances
2. Disconnect affected development machines from the network
3. Verify production environment status (Vercel serverless — typically not affected by endpoint malware)
4. Verify database integrity by querying known records via Supabase dashboard
5. Change all passwords and rotate all secrets as a precaution
6. Notify the Incident Commander and activate the full IR team
7. Engage external cybersecurity forensics firm if available

**Investigation Steps** (1–48 hours):
1. Determine infection vector (phishing email, compromised dependency, supply chain)
2. Identify all systems affected (development machines, CI/CD pipeline, cloud services)
3. Assess whether production data or source code was compromised
4. Check for data exfiltration prior to encryption (double extortion)
5. Review git history for unauthorised commits or backdoors
6. Scan all dependencies for compromised packages

**Notification Requirements**:
- Client notification: Within 24 hours with scope assessment
- Information Regulator: If any PHI compromise is confirmed
- Law enforcement (SAPS Cybercrime): Immediately — ransomware is a criminal offence
- Cyber insurance provider: As per policy terms

**Recovery Steps**:
1. Rebuild affected development machines from clean images
2. If production database affected: restore from Supabase PITR to pre-infection point
3. Redeploy application from verified clean git commit
4. Rotate ALL secrets and credentials (see Key Rotation Policy — emergency procedure)
5. Run full vulnerability scan on all systems before reconnecting
6. Implement enhanced endpoint protection on development machines

**Post-Incident Review**:
- Engage external forensics for full investigation report
- Review and enhance email filtering and endpoint protection
- Implement network segmentation if not already in place
- Update incident response plan with ransomware-specific lessons

---

### Playbook C: Data Breach via Third-Party Processor

**Detection Indicators**:
- Breach notification received from a sub-processor (Supabase, Vercel, Anthropic, ElevenLabs, Sentry)
- Public disclosure of sub-processor breach (news, status page, CVE)
- Unusual behaviour in data received from sub-processor APIs
- Sub-processor status page showing security incident

**Immediate Actions** (0–4 hours):
1. Assess which data of ours the sub-processor holds/processes
2. Review the Sub-Processor Register for data classification
3. Rotate any API keys or credentials shared with the affected sub-processor
4. Enable enhanced monitoring on integrations with the affected processor
5. Contact the sub-processor's security team for detailed scope assessment
6. Notify the Incident Commander

**Investigation Steps** (4–72 hours):
1. Obtain the sub-processor's incident report and timeline
2. Determine if VisioHealth OS data was specifically affected
3. Identify the types and volume of data potentially exposed:
   - Supabase: Full database contents (PHI, PII, practice data)
   - Vercel: Application code, environment variables (secrets)
   - Anthropic: AI conversation logs (may contain clinical context)
   - Sentry: Error payloads (should not contain PHI if properly sanitised)
4. Assess whether the sub-processor's breach has been contained
5. Review our data minimisation practices — was only necessary data shared?

**Notification Requirements**:
- Client notification: Within 48 hours with sub-processor identified and scope assessment
- Information Regulator: If PHI exposure is confirmed or probable
- Data subjects: As directed by the Responsible Party
- Document our reliance on the sub-processor's incident report

**Recovery Steps**:
1. Rotate all credentials associated with the affected sub-processor
2. Evaluate alternative sub-processors if the breach reveals systemic issues
3. Review and update Data Processing Agreements with the sub-processor
4. Implement additional encryption layers if data exposure risk is high
5. Update the Sub-Processor Register with the incident record

**Post-Incident Review**:
- Reassess sub-processor risk ratings
- Review data minimisation — reduce data shared with sub-processors where possible
- Update vendor assessment questionnaire based on lessons learned
- Consider contractual SLA changes for breach notification speed

---

### Playbook D: DDoS Attack

**Detection Indicators**:
- Sudden spike in traffic volume (Vercel analytics)
- Application response times degrading significantly
- Vercel function invocation limits approaching or exceeded
- Legitimate users reporting inability to access the platform
- Unusual geographic distribution of traffic
- Sentry alerts for timeout errors and 503 responses

**Immediate Actions** (0–30 minutes):
1. Verify it is a DDoS attack vs. legitimate traffic spike or application bug
2. Check Vercel status page — may be platform-wide
3. Enable Vercel's built-in DDoS protection features (L3/L4/L7 mitigation is automatic)
4. If Vercel protection is insufficient:
   - Enable IP rate limiting at the application level (existing rate-limit middleware)
   - Block attacking IP ranges via Vercel Edge Config or middleware
   - Enable geographic restrictions if attack originates from specific regions
5. Notify the Incident Commander if service degradation exceeds 15 minutes

**Investigation Steps** (during and after attack):
1. Analyse traffic patterns to identify attack type (volumetric, protocol, application-layer)
2. Identify source IPs and geographic distribution
3. Determine if the DDoS is covering another attack (diversion tactic)
4. Review audit logs for suspicious activity during the attack window
5. Check if any data was accessed or exfiltrated while defences were focused on DDoS

**Notification Requirements**:
- Client notification: If service degradation exceeds 30 minutes
- No regulatory notification required unless DDoS is combined with a data breach
- Law enforcement: If attack is sustained (>2 hours) or involves extortion demands

**Recovery Steps**:
1. Gradually ease blocking rules once attack subsides
2. Monitor for recurrence over the following 48 hours
3. Review and optimise rate limiting rules based on attack patterns
4. Implement additional caching for static resources to reduce attack surface
5. Consider upgrading Vercel plan for enhanced DDoS protection if needed

**Post-Incident Review**:
- Document attack characteristics for future detection
- Update rate limiting thresholds based on attack patterns
- Review application architecture for DDoS resilience improvements
- Evaluate dedicated DDoS protection services if attacks are recurring
- Brief team on DDoS indicators and response procedures

---

## 9. Related Documents

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
