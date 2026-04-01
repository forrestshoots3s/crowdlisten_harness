# CrowdListen Harness — Agent Reference

Machine-readable capability description for AI agents.

## Ecosystem

CrowdListen is two MCP servers that work together:
- **Insights** ([crowdlisten](https://github.com/Crowdlisten/crowdlisten_insights)) — discovers audience signal from social platforms
- **Harness** (this server) — plans and tracks work with a cloud-synced knowledge base, proxies analysis and generation

Install both with one command: `npx @crowdlisten/planner login`

## Onboard

### One command
```bash
npx @crowdlisten/planner login
```
Auto-configures MCP for Claude Code, Cursor, Gemini CLI, Codex, OpenClaw.

### Manual MCP config (stdio)
```json
{
  "crowdlisten/harness": {
    "command": "npx",
    "args": ["-y", "@crowdlisten/planner"]
  }
}
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
| MCP stdio | `npx @crowdlisten/planner` — ~41 tools | Local agents |
| MCP HTTP | `POST https://mcp.crowdlisten.com/mcp` | Remote agents, cloud |
| REST | `POST https://mcp.crowdlisten.com/tools/{name}` | Non-MCP integrations |
| OpenAPI | `GET https://mcp.crowdlisten.com/openapi.json` | Docs, code gen |
| CLI | `npx @crowdlisten/planner login/setup/serve/openapi` | Auth, config, hosting |
| Web UI | `npx @crowdlisten/planner context` → localhost:3847 | Visual context extraction |

## Core Workflow (7 steps)

```
list_tasks → claim_task → query_context → create_plan → [human review] → execute → record_learning → complete_task
```

1. **list_tasks** — See what's on the board
2. **claim_task(task_id)** — Start work, get context (semantic map + knowledge base + existing plan)
3. **query_context(search="...")** — Check existing decisions, patterns, learnings
4. **create_plan(task_id, approach="...")** — Draft plan with approach, assumptions, risks
5. **update_plan(plan_id, status="review")** — Submit for human review
6. _Human approves or leaves feedback_ → **get_plan** to check, iterate if needed
7. **Execute** — `update_plan(status="executing")`, work, `log_progress`, `add_context`
8. **record_learning(task_id, ...)** — Capture what you learned (promote=true for project-wide)
9. **complete_task(task_id, summary="...")** — Mark done, plan auto-completed

Plans are optional — quick tasks can skip to execution. Knowledge capture still applies.

## Task Management (8 tools)

- **list_tasks**(board_id?, status?, limit?) — List tasks on the board. Call first. Filter: todo, inprogress, inreview, done, cancelled.
- **get_task**(task_id) — Full task details including description, status, priority, labels.
- **create_task**(title, description?, priority?, project_id?, board_id?, labels?) — Create a new task. Uses global board by default.
- **update_task**(task_id, title?, description?, status?, priority?) — Update task fields. Pass only what changes.
- **claim_task**(task_id, executor?, branch?) — Start work. Moves to In Progress, creates workspace + session. Returns context and branch name.
- **complete_task**(task_id, summary?) — Mark done. Call record_learning first. Auto-completes plan.
- **delete_task**(task_id) — Permanently remove a task.
- **log_progress**(task_id, message, session_id?) — Log a progress note during execution.

## Planning (3 tools)

- **create_plan**(task_id, approach, assumptions?, constraints?, success_criteria?, risks?, estimated_steps?) — Create execution plan. Submit with update_plan(status='review').
- **get_plan**(task_id) — Get plan with version history and pending human feedback.
- **update_plan**(plan_id, approach?, status?, feedback?, ...) — Iterate on plan. Set status='review' to submit, status='executing' after approval.

## Knowledge Base (4 tools)

- **query_context**(project_id?, task_id?, type?, search?, tags?, limit?) — Search decisions, constraints, preferences, patterns, learnings, principles.
- **add_context**(type, title, body, project_id?, task_id?, tags?, confidence?, supersedes?) — Write to knowledge base during execution.
- **record_learning**(task_id, title, body, learning_type?, tags?, promote?) — Capture learning. Use promote=true for project-wide visibility.
- **get_or_create_global_board**() — Get your global board. Call once if you need the board_id.

## Sessions (3 tools) — Parallel Agents

- **start_session**(task_id, executor?, focus) — Start additional parallel session.
- **list_sessions**(task_id, status?) — List sessions showing status and focus.
- **update_session**(session_id, status?, focus?) — Update session: idle, running, completed, failed, stopped.

## Context Extraction (3 tools)

- **process_transcript**(text, source?, is_chat?) — PII redaction → LLM extraction → skill matching. Returns blocks + skills.
- **get_context_blocks**() — Retrieve locally-stored context blocks.
- **recommend_skills**() — Get skill recommendations based on stored context.

## Skill Discovery (3 tools)

- **discover_skills**(context?, category?, tier?, limit?) — Context-driven discovery across 154 skills.
- **search_skills**(query, tier?, category?) — Text search across all skills.
- **install_skill**(skill_id, target_dir?) — Install a skill by ID.

## Setup (4 tools)

- **list_projects**() — List accessible projects.
- **list_boards**(project_id) — List boards for a project.
- **create_board**(project_id, name?) — Create board with default columns.
- **migrate_to_global_board**() — Consolidate all tasks to global board.

## Analysis (5 tools) — requires CROWDLISTEN_API_KEY

- **run_analysis**(project_id, question, platforms?, max_results?) — Run audience analysis across Reddit, YouTube, TikTok, Twitter, Instagram, Xiaohongshu. Streams results.
- **continue_analysis**(analysis_id, question) — Follow-up question on existing analysis.
- **get_analysis**(analysis_id) — Get full analysis results with themes, sentiment, quotes.
- **list_analyses**(project_id, limit?) — List analyses for a project.
- **generate_specs**(project_id, analysis_id?, spec_type?) — Generate feature requests, user stories, acceptance criteria from analysis.

## Content & Vectors (4 tools) — requires CROWDLISTEN_API_KEY

- **ingest_content**(project_id, content, source_url?, title?, metadata?) — Ingest content into vector store.
- **search_vectors**(project_id, query, limit?, threshold?) — Semantic search across ingested content.
- **get_content_stats**(project_id) — Document count, chunks, storage usage.
- **delete_content**(content_id) — Delete content document and embeddings.

## Document Generation (2 tools) — requires CROWDLISTEN_API_KEY

- **generate_prd**(project_id, analysis_ids?, template?, sections?) — Generate PRD from analysis. Templates: standard, lean, technical, marketing.
- **update_prd_section**(document_id, section, instructions?, content?) — Update a specific PRD section.

## LLM Proxy (2 tools) — free, no API key

- **llm_complete**(prompt, model?, max_tokens?, temperature?, system?) — LLM completion through CrowdListen. Default: gpt-4o-mini.
- **list_llm_models**() — List available models and capabilities.

## Agent Network (3 tools) — mixed auth

- **register_agent**(name, capabilities?, executor?) — Register in agent network. Free.
- **get_capabilities**() — List network capabilities. Free.
- **submit_analysis**(agent_id, analysis_id, summary) — Share analysis results. Requires API key.

## Example Workflow

```
# 1. See what's available
list_tasks()

# 2. Claim a task
claim_task(task_id="abc-123")
  → returns: context, workspace_id, branch

# 3. Check existing knowledge
query_context(search="auth patterns")
  → returns: relevant decisions, patterns, learnings

# 4. Create a plan
create_plan(task_id="abc-123", approach="Implement JWT auth with refresh tokens")

# 5. Submit for review
update_plan(plan_id="plan-456", status="review")

# 6. After approval, execute
update_plan(plan_id="plan-456", status="executing")

# 7. During work, capture decisions
add_context(type="decision", title="Use httpOnly cookies", body="More secure than localStorage")

# 8. Run analysis for user research
run_analysis(project_id="proj-789", question="What do users say about auth UX?", platforms=["reddit", "twitter"])

# 9. Capture learning
record_learning(task_id="abc-123", title="httpOnly cookies need CORS credentials", body="Set credentials: 'include'", promote=true)

# 10. Complete
complete_task(task_id="abc-123", summary="JWT auth implemented")
```

## Privacy Model

- PII redacted locally (regex) before any LLM call
- User's own API key used for extraction (OpenAI/Anthropic/Ollama)
- Context blocks stored locally in `~/.crowdlisten/context.json`
- No data syncs without explicit user action
- Agent-proxied tools go through `agent.crowdlisten.com` with your API key
