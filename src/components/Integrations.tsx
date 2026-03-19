"use client";

import { motion } from "framer-motion";

// ── Real SVG logos ──

const LogoWhatsApp = () => (
  <svg viewBox="0 0 24 24" fill="#25D366" className="w-7 h-7">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const LogoGmail = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7">
    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" fill="#EA4335" />
  </svg>
);

const LogoGoogleCal = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7">
    <path d="M18.316 5.684H24v12.632h-5.684V5.684zM5.684 24h12.632v-5.684H5.684V24zM18.316 5.684V0H5.684v5.684h12.632z" fill="#4285F4" />
    <path d="M5.684 18.316H0V5.684h5.684v12.632z" fill="#34A853" />
    <path d="M18.316 5.684H24V0h-5.684v5.684zM0 18.316h5.684V24H0v-5.684z" fill="#FBBC04" />
    <path d="M0 5.684h5.684V0H0v5.684z" fill="#EA4335" />
    <path d="M9.2 15.626l-1.136-1.136 3.5-3.49V7.6h1.6v4l-3.964 4.026z" fill="#4285F4" />
  </svg>
);

const LogoGoogleMaps = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7">
    <path d="M12 0C7.31 0 3.5 3.81 3.5 8.5c0 7.14 7.36 14.49 8.05 15.18a.64.64 0 00.9 0c.69-.69 8.05-8.04 8.05-15.18C20.5 3.81 16.69 0 12 0z" fill="#EA4335" />
    <circle cx="12" cy="8.5" r="3.5" fill="white" />
  </svg>
);

const LogoSage = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 14.5L7 13l1.41-1.41L10.5 13.67l5.09-5.09L17 10l-6.5 6.5z" fill="#00D639" />
  </svg>
);

const LogoQuickBooks = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7">
    <circle cx="12" cy="12" r="12" fill="#2CA01C" />
    <path d="M7 9h2v6H7zm8 0h2v6h-2z" fill="white" />
    <path d="M9 9h3a2 2 0 010 4H9zm5 2h3a2 2 0 010 4h-3z" fill="white" fillOpacity="0.7" />
  </svg>
);

const LogoXero = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7">
    <circle cx="12" cy="12" r="12" fill="#13B5EA" />
    <path d="M8 8l8 8M16 8l-8 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const LogoZoom = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7">
    <rect width="24" height="24" rx="6" fill="#2D8CFF" />
    <path d="M5 8.5a2 2 0 012-2h6a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2v-5z" fill="white" />
    <path d="M15 10l3.5-2v6L15 12v-2z" fill="white" />
  </svg>
);

const LogoYoco = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7">
    <rect width="24" height="24" rx="6" fill="#00C1DE" />
    <path d="M8 7l4 5 4-5M12 12v5" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LogoHealthbridge = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7">
    <rect width="24" height="24" rx="6" fill="#E11D48" />
    <path d="M12 6v12M6 12h12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const LogoDiscovery = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7">
    <circle cx="12" cy="12" r="11" fill="none" stroke="#0891B2" strokeWidth="2" />
    <path d="M12 5v7l4.5 2.5" stroke="#0891B2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const LogoSnapscan = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7">
    <rect width="24" height="24" rx="6" fill="#4F46E5" />
    <rect x="6" y="6" width="12" height="12" rx="2" stroke="white" strokeWidth="1.5" fill="none" />
    <rect x="9" y="9" width="6" height="6" rx="1" fill="white" />
  </svg>
);

// ── Data ──

type Integration = {
  name: string;
  category: string;
  description: string;
  logo: React.ComponentType;
};

const connected: Integration[] = [
  { name: "WhatsApp Business", category: "Messaging", description: "Two-way patient messaging, AI chatbot, reminders & broadcast campaigns", logo: LogoWhatsApp },
  { name: "Gmail", category: "Email", description: "Inbox sync, appointment confirmations, and patient communications", logo: LogoGmail },
  { name: "Google Calendar", category: "Scheduling", description: "Two-way sync — appointments appear in your calendar instantly", logo: LogoGoogleCal },
  { name: "Google Maps", category: "Visibility", description: "Practice location, Google reviews, and online presence boost", logo: LogoGoogleMaps },
  { name: "Sage", category: "Accounting", description: "Invoice sync, payment tracking, and ICD-10 medical aid claims", logo: LogoSage },
  { name: "QuickBooks", category: "Accounting", description: "Revenue tracking, expense management, and billing integration", logo: LogoQuickBooks },
  { name: "Xero", category: "Accounting", description: "Cloud accounting, invoice generation, and payment reconciliation", logo: LogoXero },
];

const comingSoon: Integration[] = [
  { name: "Healthbridge", category: "Claims", description: "SA's leading medical aid claims switch — submit & track electronically", logo: LogoHealthbridge },
  { name: "Discovery Health", category: "Medical Aid", description: "Real-time benefit checks and pre-authorizations", logo: LogoDiscovery },
  { name: "Snapscan", category: "Payments", description: "QR code payments at the counter — instant settlement", logo: LogoSnapscan },
  { name: "Zoom", category: "Telehealth", description: "Virtual consultations with one-click video calls", logo: LogoZoom },
  { name: "Yoco", category: "Card Payments", description: "In-practice card payments, auto-reconciled with invoices", logo: LogoYoco },
];

// ── Component ──

export default function Integrations() {
  return (
    <section className="relative w-full bg-gray-50 py-24 md:py-32 overflow-hidden">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="uppercase tracking-[0.3em] text-xs text-[#1D8AB5] font-mono">
            Integrations
          </span>
          <h2 className="text-4xl md:text-5xl font-light tracking-[-0.03em] text-gray-900 mt-6 leading-[1.2]">
            Works with the tools you{" "}
            <span className="text-[#1D8AB5]">already use</span>
          </h2>
          <p className="text-gray-500 text-base font-light leading-relaxed mt-5 max-w-xl mx-auto">
            One platform, every tool your practice depends on.
          </p>
        </motion.div>
      </div>

      {/* ── Connected: Mobile static grid ── */}
      <div className="md:hidden px-6 mb-8">
        <div className="flex flex-wrap justify-center gap-3">
          {connected.map((item) => {
            const Logo = item.logo;
            return (
              <div
                key={item.name}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white border border-gray-100 shadow-sm"
              >
                <Logo />
                <span className="text-sm font-medium text-gray-900">{item.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Connected: Desktop infinite scroll marquee ── */}
      <div className="relative mb-8 hidden md:block">
        {/* Edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />

        {/* Row 1 */}
        <div className="flex gap-4 mb-4 overflow-hidden">
          <motion.div
            className="flex gap-4 shrink-0"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, ease: "linear", repeat: Infinity }}
          >
            {[...connected, ...connected].map((item, i) => {
              const Logo = item.logo;
              return (
                <div
                  key={`a-${i}`}
                  className="group relative flex items-center gap-3 px-5 py-3 rounded-full bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-[#BAE6FD] transition-all duration-300 shrink-0 cursor-default"
                >
                  <div className="shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Logo />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 whitespace-nowrap">{item.name}</div>
                    <div className="text-[10px] text-gray-400 font-mono tracking-wide whitespace-nowrap">{item.category}</div>
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2.5 bg-gray-900 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap shadow-xl z-20">
                    {item.description}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-gray-900 rotate-45" />
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Row 2 — reverse direction, offset */}
        <div className="flex gap-4 overflow-hidden">
          <motion.div
            className="flex gap-4 shrink-0"
            animate={{ x: ["-50%", "0%"] }}
            transition={{ duration: 35, ease: "linear", repeat: Infinity }}
          >
            {[...connected.slice(3), ...connected.slice(0, 3), ...connected.slice(3), ...connected.slice(0, 3)].map((item, i) => {
              const Logo = item.logo;
              return (
                <div
                  key={`b-${i}`}
                  className="group relative flex items-center gap-3 px-5 py-3 rounded-full bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-[#BAE6FD] transition-all duration-300 shrink-0 cursor-default"
                >
                  <div className="shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Logo />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 whitespace-nowrap">{item.name}</div>
                    <div className="text-[10px] text-gray-400 font-mono tracking-wide whitespace-nowrap">{item.category}</div>
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2.5 bg-gray-900 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap shadow-xl z-20">
                    {item.description}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-gray-900 rotate-45" />
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Connected count */}
      <div className="flex justify-center mb-14">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F0F9FF] border border-[#BAE6FD]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#3DA9D1] animate-pulse" />
          <span className="text-[11px] font-mono text-[#1D3443] tracking-wider uppercase">
            {connected.length} Connected
          </span>
        </div>
      </div>

      {/* ── Coming Soon ── */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-10" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-[11px] font-mono text-gray-400 tracking-wider uppercase">
              Coming Soon
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {comingSoon.map((item, i) => {
              const Logo = item.logo;
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/60 border border-dashed border-gray-200 hover:border-gray-300 transition-all duration-300 cursor-default"
                >
                  <div className="shrink-0 opacity-40 group-hover:opacity-80 transition-opacity">
                    <Logo />
                  </div>
                  <span className="text-sm text-gray-400 group-hover:text-gray-600 font-light transition-colors whitespace-nowrap">
                    {item.name}
                  </span>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap shadow-xl z-20">
                    {item.description}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-gray-900 rotate-45" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
