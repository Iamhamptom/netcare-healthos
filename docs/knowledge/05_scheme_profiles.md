# 05 — Medical Scheme Profiles & Switching
## VisioCorp Health Intelligence KB | Compiled 2026-03-21

---

## DISCOVERY HEALTH (~3.8M lives, ~58% open scheme market)

**Administrator**: Discovery Health (Pty) Ltd
**Claims engine**: FICO Blaze Advisor — 78% auto-adjudication, 100K+ tx/day
**Data**: 50M+ life years health data, 2,800+ dimensions per member
**AI**: Vitality AI (Google Cloud, Nov 2025) — member-facing, NOT practice-level

### Rules
- ICD-10: **STRICT** — maximum specificity mandatory (4th character)
- Pre-auth: All hospital, MRI/CT, high-cost meds, GP visits after 15th
- CDL: 27 conditions + additional per plan. Register via CIB
- Chronic: CIB formulary = 100% at DHR. Off-formulary = Chronic Drug Amount
- KeyCare: MUST use KeyCare network. Non-network = full member liability
- **Clawbacks**: Known to claw back months/years later
- **Rejection codes**: 59 (tariff incorrect), 02 (account required), 04 (auth letter), 54 (illegible)
- Contact: 0860 99 88 77 | Provider_Administration@discovery.co.za

---

## BONITAS (~731K beneficiaries)

**Administrator**: Medscheme → **Momentum Health Solutions from 1 June 2026** (largest admin transfer in SA history)

### 14 Plans
**Savings**: BonComprehensive (R12,509), BonClassic (R8,238), BonComplete (R6,614), BonSave (R4,047), BonPrime (R3,255)
**Traditional**: Standard, Standard Select, Primary
**Hospital**: Hospital Standard, BonEssential (R2,747), BonStart
**Income-based**: BonCap (R1,730)
**NEW 2026**: BonCore — digital-first, R1,275/beneficiary, ages 22-35

### Rules
- 4 formulary tiers (A-D): off-formulary = **30% co-payment**
- Pharmacy Direct: mandatory DSP for chronic on Standard Select, BonSave, BonEssential, Hospital Standard, BonStart
- GP referral required for specialists on Standard/Standard Select
- CDL: BonComprehensive=61 conditions, BonEssential=28, others=27
- MedGap (Guardrisk): integrated gap cover with automatic claims
- Contact: 086 111 2666 | hospital@bonitas.co.za | queries@bonitas.co.za

---

## GEMS (~2M lives, largest restricted scheme)

**Administrator**: Medscheme | **Options**: Emerald, Beryl, Sapphire, Ruby, Onyx

### Rules
- 9-digit membership with leading zeros
- 60-day dispute turnaround (longest)
- Stricter consultation limits, rigid PMB interpretation
- State as DSP for in-hospital
- Missed appointments: NOT covered, member liable
- Contact: 0860 00 4367

---

## MOMENTUM (~350K lives)

**Administrator**: Momentum Health Solutions | **Options**: Ingwe, Summit, Custom, Incentive, Extender
- Pre-auth: all hospital, MRI/CT/PET/MRCP, oncology, rehab
- PMB: practice must send letter requesting PMB on patient's behalf
- Contact: 0860 117 859

---

## MEDIHELP (~400K lives)

**Administrator**: Self-administered (est. 1906)
- Submission: last workday of 4th month | Resubmission: 60 days
- Contact: hpquery@medihelp.co.za

---

## BESTMED (~200K lives)

**Administrator**: Self-administered | **Options**: Beat, Pace, Pulse
- Mental health: 21 days inpatient/yr OR 15 outpatient sessions
- Contact: service@bestmed.co.za

---

## CMS PERFORMANCE DATA

| Scheme | Lives | Claims Ratio | Solvency | Complaints |
|--------|-------|-------------|----------|------------|
| Discovery | 3.8M | 84% | 27.1% | ~4,200 |
| GEMS | 2.0M | 88% | 21.5% | ~2,800 |
| Bonitas | 700K | 86% | 25.3% | ~1,100 |
| Medihelp | 400K | 82% | 31.2% | ~650 |
| Momentum | 350K | 85% | 28.7% | ~580 |
| Bestmed | 200K | 83% | 33.1% | ~320 |

---

## THREE SWITCHING HOUSES

| Switch | Operator | Volume | Uptime |
|--------|----------|--------|--------|
| **Healthbridge** | Independent | 3.25M+ encounters/yr | — |
| **SwitchOn** | Altron HealthTech | 99.8M tx/yr | 0.0% downtime |
| **MediKredit** | Altron subsidiary | 200M+ tx/yr | — |

### Routing Table

| Scheme | Switch |
|--------|--------|
| Discovery Health | Healthbridge |
| Bonitas | Healthbridge |
| Medihelp | Healthbridge |
| Anglo Medical, Bankmed, LA Health | Healthbridge |
| GEMS | SwitchOn |
| Momentum | SwitchOn |
| Bestmed | SwitchOn |
| Fedhealth, Polmed, Sizwe Hosmed | SwitchOn |
| CompCare | MediKredit |
| Medshield, PPS, KeyHealth, Profmed | MediKredit |

---

## 12-STEP CLAIM LIFECYCLE

1. **CAPTURE** → Practice captures encounter
2. **PRE-VALIDATE** → ICD-10, tariff, BHF, member, pre-auth
3. **ROUTE** → Determine switch from scheme
4. **FORMAT** → Generate EDIFACT or XML
5. **SUBMIT** → Real-time (seconds) or batch (end-of-day)
6. **SWITCH VALIDATE** → Format, completeness, codes
7. **ROUTE TO SCHEME** → Switch forwards to administrator
8. **ADJUDICATE** → Member/benefit/tariff/PMB/co-pay/clinical rules
9. **RESPOND** → STS accepted/rejected per line
10. **eRA** → Electronic Remittance Advice (amounts, adjustments)
11. **RECONCILE** → Match payments to claims
12. **PAYMENT** → EFT to practice (typically monthly)

---

## SUBMISSION DEADLINES (ALL SCHEMES)

| Rule | Timeline |
|------|----------|
| Initial submission | 4 months (120 days) from DOS |
| Resubmission after rejection | 60 days from rejection date |
| Scheme pay/reject | 30 days from receipt |

---

## KEY CONTACTS

| Entity | Phone | Email |
|--------|-------|-------|
| Discovery | 0860 99 88 77 | discovery.co.za |
| Bonitas | 086 111 2666 | queries@bonitas.co.za |
| GEMS | 0860 00 4367 | gems.gov.za |
| Momentum | 0860 117 859 | — |
| Medihelp | — | hpquery@medihelp.co.za |
| Bestmed | — | service@bestmed.co.za |
| CMS | 012 431 0500 | complaints@medicalschemes.co.za |
| BHF (PCNS) | 087 210 0500 | bhfglobal.com |
| MediKredit (integration) | 0860 932 273 | integration@medikredit.co.za |
| Altron HealthTech | — | healthtech.altron.com |
