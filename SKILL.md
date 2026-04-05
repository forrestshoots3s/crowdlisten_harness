---
name: crowdlisten
description: Audience intelligence, social listening, and planning for AI agents
version: 2.0.0
user-invocable: false
metadata:
  openclaw:
    requires:
      bins: [node, npx]
    optionalEnv: [CROWDLISTEN_AGENT_URL]
    emoji: "📊"
    category: research
    tags: [audience-intelligence, social-listening, planning, knowledge-base, context-extraction]
    transports:
      stdio: "npx @crowdlisten/harness"
      http: "https://mcp.crowdlisten.com/mcp"
---

# CrowdListen Harness

Audience intelligence, social listening, planning, and context extraction for AI agents.

## What It Does

CrowdListen Harness is a single MCP gateway to ~28 tools across 6 skill packs:

- **Core** (8 tools, always on) — Wiki knowledge base (save, wiki_list, wiki_read, wiki_write, wiki_search, wiki_ingest, wiki_log), skill discovery
- **Planning** (6 tools) — Task management, execution, progress tracking, server-side agent execution
- **Social Listening** (5 tools) — Search Reddit, YouTube, TikTok, Twitter, Instagram, Xiaohongshu
- **Audience Analysis** (3 tools) — Content analysis, opinion clustering, insight extraction
- **Analysis** (5 tools) — Run audience analyses, generate specs from results
- **Crowd Intelligence** (1 tool) — Context-enriched crowd research with async polling

## Quick Start

```bash
# Install and auto-configure
npx @crowdlisten/harness login

# Or connect via HTTP
{ "url": "https://mcp.crowdlisten.com/mcp" }
```

## Transports

| Transport | URL | Auth |
|-----------|-----|------|
| stdio | `npx @crowdlisten/harness` | Browser login (stored in ~/.crowdlisten/) |
| HTTP | `https://mcp.crowdlisten.com/mcp` | Bearer token (JWT or API key) |
| REST | `https://mcp.crowdlisten.com/tools/{name}` | Bearer token |

## Core Workflow

```
skills({ action: "activate", pack_id: "planning" })
→ list_tasks → claim_task → wiki_search → execute_task
→ get_execution_status (poll) → save → complete_task
```

Every task captures decisions, patterns, and learnings via `save`. Use `wiki_search` to find context and `wiki_list` to browse.

## Links

- Website: https://crowdlisten.com
- GitHub: https://github.com/Crowdlisten/crowdlisten_harness
- OpenAPI: https://mcp.crowdlisten.com/openapi.json
