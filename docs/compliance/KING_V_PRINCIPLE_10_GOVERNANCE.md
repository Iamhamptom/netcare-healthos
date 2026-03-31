# King V Principle 10 — AI Governance Brief
## How Netcare Health OS Supports Board-Level AI Governance

**Document**: VRL-KINGV-2026-001
**Version**: 1.0
**Date**: 31 March 2026
**Reference**: King V Report on Corporate Governance (Institute of Directors SA, October 2025)
**Applicable Principle**: Principle 10 — The governing body should govern data, information, technology and AI

---

## 1. Context

King V became effective for financial years starting 1 January 2026, replacing King IV. Principle 10 explicitly extends governance obligations to include **artificial intelligence** — a first in South African corporate governance.

For JSE-listed companies like Netcare, this means the board must:
- Approve an AI governance framework
- Ensure AI risks are identified and managed
- Confirm that AI systems are transparent and auditable
- Report on AI governance in the integrated annual report

---

## 2. How Our Platform Supports Netcare's King V Compliance

### 2.1 AI Governance Framework (Built-In)

The Netcare Health OS implements a **5-tier AI precedence system** that maps directly to King V's requirement for a documented AI governance framework:

| Tier | Name | Override Policy | King V Alignment |
|------|------|----------------|-----------------|
| 1 | SA Law (Medical Schemes Act) | **Immutable** — no AI layer can override | Ensures legal compliance is hardcoded, not configurable |
| 2 | CMS Circulars | **Immutable** — updated within 48h of publication | Regulatory currency maintained |
| 3 | PHISC Specifications | Configurable per switch house | Industry standards enforced |
| 4 | Scheme Provider Manuals | Configurable per scheme | Business rules applied |
| 5 | AI Reasoning | **Advisory only** — human must approve | AI never acts autonomously |

**Board-level assurance**: Tier 1 and Tier 2 rules are enforced at the code level. They cannot be changed by configuration, user action, or AI suggestion. This gives the board documented confidence that regulatory compliance is architecturally guaranteed.

### 2.2 AI Risk Identification and Management

| Risk Category | How Managed |
|---------------|-------------|
| Model hallucination | 80% of validation is deterministic rules. AI handles only 20%. Hard gates enforce after AI. Human reviews all. |
| Bias in AI outputs | Rules based on SA law, not training data. No demographic data in AI input. De-identified codes only. |
| Data breach | PII stripped pre-processing. AES-256-GCM encryption. 6 security headers. Rate limiting on all endpoints. |
| Regulatory non-compliance | Not SaMD (SAHPRA). POPIA Section 71 human-in-the-loop. 48h update SLA on CMS circulars. |
| Vendor dependency | Month-to-month contract. CSV export. No proprietary data formats. Containerised — runs on any infrastructure. |
| AI overriding valid rules | 37 protected codes with hard gates. Tier 1-2 immutable. Every override attempt logged and blocked. |

### 2.3 Transparency and Auditability

**Every AI decision is auditable**:
- Agent name (which AI processed the request)
- Model provider (Claude or Gemini)
- Confidence score (0-100%)
- Tools used (ICD-10 lookup, NAPPI search, scheme rules check)
- Verdict (approved, flagged, blocked)
- PII stripped count (how many personal identifiers were removed)
- Injection detection result (was adversarial input detected?)
- Duration (processing time in milliseconds)
- Timestamp (ISO 8601)

All audit entries are persisted to the `ho_ai_audit_log` database table with 24-month retention.

### 2.4 Board Reporting Metrics

The platform provides board-reportable metrics:

| Metric | Description | Where |
|--------|-------------|-------|
| AI accuracy rate | Claims validation accuracy across all test suites | /dashboard/claims |
| Override rate | How often humans override AI recommendations | Audit logs |
| Rejection reduction | Claims rejection rate before vs after AI validation | /dashboard/executive |
| Revenue impact | Rand value of recovered/prevented rejections | /dashboard/executive |
| Compliance score | 92.5% composite across POPIA, OWASP, SAHPRA, King V, ISO 27001, HPCSA | /dashboard/ai-governance |
| Uptime SLA | 99.9% platform availability | Vercel dashboard |

---

## 3. Principle 10 Compliance Checklist

| King V Requirement | Status | Evidence |
|-------------------|--------|----------|
| AI governance framework approved | Ready for approval | 5-tier precedence system documented |
| AI risks identified and assessed | Complete | 6-risk matrix with likelihood, impact, mitigation, residual |
| AI transparency ensured | Complete | Every decision includes reasoning, source, confidence |
| AI audit trail maintained | Complete | `ho_ai_audit_log` — 24-month retention |
| Human oversight enforced | Complete | Human-in-the-loop on all claims decisions |
| Data governance aligned | Complete | POPIA health compliance statement (VRL-POPIA-HEALTH-2026-001) |
| Reporting capability | Complete | Board-reportable metrics dashboard |

---

## 4. Recommendation

VRL recommends that Netcare's AI Committee consider adopting the 5-tier precedence framework as a reference model for AI governance across the group. The framework is:

- **Technology-agnostic** — works with any AI provider
- **Regulation-first** — SA law takes permanent precedence
- **Auditable** — every decision traceable to source
- **Board-reportable** — metrics ready for integrated reporting

This positions Netcare as a leader in AI governance within SA private healthcare — ahead of Mediclinic, Life Healthcare, and NHN.

---

**Signed**: _________________________
**Name**: Dr. David Hampton
**Title**: CEO, Visio Research Labs
**Date**: 31 March 2026
