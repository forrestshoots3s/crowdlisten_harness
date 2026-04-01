# CrowdListen

> One MCP server for AI agents. Plan work, search social platforms, capture knowledge — with progressive skill disclosure so your agent only loads what it needs.

[English](README.md) | [中文文档](README-CN.md)

## The Problem

AI agents are stateless. Every new session starts from scratch — no memory of yesterday's decisions, no awareness of what other agents discovered, no access to what your audience is actually saying online. You end up re-explaining context, missing user feedback scattered across seven platforms, and watching your agent rediscover the same solutions.

CrowdListen fixes this with a single MCP server that closes the loop from crowd feedback to implementation:

1. **Listens to your audience** — searches Reddit, YouTube, TikTok, Twitter/X, Instagram, Xiaohongshu — and returns structured data your agent can reason about.
2. **Analyzes what they're saying** — clusters opinions, extracts pain points, identifies feature requests across platforms.
3. **Generates actionable specs** — turns crowd insights into implementation specs with evidence citations, acceptance criteria, and confidence scores.
4. **Delivers specs to coding agents** — your agent calls `get_specs`, picks a spec, calls `start_spec`, and gets a kanban task with workspace and branch ready to go.
5. **Plans and tracks work** across agents with a shared knowledge base that compounds over time.

Your agent starts with 4 discovery tools. It activates skill packs on demand — planning, social listening, audience analysis, spec delivery — and only loads the tools it actually needs for the current task.

## Try It Now

One command. Your browser opens, you sign in, and your agents are configured automatically:

```bash
npx @crowdlisten/planner login
```

This auto-configures MCP for Claude Code, Cursor, Gemini CLI, Codex, Amp, and OpenClaw. No env vars, no JSON editing, no API keys to manage.

Restart your agent after login, and it can start calling tools immediately.

### Manual Setup

Add this to your agent's MCP config:

```json
{
  "mcpServers": {
    "crowdlisten": {
      "command": "npx",
      "args": ["-y", "@crowdlisten/planner"]
    }
  }
}
```

## How It Works

### Progressive Skill Disclosure

Your agent starts with 4 always-on tools:

```
list_skill_packs()                                    → see available packs
activate_skill_pack({ pack_id: "planning" })          → unlocks 11 task tools
activate_skill_pack({ pack_id: "social-listening" })  → unlocks 7 search tools
remember({ type: "preference", title: "...", ... })   → save context across sessions
recall({ search: "React" })                           → retrieve saved context
```

After activation, new tools appear automatically via `tools/list_changed`. No restarts needed.

### Skill Packs

| Pack | Tools | Description |
|------|-------|-------------|
| **core** (always on) | 4 | Discovery + memory |
| **planning** | 11 | Tasks, plans, progress tracking |
| **knowledge** | 3 | Project knowledge base |
| **social-listening** | 7 | Search social platforms (free) |
| **audience-analysis** | 6 | AI-powered analysis (requires CROWDLISTEN_API_KEY) |
| **spec-delivery** | 3 | Actionable specs from crowd feedback |
| **sessions** | 3 | Multi-agent coordination |
| **setup** | 5 | Board management |

Plus: native SKILL.md workflow packs (competitive-analysis, content-creator, etc.) that deliver full methodology instructions when activated.

## What You Can Do

### Plan and Track Work

Your agent calls `list_tasks` to see what's available, `claim_task` to start work, and `create_plan` to draft an approach with assumptions and risks. You review the plan, leave feedback, the agent iterates. Every decision and learning is captured in a knowledge base that future tasks can query.

### Search Social Platforms

Search Reddit, YouTube, TikTok, Twitter/X, Instagram, Xiaohongshu, and Moltbook from one tool. Get back structured posts with engagement metrics, timestamps, and author info — same format regardless of platform.

```bash
# Also works as a CLI
npx crowdlisten search reddit "cursor vs claude code" --limit 5
npx crowdlisten vision https://news.ycombinator.com
```

### Extract From Any Website

Vision mode takes a screenshot of any URL, sends it to an LLM (Claude, Gemini, or OpenAI), and returns structured data. Forum without an API? News site with paywalled comments? Just point `extract_url` at it.

### Analyze Audience Signal

The paid API layer adds opinion clustering, deep analysis (audience segments, competitive signals), and research synthesis (cross-platform reports from a single query). Core extraction is free and open source.

### Get Actionable Specs from Crowd Feedback

The full pipeline: crowd feedback channels are analyzed, insights extracted, and specs generated automatically. Your coding agent activates the `spec-delivery` pack and browses specs that are ready to implement — each with evidence from real user feedback, acceptance criteria, and a confidence score.

```
activate_skill_pack({ pack_id: "spec-delivery" })

get_specs({ priority: "high", min_confidence: 0.8 })
→ returns specs with title, type, priority, confidence

get_spec_detail({ spec_id: "..." })
→ formatted markdown: objective, evidence citations, acceptance criteria checklist

start_spec({ spec_id: "..." })
→ creates kanban task, claims it, sets up workspace + branch, returns context
```

`start_spec` composes the existing task management flow internally — it creates a task from the spec, moves it to In Progress, generates a branch name, and returns everything the agent needs to begin coding. No manual setup required.

### Remember Across Sessions

Your agent saves context with `remember` and retrieves it with `recall`. Switch from Claude Code to Cursor to Gemini CLI — the knowledge comes with you.

## MCP Tools Reference

### Always-On (4 tools)

| Tool | What it does |
|------|-------------|
| `list_skill_packs` | List available packs with status, tool counts |
| `activate_skill_pack` | Activate a pack to unlock its tools |
| `remember` | Save context across sessions (preference, decision, pattern, insight) |
| `recall` | Retrieve saved context blocks |

### Planning Pack (11 tools)

| Tool | What it does |
|------|-------------|
| `list_tasks` | List board tasks |
| `get_task` | Full task details |
| `create_task` | Create a new task |
| `update_task` | Change title, description, status, priority |
| `claim_task` | Start work — returns context, workspace, branch |
| `complete_task` | Mark done, auto-complete plan |
| `delete_task` | Permanently remove a task |
| `log_progress` | Log a note to the execution session |
| `create_plan` | Create execution plan (approach, assumptions, risks) |
| `get_plan` | Get plan with version history and feedback |
| `update_plan` | Iterate: update approach, status, or add feedback |

### Knowledge Pack (3 tools)

| Tool | What it does |
|------|-------------|
| `query_context` | Search decisions, patterns, learnings |
| `add_context` | Write to knowledge base |
| `record_learning` | Capture outcome, optionally promote to project scope |

### Social Listening Pack (7 tools, free)

| Tool | What it does |
|------|-------------|
| `search_content` | Search posts across platforms. Supports `useVision` flag. |
| `get_content_comments` | Get comments/replies for a specific post |
| `get_trending_content` | Currently trending posts from a platform |
| `get_user_content` | Recent posts from a specific user |
| `extract_url` | Vision extraction — screenshot any URL, get structured data |
| `get_platform_status` | Which platforms are available and their capabilities |
| `health_check` | Platform connectivity check |

Platforms: reddit, twitter, tiktok, instagram, youtube, xiaohongshu, moltbook

### Audience Analysis Pack (6 tools, requires CROWDLISTEN_API_KEY)

| Tool | What it does |
|------|-------------|
| `analyze_content` | Sentiment + theme analysis on a post and its comments |
| `cluster_opinions` | Group comments into semantic opinion clusters |
| `enrich_content` | Intent detection, stance analysis, engagement scoring |
| `deep_analyze` | Full audience intelligence: segments, pain points, competitive signals |
| `extract_insights` | Categorized insight extraction (pain points, feature requests, praise) |
| `research_synthesis` | Cross-platform research report from a single query |

### Spec Delivery Pack (3 tools)

| Tool | What it does |
|------|-------------|
| `get_specs` | List actionable specs — filter by status, type, priority, min_confidence, project_id |
| `get_spec_detail` | Full spec with formatted evidence citations and acceptance criteria checklist |
| `start_spec` | Claim a spec, create kanban task, set up workspace + branch, return agent context |

Spec statuses: `pending` (ready to start), `claimed` (agent working), `in_progress`, `completed`, `rejected`

Spec types: `feature`, `bug_fix`, `improvement`, `investigation`

### Sessions Pack (3 tools)

| Tool | What it does |
|------|-------------|
| `start_session` | Start parallel agent session for multi-agent work |
| `list_sessions` | List sessions for a task |
| `update_session` | Update session status/focus |

### Setup Pack (5 tools)

| Tool | What it does |
|------|-------------|
| `get_or_create_global_board` | Get your global board |
| `list_projects` | List accessible projects |
| `list_boards` | List boards for a project |
| `create_board` | Create board with default columns |
| `migrate_to_global_board` | Move all tasks to global board |

Full parameter details: [docs/TOOLS.md](docs/TOOLS.md)

## Platform Setup

Most platforms work with zero configuration:

| Platform | Setup | Without it |
|----------|-------|-----------|
| Reddit | Nothing | Works immediately |
| TikTok | `npx playwright install chromium` | Browser not found error |
| Instagram | `npx playwright install chromium` | Browser not found error |
| Xiaohongshu | `npx playwright install chromium` | Browser not found error |
| Twitter/X | `TWITTER_USERNAME` + `TWITTER_PASSWORD` in `.env` | Skipped |
| YouTube | `YOUTUBE_API_KEY` in `.env` | Skipped |
| Moltbook | `MOLTBOOK_API_KEY` in `.env` | Skipped |
| Vision mode | Any of: `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `OPENAI_API_KEY` | Vision returns error |
| Paid analysis | `CROWDLISTEN_API_KEY` | Free tools still work |

Browser-based platforms (TikTok, Instagram, Xiaohongshu) have built-in rate limits of 3-5 requests per minute to prevent IP blocks.

## How It Works Under the Hood

- **Reddit, YouTube, Moltbook** use direct HTTP APIs.
- **Twitter** uses a cookie-based scraper — no developer account needed.
- **TikTok, Instagram, Xiaohongshu** launch a real browser via Playwright and intercept the platform's own internal API responses.
- **Vision mode** opens a browser, takes a full-page screenshot, and sends it to an LLM with a structured extraction prompt. Works on any website.

### The Pipeline

CrowdListen's end-to-end pipeline turns raw crowd feedback into agent-ready work:

```
Crowd Feedback     →  Analysis        →  Insight          →  Spec           →  MCP Delivery
(Reddit, TikTok,      (sentiment,        Extraction          Generation        to Coding
 YouTube, X, ...)      clustering,        (pain points,       (actionable       Agents
                       segmentation)      feature requests,    specs with        (get_specs →
                                          competitive          evidence +        start_spec →
                                          signals)             criteria)         implement)
```

Each step feeds the next. By the time a coding agent calls `get_specs`, the spec already carries evidence citations from real user feedback, a confidence score based on signal strength, and acceptance criteria derived from the extracted insights.

### Skill Pack Registry

The registry (`src/tools/registry.ts`) implements progressive disclosure following the [GitHub MCP Server pattern](https://github.com/github/github-mcp-server). Instead of exposing 40+ tools on startup, the server starts with 4 core tools. Agents discover available packs via `list_skill_packs` and activate what they need with `activate_skill_pack`. The server fires `notifications/tools/list_changed` so the agent picks up new tools without restarting.

This matters for token efficiency — an agent working on implementation only activates `spec-delivery` and `planning`, keeping its tool context small and focused.

The browser can run locally (default), in Docker, or via a remote CDP endpoint:

```bash
BROWSER_PROVIDER=docker npx crowdlisten search tiktok "AI agents"
BROWSER_PROVIDER=remote BROWSER_CDP_URL=wss://connect.browserbase.com?apiKey=KEY npx crowdlisten search tiktok "AI agents"
```

## CLI Commands

```bash
npx @crowdlisten/planner login          # Sign in + auto-configure agents
npx @crowdlisten/planner setup          # Re-run auto-configure
npx @crowdlisten/planner logout         # Clear credentials
npx @crowdlisten/planner whoami         # Check current user
npx @crowdlisten/planner context        # Launch skill pack dashboard (port 3847)
npx @crowdlisten/planner context <file> # Process file through context pipeline
npx @crowdlisten/planner setup-context  # Configure LLM provider for extraction

# Social listening CLI
npx crowdlisten search reddit "AI agents" --limit 20
npx crowdlisten comments youtube dQw4w9WgXcQ --limit 100
npx crowdlisten vision https://news.ycombinator.com --limit 10
npx crowdlisten trending reddit --limit 10
npx crowdlisten status
npx crowdlisten health
```

## Supported Agents

**Auto-configured on login:** Claude Code, Cursor, Gemini CLI, Codex, Amp, OpenClaw

**Also works with (manual config):** Copilot, Droid, Qwen Code, OpenCode

## Context Extraction

Upload chat transcripts, get reusable context blocks and skill recommendations. PII is redacted locally before anything reaches an LLM.

```
Upload → Parse → PII Redact → Chunk → LLM Extract → Skill Match → Store
(local)  (local)  (local)     (local)  (user's key)  (local)     (local)
```

### Supported Formats

- `.json` — ChatGPT exports, Claude exports (auto-detected)
- `.zip` — ZIP archives containing JSON exports
- `.txt` / `.md` — Plain text or markdown
- `.pdf` — PDF documents

### LLM Providers

- **OpenAI** — gpt-4o-mini default, supports embeddings
- **Anthropic** — Claude Sonnet default
- **Ollama** — Local models, no API key needed

## Privacy

- PII redacted locally before LLM calls
- Context stored locally (`~/.crowdlisten/`)
- Your own API keys for LLM extraction
- No data syncs without explicit user action
- Everything is MIT open-source and inspectable

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `CROWDLISTEN_URL` | `https://crowdlisten.com` | Supabase project URL |
| `CROWDLISTEN_ANON_KEY` | Built-in default | Supabase anonymous key |
| `CROWDLISTEN_APP_URL` | `https://crowdlisten.com` | Web app URL (login redirects) |

### Auto-Executor Detection

When your agent calls `claim_task`, `start_session`, or `start_spec`, CrowdListen auto-detects which agent is running:

| Agent | Detection |
|-------|-----------|
| Claude Code | `CLAUDE_CODE=1` or `CLAUDE_SESSION_ID` |
| Cursor | `CURSOR_SESSION_ID` or `CURSOR_TRACE_ID` |
| Gemini CLI | `GEMINI_CLI` |
| Codex | `CODEX_SESSION_ID` |
| OpenClaw | `OPENCLAW_SESSION` or `OPENCLAW_AGENT` |
| Amp | `AMP_SESSION_ID` |

## For Agents

See [AGENTS.md](AGENTS.md) for machine-readable capability descriptions and example workflows.

## Development

```bash
git clone https://github.com/Crowdlisten/crowdlisten_harness.git
cd crowdlisten_harness
npm install && npm run build
npm test    # 210 tests via Vitest
```

## Contributing

Highest-value contributions: new platform adapters (Threads, Bluesky, Hacker News, Product Hunt, Mastodon) and extraction fixes.

## License

MIT — [crowdlisten.com](https://crowdlisten.com)
