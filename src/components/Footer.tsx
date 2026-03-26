"use client";

import Link from "next/link";
import { useBrand } from "@/lib/tenant-context";

const footerLinks = {
  Product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Dashboard", href: "/dashboard" },
  ],
  Network: [
    { label: "Medicross Clinics", href: "/how-it-works/dental" },
    { label: "GP Practices", href: "/how-it-works/gp" },
    { label: "Specialist Centres", href: "/how-it-works/radiology" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Ecosystem", href: "/ecosystem" },
    { label: "Payer Connect", href: "/payer-connect" },
    { label: "Contact", href: "#get-in-touch" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Cookies", href: "/cookies" },
    { label: "Data Request", href: "/data-request" },
  ],
};

export default function Footer() {
  const brand = useBrand();
  return (
    <footer className="bg-[#1D3443] border-t border-white/[0.04] py-16">
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-5">
              {brand.logoUrl ? (
                <img src={brand.logoUrl} alt={brand.name} className="h-6" />
              ) : (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: brand.primaryColor }}>
                  {brand.name.charAt(0)}
                </div>
              )}
            </Link>
            <p className="text-xs text-white/70 leading-relaxed font-light">
              AI-powered operations platform. {brand.tagline}
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs text-white/50 uppercase tracking-[0.2em] mb-4 font-semibold">
                {category}
              </h4>
              <div className="space-y-3">
                {links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-xs text-white/70 hover:text-white/60 transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="h-px w-full bg-white/[0.04] mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-white/70 font-medium">
            &copy; 2026 {brand.name}. {brand.tagline}
          </p>
          <p className="text-[11px] text-white/70 font-medium">
            Sandton, Gauteng, South Africa
          </p>
        </div>
      </div>
    </footer>
  );
}
