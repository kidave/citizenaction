begin;

-- A single canonical mapping is shared by database triggers and organisation RPCs.
create or replace function public.is_governance_type_valid_for_domain(
  p_domain text,
  p_type text
)
returns boolean
language sql
immutable
parallel safe
set search_path = pg_catalog
as $$
  select case
    when p_domain = 'politics' then p_type = 'political_party'
    when p_domain = 'legislature' then p_type = any(array[
      'parliament', 'legislature', 'legislative_house', 'committee', 'office'
    ])
    when p_domain = 'executive' then p_type = any(array[
      'government', 'ministry', 'department', 'council', 'agency',
      'authority', 'board', 'commission', 'bureau', 'regulator',
      'local_government', 'corporation', 'enterprise', 'committee',
      'organization', 'office', 'division', 'zone', 'ward', 'station'
    ])
    when p_domain = 'judiciary' then p_type = any(array[
      'court', 'tribunal', 'council', 'commission', 'office'
    ])
    when p_domain is null then p_type = 'organization'
    else false
  end;
$$;

-- Normalise the existing Parliament and house records to the more precise types.
update public.governance
set type = 'parliament'::public.governance_type
where domain = 'legislature'
  and lower(name) = 'parliament of india'
  and type::text = 'legislature';

update public.governance
set type = 'legislative_house'::public.governance_type
where domain = 'legislature'
  and lower(name) in ('lok sabha', 'rajya sabha')
  and type::text = 'legislature';

create or replace function public.validate_governance_domain_type_and_parent()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
declare
  v_parent_domain text;
begin
  if not public.is_governance_type_valid_for_domain(new.domain, new.type::text) then
    raise exception 'Organisation type "%" is not valid for domain "%".', new.type::text, coalesce(new.domain, 'Other')
      using errcode = '23514',
            hint = 'Choose an organisation type permitted by the selected domain.';
  end if;

  if new.parent_entity_id is not null then
    if new.parent_entity_id = new.id then
      raise exception 'An organisation cannot be its own parent.'
        using errcode = '23514';
    end if;

    select parent.domain
    into v_parent_domain
    from public.governance parent
    where parent.id = new.parent_entity_id;

    if not found then
      raise exception 'Parent organisation does not exist.'
        using errcode = '23503';
    end if;

    if v_parent_domain is distinct from new.domain then
      raise exception 'Parent and child organisations must belong to the same domain.'
        using errcode = '23514',
              hint = 'Select a parent organisation from the same domain, or change the parent domain first.';
    end if;
  end if;

  if tg_op = 'UPDATE' and new.domain is distinct from old.domain then
    if exists (
      select 1
      from public.governance child
      where child.parent_entity_id = old.id
        and child.domain is distinct from new.domain
    ) then
      raise exception 'The domain cannot be changed while child organisations belong to a different domain.'
        using errcode = '23514',
              hint = 'Move or update the child organisations before changing this domain.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists governance_validate_domain_type_parent on public.governance;
create trigger governance_validate_domain_type_parent
before insert or update of type, domain, parent_entity_id
on public.governance
for each row
execute function public.validate_governance_domain_type_and_parent();

create index if not exists governance_parent_entity_id_idx
  on public.governance(parent_entity_id);

comment on function public.is_governance_type_valid_for_domain(text, text) is
  'Canonical organisation type allow-list by governance domain. Other (NULL domain) is limited to generic organisation records.';
comment on column public.governance.parent_entity_id is
  'Parent organisation in the organisational hierarchy. Parent and child must share the same governance domain.';

create or replace function public.create_governance_organization(
  p_name text,
  p_type public.governance_type,
  p_domain text,
  p_parent_entity_id uuid default null,
  p_short_name text default null,
  p_status text default 'active',
  p_valid_from timestamptz default now(),
  p_valid_to timestamptz default null,
  p_category_id uuid default null,
  p_image_url text default null,
  p_website text default null,
  p_email text default null,
  p_phone text default null,
  p_address text default null,
  p_description text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns public.governance
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_row public.governance;
begin
  perform public.require_governance_admin();

  if nullif(btrim(p_name), '') is null then
    raise exception 'Organisation name is required.';
  end if;
  if p_status not in ('active', 'inactive', 'deprecated') then
    raise exception 'Invalid organisation status.';
  end if;
  if p_valid_from is null then
    raise exception 'Valid from is required.';
  end if;
  if p_valid_to is not null and p_valid_to < p_valid_from then
    raise exception 'Valid to cannot be earlier than valid from.';
  end if;
  if p_status in ('inactive', 'deprecated') and p_valid_to is null then
    raise exception 'Valid to is required for inactive or deprecated organisations.';
  end if;
  if not public.is_governance_type_valid_for_domain(p_domain, p_type::text) then
    raise exception 'Organisation type "%" is not valid for domain "%".', p_type::text, coalesce(p_domain, 'Other');
  end if;

  insert into public.governance(
    type, domain, parent_entity_id, name, short_name, description, website,
    email, phone, address, status, valid_from, valid_to, category_id,
    image_url, metadata, created_by, updated_by
  )
  values (
    p_type, p_domain, p_parent_entity_id, btrim(p_name),
    nullif(btrim(p_short_name), ''), nullif(btrim(p_description), ''),
    nullif(btrim(p_website), ''), nullif(btrim(p_email), ''),
    nullif(btrim(p_phone), ''), nullif(btrim(p_address), ''),
    p_status, p_valid_from, p_valid_to, p_category_id,
    nullif(btrim(p_image_url), ''), coalesce(p_metadata, '{}'::jsonb),
    auth.uid(), auth.uid()
  )
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.update_governance_organization(
  p_entity_id uuid,
  p_name text,
  p_type public.governance_type,
  p_domain text,
  p_parent_entity_id uuid default null,
  p_short_name text default null,
  p_description text default null,
  p_website text default null,
  p_status text default 'active',
  p_valid_from timestamptz default null,
  p_valid_to timestamptz default null,
  p_image_url text default null,
  p_category_id uuid default null,
  p_email text default null,
  p_phone text default null,
  p_address text default null,
  p_metadata jsonb default null
)
returns public.governance
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_row public.governance;
begin
  perform public.require_governance_admin();

  if p_entity_id is null then
    raise exception 'Organisation ID is required.';
  end if;
  if nullif(btrim(p_name), '') is null then
    raise exception 'Organisation name is required.';
  end if;
  if p_status not in ('active', 'inactive', 'deprecated') then
    raise exception 'Invalid organisation status.';
  end if;
  if p_valid_from is null then
    raise exception 'Valid from is required.';
  end if;
  if p_valid_to is not null and p_valid_to < p_valid_from then
    raise exception 'Valid to cannot be earlier than valid from.';
  end if;
  if p_status in ('inactive', 'deprecated') and p_valid_to is null then
    raise exception 'Valid to is required for inactive or deprecated organisations.';
  end if;
  if not public.is_governance_type_valid_for_domain(p_domain, p_type::text) then
    raise exception 'Organisation type "%" is not valid for domain "%".', p_type::text, coalesce(p_domain, 'Other');
  end if;

  update public.governance
  set type = p_type,
      domain = p_domain,
      parent_entity_id = p_parent_entity_id,
      name = btrim(p_name),
      short_name = nullif(btrim(p_short_name), ''),
      description = nullif(btrim(p_description), ''),
      website = nullif(btrim(p_website), ''),
      email = nullif(btrim(p_email), ''),
      phone = nullif(btrim(p_phone), ''),
      address = nullif(btrim(p_address), ''),
      status = p_status,
      valid_from = p_valid_from,
      valid_to = p_valid_to,
      image_url = nullif(btrim(p_image_url), ''),
      category_id = p_category_id,
      metadata = coalesce(p_metadata, metadata, '{}'::jsonb),
      updated_by = auth.uid(),
      updated_at = now()
  where id = p_entity_id
  returning * into v_row;

  if not found then
    raise exception 'Organisation not found.';
  end if;

  return v_row;
end;
$$;

revoke all on function public.create_governance_organization(
  text, public.governance_type, text, uuid, text, text, timestamptz, timestamptz,
  uuid, text, text, text, text, text, text, jsonb
) from public, anon;
grant execute on function public.create_governance_organization(
  text, public.governance_type, text, uuid, text, text, timestamptz, timestamptz,
  uuid, text, text, text, text, text, text, jsonb
) to authenticated, service_role;

revoke all on function public.update_governance_organization(
  uuid, text, public.governance_type, text, uuid, text, text, text, text,
  timestamptz, timestamptz, text, uuid, text, text, text, jsonb
) from public, anon;
grant execute on function public.update_governance_organization(
  uuid, text, public.governance_type, text, uuid, text, text, text, text,
  timestamptz, timestamptz, text, uuid, text, text, text, jsonb
) to authenticated, service_role;

commit;
