import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Netcare Primary Healthcare — AI Operations Platform",
    template: "%s | Netcare Health OS",
  },
  description: "AI-powered operations platform for Netcare Primary Healthcare. Network-wide claims intelligence, multi-site financial dashboards, and POPIA compliance across 88 clinics.",
  keywords: ["netcare", "primary healthcare", "south africa", "healthcare operations", "AI healthcare", "ICD-10", "POPIA", "medical billing", "claims intelligence", "Medicross", "practice management", "multi-site healthcare"],
  authors: [{ name: "Netcare Primary Healthcare" }],
  creator: "Netcare Primary Healthcare",
  metadataBase: new URL("https://netcare-healthos.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "https://netcare-healthos.vercel.app",
    siteName: "Netcare Health OS",
    title: "Netcare Primary Healthcare — AI Operations Platform",
    description: "AI-powered operations platform for Netcare Primary Healthcare. Network-wide claims intelligence, multi-site financial dashboards, and POPIA compliance across 88 clinics.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Netcare Health OS — AI Operations Platform" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Netcare Primary Healthcare — AI Operations Platform",
    description: "AI-powered operations platform for Netcare Primary Healthcare. Network-wide claims intelligence across 88 clinics.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#F8F6F4] text-[#1A1A1A]">
        {children}
      </body>
    </html>
  );
}
