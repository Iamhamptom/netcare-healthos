import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";

/**
 * Lead Tracking & Commission Engine
 *
 * GET  /api/leads → Dashboard: list all leads with status + commission tracking
 * POST /api/leads → Create a new lead (from SDK, WhatsApp, Availability Share, Outreach)
 *
 * Lead lifecycle: captured → qualified → booked → attended → paid → commission_collected
 *
 * Revenue model:
 * - Per lead (R150-500 depending on qualification score)
 * - Commission (5-10% of consultation fee)
 * - Practice chooses model at onboarding
 */

// In-memory store for demo (in production: Supabase table)
const leads: Lead[] = [];

interface Lead {
  id: string;
  practiceId: string;
  // Patient
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientLocation?: string;
  // Source
  source: "sdk_widget" | "whatsapp" | "availability_share" | "outreach" | "gp_referral" | "website_form" | "walk_in" | "recall";
  sourceDetail?: string; // e.g. "Google Ads - joint pain specialist", "Dr. Smith referral"
  // Qualification
  qualificationScore: number; // 0-100
  qualified: boolean;
  paymentMethod: "cash" | "medical_aid" | "unknown";
  medicalAid?: string;
  condition?: string;
  urgency: "routine" | "urgent" | "emergency";
  // Booking
  status: "captured" | "qualified" | "contacted" | "booked" | "attended" | "no_show" | "cancelled" | "paid" | "commission_collected";
  bookingId?: string;
  bookingDate?: string;
  bookingSite?: string;
  // Revenue
  consultationFee?: number; // R2600 for new, R1400 for follow-up
  revenueModel: "per_lead" | "commission" | "hybrid";
  leadFee?: number; // R150-500
  commissionRate?: number; // 0.05-0.10
  commissionAmount?: number; // Calculated
  totalRevenue?: number; // What VRL earns from this lead
  paymentCollected: boolean;
  // Timestamps
  capturedAt: string;
  qualifiedAt?: string;
  contactedAt?: string;
  bookedAt?: string;
  attendedAt?: string;
  paidAt?: string;
}

// Seed some demo leads for RheumCare
function seedDemoLeads() {
  if (leads.length > 0) return;

  const sources: Lead["source"][] = ["sdk_widget", "whatsapp", "availability_share", "gp_referral", "outreach", "website_form"];
  const conditions = ["Rheumatoid Arthritis", "Lupus (SLE)", "Gout", "Psoriatic Arthritis", "Ankylosing Spondylitis", "Joint Pain (undiagnosed)", "Sjogren's Syndrome"];
  const sites = ["Wits DGMC", "Netcare Sunward Park", "Life Groenkloof", "Mediclinic Trichardt"];
  const statuses: Lead["status"][] = ["captured", "qualified", "contacted", "booked", "attended", "paid", "no_show"];
  const names = [
    "Nomsa Dlamini", "Pieter van der Merwe", "Thabo Molefe", "Fatima Khan", "Sarah Botha",
    "Bongani Nkosi", "Amanda Pretorius", "Sipho Mthembu", "Lerato Mokoena", "John Adams",
    "Zanele Khumalo", "David Fourie", "Palesa Mahlangu", "Raj Naidoo", "Mary Johnson",
    "Kagiso Motaung", "Elise du Plessis", "Themba Zwane", "Anita Singh", "Paul Williams",
  ];

  const now = Date.now();
  for (let i = 0; i < 20; i++) {
    const source = sources[i % sources.length];
    const status = statuses[Math.min(i % 7, statuses.length - 1)];
    const score = 50 + Math.floor(Math.random() * 50);
    const isCash = Math.random() > 0.4;
    const fee = i % 3 === 0 ? 1400 : 2600;
    const leadFee = score >= 70 ? 350 : score >= 50 ? 200 : 150;

    leads.push({
      id: `LEAD-${(1000 + i).toString()}`,
      practiceId: "rheumcare",
      patientName: names[i],
      patientPhone: `+27 8${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 10000000).toString().padStart(7, "0")}`,
      patientLocation: ["Sandton", "Boksburg", "Pretoria", "Midrand", "Centurion", "Benoni"][i % 6],
      source,
      sourceDetail: source === "gp_referral" ? `Dr. ${["Smith", "Naidoo", "Botha", "Patel", "Moyo"][i % 5]} — ${["Sandton", "Boksburg", "Pretoria"][i % 3]} GP` : undefined,
      qualificationScore: score,
      qualified: score >= 60,
      paymentMethod: isCash ? "cash" : "medical_aid",
      medicalAid: isCash ? undefined : ["Discovery", "GEMS", "Bonitas", "Momentum"][i % 4],
      condition: conditions[i % conditions.length],
      urgency: i % 5 === 0 ? "urgent" : "routine",
      status,
      bookingDate: status === "booked" || status === "attended" || status === "paid" ? new Date(now + (i + 1) * 86400000).toISOString().split("T")[0] : undefined,
      bookingSite: status === "booked" || status === "attended" || status === "paid" ? sites[i % sites.length] : undefined,
      consultationFee: status === "attended" || status === "paid" ? fee : undefined,
      revenueModel: "hybrid",
      leadFee,
      commissionRate: 0.075,
      commissionAmount: status === "paid" ? Math.round(fee * 0.075) : undefined,
      totalRevenue: status === "paid" ? leadFee + Math.round(fee * 0.075) : status === "attended" ? leadFee : score >= 60 ? leadFee : 0,
      paymentCollected: status === "paid",
      capturedAt: new Date(now - (20 - i) * 86400000).toISOString(),
      qualifiedAt: score >= 60 ? new Date(now - (20 - i) * 86400000 + 3600000).toISOString() : undefined,
      contactedAt: ["contacted", "booked", "attended", "paid"].includes(status) ? new Date(now - (20 - i) * 86400000 + 7200000).toISOString() : undefined,
      bookedAt: ["booked", "attended", "paid"].includes(status) ? new Date(now - (20 - i) * 86400000 + 14400000).toISOString() : undefined,
      attendedAt: ["attended", "paid"].includes(status) ? new Date(now - (20 - i) * 86400000 + 86400000).toISOString() : undefined,
      paidAt: status === "paid" ? new Date(now - (20 - i) * 86400000 + 172800000).toISOString() : undefined,
    });
  }
}

export async function GET(request: Request) {
  const rl = await rateLimitByIp(request, "leads", { limit: 30 });
  if (!rl.allowed) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  seedDemoLeads();

  const { searchParams } = new URL(request.url);
  const practiceId = searchParams.get("practice") || "rheumcare";
  const status = searchParams.get("status");
  const source = searchParams.get("source");

  let filtered = leads.filter(l => l.practiceId === practiceId);
  if (status) filtered = filtered.filter(l => l.status === status);
  if (source) filtered = filtered.filter(l => l.source === source);

  // Calculate summary stats
  const total = filtered.length;
  const qualified = filtered.filter(l => l.qualified).length;
  const booked = filtered.filter(l => ["booked", "attended", "paid"].includes(l.status)).length;
  const attended = filtered.filter(l => ["attended", "paid"].includes(l.status)).length;
  const noShows = filtered.filter(l => l.status === "no_show").length;
  const totalRevenue = filtered.reduce((sum, l) => sum + (l.totalRevenue || 0), 0);
  const totalCommission = filtered.reduce((sum, l) => sum + (l.commissionAmount || 0), 0);
  const totalLeadFees = filtered.filter(l => l.qualified).reduce((sum, l) => sum + (l.leadFee || 0), 0);
  const conversionRate = total > 0 ? Math.round((attended / total) * 100) : 0;
  const avgScore = total > 0 ? Math.round(filtered.reduce((sum, l) => sum + l.qualificationScore, 0) / total) : 0;

  // Source breakdown
  const bySource: Record<string, number> = {};
  filtered.forEach(l => { bySource[l.source] = (bySource[l.source] || 0) + 1; });

  return NextResponse.json({
    leads: filtered,
    summary: {
      total,
      qualified,
      booked,
      attended,
      noShows,
      conversionRate: `${conversionRate}%`,
      avgQualificationScore: avgScore,
      revenue: {
        totalRevenue,
        totalLeadFees,
        totalCommission,
        projected30Day: Math.round(totalRevenue * (30 / Math.max(1, total)) * 5), // Project based on current pace
      },
      bySource,
      byStatus: {
        captured: filtered.filter(l => l.status === "captured").length,
        qualified: filtered.filter(l => l.status === "qualified").length,
        contacted: filtered.filter(l => l.status === "contacted").length,
        booked: filtered.filter(l => l.status === "booked").length,
        attended: filtered.filter(l => l.status === "attended").length,
        paid: filtered.filter(l => l.status === "paid").length,
        no_show: noShows,
        cancelled: filtered.filter(l => l.status === "cancelled").length,
      },
    },
  });
}

export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, "leads/create", { limit: 30 });
  if (!rl.allowed) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  try {
    const body = await request.json();
    const {
      practiceId = "rheumcare",
      patientName, patientPhone, patientEmail, patientLocation,
      source = "sdk_widget", sourceDetail,
      paymentMethod = "unknown", medicalAid, condition, urgency = "routine",
      revenueModel = "hybrid",
    } = body;

    if (!patientName || !patientPhone) {
      return NextResponse.json({ error: "patientName and patientPhone required" }, { status: 400 });
    }

    // Calculate qualification score
    let score = 40;
    if (paymentMethod === "cash") score += 30;
    if (paymentMethod === "medical_aid" && medicalAid) score += 20;
    if (condition) score += 10;
    if (urgency === "urgent") score += 15;
    if (urgency === "emergency") score += 20;
    if (source === "gp_referral") score += 15;
    if (source === "availability_share") score += 10;
    score = Math.min(score, 100);

    const leadFee = score >= 70 ? 350 : score >= 50 ? 200 : 150;

    const lead: Lead = {
      id: `LEAD-${Date.now().toString(36).toUpperCase()}`,
      practiceId,
      patientName, patientPhone, patientEmail, patientLocation,
      source, sourceDetail,
      qualificationScore: score,
      qualified: score >= 60,
      paymentMethod, medicalAid, condition, urgency,
      status: score >= 60 ? "qualified" : "captured",
      revenueModel,
      leadFee,
      commissionRate: 0.075,
      totalRevenue: score >= 60 ? leadFee : 0,
      paymentCollected: false,
      capturedAt: new Date().toISOString(),
      qualifiedAt: score >= 60 ? new Date().toISOString() : undefined,
    };

    leads.push(lead);

    return NextResponse.json({
      success: true,
      lead,
      message: score >= 60
        ? `Lead ${lead.id} qualified (score: ${score}). Patient will be contacted via WhatsApp.`
        : `Lead ${lead.id} captured (score: ${score}). Needs manual review.`,
    });
  } catch {
    return NextResponse.json({ error: "Lead creation failed" }, { status: 500 });
  }
}
