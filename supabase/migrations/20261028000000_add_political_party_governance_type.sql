-- Digital Sansad party records need a first-class governance type.
ALTER TYPE public.governance_type ADD VALUE IF NOT EXISTS 'political_party';

-- Explicit, reusable relationships: a person represents a political geography
-- and may be affiliated with a political party. Keep these separate from appointments.
CREATE TABLE IF NOT EXISTS public.person_geography_relationship (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL REFERENCES public.person(id) ON DELETE CASCADE,
  geography_id uuid NOT NULL REFERENCES public.geographies(id) ON DELETE CASCADE,
  relationship_type text NOT NULL CHECK (relationship_type IN ('represents')),
  source text NOT NULL DEFAULT 'manual',
  source_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (person_id, geography_id, relationship_type)
);

CREATE TABLE IF NOT EXISTS public.person_governance_relationship (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL REFERENCES public.person(id) ON DELETE CASCADE,
  governance_id uuid NOT NULL REFERENCES public.governance(id) ON DELETE CASCADE,
  relationship_type text NOT NULL CHECK (relationship_type IN ('party_affiliation')),
  source text NOT NULL DEFAULT 'manual',
  source_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (person_id, governance_id, relationship_type)
);

ALTER TABLE public.person_geography_relationship ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.person_governance_relationship ENABLE ROW LEVEL SECURITY;

-- Public directory relationships are readable; writes are performed by trusted
-- server-side importer/admin flows and are not granted to anonymous clients.
GRANT SELECT ON public.person_geography_relationship TO anon, authenticated;
GRANT SELECT ON public.person_governance_relationship TO anon, authenticated;

CREATE POLICY "Public can read person geography relationships"
  ON public.person_geography_relationship FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can read person governance relationships"
  ON public.person_governance_relationship FOR SELECT TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS person_geography_relationship_geography_idx
  ON public.person_geography_relationship (geography_id);
CREATE INDEX IF NOT EXISTS person_governance_relationship_governance_idx
  ON public.person_governance_relationship (governance_id);
