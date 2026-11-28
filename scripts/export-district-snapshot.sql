-- Read-only export for scripts/reconcile-osm-districts.py.
-- Run in Supabase SQL Editor and save the single JSON value as supabase-districts.json.
select coalesce(
  jsonb_agg(
    jsonb_build_object(
      'id', d.id,
      'state_name', s.name,
      'name', d.name,
      'osm_id', d.osm_id,
      'source_id', d.source_id,
      'source_type', d.source_type,
      'source', d.source,
      'status', d.status,
      'metadata', d.metadata
    )
    order by s.name, d.name, d.id
  ),
  '[]'::jsonb
) as districts
from public.geographies d
join public.geographies s on s.id = d.parent_id
where d.geography_type = 'district'
  and s.geography_type = 'state'
  and s.country_code = 'IN';
