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

describe("EDIFACT Boundary — Empty & Minimal Input", () => {
  it("parseEDIFACT handles empty string without throwing", () => {
    const result = parseEDIFACT("");
    expect(result.lineItems).toHaveLength(0);
    expect(result.parties).toHaveLength(0);
  });

  it("parseEDIFACT handles single UNH segment only", () => {
    const result = parseEDIFACT("UNH+0000001+MEDCLM:0:912:ZA'");
    expect(result.messageRef).toBe("0000001");
    expect(result.lineItems).toHaveLength(0);
  });

  it("parseEDIFACT handles segment with tag only (no data elements)", () => {
    const result = parseEDIFACT("UNH'");
    expect(result.messageRef).toBe("");
  });

  it("validates empty line items array as invalid", () => {
    const msg = claimToEDIFACT(baseClaim);
    msg.lineItems = [];
    const result = validateEDIFACTMessage(msg);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes("line item"))).toBe(true);
  });
});

describe("EDIFACT Boundary — Large Messages", () => {
  it("handles claim with many line items (50)", () => {
    const manyItems = Array.from({ length: 50 }, (_, i) => ({
      icd10Code: "J06.9",
      cptCode: "0190",
      description: `Item ${i + 1}`,
      quantity: 1,
      amount: 10000,
    }));
    const claim = { ...baseClaim, lineItems: manyItems };
    const edifact = generateEDIFACT(claim);
    const parsed = parseEDIFACT(edifact);
    expect(parsed.lineItems).toHaveLength(50);
  });

  it("interchange with 0 messages generates valid UNB/UNZ", () => {
    const interchange = generateEDIFACTInterchange([], "1234567", "HEALTHBRIDGE");
    expect(interchange).toContain("UNB+UNOC:3");
    expect(interchange).toContain("UNZ+0");
  });

  it("interchange with 1 message wraps correctly", () => {
    const msg = generateEDIFACT(baseClaim, { messageRef: 1 });
    const interchange = generateEDIFACTInterchange([msg], "1234567", "HEALTHBRIDGE");
    expect(interchange).toContain("UNZ+1");
  });
});

describe("EDIFACT Boundary — Unicode & SA Names", () => {
  it("handles Zulu name with no diacritics", () => {
    const claim = { ...baseClaim, patientName: "Nkululeko Nciza" };
    const edifact = generateEDIFACT(claim);
    const parsed = parseEDIFACT(edifact);
    const pat = parsed.parties.find(p => p.qualifier === "MSN");
    expect(pat?.name).toBe("Nkululeko Nciza");
  });

  it("handles Afrikaans name with apostrophe", () => {
    const claim = { ...baseClaim, patientName: "Du Plessis' Kind" };
    const edifact = generateEDIFACT(claim);
    expect(edifact).toContain("Plessis?'");
    const parsed = parseEDIFACT(edifact);
    const pat = parsed.parties.find(p => p.qualifier === "MSN");
    expect(pat?.name).toBe("Du Plessis' Kind");
  });

  it("handles name with colon and plus (edge escape)", () => {
    const claim = { ...baseClaim, treatingProvider: "Dr A+B:C" };
    const edifact = generateEDIFACT(claim);
    expect(edifact).toContain("A?+B?:C");
  });
});

describe("EDIFACT Boundary — Release Character Edge Cases", () => {
  it("consecutive release characters (?? becomes single ? in parse)", () => {
    const claim = { ...baseClaim, treatingProvider: "Dr Test?" };
    const edifact = generateEDIFACT(claim);
    expect(edifact).toContain("Test??");
    const parsed = parseEDIFACT(edifact);
    const doc = parsed.parties.find(p => p.qualifier === "TDN");
    expect(doc?.name).toBe("Dr Test?");
  });
});

describe("EDIFACT Boundary — ICD-10 & Line Items", () => {
  it("multiple ICD-10 codes parsed per line item (from separate RFF+ICD segments)", () => {
    // Build a raw EDIFACT with two RFF+ICD segments for the same LIN
    const raw = [
      "UNH+0000001+MEDCLM:0:912:ZA'",
      "LIN+1++0190:SRV'",
      "RFF+ICD:J06.9'",
      "RFF+ICD:I10'",
      "QTY+47:1'",
      "MOA+203:52000'",
      "UNT+6+0000001'",
    ].join("\n");
    const parsed = parseEDIFACT(raw);
    expect(parsed.lineItems).toHaveLength(1);
    expect(parsed.lineItems[0].icd10Codes).toContain("J06.9");
    expect(parsed.lineItems[0].icd10Codes).toContain("I10");
  });

  it("zero quantity line item is parsed correctly", () => {
    const raw = [
      "UNH+0000001+MEDCLM:0:912:ZA'",
      "LIN+1++0190:SRV'",
      "RFF+ICD:J06.9'",
      "QTY+47:0'",
      "MOA+203:0'",
      "UNT+5+0000001'",
    ].join("\n");
    const parsed = parseEDIFACT(raw);
    expect(parsed.lineItems[0].quantity).toBe(0);
    expect(parsed.lineItems[0].amount).toBe(0);
  });

  it("negative amount (credit note) is parsed correctly", () => {
    const raw = [
      "UNH+0000001+MEDCLM:0:912:ZA'",
      "LIN+1++0190:SRV'",
      "RFF+ICD:J06.9'",
      "QTY+47:1'",
      "MOA+203:-52000'",
      "UNT+5+0000001'",
    ].join("\n");
    const parsed = parseEDIFACT(raw);
    expect(parsed.lineItems[0].amount).toBe(-52000);
  });
});

describe("EDIFACT Boundary — Date Edge Cases", () => {
  it("handles leap year date Feb 29", () => {
    const claim = { ...baseClaim, dateOfService: "2024-02-29" };
    const edifact = generateEDIFACT(claim);
    expect(edifact).toContain("20240229");
  });

  it("handles year 2000 date", () => {
    const claim = { ...baseClaim, patientDob: "2000-01-01", dateOfService: "2026-03-20" };
    const edifact = generateEDIFACT(claim);
    expect(edifact).toContain("20000101");
  });
});

describe("EDIFACT Boundary — Batch Number Validation", () => {
  it("batch number exactly 18 digits passes validation", () => {
    const msg = claimToEDIFACT(baseClaim);
    msg.batchNumber = "123456789012345678";
    const result = validateEDIFACTMessage(msg);
    const batchWarning = result.warnings.find(w => w.includes("Batch number"));
    expect(batchWarning).toBeUndefined();
  });

  it("batch number 17 digits triggers warning", () => {
    const msg = claimToEDIFACT(baseClaim);
    msg.batchNumber = "12345678901234567";
    const result = validateEDIFACTMessage(msg);
    const batchWarning = result.warnings.find(w => w.includes("Batch number"));
    expect(batchWarning).toBeDefined();
  });

  it("batch number 19 digits triggers warning", () => {
    const msg = claimToEDIFACT(baseClaim);
    msg.batchNumber = "1234567890123456789";
    const result = validateEDIFACTMessage(msg);
    const batchWarning = result.warnings.find(w => w.includes("Batch number"));
    expect(batchWarning).toBeDefined();
  });
});

describe("EDIFACT Boundary — Correction Types", () => {
  it.each(["ADJ", "ADD", "REV", "RSV"] as const)("correction type %s generates DCR segment", (type) => {
    const edifact = generateEDIFACT(baseClaim, { correctionType: type });
    expect(edifact).toContain(`DCR+${type}`);
    const parsed = parseEDIFACT(edifact);
    expect(parsed.correctionType).toBe(type);
  });
});

describe("EDIFACT Boundary — Place of Service", () => {
  it.each(["11", "12", "21", "22", "23", "31", "41", "50", "65", "81"])(
    "place of service code %s generates valid LOC segment",
    (code) => {
      const claim = { ...baseClaim, placeOfService: code };
      const edifact = generateEDIFACT(claim);
      expect(edifact).toContain(`LOC+${code}`);
    },
  );
});

describe("EDIFACT Boundary — Message Reference Overflow", () => {
  it("message reference pads to 7 digits", () => {
    const edifact = generateEDIFACT(baseClaim, { messageRef: 1 });
    expect(edifact).toContain("UNH+0000001");
  });

  it("large message reference (9999999) is represented correctly", () => {
    const edifact = generateEDIFACT(baseClaim, { messageRef: 9999999 });
    expect(edifact).toContain("UNH+9999999");
  });

  it("message reference >9999999 still works (10000000)", () => {
    const edifact = generateEDIFACT(baseClaim, { messageRef: 10000000 });
    expect(edifact).toContain("UNH+10000000");
  });
});

describe("EDIFACT Boundary — Response Parser Edge Cases", () => {
  it("response with no STS segments returns pending", () => {
    const result = parseEDIFACTResponse("RFF+TRN:HB-12345'");
    expect(result.status).toBe("pending");
    expect(result.transactionRef).toBe("HB-12345");
  });

  it("empty response string returns pending with empty ref", () => {
    const result = parseEDIFACTResponse("");
    expect(result.status).toBe("pending");
    expect(result.transactionRef).toBe("");
  });

  it("response with MOA at message level sets approvedAmount", () => {
    const raw = "RFF+TRN:HB-100'\nMOA+203:75000'\nSTS+ACC'\n";
    const result = parseEDIFACTResponse(raw);
    expect(result.approvedAmount).toBe(75000);
  });
});
