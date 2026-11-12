create or replace function public.delete_jurisdiction_geography(p_id uuid)
returns boolean
language plpgsql security definer set search_path = public
as $$
begin
  perform public.require_governance_admin();
  if exists (select 1 from public.governance_boundary where geography_id = p_id) then
    raise exception 'Geography is linked to governance entities';
  end if;
  delete from public.jurisdiction_geography where id = p_id;
  return found;
end;
$$;

revoke all on function public.delete_jurisdiction_geography(uuid) from public;
grant execute on function public.delete_jurisdiction_geography(uuid) to authenticated;

insert into public.jurisdiction_geography (
  name, geography_type, country_code, source, metadata, geom
)
select
  g.name || ' boundary', 'other', 'IN', 'legacy_governance_geom',
  jsonb_build_object('migrated_from_governance_id', g.id::text),
  st_multi(g.geom)
from public.governance g
where g.geom is not null
  and not exists (
    select 1 from public.jurisdiction_geography j
    where j.metadata->>'migrated_from_governance_id' = g.id::text
  );

insert into public.governance_boundary (governance_id, geography_id, boundary_type, is_primary, notes, created_by, updated_by)
select g.id, j.id, 'custom', true, 'Migrated from legacy governance.geom', g.created_by, g.updated_by
from public.governance g
join public.jurisdiction_geography j on j.metadata->>'migrated_from_governance_id' = g.id::text
where g.geom is not null
on conflict (governance_id, geography_id) do nothing;

update public.governance set geom = null, updated_at = now() where geom is not null;
