import { NextResponse } from "next/server";
import { guardPlatformAdmin, isErrorResponse } from "@/lib/api-helpers";
import { db } from "@/lib/db";
import { supabaseAdmin, tables } from "@/lib/supabase";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await guardPlatformAdmin(request, "admin-clients-setup");
  if (isErrorResponse(guard)) return guard;

  const { id } = await params;

  const client = await db.getClient(id) as Record<string, unknown> | null;
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
  if (client.stage !== "won") {
    return NextResponse.json({ error: "Auto-setup only available when stage is 'won'" }, { status: 400 });
  }

  const tempPassword = `Health${Math.random().toString(36).slice(2, 8)}!`;
  const email = (client.email as string) || `${(client.doctorName as string).toLowerCase().replace(/[^a-z]/g, "")}@practice.co.za`;

  if (db.useSupabase) {
    const bcrypt = (await import("bcryptjs")).default;
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    // 1. Create Practice
    const subdomain = (client.practiceName as string).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20);
    const { data: practice, error: pErr } = await supabaseAdmin.from(tables.practices).insert({
      name: client.practiceName,
      type: ((client.specialty as string) || "general").toLowerCase().replace(/\s+/g, "_"),
      address: client.location,
      phone: client.phone,
      plan: client.planTier || "professional",
      plan_status: "trial",
      trial_ends_at: new Date(Date.now() + 14 * 86400000).toISOString(),
      subdomain,
      booking_enabled: true,
      booking_requires_approval: true,
      booking_services: JSON.stringify([
        { name: "Consultation", duration: 30, price: 950 },
        { name: "Follow-up", duration: 15, price: 650 },
        { name: "Procedure Consultation", duration: 45, price: 1200 },
      ]),
      booking_welcome_msg: `Welcome to ${client.practiceName}. Book your appointment online and we'll confirm via WhatsApp.`,
    }).select().single();
    if (pErr || !practice) return NextResponse.json({ error: pErr?.message || "Failed to create practice" }, { status: 500 });

    // 2. Create User
    const { data: user, error: uErr } = await supabaseAdmin.from(tables.users).insert({
      email,
      password_hash: passwordHash,
      name: client.doctorName,
      role: "admin",
      practice_id: practice.id,
    }).select().single();
    if (uErr || !user) return NextResponse.json({ error: uErr?.message || "Failed to create user" }, { status: 500 });

    // 3. Seed daily tasks
    const dailyTasks = [
      { title: "Check overnight messages & booking requests", category: "morning", sort_order: 1 },
      { title: "Review today's appointment schedule", category: "morning", sort_order: 2 },
      { title: "Approve pending bookings", category: "morning", sort_order: 3 },
      { title: "Process new patient enquiries", category: "during_day", sort_order: 1 },
      { title: "Check Google Reviews — respond to new reviews", category: "during_day", sort_order: 2 },
      { title: "Mark completed appointments", category: "end_of_day", sort_order: 1 },
      { title: "Review tomorrow's schedule", category: "end_of_day", sort_order: 2 },
      { title: "Process outstanding invoices", category: "end_of_day", sort_order: 3 },
    ];
    for (const task of dailyTasks) {
      await supabaseAdmin.from(tables.dailyTasks).insert({ ...task, practice_id: practice.id, is_recurring: true });
    }

    // 4. Allocate initial credits
    await supabaseAdmin.from(tables.creditLedger).insert({
      practice_id: practice.id,
      type: "ai_agent",
      amount: 500,
      balance: 500,
      description: "Trial allocation — 500 AI agent credits",
    });

    // 5. Update client pipeline
    await db.updateClient(id, {
      stage: "onboarding",
      onboardingStartedAt: new Date().toISOString(),
      practiceId: practice.id,
    });

    // 6. Log activity
    await db.createActivity({
      clientId: id,
      type: "setup",
      title: "Auto-setup completed",
      description: `Practice, user account, ${dailyTasks.length} daily tasks, and 500 AI credits created. Moved to onboarding.`,
      metadata: JSON.stringify({ practiceId: practice.id, email: user.email }),
      createdBy: "system",
    });

    return NextResponse.json({
      practice: { id: practice.id, name: practice.name },
      user: { email: user.email, tempPassword },
    });
  }

  // Prisma/SQLite path
  const { prisma } = await import("@/lib/prisma");
  const { hash } = await import("bcryptjs");

  // 1. Create Practice
  const practice = await prisma.practice.create({
    data: {
      name: client.practiceName as string,
      type: ((client.specialty as string) || "general").toLowerCase().replace(/\s+/g, "_"),
      address: client.location as string,
      phone: client.phone as string,
      plan: (client.planTier as string) || "professional",
      planStatus: "trial",
      trialEndsAt: new Date(Date.now() + 14 * 86400000),
      subdomain: (client.practiceName as string).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20),
      bookingEnabled: true,
      bookingRequiresApproval: true,
      bookingServices: JSON.stringify([
        { name: "Consultation", duration: 30, price: 950 },
        { name: "Follow-up", duration: 15, price: 650 },
        { name: "Procedure Consultation", duration: 45, price: 1200 },
      ]),
      bookingWelcomeMsg: `Welcome to ${client.practiceName}. Book your appointment online and we'll confirm via WhatsApp.`,
    },
  });

  // 2. Create User
  const passwordHash = await hash(tempPassword, 12);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: client.doctorName as string,
      role: "admin",
      practiceId: practice.id,
    },
  });

  // 3. Seed daily tasks
  const dailyTasks = [
    { title: "Check overnight messages & booking requests", category: "morning", sortOrder: 1 },
    { title: "Review today's appointment schedule", category: "morning", sortOrder: 2 },
    { title: "Approve pending bookings", category: "morning", sortOrder: 3 },
    { title: "Process new patient enquiries", category: "during_day", sortOrder: 1 },
    { title: "Check Google Reviews — respond to new reviews", category: "during_day", sortOrder: 2 },
    { title: "Mark completed appointments", category: "end_of_day", sortOrder: 1 },
    { title: "Review tomorrow's schedule", category: "end_of_day", sortOrder: 2 },
    { title: "Process outstanding invoices", category: "end_of_day", sortOrder: 3 },
  ];
  for (const task of dailyTasks) {
    await prisma.dailyTask.create({
      data: { ...task, practiceId: practice.id, isRecurring: true },
    });
  }

  // 4. Allocate initial credits
  await prisma.creditLedger.create({
    data: {
      practiceId: practice.id,
      type: "ai_agent",
      amount: 500,
      balance: 500,
      description: "Trial allocation — 500 AI agent credits",
    },
  });

  // 5. Update client pipeline
  await prisma.clientPipeline.update({
    where: { id },
    data: {
      stage: "onboarding",
      onboardingStartedAt: new Date(),
      practiceId: practice.id,
    },
  });

  // 6. Log activity
  await prisma.clientActivity.create({
    data: {
      clientId: id,
      type: "setup",
      title: "Auto-setup completed",
      description: `Practice, user account, ${dailyTasks.length} daily tasks, and 500 AI credits created. Moved to onboarding.`,
      metadata: JSON.stringify({ practiceId: practice.id, email: user.email }),
      createdBy: "system",
    },
  });

  return NextResponse.json({
    practice: { id: practice.id, name: practice.name },
    user: { email: user.email, tempPassword },
  });
}
