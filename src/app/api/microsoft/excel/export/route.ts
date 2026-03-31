import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

/** GET /api/microsoft/excel/export — Export engagement data as CSV for Excel/Power BI */
export async function GET(request: Request) {
  const guard = await guardRoute(request, "microsoft-excel-export");
  if (isErrorResponse(guard)) return guard;

  const url = new URL(request.url);
  const reportType = url.searchParams.get("type") || "patients";
  const format = url.searchParams.get("format") || "csv";

  const { prisma } = await import("@/lib/prisma");
  const pid = guard.practiceId;

  let headers = "";
  let rows: string[] = [];
  let fileName = "export";

  if (reportType === "patients") {
    fileName = "patients-engagement";
    headers = "Name,Phone,Email,DOB,Gender,Medical Aid,Member No,Last Visit,Next Recall,Status";
    if (isDemoMode) {
      rows = [
        "Thandi Molefe,+27821234567,thandi@demo.co.za,1985-03-15,F,Discovery,DH12345678,2026-03-15,2026-06-15,active",
        "Johannes van der Merwe,+27839876543,johannes@demo.co.za,1972-11-02,M,GEMS Emerald,GE87654321,2026-02-28,2026-05-28,active",
      ];
    } else {
      const patients = await prisma.patient.findMany({
        where: { practiceId: pid, status: "active" },
        select: { name: true, phone: true, email: true, dateOfBirth: true, gender: true, medicalAid: true, medicalAidNo: true, lastVisit: true, nextRecallDue: true, status: true },
        take: 5000,
      });
      rows = patients.map((p) => [p.name, p.phone, p.email, p.dateOfBirth?.toISOString().slice(0, 10) ?? "", p.gender, p.medicalAid, p.medicalAidNo, p.lastVisit?.toISOString().slice(0, 10) ?? "", p.nextRecallDue?.toISOString().slice(0, 10) ?? "", p.status].join(","));
    }
  } else if (reportType === "sequences") {
    fileName = "engagement-sequences";
    headers = "Sequence,Patient,Phone,Status,Current Step,Started,Completed,Last Response";
    if (!isDemoMode) {
      const enrollments = await prisma.sequenceEnrollment.findMany({
        where: { practiceId: pid },
        include: { sequence: { select: { name: true } } },
        take: 5000,
      });
      rows = enrollments.map((e) => [e.sequence.name, e.patientName, e.patientPhone, e.status, e.currentStep, e.startedAt.toISOString().slice(0, 10), e.completedAt?.toISOString().slice(0, 10) ?? "", e.lastResponse.slice(0, 50)].join(","));
    }
  } else if (reportType === "campaigns") {
    fileName = "campaign-results";
    headers = "Campaign,Type,Channel,Status,Sent,Delivered,Responded,Booked,Response Rate";
    if (!isDemoMode) {
      const campaigns = await prisma.patientCampaign.findMany({ where: { practiceId: pid } });
      rows = campaigns.map((c) => [c.name, c.type, c.channel, c.status, c.sentCount, c.deliveredCount, c.respondedCount, c.bookedCount, c.sentCount > 0 ? ((c.respondedCount / c.sentCount) * 100).toFixed(1) + "%" : "0%"].join(","));
    }
  } else if (reportType === "notifications") {
    fileName = "notification-history";
    headers = "Type,Recipient,Patient,Subject,Template,Status,Sent At";
    if (!isDemoMode) {
      const notifs = await prisma.notification.findMany({
        where: { practiceId: pid },
        orderBy: { sentAt: "desc" },
        take: 5000,
      });
      rows = notifs.map((n) => [n.type, n.recipient, n.patientName, n.subject, n.template, n.status, n.sentAt.toISOString()].join(","));
    }
  }

  const csv = `\uFEFF${headers}\n${rows.join("\n")}`;

  if (format === "json") {
    return NextResponse.json({ data: rows.map((r) => r.split(",").reduce((obj, val, i) => ({ ...obj, [headers.split(",")[i]]: val }), {})), exportDate: new Date().toISOString() });
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
