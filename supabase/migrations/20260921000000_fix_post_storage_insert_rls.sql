drop policy if exists "Authenticated users can upload post files" on storage.objects;

create policy "Authenticated users can upload post files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'post'
  and private.can_manage_post((storage.foldername(name))[1]::uuid, auth.uid())
);
