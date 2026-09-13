-- Finalize the governance RPC names and security hardening applied in production.
-- This migration is intentionally idempotent so it can bootstrap another
-- environment after the older governance migrations have run.

do $$
begin
  if to_regprocedure('public.get_governance_directory_v2(text,text,text,uuid,uuid,uuid,integer)') is not null
     and to_regprocedure('public.get_governance_directory(text,text,text,uuid,uuid,uuid,integer)') is null then
    alter function public.get_governance_directory_v2(text,text,text,uuid,uuid,uuid,integer)
      rename to get_governance_directory;
  end if;

  if to_regprocedure('public.get_governance_directory(text,uuid,text,integer,boolean)') is not null
     and to_regprocedure('public.get_governance_tree(text,uuid,text,integer,boolean)') is null then
    alter function public.get_governance_directory(text,uuid,text,integer,boolean)
      rename to get_governance_tree;
  end if;
end $$;

-- The directory and tree functions are public read APIs.
grant execute on function public.get_governance_directory(text,text,text,uuid,uuid,uuid,integer) to anon, authenticated;
grant execute on function public.get_governance_tree(text,uuid,text,integer,boolean) to anon, authenticated;

-- Public views must execute as the caller so underlying RLS policies apply.
alter view public.classification_system_view set (security_invoker = true);
alter view public.classification_code_view set (security_invoker = true);
alter view public.post_stats set (security_invoker = true);
alter view public.feed_card_view set (security_invoker = true);
alter view public.governance_view set (security_invoker = true);

-- Pin search_path for application functions that inherit a mutable role
-- search_path. Extension-owned functions are intentionally excluded.
do $$
declare
  r record;
begin
  for r in
    select p.oid, n.nspname, p.proname,
           pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proconfig is null
      and not exists (
        select 1
        from pg_depend d
        where d.classid = 'pg_proc'::regclass
          and d.objid = p.oid
          and d.deptype = 'e'
      )
  loop
    execute format(
      'alter function %I.%I(%s) set search_path to public, pg_catalog',
      r.nspname, r.proname, r.args
    );
  end loop;
end $$;

alter function urban.set_updated_at() set search_path to urban, public, pg_catalog;

-- Authorization predicates and auth-trigger helpers are not public APIs.
revoke execute on function public.can_attach_post_to_space(uuid, uuid) from public, anon;
revoke execute on function public.can_contribute_to_post(uuid, uuid) from public, anon;
revoke execute on function public.can_manage_contribution(uuid, uuid) from public, anon;
revoke execute on function public.can_manage_post(uuid, uuid) from public, anon;
revoke execute on function public.sync_phone_to_profile() from public, anon, authenticated;

-- Browser link resolution intentionally reads this public metadata cache.
alter table public.website_metadata enable row level security;
drop policy if exists "Public can read website metadata" on public.website_metadata;
create policy "Public can read website metadata"
  on public.website_metadata
  for select
  to anon, authenticated
  using (true);
