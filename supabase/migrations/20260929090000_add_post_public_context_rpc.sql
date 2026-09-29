CREATE OR REPLACE FUNCTION public.get_post_public_context(p_post_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public, pg_catalog
AS $$
WITH categories AS (
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', c.id,
    'name', c.name,
    'slug', c.slug,
    'source_type', pc.source_type,
    'confidence', pc.confidence
  ) ORDER BY c.sort_order NULLS LAST, c.name), '[]'::jsonb) AS value
  FROM public.post_category pc
  JOIN public.category c ON c.id = pc.category_id
  WHERE pc.post_id = p_post_id
), geography AS (
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', g.id,
    'name', COALESCE(NULLIF(g.official_name, ''), g.name),
    'geography_type', g.geography_type,
    'relationship_type', pg.relationship_type,
    'source_type', pg.source_type,
    'confidence', pg.confidence
  ) ORDER BY CASE WHEN pg.relationship_type = 'district' OR pg.source_type = 'address' THEN 0 ELSE 1 END, g.name), '[]'::jsonb) AS value
  FROM public.post_geography pg
  JOIN public.geographies g ON g.id = pg.geography_id
  WHERE pg.post_id = p_post_id
)
SELECT jsonb_build_object(
  'categories', (SELECT value FROM categories),
  'geography', (SELECT value FROM geography)
);
$$;

GRANT EXECUTE ON FUNCTION public.get_post_public_context(uuid) TO anon, authenticated;
