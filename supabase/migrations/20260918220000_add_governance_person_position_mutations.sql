-- First-class admin mutations for governance directory people and positions.

create or replace function public.update_person(
  p_person_id uuid,
  p_name text,
  p_biography text default null,
  p_website text default null,
  p_image_url text default null,
  p_profile_user_id uuid default null,
  p_metadata jsonb default null
) returns public.person
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.person;
begin
  perform public.require_governance_admin();

  if nullif(btrim(p_name), '') is null then
    raise exception 'Person name is required';
  end if;

  update public.person
  set name = btrim(p_name),
      biography = nullif(btrim(p_biography), ''),
      website = nullif(btrim(p_website), ''),
      image_url = nullif(btrim(p_image_url), ''),
      profile_user_id = p_profile_user_id,
      metadata = coalesce(p_metadata, metadata),
      updated_by = auth.uid(),
      updated_at = now()
  where id = p_person_id
  returning * into v_row;

  if not found then
    raise exception 'Person not found';
  end if;

  return v_row;
end;
$$;

create or replace function public.delete_person(p_person_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_appointments integer;
begin
  perform public.require_governance_admin();

  if not exists (select 1 from public.person where id = p_person_id) then
    raise exception 'Person not found';
  end if;

  select count(*) into v_appointments
  from public.position_appointment
  where person_id = p_person_id;

  if v_appointments > 0 then
    raise exception 'Cannot delete a person with appointment history. Remove their appointments first.';
  end if;

  delete from public.person where id = p_person_id;
end;
$$;

create or replace function public.update_position(
  p_position_id uuid,
  p_name text,
  p_description text default null,
  p_image_url text default null,
  p_category_id uuid default null,
  p_appointing_organization_id uuid default null,
  p_metadata jsonb default null
) returns public.position
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.position;
begin
  perform public.require_governance_admin();

  if nullif(btrim(p_name), '') is null then
    raise exception 'Position name is required';
  end if;

  if p_appointing_organization_id is not null
     and not exists (select 1 from public.governance where id = p_appointing_organization_id) then
    raise exception 'Appointing organization not found';
  end if;

  update public.position
  set name = btrim(p_name),
      description = nullif(btrim(p_description), ''),
      image_url = nullif(btrim(p_image_url), ''),
      category_id = p_category_id,
      appointing_organization_id = p_appointing_organization_id,
      metadata = coalesce(p_metadata, metadata),
      updated_by = auth.uid(),
      updated_at = now()
  where id = p_position_id
  returning * into v_row;

  if not found then
    raise exception 'Position not found';
  end if;

  return v_row;
end;
$$;

create or replace function public.delete_position(p_position_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_appointments integer;
begin
  perform public.require_governance_admin();

  if not exists (select 1 from public.position where id = p_position_id) then
    raise exception 'Position not found';
  end if;

  select count(*) into v_appointments
  from public.position_appointment
  where position_id = p_position_id;

  if v_appointments > 0 then
    raise exception 'Cannot delete a position with appointment history. Remove its appointments first.';
  end if;

  delete from public.position where id = p_position_id;
end;
$$;

grant execute on function public.update_person(uuid,text,text,text,text,uuid,jsonb) to authenticated;
grant execute on function public.delete_person(uuid) to authenticated;
grant execute on function public.update_position(uuid,text,text,text,uuid,uuid,jsonb) to authenticated;
grant execute on function public.delete_position(uuid) to authenticated;

revoke execute on function public.update_person(uuid,text,text,text,text,uuid,jsonb) from anon, public;
revoke execute on function public.delete_person(uuid) from anon, public;
revoke execute on function public.update_position(uuid,text,text,text,uuid,uuid,jsonb) from anon, public;
revoke execute on function public.delete_position(uuid) from anon, public;

notify pgrst, 'reload schema';
