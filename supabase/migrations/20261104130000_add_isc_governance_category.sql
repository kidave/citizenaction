-- ISC: Indian System Classification
-- Initial release: one Category dimension with five top-level institutional categories.
-- The existing category table remains the broad sector taxonomy and is not changed.

begin;

insert into public.classification_system (
  code, name, description, version, source, metadata
)
values (
  'ISC',
  'Indian System Classification',
  'A high-level classification of institutions in the Indian governance and civic system.',
  '1.0',
  'CitizenAction',
  jsonb_build_object(
    'scope', 'institutional classification',
    'default_category', 'ORGANIZATION',
    'initial_dimensions', jsonb_build_array('CATEGORY')
  )
)
on conflict (code) do update
set name = excluded.name,
    description = excluded.description,
    version = excluded.version,
    source = excluded.source,
    metadata = public.classification_system.metadata || excluded.metadata,
    updated_at = now();

insert into public.classification_dimension (
  system_id, code, name, description, sort_order
)
select
  s.id,
  'CATEGORY',
  'Category',
  'The broad institutional role of an entity within the Indian governance and civic system.',
  1
from public.classification_system s
where s.code = 'ISC'
on conflict (system_id, code) do update
set name = excluded.name,
    description = excluded.description,
    sort_order = excluded.sort_order,
    updated_at = now();

insert into public.classification_code (
  dimension_id, parent_id, code, title, display_name, description,
  level, path, is_leaf, is_reserved, sort_order, legend_order,
  verified, confidence, metadata
)
select
  d.id,
  null,
  seed.code,
  seed.title,
  seed.title,
  seed.description,
  1,
  seed.code,
  true,
  false,
  seed.sort_order,
  seed.sort_order,
  true,
  1.000,
  jsonb_build_object('default', seed.code = 'ORGANIZATION')
from public.classification_dimension d
join public.classification_system s on s.id = d.system_id
cross join (
  values
    ('GOVERNMENT_ADMINISTRATION', 'Government Administration',
     'The executive wing of government and public administration, including government departments, public authorities and public services.', 1),
    ('POLITICS', 'Politics',
     'Political parties, political alliances and political organisations.', 2),
    ('JUDICIARY_COURTS', 'Judiciary & Courts',
     'Courts and institutions exercising judicial functions, including constitutional, subordinate and specialised courts and tribunals.', 3),
    ('LEGISLATURE', 'Legislature',
     'Legislative institutions responsible for making laws, including Parliament and State Legislatures.', 4),
    ('ORGANIZATION', 'Organization',
     'Fallback category for institutions that do not belong to the other four ISC categories, including civic, professional, educational, research, cooperative and private organisations.', 5)
) as seed(code, title, description, sort_order)
where s.code = 'ISC'
  and d.code = 'CATEGORY'
on conflict (dimension_id, code) do update
set title = excluded.title,
    display_name = excluded.display_name,
    description = excluded.description,
    level = excluded.level,
    path = excluded.path,
    is_leaf = excluded.is_leaf,
    sort_order = excluded.sort_order,
    legend_order = excluded.legend_order,
    verified = excluded.verified,
    confidence = excluded.confidence,
    metadata = public.classification_code.metadata || excluded.metadata,
    updated_at = now();

-- These are root-level codes, so each code is its own ancestor at depth zero.
insert into public.classification_closure (ancestor_id, descendant_id, depth)
select c.id, c.id, 0
from public.classification_code c
join public.classification_dimension d on d.id = c.dimension_id
join public.classification_system s on s.id = d.system_id
where s.code = 'ISC'
  and d.code = 'CATEGORY'
on conflict (ancestor_id, descendant_id) do update
set depth = excluded.depth;

alter table public.governance
  add column if not exists isc_category_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.governance'::regclass
      and conname = 'governance_isc_category_id_fkey'
  ) then
    alter table public.governance
      add constraint governance_isc_category_id_fkey
      foreign key (isc_category_id)
      references public.classification_code(id)
      on delete restrict;
  end if;
end;
$$;

create index if not exists governance_isc_category_id_idx
  on public.governance (isc_category_id);

-- Backfill existing entities from their legacy record type, with explicit
-- exceptions for records whose legacy type did not describe their institutional role.
with isc_codes as (
  select
    max(c.id) filter (where c.code = 'GOVERNMENT_ADMINISTRATION') as government_administration_id,
    max(c.id) filter (where c.code = 'POLITICS') as politics_id,
    max(c.id) filter (where c.code = 'JUDICIARY_COURTS') as judiciary_id,
    max(c.id) filter (where c.code = 'LEGISLATURE') as legislature_id,
    max(c.id) filter (where c.code = 'ORGANIZATION') as organization_id
  from public.classification_code c
  join public.classification_dimension d on d.id = c.dimension_id
  join public.classification_system s on s.id = d.system_id
  where s.code = 'ISC' and d.code = 'CATEGORY'
)
update public.governance g
set isc_category_id = case
  when g.type::text = 'political_party' then isc_codes.politics_id
  when g.type::text = 'legislature' then isc_codes.legislature_id
  when g.type::text in ('court', 'tribunal') then isc_codes.judiciary_id
  when g.name = 'Indian Roads Congress' then isc_codes.organization_id
  when g.type::text = 'organization'
    and g.name in (
      'Ministry of Commerce and Industry',
      'Ministry of Corporate Affairs',
      'Indian Railways',
      'Brihanmumbai Electric Supply and Transport',
      'Pawan Hans Helicopters Limited',
      'AI Assets Holding Limited'
    ) then isc_codes.government_administration_id
  when g.type::text in (
    'government', 'ministry', 'department', 'authority', 'corporation',
    'committee', 'agency', 'board', 'commission', 'council', 'regulator',
    'office', 'division', 'zone', 'ward', 'station'
  ) then isc_codes.government_administration_id
  else isc_codes.organization_id
end
from isc_codes
where g.isc_category_id is null;

-- New records default to Organization. Explicit selections must belong to
-- ISC / Category; LBCS codes and codes from other systems are rejected.
create or replace function public.governance_isc_category_guard()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $function$
declare
  v_organization_id uuid;
  v_is_isc_category boolean;
begin
  select c.id
    into v_organization_id
  from public.classification_code c
  join public.classification_dimension d on d.id = c.dimension_id
  join public.classification_system s on s.id = d.system_id
  where s.code = 'ISC'
    and d.code = 'CATEGORY'
    and c.code = 'ORGANIZATION';

  if v_organization_id is null then
    raise exception 'ISC Organization category is not configured';
  end if;

  if new.isc_category_id is null then
    new.isc_category_id := v_organization_id;
  end if;

  select exists (
    select 1
    from public.classification_code c
    join public.classification_dimension d on d.id = c.dimension_id
    join public.classification_system s on s.id = d.system_id
    where c.id = new.isc_category_id
      and s.code = 'ISC'
      and d.code = 'CATEGORY'
  )
  into v_is_isc_category;

  if not v_is_isc_category then
    raise exception 'ISC category must reference a code in ISC / Category';
  end if;

  return new;
end;
$function$;

drop trigger if exists governance_isc_category_guard on public.governance;
create trigger governance_isc_category_guard
before insert or update of isc_category_id
on public.governance
for each row
execute function public.governance_isc_category_guard();

alter table public.governance
  alter column isc_category_id set not null;

comment on column public.governance.isc_category_id is
  'Institutional category code from the ISC / Category dimension. Separate from category_id, which identifies a broad sector.';

commit;
