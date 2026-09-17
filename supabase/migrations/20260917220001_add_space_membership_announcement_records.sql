-- Membership approvals create a Space record rather than a civic-action post.
-- The record is the public, durable announcement of the membership event.

CREATE OR REPLACE FUNCTION public.handle_space_member_application_approved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_applicant_name text;
  v_space_name text;
  v_public_introduction text;
BEGIN
  IF OLD.status = 'pending' AND NEW.status = 'approved' THEN
    SELECT COALESCE(NULLIF(btrim(name), ''), NULLIF(btrim(username), ''), 'A new member')
      INTO v_applicant_name
    FROM public.profile
    WHERE user_id = NEW.applicant_user_id;

    SELECT name INTO v_space_name
    FROM public.space
    WHERE id = NEW.space_id;

    v_public_introduction := COALESCE(
      NULLIF(btrim(NEW.admin_notes), ''),
      'We are happy to welcome ' || v_applicant_name || ' to ' || COALESCE(v_space_name, 'the Space') || '. We look forward to their contribution.'
    );

    INSERT INTO public.space_records (
      space_id,
      record_type,
      title,
      content,
      created_by
    )
    VALUES (
      NEW.space_id,
      'membership_announcement',
      'Welcome ' || v_applicant_name,
      jsonb_build_object(
        'type', 'membership_announcement',
        'application_id', NEW.id,
        'member_user_id', NEW.applicant_user_id,
        'member_name', v_applicant_name,
        'applicant_message', COALESCE(NEW.message, ''),
        'public_introduction', v_public_introduction,
        'joined_at', COALESCE(NEW.reviewed_at, now())
      ),
      NEW.reviewed_by
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_space_member_application_approved
  ON public.space_member_application;

CREATE TRIGGER trg_space_member_application_approved
AFTER UPDATE OF status ON public.space_member_application
FOR EACH ROW
EXECUTE FUNCTION public.handle_space_member_application_approved();

CREATE INDEX IF NOT EXISTS idx_space_records_space_created_at
  ON public.space_records (space_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_space_records_record_type
  ON public.space_records (record_type);

CREATE OR REPLACE FUNCTION public.get_space_membership_announcements(p_space_id uuid)
RETURNS TABLE (
  id uuid,
  space_id uuid,
  record_type text,
  title text,
  content jsonb,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    sr.id,
    sr.space_id,
    sr.record_type,
    sr.title,
    sr.content,
    sr.created_by,
    sr.created_at,
    sr.updated_at
  FROM public.space_records sr
  JOIN public.space s ON s.id = sr.space_id
  WHERE sr.space_id = p_space_id
    AND sr.record_type = 'membership_announcement'
    AND s.is_active = true
  ORDER BY sr.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_space_membership_announcements(uuid)
  TO anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_space_membership_announcements(uuid)
  FROM public;

REVOKE EXECUTE ON FUNCTION public.handle_space_member_application_approved()
  FROM anon, authenticated, public;
