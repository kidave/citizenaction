-- Space activity is publicly visible, so the public feed RPC must be callable
-- without an authenticated session.

GRANT EXECUTE ON FUNCTION public.get_space_posts(uuid)
  TO anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_space_posts(uuid)
  FROM public;

NOTIFY pgrst, 'reload schema';
