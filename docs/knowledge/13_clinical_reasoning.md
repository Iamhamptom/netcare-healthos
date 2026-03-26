I now have comprehensive data from the existing knowledge base and codebase. Let me now create the comprehensive knowledge document.

---

The comprehensive knowledge document has been created. Here is a summary of what was produced:

---

**Created:** `/Users/hga/netcare-healthos/docs/knowledge/22_sa_claims_reasoning_patterns.md`

**Updated:** `/Users/hga/netcare-healthos/docs/knowledge/00_INDEX.md` (added file 22 to index)

The document covers all 5 requested areas across 6 main parts plus 3 appendices:

**Part 1 — SA GP Clinical Reasoning:**
- The 7-step cognitive workflow GPs follow during consultations (triage through documentation)
- Three ICD-10 coding methods (memory 70%, PMS dropdown 25%, reference 5%) with error patterns for each
- Detailed consultation code decision framework (0190-0199) with real GP decision language, upcoding detection math (40 patients x 25min = impossible), and downcoding problem
- Investigation ordering decision tree (pathology vs radiology vs specialist referral)
- GP scope for in-room procedures (17 procedures legitimately billable by GP)
- SA-specific clinical protocol decision points for SEMDSA diabetes, SASHA hypertension, and GINA/SATS asthma — with billing implications mapped to each treatment step

**Part 2 — Billing Clerk Reasoning:**
- Complete clerk workflow (receive, interpret, assemble, validate, submit, handle)
- 20-entry abbreviation-to-ICD-10 translation table showing what doctors say vs what clerks code
- The 12 most common clerk mistakes with causes and consequences
- Complete 5-step claim submission workflow with decision points
- Rejection handling process: classification (correctable/appealable/uncollectable), correction decision tree by rejection code, resubmission mechanics, appeal escalation path

**Part 3 — Scheme Adjudication:**
- Complete 13-gate adjudication pipeline with timing estimates and failure modes
- 25 most common rejection codes with trigger conditions, resubmission guidance, and percentage distribution
- Scheme-specific differences: Discovery (78% auto-adjudication, clawbacks), GEMS (9-digit membership, 60-day disputes), Bonitas (4-tier formulary, 30% co-pay), Momentum (strict pre-auth)
- CDL/PMB routing logic (complete decision trees for chronic and PMB claims)
- Pre-authorization workflows by service category

**Part 4 — Psychology of Errors:**
- Why R-codes are used as primary (4 reasons with percentages and AI response for each)
- Why GPs bill "specialist" tariffs (legitimate vs illegitimate, with the critical AI distinction)
- Why amounts exceed scheme rates (legal background since 2010 NHRPL invalidation, severity framework)
- Why dependent codes don't match age (sequential registration, not age-based)
- Billing psychology by practice type (solo GP, group, specialist, day hospital, pharmacy, allied health)

**Part 5 — SA Specific Context:**
- HPCSA ethical billing guidelines (Booklet 20, fees, violations with penalties)
- CMS rules (Sections 26, 29, 49, 59, Regulations 8, 10(6))
- Medical Schemes Act key provisions
- PHISC MEDCLM EDI specification (message structure, rules, encoding)
- BHF practice number structure (DD + NNNNN format, complete discipline prefix table with 30+ entries)

**Part 6 — AI Decision Frameworks:**
- "What would a reasonable clerk do?" test with pass/fail examples
- GP vs Specialist scope matrix (12 tariff ranges with billing permissions)
- Severity classification framework (ERROR/WARNING/INFO with definitions)
- 10 false positive prevention rules

**Appendices:**
- A: Top 50 GP diagnosis codes with CDL status
- B: Seasonal rejection calendar with AI sensitivity adjustments
- C: Complete rejection code reference with correctability

The document is approximately 1,100 lines and draws from the existing 21-file knowledge base, the codebase's validation engine, scheme rules, and advanced rules implementations, supplemented with domain expertise from SA medical coding standards, HPCSA guidelines, CMS regulations, and clinical protocol frameworks.

---

