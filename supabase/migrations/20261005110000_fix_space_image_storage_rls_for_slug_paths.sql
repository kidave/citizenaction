drop policy if exists space_image_admin_insert on storage.objects;
drop policy if exists space_image_admin_update on storage.objects;
drop policy if exists space_image_admin_delete on storage.objects;

create policy space_image_admin_insert
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'space'
  and (storage.foldername(name))[1] = 'space'
  and exists (
    select 1 from public.space s
    where s.slug = (storage.foldername(name))[2]
      and (
        s.owner_user_id = auth.uid()
        or exists (
          select 1 from public.space_member sm
          where sm.space_id = s.id
            and sm.user_id = auth.uid()
            and sm.role = 'admin'
            and sm.is_active = true
            and sm.is_suspended = false
        )
      )
  )
);

create policy space_image_admin_update
on storage.objects for update
to authenticated
using (
  bucket_id = 'space'
  and (storage.foldername(name))[1] = 'space'
  and exists (
    select 1 from public.space s
    where s.slug = (storage.foldername(name))[2]
      and (
        s.owner_user_id = auth.uid()
        or exists (
          select 1 from public.space_member sm
          where sm.space_id = s.id
            and sm.user_id = auth.uid()
            and sm.role = 'admin'
            and sm.is_active = true
            and sm.is_suspended = false
        )
      )
  )
)
with check (
  bucket_id = 'space'
  and (storage.foldername(name))[1] = 'space'
  and exists (
    select 1 from public.space s
    where s.slug = (storage.foldername(name))[2]
      and (
        s.owner_user_id = auth.uid()
        or exists (
          select 1 from public.space_member sm
          where sm.space_id = s.id
            and sm.user_id = auth.uid()
            and sm.role = 'admin'
            and sm.is_active = true
            and sm.is_suspended = false
        )
      )
  )
);

create policy space_image_admin_delete
on storage.objects for delete
to authenticated
using (
  bucket_id = 'space'
  and (storage.foldername(name))[1] = 'space'
  and exists (
    select 1 from public.space s
    where s.slug = (storage.foldername(name))[2]
      and (
        s.owner_user_id = auth.uid()
        or exists (
          select 1 from public.space_member sm
          where sm.space_id = s.id
            and sm.user_id = auth.uid()
            and sm.role = 'admin'
            and sm.is_active = true
            and sm.is_suspended = false
        )
      )
  )
);
