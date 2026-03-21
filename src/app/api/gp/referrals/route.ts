import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { rateLimitByIp } from "@/lib/rate-limit";

// Demo data for demo mode
const demoReferrals = [
  {
    id: "demo-ref-1",
    patientName: "Thabo Mokoena",
    patientPhone: "082 555 1234",
    patientEmail: "",
    dateOfBirth: "",
    medicalAid: "Discovery",
    medicalAidNo: "DIS-12345",
    reason: "Chronic sinusitis — 6 months, failed medical management. CT scan shows mucosal thickening.",
    urgency: "routine",
    clinicalNotes: "Currently on Flonase and Augmentin x3 courses. No improvement.",
    icd10Code: "J32.9",
    status: "booked",
    referringDoctor: "Dr. Demo GP",
    referringPractice: "Demo Family Practice",
    referringEmail: "demo@gp.co.za",
    referringPhone: "012 345 6789",
    feedbackSent: false,
    feedbackNote: "",
    practiceId: "demo-practice",
    createdAt: new Date().toISOString(),
  },
];

// GET — fetch referrals for the logged-in GP
export async function GET(request: Request) {
  const rl = await rateLimitByIp(request, "gp/referrals/get", { limit: 30 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  if (isDemoMode) {
    return NextResponse.json({ referrals: demoReferrals });
  }

  try {
    const { getSession } = await import("@/lib/auth");
    const { prisma } = await import("@/lib/prisma");

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true, role: true, practiceId: true, practice: { select: { name: true, phone: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Get referrals submitted BY this GP (matching by email or name)
    const referrals = await prisma.referral.findMany({
      where: {
        OR: [
          { referringEmail: user.email },
          { referringDoctor: user.name },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ referrals });
  } catch (err) {
    console.error("Fetch GP referrals error:", err);
    return NextResponse.json({ error: "Failed to fetch referrals." }, { status: 500 });
  }
}

// POST — submit a new referral
export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, "gp/referrals/post", { limit: 10 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  if (isDemoMode) {
    const body = await request.json();
    const demoRef = {
      id: `demo-ref-${Date.now()}`,
      ...body,
      status: "pending",
      referringDoctor: "Dr. Demo GP",
      referringPractice: "Demo Family Practice",
      referringEmail: "demo@gp.co.za",
      referringPhone: "012 345 6789",
      feedbackSent: false,
      feedbackNote: "",
      createdAt: new Date().toISOString(),
    };
    return NextResponse.json({ referral: demoRef });
  }

  try {
    const { getSession } = await import("@/lib/auth");
    const { prisma } = await import("@/lib/prisma");

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true, role: true, practiceId: true, practice: { select: { name: true, phone: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const body = await request.json();
    const {
      patientName,
      patientPhone,
      patientEmail,
      dateOfBirth,
      medicalAid,
      medicalAidNo,
      reason,
      urgency,
      clinicalNotes,
      icd10Code,
      practiceId,
    } = body;

    if (!patientName || !reason || !practiceId) {
      return NextResponse.json(
        { error: "Patient name, reason, and target practice are required." },
        { status: 400 }
      );
    }

    // Verify target practice exists
    const targetPractice = await prisma.practice.findUnique({
      where: { id: practiceId },
    });
    if (!targetPractice) {
      return NextResponse.json({ error: "Target specialist practice not found." }, { status: 404 });
    }

    const referral = await prisma.referral.create({
      data: {
        referringDoctor: user.name,
        referringPractice: user.practice?.name || "",
        referringEmail: user.email,
        referringPhone: user.practice?.phone || "",
        patientName: patientName || "",
        patientPhone: patientPhone || "",
        patientEmail: patientEmail || "",
        dateOfBirth: dateOfBirth || "",
        medicalAid: medicalAid || "",
        medicalAidNo: medicalAidNo || "",
        reason: reason || "",
        urgency: urgency || "routine",
        clinicalNotes: clinicalNotes || "",
        icd10Code: icd10Code || "",
        status: "pending",
        practiceId,
      },
    });

    return NextResponse.json({ referral });
  } catch (err) {
    console.error("Submit referral error:", err);
    return NextResponse.json({ error: "Failed to submit referral." }, { status: 500 });
  }
}
