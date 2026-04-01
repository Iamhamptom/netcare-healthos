# Health OS Module System

> Redesigning 130+ menu items into 7 self-contained module apps, each with its own navigation, integration status, and scoped AI agent.

## Why We Built This

The original sidebar had **~130 menu items** across 9 flat sections. Every role saw the same wall of links. There was no clear story for clients about what integrations power each feature, and no way for front desk staff to understand what's connected.

### Problems Solved

1. **Cognitive overload**: 130 items reduced to 7 module cards at top level (~20 items visible), then 8-14 items per module when drilled in
2. **No integration visibility**: Clients couldn't see what was connected. Now each module has a Connections page showing live/needs-setup/stubbed status
3. **Agent scope confusion**: One giant agent with no context. Now the super-agent automatically loads module-specific context, capabilities, and priority tools
4. **Onboarding story**: Each module is a sellable unit with clear integration requirements and fallbacks

## Architecture

### 7 Modules

| Module | ID | Pages | Integrations | Primary Users |
|---|---|---|---|---|
| Practice Manager | `practice-manager` | 12 (numbered steps) | 5 | Admin, Receptionist, Nurse |
| Claims Engine | `claims-engine` | 14 | 5 | Admin, Receptionist, Doctor |
| Patient Care | `patient-care` | 10 | 5 | All clinical roles |
| Engagement | `engagement` | 7 | 4 | Admin, Platform Admin |
| Intelligence | `intelligence` | 10 | 2 | Admin, Doctor, Platform Admin |
| Integrations | `integrations` | 9 | 4 | Admin, Platform Admin |
| Learning Engine | `learning-engine` | 3 (background) | 3 | Admin, Platform Admin |

Plus **13 Executive pages** (Board Pack, Architecture, CIO, etc.) that sit outside modules at the top level.

### Files

```
src/lib/modules/
  types.ts              -- TypeScript types (ModuleDefinition, ModuleIntegration, ModuleRegistry)
  registry.ts           -- 7 module definitions + registry API (getModule, getModulesForRole, getModuleForRoute)

src/components/dashboard/
  ModuleSidebar.tsx      -- New drill-in sidebar (replaces DashboardSidebar)
  DashboardSidebar.tsx   -- Old sidebar (kept as backup)

src/app/dashboard/modules/[moduleId]/
  connections/page.tsx   -- Per-module integration status dashboard
  agent/page.tsx         -- Per-module agent chat page

src/app/api/modules/[moduleId]/
  chat/route.ts          -- Module-scoped agent API (wraps runIntelligence with module context)

src/app/dashboard/layout.tsx  -- Modified to use ModuleSidebar
```

### How Navigation Works

**Top Level** (no module selected):
- 7 module cards with colored icons, badges, and health dots (green = all connected, amber = needs attention)
- Executive section (Board Pack, Architecture, CIO, etc.)
- Settings

**Drilled In** (module selected):
- Back arrow ("Back to Health OS") to return
- Module header with icon, name, badge, and description
- Module's pages listed (Practice Manager shows numbered steps 1-12)
- "Module Status" section at bottom:
  - **Connections** link with `3/5` badge
  - **Module Agent** link

**Auto-detection**: When navigating to a URL that belongs to a module (e.g., `/dashboard/daily`), the sidebar automatically drills into that module.

### Module Registry

Each module definition includes:

```typescript
{
  id: "practice-manager",
  name: "Practice Manager",
  shortName: "Practice",
  description: "...",
  icon: "ClipboardList",
  color: "#3DA9D1",
  badge: "CORE",
  roles: ["admin", "receptionist", "nurse"],
  pages: [
    { href: "/dashboard/daily", icon: "Sunrise", label: "Morning Checklist", step: 1 },
    // ...
  ],
  integrations: [
    { id: "supabase", name: "Supabase", status: "connected", impact: "Everything breaks", fallback: "None" },
    { id: "whatsapp", name: "WhatsApp Business API", status: "needs_setup", ... },
    // ...
  ],
  agentContext: {
    scope: "Daily practice operations, staff management...",
    capabilities: ["Generate daily task checklists...", ...],
    priorityTools: ["search_patients", ...],
  },
}
```

### Connections Page (`/dashboard/modules/[moduleId]/connections`)

Each module has a connections page showing:
- **Health ring**: Visual percentage (e.g., 60% = 3/5 connected)
- **Agent prompt**: "2 integrations need attention. Want me to help?"
- **Integration cards** sorted by status:
  - Connected (green border) -- shows impact, fallback, env keys
  - Needs Setup (amber) -- shows setup hint + "Connect" button
  - Stubbed (blue) -- planned but not yet built
  - Inactive (gray) -- disabled

### Module Agent (`/dashboard/modules/[moduleId]/agent`)

- Same super-agent (COMMAND_ASSISTANT with ALL tools)
- Module context injected via `buildModuleContext()` into `extraContext`
- Agent knows: which module it's in, what's connected, what capabilities to prioritize
- **Can** cross-reference other modules (it has all tools), but defaults to current module's scope
- Thread persistence via `AiThread` + `AiMessage` tables (persona: `module-{moduleId}`)
- Quick-action buttons pulled from module capabilities
- Tools used shown as badges on agent responses

### API: `POST /api/modules/[moduleId]/chat`

```json
// Request
{ "message": "Check clinic KPIs", "threadId": "optional" }

// Response
{
  "reply": "Here are your KPIs...",
  "threadId": "thread-123",
  "toolsUsed": ["get_analytics", "search_patients"],
  "provider": "gemini",
  "stepsUsed": 3,
  "module": { "id": "practice-manager", "name": "Practice Manager" }
}
```

## Design Decisions

### Why modules, not just reorganized sections?
Sections are just visual grouping. Modules are **bounded contexts** -- each has its own integration surface, agent scope, and onboarding story. You can sell a module to a client: "Here's your Claims Engine. Here's what we connected for you."

### Why one super-agent, not separate agents per module?
Separate agents can't cross-reference. A Practice Manager agent couldn't look up a claim. The hybrid approach gives module-scoped context to a full-power agent -- best of both worlds.

### Why numbered steps in Practice Manager?
The 12 steps map to the admin's daily workflow (morning checklist to end-of-day close). Numbering creates a natural flow -- admin knows exactly where they are in their day.

### Why static integration status (not live checks)?
Integration status is defined in the registry, not checked dynamically. This is intentional for v1 -- it reflects the configured state, not runtime health. Dynamic health checks can be added later via `/api/health` endpoint per integration.
