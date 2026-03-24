// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Consultation Overlap Rules — SA Healthcare Claims Code-Pair System
// Covers GP, specialist, ward round, psychiatry, paediatric, and admission
// overlaps per CCSA v11, HPCSA tariff guidelines, and BHF coding rules.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { CodePairViolation } from "./types";

export const CONSULTATION_OVERLAPS: CodePairViolation[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // GP CONSULTATION LEVELS — Same-day permutations (0190-0199)
  // Only the highest applicable consultation level may be billed per visit.
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "0190",
    code2: "0191",
    type: "never_together",
    reason:
      "Brief GP consultation (0190) and intermediate GP consultation (0191) on same day by same provider — bill highest applicable level only.",
    source: "CCSA v11 consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0190",
    code2: "0192",
    type: "never_together",
    reason:
      "Brief GP consultation (0190) and comprehensive GP consultation (0192) on same day by same provider — bill highest applicable level only.",
    source: "CCSA v11 consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0190",
    code2: "0193",
    type: "never_together",
    reason:
      "Brief GP consultation (0190) and extended GP consultation (0193) on same day by same provider — bill highest applicable level only.",
    source: "CCSA v11 consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0191",
    code2: "0192",
    type: "never_together",
    reason:
      "Intermediate GP consultation (0191) and comprehensive GP consultation (0192) on same day by same provider — bill highest applicable level only.",
    source: "CCSA v11 consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0191",
    code2: "0193",
    type: "never_together",
    reason:
      "Intermediate GP consultation (0191) and extended GP consultation (0193) on same day by same provider — bill highest applicable level only.",
    source: "CCSA v11 consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0192",
    code2: "0193",
    type: "never_together",
    reason:
      "Comprehensive GP consultation (0192) and extended GP consultation (0193) on same day by same provider — bill highest applicable level only.",
    source: "CCSA v11 consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // GP STANDARD vs AFTER-HOURS — Cannot bill both for same encounter
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "0190",
    code2: "0290",
    type: "mutually_exclusive",
    reason:
      "Brief GP consultation standard hours (0190) and brief GP consultation after-hours (0290) are mutually exclusive — an encounter occurs during standard hours or after-hours, not both.",
    source: "CCSA v11 after-hours tariff rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0191",
    code2: "0291",
    type: "mutually_exclusive",
    reason:
      "Intermediate GP consultation standard hours (0191) and intermediate GP consultation after-hours (0291) are mutually exclusive — an encounter occurs during standard hours or after-hours, not both.",
    source: "CCSA v11 after-hours tariff rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0192",
    code2: "0292",
    type: "mutually_exclusive",
    reason:
      "Comprehensive GP consultation standard hours (0192) and comprehensive GP consultation after-hours (0292) are mutually exclusive — an encounter occurs during standard hours or after-hours, not both.",
    source: "CCSA v11 after-hours tariff rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0193",
    code2: "0293",
    type: "mutually_exclusive",
    reason:
      "Extended GP consultation standard hours (0193) and extended GP consultation after-hours (0293) are mutually exclusive — an encounter occurs during standard hours or after-hours, not both.",
    source: "CCSA v11 after-hours tariff rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },

  // Cross after-hours + different level standard (double-dipping attempt)
  {
    code1: "0190",
    code2: "0291",
    type: "never_together",
    reason:
      "Brief GP consultation (0190) and intermediate after-hours GP consultation (0291) on same day by same provider — only one consultation level and time category may be billed per encounter.",
    source: "CCSA v11 consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0190",
    code2: "0292",
    type: "never_together",
    reason:
      "Brief GP consultation (0190) and comprehensive after-hours GP consultation (0292) on same day by same provider — only one consultation level and time category may be billed per encounter.",
    source: "CCSA v11 consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0191",
    code2: "0290",
    type: "never_together",
    reason:
      "Intermediate GP consultation (0191) and brief after-hours GP consultation (0290) on same day by same provider — only one consultation level and time category may be billed per encounter.",
    source: "CCSA v11 consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0192",
    code2: "0290",
    type: "never_together",
    reason:
      "Comprehensive GP consultation (0192) and brief after-hours GP consultation (0290) on same day by same provider — only one consultation level and time category may be billed per encounter.",
    source: "CCSA v11 consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0193",
    code2: "0290",
    type: "never_together",
    reason:
      "Extended GP consultation (0193) and brief after-hours GP consultation (0290) on same day by same provider — only one consultation level and time category may be billed per encounter.",
    source: "CCSA v11 consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // GP IN-PERSON vs TELEHEALTH (0197) — Cannot bill both
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "0190",
    code2: "0197",
    type: "mutually_exclusive",
    reason:
      "Brief GP consultation (0190) and GP telehealth consultation (0197) on same day by same provider — an encounter is either in-person or telehealth, not both.",
    source: "CCSA v11 telehealth consultation rules; HPCSA telemedicine guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0191",
    code2: "0197",
    type: "mutually_exclusive",
    reason:
      "Intermediate GP consultation (0191) and GP telehealth consultation (0197) on same day by same provider — an encounter is either in-person or telehealth, not both.",
    source: "CCSA v11 telehealth consultation rules; HPCSA telemedicine guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0192",
    code2: "0197",
    type: "mutually_exclusive",
    reason:
      "Comprehensive GP consultation (0192) and GP telehealth consultation (0197) on same day by same provider — an encounter is either in-person or telehealth, not both.",
    source: "CCSA v11 telehealth consultation rules; HPCSA telemedicine guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0193",
    code2: "0197",
    type: "mutually_exclusive",
    reason:
      "Extended GP consultation (0193) and GP telehealth consultation (0197) on same day by same provider — an encounter is either in-person or telehealth, not both.",
    source: "CCSA v11 telehealth consultation rules; HPCSA telemedicine guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0194",
    code2: "0197",
    type: "mutually_exclusive",
    reason:
      "GP home visit (0194) and GP telehealth consultation (0197) on same day by same provider — a home visit is in-person by definition and cannot coexist with a telehealth encounter.",
    source: "CCSA v11 telehealth consultation rules; HPCSA telemedicine guidelines",
    category: "consultation_overlap",
  },

  // Home visit vs standard consultations
  {
    code1: "0190",
    code2: "0194",
    type: "never_together",
    reason:
      "Brief GP consultation (0190) and GP home visit (0194) on same day by same provider — the home visit tariff includes the consultation component.",
    source: "CCSA v11 consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0191",
    code2: "0194",
    type: "never_together",
    reason:
      "Intermediate GP consultation (0191) and GP home visit (0194) on same day by same provider — the home visit tariff includes the consultation component.",
    source: "CCSA v11 consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0192",
    code2: "0194",
    type: "never_together",
    reason:
      "Comprehensive GP consultation (0192) and GP home visit (0194) on same day by same provider — the home visit tariff includes the consultation component.",
    source: "CCSA v11 consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0193",
    code2: "0194",
    type: "never_together",
    reason:
      "Extended GP consultation (0193) and GP home visit (0194) on same day by same provider — the home visit tariff includes the consultation component.",
    source: "CCSA v11 consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SPECIALIST CONSULTATION LEVELS — Same-day permutations (0141-0149)
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "0141",
    code2: "0142",
    type: "never_together",
    reason:
      "Initial specialist consultation (0141) and follow-up specialist consultation (0142) on same day by same provider — a patient cannot be both initial and follow-up in a single encounter.",
    source: "CCSA v11 specialist consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0141",
    code2: "0143",
    type: "never_together",
    reason:
      "Initial specialist consultation (0141) and extended specialist consultation (0143) on same day by same provider — bill the highest applicable consultation level only.",
    source: "CCSA v11 specialist consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0141",
    code2: "0144",
    type: "never_together",
    reason:
      "Initial specialist consultation (0141) and comprehensive specialist consultation (0144) on same day by same provider — bill the highest applicable consultation level only.",
    source: "CCSA v11 specialist consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0142",
    code2: "0143",
    type: "never_together",
    reason:
      "Follow-up specialist consultation (0142) and extended specialist consultation (0143) on same day by same provider — bill the highest applicable consultation level only.",
    source: "CCSA v11 specialist consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0142",
    code2: "0144",
    type: "never_together",
    reason:
      "Follow-up specialist consultation (0142) and comprehensive specialist consultation (0144) on same day by same provider — bill the highest applicable consultation level only.",
    source: "CCSA v11 specialist consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0143",
    code2: "0144",
    type: "never_together",
    reason:
      "Extended specialist consultation (0143) and comprehensive specialist consultation (0144) on same day by same provider — bill the highest applicable consultation level only.",
    source: "CCSA v11 specialist consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CROSS-DISCIPLINE: GP + SPECIALIST same provider same day
  // A practitioner may not bill as both GP and specialist simultaneously.
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "0190",
    code2: "0141",
    type: "never_together",
    reason:
      "Brief GP consultation (0190) and initial specialist consultation (0141) billed by same provider on same day — a practitioner cannot practise as both GP and specialist simultaneously.",
    source: "CCSA v11 discipline rules; HPCSA Ethical Rules r4(1); BHF coding guidelines",
    category: "discipline_mismatch",
  },
  {
    code1: "0190",
    code2: "0142",
    type: "never_together",
    reason:
      "Brief GP consultation (0190) and follow-up specialist consultation (0142) billed by same provider on same day — a practitioner cannot practise as both GP and specialist simultaneously.",
    source: "CCSA v11 discipline rules; HPCSA Ethical Rules r4(1); BHF coding guidelines",
    category: "discipline_mismatch",
  },
  {
    code1: "0190",
    code2: "0143",
    type: "never_together",
    reason:
      "Brief GP consultation (0190) and extended specialist consultation (0143) billed by same provider on same day — a practitioner cannot practise as both GP and specialist simultaneously.",
    source: "CCSA v11 discipline rules; HPCSA Ethical Rules r4(1); BHF coding guidelines",
    category: "discipline_mismatch",
  },
  {
    code1: "0190",
    code2: "0144",
    type: "never_together",
    reason:
      "Brief GP consultation (0190) and comprehensive specialist consultation (0144) billed by same provider on same day — a practitioner cannot practise as both GP and specialist simultaneously.",
    source: "CCSA v11 discipline rules; HPCSA Ethical Rules r4(1); BHF coding guidelines",
    category: "discipline_mismatch",
  },
  {
    code1: "0191",
    code2: "0141",
    type: "never_together",
    reason:
      "Intermediate GP consultation (0191) and initial specialist consultation (0141) billed by same provider on same day — a practitioner cannot practise as both GP and specialist simultaneously.",
    source: "CCSA v11 discipline rules; HPCSA Ethical Rules r4(1); BHF coding guidelines",
    category: "discipline_mismatch",
  },
  {
    code1: "0191",
    code2: "0142",
    type: "never_together",
    reason:
      "Intermediate GP consultation (0191) and follow-up specialist consultation (0142) billed by same provider on same day — a practitioner cannot practise as both GP and specialist simultaneously.",
    source: "CCSA v11 discipline rules; HPCSA Ethical Rules r4(1); BHF coding guidelines",
    category: "discipline_mismatch",
  },
  {
    code1: "0191",
    code2: "0143",
    type: "never_together",
    reason:
      "Intermediate GP consultation (0191) and extended specialist consultation (0143) billed by same provider on same day — a practitioner cannot practise as both GP and specialist simultaneously.",
    source: "CCSA v11 discipline rules; HPCSA Ethical Rules r4(1); BHF coding guidelines",
    category: "discipline_mismatch",
  },
  {
    code1: "0191",
    code2: "0144",
    type: "never_together",
    reason:
      "Intermediate GP consultation (0191) and comprehensive specialist consultation (0144) billed by same provider on same day — a practitioner cannot practise as both GP and specialist simultaneously.",
    source: "CCSA v11 discipline rules; HPCSA Ethical Rules r4(1); BHF coding guidelines",
    category: "discipline_mismatch",
  },
  {
    code1: "0192",
    code2: "0141",
    type: "never_together",
    reason:
      "Comprehensive GP consultation (0192) and initial specialist consultation (0141) billed by same provider on same day — a practitioner cannot practise as both GP and specialist simultaneously.",
    source: "CCSA v11 discipline rules; HPCSA Ethical Rules r4(1); BHF coding guidelines",
    category: "discipline_mismatch",
  },
  {
    code1: "0192",
    code2: "0142",
    type: "never_together",
    reason:
      "Comprehensive GP consultation (0192) and follow-up specialist consultation (0142) billed by same provider on same day — a practitioner cannot practise as both GP and specialist simultaneously.",
    source: "CCSA v11 discipline rules; HPCSA Ethical Rules r4(1); BHF coding guidelines",
    category: "discipline_mismatch",
  },
  {
    code1: "0192",
    code2: "0143",
    type: "never_together",
    reason:
      "Comprehensive GP consultation (0192) and extended specialist consultation (0143) billed by same provider on same day — a practitioner cannot practise as both GP and specialist simultaneously.",
    source: "CCSA v11 discipline rules; HPCSA Ethical Rules r4(1); BHF coding guidelines",
    category: "discipline_mismatch",
  },
  {
    code1: "0192",
    code2: "0144",
    type: "never_together",
    reason:
      "Comprehensive GP consultation (0192) and comprehensive specialist consultation (0144) billed by same provider on same day — a practitioner cannot practise as both GP and specialist simultaneously.",
    source: "CCSA v11 discipline rules; HPCSA Ethical Rules r4(1); BHF coding guidelines",
    category: "discipline_mismatch",
  },
  {
    code1: "0193",
    code2: "0141",
    type: "never_together",
    reason:
      "Extended GP consultation (0193) and initial specialist consultation (0141) billed by same provider on same day — a practitioner cannot practise as both GP and specialist simultaneously.",
    source: "CCSA v11 discipline rules; HPCSA Ethical Rules r4(1); BHF coding guidelines",
    category: "discipline_mismatch",
  },
  {
    code1: "0193",
    code2: "0142",
    type: "never_together",
    reason:
      "Extended GP consultation (0193) and follow-up specialist consultation (0142) billed by same provider on same day — a practitioner cannot practise as both GP and specialist simultaneously.",
    source: "CCSA v11 discipline rules; HPCSA Ethical Rules r4(1); BHF coding guidelines",
    category: "discipline_mismatch",
  },
  {
    code1: "0193",
    code2: "0143",
    type: "never_together",
    reason:
      "Extended GP consultation (0193) and extended specialist consultation (0143) billed by same provider on same day — a practitioner cannot practise as both GP and specialist simultaneously.",
    source: "CCSA v11 discipline rules; HPCSA Ethical Rules r4(1); BHF coding guidelines",
    category: "discipline_mismatch",
  },
  {
    code1: "0193",
    code2: "0144",
    type: "never_together",
    reason:
      "Extended GP consultation (0193) and comprehensive specialist consultation (0144) billed by same provider on same day — a practitioner cannot practise as both GP and specialist simultaneously.",
    source: "CCSA v11 discipline rules; HPCSA Ethical Rules r4(1); BHF coding guidelines",
    category: "discipline_mismatch",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // WARD ROUND OVERLAPS (0161-0163, 0171)
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "0161",
    code2: "0162",
    type: "never_together",
    reason:
      "Daily ward round (0161) and extended ward round (0162) on same day by same provider for same patient — bill the highest applicable ward round level only.",
    source: "CCSA v11 ward round rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0161",
    code2: "0163",
    type: "never_together",
    reason:
      "Daily ward round (0161) and subsequent ward visit (0163) on same day by same provider for same patient — only one ward attendance per calendar day unless clinically justified and separately documented.",
    source: "CCSA v11 ward round rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0162",
    code2: "0163",
    type: "never_together",
    reason:
      "Extended ward round (0162) and subsequent ward visit (0163) on same day by same provider for same patient — the extended ward round already covers additional clinical complexity.",
    source: "CCSA v11 ward round rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0171",
    code2: "0161",
    type: "never_together",
    reason:
      "ICU ward round (0171) and standard daily ward round (0161) on same day by same provider for same patient — patient is in ICU or general ward, not both simultaneously.",
    source: "CCSA v11 ICU tariff rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0171",
    code2: "0162",
    type: "never_together",
    reason:
      "ICU ward round (0171) and extended ward round (0162) on same day by same provider for same patient — ICU round is a distinct tariff category and cannot overlap with general ward rounds.",
    source: "CCSA v11 ICU tariff rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0171",
    code2: "0163",
    type: "never_together",
    reason:
      "ICU ward round (0171) and subsequent ward visit (0163) on same day by same provider for same patient — ICU attendance tariff includes comprehensive monitoring and review.",
    source: "CCSA v11 ICU tariff rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },

  // Ward round + GP consultation (ward round includes clinical review)
  {
    code1: "0161",
    code2: "0190",
    type: "never_together",
    reason:
      "Daily ward round (0161) and brief GP consultation (0190) on same day by same provider for same patient — the ward round already includes clinical review and assessment.",
    source: "CCSA v11 consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0161",
    code2: "0191",
    type: "never_together",
    reason:
      "Daily ward round (0161) and intermediate GP consultation (0191) on same day by same provider for same patient — the ward round already includes clinical review and assessment.",
    source: "CCSA v11 consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0161",
    code2: "0192",
    type: "never_together",
    reason:
      "Daily ward round (0161) and comprehensive GP consultation (0192) on same day by same provider for same patient — the ward round already includes clinical review and assessment.",
    source: "CCSA v11 consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0161",
    code2: "0193",
    type: "never_together",
    reason:
      "Daily ward round (0161) and extended GP consultation (0193) on same day by same provider for same patient — the ward round already includes clinical review and assessment.",
    source: "CCSA v11 consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0162",
    code2: "0190",
    type: "never_together",
    reason:
      "Extended ward round (0162) and brief GP consultation (0190) on same day by same provider for same patient — the extended ward round already covers comprehensive clinical review.",
    source: "CCSA v11 consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0162",
    code2: "0191",
    type: "never_together",
    reason:
      "Extended ward round (0162) and intermediate GP consultation (0191) on same day by same provider for same patient — the extended ward round already covers comprehensive clinical review.",
    source: "CCSA v11 consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0162",
    code2: "0192",
    type: "never_together",
    reason:
      "Extended ward round (0162) and comprehensive GP consultation (0192) on same day by same provider for same patient — the extended ward round already covers comprehensive clinical review.",
    source: "CCSA v11 consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0162",
    code2: "0193",
    type: "never_together",
    reason:
      "Extended ward round (0162) and extended GP consultation (0193) on same day by same provider for same patient — the extended ward round already covers comprehensive clinical review.",
    source: "CCSA v11 consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },

  // Ward round + specialist consultation
  {
    code1: "0161",
    code2: "0141",
    type: "never_together",
    reason:
      "Daily ward round (0161) and initial specialist consultation (0141) on same day by same provider for same patient — ward round attendance includes specialist review of the admitted patient.",
    source: "CCSA v11 ward round rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0161",
    code2: "0142",
    type: "never_together",
    reason:
      "Daily ward round (0161) and follow-up specialist consultation (0142) on same day by same provider for same patient — ward round attendance includes specialist review of the admitted patient.",
    source: "CCSA v11 ward round rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0162",
    code2: "0141",
    type: "never_together",
    reason:
      "Extended ward round (0162) and initial specialist consultation (0141) on same day by same provider for same patient — extended ward round includes specialist review.",
    source: "CCSA v11 ward round rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0162",
    code2: "0142",
    type: "never_together",
    reason:
      "Extended ward round (0162) and follow-up specialist consultation (0142) on same day by same provider for same patient — extended ward round includes specialist review.",
    source: "CCSA v11 ward round rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },

  // ICU ward round + consultations
  {
    code1: "0171",
    code2: "0190",
    type: "never_together",
    reason:
      "ICU ward round (0171) and brief GP consultation (0190) on same day by same provider for same patient — ICU round includes comprehensive clinical assessment.",
    source: "CCSA v11 ICU tariff rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0171",
    code2: "0191",
    type: "never_together",
    reason:
      "ICU ward round (0171) and intermediate GP consultation (0191) on same day by same provider for same patient — ICU round includes comprehensive clinical assessment.",
    source: "CCSA v11 ICU tariff rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0171",
    code2: "0141",
    type: "never_together",
    reason:
      "ICU ward round (0171) and initial specialist consultation (0141) on same day by same provider for same patient — ICU round attendance is the specialist's review mechanism for critically ill patients.",
    source: "CCSA v11 ICU tariff rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0171",
    code2: "0142",
    type: "never_together",
    reason:
      "ICU ward round (0171) and follow-up specialist consultation (0142) on same day by same provider for same patient — ICU round attendance is the specialist's review mechanism for critically ill patients.",
    source: "CCSA v11 ICU tariff rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PSYCHIATRY CONSULTATION OVERLAPS (0181-0183)
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "0181",
    code2: "0182",
    type: "never_together",
    reason:
      "Initial psychiatric consultation (0181) and follow-up psychiatric consultation (0182) on same day by same provider — a patient cannot be both initial and follow-up in a single encounter.",
    source: "CCSA v11 psychiatric consultation rules; HPCSA tariff guidelines",
    category: "mental_health_overlap",
  },
  {
    code1: "0181",
    code2: "0183",
    type: "never_together",
    reason:
      "Initial psychiatric consultation (0181) and extended psychiatric consultation (0183) on same day by same provider — bill highest applicable psychiatric consultation level only.",
    source: "CCSA v11 psychiatric consultation rules; HPCSA tariff guidelines",
    category: "mental_health_overlap",
  },
  {
    code1: "0182",
    code2: "0183",
    type: "never_together",
    reason:
      "Follow-up psychiatric consultation (0182) and extended psychiatric consultation (0183) on same day by same provider — bill highest applicable psychiatric consultation level only.",
    source: "CCSA v11 psychiatric consultation rules; HPCSA tariff guidelines",
    category: "mental_health_overlap",
  },

  // Psychiatric vs psychology consultation same day
  {
    code1: "0181",
    code2: "6400",
    type: "never_together",
    reason:
      "Initial psychiatric consultation (0181) and psychology consultation (6400) on same day by same provider — a single practitioner cannot bill under both psychiatry and psychology practice numbers.",
    source: "CCSA v11 discipline rules; HPCSA registration categories; BHF coding guidelines",
    category: "mental_health_overlap",
  },
  {
    code1: "0182",
    code2: "6400",
    type: "never_together",
    reason:
      "Follow-up psychiatric consultation (0182) and psychology consultation (6400) on same day by same provider — a single practitioner cannot bill under both psychiatry and psychology practice numbers.",
    source: "CCSA v11 discipline rules; HPCSA registration categories; BHF coding guidelines",
    category: "mental_health_overlap",
  },
  {
    code1: "0183",
    code2: "6400",
    type: "never_together",
    reason:
      "Extended psychiatric consultation (0183) and psychology consultation (6400) on same day by same provider — a single practitioner cannot bill under both psychiatry and psychology practice numbers.",
    source: "CCSA v11 discipline rules; HPCSA registration categories; BHF coding guidelines",
    category: "mental_health_overlap",
  },

  // Psychiatry + GP consultation same provider
  {
    code1: "0181",
    code2: "0190",
    type: "never_together",
    reason:
      "Initial psychiatric consultation (0181) and brief GP consultation (0190) on same day by same provider — psychiatrist may not simultaneously bill as general practitioner.",
    source: "CCSA v11 discipline rules; HPCSA Ethical Rules r4(1)",
    category: "discipline_mismatch",
  },
  {
    code1: "0181",
    code2: "0191",
    type: "never_together",
    reason:
      "Initial psychiatric consultation (0181) and intermediate GP consultation (0191) on same day by same provider — psychiatrist may not simultaneously bill as general practitioner.",
    source: "CCSA v11 discipline rules; HPCSA Ethical Rules r4(1)",
    category: "discipline_mismatch",
  },
  {
    code1: "0182",
    code2: "0190",
    type: "never_together",
    reason:
      "Follow-up psychiatric consultation (0182) and brief GP consultation (0190) on same day by same provider — psychiatrist may not simultaneously bill as general practitioner.",
    source: "CCSA v11 discipline rules; HPCSA Ethical Rules r4(1)",
    category: "discipline_mismatch",
  },
  {
    code1: "0183",
    code2: "0190",
    type: "never_together",
    reason:
      "Extended psychiatric consultation (0183) and brief GP consultation (0190) on same day by same provider — psychiatrist may not simultaneously bill as general practitioner.",
    source: "CCSA v11 discipline rules; HPCSA Ethical Rules r4(1)",
    category: "discipline_mismatch",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PAEDIATRIC CONSULTATION OVERLAPS (0151-0152)
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "0151",
    code2: "0152",
    type: "never_together",
    reason:
      "Initial paediatric consultation (0151) and follow-up paediatric consultation (0152) on same day by same provider — a patient cannot be both initial and follow-up in a single encounter.",
    source: "CCSA v11 paediatric consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0151",
    code2: "0141",
    type: "never_together",
    reason:
      "Initial paediatric consultation (0151) and initial specialist consultation (0141) on same day by same provider for same patient — the paediatric code already designates the specialist discipline; do not double-bill with generic specialist codes.",
    source: "CCSA v11 specialist consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0152",
    code2: "0142",
    type: "never_together",
    reason:
      "Follow-up paediatric consultation (0152) and follow-up specialist consultation (0142) on same day by same provider for same patient — the paediatric code already designates the specialist discipline; do not double-bill with generic specialist codes.",
    source: "CCSA v11 specialist consultation rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0151",
    code2: "0190",
    type: "never_together",
    reason:
      "Initial paediatric consultation (0151) and brief GP consultation (0190) on same day by same provider — a paediatrician may not simultaneously bill as a general practitioner for the same patient.",
    source: "CCSA v11 discipline rules; HPCSA Ethical Rules r4(1)",
    category: "discipline_mismatch",
  },
  {
    code1: "0151",
    code2: "0191",
    type: "never_together",
    reason:
      "Initial paediatric consultation (0151) and intermediate GP consultation (0191) on same day by same provider — a paediatrician may not simultaneously bill as a general practitioner for the same patient.",
    source: "CCSA v11 discipline rules; HPCSA Ethical Rules r4(1)",
    category: "discipline_mismatch",
  },
  {
    code1: "0152",
    code2: "0190",
    type: "never_together",
    reason:
      "Follow-up paediatric consultation (0152) and brief GP consultation (0190) on same day by same provider — a paediatrician may not simultaneously bill as a general practitioner for the same patient.",
    source: "CCSA v11 discipline rules; HPCSA Ethical Rules r4(1)",
    category: "discipline_mismatch",
  },
  {
    code1: "0152",
    code2: "0191",
    type: "never_together",
    reason:
      "Follow-up paediatric consultation (0152) and intermediate GP consultation (0191) on same day by same provider — a paediatrician may not simultaneously bill as a general practitioner for the same patient.",
    source: "CCSA v11 discipline rules; HPCSA Ethical Rules r4(1)",
    category: "discipline_mismatch",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // HOSPITAL ADMISSION + CONSULTATION OVERLAPS
  // Admission assessment (0160) includes initial clinical assessment.
  // ─────────────────────────────────────────────────────────────────────────
  {
    code1: "0160",
    code2: "0190",
    type: "never_together",
    reason:
      "Hospital admission assessment (0160) and brief GP consultation (0190) on same day by same provider for same patient — the admission assessment tariff includes the initial clinical consultation on day of admission.",
    source: "CCSA v11 admission rules; HPCSA tariff guidelines; BHF coding guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0160",
    code2: "0191",
    type: "never_together",
    reason:
      "Hospital admission assessment (0160) and intermediate GP consultation (0191) on same day by same provider for same patient — the admission assessment tariff includes the initial clinical consultation on day of admission.",
    source: "CCSA v11 admission rules; HPCSA tariff guidelines; BHF coding guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0160",
    code2: "0192",
    type: "never_together",
    reason:
      "Hospital admission assessment (0160) and comprehensive GP consultation (0192) on same day by same provider for same patient — the admission assessment tariff includes the initial clinical consultation on day of admission.",
    source: "CCSA v11 admission rules; HPCSA tariff guidelines; BHF coding guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0160",
    code2: "0193",
    type: "never_together",
    reason:
      "Hospital admission assessment (0160) and extended GP consultation (0193) on same day by same provider for same patient — the admission assessment tariff includes the initial clinical consultation on day of admission.",
    source: "CCSA v11 admission rules; HPCSA tariff guidelines; BHF coding guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0160",
    code2: "0141",
    type: "never_together",
    reason:
      "Hospital admission assessment (0160) and initial specialist consultation (0141) on same day by admitting provider for same patient — the admission assessment tariff includes the initial clinical assessment on day of admission.",
    source: "CCSA v11 admission rules; HPCSA tariff guidelines; BHF coding guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0160",
    code2: "0142",
    type: "never_together",
    reason:
      "Hospital admission assessment (0160) and follow-up specialist consultation (0142) on same day by admitting provider for same patient — the admission assessment tariff includes the initial clinical assessment; a follow-up is inappropriate on admission day.",
    source: "CCSA v11 admission rules; HPCSA tariff guidelines; BHF coding guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0160",
    code2: "0151",
    type: "never_together",
    reason:
      "Hospital admission assessment (0160) and initial paediatric consultation (0151) on same day by admitting provider for same patient — the admission assessment includes the initial paediatric assessment on day of admission.",
    source: "CCSA v11 admission rules; HPCSA tariff guidelines; BHF coding guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0160",
    code2: "0161",
    type: "never_together",
    reason:
      "Hospital admission assessment (0160) and daily ward round (0161) on same day by same provider for same patient — on admission day, the admission assessment serves as the initial ward attendance; a separate ward round is not billable.",
    source: "CCSA v11 admission rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0160",
    code2: "0162",
    type: "never_together",
    reason:
      "Hospital admission assessment (0160) and extended ward round (0162) on same day by same provider for same patient — on admission day, the admission assessment serves as the initial ward attendance.",
    source: "CCSA v11 admission rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0160",
    code2: "0171",
    type: "never_together",
    reason:
      "Hospital admission assessment (0160) and ICU ward round (0171) on same day by same provider for same patient — ICU admission has its own tariff structure; do not bill general admission and ICU round for the same encounter.",
    source: "CCSA v11 ICU admission rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },

  // After-hours cross-level specialist
  {
    code1: "0290",
    code2: "0291",
    type: "never_together",
    reason:
      "Brief after-hours GP consultation (0290) and intermediate after-hours GP consultation (0291) on same day by same provider — bill highest applicable after-hours level only.",
    source: "CCSA v11 after-hours tariff rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0290",
    code2: "0292",
    type: "never_together",
    reason:
      "Brief after-hours GP consultation (0290) and comprehensive after-hours GP consultation (0292) on same day by same provider — bill highest applicable after-hours level only.",
    source: "CCSA v11 after-hours tariff rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0290",
    code2: "0293",
    type: "never_together",
    reason:
      "Brief after-hours GP consultation (0290) and extended after-hours GP consultation (0293) on same day by same provider — bill highest applicable after-hours level only.",
    source: "CCSA v11 after-hours tariff rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0291",
    code2: "0292",
    type: "never_together",
    reason:
      "Intermediate after-hours GP consultation (0291) and comprehensive after-hours GP consultation (0292) on same day by same provider — bill highest applicable after-hours level only.",
    source: "CCSA v11 after-hours tariff rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0291",
    code2: "0293",
    type: "never_together",
    reason:
      "Intermediate after-hours GP consultation (0291) and extended after-hours GP consultation (0293) on same day by same provider — bill highest applicable after-hours level only.",
    source: "CCSA v11 after-hours tariff rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0292",
    code2: "0293",
    type: "never_together",
    reason:
      "Comprehensive after-hours GP consultation (0292) and extended after-hours GP consultation (0293) on same day by same provider — bill highest applicable after-hours level only.",
    source: "CCSA v11 after-hours tariff rules; HPCSA tariff guidelines",
    category: "consultation_overlap",
  },

  // Telehealth + after-hours
  {
    code1: "0197",
    code2: "0290",
    type: "never_together",
    reason:
      "GP telehealth consultation (0197) and brief after-hours GP consultation (0290) on same day by same provider — only one consultation modality and time category per encounter.",
    source: "CCSA v11 telehealth rules; HPCSA telemedicine guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0197",
    code2: "0291",
    type: "never_together",
    reason:
      "GP telehealth consultation (0197) and intermediate after-hours GP consultation (0291) on same day by same provider — only one consultation modality and time category per encounter.",
    source: "CCSA v11 telehealth rules; HPCSA telemedicine guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0197",
    code2: "0292",
    type: "never_together",
    reason:
      "GP telehealth consultation (0197) and comprehensive after-hours GP consultation (0292) on same day by same provider — only one consultation modality and time category per encounter.",
    source: "CCSA v11 telehealth rules; HPCSA telemedicine guidelines",
    category: "consultation_overlap",
  },
  {
    code1: "0197",
    code2: "0293",
    type: "never_together",
    reason:
      "GP telehealth consultation (0197) and extended after-hours GP consultation (0293) on same day by same provider — only one consultation modality and time category per encounter.",
    source: "CCSA v11 telehealth rules; HPCSA telemedicine guidelines",
    category: "consultation_overlap",
  },
];
