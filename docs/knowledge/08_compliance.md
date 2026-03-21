# 08 — Health Technology Compliance Requirements
## VisioCorp Health Intelligence KB | Compiled 2026-03-21

---

## COMPLIANCE ACTION MATRIX

### Immediate (Within 30 Days)
- [ ] Register Information Officer with Information Regulator (free, inforegulator.org.za)
- [ ] Audit ALL cross-border data transfers (Anthropic, OpenAI, Google, Supabase, Vercel)
- [ ] Prepare PAIA/POPIA manual for each entity
- [ ] Implement consent management for health data with withdrawal mechanism
- [ ] Document data processing activities (record of processing)
- [ ] Establish 72-hour breach notification procedure
- [ ] Execute operator agreements with all third-party processors

### Short-Term (Within 90 Days)
- [ ] Conduct Privacy Impact Assessment per health product
- [ ] Implement data de-identification pipeline for AI API calls
- [ ] Classify each product against SAHPRA SaMD decision tree
- [ ] Begin ISO 13485 gap analysis if any product is Class B+
- [ ] Implement AES-256 at rest + TLS 1.2+ in transit
- [ ] Implement dual consent mechanism for patients 12-17

### Medium-Term (Within 12 Months)
- [ ] Obtain ISO 13485 certification if required (Class B+ devices)
- [ ] Implement IEC 62304 software lifecycle processes
- [ ] Submit SAHPRA registration for Class C/D products
- [ ] Establish post-market surveillance system
- [ ] Conduct clinical validation with SA population data
- [ ] Comprehensive audit trail for all AI-generated clinical outputs

---

## POPIA HEALTH REGULATIONS 2026 (IN FORCE 6 MARCH 2026)

- **No grace period. No transitional period.** Immediately enforceable.
- Covers 8 responsible party categories: insurers, schemes, administrators, managed care, admin bodies, pension funds, employers, institutions
- Technical controls: database security, cloud security, email security, access controls, encryption, audit trails
- Physical controls: paper file security, access controls, disposal controls
- Confidentiality: all processing under duty of confidentiality (s32(2))

---

## CROSS-BORDER AI TRANSFER (HIGHEST RISK)

**Using Anthropic/OpenAI/Google APIs with patient data = cross-border transfer (s72)**

### Requirements
1. Adequacy assessment (no published determinations — self-assess)
2. Contractual safeguards (DPA with each AI provider)
3. Explicit data subject consent (specific, informed, voluntary)
4. OR de-identification before API calls (anonymised data outside POPIA scope)

**Recommended approach**: De-identify/anonymise patient data before API calls wherever possible.

---

## SAHPRA SaMD CLASSIFICATION

### Decision Tree
| Product | Class | Registration? |
|---------|-------|---------------|
| Practice management (scheduling, billing) | A | Self-declaration |
| Claims validation (admin/billing only) | Not SaMD | No |
| Claims validation (clinical appropriateness) | B or C | May be required |
| Clinical decision support (practitioner override) | B | Required |
| AI diagnostic (influencing decisions) | C | Full review |
| Autonomous diagnostic/treatment | D | Strictest |

### ISO 13485:2016
- Mandatory from 1 June 2025
- Certificate from SAHPRA CAB by **1 April 2028**
- Covers: QMS, design controls, document control, risk management (ISO 14971), CAPA, internal audits

### IEC 62304 (Software Lifecycle)
- Required for SaMD: planning, requirements, architecture, testing, release, maintenance, risk management

---

## DATA RETENTION

| Category | Minimum Period | Source |
|----------|---------------|--------|
| Patient records (general) | 6 years from dormancy | HPCSA Booklet 9 |
| Minor patient records | Until 21st birthday | HPCSA |
| Mental health records | Patient's lifetime | Mental Health Care Act |
| Occupational health | 30-40 years | OHS Act |
| Prescriptions | 5 years | Pharmacy Act |
| Claims data | As per Medical Schemes Act | Reg 6 |

---

## BREACH NOTIFICATION

- **Trigger**: Reasonable grounds to believe unauthorized access/acquisition of personal info
- **Timeline**: "As soon as reasonably possible" — **72-hour benchmark** (Information Regulator expectation)
- **Notify**: Information Regulator AND data subject
- **Form**: Section 22 Security Compromise Notification Form (inforegulator.org.za)
- **Operator**: Must notify responsible party; responsible party notifies Regulator + subjects

---

## PENALTIES

| Type | Maximum |
|------|---------|
| Administrative fine | R10 million |
| Criminal (s105, s107) | 10 years imprisonment |
| Civil damages | Unlimited |
| Director liability | Personal criminal prosecution |

---

## OPERATOR AGREEMENTS (s21)

Every third-party processor must have a written mandate including:
1. Written instructions (process only as directed)
2. Confidentiality undertaking
3. Security safeguards
4. Breach notification to responsible party
5. Cross-border restrictions
6. Sub-processing limitations
7. Audit rights
8. Return/deletion on termination
9. Indemnity clause

---

## ELECTRONIC RECORDS (ECTA)

- Electronic health records satisfy "writing" requirement (s12)
- Electronic signatures valid for health records (s13)
- No blanket AES requirement for medical records
- AI-generated reports admissible as data messages (s15) but may face scrutiny
- Maintain audit trails: AI model used, input data, human review, modifications

---

## INFORMATION REGULATOR

- Health and insurance = **priority enforcement sectors** for 2026/27
- CEO is default Information Officer if none appointed (s55)
- Registration: free, via inforegulator.org.za
- Complaint resolution: 6-18 months in practice
- Cross-border cooperation with UK ICO and EU DPAs
