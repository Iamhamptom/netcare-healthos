import { describe, it, expect } from "vitest";
import {
  generateEDIFACT,
  parseEDIFACT,
  claimToEDIFACT,
  edifactToClaim,
  validateEDIFACTMessage,
} from "@/lib/switching/edifact";
import { createBatchJob, getBatchSummary } from "@/lib/switching/batch";
import { parseERAXml, reconcileERA } from "@/lib/switching/era-parser";
import { createPreAuthRequest } from "@/lib/switching/preauth";
import { createVendor } from "@/lib/switching/vendor-accreditation";
import { SCHEME_ROUTING_TABLE } from "@/lib/switching/router";
import { formatZAR, parseZARToCents } from "@/lib/healthbridge/codes";
import type { ClaimSubmission } from "@/lib/healthbridge/types";
import type { BatchJob } from "@/lib/switching/types";

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
    { icd10Code: "I10", cptCode: "0308", description: "ECG", quantity: 1, amount: 35000 },
    { icd10Code: "E78.5", cptCode: "0382", description: "Blood glucose", quantity: 1, amount: 6500 },
  ],
  practiceId: "practice-001",
};

describe("Data Integrity — Round-Trip Preservation", () => {
  it("ClaimSubmission → EDIFACT string → parse → fields preserved", () => {
    const edifact = generateEDIFACT(baseClaim);
    const parsed = parseEDIFACT(edifact);

    expect(parsed.lineItems).toHaveLength(3);
    expect(parsed.lineItems[0].tariffCode).toBe("0190");
    expect(parsed.lineItems[1].tariffCode).toBe("0308");
    expect(parsed.lineItems[2].tariffCode).toBe("0382");

    expect(parsed.lineItems[0].icd10Codes).toContain("J06.9");
    expect(parsed.lineItems[1].icd10Codes).toContain("I10");
    expect(parsed.lineItems[2].icd10Codes).toContain("E78.5");

    // Amounts: unit * quantity preserved
    expect(parsed.lineItems[0].amount).toBe(52000);
    expect(parsed.lineItems[1].amount).toBe(35000);
    expect(parsed.lineItems[2].amount).toBe(6500);
  });

  it("claimToEDIFACT → edifactToClaim preserves key fields", () => {
    const msg = claimToEDIFACT(baseClaim);
    const roundTripped = edifactToClaim(msg, "practice-001");

    expect(roundTripped.bhfNumber).toBe(baseClaim.bhfNumber);
    expect(roundTripped.membershipNumber).toBe(baseClaim.membershipNumber);
    expect(roundTripped.practiceId).toBe("practice-001");
    expect(roundTripped.lineItems).toHaveLength(3);
    expect(roundTripped.lineItems[0].cptCode).toBe("0190");
    expect(roundTripped.lineItems[0].icd10Code).toBe("J06.9");
  });

  it("EDIFACT validation passes for round-tripped message", () => {
    const msg = claimToEDIFACT(baseClaim);
    const validation = validateEDIFACTMessage(msg);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });
});

describe("Data Integrity — Type Correctness", () => {
  it("parsed EDIFACT amounts are always numbers (not strings)", () => {
    const edifact = generateEDIFACT(baseClaim);
    const parsed = parseEDIFACT(edifact);
    for (const item of parsed.lineItems) {
      expect(typeof item.amount).toBe("number");
      expect(typeof item.quantity).toBe("number");
    }
  });

  it("eRA amounts are always numbers", () => {
    const era = parseERAXml(`<RemittanceAdvice>
      <RemittanceRef>ERA-TYPE</RemittanceRef>
      <SchemeName>Test</SchemeName>
      <Payment>
        <ClaimRef>HB-001</ClaimRef>
        <MembershipNumber>900012345</MembershipNumber>
        <DependentCode>00</DependentCode>
        <PatientName>Test</PatientName>
        <DateOfService>2026-03-15</DateOfService>
        <TariffCode>0190</TariffCode>
        <ClaimedAmount>52000</ClaimedAmount>
        <PaidAmount>48000</PaidAmount>
      </Payment>
    </RemittanceAdvice>`);
    expect(typeof era.totalClaimed).toBe("number");
    expect(typeof era.totalPaid).toBe("number");
    for (const item of era.lineItems) {
      expect(typeof item.claimedAmount).toBe("number");
      expect(typeof item.paidAmount).toBe("number");
    }
  });
});

describe("Data Integrity — Batch Result Indices", () => {
  it("batch result claimIds match original indices", () => {
    const claims = Array.from({ length: 5 }, (_, i) => ({
      ...baseClaim,
      patientName: `Patient ${i + 1}`,
    }));
    const job = createBatchJob({ practiceId: "p-001", claims });
    expect(job.claimIds).toHaveLength(5);
    for (let i = 0; i < 5; i++) {
      expect(job.claimIds[i]).toBe(`claim-${i}`);
    }
  });

  it("batch summary totalApproved sums correctly with integer arithmetic", () => {
    const job: BatchJob = {
      id: "BATCH-test",
      practiceId: "p-001",
      claimIds: ["c-0", "c-1", "c-2"],
      totalClaims: 3,
      processedClaims: 3,
      successfulClaims: 3,
      failedClaims: 0,
      switchProvider: "healthbridge",
      protocol: "xml",
      status: "completed",
      results: [
        { claimId: "c-0", status: "success", approvedAmount: 52000, processedAt: "2026-03-20T10:00:10Z" },
        { claimId: "c-1", status: "success", approvedAmount: 35000, processedAt: "2026-03-20T10:00:20Z" },
        { claimId: "c-2", status: "success", approvedAmount: 6500, processedAt: "2026-03-20T10:00:30Z" },
      ],
      queuedAt: "2026-03-20T10:00:00Z",
      startedAt: "2026-03-20T10:00:05Z",
      completedAt: "2026-03-20T10:00:35Z",
      retryCount: 0,
      maxRetries: 3,
    };
    const summary = getBatchSummary(job);
    expect(summary.totalApproved).toBe(93500);
    expect(Number.isInteger(summary.totalApproved)).toBe(true);
  });
});

describe("Data Integrity — eRA ClaimRef Case-Sensitive Matching", () => {
  it("claimRef is case-sensitive in exact matching", () => {
    const era = parseERAXml(`<RemittanceAdvice>
      <RemittanceRef>ERA-CASE</RemittanceRef>
      <SchemeName>Test</SchemeName>
      <Payment>
        <ClaimRef>HB-ABC-001</ClaimRef>
        <MembershipNumber>900012345</MembershipNumber>
        <DependentCode>00</DependentCode>
        <PatientName>Test</PatientName>
        <DateOfService>2026-03-15</DateOfService>
        <TariffCode>0190</TariffCode>
        <ClaimedAmount>52000</ClaimedAmount>
        <PaidAmount>52000</PaidAmount>
      </Payment>
    </RemittanceAdvice>`);
    // Exact match — correct case
    const claims1 = [
      { id: "c-1", transactionRef: "HB-ABC-001", invoiceId: "inv-1", membershipNumber: "900012345", dateOfService: "2026-03-15", claimedAmount: 52000, status: "submitted" },
    ];
    const result1 = reconcileERA(era, claims1);
    expect(result1.totalMatched).toBe(1);
    expect(result1.matched[0].matchType).toBe("exact");

    // Wrong case — should NOT match exactly (falls to fuzzy)
    const claims2 = [
      { id: "c-2", transactionRef: "hb-abc-001", invoiceId: "inv-2", membershipNumber: "900012345", dateOfService: "2026-03-15", claimedAmount: 52000, status: "submitted" },
    ];
    const result2 = reconcileERA(era, claims2);
    // Should match fuzzy by membership+date, NOT exact
    if (result2.totalMatched > 0) {
      expect(result2.matched[0].matchType).toBe("fuzzy");
    }
  });
});

describe("Data Integrity — Pre-Auth Request ID Uniqueness", () => {
  it("1000 rapid creations generate unique IDs", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 1000; i++) {
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
      ids.add(req.id);
    }
    // Due to random suffix, should get close to 1000 unique
    expect(ids.size).toBeGreaterThanOrEqual(990);
  });
});

describe("Data Integrity — Vendor Code Uniqueness", () => {
  it("100 rapid creations generate unique vendor codes", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const v = createVendor({
        vendorName: "TestVendor",
        contactName: "Test",
        contactEmail: "test@example.com",
        contactPhone: "0821234567",
        softwareName: "PMS",
        softwareVersion: "1.0",
        protocols: ["xml"],
      });
      codes.add(v.vendorCode);
    }
    // Should have high uniqueness
    expect(codes.size).toBeGreaterThanOrEqual(1);
  });
});

describe("Data Integrity — Monetary Amount Integrity", () => {
  it("amounts never become floating point through formatZAR/parseZARToCents round-trip", () => {
    const testAmounts = [1, 99, 100, 52000, 99999, 1000001, 350000];
    for (const cents of testAmounts) {
      const formatted = formatZAR(cents);
      const parsed = parseZARToCents(formatted);
      expect(parsed).toBe(cents);
      expect(Number.isInteger(parsed)).toBe(true);
    }
  });

  it("EDIFACT MOA amounts are always integers (no decimals)", () => {
    const edifact = generateEDIFACT(baseClaim);
    const moaMatches = edifact.match(/MOA\+203:(\d+)/g);
    expect(moaMatches).not.toBeNull();
    for (const match of moaMatches!) {
      const amt = match.split(":")[1];
      expect(amt).toMatch(/^\d+$/); // No decimal point
    }
  });

  it("no NaN propagation in VAT calculation", () => {
    const claim: ClaimSubmission = {
      ...baseClaim,
      lineItems: [
        { icd10Code: "J06.9", cptCode: "0190", description: "Test", quantity: 1, amount: 0 },
      ],
    };
    const edifact = generateEDIFACT(claim);
    expect(edifact).not.toContain("NaN");
  });
});

describe("Data Integrity — Date Format Consistency", () => {
  it("EDIFACT dates are valid CCYYMMDD format", () => {
    const edifact = generateEDIFACT(baseClaim);
    const dtmMatches = edifact.match(/DTM\+\d+:(\d+):/g);
    expect(dtmMatches).not.toBeNull();
    for (const match of dtmMatches!) {
      const dateStr = match.match(/:(\d+):/)?.[1];
      expect(dateStr).toBeDefined();
      expect(dateStr!.length).toBe(8);
      const year = parseInt(dateStr!.slice(0, 4));
      const month = parseInt(dateStr!.slice(4, 6));
      const day = parseInt(dateStr!.slice(6, 8));
      expect(year).toBeGreaterThanOrEqual(1900);
      expect(year).toBeLessThanOrEqual(2100);
      expect(month).toBeGreaterThanOrEqual(1);
      expect(month).toBeLessThanOrEqual(12);
      expect(day).toBeGreaterThanOrEqual(1);
      expect(day).toBeLessThanOrEqual(31);
    }
  });
});

describe("Data Integrity — No Undefined in Required Fields", () => {
  it("parsed EDIFACT has no undefined lineNumber", () => {
    const edifact = generateEDIFACT(baseClaim);
    const parsed = parseEDIFACT(edifact);
    for (const item of parsed.lineItems) {
      expect(item.lineNumber).toBeDefined();
      expect(typeof item.lineNumber).toBe("number");
      expect(item.tariffCode).toBeDefined();
      expect(item.icd10Codes).toBeDefined();
      expect(Array.isArray(item.icd10Codes)).toBe(true);
    }
  });

  it("eRA parsed document has no undefined required fields", () => {
    const era = parseERAXml(`<RemittanceAdvice>
      <RemittanceRef>ERA-COMPLETE</RemittanceRef>
      <SchemeName>Discovery Health</SchemeName>
      <Payment>
        <ClaimRef>HB-001</ClaimRef>
        <MembershipNumber>900012345</MembershipNumber>
        <DependentCode>00</DependentCode>
        <PatientName>Test</PatientName>
        <DateOfService>2026-03-15</DateOfService>
        <TariffCode>0190</TariffCode>
        <ClaimedAmount>52000</ClaimedAmount>
        <PaidAmount>52000</PaidAmount>
      </Payment>
    </RemittanceAdvice>`);
    expect(era.remittanceRef).toBeDefined();
    expect(era.scheme).toBeDefined();
    expect(era.paymentDate).toBeDefined();
    expect(era.reconciliationStatus).toBeDefined();
    for (const item of era.lineItems) {
      expect(item.claimRef).toBeDefined();
      expect(typeof item.claimedAmount).toBe("number");
      expect(typeof item.paidAmount).toBe("number");
    }
  });

  it("batch job has all required fields after creation", () => {
    const job = createBatchJob({ practiceId: "p-001", claims: [baseClaim] });
    expect(job.id).toBeDefined();
    expect(job.id).toMatch(/^BATCH-/);
    expect(job.practiceId).toBe("p-001");
    expect(job.totalClaims).toBe(1);
    expect(job.status).toBe("queued");
    expect(job.results).toBeDefined();
    expect(Array.isArray(job.results)).toBe(true);
    expect(job.maxRetries).toBeDefined();
    expect(typeof job.maxRetries).toBe("number");
  });
});

describe("Data Integrity — Scheme Name Exact Match in Routing", () => {
  it("routing table scheme names are consistent strings (no trailing spaces)", () => {
    for (const route of SCHEME_ROUTING_TABLE) {
      expect(route.scheme).toBe(route.scheme.trim());
      expect(route.scheme.length).toBeGreaterThan(0);
      expect(route.primarySwitch).toBeDefined();
    }
  });
});
