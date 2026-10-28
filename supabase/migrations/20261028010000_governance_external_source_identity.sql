-- External source identity for governance entities (e.g. Digital Sansad political parties).
-- Citizen Action's UUID remains the internal primary key.
ALTER TABLE public.governance
  ADD COLUMN IF NOT EXISTS source_system text,
  ADD COLUMN IF NOT EXISTS source_id text;

ALTER TABLE public.governance
  ADD CONSTRAINT governance_source_identity_pair_check
  CHECK (
    (source_system IS NULL AND source_id IS NULL)
    OR
    (NULLIF(btrim(source_system), '') IS NOT NULL AND NULLIF(btrim(source_id), '') IS NOT NULL)
  );

CREATE UNIQUE INDEX IF NOT EXISTS governance_source_identity_unique
  ON public.governance (source_system, source_id)
  WHERE source_system IS NOT NULL AND source_id IS NOT NULL;
