-- Structured person profile fields should live as first-class columns rather than metadata.
alter table public.person
  add column if not exists birthdate date,
  add column if not exists hometown text,
  add column if not exists education text;

create or replace function public.update_person(
  p_person_id uuid,
  p_name text,
  p_biography text default null,
  p_website text default null,
  p_image_url text default null,
  p_profile_user_id uuid default null,
  p_metadata jsonb default null,
  p_birthdate date default null,
  p_hometown text default null,
  p_education text default null
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
      birthdate = p_birthdate,
      hometown = nullif(btrim(p_hometown), ''),
      education = nullif(btrim(p_education), ''),
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

grant execute on function public.update_person(uuid,text,text,text,text,uuid,jsonb,date,text,text) to authenticated;
revoke execute on function public.update_person(uuid,text,text,text,text,uuid,jsonb,date,text,text) from anon, public;

notify pgrst, 'reload schema';
