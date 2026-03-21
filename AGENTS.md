# CrowdListen Planner — Agent Reference

Machine-readable capability description for AI agents.

## Install

```bash
npx @crowdlisten/planner login
```

Auto-configures MCP for Claude Code, Cursor, Gemini CLI, Codex, Amp, and OpenClaw.

## MCP Entry

```json
{
  "crowdlisten/harness": {
    "command": "npx",
    "args": ["-y", "@crowdlisten/planner"]
  }
}
```

## Tools

### Task Management
- `create_task(title, description?, priority?, project_id?)` — Create a task
- `claim_task(task_id, executor?, branch?)` — Start work, returns context + workspace
- `complete_task(task_id, summary?)` — Mark done, auto-complete plan
- `get_task(task_id)` — Full task details
- `update_task(task_id, title?, description?, status?, priority?)` — Update task
- `list_tasks(board_id?, status?, limit?)` — List tasks
- `delete_task(task_id)` — Remove task
- `log_progress(task_id, message)` — Log progress note

### Planning
- `create_plan(task_id, approach, assumptions?, constraints?, success_criteria?, risks?)` — Create execution plan
- `get_plan(task_id)` — Get plan with version history
- `update_plan(plan_id, approach?, status?, feedback?, assumptions?, constraints?, success_criteria?, risks?)` — Iterate on plan

### Knowledge Base
- `query_context(project_id?, task_id?, type?, search?, tags?, limit?)` — Search decisions, patterns, learnings
- `add_context(type, title, body, project_id?, task_id?, tags?, confidence?, supersedes?)` — Write knowledge entry
- `record_learning(task_id, title, body, learning_type?, tags?, promote?)` — Capture outcome

### Sessions & Boards
- `start_session(task_id, focus)` — Start parallel agent session
- `list_sessions(task_id)` — List sessions
- `update_session(session_id, status?, focus?)` — Update session
- `get_or_create_global_board()` — Get global board
- `list_projects()` — List projects
- `list_boards(project_id)` — List boards
- `create_board(project_id)` — Create board
- `migrate_to_global_board()` — Consolidate tasks

## Example Workflow

```
1. list_tasks()                    → see what's on the board
2. claim_task(task_id)             → get context, workspace, branch
3. query_context(search="auth")   → check existing decisions
4. create_plan(task_id, approach="...") → draft plan
5. update_plan(plan_id, status="review") → submit for review
6. [human approves]
7. update_plan(plan_id, status="executing") → start work
8. record_learning(task_id, title="...", body="...", promote=true)
9. complete_task(task_id, summary="...")
```
