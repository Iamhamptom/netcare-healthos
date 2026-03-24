// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Dental Bundling Rules — SA Healthcare Claims System
// ~60 rules covering examination hierarchy, preventive, restorative,
// endodontics, prosthodontics, oral surgery, periodontics, orthodontics,
// and imaging bundling.
// Reference: CCSA v11 dental coding, BHF dental guidelines, SADA
//            (SA Dental Association), HPCSA tariff guidelines.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { CodePairViolation } from "./types";

export const DENTAL_BUNDLING: CodePairViolation[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 1. EXAMINATION HIERARCHY (3 rules — all permutations)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    code1: "8101",
    code2: "8102",
    type: "mutually_exclusive",
    reason:
      "Limited oral examination (8101) and comprehensive oral examination (8102) same visit — bill the comprehensive exam only. The comprehensive includes all components of the limited exam.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8101",
    code2: "8103",
    type: "mutually_exclusive",
    reason:
      "Limited oral examination (8101) and emergency examination (8103) same visit — bill the highest level examination performed. Do not bill both.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8102",
    code2: "8103",
    type: "mutually_exclusive",
    reason:
      "Comprehensive oral examination (8102) and emergency examination (8103) same visit — bill the comprehensive exam. Emergency exam is for unscheduled presentations; comprehensive supersedes if full exam is performed.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. PREVENTIVE CARE (5 rules)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    code1: "8155",
    code2: "8156",
    type: "component_of",
    reason:
      "Scale and polish (8155) includes polishing (8156) as a component. Do not bill polishing separately when performed as part of a scale and polish procedure.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8160",
    code2: "8160",
    type: "never_together",
    reason:
      "Fluoride application (8160) — billed per visit, not per tooth or per arch. Only one fluoride application code per visit regardless of number of areas treated.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8165",
    code2: "8165",
    type: "needs_modifier",
    reason:
      "Fissure sealant (8165) — per-tooth billing is allowed but most schemes impose maximum limits (typically 8 teeth per visit). Exceeding limits requires motivation.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF benefit rules",
    category: "dental_bundling",
  },
  {
    code1: "8170",
    code2: "8102",
    type: "component_of",
    reason:
      "Oral hygiene instruction (8170) is included in the comprehensive examination (8102). Do not bill hygiene instruction separately when a comprehensive exam is performed.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8170",
    code2: "8155",
    type: "component_of",
    reason:
      "Oral hygiene instruction (8170) is typically bundled with scale and polish (8155) — most schemes consider patient education part of the prophylaxis appointment.",
    source: "CCSA v11 dental coding; BHF dental rules",
    category: "dental_bundling",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. RESTORATIVE — PER TOOTH (12 rules)
  // ═══════════════════════════════════════════════════════════════════════════

  // Surface hierarchy — all 6 permutations for 4 levels
  {
    code1: "8201",
    code2: "8202",
    type: "mutually_exclusive",
    reason:
      "One-surface restoration (8201) and two-surface restoration (8202) same tooth — bill the highest surface count. If a two-surface filling is done, do not also bill for one-surface.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8201",
    code2: "8203",
    type: "mutually_exclusive",
    reason:
      "One-surface restoration (8201) and three-surface restoration (8203) same tooth — bill the three-surface code only.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8201",
    code2: "8204",
    type: "mutually_exclusive",
    reason:
      "One-surface restoration (8201) and four-or-more-surface restoration (8204) same tooth — bill the four+ surface code only.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8202",
    code2: "8203",
    type: "mutually_exclusive",
    reason:
      "Two-surface restoration (8202) and three-surface restoration (8203) same tooth — bill the three-surface code only.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8202",
    code2: "8204",
    type: "mutually_exclusive",
    reason:
      "Two-surface restoration (8202) and four-or-more-surface restoration (8204) same tooth — bill the four+ surface code only.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8203",
    code2: "8204",
    type: "mutually_exclusive",
    reason:
      "Three-surface restoration (8203) and four-or-more-surface restoration (8204) same tooth — bill the four+ surface code only.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },

  // Amalgam vs composite same tooth — 4 surface-level pairs
  {
    code1: "8201",
    code2: "8211",
    type: "mutually_exclusive",
    reason:
      "Amalgam one-surface (8201) and composite one-surface (8211) same tooth — only one restorative material per surface. Bill the material actually used.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8202",
    code2: "8212",
    type: "mutually_exclusive",
    reason:
      "Amalgam two-surface (8202) and composite two-surface (8212) same tooth — only one restorative material per tooth. Bill the material actually placed.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8203",
    code2: "8213",
    type: "mutually_exclusive",
    reason:
      "Amalgam three-surface (8203) and composite three-surface (8213) same tooth — bill one material type only.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8204",
    code2: "8214",
    type: "mutually_exclusive",
    reason:
      "Amalgam four-surface (8204) and composite four-surface (8214) same tooth — bill one material type only.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },

  // Build-up + crown
  {
    code1: "8220",
    code2: "8230",
    type: "component_of",
    reason:
      "Core build-up (8220) and crown (8230) same tooth — core build-up is included in crown preparation. Do not bill build-up separately when a crown is placed at the same visit.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },

  // Composite vs composite different surfaces same tooth
  {
    code1: "8211",
    code2: "8212",
    type: "mutually_exclusive",
    reason:
      "Composite one-surface (8211) and composite two-surface (8212) same tooth — bill the highest surface count only. Do not split surfaces into multiple claims.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. ENDODONTICS (6 rules)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    code1: "8250",
    code2: "8300",
    type: "mutually_exclusive",
    reason:
      "Pulpotomy (8250) and root canal treatment (8300) same tooth — root canal supersedes pulpotomy. If root canal is performed, bill root canal only. Pulpotomy is a partial treatment.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8300",
    code2: "8255",
    type: "component_of",
    reason:
      "Root canal treatment (8300) includes access cavity preparation (8255). Do not bill access cavity opening separately — it is an integral step of root canal therapy.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8300",
    code2: "8310",
    type: "needs_modifier",
    reason:
      "Root canal (8300) and post and core (8310) same tooth — these are different procedures and may be billed together. However, if done same visit, modifier may be required to show distinct services.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8305",
    code2: "8300",
    type: "mutually_exclusive",
    reason:
      "Root canal retreatment (8305) and initial root canal (8300) same tooth — bill one or the other. Retreatment code is for previously treated teeth; initial code is for first-time treatment.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8320",
    code2: "8300",
    type: "needs_modifier",
    reason:
      "Apicoectomy (8320) and root canal (8300) same tooth — these are separate procedures (endodontic vs surgical). Both may be billed when clinically indicated, but modifier required to show separate service.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8250",
    code2: "8305",
    type: "mutually_exclusive",
    reason:
      "Pulpotomy (8250) and root canal retreatment (8305) same tooth — retreatment supersedes pulpotomy. Bill the definitive treatment code only.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. PROSTHODONTICS (9 rules)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    code1: "8230",
    code2: "8240",
    type: "component_of",
    reason:
      "Crown (8230) includes impression taking (8240). Do not bill impression separately when it is taken as part of crown fabrication workflow.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8400",
    code2: "8240",
    type: "component_of",
    reason:
      "Denture (8400) includes impression taking (8240). Impressions are an integral part of denture fabrication — do not bill separately.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8400",
    code2: "8241",
    type: "component_of",
    reason:
      "Denture (8400) includes bite registration (8241). Bite registration is part of the denture fabrication process — do not bill separately.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8405",
    code2: "8400",
    type: "mutually_exclusive",
    reason:
      "Immediate denture (8405) and conventional denture (8400) for the same arch — bill one type. Immediate denture is placed at extraction; conventional is placed after healing. Cannot have both for the same arch simultaneously.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8410",
    code2: "8411",
    type: "mutually_exclusive",
    reason:
      "Denture reline (8410) and denture rebase (8411) same denture — bill one procedure. Reline adds material to the fitting surface; rebase replaces the entire base. Only one is performed per denture per visit.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8415",
    code2: "8415",
    type: "never_together",
    reason:
      "Denture repair (8415) — billed per visit, not per clasp, per tooth, or per fracture line. One repair code per denture per visit regardless of complexity.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8405",
    code2: "8240",
    type: "component_of",
    reason:
      "Immediate denture (8405) includes impression taking (8240). All denture types include impressions as part of the fabrication process.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8405",
    code2: "8241",
    type: "component_of",
    reason:
      "Immediate denture (8405) includes bite registration (8241). All denture types include bite registration as part of the fabrication workflow.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8230",
    code2: "8241",
    type: "component_of",
    reason:
      "Crown (8230) includes bite registration (8241). Bite registration for crown fabrication is part of the crown procedure and should not be billed separately.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. ORAL SURGERY (9 rules)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    code1: "8601",
    code2: "8605",
    type: "component_of",
    reason:
      "Simple extraction (8601) includes local anaesthesia (8605). Local anaesthesia is bundled into the extraction fee — do not bill separately.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8602",
    code2: "8605",
    type: "component_of",
    reason:
      "Surgical extraction (8602) includes local anaesthesia (8605), flap raising, and bone removal. All surgical components are bundled — do not bill separately.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8601",
    code2: "8602",
    type: "mutually_exclusive",
    reason:
      "Simple extraction (8601) and surgical extraction (8602) same tooth — bill one code based on the technique used. If surgical elevation was required, bill surgical. Do not bill both.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8602",
    code2: "8606",
    type: "component_of",
    reason:
      "Surgical extraction (8602) includes flap raising (8606). Flap is an integral component of surgical extraction — do not unbundle.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8602",
    code2: "8607",
    type: "component_of",
    reason:
      "Surgical extraction (8602) includes bone removal (8607). Bone removal for tooth access is part of the surgical extraction procedure.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8610",
    code2: "8601",
    type: "component_of",
    reason:
      "Alveoloplasty (8610) is included when performed in conjunction with extractions (8601). Alveolar ridge smoothing done at the time of extraction is bundled into the extraction.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8610",
    code2: "8602",
    type: "component_of",
    reason:
      "Alveoloplasty (8610) is included when performed in conjunction with surgical extractions (8602). Ridge recontouring at extraction is part of the surgical procedure.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8620",
    code2: "8621",
    type: "mutually_exclusive",
    reason:
      "Soft tissue biopsy (8620) and excision of soft tissue lesion (8621) same lesion — bill one. If excisional biopsy is performed, bill excision code. Do not bill biopsy + excision for the same lesion.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8620",
    code2: "8622",
    type: "mutually_exclusive",
    reason:
      "Soft tissue biopsy (8620) and hard tissue biopsy/excision (8622) same site — bill the appropriate tissue type. Do not bill both soft and hard tissue biopsy for a single lesion.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. PERIODONTICS (7 rules)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    code1: "8155",
    code2: "8180",
    type: "needs_modifier",
    reason:
      "Scaling (8155) and root planing (8180) — different procedures but billing overlap. If root planing is performed, scaling of the same quadrant is included. Bill scaling only for quadrants not receiving root planing.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8180",
    code2: "8180",
    type: "needs_modifier",
    reason:
      "Root planing (8180) — billed per quadrant, maximum 4 quadrants per visit. Each quadrant must be documented separately. Some schemes limit to 2 quadrants per visit.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF benefit rules",
    category: "dental_bundling",
  },
  {
    code1: "8185",
    code2: "8606",
    type: "component_of",
    reason:
      "Periodontal surgery/flap surgery (8185) includes the flap procedure (8606). Do not bill mucoperiosteal flap separately when it is part of periodontal surgical access.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8190",
    code2: "8191",
    type: "needs_modifier",
    reason:
      "Bone graft (8190) and membrane placement (8191) — these are separate procedures and may be billed together when both are clinically indicated for guided tissue regeneration. Document both procedures.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8185",
    code2: "8605",
    type: "component_of",
    reason:
      "Periodontal surgery (8185) includes local anaesthesia (8605). Local anaesthesia is bundled into all dental surgical procedures.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8185",
    code2: "8155",
    type: "component_of",
    reason:
      "Periodontal surgery (8185) includes debridement/scaling of the surgical site. Do not bill scaling (8155) for the same quadrant on the same day as periodontal surgery.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "8185",
    code2: "8180",
    type: "component_of",
    reason:
      "Periodontal surgery (8185) includes root planing (8180) of the surgical site. Root planing of the same quadrant is bundled into the surgical procedure.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. ORTHODONTICS (5 rules)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    code1: "8500",
    code2: "8240",
    type: "component_of",
    reason:
      "Orthodontic initial records (8500) includes impressions (8240). Diagnostic impressions are part of the orthodontic records — do not bill separately.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF orthodontic rules",
    category: "dental_bundling",
  },
  {
    code1: "8500",
    code2: "8505",
    type: "component_of",
    reason:
      "Orthodontic initial records (8500) includes cephalometric analysis (8505) and photographs. All diagnostic components are bundled into the initial records fee.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF orthodontic rules",
    category: "dental_bundling",
  },
  {
    code1: "8510",
    code2: "8511",
    type: "never_together",
    reason:
      "Active orthodontic treatment visit (8510) — billed as one code per visit, not per wire change, bracket placement, or adjustment. Do not bill wire change (8511) separately when part of routine adjustment visit.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF orthodontic rules",
    category: "dental_bundling",
  },
  {
    code1: "8510",
    code2: "8512",
    type: "never_together",
    reason:
      "Active orthodontic treatment visit (8510) — bracket rebond (8512) is part of the adjustment visit. Do not bill bracket replacement separately at a routine adjustment.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF orthodontic rules",
    category: "dental_bundling",
  },
  {
    code1: "8520",
    code2: "8520",
    type: "never_together",
    reason:
      "Orthodontic retainer (8520) — billed as one code, not per arch, unless scheme specifically allows per-arch billing. Check scheme rules for retainer billing.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF orthodontic rules",
    category: "dental_bundling",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. DENTAL IMAGING (4 rules)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    code1: "3656",
    code2: "3655",
    type: "needs_modifier",
    reason:
      "Periapical radiograph (3656) and OPG/panoramic radiograph (3655) — both may be billed if clinically indicated (e.g., OPG for overview + periapical for specific tooth detail). Document clinical justification.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "3656",
    code2: "3657",
    type: "mutually_exclusive",
    reason:
      "Multiple periapical radiographs (3656) vs full mouth radiographic series (3657) — if 10 or more periapical films are taken, use the full mouth series code (3657) instead of billing individual periapicals.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "3655",
    code2: "3657",
    type: "never_together",
    reason:
      "OPG/panoramic (3655) and full mouth radiographic series (3657) same visit — significant overlap in diagnostic coverage. Bill one or the other unless clear clinical indication for both.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
  {
    code1: "3655",
    code2: "8102",
    type: "needs_modifier",
    reason:
      "OPG (3655) with comprehensive examination (8102) — the OPG is a separate billable service but schemes may require clinical motivation when billed at every exam visit. OPG not included in exam fee.",
    source: "CCSA v11 dental coding; SADA guidelines; BHF dental rules",
    category: "dental_bundling",
  },
];
