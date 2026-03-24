// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Emergency Rules — SA Healthcare Claims Code-Pair System
// Covers SA Triage Scale hierarchy, emergency assessment bundling,
// resuscitation, emergency procedure bundling, and observation ward rules
// per CCSA v11, SA Triage Scale, BHF guidelines, HPCSA tariff guidelines.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { CodePairViolation } from "./types";

export const EMERGENCY_RULES: CodePairViolation[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // SA TRIAGE SCALE HIERARCHY — All permutations (Green/Yellow/Orange/Red)
  // A patient receives ONE triage classification per emergency encounter.
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "0601",
    code2: "0602",
    type: "mutually_exclusive",
    reason:
      "Green triage (0601) and yellow triage (0602) are mutually exclusive — the SA Triage Scale assigns a single acuity level per presentation. Bill the final triage category only.",
    source: "SA Triage Scale (EMSSA); CCSA v11 emergency rules; HPCSA tariff guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0601",
    code2: "0603",
    type: "mutually_exclusive",
    reason:
      "Green triage (0601) and orange triage (0603) are mutually exclusive — the SA Triage Scale assigns a single acuity level per presentation. Bill the final triage category only.",
    source: "SA Triage Scale (EMSSA); CCSA v11 emergency rules; HPCSA tariff guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0601",
    code2: "0604",
    type: "mutually_exclusive",
    reason:
      "Green triage (0601) and red triage (0604) are mutually exclusive — the SA Triage Scale assigns a single acuity level per presentation. Bill the final triage category only.",
    source: "SA Triage Scale (EMSSA); CCSA v11 emergency rules; HPCSA tariff guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0602",
    code2: "0603",
    type: "mutually_exclusive",
    reason:
      "Yellow triage (0602) and orange triage (0603) are mutually exclusive — the SA Triage Scale assigns a single acuity level per presentation. Bill the final triage category only.",
    source: "SA Triage Scale (EMSSA); CCSA v11 emergency rules; HPCSA tariff guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0602",
    code2: "0604",
    type: "mutually_exclusive",
    reason:
      "Yellow triage (0602) and red triage (0604) are mutually exclusive — the SA Triage Scale assigns a single acuity level per presentation. Bill the final triage category only.",
    source: "SA Triage Scale (EMSSA); CCSA v11 emergency rules; HPCSA tariff guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0603",
    code2: "0604",
    type: "mutually_exclusive",
    reason:
      "Orange triage (0603) and red triage (0604) are mutually exclusive — the SA Triage Scale assigns a single acuity level per presentation. Bill the final triage category only.",
    source: "SA Triage Scale (EMSSA); CCSA v11 emergency rules; HPCSA tariff guidelines",
    category: "emergency_overlap",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // EMERGENCY ASSESSMENT BUNDLING — Triage includes consultation component
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "0601",
    code2: "0190",
    type: "component_of",
    reason:
      "Green triage assessment (0601) already includes GP-level clinical evaluation — a separate brief GP consultation (0190) is bundled into the triage tariff.",
    source: "CCSA v11 emergency bundling rules; BHF coding guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0602",
    code2: "0190",
    type: "component_of",
    reason:
      "Yellow triage assessment (0602) already includes GP-level clinical evaluation — a separate brief GP consultation (0190) is bundled into the triage tariff.",
    source: "CCSA v11 emergency bundling rules; BHF coding guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0603",
    code2: "0190",
    type: "component_of",
    reason:
      "Orange triage assessment (0603) already includes GP-level clinical evaluation — a separate brief GP consultation (0190) is bundled into the triage tariff.",
    source: "CCSA v11 emergency bundling rules; BHF coding guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0604",
    code2: "0190",
    type: "component_of",
    reason:
      "Red triage assessment (0604) already includes GP-level clinical evaluation — a separate brief GP consultation (0190) is bundled into the triage tariff.",
    source: "CCSA v11 emergency bundling rules; BHF coding guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0601",
    code2: "0191",
    type: "component_of",
    reason:
      "Green triage assessment (0601) includes clinical assessment — a separate intermediate GP consultation (0191) is bundled into the emergency encounter.",
    source: "CCSA v11 emergency bundling rules; BHF coding guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0602",
    code2: "0191",
    type: "component_of",
    reason:
      "Yellow triage assessment (0602) includes clinical assessment — a separate intermediate GP consultation (0191) is bundled into the emergency encounter.",
    source: "CCSA v11 emergency bundling rules; BHF coding guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0603",
    code2: "0191",
    type: "component_of",
    reason:
      "Orange triage assessment (0603) includes clinical assessment — a separate intermediate GP consultation (0191) is bundled into the emergency encounter.",
    source: "CCSA v11 emergency bundling rules; BHF coding guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0604",
    code2: "0191",
    type: "component_of",
    reason:
      "Red triage assessment (0604) includes clinical assessment — a separate intermediate GP consultation (0191) is bundled into the emergency encounter.",
    source: "CCSA v11 emergency bundling rules; BHF coding guidelines",
    category: "emergency_overlap",
  },

  // Triage + specialist consultation bundled
  {
    code1: "0601",
    code2: "0141",
    type: "component_of",
    reason:
      "Green triage assessment (0601) includes the initial specialist clinical evaluation in the emergency setting — do not bill a separate initial specialist consultation (0141).",
    source: "CCSA v11 emergency bundling rules; BHF coding guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0602",
    code2: "0141",
    type: "component_of",
    reason:
      "Yellow triage assessment (0602) includes the initial specialist clinical evaluation in the emergency setting — do not bill a separate initial specialist consultation (0141).",
    source: "CCSA v11 emergency bundling rules; BHF coding guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0603",
    code2: "0141",
    type: "component_of",
    reason:
      "Orange triage assessment (0603) includes the initial specialist clinical evaluation in the emergency setting — do not bill a separate initial specialist consultation (0141).",
    source: "CCSA v11 emergency bundling rules; BHF coding guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0604",
    code2: "0141",
    type: "component_of",
    reason:
      "Red triage assessment (0604) includes the initial specialist clinical evaluation in the emergency setting — do not bill a separate initial specialist consultation (0141).",
    source: "CCSA v11 emergency bundling rules; BHF coding guidelines",
    category: "emergency_overlap",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // EMERGENCY FACILITY FEE OVERLAPS
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "0610",
    code2: "0601",
    type: "never_together",
    reason:
      "Emergency facility fee (0610) and green triage (0601) — the facility fee is a separate institutional charge and must not duplicate the triage-level clinical assessment already covered by the triage code.",
    source: "CCSA v11 facility fee rules; BHF coding guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0610",
    code2: "0602",
    type: "never_together",
    reason:
      "Emergency facility fee (0610) and yellow triage (0602) — the facility fee must not duplicate the triage-level clinical assessment when billed by the same provider.",
    source: "CCSA v11 facility fee rules; BHF coding guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0610",
    code2: "0603",
    type: "never_together",
    reason:
      "Emergency facility fee (0610) and orange triage (0603) — the facility fee must not duplicate the triage-level clinical assessment when billed by the same provider.",
    source: "CCSA v11 facility fee rules; BHF coding guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0610",
    code2: "0604",
    type: "never_together",
    reason:
      "Emergency facility fee (0610) and red triage (0604) — the facility fee must not duplicate the triage-level clinical assessment when billed by the same provider.",
    source: "CCSA v11 facility fee rules; BHF coding guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0620",
    code2: "0610",
    type: "mutually_exclusive",
    reason:
      "Emergency after-hours facility fee (0620) and standard emergency facility fee (0610) are mutually exclusive — the encounter occurs during standard hours or after-hours, not both.",
    source: "CCSA v11 after-hours emergency rules; HPCSA tariff guidelines",
    category: "emergency_overlap",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RESUSCITATION BUNDLING (0630-0631)
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "0630",
    code2: "0631",
    type: "never_together",
    reason:
      "Basic resuscitation (0630) and advanced resuscitation (0631) on same encounter — bill the highest level of resuscitation performed. Advanced resuscitation supersedes basic.",
    source: "CCSA v11 resuscitation rules; HPCSA tariff guidelines; BHF coding guidelines",
    category: "emergency_overlap",
  },

  // Resuscitation supersedes triage
  {
    code1: "0630",
    code2: "0601",
    type: "component_of",
    reason:
      "Basic resuscitation (0630) supersedes green triage (0601) — if resuscitation is required, the clinical assessment component is inherently included. Bill resuscitation, not triage.",
    source: "CCSA v11 resuscitation rules; SA Triage Scale (EMSSA); BHF coding guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0630",
    code2: "0602",
    type: "component_of",
    reason:
      "Basic resuscitation (0630) supersedes yellow triage (0602) — resuscitation includes clinical assessment. Bill resuscitation, not triage.",
    source: "CCSA v11 resuscitation rules; SA Triage Scale (EMSSA); BHF coding guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0631",
    code2: "0603",
    type: "component_of",
    reason:
      "Advanced resuscitation (0631) supersedes orange triage (0603) — advanced resuscitation includes all clinical assessment. Bill resuscitation only.",
    source: "CCSA v11 resuscitation rules; SA Triage Scale (EMSSA); BHF coding guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0631",
    code2: "0604",
    type: "component_of",
    reason:
      "Advanced resuscitation (0631) supersedes red triage (0604) — advanced resuscitation includes all clinical assessment and stabilisation. Bill resuscitation only.",
    source: "CCSA v11 resuscitation rules; SA Triage Scale (EMSSA); BHF coding guidelines",
    category: "emergency_overlap",
  },

  // Resuscitation + consultation bundled
  {
    code1: "0630",
    code2: "0190",
    type: "component_of",
    reason:
      "Basic resuscitation (0630) includes clinical assessment — a separate GP consultation (0190) is bundled into the resuscitation encounter.",
    source: "CCSA v11 resuscitation rules; HPCSA tariff guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0631",
    code2: "0190",
    type: "component_of",
    reason:
      "Advanced resuscitation (0631) includes comprehensive clinical assessment — a separate GP consultation (0190) is bundled into the resuscitation encounter.",
    source: "CCSA v11 resuscitation rules; HPCSA tariff guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0631",
    code2: "0141",
    type: "component_of",
    reason:
      "Advanced resuscitation (0631) includes specialist-level clinical assessment — a separate specialist consultation (0141) is bundled into the resuscitation encounter.",
    source: "CCSA v11 resuscitation rules; HPCSA tariff guidelines",
    category: "emergency_overlap",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // EMERGENCY PROCEDURE BUNDLING
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "0700",
    code2: "0601",
    type: "component_of",
    reason:
      "Simple wound repair in ER (0700) already includes the emergency assessment component — do not bill a separate green triage (0601) for the same encounter.",
    source: "CCSA v11 emergency procedure bundling; BHF coding guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0700",
    code2: "0602",
    type: "component_of",
    reason:
      "Simple wound repair in ER (0700) already includes the emergency assessment component — do not bill a separate yellow triage (0602) for the same encounter.",
    source: "CCSA v11 emergency procedure bundling; BHF coding guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0640",
    code2: "0421",
    type: "mutually_exclusive",
    reason:
      "Emergency sedation (0640) and conscious sedation (0421) are mutually exclusive — only one sedation modality may be billed per encounter. Use the code that matches the clinical setting.",
    source: "CCSA v11 sedation rules; HPCSA tariff guidelines; BHF coding guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0635",
    code2: "0633",
    type: "component_of",
    reason:
      "Emergency intubation (0635) includes airway management — do not bill basic airway management (0633) separately as it is a component of the intubation procedure.",
    source: "CCSA v11 airway management rules; HPCSA tariff guidelines",
    category: "emergency_overlap",
  },

  // Emergency sedation + triage
  {
    code1: "0640",
    code2: "0603",
    type: "never_together",
    reason:
      "Emergency sedation (0640) and orange triage (0603) billed by same provider — the sedation tariff is a procedural code and the triage assessment is bundled when sedation is performed in the emergency unit.",
    source: "CCSA v11 emergency procedure bundling; BHF coding guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0640",
    code2: "0604",
    type: "never_together",
    reason:
      "Emergency sedation (0640) and red triage (0604) billed by same provider — the sedation tariff is a procedural code and the triage assessment is bundled when sedation is performed in the emergency unit.",
    source: "CCSA v11 emergency procedure bundling; BHF coding guidelines",
    category: "emergency_overlap",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // OBSERVATION WARD RULES
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "0650",
    code2: "0160",
    type: "mutually_exclusive",
    reason:
      "Observation ward admission (0650) and hospital ward admission (0160) are mutually exclusive — a patient is admitted to either the observation unit or a hospital ward, not both simultaneously.",
    source: "CCSA v11 admission rules; HPCSA tariff guidelines; BHF coding guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0650",
    code2: "0190",
    type: "component_of",
    reason:
      "Observation ward admission (0650) includes clinical assessment — a separate GP consultation (0190) on the same day by the same provider is bundled into the observation admission tariff.",
    source: "CCSA v11 observation ward rules; BHF coding guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0650",
    code2: "0191",
    type: "component_of",
    reason:
      "Observation ward admission (0650) includes clinical assessment — a separate intermediate GP consultation (0191) on the same day by the same provider is bundled into the observation admission tariff.",
    source: "CCSA v11 observation ward rules; BHF coding guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0650",
    code2: "0141",
    type: "component_of",
    reason:
      "Observation ward admission (0650) includes specialist assessment — a separate initial specialist consultation (0141) on the same day by the same provider is bundled into the observation admission tariff.",
    source: "CCSA v11 observation ward rules; BHF coding guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0650",
    code2: "0601",
    type: "never_together",
    reason:
      "Observation ward admission (0650) and green triage (0601) by same provider — observation admission follows triage and includes ongoing assessment; do not bill both.",
    source: "CCSA v11 observation ward rules; SA Triage Scale (EMSSA); BHF coding guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0650",
    code2: "0602",
    type: "never_together",
    reason:
      "Observation ward admission (0650) and yellow triage (0602) by same provider — observation admission follows triage and includes ongoing assessment; do not bill both.",
    source: "CCSA v11 observation ward rules; SA Triage Scale (EMSSA); BHF coding guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0650",
    code2: "0603",
    type: "never_together",
    reason:
      "Observation ward admission (0650) and orange triage (0603) by same provider — observation admission follows triage and includes ongoing assessment; do not bill both.",
    source: "CCSA v11 observation ward rules; SA Triage Scale (EMSSA); BHF coding guidelines",
    category: "emergency_overlap",
  },
  {
    code1: "0650",
    code2: "0604",
    type: "never_together",
    reason:
      "Observation ward admission (0650) and red triage (0604) by same provider — observation admission follows triage and includes ongoing assessment; do not bill both.",
    source: "CCSA v11 observation ward rules; SA Triage Scale (EMSSA); BHF coding guidelines",
    category: "emergency_overlap",
  },
];
