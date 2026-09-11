create unique index if not exists person_profile_user_id_unique_idx
  on public.person(profile_user_id)
  where profile_user_id is not null;

create or replace function public.get_governance_directory(
  p_search text default null,
  p_parent_id uuid default null,
  p_entity_type text default null,
  p_limit integer default 100,
  p_include_all boolean default false
)
returns table(
  id uuid,
  name text,
  short_name text,
  slug text,
  image_url text,
  entity_type text,
  description text,
  status text,
  valid_from timestamptz,
  valid_to timestamptz,
  verification_status text,
  confidence numeric,
  parent_id uuid,
  parent_name text,
  parent_slug text,
  unit_type text,
  code text,
  geom geometry,
  category_id uuid,
  category_name text,
  profile_user_id uuid
)
language sql stable set search_path to 'public','pg_catalog'
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
    g.valid_from,
    g.valid_to,
    g.verification_status::text,
    g.confidence,
    g.parent_entity_id,
    case
      when g.entity_type::text = 'position' then position_org.organization_name
      else p.name
    end,
    case
      when g.entity_type::text = 'position' then position_org.organization_slug
      else p.slug
    end,
    g.unit_type::text,
    g.code,
    g.geom,
    g.category_id,
    c.name,
    g.profile_user_id
  from public.governance g
  left join public.governance p on p.id = g.parent_entity_id
  left join public.category c on c.id = g.category_id
  left join lateral (
    select og.name as organization_name, og.slug as organization_slug
    from public.position pos
    join public.position_appointment pa on pa.position_id = pos.id
    join public.governance og on og.id = pa.organization_governance_id
    where pos.governance_id = g.id
    order by (pa.ended_at is null) desc, pa.is_primary desc, pa.started_at desc, pa.id desc
    limit 1
  ) position_org on true
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
    )
    and (p_entity_type is null or p_entity_type = '' or g.entity_type::text = p_entity_type)
    and coalesce(g.status, 'active') <> 'deleted'
  order by g.name
  limit greatest(1, least(coalesce(p_limit, 100), 500));
$$;

grant execute on function public.get_governance_directory(text,uuid,text,integer,boolean) to anon, authenticated;

create or replace function public.get_governance_directory_v2(
  p_search text default null,
  p_tab text default 'entities',
  p_entity_type text default null,
  p_category_id uuid default null,
  p_geography_id uuid default null,
  p_limit integer default 100
)
returns table(
  id uuid,
  name text,
  short_name text,
  slug text,
  image_url text,
  entity_type text,
  description text,
  status text,
  valid_from timestamptz,
  valid_to timestamptz,
  verification_status text,
  confidence numeric,
  parent_id uuid,
  parent_name text,
  parent_slug text,
  unit_type text,
  category_id uuid,
  category_name text,
  geography_id uuid,
  geography_name text,
  geography_type text,
  current_holder_name text,
  current_holder_id uuid,
  current_holder_started_at timestamptz
)
language sql stable set search_path to 'public','pg_catalog'
as $$
with base as (
  select
    g.id,
    g.name,
    g.short_name,
    g.slug,
    g.image_url,
    g.entity_type::text,
    g.description,
    g.status,
    g.valid_from,
    g.valid_to,
    g.verification_status::text,
    g.confidence,
    g.parent_entity_id as parent_id,
    case
      when g.entity_type::text = 'position' then position_org.organization_name
      else p.name
    end as parent_name,
    case
      when g.entity_type::text = 'position' then position_org.organization_slug
      else p.slug
    end as parent_slug,
    g.unit_type::text,
    c.id as category_id,
    c.name as category_name,
    g.geography_id,
    geo.name as geography_name,
    geo.geography_type,
    ca.person_name as current_holder_name,
    ca.person_id as current_holder_id,
    ca.started_at as current_holder_started_at
  from public.governance g
  left join public.governance p on p.id = g.parent_entity_id
  left join public.category c on c.id = g.category_id
  left join public.geographies geo on geo.id = g.geography_id
  left join lateral (
    select og.name as organization_name, og.slug as organization_slug
    from public.position pos
    join public.position_appointment pa on pa.position_id = pos.id
    join public.governance og on og.id = pa.organization_governance_id
    where pos.governance_id = g.id
    order by (pa.ended_at is null) desc, pa.is_primary desc, pa.started_at desc, pa.id desc
    limit 1
  ) position_org on true
  left join lateral (
    select pg.name as person_name, pa.person_id, pa.started_at
    from public.position pos
    join public.position_appointment pa on pa.position_id = pos.id
    left join public.person pr on pr.id = pa.person_id
    left join public.governance pg on pg.id = pr.governance_id
    where pos.governance_id = g.id
      and pa.is_vacant = false
      and pa.started_at <= now()
      and (pa.ended_at is null or pa.ended_at >= now())
    order by pa.is_primary desc, pa.started_at desc
    limit 1
  ) ca on true
  where coalesce(g.status, 'active') <> 'deleted'
    and (
      (p_tab = 'entities' and g.entity_type::text not in ('person','position'))
      or (p_tab = 'positions' and g.entity_type::text = 'position')
      or (p_tab = 'people' and g.entity_type::text = 'person')
    )
    and (p_entity_type is null or p_entity_type = '' or g.entity_type::text = p_entity_type)
    and (p_category_id is null or g.category_id = p_category_id)
    and (p_geography_id is null or g.geography_id = p_geography_id)
    and (
      p_search is null
      or btrim(p_search) = ''
      or g.name ilike '%' || btrim(p_search) || '%'
      or coalesce(g.short_name, '') ilike '%' || btrim(p_search) || '%'
      or coalesce(g.description, '') ilike '%' || btrim(p_search) || '%'
      or coalesce(c.name, '') ilike '%' || btrim(p_search) || '%'
      or coalesce(geo.name, '') ilike '%' || btrim(p_search) || '%'
    )
)
select * from base
order by name
limit greatest(1, least(coalesce(p_limit, 100), 500));
$$;

grant execute on function public.get_governance_directory_v2(text,text,text,uuid,uuid,integer) to anon, authenticated;
