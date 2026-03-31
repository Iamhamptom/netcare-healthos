# SAHPRA AI/ML Device Classification Analysis
## Netcare Health OS — Not a Software as Medical Device (SaMD)

**Document**: VRL-SAHPRA-2026-001
**Version**: 1.0
**Date**: 31 March 2026
**Reference**: SAHPRA Regulatory Requirements for AI/ML-Enabled Medical Devices (MD08-2025/2026)
**Classification**: NOT a Medical Device

---

## 1. Assessment Summary

Under SAHPRA's MD08-2025/2026 guidance document for AI/ML-enabled medical devices, the Netcare Health OS is classified as an **administrative claims processing tool** — NOT a Software as Medical Device (SaMD).

---

## 2. SaMD Classification Criteria

SAHPRA follows the IMDRF (International Medical Device Regulators Forum) framework. A software qualifies as SaMD if it:

| # | IMDRF Criterion | Applies to SaMD | Applies to Our System |
|---|----------------|-----------------|----------------------|
| 1 | Intended to be used for diagnosis of disease or conditions | Yes | **No** — reads existing diagnoses, does not generate new ones |
| 2 | Intended to provide treatment or prevention recommendations | Yes | **No** — suggests billing codes, not treatment protocols |
| 3 | Influences clinical decision-making | Yes | **No** — influences billing accuracy, not clinical decisions |
| 4 | Directly interfaces with patients | Yes | **No** — used by billing staff and practice administrators |
| 5 | Processes physiological signals | Yes | **No** — processes billing codes and claim data |
| 6 | Controls or monitors a medical device | Yes | **No** — standalone software, no device interface |

**Result: 0 of 6 criteria met. The system is NOT SaMD.**

---

## 3. What the System Actually Does

The Netcare Health OS performs the following functions:

### 3.1 Claims Validation (Primary Function)
- Receives claim data (ICD-10 codes, tariff codes, scheme information)
- Validates against SA coding standards and scheme-specific rules
- Flags potential rejection risks (e.g., insufficient code specificity, gender mismatch)
- Suggests corrections for flagged items
- **All suggestions require human approval before submission**

### 3.2 HL7v2 → FHIR Translation
- Receives HL7v2 messages from CareOn EMR
- Translates to FHIR R4 resources for interoperability
- No clinical interpretation — pure data format translation

### 3.3 ICD-10 Code Suggestion
- Doctor enters clinical notes
- AI suggests appropriate ICD-10 codes for billing
- Doctor reviews and approves/modifies suggestions
- **The doctor makes the clinical coding decision, not the AI**

---

## 4. SAHPRA Risk Classification (If Classified as SaMD)

Even if SAHPRA were to classify the system as SaMD, the risk would be:

| Factor | Assessment |
|--------|-----------|
| State of healthcare situation | Non-critical (billing, not acute care) |
| Significance of information | Administrative (not diagnostic) |
| Healthcare decision influenced | Billing decision (not treatment decision) |

**IMDRF Risk Category**: Would be Class A (lowest risk) — "Inform clinical management"
**SAHPRA Risk Class**: Class A — no registration required, only notification

---

## 5. Distinction from Clinical Decision Support

| Feature | Clinical Decision Support (SaMD) | Our System (Not SaMD) |
|---------|--------------------------------|----------------------|
| "Patient has symptom X → consider diagnosis Y" | Yes — influences diagnosis | **Not present** |
| "Based on labs, adjust medication dosage" | Yes — influences treatment | **Not present** |
| "AI-detected tumour on X-ray" | Yes — diagnostic AI | **Not present** |
| "ICD-10 code E11.9 lacks 4th character for Discovery" | No — billing accuracy | **This is what we do** |
| "Claim rejected: gender mismatch on obstetric code" | No — coding validation | **This is what we do** |

---

## 6. Regulatory Pathway

### 6.1 Current Position
- Self-assessment completed: NOT SaMD
- No SAHPRA registration required
- No ISO 13485 certification required
- No clinical trials required

### 6.2 If SAHPRA Requires Formal Classification
VRL is prepared to:
1. Submit a formal classification request to SAHPRA
2. Engage independent regulatory counsel (SA medical device specialist)
3. Conduct a joint classification review with Netcare's regulatory team
4. If classified as SaMD Class A: file the required notification (no clinical data needed)

### 6.3 Monitoring
VRL monitors SAHPRA publications for updates to AI/ML device guidance. Any reclassification of administrative AI tools would trigger an immediate review and compliance update.

---

## 7. Comparators

| System | SAHPRA Classification | Reasoning |
|--------|----------------------|-----------|
| Practice management software (e.g., GoodX, Elixir) | Not SaMD | Administrative tool |
| Claims switching software (e.g., Healthbridge, SwitchOn) | Not SaMD | Data transport |
| **Netcare Health OS** | **Not SaMD** | **Claims validation + coding assistance** |
| AI diagnostic imaging (e.g., RADIFY) | SaMD Class C/D | Makes diagnostic decisions |
| AI drug dosing calculator | SaMD Class B | Influences treatment |

---

**Signed**: _________________________
**Name**: Dr. David Hampton
**Title**: CEO, Visio Research Labs
**Date**: 31 March 2026
