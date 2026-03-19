import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { demoPractice } from "@/lib/demo-data";
import { sanitize } from "@/lib/validate";

// Get tenant/branding info
export async function GET(request: Request) {
  const guard = await guardRoute(request, "tenant");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({
      tenant: {
        name: demoPractice.name,
        type: demoPractice.type,
        logoUrl: demoPractice.logoUrl,
        primaryColor: demoPractice.primaryColor,
        secondaryColor: demoPractice.secondaryColor,
        subdomain: demoPractice.subdomain,
        tagline: demoPractice.tagline,
        plan: demoPractice.plan,
        planStatus: demoPractice.planStatus,
      },
    });
  }

  const { prisma } = await import("@/lib/prisma");
  const practice = await prisma.practice.findUnique({
    where: { id: guard.practiceId },
    select: {
      id: true, name: true, type: true,
      logoUrl: true, primaryColor: true, secondaryColor: true,
      subdomain: true, tagline: true,
      plan: true, planStatus: true, trialEndsAt: true,
    },
  });
  return NextResponse.json({ tenant: practice });
}

// Update branding
export async function PUT(request: Request) {
  const guard = await guardRoute(request, "tenant");
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();

  if (isDemoMode) {
    if (body.logoUrl !== undefined) demoPractice.logoUrl = sanitize(body.logoUrl);
    if (body.primaryColor !== undefined) demoPractice.primaryColor = sanitize(body.primaryColor);
    if (body.secondaryColor !== undefined) demoPractice.secondaryColor = sanitize(body.secondaryColor);
    if (body.subdomain !== undefined) demoPractice.subdomain = sanitize(body.subdomain);
    if (body.tagline !== undefined) demoPractice.tagline = sanitize(body.tagline);
    return NextResponse.json({ tenant: demoPractice });
  }

  const { prisma } = await import("@/lib/prisma");
  const data: Record<string, string> = {};
  if (body.logoUrl !== undefined) data.logoUrl = sanitize(body.logoUrl);
  if (body.primaryColor !== undefined) data.primaryColor = sanitize(body.primaryColor);
  if (body.secondaryColor !== undefined) data.secondaryColor = sanitize(body.secondaryColor);
  if (body.subdomain !== undefined) data.subdomain = sanitize(body.subdomain);
  if (body.tagline !== undefined) data.tagline = sanitize(body.tagline);

  const practice = await prisma.practice.update({
    where: { id: guard.practiceId },
    data,
  });
  return NextResponse.json({ tenant: practice });
}
