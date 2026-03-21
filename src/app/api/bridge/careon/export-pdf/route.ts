import { NextResponse, NextRequest } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { getBridgeStats } from "@/lib/careon-bridge";

function pdfEsc(s: string): string {
  return s.replace(/[\u2014\u2013]/g, "-").replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[^\x00-\xFF]/g, "?").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export async function GET(request: NextRequest) {
  const guard = await guardRoute(request, "bridge-export-pdf");
  if (isErrorResponse(guard)) return guard;

  const stats = getBridgeStats();
  const dateStr = new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" });

  const lines: string[] = [];
  let y = 780;

  function add(text: string, size = 10, bold = false) {
    lines.push(`BT ${bold ? "/F2" : "/F1"} ${size} Tf 50 ${y} Td (${pdfEsc(text)}) Tj ET`);
    y -= 14 + (size > 12 ? 6 : 2);
  }
  function gap(px = 10) { y -= px; }

  add("VISIOHEALTH OS", 18, true);
  add("CareOn / iMedOne Bridge - Executive Summary", 12, true);
  gap(5);
  add(`Prepared for Netcare Primary Care Division | ${dateStr}`, 9);
  add("Classification: Confidential", 8);
  gap(15);

  add("BRIDGE STATUS", 12, true); gap(3);
  add(`Facilities Online: ${stats.connection.facilitiesOnline} / ${stats.connection.facilitiesTotal}`);
  add(`Messages Processed (24h): ${stats.messages.received24h.toLocaleString()}`);
  add(`Average Processing Time: ${stats.messages.avgProcessingTimeMs}ms`);
  add(`Error Rate: ${(stats.messages.errorRate * 100).toFixed(2)}%`);
  gap(10);

  add("ADVISORY SUMMARY", 12, true); gap(3);
  add(`Total Advisories: ${stats.advisories.total}`);
  add(`Critical: ${stats.advisories.critical} | Warnings: ${stats.advisories.warning}`);
  add(`Action Required: ${stats.advisories.actionRequired}`);
  add(`Total Claim Value Identified: R${stats.advisories.totalClaimValue.toLocaleString("en-ZA")}`);
  gap(10);

  add("FINANCIAL IMPACT (88 clinics, 568 practitioners)", 12, true); gap(3);
  add("Rejection Reduction (15% to 5%)             R21.6M/yr");
  add("Rework Cost Elimination                     R3.8M/yr");
  add("Admin Time Savings (85 FTE equiv.)          R38.5M/yr");
  add("AI Coding Uplift (DRG)                      R59.4M/yr");
  add("Chronic Disease Detection (CDL)             R15.3M/yr");
  add("TOTAL ANNUAL BENEFIT                        R138.6M", 11, true);
  add("Platform Cost (88 x R4,500/mo)              R4.75M/yr");
  add("NET ROI                                     2,818%", 11, true);
  gap(10);

  add("RECOMMENDED PILOT", 12, true); gap(3);
  add("5 Medicross clinics in Gauteng (Sandton, Fourways, Rosebank, PTA East, Centurion)");
  add("32 practitioners | 11,520 encounters/month | 6-week implementation");
  add("Expected pilot ROI: R7.9M/year | Full rollout decision at 90 days");
  gap(15);

  add("TECHNICAL ARCHITECTURE", 12, true); gap(3);
  add("CareOn EMR -> HL7v2 Parser -> FHIR R4 Mapper -> AI Advisory Engine");
  add("Standards: HL7v2.4, FHIR R4 4.0.1, ICD-10-ZA, LOINC, SA HNSF");
  add("Security: HMAC-SHA256, POPIA audit trail, role-based de-identification");
  add("AI: Gemini 2.5 Flash (ICD-10 coding, rejection prediction, lab trends)");
  add("Testing: 178 tests mapped to HL7, FHIR, POPIA, OWASP standards");
  gap(20);

  add("VisioCorp | Visio Research Labs", 9);
  add(`Generated ${dateStr} by ${guard.user.name}`, 8);

  const stream = lines.join("\n");
  const pdf = [
    "%PDF-1.4",
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >> endobj`,
    `4 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    "6 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj",
    "xref\n0 7\n0000000000 65535 f ",
    "trailer << /Size 7 /Root 1 0 R >>",
    "startxref\n0\n%%EOF",
  ].join("\n");

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="VisioHealth-CareOn-Bridge-${new Date().toISOString().split("T")[0]}.pdf"`,
    },
  });
}
