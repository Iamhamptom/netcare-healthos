import { describe, it, expect } from "vitest";
import { routeToSwitch, getSchemesForSwitch } from "@/lib/healthbridge/switch-router";
import { MEDICAL_AID_SCHEMES } from "@/lib/healthbridge/codes";
import { validateClaim } from "@/lib/healthbridge/validator";

// ============================================================================
// SCHEME-SPECIFIC RULES — Exhaustive validation of per-scheme routing and rules.
// SA medical aid industry has 60+ registered schemes, each with specific switch
// routing requirements mandated by scheme-switch contracts.
// Standards: Medical Schemes Act 131 of 1998, CMS regulations, BHF standards
// ============================================================================

const baseValidClaim = {
  patientName: "Test Patient",
  patientDob: "1985-06-15",
  patientIdNumber: "",
  membershipNumber: "900012345",
  dependentCode: "00",
  dateOfService: new Date().toISOString().slice(0, 10),
  placeOfService: "11",
  bhfNumber: "1234567",
  providerNumber: "MP12345",
  treatingProvider: "Dr Smith",
  lineItems: [
    { icd10Code: "I10", cptCode: "0190", description: "GP consultation", quantity: 1, amount: 52000 },
  ],
};

describe("SCHEME RULES: Discovery Health", () => {
  it("should route to healthbridge switch", () => {
    const route = routeToSwitch("Discovery Health");
    expect(route.provider).toBe("healthbridge");
  });

  it("should accept standard membership format", () => {
    const result = validateClaim({
      ...baseValidClaim,
      medicalAidScheme: "Discovery Health",
      membershipNumber: "900012345",
    });
    // No scheme-specific membership errors
    expect(result.issues.some(i => i.code === "GEMS_MEMBERSHIP_FORMAT")).toBe(false);
  });

  it("should accept claims with valid ICD-10 codes", () => {
    const result = validateClaim({
      ...baseValidClaim,
      medicalAidScheme: "Discovery Health",
    });
    expect(result.valid).toBe(true);
  });
});

describe("SCHEME RULES: GEMS", () => {
  it("should route to mediswitch switch", () => {
    const route = routeToSwitch("GEMS");
    expect(route.provider).toBe("mediswitch");
  });

  it("should REQUIRE 9-digit membership with leading zeros", () => {
    const result = validateClaim({
      ...baseValidClaim,
      medicalAidScheme: "GEMS",
      membershipNumber: "000012345",
    });
    expect(result.issues.some(i => i.code === "GEMS_MEMBERSHIP_FORMAT")).toBe(false);
  });

  it("should REJECT non-9-digit membership", () => {
    const cases = ["12345", "1234567890", "ABCDEFGHI", "00012345", "0000123456"];
    for (const membership of cases) {
      const result = validateClaim({
        ...baseValidClaim,
        medicalAidScheme: "GEMS",
        membershipNumber: membership,
      });
      expect(result.issues.some(i => i.code === "GEMS_MEMBERSHIP_FORMAT")).toBe(true);
    }
  });

  it("should accept '000012345' (valid 9-digit with leading zeros)", () => {
    const result = validateClaim({
      ...baseValidClaim,
      medicalAidScheme: "GEMS",
      membershipNumber: "000012345",
    });
    expect(result.issues.some(i => i.code === "GEMS_MEMBERSHIP_FORMAT")).toBe(false);
  });

  it("should reject '12345' (5 digits — too short for GEMS)", () => {
    const result = validateClaim({
      ...baseValidClaim,
      medicalAidScheme: "GEMS",
      membershipNumber: "12345",
    });
    expect(result.issues.some(i => i.code === "GEMS_MEMBERSHIP_FORMAT")).toBe(true);
  });
});

describe("SCHEME RULES: Bonitas (Medscheme administered)", () => {
  it("should route to healthbridge switch", () => {
    const route = routeToSwitch("Bonitas");
    expect(route.provider).toBe("healthbridge");
  });

  it("should accept standard membership format (no special requirements)", () => {
    const result = validateClaim({
      ...baseValidClaim,
      medicalAidScheme: "Bonitas",
      membershipNumber: "998877665",
    });
    expect(result.issues.some(i => i.code === "GEMS_MEMBERSHIP_FORMAT")).toBe(false);
  });
});

describe("SCHEME RULES: Momentum Health", () => {
  it("should route to mediswitch switch", () => {
    const route = routeToSwitch("Momentum Health");
    expect(route.provider).toBe("mediswitch");
  });

  it("should accept standard membership format", () => {
    const result = validateClaim({
      ...baseValidClaim,
      medicalAidScheme: "Momentum Health",
      membershipNumber: "MH12345678",
    });
    expect(result.issues.some(i => i.code === "GEMS_MEMBERSHIP_FORMAT")).toBe(false);
  });
});

describe("SCHEME RULES: CompCare", () => {
  it("should route to medikred switch", () => {
    const route = routeToSwitch("CompCare");
    expect(route.provider).toBe("medikred");
  });

  it("should accept standard membership format", () => {
    const result = validateClaim({
      ...baseValidClaim,
      medicalAidScheme: "CompCare",
      membershipNumber: "CC12345678",
    });
    expect(result.issues.some(i => i.code === "GEMS_MEMBERSHIP_FORMAT")).toBe(false);
  });
});

describe("SCHEME RULES: Bestmed", () => {
  it("should route to mediswitch switch", () => {
    const route = routeToSwitch("Bestmed");
    expect(route.provider).toBe("mediswitch");
  });
});

describe("SCHEME RULES: Fedhealth", () => {
  it("should route to mediswitch switch", () => {
    const route = routeToSwitch("Fedhealth");
    expect(route.provider).toBe("mediswitch");
  });
});

describe("SCHEME RULES: Polmed", () => {
  it("should route to mediswitch switch", () => {
    const route = routeToSwitch("Polmed");
    expect(route.provider).toBe("mediswitch");
  });
});

describe("SCHEME RULES: Medihelp", () => {
  it("should route to healthbridge switch", () => {
    const route = routeToSwitch("Medihelp");
    expect(route.provider).toBe("healthbridge");
  });
});

describe("SCHEME RULES: Sizwe Hosmed", () => {
  it("should route to mediswitch switch", () => {
    const route = routeToSwitch("Sizwe Hosmed");
    expect(route.provider).toBe("mediswitch");
  });
});

describe("SCHEME RULES: All Schemes in MEDICAL_AID_SCHEMES Map to Valid Switch", () => {
  const validSwitches = new Set(["healthbridge", "mediswitch", "medikred"]);

  it("should map every scheme in MEDICAL_AID_SCHEMES to a valid switch", () => {
    for (const [scheme, config] of Object.entries(MEDICAL_AID_SCHEMES)) {
      expect(validSwitches.has(config.switchRoute)).toBe(true);
    }
  });

  it("should route every scheme in MEDICAL_AID_SCHEMES to the switch specified in codes.ts", () => {
    for (const [scheme, config] of Object.entries(MEDICAL_AID_SCHEMES)) {
      const route = routeToSwitch(scheme);
      expect(route.provider).toBe(config.switchRoute);
    }
  });
});

describe("SCHEME RULES: All Switch-Router Schemes Map to Valid Switch", () => {
  it("should have all healthbridge schemes return provider 'healthbridge'", () => {
    const schemes = getSchemesForSwitch("healthbridge");
    for (const scheme of schemes) {
      const route = routeToSwitch(scheme);
      expect(route.provider).toBe("healthbridge");
    }
  });

  it("should have all mediswitch schemes return provider 'mediswitch'", () => {
    const schemes = getSchemesForSwitch("mediswitch");
    for (const scheme of schemes) {
      const route = routeToSwitch(scheme);
      expect(route.provider).toBe("mediswitch");
    }
  });

  it("should have all medikred schemes return provider 'medikred'", () => {
    const schemes = getSchemesForSwitch("medikred");
    for (const scheme of schemes) {
      const route = routeToSwitch(scheme);
      expect(route.provider).toBe("medikred");
    }
  });
});

describe("SCHEME RULES: No Scheme Maps to Two Different Switches", () => {
  it("should not have overlapping schemes across switches", () => {
    const hb = getSchemesForSwitch("healthbridge");
    const ms = getSchemesForSwitch("mediswitch");
    const mk = getSchemesForSwitch("medikred");

    const allSchemes = [...hb, ...ms, ...mk];
    const uniqueSchemes = new Set(allSchemes);
    expect(allSchemes.length).toBe(uniqueSchemes.size);
  });

  it("should produce same switch regardless of case for every known scheme", () => {
    const allSchemes = [
      ...getSchemesForSwitch("healthbridge"),
      ...getSchemesForSwitch("mediswitch"),
      ...getSchemesForSwitch("medikred"),
    ];

    for (const scheme of allSchemes) {
      const exactRoute = routeToSwitch(scheme);
      const lowerRoute = routeToSwitch(scheme.toLowerCase());
      expect(lowerRoute.provider).toBe(exactRoute.provider);
    }
  });
});

describe("SCHEME RULES: Unknown Scheme Default Behavior", () => {
  it("should default unknown scheme to healthbridge (largest switch)", () => {
    const route = routeToSwitch("Unknown Scheme XYZ 2026");
    expect(route.provider).toBe("healthbridge");
  });

  it("should default empty string to healthbridge", () => {
    const route = routeToSwitch("");
    expect(route.provider).toBe("healthbridge");
  });

  it("should default numeric-only scheme name to healthbridge", () => {
    const route = routeToSwitch("12345");
    expect(route.provider).toBe("healthbridge");
  });

  it("should default special characters to healthbridge", () => {
    const route = routeToSwitch("@#$%^&*()");
    expect(route.provider).toBe("healthbridge");
  });
});

describe("SCHEME RULES: Extended Switch Router Schemes", () => {
  // These are schemes in the switch-router but NOT in MEDICAL_AID_SCHEMES

  it("should route Profmed to healthbridge", () => {
    const route = routeToSwitch("Profmed");
    expect(route.provider).toBe("healthbridge");
  });

  it("should route Bankmed to mediswitch", () => {
    const route = routeToSwitch("Bankmed");
    expect(route.provider).toBe("mediswitch");
  });

  it("should route Medshield to mediswitch", () => {
    const route = routeToSwitch("Medshield");
    expect(route.provider).toBe("mediswitch");
  });

  it("should route Spectramed to medikred", () => {
    const route = routeToSwitch("Spectramed");
    expect(route.provider).toBe("medikred");
  });

  it("should route Keyhealth to mediswitch", () => {
    const route = routeToSwitch("Keyhealth");
    expect(route.provider).toBe("mediswitch");
  });

  it("should route Resolution Health to mediswitch", () => {
    const route = routeToSwitch("Resolution Health");
    expect(route.provider).toBe("mediswitch");
  });

  it("should route Genesis to mediswitch", () => {
    const route = routeToSwitch("Genesis");
    expect(route.provider).toBe("mediswitch");
  });

  it("should route Liberty Medical Scheme to mediswitch", () => {
    const route = routeToSwitch("Liberty Medical Scheme");
    expect(route.provider).toBe("mediswitch");
  });

  it("should route Selfmed to healthbridge", () => {
    const route = routeToSwitch("Selfmed");
    expect(route.provider).toBe("healthbridge");
  });

  it("should route LA Health to healthbridge", () => {
    const route = routeToSwitch("LA Health");
    expect(route.provider).toBe("healthbridge");
  });

  it("should route Sasolmed to healthbridge", () => {
    const route = routeToSwitch("Sasolmed");
    expect(route.provider).toBe("healthbridge");
  });

  it("should route Makoti to medikred", () => {
    const route = routeToSwitch("Makoti");
    expect(route.provider).toBe("medikred");
  });
});

describe("SCHEME RULES: Total Scheme Count Verification", () => {
  it("should have at least 10 schemes in healthbridge", () => {
    const schemes = getSchemesForSwitch("healthbridge");
    expect(schemes.length).toBeGreaterThanOrEqual(10);
  });

  it("should have at least 10 schemes in mediswitch", () => {
    const schemes = getSchemesForSwitch("mediswitch");
    expect(schemes.length).toBeGreaterThanOrEqual(10);
  });

  it("should have at least 2 schemes in medikred", () => {
    const schemes = getSchemesForSwitch("medikred");
    expect(schemes.length).toBeGreaterThanOrEqual(2);
  });

  it("should have at least 25 total known schemes across all switches", () => {
    const hb = getSchemesForSwitch("healthbridge");
    const ms = getSchemesForSwitch("mediswitch");
    const mk = getSchemesForSwitch("medikred");
    expect(hb.length + ms.length + mk.length).toBeGreaterThanOrEqual(25);
  });
});
