import { describe, it, expect } from "vitest";
import { isPMBCondition, isCDLCondition, getPMBStatus } from "@/lib/healthbridge/pmb";

describe("PMB & CDL Detection", () => {
  describe("isPMBCondition", () => {
    it("should detect listed PMB codes", () => {
      expect(isPMBCondition("I10")).toBe(true); // Hypertension
      expect(isPMBCondition("E11.9")).toBe(true); // Diabetes type 2
      expect(isPMBCondition("B20")).toBe(true); // HIV
      expect(isPMBCondition("I21.9")).toBe(true); // Heart attack
    });
    it("should detect all cancers (C-codes) as PMBs", () => {
      expect(isPMBCondition("C50.9")).toBe(true); // Breast cancer
      expect(isPMBCondition("C34.1")).toBe(true); // Lung cancer
      expect(isPMBCondition("C99")).toBe(true); // Any C-code
    });
    it("should detect maternity as PMBs", () => {
      expect(isPMBCondition("O80")).toBe(true); // Normal delivery
      expect(isPMBCondition("O82")).toBe(true); // C-section
    });
    it("should detect trauma/injury as PMBs", () => {
      expect(isPMBCondition("S72.0")).toBe(true); // Hip fracture
      expect(isPMBCondition("T78.2")).toBe(true); // Anaphylaxis
    });
    it("should not flag non-PMB conditions", () => {
      expect(isPMBCondition("J06.9")).toBe(false); // Common cold
      expect(isPMBCondition("K29.7")).toBe(false); // Gastritis
      expect(isPMBCondition("L30.9")).toBe(false); // Dermatitis
    });
  });

  describe("isCDLCondition", () => {
    it("should detect CDL chronic conditions", () => {
      expect(isCDLCondition("E11.9").found).toBe(true); // Diabetes type 2
      expect(isCDLCondition("E11.9").condition).toBe("Diabetes mellitus type 2");
      expect(isCDLCondition("J45.9").found).toBe(true); // Asthma
      expect(isCDLCondition("G40.0").found).toBe(true); // Epilepsy
      expect(isCDLCondition("B20").found).toBe(true); // HIV
    });
    it("should not flag non-CDL conditions", () => {
      expect(isCDLCondition("J06.9").found).toBe(false);
      expect(isCDLCondition("R51").found).toBe(false);
    });
  });

  describe("getPMBStatus", () => {
    it("should summarize PMB + CDL for multiple codes", () => {
      const result = getPMBStatus(["I10", "E11.9", "J06.9"]);
      expect(result.hasPMB).toBe(true);
      expect(result.hasCDL).toBe(true);
      expect(result.pmbConditions.length).toBe(2); // I10, E11.9
      expect(result.coverageNote).toContain("PMB + CDL");
    });
    it("should return empty for non-PMB codes", () => {
      const result = getPMBStatus(["J06.9", "R51"]);
      expect(result.hasPMB).toBe(false);
      expect(result.hasCDL).toBe(false);
      expect(result.coverageNote).toBe("");
    });
  });
});
