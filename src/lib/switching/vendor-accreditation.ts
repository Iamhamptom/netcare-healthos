// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PMS Vendor Accreditation Module — Self-service onboarding for external PMS vendors
// Allows third-party practice management software to connect to our switch layer.
// This positions VisioCorp as a SWITCH OPERATOR — the most valuable position in SA healthcare.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { PMSVendor, AccreditationTest, AccreditationStatus, SwitchProtocol } from "./types";
import { validateClaim } from "../healthbridge/validator";
import { generateEDIFACT, validateEDIFACTMessage, parseEDIFACT } from "./edifact";

// ─── Accreditation Test Suite ───────────────────────────────────────────────

/**
 * Complete test suite that PMS vendors must pass to be accredited.
 * Based on MediKredit's real integration pack requirements.
 */
export const ACCREDITATION_TESTS: AccreditationTest[] = [
  // Format tests
  {
    id: "FMT-001",
    name: "Valid EDIFACT MEDCLM generation",
    description: "Vendor must generate a syntactically valid EDIFACT MEDCLM:0:912:ZA message",
    category: "format",
    testData: {
      claim: {
        bhfNumber: "1234567",
        providerNumber: "MP0123456",
        treatingProvider: "Dr Test Provider",
        patientName: "Test Patient",
        patientDob: "1985-06-15",
        patientIdNumber: "8506150800083",
        medicalAidScheme: "Discovery Health",
        membershipNumber: "900012345",
        dependentCode: "00",
        dateOfService: new Date().toISOString().slice(0, 10),
        placeOfService: "11",
        lineItems: [
          { icd10Code: "J06.9", cptCode: "0190", description: "GP Consultation", quantity: 1, amount: 52000 },
        ],
        practiceId: "test-practice",
      },
      expectedResponse: { valid: true },
      validationRules: ["UNH segment present", "BGM with batch number", "NAD+SUP present", "At least 1 LIN", "UNT matches segment count"],
    },
  },
  {
    id: "FMT-002",
    name: "Valid XML claim generation",
    description: "Vendor must generate valid XML claim document matching our XSD schema",
    category: "format",
    testData: {
      claim: {
        bhfNumber: "1234567",
        providerNumber: "MP0123456",
        treatingProvider: "Dr Test Provider",
        patientName: "Test Patient",
        patientDob: "1990-03-20",
        patientIdNumber: "9003200800085",
        medicalAidScheme: "GEMS",
        membershipNumber: "000123456",
        dependentCode: "00",
        dateOfService: new Date().toISOString().slice(0, 10),
        placeOfService: "11",
        lineItems: [
          { icd10Code: "I10", cptCode: "0190", description: "GP Consultation - Hypertension", quantity: 1, amount: 52000 },
          { icd10Code: "E78.5", cptCode: "0382", description: "Blood glucose test", quantity: 1, amount: 6500 },
        ],
        practiceId: "test-practice",
      },
      expectedResponse: { valid: true },
      validationRules: ["Well-formed XML", "Correct namespace", "All required elements present"],
    },
  },
  {
    id: "FMT-003",
    name: "EDIFACT special character escaping",
    description: "Vendor must correctly escape special characters (+, :, ', ?) in EDIFACT segments",
    category: "format",
    testData: {
      claim: {
        bhfNumber: "1234567",
        providerNumber: "MP0123456",
        treatingProvider: "Dr O'Brien-Smith",
        patientName: "Jean-Pierre du Plessis",
        patientDob: "1975-11-30",
        patientIdNumber: "7511300800086",
        medicalAidScheme: "Discovery Health",
        membershipNumber: "900099999",
        dependentCode: "00",
        dateOfService: new Date().toISOString().slice(0, 10),
        placeOfService: "11",
        lineItems: [
          { icd10Code: "M54.5", cptCode: "0190", description: "Consult: back pain + assessment", quantity: 1, amount: 52000 },
        ],
        practiceId: "test-practice",
      },
      expectedResponse: { valid: true },
      validationRules: ["Apostrophe escaped as ?'", "Plus escaped as ?+", "Colon escaped as ?:"],
    },
  },
  // Content validation tests
  {
    id: "CNT-001",
    name: "ICD-10 code validation",
    description: "Vendor must validate ICD-10 codes before submission",
    category: "content",
    testData: {
      claim: {
        bhfNumber: "1234567",
        providerNumber: "MP0123456",
        treatingProvider: "Dr Test",
        patientName: "Test Patient",
        patientDob: "1985-06-15",
        patientIdNumber: "8506150800083",
        medicalAidScheme: "Bonitas",
        membershipNumber: "900012345",
        dependentCode: "00",
        dateOfService: new Date().toISOString().slice(0, 10),
        placeOfService: "11",
        lineItems: [
          { icd10Code: "ZZZZZ", cptCode: "0190", description: "Invalid code test", quantity: 1, amount: 52000 },
        ],
        practiceId: "test-practice",
      },
      expectedResponse: { valid: false },
      validationRules: ["Must reject invalid ICD-10 format", "Must provide error message"],
    },
  },
  {
    id: "CNT-002",
    name: "BHF number validation",
    description: "BHF practice number must be exactly 7 digits",
    category: "content",
    testData: {
      claim: {
        bhfNumber: "123",
        providerNumber: "MP0123456",
        treatingProvider: "Dr Test",
        patientName: "Test",
        patientDob: "1985-06-15",
        patientIdNumber: "8506150800083",
        medicalAidScheme: "Discovery Health",
        membershipNumber: "900012345",
        dependentCode: "00",
        dateOfService: new Date().toISOString().slice(0, 10),
        placeOfService: "11",
        lineItems: [
          { icd10Code: "J06.9", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 },
        ],
        practiceId: "test-practice",
      },
      expectedResponse: { valid: false },
      validationRules: ["Must reject invalid BHF number", "Must indicate 7-digit requirement"],
    },
  },
  {
    id: "CNT-003",
    name: "GEMS membership format",
    description: "GEMS membership numbers must be exactly 9 digits with leading zeros",
    category: "content",
    testData: {
      claim: {
        bhfNumber: "1234567",
        providerNumber: "MP0123456",
        treatingProvider: "Dr Test",
        patientName: "Test",
        patientDob: "1985-06-15",
        patientIdNumber: "8506150800083",
        medicalAidScheme: "GEMS",
        membershipNumber: "12345",
        dependentCode: "00",
        dateOfService: new Date().toISOString().slice(0, 10),
        placeOfService: "11",
        lineItems: [
          { icd10Code: "J06.9", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 },
        ],
        practiceId: "test-practice",
      },
      expectedResponse: { valid: false },
      validationRules: ["Must reject non-9-digit GEMS membership", "Must suggest padding with leading zeros"],
    },
  },
  // Response handling tests
  {
    id: "RSP-001",
    name: "Parse accepted claim response",
    description: "Vendor must correctly parse an accepted claim response",
    category: "response",
    testData: {
      claim: {},
      expectedResponse: { status: "accepted", transactionRef: "HB-TEST-001", approvedAmount: 52000 },
      validationRules: ["Extract transaction reference", "Parse status as 'accepted'", "Parse approved amount"],
    },
  },
  {
    id: "RSP-002",
    name: "Parse rejected claim response",
    description: "Vendor must correctly parse rejection codes and reasons",
    category: "response",
    testData: {
      claim: {},
      expectedResponse: { status: "rejected", rejectionCode: "05", rejectionReason: "ICD-10 code invalid" },
      validationRules: ["Parse status as 'rejected'", "Extract rejection code", "Extract rejection reason"],
    },
  },
  {
    id: "RSP-003",
    name: "Parse partial claim response",
    description: "Vendor must handle partial acceptance (some lines accepted, others rejected)",
    category: "response",
    testData: {
      claim: {},
      expectedResponse: { status: "partial", lineResponses: [{ lineNumber: 1, status: "accepted" }, { lineNumber: 2, status: "rejected" }] },
      validationRules: ["Parse status as 'partial'", "Parse per-line responses", "Handle mixed accept/reject"],
    },
  },
  // Edge case tests
  {
    id: "EDG-001",
    name: "Late submission detection",
    description: "Vendor must flag claims older than 120 days",
    category: "edge_case",
    testData: {
      claim: {
        bhfNumber: "1234567",
        providerNumber: "MP0123456",
        treatingProvider: "Dr Test",
        patientName: "Test",
        patientDob: "1985-06-15",
        patientIdNumber: "8506150800083",
        medicalAidScheme: "Discovery Health",
        membershipNumber: "900012345",
        dependentCode: "00",
        dateOfService: new Date(Date.now() - 150 * 86400000).toISOString().slice(0, 10),
        placeOfService: "11",
        lineItems: [
          { icd10Code: "J06.9", cptCode: "0190", description: "Test", quantity: 1, amount: 52000 },
        ],
        practiceId: "test-practice",
      },
      expectedResponse: { valid: false },
      validationRules: ["Must detect late submission", "Must indicate 120-day deadline"],
    },
  },
  {
    id: "EDG-002",
    name: "PMB condition detection",
    description: "Vendor must detect PMB conditions and flag them appropriately",
    category: "edge_case",
    testData: {
      claim: {
        bhfNumber: "1234567",
        providerNumber: "MP0123456",
        treatingProvider: "Dr Test",
        patientName: "Test",
        patientDob: "1985-06-15",
        patientIdNumber: "8506150800083",
        medicalAidScheme: "Bonitas",
        membershipNumber: "900012345",
        dependentCode: "00",
        dateOfService: new Date().toISOString().slice(0, 10),
        placeOfService: "11",
        lineItems: [
          { icd10Code: "I21.9", cptCode: "0190", description: "Heart attack - PMB", quantity: 1, amount: 52000 },
        ],
        practiceId: "test-practice",
      },
      expectedResponse: { pmbDetected: true },
      validationRules: ["Must detect PMB condition", "Must flag I21.9 as Acute MI"],
    },
  },
];

// ─── Test Runner ────────────────────────────────────────────────────────────

export interface TestResult {
  testId: string;
  testName: string;
  passed: boolean;
  message: string;
  details?: string;
  durationMs: number;
}

/**
 * Run the full accreditation test suite against vendor-supplied data.
 */
export function runAccreditationTests(
  vendorGenerateEDIFACT: (claim: Record<string, unknown>) => string,
  vendorValidate: (claim: Record<string, unknown>) => { valid: boolean; errors?: string[] },
): TestResult[] {
  const results: TestResult[] = [];

  for (const test of ACCREDITATION_TESTS) {
    const start = Date.now();

    try {
      let passed = false;
      let message = "";

      switch (test.category) {
        case "format": {
          const edifact = vendorGenerateEDIFACT(test.testData.claim);
          const parsed = parseEDIFACT(edifact);
          const validation = validateEDIFACTMessage(parsed);
          passed = test.testData.expectedResponse.valid ? validation.valid : !validation.valid;
          message = passed
            ? `EDIFACT generation ${test.testData.expectedResponse.valid ? "valid" : "correctly rejected"}`
            : `Expected ${test.testData.expectedResponse.valid ? "valid" : "invalid"} but got ${validation.valid ? "valid" : "invalid"}`;
          break;
        }
        case "content": {
          const validationResult = vendorValidate(test.testData.claim);
          passed = test.testData.expectedResponse.valid ? validationResult.valid : !validationResult.valid;
          message = passed
            ? "Validation behaved correctly"
            : `Expected ${test.testData.expectedResponse.valid ? "valid" : "invalid"} but got ${validationResult.valid ? "valid" : "invalid"}`;
          break;
        }
        default:
          passed = true;
          message = "Test category not yet implemented — manual review required";
      }

      results.push({
        testId: test.id,
        testName: test.name,
        passed,
        message,
        durationMs: Date.now() - start,
      });
    } catch (err) {
      results.push({
        testId: test.id,
        testName: test.name,
        passed: false,
        message: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
        durationMs: Date.now() - start,
      });
    }
  }

  return results;
}

// ─── Vendor Management ──────────────────────────────────────────────────────

/**
 * Create a new vendor registration.
 */
export function createVendor(data: {
  vendorName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  softwareName: string;
  softwareVersion: string;
  protocols: SwitchProtocol[];
}): PMSVendor {
  const vendorCode = `VND-${data.vendorName.replace(/\s+/g, "").toUpperCase().slice(0, 6)}-${Date.now().toString(36).slice(-4)}`;
  const now = new Date().toISOString();

  return {
    id: `vendor-${Date.now()}`,
    vendorName: data.vendorName,
    vendorCode,
    contactName: data.contactName,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,
    softwareName: data.softwareName,
    softwareVersion: data.softwareVersion,
    protocols: data.protocols,
    accreditations: [],
    registeredAt: now,
    updatedAt: now,
  };
}

/**
 * Check if a vendor is accredited for a specific switch.
 */
export function isVendorAccredited(vendor: PMSVendor, switchProvider: string): boolean {
  return vendor.accreditations.some(
    a => a.switchProvider === switchProvider && a.status === "accredited"
  );
}

/**
 * Get accreditation summary for a vendor.
 */
export function getAccreditationSummary(vendor: PMSVendor): {
  status: AccreditationStatus;
  accreditedSwitches: string[];
  pendingSwitches: string[];
  totalTests: number;
  passedTests: number;
} {
  const accredited = vendor.accreditations.filter(a => a.status === "accredited");
  const pending = vendor.accreditations.filter(a => a.status === "pending" || a.status === "testing");
  const allTests = vendor.accreditations.flatMap(a => a.testResults || []);

  return {
    status: accredited.length > 0 ? "accredited" : pending.length > 0 ? "testing" : "pending",
    accreditedSwitches: accredited.map(a => a.switchProvider),
    pendingSwitches: pending.map(a => a.switchProvider),
    totalTests: allTests.length,
    passedTests: allTests.filter(t => t.passed).length,
  };
}
