# Tools Reference

Technical reference for all CrowdListen Harness MCP tools (~28 tools across 6 packs). Organized by feature. Each tool lists its parameters, return shape, and code path.

**Skill pack system**: Tools are grouped into packs. Only the `core` pack is always active. Call `skills({ action: "list" })` then `skills({ action: "activate", pack_id: "..." })` to unlock others. See [Skill Discovery](#skill-discovery) for details.

**Auth model**: All tools authenticate via Supabase session token stored at `~/.crowdlisten/auth.json`. Sign in with `npx @crowdlisten/harness login`.

---

## Task Management

Pack: `planning`

### `list_tasks`

List tasks on a board, or get full details of a single task. Defaults to the global board.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `task_id` | No | Card/task UUID — if provided, returns full details of that single task |
| `board_id` | No | Board UUID (defaults to global board) |
| `status` | No | Filter: `todo`, `inprogress`, `inreview`, `done`, `cancelled` |
| `limit` | No | Max results (default 50) |

**Returns (list)**: `{ tasks: [{ id, title, description, status, priority, labels, column, ... }], count, board_id }`

**Returns (single task)**: `{ task: { id, title, description, status, priority, labels, column: { id, name }, board: { id, name, project_id }, ... } }`

> **Code**: `src/tools.ts` handleTool() -> Supabase `kanban_cards` table with join on `kanban_columns`, ordered by `position`

### `create_task`

Create a new task. Defaults to global board, To Do column.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `title` | Yes | Task title |
| `description` | No | Task description |
| `board_id` | No | Board UUID (defaults to global board) |
| `priority` | No | `low`, `medium`, `high` |
| `project_id` | No | Tag task with a project (added as label `project:{id}`) |
| `labels` | No | Array of `{ name, color }` objects |

**Returns**: `{ task_id, board_id, status: "created", project_id }`

> **Code**: `src/tools.ts` handleTool() -> resolves `column_id` via `getColumnByStatus()`, inserts into Supabase `kanban_cards`

### `claim_task`

Start working on a task. Moves it to In Progress, creates a workspace and session, returns project context and any existing plan.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `task_id` | Yes | Card/task UUID |
| `executor` | No | Agent type: `CLAUDE_CODE`, `CURSOR`, `GEMINI`, `CODEX`, `AMP`, `OPENCLAW`, `OPENCODE`, `COPILOT`, `DROID`, `QWEN_CODE` |
| `branch` | No | Custom git branch name (auto-generated as `task/{slug}-{id8}` if omitted) |

**Returns**: `{ task_id, workspace_id, session_id, branch, executor, status: "claimed", project_context, context_entries[], existing_plan }`

> **Code**: `src/tools.ts` handleTool() -> updates `kanban_cards` status, inserts into `kanban_workspaces` and `kanban_sessions`, queries `planning_context` for existing plan and context entries

### `complete_task`

Mark a task as done, or log a progress note. Auto-completes any active plan when completing.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `task_id` | Yes | Card/task UUID |
| `summary` | No | Completion summary (logged to session) |
| `progress` | No | If `true`, logs a progress note instead of completing the task |
| `message` | No | Progress message (used when `progress: true`) |

**Returns (complete)**: `{ task_id, status: "done" }`

**Returns (progress)**: `{ task_id, session_id, status: "logged" }`

> **Code**: `src/tools.ts` handleTool() -> updates `kanban_cards` to `done`, updates `planning_context` plan status to `completed`, calls `logToSession()` if summary/progress provided

### `execute_task`

Trigger server-side AI agent execution. The agent runs on the CrowdListen backend. Returns a `process_id` to poll.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `session_id` | Yes | Session UUID (from `claim_task`) |
| `prompt` | Yes | Instructions for the AI agent |
| `executor` | No | `CLAUDE_CODE`, `CODEX`, `GEMINI_CLI`, `AMP` (default: `AMP`) |
| `cwd` | No | Working directory for execution |
| `auto_approve` | No | Auto-approve tool calls (default: `false`) |
| `allowed_tools` | No | Restrict which tools the agent can use |
| `context` | No | Additional context prepended to the prompt |

**Returns**: `{ process_id, status: "running", message }`

> **Code**: `src/agent-tools.ts` handleAgentTool() -> `agentPost()` -> `POST /agent/v1/kanban/agents/execute`

### `get_execution_status`

Poll status and logs of a server-side agent execution.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `process_id` | Yes | Process UUID from `execute_task` |

**Returns**: `{ status: "running" | "completed" | "failed" | "killed", logs: [...] }`

> **Code**: `src/agent-tools.ts` handleAgentTool() -> `agentGet()` -> `GET /agent/v1/kanban/processes/{process_id}`

---

## Memory & Knowledge Base

Pack: `core` (always active)

Supabase `memories` table is the source of truth. Local `.md` files at `~/.crowdlisten/context/` are a rendered cache.

### `save`

Save context that persists across sessions. Renders to local `.md` knowledge base. Dual-writes to `project_insights` for frontend visibility when tags include `decision`, `pattern`, `preference`, `learning`, or `principle`. Pass `publish` to share with a team.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `title` | Yes | Short title |
| `content` | Yes | The content to remember |
| `tags` | No | Freeform tags, e.g. `["decision", "auth", "pattern"]` |
| `project_id` | No | Project scope |
| `task_id` | No | Task association |
| `confidence` | No | 0.0--1.0 (default 1.0) |
| `publish` | No | `{ team_id }` — publish to a team when saving |

**Returns**: `{ saved: true, id, title, tags, supabase: true|false, published?: true }`

> **Code**: `src/tools.ts` handleTool() -> inserts into Supabase `memories` table, calls `renderEntry()` from `src/context/md-store.ts`. Falls back to local `context.json` via `addBlocks()` if Supabase fails. When `publish` is provided, also sets `is_published`, `published_at`, `team_id`.

### `wiki_list`

Browse the knowledge base index. Returns entries grouped by tag with metadata.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `tag` | No | Filter by tag |
| `limit` | No | Max results (default 50) |

**Returns**: `{ entries: [...], count, index_path }`

> **Code**: `src/tools.ts` handleTool() -> Supabase `memories` table query, grouped by tags.

### `wiki_read`

Read a single knowledge base entry by ID.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `entry_id` | Yes | Memory UUID |

**Returns**: `{ entry: { id, title, content, tags, created_at, ... } }`

> **Code**: `src/tools.ts` handleTool() -> Supabase `memories` table single row fetch.

### `wiki_write`

Write or update a knowledge base entry directly.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `title` | Yes | Entry title |
| `content` | Yes | Entry content |
| `tags` | No | Freeform tags |
| `entry_id` | No | If provided, updates existing entry instead of creating new |

**Returns**: `{ id, title, status: "created" | "updated" }`

> **Code**: `src/tools.ts` handleTool() -> Supabase `memories` table upsert + local `.md` render.

### `wiki_search`

Full-text search across all knowledge base entries.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `query` | Yes | Search query |
| `limit` | No | Max results (default 20) |

**Returns**: `{ results: [...], count, query }`

> **Code**: `src/tools.ts` handleTool() -> Supabase `memories` table query with `ILIKE` text search.

### `wiki_ingest`

Ingest external content (URL or raw text) into the knowledge base.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `url_or_text` | Yes | URL to fetch or raw text to ingest |
| `source` | No | Source label (e.g. `"article"`, `"slack-export"`) |

**Returns**: `{ ingested: true, id, title, source }`

> **Code**: `src/tools.ts` handleTool() -> fetches URL or processes text, inserts into Supabase `memories` table.

### `wiki_log`

Append a timestamped log entry for decisions, progress notes, or session journals.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `message` | Yes | Log message |
| `tags` | No | Freeform tags (e.g. `["decision", "session"]`) |

**Returns**: `{ id, logged: true, timestamp }`

> **Code**: `src/tools.ts` handleTool() -> inserts into Supabase `memories` table with auto-generated title and timestamp.

---

## Social Listening

Pack: `social-listening`

Platforms: `tiktok`, `twitter`, `reddit`, `instagram`, `youtube`, `moltbook`. Use `"all"` where supported.

### `search_content`

Search for posts and discussions across social platforms. Pass `type: "user"` with `userId` to get a specific user's recent posts.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `platform` | Yes | Platform name or `"all"` |
| `query` | Yes | Search query (keywords, hashtags) |
| `limit` | No | Max posts (1--50, default 10) |
| `type` | No | `"user"` — switches to user content mode |
| `userId` | No | User ID or username (required when `type: "user"`) |
| `useVision` | No | Force vision extraction (treats `query` as a URL) |

**Returns**: `{ platform, query, count, posts: [...] }`

> **Code**: `src/insights/index.ts` handleInsightsTool() -> `src/insights/handlers.ts` searchContent() -> `UnifiedSocialMediaService.searchContent()` or `getUserContent()`. Vision mode delegates to `extractWithVision()`.

### `get_content_comments`

Get comments/replies for a specific post. Handles TikTok URL resolution and Instagram shortcode extraction automatically.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `platform` | Yes | Platform name |
| `contentId` | Yes | Content ID or URL |
| `limit` | No | Max comments (1--100, default 20) |
| `useVision` | No | Force vision extraction (treats `contentId` as URL) |

**Returns**: `{ platform, contentId, count, comments: [...] }`

> **Code**: `src/insights/handlers.ts` getContentComments() -> `TikTokUrlUtils.resolveUrl()` / `InstagramUrlUtils.resolveUrl()` for URL normalization, then `UnifiedSocialMediaService.getContentComments()`

### `get_trending_content`

Get currently trending posts from a platform.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `platform` | Yes | Platform name or `"all"` |
| `limit` | No | Max posts (1--50, default 10) |

**Returns**: `{ platform, count, posts: [...] }`

> **Code**: `src/insights/handlers.ts` getTrendingContent() -> `UnifiedSocialMediaService.getTrendingContent()` or `getCombinedTrendingContent()`

### `platform_status`

List available platforms and their capabilities. Pass `diagnose: true` for full connectivity health check.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `diagnose` | No | If `true`, runs full health check on all platforms (default: `false`) |

**Returns (status)**: `{ availablePlatforms: { ... }, totalPlatforms }`

**Returns (diagnose=true)**: `{ overall, healthStatus: { [platform]: { status, responseTimeMs, lastChecked, consecutiveFailures, ... } }, source: "cached" | "live", timestamp }`

> **Code**: `src/insights/handlers.ts` getPlatformStatus() -> `UnifiedSocialMediaService.getAvailablePlatforms()`. When `diagnose: true`, also calls `HealthMonitor.getSummary()` or `HealthMonitor.checkAll()`.

### `extract_url`

Extract content from any URL using vision (screenshot + LLM analysis). Requires at least one LLM API key (`ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, or `OPENAI_API_KEY`).

| Parameter | Required | Description |
|-----------|----------|-------------|
| `url` | Yes | URL to extract from |
| `mode` | No | `posts`, `comments`, `raw` (default: `posts`) |
| `limit` | No | Max items (1--50, default 10) |

**Returns**: `{ url, mode, provider, extractionMethod: "vision", posts|comments|raw, count }`

> **Code**: `src/insights/handlers.ts` extractWithVision() -> `VisionExtractor.extract()` from `src/insights/vision/VisionExtractor.ts`

---

## Audience Analysis

Pack: `audience-analysis`

These tools fetch comments locally via `UnifiedSocialMediaService`, then delegate analysis to the agent API.

### `analyze_content`

Analyze a post and its comments -- sentiment, themes, tension synthesis. Pass `enrichment: true` for intent/stance analysis on individual comments.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `platform` | Yes | Platform name |
| `contentId` | Yes | Content ID |
| `analysisDepth` | No | `surface`, `standard`, `deep`, `comprehensive` (default: `standard`) |
| `enrichment` | No | If `true`, also runs intent detection, stance analysis, and engagement scoring on comments |
| `question` | No | Analysis context/question (used with `enrichment: true`) |

**Returns**: Analysis result object with sentiment, themes, tensions. When `enrichment: true`, also includes enriched comment objects with intent, stance, scores.

> **Code**: `src/insights/handlers.ts` analyzeContent() -> `POST /api/v1/analyze` on agent API. When `enrichment: true`, also calls `POST /api/v1/enrich`.

### `cluster_opinions`

Group comments into engagement-weighted semantic opinion clusters.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `platform` | Yes | Platform name |
| `contentId` | Yes | Content ID |
| `clusterCount` | No | Number of clusters (2--15, default 5) |
| `includeExamples` | No | Include example comments (default: `true`) |
| `weightByEngagement` | No | Weight by likes/replies (default: `true`) |

**Returns**: `{ platform, contentId, totalComments, clusterCount, clusters: [...] }`

> **Code**: `src/insights/handlers.ts` clusterOpinions() -> fetches up to 500 comments locally, sends payload to `POST /api/v1/cluster` on agent API (max 150 comments)

### `extract_insights`

Extract pain points, feature requests, and other actionable insights from post comments.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `platform` | Yes | Platform name |
| `contentId` | Yes | Content ID |
| `categories` | No | Insight categories to extract (default: all) |

**Returns**: Extracted insights grouped by category.

> **Code**: `src/insights/handlers.ts` extractInsights() -> fetches comments locally, sends to agent API for extraction.

---

## Analysis Runs

Pack: `analysis`

These tools run full audience analyses through the Agno agent backend.

### `run_analysis`

Run an audience analysis on a project. Streams results via SSE.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `project_id` | Yes | Project UUID |
| `question` | Yes | Research question |
| `platforms` | No | Platforms to search (default: all) |
| `max_results` | No | Max results per platform (default 20) |

**Returns**: Final analysis with themes, sentiment, insights, recommendations. Includes `_knowledge_base_hint`.

> **Code**: `src/agent-tools.ts` handleAgentTool() -> `agentStream()` -> `POST /agent/v1/analysis/run` (180s timeout)

### `continue_analysis`

Continue a previous analysis with a follow-up question.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `analysis_id` | Yes | Analysis UUID from `run_analysis` |
| `question` | Yes | Follow-up question |

**Returns**: Continuation analysis result.

> **Code**: `src/agent-tools.ts` handleAgentTool() -> `agentPost()` -> `POST /agent/v1/analysis/{analysis_id}/continue`

### `get_analysis`

Get full results of a completed analysis.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `analysis_id` | Yes | Analysis UUID |

**Returns**: Complete analysis with themes, sentiment breakdown, source quotes.

> **Code**: `src/agent-tools.ts` handleAgentTool() -> `agentGet()` -> `GET /agent/v1/analysis/{analysis_id}`

### `list_analyses`

List analyses for a project, newest first.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `project_id` | Yes | Project UUID |
| `limit` | No | Max results (default 20) |

**Returns**: Array of analysis summary objects.

> **Code**: `src/agent-tools.ts` handleAgentTool() -> `agentGet()` -> `GET /agent/v1/projects/{project_id}/analyses?limit={limit}`

### `generate_specs`

Generate product specifications (feature requests, user stories, acceptance criteria) from analysis results.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `project_id` | Yes | Project UUID |
| `analysis_id` | No | Scope to a specific analysis |
| `spec_type` | No | `feature_requests`, `user_stories`, `acceptance_criteria`, `all` (default: `all`) |

**Returns**: Generated spec objects.

> **Code**: `src/agent-tools.ts` handleAgentTool() -> `agentPost()` -> `POST /agent/v1/specs/generate`

---

## Crowd Intelligence

Pack: `crowd-intelligence`

### `crowd_research`

Research what the crowd says about a topic, or poll job status. Pass `action: "start"` to begin async research, `action: "status"` to poll.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `action` | Yes | `"start"` or `"status"` |
| `query` | No | Research question (required for `action: "start"`) |
| `platforms` | No | `reddit`, `twitter`, `moltbook`, `xiaohongshu`, `web` (default: all) |
| `depth` | No | `quick` (~30s), `standard` (~90s), `deep` (~120s) |
| `context` | No | Business context. If omitted, auto-recalls saved context via semantic memory. |
| `job_id` | No | Job ID to poll (required for `action: "status"`) |

**Returns (start)**: `{ status: "running", job_id, estimated_seconds, message }`

**Returns (status/running)**: `{ status: "running" | "queued", job_id, message }`

**Returns (status/complete)**: `{ status: "complete", takeaway, sentiment, themes, key_opinions, related_questions, source_count, share_url, _knowledge_base_hint }`

> **Code**: `src/agent-tools.ts` handleAgentTool() -> For `start`: optionally queries `/agent/v1/content/search` for context, then `agentPost()` -> `POST /api/agents/analyze`. For `status`: `agentGet()` -> `GET /api/agents/analyze/{job_id}`

---

## Skill Discovery

Pack: `core` (always active)

### `skills`

List all available skill packs or activate one. Combines the former `list_skill_packs` and `activate_skill_pack` tools.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `action` | Yes | `"list"` or `"activate"` |
| `pack_id` | No | Pack ID to activate (required for `action: "activate"`, e.g. `"planning"`, `"social-listening"`, `"competitive-analysis"`) |
| `include_virtual` | No | Include SKILL.md workflow packs when listing (default: `true`) |

**Returns (list)**: `{ packs: [{ id, name, description, toolCount, status, isVirtual }], activePacks, totalPacks, hint }`

**Returns (activate/tool pack)**: `{ activated, type: "tool_pack", name, tools: [...], toolCount, totalActivePacks, _needsListChanged: true }`

**Returns (activate/virtual pack)**: `{ activated, type: "skill_workflow", name, description, instructions: "<SKILL.md content>" }`

> **Code**: `src/tools.ts` handleTool() -> For `list`: `loadUserState()` from `src/context/user-state.ts`, `listPacks()` from `src/tools/registry.ts`. For `activate`: `src/tools/registry.ts` getPack(). Virtual: `getSkillMdContent()` reads SKILL.md from disk. Tool pack: `activatePack()` from `src/context/user-state.ts`, `getPackTools()` from registry. Server fires `tools/list_changed` notification.

### `search_skills`

Search or discover skills across all 154 skills (8 native + 146 community). Pass a `query` for keyword search, or pass `context` for context-driven discovery that scores skills against extracted context blocks.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `query` | No | Search query (name, keyword, description text) |
| `context` | No | Raw context text for context-driven discovery. Processes text through extraction pipeline and scores skills against it. |
| `tier` | No | `crowdlisten` (native) or `community` (open source) |
| `category` | No | `development`, `data`, `content`, `research`, `automation`, `design`, `business`, `productivity` |
| `limit` | No | Max results (default 10, used with context-driven discovery) |

**Returns (keyword mode)**: `{ query, results, mode: "keyword", skills: [{ id, name, description, score, tier, category, install_method, install_target }] }`

**Returns (context mode)**: `{ total_available, results, mode: "context-discovery", skills: [{ id, name, description, score, tier, category, install, matched_keywords }] }`

> **Code**: `src/tools.ts` handleTool() -> if `context` provided: `runPipeline()` from `src/context/pipeline.ts` then `discoverSkills()` from `src/context/matcher.ts` (keyword overlap scoring). Otherwise: `searchSkills()` from `src/context/matcher.ts`.

### `install_skill`

Install a skill by ID. Copies SKILL.md content for `copy` type skills, or returns npx/git instructions.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `skill_id` | Yes | Skill ID (e.g. `"comm-typescript-expert"` or `"competitive-analysis"`) |
| `target_dir` | No | Target directory (default: `.claude/commands/`) |

**Returns**: Install instructions varying by method (`copy`, `npx`, `git`).

> **Code**: `src/tools.ts` handleTool() -> `getFullCatalog()` from `src/context/matcher.ts`, returns instructions based on `installMethod`

---

---

## Skill Pack Reference

Packs defined in `src/tools/registry.ts` `initializeRegistry()`:

| Pack ID | Name | Tool Count |
|---------|------|------------|
| `core` | Core | 8 (always active) |
| `planning` | Planning & Tasks | 6 |
| `social-listening` | Social Listening | 5 |
| `audience-analysis` | Audience Analysis | 3 |
| `analysis` | Analysis Engine | 5 |
| `crowd-intelligence` | Crowd Intelligence | 1 |
| *(virtual)* | SKILL.md workflows | 0 (content only) |
