-- Expose the public member information used by both the Members tab and Space timeline.
-- The membership message comes directly from the approved application.
-- Contact fields remain conditional on the profile's public visibility flags.

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
  approved_application.message AS membership_message
FROM public.space_member sm
JOIN public.profile p ON p.user_id = sm.user_id
LEFT JOIN LATERAL (
  SELECT sma.message
  FROM public.space_member_application sma
  WHERE sma.space_id = sm.space_id
    AND sma.applicant_user_id = sm.user_id
    AND sma.status = 'approved'
  ORDER BY sma.reviewed_at DESC NULLS LAST, sma.created_at DESC
  LIMIT 1
) approved_application ON true
WHERE sm.is_active = true
  AND sm.is_suspended = false;
