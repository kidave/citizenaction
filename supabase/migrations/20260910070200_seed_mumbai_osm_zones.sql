insert into public.osm_jurisdiction_cache (osm_type, osm_id, name, admin_level, boundary, parent_osm_type, parent_osm_id, state_osm_id, center, source, source_url)
values
  ('relation', 7888969, 'Mumbai Zone 1', 9, 'administrative', 'relation', 7888990, 1950884, '{"lat":18.940329,"lng":72.8237776}', 'openstreetmap', 'https://www.openstreetmap.org/relation/7888969'),
  ('relation', 7888968, 'Mumbai Zone 2', 9, 'administrative', 'relation', 7888990, 1950884, '{"lat":19.015312,"lng":72.8454617}', 'openstreetmap', 'https://www.openstreetmap.org/relation/7888968'),
  ('relation', 7888967, 'Mumbai Zone 3', 9, 'administrative', 'relation', 7888990, 1950884, '{"lat":19.0984895,"lng":72.8354836}', 'openstreetmap', 'https://www.openstreetmap.org/relation/7888967'),
  ('relation', 7888966, 'Mumbai Zone 4', 9, 'administrative', 'relation', 7888990, 1950884, '{"lat":19.2025451,"lng":72.8455388}', 'openstreetmap', 'https://www.openstreetmap.org/relation/7888966'),
  ('relation', 7888965, 'Mumbai Zone 5', 9, 'administrative', 'relation', '7888990', 1950884, '{"lat":19.060836,"lng":72.913711}', 'openstreetmap', 'https://www.openstreetmap.org/relation/7888965'),
  ('relation', 7888964, 'Mumbai Zone 6', 9, 'administrative', 'relation', 7888990, 1950884, '{"lat":19.1366845,"lng":72.9332601}', 'openstreetmap', 'https://www.openstreetmap.org/relation/7888964')
on conflict (osm_type, osm_id) do update set
  name = excluded.name,
  admin_level = excluded.admin_level,
  boundary = excluded.boundary,
  parent_osm_type = excluded.parent_osm_type,
  parent_osm_id = excluded.parent_osm_id,
  state_osm_id = excluded.state_osm_id,
  center = excluded.center,
  source_url = excluded.source_url,
  updated_at = now();
