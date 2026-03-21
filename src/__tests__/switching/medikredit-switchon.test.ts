import { describe, it, expect } from "vitest";
import { submitToMediKredit, checkMediKreditEligibility, famCheck, authCheck } from "@/lib/switching/medikredit-client";
import { submitToSwitchOn, checkSwitchOnEligibility } from "@/lib/switching/switchon-client";
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

describe("MediKredit Switch Client (Sandbox)", () => {
  it("returns valid ClaimResponse structure", async () => {
    const response = await submitToMediKredit(baseClaim);
    expect(response.transactionRef).toBeTruthy();
    expect(["accepted", "rejected", "partial", "pending"]).toContain(response.status);
    expect(response.rawResponse).toBeTruthy();
  });

  it("transaction ref has MK-SIM prefix in sandbox", async () => {
    const response = await submitToMediKredit(baseClaim);
    expect(response.transactionRef).toMatch(/^MK-SIM-/);
  });

  it("includes raw response XML", async () => {
    const response = await submitToMediKredit(baseClaim);
    expect(response.rawResponse).toContain("medikredit");
  });

  it("returns approved amount for accepted claims", async () => {
    // Run multiple times to get at least one accepted
    const responses = await Promise.all(
      Array.from({ length: 20 }, () => submitToMediKredit(baseClaim))
    );
    const accepted = responses.filter(r => r.status === "accepted");
    expect(accepted.length).toBeGreaterThan(0);
    for (const r of accepted) {
      expect(r.approvedAmount).toBeGreaterThan(0);
    }
  });

  it("realistic acceptance rate (>70% accepted over 50 runs)", async () => {
    const responses = await Promise.all(
      Array.from({ length: 50 }, () => submitToMediKredit(baseClaim))
    );
    const accepted = responses.filter(r => r.status === "accepted" || r.status === "partial");
    // Sandbox simulates ~92% non-rejected (8% reject + 10% partial)
    expect(accepted.length / responses.length).toBeGreaterThan(0.7);
  });

  it("rejected responses include rejection code", async () => {
    const responses = await Promise.all(
      Array.from({ length: 50 }, () => submitToMediKredit(baseClaim))
    );
    const rejected = responses.filter(r => r.status === "rejected");
    for (const r of rejected) {
      expect(r.rejectionCode).toBeTruthy();
      expect(r.rejectionReason).toBeTruthy();
    }
  });
});

describe("MediKredit Eligibility Check", () => {
  it("returns valid eligibility result", async () => {
    const result = await checkMediKreditEligibility({
      membershipNumber: "900012345",
      dependentCode: "00",
      patientDob: "1985-06-15",
      scheme: "Discovery Health",
    });
    expect(result.eligible).toBe(true);
    expect(result.scheme).toBe("Discovery Health");
    expect(result.memberName).toBeTruthy();
    expect(result.benefits).toBeDefined();
    expect(result.benefits!.length).toBeGreaterThan(0);
  });

  it("includes benefit categories", async () => {
    const result = await checkMediKreditEligibility({
      membershipNumber: "900012345",
      dependentCode: "00",
      patientDob: "1985-06-15",
      scheme: "Bonitas",
    });
    const categories = result.benefits!.map(b => b.category);
    expect(categories).toContain("GP Consultations");
  });
});

describe("MediKredit FamCheck (Member Verification)", () => {
  it("returns valid MemberVerification", async () => {
    const result = await famCheck({
      membershipNumber: "900012345",
      dependentCode: "00",
      patientDob: "1985-01-01",
      scheme: "Discovery Health",
    });
    expect(result.found).toBe(true);
    expect(result.status).toBe("active");
    expect(result.mainMember).toBeDefined();
    expect(result.mainMember.membershipNumber).toBe("900012345");
    expect(result.dependents.length).toBeGreaterThan(0);
    expect(result.benefitsSummary.length).toBeGreaterThan(0);
    expect(result.verifiedAt).toBeTruthy();
  });

  it("includes dependent details", async () => {
    const result = await famCheck({
      membershipNumber: "900012345",
      dependentCode: "01",
      patientDob: "1987-03-15",
      scheme: "GEMS",
    });
    const dep = result.dependents.find(d => d.dependentCode === "01");
    expect(dep).toBeDefined();
    expect(dep!.relationship).toBeTruthy();
    expect(["active", "suspended", "removed"]).toContain(dep!.status);
  });
});

describe("MediKredit AuthCheck (Pre-Auth)", () => {
  it("returns valid PreAuthResponse", async () => {
    const result = await authCheck({
      membershipNumber: "900012345",
      scheme: "Discovery Health",
      icd10Codes: ["M54.5"],
      cptCodes: ["0190"],
      estimatedCost: 52000,
    });
    expect(result.transactionRef).toMatch(/^MK-AUTH-/);
    expect(["approved", "pending", "denied"]).toContain(result.status);
  });

  it("low-cost procedures auto-approved", async () => {
    const result = await authCheck({
      membershipNumber: "900012345",
      scheme: "Discovery Health",
      icd10Codes: ["J06.9"],
      cptCodes: ["0190"],
      estimatedCost: 52000,
    });
    expect(result.status).toBe("approved");
    expect(result.authorizationNumber).toBeTruthy();
    expect(result.approvedAmount).toBe(52000);
  });

  it("high-cost procedures require further review", async () => {
    const result = await authCheck({
      membershipNumber: "900012345",
      scheme: "Discovery Health",
      icd10Codes: ["M17.1"],
      cptCodes: ["0800"],
      estimatedCost: 2000000, // R20,000
    });
    expect(result.status).toBe("pending");
    expect(result.conditions).toBeDefined();
    expect(result.conditions!.length).toBeGreaterThan(0);
  });
});

describe("SwitchOn Switch Client (Sandbox)", () => {
  it("returns valid ClaimResponse structure", async () => {
    const response = await submitToSwitchOn(baseClaim);
    expect(response.transactionRef).toBeTruthy();
    expect(["accepted", "rejected", "partial", "pending"]).toContain(response.status);
    expect(response.rawResponse).toBeTruthy();
  });

  it("transaction ref has SO-SIM prefix in sandbox", async () => {
    const response = await submitToSwitchOn(baseClaim);
    expect(response.transactionRef).toMatch(/^SO-SIM-/);
  });

  it("includes raw response with switchon identifier", async () => {
    const response = await submitToSwitchOn(baseClaim);
    expect(response.rawResponse).toContain("switchon");
  });

  it("realistic acceptance rate (>70% over 50 runs)", async () => {
    const responses = await Promise.all(
      Array.from({ length: 50 }, () => submitToSwitchOn(baseClaim))
    );
    const nonRejected = responses.filter(r => r.status === "accepted" || r.status === "partial");
    expect(nonRejected.length / responses.length).toBeGreaterThan(0.7);
  });

  it("all required fields present in response", async () => {
    const response = await submitToSwitchOn(baseClaim);
    expect(response).toHaveProperty("transactionRef");
    expect(response).toHaveProperty("status");
    expect(response).toHaveProperty("rawResponse");
  });
});

describe("SwitchOn Eligibility Check", () => {
  it("returns valid eligibility result", async () => {
    const result = await checkSwitchOnEligibility({
      membershipNumber: "900012345",
      dependentCode: "00",
      patientDob: "1985-06-15",
      scheme: "GEMS",
    });
    expect(result.eligible).toBe(true);
    expect(result.scheme).toBe("GEMS");
    expect(result.option).toBeTruthy();
    expect(result.benefits).toBeDefined();
    expect(result.benefits!.length).toBeGreaterThan(0);
  });
});
