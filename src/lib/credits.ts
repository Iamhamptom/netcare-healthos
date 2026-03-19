// Credit tracking system for AI usage per practice
import { isDemoMode } from "@/lib/is-demo";

// Credit rates in ZAR
export const CREDIT_RATES: Record<string, number> = {
  ai_agent: 2.0,
  whatsapp: 0.75,
  sms: 0.5,
  email: 0.1,
  api_call: 0.25,
};

// Monthly included credits by subscription plan
export const PLAN_CREDITS: Record<string, number> = {
  starter: 1000,
  professional: 3000,
  enterprise: 8000,
};

// ─── In-memory demo store ───

interface LedgerEntry {
  id: string;
  practiceId: string;
  type: string;
  amount: number;
  balance: number;
  description: string;
  reference: string;
  createdAt: string;
}

let _demoLedger: LedgerEntry[] = [];
let _demoCounter = 1;

function demoCreditId() {
  return `cred${_demoCounter++}`;
}

function getDemoBalance(practiceId: string): number {
  const entries = _demoLedger.filter((e) => e.practiceId === practiceId);
  if (entries.length === 0) return 0;
  // Return the balance from the most recent entry
  return entries[entries.length - 1].balance;
}

// ─── Public API ───

/** Get current credit balance for a practice */
export async function getBalance(practiceId: string): Promise<number> {
  if (isDemoMode) {
    return getDemoBalance(practiceId);
  }

  const { prisma } = await import("@/lib/prisma");
  const latest = await prisma.creditLedger.findFirst({
    where: { practiceId },
    orderBy: { createdAt: "desc" },
  });
  return latest?.balance ?? 0;
}

/** Deduct credits for usage. Returns new balance. */
export async function chargeCredits(
  practiceId: string,
  type: string,
  amount: number,
  description: string,
  reference?: string
): Promise<{ balance: number; entry: LedgerEntry }> {
  const deduction = -Math.abs(amount);

  if (isDemoMode) {
    const currentBalance = getDemoBalance(practiceId);
    const newBalance = currentBalance + deduction;
    const entry: LedgerEntry = {
      id: demoCreditId(),
      practiceId,
      type,
      amount: deduction,
      balance: newBalance,
      description,
      reference: reference || "",
      createdAt: new Date().toISOString(),
    };
    _demoLedger.push(entry);
    return { balance: newBalance, entry };
  }

  const { prisma } = await import("@/lib/prisma");
  const currentBalance = await getBalance(practiceId);
  const newBalance = currentBalance + deduction;

  const entry = await prisma.creditLedger.create({
    data: {
      practiceId,
      type,
      amount: deduction,
      balance: newBalance,
      description,
      reference: reference || "",
    },
  });

  return { balance: newBalance, entry: entry as unknown as LedgerEntry };
}

/** Add credits (monthly allowance, manual top-up). Returns new balance. */
export async function addCredits(
  practiceId: string,
  amount: number,
  description: string
): Promise<{ balance: number; entry: LedgerEntry }> {
  const topUp = Math.abs(amount);

  if (isDemoMode) {
    const currentBalance = getDemoBalance(practiceId);
    const newBalance = currentBalance + topUp;
    const entry: LedgerEntry = {
      id: demoCreditId(),
      practiceId,
      type: "top_up",
      amount: topUp,
      balance: newBalance,
      description,
      reference: "",
      createdAt: new Date().toISOString(),
    };
    _demoLedger.push(entry);
    return { balance: newBalance, entry };
  }

  const { prisma } = await import("@/lib/prisma");
  const currentBalance = await getBalance(practiceId);
  const newBalance = currentBalance + topUp;

  const entry = await prisma.creditLedger.create({
    data: {
      practiceId,
      type: "top_up",
      amount: topUp,
      balance: newBalance,
      description,
    },
  });

  return { balance: newBalance, entry: entry as unknown as LedgerEntry };
}

/** Get recent usage history for a practice */
export async function getUsageHistory(
  practiceId: string,
  limit: number = 50
): Promise<LedgerEntry[]> {
  if (isDemoMode) {
    return _demoLedger
      .filter((e) => e.practiceId === practiceId)
      .slice(-limit)
      .reverse();
  }

  const { prisma } = await import("@/lib/prisma");
  const entries = await prisma.creditLedger.findMany({
    where: { practiceId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return entries as unknown as LedgerEntry[];
}

/** Seed demo ledger with initial data (called once) */
export function seedDemoCredits(practiceId: string) {
  if (_demoLedger.some((e) => e.practiceId === practiceId)) return;

  const now = new Date();
  const day = 86400000;

  // Opening balance — Professional plan monthly allowance
  _demoLedger.push({
    id: demoCreditId(),
    practiceId,
    type: "top_up",
    amount: 3000,
    balance: 3000,
    description: "Professional plan — March 2026 monthly allowance",
    reference: "",
    createdAt: new Date(now.getTime() - 14 * day).toISOString(),
  });

  // Sample usage entries
  _demoLedger.push({
    id: demoCreditId(),
    practiceId,
    type: "ai_agent",
    amount: -2.0,
    balance: 2998,
    description: "AI triage — Maria Santos toothache assessment",
    reference: "conv-001",
    createdAt: new Date(now.getTime() - 12 * day).toISOString(),
  });

  _demoLedger.push({
    id: demoCreditId(),
    practiceId,
    type: "whatsapp",
    amount: -0.75,
    balance: 2997.25,
    description: "WhatsApp reminder — Thabo Mokoena appointment",
    reference: "notif-001",
    createdAt: new Date(now.getTime() - 10 * day).toISOString(),
  });

  _demoLedger.push({
    id: demoCreditId(),
    practiceId,
    type: "sms",
    amount: -0.5,
    balance: 2996.75,
    description: "SMS recall — Lerato Dlamini 6-month check-up",
    reference: "recall-001",
    createdAt: new Date(now.getTime() - 8 * day).toISOString(),
  });

  _demoLedger.push({
    id: demoCreditId(),
    practiceId,
    type: "ai_agent",
    amount: -2.0,
    balance: 2994.75,
    description: "AI follow-up — Sipho Ndlovu post-extraction care",
    reference: "conv-002",
    createdAt: new Date(now.getTime() - 5 * day).toISOString(),
  });

  _demoLedger.push({
    id: demoCreditId(),
    practiceId,
    type: "email",
    amount: -0.1,
    balance: 2994.65,
    description: "Email invoice — Naledi Khumalo INV-2026-004",
    reference: "inv-004",
    createdAt: new Date(now.getTime() - 3 * day).toISOString(),
  });

  _demoLedger.push({
    id: demoCreditId(),
    practiceId,
    type: "api_call",
    amount: -0.25,
    balance: 2994.4,
    description: "External API call — booking sync",
    reference: "api-001",
    createdAt: new Date(now.getTime() - 1 * day).toISOString(),
  });
}
