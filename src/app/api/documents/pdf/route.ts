/**
 * POST /api/documents/pdf
 * Generate a PDF from a document (referral letter, prescription, sick note, etc.)
 * Uses raw PDF 1.4 generation — zero external dependencies.
 *
 * Body: { title: string, content: string, type: string, practiceName?: string }
 * Returns: application/pdf binary
 */

import { NextResponse } from "next/server";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

function escapeText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildPDF(title: string, content: string, practiceName: string, docType: string): Buffer {
  const lines = content.split("\n");
  const pageHeight = 842; // A4
  const pageWidth = 595;
  const margin = 50;
  const lineHeight = 14;
  const maxWidth = pageWidth - margin * 2;
  const charsPerLine = Math.floor(maxWidth / 6); // approximate

  // Wrap lines
  const wrappedLines: string[] = [];
  for (const line of lines) {
    if (line.length <= charsPerLine) {
      wrappedLines.push(line);
    } else {
      let remaining = line;
      while (remaining.length > charsPerLine) {
        const breakAt = remaining.lastIndexOf(" ", charsPerLine);
        const splitPoint = breakAt > 0 ? breakAt : charsPerLine;
        wrappedLines.push(remaining.slice(0, splitPoint));
        remaining = remaining.slice(splitPoint).trimStart();
      }
      if (remaining) wrappedLines.push(remaining);
    }
  }

  // Calculate pages
  const usableHeight = pageHeight - margin * 2 - 80; // header space
  const linesPerPage = Math.floor(usableHeight / lineHeight);
  const pages: string[][] = [];
  for (let i = 0; i < wrappedLines.length; i += linesPerPage) {
    pages.push(wrappedLines.slice(i, i + linesPerPage));
  }
  if (pages.length === 0) pages.push([""]);

  // Build PDF objects
  const objects: string[] = [];
  let objectCount = 0;

  function addObject(content: string): number {
    objectCount++;
    objects.push(`${objectCount} 0 obj\n${content}\nendobj`);
    return objectCount;
  }

  // Catalog
  addObject("<< /Type /Catalog /Pages 2 0 R >>");

  // Pages (placeholder — filled after page objects created)
  const pagesObjNum = objectCount + 1;
  objects.push(""); // placeholder

  // Font
  addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const fontObjNum = objectCount;

  addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  const boldFontObjNum = objectCount;

  // Create page objects
  const pageObjNums: number[] = [];
  const contentObjNums: number[] = [];

  for (let p = 0; p < pages.length; p++) {
    const pageLines = pages[p];
    let y = pageHeight - margin;

    let stream = "";
    // Header (first page only)
    if (p === 0) {
      stream += `BT /F2 12 Tf ${margin} ${y} Td (${escapeText(practiceName)}) Tj ET\n`;
      y -= 18;
      stream += `BT /F1 9 Tf ${margin} ${y} Td (${escapeText(docType.replace(/_/g, " ").toUpperCase())}) Tj ET\n`;
      y -= 12;
      stream += `BT /F1 8 Tf ${margin} ${y} Td (Generated: ${new Date().toLocaleDateString("en-ZA")}) Tj ET\n`;
      y -= 20;
      // Separator line
      stream += `${margin} ${y} m ${pageWidth - margin} ${y} l S\n`;
      y -= 20;
      // Title
      stream += `BT /F2 14 Tf ${margin} ${y} Td (${escapeText(title)}) Tj ET\n`;
      y -= 24;
    }

    // Content lines
    for (const line of pageLines) {
      if (y < margin + 30) break;
      const isHeading = line.startsWith("##") || line.startsWith("**") || line === line.toUpperCase() && line.length > 3 && line.length < 60;
      const font = isHeading ? "/F2" : "/F1";
      const size = isHeading ? "11" : "10";
      const displayLine = line.replace(/^#+\s*/, "").replace(/\*\*/g, "");
      stream += `BT ${font} ${size} Tf ${margin} ${y} Td (${escapeText(displayLine)}) Tj ET\n`;
      y -= lineHeight;
    }

    // Footer
    stream += `BT /F1 8 Tf ${margin} 30 Td (Page ${p + 1} of ${pages.length} | ${practiceName} | CONFIDENTIAL) Tj ET\n`;

    // Content stream object
    const contentObj = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    contentObjNums.push(contentObj);

    // Page object
    const pageObj = addObject(
      `<< /Type /Page /Parent ${pagesObjNum} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] ` +
      `/Contents ${contentObj} 0 R ` +
      `/Resources << /Font << /F1 ${fontObjNum} 0 R /F2 ${boldFontObjNum} 0 R >> >> >>`
    );
    pageObjNums.push(pageObj);
  }

  // Fill in Pages object
  const pageRefs = pageObjNums.map(n => `${n} 0 R`).join(" ");
  objects[pagesObjNum - 1] = `${pagesObjNum} 0 obj\n<< /Type /Pages /Kids [${pageRefs}] /Count ${pages.length} >>\nendobj`;

  // Build final PDF
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];

  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj + "\n";
  }

  const xrefOffset = pdf.length;
  pdf += "xref\n";
  pdf += `0 ${objectCount + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 0; i < objectCount; i++) {
    pdf += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
  }

  pdf += "trailer\n";
  pdf += `<< /Size ${objectCount + 1} /Root 1 0 R >>\n`;
  pdf += "startxref\n";
  pdf += `${xrefOffset}\n`;
  pdf += "%%EOF";

  return Buffer.from(pdf, "binary");
}

export async function POST(request: Request) {
  const guard = await guardRoute(request, "documents-pdf", { limit: 10 });
  if (isErrorResponse(guard)) return guard;

  try {
    const body = await request.json();
    const { title, content, type, practiceName } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "title and content required" }, { status: 400 });
    }

    const pdf = buildPDF(
      title || "Document",
      content || "",
      practiceName || "Netcare Health OS",
      type || "document"
    );

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf"`,
        "Content-Length": String(pdf.length),
      },
    });
  } catch (err) {
    console.error("[documents/pdf] Error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "PDF generation failed" }, { status: 500 });
  }
}
