// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Surgical Package Bundling Rules — SA Healthcare Claims System
// ~120 rules covering wound repair, endoscopy, laparoscopic, general surgery,
// orthopaedics, ophthalmology, ENT, gynaecology, urology, and cardiothoracic.
// Reference: CCSA v11 surgical coding, HPCSA tariff guidelines,
//            BHF bundling rules, scheme clinical edits.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { CodePairViolation } from "./types";

export const SURGICAL_PACKAGES: CodePairViolation[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 1. WOUND REPAIR HIERARCHY (~10 rules)
  // Simple (0700) < Intermediate (0701) < Complex (0702)
  // Bill highest complexity on same wound; lower levels are component of.
  // ═══════════════════════════════════════════════════════════════════════════

  {
    code1: "0700",
    code2: "0701",
    type: "component_of",
    reason:
      "Simple wound repair (0700) is a component of intermediate wound repair (0701) on the same wound. Bill the intermediate code only — it encompasses the simple repair technique.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "0700",
    code2: "0702",
    type: "component_of",
    reason:
      "Simple wound repair (0700) is a component of complex wound repair (0702) on the same wound. Bill the complex code — it subsumes all lesser repair techniques.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "0701",
    code2: "0702",
    type: "component_of",
    reason:
      "Intermediate wound repair (0701) is a component of complex wound repair (0702) on the same wound. Bill the complex code only — the highest tier subsumes lower tiers per CCSA hierarchy.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "0705",
    code2: "0702",
    type: "component_of",
    reason:
      "Wound debridement (0705) is included in complex wound repair (0702). Complex repair inherently requires debridement of devitalised tissue before layered closure.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines",
    category: "surgical_package",
  },
  {
    code1: "0706",
    code2: "0700",
    type: "component_of",
    reason:
      "Wound exploration (0706) is included in simple wound repair (0700). Exploration is a component step of any formal wound repair — do not bill separately.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "0706",
    code2: "0701",
    type: "component_of",
    reason:
      "Wound exploration (0706) is included in intermediate wound repair (0701). Exploration is an integral part of the repair assessment and is not separately billable.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "0706",
    code2: "0702",
    type: "component_of",
    reason:
      "Wound exploration (0706) is included in complex wound repair (0702). Complex repair mandates thorough exploration; billing both constitutes unbundling.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "0705",
    code2: "0700",
    type: "component_of",
    reason:
      "Wound debridement (0705) is included in simple wound repair (0700) when performed as part of the repair. Debridement prior to closure is a component step.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "0705",
    code2: "0701",
    type: "component_of",
    reason:
      "Wound debridement (0705) is included in intermediate wound repair (0701). Intermediate repair involves tissue debridement before layered closure.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "0710",
    code2: "0700",
    type: "component_of",
    reason:
      "Excision of skin lesion (0710) includes simple wound closure — do not bill simple repair (0700) separately. Closure is an integral part of the excision procedure.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines",
    category: "surgical_package",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. ENDOSCOPY BUNDLING (~20 rules)
  // Diagnostic endoscopy is always a component of therapeutic endoscopy
  // at the same site in the same session.
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Gastroscopy ---
  {
    code1: "1200",
    code2: "1201",
    type: "component_of",
    reason:
      "Diagnostic gastroscopy (1200) is included in gastroscopy with biopsy (1201). The diagnostic examination is an inherent component of the therapeutic procedure — bill 1201 only.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "1200",
    code2: "1202",
    type: "component_of",
    reason:
      "Diagnostic gastroscopy (1200) is included in gastroscopy with polypectomy (1202). The endoscopic examination precedes polypectomy and is not separately billable.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "1200",
    code2: "1203",
    type: "component_of",
    reason:
      "Diagnostic gastroscopy (1200) is included in gastroscopy with dilatation (1203). The diagnostic component is integral to therapeutic dilatation.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "1200",
    code2: "1204",
    type: "component_of",
    reason:
      "Diagnostic gastroscopy (1200) is included in gastroscopy with haemostasis (1204). Identification of the bleeding source (diagnostic) is an inherent step before haemostatic intervention.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },

  // --- Colonoscopy ---
  {
    code1: "1210",
    code2: "1211",
    type: "component_of",
    reason:
      "Diagnostic colonoscopy (1210) is included in colonoscopy with polypectomy (1211). The diagnostic examination is an integral component of the therapeutic procedure.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "1210",
    code2: "1212",
    type: "component_of",
    reason:
      "Diagnostic colonoscopy (1210) is included in colonoscopy with biopsy (1212). The examination performed to identify biopsy sites is inherent to the procedure.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "1210",
    code2: "1213",
    type: "component_of",
    reason:
      "Diagnostic colonoscopy (1210) is included in colonoscopy with dilatation (1213). Visualisation of the stricture before dilatation is an inherent diagnostic step.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "1210",
    code2: "1214",
    type: "component_of",
    reason:
      "Diagnostic colonoscopy (1210) is included in colonoscopy with haemostasis (1214). Identification of the bleeding source is inherent to haemostatic therapy.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },

  // --- Sigmoidoscopy into Colonoscopy ---
  {
    code1: "1220",
    code2: "1210",
    type: "component_of",
    reason:
      "Sigmoidoscopy (1220) is included in colonoscopy (1210). A colonoscopy traverses the sigmoid colon en route to the caecum — the sigmoid examination is inherent.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "1220",
    code2: "1211",
    type: "component_of",
    reason:
      "Sigmoidoscopy (1220) is included in colonoscopy with polypectomy (1211). The colonoscope passes through the sigmoid; a separate sigmoidoscopy fee is not billable.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },

  // --- ERCP ---
  {
    code1: "1230",
    code2: "1231",
    type: "component_of",
    reason:
      "Diagnostic ERCP (1230) is included in therapeutic ERCP (1231). The diagnostic cholangiography/pancreatography is an inherent first step of any therapeutic ERCP (sphincterotomy, stone extraction, stenting).",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },

  // --- Bronchoscopy ---
  {
    code1: "1240",
    code2: "1241",
    type: "component_of",
    reason:
      "Diagnostic bronchoscopy (1240) is included in bronchoscopy with biopsy (1241). Airway inspection is inherent to identifying and performing the biopsy site.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "1240",
    code2: "1242",
    type: "component_of",
    reason:
      "Diagnostic bronchoscopy (1240) is included in bronchoscopy with bronchoalveolar lavage (1242). BAL requires bronchoscopic positioning — the diagnostic scope is not separately billable.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },

  // --- Cystoscopy ---
  {
    code1: "1300",
    code2: "1301",
    type: "component_of",
    reason:
      "Diagnostic cystoscopy (1300) is included in cystoscopy with biopsy (1301). Bladder inspection to identify the biopsy target is an inherent component.",
    source: "CCSA v11 surgical coding; BHF bundling rules; scheme clinical edits",
    category: "surgical_package",
  },
  {
    code1: "1300",
    code2: "1302",
    type: "component_of",
    reason:
      "Diagnostic cystoscopy (1300) is included in cystoscopy with stent placement (1302). The cystoscopic access and bladder inspection are integral to ureteric stent insertion.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },

  // --- Hysteroscopy ---
  {
    code1: "1500",
    code2: "1501",
    type: "component_of",
    reason:
      "Diagnostic hysteroscopy (1500) is included in hysteroscopy with polypectomy (1501). Uterine cavity visualisation is an inherent first step of hysteroscopic polypectomy.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },

  // --- Arthroscopy ---
  {
    code1: "0800",
    code2: "0801",
    type: "component_of",
    reason:
      "Diagnostic arthroscopy (0800) is included in arthroscopy with debridement (0801). Joint inspection is an inherent component of any therapeutic arthroscopic procedure.",
    source: "CCSA v11 surgical coding; BHF bundling rules; scheme clinical edits",
    category: "surgical_package",
  },
  {
    code1: "0800",
    code2: "0802",
    type: "component_of",
    reason:
      "Diagnostic arthroscopy (0800) is included in arthroscopy with repair (0802). The diagnostic assessment is integral to the therapeutic arthroscopic repair.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. LAPAROSCOPIC BUNDLING (~15 rules)
  // Diagnostic laparoscopy is included in any therapeutic laparoscopic
  // procedure. Open conversion rules: bill one approach only.
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Diagnostic lap included in therapeutic ---
  {
    code1: "1100",
    code2: "1101",
    type: "component_of",
    reason:
      "Diagnostic laparoscopy (1100) is included in laparoscopic cholecystectomy (1101). Abdominal inspection is an inherent first step of any laparoscopic procedure.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "1100",
    code2: "1102",
    type: "component_of",
    reason:
      "Diagnostic laparoscopy (1100) is included in laparoscopic appendicectomy (1102). The diagnostic survey is inherent to the therapeutic procedure.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "1100",
    code2: "1103",
    type: "component_of",
    reason:
      "Diagnostic laparoscopy (1100) is included in laparoscopic hernia repair (1103). Peritoneal inspection precedes and is integral to the hernia repair.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "1100",
    code2: "1104",
    type: "component_of",
    reason:
      "Diagnostic laparoscopy (1100) is included in laparoscopic adhesiolysis (1104). Diagnostic assessment of adhesion burden is an inherent step prior to lysis.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },

  // --- Open conversion: laparoscopic vs open (mutually exclusive) ---
  {
    code1: "1101",
    code2: "1105",
    type: "mutually_exclusive",
    reason:
      "Laparoscopic cholecystectomy (1101) and open cholecystectomy (1105) are mutually exclusive. If converted from laparoscopic to open, bill the open procedure only per CCSA conversion rules.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "1102",
    code2: "1106",
    type: "mutually_exclusive",
    reason:
      "Laparoscopic appendicectomy (1102) and open appendicectomy (1106) are mutually exclusive. On conversion, bill the open code only — do not bill both approaches.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "1103",
    code2: "1107",
    type: "mutually_exclusive",
    reason:
      "Laparoscopic hernia repair (1103) and open hernia repair (1107) are mutually exclusive. Bill the final approach used — laparoscopic or open, not both.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines; BHF bundling rules",
    category: "surgical_package",
  },

  // --- Diagnostic lap included in open conversions too ---
  {
    code1: "1100",
    code2: "1105",
    type: "component_of",
    reason:
      "Diagnostic laparoscopy (1100) is included in open cholecystectomy (1105) when conversion from laparoscopic approach occurred. The diagnostic laparoscopy informed the decision to convert.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "1100",
    code2: "1106",
    type: "component_of",
    reason:
      "Diagnostic laparoscopy (1100) is included in open appendicectomy (1106) when conversion from laparoscopic approach occurred. Do not bill the diagnostic scope separately.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "1100",
    code2: "1107",
    type: "component_of",
    reason:
      "Diagnostic laparoscopy (1100) is included in open hernia repair (1107) when conversion from laparoscopic approach occurred. The diagnostic component is inherent.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },

  // --- Laparoscopic procedures: duplicate therapeutic codes ---
  {
    code1: "1101",
    code2: "1101",
    type: "never_together",
    reason:
      "Laparoscopic cholecystectomy (1101) may not be billed twice in the same session. A patient has one gallbladder — duplicate billing is not clinically valid.",
    source: "CCSA v11 surgical coding; scheme clinical edits",
    category: "surgical_package",
  },
  {
    code1: "1102",
    code2: "1102",
    type: "never_together",
    reason:
      "Laparoscopic appendicectomy (1102) may not be billed twice in the same session. Duplicate billing for a single appendix is invalid.",
    source: "CCSA v11 surgical coding; scheme clinical edits",
    category: "surgical_package",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. GENERAL SURGERY PACKAGES (~15 rules)
  // Standard inclusions: wound closure, local anaesthesia, exploration,
  // routine adjuncts within definitive procedures.
  // ═══════════════════════════════════════════════════════════════════════════

  {
    code1: "1106",
    code2: "0700",
    type: "component_of",
    reason:
      "Appendicectomy (1106) includes wound closure — do not bill simple wound repair (0700) separately. Surgical wound closure is integral to any abdominal procedure.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines",
    category: "surgical_package",
  },
  {
    code1: "1105",
    code2: "0700",
    type: "component_of",
    reason:
      "Open cholecystectomy (1105) includes wound closure — do not bill simple wound repair (0700) separately. Fascial and skin closure are integral to laparotomy.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines",
    category: "surgical_package",
  },
  {
    code1: "1105",
    code2: "1108",
    type: "component_of",
    reason:
      "Open cholecystectomy (1105) includes intraoperative cholangiogram (1108) when performed routinely. Routine cholangiography is considered a component of the cholecystectomy per BHF rules.",
    source: "BHF bundling rules; scheme clinical edits",
    category: "surgical_package",
  },
  {
    code1: "1107",
    code2: "1109",
    type: "component_of",
    reason:
      "Hernia repair (1107) includes mesh placement (1109). The prosthetic mesh is an inherent component of tension-free repair — do not bill mesh insertion as a separate procedure.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "1103",
    code2: "1109",
    type: "component_of",
    reason:
      "Laparoscopic hernia repair (1103) includes mesh placement (1109). Mesh is integral to laparoscopic inguinal (TEP/TAPP) and incisional hernia repair.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "1111",
    code2: "1112",
    type: "mutually_exclusive",
    reason:
      "Thyroid lobectomy (1111) and total thyroidectomy (1112) are mutually exclusive. Bill the procedure actually performed — lobectomy or total. If completion thyroidectomy, bill 1112 only.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines",
    category: "surgical_package",
  },
  {
    code1: "1110",
    code2: "1111",
    type: "component_of",
    reason:
      "Thyroidectomy approach/exploration (1110) is included in thyroid lobectomy (1111). The approach and gland mobilisation are integral steps of the lobectomy procedure.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "1110",
    code2: "1112",
    type: "component_of",
    reason:
      "Thyroidectomy approach/exploration (1110) is included in total thyroidectomy (1112). Surgical exploration is inherent to the definitive procedure.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "1120",
    code2: "1121",
    type: "component_of",
    reason:
      "Mastectomy (1120) includes sentinel lymph node biopsy (1121) when performed together in the same session. SLNB is a staging component of the mastectomy package per BHF rules.",
    source: "BHF bundling rules; scheme clinical edits",
    category: "surgical_package",
  },
  {
    code1: "1400",
    code2: "0199",
    type: "component_of",
    reason:
      "Circumcision (1400) includes local anaesthesia/penile block (0199). The anaesthetic block is integral to the procedure and is not separately billable.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines",
    category: "surgical_package",
  },
  {
    code1: "0710",
    code2: "0701",
    type: "component_of",
    reason:
      "Excision of skin lesion (0710) includes intermediate wound closure (0701). Wound closure after excision is an integral component — do not bill closure separately.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines",
    category: "surgical_package",
  },
  {
    code1: "0715",
    code2: "0706",
    type: "component_of",
    reason:
      "Incision and drainage of abscess (0715) includes wound exploration (0706). Exploration of the abscess cavity to break down loculations is inherent to the I&D procedure.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "0715",
    code2: "0700",
    type: "component_of",
    reason:
      "Incision and drainage of abscess (0715) includes wound closure/packing (0700) when performed. The wound management following I&D is part of the procedure.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "1107",
    code2: "0700",
    type: "component_of",
    reason:
      "Open hernia repair (1107) includes wound closure — do not bill simple wound repair (0700) separately. Skin and fascial closure is integral to every open surgical procedure.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines",
    category: "surgical_package",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. ORTHOPAEDIC BUNDLING (~15 rules)
  // Fracture management, fixation hierarchy, joint replacement packages,
  // and arthroscopic procedure bundles.
  // ═══════════════════════════════════════════════════════════════════════════

  {
    code1: "0750",
    code2: "0751",
    type: "mutually_exclusive",
    reason:
      "Closed fracture reduction (0750) and open fracture reduction (0751) are mutually exclusive at the same site. Bill the approach actually performed — closed or open, not both.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines",
    category: "orthopaedic_bundling",
  },
  {
    code1: "0760",
    code2: "0750",
    type: "component_of",
    reason:
      "Internal fixation (0760) includes fracture reduction (0750). Reduction is an inherent step of open reduction and internal fixation (ORIF) — do not bill reduction separately.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "orthopaedic_bundling",
  },
  {
    code1: "0760",
    code2: "0751",
    type: "component_of",
    reason:
      "Internal fixation (0760) includes open reduction (0751). The open reduction is the approach component of ORIF — it is not a separate billable procedure.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "orthopaedic_bundling",
  },
  {
    code1: "0780",
    code2: "0781",
    type: "component_of",
    reason:
      "Joint replacement (0780) includes the surgical approach (0781). The approach (e.g., anterolateral, posterior) is integral to arthroplasty and is not separately billable.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines; BHF bundling rules",
    category: "orthopaedic_bundling",
  },
  {
    code1: "0780",
    code2: "0700",
    type: "component_of",
    reason:
      "Joint replacement (0780) includes wound closure (0700). Layered closure after arthroplasty is an integral component of the procedure.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines",
    category: "orthopaedic_bundling",
  },
  {
    code1: "0785",
    code2: "0786",
    type: "component_of",
    reason:
      "Carpal tunnel release (0785) includes exploration of the median nerve (0786). Nerve identification and decompression are integral to the release — do not bill exploration separately.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "orthopaedic_bundling",
  },
  {
    code1: "0803",
    code2: "0800",
    type: "component_of",
    reason:
      "ACL reconstruction (0803) includes diagnostic arthroscopy (0800). The diagnostic survey is an inherent first step of any arthroscopic reconstruction — do not bill separately.",
    source: "CCSA v11 surgical coding; BHF bundling rules; scheme clinical edits",
    category: "orthopaedic_bundling",
  },
  {
    code1: "0803",
    code2: "0801",
    type: "needs_modifier",
    reason:
      "ACL reconstruction (0803) with concurrent arthroscopic debridement (0801) — debridement at the reconstruction site is included; debridement of a separate compartment requires modifier 0007.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "orthopaedic_bundling",
  },
  {
    code1: "0804",
    code2: "0805",
    type: "mutually_exclusive",
    reason:
      "Partial meniscectomy (0804) and total meniscectomy (0805) at the same meniscus are mutually exclusive. Bill the procedure performed — partial or total, not both.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines",
    category: "orthopaedic_bundling",
  },
  {
    code1: "0810",
    code2: "0811",
    type: "component_of",
    reason:
      "Rotator cuff repair (0810) includes subacromial decompression (0811) when performed in the same session. Decompression creates the space necessary for the repair and is an integral step.",
    source: "CCSA v11 surgical coding; BHF bundling rules; scheme clinical edits",
    category: "orthopaedic_bundling",
  },
  {
    code1: "0810",
    code2: "0800",
    type: "component_of",
    reason:
      "Rotator cuff repair (0810) includes diagnostic arthroscopy (0800). The arthroscopic survey is inherent to any arthroscopic shoulder procedure.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "orthopaedic_bundling",
  },
  {
    code1: "0820",
    code2: "0821",
    type: "component_of",
    reason:
      "Laminectomy (0820) includes discectomy (0821) when performed at the same spinal level. The disc removal is accessed through the laminectomy — they constitute a single procedure at one level.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines; BHF bundling rules",
    category: "orthopaedic_bundling",
  },
  {
    code1: "0825",
    code2: "0827",
    type: "component_of",
    reason:
      "Spinal fusion (0825) includes the surgical approach (0827). Whether anterior, posterior, or lateral, the approach is integral to the fusion and is not separately billable.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines",
    category: "orthopaedic_bundling",
  },
  {
    code1: "0825",
    code2: "0820",
    type: "component_of",
    reason:
      "Spinal fusion (0825) includes laminectomy (0820) at the same level when performed for decompression as part of the fusion. Decompressive laminectomy is a component of posterior spinal fusion.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "orthopaedic_bundling",
  },
  {
    code1: "0770",
    code2: "0760",
    type: "never_together",
    reason:
      "Removal of hardware (0770) and internal fixation (0760) at the same site in the same session are not billable together unless staged (removal of old hardware followed by new fixation requires modifier and clinical justification).",
    source: "CCSA v11 surgical coding; scheme clinical edits",
    category: "orthopaedic_bundling",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. OPHTHALMOLOGY BUNDLING (~10 rules)
  // Cataract packages, vitreoretinal procedures, and glaucoma surgery
  // inclusions per CCSA ophthalmic coding rules.
  // ═══════════════════════════════════════════════════════════════════════════

  {
    code1: "2200",
    code2: "2201",
    type: "component_of",
    reason:
      "Cataract surgery/phacoemulsification (2200) includes intraocular lens (IOL) insertion (2201). The IOL implant is an inherent component of modern cataract surgery — do not bill separately.",
    source: "CCSA v11 surgical coding; BHF bundling rules; scheme clinical edits",
    category: "ophthalmology_bundling",
  },
  {
    code1: "2200",
    code2: "2210",
    type: "needs_modifier",
    reason:
      "Cataract surgery (2200) and vitrectomy (2210) on the same eye in the same session — may bill both with modifier 0007 (combined procedure). Each is a distinct procedure with separate indications.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines",
    category: "ophthalmology_bundling",
  },
  {
    code1: "2220",
    code2: "2221",
    type: "component_of",
    reason:
      "Trabeculectomy (2220) includes conjunctival closure (2221). The conjunctival flap closure is an integral step of trabeculectomy — billing closure separately constitutes unbundling.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "ophthalmology_bundling",
  },
  {
    code1: "2230",
    code2: "2231",
    type: "component_of",
    reason:
      "Pterygium excision (2230) includes conjunctival autograft (2231). The autograft is the standard closure technique after pterygium removal — do not bill the graft as a separate procedure.",
    source: "CCSA v11 surgical coding; BHF bundling rules; scheme clinical edits",
    category: "ophthalmology_bundling",
  },
  {
    code1: "2235",
    code2: "2236",
    type: "needs_modifier",
    reason:
      "Strabismus surgery on one muscle (2235) and multiple muscles (2236) — bill the appropriate code for the number of muscles operated. Do not bill per-muscle codes additively without modifier.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines",
    category: "ophthalmology_bundling",
  },
  {
    code1: "2240",
    code2: "2241",
    type: "mutually_exclusive",
    reason:
      "Retinal detachment repair by scleral buckle (2240) and retinal detachment repair by vitrectomy (2241) are mutually exclusive as primary approach. Bill the technique used. Combined buckle+vitrectomy requires modifier 0007.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "ophthalmology_bundling",
  },
  {
    code1: "2250",
    code2: "0190",
    type: "needs_modifier",
    reason:
      "Intravitreal injection (2250) and consultation (0190) on the same day — do not bill a full consultation when the visit is solely for a scheduled injection. Requires modifier if separate, identifiable E&M service is provided.",
    source: "BHF bundling rules; scheme clinical edits; HPCSA tariff guidelines",
    category: "ophthalmology_bundling",
  },
  {
    code1: "2200",
    code2: "0700",
    type: "component_of",
    reason:
      "Cataract surgery (2200) includes wound closure. The self-sealing corneal incision or sutured wound is integral to the procedure — do not bill wound repair (0700) separately.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "ophthalmology_bundling",
  },
  {
    code1: "2210",
    code2: "2201",
    type: "needs_modifier",
    reason:
      "Vitrectomy (2210) with concurrent IOL insertion (2201) — if the lens is removed during vitrectomy and IOL inserted, bill with modifier. IOL insertion alone is a component of cataract surgery, not vitrectomy.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines",
    category: "ophthalmology_bundling",
  },
  {
    code1: "2220",
    code2: "2200",
    type: "needs_modifier",
    reason:
      "Trabeculectomy (2220) and cataract surgery (2200) on the same eye — combined phacotrabeculectomy requires modifier 0007. Both are distinct procedures but share the same operative field.",
    source: "CCSA v11 surgical coding; BHF bundling rules; scheme clinical edits",
    category: "ophthalmology_bundling",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. ENT BUNDLING (~10 rules)
  // Tonsils, adenoids, septum, sinuses, ear procedures — combined codes
  // vs separate billing and inclusion rules.
  // ═══════════════════════════════════════════════════════════════════════════

  {
    code1: "2300",
    code2: "2301",
    type: "never_together",
    reason:
      "Tonsillectomy (2300) and adenoidectomy (2301) billed separately should use combined code (2302) when performed together. Billing both individual codes constitutes unbundling — use the combined T&A code.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "ent_bundling",
  },
  {
    code1: "2300",
    code2: "2302",
    type: "component_of",
    reason:
      "Tonsillectomy (2300) is a component of combined tonsillectomy and adenoidectomy (2302). When both tonsils and adenoids are removed, bill 2302 only.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "ent_bundling",
  },
  {
    code1: "2301",
    code2: "2302",
    type: "component_of",
    reason:
      "Adenoidectomy (2301) is a component of combined tonsillectomy and adenoidectomy (2302). Bill the combined code when both are performed in the same session.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "ent_bundling",
  },
  {
    code1: "2310",
    code2: "2311",
    type: "never_together",
    reason:
      "Septoplasty (2310) and turbinectomy (2311) billed separately should use combined code (2312) when performed together. Use the combined septoplasty+turbinectomy code to avoid unbundling.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "ent_bundling",
  },
  {
    code1: "2310",
    code2: "2312",
    type: "component_of",
    reason:
      "Septoplasty (2310) is a component of combined septoplasty and turbinectomy (2312). Bill the combined code when both are performed.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "ent_bundling",
  },
  {
    code1: "2311",
    code2: "2312",
    type: "component_of",
    reason:
      "Turbinectomy (2311) is a component of combined septoplasty and turbinectomy (2312). Bill the combined code when both procedures are performed in the same session.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "ent_bundling",
  },
  {
    code1: "2330",
    code2: "2332",
    type: "component_of",
    reason:
      "Myringotomy (2330) includes aspiration of middle ear fluid (2332). Aspiration is an integral part of myringotomy — do not bill separately.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "ent_bundling",
  },
  {
    code1: "2330",
    code2: "2331",
    type: "component_of",
    reason:
      "Myringotomy (2330) is included in grommet insertion (2331). Myringotomy is the access step required for ventilation tube placement — bill 2331 only.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "ent_bundling",
  },
  {
    code1: "2340",
    code2: "2341",
    type: "component_of",
    reason:
      "Mastoidectomy (2340) includes tympanoplasty (2341) when performed together as a combined tympanomastoidectomy. Bill the mastoidectomy code — tympanic membrane reconstruction is an integral component.",
    source: "CCSA v11 surgical coding; BHF bundling rules; scheme clinical edits",
    category: "ent_bundling",
  },
  {
    code1: "2320",
    code2: "2320",
    type: "needs_modifier",
    reason:
      "Functional endoscopic sinus surgery (FESS) (2320) — multiple sinus categories (maxillary, ethmoid, frontal, sphenoid) may be billed separately with appropriate modifiers per sinus, but the same sinus code may not be duplicated without laterality modifier.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines; BHF bundling rules",
    category: "ent_bundling",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. GYNAECOLOGY BUNDLING (~10 rules)
  // Hysterectomy approaches, combined procedures, and obstetric packages.
  // ═══════════════════════════════════════════════════════════════════════════

  {
    code1: "1601",
    code2: "1602",
    type: "mutually_exclusive",
    reason:
      "Abdominal hysterectomy (1601) and vaginal hysterectomy (1602) are mutually exclusive. Bill the approach performed. If converted from vaginal to abdominal, bill the abdominal code only.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines",
    category: "surgical_package",
  },
  {
    code1: "1601",
    code2: "1603",
    type: "mutually_exclusive",
    reason:
      "Abdominal hysterectomy (1601) and laparoscopic hysterectomy (1603) are mutually exclusive. Bill one approach only — if converted, bill the final approach used.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines",
    category: "surgical_package",
  },
  {
    code1: "1602",
    code2: "1603",
    type: "mutually_exclusive",
    reason:
      "Vaginal hysterectomy (1602) and laparoscopic hysterectomy (1603) are mutually exclusive. Laparoscopic-assisted vaginal hysterectomy (LAVH) uses the laparoscopic code — do not bill both.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "1600",
    code2: "1604",
    type: "component_of",
    reason:
      "Hysterectomy (1600) includes bilateral salpingo-oophorectomy (BSO) (1604) when performed together — use the combined hysterectomy+BSO code. Do not bill the hysterectomy and BSO separately.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "1510",
    code2: "1501",
    type: "component_of",
    reason:
      "Dilatation and curettage (D&C) (1510) is included in hysteroscopy with polypectomy (1501). D&C is a component of hysteroscopic polypectomy — the curettage is performed under direct visualisation.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "1700",
    code2: "0700",
    type: "component_of",
    reason:
      "Caesarean section (1700) includes wound closure (0700). Uterine and abdominal wall closure are integral components of the caesarean delivery — do not bill wound repair separately.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines",
    category: "surgical_package",
  },
  {
    code1: "1700",
    code2: "1701",
    type: "needs_modifier",
    reason:
      "Caesarean section (1700) and tubal ligation (1701) in the same session — bill both with modifier 0007 (combined procedure). The tubal ligation is a distinct elective procedure performed via the same incision.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "1520",
    code2: "1521",
    type: "component_of",
    reason:
      "Colposcopy (1520) is included in LLETZ/LEEP (1521). The colposcopic examination to identify the transformation zone is an inherent prerequisite of the excision — LLETZ supersedes colposcopy.",
    source: "CCSA v11 surgical coding; BHF bundling rules; scheme clinical edits",
    category: "surgical_package",
  },
  {
    code1: "1500",
    code2: "1510",
    type: "component_of",
    reason:
      "Diagnostic hysteroscopy (1500) is included in D&C (1510) when both are performed in the same session. The hysteroscopic visualisation is a component of the curettage procedure under direct vision.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "1603",
    code2: "1100",
    type: "component_of",
    reason:
      "Laparoscopic hysterectomy (1603) includes diagnostic laparoscopy (1100). The peritoneal survey is inherent to any laparoscopic gynaecological procedure.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. UROLOGY BUNDLING (~10 rules)
  // TURP, nephrectomy, lithotripsy, cystoscopy inclusions, and
  // procedure-specific packages.
  // ═══════════════════════════════════════════════════════════════════════════

  {
    code1: "1410",
    code2: "1300",
    type: "component_of",
    reason:
      "TURP (1410) includes diagnostic cystoscopy (1300). Cystoscopic access is the inherent approach for transurethral resection — do not bill the diagnostic cystoscopy separately.",
    source: "CCSA v11 surgical coding; BHF bundling rules; scheme clinical edits",
    category: "urology_bundling",
  },
  {
    code1: "1410",
    code2: "1301",
    type: "component_of",
    reason:
      "TURP (1410) includes cystoscopy with biopsy (1301) when biopsy is taken during the same session. The cystoscopic component is inherent to TURP.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "urology_bundling",
  },
  {
    code1: "1420",
    code2: "1421",
    type: "mutually_exclusive",
    reason:
      "Partial nephrectomy (1420) and radical nephrectomy (1421) are mutually exclusive. Bill the procedure performed — partial or radical. Do not bill both for the same kidney.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines",
    category: "urology_bundling",
  },
  {
    code1: "1430",
    code2: "1431",
    type: "mutually_exclusive",
    reason:
      "Extracorporeal shock wave lithotripsy (ESWL) (1430) and ureteroscopic lithotripsy (1431) are mutually exclusive as primary approach for the same stone. Bill the technique used.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "urology_bundling",
  },
  {
    code1: "1431",
    code2: "1300",
    type: "component_of",
    reason:
      "Ureteroscopic lithotripsy (1431) includes diagnostic cystoscopy (1300). Cystoscopic access to the ureteric orifice is an inherent step of ureteroscopy — do not bill separately.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "urology_bundling",
  },
  {
    code1: "1400",
    code2: "0700",
    type: "component_of",
    reason:
      "Circumcision (1400) includes wound closure (0700). Suturing or adhesive closure of the circumcision wound is an integral step of the procedure.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines",
    category: "urology_bundling",
  },
  {
    code1: "1440",
    code2: "1441",
    type: "component_of",
    reason:
      "Orchidopexy (1440) includes inguinal exploration (1441). The inguinal canal exploration to mobilise the testis is an inherent component of orchidopexy — do not bill exploration separately.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "urology_bundling",
  },
  {
    code1: "1450",
    code2: "1450",
    type: "never_together",
    reason:
      "Vasectomy (1450) — bilateral vasectomy is billed as a single code, not per side. The procedure code encompasses both vasa deferentia. Do not bill 1450 x2.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines; BHF bundling rules",
    category: "urology_bundling",
  },
  {
    code1: "1410",
    code2: "1302",
    type: "component_of",
    reason:
      "TURP (1410) includes cystoscopy with stent placement (1302) when ureteric stent is placed during the same transurethral session. The cystoscopic access is inherent.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "urology_bundling",
  },
  {
    code1: "1420",
    code2: "0700",
    type: "component_of",
    reason:
      "Nephrectomy (1420) includes wound closure (0700). Surgical wound closure is an integral component of any open or laparoscopic nephrectomy.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines",
    category: "urology_bundling",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 10. CARDIOTHORACIC BUNDLING (~5 rules)
  // Catheterisation packages, PCI/stent bundling, CABG graft rules,
  // pacemaker insertion, and chest tube packages.
  // ═══════════════════════════════════════════════════════════════════════════

  {
    code1: "0900",
    code2: "0901",
    type: "component_of",
    reason:
      "Diagnostic cardiac catheterisation (0900) is included in percutaneous coronary intervention/angioplasty (0901). Coronary angiography is an inherent prerequisite step of PCI — do not bill diagnostic catheterisation separately.",
    source: "CCSA v11 surgical coding; BHF bundling rules; scheme clinical edits",
    category: "cardiology_bundling",
  },
  {
    code1: "0901",
    code2: "0902",
    type: "component_of",
    reason:
      "PCI/angioplasty (0901) includes coronary stent insertion (0902). The stent deployment is an integral component of the PCI procedure fee — do not bill stent insertion as a separate procedure.",
    source: "CCSA v11 surgical coding; BHF bundling rules; HPCSA tariff guidelines",
    category: "cardiology_bundling",
  },
  {
    code1: "0910",
    code2: "0910",
    type: "never_together",
    reason:
      "Coronary artery bypass graft (CABG) (0910) — the number of grafts (single, double, triple, quadruple) does not multiply the base procedure fee. Bill 0910 once with the appropriate graft count modifier, not multiple units of 0910.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines; BHF bundling rules",
    category: "cardiology_bundling",
  },
  {
    code1: "0920",
    code2: "0921",
    type: "component_of",
    reason:
      "Pacemaker insertion (0920) includes pocket creation (0921). Formation of the subcutaneous or submuscular pocket is an inherent step of device implantation — do not bill pocket creation separately.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "cardiology_bundling",
  },
  {
    code1: "0930",
    code2: "0931",
    type: "component_of",
    reason:
      "Chest tube/intercostal drain insertion (0930) includes underwater seal drainage setup (0931). Connection to drainage system is an integral component of tube thoracostomy — do not bill separately.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines; BHF bundling rules",
    category: "cardiology_bundling",
  },
  {
    code1: "0900",
    code2: "0900",
    type: "never_together",
    reason:
      "Diagnostic cardiac catheterisation (0900) may not be billed twice in the same session. Left and right heart catheterisation are separate codes — do not duplicate the diagnostic code.",
    source: "CCSA v11 surgical coding; scheme clinical edits",
    category: "cardiology_bundling",
  },
  {
    code1: "0920",
    code2: "0700",
    type: "component_of",
    reason:
      "Pacemaker insertion (0920) includes wound closure (0700). Pocket closure is integral to the implantation procedure — do not bill wound repair separately.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines",
    category: "cardiology_bundling",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL CROSS-CATEGORY RULES
  // ═══════════════════════════════════════════════════════════════════════════

  {
    code1: "0804",
    code2: "0800",
    type: "component_of",
    reason:
      "Partial meniscectomy (0804) includes diagnostic arthroscopy (0800). The arthroscopic survey is an inherent component of any arthroscopic meniscal procedure.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "orthopaedic_bundling",
  },
  {
    code1: "1431",
    code2: "1302",
    type: "component_of",
    reason:
      "Ureteroscopic lithotripsy (1431) includes cystoscopy with stent placement (1302) when a ureteric stent is placed post-lithotripsy in the same session. The cystoscopic access is inherent to ureteroscopy.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "urology_bundling",
  },
  {
    code1: "1220",
    code2: "1212",
    type: "component_of",
    reason:
      "Sigmoidoscopy (1220) is included in colonoscopy with biopsy (1212). The colonoscope traverses the sigmoid colon — a separate sigmoidoscopy fee is not billable alongside any colonoscopy procedure.",
    source: "CCSA v11 surgical coding; BHF bundling rules",
    category: "surgical_package",
  },
  {
    code1: "1601",
    code2: "0700",
    type: "component_of",
    reason:
      "Abdominal hysterectomy (1601) includes wound closure (0700). Fascial and skin closure are integral to every abdominal surgical procedure — do not bill wound repair separately.",
    source: "CCSA v11 surgical coding; HPCSA tariff guidelines",
    category: "surgical_package",
  },
];
