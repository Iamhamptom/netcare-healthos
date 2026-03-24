// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Radiology Bundling Rules — SA Healthcare Claims System
// ~150 rules covering X-ray, CT, MRI, US, mammography, nuclear medicine,
// fluoroscopy, interventional radiology, and repeat/bilateral rules.
// Reference: CCSA v11 radiology coding, BHF radiology guidelines,
//            HPCSA tariff guidelines, scheme pre-auth rules.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { CodePairViolation } from "./types";

export const RADIOLOGY_BUNDLING: CodePairViolation[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 1. X-RAY WITHOUT/WITH CONTRAST & COMPONENT PAIRS (~25 rules)
  // ═══════════════════════════════════════════════════════════════════════════

  // Chest
  {
    code1: "3601",
    code2: "3602",
    type: "never_together",
    reason:
      "Chest X-ray PA only (3601) and chest X-ray PA+lateral (3602) — the PA+lateral includes the PA view. Bill one or the other.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Abdomen
  {
    code1: "3605",
    code2: "3606",
    type: "never_together",
    reason:
      "Abdomen erect X-ray (3605) and abdomen erect+supine X-ray (3606) — the combined view includes the erect. Bill the combined code when both views are taken.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Spine — Cervical
  {
    code1: "3610",
    code2: "3611",
    type: "never_together",
    reason:
      "Cervical spine AP X-ray (3610) and cervical spine AP+lateral X-ray (3611) — AP+lateral includes the AP view. Bill the comprehensive code.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Spine — Thoracic
  {
    code1: "3612",
    code2: "3613",
    type: "never_together",
    reason:
      "Thoracic spine AP X-ray (3612) and thoracic spine AP+lateral X-ray (3613) — AP+lateral includes the AP view. Bill the comprehensive code.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Spine — Lumbar
  {
    code1: "3614",
    code2: "3615",
    type: "never_together",
    reason:
      "Lumbar spine AP X-ray (3614) and lumbar spine AP+lateral X-ray (3615) — AP+lateral includes the AP view. Bill the comprehensive code.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Spine — Sacrum/Coccyx
  {
    code1: "3616",
    code2: "3617",
    type: "never_together",
    reason:
      "Sacrum AP X-ray (3616) and sacrum AP+lateral X-ray (3617) — AP+lateral includes the AP view. Bill the comprehensive code.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Pelvis vs Hip
  {
    code1: "3620",
    code2: "3621",
    type: "never_together",
    reason:
      "Pelvis X-ray (3620) includes both hips. Do not bill hip X-ray (3621) separately when a full pelvis film has been taken — the hip is included in the pelvis view.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Shoulder vs Clavicle
  {
    code1: "3625",
    code2: "3626",
    type: "needs_modifier",
    reason:
      "Shoulder X-ray (3625) and clavicle X-ray (3626) overlap anatomically. If the shoulder view adequately demonstrates the clavicle, do not bill both. A modifier is required if both are clinically necessary as separate studies.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Hand vs Wrist
  {
    code1: "3630",
    code2: "3631",
    type: "needs_modifier",
    reason:
      "Hand X-ray (3630) and wrist X-ray (3631) are adjacent anatomy. Billing both requires clinical justification with modifier — a hand X-ray may include carpal bones visible on wrist views.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Wrist vs Forearm
  {
    code1: "3631",
    code2: "3632",
    type: "needs_modifier",
    reason:
      "Wrist X-ray (3631) and forearm X-ray (3632) are adjacent anatomy. The distal forearm is visible on wrist views. Billing both requires clinical justification with modifier.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Hand vs Forearm
  {
    code1: "3630",
    code2: "3632",
    type: "needs_modifier",
    reason:
      "Hand X-ray (3630) and forearm X-ray (3632) are adjacent but non-overlapping regions. May bill both if clinically indicated, but a modifier must document the separate indications.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Knee vs Tibia-Fibula
  {
    code1: "3640",
    code2: "3641",
    type: "needs_modifier",
    reason:
      "Knee X-ray (3640) and tibia-fibula X-ray (3641) are adjacent anatomy. The proximal tibia-fibula is visible on knee views. Billing both requires clinical justification with modifier.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Ankle vs Foot
  {
    code1: "3645",
    code2: "3646",
    type: "needs_modifier",
    reason:
      "Ankle X-ray (3645) and foot X-ray (3646) overlap at the hindfoot/tarsals. Billing both requires clinical justification with modifier — particularly for fractures spanning the ankle-foot junction.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Skull vs Facial Bones
  {
    code1: "3650",
    code2: "3651",
    type: "never_together",
    reason:
      "Skull X-ray (3650) and facial bones X-ray (3651) — the skull series includes views that overlap with facial bone projections. Bill the study that addresses the clinical question.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Skull vs Sinuses
  {
    code1: "3650",
    code2: "3652",
    type: "never_together",
    reason:
      "Skull X-ray (3650) and sinus X-ray (3652) — the skull series includes sinus views (occipito-mental). Do not bill both; use the specific code that matches the clinical indication.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Facial Bones vs Sinuses
  {
    code1: "3651",
    code2: "3652",
    type: "never_together",
    reason:
      "Facial bones X-ray (3651) and sinus X-ray (3652) share overlapping views (e.g., occipito-mental). Bill the code that addresses the primary clinical question, not both.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // OPG vs Individual Dental X-rays
  {
    code1: "3655",
    code2: "3656",
    type: "never_together",
    reason:
      "OPG/dental panoramic (3655) provides a comprehensive view of all teeth and jaws. Do not bill individual dental X-rays (3656) in addition to an OPG unless a specific periapical view is clinically required for a localised pathology not adequately demonstrated on the OPG.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Pelvis vs Lumbar Spine — adjacent anatomy
  {
    code1: "3620",
    code2: "3615",
    type: "needs_modifier",
    reason:
      "Pelvis X-ray (3620) and lumbar spine AP+lateral (3615) share the lumbosacral junction. Billing both requires separate clinical indications documented with modifier.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Cervical spine vs Skull
  {
    code1: "3611",
    code2: "3650",
    type: "needs_modifier",
    reason:
      "Cervical spine AP+lateral (3611) and skull X-ray (3650) — the upper cervical spine is visible on lateral skull views. Billing both requires separate clinical indications.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Chest vs Thoracic spine — overlap
  {
    code1: "3602",
    code2: "3613",
    type: "needs_modifier",
    reason:
      "Chest X-ray PA+lateral (3602) and thoracic spine AP+lateral (3613) — the lateral chest view includes thoracic spine visualisation. Billing both requires separate clinical indications documented with modifier.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Abdomen vs Pelvis X-ray — overlap
  {
    code1: "3606",
    code2: "3620",
    type: "needs_modifier",
    reason:
      "Abdomen erect+supine (3606) and pelvis X-ray (3620) — a supine abdominal film typically includes the pelvis. Billing both requires separate clinical justification.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Chest vs Abdomen — acceptable but check
  {
    code1: "3602",
    code2: "3606",
    type: "needs_modifier",
    reason:
      "Chest PA+lateral (3602) and abdomen erect+supine (3606) — an erect abdominal film may duplicate the erect chest view for free air. If both are clinically necessary, document separately with modifier.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. CT WITHOUT/WITH/COMBINED CONTRAST (~30 rules)
  // ═══════════════════════════════════════════════════════════════════════════

  // CT Brain
  {
    code1: "3901",
    code2: "3902",
    type: "mutually_exclusive",
    reason:
      "CT brain without contrast (3901) and CT brain with contrast (3902) — bill one only. If both phases are performed, use the combined code (3903).",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },
  {
    code1: "3901",
    code2: "3903",
    type: "component_of",
    reason:
      "CT brain without contrast (3901) is a component of CT brain without+with contrast combined (3903). When both phases are performed, bill only the combined code.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },
  {
    code1: "3902",
    code2: "3903",
    type: "component_of",
    reason:
      "CT brain with contrast (3902) is a component of CT brain without+with contrast combined (3903). When both phases are performed, bill only the combined code.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // CT Chest
  {
    code1: "3910",
    code2: "3911",
    type: "mutually_exclusive",
    reason:
      "CT chest without contrast (3910) and CT chest with contrast (3911) — bill one only. If both phases are performed, use the combined code (3912).",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },
  {
    code1: "3910",
    code2: "3912",
    type: "component_of",
    reason:
      "CT chest without contrast (3910) is a component of CT chest without+with contrast combined (3912). Bill only the combined code when both phases are done.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },
  {
    code1: "3911",
    code2: "3912",
    type: "component_of",
    reason:
      "CT chest with contrast (3911) is a component of CT chest without+with contrast combined (3912). Bill only the combined code when both phases are done.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },
  {
    code1: "3910",
    code2: "3913",
    type: "never_together",
    reason:
      "CT chest without contrast (3910) and CT PE protocol (3913) — the PE protocol is a specific contrast-enhanced CT chest study. Do not bill a standard CT chest in addition to a PE protocol.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },
  {
    code1: "3911",
    code2: "3913",
    type: "never_together",
    reason:
      "CT chest with contrast (3911) and CT PE protocol (3913) — the PE protocol is a specialised contrast CT of the chest. These are mutually exclusive; bill the code that matches the clinical indication.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // CT Abdomen
  {
    code1: "3920",
    code2: "3921",
    type: "mutually_exclusive",
    reason:
      "CT abdomen without contrast (3920) and CT abdomen with contrast (3921) — bill one only. If both phases are performed, use the combined code (3922).",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },
  {
    code1: "3920",
    code2: "3922",
    type: "component_of",
    reason:
      "CT abdomen without contrast (3920) is a component of CT abdomen without+with contrast combined (3922). Bill only the combined code when both phases are done.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },
  {
    code1: "3921",
    code2: "3922",
    type: "component_of",
    reason:
      "CT abdomen with contrast (3921) is a component of CT abdomen without+with contrast combined (3922). Bill only the combined code when both phases are done.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // CT Pelvis
  {
    code1: "3925",
    code2: "3926",
    type: "mutually_exclusive",
    reason:
      "CT pelvis without contrast (3925) and CT pelvis with contrast (3926) — bill one only. If both phases are performed, use the combined code (3927).",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },
  {
    code1: "3925",
    code2: "3927",
    type: "component_of",
    reason:
      "CT pelvis without contrast (3925) is a component of CT pelvis without+with contrast combined (3927). Bill only the combined code when both phases are done.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },
  {
    code1: "3926",
    code2: "3927",
    type: "component_of",
    reason:
      "CT pelvis with contrast (3926) is a component of CT pelvis without+with contrast combined (3927). Bill only the combined code when both phases are done.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // CT Abdomen+Pelvis combined
  {
    code1: "3920",
    code2: "3928",
    type: "component_of",
    reason:
      "CT abdomen without contrast (3920) is a component of CT abdomen+pelvis combined (3928). When the study covers both regions, use the combined code.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },
  {
    code1: "3925",
    code2: "3928",
    type: "component_of",
    reason:
      "CT pelvis without contrast (3925) is a component of CT abdomen+pelvis combined (3928). When the study covers both regions, use the combined code.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },
  {
    code1: "3921",
    code2: "3928",
    type: "component_of",
    reason:
      "CT abdomen with contrast (3921) is included in CT abdomen+pelvis combined (3928). Do not bill a separate CT abdomen when an abdomen+pelvis combined study was performed.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },
  {
    code1: "3926",
    code2: "3928",
    type: "component_of",
    reason:
      "CT pelvis with contrast (3926) is included in CT abdomen+pelvis combined (3928). Do not bill a separate CT pelvis when an abdomen+pelvis combined study was performed.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // CT Spine — Cervical
  {
    code1: "3930",
    code2: "3931",
    type: "mutually_exclusive",
    reason:
      "CT cervical spine without contrast (3930) and CT cervical spine with contrast (3931) — bill one only. Use the with-contrast code if IV contrast was administered.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // CT Spine — Lumbar
  {
    code1: "3935",
    code2: "3936",
    type: "mutually_exclusive",
    reason:
      "CT lumbar spine without contrast (3935) and CT lumbar spine with contrast (3936) — bill one only. Use the with-contrast code if IV contrast was administered.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // CT Sinuses vs CT Orbits
  {
    code1: "3940",
    code2: "3941",
    type: "needs_modifier",
    reason:
      "CT sinuses (3940) and CT orbits (3941) are adjacent anatomical regions with overlap at the ethmoid/orbital floor. If both are clinically necessary, bill with modifier documenting separate indications.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // CT Brain vs CT Orbits
  {
    code1: "3901",
    code2: "3941",
    type: "needs_modifier",
    reason:
      "CT brain (3901) and CT orbits (3941) are separate studies with different technical protocols. Both may be billed if clinically indicated, but a modifier is needed documenting the separate indication.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // CT Neck
  {
    code1: "3945",
    code2: "3946",
    type: "mutually_exclusive",
    reason:
      "CT neck without contrast (3945) and CT neck with contrast (3946) — bill one only based on whether IV contrast was administered.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // CT Coronary Angiography vs standard CT Chest
  {
    code1: "3950",
    code2: "3911",
    type: "never_together",
    reason:
      "CT coronary angiography (3950) and CT chest with contrast (3911) — coronary CTA is a specialised cardiac-gated study. Do not bill a standard CT chest in addition; the coronary CTA field of view includes chest structures.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; scheme pre-auth rules",
    category: "radiology_component",
  },
  {
    code1: "3950",
    code2: "3912",
    type: "never_together",
    reason:
      "CT coronary angiography (3950) and CT chest combined (3912) — do not bill both. The coronary CTA is a dedicated cardiac study; if additional chest assessment is needed, document the separate clinical indication.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; scheme pre-auth rules",
    category: "radiology_component",
  },

  // CT Brain vs CT Sinuses
  {
    code1: "3901",
    code2: "3940",
    type: "needs_modifier",
    reason:
      "CT brain (3901) and CT sinuses (3940) use different protocols (axial vs coronal, different slice thickness). Both may be billed if clinically indicated with modifier, but the sinus region is partially included in brain CT coverage.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // CT Neck vs CT Chest — adjacent
  {
    code1: "3946",
    code2: "3911",
    type: "needs_modifier",
    reason:
      "CT neck with contrast (3946) and CT chest with contrast (3911) — adjacent regions that may overlap at the thoracic inlet. If both clinically indicated, bill with modifier; some schemes require combined neck-chest code.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. MRI WITHOUT/WITH CONTRAST (~25 rules)
  // ═══════════════════════════════════════════════════════════════════════════

  // MRI Brain
  {
    code1: "3951",
    code2: "3952",
    type: "mutually_exclusive",
    reason:
      "MRI brain without contrast (3951) and MRI brain with contrast (3952) — bill one only. If both pre- and post-contrast sequences are performed, use the combined code (3953).",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },
  {
    code1: "3951",
    code2: "3953",
    type: "component_of",
    reason:
      "MRI brain without contrast (3951) is a component of MRI brain without+with contrast combined (3953). Bill only the combined code when both phases are done.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },
  {
    code1: "3952",
    code2: "3953",
    type: "component_of",
    reason:
      "MRI brain with contrast (3952) is a component of MRI brain without+with contrast combined (3953). Bill only the combined code when both phases are done.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // MRI Spine — Cervical
  {
    code1: "3955",
    code2: "3956",
    type: "mutually_exclusive",
    reason:
      "MRI cervical spine without contrast (3955) and MRI cervical spine with contrast (3956) — bill one only based on whether gadolinium was administered.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // MRI Spine — Thoracic
  {
    code1: "3957",
    code2: "3958",
    type: "mutually_exclusive",
    reason:
      "MRI thoracic spine without contrast (3957) and MRI thoracic spine with contrast (3958) — bill one only based on whether gadolinium was administered.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // MRI Spine — Lumbar
  {
    code1: "3960",
    code2: "3961",
    type: "mutually_exclusive",
    reason:
      "MRI lumbar spine without contrast (3960) and MRI lumbar spine with contrast (3961) — bill one only based on whether gadolinium was administered.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // MRI Whole Spine vs Individual Segments
  {
    code1: "3955",
    code2: "3957",
    type: "needs_modifier",
    reason:
      "MRI cervical spine (3955) and MRI thoracic spine (3957) — if all three spinal segments (cervical, thoracic, lumbar) are scanned in one session, use the whole-spine code rather than billing three separate segments.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; scheme pre-auth rules",
    category: "radiology_component",
  },
  {
    code1: "3955",
    code2: "3960",
    type: "needs_modifier",
    reason:
      "MRI cervical spine (3955) and MRI lumbar spine (3960) — two separate spinal regions may be billed individually with modifier if clinically indicated, but if all three segments are scanned use the whole-spine code.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; scheme pre-auth rules",
    category: "radiology_component",
  },
  {
    code1: "3957",
    code2: "3960",
    type: "needs_modifier",
    reason:
      "MRI thoracic spine (3957) and MRI lumbar spine (3960) — adjacent spinal segments. May bill both with modifier if separate clinical indications exist, but schemes may query billing for adjacent regions.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; scheme pre-auth rules",
    category: "radiology_component",
  },

  // MRI Knee
  {
    code1: "3965",
    code2: "3966",
    type: "mutually_exclusive",
    reason:
      "MRI knee without contrast (3965) and MRI knee with contrast (3966) — bill one only. Standard knee MRI for meniscal/ligament pathology does not require contrast; with-contrast is reserved for tumour or infection workup.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // MRI Shoulder
  {
    code1: "3968",
    code2: "3969",
    type: "mutually_exclusive",
    reason:
      "MRI shoulder without contrast (3968) and MRI shoulder with contrast/MR arthrogram (3969) — bill one only. MR arthrogram includes the non-contrast sequences.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // MRI Pelvis
  {
    code1: "3970",
    code2: "3971",
    type: "mutually_exclusive",
    reason:
      "MRI pelvis without contrast (3970) and MRI pelvis with contrast (3971) — bill one only based on whether gadolinium was administered.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // MRI Abdomen
  {
    code1: "3973",
    code2: "3974",
    type: "mutually_exclusive",
    reason:
      "MRI abdomen without contrast (3973) and MRI abdomen with contrast (3974) — bill one only based on whether gadolinium was administered.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // MRI Cardiac
  {
    code1: "3976",
    code2: "3977",
    type: "mutually_exclusive",
    reason:
      "Cardiac MRI without contrast (3976) and cardiac MRI with contrast (3977) — bill one only. If both pre- and post-gadolinium sequences (e.g., for late gadolinium enhancement) are performed, use the appropriate combined/with-contrast code.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; scheme pre-auth rules",
    category: "radiology_component",
  },

  // MRI Abdomen vs MRI Pelvis — adjacent regions
  {
    code1: "3973",
    code2: "3970",
    type: "needs_modifier",
    reason:
      "MRI abdomen (3973) and MRI pelvis (3970) — if a combined abdomen+pelvis MRI is performed as one study, do not bill separate abdomen and pelvis codes. Use the combined code or bill with modifier if truly separate studies with different indications.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // MRI Knee vs Musculoskeletal US same region
  {
    code1: "3965",
    code2: "3855",
    type: "needs_modifier",
    reason:
      "MRI knee (3965) and musculoskeletal ultrasound (3855) of the same knee on the same day — the MRI provides superior soft tissue assessment. Both require separate clinical justifications; the US should not be billed as a screening adjunct to MRI.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; scheme pre-auth rules",
    category: "radiology_component",
  },

  // MRI Shoulder vs Musculoskeletal US same region
  {
    code1: "3968",
    code2: "3855",
    type: "needs_modifier",
    reason:
      "MRI shoulder (3968) and musculoskeletal ultrasound (3855) of the same shoulder on the same day — MRI provides comprehensive assessment. US should not be billed alongside MRI without separate clinical justification.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; scheme pre-auth rules",
    category: "radiology_component",
  },

  // MRI Brain vs CT Brain same day
  {
    code1: "3951",
    code2: "3901",
    type: "needs_modifier",
    reason:
      "MRI brain (3951) and CT brain (3901) on the same day — different modalities but imaging the same region. Both require separate clinical indications (e.g., CT for acute bleed, MRI for tumour characterisation). Schemes may query same-day dual imaging.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; scheme pre-auth rules",
    category: "radiology_component",
  },

  // Cardiac MRI vs CT Coronary Angiography
  {
    code1: "3976",
    code2: "3950",
    type: "needs_modifier",
    reason:
      "Cardiac MRI (3976) and CT coronary angiography (3950) on the same day — both are advanced cardiac imaging. Rarely clinically justified on the same day; requires separate indications and pre-authorisation.",
    source: "CCSA v11 radiology coding; scheme pre-auth rules",
    category: "radiology_component",
  },

  // MRI Breast
  {
    code1: "3975",
    code2: "3971",
    type: "never_together",
    reason:
      "MRI breast (3975) and MRI pelvis with contrast (3971) — different studies. However, if MRI breast is coded under the general MRI pelvis code in error, this will be rejected. Use the specific breast MRI code.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. ULTRASOUND COMPLETE VS LIMITED (~20 rules)
  // ═══════════════════════════════════════════════════════════════════════════

  // Complete vs Limited Abdominal US
  {
    code1: "3801",
    code2: "3802",
    type: "never_together",
    reason:
      "Complete abdominal ultrasound (3801) and limited/focused abdominal ultrasound (3802) — the complete study includes all abdominal organs. Do not bill both; use the code that matches the study performed.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Complete Abdominal US vs Renal US
  {
    code1: "3801",
    code2: "3810",
    type: "component_of",
    reason:
      "Complete abdominal ultrasound (3801) includes renal assessment. Renal ultrasound (3810) is a component of the complete abdominal study. Do not bill renal US separately when a complete abdominal US was performed.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Complete Abdominal US vs Hepatobiliary US
  {
    code1: "3801",
    code2: "3811",
    type: "component_of",
    reason:
      "Complete abdominal ultrasound (3801) includes hepatobiliary assessment. Hepatobiliary ultrasound (3811) is a component of the complete abdominal study. Do not bill hepatobiliary US separately when a complete abdominal US was performed.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Limited Abdominal US vs Renal US
  {
    code1: "3802",
    code2: "3810",
    type: "needs_modifier",
    reason:
      "Limited abdominal ultrasound (3802) and renal ultrasound (3810) — the limited abdominal study may or may not include renal assessment. If both are done as separate focused studies, a modifier is required.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Obstetric US vs Dating US
  {
    code1: "3820",
    code2: "3821",
    type: "never_together",
    reason:
      "Comprehensive obstetric ultrasound (3820) and dating ultrasound (3821) — the dating scan is a component of the comprehensive OB study. Do not bill both; use the comprehensive code when a full assessment is performed.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Obstetric US vs Fetal Anatomy Scan
  {
    code1: "3820",
    code2: "3822",
    type: "never_together",
    reason:
      "Comprehensive obstetric ultrasound (3820) and fetal anatomy scan (3822) — the detailed anatomy scan supersedes the basic obstetric scan. Bill the higher-level study that was performed, not both.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Dating US vs Fetal Anatomy Scan
  {
    code1: "3821",
    code2: "3822",
    type: "never_together",
    reason:
      "Dating ultrasound (3821) and fetal anatomy scan (3822) — the anatomy scan includes dating measurements (CRL, BPD, FL). Do not bill a separate dating scan when an anatomy scan is performed.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Carotid Duplex vs Carotid US
  {
    code1: "3835",
    code2: "3836",
    type: "never_together",
    reason:
      "Carotid duplex (3835) and carotid ultrasound B-mode (3836) — the duplex scan includes B-mode imaging plus Doppler. Do not bill both; the duplex code is comprehensive.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // DVT Scan vs Venous Duplex
  {
    code1: "3840",
    code2: "3841",
    type: "never_together",
    reason:
      "DVT scan lower limb (3840) and venous duplex (3841) — these describe the same study (compression ultrasound with Doppler for deep vein thrombosis). Bill one code only.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Thyroid US vs Neck Soft Tissue US
  {
    code1: "3845",
    code2: "3846",
    type: "component_of",
    reason:
      "Thyroid ultrasound (3845) is a subset of neck soft tissue ultrasound (3846). If a comprehensive neck soft tissue scan is performed that includes the thyroid, do not bill the thyroid separately.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Breast US vs Breast US with Axilla
  {
    code1: "3850",
    code2: "3851",
    type: "never_together",
    reason:
      "Breast ultrasound (3850) and breast ultrasound with axilla (3851) — the axilla version includes the breast assessment. Bill the comprehensive code when both breast and axilla were evaluated.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Testicular US vs Scrotal US
  {
    code1: "3860",
    code2: "3861",
    type: "never_together",
    reason:
      "Testicular ultrasound (3860) and scrotal ultrasound (3861) — these are the same study described by different names. Bill one code only; the scrotal US includes testicular assessment.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Transvaginal US vs Transabdominal Pelvic US
  {
    code1: "3815",
    code2: "3812",
    type: "needs_modifier",
    reason:
      "Transvaginal ultrasound (3815) and transabdominal pelvic ultrasound (3812) — both approaches may be used in the same session (e.g., transabdominal for overview, transvaginal for detail). Billing both requires modifier and clinical justification; some schemes pay only the higher-value code.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; scheme pre-auth rules",
    category: "radiology_component",
  },

  // Complete Abdominal US vs Pelvic US — different regions
  {
    code1: "3801",
    code2: "3812",
    type: "needs_modifier",
    reason:
      "Complete abdominal ultrasound (3801) and pelvic ultrasound (3812) — the abdomen and pelvis are separate regions. Both may be billed if clinically indicated, but a modifier is required. Some schemes bundle the pelvis into the complete abdominal study.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Doppler US — add-on rules
  {
    code1: "3830",
    code2: "3801",
    type: "needs_modifier",
    reason:
      "Abdominal Doppler ultrasound (3830) and complete abdominal ultrasound (3801) — Doppler is an add-on to the B-mode study. Both may be billed if the Doppler provides additional clinical information (e.g., portal vein assessment), with modifier.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Musculoskeletal US same-day MRI rule
  {
    code1: "3855",
    code2: "3966",
    type: "needs_modifier",
    reason:
      "Musculoskeletal ultrasound (3855) and MRI of the same region with contrast (3966) same day — MRI is the definitive study. Do not bill MSK US as a screening adjunct; it requires a separate clinical indication.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; scheme pre-auth rules",
    category: "radiology_component",
  },

  // Renal US vs Renal Doppler
  {
    code1: "3810",
    code2: "3830",
    type: "needs_modifier",
    reason:
      "Renal ultrasound (3810) and Doppler ultrasound (3830) — renal Doppler is an add-on to assess renal vasculature. Both may be billed with modifier when Doppler is clinically indicated (e.g., renal artery stenosis workup).",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. MAMMOGRAPHY RULES (~8 rules)
  // ═══════════════════════════════════════════════════════════════════════════

  // Screening vs Diagnostic Mammography
  {
    code1: "3751",
    code2: "3752",
    type: "mutually_exclusive",
    reason:
      "Screening mammography (3751) and diagnostic mammography (3752) — bill one only per encounter. If a screening mammogram identifies an abnormality requiring diagnostic views, bill only the diagnostic code.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Tomosynthesis/3D vs Standard 2D Mammography
  {
    code1: "3753",
    code2: "3751",
    type: "never_together",
    reason:
      "Tomosynthesis/3D mammography (3753) and standard 2D screening mammography (3751) — 3D mammography includes the 2D component. Do not bill both; use the 3D code when tomosynthesis was performed.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },
  {
    code1: "3753",
    code2: "3752",
    type: "never_together",
    reason:
      "Tomosynthesis/3D mammography (3753) and diagnostic mammography (3752) — if the diagnostic study was performed with tomosynthesis, use the appropriate tomosynthesis code. Do not bill 2D diagnostic in addition to 3D.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Mammography + Breast MRI — different modalities, allowed
  {
    code1: "3752",
    code2: "3975",
    type: "needs_modifier",
    reason:
      "Diagnostic mammography (3752) and breast MRI (3975) — different modalities that may both be clinically indicated (e.g., dense breast tissue, high-risk screening). Both may be billed with modifier and documented clinical justification.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; scheme pre-auth rules",
    category: "radiology_component",
  },

  // Mammography + Breast US — allowed when indicated
  {
    code1: "3752",
    code2: "3850",
    type: "needs_modifier",
    reason:
      "Diagnostic mammography (3752) and breast ultrasound (3850) — US is commonly performed as an adjunct to mammography for lesion characterisation. Both may be billed with modifier when clinically indicated.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Mammography + Stereotactic Biopsy — imaging bundled
  {
    code1: "3751",
    code2: "3755",
    type: "component_of",
    reason:
      "Screening mammography (3751) and stereotactic biopsy (3755) — the imaging guidance is included in the stereotactic biopsy code. Do not bill a separate mammography when it was performed solely as the guidance component of the biopsy.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },
  {
    code1: "3752",
    code2: "3755",
    type: "component_of",
    reason:
      "Diagnostic mammography (3752) and stereotactic biopsy (3755) — the mammographic guidance is included in the stereotactic biopsy procedure code. Do not bill diagnostic mammography separately when performed as part of stereotactic biopsy guidance.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Bilateral mammography — single code
  {
    code1: "3751",
    code2: "3751",
    type: "never_together",
    reason:
      "Screening mammography (3751) is billed once for bilateral examination. Do not bill twice (once per side). The screening mammography code inherently covers both breasts.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. NUCLEAR MEDICINE (~12 rules)
  // ═══════════════════════════════════════════════════════════════════════════

  // Bone Scan — Whole Body vs Limited
  {
    code1: "3700",
    code2: "3701",
    type: "never_together",
    reason:
      "Whole body bone scan (3700) and limited area bone scan (3701) — the whole body scan includes all regions. Do not bill a limited area scan in addition to a whole body scan.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Thyroid Scan vs Thyroid Uptake
  {
    code1: "3710",
    code2: "3711",
    type: "component_of",
    reason:
      "Thyroid scan (3710) includes uptake measurement. Thyroid uptake (3711) is a component of the scan. Do not bill both; use the thyroid scan code which encompasses the uptake.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Lung Perfusion vs V/Q Scan
  {
    code1: "3720",
    code2: "3721",
    type: "component_of",
    reason:
      "Lung perfusion scan (3720) is a component of the ventilation-perfusion (V/Q) scan (3721). The V/Q scan includes both perfusion and ventilation phases. Bill the V/Q code when both phases are performed.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Renal Scan — MAG3 vs DTPA
  {
    code1: "3730",
    code2: "3731",
    type: "mutually_exclusive",
    reason:
      "Renal scan MAG3 (3730) and renal scan DTPA (3731) — these are the same functional renal study using different radiopharmaceuticals. Bill the code corresponding to the agent actually used; do not bill both.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // MUGA vs Gated Blood Pool
  {
    code1: "3735",
    code2: "3736",
    type: "never_together",
    reason:
      "MUGA/cardiac blood pool scan (3735) and gated blood pool scan (3736) — these describe the same cardiac function study (multigated acquisition). Bill one code only.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // PET-CT vs CT same region
  {
    code1: "3740",
    code2: "3901",
    type: "component_of",
    reason:
      "PET-CT (3740) includes a CT component for attenuation correction and anatomical localisation. Do not bill a separate CT brain (3901) when PET-CT has been performed covering the same region.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; scheme pre-auth rules",
    category: "radiology_component",
  },
  {
    code1: "3740",
    code2: "3911",
    type: "component_of",
    reason:
      "PET-CT (3740) includes a CT component. Do not bill a separate CT chest with contrast (3911) when PET-CT has been performed. The CT in PET-CT is typically low-dose and without diagnostic contrast; if a separate diagnostic CT is needed, it must be justified.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; scheme pre-auth rules",
    category: "radiology_component",
  },
  {
    code1: "3740",
    code2: "3928",
    type: "component_of",
    reason:
      "PET-CT (3740) includes a CT component covering the abdomen and pelvis. Do not bill a separate CT abdomen+pelvis (3928) when PET-CT has been performed covering the same regions.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; scheme pre-auth rules",
    category: "radiology_component",
  },

  // PET-CT vs Bone Scan — different studies, may bill both
  {
    code1: "3740",
    code2: "3700",
    type: "needs_modifier",
    reason:
      "PET-CT (3740) and whole body bone scan (3700) — different studies with different clinical indications (FDG metabolism vs bone turnover). Both may be billed if clinically indicated, but schemes may query dual whole-body imaging and require separate justification.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; scheme pre-auth rules",
    category: "radiology_component",
  },

  // Sentinel Node Study
  {
    code1: "3745",
    code2: "3700",
    type: "needs_modifier",
    reason:
      "Sentinel node study (3745) and bone scan (3700) — the sentinel node study includes injection and imaging of the lymphatic drainage. If a bone scan is also required on the same day, both may be billed with modifier, but the sentinel node code already includes its own imaging component.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Thyroid Scan vs Thyroid US same day
  {
    code1: "3710",
    code2: "3845",
    type: "needs_modifier",
    reason:
      "Thyroid scan (3710) and thyroid ultrasound (3845) — different modalities (nuclear medicine vs US) that provide complementary information. Both may be billed with modifier if clinically indicated (e.g., US for morphology, scan for function).",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // PET-CT vs PET alone
  {
    code1: "3740",
    code2: "3742",
    type: "never_together",
    reason:
      "PET-CT (3740) and PET only (3742) — the PET-CT inherently includes the PET component. Do not bill both; use PET-CT when both PET and CT were acquired.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. FLUOROSCOPY BUNDLING (~8 rules)
  // ═══════════════════════════════════════════════════════════════════════════

  // Barium Swallow vs OGD same day
  {
    code1: "3660",
    code2: "1200",
    type: "never_together",
    reason:
      "Barium swallow (3660) and OGD/gastroscopy (1200) on the same day — both assess the upper GI tract. Performing both is clinically redundant in most scenarios. Bill the study that best addresses the clinical question.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; HPCSA tariff guidelines",
    category: "radiology_component",
  },

  // Barium Enema vs Colonoscopy same day
  {
    code1: "3665",
    code2: "1210",
    type: "never_together",
    reason:
      "Barium enema (3665) and colonoscopy (1210) on the same day — both assess the colon. Barium enema is contraindicated after colonoscopic biopsy. These are mutually exclusive in the same session.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; HPCSA tariff guidelines",
    category: "radiology_component",
  },

  // HSG — includes fluoroscopy
  {
    code1: "3670",
    code2: "3675",
    type: "component_of",
    reason:
      "Hysterosalpingogram/HSG (3670) includes fluoroscopy as an integral part of the procedure. Do not bill fluoroscopy screening (3675) separately when it was used for HSG guidance.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Fluoroscopy in Barium Swallow
  {
    code1: "3660",
    code2: "3675",
    type: "component_of",
    reason:
      "Barium swallow (3660) inherently includes fluoroscopic screening as part of the study. Do not bill fluoroscopy (3675) separately; it is a component of the barium swallow procedure.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Fluoroscopy in Barium Enema
  {
    code1: "3665",
    code2: "3675",
    type: "component_of",
    reason:
      "Barium enema (3665) inherently includes fluoroscopic screening as part of the study. Do not bill fluoroscopy (3675) separately; it is a component of the barium enema procedure.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Fluoroscopy in Voiding Cystourethrogram
  {
    code1: "3672",
    code2: "3675",
    type: "component_of",
    reason:
      "Voiding cystourethrogram/MCUG (3672) includes fluoroscopy as an integral part of the procedure. Do not bill fluoroscopy (3675) separately.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Fluoroscopy in IVP
  {
    code1: "3668",
    code2: "3675",
    type: "component_of",
    reason:
      "Intravenous pyelogram/IVP (3668) includes fluoroscopic monitoring and serial films. Do not bill fluoroscopy (3675) separately; it is part of the IVP procedure.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Fluoroscopy in Fistulogram
  {
    code1: "3673",
    code2: "3675",
    type: "component_of",
    reason:
      "Fistulogram/sinogram (3673) includes fluoroscopy as an integral part of the contrast study. Do not bill fluoroscopy (3675) separately.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. INTERVENTIONAL RADIOLOGY BUNDLING (~10 rules)
  // ═══════════════════════════════════════════════════════════════════════════

  // Diagnostic Angiogram included in Angioplasty
  {
    code1: "3680",
    code2: "3681",
    type: "component_of",
    reason:
      "Diagnostic angiogram (3680) is included in therapeutic angioplasty (3681) when performed in the same session. The angioplasty code bundles the diagnostic component. Do not bill both.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; HPCSA tariff guidelines",
    category: "radiology_component",
  },

  // Image Guidance included in CT-guided Biopsy
  {
    code1: "3685",
    code2: "3686",
    type: "component_of",
    reason:
      "Image guidance (3685) is included in CT-guided biopsy (3686). The biopsy code bundles the CT guidance component. Do not bill image guidance separately.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // US Guidance included in US-guided Drainage
  {
    code1: "3687",
    code2: "3688",
    type: "component_of",
    reason:
      "Ultrasound guidance (3687) is included in US-guided drainage (3688). The drainage procedure code bundles the ultrasound guidance. Do not bill US guidance separately.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Fluoroscopy included in ERCP
  {
    code1: "3675",
    code2: "1215",
    type: "component_of",
    reason:
      "Fluoroscopy (3675) is included in ERCP (1215). The ERCP procedure inherently requires fluoroscopic guidance; do not bill fluoroscopy as a separate item.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; HPCSA tariff guidelines",
    category: "radiology_component",
  },

  // CT Guidance for Lumbar Puncture
  {
    code1: "3685",
    code2: "0230",
    type: "component_of",
    reason:
      "CT guidance (3685) for lumbar puncture (0230) — when CT is used purely for needle guidance during LP, do not bill a diagnostic CT in addition to the LP. The guidance is an adjunct, not a diagnostic study.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; HPCSA tariff guidelines",
    category: "radiology_component",
  },

  // US Guidance for Paracentesis
  {
    code1: "3687",
    code2: "0235",
    type: "component_of",
    reason:
      "Ultrasound guidance (3687) for paracentesis/ascitic tap (0235) — when US is used purely for guidance to identify a safe puncture site, the guidance is part of the procedure. Do not bill diagnostic US in addition.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; HPCSA tariff guidelines",
    category: "radiology_component",
  },

  // US Guidance for Thoracentesis
  {
    code1: "3687",
    code2: "0240",
    type: "component_of",
    reason:
      "Ultrasound guidance (3687) for thoracentesis/pleural tap (0240) — when US is used for pleural fluid localisation and needle guidance, it is part of the procedure. Do not bill diagnostic US in addition.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; HPCSA tariff guidelines",
    category: "radiology_component",
  },

  // Diagnostic Angiogram included in Embolisation
  {
    code1: "3680",
    code2: "3682",
    type: "component_of",
    reason:
      "Diagnostic angiogram (3680) is included in therapeutic embolisation (3682) when performed in the same session. The embolisation code bundles the diagnostic angiographic component.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; HPCSA tariff guidelines",
    category: "radiology_component",
  },

  // Diagnostic Angiogram included in Stent Placement
  {
    code1: "3680",
    code2: "3683",
    type: "component_of",
    reason:
      "Diagnostic angiogram (3680) is included in vascular stent placement (3683) when performed in the same session. The stent placement code bundles the diagnostic component.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; HPCSA tariff guidelines",
    category: "radiology_component",
  },

  // CT Guidance for Joint Injection
  {
    code1: "3685",
    code2: "0250",
    type: "component_of",
    reason:
      "CT guidance (3685) for joint injection (0250) — when CT is used purely for needle placement during a therapeutic joint injection, the guidance is bundled into the procedure. Do not bill a diagnostic CT separately.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; HPCSA tariff guidelines",
    category: "radiology_component",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. REPEAT / BILATERAL / MULTI-PHASE RULES (~12 rules)
  // ═══════════════════════════════════════════════════════════════════════════

  // Bilateral X-ray — single code
  {
    code1: "3640",
    code2: "3640",
    type: "never_together",
    reason:
      "Bilateral knee X-rays — bill once per region with bilateral modifier, not as two separate claims. The tariff code is per examination, not per side, unless a specific bilateral code exists.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },
  {
    code1: "3625",
    code2: "3625",
    type: "never_together",
    reason:
      "Bilateral shoulder X-rays — bill once with bilateral modifier, not as two separate claims. X-ray codes are per examination; use the bilateral modifier when both sides are imaged.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },
  {
    code1: "3621",
    code2: "3621",
    type: "never_together",
    reason:
      "Bilateral hip X-rays — bill once with bilateral modifier or use the pelvis code (3620) which includes both hips. Do not bill the hip code twice.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },
  {
    code1: "3630",
    code2: "3630",
    type: "never_together",
    reason:
      "Bilateral hand X-rays — bill once with bilateral modifier, not as two separate claims. The tariff code covers the examination regardless of laterality.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },
  {
    code1: "3645",
    code2: "3645",
    type: "never_together",
    reason:
      "Bilateral ankle X-rays — bill once with bilateral modifier, not as two separate claims. Use the appropriate modifier to indicate bilateral examination.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // CT Contrast Phases — one study
  {
    code1: "3921",
    code2: "3921",
    type: "never_together",
    reason:
      "CT abdomen multiphase (arterial, portal venous, delayed) — all contrast phases constitute a single CT study. Do not bill the with-contrast code multiple times for different phases. Arterial, portal, and delayed phases are part of one examination.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; HPCSA tariff guidelines",
    category: "radiology_component",
  },
  {
    code1: "3911",
    code2: "3911",
    type: "never_together",
    reason:
      "CT chest multiphase — multiple contrast phases (e.g., arterial and delayed) constitute a single CT study. Do not bill the with-contrast code multiple times for different phases.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; HPCSA tariff guidelines",
    category: "radiology_component",
  },

  // MRI Sequences — one study
  {
    code1: "3951",
    code2: "3951",
    type: "never_together",
    reason:
      "MRI brain — multiple sequences (T1, T2, FLAIR, DWI, SWI, etc.) in one session constitute a single MRI examination. Do not bill per sequence; the MRI code covers the entire study regardless of the number of sequences acquired.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; HPCSA tariff guidelines",
    category: "radiology_component",
  },
  {
    code1: "3965",
    code2: "3965",
    type: "never_together",
    reason:
      "MRI knee — multiple sequences (PD, T2, STIR, etc.) in one session constitute a single MRI examination. Do not bill per sequence; the code covers the entire study.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; HPCSA tariff guidelines",
    category: "radiology_component",
  },

  // Repeat Imaging Same Day
  {
    code1: "3601",
    code2: "3601",
    type: "needs_modifier",
    reason:
      "Repeat chest X-ray PA (3601) same day — billing the same X-ray code twice on the same day requires clinical justification (e.g., pre- and post-procedure, pre- and post-reduction). A modifier and reason must be documented.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; scheme pre-auth rules",
    category: "radiology_component",
  },
  {
    code1: "3606",
    code2: "3606",
    type: "needs_modifier",
    reason:
      "Repeat abdominal X-ray (3606) same day — billing the same code twice requires clinical justification (e.g., monitoring bowel obstruction, pre- and post-nasogastric tube). A modifier and documented reason are required.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; scheme pre-auth rules",
    category: "radiology_component",
  },

  // Bilateral MRI — different from X-ray
  {
    code1: "3965",
    code2: "3966",
    type: "mutually_exclusive",
    reason:
      "MRI knee without contrast (3965) and MRI knee with contrast (3966) for bilateral knees — each knee is a separate MRI study. However, for each individual knee, bill only without OR with contrast, not both. Use bilateral modifier for the second side.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; scheme pre-auth rules",
    category: "radiology_component",
  },

  // Bilateral wrist X-rays
  {
    code1: "3631",
    code2: "3631",
    type: "never_together",
    reason:
      "Bilateral wrist X-rays — bill once with bilateral modifier, not as two separate claims. The tariff code covers the examination; use modifier 0002 for bilateral.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Bilateral foot X-rays
  {
    code1: "3646",
    code2: "3646",
    type: "never_together",
    reason:
      "Bilateral foot X-rays — bill once with bilateral modifier, not as two separate claims. Use the appropriate modifier to indicate both feet were imaged.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // CT brain multiphase
  {
    code1: "3902",
    code2: "3902",
    type: "never_together",
    reason:
      "CT brain multiphase — multiple contrast phases (e.g., arterial and venous) constitute a single CT brain study. Do not bill the with-contrast code multiple times for different phases.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; HPCSA tariff guidelines",
    category: "radiology_component",
  },

  // Repeat CT brain same day
  {
    code1: "3901",
    code2: "3901",
    type: "needs_modifier",
    reason:
      "Repeat CT brain (3901) same day — billing the same CT code twice requires clinical justification (e.g., pre- and post-thrombolysis, acute neurological deterioration). A modifier and documented clinical reason are required.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; scheme pre-auth rules",
    category: "radiology_component",
  },

  // IVP vs CT urogram — same indication
  {
    code1: "3668",
    code2: "3922",
    type: "never_together",
    reason:
      "IVP (3668) and CT abdomen with contrast (3922) on the same day — CT urogram has largely replaced IVP. Performing both is clinically redundant; bill the study that provides the definitive assessment.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; HPCSA tariff guidelines",
    category: "radiology_component",
  },

  // Complete abdominal US vs aortic US
  {
    code1: "3801",
    code2: "3813",
    type: "component_of",
    reason:
      "Complete abdominal ultrasound (3801) includes aortic assessment. Aortic/AAA ultrasound (3813) is a component of the complete abdominal study. Do not bill aortic US separately when a complete abdominal US was performed.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Obstetric US vs obstetric Doppler
  {
    code1: "3820",
    code2: "3823",
    type: "needs_modifier",
    reason:
      "Comprehensive obstetric ultrasound (3820) and obstetric Doppler (3823) — Doppler assessment of umbilical artery/uterine artery is an add-on to the OB scan. Both may be billed with modifier when Doppler is clinically indicated (e.g., IUGR, pre-eclampsia).",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Bone scan vs X-ray same region
  {
    code1: "3700",
    code2: "3640",
    type: "needs_modifier",
    reason:
      "Whole body bone scan (3700) and knee X-ray (3640) same day — different modalities (nuclear medicine vs plain film) providing different information. Both may be billed with modifier if separate clinical indications exist (e.g., bone scan for metastatic survey, X-ray for acute injury).",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // US-guided biopsy — includes diagnostic US
  {
    code1: "3687",
    code2: "3845",
    type: "component_of",
    reason:
      "Ultrasound guidance (3687) for thyroid FNA includes the thyroid ultrasound (3845) assessment. When US is used to guide a biopsy, do not bill a separate diagnostic thyroid US; the guidance code encompasses the imaging.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // Fluoroscopy in nephrostomy
  {
    code1: "3675",
    code2: "3690",
    type: "component_of",
    reason:
      "Fluoroscopy (3675) is included in percutaneous nephrostomy (3690). The nephrostomy procedure inherently requires fluoroscopic or US guidance; do not bill fluoroscopy as a separate item.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; HPCSA tariff guidelines",
    category: "radiology_component",
  },

  // Sentinel node study — includes injection
  {
    code1: "3745",
    code2: "3746",
    type: "component_of",
    reason:
      "Sentinel node study (3745) includes the radiopharmaceutical injection and imaging. Do not bill the injection component (3746) separately; it is bundled into the sentinel node procedure code.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // CT abdomen+pelvis combined vs CT chest — can bill both
  {
    code1: "3928",
    code2: "3912",
    type: "needs_modifier",
    reason:
      "CT abdomen+pelvis combined (3928) and CT chest combined (3912) — separate anatomical regions. Both may be billed with modifier when clinically indicated (e.g., staging CT). Some schemes have a combined chest-abdomen-pelvis code that should be used instead.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; scheme pre-auth rules",
    category: "radiology_component",
  },

  // MRI pelvis vs MRI hip — overlap
  {
    code1: "3970",
    code2: "3972",
    type: "never_together",
    reason:
      "MRI pelvis (3970) and MRI hip (3972) — the pelvis MRI field of view includes both hips. Do not bill a separate MRI hip when an MRI pelvis has been performed, as the hip is included in the pelvic coverage.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines",
    category: "radiology_component",
  },

  // V/Q scan vs CT PE protocol — same clinical question
  {
    code1: "3721",
    code2: "3913",
    type: "never_together",
    reason:
      "V/Q scan (3721) and CT PE protocol (3913) on the same day — both investigate pulmonary embolism. Performing both is clinically redundant unless the first study was equivocal. Bill the definitive study; if both are performed, document the clinical necessity.",
    source: "CCSA v11 radiology coding; BHF radiology guidelines; scheme pre-auth rules",
    category: "radiology_component",
  },
];
