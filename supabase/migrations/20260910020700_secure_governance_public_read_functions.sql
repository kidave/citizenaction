begin;

-- Public read helpers stay callable without login only where they are intentionally read-only.
revoke execute on function public.get_governance_contributions(uuid) from public, anon;
revoke execute on function public.get_governance_timeline_at(uuid,timestamptz) from public, anon;
revoke execute on function public.get_governance_leader_at(uuid,timestamptz) from public, anon;
revoke execute on function public.get_organization_tree(uuid,timestamptz) from public, anon;

-- Governance admin state is already authenticated-only; keep the role boundary explicit.
revoke execute on function public.get_governance_admin_state() from public, anon;
grant execute on function public.get_governance_admin_state() to authenticated;

commit;
