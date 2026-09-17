CREATE OR REPLACE FUNCTION public.search_space_membership_announcements(p_search text, p_limit integer DEFAULT 8)
RETURNS TABLE (
  id uuid,
  space_id uuid,
  space_name text,
  space_slug text,
  member_user_id uuid,
  member_name text,
  title text,
  public_introduction text,
  applicant_message text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH q AS (SELECT lower(trim(p_search)) AS search)
  SELECT
    sr.id,
    sr.space_id,
    s.name,
    s.slug,
    (sr.content->>'member_user_id')::uuid,
    sr.content->>'member_name',
    sr.title,
    sr.content->>'public_introduction',
    sr.content->>'applicant_message',
    sr.created_at
  FROM public.space_records sr
  JOIN public.space s ON s.id = sr.space_id
  CROSS JOIN q
  WHERE sr.record_type = 'membership_announcement'
    AND s.is_active = true
    AND q.search <> ''
    AND (
      lower(coalesce(sr.title, '')) LIKE '%' || q.search || '%'
      OR lower(coalesce(sr.content->>'member_name', '')) LIKE '%' || q.search || '%'
      OR lower(coalesce(sr.content->>'public_introduction', '')) LIKE '%' || q.search || '%'
      OR lower(coalesce(sr.content->>'applicant_message', '')) LIKE '%' || q.search || '%'
      OR lower(coalesce(s.name, '')) LIKE '%' || q.search || '%'
    )
  ORDER BY sr.created_at DESC
  LIMIT greatest(1, least(coalesce(p_limit, 8), 20));
$$;

GRANT EXECUTE ON FUNCTION public.search_space_membership_announcements(text, integer) TO anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.search_space_membership_announcements(text, integer) FROM public;
