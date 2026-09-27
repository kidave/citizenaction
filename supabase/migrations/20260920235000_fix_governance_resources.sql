alter table public.attachment
  drop constraint if exists attachment_parent_check;

alter table public.attachment
  add constraint attachment_parent_check
  check (
    (
      (post_id is not null)::integer +
      (contribution_id is not null)::integer +
      (governance_id is not null)::integer
    ) = 1
  );

alter table public.link
  drop constraint if exists link_parent_check;

alter table public.link
  add constraint link_parent_check
  check (
    (
      (post_id is not null)::integer +
      (contribution_id is not null)::integer +
      (governance_id is not null)::integer
    ) = 1
  );

update storage.buckets
set allowed_mime_types = array[
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain'
]
where id = 'governance';
