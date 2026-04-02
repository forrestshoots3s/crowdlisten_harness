-- Fix: Expand context_blocks type CHECK to include 'decision'
-- The remember tool allows type='decision' but the DB constraint rejected it,
-- causing silent fallback to local storage.
-- Date: 2026-04-01

-- Drop the old CHECK constraint (Postgres requires naming it to drop)
-- The constraint was created inline, so we find its auto-generated name
DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'context_blocks'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%type%';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE context_blocks DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

-- Add the expanded CHECK constraint
ALTER TABLE context_blocks
  ADD CONSTRAINT context_blocks_type_check
  CHECK (type IN ('style', 'insight', 'pattern', 'preference', 'decision'));
