-- Consolidate the 1:1 governance_unit layer into governance.
-- governance remains the canonical governance entity table.
-- Structural hierarchy, unit role, code and jurisdiction geometry now live on governance itself.
-- A temporary compatibility view named governance_unit is retained until the application
-- no longer queries that legacy name directly.

alter table public.governance
  add column if not exists unit_type public.governance_unit_type not null default 'unit'::public.governance_unit_type,
  add column if not exists code text,
  add column if not exists parent_entity_id uuid,
  add column if not exists geom geometry(MultiPolygon, 4326);

-- governance is canonical. The old unit table duplicated entity fields, so only its
-- structural fields are migrated. Existing governance metadata remains authoritative.
update public.governance g
set unit_type = u.unit_type,
    code = u.code,
    parent_entity_id = u.parent_entity_id,
    geom = u.geom
from public.governance_unit u
where u.entity_id = g.id;

alter table public.governance
  add constraint governance_parent_entity_id_fkey
  foreign key (parent_entity_id) references public.governance(id) on delete set null;

create index if not exists governance_parent_entity_id_idx
  on public.governance(parent_entity_id);

create index if not exists governance_geom_gix
  on public.governance using gist(geom);

-- Move hierarchy cycle protection to the canonical table.
create or replace function public.prevent_governance_cycle()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  current_id uuid;
begin
  if new.parent_entity_id is null then
    return new;
  end if;

  if new.parent_entity_id = new.id then
    raise exception 'Governance entity cannot be its own parent';
  end if;

  current_id := new.parent_entity_id;
  while current_id is not null loop
    if current_id = new.id then
      raise exception 'Governance hierarchy cycle detected';
    end if;

    select g.parent_entity_id
      into current_id
      from public.governance g
     where g.id = current_id;
  end loop;

  return new;
end;
$$;

drop trigger if exists governance_prevent_cycle on public.governance;
create trigger governance_prevent_cycle
before insert or update of parent_entity_id on public.governance
for each row execute function public.prevent_governance_cycle();

-- Rebuild the public governance view against the canonical table.
drop view if exists public.governance_view;
create view public.governance_view as
select
  g.id,
  g.entity_type,
  g.name,
  g.short_name,
  g.slug,
  g.description,
  g.status,
  g.valid_from,
  g.valid_to,
  g.metadata,
  g.verification_status,
  g.confidence,
  g.created_by,
  g.updated_by,
  g.created_at,
  g.updated_at,
  g.image_url,
  g.website,
  g.id as unit_id,
  g.parent_entity_id as parent_id,
  p.name as parent_name,
  p.slug as parent_slug,
  g.unit_type,
  g.code,
  g.geom
from public.governance g
left join public.governance p on p.id = g.parent_entity_id
where coalesce(g.status, 'active') <> 'deleted';

grant select on public.governance_view to anon, authenticated;

-- All governance read/mutation functions now use governance directly.
create or replace function public.get_governance_by_slug(p_slug text)
returns table(
  id uuid, name text, short_name text, slug text, entity_type text,
  image_url text, website text, description text, status text,
  verification_status text, confidence numeric, parent_id uuid,
  parent_name text, parent_slug text, path text, geom geometry
)
language sql stable set search_path = public, pg_catalog
as $$
  select
    g.id,
    g.name,
    g.short_name,
    g.slug,
    g.entity_type::text,
    g.image_url,
    g.website,
    g.description,
    g.status,
    g.verification_status::text,
    g.confidence,
    g.parent_entity_id,
    p.name,
    p.slug,
    public.get_governance_path(g.id),
    g.geom
  from public.governance g
  left join public.governance p on p.id = g.parent_entity_id
  where g.slug = p_slug
    and coalesce(g.status, 'active') <> 'deleted'
  limit 1;
$$;

create or replace function public.get_governance_by_slug_v2(p_slug text)
returns table(
  id uuid, name text, short_name text, slug text, entity_type text,
  image_url text, website text, description text, status text,
  verification_status text, confidence numeric, parent_id uuid,
  parent_name text, parent_slug text, path text, geom geometry,
  category_id uuid, category_name text, location_id integer, location_name text
)
language sql stable set search_path = public, pg_catalog
as $$
  select
    g.id,
    g.name,
    g.short_name,
    g.slug,
    g.entity_type::text,
    g.image_url,
    g.website,
    g.description,
    g.status,
    g.verification_status::text,
    g.confidence,
    g.parent_entity_id,
    p.name,
    p.slug,
    public.get_governance_path(g.id),
    g.geom,
    g.category_id,
    c.name,
    g.location_id,
    gs.name
  from public.governance g
  left join public.governance p on p.id = g.parent_entity_id
  left join public.category c on c.id = g.category_id
  left join public.geographic_scope gs on gs.id = g.location_id
  where g.slug = p_slug
    and coalesce(g.status, 'active') <> 'deleted'
  limit 1;
$$;

create or replace function public.get_governance_path(p_governance_id uuid)
returns text
language sql stable set search_path = public
as $$
  with recursive chain as (
    select g.id, g.slug, g.parent_entity_id, 0 depth
      from public.governance g
     where g.id = p_governance_id
    union all
    select p.id, p.slug, p.parent_entity_id, c.depth + 1
      from chain c
      join public.governance p on p.id = c.parent_entity_id
     where c.depth < 50
  )
  select '/governance/' || string_agg(slug, '/' order by depth desc)
    from chain
   where slug is not null;
$$;

create or replace function public.get_governance_directory(
  p_search text default null,
  p_parent_id uuid default null,
  p_entity_type text default null,
  p_limit integer default 100
)
returns table(
  id uuid, name text, short_name text, slug text, image_url text,
  entity_type text, description text, status text,
  verification_status text, confidence numeric, parent_id uuid,
  parent_name text, parent_slug text, unit_type text, code text, geom geometry
)
language sql stable set search_path = public
as $$
  select
    g.id,
    g.name,
    g.short_name,
    g.slug,
    g.image_url,
    g.entity_type::text,
    g.description,
    g.status,
    g.verification_status::text,
    g.confidence,
    g.parent_entity_id,
    p.name,
    p.slug,
    g.unit_type::text,
    g.code,
    g.geom
  from public.governance g
  left join public.governance p on p.id = g.parent_entity_id
  where (
    (p_parent_id is null and g.parent_entity_id is null)
    or g.parent_entity_id = p_parent_id
  )
    and (
      p_search is null
      or btrim(p_search) = ''
      or g.name ilike '%' || p_search || '%'
      or coalesce(g.short_name, '') ilike '%' || p_search || '%'
    )
    and (p_entity_type is null or p_entity_type = '' or g.entity_type::text = p_entity_type)
    and coalesce(g.status, 'active') <> 'deleted'
  order by g.name
  limit greatest(1, least(coalesce(p_limit, 100), 500));
$$;

create or replace function public.get_governance_directory(
  p_search text default null,
  p_parent_id uuid default null,
  p_entity_type text default null,
  p_limit integer default 100,
  p_include_all boolean default false
)
returns table(
  id uuid, name text, short_name text, slug text, image_url text,
  entity_type text, description text, status text,
  verification_status text, confidence numeric, parent_id uuid,
  parent_name text, parent_slug text, unit_type text, code text, geom geometry
)
language sql stable set search_path = public
as $$
  select
    g.id,
    g.name,
    g.short_name,
    g.slug,
    g.image_url,
    g.entity_type::text,
    g.description,
    g.status,
    g.verification_status::text,
    g.confidence,
    g.parent_entity_id,
    p.name,
    p.slug,
    g.unit_type::text,
    g.code,
    g.geom
  from public.governance g
  left join public.governance p on p.id = g.parent_entity_id
  where (
    p_include_all
    or (p_parent_id is null and g.parent_entity_id is null)
    or g.parent_entity_id = p_parent_id
  )
    and (
      p_search is null
      or btrim(p_search) = ''
      or g.name ilike '%' || p_search || '%'
      or coalesce(g.short_name, '') ilike '%' || p_search || '%'
    )
    and (p_entity_type is null or p_entity_type = '' or g.entity_type::text = p_entity_type)
    and coalesce(g.status, 'active') <> 'deleted'
  order by g.name
  limit greatest(1, least(coalesce(p_limit, 100), 500));
$$;

create or replace function public.get_governance_directory(
  p_search text,
  p_entity_type text default 'all',
  p_category_id uuid default null,
  p_roots_only boolean default true,
  p_as_of timestamptz default now()
)
returns table(
  id uuid, entity_type public.governance_entity_type, name text,
  short_name text, slug text, description text, status text,
  valid_from timestamptz, valid_to timestamptz, metadata jsonb,
  verification_status text, confidence numeric, image_url text,
  website text, category_id uuid, category_name text, parent_id uuid,
  parent_name text, unit_type public.governance_unit_type, jurisdiction_geom geometry
)
language sql stable
as $$
  select
    g.id,
    g.entity_type,
    g.name,
    g.short_name,
    g.slug,
    g.description,
    g.status,
    g.valid_from,
    g.valid_to,
    g.metadata,
    g.verification_status,
    g.confidence,
    g.image_url,
    g.website,
    g.category_id,
    c.name,
    g.parent_entity_id,
    parent_g.name,
    g.unit_type,
    g.geom
  from public.governance g
  left join public.category c on c.id = g.category_id
  left join public.governance parent_g on parent_g.id = g.parent_entity_id
  where coalesce(g.status, 'active') = 'active'
    and (g.valid_from is null or g.valid_from <= p_as_of)
    and (g.valid_to is null or g.valid_to >= p_as_of)
    and (p_entity_type = 'all' or g.entity_type::text = p_entity_type)
    and (p_category_id is null or g.category_id = p_category_id)
    and (
      nullif(trim(p_search), '') is null
      or g.name ilike '%' || trim(p_search) || '%'
      or coalesce(g.short_name, '') ilike '%' || trim(p_search) || '%'
    )
    and (not p_roots_only or g.parent_entity_id is null)
  order by g.name;
$$;

create or replace function public.get_governance_directory_v2(
  p_search text default null,
  p_parent_id uuid default null,
  p_entity_type text default null,
  p_limit integer default 100,
  p_include_all boolean default false
)
returns table(
  id uuid, name text, short_name text, slug text, image_url text,
  entity_type text, description text, status text,
  verification_status text, confidence numeric, parent_id uuid,
  parent_name text, parent_slug text, unit_type text, code text,
  geom geometry, category_id uuid, category_name text,
  location_id integer, location_name text
)
language sql stable set search_path = public
as $$
  select
    g.id,
    g.name,
    g.short_name,
    g.slug,
    g.image_url,
    g.entity_type::text,
    g.description,
    g.status,
    g.verification_status::text,
    g.confidence,
    g.parent_entity_id,
    p.name,
    p.slug,
    g.unit_type::text,
    g.code,
    g.geom,
    g.category_id,
    c.name,
    g.location_id,
    gs.name
  from public.governance g
  left join public.governance p on p.id = g.parent_entity_id
  left join public.category c on c.id = g.category_id
  left join public.geographic_scope gs on gs.id = g.location_id
  where (
    p_include_all
    or (p_parent_id is null and g.parent_entity_id is null)
    or g.parent_entity_id = p_parent_id
  )
    and (
      p_search is null
      or btrim(p_search) = ''
      or g.name ilike '%' || p_search || '%'
      or coalesce(g.short_name, '') ilike '%' || p_search || '%'
      or coalesce(c.name, '') ilike '%' || p_search || '%'
      or coalesce(gs.name, '') ilike '%' || p_search || '%'
    )
    and (p_entity_type is null or p_entity_type = '' or g.entity_type::text = p_entity_type)
    and coalesce(g.status, 'active') <> 'deleted'
  order by g.name
  limit greatest(1, least(coalesce(p_limit, 100), 500));
$$;

create or replace function public.set_governance_parent(
  p_child_id uuid,
  p_parent_id uuid default null
)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  perform public.require_governance_admin();

  if not exists (select 1 from public.governance where id = p_child_id) then
    raise exception 'Child governance entity not found';
  end if;

  if p_parent_id is not null and not exists (select 1 from public.governance where id = p_parent_id) then
    raise exception 'Parent governance entity not found';
  end if;

  if p_parent_id is not null and (
    p_parent_id = p_child_id
    or exists (
      with recursive ancestors(id) as (
        select p_parent_id
        union all
        select g.parent_entity_id
        from public.governance g
        join ancestors a on g.id = a.id
        where g.parent_entity_id is not null
      )
      select 1 from ancestors where id = p_child_id
    )
  ) then
    raise exception 'This parent would create a governance cycle';
  end if;

  update public.governance
     set parent_entity_id = p_parent_id,
         updated_by = auth.uid(),
         updated_at = now()
   where id = p_child_id;
end;
$$;

create or replace function public.add_governance_child(
  p_parent_id uuid,
  p_name text,
  p_entity_type public.governance_entity_type,
  p_unit_type public.governance_unit_type default 'unit',
  p_status text default 'active',
  p_valid_from timestamptz default null,
  p_valid_to timestamptz default null,
  p_category_id uuid default null,
  p_image_url text default null
)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_entity public.governance;
begin
  perform public.require_governance_admin();
  if not exists (select 1 from public.governance where id = p_parent_id) then
    raise exception 'Parent governance entity not found';
  end if;
  if nullif(btrim(p_name), '') is null then raise exception 'Name is required'; end if;
  if p_status not in ('active', 'inactive', 'deprecated') then raise exception 'Invalid governance status'; end if;
  if p_status in ('inactive', 'deprecated') and p_valid_to is null then raise exception 'Valid to is required for inactive or deprecated entities'; end if;
  if p_valid_to is not null and p_valid_from is not null and p_valid_to < p_valid_from then raise exception 'Valid to cannot be earlier than valid from'; end if;

  insert into public.governance(
    name, entity_type, unit_type, parent_entity_id, status, valid_from, valid_to,
    category_id, image_url, created_by, updated_by
  )
  values(
    btrim(p_name), p_entity_type, p_unit_type, p_parent_id, p_status, p_valid_from,
    case when p_status = 'active' then null else p_valid_to end,
    p_category_id, nullif(btrim(p_image_url), ''), auth.uid(), auth.uid()
  )
  returning * into v_entity;

  return to_jsonb(v_entity);
end;
$$;

create or replace function public.add_governance_parent(
  p_child_id uuid,
  p_name text,
  p_entity_type public.governance_entity_type,
  p_unit_type public.governance_unit_type default 'unit',
  p_status text default 'active',
  p_valid_from timestamptz default null,
  p_valid_to timestamptz default null,
  p_category_id uuid default null,
  p_image_url text default null
)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_entity public.governance;
  v_old_parent uuid;
begin
  perform public.require_governance_admin();
  if not exists (select 1 from public.governance where id = p_child_id) then
    raise exception 'Child governance entity not found';
  end if;
  if nullif(btrim(p_name), '') is null then raise exception 'Name is required'; end if;
  if p_status not in ('active', 'inactive', 'deprecated') then raise exception 'Invalid governance status'; end if;
  if p_status in ('inactive', 'deprecated') and p_valid_to is null then raise exception 'Valid to is required for inactive or deprecated entities'; end if;
  if p_valid_to is not null and p_valid_from is not null and p_valid_to < p_valid_from then raise exception 'Valid to cannot be earlier than valid from'; end if;

  select parent_entity_id into v_old_parent
    from public.governance
   where id = p_child_id;

  insert into public.governance(
    name, entity_type, unit_type, parent_entity_id, status, valid_from, valid_to,
    category_id, image_url, created_by, updated_by
  )
  values(
    btrim(p_name), p_entity_type, p_unit_type, v_old_parent, p_status, p_valid_from,
    case when p_status = 'active' then null else p_valid_to end,
    p_category_id, nullif(btrim(p_image_url), ''), auth.uid(), auth.uid()
  )
  returning * into v_entity;

  update public.governance
     set parent_entity_id = v_entity.id,
         updated_by = auth.uid(),
         updated_at = now()
   where id = p_child_id;

  return to_jsonb(v_entity);
end;
$$;

create or replace function public.delete_governance_entity(p_entity_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  child_count integer;
begin
  perform public.require_governance_admin();

  select count(*) into child_count
    from public.governance
   where parent_entity_id = p_entity_id;

  if child_count > 0 then
    raise exception 'Cannot delete an entity that still has child entities';
  end if;

  delete from public.governance where id = p_entity_id;
  if not found then raise exception 'Governance entity not found'; end if;
end;
$$;

grant execute on function public.set_governance_parent(uuid,uuid) to authenticated;
grant execute on function public.add_governance_child(uuid,text,public.governance_entity_type,public.governance_unit_type,text,timestamptz,timestamptz,uuid,text) to authenticated;
grant execute on function public.add_governance_parent(uuid,text,public.governance_entity_type,public.governance_unit_type,text,timestamptz,timestamptz,uuid,text) to authenticated;
grant execute on function public.delete_governance_entity(uuid) to authenticated;

-- Jurisdiction is a property of the governance entity, not a separate 1:1 unit.
create or replace function public.set_governance_jurisdiction(
  p_entity_id uuid,
  p_osm_type text,
  p_osm_id bigint,
  p_name text,
  p_admin_level integer,
  p_geojson jsonb default null
)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_metadata jsonb;
  v_unit_type public.governance_unit_type;
  v_entity_type text;
  v_entity_name text;
begin
  perform public.require_governance_admin();

  select entity_type::text, name, unit_type
    into v_entity_type, v_entity_name, v_unit_type
    from public.governance
   where id = p_entity_id;

  if v_entity_type is null then raise exception 'Governance entity not found'; end if;
  if p_osm_type is null or p_osm_type not in ('node', 'way', 'relation') then raise exception 'Invalid OSM object type'; end if;
  if p_osm_id is null or p_osm_id <= 0 then raise exception 'Invalid OSM object id'; end if;
  if p_name is null or btrim(p_name) = '' then raise exception 'OSM jurisdiction name is required'; end if;
  if p_admin_level is null or p_admin_level < 2 or p_admin_level > 10 then raise exception 'Invalid OSM administrative level'; end if;

  if v_entity_type in ('authority','ministry','department','division','office','ward','station','zone') then
    v_unit_type := v_entity_type::public.governance_unit_type;
  end if;

  v_metadata := jsonb_build_object(
    'osm_jurisdiction', jsonb_build_object(
      'osm_type', p_osm_type,
      'osm_id', p_osm_id,
      'name', btrim(p_name),
      'admin_level', p_admin_level,
      'source', 'OpenStreetMap Overpass/Nominatim',
      'updated_at', now()
    )
  );

  update public.governance
     set unit_type = coalesce(v_unit_type, unit_type),
         metadata = coalesce(metadata, '{}'::jsonb) || v_metadata,
         geom = case when p_geojson is null then geom else st_multi(st_setsrid(st_geomfromgeojson(p_geojson::text), 4326)) end,
         updated_by = auth.uid(),
         updated_at = now()
   where id = p_entity_id;

  return jsonb_build_object(
    'entity_id', p_entity_id,
    'osm_jurisdiction', v_metadata->'osm_jurisdiction'
  );
end;
$$;

grant execute on function public.set_governance_jurisdiction(uuid,text,bigint,text,integer,jsonb) to authenticated;

-- Governance contribution review also writes to governance directly.
create or replace function public.review_governance_contribution(
  p_contribution_id uuid,
  p_status text,
  p_review_notes text default null
)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  c public.governance_contribution;
  entity_id uuid;
  v_name text;
  v_slug text;
  v_short text;
  v_desc text;
  v_web text;
  v_image text;
  v_geom text;
  v_parent uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not exists(select 1 from public.profile where user_id = auth.uid() and role = 'admin') then raise exception 'Administrator access required'; end if;
  if p_status not in ('approved','rejected') then raise exception 'Invalid review status'; end if;

  select * into c from public.governance_contribution where id = p_contribution_id;
  if not found then raise exception 'Contribution not found'; end if;
  if c.status <> 'pending' then raise exception 'Contribution has already been reviewed'; end if;

  if p_status = 'approved' then
    v_name = nullif(trim(c.proposed_changes->>'name'),'');
    v_slug = nullif(trim(c.proposed_changes->>'slug'),'');
    v_short = nullif(trim(c.proposed_changes->>'short_name'),'');
    v_desc = nullif(trim(c.proposed_changes->>'description'),'');
    v_web = nullif(trim(c.proposed_changes->>'website'),'');
    v_image = nullif(trim(c.proposed_changes->>'image_url'),'');
    v_geom = nullif(trim(c.proposed_changes->>'geom_geojson'),'');
    v_parent = c.proposed_parent_id;

    if c.action = 'add' then
      if v_name is null or c.proposed_entity_type is null then raise exception 'Name and entity type are required'; end if;
      insert into public.governance(entity_type,name,short_name,slug,description,website,image_url,parent_entity_id,created_by,updated_by)
      values(c.proposed_entity_type::public.governance_entity_type,v_name,v_short,coalesce(v_slug,regexp_replace(lower(v_name),'[^a-z0-9]+','-','g')),v_desc,v_web,v_image,v_parent,c.submitted_by,auth.uid())
      returning id into entity_id;
      if v_geom is not null then
        update public.governance
           set geom = st_multi(st_setsrid(st_geomfromgeojson(v_geom),4326)),
               updated_by = auth.uid(), updated_at = now()
         where id = entity_id;
      end if;
    elsif c.action = 'edit' then
      entity_id = c.proposed_governance_id;
      if entity_id is null then raise exception 'Governance record is required'; end if;
      update public.governance
         set name=coalesce(v_name,name), short_name=coalesce(v_short,short_name), slug=coalesce(v_slug,slug),
             description=coalesce(v_desc,description), website=coalesce(v_web,website), image_url=coalesce(v_image,image_url),
             parent_entity_id=coalesce(v_parent,parent_entity_id), updated_by=auth.uid(), updated_at=now()
       where id=entity_id;
      if not found then raise exception 'Governance record not found'; end if;
      if v_geom is not null then
        update public.governance set geom=st_multi(st_setsrid(st_geomfromgeojson(v_geom),4326)),updated_by=auth.uid(),updated_at=now() where id=entity_id;
      end if;
    elsif c.action = 'move' then
      entity_id = c.proposed_governance_id;
      if entity_id is null then raise exception 'Governance record is required'; end if;
      update public.governance set parent_entity_id=v_parent,updated_by=auth.uid(),updated_at=now() where id=entity_id;
      if not found then raise exception 'Governance record not found'; end if;
    elsif c.action = 'delete' then
      entity_id = c.proposed_governance_id;
      if entity_id is null then raise exception 'Governance record is required'; end if;
      delete from public.governance where id=entity_id;
      if not found then raise exception 'Governance record not found'; end if;
    end if;
  end if;

  update public.governance_contribution
     set status=p_status, reviewed_by=auth.uid(), reviewed_at=now(), review_notes=p_review_notes, updated_at=now()
   where id=p_contribution_id
  returning to_jsonb(governance_contribution.*) into c;

  return to_jsonb(c);
end;
$$;

grant execute on function public.review_governance_contribution(uuid,text,text) to authenticated;

-- The old table is now redundant. Drop its table-only policies/triggers and replace it
-- with a read-only compatibility view so the currently deployed application can continue
-- reading legacy jurisdiction metadata during the application rollout.
drop table public.governance_unit;

create view public.governance_unit as
select
  g.id,
  g.id as entity_id,
  g.unit_type,
  g.name,
  g.code,
  g.description,
  g.valid_from,
  g.valid_to,
  g.metadata,
  g.verification_status,
  g.confidence,
  g.created_by,
  g.updated_by,
  g.created_at,
  g.updated_at,
  g.parent_entity_id,
  g.geom
from public.governance g;

grant select on public.governance_unit to anon, authenticated;
