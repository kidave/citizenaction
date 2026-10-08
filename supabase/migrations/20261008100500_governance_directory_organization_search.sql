-- Directory search supports the same organization-oriented search across organizations,
-- positions and people. For positions/people, organization matching is based on the
-- latest/current appointment rather than stale appointment history.

drop function if exists public.get_governance_directory(text,text,text,uuid,uuid,uuid,integer);

create function public.get_governance_directory(
  p_search text default null,
  p_tab text default 'organizations',
  p_type text default null,
  p_category_id uuid default null,
  p_geography_id uuid default null,
  p_organization_id uuid default null,
  p_limit integer default 500
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
  parent_id uuid,
  parent_name text,
  unit_type text,
  category_id uuid,
  category_name text,
  geography_id uuid,
  geography_name text,
  current_holder_name text,
  current_holder_id uuid,
  current_holder_started_at timestamptz,
  current_organization_id uuid,
  current_organization_name text
)
language sql stable
set search_path = public
as $$
with base as (
  select
    g.id,
    g.name,
    g.short_name,
    g.slug,
    g.image_url,
    g.entity_type::text as entity_type,
    g.description,
    g.status,
    g.parent_entity_id as parent_id,
    case
      when g.entity_type::text = 'position' then position_org.organization_name
      else parent_g.name
    end as parent_name,
    g.unit_type::text as unit_type,
    g.category_id,
    c.name as category_name,
    g.geography_id,
    geo.name as geography_name,
    current_role.person_name as current_holder_name,
    current_role.person_id as current_holder_id,
    current_role.started_at as current_holder_started_at,
    case when g.entity_type::text = 'position' then position_org.organization_id else current_role.organization_id end as current_organization_id,
    current_role.organization_name as current_organization_name
  from public.governance g
  left join public.governance parent_g on parent_g.id = g.parent_entity_id
  left join public.category c on c.id = g.category_id
  left join public.geographies geo on geo.id = g.geography_id
  left join lateral (
    select
      og.id as organization_id,
      og.name as organization_name
    from public.position pos
    join public.position_appointment pa on pa.position_id = pos.id
    join public.governance og on og.id = pa.organization_governance_id
    where pos.governance_id = g.id
    order by (pa.ended_at is null) desc, pa.is_primary desc, pa.started_at desc, pa.id desc
    limit 1
  ) position_org on true
  left join lateral (
    select
      pa.person_id,
      per.name as person_name,
      pa.started_at,
      og.id as organization_id,
      og.name as organization_name
    from public.position_appointment pa
    join public.governance og on og.id = pa.organization_governance_id
    left join public.person per on per.id = pa.person_id
    where
      (
        (g.entity_type::text = 'position' and pa.position_id = g.id)
        or
        (g.entity_type::text = 'person' and pa.person_id = g.id)
      )
      and pa.is_vacant = false
      and pa.started_at <= now()
      and (pa.ended_at is null or pa.ended_at >= now())
    order by pa.is_primary desc, pa.started_at desc, pa.id desc
    limit 1
  ) current_role on true
  where coalesce(g.status, 'active') <> 'deleted'
    and (
      (p_tab = 'organizations' and g.entity_type::text not in ('person','position'))
      or (p_tab = 'positions' and g.entity_type::text = 'position')
      or (p_tab = 'people' and g.entity_type::text = 'person')
    )
    and (p_type is null or p_type = '' or p_type = 'all' or g.entity_type::text = p_type)
    and (p_category_id is null or g.category_id = p_category_id)
    and (p_geography_id is null or g.geography_id = p_geography_id)
    and (
      p_organization_id is null
      or current_role.organization_id = p_organization_id
    )
    and (
      nullif(trim(p_search), '') is null
      or g.name ilike '%' || trim(p_search) || '%'
      or coalesce(g.short_name, '') ilike '%' || trim(p_search) || '%'
      or coalesce(c.name, '') ilike '%' || trim(p_search) || '%'
      or coalesce(geo.name, '') ilike '%' || trim(p_search) || '%'
      or coalesce(current_role.organization_name, '') ilike '%' || trim(p_search) || '%'
      or coalesce(position_org.organization_name, '') ilike '%' || trim(p_search) || '%'
    )
)
select *
from base
order by name
limit greatest(1, least(coalesce(p_limit, 500), 500));
$$;

grant execute on function public.get_governance_directory(text,text,text,uuid,uuid,uuid,integer) to anon, authenticated;
revoke execute on function public.get_governance_directory(text,text,text,uuid,uuid,uuid,integer) from public;

notify pgrst, 'reload schema';
