// HL7v2 Message Parser
// Parses raw HL7v2 pipe-delimited messages from CareOn/iMedOne
// Supports ADT (patient movement), ORU (lab results), ORM (orders), DFT (charges)

import type {
  HL7Segment, HL7Message, HL7Patient, HL7Encounter,
  HL7Observation, HL7Diagnosis, HL7Order,
} from "./types";

const SEGMENT_DELIMITER = "\r";
const FIELD_DELIMITER = "|";
const COMPONENT_DELIMITER = "^";
// HL7v2 standard encoding characters
const HL7_ENCODING_CHARS = ["^", "~", String.fromCharCode(92), "&"].join("");

/** Parse a raw HL7v2 message string into structured segments */
export function parseHL7Message(raw: string): HL7Message {
  const normalized = raw.replace(/\r\n/g, "\r").replace(/\n/g, "\r").trim();
  const lines = normalized.split(SEGMENT_DELIMITER).filter(Boolean);

  const segments: HL7Segment[] = lines.map((line) => {
    const fields = line.split(FIELD_DELIMITER);
    return { name: fields[0], fields };
  });

  const msh = segments.find((s) => s.name === "MSH");
  if (!msh) throw new Error("Invalid HL7 message: no MSH segment");

  return {
    raw: normalized,
    segments,
    messageType: msh.fields[8] ?? "UNKNOWN",   // MSH-9 = fields[8] (MSH-1 is the separator itself)
    messageId: msh.fields[9] ?? "",             // MSH-10
    sendingApp: msh.fields[2] ?? "",            // MSH-3
    sendingFacility: msh.fields[3] ?? "",       // MSH-4
    receivingApp: msh.fields[4] ?? "",          // MSH-5
    receivingFacility: msh.fields[5] ?? "",     // MSH-6
    timestamp: msh.fields[6] ?? "",             // MSH-7
    version: msh.fields[11] ?? "2.4",           // MSH-12
  };
}

/** Extract component from HL7 field (e.g., "Smith^John" = component 0 is "Smith") */
function component(field: string | undefined, index: number): string {
  if (!field) return "";
  return field.split(COMPONENT_DELIMITER)[index] ?? "";
}

/** Extract patient demographics from PID + IN1 segments */
export function extractPatient(msg: HL7Message): HL7Patient | null {
  const patSeg = msg.segments.find((s) => s.name === "PID");
  if (!patSeg) return null;

  const insSeg = msg.segments.find((s) => s.name === "IN1");

  return {
    id: component(patSeg.fields[3], 0),
    idNumber: component(patSeg.fields[3], 3),
    surname: component(patSeg.fields[5], 0),
    firstName: component(patSeg.fields[5], 1),
    dateOfBirth: patSeg.fields[7] ?? "",
    gender: patSeg.fields[8] ?? "",
    address: patSeg.fields[11]?.replace(/\^/g, ", ") ?? "",
    phone: patSeg.fields[13]?.replace(/\^/g, "") ?? "",
    medicalAidScheme: insSeg ? component(insSeg.fields[4], 0) : "",
    medicalAidNo: insSeg ? (insSeg.fields[38] ?? insSeg.fields[36] ?? "") : "",
    medicalAidPlan: insSeg ? (insSeg.fields[40] ?? insSeg.fields[37] ?? insSeg.fields[35] ?? "") : "",
  };
}

/** Extract encounter/visit data from PV1 + DG1 segments */
export function extractEncounter(msg: HL7Message): HL7Encounter | null {
  const visitSeg = msg.segments.find((s) => s.name === "PV1");
  if (!visitSeg) return null;

  const diagSeg = msg.segments.find((s) => s.name === "DG1");

  return {
    visitId: visitSeg.fields[19] ?? "",
    patientClass: visitSeg.fields[2] ?? "",
    attendingDoctor: component(visitSeg.fields[7], 1) + " " + component(visitSeg.fields[7], 0),
    referringDoctor: visitSeg.fields[8]
      ? component(visitSeg.fields[8], 1) + " " + component(visitSeg.fields[8], 0)
      : "",
    admitDate: visitSeg.fields[44] ?? "",
    dischargeDate: visitSeg.fields[45] ?? "",
    ward: component(visitSeg.fields[3], 0),
    bed: component(visitSeg.fields[3], 2),
    facility: component(visitSeg.fields[3], 3),
    admitDiagnosis: diagSeg ? component(diagSeg.fields[3], 1) : "",
  };
}

/** Extract all observation results from OBX segments (lab results, vitals) */
export function extractObservations(msg: HL7Message): HL7Observation[] {
  return msg.segments
    .filter((s) => s.name === "OBX")
    .map((obx) => ({
      id: obx.fields[1] ?? "",
      code: component(obx.fields[3], 0),
      codeName: component(obx.fields[3], 1),
      value: obx.fields[5] ?? "",
      unit: component(obx.fields[6], 0),
      referenceRange: obx.fields[7] ?? "",
      abnormalFlag: obx.fields[8] ?? "",
      status: obx.fields[11] ?? "",
      observationDate: obx.fields[14] ?? "",
    }));
}

/** Extract all diagnosis codes from DG1 segments */
export function extractDiagnoses(msg: HL7Message): HL7Diagnosis[] {
  return msg.segments
    .filter((s) => s.name === "DG1")
    .map((dg) => ({
      setId: parseInt(dg.fields[1] ?? "0"),
      codingMethod: dg.fields[2] ?? "",
      code: component(dg.fields[3], 0),
      description: component(dg.fields[3], 1),
      type: dg.fields[6] ?? "",
      diagnosedBy: dg.fields[16]
        ? component(dg.fields[16], 1) + " " + component(dg.fields[16], 0)
        : "",
    }));
}

/** Extract orders from ORC + OBR segments */
export function extractOrders(msg: HL7Message): HL7Order[] {
  const orcs = msg.segments.filter((s) => s.name === "ORC");
  const obrs = msg.segments.filter((s) => s.name === "OBR");

  return orcs.map((orc, i) => {
    const obr = obrs[i];
    return {
      orderId: orc.fields[2] ?? "",
      orderControl: orc.fields[1] ?? "",
      orderType: obr ? component(obr.fields[4], 0) : "",
      orderName: obr ? component(obr.fields[4], 1) : "",
      orderingDoctor: obr
        ? (component(obr.fields[16], 1) + " " + component(obr.fields[16], 0)).trim()
        : "",
      orderDate: obr ? (obr.fields[7] ?? "") : "",
      priority: obr ? (obr.fields[5] ?? "R") : "R",
    };
  });
}

/** Format HL7 timestamp (YYYYMMDDHHMMSS) to ISO 8601 */
export function hl7TimestampToISO(ts: string): string {
  if (!ts || ts.length < 8) return "";
  const year = ts.slice(0, 4);
  const month = ts.slice(4, 6);
  const day = ts.slice(6, 8);
  const hour = ts.slice(8, 10) || "00";
  const min = ts.slice(10, 12) || "00";
  const sec = ts.slice(12, 14) || "00";
  return `${year}-${month}-${day}T${hour}:${min}:${sec}+02:00`;
}

/** Build MSH segment header for outbound HL7 messages */
function buildMSH(
  sendApp: string, sendFacility: string,
  recvApp: string, recvFacility: string,
  msgType: string, msgId: string
): string {
  const now = new Date();
  const ts = now.toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
  return [
    "MSH", HL7_ENCODING_CHARS, sendApp, sendFacility,
    recvApp, recvFacility, ts, "", msgType, msgId, "P", "2.4",
  ].join("|");
}

/** Generate HL7v2 ACK response (required by HL7 protocol) */
export function generateACK(msg: HL7Message, ackCode: "AA" | "AE" | "AR" = "AA"): string {
  const msh = buildMSH(
    "VISIOHEALTH", "NETCARE_OS",
    msg.sendingApp, msg.sendingFacility,
    "ACK", `ACK${msg.messageId}`
  );
  return [msh, `MSA|${ackCode}|${msg.messageId}`].join("\r");
}
