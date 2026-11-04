begin;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'governance_domain'
  ) then
    create type public.governance_domain as enum (
      'politics', 'legislature', 'executive', 'judiciary'
    );
  end if;
end;
$$;

alter table public.governance
  add column if not exists domain public.governance_domain;

-- One-time classification of records that exist when this migration is applied.
-- Future domain assignments are explicit and are never inferred from governance.type.
update public.governance
set domain = case
  when type::text = 'political_party' then 'politics'::public.governance_domain
  when type::text = 'legislature' then 'legislature'::public.governance_domain
  else 'executive'::public.governance_domain
end
where domain is null;

create index if not exists governance_domain_slug_idx
  on public.governance (domain, slug);

comment on column public.governance.domain is
  'Explicit institutional domain used for public governance routes: politics, legislature, executive, or judiciary. Independent of governance.type and category_id. NULL means unassigned.';

-- Keep the existing CRUD RPCs as the single source of validation and mutation logic.
-- These wrappers add explicit domain assignment atomically without changing legacy callers.
create or replace function public.create_governance_entity_with_domain(
  p_name text,
  p_type public.governance_type,
  p_domain¶»§q«^