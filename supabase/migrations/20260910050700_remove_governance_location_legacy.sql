-- Remove the final governance RPC dependency on the deleted geographic_scope model.
-- governance.geom is now the canonical jurisdiction geometry; no location_id lookup remains.

create or replace function public.get_governance_directory_v2(
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
  verification_status text,
  confidence numeric,
  parent_id uuid,
  parent_name text,
  parent_slug text,
  unit_type text,
  code text,
  geom geometry,
  category_id uuid,
  category_name text
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
    c.name
  from public.governance g
  left join public.governance p on p.id = g.parent_entity_id
  left join public.category c on c.id = g.category_id
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

grant execute on function public.get_governance_directory_v2(text, uuid, text, integer, boolean)
to anon, authenticated;

-- Keep the canonical non-v2 directory API aligned with the same architecture.
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
    g.valid_from,
    g.valid_to,
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
    g.profile_user_id
  from public.governance g
  left join public.governance p on p.id = g.parent_entity_id
  left join public.category c on c.id = g.category_id
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

grant execute on function public.get_governance_directory(text, uuid, text, integer, boolean)
to anon, authenticated;
