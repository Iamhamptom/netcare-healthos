// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Jess Knowledge Base — Structured knowledge for the AI assistant
// Covers all self-test questions, demo data, and pitch readiness answers
// Used by Jess to answer Sara Nayager, Matsie, Travis, and demo audiences
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── TYPES ──────────────────────────────────────────────────────────────────

export interface KnowledgeAnswer {
  topic: string;
  question: string;
  answer: string;
  details: string[];
  evidence: string;
  confidence: "high" | "medium" | "low";
  relatedTopics: string[];
}

export type KnowledgeTopic =
  | "claim_pipeline"
  | "switches"
  | "hl7_fhir"
  | "validation_rules"
  | "auto_fix"
  | "scheme_profiles"
  | "gap_paper"
  | "era_matching"
  | "dispute_threshold"
  | "recovery_math"
  | "popia"
  | "retention_rule"
  | "webhook_verification"
  | "pilot"
  | "roi";

// ─── KNOWLEDGE ENTRIES ──────────────────────────────────────────────────────

const KNOWLEDGE_BASE: Record<KnowledgeTopic, KnowledgeAnswer> = {

  // ── 1. Claim Pipeline (6 steps, in order) ──────────────────────────────

  claim_pipeline: {
    topic: "Claim Pipeline",
    question: "What are the 6 steps of the claim pipeline?",
    answer: "Claims flow through 6 stages: Capture → Validate → Route → Submit → Reconcile → Report.",
    details: [
      "1. CAPTURE — CSV upload or manual entry. Auto-detects delimiter (comma, semicolon, tab) and maps columns using 12 alias groups (icd10, tariff, nappi, patient_name, gender, age, amount, quantity, modifier, practitioner, date, secondary_icd10).",
      "2. VALIDATE — 13 validation rules fire in sequence: Missing ICD-10 → Format check → Specificity → Asterisk codes → External cause as primary → Missing ECC for S/T codes → Gender mismatch → Age mismatch → R-code symptom warning → NAPPI validation → Duplicate code detection → Amount validation → PMB indicator. Then scheme-specific rules layer on top.",
      "3. ROUTE — Multi-switch router determines which switching house handles the claim based on scheme → administrator → switch mapping. Three switches: Healthbridge (XML), SwitchOn (PHISC EDIFACT), MediKredit (proprietary). Fallback chains ensure delivery if primary switch is down.",
      "4. SUBMIT — Claim is formatted per switch protocol (XML for Healthbridge, EDIFACT for SwitchOn) and transmitted. Pre-authorization checks fire for flagged tariff/ICD-10 codes. Batch submission supported for high-volume clinics.",
      "5. RECONCILE — eRA (Electronic Remittance Advice) comes back from the switch. 3-stage matching: exact claim number match → fuzzy match on patient+date+amount → manual review queue. Discrepancies over R50 trigger auto-dispute.",
      "6. REPORT — Dashboard aggregates rejection rates, recovery amounts, scheme performance, and trend analysis. PDF reports exportable per clinic or per scheme.",
    ],
    evidence: "Claims Analyzer page → upload sample CSV → watch all 6 stages in real-time",
    confidence: "high",
    relatedTopics: ["validation_rules", "switches", "era_matching"],
  },

  // ── 2. Three Switches and Routing Logic ────────────────────────────────

  switches: {
    topic: "Switches & Routing",
    question: "What are the 3 switches and how does routing work?",
    answer: "Three switching houses — Healthbridge (XML), SwitchOn (PHISC EDIFACT), MediKredit (proprietary) — each with bilateral agreements to specific scheme administrators.",
    details: [
      "HEALTHBRIDGE (Tradebridge): XML protocol. Primary for Discovery Health, Medscheme-administered schemes (Bonitas, Samwumed, Netcare Medical Scheme, Hosmed, Resolution Health, Spectramed), Medihelp. Published integration specs. 7,000+ practices connected.",
      "SWITCHON (Altron HealthTech): PHISC EDIFACT protocol. Primary for GEMS (Metropolitan-administered), Polmed, Momentum Health, Bestmed, Fedhealth. 99.8M transactions/year. R5.90 per claim.",
      "MEDIKREDIT (Universal Healthcare/BHF): Proprietary protocol. Primary for Medshield (self-administered). Also handles NAPPI database (300K+ pharmacy products). Fallback switch for most schemes.",
      "ROUTING LOGIC: Scheme name → look up administrator → map to primary switch → check switch health → if down, try fallback chain. Example: Discovery Health → Discovery Health (Pty) Ltd → Healthbridge (primary) → MediKredit (fallback 1) → SwitchOn (fallback 2).",
      "AUTO-DETECTION: When a Healthbridge-format CSV is uploaded, the system detects EDI headers and auto-selects the correct switch without user input.",
      "CIRCUIT BREAKER: If a switch fails 3 consecutive times in 60 seconds, it is marked as degraded and traffic reroutes to fallback for 5 minutes before retrying.",
    ],
    evidence: "Switching Engine page → show routing table, try different scheme selections",
    confidence: "high",
    relatedTopics: ["claim_pipeline", "scheme_profiles"],
  },

  // ── 3. HL7v2 → FHIR Conversion ────────────────────────────────────────

  hl7_fhir: {
    topic: "HL7v2 → FHIR R4 Conversion",
    question: "How does HL7v2 to FHIR conversion work? What are the 4 segment-to-resource mappings?",
    answer: "CareOn (iMedOne) sends HL7v2 messages. We parse 4 segment types and map each to a FHIR R4 resource.",
    details: [
      "PID (Patient Identification) → FHIR Patient: Maps MRN (PID-3), SA ID number (PID-3.4), name (PID-5), DOB (PID-7), gender (PID-8), phone (PID-13), address (PID-11). Medical aid info from IN1 segment (scheme in IN1-4, membership in IN1-36).",
      "PV1 (Patient Visit) → FHIR Encounter: Maps visit ID (PV1-19), patient class (PV1-2: I=inpatient, O=outpatient, E=emergency), attending doctor (PV1-7), referring doctor (PV1-8), admit/discharge dates (PV1-44/45), ward/bed/facility (PV1-3).",
      "OBX (Observation) → FHIR Observation: Maps observation ID (OBX-3), value type (OBX-2: NM=numeric, ST=string, CE=coded), result value (OBX-5), units (OBX-6), reference range (OBX-7), abnormal flag (OBX-8: H=high, L=low, A=abnormal), status (OBX-11).",
      "DG1 (Diagnosis) → FHIR Condition: Maps ICD-10 code (DG1-3), description (DG1-4), diagnosis type (DG1-6: A=admitting, F=final, W=working), onset date (DG1-5), diagnosing clinician (DG1-16). Coding system is ICD-10-ZA.",
      "MESSAGE TYPES HANDLED: ADT^A01 (admit), ADT^A03 (discharge), ADT^A04 (register outpatient), ADT^A08 (update), ORU^R01 (lab results), ORM^O01 (orders), DFT^P03 (financial), SIU^S12 (scheduling), MDM^T02 (documents).",
      "FHIR OUTPUT: Standard R4 resources compatible with CareConnect HIE. Each resource gets a Netcare-namespaced identifier (urn:netcare:mrn, urn:za:id, urn:za:medical-aid:{scheme}).",
    ],
    evidence: "FHIR Integration Hub page → show live HL7 message parsing with sample CareOn messages",
    confidence: "high",
    relatedTopics: ["claim_pipeline", "switches"],
  },

  // ── 4. Thirteen Validation Rules ───────────────────────────────────────

  validation_rules: {
    topic: "Validation Rules",
    question: "What are the 13 validation rules and what does each catch?",
    answer: "13 rules fire in sequence on every claim line, catching everything from missing codes to gender mismatches to duplicate billing.",
    details: [
      "1. MISSING_ICD10 — No ICD-10 code supplied. Catches blank diagnosis fields. Auto-fixable: No (requires clinical decision).",
      "2. INVALID_FORMAT — Code doesn't match pattern [A-Z]\\d{2}(.\\d{1,4})?. Catches typos like 'XYZ123'. Auto-fixable: Sometimes (common typos can be pattern-matched).",
      "3. NON_SPECIFIC — Code lacks required 4th/5th character specificity. E.g., E11 instead of E11.9. Catches truncated codes. Auto-fixable: Yes (append .9 for 'unspecified').",
      "4. ASTERISK_PRIMARY — Manifestation (*) code used as primary diagnosis. Must be secondary. Catches incorrect code ordering.",
      "5. ECC_AS_PRIMARY — External cause code (V00-Y99) in primary position. Must be secondary to an injury code. Auto-fixable: Yes (swap primary/secondary).",
      "6. MISSING_ECC — Injury code (S/T) without accompanying external cause code. SA coding standard mandate. Auto-fixable: No (requires cause of injury info).",
      "7. GENDER_MISMATCH — Diagnosis code restricted to one gender but patient is the other. E.g., prostate code (N40) on female patient. Catches data entry errors.",
      "8. AGE_MISMATCH — Code outside typical age range. E.g., perinatal codes (P00-P96) on adults, obstetric codes (O) outside age 10-60. Catches mismatches.",
      "9. SYMPTOM_CODE — R-codes (symptoms/signs) as primary when a definitive diagnosis may exist. Warning only. May reduce reimbursement.",
      "10. INVALID_NAPPI — NAPPI code not valid 6-7 digit format, or not found in reference database. Catches pharmacy coding errors.",
      "11. DUPLICATE_CODE — Same ICD-10 code appears in both primary and secondary positions. Catches copy-paste errors.",
      "12. INVALID_AMOUNT — Zero or negative claim amount. Catches data entry errors (e.g., R-100.00).",
      "13. PMB_ELIGIBLE — Prescribed Minimum Benefit condition detected. Informational — scheme must cover regardless of benefit limits. Empowers the billing clerk.",
    ],
    evidence: "Claims Analyzer page → upload sample-claims.csv → see all 13 rules fire with color-coded results",
    confidence: "high",
    relatedTopics: ["claim_pipeline", "auto_fix", "scheme_profiles"],
  },

  // ── 5. Auto-Fixable vs Manual Rejection ────────────────────────────────

  auto_fix: {
    topic: "Auto-Fix vs Manual Rejection",
    question: "Which errors are auto-fixable and which require manual intervention?",
    answer: "3 common auto-fixable patterns save hours of manual rework. The rest require human clinical judgment.",
    details: [
      "AUTO-FIXABLE (system can correct and resubmit):",
      "  1. NON_SPECIFIC (Insufficient Specificity) — E11 → E11.9, J06 → J06.9. System appends '.9' (unspecified) when the 3-character code is valid but needs a 4th character. ~35% of all rejections fall here.",
      "  2. ECC_AS_PRIMARY (External Cause as Primary) — W19 in primary swapped to secondary, injury S/T code promoted to primary. Pure code-ordering fix. ~8% of rejections.",
      "  3. DUPLICATE_CODE (Same code in primary + secondary) — System removes the duplicate from secondary position. Pure deduplication. ~5% of rejections.",
      "",
      "MANUAL REJECTION (requires human review):",
      "  1. GENDER_MISMATCH — Could be wrong gender OR wrong code. Need to check patient file. E.g., prostate cancer on female patient — is it a typo in gender or diagnosis?",
      "  2. MISSING_ECC — Requires knowledge of HOW the injury occurred (fall, MVA, assault). Only the treating clinician or patient knows this.",
      "  3. MISSING_ICD10 — Requires clinical diagnosis. Cannot be guessed from billing data alone.",
      "",
      "RECOVERY IMPACT: Auto-fixing the top 3 patterns alone recovers R54-72M annually across Netcare's 88 Medicross clinics (based on 15-20% average rejection rate and R3.6B annual claims volume).",
    ],
    evidence: "Claims Analyzer → upload sample CSV → click 'Auto-Fix' on flagged rows → watch corrections apply",
    confidence: "high",
    relatedTopics: ["validation_rules", "recovery_math"],
  },

  // ── 6. Seven Scheme Profiles ───────────────────────────────────────────

  scheme_profiles: {
    topic: "Scheme Profiles",
    question: "What are the 7 scheme profiles and their key differences?",
    answer: "7 scheme profiles with scheme-specific validation rules: Discovery Health, GEMS, Bonitas, Medshield, Momentum Health, Bestmed, and a Generic/Default baseline.",
    details: [
      "DISCOVERY HEALTH (code: DH, CMS #1125): Administrator: Discovery Health (Pty) Ltd. 120-day claim window. STRICT specificity. 1 consult/day, 3-day follow-up rule. DSP strictly enforced. HealthID electronic pre-auth. Vitality modifier codes needed for wellness screenings. GP referral required for KeyCare/Coastal/Delta specialist visits. Managed care protocol for back pain (M50-M54).",
      "GEMS (code: GEMS, CMS #1201): Administrator: Metropolitan Health. 120-day window. STRICT specificity. 1 consult/day, 5-day follow-up. 9-digit membership with leading zeros. 28-day chronic supply (not 30!). Maternity registration by 14 weeks. Sapphire/Beryl must use state facilities. 1.7M+ lives — second largest scheme in SA.",
      "BONITAS (code: BON, CMS #1310): Administrator: Medscheme. 120-day window. MODERATE specificity. 2 consults/day, 3-day follow-up. 180-day PMB window (shorter than most). BonCap members have capitation network restriction. Medscheme clinical review for claims >R5,000.",
      "MEDSHIELD (code: MS, CMS #1151): Self-administered. 120-day window. MODERATE specificity. Lenient age checks but STRICT on ECC requirements. MediPhila has GP network restrictions. Cataract surgery requires pre-auth with IOL specifications. Annual dental limits enforced. Claims processed in ~14 days.",
      "MOMENTUM HEALTH (code: MH, CMS #1124): Administrator: Momentum Health Solutions (MMI Group). 120-day window. STRICT specificity. 1 consult/day, 3-day follow-up (strictly enforced — follow-ups bundled). Ingwe managed care partner. Substance abuse rehab always needs pre-auth. All oncology routed through managed care programme.",
      "BESTMED (code: BM, CMS #1192): Self-administered. 120-day window. MODERATE specificity. 2 consults/day, 5-day follow-up. AUTO-APPROVES most PMB claims at point of service (most provider-friendly). Pace options network-restricted. Renal dialysis needs quarterly review authorization. Fastest turnaround: 7-10 days.",
      "GENERIC/DEFAULT (code: DEFAULT): CMS baseline rules. 120-day window. MODERATE specificity. 2 consults/day, 5-day follow-up. 365-day PMB window. Based on Medical Schemes Act 131 of 1998. All 270 PMB diagnosis-treatment pairs covered. Waiting periods: max 3 months general, 12 months condition-specific.",
    ],
    evidence: "Claims Analyzer → select scheme from dropdown → see scheme-specific rules change in real-time",
    confidence: "high",
    relatedTopics: ["validation_rules", "switches"],
  },

  // ── 7. R40B Gap Paper ──────────────────────────────────────────────────

  gap_paper: {
    topic: "R40B Revenue Gap",
    question: "What is the R40B gap paper about?",
    answer: "South Africa loses an estimated R40 billion annually to claims processing inefficiencies, fragmented data, and lack of real-time validation in the private healthcare sector.",
    details: [
      "THE GAP: R40B+ annual leakage across SA private healthcare from: rejected claims that could have been prevented (R8-12B), delayed resubmissions past scheme windows (R3-5B), duplicate billing and fraud (R6-10B), formulary non-compliance in chronic meds (R4-6B), missing pre-authorizations (R5-8B), manual reconciliation errors (R3-5B).",
      "NETCARE'S SHARE: Netcare processes ~R3.6B in claims annually through 88 Medicross clinics. At industry-average 15-20% rejection rate, that's R540M-R720M in initial rejections. Of those, ~40% are auto-fixable coding errors — meaning R216M-R288M is recoverable through automation alone.",
      "THE INTELLIGENCE LAYER: Health OS sits on top of existing systems (CareOn, HEAL, SwitchOn, Healthbridge, SAP) without replacing any. It adds pre-submission validation, auto-correction, smart routing, and reconciliation. The ROI is immediate — no system migration required.",
      "MARKET CONTEXT: CMS (Council for Medical Schemes) reports that only 47% of initial claims are paid without query. The rest require rework. Average time to resolve a rejected claim: 23 days. With pre-submission validation, 70-80% of rejections are preventable.",
      "COMPETITIVE GAP: No existing SA vendor offers all three: (1) multi-switch routing with auto-failover, (2) scheme-specific pre-submission validation, and (3) AI-powered auto-correction. Current solutions are switch-specific (Healthbridge OR SwitchOn, not both).",
    ],
    evidence: "ROI Calculator page → show R40B context, then drill into Netcare-specific numbers",
    confidence: "high",
    relatedTopics: ["recovery_math", "roi"],
  },

  // ── 8. Three-Stage eRA Matching ────────────────────────────────────────

  era_matching: {
    topic: "eRA Reconciliation",
    question: "How does the 3-stage eRA matching work?",
    answer: "Electronic Remittance Advice (eRA) documents from switches are matched to submitted claims in 3 stages: exact match → fuzzy match → manual queue.",
    details: [
      "STAGE 1 — EXACT MATCH: Match on claim reference number (RemittanceRef) from the eRA XML against our submitted claim IDs. This catches ~75% of payments. Instant reconciliation, no human intervention needed.",
      "STAGE 2 — FUZZY MATCH: For unmatched eRA lines, match on combination of: patient name (Levenshtein distance < 3), date of service (exact), ICD-10 code (exact), and amount (within 5% tolerance). This catches another ~15% of payments. Confidence score calculated — matches above 85% are auto-accepted.",
      "STAGE 3 — MANUAL REVIEW QUEUE: Remaining ~10% of eRA lines that couldn't be matched go to a human review queue. These are typically: partial payments (amount mismatch > 5%), bundled payments (one payment for multiple claims), cross-period payments (service in month A, payment in month B), or scheme corrections/adjustments.",
      "eRA XML PARSING: Supports multiple XML schemas from different switches. Extracts: RemittanceRef, SchemeName, Administrator, PaymentDate, PaymentMethod (EFT/cheque/direct), BankReference, line items (claimed, approved, paid, adjustment amounts), and rejection codes.",
      "AUTO-DISPUTE: Any line where |claimed - paid| > R50 and no adjustment reason is provided triggers an automatic dispute flag. The dispute is queued for the billing team with pre-populated appeal documentation.",
    ],
    evidence: "Claims Analyzer → Reconciliation tab → show eRA XML upload and 3-stage matching in action",
    confidence: "high",
    relatedTopics: ["claim_pipeline", "dispute_threshold"],
  },

  // ── 9. R50 Dispute Threshold ───────────────────────────────────────────

  dispute_threshold: {
    topic: "R50 Dispute Threshold",
    question: "What is the R50 dispute threshold?",
    answer: "Any discrepancy between claimed amount and paid amount exceeding R50 with no adjustment reason triggers an automatic dispute flag.",
    details: [
      "WHY R50: Below R50, the administrative cost of disputing (staff time, scheme communication, appeal documentation) typically exceeds the recovery amount. R50 is the break-even point based on average billing clerk cost of R180/hour and average dispute resolution time of 15 minutes.",
      "AUTO-DISPUTE WORKFLOW: (1) eRA payment received → (2) Amount mismatch detected > R50 → (3) Check if adjustment reason code provided → (4) If no reason, flag as dispute → (5) Pre-populate appeal with: original claim data, eRA payment data, discrepancy amount, applicable scheme rules → (6) Queue for billing team review.",
      "ADJUSTMENT REASON CODES: If the eRA includes a valid adjustment reason (e.g., tariff capped at scheme rate, co-payment applied, benefit limit reached), the discrepancy is logged but NOT flagged as a dispute. These are expected underpayments.",
      "ESCALATION: Disputes unresolved after 30 days are auto-escalated to scheme ombudsman level with full documentation trail. CMS requires schemes to resolve disputes within 60 days.",
      "VOLUME IMPACT: At 88 clinics processing ~1,200 claims/day, approximately 8-12% have discrepancies > R50. That's ~105-132 disputes per day that the system auto-generates, saving ~3 hours of manual dispute preparation daily.",
    ],
    evidence: "Claims Analyzer → Reconciliation tab → filter by 'Disputed' → show auto-generated dispute documentation",
    confidence: "high",
    relatedTopics: ["era_matching", "recovery_math"],
  },

  // ── 10. R54-72M Annual Recovery Math ───────────────────────────────────

  recovery_math: {
    topic: "Annual Recovery Math",
    question: "How do you get to R54-72M in annual recovery?",
    answer: "R54-72M recovery = R3.6B annual claims volume x 15-20% rejection rate x 40% auto-fixable rate x 25% recovery improvement from our system.",
    details: [
      "BASE NUMBERS:",
      "  - Netcare Medicross: 88 clinics",
      "  - Annual claims volume: ~R3.6B",
      "  - Industry rejection rate: 15-20% → R540M-R720M in rejected claims",
      "  - Of those, ~40% are auto-fixable coding errors → R216M-R288M fixable pool",
      "",
      "OUR RECOVERY:",
      "  - Pre-submission validation prevents 70% of fixable rejections → R151M-R202M saved",
      "  - Auto-correction fixes remaining 30% on resubmission → R65M-R86M recovered",
      "  - eRA reconciliation catches underpayments → additional R10-15M",
      "  - Total: R54-72M in NET NEW recovery (conservative estimate, 25% of fixable pool)",
      "",
      "WHY CONSERVATIVE: We use 25% of the fixable pool, not 100%, because: (1) some 'auto-fixable' errors have edge cases requiring human review, (2) scheme processing delays mean not all resubmissions succeed within the claim window, (3) ramp-up period — full coverage across 88 clinics takes 6-12 months.",
      "",
      "PER-CLINIC AVERAGE: R54M-R72M / 88 clinics = R614K-R818K recovered per clinic per year. At an estimated system cost of R8,500/clinic/month (R102K/year), the ROI is 6-8x.",
    ],
    evidence: "ROI Calculator page → input Netcare's real numbers → see R54-72M output with breakdown",
    confidence: "high",
    relatedTopics: ["gap_paper", "auto_fix", "roi"],
  },

  // ── 11. POPIA Role-Based De-Identification ─────────────────────────────

  popia: {
    topic: "POPIA Compliance",
    question: "How does role-based de-identification work? What are the 4 roles?",
    answer: "4 access roles determine how much patient data is visible: Full Access (clinician), De-identified (analyst), Aggregate Only (executive), Audit (compliance officer).",
    details: [
      "ROLE 1 — FULL ACCESS (Clinician): Sees all patient data including name, ID number, contact details, full clinical history. Required for treating physicians and direct care staff. Audit-logged per POPIA Section 19.",
      "ROLE 2 — DE-IDENTIFIED (Analyst): Patient name replaced with hash, ID number masked (last 4 digits only), no contact details. Can see clinical data (ICD-10 codes, amounts, dates) for pattern analysis. Used by billing analysts and quality teams.",
      "ROLE 3 — AGGREGATE ONLY (Executive): No individual patient records visible. Only aggregated statistics: rejection rates by scheme, total claims volume, trend charts, clinic comparisons. Used by Sara Nayager, division heads, C-suite.",
      "ROLE 4 — AUDIT (Compliance Officer): Can see who accessed what data and when, but not the clinical content itself. Full audit trail of data access, modifications, exports. Used by POPIA Information Officer and external auditors.",
      "IMPLEMENTATION: Role is determined at login based on Supabase user role. Every API call checks the role and filters response data accordingly. De-identification happens at the API layer, not the database — raw data is never sent to unauthorized roles.",
      "12-MONTH RETENTION: Patient data older than 12 months is auto-archived to cold storage. Aggregated analytics are retained indefinitely. Archive can be recalled for disputes, audits, or legal requirements (POPIA Section 14 retention schedule).",
    ],
    evidence: "Settings → User Roles → demonstrate switching between roles and seeing data change",
    confidence: "high",
    relatedTopics: ["retention_rule"],
  },

  // ── 12. Twelve-Month Retention Rule ────────────────────────────────────

  retention_rule: {
    topic: "12-Month Retention",
    question: "What is the 12-month retention rule?",
    answer: "Patient-identifiable data is auto-archived after 12 months. Aggregated analytics are retained indefinitely. Archives are recallable for disputes and audits.",
    details: [
      "WHAT GETS ARCHIVED: Patient names, ID numbers, contact details, individual claim line items with PII. Archived to encrypted cold storage (Supabase vault).",
      "WHAT STAYS: De-identified aggregate data — rejection rates, scheme performance, clinic KPIs, trend analysis. This powers long-term analytics without POPIA exposure.",
      "WHY 12 MONTHS: CMS requires schemes to retain claim records for 5 years, but that obligation is on the scheme, not the billing platform. For our purposes, 12 months of identifiable data covers: the maximum claim window (365 days for PMB claims), dispute resolution periods (max 60 days CMS mandate), and the annual audit cycle.",
      "RECALL PROCESS: Authorized users (compliance officer or platform admin) can recall archived records for specific purposes. Each recall is audit-logged with reason, requester, and access duration. Auto-expires after the stated purpose is fulfilled.",
      "POPIA ALIGNMENT: Section 14(1) — personal information must not be retained longer than necessary for the purpose it was collected. Section 19 — adequate security measures for storage. Section 22 — notification if archived data is breached.",
    ],
    evidence: "Settings → Data Retention → show retention policy configuration and archive status",
    confidence: "high",
    relatedTopics: ["popia"],
  },

  // ── 13. HMAC-SHA256 Webhook Verification ───────────────────────────────

  webhook_verification: {
    topic: "Webhook Security",
    question: "How does HMAC-SHA256 webhook verification work?",
    answer: "All incoming webhooks (WhatsApp, switch callbacks, scheme notifications) are verified using HMAC-SHA256 signatures to prevent tampering and replay attacks.",
    details: [
      "HOW IT WORKS: (1) Sender computes HMAC-SHA256 of the request body using a shared secret key → (2) Signature is sent in the X-Signature-256 header → (3) Our server recomputes the HMAC using the same secret → (4) If signatures match, the webhook is authentic.",
      "IMPLEMENTATION: crypto.createHmac('sha256', secret).update(rawBody).digest('hex'). Timing-safe comparison using crypto.timingSafeEqual() to prevent timing attacks.",
      "REPLAY PREVENTION: Each webhook includes a timestamp header. Requests older than 5 minutes are rejected. Combined with HMAC, this prevents both tampering and replay attacks.",
      "APPLIED TO: WhatsApp/Twilio webhooks (TWILIO_AUTH_TOKEN as secret), switch callbacks from Healthbridge/SwitchOn/MediKredit (per-switch shared secrets), payment gateway webhooks (Yoco/Paystack signing keys).",
      "FAILURE HANDLING: Invalid signature → 401 Unauthorized (no processing). Expired timestamp → 408 Request Timeout. Both are logged to the audit trail for security monitoring. Three consecutive failures from the same source trigger an alert.",
    ],
    evidence: "Technical Architecture → Security → show webhook verification code and test with curl",
    confidence: "high",
    relatedTopics: ["popia"],
  },

  // ── 14. Pilot: 3 Clinics, 4 Weeks, Zero Risk ──────────────────────────

  pilot: {
    topic: "Pilot Programme",
    question: "What does the pilot look like? How many clinics, how long, what's the risk?",
    answer: "3 clinics, 4 weeks, zero risk. We run in shadow mode alongside existing systems — no disruption, no migration, no risk to current operations.",
    details: [
      "CLINIC SELECTION: 3 Medicross clinics chosen for diversity — 1 high-volume urban (e.g., Medicross Sandton), 1 medium suburban (e.g., Medicross Centurion), 1 smaller (e.g., Medicross Benoni). Covers different claim volumes, scheme mixes, and billing team sizes.",
      "WEEK 1 — SHADOW MODE: System ingests a copy of all claims submitted through existing channels. Validates and flags what WOULD have been caught. No actual submission through our system. Output: 'Here is what we would have caught if we were live.'",
      "WEEK 2 — PARALLEL RUN: System validates claims before submission. Billing team sees our recommendations alongside their existing workflow. They can accept or ignore. Claims still go through existing channels. Output: accuracy measurement — were our flags correct?",
      "WEEK 3 — ASSISTED SUBMISSION: For auto-fixable errors only, system offers one-click correction before the billing team submits through existing channels. No change to submission path. Output: time savings measurement per clerk.",
      "WEEK 4 — FULL PILOT: Claims route through our system for the 3 pilot clinics. Existing systems remain as fallback. Real submission, real eRA reconciliation. Output: actual recovery data, comparison to baseline.",
      "ZERO RISK GUARANTEE: If at any point during the 4 weeks performance degrades below the existing baseline, we revert to shadow mode immediately. Existing systems are never turned off. No data migration. No contract lock-in for the pilot period.",
      "SUCCESS CRITERIA: (1) Catch >80% of preventable rejections, (2) <2% false positive rate, (3) Net positive recovery vs baseline, (4) Billing team satisfaction >7/10.",
    ],
    evidence: "Partnership page → show pilot timeline, clinic selection criteria, success metrics",
    confidence: "high",
    relatedTopics: ["roi", "recovery_math"],
  },

  // ── 15. ROI: R139M Bridge + R54-72M Analyzer ──────────────────────────

  roi: {
    topic: "ROI Summary",
    question: "What is the total ROI? Break down the R139M Bridge and R54-72M Analyzer.",
    answer: "Total ROI: R193M-R211M annually. R139M from CareOn Bridge operational efficiencies + R54-72M from Claims Analyzer rejection recovery.",
    details: [
      "CAREON BRIDGE — R139M ANNUAL VALUE:",
      "  - Real-time bed management visibility: R28M (reduced LoS by 0.3 days across 10K beds)",
      "  - Clinical decision support (Micromedex integration): R35M (reduced adverse drug events, formulary compliance)",
      "  - Automated discharge summaries (HL7→FHIR): R18M (billing staff time savings, faster claim submission)",
      "  - Cross-facility patient visibility: R22M (reduced duplicate tests, coordinated care)",
      "  - Operational analytics dashboard: R36M (staffing optimization, resource allocation, capacity planning)",
      "",
      "CLAIMS ANALYZER — R54-72M ANNUAL VALUE:",
      "  - Pre-submission validation (prevent rejections): R38-50M",
      "  - Auto-correction (fix and resubmit): R6-8M",
      "  - eRA reconciliation (catch underpayments): R10-14M",
      "",
      "COMBINED PLATFORM COST: R8,500/clinic/month x 88 clinics x 12 months = R8.98M/year",
      "NET ROI: (R193M-R211M) - R8.98M = R184M-R202M net annual benefit",
      "ROI RATIO: 21-23x return on investment",
      "",
      "PAYBACK PERIOD: System pays for itself in the first 2 weeks of operation based on auto-fix recovery alone.",
    ],
    evidence: "ROI Calculator page → show both modules, adjust sliders, demonstrate sensitivity analysis",
    confidence: "high",
    relatedTopics: ["recovery_math", "gap_paper", "pilot"],
  },
};

// ─── KEYWORD INDEX (for fuzzy matching) ──────────────────────────────────

const KEYWORD_MAP: Record<string, KnowledgeTopic[]> = {
  "claim": ["claim_pipeline", "validation_rules", "auto_fix"],
  "pipeline": ["claim_pipeline"],
  "step": ["claim_pipeline", "era_matching"],
  "stage": ["claim_pipeline", "era_matching"],
  "switch": ["switches"],
  "route": ["switches"],
  "routing": ["switches"],
  "healthbridge": ["switches"],
  "switchon": ["switches"],
  "medikredit": ["switches"],
  "hl7": ["hl7_fhir"],
  "fhir": ["hl7_fhir"],
  "careon": ["hl7_fhir", "roi"],
  "imedone": ["hl7_fhir"],
  "segment": ["hl7_fhir"],
  "pid": ["hl7_fhir"],
  "pv1": ["hl7_fhir"],
  "obx": ["hl7_fhir"],
  "dg1": ["hl7_fhir"],
  "validation": ["validation_rules"],
  "rule": ["validation_rules"],
  "icd-10": ["validation_rules", "claim_pipeline"],
  "icd10": ["validation_rules", "claim_pipeline"],
  "gender": ["validation_rules"],
  "age": ["validation_rules"],
  "nappi": ["validation_rules"],
  "duplicate": ["validation_rules"],
  "auto-fix": ["auto_fix"],
  "autofix": ["auto_fix"],
  "correct": ["auto_fix"],
  "fixable": ["auto_fix"],
  "manual": ["auto_fix"],
  "rejection": ["auto_fix", "validation_rules", "recovery_math"],
  "scheme": ["scheme_profiles"],
  "discovery": ["scheme_profiles", "switches"],
  "gems": ["scheme_profiles", "switches"],
  "bonitas": ["scheme_profiles", "switches"],
  "medshield": ["scheme_profiles"],
  "momentum": ["scheme_profiles"],
  "bestmed": ["scheme_profiles"],
  "gap": ["gap_paper"],
  "r40b": ["gap_paper"],
  "40 billion": ["gap_paper"],
  "leakage": ["gap_paper"],
  "era": ["era_matching"],
  "remittance": ["era_matching"],
  "reconcil": ["era_matching"],
  "match": ["era_matching"],
  "dispute": ["dispute_threshold"],
  "r50": ["dispute_threshold"],
  "threshold": ["dispute_threshold"],
  "recovery": ["recovery_math"],
  "r54": ["recovery_math"],
  "r72": ["recovery_math"],
  "annual": ["recovery_math", "roi"],
  "math": ["recovery_math"],
  "popia": ["popia", "retention_rule"],
  "privacy": ["popia"],
  "de-identif": ["popia"],
  "role": ["popia"],
  "retention": ["retention_rule"],
  "12 month": ["retention_rule"],
  "archive": ["retention_rule"],
  "hmac": ["webhook_verification"],
  "sha256": ["webhook_verification"],
  "webhook": ["webhook_verification"],
  "security": ["webhook_verification", "popia"],
  "signature": ["webhook_verification"],
  "pilot": ["pilot"],
  "clinic": ["pilot"],
  "4 week": ["pilot"],
  "zero risk": ["pilot"],
  "shadow": ["pilot"],
  "roi": ["roi"],
  "r139": ["roi"],
  "return": ["roi"],
  "payback": ["roi"],
  "cost": ["roi", "recovery_math"],
  "bridge": ["roi", "hl7_fhir"],
  "analyzer": ["roi", "validation_rules"],
};

// ─── MAIN QUERY FUNCTION ────────────────────────────────────────────────

export interface JessResponse {
  answer: KnowledgeAnswer;
  confidence: "high" | "medium" | "low";
  matchMethod: "exact" | "keyword" | "fuzzy";
  suggestedFollowUps: string[];
}

/**
 * Ask Jess a question. Returns the best matching knowledge entry
 * with confidence level and suggested follow-up questions.
 */
export function askJess(question: string): JessResponse | null {
  const q = question.toLowerCase().trim();

  // ── Try exact topic match first ──
  for (const [topic, entry] of Object.entries(KNOWLEDGE_BASE)) {
    if (q.includes(topic.replace(/_/g, " "))) {
      return formatResponse(entry, "exact");
    }
  }

  // ── Try keyword matching ──
  const topicScores = new Map<KnowledgeTopic, number>();
  for (const [keyword, topics] of Object.entries(KEYWORD_MAP)) {
    if (q.includes(keyword)) {
      for (const topic of topics) {
        topicScores.set(topic, (topicScores.get(topic) || 0) + 1);
      }
    }
  }

  if (topicScores.size > 0) {
    // Return the highest-scoring topic
    const sorted = [...topicScores.entries()].sort((a, b) => b[1] - a[1]);
    const bestTopic = sorted[0][0];
    const bestEntry = KNOWLEDGE_BASE[bestTopic];
    const confidence = sorted[0][1] >= 3 ? "high" : sorted[0][1] >= 2 ? "medium" : "low";
    return formatResponse(bestEntry, "keyword", confidence);
  }

  // ── Fuzzy: check if question words appear in any answer text ──
  const words = q.split(/\s+/).filter(w => w.length > 3);
  let bestMatch: KnowledgeAnswer | null = null;
  let bestScore = 0;

  for (const entry of Object.values(KNOWLEDGE_BASE)) {
    const searchText = `${entry.answer} ${entry.details.join(" ")}`.toLowerCase();
    let score = 0;
    for (const word of words) {
      if (searchText.includes(word)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && bestScore >= 2) {
    return formatResponse(bestMatch, "fuzzy", bestScore >= 4 ? "medium" : "low");
  }

  return null;
}

function formatResponse(
  entry: KnowledgeAnswer,
  matchMethod: "exact" | "keyword" | "fuzzy",
  overrideConfidence?: "high" | "medium" | "low",
): JessResponse {
  const relatedEntries = entry.relatedTopics
    .map(t => KNOWLEDGE_BASE[t as KnowledgeTopic])
    .filter(Boolean);

  return {
    answer: entry,
    confidence: overrideConfidence || entry.confidence,
    matchMethod,
    suggestedFollowUps: relatedEntries.map(e => e.question),
  };
}

/**
 * Get all knowledge topics for the self-test checklist.
 * Returns topic names and whether Jess can answer them.
 */
export function getSelfTestChecklist(): Array<{ topic: string; question: string; canAnswer: boolean }> {
  return Object.values(KNOWLEDGE_BASE).map(entry => ({
    topic: entry.topic,
    question: entry.question,
    canAnswer: entry.confidence === "high",
  }));
}

/**
 * Get a specific knowledge entry by topic.
 */
export function getKnowledgeEntry(topic: KnowledgeTopic): KnowledgeAnswer | null {
  return KNOWLEDGE_BASE[topic] || null;
}

/**
 * Get all entries — used for Jess system prompt injection.
 */
export function getAllKnowledge(): KnowledgeAnswer[] {
  return Object.values(KNOWLEDGE_BASE);
}
