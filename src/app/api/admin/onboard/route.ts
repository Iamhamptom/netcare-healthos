import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";
import { db } from "@/lib/db";

// POST /api/admin/onboard — One-click practice onboarding (platform admin only)
export async function POST(request: Request) {
  const rl = rateLimitByIp(request, "admin/onboard", { limit: 10 });
  if (!rl.allowed) return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  try {
    const body = await request.json();
    const {
      // Practice details
      practiceName,
      practiceType,
      doctorName,
      doctorEmail,
      doctorPhone,
      address,
      hours,
      specialty,
      // Branding
      primaryColor,
      secondaryColor,
      subdomain,
      tagline,
      logoUrl,
      // Plan
      plan,
      // Bot config
      aiPersonality,
      botType,
      // Domain preference
      domainPreference,
      // Notes
      notes,
    } = body;

    // Validation
    if (!practiceName || !doctorName || !doctorEmail) {
      return NextResponse.json({ error: "Practice name, doctor name, and email are required" }, { status: 400 });
    }

    // Check if email already registered
    const existing = await db.getUserByEmail(doctorEmail);
    if (existing) {
      return NextResponse.json({ error: "Email already registered. Use the practices panel to manage this account." }, { status: 409 });
    }

    // Generate a secure temporary password
    const tempPassword = generateTempPassword();
    const bcrypt = (await import("bcryptjs")).default;
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // 1. Create the practice
    const practice = await db.createPractice({
      name: practiceName,
      type: practiceType || "dental",
      address: address || "",
      phone: doctorPhone || "",
      hours: hours || "Mon-Fri 08:00-17:00, Sat 08:00-13:00",
      aiPersonality: aiPersonality || "professional",
      // White-label
      logoUrl: logoUrl || "",
      primaryColor: primaryColor || "#16a34a",
      secondaryColor: secondaryColor || "#2DD4BF",
      subdomain: subdomain || practiceName.toLowerCase().replace(/[^a-z0-9]/g, ""),
      tagline: tagline || `${practiceName} — Powered by Netcare Health OS`,
      // Subscription — activate immediately on professional
      plan: plan || "professional",
      planStatus: "active",
      // Bot metadata stored in integrations JSON
      integrations: JSON.stringify({
        botType: botType || "healthcare_assistant",
        domainPreference: domainPreference || "subdomain",
        onboardedBy: "platform_admin",
        onboardedAt: new Date().toISOString(),
        specialty: specialty || "",
        notes: notes || "",
      }),
    }) as Record<string, unknown>;

    if (!practice?.id) {
      return NextResponse.json({ error: "Failed to create practice" }, { status: 500 });
    }

    // 2. Create the admin user linked to the practice
    const user = await db.createUser({
      name: doctorName,
      email: doctorEmail,
      passwordHash,
      role: "admin",
      practiceId: practice.id,
    }) as Record<string, unknown>;

    // 3. Send welcome email with credentials + ToS
    try {
      const { sendEmail } = await import("@/lib/resend");
      const { onboardingWelcomeEmail } = await import("@/lib/resend");
      const emailContent = onboardingWelcomeEmail({
        practiceName,
        doctorName,
        email: doctorEmail,
        tempPassword,
        plan: plan || "professional",
        primaryColor: primaryColor || "#16a34a",
        aiPersonality: aiPersonality || "professional",
        botType: botType || "healthcare_assistant",
      });
      await sendEmail({
        to: doctorEmail,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    } catch (emailErr) {
      console.error("[onboard] Welcome email failed:", emailErr);
      // Don't fail the onboarding if email fails
    }

    // 4. Send alert to Dr. Hampton
    try {
      const { sendSignupAlerts } = await import("@/lib/signup-alerts");
      sendSignupAlerts({
        name: `[ONBOARDED] ${doctorName} — ${practiceName}`,
        email: doctorEmail,
        userId: (user?.id as string) || "unknown",
      });
    } catch {
      // Non-critical
    }

    // 5. Log the onboarding in client pipeline
    try {
      await db.createClient({
        practiceName,
        doctorName,
        specialty: specialty || "",
        location: address || "",
        phone: doctorPhone || "",
        email: doctorEmail,
        stage: "onboarding",
        planTier: plan || "professional",
        monthlyValue: plan === "enterprise" ? 55000 : plan === "core" ? 15000 : plan === "starter" ? 2999.99 : 35000,
        source: "admin_onboard",
        practiceId: practice.id as string,
        onboardingStartedAt: new Date().toISOString(),
        notes: notes || `Onboarded via admin panel. Bot: ${botType || "healthcare_assistant"}. Domain: ${domainPreference || "subdomain"}.`,
      });
    } catch {
      // Non-critical
    }

    return NextResponse.json({
      success: true,
      practice: {
        id: practice.id,
        name: practice.name,
        plan: practice.plan,
        subdomain: practice.subdomain,
      },
      user: {
        id: user?.id,
        email: doctorEmail,
        tempCredential: tempPassword,
      },
      message: `${practiceName} onboarded successfully. Welcome email sent to ${doctorEmail}.`,
    });
  } catch (err) {
    console.error("[onboard] Error:", err);
    return NextResponse.json({ error: "Onboarding failed. Check server logs." }, { status: 500 });
  }
}

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
