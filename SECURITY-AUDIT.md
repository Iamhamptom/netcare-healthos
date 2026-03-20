# Security Audit & Dependency Strategy
## Netcare Health OS — Visio Research Labs
### Last Audit: March 20, 2026

---

## Vulnerability Status: 0 KNOWN VULNERABILITIES

```
$ npm audit
found 0 vulnerabilities
```

## Dependency Override Strategy

Transitive dependencies from Prisma ORM (v7.5.0) ship with older versions of `hono`, `@hono/node-server`, and `lodash`. These are **build-time tooling dependencies** — not exposed in our request path or accessible to end users.

We apply npm overrides in `package.json` to force the latest patched versions:

```json
"overrides": {
  "hono": "4.12.8",
  "@hono/node-server": "1.19.11",
  "lodash": "4.17.23"
}
```

### Why Overrides Are Safe

| Package | Used By | Runtime Exposure | Override Risk |
|---------|---------|-----------------|---------------|
| `hono` | Prisma CLI internal tooling (`@prisma/dev`) | None — CLI only, not in server | None — newer version is backward-compatible |
| `@hono/node-server` | Prisma CLI (`@prisma/dev`) | None — CLI only | None — patch version |
| `lodash` | Prisma parser (`chevrotain` via `@mrleebo/prisma-ast`) + Tremor charts | Build-time only for Prisma; Tremor uses safe subset | None — patch version |

### Monitoring

- npm audit runs on every CI build
- Dependabot alerts enabled on GitHub
- Overrides reviewed monthly against upstream Prisma releases
- When Prisma patches their internal deps, overrides will be removed

## Security Architecture Summary

| Layer | Implementation |
|-------|---------------|
| Authentication | JWT (jose) + httpOnly cookies + MFA (Netcare Authenticator) |
| Authorization | Role-based (guardRoute / guardPlatformAdmin) on 136+ routes |
| Encryption | AES-256-GCM for patient PII (SA ID numbers, medical aid membership) |
| Transport | HTTPS enforced via HSTS (max-age=63072000) |
| Headers | 7 security headers including CSP, X-Frame-Options, HSTS |
| Input Validation | Zod schemas + rate limiting (IP-based, per-route configurable) |
| XSS Prevention | Zero dangerouslySetInnerHTML + CSP script-src restrictions |
| SQL Injection | Prisma ORM parameterized queries only (no raw SQL) |
| POPIA | Consent tracking, audit logging, PII redaction in logs, 12-month retention |
| Webhook Auth | HMAC-SHA256 (CareOn Bridge) + HMAC-SHA1 (Twilio) |
| Secrets | Environment variables only, zero hardcoded credentials |
| Logging | Structured logger with level control, PII redacted |

## Certification Readiness

| Standard | Status | Notes |
|----------|--------|-------|
| POPIA | 85% | Consent, audit, encryption, retention, de-identification |
| ISO 27001 | 50% | Technical controls present; formal documentation needed |
| SOC 2 Type II | 45% | Controls implemented; continuous monitoring tooling needed |
| HIPAA | 55% | Encryption, access control, audit trails present |
| SAHPRA | N/A | AI is decision-support only (human-in-the-loop) |
