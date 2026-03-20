import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { sanitize, validateRequired } from "@/lib/validate";
import { submitClaim } from "@/lib/healthbridge/client";
import { buildClaimXML } from "@/lib/healthbridge/xml";
import { isValidICD10, isValidCPT } from "@/lib/healthbridge/codes";
import type { ClaimSubmission, ClaimLineItem } from "@/lib/healthbridge/types";

export async function GET(request: Request) {
  const guard = await guardRoute(request, "healthbridge-claims");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json({ claims: demoClaims });
  }

  const { prisma } = await import("@/lib/prisma");
  const url = new URL(request.url);
  const status = url.searchParams.get("status") || "";
  const scheme = url.searchParams.get("scheme") || "";

  const where: Record<string, unknown> = { practiceId: guard.practiceId };
  if (status) where.status = status;
  if (scheme) where.medicalAidScheme = { contains: scheme };

  const claims = await prisma.healthbridgeClaim.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ claims });
}

export async function POST(request: Request) {
  const guard = await guardRoute(request, "healthbridge-claims");
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  const err = validateRequired(body, ["patientName", "medicalAidScheme", "membershipNumber", "dateOfService"]);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  // Validate line items
  const lineItems: ClaimLineItem[] = body.lineItems || [];
  if (lineItems.length === 0) {
    return NextResponse.json({ error: "At least one line item is required" }, { status: 400 });
  }
  for (const item of lineItems) {
    if (item.icd10Code && !isValidICD10(item.icd10Code)) {
      return NextResponse.json({ error: `Invalid ICD-10 code: ${item.icd10Code}` }, { status: 400 });
    }
    if (item.cptCode && !isValidCPT(item.cptCode)) {
      return NextResponse.json({ error: `Invalid CPT code: ${item.cptCode}` }, { status: 400 });
    }
  }

  const totalAmount = lineItems.reduce((sum, li) => sum + (li.amount || 0) * (li.quantity || 1), 0);

  const submission: ClaimSubmission = {
    bhfNumber: sanitize(body.bhfNumber || process.env.HEALTHBRIDGE_BHF_NUMBER || "0000000"),
    providerNumber: sanitize(body.providerNumber || ""),
    treatingProvider: sanitize(body.treatingProvider || ""),
    referringProvider: body.referringProvider ? sanitize(body.referringProvider) : undefined,
    referringBhf: body.referringBhf ? sanitize(body.referringBhf) : undefined,
    patientName: sanitize(body.patientName),
    patientDob: body.patientDob || "",
    patientIdNumber: sanitize(body.patientIdNumber || ""),
    medicalAidScheme: sanitize(body.medicalAidScheme),
    membershipNumber: sanitize(body.membershipNumber),
    dependentCode: sanitize(body.dependentCode || "00"),
    dateOfService: body.dateOfService,
    placeOfService: body.placeOfService || "11",
    authorizationNumber: body.authorizationNumber ? sanitize(body.authorizationNumber) : undefined,
    lineItems,
    invoiceId: body.invoiceId || "",
    practiceId: guard.practiceId,
  };

  // Submit only if not draft
  const submitNow = body.submit !== false;
  const requestXml = buildClaimXML(submission);

  if (isDemoMode) {
    let response = null;
    if (submitNow) {
      response = await submitClaim(submission);
    }
    const claim = {
      id: `hbc-${Date.now()}`,
      ...submission,
      lineItems: JSON.stringify(lineItems),
      totalAmount,
      transactionRef: response?.transactionRef || "",
      status: response?.status || "draft",
      approvedAmount: response?.approvedAmount || 0,
      rejectionCode: response?.rejectionCode || "",
      rejectionReason: response?.rejectionReason || "",
      paidAmount: 0,
      remittanceRef: "",
      reconciledAt: null,
      requestXml,
      responseXml: response?.rawResponse || "",
      submittedAt: submitNow ? new Date().toISOString() : null,
      respondedAt: response ? new Date().toISOString() : null,
      notes: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json({ claim, switchResponse: response }, { status: 201 });
  }

  const { prisma } = await import("@/lib/prisma");

  // Submit to switch if requested
  let switchResponse = null;
  if (submitNow) {
    try {
      switchResponse = await submitClaim(submission);
    } catch (e) {
      // Store as draft if switch fails
      const claim = await prisma.healthbridgeClaim.create({
        data: {
          practiceId: guard.practiceId,
          invoiceId: body.invoiceId || "",
          patientName: sanitize(body.patientName),
          patientIdNumber: sanitize(body.patientIdNumber || ""),
          medicalAidScheme: sanitize(body.medicalAidScheme),
          membershipNumber: sanitize(body.membershipNumber),
          dependentCode: sanitize(body.dependentCode || "00"),
          dateOfService: body.dateOfService,
          placeOfService: body.placeOfService || "11",
          bhfNumber: submission.bhfNumber,
          providerNumber: sanitize(body.providerNumber || ""),
          treatingProvider: sanitize(body.treatingProvider || ""),
          authorizationNumber: body.authorizationNumber || "",
          lineItems: JSON.stringify(lineItems),
          totalAmount,
          status: "draft",
          requestXml,
          notes: `Switch error: ${e instanceof Error ? e.message : "Unknown error"}`,
        },
      });
      return NextResponse.json(
        { claim, error: "Switch submission failed — claim saved as draft", switchError: e instanceof Error ? e.message : "Unknown" },
        { status: 201 }
      );
    }
  }

  const claim = await prisma.healthbridgeClaim.create({
    data: {
      practiceId: guard.practiceId,
      invoiceId: body.invoiceId || "",
      patientName: sanitize(body.patientName),
      patientIdNumber: sanitize(body.patientIdNumber || ""),
      medicalAidScheme: sanitize(body.medicalAidScheme),
      membershipNumber: sanitize(body.membershipNumber),
      dependentCode: sanitize(body.dependentCode || "00"),
      dateOfService: body.dateOfService,
      placeOfService: body.placeOfService || "11",
      bhfNumber: submission.bhfNumber,
      providerNumber: sanitize(body.providerNumber || ""),
      treatingProvider: sanitize(body.treatingProvider || ""),
      authorizationNumber: body.authorizationNumber || "",
      lineItems: JSON.stringify(lineItems),
      totalAmount,
      transactionRef: switchResponse?.transactionRef || "",
      status: switchResponse?.status || "draft",
      approvedAmount: switchResponse?.approvedAmount || 0,
      rejectionCode: switchResponse?.rejectionCode || "",
      rejectionReason: switchResponse?.rejectionReason || "",
      requestXml,
      responseXml: switchResponse?.rawResponse || "",
      submittedAt: submitNow ? new Date() : null,
      respondedAt: switchResponse ? new Date() : null,
    },
  });

  return NextResponse.json({ claim, switchResponse }, { status: 201 });
}

// Demo data
const demoClaims = [
  {
    id: "hbc-demo-1",
    practiceId: "demo-practice",
    invoiceId: "",
    patientName: "John Mokoena",
    medicalAidScheme: "Discovery Health",
    membershipNumber: "900012345",
    dependentCode: "00",
    dateOfService: "2026-03-18",
    placeOfService: "11",
    lineItems: JSON.stringify([
      { icd10Code: "I10", cptCode: "0190", description: "GP consultation — hypertension review", quantity: 1, amount: 52000 },
      { icd10Code: "I10", cptCode: "0308", description: "ECG recording", quantity: 1, amount: 35000 },
    ]),
    totalAmount: 87000,
    transactionRef: "HB-SIM-001",
    status: "accepted",
    approvedAmount: 87000,
    rejectionCode: "",
    rejectionReason: "",
    paidAmount: 87000,
    remittanceRef: "ERA-SIM-001",
    submittedAt: "2026-03-18T09:30:00Z",
    respondedAt: "2026-03-18T09:30:02Z",
    reconciledAt: "2026-03-19T14:00:00Z",
    createdAt: "2026-03-18T09:30:00Z",
  },
  {
    id: "hbc-demo-2",
    practiceId: "demo-practice",
    invoiceId: "",
    patientName: "Priya Naidoo",
    medicalAidScheme: "Bonitas",
    membershipNumber: "800067890",
    dependentCode: "01",
    dateOfService: "2026-03-19",
    placeOfService: "11",
    lineItems: JSON.stringify([
      { icd10Code: "J06.9", cptCode: "0190", description: "GP consultation — URTI", quantity: 1, amount: 52000 },
    ]),
    totalAmount: 52000,
    transactionRef: "HB-SIM-002",
    status: "accepted",
    approvedAmount: 52000,
    rejectionCode: "",
    rejectionReason: "",
    paidAmount: 0,
    remittanceRef: "",
    submittedAt: "2026-03-19T11:15:00Z",
    respondedAt: "2026-03-19T11:15:01Z",
    reconciledAt: null,
    createdAt: "2026-03-19T11:15:00Z",
  },
  {
    id: "hbc-demo-3",
    practiceId: "demo-practice",
    invoiceId: "",
    patientName: "Thabo Molefe",
    medicalAidScheme: "GEMS",
    membershipNumber: "700011111",
    dependentCode: "00",
    dateOfService: "2026-03-19",
    placeOfService: "11",
    lineItems: JSON.stringify([
      { icd10Code: "E11.9", cptCode: "0193", description: "Extended consultation — diabetes management", quantity: 1, amount: 78000 },
      { icd10Code: "E11.9", cptCode: "0382", description: "Blood glucose point-of-care", quantity: 1, amount: 6500 },
    ]),
    totalAmount: 84500,
    transactionRef: "HB-SIM-003",
    status: "rejected",
    approvedAmount: 0,
    rejectionCode: "08",
    rejectionReason: "Pre-authorization required but not provided",
    paidAmount: 0,
    remittanceRef: "",
    submittedAt: "2026-03-19T14:20:00Z",
    respondedAt: "2026-03-19T14:20:03Z",
    reconciledAt: null,
    createdAt: "2026-03-19T14:20:00Z",
  },
];
