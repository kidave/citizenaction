-- Institutional domain for governance records.
--
-- Public sector landing pages:
--   politics
--   legislature
--   executive
--   judiciary
--
-- This is a one-time classification of records that already exist when this
-- migration runs. It is intentionally NOT derived from governance.type after
-- migration. New and edited records must receive an explicit domain through
-- the application/review workflows.

begin;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'governance_domain'
  ) then
    create type public.governance_domain as enum (
      'politics',
      'legislature',
      'executive',
      'judiciary'
    );
  end if;
end;
$$;

alter table public.governance
  add column if not exists domain public.governance_domain;

-- One-time migration rule for the records that exist at deployment time:
-- political parties -> politics
-- legislatures      -> legislature
-- every other type  -> executive
update public.governance
set domain = case
  when type::text = 'political_party' then 'politics'::public.governance_domain
  when type::text = 'legislature' then 'legislature'::public.governance_domain
  else 'executive'::public.governance_domain
end
where domain is null;

-- Domain remains nullable so records can remain unclassified until explicitly
-- assigned. In particular, future judiciary records are assigned by domain,
-- not inferred from a governance.type value.
alter table public.governance
  alter column domain drop not null;

-- Remove the earlier type-derived behaviour if this migration is being
-- applied to a database where an earlier draft was tested.
drop trigger if exists governance_set_domain_from_type on public.governance;
drop function if exists public.set_governance_domain_from_type();

create index if not exists governance_domain_idx
  on public.governance (domain);

comment on column public.governance.domain is
  'Explicit institutional domain used for governance sector pages: politics, legislature, executive, or judiciary. Independent of governance.type and category_id.';

commit;
