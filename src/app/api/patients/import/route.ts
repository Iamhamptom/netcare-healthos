import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { rateLimitByIp } from "@/lib/rate-limit";
import { parseSAID } from "@/lib/sa-id";

interface ImportRow {
  name: string;
  phone: string;
  email?: string;
  idNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  medicalAid?: string;
  medicalAidNumber?: string;
  bloodType?: string;
  address?: string;
}

export async function POST(request: Request) {
  const rl = await rateLimitByIp(request, "patients/import", { limit: 5 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });

  if (isDemoMode) {
    const { rows } = await request.json();
    return NextResponse.json({
      imported: (rows as ImportRow[]).length,
      skipped: 0,
      errors: [],
      message: `Demo: ${(rows as ImportRow[]).length} patients would be imported`,
    });
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const { guardRoute } = await import("@/lib/api-helpers");
    const result = await guardRoute(request, "patients/import");
    if (result instanceof NextResponse) return result;
    const user = result;

    const { rows } = await request.json() as { rows: ImportRow[] };
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No data to import" }, { status: 400 });
    }

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const row of rows) {
      try {
        if (!row.name || !row.phone) {
          errors.push(`Skipped: missing name or phone for "${row.name || "unknown"}"`);
          skipped++;
          continue;
        }

        // Check for duplicate by phone
        const existing = await prisma.patient.findFirst({
          where: { practiceId: user.practiceId, phone: row.phone },
        });
        if (existing) {
          skipped++;
          continue;
        }

        // Auto-extract DOB and gender from SA ID
        let dateOfBirth = row.dateOfBirth ? new Date(row.dateOfBirth) : undefined;
        let gender = row.gender || "";
        if (row.idNumber) {
          const idResult = parseSAID(row.idNumber);
          if (idResult.valid) {
            if (!dateOfBirth && idResult.dateOfBirth) dateOfBirth = idResult.dateOfBirth;
            if (!gender && idResult.gender) gender = idResult.gender;
          }
        }

        await prisma.patient.create({
          data: {
            name: row.name.trim(),
            phone: row.phone.trim(),
            email: row.email?.trim() || "",
            idNumber: row.idNumber?.trim() || "",
            dateOfBirth: dateOfBirth || null,
            gender,
            medicalAid: row.medicalAid?.trim() || "",
            bloodType: row.bloodType?.trim() || "",
            address: row.address?.trim() || "",
            practiceId: user.practiceId,
          },
        });
        imported++;
      } catch (err) {
        errors.push(`Error importing "${row.name}": ${err instanceof Error ? err.message : "unknown"}`);
        skipped++;
      }
    }

    return NextResponse.json({ imported, skipped, errors, message: `${imported} patients imported, ${skipped} skipped` });
  } catch {
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
