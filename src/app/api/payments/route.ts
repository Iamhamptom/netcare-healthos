import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { demoStore } from "@/lib/demo-data";
import { sanitize } from "@/lib/validate";

export async function GET(request: Request) {
  const guard = await guardRoute(request, "payments");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({
      payments: demoStore.getPayments(),
      todayRevenue: demoStore.getDailyRevenue(),
    });
  }

  const { prisma } = await import("@/lib/prisma");
  const payments = await prisma.payment.findMany({
    where: { practiceId: guard.practiceId },
    orderBy: { createdAt: "desc" },
  });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayRevenue = payments
    .filter(p => new Date(p.createdAt) >= today)
    .reduce((sum, p) => sum + p.amount, 0);

  return NextResponse.json({ payments, todayRevenue });
}

export async function POST(request: Request) {
  const guard = await guardRoute(request, "payments");
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  if (!body.amount || body.amount <= 0) {
    return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
  }

  const methods = ["cash", "card", "eft", "medical_aid"];
  const method = methods.includes(body.method) ? body.method : "cash";

  if (isDemoMode) {
    const payment = demoStore.addPayment({
      amount: Number(body.amount),
      method,
      reference: sanitize(body.reference || ""),
      invoiceId: body.invoiceId || null,
      patientName: sanitize(body.patientName || ""),
      notes: sanitize(body.notes || ""),
    });
    return NextResponse.json({ payment }, { status: 201 });
  }

  const { prisma } = await import("@/lib/prisma");
  const payment = await prisma.payment.create({
    data: {
      amount: Number(body.amount),
      method,
      reference: sanitize(body.reference || ""),
      invoiceId: body.invoiceId || null,
      patientName: sanitize(body.patientName || ""),
      notes: sanitize(body.notes || ""),
      practiceId: guard.practiceId,
    },
  });

  // Update invoice balance if linked
  if (body.invoiceId) {
    const invoice = await prisma.invoice.findUnique({ where: { id: body.invoiceId } });
    if (invoice) {
      const newAmountPaid = invoice.amountPaid + Number(body.amount);
      const newBalance = invoice.total - newAmountPaid;
      await prisma.invoice.update({
        where: { id: body.invoiceId },
        data: {
          amountPaid: newAmountPaid,
          balance: newBalance,
          status: newBalance <= 0 ? "paid" : "partial",
          paidAt: newBalance <= 0 ? (invoice.paidAt || new Date()) : invoice.paidAt,
        },
      });
    }
  }

  return NextResponse.json({ payment }, { status: 201 });
}
