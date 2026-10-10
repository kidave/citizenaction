-- Editable public About page image slots.
-- Public visitors can read the configured assets; only profile administrators can manage them.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'about',
  'about',
  true,
  12582912,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.about_page_assets (
  slot text primary key check (
    slot in ('hero', 'people', 'places', 'governance', 'contributions', 'timeline')
  ),
  storage_path text not null,
  public_url text not null,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.about_page_assets enable row level security;

drop policy if exists "About page assets are publicly readable" on public.about_page_assets;
create policy "About page assets are publicly readable"
on public.about_page_assets
for select
to anon, authenticated
using (true);

drop policy if exists "Admins can insert About page assets" on public.about_page_assets;
create policy "Admins can insert About page assets"
on public.about_page_assets
for insert
to authenticated
with check (
  exists (
    select 1 from public.profile p
    where p.user_id = auth.uid()
      and p.role in ('admin', 'super_admin')
  )
);

drop policy if exists "Admins can update About page assets" on public.about_page_assets;
create policy "Admins can update About page assets"
on public.about_page_assets
for update
to authenticated
using (
  exists (
    select 1 from public.profile p
    where p.user_id = auth.uid()
      and p.role in ('admin', 'super_admin')
  )
)
with check (
  exists (
    select 1 from public.profile p
    where p.user_id = auth.uid()
      and p.role in ('admin', 'super_admin')
  )
);

drop policy if exists "Admins can delete About page assets" on public.about_page_assets;
create policy "Admins can delete About page assets"
on public.about_page_assets
for delete
to authenticated
using (
  exists (
    select 1 from public.profile p
    where p.user_id = auth.uid()
      and p.role in ('admin', 'super_admin')
  )
);

drop policy if exists "About page images are publicly readable" on storage.objects;
create policy "About page images are publicly readable"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'about');

drop policy if exists "Admins can upload About page images" on storage.objects;
create policy "Admins can upload About page images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'about'
  and exists (
    select 1 from public.profile p
    where p.user_id = auth.uid()
      and p.role in ('admin', 'super_admin')
  )
);

drop policy if exists "Admins can update About page images" on storage.objects;
create policy "Admins can update About page images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'about'
  and exists (
    select 1 from public.profile p
    where p.user_id = auth.uid()
      and p.role in ('admin', 'super_admin')
  )
)
with check (
  bucket_id = 'about'
  and exists (
    select 1 from public.profile p
    where p.user_id = auth.uid()
      and p.role in ('admin', 'super_admin')
  )
);

drop policy if exists "Admins can delete About page images" on storage.objects;
create policy "Admins can delete About page images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'about'
  and exists (
    select 1 from public.profile p
    where p.user_id = auth.uid()
      and p.role in ('admin', 'super_admin')
  )
);
-- Ensure API roles can reach the table; RLS above remains the authorization boundary.
grant select on public.about_page_assets to anon, authenticated;
grant insert, update, delete on public.about_page_assets to authenticated;

