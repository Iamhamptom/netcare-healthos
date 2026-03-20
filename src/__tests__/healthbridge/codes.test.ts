import { describe, it, expect } from "vitest";
import { isValidICD10, isValidCPT, isValidBHF, isValidNAPPI, formatZAR, parseZARToCents } from "@/lib/healthbridge/codes";

describe("SA Healthcare Code Validation", () => {
  describe("ICD-10 validation", () => {
    it("should accept valid codes", () => {
      expect(isValidICD10("I10")).toBe(true);
      expect(isValidICD10("J06.9")).toBe(true);
      expect(isValidICD10("E11.65")).toBe(true);
      expect(isValidICD10("Z00.0")).toBe(true);
    });
    it("should reject invalid codes", () => {
      expect(isValidICD10("")).toBe(false);
      expect(isValidICD10("123")).toBe(false);
      expect(isValidICD10("ABCD")).toBe(false);
      expect(isValidICD10("I1")).toBe(false);
    });
  });

  describe("CPT validation", () => {
    it("should accept 4-digit codes", () => {
      expect(isValidCPT("0190")).toBe(true);
      expect(isValidCPT("8101")).toBe(true);
    });
    it("should reject non-4-digit codes", () => {
      expect(isValidCPT("190")).toBe(false);
      expect(isValidCPT("01901")).toBe(false);
      expect(isValidCPT("ABCD")).toBe(false);
    });
  });

  describe("BHF validation", () => {
    it("should accept 7-digit codes", () => {
      expect(isValidBHF("1234567")).toBe(true);
    });
    it("should reject non-7-digit codes", () => {
      expect(isValidBHF("123456")).toBe(false);
      expect(isValidBHF("12345678")).toBe(false);
    });
  });

  describe("NAPPI validation", () => {
    it("should accept up to 13-digit codes", () => {
      expect(isValidNAPPI("7081709001")).toBe(true);
      expect(isValidNAPPI("1")).toBe(true);
    });
    it("should reject non-numeric", () => {
      expect(isValidNAPPI("ABC")).toBe(false);
    });
  });

  describe("ZAR formatting", () => {
    it("should format cents to ZAR", () => {
      expect(formatZAR(52000)).toBe("R 520.00");
      expect(formatZAR(0)).toBe("R 0.00");
      expect(formatZAR(150)).toBe("R 1.50");
    });
    it("should parse ZAR to cents", () => {
      expect(parseZARToCents("520")).toBe(52000);
      expect(parseZARToCents("R 520.00")).toBe(52000);
      expect(parseZARToCents(520)).toBe(52000);
    });
  });
});
