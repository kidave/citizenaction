-- Governance domain: broad institutional classification, separate from type and sector.
-- Mapping:
--   political_party -> politics
--   legislature     -> legislature
--   every other governance_type -> government
-- 'other' remains available for deliberate manual classification of non-core institutions.

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
      'government',
      'judiciary',
      'legislature',
      'other'
    );
  end if;
end;
$$;

alter table public.governance
  add column if not exists domain public.governance_domain;

-- Apply the agreed initial mapping to all existing records.
update public.governance
set domain = case
  when type::text = 'political_party' then 'politics'::public.governance_domain
  when type::text = 'legislature' then 'legislature'::public.governance_domain
  else 'government'::public.governance_domain
end
where domain is null;

alter table public.governance
  alter column domain set not null;

create index if not exists governance_domain_idx
  on public.governance (domain);

-- Keep domain consistent when type changes. Explicit domain assignments are
-- preserved, allowing administrators to classify non-core entities as 'other'
-- or explicitly place exceptional records in 'judiciary'.
create or replace function public.set_governance_domain_from_type()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $function$
begin
  if tg_op = 'INSERT' then
    if new.domain is null then
      new.domain := case
        when new.type::text = 'political_party' then 'politics'::public.governance_domain
        when new.type::text = 'legislature' then 'legislature'::public.governance_domain
        else 'government'::public.governance_domain
      end;
    end if;
  elsif tg_op = 'UPDATE' then
    if new.type is distinct from old.type
       and new.domain is not distinct from old.domain then
      new.domain := case
        when new.type::text = 'political_party' then 'politics'::public.governance_domain
        when new.type::text = 'legislature' then 'legislature'::public.governance_domain
        else 'government'::public.governance_domain
      end;
    end if;
  end if;

  return new;
end;
$function$;

drop trigger if exists governance_set_domain_from_type on public.governance;

create trigger governance_set_domain_from_type
before insert or update of type, domain
on public.governance
for each row
execute function public.set_governance_domain_from_type();

comment on column public.governance.domain is
  'Broad institutional domain: politics, government, judiciary, legislature, or other. Separate from type (institutional record type) and category_id (sector).';

commit;
