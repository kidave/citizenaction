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