import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import {
  getProvider,
  parseIntegrations,
  getAccountingConfig,
  withTokenRefresh,
  type InvoiceSyncData,
  type PaymentSyncData,
} from "@/lib/accounting";

/** POST /api/accounting/sync — Sync invoices/payments to connected accounting system */
export async function POST(request: Request) {
  const guard = await guardRoute(request, "accounting-sync", { limit: 5 });
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  const { action, invoiceId, paymentId } = body as {
    action?: string;
    invoiceId?: string;
    paymentId?: string;
  };

  if (!action || !["sync_invoice", "sync_payment", "sync_all"].includes(action)) {
    return NextResponse.json(
      { error: "Invalid action. Use: sync_invoice, sync_payment, sync_all" },
      { status: 400 },
    );
  }

  if (isDemoMode) {
    return NextResponse.json({
      success: true,
      action,
      synced: action === "sync_all" ? 3 : 1,
      errors: 0,
      results: action === "sync_all"
        ? [
            { type: "invoice", id: "demo-inv-1", externalId: "SAGE-001" },
            { type: "invoice", id: "demo-inv-2", externalId: "SAGE-002" },
            { type: "payment", id: "demo-pay-1", externalId: "SAGE-003" },
          ]
        : [{ type: action === "sync_invoice" ? "invoice" : "payment", id: invoiceId ?? paymentId ?? "demo-1", externalId: "SAGE-001" }],
    });
  }

  // Load accounting config from practice
  const { prisma } = await import("@/lib/prisma");
  const practice = await prisma.practice.findUnique({
    where: { id: guard.practiceId },
    select: { integrations: true },
  });

  const integrations = parseIntegrations(practice?.integrations);
  const config = getAccountingConfig(integrations);

  if (!config?.provider || !config.accessToken) {
    return NextResponse.json(
      { error: "No accounting system connected. Connect via Settings > Integrations." },
      { status: 400 },
    );
  }

  const provider = getProvider(config.provider);
  const providerOpts = {
    realmId: config.realmId,
    tenantId: config.tenantId,
    companyId: config.companyId,
  };

  const results: { type: string; id: string; externalId?: string; error?: string }[] = [];
  let tokenUpdated = false;
  let currentAccessToken = config.accessToken;
  let currentRefreshToken = config.refreshToken ?? "";

  // Helper to update tokens if they were refreshed
  const trackTokenRefresh = (newAccess?: string, newRefresh?: string) => {
    if (newAccess) {
      currentAccessToken = newAccess;
      tokenUpdated = true;
    }
    if (newRefresh) {
      currentRefreshToken = newRefresh;
    }
  };

  try {
    if (action === "sync_invoice" || action === "sync_all") {
      const invoices = action === "sync_invoice" && invoiceId
        ? await prisma.invoice.findMany({ where: { id: invoiceId, practiceId: guard.practiceId } })
        : await prisma.invoice.findMany({
            where: {
              practiceId: guard.practiceId,
              createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            },
            orderBy: { createdAt: "desc" },
          });

      for (const inv of invoices) {
        try {
          const lineItems = JSON.parse(inv.lineItems || "[]") as {
            description: string;
            quantity: number;
            unitPrice: number;
            icd10Code?: string;
          }[];

          const syncData: InvoiceSyncData = {
            invoiceNo: inv.invoiceNo,
            patientName: inv.patientName,
            lineItems: lineItems.map((li) => ({
              description: li.description,
              quantity: li.quantity ?? 1,
              unitPrice: li.unitPrice ?? 0,
              code: li.icd10Code,
            })),
            subtotal: inv.subtotal,
            tax: inv.tax,
            total: inv.total,
            dueDate: inv.dueDate ? inv.dueDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          };

          const { result, newAccessToken, newRefreshToken } = await withTokenRefresh(
            provider,
            { accessToken: currentAccessToken, refreshToken: currentRefreshToken },
            (token) => provider.pushInvoice(token, providerOpts, syncData),
          );
          trackTokenRefresh(newAccessToken, newRefreshToken);
          results.push({ type: "invoice", id: inv.id, externalId: result.externalId });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          results.push({ type: "invoice", id: inv.id, error: msg });
        }
      }
    }

    if (action === "sync_payment" || action === "sync_all") {
      const payments = action === "sync_payment" && paymentId
        ? await prisma.payment.findMany({ where: { id: paymentId, practiceId: guard.practiceId } })
        : await prisma.payment.findMany({
            where: {
              practiceId: guard.practiceId,
              createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            },
            include: { invoice: true },
            orderBy: { createdAt: "desc" },
          });

      for (const pay of payments) {
        try {
          const syncData: PaymentSyncData = {
            amount: pay.amount,
            method: pay.method,
            reference: pay.reference,
            invoiceNo: (pay as unknown as { invoice?: { invoiceNo?: string } }).invoice?.invoiceNo,
            patientName: pay.patientName,
            date: pay.createdAt.toISOString().split("T")[0],
          };

          const { result, newAccessToken, newRefreshToken } = await withTokenRefresh(
            provider,
            { accessToken: currentAccessToken, refreshToken: currentRefreshToken },
            (token) => provider.pushPayment(token, providerOpts, syncData),
          );
          trackTokenRefresh(newAccessToken, newRefreshToken);
          results.push({ type: "payment", id: pay.id, externalId: result.externalId });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          results.push({ type: "payment", id: pay.id, error: msg });
        }
      }
    }

    // Persist refreshed tokens and update lastSyncAt
    if (tokenUpdated || results.length > 0) {
      const updatedIntegrations = {
        ...integrations,
        accounting: {
          ...config,
          accessToken: currentAccessToken,
          refreshToken: currentRefreshToken,
          lastSyncAt: new Date().toISOString(),
        },
      };
      await prisma.practice.update({
        where: { id: guard.practiceId },
        data: { integrations: JSON.stringify(updatedIntegrations) },
      });
    }

    const synced = results.filter((r) => !r.error).length;
    const errors = results.filter((r) => r.error).length;

    return NextResponse.json({ success: true, action, synced, errors, results });
  } catch (err) {
    console.error("[accounting/sync] Error:", err);
    return NextResponse.json(
      { error: "Sync failed: " + (err instanceof Error ? err.message : String(err)) },
      { status: 500 },
    );
  }
}
