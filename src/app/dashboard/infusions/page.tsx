"use client";

import { useState } from "react";
import { Clock, Calendar, Users, Pill, MapPin, AlertTriangle, CheckCircle } from "lucide-react";

/* ── RheumCare Infusion Scheduling ── */

interface InfusionSlot {
  id: string;
  patientName: string;
  drug: string;
  location: string;
  date: string;
  startTime: string;
  duration: string; // hours
  chairNumber: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  preCheckComplete: boolean;
  notes?: string;
}

const LOCATIONS = [
  { name: "Wits Donald Gordon", city: "Parktown", chairs: 4 },
  { name: "Netcare Sunward Park", city: "Boksburg", chairs: 3 },
  { name: "Life Groenkloof", city: "Pretoria", chairs: 2 },
  { name: "Mediclinic Highveld", city: "Trichardt", chairs: 2 },
  { name: "Linamandla Medical", city: "Eswatini", chairs: 1 },
];

const MOCK_INFUSIONS: InfusionSlot[] = [
  { id: "INF-001", patientName: "Mrs N. Mokoena", drug: "Rituximab 1000mg", location: "Wits Donald Gordon", date: "2026-03-24", startTime: "08:00", duration: "5h", chairNumber: 1, status: "scheduled", preCheckComplete: true },
  { id: "INF-002", patientName: "Mr S. Naidoo", drug: "Tocilizumab 480mg", location: "Wits Donald Gordon", date: "2026-03-24", startTime: "09:00", duration: "1.5h", chairNumber: 2, status: "scheduled", preCheckComplete: true },
  { id: "INF-003", patientName: "Ms L. Sibanda", drug: "Infliximab 300mg", location: "Netcare Sunward Park", date: "2026-03-24", startTime: "08:30", duration: "3h", chairNumber: 1, status: "in_progress", preCheckComplete: true, notes: "Second loading dose — week 2" },
  { id: "INF-004", patientName: "Mrs P. Zwane", drug: "Rituximab 1000mg", location: "Life Groenkloof", date: "2026-03-25", startTime: "08:00", duration: "5h", chairNumber: 1, status: "scheduled", preCheckComplete: false, notes: "FBC results pending" },
  { id: "INF-005", patientName: "Mr T. Dlamini", drug: "Tocilizumab 640mg", location: "Mediclinic Highveld", date: "2026-03-26", startTime: "10:00", duration: "1.5h", chairNumber: 1, status: "scheduled", preCheckComplete: true },
  { id: "INF-006", patientName: "Mrs J. Mazibuko", drug: "Zoledronic Acid 5mg", location: "Wits Donald Gordon", date: "2026-03-24", startTime: "11:00", duration: "0.5h", chairNumber: 3, status: "completed", preCheckComplete: true, notes: "Aclasta — annual osteoporosis infusion" },
];

const statusStyles: Record<string, { bg: string; text: string; icon: any }> = {
  scheduled: { bg: "bg-blue-100", text: "text-blue-700", icon: Calendar },
  in_progress: { bg: "bg-amber-100", text: "text-amber-700", icon: Clock },
  completed: { bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle },
  cancelled: { bg: "bg-red-100", text: "text-red-700", icon: AlertTriangle },
};

export default function InfusionsPage() {
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedDate, setSelectedDate] = useState("2026-03-24");

  const filtered = MOCK_INFUSIONS.filter(inf => {
    if (selectedLocation !== "all" && inf.location !== selectedLocation) return false;
    if (inf.date !== selectedDate) return false;
    return true;
  });

  const todayInfusions = MOCK_INFUSIONS.filter(i => i.date === selectedDate);
  const activeChairs = new Set(todayInfusions.filter(i => i.status === "in_progress").map(i => `${i.location}-${i.chairNumber}`)).size;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1D3443] flex items-center gap-2">
            <Clock className="w-6 h-6 text-teal-600" />
            Infusion Scheduling
          </h1>
          <p className="text-sm text-[#1D3443]/60 mt-1">
            Manage biologic and bisphosphonate infusions across all locations
          </p>
        </div>
        <button className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors">
          + Schedule Infusion
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {LOCATIONS.map(loc => {
          const locInfusions = MOCK_INFUSIONS.filter(i => i.location === loc.name && i.date === selectedDate);
          const inUse = locInfusions.filter(i => i.status === "in_progress" || i.status === "scheduled").length;
          return (
            <button
              key={loc.name}
              onClick={() => setSelectedLocation(selectedLocation === loc.name ? "all" : loc.name)}
              className={`p-3 rounded-xl border transition-all text-left ${selectedLocation === loc.name ? "border-teal-500 bg-teal-50 ring-1 ring-teal-500/20" : "border-[#1D3443]/10 bg-white hover:border-teal-300"}`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-xs font-medium text-[#1D3443]/70 truncate">{loc.city}</span>
              </div>
              <div className="text-lg font-bold text-[#1D3443]">{inUse}/{loc.chairs}</div>
              <div className="text-[10px] text-[#1D3443]/50">chairs booked</div>
            </button>
          );
        })}
      </div>

      {/* Date Selector */}
      <div className="flex items-center gap-3">
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="rounded-lg border border-[#1D3443]/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
        />
        <span className="text-sm text-[#1D3443]/60">
          {filtered.length} infusion{filtered.length !== 1 ? "s" : ""} {selectedLocation !== "all" ? `at ${selectedLocation}` : "across all locations"}
        </span>
      </div>

      {/* Infusion Timeline */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#1D3443]/10 p-8 text-center">
            <Calendar className="w-10 h-10 text-[#1D3443]/20 mx-auto mb-2" />
            <p className="text-sm text-[#1D3443]/40">No infusions scheduled for this date/location</p>
          </div>
        ) : (
          filtered.map(inf => {
            const st = statusStyles[inf.status];
            const StIcon = st.icon;
            return (
              <div key={inf.id} className="bg-white rounded-xl border border-[#1D3443]/10 p-4 flex items-center gap-4 hover:border-teal-300 transition-colors">
                {/* Time Block */}
                <div className="text-center min-w-[70px]">
                  <div className="text-lg font-bold text-[#1D3443]">{inf.startTime}</div>
                  <div className="text-[10px] text-[#1D3443]/50">{inf.duration}</div>
                </div>

                <div className="w-px h-12 bg-[#1D3443]/10" />

                {/* Patient & Drug */}
                <div className="flex-1">
                  <div className="font-medium text-[#1D3443]">{inf.patientName}</div>
                  <div className="text-sm text-[#1D3443]/60 flex items-center gap-2">
                    <Pill className="w-3.5 h-3.5" />
                    {inf.drug}
                  </div>
                  {inf.notes && <div className="text-xs text-[#1D3443]/40 mt-0.5 italic">{inf.notes}</div>}
                </div>

                {/* Location */}
                <div className="text-right text-xs text-[#1D3443]/50">
                  <div className="flex items-center gap-1 justify-end">
                    <MapPin className="w-3 h-3" />
                    {inf.location}
                  </div>
                  <div className="mt-0.5">Chair {inf.chairNumber}</div>
                </div>

                {/* Pre-check */}
                <div className="min-w-[80px] text-center">
                  {inf.preCheckComplete ? (
                    <span className="text-xs text-emerald-600 flex items-center gap-1 justify-center">
                      <CheckCircle className="w-3.5 h-3.5" /> Pre-check
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 flex items-center gap-1 justify-center">
                      <AlertTriangle className="w-3.5 h-3.5" /> Pending
                    </span>
                  )}
                </div>

                {/* Status */}
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${st.bg} ${st.text}`}>
                  <StIcon className="w-3.5 h-3.5" />
                  {inf.status.replace("_", " ")}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
