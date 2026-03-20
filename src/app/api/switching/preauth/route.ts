// POST /api/switching/preauth — Check if pre-auth is required + submit request
// GET /api/switching/preauth?codes=... — Quick check if procedures need pre-auth

import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import {
  checkPreAuthRequired,
  createPreAuthRequest,
  buildPreAuthXML,
} from "@/lib/switching";

export async function GET(req: Request) {
  const guard = await guardRoute(req, "switching-preauth");
  if (isErrorResponse(guard)) return guard;

  const { searchParams } = new URL(req.url);
  const cptCodes = (searchParams.get("cpt") || "").split(",").filter(Boolean);
  const icd10Codes = (searchParams.get("icd10") || "").split(",").filter(Boolean);
  const scheme = searchParams.get("scheme") || "";
  const cost = parseInt(searchParams.get("cost") || "0", 10);

  if (cptCodes.length === 0) {
    return NextResponse.json({ error: "At least one CPT code is required (?cpt=0190,0141)" }, { status: 400 });
  }

  const check = checkPreAuthRequired({
    cptCodes,
    icd10Codes,
    scheme,
    estimatedCost: cost,
  });

  return NextResponse.json(check);
}

export async function POST(req: Request) {
  const g = await guardRoute(req, "switching-preauth-submit", { limit: 20 });
  if (isErrorResponse(g)) return g;
  try {
    const body = await req.json();
    const { action, ...data } = body;

    if (action === "check") {
      const check = checkPreAuthRequired({
        cptCodes: data.cptCodes || [],
        icd10Codes: data.icd10Codes || [],
        scheme: data.medicalAidScheme || "",
        estimatedCost: data.estimatedCost || 0,
      });
      return NextResponse.json(check);
    }

    // Create pre-auth request
    const request = createPreAuthRequest(data);
    const xml = buildPreAuthXML(request);

    return NextResponse.json({
      request,
      xml,
      message: "Pre-authorization request created. Submit to switch for approval.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
