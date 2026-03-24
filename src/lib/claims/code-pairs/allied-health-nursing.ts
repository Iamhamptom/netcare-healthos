// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Allied Health & Nursing Overlap Rules — SA Healthcare Claims System
// ~60 rules covering physiotherapy, occupational therapy, speech therapy,
// dietetics, psychology, and nursing procedure bundling/overlaps.
// Reference: CCSA v11, BHF guidelines, SASP (SA Society of Physiotherapy),
//            SASP (Psychological Society of SA), SADA, HPCSA tariff guidelines,
//            SANC nursing scope of practice.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { CodePairViolation } from "./types";

export const ALLIED_HEALTH_NURSING: CodePairViolation[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 1. PHYSIOTHERAPY (~15 rules)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    code1: "6001",
    code2: "6002",
    type: "mutually_exclusive",
    reason:
      "Physiotherapy initial assessment (6001) and follow-up assessment (6002) same day — bill initial assessment only. Initial includes all assessment components performed on the first visit.",
    source: "CCSA v11; SASP (Physiotherapy) guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6003",
    code2: "6004",
    type: "mutually_exclusive",
    reason:
      "Individual physiotherapy treatment (6003) and group treatment (6004) same session — bill one. Patient cannot receive both individual and group treatment simultaneously.",
    source: "CCSA v11; SASP (Physiotherapy) guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6010",
    code2: "6011",
    type: "needs_modifier",
    reason:
      "Ultrasound therapy (6010) and interferential therapy (6011) same session — both may be billed as separate modalities but most schemes limit to 2-3 modalities per session. Document clinical indication for each.",
    source: "CCSA v11; SASP (Physiotherapy) guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6010",
    code2: "6012",
    type: "needs_modifier",
    reason:
      "Ultrasound therapy (6010) and TENS (6012) same session — both may be billed but total modalities per session are typically capped at 2-3 by schemes. Justify each modality.",
    source: "CCSA v11; SASP (Physiotherapy) guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6011",
    code2: "6012",
    type: "needs_modifier",
    reason:
      "Interferential therapy (6011) and TENS (6012) same session — both are electrotherapy modalities. May be billed together if applied to different areas, but schemes may limit total electrotherapy modalities.",
    source: "CCSA v11; SASP (Physiotherapy) guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6010",
    code2: "6013",
    type: "needs_modifier",
    reason:
      "Ultrasound therapy (6010), interferential (6011), and laser therapy (6013) — when three modalities are billed same session, some schemes deny the third. Maximum typically 2-3 modalities per visit.",
    source: "CCSA v11; SASP (Physiotherapy) guidelines; BHF benefit rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6015",
    code2: "6003",
    type: "component_of",
    reason:
      "Exercise therapy (6015) is included in individual treatment session (6003). Therapeutic exercise is a core component of physiotherapy — do not bill separately from the treatment session.",
    source: "CCSA v11; SASP (Physiotherapy) guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6015",
    code2: "6004",
    type: "component_of",
    reason:
      "Exercise therapy (6015) is included in group treatment session (6004). Exercise prescribed during group therapy is part of the session fee.",
    source: "CCSA v11; SASP (Physiotherapy) guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6020",
    code2: "6003",
    type: "needs_modifier",
    reason:
      "Hydrotherapy (6020) and individual physiotherapy treatment (6003) same day — may be billed together only if performed as separate sessions at different times. Document separate session times.",
    source: "CCSA v11; SASP (Physiotherapy) guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6025",
    code2: "6026",
    type: "mutually_exclusive",
    reason:
      "Spinal manipulation by physiotherapist (6025) — physio scope is limited. Do not bill chiropractic codes (6026). Use physiotherapy-specific manipulation codes within HPCSA scope of practice.",
    source: "CCSA v11; SASP (Physiotherapy) guidelines; HPCSA scope of practice; BHF discipline rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6001",
    code2: "6003",
    type: "needs_modifier",
    reason:
      "Physiotherapy initial assessment (6001) and individual treatment (6003) same day — some schemes include the first treatment in the assessment fee. Check scheme rules; many allow both with documentation.",
    source: "CCSA v11; SASP (Physiotherapy) guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6003",
    code2: "6003",
    type: "needs_modifier",
    reason:
      "Two individual physiotherapy treatments (6003) same day — only permitted for separate conditions or separate body areas with documented clinical justification. Modifier required.",
    source: "CCSA v11; SASP (Physiotherapy) guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6020",
    code2: "6004",
    type: "mutually_exclusive",
    reason:
      "Hydrotherapy (6020) and group physiotherapy (6004) — if hydrotherapy is conducted as group therapy, bill group treatment. Do not bill both for the same time slot.",
    source: "CCSA v11; SASP (Physiotherapy) guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6015",
    code2: "6020",
    type: "component_of",
    reason:
      "Exercise therapy (6015) during hydrotherapy session (6020) — aquatic exercise is part of the hydrotherapy session. Do not bill land-based exercise separately when exercises are done in the pool.",
    source: "CCSA v11; SASP (Physiotherapy) guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6025",
    code2: "6003",
    type: "component_of",
    reason:
      "Spinal manipulation (6025) performed during a physiotherapy treatment session (6003) — manipulation is a treatment technique and is part of the session. Some schemes allow separate billing; check rules.",
    source: "CCSA v11; SASP (Physiotherapy) guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. OCCUPATIONAL THERAPY (~10 rules)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    code1: "6100",
    code2: "6101",
    type: "mutually_exclusive",
    reason:
      "OT initial assessment (6100) and follow-up assessment (6101) same day — bill initial assessment only on first visit.",
    source: "CCSA v11; HPCSA OT guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6110",
    code2: "6111",
    type: "mutually_exclusive",
    reason:
      "ADL assessment (6110) and functional capacity assessment (6111) — significant overlap in evaluation scope. Bill the most comprehensive assessment performed. Do not bill both same visit.",
    source: "CCSA v11; HPCSA OT guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6120",
    code2: "6121",
    type: "component_of",
    reason:
      "Splint fabrication (6120) includes splint fitting (6121). Fitting and adjustment are integral to fabrication — do not bill separately.",
    source: "CCSA v11; HPCSA OT guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6130",
    code2: "6003",
    type: "never_together",
    reason:
      "OT hand therapy (6130) and physiotherapy individual treatment (6003) for the same hand same session — do not bill both disciplines for the same body part in the same session. One provider per condition per session.",
    source: "CCSA v11; HPCSA scope of practice; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6100",
    code2: "6110",
    type: "component_of",
    reason:
      "OT initial assessment (6100) includes ADL screening (6110). Comprehensive initial assessment encompasses basic ADL evaluation — bill initial assessment only.",
    source: "CCSA v11; HPCSA OT guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6100",
    code2: "6111",
    type: "component_of",
    reason:
      "OT initial assessment (6100) includes functional screening (6111). Initial assessment encompasses functional capacity overview — bill separately only if formal FCE is done on a different day.",
    source: "CCSA v11; HPCSA OT guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6120",
    code2: "6100",
    type: "needs_modifier",
    reason:
      "Splint fabrication (6120) and OT initial assessment (6100) same day — both may be billed if splint fabrication is a separate procedure from the assessment. Document separate service times.",
    source: "CCSA v11; HPCSA OT guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6130",
    code2: "6100",
    type: "needs_modifier",
    reason:
      "OT hand therapy (6130) and OT initial assessment (6100) same day — assessment may include hand evaluation. If hand therapy is provided as a separate session, modifier required.",
    source: "CCSA v11; HPCSA OT guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6130",
    code2: "6120",
    type: "needs_modifier",
    reason:
      "OT hand therapy (6130) and splint fabrication (6120) same visit — separate procedures that may be billed together. Document distinct services and times.",
    source: "CCSA v11; HPCSA OT guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6101",
    code2: "6130",
    type: "needs_modifier",
    reason:
      "OT follow-up assessment (6101) and hand therapy (6130) same day — may bill both if separate services. Assessment should be distinct from treatment session.",
    source: "CCSA v11; HPCSA OT guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. SPEECH THERAPY (~8 rules)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    code1: "6200",
    code2: "6201",
    type: "mutually_exclusive",
    reason:
      "Speech therapy initial assessment (6200) and follow-up assessment (6201) same day — bill initial assessment on first visit only.",
    source: "CCSA v11; HPCSA speech therapy guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6210",
    code2: "6211",
    type: "mutually_exclusive",
    reason:
      "Speech therapy (6210) and language therapy (6211) same session — these are often overlapping interventions. Bill the primary therapy focus. Do not bill both for the same session.",
    source: "CCSA v11; HPCSA speech therapy guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6220",
    code2: "6221",
    type: "component_of",
    reason:
      "Swallowing assessment (6220) includes swallowing screening (6221). The formal assessment encompasses the screening component — do not bill both.",
    source: "CCSA v11; HPCSA speech therapy guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6230",
    code2: "6200",
    type: "needs_modifier",
    reason:
      "Audiometry (6230) and speech therapy assessment (6200) — different services (audiology vs speech) that may be billed together. Can bill both if performed by appropriately qualified provider.",
    source: "CCSA v11; HPCSA speech/audiology guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6200",
    code2: "6210",
    type: "needs_modifier",
    reason:
      "Speech therapy assessment (6200) and speech therapy treatment (6210) same day — some schemes include initial treatment in the assessment fee. Check scheme rules; many allow both with separate documentation.",
    source: "CCSA v11; HPCSA speech therapy guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6220",
    code2: "6210",
    type: "needs_modifier",
    reason:
      "Swallowing assessment (6220) and speech therapy (6210) same day — different clinical services that may be billed together if performed as separate procedures with distinct time allocations.",
    source: "CCSA v11; HPCSA speech therapy guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6210",
    code2: "6210",
    type: "never_together",
    reason:
      "Two speech therapy sessions (6210) same day — typically one session per day. Second session requires documented clinical justification and separate time period.",
    source: "CCSA v11; HPCSA speech therapy guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6230",
    code2: "6231",
    type: "component_of",
    reason:
      "Pure tone audiometry (6230) includes audiometric screening (6231). Formal audiometry encompasses screening — bill the comprehensive test only.",
    source: "CCSA v11; HPCSA audiology guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. DIETETICS (~6 rules)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    code1: "6300",
    code2: "6301",
    type: "mutually_exclusive",
    reason:
      "Dietetic initial consultation (6300) and follow-up consultation (6301) same day — bill initial consultation on first visit only.",
    source: "CCSA v11; HPCSA dietetics guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6300",
    code2: "6310",
    type: "mutually_exclusive",
    reason:
      "Individual dietetic consultation (6300) and group dietetic session (6310) same day — bill one. Patient cannot receive both individual and group counselling for the same condition same day.",
    source: "CCSA v11; HPCSA dietetics guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6300",
    code2: "6305",
    type: "component_of",
    reason:
      "Dietetic initial consultation (6300) includes BMI calculation and anthropometric measurements (6305). Basic measurements are part of the consultation — do not bill separately.",
    source: "CCSA v11; HPCSA dietetics guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6301",
    code2: "6305",
    type: "component_of",
    reason:
      "Dietetic follow-up consultation (6301) includes anthropometric measurements (6305). Routine measurements at follow-up are part of the consultation fee.",
    source: "CCSA v11; HPCSA dietetics guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6301",
    code2: "6310",
    type: "mutually_exclusive",
    reason:
      "Individual dietetic follow-up (6301) and group session (6310) same day same condition — bill one format. Individual and group counselling for the same topic should not both be billed.",
    source: "CCSA v11; HPCSA dietetics guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6310",
    code2: "6305",
    type: "component_of",
    reason:
      "Group dietetic session (6310) includes any group anthropometric screening (6305). Do not bill measurements separately during group education sessions.",
    source: "CCSA v11; HPCSA dietetics guidelines; BHF allied health rules",
    category: "allied_health_overlap",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. PSYCHOLOGY (~8 rules)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    code1: "6400",
    code2: "6401",
    type: "mutually_exclusive",
    reason:
      "Psychology initial consultation (6400) and follow-up consultation (6401) same day — bill initial on first visit only.",
    source: "CCSA v11; PsySSA guidelines; HPCSA psychology tariff guidelines",
    category: "allied_health_overlap",
  },
  {
    code1: "6410",
    code2: "6411",
    type: "mutually_exclusive",
    reason:
      "Individual psychotherapy (6410) and group psychotherapy (6411) same day — bill one. Patient receives either individual or group therapy per session, not both.",
    source: "CCSA v11; PsySSA guidelines; BHF psychology rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6420",
    code2: "6400",
    type: "needs_modifier",
    reason:
      "Psychometric testing (6420) and psychology consultation (6400) — these are separate services. Testing may be billed in addition to consultation when distinct services are provided with separate time documentation.",
    source: "CCSA v11; PsySSA guidelines; BHF psychology rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6425",
    code2: "6426",
    type: "component_of",
    reason:
      "Neuropsychological assessment (6425) includes basic cognitive screening (6426). The comprehensive neuropsych battery encompasses screening — do not bill both.",
    source: "CCSA v11; PsySSA guidelines; HPCSA psychology tariff guidelines",
    category: "allied_health_overlap",
  },
  {
    code1: "0181",
    code2: "6400",
    type: "needs_modifier",
    reason:
      "Psychiatry consultation (0181) and psychology consultation (6400) same patient same day — allowed if different providers with distinct clinical roles. Flag for review; document separate clinical focus and provider details.",
    source: "CCSA v11; HPCSA scope of practice; BHF mental health rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6400",
    code2: "6410",
    type: "needs_modifier",
    reason:
      "Psychology initial consultation (6400) and individual psychotherapy (6410) same day — some schemes include initial therapy in the consultation fee. Check scheme rules; separate documentation required if billing both.",
    source: "CCSA v11; PsySSA guidelines; BHF psychology rules",
    category: "allied_health_overlap",
  },
  {
    code1: "6420",
    code2: "6425",
    type: "mutually_exclusive",
    reason:
      "Basic psychometric testing (6420) and neuropsychological assessment (6425) same day — neuropsych assessment is a comprehensive battery that includes standard psychometrics. Bill the most comprehensive assessment.",
    source: "CCSA v11; PsySSA guidelines; HPCSA psychology tariff guidelines",
    category: "allied_health_overlap",
  },
  {
    code1: "6401",
    code2: "6410",
    type: "needs_modifier",
    reason:
      "Psychology follow-up consultation (6401) and individual psychotherapy (6410) same visit — consultation and therapy may overlap. If both are distinct services (assessment review + therapy), document separately.",
    source: "CCSA v11; PsySSA guidelines; BHF psychology rules",
    category: "allied_health_overlap",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. NURSING PROCEDURES (~13 rules)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    code1: "8020",
    code2: "0308",
    type: "never_together",
    reason:
      "Nursing ECG recording (8020) and doctor's ECG interpretation+recording (0308) — do not bill nursing recording separately when the doctor bills the combined interpretation and recording code.",
    source: "CCSA v11; BHF nursing rules; SANC scope of practice; HPCSA tariff guidelines",
    category: "nursing_overlap",
  },
  {
    code1: "8006",
    code2: "0382",
    type: "never_together",
    reason:
      "Nursing glucose monitoring (8006) and doctor's glucose test (0382) for the same measurement — do not bill both nursing and doctor codes for the same glucose reading. Bill one provider.",
    source: "CCSA v11; BHF nursing rules; HPCSA tariff guidelines",
    category: "nursing_overlap",
  },
  {
    code1: "8010",
    code2: "8010",
    type: "needs_modifier",
    reason:
      "Phlebotomy/venepuncture (8010) — bundling with pathology specimen collection varies by scheme. Some schemes include phlebotomy in the pathology fee. Check scheme-specific rules.",
    source: "CCSA v11; BHF nursing rules; scheme-specific tariff schedules",
    category: "nursing_overlap",
  },
  {
    code1: "8030",
    code2: "8031",
    type: "mutually_exclusive",
    reason:
      "Simple wound dressing (8030) and complex wound dressing (8031) same wound — bill the highest complexity level. Do not bill both simple and complex for the same wound.",
    source: "CCSA v11; BHF nursing rules; SANC wound care guidelines",
    category: "nursing_overlap",
  },
  {
    code1: "8041",
    code2: "8042",
    type: "mutually_exclusive",
    reason:
      "IM injection (8041) and IV injection (8042) — bill the route used. If both routes are used for different medications, each may be billed separately with documentation.",
    source: "CCSA v11; BHF nursing rules; SANC scope of practice",
    category: "nursing_overlap",
  },
  {
    code1: "8041",
    code2: "8043",
    type: "mutually_exclusive",
    reason:
      "IM injection (8041) and SC injection (8043) — bill the administration route actually used. Do not bill multiple injection codes for a single drug administration.",
    source: "CCSA v11; BHF nursing rules; SANC scope of practice",
    category: "nursing_overlap",
  },
  {
    code1: "8042",
    code2: "8043",
    type: "mutually_exclusive",
    reason:
      "IV injection (8042) and SC injection (8043) — bill the route administered. These are mutually exclusive for the same medication at the same time.",
    source: "CCSA v11; BHF nursing rules; SANC scope of practice",
    category: "nursing_overlap",
  },
  {
    code1: "8045",
    code2: "8042",
    type: "component_of",
    reason:
      "IV line insertion (8045) — do not bill separately if part of hospital admission procedures. IV access is bundled into admission where applicable. May bill for standalone IV insertion in outpatient setting.",
    source: "CCSA v11; BHF nursing rules; hospital admission package rules",
    category: "nursing_overlap",
  },
  {
    code1: "8050",
    code2: "8051",
    type: "mutually_exclusive",
    reason:
      "Urinary catheter insertion (8050) and catheter maintenance (8051) — different procedures, different codes. On insertion day, bill insertion only. Maintenance is for subsequent days.",
    source: "CCSA v11; BHF nursing rules; SANC scope of practice",
    category: "nursing_overlap",
  },
  {
    code1: "8055",
    code2: "0310",
    type: "never_together",
    reason:
      "Nursing nebulisation (8055) and doctor's respiratory treatment (0310) same session — do not bill nursing nebulisation when the doctor bills a respiratory treatment code that includes nebulisation.",
    source: "CCSA v11; BHF nursing rules; HPCSA tariff guidelines",
    category: "nursing_overlap",
  },
  {
    code1: "8060",
    code2: "0190",
    type: "component_of",
    reason:
      "Suture removal (8060) is bundled into the surgical follow-up period. Do not bill separately during the post-operative follow-up window (typically 7-14 days). Suture removal is part of surgical aftercare.",
    source: "CCSA v11; BHF surgical package rules; HPCSA tariff guidelines",
    category: "nursing_overlap",
  },
  {
    code1: "8070",
    code2: "0190",
    type: "component_of",
    reason:
      "Vital signs recording (8070) is included in any consultation (0190). Do not bill vital signs separately when a doctor consultation is billed — vitals are part of the clinical assessment.",
    source: "CCSA v11; BHF nursing rules; HPCSA tariff guidelines",
    category: "nursing_overlap",
  },
  {
    code1: "8075",
    code2: "8075",
    type: "never_together",
    reason:
      "Oxygen administration (8075) — billed per session, not per hour, in most schemes. One code per treatment session regardless of duration unless scheme-specific rules allow per-hour billing.",
    source: "CCSA v11; BHF nursing rules; scheme-specific tariff schedules",
    category: "nursing_overlap",
  },
  {
    code1: "8080",
    code2: "8081",
    type: "never_together",
    reason:
      "Nasogastric tube insertion (8080) and NG feeding administration (8081) — do not bill feeding separately on the same day as insertion. Feeding initiation is part of the insertion procedure on day one.",
    source: "CCSA v11; BHF nursing rules; SANC scope of practice",
    category: "nursing_overlap",
  },
];
