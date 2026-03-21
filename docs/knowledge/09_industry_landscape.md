# 09 — SA Healthcare Industry & Technology Landscape
## VisioCorp Health Intelligence KB | Compiled 2026-03-21

---

## MARKET SIZE
- **Total claims**: R259.3B/year (up 8.52%)
- **Healthcare IT market**: $2.76B (2025) → $5.71B by 2034 (8.40% CAGR)
- **76 schemes**, 9.17M beneficiaries, 33 accredited administrators
- **4 administrators control 85%**: Discovery Health, Medscheme, Momentum/Metropolitan, Medihelp

---

## MAJOR VENDORS

### Altron HealthTech (Switching Market Leader)
- **Revenue**: R201M (FY2025, 92% annuity, EBITDA 31%)
- **SwitchOn**: 99.8M tx/yr, 8,000+ practices, **0.0% downtime**
- **MediKredit**: 200M+ tx/yr, 9,500+ providers, owns **NAPPI national coding system**, USA-patented rule-stacking adjudication
- **Products**: SwitchOn, Elixir Live (PMS), HealthOne (EHR), WEBDesk (portal), MedeServe (bureau)

### AfroCentric/Medscheme (Largest Administrator)
- 14 schemes, 4M+ members, **R37B claims/yr**
- **Losing Bonitas** (June 2026) after 44 years — largest admin transfer in SA history
- **Nexus**: Real-time clinical adjudication platform
- ML-based fraud: 300 investigations/month, AI scoring within milliseconds
- Tech: PHP, Apache, jQuery, Bootstrap, Cognos PowerPlay BI

### Metropolitan/Momentum Health
- ~3M beneficiaries across 20 schemes
- **Winning Bonitas** admin from June 2026
- IBM Cognos for fraud pattern detection

### Discovery Health (Technology Benchmark)
- **Vitality AI** (Google Cloud, Nov 2025): 2,800+ dimensions/member, 13M customers globally
- 50M+ life years health data + 30M lifestyle data
- **FICO Blaze Advisor**: 78% auto-adjudication
- **Personal Health Pathways**: Patented AI, 2.1M members
- VisioCorp fills practice-level gap Discovery doesn't cover

---

## HOSPITAL GROUP TECHNOLOGY

| Group | System | Investment | Scale |
|-------|--------|-----------|-------|
| **Netcare** | CareOn (proprietary) | R82M, 7 years | 34K users, 13K iPads, 45 hospitals |
| | Partners: Deutsche Telekom, Apple, IBM Watson/Merative | | SAHPRA-approved sepsis AI, ICU prediction 10hrs ahead |
| **Mediclinic** | HL7/FHIR standardization | Multi-year project | Working with pathology labs |
| **Life Healthcare** | Integrating multiple systems | CIO David Price | 59 acute facilities |
| **Others** | MEDITECH (Botswana), iMDsoft MetaVision | | Active in SA market |

---

## PRACTICE MANAGEMENT SOFTWARE

| Vendor | Strength | AI? | Practices |
|--------|----------|-----|-----------|
| Healthbridge | End-to-end + switching, speech-to-notes | Some | 7,000+ |
| GoodX | 40+ years, paperless, ISO27001 | No | — |
| Solumed | Specialist/dental/allied | No | — |
| Health Focus | Optometry niche leader | No | 1,000+ |
| CGM (CompuGroup) | Global, MEDEDI all-in-one | No | — |
| Altron Elixir Live | Integrated with SwitchOn | No | — |
| **VisioCorp** | **5 AI agents, white-label, multi-tenant, POPIA, FHIR** | **YES — ONLY** | — |

---

## GLOBAL TECH IN SA

| Company | SA Presence |
|---------|------------|
| **Microsoft Azure** | SA North available. **Azure FHIR retiring Sept 2026**. VisioCorp FHIR Hub fills gap. |
| **Google** | No SA-specific presence. MedGemma (open-source) available. Healthcare NLP shutting May 2026. |
| **AWS** | Cape Town region (af-south-1). RecoMed on EC2. No HealthLake deployments confirmed. |
| **Oracle/Cerner** | Africa region page but no confirmed SA hospital deployments. |
| **IBM/Merative** | Netcare uses Micromedex for drug interaction checking. |

---

## INTEROPERABILITY STANDARDS

| Standard | SA Status |
|----------|-----------|
| **HL7v2** | Legacy, still dominant in switching |
| **FHIR R4** | Emerging, mandated by National Digital Health Strategy. ~20% public facilities in pilots. **VisioCorp ahead of market.** |
| **ICD-10** | Universal (WHO version, NOT US ICD-10-CM) |
| **NAPPI** | National standard for pharma (MediKredit) |
| **SNOMED CT** | SA NOT confirmed member |
| **openEHR** | No adoption |
| **LOINC** | No adoption |

---

## ACADEMIC RESEARCH — KEY STATS

| Finding | Source |
|---------|--------|
| ICD-10 accuracy: **74%**, completeness: **45%** | SAMJ 2017 |
| R13B lost to fraudulent claims/yr | ScienceDirect 2024 |
| 40% of CMS complaints = PMBs | CMS reports |
| PMB appeals won by members: **69.4%** | SAMJ 2019 |
| Healthcare inflation **4.7%** vs CPI **3.3%** | 2025 data |
| Only **15%** public facilities meet OHSC "ideal" | OHSC inspections |
| Digital efficiency gains: **$3.3B** by 2030 | McKinsey |
| NLP for ICD-10: **<50% accuracy** with LLMs | PMC 2025 |
| Medicolegal claims: **R6.5B** (2020/21) | SAMJ 2023 |
| SA spends **41.8%** of health on private insurance — more than any OECD country | WHO/OECD |

---

## STARTUPS

| Startup | What | Traction |
|---------|------|---------|
| Vula Mobile | Digital specialist referral | 2.5M+ referrals, FNB App 2025 |
| Quro Medical | Hospital-at-home | First in Africa |
| Envisionit Deep AI | AI radiology (25 pathologies) | $1.65M |
| AI Diagnostics | TB sound screening | 30K+ recordings, SAHPRA-approved |
| Pelebox | Smart medicine lockers | Africa Prize, 123 facilities |
| hearX/LXE | Mobile hearing | $100M merger with Eargo |
| Helium Health | EMR + claims | Pan-African |

---

## GOVERNMENT & POLICY

### NHI (March 2026)
- Signed May 2024. **ConCourt: 5-7 May 2026**. On hold.
- If implemented: single payer, FHIR mandated, DRG/capitation
- Full implementation: ~2035. Schemes → complementary cover only.

### CMS Data (2024)
- R230B contributions, R193B claims paid (84% ratio)
- Hospital: 38%, Specialist: 18%, Medicines: 16%, GP: 10%
- ~11,500 complaints/yr, 55% claims-related

### National Digital Health Strategy
- FHIR R4 mandated for new government systems
- HPRS: 44M+ patients registered
- DHIS2: backbone for 52 health districts

### Budget (2024/25)
- Total health: R259.2B. NHI grant: R4.6B. Digital health: ~R1.5-2.0B.

---

## STRATEGIC IMPLICATIONS FOR VISIOCORP

1. **FHIR advantage**: Azure sunsetting. No SA vendor has public FHIR API. VisioCorp first.
2. **AI moat**: ONLY practice-level AI platform. Every competitor has ZERO AI.
3. **Bonitas chaos** (June 2026): 750K+ beneficiaries changing admin. Tech disruption = opportunity.
4. **Fraud detection**: R22-28B problem, market under-served.
5. **NLP coding**: <50% accuracy → assisted coding (not automated) is right.
6. **Switching accreditation**: Barrier + moat. Contact MediKredit: integration@medikredit.co.za.
7. **CareOn validates build-vs-buy**: Netcare spent R82M+, 7 years.
8. **Dual-mode architecture**: Current fee-for-service + future NHI DRG/capitation.
