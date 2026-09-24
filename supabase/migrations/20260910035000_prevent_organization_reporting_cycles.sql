create or replace function public.upsert_organization(
  p_id uuid default null,
  p_governance_id uuid default null,
  p_person_name text default null,
  p_person_governance_id uuid default null,
  p_position_name text default 'Head',
  p_position_governance_id uuid default null,
  p_started_at timestamptz default null,
  p_ended_at timestamptz default null,
  p_is_vacant boolean default false,
  p_is_primary boolean default false,
  p_reports_to_id uuid default null,
  p_notes text default null
)
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
  if p_id is not null and p_reports_to_id is not null and exists (
    with recursive chain(id) as (
      select p_reports_to_id
      union all
      select o.reports_to_id
      from public.organization o
      join chain c on o.id = c.id
      where o.reports_to_id is not null
    )
    select 1 from chain where id = p_id
  ) then
    raise exception 'This reporting relationship would create an organization cycle.';
  end if;
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
