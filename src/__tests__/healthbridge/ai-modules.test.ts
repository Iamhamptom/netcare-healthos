import { describe, it, expect } from "vitest";
import { suggestCodes } from "@/lib/healthbridge/ai-coder";
import { autofillClaimFromNotes } from "@/lib/healthbridge/ai-autofill";
import { predictRejection } from "@/lib/healthbridge/ai-predictor";
import { generateFollowUps } from "@/lib/healthbridge/ai-followup";
import type { ClaimSubmission } from "@/lib/healthbridge/types";
import type { ClaimRecord } from "@/lib/healthbridge/analytics";

// All tests use fallback paths (no GEMINI_API_KEY set in test env)

describe("AI Coder — Fallback ICD-10 Suggestions", () => {
  it("should suggest I10 for 'hypertension'", async () => {
    const result = await suggestCodes("Patient presents with hypertension, BP 160/100");
    expect(result.icd10Codes.some(c => c.code === "I10")).toBe(true);
  });

  it("should suggest E11.9 for 'diabetes'", async () => {
    const result = await suggestCodes("Type 2 diabetes management, HbA1c review");
    expect(result.icd10Codes.some(c => c.code === "E11.9")).toBe(true);
  });

  it("should suggest M54.5 for 'back pain'", async () => {
    const result = await suggestCodes("Patient complains of lower back pain, lumbar tenderness");
    expect(result.icd10Codes.some(c => c.code === "M54.5")).toBe(true);
  });

  it("should suggest Z23 for 'immunization'", async () => {
    const result = await suggestCodes("Childhood immunization — measles vaccine administered");
    expect(result.icd10Codes.some(c => c.code === "Z23")).toBe(true);
  });

  it("should suggest Z00.0 for unknown text (general exam default)", async () => {
    const result = await suggestCodes("xyzzy blorp nothing medical here");
    expect(result.icd10Codes.some(c => c.code === "Z00.0")).toBe(true);
  });

  it("should enrich PMB status: I10 flagged as PMB", async () => {
    const result = await suggestCodes("Hypertension checkup");
    const hypertension = result.icd10Codes.find(c => c.code === "I10");
    expect(hypertension).toBeDefined();
    expect(hypertension!.isPMB).toBe(true);
  });

  it("should enrich CDL status: E11.9 flagged as CDL", async () => {
    const result = await suggestCodes("Diabetes type 2 follow-up");
    const diabetes = result.icd10Codes.find(c => c.code === "E11.9");
    expect(diabetes).toBeDefined();
    expect(diabetes!.isCDL).toBe(true);
    expect(diabetes!.cdlCondition).toContain("Diabetes");
  });

  it("should include confidence levels on suggestions", async () => {
    const result = await suggestCodes("Hypertension");
    for (const code of result.icd10Codes) {
      expect(["high", "medium", "low"]).toContain(code.confidence);
    }
  });

  it("should suggest J45.9 for 'asthma'", async () => {
    const result = await suggestCodes("Patient with asthma exacerbation, wheezing bilateral");
    expect(result.icd10Codes.some(c => c.code === "J45.9")).toBe(true);
  });

  it("should suggest CPT codes alongside ICD-10", async () => {
    const result = await suggestCodes("GP consultation for hypertension");
    expect(result.cptCodes.length).toBeGreaterThan(0);
    expect(result.cptCodes[0].code).toMatch(/^\d{4}$/);
  });

  it("should include warnings about fallback mode", async () => {
    const result = await suggestCodes("Hypertension");
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some(w => w.toLowerCase().includes("keyword") || w.toLowerCase().includes("gemini"))).toBe(true);
  });
});

describe("AI Autofill — Fallback Clinical Notes Extraction", () => {
  it("should detect hypertension from clinical notes and include I10 in line items", async () => {
    const result = await autofillClaimFromNotes("Patient: John Smith. Hypertension BP 160/100. ECG normal.");
    expect(result.lineItems.some(li => li.icd10Code === "I10")).toBe(true);
  });

  it("should suggest ECG CPT 0308 when ECG mentioned in notes", async () => {
    const result = await autofillClaimFromNotes("Patient with hypertension. ECG performed, normal sinus rhythm.");
    expect(result.lineItems.some(li => li.cptCode === "0308")).toBe(true);
  });

  it("should suggest CPT 0191 (follow-up, not 0190) when 'follow-up' mentioned", async () => {
    const result = await autofillClaimFromNotes("Follow-up visit for hypertension management");
    expect(result.lineItems.some(li => li.cptCode === "0191")).toBe(true);
  });

  it("should default to Z00.0 for empty/unclear notes", async () => {
    const result = await autofillClaimFromNotes("xyzzy blorp");
    expect(result.lineItems.some(li => li.icd10Code === "Z00.0")).toBe(true);
  });

  it("should return low confidence in fallback mode", async () => {
    const result = await autofillClaimFromNotes("Hypertension checkup");
    expect(result.confidence).toBe("low");
  });

  it("should extract patient name when formatted as 'Patient: Name'", async () => {
    const result = await autofillClaimFromNotes("Patient: Sarah Johnson. Presenting with headache.");
    expect(result.patientName).toBe("Sarah Johnson");
  });

  it("should include warnings in fallback mode", async () => {
    const result = await autofillClaimFromNotes("Back pain, lower back");
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("should detect multiple conditions from rich clinical notes", async () => {
    const result = await autofillClaimFromNotes(
      "Patient with hypertension and diabetes. BP 150/95. Blood glucose 12.3. ECG and blood glucose test performed."
    );
    const icdCodes = result.lineItems.map(li => li.icd10Code);
    expect(icdCodes).toContain("I10");
    expect(icdCodes).toContain("E11.9");
  });

  it("should detect procedures: spirometry for 'lung function'", async () => {
    const result = await autofillClaimFromNotes("Asthma review. Lung function test performed. Wheeze improving.");
    expect(result.lineItems.some(li => li.cptCode === "0312")).toBe(true);
  });

  it("should detect procedures: injection for 'intramuscular injection'", async () => {
    const result = await autofillClaimFromNotes("Fever management. Intramuscular injection given.");
    expect(result.lineItems.some(li => li.cptCode === "1101")).toBe(true);
  });
});

describe("AI Predictor — Fallback Rejection Risk Scoring", () => {
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
    dateOfService: new Date().toISOString().slice(0, 10),
    placeOfService: "11",
    practiceId: "practice-1",
    lineItems: [
      { icd10Code: "I10", cptCode: "0190", description: "GP consultation", quantity: 1, amount: 52000 },
    ],
  };

  it("should lower risk for PMB conditions (-20 points)", async () => {
    const result = await predictRejection(baseClaim); // I10 = PMB
    expect(result.factors.some(f => f.factor.includes("PMB") && f.impact === "positive")).toBe(true);
  });

  it("should increase risk for missing auth on specialist code (+20)", async () => {
    const specialistClaim = {
      ...baseClaim,
      lineItems: [
        { icd10Code: "I10", cptCode: "0141", description: "Specialist consult", quantity: 1, amount: 95000 },
      ],
      authorizationNumber: undefined,
    };
    const result = await predictRejection(specialistClaim);
    expect(result.factors.some(f => f.factor.includes("authorization") && f.impact === "negative")).toBe(true);
    expect(result.probability).toBeGreaterThanOrEqual(10);
  });

  it("should increase risk for late submission >120 days (+25)", async () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 130);
    const lateClaim = {
      ...baseClaim,
      dateOfService: oldDate.toISOString().slice(0, 10),
    };
    const result = await predictRejection(lateClaim);
    expect(result.factors.some(f => f.factor.includes("Late submission") || f.factor.includes("late"))).toBe(true);
  });

  it("should return low risk for a perfect standard claim", async () => {
    const result = await predictRejection(baseClaim);
    // I10 is PMB, so risk should be low (base 10 - 20 = -10, clamped to 0)
    expect(result.risk).toBe("low");
    expect(result.probability).toBeLessThanOrEqual(30);
  });

  it("should stack multiple risk factors correctly", async () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 130);
    const riskyClaimData: ClaimSubmission = {
      ...baseClaim,
      dateOfService: oldDate.toISOString().slice(0, 10),
      medicalAidScheme: "Unknown Scheme XYZ",
      lineItems: [
        { icd10Code: "J06", cptCode: "0141", description: "Specialist", quantity: 1, amount: 200000 }, // no decimal = low specificity, specialist = no auth, overcharged
      ],
    };
    const result = await predictRejection(riskyClaimData);
    // Multiple negative factors should stack
    expect(result.factors.length).toBeGreaterThanOrEqual(3);
    expect(result.probability).toBeGreaterThan(30);
  });

  it("should return recommendations array", async () => {
    const result = await predictRejection(baseClaim);
    expect(Array.isArray(result.recommendations)).toBe(true);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it("should return risk as one of low/medium/high", async () => {
    const result = await predictRejection(baseClaim);
    expect(["low", "medium", "high"]).toContain(result.risk);
  });

  it("should clamp probability between 0 and 100", async () => {
    // PMB with no other risk factors → could go negative → should clamp to 0
    const result = await predictRejection(baseClaim);
    expect(result.probability).toBeGreaterThanOrEqual(0);
    expect(result.probability).toBeLessThanOrEqual(100);
  });
});

describe("AI Follow-up Generator — Urgency Classification", () => {
  function makeClaim(daysOld: number, scheme: string, status: string = "submitted"): ClaimRecord {
    const dos = new Date();
    dos.setDate(dos.getDate() - daysOld);
    return {
      id: `CLM-${daysOld}`,
      patientName: "Test Patient",
      medicalAidScheme: scheme,
      totalAmount: 52000,
      approvedAmount: 0,
      paidAmount: 0,
      status,
      dateOfService: dos.toISOString().slice(0, 10),
      submittedAt: dos.toISOString(),
      respondedAt: null,
      reconciledAt: null,
      rejectionCode: "",
      rejectionReason: "",
    };
  }

  it("should classify 30-day old claim as 'low' urgency", async () => {
    const actions = await generateFollowUps([makeClaim(35, "Discovery Health")]);
    expect(actions).toHaveLength(1);
    expect(actions[0].urgency).toBe("low");
  });

  it("should classify 60-day old claim as 'medium' urgency", async () => {
    const actions = await generateFollowUps([makeClaim(65, "Discovery Health")]);
    expect(actions).toHaveLength(1);
    expect(actions[0].urgency).toBe("medium");
  });

  it("should classify 90-day old claim as 'high' urgency", async () => {
    const actions = await generateFollowUps([makeClaim(95, "Discovery Health")]);
    expect(actions).toHaveLength(1);
    expect(actions[0].urgency).toBe("high");
  });

  it("should classify 120+ day old claim as 'critical' urgency", async () => {
    const actions = await generateFollowUps([makeClaim(125, "Discovery Health")]);
    expect(actions).toHaveLength(1);
    expect(actions[0].urgency).toBe("critical");
  });

  it("should include correct Discovery Health phone number (0860 445 566)", async () => {
    const actions = await generateFollowUps([makeClaim(35, "Discovery Health")]);
    expect(actions[0].schemeContact).toContain("0860 445 566");
  });

  it("should include correct GEMS phone number (0860 004 367)", async () => {
    const actions = await generateFollowUps([makeClaim(35, "GEMS")]);
    expect(actions[0].schemeContact).toContain("0860 004 367");
  });

  it("should include email template for claims >= 30 days old", async () => {
    const actions = await generateFollowUps([makeClaim(35, "Discovery Health")]);
    expect(actions[0].emailTemplate).toBeDefined();
    expect(actions[0].emailTemplate).toContain("CLM-35");
  });

  it("should NOT include email template for claims < 30 days old", async () => {
    const actions = await generateFollowUps([makeClaim(15, "Discovery Health")]);
    expect(actions).toHaveLength(1);
    expect(actions[0].emailTemplate).toBeUndefined();
  });

  it("should sort actions by urgency (critical first)", async () => {
    const claims = [
      makeClaim(35, "Discovery Health"),  // low
      makeClaim(125, "GEMS"),             // critical
      makeClaim(65, "Bonitas"),           // medium
      makeClaim(95, "Momentum Health"),   // high
    ];
    const actions = await generateFollowUps(claims);
    expect(actions[0].urgency).toBe("critical");
    expect(actions[1].urgency).toBe("high");
    expect(actions[2].urgency).toBe("medium");
    expect(actions[3].urgency).toBe("low");
  });

  it("should escalate rejected claims to at least medium urgency", async () => {
    const rejectedClaim = makeClaim(35, "Discovery Health", "rejected");
    rejectedClaim.rejectionCode = "08";
    rejectedClaim.rejectionReason = "Pre-auth required";
    const actions = await generateFollowUps([rejectedClaim]);
    expect(["medium", "high", "critical"]).toContain(actions[0].urgency);
    expect(actions[0].action).toContain("REJECTED");
  });

  it("should not generate follow-ups for fully paid claims", async () => {
    const paidClaim = makeClaim(35, "Discovery Health", "paid");
    paidClaim.paidAmount = 52000; // fully paid
    const actions = await generateFollowUps([paidClaim]);
    expect(actions).toHaveLength(0);
  });

  it("should include Bonitas scheme contact details", async () => {
    const actions = await generateFollowUps([makeClaim(35, "Bonitas")]);
    expect(actions[0].schemeContact).toContain("0860 002 108");
  });

  it("should include Momentum Health scheme contact details", async () => {
    const actions = await generateFollowUps([makeClaim(35, "Momentum Health")]);
    expect(actions[0].schemeContact).toContain("0860 117 859");
  });

  it("should handle unknown scheme gracefully", async () => {
    const actions = await generateFollowUps([makeClaim(35, "Unknown Medical Aid")]);
    expect(actions).toHaveLength(1);
    expect(actions[0].schemeContact).toContain("Unknown Medical Aid");
  });
});
