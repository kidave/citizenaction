insert into public.osm_jurisdiction_cache (osm_type, osm_id, name, official_name, admin_level, boundary, parent_osm_type, parent_osm_id, state_osm_id, source, source_url)
values
  ('relation', 7964375, 'Mumbai Suburban', 'Mumbai Suburban District', 5, 'administrative', 'relation', 1950884, 1950884, 'openstreetmap', 'https://www.openstreetmap.org/relation/7964375'),
  ('relation', 7964376, 'Mumbai City', 'Mumbai City District', 5, 'administrative', 'relation', 1950884, 1950884, 'openstreetmap', 'https://www.openstreetmap.org/relation/7964376'),
  ('relation', 7888990, 'Mumbai', null, 8, 'administrative', 'relation', 1950884, 1950884, 'openstreetmap', 'https://www.openstreetmap.org/relation/7888990')
on conflict (osm_type, osm_id) do update set
  name = excluded.name,
  official_name = excluded.official_name,
  admin_level = excluded.admin_level,
  boundary = excluded.boundary,
  parent_osm_type = excluded.parent_osm_type,
  parent_osm_id = excluded.parent_osm_id,
  state_osm_id = excluded.state_osm_id,
  source_url = excluded.source_url,
  updated_at = now();
