begin;

alter table public.governance
  drop constraint if exists governance_validity_order_check;
alter table public.governance
  add constraint governance_validity_order_check
  check (valid_to is null or valid_from is null or valid_to >= valid_from);

create unique index if not exists governance_slug_unique_idx
  on public.governance (slug)
  where slug is not null;

create index if not exists osm_jurisdiction_cache_parent_level_idx
  on public.osm_jurisdiction_cache (parent_osm_type, parent_osm_id, admin_level);

create or replace function public.set_governance_jurisdiction(
  p_entity_id uuid,
  p_osm_type text,
  p_osm_id bigint,
  p_name text,
  p_admin_level integer,
  p_geojson jsonb default null,
  p_display_name text default null,
  p_operator text default null,
  p_operator_alt_name text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_metadata jsonb;
  v_unit_type public.governance_unit_type;
  v_entity_type text;
  v_display_name text;
begin
  perform public.require_governance_admin();
  select entity_type::text, unit_type into v_entity_type, v_unit_type from public.governance where id = p_entity_id;
  if v_entity_type is null then raise exception 'Governance entity not found'; end if;
  if p_osm_type is null or p_osm_type not in ('node','way','relation') then raise exception 'Invalid OSM object type'; end if;
  if p_osm_id is null or p_osm_id <= 0 then raise exception 'Invalid OSM object id'; end if;
  if p_name is null or btrim(p_name) = '' then raise exception 'OSM jurisdiction name is required'; end if;
  if p_admin_level is null or p_admin_level < 2 or p_admin_level > 10 then raise exception 'Invalid OSM administrative level'; end if;
  if v_entity_type in ('authority','ministry','department','division','office','ward','station','zone') then v_unit_type := v_entity_type::public.governance_unit_type; end if;
  v_display_name := coalesce(nullif(btrim(p_display_name), ''), nullif(btrim(p_operator_alt_name), ''), nullif(btrim(p_operator), ''), btrim(p_name));
  v_metadata := jsonb_build_object('osm_jurisdiction', jsonb_build_object(
    'osm_type', p_osm_type,
    'osm_id', p_osm_id,
    'name', btrim(p_name),
    'display_name', v_display_name,
    'admin_level', p_admin_level,
    'operator', nullif(btrim(p_operator), ''),
    'operator_alt_name', nullif(btrim(p_operator_alt_name), ''),
    'source', 'OpenStreetMap Overpass/Nominatim',
    'updated_at', now()
  ));
  update public.governance
     set unit_type = coalesce(v_unit_type, unit_type),
         metadata = coalesce(metadata, '{}'::jsonb) || v_metadata,
         geom = case when p_geojson is null then geom else st_multi(st_setsrid(st_geomfromgeojson(p_geojson::text), 4326)) end,
         updated_by = auth.uid(),
         updated_at = now()
   where id = p_entity_id;
  return jsonb_build_object('entity_id', p_entity_id, 'osm_jurisdiction', v_metadata->'osm_jurisdiction');
end;
$$;

create or replace function public.clear_governance_jurisdiction(p_entity_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.require_governance_admin();
  update public.governance
     set metadata = coalesce(metadata, '{}'::jsonb) - 'osm_jurisdiction',
         geom = null,
         updated_by = auth.uid(),
         updated_at = now()
   where id = p_entity_id;
  if not found then raise exception 'Governance entity not found'; end if;
  return jsonb_build_object('entity_id', p_entity_id, 'osm_jurisdiction', null);
end;
$$;

revoke execute on function public.create_governance_entity(text, public.governance_entity_type, text, text, timestamptz, timestamptz, uuid, text) from public, anon;
revoke execute on function public.update_governance_entity(uuid, text, text, text, text, public.governance_entity_type, text, timestamptz, timestamptz, text, uuid) from public, anon;
revoke execute on function public.delete_governance_entity(uuid) from public, anon;
revoke execute on function public.set_governance_parent(uuid, uuid) from public, anon;
revoke execute on function public.set_governance_jurisdiction(uuid, text, bigint, text, integer, jsonb) from public, anon;
revoke execute on function public.upsert_organization(uuid, uuid, text, uuid, text, uuid, timestamptz, timestamptz, boolean, boolean, uuid, text) from public, anon;
revoke execute on function public.delete_organization(uuid) from public, anon;
revoke execute on function public.review_governance_contribution(uuid, text, text) from public, anon;
revoke execute on function public.set_platform_user_role(uuid, text) from public, anon;
revoke execute on function public.get_governance_admin_state() from public, anon;
revoke execute on function public.require_governance_admin() from public, anon;
revoke execute on function public.clear_governance_jurisdiction(uuid) from public, anon;
grant execute on function public.create_governance_entity(text, public.governance_entity_type, text, text, timestamptz, timestamptz, uuid, text) to authenticated;
grant execute on function public.update_governance_entity(uuid, text, text, text, text, public.governance_entity_type, text, timestamptz, timestamptz, text, uuid) to authenticated;
grant execute on function public.delete_governance_entity(uuid) to authenticated;
grant execute on function public.set_governance_parent(uuid, uuid) to authenticated;
grant execute on function public.set_governance_jurisdiction(uuid, text, bigint, text, integer, jsonb) to authenticated;
grant execute on function public.upsert_organization(uuid, uuid, text, uuid, text, uuid, timestamptz, timestamptz, boolean, boolean, uuid, text) to authenticated;
grant execute on function public.delete_organization(uuid) to authenticated;
grant execute on function public.review_governance_contribution(uuid, text, text) to authenticated;
grant execute on function public.set_platform_user_role(uuid, text) to authenticated;
grant execute on function public.get_governance_admin_state() to authenticated;
grant execute on function public.require_governance_admin() to authenticated;
grant execute on function public.clear_governance_jurisdiction(uuid) to authenticated;
revoke execute on function public.execute_sql(text) from public, anon, authenticated;
alter view public.governance_view set (security_invoker = true);

commit;
