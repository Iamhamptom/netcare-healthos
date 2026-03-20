import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";
import { sanitize } from "@/lib/validate";
import { parseBatchCSV, validateBatch } from "@/lib/healthbridge/batch";
import { submitClaim } from "@/lib/healthbridge/client";
import { buildClaimXML } from "@/lib/healthbridge/xml";
import type { ClaimSubmission } from "@/lib/healthbridge/types";

/** POST /api/healthbridge/batch — Batch claim upload via CSV
 * Accepts CSV content, validates all rows, and optionally submits valid claims.
 * Query: ?action=validate (validate only) or ?action=submit (validate + submit valid)
 */
export async function POST(request: Request) {
  const guard = await guardRoute(request, "healthbridge-batch", { limit: 10 });
  if (isErrorResponse(guard)) return guard;

  const body = await request.json();
  const csvContent = body.csv || "";
  const action = body.action || "validate"; // validate | submit
  const bhfNumber = body.bhfNumber || process.env.HEALTHBRIDGE_BHF_NUMBER || "0000000";

  if (!csvContent) {
    return NextResponse.json({ error: "CSV content is required" }, { status: 400 });
  }

  // Parse CSV
  const { rows, errors: parseErrors } = parseBatchCSV(csvContent);
  if (parseErrors.length > 0) {
    return NextResponse.json({ error: "CSV parse errors", parseErrors }, { status: 400 });
  }
  if (rows.length === 0) {
    return NextResponse.json({ error: "No data rows found in CSV" }, { status: 400 });
  }
  if (rows.length > 500) {
    return NextResponse.json({ error: "Maximum 500 rows per batch" }, { status: 400 });
  }

  // Validate all rows
  const validation = validateBatch(rows, bhfNumber);

  // If validate only, return results
  if (action === "validate") {
    return NextResponse.json({
      action: "validate",
      validation,
    });
  }

  // Submit valid claims
  const submitted: { rowNumber: number; patientName: string; status: string; transactionRef: string }[] = [];
  const failed: { rowNumber: number; patientName: string; error: string }[] = [];

  for (const row of validation.rows) {
    if (!row.valid) continue;

    const batchRow = rows.find((r) => r.rowNumber === row.rowNumber);
    if (!batchRow) continue;

    const submission: ClaimSubmission = {
      bhfNumber,
      providerNumber: "",
      treatingProvider: "",
      patientName: sanitize(batchRow.patientName),
      patientDob: batchRow.patientDob,
      patientIdNumber: sanitize(batchRow.patientIdNumber),
      medicalAidScheme: sanitize(batchRow.medicalAidScheme),
      membershipNumber: sanitize(batchRow.membershipNumber),
      dependentCode: sanitize(batchRow.dependentCode),
      dateOfService: batchRow.dateOfService,
      placeOfService: "11",
      authorizationNumber: batchRow.authorizationNumber || undefined,
      lineItems: [{
        icd10Code: batchRow.icd10Code,
        cptCode: batchRow.cptCode,
        description: batchRow.description,
        quantity: 1,
        amount: Math.round(batchRow.amount * 100),
      }],
      practiceId: guard.practiceId,
    };

    try {
      const response = await submitClaim(submission);

      if (!isDemoMode) {
        const { prisma } = await import("@/lib/prisma");
        await prisma.healthbridgeClaim.create({
          data: {
            practiceId: guard.practiceId,
            patientName: sanitize(batchRow.patientName),
            patientIdNumber: sanitize(batchRow.patientIdNumber),
            medicalAidScheme: sanitize(batchRow.medicalAidScheme),
            membershipNumber: sanitize(batchRow.membershipNumber),
            dependentCode: sanitize(batchRow.dependentCode),
            dateOfService: batchRow.dateOfService,
            placeOfService: "11",
            bhfNumber,
            authorizationNumber: batchRow.authorizationNumber || "",
            lineItems: JSON.stringify(submission.lineItems),
            totalAmount: Math.round(batchRow.amount * 100),
            transactionRef: response.transactionRef,
            status: response.status,
            approvedAmount: response.approvedAmount || 0,
            rejectionCode: response.rejectionCode || "",
            rejectionReason: response.rejectionReason || "",
            requestXml: buildClaimXML(submission),
            responseXml: response.rawResponse || "",
            submittedAt: new Date(),
            respondedAt: new Date(),
          },
        });
      }

      submitted.push({
        rowNumber: batchRow.rowNumber,
        patientName: batchRow.patientName,
        status: response.status,
        transactionRef: response.transactionRef,
      });
    } catch (e) {
      failed.push({
        rowNumber: batchRow.rowNumber,
        patientName: batchRow.patientName,
        error: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({
    action: "submit",
    validation,
    submission: {
      submitted: submitted.length,
      failed: failed.length,
      skipped: validation.invalidRows,
      results: submitted,
      failures: failed,
    },
  });
}
