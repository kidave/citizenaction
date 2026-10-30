-- Canonicalize position ownership as governance_id while retaining a synchronized
-- compatibility column for the currently deployed frontend and RPC signatures.
alter table public.position
  add column if not exists governance_id uuid references public.governance(id) on delete set null;

update public.position
set governance_id = appointing_organization_id
where governance_id is null and appointing_organization_id is not null;

create index if not exists position_governance_id_idx
  on public.position (governance_id);

create or replace function public.sync_position_governance_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.governance_id is not null
       and new.appointing_organization_id is not null
       and new.governance_id is distinct from new.appointing_organization_id then
      raise exception 'governance_id and appointing_organization_id must refer to the same governance record';
    end if;
    new.governance_id := coalesce(new.governance_id, new.appointing_organization_id);
    new.appointing_organization_id := new.governance_id;
  elsif new.governance_id is distinct from old.governance_id then
    new.appointing_organization_id := new.governance_id;
  elsif new.appointing_organization_id is distinct from old.appointing_organization_id then
    new.governance_id := new.appointing_organization_id;
  end if;
  return new;
end;
$$;

drop trigger if exists position_sync_governance_columns on public.position;
create trigger position_sync_governance_columns
before insert or update of governance_id, appointing_organization_id
on public.position
for each row execute function public.sync_position_governance_columns();

-- Position slugs are unique within their owning governance entity, not globally.
drop index if exists public.position_slug_uidx;
create unique index if not exists position_governance_slug_uidx
  on public.position (governance_id, slug)
  where governance_id is not null and slug is not null;

-- Normalize existing owned-position slugs from the position name.
-- A duplicate name under a different governance entity is now allowed.
update public.position
set slug = trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g'))
where governance_id is not null
  and slug is distinct from trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g'));

create or replace function public.set_position_slug_from_name()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  base_slug text;
  candidate_slug text;
  suffix integer := 2;
begin
  if tg_op = 'UPDATE' and new.name is not distinct from old.name
     and new.governance_id is not distinct from old.governance_id then
    return new;
  end if;

  base_slug := trim(both '-' from regexp_replace(lower(coalesce(new.name, 'position')), '[^a-z0-9]+', '-', 'g'));
  if base_slug = '' then base_slug := 'position'; end if;
  candidate_slug := base_slug;

  while exists (
    select 1 from public.position p
    where p.governance_id is not distinct from new.governance_id
      and p.slug = candidate_slug
      and p.id is distinct from new.id
  ) loop
    candidate_slug := base_slug || '-' || suffix;
    suffix := suffix + 1;
  end loop;

  new.slug := candidate_slug;
  return new;
end;
$$;

drop trigger if exists position_auto_slug_from_name on public.position;
create trigger position_auto_slug_from_name
before insert or update of name, governance_id
on public.position
for each row execute function public.set_position_slug_from_name();

notify pgrst, 'reload schema';
