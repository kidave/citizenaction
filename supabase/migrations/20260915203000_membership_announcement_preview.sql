-- Preview-only migration for Citizen Action membership announcements.
-- This file is intentionally not applied to the production Supabase project.
-- It should be applied to an isolated Supabase preview branch when available.

alter table public.space_member_application
  add column if not exists announcement_post_id uuid references public.post(id) on delete set null,
  add column if not exists public_announcement_note text;

create index if not exists space_member_application_announcement_post_id_idx
  on public.space_member_application (announcement_post_id);

create or replace function public.review_space_member_application(
  p_application_id uuid,
  p_action text,
  p_admin_notes text default null,
  p_public_announcement_note text default null
)
returns public.space_member_application
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_application public.space_member_application;
  v_space public.space;
  v_applicant public.profile;
  v_public_note text;
  v_post public.post;
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  if p_action not in ('approve', 'reject') then
    raise exception using errcode = '22023', message = 'Invalid review action';
  end if;

  select *
    into v_application
  from public.space_member_application
  where id = p_application_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'Application not found';
  end if;

  if not public.can_manage_space(v_application.space_id, v_user_id) then
    raise exception using errcode = '42501', message = 'You do not have permission to review this application';
  end if;

  if v_application.status <> 'pending' then
    raise exception using errcode = 'P0001', message = 'This application has already been reviewed';
  end if;

  if p_action = 'approve' then
    select * into v_space
    from public.space
    where id = v_application.space_id;

    select * into v_applicant
    from public.profile
    where user_id = v_application.applicant_user_id;

    insert into public.space_member (
      space_id,
      user_id,
      role,
      is_active,
      is_suspended
    )
    values (
      v_application.space_id,
      v_application.applicant_user_id,
      'member',
      true,
      false
    )
    on conflict (space_id, user_id)
    do update set
      role = case
        when public.space_member.role = 'owner' then public.space_member.role
        else 'member'
      end,
      is_active = true,
      is_suspended = false;

    v_public_note := nullif(trim(p_public_announcement_note), '');

    if v_public_note is null then
      v_public_note := format(
        'We are happy to announce and welcome %s to the %s team.',
        coalesce(nullif(trim(v_applicant.name), ''), 'a new member'),
        coalesce(nullif(trim(v_space.name), ''), 'Space')
      );
    end if;

    insert into public.post (
      author_id,
      type,
      title,
      content,
      content_format,
      metadata
    )
    values (
      v_user_id,
      'post',
      format('Welcome %s to %s',
        coalesce(nullif(trim(v_applicant.name), ''), 'our new member'),
        coalesce(nullif(trim(v_space.name), ''), 'the Space')
      ),
      concat(
        v_public_note,
        E'\n\n',
        'Why I''m here:',
        E'\n',
        coalesce(nullif(trim(v_application.message), ''), '');
      ),
      'text',
      jsonb_build_object(
        'kind', 'membership_announcement',
        'space_member_application_id', v_application.id,
        'member_user_id', v_application.applicant_user_id,
        'public_announcement_note', v_public_note
      )
    )
    returning * into v_post;

    insert into public.post_space (post_id, space_id)
    values (v_post.id, v_application.space_id)
    on conflict (post_id, space_id) do nothing;

    update public.space_member_application
    set
      status = 'approved',
      admin_notes = nullif(trim(p_admin_notes), ''),
      public_announcement_note = v_public_note,
      announcement_post_id = v_post.id,
      reviewed_by = v_user_id,
      reviewed_at = now()
    where id = p_application_id
    returning * into v_application;
  else
    update public.space_member_application
    set
      status = 'rejected',
      admin_notes = nullif(trim(p_admin_notes), ''),
      reviewed_by = v_user_id,
      reviewed_at = now()
    where id = p_application_id
    returning * into v_application;
  end if;

  return v_application;
end;
$$;

revoke execute on function public.review_space_member_application(uuid, text, text, text) from public, anon;
grant execute on function public.review_space_member_application(uuid, text, text, text) to authenticated;
