-- Migration: Unify content_insights into project_insights
-- Date: 2026-04-01
-- Purpose: Consolidate both tables onto project_insights so agent-extracted
--          insights appear on the project board and skills generation sees all types.

-- 1. Relax project_id NOT NULL (content_insights allows NULL)
ALTER TABLE project_insights ALTER COLUMN project_id DROP NOT NULL;

-- 2. Add columns from content_insights that project_insights lacks
ALTER TABLE project_insights
  ADD COLUMN IF NOT EXISTS content_id UUID,
  ADD COLUMN IF NOT EXISTS source_filename TEXT,
  ADD COLUMN IF NOT EXISTS source_type TEXT,
  ADD COLUMN IF NOT EXISTS source_excerpt TEXT,
  ADD COLUMN IF NOT EXISTS confidence_score DOUBLE PRECISION DEFAULT 0.8,
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;

-- 3. Indexes for new query patterns
CREATE INDEX IF NOT EXISTS idx_project_insights_content_id ON project_insights(content_id);
CREATE INDEX IF NOT EXISTS idx_project_insights_is_pinned ON project_insights(is_pinned);
CREATE INDEX IF NOT EXISTS idx_project_insights_category ON project_insights(category);

-- 4. Copy existing content_insights rows into project_insights
INSERT INTO project_insights (
  id, user_id, project_id, title, content, category,
  content_id, source_filename, source_type, source_excerpt,
  confidence_score, is_pinned, source, created_at
)
SELECT
  id, user_id, project_id, title, content, category,
  content_id, source_filename, source_type, source_excerpt,
  confidence_score, is_pinned, 'extraction', created_at
FROM content_insights
ON CONFLICT (id) DO NOTHING;

-- 5. Deprecation notice (table kept for rollback safety)
COMMENT ON TABLE content_insights IS 'DEPRECATED 2026-04-01: Migrated to project_insights. Will be dropped after verification period.';
