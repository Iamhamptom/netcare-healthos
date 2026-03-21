import { describe, it, expect } from "vitest";
import { buildClaimXML, buildEligibilityXML, buildReversalXML } from "@/lib/healthbridge/xml";
import type { ClaimSubmission } from "@/lib/healthbridge/types";

const baseClaim: ClaimSubmission = {
  bhfNumber: "1234567",
  providerNumber: "MP12345",
  treatingProvider: "Dr Smith",
  patientName: "John Mokoena",
  patientDob: "1985-06-15",
  patientIdNumber: "8506155012089",
  medicalAidScheme: "Discovery Health",
  membershipNumber: "900012345",
  dependentCode: "00",
  dateOfService: "2026-03-20",
  placeOfService: "11",
  practiceId: "practice-1",
  lineItems: [
    { icd10Code: "I10", cptCode: "0190", description: "GP consultation", quantity: 1, amount: 52000 },
  ],
};

describe("XML Builder — buildClaimXML", () => {
  it("should produce valid XML structure for a basic claim", () => {
    const xml = buildClaimXML(baseClaim);
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain("<ClaimSubmission");
    expect(xml).toContain("<TransactionType>CLAIM</TransactionType>");
    expect(xml).toContain("<PracticeNumber>1234567</PracticeNumber>");
    expect(xml).toContain("<Name>John Mokoena</Name>");
    expect(xml).toContain("<ICD10Code>I10</ICD10Code>");
    expect(xml).toContain("<CPTCode>0190</CPTCode>");
    expect(xml).toContain("<Quantity>1</Quantity>");
    expect(xml).toContain("<Amount>52000</Amount>");
  });

  it("should escape special XML characters in patient names (ampersand)", () => {
    const claim = { ...baseClaim, patientName: "Johnson & Johnson" };
    const xml = buildClaimXML(claim);
    expect(xml).toContain("<Name>Johnson &amp; Johnson</Name>");
    expect(xml).not.toContain("<Name>Johnson & Johnson</Name>");
  });

  it("should escape apostrophes (O'Brien)", () => {
    const claim = { ...baseClaim, patientName: "Sean O'Brien" };
    const xml = buildClaimXML(claim);
    expect(xml).toContain("O&apos;Brien");
  });

  it("should escape angle brackets in descriptions", () => {
    const claim = {
      ...baseClaim,
      lineItems: [
        { icd10Code: "I10", cptCode: "0190", description: "BP > 140/90 & < 200/120", quantity: 1, amount: 52000 },
      ],
    };
    const xml = buildClaimXML(claim);
    expect(xml).toContain("&gt;");
    expect(xml).toContain("&lt;");
    expect(xml).toContain("&amp;");
  });

  it("should escape double quotes in fields", () => {
    const claim = { ...baseClaim, treatingProvider: 'Dr "Magic" Johnson' };
    const xml = buildClaimXML(claim);
    expect(xml).toContain("&quot;Magic&quot;");
  });

  it("should handle unicode characters (José, Müller)", () => {
    const claim = { ...baseClaim, patientName: "José Müller" };
    const xml = buildClaimXML(claim);
    expect(xml).toContain("<Name>José Müller</Name>");
  });

  it("should handle multiple line items", () => {
    const claim = {
      ...baseClaim,
      lineItems: [
        { icd10Code: "I10", cptCode: "0190", description: "Consult", quantity: 1, amount: 52000 },
        { icd10Code: "I10", cptCode: "0308", description: "ECG", quantity: 1, amount: 35000 },
      ],
    };
    const xml = buildClaimXML(claim);
    expect(xml).toContain('number="1"');
    expect(xml).toContain('number="2"');
  });

  it("should include optional fields when present", () => {
    const claim = {
      ...baseClaim,
      authorizationNumber: "AUTH123",
      referringProvider: "Dr Referrer",
      referringBhf: "7654321",
      lineItems: [
        { icd10Code: "I10", cptCode: "0190", description: "Consult", quantity: 1, amount: 52000, nappiCode: "7081709001", modifiers: ["0002"] },
      ],
    };
    const xml = buildClaimXML(claim);
    expect(xml).toContain("<AuthorizationNumber>AUTH123</AuthorizationNumber>");
    expect(xml).toContain("<ReferringProvider>Dr Referrer</ReferringProvider>");
    expect(xml).toContain("<ReferringPracticeNumber>7654321</ReferringPracticeNumber>");
    expect(xml).toContain("<NAPPICode>7081709001</NAPPICode>");
    expect(xml).toContain("<Modifier>0002</Modifier>");
  });

  it("should NOT include optional fields when absent", () => {
    const xml = buildClaimXML(baseClaim);
    expect(xml).not.toContain("<AuthorizationNumber>");
    expect(xml).not.toContain("<ReferringProvider>");
    expect(xml).not.toContain("<NAPPICode>");
    expect(xml).not.toContain("<Modifiers>");
  });

  it("should handle very long patient names", () => {
    const longName = "A".repeat(200);
    const claim = { ...baseClaim, patientName: longName };
    const xml = buildClaimXML(claim);
    expect(xml).toContain(`<Name>${longName}</Name>`);
  });

  it("should handle empty description gracefully", () => {
    const claim = {
      ...baseClaim,
      lineItems: [
        { icd10Code: "I10", cptCode: "0190", description: "", quantity: 1, amount: 52000 },
      ],
    };
    const xml = buildClaimXML(claim);
    expect(xml).toContain("<Description></Description>");
  });
});

describe("XML Builder — buildEligibilityXML", () => {
  it("should produce valid eligibility check XML", () => {
    const xml = buildEligibilityXML({
      bhfNumber: "1234567",
      membershipNumber: "900012345",
      dependentCode: "00",
      patientDob: "1985-06-15",
      scheme: "Discovery Health",
    });
    expect(xml).toContain("<TransactionType>ELIGIBILITY</TransactionType>");
    expect(xml).toContain("<Scheme>Discovery Health</Scheme>");
    expect(xml).toContain("<MembershipNumber>900012345</MembershipNumber>");
    expect(xml).toContain("<DependentCode>00</DependentCode>");
  });

  it("should escape special characters in scheme name", () => {
    const xml = buildEligibilityXML({
      bhfNumber: "1234567",
      membershipNumber: "12345",
      dependentCode: "00",
      patientDob: "1990-01-01",
      scheme: "Test & Sons <Medical>",
    });
    expect(xml).toContain("Test &amp; Sons &lt;Medical&gt;");
  });
});

describe("XML Builder — buildReversalXML", () => {
  it("should produce valid reversal XML", () => {
    const xml = buildReversalXML({
      bhfNumber: "1234567",
      originalTransactionRef: "HB-123456",
      reason: "Duplicate submission",
    });
    expect(xml).toContain("<TransactionType>REVERSAL</TransactionType>");
    expect(xml).toContain("<OriginalTransactionRef>HB-123456</OriginalTransactionRef>");
    expect(xml).toContain("<Reason>Duplicate submission</Reason>");
  });

  it("should escape special characters in reason field", () => {
    const xml = buildReversalXML({
      bhfNumber: "1234567",
      originalTransactionRef: "HB-123",
      reason: "Patient's claim was incorrect & needs reversal",
    });
    expect(xml).toContain("&apos;");
    expect(xml).toContain("&amp;");
  });
});
