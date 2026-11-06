-- is_primary is retained for backward compatibility only. Current appointment selection is based on active dates and most recent start date.
drop trigger if exists position_principal_appointment_trigger on public.position_appointment;
drop function if exists public.validate_position_principal_appointment();

CREATE OR REPLACE FUNCTION public.create_person_appointment(p_organization_id uuid, p_position_id uuid, p_started_at timestamp with time zone, p_name text, p_biography text DEFAULT NULL::text, p_website text DEFAULT NULL::text, p_image_url text DEFAULT NULL::text, p_profile_user_id uuid DEFAULT NULL::uuid, p_ended_at timestamp with time zone DEFAULT NULL::timestamp with time zone, p_is_primary boolean DEFAULT true, p_notes text DEFAULT NULL::text)
 RETURNS position_appointment
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_person public.person; v_row public.position_appointment;
begin
 perform public.require_governance_admin();
 if nullif(btrim(p_name),'') is null then raise exception 'Person name is required'; end if;
 if p_organization_id is null or not exists(select 1 from public.governance where id=p_organization_id) then raise exception 'Organization not found.'; end if;
 if p_position_id is null or not exists(select 1 from public.position where id=p_position_id and appointing_organization_id=p_organization_id) then raise exception 'Position not found in this organization.'; end if;
 if p_started_at is null then raise exception 'Start date is required.'; end if;
 if p_ended_at is not null and p_ended_at<p_started_at then raise exception 'End date cannot be earlier than start date.'; end if;
 if exists(select 1 from public.position_appointment pa join public.person p on p.id=pa.person_id where pa.position_id=p_position_id and pa.person_id is not null and (pa.started_at at time zone 'UTC')::date=(p_started_at at time zone 'UTC')::date and lower(btrim(p.name))=lower(btrim(p_name))) then raise exception 'This person is already assigned to this position on the selected start date.'; end if;
 v_person:=public.create_person(p_name,p_biography,p_website,p_image_url,p_profile_user_id,'{}'::jsonb);
 insert into public.position_appointment(organization_id,position_id,person_id,started_at,ended_at,is_vacant,notes,created_by,updated_by)
 values(p_organization_id,p_position_id,v_person.id,p_started_at,p_ended_at,false,nullif(btrim(p_notes),''),auth.uid(),auth.uid()) returning * into v_row;
 return v_row;
end; $function$
;

CREATE OR REPLACE FUNCTION public.get_governance_directory(p_search text DEFAULT NULL::text, p_tab text DEFAULT 'organizations'::text, p_type text DEFAULT NULL::text, p_category_id uuid DEFAULT NULL::uuid, p_geography_id uuid DEFAULT NULL::uuid, p_organization_id uuid DEFAULT NULL::uuid, p_limit integer DEFAULT 100)
 RETURNS TABLE(id uuid, name text, short_name text, slug text, image_url text, type text, description text, status text, valid_from timestamp with time zone, valid_to timestamp with time zone, verification_status text, confidence numeric, parent_id uuid, parent_name text, parent_slug text, category_id uuid, category_name text, geography_id uuid, geography_name text, geography_type text, current_holder_name text, current_holder_id uuid, current_holder_started_at timestamp with time zone, current_holder_image_url text)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'pg_catalog'
AS $function$
with recursive selected_geography as (
  select id, geography_type, country_code
  from public.geographies
  where p_geography_id is not null and id = p_geography_id
),
geography_tree as (
  select id from selected_geography
  union all
  select child.id
  from public.geographies child
  join geography_tree parent on child.parent_id = parent.id
),
geography_scope as (
  select id from geography_tree
  union
  select g.id
  from public.geographies g
  join selected_geography s
    on s.geography_type = 'country'
   and g.country_code = s.country_code
),
params as (
  select btrim(coalesce(p_search,'')) as q
),
organization_rows as (
  select
    g.id,g.name,g.short_name,g.slug,g.image_url,g.type::text,g.description,
    g.status,g.valid_from,g.valid_to,g.verification_status::text,g.confidence,
    g.parent_entity_id as parent_id,p.name as parent_name,p.slug as parent_slug,
    c.id as category_id,c.name as category_name,g.geography_id,
    geo.name as geography_name,geo.geography_type,
    ca.person_name as current_holder_name,ca.person_id as current_holder_id,
    ca.started_at as current_holder_started_at,
    ca.person_image_url as current_holder_image_url
  from public.governance g
  left join public.governance p on p.id=g.parent_entity_id
  left join public.category c on c.id=g.category_id
  left join public.geographies geo on geo.id=g.geography_id
  left join lateral (
    select pr.name person_name,pa.person_id,pa.started_at,pr.image_url person_image_url
    from public.position_appointment pa
    join public.person pr on pr.id=pa.person_id
    where pa.organization_id=g.id
      and pa.is_vacant=false
      and pa.started_at<=now()
      and (pa.ended_at is null or pa.ended_at>=now())
    order by pa.started_at desc nulls last,pa.id desc
    limit 1
  ) ca on true
  cross join params
  where p_tab='organizations'
    and coalesce(g.status,'active')<>'deleted'
    and (p_type is null or p_type='' or g.type::text=p_type)
    and (p_category_id is null or g.category_id=p_category_id)
    and (p_geography_id is null or g.geography_id in (select id from geography_scope))
    and (
      params.q=''
      or g.name ilike '%'||params.q||'%'
      or coalesce(g.short_name,'') ilike '%'||params.q||'%'
    )
),
position_rows as (
  select
    pos.id,pos.name,null::text as short_name,pos.slug,org.image_url,
    'position'::text as type,pos.description,'active'::text as status,
    null::timestamptz as valid_from,null::timestamptz as valid_to,
    'unverified'::text as verification_status,null::numeric as confidence,
    pos.appointing_organization_id as parent_id,org.name as parent_name,
    org.slug as parent_slug,cat.id as category_id,cat.name as category_name,
    org.geography_id,geo.name as geography_name,geo.geography_type,
    holder.person_name as current_holder_name,holder.person_id as current_holder_id,
    holder.started_at as current_holder_started_at,
    holder.person_image_url as current_holder_image_url
  from public.position pos
  left join public.governance org on org.id=pos.appointing_organization_id
  left join public.category cat on cat.id=pos.category_id
  left join public.geographies geo on geo.id=org.geography_id
  left join lateral (
    select pr.name person_name,pa.person_id,pa.started_at,pr.image_url person_image_url
    from public.position_appointment pa
    join public.person pr on pr.id=pa.person_id
    where pa.position_id=pos.id
      and pa.is_vacant=false
      and pa.started_at<=now()
      and (pa.ended_at is null or pa.ended_at>=now())
    order by pa.started_at desc nulls last,pa.id desc
    limit 1
  ) holder on true
  cross join params
  where p_tab='positions'
    and (p_organization_id is null or pos.appointing_organization_id=p_organization_id)
    and (p_geography_id is null or org.geography_id in (select id from geography_scope))
    and (params.q='' or pos.name ilike '%'||params.q||'%')
),
people_rows as (
  select
    pr.id,pr.name,null::text as short_name,pr.slug,pr.image_url,
    'person'::text as type,pr.biography as description,'active'::text as status,
    null::timestamptz as valid_from,null::timestamptz as valid_to,
    'unverified'::text as verification_status,null::numeric as confidence,
    latest.organization_id as parent_id,org.name as parent_name,
    org.slug as parent_slug,null::uuid as category_id,null::text as category_name,
    org.geography_id,geo.name as geography_name,geo.geography_type,
    pos.name as current_holder_name,pr.id as current_holder_id,
    latest.started_at as current_holder_started_at,
    pr.image_url as current_holder_image_url
  from public.person pr
  left join lateral (
    select pa.organization_id,pa.position_id,pa.started_at
    from public.position_appointment pa
    where pa.person_id=pr.id
      and pa.is_vacant=false
      and pa.started_at<=now()
      and (pa.ended_at is null or pa.ended_at>=now())
      and (p_organization_id is null or pa.organization_id=p_organization_id)
    order by pa.started_at desc nulls last,pa.id desc
    limit 1
  ) latest on true
  left join public.governance org on org.id=latest.organization_id
  left join public.position pos on pos.id=latest.position_id
  left join public.geographies geo on geo.id=org.geography_id
  cross join params
  where p_tab='people'
    and (
      p_organization_id is null
      or exists (
        select 1
        from public.position_appointment pa_filter
        where pa_filter.person_id=pr.id
          and pa_filter.organization_id=p_organization_id
          and pa_filter.is_vacant=false
          and pa_filter.started_at<=now()
          and (pa_filter.ended_at is null or pa_filter.ended_at>=now())
      )
    )
    and (
      p_geography_id is null
      or latest.organization_id is null
      or org.geography_id in (select id from geography_scope)
    )
    and (params.q='' or pr.name ilike '%'||params.q||'%')
),
all_rows as (
  select * from organization_rows
  union all select * from position_rows
  union all select * from people_rows
)
select
  ar.id,ar.name,ar.short_name,ar.slug,ar.image_url,ar.type,ar.description,
  ar.status,ar.valid_from,ar.valid_to,ar.verification_status,ar.confidence,
  ar.parent_id,ar.parent_name,ar.parent_slug,ar.category_id,ar.category_name,
  ar.geography_id,ar.geography_name,ar.geography_type,ar.current_holder_name,
  ar.current_holder_id,ar.current_holder_started_at,ar.current_holder_image_url
from all_rows ar
order by ar.name
limit greatest(1,least(coalesce(p_limit,100),50000));
$function$
;

CREATE OR REPLACE FUNCTION public.get_governance_leader_at(p_entity_id uuid, p_at timestamp with time zone DEFAULT now())
 RETURNS TABLE(id uuid, person_id uuid, person_name text, person_profile_user_id uuid, person_avatar_url text, position_id uuid, position_name text, started_at timestamp with time zone, ended_at timestamp with time zone, is_vacant boolean)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'pg_catalog'
AS $function$
  select pa.id,pa.person_id,pr.name,pr.profile_user_id,pr.image_url,pa.position_id,pos.name,pa.started_at,pa.ended_at,pa.is_vacant
  from public.position_appointment pa
  left join public.person pr on pr.id=pa.person_id
  left join public.position pos on pos.id=pa.position_id
  where pa.organization_id=p_entity_id
    and pa.started_at<=p_at
    and (pa.ended_at is null or pa.ended_at>=p_at)
  order by pa.started_at desc nulls last,pa.id desc
  limit 1;
$function$
;

CREATE OR REPLACE FUNCTION public.get_governance_organization_context(p_governance_id uuid, p_at timestamp with time zone DEFAULT now())
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with recursive orgs as (
    select g.id, g.name, g.slug, g.type::text as type, g.short_name, g.description,
           g.image_url, g.website, g.parent_entity_id, g.geography_id, 0 as depth
    from public.governance g
    where g.id = p_governance_id

    union all

    select g.id, g.name, g.slug, g.type::text as type, g.short_name, g.description,
           g.image_url, g.website, g.parent_entity_id, g.geography_id, o.depth + 1
    from public.governance g
    join orgs o on g.parent_entity_id = o.id
  ),
  current_appointments as (
    select
      pa.id as appointment_id,
      pa.organization_id,
      pa.position_id,
      pos.name as position_name,
      pos.slug as position_slug,
      pos.image_url as position_avatar_url,
      pa.person_id,
      per.name as person_name,
      per.slug as person_slug,
      per.image_url as person_avatar_url,
      pos.reports_to_position_id,
      pa.is_vacant,
      pa.is_primary,
      pa.started_at,
      pa.ended_at
    from public.position_appointment pa
    join orgs o on o.id = pa.organization_id
    left join public.position pos on pos.id = pa.position_id
    left join public.person per on per.id = pa.person_id
    where pa.started_at <= p_at
      and (pa.ended_at is null or pa.ended_at >= p_at)
  )
  select jsonb_build_object(
    'organizations', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', o.id,
          'name', o.name,
          'slug', o.slug,
          'type', o.type,
          'short_name', o.short_name,
          'description', o.description,
          'image_url', o.image_url,
          'website', o.website,
          'parent_entity_id', o.parent_entity_id,
          'geography_id', o.geography_id,
          'depth', o.depth,
          'position_count', (select count(*) from current_appointments a where a.organization_id = o.id),
          'filled_position_count', (select count(*) from current_appointments a where a.organization_id = o.id and not a.is_vacant and a.person_id is not null)
        ) order by o.depth, o.name
      ) from orgs o
    ), '[]'::jsonb),
    'appointments', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'appointment_id', a.appointment_id,
          'organization_id', a.organization_id,
          'position_id', a.position_id,
          'position_name', a.position_name,
          'position_slug', a.position_slug,
          'position_avatar_url', a.position_avatar_url,
          'person_id', a.person_id,
          'person_name', a.person_name,
          'person_slug', a.person_slug,
          'person_avatar_url', a.person_avatar_url,
          'reports_to_position_id', a.reports_to_position_id,
          'is_vacant', a.is_vacant,
          'is_primary', a.is_primary,
          'started_at', a.started_at,
          'ended_at', a.ended_at,
          'organization_name', org.name,
          'organization_slug', org.slug,
          'organization_depth', org.depth,
          'reports_to', case when rt.appointment_id is null then null else jsonb_build_object(
            'appointment_id', rt.appointment_id,
            'position_id', rt.position_id,
            'position_name', rt.position_name,
            'person_id', rt.person_id,
            'person_name', rt.person_name,
            'organization_id', rt.organization_id,
            'organization_name', rorg.name,
            'organization_slug', rorg.slug
          ) end
        ) order by org.depth, a.position_name, a.person_name
      )
      from current_appointments a
      join orgs org on org.id = a.organization_id
      left join lateral (
        select rt.*
        from current_appointments rt
        where rt.position_id = a.reports_to_position_id
        order by rt.started_at desc nulls last, rt.appointment_id desc
        limit 1
      ) rt on true
      left join orgs rorg on rorg.id = rt.organization_id
    ), '[]'::jsonb)
  );
$function$
;

CREATE OR REPLACE FUNCTION public.get_governance_people_at(p_entity_id uuid, p_at timestamp with time zone DEFAULT now())
 RETURNS TABLE(relationship_id uuid, appointment_id uuid, person_id uuid, person_name text, position_id uuid, position_name text, organization_id uuid, organization_name text, start_at timestamp with time zone, end_at timestamp with time zone, confidence numeric, verification_status governance_verification_status)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'pg_catalog'
AS $function$
  select pa.id,pa.id,pa.person_id,pr.name,pa.position_id,pos.name,pa.organization_id,g.name,pa.started_at,pa.ended_at,g.confidence,g.verification_status
  from public.position_appointment pa
  join public.governance g on g.id=pa.organization_id
  left join public.person pr on pr.id=pa.person_id
  left join public.position pos on pos.id=pa.position_id
  where pa.organization_id=p_entity_id
    and pa.started_at<=p_at
    and (pa.ended_at is null or pa.ended_at>=p_at)
  order by pa.started_at desc nulls last,pa.id desc;
$function$
;

CREATE OR REPLACE FUNCTION public.get_organization_tree(p_governance_id uuid, p_at timestamp with time zone DEFAULT now())
 RETURNS TABLE(id uuid, organization_id uuid, parent_id uuid, position_id uuid, position_name text, position_avatar_url text, person_id uuid, person_name text, person_profile_user_id uuid, person_avatar_url text, is_vacant boolean, is_primary boolean, started_at timestamp with time zone, ended_at timestamp with time zone)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'pg_catalog'
AS $function$
  select pa.id,pa.organization_id,pos.reports_to_position_id,pa.position_id,pos.name,pos.image_url,
         pa.person_id,pr.name,pr.profile_user_id,pr.image_url,pa.is_vacant,pa.is_primary,pa.started_at,pa.ended_at
  from public.position_appointment pa
  left join public.position pos on pos.id=pa.position_id
  left join public.person pr on pr.id=pa.person_id
  where pa.organization_id=p_governance_id
    and pa.started_at<=p_at
    and (pa.ended_at is null or pa.ended_at>=p_at)
  order by pos.name,pa.started_at desc nulls last,pa.id desc,pr.name;
$function$
;

CREATE OR REPLACE FUNCTION public.get_post_public_context(p_post_id uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
with post_context as (
  select p.id, coalesce(p.start_at, p.created_at) as context_at
  from public.post p
  where p.id = p_post_id
),
categories as (
  select coalesce(jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'source_type', pc.source_type, 'confidence', pc.confidence) order by c.sort_order nulls last, c.name), '[]'::jsonb) as value
  from public.post_category pc join public.category c on c.id = pc.category_id where pc.post_id = p_post_id
),
geography as (
  select coalesce(jsonb_agg(jsonb_build_object('id', g.id, 'name', coalesce(nullif(g.official_name, ''), g.name), 'geography_type', g.geography_type, 'relationship_type', pg.relationship_type, 'source_type', pg.source_type, 'confidence', pg.confidence, 'osm_type', g.osm_type, 'osm_id', g.osm_id, 'geojson', case when g.geom is null then null else st_asgeojson(g.geom)::jsonb end) order by case when pg.relationship_type = 'district' or pg.source_type = 'address' then 0 else 1 end, g.name), '[]'::jsonb) as value
  from public.post_geography pg join public.geographies g on g.id = pg.geography_id where pg.post_id = p_post_id
),
governance_rows as (
  select distinct on (g.id) g.id, g.name, g.short_name, g.image_url, g.address, g.lat, g.lng, g.geography_id,
    gg.id as jurisdiction_id, coalesce(nullif(gg.official_name, ''), gg.name) as jurisdiction_name, gg.geography_type as jurisdiction_type, gg.osm_type as jurisdiction_osm_type, gg.osm_id as jurisdiction_osm_id,
    case when gg.geom is null then null else st_asgeojson(gg.geom)::jsonb end as jurisdiction_geojson
  from public.post_governance pg join public.governance g on g.id = pg.governance_id left join public.geographies gg on gg.id = g.geography_id
  where pg.post_id = p_post_id order by g.id
),
governance_context as (
  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'name', name, 'short_name', short_name, 'image_url', image_url, 'address', address, 'office_lat', lat, 'office_lng', lng, 'jurisdiction', case when jurisdiction_id is null then null else jsonb_build_object('id', jurisdiction_id, 'name', jurisdiction_name, 'geography_type', jurisdiction_type, 'osm_type', jurisdiction_osm_type, 'osm_id', jurisdiction_osm_id, 'geojson', jurisdiction_geojson) end) order by name), '[]'::jsonb) as value
  from governance_rows
),
person_rows as (
  select pe.id, pe.name, pe.image_url, pp.mention_text, pp.relationship_type, pos.name as position_name,
    org.id as organization_id, org.name as organization_name, org.short_name as organization_short_name, org.image_url as organization_image_url, org.address as organization_address, org.lat as organization_lat, org.lng as organization_lng, org.geography_id as organization_geography_id
  from public.post_person pp join public.person pe on pe.id = pp.person_id cross join post_context pc
  left join lateral (select pa.position_id from public.position_appointment pa where pa.person_id = pe.id and pa.started_at <= pc.context_at and (pa.ended_at is null or pa.ended_at >= pc.context_at) order by pa.started_at desc nulls last,pa.id desc limit 1) appointment on true
  left join public.position pos on pos.id = appointment.position_id left join public.governance org on org.id = pos.appointing_organization_id where pp.post_id = p_post_id
),
person_context as (
  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'name', name, 'image_url', image_url, 'mention_text', mention_text, 'relationship_type', relationship_type, 'position_name', position_name, 'organization', case when organization_id is null then null else jsonb_build_object('id', organization_id, 'name', organization_name, 'short_name', organization_short_name, 'image_url', organization_image_url, 'address', organization_address, 'office_lat', organization_lat, 'office_lng', organization_lng, 'jurisdiction', case when organization_geography_id is null then null else (select jsonb_build_object('id', gg.id, 'name', coalesce(nullif(gg.official_name, ''), gg.name), 'geography_type', gg.geography_type, 'osm_type', gg.osm_type, 'osm_id', gg.osm_id, 'geojson', case when gg.geom is null then null else st_asgeojson(gg.geom)::jsonb end) from public.geographies gg where gg.id = organization_geography_id) end) end) order by name), '[]'::jsonb) as value
  from person_rows
)
select jsonb_build_object('categories', (select value from categories), 'geography', (select value from geography), 'governance', (select value from governance_context), 'people', (select value from person_context));
$function$
;

CREATE OR REPLACE FUNCTION public.resolve_post_context(p_post_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  p public.post%rowtype;
  v_point geometry;
  v_district public.geographies%rowtype;
  v_person record;
  v_org record;
  v_cat record;
  v_space record;
  v_appointment record;
  v_text text;
  v_when timestamptz;
begin
  select * into p from public.post where id = p_post_id;
  if not found then raise exception 'Post not found'; end if;
  if auth.uid() is not null and p.author_id <> auth.uid() then raise exception 'Not allowed'; end if;

  v_text := lower(coalesce(p.title,'') || E'\n' || coalesce(p.content,''));
  v_when := coalesce(p.start_at,p.created_at,now());

  for v_person in
    select pe.id, pe.name
    from public.person pe
    where nullif(trim(pe.name),'') is not null
      and v_text like '%' || lower(pe.name) || '%'
    order by length(pe.name) desc
    limit 50
  loop
    select pa.id,pa.position_id,pa.organization_id,pa.started_at,pa.ended_at,
           pos.name position_name,pos.category_id position_category_id,
           org.name organization_name,org.short_name organization_short_name
    into v_appointment
    from public.position_appointment pa
    left join public.position pos on pos.id=pa.position_id
    left join public.governance org on org.id=pa.organization_id
    where pa.person_id=v_person.id
      and pa.started_at<=v_when
      and (pa.ended_at is null or pa.ended_at>=v_when)
    order by pa.started_at desc nulls last,pa.id desc
    limit 1;

    insert into public.post_person(post_id,person_id,mention_text,source_type,confidence,relationship_type,source_snapshot,resolved_at)
    values(p.id,v_person.id,v_person.name,'content',0.95,'mentioned',jsonb_build_object(
      'method','name_match','as_of',v_when,'appointment_id',v_appointment.id,
      'position_id',v_appointment.position_id,'position_name',v_appointment.position_name,
      'organization_id',v_appointment.organization_id,'organization_name',v_appointment.organization_name,
      'organization_short_name',v_appointment.organization_short_name
    ),now())
    on conflict(post_id,person_id,relationship_type) do update set
      mention_text=excluded.mention_text,confidence=excluded.confidence,
      source_snapshot=excluded.source_snapshot,resolved_at=excluded.resolved_at;

    if v_appointment.organization_id is not null then
      insert into public.post_governance(post_id,governance_id,relationship_type,resolved_at,resolution_version,source_snapshot)
      values(p.id,v_appointment.organization_id,'associated',now(),1,jsonb_build_object(
        'method','person_appointment','person_id',v_person.id,'as_of',v_when,'appointment_id',v_appointment.id
      ))
      on conflict(post_id,governance_id) do nothing;
    end if;
  end loop;

  for v_org in
    select g.id,g.name,g.short_name,g.category_id,g.geography_id
    from public.governance g
    where (g.name is not null and v_text like '%' || lower(g.name) || '%')
       or (g.short_name is not null and v_text like '%' || lower(g.short_name) || '%')
    order by greatest(length(coalesce(g.name,'')),length(coalesce(g.short_name,''))) desc
    limit 50
  loop
    insert into public.post_governance(post_id,governance_id,relationship_type,resolved_at,resolution_version,source_snapshot)
    values(p.id,v_org.id,'mentioned',now(),1,jsonb_build_object(
      'method','organization_name_or_short_name','name',v_org.name,'short_name',v_org.short_name
    ))
    on conflict(post_id,governance_id) do nothing;
  end loop;

  -- Strong category signals: user-selected Space, linked Governance and a resolved Person position.
  for v_space in
    select s.category_id
    from public.space s
    join public.post_space ps on ps.space_id=s.id
    where ps.post_id=p.id and s.category_id is not null
  loop
    insert into public.post_category(post_id,category_id,source_type,confidence,source_snapshot,resolved_at)
    values(p.id,v_space.category_id,'space',0.85,jsonb_build_object('method','space_category'),now())
    on conflict(post_id,category_id,source_type) do update set
      confidence=greatest(public.post_category.confidence,excluded.confidence),resolved_at=excluded.resolved_at;
  end loop;

  for v_org in
    select g.category_id
    from public.governance g
    join public.post_governance pg on pg.governance_id=g.id
    where pg.post_id=p.id and g.category_id is not null
  loop
    insert into public.post_category(post_id,category_id,source_type,confidence,source_snapshot,resolved_at)
    values(p.id,v_org.category_id,'governance',0.80,jsonb_build_object('method','governance_category'),now())
    on conflict(post_id,category_id,source_type) do update set
      confidence=greatest(public.post_category.confidence,excluded.confidence),resolved_at=excluded.resolved_at;
  end loop;

  for v_person in
    select distinct pos.category_id
    from public.post_person pp
    join public.position_appointment pa on pa.person_id=pp.person_id
    join public.position pos on pos.id=pa.position_id
    where pp.post_id=p.id
      and pos.category_id is not null
      and pa.started_at<=v_when
      and (pa.ended_at is null or pa.ended_at>=v_when)
  loop
    insert into public.post_category(post_id,category_id,source_type,confidence,source_snapshot,resolved_at)
    values(p.id,v_person.category_id,'person-position',0.70,jsonb_build_object('method','person_position','as_of',v_when),now())
    on conflict(post_id,category_id,source_type) do update set
      confidence=greatest(public.post_category.confidence,excluded.confidence),resolved_at=excluded.resolved_at;
  end loop;

  -- Keywords are a weak enrichment signal. Do not create another row when a stronger
  -- Space/Governance/Person signal already established the same category.
  for v_cat in
    select ck.category_id,max(ck.weight) weight,array_agg(ck.keyword) keywords,count(*) keyword_count
    from public.category_keyword ck
    where ck.keyword<>'' and v_text like '%' || lower(ck.keyword) || '%'
    group by ck.category_id
  loop
    if not exists (
      select 1 from public.post_category pc
      where pc.post_id=p.id
        and pc.category_id=v_cat.category_id
        and pc.source_type in ('space','governance','person-position')
    ) then
      insert into public.post_category(post_id,category_id,source_type,confidence,source_snapshot,resolved_at)
      values(
        p.id,v_cat.category_id,'content',
        least(1,greatest(0,case when v_cat.keyword_count >= 2 then greatest(v_cat.weight,0.70) else least(v_cat.weight,0.60) end)),
        jsonb_build_object('method','keyword','keywords',v_cat.keywords,'keyword_count',v_cat.keyword_count),now()
      )
      on conflict(post_id,category_id,source_type) do update set
        confidence=greatest(public.post_category.confidence,excluded.confidence),
        source_snapshot=excluded.source_snapshot,resolved_at=excluded.resolved_at;
    end if;
  end loop;

  if p.lat is not null and p.lng is not null then
    v_point := ST_SetSRID(ST_Point(p.lng,p.lat),4326);
    select * into v_district
    from public.geographies g
    where g.geography_type='district' and g.geom is not null and ST_Covers(g.geom,v_point)
    order by ST_Area(g.geom) asc limit 1;

    if v_district.id is not null then
      insert into public.post_geography(post_id,geography_id,relationship_type,source_type,source_id,confidence,source_snapshot,resolved_at)
      values(p.id,v_district.id,'district','address',null,0.98,jsonb_build_object(
        'method','point_in_district','lat',p.lat,'lng',p.lng,'address',p.address
      ),now())
      on conflict(post_id,geography_id,relationship_type,source_type) do update set
        confidence=excluded.confidence,source_snapshot=excluded.source_snapshot,resolved_at=excluded.resolved_at;
    end if;
  end if;

  for v_org in
    select distinct g.id,g.geography_id
    from public.governance g
    join public.post_governance pg on pg.governance_id=g.id
    where pg.post_id=p.id and g.geography_id is not null
  loop
    insert into public.post_geography(post_id,geography_id,relationship_type,source_type,source_id,confidence,source_snapshot,resolved_at)
    values(p.id,v_org.geography_id,'jurisdiction','governance',v_org.id,0.95,jsonb_build_object(
      'method','governance_jurisdiction','governance_id',v_org.id
    ),now())
    on conflict(post_id,geography_id,relationship_type,source_type) do update set
      confidence=excluded.confidence,source_id=excluded.source_id,source_snapshot=excluded.source_snapshot,resolved_at=excluded.resolved_at;
  end loop;

  return jsonb_build_object('post_id',p.id,'resolved_at',now());
end;
$function$
;

CREATE OR REPLACE FUNCTION public.sync_post_context(p_post_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
declare
  v_post public.post%rowtype;
  v_date timestamptz;
  v_text text;
  v_governance_count integer := 0;
  v_people_count integer := 0;
  v_category_count integer := 0;
  v_district_id uuid;
begin
  select * into v_post from public.post where id=p_post_id;
  if not found then raise exception 'Post not found'; end if;

  v_date := coalesce(v_post.start_at, v_post.created_at);
  v_text := lower(coalesce(v_post.title,'') || E'\n' || coalesce(v_post.content,''));

  delete from public.post_person where post_id=p_post_id and source_type='content';
  insert into public.post_person(post_id,person_id,mention_text,source_type,confidence,relationship_type,source_snapshot,resolved_at)
  select p_post_id,p.id,p.name,'content',1.0,'mentioned',jsonb_build_object('matched_on',p.name),now()
  from public.person p
  where position(lower(p.name) in v_text) > 0;
  get diagnostics v_people_count = row_count;

  delete from public.post_governance where post_id=p_post_id and source_snapshot->>'auto_source'='content';
  insert into public.post_governance(post_id,governance_id,relationship_type,resolved_at,resolution_version,source_snapshot)
  select p_post_id,g.id,'related_to',now(),1,
         jsonb_build_object('auto_source','content','matched_on',
           case when position(lower(g.short_name) in v_text) > 0 then 'short_name' else 'name' end)
  from public.governance g
  where position(lower(coalesce(g.name,'')) in v_text) > 0
     or (nullif(btrim(g.short_name),'') is not null and position(lower(g.short_name) in v_text) > 0);
  get diagnostics v_governance_count = row_count;

  delete from public.post_category where post_id=p_post_id and source_type in ('content','space','governance','entity');

  insert into public.post_category(post_id,category_id,source_type,confidence,source_snapshot,resolved_at)
  select x.post_id,x.category_id,x.source_type,x.confidence,x.source_snapshot,x.resolved_at
  from (
    select p_post_id post_id, s.category_id,'space'::text source_type,0.80::numeric confidence,
           jsonb_build_object('space_id',ps.space_id) source_snapshot,now() resolved_at
    from public.post_space ps join public.space s on s.id=ps.space_id
    where ps.post_id=p_post_id and s.category_id is not null
    union all
    select p_post_id, g.category_id,'governance',0.75,
           jsonb_build_object('governance_id',g.id),now()
    from public.post_governance pg join public.governance g on g.id=pg.governance_id
    where pg.post_id=p_post_id and g.category_id is not null
      and pg.relationship_type='related_to'
    union all
    select p_post_id, ck.category_id,'content',least(0.95,ck.weight),
           jsonb_build_object('keyword',ck.keyword),now()
    from public.category_keyword ck
    where position(lower(ck.keyword) in v_text) > 0
    union all
    select p_post_id, c.id,'entity',0.70,
           jsonb_build_object('source','person_position'),now()
    from public.post_person pp
    join public.person p on p.id=pp.person_id
    join lateral (
      select pa.*
      from public.position_appointment pa
      where pa.person_id=p.id and pa.started_at <= v_date
        and (pa.ended_at is null or pa.ended_at >= v_date)
      order by pa.started_at desc nulls last,pa.id desc
      limit 1
    ) pa on true
    join public.position po on po.id=pa.position_id
    join public.category c on c.id=po.category_id
    where pp.post_id=p_post_id
  ) x
  on conflict (post_id,category_id,source_type) do update set
    confidence=excluded.confidence,
    source_snapshot=excluded.source_snapshot,
    resolved_at=excluded.resolved_at;
  get diagnostics v_category_count = row_count;

  delete from public.post_geography
  where post_id=p_post_id and source_type='address' and relationship_type='district';

  if v_post.lat is not null and v_post.lng is not null then
    select g.id into v_district_id
    from public.geographies g
    where g.geography_type='district'
      and g.geom is not null
      and st_contains(g.geom, st_setsrid(st_point(v_post.lng,v_post.lat),4326))
    order by g.name
    limit 1;

    if v_district_id is not null then
      insert into public.post_geography(
        post_id,geography_id,relationship_type,source_type,source_id,confidence,source_snapshot,resolved_at
      ) values (
        p_post_id,v_district_id,'district','address',null,1.0,
        jsonb_build_object('lat',v_post.lat,'lng',v_post.lng,'source','post_address'),now()
      )
      on conflict (post_id,geography_id,relationship_type,source_type)
      do update set source_snapshot=excluded.source_snapshot,resolved_at=excluded.resolved_at;
    end if;
  end if;

  insert into public.post_geography(
    post_id,geography_id,relationship_type,source_type,source_id,confidence,source_snapshot,resolved_at
  )
  select p_post_id,g.geography_id,'jurisdiction','governance',g.id,1.0,
         jsonb_build_object('governance_id',g.id,'source','governance.geography_id'),now()
  from public.governance g
  join public.post_governance pg on pg.governance_id=g.id and pg.post_id=p_post_id
  where g.geography_id is not null
  on conflict (post_id,geography_id,relationship_type,source_type)
  do update set source_id=excluded.source_id,source_snapshot=excluded.source_snapshot,resolved_at=excluded.resolved_at;

  return jsonb_build_object('post_id',p_post_id,'people',v_people_count,'governance',v_governance_count,'categories',v_category_count,'district',v_district_id);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.upsert_organization(p_id uuid DEFAULT NULL::uuid, p_governance_id uuid DEFAULT NULL::uuid, p_person_name text DEFAULT NULL::text, p_person_governance_id uuid DEFAULT NULL::uuid, p_position_name text DEFAULT 'Head'::text, p_position_governance_id uuid DEFAULT NULL::uuid, p_started_at timestamp with time zone DEFAULT NULL::timestamp with time zone, p_ended_at timestamp with time zone DEFAULT NULL::timestamp with time zone, p_is_vacant boolean DEFAULT false, p_is_primary boolean DEFAULT false, p_reports_to_id uuid DEFAULT NULL::uuid, p_notes text DEFAULT NULL::text)
 RETURNS position_appointment
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_row public.position_appointment; v_existing public.position_appointment;
begin
 perform public.require_governance_admin();
 if p_started_at is null then raise exception 'Start date is required.'; end if;
 if p_ended_at is not null and p_ended_at<p_started_at then raise exception 'End date cannot be earlier than start date.'; end if;
 if p_id is not null then
   select * into v_existing from public.position_appointment where id=p_id for update;
   if not found then raise exception 'Appointment not found.'; end if;
   if p_governance_id is distinct from v_existing.organization_id or p_position_governance_id is distinct from v_existing.position_id or p_person_governance_id is distinct from v_existing.person_id then
     raise exception 'When editing an appointment, the person, position and organization cannot be changed.';
   end if;
   update public.position_appointment set started_at=p_started_at,ended_at=p_ended_at,notes=nullif(btrim(p_notes),''),updated_at=now(),updated_by=auth.uid() where id=p_id returning * into v_row;
   return v_row;
 end if;
 if p_governance_id is null or not exists(select 1 from public.governance where id=p_governance_id) then raise exception 'Organization not found.'; end if;
 if p_position_governance_id is null or not exists(select 1 from public.position where id=p_position_governance_id and appointing_organization_id=p_governance_id) then raise exception 'Position not found in this organization.'; end if;
 if p_is_vacant or p_person_governance_id is null then raise exception 'An existing person is required for a new appointment.'; end if;
 if not exists(select 1 from public.person where id=p_person_governance_id) then raise exception 'Person not found.'; end if;
 if exists(select 1 from public.position_appointment pa where pa.position_id=p_position_governance_id and pa.person_id=p_person_governance_id and (pa.started_at at time zone 'UTC')::date=(p_started_at at time zone 'UTC')::date) then raise exception 'This person is already assigned to this position on the selected start date.'; end if;
 insert into public.position_appointment(organization_id,position_id,person_id,started_at,ended_at,is_vacant,notes,created_by,updated_by)
 values(p_governance_id,p_position_governance_id,p_person_governance_id,p_started_at,p_ended_at,false,nullif(btrim(p_notes),''),auth.uid(),auth.uid()) returning * into v_row;
 return v_row;
end; $function$
;

notify pgrst, 'reload schema';
