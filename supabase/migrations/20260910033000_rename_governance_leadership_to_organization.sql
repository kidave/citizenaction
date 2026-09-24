-- Organization is the canonical organizational structure/appointment table.
-- A row represents a role assignment inside a governance entity.
-- The reporting edge is stored once as reports_to_id; "manages" is derived as the inverse.

alter table public.governance_leadership rename to organization;

alter table public.organization rename constraint governance_leadership_pkey to organization_pkey;
alter table public.organization rename constraint governance_leadership_governance_id_fkey to organization_governance_id_fkey;
alter table public.organization rename constraint governance_leadership_person_governance_id_fkey to organization_person_governance_id_fkey;
alter table public.organization rename constraint governance_leadership_position_governance_id_fkey to organization_position_governance_id_fkey;
alter table public.organization rename constraint governance_leadership_reports_to_id_fkey to organization_reports_to_id_fkey;
alter table public.organization rename constraint governance_leadership_dates_chk to organization_dates_chk;
alter table public.organization rename constraint governance_leadership_person_chk to organization_person_chk;
alter table public.organization rename constraint governance_leadership_vacant_name_chk to organization_vacant_name_chk;

alter index if exists public.governance_leadership_primary_idx rename to organization_primary_idx;
alter index if exists public.governance_leadership_reports_to_idx rename to organization_reports_to_idx;
alter index if exists public.governance_leadership_position_idx rename to organization_position_idx;

drop function if exists public.get_governance_leader_at(uuid,timestamptz);
drop function if exists public.get_governance_people_at(uuid,timestamptz);
drop function if exists public.upsert_governance_leadership(uuid,uuid,text,uuid,text,uuid,timestamptz,timestamptz,boolean,boolean,uuid,text);
drop function if exists public.get_governance_organization_tree(uuid,timestamptz);
drop function if exists public.get_organization_tree(uuid,timestamptz);
drop function if exists public.upsert_organization(uuid,uuid,text,uuid,text,uuid,timestamptz,timestamptz,boolean,boolean,uuid,text);
drop function if exists public.delete_organization(uuid);

create function public.get_organization_tree(p_governance_id uuid, p_at timestamptz default now())
returns table(id uuid, governance_id uuid, parent_id uuid, position_name text, position_governance_id uuid, person_name text, person_governance_id uuid, is_vacant boolean, is_primary boolean, started_at timestamptz, ended_at timestamptz)
language sql stable set search_path = public, pg_catalog
as $$
  select o.id, o.governance_id, o.reports_to_id, o.position_name, o.position_governance_id,
         o.person_name, o.person_governance_id, o.is_vacant, o.is_primary, o.started_at, o.ended_at
  from public.organization o
  where o.governance_id = p_governance_id
    and o.started_at <= p_at
    and (o.ended_at is null or o.ended_at >= p_at)
  order by o.is_primary desc, o.position_name, o.person_name;
$$;
grant execute on function public.get_organization_tree(uuid,timestamptz) to anon, authenticated;

create function public.get_governance_leader_at(p_entity_id uuid, p_at timestamptz default now())
returns table(id uuid, person_name text, person_governance_id uuid, position_name text, position_governance_id uuid, started_at timestamptz, ended_at timestamptz, is_vacant boolean)
language sql stable set search_path = public, pg_catalog
as $$
  select o.id, o.person_name, o.person_governance_id, o.position_name, o.position_governance_id,
         o.started_at, o.ended_at, o.is_vacant
  from public.organization o
  where o.governance_id = p_entity_id
    and o.started_at <= p_at
    and (o.ended_at is null or o.ended_at >= p_at)
  order by o.is_primary desc, o.started_at desc
  limit 1;
$$;
grant execute on function public.get_governance_leader_at(uuid,timestamptz) to anon, authenticated;

create function public.get_governance_people_at(p_entity_id uuid, p_at timestamptz default now())
returns table(relationship_id uuid, appointment_id uuid, person_entity_id uuid, person_name text, position_entity_id uuid, position_name text, unit_entity_id uuid, unit_name text, start_at timestamptz, end_at timestamptz, confidence numeric, verification_status public.governance_verification_status)
language sql stable set search_path = public, pg_catalog
as $$
  select o.id, o.id, o.person_governance_id, o.person_name, o.position_governance_id, o.position_name,
         o.governance_id, g.name, o.started_at, o.ended_at, g.confidence, g.verification_status
  from public.organization o
  join public.governance g on g.id = o.governance_id
  where o.governance_id = p_entity_id
    and o.started_at <= p_at
    and (o.ended_at is null or o.ended_at >= p_at)
  order by o.is_primary desc, o.started_at desc;
$$;
grant execute on function public.get_governance_people_at(uuid,timestamptz) to anon, authenticated;

create function public.upsert_organization(p_id uuid default null, p_governance_id uuid default null, p_person_name text default null, p_person_governance_id uuid default null, p_position_name text default 'Head', p_position_governance_id uuid default null, p_started_at timestamptz default null, p_ended_at timestamptz default null, p_is_vacant boolean default false, p_is_primary boolean default false, p_reports_to_id uuid default null, p_notes text default null)
returns public.organization
language plpgsql security definer set search_path = public, pg_catalog
as $$
declare v_row public.organization;
begin
  perform public.require_governance_admin();
  if p_governance_id is null then raise exception 'Governance entity is required.'; end if;
  if not exists (select 1 from public.governance where id = p_governance_id) then raise exception 'Governance entity not found.'; end if;
  if p_position_governance_id is not null and not exists (select 1 from public.governance where id = p_position_governance_id and entity_type = 'position') then raise exception 'Position entity not found.'; end if;
  if p_person_governance_id is not null and not exists (select 1 from public.governance where id = p_person_governance_id and entity_type = 'person') then raise exception 'Person entity not found.'; end if;
  if p_reports_to_id is not null and p_reports_to_id = p_id then raise exception 'A role cannot report to itself.'; end if;
  if p_reports_to_id is not null and not exists (select 1 from public.organization where id = p_reports_to_id and governance_id = p_governance_id) then raise exception 'Reporting role not found in this organization.'; end if;
  if p_started_at is null then raise exception 'Start date is required.'; end if;
  if p_ended_at is not null and p_ended_at < p_started_at then raise exception 'End date cannot be earlier than start date.'; end if;
  if p_is_vacant then p_person_name := 'Vacant'; p_person_governance_id := null;
  elsif nullif(trim(coalesce(p_person_name, '')), '') is null and p_person_governance_id is null then raise exception 'Person is required unless the position is vacant.'; end if;
  if p_is_primary then update public.organization set is_primary = false where governance_id = p_governance_id and (p_id is null or id <> p_id) and is_primary = true and (ended_at is null or ended_at >= p_started_at); end if;
  if p_id is null then
    insert into public.organization (governance_id, person_name, person_governance_id, position_name, position_governance_id, started_at, ended_at, is_vacant, is_primary, reports_to_id, notes, created_by)
    values (p_governance_id, trim(coalesce(p_person_name, 'Vacant')), p_person_governance_id, coalesce(nullif(trim(p_position_name), ''), 'Head'), p_position_governance_id, p_started_at, p_ended_at, p_is_vacant, p_is_primary, p_reports_to_id, nullif(trim(p_notes), ''), auth.uid()) returning * into v_row;
  else
    update public.organization set governance_id=p_governance_id, person_name=trim(coalesce(p_person_name,'Vacant')), person_governance_id=p_person_governance_id, position_name=coalesce(nullif(trim(p_position_name),''),'Head'), position_governance_id=p_position_governance_id, started_at=p_started_at, ended_at=p_ended_at, is_vacant=p_is_vacant, is_primary=p_is_primary, reports_to_id=p_reports_to_id, notes=nullif(trim(p_notes),''), updated_at=now() where id=p_id returning * into v_row;
    if v_row.id is null then raise exception 'Organization role not found.'; end if;
  end if;
  return v_row;
end;
$$;
grant execute on function public.upsert_organization(uuid,uuid,text,uuid,text,uuid,timestamptz,timestamptz,boolean,boolean,uuid,text) to authenticated;

create function public.delete_organization(p_id uuid)
returns void language plpgsql security definer set search_path = public, pg_catalog
as $$
begin
  perform public.require_governance_admin();
  if not exists (select 1 from public.organization where id = p_id) then raise exception 'Organization role not found.'; end if;
  delete from public.organization where id = p_id;
end;
$$;
grant execute on function public.delete_organization(uuid) to authenticated;

create function public.get_governance_organization_tree(p_governance_id uuid, p_at timestamptz default now())
returns table(id uuid, governance_id uuid, parent_id uuid, position_name text, position_governance_id uuid, person_name text, person_governance_id uuid, is_vacant boolean, is_primary boolean, started_at timestamptz, ended_at timestamptz)
language sql stable set search_path = public, pg_catalog
as $$ select * from public.get_organization_tree(p_governance_id, p_at); $$;
grant execute on function public.get_governance_organization_tree(uuid,timestamptz) to anon, authenticated;
