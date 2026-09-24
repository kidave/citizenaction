-- Finish governance architecture cleanup.
-- Geographic scope/location is no longer part of governance. Jurisdiction remains on governance.
-- Person entities can optionally link to an app profile for reusable name/avatar data.

alter table public.governance
  add column if not exists profile_user_id uuid;

alter table public.governance
  drop constraint if exists governance_profile_user_id_fkey;

alter table public.governance
  add constraint governance_profile_user_id_fkey
  foreign key (profile_user_id) references public.profile(user_id) on delete set null;

create unique index if not exists governance_profile_user_id_uidx
  on public.governance(profile_user_id)
  where profile_user_id is not null;

drop function if exists public.get_governance_directory_v2(text,uuid,text,integer,boolean);
drop function if exists public.get_governance_directory(text,uuid,text,integer);

create function public.get_governance_directory(
  p_search text default null,
  p_parent_id uuid default null,
  p_entity_type text default null,
  p_limit integer default 100,
  p_include_all boolean default false
)
returns table(
  id uuid, name text, short_name text, slug text, image_url text,
  entity_type text, description text, status text,
  valid_from timestamptz, valid_to timestamptz,
  verification_status text, confidence numeric,
  parent_id uuid, parent_name text, parent_slug text,
  unit_type text, code text, geom geometry,
  category_id uuid, category_name text, profile_user_id uuid
)
language sql stable set search_path = public, pg_catalog
as $$
  select g.id, g.name, g.short_name, g.slug, g.image_url,
         g.entity_type::text, g.description, g.status,
         g.valid_from, g.valid_to, g.verification_status::text, g.confidence,
         g.parent_entity_id, p.name, p.slug,
         g.unit_type::text, g.code, g.geom,
         g.category_id, c.name, g.profile_user_id
  from public.governance g
  left join public.governance p on p.id = g.parent_entity_id
  left join public.category c on c.id = g.category_id
  where (p_include_all or (p_parent_id is null and g.parent_entity_id is null) or g.parent_entity_id = p_parent_id)
    and (p_search is null or btrim(p_search) = ''
      or g.name ilike '%' || p_search || '%'
      or coalesce(g.short_name, '') ilike '%' || p_search || '%'
      or coalesce(c.name, '') ilike '%' || p_search || '%')
    and (p_entity_type is null or p_entity_type = '' or g.entity_type::text = p_entity_type)
    and coalesce(g.status, 'active') <> 'deleted'
  order by g.name
  limit greatest(1, least(coalesce(p_limit, 100), 500));
$$;

grant execute on function public.get_governance_directory(text,uuid,text,integer,boolean) to anon, authenticated;
drop function if exists public.get_governance_by_slug_v2(text);

create or replace function public.update_governance_entity(
  p_entity_id uuid, p_name text, p_short_name text default null,
  p_description text default null, p_website text default null,
  p_entity_type public.governance_entity_type default null,
  p_status text default 'active', p_valid_from timestamptz default null,
  p_valid_to timestamptz default null, p_image_url text default null,
  p_category_id uuid default null
) returns jsonb
language plpgsql security definer set search_path = public, pg_catalog
as $$
declare v_row public.governance;
begin
  perform public.require_governance_admin();
  if p_entity_id is null or not exists (select 1 from public.governance where id = p_entity_id) then raise exception 'Governance entity not found'; end if;
  if p_status not in ('active','inactive','deprecated') then raise exception 'Invalid governance status'; end if;
  if p_valid_from is null then raise exception 'Valid from is required'; end if;
  if p_valid_to is not null and p_valid_to < p_valid_from then raise exception 'Valid to cannot be earlier than valid from'; end if;
  if p_status in ('inactive','deprecated') and p_valid_to is null then raise exception 'Valid to is required for inactive or deprecated entities'; end if;
  update public.governance
     set name = nullif(btrim(p_name), ''), short_name = nullif(btrim(p_short_name), ''),
         description = nullif(btrim(p_description), ''), website = nullif(btrim(p_website), ''),
         entity_type = coalesce(p_entity_type, entity_type), status = p_status,
         valid_from = p_valid_from, valid_to = p_valid_to,
         image_url = nullif(btrim(p_image_url), ''), category_id = p_category_id,
         updated_by = auth.uid(), updated_at = now()
   where id = p_entity_id returning * into v_row;
  if v_row.name is null then raise exception 'Name is required'; end if;
  return to_jsonb(v_row);
end;
$$;

grant execute on function public.update_governance_entity(uuid,text,text,text,text,public.governance_entity_type,text,timestamptz,timestamptz,text,uuid) to authenticated;

create or replace function public.create_governance_entity(
  p_name text, p_entity_type public.governance_entity_type,
  p_short_name text default null, p_status text default 'active',
  p_valid_from timestamptz default now(), p_valid_to timestamptz default null,
  p_category_id uuid default null, p_image_url text default null
) returns public.governance
language plpgsql security definer set search_path = public, pg_catalog
as $$
declare v_row public.governance;
begin
  perform public.require_governance_admin();
  if nullif(btrim(p_name), '') is null then raise exception 'Name is required.'; end if;
  if p_status not in ('active','inactive','deprecated') then raise exception 'Invalid governance status.'; end if;
  if p_valid_from is null then raise exception 'Valid from is required.'; end if;
  if p_status in ('inactive','deprecated') and p_valid_to is null then raise exception 'Valid to is required for inactive or deprecated entities.'; end if;
  if p_valid_to is not null and p_valid_to < p_valid_from then raise exception 'Valid to cannot be earlier than valid from.'; end if;
  insert into public.governance(name,short_name,entity_type,status,valid_from,valid_to,category_id,image_url,created_by,updated_by)
  values(btrim(p_name),nullif(btrim(p_short_name),''),p_entity_type,p_status,p_valid_from,p_valid_to,p_category_id,nullif(btrim(p_image_url),''),auth.uid(),auth.uid())
  returning * into v_row;
  return v_row;
end;
$$;

grant execute on function public.create_governance_entity(text,public.governance_entity_type,text,text,timestamptz,timestamptz,uuid,text) to authenticated;

create or replace function public.set_governance_parent(p_child_id uuid, p_parent_id uuid default null)
returns void language plpgsql security definer set search_path = public, pg_catalog
as $$
begin
  perform public.require_governance_admin();
  if not exists (select 1 from public.governance where id = p_child_id) then raise exception 'Child governance entity not found'; end if;
  if p_parent_id is not null and not exists (select 1 from public.governance where id = p_parent_id) then raise exception 'Parent governance entity not found'; end if;
  if p_parent_id is not null and (p_parent_id = p_child_id or exists (
    with recursive ancestors(id) as (
      select p_parent_id union all
      select g.parent_entity_id from public.governance g join ancestors a on g.id = a.id where g.parent_entity_id is not null
    ) select 1 from ancestors where id = p_child_id
  )) then raise exception 'This parent would create a governance cycle'; end if;
  update public.governance set parent_entity_id = p_parent_id, updated_by = auth.uid(), updated_at = now() where id = p_child_id;
end;
$$;

grant execute on function public.set_governance_parent(uuid,uuid) to authenticated;

create or replace function public.add_governance_child(
  p_parent_id uuid, p_name text, p_entity_type public.governance_entity_type,
  p_unit_type public.governance_unit_type default 'unit', p_status text default 'active',
  p_valid_from timestamptz default null, p_valid_to timestamptz default null,
  p_category_id uuid default null, p_image_url text default null
) returns jsonb
language plpgsql security definer set search_path = public, pg_catalog
as $$
declare v_entity public.governance;
begin
  perform public.require_governance_admin();
  if not exists (select 1 from public.governance where id = p_parent_id) then raise exception 'Parent governance entity not found'; end if;
  if nullif(btrim(p_name), '') is null then raise exception 'Name is required'; end if;
  if p_status not in ('active','inactive','deprecated') then raise exception 'Invalid governance status'; end if;
  if p_valid_from is null then raise exception 'Valid from is required'; end if;
  if p_status in ('inactive','deprecated') and p_valid_to is null then raise exception 'Valid to is required for inactive or deprecated entities'; end if;
  if p_valid_to is not null and p_valid_to < p_valid_from then raise exception 'Valid to cannot be earlier than valid from'; end if;
  insert into public.governance(name,entity_type,unit_type,parent_entity_id,status,valid_from,valid_to,category_id,image_url,created_by,updated_by)
  values(btrim(p_name),p_entity_type,p_unit_type,p_parent_id,p_status,p_valid_from,p_valid_to,p_category_id,nullif(btrim(p_image_url),''),auth.uid(),auth.uid())
  returning * into v_entity;
  return to_jsonb(v_entity);
end;
$$;

grant execute on function public.add_governance_child(uuid,text,public.governance_entity_type,public.governance_unit_type,text,timestamptz,timestamptz,uuid,text) to authenticated;

create or replace function public.add_governance_parent(
  p_child_id uuid, p_name text, p_entity_type public.governance_entity_type,
  p_unit_type public.governance_unit_type default 'unit', p_status text default 'active',
  p_valid_from timestamptz default null, p_valid_to timestamptz default null,
  p_category_id uuid default null, p_image_url text default null
) returns jsonb
language plpgsql security definer set search_path = public, pg_catalog
as $$
declare v_entity public.governance; v_old_parent uuid;
begin
  perform public.require_governance_admin();
  if not exists (select 1 from public.governance where id = p_child_id) then raise exception 'Child governance entity not found'; end if;
  if nullif(btrim(p_name), '') is null then raise exception 'Name is required'; end if;
  if p_status not in ('active','inactive','deprecated') then raise exception 'Invalid governance status'; end if;
  if p_valid_from is null then raise exception 'Valid from is required'; end if;
  if p_status in ('inactive','deprecated') and p_valid_to is null then raise exception 'Valid to is required for inactive or deprecated entities'; end if;
  if p_valid_to is not null and p_valid_to < p_valid_from then raise exception 'Valid to cannot be earlier than valid from'; end if;
  select parent_entity_id into v_old_parent from public.governance where id = p_child_id;
  insert into public.governance(name,entity_type,unit_type,parent_entity_id,status,valid_from,valid_to,category_id,image_url,created_by,updated_by)
  values(btrim(p_name),p_entity_type,p_unit_type,v_old_parent,p_status,p_valid_from,p_valid_to,p_category_id,nullif(btrim(p_image_url),''),auth.uid(),auth.uid())
  returning * into v_entity;
  update public.governance set parent_entity_id = v_entity.id, updated_by = auth.uid(), updated_at = now() where id = p_child_id;
  return to_jsonb(v_entity);
end;
$$;

grant execute on function public.add_governance_parent(uuid,text,public.governance_entity_type,public.governance_unit_type,text,timestamptz,timestamptz,uuid,text) to authenticated;

drop function if exists public.set_governance_person_profile(uuid,uuid);
create function public.set_governance_person_profile(p_person_id uuid, p_profile_user_id uuid default null)
returns public.governance
language plpgsql security definer set search_path = public, pg_catalog
as $$
declare v_row public.governance;
begin
  perform public.require_governance_admin();
  if not exists (select 1 from public.governance where id = p_person_id and entity_type = 'person') then raise exception 'Person governance entity not found'; end if;
  if p_profile_user_id is not null and not exists (select 1 from public.profile where user_id = p_profile_user_id) then raise exception 'Profile not found'; end if;
  update public.governance set profile_user_id = p_profile_user_id, updated_by = auth.uid(), updated_at = now() where id = p_person_id returning * into v_row;
  return v_row;
end;
$$;

grant execute on function public.set_governance_person_profile(uuid,uuid) to authenticated;

drop function if exists public.get_organization_tree(uuid,timestamptz);
create function public.get_organization_tree(p_governance_id uuid, p_at timestamptz default now())
returns table(id uuid,governance_id uuid,parent_id uuid,position_name text,position_governance_id uuid,person_name text,person_governance_id uuid,person_profile_user_id uuid,person_avatar_url text,is_vacant boolean,is_primary boolean,started_at timestamptz,ended_at timestamptz)
language sql stable set search_path=public,pg_catalog
as $$
select o.id,o.governance_id,o.reports_to_id,o.position_name,o.position_governance_id,o.person_name,o.person_governance_id,pg.profile_user_id,coalesce(pr.avatar_url,pg.image_url),o.is_vacant,o.is_primary,o.started_at,o.ended_at
from public.organization o left join public.governance pg on pg.id=o.person_governance_id and pg.entity_type='person' left join public.profile pr on pr.user_id=pg.profile_user_id
where o.governance_id=p_governance_id and o.started_at<=p_at and (o.ended_at is null or o.ended_at>=p_at)
order by o.is_primary desc,o.position_name,o.person_name;
$$;

grant execute on function public.get_organization_tree(uuid,timestamptz) to anon,authenticated;

drop function if exists public.get_governance_leader_at(uuid,timestamptz);
create function public.get_governance_leader_at(p_entity_id uuid,p_at timestamptz default now())
returns table(id uuid,person_name text,person_governance_id uuid,person_profile_user_id uuid,person_avatar_url text,position_name text,position_governance_id uuid,started_at timestamptz,ended_at timestamptz,is_vacant boolean)
language sql stable set search_path=public,pg_catalog
as $$
select o.id,o.person_name,o.person_governance_id,pg.profile_user_id,coalesce(pr.avatar_url,pg.image_url),o.position_name,o.position_governance_id,o.started_at,o.ended_at,o.is_vacant
from public.organization o left join public.governance pg on pg.id=o.person_governance_id and pg.entity_type='person' left join public.profile pr on pr.user_id=pg.profile_user_id
where o.governance_id=p_entity_id and o.started_at<=p_at and (o.ended_at is null or o.ended_at>=p_at)
order by o.is_primary desc,o.started_at desc limit 1;
$$;

grant execute on function public.get_governance_leader_at(uuid,timestamptz) to anon,authenticated;
