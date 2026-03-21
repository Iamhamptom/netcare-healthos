# Key & Secret Rotation Policy

**Visio Research Labs (Pty) Ltd / VisioHealth OS**
**Document Classification:** Confidential
**Version:** 1.0
**Effective Date:** March 2026
**Next Review:** March 2027 (Annual)
**Owner:** Technical Lead

---

## 1. Purpose

This policy defines the schedule, procedures, and responsibilities for rotating cryptographic keys, secrets, and credentials used by the VisioHealth OS platform. Regular rotation limits the window of exposure if a key is compromised and is a requirement for ISO 27001 compliance.

---

## 2. Scope

All cryptographic keys, API keys, tokens, and secrets used in development, staging, and production environments, including:

- JWT signing secrets
- Encryption keys (HealthBridge, field-level encryption)
- Third-party API keys (Anthropic, ElevenLabs, Supabase, payment gateways)
- Database connection strings
- Webhook signing secrets
- Service-to-service authentication tokens

---

## 3. Rotation Schedule

### 3.1 Scheduled Rotation

| Secret | Rotation Period | Next Rotation | Owner |
|--------|----------------|---------------|-------|
| `JWT_SECRET` | Every 90 days | June 2026 | Technical Lead |
| `HEALTHBRIDGE_ENCRYPTION_KEY` | Every 180 days | September 2026 | Technical Lead |
| `SUPABASE_SERVICE_ROLE_KEY` | Every 180 days | September 2026 | Technical Lead |
| `ANTHROPIC_API_KEY` | Every 180 days or on personnel change | September 2026 | Technical Lead |
| `ELEVENLABS_API_KEY` | Every 180 days | September 2026 | Technical Lead |
| `SENTRY_AUTH_TOKEN` | Every 365 days | March 2027 | Technical Lead |
| Payment gateway keys (Yoco, Paystack) | Every 365 days | March 2027 | Technical Lead |
| Webhook signing secrets | Every 180 days | September 2026 | Technical Lead |
| `GATEWAY_API_KEY` (external agent auth) | Every 90 days | June 2026 | Technical Lead |

### 3.2 Event-Triggered Rotation (Immediate)

Rotate immediately when:

- Personnel with access to secrets leaves the organisation or changes role
- A secret is suspected or confirmed to be compromised
- A secret is accidentally committed to source control
- A third-party sub-processor reports a breach
- A security audit identifies key management deficiencies

---

## 4. Rotation Procedures

### 4.1 JWT_SECRET Rotation

**Impact**: All active user sessions will be invalidated. Users must re-authenticate.

**Procedure**:
1. Generate new JWT secret: `openssl rand -base64 64`
2. Update the secret in Vercel environment variables (Production + Preview): `vercel env add JWT_SECRET production`
3. Update the secret in local `.env.local` for development
4. Trigger a new production deployment to pick up the new secret
5. Monitor Sentry for authentication errors post-rotation
6. Verify login flow works correctly
7. Document rotation in the Key Rotation Log (Section 7)

**Rollback**: If issues arise, restore previous JWT_SECRET value in Vercel env vars and redeploy.

### 4.2 HEALTHBRIDGE_ENCRYPTION_KEY Rotation

**Impact**: Data encrypted with the old key must be re-encrypted. This requires a migration.

**Procedure**:
1. Generate new encryption key: `openssl rand -base64 32`
2. Set new key as `HEALTHBRIDGE_ENCRYPTION_KEY_NEW` in environment variables
3. Deploy migration script that:
   a. Reads each encrypted field using the OLD key
   b. Re-encrypts with the NEW key
   c. Writes back to the database
   d. Logs each record processed for audit
4. Verify all records are re-encrypted by checking decryption with new key
5. Rename `HEALTHBRIDGE_ENCRYPTION_KEY_NEW` to `HEALTHBRIDGE_ENCRYPTION_KEY`
6. Remove old key from environment
7. Deploy updated application
8. Verify field-level decryption in production

**Rollback**: Keep old key available for 30 days after rotation. If re-encryption failed for any records, decrypt with old key and re-encrypt.

### 4.3 Third-Party API Key Rotation

**Procedure** (general):
1. Generate new key in the third-party provider's dashboard
2. Update the key in Vercel environment variables
3. Deploy to pick up new key
4. Verify integration functionality (make test API call)
5. Revoke the old key in the provider's dashboard (only after verifying new key works)
6. Document in Key Rotation Log

### 4.4 Supabase Service Role Key Rotation

**Impact**: All server-side Supabase operations use this key.

**Procedure**:
1. Generate new service role key via Supabase dashboard (Settings > API)
2. Update `SUPABASE_SERVICE_ROLE_KEY` in Vercel environment variables
3. Update local `.env.local`
4. Deploy to production
5. Verify database operations (CRUD, RLS bypass for admin) work correctly
6. Monitor for 24 hours for any authentication failures
7. Document in Key Rotation Log

---

## 5. Emergency Rotation (Suspected Compromise)

When a key is suspected or confirmed compromised:

### 5.1 Immediate Actions (within 1 hour)

1. **Assess scope**: Determine which key(s) are affected and potential data exposure
2. **Rotate immediately**: Follow the relevant rotation procedure above
3. **Revoke old key**: Immediately revoke/invalidate the compromised key
4. **Audit access**: Review audit logs for unauthorised usage during the exposure window
5. **Notify Incident Commander**: Activate Incident Response Plan if data breach is suspected

### 5.2 Follow-Up Actions (within 24 hours)

1. Document the incident in the Key Rotation Log with "EMERGENCY" classification
2. Investigate root cause of compromise
3. Implement preventive measures (e.g., improved secret storage, access restrictions)
4. If PHI exposure is confirmed, follow POPIA breach notification procedures
5. Update this policy if new risks are identified

---

## 6. Secret Storage Requirements

- **Production secrets**: Stored exclusively in Vercel environment variables (encrypted at rest)
- **Development secrets**: Stored in `.env.local` (git-ignored, never committed)
- **No secrets in source code**: Enforced by pre-commit hooks and CI/CD checks
- **No secrets in logs**: Application code must never log secret values
- **No secrets in error messages**: Sanitise all error output
- **Access control**: Only the Technical Lead and Information Officer have access to production environment variables
- **Audit trail**: All changes to Vercel environment variables are logged by Vercel

---

## 7. Key Rotation Log

| Date | Secret | Type | Performed By | Verified By | Notes |
|------|--------|------|-------------|-------------|-------|
| 2026-03-21 | All secrets | Initial setup | Technical Lead | IO | Platform launch configuration |
| | | | | | |

*This log must be updated for every rotation event.*

---

## 8. Compliance Mapping

| Requirement | Control |
|------------|---------|
| ISO 27001 A.10.1 | Cryptographic key management lifecycle |
| ISO 27001 A.9.4 | System and application access control |
| POPIA Section 19 | Security safeguards for personal information |
| SA HNSF | Encryption requirements for health data interoperability |

---

## 9. Review & Maintenance

- This policy is reviewed annually or after any emergency rotation event
- The Key Rotation Log is reviewed quarterly by the Information Officer
- Automated reminders are set for scheduled rotation dates
- Non-compliance with rotation schedules is reported as a security finding

---

*This document is provided for vendor assessment purposes only. Distribution or reproduction without written consent from Visio Research Labs (Pty) Ltd is prohibited.*

**Approved by:** David Hampton, Managing Director & Information Officer
**Entity:** Visio Research Labs (Pty) Ltd
**Contact:** david@visiolabs.co.za
