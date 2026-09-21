alter table public.attachment
  add column if not exists description text;

create or replace function public.upsert_post_attachments(
  p_post_id uuid,
  p_attachments jsonb default '[]'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public, pg_catalog
as $function$
begin
  if p_post_id is null then
    raise exception 'Post ID is required';
  end if;

  if not public.can_manage_post(p_post_id, auth.uid()) then
    raise exception 'You do not have permission to manage attachments for this post';
  end if;

  if jsonb_typeof(coalesce(p_attachments, '[]'::jsonb)) <> 'array' then
    raise exception 'Attachments must be a JSON array';
  end if;

  delete from public.attachment where post_id = p_post_id;

  insert into public.attachment (
    post_id,
    contribution_id,
    storage_path,
    public_url,
    file_name,
    mime_type,
    file_size,
    width,
    height,
    duration,
    sort_order,
    credit_name,
    credit_url,
    description,
    thumbnail_path,
    thumbnail_url
  )
  select
    p_post_id,
    null,
    value->>'storage_path',
    value->>'public_url',
    coalesce(value->>'file_name', 'file'),
    nullif(value->>'mime_type', ''),
    nullif(value->>'file_size', '')::bigint,
    nullif(value->>'width', '')::integer,
    nullif(value->>'height', '')::integer,
    nullif(value->>'duration', '')::integer,
    coalesce(nullif(value->>'sort_order', '')::integer, row_number() over () - 1),
    nullif(value->>'credit_name', ''),
    nullif(value->>'credit_url', ''),
    nullif(value->>'description', ''),
    nullif(value->>'thumbnail_path', ''),
    nullif(value->>'thumbnail_url', '')
  from jsonb_array_elements(coalesce(p_attachments, '[]'::jsonb)) as value;
end;
$function$;

create or replace view public.feed_card_view as
select
  p.id,
  p.slug,
  p.title,
  p.content,
  p.content_json,
  p.content_format,
  coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'id', a.id,
        'public_url', a.public_url,
        'storage_path', a.storage_path,
        'file_name', a.file_name,
        'mime_type', a.mime_type,
        'file_size', a.file_size,
        'width', a.width,
        'height', a.height,
        'duration', a.duration,
        'sort_order', a.sort_order,
        'credit_name', a.credit_name,
        'credit_url', a.credit_url,
        'description', a.description,
        'thumbnail_path', a.thumbnail_path,
        'thumbnail_url', a.thumbnail_url
      )
      order by a.sort_order, a.created_at
    )
    from public.attachment a
    where a.post_id = p.id
  ), '[]'::jsonb) as attachments,
  coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'id', l.id,
        'url', l.url,
        'type', l.type,
        'title', l.title,
        'description', l.description,
        'hostname', l.hostname,
        'image_url', l.image_url,
        'icon_url', l.icon_url,
        'sort_order', l.sort_order
      )
      order by l.sort_order, l.created_at
    )
    from public.link l
    where l.post_id = p.id
  ), '[]'::jsonb) as links,
  p.created_at,
  p.updated_at,
  p.start_at,
  p.end_at,
  extract(year from p.start_at) as start_year,
  extract(month from p.start_at) as start_month,
  case
    when p.start_at is null then 'ongoing'
    when p.start_at > now() then 'upcoming'
    when p.end_at is not null and p.end_at < now() then 'ended'
    else 'ongoing'
  end as lifecycle_status,
  p.lat,
  p.lng,
  p.address,
  p.author_id,
  pr.username as author_username,
  pr.name as author_name,
  pr.avatar_url as author_avatar,
  coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'id', s.id,
        'name', s.name,
        'slug', s.slug,
        'logo_url', s.logo_url,
        'cover_url', s.cover_url,
        'category_id', s.category_id
      )
      order by ps.created_at, s.name
    )
    from public.post_space ps
    join public.space s on s.id = ps.space_id
    where ps.post_id = p.id and s.is_active = true
  ), '[]'::jsonb) as spaces
from public.post p
left join public.profile pr on pr.user_id = p.author_id
where coalesce(p.status, 'published') <> all (array['draft', 'deleted']);

create or replace function public.get_user_posts(p_user_id uuid)
returns table(
  id uuid,
  slug text,
  title text,
  content text,
  content_json jsonb,
  content_format text,
  status text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  author_id uuid,
  attachments jsonb,
  governance jsonb,
  spaces jsonb
)
language sql
security definer
set search_path = public, pg_catalog
as $function$
select
  p.id,
  p.slug,
  p.title,
  p.content,
  p.content_json,
  p.content_format,
  p.status,
  p.created_at,
  p.updated_at,
  p.author_id,
  coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'id', a.id,
        'public_url', a.public_url,
        'storage_path', a.storage_path,
        'file_name', a.file_name,
        'mime_type', a.mime_type,
        'width', a.width,
        'height', a.height,
        'sort_order', a.sort_order,
        'credit_name', a.credit_name,
        'credit_url', a.credit_url,
        'description', a.description
      )
      order by a.sort_order asc, a.created_at asc
    )
    from public.attachment a
    where a.post_id = p.id
  ), '[]'::jsonb),
  coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'id', g.id,
        'label', g.name,
        'name', g.name,
        'short_name', g.short_name,
        'image_url', g.image_url,
        'slug', g.slug
      )
      order by g.name asc
    )
    from public.post_governance pg
    join public.governance g on g.id = pg.governance_id
    where pg.post_id = p.id
  ), '[]'::jsonb),
  coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'id', s.id,
        'name', s.name,
        'slug', s.slug,
        'logo_url', s.logo_url,
        'cover_url', s.cover_url,
        'category_id', s.category_id
      )
      order by ps.created_at, s.name
    )
    from public.post_space ps
    join public.space s on s.id = ps.space_id
    where ps.post_id = p.id
  ), '[]'::jsonb)
from public.post p
where p.author_id = p_user_id
  and coalesce(p.status, 'published') not in ('draft', 'deleted')
order by p.created_at desc;
$function$;

create or replace function public.get_contribution(p_post_id uuid)
returns jsonb
language sql
stable
set search_path = public, pg_catalog
as $function$
with contribution_rows as (
  select
    c.*,
    p.username as author_username,
    p.name as profile_author_name,
    p.avatar_url as author_avatar
  from public.contribution c
  left join public.profile p on p.user_id = c.author_id
  where c.post_id = p_post_id
),
assembled as (
  select
    c.*,
    public.can_manage_contribution(c.id) as can_manage,
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', a.id,
          'public_url', a.public_url,
          'storage_path', a.storage_path,
          'file_name', a.file_name,
          'mime_type', a.mime_type,
          'file_size', a.file_size,
          'width', a.width,
          'height', a.height,
          'duration', a.duration,
          'sort_order', a.sort_order,
          'credit_name', a.credit_name,
          'credit_url', a.credit_url,
          'description', a.description
        )
        order by a.sort_order, a.created_at
      )
      from public.attachment a
      where a.contribution_id = c.id
    ), '[]'::jsonb) as attachments,
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', l.id,
          'url', l.url,
          'type', l.type,
          'title', l.title,
          'description', l.description,
          'hostname', l.hostname,
          'image_url', l.image_url,
          'icon_url', l.icon_url,
          'sort_order', l.sort_order
        )
        order by l.sort_order, l.created_at
      )
      from public.link l
      where l.contribution_id = c.id
    ), '[]'::jsonb) as links
  from contribution_rows c
)
select coalesce(
  jsonb_agg(
    jsonb_build_object(
      'id', c.id,
      'post_id', c.post_id,
      'author_id', c.author_id,
      'author_username', c.author_username,
      'author_name', coalesce(nullif(btrim(c.profile_author_name), ''), nullif(btrim(c.title), ''), 'Guest'),
      'author_avatar', c.author_avatar,
      'title', c.title,
      'content', c.content,
      'content_json', c.content_json,
      'content_format', c.content_format,
      'contribution_type', c.contribution_type,
      'status', c.status,
      'created_at', c.created_at,
      'updated_at', c.updated_at,
      'updated_by', c.updated_by,
      'metadata', coalesce(c.metadata, '{}'::jsonb),
      'start_at', c.start_at,
      'end_at', c.end_at,
      'lat', c.lat,
      'lng', c.lng,
      'address', c.address,
      'attachments', c.attachments,
      'links', c.links,
      'can_manage', c.can_manage
    )
    order by c.created_at desc
  ),
  '[]'::jsonb
)
from assembled c;
$function$;