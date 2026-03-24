// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Anaesthesia Bundling Rules — SA Healthcare Claims System
// ~50 rules covering anaesthesia type exclusions, component bundling,
// procedure overlaps, and same-day duplicate anaesthesia billing.
// Reference: CCSA v11, BHF guidelines, SASA (SA Society of Anaesthesiologists),
//            HPCSA tariff guidelines, scheme pre-auth rules.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { CodePairViolation } from "./types";

export const ANAESTHESIA_BUNDLING: CodePairViolation[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 1. ANAESTHESIA TYPE EXCLUSIONS (~18 rules)
  // ═══════════════════════════════════════════════════════════════════════════

  // General anaesthesia vs conscious sedation
  {
    code1: "0420",
    code2: "0421",
    type: "mutually_exclusive",
    reason:
      "General anaesthesia (0420) and conscious sedation (0421) are mutually exclusive — patient is either under GA or sedation. Bill one or the other based on anaesthetic technique used.",
    source: "CCSA v11; SASA guidelines; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // General vs spinal
  {
    code1: "0420",
    code2: "0422",
    type: "mutually_exclusive",
    reason:
      "General anaesthesia (0420) and spinal anaesthesia (0422) — when both are administered, bill GA only unless spinal was for a separate procedure in a separate session.",
    source: "CCSA v11; SASA guidelines; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // General vs epidural
  {
    code1: "0420",
    code2: "0423",
    type: "mutually_exclusive",
    reason:
      "General anaesthesia (0420) and epidural anaesthesia (0423) — epidural with GA is typically for post-op analgesia; bill GA for surgery and epidural only if separate analgesic service with modifier.",
    source: "CCSA v11; SASA guidelines; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // General vs regional block
  {
    code1: "0420",
    code2: "0424",
    type: "needs_modifier",
    reason:
      "General anaesthesia (0420) and regional nerve block (0424) — if block is for post-op analgesia in addition to GA, modifier required to justify both. Without modifier, bill GA only.",
    source: "CCSA v11; SASA guidelines; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // Spinal vs epidural
  {
    code1: "0422",
    code2: "0423",
    type: "mutually_exclusive",
    reason:
      "Spinal anaesthesia (0422) and epidural anaesthesia (0423) billed separately — use combined spinal-epidural code (0427/CSE) when both techniques are used. Do not bill both separately.",
    source: "CCSA v11; SASA guidelines; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // Spinal vs regional block
  {
    code1: "0422",
    code2: "0424",
    type: "mutually_exclusive",
    reason:
      "Spinal anaesthesia (0422) and regional block (0424) for the same operative area — spinal provides regional coverage, making an additional block redundant for the same area.",
    source: "CCSA v11; SASA guidelines; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // Epidural vs regional block (same area)
  {
    code1: "0423",
    code2: "0424",
    type: "mutually_exclusive",
    reason:
      "Epidural anaesthesia (0423) and regional nerve block (0424) for the same operative area — epidural provides regional coverage. Bill one technique per anatomical area.",
    source: "CCSA v11; SASA guidelines; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // Local by surgeon bundled into surgical fee
  {
    code1: "0425",
    code2: "0420",
    type: "component_of",
    reason:
      "Local anaesthesia by surgeon (0425) is bundled into the surgical fee — never bill separately. If a separate anaesthetic technique (GA) is provided by an anaesthetist, bill only the anaesthetist's code.",
    source: "CCSA v11; BHF surgical package rules; HPCSA tariff guidelines",
    category: "anaesthesia_bundling",
  },

  // Local by surgeon + conscious sedation
  {
    code1: "0425",
    code2: "0421",
    type: "never_together",
    reason:
      "Local anaesthesia by surgeon (0425) and conscious sedation (0421) — local by surgeon is bundled into the surgical fee. If sedation is administered, bill sedation only (by anaesthetist).",
    source: "CCSA v11; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // Local by surgeon + spinal
  {
    code1: "0425",
    code2: "0422",
    type: "component_of",
    reason:
      "Local anaesthesia by surgeon (0425) is included in surgical fee. When spinal anaesthesia (0422) is used, bill spinal only — local infiltration at wound is part of surgery.",
    source: "CCSA v11; BHF surgical package rules",
    category: "anaesthesia_bundling",
  },

  // Local by surgeon + epidural
  {
    code1: "0425",
    code2: "0423",
    type: "component_of",
    reason:
      "Local anaesthesia by surgeon (0425) is included in surgical fee. When epidural (0423) is used, bill epidural only — surgeon's local is part of the surgical package.",
    source: "CCSA v11; BHF surgical package rules",
    category: "anaesthesia_bundling",
  },

  // Local by surgeon + regional block
  {
    code1: "0425",
    code2: "0424",
    type: "component_of",
    reason:
      "Local anaesthesia by surgeon (0425) is included in surgical fee. Regional block (0424) by anaesthetist supersedes local — bill regional block only.",
    source: "CCSA v11; BHF surgical package rules",
    category: "anaesthesia_bundling",
  },

  // MAC vs conscious sedation
  {
    code1: "0426",
    code2: "0421",
    type: "mutually_exclusive",
    reason:
      "Monitored anaesthesia care/MAC (0426) and conscious sedation (0421) — MAC includes sedation with monitoring. Bill MAC when anaesthetist is present, sedation when administered by non-anaesthetist.",
    source: "CCSA v11; SASA guidelines; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // MAC vs general
  {
    code1: "0426",
    code2: "0420",
    type: "mutually_exclusive",
    reason:
      "Monitored anaesthesia care/MAC (0426) and general anaesthesia (0420) — if procedure requires conversion from MAC to GA, bill GA only for the entire anaesthetic.",
    source: "CCSA v11; SASA guidelines; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // MAC vs spinal
  {
    code1: "0426",
    code2: "0422",
    type: "mutually_exclusive",
    reason:
      "Monitored anaesthesia care/MAC (0426) and spinal anaesthesia (0422) — bill the primary technique. MAC is for standby/monitoring during local or minor procedures.",
    source: "CCSA v11; SASA guidelines; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // Dental GA vs general GA
  {
    code1: "0460",
    code2: "0420",
    type: "mutually_exclusive",
    reason:
      "Dental general anaesthesia (0460) and general anaesthesia (0420) — use the dental-specific GA code for dental procedures. Do not bill both or substitute general GA for dental procedures.",
    source: "CCSA v11; BHF anaesthesia rules; SADA dental anaesthesia guidelines",
    category: "anaesthesia_bundling",
  },

  // Dental GA vs conscious sedation
  {
    code1: "0460",
    code2: "0421",
    type: "mutually_exclusive",
    reason:
      "Dental general anaesthesia (0460) and conscious sedation (0421) — patient is either under dental GA or sedation. Bill one based on the technique used.",
    source: "CCSA v11; SADA dental anaesthesia guidelines",
    category: "anaesthesia_bundling",
  },

  // CSE vs spinal
  {
    code1: "0427",
    code2: "0422",
    type: "never_together",
    reason:
      "Combined spinal-epidural/CSE (0427) includes the spinal component (0422). Bill CSE code only — do not unbundle into separate spinal and epidural charges.",
    source: "CCSA v11; SASA guidelines; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // CSE vs epidural
  {
    code1: "0427",
    code2: "0423",
    type: "never_together",
    reason:
      "Combined spinal-epidural/CSE (0427) includes the epidural component (0423). Bill CSE code only — do not unbundle into separate spinal and epidural charges.",
    source: "CCSA v11; SASA guidelines; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. ANAESTHESIA COMPONENT BUNDLING (~15 rules)
  // ═══════════════════════════════════════════════════════════════════════════

  // Pre-anaesthetic assessment same day
  {
    code1: "0430",
    code2: "0420",
    type: "component_of",
    reason:
      "Pre-anaesthetic assessment (0430) is included in the anaesthesia fee when performed on the same day as general anaesthesia (0420). Only bill separately if assessment is on a prior date.",
    source: "CCSA v11; BHF anaesthesia rules; HPCSA tariff guidelines",
    category: "anaesthesia_bundling",
  },

  // Pre-anaesthetic assessment + sedation same day
  {
    code1: "0430",
    code2: "0421",
    type: "component_of",
    reason:
      "Pre-anaesthetic assessment (0430) is included when conscious sedation (0421) is administered same day. Bill separately only if pre-assessment is on a different date.",
    source: "CCSA v11; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // Pre-anaesthetic assessment + spinal same day
  {
    code1: "0430",
    code2: "0422",
    type: "component_of",
    reason:
      "Pre-anaesthetic assessment (0430) is included in spinal anaesthesia (0422) fee when same day. Only bill separately for prior-day assessment.",
    source: "CCSA v11; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // Pre-anaesthetic assessment + epidural same day
  {
    code1: "0430",
    code2: "0423",
    type: "component_of",
    reason:
      "Pre-anaesthetic assessment (0430) is included in epidural anaesthesia (0423) fee when same day. Only bill separately for prior-day assessment.",
    source: "CCSA v11; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // Intubation included in GA
  {
    code1: "0435",
    code2: "0420",
    type: "component_of",
    reason:
      "Endotracheal intubation (0435) is an integral component of general anaesthesia (0420) — included in the GA fee. Never bill separately when part of routine GA.",
    source: "CCSA v11; SASA guidelines; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // Laryngeal mask included in GA
  {
    code1: "0436",
    code2: "0420",
    type: "component_of",
    reason:
      "Laryngeal mask airway insertion (0436) is an integral component of general anaesthesia (0420) — included in the GA fee. Do not bill airway management separately.",
    source: "CCSA v11; SASA guidelines; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // Intubation vs laryngeal mask
  {
    code1: "0435",
    code2: "0436",
    type: "mutually_exclusive",
    reason:
      "Endotracheal intubation (0435) and laryngeal mask (0436) — only one airway device is used per anaesthetic. Both are included in GA anyway. If billed outside GA, bill only the device used.",
    source: "CCSA v11; SASA guidelines",
    category: "anaesthesia_bundling",
  },

  // Arterial line may bill separately with modifier
  {
    code1: "0440",
    code2: "0420",
    type: "needs_modifier",
    reason:
      "Arterial line insertion (0440) during general anaesthesia (0420) — may be billed separately with appropriate modifier indicating clinical necessity for invasive monitoring. Without modifier, may be denied.",
    source: "CCSA v11; SASA guidelines; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // Central venous line may bill separately
  {
    code1: "0441",
    code2: "0420",
    type: "needs_modifier",
    reason:
      "Central venous line insertion (0441) during general anaesthesia (0420) — may be billed separately with modifier for clinical justification. Central line is not routine and requires documentation of indication.",
    source: "CCSA v11; SASA guidelines; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // Arterial line + central line (both invasive monitoring)
  {
    code1: "0440",
    code2: "0441",
    type: "needs_modifier",
    reason:
      "Arterial line (0440) and central venous line (0441) billed together — both require separate clinical justification. Document indication for each. Some schemes cap invasive monitoring charges.",
    source: "CCSA v11; SASA guidelines; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // Epidural catheter included in epidural
  {
    code1: "0445",
    code2: "0423",
    type: "component_of",
    reason:
      "Epidural catheter insertion (0445) is included in epidural anaesthesia (0423). The catheter placement is an integral part of the epidural technique — do not bill separately.",
    source: "CCSA v11; SASA guidelines; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // Nerve stimulator included in regional block
  {
    code1: "0446",
    code2: "0424",
    type: "component_of",
    reason:
      "Nerve stimulator/nerve locator use (0446) is included in regional nerve block (0424). Nerve location is an integral component of the block technique — do not bill separately.",
    source: "CCSA v11; SASA guidelines; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // Nerve stimulator + ultrasound guidance
  {
    code1: "0446",
    code2: "0447",
    type: "mutually_exclusive",
    reason:
      "Nerve stimulator (0446) and ultrasound-guided block (0447) — bill the technique used. If both used, bill ultrasound guidance (0447) as the primary technique. Do not bill both location methods.",
    source: "CCSA v11; SASA guidelines; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. ANAESTHESIA + PROCEDURE OVERLAPS (~10 rules)
  // ═══════════════════════════════════════════════════════════════════════════

  // Sedation for endoscopy overlap
  {
    code1: "0421",
    code2: "0465",
    type: "mutually_exclusive",
    reason:
      "Conscious sedation (0421) and endoscopy-specific sedation code (0465) — use the endoscopy sedation code when sedation is for an endoscopic procedure. Do not bill both sedation codes.",
    source: "CCSA v11; BHF anaesthesia rules; SAGES endoscopy guidelines",
    category: "anaesthesia_bundling",
  },

  // GA for endoscopy vs endoscopy sedation
  {
    code1: "0420",
    code2: "0465",
    type: "mutually_exclusive",
    reason:
      "General anaesthesia (0420) and endoscopy sedation (0465) — if GA is administered for endoscopy, bill GA. Endoscopy sedation code is for moderate sedation only.",
    source: "CCSA v11; BHF anaesthesia rules; SAGES endoscopy guidelines",
    category: "anaesthesia_bundling",
  },

  // Anaesthesia time units + base separately
  {
    code1: "0450",
    code2: "0451",
    type: "never_together",
    reason:
      "Anaesthesia time units (0450) and anaesthesia base units (0451) — some schemes bundle base and time into a single fee. Do not bill base units separately when scheme uses all-inclusive anaesthesia rate.",
    source: "CCSA v11; BHF anaesthesia rules; scheme-specific tariff schedules",
    category: "anaesthesia_bundling",
  },

  // Post-anaesthesia recovery included
  {
    code1: "0455",
    code2: "0420",
    type: "component_of",
    reason:
      "Post-anaesthesia recovery room care (0455) — many schemes include recovery room supervision in the anaesthesia fee (0420). Check scheme rules before billing separately.",
    source: "CCSA v11; BHF anaesthesia rules; scheme-specific tariff schedules",
    category: "anaesthesia_bundling",
  },

  // Post-anaesthesia recovery + sedation
  {
    code1: "0455",
    code2: "0421",
    type: "component_of",
    reason:
      "Post-anaesthesia recovery room care (0455) after conscious sedation (0421) — recovery monitoring is typically included in the sedation fee. Bill separately only where scheme allows.",
    source: "CCSA v11; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // Post-anaesthesia recovery + spinal
  {
    code1: "0455",
    code2: "0422",
    type: "component_of",
    reason:
      "Post-anaesthesia recovery care (0455) after spinal anaesthesia (0422) — recovery monitoring (including block regression checks) is often included in the spinal fee.",
    source: "CCSA v11; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. SAME-DAY DUPLICATE ANAESTHESIA (~7 rules)
  // ═══════════════════════════════════════════════════════════════════════════

  // Two general anaesthetics same day
  {
    code1: "0420",
    code2: "0420",
    type: "needs_modifier",
    reason:
      "Two general anaesthetics (0420) billed same day — only permitted when separate procedures are performed in separate sessions with documented recovery between. Requires modifier and clinical notes.",
    source: "CCSA v11; SASA guidelines; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // Two sedations same day
  {
    code1: "0421",
    code2: "0421",
    type: "needs_modifier",
    reason:
      "Two conscious sedation events (0421) same day — requires modifier documenting separate procedures in separate sessions (e.g., morning gastroscopy + afternoon colonoscopy).",
    source: "CCSA v11; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // Regional block + local same area
  {
    code1: "0424",
    code2: "0425",
    type: "never_together",
    reason:
      "Regional nerve block (0424) and local anaesthesia (0425) for the same operative area — regional block supersedes local infiltration. Local by surgeon is bundled into surgical fee regardless.",
    source: "CCSA v11; SASA guidelines; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // Two regional blocks same limb
  {
    code1: "0424",
    code2: "0424",
    type: "needs_modifier",
    reason:
      "Two regional nerve blocks (0424) on the same limb same day — typically only one block per operative area. Multiple blocks require modifier with documentation of separate nerve territories.",
    source: "CCSA v11; SASA guidelines; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // Epidural catheter insertion + CSE
  {
    code1: "0445",
    code2: "0427",
    type: "component_of",
    reason:
      "Epidural catheter insertion (0445) is included in combined spinal-epidural/CSE (0427). The CSE code encompasses both the spinal injection and epidural catheter placement.",
    source: "CCSA v11; SASA guidelines; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // Ultrasound guidance + regional block
  {
    code1: "0447",
    code2: "0424",
    type: "component_of",
    reason:
      "Ultrasound guidance for regional block (0447) — some schemes include imaging guidance in the block fee (0424). Check scheme rules; many now bundle ultrasound into the regional block tariff.",
    source: "CCSA v11; SASA guidelines; BHF anaesthesia rules; scheme tariff schedules",
    category: "anaesthesia_bundling",
  },

  // Pre-anaesthetic assessment + MAC
  {
    code1: "0430",
    code2: "0426",
    type: "component_of",
    reason:
      "Pre-anaesthetic assessment (0430) is included in MAC (0426) fee when performed same day. Bill assessment separately only if on a prior date.",
    source: "CCSA v11; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // Intubation outside GA context + laryngeal mask
  {
    code1: "0435",
    code2: "0421",
    type: "never_together",
    reason:
      "Endotracheal intubation (0435) with conscious sedation (0421) — intubation implies airway control inconsistent with conscious sedation level. If intubation was required, this should be billed as GA (0420), not sedation.",
    source: "CCSA v11; SASA guidelines; BHF anaesthesia rules",
    category: "anaesthesia_bundling",
  },

  // Dental GA + pre-anaesthetic assessment same day
  {
    code1: "0430",
    code2: "0460",
    type: "component_of",
    reason:
      "Pre-anaesthetic assessment (0430) is included in dental general anaesthesia (0460) fee when performed same day. Only bill separately for prior-day assessment.",
    source: "CCSA v11; BHF anaesthesia rules; SADA dental anaesthesia guidelines",
    category: "anaesthesia_bundling",
  },
];
