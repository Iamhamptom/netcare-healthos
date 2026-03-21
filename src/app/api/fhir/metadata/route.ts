import { NextResponse } from "next/server";

/**
 * FHIR CapabilityStatement endpoint (R4)
 * GET /api/fhir/metadata
 *
 * Public discovery endpoint — no authentication required.
 * Declares supported resource types, interactions, and security configuration
 * per the SA Health Normative Standards Framework (HNSF).
 */

const SUPPORTED_RESOURCES = [
  {
    type: "Patient",
    profile: "http://hl7.org/fhir/StructureDefinition/Patient",
    interaction: [
      { code: "read" },
      { code: "create" },
      { code: "search-type" },
    ],
    searchParam: [
      { name: "identifier", type: "token", documentation: "SA ID number or MRN" },
      { name: "family", type: "string" },
      { name: "given", type: "string" },
      { name: "birthdate", type: "date" },
      { name: "gender", type: "token" },
    ],
  },
  {
    type: "Observation",
    profile: "http://hl7.org/fhir/StructureDefinition/Observation",
    interaction: [
      { code: "read" },
      { code: "create" },
      { code: "search-type" },
    ],
    searchParam: [
      { name: "patient", type: "reference" },
      { name: "code", type: "token", documentation: "LOINC code" },
      { name: "category", type: "token" },
      { name: "date", type: "date" },
    ],
  },
  {
    type: "Condition",
    profile: "http://hl7.org/fhir/StructureDefinition/Condition",
    interaction: [
      { code: "read" },
      { code: "create" },
      { code: "search-type" },
    ],
    searchParam: [
      { name: "patient", type: "reference" },
      { name: "code", type: "token", documentation: "ICD-10 code" },
      { name: "clinical-status", type: "token" },
    ],
  },
  {
    type: "Encounter",
    profile: "http://hl7.org/fhir/StructureDefinition/Encounter",
    interaction: [
      { code: "read" },
      { code: "create" },
      { code: "search-type" },
    ],
    searchParam: [
      { name: "patient", type: "reference" },
      { name: "date", type: "date" },
      { name: "status", type: "token" },
      { name: "type", type: "token" },
    ],
  },
  {
    type: "MedicationRequest",
    profile: "http://hl7.org/fhir/StructureDefinition/MedicationRequest",
    interaction: [
      { code: "read" },
      { code: "create" },
      { code: "search-type" },
    ],
    searchParam: [
      { name: "patient", type: "reference" },
      { name: "status", type: "token" },
      { name: "authoredon", type: "date" },
    ],
  },
  {
    type: "AllergyIntolerance",
    profile: "http://hl7.org/fhir/StructureDefinition/AllergyIntolerance",
    interaction: [
      { code: "read" },
      { code: "create" },
      { code: "search-type" },
    ],
    searchParam: [
      { name: "patient", type: "reference" },
      { name: "clinical-status", type: "token" },
    ],
  },
  {
    type: "Procedure",
    profile: "http://hl7.org/fhir/StructureDefinition/Procedure",
    interaction: [
      { code: "read" },
      { code: "create" },
      { code: "search-type" },
    ],
    searchParam: [
      { name: "patient", type: "reference" },
      { name: "date", type: "date" },
      { name: "code", type: "token" },
    ],
  },
  {
    type: "Consent",
    profile: "http://hl7.org/fhir/StructureDefinition/Consent",
    interaction: [
      { code: "read" },
      { code: "create" },
      { code: "search-type" },
    ],
    searchParam: [
      { name: "patient", type: "reference" },
      { name: "status", type: "token" },
      { name: "category", type: "token" },
    ],
  },
  {
    type: "Organization",
    profile: "http://hl7.org/fhir/StructureDefinition/Organization",
    interaction: [
      { code: "read" },
      { code: "search-type" },
    ],
    searchParam: [
      { name: "name", type: "string" },
      { name: "identifier", type: "token" },
    ],
  },
  {
    type: "Practitioner",
    profile: "http://hl7.org/fhir/StructureDefinition/Practitioner",
    interaction: [
      { code: "read" },
      { code: "search-type" },
    ],
    searchParam: [
      { name: "name", type: "string" },
      { name: "identifier", type: "token", documentation: "HPCSA practice number" },
    ],
  },
  {
    type: "DiagnosticReport",
    profile: "http://hl7.org/fhir/StructureDefinition/DiagnosticReport",
    interaction: [
      { code: "read" },
      { code: "create" },
      { code: "search-type" },
    ],
    searchParam: [
      { name: "patient", type: "reference" },
      { name: "code", type: "token" },
      { name: "date", type: "date" },
      { name: "status", type: "token" },
    ],
  },
  {
    type: "Immunization",
    profile: "http://hl7.org/fhir/StructureDefinition/Immunization",
    interaction: [
      { code: "read" },
      { code: "create" },
      { code: "search-type" },
    ],
    searchParam: [
      { name: "patient", type: "reference" },
      { name: "date", type: "date" },
      { name: "status", type: "token" },
    ],
  },
];

function buildCapabilityStatement() {
  return {
    resourceType: "CapabilityStatement",
    id: "visiohealth-os",
    url: "https://netcare-healthos.vercel.app/api/fhir/metadata",
    version: "1.0.0",
    name: "VisioHealthOSCapabilityStatement",
    title: "VisioHealth OS FHIR Capability Statement",
    status: "active",
    experimental: false,
    date: "2026-03-21",
    publisher: "Visio Research Labs (Pty) Ltd",
    contact: [
      {
        name: "Visio Research Labs",
        telecom: [
          { system: "email", value: "david@visiolabs.co.za" },
          { system: "url", value: "https://netcare-healthos.vercel.app" },
        ],
      },
    ],
    description:
      "FHIR R4 CapabilityStatement for VisioHealth OS — a multi-tenant healthcare platform supporting South African private healthcare workflows. Compliant with SA Health Normative Standards Framework (HNSF).",
    jurisdiction: [
      {
        coding: [
          {
            system: "urn:iso:std:iso:3166",
            code: "ZA",
            display: "South Africa",
          },
        ],
      },
    ],
    kind: "instance",
    software: {
      name: "VisioHealth OS",
      version: "2.0.0",
    },
    implementation: {
      description: "VisioHealth OS FHIR Server",
      url: "https://netcare-healthos.vercel.app/api/fhir",
    },
    fhirVersion: "4.0.1",
    format: ["application/fhir+json", "application/json"],
    rest: [
      {
        mode: "server",
        documentation:
          "RESTful FHIR server supporting SA healthcare interoperability standards. All clinical endpoints require authentication. This metadata endpoint is public.",
        security: {
          cors: true,
          service: [
            {
              coding: [
                {
                  system: "http://terminology.hl7.org/CodeSystem/restful-security-service",
                  code: "SMART-on-FHIR",
                  display: "SMART on FHIR",
                },
              ],
              text: "SMART on FHIR authentication and authorisation",
            },
          ],
          description:
            "This server supports SMART on FHIR for application authorisation. See .well-known/smart-configuration for details. All clinical data access requires OAuth 2.0 bearer tokens with appropriate scopes.",
          extension: [
            {
              url: "http://fhir-registry.smarthealthit.org/StructureDefinition/oauth-uris",
              extension: [
                {
                  url: "authorize",
                  valueUri: "https://netcare-healthos.vercel.app/api/fhir/auth/authorize",
                },
                {
                  url: "token",
                  valueUri: "https://netcare-healthos.vercel.app/api/fhir/auth/token",
                },
              ],
            },
          ],
        },
        resource: SUPPORTED_RESOURCES,
        interaction: [
          { code: "search-system" },
        ],
        searchParam: [
          {
            name: "_count",
            type: "number",
            documentation: "Number of results per page (default: 20, max: 100)",
          },
          {
            name: "_offset",
            type: "number",
            documentation: "Starting index for paged results",
          },
        ],
      },
    ],
    document: [],
  };
}

export async function GET() {
  const capability = buildCapabilityStatement();

  return NextResponse.json(capability, {
    status: 200,
    headers: {
      "Content-Type": "application/fhir+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
