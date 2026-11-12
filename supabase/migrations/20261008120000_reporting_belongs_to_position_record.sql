-- Move institutional reporting from appointments to positions.
alter table public.position
  add column if not exists reports_to_position_id uuid;

update public.position p
set reports_to_position_id = source.reports_to_position_id
from (
  select distinct on (pa.position_id)
    pa.position_id,
    pa.reports_to_position_id
  from public.position_appointment pa
  where pa.reports_to_position_id is not null
  order by pa.position_id, pa.is_primary desc, pa.started_at desc, pa.id desc
) source
where p.id = source.position_id
  and p.reports_to_position_id is null;

alter table public.position
  drop constraint if exists position_reports_to_position_id_fkey;

alter table public.position
  add constraint position_reports_to_position_id_fkey
  foreign key (reports_to_position_id)
  references public.position(id)
  on delete set null;

create or replace function public.validate_position_reporting_relationship()
returns trigger
language plpgsql
as $$
declare
  v_reporting_org uuid;
begin
  if new.reports_to_position_id is null then
    return new;
  end if;

  if new.reports_to_position_id = new.id then
    raise exception 'A position cannot report to itself.';
  end if;

  select appointing_organization_id into v_reporting_org
  from public.position
  where id = new.reports_to_position_id;

  if not found then
    raise exception 'Reporting position not found.';
  end if;

  if v_reporting_org is distinct from new.appointing_organization_id then
    raise exception 'Reporting position must belong to the same organization.';
  end if;

  return new;
end;
$$;

drop trigger if exists position_reporting_relationship_trigger on public.position;
create trigger position_reporting_relationship_trigger
before insert or update of appointing_organization_id, reports_to_position_id
on public.position
for each row
execute function public.validate_position_reporting_relationship();

alter table public.position_appointment
  drop constraint if exists position_appointment_reports_to_position_id_fkey;
alter table public.position_appointment
  drop column if exists reports_to_position_id;

drop function if exists public.create_position(text,text,text,uuid,jsonb,uuid);

create or replace function public.create_position(
  p_name text,
  p_description text default null,
  p_image_url text default null,
  p_category_id uuid default null,
  p_metadata jsonb default '{}'::jsonb,
  p_appointing_organization_id uuid default null,
  p_reports_to_position_id uuid default null
) returns public.position
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.position;
  v_slug text;
  v_base_slug text;
  v_counter integer := 1;
begin
  perform public.require_governance_admin();
  if nullif(btrim(p_name), '') is null then raise exception 'Position name is required'; end if;

  if p_appointing_organization_id is null
     or not exists (select 1 from public.governance where id = p_appointing_organization_id) then
    raise exception 'Appointing organization is required.';
  end if;

  if p_reports_to_position_id is not null
     and not exists (
       select 1 from public.position
       where id = p_reports_to_position_id
         and appointing_organization_id = p_appointing_organization_id
     ) then
    raise exception 'Reporting position not found in this organization.';
  end if;

  v_base_slug := public.slugify(btrim(p_name));
  if v_base_slug = '' then v_base_slug := 'position'; end if;
  v_slug := v_base_slug;

  while exists (select 1 from public.position where slug = v_slug) loop
    v_slug := v_base_slug || '-' || v_counter;
    v_counter := v_counter + 1;
  end loop;

  insert into public.position(
    name,slug,description,image_url,category_id,metadata,
    appointing_organization_id,reports_to_position_id,created_by,updated_by
  )
  values(
    btrim(p_name),v_slug,nullif(btrim(p_description),''),
    nullif(btrim(p_image_url),''),p_category_id,coalesce(p_metadata,'{}'::jsonb),
    p_appointing_organization_id,p_reports_to_position_id,auth.uid(),auth.uid()
  )
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.create_position(text,text,text,uuid,jsonb,uuid,uuid) to authenticated;
revoke execute on function public.create_position(text,text,text,uuid,jsonb,uuid,uuid) from anon, public;

drop function if exists public.update_position(uuid,text,text,text,uuid,uuid,jsonb);

create or replace function public.update_position(
  p_position_id uuid,
  p_name text,
  p_description text default null,
  p_image_url text default null,
  p_category_id uuid default null,
  p_metadata jsonb default null,
  p_reports_to_position_id uuid default null
) returns public.position
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.position;
  v_organization_id uuid;
begin
  perform public.require_governance_admin();
  if nullif(btrim(p_name), '') is null then raise exception 'Position name is required'; end if;

  select appointing_organization_id into v_organization_id
  from public.position where id = p_position_id;
  if not found then raise exception 'Position not found'; end if;

  if p_reports_to_position_id is not null
     and not exists (
       select 1 from public.position
       where id = p_reports_to_position_id
         and appointing_organization_id = v_organization_id
     ) then
    raise exception 'Reporting position not found in this organization.';
  end if;

  update public.position
  set name=btrim(p_name),
      description=nullif(btrim(p_description),''),
      image_url=nullif(btrim(p_image_url),''),
      category_id=p_category_id,
      reports_to_position_id=p_reports_to_position_id,
      metadata=coalesce(p_metadata,metadata),
      updated_by=auth.uid(),
      updated_at=now()
  where id=p_position_id
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.update_position(uuid,text,text,text,uuid,jsonb,uuid) to authenticated;
revoke execute on function public.update_position(uuid,text,text,text,uuid,jsonb,uuid) from anon, public;

create or replace function public.get_governance_organization_context(
  p_governance_id uuid,
  p_at timestamptz default now()
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with recursive orgs as (
    select g.id,g.name,g.slug,g.type::text as type,g.short_name,g.description,
           g.image_url,g.website,g.parent_entity_id,g.geography_id,0 as depth
    from public.governance g where g.id=p_governance_id
    union all
    select g.id,g.name,g.slug,g.type::text as type,g.short_name,g.description,
           g.image_url,g.website,g.parent_entity_id,g.geography_id,o.depth+1
    from public.governance g join orgs o on g.parent_entity_id=o.id
  ),
  current_appointments as (
    select pa.id as appointment_id,pa.organization_id,pa.position_id,
           pos.name as position_name,pos.slug as position_slug,pos.image_url as position_avatar_url,
           pa.person_id,per.name as person_name,per.slug as person_slug,per.image_url as person_avatar_url,
           pos.reports_to_position_id,pa.is_vacant,pa.is_primary,pa.started_at,pa.ended_at
    from public.position_appointment pa
    join orgs o on o.id=pa.organization_id
    left join public.position pos on pos.id=pa.position_id
    left join public.person per on per.id=pa.person_id
    where pa.started_at<=p_at and (pa.ended_at is null or pa.ended_at>=p_at)
  )
  select jsonb_build_object(
    'organizations',coalesce((
      select jsonb_agg(jsonb_build_object(
        'id',o.id,'name',o.name,'slug',o.slug,'type',o.type,'short_name',o.short_name,
        'description',o.description,'image_url',o.image_url,'website',o.website,
        'parent_entity_id',o.parent_entity_id,'geography_id',o.geography_id,'depth',o.depth,
        'position_count',(select count(*) from current_appointments a where a.organization_id=o.id),
        'filled_position_count',(select count(*) from current_appointments a where a.organization_id=o.id and not a.is_vacant and a.person_id is not null)
      ) order by o.depth,o.name) from orgs o
    ),'[]'::jsonb),
    'appointments',coalesce((
      select jsonb_agg(jsonb_build_object(
        'appointment_id',a.appointment_id,'organization_id',a.organization_id,'position_id',a.position_id,
        'position_name',a.position_name,'position_slug',a.position_slug,'position_avatar_url',a.position_avatar_url,
        'person_id',a.person_id,'person_name',a.person_name,'person_slug',a.person_slug,'person_avatar_url',a.person_avatar_url,
        'reports_to_position_id',a.reports_to_position_id,'is_vacant',a.is_vacant,'is_primary',a.is_primary,
        'started_at',a.started_at,'ended_at',a.ended_at,'organization_name',org.name,'organization_slug',org.slug,
        'organization_depth',org.depth,
        'reports_to',case when rt.appointment_id is null then null else jsonb_build_object(
          'appointment_id',rt.appointment_id,'position_id',rt.position_id,'position_name',rt.position_name,
          'person_id',rt.person_id,'person_name',rt.person_name,'organization_id',rt.organization_id,
          'organization_name',rorg.name,'organization_slug',rorg.slug
        ) end
      ) order by org.depth,a.position_name,a.person_name)
      from current_appointments a
      join orgs org on org.id=a.organization_id
      left join lateral (
        select rt.* from current_appointments rt
        where rt.position_id=a.reports_to_position_id
        order by rt.is_primary desc,rt.started_at desc,rt.appointment_id desc
        limit 1
      ) rt on true
      left join orgs rorg on rorg.id=rt.organization_id
    ),'[]'::jsonb)
  );
$$;

grant execute on function public.get_governance_organization_context(uuid,timestamptz) to anon, authenticated;
revoke execute on function public.get_governance_organization_context(uuid,timestamptz) from public;
notify pgrst,'reload schema';
