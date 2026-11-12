begin;

-- Alias/status writes must go through the same governance-admin check as geography
-- edits. The table intentionally has no direct UPDATE policy, so a client-side
-- table update can affect zero rows without surfacing an error.
create or replace function public.update_geography_aliases(
  p_id uuid,
  p_other_names text[] default '{}'::text[],
  p_status text default 'active'
)
returns public.geographies
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.geographies;
  v_status text := coalesce(nullif(btrim(p_status), ''), 'active');
begin
  perform public.require_governance_admin();

  if p_id is null then
    raise exception 'Geography ID is required';
  end if;

  if v_status not in ('active', 'former', 'defunct') then
    raise exception 'Invalid geography status: %', v_status;
  end if;

  update public.geographies
  set other_names = coalesce(p_other_names, '{}'::text[]),
      status = v_status,
      updated_by = auth.uid(),
      updated_at = now()
  where id = p_id
  returning * into v_row;

  if not found then
    raise exception 'Geography not found: %', p_id;
  end if;

  return v_row;
end;
$$;

revoke execute on function public.update_geography_aliases(uuid, text[], text)
  from public, anon;
grant execute on function public.update_geography_aliases(uuid, text[], text)
  to authenticated;

commit;
