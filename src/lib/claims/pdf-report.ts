// Claims Rejection Analysis — PDF Report Generator
// Uses raw PDF 1.4 syntax (no external dependencies) — same pattern as pdf-invoice.ts

import type { ValidationResult, ValidationSeverity } from "./types";

// ─── Helpers ────────────────────────────────────────────────────────────────

function pdfEsc(s: string): string {
  return s
    .replace(/[\u2014\u2013]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[^\x00-\xFF]/g, "?")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapText(txt: string, maxLen: number): string[] {
  const words = txt.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if ((current + " " + w).trim().length > maxLen) {
      lines.push(current.trim());
      current = w;
    } else {
      current += " " + w;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
}

function fmtDate(): string {
  return new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" });
}

function anonymizeName(name?: string): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/);
  return parts.map(p => p[0]?.toUpperCase() || "").join(". ") + ".";
}

function severityLabel(s: ValidationSeverity): string {
  if (s === "error") return "ERROR";
  if (s === "warning") return "WARNING";
  return "INFO";
}

function pctString(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

// ─── PDF Generation ─────────────────────────────────────────────────────────

export interface ReportMetadata {
  practiceName: string;
  generatedBy: string;
}

/**
 * Generate a PDF buffer containing the full claims rejection analysis report.
 *
 * A4 portrait: 595 x 842 points. Left margin = 50, Right margin = 545.
 */
export function generateClaimsReport(
  result: ValidationResult,
  metadata: ReportMetadata
): Buffer {
  const PAGE_W = 595;
  const PAGE_H = 842;
  const ML = 50;
  const MR = 545;

  // We may need multiple pages — collect page streams
  const pages: string[][] = [];
  let cmds: string[] = [];
  let y = 790;

  function ensureSpace(needed: number) {
    if (y - needed < 60) {
      // Finish current page, start new one
      pages.push(cmds);
      cmds = [];
      y = 790;
    }
  }

  function text(x: number, yPos: number, size: number, txt: string, bold = false) {
    const font = bold ? "/F2" : "/F1";
    cmds.push(`BT ${font} ${size} Tf ${x} ${yPos} Td (${pdfEsc(txt)}) Tj ET`);
  }

  function textRight(xRight: number, yPos: number, size: number, txt: string, bold = false) {
    const w = txt.length * size * 0.48;
    text(xRight - w, yPos, size, txt, bold);
  }

  function hline(x1: number, x2: number, yPos: number, width = 0.5) {
    cmds.push(`${width} w ${x1} ${yPos} m ${x2} ${yPos} l S`);
  }

  function fillRect(x: number, yPos: number, w: number, h: number, grey = 0.92) {
    cmds.push(`${grey} g ${x} ${yPos} ${w} ${h} re f 0 g`);
  }

  // Color rect for risk bar
  function colorRect(x: number, yPos: number, w: number, h: number, r: number, g: number, b: number) {
    cmds.push(`${r} ${g} ${b} rg ${x} ${yPos} ${w} ${h} re f 0 g`);
  }

  // ─── 1. Header ──────────────────────────────────────────────────────────

  // Brand accent bar
  colorRect(ML - 4, y - 4, MR - ML + 8, 28, 0.0, 0.55, 0.35);
  cmds.push("1 g"); // white text
  text(ML + 4, y + 2, 14, "NETCARE HEALTH OS", true);
  textRight(MR - 4, y + 2, 10, "Claims Intelligence Engine", true);
  cmds.push("0 g"); // back to black

  y -= 40;
  text(ML, y, 18, "Claims Rejection Analysis Report", true);
  y -= 20;
  hline(ML, MR, y, 1);
  y -= 18;

  text(ML, y, 10, `Practice: ${metadata.practiceName}`, true);
  textRight(MR, y, 9, `Generated: ${fmtDate()}`);
  y -= 14;
  text(ML, y, 9, `Prepared by: ${metadata.generatedBy}`);
  y -= 24;

  // ─── 2. Executive Summary ───────────────────────────────────────────────

  text(ML, y, 13, "Executive Summary", true);
  y -= 6;
  hline(ML, ML + 140, y, 0.8);
  y -= 18;

  const { totalClaims, validClaims, invalidClaims, warningClaims, summary } = result;
  const rejRate = totalClaims > 0 ? invalidClaims / totalClaims : 0;

  // Summary grid — two columns
  const col2 = 300;
  text(ML, y, 10, `Total Claims Analyzed:`, true);
  text(ML + 160, y, 10, `${totalClaims}`);
  text(col2, y, 10, `Valid Claims:`, true);
  text(col2 + 120, y, 10, `${validClaims}`);
  y -= 16;

  text(ML, y, 10, `Rejected (Errors):`, true);
  text(ML + 160, y, 10, `${invalidClaims}`);
  text(col2, y, 10, `Warnings:`, true);
  text(col2 + 120, y, 10, `${warningClaims}`);
  y -= 16;

  text(ML, y, 10, `Rejection Rate:`, true);
  text(ML + 160, y, 10, pctString(rejRate));
  text(col2, y, 10, `Estimated Savings:`, true);
  text(col2 + 120, y, 10, `R ${summary.estimatedSavings.toFixed(2)}`);
  y -= 24;

  // ─── 3. Risk Score Bar ─────────────────────────────────────────────────

  text(ML, y, 12, "Rejection Risk Level", true);
  y -= 16;

  const barW = MR - ML;
  const barH = 18;

  // Background bar (light grey)
  fillRect(ML, y - 2, barW, barH, 0.9);

  // Filled portion — color based on rejection rate
  const fillW = Math.min(rejRate, 1) * barW;
  let rCol = 0.2, gCol = 0.7, bCol = 0.3; // green
  if (rejRate > 0.15) { rCol = 1; gCol = 0.65; bCol = 0; } // orange
  if (rejRate > 0.3) { rCol = 0.85; gCol = 0.15; bCol = 0.15; } // red
  if (fillW > 0) {
    colorRect(ML, y - 2, fillW, barH, rCol, gCol, bCol);
  }

  // Risk label
  let riskLabel = "LOW RISK";
  if (rejRate > 0.15) riskLabel = "MODERATE RISK";
  if (rejRate > 0.3) riskLabel = "HIGH RISK";
  cmds.push("1 g");
  text(ML + 8, y + 2, 10, `${riskLabel}  (${pctString(rejRate)} rejection rate)`, true);
  cmds.push("0 g");

  y -= 30;

  // ─── 4. Top Issues Table ────────────────────────────────────────────────

  ensureSpace(80);
  text(ML, y, 13, "Top Rejection Reasons", true);
  y -= 6;
  hline(ML, ML + 170, y, 0.8);
  y -= 18;

  // Table header
  fillRect(ML - 2, y - 4, MR - ML + 4, 16);
  text(ML, y, 9, "#", true);
  text(ML + 20, y, 9, "Rule / Issue", true);
  text(350, y, 9, "Severity", true);
  textRight(MR, y, 9, "Count", true);
  y -= 4;
  hline(ML, MR, y);
  y -= 14;

  const topIssues = summary.topIssues.slice(0, 10);
  for (let i = 0; i < topIssues.length; i++) {
    ensureSpace(16);
    const issue = topIssues[i];
    // Alternate row shading
    if (i % 2 === 0) fillRect(ML - 2, y - 4, MR - ML + 4, 14, 0.96);
    text(ML, y, 9, `${i + 1}`);
    const ruleText = issue.rule.length > 50 ? issue.rule.slice(0, 50) + "..." : issue.rule;
    text(ML + 20, y, 9, ruleText);
    text(350, y, 9, severityLabel(issue.severity));
    textRight(MR, y, 9, `${issue.count}`);
    y -= 14;
  }

  if (topIssues.length === 0) {
    text(ML, y, 9, "No issues found — all claims passed validation.");
    y -= 14;
  }

  y -= 16;

  // ─── 5. Detailed Findings ──────────────────────────────────────────────

  ensureSpace(40);
  text(ML, y, 13, "Detailed Findings", true);
  y -= 6;
  hline(ML, ML + 130, y, 0.8);
  y -= 18;

  const flaggedLines = result.lineResults.filter(lr => lr.status !== "valid");

  if (flaggedLines.length === 0) {
    text(ML, y, 10, "All claims passed validation. No issues to report.");
    y -= 20;
  } else {
    // Table header
    ensureSpace(20);
    fillRect(ML - 2, y - 4, MR - ML + 4, 16);
    text(ML, y, 8, "Ln#", true);
    text(ML + 28, y, 8, "ICD-10", true);
    text(ML + 80, y, 8, "Patient", true);
    text(ML + 140, y, 8, "Severity", true);
    text(ML + 200, y, 8, "Issue", true);
    y -= 4;
    hline(ML, MR, y);
    y -= 14;

    for (let i = 0; i < flaggedLines.length; i++) {
      const lr = flaggedLines[i];

      for (const issue of lr.issues) {
        ensureSpace(36);

        // Alternate row shading
        if (i % 2 === 0) fillRect(ML - 2, y - 4, MR - ML + 4, 14, 0.96);

        text(ML, y, 8, `${lr.lineNumber}`);
        text(ML + 28, y, 8, lr.claimData.primaryICD10 || "—");
        text(ML + 80, y, 8, anonymizeName(lr.claimData.patientName));
        text(ML + 140, y, 8, severityLabel(issue.severity));

        // Truncate issue message for table row
        const msgShort = issue.message.length > 55 ? issue.message.slice(0, 55) + "..." : issue.message;
        text(ML + 200, y, 8, msgShort);
        y -= 14;

        // Suggestion line (indented, smaller)
        if (issue.suggestion) {
          ensureSpace(14);
          const suggText = `Fix: ${issue.suggestion}`;
          const wrapped = wrapText(suggText, 85);
          for (const line of wrapped) {
            text(ML + 28, y, 7, line);
            y -= 11;
          }
        }
      }
    }
  }

  y -= 10;

  // ─── 6. Summary Stats ─────────────────────────────────────────────────

  ensureSpace(50);
  hline(ML, MR, y);
  y -= 16;
  text(ML, y, 9, `Total errors: ${summary.errorCount}    |    Total warnings: ${summary.warningCount}    |    Info notices: ${summary.infoCount}`);
  y -= 20;

  // Push final page
  pages.push(cmds);

  // ─── Build Multi-Page PDF ─────────────────────────────────────────────

  const totalPages = pages.length;

  // Add footer to each page
  for (let p = 0; p < totalPages; p++) {
    const pageCmds = pages[p];
    // Footer line
    pageCmds.push(`0.5 w ${ML} 52 m ${MR} 52 l S`);
    // Footer text
    pageCmds.push(`BT /F1 7 Tf ${ML} 40 Td (${pdfEsc("Generated by Health OS — Claims Intelligence Engine | Visio Research Labs")}) Tj ET`);
    // Page number right-aligned
    const pageStr = `Page ${p + 1} of ${totalPages}`;
    const pw = pageStr.length * 7 * 0.48;
    pageCmds.push(`BT /F1 7 Tf ${MR - pw} 40 Td (${pdfEsc(pageStr)}) Tj ET`);
  }

  // ═══ Assemble PDF objects ═════════════════════════════════════════════

  // Objects layout:
  //   1: Catalog
  //   2: Pages
  //   3..3+N-1: Page objects
  //   3+N: Font Helvetica
  //   3+N+1: Font Helvetica-Bold
  //   3+N+2 .. 3+N+1+N: Content streams (one per page)

  const pageObjStart = 3;
  const fontObj1 = pageObjStart + totalPages;       // Helvetica
  const fontObj2 = fontObj1 + 1;                     // Helvetica-Bold
  const streamObjStart = fontObj2 + 1;
  const totalObjects = streamObjStart + totalPages - 1;

  const header = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";

  // Page kids references
  const kidRefs = [];
  for (let p = 0; p < totalPages; p++) {
    kidRefs.push(`${pageObjStart + p} 0 R`);
  }

  const objects: string[] = [];
  const streamBuffers: Buffer[] = []; // indexed by page

  // Obj 1: Catalog
  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  // Obj 2: Pages
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [${kidRefs.join(" ")}] /Count ${totalPages} >>\nendobj\n`);

  // Page objects (3 .. 3+N-1)
  for (let p = 0; p < totalPages; p++) {
    const pageNum = pageObjStart + p;
    const streamNum = streamObjStart + p;
    objects.push(
      `${pageNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents ${streamNum} 0 R /Resources << /Font << /F1 ${fontObj1} 0 R /F2 ${fontObj2} 0 R >> >> >>\nendobj\n`
    );
  }

  // Font objects
  objects.push(`${fontObj1} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n`);
  objects.push(`${fontObj2} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n`);

  // Build stream buffers
  for (let p = 0; p < totalPages; p++) {
    streamBuffers.push(Buffer.from(pages[p].join("\n"), "latin1"));
  }

  // Stream objects (appended after main objects in the byte stream)
  // We'll build them separately since they contain binary lengths

  // ─── Calculate byte offsets ───────────────────────────────────────────

  const offsets: number[] = [];
  let pos = header.length;

  // Non-stream objects
  for (const obj of objects) {
    offsets.push(pos);
    pos += Buffer.byteLength(obj, "latin1");
  }

  // Stream objects
  const streamHeaders: string[] = [];
  const streamFooter = "\nendstream\nendobj\n";
  for (let p = 0; p < totalPages; p++) {
    const sLen = streamBuffers[p].length;
    const sHeader = `${streamObjStart + p} 0 obj\n<< /Length ${sLen} >>\nstream\n`;
    streamHeaders.push(sHeader);
    offsets.push(pos);
    pos += Buffer.byteLength(sHeader, "latin1") + sLen + Buffer.byteLength(streamFooter, "latin1");
  }

  // Cross-reference table
  const xrefOffset = pos;
  let xref = "xref\n";
  xref += `0 ${offsets.length + 1}\n`;
  xref += "0000000000 65535 f \n";
  for (const off of offsets) {
    xref += `${String(off).padStart(10, "0")} 00000 n \n`;
  }

  const trailer = `trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  // ─── Assemble final buffer ────────────────────────────────────────────

  const parts: Buffer[] = [Buffer.from(header, "latin1")];

  // Non-stream objects
  for (const obj of objects) {
    parts.push(Buffer.from(obj, "latin1"));
  }

  // Stream objects
  for (let p = 0; p < totalPages; p++) {
    parts.push(Buffer.from(streamHeaders[p], "latin1"));
    parts.push(streamBuffers[p]);
    parts.push(Buffer.from(streamFooter, "latin1"));
  }

  parts.push(Buffer.from(xref, "latin1"));
  parts.push(Buffer.from(trailer, "latin1"));

  return Buffer.concat(parts);
}
