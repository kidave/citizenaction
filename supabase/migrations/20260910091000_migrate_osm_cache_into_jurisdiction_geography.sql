insert into public.jurisdiction_geography (
  name, official_name, geography_type, country_code, osm_type, osm_id,
  admin_level, source, source_url, metadata, geom, center, created_at, updated_at
)
select
  c.name,
  c.official_name,
  case c.admin_level
    when 4 then 'state'
    when 5 then 'district'
    when 6 then 'other'
    when 8 then 'local_government'
    when 9 then 'zone'
    when 10 then 'ward'
    else 'other'
  end,
  'IN', c.osm_type, c.osm_id, c.admin_level,
  coalesce(c.source, 'openstreetmap'), c.source_url,
  jsonb_strip_nulls(jsonb_build_object(
    'boundary', c.boundary,
    'local_authority', c.local_authority,
    'local_government_type', c.local_government_type,
    'ward', c.ward,
    'ref', c.ref,
    'operator', c.operator,
    'operator_alt_name', c.operator_alt_name,
    'migrated_from', 'osm_jurisdiction_cache'
  )),
  case when c.geojson is not null
        and jsonb_typeof(c.geojson) = 'object'
        and c.geojson->>'type' in ('Polygon','MultiPolygon')
       then st_multi(st_setsrid(st_geomfromgeojson(c.geojson::text),4326))
       else null end,
  c.center, coalesce(c.fetched_at, now()), now()
from public.osm_jurisdiction_cache c
on conflict (osm_type, osm_id) do update set
  name = excluded.name,
  official_name = excluded.official_name,
  geography_type = excluded.geography_type,
  country_code = excluded.country_code,
  admin_level = excluded.admin_level,
  source = excluded.source,
  source_url = excluded.source_url,
  metadata = coalesce(public.jurisdiction_geography.metadata,'{}'::jsonb) || excluded.metadata,
  geom = coalesce(excluded.geom, public.jurisdiction_geography.geom),
  center = coalesce(excluded.center, public.jurisdiction_geography.center),
  updated_at = now();

update public.jurisdiction_geography child
set parent_id = parent.id
from public.osm_jurisdiction_cache c
join public.jurisdiction_geography parent
  on parent.osm_type = c.parent_osm_type
 and parent.osm_id = c.parent_osm_id
where child.osm_type = c.osm_type
  and child.osm_id = c.osm_id
  and c.parent_osm_id is not null;
