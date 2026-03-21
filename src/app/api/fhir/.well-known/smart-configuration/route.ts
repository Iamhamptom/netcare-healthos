import { NextResponse } from "next/server";

/**
 * SMART on FHIR Configuration endpoint
 * GET /api/fhir/.well-known/smart-configuration
 *
 * Public discovery endpoint — no authentication required.
 * Returns the SMART configuration document that EMR apps check
 * before initiating OAuth 2.0 authorisation flows.
 *
 * Spec: http://www.hl7.org/fhir/smart-app-launch/conformance.html
 */

const BASE_URL = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
  : "https://netcare-healthos.vercel.app";

function buildSmartConfiguration() {
  return {
    // ── OAuth 2.0 Endpoints ──
    authorization_endpoint: `${BASE_URL}/api/fhir/auth/authorize`,
    token_endpoint: `${BASE_URL}/api/fhir/auth/token`,
    token_endpoint_auth_methods_supported: [
      "client_secret_basic",
      "client_secret_post",
      "private_key_jwt",
    ],

    // ── Registration ──
    registration_endpoint: `${BASE_URL}/api/fhir/auth/register`,

    // ── Scopes ──
    scopes_supported: [
      // Patient-level scopes
      "patient/Patient.read",
      "patient/Patient.write",
      "patient/Observation.read",
      "patient/Observation.write",
      "patient/Condition.read",
      "patient/Condition.write",
      "patient/Encounter.read",
      "patient/Encounter.write",
      "patient/MedicationRequest.read",
      "patient/MedicationRequest.write",
      "patient/AllergyIntolerance.read",
      "patient/AllergyIntolerance.write",
      "patient/Procedure.read",
      "patient/Procedure.write",
      "patient/Consent.read",
      "patient/Consent.write",
      "patient/DiagnosticReport.read",
      "patient/DiagnosticReport.write",
      "patient/Immunization.read",
      "patient/Immunization.write",

      // User-level scopes
      "user/Patient.read",
      "user/Patient.write",
      "user/Observation.read",
      "user/Observation.write",
      "user/Practitioner.read",
      "user/Organization.read",

      // System-level scopes
      "system/Patient.read",
      "system/Observation.read",
      "system/DiagnosticReport.read",

      // Launch scopes
      "launch",
      "launch/patient",
      "launch/encounter",

      // Identity scopes
      "openid",
      "fhirUser",
      "profile",
      "offline_access",
    ],

    // ── Response Types ──
    response_types_supported: ["code"],
    code_challenge_methods_supported: ["S256"],

    // ── Capabilities ──
    capabilities: [
      "launch-ehr",
      "launch-standalone",
      "client-public",
      "client-confidential-symmetric",
      "client-confidential-asymmetric",
      "context-ehr-patient",
      "context-ehr-encounter",
      "context-standalone-patient",
      "context-standalone-encounter",
      "permission-offline",
      "permission-patient",
      "permission-user",
      "sso-openid-connect",
    ],

    // ── Token Introspection ──
    introspection_endpoint: `${BASE_URL}/api/fhir/auth/introspect`,

    // ── Revocation ──
    revocation_endpoint: `${BASE_URL}/api/fhir/auth/revoke`,

    // ── JWKS ──
    jwks_uri: `${BASE_URL}/api/fhir/auth/jwks`,

    // ── Grant Types ──
    grant_types_supported: [
      "authorization_code",
      "client_credentials",
      "refresh_token",
    ],

    // ── Associated endpoints ──
    management_endpoint: `${BASE_URL}/api/fhir/auth/manage`,
    associated_endpoints: [
      `${BASE_URL}/api/fhir/metadata`,
    ],
  };
}

export async function GET() {
  const config = buildSmartConfiguration();

  return NextResponse.json(config, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
