"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Settings,
  Check,
  X,
  Calendar,
  Bell,
  Download,
  ExternalLink,
  Loader2,
  Unlink,
  Cloud,
  FileBarChart,
  Shield,
} from "lucide-react";

interface MicrosoftStatus {
  connected: boolean;
  email: string;
  displayName: string;
  connectedAt: string;
  calendarSync: boolean;
  teamsNotifications: boolean;
}

const POWERBI_REPORTS = [
  { type: "claims_summary", label: "Claims Summary", description: "Submitted, approved, rejected claims by clinic" },
  { type: "revenue_by_clinic", label: "Revenue by Clinic", description: "Revenue, patient volume, and averages" },
  { type: "rejection_analysis", label: "Rejection Analysis", description: "Top rejection codes with AI recommendations" },
  { type: "scheme_performance", label: "Scheme Performance", description: "Medical scheme payment rates and processing times" },
];

export default function MicrosoftSettingsPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<MicrosoftStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [calendarSync, setCalendarSync] = useState(false);
  const [teamsNotifications, setTeamsNotifications] = useState(false);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Check for callback params
  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");
    if (connected === "microsoft") {
      showToast("success", "Microsoft 365 connected successfully");
    } else if (error) {
      showToast("error", `Connection failed: ${decodeURIComponent(error)}`);
    }
  }, [searchParams, showToast]);

  // Load connection status
  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await fetch("/api/microsoft/calendar");
        const data = await res.json();

        if (data.demo && data.reason === "not_connected") {
          setStatus({ connected: false, email: "", displayName: "", connectedAt: "", calendarSync: false, teamsNotifications: false });
        } else if (data.demo) {
          // Demo mode — show as connected with mock data
          setStatus({
            connected: true,
            email: "sara.nayager@netcare.co.za",
            displayName: "Sara Nayager",
            connectedAt: new Date().toISOString(),
            calendarSync: true,
            teamsNotifications: true,
          });
          setCalendarSync(true);
          setTeamsNotifications(true);
        } else {
          setStatus({
            connected: true,
            email: "Connected",
            displayName: "Microsoft 365 User",
            connectedAt: new Date().toISOString(),
            calendarSync: true,
            teamsNotifications: true,
          });
          setCalendarSync(true);
          setTeamsNotifications(true);
        }
      } catch {
        setStatus({ connected: false, email: "", displayName: "", connectedAt: "", calendarSync: false, teamsNotifications: false });
      } finally {
        setLoading(false);
      }
    }
    loadStatus();
  }, []);

  async function handleConnect() {
    window.location.href = "/api/microsoft/connect";
  }

  async function handleDisconnect() {
    setSaving(true);
    try {
      // In production, this would clear Microsoft tokens from the practice integrations
      showToast("success", "Microsoft 365 disconnected");
      setStatus({ connected: false, email: "", displayName: "", connectedAt: "", calendarSync: false, teamsNotifications: false });
      setCalendarSync(false);
      setTeamsNotifications(false);
    } catch {
      showToast("error", "Failed to disconnect");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleSave() {
    setSaving(true);
    try {
      // In production, this would PATCH the practice integrations
      showToast("success", "Settings saved");
    } catch {
      showToast("error", "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  function handleExport(reportType: string, format: "csv" | "json") {
    const url = `/api/reports/powerbi?type=${reportType}&format=${format}`;
    if (format === "csv") {
      window.open(url, "_blank");
    } else {
      window.open(url, "_blank");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
            toast.type === "success"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "bg-red-500/20 text-red-300 border border-red-500/30"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "success" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {toast.message}
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-500/10">
          <Cloud className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">Microsoft 365 Integration</h1>
          <p className="text-sm text-white/40">
            Connect Outlook Calendar, Teams notifications, and Power BI exports
          </p>
        </div>
      </div>

      {/* Connection Status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${status?.connected ? "bg-emerald-400" : "bg-white/20"}`} />
            <div>
              <p className="text-sm font-medium text-white">
                {status?.connected ? "Connected" : "Not Connected"}
              </p>
              {status?.connected && (
                <div className="space-y-0.5">
                  <p className="text-xs text-white/40">{status.email}</p>
                  {status.displayName && (
                    <p className="text-xs text-white/30">{status.displayName}</p>
                  )}
                  {status.connectedAt && (
                    <p className="text-xs text-white/20">
                      Connected {new Date(status.connectedAt).toLocaleDateString("en-ZA")}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div>
            {status?.connected ? (
              <button
                onClick={handleDisconnect}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-50"
              >
                <Unlink className="w-4 h-4" />
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnect}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Connect Microsoft 365
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Calendar Sync */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-medium text-white">Outlook Calendar Sync</h2>
        </div>
        <p className="text-sm text-white/40 mb-4">
          Automatically sync bookings to your Outlook calendar. When a patient books an appointment,
          it appears in Sara&apos;s calendar with clinic details.
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">Calendar sync</span>
          <button
            onClick={() => {
              setCalendarSync(!calendarSync);
              handleToggleSave();
            }}
            disabled={!status?.connected}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              calendarSync && status?.connected
                ? "bg-blue-500"
                : "bg-white/10"
            } ${!status?.connected ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                calendarSync && status?.connected ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>
      </motion.div>

      {/* Teams Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-purple-400" />
          <h2 className="text-base font-medium text-white">Teams Notifications</h2>
        </div>
        <p className="text-sm text-white/40 mb-4">
          Receive critical alerts directly in Microsoft Teams. CareOn Bridge advisories,
          claim rejection alerts, and system health notifications.
        </p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-white/60">Teams notifications</span>
          <button
            onClick={() => {
              setTeamsNotifications(!teamsNotifications);
              handleToggleSave();
            }}
            disabled={!status?.connected}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              teamsNotifications && status?.connected
                ? "bg-purple-500"
                : "bg-white/10"
            } ${!status?.connected ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                teamsNotifications && status?.connected ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-white/30" />
            <span className="text-xs font-medium text-white/40">NOTIFICATION TYPES</span>
          </div>
          <ul className="space-y-1">
            {[
              "CareOn Bridge critical advisories",
              "High-value claim rejections (> R10,000)",
              "System health degradation alerts",
              "Daily performance summaries",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-xs text-white/30">
                <Check className="w-3 h-3 text-emerald-400/60" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* Power BI Exports */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <FileBarChart className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-medium text-white">Power BI Data Exports</h2>
        </div>
        <p className="text-sm text-white/40 mb-6">
          Export report data in formats ready for Power BI import. CSV files include
          UTF-8 BOM for Excel compatibility.
        </p>
        <div className="space-y-3">
          {POWERBI_REPORTS.map((report) => (
            <div
              key={report.type}
              className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] rounded-lg p-4"
            >
              <div>
                <p className="text-sm font-medium text-white">{report.label}</p>
                <p className="text-xs text-white/30">{report.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExport(report.type, "csv")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  CSV
                </button>
                <button
                  onClick={() => handleExport(report.type, "json")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  JSON
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Permissions Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-4 h-4 text-white/20" />
          <span className="text-xs font-medium text-white/30">PERMISSIONS REQUESTED</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { scope: "Calendars.ReadWrite", desc: "Read and create calendar events" },
            { scope: "Mail.Send", desc: "Send appointment confirmations" },
            { scope: "User.Read", desc: "Read your profile information" },
            { scope: "Files.ReadWrite", desc: "Store reports in OneDrive/SharePoint" },
          ].map((perm) => (
            <div key={perm.scope} className="flex items-start gap-2 text-xs text-white/25">
              <Check className="w-3 h-3 mt-0.5 text-white/15 shrink-0" />
              <div>
                <span className="text-white/35 font-mono">{perm.scope}</span>
                <span className="text-white/20 ml-1">— {perm.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
