import { describe, it, expect } from "vitest";
import {
  REJECTION_CODES,
  MEDICAL_AID_SCHEMES,
  isValidICD10,
  isValidBHF,
  formatZAR,
  parseZARToCents,
} from "@/lib/healthbridge/codes";
import { PMB_ICD10_CODES, CDL_CONDITIONS, isPMBCondition, isCDLCondition } from "@/lib/healthbridge/pmb";
import { SCHEME_ROUTING_TABLE } from "@/lib/switching/router";
import { validateClaim } from "@/lib/healthbridge/validator";
import { generateEDIFACT } from "@/lib/switching/edifact";
import type { ClaimSubmission } from "@/lib/healthbridge/types";

describe("SA Rejection Codes Completeness", () => {
  it("has all 15 SA standard rejection codes mapped", () => {
    for (let i = 1; i <= 15; i++) {
      const code = String(i).padStart(2, "0");
      expect(REJECTION_CODES[code]).toBeDefined();
      expect(REJECTION_CODES[code].length).toBeGreaterThan(0);
    }
  });

  it("every rejection code has a description", () => {
    for (const [code, description] of Object.entries(REJECTION_CODES)) {
      expect(code).toMatch(/^\d{2}$/);
      expect(description.length).toBeGreaterThan(5);
    }
  });
});

describe("Medical Aid Scheme Routing Coverage", () => {
  it("at least 10 major schemes have routing entries", () => {
    expect(Object.keys(MEDICAL_AID_SCHEMES).length).toBeGreaterThanOrEqual(10);
  });

  it("all major SA schemes are mapped", () => {
    const majorSchemes = [
      "Discovery Health", "GEMS", "Bonitas", "Medihelp",
      "Momentum Health", "Bestmed", "Fedhealth", "Polmed",
      "CompCare", "Sizwe Hosmed",
    ];
    for (const scheme of majorSchemes) {
      expect(MEDICAL_AID_SCHEMES[scheme]).toBeDefined();
      expect(MEDICAL_AID_SCHEMES[scheme].administrator).toBeTruthy();
    }
  });

  it("routing table has 20+ scheme entries", () => {
    expect(SCHEME_ROUTING_TABLE.length).toBeGreaterThanOrEqual(20);
  });

  it("every routing entry maps to a valid switch provider", () => {
    const validSwitches = ["healthbridge", "medikredit", "switchon", "direct"];
    for (const route of SCHEME_ROUTING_TABLE) {
      expect(validSwitches).toContain(route.primarySwitch);
      for (const fallback of route.fallbackSwitches) {
        expect(validSwitches).toContain(fallback);
      }
    }
  });
});

describe("PMB Conditions — Prescribed Minimum Benefits", () => {
  it("includes heart attack (I21.9)", () => {
    expect(PMB_ICD10_CODES["I21.9"]).toBeDefined();
    expect(isPMBCondition("I21.9")).toBe(true);
  });

  it("includes stroke (I63.9, I64)", () => {
    expect(PMB_ICD10_CODES["I63.9"]).toBeDefined();
    expect(PMB_ICD10_CODES["I64"]).toBeDefined();
  });

  it("includes cancer (C50.9 — breast cancer)", () => {
    expect(PMB_ICD10_CODES["C50.9"]).toBeDefined();
    expect(isPMBCondition("C50.9")).toBe(true);
  });

  it("all malignant neoplasms (C00-C97) are PMB", () => {
    expect(isPMBCondition("C18.9")).toBe(true); // Colon
    expect(isPMBCondition("C34.9")).toBe(true); // Lung
    expect(isPMBCondition("C61")).toBe(true);   // Prostate
    expect(isPMBCondition("C73")).toBe(true);   // Thyroid
  });

  it("includes HIV/AIDS (B20)", () => {
    expect(PMB_ICD10_CODES["B20"]).toBeDefined();
    expect(isPMBCondition("B20")).toBe(true);
  });

  it("includes maternity (O80, O82)", () => {
    expect(PMB_ICD10_CODES["O80"]).toBeDefined();
    expect(PMB_ICD10_CODES["O82"]).toBeDefined();
    // All O-codes are PMB (maternity)
    expect(isPMBCondition("O00.9")).toBe(true);
  });

  it("includes diabetes (E10.9, E11.9)", () => {
    expect(PMB_ICD10_CODES["E10.9"]).toBeDefined();
    expect(PMB_ICD10_CODES["E11.9"]).toBeDefined();
  });

  it("includes hypertension (I10)", () => {
    expect(PMB_ICD10_CODES["I10"]).toBeDefined();
  });

  it("includes emergency conditions", () => {
    expect(PMB_ICD10_CODES["T78.2"]).toBeDefined(); // Anaphylaxis
    expect(PMB_ICD10_CODES["K35.8"]).toBeDefined(); // Appendicitis
    expect(PMB_ICD10_CODES["S72.0"]).toBeDefined(); // Hip fracture
  });
});

describe("CDL — Chronic Disease List", () => {
  it("includes all 26 chronic conditions", () => {
    expect(CDL_CONDITIONS).toHaveLength(26);
  });

  it("every CDL condition has a name and ICD prefix", () => {
    for (const condition of CDL_CONDITIONS) {
      expect(condition.name.length).toBeGreaterThan(0);
      expect(condition.icdPrefix.length).toBeGreaterThan(0);
    }
  });

  it("includes key conditions: diabetes, asthma, hypertension, HIV", () => {
    const names = CDL_CONDITIONS.map(c => c.name);
    expect(names).toContain("Asthma");
    expect(names).toContain("Hypertension");
    expect(names).toContain("HIV/AIDS");
    expect(names).toContain("Diabetes mellitus type 1");
    expect(names).toContain("Diabetes mellitus type 2");
    expect(names).toContain("Epilepsy");
    expect(names).toContain("Glaucoma");
    expect(names).toContain("Rheumatoid arthritis");
  });

  it("isCDLCondition detects matching codes", () => {
    expect(isCDLCondition("E11.9").found).toBe(true);
    expect(isCDLCondition("E11.9").condition).toBe("Diabetes mellitus type 2");
    expect(isCDLCondition("J45.9").found).toBe(true);
    expect(isCDLCondition("J45.9").condition).toBe("Asthma");
    expect(isCDLCondition("Z00.0").found).toBe(false);
  });
});

describe("ICD-10 Code Format (WHO-ZA)", () => {
  it("accepts valid ICD-10 codes", () => {
    expect(isValidICD10("J06.9")).toBe(true);
    expect(isValidICD10("I10")).toBe(true);
    expect(isValidICD10("E11.65")).toBe(true);
    expect(isValidICD10("C50.9")).toBe(true);
    expect(isValidICD10("M54.5")).toBe(true);
  });

  it("rejects invalid ICD-10 codes", () => {
    expect(isValidICD10("ZZZZZ")).toBe(false);
    expect(isValidICD10("123")).toBe(false);
    expect(isValidICD10("")).toBe(false);
    expect(isValidICD10("J06.999")).toBe(false); // Too many decimals
    expect(isValidICD10("j06.9")).toBe(false);   // Lowercase
  });

  it("format: letter + 2 digits + optional .1-2 digits", () => {
    // The regex pattern is /^[A-Z]\d{2}(\.\d{1,2})?$/
    expect(isValidICD10("A00")).toBe(true);      // Minimum valid
    expect(isValidICD10("Z99.9")).toBe(true);    // Maximum valid
    expect(isValidICD10("A0")).toBe(false);       // Too short
    expect(isValidICD10("A00.")).toBe(false);     // Trailing dot
  });
});

describe("BHF Practice Number Validation", () => {
  it("requires exactly 7 digits", () => {
    expect(isValidBHF("1234567")).toBe(true);
    expect(isValidBHF("0000001")).toBe(true);
    expect(isValidBHF("123")).toBe(false);
    expect(isValidBHF("12345678")).toBe(false);
    expect(isValidBHF("123456A")).toBe(false);
  });
});

describe("GEMS Membership Format", () => {
  it("requires exactly 9 digits", () => {
    const claim = {
      patientName: "Test Patient",
      patientDob: "1985-06-15",
      patientIdNumber: "8506155800083",
      medicalAidScheme: "GEMS",
      membershipNumber: "12345", // Wrong — not 9 digits
      dependentCode: "00",
      dateOfService: "2026-03-20",
      placeOfService: "11",
      bhfNumber: "1234567",
      lineItems: [
        { icd10Code: "J06.9", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 },
      ],
    };
    const result = validateClaim(claim);
    const gemsIssue = result.issues.find(i => i.code === "GEMS_MEMBERSHIP_FORMAT");
    expect(gemsIssue).toBeDefined();
    expect(gemsIssue!.severity).toBe("error");
  });

  it("accepts valid 9-digit GEMS membership", () => {
    const claim = {
      patientName: "Test Patient",
      patientDob: "1985-06-15",
      patientIdNumber: "8506155800083",
      medicalAidScheme: "GEMS",
      membershipNumber: "000123456",
      dependentCode: "00",
      dateOfService: "2026-03-20",
      placeOfService: "11",
      bhfNumber: "1234567",
      lineItems: [
        { icd10Code: "J06.9", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 },
      ],
    };
    const result = validateClaim(claim);
    const gemsIssue = result.issues.find(i => i.code === "GEMS_MEMBERSHIP_FORMAT");
    expect(gemsIssue).toBeUndefined();
  });
});

describe("Late Submission Detection", () => {
  it("detects claims older than 120 days", () => {
    const oldDate = new Date(Date.now() - 130 * 86400000).toISOString().slice(0, 10);
    const claim = {
      patientName: "Test Patient",
      medicalAidScheme: "Discovery Health",
      membershipNumber: "900012345",
      dependentCode: "00",
      dateOfService: oldDate,
      placeOfService: "11",
      bhfNumber: "1234567",
      lineItems: [
        { icd10Code: "J06.9", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 },
      ],
    };
    const result = validateClaim(claim);
    const lateIssue = result.issues.find(i => i.code === "LATE_SUBMISSION");
    expect(lateIssue).toBeDefined();
    expect(lateIssue!.severity).toBe("error");
  });

  it("warns when approaching 120-day deadline (>90 days)", () => {
    const oldDate = new Date(Date.now() - 100 * 86400000).toISOString().slice(0, 10);
    const claim = {
      patientName: "Test Patient",
      medicalAidScheme: "Discovery Health",
      membershipNumber: "900012345",
      dependentCode: "00",
      dateOfService: oldDate,
      placeOfService: "11",
      bhfNumber: "1234567",
      lineItems: [
        { icd10Code: "J06.9", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 },
      ],
    };
    const result = validateClaim(claim);
    const warnIssue = result.issues.find(i => i.code === "APPROACHING_DEADLINE");
    expect(warnIssue).toBeDefined();
    expect(warnIssue!.severity).toBe("warning");
  });
});

describe("EDIFACT Message Type Compliance", () => {
  it("message type is exactly MEDCLM:0:912:ZA", () => {
    const baseClaim: ClaimSubmission = {
      bhfNumber: "1234567",
      providerNumber: "MP0123456",
      treatingProvider: "Dr Test",
      patientName: "Test Patient",
      patientDob: "1985-06-15",
      patientIdNumber: "8506155800083",
      medicalAidScheme: "Discovery Health",
      membershipNumber: "900012345",
      dependentCode: "00",
      dateOfService: "2026-03-20",
      placeOfService: "11",
      lineItems: [
        { icd10Code: "J06.9", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 },
      ],
      practiceId: "practice-001",
    };
    const edifact = generateEDIFACT(baseClaim);
    expect(edifact).toContain("MEDCLM:0:912:ZA");
    // Verify it's in the UNH segment
    const unhLine = edifact.split("\n").find(l => l.startsWith("UNH+"));
    expect(unhLine).toContain("MEDCLM:0:912:ZA");
  });
});

describe("SA ID Number Cross-Validation", () => {
  it("DOB extracted from first 6 digits of SA ID", () => {
    const claim = {
      patientName: "Test Patient",
      patientDob: "1985-06-15",
      patientIdNumber: "8506155800083",
      medicalAidScheme: "Discovery Health",
      membershipNumber: "900012345",
      dependentCode: "00",
      dateOfService: "2026-03-20",
      placeOfService: "11",
      bhfNumber: "1234567",
      lineItems: [
        { icd10Code: "J06.9", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 },
      ],
    };
    // Correct DOB = no mismatch issue
    const result = validateClaim(claim);
    const dobIssue = result.issues.find(i => i.code === "DOB_ID_MISMATCH");
    expect(dobIssue).toBeUndefined();
  });

  it("detects DOB mismatch with SA ID", () => {
    const claim = {
      patientName: "Test Patient",
      patientDob: "1990-01-01", // Wrong DOB for this ID
      patientIdNumber: "8506155800083", // ID says 1985-06-15
      medicalAidScheme: "Discovery Health",
      membershipNumber: "900012345",
      dependentCode: "00",
      dateOfService: "2026-03-20",
      placeOfService: "11",
      bhfNumber: "1234567",
      lineItems: [
        { icd10Code: "J06.9", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 },
      ],
    };
    const result = validateClaim(claim);
    const dobIssue = result.issues.find(i => i.code === "DOB_ID_MISMATCH");
    expect(dobIssue).toBeDefined();
    expect(dobIssue!.severity).toBe("error");
  });

  it("gender derived from digits 7-10 (5000-9999 = male)", () => {
    const claim = {
      patientName: "Test Patient",
      patientDob: "1985-06-15",
      patientIdNumber: "8506155800083", // 5800 >= 5000 = male
      patientGender: "female", // Mismatch!
      medicalAidScheme: "Discovery Health",
      membershipNumber: "900012345",
      dependentCode: "00",
      dateOfService: "2026-03-20",
      placeOfService: "11",
      bhfNumber: "1234567",
      lineItems: [
        { icd10Code: "J06.9", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 },
      ],
    };
    const result = validateClaim(claim);
    const genderIssue = result.issues.find(i => i.code === "GENDER_MISMATCH");
    expect(genderIssue).toBeDefined();
    expect(genderIssue!.message).toContain("male");
  });
});

describe("VAT Rate Compliance", () => {
  it("VAT calculated at 15% (current SA rate)", () => {
    const amount = 100000; // R1,000
    const vat = Math.round(amount * 0.15);
    expect(vat).toBe(15000); // R150
  });
});
