-- Organization assignments reference independent role and person entities.
-- The assignment remains time-bound; reporting is role-to-role and managers are derived.

drop function if exists public.get_organization_tree(uuid,timestamptz);

create function public.get_organization_tree(p_governance_id uuid, p_at timestamptz default now())
returns table(
  id uuid,
  governance_id uuid,
  parent_id uuid,
  position_name text,
  position_governance_id uuid,
  position_avatar_url text,
  person_name text,
  person_governance_id uuid,
  person_profile_user_id uuid,
  person_avatar_url text,
  is_vacant boolean,
  is_primary boolean,
  started_at timestamptz,
  ended_at timestamptz
)
language sql stable set search_path = public, pg_catalog
as $$
  select
    o.id,
    o.governance_id,
    o.reports_to_id,
    o.position_name,
    o.position_governance_id,
    position_entity.image_url,
    o.person_name,
    o.person_governance_id,
    person_entity.profile_user_id,
    coalesce(person_entity.image_url, profile.avatar_url),
    o.is_vacant,
    o.is_primary,
    o.started_at,
    o.ended_at
  from public.organization o
  left join public.governance position_entity on position_entity.id = o.position_governance_id
  left join public.governance person_entity on person_entity.id = o.person_governance_id
  left join public.profile profile on profile.user_id = person_entity.profile_user_id
  where o.governance_id = p_governance_id
    and o.started_at <= p_at
    and (o.ended_at is null or o.ended_at >= p_at)
  order by o.is_primary desc, o.position_name, o.person_name;
$$;

grant execute on function public.get_organization_tree(uuid,timestamptz) to anon, authenticated;

drop function if exists public.get_governance_organization_tree(uuid,timestamptz);
create function public.get_governance_organization_tree(p_governance_id uuid, p_at timestamptz default now())
returns table(
  id uuid,
  governance_id uuid,
  parent_id uuid,
  position_name text,
  position_governance_id uuid,
  position_avatar_url text,
  person_name text,
  person_governance_id uuid,
  person_profile_user_id uuid,
  person_avatar_url text,
  is_vacant boolean,
  is_primary boolean,
  started_at timestamptz,
  ended_at timestamptz
)
language sql stable set search_path = public, pg_catalog
as $$
  select * from public.get_organization_tree(p_governance_id, p_at);
$$;

grant execute on function public.get_governance_organization_tree(uuid,timestamptz) to anon, authenticated;
