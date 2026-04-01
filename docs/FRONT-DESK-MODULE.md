# Front Desk Module — Netcare Health OS

> Self-contained product surface for reception staff. One link, everything they need.

## Why This Exists

Netcare Health OS had all 10 front desk features built — check-in, bookings, calendar, daily tasks, notifications, recall, eligibility verification, WhatsApp agent, engagement sequences, and Google Calendar sync. But they were **scattered across 6+ separate pages**. A receptionist had to jump between pages to do their job.

The Front Desk Module solves this by:
1. **Bundling everything** into a single hub page at `/dashboard/front-desk`
2. **Adding a dedicated AI agent** that can perform all reception operations via natural language
3. **Showing integration status** so the client knows exactly what's connected and what needs setup
4. **Automating patient engagement** with a 7-tier post-visit care sequence

## Architecture

```
/dashboard/front-desk/                    Hub page (aggregator)
/dashboard/front-desk/connections/        Integration connection panel
/dashboard/front-desk/engagement/         Patient care sequence viewer

/api/front-desk/connections              GET/POST — integration status + config
/api/front-desk/engagement               GET/POST — engagement enrollments
/api/agents/front-desk                   POST — AI agent chat
```

Existing pages (bookings, checkin, calendar, etc.) remain unchanged. The hub **aggregates** data from existing APIs — no logic duplication.

## Hub Page (`/dashboard/front-desk`)

What the receptionist sees when they open the module:

### Integration Status Strip
Horizontal bar showing 7 integrations with colored dots (green = connected, grey = disconnected). Click to go to connections page.

### Quick Stats
4 cards: Patients Waiting, Today's Bookings, Active Care Sequences, Overdue Recalls.

### Mini Check-In Kanban
Compact 3-column board (Waiting | In Consult | Done). Click a card to move it to the next status. Links to the full board.

### Today's Appointments
List of today's bookings with inline actions: Confirm, Check In, Cancel. Status badges show pending/confirmed.

### Patient Care Sequences
Active engagement enrollments with step progress dots. Escalation alerts for patients who reported side effects.

### Quick Actions (sticky bottom bar)
4 buttons always visible: New Booking, Walk-In, Verify Medical Aid, Import Queue.

### AI Agent (slide-in panel)
Chat interface on the right side. Suggested questions on first open. Streams responses from the frontdesk agent.

## Connection Panel (`/dashboard/front-desk/connections`)

Shows the client exactly what's connected for this module. Each integration card displays:

| Integration | Status Source | What It Powers |
|------------|--------------|----------------|
| **Supabase** | Always connected | All data storage |
| **WhatsApp (Twilio)** | `TWILIO_ACCOUNT_SID` env var | Confirmations, reminders, patient chat, engagement sequences |
| **Email (Resend)** | `RESEND_API_KEY` env var | Booking confirmations, follow-ups, review requests |
| **Google Calendar** | `Practice.integrations` JSON | Bidirectional calendar sync |
| **HEAL System** | `Practice.integrations` JSON | Booking import from HEAL PMS |
| **Healthbridge** | `HEALTHBRIDGE_*` env vars | Real-time medical aid eligibility verification |
| **AI Models** | `AI_GATEWAY_API_KEY` or provider keys | Front Desk Agent, patient chatbot, triage |

Each card shows: status badge, what it powers, what breaks without it, and a configure/connect action.

### Configuration
- **Env-based integrations** (Twilio, Resend, Healthbridge, AI): Configured in Vercel dashboard or `.env.local`
- **Practice-based integrations** (HEAL, Google Calendar): Saved per-practice in the `Practice.integrations` JSON field via the POST endpoint

## Front Desk AI Agent

New agent type `"frontdesk"` added to the existing agent system.

### Capabilities (18 tools)
- Book, confirm, reschedule, cancel appointments
- Check patients in, move through Kanban states
- Verify medical aid eligibility via Healthbridge
- Send WhatsApp/email notifications
- Manage daily task checklists
- View and search patient records
- Check today's schedule and available slots
- Enroll patients in post-visit engagement sequences
- Check recall list for overdue patients
- View integration connection status

### System Prompt
Optimized for receptionists — friendly, efficient, confirms before actions. Knows the SA healthcare context (WhatsApp primary, POPIA compliance, 10177 emergency number).

### Files
- `src/lib/ai/personas.ts` — `FRONTDESK_AGENT` persona definition
- `src/lib/agents.ts` — `"frontdesk"` type + action detection
- `src/app/api/agents/front-desk/route.ts` — API endpoint

## Patient Engagement — 7-Tier Post-Visit Care

Automated sequence that fires when a booking is completed. Uses the existing engagement sequence engine (`lib/engagement/sequence-engine.ts`).

| Step | Timing | Message | AI Triage? |
|------|--------|---------|------------|
| 1 | Immediately | Visit summary | No |
| 2 | Day 1 | Pharmacy reminder | No |
| 3 | Day 7 | Side effects check | **Yes** — if patient replies YES, escalates to triage agent |
| 4 | Day 25 | Refill prompt | No |
| 5 | Monthly | Chronic vitals check | No |
| 6 | Quarterly | Lab test due | No |
| 7 | Annual | Screening reminder | No |

### How It Works
1. Patient completes appointment (booking status → completed)
2. `booking_completed` trigger fires in the sequence engine
3. Patient is auto-enrolled in the Post-Visit Care sequence
4. Steps execute on schedule via existing 15-minute engagement cron (`/api/engagement/cron`)
5. WhatsApp is primary channel; falls back to email if unavailable
6. Step 3 (Day 7) has AI triage: if patient reports side effects, the enrollment is escalated and the triage agent is notified

### Files
- `src/lib/engagement/templates/post-visit-care.ts` — Sequence template + seed function
- `src/app/api/front-desk/engagement/route.ts` — Enrollment management API
- `src/app/dashboard/front-desk/engagement/page.tsx` — Viewer with 7-step progress

## Navigation

New "FRONT DESK" section in the dashboard sidebar (between AI PRODUCTS and OPERATIONS):

```
FRONT DESK [NEW]
  Front Desk Hub      /dashboard/front-desk          receptionist, nurse, admin
  Connections          /dashboard/front-desk/connections   receptionist, admin
  Patient Care         /dashboard/front-desk/engagement    receptionist, nurse, admin
```

## Demo Mode

All new API routes support demo mode (`DEMO_MODE=true`):
- Connections: Returns Supabase, Email, AI as connected; others disconnected
- Engagement: Returns 3 demo enrollments (active, active, escalated)
- Agent: Runs through the real agent with `isDemoMode` flag

## Dependencies

No new packages. Uses existing:
- `framer-motion` — Animations
- `lucide-react` — Icons
- `@/lib/agents` — Agent system
- `@/lib/ai/personas` — Persona definitions
- `@/lib/engagement/sequence-engine` — Engagement automation
- `@/lib/booking-engine` — Reminder timing
- `@/lib/api-helpers` — Auth guards, rate limiting

## File Inventory

### New Files (10)
| File | Lines | Purpose |
|------|-------|---------|
| `src/app/dashboard/front-desk/page.tsx` | ~660 | Hub page |
| `src/app/dashboard/front-desk/connections/page.tsx` | ~250 | Connection panel |
| `src/app/dashboard/front-desk/engagement/page.tsx` | ~275 | Patient care viewer |
| `src/app/api/front-desk/connections/route.ts` | ~175 | Integration status API |
| `src/app/api/front-desk/engagement/route.ts` | ~180 | Engagement enrollment API |
| `src/app/api/agents/front-desk/route.ts` | ~50 | Agent chat API |
| `src/lib/engagement/templates/post-visit-care.ts` | ~145 | 7-tier sequence template |

### Modified Files (3)
| File | Change |
|------|--------|
| `src/lib/agents.ts` | Added `"frontdesk"` type, persona mapping, action detection |
| `src/lib/ai/personas.ts` | Added `FRONTDESK_AGENT` persona (12 tools, reception prompt) |
| `src/components/dashboard/DashboardSidebar.tsx` | Added "FRONT DESK" nav section with 3 items |
