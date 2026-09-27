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
    select
      g.id,
      g.name,
      g.slug,
      g.type::text as type,
      g.short_name,
      g.description,
      g.image_url,
      g.website,
      g.parent_entity_id,
      g.geography_id,
      0 as depth
    from public.governance g
    where g.id = p_governance_id

    union all

    select
      g.id,
      g.name,
      g.slug,
      g.type::text as type,
      g.short_name,
      g.description,
      g.image_url,
      g.website,
      g.parent_entity_id,
      g.geography_id,
      o.depth + 1
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
      pa.reports_to_appointment_id,
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
          'reports_to_appointment_id', a.reports_to_appointment_id,
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
      left join current_appointments rt on rt.appointment_id = a.reports_to_appointment_id
      left join orgs rorg on rorg.id = rt.organization_id
    ), '[]'::jsonb)
  );
$$;

grant execute on function public.get_governance_organization_context(uuid, timestamptz) to anon, authenticated;
revoke execute on function public.get_governance_organization_context(uuid, timestamptz) from public;
notify pgrst, 'reload schema';
