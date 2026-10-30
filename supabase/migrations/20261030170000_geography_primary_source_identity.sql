begin;

alter table public.geographies
  add column if not exists source_type text,
  add column if not exists source_id text;

-- Preserve existing OpenStreetMap identifiers in the generic primary-source fields.
update public.geographies
set source = coalesce(nullif(source, ''), 'openstreetmap'),
    source_type = coalesce(source_type, osm_type),
    source_id = coalesce(source_id, osm_id::text)
where osm_id is not null or osm_type is not null;

create index if not exists geographies_source_identity_idx
  on public.geographies (source, source_type, source_id)
  where source_id is not null;

comment on column public.geographies.source is
  'Primary source of this canonical geography record.';
comment on column public.geographies.source_type is
  'Primary source identifier type, for example OSM relation or way, Wikidata item, or provider-specific ID type.';
comment on column public.geographies.source_id is
  'Primary external source identifier stored as text; one primary identifier per canonical geography.';

-- Backward-compatible RPC: retain existing OSM parameters for old callers while
-- allowing the admin editor to save a generic, text-based primary source identity.
create or replace function public.upsert_geography(
  p_id uuid default null,
  p_name text default null,
  p_official_name text default null,
  p_slug text default null,
  p_geography_type text default null,
  p_country_code text default 'IN',
  p_parent_id uuid default null,
  p_osm_type text default null,
  p_osm_id bigint default null,
  p_admin_level integer default null,
  p_source text default 'manual',
  p_source_url text default null,
  p_metadata jsonb default '{}'::jsonb,
  p_geojson jsonb default null,
  p_center jsonb default null,
  p_source_type text default null,
  p_source_id text default null
)
returns public.geographies
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.geographies;
  v_source_type text;
  v_source_id text;
begin
  perform public.require_governance_admin();

  if p_name is null or btrim(p_name) = '' then
    raise exception 'Geography name is required';
  end if;

  v_source_type := coalesce(nullif(btrim(p_source_type), ''), nullif(btrim(p_osm_type), ''));
  v_source_id := coalesce(nullif(btrim(p_source_id), ''), case when p_osm_id is null then null else p_osm_id::text end);

  if p_id is null then
    insert into public.geographies (
      name, official_name, slug, geography_type, country_code, parent_id,
      osm_type, osm_id, source_type, source_id, admin_level, source, source_url,
      metadata, geom, center, created_by, updated_by
    )
    values (
      btrim(p_name), nullif(btrim(p_official_name), ''), nullif(btrim(p_slug), ''),
      p_geography_type, coalesce(nullif(btrim(p_country_code), ''), 'IN'), p_parent_id,
      p_osm_type, p_osm_id, v_source_type, v_source_id, p_admin_level,
      coalesce(nullif(btrim(p_source), ''), 'manual'), nullif(btrim(p_source_url), ''),
      coalesce(p_metadata, '{}'::jsonb),
      case when p_geojson is null then null else st_multi(st_setsrid(st_geomfromgeojson(p_geojson::text), 4326)) end,
      p_center, auth.uid(), auth.uid()
    ) returning * into v_row;
  else
    update public.geographies
    set name = btrim(p_name),
        official_name = case when p_official_name is null then official_name else nullif(btrim(p_official_name), '') end,
        slug = case when p_slug is null then slug else nullif(btrim(p_slug), '') end,
        geography_type = coalesce(p_geography_type, geography_type),
        country_code = coalesce(nullif(btrim(p_country_code), ''), country_code),
        parent_id = p_parent_id,
        osm_type = coalesce(p_osm_type, osm_type),
        osm_id = coalesce(p_osm_id, osm_id),
        source_type = coalesce(v_source_type, source_type),
        source_id = coalesce(v_source_id, source_id),
        admin_level = p_admin_level,
        source = coalesce(nullif(btrim(p_source), ''), source),
        source_url = case when p_source_url is null then source_url else nullif(btrim(p_source_url), '') end,
        metadata = coalesce(metadata, '{}'::jsonb) || coalesce(p_metadata, '{}'::jsonb),
        geom = case when p_geojson is null then geom else st_multi(st_setsrid(st_geomfromgeojson(p_geojson::text), 4326)) end,
        center = coalesce(p_center, center), updated_by = auth.uid(), updated_at = now()
    where id = p_id
    returning * into v_row;
  end if;

  return v_row;
end;
$$;

commit;
