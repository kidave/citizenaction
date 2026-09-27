begin;
revoke execute on function public.get_governance_contributions(text) from public, anon;
revoke execute on function public.get_governance_timeline_at(uuid,timestamptz) from public, anon;
revoke execute on function public.get_governance_leader_at(uuid,timestamptz) from public, anon;
revoke execute on function public.get_organization_tree(uuid,timestamptz) from public, anon;
revoke execute on function public.get_governance_admin_state() from public, anon;
grant execute on function public.get_governance_admin_state() to authenticated;
commit;
