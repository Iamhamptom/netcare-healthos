# South African Private Medical Practice Economics
## Complete Financial Flow: Patient Visit to Payment Received
### Research for VisioHealth ROI Positioning | March 2026

---

## 1. HOW SA DOCTORS CHARGE

### Consultation Fees by Practice Type (2025-2026 Rates)

| Practice Type | Consultation Fee Range | Average | Notes |
|---|---|---|---|
| **GP (General Practitioner)** | R500 - R700 | ~R550 | Average private visit ~R514-R550; online consults ~R299 |
| **Paediatrician** | R1,200 - R1,800 | ~R1,500 | Specialist rate; initial consult higher than follow-up |
| **ENT Specialist** | R1,200 - R2,000 | ~R1,500 | Procedures (grommets, tonsillectomy) billed separately |
| **Dentist** | R300 - R695 | ~R550 | Consultation only; fillings R1,500, crowns R3,000-R5,000+, root canal R4,000-R10,000 |
| **Dermatologist** | R800 - R2,500 | ~R1,500 | Initial consult higher; QuickSpot online R599; procedures extra |
| **Ophthalmologist** | R1,000 - R2,000 | ~R1,500 | Tests (OCT, visual fields) billed separately |

**Key insight**: Specialists commonly charge R1,500+ per consultation, while GPs average R550. This 3x difference matters for ROI calculations.

### The Fee Gap: What Doctors Charge vs What Medical Aids Pay

This is the central financial tension in SA private healthcare:

- **Medical Scheme Tariff (MST)**: The benchmark rate medical aids use to determine reimbursement
- **Most medical aids pay 100% of MST** (some comprehensive plans stretch to 200%)
- **Specialists routinely charge 200-500% of MST**
- **The patient (or their gap cover) pays the difference**

**Real-world distribution of specialist charging practices:**
- 45% of specialists charge at NHRPL rates (100%)
- 20% charge on average 135% of NHRPL
- 30% charge between 135% and 300% of NHRPL
- 5% charge over 300% of NHRPL

**Example**: A specialist charges R1,500 for a consultation. The medical aid's scheme rate is R450 (100% MST). The medical aid pays R450. The patient owes R1,050 out of pocket unless they have gap cover.

**Extreme case**: An R85,000 spinal surgery shortfall was reported where the specialist charged 480% of the medical aid rate.

### The NHRPL (National Health Reference Price List)

- Published annually by the Department of Health
- Sets the "reference" price for medical procedures and consultations
- Calculated from submissions by the Council for Medical Schemes and professional medical associations
- **Was declared invalid in 2010** -- creating a regulatory gap that persists today
- Despite being technically invalid, medical aids still use NHRPL-derived rates as their payment benchmark
- Doctors are NOT legally bound by NHRPL -- they can charge whatever they consider "fair value"

**Why specialists charge 200-300%+ of NHRPL:**
1. NHRPL rates haven't kept pace with inflation and practice costs
2. No regulatory enforcement mechanism since 2010 invalidation
3. Rising overhead costs (rent, staff, equipment, insurance)
4. Market dynamics -- patients will pay for specialist expertise
5. Cross-subsidisation of cash patients who can't afford full rates

### Gap Cover

- **What it is**: Separate insurance product (NOT a medical aid) that covers the shortfall between what your medical aid pays and what the doctor charges
- **Who pays**: The patient pays a monthly premium (typically R100-R400/month depending on cover level)
- **How it works**: Medical provider submits claim to scheme -> scheme identifies shortfall -> shortfall forwarded to gap cover administrator -> paid within 7-14 working days
- **Limitation**: If medical aid doesn't cover a procedure, gap cover won't either
- **Requirement**: Must have active medical scheme membership to qualify for gap cover

### Cash Patients

- **Only ~14.7% of SA population has medical aid** (approximately 9.7 million of 61 million)
- **Over 85% are uninsured** -- relying on public healthcare or paying cash
- Cash patients at private practices typically pay:
  - GP: R500-R700 per visit (full rate, no scheme discount)
  - Specialist: R1,200-R2,500 per visit
- **For private GP practices**: Estimated 20-40% of patients are cash-paying (varies by location -- township practices may be 60%+ cash; suburban practices may be 80%+ medical aid)
- Cash patients often get same-day payment (better cash flow) but may negotiate discounts

---

## 2. HOW MEDICAL AID CLAIMS WORK (THE FUNDER FLOW)

### Complete Claim Lifecycle

```
STEP 1: PATIENT VISIT
  Patient presents at practice -> reception checks medical aid details
  -> Benefit check (real-time via Healthbridge/MedEDI)
  -> Doctor consults and treats patient

STEP 2: CLAIM GENERATION
  Practice captures:
  - ICD-10 diagnosis code(s) (from ~70,000 possible codes)
  - Procedure/tariff codes (from ~8,000 CPT codes)
  - NAPPI codes for any medicines dispensed (~450,000+ codes)
  - Modifier codes where applicable
  -> ICD-10 codes MUST be supplied on EVERY line item

STEP 3: CLAIM SUBMISSION
  Electronic submission via switching house:
  - Healthbridge (market leader, ~7,000 practices)
  - CGM MedEDI
  - HealthWindow
  - Health Focus
  -> Real-time submission with line-by-line response in seconds
  -> Cost: ~R5.75 per claim (Healthbridge GP rate)

STEP 4: ADJUDICATION
  Medical aid receives claim and checks:
  - Is the member active and in good standing?
  - Is the provider registered (BHF/PCNS number valid)?
  - Do ICD-10 codes match procedure codes?
  - Is pre-authorisation required and obtained?
  - Are benefits available (not exhausted)?
  - Does the claim comply with scheme rules?
  - Is the claim within tariff rates?
  -> Approved, partially approved, or rejected

STEP 5: PAYMENT
  If approved:
  - Medical aid pays the SCHEME RATE (not necessarily the full invoice)
  - Payment timeline: UP TO 30 DAYS (legislated maximum)
  - Electronic claims typically paid faster: 7-14 days
  - Payment goes directly to practice bank account (EFT)

STEP 6: SHORTFALL COLLECTION
  If doctor charged above scheme rate:
  - Patient billed for the difference (shortfall)
  - Patient may claim from gap cover if they have it
  - Practice must follow up on outstanding patient balances
  -> This is where significant revenue leakage occurs
```

### Pre-authorisation

**Which procedures need pre-auth:**
- ALL in-hospital admissions (elective and planned)
- MRI and CT scans (in-hospital)
- Certain out-of-hospital procedures
- PMB (Prescribed Minimum Benefit) related admissions
- Physiotherapy courses

**Timeline:**
- Must be obtained at least 48 hours before admission (some schemes require 14 days)
- Pre-auth numbers valid for 30 days from issue
- Emergency: Go to hospital first, notify scheme within 48 hours

**Penalty for non-compliance:**
- Minimum R500 co-payment from patient's own pocket
- Claim may be rejected entirely
- Some schemes apply percentage penalties (e.g., 20% co-payment)

### Claim Submission Systems

| System | Market Position | Key Feature | Cost Model |
|---|---|---|---|
| **Healthbridge** | Market leader (~7,000 practices) | Cloud-based, real-time claiming, 25+ years SA experience | % of monthly claim value |
| **CGM MedEDI** | Major player | Real-time submissions, built-in scheme pricing | Subscription |
| **Health Focus** | Budget option | Low-cost claims at R5.75/claim | Per-claim |
| **Navitas** | Growing | Full practice management + billing | Subscription |
| **GoodX** | Significant player | Billing-focused, multiple specialties | R500-R3,000+/user/month |

**Monthly software costs for SA practices: R500 - R3,000+ per user**

### ICD-10 + Tariff Code Structure

Every claim must contain:
1. **ICD-10 codes**: Diagnosis classification (~70,000 codes) -- e.g., J06.9 = Upper respiratory infection
2. **CPT/Tariff codes**: Procedure performed (~8,000 codes) -- e.g., 0190 = GP consultation
3. **NAPPI codes**: Any medicines dispensed (~450,000+ codes) -- 9-digit codes (6 digits = product, 3 digits = pack size)
4. **Modifier codes**: Adjustments for circumstances (e.g., after-hours, emergency)

**Critical rule**: ICD-10 codes must be supplied on EVERY line item in the claim, even if the same diagnosis applies to all items.

### Payment Timeline

- **Legal requirement**: Medical scheme must pay within **30 days** of receiving the claim (Medical Schemes Act)
- **Electronic claims**: Typically paid in **7-14 days**
- **Paper claims**: Can take the full 30 days or more
- **Claim submission deadline**: Last day of the 4th month following service date
- **Error notification**: Scheme must notify of errors within 30 days of receipt

### Rejection Rates and Rework Cost

**Rejection rate**: Industry estimates suggest **15-20% of claims** are rejected or require rework in SA (no single authoritative statistic, but consistent with global healthcare norms).

**R40 billion problem**: The Council for Medical Schemes confirmed that at least **R40 billion in out-of-pocket payments** were incurred by medical aid members during the 2023/2024 period -- much of this from claim shortfalls and rejections.

**Common rejection reasons:**
1. **Incomplete documentation** -- missing medical reports, prescriptions, referral letters
2. **Incorrect ICD-10 codes** -- diagnosis doesn't match procedure
3. **Missing member number** -- automatic rejection
4. **No pre-authorisation** -- especially hospital admissions
5. **Benefits exhausted** -- annual limits reached
6. **Provider not in network** -- for restricted network plans
7. **Late submission** -- beyond the 4-month window

**Cost of rework**: Each rejected claim requires:
- Staff time to investigate (15-30 minutes)
- Re-coding or gathering documentation
- Re-submission and tracking
- At admin staff costs of R12,000-R18,000/month, this adds up fast

### The Rate Gap in Practice

**If a doctor charges R1,500 but the scheme rate is R450:**

| Component | Amount | Who Pays |
|---|---|---|
| Scheme rate paid by medical aid | R450 | Medical aid |
| Shortfall | R1,050 | Patient out of pocket |
| If patient has gap cover (up to 500% MST) | Up to R1,800 covered | Gap cover insurer |
| If patient has no gap cover | R1,050 | Patient directly |

**For the PRACTICE**, this means:
- R450 arrives via EFT in 7-30 days
- R1,050 must be collected from the patient (often 30-90+ days, some never collected)
- Bad debt on patient portions can be 5-15% of billed shortfalls

---

## 3. REVENUE PER PRACTICE TYPE

### GP Practice Revenue

**Solo GP (1 doctor)**
| Metric | Conservative | Average | Busy |
|---|---|---|---|
| Patients/day | 20 | 30 | 40+ |
| Working days/month | 20 | 22 | 22 |
| Consultation fee | R500 | R550 | R600 |
| Gross monthly billing | R200,000 | R363,000 | R528,000 |
| Collection rate | 85% | 88% | 90% |
| Collected revenue | R170,000 | R319,440 | R475,200 |
| Overheads (50-60%) | R102,000 | R175,692 | R237,600 |
| **Net monthly income** | **R68,000** | **R143,748** | **R237,600** |
| Annual turnover | R2,040,000 | R3,833,280 | R5,702,400 |

**Note**: VAT registration required above R1M annual billing. Most doctors absorb the 15% VAT, effectively reducing medical aid income by 15%.

**Group GP Practice (3 doctors)**
| Metric | Value |
|---|---|
| Total patients/day | 75-90 |
| Gross monthly billing | R900,000 - R1,200,000 |
| Collection rate | 88-92% |
| Monthly collected | R792,000 - R1,104,000 |
| Annual turnover | R9.5M - R13.2M |

**Large GP Practice (5+ doctors)**
| Metric | Value |
|---|---|
| Total patients/day | 125-200 |
| Gross monthly billing | R1.5M - R2.5M+ |
| Annual turnover | R18M - R30M+ |

### Paediatric Practice Revenue

**Solo Paediatrician**
| Metric | Conservative | Average |
|---|---|---|
| Patients/day | 15 | 20-25 |
| Working days/month | 20 | 22 |
| Consultation fee | R1,200 | R1,500 |
| Gross monthly billing | R360,000 | R660,000 - R825,000 |
| Collection rate | 80% | 85% |
| Collected revenue | R288,000 | R561,000 - R701,250 |
| Annual turnover | R3,456,000 | R6,732,000 - R8,415,000 |

**Group Paediatric Practice (2-3 doctors)**: R12M - R25M annual turnover

### ENT Practice Revenue

**Solo ENT Specialist**
| Metric | Conservative | Average |
|---|---|---|
| Consults/day | 12 | 18 |
| Procedures/week | 5-8 | 10-15 |
| Consultation fee | R1,200 | R1,500 |
| Avg procedure fee | R3,000 | R5,000 |
| Monthly consult billing | R288,000 | R594,000 |
| Monthly procedure billing | R80,000 | R275,000 |
| **Total monthly billing** | **R368,000** | **R869,000** |
| Collection rate | 78% | 82% |
| Annual turnover | R3.4M | R8.5M |

### Dental Practice Revenue

**Solo Dentist (1 chair)**
| Metric | Conservative | Average |
|---|---|---|
| Patients/day | 8 | 12 |
| Working days/month | 20 | 22 |
| Avg revenue/patient | R800 | R1,200 |
| Gross monthly billing | R128,000 | R316,800 |
| Collection rate | 85% | 90% |
| Collected revenue | R108,800 | R285,120 |
| Annual turnover | R1,305,600 | R3,421,440 |

**Multi-chair Dental Practice (3 chairs, 2-3 dentists)**
| Metric | Value |
|---|---|
| Total patients/day | 25-36 |
| Gross monthly billing | R600,000 - R1,300,000 |
| Annual turnover | R7.2M - R15.6M |

**Key dental revenue note**: Dental revenue is highly procedure-dependent. A crown (R5,000) or implant (R15,000-R25,000) dramatically changes daily revenue vs. a simple consultation (R550).

### Dermatology Practice Revenue

**Solo Dermatologist**
| Metric | Conservative | Average |
|---|---|---|
| Patients/day | 12 | 18 |
| Consultation fee | R1,000 | R1,500 |
| Procedures/day | 3-5 | 5-8 |
| Avg procedure fee | R2,000 | R3,500 |
| Monthly consult billing | R240,000 | R594,000 |
| Monthly procedure billing | R160,000 | R462,000 |
| **Total monthly billing** | **R400,000** | **R1,056,000** |
| Collection rate | 75% | 80% |
| Annual turnover | R3.6M | R10.1M |

### Collection Rate Reality

| Component | % of Billed | Notes |
|---|---|---|
| Medical aid portion (at scheme rate) | 95-98% collected | Reliable, EFT within 7-30 days |
| Patient shortfall portion | 60-75% collected | Often requires follow-up, statements, calls |
| Cash patient fees | 95-100% collected | Paid at time of service |
| **Overall collection rate** | **80-90%** | **10-20% revenue leakage is normal** |

**This means a practice billing R500,000/month may only collect R400,000-R450,000.** The R50,000-R100,000 gap is where VisioHealth's value proposition lives.

---

## 4. THE ROI CALCULATION

### At R50,000/month for VisioHealth

#### How Many Additional Bookings Pay for the Subscription?

| Practice Type | Avg Consultation Fee | Bookings Needed/Month | Bookings Needed/Day |
|---|---|---|---|
| **GP** | R550 | 91 bookings | ~4.1 per day |
| **Paediatrician** | R1,500 | 34 bookings | ~1.5 per day |
| **ENT** | R1,500 | 34 bookings | ~1.5 per day |
| **Dentist** | R800 (avg visit) | 63 bookings | ~2.9 per day |
| **Dermatologist** | R1,500 | 34 bookings | ~1.5 per day |

**Key insight**: For specialists, VisioHealth pays for itself with just 1-2 extra patients per day. For GPs, it needs ~4 extra patients per day -- still very achievable with better online booking, recall systems, and reduced no-shows.

#### Value of Reducing Claim Rejection Rate by 5%

| Practice Type | Monthly Billing | Current Rejections (est. 15%) | After 5% Reduction (10%) | Monthly Revenue Recovered |
|---|---|---|---|---|
| Solo GP | R363,000 | R54,450 | R36,300 | **R18,150** |
| Group GP (3 docs) | R1,000,000 | R150,000 | R100,000 | **R50,000** |
| Paediatrician | R660,000 | R99,000 | R66,000 | **R33,000** |
| ENT | R869,000 | R130,350 | R86,900 | **R43,450** |
| Dental (3 chairs) | R900,000 | R135,000 | R90,000 | **R45,000** |
| Dermatologist | R700,000 | R105,000 | R70,000 | **R35,000** |

**A 5% reduction in claim rejections alone nearly pays for the R50,000/month subscription for most practice types.**

#### Value of Reducing No-Shows by 20% via WhatsApp Reminders

Industry no-show rate: ~11.4%. A 20% reduction = from 11.4% to 9.1% (saving 2.3 percentage points).

| Practice Type | Patients/Month | No-Shows Saved (2.3%) | Avg Fee | Monthly Revenue Recovered |
|---|---|---|---|---|
| Solo GP (30/day) | 660 | 15 | R550 | **R8,250** |
| Group GP (75/day) | 1,650 | 38 | R550 | **R20,900** |
| Paediatrician | 440 | 10 | R1,500 | **R15,000** |
| ENT | 396 | 9 | R1,500 | **R13,500** |
| Dental (3 chairs) | 660 | 15 | R800 | **R12,000** |
| Dermatologist | 396 | 9 | R1,500 | **R13,500** |

#### Value of Saving 2 Hours/Day on Admin

2 hours/day = the doctor can see additional patients instead of doing paperwork.

| Practice Type | Extra Patients in 2hrs | Fee | Extra Revenue/Day | Extra Revenue/Month (22 days) |
|---|---|---|---|---|
| GP (15 min/patient) | 8 patients | R550 | R4,400 | **R96,800** |
| Paediatrician (20 min) | 6 patients | R1,500 | R9,000 | **R198,000** |
| ENT (20 min) | 6 patients | R1,500 | R9,000 | **R198,000** |
| Dentist (30 min) | 4 patients | R800 | R3,200 | **R70,400** |
| Dermatologist (15 min) | 8 patients | R1,500 | R12,000 | **R264,000** |

**Even if only HALF of that freed time converts to patient slots, the ROI is extraordinary.**

#### Faster Medical Aid Payments: 30 Days vs 7 Days

Getting paid 23 days sooner on R500,000/month in claims:

| Metric | Value |
|---|---|
| Monthly medical aid billing | R500,000 |
| Days earlier | 23 days |
| Daily cash flow value | R16,667 |
| **Cash flow improvement** | **R383,333 freed up sooner** |
| At prime lending rate (11.75%) | **R3,750/month saved** in interest/overdraft costs |
| Annual interest saving | **R45,000** |

For larger practices billing R1M+/month, this doubles.

### Total Combined ROI Summary

**For an average specialist practice (R700,000/month billing):**

| ROI Source | Monthly Value |
|---|---|
| Reduced claim rejections (5% improvement) | R35,000 |
| Reduced no-shows (20% improvement) | R13,500 |
| Admin time savings (conservative: 1hr recaptured) | R99,000 |
| Faster payments (interest savings) | R3,750 |
| **Total monthly value** | **R151,250** |
| **VisioHealth monthly cost** | **R50,000** |
| **ROI** | **3x return** |

**For a group GP practice (3 docs, R1M/month billing):**

| ROI Source | Monthly Value |
|---|---|
| Reduced claim rejections (5% improvement) | R50,000 |
| Reduced no-shows (20% improvement) | R20,900 |
| Admin time savings (conservative: 1hr/doc recaptured) | R145,200 |
| Faster payments (interest savings) | R7,500 |
| **Total monthly value** | **R223,600** |
| **VisioHealth monthly cost** | **R50,000** |
| **ROI** | **4.5x return** |

---

## 5. THE FUNDER ANGLE

### Can Medical Schemes Pay for Practice Management Software?

**The business case for funders:**
- Every rejected claim that gets reworked costs the scheme money in admin too
- Cleaner claims from providers = lower processing costs for schemes
- Better coding = better data for risk management and pricing
- Digital health records = continuity of care = fewer duplicate tests = cost savings

### Discovery Health's Provider Programme

Discovery Health is the most digitally advanced funder in SA:

- **HealthID Platform**: Free electronic health record for Discovery-contracted providers
  - Used by almost 50% of doctors treating Discovery members
  - Over 1 million members actively using it
  - Features: e-prescribing, referrals, chronic illness applications, appointment booking, video consultations
  - Practice delegation (practice managers, clinical staff, locums can access)
- **Doctor-Funder Partnerships**: Structured collaboration programmes for chronic illness management
- **Digital Healthcare Technologies**: Investing heavily in provider-facing digital tools
- **Network agreements**: Contracted providers agree to charge at scheme rates in exchange for patient volume

**VisioHealth opportunity**: Position as complementary to HealthID (which is Discovery-specific). VisioHealth works across ALL medical aids, not just Discovery.

### GEMS (Government Employees Medical Scheme)

- 2nd largest scheme in SA (~1.8 million members)
- Has a **Practitioner App** (mobile)
- Publishes annual tariff files for providers
- Less digitally mature than Discovery
- **Opportunity**: GEMS could subsidise VisioHealth for contracted providers to improve claim quality and reduce processing costs

### BHF (Board of Healthcare Funders)

- Industry body representing medical schemes and administrators
- Manages **BHF LIVE**: Interactive dashboard aggregating member scheme data
- Operates the **PCNS** (Practice Code Numbering System) -- every practice needs a PCNS number
- Role is coordination, not direct provider support
- **Opportunity**: BHF could recommend or endorse VisioHealth as a "certified" practice management solution

### The Subsidy Model: Could a Scheme Pay for VisioHealth?

**Why it makes sense for funders:**

| Funder Benefit | Estimated Saving |
|---|---|
| Reduced claim rework (cleaner claims from providers) | R500-R2,000 per rejected claim avoided |
| Better ICD-10 coding (fewer disputes) | Reduced complaints to CMS ombudsman |
| Digital records (fewer duplicate tests ordered) | R500-R5,000 per duplicate avoided |
| Improved chronic disease management | Lower hospitalisation rates |
| Better data for scheme pricing models | More accurate risk assessment |

**Estimated funder saving per practice**: R10,000-R30,000/month in reduced admin costs, fewer rejected claims, and better outcomes.

**Proposed model**: Funder subsidises R20,000-R30,000 of the R50,000/month fee. Practice pays R20,000-R30,000. Both parties benefit.

**Potential pilot partners:**
1. **Discovery Health** -- Already invests heavily in provider tools; could see VisioHealth as extending HealthID capability for non-network providers
2. **GEMS** -- Large scheme with less digital maturity; high claim volumes; government-backed budget
3. **Momentum Health** -- Actively investing in digital health capabilities
4. **Medscheme/Bonitas** -- Currently in significant litigation; may need better provider tools to reduce disputes
5. **Fedhealth** -- Known for innovation in benefits design

---

## KEY NUMBERS FOR SALES CONVERSATIONS

| Stat | Value | Source |
|---|---|---|
| SA population on medical aid | 14.7% (~9.7M of 61M) | CMS Industry Report |
| Out-of-pocket payments by medical aid members | R40 billion/year | CMS 2023/2024 |
| Average GP consultation fee | R514-R550 | Industry average |
| Average specialist consultation fee | R1,500 | Lister Clinic / industry |
| Average GP patients per day | 30 (range: 10-100) | Academic studies |
| Minimum viable GP throughput | 24+ patients/day at ~R500 | SAdocs |
| Medical scheme claim payment deadline | 30 days (by law) | Medical Schemes Act |
| Electronic claim payment speed | 7-14 days | Healthbridge |
| Healthbridge market share | ~7,000 practices | Healthbridge |
| No-show rate (industry average) | 11.4% | International benchmark |
| No-show reduction with reminders | 31% reduction | Published studies |
| VAT threshold for practices | R1M annual billing | SARS |
| Practice management software cost | R500-R3,000+/user/month | Market survey |
| Admin staff salary range | R12,000-R18,000/month | Industry average |
| Revenue leakage (5-10% typical) | 5-10% of revenue | Healthbridge research |
| Claim complaints won by members | 50%+ at CMS ombudsman | News24/CMS |

---

## VISIOHEALTH POSITIONING SUMMARY

### For GPs: "4 extra patients per day pays for VisioHealth"
- WhatsApp reminders reduce no-shows -> recaptured slots
- AI-assisted coding reduces claim rejections -> more revenue collected
- Automated admin saves doctor time -> more patients seen

### For Specialists: "1-2 extra patients per day pays for VisioHealth"
- At R1,500/consultation, the ROI threshold is extremely low
- Better pre-auth management prevents claim denials
- Digital intake forms save 15-20 minutes per patient

### For Group Practices: "The ROI multiplies with every doctor"
- 3 doctors x admin savings = 3x the impact
- Centralised billing dashboard reduces management overhead
- Multi-provider scheduling optimises utilisation

### For Funders: "Every clean claim saves you money too"
- Lower claim processing costs
- Fewer disputes at CMS ombudsman
- Better chronic disease data
- Potential co-investment model

---

## SOURCES

- [Lister Clinic - Specialist Referrals & Fees](https://www.listerclinic.com/specialists)
- [Gap Cover Info - NHRPL Explained](https://gap-cover-info.co.za/health-reference-price-list-nhrpl)
- [Gap Cover Info - How NHRPL Rates Work](https://gap-cover-info.co.za/how-the-nhrpl-medical-aid-rates-and-tariffs-work)
- [SmartAboutMoney - R40 Billion Denied Claims](https://www.smartaboutmoney.co.za/hot-topics/south-africans-pay-r40-billion-for-denied-medical-scheme-claims-are-you-one-of-them/)
- [Healthbridge - Medical Billing Software](https://healthbridge.co.za/)
- [Healthbridge - Fully Processed Claiming](https://healthbridge.co.za/products/fully-processed-claiming/)
- [Xpedient - Medical Aid Claim Process](https://xpedient.co.za/understanding-the-medical-aid-claim-process/)
- [MedicalAid.com - Tariff Codes Guide](https://medicalaid.com/medical-aids/tariff-codes-ultimate-guide/)
- [CMS - Coding and Funding of Claims](https://www.medicalschemes.co.za/cmscript-10-of-2024-coding-and-funding-of-claims/)
- [GapCover.co.za - The 500% Reality](https://www.gapcover.co.za/2025/09/01/the-500-reality-what-your-doctor-charges-vs-what-your-scheme-pays/)
- [Genesis Medical - Medical Aid Rates](https://www.genesismedical.co.za/what-are-medical-aid-rates/)
- [Fedhealth - What Are Medical Aid Rates](https://www.fedhealth.co.za/medical-aid-questions/what-are-medical-aid-rates/)
- [Dermatologists.co.za - 2026 Fees](https://dermatologists.co.za/fees/)
- [Affinity Dental - Dental Procedure Costs](https://www.affinitydental.co.za/how-much-do-standard-dental-procedures-cost/)
- [Dental Tariffs South Africa - DTB 2026](https://dentaltariffs.co.za)
- [SAdocs - Managing a Private Practice](https://sadocs.co.za/independent-practice/managing-a-private-practice/)
- [CFO360 - Starting a Medical Practice in SA](https://cfo360.co.za/starting-a-medical-practice-in-south-africa/)
- [Discovery Health - HealthID](https://www.discovery.co.za/medical-aid/health-id)
- [Discovery - For Healthcare Professionals](https://www.discovery.co.za/medical-aid/for-healthcare-professionals)
- [Discovery - Doctor-Funder Partnerships](https://www.discovery.co.za/corporate/doctor-funder-partnerships)
- [GEMS - Healthcare Providers](https://www.gems.gov.za/Healthcare-Providers)
- [News24 - 50%+ Win at CMS Ombudsman](https://www.news24.com/business/money/more-than-50-of-unhappy-medical-scheme-members-win-their-case-at-regulator-20241022)
- [Momentum Gap Cover](https://www.momentum.co.za/momentum/personal/medical-aid/gap-cover)
- [Old Mutual Gap Cover](https://www.oldmutual.co.za/personal/solutions/health/gap-cover/)
- [PMC - GP Practice Assessment Study](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5349272/)
- [PMC - GP Group Practice Insights](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4926723/)
- [Medprax - 2026 Medical Scheme Tariff Rates](https://www.medprax.co.za/stories/2026-medical-scheme-tariff-rates-medpraxs-dual-tariff-rates-solution-for-south-african-practices/)
- [Healthbridge - Admin Friction Study](https://healthbridge.co.za/administrative-friction-stifles-practice-growth/)
- [Kitrin - Practice Management Software Pricing](https://kitrin.com/practice-management-software-pricing)
