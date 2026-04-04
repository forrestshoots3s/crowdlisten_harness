# Tools Reference

Technical reference for all CrowdListen Harness MCP tools. Organized by feature. Each tool lists its parameters, return shape, and code path.

**Skill pack system**: Tools are grouped into packs. Only the `core` pack is always active. Call `list_skill_packs` then `activate_skill_pack` to unlock others. See [Skill Discovery](#skill-discovery) for details.

**Auth model**: All tools authenticate via Supabase session token stored at `~/.crowdlisten/auth.json`. Sign in with `npx @crowdlisten/harness login`.

---

## Task Management

Pack: `setup` + `planning`

### `get_or_create_global_board`

Get (or auto-create) the user's single global task board. Call once at session start to get `board_id`.

| Parameter | Required | Description |
|-----------|----------|-------------|
| *(none)* | | |

**Returns**: `{ board_id, name, status: "created" | "exists" }`

> **Code**: `src/tools.ts` handleTool() -> `getOrCreateGlobalBoard()` -> Supabase `kanban_boards` + `kanban_columns` tables

### `list_projects`

List all projects the authenticated user can access.

| Parameter | Required | Description |
|-----------|----------|-------------|
| *(none)* | | |

**Returns**: `{ projects: [{ id, name }], count }`

> **Code**: `src/tools.ts` handleTool() -> Supabase `projects` table, ordered by `updated_at` desc, limit 20

### `list_tasks`

List tasks on a board. Defaults to the global board.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `board_id` | No | Board UUID (defaults to global board) |
| `status` | No | Filter: `todo`, `inprogress`, `inreview`, `done`, `cancelled` |
| `limit` | No | Max results (default 50) |

**Returns**: `{ tasks: [{ id, title, description, status, priority, labels, column, ... }], count, board_id }`

> **Code**: `src/tools.ts` handleTool() -> Supabase `kanban_cards` table with join on `kanban_columns`, ordered by `position`

### `get_task`

Get full details of a single task including board and column info.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `task_id` | Yes | Card/task UUID |

**Returns**: `{ task: { id, title, description, status, priority, labels, column: { id, name }, board: { id, name, project_id }, ... } }`

> **Code**: `src/tools.ts` handleTool() -> Supabase `kanban_cards` with joins on `kanban_columns` and `kanban_boards`

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

### `update_task`

Update title, description, status, or priority. Pass only changed fields.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `task_id` | Yes | Card/task UUID |
| `title` | No | New title |
| `description` | No | New description |
| `status` | No | `todo`, `inprogress`, `inreview`, `done`, `cancelled` |
| `priority` | No | `low`, `medium`, `high` |

**Returns**: `{ task: { id, title, status, priority }, status: "updated" }`

> **Code**: `src/tools.ts` handleTool() -> Supabase `kanban_cards` update. Status changes also move `column_id` via `getColumnByStatus()`.

### `delete_task`

Permanently delete a task. Cannot be undone.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `task_id` | Yes | Card/task UUID |

**Returns**: `{ deleted_task_id, status: "deleted" }`

> **Code**: `src/tools.ts` handleTool() -> Supabase `kanban_cards` delete

### `migrate_to_global_board`

Move all tasks from all boards to the global board. One-time consolidation utility.

| Parameter | Required | Description |
|-----------|----------|-------------|
| *(none)* | | |

**Returns**: `{ migrated, total_found, global_board_id, status: "migration_complete" }`

> **Code**: `src/tools.ts` handleTool() -> queries all user's `kanban_cards` not on global board, updates each `board_id` + `column_id`

---

## Task Execution & Sessions

Pack: `planning` + `sessions`

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

Mark a task as done. Auto-completes any active plan.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `task_id` | Yes | Card/task UUID |
| `summary` | No | Completion summary (logged to session) |

**Returns**: `{ task_id, status: "done" }`

> **Code**: `src/tools.ts` handleTool() -> updates `kanban_cards` to `done`, updates `planning_context` plan status to `completed`, calls `logToSession()` if summary provided

### `log_progress`

Log a progress note to the task's execution session.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `task_id` | Yes | Card/task UUID |
| `message` | Yes | Progress message |
| `session_id` | No | Specific session UUID (defaults to most recent active session) |

**Returns**: `{ task_id, session_id, status: "logged" }`

> **Code**: `src/tools.ts` handleTool() -> `logToSession()` -> inserts into Supabase `kanban_session_logs`

### `start_session`

Start a new parallel agent session for a task. Use when multiple agents work on different aspects of the same task. `claim_task` already creates one session.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `task_id` | Yes | Card/task UUID |
| `executor` | No | Agent type |
| `focus` | Yes | What this session will work on |

**Returns**: `{ session_id, workspace_id, executor, focus, status, started_at, branch }`

> **Code**: `src/tools.ts` handleTool() -> finds or creates `kanban_workspaces`, inserts into `kanban_sessions` with `status: "running"`

### `list_sessions`

List all sessions for a task with workspace info.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `task_id` | Yes | Card/task UUID |
| `status` | No | Filter: `idle`, `running`, `completed`, `failed`, `stopped` |

**Returns**: `{ sessions: [{ session_id, workspace_id, branch, executor, focus, status, started_at, completed_at }], count, task_id }`

> **Code**: `src/tools.ts` handleTool() -> joins `kanban_workspaces` and `kanban_sessions` tables

### `update_session`

Update a session's status or focus.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `session_id` | Yes | Session UUID |
| `status` | No | `idle`, `running`, `completed`, `failed`, `stopped` |
| `focus` | No | Updated focus description |

**Returns**: `{ session: { id, workspace_id, executor, focus, status, ... }, status: "updated" }`

> **Code**: `src/tools.ts` handleTool() -> Supabase `kanban_sessions` update. Sets `completed_at` when status is `completed`.

### `execute_task`

Trigger server-side AI agent execution. The agent runs on the CrowdListen backend. Returns a `process_id` to poll.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `session_id` | Yes | Session UUID (from `claim_task` or `start_session`) |
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

## Planning

Pack: `planning`

### `create_plan`

Create an execution plan for a task. Status starts as `draft`. Lifecycle: draft -> review -> approved -> executing -> completed.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `task_id` | Yes | Card/task UUID |
| `approach` | Yes | The proposed approach |
| `assumptions` | No | List of assumptions |
| `constraints` | No | Known constraints |
| `success_criteria` | No | How to know it's done |
| `risks` | No | Identified risks |
| `estimated_steps` | No | Estimated number of steps |

**Returns**: `{ plan_id, status: "draft", version: 1 }`

> **Code**: `src/tools.ts` handleTool() -> resolves `project_id` from task's board, inserts into Supabase `planning_context` with `type: "plan"`

### `get_plan`

Get the active plan for a task with version history.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `task_id` | Yes | Card/task UUID |

**Returns**: `{ plan: { id, title, body, metadata, status, version, ... } | null, versions: [{ version, title, body, feedback, ... }] }`

> **Code**: `src/tools.ts` handleTool() -> Supabase `planning_context` (active plan) + `planning_context_versions` (history)

### `update_plan`

Iterate on a plan. Content changes archive the current version. Setting `feedback` auto-reverts status to `draft`.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `plan_id` | Yes | Plan UUID |
| `approach` | No | Updated approach |
| `status` | No | `draft`, `review`, `approved`, `executing`, `completed` |
| `feedback` | No | Human feedback (auto-reverts to draft) |
| `assumptions` | No | Updated assumptions |
| `constraints` | No | Updated constraints |
| `success_criteria` | No | Updated criteria |
| `risks` | No | Updated risks |

**Returns**: `{ plan_id, version, status }`

> **Code**: `src/tools.ts` handleTool() -> archives current version to `planning_context_versions`, updates `planning_context`. Version increments on content/feedback changes.

---

## Memory & Knowledge Base

Pack: `core` (always active)

Supabase `memories` table is the source of truth. Local `.md` files at `~/.crowdlisten/context/` are a rendered cache that agents browse via `INDEX.md`.

### `save`

Save context that persists across sessions. Renders to local `.md` knowledge base. Dual-writes to `project_insights` for frontend visibility when tags include `decision`, `pattern`, `preference`, `learning`, or `principle`.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `title` | Yes | Short title |
| `content` | Yes | The content to remember |
| `tags` | No | Freeform tags, e.g. `["decision", "auth", "pattern"]` |
| `project_id` | No | Project scope |
| `task_id` | No | Task association |
| `confidence` | No | 0.0--1.0 (default 1.0) |

**Returns**: `{ saved: true, id, title, tags, supabase: true|false }`

> **Code**: `src/tools.ts` handleTool() -> inserts into Supabase `memories` table, calls `renderEntry()` from `src/context/md-store.ts`. Falls back to local `context.json` via `addBlocks()` if Supabase fails.

### `recall`

Search saved context using keyword matching. For structured browsing, read `~/.crowdlisten/context/INDEX.md` directly.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `search` | No | Natural language search query (matches title and content via `ILIKE`) |
| `tags` | No | Filter by tags (array, uses `overlaps`) |
| `project_id` | No | Filter by project |
| `limit` | No | Max results (default 20) |

**Returns**: `{ memories: [...], count, search_mode: "keyword" | "local_md", index_path }`

> **Code**: `src/tools.ts` handleTool() -> Supabase `memories` table query with `ILIKE` text search. Falls back to `searchLocalIndex()` from `src/context/md-store.ts`.

### `sync_context`

Pull all context from cloud and rebuild local `.md` knowledge base. Pass `organize=true` to also detect near-duplicates, group by topic, and return an organization report.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `full` | No | Force full rebuild (default: `true`) |
| `organize` | No | Also run dedup/topic grouping and return an organization report (default: `false`) |
| `dry_run` | No | When `organize=true`, preview only without file changes (default: `false`) |

**Returns (sync only)**: `{ synced: true, entry_count, index_path, meta }`

**Returns (organize=true)**: `{ synced: true, entry_count, index_path, meta, total_entries, tag_groups, topic_candidates, duplicates, dry_run, hint }`

> **Code**: `src/tools.ts` handleTool() -> fetches all `memories` rows, calls `renderAll()` from `src/context/md-store.ts`. When `organize=true`, also computes Jaccard similarity (>= 0.7 on title words), groups by tag, and rebuilds INDEX.md (unless `dry_run`).

### `publish_context`

Publish a saved memory to a team. Teammates see it in INDEX.md `## Shared` section after `sync_context`.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `memory_id` | Yes | Memory UUID |
| `team_id` | Yes | Team UUID |

**Returns**: `{ published: true, memory_id, team_id }`

> **Code**: `src/tools.ts` handleTool() -> Supabase `memories` update: sets `is_published`, `published_at`, `team_id`

---

## Social Listening

Pack: `social-listening`

Platforms: `tiktok`, `twitter`, `reddit`, `instagram`, `youtube`, `moltbook`. Use `"all"` where supported.

### `search_content`

Search for posts and discussions across social platforms.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `platform` | Yes | Platform name or `"all"` |
| `query` | Yes | Search query (keywords, hashtags) |
| `limit` | No | Max posts (1--50, default 10) |
| `useVision` | No | Force vision extraction (treats `query` as a URL) |

**Returns**: `{ platform, query, count, posts: [...] }`

> **Code**: `src/insights/index.ts` handleInsightsTool() -> `src/insights/handlers.ts` searchContent() -> `UnifiedSocialMediaService.searchContent()` or `getCombinedSearchResults()`. Vision mode delegates to `extractWithVision()`.

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

### `get_user_content`

Get recent posts from a specific user/creator.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `platform` | Yes | Platform name |
| `userId` | Yes | User ID or username |
| `limit` | No | Max posts (1--50, default 10) |

**Returns**: `{ platform, userId, count, posts: [...] }`

> **Code**: `src/insights/handlers.ts` getUserContent() -> `UnifiedSocialMediaService.getUserContent()`

### `get_platform_status`

List available platforms and their capabilities.

| Parameter | Required | Description |
|-----------|----------|-------------|
| *(none)* | | |

**Returns**: `{ availablePlatforms: { ... }, totalPlatforms }`

> **Code**: `src/insights/handlers.ts` getPlatformStatus() -> `UnifiedSocialMediaService.getAvailablePlatforms()`

### `health_check`

Check connectivity and health of all configured platforms. Uses cached health data (< 5 min old) from `HealthMonitor` when available.

| Parameter | Required | Description |
|-----------|----------|-------------|
| *(none)* | | |

**Returns**: `{ overall, healthStatus: { [platform]: { status, responseTimeMs, lastChecked, consecutiveFailures, ... } }, source: "cached" | "live", timestamp }`

> **Code**: `src/insights/handlers.ts` healthCheck() -> `HealthMonitor.getSummary()` (cached) or `HealthMonitor.checkAll()` (live), fallback to `UnifiedSocialMediaService.healthCheck()`

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

Analyze a post and its comments -- sentiment, themes, tension synthesis.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `platform` | Yes | Platform name |
| `contentId` | Yes | Content ID |
| `analysisDepth` | No | `surface`, `standard`, `deep`, `comprehensive` (default: `standard`) |

**Returns**: Analysis result object with sentiment, themes, tensions.

> **Code**: `src/insights/handlers.ts` analyzeContent() -> `POST /api/v1/analyze` on agent API

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

### `enrich_content`

Enrich comments with intent detection, stance analysis, engagement scoring.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `platform` | Yes | Platform name |
| `contentId` | Yes | Content ID |
| `question` | No | Analysis context/question |

**Returns**: Enriched comment objects with intent, stance, scores.

> **Code**: `src/insights/handlers.ts` enrichContent() -> fetches up to 200 comments locally, sends to `POST /api/v1/enrich` on agent API

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

Research what the crowd says about a topic. Searches social platforms, clusters opinions, synthesizes structured intelligence enriched with business context. Async -- returns a `job_id`.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `query` | Yes | Research question |
| `platforms` | No | `reddit`, `twitter`, `moltbook`, `xiaohongshu`, `web` (default: all) |
| `depth` | No | `quick` (~30s), `standard` (~90s), `deep` (~120s) |
| `context` | No | Business context. If omitted, auto-recalls saved context via semantic memory (`/agent/v1/content/search`). |

**Returns**: `{ status: "running", job_id, estimated_seconds, message }`

> **Code**: `src/agent-tools.ts` handleAgentTool() -> optionally queries `/agent/v1/content/search` for context, then `agentPost()` -> `POST /api/agents/analyze`

### `crowd_research_status`

Poll the status of a `crowd_research` job.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `job_id` | Yes | Job ID from `crowd_research` |

**Returns (running)**: `{ status: "running" | "queued", job_id, message }`

**Returns (complete)**: `{ status: "complete", takeaway, sentiment, themes, key_opinions, related_questions, source_count, share_url, _knowledge_base_hint }`

> **Code**: `src/agent-tools.ts` handleAgentTool() -> `agentGet()` -> `GET /api/agents/analyze/{job_id}`

---

## Spec Delivery

Pack: `spec-delivery`

Actionable specs generated from crowd feedback analysis. Specs have a lifecycle: `pending` -> `claimed` -> `in_progress` -> `completed`.

### `get_specs`

List actionable specs. Filter by status, type, priority, or minimum confidence.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `project_id` | No | Filter by project UUID |
| `status` | No | `pending`, `claimed`, `in_progress`, `completed`, `rejected` (default: `pending`) |
| `spec_type` | No | `feature`, `bug_fix`, `improvement`, `investigation` |
| `min_confidence` | No | Minimum confidence 0.0--1.0 |
| `priority` | No | `critical`, `high`, `medium`, `low` |
| `limit` | No | Max results (default 20) |

**Returns**: `{ specs: [{ id, spec_type, title, objective, priority, confidence, status, project_id, created_at }], count, filters }`

> **Code**: `src/tools.ts` handleTool() -> Supabase `actionable_specs` table with dynamic filters

### `get_spec_detail`

Get full spec details including evidence citations, acceptance criteria, and formatted markdown.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `spec_id` | Yes | Spec UUID |

**Returns**: `{ spec: { ...full row... }, formatted: "# Title\n..." }`

> **Code**: `src/tools.ts` handleTool() -> Supabase `actionable_specs` single row, renders markdown with evidence and acceptance criteria checklist

### `start_spec`

Claim a spec and begin implementation. Composes `create_task` + `claim_task` internally: creates a kanban card from the spec, moves to In Progress, creates workspace and session.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `spec_id` | Yes | Spec UUID |
| `executor` | No | Agent type (auto-detected if omitted) |

**Returns**: `{ spec_id, task_id, workspace_id, session_id, branch, executor, status: "started", spec: { title, spec_type, priority, objective, acceptance_criteria } }`

> **Code**: `src/tools.ts` handleTool() -> fetches `actionable_specs`, inserts `kanban_cards` with labels, inserts `kanban_workspaces` + `kanban_sessions`, updates spec status to `"claimed"`. Branch pattern: `spec/{slug}-{id8}`

---

## Skill Discovery

Pack: `core` (always active)

### `list_skill_packs`

List all available skill packs with active/available status.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `include_virtual` | No | Include SKILL.md workflow packs (default: `true`) |

**Returns**: `{ packs: [{ id, name, description, toolCount, status, isVirtual }], activePacks, totalPacks, hint }`

> **Code**: `src/tools.ts` handleTool() -> `loadUserState()` from `src/context/user-state.ts`, `listPacks()` from `src/tools/registry.ts`

### `activate_skill_pack`

Activate a skill pack to unlock its tools. For virtual SKILL.md packs, returns the full workflow content instead of adding tools.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `pack_id` | Yes | Pack ID (e.g. `"planning"`, `"social-listening"`, `"competitive-analysis"`) |

**Returns (tool pack)**: `{ activated, type: "tool_pack", name, tools: [...], toolCount, totalActivePacks, _needsListChanged: true }`

**Returns (virtual pack)**: `{ activated, type: "skill_workflow", name, description, instructions: "<SKILL.md content>" }`

> **Code**: `src/tools.ts` handleTool() -> `src/tools/registry.ts` getPack(). Virtual: `getSkillMdContent()` reads SKILL.md from disk. Tool pack: `activatePack()` from `src/context/user-state.ts`, `getPackTools()` from registry. Server fires `tools/list_changed` notification.

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

## Agent Network

Pack: `agent-network`

### `register_agent`

Register this agent in the CrowdListen agent network.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `name` | Yes | Agent display name |
| `capabilities` | No | Array: `analysis`, `planning`, `coding`, `research`, `content` |
| `executor` | No | `CLAUDE_CODE`, `CURSOR`, `GEMINI`, `CODEX`, `AMP`, `OPENCLAW` |

**Returns**: Registration result with `agent_id`.

> **Code**: `src/agent-tools.ts` handleAgentTool() -> `agentPost()` -> `POST /api/agents/register`

### `get_capabilities`

List capabilities of agents in the network.

| Parameter | Required | Description |
|-----------|----------|-------------|
| *(none)* | | |

**Returns**: Network capability listing.

> **Code**: `src/agent-tools.ts` handleAgentTool() -> `agentGet()` -> `GET /api/agents/capabilities`

---

## Preferences

Pack: `core` (always active)

### `set_preferences`

Set user preferences for telemetry, proactive suggestions, and cross-project learnings.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `telemetry` | No | `off` (no tracking), `anonymous` (local-only), `community` (anonymous aggregate) |
| `proactive_suggestions` | No | Enable/disable proactive skill pack suggestions |
| `cross_project_learnings` | No | Enable/disable cross-project learning persistence |

**Returns**: `{ updated: [...changes...], preferences: { telemetry, proactiveSuggestions, crossProjectLearnings } }`

> **Code**: `src/tools.ts` handleTool() -> `loadUserState()` / `saveUserState()` from `src/context/user-state.ts`. Persisted to `~/.crowdlisten/user-state.json`.

---

## Context Extraction

These tools process raw text (chat exports, transcripts) through PII redaction and LLM extraction.

### `process_transcript`

Process text through the context extraction pipeline: PII redaction -> LLM extraction -> skill matching.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `text` | Yes | Transcript/chat text (PII redacted before LLM sees it) |
| `source` | No | Source label, e.g. `"slack-export"` (default: `"mcp"`) |
| `is_chat` | No | Chat history mode: extracts style/insight/pattern/preference (default: `true`) |

**Returns**: `{ blocks_extracted, blocks: [...], skills: [...], redaction_stats, total_redactions, chunks_processed }`

> **Code**: `src/tools.ts` handleTool() -> `runPipeline()` from `src/context/pipeline.ts`

### `get_context_blocks`

Retrieve locally-stored context blocks from previous extractions.

| Parameter | Required | Description |
|-----------|----------|-------------|
| *(none)* | | |

**Returns**: `{ count, blocks: [...] }`

> **Code**: `src/tools.ts` handleTool() -> `getBlocks()` from `src/context/store.ts`. Reads `~/.crowdlisten/context.json`.

### `recommend_skills`

Get skill recommendations based on stored context blocks. Matches block content against skill catalog using keyword overlap scoring.

| Parameter | Required | Description |
|-----------|----------|-------------|
| *(none)* | | |

**Returns**: `{ skills: [...] }`

> **Code**: `src/tools.ts` handleTool() -> `getBlocks()` from `src/context/store.ts`, then `matchSkills()` from `src/context/matcher.ts`

---

## Skill Pack Reference

Packs defined in `src/tools/registry.ts` `initializeRegistry()`:

| Pack ID | Name | Tool Count |
|---------|------|------------|
| `core` | Core | 8 (always active) |
| `planning` | Planning & Tasks | 13 |
| `sessions` | Multi-Agent Sessions | 3 |
| `setup` | Setup & Board Management | 5 |
| `social-listening` | Social Listening | 7 |
| `audience-analysis` | Audience Analysis | 6 |
| `analysis` | Analysis Engine | 5 |
| `crowd-intelligence` | Crowd Intelligence | 2 |
| `agent-network` | Agent Network | 2 |
| `spec-delivery` | Spec Delivery | 3 |
| *(virtual)* | SKILL.md workflows | 0 (content only) |
