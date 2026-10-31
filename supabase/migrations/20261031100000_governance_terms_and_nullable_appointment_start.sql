-- Canonical parliamentary terms and nullable individual appointment start dates.
-- Term dates are institutional dates supplied for Citizen Action; verify source/date
-- semantics before treating them as legal dates in public-facing historical records.

create table if not exists public.governance_term (
  id uuid primary key default gen_random_uuid(),
  governance_id uuid not null references public.governance(id) on delete cascade,
  name text not null,
  started_at date not null,
  ended_at date,
  source_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint governance_term_dates_chk check (ended_at is null or ended_at >= started_at),
  constraint governance_term_governance_name_uidx unique (governance_id, name)
);

comment on table public.governance_term is
  'Institutional terms for governance entities, e.g. a Lok Sabha term; distinct from individual appointment dates.';

alter table public.position_appointment
  alter column started_at drop not null,
  add column if not exists term_id uuid references public.governance_term(id) on delete set null;

create index if not exists position_appointment_term_id_idx
  on public.position_appointment (term_id);

-- Seed terms only when the canonical Lok Sabha institution resolves uniquely.
with lok_sabha as (
  select id
  from public.governance
  where lower(name) = 'lok sabha'
    and type = 'legislature'
    and parent_entity_id = (
      select id from public.governance
      where lower(name) = 'parliament of india'
      limit 1
    )
  order by id
  limit 1
),
terms(name, started_at, ended_at) as (
  values
    ('1st Lok Sabha', date '1952-04-17', date '1957-04-04'),
    ('2nd Lok Sabha', date '1957-04-05', date '1962-03-31'),
    ('3rd Lok Sabha', date '1962-04-02', date '1967-03-03'),
    ('4th Lok Sabha', date '1967-03-04', date '1970-12-27'),
    ('5th Lok Sabha', date '1971-03-15', date '1977-01-18'),
    ('6th Lok Sabha', date '1977-03-23', date '1979-08-22'),
    ('7th Lok Sabha', date '1980-01-18', date '1984-12-31'),
    ('8th Lok Sabha', date '1984-12-31', date '1989-11-27'),
    ('9th Lok Sabha', date '1989-12-02', date '1991-03-13'),
    ('10th Lok Sabha', date '1991-06-20', date '1996-05-10'),
    ('11th Lok Sabha', date '1996-05-15', date '1997-12-04'),
    ('12th Lok Sabha', date '1998-03-23', date '1999-04-26'),
    ('13th Lok Sabha', date '1999-10-20', date '2004-02-06'),
    ('14th Lok Sabha', date '2004-06-02', date '2009-05-18'),
    ('15th Lok Sabha', date '2009-06-01', date '2014-01-18'),
    ('16th Lok Sabha', date '2014-06-04', date '2019-05-24'),
    ('17th Lok Sabha', date '2019-06-17', date '2024-06-05'),
    ('18th Lok Sabha', date '2024-06-24', null)
)
insert into public.governance_term (governance_id, name, started_at, ended_at, source_url, metadata)
select ls.id, t.name, t.started_at, t.ended_at,
       'https://sansad.in/ls',
       jsonb_build_object('date_source', 'User-provided dates; pending official source verification')
from lok_sabha ls
cross join terms t
on conflict (governance_id, name) do update
set started_at = excluded.started_at,
    ended_at = excluded.ended_at,
    source_url = coalesce(public.governance_term.source_url, excluded.source_url),
    metadata = public.governance_term.metadata || excluded.metadata,
    updated_at = now();

-- Link existing textual appointment term labels to the canonical term rows.
-- This intentionally leaves unmatched or ambiguous labels untouched.
update public.position_appointment pa
set term_id = gt.id
from public.governance_term gt
where pa.term_id is null
  and pa.term is not null
  and lower(btrim(pa.term)) = lower(gt.name);

-- Keep the compatibility text label and canonical FK aligned for importer writes.
create or replace function public.sync_position_appointment_term_id()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.term_id is not null then
    select gt.name into new.term
    from public.governance_term gt
    where gt.id = new.term_id;
  elsif nullif(btrim(new.term), '') is not null then
    select gt.id into new.term_id
    from public.governance_term gt
    where lower(gt.name) = lower(btrim(new.term))
    order by gt.started_at desc
    limit 1;
  end if;
  return new;
end;
$$;

drop trigger if exists position_appointment_sync_term_id on public.position_appointment;
create trigger position_appointment_sync_term_id
before insert or update of term, term_id
on public.position_appointment
for each row execute function public.sync_position_appointment_term_id();

notify pgrst, 'reload schema';
