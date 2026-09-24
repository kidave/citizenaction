-- get_contribution() is a public read function. It evaluates can_manage_contribution()
-- only to attach edit metadata, so anonymous readers must be allowed to execute
-- that boolean helper as well.

GRANT EXECUTE ON FUNCTION public.can_manage_contribution(uuid, uuid)
  TO anon;
