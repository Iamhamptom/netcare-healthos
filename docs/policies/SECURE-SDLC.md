# Secure Software Development Lifecycle (SDLC)

**Visio Research Labs (Pty) Ltd / VisioHealth OS**
**Document Classification:** Confidential
**Version:** 1.0
**Effective Date:** March 2026
**Next Review:** March 2027 (Annual)
**Owner:** Technical Lead

---

## 1. Purpose

This document defines the secure development practices, tools, and procedures used in the VisioHealth OS development lifecycle. It ensures that security is integrated at every stage of development, from design through deployment and maintenance.

---

## 2. Scope

- All application code for the VisioHealth OS platform
- Infrastructure configuration (Vercel, Supabase, DNS)
- Third-party dependency management
- CI/CD pipeline configuration
- Database schema changes and migrations

---

## 3. Development Environment

### 3.1 Technology Stack

| Component | Technology | Security Relevance |
|-----------|-----------|-------------------|
| Framework | Next.js 16.1.6 | Server-side rendering, API routes with built-in CSRF protection |
| Language | TypeScript (strict mode) | Compile-time type checking prevents type confusion vulnerabilities |
| Database | PostgreSQL via Supabase | Row-Level Security (RLS), parameterised queries prevent SQL injection |
| ORM | Prisma 7.x | Parameterised queries by default, schema-validated operations |
| Hosting | Vercel | Automatic HTTPS, DDoS protection, isolated serverless execution |
| Auth | Supabase Auth | Cookie-based SSR sessions, bcrypt password hashing, MFA support |

### 3.2 Environment Separation

| Environment | Purpose | Data | Access |
|------------|---------|------|--------|
| **Development** | Local development and testing | Mock/synthetic data only | Individual developer |
| **Preview** | Pull request preview deployments | Mock data, test credentials | Development team |
| **Production** | Live platform serving clients | Real patient and practice data | Restricted (Technical Lead + IO) |

**Rules**:
- Production data is NEVER copied to development or preview environments
- Each environment has its own set of credentials and API keys
- Preview deployments use separate Supabase projects or branches
- Production environment variables are only accessible to authorised personnel

---

## 4. Code Review Requirements

### 4.1 Mandatory Review

All code changes must be reviewed before merging to the main branch:

- **Minimum reviewers**: 1 (peer developer or Technical Lead)
- **Security-sensitive changes**: Require Technical Lead review
  - Authentication / authorisation logic
  - Encryption or key management
  - API route access control
  - Database schema changes affecting PHI
  - Third-party integration changes
  - Environment variable or secret handling

### 4.2 Review Checklist

Reviewers must verify:

- [ ] No secrets, credentials, or PHI in code or comments
- [ ] Input validation on all user-supplied data (Zod schemas)
- [ ] Output encoding to prevent XSS
- [ ] Authorisation checks on all API routes (tenant isolation verified)
- [ ] Rate limiting applied to new API endpoints
- [ ] Error messages do not leak sensitive information
- [ ] Database queries use parameterised statements (Prisma/Supabase client)
- [ ] New dependencies reviewed for known vulnerabilities
- [ ] Audit logging for data access and modifications
- [ ] TypeScript strict mode compliance (no `any` types without justification)

### 4.3 Automated Checks

The following run automatically on every pull request:

- TypeScript compilation (strict mode — catches type errors)
- ESLint with security rules
- Build verification (`next build` must succeed)
- `npm audit` for known dependency vulnerabilities

---

## 5. Static Analysis & Security Scanning

### 5.1 TypeScript Strict Mode

Enabled in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true
  }
}
```

This catches at compile time:
- Null/undefined reference errors
- Type confusion vulnerabilities
- Implicit any types that bypass safety checks

### 5.2 Dependency Vulnerability Scanning

- **npm audit**: Runs on every build to detect known vulnerabilities in dependencies
- **Dependabot**: Automated pull requests for dependency updates (GitHub)
- **npm overrides**: Used to patch transitive dependencies when direct updates are unavailable
- **Lock file**: `package-lock.json` committed to ensure reproducible builds

### 5.3 Secret Detection

- `.env.local` is git-ignored (listed in `.gitignore`)
- Pre-commit review ensures no secrets are committed
- Environment variables are managed exclusively through Vercel dashboard
- `NEXT_PUBLIC_` prefix convention ensures only safe values are exposed to the client

---

## 6. Secure Coding Standards

### 6.1 Input Validation

- All API route inputs validated using Zod schemas
- Request body, query parameters, and path parameters validated before processing
- File uploads validated for type, size, and content
- SA ID numbers validated using Luhn algorithm (lib/sa-id.ts)

### 6.2 Authentication & Session Management

- Sessions managed via Supabase Auth with secure, httpOnly cookies
- SameSite cookie attribute set to prevent CSRF
- Session tokens expire and require re-authentication
- API keys hashed with SHA-256 before storage

### 6.3 Authorisation

- Every API route verifies user authentication
- Tenant isolation enforced: users can only access their own practice's data
- Role-based access control checked before sensitive operations
- Admin routes require `platform_admin` role

### 6.4 Data Protection

- PHI fields encrypted at application layer (AES-256-GCM)
- Database Row-Level Security (RLS) policies enforce tenant isolation
- API responses filtered to exclude fields the user is not authorised to see
- Bulk data export requires explicit authorisation

### 6.5 Error Handling

- Errors caught and logged to Sentry with context (no PHI in error payloads)
- User-facing error messages are generic (no stack traces, no internal details)
- API routes return appropriate HTTP status codes
- Unhandled promise rejections are caught globally

### 6.6 Logging & Audit

- All data access and modifications logged with: user ID, timestamp, action, resource
- Audit logs stored in database with integrity protections
- Logs do not contain PHI, passwords, or secret values
- Log retention: minimum 2 years

---

## 7. Deployment Pipeline

### 7.1 Pipeline Overview

```
Developer → Git Push → GitHub → Vercel Build → Preview Deploy → Review → Merge → Production Deploy
```

### 7.2 Pipeline Security Controls

| Stage | Control |
|-------|---------|
| **Git push** | Branch protection rules, signed commits recommended |
| **GitHub** | Repository access restricted to team members, 2FA required |
| **Vercel build** | `npm audit` runs, TypeScript strict compilation, ESLint checks |
| **Preview deploy** | Isolated environment, test credentials, team-only access |
| **Code review** | Mandatory approval before merge to main |
| **Production deploy** | Automatic on merge to main, zero-downtime atomic promotion |
| **Post-deploy** | Sentry monitoring for error spikes, Vercel analytics for anomalies |

### 7.3 Rollback Capability

- Any previous deployment can be instantly promoted via `vercel rollback`
- Rollback completes in under 5 minutes
- Database migrations include down-migration scripts for reversibility
- Rollback procedures documented in Business Continuity Plan

---

## 8. Dependency Management

### 8.1 Approved Dependencies

- Dependencies are evaluated for:
  - Active maintenance (recent commits, responsive maintainers)
  - Known vulnerabilities (npm audit, Snyk database)
  - License compatibility (MIT, Apache 2.0, BSD preferred)
  - Bundle size impact
  - Security track record

### 8.2 Update Process

1. Dependabot creates PR for dependency update
2. CI runs: build, lint, type-check
3. Developer reviews changelog for breaking changes and security fixes
4. Technical Lead approves security-relevant dependency changes
5. Merge and deploy

### 8.3 Vulnerability Response

| Severity | Response Time | Action |
|----------|--------------|--------|
| Critical | Within 24 hours | Patch immediately, deploy hotfix |
| High | Within 72 hours | Schedule patch in next deployment |
| Medium | Within 2 weeks | Include in next planned release |
| Low | Within 30 days | Schedule as maintenance task |

---

## 9. Database Change Management

- Schema changes managed via Prisma migrations
- All migrations reviewed before application
- Migrations include rollback (down) capability
- Schema changes affecting PHI fields require IO approval
- Production migrations run during low-traffic windows when possible
- Migration history tracked in version control

---

## 10. Security Training

- All developers complete secure coding training upon onboarding
- Annual refresher training covering OWASP Top 10 and healthcare-specific threats
- Post-incident training when security issues are identified in code review or production

---

## 11. Compliance Mapping

| Requirement | SDLC Control |
|------------|-------------|
| ISO 27001 A.14.2 | Secure development policy, change control, technical review |
| ISO 27001 A.12.6 | Technical vulnerability management |
| POPIA Section 19 | Security safeguards in software processing PI |
| SA HNSF | Secure interoperability implementation |

---

*This document is provided for vendor assessment purposes only. Distribution or reproduction without written consent from Visio Research Labs (Pty) Ltd is prohibited.*

**Approved by:** David Hampton, Managing Director & Information Officer
**Entity:** Visio Research Labs (Pty) Ltd
**Contact:** david@visiolabs.co.za
