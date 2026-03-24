import { NextRequest, NextResponse } from "next/server";
import { parseCSV, autoMapColumns, extractClaimLines, suggestICD10Column } from "@/lib/claims/validation-engine";
import { isHealthbridgeFormat, parseHealthbridgeClaims } from "@/lib/claims/healthbridge-parser";
import { requireClaimsAuth, validateFileSize } from "@/lib/claims/auth-guard";
import { detectGeographicFraud } from "@/lib/claims/geographic-fraud";
import type { ColumnMapping, ClaimLineItem } from "@/lib/claims/types";

const MAX_CLAIMS = 10_000;

/**
 * POST /api/claims/geo-fraud
 *
 * Accepts a claims CSV file (multipart/form-data or JSON body) and runs
 * geographic fraud detection analysis. Returns an array of GeoFraudAlert
 * objects describing any detected geographic impossibility patterns.
 *
 * Supports both standard CSV format and Healthbridge export format.
 */
export async function POST(req: NextRequest) {
  // Auth + rate limit
  const auth = await requireClaimsAuth(req, "geo-fraud", { limit: 20, windowMs: 60_000 });
  if (!auth.authorized) return auth.response!;

  try {
    const contentType = req.headers.get("content-type") || "";
    let csvText: string;
    let customMapping: ColumnMapping | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const mappingStr = formData.get("mapping") as string | null;

      if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

      const sizeErr = validateFileSize(file);
      if (sizeErr) return NextResponse.json({ error: sizeErr }, { status: 400 });

      csvText = await file.text();
      if (mappingStr) {
        try { customMapping = JSON.parse(mappingStr); } catch { /* use auto */ }
      }
    } else {
      const body = await req.json();
      csvText = body.csv;
      customMapping = body.mapping;
      if (!csvText) return NextResponse.json({ error: "No CSV data provided" }, { status: 400 });
    }

    // Parse CSV
    const parsed = parseCSV(csvText);
    if (parsed.rows.length === 0) {
      return NextResponse.json({ error: "No valid data rows found", parseErrors: parsed.errors }, { status: 400 });
    }
    if (parsed.rows.length > MAX_CLAIMS) {
      return NextResponse.json({ error: `Too many rows (${parsed.rows.length}). Maximum is ${MAX_CLAIMS.toLocaleString()} claims per upload.` }, { status: 400 });
    }

    // Auto-detect format
    let claimLines: ClaimLineItem[];
    let detectedFormat = "standard";

    if (isHealthbridgeFormat(parsed.headers)) {
      claimLines = parseHealthbridgeClaims(parsed.rows);
      detectedFormat = "healthbridge";
    } else {
      const mapping = customMapping || autoMapColumns(parsed.headers, parsed.rows);
      if (!mapping.primaryICD10) {
        const suggestion = suggestICD10Column(parsed.headers, parsed.rows);
        if (suggestion && suggestion.confidence >= 0.5) {
          mapping.primaryICD10 = suggestion.header;
        } else {
          return NextResponse.json({
            error: "Could not auto-detect ICD-10 column. Provide a column mapping.",
            availableHeaders: parsed.headers,
          }, { status: 400 });
        }
      }
      claimLines = extractClaimLines(parsed.rows, mapping);
    }

    // Run geographic fraud detection
    const alerts = detectGeographicFraud(claimLines);

    // Build summary
    const summary = {
      totalClaims: claimLines.length,
      totalAlerts: alerts.length,
      byType: {
        PROVIDER_IMPOSSIBILITY: alerts.filter(a => a.type === "PROVIDER_IMPOSSIBILITY").length,
        PATIENT_IMPOSSIBILITY: alerts.filter(a => a.type === "PATIENT_IMPOSSIBILITY").length,
        ADDRESS_ANOMALY: alerts.filter(a => a.type === "ADDRESS_ANOMALY").length,
        DISTANCE_CLUSTER: alerts.filter(a => a.type === "DISTANCE_CLUSTER").length,
      },
      bySeverity: {
        error: alerts.filter(a => a.severity === "error").length,
        warning: alerts.filter(a => a.severity === "warning").length,
        info: alerts.filter(a => a.severity === "info").length,
      },
    };

    // Record health event (non-blocking)
    try {
      const { recordHealthEvent } = await import("@/lib/ml/system-hooks");
      recordHealthEvent("claims_analyzer", "geo_fraud_scan", {
        totalClaims: claimLines.length,
        alertCount: alerts.length,
        errorCount: summary.bySeverity.error,
        warningCount: summary.bySeverity.warning,
      });
    } catch { /* Non-blocking */ }

    return NextResponse.json({
      detectedFormat,
      alerts,
      summary,
      parseErrors: parsed.errors,
    });
  } catch (error) {
    console.error("Geographic fraud detection error:", error);
    return NextResponse.json({ error: "Failed to process claims file for geographic fraud detection" }, { status: 500 });
  }
}
