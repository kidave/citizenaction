-- Expand the underlying directory RPC ceiling and expose a paginated,
-- domain-aware read endpoint with an accurate total count.
begin;

do $$
declare v_definition text;
begin
  select pg_get_functiondef('public.get_governance_directory(text,text,text,uuid,uuid,uuid,integer)'::regprocedure)
  into v_definition;
  if position('least(coalesce(p_limit,100),500)' in v_definition) = 0 then
    raise exception 'Expected governance directory limit expression was not found; inspect the RPC before applying.';
  end if;
  v_definition := replace(v_definition, 'least(coalesce(p_limit,100),500)', 'least(coalesce(p_limit,100),50000)');
  execute v_definition;
end;
$$;

create or replace function public.get_governance_directory_page(
  p_search text default null,
  p_tab text default 'organizations',
  p_type text default null,
  p_category_id uuid default null,
  p_geography_id uuid default null,
  p_organization_id uuid default null,
  p_page_size integer default 24,
  p_offset integer default 0,
  p_domain text default null,
  p_current_only boolean default false
)
returns table (
  id uuid, name text, short_name text, slug text, image_url text, type text,
  description text, status text, valid_from timestamptz, valid_to timestamptz,
  verification_status text, confidence numeric, parent_id uuid, parent_name text,
  parent_slug text, category_id uuid, category_name text, geography_id uuid,
  geography_name text, geography_type text, current_holder_name text,
  current_holder_id uuid, current_holder_started_at timestamptz,
  current_holder_image_url text, total_count bigint
)
language plpgsql
stable
set search_path = public, pg_catalog
as $$
begin
  if p_domain is not null and p_domain not in ('politics','legislature','executive','judiciary') then
    raise exception 'Invalid governance domain.';
  end if;
  if p_tab not in ('organizations','people','positions') then
    raise exception 'Invalid governance directory tab.';
  end if;

  return query
  with filtered as (
    select d.*
    from public.get_governance_directory(
      p_search,p_tab,p_type,p_category_id,p_geography_id,p_organization_id,50000
    ) d
    where
      (p_tab='organizations' and exists (
        select 1 from public.governance g
        where g.id=d.id and g.domain is not distinct from p_domain
      ))
      or (p_tab='people' and (
        (d.parent_id is null and p_domain is null)
        or exists (
          select 1 from public.governance g
          where g.id=d.parent_id and g.domain is not distinct from p_domain
        )
      ))
      or (p_tab='positions' and exists (
        select 1 from public.governance g
        where g.id=d.parent_id and g.domain is not distinct from p_domain
      ))
  ),
  current_filtered as (
    select f.* from filtered f
    where p_tab <> 'people' or not p_current_only or f.parent_id is not null
  ),
  counted as (
    select cf.*, count(*) over() as total_count
    from current_filtered cf
  )
  select
    c.id,c.name,c.short_name,c.slug,c.image_url,c.type,c.description,c.status,
    c.valid_from,c.valid_to,c.verification_status,c.confidence,c.parent_id,
    c.parent_name,c.parent_slug,c.category_id,c.category_name,c.geography_id,
    c.geography_name,c.geography_type,c.current_holder_name,c.current_holder_id,
    c.current_holder_started_at,c.current_holder_image_url,c.total_count
  from counted c
  order by c.name
  limit greatest(1,least(coalesce(p_page_size,24),100))
  offset greatest(coalesce(p_offset,0),0);
end;
$$;

revoke all on function public.get_governance_directory_page(text,text,text,uuid,uuid,uuid,integer,integer,text,boolean) from public;
grant execute on function public.get_governance_directory_page(text,text,text,uuid,uuid,uuid,integer,integer,text,boolean) to anon,authenticated,service_role;

commit;
