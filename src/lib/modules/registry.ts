/* ─── Health OS Module Registry ─── */
/* Each module = its own app experience with dedicated nav, integrations, and agent context */

import type { ModuleDefinition, ModuleRegistry } from "./types";

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  /* ────────────────────────────────────────────────────────────── */
  /* MODULE 1: PRACTICE MANAGER                                     */
  /* ────────────────────────────────────────────────────────────── */
  {
    id: "practice-manager",
    name: "Practice Manager",
    shortName: "Practice",
    description: "Daily operations — morning checklist to end-of-day close. Manage staff, compliance, recall, and patient engagement.",
    icon: "ClipboardList",
    color: "#3DA9D1",
    badge: "CORE",
    badgeColor: "blue",
    roles: ["admin", "receptionist", "nurse"],
    pages: [
      { href: "/dashboard/daily", icon: "Sunrise", label: "Morning Checklist", roles: ["admin", "receptionist", "nurse"], step: 1 },
      { href: "/dashboard", icon: "BarChart3", label: "Clinic KPIs", roles: ["admin", "receptionist"], step: 2 },
      { href: "/dashboard/practitioners", icon: "Users", label: "Team Management", roles: ["admin"], step: 3 },
      { href: "/dashboard/settings", icon: "Palette", label: "Practice Branding", roles: ["admin"], step: 4 },
      { href: "/dashboard/recall", icon: "RotateCcw", label: "Recall Management", roles: ["admin", "receptionist"], step: 5 },
      { href: "/dashboard/notifications", icon: "Mail", label: "Recall Send", roles: ["admin", "receptionist"], step: 6 },
      { href: "/dashboard/whatsapp", icon: "MessageSquare", label: "WhatsApp Campaigns", roles: ["admin"], step: 7 },
      { href: "/dashboard/engagement/sequences", icon: "Workflow", label: "Engagement Sequences", roles: ["admin"], step: 8 },
      { href: "/dashboard/reviews", icon: "Star", label: "Patient Reviews", roles: ["admin"], step: 9 },
      { href: "/dashboard/compliance", icon: "Shield", label: "POPIA Compliance", roles: ["admin"], step: 10 },
      { href: "/dashboard/audit", icon: "FileText", label: "Audit Log", roles: ["admin"], step: 11 },
      { href: "/dashboard/daily?mode=close", icon: "Moon", label: "End-of-Day Close", roles: ["admin", "receptionist", "nurse"], step: 12 },
    ],
    integrations: [
      {
        id: "supabase",
        name: "Supabase",
        description: "Core database — powers everything",
        status: "connected",
        impact: "Everything breaks",
        fallback: "None — required",
        envKeys: ["DATABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"],
      },
      {
        id: "resend",
        name: "Resend",
        description: "Recall emails, appointment notifications",
        status: "connected",
        impact: "No recall emails, no email notifications",
        fallback: "WhatsApp only (if connected), or manual phone calls",
        envKeys: ["RESEND_API_KEY"],
        setupHint: "Domain visiocorp.co is verified. Add clinic-specific sender if needed.",
      },
      {
        id: "whatsapp",
        name: "WhatsApp Business API",
        description: "Campaigns, automated sequences via WhatsApp",
        status: "needs_setup",
        impact: "No WhatsApp campaigns, no automated sequences via WhatsApp",
        fallback: "Email via Resend. Or SMS (not built yet).",
        envKeys: ["WHATSAPP_API_TOKEN", "WHATSAPP_PHONE_ID"],
        setupHint: "Each clinic needs its own WhatsApp Business account + approved templates.",
      },
      {
        id: "vercel-cron",
        name: "Vercel Cron Jobs",
        description: "Engagement sequences auto-fire every 2h",
        status: "connected",
        impact: "Engagement sequences don't auto-fire",
        fallback: "Manual trigger from dashboard",
        envKeys: ["CRON_SECRET"],
      },
      {
        id: "heal-import",
        name: "HEAL Patient Import",
        description: "Chronic patient completeness from legacy system",
        status: "stubbed",
        impact: "Chronic patient list incomplete — only patients registered in Health OS appear in recall",
        fallback: "Manual entry of chronic patients, or CSV import from HEAL",
        setupHint: "CSV import available at /dashboard/import. Full HEAL API integration planned.",
      },
    ],
    agentContext: {
      scope: "Daily practice operations, staff management, patient recall, engagement, compliance",
      capabilities: [
        "Generate daily task checklists based on role and day",
        "Check and report on clinic KPIs",
        "Manage staff roles and assignments",
        "Create and send recall campaigns (email + WhatsApp)",
        "Set up engagement sequences",
        "Check POPIA compliance status",
        "Review audit logs",
        "Run end-of-day closing procedures",
      ],
    },
  },

  /* ────────────────────────────────────────────────────────────── */
  /* MODULE 2: CLAIMS ENGINE                                        */
  /* ────────────────────────────────────────────────────────────── */
  {
    id: "claims-engine",
    name: "Claims Engine",
    shortName: "Claims",
    description: "AI-powered claims validation, auto-correction, batch analysis, and medical aid switching.",
    icon: "ShieldCheck",
    color: "#10B981",
    badge: "AI",
    badgeColor: "emerald",
    roles: ["admin", "receptionist", "doctor", "platform_admin"],
    pages: [
      { href: "/dashboard/claims-chat", icon: "MessageSquare", label: "Chat with Claims AI", roles: ["admin", "receptionist", "doctor", "platform_admin"] },
      { href: "/dashboard/claims", icon: "ShieldCheck", label: "Batch Analyzer", roles: ["admin", "receptionist", "doctor", "platform_admin"] },
      { href: "/dashboard/claims-copilot", icon: "Bot", label: "Claims Copilot", roles: ["admin", "receptionist"] },
      { href: "/dashboard/claims-network", icon: "Building2", label: "Claims Network", roles: ["platform_admin"] },
      { href: "/dashboard/healthbridge", icon: "Shield", label: "Claims Dashboard", roles: ["admin", "receptionist"] },
      { href: "/dashboard/healthbridge/submit", icon: "Send", label: "Submit Claim", roles: ["admin", "receptionist"] },
      { href: "/dashboard/healthbridge/eligibility", icon: "Heart", label: "Benefit Check", roles: ["admin", "receptionist"] },
      { href: "/dashboard/healthbridge/analytics", icon: "BarChart3", label: "Scheme Analytics", roles: ["admin", "receptionist"] },
      { href: "/dashboard/healthbridge/ai-coder", icon: "Brain", label: "AI Coder", roles: ["admin", "receptionist"] },
      { href: "/dashboard/healthbridge/batch", icon: "Upload", label: "Batch Upload", roles: ["admin", "receptionist"] },
      { href: "/dashboard/healthbridge/nappi", icon: "Pill", label: "NAPPI Lookup", roles: ["admin", "receptionist"] },
      { href: "/dashboard/healthbridge/followups", icon: "Clock", label: "Follow-ups", roles: ["admin", "receptionist"] },
      { href: "/dashboard/healthbridge/export", icon: "Download", label: "Export Data", roles: ["admin", "receptionist"] },
      { href: "/dashboard/switching", icon: "Network", label: "Switch Engine", roles: ["admin", "platform_admin"] },
    ],
    featureGate: "claimsAnalyzer",
    integrations: [
      {
        id: "supabase",
        name: "Supabase",
        description: "Claims data, scheme rules, rejection history",
        status: "connected",
        impact: "Everything breaks",
        fallback: "None — required",
        envKeys: ["DATABASE_URL"],
      },
      {
        id: "healthbridge-switch",
        name: "Healthbridge (Claims Switch)",
        description: "Primary medical aid claims switching house",
        status: "connected",
        impact: "Cannot submit claims electronically to medical aids",
        fallback: "Manual submission via scheme portals",
        envKeys: ["HEALTHBRIDGE_API_KEY", "HEALTHBRIDGE_PRACTICE_NUMBER"],
        setupHint: "Practice must be registered with Healthbridge. Contact support@healthbridge.co.za",
      },
      {
        id: "ai-model",
        name: "AI Model (Claude / Gemini)",
        description: "Claims validation, auto-correction, coding assistance",
        status: "connected",
        impact: "No AI-powered validation, falls back to rule-based only",
        fallback: "Rule-based validation still works. AI features disabled.",
        envKeys: ["ANTHROPIC_API_KEY", "GOOGLE_GENERATIVE_AI_API_KEY"],
      },
      {
        id: "icd10-db",
        name: "ICD-10 + NAPPI Database",
        description: "41K diagnosis codes, 487K medicine records",
        status: "connected",
        impact: "No code validation or auto-suggest",
        fallback: "Manual code entry without validation",
      },
      {
        id: "switchon",
        name: "SwitchOn (Alt Switch)",
        description: "Alternative switching house for overflow",
        status: "needs_setup",
        impact: "No failover if Healthbridge is down",
        fallback: "Healthbridge only",
        envKeys: ["SWITCHON_API_KEY"],
      },
    ],
    agentContext: {
      scope: "Claims validation, submission, correction, scheme rules, medical coding, switching",
      capabilities: [
        "Validate claims against ICD-10 and tariff codes",
        "Auto-correct common claim errors",
        "Chat about any claim — explain rejections, suggest fixes",
        "Batch analyze multiple claims at once",
        "Look up NAPPI medicine codes",
        "Check patient benefit/eligibility with medical aid",
        "Submit claims via Healthbridge switch",
        "Analyze rejection patterns and trends",
      ],
      priorityTools: ["validate_claim", "autocorrect_claim", "lookup_icd10", "lookup_nappi", "check_eligibility", "submit_claim"],
    },
  },

  /* ────────────────────────────────────────────────────────────── */
  /* MODULE 3: PATIENT CARE                                         */
  /* ────────────────────────────────────────────────────────────── */
  {
    id: "patient-care",
    name: "Patient Care",
    shortName: "Patients",
    description: "Clinical workflows — intake, transcription, bookings, check-in, referrals, and patient records.",
    icon: "Stethoscope",
    color: "#8B5CF6",
    badge: "CLINICAL",
    badgeColor: "purple",
    roles: ["admin", "doctor", "receptionist", "nurse"],
    pages: [
      { href: "/dashboard/intake", icon: "Mic", label: "AI Voice Intake", roles: ["admin", "doctor"] },
      { href: "/dashboard/scribe", icon: "Brain", label: "AI Scribe", roles: ["admin", "doctor"] },
      { href: "/dashboard/patients", icon: "Users", label: "Patient Records", roles: ["admin", "doctor", "nurse"] },
      { href: "/dashboard/bookings", icon: "CalendarCheck", label: "Bookings", roles: ["admin", "receptionist"] },
      { href: "/dashboard/checkin", icon: "UserCheck", label: "Check-In Queue", roles: ["admin", "receptionist", "nurse"] },
      { href: "/dashboard/calendar", icon: "Calendar", label: "Schedule", roles: ["admin", "doctor", "receptionist"] },
      { href: "/dashboard/referrals", icon: "Stethoscope", label: "Referrals", roles: ["admin", "doctor", "receptionist"] },
      { href: "/dashboard/billing", icon: "Receipt", label: "Billing", roles: ["admin", "receptionist"] },
      { href: "/dashboard/conversations", icon: "MessageSquare", label: "Conversations", roles: ["admin", "receptionist"] },
      { href: "/dashboard/agents", icon: "Bot", label: "AI Agents", roles: ["admin", "doctor"] },
    ],
    integrations: [
      {
        id: "supabase",
        name: "Supabase",
        description: "Patient records, bookings, medical history",
        status: "connected",
        impact: "Everything breaks",
        fallback: "None — required",
        envKeys: ["DATABASE_URL"],
      },
      {
        id: "ai-model",
        name: "AI Model (Claude / Gemini)",
        description: "Voice intake, medical scribe, agent intelligence",
        status: "connected",
        impact: "No AI intake, no scribe, agents degraded",
        fallback: "Manual data entry",
        envKeys: ["ANTHROPIC_API_KEY", "GOOGLE_GENERATIVE_AI_API_KEY"],
      },
      {
        id: "elevenlabs",
        name: "ElevenLabs Voice",
        description: "Text-to-speech for voice agents and intake",
        status: "connected",
        impact: "No voice output — text-only interaction",
        fallback: "Text-based intake and responses",
        envKeys: ["ELEVENLABS_API_KEY"],
      },
      {
        id: "google-calendar",
        name: "Google Calendar",
        description: "Sync bookings with practice calendar",
        status: "needs_setup",
        impact: "Bookings not synced to external calendar",
        fallback: "In-app calendar only",
        envKeys: ["GOOGLE_CALENDAR_CLIENT_ID", "GOOGLE_CALENDAR_CLIENT_SECRET"],
      },
      {
        id: "yoco",
        name: "Yoco Payments",
        description: "Card payments at point of care",
        status: "connected",
        impact: "No card payments — cash/EFT only",
        fallback: "Cash, EFT, or medical aid billing",
        envKeys: ["YOCO_SECRET_KEY"],
      },
    ],
    agentContext: {
      scope: "Clinical workflows, patient management, booking, billing, medical records",
      capabilities: [
        "AI voice intake — transcribe and structure patient information",
        "Medical scribe — real-time clinical note generation",
        "Manage patient records, allergies, medications",
        "Book, reschedule, and cancel appointments",
        "Process check-in queue",
        "Generate invoices with ICD-10 codes",
        "Handle referrals between practitioners",
        "AI triage and follow-up agents",
      ],
      priorityTools: ["search_patients", "create_booking", "check_in_patient", "create_invoice", "transcribe_audio"],
    },
  },

  /* ────────────────────────────────────────────────────────────── */
  /* MODULE 4: ENGAGEMENT                                           */
  /* ────────────────────────────────────────────────────────────── */
  {
    id: "engagement",
    name: "Engagement",
    shortName: "Engage",
    description: "Patient engagement campaigns, automated sequences, chronic care gap detection, and population health.",
    icon: "Heart",
    color: "#EC4899",
    badge: "NEW",
    badgeColor: "pink",
    roles: ["admin", "platform_admin"],
    pages: [
      { href: "/dashboard/engagement", icon: "Heart", label: "Engagement Hub", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/engagement/campaigns", icon: "Send", label: "Campaigns", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/engagement/sequences", icon: "Workflow", label: "Sequences", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/engagement/chronic", icon: "Stethoscope", label: "Chronic Care Gaps", roles: ["admin", "doctor", "platform_admin"] },
      { href: "/dashboard/engagement/population", icon: "Users", label: "Population Health", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/engagement/inbox", icon: "Inbox", label: "AI Email Inbox", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/notifications", icon: "Bell", label: "Notifications", roles: ["admin", "receptionist"] },
    ],
    integrations: [
      {
        id: "supabase",
        name: "Supabase",
        description: "Campaign data, sequence state, engagement metrics",
        status: "connected",
        impact: "Everything breaks",
        fallback: "None — required",
        envKeys: ["DATABASE_URL"],
      },
      {
        id: "resend",
        name: "Resend",
        description: "Email campaigns, sequence emails, AI inbox",
        status: "connected",
        impact: "No email campaigns or AI inbox",
        fallback: "WhatsApp only",
        envKeys: ["RESEND_API_KEY"],
      },
      {
        id: "whatsapp",
        name: "WhatsApp Business API",
        description: "WhatsApp campaigns and sequence messages",
        status: "needs_setup",
        impact: "No WhatsApp in engagement sequences",
        fallback: "Email-only sequences",
        envKeys: ["WHATSAPP_API_TOKEN"],
      },
      {
        id: "vercel-cron",
        name: "Vercel Cron Jobs",
        description: "Auto-trigger sequences and campaign sends",
        status: "connected",
        impact: "Sequences don't auto-fire",
        fallback: "Manual trigger from dashboard",
        envKeys: ["CRON_SECRET"],
      },
    ],
    agentContext: {
      scope: "Patient engagement, campaigns, automated sequences, chronic care, population health",
      capabilities: [
        "Create and manage engagement campaigns",
        "Set up automated multi-step sequences (email + WhatsApp)",
        "Detect chronic care gaps and generate outreach",
        "Analyze population health metrics",
        "Manage AI email inbox and auto-responses",
        "Schedule and track notification delivery",
      ],
    },
  },

  /* ────────────────────────────────────────────────────────────── */
  /* MODULE 5: INTELLIGENCE                                         */
  /* ────────────────────────────────────────────────────────────── */
  {
    id: "intelligence",
    name: "Intelligence",
    shortName: "Intel",
    description: "Analytics, KPIs, network finance, savings tracking, and practice performance insights.",
    icon: "BarChart3",
    color: "#F59E0B",
    badge: "LIVE",
    badgeColor: "amber",
    roles: ["admin", "doctor", "platform_admin"],
    pages: [
      { href: "/dashboard/network", icon: "Building2", label: "Network Finance", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/kpi", icon: "Gauge", label: "KPI Dashboard", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/gaps", icon: "Target", label: "12 Gaps We Fill", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/savings", icon: "Zap", label: "Savings Tracker", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/analytics", icon: "BarChart3", label: "Analytics", roles: ["admin", "doctor"] },
      { href: "/dashboard/intel", icon: "Globe", label: "Visio Intel", roles: ["admin"] },
      { href: "/dashboard/insights", icon: "TrendingUp", label: "Practice Insights", roles: ["admin", "doctor"] },
      { href: "/dashboard/performance", icon: "Gauge", label: "Performance", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/reports", icon: "FileBarChart", label: "Reports", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/benchmarks", icon: "Target", label: "Benchmarks", roles: ["admin", "platform_admin"] },
    ],
    integrations: [
      {
        id: "supabase",
        name: "Supabase",
        description: "All analytics data aggregated from operational tables",
        status: "connected",
        impact: "No analytics",
        fallback: "None — required",
        envKeys: ["DATABASE_URL"],
      },
      {
        id: "powerbi",
        name: "Power BI",
        description: "Advanced reporting and executive dashboards",
        status: "needs_setup",
        impact: "No embedded Power BI reports",
        fallback: "In-app analytics and CSV exports",
        envKeys: ["POWERBI_CLIENT_ID", "POWERBI_TENANT_ID"],
      },
    ],
    agentContext: {
      scope: "Analytics, KPIs, financial analysis, performance tracking, benchmarking",
      capabilities: [
        "Generate KPI reports (patients seen, avg wait, revenue, rejection rate)",
        "Track savings across claims optimization",
        "Network finance analysis across practices",
        "Benchmark against industry standards",
        "Generate custom reports and exports",
        "Identify performance trends and anomalies",
      ],
    },
  },

  /* ────────────────────────────────────────────────────────────── */
  /* MODULE 6: INTEGRATIONS HUB                                     */
  /* ────────────────────────────────────────────────────────────── */
  {
    id: "integrations",
    name: "Integrations",
    shortName: "Integrate",
    description: "FHIR interoperability, CareOn Bridge, Switch Engine, and external system connections.",
    icon: "Cable",
    color: "#06B6D4",
    badge: "HUB",
    badgeColor: "cyan",
    roles: ["admin", "platform_admin"],
    pages: [
      { href: "/dashboard/fhir-hub", icon: "Cable", label: "FHIR Hub", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/fhir-hub/architecture", icon: "Workflow", label: "FHIR Architecture", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/fhir-hub/explorer", icon: "TestTube", label: "API Explorer", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/bridge", icon: "Zap", label: "CareOn Bridge", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/bridge/careon", icon: "Gauge", label: "Bridge Console", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/bridge/health", icon: "Activity", label: "System Health", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/integration-map", icon: "Network", label: "Integration Map", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/settings/microsoft", icon: "Cloud", label: "Microsoft 365", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/import", icon: "Upload", label: "Import Data", roles: ["admin", "receptionist"] },
    ],
    integrations: [
      {
        id: "supabase",
        name: "Supabase",
        description: "FHIR resources, integration channels, message transactions",
        status: "connected",
        impact: "No FHIR storage or integration data",
        fallback: "None — required",
        envKeys: ["DATABASE_URL"],
      },
      {
        id: "fhir-server",
        name: "FHIR R4 Server",
        description: "HL7 FHIR R4 compliant API for healthcare interoperability",
        status: "connected",
        impact: "No FHIR data exchange with external systems",
        fallback: "CSV/manual data exchange",
      },
      {
        id: "careon",
        name: "CareOn Bridge",
        description: "Clinical workflow integration with CareOn platform",
        status: "connected",
        impact: "No CareOn clinical data sync",
        fallback: "Manual clinical data entry",
        envKeys: ["CAREON_API_KEY"],
      },
      {
        id: "microsoft365",
        name: "Microsoft 365",
        description: "Teams, Mail, OneDrive, Calendar, Excel integration",
        status: "needs_setup",
        impact: "No Office 365 sync (Teams, Mail, OneDrive)",
        fallback: "In-app tools only",
        envKeys: ["MICROSOFT_CLIENT_ID", "MICROSOFT_CLIENT_SECRET", "MICROSOFT_TENANT_ID"],
        setupHint: "Register app in Azure AD. Requires admin consent for org-wide access.",
      },
    ],
    agentContext: {
      scope: "System integrations, FHIR interoperability, CareOn, Microsoft 365, data import/export",
      capabilities: [
        "Test FHIR API endpoints",
        "Monitor integration channel health",
        "Import data from CSV, HEAL, or external systems",
        "Configure CareOn Bridge connections",
        "Set up Microsoft 365 integration",
        "View integration map and data flow",
      ],
    },
  },

  /* ────────────────────────────────────────────────────────────── */
  /* MODULE 7: LEARNING ENGINE                                      */
  /* ────────────────────────────────────────────────────────────── */
  {
    id: "learning-engine",
    name: "Learning Engine",
    shortName: "Learn",
    description: "Background ML pipeline — observes claims, evaluates predictions, updates scheme rules, refreshes RAG knowledge.",
    icon: "Brain",
    color: "#6366F1",
    badge: "ML",
    badgeColor: "indigo",
    roles: ["admin", "platform_admin"],
    isBackground: true,
    pages: [
      { href: "/dashboard/ml-status", icon: "Activity", label: "Learning Status", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/ml-history", icon: "Clock", label: "Learning History", roles: ["admin", "platform_admin"] },
      { href: "/dashboard/ai-governance", icon: "Shield", label: "AI Governance", roles: ["admin", "platform_admin"] },
    ],
    integrations: [
      {
        id: "supabase-pgvector",
        name: "Supabase + pgvector",
        description: "Learning events, embeddings, scheme rules storage",
        status: "connected",
        impact: "No learning storage or vector search",
        fallback: "None — required for ML pipeline",
        envKeys: ["DATABASE_URL"],
      },
      {
        id: "ai-model",
        name: "AI Model (Embedding)",
        description: "Generate embeddings for RAG knowledge refresh",
        status: "connected",
        impact: "Cannot refresh RAG knowledge base",
        fallback: "Static knowledge base (no learning)",
        envKeys: ["GOOGLE_GENERATIVE_AI_API_KEY"],
      },
      {
        id: "vercel-cron",
        name: "Vercel Cron Jobs",
        description: "Daily learning cycle trigger (/api/ml/reinforce)",
        status: "connected",
        impact: "Learning cycle doesn't auto-run",
        fallback: "Manual trigger via API",
        envKeys: ["CRON_SECRET"],
      },
    ],
    agentContext: {
      scope: "ML pipeline monitoring, learning accuracy, RAG knowledge health, scheme rule updates",
      capabilities: [
        "Check learning pipeline status and last run",
        "View prediction accuracy over time",
        "Trigger manual re-embedding of knowledge base",
        "Review scheme rule updates from learning",
        "Monitor PII scrubbing compliance",
        "View learning event history and patterns",
      ],
    },
  },
];

/* ─── Executive pages (not in a module — top-level) ─── */
export const EXECUTIVE_PAGES: { href: string; icon: string; label: string; roles: string[] }[] = [
  { href: "/dashboard/executive", icon: "BarChart3", label: "Executive View", roles: ["admin", "platform_admin"] },
  { href: "/dashboard/financial-director", icon: "DollarSign", label: "Financial Director", roles: ["admin", "platform_admin"] },
  { href: "/dashboard/board-pack", icon: "FileBarChart", label: "Board Pack", roles: ["admin", "platform_admin"] },
  { href: "/dashboard/architecture", icon: "Cable", label: "Architecture", roles: ["admin", "platform_admin"] },
  { href: "/dashboard/cio", icon: "Globe", label: "CIO Dashboard", roles: ["admin", "platform_admin"] },
  { href: "/dashboard/product-map", icon: "Layers", label: "Product Map", roles: ["admin", "platform_admin"] },
  { href: "/dashboard/suite", icon: "Boxes", label: "Product Suite", roles: ["admin", "platform_admin"] },
  { href: "/dashboard/clinical-quality", icon: "Stethoscope", label: "Clinical Quality", roles: ["admin", "doctor", "platform_admin"] },
  { href: "/dashboard/partnership", icon: "Heart", label: "Partnership", roles: ["admin", "platform_admin"] },
  { href: "/dashboard/business-development", icon: "TrendingUp", label: "Business Dev", roles: ["admin", "platform_admin"] },
  { href: "/dashboard/pitch", icon: "Rocket", label: "Pitch Deck", roles: ["admin", "platform_admin"] },
  { href: "/dashboard/resources", icon: "BookOpen", label: "Resources", roles: ["admin", "platform_admin"] },
  { href: "/dashboard/pilot", icon: "Rocket", label: "Start Pilot", roles: ["admin", "platform_admin"] },
];

/* ─── Registry API ─── */

export function createModuleRegistry(): ModuleRegistry {
  return {
    modules: MODULE_DEFINITIONS,

    getModule(id: string) {
      return MODULE_DEFINITIONS.find((m) => m.id === id);
    },

    getModulesForRole(role: string) {
      return MODULE_DEFINITIONS.filter((m) => m.roles.includes(role));
    },

    getModuleForRoute(pathname: string) {
      for (const mod of MODULE_DEFINITIONS) {
        const match = mod.pages.find(
          (p) => pathname === p.href || pathname.startsWith(p.href + "/")
        );
        if (match) return mod;
      }
      return undefined;
    },
  };
}

export const moduleRegistry = createModuleRegistry();
