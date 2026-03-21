import type { Metadata } from "next";
import { headers } from "next/headers";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { resolveTenant, extractSlugFromHost, tenantCssVars } from "@/lib/tenant";
import { TenantProvider } from "@/lib/tenant-context";
import CookieConsent from "@/components/CookieConsent";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const hdrs = await headers();
  const host = hdrs.get("host") || "";
  const slug = extractSlugFromHost(host);
  const tenant = await resolveTenant(slug || "demo");
  const b = tenant.brand;

  return {
    title: {
      default: `${b.name} — AI Healthcare Platform`,
      template: `%s | ${b.name}`,
    },
    description: `AI-powered healthcare operations platform. Claims intelligence, FHIR interoperability, and POPIA compliance. Powered by Visio Research Labs.`,
    keywords: ["healthcare", "south africa", "AI healthcare", "ICD-10", "POPIA", "medical billing", "claims intelligence", "practice management"],
    authors: [{ name: "Visio Research Labs" }],
    creator: "Visio Research Labs",
    metadataBase: new URL(b.websiteUrl || "https://healthos.visiocorp.co"),
    openGraph: {
      type: "website",
      locale: "en_ZA",
      siteName: b.name,
      title: `${b.name} — AI Healthcare Platform`,
      description: `AI-powered healthcare operations. Claims intelligence and practice management. ${b.tagline}`,
    },
    robots: { index: true, follow: true },
    icons: {
      icon: b.faviconUrl || "/favicon.png",
      apple: b.faviconUrl || "/favicon.png",
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const hdrs = await headers();
  const host = hdrs.get("host") || "";
  const url = hdrs.get("x-url") || hdrs.get("x-forwarded-url") || "";

  // Resolve tenant from subdomain or ?brand= query param
  let slug = extractSlugFromHost(host);
  if (!slug && url) {
    try {
      const u = new URL(url, "http://localhost");
      slug = u.searchParams.get("brand");
    } catch { /* ignore */ }
  }

  const tenant = await resolveTenant(slug || "demo");
  const cssVars = tenantCssVars(tenant.brand);

  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} style={{ cssText: cssVars } as React.CSSProperties}>
      <body className="antialiased bg-[#F8F6F4] text-[#1A1A1A] font-sans">
        <TenantProvider config={tenant}>
          {children}
        </TenantProvider>
        <CookieConsent />
      </body>
    </html>
  );
}
