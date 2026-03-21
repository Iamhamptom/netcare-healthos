import { describe, it, expect } from "vitest";
import {
  checkPreAuthRequired,
  createPreAuthRequest,
  isPreAuthValid,
} from "@/lib/switching/preauth";

describe("Pre-Authorization Engine", () => {
  describe("Pre-Auth Requirements Check", () => {
    it("requires pre-auth for MRI scans", () => {
      const result = checkPreAuthRequired({
        cptCodes: ["0500"],
        icd10Codes: ["M54.5"],
        scheme: "Discovery Health",
        estimatedCost: 350000,
      });
      expect(result.required).toBe(true);
      expect(result.categories).toContain("mri_ct_scan");
    });

    it("requires pre-auth for hospital admissions", () => {
      const result = checkPreAuthRequired({
        cptCodes: ["3600"],
        icd10Codes: ["M54.5"], // Back pain — NOT a PMB, so pre-auth applies
        scheme: "Bonitas",
        estimatedCost: 1500000,
      });
      expect(result.required).toBe(true);
      expect(result.categories).toContain("hospital_admission");
    });

    it("requires pre-auth for surgeries", () => {
      const result = checkPreAuthRequired({
        cptCodes: ["0800"],
        icd10Codes: ["M17.1"], // Knee osteoarthritis — NOT a PMB
        scheme: "GEMS",
        estimatedCost: 2000000,
      });
      expect(result.required).toBe(true);
      expect(result.categories).toContain("surgery");
    });

    it("does NOT require pre-auth for simple GP consultation", () => {
      const result = checkPreAuthRequired({
        cptCodes: ["0190"],
        icd10Codes: ["J06.9"],
        scheme: "Discovery Health",
        estimatedCost: 52000,
      });
      expect(result.required).toBe(false);
    });

    it("detects PMB condition and exempts from pre-auth", () => {
      const result = checkPreAuthRequired({
        cptCodes: ["0190"],
        icd10Codes: ["I21.9"], // Acute MI — PMB
        scheme: "Discovery Health",
        estimatedCost: 52000,
      });
      expect(result.pmbExempt).toBe(true);
      expect(result.pmbConditions).toContain("I21.9");
    });

    it("detects CDL condition", () => {
      const result = checkPreAuthRequired({
        cptCodes: ["0190"],
        icd10Codes: ["E11.9"], // Type 2 diabetes — CDL
        scheme: "Bonitas",
        estimatedCost: 52000,
      });
      expect(result.cdlExempt).toBe(true);
    });

    it("flags high-cost procedures (>R5,000)", () => {
      const result = checkPreAuthRequired({
        cptCodes: ["0199"], // Non-matching code
        icd10Codes: ["J06.9"],
        scheme: "Discovery Health",
        estimatedCost: 600000, // R6,000
      });
      expect(result.required).toBe(true);
      expect(result.categories).toContain("high_cost");
    });

    it("detects oncology cases", () => {
      const result = checkPreAuthRequired({
        cptCodes: ["0900"],
        icd10Codes: ["C50.9"], // Breast cancer
        scheme: "Discovery Health",
        estimatedCost: 5000000,
      });
      expect(result.oncologyCase).toBe(true);
      // Oncology always requires pre-auth even if PMB
      expect(result.required).toBe(true);
    });

    it("handles empty CPT codes gracefully", () => {
      const result = checkPreAuthRequired({
        cptCodes: [],
        icd10Codes: ["J06.9"],
        scheme: "Discovery Health",
        estimatedCost: 0,
      });
      expect(result.required).toBe(false);
    });
  });

  describe("Pre-Auth Request Creation", () => {
    it("creates request with unique ID", () => {
      const req = createPreAuthRequest({
        practiceId: "p-001",
        bhfNumber: "1234567",
        providerNumber: "MP0123456",
        patientName: "Test Patient",
        patientDob: "1985-01-01",
        patientIdNumber: "8501010800083",
        membershipNumber: "900012345",
        dependentCode: "00",
        medicalAidScheme: "Discovery Health",
        icd10Codes: ["M54.5"],
        cptCodes: ["0500"],
        procedureDescription: "MRI lumbar spine",
        clinicalMotivation: "Persistent lower back pain >6 weeks",
        urgency: "elective",
        estimatedCost: 350000,
      });
      expect(req.id).toMatch(/^PA-/);
      expect(req.status).toBe("pending");
      expect(req.switchProvider).toBeDefined();
    });
  });

  describe("Pre-Auth Validity", () => {
    it("returns false for pending pre-auth", () => {
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
        procedureDescription: "Test",
        clinicalMotivation: "Test",
        urgency: "elective",
        estimatedCost: 350000,
      });
      expect(isPreAuthValid(req)).toBe(false);
    });

    it("returns true for approved pre-auth within validity", () => {
      const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
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
        procedureDescription: "Test",
        clinicalMotivation: "Test",
        urgency: "elective",
        estimatedCost: 350000,
      });
      req.status = "approved";
      req.validTo = tomorrow;
      expect(isPreAuthValid(req)).toBe(true);
    });

    it("returns false for expired pre-auth", () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
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
        procedureDescription: "Test",
        clinicalMotivation: "Test",
        urgency: "elective",
        estimatedCost: 350000,
      });
      req.status = "approved";
      req.validTo = yesterday;
      expect(isPreAuthValid(req)).toBe(false);
    });
  });
});
