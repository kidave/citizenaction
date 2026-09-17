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
) returns public.position_appointment
language plpgsql
security definer
set search_path = public
as $$
declare
  v_person public.person;
  v_row public.position_appointment;
begin
  perform public.require_governance_admin();

  if nullif(btrim(p_name), '') is null then
    raise exception 'Person name is required';
  end if;

  if p_organization_id is null or not exists (
    select 1 from public.governance where id = p_organization_id
  ) then
    raise exception 'Organization not found.';
  end if;

  if p_position_id is null or not exists (
    select 1
    from public.position
    where id = p_position_id
      and appointing_organization_id = p_organization_id
  ) then
    raise exception 'Position not found in this organization.';
  end if;

  if p_started_at is null then
    raise exception 'Start date is required.';
  end if;

  if p_ended_at is not null and p_ended_at < p_started_at then
    raise exception 'End date cannot be earlier than start date.';
  end if;

  v_person := public.create_person(
    p_name,
    p_biography,
    p_website,
    p_image_url,
    p_profile_user_id,
    '{}'::jsonb
  );

  insert into public.position_appointment(
    organization_id,
    position_id,
    person_id,
    started_at,
    ended_at,
    is_vacant,
    is_primary,
    reports_to_appointment_id,
    notes,
    created_by,
    updated_by
  )
  values(
    p_organization_id,
    p_position_id,
    v_person.id,
    p_started_at,
    p_ended_at,
    false,
    p_is_primary,
    null,
    nullif(btrim(p_notes), ''),
    auth.uid(),
    auth.uid()
  )
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.create_person_appointment(uuid,uuid,timestamptz,text,text,text,text,uuid,timestamptz,boolean,text) to authenticated;
revoke execute on function public.create_person_appointment(uuid,uuid,timestamptz,text,text,text,text,uuid,timestamptz,boolean,text) from anon, public;

notify pgrst, 'reload schema';
