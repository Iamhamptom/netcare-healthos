import { describe, it, expect } from "vitest";
import {
  generateEDIFACT,
  parseEDIFACT,
  parseEDIFACTResponse,
  validateEDIFACTMessage,
  claimToEDIFACT,
  edifactToClaim,
  generateEDIFACTInterchange,
} from "@/lib/switching/edifact";
import type { ClaimSubmission } from "@/lib/healthbridge/types";

const baseClaim: ClaimSubmission = {
  bhfNumber: "1234567",
  providerNumber: "MP0123456",
  treatingProvider: "Dr Test Provider",
  patientName: "John Mokoena",
  patientDob: "1985-06-15",
  patientIdNumber: "8506155800083",
  medicalAidScheme: "Discovery Health",
  membershipNumber: "900012345",
  dependentCode: "00",
  dateOfService: "2026-03-20",
  placeOfService: "11",
  lineItems: [
    { icd10Code: "J06.9", cptCode: "0190", description: "GP Consultation", quantity: 1, amount: 52000 },
  ],
  practiceId: "practice-001",
};

const multiLineClaim: ClaimSubmission = {
  ...baseClaim,
  lineItems: [
    { icd10Code: "I10", cptCode: "0190", description: "Hypertension consult", quantity: 1, amount: 52000 },
    { icd10Code: "E78.5", cptCode: "0382", description: "Blood glucose test", quantity: 1, amount: 6500 },
    { icd10Code: "I10", cptCode: "0308", description: "ECG", quantity: 1, amount: 35000, nappiCode: "7082280" },
  ],
};

describe("EDIFACT Generator", () => {
  it("generates valid MEDCLM message with UNH and UNT", () => {
    const edifact = generateEDIFACT(baseClaim);
    expect(edifact).toContain("UNH+");
    expect(edifact).toContain("MEDCLM:0:912:ZA");
    expect(edifact).toContain("UNT+");
  });

  it("includes all required NAD segments", () => {
    const edifact = generateEDIFACT(baseClaim);
    expect(edifact).toContain("NAD+SUP+1234567");
    expect(edifact).toContain("NAD+TDN+MP0123456");
    expect(edifact).toContain("NAD+SCH+");
    expect(edifact).toContain("NAD+MPN+900012345");
    expect(edifact).toContain("NAD+MSN+00");
  });

  it("includes line items with tariff and ICD-10 codes", () => {
    const edifact = generateEDIFACT(baseClaim);
    expect(edifact).toContain("LIN+1++0190:SRV");
    expect(edifact).toContain("RFF+ICD:J06.9");
    expect(edifact).toContain("MOA+203:52000");
  });

  it("handles multi-line claims correctly", () => {
    const edifact = generateEDIFACT(multiLineClaim);
    expect(edifact).toContain("LIN+1++0190:SRV");
    expect(edifact).toContain("LIN+2++0382:SRV");
    expect(edifact).toContain("LIN+3++0308:SRV");
    expect(edifact).toContain("7082280:NAP");
  });

  it("includes VAT segments at 15%", () => {
    const edifact = generateEDIFACT(baseClaim);
    expect(edifact).toContain("TAX+7+VAT");
    expect(edifact).toContain("7800");
  });

  it("applies correction type (DCR) when specified", () => {
    const edifact = generateEDIFACT(baseClaim, { correctionType: "ADJ" });
    expect(edifact).toContain("DCR+ADJ");
  });

  it("pads batch number to 18 digits", () => {
    const edifact = generateEDIFACT(baseClaim, { batchNumber: "123" });
    expect(edifact).toContain("BAT:000000000000000123");
  });

  it("escapes special EDIFACT characters", () => {
    const claim = { ...baseClaim, treatingProvider: "Dr O'Brien+Smith:Jr" };
    const edifact = generateEDIFACT(claim);
    expect(edifact).toContain("O?'Brien?+Smith?:Jr");
  });

  it("includes authorization number when provided", () => {
    const edifact = generateEDIFACT({ ...baseClaim, authorizationNumber: "AUTH123" });
    expect(edifact).toContain("RFF+AUT:AUTH123");
  });

  it("segment count in UNT matches actual segment count", () => {
    const edifact = generateEDIFACT(baseClaim);
    const lines = edifact.split("\n").filter(l => l.trim());
    const untLine = lines.find(l => l.startsWith("UNT+"));
    expect(untLine).toBeDefined();
    const untCount = parseInt(untLine!.split("+")[1], 10);
    expect(untCount).toBe(lines.length);
  });
});

describe("EDIFACT Parser", () => {
  it("round-trips: generate then parse", () => {
    const edifact = generateEDIFACT(baseClaim);
    const parsed = parseEDIFACT(edifact);
    expect(parsed.messageType).toBe("MEDCLM:0:912:ZA");
    expect(parsed.parties.length).toBeGreaterThanOrEqual(5);
    expect(parsed.lineItems.length).toBe(1);
    expect(parsed.lineItems[0].tariffCode).toBe("0190");
    expect(parsed.lineItems[0].icd10Codes).toContain("J06.9");
  });

  it("parses multi-line claims correctly", () => {
    const edifact = generateEDIFACT(multiLineClaim);
    const parsed = parseEDIFACT(edifact);
    expect(parsed.lineItems.length).toBe(3);
    expect(parsed.lineItems[2].nappiCode).toBe("7082280");
  });

  it("preserves amounts through round-trip", () => {
    const edifact = generateEDIFACT(baseClaim);
    const parsed = parseEDIFACT(edifact);
    expect(parsed.lineItems[0].amount).toBe(52000);
  });

  it("handles escaped characters in parsing", () => {
    const claim = { ...baseClaim, treatingProvider: "Dr O'Brien" };
    const edifact = generateEDIFACT(claim);
    const parsed = parseEDIFACT(edifact);
    const doctor = parsed.parties.find(p => p.qualifier === "TDN");
    expect(doctor?.name).toBe("Dr O'Brien");
  });

  it("throws on oversized messages (>10MB)", () => {
    const huge = "A".repeat(11_000_000);
    expect(() => parseEDIFACT(huge)).toThrow("too large");
  });

  it("throws on oversized segments (>100KB)", () => {
    const longSegment = "UNH+" + "A".repeat(200_000) + "'";
    expect(() => parseEDIFACT(longSegment)).toThrow("exceeds 100KB");
  });
});

describe("EDIFACT Response Parser", () => {
  it("parses accepted response", () => {
    const raw = "RFF+TRN:HB-12345'\nLIN+1'\nSTS+ACC'\nMOA+203:52000'\n";
    const result = parseEDIFACTResponse(raw);
    expect(result.transactionRef).toBe("HB-12345");
    expect(result.status).toBe("accepted");
    expect(result.lineResponses.length).toBeGreaterThanOrEqual(1);
  });

  it("parses rejected response with code", () => {
    const raw = "RFF+TRN:HB-99999'\nSTS+REJ+05:ICD-10 invalid'\n";
    const result = parseEDIFACTResponse(raw);
    expect(result.status).toBe("rejected");
    expect(result.rejectionCode).toBe("05");
  });

  it("parses partial response", () => {
    const raw = "RFF+TRN:HB-MIX'\nLIN+1'\nSTS+ACC'\nLIN+2'\nSTS+REJ+15:Exceeds tariff'\n";
    const result = parseEDIFACTResponse(raw);
    expect(result.status).toBe("partial");
    expect(result.lineResponses.length).toBe(2);
  });
});

describe("EDIFACT Validation", () => {
  it("validates a correct message", () => {
    const msg = claimToEDIFACT(baseClaim);
    const result = validateEDIFACTMessage(msg);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it("rejects message without supplier", () => {
    const msg = claimToEDIFACT(baseClaim);
    msg.parties = msg.parties.filter(p => p.qualifier !== "SUP");
    const result = validateEDIFACTMessage(msg);
    expect(result.valid).toBe(false);
  });

  it("rejects message without line items", () => {
    const msg = claimToEDIFACT(baseClaim);
    msg.lineItems = [];
    const result = validateEDIFACTMessage(msg);
    expect(result.valid).toBe(false);
  });
});

describe("Claim Conversion", () => {
  it("converts ClaimSubmission to EDIFACTMessage and back", () => {
    const msg = claimToEDIFACT(baseClaim);
    const roundTripped = edifactToClaim(msg, "practice-001");
    expect(roundTripped.bhfNumber).toBe("1234567");
    expect(roundTripped.membershipNumber).toBe("900012345");
    expect(roundTripped.lineItems[0].cptCode).toBe("0190");
  });
});

describe("EDIFACT Interchange", () => {
  it("wraps messages in UNB/UNZ envelope", () => {
    const msg1 = generateEDIFACT(baseClaim, { messageRef: 1 });
    const msg2 = generateEDIFACT(multiLineClaim, { messageRef: 2 });
    const interchange = generateEDIFACTInterchange([msg1, msg2], "1234567", "HEALTHBRIDGE");
    expect(interchange).toContain("UNB+UNOC:3");
    expect(interchange).toContain("UNZ+2");
  });
});
