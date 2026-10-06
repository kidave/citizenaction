create or replace function public.get_political_geography_children(p_parent_id uuid)
returns table (
  id uuid,
  name text,
  official_name text,
  geography_type text,
  boundary_category text,
  parent_id uuid,
  country_code text,
  osm_type text,
  osm_id bigint,
  center jsonb,
  metadata jsonb
)
language sql
stable
set search_path = public
as $$
  select
    child.id,
    child.name,
    child.official_name,
    child.geography_type::text,
    child.boundary_category::text,
    child.parent_id,
    child.country_code,
    child.osm_type::text,
    child.osm_id,
    child.center,
    child.metadata
  from public.geographies parent
  join public.geographies child
    on child.geography_type = 'assembly_constituency'
   and child.boundary_category = 'political'
   and child.geom is not null
   and parent.geom is not null
   and public.ST_Intersects(child.geom, parent.geom)
   and public.ST_Area(public.ST_Intersection(child.geom, parent.geom))
       / nullif(public.ST_Area(child.geom), 0) >= 0.5
  where parent.id = p_parent_id
    and parent.geography_type = 'parliamentary_constituency'
  order by child.name;
$$;

revoke execute on function public.get_political_geography_children(uuid) from public;
revoke execute on function public.get_political_geography_children(uuid) from anon;
grant execute on function public.get_political_geography_children(uuid) to authenticated;
