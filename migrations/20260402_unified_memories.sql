-- Unified Memory System: memories table with pgvector semantic search
-- Replaces fragmented stores: context_blocks, planning_context (knowledge entries), learnings.jsonl
-- Run in Supabase SQL Editor (requires pgvector extension)

-- Enable pgvector if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- ─── Table ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS memories (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES auth.users(id),
  project_id  uuid REFERENCES projects(id),
  title       text NOT NULL,
  content     text NOT NULL,
  tags        text[] DEFAULT '{}',
  source      text DEFAULT 'agent',
  source_agent text,
  task_id     uuid,
  confidence  real DEFAULT 1.0,
  embedding   vector(1536),
  metadata    jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY memories_user_select ON memories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY memories_user_insert ON memories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY memories_user_update ON memories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY memories_user_delete ON memories FOR DELETE
  USING (auth.uid() = user_id);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX memories_user_id_idx ON memories(user_id);
CREATE INDEX memories_project_id_idx ON memories(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX memories_tags_idx ON memories USING GIN(tags);
CREATE INDEX memories_created_at_idx ON memories(created_at DESC);

-- IVFFlat cosine similarity index for semantic search
-- Note: requires at least ~100 rows for IVFFlat to be effective.
-- For small datasets, pgvector will fall back to sequential scan.
CREATE INDEX memories_embedding_idx ON memories
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ─── Semantic search RPC ──────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION search_memories(
  p_user_id uuid,
  p_query_embedding vector(1536),
  p_match_count int DEFAULT 20,
  p_project_id uuid DEFAULT NULL,
  p_tags text[] DEFAULT NULL
) RETURNS TABLE (
  id uuid,
  title text,
  content text,
  tags text[],
  source text,
  source_agent text,
  task_id uuid,
  project_id uuid,
  confidence real,
  metadata jsonb,
  similarity float,
  created_at timestamptz
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id, m.title, m.content, m.tags, m.source, m.source_agent,
    m.task_id, m.project_id, m.confidence, m.metadata,
    1 - (m.embedding <=> p_query_embedding) AS similarity,
    m.created_at
  FROM memories m
  WHERE m.user_id = p_user_id
    AND m.embedding IS NOT NULL
    AND (p_project_id IS NULL OR m.project_id = p_project_id)
    AND (p_tags IS NULL OR m.tags && p_tags)
  ORDER BY m.embedding <=> p_query_embedding
  LIMIT p_match_count;
END;
$$;

-- ─── Updated_at trigger ──────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_memories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER memories_updated_at_trigger
  BEFORE UPDATE ON memories
  FOR EACH ROW
  EXECUTE FUNCTION update_memories_updated_at();
