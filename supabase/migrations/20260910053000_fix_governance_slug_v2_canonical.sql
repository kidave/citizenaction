-- Keep the governance record lookup aligned with the canonical governance schema.
-- location_id/geographic_scope were removed from governance; tree/detail pages still use this RPC.

drop function if exists public.get_governance_by_slug_v2(text);

create function public.get_governance_by_slug_v2(p_slug text)
returns table(
  id uuid,
  name text,
  short_name text,
  slug text,
  entity_type text,
  image_url text,
  website text,
  description text,
  status text,
  verification_status text,
  confidence numeric,
  parent_id uuid,
  parent_name text,
  parent_slug text,
  path text,
  geom geometry,
  category_id uuid,
  category_name text
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
    c.name
  from public.governance g
  left join public.governance p on p.id = g.parent_entity_id
  left join public.category c on c.id = g.category_id
  where g.slug = p_slug
    and coalesce(g.status, 'active') <> 'deleted'
  limit 1;
$$;

grant execute on function public.get_governance_by_slug_v2(text) to anon, authenticated;
