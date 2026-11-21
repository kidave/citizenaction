-- Keep the governance creation RPC callable only by authenticated users.
revoke execute on function public.create_governance_entity(
  text,
  public.governance_type,
  text,
  text,
  timestamptz,
  timestamptz,
  uuid,
  text,
  text
) from public, anon;

grant execute on function public.create_governance_entity(
  text,
  public.governance_type,
  text,
  text,
  timestamptz,
  timestamptz,
  uuid,
  text,
  text
) to authenticated;
