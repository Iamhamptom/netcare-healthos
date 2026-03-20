import { NextRequest, NextResponse } from "next/server";
import { generateClaimsReport } from "@/lib/claims/pdf-report";
import { requireClaimsAuth } from "@/lib/claims/auth-guard";

export async function POST(req: NextRequest) {
  const auth = await requireClaimsAuth(req, "report", { limit: 10, windowMs: 60_000 });
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const { result, practiceName = "Netcare Practice", generatedBy } = body;

    if (!result) return NextResponse.json({ error: "No result data provided" }, { status: 400 });

    const pdfBuffer = generateClaimsReport(result, {
      practiceName,
      generatedBy: generatedBy || auth.userId,
    });

    return new NextResponse(Buffer.from(pdfBuffer) as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="claims-analysis-${new Date().toISOString().split("T")[0]}.pdf"`,
        "Content-Length": String(pdfBuffer.byteLength),
      },
    });
  } catch (error) {
    console.error("PDF report error:", error);
    return NextResponse.json({ error: "Failed to generate PDF report" }, { status: 500 });
  }
}
