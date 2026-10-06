create or replace function public.update_governance_location(
  p_governance_id uuid,
  p_address text default null,
  p_lat double precision default null,
  p_lng double precision default null
)
returns public.governance
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.governance;
begin
  perform public.require_governance_admin();

  if p_governance_id is null then
    raise exception 'Governance entity is required';
  end if;

  update public.governance
  set address = nullif(btrim(p_address), ''),
      lat = p_lat,
      lng = p_lng,
      updated_by = auth.uid(),
      updated_at = now()
  where id = p_governance_id
  returning * into v_row;

  if not found then
    raise exception 'Governance entity not found';
  end if;

  return v_row;
end;
$$;

revoke execute on function public.update_governance_location(uuid,text,double precision,double precision) from public;
revoke execute on function public.update_governance_location(uuid,text,double precision,double precision) from anon;
grant execute on function public.update_governance_location(uuid,text,double precision,double precision) to authenticated;
