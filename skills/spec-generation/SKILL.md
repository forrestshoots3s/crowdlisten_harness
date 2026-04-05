---
name: spec-generation
version: 1.0.0
description: Generate actionable product specs from crowd analysis results
requires_api_key: false
---

# Spec Generation

Turn crowd analysis into actionable product specs — feature requests, user stories, and acceptance criteria.

## Generate Specs from Analysis

Use the `generate_specs` tool (in the Analysis Engine pack):

```
generate_specs({
  project_id: "...",
  analysis_id: "...",         // optional: scope to one analysis
  spec_type: "all"            // feature_requests | user_stories | acceptance_criteria | all
})
```

## Browse & Manage Specs

Specs are stored in `actionable_specs` table. Query via Supabase:

```sql
SELECT id, spec_type, title, objective, priority, confidence, status
FROM actionable_specs
WHERE user_id = 'YOUR_USER_ID'
  AND status = 'pending'
ORDER BY priority DESC, confidence DESC;
```

## Spec-to-Task Workflow

1. Run analysis: `run_analysis({ project_id, question: "..." })`
2. Generate specs: `generate_specs({ project_id, analysis_id })`
3. Review specs in the web UI or via SQL
4. Create tasks from high-confidence specs: `create_task({ title: spec.title, description: spec.objective })`
5. Claim and implement: `claim_task({ task_id })`

## Spec Types

| Type | Description |
|------|-------------|
| `feature_requests` | New feature ideas extracted from crowd signal |
| `user_stories` | "As a [user], I want [feature] so that [benefit]" format |
| `acceptance_criteria` | Testable conditions for feature completion |

## Quality Indicators

- **confidence**: 0-1 score based on evidence strength
- **priority**: critical, high, medium, low (derived from crowd sentiment + frequency)
- **evidence**: Array of source quotes with platform and confidence
