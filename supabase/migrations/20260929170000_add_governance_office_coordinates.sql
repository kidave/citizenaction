alter table public.governance
  add column if not exists lat double precision,
  add column if not exists lng double precision;

update public.governance
set lat = 18.9400, lng = 72.8353
where id = 'c134f3b0-81a2-42c3-98f6-a54b4aebca58'
  and lat is null and lng is null;

update public.governance
set lat = 19.0541606, lng = 72.8521355
where id = '6285bb6d-337c-487a-8a69-b9391078f821'
  and lat is null and lng is null;

update public.governance
set lat = 18.9236, lng = 72.8325
where id = 'd06c81e2-e147-423d-baa3-24f856cb102f'
  and lat is null and lng is null;

create or replace function public.update_governance_location(
  p_governance_id uuid,
  p_address text default null,
  p_lat double precision default null,
  p_lng double precision default null
)
returns public.governance
language plpgsql
security definer
set search_path to public
as $$
declare
  v_row public.governance;
begin
  perform public.require_governance_admin();

  if p_governance_id is null then
    raise exception 'Governance entity is required';
  end if;

  update public.governance
  set address = nullif(btrim(p_address), ''),
      lat = p_lat,
      lng = p_lng,
      updated_by = auth.uid(),
      updated_at = now()
  where id = p_governance_id
  returning * into v_row;

  if not found then
    raise exception 'Governance entity not found';
  end if;

  return v_row;
end;
$$;

grant execute on function public.update_governance_location(uuid,text,double precision,double precision) to authenticated;

create or replace function public.get_post_governance(p_post_ids uuid[])
returns table(post_id uuid, governance jsonb)
language sql stable
set search_path to public, pg_catalog
as $$
  select x.id as post_id,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', g.id,
          'name', g.name,
          'label', g.name,
          'short_name', g.short_name,
          'slug', g.slug,
          'image_url', g.image_url,
          'type', g.type::text,
          'lat', g.lat,
          'lng', g.lng,
          'address', g.address,
          'geography_id', g.geography_id
        ) order by g.name
      ) filter (where g.id is not null),
      '[]'::jsonb
    )
  from unnest(coalesce(p_post_ids, '{}'::uuid[])) x(id)
  left join public.post_governance pg on pg.post_id = x.id
  left join public.governance g on g.id = pg.governance_id
  group by x.id;
$$;
