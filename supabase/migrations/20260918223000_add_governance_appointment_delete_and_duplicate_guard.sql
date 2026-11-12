create or replace function public.delete_position_appointment(p_appointment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_exists boolean;
begin
  perform public.require_governance_admin();

  select exists(select 1 from public.position_appointment where id = p_appointment_id)
    into v_exists;

  if not v_exists then
    raise exception 'Appointment not found.';
  end if;

  delete from public.position_appointment where id = p_appointment_id;
end;
$$;

grant execute on function public.delete_position_appointment(uuid) to authenticated;
revoke execute on function public.delete_position_appointment(uuid) from anon, public;

create unique index if not exists position_appointment_person_position_start_date_uidx
on public.position_appointment (
  person_id,
  position_id,
  ((started_at at time zone 'UTC')::date)
)
where person_id is not null;

create or replace function public.create_person_appointment(
  p_organization_id uuid,
  p_position_id uuid,
  p_started_at timestamptz,
  p_name text,
  p_biography text default null,
  p_website text default null,
  p_image_url text default null,
  p_profile_user_id uuid default null,
  p_ended_at timestamptz default null,
  p_is_primary boolean default true,
  p_notes text default null
)
returns public.position_appointment
language plpgsql
security definer
set search_path = public
as $$
declare
  v_person public.person;
  v_row public.position_appointment;
begin
  perform public.require_governance_admin();

  if nullif(btrim(p_name), '') is null then raise exception 'Person name is required'; end if;
  if p_organization_id is null or not exists (select 1 from public.governance where id = p_organization_id) then raise exception 'Organization not found.'; end if;
  if p_position_id is null or not exists (select 1 from public.position where id = p_position_id and appointing_organization_id = p_organization_id) then raise exception 'Position not found in this organization.'; end if;
  if p_started_at is null then raise exception 'Start date is required.'; end if;
  if p_ended_at is not null and p_ended_at < p_started_at then raise exception 'End date cannot be earlier than start date.'; end if;

  v_person := public.create_person(p_name, p_biography, p_website, p_image_url, p_profile_user_id, '{}'::jsonb);

  begin
    insert into public.position_appointment(
      organization_id, position_id, person_id, started_at, ended_at, is_vacant, is_primary,
      reports_to_appointment_id, notes, created_by, updated_by
    )
    values(
      p_organization_id, p_position_id, v_person.id, p_started_at, p_ended_at, false, p_is_primary,
      null, nullif(btrim(p_notes), ''), auth.uid(), auth.uid()
    )
    returning * into v_row;
  exception when unique_violation then
    raise exception 'This person is already assigned to this position on the selected start date.';
  end;

  return v_row;
end;
$$;

grant execute on function public.create_person_appointment(uuid,uuid,timestamptz,text,text,text,text,uuid,timestamptz,boolean,text) to authenticated;
revoke execute on function public.create_person_appointment(uuid,uuid,timestamptz,text,text,text,text,uuid,timestamptz,boolean,text) from anon, public;

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
returns public.position_appointment
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.position_appointment;
begin
  perform public.require_governance_admin();
  if p_governance_id is null or not exists(select 1 from public.governance where id=p_governance_id) then raise exception 'Organization not found.'; end if;
  if p_position_governance_id is null or not exists(select 1 from public.position where id=p_position_governance_id) then raise exception 'Position not found.'; end if;
  if not p_is_vacant and p_person_governance_id is null then raise exception 'Person is required unless the position is vacant.'; end if;
  if p_person_governance_id is not null and not exists(select 1 from public.person where id=p_person_governance_id) then raise exception 'Person not found.'; end if;
  if p_started_at is null then raise exception 'Start date is required.'; end if;
  if p_ended_at is not null and p_ended_at<p_started_at then raise exception 'End date cannot be earlier than start date.'; end if;
  if p_reports_to_id is not null and p_reports_to_id=p_id then raise exception 'A role cannot report to itself.'; end if;
  if p_reports_to_id is not null and not exists(select 1 from public.position_appointment where id=p_reports_to_id and organization_id=p_governance_id) then raise exception 'Reporting role not found in this organization.'; end if;

  if p_person_governance_id is not null and exists (
    select 1 from public.position_appointment pa
    where pa.position_id = p_position_governance_id
      and pa.person_id = p_person_governance_id
      and (pa.started_at at time zone 'UTC')::date = (p_started_at at time zone 'UTC')::date
      and (p_id is null or pa.id <> p_id)
  ) then
    raise exception 'This person is already assigned to this position on the selected start date.';
  end if;

  begin
    if p_id is null then
      insert into public.position_appointment(organization_id,position_id,person_id,started_at,ended_at,is_vacant,is_primary,reports_to_appointment_id,notes,created_by,updated_by)
      values(p_governance_id,p_position_governance_id,case when p_is_vacant then null else p_person_governance_id end,p_started_at,p_ended_at,p_is_vacant,p_is_primary,p_reports_to_id,nullif(btrim(p_notes),''),auth.uid(),auth.uid())
      returning * into v_row;
    else
      update public.position_appointment
      set organization_id=p_governance_id,position_id=p_position_governance_id,person_id=case when p_is_vacant then null else p_person_governance_id end,
          started_at=p_started_at,ended_at=p_ended_at,is_vacant=p_is_vacant,is_primary=p_is_primary,reports_to_appointment_id=p_reports_to_id,
          notes=nullif(btrim(p_notes),''),updated_at=now(),updated_by=auth.uid()
      where id=p_id returning * into v_row;
      if v_row.id is null then raise exception 'Appointment not found.'; end if;
    end if;
  exception when unique_violation then
    raise exception 'This person is already assigned to this position on the selected start date.';
  end;
  return v_row;
end;
$$;

grant execute on function public.upsert_organization(uuid,uuid,text,uuid,text,uuid,timestamptz,timestamptz,boolean,boolean,uuid,text) to authenticated;
revoke execute on function public.upsert_organization(uuid,uuid,text,uuid,text,uuid,timestamptz,timestamptz,boolean,boolean,uuid,text) from anon, public;

notify pgrst, 'reload schema';
