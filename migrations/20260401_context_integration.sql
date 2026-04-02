-- Migration: Connect MCP tools to project board
-- Date: 2026-04-01

-- A) Add project_id to context_blocks so blocks can be project-scoped
ALTER TABLE context_blocks ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES projects(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_context_blocks_project ON context_blocks(project_id) WHERE project_id IS NOT NULL;

-- B) Add source tracking to project_insights so we can distinguish manual vs MCP-generated
ALTER TABLE project_insights ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';
ALTER TABLE project_insights ADD COLUMN IF NOT EXISTS source_agent text;
ALTER TABLE project_insights ADD COLUMN IF NOT EXISTS category text;
