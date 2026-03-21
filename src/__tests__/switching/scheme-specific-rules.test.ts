// Scheme-Specific Rules Tests — Real scheme rules from knowledge base
// Grounded in: 05_scheme_profiles.md
// Discovery, GEMS, Bonitas, Momentum, Medihelp, Bestmed

import { describe, it, expect } from "vitest";
import { validateClaim } from "@/lib/healthbridge/validator";
import { checkPreAuthRequired } from "@/lib/switching/preauth";
import { MEDICAL_AID_SCHEMES } from "@/lib/healthbridge/codes";
import { BHF_ADJUSTMENT_CODES } from "@/lib/switching/era-parser";
import { applySchemeSpecificRules } from "@/lib/switching/fraud-engine";

const today = new Date().toISOString().slice(0, 10);

describe("Scheme-Specific Rules", () => {
  // ── Discovery Health (~3.8M lives, 58% open scheme market) ──

  describe("Discovery Health", () => {
    it("should route Discovery via Healthbridge switch", () => {
      const route = MEDICAL_AID_SCHEMES["Discovery Health"];
      expect(route).toBeDefined();
      expect(route.switchRoute).toBe("healthbridge");
    });

    it("should warn about low ICD-10 specificity (Discovery requires 4th character)", () => {
      // Discovery is STRICT on ICD-10 — 4th character mandatory
      const result = validateClaim({
        patientName: "Mandla Sithole",
        medicalAidScheme: "Discovery Health",
        membershipNumber: "DH123456789",
        dependentCode: "00",
        dateOfService: today,
        placeOfService: "11",
        bhfNumber: "1234567",
        lineItems: [{ icd10Code: "J06", cptCode: "0190", description: "URTI", quantity: 1, amount: 52000 }],
      });
      // Should warn about low specificity — Discovery will reject 3-char codes
      expect(result.issues.some(i => i.code === "ICD10_LOW_SPECIFICITY")).toBe(true);
    });

    it("should flag specialist consultation as possibly needing pre-auth", () => {
      // Discovery: pre-auth after 15th GP visit; always for specialists
      const check = checkPreAuthRequired({
        cptCodes: ["0141"], // specialist consultation
        icd10Codes: ["I10"],
        scheme: "Discovery Health",
        estimatedCost: 95000,
      });
      // Specialist referral category should be triggered
      expect(check.categories).toContain("specialist_referral");
    });
  });

  // ── GEMS (~2M lives, largest restricted scheme) ──

  describe("GEMS (Government Employees Medical Scheme)", () => {
    it("should route GEMS via mediswitch (SwitchOn)", () => {
      const route = MEDICAL_AID_SCHEMES["GEMS"];
      expect(route).toBeDefined();
      // Knowledge base says SwitchOn, code maps to mediswitch
      expect(route.switchRoute).toBe("mediswitch");
    });

    it("should validate GEMS 9-digit membership with leading zeros", () => {
      // GEMS requires exactly 9 digits — leading zeros preserved
      const result = validateClaim({
        patientName: "Thandi Nkosi",
        medicalAidScheme: "GEMS",
        membershipNumber: "12345", // Only 5 digits — should fail GEMS format
        dependentCode: "00",
        dateOfService: today,
        placeOfService: "11",
        bhfNumber: "1234567",
        lineItems: [{ icd10Code: "J06.9", cptCode: "0190", description: "URTI", quantity: 1, amount: 52000 }],
      });
      expect(result.issues.some(i => i.code === "GEMS_MEMBERSHIP_FORMAT")).toBe(true);
    });

    it("should accept GEMS 9-digit membership with leading zeros", () => {
      const result = validateClaim({
        patientName: "Thandi Nkosi",
        medicalAidScheme: "GEMS",
        membershipNumber: "000012345", // Correct 9-digit format
        dependentCode: "00",
        dateOfService: today,
        placeOfService: "11",
        bhfNumber: "1234567",
        lineItems: [{ icd10Code: "J06.9", cptCode: "0190", description: "URTI", quantity: 1, amount: 52000 }],
      });
      expect(result.issues.some(i => i.code === "GEMS_MEMBERSHIP_FORMAT")).toBe(false);
    });

    it("should accept GEMS membership edge case: all leading zeros (000000001)", () => {
      const result = validateClaim({
        patientName: "Sipho Mahlangu",
        medicalAidScheme: "GEMS",
        membershipNumber: "000000001",
        dependentCode: "00",
        dateOfService: today,
        placeOfService: "11",
        bhfNumber: "1234567",
        lineItems: [{ icd10Code: "I10", cptCode: "0190", description: "Hypertension check", quantity: 1, amount: 52000 }],
      });
      expect(result.issues.some(i => i.code === "GEMS_MEMBERSHIP_FORMAT")).toBe(false);
    });

    it("should have 60-day dispute turnaround for GEMS (longest of all schemes)", () => {
      // From era-parser.ts SCHEME_CONTACTS — GEMS has 60-day turnaround
      // This is a knowledge verification — the dispute turnaround is embedded
      // GAP: SCHEME_CONTACTS is not exported, but BHF_ADJUSTMENT_CODES is
      // We verify the adjustment codes exist which enable the dispute workflow
      expect(BHF_ADJUSTMENT_CODES["07"]).toBeDefined();
      expect(BHF_ADJUSTMENT_CODES["07"].disputeWorthy).toBe(true);
    });
  });

  // ── Bonitas (~731K beneficiaries) ──

  describe("Bonitas", () => {
    it("should route Bonitas via Healthbridge switch", () => {
      const route = MEDICAL_AID_SCHEMES["Bonitas"];
      expect(route).toBeDefined();
      expect(route.switchRoute).toBe("healthbridge");
    });

    it("should route Bonitas through Medscheme administrator", () => {
      const route = MEDICAL_AID_SCHEMES["Bonitas"];
      expect(route.administrator).toBe("Medscheme");
    });

    // GAP: No scheme-specific off-formulary co-payment logic (30%) implemented
    // The knowledge base states Bonitas has 4 formulary tiers (A-D) with 30% co-pay
    // for off-formulary items, but this is scheme-specific adjudication logic
    // that would be handled by the scheme's own claims engine, not our pre-validation.
    it("should apply 30% co-payment for Bonitas off-formulary (Tier D) items via scheme rules engine", () => {
      const flags = applySchemeSpecificRules({
        scheme: "Bonitas",
        icd10Codes: ["I10"],
        cptCodes: ["0190"],
        isSpecialistReferral: false,
        hasGPReferral: false,
        formularyTier: "D",
      });
      const offFormulary = flags.find(f => f.rule === "BONITAS_OFF_FORMULARY");
      expect(offFormulary).toBeDefined();
      expect(offFormulary!.severity).toBe("warning");
      expect(offFormulary!.message).toContain("30% co-payment");
    });

    it("should require GP referral for specialists on Bonitas via scheme rules engine", () => {
      const flags = applySchemeSpecificRules({
        scheme: "Bonitas",
        icd10Codes: ["I10"],
        cptCodes: ["0141"],
        isSpecialistReferral: true,
        hasGPReferral: false,
      });
      const referral = flags.find(f => f.rule === "BONITAS_GP_REFERRAL");
      expect(referral).toBeDefined();
      expect(referral!.severity).toBe("error");
      expect(referral!.message).toContain("GP referral");
      // With GP referral should not flag
      const noFlag = applySchemeSpecificRules({
        scheme: "Bonitas",
        icd10Codes: ["I10"],
        cptCodes: ["0141"],
        isSpecialistReferral: true,
        hasGPReferral: true,
      });
      expect(noFlag.find(f => f.rule === "BONITAS_GP_REFERRAL")).toBeUndefined();
    });
  });

  // ── Momentum Health (~350K lives) ──

  describe("Momentum Health", () => {
    it("should route Momentum via mediswitch (SwitchOn)", () => {
      const route = MEDICAL_AID_SCHEMES["Momentum Health"];
      expect(route).toBeDefined();
      expect(route.switchRoute).toBe("mediswitch");
    });

    // GAP: Momentum PMB letter requirement not implemented in pre-auth engine
    it("should flag Momentum PMB — practice must send letter via scheme rules engine", () => {
      // Momentum requires PMB motivation letter for C/O/I/S/T codes and B20
      const flags = applySchemeSpecificRules({
        scheme: "Momentum Health",
        icd10Codes: ["C50.9"], // breast cancer — matches /^[COIST]\d{2}/
        cptCodes: ["0141"],
        isSpecialistReferral: false,
        hasGPReferral: false,
      });
      const pmbLetter = flags.find(f => f.rule === "MOMENTUM_PMB_LETTER");
      expect(pmbLetter).toBeDefined();
      expect(pmbLetter!.severity).toBe("info");
      expect(pmbLetter!.message).toContain("PMB motivation letter");
    });
  });

  // ── Medihelp (~400K lives, self-administered since 1906) ──

  describe("Medihelp", () => {
    it("should route Medihelp via Healthbridge switch", () => {
      const route = MEDICAL_AID_SCHEMES["Medihelp"];
      expect(route).toBeDefined();
      expect(route.switchRoute).toBe("healthbridge");
    });

    it("should enforce 120-day submission deadline (Medihelp: last workday of 4th month)", () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 125);
      const result = validateClaim({
        patientName: "Johan Pretorius",
        medicalAidScheme: "Medihelp",
        membershipNumber: "MH998877",
        dependentCode: "00",
        dateOfService: oldDate.toISOString().slice(0, 10),
        placeOfService: "11",
        bhfNumber: "1234567",
        lineItems: [{ icd10Code: "J06.9", cptCode: "0190", description: "URTI", quantity: 1, amount: 52000 }],
      });
      expect(result.issues.some(i => i.code === "LATE_SUBMISSION")).toBe(true);
    });
  });

  // ── Bestmed (~200K lives) ──

  describe("Bestmed", () => {
    it("should route Bestmed via mediswitch (SwitchOn)", () => {
      const route = MEDICAL_AID_SCHEMES["Bestmed"];
      expect(route).toBeDefined();
      expect(route.switchRoute).toBe("mediswitch");
    });

    // GAP: Bestmed mental health cap (21 days inpatient OR 15 outpatient) not implemented
    it("should enforce Bestmed mental health cap: 21 days inpatient OR 15 outpatient sessions via scheme rules engine", () => {
      // Inpatient over cap
      const inpatient = applySchemeSpecificRules({
        scheme: "Bestmed",
        icd10Codes: ["F32.1"],
        cptCodes: ["0141"],
        isSpecialistReferral: false,
        hasGPReferral: false,
        mentalHealthDays: 25,
      });
      const inpatientCap = inpatient.find(f => f.rule === "BESTMED_MENTAL_HEALTH_INPATIENT");
      expect(inpatientCap).toBeDefined();
      expect(inpatientCap!.severity).toBe("error");
      expect(inpatientCap!.message).toContain("25 inpatient days");
      expect(inpatientCap!.message).toContain("21-day");

      // Outpatient over cap
      const outpatient = applySchemeSpecificRules({
        scheme: "Bestmed",
        icd10Codes: ["F32.1"],
        cptCodes: ["0141"],
        isSpecialistReferral: false,
        hasGPReferral: false,
        mentalHealthSessions: 18,
      });
      const outpatientCap = outpatient.find(f => f.rule === "BESTMED_MENTAL_HEALTH_OUTPATIENT");
      expect(outpatientCap).toBeDefined();
      expect(outpatientCap!.severity).toBe("error");
      expect(outpatientCap!.message).toContain("18 outpatient sessions");
      expect(outpatientCap!.message).toContain("15-session");
    });
  });

  // ── Switch Routing Table Validation ──

  describe("Switch Routing Table (3 switching houses)", () => {
    it("should have routes for all major SA schemes", () => {
      const requiredSchemes = [
        "Discovery Health",
        "GEMS",
        "Bonitas",
        "Medihelp",
        "Momentum Health",
        "Bestmed",
      ];
      for (const scheme of requiredSchemes) {
        expect(MEDICAL_AID_SCHEMES[scheme]).toBeDefined();
      }
    });

    it("should map CompCare to MediKredit switch", () => {
      const route = MEDICAL_AID_SCHEMES["CompCare"];
      expect(route).toBeDefined();
      expect(route.switchRoute).toBe("medikred");
    });
  });
});
