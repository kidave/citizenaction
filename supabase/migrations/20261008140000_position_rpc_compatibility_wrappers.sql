-- Preserve RPC signatures used by the current production frontend while the
-- contextual position workflow rolls forward.
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
begin
  return public.create_position(
    p_name,
    p_description,
    p_image_url,
    p_category_id,
    p_metadata,
    p_appointing_organization_id,
    null
  );
end;
$$;

grant execute on function public.create_position(text,text,text,uuid,jsonb,uuid) to authenticated;
revoke execute on function public.create_position(text,text,text,uuid,jsonb,uuid) from anon, public;

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
begin
  return public.update_position(
    p_position_id,
    p_name,
    p_description,
    p_image_url,
    p_category_id,
    p_metadata,
    null
  );
end;
$$;

grant execute on function public.update_position(uuid,text,text,text,uuid,uuid,jsonb) to authenticated;
revoke execute on function public.update_position(uuid,text,text,text,uuid,uuid,jsonb) from anon, public;
notify pgrst,'reload schema';
