---
name: context-extraction
version: 1.0.0
description: Extract structured context from chat transcripts — skills, decisions, patterns
requires_api_key: false
---

# Context Extraction

Extract structured context blocks from chat transcripts and discover matching skills.

## Pipeline

The context extraction pipeline processes text in chunks:

1. **PII Redaction** — Strips emails, phone numbers, names (client-side)
2. **Block Extraction** — Identifies decisions, constraints, patterns, preferences, goals
3. **Skill Matching** — Recommends CrowdListen skills based on extracted context

## Usage via API

The pipeline is available as a local function in the harness:

```typescript
import { runPipeline } from "@crowdlisten/harness/context/pipeline";

const result = await runPipeline({
  text: chatTranscript,
  source: "chat-export",
  isChat: true,
});

// result.blocks — extracted context blocks
// result.skills — matched skill recommendations
// result.redactionStats — PII redaction summary
```

## Block Types

| Type | Description |
|------|-------------|
| `decision` | Architecture/design decisions made |
| `constraint` | Limitations, requirements, boundaries |
| `pattern` | Recurring code/workflow patterns |
| `preference` | User preferences for tools, style, workflow |
| `goal` | Project goals and objectives |
| `insight` | Key learnings and observations |

## Skill Discovery

After extraction, use the skill matcher to find relevant workflows:

```typescript
import { matchSkills } from "@crowdlisten/harness/context/matcher";

const skills = await matchSkills(blocks, {
  category: "audience-intelligence",
  limit: 5,
});
```

## Saving Extracted Context

Use `save` to persist important blocks:

```
save({
  title: "Auth decision: JWT with refresh tokens",
  content: "Decided to use JWT...",
  tags: ["decision", "auth", "security"],
  project_id: "..."
})
```
