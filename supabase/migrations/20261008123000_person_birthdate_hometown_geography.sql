alter table public.person
  add column if not exists birthdate date,
  add column if not exists hometown_state_geography_id uuid,
  add column if not exists hometown_district_geography_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'person_hometown_state_geography_id_fkey'
  ) then
    alter table public.person
      add constraint person_hometown_state_geography_id_fkey
      foreign key (hometown_state_geography_id) references public.geographies(id)
      on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'person_hometown_district_geography_id_fkey'
  ) then
    alter table public.person
      add constraint person_hometown_district_geography_id_fkey
      foreign key (hometown_district_geography_id) references public.geographies(id)
      on delete set null;
  end if;
end $$;

update public.person p
set hometown_state_geography_id = d.parent_id
from public.geographies d
where p.hometown_district_geography_id = d.id
  and d.geography_type = 'district'
  and d.parent_id is not null
  and p.hometown_state_geography_id is null;

drop function if exists public.create_person(text,text,text,text,uuid,jsonb,text,text,text);
create function public.create_person(
  p_name text,
  p_biography text default null,
  p_website text default null,
  p_image_url text default null,
  p_profile_user_id uuid default null,
  p_metadata jsonb default '{}'::jsonb,
  p_birthdate date default null,
  p_hometown text default null,
  p_education text default null,
  p_hometown_state_geography_id uuid default null,
  p_hometown_district_geography_id uuid default null
) returns public.person
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.person;
  v_slug text;
  v_base_slug text;
  v_counter integer := 1;
  v_state_id uuid := p_hometown_state_geography_id;
begin
  perform public.require_governance_admin();

  if nullif(btrim(p_name),'') is null then
    raise exception 'Person name is required';
  end if;

  if p_hometown_district_geography_id is not null then
    select parent_id into v_state_id
    from public.geographies
    where id = p_hometown_district_geography_id
      and geography_type = 'district';

    if not found then
      raise exception 'Hometown district not found.';
    end if;
  end if;

  if v_state_id is not null and not exists (
    select 1 from public.geographies
    where id = v_state_id and geography_type = 'state'
  ) then
    raise exception 'Hometown state not found.';
  end if;

  if p_hometown_district_geography_id is not null and v_state_id is null then
    raise exception 'Hometown district must belong to a state.';
  end if;

  v_base_slug := public.slugify(btrim(p_name));
  if v_base_slug = '' then v_base_slug := 'person'; end if;
  v_slug := v_base_slug;
  while exists (select 1 from public.person where slug=v_slug) loop
    v_slug := v_base_slug || '-' || v_counter;
    v_counter := v_counter + 1;
  end loop;

  insert into public.person(
    name,slug,image_url,profile_user_id,biography,website,metadata,
    birthdate,hometown,education,hometown_state_geography_id,
    hometown_district_geography_id,created_by,updated_by
  )
  values(
    btrim(p_name),v_slug,nullif(btrim(p_image_url),''),
    p_profile_user_id,nullif(btrim(p_biography),''),
    nullif(btrim(p_website),''),coalesce(p_metadata,'{}'::jsonb),
    p_birthdate,nullif(btrim(p_hometown),''),
    nullif(btrim(p_education),''),v_state_id,
    p_hometown_district_geography_id,auth.uid(),auth.uid()
  )
  returning * into v_row;

  return v_row;
end;
$$;

drop function if exists public.update_person(uuid,text,text,text,text,uuid,jsonb,text,text);
create function public.update_person(
  p_person_id uuid,
  p_name text,
  p_biography text default null,
  p_website text default null,
  p_image_url text default null,
  p_profile_user_id uuid default null,
  p_metadata jsonb default null,
  p_hometown text default null,
  p_education text default null,
  p_birthdate date default null,
  p_hometown_state_geography_id uuid default null,
  p_hometown_district_geography_id uuid default null
) returns public.person
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.person;
  v_state_id uuid := p_hometown_state_geography_id;
begin
  perform public.require_governance_admin();

  if nullif(btrim(p_name), '') is null then
    raise exception 'Person name is required';
  end if;

  if p_hometown_district_geography_id is not null then
    select parent_id into v_state_id
    from public.geographies
    where id = p_hometown_district_geography_id
      and geography_type = 'district';

    if not found then
      raise exception 'Hometown district not found.';
    end if;
  end if;

  if v_state_id is not null and not exists (
    select 1 from public.geographies
    where id = v_state_id and geography_type = 'state'
  ) then
    raise exception 'Hometown state not found.';
  end if;

  update public.person
  set name = btrim(p_name),
      biography = nullif(btrim(p_biography), ''),
      website = nullif(btrim(p_website), ''),
      image_url = nullif(btrim(p_image_url), ''),
      profile_user_id = p_profile_user_id,
      birthdate = p_birthdate,
      hometown = nullif(btrim(p_hometown), ''),
      education = nullif(btrim(p_education), ''),
      hometown_state_geography_id = v_state_id,
      hometown_district_geography_id = p_hometown_district_geography_id,
      metadata = coalesce(p_metadata, metadata),
      updated_by = auth.uid(),
      updated_at = now()
  where id = p_person_id
  returning * into v_row;

  if not found then raise exception 'Person not found'; end if;
  return v_row;
end;
$$;

grant execute on function public.create_person(text,text,text,text,uuid,jsonb,date,text,text,uuid,uuid) to authenticated;
revoke execute on function public.create_person(text,text,text,text,uuid,jsonb,date,text,text,uuid,uuid) from anon, public;
grant execute on function public.update_person(uuid,text,text,text,text,uuid,jsonb,text,text,date,uuid,uuid) to authenticated;
revoke execute on function public.update_person(uuid,text,text,text,text,uuid,jsonb,text,text,date,uuid,uuid) from anon, public;

notify pgrst, 'reload schema';