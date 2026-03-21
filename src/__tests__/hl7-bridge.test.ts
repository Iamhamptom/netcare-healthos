// Comprehensive test suite for CareOn/iMedOne Bridge
// Tests: HL7v2 parser, FHIR mapper, security layer, bridge adapter, demo data integrity

import { describe, it, expect, beforeEach } from "vitest";
import {
  parseHL7Message,
  extractPatient,
  extractEncounter,
  extractObservations,
  extractDiagnoses,
  extractOrders,
  hl7TimestampToISO,
  generateACK,
} from "@/lib/hl7/parser";
import {
  mapPatientToFHIR,
  mapEncounterToFHIR,
  mapObservationToFHIR,
  mapDiagnosisToFHIR,
} from "@/lib/hl7/fhir-mapper";
import {
  verifyWebhookSignature,
  validateBridgeAuth,
  maskIdNumber,
  maskPhone,
  maskName,
  maskMedicalAidNo,
  getDeidentLevel,
  deidentifyAdvisory,
  hasAccessToFacility,
  logBridgeAudit,
  getBridgeAuditLog,
} from "@/lib/hl7/security";
import { detectTrafficAnomalies } from "@/lib/hl7/ai-advisor";
import { processHL7Message, getAdvisories, getMessageLog, resolveAdvisory, getBridgeStats } from "@/lib/careon-bridge";
import { DEMO_HL7_MESSAGES, DEMO_ADVISORIES, DEMO_MESSAGE_LOG } from "@/lib/hl7/demo-messages";

// ── Test Fixtures ──

const ENC = "^~\\&";
const ADMIT_MSG = [
  `MSH|${ENC}|CAREON|NETCARE_MILPARK|VISIOHEALTH|NETCARE_OS|20260320091500||ADT^A01|MSG001|P|2.4`,
  `PID|||MRN-4521^^^8501015800086||VAN_DER_MERWE^JOHAN||19850101|M|||42 Oak Avenue^Sandton^Gauteng^2196||+27824561234`,
  `PV1||I|ORTHO^^BED-12^MILPARK||||NAIDOO^PRIYA^DR||||||||||||V-20260320-001|||||||||||||||||||||||20260320091500`,
  `IN1||||DISCOVERY^Discovery Health Medical Scheme|||||||||||||||||||||||||||||||Executive Plan|DH-001-4521-88`,
  `DG1|1|ICD10|M17.1^Primary gonarthrosis, unilateral||20260320|A`,
  `DG1|2|ICD10|E11.9^Type 2 diabetes mellitus without complications||20260320|W`,
].join("\r");

const LAB_MSG = [
  `MSH|${ENC}|CAREON|NETCARE_GARDEN_CITY|VISIOHEALTH|NETCARE_OS|20260320110000||ORU^R01|MSG003|P|2.4`,
  `PID|||MRN-3341^^^9202280800085||DLAMINI^NOMSA||19920228|F|||7 Jacaranda St^Mamelodi^Gauteng^0122||+27769876543`,
  `PV1||O|PATH^^^GARDEN_CITY||||BOTHA^ANNA^DR`,
  `OBX|1|NM|2339-0^Glucose [Mass/volume] in Blood||7.8|mmol/L|3.9-5.6|H|||F|||20260320103000`,
  `OBX|2|NM|4548-4^Hemoglobin A1c/Hemoglobin.total in Blood||8.2|%|4.0-5.6|HH|||F|||20260320103000`,
  `OBX|3|NM|718-7^Hemoglobin [Mass/volume] in Blood||13.2|g/dL|12.0-16.0|N|||F|||20260320103000`,
].join("\r");

const ORDER_MSG = [
  `MSH|${ENC}|CAREON|NETCARE_CBMH|VISIOHEALTH|NETCARE_OS|20260320120000||ORM^O01|MSG005|P|2.4`,
  `PID|||MRN-6678^^^6808235800082||WILLIAMS^PETER||19680823|M`,
  `PV1||I|NEURO^^BED-07^CBMH||||KHAN^AHMED^DR||||||||||||V-20260319-112`,
  `ORC|NW|ORD-20260320-001`,
  `OBR||ORD-20260320-001||70553^CT Brain without contrast|S||20260320120000||||||||KHAN^AHMED^DR`,
].join("\r");

const MINIMAL_MSG = `MSH|${ENC}|TEST|TEST_FAC|RECV|RECV_FAC|20260320120000||ADT^A08|MSGMIN|P|2.4`;

// ── HL7v2 Parser Tests ──

describe("HL7v2 Parser", () => {
  describe("parseHL7Message", () => {
    it("parses MSH header correctly from ADT message", async () => {
      const msg = parseHL7Message(ADMIT_MSG);
      expect(msg.messageType).toBe("ADT^A01");
      expect(msg.messageId).toBe("MSG001");
      expect(msg.sendingApp).toBe("CAREON");
      expect(msg.sendingFacility).toBe("NETCARE_MILPARK");
      expect(msg.receivingApp).toBe("VISIOHEALTH");
      expect(msg.receivingFacility).toBe("NETCARE_OS");
      expect(msg.timestamp).toBe("20260320091500");
      expect(msg.version).toBe("2.4");
    });

    it("parses MSH header from ORU message", async () => {
      const msg = parseHL7Message(LAB_MSG);
      expect(msg.messageType).toBe("ORU^R01");
      expect(msg.messageId).toBe("MSG003");
      expect(msg.sendingFacility).toBe("NETCARE_GARDEN_CITY");
    });

    it("parses MSH header from ORM message", async () => {
      const msg = parseHL7Message(ORDER_MSG);
      expect(msg.messageType).toBe("ORM^O01");
      expect(msg.messageId).toBe("MSG005");
    });

    it("handles different line endings (LF, CR, CRLF)", async () => {
      const lfMsg = MINIMAL_MSG.replace(/\r/g, "\n");
      const crlfMsg = MINIMAL_MSG.replace(/\r/g, "\r\n");
      expect(parseHL7Message(lfMsg).messageType).toBe("ADT^A08");
      expect(parseHL7Message(crlfMsg).messageType).toBe("ADT^A08");
    });

    it("throws on invalid message without MSH", async () => {
      expect(() => parseHL7Message("PID|||12345")).toThrow("Invalid HL7 message: no MSH segment");
    });

    it("throws on empty string", async () => {
      expect(() => parseHL7Message("")).toThrow();
    });

    it("finds correct number of segments", async () => {
      const msg = parseHL7Message(ADMIT_MSG);
      expect(msg.segments.length).toBe(6); // MSH, PID, PV1, IN1, DG1, DG1
    });

    it("parses minimal message with only MSH", async () => {
      const msg = parseHL7Message(MINIMAL_MSG);
      expect(msg.messageType).toBe("ADT^A08");
      expect(msg.segments.length).toBe(1);
    });
  });

  describe("extractPatient", () => {
    it("extracts patient demographics from ADT message", async () => {
      const msg = parseHL7Message(ADMIT_MSG);
      const patient = extractPatient(msg);
      expect(patient).not.toBeNull();
      expect(patient!.id).toBe("MRN-4521");
      expect(patient!.idNumber).toBe("8501015800086");
      expect(patient!.surname).toBe("VAN_DER_MERWE");
      expect(patient!.firstName).toBe("JOHAN");
      expect(patient!.dateOfBirth).toBe("19850101");
      expect(patient!.gender).toBe("M");
    });

    it("extracts medical aid from IN1 segment", async () => {
      const msg = parseHL7Message(ADMIT_MSG);
      const patient = extractPatient(msg);
      expect(patient!.medicalAidScheme).toBe("DISCOVERY");
      expect(patient!.medicalAidPlan).toBe("Executive Plan");
      expect(patient!.medicalAidNo).toBe("DH-001-4521-88");
    });

    it("returns null when no PID segment", async () => {
      const msg = parseHL7Message(MINIMAL_MSG);
      expect(extractPatient(msg)).toBeNull();
    });

    it("handles patient without IN1 segment", async () => {
      const noInsMsg = [
        `MSH|${ENC}|TEST|FAC|R|RF|20260320120000||ADT^A01|M1|P|2.4`,
        `PID|||MRN-999^^^||SMITH^JANE||19900101|F`,
      ].join("\r");
      const patient = extractPatient(parseHL7Message(noInsMsg));
      expect(patient).not.toBeNull();
      expect(patient!.medicalAidScheme).toBe("");
      expect(patient!.medicalAidNo).toBe("");
    });

    it("extracts phone and address correctly", async () => {
      const msg = parseHL7Message(ADMIT_MSG);
      const patient = extractPatient(msg);
      expect(patient!.phone).toBe("+27824561234");
      expect(patient!.address).toContain("42 Oak Avenue");
      expect(patient!.address).toContain("Sandton");
    });
  });

  describe("extractEncounter", () => {
    it("extracts encounter from PV1 segment", async () => {
      const msg = parseHL7Message(ADMIT_MSG);
      const enc = extractEncounter(msg);
      expect(enc).not.toBeNull();
      expect(enc!.visitId).toBe("V-20260320-001");
      expect(enc!.patientClass).toBe("I");
      expect(enc!.ward).toBe("ORTHO");
      expect(enc!.bed).toBe("BED-12");
      expect(enc!.facility).toBe("MILPARK");
    });

    it("extracts attending doctor name", async () => {
      const msg = parseHL7Message(ADMIT_MSG);
      const enc = extractEncounter(msg);
      expect(enc!.attendingDoctor).toContain("PRIYA");
      expect(enc!.attendingDoctor).toContain("NAIDOO");
    });

    it("returns null when no PV1 segment", async () => {
      const noPV1 = `MSH|${ENC}|T|F|R|RF|20260320120000||ADT^A01|M1|P|2.4\rPID|||MRN-1`;
      expect(extractEncounter(parseHL7Message(noPV1))).toBeNull();
    });
  });

  describe("extractObservations", () => {
    it("extracts all OBX segments from lab message", async () => {
      const msg = parseHL7Message(LAB_MSG);
      const obs = extractObservations(msg);
      expect(obs.length).toBe(3);
    });

    it("parses observation values and flags correctly", async () => {
      const msg = parseHL7Message(LAB_MSG);
      const obs = extractObservations(msg);
      
      const glucose = obs.find(o => o.code === "2339-0");
      expect(glucose).toBeDefined();
      expect(glucose!.value).toBe("7.8");
      expect(glucose!.unit).toBe("mmol/L");
      expect(glucose!.abnormalFlag).toBe("H");
      expect(glucose!.status).toBe("F");

      const hba1c = obs.find(o => o.code === "4548-4");
      expect(hba1c).toBeDefined();
      expect(hba1c!.value).toBe("8.2");
      expect(hba1c!.abnormalFlag).toBe("HH"); // Critically high

      const hgb = obs.find(o => o.code === "718-7");
      expect(hgb).toBeDefined();
      expect(hgb!.abnormalFlag).toBe("N"); // Normal
    });

    it("returns empty array when no OBX segments", async () => {
      const msg = parseHL7Message(ADMIT_MSG);
      expect(extractObservations(msg)).toEqual([]);
    });
  });

  describe("extractDiagnoses", () => {
    it("extracts all DG1 segments", async () => {
      const msg = parseHL7Message(ADMIT_MSG);
      const dx = extractDiagnoses(msg);
      expect(dx.length).toBe(2);
    });

    it("parses ICD-10 codes correctly", async () => {
      const msg = parseHL7Message(ADMIT_MSG);
      const dx = extractDiagnoses(msg);
      expect(dx[0].code).toBe("M17.1");
      expect(dx[0].description).toBe("Primary gonarthrosis, unilateral");
      expect(dx[0].type).toBe("A"); // Admitting
      expect(dx[1].code).toBe("E11.9");
      expect(dx[1].type).toBe("W"); // Working
    });
  });

  describe("extractOrders", () => {
    it("extracts ORC/OBR order pairs", async () => {
      const msg = parseHL7Message(ORDER_MSG);
      const orders = extractOrders(msg);
      expect(orders.length).toBe(1);
      expect(orders[0].orderId).toBe("ORD-20260320-001");
      expect(orders[0].orderControl).toBe("NW");
      expect(orders[0].orderType).toBe("70553");
      expect(orders[0].orderName).toBe("CT Brain without contrast");
      expect(orders[0].priority).toBe("S"); // Stat
    });

    it("returns empty when no ORC segments", async () => {
      const msg = parseHL7Message(ADMIT_MSG);
      expect(extractOrders(msg)).toEqual([]);
    });
  });

  describe("hl7TimestampToISO", () => {
    it("converts full timestamp", async () => {
      expect(hl7TimestampToISO("20260320091500")).toBe("2026-03-20T09:15:00+02:00");
    });

    it("handles date-only (8 chars)", async () => {
      expect(hl7TimestampToISO("20260320")).toBe("2026-03-20T00:00:00+02:00");
    });

    it("returns empty for short/empty strings", async () => {
      expect(hl7TimestampToISO("")).toBe("");
      expect(hl7TimestampToISO("2026")).toBe("");
    });
  });

  describe("generateACK", () => {
    it("generates valid ACK with AA code", async () => {
      const msg = parseHL7Message(ADMIT_MSG);
      const ack = generateACK(msg, "AA");
      expect(ack).toContain("MSH|");
      expect(ack).toContain("ACK");
      expect(ack).toContain("MSA|AA|MSG001");
    });

    it("generates error ACK with AE code", async () => {
      const msg = parseHL7Message(ADMIT_MSG);
      const ack = generateACK(msg, "AE");
      expect(ack).toContain("MSA|AE|MSG001");
    });
  });
});

// ── FHIR R4 Mapper Tests ──

describe("FHIR R4 Mapper", () => {
  const msg = parseHL7Message(ADMIT_MSG);
  const patient = extractPatient(msg)!;
  const encounter = extractEncounter(msg)!;
  const labMsg = parseHL7Message(LAB_MSG);
  const observations = extractObservations(labMsg);
  const diagnoses = extractDiagnoses(msg);

  describe("mapPatientToFHIR", () => {
    it("creates valid FHIR Patient resource", async () => {
      const fhir = mapPatientToFHIR(patient);
      expect(fhir.resourceType).toBe("Patient");
      expect(fhir.id).toBe("MRN-4521");
      expect(fhir.name[0].family).toBe("VAN_DER_MERWE");
      expect(fhir.name[0].given).toEqual(["JOHAN"]);
      expect(fhir.gender).toBe("male");
      expect(fhir.birthDate).toBe("1985-01-01");
    });

    it("includes MRN and SA ID identifiers", async () => {
      const fhir = mapPatientToFHIR(patient);
      expect(fhir.identifier.length).toBeGreaterThanOrEqual(2);
      expect(fhir.identifier.find(id => id.system === "urn:netcare:mrn")).toBeDefined();
      expect(fhir.identifier.find(id => id.system === "urn:za:id")).toBeDefined();
    });

    it("includes medical aid identifier", async () => {
      const fhir = mapPatientToFHIR(patient);
      const maId = fhir.identifier.find(id => id.system.includes("medical-aid"));
      expect(maId).toBeDefined();
      expect(maId!.value).toBe("DH-001-4521-88");
    });
  });

  describe("mapEncounterToFHIR", () => {
    it("creates valid FHIR Encounter", async () => {
      const fhir = mapEncounterToFHIR(encounter, patient.id);
      expect(fhir.resourceType).toBe("Encounter");
      expect(fhir.status).toBe("in-progress"); // No discharge date in admit
      expect(fhir.class.code).toBe("IMP");
      expect(fhir.subject.reference).toBe("Patient/MRN-4521");
    });
  });

  describe("mapObservationToFHIR", () => {
    it("maps numeric observation correctly", async () => {
      const glucose = observations.find(o => o.code === "2339-0")!;
      const fhir = mapObservationToFHIR(glucose, "MRN-3341");
      expect(fhir.resourceType).toBe("Observation");
      expect(fhir.valueQuantity?.value).toBe(7.8);
      expect(fhir.valueQuantity?.unit).toBe("mmol/L");
    });

    it("maps abnormal flag to interpretation", async () => {
      const hba1c = observations.find(o => o.code === "4548-4")!;
      const fhir = mapObservationToFHIR(hba1c, "MRN-3341");
      expect(fhir.interpretation).toBeDefined();
      expect(fhir.interpretation![0].coding[0].code).toBe("HH");
    });

    it("detects LOINC codes correctly", async () => {
      const glucose = observations.find(o => o.code === "2339-0")!;
      const fhir = mapObservationToFHIR(glucose, "MRN-3341");
      expect(fhir.code.coding[0].system).toBe("http://loinc.org");
    });
  });

  describe("mapDiagnosisToFHIR", () => {
    it("creates valid FHIR Condition", async () => {
      const fhir = mapDiagnosisToFHIR(diagnoses[0], patient.id, encounter.visitId);
      expect(fhir.resourceType).toBe("Condition");
      expect(fhir.code.coding[0].code).toBe("M17.1");
      expect(fhir.code.coding[0].system).toBe("http://hl7.org/fhir/sid/icd-10");
      expect(fhir.subject.reference).toBe("Patient/MRN-4521");
    });
  });
});

// ── Security Tests ──

describe("Security Layer", () => {
  describe("verifyWebhookSignature", () => {
    it("returns false for null signature", async () => {
      expect(verifyWebhookSignature("payload", null, "secret")).toBe(false);
    });

    it("returns false for wrong signature", async () => {
      expect(verifyWebhookSignature("payload", "deadbeef", "secret")).toBe(false);
    });

    it("verifies correct HMAC-SHA256 signature", async () => {
      const crypto = require("crypto");
      const secret = "test-secret-key";
      const payload = "test-payload";
      const sig = crypto.createHmac("sha256", secret).update(payload, "utf8").digest("hex");
      expect(verifyWebhookSignature(payload, sig, secret)).toBe(true);
    });

    it("rejects tampered payload", async () => {
      const crypto = require("crypto");
      const secret = "test-secret-key";
      const sig = crypto.createHmac("sha256", secret).update("original", "utf8").digest("hex");
      expect(verifyWebhookSignature("tampered", sig, secret)).toBe(false);
    });
  });

  describe("Data De-identification", () => {
    it("masks SA ID number correctly", async () => {
      expect(maskIdNumber("8501015800086")).toBe("850101****086");
    });

    it("masks phone number correctly", async () => {
      expect(maskPhone("+27824561234")).toBe("+27***1234");
    });

    it("masks patient name correctly", async () => {
      expect(maskName("Johan van der Merwe")).toBe("J. v** d** M**");
    });

    it("masks medical aid number", async () => {
      expect(maskMedicalAidNo("DH-001-4521-88")).toBe("DH-***-****-88");
    });

    it("handles empty/short strings gracefully", async () => {
      expect(maskIdNumber("")).toBe("");
      expect(maskPhone("")).toBe("");
      expect(maskName("")).toBe("");
      expect(maskMedicalAidNo("")).toBe("");
      expect(maskIdNumber("12345")).toBe("12345"); // too short
    });
  });

  describe("Role-based De-identification", () => {
    it("platform_admin sees everything", async () => {
      const level = getDeidentLevel("platform_admin");
      expect(level.level).toBe("none");
      expect(level.showPatientName).toBe(true);
      expect(level.showIdNumber).toBe(true);
    });

    it("receptionist gets partial masking", async () => {
      const level = getDeidentLevel("receptionist");
      expect(level.level).toBe("partial");
      expect(level.showPatientName).toBe(true);
      expect(level.showIdNumber).toBe(false);
      expect(level.showPhone).toBe(false);
    });

    it("unknown role gets full masking", async () => {
      const level = getDeidentLevel("visitor");
      expect(level.level).toBe("full");
      expect(level.showPatientName).toBe(false);
    });

    it("deidentifyAdvisory masks name for full level", async () => {
      const advisory = { patientName: "Johan van der Merwe", patientMRN: "MRN-4521" };
      const masked = deidentifyAdvisory(advisory, "visitor");
      expect(masked.patientName).toBe("J. v** d** M**");
      expect(masked.patientMRN).toBe("MRN-****");
    });

    it("deidentifyAdvisory preserves name for admin", async () => {
      const advisory = { patientName: "Johan van der Merwe", patientMRN: "MRN-4521" };
      const preserved = deidentifyAdvisory(advisory, "admin");
      expect(preserved.patientName).toBe("Johan van der Merwe");
    });
  });

  describe("Facility Access Control", () => {
    it("platform_admin always has access", async () => {
      expect(hasAccessToFacility([], "Netcare Milpark Hospital", "platform_admin")).toBe(true);
    });

    it("user with matching facility code has access", async () => {
      expect(hasAccessToFacility(["milpark"], "Netcare Milpark Hospital", "admin")).toBe(true);
    });

    it("user without matching facility code denied", async () => {
      expect(hasAccessToFacility(["sandton"], "Netcare Milpark Hospital", "admin")).toBe(false);
    });

    it("empty facility codes allows all (backwards compat)", async () => {
      expect(hasAccessToFacility([], "Any Facility", "admin")).toBe(true);
    });
  });

  describe("Audit Logging", () => {
    it("logs and retrieves audit entries", async () => {
      logBridgeAudit({
        action: "test_action",
        userId: "test-user",
        userName: "Test User",
        userRole: "admin",
        detail: "Test detail",
      });
      const logs = getBridgeAuditLog(1);
      expect(logs.length).toBeGreaterThanOrEqual(1);
      expect(logs[0].action).toBe("test_action");
      expect(logs[0].timestamp).toBeDefined();
    });
  });
});

// ── Bridge Adapter Tests ──

describe("CareOn Bridge Adapter", () => {
  describe("processHL7Message", () => {
    it("processes ADT admit and generates advisories", async () => {
      const result = processHL7Message(ADMIT_MSG);
      expect(result.ack).toContain("MSA|AA|MSG001");
      expect(result.advisories.length).toBeGreaterThan(0);
      expect(result.logEntry.messageType).toBe("ADT^A01");
      expect(result.logEntry.patientMRN).toBe("MRN-4521");
    });

    it("processes ORU lab results", async () => {
      const result = processHL7Message(LAB_MSG);
      expect(result.ack).toContain("MSA|AA|MSG003");
      expect(result.logEntry.messageType).toBe("ORU^R01");
    });

    it("processes ORM orders", async () => {
      const result = processHL7Message(ORDER_MSG);
      expect(result.ack).toContain("MSA|AA|MSG005");
      expect(result.logEntry.messageType).toBe("ORM^O01");
    });

    it("generates billing advisory for admit with diagnoses", async () => {
      const result = processHL7Message(ADMIT_MSG);
      const billing = result.advisories.find(a => a.category === "billing");
      expect(billing).toBeDefined();
      expect(billing!.suggestedICD10.length).toBe(2);
      expect(billing!.suggestedICD10[0].code).toBe("M17.1");
    });

    it("generates eligibility advisory for patient with scheme", async () => {
      const result = processHL7Message(ADMIT_MSG);
      const elig = result.advisories.find(a => a.category === "eligibility");
      expect(elig).toBeDefined();
      expect(elig!.title).toContain("DISCOVERY");
    });

    it("generates critical advisory for abnormal lab values", async () => {
      const result = processHL7Message(LAB_MSG);
      const clinical = result.advisories.find(a => a.category === "clinical");
      expect(clinical).toBeDefined();
      expect(clinical!.severity).toBe("critical"); // HH flag present
    });

    it("generates order advisory for pre-auth check", async () => {
      const result = processHL7Message(ORDER_MSG);
      const compliance = result.advisories.find(a => a.category === "compliance");
      expect(compliance).toBeDefined();
      expect(compliance!.title).toContain("Pre-Authorization");
    });

    it("tracks processing time", async () => {
      const result = processHL7Message(ADMIT_MSG);
      expect(result.logEntry.processingTimeMs).toBeGreaterThanOrEqual(0);
      expect(result.logEntry.processingTimeMs).toBeLessThan(1000); // Should be fast
    });
  });

  describe("Advisory Resolution", () => {
    it("resolves advisory with generate_claim action", async () => {
      const advisories = await getAdvisories({ limit: 1 });
      if (advisories.length === 0) return; // Skip if no advisories
      const unresolvedAdv = advisories.find(a => !a.resolution);
      if (!unresolvedAdv) return;

      const result = await resolveAdvisory(unresolvedAdv.id, "generate_claim", "Test User");
      expect(result.success).toBe(true);
      expect(result.advisory?.resolution?.action).toBe("generate_claim");
      expect(result.advisory?.resolution?.claimDraftId).toBeDefined();
      expect(result.advisory?.resolution?.claimDraftId).toMatch(/^CLM-/);
    });

    it("prevents double resolution", async () => {
      const advisories = await getAdvisories({ limit: 10 });
      const resolved = advisories.find(a => a.resolution);
      if (!resolved) return;
      const result = await resolveAdvisory(resolved.id, "dismiss", "Test User");
      expect(result.success).toBe(false);
      expect(result.error).toContain("already resolved");
    });

    it("returns error for non-existent advisory", async () => {
      const result = await resolveAdvisory("nonexistent-id", "resolve", "Test User");
      expect(result.success).toBe(false);
      expect(result.error).toContain("not found");
    });
  });

  describe("Bridge Stats", () => {
    it("returns valid stats structure", async () => {
      const stats = await getBridgeStats();
      expect(stats.connection).toBeDefined();
      expect(stats.connection.facilitiesOnline).toBeGreaterThan(0);
      expect(stats.messages).toBeDefined();
      expect(stats.advisories).toBeDefined();
      expect(stats.advisories.total).toBeGreaterThan(0);
    });
  });
});

// ── Demo Data Integrity Tests ──

describe("Demo Data Integrity", () => {
  it("all demo HL7 messages parse without errors", async () => {
    for (const [key, raw] of Object.entries(DEMO_HL7_MESSAGES)) {
      expect(() => parseHL7Message(raw)).not.toThrow();
      const msg = parseHL7Message(raw);
      expect(msg.sendingApp).toBe("CAREON");
      expect(msg.messageId).toBeTruthy();
    }
  });

  it("all demo advisories have required fields", async () => {
    for (const adv of DEMO_ADVISORIES) {
      expect(adv.id).toBeTruthy();
      expect(adv.patientMRN).toBeTruthy();
      expect(adv.patientName).toBeTruthy();
      expect(adv.facility).toBeTruthy();
      expect(adv.category).toBeTruthy();
      expect(adv.severity).toBeTruthy();
      expect(adv.title).toBeTruthy();
      expect(adv.description.length).toBeGreaterThan(20);
      expect(["info", "warning", "critical", "success"]).toContain(adv.severity);
      expect(["billing", "coding", "compliance", "clinical", "eligibility"]).toContain(adv.category);
    }
  });

  it("all demo message logs have valid types", async () => {
    const validTypes = ["ADT^A01", "ADT^A02", "ADT^A03", "ADT^A04", "ADT^A08", "ORU^R01", "ORM^O01"];
    for (const log of DEMO_MESSAGE_LOG) {
      expect(validTypes).toContain(log.messageType);
      expect(log.processingTimeMs).toBeGreaterThan(0);
    }
  });

  it("demo HL7 messages produce correct patient data", async () => {
    const msg = parseHL7Message(DEMO_HL7_MESSAGES.admit_milpark);
    const patient = extractPatient(msg);
    expect(patient).not.toBeNull();
    expect(patient!.surname).toBe("VAN_DER_MERWE");
    expect(patient!.medicalAidScheme).toBe("DISCOVERY");
  });
});

// ── Anomaly Detection Tests ──

describe("Traffic Anomaly Detection", () => {
  it("detects volume drop for offline facility", async () => {
    const facilities = [
      { name: "Fac A", code: "A", connected: true, messageCount24h: 150 },
      { name: "Fac B", code: "B", connected: true, messageCount24h: 160 },
      { name: "Fac C", code: "C", connected: false, messageCount24h: 5 },
      { name: "Fac D", code: "D", connected: true, messageCount24h: 145 }, // Way below average
    ];
    const anomalies = detectTrafficAnomalies(facilities);
    const drop = anomalies.find(a => a.facility === "Fac C" && a.type === "volume_drop");
    expect(drop).toBeDefined();
    expect(drop!.severity).toBe("critical"); // Offline + volume drop
  });

  it("returns empty for normal traffic", async () => {
    const facilities = [
      { name: "Fac A", code: "A", connected: true, messageCount24h: 100 },
      { name: "Fac B", code: "B", connected: true, messageCount24h: 110 },
      { name: "Fac C", code: "C", connected: true, messageCount24h: 95 },
    ];
    const anomalies = detectTrafficAnomalies(facilities);
    expect(anomalies.length).toBe(0);
  });
});

// ── LOINC Code Detection Bug Test ──

describe("LOINC Code Detection (Bug Fix)", () => {
  it("detects standard LOINC codes with varying lengths", async () => {
    const codes = ["2339-0", "4548-4", "718-7", "2093-3", "2571-8", "2160-0"];
    for (const code of codes) {
      const obs = { id: "1", code, codeName: "Test", value: "1", unit: "x", referenceRange: "", abnormalFlag: "N", status: "F", observationDate: "" };
      const fhir = mapObservationToFHIR(obs, "test");
      expect(fhir.code.coding[0].system).toBe("http://loinc.org");
    }
  });
});
