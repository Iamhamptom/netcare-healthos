import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

const VALID_RESOURCE_TYPES = [
  "Patient", "Encounter", "Observation", "Condition", "MedicationRequest",
  "DiagnosticReport", "AllergyIntolerance", "Immunization", "Procedure",
  "Consent", "Organization", "Practitioner",
];

export async function POST(request: Request) {
  const guard = await guardRoute(request, "fhir-validate");
  if (isErrorResponse(guard)) return guard;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        resourceType: "OperationOutcome",
        issue: [
          {
            severity: "error",
            code: "invalid",
            diagnostics: "Request body is not valid JSON",
          },
        ],
      },
      { status: 400, headers: { "Content-Type": "application/fhir+json" } },
    );
  }

  const issues: { severity: string; code: string; diagnostics: string; expression?: string[] }[] = [];

  // Check resourceType exists
  if (!body.resourceType) {
    issues.push({
      severity: "error",
      code: "required",
      diagnostics: "Missing required field: resourceType",
      expression: ["resourceType"],
    });
  } else if (!VALID_RESOURCE_TYPES.includes(body.resourceType as string)) {
    issues.push({
      severity: "error",
      code: "value",
      diagnostics: `Unknown resourceType: ${body.resourceType}. Supported types: ${VALID_RESOURCE_TYPES.join(", ")}`,
      expression: ["resourceType"],
    });
  }

  // Resource-specific validation
  if (body.resourceType === "Patient") {
    if (!body.name || !Array.isArray(body.name) || (body.name as unknown[]).length === 0) {
      issues.push({
        severity: "warning",
        code: "business-rule",
        diagnostics: "Patient resource should include at least one name",
        expression: ["Patient.name"],
      });
    }
    if (!body.identifier || !Array.isArray(body.identifier) || (body.identifier as unknown[]).length === 0) {
      issues.push({
        severity: "warning",
        code: "business-rule",
        diagnostics: "Patient resource should include at least one identifier (e.g. SA ID number)",
        expression: ["Patient.identifier"],
      });
    }
  }

  if (body.resourceType === "Observation") {
    if (!body.status) {
      issues.push({
        severity: "error",
        code: "required",
        diagnostics: "Observation.status is required (e.g. final, preliminary, amended)",
        expression: ["Observation.status"],
      });
    }
    if (!body.code) {
      issues.push({
        severity: "error",
        code: "required",
        diagnostics: "Observation.code is required — must specify what was observed",
        expression: ["Observation.code"],
      });
    }
  }

  if (body.resourceType === "Condition") {
    if (!body.code) {
      issues.push({
        severity: "error",
        code: "required",
        diagnostics: "Condition.code is required — must specify the ICD-10 or SNOMED code",
        expression: ["Condition.code"],
      });
    }
    if (!body.subject) {
      issues.push({
        severity: "error",
        code: "required",
        diagnostics: "Condition.subject is required — must reference a Patient",
        expression: ["Condition.subject"],
      });
    }
  }

  // If no issues, add a success entry
  if (issues.length === 0) {
    issues.push({
      severity: "information",
      code: "informational",
      diagnostics: `${body.resourceType} resource is valid. All required fields present.`,
    });
  }

  const hasErrors = issues.some((i) => i.severity === "error");

  return NextResponse.json(
    {
      resourceType: "OperationOutcome",
      issue: issues,
    },
    {
      status: hasErrors ? 400 : 200,
      headers: { "Content-Type": "application/fhir+json" },
    },
  );
}
