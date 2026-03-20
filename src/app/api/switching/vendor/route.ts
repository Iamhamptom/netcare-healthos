// POST /api/switching/vendor — Register a new PMS vendor
// GET /api/switching/vendor — Get accreditation test suite info

import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import {
  createVendor,
  ACCREDITATION_TESTS,
  getAccreditationSummary,
} from "@/lib/switching";

export async function GET(req: Request) {
  const guard = await guardRoute(req, "switching-vendor");
  if (isErrorResponse(guard)) return guard;
  return NextResponse.json({
    accreditationProcess: {
      description: "PMS Vendor Accreditation for Netcare Health OS Switching Engine",
      steps: [
        "1. Register as a vendor (POST /api/switching/vendor)",
        "2. Receive vendor code and integration pack",
        "3. Implement EDIFACT MEDCLM and/or XML claim generation",
        "4. Run accreditation test suite against sandbox",
        "5. Pass all mandatory tests (format, content, response handling)",
        "6. Receive accreditation certificate and production credentials",
      ],
      testCategories: {
        format: ACCREDITATION_TESTS.filter(t => t.category === "format").length,
        content: ACCREDITATION_TESTS.filter(t => t.category === "content").length,
        response: ACCREDITATION_TESTS.filter(t => t.category === "response").length,
        transport: ACCREDITATION_TESTS.filter(t => t.category === "transport").length,
        edge_case: ACCREDITATION_TESTS.filter(t => t.category === "edge_case").length,
      },
      totalTests: ACCREDITATION_TESTS.length,
    },
    tests: ACCREDITATION_TESTS.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      category: t.category,
    })),
  });
}

export async function POST(req: Request) {
  const g = await guardRoute(req, "switching-vendor-register", { limit: 10 });
  if (isErrorResponse(g)) return g;
  try {
    const body = await req.json();
    const { vendorName, contactName, contactEmail, contactPhone, softwareName, softwareVersion, protocols } = body;

    if (!vendorName || !contactEmail || !softwareName) {
      return NextResponse.json(
        { error: "vendorName, contactEmail, and softwareName are required" },
        { status: 400 },
      );
    }

    const vendor = createVendor({
      vendorName,
      contactName: contactName || "",
      contactEmail,
      contactPhone: contactPhone || "",
      softwareName,
      softwareVersion: softwareVersion || "1.0.0",
      protocols: protocols || ["xml"],
    });

    const summary = getAccreditationSummary(vendor);

    return NextResponse.json({
      vendor: {
        id: vendor.id,
        vendorCode: vendor.vendorCode,
        vendorName: vendor.vendorName,
        softwareName: vendor.softwareName,
      },
      accreditation: summary,
      nextSteps: [
        "Download the integration pack from /api/switching/vendor/integration-pack",
        "Implement EDIFACT MEDCLM generation (PHISC v0:912:ZA)",
        "Run tests against sandbox endpoint",
        `${ACCREDITATION_TESTS.length} tests must pass for accreditation`,
      ],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
