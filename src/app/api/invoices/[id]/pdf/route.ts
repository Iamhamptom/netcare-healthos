import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { demoStore, demoPractice } from "@/lib/demo-data";
import { generateInvoicePdf, type InvoicePdfData } from "@/lib/pdf-invoice";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await guardRoute(request, "invoices-pdf");
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;

  let pdfData: InvoicePdfData;

  if (isDemoMode) {
    const inv = demoStore.getInvoice(id) as Record<string, unknown> | null;
    if (!inv) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    let lineItems: InvoicePdfData["lineItems"] = [];
    try {
      lineItems = typeof inv.lineItems === "string" ? JSON.parse(inv.lineItems as string) : (inv.lineItems as InvoicePdfData["lineItems"]) || [];
    } catch {
      lineItems = [];
    }

    pdfData = {
      invoiceNo: String(inv.invoiceNo || ""),
      practiceName: demoPractice.name,
      practiceAddress: demoPractice.address,
      practicePhone: demoPractice.phone,
      patientName: String(inv.patientName || ""),
      lineItems,
      subtotal: Number(inv.subtotal || 0),
      tax: Number(inv.tax || 0),
      discount: Number(inv.discount || 0),
      total: Number(inv.total || 0),
      amountPaid: Number(inv.amountPaid || 0),
      balance: Number(inv.balance || 0),
      medicalAidClaim: Number(inv.medicalAidClaim || 0),
      patientPortion: Number(inv.patientPortion || 0),
      claimStatus: String(inv.claimStatus || ""),
      claimReference: String(inv.claimReference || ""),
      status: String(inv.status || "draft"),
      dueDate: String(inv.dueDate || ""),
      createdAt: String(inv.createdAt || ""),
      notes: String(inv.notes || ""),
    };
  } else {
    const { prisma } = await import("@/lib/prisma");
    const invoice = await prisma.invoice.findFirst({
      where: { id, practiceId: guard.practiceId },
      include: { practice: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    let lineItems: InvoicePdfData["lineItems"] = [];
    try {
      lineItems = JSON.parse(invoice.lineItems || "[]");
    } catch {
      lineItems = [];
    }

    pdfData = {
      invoiceNo: invoice.invoiceNo,
      practiceName: invoice.practice.name,
      practiceAddress: invoice.practice.address || "",
      practicePhone: invoice.practice.phone || "",
      patientName: invoice.patientName,
      lineItems,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      discount: invoice.discount,
      total: invoice.total,
      amountPaid: invoice.amountPaid,
      balance: invoice.balance,
      medicalAidClaim: invoice.medicalAidClaim,
      patientPortion: invoice.patientPortion,
      claimStatus: invoice.claimStatus,
      claimReference: invoice.claimReference,
      status: invoice.status,
      dueDate: invoice.dueDate?.toISOString() || "",
      createdAt: invoice.createdAt.toISOString(),
      notes: invoice.notes,
    };
  }

  const pdfBuffer = generateInvoicePdf(pdfData);
  const filename = `${pdfData.invoiceNo || "invoice"}.pdf`;

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(pdfBuffer.length),
    },
  });
}
