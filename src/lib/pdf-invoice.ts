// Minimal PDF generator for invoices — no external dependencies
// Creates valid PDF 1.4 documents using Helvetica (built-in font)

export interface InvoicePdfData {
  invoiceNo: string;
  practiceName: string;
  practiceAddress: string;
  practicePhone: string;
  patientName: string;
  lineItems: { description: string; icd10Code?: string; quantity: number; unitPrice: number; total: number }[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  amountPaid: number;
  balance: number;
  medicalAidClaim: number;
  patientPortion: number;
  claimStatus: string;
  claimReference: string;
  status: string;
  dueDate: string;
  createdAt: string;
  notes: string;
}

// Escape special PDF string characters and replace non-latin1 chars
function pdfEsc(s: string): string {
  return s
    .replace(/[\u2014\u2013]/g, "-") // em/en dash
    .replace(/[\u2018\u2019]/g, "'") // smart quotes
    .replace(/[\u201C\u201D]/g, '"') // smart double quotes
    .replace(/[^\x00-\xFF]/g, "?")   // drop anything outside latin1
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function formatCurrency(n: number): string {
  return `R ${n.toFixed(2)}`;
}

/**
 * Generate a valid PDF buffer for the given invoice data.
 *
 * Layout constants (A4 portrait, 595 x 842 points):
 *   Left margin = 50, Right margin = 545, Top start = 790
 */
export function generateInvoicePdf(data: InvoicePdfData): Buffer {
  const PAGE_W = 595;
  const PAGE_H = 842;
  const ML = 50; // margin left
  const MR = 545; // margin right (x coord of right edge)
  let y = 790; // cursor y — moves down

  // Accumulate content-stream drawing commands
  const cmds: string[] = [];

  // Helper: draw text
  function text(x: number, yPos: number, size: number, txt: string, bold = false) {
    const font = bold ? "/F2" : "/F1";
    cmds.push(`BT ${font} ${size} Tf ${x} ${yPos} Td (${pdfEsc(txt)}) Tj ET`);
  }

  // Helper: draw a horizontal line
  function hline(x1: number, x2: number, yPos: number, width = 0.5) {
    cmds.push(`${width} w ${x1} ${yPos} m ${x2} ${yPos} l S`);
  }

  // Helper: draw filled rect (grey background for table header)
  function fillRect(x: number, yPos: number, w: number, h: number, grey = 0.92) {
    cmds.push(`${grey} g ${x} ${yPos} ${w} ${h} re f 0 g`);
  }

  // Helper: right-aligned text
  function textRight(xRight: number, yPos: number, size: number, txt: string, bold = false) {
    // Approximate char width: size * 0.5 for Helvetica
    const w = txt.length * size * 0.48;
    text(xRight - w, yPos, size, txt, bold);
  }

  // ─── Header ────────────────────────────────────────────────────
  text(ML, y, 16, data.practiceName, true);
  y -= 16;
  text(ML, y, 9, data.practiceAddress);
  y -= 12;
  text(ML, y, 9, `Tel: ${data.practicePhone}`);

  // "TAX INVOICE" right-aligned
  textRight(MR, 790, 20, "TAX INVOICE", true);

  y -= 24;
  hline(ML, MR, y);
  y -= 18;

  // ─── Invoice meta ──────────────────────────────────────────────
  const statusLabel = (data.status || "draft").toUpperCase();
  text(ML, y, 10, `Invoice No:  ${data.invoiceNo}`, true);
  textRight(MR, y, 10, `Status: ${statusLabel}`, true);
  y -= 14;
  text(ML, y, 9, `Date:  ${fmtDate(data.createdAt)}`);
  textRight(MR, y, 9, `Due Date: ${fmtDate(data.dueDate)}`);
  y -= 20;

  // Patient
  text(ML, y, 10, "Bill To:", true);
  y -= 14;
  text(ML, y, 10, data.patientName);
  y -= 24;

  // ─── Line items table ─────────────────────────────────────────
  const colDesc = ML;
  const colIcd = 280;
  const colQty = 370;
  const colUnit = 420;
  const colTotal = 490;

  // Table header background
  fillRect(ML - 4, y - 4, MR - ML + 8, 16);
  text(colDesc, y, 9, "Description", true);
  text(colIcd, y, 9, "ICD-10", true);
  textRight(colQty + 30, y, 9, "Qty", true);
  textRight(colUnit + 50, y, 9, "Unit Price", true);
  textRight(MR, y, 9, "Total", true);
  y -= 4;
  hline(ML, MR, y);
  y -= 14;

  for (const item of data.lineItems) {
    // Truncate long descriptions
    const desc = item.description.length > 38 ? item.description.slice(0, 38) + "..." : item.description;
    text(colDesc, y, 9, desc);
    text(colIcd, y, 9, item.icd10Code || "-");
    textRight(colQty + 30, y, 9, String(item.quantity));
    textRight(colUnit + 50, y, 9, formatCurrency(item.unitPrice));
    textRight(MR, y, 9, formatCurrency(item.total));
    y -= 14;
  }

  hline(ML, MR, y + 4);
  y -= 10;

  // ─── Totals ────────────────────────────────────────────────────
  const totalsX = 400;
  function totalRow(label: string, value: string, bold = false) {
    text(totalsX, y, 9, label, bold);
    textRight(MR, y, 9, value, bold);
    y -= 14;
  }

  totalRow("Subtotal:", formatCurrency(data.subtotal));
  totalRow("VAT (15%):", formatCurrency(data.tax));
  if (data.discount > 0) {
    totalRow("Discount:", `- ${formatCurrency(data.discount)}`);
  }
  hline(totalsX, MR, y + 4);
  y -= 2;
  totalRow("Total:", formatCurrency(data.total), true);
  y -= 6;

  // ─── Medical Aid section ───────────────────────────────────────
  if (data.medicalAidClaim > 0 || data.claimStatus) {
    text(ML, y, 10, "Medical Aid", true);
    y -= 14;
    hline(ML, ML + 200, y + 4);
    y -= 2;
    text(ML, y, 9, `Claim Amount:  ${formatCurrency(data.medicalAidClaim)}`);
    y -= 14;
    text(ML, y, 9, `Patient Portion:  ${formatCurrency(data.patientPortion)}`);
    y -= 14;
    text(ML, y, 9, `Claim Status:  ${(data.claimStatus || "-").toUpperCase()}`);
    y -= 14;
    if (data.claimReference) {
      text(ML, y, 9, `Reference:  ${data.claimReference}`);
      y -= 14;
    }
    y -= 6;
  }

  // ─── Payment summary ──────────────────────────────────────────
  hline(totalsX, MR, y + 4);
  y -= 2;
  totalRow("Amount Paid:", formatCurrency(data.amountPaid));
  totalRow("Balance Due:", formatCurrency(data.balance), true);
  y -= 6;

  // ─── Notes ─────────────────────────────────────────────────────
  if (data.notes) {
    text(ML, y, 9, "Notes:", true);
    y -= 14;
    // Wrap notes at ~90 chars
    const lines = wrapText(data.notes, 90);
    for (const line of lines) {
      text(ML, y, 9, line);
      y -= 12;
    }
    y -= 6;
  }

  // ─── Footer ────────────────────────────────────────────────────
  text(ML, 40, 8, "Generated by Health OS | Visio Research Labs");
  textRight(MR, 40, 8, `Page 1 of 1`);

  // ═══ Build PDF objects ═════════════════════════════════════════
  const streamContent = cmds.join("\n");
  const streamBytes = Buffer.from(streamContent, "latin1");

  // Object 1: Catalog
  // Object 2: Pages
  // Object 3: Page
  // Object 4: Font Helvetica
  // Object 5: Font Helvetica-Bold
  // Object 6: Content stream

  const objects: string[] = [];
  const offsets: number[] = [];

  // We build the raw PDF bytes manually
  const header = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";

  const obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  const obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents 6 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> >>\nendobj\n`;
  const obj4 = "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n";
  const obj5 = "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n";
  const obj6 = `6 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n`;
  const obj6End = "\nendstream\nendobj\n";

  objects.push(obj1, obj2, obj3, obj4, obj5);

  // Calculate byte offsets
  let pos = header.length;
  for (let i = 0; i < objects.length; i++) {
    offsets.push(pos);
    pos += Buffer.byteLength(objects[i], "latin1");
  }
  // Object 6 offset
  offsets.push(pos);
  pos += Buffer.byteLength(obj6, "latin1") + streamBytes.length + Buffer.byteLength(obj6End, "latin1");

  // Cross-reference table
  const xrefOffset = pos;
  let xref = "xref\n";
  xref += `0 ${offsets.length + 1}\n`;
  xref += "0000000000 65535 f \n";
  for (const off of offsets) {
    xref += `${String(off).padStart(10, "0")} 00000 n \n`;
  }

  // Trailer
  const trailer = `trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  // Assemble
  const parts: Buffer[] = [
    Buffer.from(header, "latin1"),
    ...objects.map(o => Buffer.from(o, "latin1")),
    Buffer.from(obj6, "latin1"),
    streamBytes,
    Buffer.from(obj6End, "latin1"),
    Buffer.from(xref, "latin1"),
    Buffer.from(trailer, "latin1"),
  ];

  return Buffer.concat(parts);
}

function fmtDate(d: string | null | undefined): string {
  if (!d) return "-";
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return String(d);
  }
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
