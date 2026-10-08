-- Reporting belongs to the position, not the person occupying it.
-- An appointment can change when a person is replaced; the institutional reporting
-- relationship should remain attached to the position.

alter table public.position_appointment
  add column if not exists reports_to_position_id uuid;

update public.position_appointment pa
set reports_to_position_id = parent.position_id
from public.position_appointment parent
where pa.reports_to_appointment_id = parent.id
  and pa.reports_to_position_id is null;

alter table public.position_appointment
  drop constraint if exists position_appointment_reports_to_appointment_id_fkey;

alter table public.position_appointment
  add constraint position_appointment_reports_to_position_id_fkey
  foreign key (reports_to_position_id)
  references public.position(id)
  on delete set null;

alter table public.position_appointment
  drop column if exists reports_to_appointment_id;

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

  if p_governance_id is null or not exists (
    select 1 from public.governance where id = p_governance_id
  ) then
    raise exception 'Organization not found.';
  end if;

  if p_position_governance_id is null or not exists (
    select 1
    from public.position
    where id = p_position_governance_id
      and appointing_organization_id = p_governance_id
  ) then
    raise exception 'Position not found in this organization.';
  end if;

  if not p_is_vacant and p_person_governance_id is null then
    raise exception 'Person is required unless the position is vacant.';
  end if;

  if p_person_governance_id is not null
     and not exists (select 1 from public.person where id = p_person_governance_id) then
    raise exception 'Person not found.';
  end if;

  if p_started_at is null then
    raise exception 'Start date is required.';
  end if;

  if p_ended_at is not null and p_ended_at < p_started_at then
    raise exception 'End date cannot be earlier than start date.';
  end if;

  if p_reports_to_id is not null then
    if p_reports_to_id = p_position_governance_id then
      raise exception 'A position cannot report to itself.';
    end if;

    if not exists (
      select 1
      from public.position
      where id = p_reports_to_id
        and appointing_organization_id = p_governance_id
    ) then
      raise exception 'Reporting position not found in this organization.';
    end if;
  end if;

  if p_person_governance_id is not null and exists (
    select 1
    from public.position_appointment pa
    where pa.position_id = p_position_governance_id
      and pa.person_id = p_person_governance_id
      and (pa.started_at at time zone 'UTC')::date = (p_started_at at time zone 'UTC')::date
      and (p_id is null or pa.id <> p_id)
  ) then
    raise exception 'This person is already assigned to this position on the selected start date.';
  end if;

  begin
    if p_id is null then
      insert into public.position_appointment(
        organization_id,
        position_id,
        person_id,
        started_at,
        ended_at,
        is_vacant,
        is_primary,
        reports_to_position_id,
        notes,
        created_by,
        updated_by
      )
      values(
        p_governance_id,
        p_position_governance_id,
        case when p_is_vacant then null else p_person_governance_id end,
        p_started_at,
        p_ended_at,
        p_is_vacant,
        p_is_primary,
        p_reports_to_id,
        nullif(btrim(p_notes), ''),
        auth.uid(),
        auth.uid()
      )
      returning * into v_row;
    else
      update public.position_appointment
      set organization_id = p_governance_id,
          position_id = p_position_governance_id,
          person_id = case when p_is_vacant then null else p_person_governance_id end,
          started_at = p_started_at,
          ended_at = p_ended_at,
          is_vacant = p_is_vacant,
          is_primary = p_is_primary,
          reports_to_position_id = p_reports_to_id,
          notes = nullif(btrim(p_notes), ''),
          updated_at = now(),
          updated_by = auth.uid()
      where id = p_id
      returning * into v_row;

      if v_row.id is null then
        raise exception 'Appointment not found.';
      end if;
    end if;
  exception when unique_violation then
    raise exception 'This person is already assigned to this position on the selected start date.';
  end;

  return v_row;
end;
$$;

grant execute on function public.upsert_organization(uuid,uuid,text,uuid,text,uuid,timestamptz,timestamptz,boolean,boolean,uuid,text) to authenticated;
revoke execute on function public.upsert_organization(uuid,uuid,text,uuid,text,uuid,timestamptz,timestamptz,boolean,boolean,uuid,text) from anon, public;

create or replace function public.get_governance_organization_context(
  p_governance_id uuid,
  p_at timestamptz default now()
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with recursive orgs as (
    select g.id, g.name, g.slug, g.type::text as type, g.short_name, g.description,
           g.image_url, g.website, g.parent_entity_id, g.geography_id, 0 as depth
    from public.governance g
    where g.id = p_governance_id

    union all

    select g.id, g.name, g.slug, g.type::text as type, g.short_name, g.description,
           g.image_url, g.website, g.parent_entity_id, g.geography_id, o.depth + 1
    from public.governance g
    join orgs o on g.parent_entity_id = o.id
  ),
  current_appointments as (
    select
      pa.id as appointment_id,
      pa.organization_id,
      pa.position_id,
      pos.name as position_name,
      pos.slug as position_slug,
      pos.image_url as position_avatar_url,
      pa.person_id,
      per.name as person_name,
      per.slug as person_slug,
      per.image_url as person_avatar_url,
      pa.reports_to_position_id,
      pa.is_vacant,
      pa.is_primary,
      pa.started_at,
      pa.ended_at
    from public.position_appointment pa
    join orgs o on o.id = pa.organization_id
    left join public.position pos on pos.id = pa.position_id
    left join public.person per on per.id = pa.person_id
    where pa.started_at <= p_at
      and (pa.ended_at is null or pa.ended_at >= p_at)
  )
  select jsonb_build_object(
    'organizations', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', o.id,
          'name', o.name,
          'slug', o.slug,
          'type', o.type,
          'short_name', o.short_name,
          'description', o.description,
          'image_url', o.image_url,
          'website', o.website,
          'parent_entity_id', o.parent_entity_id,
          'geography_id', o.geography_id,
          'depth', o.depth,
          'position_count', (select count(*) from current_appointments a where a.organization_id = o.id),
          'filled_position_count', (select count(*) from current_appointments a where a.organization_id = o.id and not a.is_vacant and a.person_id is not null)
        ) order by o.depth, o.name
      ) from orgs o
    ), '[]'::jsonb),
    'appointments', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'appointment_id', a.appointment_id,
          'organization_id', a.organization_id,
          'position_id', a.position_id,
          'position_name', a.position_name,
          'position_slug', a.position_slug,
          'position_avatar_url', a.position_avatar_url,
          'person_id', a.person_id,
          'person_name', a.person_name,
          'person_slug', a.person_slug,
          'person_avatar_url', a.person_avatar_url,
          'reports_to_position_id', a.reports_to_position_id,
          'is_vacant', a.is_vacant,
          'is_primary', a.is_primary,
          'started_at', a.started_at,
          'ended_at', a.ended_at,
          'organization_name', org.name,
          'organization_slug', org.slug,
          'organization_depth', org.depth,
          'reports_to', case when rt.appointment_id is null then null else jsonb_build_object(
            'appointment_id', rt.appointment_id,
            'position_id', rt.position_id,
            'position_name', rt.position_name,
            'person_id', rt.person_id,
            'person_name', rt.person_name,
            'organization_id', rt.organization_id,
            'organization_name', rorg.name,
            'organization_slug', rorg.slug
          ) end
        ) order by org.depth, a.position_name, a.person_name
      )
      from current_appointments a
      join orgs org on org.id = a.organization_id
      left join lateral (
        select rt.*
        from current_appointments rt
        where rt.position_id = a.reports_to_position_id
        order by rt.is_primary desc, rt.started_at desc, rt.appointment_id desc
        limit 1
      ) rt on true
      left join orgs rorg on rorg.id = rt.organization_id
    ), '[]'::jsonb)
  );
$$;

grant execute on function public.get_governance_organization_context(uuid, timestamptz) to anon, authenticated;
revoke execute on function public.get_governance_organization_context(uuid, timestamptz) from public;

notify pgrst, 'reload schema';
