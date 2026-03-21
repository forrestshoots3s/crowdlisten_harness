# CrowdListen Planner

> Planning and delegation system for AI agents.

## Setup

```bash
npx @crowdlisten/planner login
```

One command. Browser opens, sign in to [CrowdListen](https://crowdlisten.com), auto-configures agents. No env vars, no JSON, no API keys.

Also installs [CrowdListen Sources](https://github.com/Crowdlisten/crowdlisten_sources) for cross-channel audience signal.

## What This Does

A planning harness for AI agents -- not a task board that happens to have plans, but a planning system that happens to have tasks. Plan, get feedback, execute with context, capture learnings, and the next task is smarter. Cloud-synced knowledge base means context follows you across agents.

## Architecture

```mermaid
graph TD
    subgraph Human["Human Layer"]
        H_Create["Create Task"]
        H_Review["Review Plan"]
        H_Feedback["Leave Feedback"]
        H_Approve["Approve Plan"]
    end

    subgraph Pipeline["Agent Pipeline"]
        Claim["claim_task<br/>← semantic map<br/>← knowledge base<br/>← existing plan"]
        Query["query_context<br/>Search decisions, patterns,<br/>constraints, learnings"]
        Plan["create_plan<br/>approach, assumptions,<br/>success criteria, risks"]
        Review["update_plan → status: review"]
        Iterate["update_plan<br/>Incorporate feedback,<br/>version archived"]
        Execute["update_plan → status: executing<br/>Agent works on task"]
        Capture["add_context + record_learning<br/>Decisions, patterns, learnings"]
        Complete["complete_task<br/>Plan auto-completed"]
    end

    subgraph Knowledge["Knowledge Base (Supabase)"]
        KB["planning_context<br/>──────────────<br/>decisions │ constraints<br/>preferences │ patterns<br/>learnings │ principles"]
        Versions["planning_context_versions<br/>──────────────<br/>Immutable snapshots<br/>of every plan revision"]
    end

    H_Create --> Claim
    Claim --> Query
    Query --> Plan
    Plan --> Review
    Review --> H_Review
    H_Review --> H_Feedback
    H_Feedback --> Iterate
    H_Review --> H_Approve
    H_Approve --> Execute
    Iterate --> Review
    Execute --> Capture
    Capture --> Complete

    KB -.->|context flows in| Claim
    KB -.->|search| Query
    Capture -.->|knowledge flows out| KB
    Plan -.->|stored as| KB
    Iterate -.->|archived to| Versions
    Complete -.->|next task inherits| KB
```

### Three Layers

```
┌─────────────────────────────────────────────────┐
│  KNOWLEDGE BASE                                 │
│  Decisions, constraints, patterns, principles,  │
│  learnings — persists across all tasks           │
├─────────────────────────────────────────────────┤
│  PLANS                                          │
│  First-class artifacts with lifecycle:           │
│  draft → review → approved → executing → done   │
├─────────────────────────────────────────────────┤
│  TASKS                                          │
│  Executable work units with status tracking     │
└─────────────────────────────────────────────────┘
```

## How It Works

1. **Create a task.**
2. **Agent claims it** -- gets semantic map + knowledge base + existing plan.
3. **Agent creates a plan** -- approach, assumptions, risks, success criteria.
4. **Human reviews** -- leaves feedback or approves.
5. **Agent executes** -- captures decisions, patterns, learnings along the way.
6. **Task completes** -- next task inherits the knowledge.

Plans are optional. Quick tasks can skip straight to execution. Knowledge capture still applies.

## Tools

| Tool | What it does |
|------|-------------|
| `create_task` | Create a task on your board |
| `claim_task` | Start work -- returns context, workspace, branch |
| `complete_task` | Mark done, auto-complete plan |
| `get_task` | Full task details |
| `update_task` | Change title, description, status, priority |
| `list_tasks` | List tasks with optional status filter |
| `delete_task` | Remove a task |
| `log_progress` | Log a note to the execution session |
| `create_plan` | Create execution plan (approach, assumptions, risks) |
| `get_plan` | Get plan with version history |
| `update_plan` | Iterate: update approach, status, or add feedback |
| `query_context` | Search knowledge base (decisions, patterns, etc.) |
| `add_context` | Write to knowledge base |
| `record_learning` | Capture outcome, optionally promote to project scope |
| `start_session` | Start parallel agent session |
| `list_sessions` | List sessions for a task |
| `update_session` | Update session status/focus |
| `get_or_create_global_board` | Get your global board |
| `list_projects` | List accessible projects |
| `list_boards` | List boards for a project |
| `create_board` | Create board with default columns |
| `migrate_to_global_board` | Move all tasks to global board |

Full parameter details: [docs/TOOLS.md](docs/TOOLS.md)

## For Agents

See [AGENTS.md](AGENTS.md) for machine-readable capability descriptions, MCP config, and example workflows.

## Supported Agents

**Auto-configured on login:** Claude Code, Cursor, Gemini CLI, Codex, Amp, OpenClaw

**Also works with (manual config):** Copilot, Droid, Qwen Code, OpenCode

If auto-configure doesn't cover your agent, add this to its MCP config:

```json
{
  "mcpServers": {
    "crowdlisten/harness": {
      "command": "npx",
      "args": ["-y", "@crowdlisten/planner"]
    }
  }
}
```

## Commands

```bash
npx @crowdlisten/planner login    # Sign in + auto-configure agents
npx @crowdlisten/planner setup    # Re-run auto-configure
npx @crowdlisten/planner logout   # Clear credentials
npx @crowdlisten/planner whoami   # Check current user
```

## Development

```bash
git clone https://github.com/Crowdlisten/crowdlisten_tasks.git
cd crowdlisten_tasks
npm install && npm run build
npm test    # 210 tests via Vitest
```

## License

MIT

Part of the [CrowdListen](https://crowdlisten.com) open source ecosystem.
