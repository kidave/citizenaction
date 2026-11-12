-- Keep governance hierarchy and organizational HR structure separate.
-- Governance relationships remain in governance_unit. Leadership history remains in governance_leadership.

alter table public.governance_leadership add column if not exists is_primary boolean not null default false;
alter table public.governance_leadership add column if not exists reports_to_id uuid references public.governance_leadership(id) on delete set null;
alter table public.governance_leadership add column if not exists position_governance_id uuid references public.governance(id) on delete set null;

create index if not exists governance_leadership_primary_idx on public.governance_leadership (governance_id, is_primary, started_at desc);
create index if not exists governance_leadership_reports_to_idx on public.governance_leadership (reports_to_id);
create index if not exists governance_leadership_position_idx on public.governance_leadership (position_governance_id);

create or replace function public.get_governance_leader_at(p_entity_id uuid, p_at timestamptz default now())
returns table(id uuid, person_name text, person_governance_id uuid, position_name text, position_governance_id uuid, started_at timestamptz, ended_at timestamptz, is_vacant boolean)
language sql stable set search_path = public, pg_catalog
as $$
  select gl.id, gl.person_name, gl.person_governance_id, gl.position_name, gl.position_governance_id, gl.started_at, gl.ended_at, gl.is_vacant
  from public.governance_leadership gl
  where gl.governance_id = p_entity_id
    and gl.started_at <= p_at
    and (gl.ended_at is null or gl.ended_at >= p_at)
  order by gl.is_primary desc, gl.started_at desc
  limit 1;
$$;

drop function if exists public.get_governance_people_at(uuid, timestamptz);
create function public.get_governance_people_at(p_entity_id uuid, p_at timestamptz default now())
returns table(relationship_id uuid, appointment_id uuid, person_entity_id uuid, person_name text, position_entity_id uuid, position_name text, unit_entity_id uuid, unit_name text, start_at timestamptz, end_at timestamptz, confidence numeric, verification_status public.governance_verification_status)
language sql stable set search_path = public, pg_catalog
as $$
  select gl.id, gl.id, gl.person_governance_id, gl.person_name, gl.position_governance_id, gl.position_name, gl.governance_id, g.name, gl.started_at, gl.ended_at, g.confidence, g.verification_status
  from public.governance_leadership gl
  join public.governance g on g.id = gl.governance_id
  where gl.governance_id = p_entity_id
    and gl.started_at <= p_at
    and (gl.ended_at is null or gl.ended_at >= p_at)
  order by gl.is_primary desc, gl.started_at desc;
$$;

drop function if exists public.upsert_governance_leadership(uuid,uuid,text,uuid,text,timestamptz,timestamptz,boolean,text);
create function public.upsert_governance_leadership(p_id uuid default null, p_governance_id uuid default null, p_person_name text default null, p_person_governance_id uuid default null, p_position_name text default 'Head', p_position_governance_id uuid default null, p_started_at timestamptz default null, p_ended_at timestamptz default null, p_is_vacant boolean default false, p_is_primary boolean default false, p_reports_to_id uuid default null, p_notes text default null)
returns public.governance_leadership
language plpgsql security definer set search_path = public, pg_catalog
as $$
declare v_row public.governance_leadership;
begin
  perform public.require_governance_admin();
  if p_governance_id is null then raise exception 'Governance entity is required.'; end if;
  if not exists (select 1 from public.governance where id = p_governance_id) then raise exception 'Governance entity not found.'; end if;
  if p_position_governance_id is not null and not exists (select 1 from public.governance where id = p_position_governance_id and entity_type = 'position') then raise exception 'Position entity not found.'; end if;
  if p_person_governance_id is not null and not exists (select 1 from public.governance where id = p_person_governance_id and entity_type = 'person') then raise exception 'Person entity not found.'; end if;
  if p_reports_to_id is not null and p_reports_to_id = p_id then raise exception 'A role cannot report to itself.'; end if;
  if p_reports_to_id is not null and not exists (select 1 from public.governance_leadership where id = p_reports_to_id and governance_id = p_governance_id) then raise exception 'Reporting role not found in this organization.'; end if;
  if p_started_at is null then raise exception 'Start date is required.'; end if;
  if p_ended_at is not null and p_ended_at < p_started_at then raise exception 'End date cannot be earlier than start date.'; end if;
  if p_is_vacant then p_person_name := 'Vacant'; p_person_governance_id := null; elsif nullif(trim(coalesce(p_person_name, '')), '') is null and p_person_governance_id is null then raise exception 'Leader name is required unless the position is vacant.'; end if;
  if p_is_primary then update public.governance_leadership set is_primary = false where governance_id = p_governance_id and (p_id is null or id <> p_id) and is_primary = true and (ended_at is null or ended_at >= p_started_at); end if;
  if p_id is null then
    insert into public.governance_leadership (governance_id, person_name, person_governance_id, position_name, position_governance_id, started_at, ended_at, is_vacant, is_primary, reports_to_id, notes, created_by)
    values (p_governance_id, trim(coalesce(p_person_name, 'Vacant')), p_person_governance_id, coalesce(nullif(trim(p_position_name), ''), 'Head'), p_position_governance_id, p_started_at, p_ended_at, p_is_vacant, p_is_primary, p_reports_to_id, nullif(trim(p_notes), ''), auth.uid()) returning * into v_row;
  else
    update public.governance_leadership set governance_id=p_governance_id, person_name=trim(coalesce(p_person_name,'Vacant')), person_governance_id=p_person_governance_id, position_name=coalesce(nullif(trim(p_position_name),''),'Head'), position_governance_id=p_position_governance_id, started_at=p_started_at, ended_at=p_ended_at, is_vacant=p_is_vacant, is_primary=p_is_primary, reports_to_id=p_reports_to_id, notes=nullif(trim(p_notes),''), updated_at=now() where id=p_id returning * into v_row;
    if v_row.id is null then raise exception 'Leadership record not found.'; end if;
  end if;
  return v_row;
end;
$$;

drop function if exists public.get_governance_organization_tree(uuid,timestamptz);
create function public.get_governance_organization_tree(p_governance_id uuid, p_at timestamptz default now())
returns table(id uuid, governance_id uuid, parent_id uuid, position_name text, position_governance_id uuid, person_name text, person_governance_id uuid, is_vacant boolean, is_primary boolean, started_at timestamptz, ended_at timestamptz)
language sql stable set search_path = public, pg_catalog
as $$
  select gl.id, gl.governance_id, gl.reports_to_id, gl.position_name, gl.position_governance_id, gl.person_name, gl.person_governance_id, gl.is_vacant, gl.is_primary, gl.started_at, gl.ended_at
  from public.governance_leadership gl
  where gl.governance_id = p_governance_id and gl.started_at <= p_at and (gl.ended_at is null or gl.ended_at >= p_at)
  order by gl.is_primary desc, gl.position_name, gl.person_name;
$$;

grant execute on function public.get_governance_leader_at(uuid,timestamptz) to anon, authenticated;
grant execute on function public.get_governance_people_at(uuid,timestamptz) to anon, authenticated;
grant execute on function public.upsert_governance_leadership(uuid,uuid,text,uuid,text,uuid,timestamptz,timestamptz,boolean,boolean,uuid,text) to authenticated;
grant execute on function public.get_governance_organization_tree(uuid,timestamptz) to anon, authenticated;
