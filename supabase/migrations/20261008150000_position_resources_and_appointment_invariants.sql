-- Position jurisdiction, office address, position links, person address,
-- and appointment invariants.
alter table public.position
  add column if not exists geography_id uuid,
  add column if not exists address text;

alter table public.position
  drop constraint if exists position_geography_id_fkey;

alter table public.position
  add constraint position_geography_id_fkey
  foreign key (geography_id) references public.geographies(id) on delete set null;

alter table public.person
  add column if not exists address text;

alter table public.link
  add column if not exists position_id uuid;

alter table public.link
  drop constraint if exists link_position_id_fkey;

alter table public.link
  add constraint link_position_id_fkey
  foreign key (position_id) references public.position(id) on delete cascade;

create index if not exists link_position_id_idx on public.link(position_id);
create index if not exists position_geography_id_idx on public.position(geography_id);

-- Resource edits are administrative governance edits.
drop policy if exists position_admin_update on public.position;
create policy position_admin_update on public.position
for update
using (
  exists (select 1 from public.profile p where p.user_id = auth.uid() and p.role = 'admin')
)
with check (
  exists (select 1 from public.profile p where p.user_id = auth.uid() and p.role = 'admin')
);

drop policy if exists person_admin_update on public.person;
create policy person_admin_update on public.person
for update
using (
  exists (select 1 from public.profile p where p.user_id = auth.uid() and p.role = 'admin')
)
with check (
  exists (select 1 from public.profile p where p.user_id = auth.uid() and p.role = 'admin')
);

drop policy if exists position_admin_links_insert on public.link;
create policy position_admin_links_insert on public.link
for insert
with check (
  position_id is not null
  and exists (select 1 from public.profile p where p.user_id = auth.uid() and p.role = 'admin')
);

drop policy if exists position_admin_links_update on public.link;
create policy position_admin_links_update on public.link
for update
using (
  position_id is not null
  and exists (select 1 from public.profile p where p.user_id = auth.uid() and p.role = 'admin')
)
with check (
  position_id is not null
  and exists (select 1 from public.profile p where p.user_id = auth.uid() and p.role = 'admin')
);

drop policy if exists position_admin_links_delete on public.link;
create policy position_admin_links_delete on public.link
for delete
using (
  position_id is not null
  and exists (select 1 from public.profile p where p.user_id = auth.uid() and p.role = 'admin')
);

-- Only one principal appointment may overlap another principal appointment
-- for the same position.
create or replace function public.validate_position_principal_appointment()
returns trigger
language plpgsql
as $$
begin
  if new.is_primary then
    if exists (
      select 1
      from public.position_appointment pa
      where pa.position_id = new.position_id
        and pa.is_primary
        and pa.id <> new.id
        and pa.started_at <= coalesce(new.ended_at, 'infinity'::timestamptz)
        and coalesce(pa.ended_at, 'infinity'::timestamptz) >= new.started_at
    ) then
      raise exception 'A position can have only one principal appointment for an overlapping period.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists position_principal_appointment_trigger on public.position_appointment;
create trigger position_principal_appointment_trigger
before insert or update of position_id, started_at, ended_at, is_primary
on public.position_appointment
for each row
execute function public.validate_position_principal_appointment();

-- Appointment editing is intentionally limited to the appointment dates and
-- principal status. The person and position cannot be replaced in-place.
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
) returns public.position_appointment
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.position_appointment;
  v_existing public.position_appointment;
begin
  perform public.require_governance_admin();

  if p_started_at is null then raise exception 'Start date is required.'; end if;
  if p_ended_at is not null and p_ended_at < p_started_at then
    raise exception 'End date cannot be earlier than start date.';
  end if;

  if p_id is not null then
    select * into v_existing
    from public.position_appointment
    where id = p_id
    for update;

    if not found then raise exception 'Appointment not found.'; end if;

    if p_governance_id is distinct from v_existing.organization_id
       or p_position_governance_id is distinct from v_existing.position_id
       or p_person_governance_id is distinct from v_existing.person_id then
      raise exception 'When editing an appointment, the person, position and organization cannot be changed.';
    end if;

    update public.position_appointment
    set started_at = p_started_at,
        ended_at = p_ended_at,
        is_primary = p_is_primary,
        notes = nullif(btrim(p_notes), ''),
        updated_at = now(),
        updated_by = auth.uid()
    where id = p_id
    returning * into v_row;

    return v_row;
  end if;

  if p_governance_id is null or not exists (
    select 1 from public.governance where id = p_governance_id
  ) then raise exception 'Organization not found.'; end if;

  if p_position_governance_id is null or not exists (
    select 1 from public.position
    where id = p_position_governance_id
      and appointing_organization_id = p_governance_id
  ) then raise exception 'Position not found in this organization.'; end if;

  if p_is_vacant or p_person_governance_id is null then
    raise exception 'An existing person is required for a new appointment.';
  end if;

  if not exists (select 1 from public.person where id = p_person_governance_id) then
    raise exception 'Person not found.';
  end if;

  if exists (
    select 1
    from public.position_appointment pa
    where pa.position_id = p_position_governance_id
      and pa.person_id = p_person_governance_id
      and (pa.started_at at time zone 'UTC')::date = (p_started_at at time zone 'UTC')::date
  ) then
    raise exception 'This person is already assigned to this position on the selected start date.';
  end if;

  insert into public.position_appointment(
    organization_id, position_id, person_id, started_at, ended_at,
    is_vacant, is_primary, notes, created_by, updated_by
  )
  values(
    p_governance_id, p_position_governance_id, p_person_governance_id,
    p_started_at, p_ended_at, false, p_is_primary,
    nullif(btrim(p_notes), ''), auth.uid(), auth.uid()
  )
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.upsert_organization(uuid,uuid,text,uuid,text,uuid,timestamptz,timestamptz,boolean,boolean,uuid,text) to authenticated;
revoke execute on function public.upsert_organization(uuid,uuid,text,uuid,text,uuid,timestamptz,timestamptz,boolean,boolean,uuid,text) from anon, public;

-- Keep the legacy atomic creator safe even though the UI no longer uses it
-- for position appointments.
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

  if nullif(btrim(p_name), '') is null then raise exception 'Person name is required'; end if;
  if p_organization_id is null or not exists (select 1 from public.governance where id = p_organization_id) then raise exception 'Organization not found.'; end if;
  if p_position_id is null or not exists (
    select 1 from public.position where id = p_position_id and appointing_organization_id = p_organization_id
  ) then raise exception 'Position not found in this organization.'; end if;
  if p_started_at is null then raise exception 'Start date is required.'; end if;
  if p_ended_at is not null and p_ended_at < p_started_at then raise exception 'End date cannot be earlier than start date.'; end if;

  if exists (
    select 1 from public.position_appointment pa
    join public.person p on p.id = pa.person_id
    where pa.position_id = p_position_id
      and pa.person_id is not null
      and (pa.started_at at time zone 'UTC')::date = (p_started_at at time zone 'UTC')::date
      and lower(btrim(p.name)) = lower(btrim(p_name))
  ) then
    raise exception 'This person is already assigned to this position on the selected start date.';
  end if;

  v_person := public.create_person(p_name, p_biography, p_website, p_image_url, p_profile_user_id, '{}'::jsonb);

  insert into public.position_appointment(
    organization_id, position_id, person_id, started_at, ended_at,
    is_vacant, is_primary, notes, created_by, updated_by
  )
  values(
    p_organization_id, p_position_id, v_person.id, p_started_at, p_ended_at,
    false, p_is_primary, nullif(btrim(p_notes), ''), auth.uid(), auth.uid()
  )
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.create_person_appointment(uuid,uuid,timestamptz,text,text,text,text,uuid,timestamptz,boolean,text) to authenticated;
revoke execute on function public.create_person_appointment(uuid,uuid,timestamptz,text,text,text,text,uuid,timestamptz,boolean,text) from anon, public;

notify pgrst, 'reload schema';
