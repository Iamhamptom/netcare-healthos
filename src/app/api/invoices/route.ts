import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { demoStore } from "@/lib/demo-data";
import { sanitize, clampInt } from "@/lib/validate";

export async function GET(request: Request) {
  const guard = await guardRoute(request, "invoices");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({ invoices: demoStore.getInvoices() });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = clampInt(parseInt(searchParams.get("limit") || "100", 10) || 100, 1, 100) ?? 100;
  const skip = (page - 1) * limit;

  const { prisma } = await import("@/lib/prisma");
  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where: { practiceId: guard.practiceId },
      include: { payments: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
    prisma.invoice.count({ where: { practiceId: guard.practiceId } }),
  ]);
  return NextResponse.json({ invoices, total, page, limit });
}

export async function POST(request: Request) {
  const guard = await guardRoute(request, "invoices");
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  if (!body.patientName) {
    return NextResponse.json({ error: "Patient name is required" }, { status: 400 });
  }

  if (isDemoMode) {
    const inv = demoStore.addInvoice({
      patientName: sanitize(body.patientName),
      patientId: body.patientId || "",
      lineItems: JSON.stringify(body.lineItems || []),
      subtotal: body.subtotal || 0,
      tax: body.tax || 0,
      discount: body.discount || 0,
      total: body.total || 0,
      medicalAidClaim: body.medicalAidClaim || 0,
      patientPortion: body.patientPortion || 0,
      notes: sanitize(body.notes || ""),
    });
    return NextResponse.json({ invoice: inv }, { status: 201 });
  }

  const { prisma } = await import("@/lib/prisma");
  const count = await prisma.invoice.count({ where: { practiceId: guard.practiceId } });
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNo: `INV-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`,
      patientName: sanitize(body.patientName),
      patientId: body.patientId || "",
      lineItems: JSON.stringify(body.lineItems || []),
      subtotal: body.subtotal || 0,
      tax: body.tax || 0,
      discount: body.discount || 0,
      total: body.total || 0,
      balance: body.total || 0,
      medicalAidClaim: body.medicalAidClaim || 0,
      patientPortion: body.patientPortion || 0,
      notes: sanitize(body.notes || ""),
      practiceId: guard.practiceId,
    },
  });
  return NextResponse.json({ invoice }, { status: 201 });
}
