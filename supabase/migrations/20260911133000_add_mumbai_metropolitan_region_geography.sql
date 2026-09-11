begin;

insert into public.geographies (
  name,
  official_name,
  slug,
  geography_type,
  country_code,
  parent_id,
  osm_type,
  osm_id,
  admin_level,
  source,
  source_url,
  center,
  metadata
)
select
  'Mumbai Metropolitan Region',
  'Mumbai Metropolitan Region',
  'mumbai-metropolitan-region',
  'metropolitan_area',
  'IN',
  (select id from public.geographies where slug = 'maharashtra' limit 1),
  'relation',
  13312356,
  7,
  'openstreetmap',
  'https://www.openstreetmap.org/relation/13312356',
  jsonb_build_object('lat', 18.9667, 'lng', 72.8333),
  jsonb_build_object(
    'wikidata', 'Q3621720',
    'classification', 'India metropolitan area',
    'source_reference', 'OpenStreetMap India/Metropolitan areas'
  )
where not exists (
  select 1 from public.geographies
  where osm_type = 'relation' and osm_id = 13312356
);

update public.governance gov
set geography_id = geo.id,
    updated_at = now()
from public.geographies geo
where gov.slug = 'mumbai-metropolitan-region-development-authority'
  and geo.osm_type = 'relation'
  and geo.osm_id = 13312356;

commit;
