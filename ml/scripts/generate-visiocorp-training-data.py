#!/usr/bin/env python3
"""
VisioCorp Training Data Generator
Extracts Q&A pairs from:
1. Claude Code session JSONLs (conversation history)
2. Strategy/research documents (markdown → Q&A)
3. Product documentation (registry → product knowledge)
4. Outreach templates (pitch → response pairs)
5. Memory files (institutional knowledge)

Output: JSONL files formatted for LoRA fine-tuning (OpenAI chat format)
"""

import json
import os
import glob
import re
import hashlib
from pathlib import Path
from datetime import datetime

# ─── Configuration ───────────────────────────────────────────────────────────

HOME = os.path.expanduser("~")
OUTPUT_DIR = os.path.join(HOME, "netcare-healthos/ml/training-data/visiocorp")

SYSTEM_PROMPT = """You are VisioCorp AI — the intelligence engine for VisioCorp, Africa's AI adoption vehicle for independent business. You know:

PRODUCTS (25+):
- Visio Workspace: Chairman command center (51 pages, 178 AI tools)
- Netcare Health OS: Healthcare AI platform (247 pages, 7 AI products, R139M/yr ROI)
- HealthOps Platform: White-label clinic OS (24 pages, 5 AI agents)
- Claims Analyzer: Pre-submission claims validation (427 ICD-10-ZA codes)
- V-Prai: PR lead gen & bookings (6 pricing tiers, Yoco payments)
- Visio Charts: SA music intelligence (Spotify+Apple+YouTube+TikTok+Radio)
- Visio Intel: Bloomberg for Africa (58 pages, 625+ intelligence records)
- Visio Agency: 5 AI services for agencies (Reports, Content, Optimize, Intelligence, Agents)
- VisioPitch: AI pitch deck builder (Gemini 2.5 Pro)
- Ciza's Palace: Artist platform for CIZA (48 pages, Roman Empire theme)

ORGANIZATIONS:
- VisioCorp: The builder (technology)
- Visio Research Labs (VRL): The brain (research, training camps)
- Corpo: The business arm (enterprise deals)
- Hampton Music: Entertainment (artist platforms, events)

BUSINESS MODEL: McDonald's franchise model — license fees (R50K-R1M), monthly platform fees (R15K-R50K/mo), data plans, training camps. NO revenue share.

HEALTH CLAIMS EXPERTISE: ICD-10-ZA (41K codes), NAPPI (487K medicines), EDIFACT MEDCLM switching, Medical Schemes Act, 76 schemes, 3 switching houses, POPIA 2026.

MISSION: "Everyone has the right to compete, fairly." AI is the equalizer for independent business.

You speak with authority, cite specific data, and represent VisioCorp professionally. You are Dr. Hampton's AI — precise, direct, no fluff."""

SOURCES = {
    "sessions": os.path.join(HOME, ".claude/projects/-Users-hga/*.jsonl"),
    "memory": os.path.join(HOME, ".claude/projects/-Users-hga/memory/*.md"),
    "steinberg_kb": os.path.join(HOME, "visio-workspace/steinberg/*.md"),
    "steinberg_openai": os.path.join(HOME, "visio-workspace/steinberg/openai/*.md"),
    "outreach": os.path.join(HOME, "visio-workspace/steinberg/outreach/*.md"),
    "health_kb": os.path.join(HOME, "netcare-healthos/docs/knowledge/*.md"),
    "research_docs": os.path.join(HOME, "netcare-healthos/docs/*.md"),
    "strategy_docs": os.path.join(HOME, "netcare-healthos/*.md"),
    "registry": os.path.join(HOME, "visio-workspace/lib/platform/registry.ts"),
    # Workspace source code
    "workspace_lib": os.path.join(HOME, "visio-workspace/lib/**/*.ts"),
    "workspace_api": os.path.join(HOME, "visio-workspace/app/api/**/*.ts"),
    "workspace_pages": os.path.join(HOME, "visio-workspace/app/(workspace)/**/page.tsx"),
    "workspace_claude_md": os.path.join(HOME, "visio-workspace/CLAUDE.md"),
    # Other product repos
    "healthops_lib": os.path.join(HOME, "healthops-platform/src/lib/**/*.ts"),
    "ciza_lib": os.path.join(HOME, "Ciza-s-Palace/lib/**/*.ts"),
    "vprai_lib": os.path.join(HOME, "visio-lead-gen/lib/**/*.ts"),
    "netcare_lib": os.path.join(HOME, "netcare-healthos/src/lib/**/*.ts"),
}


def make_pair(user_msg: str, assistant_msg: str, source: str = "") -> dict:
    """Create a training pair in OpenAI chat format."""
    return {
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_msg.strip()},
            {"role": "assistant", "content": assistant_msg.strip()},
        ],
        "metadata": {"source": source, "generated": datetime.now().isoformat()},
    }


def extract_from_sessions() -> list[dict]:
    """Extract Q&A pairs from Claude Code session JSONLs."""
    pairs = []
    session_files = sorted(glob.glob(SOURCES["sessions"]), key=os.path.getmtime, reverse=True)

    # Process the 20 most recent sessions
    for fpath in session_files[:20]:
        fname = os.path.basename(fpath)
        messages = []

        try:
            with open(fpath) as f:
                for line in f:
                    try:
                        msg = json.loads(line)
                        mtype = msg.get("type", "")

                        if mtype == "user":
                            content = msg.get("message", {}).get("content", "")
                            if isinstance(content, str) and len(content) > 20:
                                # Filter out system reminders
                                if not content.strip().startswith("<system"):
                                    messages.append({"role": "user", "content": content[:2000]})

                        elif mtype == "assistant":
                            data = msg.get("message", {})
                            content = data.get("content", "")
                            if isinstance(content, list):
                                # Extract text blocks from assistant content
                                text_parts = []
                                for part in content:
                                    if isinstance(part, dict) and part.get("type") == "text":
                                        text_parts.append(part["text"])
                                content = "\n".join(text_parts)

                            if isinstance(content, str) and len(content) > 50:
                                messages.append({"role": "assistant", "content": content[:3000]})
                    except json.JSONDecodeError:
                        continue

            # Create pairs from consecutive user→assistant messages
            for i in range(len(messages) - 1):
                if messages[i]["role"] == "user" and messages[i + 1]["role"] == "assistant":
                    user_text = messages[i]["content"]
                    asst_text = messages[i + 1]["content"]

                    # Skip very short or system-like messages
                    if len(user_text) > 20 and len(asst_text) > 50:
                        pairs.append(make_pair(user_text, asst_text, f"session:{fname[:8]}"))

        except Exception as e:
            print(f"  Skipping {fname}: {e}")

    return pairs


def extract_from_markdown(pattern: str, source_name: str) -> list[dict]:
    """Extract Q&A pairs from markdown documents by generating questions from content."""
    pairs = []

    for fpath in glob.glob(pattern):
        try:
            with open(fpath) as f:
                content = f.read()
        except:
            continue

        fname = os.path.basename(fpath)

        # Skip very small files
        if len(content) < 200:
            continue

        # Extract sections (## headers)
        sections = re.split(r'^##\s+', content, flags=re.MULTILINE)

        for section in sections[1:]:  # Skip preamble
            lines = section.strip().split("\n")
            if not lines:
                continue

            title = lines[0].strip()
            body = "\n".join(lines[1:]).strip()

            if len(body) < 100:
                continue

            # Generate a natural question from the section title
            questions = generate_questions(title, fname)

            for q in questions:
                pairs.append(make_pair(q, body[:2000], f"{source_name}:{fname}"))

    return pairs


def generate_questions(title: str, filename: str) -> list[str]:
    """Generate natural questions from a section title."""
    title_lower = title.lower()
    questions = []

    # Product-related
    if any(w in title_lower for w in ["product", "feature", "capability"]):
        questions.append(f"What are the {title}?")
        questions.append(f"Tell me about {title}")

    # Strategy-related
    elif any(w in title_lower for w in ["strategy", "pitch", "approach", "plan"]):
        questions.append(f"What is our {title}?")
        questions.append(f"Explain the {title}")

    # Financial
    elif any(w in title_lower for w in ["revenue", "pricing", "cost", "roi", "ebitda", "financial"]):
        questions.append(f"What are the {title} numbers?")
        questions.append(f"Break down the {title}")

    # Technical
    elif any(w in title_lower for w in ["api", "database", "architecture", "stack", "integration"]):
        questions.append(f"How does {title} work?")
        questions.append(f"Explain the {title} setup")

    # People/contacts
    elif any(w in title_lower for w in ["contact", "team", "stakeholder", "client"]):
        questions.append(f"Who are the {title}?")

    # Default
    else:
        questions.append(f"What is {title}?")
        questions.append(f"Tell me about {title}")

    return questions


def extract_from_outreach(pattern: str) -> list[dict]:
    """Extract pitch/outreach templates as training data."""
    pairs = []

    for fpath in glob.glob(pattern):
        try:
            with open(fpath) as f:
                content = f.read()
        except:
            continue

        fname = os.path.basename(fpath)

        # Split by company sections (### headers)
        companies = re.split(r'^###\s+\d+\.\s+', content, flags=re.MULTILINE)

        for company_section in companies[1:]:
            lines = company_section.strip().split("\n")
            company_name = lines[0].strip()
            body = "\n".join(lines[1:]).strip()

            if len(body) < 100:
                continue

            # Generate pitch-related Q&A
            pairs.append(make_pair(
                f"Draft an outreach email for {company_name}",
                body[:2000],
                f"outreach:{fname}"
            ))
            pairs.append(make_pair(
                f"What's our pitch strategy for {company_name}?",
                body[:2000],
                f"outreach:{fname}"
            ))

    return pairs


def extract_from_code(patterns: list[str], source_name: str) -> list[dict]:
    """Extract Q&A pairs from TypeScript/TSX source files.
    Generates knowledge about how the system works — API routes, tools, libraries.
    """
    pairs = []

    for pattern in patterns:
        for fpath in glob.glob(pattern, recursive=True):
            try:
                with open(fpath) as f:
                    content = f.read()
            except:
                continue

            # Skip tiny or generated files
            if len(content) < 200 or "/generated/" in fpath or "/node_modules/" in fpath:
                continue

            fname = os.path.basename(fpath)
            rel_path = os.path.relpath(fpath, HOME)

            # Extract module purpose from comments/JSDoc at top of file
            top_comment = ""
            comment_match = re.search(r'/\*\*(.*?)\*/', content[:1000], re.DOTALL)
            if comment_match:
                top_comment = comment_match.group(1).strip()
                top_comment = re.sub(r'\n\s*\*\s*', '\n', top_comment).strip()

            # Extract exported functions/classes
            exports = re.findall(r'export\s+(?:async\s+)?(?:function|const|class)\s+(\w+)', content)

            # Extract tool definitions (for agent-tools.ts etc)
            tool_defs = re.findall(r'(\w+):\s*tool\(\{[^}]*description:\s*["\']([^"\']+)["\']', content)

            # Extract route handler info (for API routes)
            route_methods = re.findall(r'export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE)', content)

            # Build a description of this file
            desc_parts = []
            if top_comment:
                desc_parts.append(top_comment[:500])
            if exports:
                desc_parts.append(f"Exports: {', '.join(exports[:15])}")
            if tool_defs:
                tool_descriptions = [f"- {name}: {desc}" for name, desc in tool_defs[:20]]
                desc_parts.append("AI Tools defined:\n" + "\n".join(tool_descriptions))
            if route_methods:
                desc_parts.append(f"HTTP methods: {', '.join(route_methods)}")

            if not desc_parts:
                desc_parts.append(content[:800])

            description = "\n".join(desc_parts)

            # Generate Q&A pairs
            if "api/" in rel_path:
                # API route
                route_path = re.sub(r'.*/app/', '/', rel_path)
                route_path = re.sub(r'/route\.ts$', '', route_path)
                pairs.append(make_pair(
                    f"What does the {route_path} API route do?",
                    f"File: {rel_path}\n\n{description}",
                    f"{source_name}:{fname}"
                ))
            elif tool_defs:
                # Tool definitions file
                pairs.append(make_pair(
                    f"What AI tools are defined in {fname}?",
                    f"File: {rel_path}\n\n{description}",
                    f"{source_name}:{fname}"
                ))
                # Individual tool Q&A
                for tool_name, tool_desc in tool_defs[:30]:
                    pairs.append(make_pair(
                        f"What does the {tool_name} tool do?",
                        f"The {tool_name} tool: {tool_desc}\n\nDefined in: {rel_path}",
                        f"{source_name}:tool:{tool_name}"
                    ))
            elif "page.tsx" in fname:
                # Page component
                page_path = re.sub(r'.*/app/', '/', rel_path)
                page_path = re.sub(r'/page\.tsx$', '', page_path)
                pairs.append(make_pair(
                    f"What is the {page_path} page?",
                    f"File: {rel_path}\n\n{description}",
                    f"{source_name}:{fname}"
                ))
            else:
                # Library module
                pairs.append(make_pair(
                    f"What does {fname} do in the codebase?",
                    f"File: {rel_path}\n\n{description}",
                    f"{source_name}:{fname}"
                ))

    return pairs


def extract_deep_project_knowledge() -> list[dict]:
    """Extract comprehensive Q&A from EVERY memory file — projects, goals, people, strategy."""
    pairs = []
    memory_dir = os.path.join(HOME, ".claude/projects/-Users-hga/memory")

    for fpath in glob.glob(os.path.join(memory_dir, "*.md")):
        if os.path.basename(fpath) == "MEMORY.md":
            continue

        try:
            with open(fpath) as f:
                content = f.read()
        except:
            continue

        fname = os.path.basename(fpath)
        if len(content) < 100:
            continue

        # Parse frontmatter
        name = fname.replace(".md", "").replace("_", " ").replace("project ", "").title()
        desc = ""
        fm_match = re.search(r'^---\n(.*?)\n---', content, re.DOTALL)
        if fm_match:
            for line in fm_match.group(1).split("\n"):
                if line.startswith("name:"):
                    name = line.split(":", 1)[1].strip()
                elif line.startswith("description:"):
                    desc = line.split(":", 1)[1].strip()

        # Strip frontmatter from content
        body = re.sub(r'^---\n.*?\n---\n', '', content, flags=re.DOTALL).strip()
        if len(body) < 50:
            continue

        # Generate contextual Q&A pairs based on file type
        if "project_" in fname:
            pairs.append(make_pair(
                f"Tell me everything about {name}",
                body[:3000],
                f"deep_project:{fname}"
            ))
            pairs.append(make_pair(
                f"What is the current status of {name}?",
                body[:2000],
                f"deep_project:{fname}"
            ))
            pairs.append(make_pair(
                f"What are the goals for {name}?",
                body[:2000],
                f"deep_project:{fname}"
            ))
            if desc:
                pairs.append(make_pair(
                    f"Summarize {name} in one paragraph",
                    desc,
                    f"deep_project:{fname}"
                ))
        elif "user_" in fname:
            pairs.append(make_pair(
                f"What do you know about Dr. Hampton's preferences regarding {name.lower()}?",
                body[:2000],
                f"deep_user:{fname}"
            ))
        elif "feedback_" in fname:
            pairs.append(make_pair(
                f"What are the rules about {name.lower()}?",
                body[:1500],
                f"deep_feedback:{fname}"
            ))
        elif "reference_" in fname:
            pairs.append(make_pair(
                f"Where can I find information about {name.lower()}?",
                body[:1500],
                f"deep_reference:{fname}"
            ))

    # Generate cross-cutting knowledge pairs
    pairs.append(make_pair(
        "What are all the VisioCorp products?",
        """VisioCorp has 25+ products across 4 organizations:

**VisioCorp (Builder):**
- Visio Workspace — Chairman command center (51 pages, 178 AI tools, 110 API routes)
- Visio Charts — SA music intelligence platform (unified charts across all platforms)
- Visio Agency — 5 AI services for SA agencies (Reports, Content, Optimize, Intelligence, Agents)
- The Visio Index — AI Billboard Charts (composite AI lab rankings)
- VisioPitch — AI pitch deck builder (Gemini 2.5 Pro)
- VisioCorp Website — corporate landing page at visiocorp.co

**Corpo (Business Arm):**
- Netcare Health OS — 247 pages, 7 AI products, R139M/yr ROI (healthos.visiocorp.co)
- HealthOps Platform — white-label clinic OS (24 pages, 5 AI agents)
- Claims Rejection Analyzer — pre-submission validation (427 ICD-10-ZA codes)
- Healthbridge AI Claims Engine — first-in-SA claims switching integration
- VisioGold Mining Intelligence — mining sector AI (concept)
- Africa Elite Voyage — luxury travel (concept)
- FoodFriend — AI meal planning (concept)

**VRL (Research Labs):**
- V-Prai — AI PR lead gen & bookings (first client: DJ Radix, prai.visioai.co)
- Visio Intel — Bloomberg for Africa (58 pages, 115 APIs, 625+ intelligence records)
- FaceGuard AI — IP monitoring & facial recognition (prototype)
- Blurr Prestige Shield — privacy protection (prototype)
- Visio Outreach — multi-channel outreach automation (idea)

**Hampton Music (Entertainment):**
- Ciza's Palace — artist platform for CIZA (48 pages, Roman Empire theme)
- Africa Leo Suite — artist brand platform
- Visio Artist Portal — artist self-service platform
- 263 CultureFest Harare — April 30 event site
- Marshall Music x Tony Duardo — collaborative platform""",
        "all_products"
    ))

    pairs.append(make_pair(
        "What are VisioCorp's revenue goals?",
        """R10M revenue target for 2026. Revenue streams:

1. License fees (R50K-R1M upfront) — franchise fee for white-label platform
2. Monthly platform fees (R15K-R50K/mo) — ongoing access
3. Data plans (tiered) — intelligence feeds, benchmarks, scoring
4. Training camps (R75K-R250K per camp) — Dr. Hampton certifies teams
5. Custom development (R100K-R500K per build) — bespoke additions
6. Research products (R5K-R50K/mo) — Labs reports and predictions

Active revenue plays:
- Netcare Primary Care deal (Sara Nayager YES to demo, R13-26M/yr EBITDA impact)
- 50 billing companies as distribution (Healthbridge 7K practices, Xpedient R3B managed)
- V-Prai first paying client (DJ Radix, Sony Music signed)
- Agency partnerships via Visio Charts → Visio Agency upsell
- 418 emails sent, 161 leads in pipeline
- Dr. Lamola (Doctor Investor Partner) for HealthOps investment""",
        "goals"
    ))

    pairs.append(make_pair(
        "Who are the key people at VisioCorp?",
        """Dr. David Hampton — CEO/Founder. Runs 4 orgs, 25+ products. Quality > speed. Email: davidhampton@visiocorp.co

Key Contacts:
- Sara Nayager — MD Netcare Primary Care. SAID YES to demo. 3 months in role, wants quick wins.
- Thirushen Pillay — FD Netcare Primary Care. EBITDA champion. Frame as margin improvement.
- Travis Dewing — CIO + CEO Netcare Digital. All tech goes through him.
- Matsie Mpshane — FD Primary Care. Budget holder (ex-Discovery, Shell, Deloitte).
- Keith Gibson — Netcare Group CFO. Budget decisions >R25M.
- Dr. Mogau Lamola — Doctor Investor Partner for HealthOps.
- DJ Radix FyaBaby — First V-Prai client. Sony Music signed, Zimbabwean-born.
- CIZA (Nkululeko Nciza) — Amapiano/afrohouse artist. TikTok 551K+, Instagram 298K+.

AI Agents:
- Steinberg — AI chairman agent (96 KB files, autonomous cron every 5min)
- OpenClaw — Field agent for external operations
- Robocorpo — ONE entity, TWO hands (OpenClaw + Claude Code)""",
        "people"
    ))

    pairs.append(make_pair(
        "What is VisioCorp's competitive advantage?",
        """1. First-mover in AI infrastructure for African independent business
2. 300MB proprietary health claims KB (41K ICD-10-ZA, 487K NAPPI, scheme-specific rules)
3. No SA competitor has more than 5/20 of Netcare Health OS capabilities
4. White-label model: one platform, infinite brands — proven with HealthOps
5. Distribution through billing companies (50 targets, each = hundreds of practices)
6. Training camps create sticky relationships (Dr. Hampton as authority)
7. Big tech is 2-3 years from meaningful Africa localization
8. By then, VisioCorp has 50+ businesses on platform with irreplaceable data
9. Fine-tuned private AI models (VRL-Claims) trained on SA-specific claims data
10. 178 AI tools in workspace — no one else has this operational depth""",
        "competitive_advantage"
    ))

    pairs.append(make_pair(
        "What is the tech stack across VisioCorp?",
        """Core stack:
- Next.js 16.x (all products), TypeScript strict, Tailwind CSS 4, shadcn/ui
- Supabase (Postgres + Auth + Storage) — shared project for workspace, separate for products
- Vercel AI SDK 6.x (stopWhen: stepCountIs(N), not maxSteps)
- Zod v4 classic — z.record(z.string(), z.unknown())

AI Models:
- Claude Opus 4.6 (reasoning), Sonnet 4.6 (default), Haiku 4.5 (speed)
- Gemini 2.5 Flash (Steinberg fallback, cheapest), Gemini 2.5 Pro (VisioPitch)
- Local: Llama 3.1 8B (LM Studio) + Med42-MLX + LoRA adapters
- GPT-4o (optional)

Payments: Yoco (SA, NOT Paystack)
Email: Resend
Voice: ElevenLabs
Search: Exa.js neural search
Health: FHIR R4, HL7v2, EDIFACT MEDCLM, SMART on FHIR

Deployment:
- All on Vercel (corpo1 team), auto-deploy via GitHub webhooks
- DNS on GoDaddy (NOT Vercel DNS)
- Env vars: always printf not echo
- Sentry: org hga-eo""",
        "tech_stack"
    ))

    return pairs


def extract_product_knowledge() -> list[dict]:
    """Generate Q&A pairs about VisioCorp products from the registry."""
    pairs = []

    # Hardcoded product knowledge (from registry.ts)
    products = [
        {
            "name": "Visio Workspace",
            "desc": "Chairman Command Center — multi-business operating system with 178 AI tools, 51 pages, full CRUD across every module. Internal tool for Dr. Hampton to manage all VisioCorp businesses.",
            "stack": "Next.js 16, Supabase, Vercel AI SDK 6, Claude, Tailwind CSS 4, shadcn/ui",
            "url": "workspace.visiocorp.co",
        },
        {
            "name": "Netcare Health OS",
            "desc": "AI-powered healthcare intelligence platform for Netcare Primary Care (88 clinics, 568 practitioners, 3.5M patients/yr). 7 AI products: CareOn Bridge (HL7v2→FHIR, R139M/yr ROI), FHIR Hub (R4 server, CareConnect HIE), Switching Engine (EDIFACT MEDCLM, 3 switches, 30+ schemes), Healthbridge AI Claims (13 pages, autofill, ICD-10 coding), Claims Rejection Analyzer (1,078 ICD-10 codes, 7 scheme profiles), WhatsApp Router. 247 pages, 153 API routes, 60K+ lines. First-in-SA claims intelligence stack.",
            "stack": "Next.js 16, Prisma, Supabase, Gemini, Claude, FHIR R4, HL7v2, EDIFACT",
            "url": "healthos.visiocorp.co",
        },
        {
            "name": "HealthOps Platform",
            "desc": "White-label multi-tenant healthcare OS. 24 pages, 41 API routes, 5 AI agents (triage, followup, intake, billing, scheduler). POPIA compliance, ElevenLabs voice, white-label branding per practice. The template for every vertical.",
            "stack": "Next.js 16, Prisma, SQLite, Claude, ElevenLabs",
            "url": "healthops-platform.vercel.app",
        },
        {
            "name": "V-Prai (Visio Lead Gen)",
            "desc": "AI-powered PR lead generation and bookings platform. First client: DJ Radix FyaBaby (Sony Music). 6 pricing tiers (R0-R4,499/mo). Yoco live payments. Bookings Department for agencies (VIP). Neural search via Exa.js.",
            "stack": "Next.js 16, Supabase, Yoco, Gemini, ElevenLabs, Exa.js",
            "url": "prai.visioai.co",
        },
        {
            "name": "Visio Intel",
            "desc": "Bloomberg Terminal for African Business Intelligence. 58 pages, 115 API routes, 64 DB tables. 30 intelligence modules. Proprietary data: B-BBEE levels, government tenders, competitive maps, director networks. R200-500/mo vs Bloomberg R32K/year.",
            "stack": "Next.js 16, Supabase, Claude, Recharts, ElevenLabs",
            "url": "visio-intel.vercel.app",
        },
        {
            "name": "Visio Charts",
            "desc": "SA Music Intelligence Platform. Unified charts combining Spotify, Apple Music, YouTube, TikTok, Shazam, and Radio. Brand sponsorship marketplace. 100 SA agencies researched. Bridge product to introduce agencies to VisioCorp AI services.",
            "stack": "Next.js 16, Spotify API, YouTube API, Supabase, shadcn/ui",
            "url": "visio-charts.vercel.app",
        },
        {
            "name": "Visio Agency",
            "desc": "AI Partner for SA Agencies. 5 services: Reports (R5-30K/mo), Content (R8-30K/mo in 11 SA languages), Optimize (R15-50K/mo), Intelligence (R5-15K/mo), Agents (R25-100K/mo). Blue branding to differentiate from Charts.",
            "stack": "Next.js 16, Tailwind 4, Framer Motion, Recharts",
            "url": "visio-agency.vercel.app",
        },
        {
            "name": "Ciza's Palace",
            "desc": "Artist platform for CIZA (Nkululeko Nciza). 48 pages, Roman Empire theme (obsidian/gold/ivory). Merch + memberships + community. TikTok 551K+, Instagram 298K+, Spotify 1.6M monthly. Yoco payments. Replicable model for other artists.",
            "stack": "Next.js 15, Supabase, Yoco, Gemini, Tailwind CSS 4",
            "url": "cizas-palace.vercel.app",
        },
    ]

    for p in products:
        pairs.append(make_pair(
            f"What is {p['name']}?",
            f"{p['name']}: {p['desc']}\n\nTech stack: {p['stack']}\nURL: {p['url']}",
            "registry"
        ))
        pairs.append(make_pair(
            f"Tell me about {p['name']} and what it does",
            f"{p['name']}: {p['desc']}\n\nTech stack: {p['stack']}\nURL: {p['url']}",
            "registry"
        ))
        pairs.append(make_pair(
            f"What's the tech stack for {p['name']}?",
            f"{p['name']} uses: {p['stack']}\n\nDeployed at: {p['url']}",
            "registry"
        ))

    # Business model Q&A
    pairs.append(make_pair(
        "What is VisioCorp's business model?",
        "VisioCorp uses the McDonald's franchise model — NO revenue share. Clean transactions:\n\n1. License fees (R50K-R1M upfront) — the franchise fee\n2. Monthly platform fees (R15K-R50K/mo) — the rent\n3. Data plans (tiered) — the supply chain (intelligence feeds, benchmarks)\n4. Training camps (R75K-R250K per camp) — Hamburger University\n5. Custom development (R100K-R500K per build)\n6. Research products (R5K-R50K/mo subscriptions)\n\nWhat they charge their clients is their business. We sell the system.",
        "business_model"
    ))

    pairs.append(make_pair(
        "What is VisioCorp's mission?",
        '"Everyone has the right to compete, fairly."\n\nVisioCorp is the adoption vehicle for AI in independent business. Big tech builds horizontal tools for enterprises. Consulting firms charge $500K+. Neither serves independent businesses — agencies, clinics, labels, creators, SMEs.\n\nVisioCorp fills that gap: we ARE the AI department for businesses that don\'t have one. The independent clinic competes with Mediclinic. The boutique agency competes with Ogilvy. AI is the equalizer — and VisioCorp is how they get it.',
        "mission"
    ))

    pairs.append(make_pair(
        "Who is Dr. Hampton?",
        "Dr. David Hampton is the CEO/Founder of VisioCorp. He runs 4 organizations: VisioCorp (builder), Visio Research Labs (brain), Corpo (business arm), and Hampton Music (entertainment). 25+ products across healthcare, advertising, music, and business intelligence.\n\nR10M revenue target. Quality over speed. Protocol over improvisation.\n\nEmail: davidhampton@visiocorp.co",
        "people"
    ))

    return pairs


def extract_lead_data() -> list[dict]:
    """Extract knowledge from lead databases, seed scripts, and CSV files."""
    pairs = []

    # Billing company seed script
    seed_path = os.path.join(HOME, "visio-workspace/scripts/seed-billing-companies.mjs")
    if os.path.exists(seed_path):
        try:
            with open(seed_path) as f:
                content = f.read()
            # Extract company entries
            companies = re.findall(
                r"name:\s*['\"]([^'\"]+)['\"].*?company:\s*['\"]([^'\"]+)['\"].*?notes:\s*['\"]([^'\"]+)['\"]",
                content, re.DOTALL
            )
            if companies:
                company_list = "\n".join([
                    f"- {name} at {company}: {notes[:150]}"
                    for name, company, notes in companies
                ])
                pairs.append(make_pair(
                    "What billing companies are we targeting?",
                    f"VisioCorp is targeting {len(companies)} billing company contacts:\n\n{company_list}",
                    "leads:billing_companies"
                ))
        except:
            pass

    # CSV lead files — ALL databases
    csv_dirs = [
        os.path.join(HOME, "netcare-healthos/*.csv"),
        os.path.join(HOME, "healthops-platform/*.csv"),
        os.path.join(HOME, ".openclaw/workspace/databases/*.csv"),
        os.path.join(HOME, ".openclaw/workspace/visio_business_db_leads/*.csv"),
    ]
    total_leads = 0
    all_db_summaries = []
    for pattern in csv_dirs:
        for csv_path in glob.glob(pattern):
            try:
                fname = os.path.basename(csv_path)
                with open(csv_path, errors="replace") as f:
                    lines = f.readlines()
                if len(lines) < 2:
                    continue
                row_count = len(lines) - 1
                total_leads += row_count
                header = lines[0].strip()
                sample_rows = "\n".join(lines[1:4])
                all_db_summaries.append(f"- {fname}: {row_count} rows ({header[:100]})")

                # Individual DB Q&A
                pairs.append(make_pair(
                    f"What leads are in {fname}?",
                    f"Lead database: {fname}\nTotal: {row_count} rows\nColumns: {header}\n\nSample:\n{sample_rows}",
                    f"leads:{fname}"
                ))

                # For enriched files with LinkedIn, generate richer Q&A
                if "linkedin" in header.lower() or "enriched" in fname.lower() or "outreach_ready" in fname.lower():
                    pairs.append(make_pair(
                        f"Which leads in {fname} have LinkedIn profiles?",
                        f"{fname} ({row_count} rows) includes LinkedIn URLs. Columns: {header}\n\nSample:\n{sample_rows}",
                        f"leads:linkedin:{fname}"
                    ))

                # For health/doctor leads
                if any(w in fname.lower() for w in ["health", "mediclinic", "doctor", "morningside", "ent"]):
                    pairs.append(make_pair(
                        f"What doctor leads do we have in {fname}?",
                        f"Doctor lead database: {fname}\n{row_count} doctors/practices\nColumns: {header}\n\nSample:\n{sample_rows}",
                        f"leads:doctors:{fname}"
                    ))

                # For artist/music leads
                if any(w in fname.lower() for w in ["artist", "music", "emerging", "release"]):
                    pairs.append(make_pair(
                        f"What music/artist leads are in {fname}?",
                        f"Music industry database: {fname}\n{row_count} entries\nColumns: {header}\n\nSample:\n{sample_rows}",
                        f"leads:music:{fname}"
                    ))
            except:
                pass

    # Master lead summary
    if all_db_summaries:
        pairs.append(make_pair(
            "How many leads does VisioCorp have across all databases?",
            f"VisioCorp has {total_leads}+ leads across {len(all_db_summaries)} databases:\n\n" + "\n".join(all_db_summaries),
            "leads:master_summary"
        ))

    # US leads (JSON)
    us_lead_files = glob.glob(os.path.join(HOME, "visiopitch-standalone/.firecrawl/research/us-leads*.json"))
    us_lead_files += glob.glob(os.path.join(HOME, "visiopitch-standalone/.firecrawl/us-healthcare-leads.json"))
    for fpath in us_lead_files:
        try:
            with open(fpath) as f:
                data = json.load(f)
            fname = os.path.basename(fpath)
            if isinstance(data, list) and len(data) > 0:
                sample = json.dumps(data[:3], indent=2)[:1000]
                pairs.append(make_pair(
                    f"What US leads do we have in {fname}?",
                    f"US lead database: {fname}\n{len(data)} entries\n\nSample:\n{sample}",
                    f"leads:us:{fname}"
                ))
        except:
            pass

    # Seed scripts (outreach messages, doctor profiles)
    seed_files = [
        os.path.join(HOME, "netcare-healthos/prisma/seed-outreach.ts"),
        os.path.join(HOME, "netcare-healthos/scripts/seed-netcare-primarycare.ts"),
        os.path.join(HOME, "netcare-healthos/scripts/seed-drlamola.ts"),
        os.path.join(HOME, "netcare-healthos/scripts/seed-network-data.ts"),
        os.path.join(HOME, "netcare-healthos/scripts/seed-health-media-leads.ts"),
        os.path.join(HOME, "visio-workspace/scripts/seed-billing-companies.mjs"),
    ]
    for fpath in seed_files:
        if os.path.exists(fpath):
            try:
                with open(fpath) as f:
                    content = f.read()
                fname = os.path.basename(fpath)
                # Count entries
                entry_count = content.count("name:") + content.count("name\":") + content.count("practice_name")
                pairs.append(make_pair(
                    f"What outreach/seed data is in {fname}?",
                    f"Seed script: {fname}\n~{entry_count} entries\n\n{content[:2000]}",
                    f"leads:seed:{fname}"
                ))
            except:
                pass

    # Deployment knowledge
    pairs.append(make_pair(
        "How do we deploy VisioCorp products?",
        """All VisioCorp products deploy via Vercel (corpo1 team):

1. Code → GitHub repo (Iamhamptom org)
2. GitHub webhook triggers Vercel deploy hook (auto-deploy)
3. Vercel builds and deploys (zero-config for Next.js)
4. Custom domains via GoDaddy DNS (A record → 76.76.21.21)

Manual deploy: vercel deploy --prod --scope corpo1 --yes
Check status: vercel ls --scope corpo1
View logs: vercel inspect <url> --logs --scope corpo1

Env vars: always use printf (not echo) to avoid trailing newlines
printf 'value' | vercel env add VAR_NAME production --scope corpo1

Key Vercel projects:
- visioworkspace (workspace.visiocorp.co)
- netcare-healthos (healthos.visiocorp.co)
- healthops-platform
- visio-lead-gen (prai.visioai.co)
- cizas-palace
- visio-charts, visio-intel, visio-agency

SSO protection must be disabled: API PATCH with {"ssoProtection":null}
DNS is on GoDaddy nameservers (ns51/ns52.domaincontrol.com), NOT Vercel DNS.""",
        "deployment"
    ))

    pairs.append(make_pair(
        "What is the lead pipeline status?",
        """Current lead pipeline (March 2026):

WORKSPACE DATABASE: 1,101 leads in Visio Workspace Supabase
- 100 music PR leads, 527 Gauteng health, 55 luxury, 50 Mediclinic, 50 lifestyle, 305 artist/ads, 14 manual

OPENCLAW DATABASES (~4,000+ leads across 24 CSVs):
Health/Doctor leads (with LinkedIn, phone, email, personalized outreach):
- healthops_morningside_sandton_outreach_ready.csv — 49 doctors, full campaign messages, compliance notes
- mediclinic_morningside_enriched.csv — 51 doctors with LinkedIn URLs
- mediclinic_morningside_leads.csv — 94 entries
- gauteng_health_wellness_prospects.csv — 528 practices with LinkedIn, website quality scores
- joburg-ent-referral-leads.csv — 125 ENT specialists
- joburg-north-owner-operated-leads.csv — 38 owner-operated practices

Music/Entertainment leads:
- artists_spending_on_ads_master.csv — 306 artists running paid ads
- emerging_artist_leads_2026.csv — 174 emerging artists (29 columns)
- music_industry_prospects_2026.csv — 270 industry contacts
- music_pr_marketing_targets.csv — 101 PR/marketing contacts
- artists_running_ads_under_500k.csv — 146 mid-tier artists
- new_releases_march_6_2026.csv — 401 new releases
- PROSPECTING_PRIORITY.csv — 528 prioritized prospects with LinkedIn

Beauty/Lifestyle:
- gauteng_beauty_hair_makeup_prospects.csv — 335 beauty businesses
- cape_town_beauty_hair_makeup_prospects.csv — 103 beauty businesses
- durban_beauty_hair_makeup_prospects.csv — 94 beauty businesses

US LEADS (VisioPitch international expansion):
- us-leads-500.json — 500 US healthcare leads
- us-leads-enriched.json — 33 enriched
- us-leads-sendable.json — 14 ready to send

BILLING COMPANY TARGETS: 50 SA medical billing companies (seed script)
- Healthbridge (Luis da Silva, CEO, 7K practices)
- Xpedient (Jans van Vuuren, CEO, R3B managed)
- SIMS (Neil Herselman, MD, SA + Namibia)
- PracMed (250+ clients, founded 1993)

Outreach: 418 emails sent, 161 leads active
Email: davidhampton@visiocorp.co via GoDaddy SMTP
Tools: LinkedIn Sales Navigator + Premium for research""",
        "pipeline"
    ))

    pairs.append(make_pair(
        "How does the gateway API work?",
        """The Visio Workspace Gateway allows external agents to access the full 178-tool system:

Endpoint: POST /api/gateway
Auth: Authorization: Bearer $VISIO_GATEWAY_KEY
Body: {"command": "natural language", "organization_id": "optional"}

It runs a 20-step agent loop with full tool access. Used by:
- OpenClaw (field agent)
- Steinberg CLI (scripts/steinberg.sh)
- Claude Code (via curl)
- Any HTTP client

Agent Comms (agent_comms table):
- POST /api/system/comms — send messages between agents
- GET /api/system/comms — read messages
- PATCH /api/system/comms — mark as read
- Message types: task_handoff, status_update, sync_request, data_report, alert, directive, ack
- Auth: x-api-key header""",
        "gateway"
    ))

    return pairs


def deduplicate(pairs: list[dict]) -> list[dict]:
    """Remove duplicate training pairs by content hash."""
    seen = set()
    unique = []
    for pair in pairs:
        user_msg = pair["messages"][1]["content"]
        key = hashlib.md5(user_msg.encode()).hexdigest()
        if key not in seen:
            seen.add(key)
            unique.append(pair)
    return unique


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    all_pairs = []

    # 1. Session conversations
    print("📦 Extracting from Claude sessions...")
    session_pairs = extract_from_sessions()
    print(f"   → {len(session_pairs)} pairs from sessions")
    all_pairs.extend(session_pairs)

    # 2. Memory files (institutional knowledge)
    print("🧠 Extracting from memory files...")
    memory_pairs = extract_from_markdown(SOURCES["memory"], "memory")
    print(f"   → {len(memory_pairs)} pairs from memory")
    all_pairs.extend(memory_pairs)

    # 3. Steinberg KB
    print("📚 Extracting from Steinberg KB...")
    steinberg_pairs = extract_from_markdown(SOURCES["steinberg_kb"], "steinberg")
    steinberg_pairs += extract_from_markdown(SOURCES["steinberg_openai"], "steinberg_openai")
    print(f"   → {len(steinberg_pairs)} pairs from Steinberg")
    all_pairs.extend(steinberg_pairs)

    # 4. Health KB
    print("🏥 Extracting from Health KB...")
    health_pairs = extract_from_markdown(SOURCES["health_kb"], "health_kb")
    health_pairs += extract_from_markdown(SOURCES["research_docs"], "research")
    print(f"   → {len(health_pairs)} pairs from health KB")
    all_pairs.extend(health_pairs)

    # 5. Strategy docs
    print("📊 Extracting from strategy docs...")
    strategy_pairs = extract_from_markdown(SOURCES["strategy_docs"], "strategy")
    print(f"   → {len(strategy_pairs)} pairs from strategy")
    all_pairs.extend(strategy_pairs)

    # 6. Outreach templates
    print("📧 Extracting from outreach templates...")
    outreach_pairs = extract_from_outreach(SOURCES["outreach"])
    print(f"   → {len(outreach_pairs)} pairs from outreach")
    all_pairs.extend(outreach_pairs)

    # 7. Product knowledge
    print("🏷️  Generating product knowledge pairs...")
    product_pairs = extract_product_knowledge()
    print(f"   → {len(product_pairs)} pairs from products")
    all_pairs.extend(product_pairs)

    # 8. Deep project knowledge (every memory file, goals, people, strategy)
    print("🎯 Extracting deep project knowledge...")
    deep_pairs = extract_deep_project_knowledge()
    print(f"   → {len(deep_pairs)} pairs from deep project knowledge")
    all_pairs.extend(deep_pairs)

    # 10. Workspace source code (tools, APIs, pages, libs)
    print("🔧 Extracting from Visio Workspace codebase...")
    workspace_code_pairs = extract_from_code([
        SOURCES["workspace_lib"],
        SOURCES["workspace_api"],
        SOURCES["workspace_pages"],
    ], "workspace")
    print(f"   → {len(workspace_code_pairs)} pairs from workspace code")
    all_pairs.extend(workspace_code_pairs)

    # 11. Other product codebases
    print("📦 Extracting from product codebases...")
    product_code_pairs = extract_from_code([
        SOURCES["healthops_lib"],
        SOURCES["netcare_lib"],
        SOURCES["ciza_lib"],
        SOURCES["vprai_lib"],
    ], "products")
    print(f"   → {len(product_code_pairs)} pairs from product code")
    all_pairs.extend(product_code_pairs)

    # 12. CLAUDE.md files (deployment, rules, operations)
    print("📋 Extracting from CLAUDE.md files...")
    claude_md_pairs = extract_from_markdown(SOURCES["workspace_claude_md"], "claude_md")
    claude_md_pairs += extract_from_markdown(
        os.path.join(HOME, ".claude/projects/-Users-hga/CLAUDE.md"), "master_playbook"
    )
    print(f"   → {len(claude_md_pairs)} pairs from CLAUDE.md")
    all_pairs.extend(claude_md_pairs)

    # 13. Lead databases and CSV data
    print("📊 Extracting from lead databases...")
    lead_pairs = extract_lead_data()
    print(f"   → {len(lead_pairs)} pairs from lead data")
    all_pairs.extend(lead_pairs)

    # Deduplicate
    all_pairs = deduplicate(all_pairs)
    print(f"\n✅ Total unique pairs: {len(all_pairs)}")

    # Split: 90% train, 5% valid, 5% test
    import random
    random.seed(42)
    random.shuffle(all_pairs)

    n = len(all_pairs)
    train_end = int(n * 0.90)
    valid_end = int(n * 0.95)

    train = all_pairs[:train_end]
    valid = all_pairs[train_end:valid_end]
    test = all_pairs[valid_end:]

    # Write JSONL files (without metadata for training)
    for split_name, split_data in [("train", train), ("valid", valid), ("test", test)]:
        fpath = os.path.join(OUTPUT_DIR, f"{split_name}.jsonl")
        with open(fpath, "w") as f:
            for pair in split_data:
                # Strip metadata for training file
                clean = {"messages": pair["messages"]}
                f.write(json.dumps(clean, ensure_ascii=False) + "\n")
        print(f"   📄 {split_name}.jsonl: {len(split_data)} examples")

    # Write full pairs with metadata for reference
    ref_path = os.path.join(OUTPUT_DIR, "all_with_metadata.jsonl")
    with open(ref_path, "w") as f:
        for pair in all_pairs:
            f.write(json.dumps(pair, ensure_ascii=False) + "\n")

    print(f"\n🎯 Output directory: {OUTPUT_DIR}")
    print(f"   Total training examples: {len(train)}")
    print(f"   Total validation examples: {len(valid)}")
    print(f"   Total test examples: {len(test)}")


if __name__ == "__main__":
    main()
