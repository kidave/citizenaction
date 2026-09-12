create type public.governance_type as enum (
  'government','ministry','department','authority','corporation','committee','organization','agency',
  'board','commission','council','regulator','office','tribunal','court','division','zone','ward','station'
);

alter table public.governance add column governance_type public.governance_type;

update public.governance set governance_type = case entity_type::text
  when 'authority' then 'authority'
  when 'organisation' then 'organization'
  when 'committee' then 'committee'
  when 'ministry' then 'ministry'
  when 'department' then 'department'
  when 'division' then 'division'
  when 'office' then 'office'
  when 'ward' then 'ward'
  when 'station' then 'station'
  when 'zone' then 'zone'
  when 'person' then 'organization'
  when 'position' then 'organization'
  else 'organization'
end::public.governance_type;

drop trigger if exists governance_sync_person on public.governance;
drop trigger if exists governance_sync_position on public.governance;
drop trigger if exists governance_prevent_person_position_type_change on public.governance;

drop function if exists public.sync_person_from_governance();
drop function if exists public.sync_position_from_governance();
drop function if exists public.prevent_person_position_entity_type_change();

drop view if exists public.governance_view;
alter table public.governance drop column unit_type;
alter table public.governance drop column entity_type;
alter table public.governance rename column governance_type to type;
alter table public.governance alter column type set not null;

drop type public.governance_entity_type;
drop type public.governance_unit_type;