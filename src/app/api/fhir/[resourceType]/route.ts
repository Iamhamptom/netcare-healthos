import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

const VALID_RESOURCE_TYPES = [
  "Patient", "Encounter", "Observation", "Condition", "MedicationRequest",
  "DiagnosticReport", "AllergyIntolerance", "Immunization", "Procedure",
  "Consent", "Organization", "Practitioner",
];

// Sample demo resources keyed by type
const SAMPLE_RESOURCES: Record<string, Record<string, unknown>[]> = {
  Patient: [
    {
      resourceType: "Patient",
      id: "pt-001",
      meta: { versionId: "1", lastUpdated: "2026-03-20T08:00:00+02:00" },
      identifier: [
        { system: "http://health.gov.za/id/said", value: "8507155123087" },
        { system: "http://health.gov.za/id/medical-aid-member", value: "MA-900012345" },
      ],
      name: [{ use: "official", family: "Nkosi", given: ["Sipho", "A"] }],
      gender: "male",
      birthDate: "1985-07-15",
      telecom: [{ system: "phone", value: "+27601234567", use: "mobile" }],
      address: [{ line: ["42 Nelson Mandela Drive"], city: "Johannesburg", state: "Gauteng", postalCode: "2001", country: "ZA" }],
    },
    {
      resourceType: "Patient",
      id: "pt-002",
      meta: { versionId: "1", lastUpdated: "2026-03-19T14:30:00+02:00" },
      identifier: [
        { system: "http://health.gov.za/id/said", value: "9001012345678" },
        { system: "http://health.gov.za/id/medical-aid-member", value: "MA-800067890" },
      ],
      name: [{ use: "official", family: "Naidoo", given: ["Priya"] }],
      gender: "female",
      birthDate: "1990-01-01",
      telecom: [{ system: "phone", value: "+27829876543", use: "mobile" }],
      address: [{ line: ["15 Rivonia Road"], city: "Sandton", state: "Gauteng", postalCode: "2196", country: "ZA" }],
    },
    {
      resourceType: "Patient",
      id: "pt-003",
      meta: { versionId: "1", lastUpdated: "2026-03-18T09:15:00+02:00" },
      identifier: [
        { system: "http://health.gov.za/id/said", value: "7805230987654" },
      ],
      name: [{ use: "official", family: "van der Merwe", given: ["Sarah", "J"] }],
      gender: "female",
      birthDate: "1978-05-23",
      telecom: [{ system: "email", value: "sarah.vdm@example.co.za" }],
      address: [{ line: ["8 Stellenberg Road"], city: "Cape Town", state: "Western Cape", postalCode: "7530", country: "ZA" }],
    },
  ],
  Observation: [
    {
      resourceType: "Observation",
      id: "obs-001",
      meta: { versionId: "1", lastUpdated: "2026-03-20T10:30:00+02:00" },
      status: "final",
      category: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "vital-signs", display: "Vital Signs" }] }],
      code: { coding: [{ system: "http://loinc.org", code: "85354-9", display: "Blood Pressure Panel" }] },
      subject: { reference: "Patient/pt-001", display: "Sipho Nkosi" },
      effectiveDateTime: "2026-03-20T10:30:00+02:00",
      component: [
        { code: { coding: [{ system: "http://loinc.org", code: "8480-6", display: "Systolic" }] }, valueQuantity: { value: 132, unit: "mmHg", system: "http://unitsofmeasure.org", code: "mm[Hg]" } },
        { code: { coding: [{ system: "http://loinc.org", code: "8462-4", display: "Diastolic" }] }, valueQuantity: { value: 85, unit: "mmHg", system: "http://unitsofmeasure.org", code: "mm[Hg]" } },
      ],
    },
    {
      resourceType: "Observation",
      id: "obs-002",
      meta: { versionId: "1", lastUpdated: "2026-03-20T10:35:00+02:00" },
      status: "final",
      category: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "vital-signs", display: "Vital Signs" }] }],
      code: { coding: [{ system: "http://loinc.org", code: "8310-5", display: "Body Temperature" }] },
      subject: { reference: "Patient/pt-002", display: "Priya Naidoo" },
      effectiveDateTime: "2026-03-20T10:35:00+02:00",
      valueQuantity: { value: 37.2, unit: "°C", system: "http://unitsofmeasure.org", code: "Cel" },
    },
  ],
  Condition: [
    {
      resourceType: "Condition",
      id: "cond-001",
      meta: { versionId: "1", lastUpdated: "2026-03-19T09:00:00+02:00" },
      clinicalStatus: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" }] },
      verificationStatus: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-ver-status", code: "confirmed" }] },
      code: { coding: [{ system: "http://hl7.org/fhir/sid/icd-10", code: "I10", display: "Essential (primary) hypertension" }] },
      subject: { reference: "Patient/pt-001", display: "Sipho Nkosi" },
      onsetDateTime: "2023-06-15",
    },
    {
      resourceType: "Condition",
      id: "cond-002",
      meta: { versionId: "1", lastUpdated: "2026-03-18T11:00:00+02:00" },
      clinicalStatus: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" }] },
      verificationStatus: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-ver-status", code: "confirmed" }] },
      code: { coding: [{ system: "http://hl7.org/fhir/sid/icd-10", code: "E11.9", display: "Type 2 diabetes mellitus without complications" }] },
      subject: { reference: "Patient/pt-002", display: "Priya Naidoo" },
      onsetDateTime: "2024-01-10",
    },
  ],
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ resourceType: string }> },
) {
  const guard = await guardRoute(request, "fhir-resource");
  if (isErrorResponse(guard)) return guard;

  const { resourceType } = await params;

  if (!VALID_RESOURCE_TYPES.includes(resourceType)) {
    return NextResponse.json(
      {
        resourceType: "OperationOutcome",
        issue: [{ severity: "error", code: "not-supported", diagnostics: `Resource type '${resourceType}' is not supported` }],
      },
      { status: 400, headers: { "Content-Type": "application/fhir+json" } },
    );
  }

  const entries = (SAMPLE_RESOURCES[resourceType] || []).map((resource) => ({
    fullUrl: `urn:uuid:${(resource.id as string) || "unknown"}`,
    resource,
    search: { mode: "match" },
  }));

  return NextResponse.json(
    {
      resourceType: "Bundle",
      type: "searchset",
      total: entries.length,
      link: [{ relation: "self", url: `/api/fhir/${resourceType}` }],
      entry: entries,
    },
    { headers: { "Content-Type": "application/fhir+json" } },
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ resourceType: string }> },
) {
  const guard = await guardRoute(request, "fhir-resource");
  if (isErrorResponse(guard)) return guard;

  const { resourceType } = await params;

  if (!VALID_RESOURCE_TYPES.includes(resourceType)) {
    return NextResponse.json(
      {
        resourceType: "OperationOutcome",
        issue: [{ severity: "error", code: "not-supported", diagnostics: `Resource type '${resourceType}' is not supported` }],
      },
      { status: 400, headers: { "Content-Type": "application/fhir+json" } },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        resourceType: "OperationOutcome",
        issue: [{ severity: "error", code: "invalid", diagnostics: "Request body is not valid JSON" }],
      },
      { status: 400, headers: { "Content-Type": "application/fhir+json" } },
    );
  }

  // Basic validation: resourceType in body should match URL
  if (body.resourceType && body.resourceType !== resourceType) {
    return NextResponse.json(
      {
        resourceType: "OperationOutcome",
        issue: [{
          severity: "error",
          code: "value",
          diagnostics: `Resource type in body (${body.resourceType}) does not match URL (${resourceType})`,
        }],
      },
      { status: 400, headers: { "Content-Type": "application/fhir+json" } },
    );
  }

  // Generate an ID and return the created resource
  const generatedId = `${resourceType.toLowerCase()}-${Date.now().toString(36)}`;
  const created = {
    ...body,
    resourceType,
    id: generatedId,
    meta: {
      versionId: "1",
      lastUpdated: new Date().toISOString(),
    },
  };

  return NextResponse.json(created, {
    status: 201,
    headers: {
      "Content-Type": "application/fhir+json",
      Location: `/api/fhir/${resourceType}/${generatedId}`,
    },
  });
}
