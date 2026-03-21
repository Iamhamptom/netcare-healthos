# SA Medical Schemes — Claims Profiles
## For: Steinberg, Claims Analyzer, HealthOps, Netcare Health OS Agents
## Compiled: 2026-03-21

---

## DISCOVERY HEALTH (~3.8M lives, ~58% open scheme market)

**Administrator**: Discovery Health (Pty) Ltd
**Claims engine**: FICO Blaze Advisor — 78% auto-adjudication rate, 100K+ transactions/day
**Switch**: Multiple (SwitchOn, Healthbridge, MediKredit)

### Key Rules
- ICD-10: Maximum specificity required (4th character mandatory where applicable)
- Pre-auth: All planned hospital admissions, MRI/CT, high-cost meds, GP visits after 15th
- Pre-auth phone: 0860 99 88 77 | Email: PREASSESSMENT_REQUESTS@discovery.co.za
- CDL: 27 conditions + additional conditions per plan. Must register via Chronic Illness Benefit (CIB)
- Chronic meds: CIB formulary = 100% at Scheme Rate. Off-formulary = Chronic Drug Amount
- 4 consultations/year covered for registered chronic conditions at nominated KeyCare GP
- KeyCare plans: MUST use KeyCare network hospitals/GPs. Non-network = full member liability
- Clawbacks: Known to claw back months/years later — major provider pain point
- Provider registration: Provider_Administration@discovery.co.za

### Discovery-Specific Rejection Codes
59 (tariff incorrect), 02 (doctor's account needed), 03 (med aid statement), 04 (auth letter), 54 (illegible docs), 70 (specialist account)

### Vitality AI Partnership (Google Cloud, Nov 2025)
- Member-facing, wellness, rewards — NO practice layer
- 2,800+ health dimensions per member
- VisioCorp fills the practice layer gap

---

## BONITAS (~731K beneficiaries, 2nd largest open scheme)

**Administrator**: Medscheme (until 31 May 2026) → **Momentum Health Solutions** (from 1 June 2026)
**CRITICAL**: Largest administrator transfer in SA history. EDI routing, provider registration, payment processes ALL changing.

### Plan Types (14 options)
- **Savings plans**: BonComprehensive (R12,509), BonClassic (R8,238), BonComplete (R6,614), BonSave (R4,047), BonPrime (R3,255)
- **Traditional**: Standard, Standard Select, Primary
- **Hospital**: Hospital Standard, BonEssential (R2,747), BonStart
- **Income-based**: BonCap (R1,730, income verification)
- **NEW 2026**: BonCore — digital-first, R1,275/beneficiary, ages 22-35

### Key Rules
- 4 formulary tiers (A-D): Off-formulary = **30% co-payment**
- Pharmacy Direct: Mandatory DSP for chronic meds on Standard Select, BonSave, BonEssential, Hospital Standard, BonStart
- Non-DSP pharmacy: 30% co-payment
- GP referral required for specialists on Standard/Standard Select — claim rejected without it
- CDL: BonComprehensive covers 61 chronic conditions. BonEssential covers 28. Others: 27 CDL only
- Pre-auth: 086 111 2666 | hospital@bonitas.co.za
- MedGap (Guardrisk): Integrated gap cover, automatic claims processing with consent
- Disputes: 0860 002 108

---

## GEMS (~2M lives, largest restricted scheme)

**Administrator**: Medscheme
**Options**: Emerald, Beryl, Sapphire, Ruby, Onyx

### Key Rules
- 9-digit membership number with leading zeros
- 60-day dispute turnaround (longest of any scheme)
- Unique submission windows and stricter consultation limits
- Rigid PMB interpretation
- GEMS tariff schedules separate for contracted vs non-contracted
- Contact: 0860 00 4367
- Missed appointments: GEMS will NOT cover costs; member liable
- Duplicate services: automatically rejected, not payable

---

## MOMENTUM HEALTH (~350K lives)

**Administrator**: Momentum Health Solutions
**Options**: Ingwe, Summit, Custom, Incentive, Extender

### Key Rules
- Pre-auth required for all in-hospital admissions, MRI/CT/PET/MRCP, oncology, rehab
- DSP compliance: Benefits tied to designated providers per option
- Chronic medication: Must register with correct ICD-10 and NAPPI codes
- PMB process: Practice must send letter requesting PMB benefits on patient's behalf
- Pre-auth: 0860 117 859

---

## MEDIHELP (~400K lives)

**Administrator**: Self-administered (est. 1906)

### Key Rules
- Submission deadline: Last workday of 4th calendar month after service
- Rejection notification: Must inform within 30 days with reasons
- Resubmission: 60 days from rejection date
- ICD-10 must be available for pre-auth and referral applications
- Contact: hpquery@medihelp.co.za

---

## BESTMED (~200K lives)

**Administrator**: Self-administered, Pretoria-based
**Options**: Beat (entry), Pace (mid), Pulse (comprehensive)

### Key Rules
- Mental health limits: 21 days inpatient/year OR 15 outpatient sessions
- Benefits at 100% of Scheme tariff when using DSP
- Contact: service@bestmed.co.za

---

## SCHEME PERFORMANCE (CMS DATA)

| Scheme | Beneficiaries | Claims Ratio | Solvency | CMS Complaints (2023) |
|--------|--------------|-------------|----------|----------------------|
| Discovery | ~3.8M | 84% | 27.1% | ~4,200 |
| GEMS | ~2.0M | 88% | 21.5% | ~2,800 |
| Bonitas | ~0.7M | 86% | 25.3% | ~1,100 |
| Medihelp | ~0.4M | 82% | 31.2% | ~650 |
| Momentum | ~0.3M | 85% | 28.7% | ~580 |
| Bestmed | ~0.2M | 83% | 33.1% | ~320 |

---

## SWITCHING HOUSE ROUTING

### Three Switches

| Switch | Operator | Practices | Key Schemes |
|--------|----------|-----------|-------------|
| **Healthbridge** | Independent | 7,000+ | Discovery, Bonitas, Medihelp, Samwumed, Hosmed, Resolution, Spectramed, Anglo Medical, Bankmed, LA Health |
| **SwitchOn** (formerly MediSwitch) | Altron HealthTech | 8,000+ | GEMS, Polmed, Momentum, Bestmed, Fedhealth, Sizwe Hosmed, Liberty, Minemed, Selfmed |
| **MediKredit** | Altron subsidiary | 9,500+ | CompCare, Makoti, PPS, Medshield, KeyHealth, Profmed |

### Claim Lifecycle (12 Steps)
1. CAPTURE → 2. PRE-VALIDATE → 3. ROUTE (determine switch) → 4. FORMAT (EDIFACT/XML) → 5. SUBMIT (real-time or batch) → 6. SWITCH VALIDATE → 7. ROUTE TO SCHEME → 8. ADJUDICATE → 9. RESPOND (STS accepted/rejected) → 10. eRA (Electronic Remittance Advice) → 11. RECONCILE → 12. PAYMENT (EFT, typically monthly)

### EDI Format: PHISC MEDCLM v0-912-13.4
- UN/EDIFACT adapted for SA
- Segments: UNB (interchange), UNH (header), BGM (batch), DTM (dates), NAD (parties), RFF+ICD (diagnosis), LIN (line items with SRV for tariff or NAP for NAPPI), QTY, MOA (amounts), UNT (trailer)
- Segment terminator: `'` | Data separator: `+` | Component separator: `:`

---

## CLAIMS SUBMISSION DEADLINES

| Scheme | Initial Submission | Resubmission After Rejection |
|--------|-------------------|------------------------------|
| All schemes | 4 months (120 days) from date of service | 60 days from rejection date |

---

## KEY CONTACTS

| Entity | Phone | Email/Web |
|--------|-------|-----------|
| Discovery | 0860 99 88 77 | discovery.co.za |
| Bonitas | 086 111 2666 | queries@bonitas.co.za |
| GEMS | 0860 00 4367 | gems.gov.za |
| Momentum | 0860 117 859 | momentum.co.za |
| Medihelp | Switchboard | hpquery@medihelp.co.za |
| Bestmed | Switchboard | service@bestmed.co.za |
| CMS | 012 431 0500 | medicalschemes.co.za |
| BHF (PCNS) | 087 210 0500 | bhfglobal.com |
| MediKredit | 0860 932 273 | integration@medikredit.co.za |

---

## 7-STEP APPEALS PROCESS

1. **Internal resolution** → contact scheme directly (30 days)
2. **Principal Officer** → written complaint
3. **Dispute Resolution Committee** → formal internal appeal (60-120 days)
4. **CMS Complaint (s47)** → 4-day acknowledgment, 30-day scheme response, 120-day resolution. **FREE**
5. **CMS Appeal (s48)** → within 3 months via affidavit. **FREE**
6. **Appeal Board (s50)** → 60 days to lodge. Has **High Court powers**. Decision within 120 days
7. **High Court** → final recourse. Costly.
