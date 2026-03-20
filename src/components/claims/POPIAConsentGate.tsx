"use client";

import { useState } from "react";
import { Shield } from "lucide-react";

interface POPIAConsentGateProps {
  onConsent: () => void;
  consented: boolean;
}

export default function POPIAConsentGate({
  onConsent,
  consented,
}: POPIAConsentGateProps) {
  const [checked, setChecked] = useState(false);

  if (consented) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-[#3DA9D1]/30 bg-[#1D3443] p-6 shadow-lg">
        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3DA9D1]/15">
            <Shield className="h-5 w-5 text-[#3DA9D1]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              POPIA Compliance — Data Processing Consent
            </h3>
            <p className="text-xs text-gray-400">
              Required before claims data can be uploaded
            </p>
          </div>
        </div>

        {/* Data Handling Notice */}
        <div className="mb-4 rounded-lg bg-[#162633] p-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#3DA9D1]">
            Data Handling
          </h4>
          <ul className="space-y-1.5 text-xs leading-relaxed text-gray-300">
            <li>
              Data is processed server-side only. Patient names are anonymized
              before storage.
            </li>
            <li>
              Raw CSV data is not retained after analysis.
            </li>
            <li>
              AI suggestions use diagnosis codes only — no patient names are sent
              to external services.
            </li>
          </ul>
        </div>

        {/* Retention Notice */}
        <div className="mb-5 rounded-lg bg-[#162633] p-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#3DA9D1]">
            Data Retention
          </h4>
          <p className="text-xs leading-relaxed text-gray-300">
            Analysis results are stored for 12 months for trend tracking, then
            automatically deleted.
          </p>
        </div>

        {/* Consent Checkbox */}
        <label className="mb-5 flex cursor-pointer items-start gap-3 rounded-lg border border-[#3DA9D1]/20 bg-[#162633] p-4 transition-colors hover:border-[#3DA9D1]/40">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#3DA9D1]"
          />
          <span className="text-xs leading-relaxed text-gray-300">
            I confirm this claims data is being processed with appropriate
            authorization under POPIA Section 15 (processing necessary for a
            legitimate interest) and that patient consent for medical aid claims
            processing has been obtained.
          </span>
        </label>

        {/* Consent Button */}
        <button
          onClick={onConsent}
          disabled={!checked}
          className="w-full rounded-lg bg-[#3DA9D1] px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#3DA9D1]/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          I understand and consent
        </button>
      </div>
    </div>
  );
}
