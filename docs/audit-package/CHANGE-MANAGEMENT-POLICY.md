# VisioHealth OS — Change Management Policy

**Software Change Control & Deployment Procedures**
**Prepared by:** Visio Research Labs (Pty) Ltd
**Document Classification:** Confidential — For Vendor Assessment Only
**Version:** 2.0
**Date:** March 2026
**Next Review:** September 2026

---

## 1. Purpose

This policy defines the procedures for managing changes to the VisioHealth OS platform, ensuring that all modifications are controlled, tested, reviewed, and deployed in a manner that minimises risk to patient data, system availability, and service quality.

---

## 2. Scope

This policy applies to all changes to:
- Application source code (frontend and backend)
- Database schema and migrations
- Infrastructure configuration
- Environment variables and secrets
- Third-party dependencies
- AI model configurations and prompts
- Integration endpoints (HL7v2, FHIR, claims switches)

---

## 3. Change Classification

| Category | Description | Approval Required | Examples |
|----------|-------------|-------------------|---------|
| **Standard** | Pre-approved, low-risk changes following established procedures | Technical Lead | Dependency updates (non-major), UI copy changes, bug fixes with tests |
| **Normal** | Changes requiring review and testing | Technical Lead + MD | New features, API changes, database migrations, integration changes |
| **Emergency** | Critical fixes for production incidents | MD (retrospective review) | Security patches, data integrity fixes, service outage remediation |
| **Major** | Significant architectural or security changes | MD + Client notification | Infrastructure changes, new sub-processors, authentication changes, encryption changes |

---

## 4. Change Control Process

### 4.1 Standard Deployment Pipeline

```
  DEVELOPER              CODE REVIEW             STAGING              PRODUCTION
     |                      |                      |                      |
     |  1. Create feature   |                      |                      |
     |     branch (Git)     |                      |                      |
     |  2. Write code +     |                      |                      |
     |     tests            |                      |                      |
     |  3. Self-review      |                      |                      |
     |  4. Push + open      |                      |                      |
     |     Pull Request     |                      |                      |
     |--------------------->|                      |                      |
     |                      |  5. Automated checks: |                      |
     |                      |     - Type checking   |                      |
     |                      |     - Linting         |                      |
     |                      |     - Unit tests      |                      |
     |                      |     - Build verify    |                      |
     |                      |     - Secrets scan    |                      |
     |                      |  6. Peer code review  |                      |
     |                      |  7. Approval          |                      |
     |                      |--------------------->|                      |
     |                      |                      |  8. Auto-deploy to   |
     |                      |                      |     staging (preview) |
     |                      |                      |  9. Smoke test on    |
     |                      |                      |     staging URL      |
     |                      |                      | 10. Verify no        |
     |                      |                      |     regressions      |
     |                      |                      |--------------------->|
     |                      |                      |                      | 11. Merge to main
     |                      |                      |                      | 12. Auto-deploy
     |                      |                      |                      | 13. Post-deploy
     |                      |                      |                      |     verification
     |                      |                      |                      | 14. Monitor for
     |                      |                      |                      |     errors (Sentry)
```

### 4.2 Version Control

| Practice | Implementation |
|----------|---------------|
| Version Control System | Git (GitHub) |
| Branching Strategy | Feature branches from `main`, merged via Pull Request |
| Commit Requirements | Descriptive commit messages, atomic commits |
| Branch Protection | `main` branch protected — direct pushes prohibited |
| Code Ownership | All code changes require at least one reviewer |
| History | Full audit trail of every code change (who, what, when) preserved in Git history |

### 4.3 Code Review Requirements

All changes (except emergency patches) must pass code review before merging. Reviewers verify:

- [ ] Code correctness and logic
- [ ] Security implications (authentication, authorisation, data exposure)
- [ ] Database migration safety (backward compatibility, data preservation)
- [ ] No hardcoded secrets, credentials, or PII in code
- [ ] Error handling and logging (no PII in logs)
- [ ] Test coverage for new functionality
- [ ] API backward compatibility (or documented breaking change)
- [ ] Performance impact assessment
- [ ] POPIA/privacy implications of data handling changes

### 4.4 Automated Checks

The following automated checks run on every Pull Request:

| Check | Tool | Blocking |
|-------|------|----------|
| TypeScript type checking | `tsc --noEmit` | Yes |
| Code linting | ESLint | Yes |
| Build verification | Next.js build | Yes |
| Dependency vulnerability scan | npm audit | Advisory (Critical = blocking) |
| Secrets detection | Git hooks | Yes |
| Automated tests | Vitest | Yes |

---

## 5. Database Migration Policy

Database schema changes receive additional scrutiny due to their impact on data integrity.

| Requirement | Detail |
|-------------|--------|
| Migration tool | Prisma Migrate (versioned, declarative migrations) |
| Backward compatibility | Required — migrations must not break the running application |
| Data preservation | No data loss permitted. Destructive operations (column drops, table drops) require explicit approval and data backup verification. |
| Rollback plan | Every migration must have a documented rollback procedure |
| Testing | Migrations tested on staging with representative data before production |
| Backup | Database backup taken immediately before production migration |

---

## 6. Environment Management

| Environment | Purpose | Data | Access |
|------------|---------|------|--------|
| **Development** | Local developer workstations | Synthetic/seed data only | Developers |
| **Staging** | Pre-production verification (Vercel Preview) | Synthetic data, production-like schema | Technical team |
| **Production** | Live system | Real patient/practice data | Restricted (deployment pipeline only) |

### Environment Variable Security
- Secrets stored in Vercel encrypted environment variables
- Per-environment variable scoping (dev/preview/production)
- No secrets in source code or Git history
- Secret rotation performed when team members change or on annual schedule

---

## 7. Emergency Change Procedure

For production incidents requiring immediate remediation:

1. **Assess**: Confirm the incident and determine if an emergency change is required
2. **Authorise**: Managing Director verbal/written approval (retrospective formal approval within 24 hours)
3. **Implement**: Direct fix to production branch, bypassing standard review if necessary
4. **Test**: Verify fix resolves the incident without introducing regressions
5. **Deploy**: Deploy via standard pipeline (automated) or manual deployment if pipeline is affected
6. **Document**: Within 24 hours:
   - Create retrospective Pull Request documenting the change
   - Record incident reference
   - Complete post-incident review
   - Verify change passes all standard checks retroactively

---

## 8. Rollback Procedures

### Application Rollback
- Vercel maintains deployment history for all production deployments
- Instant rollback to any previous deployment via Vercel dashboard or CLI
- Rollback does not require code changes — it repoints production to a previous build
- Target: rollback executable within 5 minutes of decision

### Database Rollback
- Point-in-time recovery available (30-day window)
- Migration rollback scripts maintained for each schema migration
- Pre-migration backup enables full restoration if needed
- Target: database rollback within 1 hour

### Rollback Decision Authority
- Technical Lead may initiate application rollback for non-data issues
- Managing Director approval required for database rollback
- Any rollback involving data loss requires client notification

---

## 9. Change Log & Release Notes

| Practice | Detail |
|----------|--------|
| Change log format | Semantic versioning (MAJOR.MINOR.PATCH) |
| Release notes | Published for each production deployment |
| Client notification | Major version changes communicated to clients in advance |
| Changelog access | Available to clients on request |

### Version Numbering

| Change Type | Version Impact | Example |
|-------------|---------------|---------|
| Breaking changes, major features | MAJOR (X.0.0) | New authentication system |
| New features, backward-compatible | MINOR (0.X.0) | New report type, new integration |
| Bug fixes, patches | PATCH (0.0.X) | Error fix, dependency update |

---

## 10. Deployment Schedule

| Window | Timing | Change Types |
|--------|--------|-------------|
| Standard deployment | Business hours (Mon–Fri, 08:00–17:00 SAST) | Standard, Normal |
| Maintenance window | Sunday 02:00–06:00 SAST | Major (with advance notice) |
| Emergency | Anytime | Emergency only |

### Client Notification for Planned Maintenance
- **Standard/Normal**: No notification required (zero-downtime deployments)
- **Major**: 5 business days advance notice
- **Maintenance window**: 48 hours advance notice
- **Emergency**: Notification as soon as reasonably possible

---

## 11. Compliance Considerations

### Changes Affecting Patient Data
Any change that alters how patient data is collected, processed, stored, or shared triggers an additional review:
- Privacy impact assessment (informal for minor changes, formal for significant changes)
- POPIA compliance check
- Data flow diagram update if data flows change
- Sub-processor register update if new processors are introduced
- Client notification if data processing materially changes

### Audit Trail
All changes to the production system are traceable:
- Git commit history (who, what, when, why)
- Pull Request review history (who approved, comments)
- Deployment logs (when deployed, by what trigger)
- Sentry release tracking (errors correlated to specific releases)

---

*This document is provided for vendor assessment purposes only. Distribution or reproduction without written consent from Visio Research Labs (Pty) Ltd is prohibited.*

**Contact:** David Hampton, Managing Director
**Email:** david@visiolabs.co.za
**Entity:** Visio Research Labs (Pty) Ltd
