// Multi-provider accounting integration (Sage, QuickBooks, Xero)
// Syncs invoices and payments from HealthOps to external accounting systems

export interface InvoiceSyncData {
  invoiceNo: string;
  patientName: string;
  lineItems: { description: string; quantity: number; unitPrice: number; code?: string }[];
  subtotal: number;
  tax: number;
  total: number;
  dueDate: string;
}

export interface PaymentSyncData {
  amount: number;
  method: string;
  reference: string;
  invoiceNo?: string;
  patientName: string;
  date: string;
}

interface TokenResult {
  accessToken: string;
  refreshToken?: string;
  realmId?: string;
  tenantId?: string;
  companyId?: string;
}

interface ProviderOpts {
  realmId?: string;
  tenantId?: string;
  companyId?: string;
}

export interface AccountingProvider {
  name: "sage" | "quickbooks" | "xero";
  getAuthUrl(practiceId: string): string;
  exchangeCode(code: string, extras?: { realmId?: string }): Promise<TokenResult>;
  refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken?: string }>;
  pushInvoice(accessToken: string, opts: ProviderOpts, invoice: InvoiceSyncData): Promise<{ externalId: string }>;
  pushPayment(accessToken: string, opts: ProviderOpts, payment: PaymentSyncData): Promise<{ externalId: string }>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CALLBACK_URL =
  `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/accounting/callback`;

function encodeState(data: Record<string, string>): string {
  return encodeURIComponent(JSON.stringify(data));
}

async function jsonOrThrow(res: Response, label: string) {
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${label} failed (${res.status}): ${text}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${label} returned non-JSON: ${text.slice(0, 200)}`);
  }
}

// ---------------------------------------------------------------------------
// Sage Business Cloud
// ---------------------------------------------------------------------------

const sage: AccountingProvider = {
  name: "sage",

  getAuthUrl(practiceId) {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.SAGE_CLIENT_ID ?? "",
      redirect_uri: CALLBACK_URL,
      scope: "full_access",
      state: encodeState({ practiceId, provider: "sage" }),
    });
    return `https://www.sageone.com/oauth2/auth/central?filter=apiv3.1&${params}`;
  },

  async exchangeCode(code) {
    const res = await fetch("https://oauth.accounting.sage.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: CALLBACK_URL,
        client_id: process.env.SAGE_CLIENT_ID ?? "",
        client_secret: process.env.SAGE_CLIENT_SECRET ?? "",
      }),
    });
    const data = await jsonOrThrow(res, "Sage token exchange");
    // Fetch company ID from /user endpoint
    let companyId = "";
    try {
      const userRes = await fetch("https://api.accounting.sage.com/v3.1/user", {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        companyId = userData?.id ?? "";
      }
    } catch { /* non-critical */ }
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      companyId,
    };
  },

  async refreshAccessToken(refreshToken) {
    const res = await fetch("https://oauth.accounting.sage.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: process.env.SAGE_CLIENT_ID ?? "",
        client_secret: process.env.SAGE_CLIENT_SECRET ?? "",
      }),
    });
    const data = await jsonOrThrow(res, "Sage token refresh");
    return { accessToken: data.access_token, refreshToken: data.refresh_token };
  },

  async pushInvoice(accessToken, _opts, invoice) {
    const body = {
      sales_invoice: {
        contact_name: invoice.patientName,
        reference: invoice.invoiceNo,
        due_date: invoice.dueDate,
        invoice_lines: invoice.lineItems.map((li) => ({
          description: li.description,
          quantity: li.quantity,
          unit_price: li.unitPrice,
          ledger_account_id: undefined, // defaults to sales account
        })),
      },
    };
    const res = await fetch("https://api.accounting.sage.com/v3.1/sales_invoices", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await jsonOrThrow(res, "Sage create invoice");
    return { externalId: data?.id ?? data?.sales_invoice?.id ?? "" };
  },

  async pushPayment(accessToken, _opts, payment) {
    const body = {
      contact_payment: {
        contact_name: payment.patientName,
        transaction_type_id: "CUSTOMER_RECEIPT",
        payment_method_id: mapSagePaymentMethod(payment.method),
        total_amount: payment.amount,
        reference: payment.reference || payment.invoiceNo || "",
        date: payment.date,
      },
    };
    const res = await fetch("https://api.accounting.sage.com/v3.1/contact_payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await jsonOrThrow(res, "Sage create payment");
    return { externalId: data?.id ?? data?.contact_payment?.id ?? "" };
  },
};

function mapSagePaymentMethod(method: string): string {
  switch (method) {
    case "card": return "CREDIT_DEBIT";
    case "eft": return "ELECTRONIC";
    case "medical_aid": return "ELECTRONIC";
    default: return "CASH";
  }
}

// ---------------------------------------------------------------------------
// QuickBooks Online
// ---------------------------------------------------------------------------

const quickbooks: AccountingProvider = {
  name: "quickbooks",

  getAuthUrl(practiceId) {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.QUICKBOOKS_CLIENT_ID ?? "",
      redirect_uri: CALLBACK_URL,
      scope: "com.intuit.quickbooks.accounting",
      state: encodeState({ practiceId, provider: "quickbooks" }),
    });
    return `https://appcenter.intuit.com/connect/oauth2?${params}`;
  },

  async exchangeCode(code, extras) {
    const basicAuth = Buffer.from(
      `${process.env.QUICKBOOKS_CLIENT_ID ?? ""}:${process.env.QUICKBOOKS_CLIENT_SECRET ?? ""}`,
    ).toString("base64");
    const res = await fetch("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: CALLBACK_URL,
      }),
    });
    const data = await jsonOrThrow(res, "QuickBooks token exchange");
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      realmId: extras?.realmId ?? "",
    };
  },

  async refreshAccessToken(refreshToken) {
    const basicAuth = Buffer.from(
      `${process.env.QUICKBOOKS_CLIENT_ID ?? ""}:${process.env.QUICKBOOKS_CLIENT_SECRET ?? ""}`,
    ).toString("base64");
    const res = await fetch("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });
    const data = await jsonOrThrow(res, "QuickBooks token refresh");
    return { accessToken: data.access_token, refreshToken: data.refresh_token };
  },

  async pushInvoice(accessToken, opts, invoice) {
    const realmId = opts.realmId ?? "";
    const body = {
      Line: invoice.lineItems.map((li, i) => ({
        DetailType: "SalesItemLineDetail",
        Amount: li.quantity * li.unitPrice,
        LineNum: i + 1,
        Description: li.description,
        SalesItemLineDetail: {
          Qty: li.quantity,
          UnitPrice: li.unitPrice,
        },
      })),
      CustomerRef: { name: invoice.patientName },
      DocNumber: invoice.invoiceNo,
      DueDate: invoice.dueDate,
      TxnTaxDetail: { TotalTax: invoice.tax },
    };
    const res = await fetch(
      `https://quickbooks.api.intuit.com/v3/company/${realmId}/invoice?minorversion=73`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );
    const data = await jsonOrThrow(res, "QuickBooks create invoice");
    return { externalId: data?.Invoice?.Id ?? "" };
  },

  async pushPayment(accessToken, opts, payment) {
    const realmId = opts.realmId ?? "";
    const body = {
      TotalAmt: payment.amount,
      CustomerRef: { name: payment.patientName },
      PaymentMethodRef: { name: mapQBPaymentMethod(payment.method) },
      TxnDate: payment.date,
      PrivateNote: payment.reference || "",
    };
    const res = await fetch(
      `https://quickbooks.api.intuit.com/v3/company/${realmId}/payment?minorversion=73`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );
    const data = await jsonOrThrow(res, "QuickBooks create payment");
    return { externalId: data?.Payment?.Id ?? "" };
  },
};

function mapQBPaymentMethod(method: string): string {
  switch (method) {
    case "card": return "Credit Card";
    case "eft": return "E-Check";
    case "medical_aid": return "Other";
    default: return "Cash";
  }
}

// ---------------------------------------------------------------------------
// Xero
// ---------------------------------------------------------------------------

const xero: AccountingProvider = {
  name: "xero",

  getAuthUrl(practiceId) {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.XERO_CLIENT_ID ?? "",
      redirect_uri: CALLBACK_URL,
      scope: "openid profile email accounting.transactions",
      state: encodeState({ practiceId, provider: "xero" }),
    });
    return `https://login.xero.com/identity/connect/authorize?${params}`;
  },

  async exchangeCode(code) {
    const basicAuth = Buffer.from(
      `${process.env.XERO_CLIENT_ID ?? ""}:${process.env.XERO_CLIENT_SECRET ?? ""}`,
    ).toString("base64");
    const res = await fetch("https://identity.xero.com/connect/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: CALLBACK_URL,
      }),
    });
    const data = await jsonOrThrow(res, "Xero token exchange");
    // Fetch tenantId from connections endpoint
    let tenantId = "";
    try {
      const connRes = await fetch("https://api.xero.com/connections", {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      if (connRes.ok) {
        const connections = await connRes.json();
        tenantId = connections?.[0]?.tenantId ?? "";
      }
    } catch { /* non-critical */ }
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tenantId,
    };
  },

  async refreshAccessToken(refreshToken) {
    const basicAuth = Buffer.from(
      `${process.env.XERO_CLIENT_ID ?? ""}:${process.env.XERO_CLIENT_SECRET ?? ""}`,
    ).toString("base64");
    const res = await fetch("https://identity.xero.com/connect/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });
    const data = await jsonOrThrow(res, "Xero token refresh");
    return { accessToken: data.access_token, refreshToken: data.refresh_token };
  },

  async pushInvoice(accessToken, opts, invoice) {
    const body = {
      Invoices: [
        {
          Type: "ACCREC",
          Contact: { Name: invoice.patientName },
          InvoiceNumber: invoice.invoiceNo,
          DueDate: invoice.dueDate,
          LineAmountTypes: "Exclusive",
          LineItems: invoice.lineItems.map((li) => ({
            Description: li.description,
            Quantity: li.quantity,
            UnitAmount: li.unitPrice,
            AccountCode: "200", // default sales revenue code
          })),
          Status: "AUTHORISED",
        },
      ],
    };
    const res = await fetch("https://api.xero.com/api.xro/2.0/Invoices", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "xero-tenant-id": opts.tenantId ?? "",
      },
      body: JSON.stringify(body),
    });
    const data = await jsonOrThrow(res, "Xero create invoice");
    return { externalId: data?.Invoices?.[0]?.InvoiceID ?? "" };
  },

  async pushPayment(accessToken, opts, payment) {
    const body = {
      Payments: [
        {
          Invoice: payment.invoiceNo ? { InvoiceNumber: payment.invoiceNo } : undefined,
          Account: { Code: "090" }, // default bank account
          Amount: payment.amount,
          Date: payment.date,
          Reference: payment.reference || payment.patientName,
        },
      ],
    };
    const res = await fetch("https://api.xero.com/api.xro/2.0/Payments", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "xero-tenant-id": opts.tenantId ?? "",
      },
      body: JSON.stringify(body),
    });
    const data = await jsonOrThrow(res, "Xero create payment");
    return { externalId: data?.Payments?.[0]?.PaymentID ?? "" };
  },
};

// ---------------------------------------------------------------------------
// Provider registry
// ---------------------------------------------------------------------------

const providers: Record<string, AccountingProvider> = {
  sage,
  quickbooks,
  xero,
};

export function getProvider(name: string): AccountingProvider {
  const provider = providers[name];
  if (!provider) {
    throw new Error(`Unknown accounting provider: ${name}. Supported: sage, quickbooks, xero`);
  }
  return provider;
}

/** Parse integrations JSON from the practice record (safe fallback). */
export function parseIntegrations(raw: string | null | undefined): Record<string, unknown> {
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

/** Extract the accounting config from an integrations blob. */
export function getAccountingConfig(integrations: Record<string, unknown>) {
  const acct = integrations.accounting as
    | {
        provider?: string;
        accessToken?: string;
        refreshToken?: string;
        realmId?: string;
        tenantId?: string;
        companyId?: string;
        connectedAt?: string;
        lastSyncAt?: string;
      }
    | undefined;
  return acct ?? null;
}

/**
 * Execute a provider API call with automatic token refresh on 401.
 * Returns the result and optionally a new access token if it was refreshed.
 */
export async function withTokenRefresh<T>(
  provider: AccountingProvider,
  config: { accessToken: string; refreshToken: string },
  fn: (token: string) => Promise<T>,
): Promise<{ result: T; newAccessToken?: string; newRefreshToken?: string }> {
  try {
    const result = await fn(config.accessToken);
    return { result };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // Retry on 401 with refreshed token
    if (msg.includes("401") && config.refreshToken) {
      const refreshed = await provider.refreshAccessToken(config.refreshToken);
      const result = await fn(refreshed.accessToken);
      return {
        result,
        newAccessToken: refreshed.accessToken,
        newRefreshToken: refreshed.refreshToken,
      };
    }
    throw err;
  }
}
