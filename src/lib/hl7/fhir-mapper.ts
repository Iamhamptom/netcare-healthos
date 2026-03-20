// FHIR R4 Mapper — converts parsed HL7v2 structures to FHIR R4 resources
// Used by the CareOn bridge to normalize hospital data for advisory engine

import type {
  HL7Patient, HL7Encounter, HL7Observation, HL7Diagnosis,
  FHIRPatient, FHIREncounter, FHIRObservation, FHIRCondition,
} from "./types";
import { hl7TimestampToISO } from "./parser";

/** Map HL7v2 PID patient to FHIR R4 Patient resource */
export function mapPatientToFHIR(pat: HL7Patient): FHIRPatient {
  const genderMap: Record<string, "male" | "female" | "other" | "unknown"> = {
    M: "male", F: "female", U: "unknown", O: "other",
  };

  return {
    resourceType: "Patient",
    id: pat.id,
    identifier: [
      { system: "urn:netcare:mrn", value: pat.id },
      ...(pat.idNumber ? [{ system: "urn:za:id", value: pat.idNumber }] : []),
      ...(pat.medicalAidNo ? [{ system: `urn:za:medical-aid:${pat.medicalAidScheme}`, value: pat.medicalAidNo }] : []),
    ],
    name: [{ family: pat.surname, given: [pat.firstName] }],
    gender: genderMap[pat.gender] ?? "unknown",
    birthDate: pat.dateOfBirth
      ? `${pat.dateOfBirth.slice(0, 4)}-${pat.dateOfBirth.slice(4, 6)}-${pat.dateOfBirth.slice(6, 8)}`
      : "",
    telecom: pat.phone ? [{ system: "phone", value: pat.phone }] : [],
    address: pat.address ? [{ text: pat.address }] : [],
  };
}

/** Map HL7v2 PV1 encounter to FHIR R4 Encounter resource */
export function mapEncounterToFHIR(enc: HL7Encounter, patientId: string): FHIREncounter {
  const classMap: Record<string, { code: string; display: string }> = {
    I: { code: "IMP", display: "Inpatient" },
    O: { code: "AMB", display: "Ambulatory" },
    E: { code: "EMER", display: "Emergency" },
  };

  const hasDischarge = !!enc.dischargeDate;

  return {
    resourceType: "Encounter",
    id: enc.visitId,
    status: hasDischarge ? "finished" : "in-progress",
    class: classMap[enc.patientClass] ?? { code: "AMB", display: "Ambulatory" },
    subject: { reference: `Patient/${patientId}` },
    participant: [
      { individual: { display: enc.attendingDoctor } },
      ...(enc.referringDoctor ? [{ individual: { display: enc.referringDoctor } }] : []),
    ],
    period: {
      start: hl7TimestampToISO(enc.admitDate),
      ...(hasDischarge ? { end: hl7TimestampToISO(enc.dischargeDate) } : {}),
    },
    location: [
      { location: { display: [enc.ward, enc.bed, enc.facility].filter(Boolean).join(" - ") } },
    ],
    diagnosis: enc.admitDiagnosis
      ? [{ condition: { display: enc.admitDiagnosis }, rank: 1 }]
      : [],
  };
}

/** Map HL7v2 OBX observations to FHIR R4 Observation resources */
export function mapObservationToFHIR(obs: HL7Observation, patientId: string): FHIRObservation {
  const statusMap: Record<string, "final" | "preliminary" | "cancelled"> = {
    F: "final", P: "preliminary", X: "cancelled",
  };

  const flagMap: Record<string, { code: string; display: string }> = {
    H: { code: "H", display: "High" },
    L: { code: "L", display: "Low" },
    A: { code: "A", display: "Abnormal" },
    N: { code: "N", display: "Normal" },
    HH: { code: "HH", display: "Critically High" },
    LL: { code: "LL", display: "Critically Low" },
  };

  const numericValue = parseFloat(obs.value);
  const isNumeric = !isNaN(numericValue);

  const result: FHIRObservation = {
    resourceType: "Observation",
    id: obs.id,
    status: statusMap[obs.status] ?? "final",
    code: {
      coding: [{
        system: obs.code.match(/^\d+-\d$/) ? "http://loinc.org" : "urn:netcare:local",
        code: obs.code,
        display: obs.codeName,
      }],
    },
    subject: { reference: `Patient/${patientId}` },
    effectiveDateTime: hl7TimestampToISO(obs.observationDate),
  };

  if (isNumeric) {
    result.valueQuantity = { value: numericValue, unit: obs.unit };
  } else {
    result.valueString = obs.value;
  }

  if (obs.abnormalFlag && flagMap[obs.abnormalFlag]) {
    result.interpretation = [{ coding: [flagMap[obs.abnormalFlag]] }];
  }

  if (obs.referenceRange) {
    result.referenceRange = [{ text: obs.referenceRange }];
  }

  return result;
}

/** Map HL7v2 DG1 diagnosis to FHIR R4 Condition resource */
export function mapDiagnosisToFHIR(diag: HL7Diagnosis, patientId: string, encounterId: string): FHIRCondition {
  const categoryMap: Record<string, { code: string; display: string }> = {
    A: { code: "encounter-diagnosis", display: "Admitting Diagnosis" },
    F: { code: "encounter-diagnosis", display: "Final Diagnosis" },
    W: { code: "encounter-diagnosis", display: "Working Diagnosis" },
  };

  return {
    resourceType: "Condition",
    id: `diag-${encounterId}-${diag.setId}`,
    code: {
      coding: [{
        system: "http://hl7.org/fhir/sid/icd-10",
        code: diag.code,
        display: diag.description,
      }],
    },
    subject: { reference: `Patient/${patientId}` },
    encounter: { reference: `Encounter/${encounterId}` },
    recordedDate: new Date().toISOString(),
    category: [
      { coding: [categoryMap[diag.type] ?? { code: "encounter-diagnosis", display: "Diagnosis" }] },
    ],
  };
}
