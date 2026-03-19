/**
 * Yoco Payment Gateway Integration
 * Docs: https://developer.yoco.com/online/resources/integration-guide
 */

const YOCO_SECRET = process.env.YOCO_SECRET_KEY || "";
const YOCO_BASE = "https://payments.yoco.com/api";

export const YOCO_PUBLIC_KEY = process.env.NEXT_PUBLIC_YOCO_PUBLIC_KEY || "";

export const PLAN_AMOUNTS: Record<string, number> = {
  starter: 299999,       // R2,999.99 in cents
  core: 1500000,         // R15,000
  professional: 3500000, // R35,000
  enterprise: 5500000,   // R55,000
};

export const SETUP_FEES: Record<string, number> = {
  starter: 500000,       // R5,000
  core: 1500000,         // R15,000
  professional: 2500000, // R25,000
  enterprise: 4000000,   // R40,000
};

export const PLAN_LABELS: Record<string, string> = {
  starter: "Starter (R2,999.99/mo)",
  core: "Core (R15,000/mo)",
  professional: "Professional (R35,000/mo)",
  enterprise: "Enterprise (R55,000/mo)",
};

/** Create a Yoco checkout for subscription payment */
export async function createCheckout(opts: {
  amountInCents: number;
  currency?: string;
  description: string;
  successUrl: string;
  cancelUrl: string;
  failureUrl?: string;
  metadata?: Record<string, string>;
}) {
  const res = await fetch(`${YOCO_BASE}/checkouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${YOCO_SECRET}`,
    },
    body: JSON.stringify({
      amount: opts.amountInCents,
      currency: opts.currency || "ZAR",
      description: opts.description,
      successUrl: opts.successUrl,
      cancelUrl: opts.cancelUrl,
      failureUrl: opts.failureUrl || opts.cancelUrl,
      metadata: opts.metadata || {},
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Yoco checkout failed: ${err}`);
  }

  return res.json() as Promise<{
    id: string;
    redirectUrl: string;
    status: string;
  }>;
}

/** Verify a checkout payment status */
export async function getCheckout(checkoutId: string) {
  const res = await fetch(`${YOCO_BASE}/checkouts/${checkoutId}`, {
    headers: {
      Authorization: `Bearer ${YOCO_SECRET}`,
    },
  });

  if (!res.ok) return null;
  return res.json() as Promise<{
    id: string;
    status: "pending" | "completed" | "failed";
    amount: number;
    currency: string;
    metadata: Record<string, string>;
  }>;
}
