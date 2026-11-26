-- Read-only, keyset-paginated GeoJSON export for the geography tileset pipeline.
-- The function is intentionally restricted to service_role; it is called by the
-- scheduled GitHub Actions exporter using the existing Supabase service key.

CREATE OR REPLACE FUNCTION public.export_geographies_geojson(
  p_after_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 250
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH batch AS MATERIALIZED (
    SELECT
      g.id,
      g.geom,
      g.name,
      g.official_name,
      g.other_names,
      g.parent_id,
      g.boundary_category,
      g.geography_type,
      g.source_id,
      g.admin_level,
      g.status
    FROM public.geographies AS g
    WHERE g.geom IS NOT NULL
      AND (p_after_id IS NULL OR g.id > p_after_id)
    ORDER BY g.id
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 250), 1), 500)
  ),
  features AS (
    SELECT
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'id', b.id::text,
            'geometry', ST_AsGeoJSON(ST_Force2D(b.geom), 6)::jsonb,
            'properties', jsonb_build_object(
              'id', b.id::text,
              'name', b.name,
              'official_name', b.official_name,
              'other_names', b.other_names,
              'parent_id', b.parent_id::text,
              'boundary_category', b.boundary_category,
              'geography_type', b.geography_type,
              'source_id', b.source_id,
              'admin_level', b.admin_level,
              'status', b.status
            )
          )
          ORDER BY b.id
        ),
        '[]'::jsonb
      ) AS items,
      COUNT(*) AS batch_count,
      (SELECT b2.id::text FROM batch AS b2 ORDER BY b2.id DESC LIMIT 1) AS next_after_id
    FROM batch AS b
  )
  SELECT jsonb_build_object(
    'type', 'FeatureCollection',
    'features', features.items,
    'next_after_id', features.next_after_id,
    'has_more', features.batch_count = LEAST(GREATEST(COALESCE(p_limit, 250), 1), 500)
  )
  FROM features;
$$;

REVOKE ALL ON FUNCTION public.export_geographies_geojson(uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.export_geographies_geojson(uuid, integer) FROM anon;
REVOKE ALL ON FUNCTION public.export_geographies_geojson(uuid, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.export_geographies_geojson(uuid, integer) TO service_role;
