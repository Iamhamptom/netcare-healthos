/**
 * Unified Database Layer for HealthOps
 * Uses Supabase PostgreSQL in production, Prisma/SQLite locally
 */

import { supabaseAdmin, tables } from "./supabase";

const USE_SUPABASE = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

// Helper to convert camelCase to snake_case for Supabase columns
function toSnake(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
}

// Helper to convert snake_case to camelCase for app use
function toCamel(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[camelKey] = value;
  }
  return result;
}

function camelArray<T>(rows: Record<string, unknown>[]): T[] {
  return rows.map((r) => toCamel(r) as T);
}

export const db = {
  useSupabase: USE_SUPABASE,

  // ── Practices ──
  async getPractice(id: string) {
    if (!USE_SUPABASE) {
      const { prisma } = await import("./prisma");
      return prisma.practice.findUnique({ where: { id } });
    }
    const { data } = await supabaseAdmin.from(tables.practices).select("*").eq("id", id).single();
    return data ? toCamel(data) : null;
  },

  async getPracticeBySubdomain(subdomain: string) {
    if (!USE_SUPABASE) {
      const { prisma } = await import("./prisma");
      return prisma.practice.findFirst({ where: { subdomain } });
    }
    const { data } = await supabaseAdmin.from(tables.practices).select("*").eq("subdomain", subdomain).single();
    return data ? toCamel(data) : null;
  },

  async listPractices() {
    if (!USE_SUPABASE) {
      const { prisma } = await import("./prisma");
      return prisma.practice.findMany();
    }
    const { data } = await supabaseAdmin.from(tables.practices).select("*").order("created_at", { ascending: false });
    return camelArray(data || []);
  },

  async updatePractice(id: string, updates: Record<string, unknown>) {
    if (!USE_SUPABASE) {
      const { prisma } = await import("./prisma");
      return prisma.practice.update({ where: { id }, data: updates });
    }
    const { data } = await supabaseAdmin.from(tables.practices).update(toSnake(updates)).eq("id", id).select().single();
    return data ? toCamel(data) : null;
  },

  async createPractice(data: Record<string, unknown>) {
    if (!USE_SUPABASE) {
      const { prisma } = await import("./prisma");
      return prisma.practice.create({ data: data as never });
    }
    const { data: row } = await supabaseAdmin.from(tables.practices).insert(toSnake(data)).select().single();
    return row ? toCamel(row) : null;
  },

  // ── Users ──
  async getUserByEmail(email: string) {
    if (!USE_SUPABASE) {
      const { prisma } = await import("./prisma");
      return prisma.user.findUnique({ where: { email } });
    }
    const { data } = await supabaseAdmin.from(tables.users).select("*").eq("email", email).single();
    return data ? toCamel(data) : null;
  },

  async getUserById(id: string) {
    if (!USE_SUPABASE) {
      const { prisma } = await import("./prisma");
      return prisma.user.findUnique({ where: { id } });
    }
    const { data } = await supabaseAdmin.from(tables.users).select("*").eq("id", id).single();
    return data ? toCamel(data) : null;
  },

  async createUser(userData: Record<string, unknown>) {
    if (!USE_SUPABASE) {
      const { prisma } = await import("./prisma");
      return prisma.user.create({ data: userData as never });
    }
    const { data } = await supabaseAdmin.from(tables.users).insert(toSnake(userData)).select().single();
    return data ? toCamel(data) : null;
  },

  // ── Client Pipeline ──
  async listClients(filters?: { stage?: string; search?: string; planTier?: string }) {
    if (!USE_SUPABASE) {
      const { prisma } = await import("./prisma");
      const where: Record<string, unknown> = {};
      if (filters?.stage) where.stage = filters.stage;
      if (filters?.planTier) where.planTier = filters.planTier;
      return prisma.clientPipeline.findMany({ where, orderBy: { updatedAt: "desc" } });
    }
    let query = supabaseAdmin.from(tables.clientPipeline).select("*").order("updated_at", { ascending: false });
    if (filters?.stage) query = query.eq("stage", filters.stage);
    if (filters?.planTier) query = query.eq("plan_tier", filters.planTier);
    if (filters?.search) query = query.or(`doctor_name.ilike.%${filters.search}%,practice_name.ilike.%${filters.search}%`);
    const { data } = await query;
    return camelArray(data || []);
  },

  async getClient(id: string) {
    if (!USE_SUPABASE) {
      const { prisma } = await import("./prisma");
      return prisma.clientPipeline.findUnique({ where: { id } });
    }
    const { data } = await supabaseAdmin.from(tables.clientPipeline).select("*").eq("id", id).single();
    return data ? toCamel(data) : null;
  },

  async updateClient(id: string, updates: Record<string, unknown>) {
    if (!USE_SUPABASE) {
      const { prisma } = await import("./prisma");
      return prisma.clientPipeline.update({ where: { id }, data: updates });
    }
    const { data } = await supabaseAdmin.from(tables.clientPipeline).update(toSnake(updates)).eq("id", id).select().single();
    return data ? toCamel(data) : null;
  },

  async createClient(clientData: Record<string, unknown>) {
    if (!USE_SUPABASE) {
      const { prisma } = await import("./prisma");
      return prisma.clientPipeline.create({ data: clientData as never });
    }
    const { data } = await supabaseAdmin.from(tables.clientPipeline).insert(toSnake(clientData)).select().single();
    return data ? toCamel(data) : null;
  },

  // ── Client Activities ──
  async listClientActivities(clientId: string) {
    if (!USE_SUPABASE) {
      const { prisma } = await import("./prisma");
      return prisma.clientActivity.findMany({ where: { clientId }, orderBy: { createdAt: "desc" } });
    }
    const { data } = await supabaseAdmin.from(tables.clientActivities).select("*").eq("client_id", clientId).order("created_at", { ascending: false });
    return camelArray(data || []);
  },

  async createActivity(activityData: Record<string, unknown>) {
    if (!USE_SUPABASE) {
      const { prisma } = await import("./prisma");
      return prisma.clientActivity.create({ data: activityData as never });
    }
    const { data } = await supabaseAdmin.from(tables.clientActivities).insert(toSnake(activityData)).select().single();
    return data ? toCamel(data) : null;
  },

  // ── Investor Notes ──
  async listInvestorNotes(userId: string) {
    if (!USE_SUPABASE) {
      const { prisma } = await import("./prisma");
      return prisma.investorNote.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
    }
    const { data } = await supabaseAdmin.from(tables.investorNotes).select("*").eq("user_id", userId).order("created_at", { ascending: false });
    return camelArray(data || []);
  },

  async createInvestorNote(noteData: Record<string, unknown>) {
    if (!USE_SUPABASE) {
      const { prisma } = await import("./prisma");
      return prisma.investorNote.create({ data: noteData as never });
    }
    const { data } = await supabaseAdmin.from(tables.investorNotes).insert(toSnake(noteData)).select().single();
    return data ? toCamel(data) : null;
  },

  // ── Ops Documents ──
  async listOpsDocuments(category?: string) {
    if (!USE_SUPABASE) {
      const { prisma } = await import("./prisma");
      const where = category ? { category } : {};
      return prisma.opsDocument.findMany({ where, orderBy: { createdAt: "desc" } });
    }
    let query = supabaseAdmin.from(tables.opsDocuments).select("*").order("created_at", { ascending: false });
    if (category) query = query.eq("category", category);
    const { data } = await query;
    return camelArray(data || []);
  },

  // ── Referrals ──
  async listReferrals(practiceId: string) {
    if (!USE_SUPABASE) {
      const { prisma } = await import("./prisma");
      return prisma.referral.findMany({ where: { practiceId }, orderBy: { createdAt: "desc" } });
    }
    const { data } = await supabaseAdmin.from(tables.referrals).select("*").eq("practice_id", practiceId).order("created_at", { ascending: false });
    return camelArray(data || []);
  },

  async createReferral(referralData: Record<string, unknown>) {
    if (!USE_SUPABASE) {
      const { prisma } = await import("./prisma");
      return prisma.referral.create({ data: referralData as never });
    }
    const { data } = await supabaseAdmin.from(tables.referrals).insert(toSnake(referralData)).select().single();
    return data ? toCamel(data) : null;
  },

  // ── Credits ──
  async getCreditBalance(practiceId: string) {
    if (!USE_SUPABASE) {
      const { prisma } = await import("./prisma");
      const latest = await prisma.creditLedger.findFirst({ where: { practiceId }, orderBy: { createdAt: "desc" } });
      return latest?.balance ?? 0;
    }
    const { data } = await supabaseAdmin.from(tables.creditLedger).select("balance").eq("practice_id", practiceId).order("created_at", { ascending: false }).limit(1).single();
    return data?.balance ?? 0;
  },

  // ── Patients ──
  async listPatients(practiceId: string) {
    if (!USE_SUPABASE) {
      const { prisma } = await import("./prisma");
      return prisma.patient.findMany({ where: { practiceId }, orderBy: { createdAt: "desc" } });
    }
    const { data } = await supabaseAdmin.from(tables.patients).select("*").eq("practice_id", practiceId).order("created_at", { ascending: false });
    return camelArray(data || []);
  },

  // ── Bookings ──
  async listBookings(practiceId: string) {
    if (!USE_SUPABASE) {
      const { prisma } = await import("./prisma");
      return prisma.booking.findMany({ where: { practiceId }, orderBy: { scheduledAt: "desc" } });
    }
    const { data } = await supabaseAdmin.from(tables.bookings).select("*").eq("practice_id", practiceId).order("scheduled_at", { ascending: false });
    return camelArray(data || []);
  },

  // ── Daily Tasks ──
  async listDailyTasks(practiceId: string) {
    if (!USE_SUPABASE) {
      const { prisma } = await import("./prisma");
      return prisma.dailyTask.findMany({ where: { practiceId }, orderBy: { sortOrder: "asc" } });
    }
    const { data } = await supabaseAdmin.from(tables.dailyTasks).select("*").eq("practice_id", practiceId).order("sort_order", { ascending: true });
    return camelArray(data || []);
  },
};
