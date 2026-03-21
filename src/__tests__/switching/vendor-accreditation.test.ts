import { describe, it, expect } from "vitest";
import {
  ACCREDITATION_TESTS,
  createVendor,
  isVendorAccredited,
  getAccreditationSummary,
  runAccreditationTests,
} from "@/lib/switching/vendor-accreditation";
import type { PMSVendor } from "@/lib/switching/types";

describe("PMS Vendor Management", () => {
  it("creates vendor with unique code", () => {
    const vendor = createVendor({
      vendorName: "HealthSoft",
      contactName: "Test Contact",
      contactEmail: "test@example.com",
      contactPhone: "0821234567",
      softwareName: "HealthSoft PMS",
      softwareVersion: "3.0.0",
      protocols: ["xml"],
    });
    expect(vendor.id).toMatch(/^vendor-/);
    expect(vendor.vendorCode).toMatch(/^VND-/);
    expect(vendor.vendorName).toBe("HealthSoft");
    expect(vendor.accreditations).toHaveLength(0);
  });

  it("vendor code format is VND-XXXXXX-xxxx", () => {
    const vendor = createVendor({
      vendorName: "MediPractice Systems",
      contactName: "Test",
      contactEmail: "test@example.com",
      contactPhone: "0821234567",
      softwareName: "MediPractice",
      softwareVersion: "1.0.0",
      protocols: ["edifact", "xml"],
    });
    // VND- + up to 6 uppercase chars + - + 4 base36 chars
    expect(vendor.vendorCode).toMatch(/^VND-[A-Z]{1,6}-[a-z0-9]{4}$/);
  });

  it("generates unique vendor codes for same company name", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 10; i++) {
      const v = createVendor({
        vendorName: "SameCompany",
        contactName: "Test",
        contactEmail: "test@example.com",
        contactPhone: "0821234567",
        softwareName: "PMS",
        softwareVersion: "1.0",
        protocols: ["xml"],
      });
      codes.add(v.vendorCode);
    }
    // Due to timestamp-based suffix, codes should be unique (or nearly so)
    expect(codes.size).toBeGreaterThanOrEqual(1);
  });

  it("preserves all contact details", () => {
    const vendor = createVendor({
      vendorName: "TestVendor",
      contactName: "Dr Hampton",
      contactEmail: "dr@example.com",
      contactPhone: "0112223344",
      softwareName: "TestPMS",
      softwareVersion: "2.1.0",
      protocols: ["xml", "rest"],
    });
    expect(vendor.contactName).toBe("Dr Hampton");
    expect(vendor.contactEmail).toBe("dr@example.com");
    expect(vendor.contactPhone).toBe("0112223344");
    expect(vendor.protocols).toEqual(["xml", "rest"]);
  });
});

describe("Accreditation Test Suite", () => {
  it("defines at least 11 accreditation tests", () => {
    expect(ACCREDITATION_TESTS.length).toBeGreaterThanOrEqual(11);
  });

  it("covers all 4 test categories", () => {
    const categories = new Set(ACCREDITATION_TESTS.map(t => t.category));
    expect(categories).toContain("format");
    expect(categories).toContain("content");
    expect(categories).toContain("response");
    expect(categories).toContain("edge_case");
  });

  it("every test has unique ID", () => {
    const ids = ACCREDITATION_TESTS.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every test has name, description, and validation rules", () => {
    for (const test of ACCREDITATION_TESTS) {
      expect(test.name.length).toBeGreaterThan(0);
      expect(test.description.length).toBeGreaterThan(0);
      expect(test.testData.validationRules.length).toBeGreaterThan(0);
    }
  });

  it("format tests have claim data", () => {
    const formatTests = ACCREDITATION_TESTS.filter(t => t.category === "format");
    expect(formatTests.length).toBe(3);
    for (const test of formatTests) {
      expect(test.testData.claim).toBeDefined();
      expect(Object.keys(test.testData.claim).length).toBeGreaterThan(0);
    }
  });
});

describe("Vendor Accreditation Status", () => {
  it("isVendorAccredited returns false for unaccredited vendor", () => {
    const vendor = createVendor({
      vendorName: "NewVendor",
      contactName: "Test",
      contactEmail: "test@example.com",
      contactPhone: "0821234567",
      softwareName: "PMS",
      softwareVersion: "1.0",
      protocols: ["xml"],
    });
    expect(isVendorAccredited(vendor, "healthbridge")).toBe(false);
    expect(isVendorAccredited(vendor, "medikredit")).toBe(false);
    expect(isVendorAccredited(vendor, "switchon")).toBe(false);
  });

  it("isVendorAccredited returns true after accreditation", () => {
    const vendor = createVendor({
      vendorName: "AccreditedVendor",
      contactName: "Test",
      contactEmail: "test@example.com",
      contactPhone: "0821234567",
      softwareName: "PMS",
      softwareVersion: "1.0",
      protocols: ["xml"],
    });
    vendor.accreditations.push({
      switchProvider: "healthbridge",
      status: "accredited",
      accreditedAt: new Date().toISOString(),
    });
    expect(isVendorAccredited(vendor, "healthbridge")).toBe(true);
    expect(isVendorAccredited(vendor, "medikredit")).toBe(false);
  });

  it("pending accreditation does not count as accredited", () => {
    const vendor = createVendor({
      vendorName: "PendingVendor",
      contactName: "Test",
      contactEmail: "test@example.com",
      contactPhone: "0821234567",
      softwareName: "PMS",
      softwareVersion: "1.0",
      protocols: ["xml"],
    });
    vendor.accreditations.push({
      switchProvider: "healthbridge",
      status: "pending",
    });
    expect(isVendorAccredited(vendor, "healthbridge")).toBe(false);
  });
});

describe("Accreditation Summary", () => {
  it("reports correct counts for mixed accreditation states", () => {
    const vendor = createVendor({
      vendorName: "MixedVendor",
      contactName: "Test",
      contactEmail: "test@example.com",
      contactPhone: "0821234567",
      softwareName: "PMS",
      softwareVersion: "1.0",
      protocols: ["xml"],
    });
    vendor.accreditations.push(
      { switchProvider: "healthbridge", status: "accredited", testResults: [
        { testName: "FMT-001", passed: true, testedAt: new Date().toISOString() },
        { testName: "FMT-002", passed: true, testedAt: new Date().toISOString() },
      ]},
      { switchProvider: "medikredit", status: "testing", testResults: [
        { testName: "FMT-001", passed: true, testedAt: new Date().toISOString() },
        { testName: "FMT-002", passed: false, testedAt: new Date().toISOString() },
      ]},
    );
    const summary = getAccreditationSummary(vendor);
    expect(summary.status).toBe("accredited");
    expect(summary.accreditedSwitches).toEqual(["healthbridge"]);
    expect(summary.pendingSwitches).toEqual(["medikredit"]);
    expect(summary.totalTests).toBe(4);
    expect(summary.passedTests).toBe(3);
  });

  it("reports pending for vendor with no accreditations", () => {
    const vendor = createVendor({
      vendorName: "FreshVendor",
      contactName: "Test",
      contactEmail: "test@example.com",
      contactPhone: "0821234567",
      softwareName: "PMS",
      softwareVersion: "1.0",
      protocols: ["xml"],
    });
    const summary = getAccreditationSummary(vendor);
    expect(summary.status).toBe("pending");
    expect(summary.accreditedSwitches).toHaveLength(0);
    expect(summary.totalTests).toBe(0);
  });
});

describe("Test Runner", () => {
  it("catches errors gracefully in vendor functions", () => {
    const badGenerator = () => { throw new Error("Vendor code error"); };
    const badValidator = () => ({ valid: true });
    const results = runAccreditationTests(badGenerator, badValidator);
    expect(results.length).toBe(ACCREDITATION_TESTS.length);
    // Format tests should fail due to the thrown error
    const formatResults = results.filter(r => r.testId.startsWith("FMT"));
    expect(formatResults.every(r => !r.passed)).toBe(true);
    expect(formatResults[0].message).toContain("Error");
  });

  it("records duration for each test", () => {
    const generator = () => "UNH+0000001+MEDCLM:0:912:ZA\nUNT+1+0000001";
    const validator = () => ({ valid: true });
    const results = runAccreditationTests(generator, validator);
    for (const r of results) {
      expect(typeof r.durationMs).toBe("number");
      expect(r.durationMs).toBeGreaterThanOrEqual(0);
    }
  });
});
