alter table public.person drop column if exists birthdate;
alter table public.person drop column if exists hometown;
alter table public.person drop column if exists education;

drop function if exists public.update_person(uuid,text,text,text,text,uuid,jsonb,date,text,text);
drop function if exists public.update_person(uuid,text,text,text,uuid,uuid,jsonb);

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
declare v_row public.person;
begin
  perform public.require_governance_admin();
  if nullif(btrim(p_name),'') is null then raise exception 'Person name is required'; end if;
  update public.person
  set name=btrim(p_name),
      biography=nullif(btrim(p_biography),''),
      website=nullif(btrim(p_website),''),
      image_url=nullif(btrim(p_image_url),''),
      profile_user_id=p_profile_user_id,
      metadata=coalesce(p_metadata,metadata),
      updated_by=auth.uid(),
      updated_at=now()
  where id=p_person_id
  returning * into v_row;
  if not found then raise exception 'Person not found'; end if;
  return v_row;
end; $$;

grant execute on function public.update_person(uuid,text,text,text,text,uuid,jsonb) to authenticated;
revoke execute on function public.update_person(uuid,text,text,text,text,uuid,jsonb) from anon,public;
notify pgrst,'reload schema';