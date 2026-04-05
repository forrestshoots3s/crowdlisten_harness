# CrowdListen — Agent Reference

Unified MCP server for AI agents. Planning, social listening, skill packs, and knowledge management with progressive disclosure.

## Quick Start

```bash
npx @crowdlisten/harness login
```

Auto-configures MCP for Claude Code, Cursor, Gemini CLI, Codex, OpenClaw, Amp.

### Manual MCP config (stdio)
```json
{ "crowdlisten": { "command": "npx", "args": ["-y", "@crowdlisten/harness"] } }
```

### Remote MCP config (Streamable HTTP)
```json
{
  "crowdlisten": {
    "url": "https://mcp.crowdlisten.com/mcp",
    "headers": {
      "Authorization": "Bearer YOUR_API_KEY"
    }
  }
}
```

## Interfaces

| Interface | Access | Best for |
|-----------|--------|----------|
| MCP stdio | `npx @crowdlisten/harness` — ~28 tools | Local agents |
| MCP HTTP | `POST https://mcp.crowdlisten.com/mcp` | Remote agents, cloud |
| REST | `POST https://mcp.crowdlisten.com/tools/{name}` | Non-MCP integrations |
| OpenAPI | `GET https://mcp.crowdlisten.com/openapi.json` | Docs, code gen |
| CLI | `npx @crowdlisten/harness login/setup/serve/openapi` | Auth, config, hosting |
| Web UI | `npx @crowdlisten/harness context` → localhost:3847 | Visual context extraction |

## Progressive Disclosure

You start with **8 tools**. Activate skill packs to unlock more:

```
skills({ action: "list" })                      → see available packs
skills({ action: "activate", pack_id: "planning" }) → unlocks 6 task tools
skills({ action: "activate", pack_id: "social-listening" }) → unlocks 5 social tools
```

After activation, new tools appear automatically via `tools/list_changed`.

## Always-On Tools (8)

- **skills**(action: "list"|"activate", pack_id?) — List all packs or activate one. For SKILL.md packs, returns workflow instructions.
- **save**(title, content, tags?, project_id?, confidence?, publish?: { team_id }) — Save context to .md knowledge base. Pass `publish` to share with a team.
- **wiki_list**(tag?, limit?) — Browse the knowledge base index with optional tag filter.
- **wiki_read**(entry_id) — Read a single knowledge base entry by ID.
- **wiki_write**(title, content, tags?) — Write or update a knowledge base entry directly.
- **wiki_search**(query, limit?) — Full-text search across the knowledge base.
- **wiki_ingest**(url_or_text, source?) — Ingest external content (URL or raw text) into the knowledge base.
- **wiki_log**(message, tags?) — Append a timestamped log entry (for decisions, progress notes, session journals).

## Skill Packs

| Pack | Tools | Description |
|------|-------|-------------|
| **core** (always on) | 8 | Wiki knowledge base + skill discovery |
| **planning** | 6 | Tasks, execution, progress tracking, server-side agent execution |
| **social-listening** | 5 | Search social platforms |
| **audience-analysis** | 3 | AI analysis + opinion clustering |
| **analysis** | 5 | Full audience analyses + spec generation |
| **crowd-intelligence** | 1 | Context-enriched crowd research |

Plus: 9 native SKILL.md workflow packs (knowledge-base, competitive-analysis, content-creator, etc.)

## Planning Pack (6 tools)

- **list_tasks**(board_id?, status?, limit?, task_id?) — List board tasks, or pass `task_id` for full details of a single task.
- **create_task**(title, description?, priority?) — Create task
- **claim_task**(task_id, executor?, branch?) — Start work, get context
- **complete_task**(task_id, summary?, progress?: true) — Mark done. Pass `progress: true` to log a progress note instead of completing.
- **execute_task**(task_id, executor?) — Trigger server-side AI agent execution. Supported executors: amp, claude-code, codex, gemini-cli.
- **get_execution_status**(execution_id) — Poll execution progress. Returns status (queued, running, completed, failed) and output when done.

### Task Execution Workflow

```
claim_task → execute_task → get_execution_status (poll) → complete_task
```

Dispatch a claimed task to a server-side agent, poll until finished, then mark it complete. The executor runs on the backend — your local agent only needs to poll for results.

## Social Listening Pack (5 tools)

- **search_content**(platform, query, limit?, type?: "user", userId?) — Search posts across platforms. Pass `type: "user"` with `userId` to get a user's recent posts.
- **get_content_comments**(platform, contentId, limit?) — Get comments/replies
- **get_trending_content**(platform, limit?) — Trending posts
- **platform_status**(diagnose?: true) — Available platforms + capabilities. Pass `diagnose: true` for full connectivity health check.
- **extract_url**(url, mode?, limit?) — Vision extraction from any URL

Platforms: reddit, twitter, tiktok, instagram, youtube, moltbook

## Audience Analysis Pack (3 tools)

- **analyze_content**(platform, contentId, analysisDepth?, enrichment?: true) — Sentiment, themes, tensions. Use analysisDepth: "deep" or "comprehensive" for full audience intelligence. Pass `enrichment: true` for intent/stance analysis.
- **cluster_opinions**(platform, contentId, clusterCount?) — Opinion clustering
- **extract_insights**(platform, contentId, categories?) — Pain points, feature requests

## Crowd Intelligence Pack (1 tool)

Activate: `skills({ action: "activate", pack_id: "crowd-intelligence" })`

- **crowd_research**(action: "start"|"status", query?, platforms?, depth?, context?, job_id?) — Start async crowd research or poll status. Pass `action: "start"` with a query to begin, `action: "status"` with a job_id to poll.

**Platforms:** reddit, twitter, moltbook, xiaohongshu, web (Exa search)
**Depth:** quick (~30s), standard (~90s), deep (~120s)
**Context:** Auto-recalls your saved business context. Override with `context` param.

### Crowd Intelligence Example

```
Agent: skills({ action: "activate", pack_id: "crowd-intelligence" })
Agent: crowd_research({ action: "start", query: "What do users think about AI code editors?", platforms: ["reddit", "twitter"], depth: "standard" })
→ { status: "running", job_id: "abc-123", estimated_seconds: 60 }

[wait 10 seconds]

Agent: crowd_research({ action: "status", job_id: "abc-123" })
→ { status: "running", message: "Analysis still running..." }

[wait 10 seconds]

Agent: crowd_research({ action: "status", job_id: "abc-123" })
→ { status: "complete", takeaway: "...", themes: [...], sentiment: {...} }
```

## Analysis (5 tools)

- **run_analysis**(project_id, question, platforms?, max_results?) — Run audience analysis across Reddit, YouTube, TikTok, Twitter, Instagram, Xiaohongshu. Streams results.
- **continue_analysis**(analysis_id, question) — Follow-up question on existing analysis.
- **get_analysis**(analysis_id) — Get full analysis results with themes, sentiment, quotes.
- **list_analyses**(project_id, limit?) — List analyses for a project.
- **generate_specs**(project_id, analysis_id?, spec_type?) — Generate feature requests, user stories, acceptance criteria from analysis.

## Knowledge Base

The knowledge base is a compounding loop: every agent interaction can make it better. Saves accumulate, the wiki tools let agents browse, search, and ingest content, and research results get filed back. Over time the knowledge base becomes a rich starting point instead of a blank slate.

### How data flows

```
 save()          Supabase              ~/.crowdlisten/context/
───────→  memories table  ──render──→  ├── INDEX.md
                                       ├── entries/a1b2c3d4.md
 wiki_search()   ↑                     └── topics/auth.md
←────────────────┘
 wiki_list()                           wiki_ingest()
 browse index                          ingest external content
```

1. **Save** — `save({ title, content, tags })` writes to Supabase and renders a `.md` file locally. Pass `publish: { team_id }` to share with teammates.
2. **Browse** — `wiki_list()` browses the index. `wiki_read(entry_id)` reads a single entry.
3. **Search** — `wiki_search({ query })` performs full-text search across all entries.
4. **Write** — `wiki_write({ title, content, tags })` creates or updates an entry directly.
5. **Ingest** — `wiki_ingest({ url_or_text })` ingests external content (URLs or raw text) into the knowledge base.
6. **Log** — `wiki_log({ message, tags })` appends a timestamped log entry for decisions, progress notes, or session journals.

### The compounding effect

After every analysis or research task, the agent saves 2-3 key insights. The wiki tools let agents browse, search, and organize this knowledge. The next agent (or the same agent in a new session) starts with a rich knowledge base instead of a blank slate.

Supabase is the source of truth. The local `.md` folder is a read-only rendered cache. No sync conflicts, no merge issues.

### Tag vocabulary

Use consistent tags so grouping works effectively: `decision`, `pattern`, `insight`, `preference`, `learning`, `principle`, `synthesis`.

## Core Workflow

```
skills({ action: "activate", pack_id: "planning" })
→ list_tasks → claim_task → wiki_search → execute_task
→ get_execution_status (poll) → save → complete_task
```

## Privacy

- PII redacted locally before LLM calls
- Context stored in Supabase with row-level security + local .md cache at ~/.crowdlisten/context/
- User's own API keys for extraction
- No data syncs without explicit user action
- Agent-proxied tools go through `agent.crowdlisten.com` with your API key
