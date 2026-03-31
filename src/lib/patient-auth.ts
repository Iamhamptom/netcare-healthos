/**
 * Patient Portal Auth — OTP-based authentication via WhatsApp
 *
 * Separate from staff auth (lib/auth.ts). Patients authenticate with their
 * phone number + 6-digit OTP sent via WhatsApp. JWT stored in cookie.
 */

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { rateLimitByIp } from "@/lib/rate-limit";

const PORTAL_JWT_SECRET = new TextEncoder().encode(
  process.env.PORTAL_JWT_SECRET || process.env.JWT_SECRET || "healthos-portal-secret-change-me",
);
const PORTAL_COOKIE_NAME = "healthos-patient-session";
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_OTP_ATTEMPTS = 5;
const SESSION_EXPIRY = "7d";

// ── OTP Generation ───────────────────────────────────────────────────────

export function generateOTP(): string {
  // 6-digit numeric code
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function hashOTP(otp: string): Promise<string> {
  const { hash } = await import("bcryptjs");
  return hash(otp, 10);
}

export async function verifyOTP(otp: string, hash: string): Promise<boolean> {
  const { compare } = await import("bcryptjs");
  return compare(otp, hash);
}

// ── JWT Session Management ───────────────────────────────────────────────

export async function createPatientSession(patientId: string, practiceId: string, phone: string): Promise<string> {
  const token = await new SignJWT({ patientId, practiceId, phone, type: "patient" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRY)
    .sign(PORTAL_JWT_SECRET);

  return token;
}

export async function getPatientSession(): Promise<{
  patientId: string;
  practiceId: string;
  phone: string;
} | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(PORTAL_COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, PORTAL_JWT_SECRET);
    if (payload.type !== "patient") return null;

    return {
      patientId: payload.patientId as string,
      practiceId: payload.practiceId as string,
      phone: payload.phone as string,
    };
  } catch {
    return null;
  }
}

export function setPatientSessionCookie(token: string): void {
  // Return headers for the response — caller sets via NextResponse
  // This is used by the verify-otp route
}

// ── Route Guard ──────────────────────────────────────────────────────────

export async function guardPatientRoute(
  request: Request,
  route: string,
  opts?: { limit?: number },
) {
  // Rate limit
  const rl = await rateLimitByIp(request, `portal:${route}`, { limit: opts?.limit ?? 20 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const session = await getPatientSession();
  if (!session) {
    return NextResponse.json({ error: "Please log in to your patient portal" }, { status: 401 });
  }

  return { patientId: session.patientId, practiceId: session.practiceId, phone: session.phone };
}

export function isPatientErrorResponse(guard: unknown): guard is NextResponse {
  return guard instanceof NextResponse;
}

// ── OTP Request/Verify Helpers ───────────────────────────────────────────

export async function requestOTP(phone: string, practiceId: string): Promise<{
  success: boolean;
  error?: string;
  patientId?: string;
}> {
  const { prisma } = await import("@/lib/prisma");

  // Find patient by phone + practice
  const patient = await prisma.patient.findFirst({
    where: { phone, practiceId, status: "active" },
  });

  if (!patient) {
    return { success: false, error: "No patient found with this phone number at this practice" };
  }

  // Check consent for digital access
  const consent = await prisma.consentRecord.findFirst({
    where: { patientId: patient.id, consentType: "data_processing", granted: true, revokedAt: null },
  });

  if (!consent) {
    return { success: false, error: "Please contact the practice to enable portal access" };
  }

  // Generate OTP
  const otp = generateOTP();
  const otpHashed = await hashOTP(otp);

  // Upsert PatientAuth record
  await prisma.patientAuth.upsert({
    where: { patientId: patient.id },
    create: {
      patientId: patient.id,
      phone,
      otpHash: otpHashed,
      otpExpiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
      otpAttempts: 0,
      practiceId,
    },
    update: {
      otpHash: otpHashed,
      otpExpiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
      otpAttempts: 0,
    },
  });

  // Send OTP via WhatsApp
  try {
    const { sendWhatsApp } = await import("@/lib/twilio");
    const practice = await prisma.practice.findUnique({ where: { id: practiceId }, select: { name: true } });
    await sendWhatsApp(
      phone,
      `Your ${practice?.name ?? "Health OS"} patient portal code is: ${otp}\n\nThis code expires in 5 minutes. Do not share it with anyone.`,
    );
  } catch {
    // WhatsApp not configured — log but don't fail
    console.error("[patient-auth] WhatsApp OTP send failed for", phone);
  }

  return { success: true, patientId: patient.id };
}

export async function verifyOTPAndCreateSession(
  phone: string,
  practiceId: string,
  otp: string,
): Promise<{
  success: boolean;
  token?: string;
  patientId?: string;
  error?: string;
}> {
  const { prisma } = await import("@/lib/prisma");

  // Find PatientAuth by phone + practice
  const patient = await prisma.patient.findFirst({
    where: { phone, practiceId, status: "active" },
  });
  if (!patient) return { success: false, error: "Patient not found" };

  const auth = await prisma.patientAuth.findUnique({
    where: { patientId: patient.id },
  });

  if (!auth) return { success: false, error: "No OTP requested" };

  // Check lockout
  if (auth.otpAttempts >= MAX_OTP_ATTEMPTS) {
    return { success: false, error: "Too many attempts. Please request a new code." };
  }

  // Check expiry
  if (!auth.otpExpiresAt || auth.otpExpiresAt < new Date()) {
    return { success: false, error: "Code expired. Please request a new one." };
  }

  // Verify OTP
  const valid = await verifyOTP(otp, auth.otpHash);

  if (!valid) {
    await prisma.patientAuth.update({
      where: { patientId: patient.id },
      data: { otpAttempts: { increment: 1 } },
    });
    return { success: false, error: "Invalid code" };
  }

  // Create session
  const token = await createPatientSession(patient.id, practiceId, phone);

  await prisma.patientAuth.update({
    where: { patientId: patient.id },
    data: {
      lastLoginAt: new Date(),
      otpHash: "",
      otpExpiresAt: null,
      otpAttempts: 0,
    },
  });

  return { success: true, token, patientId: patient.id };
}

// ── Constants ────────────────────────────────────────────────────────────

export { PORTAL_COOKIE_NAME, OTP_EXPIRY_MS, MAX_OTP_ATTEMPTS };
