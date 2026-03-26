import type { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { resolveTenant, extractSlugFromHost, tenantCssVars } from "@/lib/tenant";
import { TenantProvider } from "@/lib/tenant-context";
import CookieConsent from "@/components/CookieConsent";
import "./globals.css";

/** Resolve brand slug from subdomain → x-brand header → cookie → query param */
async function resolveBrandSlug(): Promise<string | null> {
  const hdrs = await headers();
  const host = hdrs.get("host") || "";
  // 1. Subdomain
  const fromHost = extractSlugFromHost(host);
  if (fromHost) return fromHost;
  // 2. x-brand header (set by proxy from query param or cookie)
  const fromHeader = hdrs.get("x-brand");
  if (fromHeader) return fromHeader;
  // 3. Cookie (persisted across navigation)
  const ck = await cookies();
  const fromCookie = ck.get("healthos-brand")?.value;
  if (fromCookie) return fromCookie;
  // 4. Query param fallback via x-url
  const url = hdrs.get("x-url") || "";
  if (url) {
    try {
      const u = new URL(url, "http://localhost");
      const fromParam = u.searchParams.get("brand");
      if (fromParam) return fromParam;
    } catch { /* ignore */ }
  }
  return null;
}

export async function generateMetadata(): Promise<Metadata> {
  const slug = await resolveBrandSlug();
  const tenant = await resolveTenant(slug || "demo");
  const b = tenant.brand;

  return {
    title: {
      default: `${b.name} — AI Healthcare Platform`,
      template: `%s | ${b.name}`,
    },
    description: `${b.name} — AI-powered healthcare operations platform. ${b.tagline}`,
    keywords: ["healthcare", "south africa", "AI healthcare", "ICD-10", "POPIA", "medical billing", "claims intelligence", "practice management"],
    authors: [{ name: b.name }],
    creator: b.name,
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
  const slug = await resolveBrandSlug();
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
