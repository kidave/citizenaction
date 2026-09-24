begin;

alter table public.governance
  add column if not exists geography_id uuid;

alter table public.governance
  drop constraint if exists governance_geography_id_fkey;

alter table public.governance
  add constraint governance_geography_id_fkey
  foreign key (geography_id)
  references public.geographies(id)
  on delete set null;

update public.governance gov
set geography_id = src.geography_id,
    updated_at = now()
from (
  select distinct on (governance_id)
    governance_id,
    geography_id
  from public.governance_geography
  order by governance_id, is_primary desc, created_at asc
) src
where gov.id = src.governance_id
  and gov.geography_id is null;

create index if not exists governance_geography_id_idx
  on public.governance (geography_id);

alter table public.geographies
  drop constraint if exists geographies_geography_type_check;

alter table public.geographies
  add constraint geographies_geography_type_check
  check (geography_type = any (array[
    'country'::text,
    'state'::text,
    'division'::text,
    'district'::text,
    'subdistrict'::text,
    'city'::text,
    'local_government'::text,
    'metropolitan_area'::text,
    'zone'::text,
    'ward'::text,
    'other'::text
  ]));

commit;
