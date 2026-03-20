# Enterprise Audit Preparation Guide — Netcare Vendor Security & IP Protection

> **Compiled**: 20 March 2026
> **Author**: Visio Research Labs (Claude Code Architect)
> **Purpose**: Complete guide for surviving a JSE-listed hospital group's technology vendor audit while protecting intellectual property
> **Entity**: Touchline Agency (Pty) Ltd / Visio Health OS
> **Context**: Preparing for procurement evaluation by Netcare (Travis Dewing's IT team + A2D24/Netcare Digital)
> **Status**: Living document — update as audit milestones progress

---

## Table of Contents

1. [What Netcare's IT Team Will Do](#part-1-what-netcares-it-team-will-do)
   - [1.1 Security Assessment Tools](#11-security-assessment-tools-they-will-use)
   - [1.2 Security Questionnaires](#12-security-questionnaires-they-will-send)
   - [1.3 Code Review Process](#13-code-review-process)
   - [1.4 Infrastructure Review](#14-infrastructure-review)
   - [1.5 Compliance Documentation Requests](#15-compliance-documentation-they-will-request)
   - [1.6 Netcare-Specific Considerations](#16-netcare-specific-considerations)
2. [IP Protection Strategy](#part-2-ip-protection-strategy)
   - [2.1 What to Share vs What to Protect](#21-what-to-share-vs-what-to-protect)
   - [2.2 Legal IP Protection Mechanisms](#22-legal-ip-protection-mechanisms)
   - [2.3 What to Prepare for the Audit](#23-what-to-prepare-for-the-audit)
   - [2.4 Running Our Own Audit First](#24-running-our-own-audit-first)
3. [Action Plan & Timeline](#part-3-action-plan--timeline)
4. [Sources](#sources)

---

## PART 1: What Netcare's IT Team Will Do

### 1.1 Security Assessment Tools They Will Use

Enterprise IT teams at JSE-listed hospital groups use a layered approach to vendor security assessment. Expect Netcare (via their internal team and A2D24 partnership) to deploy some or all of the following:

#### Penetration Testing (Black-Box / Grey-Box)

| Tool | Type | What It Does | Likelihood |
|------|------|-------------|------------|
| **Burp Suite Professional** | DAST | Intercepts and manipulates HTTP traffic; finds XSS, SQLi, CSRF, auth flaws | Very High |
| **OWASP ZAP** | DAST | Open-source alternative; automated scanning for OWASP Top 10 | High |
| **Nessus Professional** | Vulnerability Scanner | Network-level vulnerability scanning; identifies misconfigurations, CVEs | High |
| **Qualys WAS** | Cloud DAST | Cloud-based web application scanning; continuous monitoring | Medium |
| **Acunetix** | DAST | Automated web vulnerability scanner; targets web-specific flaws | Medium |

**What they will test for (OWASP Top 10 2021):**
1. Broken Access Control (A01) — Can users access other users' data?
2. Cryptographic Failures (A02) — Is data encrypted in transit and at rest?
3. Injection (A03) — SQL injection, XSS, command injection
4. Insecure Design (A04) — Are there fundamental architectural flaws?
5. Security Misconfiguration (A05) — Default credentials, unnecessary services, verbose errors
6. Vulnerable Components (A06) — Known CVEs in dependencies
7. Authentication Failures (A07) — Weak passwords, session management
8. Data Integrity Failures (A08) — Insecure deserialization, missing integrity checks
9. Logging/Monitoring Failures (A09) — Can we detect breaches?
10. SSRF (A10) — Server-side request forgery

#### Static Application Security Testing (SAST)

These tools analyse source code without running the application. **Netcare will NOT typically demand your source code** for SAST — this is what YOU should run internally:

| Tool | Focus | Notes |
|------|-------|-------|
| **SonarQube** | Code quality + basic security | Open-source Community Edition available; finds code smells, bugs, vulnerabilities |
| **Checkmarx One** | Enterprise SAST/DAST platform | Gartner Leader (7x); covers code-to-cloud security |
| **Snyk Code** | AI-driven SAST | Trained on millions of repos; real-world pattern matching |
| **Veracode** | Enterprise AST | Gartner Leader (11x); SaaS-based analysis |

#### Dependency / Supply Chain Scanning

| Tool | What It Checks |
|------|---------------|
| **Snyk Open Source** | npm/yarn dependency vulnerabilities, license compliance |
| **npm audit** | Built-in Node.js vulnerability scanning |
| **GitHub Dependabot** | Automated dependency update PRs with CVE alerts |
| **Socket.dev** | Detects supply chain attacks in npm packages |

#### Vendor Risk Scoring Platforms

Enterprise procurement teams increasingly use automated platforms to score vendors before engagement:

| Platform | What It Does |
|----------|-------------|
| **Bitsight** | Continuous security rating based on external signals (DNS, patching, SSL) |
| **SecurityScorecard** | A-F rating of vendor security posture |
| **UpGuard** | Vendor risk monitoring + questionnaire automation |
| **Censinet RiskOps** | Healthcare-specific vendor risk platform (40,000+ healthcare vendors indexed) |

**Bottom line**: They will primarily do **black-box/grey-box testing** against the running application. They scan the outside — SSL config, HTTP headers, API endpoints, authentication flows, session management. They will NOT typically ask for source code.

---

### 1.2 Security Questionnaires They Will Send

Enterprise buyers send standardised questionnaires before or alongside technical assessment. Expect one or more of the following:

#### SIG (Standardized Information Gathering) Questionnaire

- **Created by**: Shared Assessments (consortium of enterprises, financial institutions, consulting firms)
- **SIG Core**: ~855 questions across 19 risk domains — used for high-risk vendors
- **SIG Lite**: ~126 questions — used for lower-risk or preliminary assessment
- **Coverage**: Enterprise security, business continuity, compliance, data privacy, incident response
- **Healthcare relevance**: SIG is the standard for healthcare and financial services procurement

**19 SIG Risk Domains:**
1. Enterprise Risk Management
2. Security Policy
3. Organizational Security
4. Asset and Info Management
5. Human Resources Security
6. Physical and Environmental Security
7. IT Operations Management
8. Access Control
9. Application Security
10. Cybersecurity Incident Management
11. Operational Resilience
12. Compliance and Legal
13. End User Device Security
14. Network Security
15. Privacy
16. Threat Management
17. Server Security
18. Cloud Hosting Services
19. Artificial Intelligence

#### CAIQ (Consensus Assessment Initiative Questionnaire)

- **Created by**: Cloud Security Alliance (CSA) as part of the STAR program
- **Version**: CAIQ v4 (current)
- **Focus**: Cloud-specific — 17 domains mapped to the Cloud Controls Matrix (CCM)
- **Best for**: If the customer specifically questions cloud hosting (Vercel/Supabase)
- **Question count**: ~260 questions

#### Custom Vendor Risk Assessment (Most Likely from Netcare)

Netcare will likely send their **own vendor risk assessment form** through the Zycus procurement platform. Based on typical JSE-listed healthcare company assessments, expect questions in these categories:

**Data Protection & Privacy (20-30 questions)**
- How do you comply with POPIA?
- Where is patient data stored? Which country/region?
- Do you process special personal information (health data)?
- What is your lawful basis for processing?
- Who is your Information Officer (POPIA)?
- Do you have a PAIA Section 51 manual?
- How do you handle data subject access requests?
- What is your data retention policy?
- How do you handle data breaches? Timeline for notification?
- Do you have a data processing agreement template?
- Who are your sub-processors? Where are they located?

**Information Security (25-35 questions)**
- Do you have an information security policy? When last reviewed?
- Are you ISO 27001 certified? If not, what framework do you follow?
- Do you conduct regular penetration testing? Share latest report.
- Do you have a vulnerability management program?
- How do you manage access control? Role-based?
- Do you use multi-factor authentication?
- How do you encrypt data at rest? In transit?
- What is your incident response plan?
- Do you have a security awareness training program?
- What logging and monitoring do you implement?
- Do you conduct regular security audits?

**Business Continuity & Disaster Recovery (10-15 questions)**
- Do you have a business continuity plan?
- What is your RTO (Recovery Time Objective)?
- What is your RPO (Recovery Point Objective)?
- Do you have a disaster recovery site?
- How often do you test DR procedures?
- What is your SLA for uptime?

**Technical Architecture (10-15 questions)**
- What is your technology stack?
- Where is the application hosted?
- Do you use containerisation?
- How do you manage deployments?
- What is your change management process?
- Do you separate development, staging, and production environments?

**Third-Party Risk (5-10 questions)**
- Who are your critical third-party providers?
- Do you conduct due diligence on sub-processors?
- What happens if a third party has a breach?

**AI-Specific (5-10 questions — increasingly common)**
- What AI models do you use?
- Where is AI inference performed? (On-premise or cloud?)
- Is patient data sent to third-party AI providers?
- How do you handle AI hallucinations in clinical contexts?
- What human oversight exists for AI outputs?
- Do you comply with any AI governance frameworks?

---

### 1.3 Code Review Process

#### Will They Demand Source Code Access?

**Almost certainly not.** Here is the standard practice:

| Approach | Likelihood | Notes |
|----------|-----------|-------|
| **Black-box testing** (running app only) | Very High | Standard for SaaS vendor assessment |
| **Grey-box testing** (running app + API docs + architecture diagrams) | High | Common for healthcare vendors |
| **White-box testing** (full source code review) | Very Low | Only for on-premise deployments or government contracts |
| **Source code escrow** (third party holds code) | Medium | May be requested as a continuity measure |

**Why SaaS vendors do NOT share source code:**
- SaaS is a service, not a product — the customer buys access, not the software
- Source code is the core trade secret of any software company
- Industry standard is to assess the running application, not the code behind it
- Enterprise buyers accept this because they also do not share their internal code with vendors

**If they push for source code access:**
1. Offer a **source code escrow arrangement** instead (see Section 2.2)
2. Offer a **supervised code walkthrough** in a controlled environment (screen share, no copies)
3. Offer **third-party audit reports** (SOC 2, penetration test results)
4. Offer **architecture diagrams** at the appropriate level of abstraction

#### Source Code Escrow — How It Works

Source code escrow is an increasingly standard arrangement in enterprise software procurement in South Africa:

1. **Three parties**: Vendor (you), Customer (Netcare), Escrow Agent (neutral third party)
2. **Deposit**: You deposit your source code, build instructions, and documentation with the escrow agent
3. **Release conditions**: Code is only released to the customer if specific "trigger events" occur:
   - Vendor goes bankrupt or into liquidation
   - Vendor ceases to maintain/support the software
   - Vendor materially breaches the SLA
4. **Verification**: The escrow agent can verify that the deposited code actually builds and runs
5. **Updates**: You update the deposit periodically (quarterly is standard)

**South African Escrow Providers:**
| Provider | Details |
|----------|---------|
| **EscrowSure** | South Africa's leading provider; specialises in software IP protection |
| **TUV SUD South Africa** | International certification body with SA presence |
| **Crown Information Management** | Part of Crown Records Management group |
| **Codekeeper** | International provider serving SA market; automated code verification |

**Cost**: Typically R15,000 - R50,000 per year for a basic escrow arrangement. More complex setups with regular verification testing cost R50,000 - R150,000/year.

**Recommendation**: Proactively offer escrow in your proposal. It shows maturity and eliminates the "what if you go bankrupt" objection without exposing your IP.

---

### 1.4 Infrastructure Review

Netcare's team (especially A2D24, who are AWS Advanced Partners) will scrutinise your hosting infrastructure. Here is what they will check and what our answers are:

#### Vercel Hosting — Is It Acceptable for Healthcare?

| Question | Answer |
|----------|--------|
| **HIPAA compliance?** | Yes — Vercel supports HIPAA on Pro and Enterprise plans; BAA available (self-serve on Pro) |
| **SOC 2 Type II?** | Yes — Vercel conducts annual HIPAA and SOC 2 audits; reports available at security.vercel.com |
| **Data encryption at rest?** | Yes — AES-256 |
| **Data encryption in transit?** | Yes — TLS 1.2+ enforced |
| **Edge nodes in South Africa?** | Yes — **Cape Town (cpt1)** is an active Vercel edge region with 100% uptime over past 90 days |
| **DDoS protection?** | Yes — Built into Vercel's edge network (Cloudflare-level infrastructure) |
| **Annual security audit?** | Yes — Vercel conducts annual audits |

**Critical caveat**: Vercel's HIPAA BAA covers their global infrastructure but **does NOT cover Vercel's database products**. This is why we use Supabase as our database layer.

**Potential pushback from A2D24**: Since A2D24 is an AWS Advanced Partner, they may suggest migrating to AWS. Our response:
- Vercel runs on AWS infrastructure under the hood
- Our database (Supabase) also runs on AWS infrastructure
- Vercel provides a superior developer experience and deployment pipeline for Next.js applications
- We can deploy serverless functions to specific AWS regions if needed
- We are open to discussing hybrid architectures if required

#### Supabase — Is It Acceptable for Patient Data?

| Question | Answer |
|----------|--------|
| **SOC 2 Type II?** | Yes — Supabase has achieved SOC 2 Type II compliance |
| **HIPAA compliance?** | Yes — BAA available on Team Plan and above |
| **Data encryption at rest?** | Yes — AES-256 for all customer data |
| **Data encryption in transit?** | Yes — TLS enforced; application-level encryption for access tokens and keys |
| **South Africa region?** | **No** — Supabase does NOT have a South Africa region. Closest is **Frankfurt (eu-west)** |
| **Self-hosted option?** | Yes — Supabase can be self-hosted on any AWS region including Cape Town (af-south-1) |

**The South Africa Region Gap — Our Risk & Mitigation:**

This is our biggest infrastructure vulnerability. Supabase has 17 datacenter locations but **none in Africa**. Our current project is on `eu-west-1` (Frankfurt).

| Risk | Mitigation |
|------|-----------|
| POPIA data residency concerns | POPIA does not mandate SA-only storage (Section 72 allows transfer with adequate protection); Frankfurt has GDPR protections which are comparable |
| Latency for SA users | Vercel edge (cpt1) handles static content; only database queries hit Frankfurt (~150ms added latency) |
| Netcare preference for AWS Cape Town | We can self-host Supabase on AWS af-south-1 if required |
| New POPIA health data regulations (6 March 2026) | Health data transfers allowed under Section 72(1) conditions: adequate protection in recipient country (Germany/EU qualifies), or data subject consent, or binding agreement |

**Recommended strategy**: Prepare a migration plan showing how we could self-host Supabase on AWS af-south-1 (Cape Town) if Netcare requires SA-resident data. Cost estimate: ~R8,000-15,000/month for a dedicated Supabase instance on AWS Cape Town.

#### SSL/TLS Configuration

Netcare will test SSL/TLS configuration using tools like:
- **SSL Labs (ssllabs.com)** — Industry standard SSL grading (aim for A+)
- **testssl.sh** — Command-line SSL testing
- **Mozilla Observatory** — HTTP security header checking

**What they check:**
- TLS version (must be 1.2+; TLS 1.0/1.1 must be disabled)
- Certificate validity and chain
- HSTS (HTTP Strict Transport Security) headers
- Certificate transparency
- Key exchange algorithms
- Cipher suite configuration

Vercel handles all of this automatically with A+ configurations out of the box.

#### HTTP Security Headers

They will check for these headers using browser dev tools or automated scanners:

| Header | Purpose | Our Status |
|--------|---------|-----------|
| `Strict-Transport-Security` | Forces HTTPS | Vercel sets automatically |
| `X-Content-Type-Options: nosniff` | Prevents MIME type sniffing | Must verify |
| `X-Frame-Options: DENY` | Prevents clickjacking | Must verify |
| `Content-Security-Policy` | Controls resource loading | Must configure |
| `X-XSS-Protection` | Legacy XSS protection | Deprecated but still checked |
| `Referrer-Policy` | Controls referrer information | Must configure |
| `Permissions-Policy` | Controls browser features | Should configure |

---

### 1.5 Compliance Documentation They Will Request

Based on King IV IT governance requirements (mandatory for JSE-listed companies under Principle 12) and standard healthcare vendor procurement, Netcare will request these documents:

#### Mandatory Documents (Must Have Before Audit)

| Document | Status | Priority |
|----------|--------|----------|
| **POPIA Compliance Summary** | Draft exists (see regulatory reference doc) | CRITICAL |
| **PAIA Section 51 Manual** | Not yet created | CRITICAL — up to R2M fine for non-compliance |
| **Information Security Policy** | Not yet created | CRITICAL |
| **Data Processing Agreement (DPA)** | Template needed | CRITICAL |
| **Incident Response Plan** | Not yet created | HIGH |
| **Business Continuity Plan (BCP)** | Not yet created | HIGH |
| **Disaster Recovery Plan (DRP)** | Not yet created | HIGH |
| **Data Retention Policy** | Not yet created | HIGH |
| **Access Control Policy** | Not yet created | HIGH |
| **Change Management Policy** | Not yet created | MEDIUM |
| **Third-Party/Sub-Processor Register** | Not yet created | HIGH |
| **Privacy Notice / Privacy Policy** | Must be on the website | HIGH |

#### Sub-Processor Register (What They Will Want to See)

| Sub-Processor | Service | Data Processed | Location | Compliance |
|--------------|---------|---------------|----------|-----------|
| **Vercel Inc.** | Application hosting, CDN, edge compute | Application code, session data, logs | Global (Edge: Cape Town cpt1) | SOC 2 Type II, HIPAA BAA available |
| **Supabase Inc.** | Database (PostgreSQL), Auth, Storage | Patient data, user credentials, clinical records | Frankfurt, Germany (eu-west-1) | SOC 2 Type II, HIPAA BAA available |
| **Anthropic** | AI inference (Claude models) | Prompts containing clinical context | USA | SOC 2 Type II, data not used for training |
| **ElevenLabs** | Text-to-speech | Text output (no PHI if designed correctly) | USA/EU | Review DPA |
| **Resend** | Transactional email | Email addresses, notification content | USA | Review DPA |

#### PAIA Section 51 Manual — What It Must Contain

The Information Regulator provides an [official template for private bodies](https://inforegulator.org.za/wp-content/uploads/2020/07/PAIA-Manual-Template-Private-Body.pdf). Key sections:

1. Contact details of Information Officer
2. Guide on how to use PAIA (Section 10 guide reference)
3. Description of records held (by category)
4. Description of records available without a request
5. Processing of personal information (POPIA integration)
6. Availability of the manual
7. Request procedure and prescribed fees

**Non-negotiable**: This manual must exist and be filed with the Information Regulator. Penalty for non-compliance: fine up to R2 million or imprisonment up to 2 years.

---

### 1.6 Netcare-Specific Considerations

#### Who Will Conduct the Audit

| Person/Team | Role | What They Know | What They'll Focus On |
|------------|------|---------------|----------------------|
| **Travis Dewing** | Netcare Group CIO (since 2012); CEO of Netcare Digital | 25+ years healthcare IT; built CareOn (R82M investment) with Deutsche Telekom, Apple, IBM Watson, Philips Capsule | Enterprise scalability, integration with existing hospital systems, clinical workflow fit |
| **A2D24 (Muhammad Simjee)** | Netcare Digital JV partner; AWS Advanced Partner; ex-McKinsey | Serverless cloud computing, AWS architecture, elastic search analytics, chatbot integrations | Cloud architecture, AWS compatibility, scalability, security posture |
| **Netcare Procurement** | Zycus-based procurement team | Standard vendor accreditation (75% pass mark required) | B-BBEE, tax compliance, insurance, references, documentation completeness |
| **Netcare InfoSec** | Internal security team | Hospital-grade security requirements, POPIA health data | Penetration testing, vulnerability assessment, data handling |

#### What Travis Dewing's Team Specifically Looks For

Travis built CareOn — Netcare's most extensive digital transformation project — with partners including Deutsche Telekom (Clinical Solutions), Apple, IBM Watson Health, Micromedix, and Philips Capsule Technologies. This means:

1. **He knows enterprise software deeply.** He will not be impressed by a flashy demo alone — he will ask about:
   - Integration capabilities (HL7 FHIR, PHISC standards, API architecture)
   - Scalability (can it handle 50+ hospitals, thousands of concurrent users?)
   - Uptime guarantees and SLA specifics
   - Data migration from existing systems
   - Change management and training plans

2. **He has built with tier-1 tech partners.** His benchmark is Deutsche Telekom, Apple, IBM. He will assess:
   - Is your tech stack enterprise-grade?
   - Do you have the team to support a Netcare-scale deployment?
   - What happens if your lead developer leaves?

3. **He values innovation but demands reliability.** CareOn digitised entire hospitals (first rollout at Netcare Alberton). He understands:
   - The difference between a demo and production-ready software
   - Clinical workflow requirements that non-healthcare developers miss
   - The regulatory landscape (HPCSA, CMS, POPIA, medical schemes)

4. **A2D24 will evaluate cloud architecture.** Muhammad Simjee (McKinsey-trained, Masters in Technology Management from UP) will:
   - Question why you chose Vercel over AWS directly
   - Want to see architecture diagrams, not just the running app
   - Assess whether the solution can integrate into Netcare Digital's existing AWS infrastructure
   - Look for serverless patterns, event-driven architecture, API maturity

#### Will They Insist on AWS?

**Likely pressure but not a dealbreaker.** A2D24 is an AWS Advanced Partner, so their default is AWS. However:

- Vercel runs ON AWS infrastructure — we can demonstrate this
- Our database layer (Supabase) runs on AWS PostgreSQL
- We can offer a hybrid approach: Vercel frontend + AWS-hosted backend services if required
- The key argument is outcomes, not infrastructure: "We deliver faster claim approvals — the cloud provider is an implementation detail"
- If they insist on AWS-native, we can migrate the Next.js app to AWS Amplify or a custom ECS/Fargate setup, but this should be a last resort

---

## PART 2: IP Protection Strategy

### 2.1 What to Share vs What to Protect

#### The Demo — What to SHOW

| Category | Share? | How to Present |
|----------|--------|---------------|
| Running application | YES | Live demo in controlled environment |
| UI/UX design | YES | Visible during demo; screenshots OK |
| Feature capabilities | YES | Demonstrate live |
| Claims intelligence results | YES | Show anonymised/demo data outputs |
| API documentation | PARTIAL | Share endpoint list and capabilities; NOT implementation details |
| Architecture overview | PARTIAL | High-level diagram showing components; NOT internal logic |
| Research papers | YES | Already public on the platform |
| Performance metrics | YES | Response times, uptime stats, throughput |
| Security certifications | YES | Share any audit reports, compliance certificates |
| Customer references | YES | With permission from reference clients |

#### What to NEVER Share

| Category | Why Not | Alternative to Offer |
|----------|---------|---------------------|
| **Source code** | Core trade secret; once exposed, cannot be un-shared | Source code escrow; supervised walkthrough |
| **AI prompts and system instructions** | Competitive advantage; defines clinical intelligence | Describe capabilities and methodology at high level |
| **Claims intelligence algorithms** | Core IP — the "secret sauce" | Share outcomes and accuracy metrics instead |
| **Training data and datasets** | Data provenance and licensing issues | Describe data sources and methodology |
| **Internal business logic** | Competitive advantage | Architecture diagram at appropriate abstraction |
| **Database schema details** | Security risk + reveals data model | ERD at entity level only (no column details) |
| **API keys, credentials, secrets** | Obvious security risk | Never, under any circumstances |
| **Customer data (even anonymised without consent)** | POPIA violation; trust breach | Use synthetic demo data only |
| **Pricing models / unit economics** | Commercial sensitivity | Share pricing to the customer only |
| **Team structure / org chart details** | Reveals capacity constraints | Share team capabilities, not headcount |

#### API Documentation — The Right Level of Sharing

**Share:**
- API endpoint paths and HTTP methods
- Request/response formats (JSON schemas)
- Authentication method (OAuth 2.0, API key, etc.)
- Rate limiting policies
- Error code reference
- Webhook capabilities

**Do NOT share:**
- Internal service architecture behind the API
- Database queries triggered by each endpoint
- AI model selection logic
- Caching strategies
- Internal retry/fallback logic

---

### 2.2 Legal IP Protection Mechanisms

#### 1. NDA — Non-Disclosure Agreement

**YES, WE send one to THEM before the demo.**

This is standard practice and expected by enterprise buyers. Netcare will likely have their own NDA template too — expect a mutual NDA.

**Key clauses for our NDA:**
- **Mutual obligation**: Both parties protect each other's confidential information
- **Definition of Confidential Information**: Explicitly include source code, algorithms, AI models, training data, business methods
- **Exclusions**: Information already public, independently developed, or required by law
- **Duration**: 3-5 years after termination of discussions
- **Permitted use**: Only for evaluating the proposed business relationship
- **Return/destruction**: All materials must be returned or destroyed if deal does not proceed
- **Remedies**: Injunctive relief (not just damages) — because once code is leaked, damages alone do not fix it

**Template**: We already have a mutual NDA template at `/src/app/admin/onboard/agreements/nda.md` — adapt for Netcare (currently drafted for Dr. Lamola).

**Timing**: Send the NDA **before** the first technical demo or detailed feature presentation. A high-level pitch deck can be shared without an NDA, but anything showing architecture, data flows, or detailed capabilities requires one.

#### 2. Source Code Escrow

See Section 1.3 above for full details. Key points:

- Use **EscrowSure** (SA's leading provider) or **TUV SUD South Africa**
- Cost: R15,000-R50,000/year (basic) or R50,000-R150,000/year (with verification)
- Proactively offering escrow in your proposal demonstrates maturity
- This eliminates the "bus factor" / "what if you go bankrupt" objection

#### 3. Patent Protection

**South Africa's position on software patents is nuanced:**

- **Software "as such" is NOT patentable** under SA law
- **Software that produces a tangible technical effect IS patentable** — e.g., an algorithm integrated into a system that improves its functionality
- South Africa is a **non-examining country**: CIPC verifies form only, not substance — meaning patents are granted without merit examination
- Filing cost: ~R1,000-R5,000 for the application; ~R15,000-R40,000 with a patent attorney
- Duration: 20 years from filing date

**Can we patent the claims intelligence methodology?**

Possibly — IF it can be framed as a technical process that produces a tangible technical effect (e.g., "a computer-implemented method for automated medical scheme claim adjudication using machine learning classification of ICD-10 codes against scheme-specific benefit rules"). Consult a patent attorney specialising in software IP:

| Firm | Specialisation |
|------|---------------|
| **Adams & Adams** | SA's largest IP firm; software patent expertise |
| **Spoor & Fisher** | Strong in technology patents |
| **DKVG Attorneys** | Software IP specialists |
| **The Startup Legal** | Tech-focused, startup-friendly pricing |

**Recommendation**: File a provisional patent application (R590 CIPC fee) to establish a priority date while you assess whether a full patent is worth pursuing. You have 12 months to convert it to a complete application.

#### 4. Copyright Protection

**Your source code IS automatically protected by copyright in South Africa.**

Under the Copyright Act 98 of 1978:
- Software code is classified as a **literary work**
- Protection is **automatic** upon creation — no registration required
- Covers both **source code and object code**
- Duration: **50 years** after the author's death
- Protects the **specific expression** (the code as written), NOT the underlying ideas/algorithms

**What this means practically:**
- Nobody can copy your code without permission
- But they CAN independently create software that does the same thing using different code
- Copyright does NOT protect your algorithms, methodologies, or business logic — only the specific code

**How to strengthen copyright evidence:**
- Maintain Git history (proves creation dates and authorship)
- Use copyright notices in source files: `© 2026 Touchline Agency (Pty) Ltd. All rights reserved.`
- Consider depositing code with the **CIPC** or a notary for timestamp evidence
- Keep employment/contractor agreements with clear IP assignment clauses

#### 5. Trade Secrets

**This is your STRONGEST protection for algorithms and business logic.**

Trade secret protection under South African common law (supplemented by the Competition Act and POPIA) protects information that:
1. Is **not generally known** or readily accessible
2. Has **commercial value** because it is secret
3. Has been subject to **reasonable steps** to keep it secret

**What qualifies as our trade secrets:**
- Claims intelligence algorithms and AI prompts
- Medical scheme rule interpretation logic
- ICD-10 code classification methodology
- Training data curation process
- System architecture and integration patterns
- Customer-specific configuration logic

**Reasonable steps to maintain secrecy:**
- NDAs with all employees, contractors, and partners
- Access controls (role-based, need-to-know)
- Code repository access limited to authorised team members
- No public GitHub repos for proprietary code
- Marking documents as "CONFIDENTIAL" or "PROPRIETARY"
- Employee exit procedures (access revocation, reminder of obligations)
- Encryption of code at rest and in transit

---

### 2.3 What to Prepare for the Audit

#### Pre-Audit Preparation Checklist

**Phase 1: Documents (Weeks 1-2)**

| Document | Template/Reference | Effort |
|----------|--------------------|--------|
| PAIA Section 51 Manual | [Information Regulator template](https://inforegulator.org.za/wp-content/uploads/2020/07/PAIA-Manual-Template-Private-Body.pdf) | 2-3 days |
| Information Security Policy | ISO 27001 framework | 3-5 days |
| Privacy Policy (website) | POPIA requirements | 1-2 days |
| Data Processing Agreement | GDPR-style DPA adapted for POPIA | 2-3 days |
| Incident Response Plan | NIST framework | 2-3 days |
| Business Continuity Plan | ISO 22301 framework | 3-5 days |
| Disaster Recovery Plan | Based on Vercel/Supabase capabilities | 2-3 days |
| Data Retention Policy | POPIA + HPCSA record retention rules | 1-2 days |
| Access Control Policy | Based on current RBAC implementation | 1-2 days |
| Change Management Policy | Based on Git/CI/CD workflow | 1-2 days |
| Sub-Processor Register | See Section 1.5 table above | 1 day |
| Architecture Diagram (shareable) | High-level, no implementation details | 1 day |
| Data Flow Diagram | Show encryption points, not implementation | 1-2 days |

**Phase 2: Technical Hardening (Weeks 2-3)**

| Task | Tool | Effort |
|------|------|--------|
| Run OWASP ZAP scan against production | OWASP ZAP (free) | 1 day |
| Run npm audit and fix vulnerabilities | npm audit | 0.5 day |
| Run Snyk scan on dependencies | Snyk (free tier) | 0.5 day |
| Check SSL configuration | SSL Labs (ssllabs.com) | 0.5 hour |
| Configure security headers (CSP, HSTS, etc.) | Next.js middleware | 1 day |
| Review and harden API rate limiting | Verify all routes are limited | 1 day |
| Ensure all API endpoints require authentication | Code review | 1 day |
| Review RBAC implementation | Code review | 1 day |
| Set up error handling (no stack traces in production) | Next.js config | 0.5 day |
| Verify logging and monitoring | Sentry + Vercel logs | 0.5 day |

**Phase 3: Pre-Fill Security Questionnaire (Week 3)**

Pre-prepare answers to the most common 50 questions (see Section 1.2 above). Having these ready shows professionalism and accelerates the process.

**Phase 4: Legal (Weeks 1-4, parallel)**

| Task | Provider | Cost Estimate |
|------|----------|--------------|
| Mutual NDA for Netcare | Adapt existing template | R0 (internal) |
| Source code escrow setup | EscrowSure | R15,000-R50,000/year |
| Provisional patent filing | Patent attorney | R15,000-R40,000 |
| IP assignment agreements review | IP attorney | R5,000-R15,000 |
| PAIA manual filing with Information Regulator | Internal or consultant | R0-R5,000 |

---

### 2.4 Running Our Own Audit First

**Yes — run your own security assessment before they do.** Finding and fixing issues before Netcare's team finds them is far better than being caught off-guard.

#### Self-Assessment Tools (Free / Low-Cost)

| Tool | What It Does | Cost | Priority |
|------|-------------|------|----------|
| **OWASP ZAP** | Automated DAST scanning for OWASP Top 10 | Free | CRITICAL — run first |
| **npm audit** | Dependency vulnerability scanning | Free (built-in) | CRITICAL |
| **Snyk** | Dependency + code scanning | Free tier (200 tests/month) | HIGH |
| **SSL Labs** | SSL/TLS configuration grading | Free (ssllabs.com) | HIGH |
| **Mozilla Observatory** | HTTP security headers check | Free (observatory.mozilla.org) | HIGH |
| **SonarQube Community** | SAST code quality + basic security | Free (self-hosted) | MEDIUM |
| **Lighthouse** | Performance, accessibility, best practices | Free (Chrome DevTools) | MEDIUM |
| **SecurityHeaders.com** | Quick header check | Free | LOW |

#### Running OWASP ZAP Against Our App

```bash
# Install ZAP (macOS)
brew install zaproxy

# Quick automated scan against production
zap-cli quick-scan --self-contained --start-options '-config api.disablekey=true' \
  https://netcare-healthos.vercel.app

# Full scan (takes longer, more thorough)
zap-cli active-scan https://netcare-healthos.vercel.app

# Generate HTML report
zap-cli report -o /path/to/report.html -f html
```

**Important**: Run ZAP against a staging environment first to avoid triggering Vercel's DDoS protection on production. Notify Vercel support if scanning production.

#### Should We Get a Third-Party Pentest?

**Yes, strongly recommended.** A third-party pentest report is one of the most powerful documents you can present during an enterprise audit. It shows:
- You take security seriously
- You have nothing to hide
- You have already identified and fixed issues
- An independent party has validated your security posture

**South African Penetration Testing Firms:**

| Firm | Specialisation | Estimated Cost |
|------|---------------|---------------|
| **Orange Cyberdefense (formerly SensePost)** | SA's most established; founded 2000; now part of Orange Telecom | R80,000 - R250,000 (web app pentest) |
| **Nclose** | ISO/POPIA compliance-focused; strong in healthcare | R50,000 - R150,000 |
| **Wolfpack InfoRisk** | SMB-focused; agile, cost-effective | R30,000 - R80,000 |
| **Secmentis** | Vulnerability assessment specialists | R25,000 - R60,000 |
| **MWR InfoSecurity** (now F-Secure Consulting) | International firm with SA presence | R100,000 - R300,000 |
| **Magix** | Public and private sector; cyber fraud focus | R40,000 - R120,000 |

**Recommended approach:**
1. Run OWASP ZAP yourself first (free) — fix everything it finds
2. Run Snyk/npm audit — fix all critical and high vulnerabilities
3. Then engage a firm like **Nclose** or **Wolfpack InfoRisk** for a professional pentest (R30,000 - R80,000 for a web app assessment)
4. Fix any findings from the professional pentest
5. Present the pentest report (with remediation evidence) to Netcare

**Timeline**: A professional pentest typically takes 1-2 weeks for scoping and testing, plus 1 week for the report. Budget 3-4 weeks total.

**Total pre-audit budget estimate:**

| Item | Cost Range |
|------|-----------|
| OWASP ZAP + npm audit + Snyk (self-run) | R0 (free tools) |
| Third-party penetration test | R30,000 - R80,000 |
| Source code escrow setup | R15,000 - R50,000/year |
| Patent attorney (provisional filing) | R15,000 - R40,000 |
| Legal document preparation (if using attorney) | R10,000 - R30,000 |
| PAIA manual preparation | R0 - R5,000 |
| **Total** | **R70,000 - R205,000** |

If budget is tight, the minimum viable spend is:
- Self-run security scans: R0
- PAIA manual (DIY from template): R0
- Policy documents (DIY from frameworks): R0
- Pentest from Wolfpack InfoRisk or similar: ~R30,000
- **Minimum total: ~R30,000**

---

## PART 3: Action Plan & Timeline

### 4-Week Pre-Audit Sprint

| Week | Focus | Deliverables |
|------|-------|-------------|
| **Week 1** | Legal + Policy Foundation | Mutual NDA (adapted for Netcare); PAIA Section 51 manual; Privacy Policy; Information Security Policy |
| **Week 2** | Technical Hardening | OWASP ZAP self-scan; npm audit + Snyk fix; SSL/TLS verification; Security headers configuration; API hardening review |
| **Week 3** | Compliance Documentation | Data Processing Agreement; Incident Response Plan; BCP/DRP; Data Retention Policy; Access Control Policy; Sub-processor register; Pre-filled security questionnaire answers |
| **Week 4** | Architecture + Presentation | Shareable architecture diagram; Data flow diagram; Demo environment preparation; Third-party pentest (engage firm in Week 1, results by Week 4); Source code escrow setup |

### Demo Day Protocol

1. **Before the meeting**: Send mutual NDA; get signatures from both sides
2. **Opening**: Present compliance documentation pack (physical folder or secure digital share)
3. **Architecture**: Show high-level architecture diagram (no source code, no database schema details)
4. **Live demo**: Use demo/staging environment with synthetic data only
5. **Security**: Present self-assessment results and third-party pentest report
6. **Questions**: Be honest about what you can and cannot share; never share source code in real-time
7. **Follow-up**: Offer source code escrow arrangement; provide security questionnaire responses
8. **After the meeting**: All demo materials remain with you (do not leave USB drives, do not email source code)

---

## Sources

### Security Assessment & Tools
- [Censinet — Healthcare Vendor Risk Assessment Checklist 2025](https://www.censinet.com/perspectives/the-ultimate-healthcare-vendor-risk-assessment-checklist-for-2025)
- [FlowForma — 10 Best Automated Vendor Risk Assessment Tools 2026](https://www.flowforma.com/blog/automated-vendor-risk-assessment-tools)
- [QualySec — Top 10 Cybersecurity Companies in South Africa](https://qualysec.com/cybersecurity-companies-in-south-africa/)
- [DeepStrike — Top Penetration Testing Companies in South Africa 2026](https://deepstrike.io/blog/penetration-testing-companies-south-africa)
- [Blaze InfoSec — Penetration Testing Cost 2026](https://www.blazeinfosec.com/post/how-much-does-penetration-testing-cost/)
- [AppSec Santa — 35 Best SAST Tools 2026](https://appsecsanta.com/sast-tools)
- [Bitsight — VRM Security Questionnaires: SIG, CAIQ & CIS Controls](https://www.bitsight.com/blog/vrm-security-questionnaires-sig-caiq-cis-controls)
- [Bitsight — CAIQ vs SIG Questionnaires](https://www.bitsight.com/blog/caiq-vs-sig-top-questionnaires-vendor-risk-assessment)

### Netcare & A2D24
- [Netcare — CareOn Game-Changer in Healthcare Technology](https://www.linkedin.com/pulse/netcares-careon-game-changer-healthcare-technology-lepeke-mogashoa-3zqbf)
- [Travis Dewing — CIO South Africa Profile](https://cio-sa.co.za/profiles/travis-dewing/)
- [ITWeb — Travis Dewing: Building Teams](https://www.itweb.co.za/article/travis-dewing-building-teams/RWnpNgq21bYMVrGd)
- [Netcare — Netcare and A2D24 Join Forces](https://www.netcare.co.za/News-Hub/Articles/netcare-and-a2d24-join-forces-to-shape-future-of-healthcare)
- [ITWeb — Netcare Establishes Digital Unit](https://www.itweb.co.za/content/G98YdMLY6AAqX2PD)
- [ITWeb — Innovation Quietly Transforms SA Healthcare](https://www.itweb.co.za/content/8OKdWqDYZJbvbznQ)

### Compliance & Legal
- [POPIA Health Data Regulations 2026 — ITLawCo](https://itlawco.com/popia-health-data-regulations-2026/)
- [BizCommunity — New POPIA Regulations on Health Data Protection](https://www.bizcommunity.com/article/new-popia-regulations-on-health-data-protection-what-you-need-to-know-177076a)
- [FANews — POPIA Health Information Regulations Cross the Finish Line](https://www.fanews.co.za/article/legal-affairs/10/general/1120/popia-health-information-regulations-cross-the-finish-line/43549)
- [InCountry — South Africa's Data Sovereignty Laws](https://incountry.com/blog/south-africas-data-sovereignty-laws-and-regulations/)
- [AWS — South Africa Data Privacy Compliance](https://aws.amazon.com/compliance/south-africa-data-privacy/)
- [Information Regulator — PAIA Manual Template](https://inforegulator.org.za/wp-content/uploads/2020/07/PAIA-Manual-Template-Private-Body.pdf)
- [Michalsons — JSE Listing Requirements and King III/IV](https://www.michalsons.com/blog/jse-listing-requirements-king-iii-iv/11545)
- [ITLawCo — IT Governance Under King IV](https://itlawco.com/it-governance-under-king-iv/)

### Infrastructure
- [Vercel — HIPAA Compliance Guide](https://vercel.com/kb/guide/hipaa-compliance-guide-vercel)
- [Vercel — Cape Town (cpt1) Region Pricing](https://vercel.com/docs/pricing/regional-pricing/cpt1)
- [Vercel — Security & Compliance](https://vercel.com/docs/security/compliance)
- [Supabase — HIPAA Compliance](https://supabase.com/docs/guides/security/hipaa-compliance)
- [Supabase — SOC 2 Compliance](https://supabase.com/docs/guides/soc-2-compliance)
- [Supabase — Available Regions](https://supabase.com/docs/guides/platform/regions)
- [GitHub Discussion — Supabase South Africa Region](https://github.com/orgs/supabase/discussions/34614)

### IP Protection
- [The Startup Legal — Protecting Software and Algorithms Under SA IP Laws](https://www.thestartuplegal.co.za/post/protecting-software-and-algorithms-under-south-african-ip-laws)
- [DKVG Attorneys — Protection of Software IP](https://dkvg.co.za/intellectual-property-law-the-protection-of-software-intellectual-property/)
- [Meyer Attorneys — Protection of IT Related IP in SA](https://meyerattorneys.co.za/2024/10/03/protection-of-it-related-ip/)
- [ICLG — Copyright Laws South Africa 2026](https://iclg.com/practice-areas/copyright-laws-and-regulations/south-africa)
- [CIPC — Intellectual Property Online](https://iponline.cipc.co.za/)
- [EscrowSure — Source Code Escrow](https://escrowsure.co.za/source-code-escrow/)
- [TUV SUD — Software Escrow Services SA](https://www.tuvsud.com/en-za/services/testing/software-escrow)
- [Swart Law — Source Code Escrow and Developer Insolvency](https://swart.law/post.aspx?id=13)

### SaaS IP Best Practices
- [Law and Pixels — How to Protect IP in SaaS Contracts](https://lawandpixels.com/saas-ip-protection/)
- [SixFifty — SaaS Non-Disclosure Agreement](https://www.sixfifty.com/blog/saas-non-disclosure-agreement/)
- [AIPLA — Incorporating IP Rights in SaaS Agreements](https://www.aipla.org/list/innovate-articles/incorporating-intellectual-property-rights-in-saas-agreements)

### Netcare Procurement
- [Netcare Supplier Accreditation](https://www.netcare.co.za/Netcare-Suppliers/Suppliers-Accreditation-Form)
- [Zycus — Netcare Supplier Registration](https://dewdrops.zycus.com/zsp/guest/genericRegister/NET582)
- [Zycus — Netcare Selects Zycus](https://www.zycus.com/press-releases/netcare-south-africa-selects-zycus-to-strengthen-its-source-to-contract-processes)
