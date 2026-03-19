// Save: VisioHealth OS Proprietary Strategy Memorandum to Ops Hub
// Run: npx tsx scripts/save-strategy-memo.ts

import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Saving proprietary strategy memorandum...\n");

  // Upsert: delete existing strategy memo if present, then create fresh
  const existing = await prisma.opsDocument.findMany({
    where: {
      category: "strategy",
      title: "VisioHealth OS — Confidential Proprietary Strategy Memorandum (Original)",
    },
  });
  if (existing.length > 0) {
    await prisma.opsDocument.deleteMany({
      where: { id: { in: existing.map((d) => d.id) } },
    });
    console.log(`Replaced ${existing.length} existing strategy memo(s).`);
  }

  await prisma.opsDocument.create({
    data: {
      practiceId: "",
      category: "strategy",
      title: "VisioHealth OS — Confidential Proprietary Strategy Memorandum (Original)",
      pinned: true,
      content: MEMO_CONTENT,
      metadata: JSON.stringify({
        classification: "CONFIDENTIAL — PROPRIETARY",
        version: "1.0",
        sections: 11,
        appendices: 2,
        createdDate: "2026-03-16",
        lastUpdated: "2026-03-16",
      }),
    },
  });

  console.log("✓ Strategy memorandum saved as OpsDocument (category: strategy, pinned: true)");
  console.log("  Accessible from /dashboard/ops\n");
}

const MEMO_CONTENT = `# VisioHealth OS — Confidential Proprietary Strategy Memorandum

**Classification: CONFIDENTIAL — PROPRIETARY**
**Date: March 2026**

---

## Section 1: Strategic Thesis

VisioHealth OS is positioned as a **sovereign, AI-native healthcare intelligence infrastructure company**. This is not a telemedicine app or EMR clone — it is the underlying movement layer for healthcare data, permissions, workflows, and decision-making.

Infrastructure categories own transformation logic, graph relationships, and trust controls. The platform sits beneath clinical workflows, not alongside them — it is the operating system that other healthcare applications and processes run on top of.

**Core positioning:**
- Not a feature — an infrastructure layer
- Not a tool — an intelligence engine
- Not a product — a platform that generates products
- Not regional — architecturally global from inception, with Africa as the initial wedge market

The strategic thesis rests on a fundamental market insight: healthcare systems worldwide are moving from episodic, siloed care to continuous, connected, data-driven care delivery. The company that controls the intelligence layer — the ontology, the graph, the routing, the trust — controls the transformation.

---

## Section 2: Proprietary Ownership Doctrine

**"Open standards in, proprietary intelligence out."**

VisioHealth OS consumes open standards (HL7 FHIR, ICD-10, SNOMED CT, LOINC) but produces proprietary intelligence that cannot be replicated by adopting the same standards.

**The company owns:**
1. **Internal Healthcare Ontology** — proprietary classification and relationship system for SA healthcare entities, procedures, conditions, and workflows
2. **Identity Framework** — patient, provider, and institution identity resolution across fragmented systems
3. **Care-Routing Logic** — algorithms that determine optimal patient-to-provider matching based on specialty, location, availability, medical aid, urgency, and historical outcomes
4. **Provider/Insurer Intelligence** — aggregated, anonymised performance data on providers and medical aid schemes
5. **Continuity-of-Care Logic** — rules and workflows ensuring patient care continuity across providers, specialties, and institutions
6. **Workflow Telemetry** — operational data on how practices actually function (bottlenecks, peak times, staff utilisation, patient flow)
7. **Risk/Trust Scores** — computed trust and risk ratings for providers, patients, claims, and referrals
8. **Graph Relationships** — the network of connections between all healthcare entities (who refers to whom, which labs serve which practices, which medical aids cover which providers)
9. **Derived Analytics** — all insights, predictions, and recommendations generated from platform data
10. **Cross-Border Operating Rules** — jurisdiction-specific rules for healthcare data movement, licensing, and compliance

**Key principle:** Raw data may belong to patients and providers. The intelligence derived from patterns across that data belongs to the platform.

---

## Section 3: Full Stack Architecture (8 Layers)

### Layer 1: Sovereign Infrastructure
The foundation. Compute, storage, networking, and security infrastructure designed for healthcare-grade sovereignty. Data residency controls, encryption at rest and in transit, hardware security modules for key management.

### Layer 2: Cloud-Native Operating
Container orchestration, auto-scaling, CI/CD pipelines, observability, and disaster recovery. Multi-region capability with data residency awareness. No single hyperscaler dependency — portable across AWS, GCP, Azure, and sovereign cloud providers.

### Layer 3: AI/Knowledge Operations
Model hosting, prompt management, RAG pipelines, vector stores, agent orchestration, and model evaluation. Supports multiple LLM providers (Anthropic, OpenAI, Google, local models). Medical knowledge bases, clinical guidelines, drug databases.

### Layer 4: Proprietary Data Layer
The crown jewels. Healthcare ontology, entity resolution, data normalisation, and the master data model. Converts messy, fragmented healthcare data from thousands of sources into clean, structured, linked intelligence.

### Layer 5: Intelligence Graph
The knowledge graph connecting all healthcare entities — patients, providers, institutions, procedures, conditions, medications, medical aids, claims. Every interaction enriches the graph. The graph powers routing, recommendations, risk scoring, and predictions.

### Layer 6: Trust/Governance
Identity verification, role-based access, consent management, audit logging, compliance enforcement, and data provenance. Implements POPIA, HPCSA, Medical Schemes Act, and future regulatory frameworks. Trust scores for every entity in the system.

### Layer 7: Workflow/Orchestration
The engine that moves work through the system. Patient intake flows, referral workflows, billing pipelines, recall campaigns, task management, notification scheduling, and agent coordination. Configurable per practice, per specialty, per jurisdiction.

### Layer 8: Product/Network
The visible layer. User interfaces, APIs, SDKs, partner integrations, marketplace, and the network effects that make the platform increasingly valuable. Each product (VisioHealth OS, Placeo Health, Integrator, Waiting Room, Payer Connect, VisioMed AI) is a manifestation of the underlying layers.

---

## Section 4: Core Protected Asset Classes

1. **Health Identity Framework** — Cross-system patient and provider identity resolution. A single patient may exist in 10+ systems with different IDs. Our framework links them into a unified identity with privacy-preserving techniques.

2. **Healthcare Ontology** — Proprietary classification system that goes beyond ICD-10 and SNOMED CT. Maps SA-specific conditions, procedures, medications, and workflows into a structured, queryable knowledge base.

3. **Health Intelligence Graph** — The network of relationships between all healthcare entities. Who refers to whom, which labs serve which practices, which medications are commonly co-prescribed, which conditions commonly co-occur. Grows with every interaction.

4. **Care-Routing Engine** — Algorithms that match patients to the optimal provider based on dozens of variables: specialty, sub-specialty, location, availability, medical aid acceptance, language, gender preference, urgency, historical outcomes, and wait times.

5. **Continuity-of-Care Engine** — Ensures patients don't fall through cracks when moving between providers. Automated handoff protocols, follow-up triggers, medication reconciliation, and care plan synchronisation.

6. **Trust Engine** — Computes trust scores for every entity in the system. Provider trust based on outcomes, response times, patient feedback. Patient trust based on attendance, payment history, consent compliance. Claim trust based on coding accuracy and historical patterns.

7. **Claims/Institution Intelligence** — Aggregated intelligence on medical aid scheme behaviour (approval rates, processing times, common rejections), hospital performance, and institutional patterns.

8. **Workflow Intelligence Library** — A growing library of optimised workflows for different practice types, specialties, and scenarios. Best practices codified into reusable, configurable workflow templates.

9. **Derived Intelligence Models** — Machine learning models trained on platform data for prediction (no-show prediction, treatment outcome prediction, demand forecasting), recommendation (provider recommendation, treatment recommendation), and anomaly detection (billing fraud, clinical risk flags).

10. **Cross-Border Operating Logic** — Rules and procedures for operating healthcare services across jurisdictions. Data transfer agreements, licensing requirements, regulatory compliance mapping, and currency/payment handling for each supported country.

---

## Section 5: Data Enrichment Flywheel

The platform operates a compounding data enrichment flywheel:

**Ingest** → Raw data enters the system from practices, patients, labs, pharmacies, medical aids, and hospitals.

**Validate** → Data is checked for completeness, accuracy, and compliance. Invalid data is flagged, quarantined, or corrected.

**Normalise** → Data is mapped to the proprietary ontology. Different representations of the same entity (drug names, condition descriptions, procedure codes) are resolved to canonical forms.

**Link** → Normalised data is linked to existing entities in the intelligence graph. New relationships are discovered and recorded.

**Govern** → Access controls, consent checks, and audit trails are applied. Data provenance is recorded.

**Enrich** → Raw data is enriched with derived intelligence — risk scores, trust scores, recommendations, predictions, and contextual insights.

**Score** → Entities are scored and ranked. Providers get quality scores. Claims get fraud risk scores. Patients get engagement scores.

**Activate** → Enriched, scored data powers product features — routing recommendations, workflow triggers, notifications, reports, and dashboards.

**Learn** → Usage patterns, outcomes, and feedback loop back into the system, improving models, scores, and recommendations over time.

**The flywheel effect:** More institutions joining the platform = more data flowing through the system = better intelligence graph = better routing and recommendations = harder to replace the platform = more institutions join. This is the core defensibility mechanism.

---

## Section 6: Product Family

### VisioHealth Passport
Patient-owned health identity. Portable medical records, consent management, appointment history, and health timeline. The patient's single source of truth across all providers.

### VisioHealth Route
Intelligent care routing. Matches patients to optimal providers based on the intelligence graph. Powers referral networks, second opinions, and specialist discovery.

### VisioHealth Connect
Integration hub. Connects practices to labs, pharmacies, hospitals, medical aids, and other healthcare systems. HL7 FHIR compliant with proprietary enrichment.

### VisioHealth Trust
Governance and compliance engine. Consent management, audit logging, POPIA compliance, HPCSA compliance, and trust scoring. The governance layer for the entire ecosystem.

### VisioHealth Command
The practice operating system. Patient management, booking, billing, workflow automation, task management, and daily operations. The core product that practices interact with daily.

### VisioHealth Intelligence
AI-powered clinical decision support, analytics, and insights. Differential diagnosis suggestions, drug interaction checks, treatment protocol recommendations, and practice performance analytics.

### VisioHealth Global Care
Cross-border healthcare coordination. Medical tourism, expatriate care, and international patient management. Leverages cross-border operating rules and multi-jurisdiction compliance.

**Geographic strategy:** Africa as initial wedge market. Architecture is global from inception — the same platform serves SA, Kenya, Nigeria, and eventually global markets with jurisdiction-specific configuration rather than separate builds.

---

## Section 7: Trust/Governance/Security Doctrine

The platform operates under strict governance principles:

1. **Data Minimisation** — Collect only what is necessary. Store only what is required. Delete when retention periods expire.

2. **Least-Privilege Access** — Every user, system, and API has the minimum permissions required for their function. No blanket admin access.

3. **Data Provenance** — Every piece of data has a recorded origin, modification history, and access log. Who created it, who changed it, who viewed it, and when.

4. **Comprehensive Audit Trails** — Every action in the system is logged. Patient record access, billing modifications, consent changes, system configuration changes. Immutable audit log.

5. **AI Explainability** — Every AI-generated recommendation includes an explanation of the reasoning. No black-box decisions in clinical contexts.

6. **Emergency Overrides** — Clinical emergencies can bypass normal access controls with full audit logging. Emergency access is time-limited and requires post-hoc review.

7. **Human Governance for Sensitive Workflows** — AI assists but humans decide on: clinical diagnoses, treatment plans, billing disputes, consent withdrawal, and data deletion requests.

8. **Regular Security Assessments** — Penetration testing, vulnerability scanning, and compliance audits on a regular schedule.

9. **Incident Response** — Documented procedures for data breaches, system failures, and clinical safety incidents. Notification requirements per POPIA and sector-specific regulations.

10. **Third-Party Risk Management** — All vendors, partners, and integrations are assessed for security, privacy, and compliance risks before onboarding.

---

## Section 8: Backend Infrastructure Partner Requirements

The platform requires infrastructure partners that meet sovereign-grade requirements:

- **Data Residency** — Ability to guarantee data stays within specified jurisdictions (SA, Africa, specific countries)
- **Cloud-Native** — Kubernetes-native, auto-scaling, infrastructure-as-code
- **Portability** — No lock-in to a single hyperscaler. Must be deployable across AWS, GCP, Azure, and sovereign cloud providers
- **Healthcare Compliance** — SOC 2 Type II, ISO 27001, HIPAA-capable (for future US expansion), and POPIA-compliant
- **No Single Hyperscaler Dependency** — Architecture must support multi-cloud and hybrid deployments
- **Edge Capability** — Support for edge computing in low-connectivity environments (rural clinics, mobile health units)
- **Encryption** — End-to-end encryption, encryption at rest, customer-managed encryption keys
- **Observability** — Full-stack observability with healthcare-specific SLAs (99.99% uptime for critical clinical systems)

---

## Section 9: Open vs Closed Source Strategy

**Open the edges, own the centre.**

### Open (Public, Community, Ecosystem)
- SDKs and client libraries
- API documentation and developer guides
- Integration connectors for common systems
- Data format specifications and schemas
- Community tools and utilities
- Educational content and training materials
- Reference implementations and sample code

### Closed (Proprietary, Company-Owned)
- Healthcare ontology and classification system
- Intelligence graph and relationship engine
- Care-routing algorithms and matching logic
- Trust scoring and risk assessment models
- Workflow intelligence library
- Derived analytics and prediction models
- Cross-border operating rules
- Core platform source code
- Trained ML models and training data
- Internal tooling and operations systems

**Rationale:** Open edges create adoption, ecosystem, and developer goodwill. Closed centre creates defensibility, competitive advantage, and revenue. Competitors can build on our APIs but cannot replicate the intelligence inside.

---

## Section 10: Business Model

### Revenue Streams
1. **Platform Subscriptions** — Monthly/annual SaaS fees per practice (tiered: Starter, Professional, Enterprise)
2. **Module Licensing** — Individual product modules (Waiting Room, Payer Connect, etc.) licensed separately or bundled
3. **Integration Fees** — Setup and monthly fees for connecting to external systems (labs, pharmacies, medical aids)
4. **Usage-Based Intelligence** — AI credits for clinical decision support, analytics queries, and intelligence API calls
5. **Travel-Care Services** — Commission on cross-border patient coordination and medical tourism
6. **White-Label Sovereign Deployments** — Full platform deployment for hospital groups, government health departments, or sovereign health authorities

### 5-Phase Rollout
**Phase 1 (Current): Foundation**
- Core practice management (VisioHealth OS / Command)
- First paying clients in SA
- GP referral network for specialists
- POPIA compliance as differentiator

**Phase 2: Network**
- Placeo Health (patient-provider matching)
- Visio Waiting Room (digital queue)
- Practice-to-practice referral network
- Multi-practice group management

**Phase 3: Integration**
- Visio Health Integrator (labs, pharmacies, hospitals)
- VisioHealth Payer Connect (medical aid bridge)
- HL7 FHIR compliance
- Automated claims submission

**Phase 4: Intelligence**
- VisioMed AI (clinical decision support)
- Practice analytics and benchmarking
- Predictive models (no-show, demand, outcomes)
- Population health insights

**Phase 5: Global**
- VisioHealth Global Care (cross-border)
- Multi-country deployment (Kenya, Nigeria, UAE)
- Sovereign deployments for governments
- Medical tourism coordination

---

## Section 11: Risk Factors

1. **Healthcare Regulation** — Healthcare is one of the most regulated industries. Regulatory changes (HPCSA rules, Medical Schemes Act amendments, NHI implementation) could impact platform design, features, or market access.

2. **Data Protection** — POPIA compliance is mandatory. The new Health Information Regulations (March 2026) add additional requirements for health data processing. Non-compliance carries criminal liability.

3. **Cross-Border Complexity** — Each country has different healthcare regulations, data protection laws, medical licensing requirements, and payment systems. Scaling internationally requires jurisdiction-specific legal and compliance work.

4. **Clinical Risk** — AI-generated clinical suggestions carry inherent risk. Misdiagnosis, missed interactions, or incorrect recommendations could result in patient harm and liability.

5. **Infrastructure Dependencies** — The platform depends on cloud infrastructure, AI model providers, and third-party APIs. Outages, pricing changes, or policy changes by these providers could impact operations.

6. **Procurement Cycles** — Healthcare institutions (especially hospital groups and government) have long procurement cycles (6-18 months). Revenue recognition may lag significantly behind sales effort.

7. **Talent Competition** — Skilled developers with healthcare domain knowledge are scarce. Competing with large tech companies and international opportunities for talent in SA.

8. **Market Education** — Many SA practices are not digitally mature. Significant market education required to drive adoption beyond early adopters.

---

## Appendix A: Reserved Rights

VisioHealth OS reserves all intellectual property rights in:
- The VisioHealth name, logo, and brand identity
- All proprietary algorithms, models, and scoring systems
- The healthcare ontology and classification system
- The intelligence graph structure and data
- All derived analytics, predictions, and recommendations
- Platform architecture, source code, and technical documentation
- Workflow templates and configuration libraries
- Training data, model weights, and evaluation benchmarks
- Cross-border operating rules and compliance mappings
- All patents, patent applications, and trade secrets

No part of this memorandum or the described systems may be reproduced, distributed, or disclosed without written authorisation from VisioHealth OS leadership.

---

## Appendix B: Draft Disclaimer Language

**CONFIDENTIAL — FOR AUTHORISED RECIPIENTS ONLY**

This document contains confidential and proprietary information belonging to VisioHealth OS (Pty) Ltd. It is intended solely for the use of the individual(s) to whom it is addressed. If you are not the intended recipient, you are hereby notified that any disclosure, copying, distribution, or taking of any action in reliance on the contents of this document is strictly prohibited and may be unlawful.

This memorandum is provided for informational and strategic planning purposes only. It does not constitute an offer to sell securities, a solicitation of investment, or a guarantee of future performance. Forward-looking statements contained herein are based on current expectations and assumptions and are subject to risks, uncertainties, and changes in circumstances.

The information contained in this document reflects the company's strategic vision as of the date of preparation and may be updated, modified, or superseded at any time without notice. Recipients should conduct their own due diligence before making any investment or partnership decisions.

© 2026 VisioHealth OS. All rights reserved.
`;

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
