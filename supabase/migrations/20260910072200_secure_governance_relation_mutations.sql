begin;
revoke execute on function public.add_governance_child(uuid,text,public.governance_entity_type,public.governance_unit_type,text,timestamptz,timestamptz,uuid,text) from public, anon;
revoke execute on function public.add_governance_parent(uuid,text,public.governance_entity_type,public.governance_unit_type,text,timestamptz,timestamptz,uuid,text) from public, anon;
grant execute on function public.add_governance_child(uuid,text,public.governance_entity_type,public.governance_unit_type,text,timestamptz,timestamptz,uuid,text) to authenticated;
grant execute on function public.add_governance_parent(uuid,text,public.governance_entity_type,public.governance_unit_type,text,timestamptz,timestamptz,uuid,text) to authenticated;
commit;
