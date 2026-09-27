-- Membership announcements are derived from the approved membership application
-- and the current space_member_view. They do not need a second Space record.

DROP TRIGGER IF EXISTS trg_space_member_application_approved
  ON public.space_member_application;

DROP FUNCTION IF EXISTS public.handle_space_member_application_approved();
DROP FUNCTION IF EXISTS public.get_space_membership_announcements(uuid);
DROP FUNCTION IF EXISTS public.search_space_membership_announcements(text, integer);
