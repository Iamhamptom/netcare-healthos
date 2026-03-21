"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Key, Copy, Check, AlertTriangle, Loader2, ShieldCheck, ShieldOff } from "lucide-react";

export default function SecuritySettingsPage() {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [copied, setCopied] = useState(false);
  const [disableToken, setDisableToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function enableMFA() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/mfa/setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to enable MFA");
      setQrUrl(data.qrUrl);
      setBackupCodes(data.backupCodes);
      setMfaEnabled(true);
      setSuccess("MFA enabled successfully. Save your backup codes now.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enable MFA");
    } finally {
      setLoading(false);
    }
  }

  async function disableMFA() {
    if (!disableToken || disableToken.length !== 6) {
      setError("Enter your current 6-digit TOTP code to disable MFA");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/mfa/setup", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: disableToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to disable MFA");
      setMfaEnabled(false);
      setQrUrl(null);
      setBackupCodes(null);
      setDisableToken("");
      setSuccess("MFA disabled successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disable MFA");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl text-[#FDFCF0] uppercase tracking-wider flex items-center gap-3">
          <Shield className="w-6 h-6 text-[#D4AF37]" />
          Security Settings
        </h1>
        <p className="text-[#FDFCF0]/40 text-sm mt-2">Manage your account security and two-factor authentication.</p>
      </div>

      {/* Status messages */}
      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-300 text-sm">{error}</p>
        </motion.div>
      )}
      {success && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-3">
          <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-emerald-300 text-sm">{success}</p>
        </motion.div>
      )}

      {/* MFA Section */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0A0A0A] border border-[#D4AF37]/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="font-serif text-lg text-[#FDFCF0] uppercase tracking-wider">Two-Factor Authentication</h2>
          </div>
          <div className={`flex items-center gap-2 text-xs uppercase tracking-wider ${mfaEnabled ? "text-emerald-400" : "text-[#FDFCF0]/30"}`}>
            {mfaEnabled ? <ShieldCheck className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
            {mfaEnabled ? "Enabled" : "Disabled"}
          </div>
        </div>

        <p className="text-[#FDFCF0]/50 text-sm mb-6">
          Add an extra layer of security to your account. When enabled, you will need to enter a code from your authenticator app each time you log in.
        </p>

        {!mfaEnabled ? (
          <button
            onClick={enableMFA}
            disabled={loading}
            className="px-6 py-3 bg-[#D4AF37] text-[#050505] uppercase tracking-[0.2em] text-xs font-bold hover:bg-[#FDFCF0] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            Enable Two-Factor Authentication
          </button>
        ) : (
          <div className="space-y-6">
            {/* QR URL Display */}
            {qrUrl && (
              <div className="space-y-4">
                <h3 className="text-[#FDFCF0]/70 text-sm font-medium uppercase tracking-wider">Setup Instructions</h3>
                <div className="p-4 bg-[#050505] border border-[#D4AF37]/10 rounded-lg">
                  <p className="text-[#FDFCF0]/50 text-xs mb-3">
                    Copy this URL and add it to your authenticator app (Google Authenticator, Authy, 1Password, etc.):
                  </p>
                  <div className="flex items-start gap-2">
                    <code className="flex-1 text-[#D4AF37] text-xs break-all font-mono bg-[#0A0A0A] p-3 rounded border border-[#D4AF37]/10">
                      {qrUrl}
                    </code>
                    <button
                      onClick={() => copyToClipboard(qrUrl)}
                      className="shrink-0 p-2 text-[#FDFCF0]/40 hover:text-[#D4AF37] transition-colors"
                      title="Copy URL"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Backup Codes */}
            {backupCodes && (
              <div className="space-y-4">
                <h3 className="text-[#FDFCF0]/70 text-sm font-medium uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Backup Codes — Save These Now
                </h3>
                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                  <p className="text-amber-300/70 text-xs mb-4">
                    These codes can be used to access your account if you lose your authenticator app. Each code can only be used once. Store them securely.
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {backupCodes.map((code, i) => (
                      <code key={i} className="text-center text-[#FDFCF0] text-sm font-mono bg-[#050505] p-2 rounded border border-[#D4AF37]/10">
                        {code}
                      </code>
                    ))}
                  </div>
                  <button
                    onClick={() => copyToClipboard(backupCodes.join("\n"))}
                    className="w-full px-4 py-2 bg-[#D4AF37]/10 text-[#D4AF37] text-xs uppercase tracking-wider hover:bg-[#D4AF37]/20 transition-colors rounded flex items-center justify-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy All Backup Codes
                  </button>
                </div>
              </div>
            )}

            {/* Disable MFA */}
            <div className="pt-4 border-t border-[#FDFCF0]/5">
              <h3 className="text-[#FDFCF0]/70 text-sm font-medium uppercase tracking-wider mb-3">Disable MFA</h3>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="text-[#FDFCF0]/30 text-xs mb-1 block">Current TOTP Code</label>
                  <input
                    type="text"
                    value={disableToken}
                    onChange={(e) => setDisableToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-2.5 bg-[#050505] border border-[#FDFCF0]/10 rounded text-[#FDFCF0] text-sm font-mono tracking-[0.3em] text-center focus:outline-none focus:border-[#D4AF37]/50"
                  />
                </div>
                <button
                  onClick={disableMFA}
                  disabled={loading || disableToken.length !== 6}
                  className="px-4 py-2.5 bg-red-500/10 text-red-400 text-xs uppercase tracking-wider hover:bg-red-500/20 transition-colors disabled:opacity-30 rounded flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldOff className="w-3.5 h-3.5" />}
                  Disable
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Session Info */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#0A0A0A] border border-[#D4AF37]/10 rounded-xl p-6">
        <h2 className="font-serif text-lg text-[#FDFCF0] uppercase tracking-wider mb-4">Security Overview</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-[#FDFCF0]/50">
            <span>Session duration</span>
            <span className="text-[#FDFCF0]/70">7 days</span>
          </div>
          <div className="flex justify-between text-[#FDFCF0]/50">
            <span>Account lockout</span>
            <span className="text-[#FDFCF0]/70">5 failed attempts / 15 min</span>
          </div>
          <div className="flex justify-between text-[#FDFCF0]/50">
            <span>Password policy</span>
            <span className="text-[#FDFCF0]/70">Minimum 6 characters</span>
          </div>
          <div className="flex justify-between text-[#FDFCF0]/50">
            <span>Two-factor auth</span>
            <span className={mfaEnabled ? "text-emerald-400" : "text-amber-400"}>
              {mfaEnabled ? "Active" : "Not configured"}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
