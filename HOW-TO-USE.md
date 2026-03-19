# Netcare Health OS — How to Use Guide

## For: Any agent, system, or team member working on this platform

---

## Quick Start

**Live URL**: https://netcare-healthos.vercel.app
**Login**: thirushen.pillay@netcare.co.za / Netcare2026!
**Repo**: https://github.com/Iamhamptom/netcare-healthos
**Stack**: Next.js 16, TypeScript, Tailwind CSS 4, Framer Motion
**Deploy**: Vercel (corpo1 team), auto-deploys on push to main
**Mode**: DEMO_MODE=true (in-memory data, no persistent database)

---

## Architecture

```
src/
  app/
    dashboard/           # All authenticated pages
      page.tsx           # Main dashboard (stat cards, welcome banner)
      network/           # Financial Command Center (5 tabs)
      kpi/               # FD KPI Dashboard (30+ metrics)
      savings/           # Savings Odometer (animated counter)
      suite/             # Module listing + value chain
      pilot/             # Regional pilot onboarding flow
      board-pack/        # Board presentation generator
      intel/             # Bloomberg-style intelligence terminal
      daily/             # Daily tasks (FD workflow)
      patients/          # Multi-site patient management
      billing/           # Claims + ICD-10 + invoices
      conversations/     # WhatsApp patient router
      analytics/         # Practice metrics
      settings/          # Practice configuration
    login/               # Login page
    about/               # About page
    page.tsx             # Landing page
  components/
    dashboard/
      DashboardSidebar   # Left nav with Netcare branding
      DashboardHeader    # Top bar with practice name
      FeatureGuide       # Jess AI guide (NDA + welcome + page context)
      NetcareAssistant   # AI chatbot (bottom-right)
      StatCard           # Reusable stat card component
    Hero, Features, etc  # Landing page components
  lib/
    demo-data.ts         # ALL demo data (practice, patients, invoices, tasks)
    is-demo.ts           # DEMO_MODE check
    api-helpers.ts       # guardRoute (auth + demo mode handling)
    auth.ts              # JWT session management
    db.ts                # Database layer (Supabase or Prisma)
```

## Key Files to Modify

| What to change | File |
|---------------|------|
| Demo user/practice | src/lib/demo-data.ts (demoPractice, demoUser) |
| Demo patients | src/lib/demo-data.ts (demoPatients) |
| Demo conversations | src/lib/demo-data.ts (demoConversations) |
| Demo daily tasks | src/lib/demo-data.ts (_demoDailyTasks) |
| Login credentials | src/app/api/auth/login/route.ts (validDemoLogins) |
| Colors/branding | src/app/globals.css (:root variables) |
| Sidebar nav | src/components/dashboard/DashboardSidebar.tsx (allNavItems) |
| Jess welcome | src/components/dashboard/FeatureGuide.tsx (WELCOME_SEQUENCE) |
| Jess page guides | src/components/dashboard/FeatureGuide.tsx (PAGE_CONTEXTS) |
| Chatbot responses | src/components/dashboard/NetcareAssistant.tsx (getResponse) |
| Network KPIs | src/app/dashboard/network/page.tsx (DIVISION_KPIs) |
| FD KPIs | src/app/dashboard/kpi/page.tsx (REVENUE_KPIs, etc.) |
| Savings data | src/app/dashboard/savings/page.tsx (MONTHLY_SAVINGS) |
| Board pack | src/app/dashboard/board-pack/page.tsx (BOARD_SECTIONS) |
| Intel data | src/app/dashboard/intel/page.tsx (MARKET_INDICATORS, etc.) |

## How Demo Mode Works

When DEMO_MODE=true (set on Vercel):
1. Login accepts hardcoded credentials (no database needed)
2. /api/auth/me returns demoUser with demoPractice
3. guardRoute returns demo user data for all API routes
4. All API routes check isDemoMode and return demoStore data
5. demoStore is an in-memory mutable store (resets on redeploy)

## Deployment

```bash
# Deploy to production
vercel --prod --scope corpo1 --yes

# Set environment variable
printf 'value' | vercel env add NAME production --scope corpo1 --yes

# Pull env vars locally
vercel env pull .env.local --scope corpo1 --yes
```

## Research Documents

- NETCARE-ECOSYSTEM-COMPLETE-INTEL.md (654 lines — divisions, tech, digital strategy)
- THIRUSHEN-PILLAY-COMPLETE-PROFILE.md (500+ lines — KPIs, reporting, frustrations)
- COMPETITOR_LANDSCAPE_RESEARCH.md (global competitors, market data)

## White-Label Playbook

To create a new client demo, see: ~/.claude/projects/-Users-hga/memory/project_white_label_playbook.md
