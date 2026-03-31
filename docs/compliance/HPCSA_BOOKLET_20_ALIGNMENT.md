# HPCSA Booklet 20 — AI Ethics Alignment Assessment
## Netcare Health OS — Visio Research Labs

**Document**: VRL-HPCSA-AI-2026-001
**Version**: 1.0
**Date**: 31 March 2026
**Reference**: HPCSA Ethical Guidelines for the Use of Artificial Intelligence in Healthcare (Booklet 20, November 2025)
**Status**: First SA health tech vendor to formally align product to Booklet 20

---

## 1. Overview

The Health Professions Council of South Africa (HPCSA) published Booklet 20 in November 2025, establishing ethical guidelines for AI use in healthcare. This document maps the Netcare Health OS platform to each of the three pillars defined in the guidelines.

---

## 2. Pillar 1 — Ethical Principles

### 2.1 Patient Autonomy
| Requirement | Our Implementation |
|-------------|-------------------|
| Patients must be informed when AI is used | System generates clearly labelled outputs: "AI-suggested ICD-10 code" — never presented as doctor's decision |
| Patient consent required | Relies on Netcare's existing treatment agreements (POPIA Section 27(1)(a)). No additional patient interaction with the AI system |
| Right to opt out | Patients are not directly affected — AI assists billing staff, not patients. No patient-facing AI decisions |

### 2.2 Practitioner Accountability
| Requirement | Our Implementation |
|-------------|-------------------|
| Practitioner remains legally accountable | AI is advisory only. Every suggestion requires explicit human approval before any claim is submitted or modified |
| AI cannot replace clinical judgement | System validates billing codes, not clinical decisions. A doctor's diagnosis is never questioned or changed |
| Practitioner must understand AI output | Every AI recommendation includes plain-language reasoning, the specific rule triggered, and the regulatory source |

### 2.3 Beneficence and Non-Maleficence
| Requirement | Our Implementation |
|-------------|-------------------|
| AI must benefit the patient | Accurate claims coding = correct medical aid coverage = patient pays less out-of-pocket. PMB/CDL detection ensures patients receive entitled benefits |
| AI must not cause harm | 37 hard-gate rules prevent AI from overriding safety-critical codes. Tier 1 rules (SA law) are immutable — no AI layer can change them |
| Validated against SA population | Claims validation rules built from SA-specific ICD-10-ZA codes (41,009), SA tariff codes (CCSA), 6 SA scheme profiles. Not US/UK training data |

---

## 3. Pillar 2 — Legal Compliance

### 3.1 POPIA Compliance
- Full compliance statement available (VRL-POPIA-HEALTH-2026-001)
- Section 71 human-in-the-loop enforced architecturally
- PII stripped before AI processing (names → initials, IDs → redacted)
- Data Processing Agreement template available

### 3.2 SAHPRA Classification
- Self-assessment completed under MD08-2025/2026 guidelines
- System classified as administrative claims processing tool — NOT a Software as Medical Device (SaMD)
- Does not make clinical decisions, influence treatment, diagnose conditions, or interact with patients
- Joint legal review available if Netcare's regulatory team requires

### 3.3 Medical Schemes Act
- Validation rules sourced from Medical Schemes Act Section 59
- CMS circulars integrated within 48 hours of publication
- PMB (270 DTPs) and CDL (27 conditions) fully coded
- Tier 1 rules (SA law) cannot be overridden by any AI layer

---

## 4. Pillar 3 — Technical Standards

### 4.1 Transparency
| Requirement | Our Implementation |
|-------------|-------------------|
| No black-box reasoning | Every AI decision includes: the rule triggered, the regulatory source, the suggested correction, and a confidence level |
| Model disclosure | Dual-provider: Claude Sonnet 4 (Anthropic) primary, Gemini 2.5 Flash (Google) fallback. Models identified in all outputs |
| Decision audit trail | Every AI suggestion logged with: timestamp, model used, confidence score, tools invoked, verdict, and whether human approved/rejected |

### 4.2 Bias Prevention
| Requirement | Our Implementation |
|-------------|-------------------|
| Evaluate for SA population diversity | 80% of validation is deterministic rules (database lookup, not ML). Rules are based on SA law and scheme manuals, not demographic training data |
| No demographic data in AI input | Patient names, IDs, and demographics are stripped BEFORE AI processing. The AI sees only de-identified billing codes |
| Cultural and linguistic context | WhatsApp engagement supports English, Afrikaans, and isiZulu. Clinical terminology adapted for SA medical practice |

### 4.3 Validation and Testing
| Requirement | Our Implementation |
|-------------|-------------------|
| Validated on real-world data | Tested on 2,300+ SA claims across Discovery, GEMS, Bonitas, Medshield, Momentum, Bestmed. 95%+ accuracy on blind tests |
| Continuous monitoring | Reinforcement learning loop: every claim outcome feeds back into the system. Daily learning cycle via cron job |
| Failure handling | Dual-provider failover (Claude → Gemini → keyword fallback). Graceful degradation — never a single point of failure |

---

## 5. Compliance Matrix Summary

| Booklet 20 Requirement | Status | Evidence |
|------------------------|--------|----------|
| Patient informed of AI use | Compliant | AI outputs clearly labelled |
| Practitioner accountability preserved | Compliant | Human-in-the-loop mandatory |
| No replacement of clinical judgement | Compliant | Billing validation only |
| POPIA compliance | Compliant | Full statement available |
| SAHPRA regulatory clarity | Compliant | Not SaMD — administrative tool |
| Transparency and explainability | Compliant | Every decision includes reasoning |
| Bias evaluation for SA context | Compliant | Deterministic rules, no demographic inputs |
| Validation on SA data | Compliant | 2,300+ claims tested |
| Continuous monitoring | Compliant | Daily RL cycle + audit logging |

---

## 6. Attestation

VRL confirms that this alignment assessment reflects the current state of the Netcare Health OS platform as deployed at https://healthos.visiocorp.co. We commit to maintaining alignment as the HPCSA guidelines evolve.

**Signed**: _________________________
**Name**: Dr. David Hampton
**Title**: CEO, Visio Research Labs
**Date**: 31 March 2026
