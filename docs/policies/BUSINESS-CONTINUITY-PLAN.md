# Business Continuity & Disaster Recovery Plan

**Visio Research Labs (Pty) Ltd / VisioHealth OS**
**Document Classification:** Confidential
**Version:** 1.0
**Effective Date:** March 2026
**Next Review:** September 2026
**Owner:** Information Officer (Managing Director)

---

## 1. Purpose

This plan establishes the procedures for maintaining continuity of VisioHealth OS services and recovering from disruptive events. It covers infrastructure failures, data loss scenarios, security incidents, and natural disasters that could impact platform availability or data integrity.

---

## 2. Scope

This plan covers:

- VisioHealth OS production platform (Next.js application on Vercel)
- Supabase database and storage (PostgreSQL, eu-west-1)
- Third-party integrations (Anthropic AI, ElevenLabs, payment gateways, lab interfaces)
- DNS and domain services (GoDaddy / Vercel Edge)
- Monitoring and alerting (Sentry, Vercel Analytics)
- All tenant/practice data including PHI

---

## 3. Recovery Objectives

### 3.1 Recovery Time Objective (RTO)

| Service Tier | RTO | Description |
|-------------|-----|-------------|
| **Core Platform** | 4 hours | Authentication, patient records, clinical workflows |
| **AI/Agent Services** | 8 hours | AI triage, chatbot, agent recommendations |
| **Integration Layer** | 12 hours | FHIR/HL7 interfaces, lab result feeds, medical device streams |
| **Analytics & Reporting** | 24 hours | Dashboards, compliance reports, billing analytics |

### 3.2 Recovery Point Objective (RPO)

| Data Type | RPO | Backup Mechanism |
|-----------|-----|-----------------|
| **Patient clinical data** | 1 hour | Supabase continuous backup (WAL archiving) |
| **Transaction/billing data** | 1 hour | Supabase continuous backup |
| **Application configuration** | 0 (real-time) | Git version control (GitHub) |
| **Audit logs** | 1 hour | Supabase continuous backup |
| **File uploads/documents** | 24 hours | Supabase Storage with daily snapshots |

---

## 4. Infrastructure Architecture & Resilience

### 4.1 Application Layer (Vercel)

- **Deployment model**: Serverless functions across Vercel's global edge network
- **Auto-failover**: Vercel automatically routes traffic away from unhealthy edge nodes
- **Rollback capability**: Any previous deployment can be restored in under 5 minutes via Vercel dashboard or CLI (`vercel rollback`)
- **Zero-downtime deployments**: New deployments are atomically promoted; old version serves traffic until new version is verified
- **Geographic distribution**: Edge functions execute in regions closest to users, with automatic failover
- **Build redundancy**: Builds are cached and reproducible from Git history

### 4.2 Database Layer (Supabase)

- **PostgreSQL hosting**: Managed Supabase instance (eu-west-1)
- **Point-in-time recovery (PITR)**: Continuous WAL archiving enables recovery to any point within the retention window
- **Daily backups**: Automated daily snapshots retained per Supabase plan (minimum 7 days)
- **Multi-AZ**: Database replicas across availability zones for high availability
- **Connection pooling**: PgBouncer handles connection management and survives transient failures
- **Read replicas**: Available for scaling read operations and providing standby failover

### 4.3 DNS & Edge

- **Primary DNS**: GoDaddy nameservers with Vercel edge routing
- **TLS termination**: Automatic certificate provisioning and renewal via Vercel
- **DDoS protection**: Vercel edge network provides L3/L4/L7 DDoS mitigation
- **CDN caching**: Static assets cached globally with automatic invalidation on deploy

---

## 5. Disaster Scenarios & Response Procedures

### 5.1 Scenario: Application Failure (Code Defect)

**Detection**: Sentry error rate spike, Vercel function error alerts
**Response**:
1. Identify failing deployment in Vercel dashboard
2. Execute rollback to last known good deployment (`vercel rollback` — completes in <5 minutes)
3. Notify affected clients if downtime exceeded 15 minutes
4. Investigate root cause in rolled-back environment
5. Deploy fix through standard CI/CD pipeline with additional review

**Estimated recovery**: <15 minutes

### 5.2 Scenario: Database Unavailability

**Detection**: Supabase health check failures, application connection errors in Sentry
**Response**:
1. Check Supabase status page (status.supabase.com) for platform-wide incidents
2. If platform issue: monitor for resolution, activate read-only mode if available
3. If project-specific: contact Supabase support via dashboard ticket
4. If data corruption: initiate PITR to last known good state
5. Verify data integrity post-recovery using checksums and record counts
6. Notify clients of any data loss window (RPO breach)

**Estimated recovery**: 1-4 hours depending on scenario

### 5.3 Scenario: Third-Party Service Outage

**Detection**: Integration health checks fail, API timeout alerts
**Response**:

| Service | Fallback | Impact |
|---------|----------|--------|
| Anthropic (AI) | Graceful degradation — AI features disabled, manual workflows available | AI triage, chatbot unavailable |
| ElevenLabs (Voice) | Text-only responses | Voice synthesis unavailable |
| Sentry (Monitoring) | Console logging continues | Reduced observability |
| Payment gateway | Queue transactions for retry | Payment processing delayed |
| Lab interfaces (HL7/FHIR) | Queue incoming messages | Lab results delayed |

**Estimated recovery**: Dependent on third-party resolution

### 5.4 Scenario: Security Breach / Ransomware

**Detection**: Sentry anomaly alerts, audit log anomalies, external notification
**Response**:
1. Activate Incident Response Plan (docs/audit-package/INCIDENT-RESPONSE-PLAN.md)
2. Isolate affected systems immediately
3. Preserve forensic evidence before any remediation
4. Assess data exposure scope
5. If ransomware: DO NOT pay ransom. Restore from clean backup.
6. Rebuild affected components from Git source and clean database backup
7. Rotate all credentials and secrets
8. Notify clients and regulators per POPIA requirements

**Estimated recovery**: 4-24 hours for service restoration; investigation ongoing

### 5.5 Scenario: Complete Data Centre Failure

**Detection**: Full platform unavailability
**Response**:
1. Vercel: automatic failover to alternative edge regions (transparent to users)
2. Supabase: contact support for region failover or restore from backup to new region
3. If prolonged: provision new Supabase project, restore from latest backup
4. Update DNS and environment variables to point to new infrastructure
5. Verify all integrations and run smoke tests
6. Notify all clients with updated status

**Estimated recovery**: 2-8 hours

---

## 6. Communication Plan During Outage

### 6.1 Internal Communication

| Timeline | Action | Channel |
|----------|--------|---------|
| 0-15 min | Alert Incident Commander (MD) | Phone + SMS |
| 0-30 min | Assemble response team | Secure messaging |
| Every 30 min | Internal status update | Team channel |
| Resolution | Post-incident debrief scheduled | Email |

### 6.2 Client Communication

| Timeline | Action | Channel |
|----------|--------|---------|
| Within 30 min | Acknowledge issue on status page | Status page / Email |
| Every 1 hour | Progress update | Email to primary contacts |
| Resolution | Confirmation + summary | Email |
| Within 5 days | Post-incident report | Email + document |

### 6.3 Communication Templates

**Initial Notification:**
```
Subject: VisioHealth OS — Service Disruption [REF-YYYY-NNN]

We are aware of a service disruption affecting [specific services].
Our team is actively investigating and working to restore normal operations.

Current Status: [Investigating / Identified / Restoring]
Estimated Recovery: [Time estimate or "under assessment"]

We will provide updates every [30 min / 1 hour].
```

**Resolution Notification:**
```
Subject: VisioHealth OS — Service Restored [REF-YYYY-NNN]

Normal service has been restored as of [timestamp].

Duration: [X hours Y minutes]
Root Cause: [Brief description]
Data Impact: [None / Details if applicable]

A detailed post-incident report will follow within 5 business days.
```

---

## 7. Escalation Matrix

| Level | Trigger | Responder | Authority |
|-------|---------|-----------|-----------|
| **L1** | Service degradation, single-tenant impact | Technical Lead | Rollback deployments, restart services |
| **L2** | Service outage >30 min, multi-tenant impact | Technical Lead + MD | Activate DR procedures, client communication |
| **L3** | Data loss or breach, regulatory impact | MD + Legal Counsel | Regulatory notification, external forensics |
| **L4** | Catastrophic failure, all services down | MD + Board | Invoke full BCP, activate alternative infrastructure |

---

## 8. Backup Verification & Testing

### 8.1 Regular Testing Schedule

| Test | Frequency | Description |
|------|-----------|-------------|
| Backup restoration test | Quarterly | Restore latest backup to test environment, verify data integrity |
| Failover drill | Quarterly | Simulate primary failure, verify automatic failover |
| Full DR exercise | Annually | End-to-end recovery from simulated catastrophic failure |
| Communication test | Semi-annually | Verify all contact details and escalation paths |
| Rollback test | Monthly | Deploy and rollback to verify deployment pipeline |

### 8.2 Test Documentation

Each test must document:
- Date and participants
- Scenario simulated
- Actual recovery time vs. RTO target
- Issues encountered
- Corrective actions required
- Sign-off by Information Officer

---

## 9. Maintenance & Review

- This plan is reviewed and updated semi-annually (March and September)
- Updated immediately after any actual disaster recovery event
- Updated when significant infrastructure changes occur
- All changes require Information Officer approval
- Current version maintained in source control (docs/policies/)

---

## 10. Related Documents

- Information Security Policy
- Incident Response Plan
- Key Rotation Policy
- Sub-Processor Register
- Security Posture Assessment

---

*This document is provided for vendor assessment purposes only. Distribution or reproduction without written consent from Visio Research Labs (Pty) Ltd is prohibited.*

**Approved by:** David Hampton, Managing Director & Information Officer
**Entity:** Visio Research Labs (Pty) Ltd
**Contact:** david@visiolabs.co.za
