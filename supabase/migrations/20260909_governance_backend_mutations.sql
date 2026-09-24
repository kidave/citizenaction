-- Governance backend invariants and mutations.
-- Applied to the connected Supabase project on 2026-09-09.

create or replace function public.generate_governance_slug()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  base_slug text;
  final_slug text;
  counter integer := 1;
begin
  base_slug := public.slugify(coalesce(new.name, ''));
  if base_slug = '' then
    base_slug := 'governance-' || replace(new.id::text, '-', '');
  end if;
  final_slug := base_slug;
  while exists (select 1 from public.governance g where g.slug = final_slug and g.id <> new.id) loop
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  end loop;
  new.slug := final_slug;
  return new;
end;
$$;

drop trigger if exists governance_slug_trigger on public.governance;
create trigger governance_slug_trigger
before insert or update of name on public.governance
for each row execute function public.generate_governance_slug();

create or replace function public.require_governance_admin()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not exists (select 1 from public.profile where user_id = auth.uid() and role = 'admin') then raise exception 'Administrator access required'; end if;
end;
$$;

create or replace function public.update_governance_entity(
  p_entity_id uuid, p_name text, p_short_name text default null, p_description text default null,
  p_website text default null, p_entity_type public.governance_entity_type default null,
  p_status text default 'active', p_valid_from timestamptz default null, p_valid_to timestamptz default null,
  p_image_url text default null, p_category_id uuid default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare v_row public.governance;
begin
  perform public.require_governance_admin();
  if not exists (select 1 from public.governance where id=p_entity_id) then raise exception 'Governance entity not found'; end if;
  if p_status not in ('active','inactive','deprecated') then raise exception 'Invalid governance status'; end if;
  if p_valid_to is not null and p_valid_from is not null and p_valid_to < p_valid_from then raise exception 'Valid to cannot be earlier than valid from'; end if;
  if p_status in ('inactive','deprecated') and p_valid_to is null then raise exception 'Valid to is required for inactive or deprecated entities'; end if;
  update public.governance set name=nullif(btrim(p_name),''), short_name=nullif(btrim(p_short_name),''), description=nullif(btrim(p_description),''), website=nullif(btrim(p_website),''), entity_type=coalesce(p_entity_type,entity_type), status=p_status, valid_from=p_valid_from, valid_to=case when p_status='active' then null else p_valid_to end, image_url=nullif(btrim(p_image_url),''), category_id=p_category_id, updated_by=auth.uid(), updated_at=now() where id=p_entity_id returning * into v_row;
  if v_row.name is null then raise exception 'Name is required'; end if;
  return to_jsonb(v_row);
end;
$$;

create or replace function public.set_governance_parent(p_child_id uuid, p_parent_id uuid default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.require_governance_admin();
  if not exists (select 1 from public.governance where id=p_child_id) then raise exception 'Child governance entity not found'; end if;
  if p_parent_id is not null and not exists (select 1 from public.governance where id=p_parent_id) then raise exception 'Parent governance entity not found'; end if;
  if p_parent_id is not null and (p_parent_id=p_child_id or exists (with recursive ancestors(id) as (select p_parent_id union all select gu.parent_entity_id from public.governance_unit gu join ancestors a on gu.entity_id=a.id where gu.parent_entity_id is not null) select 1 from ancestors where id=p_child_id)) then raise exception 'This parent would create a governance cycle'; end if;
  update public.governance_unit set parent_entity_id=p_parent_id, updated_by=auth.uid(), updated_at=now() where entity_id=p_child_id;
  if not found then raise exception 'Governance unit not found'; end if;
end;
$$;

create or replace function public.add_governance_child(
  p_parent_id uuid, p_name text, p_entity_type public.governance_entity_type,
  p_unit_type public.governance_unit_type default 'unit', p_status text default 'active',
  p_valid_from timestamptz default null, p_valid_to timestamptz default null,
  p_category_id uuid default null, p_image_url text default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare v_entity public.governance;
begin
  perform public.require_governance_admin();
  if not exists (select 1 from public.governance where id=p_parent_id) then raise exception 'Parent governance entity not found'; end if;
  if nullif(btrim(p_name),'') is null then raise exception 'Name is required'; end if;
  if p_status not in ('active','inactive','deprecated') then raise exception 'Invalid governance status'; end if;
  if p_status in ('inactive','deprecated') and p_valid_to is null then raise exception 'Valid to is required for inactive or deprecated entities'; end if;
  if p_valid_to is not null and p_valid_from is not null and p_valid_to < p_valid_from then raise exception 'Valid to cannot be earlier than valid from'; end if;
  insert into public.governance(name,entity_type,status,valid_from,valid_to,category_id,image_url,created_by,updated_by) values(btrim(p_name),p_entity_type,p_status,p_valid_from,case when p_status='active' then null else p_valid_to end,p_category_id,nullif(btrim(p_image_url),''),auth.uid(),auth.uid()) returning * into v_entity;
  insert into public.governance_unit(entity_id,parent_entity_id,unit_type,name,valid_from,valid_to,created_by,updated_by) values(v_entity.id,p_parent_id,p_unit_type,v_entity.name,p_valid_from,case when p_status='active' then null else p_valid_to end,auth.uid(),auth.uid());
  return to_jsonb(v_entity);
end;
$$;

create or replace function public.add_governance_parent(
  p_child_id uuid, p_name text, p_entity_type public.governance_entity_type,
  p_unit_type public.governance_unit_type default 'unit', p_status text default 'active',
  p_valid_from timestamptz default null, p_valid_to timestamptz default null,
  p_category_id uuid default null, p_image_url text default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare v_entity public.governance; v_old_parent uuid;
begin
  perform public.require_governance_admin();
  if not exists (select 1 from public.governance where id=p_child_id) then raise exception 'Child governance entity not found'; end if;
  if nullif(btrim(p_name),'') is null then raise exception 'Name is required'; end if;
  if p_status not in ('active','inactive','deprecated') then raise exception 'Invalid governance status'; end if;
  if p_status in ('inactive','deprecated') and p_valid_to is null then raise exception 'Valid to is required for inactive or deprecated entities'; end if;
  if p_valid_to is not null and p_valid_from is not null and p_valid_to < p_valid_from then raise exception 'Valid to cannot be earlier than valid from'; end if;
  select parent_entity_id into v_old_parent from public.governance_unit where entity_id=p_child_id;
  insert into public.governance(name,entity_type,status,valid_from,valid_to,category_id,image_url,created_by,updated_by) values(btrim(p_name),p_entity_type,p_status,p_valid_from,case when p_status='active' then null else p_valid_to end,p_category_id,nullif(btrim(p_image_url),''),auth.uid(),auth.uid()) returning * into v_entity;
  insert into public.governance_unit(entity_id,parent_entity_id,unit_type,name,valid_from,valid_to,created_by,updated_by) values(v_entity.id,v_old_parent,p_unit_type,v_entity.name,p_valid_from,case when p_status='active' then null else p_valid_to end,auth.uid(),auth.uid());
  update public.governance_unit set parent_entity_id=v_entity.id, updated_by=auth.uid(), updated_at=now() where entity_id=p_child_id;
  return to_jsonb(v_entity);
end;
$$;

grant execute on function public.update_governance_entity(uuid,text,text,text,text,public.governance_entity_type,text,timestamptz,timestamptz,text,uuid) to authenticated;
grant execute on function public.set_governance_parent(uuid,uuid) to authenticated;
grant execute on function public.add_governance_child(uuid,text,public.governance_entity_type,public.governance_unit_type,text,timestamptz,timestamptz,uuid,text) to authenticated;
grant execute on function public.add_governance_parent(uuid,text,public.governance_entity_type,public.governance_unit_type,text,timestamptz,timestamptz,uuid,text) to authenticated;
