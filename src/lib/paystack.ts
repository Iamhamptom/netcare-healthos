// Paystack integration for subscription billing
// Docs: https://paystack.com/docs/api/

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";
const PAYSTACK_BASE = "https://api.paystack.co";

// Plan codes — create these in your Paystack dashboard
// Or use the /api/subscription/setup-plans endpoint to auto-create them
export const PLAN_CODES: Record<string, string> = {
  starter: process.env.PAYSTACK_PLAN_STARTER || "",
  core: process.env.PAYSTACK_PLAN_CORE || "",
  professional: process.env.PAYSTACK_PLAN_PRO || "",
  enterprise: process.env.PAYSTACK_PLAN_ENTERPRISE || "",
};

export const PLAN_PRICES: Record<string, number> = {
  starter: 299999,       // R2,999.99 in kobo (Starter promo)
  core: 1500000,         // R15,000 in kobo
  professional: 3500000, // R35,000 in kobo
  enterprise: 5500000,   // R55,000 in kobo
};

export const PLAN_NAMES: Record<string, string> = {
  starter: "Starter",
  core: "Core",
  professional: "Professional",
  enterprise: "Enterprise",
};

async function paystackFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
      ...opts?.headers,
    },
  });
  return res.json();
}

/** Initialize a subscription transaction — returns a checkout URL */
export async function initializeSubscription(email: string, plan: string, practiceId: string, metadata?: Record<string, string>) {
  const planCode = PLAN_CODES[plan];
  if (!planCode) throw new Error(`No Paystack plan code for: ${plan}`);

  const data = await paystackFetch("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email,
      plan: planCode,
      amount: PLAN_PRICES[plan],
      metadata: {
        practice_id: practiceId,
        plan,
        ...metadata,
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://healthops.co.za"}/dashboard/settings?tab=subscription&status=success`,
    }),
  });

  if (!data.status) throw new Error(data.message || "Failed to initialize transaction");
  return data.data as { authorization_url: string; access_code: string; reference: string };
}

/** Fetch a subscription by ID */
export async function getSubscription(subscriptionId: string) {
  const data = await paystackFetch(`/subscription/${subscriptionId}`);
  if (!data.status) return null;
  return data.data;
}

/** Disable (cancel) a subscription */
export async function cancelSubscription(subscriptionCode: string, emailToken: string) {
  const data = await paystackFetch("/subscription/disable", {
    method: "POST",
    body: JSON.stringify({ code: subscriptionCode, token: emailToken }),
  });
  return data;
}

/** Verify a transaction reference */
export async function verifyTransaction(reference: string) {
  const data = await paystackFetch(`/transaction/verify/${reference}`);
  if (!data.status) return null;
  return data.data;
}

/** Create plans in Paystack dashboard (run once during setup) */
export async function createPlans() {
  const results: Record<string, unknown> = {};
  for (const [key, amount] of Object.entries(PLAN_PRICES)) {
    const data = await paystackFetch("/plan", {
      method: "POST",
      body: JSON.stringify({
        name: `Netcare Health OS Ops — ${PLAN_NAMES[key]}`,
        amount,
        interval: "monthly",
        currency: "ZAR",
      }),
    });
    results[key] = data;
  }
  return results;
}

/** Validate Paystack webhook signature */
export function validateWebhookSignature(body: string, signature: string): boolean {
  // Paystack signs webhooks with HMAC SHA-512
  // In production, use crypto.createHmac — but Next.js edge needs webcrypto
  if (!PAYSTACK_SECRET || !signature) return false;

  try {
    const crypto = require("crypto");
    const hash = crypto.createHmac("sha512", PAYSTACK_SECRET).update(body).digest("hex");
    return hash === signature;
  } catch {
    return false;
  }
}
