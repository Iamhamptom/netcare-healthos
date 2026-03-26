"use client";

import { createContext, useContext } from "react";
import type { TenantConfig, TenantBrand, TenantFeatures, TenantLabels } from "./tenant";

const DEFAULT_BRAND: TenantBrand = {
  name: "Health OS",
  slug: "demo",
  logoUrl: "/logo.png",
  faviconUrl: "/favicon.png",
  primaryColor: "#D4AF37",
  secondaryColor: "#2DD4BF",
  accentColor: "#6C5CE7",
  tagline: "AI-Powered Healthcare Operations",
  supportEmail: "support@healthos.co",
  supportPhone: "+27 11 000 0000",
  websiteUrl: "https://healthos.co",
};

const DEFAULT_LABELS: TenantLabels = {
  dashboardTitle: "Claims Recovery Hub",
  mainCta: "Scrub Claims",
  kpi1: "Recovery Rate",
  kpi2: "Outstanding Debtors",
  kpi3: "Claims Processed",
  kpi4: "Avg Days to Payment",
  onboardingPrompt: "Add your practices",
  entityName: "practices",
  userRole: "Practice Manager",
  claimsSection: "Claims Recovery",
  analyticsSection: "Bureau Analytics",
  welcomeMessage: "Welcome back. Here's your claims intelligence.",
  heroHeadline: "Your practice.",
  heroSubheadline: "One",
  heroDescription: "an AI-powered operations platform for healthcare.",
  heroStat1: { value: "95%+", label: "Collection Rate" },
  heroStat2: { value: "50%", label: "Fewer Rejections" },
  heroStat3: { value: "100%", label: "POPIA Compliant" },
  trustBadge1: "POPIA Compliant",
  trustBadge2: "AI-Powered",
};

const TenantContext = createContext<TenantConfig>({
  id: "default",
  slug: "demo",
  industryType: "billing_bureau",
  status: "active",
  brand: DEFAULT_BRAND,
  features: {
    claimsAnalyzer: true, fhirHub: true, switchingEngine: true, whatsapp: true,
    placeo: true, careonBridge: true, patientPortal: true, billing: true,
    bookings: true, recall: true, referrals: true, opsHub: true,
    investorPortal: true, outreach: true, mlPipeline: true,
  },
  pricing: { model: "monthly", rate: 0, commissionSplit: 0, paymentTerms: 30 },
  labels: DEFAULT_LABELS,
});

export function TenantProvider({ config, children }: { config: TenantConfig; children: React.ReactNode }) {
  return <TenantContext.Provider value={config}>{children}</TenantContext.Provider>;
}

export function useTenant(): TenantConfig {
  return useContext(TenantContext);
}

export function useBrand(): TenantBrand {
  return useContext(TenantContext).brand;
}

export function useFeatures(): TenantFeatures {
  return useContext(TenantContext).features;
}

export function useLabels(): TenantLabels {
  return useContext(TenantContext).labels;
}

/**
 * Gate component — only renders children if feature is enabled.
 * Usage: <Feature name="whatsapp"><WhatsAppPanel /></Feature>
 */
export function Feature({ name, children, fallback }: { name: keyof TenantFeatures; children: React.ReactNode; fallback?: React.ReactNode }) {
  const features = useFeatures();
  if (!features[name]) return fallback ?? null;
  return <>{children}</>;
}
