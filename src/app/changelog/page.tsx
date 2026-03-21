"use client";

import { motion } from "framer-motion";
import { Tag, Calendar } from "lucide-react";

const RELEASES = [
  { version: "v55", date: "2026-03-21", title: "100% Standards Compliance", highlights: ["MFA (TOTP + backup codes)", "Error tracking system", "Cookie consent banner", "Sitemap + robots.txt", "Branded 404 page", "Health check endpoint", "6 loading skeletons", "128 tests all passing"] },
  { version: "v54", date: "2026-03-21", title: "WCAG + POPIA + OWASP + ISO 27001 + HNSF", highlights: ["WCAG 2.1 AA: contrast fixes across 60+ files, aria-labels, skip nav, focus indicators", "POPIA: Information Officer designated, ROPA document, cross-border assessment", "OWASP: account lockout, password complexity, SSRF protection", "ISO 27001: 5 formal policy documents", "SA HNSF: FHIR CapabilityStatement, SMART on FHIR, 52 LOINC codes"] },
  { version: "v53", date: "2026-03-21", title: "World-Class Polish", highlights: ["Team Management page light-theme rewrite", "Network tables iPad-ready (overflow-x-auto)", "Styled confirmation modals (replaced browser confirm())", "Console.error removed from client pages", "Loading states on 5 dashboard pages", "Error handling on all form submissions"] },
  { version: "v52", date: "2026-03-21", title: "12 Bug Fixes", highlights: ["Microsoft routes: Prisma→db layer", "Suspense boundary on settings page", "Power BI infinite recursion fixed", "Resend from-address corrected", "Password reset tokens Supabase-backed", "PostgREST filter fix", "npm 0 vulnerabilities"] },
  { version: "v51", date: "2026-03-20", title: "Microsoft 365 + Demo Fixes", highlights: ["Outlook Calendar sync", "Teams notifications (Adaptive Cards)", "Power BI export (CSV + JSON)", "FHIR Explorer stub routes", "Switching page fixed values", "Claims POPIA consent gate"] },
  { version: "v50", date: "2026-03-20", title: "API Docs + Legal Templates", highlights: ["OpenAPI 3.1 spec (68 paths, 105 operations)", "Swagger UI at /api-docs/", "Mutual NDA template", "POPIA Operator Agreement template", "Penetration test self-assessment"] },
  { version: "v49", date: "2026-03-20", title: "Final Verification Fixes", highlights: ["Forgot password + reset password pages", "Health OS OS typo fixed (23 files)", "Forgot password link on login page"] },
  { version: "v48", date: "2026-03-20", title: "Privilege Escalation Fix", highlights: ["Role validation on PATCH endpoints", "Prevents admin→platform_admin escalation"] },
  { version: "v47", date: "2026-03-20", title: "Admin Layer", highlights: ["Team management (CRUD + role assignment)", "Reports hub (6 types, scheduled delivery)", "Performance dashboard (per-product KPIs)", "Notification center (bell + full page)", "Password reset flow", "7 audit package documents"] },
  { version: "v46", date: "2026-03-20", title: "Enterprise Security Audit", highlights: ["0 npm vulnerabilities", "128 tests passing", "AES-256-GCM encryption", "Structured logger", "Pagination on 6 API routes", "proxy.ts migration (Next.js 16)"] },
  { version: "v45", date: "2026-03-20", title: "Market-Readiness Fixes", highlights: ["8 Healthbridge sub-pages built", "6 security headers (including CSP)", "Mobile sidebar with hamburger menu", "POPIA consent enforcement", "SEO metadata on public pages"] },
  { version: "v44", date: "2026-03-20", title: "Integration Build", highlights: ["Claims Switching Engine (43 files, 6,570 lines)", "Claims Rejection Analyzer (26 files, 10K lines)", "CareOn Bridge (11 files, 2,823 lines)", "7 integration adapters", "FHIR Integration Hub", "WhatsApp Router"] },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1D3443] to-[#0f1f2a] text-white p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">Changelog</h1>
          <p className="text-white/60 text-[14px] mb-10">Release history for Netcare Health OS</p>
        </motion.div>
        <div className="space-y-8">
          {RELEASES.map((r, i) => (
            <motion.div key={r.version} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="border-l-2 border-[#3DA9D1]/30 pl-6 relative">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#3DA9D1] border-2 border-[#1D3443]" />
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[12px] font-mono font-bold text-[#3DA9D1] bg-[#3DA9D1]/10 px-2 py-0.5 rounded flex items-center gap-1">
                  <Tag className="w-3 h-3" />{r.version}
                </span>
                <span className="text-[12px] text-white/40 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />{r.date}
                </span>
              </div>
              <h3 className="text-[16px] font-semibold text-white mb-2">{r.title}</h3>
              <ul className="space-y-1">
                {r.highlights.map((h, j) => (
                  <li key={j} className="text-[13px] text-white/60 flex items-start gap-2">
                    <span className="text-[#3DA9D1] mt-1">•</span>{h}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        <div className="mt-12 pt-6 border-t border-white/10 text-center text-[11px] text-white/30">
          Visio Research Labs &middot; VisioHealth OS &middot; Built with precision
        </div>
      </div>
    </div>
  );
}
