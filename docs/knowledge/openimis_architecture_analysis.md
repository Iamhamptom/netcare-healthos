# openIMIS Architecture Analysis — Claims Adjudication

> Research date: 2026-03-24
> Purpose: Understand openIMIS 3-tier claims adjudication for Netcare Health OS integration/learning

---

## 1. Three-Tier Architecture

openIMIS implements a **3-level claims adjudication pipeline**:

### Tier 1: Rule-Based Engine (Configurable Claims Review Engine)
- **First pass**: All claims hit the rule engine before anything else
- Rules are **predefined** and configured per insurance product/scheme
- Checks include:
  - Beneficiary eligibility (policy active, waiting periods)
  - Service/item allowed under product definition
  - Diagnosis-to-service mapping (e.g. "service X cannot be claimed for diagnosis Y")
  - Quantity limits and frequency caps (configurable time between repeat claims)
  - Price ceiling validation against scheme tariff schedules
  - Duplicate claim detection
- **Output**: Claims are marked as accepted, partially accepted, or rejected
- **Limitation**: The built-in automated checks are **fixed** — users cannot add new check types on arbitrary fields, only configure parameters within existing check types
- Rejected claims are returned to the provider for correction/re-submission
- Accepted/partially accepted claims proceed to Tier 2

### Tier 2: AI/ML Module (Claim Categorization)
- Claims that pass Tier 1 are fed to the **AI categorization module**
- The AI module processes each **service line item** individually (not whole claims)
- **Input**: A service or item that has been statically validated by the Rules Engine
- **Output**: accept, reject, or "needs manual review"
- Operates via FHIR R4 — accepts FHIR Claim Bundles with Contained Resources, responds with FHIR ClaimResponse Bundles
- Can run as **standalone** or integrated within openIMIS workflows
- Event-based activation: can be configured to push claims to AI immediately after Rule Engine check

### Tier 3: Manual Review (Medical Officers)
- Claims flagged by AI as uncertain go to Medical Officers
- **Quality Assurance module** also randomly samples AI-categorized claims to catch false positives/negatives
- Review page shows claimed vs. applied quantities, allowing adjusters to modify reimbursement
- Nepal context: 5 Medical Officers could only review ~1,000 claims/day manually — the AI tier was essential to handle 40,000-80,000/day

### Flow Diagram
```
Claim Submitted
    |
    v
[Tier 1: Rule Engine] --rejected--> Return to Provider
    |
    | (accepted/partial)
    v
[Tier 2: AI/ML Model] --accepted--> Queue for Payment
    |                  --rejected--> Return to Provider
    | (uncertain)
    v
[Tier 3: Manual Review] --accepted--> Queue for Payment
    |                    --rejected--> Return to Provider
    v
[QA Sampling] -- random audit of AI decisions
```

---

## 2. ML Models Used

### Voting Classifier Ensemble
The AI module uses a **Voting Classifier** combining multiple models:

| Model | Type | Role |
|-------|------|------|
| Random Forest | Ensemble (bagging) | Primary classifier |
| Extra-Trees | Ensemble (bagging) | Diversity classifier |
| Extra Gradient Boost (XGBoost) | Ensemble (boosting) | Precision classifier |
| Decision Tree | Single tree | Base classifier (sometimes excluded) |

- **Best configuration**: 3 classifiers (Random Forest + Extra-Trees + XGBoost) with **hard voting**
- Decision Tree was dropped from the best-performing ensemble

### Key Parameters
- Tree depth: default 6
- Learning rate (boosting): default 0.3
- Sample fraction per tree: default 1.0

### Performance Thresholds
- Models must achieve **f1-score >= 0.60** to be considered
- Selected models have **f1-score >= 0.65** and **accuracy >= 0.98**
- The high accuracy vs. moderate f1 suggests class imbalance (most claims are legitimate)

### What They're NOT Using
- No deep learning / neural networks
- No LLMs or NLP on clinical notes
- No transformer architectures
- Pure classical ML on structured claim data — this is pragmatic and appropriate for the domain

---

## 3. Scheme-Specific Rule Handling

### Product-Based Configuration
- Rules are tied to **insurance products** (their term for benefit plans/schemes)
- Each product defines:
  - Allowed medical services and items
  - Pricing schedules per service/item
  - Diagnosis-service mappings (which services are valid for which diagnoses)
  - Frequency limits (minimum time between repeat claims for same service)
  - Benefit ceilings and deductibles

### Limitations
- The rule engine checks are **fixed in code** — you can configure parameters but cannot create entirely new rule types without modifying source code
- This is a known limitation that the openIMIS team acknowledges
- The AI module compensates by learning patterns that rules cannot express

### How This Maps to SA Schemes
| openIMIS Concept | SA Equivalent |
|------------------|---------------|
| Insurance Product | Medical scheme option (e.g., Discovery KeyCare+) |
| Service/Item definitions | Tariff code schedules per scheme |
| Diagnosis-service mapping | ICD-10 to tariff code validation |
| Frequency limits | Scheme-specific claiming rules |
| Price ceilings | Scheme tariff rates (NHRPL-based or custom) |

---

## 4. What We Can Learn/Borrow

### Architecture Patterns (HIGH VALUE)
1. **3-tier pipeline is proven**: Rules first (fast/cheap) -> ML second (catches what rules miss) -> Human last (expensive, reserved for edge cases). We should adopt this exact pattern.
2. **Per-line-item AI scoring**: They score individual service lines, not whole claims. This gives granular feedback. We already do this in our validation engine.
3. **QA sampling of AI decisions**: Randomly auditing AI-accepted claims catches model drift. We should implement this.
4. **Event-driven activation**: Claims flow through tiers via events, not batch processing. Enables real-time adjudication.
5. **FHIR R4 interop**: Their AI module accepts/returns FHIR bundles, making it pluggable. Our FHIR Hub already supports this.

### ML Approach (MEDIUM VALUE)
1. **Ensemble voting classifier** is a solid, interpretable approach for structured claim data
2. **No deep learning needed** — classical ML on structured data outperforms here
3. **Feature engineering matters more than model complexity** — their features are: diagnosis code, service code, claimed amount, provider ID, beneficiary demographics, claim frequency
4. **Our historical behavior module** (Task 2) is essentially building the feature store they feed into their models

### Technical Decisions (LEARN FROM)
1. **Fixed rule engine is a limitation** — we should make our rules configurable from day 1 (we already do this with scheme-rules.ts and switchboard-rules.ts)
2. **Class imbalance handling** — 98% accuracy but only 65% f1 means their model is biased toward "accept." We need to address this in our design.
3. **Separate AI service** — their AI runs as a separate service, not embedded in the claim module. Good for scaling and model updates.

---

## 5. Code Reusability Assessment

### License
- **GNU AGPL v3** (copyleft) — any modifications must be open-sourced if served to users
- This is problematic for a commercial SaaS product like Netcare Health OS
- **Cannot directly copy code** without AGPL obligations applying to our entire codebase

### Technical Stack
- Backend: **Django (Python)** — our stack is Next.js/TypeScript
- Database: **MS SQL Server** (legacy) or PostgreSQL — we use Prisma + Supabase
- Frontend: **React** — compatible, but module architecture is openIMIS-specific
- AI module: **Python/scikit-learn** — could potentially run as a separate microservice

### What IS Reusable (with caution)
| Component | Reusability | Notes |
|-----------|-------------|-------|
| Architecture patterns | HIGH | 3-tier pattern, QA sampling — these are ideas, not code |
| ML model approach | HIGH | Voting classifier ensemble is a well-known pattern |
| FHIR R4 claim/response profiles | MEDIUM | Their FHIR profiles are based on standard HL7, useful as reference |
| Rule engine logic | LOW | Fixed, Django-specific, we already have a better configurable engine |
| Frontend components | NONE | React but deeply coupled to openIMIS module system |
| Database schema | LOW | MS SQL-oriented, different data model than ours |

### What We Should Build Ourselves (Inspired By openIMIS)
1. **Historical behavior scoring** (Task 2 of this session) — our version of their ML feature store
2. **Configurable rule engine** — we already have this, more flexible than theirs
3. **AI tier** — ensemble classifier on our accumulated historical data
4. **QA sampling module** — randomly audit AI-approved claims
5. **FHIR ClaimResponse generation** — for interop with switches/schemes

---

## 6. Nepal Scale Reference

| Metric | Value |
|--------|-------|
| Beneficiaries | 9+ million |
| Claims/day (2024) | ~14,000 |
| Claims/day (2025) | ~40,000 |
| Claims/day (target) | 80,000+ |
| Manual review capacity | ~1,000/day (5 Medical Officers) |
| AI module status | Integrating (2025-2026) |
| FHIR standard | R4 |

### Scale Comparison to SA
- South Africa processes **~600,000 claims per day** across all schemes
- Netcare alone handles **~50,000-100,000 claims/day**
- openIMIS Nepal scale (80K/day) is comparable to a single large SA hospital group
- Their architecture is proven at this scale — good validation for our approach

---

## 7. Key GitHub Repositories

| Repository | Purpose | URL |
|------------|---------|-----|
| openimis-be_py | Backend assembly (Django) | https://github.com/openimis/openimis-be_py |
| openimis-be-claim_py | Claim module (rules, review) | https://github.com/openimis/openimis-be-claim_py |
| openimis-be-core_py | Core module (shared models) | https://github.com/openimis/openimis-be-core_py |
| openimis-be-api_fhir_r4_py | FHIR R4 API | https://github.com/openimis/openimis-be-api_fhir_r4_py |
| openimis-fe-claim_js | Claim frontend (React) | https://github.com/openimis/openimis-fe-claim_js |
| openimis-dist_dkr | Docker distribution | (org: github.com/openimis) |
| openimis-dev-tools | Developer tools | https://github.com/openimis/openimis-dev-tools |

> Note: The AI claims module does not appear to have a separate public GitHub repository as of March 2026. It may be integrated within the claim module or distributed separately to deployment partners.

---

## 8. Recommendations for Netcare Health OS

### Immediate (This Sprint)
1. Build the **Historical Behavior Store** (Task 2) — this becomes our ML feature pipeline
2. Continue expanding **scheme-rules.ts** — our configurable rule engine is already better than theirs

### Next Sprint
3. Add **QA sampling** to our validation results — randomly flag 5% of "clean" claims for human review
4. Design the **AI scoring tier** architecture — separate service that consumes historical behavior data

### Future
5. Train **ensemble classifier** (Random Forest + XGBoost) on accumulated validation data
6. Add **FHIR ClaimResponse** generation for interop with SA switching houses
7. Build **model monitoring** — track f1-score drift, retrain on new data quarterly

---

## Sources

- [openIMIS AI Claims Solution](https://openimis.org/ai-claims-solution)
- [openIMIS AI-based Claim Adjudication Wiki](https://openimis.atlassian.net/wiki/spaces/OP/pages/1448542777/openIMIS+AI-based+Claim+Adjudication)
- [openIMIS AI Specification](https://openimis.atlassian.net/wiki/spaces/OP/pages/1790345259/openIMIS-AI+-+Specification)
- [openIMIS AI Code and Model Parameters](https://openimis.atlassian.net/wiki/spaces/OP/pages/1575813225/openIMIS-AI+-+5.+AI+code+and+model+parameters)
- [openIMIS Automated Claims Adjudication](https://openimis.atlassian.net/wiki/spaces/OP/pages/885522438/Automated+Claims+Adjucation)
- [openIMIS Improved Claims Review](https://openimis.atlassian.net/wiki/spaces/OP/pages/887455749/Improved+Claims+Review)
- [openIMIS Nepal Deployment](https://openimis.org/nepal)
- [openIMIS Nepal Health Insurance](https://openimis.org/nepal-health-insurance)
- [openIMIS Software License](https://openimis.atlassian.net/wiki/spaces/OP/pages/1341030501/openIMIS+Software+License)
- [openIMIS GitHub Organization](https://github.com/openimis)
- [openIMIS Backend Claim Module](https://github.com/openimis/openimis-be-claim_py)
- [openIMIS Wikipedia](https://en.wikipedia.org/wiki/OpenIMIS)
- [Digital Square — Claim Categorization Using AI](https://applications.digitalsquare.io/content/claim-categorization-using-artificial-intelligence-proof-concept)
- [Swiss TPH — Claims Categorization Using AI](https://www.swisstph.ch/en/projects/project-detail/project/claims-categorization-using-artificial-intelligence)
