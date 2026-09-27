-- Standardize the governance RPC API.
-- Historical v2 functions are intentionally removed from the live database.
-- Application-facing names are now:
--   public.get_governance_by_slug(text)
--   public.get_governance_directory(text, uuid, text, integer, boolean)

DROP FUNCTION IF EXISTS public.get_governance_by_slug_v2(text);
DROP FUNCTION IF EXISTS public.get_governance_directory_v2(text, uuid, text, integer, boolean);

DROP FUNCTION IF EXISTS public.get_governance_by_slug(text);

CREATE FUNCTION public.get_governance_by_slug(p_slug text)
RETURNS TABLE(
  id uuid,
  name text,
  short_name text,
  slug text,
  entity_type text,
  image_url text,
  website text,
  description text,
  status text,
  verification_status text,
  confidence numeric,
  parent_id uuid,
  parent_name text,
  parent_slug text,
  path text,
  geom geometry,
  category_id uuid,
  category_name text
)
LANGUAGE sql
STABLE
SET search_path = public, pg_catalog
AS $$
  SELECT
    g.id,
    g.name,
    g.short_name,
    g.slug,
    g.entity_type::text,
    g.image_url,
    g.website,
    g.description,
    g.status,
    g.verification_status::text,
    g.confidence,
    g.parent_entity_id,
    p.name,
    p.slug,
    public.get_governance_path(g.id),
    g.geom,
    g.category_id,
    c.name
  FROM public.governance g
  LEFT JOIN public.governance p ON p.id = g.parent_entity_id
  LEFT JOIN public.category c ON c.id = g.category_id
  WHERE g.slug = p_slug
    AND COALESCE(g.status, 'active') <> 'deleted'
  LIMIT 1;
$$;

grant execute on function public.get_governance_by_slug(text) to anon, authenticated;

DROP FUNCTION IF EXISTS public.get_governance_directory(text, uuid, text, integer, boolean);

CREATE FUNCTION public.get_governance_directory(
  p_search text DEFAULT NULL,
  p_parent_id uuid DEFAULT NULL,
  p_entity_type text DEFAULT NULL,
  p_limit integer DEFAULT 100,
  p_include_all boolean DEFAULT false
)
RETURNS TABLE(
  id uuid,
  name text,
  short_name text,
  slug text,
  image_url text,
  entity_type text,
  description text,
  status text,
  valid_from timestamptz,
  valid_to timestamptz,
  verification_status text,
  confidence numeric,
  parent_id uuid,
  parent_name text,
  parent_slug text,
  unit_type text,
  code text,
  geom geometry,
  category_id uuid,
  category_name text,
  profile_user_id uuid
)
LANGUAGE sql
STABLE
SET search_path = public, pg_catalog
AS $$
  SELECT
    g.id,
    g.name,
    g.short_name,
    g.slug,
    g.image_url,
    g.entity_type::text,
    g.description,
    g.status,
    g.valid_from,
    g.valid_to,
    g.verification_status::text,
    g.confidence,
    g.parent_entity_id,
    p.name,
    p.slug,
    g.unit_type::text,
    g.code,
    g.geom,
    g.category_id,
    c.name,
    g.profile_user_id
  FROM public.governance g
  LEFT JOIN public.governance p ON p.id = g.parent_entity_id
  LEFT JOIN public.category c ON c.id = g.category_id
  WHERE (
    p_include_all
    OR (p_parent_id IS NULL AND g.parent_entity_id IS NULL)
    OR g.parent_entity_id = p_parent_id
  )
    AND (
      p_search IS NULL
      OR btrim(p_search) = ''
      OR g.name ILIKE '%' || p_search || '%'
      OR COALESCE(g.short_name, '') ILIKE '%' || p_search || '%'
      OR COALESCE(c.name, '') ILIKE '%' || p_search || '%'
    )
    AND (p_entity_type IS NULL OR p_entity_type = '' OR g.entity_type::text = p_entity_type)
    AND COALESCE(g.status, 'active') <> 'deleted'
  ORDER BY g.name
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 100), 500));
$$;

grant execute on function public.get_governance_directory(text, uuid, text, integer, boolean) to anon, authenticated;
