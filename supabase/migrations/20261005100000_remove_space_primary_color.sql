drop view if exists public.space_public_view;
drop view if exists public.space_view;

alter table public.space
  drop column if exists primary_color;

create view public.space_view as
select
  c.id,
  c.name,
  c.slug,
  c.description,
  c.email,
  c.website,
  c.contact_number,
  c.created_at,
  c.logo_url,
  c.cover_url,
  c.is_active,
  p.user_id as owner_id,
  p.name as owner_name,
  p.avatar_url
from public.space c
left join public.profile p on p.user_id = c.owner_user_id;

create view public.space_public_view as
select
  s.id,
  s.name,
  s.slug,
  s.description,
  s.owner_user_id,
  s.created_at,
  s.email,
  s.website,
  s.contact_number,
  s.logo_url,
  s.cover_url,
  s.is_active,
  s.category_id,
  c.name as category_name,
  c.slug as category_slug,
  sm.role as current_user_role
from public.space s
left join public.category c on c.id = s.category_id
left join public.space_member sm
  on sm.space_id = s.id
  and sm.user_id = auth.uid()
  and sm.is_active = true
  and sm.is_suspended = false
where s.is_active = true;

grant all on public.space_view to anon, authenticated, service_role;
grant all on public.space_public_view to anon, authenticated, service_role;
