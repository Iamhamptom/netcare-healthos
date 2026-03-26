/**
 * Multi-Tenant Configuration Layer
 * Handles branding, feature flags, language/copy, and business config per tenant.
 * One codebase, infinite brands.
 */

import { db } from "./db";

// ── Types ──

export interface TenantBrand {
  name: string;
  slug: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  websiteUrl: string;
}

export interface TenantFeatures {
  claimsAnalyzer: boolean;
  fhirHub: boolean;
  switchingEngine: boolean;
  whatsapp: boolean;
  placeo: boolean;
  careonBridge: boolean;
  patientPortal: boolean;
  billing: boolean;
  bookings: boolean;
  recall: boolean;
  referrals: boolean;
  opsHub: boolean;
  investorPortal: boolean;
  outreach: boolean;
  mlPipeline: boolean;
}

export type IndustryType = "billing_bureau" | "hospital" | "enterprise_funder" | "software_platform" | "practice_group" | "specialist_practice";
export type PricingModel = "per_claim" | "monthly" | "enterprise" | "revenue_share";

export interface TenantConfig {
  id: string;
  slug: string;
  industryType: IndustryType;
  status: string;
  brand: TenantBrand;
  features: TenantFeatures;
  pricing: {
    model: PricingModel;
    rate: number;
    commissionSplit: number;
    paymentTerms: number;
  };
  labels: TenantLabels;
}

// ── Industry-Specific Language ──

export interface TenantLabels {
  dashboardTitle: string;
  mainCta: string;
  kpi1: string;
  kpi2: string;
  kpi3: string;
  kpi4: string;
  onboardingPrompt: string;
  entityName: string; // "practices" | "departments" | "schemes" | "partners"
  userRole: string; // "Practice Manager" | "Department Head" | "Claims Manager"
  claimsSection: string;
  analyticsSection: string;
  welcomeMessage: string;
  // Hero / landing page content
  heroHeadline: string;
  heroSubheadline: string;
  heroDescription: string;
  heroStat1: { value: string; label: string };
  heroStat2: { value: string; label: string };
  heroStat3: { value: string; label: string };
  trustBadge1: string;
  trustBadge2: string;
}

const LABELS_BY_INDUSTRY: Record<IndustryType, TenantLabels> = {
  billing_bureau: {
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
    heroHeadline: "88 clinics.",
    heroSubheadline: "One",
    heroDescription: "an AI-powered operations platform that unifies claims intelligence, financial analytics, and practice management across your entire primary healthcare network.",
    heroStat1: { value: "88", label: "Clinics in Network" },
    heroStat2: { value: "R33M+", label: "Claims Addressable" },
    heroStat3: { value: "50%", label: "Faster Processing" },
    trustBadge1: "88 Clinics Nationwide",
    trustBadge2: "R33M+ Claims Addressable",
  },
  hospital: {
    dashboardTitle: "Submission Intelligence",
    mainCta: "Submit to Scheme",
    kpi1: "First-Pass Rate",
    kpi2: "Pending Approvals",
    kpi3: "Daily Submissions",
    kpi4: "Revenue Captured",
    onboardingPrompt: "Add your departments",
    entityName: "departments",
    userRole: "Department Head",
    claimsSection: "Claims Submission",
    analyticsSection: "Hospital Analytics",
    welcomeMessage: "Welcome back. Here's your submission dashboard.",
    heroHeadline: "Your hospital.",
    heroSubheadline: "One",
    heroDescription: "an AI-powered operations platform that unifies claims submission, financial analytics, and department management across your entire hospital network.",
    heroStat1: { value: "95%+", label: "First-Pass Target" },
    heroStat2: { value: "24hr", label: "Turnaround" },
    heroStat3: { value: "50%", label: "Fewer Rejections" },
    trustBadge1: "Hospital Grade",
    trustBadge2: "AI Claims Submission",
  },
  enterprise_funder: {
    dashboardTitle: "Portfolio Analytics",
    mainCta: "Review Pipeline",
    kpi1: "Rejection Rate",
    kpi2: "Claims Volume",
    kpi3: "Provider Performance",
    kpi4: "Scheme Compliance",
    onboardingPrompt: "Connect your schemes",
    entityName: "schemes",
    userRole: "Claims Manager",
    claimsSection: "Claims Intelligence",
    analyticsSection: "Portfolio Insights",
    welcomeMessage: "Welcome back. Here's your portfolio overview.",
    heroHeadline: "Your portfolio.",
    heroSubheadline: "One",
    heroDescription: "an AI-powered analytics platform for medical scheme administrators — claims intelligence, provider performance, and compliance monitoring.",
    heroStat1: { value: "1M+", label: "Claims Analysed" },
    heroStat2: { value: "R500M+", label: "Portfolio Value" },
    heroStat3: { value: "60%", label: "Faster Adjudication" },
    trustBadge1: "Enterprise Grade",
    trustBadge2: "Multi-Scheme Analytics",
  },
  software_platform: {
    dashboardTitle: "AI Module Dashboard",
    mainCta: "Validate Claims",
    kpi1: "Accuracy Score",
    kpi2: "API Calls Today",
    kpi3: "Active Integrations",
    kpi4: "Error Rate",
    onboardingPrompt: "Connect your platform",
    entityName: "partners",
    userRole: "Integration Manager",
    claimsSection: "Claims API",
    analyticsSection: "Integration Analytics",
    welcomeMessage: "Welcome back. Here's your integration status.",
    heroHeadline: "Your platform.",
    heroSubheadline: "One",
    heroDescription: "AI-powered claims validation and intelligence modules that integrate into your existing practice management software.",
    heroStat1: { value: "99.5%", label: "Accuracy" },
    heroStat2: { value: "<100ms", label: "API Latency" },
    heroStat3: { value: "10+", label: "Integrations" },
    trustBadge1: "API-First",
    trustBadge2: "Real-Time Validation",
  },
  practice_group: {
    dashboardTitle: "Practice Operations",
    mainCta: "View Claims",
    kpi1: "Collection Rate",
    kpi2: "Patient Volume",
    kpi3: "Claims Submitted",
    kpi4: "Outstanding Balance",
    onboardingPrompt: "Add your practice locations",
    entityName: "practices",
    userRole: "Practice Owner",
    claimsSection: "Claims Management",
    analyticsSection: "Practice Analytics",
    welcomeMessage: "Welcome back. Here's your practice overview.",
    heroHeadline: "Your practices.",
    heroSubheadline: "One",
    heroDescription: "an AI-powered operations platform that unifies claims, billing, and patient management across all your practice locations.",
    heroStat1: { value: "95%+", label: "Collection Rate" },
    heroStat2: { value: "30%", label: "Fewer Rejections" },
    heroStat3: { value: "50%", label: "Faster Processing" },
    trustBadge1: "Multi-Site",
    trustBadge2: "AI Claims Intelligence",
  },
  specialist_practice: {
    dashboardTitle: "Specialist Command Centre",
    mainCta: "Review Patients",
    kpi1: "Disease Activity (DAS28)",
    kpi2: "Biologic Pre-Auths Pending",
    kpi3: "Infusions This Week",
    kpi4: "GP Referrals This Month",
    onboardingPrompt: "Add your consultation locations",
    entityName: "locations",
    userRole: "Specialist",
    claimsSection: "Claims & Pre-Authorisation",
    analyticsSection: "Practice Intelligence",
    welcomeMessage: "Welcome back. Here's your practice at a glance.",
    heroHeadline: "4 locations.",
    heroSubheadline: "One",
    heroDescription: "an AI-powered specialist practice platform — automate pre-authorisations, manage GP referrals, track disease activity, and streamline billing across all consultation rooms.",
    heroStat1: { value: "4", label: "Practice Locations" },
    heroStat2: { value: "75%", label: "Faster Pre-Auth" },
    heroStat3: { value: "100%", label: "POPIA Compliant" },
    trustBadge1: "Specialist Grade",
    trustBadge2: "AI Pre-Authorisation",
  },
};

// ── Default Tenant (VisioCorp / demo) ──

const DEFAULT_TENANT: TenantConfig = {
  id: "default",
  slug: "demo",
  industryType: "billing_bureau",
  status: "active",
  brand: {
    name: "Netcare Health OS",
    slug: "demo",
    logoUrl: "/images/netcare-logo.png",
    faviconUrl: "/favicon.png",
    primaryColor: "#D4AF37",
    secondaryColor: "#2DD4BF",
    accentColor: "#6C5CE7",
    tagline: "AI-Powered Healthcare Operations",
    supportEmail: "support@visiocorp.co",
    supportPhone: "+27 11 000 0000",
    websiteUrl: "https://healthos.visiocorp.co",
  },
  features: {
    claimsAnalyzer: true,
    fhirHub: true,
    switchingEngine: true,
    whatsapp: true,
    placeo: true,
    careonBridge: true,
    patientPortal: true,
    billing: true,
    bookings: true,
    recall: true,
    referrals: true,
    opsHub: true,
    investorPortal: true,
    outreach: true,
    mlPipeline: true,
  },
  pricing: { model: "monthly", rate: 0, commissionSplit: 0, paymentTerms: 30 },
  labels: LABELS_BY_INDUSTRY.billing_bureau,
};

// ── Pre-loaded Demo Brands (for sales demos) ──

export const DEMO_BRANDS: Record<string, Partial<TenantConfig>> = {
  healthbridge: {
    slug: "healthbridge",
    industryType: "billing_bureau",
    brand: {
      name: "Healthbridge",
      slug: "healthbridge",
      logoUrl: "/brands/healthbridge-logo.png",
      faviconUrl: "/brands/healthbridge-favicon.png",
      primaryColor: "#0066CC",
      secondaryColor: "#00A3E0",
      accentColor: "#004C99",
      tagline: "Transforming Private Practice",
      supportEmail: "support@healthbridge.co.za",
      supportPhone: "+27 11 532 7800",
      websiteUrl: "https://healthbridge.co.za",
    },
  },
  xpedient: {
    slug: "xpedient",
    industryType: "billing_bureau",
    brand: {
      name: "Xpedient Medical",
      slug: "xpedient",
      logoUrl: "/brands/xpedient-logo.png",
      faviconUrl: "/brands/xpedient-favicon.png",
      primaryColor: "#1B4D3E",
      secondaryColor: "#2E8B57",
      accentColor: "#006400",
      tagline: "Medical Business Solutions",
      supportEmail: "info@xpedient.co.za",
      supportPhone: "+27 21 000 0000",
      websiteUrl: "https://xpedient.co.za",
    },
  },
  sims: {
    slug: "sims",
    industryType: "billing_bureau",
    brand: {
      name: "SIMS Medical Bureau",
      slug: "sims",
      logoUrl: "/brands/sims-logo.png",
      faviconUrl: "/brands/sims-favicon.png",
      primaryColor: "#003366",
      secondaryColor: "#336699",
      accentColor: "#0055AA",
      tagline: "Medical Account Administration",
      supportEmail: "info@sims.co.za",
      supportPhone: "+27 12 000 0000",
      websiteUrl: "https://www.sims.co.za",
    },
  },
  discovery: {
    slug: "discovery",
    industryType: "enterprise_funder",
    brand: {
      name: "Discovery Health",
      slug: "discovery",
      logoUrl: "/brands/discovery-logo.png",
      faviconUrl: "/brands/discovery-favicon.png",
      primaryColor: "#003087",
      secondaryColor: "#0050C8",
      accentColor: "#FF6600",
      tagline: "Claims Intelligence Platform",
      supportEmail: "claims@discovery.co.za",
      supportPhone: "+27 11 529 2888",
      websiteUrl: "https://www.discovery.co.za",
    },
  },
  medscheme: {
    slug: "medscheme",
    industryType: "enterprise_funder",
    brand: {
      name: "Medscheme",
      slug: "medscheme",
      logoUrl: "/brands/medscheme-logo.png",
      faviconUrl: "/brands/medscheme-favicon.png",
      primaryColor: "#8B0000",
      secondaryColor: "#CC0000",
      accentColor: "#FF3333",
      tagline: "Multi-Scheme Claims Intelligence",
      supportEmail: "claims@medscheme.com",
      supportPhone: "+27 11 671 2000",
      websiteUrl: "https://www.medscheme.com",
    },
  },
  goodx: {
    slug: "goodx",
    industryType: "software_platform",
    brand: {
      name: "GoodX Software",
      slug: "goodx",
      logoUrl: "/brands/goodx-logo.png",
      faviconUrl: "/brands/goodx-favicon.png",
      primaryColor: "#FF6B00",
      secondaryColor: "#FF8C3A",
      accentColor: "#CC5500",
      tagline: "AI-Powered Practice Management",
      supportEmail: "support@goodx.co.za",
      supportPhone: "+27 21 000 0000",
      websiteUrl: "https://goodx.co.za",
    },
  },
  netcare: {
    slug: "netcare",
    industryType: "hospital",
    brand: {
      name: "Netcare Primary Healthcare",
      slug: "netcare",
      logoUrl: "/brands/netcare-logo.png",
      faviconUrl: "/brands/netcare-favicon.png",
      primaryColor: "#006B3F",
      secondaryColor: "#00A86B",
      accentColor: "#00CC7A",
      tagline: "AI Operations Platform — 88 Clinics",
      supportEmail: "ops@netcare.co.za",
      supportPhone: "+27 11 301 0000",
      websiteUrl: "https://www.netcare.co.za",
    },
  },
  rheumcare: {
    slug: "rheumcare",
    industryType: "specialist_practice",
    brand: {
      name: "RheumCare",
      slug: "rheumcare",
      logoUrl: "/brands/rheumcare-logo.png",
      faviconUrl: "/brands/rheumcare-favicon.png",
      primaryColor: "#78C6C2",
      secondaryColor: "#104099",
      accentColor: "#0D7A74",
      tagline: "Early diagnosis, shared decision-making, and supportive care",
      supportEmail: "admin@rheumcare.co.za",
      supportPhone: "+27 63 666 1793",
      websiteUrl: "https://www.rheumcare.co.za",
    },
  },
};

// ── Tenant Resolution ──

/**
 * Resolve tenant from subdomain or slug.
 * Priority: 1) DB tenant, 2) Demo brand, 3) Default
 */
export async function resolveTenant(slugOrSubdomain: string): Promise<TenantConfig> {
  // Try database first
  try {
    const { supabaseAdmin } = await import("./supabase");
    const { data } = await supabaseAdmin
      .from("ho_tenants")
      .select("*")
      .eq("slug", slugOrSubdomain)
      .single();

    if (data) {
      return dbRowToConfig(data);
    }
  } catch {
    // DB not available or tenant not found — fall through
  }

  // Try demo brands
  const demo = DEMO_BRANDS[slugOrSubdomain];
  if (demo) {
    return {
      ...DEFAULT_TENANT,
      ...demo,
      brand: { ...DEFAULT_TENANT.brand, ...demo.brand },
      labels: LABELS_BY_INDUSTRY[demo.industryType || "billing_bureau"],
    } as TenantConfig;
  }

  // Default
  return DEFAULT_TENANT;
}

/**
 * Resolve tenant from request hostname.
 * "healthbridge.healthos.co" → slug "healthbridge"
 * "healthos.visiocorp.co" → default
 */
export function extractSlugFromHost(host: string): string | null {
  // healthbridge.healthos.co → healthbridge
  const match = host.match(/^([a-z0-9-]+)\.healthos\.(co|co\.za|visiocorp\.co)$/);
  if (match) return match[1];

  // ?brand=healthbridge query param (for demos)
  return null;
}

// ── Helpers ──

function dbRowToConfig(row: Record<string, unknown>): TenantConfig {
  const industryType = (row.industry_type as IndustryType) || "billing_bureau";
  return {
    id: row.id as string,
    slug: row.slug as string,
    industryType,
    status: row.status as string,
    brand: {
      name: row.name as string,
      slug: row.slug as string,
      logoUrl: (row.logo_url as string) || "",
      faviconUrl: (row.favicon_url as string) || "",
      primaryColor: (row.primary_color as string) || "#D4AF37",
      secondaryColor: (row.secondary_color as string) || "#2DD4BF",
      accentColor: (row.accent_color as string) || "#6C5CE7",
      tagline: (row.tagline as string) || "",
      supportEmail: (row.support_email as string) || "",
      supportPhone: (row.support_phone as string) || "",
      websiteUrl: (row.website_url as string) || "",
    },
    features: {
      claimsAnalyzer: row.feature_claims_analyzer as boolean ?? true,
      fhirHub: row.feature_fhir_hub as boolean ?? false,
      switchingEngine: row.feature_switching_engine as boolean ?? false,
      whatsapp: row.feature_whatsapp as boolean ?? false,
      placeo: row.feature_placeo as boolean ?? false,
      careonBridge: row.feature_careon_bridge as boolean ?? false,
      patientPortal: row.feature_patient_portal as boolean ?? true,
      billing: row.feature_billing as boolean ?? true,
      bookings: row.feature_bookings as boolean ?? true,
      recall: row.feature_recall as boolean ?? true,
      referrals: row.feature_referrals as boolean ?? false,
      opsHub: row.feature_ops_hub as boolean ?? false,
      investorPortal: row.feature_investor_portal as boolean ?? false,
      outreach: row.feature_outreach as boolean ?? false,
      mlPipeline: row.feature_ml_pipeline as boolean ?? false,
    },
    pricing: {
      model: (row.pricing_model as PricingModel) || "monthly",
      rate: (row.rate as number) || 0,
      commissionSplit: (row.commission_split as number) || 0,
      paymentTerms: (row.payment_terms as number) || 30,
    },
    labels: LABELS_BY_INDUSTRY[industryType],
  };
}

/**
 * Get CSS variables for tenant branding.
 * Inject into <html> style attribute.
 */
export function tenantCssVars(brand: TenantBrand): string {
  return [
    `--brand-primary: ${brand.primaryColor}`,
    `--brand-secondary: ${brand.secondaryColor}`,
    `--brand-accent: ${brand.accentColor}`,
  ].join("; ");
}

/**
 * Check if a feature is enabled for a tenant.
 */
export function hasFeature(config: TenantConfig, feature: keyof TenantFeatures): boolean {
  return config.features[feature] ?? false;
}
