begin;

create or replace function public.change_space_member_role(
  p_space_id uuid,
  p_user_id uuid,
  p_role text
)
returns public.space_member
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_actor uuid := auth.uid();
  v_member public.space_member;
  v_actor_is_platform_admin boolean := false;
  v_actor_is_owner boolean := false;
  v_actor_is_space_admin boolean := false;
begin
  if v_actor is null then
    raise exception using errcode='42501', message='Authentication required';
  end if;

  if p_role not in ('member','admin') then
    raise exception using errcode='22023', message='Invalid member role';
  end if;

  select exists (
    select 1 from public.profile
    where user_id = v_actor and role = 'admin'
  ) into v_actor_is_platform_admin;

  select exists (
    select 1 from public.space
    where id = p_space_id and owner_user_id = v_actor
  ) into v_actor_is_owner;

  select exists (
    select 1 from public.space_member
    where space_id = p_space_id
      and user_id = v_actor
      and role = 'admin'
      and is_active = true
      and is_suspended = false
  ) into v_actor_is_space_admin;

  if not (v_actor_is_platform_admin or v_actor_is_owner or v_actor_is_space_admin) then
    raise exception using errcode='42501', message='You do not have permission to change member roles';
  end if;

  if p_user_id = (select owner_user_id from public.space where id = p_space_id) then
    raise exception using errcode='42501', message='The Space owner role cannot be changed here';
  end if;

  if v_actor_is_space_admin and not (v_actor_is_platform_admin or v_actor_is_owner) then
    if p_role <> 'admin' then
      raise exception using errcode='42501', message='Space admins can only promote members to admin';
    end if;

    if not exists (
      select 1 from public.space_member
      where space_id = p_space_id
        and user_id = p_user_id
        and role = 'member'
        and is_active = true
        and is_suspended = false
    ) then
      raise exception using errcode='42501', message='Space admins can only promote active members';
    end if;
  end if;

  update public.space_member
  set role = p_role
  where space_id = p_space_id
    and user_id = p_user_id
    and is_active = true
  returning * into v_member;

  if not found then
    raise exception using errcode='P0002', message='Member not found';
  end if;

  return v_member;
end;
$function$;

commit;