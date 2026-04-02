-- Data migration: Copy existing data into unified memories table
-- Run AFTER 20260402_unified_memories.sql
-- Embeddings will be backfilled separately via the /embed endpoint

-- ─── Copy context_blocks → memories ──────────────────────────────────────────
-- Maps type column to a tag

INSERT INTO memories (user_id, project_id, title, content, tags, source, created_at)
SELECT
  user_id,
  project_id,
  title,
  content,
  ARRAY[type]::text[],
  COALESCE(source_filename, 'legacy'),
  created_at
FROM context_blocks
WHERE title IS NOT NULL AND content IS NOT NULL
ON CONFLICT DO NOTHING;

-- ─── Copy planning_context → memories (active entries only) ──────────────────
-- Maps type to tag, merges existing tags, carries over metadata

INSERT INTO memories (user_id, project_id, title, content, tags, source, source_agent, task_id, confidence, metadata, created_at)
SELECT
  user_id,
  project_id,
  title,
  body,
  ARRAY[type]::text[] || COALESCE(tags, '{}'),
  COALESCE(source, 'agent'),
  source_agent,
  task_id,
  COALESCE(confidence, 1.0),
  COALESCE(metadata, '{}'::jsonb),
  created_at
FROM planning_context
WHERE status IN ('active', 'approved')
  AND title IS NOT NULL
  AND body IS NOT NULL
ON CONFLICT DO NOTHING;
