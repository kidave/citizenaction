begin;

alter table public.governance
  add column if not exists domain text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.governance'::regclass
      and conname = 'governance_domain_check'
  ) then
    alter table public.governance
      add constraint governance_domain_check
      check (domain is null or domain in ('politics', 'legislature', 'executive', 'judiciary'));
  end if;
end;
$$;

-- One-time backfill only. Future assignments are explicit and independent of type.
update public.governance
set domain = case
  when type::text = 'political_party' then 'politics'
  when type::text = 'legislature' then 'legislature'
  else 'executive'
end
where domain is null;

create index if not exists governance_domain_slug_idx on public.governance (domain, slug);
create index if not exists governance_domain_id_idx on public.governance (domain, id);

comment on column public.governance.domain is
  'Explicit governance domain: politics, legislature, executive, or judiciary. NULL means unassigned. Independent of governance.type and ISC classification.';

create or replace function public.create_governance_entity_with_domain(
  p_name text, p_type public.governance_type, p_domain text,
  p_short_name text default null, p_status text default 'active',
  p_valid_from timestamptz default now(), p_valid_to timestamptz default null,
  p_category_id uuid default null, p_image_url text default null,
  p_website text default null, p_email text default null, p_phone text default null,
  p_address text default null, p_description text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns public.governance
language plpgsql security definer
set search_path = public, pg_catalog
as $$
declare v_row public.governance;
begin
  perform public.require_governance_admin();
  if nullif(btrim(p_name),'') is null then raise exception 'Name is required.'; end if;
  if p_status not in ('active','inactive','deprecated') then raise exception 'Invalid governance status.'; end if;
  if p_valid_from is null then raise exception 'Valid from is required.'; end if;
  if p_valid_to is not null and p_valid_to<p_valid_from then raise exception 'Valid to cannot be earlier than valid from.'; end if;
  if p_status in ('inactive','deprecated') and p_valid_to is null then raise exception 'Valid to is required for inactive or deprecated entities.'; end if;
  if p_domain is not null and p_domain not in ('politics','legislature','executive','judiciary') then
    raise exception 'Invalid governance domain.';
  end if;

  insert into public.governance(
    type,name,short_name,description,website,email,phone,address,status,
    valid_from,valid_to,category_id,image_url,metadata,domain,created_by,updated_by
  )
  values(
    p_type,btrim(p_name),nullif(btrim(p_short_name),''),nullif(btrim(p_description),''),
    nullif(btrim(p_website),''),nullif(btrim(p_email),''),nullif(btrim(p_phone),''),
    nullif(btrim(p_address),''),p_status,p_valid_from,p_valid_to,p_category_id,
    nullif(btrim(p_image_url),''),coalesce(p_metadata,'{}'::jsonb),p_domain,auth.uid(),auth.uid()
  )
  returning * into v_row;
  return v_row;
end;
$$;

create or replace function public.update_governance_entity_with_domain(
  p_entity_id uuid, p_name text, p_domain text,
  p_short_name text default null, p_description text default null,
  p_website text default null, p_type public.governance_type default null,
  p_status text default 'active', p_valid_from timestamptz default null,
  p_valid_to timestamptz default null, p_image_url text default null,
  p_category_id uuid default null, p_email text default null,
  p_phone text default null, p_address text default null, p_metadata jsonb default null
)
returns public.governance
language plpgsql security definer
set search_path = public, pg_catalog
as $$
declare v_row public.governance;
begin
  perform public.require_governance_admin();
  if p_entity_id is null or not exists(select 1 from public.governance where id=p_entity_id) then
    raise exception 'Governance entity not found';
  end if;
  if nullif(btrim(p_name),'') is null then raise exception 'Name is required'; end if;
  if p_status not in ('active','inactive','deprecated') then raise exception 'Invalid governance status'; end if;
  if p_valid_from is null then raise exception 'Valid from is required'; end if;
  if p_valid_to is not null and p_valid_to<p_valid_from then raise exception 'Valid to cannot be earlier than valid from'; end if;
  if p_status in ('inactive','deprecated') and p_valid_to is null then raise exception 'Valid to is required for inactive or deprecated entities'; end if;
  if p_domain is not null and p_domain not in ('politics','legislature','executive','judiciary') then
    raise exception 'Invalid governance domain.';
  end if;

  update public.governance
  set name=btrim(p_name),short_name=nullif(btrim(p_short_name),''),
    description=nullif(btrim(p_description),''),website=nullif(btrim(p_website),''),
    email=nullif(btrim(p_email),''),phone=nullif(btrim(p_phone),''),
    address=nullif(btrim(p_address),''),type=coalesce(p_type,type),domain=p_domain,
    status=p_status,valid_from=p_valid_from,valid_to=p_valid_to,
    image_url=nullif(btrim(p_image_url),''),category_id=p_category_id,
    metadata=coalesce(p_metadata,metadata,'{}'::jsonb),
    updated_by=auth.uid(),updated_at=now()
  where id=p_entity_id
  returning * into v_row;
  return v_row;
end;
$$;

create or replace function public.get_governance_directory_by_domain(
  p_search text default null, p_tab text default 'organizations',
  p_type text default null, p_category_id uuid default null,
  p_geography_id uuid default null, p_organization_id uuid default null,
  p_limit integer default 100, p_domain text default null
)
returns table (
  id uuid, name text, short_name text, slug text, image_url text, type text,
  description text, status text, valid_from timestamptz, valid_to timestamptz,
  verification_status text, confidence numeric, parent_id uuid, parent_name text,
  parent_slug text, category_id uuid, category_name text, geography_id uuid,
  geography_name text, geography_type text, current_holder_name text,
  current_holder_id uuid, current_holder_started_at timestamptz,
  current_holder_image_url text
)
language plpgsql stable
set search_path = public, pg_catalog
as $$
begin
  if p_domain is not null and p_domain not in ('politics','legislature','executive','judiciary') then
    raise exception 'Invalid governance domain.';
  end if;
  return query
  select d.*
  from public.get_governance_directory(
    p_search,p_tab,p_type,p_category_id,p_geography_id,p_organization_id,p_limit
  ) d
  where
    (p_tab='organizations' and exists (
      select 1 from public.governance g where g.id=d.id and g.domain is not distinct from p_domain
    ))
    or (p_tab='people' and (
      (d.parent_id is null and p_domain is null)
      or exists (select 1 from public.governance g where g.id=d.parent_id and g.domain is not distinct from p_domain)
    ))
    or (p_tab='positions' and exists (
      select 1 from public.governance g where g.id=d.parent_id and g.domain is not distinct from p_domain
    ));
end;
$$;

create or replace function public.review_governance_contribution_with_domain(
  p_contribution_id uuid, p_status text, p_review_notes text default null,
  p_domain text default null, p_set_domain boolean default false
)
returns jsonb
language plpgsql security definer
set search_path = public, pg_catalog
as $function$
declare
  c public.governance_contribution;
  entity_id uuid;
  v_name text;
  v_slug text;
  v_short text;
  v_desc text;
  v_web text;
  v_image text;
  v_geom text;
  v_parent uuid;
  v_domain text;
  v_apply_domain boolean;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not exists(select 1 from public.profile where user_id=auth.uid() and role='admin') then
    raise exception 'Administrator access required';
  end if;
  if p_status not in ('approved','rejected') then raise exception 'Invalid review status'; end if;
  select * into c from public.governance_contribution where id=p_contribution_id;
  if not found then raise exception 'Contribution not found'; end if;
  if c.status<>'pending' then raise exception 'Contribution has already been reviewed'; end if;

  v_apply_domain := p_set_domain;
  if p_set_domain then v_domain:=p_domain; end if;
  if v_apply_domain and v_domain is not null
    and v_domain not in ('politics','legislature','executive','judiciary') then
    raise exception 'Invalid governance domain.';
  end if;

  if p_status='approved' then
    v_name=nullif(trim(c.proposed_changes->>'name'),'');
    v_slug=nullif(trim(c.proposed_changes->>'slug'),'');
    v_short=nullif(trim(c.proposed_changes->>'short_name'),'');
    v_desc=nullif(trim(c.proposed_changes->>'description'),'');
    v_web=nullif(trim(c.proposed_changes->>'website'),'');
    v_image=nullif(trim(c.proposed_changes->>'image_url'),'');
    v_geom=nullif(trim(c.proposed_changes->>'geom_geojson'),'');
    v_parent=c.proposed_parent_id;

    if c.action='add' then
      if v_name is null or c.proposed_type is null then raise exception 'Name and governance type are required'; end if;
      insert into public.governance(type,name,short_name,slug,description,website,image_url,parent_entity_id,domain,created_by,updated_by)
      values(c.proposed_type,v_name,v_short,v_slug,v_desc,v_web,v_image,v_parent,
        case when v_apply_domain then v_domain else null end,c.submitted_by,auth.uid())
      returning id into entity_id;
      if v_geom is not null then
        update public.governance set geom=st_multi(st_setsrid(st_geomfromgeojson(v_geom),4326)),
          updated_by=auth.uid(),updated_at=now() where id=entity_id;
      end if;
    elsif c.action='edit' then
      entity_id=c.proposed_governance_id;
      if entity_id is null then raise exception 'Governance record is required'; end if;
      update public.governance set
        name=coalesce(v_name,name),short_name=coalesce(v_short,short_name),
        slug=coalesce(v_slug,slug),description=coalesce(v_desc,description),
        website=coalesce(v_web,website),image_url=coalesce(v_image,image_url),
        parent_entity_id=coalesce(v_parent,parent_entity_id),
        domain=case when v_apply_domain then v_domain else domain end,
        updated_by=auth.uid(),updated_at=now()
      where id=entity_id;
      if not found then raise exception 'Governance record not found'; end if;
      if v_geom is not null then
        update public.governance set geom=st_multi(st_setsrid(st_geomfromgeojson(v_geom),4326)),
          updated_by=auth.uid(),updated_at=now() where id=entity_id;
      end if;
    elsif c.action='move' then
      entity_id=c.proposed_governance_id;
      if entity_id is null then raise exception 'Governance record is required'; end if;
      update public.governance set parent_entity_id=v_parent,updated_by=auth.uid(),updated_at=now()
      where id=entity_id;
      if not found then raise exception 'Governance record not found'; end if;
    elsif c.action='delete' then
      entity_id=c.proposed_governance_id;
      if entity_id is null then raise exception 'Governance record is required'; end if;
      delete from public.governance where id=entity_id;
      if not found then raise exception 'Governance record not found'; end if;
    end if;
  end if;

  update public.governance_contribution set status=p_status,reviewed_by=auth.uid(),
    reviewed_at=now(),review_notes=p_review_notes,updated_at=now()
  where id=p_contribution_id
  returning to_jsonb(governance_contribution.*) into c;
  return to_jsonb(c);
end;
$function$;

revoke all on function public.create_governance_entity_with_domain(text,public.governance_type,text,text,text,timestamptz,timestamptz,uuid,text,text,text,text,text,text,jsonb) from public,anon;
grant execute on function public.create_governance_entity_with_domain(text,public.governance_type,text,text,text,timestamptz,timestamptz,uuid,text,text,text,text,text,text,jsonb) to authenticated,service_role;
revoke all on function public.update_governance_entity_with_domain(uuid,text,text,text,text,text,public.governance_type,text,timestamptz,timestamptz,text,uuid,text,text,text,jsonb) from public,anon;
grant execute on function public.update_governance_entity_with_domain(uuid,text,text,text,text,text,public.governance_type,text,timestamptz,timestamptz,text,uuid,text,text,text,jsonb) to authenticated,service_role;
grant execute on function public.get_governance_directory_by_domain(text,text,text,uuid,uuid,uuid,integer,text) to anon,authenticated,service_role;
revoke all on function public.review_governance_contribution_with_domain(uuid,text,text,text,boolean) from public,anon;
grant execute on function public.review_governance_contribution_with_domain(uuid,text,text,text,boolean) to authenticated,service_role;

commit;
