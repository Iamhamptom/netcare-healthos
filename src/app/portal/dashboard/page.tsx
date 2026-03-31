"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, FileText, MessageSquare, Pill, User, Heart } from "lucide-react";

interface PatientProfile {
  name: string;
  medicalAid: string;
  lastVisit: string | null;
  nextRecallDue: string | null;
}

interface Appointment {
  id: string;
  service: string;
  scheduledAt: string;
  status: string;
  practiceName: string;
}

export default function PatientDashboardPage() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/portal/profile").then((r) => r.json()),
      fetch("/api/portal/appointments").then((r) => r.json()),
    ])
      .then(([profileData, appointmentData]) => {
        setProfile(profileData.patient);
        setAppointments((appointmentData.appointments || []).filter((a: Appointment) => new Date(a.scheduledAt) >= new Date()).slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-4">
        <div className="max-w-lg mx-auto space-y-4 pt-8">
          {[...Array(5)].map((_, i) => <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-pulse h-20" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="bg-emerald-600 px-4 py-6">
        <div className="max-w-lg mx-auto">
          <p className="text-emerald-100 text-sm">Welcome back</p>
          <h1 className="text-xl font-bold text-white">{profile?.name || "Patient"}</h1>
          {profile?.medicalAid && <p className="text-emerald-200 text-xs mt-1">{profile.medicalAid}</p>}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4 pb-8">
        {/* Upcoming Appointments */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" /> Upcoming Appointments
            </h2>
            <Link href="/portal/appointments" className="text-xs text-emerald-400 hover:text-emerald-300">View all</Link>
          </div>
          {appointments.length > 0 ? (
            <div className="space-y-2">
              {appointments.map((a) => (
                <div key={a.id} className="flex items-center justify-between bg-zinc-800/50 rounded-lg p-3">
                  <div>
                    <p className="text-sm text-white">{a.service}</p>
                    <p className="text-xs text-zinc-400">{new Date(a.scheduledAt).toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500">No upcoming appointments</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <QuickAction href="/portal/appointments" icon={<Calendar className="w-5 h-5" />} label="Book Appointment" color="bg-blue-500/10 text-blue-400" />
          <QuickAction href="/portal/results" icon={<FileText className="w-5 h-5" />} label="Lab Results" color="bg-emerald-500/10 text-emerald-400" />
          <QuickAction href="/portal/messages" icon={<MessageSquare className="w-5 h-5" />} label="Messages" color="bg-purple-500/10 text-purple-400" />
          <QuickAction href="/portal/prescriptions" icon={<Pill className="w-5 h-5" />} label="Prescriptions" color="bg-amber-500/10 text-amber-400" />
        </div>

        {/* Health Summary */}
        {profile?.nextRecallDue && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-400">Health Reminder</span>
            </div>
            <p className="text-xs text-zinc-400">
              Your next check-up is due on {new Date(profile.nextRecallDue).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}.
              <Link href="/portal/appointments" className="text-emerald-400 ml-1">Book now</Link>
            </p>
          </div>
        )}

        {/* Profile Link */}
        <Link href="/portal/profile" className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700">
          <User className="w-5 h-5 text-zinc-400" />
          <div>
            <p className="text-sm text-white">My Profile</p>
            <p className="text-xs text-zinc-500">View allergies, medications, and personal info</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

function QuickAction({ href, icon, label, color }: { href: string; icon: React.ReactNode; label: string; color: string }) {
  return (
    <Link href={href} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors text-center">
      <div className={`${color} mx-auto mb-2 w-10 h-10 rounded-xl flex items-center justify-center`}>{icon}</div>
      <p className="text-xs font-medium text-white">{label}</p>
    </Link>
  );
}
