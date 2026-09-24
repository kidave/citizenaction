begin;
revoke execute on function public.set_governance_jurisdiction(uuid,text,bigint,text,integer,jsonb,text,text,text) from public, anon;
grant execute on function public.set_governance_jurisdiction(uuid,text,bigint,text,integer,jsonb,text,text,text) to authenticated;
commit;
