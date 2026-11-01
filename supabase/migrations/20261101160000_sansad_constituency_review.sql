begin;
create table if not exists public.historical_political_parliamentary_constituency (
  id uuid primary key default gen_random_uuid(),
  source_mapping_id uuid not null unique references public.sansad_constituency_mapping(id) on delete cascade,
  name text not null,
  state_name text,
  valid_from date,
  valid_to date,
  successor_geography_ids uuid[] not null default '{}'::uuid[],
  source_reference text,
  source_notes text,
  observed_election_years integer[] not null default '{}'::integer[],
  observed_lok_sabha_terms integer[] not null default '{}'::integer[],
  observed_states text[] not null default '{}'::text[],
  state_year_observations jsonb not null default '{}'::jsonb,
  affected_member_records integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.sansad_constituency_mapping enable row level security;
alter table public.historical_political_parliamentary_constituency enable row level security;
drop policy if exists sansad_constituency_mapping_admin_read on public.sansad_constituency_mapping;
create policy sansad_constituency_mapping_admin_read on public.sansad_constituency_mapping
for select to authenticated using (exists (select 1 from public.profile p where p.user_id=(select auth.uid()) and p.role='admin'));
drop policy if exists historical_parliamentary_constituency_admin_read on public.historical_political_parliamentary_constituency;
create policy historical_parliamentary_constituency_admin_read on public.historical_political_parliamentary_constituency
for select to authenticated using (exists (select 1 from public.profile p where p.user_id=(select auth.uid()) and p.role='admin'));

create or replace function public.review_sansad_constituency_mapping(p_mapping_id uuid, p_changes jsonb)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare
  v_mapping public.sansad_constituency_mapping%rowtype;
  v_geo public.geographies%rowtype;
  v_status text;
  v_resolution text;
  v_geo_id uuid;
  v_source_name text;
begin
  if auth.uid() is null or not exists(select 1 from public.profile p where p.user_id=auth.uid() and p.role='admin') then
    raise exception 'Administrator access is required.' using errcode='42501';
  end if;
  if p_changes is null or jsonb_typeof(p_changes)<>'object' then raise exception 'Changes must be a JSON object.' using errcode='22023'; end if;
  v_status:=coalesce(p_changes->>'review_status','pending');
  if v_status not in ('pending','in_review','approved','rejected') then raise exception 'Invalid review status.' using errcode='22023'; end if;
  v_resolution:=nullif(btrim(p_changes->>'resolution_type'),'');
  v_geo_id:=nullif(p_changes->>'geography_id','')::uuid;
  v_source_name:=nullif(btrim(p_changes->>'source_name'),'');
  if v_source_name is null then raise exception 'Source constituency name is required.' using errcode='22023'; end if;
  select * into v_mapping from public.sansad_constituency_mapping where id=p_mapping_id for update;
  if not found then raise exception 'Constituency mapping not found.' using errcode='P0002'; end if;

  if v_status='approved' and v_resolution='other_name' then
    if v_geo_id is null then raise exception 'Select a current geography before approving an alias.' using errcode='22023'; end if;
    select * into v_geo from public.geographies where id=v_geo_id and geography_type='parliamentary_constituency' and boundary_category='political' for update;
    if not found then raise exception 'Selected record is not a political parliamentary constituency.' using errcode='22023'; end if;
    if lower(v_geo.name)=lower(v_source_name) or lower(coalesce(v_geo.official_name,''))=lower(v_source_name) then
      raise exception 'Source name is already a canonical geography label.' using errcode='22023';
    end if;
    if exists (
      select 1 from public.geographies g
      where g.id<>v_geo_id and g.geography_type='parliamentary_constituency' and g.boundary_category='political'
        and (
          lower(g.name)=lower(v_source_name)
          or lower(coalesce(g.official_name,''))=lower(v_source_name)
          or exists(select 1 from unnest(coalesce(g.other_names,'{}'::text[])) existing_alias where lower(existing_alias)=lower(v_source_name))
        )
    ) then
      raise exception 'This source label already matches another parliamentary constituency. Resolve the conflict before approving it as an alias.' using errcode='23505';
    end if;
    update public.geographies set other_names=case
      when exists(select 1 from unnest(coalesce(other_names,'{}'::text[])) alias where lower(alias)=lower(v_source_name))
      then coalesce(other_names,'{}'::text[])
      else array_append(coalesce(other_names,'{}'::text[]),v_source_name) end
    where id=v_geo_id;
  end if;

  update public.sansad_constituency_mapping set
    source_name=v_source_name,
    source_state=nullif(btrim(p_changes->>'source_state'),''),
    canonical_name=nullif(btrim(p_changes->>'canonical_name'),''),
    geography_id=case when v_resolution='former' then null else v_geo_id end,
    resolution_type=v_resolution,
    valid_from=nullif(p_changes->>'valid_from','')::date,
    valid_to=nullif(p_changes->>'valid_to','')::date,
    successor_geography_ids=coalesce(array(select jsonb_array_elements_text(coalesce(p_changes->'successor_geography_ids','[]'::jsonb))::uuid),'{}'::uuid[]),
    review_status=v_status,
    source_reference=nullif(btrim(p_changes->>'source_reference'),''),
    state_context_needed=nullif(btrim(p_changes->>'state_context_needed'),''),
    notes=nullif(btrim(p_changes->>'notes'),''),
    dry_run_issue=nullif(btrim(p_changes->>'dry_run_issue'),''),
    timeline_match_type=nullif(btrim(p_changes->>'timeline_match_type'),''),
    timeline_source=nullif(btrim(p_changes->>'timeline_source'),''),
    timeline_coverage_note=nullif(btrim(p_changes->>'timeline_coverage_note'),''),
    updated_at=now()
  where id=p_mapping_id returning * into v_mapping;

  if v_status='approved' and v_resolution in ('former','successor') then
    insert into public.historical_political_parliamentary_constituency (
      source_mapping_id,name,state_name,valid_from,valid_to,successor_geography_ids,source_reference,source_notes,
      observed_election_years,observed_lok_sabha_terms,observed_states,state_year_observations,affected_member_records
    ) values (
      v_mapping.id,v_mapping.source_name,v_mapping.source_state,v_mapping.valid_from,v_mapping.valid_to,v_mapping.successor_geography_ids,
      v_mapping.source_reference,v_mapping.notes,v_mapping.observed_election_years,v_mapping.observed_lok_sabha_terms,
      v_mapping.observed_states,v_mapping.state_year_observations,v_mapping.affected_member_records
    ) on conflict(source_mapping_id) do update set
      name=excluded.name,state_name=excluded.state_name,valid_from=excluded.valid_from,valid_to=excluded.valid_to,
      successor_geography_ids=excluded.successor_geography_ids,source_reference=excluded.source_reference,source_notes=excluded.source_notes,
      observed_election_years=excluded.observed_election_years,observed_lok_sabha_terms=excluded.observed_lok_sabha_terms,
      observed_states=excluded.observed_states,state_year_observations=excluded.state_year_observations,
      affected_member_records=excluded.affected_member_records,updated_at=now();
  elsif (v_resolution is null or v_resolution not in ('former','successor')) or v_status<>'approved' then
    delete from public.historical_political_parliamentary_constituency where source_mapping_id=v_mapping.id;
  end if;
  return to_jsonb(v_mapping);
end;
$$;
revoke all on function public.review_sansad_constituency_mapping(uuid,jsonb) from public,anon;
grant execute on function public.review_sansad_constituency_mapping(uuid,jsonb) to authenticated;
grant select on public.sansad_constituency_mapping to authenticated;
grant select on public.historical_political_parliamentary_constituency to authenticated;
commit;
