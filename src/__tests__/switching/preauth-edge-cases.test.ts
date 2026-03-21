import { describe, it, expect } from "vitest";
import {
  checkPreAuthRequired,
  createPreAuthRequest,
  isPreAuthValid,
} from "@/lib/switching/preauth";

describe("Pre-Auth — All 9 Categories Individually", () => {
  it("specialist_referral: CPT 0141 triggers", () => {
    const result = checkPreAuthRequired({
      cptCodes: ["0141"],
      icd10Codes: ["M54.5"],
      scheme: "Discovery Health",
      estimatedCost: 95000,
    });
    expect(result.categories).toContain("specialist_referral");
  });

  it("mri_ct_scan: CPT 0500 triggers", () => {
    const result = checkPreAuthRequired({
      cptCodes: ["0500"],
      icd10Codes: ["M54.5"],
      scheme: "Discovery Health",
      estimatedCost: 350000,
    });
    expect(result.required).toBe(true);
    expect(result.categories).toContain("mri_ct_scan");
  });

  it("hospital_admission: CPT 3600 triggers", () => {
    const result = checkPreAuthRequired({
      cptCodes: ["3600"],
      icd10Codes: ["M54.5"],
      scheme: "GEMS",
      estimatedCost: 1500000,
    });
    expect(result.required).toBe(true);
    expect(result.categories).toContain("hospital_admission");
  });

  it("surgery: CPT 0800 triggers", () => {
    const result = checkPreAuthRequired({
      cptCodes: ["0800"],
      icd10Codes: ["M17.1"],
      scheme: "Bonitas",
      estimatedCost: 2000000,
    });
    expect(result.required).toBe(true);
    expect(result.categories).toContain("surgery");
  });

  it("physiotherapy: CPT 0600 triggers (with session threshold)", () => {
    const result = checkPreAuthRequired({
      cptCodes: ["0600"],
      icd10Codes: ["M54.5"],
      scheme: "Discovery Health",
      estimatedCost: 30000,
      sessionsUsed: 7,
    });
    expect(result.categories).toContain("physiotherapy");
  });

  it("psychology: CPT 0700 triggers (with session threshold)", () => {
    const result = checkPreAuthRequired({
      cptCodes: ["0700"],
      icd10Codes: ["F32.2"],
      scheme: "Discovery Health",
      estimatedCost: 80000,
      sessionsUsed: 7,
    });
    expect(result.categories).toContain("psychology");
  });

  it("high_cost: R6,000 (600000 cents) triggers", () => {
    const result = checkPreAuthRequired({
      cptCodes: ["0199"],
      icd10Codes: ["J06.9"],
      scheme: "Discovery Health",
      estimatedCost: 600000,
    });
    expect(result.required).toBe(true);
    expect(result.categories).toContain("high_cost");
  });

  it("chronic_medication: CPT 0191 + CDL ICD + isChronicInitiation triggers", () => {
    const result = checkPreAuthRequired({
      cptCodes: ["0191"],
      icd10Codes: ["E11.9"],
      scheme: "Discovery Health",
      estimatedCost: 52000,
      isChronicInitiation: true,
    });
    expect(result.categories).toContain("chronic_medication");
  });

  it("oncology: CPT 0900 + C-code triggers", () => {
    const result = checkPreAuthRequired({
      cptCodes: ["0900"],
      icd10Codes: ["C50.9"],
      scheme: "Discovery Health",
      estimatedCost: 5000000,
    });
    expect(result.required).toBe(true);
    expect(result.oncologyCase).toBe(true);
    expect(result.categories).toContain("oncology");
  });
});

describe("Pre-Auth — Physio Session Threshold Boundary", () => {
  it("physio at exactly 6 sessions (boundary): needs pre-auth", () => {
    const result = checkPreAuthRequired({
      cptCodes: ["0600"],
      icd10Codes: ["M54.5"],
      scheme: "Discovery Health",
      estimatedCost: 30000,
      sessionsUsed: 6,
    });
    expect(result.categories).toContain("physiotherapy");
  });

  it("physio at 5 sessions (under threshold): no physio pre-auth", () => {
    const result = checkPreAuthRequired({
      cptCodes: ["0600"],
      icd10Codes: ["M54.5"],
      scheme: "Discovery Health",
      estimatedCost: 30000,
      sessionsUsed: 5,
    });
    expect(result.categories).not.toContain("physiotherapy");
  });

  it("physio at 7 sessions (over threshold): needs pre-auth", () => {
    const result = checkPreAuthRequired({
      cptCodes: ["0600"],
      icd10Codes: ["M54.5"],
      scheme: "Discovery Health",
      estimatedCost: 30000,
      sessionsUsed: 7,
    });
    expect(result.categories).toContain("physiotherapy");
  });
});

describe("Pre-Auth — Chronic Medication Logic", () => {
  it("CDL condition WITHOUT isChronicInitiation does NOT trigger chronic_medication category", () => {
    const result = checkPreAuthRequired({
      cptCodes: ["0191"],
      icd10Codes: ["E11.9"],
      scheme: "Discovery Health",
      estimatedCost: 52000,
    });
    expect(result.categories).not.toContain("chronic_medication");
    // But CDL should still be detected
    expect(result.cdlExempt).toBe(true);
  });

  it("chronic medication follow-up (not initiation) does not trigger", () => {
    const result = checkPreAuthRequired({
      cptCodes: ["0191"],
      icd10Codes: ["I10"],
      scheme: "Bonitas",
      estimatedCost: 36000,
      isChronicInitiation: false,
    });
    expect(result.categories).not.toContain("chronic_medication");
  });
});

describe("Pre-Auth — PMB Exemption Logic", () => {
  it("PMB (I21.9 heart attack) overrides MRI pre-auth requirement", () => {
    const result = checkPreAuthRequired({
      cptCodes: ["0500"],
      icd10Codes: ["I21.9"],
      scheme: "Discovery Health",
      estimatedCost: 350000,
    });
    expect(result.pmbExempt).toBe(true);
    // PMB should override pre-auth for non-oncology
    expect(result.required).toBe(false);
  });

  it("PMB does NOT override oncology pre-auth", () => {
    const result = checkPreAuthRequired({
      cptCodes: ["0900"],
      icd10Codes: ["C50.9"],
      scheme: "Discovery Health",
      estimatedCost: 5000000,
    });
    expect(result.pmbExempt).toBe(true);
    expect(result.oncologyCase).toBe(true);
    // Oncology always requires pre-auth even if PMB
    expect(result.required).toBe(true);
  });

  it("multiple categories triggered simultaneously", () => {
    const result = checkPreAuthRequired({
      cptCodes: ["0500", "3600", "0800"],
      icd10Codes: ["M54.5"],
      scheme: "GEMS",
      estimatedCost: 5000000,
    });
    expect(result.required).toBe(true);
    expect(result.categories).toContain("mri_ct_scan");
    expect(result.categories).toContain("hospital_admission");
    expect(result.categories).toContain("surgery");
  });
});

describe("Pre-Auth — Emergency Urgency", () => {
  it("emergency urgency is preserved in request", () => {
    const req = createPreAuthRequest({
      practiceId: "p-001",
      bhfNumber: "1234567",
      providerNumber: "MP0123456",
      patientName: "Emergency Patient",
      patientDob: "1985-01-01",
      patientIdNumber: "8501010800083",
      membershipNumber: "900012345",
      dependentCode: "00",
      medicalAidScheme: "Discovery Health",
      icd10Codes: ["I21.9"],
      cptCodes: ["3600"],
      procedureDescription: "Emergency cardiac admission",
      clinicalMotivation: "Acute MI",
      urgency: "emergency",
      estimatedCost: 5000000,
    });
    expect(req.urgency).toBe("emergency");
    expect(req.id).toMatch(/^PA-/);
  });
});

describe("Pre-Auth — Cost Boundary", () => {
  it("cost exactly at R5,000 (500000 cents) does NOT trigger high_cost", () => {
    const result = checkPreAuthRequired({
      cptCodes: ["0199"],
      icd10Codes: ["J06.9"],
      scheme: "Discovery Health",
      estimatedCost: 500000,
    });
    expect(result.categories || []).not.toContain("high_cost");
  });

  it("cost at R5,001 (500100 cents) DOES trigger high_cost", () => {
    const result = checkPreAuthRequired({
      cptCodes: ["0199"],
      icd10Codes: ["J06.9"],
      scheme: "Discovery Health",
      estimatedCost: 500100,
    });
    expect(result.required).toBe(true);
    expect(result.categories).toContain("high_cost");
  });
});

describe("Pre-Auth — Empty Code Arrays", () => {
  it("empty ICD-10 codes with populated CPT codes", () => {
    const result = checkPreAuthRequired({
      cptCodes: ["0500"],
      icd10Codes: [],
      scheme: "Discovery Health",
      estimatedCost: 350000,
    });
    expect(result.required).toBe(true);
    expect(result.pmbExempt).toBe(false);
  });

  it("empty CPT codes with populated ICD-10 codes (oncology ICD triggers)", () => {
    const result = checkPreAuthRequired({
      cptCodes: [],
      icd10Codes: ["C50.9"],
      scheme: "Discovery Health",
      estimatedCost: 5000000,
    });
    // Oncology is matched by ICD-10 pattern even without CPT
    expect(result.oncologyCase).toBe(true);
  });
});

describe("Pre-Auth — Oncology C-codes Coverage", () => {
  it.each(["C00", "C18.9", "C34.9", "C50.9", "C61", "C73", "C80", "C97"])(
    "oncology ICD-10 %s triggers oncology detection",
    (code) => {
      const result = checkPreAuthRequired({
        cptCodes: ["0900"],
        icd10Codes: [code],
        scheme: "Discovery Health",
        estimatedCost: 1000000,
      });
      expect(result.oncologyCase).toBe(true);
    },
  );
});

describe("Pre-Auth — Validity Checks", () => {
  it("approved pre-auth with no validTo date is considered valid", () => {
    const req = createPreAuthRequest({
      practiceId: "p-001",
      bhfNumber: "1234567",
      providerNumber: "MP0123456",
      patientName: "Test",
      patientDob: "1985-01-01",
      patientIdNumber: "8501010800083",
      membershipNumber: "900012345",
      dependentCode: "00",
      medicalAidScheme: "Discovery Health",
      icd10Codes: ["M54.5"],
      cptCodes: ["0500"],
      procedureDescription: "MRI",
      clinicalMotivation: "Pain",
      urgency: "elective",
      estimatedCost: 350000,
    });
    req.status = "approved";
    // No validTo set — should be considered valid
    expect(isPreAuthValid(req)).toBe(true);
  });
});
