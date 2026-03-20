import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { sanitize, validateRequired } from "@/lib/validate";
import { checkEligibility } from "@/lib/healthbridge/client";

export async function GET(request: Request) {
  const guard = await guardRoute(request, "healthbridge-eligibility");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({ checks: demoEligibilityChecks });
  }

  const { prisma } = await import("@/lib/prisma");
  const checks = await prisma.healthbridgeEligibility.findMany({
    where: { practiceId: guard.practiceId },
    orderBy: { checkedAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ checks });
}

export async function POST(request: Request) {
  const guard = await guardRoute(request, "healthbridge-eligibility");
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  const err = validateRequired(body, ["membershipNumber", "scheme"]);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const result = await checkEligibility({
    membershipNumber: sanitize(body.membershipNumber),
    dependentCode: sanitize(body.dependentCode || "00"),
    patientDob: body.patientDob || "",
    scheme: sanitize(body.scheme),
  });

  if (isDemoMode) {
    const check = {
      id: `hbe-${Date.now()}`,
      practiceId: "demo-practice",
      patientName: sanitize(body.patientName || ""),
      membershipNumber: sanitize(body.membershipNumber),
      dependentCode: sanitize(body.dependentCode || "00"),
      scheme: sanitize(body.scheme),
      eligible: result.eligible,
      option: result.option,
      benefits: JSON.stringify(result.benefits || []),
      preAuthRequired: result.preAuthRequired || false,
      responseData: JSON.stringify(result),
      checkedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    return NextResponse.json({ check, result }, { status: 201 });
  }

  const { prisma } = await import("@/lib/prisma");
  const check = await prisma.healthbridgeEligibility.create({
    data: {
      practiceId: guard.practiceId,
      patientName: sanitize(body.patientName || ""),
      membershipNumber: sanitize(body.membershipNumber),
      dependentCode: sanitize(body.dependentCode || "00"),
      scheme: sanitize(body.scheme),
      eligible: result.eligible,
      option: result.option,
      benefits: JSON.stringify(result.benefits || []),
      preAuthRequired: result.preAuthRequired || false,
      responseData: JSON.stringify(result),
    },
  });

  return NextResponse.json({ check, result }, { status: 201 });
}

const demoEligibilityChecks = [
  {
    id: "hbe-demo-1",
    practiceId: "demo-practice",
    patientName: "John Mokoena",
    membershipNumber: "900012345",
    dependentCode: "00",
    scheme: "Discovery Health",
    eligible: true,
    option: "Executive Plan",
    benefits: JSON.stringify([
      { category: "GP Consultations", available: true, remainingAmount: 1500000, usedAmount: 350000, annualLimit: 1850000 },
      { category: "Specialist Consultations", available: true, remainingAmount: 2200000, usedAmount: 800000, annualLimit: 3000000 },
    ]),
    preAuthRequired: false,
    checkedAt: "2026-03-18T09:25:00Z",
  },
];
