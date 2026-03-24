"use client";

import { useState } from "react";
import { Target, MapPin, Phone, Mail, Search, Filter, Users, Building2, Star, Send } from "lucide-react";

/* ── GP Lead Database for Referral Network ── */

interface GPLead {
  id: string;
  name: string;
  practice: string;
  speciality: string;
  location: string;
  city: string;
  province: string;
  phone: string;
  email: string;
  nearestRheumCareLocation: string;
  distanceKm: number;
  referralPotential: "high" | "medium" | "low";
  contacted: boolean;
  lastOutreach?: string;
  notes?: string;
}

const MOCK_LEADS: GPLead[] = [
  // Boksburg area (near Netcare Sunward Park)
  { id: "GP001", name: "Dr A. Moyo", practice: "Moyo Family Practice", speciality: "General Practice", location: "Boksburg North", city: "Boksburg", province: "Gauteng", phone: "+27 11 892 XXXX", email: "dr.moyo@medpages.co.za", nearestRheumCareLocation: "Netcare Sunward Park", distanceKm: 3.2, referralPotential: "high", contacted: false },
  { id: "GP002", name: "Dr S. Patel", practice: "Sunward Medical Centre", speciality: "General Practice", location: "Sunward Park", city: "Boksburg", province: "Gauteng", phone: "+27 11 823 XXXX", email: "dr.patel@sunwardmed.co.za", nearestRheumCareLocation: "Netcare Sunward Park", distanceKm: 1.5, referralPotential: "high", contacted: true, lastOutreach: "2026-03-10" },
  { id: "GP003", name: "Dr R. Nkosi", practice: "Benoni Medical Hub", speciality: "General Practice", location: "Benoni", city: "Benoni", province: "Gauteng", phone: "+27 11 845 XXXX", email: "rnkosi@gmail.com", nearestRheumCareLocation: "Netcare Sunward Park", distanceKm: 8.5, referralPotential: "medium", contacted: false },
  // Parktown area (near Donald Gordon)
  { id: "GP004", name: "Dr M. Ndlovu", practice: "Hillbrow Community Health", speciality: "General Practice", location: "Hillbrow", city: "Johannesburg", province: "Gauteng", phone: "+27 11 720 XXXX", email: "m.ndlovu@healthnet.co.za", nearestRheumCareLocation: "Wits Donald Gordon", distanceKm: 2.1, referralPotential: "high", contacted: false },
  { id: "GP005", name: "Dr L. van Wyk", practice: "Rosebank Medical Rooms", speciality: "General Practice", location: "Rosebank", city: "Johannesburg", province: "Gauteng", phone: "+27 11 447 XXXX", email: "dr.vanwyk@rosebank.co.za", nearestRheumCareLocation: "Wits Donald Gordon", distanceKm: 4.8, referralPotential: "medium", contacted: true, lastOutreach: "2026-03-05" },
  // Pretoria area (near Life Groenkloof)
  { id: "GP006", name: "Dr T. Mahlangu", practice: "Groenkloof Medical Practice", speciality: "General Practice", location: "Groenkloof", city: "Pretoria", province: "Gauteng", phone: "+27 12 346 XXXX", email: "tmahlangu@medpages.co.za", nearestRheumCareLocation: "Life Groenkloof", distanceKm: 0.8, referralPotential: "high", contacted: false },
  { id: "GP007", name: "Dr J. Botha", practice: "Brooklyn Medical Centre", speciality: "General Practice", location: "Brooklyn", city: "Pretoria", province: "Gauteng", phone: "+27 12 362 XXXX", email: "j.botha@brooklynmed.co.za", nearestRheumCareLocation: "Life Groenkloof", distanceKm: 3.2, referralPotential: "medium", contacted: false },
  { id: "GP008", name: "Dr F. Molefe", practice: "Lynnwood Family Practice", speciality: "General Practice", location: "Lynnwood", city: "Pretoria", province: "Gauteng", phone: "+27 12 348 XXXX", email: "f.molefe@lynnwoodfp.co.za", nearestRheumCareLocation: "Life Groenkloof", distanceKm: 5.1, referralPotential: "medium", contacted: false },
  // Mpumalanga area (near Mediclinic Highveld)
  { id: "GP009", name: "Dr K. Shabangu", practice: "Secunda General Practice", speciality: "General Practice", location: "Secunda", city: "Secunda", province: "Mpumalanga", phone: "+27 17 631 XXXX", email: "k.shabangu@secundamed.co.za", nearestRheumCareLocation: "Mediclinic Highveld", distanceKm: 12, referralPotential: "high", contacted: false, notes: "Only GP in area — high autoimmune patient volume" },
  { id: "GP010", name: "Dr N. Dube", practice: "Trichardt Health Centre", speciality: "General Practice", location: "Trichardt", city: "Trichardt", province: "Mpumalanga", phone: "+27 17 633 XXXX", email: "n.dube@trichardthc.co.za", nearestRheumCareLocation: "Mediclinic Highveld", distanceKm: 2.5, referralPotential: "high", contacted: false },
];

const potentialColors = {
  high: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-gray-100 text-gray-600",
};

export default function ReferralLeadsPage() {
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [showContacted, setShowContacted] = useState(true);

  const filtered = MOCK_LEADS.filter(gp => {
    if (search && !gp.name.toLowerCase().includes(search.toLowerCase()) && !gp.practice.toLowerCase().includes(search.toLowerCase()) && !gp.city.toLowerCase().includes(search.toLowerCase())) return false;
    if (locationFilter !== "all" && gp.nearestRheumCareLocation !== locationFilter) return false;
    if (!showContacted && gp.contacted) return false;
    return true;
  });

  const locations = [...new Set(MOCK_LEADS.map(l => l.nearestRheumCareLocation))];
  const highPotential = MOCK_LEADS.filter(l => l.referralPotential === "high" && !l.contacted).length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1D3443] flex items-center gap-2">
            <Target className="w-6 h-6 text-teal-600" />
            GP Referral Lead Database
          </h1>
          <p className="text-sm text-[#1D3443]/60 mt-1">
            {MOCK_LEADS.length} GPs identified near your 5 locations — {highPotential} high-potential uncontacted
          </p>
        </div>
        <button className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2">
          <Send className="w-4 h-4" /> Bulk Outreach
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1D3443]/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, practice, or city..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#1D3443]/10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          />
        </div>
        <select
          value={locationFilter}
          onChange={e => setLocationFilter(e.target.value)}
          className="rounded-lg border border-[#1D3443]/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
        >
          <option value="all">All Locations</option>
          {locations.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-[#1D3443]/60">
          <input type="checkbox" checked={showContacted} onChange={e => setShowContacted(e.target.checked)} className="accent-teal-600" />
          Show contacted
        </label>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {locations.map(loc => {
          const count = MOCK_LEADS.filter(l => l.nearestRheumCareLocation === loc).length;
          const uncontacted = MOCK_LEADS.filter(l => l.nearestRheumCareLocation === loc && !l.contacted).length;
          return (
            <div key={loc} className="bg-white rounded-xl border border-[#1D3443]/10 p-3">
              <div className="text-xs text-[#1D3443]/50 flex items-center gap-1"><MapPin className="w-3 h-3" />{loc.split(" ").slice(-1)[0]}</div>
              <div className="text-xl font-bold text-[#1D3443]">{count}</div>
              <div className="text-[10px] text-[#1D3443]/40">{uncontacted} uncontacted</div>
            </div>
          );
        })}
      </div>

      {/* Lead Table */}
      <div className="bg-white rounded-xl border border-[#1D3443]/10 overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#1D3443]/[0.03]">
            <tr className="text-left text-xs text-[#1D3443]/50 uppercase tracking-wider">
              <th className="px-4 py-3">Doctor</th>
              <th className="px-4 py-3">Practice</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Nearest Site</th>
              <th className="px-4 py-3">Distance</th>
              <th className="px-4 py-3">Potential</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1D3443]/5">
            {filtered.map(gp => (
              <tr key={gp.id} className="hover:bg-[#1D3443]/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-[#1D3443]">{gp.name}</div>
                </td>
                <td className="px-4 py-3 text-sm text-[#1D3443]/70">{gp.practice}</td>
                <td className="px-4 py-3 text-sm text-[#1D3443]/60">{gp.city}, {gp.province}</td>
                <td className="px-4 py-3 text-xs text-[#1D3443]/50">{gp.nearestRheumCareLocation}</td>
                <td className="px-4 py-3 text-sm font-mono text-[#1D3443]/60">{gp.distanceKm}km</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${potentialColors[gp.referralPotential]}`}>
                    {gp.referralPotential}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-[#1D3443]/50">
                  {gp.contacted ? (
                    <span className="text-emerald-600">Contacted {gp.lastOutreach}</span>
                  ) : (
                    <span className="text-[#1D3443]/30">Not contacted</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-teal-50 text-[#1D3443]/40 hover:text-teal-600 transition-colors" title="Email">
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-teal-50 text-[#1D3443]/40 hover:text-teal-600 transition-colors" title="Call">
                      <Phone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
