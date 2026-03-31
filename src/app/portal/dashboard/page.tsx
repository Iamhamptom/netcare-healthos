"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, FileText, MessageSquare, Pill, User, Heart } from "lucide-react";

export default function PatientDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/portal/profile").then((r) => r.json()),
      fetch("/api/portal/appointments").then((r) => r.json()),
    ]).then(([p, a]) => {
      setProfile(p.patient);
      setAppointments((a.appointments || []).filter((ap: any) => new Date(ap.scheduledAt) >= new Date()).slice(0, 3));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-lg mx-auto space-y-3 pt-8">{[...Array(5)].map((_, i) => <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 animate-pulse h-16" />)}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 px-4 py-5">
        <div className="max-w-lg mx-auto">
          <p className="text-[12px] text-gray-400">Welcome back</p>
          <h1 className="text-lg font-semibold text-white">{profile?.name || "Patient"}</h1>
          {profile?.medicalAid && <p className="text-[12px] text-gray-400 mt-0.5">{profile.medicalAid}</p>}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-3 space-y-3 pb-8">
        {/* Appointments */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-semibold text-gray-900 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-500" /> Upcoming
            </h2>
            <Link href="/portal/appointments" className="text-[11px] text-gray-500 hover:text-gray-700">View all</Link>
          </div>
          {appointments.length > 0 ? (
            <div className="space-y-2">
              {appointments.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div>
                    <p className="text-[13px] font-medium text-gray-900">{a.service}</p>
                    <p className="text-[11px] text-gray-500">{new Date(a.scheduledAt).toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${a.status === "confirmed" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-600"}`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-gray-400">No upcoming appointments</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { href: "/portal/appointments", icon: Calendar, label: "Book" },
            { href: "/portal/results", icon: FileText, label: "Results" },
            { href: "/portal/messages", icon: MessageSquare, label: "Messages" },
            { href: "/portal/prescriptions", icon: Pill, label: "Scripts" },
          ].map((a) => (
            <Link key={a.href} href={a.href} className="bg-white border border-gray-200 rounded-xl p-3.5 text-center hover:border-gray-300 hover:shadow-sm transition-all">
              <a.icon className="w-5 h-5 text-gray-500 mx-auto mb-1.5" />
              <p className="text-[12px] font-medium text-gray-900">{a.label}</p>
            </Link>
          ))}
        </div>

        {/* Recall Reminder */}
        {profile?.nextRecallDue && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Heart className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[12px] font-medium text-amber-700">Health Reminder</span>
            </div>
            <p className="text-[11px] text-gray-600">
              Check-up due {new Date(profile.nextRecallDue).toLocaleDateString("en-ZA", { day: "numeric", month: "long" })}.
              <Link href="/portal/appointments" className="text-gray-900 font-medium ml-1">Book now</Link>
            </p>
          </div>
        )}

        {/* Profile */}
        <Link href="/portal/profile" className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3.5 hover:border-gray-300 transition-colors">
          <User className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-[13px] font-medium text-gray-900">My Profile</p>
            <p className="text-[11px] text-gray-500">Allergies, medications, personal info</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
