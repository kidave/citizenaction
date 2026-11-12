create table if not exists public.jurisdiction_geography (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  official_name text,
  slug text,
  geography_type text not null check (geography_type in ('country','state','division','district','city','local_government','zone','ward','other')),
  country_code text not null default 'IN',
  parent_id uuid references public.jurisdiction_geography(id) on delete set null,
  osm_type text,
  osm_id bigint,
  admin_level integer,
  source text not null default 'manual',
  source_url text,
  metadata jsonb not null default '{}'::jsonb,
  geom geometry(MultiPolygon,4326),
  center jsonb,
  created_by uuid references public.profile(user_id) on delete set null,
  updated_by uuid references public.profile(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint jurisdiction_geography_osm_identity_unique unique (osm_type, osm_id)
);

create index if not exists jurisdiction_geography_parent_id_idx on public.jurisdiction_geography(parent_id);
create index if not exists jurisdiction_geography_type_parent_idx on public.jurisdiction_geography(geography_type, parent_id);
create index if not exists jurisdiction_geography_name_idx on public.jurisdiction_geography(name);
create index if not exists jurisdiction_geography_geom_gist_idx on public.jurisdiction_geography using gist(geom);

create table if not exists public.governance_boundary (
  id uuid primary key default gen_random_uuid(),
  governance_id uuid not null references public.governance(id) on delete cascade,
  geography_id uuid not null references public.jurisdiction_geography(id) on delete restrict,
  boundary_type text not null check (boundary_type in ('country','state','division','district','city','local_government','zone','ward','custom')),
  is_primary boolean not null default false,
  valid_from timestamptz,
  valid_to timestamptz,
  notes text,
  created_by uuid references public.profile(user_id) on delete set null,
  updated_by uuid references public.profile(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint governance_boundary_unique_link unique (governance_id, geography_id)
);

create index if not exists governance_boundary_governance_idx on public.governance_boundary(governance_id);
create index if not exists governance_boundary_geography_idx on public.governance_boundary(geography_id);
create index if not exists governance_boundary_primary_idx on public.governance_boundary(governance_id) where is_primary;

alter table public.jurisdiction_geography enable row level security;
alter table public.governance_boundary enable row level security;

drop policy if exists jurisdiction_geography_public_read on public.jurisdiction_geography;
create policy jurisdiction_geography_public_read on public.jurisdiction_geography for select to anon, authenticated using (true);

drop policy if exists governance_boundary_public_read on public.governance_boundary;
create policy governance_boundary_public_read on public.governance_boundary for select to anon, authenticated using (true);

create or replace function public.set_governance_boundary(
  p_governance_id uuid,
  p_geography_id uuid,
  p_boundary_type text default null,
  p_is_primary boolean default false,
  p_valid_from timestamptz default null,
  p_valid_to timestamptz default null,
  p_notes text default null
) returns public.governance_boundary
language plpgsql security definer set search_path = public
as $$
declare v_row public.governance_boundary; v_type text;
begin
  perform public.require_governance_admin();
  select geography_type into v_type from public.jurisdiction_geography where id = p_geography_id;
  if v_type is null then raise exception 'Geography not found'; end if;
  v_type := coalesce(nullif(btrim(p_boundary_type),''), v_type);
  insert into public.governance_boundary(governance_id, geography_id, boundary_type, is_primary, valid_from, valid_to, notes, created_by, updated_by)
  values(p_governance_id, p_geography_id, v_type, p_is_primary, p_valid_from, p_valid_to, p_notes, auth.uid(), auth.uid())
  on conflict (governance_id, geography_id) do update set
    boundary_type = excluded.boundary_type,
    is_primary = excluded.is_primary,
    valid_from = excluded.valid_from,
    valid_to = excluded.valid_to,
    notes = excluded.notes,
    updated_by = auth.uid(),
    updated_at = now()
  returning * into v_row;
  return v_row;
end;
$$;

create or replace function public.delete_governance_boundary(p_id uuid)
returns boolean
language plpgsql security definer set search_path = public
as $$
begin
  perform public.require_governance_admin();
  delete from public.governance_boundary where id = p_id;
  return found;
end;
$$;

create or replace function public.set_jurisdiction_geography(
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
  p_center jsonb default null
) returns public.jurisdiction_geography
language plpgsql security definer set search_path = public
as $$
declare v_row public.jurisdiction_geography;
begin
  perform public.require_governance_admin();
  if p_name is null or btrim(p_name) = '' then raise exception 'Geography name is required'; end if;
  if p_id is null then
    insert into public.jurisdiction_geography(name, official_name, slug, geography_type, country_code, parent_id, osm_type, osm_id, admin_level, source, source_url, metadata, geom, center, created_by, updated_by)
    values(btrim(p_name), nullif(btrim(p_official_name),''), nullif(btrim(p_slug),''), p_geography_type, coalesce(nullif(btrim(p_country_code),''),'IN'), p_parent_id, p_osm_type, p_osm_id, p_admin_level, coalesce(nullif(btrim(p_source),''),'manual'), nullif(btrim(p_source_url),''), coalesce(p_metadata,'{}'::jsonb), case when p_geojson is null then null else st_multi(st_setsrid(st_geomfromgeojson(p_geojson::text),4326)) end, p_center, auth.uid(), auth.uid())
    returning * into v_row;
  else
    update public.jurisdiction_geography set
      name = btrim(p_name),
      official_name = case when p_official_name is null then official_name else nullif(btrim(p_official_name),'') end,
      slug = case when p_slug is null then slug else nullif(btrim(p_slug),'') end,
      geography_type = coalesce(p_geography_type, geography_type),
      country_code = coalesce(nullif(btrim(p_country_code),''), country_code),
      parent_id = p_parent_id,
      osm_type = p_osm_type,
      osm_id = p_osm_id,
      admin_level = p_admin_level,
      source = coalesce(nullif(btrim(p_source),''), source),
      source_url = case when p_source_url is null then source_url else nullif(btrim(p_source_url),'') end,
      metadata = coalesce(metadata,'{}'::jsonb) || coalesce(p_metadata,'{}'::jsonb),
      geom = case when p_geojson is null then geom else st_multi(st_setsrid(st_geomfromgeojson(p_geojson::text),4326)) end,
      center = coalesce(p_center, center),
      updated_by = auth.uid(), updated_at = now()
    where id = p_id
    returning * into v_row;
  end if;
  return v_row;
end;
$$;

revoke all on function public.set_governance_boundary(uuid,uuid,text,boolean,timestamptz,timestamptz,text) from public;
grant execute on function public.set_governance_boundary(uuid,uuid,text,boolean,timestamptz,timestamptz,text) to authenticated;
revoke all on function public.delete_governance_boundary(uuid) from public;
grant execute on function public.delete_governance_boundary(uuid) to authenticated;
revoke all on function public.set_jurisdiction_geography(uuid,text,text,text,text,text,uuid,text,bigint,integer,text,text,jsonb,jsonb,jsonb) from public;
grant execute on function public.set_jurisdiction_geography(uuid,text,text,text,text,text,uuid,text,bigint,integer,text,text,jsonb,jsonb,jsonb) to authenticated;
