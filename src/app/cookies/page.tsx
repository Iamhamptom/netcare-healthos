import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy — Netcare Health OS",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#1D3443] text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/"
          className="text-xs text-white/30 font-mono hover:text-white/60 transition-colors mb-8 inline-block"
        >
          &larr; Back to home
        </Link>

        <h1 className="text-2xl font-light text-white tracking-tight mb-2">
          Cookie Policy
        </h1>
        <p className="text-xs text-white/30 font-mono mb-10">
          Last updated: 2026-03-16
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-medium text-white/60 mb-3">What Are Cookies?</h2>
            <p className="text-sm text-white/35 leading-relaxed font-light">
              Cookies are small text files stored on your device when you visit a website. We use
              only essential cookies required for the platform to function.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-medium text-white/60 mb-3">Cookies We Use</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="py-2 pr-4 text-xs text-white/40 font-mono font-normal">Cookie</th>
                    <th className="py-2 pr-4 text-xs text-white/40 font-mono font-normal">Purpose</th>
                    <th className="py-2 text-xs text-white/40 font-mono font-normal">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-white/30 font-light">
                  <tr className="border-b border-white/[0.03]">
                    <td className="py-3 pr-4 font-mono text-xs">sb-*-auth-token</td>
                    <td className="py-3 pr-4 text-xs">Authentication session</td>
                    <td className="py-3 text-xs">Session / 7 days</td>
                  </tr>
                  <tr className="border-b border-white/[0.03]">
                    <td className="py-3 pr-4 font-mono text-xs">DEMO_MODE</td>
                    <td className="py-3 pr-4 text-xs">Demo environment flag</td>
                    <td className="py-3 text-xs">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-white/30 leading-relaxed font-light mt-4">
              All cookies listed above are essential. We do not use analytics or marketing cookies.
              Patient data is never stored in cookies.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-medium text-white/60 mb-3">Healthcare Data Protection</h2>
            <p className="text-sm text-white/35 leading-relaxed font-light">
              In accordance with POPIA and HPCSA guidelines, patient health information is never
              stored in cookies or client-side storage. All patient data is processed server-side
              with encryption at rest and in transit.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-medium text-white/60 mb-3">Contact</h2>
            <p className="text-sm text-white/35 leading-relaxed font-light">
              Questions: info@netcare.co.za
            </p>
          </section>
        </div>

        <div className="mt-16 border-t border-white/[0.04] pt-6">
          <p className="text-[11px] text-white/20 font-mono">
            Netcare Limited · Gauteng, South Africa
          </p>
        </div>
      </div>
    </div>
  );
}
