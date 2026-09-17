-- Expose the member information needed by the Space member card.
-- Contact fields remain conditional on the profile's public visibility flags.
-- The membership message comes from the approved membership announcement.

CREATE OR REPLACE VIEW public.space_member_view AS
SELECT
  sm.space_id,
  sm.user_id,
  sm.role,
  sm.created_at,
  p.username,
  p.name,
  p.avatar_url,
  p.designation,
  p.locality,
  CASE WHEN p.is_email_public THEN p.email ELSE NULL END AS email,
  CASE WHEN p.is_mobile_public THEN p.mobile ELSE NULL END AS mobile,
  announcement.content->>'applicant_message' AS membership_message
FROM public.space_member sm
JOIN public.profile p ON p.user_id = sm.user_id
LEFT JOIN LATERAL (
  SELECT sr.content
  FROM public.space_records sr
  WHERE sr.space_id = sm.space_id
    AND sr.record_type = 'membership_announcement'
    AND (sr.content->>'member_user_id')::uuid = sm.user_id
  ORDER BY sr.created_at DESC
  LIMIT 1
) announcement ON true
WHERE sm.is_active = true
  AND sm.is_suspended = false;
