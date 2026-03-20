import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { searchNAPPI, lookupNAPPI } from "@/lib/healthbridge/nappi";
import { formatZAR } from "@/lib/healthbridge/codes";

/** GET /api/healthbridge/nappi?q=metformin — NAPPI code + SEP price lookup
 * Uses the open-source medicineprices.org.za API (Code4SA).
 * Returns medicine name, NAPPI code, Single Exit Price, dispensing fee, schedule.
 */
export async function GET(request: Request) {
  const guard = await guardRoute(request, "healthbridge-nappi");
  if (isErrorResponse(guard)) return guard;

  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";
  const nappiCode = url.searchParams.get("code") || "";

  if (!query && !nappiCode) {
    return NextResponse.json({ error: "Provide ?q=search_term or ?code=nappi_code" }, { status: 400 });
  }

  if (nappiCode) {
    const result = await lookupNAPPI(nappiCode);
    if (!result) {
      return NextResponse.json({ error: `NAPPI code ${nappiCode} not found` }, { status: 404 });
    }
    return NextResponse.json({
      medicine: {
        ...result,
        sepFormatted: formatZAR(result.sepPrice),
        dispensingFeeFormatted: formatZAR(result.dispensingFee),
        totalFormatted: formatZAR(result.sepPrice + result.dispensingFee),
      },
    });
  }

  const results = await searchNAPPI(query);
  return NextResponse.json({
    query,
    count: results.length,
    medicines: results.map((r) => ({
      ...r,
      sepFormatted: formatZAR(r.sepPrice),
      dispensingFeeFormatted: formatZAR(r.dispensingFee),
      totalFormatted: formatZAR(r.sepPrice + r.dispensingFee),
    })),
  });
}
