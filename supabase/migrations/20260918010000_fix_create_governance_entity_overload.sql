-- Fix the governance creation RPC overload.
--
-- The previous description migration created a second overloaded function instead
-- of replacing the original 8-argument function. PostgREST could then not choose
-- between the two RPC candidates when the organization form supplied defaults.

drop function if exists public.create_governance_entity(
  text,
  public.governance_type,
  text,
  text,
  timestamptz,
  timestamptz,
  uuid,
  text
);

create or replace function public.create_governance_entity(
  p_name text,
  p_type public.governance_type,
  p_short_name text default null,
  p_status text default 'active',
  p_valid_from timestamptz default now(),
  p_valid_to timestamptz default null,
  p_category_id uuid default null,
  p_image_url text default null,
  p_description text default null
)
returns public.governance
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_row public.governance;
begin
  perform public.require_governance_admin();

  if nullif(btrim(p_name), '') is null then
    raise exception 'Name is required.';
  end if;

  if p_status not in ('active', 'inactive', 'deprecated') then
    raise exception 'Invalid governance status.';
  end if;

  if p_valid_from is null then
    raise exception 'Valid from is required.';
  end if;

  if p_valid_to is not null and p_valid_to < p_valid_from then
    raise exception 'Valid to cannot be earlier than valid from.';
  end if;

  if p_status in ('inactive', 'deprecated') and p_valid_to is null then
    raise exception 'Valid to is required for inactive or deprecated entities.';
  end if;

  insert into public.governance(
    type,
    name,
    short_name,
    description,
    status,
    valid_from,
    valid_to,
    category_id,
    image_url,
    created_by,
    updated_by
  )
  values(
    p_type,
    btrim(p_name),
    nullif(btrim(p_short_name), ''),
    nullif(btrim(p_description), ''),
    p_status,
    p_valid_from,
    p_valid_to,
    p_category_id,
    nullif(btrim(p_image_url), ''),
    auth.uid(),
    auth.uid()
  )
  returning * into v_row;

  return v_row;
end;
$function$;
