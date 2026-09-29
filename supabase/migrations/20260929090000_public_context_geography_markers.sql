create or replace function public.get_post_public_context(p_post_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_catalog
as $function$
with post_context as (
  select p.id, coalesce(p.start_at, p.created_at) as context_at
  from public.post p
  where p.id = p_post_id
),
categories as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', c.id,
    'name', c.name,
    'slug', c.slug,
    'source_type', pc.source_type,
    'confidence', pc.confidence
  ) order by c.sort_order nulls last, c.name), '[]'::jsonb) as value
  from public.post_category pc
  join public.category c on c.id = pc.category_id
  where pc.post_id = p_post_id
),
geography as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', g.id,
    'name', coalesce(nullif(g.official_name, ''), g.name),
    'geography_type', g.geography_type,
    'relationship_type', pg.relationship_type,
    'source_type', pg.source_type,
    'confidence', pg.confidence,
    'osm_type', g.osm_type,
    'osm_id', g.osm_id,
    'geojson', case when g.geom is null then null else st_asgeojson(g.geom)::jsonb end
  ) order by case when pg.relationship_type = 'district' or pg.source_type = 'address' then 0 else 1 end, g.name), '[]'::jsonb) as value
  from public.post_geography pg
  join public.geographies g on g.id = pg.geography_id
  where pg.post_id = p_post_id
),
governance_rows as (
  select distinct on (g.id)
    g.id, g.name, g.short_name, g.image_url, g.address, g.geography_id, g.metadata,
    gg.id as jurisdiction_id,
    coalesce(nullif(gg.official_name, ''), gg.name) as jurisdiction_name,
    gg.geography_type as jurisdiction_type,
    gg.osm_type as jurisdiction_osm_type,
    gg.osm_id as jurisdiction_osm_id,
    case when gg.geom is null then null else st_asgeojson(gg.geom)::jsonb end as jurisdiction_geojson
  from public.post_governance pg
  join public.governance g on g.id = pg.governance_id
  left join public.geographies gg on gg.id = g.geography_id
  where pg.post_id = p_post_id
  order by g.id
),
governance_context as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id, 'name', name, 'short_name', short_name, 'image_url', image_url, 'address', address,
    'office_lat', case
      when metadata->>'office_lat' ~ '^-?[0-9]+(\\.[0-9]+)?$' then (metadata->>'office_lat')::numeric
      when metadata->>'lat' ~ '^-?[0-9]+(\\.[0-9]+)?$' then (metadata->>'lat')::numeric
      else null end,
    'office_lng', case
      when metadata->>'office_lng' ~ '^-?[0-9]+(\\.[0-9]+)?$' then (metadata->>'office_lng')::numeric
      when metadata->>'lng' ~ '^-?[0-9]+(\\.[0-9]+)?$' then (metadata->>'lng')::numeric
      else null end,
    'jurisdiction', case when jurisdiction_id is null then null else jsonb_build_object(
      'id', jurisdiction_id, 'name', jurisdiction_name, 'geography_type', jurisdiction_type,
      'osm_type', jurisdiction_osm_type, 'osm_id', jurisdiction_osm_id, 'geojson', jurisdiction_geojson
    ) end
  ) order by name), '[]'::jsonb) as value
  from governance_rows
),
person_rows as (
  select pe.id, pe.name, pe.image_url, pp.mention_text, pp.relationship_type,
    pos.name as position_name,
    org.id as organization_id, org.name as organization_name, org.short_name as organization_short_name,
    org.image_url as organization_image_url, org.address as organization_address,
    org.metadata as organization_metadata, org.geography_id as organization_geography_id
  from public.post_person pp
  join public.person pe on pe.id = pp.person_id
  cross join post_context pc
  left join lateral (
    select pa.position_id
    from public.position_appointment pa
    where pa.person_id = pe.id
      and pa.started_at <= pc.context_at
      and (pa.ended_at is null or pa.ended_at >= pc.context_at)
    order by pa.is_primary desc nulls last, pa.started_at desc nulls last
    limit 1
  ) appointment on true
  left join public.position pos on pos.id = appointment.position_id
  left join public.governance org on org.id = pos.appointing_organization_id
  where pp.post_id = p_post_id
),
person_context as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id, 'name', name, 'image_url', image_url, 'mention_text', mention_text, 'relationship_type', relationship_type,
    'position_name', position_name,
    'organization', case when organization_id is null then null else jsonb_build_object(
      'id', organization_id, 'name', organization_name, 'short_name', organization_short_name,
      'image_url', organization_image_url, 'address', organization_address,
      'office_lat', case
        when organization_metadata->>'office_lat' ~ '^-?[0-9]+(\\.[0-9]+)?$' then (organization_metadata->>'office_lat')::numeric
        when organization_metadata->>'lat' ~ '^-?[0-9]+(\\.[0-9]+)?$' then (organization_metadata->>'lat')::numeric
        else null end,
      'office_lng', case
        when organization_metadata->>'office_lng' ~ '^-?[0-9]+(\\.[0-9]+)?$' then (organization_metadata->>'office_lng')::numeric
        when organization_metadata->>'lng' ~ '^-?[0-9]+(\\.[0-9]+)?$' then (organization_metadata->>'lng')::numeric
        else null end,
      'jurisdiction', case when organization_geography_id is null then null else (
        select jsonb_build_object(
          'id', gg.id, 'name', coalesce(nullif(gg.official_name, ''), gg.name), 'geography_type', gg.geography_type,
          'osm_type', gg.osm_type, 'osm_id', gg.osm_id,
          'geojson', case when gg.geom is null then null else st_asgeojson(gg.geom)::jsonb end
        ) from public.geographies gg where gg.id = organization_geography_id
      ) end
    ) end
  ) order by name), '[]'::jsonb) as value
  from person_rows
)
select jsonb_build_object(
  'categories', (select value from categories),
  'geography', (select value from geography),
  'governance', (select value from governance_context),
  'people', (select value from person_context)
);

grant execute on function public.get_post_public_context(uuid) to anon, authenticated;
