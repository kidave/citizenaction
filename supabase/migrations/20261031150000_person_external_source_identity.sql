-- Canonical external identity for people imported from Digital Sansad.
-- Keep Citizen Action's UUID as the internal primary key.
ALTER TABLE public.person
  ADD COLUMN IF NOT EXISTS source_system text,
  ADD COLUMN IF NOT EXISTS source_id text;

ALTER TABLE public.person
  ADD CONSTRAINT person_source_identity_pair_check
  CHECK (
    (source_system IS NULL AND source_id IS NULL)
    OR
    (NULLIF(btrim(source_system), '') IS NOT NULL AND NULLIF(btrim(source_id), '') IS NOT NULL)
  );

-- Backfill only unambiguous legacy identities. Duplicate legacy mpsno values are
-- intentionally left for manual reconciliation rather than assigned arbitrarily.
WITH legacy AS (
  SELECT id, btrim(metadata->>'mpsno') AS source_id
  FROM public.person
  WHERE metadata->>'official_source' = 'Digital Sansad'
    AND NULLIF(btrim(metadata->>'mpsno'), '') IS NOT NULL
    AND source_system IS NULL
    AND source_id IS NULL
), unambiguous AS (
  SELECT id, source_id
  FROM legacy
  WHERE source_id IN (
    SELECT source_id FROM legacy GROUP BY source_id HAVING count(*) = 1
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.person p
    WHERE p.source_system = 'sansad'
      AND p.source_id = legacy.source_id
      AND p.id <> legacy.id
  )
)
UPDATE public.person p
SET source_system = 'sansad',
    source_id = u.source_id,
    metadata = coalesce(p.metadata, '{}'::jsonb) - 'mpsno'
FROM unambiguous u
WHERE p.id = u.id;

CREATE UNIQUE INDEX IF NOT EXISTS person_source_identity_unique
  ON public.person (source_system, source_id)
  WHERE source_system IS NOT NULL AND source_id IS NOT NULL;

COMMENT ON COLUMN public.person.source_system IS
  'Canonical external source namespace, e.g. sansad.';
COMMENT ON COLUMN public.person.source_id IS
  'Stable identifier within source_system; internal person.id remains the primary key.';
