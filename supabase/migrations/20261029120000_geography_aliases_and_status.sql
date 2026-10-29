begin;

alter table public.geographies
  add column if not exists other_names text[] not null default '{}'::text[],
  add column if not exists status text not null default 'active';

alter table public.geographies
  drop constraint if exists geographies_status_check;

alter table public.geographies
  add constraint geographies_status_check
  check (status in ('active', 'defunct'));

create index if not exists geographies_status_type_idx
  on public.geographies (status, geography_type);

comment on column public.geographies.other_names is
  'Alternative or historical names for the same geography; do not use successor geography names as aliases.';
comment on column public.geographies.status is
  'Lifecycle status for a geography. Defunct records remain available for historical references.';

commit;
