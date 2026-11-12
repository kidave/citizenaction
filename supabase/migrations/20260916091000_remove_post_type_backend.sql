-- Replace post RPCs and read functions so they no longer expose public.post.type.
-- This migration intentionally replaces dependent functions/views before the
-- legacy column is dropped at the end.

DROP FUNCTION IF EXISTS public.create_post(text, uuid[], text, text, jsonb, timestamptz, timestamptz, double precision, double precision, text, jsonb, jsonb, text);
DROP FUNCTION IF EXISTS public.update_post(uuid, text, uuid[], text, text, jsonb, timestamptz, timestamptz, double precision, double precision, text, jsonb, jsonb, text);

CREATE OR REPLACE FUNCTION public.create_post(
  p_space_ids uuid[] DEFAULT '{}',
  p_title text DEFAULT NULL,
  p_content text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}',
  p_start_at timestamptz DEFAULT NULL,
  p_end_at timestamptz DEFAULT NULL,
  p_lat double precision DEFAULT NULL,
  p_lng double precision DEFAULT NULL,
  p_address text DEFAULT NULL,
  p_governance_ids jsonb DEFAULT '[]',
  p_content_json jsonb DEFAULT NULL,
  p_content_format text DEFAULT 'text'
)
RETURNS public.post
LANGUAGE plpgsql
SET search_path TO public, pg_catalog
AS $$
declare
  v_post public.post;
begin
  if p_content_format not in ('text','editorjs') then
    raise exception 'Invalid content format: %', p_content_format;
  end if;

  if p_content_format = 'editorjs' and p_content_json is null then
    raise exception 'content_json is required for editorjs content';
  end if;

  if exists (
    select 1 from unnest(coalesce(p_space_ids, '{}')) as s(space_id)
    where not public.can_attach_post_to_space(s.space_id, auth.uid())
  ) then
    raise exception 'You must be an active member of every Space attached to this post';
  end if;

  insert into public.post (
    author_id, title, content, content_json, content_format, metadata,
    start_at, end_at, lat, lng, address
  )
  values (
    auth.uid(), p_title, p_content, p_content_json, p_content_format,
    coalesce(p_metadata, '{}'), p_start_at, p_end_at, p_lat, p_lng, p_address
  )
  returning * into v_post;

  insert into public.post_space (post_id, space_id)
  select v_post.id, x
  from unnest(coalesce(p_space_ids, '{}')) as t(x)
  where x is not null
  on conflict (post_id, space_id) do nothing;

  if p_governance_ids is not null then
    insert into public.post_governance (post_id, governance_id)
    select v_post.id, x::uuid
    from jsonb_array_elements_text(p_governance_ids) as t(x)
    where x is not null and x <> ''
    on conflict do nothing;
  end if;

  return v_post;
end;
$$;

CREATE OR REPLACE FUNCTION public.update_post(
  p_post_id uuid,
  p_space_ids uuid[] DEFAULT '{}',
  p_title text DEFAULT NULL,
  p_content text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}',
  p_start_at timestamptz DEFAULT NULL,
  p_end_at timestamptz DEFAULT NULL,
  p_lat double precision DEFAULT NULL,
  p_lng double precision DEFAULT NULL,
  p_address text DEFAULT NULL,
  p_governance_ids jsonb DEFAULT '[]',
  p_content_json jsonb DEFAULT NULL,
  p_content_format text DEFAULT 'text'
)
RETURNS public.post
LANGUAGE plpgsql
SET search_path TO public, pg_catalog
AS $$
declare
  v_post public.post;
begin
  if p_content_format not in ('text','editorjs') then
    raise exception 'Invalid content format: %', p_content_format;
  end if;

  if p_content_format = 'editorjs' and p_content_json is null then
    raise exception 'content_json is required for editorjs content';
  end if;

  if not public.can_manage_post(p_post_id, auth.uid()) then
    raise exception 'You do not have permission to update this post';
  end if;

  if exists (
    select 1 from unnest(coalesce(p_space_ids, '{}')) as s(space_id)
    where not public.can_attach_post_to_space(s.space_id, auth.uid())
  ) then
    raise exception 'You must be an active member of every Space attached to this post';
  end if;

  update public.post
  set
    title = p_title,
    content = p_content,
    content_json = p_content_json,
    content_format = p_content_format,
    metadata = coalesce(p_metadata, '{}'),
    start_at = p_start_at,
    end_at = p_end_at,
    lat = p_lat,
    lng = p_lng,
    address = p_address,
    updated_at = now()
  where id = p_post_id
  returning * into v_post;

  if not found then
    raise exception 'Post not found';
  end if;

  delete from public.post_space where post_id = p_post_id;

  insert into public.post_space (post_id, space_id)
  select p_post_id, x
  from unnest(coalesce(p_space_ids, '{}')) as t(x)
  where x is not null
  on conflict (post_id, space_id) do nothing;

  delete from public.post_governance where post_id = p_post_id;

  if p_governance_ids is not null then
    insert into public.post_governance (post_id, governance_id)
    select p_post_id, x::uuid
    from jsonb_array_elements_text(p_governance_ids) as t(x)
    where x is not null and x <> '';
  end if;

  return v_post;
end;
$$;

DROP VIEW IF EXISTS public.feed_card_view;

CREATE VIEW public.feed_card_view WITH (security_invoker = true) AS
SELECT
  p.id,
  p.slug,
  p.title,
  p.content,
  p.content_json,
  p.content_format,
  COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'id', a.id, 'public_url', a.public_url, 'storage_path', a.storage_path,
      'file_name', a.file_name, 'mime_type', a.mime_type, 'file_size', a.file_size,
      'width', a.width, 'height', a.height, 'duration', a.duration,
      'sort_order', a.sort_order, 'credit_name', a.credit_name, 'credit_url', a.credit_url,
      'thumbnail_path', a.thumbnail_path, 'thumbnail_url', a.thumbnail_url
    ) ORDER BY a.sort_order, a.created_at)
    FROM public.attachment a WHERE a.post_id = p.id
  ), '[]') AS attachments,
  COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'id', l.id, 'url', l.url, 'type', l.type, 'title', l.title,
      'description', l.description, 'hostname', l.hostname,
      'image_url', l.image_url, 'icon_url', l.icon_url, 'sort_order', l.sort_order
    ) ORDER BY l.sort_order, l.created_at)
    FROM public.link l WHERE l.post_id = p.id
  ), '[]') AS links,
  p.created_at,
  p.updated_at,
  p.start_at,
  p.end_at,
  EXTRACT(year FROM p.start_at) AS start_year,
  EXTRACT(month FROM p.start_at) AS start_month,
  CASE
    WHEN p.start_at IS NULL THEN 'ongoing'::text
    WHEN p.start_at > now() THEN 'upcoming'::text
    WHEN p.end_at IS NOT NULL AND p.end_at < now() THEN 'ended'::text
    ELSE 'ongoing'::text
  END AS lifecycle_status,
  p.lat,
  p.lng,
  p.address,
  p.author_id,
  pr.username AS author_username,
  pr.name AS author_name,
  pr.avatar_url AS author_avatar,
  COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'id', s.id, 'name', s.name, 'slug', s.slug,
      'logo_url', s.logo_url, 'cover_url', s.cover_url, 'category_id', s.category_id
    ) ORDER BY ps.created_at, s.name)
    FROM public.post_space ps
    JOIN public.space s ON s.id = ps.space_id
    WHERE ps.post_id = p.id AND s.is_active = true
  ), '[]') AS spaces
FROM public.post p
LEFT JOIN public.profile pr ON pr.user_id = p.author_id
WHERE COALESCE(p.status, 'published') <> ALL (ARRAY['draft'::text, 'deleted'::text]);

CREATE OR REPLACE FUNCTION public.get_post(p_post_id uuid)
RETURNS TABLE(
  id uuid, slug text, title text, content text, content_json jsonb, content_format text,
  attachments jsonb, links jsonb, created_at timestamptz, updated_at timestamptz,
  start_at timestamptz, end_at timestamptz, start_year numeric, start_month numeric,
  lifecycle_status text, lat double precision, lng double precision, address text,
  author_id uuid, author_username text, author_name text, author_avatar text,
  stats jsonb, governance jsonb, contributors jsonb, contributions jsonb,
  permissions jsonb, spaces jsonb
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO public, pg_catalog
AS $$
with core as (select * from public.feed_card_view where id = p_post_id),
stats_row as (select * from public.get_post_stats(array[p_post_id])),
governance_row as (select * from public.get_post_governance(array[p_post_id])),
contributors_row as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'user_id',c.author_id,'username',pr.username,
    'name',coalesce(nullif(btrim(pr.name),''),nullif(btrim(c.title),''),'Guest'),
    'avatar_url',pr.avatar_url
  ) order by c.created_at desc),'[]') contributors
  from public.contribution c left join public.profile pr on pr.user_id=c.author_id
  where c.post_id=p_post_id
),
permissions_row as (
  select jsonb_build_object(
    'can_manage',private.can_manage_post(p_post_id,(select auth.uid())),
    'can_contribute',public.can_contribute_to_post(p_post_id,(select auth.uid()))
  ) permissions
),
contributions_row as (select coalesce(public.get_contribution(p_post_id),'[]') contributions),
spaces_row as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',s.id,'name',s.name,'slug',s.slug,'logo_url',s.logo_url,
    'cover_url',s.cover_url,'category_id',s.category_id
  ) order by ps.created_at,s.name),'[]') spaces
  from public.post_space ps join public.space s on s.id=ps.space_id
  where ps.post_id=p_post_id
)
select c.id,c.slug,c.title,c.content,c.content_json,c.content_format,c.attachments,c.links,
  c.created_at,c.updated_at,c.start_at,c.end_at,c.start_year,c.start_month,c.lifecycle_status,
  c.lat,c.lng,c.address,c.author_id,c.author_username,c.author_name,c.author_avatar,
  jsonb_build_object(
    'support_count',coalesce(s.support_count,0),
    'contribution_count',coalesce(s.contribution_count,0),
    'contributor_count',coalesce(s.contributor_count,0),
    'is_supported',coalesce(s.is_supported,false)
  ) as stats,
  coalesce(g.governance,'[]') as governance,
  cr.contributors,
  coalesce(cn.contributions,'[]') as contributions,
  coalesce(prm.permissions,jsonb_build_object('can_manage',false,'can_contribute',false)) as permissions,
  sr.spaces
from core c
left join stats_row s on s.post_id=c.id
left join governance_row g on g.post_id=c.id
cross join contributors_row cr
cross join permissions_row prm
cross join contributions_row cn
cross join spaces_row sr;
$$;

CREATE OR REPLACE FUNCTION public.get_post_by_slug(p_slug text)
RETURNS TABLE(
  id uuid, slug text, title text, content text, content_json jsonb, content_format text,
  attachments jsonb, links jsonb, created_at timestamptz, updated_at timestamptz,
  start_at timestamptz, end_at timestamptz, start_year numeric, start_month numeric,
  lifecycle_status text, lat double precision, lng double precision, address text,
  author_id uuid, author_username text, author_name text, author_avatar text,
  stats jsonb, governance jsonb, contributors jsonb, contributions jsonb,
  permissions jsonb, spaces jsonb
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO public, pg_catalog
AS $$
with target as (select p.id from public.post p where p.slug=p_slug limit 1),
core as (select fc.* from public.feed_card_view fc join target t on t.id=fc.id),
stats_row as (select * from public.get_post_stats((select array_agg(id) from target))),
governance_row as (select * from public.get_post_governance((select array_agg(id) from target))),
contributors_row as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'user_id',c.author_id,'username',pr.username,
    'name',coalesce(nullif(btrim(pr.name),''),nullif(btrim(c.title),''),'Guest'),
    'avatar_url',pr.avatar_url
  ) order by c.created_at desc),'[]') contributors
  from public.contribution c left join public.profile pr on pr.user_id=c.author_id
  where c.post_id=(select id from target)
),
permissions_row as (
  select jsonb_build_object(
    'can_manage',private.can_manage_post((select id from target),(select auth.uid())),
    'can_contribute',public.can_contribute_to_post((select id from target),(select auth.uid()))
  ) permissions
),
contributions_row as (select coalesce(public.get_contribution((select id from target)),'[]') contributions),
spaces_row as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',s.id,'name',s.name,'slug',s.slug,'logo_url',s.logo_url,
    'cover_url',s.cover_url,'category_id',s.category_id
  ) order by ps.created_at,s.name),'[]') spaces
  from public.post_space ps join public.space s on s.id=ps.space_id
  where ps.post_id=(select id from target)
)
select c.id,c.slug,c.title,c.content,c.content_json,c.content_format,c.attachments,c.links,
  c.created_at,c.updated_at,c.start_at,c.end_at,c.start_year,c.start_month,c.lifecycle_status,
  c.lat,c.lng,c.address,c.author_id,c.author_username,c.author_name,c.author_avatar,
  jsonb_build_object(
    'support_count',coalesce(s.support_count,0),
    'contribution_count',coalesce(s.contribution_count,0),
    'contributor_count',coalesce(s.contributor_count,0),
    'is_supported',coalesce(s.is_supported,false)
  ) as stats,
  coalesce(g.governance,'[]') as governance,
  cr.contributors,
  coalesce(cn.contributions,'[]') as contributions,
  coalesce(prm.permissions,jsonb_build_object('can_manage',false,'can_contribute',false)) as permissions,
  sr.spaces
from core c
left join stats_row s on s.post_id=c.id
left join governance_row g on g.post_id=c.id
cross join contributors_row cr
cross join permissions_row prm
cross join contributions_row cn
cross join spaces_row sr;
$$;

CREATE OR REPLACE FUNCTION public.get_space_posts(p_space_id uuid)
RETURNS TABLE(
  id uuid, slug text, title text, content text, content_json jsonb, content_format text,
  status text, attachments jsonb, links jsonb, created_at timestamptz, updated_at timestamptz,
  start_at timestamptz, end_at timestamptz, start_year numeric, start_month numeric,
  lifecycle_status text, lat double precision, lng double precision, address text,
  author_id uuid, author_username text, author_name text, author_avatar text,
  stats jsonb, governance jsonb, contributors jsonb, contributions jsonb, permissions jsonb, spaces jsonb
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO public, pg_catalog
AS $$
with space_posts as (
  select p.id from public.post_space ps join public.post p on p.id=ps.post_id
  where ps.space_id=p_space_id and coalesce(p.status,'published') not in ('draft','deleted')
),
core as (select fc.* from public.feed_card_view fc join space_posts sp on sp.id=fc.id),
stats_rows as (select * from public.get_post_stats((select coalesce(array_agg(id),'{}') from space_posts))),
governance_rows as (select * from public.get_post_governance((select coalesce(array_agg(id),'{}') from space_posts))),
contributors_rows as (
  with contributor_rows as (
    select distinct on (c.post_id,c.author_id) c.post_id,c.author_id,c.created_at,pr.username,pr.name,pr.avatar_url
    from public.contribution c join space_posts sp on sp.id=c.post_id left join public.profile pr on pr.user_id=c.author_id
    where c.author_id is not null order by c.post_id,c.author_id,c.created_at desc
  )
  select post_id,jsonb_agg(jsonb_build_object(
    'user_id',author_id,'username',username,'name',coalesce(nullif(btrim(name),''),'Guest'),'avatar_url',avatar_url
  ) order by created_at desc) contributors
  from contributor_rows group by post_id
),
contributions_rows as (select sp.id as post_id,coalesce(public.get_contribution(sp.id),'[]') contributions from space_posts sp),
permissions_rows as (select sp.id as post_id,jsonb_build_object(
  'can_manage',private.can_manage_post(sp.id,(select auth.uid())),
  'can_contribute',public.can_contribute_to_post(sp.id,(select auth.uid()))
) permissions from space_posts sp)
select c.id,c.slug,c.title,c.content,c.content_json,c.content_format,null::text as status,
  c.attachments,c.links,c.created_at,c.updated_at,c.start_at,c.end_at,c.start_year,c.start_month,c.lifecycle_status,
  c.lat,c.lng,c.address,c.author_id,c.author_username,c.author_name,c.author_avatar,
  jsonb_build_object(
    'support_count',coalesce(s.support_count,0),
    'contribution_count',coalesce(s.contribution_count,0),
    'contributor_count',coalesce(s.contributor_count,0),
    'is_supported',coalesce(s.is_supported,false)
  ) as stats,
  coalesce(g.governance,'[]') as governance,
  coalesce(cr.contributors,'[]') as contributors,
  coalesce(cn.contributions,'[]') as contributions,
  coalesce(pr.permissions,jsonb_build_object('can_manage',false,'can_contribute',false)) as permissions,
  coalesce(c.spaces,'[]') as spaces
from core c
left join stats_rows s on s.post_id=c.id
left join governance_rows g on g.post_id=c.id
left join contributors_rows cr on cr.post_id=c.id
left join contributions_rows cn on cn.post_id=c.id
left join permissions_rows pr on pr.post_id=c.id
order by c.created_at desc;
$$;

CREATE OR REPLACE FUNCTION public.get_user_posts(p_user_id uuid)
RETURNS TABLE(
  id uuid, slug text, title text, content text, content_json jsonb, content_format text,
  status text, created_at timestamptz, updated_at timestamptz, author_id uuid,
  attachments jsonb, governance jsonb, spaces jsonb
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO public
AS $$
  SELECT p.id,p.slug,p.title,p.content,p.content_json,p.content_format,p.status,p.created_at,p.updated_at,p.author_id,
    COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id',a.id,'public_url',a.public_url,'storage_path',a.storage_path,'file_name',a.file_name,
        'mime_type',a.mime_type,'width',a.width,'height',a.height,'sort_order',a.sort_order,
        'credit_name',a.credit_name,'credit_url',a.credit_url
      ) ORDER BY a.sort_order,a.created_at)
      FROM public.attachment a WHERE a.post_id=p.id
    ),'[]') attachments,
    COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id',g.id,'label',g.name,'name',g.name,'short_name',g.short_name,'image_url',g.image_url,'slug',g.slug
      ) ORDER BY g.name)
      FROM public.post_governance pg JOIN public.governance g ON g.id=pg.governance_id
      WHERE pg.post_id=p.id
    ),'[]') governance,
    COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id',s.id,'name',s.name,'slug',s.slug,'logo_url',s.logo_url,'cover_url',s.cover_url,'category_id',s.category_id
      ) ORDER BY ps.created_at,s.name)
      FROM public.post_space ps JOIN public.space s ON s.id=ps.space_id
      WHERE ps.post_id=p.id
    ),'[]') spaces
  FROM public.post p
  WHERE p.author_id=p_user_id AND COALESCE(p.status,'published') NOT IN ('draft','deleted')
  ORDER BY p.created_at DESC;
$$;

DROP VIEW IF EXISTS public.feed_card_view;
ALTER TABLE public.post DROP COLUMN IF EXISTS type;

CREATE VIEW public.feed_card_view WITH (security_invoker = true) AS
SELECT
  p.id,p.slug,p.title,p.content,p.content_json,p.content_format,
  COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'id',a.id,'public_url',a.public_url,'storage_path',a.storage_path,'file_name',a.file_name,
      'mime_type',a.mime_type,'file_size',a.file_size,'width',a.width,'height',a.height,'duration',a.duration,
      'sort_order',a.sort_order,'credit_name',a.credit_name,'credit_url',a.credit_url,
      'thumbnail_path',a.thumbnail_path,'thumbnail_url',a.thumbnail_url
    ) ORDER BY a.sort_order,a.created_at)
    FROM public.attachment a WHERE a.post_id=p.id
  ),'[]') attachments,
  COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'id',l.id,'url',l.url,'type',l.type,'title',l.title,'description',l.description,'hostname',l.hostname,
      'image_url',l.image_url,'icon_url',l.icon_url,'sort_order',l.sort_order
    ) ORDER BY l.sort_order,l.created_at)
    FROM public.link l WHERE l.post_id=p.id
  ),'[]') links,
  p.created_at,p.updated_at,p.start_at,p.end_at,
  EXTRACT(year FROM p.start_at) start_year,
  EXTRACT(month FROM p.start_at) start_month,
  CASE
    WHEN p.start_at IS NULL THEN 'ongoing'::text
    WHEN p.start_at > now() THEN 'upcoming'::text
    WHEN p.end_at IS NOT NULL AND p.end_at < now() THEN 'ended'::text
    ELSE 'ongoing'::text
  END lifecycle_status,
  p.lat,p.lng,p.address,p.author_id,
  pr.username author_username,pr.name author_name,pr.avatar_url author_avatar,
  COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'id',s.id,'name',s.name,'slug',s.slug,'logo_url',s.logo_url,'cover_url',s.cover_url,'category_id',s.category_id
    ) ORDER BY ps.created_at,s.name)
    FROM public.post_space ps JOIN public.space s ON s.id=ps.space_id
    WHERE ps.post_id=p.id AND s.is_active=true
  ),'[]') spaces
FROM public.post p
LEFT JOIN public.profile pr ON pr.user_id=p.author_id
WHERE COALESCE(p.status,'published') <> ALL (ARRAY['draft'::text,'deleted'::text]);

ALTER VIEW public.feed_card_view SET (security_invoker = true);
