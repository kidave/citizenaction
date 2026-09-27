-- Restrict privileged and mutation RPCs to signed-in callers.
-- SECURITY DEFINER functions still enforce their own authorization checks.

revoke execute on function public.approve_space_application(uuid, uuid, text) from public, anon;
revoke execute on function public.approve_space_member_application(uuid, text) from public, anon;
revoke execute on function public.create_governance_entity(text, public.governance_type, text, text, timestamptz, timestamptz, uuid, text) from public, anon;
revoke execute on function public.create_person(text, text, text, text, uuid, jsonb) from public, anon;
revoke execute on function public.create_position(text, text, text, uuid, jsonb) from public, anon;
revoke execute on function public.delete_contribution(uuid) from public, anon;
revoke execute on function public.delete_geography(uuid) from public, anon;
revoke execute on function public.delete_governance_relation(uuid) from public, anon;
revoke execute on function public.delete_organization(uuid) from public, anon;
revoke execute on function public.delete_post_links(uuid) from public, anon;
revoke execute on function public.reject_space_application(uuid, text) from public, anon;
revoke execute on function public.reject_space_member_application(uuid, text) from public, anon;
revoke execute on function public.set_governance_person_profile(uuid, uuid) from public, anon;
revoke execute on function public.update_governance_entity(uuid, text, text, text, text, public.governance_type, text, timestamptz, timestamptz, text, uuid) from public, anon;
revoke execute on function public.upsert_contribution_attachments(uuid, jsonb) from public, anon;
revoke execute on function public.upsert_contribution_links(uuid, jsonb) from public, anon;
revoke execute on function public.upsert_geography(uuid, text, text, text, text, text, uuid, text, bigint, integer, text, text, jsonb, jsonb, jsonb) from public, anon;
revoke execute on function public.upsert_organization(uuid, uuid, text, uuid, text, uuid, timestamptz, timestamptz, boolean, boolean, uuid, text) from public, anon;
revoke execute on function public.upsert_post_attachments(uuid, jsonb) from public, anon;
revoke execute on function public.upsert_post_links(uuid, jsonb) from public, anon;
revoke execute on function public.set_governance_jurisdiction(uuid, text, bigint, text, integer, jsonb, text, text, text) from public, anon;
revoke execute on function public.set_governance_parent(uuid, uuid) from public, anon;
revoke execute on function public.set_platform_user_role(uuid, text) from public, anon;
revoke execute on function public.set_space_member_suspension(uuid, uuid, boolean) from public, anon;
revoke execute on function public.change_space_member_role(uuid, uuid, text) from public, anon;
revoke execute on function public.clear_governance_jurisdiction(uuid) from public, anon;
revoke execute on function public.delete_governance_entity(uuid) from public, anon;
revoke execute on function public.update_governance_image(uuid, text) from public, anon;
revoke execute on function public.review_governance_contribution(uuid, text, text) from public, anon;
revoke execute on function public.review_space_member_application(uuid, text, text) from public, anon;
revoke execute on function public.remove_space_member(uuid, uuid) from public, anon;
