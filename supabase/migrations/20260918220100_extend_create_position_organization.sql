drop function if exists public.create_position(text,text,text,uuid,jsonb);

create or replace function public.create_position(
  p_name text,
  p_description text default null,
  p_image_url text default null,
  p_category_id uuid default null,
  p_metadata jsonb default '{}'::jsonb,
  p_appointing_organization_id uuid default null
) returns public.position
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.position;
  v_slug text;
  v_base_slug text;
  v_counter integer := 1;
begin
  perform public.require_governance_admin();
  if nullif(btrim(p_name),'') is null then raise exception 'Position name is required'; end if;

  if p_appointing_organization_id is not null
     and not exists (select 1 from public.governance where id = p_appointing_organization_id) then
    raise exception 'Appointing organization not found';
  end if;

  v_base_slug := public.slugify(btrim(p_name));
  if v_base_slug = '' then v_base_slug := 'position'; end if;
  v_slug := v_base_slug;
  while exists (select 1 from public.position where slug=v_slug) loop
    v_slug := v_base_slug || '-' || v_counter;
    v_counter := v_counter + 1;
  end loop;

  insert into public.position(name,slug,description,image_url,category_id,metadata,appointing_organization_id,created_by,updated_by)
  values(btrim(p_name),v_slug,nullif(btrim(p_description),''),nullif(btrim(p_image_url),''),p_category_id,
         coalesce(p_metadata,'{}'::jsonb),p_appointing_organization_id,auth.uid(),auth.uid())
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.create_position(text,text,text,uuid,jsonb,uuid) to authenticated;
revoke execute on function public.create_position(text,text,text,uuid,jsonb,uuid) from anon, public;
notify pgrst, 'reload schema';
