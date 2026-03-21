// PHISC MEDCLM v0:912:ZA Specification Conformance Tests
// Grounded in: PHISC MEDCLM version 0-912-13.4 (November 2016)
// Tests exact EDIFACT segment structures, separators, qualifiers, amount encoding

import { describe, it, expect } from "vitest";
import {
  generateEDIFACT,
  parseEDIFACT,
  validateEDIFACTMessage,
  claimToEDIFACT,
  parseEDIFACTResponse,
  generateEDIFACTInterchange,
} from "@/lib/switching/edifact";
import type { ClaimSubmission } from "@/lib/healthbridge/types";

const sampleClaim: ClaimSubmission = {
  bhfNumber: "1234567",
  providerNumber: "MP0012345",
  treatingProvider: "Dr N Pillay",
  patientName: "Thabo Mokoena",
  patientDob: "1985-03-15",
  patientIdNumber: "8503155012083",
  medicalAidScheme: "Discovery Health",
  membershipNumber: "DH9012345",
  dependentCode: "00",
  dateOfService: "2026-03-20",
  placeOfService: "11",
  lineItems: [
    { icd10Code: "J06.9", cptCode: "0190", description: "GP consultation URTI", quantity: 1, amount: 52000 },
  ],
  practiceId: "practice-1",
};

describe("PHISC MEDCLM v0:912:ZA Conformance", () => {
  // ── Message Type Identifier ──

  describe("Message Type Identifier", () => {
    it("should use exact message type MEDCLM:0:912:ZA", () => {
      const edifact = generateEDIFACT(sampleClaim);
      expect(edifact).toContain("MEDCLM:0:912:ZA");
    });

    it("should parse message type from UNH segment", () => {
      const edifact = generateEDIFACT(sampleClaim);
      const parsed = parseEDIFACT(edifact);
      expect(parsed.messageType).toBe("MEDCLM:0:912:ZA");
    });
  });

  // ── Segment Separators (PHISC spec) ──

  describe("EDIFACT Separators", () => {
    it("should use apostrophe (') as segment terminator", () => {
      const edifact = generateEDIFACT(sampleClaim);
      const lines = edifact.split("\n");
      for (const line of lines) {
        expect(line.endsWith("'")).toBe(true);
      }
    });

    it("should use plus (+) as data element separator", () => {
      const edifact = generateEDIFACT(sampleClaim);
      // UNH segment uses + to separate elements
      expect(edifact).toMatch(/^UNH\+/m);
    });

    it("should use colon (:) as component element separator", () => {
      const edifact = generateEDIFACT(sampleClaim);
      // LIN segment uses : for tariff code qualifier
      expect(edifact).toContain(":SRV");
    });

    it("should use question mark (?) as release character", () => {
      // Test with data containing special characters
      const claim = {
        ...sampleClaim,
        patientName: "O'Brien",
      };
      const edifact = generateEDIFACT(claim);
      // Apostrophe in name should be escaped with ?
      expect(edifact).toContain("O?'Brien");
    });
  });

  // ── BGM — Batch Number (18 digits, zero-padded) ──

  describe("BGM Segment — Batch Number", () => {
    it("should generate batch number exactly 18 digits, zero-padded", () => {
      const edifact = generateEDIFACT(sampleClaim, { batchNumber: "42" });
      const parsed = parseEDIFACT(edifact);
      expect(parsed.batchNumber.length).toBe(18);
      expect(parsed.batchNumber).toBe("000000000000000042");
    });

    it("should validate batch number length in message validation", () => {
      const msg = claimToEDIFACT(sampleClaim);
      // Force a bad batch number
      msg.batchNumber = "12345";
      const result = validateEDIFACTMessage(msg);
      expect(result.warnings.some(w => w.includes("18 digits"))).toBe(true);
    });
  });

  // ── DTM Qualifiers ──

  describe("DTM Qualifiers", () => {
    it("should use qualifier 194 for admission/service date", () => {
      const edifact = generateEDIFACT(sampleClaim);
      expect(edifact).toContain("DTM+194:");
    });

    it("should use qualifier 155 for period start", () => {
      const edifact = generateEDIFACT(sampleClaim);
      expect(edifact).toContain("DTM+155:");
    });

    it("should parse DTM qualifiers correctly", () => {
      const edifact = generateEDIFACT(sampleClaim);
      const parsed = parseEDIFACT(edifact);
      const admDate = parsed.dates.find(d => d.qualifier === "194");
      expect(admDate).toBeDefined();
      expect(admDate!.date).toBe("20260320");
      expect(admDate!.format).toBe("102"); // CCYYMMDD format
    });
  });

  // ── NAD Qualifiers ──

  describe("NAD Qualifiers (Party Identification)", () => {
    it("should include SUP qualifier for supplier/practice", () => {
      const edifact = generateEDIFACT(sampleClaim);
      expect(edifact).toContain("NAD+SUP+");
    });

    it("should include MPN qualifier for medical plan membership", () => {
      const edifact = generateEDIFACT(sampleClaim);
      expect(edifact).toContain("NAD+MPN+");
    });

    it("should include MSN qualifier for member/patient", () => {
      const edifact = generateEDIFACT(sampleClaim);
      expect(edifact).toContain("NAD+MSN+");
    });

    it("should include SCH qualifier for scheme", () => {
      const edifact = generateEDIFACT(sampleClaim);
      expect(edifact).toContain("NAD+SCH+");
    });

    it("should include TDN qualifier for treating doctor", () => {
      const edifact = generateEDIFACT(sampleClaim);
      expect(edifact).toContain("NAD+TDN+");
    });

    it("should include REG qualifier for SAMDC/HPCSA registration", () => {
      const edifact = generateEDIFACT(sampleClaim);
      expect(edifact).toContain("NAD+REG+");
    });

    it("should validate required parties in message", () => {
      const msg = claimToEDIFACT(sampleClaim);
      msg.parties = []; // Remove all parties
      const result = validateEDIFACTMessage(msg);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes("NAD+SUP"))).toBe(true);
      expect(result.errors.some(e => e.includes("NAD+SCH"))).toBe(true);
      expect(result.errors.some(e => e.includes("NAD+TDN"))).toBe(true);
    });
  });

  // ── MOA — Monetary Amount (two implied decimal places) ──

  describe("MOA Segment — Amount Encoding", () => {
    it("should encode amounts as integers (two implied decimal places, no embedded decimal)", () => {
      const edifact = generateEDIFACT(sampleClaim);
      // R520.00 = 52000 cents → should appear as "52000" not "520.00"
      expect(edifact).toContain("MOA+203:52000");
    });

    it("should encode negative amounts with leading sign", () => {
      const claim = { ...sampleClaim, lineItems: [{ ...sampleClaim.lineItems[0], amount: -10000 }] };
      const edifact = generateEDIFACT(claim);
      // Negative amount should have leading minus
      expect(edifact).toContain("-");
    });
  });

  // ── TAX — VAT at 15% (not 14%) ──

  describe("TAX Segment — VAT", () => {
    it("should use VAT qualifier 135", () => {
      const edifact = generateEDIFACT(sampleClaim);
      expect(edifact).toContain("+135:");
    });

    it("should calculate VAT at 15% (current SA rate, not old 14%)", () => {
      const edifact = generateEDIFACT(sampleClaim);
      // R520.00 * 15% = R78.00 = 7800 cents
      expect(edifact).toContain("7800");
    });
  });

  // ── DCR — Correction Types ──

  describe("DCR Segment — Correction Types", () => {
    it("should support ADJ (amendment) correction type", () => {
      const edifact = generateEDIFACT(sampleClaim, { correctionType: "ADJ" });
      expect(edifact).toContain("DCR+ADJ");
    });

    it("should support ADD (additions) correction type", () => {
      const edifact = generateEDIFACT(sampleClaim, { correctionType: "ADD" });
      expect(edifact).toContain("DCR+ADD");
    });

    it("should support REV (reversal) correction type", () => {
      const edifact = generateEDIFACT(sampleClaim, { correctionType: "REV" });
      expect(edifact).toContain("DCR+REV");
    });

    it("should support RSV (resubmit) correction type", () => {
      const edifact = generateEDIFACT(sampleClaim, { correctionType: "RSV" });
      expect(edifact).toContain("DCR+RSV");
    });

    it("should parse correction type from DCR segment", () => {
      const edifact = generateEDIFACT(sampleClaim, { correctionType: "ADJ" });
      const parsed = parseEDIFACT(edifact);
      expect(parsed.correctionType).toBe("ADJ");
    });
  });

  // ── LIN — Tariff and NAPPI Qualifiers ──

  describe("LIN Segment — Code Qualifiers", () => {
    it("should use SRV qualifier for tariff/CCSA codes", () => {
      const edifact = generateEDIFACT(sampleClaim);
      expect(edifact).toContain(":SRV'");
    });

    it("should use NAP qualifier for NAPPI codes", () => {
      const claim = {
        ...sampleClaim,
        lineItems: [{ ...sampleClaim.lineItems[0], nappiCode: "1234567" }],
      };
      const edifact = generateEDIFACT(claim);
      expect(edifact).toContain(":NAP'");
    });
  });

  // ── UNT — Segment Count ──

  describe("UNT Segment — Segment Count", () => {
    it("should include UNH and UNT in segment count", () => {
      const edifact = generateEDIFACT(sampleClaim);
      const parsed = parseEDIFACT(edifact);
      // Count actual segments in generated EDIFACT
      const segmentCount = edifact.split("'").filter(s => s.trim().length > 0).length;
      // UNT segment should contain this count
      const untMatch = edifact.match(/UNT\+(\d+)\+/);
      expect(untMatch).not.toBeNull();
      expect(parseInt(untMatch![1])).toBe(segmentCount);
    });
  });

  // ── Response Parsing ──

  describe("Response Parsing", () => {
    it("should parse accepted response", () => {
      // STS+ACC only counts when curLine > 0 (after a LIN segment)
      const response = "RFF+TRN:REF123'\nLIN+1'\nSTS+ACC'\nMOA+9:52000'";
      const result = parseEDIFACTResponse(response);
      expect(result.transactionRef).toBe("REF123");
      expect(result.status).toBe("accepted");
      expect(result.lineResponses[0].status).toBe("accepted");
    });

    it("should parse rejected response with reason code", () => {
      const response = "RFF+TRN:REF456'\nSTS+REJ+05:ICD-10 invalid'";
      const result = parseEDIFACTResponse(response);
      expect(result.status).toBe("rejected");
      expect(result.rejectionCode).toBe("05");
    });

    it("should detect partial status (mix of accepted and rejected lines)", () => {
      const response = "RFF+TRN:REF789'\nLIN+1'\nSTS+ACC'\nLIN+2'\nSTS+REJ+07:Benefit exhausted'";
      const result = parseEDIFACTResponse(response);
      expect(result.status).toBe("partial");
      expect(result.lineResponses.length).toBe(2);
    });
  });

  // ── Interchange Envelope ──

  describe("Interchange Envelope (UNB/UNZ)", () => {
    it("should wrap messages in UNB/UNZ interchange envelope", () => {
      const msg = generateEDIFACT(sampleClaim);
      const interchange = generateEDIFACTInterchange([msg], "PRACTICE1", "HEALTHBRIDGE");
      expect(interchange).toMatch(/^UNB\+/);
      expect(interchange).toMatch(/UNZ\+/);
    });

    it("should include correct message count in UNZ", () => {
      const msg1 = generateEDIFACT(sampleClaim);
      const msg2 = generateEDIFACT({ ...sampleClaim, membershipNumber: "DH9999" });
      const interchange = generateEDIFACTInterchange([msg1, msg2], "PRACTICE1", "HEALTHBRIDGE");
      expect(interchange).toContain("UNZ+2+");
    });
  });
});
