import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/is-demo";
import { demoStore } from "@/lib/demo-data";
import { guardRoute, isErrorResponse } from "@/lib/api-helpers";

export async function GET(request: Request) {
  const guard = await guardRoute(request, "analytics");
  if (isErrorResponse(guard)) return guard;

  if (isDemoMode) {
    return NextResponse.json(demoStore.getAnalytics());
  }

  const { prisma } = await import("@/lib/prisma");
  const pid = guard.practiceId;

  const [patients, bookings, reviews, recallItems, conversations, records, vitals] = await Promise.all([
    prisma.patient.findMany({ where: { practiceId: pid }, select: { id: true, status: true, createdAt: true, lastVisit: true } }),
    prisma.booking.findMany({ where: { practiceId: pid }, select: { id: true, status: true, scheduledAt: true, service: true, createdAt: true } }),
    prisma.review.findMany({ where: { practiceId: pid }, select: { rating: true, source: true, createdAt: true } }),
    prisma.recallItem.findMany({ where: { practiceId: pid }, select: { contacted: true, dueDate: true } }),
    prisma.conversation.findMany({ where: { practiceId: pid }, select: { id: true, status: true, createdAt: true } }),
    prisma.medicalRecord.findMany({ where: { practiceId: pid }, select: { type: true, createdAt: true } }),
    prisma.vitals.count({ where: { patient: { practiceId: pid } } }),
  ]);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const today = now.toDateString();

  // Patient metrics
  const totalPatients = patients.length;
  const activePatients = patients.filter(p => p.status === "active").length;
  const newPatientsThisMonth = patients.filter(p => p.createdAt >= thirtyDaysAgo).length;

  // Booking metrics
  const totalBookings = bookings.length;
  const bookingsToday = bookings.filter(b => new Date(b.scheduledAt).toDateString() === today).length;
  const pendingBookings = bookings.filter(b => b.status === "pending").length;
  const confirmedBookings = bookings.filter(b => b.status === "confirmed").length;
  const cancelledBookings = bookings.filter(b => b.status === "cancelled").length;
  const completedBookings = bookings.filter(b => b.status === "completed").length;

  // Top services
  const serviceCounts: Record<string, number> = {};
  for (const b of bookings) {
    serviceCounts[b.service] = (serviceCounts[b.service] || 0) + 1;
  }
  const topServices = Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Review metrics
  const ratings = reviews.map(r => r.rating);
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0;
  const reviewsBySource: Record<string, number> = {};
  for (const r of reviews) {
    reviewsBySource[r.source] = (reviewsBySource[r.source] || 0) + 1;
  }

  // Recall
  const recallDue = recallItems.filter(r => !r.contacted).length;
  const recallOverdue = recallItems.filter(r => !r.contacted && new Date(r.dueDate) < now).length;

  // Records breakdown
  const recordsByType: Record<string, number> = {};
  for (const r of records) {
    recordsByType[r.type] = (recordsByType[r.type] || 0) + 1;
  }

  return NextResponse.json({
    patients: { total: totalPatients, active: activePatients, newThisMonth: newPatientsThisMonth },
    bookings: { total: totalBookings, today: bookingsToday, pending: pendingBookings, confirmed: confirmedBookings, cancelled: cancelledBookings, completed: completedBookings },
    topServices,
    reviews: { total: reviews.length, avgRating: Number(avgRating.toFixed(1)), bySource: reviewsBySource },
    recall: { due: recallDue, overdue: recallOverdue },
    conversations: { total: conversations.length, active: conversations.filter(c => c.status === "active").length },
    records: { total: records.length, byType: recordsByType },
    vitals: { total: vitals },
  });
}
